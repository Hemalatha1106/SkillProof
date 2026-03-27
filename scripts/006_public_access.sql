-- Allow anyone to view approved submissions
DROP POLICY IF EXISTS "Anyone can view approved submissions" ON public.submissions;
CREATE POLICY "Anyone can view approved submissions" ON public.submissions
  FOR SELECT
  USING (LOWER(status) = 'approved');

-- Ensure profiles are public for everyone
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.student_profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.student_profiles
  FOR SELECT
  USING (true);

-- Ensure tasks are public for everyone
DROP POLICY IF EXISTS "Tasks are viewable by everyone" ON public.tasks;
CREATE POLICY "Tasks are viewable by everyone" ON public.tasks
  FOR SELECT
  USING (true);

-- Double check is_public column
UPDATE public.tasks SET is_public = true WHERE is_public IS NULL;
