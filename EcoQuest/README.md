# EcoQuest

> **Set your goals. Hit your targets. Chop better rewards.**

EcoQuest is a gamified personal finance and budgeting application designed to help users build disciplined savings habits, complete daily financial challenges, and track bank-linked goals using an adaptive behavioral rules engine.

---

## 🌟 Features

*   **Goal Tracking & Automation:** Set targeted savings goals, contribute to them over time, and watch them automatically complete as you hit your milestones.
*   **Gamification Engine:** Earn XP, level up your profile, and unlock achievements (e.g., "Goal Crusher", "Streak Master") by consistently performing healthy financial habits.
*   **Rewards System:** Exchange your earned points for real-world styled perks, vouchers, and airtime.
*   **Simulated Sandbox Banking:** Experience a fully functional sandbox environment for transfers, bill payments, savings, and airtime recharges with strict transactional boundaries and user data isolation.
*   **Persona-based Onboarding:** Answer questions about your financial habits to receive adaptive starting accounts and specialized challenge missions.

## 🛠 Tech Stack

*   **Frontend:** Next.js 14, React, Tailwind CSS, TypeScript
*   **Backend:** FastAPI, Python 3, SQLAlchemy, Pydantic
*   **Database:** PostgreSQL
*   **Authentication:** JWT Bearer tokens with secure Bcrypt password hashing

---

## 🚀 Running Locally

### 1. Backend Setup

Ensure you have Python 3 and PostgreSQL installed and running.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .\.venv\Scripts\activate
   # Mac/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   *Make sure to update the `DATABASE_URL` with your local PostgreSQL credentials.*
5. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The database will automatically initialize and seed the gamification data upon startup.*

### 2. Frontend Setup

Ensure you have Node.js installed.

1. Navigate to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the frontend environment variables in `.env.local` to point to the backend URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡 Architecture Principles

*   **Database is the Source of Truth:** All transactions, goal completions, and achievement evaluations are strictly enforced at the database level using unified SQLAlchemy session transactions.
*   **Data Isolation:** Strict cross-user data boundaries are enforced on every endpoint to ensure secure sandbox testing. 
*   **Idempotency:** Completion rewards, XP distributions, and transaction records are safely validated to prevent duplicate processing.
