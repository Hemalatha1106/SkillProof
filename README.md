# 🚀 SkillProof: Tamper-Proof Internship & Skill Verification Platform

## 🧠 Problem Statement
Recruiters today rely on resumes and certificates that can be easily faked or manipulated. There is no reliable way to verify:
* Whether a student actually completed the work
* Who validated the work
* When the work was done
* The authenticity of internship experience

This results in fake certificates being accepted, genuine candidates being overlooked, and a lack of trust in hiring.

## 💡 Solution Overview
**SkillProof** is a hybrid Web2 + Web3 platform that enables **proof-based verification of skills and work experience**.

Instead of trusting certificates, SkillProof provides:
* Verified task submissions
* Mentor approvals
* Timestamped proof of work
* Public, tamper-proof validation via blockchain

---

## ⚙️ System Workflow
1. **Student Onboarding**: Signs up using Supabase Auth and adds their GitHub/LinkedIn profiles.
2. **Mentor Verification**: Mentors sign up, link their Polygon Amoy wallets, and gain permission to assign real-world tasks.
3. **Task Assignment & Submission**: Students submit code repositories and files (uploaded strictly to the IPFS network via Pinata) for their required assignments.
4. **Blockchain Record Validation**: After approval, a smart contract is fired storing the Hashed Student ID, Task ID, IPFS Hash, and Timestamp.
5. **Recruiter Verification**: A distinct, no-login-required recruiter dashboard shows immutable proof links, validation badges, and timeline reputation scores.

---

## 🧰 Tech Stack
### 🟢 Frontend
* Next.js (App Router)
* React & Tailwind CSS
* shadcn/ui Component Library

### 🟡 Backend (BaaS)
* Supabase (PostgreSQL, Auth, RLS Policies)

### 🟣 Blockchain
* Polygon (Amoy Testnet)
* Solidity Smart Contracts
* ethers.js

### 📂 Decentralized Storage
* IPFS (via Pinata API)

---

## 🛠️ Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) v18+ and `pnpm` installed
* A Supabase Project
* A [Pinata](https://pinata.cloud/) account for IPFS keys
* A MetaMask wallet with Polygon Amoy testnet tokens (for smart contract deployment)
* An Alchemy RPC endpoint (for Polygon Amoy)

### Local Setup
1. **Clone the Repository & Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Keys
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Web3 - Polygon Amoy RPC
   NEXT_PUBLIC_POLYGON_RPC_URL=your_alchemy_rpc_url

   # Blockchain Deployment
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_smart_contract_address
   PRIVATE_KEY=your_metamask_private_key

   # IPFS Pinata Keys
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
   NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_key
   ```

3. **Database Configuration**
   Run the SQL scripts located in the `scripts/` folder against your Supabase SQL Editor in the following order:
   - `001_create_tables.sql`
   - `002_rls_policies.sql`
   - `002_profile_trigger.sql`
   - `003_add_v2_columns.sql`

4. **Smart Contract Deployment**
   Open `contracts/SkillProof.sol` in [Remix IDE](https://remix.ethereum.org/), compile using `0.8.20`, and deploy to the Polygon Amoy Testnet via Injected Provider (MetaMask).

5. **Run the Development Server**
   ```bash
   pnpm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 💥 Unique Value Proposition
* **Eliminates fake certificates** by verifying real work, not claims.
* **Transparent and auditable system** utilizing the immutability of the blockchain.
* **Simple, scalable architecture** bridging Supabase with Web3 functionality.
