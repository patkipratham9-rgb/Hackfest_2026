-- Checkpoint CP-PI03: Atomic Product Stock Increment/Decrement RPC
-- Enables sellers and background workers to atomically adjust stock with concurrency locks

CREATE OR REPLACE FUNCTION public.adjust_product_stock_atomic(
  p_product_id UUID,
  p_delta INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INT;
  v_new_stock INT;
BEGIN
  -- 1. Lock the product row for update to guarantee concurrency safety
  SELECT stock INTO v_current_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % not found', p_product_id;
  END IF;

  v_new_stock := v_current_stock + p_delta;

  -- 2. Prevent decrementing below zero
  IF v_new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient inventory: stock cannot drop below zero (current: %, requested change: %)', v_current_stock, p_delta;
  END IF;

  -- 3. Perform atomic update
  UPDATE public.products
  SET stock = v_new_stock,
      updated_at = now()
  WHERE id = p_product_id;

  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'previous_stock', v_current_stock,
    'new_stock', v_new_stock,
    'delta', p_delta
  );
END;
$$;
