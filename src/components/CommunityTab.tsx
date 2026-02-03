import { Users, MessageSquare, Mail, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityTab = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'clubs',
      icon: Users,
      title: 'Clubs',
      description: 'Join car & bike clubs and meet like-minded enthusiasts',
      gradient: 'from-[#6366F1] to-[#8B5CF6]',
      shadowColor: 'shadow-[#6366F1]/20',
      route: '/clubs',
    },
    {
      id: 'forums',
      icon: MessageSquare,
      title: 'Advice & Forums',
      description: 'Ask questions, share knowledge, and discuss all things automotive',
      gradient: 'from-[#F59E0B] to-[#EF4444]',
      shadowColor: 'shadow-[#F59E0B]/20',
      route: '/forums',
    },
    {
      id: 'messages',
      icon: Mail,
      title: 'Messages',
      description: 'Private conversations with your friends and connections',
      gradient: 'from-[#10B981] to-[#14B8A6]',
      shadowColor: 'shadow-[#10B981]/20',
      route: '/messages',
    },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-muted/30 to-background overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 safe-top">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Your Network</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Community</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Connect with fellow enthusiasts
        </p>
      </div>

      {/* Main Sections - Large Premium Cards */}
      <div className="px-4 space-y-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className={`w-full bg-white/95 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4 text-left border border-white/50 shadow-lg ${section.shadowColor} hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{section.description}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats Section */}
      <div className="px-4 mt-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-md">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Activity</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Clubs</p>
            </div>
            <div className="text-center border-x border-border/30">
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">47</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Friends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Hint */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">5 new posts in your clubs</p>
              <p className="text-[10px] text-amber-600 mt-0.5">Check out what's happening</p>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;
