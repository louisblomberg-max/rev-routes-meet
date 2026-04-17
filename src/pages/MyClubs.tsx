import { useState } from 'react';
import { Users, MapPin, Plus, ChevronRight, Shield } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserClubs } from '@/hooks/useProfileData';

const MyClubs = () => {
  const navigate = useNavigate();
  const { clubs, joined, managed, isLoading } = useUserClubs();
  const [activeTab, setActiveTab] = useState<'joined' | 'managed'>('joined');

  const displayClubs = activeTab === 'joined' ? joined : managed;

  return (
    <div className="mobile-container bg-background min-h-screen md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'community'); navigate('/'); }} />
            <div>
              <h1 className="text-lg font-bold text-foreground">My Clubs</h1>
              <p className="text-xs text-muted-foreground">{clubs.length} club{clubs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate('/add/club')} className="gap-1.5 rounded-lg bg-clubs hover:bg-clubs/90 text-clubs-foreground">
            <Plus className="w-4 h-4" /> Create
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1">
          <button onClick={() => setActiveTab('joined')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'joined' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            Joined ({joined.length})
          </button>
          <button onClick={() => setActiveTab('managed')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'managed' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            Managed ({managed.length})
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3.5">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div>
              </div>
            ))}
          </div>
        ) : displayClubs.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-clubs/10 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-clubs" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {activeTab === 'managed' ? 'No managed clubs' : 'No clubs joined'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === 'managed' ? 'Create your own club to get started' : 'Discover and join clubs in your area'}
            </p>
            <div className="flex gap-2 justify-center">
              {activeTab === 'joined' && (
                <Button variant="outline" onClick={() => navigate('/clubs')} className="border-clubs text-clubs hover:bg-clubs hover:text-clubs-foreground">
                  Discover Clubs
                </Button>
              )}
              <Button
                onClick={() => navigate('/add/club')}
                className="bg-clubs hover:bg-clubs/90 text-clubs-foreground"
              >
                <Plus className="w-4 h-4 mr-1" /> Create Club
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayClubs.map(({ membership, club }) => (
              <button
                key={membership.id}
                onClick={() => navigate(`/club/${membership.clubId}`)}
                className="w-full bg-card rounded-2xl border border-border/50 shadow-sm p-3.5 flex items-center gap-3.5 text-left hover:shadow-md hover:border-border transition-all active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-clubs to-clubs/60 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-clubs-foreground">
                    {(club?.name || membership.clubName).split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{club?.name || membership.clubName}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    {club?.tagline && <p className="text-xs text-muted-foreground truncate">{club.tagline}</p>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{club?.members?.toLocaleString() || '—'}</span>
                    {club?.location && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{club.location}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant={membership.role === 'admin' ? 'default' : 'secondary'} className={`text-[10px] px-1.5 py-0 ${membership.role === 'admin' ? 'bg-clubs text-clubs-foreground' : ''}`}>
                    {membership.role === 'admin' && <Shield className="w-2.5 h-2.5 mr-0.5" />}
                    {membership.role === 'admin' ? 'Admin' : 'Member'}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClubs;
