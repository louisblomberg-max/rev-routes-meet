// ============================
// Repository Interfaces
// ============================
// These define the contract. Swap MockXxxRepository for SupabaseXxxRepository later.

import type {
  User, Vehicle, Friend, Achievement, UserActivity, UserStats,
  RevEvent, RevRoute, RevService,
  Club, ClubMembership, ClubPost, ClubEvent,
  ForumPost, ForumComment,
  MarketplaceListing,
  Conversation, Message,
  HelpRequest, StolenVehicleAlert,
  MapItem, DiscoveryStats,
} from '@/models';

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ---- User Repository ----
export interface IUserRepository {
  getCurrentUser(): User | null;
  updateUser(updates: Partial<User>): User;
  getUserStats(userId: string): UserStats;
  getAchievements(userId: string): Achievement[];
  getActivities(userId: string): UserActivity[];
  useEventCredit(userId: string): boolean; // returns false if no credits
  useRouteCredit(userId: string): boolean;
}

// ---- Garage Repository ----
export interface IGarageRepository {
  getVehicles(userId: string): Vehicle[];
  addVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle;
  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle;
  removeVehicle(id: string): void;
}

// ---- Friends Repository ----
export interface IFriendsRepository {
  getFriends(userId: string): Friend[];
  sendRequest(userId: string, targetUserId: string): Friend;
  acceptRequest(friendId: string): Friend;
  declineRequest(friendId: string): void;
  removeFriend(friendId: string): void;
}

// ---- Events Repository ----
export interface IEventsRepository {
  getAll(): RevEvent[];
  getById(id: string): RevEvent | undefined;
  create(event: Omit<RevEvent, 'id' | 'createdAt'>): RevEvent;
  update(id: string, updates: Partial<RevEvent>): RevEvent;
  delete(id: string): void;
  getUserEvents(userId: string): { upcoming: RevEvent[]; past: RevEvent[] };
  getDiscoveryStats(): Pick<DiscoveryStats, 'eventsNearby'>;
}

// ---- Routes Repository ----
export interface IRoutesRepository {
  getAll(): RevRoute[];
  getById(id: string): RevRoute | undefined;
  create(route: Omit<RevRoute, 'id' | 'createdAt'>): RevRoute;
  update(id: string, updates: Partial<RevRoute>): RevRoute;
  delete(id: string): void;
  getUserRoutes(userId: string): { saved: RevRoute[]; created: RevRoute[] };
  saveRoute(userId: string, routeId: string): void;
  unsaveRoute(userId: string, routeId: string): void;
  getDiscoveryStats(): Pick<DiscoveryStats, 'routesTrending'>;
}

// ---- Services Repository ----
export interface IServicesRepository {
  getAll(): RevService[];
  getById(id: string): RevService | undefined;
  create(service: Omit<RevService, 'id' | 'createdAt'>): RevService;
  update(id: string, updates: Partial<RevService>): RevService;
  delete(id: string): void;
  getDiscoveryStats(): Pick<DiscoveryStats, 'servicesOpenNow'>;
}

// ---- Clubs Repository ----
export interface IClubsRepository {
  getAll(): Club[];
  getById(id: string): Club | undefined;
  create(club: Omit<Club, 'id' | 'createdAt'>): Club;
  update(id: string, updates: Partial<Club>): Club;
  isHandleAvailable(handle: string): boolean;
  getMemberships(userId: string): ClubMembership[];
  join(userId: string, clubId: string): ClubMembership;
  leave(userId: string, clubId: string): void;
  getClubPosts(clubId: string): ClubPost[];
  createClubPost(post: Omit<ClubPost, 'id'>): ClubPost;
  getClubEvents(clubId: string): ClubEvent[];
}

// ---- Forums Repository ----
export interface IForumsRepository {
  getPosts(): ForumPost[];
  getPostById(id: string): ForumPost | undefined;
  createPost(post: Omit<ForumPost, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>): ForumPost;
  getComments(postId: string): ForumComment[];
  createComment(comment: Omit<ForumComment, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>): ForumComment;
  getUserPosts(userId: string): ForumPost[];
}

// ---- Marketplace Repository ----
export interface IMarketplaceRepository {
  getListings(): MarketplaceListing[];
  getById(id: string): MarketplaceListing | undefined;
  createListing(listing: Omit<MarketplaceListing, 'id' | 'createdAt'>): MarketplaceListing;
  getSavedListings(userId: string): string[];
  saveListing(userId: string, listingId: string): void;
  unsaveListing(userId: string, listingId: string): void;
}

// ---- Messages Repository ----
export interface IMessagesRepository {
  getConversations(userId: string): Conversation[];
  createConversation(conv: Omit<Conversation, 'id'>): Conversation;
  updateConversation(id: string, updates: Partial<Conversation>): Conversation;
  deleteConversation(id: string): void;
  getMessages(conversationId: string): Message[];
  sendMessage(message: Omit<Message, 'id' | 'createdAt'>): Message;
}

// ---- Map Repository ----
export interface IMapRepository {
  getMapItems(bounds: ViewportBounds, categories: string[]): MapItem[];
  createMapItem(item: Omit<MapItem, 'id' | 'createdAt'>): MapItem;
}

// ---- Help / SOS Repository ----
export interface IHelpRepository {
  createHelpRequest(request: Omit<HelpRequest, 'id' | 'createdAt'>): HelpRequest;
  getActiveRequests(): HelpRequest[];
  resolveRequest(id: string): void;
  // Stolen vehicle
  createStolenAlert(alert: Omit<StolenVehicleAlert, 'id' | 'createdAt'>): StolenVehicleAlert;
  getActiveStolenAlerts(): StolenVehicleAlert[];
}
