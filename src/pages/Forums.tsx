import { useState, useEffect } from 'react';
import { Search, Plus, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ForumPostCard from '@/components/forums/ForumPostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

const Forums = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevant' | 'newest' | 'upvoted'>('relevant');
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'mods', name: 'Mods & Tuning' },
    { id: 'troubleshooting', name: 'Troubleshooting' },
    { id: 'buying', name: 'Buying & Selling' },
    { id: 'track', name: 'Track & Motorsport' },
    { id: 'insurance', name: 'Insurance' },
  ];

  const sortOptions = [
    { id: 'relevant', label: 'Relevant' },
    { id: 'newest', label: 'Newest' },
    { id: 'upvoted', label: 'Top' },
  ];

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    let query = supabase.from('forum_posts').select('*, profiles(username, avatar_url, display_name)');
    if (selectedCategory) query = query.eq('category', selectedCategory);
    if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
    else if (sortBy === 'upvoted') query = query.order('upvotes', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error: err } = await query;
    if (err) { setError(err.message); setIsLoading(false); return; }
    setPosts((data || []).map((p: any) => ({
      id: p.id, title: p.title, body: p.body || '', type: p.type || 'discussion',
      category: p.category || 'general', clubId: p.club_id, clubName: undefined,
      author: p.profiles?.display_name || p.profiles?.username || 'Unknown',
      authorAvatar: p.profiles?.avatar_url, createdAt: p.created_at,
      upvotes: p.upvotes || 0, downvotes: 0, comments: p.comment_count || 0, images: p.photos || [],
    })));
    setIsLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [selectedCategory, sortBy]);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 safe-top">
          <BackButton className="w-9 h-9 rounded-lg bg-card border border-border/50" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'community'); navigate('/'); }} />
          <h1 className="heading-md text-foreground flex-1">Advice & Forums</h1>
          <Button size="sm" className="gap-1.5 h-8" onClick={() => navigate('/forums/create')}>
            <Plus className="w-3.5 h-3.5" /> Post
          </Button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search questions & topics..." className="pl-10 bg-card border-border/50 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-3 px-4 scrollbar-hide">
          <button onClick={() => setSelectedCategory(null)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${!selectedCategory ? 'bg-foreground text-background border-foreground' : 'bg-card text-muted-foreground border-border/50 hover:border-border'}`}>All</button>
          {categories.map((category) => (
            <button key={category.id} onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${selectedCategory === category.id ? 'bg-foreground text-background border-foreground' : 'bg-card text-muted-foreground border-border/50 hover:border-border'}`}>
              {category.name}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-2.5 flex items-center gap-1 border-b border-border/30">
        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground mr-1" />
        {sortOptions.map((option) => (
          <button key={option.id} onClick={() => setSortBy(option.id as typeof sortBy)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${sortBy === option.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {option.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-caption">{filteredPosts.length} posts</span>
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="divide-y divide-border/30">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 space-y-3">
                <div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
                <Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
            <h3 className="heading-sm text-foreground mb-1">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={fetchPosts}>Retry</Button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <span className="text-5xl mb-4">💬</span>
            <h3 className="text-[17px] font-medium text-foreground mb-1">No discussions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Be the first to start a conversation</p>
            <Button onClick={() => navigate('/forums/create')} style={{ backgroundColor: '#d30d37' }} className="text-white">
              Create Post
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredPosts.map((post) => (
              <ForumPostCard key={post.id} post={post} onClick={() => navigate(`/forums/thread/${post.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forums;
