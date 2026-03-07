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

export const mockForumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Best oil for E46 M3 track days?',
    body: 'I\'m planning to take my E46 M3 to a few track days this summer. Currently using Castrol Edge 5W-30 but wondering if I should switch to something more track-focused. Any recommendations from those who track their M3s regularly?',
    type: 'question',
    category: 'mods',
    author: 'BimmerFan92',
    createdAt: '2024-02-14T10:30:00Z',
    upvotes: 47,
    downvotes: 2,
    comments: 23,
  },
  {
    id: '2',
    title: 'My experience with ceramic coating after 2 years',
    body: 'Got my GT-R ceramic coated back in 2022. Here\'s my honest review after 2 years of daily driving and occasional track use. TL;DR: Worth every penny if you maintain it properly.',
    type: 'advice',
    category: 'general',
    clubId: '3',
    clubName: 'JDM Legends',
    author: 'GTROwner',
    createdAt: '2024-02-14T08:15:00Z',
    upvotes: 89,
    downvotes: 5,
    comments: 34,
  },
  {
    id: '3',
    title: 'GTI vs Golf R for a daily driver - help me decide',
    body: 'Looking to upgrade from my 1.4 TSI Golf. Torn between the GTI and Golf R. I do about 15k miles a year, mostly motorway. Is the R worth the extra £10k+ for AWD I might not need?',
    type: 'discussion',
    category: 'buying',
    author: 'VWNewbie',
    createdAt: '2024-02-13T16:45:00Z',
    upvotes: 156,
    downvotes: 8,
    comments: 89,
  },
  {
    id: '4',
    title: 'Dashboard rattle fix - finally solved it!',
    body: 'After 6 months of annoying dashboard rattles in my Civic Type R, I finally tracked it down. It was the air vent clips! Here\'s how I fixed it with some felt tape...',
    type: 'advice',
    category: 'troubleshooting',
    author: 'QuietRider',
    createdAt: '2024-02-12T14:20:00Z',
    upvotes: 234,
    downvotes: 3,
    comments: 45,
  },
  {
    id: '5',
    title: 'First track day tips for beginners?',
    body: 'I\'ve booked my first track day at Brands Hatch next month. What should I know? What to bring, what to check on the car beforehand, any rookie mistakes to avoid?',
    type: 'question',
    category: 'track',
    author: 'TrackRookie',
    createdAt: '2024-02-12T09:00:00Z',
    upvotes: 78,
    downvotes: 1,
    comments: 56,
  },
  {
    id: '6',
    title: 'Modified car insurance - who are you with?',
    body: 'Just remapped my Focus ST and added a decat. Looking for insurance that won\'t break the bank but actually covers mods. Who do you lot use?',
    type: 'discussion',
    category: 'insurance',
    clubId: '1',
    clubName: 'BMW Enthusiasts UK',
    author: 'ModdedFocus',
    createdAt: '2024-02-11T20:30:00Z',
    upvotes: 112,
    downvotes: 4,
    comments: 67,
  },
  {
    id: '7',
    title: 'Coolant leak from water pump - DIY or garage?',
    body: 'Noticed a small coolant leak coming from what looks like the water pump area on my 330i. Is this a reasonable DIY job or should I just take it to a specialist?',
    type: 'question',
    category: 'troubleshooting',
    author: 'DIYMechanic',
    createdAt: '2024-02-11T11:15:00Z',
    upvotes: 34,
    downvotes: 0,
    comments: 28,
  },
  {
    id: '8',
    title: 'Coilover recommendations under £1500?',
    body: 'Looking for a good set of coilovers for my MX-5 NB. Budget is around £1500. Will be used for B-roads and occasional track days. BC Racing vs KW vs Bilstein - thoughts?',
    type: 'question',
    category: 'mods',
    author: 'MX5Mike',
    createdAt: '2024-02-10T15:45:00Z',
    upvotes: 67,
    downvotes: 2,
    comments: 41,
  },
];

export const mockForumComments: ForumComment[] = [
  {
    id: 'c1',
    postId: '1',
    author: 'TrackDayPro',
    content: 'I run Motul 300V 10W-40 in my E46 M3. It\'s designed for track use and holds up really well under high temps. A bit pricey but worth it for peace of mind.',
    createdAt: '2024-02-14T11:00:00Z',
    upvotes: 15,
    downvotes: 0,
    replies: [
      {
        id: 'c1r1',
        postId: '1',
        parentId: 'c1',
        author: 'BimmerFan92',
        content: 'Thanks! How often do you change it if you\'re doing track days regularly?',
        createdAt: '2024-02-14T11:30:00Z',
        upvotes: 3,
        downvotes: 0,
      },
      {
        id: 'c1r2',
        postId: '1',
        parentId: 'c1',
        author: 'TrackDayPro',
        content: 'Every 3-4 track days or 3000 miles, whichever comes first. The oil analysis shows it degrades faster with track use.',
        createdAt: '2024-02-14T12:00:00Z',
        upvotes: 8,
        downvotes: 0,
      },
    ],
  },
  {
    id: 'c2',
    postId: '1',
    author: 'OilExpert',
    content: 'Red Line 5W-30 is another solid option. Made specifically for high-performance engines. I\'ve used it in my M3 for years with no issues.',
    createdAt: '2024-02-14T13:00:00Z',
    upvotes: 12,
    downvotes: 1,
  },
  {
    id: 'c3',
    postId: '1',
    author: 'E46Fanatic',
    content: 'Whatever you choose, make sure you\'re checking oil temps on track. The S54 loves to run hot. Consider an oil cooler if you haven\'t already.',
    createdAt: '2024-02-14T14:30:00Z',
    upvotes: 21,
    downvotes: 0,
    replies: [
      {
        id: 'c3r1',
        postId: '1',
        parentId: 'c3',
        author: 'BimmerFan92',
        content: 'Good point - I do have a factory oil cooler but might upgrade to a larger one.',
        createdAt: '2024-02-14T15:00:00Z',
        upvotes: 2,
        downvotes: 0,
      },
    ],
  },
];

export const getCategoryInfo = (categoryId: string) => {
  const categories: Record<string, { name: string; color: string }> = {
    general: { name: 'General', color: 'bg-muted text-foreground' },
    mods: { name: 'Mods & Tuning', color: 'bg-routes/15 text-routes' },
    troubleshooting: { name: 'Troubleshooting', color: 'bg-events/15 text-events' },
    buying: { name: 'Buying & Selling', color: 'bg-services/15 text-services' },
    track: { name: 'Track & Motorsport', color: 'bg-clubs/15 text-clubs' },
    insurance: { name: 'Insurance & Ownership', color: 'bg-primary/15 text-primary' },
  };
  return categories[categoryId] || { name: categoryId, color: 'bg-muted text-foreground' };
};

export const getPostTypeInfo = (type: PostType) => {
  const types: Record<PostType, { label: string; icon: string; color: string }> = {
    question: { label: 'Question', icon: 'HelpCircle', color: 'bg-routes/15 text-routes' },
    advice: { label: 'Advice', icon: 'Lightbulb', color: 'bg-services/15 text-services' },
    discussion: { label: 'Discussion', icon: 'MessageSquare', color: 'bg-clubs/15 text-clubs' },
  };
  return types[type];
};
