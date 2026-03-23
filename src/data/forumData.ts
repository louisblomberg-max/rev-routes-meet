// Forum type definitions and helper functions — no mock data

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

export const getCategoryInfo = (categoryId: string) => {
  const categories: Record<string, { name: string; color: string }> = {
    general: { name: 'General', color: 'bg-muted text-foreground' },
    mods: { name: 'Mods & Tuning', color: 'bg-routes text-white' },
    troubleshooting: { name: 'Troubleshooting', color: 'bg-events text-white' },
    buying: { name: 'Buying & Selling', color: 'bg-primary text-primary-foreground' },
    track: { name: 'Track & Motorsport', color: 'bg-clubs text-white' },
    insurance: { name: 'Insurance & Ownership', color: 'bg-services text-foreground' },
  };
  return categories[categoryId] || { name: categoryId, color: 'bg-muted text-foreground' };
};

export const getPostTypeInfo = (type: PostType) => {
  const types: Record<PostType, { label: string; icon: string; color: string }> = {
    question: { label: 'Question', icon: 'HelpCircle', color: 'bg-blue-100 text-blue-700' },
    advice: { label: 'Advice', icon: 'Lightbulb', color: 'bg-amber-100 text-amber-700' },
    discussion: { label: 'Discussion', icon: 'MessageSquare', color: 'bg-purple-100 text-purple-700' },
  };
  return types[type];
};
