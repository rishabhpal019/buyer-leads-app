# Buyer Lead Intake App (Demo)

This is a minimal implementation of the assignment: a Next.js + TypeScript + Prisma (SQLite) app that captures, lists, and manages buyer leads.

## Quick start

1. Copy `.env.example` to `.env` (default uses SQLite `dev.db`).
2. Install:
   ```bash
   npm install
   ```
3. Generate Prisma client & migrate:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```
5. Use demo login: endpoints set a demo cookie on first POST attempt. This is intentionally minimal for the assignment.

## Features implemented
- Buyer model with required fields and enums (see `prisma/schema.prisma`)
- Shared Zod validation (`src/lib/validators/buyer.ts`) used by API
- Create lead (`/api/buyers`), list (SSR page `/buyers`), view (`/buyers/[id]`)
- CSV import (`/api/buyers/import`) with per-row validation (max 200 rows) and transactional insert
- CSV export (`/api/buyers/export`) matching list filters (q= search)
- Ownership: demo user created and assigned as owner
- Simple in-memory rate-limit on create (per demo user)
- Basic error boundary and accessibility attention in forms
- One unit test example (validator) planned in `tests/`

## What is simplified / skipped
- Proper production auth (NextAuth) is not fully wired; a demo cookie-based login is used for quick testing.
- UI is intentionally minimal (no styling system).
- Admin role not implemented.
- File attachments not implemented.

If you need, I can extend this to a GitHub repo and/or create a Vercel deploy.



## Final ZIP for submission

The repository is ready to be zipped. You can run `zip -r buyer-leads-complete.zip .` to create a final archive to attach to email. The included SQLite DB will be generated after running migrations.
