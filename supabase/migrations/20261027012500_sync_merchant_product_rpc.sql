-- Migration: Add atomic sync_merchant_product and delete_merchant_product RPC functions
-- Checkpoint: Merchant Product Details Database Persistence in Supabase

CREATE OR REPLACE FUNCTION public.sync_merchant_product(
  p_store_id TEXT,
  p_store_name TEXT,
  p_name TEXT,
  p_description TEXT,
  p_price NUMERIC,
  p_original_price NUMERIC DEFAULT NULL,
  p_category TEXT DEFAULT 'General',
  p_stock INT DEFAULT 0,
  p_unit TEXT DEFAULT '1 KG',
  p_image_url TEXT DEFAULT '',
  p_is_bestseller BOOLEAN DEFAULT false,
  p_tags TEXT[] DEFAULT '{}',
  p_product_type TEXT DEFAULT NULL,
  p_quantity_value TEXT DEFAULT NULL,
  p_quantity_unit TEXT DEFAULT NULL,
  p_net_quantity TEXT DEFAULT NULL,
  p_product_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_store_uuid UUID;
  v_product_uuid UUID;
  v_result RECORD;
BEGIN
  -- 1. Resolve or generate valid Store UUID
  IF p_store_id IS NOT NULL AND p_store_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    v_store_uuid := p_store_id::UUID;
  ELSE
    v_store_uuid := md5('localloop_store_' || COALESCE(p_store_id, 'default'))::uuid;
  END IF;

  -- Ensure store exists in public.stores so foreign key constraint is satisfied
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = v_store_uuid) THEN
    INSERT INTO public.stores (
      id,
      name,
      slug,
      category,
      area,
      lane,
      phone,
      is_open,
      verified,
      created_at,
      updated_at
    ) VALUES (
      v_store_uuid,
      COALESCE(NULLIF(p_store_name, ''), 'Local Merchant Store'),
      lower(regexp_replace(COALESCE(NULLIF(p_store_name, ''), 'store'), '[^a-z0-9]+', '-', 'g')),
      COALESCE(NULLIF(p_category, ''), 'General'),
      'Vidyanagar',
      'Main Market Lane',
      '+91 98450 12345',
      true,
      true,
      now(),
      now()
    );
  END IF;

  -- 2. Resolve Product UUID (if editing or generating new)
  IF p_product_id IS NOT NULL AND p_product_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    v_product_uuid := p_product_id::UUID;
  ELSE
    v_product_uuid := gen_random_uuid();
  END IF;

  -- 3. Upsert product into public.products
  INSERT INTO public.products (
    id,
    store_id,
    name,
    description,
    price,
    original_price,
    category,
    stock,
    unit,
    image_url,
    is_bestseller,
    tags,
    product_type,
    quantity_value,
    quantity_unit,
    net_quantity,
    created_at,
    updated_at
  ) VALUES (
    v_product_uuid,
    v_store_uuid,
    p_name,
    COALESCE(p_description, ''),
    p_price,
    p_original_price,
    COALESCE(p_category, 'General'),
    COALESCE(p_stock, 0),
    COALESCE(p_unit, '1 KG'),
    COALESCE(p_image_url, ''),
    COALESCE(p_is_bestseller, false),
    COALESCE(p_tags, '{}'::text[]),
    p_product_type,
    p_quantity_value,
    p_quantity_unit,
    p_net_quantity,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    category = EXCLUDED.category,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image_url = EXCLUDED.image_url,
    is_bestseller = EXCLUDED.is_bestseller,
    tags = EXCLUDED.tags,
    product_type = EXCLUDED.product_type,
    quantity_value = EXCLUDED.quantity_value,
    quantity_unit = EXCLUDED.quantity_unit,
    net_quantity = EXCLUDED.net_quantity,
    updated_at = now()
  RETURNING * INTO v_result;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_result.id,
    'store_id', v_result.store_id,
    'name', v_result.name,
    'price', v_result.price,
    'stock', v_result.stock,
    'unit', v_result.unit,
    'product_type', v_result.product_type,
    'quantity_value', v_result.quantity_value,
    'quantity_unit', v_result.quantity_unit,
    'net_quantity', v_result.net_quantity
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_merchant_product TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.delete_merchant_product(p_product_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF p_product_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    DELETE FROM public.products WHERE id = p_product_id::UUID;
  END IF;
  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_merchant_product TO anon, authenticated, service_role;
