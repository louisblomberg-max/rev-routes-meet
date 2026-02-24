// ============================
// Mock Repository Implementations
// ============================
// In-memory + localStorage. Replace with Supabase later.

import type {
  User, Vehicle, Friend, Achievement, UserActivity, UserStats,
  RevEvent, RevRoute, RevService,
  Club, ClubMembership, ClubPost, ClubEvent,
  ForumPost, ForumComment,
  MarketplaceListing,
  Conversation, Message,
  HelpRequest, MapItem,
} from '@/models';

import type {
  IUserRepository, IGarageRepository, IFriendsRepository,
  IEventsRepository, IRoutesRepository, IServicesRepository,
  IClubsRepository, IForumsRepository, IMarketplaceRepository,
  IMessagesRepository, IMapRepository, IHelpRepository,
  ViewportBounds,
} from '@/repositories/interfaces';

import {
  seedEvents, seedRoutes, seedServices, seedClubs,
  seedClubPosts, seedClubEvents,
  seedForumPosts, seedForumComments,
  seedMarketplaceListings,
} from './seedData';

// ---- Helpers ----
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(`revnet_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(`revnet_${key}`, JSON.stringify(data));
}

// ---- State holders (will be set from DataProvider) ----
// These are closures that return the latest state + setter from React
type StateGetter<T> = () => T;
type StateSetter<T> = (val: T | ((prev: T) => T)) => void;

export interface MockStoreConfig {
  events: { get: StateGetter<RevEvent[]>; set: StateSetter<RevEvent[]> };
  routes: { get: StateGetter<RevRoute[]>; set: StateSetter<RevRoute[]> };
  services: { get: StateGetter<RevService[]>; set: StateSetter<RevService[]> };
  clubs: { get: StateGetter<Club[]>; set: StateSetter<Club[]> };
  clubMemberships: { get: StateGetter<ClubMembership[]>; set: StateSetter<ClubMembership[]> };
  clubPosts: { get: StateGetter<ClubPost[]>; set: StateSetter<ClubPost[]> };
  clubEvents: { get: StateGetter<ClubEvent[]>; set: StateSetter<ClubEvent[]> };
  forumPosts: { get: StateGetter<ForumPost[]>; set: StateSetter<ForumPost[]> };
  forumComments: { get: StateGetter<ForumComment[]>; set: StateSetter<ForumComment[]> };
  marketplace: { get: StateGetter<MarketplaceListing[]>; set: StateSetter<MarketplaceListing[]> };
  vehicles: { get: StateGetter<Vehicle[]>; set: StateSetter<Vehicle[]> };
  friends: { get: StateGetter<Friend[]>; set: StateSetter<Friend[]> };
  activities: { get: StateGetter<UserActivity[]>; set: StateSetter<UserActivity[]> };
  conversations: { get: StateGetter<Conversation[]>; set: StateSetter<Conversation[]> };
  savedRoutes: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  savedListings: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  userAttendingEvents: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  userHostedEvents: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  helpRequests: { get: StateGetter<HelpRequest[]>; set: StateSetter<HelpRequest[]> };
  currentUser: { get: StateGetter<User | null>; set: StateSetter<User | null> };
}

// ---- User Repository ----
export class MockUserRepository implements IUserRepository {
  constructor(private store: MockStoreConfig) {}

  getCurrentUser(): User | null {
    return this.store.currentUser.get();
  }

  updateUser(updates: Partial<User>): User {
    const user = this.store.currentUser.get();
    if (!user) throw new Error('No user');
    const updated = { ...user, ...updates };
    this.store.currentUser.set(updated);
    return updated;
  }

  getUserStats(userId: string): UserStats {
    return {
      garageCount: this.store.vehicles.get().filter(v => v.userId === userId).length,
      friendsCount: this.store.friends.get().filter(f => f.status === 'accepted').length,
      clubsCount: this.store.clubMemberships.get().filter(m => m.userId === userId).length,
      eventsCount: this.store.userAttendingEvents.get().length + this.store.userHostedEvents.get().length,
      routesCount: this.store.savedRoutes.get().length,
      discussionsCount: this.store.activities.get().filter(a => a.type === 'forum_post' || a.type === 'forum_reply').length,
    };
  }

  getAchievements(_userId: string): Achievement[] {
    // Fresh user: no achievements earned
    return [
      { id: '1', name: 'Helper', icon: 'heart-handshake', earned: false, description: 'Responded to 5+ breakdown requests' },
      { id: '2', name: 'Road Master', icon: 'map', earned: false, description: 'Created 10+ routes' },
      { id: '3', name: 'Community Builder', icon: 'users', earned: false, description: 'Started a club with 50+ members' },
      { id: '4', name: 'Event Host', icon: 'calendar-check', earned: false, description: 'Hosted 3+ events' },
    ];
  }

  getActivities(userId: string): UserActivity[] {
    return this.store.activities.get().filter(a => a.userId === userId);
  }
}

// ---- Garage Repository ----
export class MockGarageRepository implements IGarageRepository {
  constructor(private store: MockStoreConfig) {}

  getVehicles(userId: string): Vehicle[] {
    return this.store.vehicles.get().filter(v => v.userId === userId);
  }

  addVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
    const newVehicle = { ...vehicle, id: uid() };
    this.store.vehicles.set(prev => [...prev, newVehicle]);
    return newVehicle;
  }

  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle {
    let updated: Vehicle | undefined;
    this.store.vehicles.set(prev => prev.map(v => {
      if (v.id === id) { updated = { ...v, ...updates }; return updated; }
      return v;
    }));
    return updated!;
  }

  removeVehicle(id: string): void {
    this.store.vehicles.set(prev => prev.filter(v => v.id !== id));
  }
}

// ---- Friends Repository ----
export class MockFriendsRepository implements IFriendsRepository {
  constructor(private store: MockStoreConfig) {}

  getFriends(_userId: string): Friend[] {
    return this.store.friends.get();
  }

  sendRequest(userId: string, targetUserId: string): Friend {
    const f: Friend = { id: uid(), userId, friendUserId: targetUserId, username: targetUserId, displayName: targetUserId, avatar: null, mutualFriends: 0, status: 'pending_sent' };
    this.store.friends.set(prev => [...prev, f]);
    return f;
  }

  acceptRequest(friendId: string): Friend {
    let updated: Friend | undefined;
    this.store.friends.set(prev => prev.map(f => {
      if (f.id === friendId) { updated = { ...f, status: 'accepted' }; return updated; }
      return f;
    }));
    return updated!;
  }

  declineRequest(friendId: string): void {
    this.store.friends.set(prev => prev.filter(f => f.id !== friendId));
  }

  removeFriend(friendId: string): void {
    this.store.friends.set(prev => prev.filter(f => f.id !== friendId));
  }
}

// ---- Events Repository ----
export class MockEventsRepository implements IEventsRepository {
  constructor(private store: MockStoreConfig) {}

  getAll(): RevEvent[] { return this.store.events.get(); }
  getById(id: string): RevEvent | undefined { return this.store.events.get().find(e => e.id === id); }
  
  create(event: Omit<RevEvent, 'id' | 'createdAt'>): RevEvent {
    const newEvent = { ...event, id: uid(), createdAt: now() } as RevEvent;
    this.store.events.set(prev => [...prev, newEvent]);
    return newEvent;
  }

  update(id: string, updates: Partial<RevEvent>): RevEvent {
    let updated: RevEvent | undefined;
    this.store.events.set(prev => prev.map(e => {
      if (e.id === id) { updated = { ...e, ...updates }; return updated; }
      return e;
    }));
    return updated!;
  }

  delete(id: string): void {
    this.store.events.set(prev => prev.filter(e => e.id !== id));
  }

  getUserEvents(userId: string): { upcoming: RevEvent[]; past: RevEvent[] } {
    const attending = this.store.userAttendingEvents.get();
    const hosted = this.store.userHostedEvents.get();
    const allIds = new Set([...attending, ...hosted]);
    const userEvents = this.store.events.get().filter(e => allIds.has(e.id) || e.createdBy === userId);
    return { upcoming: userEvents, past: [] };
  }
}

// ---- Routes Repository ----
export class MockRoutesRepository implements IRoutesRepository {
  constructor(private store: MockStoreConfig) {}

  getAll(): RevRoute[] { return this.store.routes.get(); }
  getById(id: string): RevRoute | undefined { return this.store.routes.get().find(r => r.id === id); }

  create(route: Omit<RevRoute, 'id' | 'createdAt'>): RevRoute {
    const newRoute = { ...route, id: uid(), createdAt: now() } as RevRoute;
    this.store.routes.set(prev => [...prev, newRoute]);
    return newRoute;
  }

  update(id: string, updates: Partial<RevRoute>): RevRoute {
    let updated: RevRoute | undefined;
    this.store.routes.set(prev => prev.map(r => {
      if (r.id === id) { updated = { ...r, ...updates }; return updated; }
      return r;
    }));
    return updated!;
  }

  delete(id: string): void {
    this.store.routes.set(prev => prev.filter(r => r.id !== id));
  }

  getUserRoutes(userId: string): { saved: RevRoute[]; created: RevRoute[] } {
    const savedIds = this.store.savedRoutes.get();
    const all = this.store.routes.get();
    return {
      saved: all.filter(r => savedIds.includes(r.id)),
      created: all.filter(r => r.createdBy === userId),
    };
  }

  saveRoute(_userId: string, routeId: string): void {
    this.store.savedRoutes.set(prev => [...prev, routeId]);
  }

  unsaveRoute(_userId: string, routeId: string): void {
    this.store.savedRoutes.set(prev => prev.filter(id => id !== routeId));
  }
}

// ---- Services Repository ----
export class MockServicesRepository implements IServicesRepository {
  constructor(private store: MockStoreConfig) {}

  getAll(): RevService[] { return this.store.services.get(); }
  getById(id: string): RevService | undefined { return this.store.services.get().find(s => s.id === id); }

  create(service: Omit<RevService, 'id' | 'createdAt'>): RevService {
    const newService = { ...service, id: uid(), createdAt: now() } as RevService;
    this.store.services.set(prev => [...prev, newService]);
    return newService;
  }
}

// ---- Clubs Repository ----
export class MockClubsRepository implements IClubsRepository {
  constructor(private store: MockStoreConfig) {}

  getAll(): Club[] { return this.store.clubs.get(); }
  getById(id: string): Club | undefined { return this.store.clubs.get().find(c => c.id === id); }

  create(club: Omit<Club, 'id' | 'createdAt'>): Club {
    const newClub = { ...club, id: uid(), createdAt: now() } as Club;
    this.store.clubs.set(prev => [...prev, newClub]);
    return newClub;
  }

  getMemberships(userId: string): ClubMembership[] {
    return this.store.clubMemberships.get().filter(m => m.userId === userId);
  }

  join(userId: string, clubId: string): ClubMembership {
    const club = this.getById(clubId);
    const m: ClubMembership = { id: uid(), userId, clubId, clubName: club?.name || '', role: 'member', joinedAt: now() };
    this.store.clubMemberships.set(prev => [...prev, m]);
    return m;
  }

  leave(userId: string, clubId: string): void {
    this.store.clubMemberships.set(prev => prev.filter(m => !(m.userId === userId && m.clubId === clubId)));
  }

  getClubPosts(clubId: string): ClubPost[] {
    return this.store.clubPosts.get().filter(p => p.clubId === clubId);
  }

  createClubPost(post: Omit<ClubPost, 'id'>): ClubPost {
    const newPost = { ...post, id: uid() };
    this.store.clubPosts.set(prev => [...prev, newPost]);
    return newPost;
  }

  getClubEvents(clubId: string): ClubEvent[] {
    return this.store.clubEvents.get().filter(e => e.clubId === clubId);
  }
}

// ---- Forums Repository ----
export class MockForumsRepository implements IForumsRepository {
  constructor(private store: MockStoreConfig) {}

  getPosts(): ForumPost[] { return this.store.forumPosts.get(); }
  getPostById(id: string): ForumPost | undefined { return this.store.forumPosts.get().find(p => p.id === id); }

  createPost(post: Omit<ForumPost, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>): ForumPost {
    const newPost: ForumPost = { ...post, id: uid(), createdAt: now(), upvotes: 0, downvotes: 0, comments: 0 };
    this.store.forumPosts.set(prev => [...prev, newPost]);
    return newPost;
  }

  getComments(postId: string): ForumComment[] {
    return this.store.forumComments.get().filter(c => c.postId === postId);
  }

  createComment(comment: Omit<ForumComment, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>): ForumComment {
    const newComment: ForumComment = { ...comment, id: uid(), createdAt: now(), upvotes: 0, downvotes: 0 };
    this.store.forumComments.set(prev => [...prev, newComment]);
    return newComment;
  }

  getUserPosts(userId: string): ForumPost[] {
    return this.store.forumPosts.get().filter(p => p.author === userId);
  }
}

// ---- Marketplace Repository ----
export class MockMarketplaceRepository implements IMarketplaceRepository {
  constructor(private store: MockStoreConfig) {}

  getListings(): MarketplaceListing[] { return this.store.marketplace.get(); }
  getById(id: string): MarketplaceListing | undefined { return this.store.marketplace.get().find(l => l.id === id); }

  createListing(listing: Omit<MarketplaceListing, 'id' | 'createdAt'>): MarketplaceListing {
    const newListing = { ...listing, id: uid(), createdAt: now() } as MarketplaceListing;
    this.store.marketplace.set(prev => [...prev, newListing]);
    return newListing;
  }

  getSavedListings(_userId: string): string[] {
    return this.store.savedListings.get();
  }

  saveListing(_userId: string, listingId: string): void {
    this.store.savedListings.set(prev => [...prev, listingId]);
  }

  unsaveListing(_userId: string, listingId: string): void {
    this.store.savedListings.set(prev => prev.filter(id => id !== listingId));
  }
}

// ---- Messages Repository ----
export class MockMessagesRepository implements IMessagesRepository {
  constructor(private store: MockStoreConfig) {}

  getConversations(_userId: string): Conversation[] {
    return this.store.conversations.get();
  }

  createConversation(conv: Omit<Conversation, 'id'>): Conversation {
    const newConv = { ...conv, id: uid() };
    this.store.conversations.set(prev => [newConv, ...prev]);
    return newConv;
  }

  updateConversation(id: string, updates: Partial<Conversation>): Conversation {
    let updated: Conversation | undefined;
    this.store.conversations.set(prev => prev.map(c => {
      if (c.id === id) { updated = { ...c, ...updates }; return updated; }
      return c;
    }));
    return updated!;
  }

  deleteConversation(id: string): void {
    this.store.conversations.set(prev => prev.filter(c => c.id !== id));
  }

  getMessages(_conversationId: string): Message[] { return []; }

  sendMessage(message: Omit<Message, 'id' | 'createdAt'>): Message {
    return { ...message, id: uid(), createdAt: now() };
  }
}

// ---- Map Repository ----
export class MockMapRepository implements IMapRepository {
  constructor(private _store: MockStoreConfig) {}

  getMapItems(_bounds: ViewportBounds, _categories: string[]): MapItem[] {
    return []; // Map items come from pins in MapContext
  }

  createMapItem(item: Omit<MapItem, 'id' | 'createdAt'>): MapItem {
    return { ...item, id: uid(), createdAt: now() } as MapItem;
  }
}

// ---- Help Repository ----
export class MockHelpRepository implements IHelpRepository {
  constructor(private store: MockStoreConfig) {}

  createHelpRequest(request: Omit<HelpRequest, 'id' | 'createdAt'>): HelpRequest {
    const newReq = { ...request, id: uid(), createdAt: now() } as HelpRequest;
    this.store.helpRequests.set(prev => [...prev, newReq]);
    return newReq;
  }

  getActiveRequests(): HelpRequest[] {
    return this.store.helpRequests.get().filter(r => r.status === 'active');
  }

  resolveRequest(id: string): void {
    this.store.helpRequests.set(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' as const } : r));
  }
}
