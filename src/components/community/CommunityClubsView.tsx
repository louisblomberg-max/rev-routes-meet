import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, Settings, ChevronRight, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Props { mode: 'discover' | 'my-clubs'; }

export default function CommunityClubsView({ mode }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubIds, setMyClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState('');

  const [geoLocation, setGeoLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userVehicles, setUserVehicles] = useState<any[]>([]);
  const [userProfileLocation, setUserProfileLocation] = useState('');

  const types = [
    { value: 'all', label: 'All' },
    { value: 'make_model', label: 'Cars' },
    { value: 'motorcycles', label: 'Bikes' },
    { value: 'classics', label: 'Classic' },
    { value: 'track_racing', label: 'Track' },
    { value: 'regional', label: 'Regional' },
    { value: 'off_road', label: 'Off-Road' },
  ];

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setGeoLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  // User data for personalisation
  useEffect(() => {
    if (!user?.id) return;
    supabase.from('vehicles').select('make, model, vehicle_type').eq('user_id', user.id)
      .then(({ data }) => setUserVehicles(data || []));
    supabase.from('profiles').select('location').eq('id', user.id).single()
      .then(({ data }) => setUserProfileLocation(data?.location || ''));
  }, [user?.id]);

  // Enrich with distance
  const addDistance = useCallback((list: any[]) => {
    if (!geoLocation) return list;
    return list.map(c => {
      if (!c.lat || !c.lng) return c;
      return { ...c, _dist: haversineMiles(geoLocation.lat, geoLocation.lng, c.lat, c.lng) };
    }).sort((a, b) => (a._dist ?? 9999) - (b._dist ?? 9999));
  }, [geoLocation]);

  // Fetch discover clubs
  useEffect(() => {
    if (mode !== 'discover') return;
    const load = async () => {
      setLoading(true);
      if (typeFilter !== 'all') {
        let q = supabase.from('clubs').select('*').eq('visibility', 'public').eq('club_type', typeFilter).order('member_count', { ascending: false }).limit(30);
        const { data } = await q;
        setClubs(addDistance(data || []));
      } else {
        const all: any[] = []; const seen = new Set<string>();
        if (userVehicles.length > 0) {
          const makes = userVehicles.map(v => v.make).filter(Boolean);
          if (makes.length > 0) {
            const p = makes.map(m => `name.ilike.%${m}%,description.ilike.%${m}%`).join(',');
            const { data } = await supabase.from('clubs').select('*').eq('visibility', 'public').or(p).order('member_count', { ascending: false }).limit(8);
            (data || []).forEach(c => { if (!seen.has(c.id)) { seen.add(c.id); all.push(c); } });
          }
        }
        if (userProfileLocation) {
          const { data } = await supabase.from('clubs').select('*').eq('visibility', 'public').ilike('location', `%${userProfileLocation.toLowerCase()}%`).order('member_count', { ascending: false }).limit(8);
          (data || []).forEach(c => { if (!seen.has(c.id)) { seen.add(c.id); all.push(c); } });
        }
        if (all.length < 20) {
          const { data } = await supabase.from('clubs').select('*').eq('visibility', 'public').order('member_count', { ascending: false }).limit(30);
          (data || []).forEach(c => { if (!seen.has(c.id) && all.length < 20) { seen.add(c.id); all.push(c); } });
        }
        setClubs(addDistance(all));
      }
      if (user?.id) {
        const { data: m } = await supabase.from('club_memberships').select('club_id').eq('user_id', user.id);
        setMyClubIds(m?.map(x => x.club_id) || []);
      }
      setLoading(false);
    };
    load();
  }, [mode, user?.id, typeFilter, userVehicles, userProfileLocation, addDistance]);

  // Fetch my clubs
  useEffect(() => {
    if (mode !== 'my-clubs' || !user?.id) return;
    setLoading(true);
    (async () => {
      const { data: memberships } = await supabase.from('club_memberships').select('id, role, club_id, status').eq('user_id', user.id).order('joined_at', { ascending: false });
      if (memberships?.length) {
        const ids = memberships.map(m => m.club_id);
        const { data: cd } = await supabase.from('clubs').select('*').in('id', ids);
        setMyClubs(memberships.map(m => { const c = cd?.find((x: any) => x.id === m.club_id); return c ? { ...c, myRole: m.role, myStatus: m.status } : null; }).filter(Boolean));
      } else { setMyClubs([]); }
      setLoading(false);
    })();
  }, [mode, user?.id]);

  const handleJoin = async (club: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) { navigate('/auth'); return; }
    if (myClubIds.includes(club.id)) return;
    if (club.join_mode === 'approval') { await supabase.from('club_join_requests').upsert({ club_id: club.id, user_id: user.id, status: 'pending' }); toast.success('Join request sent'); return; }
    if (club.join_mode === 'invite_only') { toast.error('Invite only'); return; }
    const { error } = await supabase.from('club_memberships').insert({ club_id: club.id, user_id: user.id, role: 'member' });
    if (!error) { setMyClubIds(prev => [...prev, club.id]); toast.success(`Joined ${club.name}!`); }
  };

  const handleCodeJoin = async () => {
    if (!codeInput.trim() || !user?.id) return;
    const { data: club } = await supabase.from('clubs').select('*').eq('invite_code', codeInput.trim().toLowerCase()).maybeSingle();
    if (!club) { toast.error('Club not found'); return; }
    const { data: ex } = await supabase.from('club_memberships').select('id').eq('club_id', club.id).eq('user_id', user.id).maybeSingle();
    if (ex) { toast.error('Already a member'); return; }
    const { error } = await supabase.from('club_memberships').insert({ club_id: club.id, user_id: user.id, role: 'member' });
    if (!error) { setMyClubIds(prev => [...prev, club.id]); toast.success(`Joined ${club.name}!`); setCodeInput(''); setShowCodeInput(false); }
  };

  const filtered = searchQuery.trim()
    ? clubs.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : clubs;

  const activeMyClubs = myClubs.filter(c => c.myStatus !== 'pending');
  const pendingMyClubs = myClubs.filter(c => c.myStatus === 'pending');
  const roleLabel = (r: string) => r === 'owner' ? 'Founder' : r === 'admin' ? 'Admin' : 'Member';

  const fmtDist = (d?: number) => d == null ? null : d < 1 ? '<1 mi' : `${Math.round(d)} mi`;

  // ── DISCOVER ──
  if (mode === 'discover') {
    return (
      <div style={{ background: '#FFFFFF', minHeight: '100%', paddingBottom: 96 }}>
        {/* Search */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#BBB" style={{ position: 'absolute', left: 14, top: 12 }} />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search clubs..."
              style={{ width: '100%', background: '#F5F5F5', border: 'none', borderRadius: 12, padding: '12px 14px 12px 42px', fontSize: 15, color: '#111', outline: 'none' }}
            />
          </div>
        </div>

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6, padding: '12px 16px', overflowX: 'auto' }}>
          {types.map(t => (
            <button key={t.value} onClick={() => setTypeFilter(t.value)} style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: typeFilter === t.value ? '#CC2B2B' : '#F5F5F5',
              color: typeFilter === t.value ? '#fff' : '#666',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Code link */}
        {!showCodeInput ? (
          <div style={{ padding: '0 16px 12px' }}>
            <button onClick={() => setShowCodeInput(true)} style={{ background: 'none', border: 'none', color: '#CC2B2B', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
              Have a club code?
            </button>
          </div>
        ) : (
          <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
            <input value={codeInput} onChange={e => setCodeInput(e.target.value.toUpperCase().replace(/\s/g, ''))} onKeyDown={e => { if (e.key === 'Enter') handleCodeJoin(); }}
              placeholder="Enter code" autoFocus
              style={{ flex: 1, background: '#F5F5F5', border: 'none', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#111', outline: 'none', fontFamily: 'monospace', letterSpacing: 1 }} />
            <button onClick={handleCodeJoin} style={{ background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Join</button>
            <button onClick={() => { setShowCodeInput(false); setCodeInput(''); }} style={{ background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        )}

        {/* Club list */}
        <div style={{ padding: '0 16px' }}>
          {loading ? [1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 72, borderRadius: 12, background: '#F9F9F9', marginBottom: 8 }} />
          )) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#AAA' }}>
              <Users size={40} color="#DDD" style={{ display: 'block', margin: '0 auto 16px' }} />
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>No clubs found</p>
              <p style={{ margin: '6px 0 20px', fontSize: 14 }}>{searchQuery ? 'Try a different search' : 'Be the first to create one'}</p>
              <button onClick={() => navigate('/add/club')} style={{ background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Create Club</button>
            </div>
          ) : filtered.map(club => {
            const isMember = myClubIds.includes(club.id);
            const dist = fmtDist(club._dist);
            return (
              <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0', borderBottom: '1px solid #F5F5F5',
                background: 'none', border: 'none', borderBottomStyle: 'solid' as const, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
                cursor: 'pointer', textAlign: 'left' as const,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: club.logo_url ? `url(${club.logo_url}) center/cover` : '#F0F0F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: '#BBB',
                }}>
                  {!club.logo_url && (club.name?.[0]?.toUpperCase() || '?')}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{club.name}</div>
                  <div style={{ fontSize: 13, color: '#999', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#CC2B2B', fontWeight: 600 }}>{(club.member_count || 0).toLocaleString()} members</span>
                    {dist && <><span>·</span><span>{dist}</span></>}
                    {club.location && !dist && <><span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><MapPin size={11} />{club.location}</span></>}
                  </div>
                </div>

                {/* Action */}
                {isMember ? (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#22C55E', flexShrink: 0 }}>Joined</span>
                ) : (
                  <div onClick={e => handleJoin(club, e)} style={{
                    width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #EEE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
                  }}>
                    <Plus size={16} color="#CC2B2B" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── MY CLUBS ──
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100%', paddingBottom: 96 }}>
      <div style={{ padding: '0 16px' }}>
        {loading ? [1, 2, 3].map(i => (
          <div key={i} style={{ height: 72, borderRadius: 12, background: '#F9F9F9', marginBottom: 8, marginTop: i === 1 ? 16 : 0 }} />
        )) : (
          <>
            {pendingMyClubs.length > 0 && (
              <div style={{ paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 10 }}>Pending</div>
                {pendingMyClubs.map(club => (
                  <div key={club.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #FEF3C7' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#D97706', flexShrink: 0 }}>{club.name?.[0]?.toUpperCase()}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{club.name}</div><div style={{ fontSize: 12, color: '#D97706', marginTop: 1 }}>Awaiting approval</div></div>
                  </div>
                ))}
              </div>
            )}

            {activeMyClubs.length === 0 && pendingMyClubs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#AAA' }}>
                <Users size={40} color="#DDD" style={{ display: 'block', margin: '0 auto 16px' }} />
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>No clubs yet</p>
                <p style={{ margin: '6px 0', fontSize: 14 }}>Find a club that matches your cars</p>
              </div>
            ) : (
              <div style={{ paddingTop: pendingMyClubs.length > 0 ? 16 : 12 }}>
                {activeMyClubs.map(club => {
                  const isAdmin = club.myRole === 'owner' || club.myRole === 'admin';
                  return (
                    <button key={club.id} onClick={() => navigate(`/club/${club.id}`)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 0', background: 'none', border: 'none',
                      borderBottom: '1px solid #F5F5F5', cursor: 'pointer', textAlign: 'left' as const,
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: club.logo_url ? `url(${club.logo_url}) center/cover` : '#F0F0F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 800, color: '#BBB',
                      }}>
                        {!club.logo_url && (club.name?.[0]?.toUpperCase() || '?')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{club.name}</span>
                          {isAdmin && <span style={{ fontSize: 10, fontWeight: 700, color: '#CC2B2B', background: '#FEF2F2', padding: '2px 6px', borderRadius: 4 }}>{roleLabel(club.myRole)}</span>}
                        </div>
                        <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
                          <span style={{ color: '#CC2B2B', fontWeight: 600 }}>{(club.member_count || 0).toLocaleString()}</span> members
                        </div>
                      </div>
                      {isAdmin ? (
                        <div onClick={e => { e.stopPropagation(); navigate(`/club/${club.id}/settings`); }} style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                          <Settings size={14} color="#CC2B2B" />
                        </div>
                      ) : <ChevronRight size={18} color="#DDD" style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
