import { useState, useEffect } from 'react';
import { Users, Share2, Heart, MessageCircle, Pin, Calendar, MapPin, Image, Info, Bell, Globe, Shield, Instagram, ExternalLink, Flag, UserCheck, Clock, AlertTriangle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ClubProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [club, setClub] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [membership, setMembership] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true); setError(null);
    const [clubRes, postsRes, membersRes, myMemberRes] = await Promise.all([
      supabase.from('clubs').select('*').eq('id', id).single(),
      supabase.from('club_posts').select('*, profiles(username, avatar_url, display_name)').eq('club_id', id).order('created_at', { ascending: false }).limit(20),
      supabase.from('club_memberships').select('*, profiles(username, avatar_url, display_name)').eq('club_id', id).limit(20),
      authUser?.id ? supabase.from('club_memberships').select('role').eq('club_id', id).eq('user_id', authUser.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    if (clubRes.error) { setError(clubRes.error.message); setIsLoading(false); return; }
    setClub(clubRes.data); setPosts(postsRes.data || []); setMembers(membersRes.data || []);
    setMembership((myMemberRes as any).data);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [id, authUser?.id]);

  const isJoined = !!membership;
  const isOwner = club?.created_by === authUser?.id;
  const isAdmin = isOwner || membership?.role === 'owner' || membership?.role === 'admin';

  const handleJoin = async () => {
    if (!authUser?.id || !id) return;
    await supabase.from('club_memberships').insert({ user_id: authUser.id, club_id: id, role: 'member' });
    toast.success(`Joined ${club?.name}!`); fetchData();
  };

  const handleLeave = async () => {
    if (!authUser?.id || !id) return;
    await supabase.from('club_memberships').delete().eq('user_id', authUser.id).eq('club_id', id);
    toast.success('Left club'); fetchData();
  };

  const handlePost = async () => {
    if (!authUser?.id || !newPost.trim() || !id) return;
    await supabase.from('club_posts').insert({ club_id: id, user_id: authUser.id, body: newPost.trim() });
    setNewPost(''); toast.success('Post shared!'); fetchData();
  };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background min-h-screen">
        <div className="h-44 bg-gradient-to-br from-clubs to-clubs/60" />
        <div className="px-4 -mt-10 space-y-4"><Skeleton className="w-20 h-20 rounded-2xl" /><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
        <p className="font-semibold text-foreground mb-1">{error || 'Club not found'}</p>
        <Button variant="outline" onClick={fetchData} className="mt-3">Retry</Button>
      </div>
    );
  }

  const visibilityLabel = club.visibility === 'invite_only' ? 'Invite Only' : club.visibility === 'members_only' ? 'Private' : 'Public';

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageCircle },
    { id: 'about', label: 'About', icon: Info },
    { id: 'members', label: 'Members', icon: Users },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="relative h-44 bg-gradient-to-br from-clubs to-clubs/60">
        <BackButton className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm z-10 hover:bg-black/40 safe-top" iconClassName="text-white" />
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
            className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-black/40 transition-colors active:scale-95">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      <div className="px-4 -mt-10 relative z-10">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-clubs to-clubs/80 flex items-center justify-center border-4 border-background shadow-lg">
            <span className="text-2xl font-bold text-white">{club.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</span>
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-xl font-bold text-foreground">{club.name}</h1>
            {club.handle && <p className="text-xs text-muted-foreground">@{club.handle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{(club.member_count || 0).toLocaleString()} members</span>
          <span className="flex items-center gap-1 text-xs"><Shield className="w-3.5 h-3.5" />{visibilityLabel}</span>
        </div>
        <div className="mt-4">
          {isJoined ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-clubs text-clubs" onClick={handleLeave}><UserCheck className="w-4 h-4 mr-1.5" />Joined</Button>
              <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}><Share2 className="w-4 h-4" /></Button>
            </div>
          ) : (
            <Button className="w-full bg-clubs hover:bg-clubs/90 text-white" onClick={handleJoin}>Join Club</Button>
          )}
        </div>
      </div>
      <div className="mt-6 border-b border-border">
        <div className="flex px-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap min-w-0 ${activeTab === tab.id ? 'border-clubs text-clubs' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-4 py-4 pb-8">
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {isJoined && (
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <Textarea placeholder="Share something with the club..." value={newPost} onChange={(e) => setNewPost(e.target.value)} className="resize-none border-0 p-0 focus-visible:ring-0 bg-transparent" rows={2} />
                <div className="flex justify-end mt-3"><Button size="sm" className="bg-clubs hover:bg-clubs/90" disabled={!newPost.trim()} onClick={handlePost}>Post</Button></div>
              </div>
            )}
            {posts.length === 0 && (
              <div className="text-center py-12"><MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No posts yet</p></div>
            )}
            {posts.map((post) => (
              <div key={post.id} className="bg-card rounded-xl p-4 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">{(post.profiles?.display_name || post.profiles?.username || 'U').charAt(0)}</span>
                  </div>
                  <div><p className="font-medium text-foreground text-sm">{post.profiles?.display_name || post.profiles?.username || 'Member'}</p><p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p></div>
                </div>
                <p className="text-foreground text-sm leading-relaxed">{post.body}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><Heart className="w-4 h-4" />{post.likes || 0}</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {club.description && <div><h3 className="font-semibold text-foreground mb-2">About</h3><p className="text-sm text-muted-foreground leading-relaxed">{club.description}</p></div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-xl p-3 border border-border/50"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Visibility</p><p className="text-sm font-semibold text-foreground mt-0.5">{visibilityLabel}</p></div>
              <div className="bg-card rounded-xl p-3 border border-border/50"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Joining</p><p className="text-sm font-semibold text-foreground mt-0.5">{club.join_mode === 'admin_approval' ? 'Approval' : 'Auto'}</p></div>
            </div>
            {club.tags && club.tags.length > 0 && (
              <div><h3 className="font-semibold text-foreground mb-2">Tags</h3><div className="flex flex-wrap gap-1.5">{club.tags.map((t: string) => <span key={t} className="px-2.5 py-1 bg-clubs/10 text-clubs text-xs font-medium rounded-lg">{t}</span>)}</div></div>
            )}
            <button onClick={() => toast.info('Report submitted')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"><Flag className="w-4 h-4" />Report this club</button>
          </div>
        )}
        {activeTab === 'members' && (
          <div className="space-y-3">
            {members.map((m) => (
              <div key={`${m.user_id}-${m.club_id}`} className="bg-card rounded-xl p-4 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">{(m.profiles?.display_name || m.profiles?.username || 'M').charAt(0)}</span>
                  </div>
                  <div className="flex-1"><p className="font-medium text-foreground text-sm">{m.profiles?.display_name || m.profiles?.username || 'Member'}</p><p className="text-xs text-muted-foreground">@{m.profiles?.username || 'user'}</p></div>
                  {m.role === 'owner' && <span className="text-[10px] font-semibold text-clubs bg-clubs/10 px-2 py-0.5 rounded-full">Owner</span>}
                  {m.role === 'admin' && <span className="text-[10px] font-semibold text-clubs bg-clubs/10 px-2 py-0.5 rounded-full">Admin</span>}
                </div>
              </div>
            ))}
            {members.length === 0 && <div className="text-center py-12"><Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No members yet</p></div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubProfile;
