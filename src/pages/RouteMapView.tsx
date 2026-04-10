import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function RouteMapView() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const geometry = state?.geometry
  const routeName = state?.routeName || 'Route'
  const distance = state?.distance
  const duration = state?.duration
  const difficulty = state?.difficulty

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-1.5, 52.5],
      zoom: 10,
    })

    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
    map.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

    map.on('load', () => {
      map.resize()

      if (!geometry) return

      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry }
      })

      map.addLayer({
        id: 'route-bg',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.9 }
      })

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#4f7fff', 'line-width': 5 }
      })

      const coords = geometry.type === 'LineString'
        ? geometry.coordinates
        : geometry.coordinates?.[0] || []

      if (coords.length > 1) {
        const bounds = coords.reduce(
          (b: mapboxgl.LngLatBounds, c: number[]) =>
            b.extend(c as [number, number]),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        )
        map.fitBounds(bounds, {
          padding: { top: 80, bottom: 120, left: 60, right: 60 },
          duration: 800,
          maxZoom: 14
        })

        // Start marker — green circle with white border
        const startEl = document.createElement('div')
        startEl.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22c55e;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(34,197,94,0.5);
        `
        new mapboxgl.Marker({ element: startEl, anchor: 'center' })
          .setLngLat(coords[0])
          .addTo(map)

        // End marker — red teardrop matching navigation destination pin
        const endEl = document.createElement('div')
        endEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;'
        endEl.innerHTML = `<div style="
          width: 24px;
          height: 24px;
          background: #d30d37;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 12px rgba(211,13,55,0.5);
        "></div>`
        new mapboxgl.Marker({ element: endEl, anchor: 'bottom' })
          .setLngLat(coords[coords.length - 1])
          .addTo(map)
      }
    })

    return () => {
      try { map.remove() } catch {}
      mapRef.current = null
    }
  }, [])

  if (!geometry) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-2xl mb-2">🗺️</p>
          <p className="font-semibold text-foreground mb-1">No route data</p>
          <p className="text-sm text-muted-foreground mb-4">This route has no map geometry</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-2xl bg-foreground text-background font-semibold text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Back button */}
      <div className="absolute z-10" style={{ top: 'max(16px, env(safe-area-inset-top))', left: 16 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white text-gray-800 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg"
        >
          ← Back
        </button>
      </div>

      {/* Bottom info bar */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))', zIndex: 10 }}
      >
        <div className="px-4 pt-3 pb-1">
          <p className="font-bold text-gray-900 text-sm">{routeName}</p>
          <div className="flex gap-4 mt-1 text-xs text-gray-500">
            {distance && <span>{distance}</span>}
            {duration && <span>~{duration} min</span>}
            {difficulty && <span className="capitalize">{difficulty}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
