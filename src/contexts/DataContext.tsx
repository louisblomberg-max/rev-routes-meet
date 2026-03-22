// ============================
// DataProvider — Single data layer for the entire app
// ============================
// Currently backed by mock in-memory state. Set USE_SUPABASE = true to swap.

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import type {
  Friend, UserActivity,
  RevEvent, RevRoute, RevService,
  Club, ClubMembership, ClubPost, ClubEvent,
  ForumPost, ForumComment,
  MarketplaceListing, Conversation, HelpRequest, StolenVehicleAlert,
} from '@/models';

import {
  MockUserRepository, MockFriendsRepository,
  MockEventsRepository, MockRoutesRepository, MockServicesRepository,
  MockClubsRepository, MockForumsRepository, MockMarketplaceRepository,
  MockMessagesRepository, MockMapRepository, MockHelpRepository,
  type MockStoreConfig,
} from '@/repositories/mock/MockRepositories';

import type {
  IUserRepository, IFriendsRepository,
  IEventsRepository, IRoutesRepository, IServicesRepository,
  IClubsRepository, IForumsRepository, IMarketplaceRepository,
  IMessagesRepository, IMapRepository, IHelpRepository,
} from '@/repositories/interfaces';

import {
  seedEvents, seedRoutes, seedServices, seedClubs,
  seedClubPosts, seedClubEvents,
  seedForumPosts, seedForumComments,
  seedMarketplaceListings,
  seedUserFriends, seedUserActivities,
  seedUserClubMemberships, seedUserSavedRoutes, seedUserAttendingEvents,
} from '@/repositories/mock/seedData';

// Toggle this to swap mock repos for Supabase repos
const USE_SUPABASE = false;

// ---- Context Type ----
interface DataContextType {
  users: IUserRepository;
  friends: IFriendsRepository;
  events: IEventsRepository;
  routes: IRoutesRepository;
  services: IServicesRepository;
  clubs: IClubsRepository;
  forums: IForumsRepository;
  marketplace: IMarketplaceRepository;
  messages: IMessagesRepository;
  map: IMapRepository;
  help: IHelpRepository;
  // Direct state access for components that need reactive rendering
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
  // ---- All reactive state ----
  const [events, setEvents] = useState<RevEvent[]>(seedEvents);
  const [routes, setRoutes] = useState<RevRoute[]>(seedRoutes);
  const [services, setServices] = useState<RevService[]>(seedServices);
  const [clubs, setClubs] = useState<Club[]>(seedClubs);
  const [clubMemberships, setClubMemberships] = useState<ClubMembership[]>(seedUserClubMemberships);
  const [clubPosts, setClubPosts] = useState<ClubPost[]>(seedClubPosts);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>(seedClubEvents);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(seedForumPosts);
  const [forumComments, setForumComments] = useState<ForumComment[]>(seedForumComments);
  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>(seedMarketplaceListings);
  const [friends, setFriends] = useState<Friend[]>(seedUserFriends);
  const [activities, setActivities] = useState<UserActivity[]>(seedUserActivities);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<string[]>(seedUserSavedRoutes);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [savedServices, setSavedServices] = useState<string[]>([]);
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [userAttendingEvents, setUserAttendingEvents] = useState<string[]>(seedUserAttendingEvents);
  const [userHostedEvents, setUserHostedEvents] = useState<string[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [stolenAlerts, setStolenAlerts] = useState<StolenVehicleAlert[]>([]);

  // ---- Store config (bridges React state to repository classes) ----
  const storeConfig: MockStoreConfig = useMemo(() => ({
    events: { get: () => events, set: setEvents },
    routes: { get: () => routes, set: setRoutes },
    services: { get: () => services, set: setServices },
    clubs: { get: () => clubs, set: setClubs },
    clubMemberships: { get: () => clubMemberships, set: setClubMemberships },
    clubPosts: { get: () => clubPosts, set: setClubPosts },
    clubEvents: { get: () => clubEvents, set: setClubEvents },
    forumPosts: { get: () => forumPosts, set: setForumPosts },
    forumComments: { get: () => forumComments, set: setForumComments },
    marketplace: { get: () => marketplace, set: setMarketplace },
    friends: { get: () => friends, set: setFriends },
    activities: { get: () => activities, set: setActivities },
    conversations: { get: () => conversations, set: setConversations },
    savedRoutes: { get: () => savedRoutes, set: setSavedRoutes },
    savedEvents: { get: () => savedEvents, set: setSavedEvents },
    savedServices: { get: () => savedServices, set: setSavedServices },
    savedListings: { get: () => savedListings, set: setSavedListings },
    userAttendingEvents: { get: () => userAttendingEvents, set: setUserAttendingEvents },
    userHostedEvents: { get: () => userHostedEvents, set: setUserHostedEvents },
    helpRequests: { get: () => helpRequests, set: setHelpRequests },
    stolenAlerts: { get: () => stolenAlerts, set: setStolenAlerts },
  }), [events, routes, services, clubs, clubMemberships, clubPosts, clubEvents, forumPosts, forumComments, marketplace, friends, activities, conversations, savedRoutes, savedEvents, savedServices, savedListings, userAttendingEvents, userHostedEvents, helpRequests, stolenAlerts]);

  // ---- Repository instances ----
  // When USE_SUPABASE is true, swap these for Supabase implementations
  const repos = useMemo(() => {
    if (USE_SUPABASE) {
      // TODO: Import and instantiate Supabase repositories here
      // e.g. new SupabaseEventsRepository(supabase), etc.
      throw new Error('Supabase repositories not yet connected. Set USE_SUPABASE = false.');
    }
    return {
      users: new MockUserRepository(storeConfig),
      friends: new MockFriendsRepository(storeConfig),
      events: new MockEventsRepository(storeConfig),
      routes: new MockRoutesRepository(storeConfig),
      services: new MockServicesRepository(storeConfig),
      clubs: new MockClubsRepository(storeConfig),
      forums: new MockForumsRepository(storeConfig),
      marketplace: new MockMarketplaceRepository(storeConfig),
      messages: new MockMessagesRepository(storeConfig),
      map: new MockMapRepository(storeConfig),
      help: new MockHelpRepository(storeConfig),
    };
  }, [storeConfig]);

  const value: DataContextType = {
    ...repos,
    state: {
      events, routes, services, clubs,
      clubMemberships, clubPosts, clubEvents,
      forumPosts, forumComments,
      marketplace, friends, activities,
      conversations, savedRoutes, savedEvents, savedServices, savedListings,
      userAttendingEvents, userHostedEvents, helpRequests,
      stolenAlerts,
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
