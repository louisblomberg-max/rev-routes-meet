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
}

interface UniversalSearchProps {
  onSelectPin: (id: string, lat: number, lng: number, type: string) => void;
  variant?: 'mobile' | 'desktop';
}

const EVENT_WORDS = ['event', 'meet', 'show', 'cruise', 'rally', 'track', 'drive', 'gathering', 'run'];
const ROUTE_WORDS = ['route', 'drive', 'road', 'scenic', 'coastal', 'tour', 'journey', 'trip'];
const SERVICE_WORDS = ['garage', 'mechanic', 'service', 'repair', 'tyre', 'tire', 'mot', 'bodywork', 'detailing', 'tuning', 'parts'];
const CLUB_WORDS = ['club', 'group', 'community', 'owners'];
const USER_WORDS = ['user', 'person', 'find', 'profile', 'member'];

const parseQuery = (query: string) => {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);
  const categories: string[] = [];
  if (words.some(w => EVENT_WORDS.includes(w))) categories.push('events');
  if (words.some(w => ROUTE_WORDS.includes(w))) categories.push('routes');
  if (words.some(w => SERVICE_WORDS.includes(w))) categories.push('services');
  if (words.some(w => CLUB_WORDS.includes(w))) categories.push('clubs');
  if (words.some(w => USER_WORDS.includes(w))) categories.push('users');
  if (categories.length === 0) categories.push('events', 'routes', 'services', 'clubs', 'users');
  return { categories, keywords: words, isFree: q.includes('free') };
};

const buildFilter = (fields: string[], kws: string[]) => {
  const conditions: string[] = [];
  for (const field of fields) {
    for (const kw of kws.slice(0, 3)) {
      conditions.push(`${field}.ilike.%${kw}%`);
    }
  }
  return conditions.join(',');
};

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

    try {
      const { categories, keywords, isFree } = parseQuery(q);
      const allResults: SearchResult[] = [];
      const queries: Promise<void>[] = [];

      if (categories.includes('events')) {
        queries.push((async () => {
          let qb = supabase.from('events').select('id, title, type, location, date_start, is_free, lat, lng, banner_url').eq('status', 'published').eq('visibility', 'public').limit(5);
          const filter = buildFilter(['title', 'location'], keywords);
          if (filter) qb = qb.or(filter);
          if (isFree) qb = qb.eq('is_free', true);
          const { data } = await qb;
          (data || []).forEach(e => allResults.push({ id: e.id, type: 'event', title: e.title || 'Event', subtitle: `${e.type || 'Event'} · ${e.location || ''}`, lat: e.lat ? Number(e.lat) : undefined, lng: e.lng ? Number(e.lng) : undefined, isFree: e.is_free, image: e.banner_url }));
        })());
      }

      if (categories.includes('routes')) {
        queries.push((async () => {
          let qb = supabase.from('routes').select('id, name, type, lat, lng, difficulty').eq('visibility', 'public').limit(5);
          const filter = buildFilter(['name'], keywords);
          if (filter) qb = qb.or(filter);
          const { data } = await qb;
          (data || []).forEach(r => allResults.push({ id: r.id, type: 'route', title: r.name || 'Route', subtitle: `Route · ${r.type || ''} · ${r.difficulty || ''}`, lat: r.lat ? Number(r.lat) : undefined, lng: r.lng ? Number(r.lng) : undefined }));
        })());
      }

      if (categories.includes('services')) {
        queries.push((async () => {
          let qb = supabase.from('services').select('id, name, service_type, address, lat, lng').eq('visibility', 'public').limit(5);
          const filter = buildFilter(['name', 'address'], keywords);
          if (filter) qb = qb.or(filter);
          const { data } = await qb;
          (data || []).forEach(s => allResults.push({ id: s.id, type: 'service', title: s.name || 'Service', subtitle: `Service · ${s.service_type || ''} · ${s.address || ''}`, lat: s.lat ? Number(s.lat) : undefined, lng: s.lng ? Number(s.lng) : undefined }));
        })());
      }

      if (categories.includes('clubs')) {
        queries.push((async () => {
          let qb = supabase.from('clubs').select('id, name, club_type, member_count, logo_url').limit(5);
          const filter = buildFilter(['name', 'description'], keywords);
          if (filter) qb = qb.or(filter);
          const { data } = await qb;
          (data || []).forEach(c => allResults.push({ id: c.id, type: 'club', title: c.name || 'Club', subtitle: `Club · ${c.club_type || ''} · ${c.member_count || 0} members`, image: c.logo_url }));
        })());
      }

      if (categories.includes('users')) {
        queries.push((async () => {
          let qb = supabase.from('profiles').select('id, display_name, username, avatar_url, location').limit(5);
          const filter = buildFilter(['display_name', 'username'], keywords);
          if (filter) qb = qb.or(filter);
          const { data } = await qb;
          (data || []).forEach(u => allResults.push({ id: u.id, type: 'user', title: u.display_name || u.username || 'User', subtitle: `@${u.username || ''} · ${u.location || ''}`, image: u.avatar_url }));
        })());
      }

      await Promise.all(queries);
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
      debounceRef.current = setTimeout(() => runSearch(val), 400);
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

  const labels: Record<string, string> = { event: 'Events', route: 'Routes', service: 'Services', club: 'Clubs', user: 'People' };
  const colors: Record<string, string> = { event: '#d30d37', route: '#4f7fff', service: '#ff8000', club: '#8b5cf6', user: '#10b981' };
  const emojis: Record<string, string> = { event: '📅', route: '🗺️', service: '🔧', club: '🏎️', user: '👤' };

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
          <div className="fixed inset-0 z-[9998]" onClick={clear} />
          <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-2xl shadow-xl mt-2 z-[9999] max-h-[70vh] overflow-y-auto" style={{ minWidth: variant === 'desktop' ? 440 : undefined }}>
            {isLoading && (
              <div className="px-4 py-4 text-center">
                <div className="w-5 h-5 border-2 border-[#d30d37] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">Searching...</p>
              </div>
            )}

            {!isLoading && results.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">No results found</p>
              </div>
            )}

            {['event', 'route', 'service', 'club', 'user'].map(type => {
              const typeResults = results.filter(r => r.type === type);
              if (typeResults.length === 0) return null;
              return (
                <div key={type}>
                  <div className="px-4 py-1.5 bg-muted/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors[type] }}>{labels[type]}</p>
                  </div>
                  {typeResults.map(result => (
                    <button key={result.id} onClick={() => handleResultTap(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left border-b border-border/20 last:border-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                        {result.image ? <img src={result.image} className="w-full h-full object-cover" alt="" /> : <span className="text-lg">{emojis[type]}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      {result.isFree && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Free</span>}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default UniversalSearch;
