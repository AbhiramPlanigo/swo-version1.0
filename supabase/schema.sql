-- ==============================================================================
-- CHRIST UNIVERSITY STUDENT WELFARE OFFICE (SWO) - SUPABASE DATABASE SCHEMA
-- Final Comprehensive Idempotent Script: Safe to execute on empty DB or existing DB
-- Fully immune to Error 23502 (NOT NULL violations) and Error 42804 (type mismatch).
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE ALL 13 PROJECT TABLES IF NOT EXISTS
-- ==============================================================================

-- 2.1 EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Cultural',
  date TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  banner_url TEXT DEFAULT '',
  capacity INTEGER NOT NULL DEFAULT 100,
  registered_count INTEGER NOT NULL DEFAULT 0,
  organizing_committee TEXT DEFAULT '',
  eligibility TEXT DEFAULT '',
  registration_deadline TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Published',
  in_carousel BOOLEAN NOT NULL DEFAULT false,
  carousel_order INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  speaker JSONB,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  requires_qr_pass BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_date TEXT DEFAULT '',
  event_time TEXT DEFAULT '',
  event_venue TEXT DEFAULT '',
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_reg_no TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_dept TEXT NOT NULL,
  student_year TEXT DEFAULT '',
  registered_at TEXT NOT NULL DEFAULT (now()::text),
  status TEXT NOT NULL DEFAULT 'Confirmed',
  custom_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  ticket_code TEXT NOT NULL DEFAULT '',
  requires_qr_pass BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_reg_no TEXT NOT NULL,
  student_dept TEXT NOT NULL,
  check_in_time TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'QR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  date TEXT NOT NULL DEFAULT '',
  target_dept TEXT NOT NULL DEFAULT 'All Departments',
  target_year TEXT NOT NULL DEFAULT 'All Batches',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  read_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  author_name TEXT NOT NULL DEFAULT 'Student Welfare Office',
  author_role TEXT NOT NULL DEFAULT 'SWO Directorate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  certificate_no TEXT NOT NULL UNIQUE,
  event_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_date TEXT NOT NULL DEFAULT '',
  student_name TEXT NOT NULL,
  student_reg_no TEXT NOT NULL,
  department TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Participation',
  issued_date TEXT DEFAULT '',
  authorized_by TEXT DEFAULT '',
  designation TEXT DEFAULT '',
  qr_verify_code TEXT DEFAULT '',
  template_id TEXT NOT NULL DEFAULT 'classic-gold',
  signatories JSONB NOT NULL DEFAULT '[]'::jsonb,
  citation_text TEXT DEFAULT '',
  university_title TEXT DEFAULT 'CHRIST (Deemed to be University)',
  campus_subtitle TEXT DEFAULT 'Bangalore Yeshwanthpur Campus',
  office_subtitle TEXT DEFAULT 'STUDENT WELFARE OFFICE',
  certificate_heading TEXT DEFAULT '',
  conferral_line TEXT DEFAULT '',
  verification_badge_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 COMMITTEES TABLE
CREATE TABLE IF NOT EXISTS public.committees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  wing TEXT NOT NULL DEFAULT 'Cultural Wing',
  lead_name TEXT DEFAULT '',
  deputy_name TEXT DEFAULT '',
  member_count INTEGER NOT NULL DEFAULT 0,
  email TEXT DEFAULT '',
  description TEXT DEFAULT '',
  active_events_count INTEGER NOT NULL DEFAULT 0,
  faculty_coordinator TEXT DEFAULT '',
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 RESEARCH & SURVEYS TABLE
CREATE TABLE IF NOT EXISTS public.research_surveys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Campus Welfare Research',
  deadline TEXT NOT NULL DEFAULT '',
  responses_count INTEGER NOT NULL DEFAULT 0,
  total_responses INTEGER NOT NULL DEFAULT 0,
  target_sample INTEGER NOT NULL DEFAULT 250,
  status TEXT NOT NULL DEFAULT 'Active',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.8 SURVEY RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.research_surveys(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT (now()::text),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.9 HERO BANNER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  badge TEXT DEFAULT 'Christ University • Directorate of Student Welfare',
  title TEXT DEFAULT 'Flagship Conclave & Cultural Fest 2026',
  subtitle TEXT DEFAULT 'Bangalore Yeshwanthpur Campus',
  description TEXT DEFAULT '',
  date TEXT DEFAULT '',
  time TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  location_badge TEXT DEFAULT 'Main Auditorium • Campus Stage',
  speakers JSONB NOT NULL DEFAULT '[]'::jsonb,
  accent_color TEXT DEFAULT '#C5A063',
  bg_image TEXT DEFAULT '/assets/christ-yeshwanthpur-campus.jpg',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.10 MULTI-SHOWCASE HERO EVENTS TABLE
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

-- 2.11 INSTITUTIONAL SAVED MEDIA ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.saved_media_assets (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'event',
  ratio TEXT NOT NULL DEFAULT '16:9',
  dimensions TEXT DEFAULT '1920 × 1080 px',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.12 DAILY QUOTES TABLE
CREATE TABLE IF NOT EXISTS public.daily_quotes (
  id TEXT PRIMARY KEY DEFAULT 'today',
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  author_title TEXT DEFAULT '',
  date TEXT DEFAULT '',
  category TEXT DEFAULT 'Excellence',
  posted_by TEXT DEFAULT 'SWO Directorate',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.13 STUDENT ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.student_accounts (
  email TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  reg_no TEXT NOT NULL,
  department TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  year TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. SAFE SCHEMA MIGRATIONS (Pure DDL Statements - Immune to Savepoint Rollbacks)
-- ==============================================================================

-- 3.1 DAILY QUOTES MIGRATIONS (Fixes Error 23502 on posted_by)
ALTER TABLE public.daily_quotes ADD COLUMN IF NOT EXISTS posted_by TEXT DEFAULT 'SWO Directorate';
ALTER TABLE public.daily_quotes ADD COLUMN IF NOT EXISTS author_title TEXT DEFAULT '';
ALTER TABLE public.daily_quotes ADD COLUMN IF NOT EXISTS date TEXT DEFAULT '';
ALTER TABLE public.daily_quotes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Excellence';

ALTER TABLE public.daily_quotes ALTER COLUMN posted_by DROP NOT NULL;
ALTER TABLE public.daily_quotes ALTER COLUMN posted_by SET DEFAULT 'SWO Directorate';
ALTER TABLE public.daily_quotes ALTER COLUMN author_title DROP NOT NULL;
ALTER TABLE public.daily_quotes ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.daily_quotes ALTER COLUMN category DROP NOT NULL;

UPDATE public.daily_quotes SET 
  posted_by = COALESCE(posted_by, 'SWO Directorate'),
  author_title = COALESCE(author_title, ''),
  date = COALESCE(date, 'Today'),
  category = COALESCE(category, 'Excellence')
WHERE id = 'today';

-- 3.2 HERO SETTINGS MIGRATIONS (Fixes Error 23502 on date/time/venue and Error 42804 on tags)
ALTER TABLE public.hero_settings ADD COLUMN IF NOT EXISTS location_badge TEXT DEFAULT 'Main Auditorium • Campus Stage';
ALTER TABLE public.hero_settings ADD COLUMN IF NOT EXISTS speakers JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.hero_settings ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.hero_settings ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.hero_settings ALTER COLUMN time DROP NOT NULL;
ALTER TABLE public.hero_settings ALTER COLUMN venue DROP NOT NULL;
ALTER TABLE public.hero_settings ALTER COLUMN description DROP NOT NULL;
ALTER TABLE public.hero_settings ALTER COLUMN badge DROP NOT NULL;
ALTER TABLE public.hero_settings ALTER COLUMN subtitle DROP NOT NULL;
ALTER TABLE public.hero_settings ALTER COLUMN accent_color DROP NOT NULL;
ALTER TABLE public.hero_settings ALTER COLUMN bg_image DROP NOT NULL;

ALTER TABLE public.hero_settings ALTER COLUMN date SET DEFAULT '';
ALTER TABLE public.hero_settings ALTER COLUMN time SET DEFAULT '';
ALTER TABLE public.hero_settings ALTER COLUMN venue SET DEFAULT '';

UPDATE public.hero_settings SET 
  date = COALESCE(date, 'Saturday, October 17, 2026'),
  time = COALESCE(time, '10:00 AM – 05:00 PM IST'),
  venue = COALESCE(venue, 'Main University Auditorium • Tier 1'),
  description = COALESCE(description, ''),
  location_badge = COALESCE(location_badge, 'Main Auditorium • Campus Stage')
WHERE id = 'current';

-- Convert tags from text[] to JSONB if legacy array type exists (Fixes Error 42804)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'hero_settings' AND column_name = 'tags' AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE public.hero_settings ALTER COLUMN tags DROP DEFAULT;
    ALTER TABLE public.hero_settings ALTER COLUMN tags TYPE JSONB USING to_jsonb(tags);
    ALTER TABLE public.hero_settings ALTER COLUMN tags SET DEFAULT '[]'::jsonb;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3.3 EVENTS MIGRATIONS
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS requires_qr_pass BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS in_carousel BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS carousel_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS speaker JSONB;

ALTER TABLE public.events ALTER COLUMN subtitle DROP NOT NULL;
ALTER TABLE public.events ALTER COLUMN description DROP NOT NULL;
ALTER TABLE public.events ALTER COLUMN banner_url DROP NOT NULL;
ALTER TABLE public.events ALTER COLUMN organizing_committee DROP NOT NULL;
ALTER TABLE public.events ALTER COLUMN eligibility DROP NOT NULL;
ALTER TABLE public.events ALTER COLUMN registration_deadline DROP NOT NULL;

-- 3.4 REGISTRATIONS MIGRATIONS
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS requires_qr_pass BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS custom_answers JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS ticket_code TEXT NOT NULL DEFAULT '';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS event_date TEXT DEFAULT '';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS event_time TEXT DEFAULT '';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS event_venue TEXT DEFAULT '';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS student_year TEXT DEFAULT '';

ALTER TABLE public.registrations ALTER COLUMN event_date DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN event_time DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN event_venue DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN student_year DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN status DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN ticket_code DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN custom_answers DROP NOT NULL;
ALTER TABLE public.registrations ALTER COLUMN requires_qr_pass DROP NOT NULL;

-- 3.5 CERTIFICATES MIGRATIONS
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS template_id TEXT NOT NULL DEFAULT 'classic-gold';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS signatories JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS citation_text TEXT DEFAULT '';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS qr_verify_code TEXT DEFAULT '';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS university_title TEXT DEFAULT 'CHRIST (Deemed to be University)';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS campus_subtitle TEXT DEFAULT 'Bangalore Yeshwanthpur Campus';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS office_subtitle TEXT DEFAULT 'STUDENT WELFARE OFFICE';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS certificate_heading TEXT DEFAULT '';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS conferral_line TEXT DEFAULT '';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS verification_badge_text TEXT DEFAULT '';

ALTER TABLE public.certificates ALTER COLUMN department DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN issued_date DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN authorized_by DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN designation DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN qr_verify_code DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN template_id DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN signatories DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN citation_text DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN university_title DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN campus_subtitle DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN office_subtitle DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN certificate_heading DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN conferral_line DROP NOT NULL;
ALTER TABLE public.certificates ALTER COLUMN verification_badge_text DROP NOT NULL;

-- 3.6 ANNOUNCEMENTS MIGRATIONS
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_dept TEXT NOT NULL DEFAULT 'All Departments';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_year TEXT NOT NULL DEFAULT 'All Batches';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS read_by JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT 'Student Welfare Office';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS author_role TEXT NOT NULL DEFAULT 'SWO Directorate';

ALTER TABLE public.announcements ALTER COLUMN category DROP NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN target_dept DROP NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN target_year DROP NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN is_pinned DROP NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN read_by DROP NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN author_name DROP NOT NULL;
ALTER TABLE public.announcements ALTER COLUMN author_role DROP NOT NULL;

-- 3.7 COMMITTEES MIGRATIONS
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS active_events_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS faculty_coordinator TEXT DEFAULT '';
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS members JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.committees ALTER COLUMN wing DROP NOT NULL;
ALTER TABLE public.committees ALTER COLUMN lead_name DROP NOT NULL;
ALTER TABLE public.committees ALTER COLUMN deputy_name DROP NOT NULL;
ALTER TABLE public.committees ALTER COLUMN member_count DROP NOT NULL;
ALTER TABLE public.committees ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.committees ALTER COLUMN description DROP NOT NULL;
ALTER TABLE public.committees ALTER COLUMN active_events_count DROP NOT NULL;
ALTER TABLE public.committees ALTER COLUMN faculty_coordinator DROP NOT NULL;
ALTER TABLE public.committees ALTER COLUMN members DROP NOT NULL;

-- 3.8 RESEARCH SURVEYS MIGRATIONS
ALTER TABLE public.research_surveys ADD COLUMN IF NOT EXISTS questions_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.research_surveys ADD COLUMN IF NOT EXISTS questions JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.research_surveys ALTER COLUMN description DROP NOT NULL;
ALTER TABLE public.research_surveys ALTER COLUMN category DROP NOT NULL;
ALTER TABLE public.research_surveys ALTER COLUMN deadline DROP NOT NULL;
ALTER TABLE public.research_surveys ALTER COLUMN responses_count DROP NOT NULL;
ALTER TABLE public.research_surveys ALTER COLUMN total_responses DROP NOT NULL;
ALTER TABLE public.research_surveys ALTER COLUMN target_sample DROP NOT NULL;
ALTER TABLE public.research_surveys ALTER COLUMN status DROP NOT NULL;
ALTER TABLE public.research_surveys ALTER COLUMN questions DROP NOT NULL;
ALTER TABLE public.research_surveys ALTER COLUMN questions_count DROP NOT NULL;

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student ON public.registrations (student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance_records (event_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_reg ON public.certificates (student_reg_no);
CREATE INDEX IF NOT EXISTS idx_certificates_event ON public.certificates (event_id);
CREATE INDEX IF NOT EXISTS idx_research_surveys_status ON public.research_surveys (status);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON public.survey_responses (survey_id);
CREATE INDEX IF NOT EXISTS idx_showcase_items_sort ON public.showcase_items (sort_order);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for events" ON public.events;
CREATE POLICY "Public access for events" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for registrations" ON public.registrations;
CREATE POLICY "Public access for registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for attendance_records" ON public.attendance_records;
CREATE POLICY "Public access for attendance_records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for announcements" ON public.announcements;
CREATE POLICY "Public access for announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for certificates" ON public.certificates;
CREATE POLICY "Public access for certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for committees" ON public.committees;
CREATE POLICY "Public access for committees" ON public.committees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for research_surveys" ON public.research_surveys;
CREATE POLICY "Public access for research_surveys" ON public.research_surveys FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for survey_responses" ON public.survey_responses;
CREATE POLICY "Public access for survey_responses" ON public.survey_responses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for hero_settings" ON public.hero_settings;
CREATE POLICY "Public access for hero_settings" ON public.hero_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for showcase_items" ON public.showcase_items;
CREATE POLICY "Public access for showcase_items" ON public.showcase_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for saved_media_assets" ON public.saved_media_assets;
CREATE POLICY "Public access for saved_media_assets" ON public.saved_media_assets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for daily_quotes" ON public.daily_quotes;
CREATE POLICY "Public access for daily_quotes" ON public.daily_quotes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for student_accounts" ON public.student_accounts;
CREATE POLICY "Public access for student_accounts" ON public.student_accounts FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. GRANT ALL PERMISSIONS TO ANON & AUTHENTICATED ROLES
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- 7. DEFAULT SEED RECORDS (Guaranteed type-safe & constraint-safe upserts)
-- ==============================================================================

-- 7.1 Seed Hero Settings (All non-null fields explicitly provided; tags omitted from insert list to prevent type clashes)
INSERT INTO public.hero_settings (
  id, badge, title, subtitle, description, date, time, venue, location_badge, accent_color, bg_image
)
VALUES (
  'current',
  'Christ University • Directorate of Student Welfare',
  'Flagship Conclave & Cultural Fest 2026',
  'Bangalore Yeshwanthpur Campus',
  'Experience the largest collegiate arts, music, and leadership festival at Yeshwanthpur Campus.',
  'Saturday, October 17, 2026',
  '10:00 AM – 05:00 PM IST',
  'Main University Auditorium • Tier 1',
  'Main Auditorium • Campus Stage',
  '#C5A063',
  '/assets/christ-yeshwanthpur-campus.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  badge = EXCLUDED.badge,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  date = EXCLUDED.date,
  time = EXCLUDED.time,
  venue = EXCLUDED.venue,
  location_badge = EXCLUDED.location_badge,
  accent_color = EXCLUDED.accent_color,
  bg_image = EXCLUDED.bg_image;

-- 7.2 Seed Daily Quote (All fields including posted_by explicitly provided)
INSERT INTO public.daily_quotes (
  id, quote, author, author_title, date, category, posted_by
)
VALUES (
  'today',
  'Excellence and service are the twin beacons that guide every Christite towards holistic transformation.',
  'Directorate of Student Welfare',
  'Christ University, Yeshwanthpur',
  'Today',
  'Excellence',
  'SWO Directorate'
)
ON CONFLICT (id) DO UPDATE SET
  quote = EXCLUDED.quote,
  author = EXCLUDED.author,
  author_title = EXCLUDED.author_title,
  date = EXCLUDED.date,
  category = EXCLUDED.category,
  posted_by = EXCLUDED.posted_by;

-- 7.3 Seed Multi-Showcase Hero Events
INSERT INTO public.showcase_items (
  id, tab_label, tab_emoji, badge, title, subtitle, description, date, time, venue, location_badge, accent_color, bg_image, sort_order
)
VALUES 
(
  'showcase_ai_conclave',
  'AI Conclave',
  '🤖',
  'CHRIST UNIVERSITY CAMPUS SHOWCASE 2026',
  'NATIONAL AI & ROBOTICS CONCLAVE',
  'Pioneering Autonomous Systems, Ethics & Future Tech',
  'An intellectually charged semester dialogue uniting pioneering technologists, public policy changemakers, and visionary leaders with the vibrant student community of Christ University.',
  'Saturday, October 17, 2026',
  '10:00 AM – 05:00 PM IST',
  'Main University Auditorium • Tier 1',
  'Main Auditorium • Campus Stage',
  '#C5A063',
  '/assets/christ-yeshwanthpur-campus.jpg',
  1
),
(
  'showcase_darpan',
  'Darpan Fest',
  '🎭',
  'CHRIST UNIVERSITY INTRA-COLLEGIATE CULTURAL FEST',
  'DARPAN TALENT DISCOVERY 2026',
  'Unleash Creativity Across Theatre, Music & Classical Arts',
  'The flagship annual inter-departmental festival celebrating artistic expression, music ensembles, theatrical monologues, and cultural heritage across Christ University.',
  'November 05–07, 2026',
  '09:00 AM – 06:30 PM IST',
  'Amphitheatre & Quadrangle Stage',
  'Open Amphitheatre Stage',
  '#60A5FA',
  '/assets/christ-yeshwanthpur-campus.jpg',
  2
),
(
  'showcase_talkseries',
  'Talk Series',
  '🎙️',
  'DISTINGUISHED LEADERSHIP FORUM',
  'INNOVATION TALK SERIES',
  'Global Perspectives from Industry & Academia',
  'Engaging guest lectures, fireside chats, and masterclasses designed to inspire next-generation leaders and entrepreneurs.',
  'Friday, December 04, 2026',
  '02:00 PM – 04:30 PM IST',
  'Seminar Hall 3 • Academic Block A',
  'Seminar Hall • Floor 3',
  '#34C759',
  '/assets/christ-yeshwanthpur-campus.jpg',
  3
)
ON CONFLICT (id) DO NOTHING;

-- 7.4 Seed Default Institutional Media Library Banners
INSERT INTO public.saved_media_assets (id, url, name, category, ratio, dimensions)
VALUES
(
  'media_default_1',
  '/assets/christ-yeshwanthpur-campus.jpg',
  'Christ Yeshwanthpur Campus Aerial Panorama',
  'hero',
  '21:9',
  '2560 × 1080 px'
),
(
  'media_default_2',
  '/assets/christ-yeshwanthpur-campus.jpg',
  'Academic Conclave Official Banner',
  'event',
  '16:9',
  '1920 × 1080 px'
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 8. RELOAD POSTGREST SCHEMA CACHE
-- ==============================================================================
NOTIFY pgrst, 'reload schema';
