-- 005_mentorship_rooms.sql

-- Create mentorship_rooms table
create table if not exists public.mentorship_rooms (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.student_profiles(id) on delete cascade,
  title text not null,
  description text,
  period text, -- e.g. "Summer 2026"
  start_date date,
  end_date date,
  company_details text,
  invite_code text unique default substr(md5(random()::text), 0, 9),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Update mentorships table to link to rooms
alter table public.mentorships
add column if not exists room_id uuid references public.mentorship_rooms(id) on delete cascade;

-- Update tasks table to link to rooms
alter table public.tasks
add column if not exists room_id uuid references public.mentorship_rooms(id) on delete set null;

-- Enable RLS
alter table public.mentorship_rooms enable row level security;

-- RLS Policies for mentorship_rooms
drop policy if exists "Anyone can view rooms via invite" on public.mentorship_rooms;
create policy "Anyone can view rooms via invite" on public.mentorship_rooms
for select using (true);

drop policy if exists "Mentors can manage their rooms" on public.mentorship_rooms;
create policy "Mentors can manage their rooms" on public.mentorship_rooms
for all using (auth.uid() = mentor_id);

-- Ensure profiles are public
-- Currently policies_view_all_profiles is already set to 'true' for select.
-- Let's double check RLS policies for student_profiles.

-- Update Task RLS for room-specific visibility
drop policy if exists "Users can view public tasks or their mentor's private tasks" on public.tasks;
drop policy if exists "Users can view tasks based on room or mentor" on public.tasks;

create policy "Users can view tasks based on room or mentor" on public.tasks
for select using (
  is_public = true 
  or auth.uid() = creator_id
  or (
    room_id is not null and exists (
      select 1 from public.mentorships
      where mentorships.room_id = public.tasks.room_id and mentorships.student_id = auth.uid()
    )
  )
  or (
    room_id is null and exists (
      select 1 from public.mentorships
      where mentorships.mentor_id = public.tasks.creator_id and mentorships.student_id = auth.uid()
    )
  )
);
