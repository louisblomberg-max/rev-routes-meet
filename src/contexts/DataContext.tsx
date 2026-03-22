// ============================
// DataProvider — Supabase-backed data layer
// ============================
// Provides repository methods for creating/saving/unsaving items.
// All reads now come from Supabase queries in hooks/components.

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  RevEvent, RevRoute, RevService,
  Club, ClubMembership, ClubPost, ClubEvent,
  ForumPost, ForumComment,
  MarketplaceListing, Conversation, HelpRequest, StolenVehicleAlert,
  Friend, UserActivity,
} from '@/models';

interface EventsRepo {
  create: (event: Omit<RevEvent, 'id' | 'createdAt'>) => RevEvent;
  saveEvent: (userId: string, eventId: string) => void;
  unsaveEvent: (userId: string, eventId: string) => void;
  update: (id: string, updates: Partial<RevEvent>) => RevEvent;
}

interface RoutesRepo {
  create: (route: Omit<RevRoute, 'id' | 'createdAt'>) => RevRoute;
  saveRoute: (userId: string, routeId: string) => void;
  unsaveRoute: (userId: string, routeId: string) => void;
}

interface ServicesRepo {
  create: (service: Omit<RevService, 'id' | 'createdAt'>) => RevService;
  saveService: (userId: string, serviceId: string) => void;
  unsaveService: (userId: string, serviceId: string) => void;
}

interface ClubsRepo {
  create: (club: Omit<Club, 'id' | 'createdAt'>) => Club;
  isHandleAvailable: (handle: string) => boolean;
  join: (userId: string, clubId: string) => ClubMembership;
  leave: (userId: string, clubId: string) => void;
  createClubPost: (post: Omit<ClubPost, 'id'>) => ClubPost;
}

interface ForumsRepo {
  createPost: (post: Omit<ForumPost, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>) => ForumPost;
  createComment: (comment: Omit<ForumComment, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>) => ForumComment;
}

interface FriendsRepo {
  sendRequest: (userId: string, targetUserId: string) => Friend;
  acceptRequest: (friendId: string) => Friend;
  removeFriend: (friendId: string) => void;
}

interface HelpRepo {
  createHelpRequest: (request: Omit<HelpRequest, 'id' | 'createdAt'>) => HelpRequest;
  createStolenAlert: (alert: Omit<StolenVehicleAlert, 'id' | 'createdAt'>) => StolenVehicleAlert;
}

interface DataContextType {
  events: EventsRepo;
  routes: RoutesRepo;
  services: ServicesRepo;
  clubs: ClubsRepo;
  forums: ForumsRepo;
  friends: FriendsRepo;
  help: HelpRepo;
  state: {
    events: RevEvent[];
    routes: RevRoute[];
    services: RevService[];
    clubs: Club[];
    clubMemberships: ClubMembership[];
    clubPosts: ClubPost[];
    clubEvents: ClubEvent[];
    forumPosts: ForumPost[];
    forumComments: ForumComment[];
    marketplace: MarketplaceListing[];
    friends: Friend[];
    activities: UserActivity[];
    conversations: Conversation[];
    savedRoutes: string[];
    savedEvents: string[];
    savedServices: string[];
    savedListings: string[];
    userAttendingEvents: string[];
    userHostedEvents: string[];
    helpRequests: HelpRequest[];
    stolenAlerts: StolenVehicleAlert[];
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [localEvents, setLocalEvents] = useState<RevEvent[]>([]);
  const [localRoutes, setLocalRoutes] = useState<RevRoute[]>([]);
  const [localServices, setLocalServices] = useState<RevService[]>([]);
  const [localClubs, setLocalClubs] = useState<Club[]>([]);
  const [localForumPosts, setLocalForumPosts] = useState<ForumPost[]>([]);
  const [localHelpRequests, setLocalHelpRequests] = useState<HelpRequest[]>([]);
  const [localStolenAlerts, setLocalStolenAlerts] = useState<StolenVehicleAlert[]>([]);
  const [localSavedRoutes, setLocalSavedRoutes] = useState<string[]>([]);
  const [localSavedEvents, setLocalSavedEvents] = useState<string[]>([]);
  const [localSavedServices, setLocalSavedServices] = useState<string[]>([]);
  const [localAttendingEvents, setLocalAttendingEvents] = useState<string[]>([]);

  const eventsRepo: EventsRepo = useMemo(() => ({
    create: (event) => {
      const newEvent: RevEvent = { ...event, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setLocalEvents(prev => [...prev, newEvent]);
      (async () => {
        const { error } = await supabase.from('events').insert({
          created_by: event.createdBy, title: event.title, description: event.description,
          banner_url: event.bannerImage, date_start: event.startDate, date_end: event.endDate || null,
          location: event.locationName || event.location, lat: event.lat, lng: event.lng,
          type: event.eventType, vehicle_types: event.vehicleTypes || [],
          vehicle_brands: event.vehicleBrands || [], vehicle_categories: event.vehicleCategories || [],
          vehicle_ages: event.vehicleAges || [], max_attendees: event.maxAttendees,
          is_first_come_first_serve: event.firstComeFirstServe,
          entry_fee: event.entryFeeAmount || 0, is_free: event.entryFeeType === 'free',
          visibility: event.visibility === 'club' ? 'club' : event.visibility === 'friends' ? 'friends' : 'public',
          club_id: event.clubId || null,
        });
        if (error) toast.error('Failed to save event');
      })();
      return newEvent;
    },
    saveEvent: (userId, eventId) => {
      setLocalSavedEvents(prev => [...prev, eventId]);
      (async () => { await supabase.from('event_attendees').insert({ user_id: userId, event_id: eventId, status: 'attending' }); })();
    },
    unsaveEvent: (userId, eventId) => {
      setLocalSavedEvents(prev => prev.filter(id => id !== eventId));
      (async () => { await supabase.from('event_attendees').delete().eq('user_id', userId).eq('event_id', eventId); })();
    },
    update: (id, updates) => {
      setLocalEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      const dbUpdates: Record<string, unknown> = {};
      if (updates.attendees !== undefined) dbUpdates.max_attendees = updates.maxAttendees;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      (async () => { if (Object.keys(dbUpdates).length > 0) await supabase.from('events').update(dbUpdates).eq('id', id); })();
      return { id, ...updates } as RevEvent;
    },
  }), []);

  const routesRepo: RoutesRepo = useMemo(() => ({
    create: (route) => {
      const newRoute: RevRoute = { ...route, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setLocalRoutes(prev => [...prev, newRoute]);
      (async () => {
        const { error } = await supabase.from('routes').insert({
          created_by: route.createdBy, name: route.name, description: route.description,
          distance_meters: route.distance ? parseFloat(route.distance) : null,
          duration_minutes: route.durationMinutes, type: route.type, vehicle_type: route.vehicleType,
          difficulty: route.difficulty || null, surface_type: route.surfaceType || null,
          safety_tags: route.safetyTags || [], visibility: route.visibility === 'club' ? 'public' : route.visibility,
          lat: route.lat, lng: route.lng, geometry: route.polyline ? JSON.parse(route.polyline) : null,
          elevation_gain: route.elevationGain,
        });
        if (error) toast.error('Failed to save route');
      })();
      return newRoute;
    },
    saveRoute: (userId, routeId) => {
      setLocalSavedRoutes(prev => [...prev, routeId]);
      (async () => { await supabase.from('saved_routes').insert({ user_id: userId, route_id: routeId }); })();
    },
    unsaveRoute: (userId, routeId) => {
      setLocalSavedRoutes(prev => prev.filter(id => id !== routeId));
      (async () => { await supabase.from('saved_routes').delete().eq('user_id', userId).eq('route_id', routeId); })();
    },
  }), []);

  const servicesRepo: ServicesRepo = useMemo(() => ({
    create: (service) => {
      const newService: RevService = { ...service, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setLocalServices(prev => [...prev, newService]);
      (async () => {
        const { error } = await supabase.from('services').insert({
          created_by: service.createdBy, name: service.name, tagline: service.tagline,
          description: service.category, types: service.serviceTypes || [],
          lat: service.lat, lng: service.lng, address: service.address,
          service_type: service.serviceMode === 'mobile' ? 'mobile' : 'fixed',
          phone: service.phone, website: service.website,
        });
        if (error) toast.error('Failed to save service');
      })();
      return newService;
    },
    saveService: (userId, serviceId) => {
      setLocalSavedServices(prev => [...prev, serviceId]);
      (async () => { await supabase.from('saved_services').insert({ user_id: userId, service_id: serviceId }); })();
    },
    unsaveService: (userId, serviceId) => {
      setLocalSavedServices(prev => prev.filter(id => id !== serviceId));
      (async () => { await supabase.from('saved_services').delete().eq('user_id', userId).eq('service_id', serviceId); })();
    },
  }), []);

  const clubsRepo: ClubsRepo = useMemo(() => ({
    create: (club) => {
      const newClub: Club = { ...club, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setLocalClubs(prev => [...prev, newClub]);
      (async () => {
        const { data, error } = await supabase.from('clubs').insert([{
          created_by: club.createdBy, name: club.name, handle: club.handle,
          description: club.description, club_type: club.clubType,
          tags: club.tags || [], vehicle_focus: club.vehicleFocus || [],
          visibility: club.visibility === 'private' ? 'members_only' : club.visibility === 'inviteOnly' ? 'invite_only' : 'public',
          join_mode: club.joinApproval === 'adminApproval' ? 'admin_approval' : 'auto',
          posting_permissions: club.postingPermissions === 'adminsOnly' ? 'admins_only' : 'any_member',
          rules: club.rules || [], social_links: club.socialLinks || {},
        }] as any).select().single();
        if (!error && data) {
          await supabase.from('club_memberships').insert({ user_id: club.createdBy, club_id: data.id, role: 'owner' });
        }
        if (error) toast.error('Failed to save club');
      })();
      return newClub;
    },
    isHandleAvailable: (_handle: string) => true,
    join: (userId, clubId) => {
      (async () => { await supabase.from('club_memberships').insert({ user_id: userId, club_id: clubId, role: 'member' }); })();
      return { id: crypto.randomUUID(), userId, clubId, clubName: '', role: 'member' as const, joinedAt: new Date().toISOString() };
    },
    leave: (userId, clubId) => {
      (async () => { await supabase.from('club_memberships').delete().eq('user_id', userId).eq('club_id', clubId); })();
    },
    createClubPost: (post) => {
      const newPost: ClubPost = { ...post, id: crypto.randomUUID() };
      (async () => {
        await supabase.from('club_posts').insert({
          club_id: post.clubId, user_id: post.author, body: post.content, photos: [],
        });
      })();
      return newPost;
    },
  }), []);

  const forumsRepo: ForumsRepo = useMemo(() => ({
    createPost: (post) => {
      const newPost: ForumPost = { ...post, id: crypto.randomUUID(), createdAt: new Date().toISOString(), upvotes: 0, downvotes: 0, comments: 0 };
      setLocalForumPosts(prev => [...prev, newPost]);
      (async () => {
        await supabase.from('forum_posts').insert({
          user_id: post.author, club_id: post.clubId || null, type: post.type,
          title: post.title, body: post.body, category: post.category, photos: post.images || [],
        });
      })();
      return newPost;
    },
    createComment: (comment) => {
      const newComment: ForumComment = { ...comment, id: crypto.randomUUID(), createdAt: new Date().toISOString(), upvotes: 0, downvotes: 0 };
      (async () => {
        await supabase.from('forum_comments').insert({ post_id: comment.postId, user_id: comment.author, body: comment.content });
      })();
      return newComment;
    },
  }), []);

  const friendsRepo: FriendsRepo = useMemo(() => ({
    sendRequest: (userId, targetUserId) => {
      (async () => { await supabase.from('friends').insert({ user_id: userId, friend_id: targetUserId, status: 'pending' }); })();
      return { id: crypto.randomUUID(), userId, friendUserId: targetUserId, username: '', displayName: '', avatar: null, mutualFriends: 0, status: 'pending_sent' as const };
    },
    acceptRequest: (friendId) => {
      (async () => { await supabase.from('friends').update({ status: 'accepted' }).eq('user_id', friendId); })();
      return { id: friendId, userId: '', friendUserId: '', username: '', displayName: '', avatar: null, mutualFriends: 0, status: 'accepted' as const };
    },
    removeFriend: (friendId) => {
      (async () => { await supabase.from('friends').delete().eq('user_id', friendId); })();
    },
  }), []);

  const helpRepo: HelpRepo = useMemo(() => ({
    createHelpRequest: (request) => {
      const newRequest: HelpRequest = { ...request, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setLocalHelpRequests(prev => [...prev, newRequest]);
      (async () => {
        await supabase.from('help_requests').insert({
          user_id: request.userId, issue_type: request.issueType.toLowerCase().replace(/ /g, '_'),
          details: request.description, lat: request.lat, lng: request.lng,
          help_source: request.helpSource, status: 'active',
        });
      })();
      return newRequest;
    },
    createStolenAlert: (alert) => {
      const newAlert: StolenVehicleAlert = { ...alert, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setLocalStolenAlerts(prev => [...prev, newAlert]);
      (async () => {
        await supabase.from('stolen_vehicle_alerts').insert({
          user_id: alert.userId, vehicle_id: alert.vehicleId || null,
          description: alert.vehicleDescription, last_seen_lat: alert.lat, last_seen_lng: alert.lng, status: 'active',
        });
      })();
      return newAlert;
    },
  }), []);

  const value: DataContextType = {
    events: eventsRepo, routes: routesRepo, services: servicesRepo,
    clubs: clubsRepo, forums: forumsRepo, friends: friendsRepo, help: helpRepo,
    state: {
      events: localEvents, routes: localRoutes, services: localServices, clubs: localClubs,
      clubMemberships: [], clubPosts: [], clubEvents: [],
      forumPosts: localForumPosts, forumComments: [], marketplace: [],
      friends: [], activities: [], conversations: [],
      savedRoutes: localSavedRoutes, savedEvents: localSavedEvents,
      savedServices: localSavedServices, savedListings: [],
      userAttendingEvents: localAttendingEvents, userHostedEvents: [],
      helpRequests: localHelpRequests, stolenAlerts: localStolenAlerts,
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
