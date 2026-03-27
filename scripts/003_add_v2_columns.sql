-- Migration for SkillProof V2 Architecture

-- Add new columns to student_profiles
alter table public.student_profiles
add column if not exists github_url text,
add column if not exists linkedin_url text,
add column if not exists wallet_address text,
add column if not exists credibility_score integer default 0,
add column if not exists reputation_score integer default 0,
add column if not exists is_verified_mentor boolean default false;

-- Add new columns to submissions
alter table public.submissions
add column if not exists ipfs_hash text,
add column if not exists smart_contract_tx_hash text;
