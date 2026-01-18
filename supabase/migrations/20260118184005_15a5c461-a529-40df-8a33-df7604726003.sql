-- Re-enable RLS on exams (we disabled it as a last-resort workaround, but it didn't fix the issue)
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;