-- =============================================================
-- WIBO — Row Level Security Policies
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================


-- ── PRODUCTS ──────────────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can browse products
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (true);

-- Only admins can create, edit, or delete products
CREATE POLICY "products_admin_insert"
  ON public.products FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "products_admin_update"
  ON public.products FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "products_admin_delete"
  ON public.products FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));


-- ── ORDERS ────────────────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users see only their own orders; admins see all
CREATE POLICY "orders_read"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can only create orders for themselves
CREATE POLICY "orders_user_insert"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update orders (e.g. change status)
CREATE POLICY "orders_admin_update"
  ON public.orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));


-- ── ORDER ITEMS ───────────────────────────────────────────────
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users see items only from their own orders; admins see all
CREATE POLICY "order_items_read"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (
          orders.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- Users can only insert items into their own orders
CREATE POLICY "order_items_user_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );


-- ── VEHICLES ──────────────────────────────────────────────────
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own vehicles
CREATE POLICY "vehicles_owner_all"
  ON public.vehicles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── PROFILES ──────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own profile
CREATE POLICY "profiles_owner_all"
  ON public.profiles FOR ALL
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);


-- ── USER ROLES ────────────────────────────────────────────────
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own role (needed for isAdmin checks)
CREATE POLICY "user_roles_read_own"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT / UPDATE / DELETE from the client — roles are managed
-- via the Supabase dashboard or service-role migrations only.


-- ── STORAGE: product-images bucket ───────────────────────────
-- Run these only after creating the bucket in the dashboard.

-- Public read — anyone can view product images
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only admins can upload
CREATE POLICY "product_images_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
