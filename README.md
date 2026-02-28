# Arena

Arena is a production-ready full-stack SaaS web app for dealership leaderboard podium tracking.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- REST API routes
- JWT authentication
- Role-based access control
- Modular service architecture

## Key Features

- Role-based dashboards for `sales_rep`, `service_rep`, and `manager`
- CRM adapter pattern (`EleadAdapter`, `FortellisAdapter`, `XtimeAdapter`, `DripJobsAdapter`)
- Webhook ingestion with source secret validation
- Idempotent ingestion via unique external record IDs
- Monthly leaderboard aggregation with dynamic sorting
- Podium separation (top 3) and remaining list
- Manager CSV export endpoint

## Project Structure

- `src/app`: App Router pages and REST API routes
- `src/components`: UI components (auth, dashboard, layout)
- `src/lib`: shared utilities (db, auth, env, adapters)
- `src/services`: business logic layer
- `src/types`: API/domain types
- `prisma/schema.prisma`: database schema

## Environment Variables

Copy `.env.example` to `.env` and set real values:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `COOKIE_DOMAIN` (optional)
- `ELEAD_WEBHOOK_SECRET`
- `FORTELLIS_WEBHOOK_SECRET`
- `XTIME_WEBHOOK_SECRET`
- `DRIPJOBS_WEBHOOK_SECRET`

## Local Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## API Routes

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Onboarding

- `POST /api/onboarding`

### Leaderboard

- `GET /api/leaderboard?metric=<...>&department=<sales|service|all>`
- `GET /api/leaderboard/export?metric=<...>&department=<sales|service|all>` (manager only)

### Webhooks

- `POST /api/webhooks/elead`
- `POST /api/webhooks/fortellis`
- `POST /api/webhooks/xtime`
- `POST /api/webhooks/dripjobs`

Each webhook requires header:

- `x-webhook-secret: <source secret>`

## CRM Adapter Pattern

All vendor-specific payload logic is isolated in:

- `src/lib/adapters/crm/elead.adapter.ts`
- `src/lib/adapters/crm/fortellis.adapter.ts`
- `src/lib/adapters/crm/xtime.adapter.ts`
- `src/lib/adapters/crm/dripjobs.adapter.ts`

Business logic reads normalized records only via `src/lib/adapters/crm/index.ts`.

## Leaderboard Behavior

- Filters by current month/year
- Aggregates totals per user
- Computes `efficiency_rate = (hours_billed / hours_worked) * 100`
- Dynamically sorts by selected metric
- Returns `podium` (top 3) + `leaderboard` (remaining rows)
