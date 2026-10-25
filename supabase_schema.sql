-- ========================================================
-- 🛒 Smart Picker Cart - Supabase SQL Schema
-- انسخ هذا الكود بالكامل والصقه في SQL Editor داخل Supabase ثم اضغط RUN
-- ========================================================

-- 1. جدول المنتجات (Products Table)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    barcode TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    aisle TEXT NOT NULL,
    aisle_order INT DEFAULT 99,
    price NUMERIC(10, 2) NOT NULL,
    unit TEXT DEFAULT 'عبوة',
    weight_type TEXT DEFAULT 'fixed',
    stock INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول الطلبات (Orders Table)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    status TEXT DEFAULT 'assigned', -- pending, assigned, picking, ready_for_dispatch, completed
    cart_id TEXT DEFAULT 'CART-01',
    picker_name TEXT DEFAULT 'أحمد طارق (مُحضّر)',
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    dispatched_at TIMESTAMP WITH TIME ZONE
);

-- 3. جدول أصناف الطلب (Order Items Table)
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id),
    name TEXT NOT NULL,
    barcode TEXT NOT NULL,
    category TEXT,
    aisle TEXT,
    aisle_order INT DEFAULT 99,
    price NUMERIC(10, 2) NOT NULL,
    unit TEXT DEFAULT 'عبوة',
    required_qty INT DEFAULT 1,
    picked_qty INT DEFAULT 0,
    status TEXT DEFAULT 'pending' -- pending, picked, out_of_stock, substituted, cancelled
);

-- 4. جدول طلبات البدائل (Substitutions Table)
CREATE TABLE IF NOT EXISTS public.substitutions (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    item_id TEXT REFERENCES public.order_items(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    substitute_product_id TEXT REFERENCES public.products(id),
    substitute_name TEXT NOT NULL,
    substitute_price NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    expires_at BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- تفعيل البث المباشر (Enable Realtime for all tables)
-- ========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.substitutions;

-- تعطيل قيود الحماية (RLS) للمرحلة التجريبية (Demo Prototype)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for demo" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON public.substitutions FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- إدخال بيانات المنتجات الأولية
-- ========================================================
INSERT INTO public.products (id, name, barcode, category, aisle, aisle_order, price, unit, weight_type) VALUES
('prod-1', 'أرز مصري فاخر 1 كجم', '6221001001011', 'حبوب وبقوليات', 'ممر 1A - رف 01', 1, 32.50, 'كيس', 'fixed'),
('prod-2', 'أرز بسمتي هندي 1 كجم', '6221001001028', 'حبوب وبقوليات', 'ممر 1A - رف 01', 1, 68.00, 'كيس', 'fixed'),
('prod-3', 'مكرونة فرن فاخرة 400 جم', '6221001001035', 'حبوب وبقوليات', 'ممر 1A - رف 02', 1, 14.00, 'كيس', 'fixed'),
('prod-4', 'زيت ذرة نقي 800 مل', '6221002002018', 'زيوت وسمن', 'ممر 1A - رف 03', 2, 75.00, 'زجاجة', 'fixed'),
('prod-5', 'زيت عباد الشمس 800 مل', '6221002002025', 'زيوت وسمن', 'ممر 1A - رف 03', 2, 65.00, 'زجاجة', 'fixed'),
('prod-6', 'صلصة طماطم معلبة 360 جم', '6221003003015', 'معلبات وصلصات', 'ممر 1B - رف 02', 3, 18.50, 'برطمان', 'fixed'),
('prod-7', 'معجون طماطم بيوريه 300 جم', '6221003003022', 'معلبات وصلصات', 'ممر 1B - رف 02', 3, 16.00, 'علبة', 'fixed'),
('prod-8', 'حليب كامل الدسم 1 لتر', '6221004004012', 'ألبان وأجبان', 'ممر 2A - ثلاجة 01', 4, 42.00, 'عبوة', 'fixed'),
('prod-9', 'حليب خالي الدسم 1 لتر', '6221004004029', 'ألبان وأجبان', 'ممر 2A - ثلاجة 01', 4, 42.00, 'عبوة', 'fixed'),
('prod-10', 'جبنة فيتا طبيعية 500 جم', '6221004004036', 'ألبان وأجبان', 'ممر 2A - ثلاجة 03', 4, 38.00, 'علبة', 'fixed'),
('prod-11', 'عصير برتقال طبيعي 1 لتر', '6221005005019', 'مشروبات وعصائر', 'ممر 2B - رف 02', 5, 28.00, 'زجاجة', 'fixed'),
('prod-12', 'عصير مانجو طبيعي 1 لتر', '6221005005026', 'مشروبات وعصائر', 'ممر 2B - رف 02', 5, 30.00, 'زجاجة', 'fixed'),
('prod-13', 'خبز توست أبيض فاخر', '6221006006016', 'مخبوزات هشة', 'ممر 3A - رف 01', 6, 25.00, 'كيس', 'fixed'),
('prod-14', 'خبز توست أسمر بالردة', '6221006006023', 'مخبوزات هشة', 'ممر 3A - رف 01', 6, 27.00, 'كيس', 'fixed'),
('prod-15', 'تفاح أحمر سكري (طازج)', '2000015012503', 'خضار وفواكه طازجة', 'ممر 3B - قسم الفواكه', 7, 55.00, 'كجم', 'variable'),
('prod-16', 'موز بلدي فاخر (طازج)', '2000016011005', 'خضار وفواكه طازجة', 'ممر 3B - قسم الفواكه', 7, 30.00, 'كجم', 'variable')
ON CONFLICT (id) DO NOTHING;

-- إدخال أوردر تجريبي
INSERT INTO public.orders (id, customer_name, customer_phone, status, cart_id, total_amount) VALUES
('ORD-101', 'كريم محمود', '01098765432', 'assigned', 'CART-01', 204.50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (id, order_id, product_id, name, barcode, category, aisle, aisle_order, price, unit, required_qty, picked_qty, status) VALUES
('item-1', 'ORD-101', 'prod-1', 'أرز مصري فاخر 1 كجم', '6221001001011', 'حبوب وبقوليات', 'ممر 1A - رف 01', 1, 32.50, 'كيس', 1, 0, 'pending'),
('item-2', 'ORD-101', 'prod-4', 'زيت ذرة نقي 800 مل', '6221002002018', 'زيوت وسمن', 'ممر 1A - رف 03', 2, 75.00, 'زجاجة', 1, 0, 'pending'),
('item-3', 'ORD-101', 'prod-8', 'حليب كامل الدسم 1 لتر', '6221004004012', 'ألبان وأجبان', 'ممر 2A - ثلاجة 01', 4, 42.00, 'عبوة', 1, 0, 'pending'),
('item-4', 'ORD-101', 'prod-13', 'خبز توست أبيض فاخر', '6221006006016', 'مخبوزات هشة', 'ممر 3A - رف 01', 6, 25.00, 'كيس', 1, 0, 'pending'),
('item-5', 'ORD-101', 'prod-16', 'موز بلدي فاخر (طازج)', '2000016011005', 'خضار وفواكه طازجة', 'ممر 3B - قسم الفواكه', 7, 30.00, 'كجم', 1, 0, 'pending')
ON CONFLICT (id) DO NOTHING;
