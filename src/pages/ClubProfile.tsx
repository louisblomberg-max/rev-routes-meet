import { useState } from 'react';
import { ArrowLeft, Users, Share2, Heart, MessageCircle, Pin, Calendar, MapPin, Image, Info, Bell } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { mockClubs, mockClubPosts, mockClubEvents } from '@/data/mockData';

const ClubProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('feed');
  const [isJoined, setIsJoined] = useState(false);
  const [newPost, setNewPost] = useState('');

  const club = mockClubs.find(c => c.id === id);
  const posts = mockClubPosts.filter(p => p.clubId === id);
  const events = mockClubEvents.filter(e => e.clubId === id);
  const announcements = posts.filter(p => p.isPinned);

  // Initialize joined state from mock data
  useState(() => {
    if (club) {
      setIsJoined(club.joined);
    }
  });

  if (!club) {
    return (
      <div className="mobile-container bg-background min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Club not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageCircle },
    { id: 'about', label: 'About', icon: Info },
    { id: 'photos', label: 'Photos', icon: Image },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Cover Photo */}
      <div className="relative h-40 bg-gradient-to-br from-clubs to-clubs/70">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button 
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Club Info */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-clubs to-clubs/80 flex items-center justify-center border-4 border-background shadow-lg">
            <span className="text-2xl font-bold text-white">
              {club.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-xl font-bold text-foreground">{club.name}</h1>
            <p className="text-sm text-muted-foreground">{club.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {club.members.toLocaleString()} members
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {club.location}
          </span>
        </div>

        {/* Join Button */}
        <div className="mt-4">
          {isJoined ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border-clubs text-clubs"
                onClick={() => setIsJoined(false)}
              >
                Joined
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full bg-clubs hover:bg-clubs/90 text-white"
              onClick={() => setIsJoined(true)}
            >
              Join Club
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <div className="flex overflow-x-auto px-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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
            {/* Create Post (only if joined) */}
            {isJoined && (
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
                  >
                    Post
                  </Button>
                </div>
              </div>
            )}

            {/* Posts */}
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
            <div>
              <h3 className="font-semibold text-foreground mb-2">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{club.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Location</h3>
              <p className="text-sm text-muted-foreground">{club.location}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Club Rules</h3>
              <ul className="space-y-2">
                {club.rules?.map((rule, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-clubs font-medium">{index + 1}.</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <Image className="w-8 h-8 text-muted-foreground/30" />
              </div>
            ))}
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
