import { Users, MessageSquare, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStats } from '@/hooks/useUserStats';

const CommunityTab = () => {
  const navigate = useNavigate();
  const stats = useUserStats();

  const sections = [
  {
    id: 'clubs',
    icon: Users,
    title: 'Clubs',
    description: 'Discover and join automotive clubs',
    color: 'bg-community',
    route: '/clubs'
  },
  {
    id: 'forums',
    icon: MessageSquare,
    title: 'Advice & Forums',
    description: 'Ask questions, share knowledge, and discuss all things automotive',
    color: 'bg-community',
    route: '/forums'
  },
  {
    id: 'messages',
    icon: Mail,
    title: 'Messages',
    description: 'Private conversations with your friends and connections',
    color: 'bg-community',
    route: '/messages'
  }];


  return (
    <div className="h-full overflow-y-auto pb-24" style={{ backgroundColor: 'hsl(var(--background-warm))' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6 safe-top">
        <p className="text-label mb-1 text-community text-center">Your Network</p>
        <h1 className="heading-display text-foreground text-center">Community</h1>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Connect with drivers, riders, and enthusiasts worldwide
        </p>
      </div>

      {/* Main Sections */}
      <div className="px-4 space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="w-full bg-card rounded-xl p-4 flex items-center gap-4 text-left border border-border/50 shadow-card hover:shadow-elevated hover:border-community/30 active:scale-[0.99] transition-all duration-200">
              
              <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="heading-sm text-foreground">{section.title}</h3>
                <p className="text-caption mt-0.5 leading-relaxed line-clamp-2 text-left">{section.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>);

        })}
      </div>

      {/* Quick Stats */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card">
          <p className="text-label mb-2 text-community">Your Activity</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => navigate('/my-clubs')} className="text-center hover:bg-community-muted rounded-lg py-1 transition-colors">
              <p className="text-xl font-black text-community">{stats.clubsCount}</p>
              <p className="text-caption">Clubs</p>
            </button>
            <button onClick={() => navigate('/my-discussions')} className="text-center border-x border-border/50 hover:bg-community-muted rounded-lg py-1 transition-colors">
              <p className="text-xl font-black text-community">{stats.discussionsCount}</p>
              <p className="text-caption">Posts</p>
            </button>
            <button onClick={() => navigate('/my-friends')} className="text-center hover:bg-community-muted rounded-lg py-1 transition-colors">
              <p className="text-xl font-black text-community">{stats.friendsCount}</p>
              <p className="text-caption">Friends</p>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4" />
    </div>);

};

export default CommunityTab;