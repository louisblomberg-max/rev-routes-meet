import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin, Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface LocationPickerProps {
  value: string;
  onChange: (location: string, coords?: { lat: number; lng: number }) => void;
  error?: string;
}

interface GeoResult {
  place_name: string;
  center: [number, number];
}

const LocationPicker = ({ value, onChange, error }: LocationPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Init map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-1.8, 51.5],
      zoom: 9,
      attributionControl: false,
      interactive: true,
    });

    // Click to place pin
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      placeMarker(lng, lat);
      reverseGeocode(lng, lat);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const placeMarker = useCallback((lng: number, lat: number) => {
    if (!map.current) return;
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }
    setCoords({ lat, lng });
  }, []);

  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await res.json();
      if (data.features?.[0]) {
        const name = data.features[0].place_name;
        setQuery(name);
        onChange(name, { lat, lng });
      }
    } catch {
      // silently fail
    }
  };

  const searchLocations = async (text: string) => {
    if (text.length < 3) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&limit=5&country=gb`
      );
      const data = await res.json();
      setResults(data.features || []);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocations(text), 350);
  };

  const selectResult = (result: GeoResult) => {
    const [lng, lat] = result.center;
    setQuery(result.place_name);
    onChange(result.place_name, { lat, lng });
    setShowResults(false);
    setResults([]);

    placeMarker(lng, lat);
    map.current?.flyTo({ center: [lng, lat], zoom: 14, duration: 1200 });
  };

  const clearLocation = () => {
    setQuery('');
    onChange('', undefined);
    setCoords(null);
    setResults([]);
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
  };

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search for a location..."
          className="pl-10 pr-10"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
        {!isSearching && query && (
          <button
            onClick={clearLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {showResults && results.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => selectResult(r)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors border-b border-border/30 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground line-clamp-2">{r.place_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border relative">
        <div ref={mapContainer} className="w-full h-44" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default LocationPicker;
