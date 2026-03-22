// ============================
// Mock Repository Implementations
// ============================
// In-memory + React state. Replace with Supabase later.

import type {
  User, Vehicle, Friend, Achievement, UserActivity, UserStats,
  RevEvent, RevRoute, RevService,
  Club, ClubMembership, ClubPost, ClubEvent,
  ForumPost, ForumComment,
  MarketplaceListing,
  Conversation, Message,
  HelpRequest, StolenVehicleAlert, MapItem, DiscoveryStats,
} from '@/models';

import type {
  IUserRepository, IGarageRepository, IFriendsRepository,
  IEventsRepository, IRoutesRepository, IServicesRepository,
  IClubsRepository, IForumsRepository, IMarketplaceRepository,
  IMessagesRepository, IMapRepository, IHelpRepository,
  ViewportBounds,
} from '@/repositories/interfaces';

// ---- Helpers ----
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// ---- State holders (will be set from DataProvider) ----
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
  friends: { get: StateGetter<Friend[]>; set: StateSetter<Friend[]> };
  activities: { get: StateGetter<UserActivity[]>; set: StateSetter<UserActivity[]> };
  conversations: { get: StateGetter<Conversation[]>; set: StateSetter<Conversation[]> };
  savedRoutes: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  savedEvents: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  savedServices: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  savedListings: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  userAttendingEvents: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  userHostedEvents: { get: StateGetter<string[]>; set: StateSetter<string[]> };
  helpRequests: { get: StateGetter<HelpRequest[]>; set: StateSetter<HelpRequest[]> };
  stolenAlerts: { get: StateGetter<StolenVehicleAlert[]>; set: StateSetter<StolenVehicleAlert[]> };
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

  useEventCredit(userId: string): boolean {
    const user = this.store.currentUser.get();
    if (!user || user.id !== userId) return false;
    if (user.plan === 'pro' || user.plan === 'club') return true; // unlimited
    if (user.eventCredits <= 0) return false;
    this.store.currentUser.set({ ...user, eventCredits: user.eventCredits - 1 });
    return true;
  }

  useRouteCredit(userId: string): boolean {
    const user = this.store.currentUser.get();
    if (!user || user.id !== userId) return false;
    if (user.plan === 'pro' || user.plan === 'club') return true;
    if (user.routeCredits <= 0) return false;
    this.store.currentUser.set({ ...user, routeCredits: user.routeCredits - 1 });
    return true;
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

  getDiscoveryStats(): Pick<DiscoveryStats, 'eventsNearby'> {
    return { eventsNearby: this.store.events.get().length };
  }

  saveEvent(_userId: string, eventId: string): void {
    this.store.savedEvents.set(prev => prev.includes(eventId) ? prev : [...prev, eventId]);
  }

  unsaveEvent(_userId: string, eventId: string): void {
    this.store.savedEvents.set(prev => prev.filter(id => id !== eventId));
  }

  getSavedEvents(_userId: string): string[] {
    return this.store.savedEvents.get();
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

  getDiscoveryStats(): Pick<DiscoveryStats, 'routesTrending'> {
    // Mock: routes with rating >= 4.8 are "trending"
    const trending = this.store.routes.get().filter(r => r.rating >= 4.8).length;
    return { routesTrending: trending };
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

  update(id: string, updates: Partial<RevService>): RevService {
    let updated: RevService | undefined;
    this.store.services.set(prev => prev.map(s => {
      if (s.id === id) { updated = { ...s, ...updates }; return updated; }
      return s;
    }));
    return updated!;
  }

  delete(id: string): void {
    this.store.services.set(prev => prev.filter(s => s.id !== id));
  }

  getDiscoveryStats(): Pick<DiscoveryStats, 'servicesOpenNow'> {
    const openNow = this.store.services.get().filter(s => s.isOpen).length;
    return { servicesOpenNow: openNow };
  }

  saveService(_userId: string, serviceId: string): void {
    this.store.savedServices.set(prev => prev.includes(serviceId) ? prev : [...prev, serviceId]);
  }

  unsaveService(_userId: string, serviceId: string): void {
    this.store.savedServices.set(prev => prev.filter(id => id !== serviceId));
  }

  getSavedServices(_userId: string): string[] {
    return this.store.savedServices.get();
  }
}

// ---- Clubs Repository ----
export class MockClubsRepository implements IClubsRepository {
  constructor(private store: MockStoreConfig) {}

  getAll(): Club[] { return this.store.clubs.get(); }
  getById(id: string): Club | undefined { return this.store.clubs.get().find(c => c.id === id); }

  create(club: Omit<Club, 'id' | 'createdAt'>): Club {
    const newClub = { ...club, id: uid(), createdAt: now(), updatedAt: now() } as Club;
    this.store.clubs.set(prev => [...prev, newClub]);
    return newClub;
  }

  update(id: string, updates: Partial<Club>): Club {
    let updated: Club | undefined;
    this.store.clubs.set(prev => prev.map(c => {
      if (c.id === id) { updated = { ...c, ...updates, updatedAt: now() }; return updated; }
      return c;
    }));
    return updated!;
  }

  isHandleAvailable(handle: string): boolean {
    return !this.store.clubs.get().some(c => c.handle?.toLowerCase() === handle.toLowerCase());
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
  constructor(private store: MockStoreConfig) {}

  getMapItems(_bounds: ViewportBounds, categories: string[]): MapItem[] {
    const items: MapItem[] = [];

    // Convert events to map items
    if (categories.includes('event') || categories.length === 0) {
      this.store.events.get().forEach(e => {
        if (e.lat && e.lng) {
          items.push({ id: e.id, type: 'event', title: e.title, lat: e.lat, lng: e.lng, createdBy: e.createdBy, createdAt: e.createdAt, visibility: e.visibility === 'private' ? 'public' : e.visibility as 'public' | 'friends' | 'club' });
        }
      });
    }

    if (categories.includes('route') || categories.length === 0) {
      this.store.routes.get().forEach(r => {
        if (r.lat && r.lng) {
          items.push({ id: r.id, type: 'route', title: r.name, lat: r.lat, lng: r.lng, createdBy: r.createdBy, createdAt: r.createdAt, visibility: r.visibility === 'private' ? 'public' : r.visibility as 'public' | 'friends' | 'club' });
        }
      });
    }

    if (categories.includes('service') || categories.length === 0) {
      this.store.services.get().forEach(s => {
        if (s.lat && s.lng) {
          items.push({ id: s.id, type: 'service', title: s.name, lat: s.lat, lng: s.lng, createdBy: s.createdBy, createdAt: s.createdAt, visibility: s.visibility === 'private' ? 'public' : s.visibility as 'public' | 'friends' | 'club' });
        }
      });
    }

    if (categories.includes('help_request') || categories.length === 0) {
      this.store.helpRequests.get().filter(h => h.status === 'active').forEach(h => {
        items.push({ id: h.id, type: 'help_request', title: h.issueType, lat: h.lat, lng: h.lng, createdBy: h.userId, createdAt: h.createdAt, visibility: 'public' });
      });
    }

    return items;
  }

  createMapItem(item: Omit<MapItem, 'id' | 'createdAt'>): MapItem {
    return { ...item, id: uid(), createdAt: now() } as MapItem;
  }
}

// ---- Help / SOS Repository ----
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

  createStolenAlert(alert: Omit<StolenVehicleAlert, 'id' | 'createdAt'>): StolenVehicleAlert {
    const newAlert = { ...alert, id: uid(), createdAt: now() } as StolenVehicleAlert;
    this.store.stolenAlerts.set(prev => [...prev, newAlert]);
    return newAlert;
  }

  getActiveStolenAlerts(): StolenVehicleAlert[] {
    return this.store.stolenAlerts.get().filter(a => a.status === 'active');
  }
}
