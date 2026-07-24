-- ============================================================
-- BIRSIL COURSES — SUPABASE COMPLETE SETUP (Updated)
-- Run this entire file in: Supabase → SQL Editor → Run
-- ============================================================

-- ============================================================
-- STEP 1: DROP EXISTING (clean slate — safe to re-run)
-- ============================================================
DROP TABLE IF EXISTS public.messages       CASCADE;
DROP TABLE IF EXISTS public.packs          CASCADE;
DROP TABLE IF EXISTS public.courses        CASCADE;
DROP TABLE IF EXISTS public.site_settings  CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;


-- ============================================================
-- STEP 2: COURSES TABLE
-- ============================================================
CREATE TABLE public.courses (
  id             BIGSERIAL PRIMARY KEY,
  title          TEXT        NOT NULL,
  description    TEXT,
  price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2),
  currency       TEXT        NOT NULL DEFAULT 'PKR'
                             CHECK (currency IN ('PKR','USD')),
  thumbnail      TEXT,                          -- URL or CSS gradient string
  is_bestseller  BOOLEAN     NOT NULL DEFAULT false,
  is_new         BOOLEAN     NOT NULL DEFAULT false,
  is_free        BOOLEAN     NOT NULL DEFAULT false,
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  sort_order     INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STEP 3: PACKS TABLE
-- ============================================================
CREATE TABLE public.packs (
  id             BIGSERIAL PRIMARY KEY,
  title          TEXT        NOT NULL,
  description    TEXT,
  price          NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2),
  currency       TEXT        NOT NULL DEFAULT 'PKR'
                             CHECK (currency IN ('PKR','USD')),
  thumbnail      TEXT,
  badge          TEXT,                          -- 'Bestseller' | 'New' | NULL
  items          TEXT[]      NOT NULL DEFAULT '{}',  -- what's included list
  is_free        BOOLEAN     NOT NULL DEFAULT false,
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  sort_order     INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STEP 4: CONTACT MESSAGES TABLE
-- ============================================================
CREATE TABLE public.messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  subject    TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  is_read    BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STEP 5: SITE SETTINGS TABLE
-- ============================================================
CREATE TABLE public.site_settings (
  id         BIGSERIAL PRIMARY KEY,
  key        TEXT        UNIQUE NOT NULL,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STEP 6: AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_packs_updated_at
  BEFORE UPDATE ON public.packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STEP 7: ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- COURSES ─────────────────────────────────────────────────────
-- Public: read active courses only
CREATE POLICY "courses_public_read"
  ON public.courses FOR SELECT
  USING (is_active = true);

-- Authenticated admin: full access
CREATE POLICY "courses_admin_all"
  ON public.courses FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- PACKS ───────────────────────────────────────────────────────
CREATE POLICY "packs_public_read"
  ON public.packs FOR SELECT
  USING (is_active = true);

CREATE POLICY "packs_admin_all"
  ON public.packs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- MESSAGES ────────────────────────────────────────────────────
-- Anyone can submit contact form
CREATE POLICY "messages_public_insert"
  ON public.messages FOR INSERT
  WITH CHECK (true);

-- Only admin can read, update (mark read), delete
CREATE POLICY "messages_admin_select"
  ON public.messages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "messages_admin_update"
  ON public.messages FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "messages_admin_delete"
  ON public.messages FOR DELETE
  USING (auth.role() = 'authenticated');

-- SITE SETTINGS ───────────────────────────────────────────────
CREATE POLICY "settings_admin_all"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- STEP 8: STORAGE BUCKETS FOR IMAGES
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('course-images', 'course-images', true),
  ('pack-images',   'pack-images',   true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "course_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-images');

CREATE POLICY "pack_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pack-images');

-- Admin upload & delete
CREATE POLICY "course_images_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-images' AND auth.role() = 'authenticated');

CREATE POLICY "course_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'course-images' AND auth.role() = 'authenticated');

CREATE POLICY "course_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'course-images' AND auth.role() = 'authenticated');

CREATE POLICY "pack_images_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pack-images' AND auth.role() = 'authenticated');

CREATE POLICY "pack_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'pack-images' AND auth.role() = 'authenticated');

CREATE POLICY "pack_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'pack-images' AND auth.role() = 'authenticated');

-- ============================================================
-- STEP 9: DEFAULT SITE SETTINGS
-- ============================================================
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name',   'Birsil Courses'),
  ('tagline',     'Learn Skills That Shape Your Future'),
  ('email',       'maxin3820@gmail.com'),
  ('phone',       '+923036326202'),
  ('whatsapp',    '+923036326202'),
  ('twitter',     'https://twitter.com'),
  ('youtube',     'https://youtube.com'),
  ('linkedin',    'https://linkedin.com'),
  ('instagram',   'https://instagram.com')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- STEP 10: SEED COURSES
-- ============================================================
INSERT INTO public.courses
  (title, description, price, original_price, currency, thumbnail,
   is_bestseller, is_new, is_free, sort_order)
VALUES
  ('Complete Web Development Bootcamp 2024',
   'Master HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects from scratch.',
   29.99, 99.99, 'USD',
   'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
   true, false, false, 1),

  ('UI/UX Design Masterclass',
   'Learn Figma, design principles, user research and prototyping. Create stunning user interfaces.',
   24.99, 79.99, 'USD',
   'linear-gradient(135deg, #818CF8 0%, #1D4ED8 100%)',
   true, false, false, 2),

  ('Python for Data Science & Machine Learning',
   'Learn Python, Pandas, Scikit-Learn and TensorFlow. Start your data science journey today.',
   34.99, 109.99, 'USD',
   'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
   false, true, false, 3),

  ('Digital Marketing & SEO',
   'Master Google Ads, SEO, content marketing and analytics to grow any business online.',
   0, NULL, 'PKR',
   'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
   false, true, true, 4),

  ('React & Next.js Complete Guide',
   'Build production-ready apps with React, Next.js and TypeScript.',
   39.99, 129.99, 'USD',
   'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
   true, false, false, 5),

  ('Personal Finance Mastery',
   'Take control of your money. Learn budgeting, investing and achieve financial freedom.',
   19.99, 69.99, 'USD',
   'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
   false, false, false, 6);

-- ============================================================
-- STEP 11: SEED PACKS
-- ============================================================
INSERT INTO public.packs
  (title, description, price, original_price, currency, thumbnail,
   badge, items, sort_order)
VALUES
  ('Ultimate Design Bundle',
   'Complete collection of Figma templates, UI kits, icon sets and brand assets.',
   2999, 8999, 'PKR',
   'linear-gradient(135deg, #818CF8 0%, #1D4ED8 100%)',
   'Bestseller',
   ARRAY['50+ Figma Templates','500+ Icons Pack','20 UI Kits','Brand Identity Kit'],
   1),

  ('Social Media Content Pack',
   'Ready-to-use social media templates for Instagram, Facebook, YouTube and TikTok.',
   1499, 4999, 'PKR',
   'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
   'New',
   ARRAY['200+ Canva Templates','Reels & Stories Pack','YouTube Thumbnails','Post Captions Pack'],
   2),

  ('Developer Starter Kit',
   'Pre-built code snippets, component libraries and project boilerplates.',
   49.99, 149.99, 'USD',
   'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
   NULL,
   ARRAY['React Component Library','50+ Code Snippets','5 Project Boilerplates','CSS Utilities Pack'],
   3);

-- ============================================================
-- DONE ✓
-- 
-- After running this SQL:
-- 1. Go to Supabase → Settings → API
-- 2. Copy "Project URL" and "anon public" key
-- 3. In Netlify → Site Settings → Environment Variables, add:
--    VITE_SUPABASE_URL      = https://xxxx.supabase.co
--    VITE_SUPABASE_ANON_KEY = your-anon-key
--    VITE_ADMIN_EMAIL       = maxin3820@gmail.com
--    VITE_ADMIN_PASSWORD    = admin12345
-- 4. Redeploy on Netlify — everything connects automatically
-- ============================================================
