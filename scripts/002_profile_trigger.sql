-- Create trigger function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.student_profiles (
    id, email, full_name, role, github_url, linkedin_url, wallet_address,
    company_name, position, experience
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    new.raw_user_meta_data ->> 'github_url',
    new.raw_user_meta_data ->> 'linkedin_url',
    new.raw_user_meta_data ->> 'wallet_address',
    new.raw_user_meta_data ->> 'company_name',
    new.raw_user_meta_data ->> 'position',
    new.raw_user_meta_data ->> 'experience'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
