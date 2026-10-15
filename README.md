# White-Label Trading Platform Template

A configurable Next.js brokerage-template application with public marketing pages, a customer portal, an admin desk, Prisma-backed data, local uploads, simulated trading, membership packages, wallet funding approval, staking, and optional market data.

> **Important:** This is software infrastructure—not a licensed brokerage, payment processor, trading venue, custodian, or KYC/AML service. Obtain legal, compliance, security, payments, market-data, and operational review before accepting real money, orders, or regulated customer data.

## Contents

- [Quick start](#quick-start)
- [What is included](#what-is-included)
- [Configuration](#configuration)
- [Currency and FX](#currency-and-fx)
- [Database options](#database-options)
- [Market data](#market-data)
- [Useful commands](#useful-commands)
- [Deployment checklist](#deployment-checklist)
- [Before launch](#before-launch)

## Quick start

### Requirements

- Node.js 20 or newer
- npm 10 or newer
- SQLite for local evaluation, or one hosted PostgreSQL provider for deployment
- Optional API accounts: CoinGecko for crypto and Twelve Data for forex, shares, indices, ETFs, and commodities

### Run locally

```bash
npm install
cp .env.example .env
npm run prisma:generate
npx prisma db push
npm run seed
npm run dev
```

On Windows PowerShell, replace the copy command with:

```powershell
Copy-Item .env.example .env
```

The supplied `.env.example` uses SQLite (`file:./dev.db`) and safe mock fallbacks when market-data keys are blank. This is the recommended local evaluation setup.

## What is included

- Public marketing, instrument, education, legal, FAQ, and contact pages
- Account registration, authentication, onboarding, profile, verification, and support areas
- Customer dashboard with simulated trading, positions, wallet activity, deposits, withdrawals, copy trading, staking, and memberships
- Admin desk for customer operations, payment instruction details, deposit approvals, and membership-package configuration
- Membership payments from a customer’s Live wallet; wallet deposits require administrator approval before the balance changes
- Display-currency selector with indicative FX conversion and a bundled fallback snapshot
- Config-driven branding, theme, content, and asset selection

## Configuration

### Brand and content

| Area | Location |
| --- | --- |
| Primary brand configuration | `config/brand.config.ts` |
| Brand schema | `config/brand.schema.ts` |
| Brand assets | `brands/<brand-name>/` |
| Generated theme variables | `lib/theme.ts` |

Create a starter brand:

```bash
npm run new-brand -- --name "Acme"
```

Run a selected brand:

```bash
BRAND=acme npm run dev
```

PowerShell:

```powershell
$env:BRAND="acme"; npm run dev
```

### Environment variables

Copy `.env.example` to `.env` for local use. In production, use your host’s encrypted environment-variable settings. Never commit `.env`, API keys, database passwords, or connection URLs.

Set `NEXT_PUBLIC_AUTO_TRANSLATE=false` to disable browser-based Google Website Translator.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma connection string. SQLite locally; PostgreSQL for Neon or Supabase deployments. |
| `HUMAN_CHALLENGE_SECRET` | Recommended | Long random, server-only value used to sign the 10-minute registration verification check. The database URL is used only as a compatibility fallback. |
| `MARKET_DATA_PROVIDER` | No | Use `mock` for fully local/demo data. Any other value uses the hybrid live-provider path with safe fallbacks. |
| `CG_API_KEY` | Optional | CoinGecko Demo API key for live crypto quotes and search. |
| `TWELVE_DATA_API_KEY` | Optional | Twelve Data key for non-crypto quotes and historical data. |
| `BRAND` | Optional | Selects a generated brand configuration. |

## Currency and FX

All ledger balances, trades, deposits, and withdrawals settle in USD. The currency selector changes only the displayed, indicative conversion.

The FX adapter uses Exchange Rate API’s open endpoint. The provider requires the visible “Rates By Exchange Rate API” attribution link and has its own rate-limit and redistribution terms. Review the provider’s current terms before production use.

`npm run build` refreshes the bundled fallback snapshot first. A timeout or provider failure keeps the existing snapshot and does not fail the build.

## Database options

Local development uses SQLite. Prisma models live in `prisma/schema.prisma`. For hosted PostgreSQL, change the datasource provider from `sqlite` to `postgresql` and set `DATABASE_URL` to your provider’s connection string. Do not deploy with `file:./dev.db`.

### Neon PostgreSQL

1. Create a Neon project.
2. Copy the production branch’s pooled PostgreSQL connection string from **Connect**.
3. Store it as `DATABASE_URL` in the deployment environment.
4. Change Prisma’s datasource provider to `postgresql`, preserving all models and fields.
5. Run the initialization commands below.

See [Neon’s Prisma guidance](https://neon.com/blog/better-postgres-with-prisma-experience) for connection and workflow details.

### Supabase PostgreSQL

1. Create a Supabase project and securely store its database password.
2. In **Connect**, copy a PostgreSQL connection string.
3. For serverless deployments, prefer the Supavisor transaction pooler (port `6543`); for long-lived servers, use the session pooler (port `5432`).
4. Store it as `DATABASE_URL` in the deployment environment.
5. Change Prisma’s datasource provider to `postgresql`, preserving all models and fields.
6. Run the initialization commands below.

This template accesses Prisma directly; it does not require `@supabase/supabase-js`. See the [Supabase Prisma guide](https://supabase.com/docs/guides/database/prisma).

### Initialize a hosted database

After changing Prisma to PostgreSQL and setting `DATABASE_URL`:

```bash
npm run prisma:generate
npx prisma db push
npm run seed
```

For a production team workflow, create and review Prisma migrations, commit them, and use `npx prisma migrate deploy` during deployment. Back up production data before destructive schema changes.

## Market data

Without API keys, the app falls back to safe demo/mock data where appropriate. Keep production keys server-side—never use `NEXT_PUBLIC_*` variables, browser code, screenshots, or source control.

### CoinGecko — crypto

1. Create a CoinGecko account and Demo API key.
2. Set `CG_API_KEY` locally and in your deployment host.
3. Restart the development server or redeploy.

The server sends the key as `x-cg-demo-api-key`. Review [CoinGecko authentication documentation](https://docs.coingecko.com/reference/authentication) for current limits and plan rules.

### Twelve Data — forex, shares, indices, ETFs, and commodities

1. Create a Twelve Data account and copy its API key.
2. Set `TWELVE_DATA_API_KEY` locally and in your deployment host.
3. Restart the development server or redeploy.

The application calls Twelve Data’s `/quote` and `/time_series` endpoints from the server. Review [Twelve Data documentation](https://twelvedata.com/docs) for coverage, entitlements, rate limits, and redistribution terms.

## Useful commands

```bash
npm run dev              # Start the Turbopack development server
npm run typecheck        # TypeScript validation
npm run test:fx          # FX-route checks
npm run build            # Refresh fallback FX data and create a production build
npm run start            # Run an existing production build
npm run prisma:generate  # Generate the Prisma client
npm run seed             # Seed plans, admin, and demo records
npm run new-brand -- --name "Acme"
npm run check:brand-leaks
npm run crawl
```

## Deployment checklist

1. Create your own Git repository, hosting account, and database project.
2. Configure `DATABASE_URL`, `CG_API_KEY`, and `TWELVE_DATA_API_KEY` as encrypted deployment variables.
3. Move local `uploads/` storage to durable object storage before handling real KYC, payment proofs, or support attachments on serverless hosting.
4. Run `npm run typecheck` and `npm run build` before deployment.
5. Deploy, then test registration, login, dashboard access, admin authorization, uploads, payment-request approval, membership payment, and market-data fallback.
6. Configure backups, monitoring, HTTPS/domain settings, rate limiting, and incident processes.

### Vercel guidance

Deploy this as a **Next.js** App Router project. Do not add a catch-all SPA rewrite such as `/(.*) -> /index.html`; it would intercept API routes, authenticated dashboards, and Next’s 404 page.

The included `vercel.json` pins the framework and generates the Prisma client during the build. Set all production variables before deployment, then verify `/`, `/auth/register`, `/auth/login`, `/admin/login`, and an intentionally invalid URL.

Payment QR images uploaded through **Admin → Deposit details** are stored in the database rather than the Vercel filesystem. Keep individual QR images at or below 2 MB.

## Before launch

- Replace all placeholder contact details, legal content, payment instructions, support details, and brokerage claims.
- The trading flows are simulation-oriented template features; they are not live execution connectivity to a broker or exchange.
- Deposits should remain pending until an authorized administrator approves them.
- Verify all provider pricing, quotas, licensing terms, and regional availability directly with the provider.
- Obtain appropriate legal, regulatory, security, privacy, payments, AML/KYC, and operational review before accepting real customer funds or personal data.
