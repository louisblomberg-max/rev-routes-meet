import type { IMessagesRepository } from '@/repositories/interfaces';
import type { Conversation, Message } from '@/models';

export class SupabaseMessagesRepository implements IMessagesRepository {
  getConversations(_userId: string): Conversation[] { throw new Error('Not implemented — connect Supabase'); }
  createConversation(_conv: Omit<Conversation, 'id'>): Conversation { throw new Error('Not implemented — connect Supabase'); }
  updateConversation(_id: string, _updates: Partial<Conversation>): Conversation { throw new Error('Not implemented — connect Supabase'); }
  deleteConversation(_id: string): void { throw new Error('Not implemented — connect Supabase'); }
  getMessages(_conversationId: string): Message[] { throw new Error('Not implemented — connect Supabase'); }
  sendMessage(_message: Omit<Message, 'id' | 'createdAt'>): Message { throw new Error('Not implemented — connect Supabase'); }
}
