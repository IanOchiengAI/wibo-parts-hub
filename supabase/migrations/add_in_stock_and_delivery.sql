-- Run in Supabase Dashboard → SQL Editor

-- Add in_stock to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS in_stock boolean NOT NULL DEFAULT true;

-- Add delivery fields to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name  text,
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS delivery_area  text,
  ADD COLUMN IF NOT EXISTS notes         text;

-- Add product_name to order_items (fallback when product is deleted)
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_name text;

-- ── Public order tracking (SECURITY DEFINER bypasses RLS) ─────────────────
-- Requires both the order UUID and the customer's phone — two-factor lookup.
CREATE OR REPLACE FUNCTION public.track_order(p_order_id uuid, p_phone text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT row_to_json(t) FROM (
    SELECT
      o.id,
      o.status,
      o.total_amount,
      o.created_at,
      o.customer_name,
      o.delivery_area,
      COALESCE(
        json_agg(
          json_build_object(
            'product_name', COALESCE(pr.name, oi.product_name),
            'quantity',     oi.quantity,
            'price',        oi.price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) AS items
    FROM   orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products    pr ON pr.id = oi.product_id::uuid
    WHERE  o.id             = p_order_id
      AND  o.customer_phone = p_phone
    GROUP BY o.id
  ) t;
$$;
