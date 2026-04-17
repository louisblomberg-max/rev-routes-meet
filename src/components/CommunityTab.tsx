import { useState, useEffect } from 'react';
import { Users, MessageSquare, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CommunityTab = () => {
  const navigate = useNavigate();

  // Keep SOS count in case needed elsewhere but not rendered here
  const [sosCount, setSosCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('help_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
      setSosCount(count || 0);
    };
    fetchCount();
    const channel = supabase
      .channel('community-help-requests-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_requests' }, () => {
        fetchCount();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div
      className="h-full overflow-y-auto pb-28 md:max-w-[768px] md:mx-auto"
      style={{ backgroundColor: '#ECEAE4' }}
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-6 safe-top">
        <h1
          className="text-foreground"
          style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}
        >
          Community
        </h1>
        <p style={{ fontSize: 14, color: '#8C867E', marginTop: 4 }}>
          Connect with drivers and riders near you
        </p>
      </div>

      {/* Three destination cards */}
      <div className="px-4 flex flex-col gap-3">

        {/* Clubs */}
        <button
          onClick={() => navigate('/clubs')}
          className="w-full text-left active:scale-[0.98] transition-transform duration-150"
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1px solid #E8E4DC',
            overflow: 'hidden',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              height: 80,
              background: 'linear-gradient(135deg, #1C1C2E 0%, #2D1B69 100%)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: '#CC2B2B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Users className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>
                Clubs
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                Discover and join automotive clubs
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>142</div>
                <div style={{ fontSize: 10, color: '#B0A89E', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 1 }}>Clubs near you</div>
              </div>
            </div>
            <div
              style={{
                background: '#CC2B2B',
                borderRadius: 22,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              Browse clubs
            </div>
          </div>
        </button>

        {/* Forums & Advice */}
        <button
          onClick={() => navigate('/forums')}
          className="w-full text-left active:scale-[0.98] transition-transform duration-150"
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1px solid #E8E4DC',
            overflow: 'hidden',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              height: 80,
              background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: '#1D4ED8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MessageSquare className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>
                Forums & Advice
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                Ask questions, share knowledge, discuss
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Technical</div>
                <div style={{ fontSize: 10, color: '#B0A89E', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 1 }}>Builds · Events · General</div>
              </div>
            </div>
            <div
              style={{
                background: '#1D4ED8',
                borderRadius: 22,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              Browse forums
            </div>
          </div>
        </button>

        {/* Messages */}
        <button
          onClick={() => navigate('/messages')}
          className="w-full text-left active:scale-[0.98] transition-transform duration-150"
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1px solid #E8E4DC',
            overflow: 'hidden',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              height: 80,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: '#16803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mail className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>
                Messages
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                Chat with friends and club members
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 13, color: '#8C867E' }}>
              Direct messages and group chats
            </div>
            <div
              style={{
                background: '#16803D',
                borderRadius: 22,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              Open
            </div>
          </div>
        </button>

      </div>
    </div>
  );
};

export default CommunityTab;
