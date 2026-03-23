-- Allow participants to mark messages as read (update read_at)
create policy "Participants can update messages read status"
on public.messages for update
using (
  exists (
    select 1 from conversation_participants
    where conversation_participants.conversation_id = messages.conversation_id
    and conversation_participants.user_id = auth.uid()
  )
);

-- Allow users to update their own forum comments (for upvotes)
create policy "Users can update their own comments"
on public.forum_comments for update
using (auth.uid() = user_id);