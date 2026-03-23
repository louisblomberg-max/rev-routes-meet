import { useState, useEffect } from 'react';
import { Search, Users, ChevronRight, MapPin, Plus, AlertTriangle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Clubs = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [discoverClubs, setDiscoverClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [myRes, discRes] = await Promise.all([
        authUser?.id ? supabase.from('club_memberships').select('club_id, role, clubs(*)').eq('user_id', authUser.id) : Promise.resolve({ data: [] }),
        supabase.from('clubs').select('*').eq('visibility', 'public').order('member_count', { ascending: false }),
      ]);
      const myClubData = ((myRes as any).data || []).map((m: any) => ({ ...m.clubs, _role: m.role })).filter(Boolean);
      const myIds = new Set(myClubData.map((c: any) => c.id));
      setMyClubs(myClubData);
      setDiscoverClubs(((discRes as any).data || []).filter((c: any) => !myIds.has(c.id)));
    } catch (e: any) { setError(e.message); }
    setIsLoading(false);
  };

  useEffect(() => { fetchClubs(); }, [authUser?.id]);

  const handleJoin = async (clubId: string) => {
    if (!authUser?.id) return;
    await supabase.from('club_memberships').insert({ user_id: authUser.id, club_id: clubId, role: 'member' });
    fetchClubs();
  };

  const clubs = activeTab === 'my' ? myClubs : discoverClubs;
  const filteredClubs = clubs.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 safe-top">
          <BackButton className="w-9 h-9 rounded-lg bg-card border border-border/50" iconClassName="w-4 h-4" />
          <h1 className="heading-md text-foreground flex-1">Clubs</h1>
          <Button size="sm" onClick={() => navigate('/add/club')} className="bg-clubs hover:bg-clubs/90 text-clubs-foreground h-8 text-xs gap-1 rounded-lg"><Plus className="w-3.5 h-3.5" />Create</Button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search clubs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-card border-border/50 h-9 text-sm" />
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex bg-muted rounded-lg p-1">
            <button onClick={() => setActiveTab('my')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'my' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>My Clubs ({myClubs.length})</button>
            <button onClick={() => setActiveTab('discover')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'discover' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>Discover ({discoverClubs.length})</button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'discover' && <div className="px-4 pt-3"><p className="text-label">Popular near you</p></div>}
        <div className="px-4 py-3 space-y-2.5">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-xl p-3.5 flex items-center gap-3.5 border border-border/50">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div>
              </div>
            ))
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-center">
              <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
              <p className="text-sm text-foreground font-semibold mb-1">Something went wrong</p>
              <Button variant="outline" onClick={fetchClubs} className="mt-3">Retry</Button>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-clubs-muted flex items-center justify-center mb-3"><Users className="w-7 h-7 text-clubs" /></div>
              <h3 className="heading-sm text-foreground mb-1">{activeTab === 'my' ? "No clubs yet" : "No clubs found"}</h3>
              <p className="text-sm text-muted-foreground max-w-[240px]">{activeTab === 'my' ? "Join a club or create your own" : "Try a different search term"}</p>
              {activeTab === 'my' && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="border-clubs text-clubs hover:bg-clubs hover:text-white" onClick={() => setActiveTab('discover')}>Discover clubs</Button>
                  <Button size="sm" className="bg-clubs hover:bg-clubs/90 text-clubs-foreground" onClick={() => navigate('/add/club')}>Create Club</Button>
                </div>
              )}
            </div>
          ) : filteredClubs.map((club) => (
            <button key={club.id} onClick={() => navigate(`/club/${club.id}`)}
              className="w-full bg-card rounded-xl p-3.5 flex items-center gap-3.5 text-left border border-border/50 hover:border-border active:scale-[0.99] transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-clubs to-clubs/60 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{club.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="heading-sm text-foreground truncate">{club.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-caption flex items-center gap-1"><Users className="w-3 h-3" />{(club.member_count || 0).toLocaleString()}</span>
                </div>
              </div>
              {activeTab === 'my' ? (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              ) : (
                <Button variant="outline" size="sm" className="border-clubs text-clubs hover:bg-clubs hover:text-white flex-shrink-0 h-8 text-xs"
                  onClick={(e) => { e.stopPropagation(); handleJoin(club.id); }}>Join</Button>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clubs;
