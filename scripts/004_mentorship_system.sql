-- 004_mentorship_system.sql

-- Create mentorships table
create table if not exists public.mentorships (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.student_profiles(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(student_id) -- A student can only have one primary mentor for now
);

-- Update tasks table
alter table public.tasks
add column if not exists creator_id uuid references public.student_profiles(id) on delete set null,
add column if not exists is_public boolean default true;

-- Enable RLS for mentorships
alter table public.mentorships enable row level security;

-- RLS Policies for mentorships
-- Mentors can view their own mentorships
create policy "Mentors can view their mentees" on public.mentorships
for select using (auth.uid() = mentor_id);

-- Students can view their own mentorship
create policy "Students can view their mentor" on public.mentorships
for select using (auth.uid() = student_id);

-- Anyone can insert if they are the student accepting an invite (verification happens in app/action)
create policy "Students can accept invites" on public.mentorships
for insert with check (auth.uid() = student_id);

-- Update Task RLS Policies
drop policy if exists policies_view_all_tasks on public.tasks;

create policy "Users can view public tasks or their mentor's private tasks" on public.tasks
for select using (
  is_public = true 
  or auth.uid() = creator_id
  or exists (
    select 1 from public.mentorships
    where mentor_id = public.tasks.creator_id and student_id = auth.uid()
  )
);

-- Update Submissions RLS
-- Mentors should be able to see all submissions from their mentees
create policy "Mentors can view mentee submissions" on public.submissions
for select using (
  exists (
    select 1 from public.mentorships
    where mentor_id = auth.uid() and student_id = public.submissions.student_id
  )
);
