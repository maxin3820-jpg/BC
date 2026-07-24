-- ============================================================
-- BATCH 2 FEATURES — Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. FAQs Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faqs (
  id         BIGSERIAL PRIMARY KEY,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs_public_read"
  ON public.faqs FOR SELECT
  USING (is_active = true);

CREATE POLICY "faqs_admin_all"
  ON public.faqs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed default FAQs
INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('How do I buy a course?', 'Click "Buy on WhatsApp" on any course card and send us a message. We''ll guide you through the purchase instantly.', 1),
  ('How do I pay?', 'We accept JazzCash, Easypaisa, and Crypto. Contact us on WhatsApp and we''ll guide you through the payment.', 2),
  ('Can I access on mobile?', 'Yes. Everything works on phone, tablet and desktop. No app needed.', 3),
  ('Is there a refund policy?', 'We do not offer refunds. However, if you face any issues with our products, we will fix them for you — just reach out to us on WhatsApp.', 4),
  ('What are Digital Packs?', 'Packs are bundles of premium digital products — templates, design kits, code snippets and more. Buy once, use forever.', 5)
ON CONFLICT DO NOTHING;

-- ── 2. Reply Templates Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reply_templates (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reply_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_admin_all"
  ON public.reply_templates FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed default templates
INSERT INTO public.reply_templates (title, message, sort_order) VALUES
  ('Course Inquiry Response', 'Hi! Thank you for your interest in our courses. We would be happy to help you get started. Which course are you interested in?', 1),
  ('Payment Instructions', 'Hi! To complete your purchase, you can pay via JazzCash, Easypaisa, or Crypto. Please let us know which method works for you and we will share the details.', 2),
  ('Access Delivery', 'Hi! Thank you for your payment. Your course access has been sent. Please check and let us know if you have any questions.', 3),
  ('Support Response', 'Hi! We are sorry to hear you are having an issue. Please describe the problem in detail and we will fix it for you as soon as possible.', 4)
ON CONFLICT DO NOTHING;

-- ── Add is_free column to packs table ───────────────────────
ALTER TABLE public.packs
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS label TEXT DEFAULT NULL;
-- Labels: 'Interested' | 'Purchased' | 'Support' | 'Spam' | NULL

-- ── 4. Announcement Banner (add to site_settings) ────────────
INSERT INTO public.site_settings (key, value) VALUES
  ('announcement_text', ''),
  ('announcement_active', 'false')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- DONE ✓
-- After running this SQL, redeploy your site.
-- ============================================================

-- ============================================================
-- ADD is_free TO PACKS TABLE
-- Run this if you already ran the original batch2-setup.sql
-- ============================================================
ALTER TABLE public.packs
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;
