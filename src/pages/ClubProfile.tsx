import { useState } from 'react';
import { Users, Share2, Heart, MessageCircle, Pin, Calendar, MapPin, Image, Info, Bell, Globe, Shield, Instagram, ExternalLink, Flag, UserCheck, Clock } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

const ClubProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clubs: clubsRepo, state } = useData();
  const currentUser = state.currentUser;

  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');

  const club = state.clubs.find(c => c.id === id);
  const posts = state.clubPosts.filter(p => p.clubId === id);
  const events = state.clubEvents.filter(e => e.clubId === id);
  const announcements = posts.filter(p => p.isPinned);
  const memberships = currentUser ? state.clubMemberships.filter(m => m.userId === currentUser.id && m.clubId === id) : [];
  const isJoined = memberships.length > 0;
  const isOwner = club?.roles?.ownerId === currentUser?.id || club?.createdBy === currentUser?.id;
  const isAdmin = isOwner || (club?.roles?.adminIds?.includes(currentUser?.id || '') ?? false);

  if (!club) {
    return (
      <div className="mobile-container bg-background min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Club not found</p>
      </div>
    );
  }

  const handleJoin = () => {
    if (!currentUser) { toast.error('Log in to join'); return; }
    if (club.joinApproval === 'adminApproval') {
      toast.success('Join request sent!');
    } else {
      clubsRepo.join(currentUser.id, club.id);
      toast.success(`Joined ${club.name}!`);
    }
  };

  const handleLeave = () => {
    if (!currentUser) return;
    clubsRepo.leave(currentUser.id, club.id);
    toast.success('Left club');
  };

  const handlePost = () => {
    if (!currentUser || !newPost.trim()) return;
    clubsRepo.createClubPost({
      clubId: club.id,
      author: currentUser.displayName,
      authorAvatar: currentUser.avatar,
      content: newPost.trim(),
      createdAt: 'Just now',
      likes: 0,
      comments: 0,
      isPinned: false,
    });
    setNewPost('');
    toast.success('Post shared!');
  };

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageCircle },
    { id: 'about', label: 'About', icon: Info },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'announcements', label: 'News', icon: Bell },
  ];

  const visibilityLabel = club.visibility === 'inviteOnly' ? 'Invite Only' : club.visibility === 'private' ? 'Private' : 'Public';

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Cover Photo */}
      <div className="relative h-44 bg-gradient-to-br from-clubs to-clubs/60">
        <BackButton className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm z-10 hover:bg-black/40 safe-top" iconClassName="text-white" />
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
            className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-black/40 transition-colors active:scale-95"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
          {isAdmin && (
            <button
              onClick={() => toast.info('Edit Club coming soon')}
              className="px-3 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-black/40 transition-colors active:scale-95 text-white text-xs font-semibold"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Club Info */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-clubs to-clubs/80 flex items-center justify-center border-4 border-background shadow-lg">
            <span className="text-2xl font-bold text-white">
              {club.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-xl font-bold text-foreground">{club.name}</h1>
            {club.handle && <p className="text-xs text-muted-foreground">@{club.handle}</p>}
            {club.tagline && <p className="text-sm text-muted-foreground mt-0.5">{club.tagline}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {club.members.toLocaleString()} members
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {club.location}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Shield className="w-3.5 h-3.5" />
            {visibilityLabel}
          </span>
        </div>

        {/* Join Button */}
        <div className="mt-4">
          {isJoined ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-clubs text-clubs"
                onClick={handleLeave}
              >
                <UserCheck className="w-4 h-4 mr-1.5" />
                Joined
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              className="w-full bg-clubs hover:bg-clubs/90 text-white"
              onClick={handleJoin}
            >
              {club.joinApproval === 'adminApproval' ? 'Request to Join' : 'Join Club'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <div className="flex px-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap min-w-0 ${
                  activeTab === tab.id
                    ? 'border-clubs text-clubs'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4 pb-8">
        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {isJoined && (club.postingPermissions !== 'adminsOnly' || isAdmin) && (
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <Textarea
                  placeholder="Share something with the club..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
                  rows={2}
                />
                <div className="flex justify-end mt-3">
                  <Button
                    size="sm"
                    className="bg-clubs hover:bg-clubs/90"
                    disabled={!newPost.trim()}
                    onClick={handlePost}
                  >
                    Post
                  </Button>
                </div>
              </div>
            )}

            {posts.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No posts yet</p>
                {isJoined && <p className="text-xs text-muted-foreground mt-1">Be the first to post!</p>}
              </div>
            )}

            {posts.map((post) => (
              <div key={post.id} className="bg-card rounded-xl p-4 border border-border/50">
                {post.isPinned && (
                  <div className="flex items-center gap-1 text-xs text-clubs mb-2">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {post.author[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                  </div>
                </div>
                <p className="text-foreground text-sm leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {club.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{club.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-xl p-3 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Visibility</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{visibilityLabel}</p>
              </div>
              <div className="bg-card rounded-xl p-3 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Joining</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{club.joinApproval === 'adminApproval' ? 'Approval' : 'Auto'}</p>
              </div>
              {club.clubType && (
                <div className="bg-card rounded-xl p-3 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{club.clubType}</p>
                </div>
              )}
              <div className="bg-card rounded-xl p-3 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Created</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{new Date(club.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {club.categories && club.categories.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {club.categories.map(cat => (
                    <span key={cat} className="px-2.5 py-1 bg-clubs/10 text-clubs text-xs font-medium rounded-lg">{cat}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-foreground mb-2">Location</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {club.location}
              </p>
            </div>

            {club.rules && club.rules.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Club Rules</h3>
                <ul className="space-y-2">
                  {club.rules.map((rule, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-clubs font-semibold">{index + 1}.</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {club.socialLinks && Object.values(club.socialLinks).some(v => v) && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Social Links</h3>
                <div className="space-y-2">
                  {club.socialLinks.instagram && (
                    <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Instagram className="w-4 h-4" /> {club.socialLinks.instagram}
                    </a>
                  )}
                  {club.socialLinks.website && (
                    <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Globe className="w-4 h-4" /> {club.socialLinks.website}
                    </a>
                  )}
                  {club.socialLinks.x && (
                    <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-4 h-4" /> {club.socialLinks.x}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Report */}
            <button
              onClick={() => toast.info('Report submitted')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <Flag className="w-4 h-4" />
              Report this club
            </button>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="bg-card rounded-xl p-4 border border-border/50">
                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {event.attendees} attending
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            {/* Owner/Admin */}
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-clubs/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-clubs" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">Club Owner</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <span className="text-[10px] font-semibold text-clubs bg-clubs/10 px-2 py-0.5 rounded-full">Owner</span>
              </div>
            </div>

            {/* Mock members */}
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">M{i}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">Member {i}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Joined recently
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <p className="text-center text-xs text-muted-foreground pt-2">
              {club.members} total members
            </p>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-3">
            {announcements.length > 0 ? (
              announcements.map((post) => (
                <div key={post.id} className="bg-card rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-clubs/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-clubs" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                    </div>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">{post.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No announcements</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubProfile;
