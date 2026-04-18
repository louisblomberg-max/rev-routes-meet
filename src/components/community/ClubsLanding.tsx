import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Hash, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ClubsLandingProps {
  onNavigate: (view: 'discover' | 'my-clubs') => void;
}

export default function ClubsLanding({ onNavigate }: ClubsLandingProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalClubs, setTotalClubs] = useState(0);
  const [myClubCount, setMyClubCount] = useState(0);
  const [codeInput, setCodeInput] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    supabase.from('clubs').select('id', { count: 'exact', head: true }).eq('visibility', 'public')
      .then(({ count }) => setTotalClubs(count || 0));
    if (user?.id) {
      supabase.from('club_memberships').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
        .then(({ count }) => setMyClubCount(count || 0));
    }
  }, [user?.id]);

  const handleCodeJoin = async () => {
    if (!codeInput.trim() || !user?.id || joining) return;
    setJoining(true);
    const { data: club } = await supabase.from('clubs').select('*').eq('invite_code', codeInput.trim().toLowerCase()).maybeSingle();
    if (!club) { toast.error('Club not found. Check the code.'); setJoining(false); return; }
    const { data: existing } = await supabase.from('club_memberships').select('id').eq('club_id', club.id).eq('user_id', user.id).maybeSingle();
    if (existing) { toast.error('Already a member.'); setJoining(false); return; }
    if (club.join_mode === 'approval') {
      await supabase.from('club_join_requests').upsert({ club_id: club.id, user_id: user.id, status: 'pending' });
      toast.success(`Request sent to ${club.name}`);
    } else if (club.join_mode === 'invite_only') {
      toast.error('Invite only — ask a member');
    } else {
      const { error } = await supabase.from('club_memberships').insert({ club_id: club.id, user_id: user.id, role: 'member' });
      if (!error) toast.success(`Joined ${club.name}!`);
    }
    setCodeInput('');
    setJoining(false);
  };

  return (
    <div style={{ background: '#ECEAE4', minHeight: '100%', paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 8px' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>Clubs</h1>
        <p style={{ margin: '6px 0 0', fontSize: 15, color: '#8C867E', fontWeight: 500 }}>
          Find your community or create something new
        </p>
      </div>

      {/* Choice cards */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Discover Clubs */}
        <button
          onClick={() => onNavigate('discover')}
          style={{
            width: '100%', background: '#FFFFFF', border: '1px solid #F0EDE6',
            borderRadius: 24, padding: 24, cursor: 'pointer', textAlign: 'left' as const,
            transition: 'all 0.2s ease',
          }}
          className="hover:shadow-lg hover:border-gray-300 active:scale-[0.98]"
        >
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, flexShrink: 0,
              background: 'linear-gradient(135deg, #CC2B2B, #E85D5D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(204,43,43,0.25)',
            }}>
              <Search size={32} color="#fff" strokeWidth={2.2} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>
                Discover Clubs
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#8C867E', fontWeight: 500, lineHeight: 1.4 }}>
                Browse {totalClubs > 0 ? totalClubs.toLocaleString() : ''} clubs near you
              </p>
            </div>
            <ChevronRight size={22} color="#CC2B2B" />
          </div>
        </button>

        {/* My Clubs */}
        <button
          onClick={() => onNavigate('my-clubs')}
          style={{
            width: '100%', background: '#FFFFFF', border: '1px solid #F0EDE6',
            borderRadius: 24, padding: 24, cursor: 'pointer', textAlign: 'left' as const,
            transition: 'all 0.2s ease',
          }}
          className="hover:shadow-lg hover:border-gray-300 active:scale-[0.98]"
        >
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, flexShrink: 0,
              background: 'linear-gradient(135deg, #374151, #6B7280)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(55,65,81,0.2)',
            }}>
              <Users size={32} color="#fff" strokeWidth={2.2} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>
                My Clubs
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#8C867E', fontWeight: 500, lineHeight: 1.4 }}>
                {myClubCount > 0 ? `${myClubCount} club${myClubCount !== 1 ? 's' : ''} joined` : 'Join your first club'}
              </p>
            </div>
            <ChevronRight size={22} color="#8C867E" />
          </div>
        </button>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '4px 20px 0' }}>
        <h3 style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 12, marginTop: 0 }}>
          Quick Actions
        </h3>

        {/* Create club */}
        <button
          onClick={() => navigate('/add/club')}
          style={{
            width: '100%', background: '#FFFFFF', border: '1px solid #F0EDE6',
            borderRadius: 16, padding: '16px 20px', cursor: 'pointer', textAlign: 'left' as const,
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10,
          }}
          className="hover:shadow-md active:scale-[0.99]"
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Plus size={22} color="#CC2B2B" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Create a Club</div>
            <div style={{ fontSize: 13, color: '#8C867E', marginTop: 2 }}>Start your own automotive community</div>
          </div>
          <ChevronRight size={18} color="#D1D5DB" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </button>

        {/* Join by code */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #F0EDE6', borderRadius: 16,
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 10 }}>Join by Code</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Hash size={16} color="#8C867E" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                value={codeInput}
                onChange={e => setCodeInput(e.target.value.toUpperCase().replace(/\s/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') handleCodeJoin(); }}
                placeholder="Club code"
                maxLength={12}
                style={{
                  width: '100%', background: '#F8F7F4', border: 'none', borderRadius: 10,
                  padding: '11px 14px 11px 36px', fontSize: 15, color: '#111', outline: 'none',
                  fontFamily: 'monospace', fontWeight: 600, letterSpacing: '1px',
                }}
              />
            </div>
            <button
              onClick={handleCodeJoin}
              disabled={!codeInput.trim() || joining}
              style={{
                background: codeInput.trim() && !joining ? '#CC2B2B' : '#D1D5DB',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '11px 18px', fontSize: 14, fontWeight: 700,
                cursor: codeInput.trim() && !joining ? 'pointer' : 'not-allowed',
              }}
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
