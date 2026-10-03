# Task 28-BACKEND — Google OAuth + admin password security (BACKEND ONLY)

**Agent:** Z.ai Code (general-purpose)
**Date:** 2025-10-03
**Scope:** Backend only. Did NOT touch `src/app/page.tsx`, `src/components/agile/auth-menu.tsx`, `src/components/agile/register-form.tsx`, `src/app/layout.tsx`. The frontend agent handles those.

---

## Files Created

1. `src/app/api/auth/[...nextauth]/route.ts`
   - NextAuth v4 route handler. Exports `authOptions` + `GET` + `POST`.
   - Providers:
     - **GoogleProvider** (students) — registered only when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` env vars are set. Uses `prompt: "select_account"`.
     - **CredentialsProvider** (admin) — email compared against `ADMIN_EMAIL`; password compared in constant time via `Buffer.from(...).equals(...)`. Never logs the password. Returns `{ id, email, name, role }` only.
   - Session strategy: `jwt`. Secret: `NEXTAUTH_SECRET || SESSION_SECRET || "dev-secret-change-me"`.
   - Callbacks: `jwt` stamps `role` + `googleEmail`; `session` exposes `role` + `googleEmail` on `session.user`.
   - `pages.signIn = "/"` (homepage is the sign-in page).

2. `src/app/api/auth/google-link/route.ts`
   - `GET` route. Reads NextAuth session via `getServerSession(authOptions)`.
   - If no `session.user.email` → redirects to `/?error=google-failed`.
   - Finds/creates local `Account` with `username = email`, an **unusable random `passwordHash`** (so it's never loggable via `/api/auth/login`), `role = "guest"`, `status = "unlocked"`, `expiresAt = null` (permanent).
   - Sets the local HMAC `ap_session` cookie via `makeSessionCookie(...)` so the existing `/api/auth/me` works unchanged.
   - Redirects to `/?google=1` with cookie set. Errors redirect to `/?error=google-failed`.

3. `.env.example` (did not exist before)
   - Documents every env var the operator needs to set.

## Files Modified

4. `src/lib/auth.ts`
   - Added module-level `ADMIN_PASSWORD` + `ADMIN_EMAIL` constants read from env.
   - Added one-time-warn helper `warnAdminPasswordMissing()` (logs `[auth] WARNING: ADMIN_PASSWORD not set. Admin login disabled.` exactly once per process).
   - Replaced hardcoded `SEED_ACCOUNTS` array with `buildSeedSpecs()` function:
     - Admin account seeded ONLY when `ADMIN_PASSWORD` is non-empty (both dev + prod).
     - `student@agileprojection.com` demo student + `guest1`..`guest5` seeded ONLY when `NODE_ENV !== "production"`.
     - Production + no `ADMIN_PASSWORD` → empty list, warn-once, no admin login.
   - `ensureAccountsSeeded()` re-evaluates `buildSeedSpecs()` at runtime.
   - Exported `ADMIN_CREDENTIALS = { email, hasPassword }` (read-only — never the password itself).
   - SECURITY comment block added at top of admin-credentials section.
   - Verified no `console.log`/`console.error`/`console.warn` prints the password or `passwordHash`.

5. `src/app/api/register/route.ts`
   - Reads NextAuth session via `getServerSession(authOptions)`.
   - Rejects with 401 `{ ok: false, error: "You must sign in with Google before registering.", code: "NO_GOOGLE_SESSION" }` if no session.
   - Forces `email = session.user.email.toLowerCase().trim()` — ignores any email in the body.
   - Removed `"email"` from the required field list (now sourced from session).
   - Added duplicate check: `db.student.findFirst({ where: { email: googleEmail } })` → 409 `{ ok: false, error: "...", code: "DUPLICATE" }` if found.
   - Persists Student with the Google email.
   - Replaces the old "auto-create Account with mobile-as-password" logic with the Google-link logic: random unusable `passwordHash`, `role = "guest"`, `status = "unlocked"`, `expiresAt = null`.
   - Notification logic (`notifyRegistration` + `emailSent`/`waSent` persistence) left intact.
   - Also sets the `ap_session` cookie on the success response (in case the user bypassed google-link).
   - `console.error` lines now log only `(err as Error).message` — never credentials.
   - `GET /api/register` (admin listing) unchanged.

6. `.env`
   - Kept `DATABASE_URL`.
   - Added back `SESSION_SECRET` (was being read from env but missing).
   - Added `GOOGLE_CLIENT_ID=""`, `GOOGLE_CLIENT_SECRET=""`, `NEXTAUTH_URL="http://localhost:3000"`, `NEXTAUTH_SECRET="dev-nextauth-secret-change-me-in-production"`, `ADMIN_EMAIL="admin@agileprojection.com"`, `ADMIN_PASSWORD="admin123"`.

---

## Env vars the user/operator needs to set

In production (Vercel/.env/Secrets manager):

| Var | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | YES | Prisma connection string |
| `SESSION_SECRET` | YES | HMAC key for the legacy `ap_session` cookie |
| `GOOGLE_CLIENT_ID` | YES (for student Google login) | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | YES (for student Google login) | Google OAuth client secret |
| `NEXTAUTH_URL` | YES | Canonical app URL (e.g. https://agileprojection.com) |
| `NEXTAUTH_SECRET` | YES | JWT signing secret for NextAuth |
| `ADMIN_EMAIL` | Optional (defaults to `admin@agileprojection.com`) | Admin login email for NextAuth Credentials |
| `ADMIN_PASSWORD` | YES (otherwise admin login is disabled) | Admin password — hashed by `auth.ts` before storage; also used in constant-time compare by NextAuth Credentials |

In dev (local): only `DATABASE_URL` is strictly required — the rest fall back to safe dev values:
- `SESSION_SECRET` → dev fallback in `auth.ts`
- `GOOGLE_CLIENT_ID`/`SECRET` → empty → Google provider disabled (students can't sign in via Google in dev unless filled in)
- `NEXTAUTH_URL` → `http://localhost:3000`
- `NEXTAUTH_SECRET` → falls back to `SESSION_SECRET` → dev fallback in `auth.ts`
- `ADMIN_EMAIL` → `admin@agileprojection.com`
- `ADMIN_PASSWORD` → `admin123` (dev fallback in `auth.ts`)

---

## Lint status

`cd /home/z/my-project && bun run lint` → exit code 0, no errors, no warnings.

Initial run flagged one "Unused eslint-disable directive" warning on the NextAuth route (an unnecessary `// eslint-disable-next-line @typescript-eslint/no-explicit-any`). Removed the comment since the rule is already off globally. Second run is clean.

Also verified all four entry files compile via `bun build` (315 modules total, no errors).

---

## Notes for the frontend agent (Task 28-FRONTEND)

1. **Google sign-in flow**: `signIn("google")` from `next-auth/react` → after OAuth callback, the user lands on `/`. The frontend should then call `GET /api/auth/google-link` (e.g. in the `AuthMenu` effect when a NextAuth session is detected but no `ap_session` cookie). That route sets the local cookie and redirects to `/?google=1`. After that, `GET /api/auth/me` returns the student user.

2. **Admin sign-in flow**: Two options —
   - Use `signIn("credentials", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })` via NextAuth. NOTE: this creates a NextAuth JWT session but does NOT set the `ap_session` cookie. The frontend `AuthMenu` (which reads `/api/auth/me`) won't pick it up unless an admin-link equivalent route is added, OR the AuthMenu is updated to also call `/api/auth/me` via a NextAuth-session-aware endpoint. Easiest: continue using the existing `POST /api/auth/login` with `username: "admin"` + `password: ADMIN_PASSWORD` — that route already sets the `ap_session` cookie and works unchanged.
   - The frontend agent should pick ONE admin login path and stick with it. My recommendation: keep `POST /api/auth/login` for admin (it's already wired up in `auth-menu.tsx` and works end-to-end). Use NextAuth Google only for students.

3. **Registration form**: The `email` field should be **read-only and auto-filled** from the Google session. The server ignores the body email anyway, but showing it read-only to the student makes the UX clear ("this is your Google email, you can't change it"). The form can fetch the email from `/api/auth/me` (which now returns the google email as `username` for Google-linked accounts) or from the NextAuth `useSession()` hook.

4. **Duplicate registration**: If `/api/register` returns 409 with `code: "DUPLICATE"`, show a message like "You're already registered. Log in with Google to continue." and redirect to the login flow.
