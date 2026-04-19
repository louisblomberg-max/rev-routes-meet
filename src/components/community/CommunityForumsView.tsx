import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function CommunityForumsView() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'all', sort: 'newest', time: 'all' });

  const filterOptions = {
    category: [
      { value: 'all', label: 'All Categories' },
      { value: 'general', label: 'General' },
      { value: 'mods', label: 'Mods & Tuning' },
      { value: 'troubleshooting', label: 'Troubleshooting' },
      { value: 'buying', label: 'Buying & Selling' },
      { value: 'track', label: 'Track & Motorsport' },
      { value: 'insurance', label: 'Insurance' },
    ],
    sort: [
      { value: 'newest', label: 'Newest' },
      { value: 'upvoted', label: 'Top Rated' },
    ],
    time: [
      { value: 'all', label: 'All Time' },
      { value: 'day', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
    ],
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from('forum_posts').select('*, profiles:user_id(display_name, avatar_url, username)');
      if (filters.category !== 'all') query = query.eq('category', filters.category);
      if (filters.sort === 'upvoted') query = query.order('upvotes', { ascending: false });
      else query = query.order('created_at', { ascending: false });
      query = query.limit(30);
      const { data } = await query;
      setPosts(data || []);
      setLoading(false);
    };
    load();
  }, [filters.category, filters.sort]);

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const filtered = searchQuery.trim()
    ? posts.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.body?.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  const selectStyle: React.CSSProperties = {
    background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 8,
    padding: '8px 28px 8px 10px', fontSize: 13, fontWeight: 600, color: '#111',
    cursor: 'pointer', outline: 'none', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238C867E'%3E%3Cpath d='M7 10l5 5 5-5H7z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '14px',
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100%', paddingBottom: 96 }}>
      <div style={{ background: '#FFFFFF', padding: 16, borderBottom: '1px solid #F0F0F0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>Forum</h2>
          <button
            onClick={() => navigate('/forums/create')}
            style={{
              background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 22,
              padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 6px rgba(204,43,43,0.28)',
            }}
          >
            <Plus size={16} /> New Topic
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={18} color="#999" style={{ position: 'absolute', left: 14, top: 13 }} />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search discussions..."
            style={{ width: '100%', background: '#F7F7F7', border: '1px solid #F0F0F0', borderRadius: 12, padding: '12px 16px 12px 44px', fontSize: 15, color: '#111', outline: 'none' }}
          />
        </div>

        {/* Dropdown filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(Object.entries(filterOptions) as [string, { value: string; label: string }[]][]).map(([key, options]) => (
            <select key={key} value={filters[key as keyof typeof filters]} onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...selectStyle, flex: 1 }}>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div style={{ padding: '12px 16px' }}>
        {loading ? [1, 2, 3].map(i => (
          <div key={i} style={{ background: '#F7F7F7', borderRadius: 16, height: 96, marginBottom: 12 }} />
        )) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#999' }}>
            <MessageSquare size={48} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>No discussions yet</p>
            <p style={{ margin: '4px 0 0', fontSize: 13 }}>Start the first conversation!</p>
          </div>
        ) : filtered.map(post => {
          const author = post.profiles || {};
          const initials = (author.display_name || author.username || '?')[0].toUpperCase();
          return (
            <button key={post.id} onClick={() => navigate(`/forums/thread/${post.id}`)} style={{
              width: '100%', background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: 16,
              padding: 14, cursor: 'pointer', textAlign: 'left' as const, marginBottom: 12, display: 'block',
            }} className="hover:shadow-md transition-shadow">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0, backgroundColor: '#CC2B2B',
                  backgroundImage: author.avatar_url ? `url(${author.avatar_url})` : undefined,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff',
                }}>{!author.avatar_url && initials}</div>
                <span style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>{author.display_name || author.username || 'User'}</span>
                <span style={{ fontSize: 12, color: '#999' }}>· {timeAgo(post.created_at)}</span>
                <span style={{ marginLeft: 'auto' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#555', background: '#F2EFE9', padding: '3px 8px', borderRadius: 5, letterSpacing: '0.3px', textTransform: 'uppercase' as const }}>{post.category || 'general'}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.35, marginBottom: 10 }}>{post.title}</div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#999' }}>
                <span>▲ <span style={{ fontWeight: 600 }}>{post.upvotes || 0}</span></span>
                <span>{post.comment_count || 0} replies</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
