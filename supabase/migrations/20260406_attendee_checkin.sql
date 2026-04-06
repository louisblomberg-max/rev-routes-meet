-- Add check-in columns to event_attendees for free attendee QR passes
ALTER TABLE public.event_attendees ADD COLUMN IF NOT EXISTS qr_code_token uuid DEFAULT gen_random_uuid();
ALTER TABLE public.event_attendees ADD COLUMN IF NOT EXISTS checked_in boolean DEFAULT false;
ALTER TABLE public.event_attendees ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

CREATE INDEX IF NOT EXISTS event_attendees_qr_token_idx ON public.event_attendees(qr_code_token);
