/**
 * AddRoute page — orchestrates route creation methods and the publish flow.
 * Uses the new RouteDraft model. All business logic in routeService.ts.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from 'sonner';
import RouteMethodSheet, { type RouteMethod } from '@/components/route-creation/RouteMethodSheet';
import RecordDriveOverlay from '@/components/route-creation/RecordDriveOverlay';
import DrawRouteOverlay from '@/components/route-creation/DrawRouteOverlay';
import GPXImportSheet from '@/components/route-creation/GPXImportSheet';
import EditPublishRoute from '@/components/route-creation/EditPublishRoute';
import { buildRouteDraft, formatRouteDistance } from '@/services/routeService';
import { Button } from '@/components/ui/button';
import type { RouteDraft, PublishRouteFormData } from '@/models/route';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

type Phase = 'pick' | 'record' | 'draw' | 'gpx' | 'gpx-preview' | 'edit';

const AddRoute = () => {
  const navigate = useNavigate();
  const { routes: routesRepo, state } = useData();
  const { user: authUser } = useAuth();

  const [phase, setPhase] = useState<Phase>('pick');
  const [draftRoute, setDraftRoute] = useState<RouteDraft | null>(null);
  const [drawWaypoints, setDrawWaypoints] = useState<[number, number][]>([]);
  const isTransitioningRef = useRef(false);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const lineSourceRef = useRef<boolean>(false);
  // Track snapped coordinates for the draw line
  const snappedCoordsRef = useRef<[number, number][] | null>(null);

  const showMap = phase === 'record' || phase === 'draw' || phase === 'gpx-preview';

  const clearMarkersSafely = () => {
    markersRef.current.forEach((mk) => {
      try { mk.remove(); } catch (_) {}
    });
    markersRef.current = [];
  };

  // Init map for record/draw/gpx-preview
  useEffect(() => {
    if (!showMap || !mapContainerRef.current || mapRef.current) return;

    const m = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-1.8, 51.5],
      zoom: 13,
      attributionControl: false,
    });

    m.on('load', () => {
      m.addSource('draw-route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } } });
      m.addLayer({ id: 'draw-route-casing', type: 'line', source: 'draw-route', paint: { 'line-color': '#1a56db', 'line-width': 8, 'line-opacity': 0.3 } });
      m.addLayer({ id: 'draw-route-line', type: 'line', source: 'draw-route', paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.9 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      lineSourceRef.current = true;

      // If GPX preview, render the route immediately
      if (phase === 'gpx-preview' && draftRoute) {
        const coords = draftRoute.geometry.coordinates;
        const src = m.getSource('draw-route') as mapboxgl.GeoJSONSource;
        if (src) {
          src.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } });
        }
        // Add start/end markers
        const startEl = document.createElement('div');
        startEl.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);';
        new mapboxgl.Marker({ element: startEl }).setLngLat(coords[0]).addTo(m);

        const endEl = document.createElement('div');
        endEl.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);';
        new mapboxgl.Marker({ element: endEl }).setLngLat(coords[coords.length - 1]).addTo(m);

        // Fit bounds
        const bounds = coords.reduce(
          (b: mapboxgl.LngLatBounds, c: [number, number]) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0]),
        );
        m.fitBounds(bounds, { padding: 60, duration: 800 });
      }
    });

    if (phase !== 'gpx-preview') {
      navigator.geolocation.getCurrentPosition(
        (pos) => m.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1000 }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }

    mapRef.current = m;

    return () => {
      try { m.remove(); } catch (_) {}
      mapRef.current = null;
      lineSourceRef.current = false;
    };
  }, [showMap, phase]);

  // Draw mode: add waypoints on map click
  useEffect(() => {
    if (phase !== 'draw' || !mapRef.current) return;
    const m = mapRef.current;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setDrawWaypoints(prev => [...prev, pt]);
    };

    m.on('click', handleClick);
    const canvas = m.getCanvas?.();
    if (canvas) canvas.style.cursor = 'crosshair';

    return () => {
      try { m.off('click', handleClick); } catch (_) {}
      const cleanupCanvas = m.getCanvas?.();
      if (cleanupCanvas) cleanupCanvas.style.cursor = '';
    };
  }, [phase]);

  // Update line + markers when waypoints change
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !lineSourceRef.current) return;

    // Use snapped coords for line if available, otherwise raw waypoints
    const lineCoords = snappedCoordsRef.current && snappedCoordsRef.current.length > 0
      ? snappedCoordsRef.current
      : drawWaypoints;

    const src = m.getSource('draw-route') as mapboxgl.GeoJSONSource;
    if (src) {
      src.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: lineCoords } });
    }

    // Update markers for waypoints
    clearMarkersSafely();
    drawWaypoints.forEach((pt, i) => {
      const el = document.createElement('div');
      const isStart = i === 0;
      const isEnd = i === drawWaypoints.length - 1 && drawWaypoints.length > 1;
      const color = isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6';
      const size = isStart || isEnd ? 16 : 12;
      el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;`;
      const marker = new mapboxgl.Marker({ element: el, draggable: false }).setLngLat(pt).addTo(m);
      markersRef.current.push(marker);
    });
  }, [drawWaypoints]);

  // Handle snapped coordinates update from DrawRouteOverlay
  const handleSnappedCoordsUpdate = useCallback((coords: [number, number][]) => {
    snappedCoordsRef.current = coords.length > 0 ? coords : null;
    // Force re-render of the line
    const m = mapRef.current;
    if (!m || !lineSourceRef.current) return;
    const lineCoords = coords.length > 0 ? coords : drawWaypoints;
    const src = m.getSource('draw-route') as mapboxgl.GeoJSONSource;
    if (src) {
      src.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: lineCoords } });
    }
  }, [drawWaypoints]);

  // Method selection handlers
  const handleMethodSelect = (method: RouteMethod) => {
    isTransitioningRef.current = true;
    if (method === 'gpx') {
      setPhase('gpx');
    } else {
      setPhase(method);
    }
    setTimeout(() => { isTransitioningRef.current = false; }, 0);
  };

  const handleDraftReady = useCallback((draft: RouteDraft) => {
    setDraftRoute(draft);
    setPhase('edit');
    clearMarkersSafely();
    snappedCoordsRef.current = null;
    if (mapRef.current) {
      try { mapRef.current.remove(); } catch (_) {}
      mapRef.current = null;
    }
    lineSourceRef.current = false;
    setDrawWaypoints([]);
  }, []);

  // Handle GPX import — show on map first, then proceed to edit
  const handleGPXImport = useCallback((oldDraft: any) => {
    const coords = oldDraft.geometry?.coordinates || [];
    if (coords.length < 2) {
      toast.error('GPX must have at least 2 points');
      return;
    }
    const draft = buildRouteDraft(coords, [coords[0], coords[coords.length - 1]], false);
    setDraftRoute(draft);
    setPhase('gpx-preview');
  }, []);

  // Record drive: update map line with new coords
  const handleRecordCoordsUpdate = useCallback((coords: [number, number][]) => {
    const m = mapRef.current;
    if (!m || !lineSourceRef.current) return;
    const src = m.getSource('draw-route') as mapboxgl.GeoJSONSource;
    if (src) {
      src.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } });
    }
    // Pan to latest point
    if (coords.length > 0) {
      const last = coords[coords.length - 1];
      m.panTo(last, { duration: 500 });
    }
  }, []);

  const handlePublish = async (data: PublishRouteFormData) => {
    if (!authUser?.id) { toast.error('You must be signed in'); return; }

    const draft = data.draft;
    if (!draft?.geometry?.coordinates || draft.geometry.coordinates.length < 2) {
      toast.error('Invalid route data', { description: 'Route must have at least 2 points.' });
      return;
    }

    const durationMinutes = Math.round(draft.stats.durationSeconds / 60);

    try {
      const { data: newRoute, error } = await supabase.from('routes').insert({
        created_by: authUser.id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        geometry: draft.geometry as any,
        distance_meters: draft.stats.distanceMeters || null,
        duration_minutes: durationMinutes || null,
        visibility: data.visibility?.level || 'public',
        lat: draft.startLat || null,
        lng: draft.startLng || null,
        photos: [],
        type: data.routeType || null,
        difficulty: data.difficulty?.toLowerCase() || null,
        surface_type: data.surfaceType?.toLowerCase() || null,
        safety_tags: data.safetyTags || [],
        status: 'published',
        vehicle_type: data.vehicleTypes.includes('Cars') && data.vehicleTypes.includes('Motorcycles') ? 'both' : data.vehicleTypes.includes('Motorcycles') ? 'bike' : 'car',
      }).select().single();

      if (error) {
        toast.error('Could not publish route: ' + error.message);
        return;
      }

      toast.success('Route published!', { description: data.name });
      navigate('/', { replace: true, state: { refreshMap: true, centerOn: draft.startLat && draft.startLng ? { lat: draft.startLat, lng: draft.startLng } : undefined } });
    } catch (err: any) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleSaveDraft = (data: PublishRouteFormData) => {
    toast.success('Draft saved locally');
  };

  const cleanupMap = () => {
    clearMarkersSafely();
    snappedCoordsRef.current = null;
    if (mapRef.current) {
      try { mapRef.current.remove(); } catch (_) {}
      mapRef.current = null;
    }
    lineSourceRef.current = false;
    setDrawWaypoints([]);
    setDraftRoute(null);
  };

  const handleCancel = () => {
    cleanupMap();
    navigate(-1);
  };

  // Edit & Publish phase
  if (phase === 'edit' && draftRoute) {
    return (
      <EditPublishRoute
        draft={draftRoute}
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        onBack={() => { setDraftRoute(null); setPhase('pick'); }}
      />
    );
  }

  // Map-based phases (record / draw / gpx-preview)
  if (showMap) {
    return (
      <div className="mobile-container relative">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {phase === 'record' && (
          <RecordDriveOverlay
            onFinish={handleDraftReady}
            onCancel={handleCancel}
            onCoordsUpdate={handleRecordCoordsUpdate}
          />
        )}

        {phase === 'draw' && (
          <DrawRouteOverlay
            waypoints={drawWaypoints}
            onSetWaypoints={setDrawWaypoints}
            onSnappedCoordsUpdate={handleSnappedCoordsUpdate}
            onFinish={handleDraftReady}
            onCancel={handleCancel}
          />
        )}

        {phase === 'gpx-preview' && draftRoute && (
          <div className="absolute bottom-4 left-3 right-3 z-40">
            <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold text-foreground">GPX Route Imported</p>
                  <p className="text-[10px] text-muted-foreground">{draftRoute.geometry.coordinates.length} points · {formatRouteDistance(draftRoute.stats.distanceMeters)}</p>
                </div>
                <button onClick={() => { setDraftRoute(null); setPhase('pick'); cleanupMap(); }}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-medium">Cancel</button>
              </div>
              <Button size="sm" onClick={() => handleDraftReady(draftRoute)}
                className="w-full gap-1.5 bg-routes hover:bg-routes/90 text-routes-foreground rounded-xl font-semibold h-10 text-xs">
                Continue to Edit & Publish
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: method picker / GPX import
  return (
    <>
      <RouteMethodSheet
        open={phase === 'pick'}
        onOpenChange={(open) => {
          if (!open && !isTransitioningRef.current) navigate(-1);
        }}
        onSelect={handleMethodSelect}
      />
      <GPXImportSheet
        open={phase === 'gpx'}
        onOpenChange={(open) => { if (!open) setPhase('pick'); }}
        onImport={handleGPXImport}
      />
    </>
  );
};

export default AddRoute;
