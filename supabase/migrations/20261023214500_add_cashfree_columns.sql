-- Migration: Add Cashfree Payment Gateway Columns
-- Checkpoint: Migrate from Razorpay to Cashfree PG
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cashfree_order_id TEXT,
ADD COLUMN IF NOT EXISTS cashfree_payment_id TEXT;

-- Create index for rapid lookup by Cashfree order id and payment id
CREATE INDEX IF NOT EXISTS idx_orders_cashfree_order_id ON public.orders(cashfree_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_cashfree_payment_id ON public.orders(cashfree_payment_id);

COMMENT ON COLUMN public.orders.cashfree_order_id IS 'Unique Cashfree Order Identifier';
COMMENT ON COLUMN public.orders.cashfree_payment_id IS 'Unique Cashfree Payment Reference ID';
