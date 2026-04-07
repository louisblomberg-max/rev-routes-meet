import { useState, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  type: 'event' | 'route' | 'service' | 'club' | 'user';
  title: string;
  subtitle: string;
  lat?: number;
  lng?: number;
  isFree?: boolean;
  image?: string;
  date?: string;
}

interface UniversalSearchProps {
  onSelectPin: (id: string, lat: number, lng: number, type: string) => void;
  variant?: 'mobile' | 'desktop';
}

const UniversalSearch = ({ onSelectPin, variant = 'mobile' }: UniversalSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setIsOpen(false); return; }
    setIsLoading(true);
    setIsOpen(true);

    const kw = q.replace(/[%_'"\\]/g, ' ').trim().slice(0, 100);
    if (!kw) { setResults([]); setIsLoading(false); return; }
    const allResults: SearchResult[] = [];

    try {
      await Promise.all([
        supabase.from('events')
          .select('id, title, type, event_types, location, date_start, is_free, lat, lng, banner_url')
          .eq('status', 'published').eq('visibility', 'public')
          .or(`title.ilike.%${kw}%,location.ilike.%${kw}%`)
          .limit(4)
          .then(({ data }) => (data || []).forEach(e => allResults.push({
            id: e.id, type: 'event',
            title: e.title || 'Event',
            subtitle: `${e.event_types?.[0] || e.type || 'Event'} · ${e.location || ''}${e.is_free ? ' · Free' : ''}`,
            lat: e.lat ? Number(e.lat) : undefined, lng: e.lng ? Number(e.lng) : undefined,
            isFree: e.is_free, image: e.banner_url, date: e.date_start,
          }))),

        supabase.from('routes')
          .select('id, name, type, lat, lng, difficulty')
          .eq('visibility', 'public')
          .or(`name.ilike.%${kw}%`)
          .limit(3)
          .then(({ data }) => (data || []).forEach(r => allResults.push({
            id: r.id, type: 'route',
            title: r.name || 'Route',
            subtitle: `Route · ${r.type || ''} · ${r.difficulty || ''}`,
            lat: r.lat ? Number(r.lat) : undefined, lng: r.lng ? Number(r.lng) : undefined,
          }))),

        supabase.from('services')
          .select('id, name, service_type, address, lat, lng')
          .eq('visibility', 'public')
          .or(`name.ilike.%${kw}%,address.ilike.%${kw}%`)
          .limit(3)
          .then(({ data }) => (data || []).forEach(s => allResults.push({
            id: s.id, type: 'service',
            title: s.name || 'Service',
            subtitle: `${s.service_type || 'Service'} · ${s.address || ''}`,
            lat: s.lat ? Number(s.lat) : undefined, lng: s.lng ? Number(s.lng) : undefined,
          }))),

        supabase.from('clubs')
          .select('id, name, club_type, location, logo_url, member_count')
          .or(`name.ilike.%${kw}%,location.ilike.%${kw}%`)
          .limit(3)
          .then(({ data }) => (data || []).forEach(c => allResults.push({
            id: c.id, type: 'club',
            title: c.name || 'Club',
            subtitle: `Club · ${c.club_type || ''} · ${c.member_count || 0} members`,
            image: c.logo_url,
          }))),

        supabase.from('profiles')
          .select('id, display_name, username, avatar_url, location')
          .or(`display_name.ilike.%${kw}%,username.ilike.%${kw}%`)
          .limit(3)
          .then(({ data }) => (data || []).forEach(u => allResults.push({
            id: u.id, type: 'user',
            title: u.display_name || u.username || 'User',
            subtitle: `@${u.username || ''} · ${u.location || ''}`,
            image: u.avatar_url,
          }))),
      ]);
      setResults(allResults);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => runSearch(val), 300);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleResultTap = (result: SearchResult) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (['event', 'route', 'service'].includes(result.type) && result.lat && result.lng) {
      onSelectPin(result.id, result.lat, result.lng, result.type + 's');
    } else if (result.type === 'club') {
      navigate(`/club/${result.id}`);
    } else if (result.type === 'user') {
      navigate(`/profile/${result.id}`);
    }
  };

  const clear = () => { setQuery(''); setResults([]); setIsOpen(false); };

  const icons: Record<string, string> = { event: '📅', route: '🗺️', service: '🔧', club: '🏎️', user: '👤' };
  const typeColors: Record<string, string> = { event: '#d30d37', route: '#4f7fff', service: '#ff8000', club: '#8b5cf6', user: '#10b981' };
  const typeLabels: Record<string, string> = { event: 'Event', route: 'Route', service: 'Service', club: 'Club', user: 'Person' };

  return (
    <div className="relative flex-1 min-w-0">
      <div className={`flex items-center gap-2 ${variant === 'mobile' ? 'h-10 bg-white/90 backdrop-blur-md rounded-xl px-3 border border-black/20 shadow-sm' : 'px-2'}`}>
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder={variant === 'mobile' ? 'Search events, routes, services...' : 'Search...'}
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={clear} className="p-0.5">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <>
          <div className="fixed inset-0 z-[10000]" onClick={clear} />
          <div
            className="absolute top-full left-0 right-0 bg-white dark:bg-card rounded-2xl shadow-2xl mt-1 z-[10001] overflow-hidden border border-border/30"
            style={{ minWidth: variant === 'desktop' ? 480 : undefined, maxHeight: '60vh', overflowY: 'auto' }}
          >
            {isLoading && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-4 h-4 border-2 border-[#d30d37] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Searching...</p>
              </div>
            )}

            {!isLoading && results.length === 0 && (
              <div className="px-4 py-4 text-center">
                <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
              </div>
            )}

            {results.map((result, i) => (
              <button
                key={`${result.id}-${i}`}
                onClick={() => handleResultTap(result)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 text-left transition-colors border-b border-border/10 last:border-0 active:bg-muted/60"
              >
                <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center bg-muted text-lg">
                  {result.image ? <img src={result.image} className="w-full h-full object-cover" alt="" /> : icons[result.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{result.subtitle}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `${typeColors[result.type]}15`, color: typeColors[result.type] }}>
                  {typeLabels[result.type]}
                </span>
              </button>
            ))}

            {!isLoading && results.length > 0 && (
              <div className="px-4 py-2 border-t border-border/20 bg-muted/20">
                <p className="text-[10px] text-muted-foreground text-center">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UniversalSearch;
