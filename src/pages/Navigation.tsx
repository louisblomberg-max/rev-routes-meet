import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

if (!import.meta.env.VITE_MAPBOX_TOKEN) {
  console.error('VITE_MAPBOX_TOKEN environment variable is not set');
}

type Mode = 'preview' | 'active' | 'arrived';

export default function Navigation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const friendMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const watchIdRef = useRef<number | null>(null);
  const shareIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isFollowingRef = useRef(true);
  const lastLocationRef = useRef<[number, number] | null>(null);

  const [mode, setMode] = useState<Mode>('preview');
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const [arrivalTime, setArrivalTime] = useState('');
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [totalDistanceDriven, setTotalDistanceDriven] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);

  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [friendLocations, setFriendLocations] = useState<Record<string, any>>({});
  const [canShare, setCanShare] = useState(false);

  const destLat = state?.destLat as number | undefined;
  const destLng = state?.destLng as number | undefined;
  const destTitle = (state?.destTitle as string) || 'Destination';
  const routeGeometry = state?.geometry;

  useEffect(() => {
    if (!user?.id) return;
    const checkPlan = async () => {
      const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
      const plan = data?.plan || 'free';
      setCanShare(plan === 'pro' || plan === 'organiser' || plan === 'club');
    };
    checkPlan();
  }, [user?.id]);

  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const formatDistance = (metres: number): string => {
    if (metres < 1000) return `${Math.round(metres)}m`;
    return `${(metres / 1609.34).toFixed(1)}mi`;
  };

  const formatSpeed = (mps: number): number => Math.round(mps * 2.237);

  const speak = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = 'en-GB';
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const getManeuverArrow = (type: string, modifier?: string): string => {
    if (type === 'turn') {
      if (modifier?.includes('sharp left')) return '↩';
      if (modifier?.includes('sharp right')) return '↪';
      if (modifier?.includes('slight left')) return '↖';
      if (modifier?.includes('slight right')) return '↗';
      if (modifier?.includes('left')) return '↰';
      if (modifier?.includes('right')) return '↱';
    }
    if (type === 'roundabout' || type === 'rotary') return '↻';
    if (type === 'uturn') return '↩';
    if (type === 'arrive') return '◎';
    if (type === 'merge') return '⬆';
    if (type === 'fork') {
      if (modifier?.includes('left')) return '↖';
      if (modifier?.includes('right')) return '↗';
    }
    return '↑';
  };

  const drawRoute = useCallback((map: mapboxgl.Map, geometry: any) => {
    const geoData = geometry.type === 'Feature' ? geometry : { type: 'Feature', properties: {}, geometry };
    const source = map.getSource('route') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geoData);
    } else {
      map.addSource('route', { type: 'geojson', data: geoData });
      map.addLayer({
        id: 'route-casing', type: 'line', source: 'route',
        paint: { 'line-color': '#0A4A8A', 'line-width': 9, 'line-opacity': 0.8 },
        layout: { 'line-join': 'round', 'line-cap': 'round' },
      });
      map.addLayer({
        id: 'route-fill', type: 'line', source: 'route',
        paint: { 'line-color': '#185FA5', 'line-width': 6, 'line-opacity': 1 },
        layout: { 'line-join': 'round', 'line-cap': 'round' },
      });
    }
  }, []);

  const fetchRoute = useCallback(async (map: mapboxgl.Map, originLng: number, originLat: number) => {
    if (destLat == null || destLng == null) return;
    setRouteLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}?steps=true&geometries=geojson&overview=full&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      );
      const data = await res.json();
      if (!data.routes?.length) { toast.error('Could not find a route'); return; }
      const route = data.routes[0];
      drawRoute(map, { type: 'Feature', properties: {}, geometry: route.geometry });
      setSteps(route.legs[0]?.steps || []);
      setDistanceRemaining(route.distance);
      const eta = Math.ceil(route.duration / 60);
      setEtaMinutes(eta);
      const arrival = new Date(Date.now() + route.duration * 1000);
      setArrivalTime(arrival.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      const coords = route.geometry.coordinates;
      if (coords.length > 1) {
        const bounds = coords.reduce(
          (b: mapboxgl.LngLatBounds, c: [number, number]) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        map.fitBounds(bounds, { padding: { top: 80, bottom: 280, left: 40, right: 40 }, duration: 1000 });
      }
    } catch (err) {
      console.error('[Navigation] Route error:', err);
      toast.error('Could not load route');
    } finally {
      setRouteLoading(false);
    }
  }, [destLat, destLng, drawRoute]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [destLng || -0.1278, destLat || 51.5074],
      zoom: 13,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on('load', () => {
      if (destLat != null && destLng != null) {
        const destEl = document.createElement('div');
        destEl.innerHTML = '<div style="width:20px;height:20px;background:#CC2222;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>';
        destMarkerRef.current = new mapboxgl.Marker({ element: destEl, anchor: 'center' })
          .setLngLat([destLng, destLat])
          .addTo(map);
      }

      if (routeGeometry?.coordinates) {
        drawRoute(map, { type: 'Feature', properties: {}, geometry: routeGeometry });
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          setUserLocation([longitude, latitude]);
          fetchRoute(map, longitude, latitude);
        },
        () => {
          if (destLat != null && destLng != null) map.flyTo({ center: [destLng, destLat], zoom: 14 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });

    map.on('dragstart', () => {
      isFollowingRef.current = false;
      setIsFollowing(false);
    });

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (shareIntervalRef.current) clearInterval(shareIntervalRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Friend locations via RPC + realtime
  useEffect(() => {
    if (!user?.id) return;

    const loadFriends = async () => {
      const { data } = await supabase.rpc('get_friend_locations', { p_user_id: user.id });
      if (data) {
        const locs: Record<string, any> = {};
        data.forEach((f: any) => { locs[f.user_id] = f; });
        setFriendLocations(locs);
      }
    };
    loadFriends();

    const channel = supabase
      .channel('friend-locations-nav')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_location_sessions' }, () => {
        loadFriends();
      })
      .subscribe();

    const interval = setInterval(loadFriends, 10000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [user?.id]);

  // Render friend markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    Object.keys(friendMarkersRef.current).forEach(uid => {
      if (!friendLocations[uid]) {
        friendMarkersRef.current[uid].remove();
        delete friendMarkersRef.current[uid];
      }
    });

    Object.values(friendLocations).forEach((friend: any) => {
      if (!friend.lat || !friend.lng) return;
      if (friendMarkersRef.current[friend.user_id]) {
        friendMarkersRef.current[friend.user_id].setLngLat([friend.lng, friend.lat]);
        return;
      }

      const el = document.createElement('div');
      el.style.cssText = 'width:44px;height:44px;border-radius:50%;border:3px solid #3B6D11;overflow:visible;background:#EAF3DE;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#3B6D11;position:relative;';

      const inner = document.createElement('div');
      inner.style.cssText = 'width:100%;height:100%;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;';
      if (friend.avatar_url) {
        const img = document.createElement('img');
        img.src = friend.avatar_url;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        inner.appendChild(img);
      } else {
        inner.innerText = (friend.display_name || friend.username || '?')[0].toUpperCase();
      }
      el.appendChild(inner);

      const label = document.createElement('div');
      label.style.cssText = 'position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:white;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;white-space:nowrap;pointer-events:none;';
      label.innerText = friend.display_name || friend.username || 'Friend';
      el.appendChild(label);

      el.addEventListener('click', () => { map.flyTo({ center: [friend.lng, friend.lat], zoom: 15, duration: 800 }); });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([friend.lng, friend.lat])
        .addTo(map);
      friendMarkersRef.current[friend.user_id] = marker;
    });
  }, [friendLocations]);

  // Location sharing
  const startSharing = async () => {
    if (!user?.id) return;
    if (!canShare) { toast.error('Live location sharing requires a paid plan'); return; }
    try {
      await supabase.from('live_location_sessions').upsert({
        user_id: user.id, is_active: true,
        started_at: new Date().toISOString(), ended_at: null,
        destination_title: destTitle, dest_lat: destLat, dest_lng: destLng,
        session_type: 'navigation',
      });
      shareIntervalRef.current = setInterval(async () => {
        const loc = lastLocationRef.current;
        if (!loc) return;
        await supabase.from('live_location_sessions').update({
          last_lat: loc[1], last_lng: loc[0],
          last_heading: currentHeading,
          last_updated: new Date().toISOString(),
        }).eq('user_id', user.id);
      }, 3000);
      setIsSharingLocation(true);
      toast.success('Sharing location with friends');
    } catch {
      toast.error('Could not start location sharing');
    }
  };

  const stopSharing = async () => {
    if (shareIntervalRef.current) clearInterval(shareIntervalRef.current);
    shareIntervalRef.current = null;
    if (user?.id) {
      try {
        await supabase.from('live_location_sessions')
          .update({ is_active: false, ended_at: new Date().toISOString() })
          .eq('user_id', user.id);
      } catch {}
    }
    setIsSharingLocation(false);
  };

  const toggleSharing = () => {
    if (isSharingLocation) stopSharing();
    else startSharing();
  };

  // Start active navigation
  const startNavigation = async () => {
    setMode('active');
    isFollowingRef.current = true;
    setIsFollowing(true);

    if (user?.id && destLat != null && destLng != null) {
      try {
        const { data: session } = await supabase.from('navigation_sessions').insert({
          user_id: user.id, destination_title: destTitle,
          dest_lat: destLat, dest_lng: destLng, started_at: new Date().toISOString(),
        }).select('id').single();
        if (session) sessionIdRef.current = session.id;
      } catch {}
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading, speed } = pos.coords;
        const newLoc: [number, number] = [longitude, latitude];
        setUserLocation(newLoc);
        lastLocationRef.current = newLoc;
        setCurrentHeading(heading || 0);
        setCurrentSpeed(speed ? formatSpeed(speed) : 0);

        const map = mapRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat(newLoc);
        } else {
          const el = document.createElement('div');
          el.style.cssText = 'width:22px;height:22px;background:#185FA5;border:3px solid white;border-radius:50%;box-shadow:0 3px 12px rgba(24,95,165,0.5);';
          userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
            .setLngLat(newLoc).addTo(map);
        }

        if (isFollowingRef.current) {
          map.easeTo({ center: newLoc, bearing: heading || 0, pitch: 50, zoom: 16, duration: 600 });
        }

        // Track distance driven
        const prev = lastLocationRef.current;
        if (prev && (prev[0] !== longitude || prev[1] !== latitude)) {
          const seg = haversineDistance(prev[1], prev[0], latitude, longitude);
          if (seg < 500) setTotalDistanceDriven(d => d + seg);
        }

        if (destLat != null && destLng != null) {
          const dist = haversineDistance(latitude, longitude, destLat, destLng);
          setDistanceRemaining(dist);
          if (speed && speed > 0) {
            const secs = dist / speed;
            setEtaMinutes(Math.ceil(secs / 60));
            setArrivalTime(new Date(Date.now() + secs * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
          }
          if (dist < 40) { handleArrival(); return; }
        }

        if (steps.length > 0 && currentStep < steps.length - 1) {
          const nextStep = steps[currentStep + 1];
          if (nextStep?.maneuver?.location) {
            const [sLng, sLat] = nextStep.maneuver.location;
            if (haversineDistance(latitude, longitude, sLat, sLng) < 25) {
              const nextIdx = currentStep + 1;
              setCurrentStep(nextIdx);
              if (!isMuted && steps[nextIdx]?.maneuver?.instruction) {
                speak(steps[nextIdx].maneuver.instruction);
              }
            }
          }
        }
      },
      (err) => console.error('[Navigation] GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    if (steps[0]?.maneuver?.instruction) {
      setTimeout(() => speak(steps[0].maneuver.instruction), 1000);
    }
  };

  const handleArrival = async () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    window.speechSynthesis?.cancel();
    speak(`You have arrived at ${destTitle}`);
    setMode('arrived');
    if (sessionIdRef.current) {
      await supabase.from('navigation_sessions').update({
        ended_at: new Date().toISOString(), completed: true, distance_meters: Math.round(totalDistanceDriven),
      }).eq('id', sessionIdRef.current);
    }
    await stopSharing();
  };

  const handleStopNavigation = async () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    window.speechSynthesis?.cancel();
    await stopSharing();
    if (sessionIdRef.current) {
      await supabase.from('navigation_sessions').update({
        ended_at: new Date().toISOString(), completed: false, distance_meters: Math.round(totalDistanceDriven),
      }).eq('id', sessionIdRef.current);
    }
    navigate(-1);
  };

  const handleRecenter = () => {
    if (!userLocation || !mapRef.current) return;
    isFollowingRef.current = true;
    setIsFollowing(true);
    mapRef.current.easeTo({ center: userLocation, bearing: currentHeading, pitch: mode === 'active' ? 50 : 0, zoom: 16, duration: 600 });
  };

  const handleOverview = () => {
    isFollowingRef.current = false;
    setIsFollowing(false);
    const m = mapRef.current;
    if (!m || destLat == null || destLng == null) return;
    const bounds = new mapboxgl.LngLatBounds();
    if (userLocation) bounds.extend(userLocation);
    bounds.extend([destLng, destLat]);
    m.fitBounds(bounds, { padding: 80, duration: 800, pitch: 0 });
  };

  const activeFriendCount = Object.values(friendLocations).filter((f: any) => f.lat && f.lng).length;

  return (
    <div className="mobile-container relative bg-background">
      <style>{`@keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.7); opacity: 0; } }`}</style>

      <div ref={mapContainerRef} className="absolute inset-0" />

      {routeLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card/95 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg border border-border/50 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-foreground">Finding route...</span>
        </div>
      )}

      {/* PREVIEW MODE */}
      {mode === 'preview' && (
        <div className="absolute bottom-0 left-0 right-0 z-40 safe-bottom">
          <div className="mx-3 mb-3 bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">📍</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{destTitle}</p>
                <p className="text-xs text-muted-foreground">Navigate to destination</p>
              </div>
            </div>

            {(distanceRemaining > 0 || etaMinutes > 0) && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-bold text-foreground">{formatDistance(distanceRemaining)}</p>
                  <p className="text-[10px] text-muted-foreground">Distance</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-bold text-foreground">{etaMinutes} min</p>
                  <p className="text-[10px] text-muted-foreground">Est. time</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-bold text-foreground">{arrivalTime || '--:--'}</p>
                  <p className="text-[10px] text-muted-foreground">Arrival</p>
                </div>
              </div>
            )}

            {activeFriendCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#3B6D11]/10 border border-[#3B6D11]/20">
                <span className="text-sm">👥</span>
                <span className="text-xs font-medium text-[#3B6D11]">
                  {activeFriendCount} friend{activeFriendCount > 1 ? 's' : ''} sharing location nearby
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2">
                <span className="text-base">📡</span>
                <div>
                  <p className="text-xs font-medium text-foreground">Share location with friends</p>
                  <p className="text-[10px] text-muted-foreground">
                    {canShare ? 'Friends will see you on their map' : 'Requires paid plan'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isSharingLocation}
                onCheckedChange={toggleSharing}
                disabled={!canShare}
              />
            </div>

            <button
              onClick={startNavigation}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2"
            >
              ▶ Start Navigation
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full h-11 border border-border/50 rounded-2xl text-muted-foreground text-sm font-medium"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE MODE */}
      {mode === 'active' && (
        <>
          {/* Turn instruction bar */}
          <div className="absolute top-0 left-0 right-0 z-50 safe-top">
            <div className="mx-3 mt-2 bg-foreground rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-background/20 flex items-center justify-center shrink-0 text-3xl text-background">
                  {steps[currentStep]?.maneuver
                    ? getManeuverArrow(steps[currentStep].maneuver.type, steps[currentStep].maneuver.modifier)
                    : '↑'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-background leading-tight truncate">
                    {steps[currentStep]?.maneuver?.instruction || 'Continue straight'}
                  </p>
                  {steps[currentStep + 1]?.maneuver?.instruction && (
                    <p className="text-xs text-background/50 mt-1 truncate">
                      Then: {steps[currentStep + 1].maneuver.instruction}
                    </p>
                  )}
                </div>
                {steps[currentStep + 1]?.maneuver?.location && userLocation && (
                  <div className="bg-background/20 rounded-lg px-2 py-1 shrink-0">
                    <p className="text-xs font-bold text-background">
                      {formatDistance(haversineDistance(
                        userLocation[1], userLocation[0],
                        steps[currentStep + 1].maneuver.location[1],
                        steps[currentStep + 1].maneuver.location[0]
                      ))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Speed badge */}
          <div className="absolute top-28 left-4 z-40 bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-foreground">{currentSpeed}</p>
            <p className="text-[10px] text-muted-foreground font-medium">mph</p>
          </div>

          {/* Recenter button */}
          {!isFollowing && (
            <button
              onClick={handleRecenter}
              className="absolute top-28 right-4 z-40 w-11 h-11 rounded-xl bg-card/95 backdrop-blur-xl shadow-lg border border-border/50 flex items-center justify-center text-lg"
            >
              ◎
            </button>
          )}

          {/* Friend count badge */}
          {activeFriendCount > 0 && (
            <div className="absolute top-44 right-4 z-40 bg-[#3B6D11]/90 backdrop-blur rounded-xl px-3 py-2 text-center">
              <p className="text-xs font-bold text-white">{activeFriendCount} friends</p>
              <p className="text-[10px] text-white/70">on map</p>
            </div>
          )}

          {/* Bottom panel */}
          <div className="absolute bottom-0 left-0 right-0 z-50 safe-bottom">
            <div className="mx-3 mb-3 bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{formatDistance(distanceRemaining)}</p>
                  <p className="text-[10px] text-muted-foreground">Remaining</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{etaMinutes}</p>
                  <p className="text-[10px] text-muted-foreground">Minutes</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{arrivalTime || '--:--'}</p>
                  <p className="text-[10px] text-muted-foreground">Arrival</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex-1 h-11 rounded-xl flex items-center justify-center text-base border transition-all ${
                    isMuted ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-muted border-border/50 text-foreground'
                  }`}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <button onClick={handleOverview} className="flex-1 h-11 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-base">
                  🗺
                </button>
                <button
                  onClick={toggleSharing}
                  className={`flex-1 h-11 rounded-xl flex items-center justify-center text-base border transition-all ${
                    isSharingLocation ? 'bg-[#3B6D11]/10 border-[#3B6D11]/30 text-[#3B6D11]' : 'bg-muted border-border/50 text-foreground'
                  }`}
                >
                  📡
                </button>
                <button onClick={handleRecenter} className="flex-1 h-11 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-base">
                  ◎
                </button>
              </div>

              {isSharingLocation && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#3B6D11]/10 border border-[#3B6D11]/20">
                  <div className="w-2 h-2 rounded-full bg-[#3B6D11] animate-pulse" />
                  <p className="text-xs font-medium text-[#3B6D11] flex-1">Sharing location with friends</p>
                  <button onClick={stopSharing} className="text-[10px] font-semibold text-[#3B6D11] underline">Stop</button>
                </div>
              )}

              {!canShare && (
                <button
                  onClick={() => navigate('/choose-plan')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#3B6D11] text-white text-xs font-semibold"
                >
                  ⭐ Upgrade to share location with friends
                </button>
              )}

              <button
                onClick={handleStopNavigation}
                className="w-full h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold"
              >
                Stop Navigation
              </button>
            </div>
          </div>
        </>
      )}

      {/* ARRIVED MODE */}
      {mode === 'arrived' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-6 bg-card rounded-2xl shadow-lg border border-border/50 p-8 text-center space-y-4 max-w-sm w-full">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-3xl">✓</div>
            <h2 className="text-xl font-bold text-foreground">You have arrived!</h2>
            <p className="text-sm text-muted-foreground">{destTitle}</p>
            <p className="text-xs text-muted-foreground">{formatDistance(totalDistanceDriven)} driven</p>
            {state?.routeId && (
              <button
                onClick={() => navigate(`/route/${state.routeId}/rate`)}
                className="w-full py-3 rounded-xl bg-[#3B6D11]/10 border border-[#3B6D11]/20 text-[#3B6D11] text-sm font-semibold"
              >
                Rate this route ⭐
              </button>
            )}
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-semibold"
            >
              Back to map
            </button>
          </div>
        </div>
      )}

      {/* Back button (preview) */}
      {mode === 'preview' && (
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-40 safe-top w-10 h-10 rounded-xl bg-card/90 backdrop-blur-md shadow-md border border-border/50 flex items-center justify-center text-foreground"
        >
          ←
        </button>
      )}
    </div>
  );
}
