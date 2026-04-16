import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { format, addSeconds } from 'date-fns'

interface NavStep {
  maneuver: {
    type: string
    modifier?: string
    instruction: string
    location: [number, number]
  }
  distance: number
  duration: number
  name: string
  driving_side?: string
  intersections?: any[]
}

interface FriendLocation {
  user_id: string
  username: string
  display_name: string
  avatar_url: string
  lat: number
  lng: number
  heading: number
  bearing: number
  last_updated: string
  destination_title: string
  dest_lat: number
  dest_lng: number
  current_speed_mph: number
  is_navigating: boolean
  is_convoy_leader: boolean
  convoy_id: string
}

const MANEUVER_ARROWS: Record<string, string> = {
  'turn-left': '↰', 'turn-right': '↱', 'turn-slight left': '↖', 'turn-slight right': '↗',
  'turn-sharp left': '↩', 'turn-sharp right': '↪', 'uturn': '↩', 'straight': '↑',
  'merge': '⬆', 'on ramp-left': '↖', 'on ramp-right': '↗', 'off ramp-left': '↙',
  'off ramp-right': '↘', 'fork-left': '↖', 'fork-right': '↗', 'roundabout': '↻',
  'rotary': '↻', 'roundabout turn-left': '↺', 'roundabout turn-right': '↻',
  'arrive': '◎', 'arrive-left': '◎', 'arrive-right': '◎', 'depart': '↑',
  'end of road-left': '↰', 'end of road-right': '↱', 'continue': '↑',
  'new name': '↑', 'notification': '↑',
}

const MANEUVER_COLORS: Record<string, string> = {
  'turn-left': '#3B82F6', 'turn-right': '#3B82F6', 'turn-sharp left': '#EF4444',
  'turn-sharp right': '#EF4444', 'uturn': '#EF4444', 'roundabout': '#8B5CF6',
  'rotary': '#8B5CF6', 'arrive': '#22C55E', 'depart': '#22C55E',
}

const DISTANCE_ANNOUNCEMENTS = [800, 400, 200, 50]

export default function Navigation() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const friendMarkersRef = useRef<Record<string, mapboxgl.Marker>>({})
  const watchIdRef = useRef<number | null>(null)
  const shareIntervalRef = useRef<any>(null)
  const rerouteTimeoutRef = useRef<any>(null)
  const announcedDistancesRef = useRef<Set<number>>(new Set())
  const lastPositionRef = useRef<GeolocationCoordinates | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const isFollowingRef = useRef(true)
  const offRouteCountRef = useRef(0)
  const userLocationRef = useRef<[number, number] | null>(null)
  const currentHeadingRef = useRef(0)
  const currentSpeedMphRef = useRef(0)
  const sharedWithFriendsRef = useRef<string[]>([])
  const handlePositionUpdateRef = useRef<((pos: GeolocationPosition) => Promise<void>) | null>(null)

  const [mode, setMode] = useState<'preview' | 'active' | 'arrived'>('preview')
  const [steps, setSteps] = useState<NavStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [distanceToNextTurn, setDistanceToNextTurn] = useState(0)
  const [totalDistanceRemaining, setTotalDistanceRemaining] = useState(0)
  const [etaMinutes, setEtaMinutes] = useState(0)
  const [arrivalTime, setArrivalTime] = useState('')
  const [currentSpeedMph, setCurrentSpeedMph] = useState(0)
  const [speedLimitMph, setSpeedLimitMph] = useState<number | null>(null)
  const [isFollowing, setIsFollowing] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isRerouting, setIsRerouting] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [currentHeading, setCurrentHeading] = useState(0)
  const [totalDistanceDriven, setTotalDistanceDriven] = useState(0)
  const [journeyStartTime, setJourneyStartTime] = useState<Date | null>(null)
  const [showConvoyPanel, setShowConvoyPanel] = useState(false)
  const [isSharingLocation, setIsSharingLocation] = useState(false)
  const [sharedWithFriends, setSharedWithFriends] = useState<string[]>([])
  const [showFriendPicker, setShowFriendPicker] = useState(false)
  const [allFriends, setAllFriends] = useState<any[]>([])
  const [friendLocations, setFriendLocations] = useState<Record<string, FriendLocation>>({})
  const [canShare, setCanShare] = useState(false)
  const [selectedFriendInfo, setSelectedFriendInfo] = useState<FriendLocation | null>(null)

  const destLat = state?.destLat as number | undefined
  const destLng = state?.destLng as number | undefined
  const destTitle = (state?.destTitle as string) || 'Destination'
  const routeId = state?.routeId as string | undefined
  const stateGeometry = state?.geometry as any

  const [isReversed, setIsReversed] = useState(false)
  const reverseInitRef = useRef(false)

  // Effective start/end derived from geometry + reversed state.
  // When a route geometry is provided, "start" is geometry[0] and "end" is the last coord.
  // When reversed, start and end swap.
  const effectiveCoords = useMemo(() => {
    const coords = stateGeometry?.coordinates
    if (!coords || coords.length < 2) return null
    const first = coords[0]
    const last = coords[coords.length - 1]
    return isReversed
      ? { startLng: last[0], startLat: last[1], destLng: first[0], destLat: first[1] }
      : { startLng: first[0], startLat: first[1], destLng: last[0], destLat: last[1] }
  }, [stateGeometry, isReversed])

  // Effective destination — falls back to state.destLat/Lng when no geometry
  const effectiveDestLat = effectiveCoords?.destLat ?? destLat
  const effectiveDestLng = effectiveCoords?.destLng ?? destLng

  // Ref so handlePositionUpdate's reroute call always sees the latest effective dest
  const effectiveDestRef = useRef<{ lng: number; lat: number } | null>(null)
  useEffect(() => {
    if (effectiveDestLat != null && effectiveDestLng != null) {
      effectiveDestRef.current = { lng: effectiveDestLng, lat: effectiveDestLat }
    }
  }, [effectiveDestLat, effectiveDestLng])

  // Guard: if no destination provided, show error screen
  if (!destLat || !destLng) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📍</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No destination set</h2>
          <p className="text-sm text-white/60 mb-6">Select a location from the map or an event, route, or service to navigate to.</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-2xl bg-white text-black font-bold text-sm">
            Go back
          </button>
        </div>
      </div>
    )
  }

  const haversineDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }, [])

  const formatDistanceVal = useCallback((metres: number): string => {
    if (metres < 50) return 'Now'
    if (metres < 1000) return `${Math.round(metres / 10) * 10}m`
    const miles = metres / 1609.34
    if (miles < 0.1) return `${Math.round(metres)}m`
    if (miles < 10) return `${miles.toFixed(1)} mi`
    return `${Math.round(miles)} mi`
  }, [])

  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const mins = Math.round(seconds / 60)
    if (mins < 60) return `${mins} min`
    const hrs = Math.floor(mins / 60)
    const rem = mins % 60
    return `${hrs}h ${rem}m`
  }, [])

  const getManeuverKey = useCallback((step: NavStep): string => {
    const type = step.maneuver.type || ''
    const modifier = step.maneuver.modifier || ''
    return modifier ? `${type}-${modifier}` : type
  }, [])

  const getManeuverArrow = useCallback((step: NavStep): string => {
    const key = getManeuverKey(step)
    return MANEUVER_ARROWS[key] || MANEUVER_ARROWS[step.maneuver.type] || '↑'
  }, [getManeuverKey])

  const getManeuverColor = useCallback((step: NavStep): string => {
    const key = getManeuverKey(step)
    return MANEUVER_COLORS[key] || MANEUVER_COLORS[step.maneuver.type] || '#185FA5'
  }, [getManeuverKey])

  const speak = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.lang = 'en-GB'
    const voices = window.speechSynthesis.getVoices()
    const ukVoice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'))
    if (ukVoice) utterance.voice = ukVoice
    window.speechSynthesis.speak(utterance)
  }, [isMuted])

  const buildVoiceInstruction = useCallback((step: NavStep, distMetres: number): string => {
    const instruction = step.maneuver.instruction || ''
    if (distMetres > 100) return `In ${formatDistanceVal(distMetres)}, ${instruction}`
    return instruction
  }, [formatDistanceVal])

  const speedColor = useMemo(() => {
    if (!speedLimitMph) return 'text-white'
    if (currentSpeedMph > speedLimitMph + 5) return 'text-red-500'
    if (currentSpeedMph > speedLimitMph - 5) return 'text-amber-400'
    return 'text-white'
  }, [currentSpeedMph, speedLimitMph])

  // Load friends & plan
  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      const { data: profile } = await supabase
        .from('profiles').select('plan').eq('id', user.id).single()
      setCanShare(profile?.plan === 'enthusiast')

      const { data: friendsData } = await supabase
        .from('friends')
        .select(`user_id, friend_id, status,
          friend_profile:profiles!friend_id(id, username, display_name, avatar_url),
          user_profile:profiles!user_id(id, username, display_name, avatar_url)`)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const friends = friendsData?.map((f: any) => {
        const isRequester = f.user_id === user.id
        const p = isRequester ? f.friend_profile : f.user_profile
        return { id: isRequester ? f.friend_id : f.user_id, username: p?.username, display_name: p?.display_name, avatar_url: p?.avatar_url }
      }) || []
      setAllFriends(friends)
    }
    load()
  }, [user?.id])

  // Poll friend locations
  useEffect(() => {
    if (!user?.id) return
    const loadFriendLocations = async () => {
      try {
        const { data } = await supabase.rpc('get_friend_locations', { p_user_id: user.id })
        if (data) {
          const locations: Record<string, FriendLocation> = {}
          data.forEach((f: any) => { locations[f.user_id] = f as FriendLocation })
          setFriendLocations(locations)
        }
      } catch { /* friend locations will retry on next poll */ }
    }
    loadFriendLocations()
    const pollInterval = setInterval(loadFriendLocations, 5000)
    const channel = supabase.channel(`nav-friend-locations-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_location_sessions' }, () => loadFriendLocations())
      .subscribe()
    return () => { supabase.removeChannel(channel); clearInterval(pollInterval) }
  }, [user?.id])

  // Render friend markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const render = () => {
      Object.keys(friendMarkersRef.current).forEach(uid => {
        if (!friendLocations[uid]) { friendMarkersRef.current[uid].remove(); delete friendMarkersRef.current[uid] }
      })
      Object.values(friendLocations).forEach((friend: FriendLocation) => {
        if (!friend.lat || !friend.lng) return
        const existingMarker = friendMarkersRef.current[friend.user_id]
        if (existingMarker) {
          existingMarker.setLngLat([friend.lng, friend.lat])
          const el = existingMarker.getElement()
          const markerInner = el.querySelector('.friend-marker-inner') as HTMLElement
          if (markerInner) markerInner.style.transform = `rotate(${friend.bearing || friend.heading || 0}deg)`
          const speedEl = el.querySelector('.friend-speed') as HTMLElement
          if (speedEl && friend.is_navigating) speedEl.textContent = `${Math.round(friend.current_speed_mph || 0)} mph`
          return
        }
        const el = document.createElement('div')
        el.style.cssText = 'position: relative; cursor: pointer;'
        el.className = 'friend-marker-container'
        if (friend.destination_title) {
          const destBubble = document.createElement('div')
          destBubble.style.cssText = `position:absolute;bottom:68px;left:50%;transform:translateX(-50%);background:#185FA5;color:white;font-size:9px;font-weight:700;padding:3px 8px;border-radius:6px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 8px rgba(0,0,0,0.3);`
          destBubble.textContent = `→ ${friend.destination_title}`
          el.appendChild(destBubble)
        }
        const pulseRing = document.createElement('div')
        pulseRing.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:56px;height:56px;border-radius:50%;border:2px solid #22C55E;animation:friend-pulse 2s ease-out infinite;pointer-events:none;`
        el.appendChild(pulseRing)
        const markerOuter = document.createElement('div')
        markerOuter.style.cssText = `width:44px;height:44px;border-radius:50%;overflow:hidden;border:3px solid #22C55E;background:#052e16;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.4);position:relative;z-index:2;`
        markerOuter.className = 'friend-marker-inner'
        if (friend.avatar_url) {
          const img = document.createElement('img')
          img.src = friend.avatar_url
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;'
          markerOuter.appendChild(img)
        } else {
          const initial = document.createElement('span')
          initial.style.cssText = 'color:#22C55E;font-size:16px;font-weight:800;'
          initial.textContent = (friend.display_name || friend.username || '?')[0].toUpperCase()
          markerOuter.appendChild(initial)
        }
        if (friend.is_convoy_leader) {
          const crown = document.createElement('div')
          crown.style.cssText = 'position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:14px;'
          crown.textContent = '👑'
          el.appendChild(crown)
        }
        el.appendChild(markerOuter)
        const nameLabel = document.createElement('div')
        nameLabel.style.cssText = `position:absolute;top:50px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap;`
        nameLabel.textContent = friend.display_name || friend.username || 'Friend'
        el.appendChild(nameLabel)
        if (friend.is_navigating) {
          const speedLabel = document.createElement('div')
          speedLabel.className = 'friend-speed'
          speedLabel.style.cssText = `position:absolute;top:65px;left:50%;transform:translateX(-50%);background:#185FA5;color:white;font-size:8px;font-weight:700;padding:1px 6px;border-radius:3px;white-space:nowrap;`
          speedLabel.textContent = `${Math.round(friend.current_speed_mph || 0)} mph`
          el.appendChild(speedLabel)
        }
        el.addEventListener('click', () => setSelectedFriendInfo(friend))
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([friend.lng, friend.lat]).addTo(map)
        friendMarkersRef.current[friend.user_id] = marker
      })
    }
    if (map.loaded()) render(); else map.once('load', render)
  }, [friendLocations])

  const drawRoute = useCallback((map: mapboxgl.Map, geometry: any) => {
    const geojson: any = geometry.type === 'Feature' ? geometry : { type: 'Feature', properties: {}, geometry }
    if (map.getSource('route')) {
      (map.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson)
    } else {
      map.addSource('route', { type: 'geojson', data: geojson })
      // Outer glow
      map.addLayer({
        id: 'route-outline',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#0A3D6B', 'line-width': 6, 'line-opacity': 0.4 },
        layout: { 'line-join': 'round', 'line-cap': 'round' }
      })
      // Main route line — thinner and sharper
      map.addLayer({
        id: 'route-fill',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#185FA5', 'line-width': 4 },
        layout: { 'line-join': 'round', 'line-cap': 'round' }
      })
      // Travelled portion
      map.addSource('route-travelled', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
      })
      map.addLayer({
        id: 'route-travelled',
        type: 'line',
        source: 'route-travelled',
        paint: { 'line-color': '#94A3B8', 'line-width': 4 },
        layout: { 'line-join': 'round', 'line-cap': 'round' }
      })
    }
  }, [])

  const fetchRoute = useCallback(async (
    map: mapboxgl.Map,
    originLng: number,
    originLat: number,
    fetchDestLng: number,
    fetchDestLat: number,
    silent = false
  ) => {
    if (!fetchDestLat || !fetchDestLng) return
    if (!silent) setRouteLoading(true)
    try {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${originLng},${originLat};${fetchDestLng},${fetchDestLat}?steps=true&geometries=geojson&overview=full&voice_instructions=true&banner_instructions=true&voice_units=imperial&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      )
      const data = await res.json()
      if (!data.routes?.length) { toast.error('Could not find a route to this location'); return }
      const route = data.routes[0]
      drawRoute(map, { type: 'Feature', properties: {}, geometry: route.geometry })
      const navSteps: NavStep[] = route.legs[0]?.steps || []
      setSteps(navSteps)
      setTotalDistanceRemaining(route.distance)
      const etaMins = Math.ceil(route.duration / 60)
      setEtaMinutes(etaMins)
      const arrival = addSeconds(new Date(), route.duration)
      setArrivalTime(format(arrival, 'HH:mm'))
      if (!silent && mode === 'preview') {
        const coords = route.geometry.coordinates;
        const bounds = coords.reduce(
          (b: mapboxgl.LngLatBounds, c: [number, number]) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        // Wait for map to be fully sized before fitting bounds
        const safeFit = () => {
          const canvas = map.getCanvas();
          if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
            setTimeout(safeFit, 100);
            return;
          }
          map.resize(); // ensure canvas dimensions are current
          try {
            map.fitBounds(bounds, {
              padding: {
                top: 120,
                bottom: Math.round(window.innerHeight * 0.58),
                left: 60,
                right: 60
              },
              duration: 1200,
              maxZoom: 14
            });
          } catch { /* silent */ }
        };
        setTimeout(safeFit, 300);
      }
      announcedDistancesRef.current = new Set()
    } catch (err) {
      if (!silent) toast.error('Could not load route')
    } finally {
      if (!silent) setRouteLoading(false)
    }
  }, [drawRoute, mode])

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current) return
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
    const hour = new Date().getHours()
    const isNight = hour < 6 || hour >= 20
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isNight ? 'mapbox://styles/mapbox/navigation-night-v1' : 'mapbox://styles/mapbox/navigation-day-v1',
      center: [destLng || -1.5, destLat || 52.5],
      zoom: 13,
      attributionControl: false,
      logoPosition: 'bottom-left',
    })
    mapRef.current = map
    // Force resize after mount to ensure canvas has correct dimensions
    setTimeout(() => { map.resize(); }, 100);
    setTimeout(() => { map.resize(); }, 500);
    map.on('load', () => {
      map.resize(); // Ensure correct size on load
      if (effectiveDestLat != null && effectiveDestLng != null) {
        const destEl = document.createElement('div')
        destEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;'
        destEl.innerHTML = `
          <div style="
            width:28px;height:28px;
            background:#d30d37;
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 3px 12px rgba(211,13,55,0.5);
          "></div>
        `
        destMarkerRef.current = new mapboxgl.Marker({ element: destEl, anchor: 'bottom' })
          .setLngLat([effectiveDestLng, effectiveDestLat])
          .addTo(map)
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const userLng = pos.coords.longitude
          const userLat = pos.coords.latitude
          let originLng = userLng
          let originLat = userLat
          // Feature 1: if user is within 500m of route start, begin navigating along the route
          // immediately rather than routing them to the start point first.
          if (effectiveCoords) {
            const distToStart = haversineDistance(userLat, userLng, effectiveCoords.startLat, effectiveCoords.startLng)
            if (distToStart < 500) {
              originLng = effectiveCoords.startLng
              originLat = effectiveCoords.startLat
            }
          }
          fetchRoute(map, originLng, originLat, effectiveDestLng!, effectiveDestLat!)
          map.flyTo({ center: [userLng, userLat], zoom: 14 })
        },
        () => { if (effectiveDestLng != null && effectiveDestLat != null) fetchRoute(map, effectiveDestLng - 0.01, effectiveDestLat - 0.01, effectiveDestLng, effectiveDestLat) },
        { timeout: 8000, enableHighAccuracy: false }
      )
    })
    map.on('dragstart', () => { isFollowingRef.current = false; setIsFollowing(false) })
    return () => {
      map.remove()
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
      if (shareIntervalRef.current) clearInterval(shareIntervalRef.current)
      if (rerouteTimeoutRef.current) clearTimeout(rerouteTimeoutRef.current)
      stopSharingCleanup()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch route + reposition destination marker when user toggles reverse in preview mode
  useEffect(() => {
    if (!reverseInitRef.current) {
      reverseInitRef.current = true
      return
    }
    if (mode !== 'preview') return
    if (effectiveDestLat == null || effectiveDestLng == null) return
    const map = mapRef.current
    if (!map) return

    // Reposition the destination marker
    if (destMarkerRef.current) {
      destMarkerRef.current.setLngLat([effectiveDestLng, effectiveDestLat])
    }

    // Re-fetch the route from the new origin (user GPS or new start) to the new destination
    navigator.geolocation.getCurrentPosition(
      pos => {
        const userLng = pos.coords.longitude
        const userLat = pos.coords.latitude
        let originLng = userLng
        let originLat = userLat
        if (effectiveCoords) {
          const distToStart = haversineDistance(userLat, userLng, effectiveCoords.startLat, effectiveCoords.startLng)
          if (distToStart < 500) {
            originLng = effectiveCoords.startLng
            originLat = effectiveCoords.startLat
          }
        }
        fetchRoute(map, originLng, originLat, effectiveDestLng, effectiveDestLat)
      },
      () => fetchRoute(map, effectiveDestLng - 0.01, effectiveDestLat - 0.01, effectiveDestLng, effectiveDestLat),
      { timeout: 8000, enableHighAccuracy: false }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReversed])

  const stopSharingCleanup = async () => {
    if (!user?.id) return
    if (shareIntervalRef.current) clearInterval(shareIntervalRef.current)
    try {
      await supabase.from('live_location_sessions').update({ is_active: false, ended_at: new Date().toISOString(), is_navigating: false }).eq('user_id', user.id)
    } catch {}
  }

  const startSharing = async (friendIds: string[]) => {
    if (!user?.id || !canShare || friendIds.length === 0) return
    try {
      await supabase.from('live_location_sessions').upsert({
        user_id: user.id, is_active: true, started_at: new Date().toISOString(), ended_at: null,
        destination_title: destTitle, dest_lat: destLat, dest_lng: destLng,
        session_type: 'navigation', shared_with: friendIds, is_navigating: mode === 'active', current_speed_mph: currentSpeedMph,
      })
      const interval = mode === 'active' ? 3000 : 10000
      shareIntervalRef.current = setInterval(async () => {
        if (!userLocationRef.current) return
        const [lng, lat] = userLocationRef.current
        await supabase.from('live_location_sessions').update({
          last_lat: lat, last_lng: lng,
          last_heading: currentHeadingRef.current,
          bearing: currentHeadingRef.current,
          last_updated: new Date().toISOString(),
          current_speed_mph: currentSpeedMphRef.current,
          is_navigating: mode === 'active',
          shared_with: sharedWithFriendsRef.current,
        }).eq('user_id', user.id)
      }, interval)
      setIsSharingLocation(true)
    } catch { toast.error('Could not start location sharing') }
  }

  const stopSharing = async () => {
    if (!user?.id) return
    if (shareIntervalRef.current) clearInterval(shareIntervalRef.current)
    try {
      await supabase.from('live_location_sessions').update({ is_active: false, ended_at: new Date().toISOString(), is_navigating: false }).eq('user_id', user.id)
    } catch {}
    setIsSharingLocation(false)
    setSharedWithFriends([])
    sharedWithFriendsRef.current = []
  }

  const toggleFriendSharing = async (friendId: string) => {
    const newSharedWith = sharedWithFriends.includes(friendId)
      ? sharedWithFriends.filter(id => id !== friendId)
      : [...sharedWithFriends, friendId]
    setSharedWithFriends(newSharedWith)
    sharedWithFriendsRef.current = newSharedWith
    if (newSharedWith.length === 0) {
      await stopSharing()
    } else if (!isSharingLocation) {
      await startSharing(newSharedWith)
    } else {
      await supabase.from('live_location_sessions').update({ shared_with: newSharedWith }).eq('user_id', user?.id)
    }
  }

  const handlePositionUpdate = useCallback(async (pos: GeolocationPosition) => {
    const { latitude, longitude, heading, speed } = pos.coords
    const newLoc: [number, number] = [longitude, latitude]
    setUserLocation(newLoc)
    setCurrentHeading(heading || 0)
    const speedMph = speed ? Math.round(speed * 2.237) : 0
    setCurrentSpeedMph(speedMph)
    userLocationRef.current = newLoc
    currentHeadingRef.current = heading || 0
    currentSpeedMphRef.current = speedMph
    const map = mapRef.current
    if (!map) return
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(newLoc)
      const el = userMarkerRef.current.getElement()
      const arrow = el.querySelector('.user-arrow') as HTMLElement
      if (arrow) arrow.style.transform = `rotate(${heading || 0}deg)`
    } else {
      const el = document.createElement('div')
      el.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;'

      // Pulse ring
      const pulse = document.createElement('div')
      pulse.style.cssText = `
        position:absolute;
        width:32px;height:32px;
        border-radius:50%;
        background:rgba(24,95,165,0.2);
        border:2px solid rgba(24,95,165,0.4);
        animation:user-location-pulse 2s ease-out infinite;
      `
      el.appendChild(pulse)

      // Direction arrow
      const arrow = document.createElement('div')
      arrow.className = 'user-arrow'
      arrow.style.cssText = `
        position:absolute;
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-bottom:14px solid #185FA5;
        top:-10px;
        transform:rotate(${heading || 0}deg);
        transform-origin:center 14px;
        transition:transform 0.3s ease;
      `
      el.appendChild(arrow)

      // Centre dot
      const dot = document.createElement('div')
      dot.style.cssText = `
        width:16px;height:16px;
        background:#185FA5;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 2px 8px rgba(24,95,165,0.6);
        position:relative;z-index:2;
      `
      el.appendChild(dot)

      // Add pulse animation if not already in DOM
      if (!document.getElementById('user-location-pulse-style')) {
        const style = document.createElement('style')
        style.id = 'user-location-pulse-style'
        style.textContent = `@keyframes user-location-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }`
        document.head.appendChild(style)
      }

      userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(newLoc)
        .addTo(map)
    }
    if (isFollowingRef.current) {
      map.easeTo({ center: newLoc, bearing: heading || 0, pitch: 55, zoom: 17, duration: 500 })
    }
    if (destLat && destLng) {
      const distToDest = haversineDistance(latitude, longitude, destLat, destLng)
      if (distToDest < 30) { handleArrival(); return }
    }
    if (steps.length > 0) {
      const nextIdx = currentStepIndex + 1
      if (nextIdx < steps.length) {
        const ns = steps[nextIdx]
        const [stepLng, stepLat] = ns.maneuver.location
        const distToNext = haversineDistance(latitude, longitude, stepLat, stepLng)
        setDistanceToNextTurn(distToNext)
        for (const threshold of DISTANCE_ANNOUNCEMENTS) {
          if (distToNext <= threshold + 25 && distToNext >= threshold - 25 && !announcedDistancesRef.current.has(threshold)) {
            announcedDistancesRef.current.add(threshold)
            speak(buildVoiceInstruction(ns, distToNext))
            break
          }
        }
        if (distToNext < 20) {
          setCurrentStepIndex(nextIdx)
          announcedDistancesRef.current = new Set()
          if (nextIdx + 1 < steps.length) setTimeout(() => speak(steps[nextIdx].maneuver.instruction), 500)
        }
      }
      let remaining = 0
      for (let i = currentStepIndex; i < steps.length; i++) remaining += steps[i].distance
      setTotalDistanceRemaining(remaining)
      if (speed && speed > 0.5) {
        const etaSecs = remaining / speed
        setEtaMinutes(Math.ceil(etaSecs / 60))
        setArrivalTime(format(addSeconds(new Date(), etaSecs), 'HH:mm'))
      }
    }
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const [stepLng, stepLat] = steps[currentStepIndex].maneuver.location
      const distFromStep = haversineDistance(latitude, longitude, stepLat, stepLng)
      if (distFromStep > 80) {
        offRouteCountRef.current++
        if (offRouteCountRef.current >= 3) {
          offRouteCountRef.current = 0
          setIsRerouting(true)
          speak('Rerouting')
          const ed = effectiveDestRef.current
          if (ed) await fetchRoute(map, longitude, latitude, ed.lng, ed.lat, true)
          setIsRerouting(false)
        }
      } else { offRouteCountRef.current = 0 }
    }
    if (lastPositionRef.current) {
      const driven = haversineDistance(lastPositionRef.current.latitude, lastPositionRef.current.longitude, latitude, longitude)
      setTotalDistanceDriven(prev => prev + driven)
    }
    lastPositionRef.current = pos.coords
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, currentStepIndex, destLat, destLng, haversineDistance, speak, buildVoiceInstruction, fetchRoute])

  handlePositionUpdateRef.current = handlePositionUpdate

  const handleArrival = async () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    window.speechSynthesis?.cancel()
    speak(`You have arrived at ${destTitle}. Well driven!`)
    setMode('arrived')
    if (sessionIdRef.current) {
      await supabase.from('navigation_sessions').update({
        ended_at: new Date().toISOString(), completed: true, distance_driven_meters: totalDistanceDriven,
      }).eq('id', sessionIdRef.current)
    }
    await stopSharing()
  }

  const handleStopNavigation = async () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    window.speechSynthesis?.cancel()
    await stopSharing()
    if (sessionIdRef.current) {
      await supabase.from('navigation_sessions').update({
        ended_at: new Date().toISOString(), completed: false, distance_driven_meters: totalDistanceDriven,
      }).eq('id', sessionIdRef.current)
    }
    navigate(-1)
  }

  const handleRecenter = () => {
    if (!userLocation || !mapRef.current) return
    isFollowingRef.current = true
    setIsFollowing(true)
    mapRef.current.easeTo({ center: userLocation, bearing: currentHeading, pitch: mode === 'active' ? 55 : 0, zoom: 17, duration: 600 })
  }

  const handleOverview = () => {
    isFollowingRef.current = false
    setIsFollowing(false)
    const map = mapRef.current
    if (!map || !destLat || !destLng) return
    const bounds = new mapboxgl.LngLatBounds()
    if (userLocation) bounds.extend(userLocation)
    bounds.extend([destLng, destLat])
    Object.values(friendLocations).forEach(f => {
      if (f.lat && f.lng) bounds.extend([f.lng, f.lat])
    })
    map.fitBounds(bounds, { padding: 80, duration: 800, pitch: 0, bearing: 0 })
  }

  const startNavigation = async () => {
    setMode('active')
    setJourneyStartTime(new Date())
    isFollowingRef.current = true
    setIsFollowing(true)
    if (user?.id) {
      try {
        const { data: session } = await supabase.from('navigation_sessions')
          .insert({ user_id: user.id, destination_title: destTitle, dest_lat: destLat, dest_lng: destLng, started_at: new Date().toISOString() })
          .select().single()
        if (session) sessionIdRef.current = session.id
      } catch { toast.error('Could not save navigation session') }
    }
    if (isSharingLocation) {
      await supabase.from('live_location_sessions').update({ is_navigating: true }).eq('user_id', user?.id)
    }
    if (steps[0]?.maneuver?.instruction) {
      setTimeout(() => speak(`Starting navigation. ${steps[0].maneuver.instruction}`), 800)
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => handlePositionUpdateRef.current?.(pos),
      () => toast.error('GPS signal lost — check location settings'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    )
  }

  const currentStep = steps[currentStepIndex]
  const nextStep = steps[currentStepIndex + 1]
  const activeFriendCount = Object.keys(friendLocations).length
  const journeyTime = journeyStartTime ? Math.round((Date.now() - journeyStartTime.getTime()) / 60000) : 0

  return (
    <div className="fixed inset-0 bg-black z-50">
      <style>{`
        @keyframes friend-pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
        @keyframes reroute-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div ref={mapContainerRef} className="absolute inset-0" />

      {isRerouting && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-black/80 text-white px-6 py-4 rounded-2xl" style={{ animation: 'reroute-flash 1s infinite' }}>
          <p className="text-lg font-bold">Rerouting...</p>
        </div>
      )}

      {routeLoading && !isRerouting && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-black/70 text-white px-6 py-4 rounded-2xl flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Finding best route...</p>
        </div>
      )}

      {/* ═══ PREVIEW ═══ */}
      {mode === 'preview' && (
        <>
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 safe-top z-20 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-gray-700">‹</span>
          </button>

          <div className="absolute bottom-0 left-0 right-0 z-30 rounded-t-3xl bg-white shadow-2xl" style={{ maxHeight: '60vh' }}>
            <div className="overflow-y-auto p-5 pb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📍</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 truncate">{destTitle}{isReversed ? ' (reversed)' : ''}</h2>
                  <p className="text-xs text-gray-500">Tap Start to begin navigation</p>
                </div>
                {stateGeometry && (
                  <button
                    onClick={() => setIsReversed(r => !r)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
                    title="Reverse route"
                  >
                    <span className="text-base leading-none">⇅</span>
                    <span className="text-xs font-semibold text-gray-700">Reverse</span>
                  </button>
                )}
              </div>

              {totalDistanceRemaining > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Distance', value: formatDistanceVal(totalDistanceRemaining) },
                    { label: 'Est. time', value: `${etaMinutes} min` },
                    { label: 'Arrival', value: arrivalTime || '--:--' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeFriendCount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-green-700 font-medium">
                    {activeFriendCount} friend{activeFriendCount > 1 ? 's' : ''} currently sharing location
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">📡</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Share location with friends</p>
                    <p className="text-[10px] text-gray-500">
                      {canShare
                        ? isSharingLocation
                          ? `Sharing with ${sharedWithFriends.length} friend${sharedWithFriends.length !== 1 ? 's' : ''}`
                          : 'Choose who sees your location'
                        : 'Pro plan required'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!canShare) { navigate('/upgrade'); return }
                      setShowFriendPicker(true)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSharingLocation ? 'bg-green-500 text-white' : canShare ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isSharingLocation ? 'Sharing ✓' : canShare ? 'Choose friends' : 'Upgrade'}
                  </button>
                </div>
              </div>

              <button
                onClick={startNavigation}
                disabled={steps.length === 0 || routeLoading}
                className="w-full py-4 rounded-2xl bg-[#185FA5] text-white font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {routeLoading ? 'Loading route...' : steps.length === 0 ? 'Calculating route...' : '▶ Start Navigation'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══ ACTIVE ═══ */}
      {mode === 'active' && (
        <>
          <div className="absolute top-0 left-0 right-0 z-30 safe-top">
            <div className="bg-gray-900/95 backdrop-blur-md">
              <div className="flex items-center gap-3 p-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: currentStep ? getManeuverColor(currentStep) : '#185FA5' }}
                >
                  <span className="text-3xl text-white">{currentStep ? getManeuverArrow(currentStep) : '↑'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-white">
                    {distanceToNextTurn > 0 ? formatDistanceVal(distanceToNextTurn) : '--'}
                  </p>
                  <p className="text-sm text-gray-300 truncate">
                    {currentStep?.name || currentStep?.maneuver?.instruction || 'Continue on route'}
                  </p>
                </div>
              </div>
              {nextStep && (
                <div className="px-4 pb-3 flex items-center gap-2 text-gray-400">
                  <span className="text-sm">{getManeuverArrow(nextStep)}</span>
                  <p className="text-xs truncate flex-1">Then: {nextStep.maneuver.instruction}</p>
                  <p className="text-xs font-semibold flex-shrink-0">{formatDistanceVal(nextStep.distance)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="absolute top-36 right-4 z-20">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-3 text-center min-w-[64px]">
              <p className={`text-2xl font-bold ${speedColor}`}>{currentSpeedMph}</p>
              <p className="text-[10px] text-gray-400 font-medium">mph</p>
              {speedLimitMph && (
                <div className="mt-1 border-t border-gray-700 pt-1">
                  <p className="text-xs text-gray-300 font-bold">{speedLimitMph}</p>
                </div>
              )}
            </div>
          </div>

          {activeFriendCount > 0 && (
            <button onClick={() => setShowConvoyPanel(true)} className="absolute left-4 top-40 z-10 bg-green-500 text-white rounded-xl px-3 py-2 shadow-lg">
              <p className="text-xs font-bold">{activeFriendCount} friends</p>
              <p className="text-[10px]">on map</p>
            </button>
          )}

          {!isFollowing && (
            <button onClick={handleRecenter} className="absolute right-4 bottom-64 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-lg">
              ◎
            </button>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-md rounded-t-3xl pt-4 pb-8 px-4">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Remaining', value: formatDistanceVal(totalDistanceRemaining) },
                { label: 'ETA', value: `${etaMinutes} min` },
                { label: 'Arrival', value: arrivalTime || '--:--' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 rounded-xl p-2 text-center">
                  <p className="text-sm font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all ${
                  isMuted ? 'bg-red-900/50 border-red-700 text-red-400' : 'bg-white/10 border-white/20 text-white'
                }`}
              >
                <span className="text-sm">{isMuted ? '🔇' : '🔊'}</span>
                <span className="text-[9px] font-medium">{isMuted ? 'Muted' : 'Voice'}</span>
              </button>
              <button onClick={handleOverview} className="flex-1 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 border bg-white/10 border-white/20 text-white">
                <span className="text-sm">🗺</span>
                <span className="text-[9px] font-medium">Overview</span>
              </button>
              <button
                onClick={() => {
                  if (!canShare) { toast.error('Upgrade to Pro to share location'); return }
                  setShowFriendPicker(true)
                }}
                className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all ${
                  isSharingLocation ? 'bg-green-900/50 border-green-600 text-green-400' : canShare ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-white/30'
                }`}
              >
                <span className="text-sm">{isSharingLocation ? '📡' : '👥'}</span>
                <span className="text-[9px] font-medium">{isSharingLocation ? `${sharedWithFriends.length} sharing` : 'Convoy'}</span>
              </button>
              <button onClick={handleRecenter} className="flex-1 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 border bg-white/10 border-white/20 text-white">
                <span className="text-sm">◎</span>
                <span className="text-[9px] font-medium">Centre</span>
              </button>
            </div>

            {isSharingLocation && (
              <div className="flex items-center gap-2 bg-green-900/40 rounded-xl px-3 py-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs text-green-300 flex-1">Sharing with {sharedWithFriends.length} friend{sharedWithFriends.length !== 1 ? 's' : ''}</p>
                <button onClick={stopSharing} className="text-xs text-red-400 font-semibold">Stop</button>
              </div>
            )}

            {!canShare && (
              <button onClick={() => navigate('/upgrade')} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#185FA5] to-[#3B6D11] text-white text-xs font-bold mb-3">
                ⭐ Upgrade to Pro — Share location with friends
              </button>
            )}

            <button onClick={handleStopNavigation} className="w-full py-3.5 rounded-2xl bg-red-600 text-white font-bold text-sm">
              Stop Navigation
            </button>
          </div>
        </>
      )}

      {/* ═══ ARRIVED ═══ */}
      {mode === 'arrived' && (
        <div className="absolute inset-0 z-40 bg-gray-900/95 backdrop-blur-md flex items-center justify-center">
          <div className="w-full max-w-sm mx-auto px-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-4xl text-white">✓</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-1">You have arrived!</h1>
            <p className="text-gray-400 text-center text-sm mb-6">{destTitle}</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-white">{formatDistanceVal(totalDistanceDriven)}</p>
                <p className="text-xs text-gray-400 mt-1">Distance driven</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-white">{journeyTime} min</p>
                <p className="text-xs text-gray-400 mt-1">Journey time</p>
              </div>
            </div>
            {routeId && (
              <button onClick={() => navigate(`/route/${routeId}`)} className="w-full py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold mb-3">
                ⭐ Rate this route
              </button>
            )}
            <button onClick={() => navigate('/', { replace: true })} className="w-full py-3.5 rounded-2xl bg-gray-700 text-white text-sm font-bold">
              Back to map
            </button>
          </div>
        </div>
      )}

      {/* ═══ FRIEND PICKER ═══ */}
      {showFriendPicker && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setShowFriendPicker(false)} />
          <div className="bg-white rounded-t-3xl max-h-[75vh] flex flex-col">
            <div className="p-5 pb-0">
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Share your location</h3>
              <p className="text-xs text-gray-500 mt-1">
                {sharedWithFriends.length === 0
                  ? 'Select friends to share your location with'
                  : `Sharing with ${sharedWithFriends.length} friend${sharedWithFriends.length !== 1 ? 's' : ''}`}
              </p>
              {sharedWithFriends.length > 0 && (
                <div className="mt-2 bg-green-50 rounded-lg px-3 py-1.5 inline-block">
                  <span className="text-xs font-semibold text-green-700">{sharedWithFriends.length} selected</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {allFriends.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-sm font-semibold text-gray-700">No friends yet</p>
                  <p className="text-xs text-gray-500 mt-1">Add friends to share your location with them</p>
                </div>
              ) : (
                allFriends.map(friend => {
                  const isSelected = sharedWithFriends.includes(friend.id)
                  const isFriendSharing = !!friendLocations[friend.id]
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriendSharing(friend.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                        isSelected ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {friend.avatar_url ? (
                            <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-gray-500">
                              {(friend.display_name || friend.username || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        {isFriendSharing && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{friend.display_name || friend.username}</p>
                        <p className="text-[10px] text-gray-500">
                          {isFriendSharing
                            ? `🟢 Sharing location${friendLocations[friend.id]?.destination_title ? ` · → ${friendLocations[friend.id].destination_title}` : ''}`
                            : 'Not currently sharing'}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: isSelected ? '#22C55E' : '#D1D5DB', backgroundColor: isSelected ? '#22C55E' : 'transparent' }}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <div className="p-5 pt-3 space-y-2 border-t border-gray-100">
              {sharedWithFriends.length > 0 ? (
                <>
                  <button onClick={() => setShowFriendPicker(false)} className="w-full py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm">
                    ✓ Sharing with {sharedWithFriends.length} friend{sharedWithFriends.length !== 1 ? 's' : ''}
                  </button>
                  <button
                    onClick={async () => { await stopSharing(); setShowFriendPicker(false) }}
                    className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm"
                  >
                    Stop sharing
                  </button>
                </>
              ) : (
                <button onClick={() => setShowFriendPicker(false)} className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-sm">
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ FRIEND INFO ═══ */}
      {selectedFriendInfo && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setSelectedFriendInfo(null)} />
          <div className="bg-white rounded-t-3xl p-5">
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-3 border-green-500">
                {selectedFriendInfo.avatar_url ? (
                  <img src={selectedFriendInfo.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-gray-500">
                    {(selectedFriendInfo.display_name || selectedFriendInfo.username || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">{selectedFriendInfo.display_name || selectedFriendInfo.username}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-600 font-medium">Live location</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{Math.round(selectedFriendInfo.current_speed_mph || 0)}</p>
                <p className="text-[10px] text-gray-500">mph</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-sm font-bold text-gray-900 truncate">{selectedFriendInfo.destination_title || 'No destination'}</p>
                <p className="text-[10px] text-gray-500">Heading to</p>
              </div>
            </div>
            {userLocation && selectedFriendInfo.lat && selectedFriendInfo.lng && (
              <div className="bg-blue-50 rounded-xl p-3 mb-4 text-center">
                <p className="text-sm font-semibold text-blue-700">
                  {formatDistanceVal(haversineDistance(userLocation[1], userLocation[0], selectedFriendInfo.lat, selectedFriendInfo.lng))} away from you
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setSelectedFriendInfo(null)
                if (selectedFriendInfo.lat && selectedFriendInfo.lng) {
                  mapRef.current?.flyTo({ center: [selectedFriendInfo.lng, selectedFriendInfo.lat], zoom: 15, duration: 800 })
                }
              }}
              className="w-full py-3 rounded-2xl bg-[#185FA5] text-white font-bold text-sm"
            >
              Show on map
            </button>
          </div>
        </div>
      )}

      {/* ═══ CONVOY PANEL ═══ */}
      {showConvoyPanel && activeFriendCount > 0 && (
        <div className="absolute left-3 right-3 bottom-52 z-30 bg-gray-900/95 backdrop-blur-md rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm font-bold">👥 Convoy</p>
            <button onClick={() => setShowConvoyPanel(false)} className="text-white/50 text-xs">✕</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {Object.values(friendLocations).map((friend: FriendLocation) => (
              <button
                key={friend.user_id}
                onClick={() => { setSelectedFriendInfo(friend); setShowConvoyPanel(false) }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500 bg-gray-800">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-green-400 text-sm font-bold">
                        {(friend.display_name || friend.username || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  {friend.is_convoy_leader && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">👑</span>}
                </div>
                <p className="text-[9px] text-white font-medium truncate max-w-[60px]">{friend.display_name || friend.username}</p>
                <p className="text-[8px] text-gray-400">{Math.round(friend.current_speed_mph || 0)} mph</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
