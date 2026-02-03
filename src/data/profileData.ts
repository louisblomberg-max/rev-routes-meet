// Profile mock data

export interface Vehicle {
  id: string;
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

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  location?: string;
  bio?: string;
  plan: 'free' | 'enthusiast' | 'pro';
  stats: {
    eventsAttended: number;
    routesSaved: number;
    clubsJoined: number;
  };
  garage: Vehicle[];
  achievements: Achievement[];
  liveFeatures: {
    locationSharingEnabled: boolean;
    groupDrivesCount: number;
    breakdownHelpCount: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  description: string;
}

export interface UserActivity {
  id: string;
  type: 'event_attended' | 'event_hosted' | 'route_created' | 'route_saved' | 'forum_post' | 'forum_reply' | 'club_post' | 'listing';
  title: string;
  date: string;
  link?: string;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  mutualFriends: number;
  status: 'accepted' | 'pending_sent' | 'pending_received';
}

export interface ClubMembership {
  id: string;
  clubId: string;
  clubName: string;
  role: 'member' | 'admin';
  joinedAt: string;
}

export const mockUserProfile: UserProfile = {
  id: '1',
  username: 'alexdrives',
  displayName: 'Alex Morgan',
  avatar: null,
  location: 'London, UK',
  bio: 'E46 M3 owner. Weekend warrior. Always chasing the perfect driving road.',
  plan: 'free',
  stats: {
    eventsAttended: 12,
    routesSaved: 8,
    clubsJoined: 4,
  },
  garage: [
    {
      id: '1',
      type: 'car',
      make: 'BMW',
      model: 'M3 E46',
      year: 2004,
      engineTrim: '3.2L S54 Manual',
      mods: ['KW V3 Coilovers', 'CSL Airbox', 'Supersprint Exhaust'],
      photos: [],
      notes: 'My weekend toy. Fully rebuilt engine at 120k miles.',
      visibility: 'public',
    },
    {
      id: '2',
      type: 'bike',
      make: 'Ducati',
      model: 'Panigale V4S',
      year: 2022,
      engineTrim: '1103cc',
      mods: ['Akrapovic Full System', 'Öhlins Suspension'],
      photos: [],
      notes: 'Track weapon. 2,500 miles.',
      visibility: 'friends',
    },
  ],
  achievements: [
    { id: '1', name: 'Helper', icon: 'heart-handshake', earned: true, description: 'Responded to 5+ breakdown requests' },
    { id: '2', name: 'Road Master', icon: 'map', earned: true, description: 'Created 10+ routes' },
    { id: '3', name: 'Community Builder', icon: 'users', earned: false, description: 'Started a club with 50+ members' },
    { id: '4', name: 'Event Host', icon: 'calendar-check', earned: true, description: 'Hosted 3+ events' },
  ],
  liveFeatures: {
    locationSharingEnabled: false,
    groupDrivesCount: 3,
    breakdownHelpCount: 7,
  },
};

export const mockActivities: UserActivity[] = [
  { id: '1', type: 'event_attended', title: 'Porsche Owners Meet', date: '2 days ago' },
  { id: '2', type: 'route_created', title: 'South Downs Scenic', date: '5 days ago' },
  { id: '3', type: 'forum_post', title: 'Best oil for E46 M3?', date: '1 week ago' },
  { id: '4', type: 'club_post', title: 'Just finished my M3 restoration!', date: '2 weeks ago' },
  { id: '5', type: 'event_hosted', title: 'BMW Sunday Cruise', date: '3 weeks ago' },
];

export const mockFriends: Friend[] = [
  { id: '1', username: 'petrolhead99', displayName: 'James Wilson', avatar: null, mutualFriends: 5, status: 'accepted' },
  { id: '2', username: 'e30steve', displayName: 'Steve Harris', avatar: null, mutualFriends: 3, status: 'accepted' },
  { id: '3', username: 'trackmike', displayName: 'Mike Chen', avatar: null, mutualFriends: 8, status: 'accepted' },
  { id: '4', username: 'bikerJane', displayName: 'Jane Cooper', avatar: null, mutualFriends: 2, status: 'pending_received' },
];

export const mockClubMemberships: ClubMembership[] = [
  { id: '1', clubId: '1', clubName: 'BMW Enthusiasts UK', role: 'member', joinedAt: '2023-06-15' },
  { id: '2', clubId: '2', clubName: 'Porsche Club GB', role: 'member', joinedAt: '2023-08-20' },
  { id: '3', clubId: '5', clubName: 'Track Day Addicts', role: 'admin', joinedAt: '2022-11-01' },
  { id: '4', clubId: '3', clubName: 'JDM Legends', role: 'member', joinedAt: '2024-01-10' },
];
