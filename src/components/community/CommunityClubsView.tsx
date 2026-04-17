import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Users, Settings, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ClubCodeInput from '@/components/clubs/ClubCodeInput';

type ClubsTab = 'discover' | 'my-clubs';

export default function CommunityClubsView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ClubsTab>('discover');

  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubIds, setMyClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [myClubsLoading, setMyClubsLoading] = useState(true);

  const [filters, setFilters] = useState({ type: 'all', location: 'all', size: 'all' });

  const filterOptions = {
    type: [
      { value: 'all', label: 'All Types' },
      { value: 'make_model', label: 'Car Clubs' },
      { value: 'motorcycles', label: 'Motorcycle' },
      { value: 'regional', label: 'Regional' },
      { value: 'classics', label: 'Classic Cars' },
      { value: 'track_racing', label: 'Track & Racing' },
      { value: 'off_road', label: 'Off-Road' },
    ],
    location: [
      { value: 'all', label: 'All Locations' },
      { value: 'london', label: 'London' },
      { value: 'manchester', label: 'Manchester' },
      { value: 'birmingham', label: 'Birmingham' },
      { value: 'scotland', label: 'Scotland' },
      { value: 'southwest', label: 'South West' },
    ],
    size: [
      { value: 'all', label: 'Any Size' },
      { value: 'small', label: 'Small (1-50)' },
      { value: 'medium', label: 'Medium (51-200)' },
      { value: 'large', label: 'Large (201+)' },
    ],
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from('clubs').select('*').eq('visibility', 'public');
      if (filters.type !== 'all') query = query.eq('club_type', filters.type);
      query = query.order('member_count', { ascending: false }).limit(20);
      const { data } = await query;
      setClubs(data || []);
      if (user?.id) {
        const { data: memberships } = await supabase.from('club_memberships').select('club_id').eq('user_id', user.id);
        setMyClubIds(memberships?.map(m => m.club_id) || []);
      }
      setLoading(false);
    };
    load();
  }, [user?.id, filters.type]);

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
        setMyClubs(memberships.map(m => {
          const c = clubsData?.find((cl: any) => cl.id === m.club_id);
          return c ? { ...c, myRole: m.role, myStatus: m.status } : null;
        }).filter(Boolean));
      } else { setMyClubs([]); }
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
      toast.success('Join request sent'); return;
    }
    if (club.join_mode === 'invite_only') { toast.error('This club is invite only'); return; }
    const { error } = await supabase.from('club_memberships').insert({ club_id: club.id, user_id: user.id, role: 'member' });
    if (!error) { setMyClubIds(prev => [...prev, club.id]); toast.success(`Joined ${club.name}!`); }
  };

  const refreshData = () => {
    setLoading(true);
    let query = supabase.from('clubs').select('*').eq('visibility', 'public');
    if (filters.type !== 'all') query = query.eq('club_type', filters.type);
    query.order('member_count', { ascending: false }).limit(20)
      .then(({ data }) => { setClubs(data || []); setLoading(false); });
    if (user?.id) {
      supabase.from('club_memberships').select('club_id').eq('user_id', user.id)
        .then(({ data }) => setMyClubIds(data?.map(m => m.club_id) || []));
    }
  };

  const filtered = searchQuery.trim()
    ? clubs.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : clubs;

  const activeMyClubs = myClubs.filter(c => c.myStatus !== 'pending');
  const pendingMyClubs = myClubs.filter(c => c.myStatus === 'pending');

  const selectStyle: React.CSSProperties = {
    background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: 8,
    padding: '8px 28px 8px 10px', fontSize: 13, fontWeight: 600, color: '#111',
    cursor: 'pointer', outline: 'none', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238C867E'%3E%3Cpath d='M7 10l5 5 5-5H7z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '14px',
  };

  return (
    <div style={{ background: '#ECEAE4', minHeight: '100%', paddingBottom: 96 }}>
      {/* Tabs */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E4DC', padding: '0 16px', display: 'flex' }}>
        {(['discover', 'my-clubs'] as ClubsTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, background: 'transparent', border: 'none', padding: '16px 0', fontSize: 15,
            fontWeight: activeTab === tab ? 700 : 600, color: activeTab === tab ? '#CC2B2B' : '#8C867E',
            borderBottom: activeTab === tab ? '3px solid #CC2B2B' : '3px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            {tab === 'discover' ? 'Discover' : 'My Clubs'}
          </button>
        ))}
      </div>

      {activeTab === 'discover' ? (
        <>
          <div style={{ background: '#FFFFFF', padding: 16, borderBottom: '1px solid #F0EDE6' }}>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={18} color="#8C867E" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clubs..."
                style={{ width: '100%', background: '#F8F7F4', border: '1px solid #F0EDE6', borderRadius: 12, padding: '12px 16px 12px 44px', fontSize: 15, color: '#111', outline: 'none' }}
              />
            </div>

            {/* Club code */}
            <ClubCodeInput onJoined={refreshData} />

            {/* Dropdown filters */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {(Object.entries(filterOptions) as [string, { value: string; label: string }[]][]).map(([key, options]) => (
                <select key={key} value={filters[key as keyof typeof filters]} onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...selectStyle, flex: 1 }}>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ padding: '12px 16px' }}>
            {loading ? [1, 2, 3].map(i => (
              <div key={i} style={{ background: '#F8F7F4', borderRadius: 16, height: 88, marginBottom: 12 }} />
            )) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#8C867E' }}>
                <Users size={48} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 16px' }} />
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>No clubs found</p>
                <p style={{ margin: '4px 0 0', fontSize: 13 }}>Try adjusting your filters or search</p>
              </div>
            ) : filtered.map(club => {
              const isMember = myClubIds.includes(club.id);
              return (
                <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                  width: '100%', background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: 16,
                  padding: 16, marginBottom: 12, cursor: 'pointer', textAlign: 'left' as const,
                  transition: 'box-shadow 0.2s ease',
                }} className="hover:shadow-md">
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, backgroundColor: '#E8E4DC', backgroundImage: (club.logo_url || club.cover_url) ? `url(${club.logo_url || club.cover_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{club.name}</h3>
                        {club.invite_code && <span style={{ fontSize: 10, fontWeight: 700, color: '#8C867E', background: '#F2EFE9', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', textTransform: 'uppercase' as const }}>{club.invite_code}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                        <span style={{ color: '#CC2B2B', fontWeight: 600 }}>{(club.member_count || 0).toLocaleString()} members</span>
                        {club.location && <><span style={{ color: '#D1D5DB' }}>·</span><span style={{ color: '#8C867E', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} />{club.location}</span></>}
                      </div>
                    </div>
                    {isMember ? (
                      <span style={{ background: '#fff', border: '1.5px solid #CC2B2B', color: '#CC2B2B', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 14, flexShrink: 0 }}>Joined</span>
                    ) : (
                      <div onClick={e => handleJoin(club, e)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                        <Plus size={20} color="#B0A89E" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ padding: 16 }}>
          <ClubCodeInput onJoined={() => setActiveTab('my-clubs')} />

          {myClubsLoading ? [1, 2].map(i => <div key={i} style={{ background: '#F8F7F4', borderRadius: 16, height: 88, marginBottom: 12 }} />) : (
            <>
              {pendingMyClubs.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#B0A89E', letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '4px 0 8px' }}>Pending approval</div>
                  {pendingMyClubs.map(club => (
                    <div key={club.id} style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 16, padding: 14, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, backgroundColor: '#F59E0B', backgroundImage: club.logo_url ? `url(${club.logo_url})` : undefined, backgroundSize: 'cover' }} />
                      <div><div style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>{club.name}</div><div style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>Waiting for approval</div></div>
                    </div>
                  ))}
                </>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#B0A89E', letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '4px 0 8px', marginTop: pendingMyClubs.length > 0 ? 8 : 0 }}>Your clubs ({activeMyClubs.length})</div>
              {activeMyClubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#8C867E' }}>
                  <Users size={48} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 16px' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No clubs joined yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13 }}>Discover clubs to join your first community</p>
                </div>
              ) : activeMyClubs.map(club => {
                const isAdmin = club.myRole === 'owner' || club.myRole === 'admin';
                return (
                  <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                    width: '100%', background: '#FFFFFF', border: isAdmin ? '1px solid #CC2B2B20' : '1px solid #E8E4DC',
                    borderRadius: 16, padding: 16, marginBottom: 12, cursor: 'pointer', textAlign: 'left' as const,
                  }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, backgroundColor: '#E8E4DC', backgroundImage: (club.logo_url || club.cover_url) ? `url(${club.logo_url || club.cover_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>{club.name}</h3>
                          {isAdmin && <span style={{ fontSize: 10, fontWeight: 700, color: club.myRole === 'owner' ? '#CC2B2B' : '#0369A1', background: club.myRole === 'owner' ? '#FEF2F2' : '#F0F9FF', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' as const }}>{club.myRole}</span>}
                        </div>
                        <span style={{ color: '#8C867E', fontSize: 13 }}>{(club.member_count || 0).toLocaleString()} members</span>
                      </div>
                      {isAdmin ? (
                        <div onClick={e => { e.stopPropagation(); navigate(`/club/${club.id}/settings`); }} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                          <Settings size={18} color="#CC2B2B" />
                        </div>
                      ) : <ChevronRight size={18} color="#B0A89E" style={{ flexShrink: 0 }} />}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
