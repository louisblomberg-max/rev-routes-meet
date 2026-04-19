import { useState, useEffect } from 'react';
import { Users, MessageCircle, Mail, AlertTriangle, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CommunityClubsView from './community/CommunityClubsView';
import CommunityForumsView from './community/CommunityForumsView';
import CommunityMessagesView from './community/CommunityMessagesView';

type View = 'hub' | 'clubs' | 'forums' | 'messages';

export default function CommunityTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<View>('hub');
  const [stats, setStats] = useState({ clubsJoined: 0, sosActive: 0 });

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('club_memberships').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      .then(({ count }) => setStats(prev => ({ ...prev, clubsJoined: count || 0 })));
    supabase.from('help_requests').select('id', { count: 'exact', head: true }).eq('status', 'active')
      .then(({ count }) => setStats(prev => ({ ...prev, sosActive: count || 0 })));
  }, [user?.id]);

  // Sub-view with back button
  if (view !== 'hub') {
    return (
      <div style={{ background: '#ECEAE4', minHeight: '100vh' }}>
        {/* Back header */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E4DC', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setView('hub')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <ArrowLeft size={22} color="#111" />
          </button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>
            {view === 'clubs' ? 'Clubs' : view === 'forums' ? 'Forums' : 'Messages'}
          </h2>
        </div>
        {view === 'clubs' && <CommunityClubsView />}
        {view === 'forums' && <CommunityForumsView />}
        {view === 'messages' && <CommunityMessagesView />}
      </div>
    );
  }

  const options = [
    {
      id: 'clubs' as View,
      title: 'Clubs',
      subtitle: 'Join communities',
      description: 'Connect with fellow enthusiasts in clubs that match your cars and interests.',
      icon: Users,
      accent: '#CC2B2B',
      accentBg: '#FEF2F2',
      stats: stats.clubsJoined > 0 ? `${stats.clubsJoined} joined` : 'Discover clubs',
    },
    {
      id: 'forums' as View,
      title: 'Forums',
      subtitle: 'Discuss & share',
      description: 'Technical help, build advice, event chat, and community discussions.',
      icon: MessageCircle,
      accent: '#1D4ED8',
      accentBg: '#EFF6FF',
      stats: 'Ask & answer',
    },
    {
      id: 'messages' as View,
      title: 'Messages',
      subtitle: 'Chat & connect',
      description: 'Private conversations with friends and club members.',
      icon: Mail,
      accent: '#059669',
      accentBg: '#F0FDF4',
      stats: 'Direct messages',
    },
  ];

  return (
    <div style={{ background: '#ECEAE4', minHeight: '100vh', paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 8px' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>
          Community
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 15, color: '#8C867E', fontWeight: 500 }}>
          Connect with automotive enthusiasts
        </p>
      </div>

      {/* Navigation cards */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {options.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setView(opt.id)}
              style={{
                width: '100%', background: '#FFFFFF', border: '1px solid #F0EDE6',
                borderRadius: 20, padding: 0, cursor: 'pointer', textAlign: 'left' as const,
                overflow: 'hidden', transition: 'all 0.2s ease',
              }}
              className="hover:shadow-lg active:scale-[0.98]"
            >
              {/* Accent bar */}
              <div style={{ height: 3, background: opt.accent }} />
              <div style={{ padding: '20px 20px 18px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Icon */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                    background: opt.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={26} color={opt.accent} strokeWidth={2} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>
                        {opt.title}
                      </h3>
                      <ChevronRight size={20} color="#D1D5DB" />
                    </div>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: opt.accent }}>
                      {opt.subtitle}
                    </p>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: '#8C867E', lineHeight: 1.4 }}>
                      {opt.description}
                    </p>
                    {/* Stat pill */}
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: '#4A443D',
                      background: '#F3F4F6', padding: '5px 12px', borderRadius: 8,
                      display: 'inline-block',
                    }}>
                      {opt.stats}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* SOS card — separate, always visible */}
        <button
          onClick={() => navigate('/sos-feed')}
          style={{
            width: '100%', background: '#FFFFFF', border: '1px solid #F0EDE6',
            borderRadius: 20, padding: '16px 20px', cursor: 'pointer', textAlign: 'left' as const,
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'all 0.2s ease',
          }}
          className="hover:shadow-md active:scale-[0.99]"
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={22} color="#DC2626" strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Breakdown Help</div>
            <div style={{ fontSize: 13, color: '#8C867E', marginTop: 2 }}>
              Request help or assist nearby members
            </div>
          </div>
          {stats.sosActive > 0 && (
            <span style={{
              background: '#DC2626', color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '4px 10px', borderRadius: 10, flexShrink: 0,
            }}>
              {stats.sosActive} active
            </span>
          )}
          <ChevronRight size={18} color="#D1D5DB" style={{ flexShrink: 0 }} />
        </button>
      </div>
    </div>
  );
}
