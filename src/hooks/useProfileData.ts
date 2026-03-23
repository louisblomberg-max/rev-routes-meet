// ============================
// Profile Data Hooks (Supabase-backed)
// ============================
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// ---- Current User ----
export function useCurrentUser() {
  const { user } = useAuth();
  return { user, isLoading: false };
}

// ---- User Stats ----
export function useUserStatsData() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ garageCount: 0, friendsCount: 0, clubsCount: 0, eventsCount: 0, routesCount: 0, discussionsCount: 0, savedServicesCount: 0 });

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    const [vehicles, friends, clubs, events, routes, services] = await Promise.all([
      supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('friends').select('user_id', { count: 'exact', head: true }).or(`user_id.eq.${user.id},friend_id.eq.${user.id}`).eq('status', 'accepted'),
      supabase.from('club_memberships').select('club_id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('event_attendees').select('event_id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('routes').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
      supabase.from('saved_services').select('service_id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);
    setStats({
      garageCount: vehicles.count || 0,
      friendsCount: friends.count || 0,
      clubsCount: clubs.count || 0,
      eventsCount: events.count || 0,
      routesCount: routes.count || 0,
      discussionsCount: 0,
      savedServicesCount: services.count || 0,
    });
  }, [user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refetch when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    
    // Also listen for focus events (covers tab switching within SPA)
    window.addEventListener('focus', fetchStats);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchStats);
    };
  }, [fetchStats]);

  return stats;
}

// ---- Garage ----
export function useUserGarage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setIsLoading(false); return; }
    (async () => {
      const { data } = await supabase.from('vehicles').select('*').eq('user_id', user.id);
      setVehicles(data || []);
      setIsLoading(false);
    })();
  }, [user?.id]);

  return { vehicles, isLoading, error: null };
}

// ---- Friends ----
export function useUserFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user?.id) { setIsLoading(false); return; }
    setIsLoading(true);
    const { data } = await supabase
      .from('friends')
      .select('*, friend:profiles!friends_friend_id_fkey(id, username, display_name, avatar_url), requester:profiles!friends_user_id_fkey(id, username, display_name, avatar_url)')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (data) {
      setFriends(data.map((f: any) => {
        const isRequester = f.user_id === user.id;
        const other = isRequester ? f.friend : f.requester;
        return {
          id: isRequester ? f.friend_id : f.user_id,
          rawId: f.user_id + '-' + f.friend_id,
          userId: f.user_id,
          friendUserId: f.friend_id,
          username: other?.username || '',
          displayName: other?.display_name || '',
          avatar: other?.avatar_url || null,
          mutualFriends: 0,
          status: f.status === 'accepted' ? 'accepted' : isRequester ? 'pending_sent' : 'pending_received',
        };
      }));
    }
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const accepted = useMemo(() => friends.filter(f => f.status === 'accepted'), [friends]);
  const pendingReceived = useMemo(() => friends.filter(f => f.status === 'pending_received'), [friends]);
  const pendingSent = useMemo(() => friends.filter(f => f.status === 'pending_sent'), [friends]);

  return { friends, accepted, pendingReceived, pendingSent, isLoading, error: null, refetch: fetch };
}

// ---- Clubs ----
export interface UserClubData { membership: any; club: any; }

export function useUserClubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<UserClubData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setIsLoading(false); return; }
    (async () => {
      const { data } = await supabase.from('club_memberships').select('*, clubs(*)').eq('user_id', user.id);
      if (data) {
        setClubs(data.map((m: any) => ({
          membership: { id: m.user_id + '-' + m.club_id, userId: m.user_id, clubId: m.club_id, clubName: m.clubs?.name || '', role: m.role || 'member', joinedAt: m.joined_at },
          club: m.clubs ? { id: m.clubs.id, name: m.clubs.name, tagline: m.clubs.description?.slice(0, 60), members: m.clubs.member_count, location: '', ...m.clubs } : undefined,
        })));
      }
      setIsLoading(false);
    })();
  }, [user?.id]);

  const joined = useMemo(() => clubs.filter(c => c.membership.role === 'member'), [clubs]);
  const managed = useMemo(() => clubs.filter(c => c.membership.role === 'admin' || c.membership.role === 'owner'), [clubs]);

  return { clubs, joined, managed, isLoading, error: null };
}

// ---- Events ----
export function useUserEvents() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setIsLoading(false); return; }
    const now = new Date().toISOString();
    (async () => {
      const [attendingRes, hostingRes] = await Promise.all([
        supabase.from('event_attendees').select('event_id, events(*)').eq('user_id', user.id),
        supabase.from('events').select('*').eq('created_by', user.id),
      ]);

      const attendedEvents = (attendingRes.data || []).map((a: any) => ({
        ...a.events, id: a.events?.id, isHost: false, status: 'attending',
        title: a.events?.title, date: a.events?.date_start, location: a.events?.location,
        eventType: a.events?.type || 'Meets', attendees: 0,
      })).filter((e: any) => e.id);

      const hostedEvents = (hostingRes.data || []).map((e: any) => ({
        ...e, isHost: true, status: 'hosting', date: e.date_start, eventType: e.type || 'Meets', attendees: 0,
      }));

      const allEvents = [...attendedEvents, ...hostedEvents];
      const unique = Array.from(new Map(allEvents.map(e => [e.id, e])).values());

      setUpcoming(unique.filter(e => !e.date_start || new Date(e.date_start) >= new Date(now)));
      setPast(unique.filter(e => e.date_start && new Date(e.date_start) < new Date(now)));
      setIsLoading(false);
    })();
  }, [user?.id]);

  return { upcoming, past, saved, isLoading, error: null };
}

// ---- Saved Services ----
export function useUserSavedServices() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setIsLoading(false); return; }
    (async () => {
      const { data } = await supabase.from('saved_services').select('*, services(*)').eq('user_id', user.id);
      setSaved((data || []).map((s: any) => ({
        id: s.services?.id, name: s.services?.name, category: s.services?.service_type || 'Service',
        rating: s.services?.rating || 0, address: s.services?.address || '', ...s.services,
      })).filter((s: any) => s.id));
      setIsLoading(false);
    })();
  }, [user?.id]);

  return { saved, isLoading };
}

// ---- Routes ----
export function useUserRoutes() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<any[]>([]);
  const [created, setCreated] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setIsLoading(false); return; }
    (async () => {
      const [savedRes, createdRes] = await Promise.all([
        supabase.from('saved_routes').select('*, routes(*)').eq('user_id', user.id),
        supabase.from('routes').select('*').eq('created_by', user.id),
      ]);
      setSaved((savedRes.data || []).map((s: any) => ({
        id: s.routes?.id, name: s.routes?.name, type: s.routes?.type || 'Scenic',
        distance: s.routes?.distance_meters ? `${(s.routes.distance_meters / 1609).toFixed(1)} mi` : '—',
        rating: s.routes?.rating || 0, saves: s.routes?.saves || 0, drives: s.routes?.drives || 0, ...s.routes,
      })).filter((r: any) => r.id));
      setCreated((createdRes.data || []).map((r: any) => ({
        ...r, type: r.type || 'Scenic',
        distance: r.distance_meters ? `${(r.distance_meters / 1609).toFixed(1)} mi` : '—',
        rating: r.rating || 0,
      })));
      setIsLoading(false);
    })();
  }, [user?.id]);

  return { saved, created, isLoading, error: null };
}

// ---- Discussions ----
export function useUserDiscussions() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [savedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setIsLoading(false); return; }
    (async () => {
      const [postsRes, repliesRes] = await Promise.all([
        supabase.from('forum_posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('forum_comments').select('*, forum_posts(title, id)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setPosts((postsRes.data || []).map((p: any) => ({
        id: p.id, title: p.title, body: p.body, type: p.type || 'discussion',
        category: p.category || 'general', author: p.user_id, upvotes: p.upvotes || 0,
        downvotes: 0, comments: 0, createdAt: p.created_at,
      })));
      setReplies((repliesRes.data || []).map((r: any) => ({
        id: r.id, postId: r.forum_posts?.id, postTitle: r.forum_posts?.title || 'Unknown post',
        content: r.body, upvotes: r.upvotes || 0, createdAt: r.created_at,
      })));
      setIsLoading(false);
    })();
  }, [user?.id]);

  return { posts, replies, savedPosts, isLoading, error: null };
}
