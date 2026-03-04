// ============================
// Seed Data — EMPTY by default (clean slate)
// ============================
// All content is user-generated. No pre-seeded items.

import type {
  RevEvent, RevRoute, RevService, Club, ClubPost, ClubEvent,
  ForumPost, ForumComment, MarketplaceListing,
  Vehicle, Friend, UserActivity, ClubMembership,
} from '@/models';

export const seedEvents: RevEvent[] = [];
export const seedRoutes: RevRoute[] = [];
export const seedServices: RevService[] = [];
export const seedClubs: Club[] = [];
export const seedClubPosts: ClubPost[] = [];
export const seedClubEvents: ClubEvent[] = [];
export const seedForumPosts: ForumPost[] = [];
export const seedForumComments: ForumComment[] = [];
export const seedMarketplaceListings: MarketplaceListing[] = [];

// User-specific — also empty
export const seedUserVehicles: Vehicle[] = [];
export const seedUserFriends: Friend[] = [];
export const seedUserActivities: UserActivity[] = [];
export const seedUserClubMemberships: ClubMembership[] = [];
export const seedUserSavedRoutes: string[] = [];
export const seedUserAttendingEvents: string[] = [];
