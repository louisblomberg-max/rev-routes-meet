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
  // Revenue / credits
  eventCredits: number;
  routeCredits: number;
}

export type PlanId = 'free' | 'pro' | 'club';

export interface UserPreferences {
  mapStyle: 'standard' | 'night' | 'satellite';
  availableToHelp: boolean;
  helpDistanceMiles: number; // 5 | 10 | 25
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

// ---- Subscription Plans ----
export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  price: number; // monthly in GBP, 0 for free
  features: string[];
  eventCreditsPerMonth: number; // -1 = unlimited
  routeCreditsPerMonth: number;
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
  [key: string]: unknown;
}

// ---- Visibility (shared enum) ----
export type ContentVisibility = 'public' | 'club' | 'friends' | 'private';

// ---- Events ----
export interface RevEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  location: string;
  lat?: number;
  lng?: number;
  vehicleTypes: string[];
  /** @deprecated Use vehicleTypes instead. Kept for backward compat. */
  vehicleType?: string;
  eventType: string;
  attendees: number;
  createdBy: string;
  createdAt: string;
  photos?: string[];
  entryFee?: string;
  clubId?: string;
  visibility: ContentVisibility;
  tags: string[];
  // New fields
  isMultiDay: boolean;
  isRecurring: boolean;
  recurrenceType?: 'weekly' | 'monthly';
  earlyBirdPrice?: string;
  earlyBirdDeadline?: string;
  ticketLimit?: number;
  ticketsSold?: number;
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
  polyline?: string;
  saves?: number;
  drives?: number;
  visibility: ContentVisibility;
  tags: string[];
  // New fields
  elevationGain?: number;
  scenicRating?: number;
  trafficLevel?: 'low' | 'moderate' | 'heavy';
  surfaceType?: 'tarmac' | 'gravel' | 'mixed' | 'dirt';
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'expert';
  safetyTags?: string[];
  durationMinutes?: number;
}

// ---- Safety Tags (canonical list) ----
export const SAFETY_TAGS = [
  'Narrow roads',
  'Low car warning',
  'Avoid at night',
  'High traffic',
  'Seasonal closure risk',
  'Speed cameras',
  'Livestock crossing',
  'Flood risk',
] as const;

export type SafetyTag = typeof SAFETY_TAGS[number];

// ---- Event Types (canonical list) ----
export const EVENT_TYPES = [
  'Meets',
  'Cars & Coffee',
  'Track Day',
  'Group Drive',
  'Show / Exhibition',
  'Drive-Out',
] as const;

export type EventType = typeof EVENT_TYPES[number];

// ---- Services ----
export interface RevService {
  id: string;
  name: string;
  tagline?: string;
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
  visibility: ContentVisibility;
  // New fields
  yearsInBusiness?: number;
  certifications?: string[];
  emergencyCalloutFee?: string;
  acceptedPaymentMethods?: string[];
  servicesOffered?: string[];
  website?: string;
  socialLinks?: { instagram?: string; tiktok?: string; youtube?: string; x?: string };
  // Business verification
  vatRegistered?: boolean;
  companyNumber?: string;
  insuranceVerified?: boolean;
  insuranceDocumentUrl?: string;
  // Pro features
  isFeatured?: boolean;
  isVerified?: boolean;
  isBoosted?: boolean;
  // Service type
  serviceMode?: 'fixed' | 'mobile';
  mobileRadiusMiles?: number;
  logo?: string | null;
  coverImage?: string | null;
  galleryImages?: string[];
}

// ---- Clubs ----
export type ClubVisibility = 'public' | 'private' | 'inviteOnly';
export type ClubJoinApproval = 'auto' | 'adminApproval';
export type ClubPostingPermission = 'anyMember' | 'adminsOnly';

export interface ClubSocialLinks {
  instagram?: string;
  website?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
}

export interface ClubRoles {
  ownerId: string;
  adminIds: string[];
  moderatorIds: string[];
}

export interface Club {
  id: string;
  name: string;
  handle?: string;
  tagline?: string;
  description?: string;
  location: string;
  locationCoords?: { lat: number; lng: number };
  coverPhoto?: string | null;
  logo?: string | null;
  image: string | null;
  members: number;
  categories?: string[];
  clubType?: string;
  vehicleFocus?: string[];
  membershipType?: 'free' | 'paidLaterPlaceholder';
  visibility?: ClubVisibility;
  postingPermissions?: ClubPostingPermission;
  joinApproval?: ClubJoinApproval;
  roles?: ClubRoles;
  socialLinks?: ClubSocialLinks;
  rules?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
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

// ---- Help / SOS ----
export const SOS_ISSUE_TYPES = [
  'Electrical',
  'Flat Tyre',
  'Out of Fuel',
  'Locked Out',
  'Mechanical',
  'Accident',
  'Overheating',
  'Clutch / Transmission',
  'Brakes Issue',
  'Steering Issue',
] as const;

export type SOSIssueType = typeof SOS_ISSUE_TYPES[number];

export type HelpSource = 'nearby_members' | 'recovery_services';

export interface HelpRequest {
  id: string;
  userId: string;
  issueType: SOSIssueType;
  description: string;
  helpSource: HelpSource;
  lat: number;
  lng: number;
  status: 'active' | 'resolved';
  createdAt: string;
  // Legacy compat
  type?: 'breakdown' | 'stolen' | 'general';
}

// ---- Stolen Vehicle Alert ----
export interface StolenVehicleAlert {
  id: string;
  userId: string;
  vehicleId?: string;
  vehicleDescription: string;
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

// ---- Discovery Stats ----
export interface DiscoveryStats {
  eventsNearby: number;
  routesTrending: number;
  servicesOpenNow: number;
}

// ---- Route Models (detailed) ----
export type {
  Waypoint, RouteGeometry, RouteStats, RouteVisibility,
  RouteMedia, RouteDraft, PublishedRoute, PublishRouteFormData,
} from './route';
