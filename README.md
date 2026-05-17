# GoalVerse — Performance Management & Goal Tracking Portal

A full-stack, role-based goal tracking portal built with **Next.js 16 (App Router)**, **Prisma ORM**, **SQLite**, and **NextAuth.js**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Auth | NextAuth.js (Credentials) |
| Database | SQLite via Prisma ORM |
| Styling | Vanilla CSS Modules (dark mode) |
| Language | TypeScript |

---

## Features

- **Role-based Access** — Employee, Manager, Admin
- **Goal Creation** — Thrust Area, UoM, Target, Weightage with 100% validation
- **Manager Approval Workflow** — Approve / Return goal sheets
- **Quarterly Check-ins** — Employees log actuals per quarter; managers add feedback
- **Shared Goals** — Admin pushes a goal to all draft sheets
- **CSV Export** — Admin exports achievement data

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Push the database schema
npx prisma db push

# 4. Seed demo users
node prisma/seed.js

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Employee | `employee@goalverse.com` | `password123` |
| Manager | `manager@goalverse.com` | `password123` |
| Admin | `admin@goalverse.com` | `password123` |
