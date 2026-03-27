# SkillProof - Skill Verification Platform

A modern platform where students submit their work for mentor review and receive blockchain-verified skill certificates.

## Features

### For Students
- **Browse Tasks**: View available skill tasks at different difficulty levels
- **Submit Solutions**: Submit your work with detailed explanations
- **Track Progress**: Monitor submission status and mentor feedback
- **Share Certificates**: Display verified skills publicly with unique verification links
- **Blockchain Hashes**: Each approved skill is verified on the Polygon (Amoy Testnet) for permanence
- **Decentralized Storage**: Task files are stored securely on IPFS
- **Reputation**: Build a Credibility Score across your verified tasks

### For Mentors
- **Review Submissions**: View all pending student submissions
- **Provide Feedback**: Give constructive feedback on submissions
- **Approve/Reject**: Accept submissions and generate blockchain verification
- **Create Tasks**: Define new skill tasks for the community

### Public Features
- **Verification Pages**: Anyone can view a student's verified skills at `/verify/[studentId]`
- **No login required** to view certificates

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Row Level Security policies
- **Web3 Integration**: ethers.js, Solidity Smart Contracts
- **Decentralized Storage**: IPFS (Pinata/Web3.Storage)
- **Blockchain**: Polygon (Amoy Testnet)

## Getting Started

### 1. Database Setup

The SQL migrations are in the `scripts/` folder. They need to be executed in your Supabase project:

```sql
-- scripts/001_create_tables.sql
-- Creates student_profiles, tasks, and submissions tables
```

Key tables:
- `student_profiles`: User profiles with role (student/mentor)
- `tasks`: Skill tasks created by mentors
- `submissions`: Student submissions awaiting review

### 2. Authentication Flow

1. Users sign up at `/auth/sign-up` choosing Student or Mentor role
2. A profile is auto-created via database trigger
3. After login, they're redirected to `/protected` → their dashboard
4. Students see `/student` dashboard
5. Mentors see `/mentor` dashboard

### 3. Core Workflows

#### Student Workflow
1. Sign up as Student
2. Browse available tasks on dashboard
3. Click "Submit Solution" on a task
4. Write/upload your solution (files are uploaded to IPFS) at `/student/submit/[taskId]`
5. View submission status and feedback
6. When approved, receive an immutable smart contract transaction hash and IPFS links
7. Share verification link: `/verify/[studentId]`

#### Mentor Workflow
1. Sign up as Mentor
2. Visit mentor dashboard at `/mentor`
3. Click "+ Create New Task" to create new tasks
4. Review pending submissions with "Review" button
5. Provide feedback and choose to approve (generates blockchain hash) or request changes
6. Approved submissions are published on student's verification page

## Key Pages

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Landing page | Public |
| `/auth/login` | Login | Public |
| `/auth/sign-up` | Registration | Public |
| `/student` | Student dashboard | Students only |
| `/student/submit/[taskId]` | Submit solution | Students only |
| `/mentor` | Mentor dashboard | Mentors only |
| `/mentor/create-task` | Create task | Mentors only |
| `/mentor/review/[submissionId]` | Review submission | Mentors only |
| `/verify/[studentId]` | Public certificates | Public |

## Database Schema

### student_profiles
```sql
id (UUID, PK) - references auth.users(id)
email (text)
full_name (text)
role (text) - 'student' or 'mentor'
github_url (text)
linkedin_url (text)
wallet_address (text)
credibility_score (integer)
reputation_score (integer)
is_verified_mentor (boolean)
created_at / updated_at
```

### tasks
```sql
id (UUID, PK)
title (text)
description (text)
difficulty_level (text) - 'beginner', 'intermediate', 'advanced'
category (text)
created_at / updated_at
```

### submissions
```sql
id (UUID, PK)
student_id (UUID, FK)
task_id (UUID, FK)
status (text) - 'pending', 'approved', 'rejected'
submission_text (text)
submission_file_url (text)
ipfs_hash (text) - IPFS CID for uploaded files
submitted_at / approved_at (timestamp)
approved_by (UUID) - mentor who approved
feedback (text)
blockchain_hash (text)
smart_contract_tx_hash (text) - Actual Polygon Tx Hash
created_at / updated_at
```

## Environment Variables

These are needed for the full V2 implementation:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_PINATA_API_KEY` (for IPFS)
- `NEXT_PUBLIC_PINATA_SECRET_API_KEY` (for IPFS)
- `NEXT_PUBLIC_POLYGON_RPC_URL` (for Smart Contract)
- `PRIVATE_KEY` (for Smart Contract deployment)
- `NEXT_PUBLIC_CONTRACT_ADDRESS`

## Smart Contract Implementation

A solidity smart contract deployed to the Polygon Amoy Testnet handles the proof of work verification. 
Upon approval, mentors sign a transaction that stores:
- Hashed student ID
- Task ID
- IPFS Hash
- Mentor wallet address
- Timestamp
This creates a permanent and public audit trail for recruiters.

## Styling

- **Color Scheme**: Professional blue/white/slate theme
- **Typography**: Clean sans-serif (system fonts)
- **Components**: shadcn/ui with Tailwind CSS
- **Responsive**: Mobile-first design with md/lg breakpoints

## Testing the App

### Quick Demo Flow:
1. Sign up as Student (John Student)
2. Sign up as Mentor (Jane Mentor) in incognito/different browser
3. As Mentor: Create a task
4. As Student: Submit solution to task
5. As Mentor: Review and approve submission (generates blockchain hash)
6. As Student: View approval and blockchain hash
7. As Public User: Visit `/verify/[studentId]` to see public certificate

## Future Enhancements

- Real file upload support for submissions
- Email notifications for submissions and approvals
- Skill endorsements from other users
- Portfolio building and analytics
- Real blockchain integration (Ethereum, etc.)
- Skill badges and levels
- Mentor ratings and reviews
