# Smartledger Premium Web3

Smartledger Premium Web3 is a full-stack digital-asset dashboard with a public user application, authenticated user accounts, an administrator dashboard, PostgreSQL persistence, investment plans, withdrawals, and protected SMTP notifications.

## Local development

Install dependencies with npm:

```bash
npm install
```

Run the user application, administrator application, and API in separate terminals:

```bash
npm run dev --workspace @workspace/user-app
npm run dev --workspace @workspace/admin
npm run dev --workspace @workspace/api-server
```

The user app runs at `/`, the administrator app at `/admin/`, and the API routes are under `/api`.

## Production deployment on Vercel

This repository is configured as one Vercel project:

- `/` serves the user application.
- `/admin` and `/admin/*` serve the administrator application.
- `/api/*` is handled by the Express application exported from the root `index.ts`.
- `/api/cron/accrual` runs the hourly investment accrual sweep.

Create a Vercel project using the repository root as its project directory. Vercel will use the committed `vercel.json` configuration and run:

```bash
npm install
npm run build:vercel
```

Before the first production request, apply the database schema to the production PostgreSQL database:

```bash
DATABASE_URL="..." npm run db:push
```

Do not commit the connection string or any other secret.

## Required production environment variables

Set these in the Vercel project settings for the Production environment:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Drizzle. |
| `JWT_SECRET` | Secret used to sign user and administrator JWTs. `SESSION_SECRET` is accepted as a compatibility fallback. |
| `ADMIN_PASSWORD` | Administrator password. |
| `ADMIN_EMAIL` | Optional sender/admin email override; the default is the configured Smartledger administrator address. |
| `SMTP_PASS` | Gmail app password or SMTP password. |
| `SMTP_HOST` | SMTP host, normally `smtp.gmail.com`. |
| `SMTP_PORT` | SMTP port, normally `587`. |
| `SMTP_USER` | SMTP account username. |
| `CRON_SECRET` | Secret used to authenticate the scheduled investment accrual function. |
| `CORS_ORIGINS` | Optional comma-separated list of allowed browser origins when using additional domains. |
| `LOG_LEVEL` | Optional pino log level, such as `info` or `debug`. |

The SMTP settings saved in the administrator dashboard remain available as a database fallback, but server environment variables take precedence.

## Verification

Run the complete local checks before deploying:

```bash
npm run typecheck
npm run build
npm run build:vercel
```

The Vercel build places the user static files in `dist/` and the administrator static files in `dist/admin/`. Vercel serves those static files and runs the root Express application as a serverless function.