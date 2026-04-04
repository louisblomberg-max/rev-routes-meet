import { Users, MessageSquare, Mail, ChevronRight, Search, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStats } from '@/hooks/useUserStats';
import GlobalHeader from '@/components/GlobalHeader';

const CommunityTab = () => {
  const navigate = useNavigate();
  const stats = useUserStats();

  const quickActions = [
    { label: 'Find Friends', icon: '👋', route: '/friends' },
    { label: 'My Clubs', icon: '👥', route: '/my-clubs' },
    { label: 'Forums', icon: '💬', route: '/forums' },
    { label: 'Messages', icon: '✉️', route: '/messages' },
  ];

  const sections = [
    { id: 'clubs', icon: Users, title: 'Clubs', description: 'Discover and join automotive clubs', route: '/clubs' },
    { id: 'forums', icon: MessageSquare, title: 'Advice & Forums', description: 'Ask questions, share insights', route: '/forums' },
    { id: 'messages', icon: Mail, title: 'Messages', description: 'Message friends and stay connected', route: '/messages' },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24" style={{ background: '#f3f3e8' }}>
      <div style={{ padding: '24px 16px 0' }}>
        {/* Search */}
        <div
          className="flex items-center gap-3"
          style={{
            background: '#ffffff',
            borderRadius: 999,
            height: 44,
            padding: '0 16px',
            border: '0.5px solid #e8e8e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Search className="w-4 h-4" style={{ color: '#999999' }} />
          <input
            placeholder="Search people, clubs, forums..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: '#111111' }}
            onFocus={() => navigate('/friends')}
            readOnly
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none" style={{ padding: '16px 16px 0' }}>
        {quickActions.map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.route)}
            className="flex-shrink-0 btn-press flex flex-col items-center justify-center"
            style={{
              width: 100,
              height: 80,
              background: '#ffffff',
              borderRadius: 12,
              border: '0.5px solid #e8e8e0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: 24 }}>{action.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#111111', marginTop: 4 }}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main Sections */}
      <div style={{ padding: '24px 16px 0' }} className="space-y-2.5">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="w-full flex items-center gap-4 text-left btn-press"
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: 16,
                border: '0.5px solid #e8e8e0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#fce8ed' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#d30d37' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111111' }}>{section.title}</h3>
                <p style={{ fontSize: 13, color: '#666666', marginTop: 2 }}>{section.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#c0c0b8' }} />
            </button>
          );
        })}
      </div>

      {/* Activity Stats */}
      <div style={{ padding: '24px 16px 0' }}>
        <span className="text-label" style={{ marginBottom: 6, display: 'block' }}>Your Activity</span>
        <div
          className="grid grid-cols-3 gap-0"
          style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '0.5px solid #e8e8e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {[
            { count: stats.clubsCount, label: 'Clubs', route: '/my-clubs' },
            { count: stats.discussionsCount, label: 'Posts', route: '/my-discussions' },
            { count: stats.friendsCount, label: 'Friends', route: '/my-friends' },
          ].map((s, i) => (
            <button
              key={s.label}
              onClick={() => navigate(s.route)}
              className="text-center py-4 btn-press"
              style={{ borderRight: i < 2 ? '0.5px solid #e8e8e0' : 'none' }}
            >
              <div style={{ fontSize: 20, fontWeight: 500, color: '#d30d37' }}>{s.count}</div>
              <div style={{ fontSize: 13, color: '#999999', marginTop: 2 }}>{s.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;
