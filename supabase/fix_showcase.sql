-- ==============================================================================
-- SWO PORTAL: SHOWCASE ITEMS CLEANUP & SCHEMA FIX
-- ==============================================================================
-- Run this query in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Check current items in public.showcase_items
SELECT id, tab_label, tab_emoji, title, sort_order, updated_at 
FROM public.showcase_items 
ORDER BY sort_order ASC;

-- 2. Delete Darpan Fest ('therpen') and all stale default showcase records
DELETE FROM public.showcase_items 
WHERE id IN ('showcase_darpan', 'darpan-fest')
   OR LOWER(tab_label) LIKE '%darpan%'
   OR LOWER(title) LIKE '%darpan%';

-- Optional: If you want to clear all 3 default initial showcase records (AI Conclave, Darpan, Talk Series)
-- and manage your own custom showcases from the Admin panel, uncomment this:
-- DELETE FROM public.showcase_items WHERE id IN ('showcase_ai_conclave', 'showcase_darpan', 'showcase_talkseries', 'talk-series', 'quantum-tech', 'darpan-fest');

-- 3. Ensure public.showcase_items table has correct schema & defaults
CREATE TABLE IF NOT EXISTS public.showcase_items (
  id TEXT PRIMARY KEY,
  tab_label TEXT NOT NULL DEFAULT 'Festival',
  tab_emoji TEXT NOT NULL DEFAULT '🌟',
  badge TEXT DEFAULT 'CHRIST UNIVERSITY CAMPUS SHOWCASE 2026',
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  date TEXT DEFAULT '',
  time TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  location_badge TEXT DEFAULT 'Main Auditorium • Campus Stage',
  speakers JSONB NOT NULL DEFAULT '[]'::jsonb,
  accent_color TEXT DEFAULT '#C5A063',
  bg_image TEXT DEFAULT '/assets/christ-yeshwanthpur-campus.jpg',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Ensure Row Level Security allows SELECT, INSERT, UPDATE, DELETE
ALTER TABLE public.showcase_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for showcase_items" ON public.showcase_items;
CREATE POLICY "Public access for showcase_items" ON public.showcase_items FOR ALL USING (true) WITH CHECK (true);

-- 5. Grant permissions to anon & authenticated roles
GRANT ALL ON TABLE public.showcase_items TO anon, authenticated, service_role;

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
