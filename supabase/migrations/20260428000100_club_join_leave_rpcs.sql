-- ============================================================================
-- Centralised club join/leave RPCs
-- ============================================================================
-- Replaces ad-hoc client-side .insert / .delete on club_memberships with two
-- RPCs that:
--   • return a uniform { success, status?, error? } JSON shape
--   • handle all join_mode values consistently (open / approval / invite-only)
--   • prevent the sole owner from silently leaving a club
--   • atomically file a join_request for approval-mode clubs
--
-- Existing direct table writes (from CommunityClubsView, Clubs.tsx, etc) still
-- work — these RPCs are additive. Callers can migrate over time.
-- ============================================================================

-- ── join_club ──
-- Returns one of:
--   { success: true,  status: 'joined' }            -- open / auto-join
--   { success: true,  status: 'pending_approval' }  -- approval-mode → join request filed
--   { success: false, error: 'string' }             -- failure / disallowed
create or replace function public.join_club(
  p_club_id      uuid,
  p_join_message text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id        uuid := auth.uid();
  v_join_mode      text;
  v_existing_role  text;
  v_existing_stat  text;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select c.join_mode
    into v_join_mode
    from public.clubs c
   where c.id = p_club_id;

  if v_join_mode is null then
    -- Either club doesn't exist OR join_mode is null (treat null as 'auto')
    if not exists (select 1 from public.clubs where id = p_club_id) then
      return json_build_object('success', false, 'error', 'Club not found');
    end if;
    v_join_mode := 'auto';
  end if;

  -- Check existing membership
  select role, status
    into v_existing_role, v_existing_stat
    from public.club_memberships
   where club_id = p_club_id and user_id = v_user_id;

  if v_existing_stat = 'active' then
    return json_build_object('success', false, 'error', 'Already a member');
  end if;

  -- Invite-only blocks self-join entirely
  if v_join_mode in ('invite', 'invite_only') then
    return json_build_object('success', false, 'error', 'This club is invite-only');
  end if;

  -- Approval mode → file/refresh a join_request, no membership row yet
  if v_join_mode = 'approval' then
    -- Use a delete + insert pattern to avoid relying on a unique constraint
    -- existence on (club_id, user_id) in club_join_requests.
    delete from public.club_join_requests
     where club_id = p_club_id and user_id = v_user_id and status = 'pending';
    insert into public.club_join_requests (club_id, user_id, message, status)
      values (p_club_id, v_user_id, p_join_message, 'pending');
    return json_build_object('success', true, 'status', 'pending_approval');
  end if;

  -- Open / auto-join
  insert into public.club_memberships (club_id, user_id, role, status)
    values (p_club_id, v_user_id, 'member', 'active')
  on conflict (club_id, user_id) do update
    set status = 'active', role = coalesce(public.club_memberships.role, 'member');

  return json_build_object('success', true, 'status', 'joined');
end;
$$;

-- ── leave_club ──
-- Returns:
--   { success: true }
--   { success: false, error: '...' }     -- including sole-owner case
create or replace function public.leave_club(
  p_club_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_role         text;
  v_other_owners int;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select role
    into v_role
    from public.club_memberships
   where club_id = p_club_id
     and user_id = v_user_id
     and status  = 'active';

  if v_role is null then
    return json_build_object('success', false, 'error', 'Not a member of this club');
  end if;

  -- Sole-owner guard: refuse to leave if there's no other owner to take over
  if v_role = 'owner' then
    select count(*)
      into v_other_owners
      from public.club_memberships
     where club_id = p_club_id
       and role    = 'owner'
       and status  = 'active'
       and user_id <> v_user_id;
    if v_other_owners = 0 then
      return json_build_object(
        'success', false,
        'error', 'You are the sole owner. Transfer ownership before leaving.'
      );
    end if;
  end if;

  delete from public.club_memberships
    where club_id = p_club_id
      and user_id = v_user_id;

  return json_build_object('success', true);
end;
$$;

grant execute on function public.join_club(uuid, text) to authenticated;
grant execute on function public.leave_club(uuid)       to authenticated;
