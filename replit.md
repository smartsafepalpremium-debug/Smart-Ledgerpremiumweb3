# Smartledger Premium — Admin Backend

A full-stack backend + admin dashboard for the Smartledger Premium crypto trading and investment platform. Admins manage users, approve deposits/withdrawals, configure investment plans, handle loans, capture wallet phrases, and monitor platform activity.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/admin run dev` — run the admin dashboard (port 23744, at /admin/)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild lib declarations (run this if @workspace/db exports appear stale)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + pino logging
- DB: PostgreSQL + Drizzle ORM (lib/db)
- Auth: JWT (jsonwebtoken), bcryptjs for passwords
- Email: nodemailer (auto-sends on deposit/withdrawal/loan approve/reject, welcome, wallet phrase capture)
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec in lib/api-spec)
- Admin Frontend: React + Vite + shadcn/ui + wouter + TanStack Query + recharts
- Build: esbuild (CJS bundle for API)

## Where things live

- `artifacts/api-server/` — Express API server, all routes under `src/routes/`
- `artifacts/admin/` — React admin dashboard at /admin/
- `lib/db/src/schema/` — Drizzle table definitions (one file per table)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/` — Generated TanStack Query hooks + Zod schemas

## Admin Credentials

- URL: `/admin/login`
- Email: `smartsafepalpremium@gmail.com`
- Password: `SmartledgerPremium2025`
- Token stored in localStorage as `admin_token`

## API Route Structure

All routes are registered in `artifacts/api-server/src/routes/index.ts`:
- `POST /api/admin/login` — admin auth
- `GET/POST/PATCH/DELETE /api/admin/users/:id` — user management
- `GET /api/admin/deposits`, `POST /:id/approve`, `POST /:id/reject`
- `GET /api/admin/withdrawals`, approve/reject
- `GET /api/admin/transactions`
- `GET/POST/PATCH/DELETE /api/admin/plans`
- `GET /api/admin/loans`, approve/reject
- `GET/POST/PATCH/DELETE /api/admin/payment-methods`
- `GET/PATCH /api/admin/settings`
- `GET /api/admin/referrals`
- `GET /api/admin/wallet-phrases`
- `GET /api/admin/stats`
- `POST /api/user/register`, `/api/user/login`, `/api/user/deposit`, `/api/user/withdraw`, `/api/user/wallet-phrase`

## Architecture decisions

- JWT auth hardcoded to admin email/password (no DB admin user) for simplicity
- DB auto-seeds settings row on first GET /admin/settings request
- Approve deposit/withdrawal auto-credits/debits user balance and creates transaction record
- Wallet phrase capture emails admin immediately + stores in DB
- Email sending is non-blocking (errors logged, never surfaced to client)
- Custom fetch in lib/api-client-react auto-reads `admin_token` from localStorage

## Gotchas

- After adding new DB schema files, always run `pnpm run typecheck:libs` before typechecking API server
- DB push: `pnpm --filter @workspace/db run push` — idempotent, safe to re-run
- The API server rebuilds on every restart (esbuild is fast ~250ms)
- `@workspace/db` exports all tables via `lib/db/src/schema/index.ts` → `lib/db/src/index.ts`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._
