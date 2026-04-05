-- Ticket types for each event
CREATE TABLE IF NOT EXISTS public.event_ticket_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'General Admission',
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  capacity integer,
  sold_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.event_ticket_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ticket types" ON public.event_ticket_types FOR SELECT USING (true);
CREATE POLICY "Organisers can manage ticket types" ON public.event_ticket_types FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE created_by = auth.uid())
);

CREATE INDEX IF NOT EXISTS event_ticket_types_event_id_idx ON public.event_ticket_types(event_id);
CREATE INDEX IF NOT EXISTS event_tickets_qr_token_idx ON public.event_tickets(qr_code_token);
