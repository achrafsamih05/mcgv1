<div align="center">

# MCG Global

**Your complete trade & logistics ecosystem — connecting importers in Morocco with suppliers, warehouses, drivers, and logistics services across the China → Morocco corridor.**

[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-0F172A)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%2B_RLS-3FCF8E)](https://supabase.com)

</div>

---

## Overview

MCG Global is a multi-tenant B2B trade and logistics platform. It unifies five role-based consoles, a shared core services layer, and public-facing marketplace pages into a single Next.js application. Buyers source products and file RFQs, suppliers manage catalogs and quotes, carriers run fleets and trips, warehouse hosts list storage and process bookings, and a Super Admin oversees the entire ecosystem — all behind a consistent design system and strict tenant isolation.

The platform is built mobile-first, is SEO-aware on public pages, and ships an Arabic-first (RTL) authentication experience backed by Supabase Auth with role-based edge routing.

## Feature Highlights

- **Six dashboards** — Admin command center, Suppliers, Drivers & logistics, Warehouses, Importers, and a shared Core services workspace.
- **Public marketplace** — landing page, supplier storefronts, transport directory, and warehouse search.
- **Multi-tenant isolation** — every tenant system enforces data scoping at a single choke-point so no tenant ever sees another's records.
- **RFQ → Quotation → Escrow → Tracking** — the full sourcing-to-delivery pipeline with an 8-stage supply-chain timeline.
- **Auth & RBAC** — Supabase email/password auth, a `profiles` role table, and Vercel Edge middleware that guards `/dashboard/*` by role.
- **i18n & multi-currency** — English, Arabic, French, and Chinese scaffolding with live USD / EUR / MAD / CNY conversion.
- **Dependency-free charts** — line, bar/area, and donut visualizations rendered as pure SVG.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion |
| Icons | lucide-react (+ official brand SVGs) |
| Auth & DB | Supabase (`@supabase/ssr`, Postgres, RLS) |
| Deploy target | Vercel (Edge middleware) |

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Deep Dark Blue | `#0F172A` | Primary structure, panels, sidebars |
| Vibrant Orange | `#F97316` | CTAs, badges, steppers, KPIs, active states |
| Typography | Plus Jakarta Sans | Clean, professional B2B SaaS pairing |

Aesthetic baseline: minimalism / Swiss-style — spacious grids, high contrast, subtle 150–300 ms hover transitions, SVG-only icons, visible focus states, and `prefers-reduced-motion` support.

## Getting Started

### Prerequisites

- Node.js 18.17+ and npm
- (Optional) A Supabase project for live auth

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build (also runs type-check + lint)
npm run start   # serve the production build
npm run lint    # lint only
```

## Routes

### Public

| Path | Description |
|------|-------------|
| `/` | Marketing landing page |
| `/auth` | Arabic-first Sign In / Sign Up (RTL) |
| `/suppliers/[id]` | Public supplier storefront |
| `/transport` · `/transport/[id]` | Carrier directory & profile |
| `/warehouses` · `/warehouses/[id]` | Warehouse search & facility page |

### Consoles

| Path | Role |
|------|------|
| `/admin` | Super Admin / CEO command center |
| `/importer` · `/importer/register` | Buyer / Importer |
| `/supplier` · `/supplier/register` | Supplier / Manufacturer |
| `/logistics` · `/logistics/register` | Driver / Transport company |
| `/warehouse` · `/warehouse/register` | Warehouse host |
| `/core` | Shared core services workspace |

> **Note:** the auth middleware guards `/dashboard/:path*` by role. Reconcile these
> guarded paths with the console routes above before production (either add
> `/dashboard/<segment>` routes or update the redirect map in `lib/auth/roles.ts`).

## Project Structure

```
app/                         # App Router routes (one folder per surface)
  auth/                      # authentication page
  admin/ core/               # super-admin & shared-core workspaces
  importer/ supplier/        # tenant consoles
  logistics/ warehouse/
  suppliers/ transport/ warehouses/   # public directories & storefronts
components/                  # UI, grouped by domain
  admin/ core/ importer/ logistics/ supplier/ warehouse/ auth/ ui/
lib/                         # types, data, RBAC, helpers per domain
  core/ importer/ logistics/ supplier/ warehouse/ auth/ supabase/
  mcg-global-types-and-mock-state.ts   # single source-of-truth state file
supabase/schema.sql          # Postgres schema, RLS, signup trigger
middleware.ts                # Vercel Edge role guard
```

Each tenant domain follows the same shape: a `types.ts` (strict interfaces),
a `rbac.ts` (capability checks + tenant scoping), a `data.ts` (mock layer),
and a set of section components composed by a dashboard shell.

## Multi-Tenant Security

Tenant isolation is enforced through a single choke-point per domain
(`scopeToTenant` / `scopeToUser` in each `rbac.ts`). Components only ever load
records filtered to the active tenant, so cross-tenant data cannot reach the UI.
Each domain seeds a foreign-tenant record in its mock data to prove isolation
holds. Capability checks (`can(...)`) gate every mutating action, and a
documented `PROHIBITED_ACTIONS` list records what each role may never do.

## Authentication & RBAC (Supabase)

1. Copy the env template and fill in your Supabase keys:

   ```bash
   cp .env.local.example .env.local
   ```

   | Variable | Scope |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | public |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
   | `SUPABASE_SERVICE_ROLE_KEY` | **server-only** (admin overrides) |

2. Run `supabase/schema.sql` in the Supabase SQL Editor. It creates the
   `user_role` enum, a `profiles` table (FK → `auth.users`), RLS policies, and a
   `handle_new_user()` trigger that provisions a profile + role on signup.

3. Clients live in `lib/supabase/` — `client.ts` (browser), `server.ts`
   (Server Components / Actions / Route Handlers + a service-role client), and
   `middleware.ts` (session refresh helper).

4. `middleware.ts` intercepts `/dashboard/:path*`, refreshes the session via
   `getUser()`, resolves the role from `profiles`, and enforces that a user only
   reaches their own dashboard segment (Super Admin may access any). Unauthenticated
   requests redirect to `/auth`.

The auth form uses real Supabase calls when env vars are present and falls back
to a local demo flow otherwise, so the UI runs out of the box.

## Deployment (Vercel)

1. Push to a Git provider and import the repo into Vercel.
2. Add the three Supabase env vars under **Project → Settings → Environment Variables**.
3. Deploy. The Edge middleware and App Router routes deploy automatically.

## Internationalization & Currency

`lib/core/i18n.ts` defines four locales (English, Arabic `rtl`, French, Chinese)
with a dictionary scaffold and a `t()` helper, plus four currencies (USD, EUR,
MAD, CNY) with a `formatMoney()` converter. The core workspace topbar switches
both live; the structure is ready for a full i18n library to drop in without
changing call sites.

## Notes & Limitations

- Data layers are mock/in-memory with clear seams for a real backend; the
  Supabase wiring covers auth and the `profiles` role table.
- Public images use Unsplash placeholders (allow-listed in `next.config.mjs`).
- Replace `WHATSAPP_NUMBER` and `SUPPORT_EMAIL` in `lib/content.ts` before launch.
- Charts are placeholders for a charting library (Recharts/Chart.js) and can be
  swapped without touching section layouts.

## License

Proprietary — © MCG Global. All rights reserved.
