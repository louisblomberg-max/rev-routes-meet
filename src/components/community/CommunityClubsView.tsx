import { useState, useEffect } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function CommunityClubsView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubIds, setMyClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleJoin = async (club: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) { navigate('/auth'); return; }
    if (myClubIds.includes(club.id)) return;
    if (club.join_mode === 'approval') {
      await supabase.from('club_join_requests').upsert({ club_id: club.id, user_id: user.id, status: 'pending' });
      toast.success('Join request sent');
      return;
    }
    if (club.join_mode === 'invite_only') {
      toast.error('This club is invite only');
      return;
    }
    const { error } = await supabase.from('club_memberships').insert({ club_id: club.id, user_id: user.id, role: 'member' });
    if (!error) {
      setMyClubIds(prev => [...prev, club.id]);
      toast.success(`Joined ${club.name}!`);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('clubs')
        .select('*')
        .eq('visibility', 'public')
        .order('member_count', { ascending: false })
        .limit(30);
      setClubs(data || []);

      if (user?.id) {
        const { data: memberships } = await supabase
          .from('club_memberships')
          .select('club_id')
          .eq('user_id', user.id);
        setMyClubIds(memberships?.map(m => m.club_id) || []);
      }
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const featured = clubs.slice(0, 3);
  const rest = clubs.slice(3);
  const filteredRest = searchQuery.trim()
    ? rest.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : rest;

  return (
    <div style={{ background: '#ECEAE4', minHeight: '100%', paddingBottom: 96 }}>
      {/* Search bar */}
      <div style={{ padding: '12px 16px 8px', position: 'relative' }}>
        <Search size={16} strokeWidth={2} color="#8C867E" style={{ position: 'absolute', left: 30, top: 24, zIndex: 1, pointerEvents: 'none' }} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clubs"
          style={{
            width: '100%',
            background: '#F2EFE9',
            border: 'none',
            borderRadius: 12,
            padding: '11px 14px 11px 38px',
            fontSize: 14,
            color: '#4A443D',
            outline: 'none',
          }}
        />
      </div>

      {/* Hero carousel */}
      {!loading && featured.length > 0 && (
        <>
          <style>{`.hero-scroll::-webkit-scrollbar{display:none}`}</style>
          <div
            className="hero-scroll"
            style={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              gap: 12,
              padding: '4px 16px 8px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none' as any,
            }}
          >
            {featured.map((club) => (
              <button
                key={club.id}
                onClick={() => navigate(`/club/${club.id}`)}
                style={{
                  flex: '0 0 calc(100% - 8px)',
                  scrollSnapAlign: 'center',
                  height: 160,
                  borderRadius: 16,
                  position: 'relative',
                  overflow: 'hidden',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  backgroundColor: '#2C3E50',
                  backgroundImage: club.cover_url ? `url(${club.cover_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: '#CC2B2B', color: '#fff', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.5px', padding: '4px 10px', borderRadius: 6,
                }}>FEATURED</div>
                <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, textAlign: 'left' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px', lineHeight: 1.2 }}>{club.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                    {(club.member_count || 0).toLocaleString()} members{club.location ? ` · ${club.location}` : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* TODO: wire filters */}
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, padding: '4px 16px 12px' }}>
        {[
          { label: 'TYPE', value: 'All' },
          { label: 'NEAR', value: '50mi' },
          { label: 'SIZE', value: 'Any' },
        ].map((pill) => (
          <button
            key={pill.label}
            style={{
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid #E8E4DC',
              borderRadius: 12,
              padding: '8px 11px',
              textAlign: 'left' as const,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 10, color: '#8C867E', fontWeight: 700, letterSpacing: '0.4px' }}>{pill.label}</div>
            <div style={{ fontSize: 12, color: '#111', fontWeight: 700, marginTop: 2 }}>{pill.value} &#9662;</div>
          </button>
        ))}
      </div>

      {/* Section label */}
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#B0A89E',
        letterSpacing: '0.6px', textTransform: 'uppercase' as const,
        padding: '0 16px', marginBottom: 8,
      }}>All clubs</div>

      {/* Club list */}
      {loading ? (
        [1, 2, 3].map((i) => (
          <div key={i} style={{ background: '#F0EDE6', borderRadius: 16, height: 80, margin: '0 16px 8px' }} />
        ))
      ) : filteredRest.length === 0 ? (
        <p style={{ fontSize: 14, color: '#8C867E', padding: '32px 16px', textAlign: 'center' }}>
          No clubs nearby. Try widening your search.
        </p>
      ) : (
        filteredRest.map((club) => {
          const isMember = myClubIds.includes(club.id);
          return (
            <button
              key={club.id}
              onClick={() => navigate(`/club/${club.id}`)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E4DC',
                borderRadius: 16,
                padding: 12,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                marginBottom: 8,
                cursor: 'pointer',
                width: 'calc(100% - 32px)',
                marginLeft: 16,
                marginRight: 16,
                textAlign: 'left' as const,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  flexShrink: 0,
                  backgroundColor: '#B85450',
                  backgroundImage: (club.logo_url || club.cover_url) ? `url(${club.logo_url || club.cover_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{club.name}</div>
                <div style={{ fontSize: 12, color: '#CC2B2B', fontWeight: 700, marginTop: 2 }}>
                  {(club.member_count || 0).toLocaleString()} members
                </div>
                <div style={{ fontSize: 11, color: '#8C867E', marginTop: 1 }}>
                  {[club.location, club.club_type?.replace(/_/g, ' ')].filter(Boolean).join(' · ')}
                </div>
              </div>
              {isMember ? (
                <span style={{
                  background: '#FFFFFF', border: '1.5px solid #CC2B2B',
                  color: '#CC2B2B', fontSize: 11, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 14, flexShrink: 0,
                }}>Joined</span>
              ) : (
                <div
                  onClick={(e) => handleJoin(club, e)}
                  style={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
                  }}
                >
                  <Plus size={18} color="#B0A89E" />
                </div>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
