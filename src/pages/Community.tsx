import { useState, useEffect } from 'react';
import { MessageSquare, Users, HelpCircle, Search, UserPlus, Check, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friendStatuses, setFriendStatuses] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState({ members: 0, clubs: 0, posts: 0 });

  const sections = [
    { icon: MessageSquare, title: 'Forums & Advice', description: 'Get help, share knowledge, discuss all things automotive', color: 'bg-events', route: '/forums' },
    { icon: Users, title: 'Clubs', description: 'Find and join local car & bike clubs', color: 'bg-clubs', route: '/clubs' },
    { icon: HelpCircle, title: 'Help & Support', description: 'Quick answers to common questions', color: 'bg-routes', route: '/settings/support' },
  ];

  // Load real community stats
  useEffect(() => {
    const loadStats = async () => {
      const [membersRes, clubsRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        members: membersRes.count || 0,
        clubs: clubsRes.count || 0,
        posts: postsRes.count || 0,
      });
    };
    loadStats();
  }, []);

  const formatStatNumber = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return n.toString();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq('id', user?.id || '')
      .limit(10);

    if (error) { toast.error('Search failed'); setIsSearching(false); return; }

    const results = profiles || [];
    setSearchResults(results);

    // Check friend statuses for results
    if (user?.id && results.length > 0) {
      const ids = results.map(r => r.id);
      const [sentRes, receivedRes] = await Promise.all([
        supabase.from('friends').select('friend_id, status').eq('user_id', user.id).in('friend_id', ids),
        supabase.from('friends').select('user_id, status').eq('friend_id', user.id).in('user_id', ids),
      ]);

      const statuses: Record<string, string> = {};
      (sentRes.data || []).forEach(r => { statuses[r.friend_id] = r.status; });
      (receivedRes.data || []).forEach(r => { if (!statuses[r.user_id]) statuses[r.user_id] = r.status === 'accepted' ? 'accepted' : 'pending_received'; });
      setFriendStatuses(statuses);
    }

    setIsSearching(false);
  };

  const handleAddFriend = async (profileId: string) => {
    if (!user?.id) return;
    const { error } = await supabase.from('friends').insert({ user_id: user.id, friend_id: profileId, status: 'pending' });
    if (error) { toast.error('Failed to send request'); return; }
    setFriendStatuses(prev => ({ ...prev, [profileId]: 'pending' }));
    toast.success('Friend request sent!');
  };

  return (
    <div className="mobile-container bg-background min-h-dvh">
      <div className="px-4 pt-4 pb-6 safe-top">
        <div className="flex items-center gap-4 mb-6">
          <BackButton className="w-10 h-10 rounded-full bg-white shadow-sm" />
          <h1 className="text-2xl font-bold text-foreground">Community Hub</h1>
        </div>
        <p className="text-muted-foreground">Connect with fellow enthusiasts, get advice, and join clubs.</p>
      </div>

      {/* Find Friends */}
      <div className="px-4 mb-6">
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" /> Find Friends
        </h2>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {isSearching && (
          <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Searching...</span>
          </div>
        )}
        {!isSearching && searchResults.length > 0 && (
          <div className="bg-card rounded-xl border border-border/50 divide-y divide-border/30">
            {searchResults.map(p => {
              const name = p.display_name || p.username || 'User';
              const status = friendStatuses[p.id];
              return (
                <div key={p.id} className="flex items-center gap-3 p-3">
                  <button onClick={() => navigate(`/profile/${p.id}`)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={p.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{name}</p>
                      {p.username && <p className="text-xs text-muted-foreground">@{p.username}</p>}
                    </div>
                  </button>
                  {status === 'accepted' ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Friends</span>
                  ) : status === 'pending' || status === 'pending_received' ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleAddFriend(p.id)}>
                      <UserPlus className="w-3.5 h-3.5" /> Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
          <p className="text-sm text-muted-foreground text-center py-4">No users found matching "{searchQuery}"</p>
        )}
      </div>

      <div className="px-4 space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button key={section.title} onClick={() => navigate(section.route)} className="w-full content-card flex items-start gap-4 text-left">
              <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}><Icon className="w-6 h-6 text-white" /></div>
              <div>
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-8 pb-8">
        <div className="bg-gradient-to-r from-events/10 to-routes/10 rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Community Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold text-events">{formatStatNumber(stats.members)}</p><p className="text-xs text-muted-foreground">Members</p></div>
            <div><p className="text-2xl font-bold text-routes">{formatStatNumber(stats.clubs)}</p><p className="text-xs text-muted-foreground">Active Clubs</p></div>
            <div><p className="text-2xl font-bold text-services">{formatStatNumber(stats.posts)}</p><p className="text-xs text-muted-foreground">Forum Posts</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
