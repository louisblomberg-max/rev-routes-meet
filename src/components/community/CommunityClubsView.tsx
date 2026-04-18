import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, MapPin, Users, Settings, ChevronRight, Hash, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ClubsTab = 'discover' | 'my-clubs';

interface CommunityClubsViewProps {
  tab: ClubsTab;
  onBack: () => void;
}

export default function CommunityClubsView({ tab, onBack }: CommunityClubsViewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeTab = tab;
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
      {/* Back header */}
      <div style={{
        background: '#FFFFFF', borderBottom: '1px solid #E8E4DC',
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
          <ArrowLeft size={22} color="#111" />
        </button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>
          {activeTab === 'discover' ? 'Discover Clubs' : 'My Clubs'}
        </h2>
      </div>

      {activeTab === 'discover' ? (
        <>
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
                  position: 'absolute', right: 8, top: 8,
                  background: searchMode === 'code' ? '#CC2B2B' : '#E8E4DC',
                  color: searchMode === 'code' ? '#fff' : '#8C867E',
                  border: 'none', borderRadius: 8, padding: '6px 12px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px', textTransform: 'uppercase' as const,
                }}>
                  {searchMode === 'search' ? 'CODE' : 'SEARCH'}
                </button>
              </div>
              {searchMode === 'code' && searchInput.trim() && (
                <button onClick={handleCodeJoin} style={{ background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Join</button>
              )}
              {searchMode === 'search' && (
                <button onClick={() => setShowFilters(!showFilters)} style={{
                  background: showFilters ? '#CC2B2B' : '#FFFFFF', color: showFilters ? '#fff' : '#111',
                  border: '1px solid #E8E4DC', borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600,
                }}>
                  <Filter size={16} /> Filter
                </button>
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

          <div style={{ padding: 16 }}>
            {loading ? [1, 2, 3].map(i => (
              <div key={i} style={{ background: '#FFFFFF', borderRadius: 16, height: 100, marginBottom: 16, border: '1px solid #F0EDE6' }} />
            )) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8C867E' }}>
                <Users size={56} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 24px' }} />
                <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800, color: '#111' }}>No clubs found</h3>
                <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.5 }}>{searchInput ? 'Try a different search term' : 'Be the first to create a club!'}</p>
                <button onClick={() => navigate('/add/club')} style={{ background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Create Club</button>
              </div>
            ) : filtered.map(club => {
              const isMember = myClubIds.includes(club.id);
              return (
                <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                  width: '100%', background: '#FFFFFF', border: '1px solid #F0EDE6', borderRadius: 16,
                  padding: 20, cursor: 'pointer', textAlign: 'left' as const, marginBottom: 16,
                  transition: 'all 0.2s ease',
                }} className="hover:shadow-lg hover:border-gray-300 active:scale-[0.99]">
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                      background: club.logo_url ? `url(${club.logo_url})` : 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, fontWeight: 800, color: '#6B7280', border: '2px solid #F9FAFB',
                    }}>
                      {!club.logo_url && club.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{club.name}</h3>
                        {club.invite_code && <span style={{ fontSize: 11, fontWeight: 700, color: '#8C867E', background: '#F3F4F6', padding: '4px 8px', borderRadius: 8, fontFamily: 'monospace', textTransform: 'uppercase' as const }}>{club.invite_code}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ color: '#CC2B2B', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Users size={16} /> {(club.member_count || 0).toLocaleString()} members
                        </span>
                        {club.location && <><span style={{ color: '#D1D5DB', fontSize: 18 }}>·</span><span style={{ color: '#8C867E', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} />{club.location}</span></>}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', background: '#F9FAFB', padding: '4px 10px', borderRadius: 8, textTransform: 'capitalize' as const, display: 'inline-block' }}>
                        {club.club_type?.replace(/_/g, ' ') || 'Club'}
                      </span>
                    </div>
                    <div onClick={e => { e.stopPropagation(); if (!isMember) handleJoin(club, e); }}>
                      {isMember ? (
                        <span style={{ background: '#F0FDF4', border: '2px solid #10B981', color: '#059669', fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 20, flexShrink: 0 }}>✓ Joined</span>
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F9FAFB', border: '2px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} className="hover:bg-red-50 hover:border-red-200">
                          <Plus size={20} color="#8C867E" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ padding: 16 }}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Hash size={20} color="#8C867E" style={{ position: 'absolute', left: 16, top: 14 }} />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value.toUpperCase().replace(/\s/g, ''))} onKeyDown={e => { if (e.key === 'Enter') handleCodeJoin(); }}
              placeholder="Join with club code"
              style={{ width: '100%', background: '#F8F7F4', border: 'none', borderRadius: 14, padding: '14px 16px 14px 50px', fontSize: 16, color: '#111', outline: 'none', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '1.2px' }}
            />
          </div>

          {myClubsLoading ? [1, 2].map(i => <div key={i} style={{ background: '#FFFFFF', borderRadius: 16, height: 90, marginBottom: 16, border: '1px solid #F0EDE6' }} />) : (
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

              <h4 style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 12, marginTop: pendingMyClubs.length > 0 ? 20 : 0 }}>Your Clubs ({activeMyClubs.length})</h4>

              {activeMyClubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8C867E' }}>
                  <Users size={48} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 20px' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>No clubs joined yet</p>
                  <p style={{ margin: '8px 0 0', fontSize: 14 }}>Enter a code above or discover clubs</p>
                </div>
              ) : activeMyClubs.map(club => {
                const isAdmin = club.myRole === 'owner' || club.myRole === 'admin';
                return (
                  <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                    width: '100%', background: '#FFFFFF', border: isAdmin ? '2px solid #FEE2E2' : '1px solid #F0EDE6',
                    borderRadius: 16, padding: 16, marginBottom: 12, cursor: 'pointer', textAlign: 'left' as const,
                    display: 'flex', gap: 14, alignItems: 'center',
                  }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0, background: club.logo_url ? `url(${club.logo_url})` : 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#6B7280' }}>
                      {!club.logo_url && club.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111' }}>{club.name}</h3>
                        {isAdmin && <span style={{ fontSize: 10, fontWeight: 800, color: '#CC2B2B', background: '#FEF2F2', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' as const }}>{club.myRole}</span>}
                      </div>
                      <span style={{ color: '#8C867E', fontSize: 14, fontWeight: 600 }}>{(club.member_count || 0).toLocaleString()} members</span>
                    </div>
                    {isAdmin ? (
                      <div onClick={e => { e.stopPropagation(); navigate(`/club/${club.id}/settings`); }} style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                        <Settings size={16} color="#CC2B2B" />
                      </div>
                    ) : <ChevronRight size={20} color="#D1D5DB" style={{ flexShrink: 0 }} />}
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
