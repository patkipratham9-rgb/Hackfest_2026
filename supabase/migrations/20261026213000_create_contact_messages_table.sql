-- Migration: Create contact_messages table for customer and merchant inquiries
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8)),
  ticket_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL DEFAULT 'General Inquiry',
  order_id TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated users to insert contact inquiries
CREATE POLICY "Public insert on contact_messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Restrict select to service role or admin
CREATE POLICY "Service role select on contact_messages"
  ON public.contact_messages
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Index for lookup by ticket_id and status
CREATE INDEX IF NOT EXISTS idx_contact_messages_ticket ON public.contact_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);
