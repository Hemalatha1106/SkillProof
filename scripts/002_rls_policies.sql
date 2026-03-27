-- RLS Policies for student_profiles
create policy policies_view_all_profiles on public.student_profiles for select using (true);
create policy policies_insert_own_profile on public.student_profiles for insert with check (auth.uid() = id);
create policy policies_update_own_profile on public.student_profiles for update using (auth.uid() = id);

-- RLS Policies for tasks (anyone can view)
create policy policies_view_all_tasks on public.tasks for select using (true);
create policy policies_insert_tasks on public.tasks for insert with check (
  exists (
    select 1 from public.student_profiles
    where id = auth.uid() and role = 'mentor'
  )
);

-- RLS Policies for submissions
create policy policies_view_own_submissions on public.submissions for select using (
  auth.uid() = student_id or exists (
    select 1 from public.student_profiles
    where id = auth.uid() and role = 'mentor'
  )
);
create policy policies_create_submissions on public.submissions for insert with check (
  auth.uid() = student_id
);
create policy policies_update_own_submissions on public.submissions for update using (
  auth.uid() = student_id and status = 'pending'
);
create policy policies_update_submissions_mentor on public.submissions for update using (
  exists (
    select 1 from public.student_profiles
    where id = auth.uid() and role = 'mentor'
  )
);
