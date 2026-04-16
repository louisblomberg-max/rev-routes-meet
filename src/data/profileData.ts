// Profile type definitions — no mock data, types only

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
  plan: 'free';
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
