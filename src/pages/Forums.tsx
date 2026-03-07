import { useState } from 'react';
import { Search, Plus, MessageSquare, TrendingUp } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
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
      <div className="sticky top-0 bg-background/95 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3 px-5 pt-14 pb-3 safe-top">
          <BackButton className="w-10 h-10 rounded-full bg-card shadow-soft" iconClassName="w-4 h-4" />
          <h1 className="text-xl font-bold text-foreground flex-1">Advice & Forums</h1>
          <Button
            size="sm"
            className="gap-1.5 h-10 rounded-[14px] px-5"
            onClick={() => navigate('/forums/create')}
          >
            <Plus className="w-3.5 h-3.5" />
            Post
          </Button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search questions & topics..."
              className="w-full h-12 pl-10 pr-4 bg-card rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-soft"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 px-5 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Row */}
      <div className="px-5 py-3 flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground mr-1" />
        {sortOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSortBy(option.id as typeof sortBy)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
              sortBy === option.id
                ? 'bg-card text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium">{filteredPosts.length} posts</span>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto pb-20 px-5">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mb-4 shadow-soft">
              <MessageSquare className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No posts found</h3>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div key={post.id}>
                <ForumPostCard
                  post={post}
                  onClick={() => navigate(`/forums/thread/${post.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forums;
