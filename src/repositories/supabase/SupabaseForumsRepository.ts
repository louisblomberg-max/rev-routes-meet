import type { IForumsRepository } from '@/repositories/interfaces';
import type { ForumPost, ForumComment } from '@/models';

export class SupabaseForumsRepository implements IForumsRepository {
  getPosts(): ForumPost[] { throw new Error('Not implemented — connect Supabase'); }
  getPostById(_id: string): ForumPost | undefined { throw new Error('Not implemented — connect Supabase'); }
  createPost(_post: Omit<ForumPost, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>): ForumPost { throw new Error('Not implemented — connect Supabase'); }
  getComments(_postId: string): ForumComment[] { throw new Error('Not implemented — connect Supabase'); }
  createComment(_comment: Omit<ForumComment, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>): ForumComment { throw new Error('Not implemented — connect Supabase'); }
  getUserPosts(_userId: string): ForumPost[] { throw new Error('Not implemented — connect Supabase'); }
}
