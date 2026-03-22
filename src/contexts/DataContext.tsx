// ============================
// DataProvider — Simplified data layer (Supabase-backed)
// ============================
// All data now comes from Supabase queries in hooks/components.
// This context only provides the Supabase-backed repository interface
// for backward compatibility with components that still use useData().

import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  RevEvent, RevRoute, RevService,
  Club, ClubMembership, ClubPost, ClubEvent,
  ForumPost, ForumComment,
  MarketplaceListing, Conversation, HelpRequest, StolenVehicleAlert,
} from '@/models';

// Minimal repo interfaces for backward compatibility
interface SimpleEventsRepo {
  create: (event: Omit<RevEvent, 'id' | 'createdAt'>) => RevEvent;
}

interface SimpleRoutesRepo {
  create: (route: Omit<RevRoute, 'id' | 'createdAt'>) => RevRoute;
}

interface SimpleServicesRepo {
  create: (service: Omit<RevService, 'id' | 'createdAt'>) => RevService;
}

interface SimpleClubsRepo {
  create: (club: Omit<Club, 'id' | 'createdAt'>) => Club;
  isHandleAvailable: (handle: string) => boolean;
  join: (userId: string, clubId: string) => ClubMembership;
  leave: (userId: string, clubId: string) => void;
}

interface SimpleForumsRepo {
  createPost: (post: Omit<ForumPost, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>) => ForumPost;
  createComment: (comment: Omit<ForumComment, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>) => ForumComment;
}

interface SimpleHelpRepo {
  createHelpRequest: (request: Omit<HelpRequest, 'id' | 'createdAt'>) => HelpRequest;
  createStolenAlert: (alert: Omit<StolenVehicleAlert, 'id' | 'createdAt'>) => StolenVehicleAlert;
}

interface DataContextType {
  events: SimpleEventsRepo;
  routes: SimpleRoutesRepo;
  services: SimpleServicesRepo;
  clubs: SimpleClubsRepo;
  forums: SimpleForumsRepo;
  help: SimpleHelpRepo;
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
    friends: never[];
    activities: never[];
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
  // Local state caches for items created during this session
  const [localEvents, setLocalEvents] = useState<RevEvent[]>([]);
  const [localRoutes, setLocalRoutes] = useState<RevRoute[]>([]);
  const [localServices, setLocalServices] = useState<RevService[]>([]);
  const [localClubs, setLocalClubs] = useState<Club[]>([]);
  const [localForumPosts, setLocalForumPosts] = useState<ForumPost[]>([]);
  const [localHelpRequests, setLocalHelpRequests] = useState<HelpRequest[]>([]);
  const [localStolenAlerts, setLocalStolenAlerts] = useState<StolenVehicleAlert[]>([]);

  // Events repo that writes to Supabase
  const eventsRepo: SimpleEventsRepo = useMemo(() => ({
    create: (event) => {
      const newEvent: RevEvent = {
        ...event,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setLocalEvents(prev => [...prev, newEvent]);

      // Async Supabase insert
      (async () => {
        const { error } = await supabase.from('events').insert({
          created_by: event.createdBy,
          title: event.title,
          description: event.description,
          banner_url: event.bannerImage,
          date_start: event.startDate,
          date_end: event.endDate || null,
          location: event.locationName || event.location,
          lat: event.lat,
          lng: event.lng,
          type: event.eventType,
          vehicle_types: event.vehicleTypes || [],
          vehicle_brands: event.vehicleBrands || [],
          vehicle_categories: event.vehicleCategories || [],
          vehicle_ages: event.vehicleAges || [],
          max_attendees: event.maxAttendees,
          is_first_come_first_serve: event.firstComeFirstServe,
          entry_fee: event.entryFeeAmount || 0,
          is_free: event.entryFeeType === 'free',
          visibility: event.visibility === 'club' ? 'club' : event.visibility === 'friends' ? 'friends' : 'public',
          club_id: event.clubId || null,
        });
        if (error) toast.error('Failed to save event to database');
      })();

      return newEvent;
    },
  }), []);

  const routesRepo: SimpleRoutesRepo = useMemo(() => ({
    create: (route) => {
      const newRoute: RevRoute = {
        ...route,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setLocalRoutes(prev => [...prev, newRoute]);

      (async () => {
        const { error } = await supabase.from('routes').insert({
          created_by: route.createdBy,
          name: route.name,
          description: route.description,
          distance_meters: route.distance ? parseFloat(route.distance) : null,
          duration_minutes: route.durationMinutes,
          type: route.type,
          vehicle_type: route.vehicleType,
          difficulty: route.difficulty || null,
          surface_type: route.surfaceType || null,
          safety_tags: route.safetyTags || [],
          visibility: route.visibility === 'club' ? 'public' : route.visibility,
          lat: route.lat,
          lng: route.lng,
          geometry: route.polyline ? JSON.parse(route.polyline) : null,
          elevation_gain: route.elevationGain,
        });
        if (error) toast.error('Failed to save route to database');
      })();

      return newRoute;
    },
  }), []);

  const servicesRepo: SimpleServicesRepo = useMemo(() => ({
    create: (service) => {
      const newService: RevService = {
        ...service,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setLocalServices(prev => [...prev, newService]);

      (async () => {
        const { error } = await supabase.from('services').insert({
          created_by: service.createdBy,
          name: service.name,
          tagline: service.tagline,
          description: service.category,
          types: service.serviceTypes || [],
          lat: service.lat,
          lng: service.lng,
          address: service.address,
          service_type: service.serviceMode === 'mobile' ? 'mobile' : 'fixed',
          phone: service.phone,
          website: service.website,
        });
        if (error) toast.error('Failed to save service to database');
      })();

      return newService;
    },
  }), []);

  const clubsRepo: SimpleClubsRepo = useMemo(() => ({
    create: (club) => {
      const newClub: Club = {
        ...club,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setLocalClubs(prev => [...prev, newClub]);

      (async () => {
        const { data, error } = await supabase.from('clubs').insert({
          created_by: club.createdBy,
          name: club.name,
          handle: club.handle,
          description: club.description,
          club_type: club.clubType,
          tags: club.tags || [],
          vehicle_focus: club.vehicleFocus || [],
          visibility: club.visibility === 'private' ? 'members_only' : club.visibility === 'inviteOnly' ? 'invite_only' : 'public',
          join_mode: club.joinApproval === 'adminApproval' ? 'admin_approval' : 'auto',
          posting_permissions: club.postingPermissions === 'adminsOnly' ? 'admins_only' : 'any_member',
          rules: club.rules || [],
          social_links: club.socialLinks || {},
        }).select().single();

        if (!error && data) {
          // Auto-join as owner
          await supabase.from('club_memberships').insert({
            user_id: club.createdBy,
            club_id: data.id,
            role: 'owner',
          });
        }
        if (error) toast.error('Failed to save club');
      })();

      return newClub;
    },
    isHandleAvailable: (_handle: string) => true,
    join: (userId: string, clubId: string) => {
      (async () => {
        await supabase.from('club_memberships').insert({ user_id: userId, club_id: clubId, role: 'member' });
      })();
      return { id: crypto.randomUUID(), userId, clubId, clubName: '', role: 'member' as const, joinedAt: new Date().toISOString() };
    },
    leave: (userId: string, clubId: string) => {
      (async () => {
        await supabase.from('club_memberships').delete().eq('user_id', userId).eq('club_id', clubId);
      })();
    },
  }), []);

  const forumsRepo: SimpleForumsRepo = useMemo(() => ({
    createPost: (post) => {
      const newPost: ForumPost = {
        ...post,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        comments: 0,
      };
      setLocalForumPosts(prev => [...prev, newPost]);

      (async () => {
        await supabase.from('forum_posts').insert({
          user_id: post.author,
          club_id: post.clubId || null,
          type: post.type,
          title: post.title,
          body: post.body,
          category: post.category,
          photos: post.images || [],
        });
      })();

      return newPost;
    },
    createComment: (comment) => {
      const newComment: ForumComment = {
        ...comment,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
      };

      (async () => {
        await supabase.from('forum_comments').insert({
          post_id: comment.postId,
          user_id: comment.author,
          body: comment.content,
        });
      })();

      return newComment;
    },
  }), []);

  const helpRepo: SimpleHelpRepo = useMemo(() => ({
    createHelpRequest: (request) => {
      const newRequest: HelpRequest = {
        ...request,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setLocalHelpRequests(prev => [...prev, newRequest]);

      (async () => {
        await supabase.from('help_requests').insert({
          user_id: request.userId,
          issue_type: request.issueType.toLowerCase().replace(/ /g, '_'),
          details: request.description,
          lat: request.lat,
          lng: request.lng,
          help_source: request.helpSource,
          status: 'active',
        });
      })();

      return newRequest;
    },
    createStolenAlert: (alert) => {
      const newAlert: StolenVehicleAlert = {
        ...alert,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setLocalStolenAlerts(prev => [...prev, newAlert]);

      (async () => {
        await supabase.from('stolen_vehicle_alerts').insert({
          user_id: alert.userId,
          vehicle_id: alert.vehicleId || null,
          description: alert.vehicleDescription,
          last_seen_lat: alert.lat,
          last_seen_lng: alert.lng,
          status: 'active',
        });
      })();

      return newAlert;
    },
  }), []);

  const value: DataContextType = {
    events: eventsRepo,
    routes: routesRepo,
    services: servicesRepo,
    clubs: clubsRepo,
    forums: forumsRepo,
    help: helpRepo,
    state: {
      events: localEvents,
      routes: localRoutes,
      services: localServices,
      clubs: localClubs,
      clubMemberships: [],
      clubPosts: [],
      clubEvents: [],
      forumPosts: localForumPosts,
      forumComments: [],
      marketplace: [],
      friends: [],
      activities: [],
      conversations: [],
      savedRoutes: [],
      savedEvents: [],
      savedServices: [],
      savedListings: [],
      userAttendingEvents: [],
      userHostedEvents: [],
      helpRequests: localHelpRequests,
      stolenAlerts: localStolenAlerts,
    },
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
