-- Phase 5: Store Analytics Events (CP-GC01)
-- Real-time event tracking for store views, product views, cart additions, and order conversions

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('store_view', 'product_view', 'cart_add', 'cart_remove', 'checkout_start', 'order_placed', 'search_query')),
  session_id TEXT,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Performance Indexes for Analytics Aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_created ON public.analytics_events(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_type ON public.analytics_events(store_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product ON public.analytics_events(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events(session_id) WHERE session_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public and customers can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Sellers can view own store analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins have full access to analytics events" ON public.analytics_events;

-- Policy 1: Anyone (anonymous & authenticated) can INSERT analytics events (shopper activity tracking)
CREATE POLICY "Public and customers can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Store owners (sellers) can view their store's analytics events
CREATE POLICY "Sellers can view own store analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = analytics_events.store_id
      AND stores.seller_id = auth.uid()
    )
  );

-- Policy 3: Admins have full access to analytics events
CREATE POLICY "Admins have full access to analytics events"
  ON public.analytics_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
