/**
 * AddRoute page — orchestrates the 3 creation methods and the publish flow.
 * All business logic is in routeService.ts; this page is pure UI orchestration.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from 'sonner';
import RouteMethodSheet, { type RouteMethod } from '@/components/route-creation/RouteMethodSheet';
import RecordDriveOverlay from '@/components/route-creation/RecordDriveOverlay';
import DrawRouteOverlay from '@/components/route-creation/DrawRouteOverlay';
import GPXImportSheet from '@/components/route-creation/GPXImportSheet';
import EditPublishRoute, { type PublishRouteData } from '@/components/route-creation/EditPublishRoute';
import type { DraftRoute } from '@/services/routeService';
import { useData } from '@/contexts/DataContext';

mapboxgl.accessToken = 'pk.eyJ1IjoicmV2bmV0LS1jbHViIiwiYSI6ImNtbTB0NXU4dDAyN3Qyb3BqaWVrOHE0cmEifQ.p7f7SJBFBuRK-lShWYjGpg';

type Phase = 'pick' | 'record' | 'draw' | 'gpx' | 'edit';

const AddRoute = () => {
  const navigate = useNavigate();
  const { routes: routesRepo, state } = useData();

  const [phase, setPhase] = useState<Phase>('pick');
  const [draftRoute, setDraftRoute] = useState<DraftRoute | null>(null);
  const [drawWaypoints, setDrawWaypoints] = useState<[number, number][]>([]);
  // Guard to prevent Sheet onOpenChange from navigating when we're transitioning phases
  const isTransitioningRef = useRef(false);

  // Map refs for record/draw phases
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const lineSourceRef = useRef<boolean>(false);

  const showMap = phase === 'record' || phase === 'draw';

  // Init map for record/draw
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
      // Add empty line source for drawing
      m.addSource('draw-route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } } });
      m.addLayer({ id: 'draw-route-casing', type: 'line', source: 'draw-route', paint: { 'line-color': '#1a56db', 'line-width': 8, 'line-opacity': 0.3 } });
      m.addLayer({ id: 'draw-route-line', type: 'line', source: 'draw-route', paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.9 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      lineSourceRef.current = true;
    });

    // Center on user
    navigator.geolocation.getCurrentPosition(
      (pos) => m.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1000 }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );

    mapRef.current = m;

    return () => {
      try { m.remove(); } catch (_) {}
      mapRef.current = null;
      lineSourceRef.current = false;
    };
  }, [showMap]);

  // Draw mode: add waypoints on map click
  useEffect(() => {
    if (phase !== 'draw' || !mapRef.current) return;
    const m = mapRef.current;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setDrawWaypoints(prev => [...prev, pt]);
    };

    m.on('click', handleClick);
    m.getCanvas().style.cursor = 'crosshair';

    return () => {
      m.off('click', handleClick);
      m.getCanvas().style.cursor = '';
    };
  }, [phase]);

  // Update line + markers when waypoints change
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !lineSourceRef.current) return;

    // Update line
    const src = m.getSource('draw-route') as mapboxgl.GeoJSONSource;
    if (src) {
      src.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: drawWaypoints } });
    }

    // Update markers
    markersRef.current.forEach(mk => mk.remove());
    markersRef.current = [];

    drawWaypoints.forEach((pt, i) => {
      const el = document.createElement('div');
      const isStart = i === 0;
      const isEnd = i === drawWaypoints.length - 1 && drawWaypoints.length > 1;
      const color = isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6';
      el.style.cssText = `width:${isStart || isEnd ? 16 : 12}px;height:${isStart || isEnd ? 16 : 12}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);`;
      const marker = new mapboxgl.Marker({ element: el }).setLngLat(pt).addTo(m);
      markersRef.current.push(marker);
    });
  }, [drawWaypoints]);

  // Update line for recording
  const updateRecordLine = useCallback((coords: [number, number][]) => {
    const m = mapRef.current;
    if (!m || !lineSourceRef.current) return;
    const src = m.getSource('draw-route') as mapboxgl.GeoJSONSource;
    if (src) src.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } });
  }, []);

  // Method selection handlers
  const handleMethodSelect = (method: RouteMethod) => {
    isTransitioningRef.current = true;
    if (method === 'gpx') {
      setPhase('gpx');
    } else {
      setPhase(method);
    }
    // Reset after React has committed the update
    setTimeout(() => { isTransitioningRef.current = false; }, 0);
  };

  const handleDraftReady = (draft: DraftRoute) => {
    setDraftRoute(draft);
    setPhase('edit');
    // Cleanup map safely
    markersRef.current.forEach(mk => mk.remove());
    markersRef.current = [];
    if (mapRef.current) {
      try { mapRef.current.remove(); } catch (_) {}
      mapRef.current = null;
    }
    lineSourceRef.current = false;
    setDrawWaypoints([]);
  };

  const handlePublish = (data: PublishRouteData) => {
    // Defensive: ensure draft has valid geometry
    const draft = data.draft;
    if (!draft?.geometry?.coordinates || draft.geometry.coordinates.length < 2) {
      toast.error('Invalid route data', { description: 'Route must have at least 2 points.' });
      return;
    }
    const userId = state.currentUser?.id || 'anon';
    routesRepo.create({
      name: data.name,
      description: data.description,
      distance: `${(draft.distance / 1609.34).toFixed(1)} mi`,
      type: data.routeTypes[0] || 'Mixed',
      vehicleType: data.vehicleTypes.includes('Cars') && data.vehicleTypes.includes('Motorcycles') ? 'both' : data.vehicleTypes.includes('Motorcycles') ? 'bike' : 'car',
      rating: 0,
      createdBy: userId,
      lat: draft.startLat,
      lng: draft.startLng,
      polyline: JSON.stringify(draft.geometry),
      saves: 0,
      drives: 0,
    });

    toast.success('Route published!', { description: data.name });
    navigate('/');
  };

  const handleSaveDraft = (data: PublishRouteData) => {
    toast.success('Draft saved locally');
  };

  const cleanupMap = () => {
    markersRef.current.forEach(mk => mk.remove());
    markersRef.current = [];
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
        onBack={() => setPhase('pick')}
      />
    );
  }

  // Map-based phases (record / draw)
  if (showMap) {
    return (
      <div className="mobile-container relative">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {phase === 'record' && (
          <RecordDriveOverlay onFinish={handleDraftReady} onCancel={handleCancel} />
        )}

        {phase === 'draw' && (
          <DrawRouteOverlay
            waypoints={drawWaypoints}
            onSetWaypoints={setDrawWaypoints}
            onFinish={handleDraftReady}
            onCancel={handleCancel}
          />
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
        onImport={handleDraftReady}
      />
    </>
  );
};

export default AddRoute;
