import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const context = searchParams.get('context') || 'all';
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const all: any[] = [];

    if (context === 'all' || context === 'clubs') {
      const { data } = await supabase.from('clubs').select('id, name, member_count, logo_url, club_type, location')
        .eq('visibility', 'public').or(`name.ilike.%${q}%,description.ilike.%${q}%`).limit(10);
      (data || []).forEach(d => all.push({ ...d, _type: 'club' }));
    }
    if (context === 'all' || context === 'forums') {
      const { data } = await supabase.from('forum_posts').select('id, title, category, created_at, upvotes, comment_count')
        .or(`title.ilike.%${q}%,body.ilike.%${q}%`).order('created_at', { ascending: false }).limit(10);
      (data || []).forEach(d => all.push({ ...d, _type: 'forum' }));
    }
    if (context === 'all' || context === 'messages') {
      const { data } = await supabase.from('messages').select('id, content, conversation_id, created_at')
        .ilike('content', `%${q}%`).order('created_at', { ascending: false }).limit(10);
      (data || []).forEach(d => all.push({ ...d, _type: 'message' }));
    }
    setResults(all);
    setLoading(false);
  };

  return (
    <div className="mobile-container min-h-screen md:max-w-2xl md:mx-auto" style={{ background: '#ECEAE4' }}>
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #F0F0F0', padding: '12px 16px', paddingTop: 'max(env(safe-area-inset-top), 12px)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
          <ArrowLeft size={22} color="#555" />
        </button>
        <div style={{ flex: 1, position: 'relative' }}>
          <SearchIcon size={16} color="#999" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            autoFocus
            value={query}
            onChange={e => { setQuery(e.target.value); handleSearch(e.target.value); }}
            placeholder={`Search ${context === 'all' ? 'everything' : context}...`}
            style={{ width: '100%', background: '#F5F5F5', border: 'none', borderRadius: 12, padding: '11px 14px 11px 38px', fontSize: 15, color: '#111', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {loading && <p style={{ color: '#999', fontSize: 14 }}>Searching...</p>}
        {!loading && query && results.length === 0 && (
          <p style={{ color: '#999', fontSize: 14, textAlign: 'center', paddingTop: 32 }}>No results for "{query}"</p>
        )}
        {results.map((r, i) => (
          <button
            key={`${r._type}-${r.id}-${i}`}
            onClick={() => {
              if (r._type === 'club') navigate(`/club/${r.id}`);
              else if (r._type === 'forum') navigate(`/forums/thread/${r.id}`);
              else if (r._type === 'message') navigate(`/messages/${r.conversation_id}`);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#FFFFFF', border: '1px solid #F0F0F0', borderRadius: 14, padding: 12, marginBottom: 8, cursor: 'pointer', textAlign: 'left' as const }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: r._type === 'club' ? '#CC2B2B' : r._type === 'forum' ? '#1D4ED8' : '#16803D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {r._type === 'club' ? '\u{1F3C1}' : r._type === 'forum' ? '\u{1F4AC}' : '\u{2709}\u{FE0F}'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                {r.name || r.title || (r.content?.slice(0, 60) + '...')}
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2, textTransform: 'capitalize' as const }}>
                {r._type}{r.member_count ? ` \u00B7 ${r.member_count} members` : ''}{r.category ? ` \u00B7 ${r.category}` : ''}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
