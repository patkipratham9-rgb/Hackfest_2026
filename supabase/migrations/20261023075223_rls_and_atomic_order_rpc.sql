-- Phase 2 & 3: Row Level Security (RLS) & Atomic Order Execution RPC

-- Enable RLS on all five tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Stores Policies
CREATE POLICY "Stores are viewable by everyone"
  ON public.stores FOR SELECT USING (true);

CREATE POLICY "Sellers can create stores"
  ON public.stores FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own stores"
  ON public.stores FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own stores"
  ON public.stores FOR DELETE USING (auth.uid() = seller_id);

-- 3. Products Policies
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Sellers can insert products for their stores"
  ON public.products FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = products.store_id AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update products in their stores"
  ON public.products FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = products.store_id AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete products in their stores"
  ON public.products FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = products.store_id AND stores.seller_id = auth.uid()
    )
  );

-- 4. Orders Policies
CREATE POLICY "Customers can view their orders"
  ON public.orders FOR SELECT USING (
    (customer_id = auth.uid()) OR (customer_id IS NULL) OR
    (EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = orders.store_id AND stores.seller_id = auth.uid()
    ))
  );

CREATE POLICY "Anyone can place an order"
  ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Sellers can update order status for their stores"
  ON public.orders FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = orders.store_id AND stores.seller_id = auth.uid()
    )
  );

-- 5. Order Items Policies
CREATE POLICY "Order items viewable with order"
  ON public.order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id
    )
  );

CREATE POLICY "Order items insertable with order"
  ON public.order_items FOR INSERT WITH CHECK (true);

-- 6. Atomic Inventory Decrement & Order Creation RPC
CREATE OR REPLACE FUNCTION public.place_order_atomic(
  p_order_id text,
  p_store_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_items jsonb,
  p_subtotal numeric,
  p_platform_fee numeric,
  p_total numeric,
  p_payment_method text,
  p_pickup_time text,
  p_pickup_code text,
  p_customer_id uuid DEFAULT NULL::uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
declare
  v_item jsonb;
  v_prod_id uuid;
  v_qty int;
  v_unit_price numeric;
  v_current_stock int;
  v_prod_name text;
begin
  -- 1. Validate and lock stock for each item
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_prod_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;

    select stock, name into v_current_stock, v_prod_name
    from public.products
    where id = v_prod_id
    for update;

    if not found then
      raise exception 'Product ID % not found', v_prod_id;
    end if;

    if v_current_stock < v_qty then
      raise exception 'Insufficient stock for "%". Only % available, but % requested.', v_prod_name, v_current_stock, v_qty;
    end if;
  end loop;

  -- 2. Decrement stock atomically
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_prod_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;

    update public.products
    set stock = stock - v_qty,
        updated_at = now()
    where id = v_prod_id;
  end loop;

  -- 3. Insert order record
  insert into public.orders (
    id,
    customer_id,
    store_id,
    customer_name,
    customer_phone,
    subtotal,
    platform_fee,
    total,
    status,
    payment_method,
    payment_status,
    pickup_time,
    pickup_code,
    created_at
  ) values (
    p_order_id,
    p_customer_id,
    p_store_id,
    p_customer_name,
    p_customer_phone,
    p_subtotal,
    p_platform_fee,
    p_total,
    'placed',
    p_payment_method,
    case when p_payment_method = 'upi' then 'paid' else 'pending' end,
    p_pickup_time,
    p_pickup_code,
    now()
  );

  -- 4. Insert order items
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_prod_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::numeric;

    insert into public.order_items (
      order_id,
      product_id,
      quantity,
      unit_price
    ) values (
      p_order_id,
      v_prod_id,
      v_qty,
      v_unit_price
    );
  end loop;

  return jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'status', 'placed',
    'total', p_total
  );
end;
$function$;
