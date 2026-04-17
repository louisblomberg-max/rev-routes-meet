import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function CommunityForumsView() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'upvoted'>('newest');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from('forum_posts')
        .select('*, profiles:user_id(display_name, avatar_url, username)');
      if (selectedCategory) query = query.eq('category', selectedCategory);
      if (sortBy === 'upvoted') query = query.order('upvotes', { ascending: false });
      else query = query.order('created_at', { ascending: false });
      query = query.limit(30);
      const { data } = await query;
      setPosts(data || []);
      setLoading(false);
    };
    load();
  }, [selectedCategory, sortBy]);

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const filteredPosts = searchQuery.trim()
    ? posts.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.body?.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  return (
    <div style={{ background: '#ECEAE4', minHeight: '100%', paddingBottom: 96 }}>
      {/* Search bar */}
      <div style={{ padding: '12px 16px 8px', position: 'relative' }}>
        <Search size={16} strokeWidth={2} color="#8C867E" style={{ position: 'absolute', left: 30, top: 24, zIndex: 1, pointerEvents: 'none' }} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search forums"
          style={{
            width: '100%',
            background: '#F2EFE9',
            border: 'none',
            borderRadius: 12,
            padding: '11px 14px 11px 38px',
            fontSize: 14,
            color: '#4A443D',
            outline: 'none',
          }}
        />
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, padding: '4px 16px 12px' }}>
        <button
          onClick={() => {
            const cats: (string | null)[] = [null, 'general', 'mods', 'troubleshooting', 'buying', 'track', 'insurance'];
            const idx = cats.indexOf(selectedCategory);
            setSelectedCategory(cats[(idx + 1) % cats.length]);
          }}
          style={{
            flex: 1,
            background: '#FFFFFF',
            border: '1px solid #E8E4DC',
            borderRadius: 12,
            padding: '8px 11px',
            textAlign: 'left' as const,
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 10, color: '#8C867E', fontWeight: 700, letterSpacing: '0.4px' }}>CATEGORY</div>
          <div style={{ fontSize: 12, color: '#111', fontWeight: 700, marginTop: 2 }}>{selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All'} &#9662;</div>
        </button>
        <button
          onClick={() => setSortBy(prev => prev === 'newest' ? 'upvoted' : 'newest')}
          style={{
            flex: 1,
            background: '#FFFFFF',
            border: '1px solid #E8E4DC',
            borderRadius: 12,
            padding: '8px 11px',
            textAlign: 'left' as const,
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 10, color: '#8C867E', fontWeight: 700, letterSpacing: '0.4px' }}>SORT</div>
          <div style={{ fontSize: 12, color: '#111', fontWeight: 700, marginTop: 2 }}>{sortBy === 'newest' ? 'New' : 'Top'} &#9662;</div>
        </button>
        <button
          style={{
            flex: 1,
            background: '#FFFFFF',
            border: '1px solid #E8E4DC',
            borderRadius: 12,
            padding: '8px 11px',
            textAlign: 'left' as const,
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 10, color: '#8C867E', fontWeight: 700, letterSpacing: '0.4px' }}>TIME</div>
          <div style={{ fontSize: 12, color: '#111', fontWeight: 700, marginTop: 2 }}>Week &#9662;</div>
        </button>
      </div>

      {/* Section label */}
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#B0A89E',
        letterSpacing: '0.6px', textTransform: 'uppercase' as const,
        padding: '0 16px', marginBottom: 8,
      }}>All threads</div>

      {/* Thread list */}
      {loading ? (
        [1, 2, 3].map((i) => (
          <div key={i} style={{ background: '#F0EDE6', borderRadius: 16, height: 100, margin: '0 16px 8px' }} />
        ))
      ) : filteredPosts.length === 0 ? (
        <p style={{ fontSize: 14, color: '#8C867E', padding: '32px 16px', textAlign: 'center' }}>
          No threads yet. Start the conversation.
        </p>
      ) : (
        filteredPosts.map((post) => {
          const author = post.profiles || {};
          const initials = (author.display_name || author.username || '?')[0].toUpperCase();
          return (
            <button
              key={post.id}
              onClick={() => navigate(`/forums/thread/${post.id}`)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E4DC',
                borderRadius: 16,
                padding: 12,
                cursor: 'pointer',
                textAlign: 'left' as const,
                width: 'calc(100% - 32px)',
                marginLeft: 16,
                marginRight: 16,
                marginBottom: 8,
                display: 'block',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: '#CC2B2B',
                  backgroundImage: author.avatar_url ? `url(${author.avatar_url})` : undefined,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>
                  {!author.avatar_url && initials}
                </div>
                <span style={{ fontSize: 12, color: '#4A443D', fontWeight: 600 }}>
                  {author.display_name || author.username || 'User'}
                </span>
                <span style={{ fontSize: 11, color: '#8C867E' }}>· {timeAgo(post.created_at)}</span>
                <span style={{ marginLeft: 'auto' }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#4A443D',
                  background: '#F2EFE9', padding: '2px 8px', borderRadius: 5,
                  letterSpacing: '0.3px', textTransform: 'uppercase' as const,
                }}>
                  {post.category || 'GENERAL'}
                </span>
              </div>

              {/* Title */}
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.3 }}>
                {post.title}
              </div>

              {/* Bottom meta */}
              <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 12, color: '#8C867E' }}>
                <span>&#9650; <span style={{ fontWeight: 600 }}>{post.upvote_count || 0}</span></span>
                <span>{post.reply_count || 0} replies</span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
