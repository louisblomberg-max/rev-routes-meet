/**
 * Navigation page — standalone full-screen turn-by-turn navigation.
 * Receives destination via React Router state.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRef, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, X, Volume2, VolumeX, Layers, LocateFixed, Navigation as NavIcon, CheckCircle2, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

if (!import.meta.env.VITE_MAPBOX_TOKEN) {
  console.error('VITE_MAPBOX_TOKEN environment variable is not set');
}

type Mode = 'preview' | 'active' | 'arrived';

const MANEUVER_ARROWS: Record<string, string> = {
  'turn left': '↰', 'turn right': '↱', 'straight': '↑',
  'slight left': '↖', 'slight right': '↗', 'uturn': '↩',
  'roundabout': '↻', 'rotary': '↻', 'arrive': '◎',
  'depart': '↑', 'fork left': '↖', 'fork right': '↗',
  'merge left': '↰', 'merge right': '↱',
};

function getArrow(type: string, modifier?: string): string {
  if (modifier) {
    const key = `${type} ${modifier}`.toLowerCase();
    if (MANEUVER_ARROWS[key]) return MANEUVER_ARROWS[key];
    const modKey = modifier.toLowerCase();
    if (MANEUVER_ARROWS[modKey]) return MANEUVER_ARROWS[modKey];
  }
  return MANEUVER_ARROWS[type] || '↑';
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)}m`;
  return `${(metres / 1609.34).toFixed(1)} mi`;
}

const NavigationPage = () => {
  const { state: routerState } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const locationChannelRef = useRef<any>(null);
  const shareIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [mode, setMode] = useState<Mode>('preview');
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  const destLat = routerState?.destLat as number | undefined;
  const destLng = routerState?.destLng as number | undefined;
  const destTitle = (routerState?.destTitle as string) || 'Destination';
  const routeGeometry = routerState?.geometry;

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

    const m = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      zoom: 13,
      center: [destLng || -0.1278, destLat || 51.5074],
      attributionControl: false,
    });

    mapRef.current = m;

    m.on('load', () => {
      // Add route source/layer
      m.addSource('nav-route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });
      m.addLayer({
        id: 'nav-route-casing', type: 'line', source: 'nav-route',
        paint: { 'line-color': '#1a56db', 'line-width': 8, 'line-opacity': 0.3 },
      });
      m.addLayer({
        id: 'nav-route-line', type: 'line', source: 'nav-route',
        paint: { 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.9 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });

      // Destination marker
      if (destLat != null && destLng != null) {
        new mapboxgl.Marker({ color: '#CC2222' })
          .setLngLat([destLng, destLat])
          .addTo(m);
      }

      // Draw provided geometry or fetch route
      if (routeGeometry?.coordinates) {
        drawRoute(m, routeGeometry.coordinates);
        fitToCoords(m, routeGeometry.coordinates);
      } else if (destLat != null && destLng != null) {
        // Get user location then fetch route
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const origin: [number, number] = [pos.coords.longitude, pos.coords.latitude];
            setUserLocation(origin);
            fetchAndDrawRoute(m, origin, [destLng, destLat]);
          },
          () => {
            // Can't get location — just center on dest
            m.flyTo({ center: [destLng, destLat], zoom: 14 });
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    });

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (shareIntervalRef.current) clearInterval(shareIntervalRef.current);
      if (locationChannelRef.current) supabase.removeChannel(locationChannelRef.current);
      m.remove();
      mapRef.current = null;
    };
  }, []);

  const drawRoute = (m: mapboxgl.Map, coordinates: [number, number][]) => {
    const src = m.getSource('nav-route') as mapboxgl.GeoJSONSource;
    if (src) {
      src.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } });
    }
  };

  const fitToCoords = (m: mapboxgl.Map, coords: [number, number][]) => {
    if (coords.length < 2) return;
    const bounds = coords.reduce(
      (b, c) => b.extend(c as [number, number]),
      new mapboxgl.LngLatBounds(coords[0], coords[0])
    );
    m.fitBounds(bounds, { padding: 60, duration: 800 });
  };

  const fetchAndDrawRoute = async (m: mapboxgl.Map, origin: [number, number], dest: [number, number]) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?steps=true&geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      );
      const data = await res.json();
      if (data.routes?.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates;
        drawRoute(m, coords);
        fitToCoords(m, coords);
        setSteps(route.legs[0]?.steps || []);
        setDistanceRemaining(route.distance);
        setEtaMinutes(Math.ceil(route.duration / 60));
      }
    } catch (err) {
      console.error('[Navigation] Route fetch error:', err);
    }
  };

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [isMuted]);

  const startNavigation = async () => {
    setMode('active');

    // Save session
    if (user?.id && destLat != null && destLng != null) {
      const { data: session } = await supabase
        .from('navigation_sessions')
        .insert({
          user_id: user.id,
          destination_title: destTitle,
          dest_lat: destLat,
          dest_lng: destLng,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (session) sessionIdRef.current = session.id;
    }

    // Start GPS
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading } = position.coords;
        const newLoc: [number, number] = [longitude, latitude];
        setUserLocation(newLoc);
        if (heading != null) setCurrentHeading(heading);

        const m = mapRef.current;
        if (!m) return;

        // Follow user
        m.easeTo({
          center: newLoc,
          bearing: heading || 0,
          pitch: 45,
          zoom: 16,
          duration: 500,
        });

        // User location dot
        if (m.getSource('user-dot')) {
          (m.getSource('user-dot') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature', geometry: { type: 'Point', coordinates: newLoc }, properties: {},
          });
        } else {
          m.addSource('user-dot', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'Point', coordinates: newLoc }, properties: {} },
          });
          m.addLayer({
            id: 'user-dot', type: 'circle', source: 'user-dot',
            paint: {
              'circle-radius': 10, 'circle-color': '#3b82f6',
              'circle-stroke-width': 3, 'circle-stroke-color': '#ffffff',
            },
          });
        }

        // Arrival check
        if (destLat != null && destLng != null) {
          const dist = haversineDistance(latitude, longitude, destLat, destLng);
          setDistanceRemaining(dist);
          if (dist < 50) {
            handleArrival();
            return;
          }
        }

        // Advance step
        if (steps.length > 0 && currentStep < steps.length - 1) {
          const nextStep = steps[currentStep + 1];
          if (nextStep?.maneuver?.location) {
            const [stepLng, stepLat] = nextStep.maneuver.location;
            const distToNext = haversineDistance(latitude, longitude, stepLat, stepLng);
            if (distToNext < 30) {
              const nextIdx = currentStep + 1;
              setCurrentStep(nextIdx);
              if (steps[nextIdx]?.maneuver?.instruction) {
                speak(steps[nextIdx].maneuver.instruction);
              }
            }
          }
        }
      },
      (err) => console.error('[Navigation] GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    // Speak first instruction
    if (steps[0]?.maneuver?.instruction) {
      speak(steps[0].maneuver.instruction);
    }
  };

  const handleArrival = async () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    window.speechSynthesis?.cancel();
    speak(`You have arrived at ${destTitle}`);
    setMode('arrived');

    await stopSharing();

    if (sessionIdRef.current) {
      await supabase.from('navigation_sessions').update({
        ended_at: new Date().toISOString(), completed: true,
      }).eq('id', sessionIdRef.current);
    }

    toast.success(`You have arrived at ${destTitle}!`);
  };

  const handleStop = async () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    window.speechSynthesis?.cancel();

    await stopSharing();

    if (sessionIdRef.current) {
      await supabase.from('navigation_sessions').update({
        ended_at: new Date().toISOString(), completed: false,
      }).eq('id', sessionIdRef.current);
    }

    navigate(-1);
  };

  // Live location sharing
  const startSharing = async () => {
    if (!user?.id) return;

    const channel = supabase.channel(`live-location:${user.id}`, {
      config: { broadcast: { self: false } },
    });
    await channel.subscribe();
    locationChannelRef.current = channel;

    await supabase.from('live_location_sessions')
      .upsert({ user_id: user.id, is_active: true, started_at: new Date().toISOString(), ended_at: null });

    shareIntervalRef.current = setInterval(() => {
      if (locationChannelRef.current && userLocation) {
        locationChannelRef.current.send({
          type: 'broadcast',
          event: 'location_update',
          payload: {
            user_id: user.id,
            username: (user as any).username || '',
            display_name: (user as any).display_name || (user as any).displayName || '',
            avatar_url: (user as any).avatar_url || (user as any).avatar || null,
            lat: userLocation[1],
            lng: userLocation[0],
            heading: currentHeading,
            timestamp: Date.now(),
          },
        });
      }
    }, 3000);

    setIsSharingLocation(true);
    toast.success('Sharing your location with friends');
  };

  const stopSharing = async () => {
    if (shareIntervalRef.current) clearInterval(shareIntervalRef.current);
    shareIntervalRef.current = null;
    if (locationChannelRef.current) {
      supabase.removeChannel(locationChannelRef.current);
      locationChannelRef.current = null;
    }

    if (user?.id && isSharingLocation) {
      await supabase.from('live_location_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    setIsSharingLocation(false);
  };

  const toggleSharing = () => {
    if (isSharingLocation) stopSharing();
    else startSharing();
  };

  const handleRecenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.easeTo({ center: userLocation, zoom: 16, pitch: 45, bearing: currentHeading, duration: 500 });
    }
  };

  const handleOverview = () => {
    const m = mapRef.current;
    if (!m || !destLat || !destLng) return;
    if (userLocation) {
      const bounds = new mapboxgl.LngLatBounds()
        .extend(userLocation)
        .extend([destLng, destLat]);
      m.fitBounds(bounds, { padding: 60, pitch: 0, bearing: 0 });
    } else {
      m.flyTo({ center: [destLng, destLat], zoom: 13, pitch: 0, bearing: 0 });
    }
  };

  const currentStepData = steps[currentStep];
  const nextStepData = steps[currentStep + 1];

  return (
    <div className="mobile-container relative bg-background">
      {/* Map */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Preview mode */}
      {mode === 'preview' && (
        <div className="absolute bottom-0 left-0 right-0 z-40 safe-bottom">
          <div className="mx-3 mb-3 bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <NavIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{destTitle}</p>
                {distanceRemaining > 0 && (
                  <p className="text-xs text-muted-foreground">{formatDist(distanceRemaining)} · {etaMinutes} min</p>
                )}
              </div>
            </div>
            <Button
              onClick={startNavigation}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-5 text-base font-semibold"
            >
              <NavIcon className="w-5 h-5" /> Start Navigation
            </Button>
            <button
              onClick={() => navigate(-1)}
              className="w-full text-muted-foreground py-2 text-sm font-medium"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Active navigation */}
      {mode === 'active' && (
        <>
          {/* Turn instruction bar */}
          {currentStepData && (
            <div className="absolute top-0 left-0 right-0 z-50 safe-top">
              <div className="mx-3 mt-2 bg-foreground rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-background/20 flex items-center justify-center shrink-0 text-3xl text-background">
                    {getArrow(currentStepData.maneuver?.type, currentStepData.maneuver?.modifier)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-background/70">
                      in {formatDist(currentStepData.distance || 0)}
                    </p>
                    <p className="text-base font-bold text-background leading-tight truncate">
                      {currentStepData.maneuver?.instruction || 'Continue straight'}
                    </p>
                  </div>
                </div>
                {nextStepData && (
                  <p className="text-xs text-background/50 mt-2 truncate">
                    Then: {nextStepData.maneuver?.instruction}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 z-50 safe-bottom">
            <div className="mx-3 mb-3 space-y-2">
              <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-foreground">{formatDist(distanceRemaining)}</p>
                    <p className="text-xs text-muted-foreground">{etaMinutes} min remaining</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-foreground" />}
                    </button>
                    <button
                      onClick={handleOverview}
                      className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
                    >
                      <Layers className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      onClick={toggleSharing}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSharingLocation ? 'bg-primary/10 border border-primary/30' : 'bg-muted'
                      }`}
                    >
                      <Radio className={`w-4 h-4 ${isSharingLocation ? 'text-primary animate-pulse' : 'text-foreground'}`} />
                    </button>
                    <button
                      onClick={handleRecenter}
                      className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
                    >
                      <LocateFixed className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className="w-full gap-2 py-4 text-sm font-semibold"
                >
                  <X className="w-4 h-4" /> Stop Navigation
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Arrived overlay */}
      {mode === 'arrived' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-6 bg-card rounded-2xl shadow-lg border border-border/50 p-8 text-center space-y-4 max-w-sm w-full">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">You have arrived!</h2>
            <p className="text-sm text-muted-foreground">{destTitle}</p>
            <Button
              onClick={() => navigate('/', { replace: true })}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Back to Map
            </Button>
          </div>
        </div>
      )}

      {/* Back button (preview only) */}
      {mode === 'preview' && (
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-40 safe-top w-10 h-10 rounded-xl bg-card/90 backdrop-blur-md shadow-md border border-border/50 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      )}
    </div>
  );
};

export default NavigationPage;
