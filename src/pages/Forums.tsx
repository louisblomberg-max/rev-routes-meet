import { useState } from 'react';
import { Search, Plus, MessageSquare, TrendingUp } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ForumPostCard from '@/components/forums/ForumPostCard';
import { mockForumPosts } from '@/data/forumData';

const Forums = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevant' | 'newest' | 'upvoted'>('relevant');

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

  const filteredPosts = mockForumPosts
    .filter(post => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'upvoted') return b.upvotes - a.upvotes;
      return (b.upvotes * 2 + b.comments) - (a.upvotes * 2 + a.comments);
    });

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 safe-top">
          <BackButton className="w-9 h-9 rounded-lg bg-card border border-border/50" iconClassName="w-4 h-4" />
          <h1 className="heading-md text-foreground flex-1">Advice & Forums</h1>
          <Button 
            size="sm" 
            className="gap-1.5 h-8"
            onClick={() => navigate('/forums/create')}
          >
            <Plus className="w-3.5 h-3.5" />
            Post
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search questions & topics..."
              className="pl-10 bg-card border-border/50 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 px-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              !selectedCategory 
                ? 'bg-foreground text-background border-foreground' 
                : 'bg-card text-muted-foreground border-border/50 hover:border-border'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === category.id 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-card text-muted-foreground border-border/50 hover:border-border'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Row */}
      <div className="px-4 py-2.5 flex items-center gap-1 border-b border-border/30">
        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground mr-1" />
        {sortOptions.map((option, i) => (
          <button
            key={option.id}
            onClick={() => setSortBy(option.id as typeof sortBy)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              sortBy === option.id 
                ? 'bg-muted text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-caption">{filteredPosts.length} posts</span>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="heading-sm text-foreground mb-1">No posts found</h3>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredPosts.map((post) => (
              <ForumPostCard 
                key={post.id} 
                post={post} 
                onClick={() => navigate(`/forums/thread/${post.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forums;