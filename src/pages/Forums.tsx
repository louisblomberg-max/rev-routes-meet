import { useState } from 'react';
import { ArrowLeft, Search, Plus, MessageSquare, HelpCircle, Lightbulb } from 'lucide-react';
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
    { id: 'general', name: 'General', color: 'bg-muted text-foreground' },
    { id: 'mods', name: 'Mods & Tuning', color: 'bg-routes text-white' },
    { id: 'troubleshooting', name: 'Troubleshooting', color: 'bg-events text-white' },
    { id: 'buying', name: 'Buying & Selling', color: 'bg-primary text-primary-foreground' },
    { id: 'track', name: 'Track & Motorsport', color: 'bg-clubs text-white' },
    { id: 'insurance', name: 'Insurance & Ownership', color: 'bg-services text-foreground' },
  ];

  const sortOptions = [
    { id: 'relevant', label: 'Most relevant' },
    { id: 'newest', label: 'Newest' },
    { id: 'upvoted', label: 'Most upvoted' },
  ];

  // Filter and sort posts
  const filteredPosts = mockForumPosts
    .filter(post => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'upvoted') {
        return b.upvotes - a.upvotes;
      }
      // Most relevant - combination of upvotes and recency
      return (b.upvotes * 2 + b.comments) - (a.upvotes * 2 + a.comments);
    });

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 safe-top sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center border border-border/50"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Advice & Forums</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search questions, topics, or keywords"
            className="pl-10 bg-card border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Create Post Button */}
        <Button 
          onClick={() => navigate('/forums/create')}
          className="w-full mb-3 gap-2"
        >
          <Plus className="w-4 h-4" />
          Ask a question / Create post
        </Button>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory 
                ? 'bg-foreground text-background' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id 
                  ? category.color 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="px-4 py-2 flex gap-2 border-b border-border/30">
        {sortOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSortBy(option.id as typeof sortBy)}
            className={`text-sm font-medium transition-colors ${
              sortBy === option.id 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No posts found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
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
