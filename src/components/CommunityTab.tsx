import { Users, MessageSquare, Mail, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStats } from '@/hooks/useUserStats';

const CommunityTab = () => {
  const navigate = useNavigate();
  const stats = useUserStats();

  return (
    <div className="h-full bg-background overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-2 safe-top">
        <h1 className="text-[28px] font-bold text-foreground tracking-tight">Community</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect with fellow enthusiasts</p>
      </div>

      {/* Activity Stats Row */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-3">
          {[
            { label: 'Clubs', count: stats.clubsCount, route: '/my-clubs' },
            { label: 'Posts', count: stats.discussionsCount, route: '/my-discussions' },
            { label: 'Friends', count: stats.friendsCount, route: '/my-friends' },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => navigate(stat.route)}
              className="flex-1 bg-card rounded-2xl p-4 text-center shadow-premium hover:shadow-elevated active:scale-[0.98] transition-all"
            >
              <p className="text-2xl font-bold text-foreground">{stat.count}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="px-5 pt-4 space-y-3">
        <button
          onClick={() => navigate('/clubs')}
          className="w-full bg-card rounded-2xl p-5 flex items-center gap-4 text-left shadow-premium hover:shadow-elevated active:scale-[0.99] transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-clubs/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-clubs" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">Clubs</h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">Join car and bike communities near you</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </button>

        <button
          onClick={() => navigate('/forums')}
          className="w-full bg-card rounded-2xl p-5 flex items-center gap-4 text-left shadow-premium hover:shadow-elevated active:scale-[0.99] transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-routes/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-routes" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">Advice & Forums</h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">Ask questions and share knowledge</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </button>

        <button
          onClick={() => navigate('/messages')}
          className="w-full bg-card rounded-2xl p-5 flex items-center gap-4 text-left shadow-premium hover:shadow-elevated active:scale-[0.99] transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-services/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-services" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">Messages</h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">Private conversations with connections</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </button>
      </div>

      {/* Trending */}
      <div className="px-5 pt-5">
        <div className="bg-card/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">5 new posts in your clubs</p>
            <p className="text-xs text-muted-foreground mt-0.5">See what's trending</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;
