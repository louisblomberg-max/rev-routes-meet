import { useState } from 'react';
import { ArrowLeft, Search, Users, Check } from 'lucide-react';
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
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 safe-top sticky top-0 bg-background z-10">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center border border-border/50"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Clubs</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search clubs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>

        {/* Segmented Toggle */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            My Clubs
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'discover'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Discover
          </button>
        </div>
      </div>

      {/* Club List */}
      <div className="px-4 pb-8">
        {activeTab === 'discover' && (
          <p className="text-sm text-muted-foreground mb-3">Popular clubs</p>
        )}
        
        <div className="space-y-3">
          {filteredClubs.map((club) => (
            <button
              key={club.id}
              onClick={() => navigate(`/club/${club.id}`)}
              className="w-full bg-card rounded-xl p-4 flex items-center gap-4 text-left border border-border/50 hover:border-border transition-colors"
            >
              {/* Club Avatar */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-clubs to-clubs/70 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-white">
                  {club.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{club.name}</h3>
                {club.tagline && (
                  <p className="text-xs text-muted-foreground mt-0.5">{club.tagline}</p>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{club.members.toLocaleString()} members</span>
                </div>
              </div>

              {/* Action */}
              {activeTab === 'my' ? (
                <span className="flex items-center gap-1 text-xs text-clubs font-medium bg-clubs/10 px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" />
                  Joined
                </span>
              ) : (
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-clubs text-clubs hover:bg-clubs hover:text-white flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Join logic would go here
                  }}
                >
                  Join
                </Button>
              )}
            </button>
          ))}

          {filteredClubs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {activeTab === 'my' 
                  ? "You haven't joined any clubs yet" 
                  : "No clubs found"}
              </p>
              {activeTab === 'my' && (
                <Button 
                  variant="link" 
                  className="text-clubs mt-2"
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
