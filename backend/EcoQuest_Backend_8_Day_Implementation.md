# EcoQuest Backend — 8-Day Implementation Plan

> **Project:** EcoQuest — A Gamified Financial Loyalty & Behaviour Engine for Ecobank  
> **Backend:** Python + FastAPI  
> **Database:** PostgreSQL  
> **Optional:** Redis for rate limiting/event processing/cache  
> **Implementation window:** Days 1–8  
> **Source:** EcoQuest MVP Project Proposal, Ecobank InnovateX 2026

## 1. Backend Goal

The backend is the authoritative system behind EcoQuest. It must receive legitimate banking/financial events, validate them, evaluate mission eligibility, update mission progress, award points through an auditable ledger, update progression/streaks, and expose the resulting state to the frontend.

The core rule is:

> **The frontend never directly awards or modifies points.**

The backend validates the underlying event and makes every reward decision server-side.

The MVP uses simulated banking events rather than real Ecobank infrastructure. The simulator sends events to the FastAPI backend as if they came from a banking event stream.

---

# 2. Eight-Day Backend Scope

| Day | Backend Focus | Main Deliverable |
|---|---|---|
| 1 | Backend foundation | FastAPI project, configuration, PostgreSQL connection, project structure |
| 2 | Database models | Users, financial goals, missions, user missions, events, ledger, rewards, achievements |
| 3 | Authentication & users | Registration, login, JWT auth, current-user endpoint |
| 4 | Goals & mission system | Financial goals, mission definitions, mission eligibility/start/progress |
| 5 | Event ingestion & validation | Banking-event API, validation, idempotency, mission matching |
| 6 | Points, levels & streaks | Points ledger, balance calculation, levels, achievements, streaks |
| 7 | Rewards & redemption | Reward catalogue, server-side redemption, wallet/history |
| 8 | Anti-abuse & end-to-end integration | Duplicate protection, caps, suspicious-event rules, complete backend flow |

---

# 3. Recommended Backend Architecture

```text
ecoquest/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── financial_goal.py
│   │   │   ├── mission.py
│   │   │   ├── user_mission.py
│   │   │   ├── event.py
│   │   │   ├── points_ledger.py
│   │   │   ├── reward.py
│   │   │   ├── redemption.py
│   │   │   ├── achievement.py
│   │   │   └── user_achievement.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── goal.py
│   │   │   ├── mission.py
│   │   │   ├── event.py
│   │   │   ├── reward.py
│   │   │   └── dashboard.py
│   │   │
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── goals.py
│   │   │   ├── missions.py
│   │   │   ├── events.py
│   │   │   ├── rewards.py
│   │   │   └── admin.py
│   │   │
│   │   ├── services/
│   │   │   ├── mission_service.py
│   │   │   ├── event_service.py
│   │   │   ├── points_service.py
│   │   │   ├── streak_service.py
│   │   │   ├── reward_service.py
│   │   │   └── abuse_service.py
│   │   │
│   │   ├── seed/
│   │   │   ├── missions.py
│   │   │   ├── rewards.py
│   │   │   └── achievements.py
│   │   │
│   │   └── tests/
│   │       ├── test_auth.py
│   │       ├── test_goals.py
│   │       ├── test_missions.py
│   │       ├── test_events.py
│   │       ├── test_points.py
│   │       ├── test_rewards.py
│   │       └── test_abuse.py
│   │
│   ├── requirements.txt
│   ├── .env
│   └── README.md
│
└── README.md
```

---

# 4. Technology Stack

## Required

- Python 3.11+
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic
- `python-jose` or equivalent JWT library
- `passlib`/bcrypt or an equivalent password hashing implementation
- pytest

## Optional

- Redis
- Docker
- Docker Compose

Redis is explicitly optional for the MVP. PostgreSQL is sufficient for the first working version.

---

# 5. Core Data Model

The proposal defines the following core tables:

- `users`
- `financial_goals`
- `missions`
- `user_missions`
- `events`
- `points_ledger`
- `rewards`
- `redemptions`
- `achievements`
- `user_achievements`

The backend should also maintain enough information to calculate streaks and abuse signals.

---

# DAY 1 — Backend Foundation

## Objectives

1. Create the FastAPI application.
2. Establish PostgreSQL connectivity.
3. Add environment configuration.
4. Create the backend folder structure.
5. Add health checking.
6. Establish database session management.
7. Prepare Alembic migrations.

## Tasks

### 1. Create the project

```bash
mkdir ecoquest
cd ecoquest

mkdir backend
cd backend

python -m venv venv
```

Activate the environment.

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic pydantic-settings python-jose passlib[bcrypt] pytest httpx
```

Save:

```bash
pip freeze > requirements.txt
```

### 2. Create the FastAPI entry point

`app/main.py`

Responsibilities:

- Create FastAPI instance.
- Register routers.
- Expose `/health`.
- Configure API metadata.

Expected endpoint:

```http
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "service": "ecoquest-backend"
}
```

### 3. Configuration

Use `.env` rather than hardcoding credentials.

Example variables:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecoquest
SECRET_KEY=change-this-in-development
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Never commit `.env`.

Create `.env.example` instead.

### 4. Database connection

Create:

```text
app/core/database.py
```

Responsibilities:

- SQLAlchemy engine.
- Session factory.
- Base model.
- Database dependency.

Every API route that accesses PostgreSQL should receive a database session through FastAPI dependency injection.

### 5. Alembic

Initialize:

```bash
alembic init alembic
```

Configure Alembic to use the PostgreSQL database.

## Day 1 acceptance criteria

- FastAPI starts successfully.
- `/health` works.
- PostgreSQL connection works.
- Alembic is initialized.
- `.env` configuration works.
- No database credentials are hardcoded.
- Project structure exists.

---

# DAY 2 — Database Models

## Objectives

Implement the persistent data model.

## 2.1 Users

Fields:

```text
id
name
email
password_hash
level
created_at
updated_at
```

The proposal lists:

```text
users: id, name, email, level, points_balance, created_at
```

For implementation, `points_balance` should not be treated as an independently trusted source of truth because the proposal requires an auditable points ledger.

If a cached balance is stored, it must be derived from validated ledger operations.

## 2.2 Financial Goals

Fields:

```text
id
user_id
name
target_amount
current_amount
deadline
status
created_at
updated_at
```

Example:

```text
Goal: Emergency Fund
Target: ₦100,000
Current: ₦25,000
Status: active
```

## 2.3 Missions

Fields:

```text
id
name
description
category
criteria
reward_points
start_date
end_date
max_completions
created_at
```

`criteria` can initially be JSON.

Example:

```json
{
  "event_type": "savings_deposit",
  "minimum_amount": 5000
}
```

Mission categories:

- saving
- financial_education
- responsible_banking
- digital_adoption
- merchant
- social

Social missions should remain secondary because the proposal calls for stronger fraud controls.

## 2.4 User Missions

Fields:

```text
id
user_id
mission_id
progress
status
started_at
completed_at
completion_count
```

Possible statuses:

```text
available
active
completed
expired
blocked
```

## 2.5 Events

Fields:

```text
id
event_id
user_id
event_type
event_reference
amount
currency
timestamp
status
metadata
created_at
```

`event_id` must be unique.

Example:

```json
{
  "event_id": "evt_001",
  "user_id": "usr_001",
  "event_type": "savings_deposit",
  "amount": 5000,
  "currency": "NGN",
  "timestamp": "2026-08-27T12:30:00Z"
}
```

## 2.6 Points Ledger

Fields:

```text
id
user_id
event_id
points
reason
created_at
```

A ledger row represents one points change.

Positive:

```text
+250
```

Redemption:

```text
-500
```

Current balance:

```text
SUM(valid ledger entries)
```

## 2.7 Rewards

Fields:

```text
id
name
description
points_required
stock
partner
status
created_at
```

Example rewards:

```text
500   → ₦500 airtime
1000  → ₦1,000 partner voucher
2000  → Merchant discount
5000  → Premium partner reward
10000 → Higher-value reward
```

These rewards are simulated in the MVP.

## 2.8 Redemptions

Fields:

```text
id
user_id
reward_id
points_spent
status
created_at
```

Statuses:

```text
pending
completed
failed
cancelled
```

## 2.9 Achievements

Fields:

```text
id
name
description
criteria
```

## 2.10 User Achievements

Fields:

```text
id
user_id
achievement_id
unlocked_at
```

## Day 2 migrations

Create the initial migration:

```bash
alembic revision --autogenerate -m "create core ecoquest tables"
```

Apply:

```bash
alembic upgrade head
```

## Day 2 acceptance criteria

- All core tables exist.
- Foreign keys work.
- User email is unique.
- Event ID is unique.
- Points ledger supports positive and negative entries.
- Mission criteria can be represented as JSON.
- Migration can recreate the database schema.

---

# DAY 3 — Authentication & User API

## Objectives

Implement:

- registration
- login
- JWT authentication
- current-user endpoint
- protected routes

## Endpoints

### Register

```http
POST /auth/register
```

Request:

```json
{
  "name": "David",
  "email": "david@example.com",
  "password": "securepassword"
}
```

Response:

```json
{
  "id": "usr_001",
  "name": "David",
  "email": "david@example.com"
}
```

### Login

```http
POST /auth/login
```

Return an access token.

### Current user

```http
GET /users/me
```

Requires:

```http
Authorization: Bearer <token>
```

### Dashboard

```http
GET /users/me/dashboard
```

Return:

```json
{
  "user": {},
  "level": {},
  "points": 2450,
  "streak": 12,
  "goals": [],
  "missions": [],
  "achievements": []
}
```

## Password handling

Never store plaintext passwords.

Use a secure password hash.

## JWT

JWT payload should contain the user identifier.

Example conceptual payload:

```json
{
  "sub": "usr_001",
  "exp": 1780000000
}
```

## Authentication dependency

Create a reusable dependency:

```text
get_current_user()
```

It should:

1. Read Authorization header.
2. Validate JWT.
3. Extract user ID.
4. Load user.
5. Reject invalid/expired tokens.

## Day 3 acceptance criteria

- User can register.
- Duplicate email is rejected.
- Password is hashed.
- User can log in.
- Login returns JWT.
- Protected endpoints reject unauthenticated requests.
- `/users/me` returns authenticated user.
- `/users/me/dashboard` exists.

---

# DAY 4 — Financial Goals & Mission Engine

## Objectives

Implement the first real business logic.

The mission system must be backend-driven rather than hardcoded in the frontend.

A mission contains:

- start condition
- eligibility condition
- completion condition
- reward
- validity period
- maximum completions
- abuse policy

## Goal endpoints

### Create goal

```http
POST /goals
```

Example:

```json
{
  "name": "Emergency Fund",
  "target_amount": 100000,
  "current_amount": 25000,
  "deadline": "2026-12-31"
}
```

### List goals

```http
GET /goals
```

### Get goal

```http
GET /goals/{goal_id}
```

### Update goal

```http
PATCH /goals/{goal_id}
```

## Mission endpoints

```http
GET /missions
POST /missions/{id}/start
GET /missions/{id}
```

## Seed initial missions

At minimum create:

### Mission 1 — Save Starter

```text
Category: saving
Objective: Deposit ₦5,000 into a designated savings goal
Reward: 250 points
Frequency: weekly
Eligibility: active savings goal
Completion: verified savings deposit
Expiration: 7 days
```

### Mission 2 — Financial Quiz

```text
Category: financial_education
Objective: Pass a financial quiz
Reward: 75 points
```

### Mission 3 — Savings Streak

```text
Category: saving
Objective: Maintain weekly contribution
Reward: 100 points
```

### Mission 4 — Financial Health Check

```text
Category: responsible_banking
Objective: Complete monthly financial health check
Reward: 150 points
```

### Mission 5 — Eligible Merchant

```text
Category: merchant
Objective: Complete qualifying merchant activity
Reward: 100 points
```

## Deterministic personalisation

Do not build ML for the MVP.

Use rules such as:

```text
IF savings_frequency is low
THEN recommend "Build Your Buffer"

IF savings_frequency is high
THEN recommend "Savings Streak"

IF digital_activity is low
THEN recommend "Go Digital"

IF education_activity is high
THEN recommend "Money Mastery"
```

## Mission service

Create:

```text
mission_service.py
```

Core functions:

```text
get_eligible_missions(user)
start_mission(user, mission)
evaluate_event_against_mission(event, mission)
update_mission_progress(user_mission, event)
complete_mission(user_mission)
```

## Day 4 acceptance criteria

- User can create a financial goal.
- Missions can be seeded into the database.
- User can retrieve eligible missions.
- User can start a mission.
- Mission criteria are stored in backend data.
- Mission progress is stored server-side.
- No frontend-controlled reward values exist.

---

# DAY 5 — Event Ingestion & Validation

## Objectives

Build the most important integration point:

```http
POST /events
```

The endpoint receives simulated banking events.

## Supported event types

Initial simulator should support:

```text
savings_deposit
goal_contribution
bill_payment
airtime_purchase
merchant_payment
financial_lesson_completed
financial_quiz_completed
referral
```

## Example event

```json
{
  "event_id": "evt_001",
  "user_id": "usr_001",
  "event_type": "savings_deposit",
  "amount": 5000,
  "currency": "NGN",
  "timestamp": "2026-08-27T12:30:00Z"
}
```

## Event-processing pipeline

Implement this exact conceptual flow:

```text
Banking Event
    ↓
Event Validator
    ↓
Eligibility Engine
    ↓
Mission Engine
    ↓
Reward Calculator
    ↓
Points Ledger
    ↓
Achievement / Level Update
    ↓
Notification
    ↓
Reward Wallet
```

For Days 5–8, notification can simply be represented by a response/event record. A full notification service is not required.

## Validation rules

Before awarding points check:

1. Event is structurally valid.
2. Event belongs to a valid user.
3. Transaction is successful.
4. Transaction is not reversed.
5. Event has not already been rewarded.
6. Event is inside mission period.
7. Amount meets mission minimum.
8. User is eligible.
9. Mission completion limit has not been exceeded.
10. Abuse rules do not block the reward.

## Idempotency

`event_id` must be unique.

If:

```text
evt_001
```

has already been processed, submitting it again must not award another reward.

Expected behaviour:

```text
First submission → processed → points awarded
Second submission → duplicate → no additional points
```

## Event statuses

Use:

```text
received
validated
processed
rejected
flagged
reversed
```

## Event service

Create:

```text
event_service.py
```

Core flow:

```text
receive_event()
→ validate_event()
→ detect_duplicate()
→ detect_abuse()
→ find_matching_missions()
→ update_progress()
→ award_points()
→ update_progression()
```

## Goal contribution

For a valid `goal_contribution` or savings event:

```text
goal.current_amount += event.amount
```

Never trust a client-submitted `current_amount` as the final value.

## Day 5 acceptance criteria

- `/events` accepts simulated events.
- Events are persisted.
- Invalid events are rejected.
- Duplicate events cannot produce duplicate rewards.
- Matching missions are identified.
- Mission progress changes after valid events.
- Goal progress can update from valid contribution events.

---

# DAY 6 — Points, Levels, Achievements & Streaks

## Objectives

Implement progression.

## Points ledger

Create:

```text
points_service.py
```

Core operation:

```text
add_ledger_entry(
    user_id,
    points,
    reason,
    event_id
)
```

Every reward must create a ledger entry.

Examples:

```text
Savings Mission       +250
Financial Quiz         +75
Streak Bonus          +100
Reward Redemption    -500
```

## Never implement

```python
user.points += 250
```

as the authoritative reward mechanism.

The ledger is the audit trail.

## Balance calculation

Conceptually:

```sql
SELECT COALESCE(SUM(points), 0)
FROM points_ledger
WHERE user_id = :user_id;
```

If a cached `points_balance` exists, it must remain consistent with the ledger.

## Levels

Use the proposal's initial levels:

| Level | Name | Points |
|---|---|---:|
| 1 | Starter | 0–499 |
| 2 | Builder | 500–1,499 |
| 3 | Achiever | 1,500–3,499 |
| 4 | Champion | 3,500–6,999 |
| 5 | Master | 7,000+ |

Create:

```text
calculate_level(points)
```

Whenever points change:

```text
new balance
→ calculate level
→ update user progression
→ check achievements
```

## Achievements

Initial achievements can include:

```text
First Mission
First Savings Goal
Savings Consistency
Financial Learner
7-Day Streak
Reward Redeemer
```

Achievement criteria should be stored as backend data.

## Streaks

Create:

```text
streak_service.py
```

Track:

```text
current_streak
longest_streak
last_activity_date
```

The proposal describes a 7-day wellness streak and a weekly streak bonus of +300 points.

The MVP should also implement streak protection so missing one day does not automatically destroy weeks of progress.

A simple MVP implementation:

```text
streak shield available → consume shield → preserve streak
no shield → normal streak rule
```

Do not allow the frontend to manipulate streak values.

## Day 6 acceptance criteria

- Valid mission completion creates ledger entries.
- Points balance can be calculated from ledger.
- Levels update automatically.
- Achievements unlock automatically.
- Streaks update from qualifying activity.
- Streak protection exists.
- Redemption can later create negative ledger entries.

---

# DAY 7 — Rewards & Redemption

## Objectives

Implement the earn → accumulate → redeem part of the loyalty loop.

## Reward endpoints

### List rewards

```http
GET /rewards
```

### Get reward

```http
GET /rewards/{reward_id}
```

### Redeem reward

```http
POST /rewards/{reward_id}/redeem
```

### Redemption history

```http
GET /rewards/redemptions
```

## Reward validation

Before redemption:

1. User exists.
2. Reward exists.
3. Reward is active.
4. Reward is in stock.
5. User has enough points.
6. Redemption is allowed.
7. Request cannot be processed twice.
8. Points deduction and redemption creation happen atomically.

## Example

User balance:

```text
1,050 points
```

Reward:

```text
₦1,000 airtime
Cost: 1,000 points
```

After redemption:

```text
Balance: 50
```

Level and achievements remain unchanged.

## Atomic transaction

The following should happen in one database transaction:

```text
validate reward
→ verify balance
→ reserve/decrement stock
→ create negative ledger entry
→ create redemption
→ commit
```

If anything fails:

```text
ROLLBACK
```

This prevents partial redemption.

## Prevent negative balance

Never allow:

```text
balance < points_required
```

## Reward stock

If:

```text
stock = 0
```

the reward cannot be redeemed.

## Day 7 acceptance criteria

- Rewards can be listed.
- Rewards have point costs.
- Users cannot redeem without enough points.
- Redemption creates a negative ledger entry.
- Redemption history is stored.
- Reward stock is respected.
- Failed redemption does not consume points.
- Successful redemption is atomic.

---

# DAY 8 — Anti-Abuse + End-to-End Backend Integration

## Objectives

This day turns the separate backend components into the actual EcoQuest engine.

The proposal specifically identifies reward abuse as a major requirement.

## 8.1 Duplicate protection

Every reward event needs a unique event ID.

Rule:

```text
event_id already processed
        ↓
DO NOT award points
```

Database requirement:

```text
UNIQUE(events.event_id)
```

Also protect ledger entries against accidental duplicate processing.

## 8.2 Reward caps

Example:

```text
Maximum savings-mission rewards per week:
500 points
```

If a user reaches the weekly cap:

```text
mission may still be recorded
BUT
additional reward = 0
```

The exact business behaviour should be defined consistently in the mission rule.

## 8.3 Reversal protection

If an underlying banking event is reversed:

```text
original reward → must not remain unjustifiably valid
```

For the MVP, implement an event status and reversal pathway.

A reversal should be traceable and should never silently delete ledger history.

If points need to be removed, create a compensating ledger entry rather than deleting the original ledger record.

Example:

```text
Original reward       +250
Reversal adjustment   -250
Net effect               0
```

## 8.4 Suspicious behaviour score

Use deterministic rules instead of machine learning.

Example:

```text
10 transfers
same amount
same beneficiary
within 2 minutes
```

Result:

```text
Suspicion score ↑
Reward withheld
Event flagged
```

Possible scoring rules:

```text
+20 repeated same amount
+20 repeated same beneficiary
+30 high-frequency activity
+30 repeated non-qualifying transactions
```

Example threshold:

```text
0–39   normal
40–69  suspicious
70+    high risk
```

The exact thresholds are prototype assumptions and should be tuned during testing.

## 8.5 Harmful-behaviour protection

Do not reward:

- unnecessary spending
- excessive transfers
- borrowing merely to farm points
- risky investment activity
- repeated transactions designed only to generate rewards

Prefer:

- saving
- financial education
- consistent planning
- responsible bill management
- meaningful digital adoption
- legitimate merchant engagement

## 8.6 Abuse service

Create:

```text
abuse_service.py
```

Functions:

```text
calculate_risk_score(event)
is_suspicious(event)
should_withhold_reward(event)
record_suspicious_event(event)
```

## 8.7 Admin fraud endpoint

Implement:

```http
GET /admin/fraud-events
```

Return:

```json
[
  {
    "event_id": "evt_100",
    "user_id": "usr_004",
    "risk_score": 80,
    "status": "flagged",
    "reason": "repetitive activity"
  }
]
```

## 8.8 End-to-end test

The complete flow must work:

```text
Register
 ↓
Login
 ↓
Create financial goal
 ↓
Receive personalised mission
 ↓
Start mission
 ↓
Submit simulated savings event
 ↓
Validate event
 ↓
Match mission
 ↓
Complete mission
 ↓
Award points
 ↓
Update ledger
 ↓
Update level
 ↓
Update streak
 ↓
Unlock achievement
 ↓
Reach reward threshold
 ↓
Redeem reward
 ↓
Create negative ledger entry
```

## Abuse demo

Then run:

```text
User submits repeated ₦100 transfers
 ↓
Event received
 ↓
Validation passes as a transaction
 ↓
Mission qualification fails / abuse rule triggers
 ↓
0 points
 ↓
Event flagged
 ↓
Admin can see suspicious activity
```

This is an important judge-facing backend demonstration.

---

# 6. API Contract After Day 8

## Authentication

```text
POST /auth/register
POST /auth/login
```

## Users

```text
GET /users/me
GET /users/me/dashboard
```

## Goals

```text
POST /goals
GET /goals
GET /goals/{id}
PATCH /goals/{id}
```

## Missions

```text
GET /missions
POST /missions/{id}/start
GET /missions/{id}
```

## Events

```text
POST /events
GET /events/{id}
```

## Rewards

```text
GET /rewards
GET /rewards/{id}
POST /rewards/{id}/redeem
GET /rewards/redemptions
```

## Leaderboard

```text
GET /leaderboard
```

## Admin

```text
GET /admin/analytics
GET /admin/fraud-events
```

---

# 7. Event Processing Pseudocode

```python
def process_event(event, db):

    validate_event_structure(event)

    user = get_user(db, event.user_id)

    if not user:
        reject("user_not_found")

    if event_already_processed(db, event.event_id):
        return {
            "status": "duplicate",
            "points_awarded": 0
        }

    save_event(db, event, status="received")

    if not transaction_is_valid(event):
        mark_rejected(event)
        return {
            "status": "rejected",
            "points_awarded": 0
        }

    risk_score = calculate_risk_score(event)

    if risk_score >= ABUSE_THRESHOLD:
        mark_flagged(event)

        return {
            "status": "flagged",
            "points_awarded": 0,
            "risk_score": risk_score
        }

    missions = find_matching_missions(user, event)

    total_points = 0

    for mission in missions:

        if not user_is_eligible(user, mission):
            continue

        if mission_limit_reached(user, mission):
            continue

        progress = update_mission_progress(
            user,
            mission,
            event
        )

        if mission_completed(progress):

            points = calculate_reward(
                user,
                mission,
                event
            )

            if reward_cap_reached(user, mission):
                points = 0

            if points > 0:
                add_ledger_entry(
                    user_id=user.id,
                    event_id=event.event_id,
                    points=points,
                    reason=mission.name
                )

                total_points += points

            mark_mission_completed(
                user,
                mission
            )

    update_goal_if_required(user, event)

    update_streak(user, event)

    update_level(user)

    check_achievements(user)

    mark_event_processed(event)

    return {
        "status": "processed",
        "points_awarded": total_points
    }
```

---

# 8. Database Transaction Rules

Critical reward operations should be atomic.

## Event reward transaction

```text
BEGIN
  validate event
  create/update event
  update mission progress
  create ledger entry
  update progression
  update achievement
COMMIT
```

If something fails:

```text
ROLLBACK
```

## Redemption transaction

```text
BEGIN
  verify reward
  verify stock
  verify balance
  create negative ledger entry
  create redemption
  reduce stock
COMMIT
```

Never allow the application to successfully report a redemption when the corresponding ledger operation failed.

---

# 9. Seed Data

The backend should have seed scripts so the demo can be rebuilt quickly.

## Seed users

Create synthetic users such as:

```text
David
Ada
Tunde
Maya
```

Do not use real customer data.

## Seed missions

At minimum:

```text
Save Starter
Financial Quiz
Savings Streak
Financial Health Check
Go Digital
Eligible Merchant Mission
```

## Seed rewards

```text
₦500 Airtime
₦1,000 Partner Voucher
Merchant Discount
Premium Partner Reward
Higher-Value Reward
```

## Seed achievements

```text
First Mission
First Savings Goal
Financial Learner
Savings Consistency
7-Day Streak
Reward Redeemer
```

---

# 10. Testing Requirements

By the end of Day 8, write automated tests for the critical business rules.

## Authentication

```text
test_register_user
test_duplicate_email
test_login
test_invalid_password
test_protected_route
```

## Goals

```text
test_create_goal
test_list_goals
test_goal_contribution
test_cannot_modify_another_users_goal
```

## Missions

```text
test_mission_eligibility
test_start_mission
test_valid_event_updates_progress
test_mission_completion
test_expired_mission
test_max_completion_limit
```

## Events

```text
test_valid_event
test_invalid_event
test_duplicate_event
test_reversed_event
test_unknown_user
```

## Points

```text
test_points_ledger
test_points_balance
test_level_progression
test_achievement_unlock
```

## Streaks

```text
test_first_activity
test_consecutive_activity
test_broken_streak
test_streak_shield
```

## Rewards

```text
test_reward_listing
test_successful_redemption
test_insufficient_points
test_out_of_stock_reward
test_redemption_creates_negative_ledger
test_failed_redemption_rolls_back
```

## Anti-abuse

```text
test_repeated_transaction_detection
test_risk_score
test_reward_withheld
test_suspicious_event_flag
test_weekly_reward_cap
```

---

# 11. Critical Security Rules

## Rule 1 — No client-controlled points

Never create:

```http
POST /users/{id}/add-points
```

The proposal explicitly requires server-side reward decisions.

## Rule 2 — Never trust user IDs from sensitive operations

For authenticated operations, derive the user from the JWT rather than trusting:

```json
{
  "user_id": "someone_else"
}
```

## Rule 3 — Validate ownership

A user must not be able to:

- modify another user's goal
- start another user's mission
- redeem using another user's account
- view another user's private events

## Rule 4 — Keep ledger history

Do not delete reward history to correct mistakes.

Use compensating ledger entries.

## Rule 5 — Idempotency

Duplicate event submissions must never generate duplicate points.

## Rule 6 — Atomicity

Reward and redemption operations must be transactional.

## Rule 7 — Synthetic data

The MVP must not use real customer financial or personal information.

---

# 12. Backend Definition of Done

At the end of Day 8, the backend is considered complete for this phase when:

- [ ] FastAPI runs.
- [ ] PostgreSQL works.
- [ ] Database migrations work.
- [ ] Users can register.
- [ ] Users can authenticate.
- [ ] JWT-protected endpoints work.
- [ ] Users can create financial goals.
- [ ] Missions are stored as backend objects.
- [ ] Missions can be personalised using deterministic rules.
- [ ] Users can start missions.
- [ ] Banking events can be submitted.
- [ ] Events are validated.
- [ ] Duplicate events are rejected/idempotent.
- [ ] Valid events update mission progress.
- [ ] Completed missions award points.
- [ ] Points are recorded in a ledger.
- [ ] Levels update automatically.
- [ ] Achievements unlock automatically.
- [ ] Streaks update.
- [ ] Streak protection exists.
- [ ] Rewards can be listed.
- [ ] Rewards can be redeemed.
- [ ] Redemption creates a negative ledger entry.
- [ ] Reward stock is respected.
- [ ] Reward caps exist.
- [ ] Suspicious events can be detected.
- [ ] Suspicious events can be viewed by admin.
- [ ] Reversals are represented safely.
- [ ] Critical business rules have automated tests.
- [ ] The complete demo journey works without manual database manipulation.

---

# 13. Recommended Implementation Order Within Each Day

Use this loop:

```text
1. Write model/schema
2. Write service logic
3. Write API route
4. Write test
5. Run migration
6. Test through Swagger
7. Commit to Git
```

FastAPI's automatic documentation should be used continuously:

```text
/docs
```

Do not wait until Day 8 before testing the API.

---

# 14. Git Commit Strategy

Use small, meaningful commits.

Example:

```text
day-01: initialize FastAPI backend
day-01: configure PostgreSQL
day-02: add core database models
day-02: add initial migration
day-03: implement JWT authentication
day-03: add user dashboard endpoint
day-04: implement financial goals
day-04: implement mission engine
day-05: implement event ingestion
day-05: add event idempotency
day-06: implement points ledger
day-06: implement levels and achievements
day-06: implement streaks
day-07: implement rewards
day-07: implement redemption transactions
day-08: implement anti-abuse rules
day-08: add end-to-end tests
```

---

# 15. What Should NOT Be Built During These 8 Days

Do not allow scope creep.

Explicitly defer:

- Real Ecobank production integration
- Real-money movement
- Real customer data
- Full banking application
- Native Android/iOS apps
- Enterprise identity management
- Complex ML recommendation models
- Blockchain points
- NFTs
- Cryptocurrency
- Sophisticated social networking
- Real merchant settlement
- Production reward fulfilment
- Nationwide deployment

The proposal deliberately keeps these outside the MVP.

---

# 16. Day 8 Backend Demo Script

The backend should support this exact demonstration:

### Step 1

Register/login as David.

### Step 2

Create:

```text
Emergency Fund
Target: ₦100,000
Current: ₦25,000
```

### Step 3

Backend recommends:

```text
Save ₦5,000 this week
```

### Step 4

Submit:

```json
{
  "event_id": "evt_demo_001",
  "user_id": "david",
  "event_type": "savings_deposit",
  "amount": 5000,
  "currency": "NGN"
}
```

### Step 5

Backend:

```text
validates event
→ identifies mission
→ completes mission
→ awards 250 points
→ updates ledger
→ updates streak
→ recalculates level
```

### Step 6

Submit the same event again.

Expected:

```text
Duplicate event
0 additional points
```

### Step 7

Simulate suspicious activity.

```text
5–10 repeated ₦100 transfers
same beneficiary
very short intervals
```

Expected:

```text
Reward withheld
Event flagged
Risk score increased
```

### Step 8

Accumulate enough points.

Redeem:

```text
₦1,000 airtime
```

Expected:

```text
-1000 ledger entry
redemption recorded
reward stock reduced
```

---

# 17. Backend Architecture Summary

```text
                    ┌─────────────────────┐
                    │   Next.js Frontend  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │                     │
                    │ Auth                │
                    │ Goals               │
                    │ Missions            │
                    │ Events              │
                    │ Rewards             │
                    │ Analytics            │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
       ┌─────────────────┐        ┌──────────────────┐
       │ Business Logic  │        │ Anti-Abuse Engine│
       │                 │        │                  │
       │ Mission Engine  │        │ Duplicate check  │
       │ Points Engine   │        │ Reward caps      │
       │ Streak Engine   │        │ Risk scoring     │
       │ Reward Engine   │        │ Event flags      │
       └────────┬────────┘        └────────┬─────────┘
                │                          │
                └────────────┬─────────────┘
                             ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │                     │
                    │ Users               │
                    │ Goals               │
                    │ Missions            │
                    │ Events              │
                    │ Points Ledger       │
                    │ Rewards             │
                    │ Redemptions         │
                    │ Achievements        │
                    └─────────────────────┘
```

---

# 18. Final Backend Principle

EcoQuest is not fundamentally a points database.

The backend should enforce this loop:

```text
REAL / SIMULATED FINANCIAL BEHAVIOUR
              ↓
        EVENT VALIDATION
              ↓
        ELIGIBILITY CHECK
              ↓
        MISSION EVALUATION
              ↓
        REWARD CALCULATION
              ↓
        AUDITABLE LEDGER
              ↓
       PROGRESSION / STREAK
              ↓
          REWARD STORE
              ↓
          REDEMPTION
```

The most important engineering decision is to keep **reward authority on the server**.

The frontend asks the backend to perform actions. The backend decides whether those actions qualify, how many points they earn, whether they are suspicious, and whether rewards can be redeemed.

That is what turns EcoQuest from a frontend gamification interface into a credible **financial loyalty and behaviour engine**.
