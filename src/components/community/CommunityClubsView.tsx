import { useState, useEffect } from 'react';
import { Search, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ClubCodeInput from '@/components/clubs/ClubCodeInput';

type ClubsTab = 'discover' | 'my-clubs';

export default function CommunityClubsView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ClubsTab>('discover');

  // Discover state
  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubIds, setMyClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // My clubs state
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [myClubsLoading, setMyClubsLoading] = useState(true);

  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'make_model', label: 'Cars' },
    { value: 'motorcycles', label: 'Bikes' },
    { value: 'classics', label: 'Classic' },
    { value: 'track_racing', label: 'Track' },
    { value: 'regional', label: 'Regional' },
    { value: 'off_road', label: 'Off-Road' },
  ];

  // Fetch discover clubs
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from('clubs').select('*').eq('visibility', 'public');
      if (typeFilter !== 'all') query = query.eq('club_type', typeFilter);
      query = query.order('member_count', { ascending: false }).limit(30);
      const { data } = await query;
      setClubs(data || []);

      if (user?.id) {
        const { data: memberships } = await supabase.from('club_memberships').select('club_id').eq('user_id', user.id);
        setMyClubIds(memberships?.map(m => m.club_id) || []);
      }
      setLoading(false);
    };
    load();
  }, [user?.id, typeFilter]);

  // Fetch my clubs
  useEffect(() => {
    if (!user?.id || activeTab !== 'my-clubs') return;
    const load = async () => {
      setMyClubsLoading(true);
      const { data: memberships } = await supabase
        .from('club_memberships')
        .select('id, role, club_id, joined_at, status')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (memberships?.length) {
        const clubIds = memberships.map(m => m.club_id);
        const { data: clubsData } = await supabase.from('clubs').select('*').in('id', clubIds);
        const merged = memberships.map(m => {
          const c = clubsData?.find((cl: any) => cl.id === m.club_id);
          return c ? { ...c, myRole: m.role, myStatus: m.status, membershipId: m.id } : null;
        }).filter(Boolean);
        setMyClubs(merged);
      } else {
        setMyClubs([]);
      }
      setMyClubsLoading(false);
    };
    load();
  }, [user?.id, activeTab]);

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

  const refreshData = () => {
    setLoading(true);
    let query = supabase.from('clubs').select('*').eq('visibility', 'public');
    if (typeFilter !== 'all') query = query.eq('club_type', typeFilter);
    query.order('member_count', { ascending: false }).limit(30)
      .then(({ data }) => { setClubs(data || []); setLoading(false); });
    if (user?.id) {
      supabase.from('club_memberships').select('club_id').eq('user_id', user.id)
        .then(({ data }) => setMyClubIds(data?.map(m => m.club_id) || []));
    }
  };

  const featured = clubs.slice(0, 3);
  const rest = clubs.slice(3);
  const filteredRest = searchQuery.trim()
    ? rest.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : rest;

  const activeMyClubs = myClubs.filter(c => c.myStatus !== 'pending');
  const pendingMyClubs = myClubs.filter(c => c.myStatus === 'pending');

  return (
    <div style={{ background: '#ECEAE4', minHeight: '100%', paddingBottom: 96 }}>
      {/* Tab navigation */}
      <div style={{ display: 'flex', padding: '0 16px', borderBottom: '1px solid #E8E4DC', background: '#FFFFFF' }}>
        {([{ id: 'discover' as ClubsTab, label: 'Discover' }, { id: 'my-clubs' as ClubsTab, label: 'My Clubs' }]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              padding: '12px 0 14px', fontSize: 14,
              fontWeight: activeTab === tab.id ? 700 : 600,
              color: activeTab === tab.id ? '#CC2B2B' : '#B0A89E',
              borderBottom: activeTab === tab.id ? '2.5px solid #CC2B2B' : '2.5px solid transparent',
              marginBottom: -1, cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'discover' ? (
        <>
          {/* Search */}
          <div style={{ padding: '12px 16px 8px', position: 'relative' }}>
            <Search size={16} color="#8C867E" style={{ position: 'absolute', left: 30, top: 24, zIndex: 1, pointerEvents: 'none' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search clubs"
              style={{ width: '100%', background: '#F2EFE9', border: 'none', borderRadius: 12, padding: '11px 14px 11px 38px', fontSize: 14, color: '#4A443D', outline: 'none' }}
            />
          </div>

          {/* Club code input */}
          <ClubCodeInput onJoined={refreshData} />

          {/* Hero carousel */}
          {!loading && featured.length > 0 && (
            <>
              <style>{`.hero-scroll::-webkit-scrollbar{display:none}`}</style>
              <div className="hero-scroll" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', gap: 12, padding: '4px 16px 8px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' as any }}>
                {featured.map(club => (
                  <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{ flex: '0 0 calc(100% - 8px)', scrollSnapAlign: 'center', height: 160, borderRadius: 16, position: 'relative', overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer', backgroundColor: '#2C3E50', backgroundImage: club.cover_url ? `url(${club.cover_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />
                    <div style={{ position: 'absolute', top: 12, left: 12, background: '#CC2B2B', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', padding: '4px 10px', borderRadius: 6 }}>FEATURED</div>
                    <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, textAlign: 'left' as const }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px', lineHeight: 1.2 }}>{club.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{(club.member_count || 0).toLocaleString()} members{club.location ? ` · ${club.location}` : ''}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Type filter pills */}
          <div style={{ display: 'flex', gap: 6, padding: '4px 16px 12px', overflowX: 'auto' }}>
            {typeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 22, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: typeFilter === opt.value ? '#CC2B2B' : '#FFFFFF',
                  color: typeFilter === opt.value ? '#fff' : '#4A443D',
                  boxShadow: typeFilter === opt.value ? '0 2px 6px rgba(204,43,43,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Section label */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#B0A89E', letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '0 16px', marginBottom: 8 }}>
            {filteredRest.length} clubs
          </div>

          {/* Club list */}
          {loading ? [1,2,3].map(i => <div key={i} style={{ background: '#F0EDE6', borderRadius: 16, height: 80, margin: '0 16px 8px' }} />)
          : filteredRest.length === 0 ? <p style={{ fontSize: 14, color: '#8C867E', padding: '32px 16px', textAlign: 'center' }}>No clubs found. Try a different filter or enter a club code above.</p>
          : filteredRest.map(club => {
            const isMember = myClubIds.includes(club.id);
            return (
              <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{ background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: 16, padding: 12, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, cursor: 'pointer', width: 'calc(100% - 32px)', marginLeft: 16, marginRight: 16, textAlign: 'left' as const }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0, backgroundColor: '#B85450', backgroundImage: (club.logo_url || club.cover_url) ? `url(${club.logo_url || club.cover_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{club.name}</div>
                    {club.invite_code && <span style={{ fontSize: 9, fontWeight: 700, color: '#8C867E', background: '#F2EFE9', padding: '2px 5px', borderRadius: 4, fontFamily: 'monospace' }}>{club.invite_code.toUpperCase()}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#CC2B2B', fontWeight: 700, marginTop: 2 }}>{(club.member_count || 0).toLocaleString()} members</div>
                  <div style={{ fontSize: 11, color: '#8C867E', marginTop: 1 }}>{[club.location, club.club_type?.replace(/_/g, ' ')].filter(Boolean).join(' · ')}</div>
                </div>
                {isMember ? (
                  <span style={{ background: '#FFFFFF', border: '1.5px solid #CC2B2B', color: '#CC2B2B', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 14, flexShrink: 0 }}>Joined</span>
                ) : (
                  <div onClick={(e) => handleJoin(club, e)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                    <Plus size={18} color="#B0A89E" />
                  </div>
                )}
              </button>
            );
          })}
        </>
      ) : (
        /* My Clubs tab */
        <div style={{ padding: '12px 0' }}>
          {/* Club code input for My Clubs too */}
          <ClubCodeInput onJoined={() => { setActiveTab('my-clubs'); }} />

          {myClubsLoading ? [1,2,3].map(i => <div key={i} style={{ background: '#F0EDE6', borderRadius: 16, height: 80, margin: '0 16px 8px' }} />)
          : (
            <>
              {/* Pending */}
              {pendingMyClubs.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#B0A89E', letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '4px 16px 8px' }}>Pending approval</div>
                  {pendingMyClubs.map(club => (
                    <div key={club.id} style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 16, padding: 12, display: 'flex', gap: 12, alignItems: 'center', margin: '0 16px 8px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, backgroundColor: '#F59E0B', backgroundImage: club.logo_url ? `url(${club.logo_url})` : undefined, backgroundSize: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>{club.name}</div>
                        <div style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>Waiting for approval</div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Active clubs */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#B0A89E', letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '4px 16px 8px', marginTop: pendingMyClubs.length > 0 ? 8 : 0 }}>
                Your clubs ({activeMyClubs.length})
              </div>

              {activeMyClubs.length === 0 ? (
                <p style={{ fontSize: 14, color: '#8C867E', padding: '32px 16px', textAlign: 'center' }}>
                  You haven't joined any clubs yet. Discover clubs or enter a club code above.
                </p>
              ) : activeMyClubs.map(club => (
                <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{ background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: 16, padding: 12, display: 'flex', gap: 12, alignItems: 'center', margin: '0 16px 8px', cursor: 'pointer', width: 'calc(100% - 32px)', textAlign: 'left' as const }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0, backgroundColor: '#B85450', backgroundImage: (club.logo_url || club.cover_url) ? `url(${club.logo_url || club.cover_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{club.name}</div>
                      {(club.myRole === 'owner' || club.myRole === 'admin') && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: club.myRole === 'owner' ? '#CC2B2B' : '#0369A1', background: club.myRole === 'owner' ? '#FEF2F2' : '#F0F9FF', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' as const }}>{club.myRole}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#CC2B2B', fontWeight: 700, marginTop: 2 }}>{(club.member_count || 0).toLocaleString()} members</div>
                    <div style={{ fontSize: 11, color: '#8C867E', marginTop: 1 }}>{[club.location, club.club_type?.replace(/_/g, ' ')].filter(Boolean).join(' · ')}</div>
                  </div>
                  {(club.myRole === 'owner' || club.myRole === 'admin') && (
                    <div onClick={(e) => { e.stopPropagation(); navigate(`/club/${club.id}/settings`); }} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                      <Settings size={16} color="#8C867E" />
                    </div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
