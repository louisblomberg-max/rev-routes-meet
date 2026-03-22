
-- Add missing policy for club_events
create policy "Anyone can view club events" on public.club_events for select using (true);
create policy "Authenticated users can link club events" on public.club_events for insert with check (auth.uid() is not null);
create policy "Authenticated users can unlink club events" on public.club_events for delete using (auth.uid() is not null);
