import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, MapPin, Users, Settings, ChevronRight, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ClubsTab = 'discover' | 'my-clubs';

const TYPE_COLORS: Record<string, { fg: string; bg: string; gradient: string }> = {
  make_model: { fg: '#CC2B2B', bg: '#FEF2F2', gradient: 'linear-gradient(135deg, #CC2B2B, #FF6B6B)' },
  motorcycles: { fg: '#D97706', bg: '#FFF7ED', gradient: 'linear-gradient(135deg, #D97706, #FBBF24)' },
  regional: { fg: '#059669', bg: '#F0FDF4', gradient: 'linear-gradient(135deg, #059669, #34D399)' },
  classics: { fg: '#7C3AED', bg: '#F5F3FF', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)' },
  track_racing: { fg: '#0369A1', bg: '#F0F9FF', gradient: 'linear-gradient(135deg, #0369A1, #38BDF8)' },
  off_road: { fg: '#92400E', bg: '#FEF3C7', gradient: 'linear-gradient(135deg, #92400E, #D97706)' },
  general: { fg: '#6B7280', bg: '#F3F4F6', gradient: 'linear-gradient(135deg, #6B7280, #9CA3AF)' },
};

const getTypeColor = (type?: string) => TYPE_COLORS[type || 'general'] || TYPE_COLORS.general;

export default function CommunityClubsView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ClubsTab>('discover');

  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubIds, setMyClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [myClubsLoading, setMyClubsLoading] = useState(true);

  const [searchMode, setSearchMode] = useState<'search' | 'code'>('search');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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

  // Fetch discover clubs
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

  const handleCodeJoin = async () => {
    if (!searchInput.trim() || !user?.id) return;
    const { data: club } = await supabase.from('clubs').select('*').eq('invite_code', searchInput.trim().toLowerCase()).maybeSingle();
    if (!club) { toast.error('Club not found. Check the code and try again.'); return; }
    const { data: existing } = await supabase.from('club_memberships').select('id').eq('club_id', club.id).eq('user_id', user.id).maybeSingle();
    if (existing) { toast.error('You are already a member.'); return; }
    if (club.join_mode === 'approval') {
      await supabase.from('club_join_requests').upsert({ club_id: club.id, user_id: user.id, status: 'pending' });
      toast.success(`Join request sent to ${club.name}`); setSearchInput(''); return;
    }
    const { error } = await supabase.from('club_memberships').insert({ club_id: club.id, user_id: user.id, role: 'member' });
    if (!error) { setMyClubIds(prev => [...prev, club.id]); toast.success(`Joined ${club.name}!`); setSearchInput(''); }
  };

  const filtered = searchMode === 'search' && searchInput.trim()
    ? clubs.filter(c => c.name?.toLowerCase().includes(searchInput.toLowerCase()) || c.description?.toLowerCase().includes(searchInput.toLowerCase()))
    : clubs;

  const activeMyClubs = myClubs.filter(c => c.myStatus !== 'pending');
  const pendingMyClubs = myClubs.filter(c => c.myStatus === 'pending');

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
            {tab === 'discover' ? 'Discover Clubs' : `My Clubs (${activeMyClubs.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'discover' ? (
        <>
          {/* Smart search bar */}
          <div style={{ background: '#FFFFFF', padding: '12px 16px 16px', borderBottom: '1px solid #F0EDE6' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                {searchMode === 'search'
                  ? <Search size={18} color="#8C867E" style={{ position: 'absolute', left: 14, top: 13 }} />
                  : <Hash size={18} color="#8C867E" style={{ position: 'absolute', left: 14, top: 13 }} />
                }
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(searchMode === 'code' ? e.target.value.toUpperCase().replace(/\s/g, '') : e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && searchMode === 'code') handleCodeJoin(); }}
                  placeholder={searchMode === 'search' ? 'Search clubs...' : 'Enter club code'}
                  style={{
                    width: '100%', background: '#F8F7F4', border: '1px solid #F0EDE6', borderRadius: 12,
                    padding: '12px 80px 12px 44px', fontSize: 15, color: '#111', outline: 'none',
                    fontFamily: searchMode === 'code' ? 'monospace' : 'inherit',
                    letterSpacing: searchMode === 'code' ? '1px' : 'normal',
                  }}
                />
                <button
                  onClick={() => { setSearchMode(prev => prev === 'search' ? 'code' : 'search'); setSearchInput(''); }}
                  style={{
                    position: 'absolute', right: 8, top: 7,
                    background: searchMode === 'code' ? '#CC2B2B' : '#E8E4DC',
                    color: searchMode === 'code' ? '#fff' : '#8C867E',
                    border: 'none', borderRadius: 8, padding: '5px 10px',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px',
                  }}
                >
                  {searchMode === 'search' ? 'CODE' : 'SEARCH'}
                </button>
              </div>
              {searchMode === 'code' && searchInput.trim() && (
                <button onClick={handleCodeJoin} style={{
                  background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 12,
                  padding: '12px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                }}>Join</button>
              )}
              {searchMode === 'search' && (
                <button onClick={() => setShowFilters(!showFilters)} style={{
                  background: showFilters ? '#CC2B2B' : '#FFFFFF', color: showFilters ? '#fff' : '#111',
                  border: '1px solid #E8E4DC', borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, flexShrink: 0,
                }}>
                  <Filter size={16} /> Filter
                </button>
              )}
            </div>

            {/* Expandable filters */}
            {showFilters && (
              <div style={{ background: '#F8F7F4', borderRadius: 12, padding: 10, marginTop: 10, display: 'flex', gap: 8 }}>
                {(Object.entries(filterOptions) as [string, { value: string; label: string }[]][]).map(([key, opts]) => (
                  <select key={key} value={filters[key as keyof typeof filters]} onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ flex: 1, background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8, padding: '7px 8px', fontSize: 12, fontWeight: 600, color: '#111', cursor: 'pointer', outline: 'none' }}>
                    {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ))}
              </div>
            )}
          </div>

          {/* Club list */}
          <div style={{ padding: '12px 16px' }}>
            {loading ? [1, 2, 3].map(i => (
              <div key={i} style={{ background: '#F8F7F4', borderRadius: 18, height: 96, marginBottom: 12 }} />
            )) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', color: '#8C867E' }}>
                <Users size={48} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 20px' }} />
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111' }}>No clubs found</h3>
                <p style={{ margin: 0, fontSize: 14 }}>{searchInput ? 'Try a different search term' : 'Be the first to create a club!'}</p>
                <button onClick={() => navigate('/add/club')} style={{
                  background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 22,
                  padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 16,
                }}>Create Club</button>
              </div>
            ) : filtered.map(club => {
              const isMember = myClubIds.includes(club.id);
              const tc = getTypeColor(club.club_type);
              return (
                <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                  width: '100%', background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: 18,
                  padding: 0, cursor: 'pointer', textAlign: 'left' as const, marginBottom: 12,
                  overflow: 'hidden', transition: 'all 0.2s ease',
                }} className="hover:shadow-lg active:scale-[0.98]">
                  {/* Colour accent bar */}
                  <div style={{ height: 3, background: tc.gradient }} />
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      {/* Avatar */}
                      <div style={{
                        width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                        background: club.logo_url ? `url(${club.logo_url})` : tc.gradient,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 800, color: '#fff',
                      }}>
                        {!club.logo_url && club.name?.[0]?.toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{club.name}</h3>
                          {club.invite_code && <span style={{ fontSize: 10, fontWeight: 700, color: '#8C867E', background: '#F2EFE9', padding: '2px 6px', borderRadius: 6, fontFamily: 'monospace', textTransform: 'uppercase' as const }}>{club.invite_code}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                          <span style={{ color: '#CC2B2B', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Users size={14} /> {(club.member_count || 0).toLocaleString()}
                          </span>
                          {club.location && <><span style={{ color: '#D1D5DB' }}>·</span><span style={{ color: '#8C867E', fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} />{club.location}</span></>}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: tc.fg, background: tc.bg, padding: '3px 8px', borderRadius: 6, textTransform: 'capitalize' as const }}>
                          {club.club_type?.replace(/_/g, ' ') || 'Club'}
                        </span>
                      </div>

                      {/* Join */}
                      <div onClick={e => { e.stopPropagation(); if (!isMember) handleJoin(club, e); }}>
                        {isMember ? (
                          <span style={{ background: '#F0FDF4', border: '1.5px solid #10B981', color: '#059669', fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 16, flexShrink: 0 }}>✓ Joined</span>
                        ) : (
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#F8F7F4', border: '1px solid #E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <Plus size={18} color="#B0A89E" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* My Clubs */
        <div style={{ padding: '16px' }}>
          {/* Code input for My Clubs */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Hash size={18} color="#8C867E" style={{ position: 'absolute', left: 14, top: 13 }} />
            <input
              value={searchInput} onChange={e => setSearchInput(e.target.value.toUpperCase().replace(/\s/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') handleCodeJoin(); }}
              placeholder="Join with club code"
              style={{ width: '100%', background: '#F8F7F4', border: '1px solid #F0EDE6', borderRadius: 12, padding: '12px 16px 12px 44px', fontSize: 15, color: '#111', outline: 'none', fontFamily: 'monospace', letterSpacing: '1px' }}
            />
          </div>

          {myClubsLoading ? [1, 2].map(i => <div key={i} style={{ background: '#F8F7F4', borderRadius: 18, height: 88, marginBottom: 12 }} />) : (
            <>
              {pendingMyClubs.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#B0A89E', letterSpacing: '0.6px', textTransform: 'uppercase' as const, marginBottom: 8 }}>Pending approval</div>
                  {pendingMyClubs.map(club => (
                    <div key={club.id} style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 16, padding: 14, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: '#F59E0B', backgroundImage: club.logo_url ? `url(${club.logo_url})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
                        {!club.logo_url && club.name?.[0]?.toUpperCase()}
                      </div>
                      <div><div style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>{club.name}</div><div style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>Awaiting approval</div></div>
                    </div>
                  ))}
                </>
              )}

              <div style={{ fontSize: 11, fontWeight: 700, color: '#B0A89E', letterSpacing: '0.6px', textTransform: 'uppercase' as const, marginBottom: 8, marginTop: pendingMyClubs.length > 0 ? 16 : 0 }}>Your clubs ({activeMyClubs.length})</div>

              {activeMyClubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#8C867E' }}>
                  <Users size={48} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 16px' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No clubs joined yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13 }}>Discover clubs or enter a code above</p>
                </div>
              ) : activeMyClubs.map(club => {
                const isAdmin = club.myRole === 'owner' || club.myRole === 'admin';
                const tc = getTypeColor(club.club_type);
                return (
                  <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                    width: '100%', background: '#FFFFFF', border: isAdmin ? `1px solid ${tc.fg}30` : '1px solid #E8E4DC',
                    borderRadius: 18, padding: 0, marginBottom: 12, cursor: 'pointer', textAlign: 'left' as const,
                    overflow: 'hidden',
                  }}>
                    <div style={{ height: 3, background: tc.gradient }} />
                    <div style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0, background: club.logo_url ? `url(${club.logo_url})` : tc.gradient, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                        {!club.logo_url && club.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>{club.name}</h3>
                          {isAdmin && <span style={{ fontSize: 10, fontWeight: 700, color: tc.fg, background: tc.bg, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' as const }}>{club.myRole}</span>}
                        </div>
                        <span style={{ color: '#8C867E', fontSize: 13 }}>{(club.member_count || 0).toLocaleString()} members</span>
                      </div>
                      {isAdmin ? (
                        <div onClick={e => { e.stopPropagation(); navigate(`/club/${club.id}/settings`); }} style={{ width: 34, height: 34, borderRadius: '50%', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                          <Settings size={16} color={tc.fg} />
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
