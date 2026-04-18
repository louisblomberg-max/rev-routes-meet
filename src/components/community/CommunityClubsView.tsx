import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, MapPin, Users, Settings, ChevronRight, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ClubsTab = 'discover' | 'my-clubs';

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
    if (!club) { toast.error('Club not found. Check the code.'); return; }
    const { data: existing } = await supabase.from('club_memberships').select('id').eq('club_id', club.id).eq('user_id', user.id).maybeSingle();
    if (existing) { toast.error('Already a member.'); return; }
    if (club.join_mode === 'approval') {
      await supabase.from('club_join_requests').upsert({ club_id: club.id, user_id: user.id, status: 'pending' });
      toast.success(`Request sent to ${club.name}`); setSearchInput(''); return;
    }
    const { error } = await supabase.from('club_memberships').insert({ club_id: club.id, user_id: user.id, role: 'member' });
    if (!error) { setMyClubIds(prev => [...prev, club.id]); toast.success(`Joined ${club.name}!`); setSearchInput(''); }
  };

  const filtered = searchMode === 'search' && searchInput.trim()
    ? clubs.filter(c => c.name?.toLowerCase().includes(searchInput.toLowerCase()) || c.description?.toLowerCase().includes(searchInput.toLowerCase()))
    : clubs;

  const activeMyClubs = myClubs.filter(c => c.myStatus !== 'pending');
  const pendingMyClubs = myClubs.filter(c => c.myStatus === 'pending');

  const roleLabel = (role: string) => role === 'owner' ? 'Founder' : role === 'admin' ? 'Admin' : 'Member';
  const roleColor = (role: string) => role === 'owner' ? '#CC2B2B' : role === 'admin' ? '#D97706' : '#6B7280';

  return (
    <div style={{ background: '#ECEAE4', minHeight: '100%', paddingBottom: 96 }}>
      {/* Tab bar */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E4DC', padding: '0 16px', display: 'flex' }}>
        {(['discover', 'my-clubs'] as ClubsTab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            flex: 1, background: 'transparent', border: 'none', padding: '16px 0',
            fontSize: 15, fontWeight: activeTab === t ? 800 : 600,
            color: activeTab === t ? '#CC2B2B' : '#8C867E',
            borderBottom: activeTab === t ? '3px solid #CC2B2B' : '3px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            {t === 'discover' ? 'Discover' : `My Clubs (${activeMyClubs.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'discover' ? (
        <>
          {/* Search + filters */}
          <div style={{ background: '#FFFFFF', padding: 16, borderBottom: '1px solid #F0EDE6' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                {searchMode === 'search'
                  ? <Search size={20} color="#8C867E" style={{ position: 'absolute', left: 16, top: 14 }} />
                  : <Hash size={20} color="#8C867E" style={{ position: 'absolute', left: 16, top: 14 }} />}
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(searchMode === 'code' ? e.target.value.toUpperCase().replace(/\s/g, '') : e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && searchMode === 'code') handleCodeJoin(); }}
                  placeholder={searchMode === 'search' ? 'Search clubs...' : 'Enter club code'}
                  style={{
                    width: '100%', background: '#F8F7F4', border: 'none', borderRadius: 14,
                    padding: '14px 90px 14px 50px', fontSize: 16, color: '#111', outline: 'none',
                    fontFamily: searchMode === 'code' ? 'monospace' : 'inherit',
                    fontWeight: searchMode === 'code' ? 600 : 400,
                    letterSpacing: searchMode === 'code' ? '1.2px' : 'normal',
                  }}
                />
                <button onClick={() => { setSearchMode(prev => prev === 'search' ? 'code' : 'search'); setSearchInput(''); }} style={{
                  position: 'absolute', right: 8, top: 8, background: searchMode === 'code' ? '#CC2B2B' : '#E8E4DC',
                  color: searchMode === 'code' ? '#fff' : '#8C867E', border: 'none', borderRadius: 8,
                  padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px', textTransform: 'uppercase' as const,
                }}>{searchMode === 'search' ? 'CODE' : 'SEARCH'}</button>
              </div>
              {searchMode === 'code' && searchInput.trim() && (
                <button onClick={handleCodeJoin} style={{ background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Join</button>
              )}
              {searchMode === 'search' && (
                <button onClick={() => setShowFilters(!showFilters)} style={{
                  background: showFilters ? '#CC2B2B' : '#FFFFFF', color: showFilters ? '#fff' : '#111',
                  border: '1px solid #E8E4DC', borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600,
                }}><Filter size={16} /> Filter</button>
              )}
            </div>
            {showFilters && (
              <div style={{ background: '#F8F7F4', borderRadius: 12, padding: 12, marginTop: 12, display: 'flex', gap: 8 }}>
                {(Object.entries(filterOptions) as [string, { value: string; label: string }[]][]).map(([key, opts]) => (
                  <select key={key} value={filters[key as keyof typeof filters]} onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ flex: 1, background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontWeight: 600, color: '#111', cursor: 'pointer', outline: 'none' }}>
                    {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ))}
              </div>
            )}
          </div>

          {/* Discover list */}
          <div style={{ padding: 16 }}>
            {loading ? [1, 2, 3].map(i => (
              <div key={i} style={{ background: '#FFFFFF', borderRadius: 16, height: 180, marginBottom: 16, border: '1px solid #F0EDE6' }} />
            )) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8C867E' }}>
                <Users size={56} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 24px' }} />
                <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800, color: '#111' }}>No clubs found</h3>
                <p style={{ margin: '0 0 20px', fontSize: 15 }}>{searchInput ? 'Try a different search' : 'Be the first to create one!'}</p>
                <button onClick={() => navigate('/add/club')} style={{ background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Create Club</button>
              </div>
            ) : filtered.map(club => {
              const isMember = myClubIds.includes(club.id);
              const hasBanner = club.cover_url || club.logo_url;
              return (
                <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                  width: '100%', background: '#FFFFFF', border: '1px solid #F0EDE6', borderRadius: 16,
                  padding: 0, cursor: 'pointer', textAlign: 'left' as const, marginBottom: 16,
                  overflow: 'hidden', transition: 'all 0.2s ease',
                }} className="hover:shadow-lg active:scale-[0.99]">
                  {/* Banner */}
                  <div style={{
                    height: 120, position: 'relative',
                    background: hasBanner ? `url(${club.cover_url || club.logo_url})` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
                    {/* Type badge */}
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                      color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px',
                      borderRadius: 8, letterSpacing: '0.3px', textTransform: 'capitalize' as const,
                    }}>{club.club_type?.replace(/_/g, ' ') || 'Club'}</div>
                    {/* Name on banner */}
                    <div style={{ position: 'absolute', bottom: 12, left: 14, right: 60 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{club.name}</h3>
                      {club.location && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{club.location}</div>}
                    </div>
                    {/* Join button on banner */}
                    <div onClick={e => { e.stopPropagation(); if (!isMember) handleJoin(club, e); }} style={{ position: 'absolute', bottom: 10, right: 10 }}>
                      {isMember ? (
                        <span style={{ background: 'rgba(255,255,255,0.95)', color: '#059669', fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 16 }}>✓ Joined</span>
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#CC2B2B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(204,43,43,0.4)' }}>
                          <Plus size={20} color="#fff" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Footer */}
                  <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#CC2B2B', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={14} /> {(club.member_count || 0).toLocaleString()} members
                    </span>
                    {club.invite_code && <span style={{ fontSize: 10, fontWeight: 700, color: '#8C867E', background: '#F3F4F6', padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace', textTransform: 'uppercase' as const }}>{club.invite_code}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* My Clubs */
        <div style={{ padding: 16 }}>
          {/* Code input */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Hash size={20} color="#8C867E" style={{ position: 'absolute', left: 16, top: 14 }} />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value.toUpperCase().replace(/\s/g, ''))} onKeyDown={e => { if (e.key === 'Enter') handleCodeJoin(); }}
              placeholder="Join with club code" style={{ width: '100%', background: '#F8F7F4', border: 'none', borderRadius: 14, padding: '14px 16px 14px 50px', fontSize: 16, color: '#111', outline: 'none', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '1.2px' }} />
          </div>

          {myClubsLoading ? [1, 2].map(i => <div key={i} style={{ background: '#FFFFFF', borderRadius: 16, height: 180, marginBottom: 16, border: '1px solid #F0EDE6' }} />) : (
            <>
              {pendingMyClubs.length > 0 && (
                <>
                  <h4 style={{ fontSize: 12, fontWeight: 800, color: '#D97706', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 12, marginTop: 0 }}>Pending Approval</h4>
                  {pendingMyClubs.map(club => (
                    <div key={club.id} style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>{club.name?.[0]?.toUpperCase()}</div>
                      <div><div style={{ fontSize: 15, fontWeight: 700, color: '#92400E' }}>{club.name}</div><div style={{ fontSize: 13, color: '#D97706', fontWeight: 600 }}>Awaiting approval</div></div>
                    </div>
                  ))}
                </>
              )}

              {activeMyClubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8C867E' }}>
                  <Users size={48} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 20px' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>No clubs joined yet</p>
                  <p style={{ margin: '8px 0 16px', fontSize: 14 }}>Enter a code above or discover clubs</p>
                  <button onClick={() => setActiveTab('discover')} style={{ background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Discover Clubs</button>
                </div>
              ) : activeMyClubs.map(club => {
                const isAdmin = club.myRole === 'owner' || club.myRole === 'admin';
                const hasBanner = club.cover_url || club.logo_url;
                return (
                  <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                    width: '100%', background: '#FFFFFF',
                    border: isAdmin ? `2px solid ${roleColor(club.myRole)}30` : '1px solid #F0EDE6',
                    borderRadius: 16, padding: 0, marginBottom: 16, cursor: 'pointer', textAlign: 'left' as const,
                    overflow: 'hidden',
                  }} className="hover:shadow-lg active:scale-[0.99]">
                    {/* Banner */}
                    <div style={{
                      height: 100, position: 'relative',
                      background: hasBanner ? `url(${club.cover_url || club.logo_url})` : 'linear-gradient(135deg, #374151, #6B7280)',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.6) 100%)' }} />
                      {/* Role badge */}
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: roleColor(club.myRole), color: '#fff',
                        fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8,
                        textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                      }}>{roleLabel(club.myRole)}</div>
                      <div style={{ position: 'absolute', bottom: 10, left: 14 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{club.name}</h3>
                      </div>
                    </div>
                    {/* Footer */}
                    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 14, color: '#4A443D' }}>
                        <span style={{ fontWeight: 700, color: '#CC2B2B' }}>{(club.member_count || 0).toLocaleString()}</span>
                        <span style={{ color: '#8C867E' }}> members</span>
                        <span style={{ color: '#D1D5DB', margin: '0 6px' }}>·</span>
                        <span style={{ fontWeight: 700, color: roleColor(club.myRole) }}>{roleLabel(club.myRole)}</span>
                      </div>
                      {isAdmin ? (
                        <div onClick={e => { e.stopPropagation(); navigate(`/club/${club.id}/settings`); }} style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Settings size={16} color="#CC2B2B" />
                        </div>
                      ) : <ChevronRight size={20} color="#D1D5DB" />}
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
