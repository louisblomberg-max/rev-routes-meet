// ============================
// RevNet Domain Models
// ============================

// ---- User & Auth ----
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  location?: string;
  bio?: string;
  plan: PlanId;
  isProfileComplete: boolean;
  createdAt: string;
  preferences: UserPreferences;
  liveFeatures: LiveFeatures;
}

export type PlanId = 'free' | 'pro' | 'club';

export interface UserPreferences {
  mapStyle: 'standard' | 'night' | 'satellite';
  availableToHelp: boolean;
  locationSharingEnabled: boolean;
  notifications: {
    messages: boolean;
    events: boolean;
    clubs: boolean;
    forums: boolean;
    marketplace: boolean;
  };
}

export interface LiveFeatures {
  locationSharingEnabled: boolean;
  groupDrivesCount: number;
  breakdownHelpCount: number;
}

// ---- Vehicles / Garage ----
export interface Vehicle {
  id: string;
  userId: string;
  type: 'car' | 'bike';
  make: string;
  model: string;
  year: number;
  engineTrim?: string;
  mods?: string[];
  photos: string[];
  notes?: string;
  visibility: 'public' | 'friends' | 'private';
}

// ---- Friends ----
export interface Friend {
  id: string;
  userId: string;
  friendUserId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  mutualFriends: number;
  status: 'accepted' | 'pending_sent' | 'pending_received';
}

// ---- Achievements ----
export interface Achievement {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  description: string;
}

// ---- Activity ----
export interface UserActivity {
  id: string;
  userId: string;
  type: 'event_attended' | 'event_hosted' | 'route_created' | 'route_saved' | 'forum_post' | 'forum_reply' | 'club_post' | 'listing';
  title: string;
  date: string;
  link?: string;
}

// ---- Map Items (unified discovery model) ----
export type MapItemType = 'event' | 'route' | 'service' | 'help_request' | 'listing';

export interface MapItem {
  id: string;
  type: MapItemType;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  createdBy: string;
  createdAt: string;
  visibility: 'public' | 'friends' | 'club';
  expiresAt?: string;
  // Type-specific fields via discriminated extras
  [key: string]: unknown;
}

// ---- Events ----
export interface RevEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  lat?: number;
  lng?: number;
  vehicleType: string;
  eventType: string;
  attendees: number;
  createdBy: string;
  createdAt: string;
  photos?: string[];
  entryFee?: string;
  clubId?: string;
}

// ---- Routes ----
export interface RevRoute {
  id: string;
  name: string;
  description?: string;
  distance: string;
  type: string;
  vehicleType: 'car' | 'bike' | 'both';
  rating: number;
  createdBy: string;
  createdAt: string;
  lat?: number;
  lng?: number;
  polyline?: string; // geojson string for route line
  saves?: number;
  drives?: number;
}

// ---- Services ----
export interface RevService {
  id: string;
  name: string;
  category: string;
  serviceTypes: string[];
  rating: number;
  distance: string;
  reviewCount: number;
  openingHours: string;
  phone: string;
  address: string;
  isOpen: boolean;
  priceRange: string;
  lat?: number;
  lng?: number;
  createdBy: string;
  createdAt: string;
}

// ---- Clubs ----
export interface Club {
  id: string;
  name: string;
  tagline?: string;
  location: string;
  members: number;
  image: string | null;
  description?: string;
  rules?: string[];
  createdBy: string;
  createdAt: string;
}

export interface ClubMembership {
  id: string;
  userId: string;
  clubId: string;
  clubName: string;
  role: 'member' | 'admin';
  joinedAt: string;
}

export interface ClubPost {
  id: string;
  clubId: string;
  author: string;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  isPinned: boolean;
}

export interface ClubEvent {
  id: string;
  clubId: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
}

// ---- Forums ----
export type PostType = 'question' | 'advice' | 'discussion';

export interface ForumPost {
  id: string;
  title: string;
  body: string;
  type: PostType;
  category: string;
  clubId?: string;
  clubName?: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  images?: string[];
}

export interface ForumComment {
  id: string;
  postId: string;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  parentId?: string;
  replies?: ForumComment[];
}

// ---- Marketplace ----
export interface MarketplaceListing {
  id: string;
  title: string;
  price: string;
  location: string;
  category: string;
  image: string | null;
  mileage?: string;
  description?: string;
  condition?: string;
  sellerType?: string;
  negotiable?: boolean;
  createdBy: string;
  createdAt: string;
}

// ---- Messages ----
export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatar: string | null;
  isGroup: boolean;
  participants?: string[];
  isPinned: boolean;
  isMuted: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

// ---- Help / Breakdown ----
export interface HelpRequest {
  id: string;
  userId: string;
  type: 'breakdown' | 'stolen' | 'general';
  description: string;
  lat: number;
  lng: number;
  status: 'active' | 'resolved';
  createdAt: string;
}

// ---- User Stats (derived) ----
export interface UserStats {
  garageCount: number;
  friendsCount: number;
  clubsCount: number;
  eventsCount: number;
  routesCount: number;
  discussionsCount: number;
}

// ---- Route Models (detailed) ----
export type {
  Waypoint, RouteGeometry, RouteStats, RouteVisibility,
  RouteMedia, RouteDraft, PublishedRoute, PublishRouteFormData,
} from './route';
