
-- Trigger: auto-add club creator as owner when a club is created
CREATE OR REPLACE FUNCTION public.auto_add_club_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.club_memberships (club_id, user_id, role, is_founding_member, points, badges)
  VALUES (NEW.id, NEW.created_by, 'owner', true, 50, ARRAY['founder']);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_add_club_owner ON public.clubs;
CREATE TRIGGER trg_auto_add_club_owner
  AFTER INSERT ON public.clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_club_owner();

-- Trigger: keep member_count in sync
CREATE OR REPLACE FUNCTION public.sync_club_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.clubs SET member_count = member_count + 1 WHERE id = NEW.club_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.clubs SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.club_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_club_member_count ON public.club_memberships;
CREATE TRIGGER trg_sync_club_member_count
  AFTER INSERT OR DELETE ON public.club_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_club_member_count();
