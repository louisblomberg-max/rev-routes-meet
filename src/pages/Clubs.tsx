import { useState } from 'react';
import { Search, Users, ChevronRight, MapPin, Plus } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

const Clubs = () => {
  const navigate = useNavigate();
  const { state } = useData();
  const currentUser = state.currentUser;
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
  const [searchQuery, setSearchQuery] = useState('');

  const myClubIds = new Set(
    state.clubMemberships
      .filter(m => m.userId === currentUser?.id)
      .map(m => m.clubId)
  );

  const myClubs = state.clubs.filter(club => myClubIds.has(club.id));
  const discoverClubs = state.clubs.filter(club => !myClubIds.has(club.id));

  const filteredClubs = activeTab === 'my'
    ? myClubs.filter(club => club.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : discoverClubs.filter(club => club.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3 px-5 pt-14 pb-3 safe-top">
          <BackButton className="w-10 h-10 rounded-full bg-card shadow-soft" iconClassName="w-4 h-4" />
          <h1 className="text-xl font-bold text-foreground flex-1">Clubs</h1>
          <Button
            size="sm"
            onClick={() => navigate('/add/club')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-xs gap-1.5 rounded-[14px] px-5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </Button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-card rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-soft"
            />
          </div>
        </div>

        {/* Segmented Toggle */}
        <div className="px-5 pb-4">
          <div className="flex bg-card rounded-2xl p-1.5 shadow-soft">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'my'
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground'
              }`}
            >
              My Clubs ({myClubs.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'discover'
                  ? 'bg-primary text-primary-foreground shadow-soft'
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
          <div className="px-5 pt-2 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Popular near you</p>
          </div>
        )}

        <div className="px-5 py-3 space-y-3">
          {filteredClubs.map((club, index) => (
            <button
              key={club.id}
              onClick={() => navigate(`/club/${club.id}`)}
              className="w-full bg-card rounded-2xl p-5 flex items-center gap-4 text-left shadow-premium hover:shadow-elevated active:scale-[0.99] transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-2xl bg-clubs/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-clubs">
                  {club.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-foreground truncate">{club.name}</h3>
                {club.tagline && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{club.tagline}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {club.members.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {club.location}
                  </span>
                </div>
              </div>

              {activeTab === 'my' ? (
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-clubs/40 text-clubs hover:bg-clubs hover:text-clubs-foreground flex-shrink-0 h-10 text-xs rounded-[14px] px-5 font-semibold"
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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mb-4 shadow-soft">
                <Users className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                {activeTab === 'my' ? "No clubs yet" : "No clubs found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                {activeTab === 'my'
                  ? "Join a club or create your own"
                  : "Try a different search term"}
              </p>
              {activeTab === 'my' && (
                <div className="flex gap-2 mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-[14px] h-10 px-5"
                    onClick={() => setActiveTab('discover')}
                  >
                    Discover clubs
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-[14px] h-10 px-5"
                    onClick={() => navigate('/add/club')}
                  >
                    Create Club
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clubs;
