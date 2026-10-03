# Task 28-FRONTEND — Frontend for Google OAuth + admin-password security

> **Read this first if you are picking up work that depends on this task.**
> The matching backend task is `28-BACKEND` (NextAuth route, `/api/auth/google-link`,
> `src/lib/auth.ts`, `.env`, `/api/register` duplicate handling).

## Files created
- `src/components/providers/session-provider.tsx` — `"use client"` wrapper that re-exports NextAuth v4 `SessionProvider`. Mounted once at the root layout so any client component can call `useSession()`.
- `src/components/agile/google-sign-in-button.tsx` — `"use client"` button. Calls `signIn("google", { callbackUrl: "/api/auth/google-link" })`. Renders the official Google "G" logo as an inline 4-path SVG (brand colors #4285F4 / #34A853 / #FBBC05 / #EA4335) — no external image. Accepts `label` and `className` props.

## Files modified
- `src/app/layout.tsx` — imported `SessionProvider`; wrapped `{children}` + `<Toaster />` inside `<SessionProvider>…</SessionProvider>` inside `<body>`. All metadata, fonts, `suppressHydrationWarning`, body className preserved.
- `src/app/page.tsx` (login page):
  - Added `useToast()` to `Home` + a `useEffect` that detects `?google=1` (calls `refreshAuth()`, strips the query param via `history.replaceState`) and `?error=google-failed` (fires a destructive toast, strips the param).
  - Replaced `"Students: use your registration email + mobile. Admin: admin / admin123."` with `"Students: sign in with Google. Admin: use your credentials."`.
  - DELETED the `<button>admin / admin123</button>` autofill button AND the `<button>student demo</button>` autofill button.
  - Added `<GoogleSignInButton />` ABOVE the existing credentials form + a divider "or".
  - Renamed labels to "Admin Username / Email" / "Admin Password" and submit button to "Admin Sign In".
  - Added a note under the admin form: "Admin login only. Students must use Google Sign-In above."
  - Kept the entire admin login submit handler (`/api/auth/login` POST, `onLoggedIn(data.user)`, toast, error handling) untouched.
- `src/components/agile/auth-menu.tsx` (the admin-console auth dialog):
  - DELETED the `CredentialButton` component definition, all four `<CredentialButton>` instances, the `fill()` and `copy()` helpers, and the `copied` state.
  - Removed unused imports: `Copy`, `Check`, `LayoutDashboard`. Removed the unused `useToast()` destructure inside `LoginForm`.
  - Replaced dialog description with `"Sign in with Google for student access. Admin: use your credentials."`.
  - Replaced the "Students start locked (demo accounts)…" help block with: `"Students sign in with Google. Registered students get permanent access. Admin manages students from the dashboard."`.
  - Added `<GoogleSignInButton />` + divider "or" + admin-only username/password form (preserved).
- `src/components/agile/register-form.tsx` (the 4-step registration wizard):
  - Added `import { useSession } from "next-auth/react"`, `import { GoogleSignInButton }`, and `AlertTriangle`.
  - Top of `RegisterForm`: `const { data: session, status } = useSession();` → `const googleEmail = session?.user?.email?.toLowerCase().trim() || "";` → `const isSignedIn = !!googleEmail && status === "authenticated";` → `const authLoading = status === "loading";`. New `duplicateEmail` state.
  - Email `<Input>` (Step 3): `value={googleEmail}`, `readOnly`, no `onChange`, `placeholder="Sign in with Google first"`, `bg-muted/50 cursor-not-allowed`, `aria-describedby="email-from-google-help"` help span ("Read-only — taken from your Google session. Sign out & back in with another Google account to change it.").
  - `validateStep3()`: removed the email-format regex check (Google guarantees validity; backend re-validates). All other validations preserved.
  - `submit()`: early-returns with a destructive toast `"Sign in with Google first"` when `!googleEmail`. Uses `email: googleEmail` (NOT `form.email`) in POST body. After response: detects `data.code === "DUPLICATE"` (or `/duplicate/i.test(data.error || "")`) → sets `duplicateEmail`, fires toast, short-circuits.
  - Step 4 SummaryCard: email row now shows `googleEmail || form.email`.
  - New duplicate banner (amber `AlertTriangle` + "You are already registered with this Google account." + mono email + "Log in with Google" link `/?google=1` + Dismiss button).
  - New not-signed-in banner (cyan `AlertTriangle` + "⚠ Sign in with Google to register." + explanation + `<GoogleSignInButton label="Sign in with Google to register" />`). Shows a spinner while `authLoading`.
  - The wizard (StepIndicator + Steps 1–4) is wrapped in `<div aria-disabled={!isSignedIn} className={cn("transition-all", !isSignedIn && "pointer-events-none opacity-50 select-none")}>` so it's greyed out + non-interactive until signed in.
  - All other fields and the entire 4-step wizard flow, PaymentPage, SuccessPanel are preserved unchanged.

## What the user sees
- Login page (`/`): a white "Sign in with Google" button (official Google G logo) at the top of the login card → divider "or" → admin-only username/password form (no demo chips, no visible admin password anywhere). Hint: "Students: sign in with Google. Admin: use your credentials." Note under the form: "Admin login only. Students must use Google Sign-In above."
- Auth-menu dialog (admin unlock console): same Google button + divider + admin credentials form, with an "Access guide" info block instead of demo-credential chips.
- Register form (`#register`): if not signed in with Google, a prominent cyan banner with "⚠ Sign in with Google to register" + a "Sign in with Google to register" button. The wizard below is greyed out + non-interactive until signed in. Once signed in, the Email field is read-only and pre-filled with the Google email. On a duplicate registration, an amber banner appears: "You are already registered with this Google account." with a "Log in with Google" link.
- After Google OAuth completes (backend redirects to `/?google=1`), the homepage useEffect calls `refreshAuth()` (which fetches `/api/auth/me` — the local cookie was set by `/api/auth/google-link`), strips the query param, and the student dashboard auto-mounts. On `?error=google-failed`, a destructive toast: "Google sign-in failed. Please try again."

## Security properties delivered
- Admin password is NEVER displayed anywhere — autofill chips and "admin / admin123" hints removed from BOTH `page.tsx` LoginForm AND `auth-menu.tsx` dialog LoginForm.
- Student email on registration is read-only and sourced from the Google session — a student cannot register a different email than the one they used to sign in with Google.
- Duplicate registration by the same Google email is detected by the backend and surfaced with an inline "Log in" link (no silent data overwrite).
- `signIn("google", { callbackUrl: "/api/auth/google-link" })` routes the OAuth flow through the backend route that links the Google session to the local portal cookie. The existing `/api/auth/me` + `/api/auth/login` flow is untouched (admin still uses `/api/auth/login` with email + password from `.env`).

## Lint status
`cd /home/z/my-project && bun run lint` → **exit code 0, no errors, no warnings**.
`bunx tsc --noEmit` → zero errors in any of my modified files (remaining TS errors are all pre-existing in unrelated files: `admin-dashboard.tsx`, `student-dashboard.tsx`, `api/register/route.ts`, `api/pages/route.ts` and the example/skills scripts).

## Dependencies on backend (28-BACKEND)
These are the contracts the frontend assumes the backend agent will satisfy:
- `src/app/api/auth/[...nextauth]/route.ts` exporting the NextAuth v4 config with Google + Credentials providers. Session callback exposes `session.user.email` (default), `session.user.role` ("admin"|"guest"), and `session.user.googleEmail`.
- `src/app/api/auth/google-link/route.ts` — server route that, on hit, links the Google session email to the local portal cookie (set via `/api/auth/me`/`/api/auth/login` machinery) and redirects to `/?google=1` (or `/?error=google-failed` on failure).
- `src/lib/auth.ts` — admin password read from `process.env.ADMIN_PASSWORD` (NOT a hardcoded string). Admin email from `process.env.ADMIN_EMAIL`.
- `/api/register` updated to: (a) accept `email` only when it matches the active Google session email, (b) reject duplicates with `{ ok: false, code: "DUPLICATE", error: "..." }` (HTTP 409 or 400).
- `.env` / `.env.example` keys: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

Until the backend agent lands the NextAuth route, `import { useSession } from "next-auth/react"` will resolve at runtime but `useSession()` returns `{ status: "unauthenticated" }` — so the register form shows the not-signed-in banner and the login page shows the Google button (clicking it will fail to redirect to Google until the route exists). This is expected and matches the orchestrator's instruction that backend import errors are OK during parallel dev.
