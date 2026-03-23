-- Fix overly permissive INSERT on notifications - only authenticated users or service role
drop policy if exists "Service role can insert notifications" on public.notifications;
create policy "Authenticated can insert notifications"
  on public.notifications for insert
  with check (auth.uid() is not null);