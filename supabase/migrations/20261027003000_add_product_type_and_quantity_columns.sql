-- Migration: Add product type and metric quantity columns to products table
-- Checkpoint: Merchant Product Type and KG/L metric measurements

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS product_type TEXT,
  ADD COLUMN IF NOT EXISTS quantity_value TEXT,
  ADD COLUMN IF NOT EXISTS quantity_unit TEXT,
  ADD COLUMN IF NOT EXISTS net_quantity TEXT;

COMMENT ON COLUMN public.products.product_type IS 'Physical type/form of product (e.g. Solid / Packaged, Liquid / Beverage / Oil, Grain / Pulses, etc.)';
COMMENT ON COLUMN public.products.quantity_value IS 'Packaged quantity value (e.g. 1, 0.5, 2, 5)';
COMMENT ON COLUMN public.products.quantity_unit IS 'Measurement unit (KG, L, GM, ML, etc.)';
COMMENT ON COLUMN public.products.net_quantity IS 'Combined formatted net quantity label (e.g. 1 KG, 500 GM, 2 L)';
