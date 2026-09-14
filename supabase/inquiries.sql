-- ==============================================================================
-- SWO PORTAL: STUDENT INQUIRIES & HELPDESK TABLE SCHEMA
-- ==============================================================================
-- Run this query in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE TABLE IF NOT EXISTS public.student_inquiries (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_reg_no TEXT NOT NULL,
  student_dept TEXT DEFAULT 'General',
  student_email TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General Welfare',
  question TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'Received',
  admin_response TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.student_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated access for submitting and managing inquiries
DROP POLICY IF EXISTS "Public access for student_inquiries" ON public.student_inquiries;
CREATE POLICY "Public access for student_inquiries" ON public.student_inquiries FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to anon, authenticated, and service roles
GRANT ALL ON TABLE public.student_inquiries TO anon, authenticated, service_role;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
