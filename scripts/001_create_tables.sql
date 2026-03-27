-- Create student_profiles table
create table if not exists public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text default 'student',
  github_url text,
  linkedin_url text,
  wallet_address text,
  credibility_score integer default 0,
  reputation_score integer default 0,
  is_verified_mentor boolean default false,
  company_name text,
  position text,
  experience text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  difficulty_level text default 'beginner',
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create submissions table
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  status text default 'pending',
  submission_text text,
  submission_file_url text,
  ipfs_hash text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()),
  approved_at timestamp with time zone,
  approved_by uuid references public.student_profiles(id) on delete set null,
  feedback text,
  blockchain_hash text,
  smart_contract_tx_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.student_profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.submissions enable row level security;

-- Create indexes for better performance
create index if not exists idx_submissions_student_id on public.submissions(student_id);
create index if not exists idx_submissions_task_id on public.submissions(task_id);
create index if not exists idx_submissions_status on public.submissions(status);
