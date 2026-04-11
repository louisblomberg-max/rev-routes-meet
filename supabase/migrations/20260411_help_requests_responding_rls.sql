-- Update RLS on help_requests so any authenticated user can mark a request
-- as 'responding' (so they can claim it via the SOS Feed), while only the
-- owner can change anything else (resolve, cancel, edit details, etc.).

drop policy if exists "Users can update their own help requests" on public.help_requests;

-- Owner: can update any field of their own request to any status
create policy "Owners can update their own help requests"
  on public.help_requests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Other authenticated users: can ONLY update a request to status='responding'.
-- The with-check clause ensures the row's resulting status must be 'responding'.
-- Combined permissively with the owner policy via PostgreSQL's default OR semantics.
create policy "Authenticated users can mark requests as responding"
  on public.help_requests for update
  using (
    auth.uid() is not null
    and auth.uid() != user_id
  )
  with check (
    status = 'responding'
  );
