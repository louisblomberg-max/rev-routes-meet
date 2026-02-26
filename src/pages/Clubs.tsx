import { useState } from 'react';
import { ArrowLeft, Search, Users, Check, ChevronRight, MapPin, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockClubs } from '@/data/mockData';

const Clubs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
  const [searchQuery, setSearchQuery] = useState('');

  const myClubs = mockClubs.filter(club => club.joined);
  const discoverClubs = mockClubs.filter(club => !club.joined);

  const filteredClubs = activeTab === 'my' 
    ? myClubs.filter(club => club.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : discoverClubs.filter(club => club.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 safe-top">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="heading-md text-foreground flex-1">Clubs</h1>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50 h-9 text-sm"
            />
          </div>
        </div>

        {/* Segmented Toggle */}
        <div className="px-4 pb-3">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'my'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              My Clubs ({myClubs.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              Discover ({discoverClubs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Club List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'discover' && (
          <div className="px-4 pt-3">
            <p className="text-label">Popular near you</p>
          </div>
        )}
        
        <div className="px-4 py-3 space-y-2.5">
          {filteredClubs.map((club) => (
            <button
              key={club.id}
              onClick={() => navigate(`/club/${club.id}`)}
              className="w-full bg-card rounded-xl p-3.5 flex items-center gap-3.5 text-left border border-border/50 hover:border-border active:scale-[0.99] transition-all duration-200"
            >
              {/* Club Avatar */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-clubs to-clubs/60 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">
                  {club.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="heading-sm text-foreground truncate">{club.name}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  {club.tagline && (
                    <p className="text-caption truncate">{club.tagline}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-caption flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {club.members.toLocaleString()}
                  </span>
                  <span className="text-caption flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {club.location}
                  </span>
                </div>
              </div>

              {/* Action */}
              {activeTab === 'my' ? (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              ) : (
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-clubs text-clubs hover:bg-clubs hover:text-white flex-shrink-0 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Join
                </Button>
              )}
            </button>
          ))}

          {filteredClubs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-clubs-muted flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-clubs" />
              </div>
              <h3 className="heading-sm text-foreground mb-1">
                {activeTab === 'my' ? "No clubs yet" : "No clubs found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                {activeTab === 'my' 
                  ? "Join a club to connect with like-minded enthusiasts" 
                  : "Try a different search term"}
              </p>
              {activeTab === 'my' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-4 border-clubs text-clubs hover:bg-clubs hover:text-white"
                  onClick={() => setActiveTab('discover')}
                >
                  Discover clubs
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clubs;