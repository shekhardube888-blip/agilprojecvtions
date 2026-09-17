# AgileProjection · NT-AI Network — Worklog

This file is the shared work log for all agents on this project.
Each agent appends a new section (separated by `---`) after finishing its task.

---
Task ID: 1
Agent: Z.ai Code (orchestrator)
Task: Set up Prisma schema, layout metadata, theme, and central data file for the AgileProjection portal.

Work Log:
- Read the uploaded HTML at /home/z/my-project/upload/agileprojection_updated (1).html (3404 lines) to capture the full design (navy/cyan dark theme, internship programs, 84-project AI/ML catalog, IT courses, schedule, benefits, testimonials, FAQ, resources, newsletter, footer).
- Invoked the LLM skill to learn the z-ai-web-dev-sdk chat completions API for the AI learning assistant feature.
- Updated prisma/schema.prisma with three models: Student (registration record, covers BE/B.Tech/ME/M.Tech/MCA), Subscriber (newsletter), ChatMessage (AI assistant analytics). Ran `bun run db:push` — DB is in sync.
- Rewrote src/app/layout.tsx metadata (title, description, keywords, OG) for AgileProjection · NT-AI Network.
- Rewrote src/app/globals.css with the AgileProjection navy (#0B1929) + cyan (#06B6D4) + blue (#2563EB) dark theme as the default `:root`, custom scrollbar, and utility classes (.ap-gradient-text, .ap-grid-pattern, .ap-beam, .ap-fade-up, .ap-lift, .ap-divider).
- Created src/lib/data.ts — the single source of truth for all content: SITE contact config, COUNTERS, ABOUT_STATS, STEPS, PROGRAMS (4 cards), PROGRAM_DETAILS (curriculum tabs), SCHEDULE, BENEFITS (8), TESTIMONIALS (6), MENTORS (5), FAQS (8), RESOURCES (4), COURSES (8 IT/SAP courses), CATEGORIES (10 AI/ML domains, 84 projects total), AIML_CURRICULUM (6-week ML pipeline inspired by the housing-price regression article), AIML_FEATURES (4), and form option lists (DEGREES, BRANCHES, SEMESTERS, PLANS, STATES, SOURCES).

Stage Summary:
- DB schema pushed: Student, Subscriber, ChatMessage.
- Theme + metadata applied (navy/cyan dark).
- src/lib/data.ts is the central content source for frontend + backend.
- SITE.email = shekhar.dube@agileprojection.com (notifications destination).
- SITE.whatsapp = 919644084473 (WhatsApp 9644084473).

---
Task ID: 2
Agent: Z.ai Code (orchestrator)
Task: Build the backend — notification utility + API routes.

Work Log:
- Created src/lib/notify.ts: composes a full HTML + plain-text registration email, persists an audit log to /home/z/my-project/notifications/emails.log, logs to stdout (visible in dev.log), and returns mailto: + wa.me URLs. Uses nodemailer lazily ONLY if SMTP_HOST/SMTP_USER/SMTP_PASS env vars exist (graceful fallback otherwise).
- Created src/app/api/register/route.ts: POST saves the Student to the DB, then calls notifyRegistration() to dispatch email→shekhar.dube@agileprojection.com + WhatsApp→9644084473. GET returns the 100 most recent registrations.
- Created src/app/api/ai-assistant/route.ts: POST calls z-ai-web-dev-sdk (LLM) with a system prompt that makes "AP-AI Mentor" an expert tutor for BE/B.Tech/ME/M.Tech/MCA students — covers CS, AI/ML, Embedded, IoT, Full Stack, final-year project recommendations from the 84-project catalog, the end-to-end ML pipeline (housing-price regression reference: https://medium.com/@gurupratap.matharu/end-to-end-machine-learning-project-on-predicting-housing-prices-using-regression-7ab7832840ab), internship/career advice. Persists conversation turns in the ChatMessage table.
- Created src/app/api/newsletter/route.ts: POST subscribes an email (deduplicated, silent on duplicates).
- Created src/app/api/admin/registrations/route.ts: GET returns total count, breakdown by degree and by AI/ML category, and the 10 most recent registrations — for a staff dashboard.

Stage Summary:
- 4 API routes live: /api/register (POST+GET), /api/ai-assistant (POST), /api/newsletter (POST), /api/admin/registrations (GET).
- notify.ts handles email + WhatsApp composition/persistence with real-SMTP fallback.
- AI assistant uses the LLM skill (z-ai-web-dev-sdk), server-side only.
- All routes use `runtime = "nodejs"` and the shared `db` client from src/lib/db.ts.

---
Task ID: 3
Agent: full-stack-developer
Task: Build the entire frontend of the AgileProjection · NT-AI Network portal — 20 React components in src/components/agile/ composed in src/app/page.tsx, all wired to the existing /api/register, /api/ai-assistant, /api/newsletter, /api/admin/registrations routes.

Work Log:
- Read /home/z/my-project/worklog.md and src/lib/data.ts (full 580-line data source) before touching code. Confirmed Task IDs 1 & 2 already produced DB schema, theme (globals.css navy/cyan), src/lib/data.ts, layout.tsx, and 4 API routes — all left untouched.
- Read local shadcn primitives (Sheet, Tabs, Accordion, Select, Checkbox, Button, Input, Textarea, Table, Badge, Card, Toaster, useToast) to match idioms.
- Created 20 components in src/components/agile/: nav.tsx (client — sticky top nav w/ dropdowns + mobile Sheet), hero.tsx (server — grid-pattern + beam hero, 3 stat cards), counters.tsx, how-it-works.tsx, programs.tsx (4 PROGRAMS cards), program-details.tsx (client Tabs w/ hashchange sync to #detail-embedded/iot/cap), schedule.tsx (responsive table + mobile cards + status badges), benefits.tsx (8 cards), testimonials.tsx (6 cards w/ 5-star + gradient avatars), about.tsx (2-col + AICTE highlight box), mentors.tsx (5 mentor cards), faq.tsx (client Accordion), resources.tsx (4 cards w/ #ai-assistant + #aiml-program links), register-form.tsx (4-step client wizard), it-courses.tsx (SkillGorila partnership banner + SAP feature banner + 8 COURSES cards + SkillGorila store links), instructors.tsx, aiml-program.tsx (purple/cyan divider banner + AIML_FEATURES + ML pipeline pill diagram + 6-week vertical timeline highlighting housing-price reference + Medium article as target=_blank link), ai-assistant.tsx (client chat panel w/ react-markdown, sessionId reuse, degree selector, history, suggestion chips, loading state), newsletter.tsx (client — email + Subscribe), footer.tsx (server — sticky footer w/ 4 columns + social icons + bottom bar).
- Composed src/app/page.tsx (server) with all sections in the exact order specified, wrapped in `min-h-screen flex flex-col` (footer uses `mt-auto`). Added closing CTA strip before footer.
- Hit a runtime error first time: `Certificate` doesn't exist in lucide-react. Replaced with `Award` (lucide-react's Award icon). After fix, `curl http://localhost:3000/` returns HTTP 200.
- Verified all 4 API endpoints still work end-to-end via curl:
  - POST /api/ai-assistant → returned a real LLM reply (z-ai-web-dev-sdk working server-side).
  - POST /api/register with full StudentRecord body → returned notification.whatsappUrl (wa.me link) + notification.mailtoUrl (mailto link), both URL-encoded & ready to use as href by the success panel.
  - POST /api/newsletter → returned success message.
  - GET /api/admin/registrations → returned total count + byDegree/byCategory breakdowns.
- Ran `bun run lint` — clean (no errors or warnings).

Stage Summary:
- All 20 frontend components live in src/components/agile/. Two are interactive headlines:
  - RegisterForm: 4-step wizard (category → project → details → confirm) with summary + 2 consent checkboxes + success panel that surfaces the backend's whatsappUrl + mailtoUrl action buttons (Send WhatsApp / Email AgileProjection Team). Uses useToast for success/error, Loader2 spinner on submit, step indicator with active/done states. POST body matches backend StudentRecord exactly.
  - AIAssistant: full chat panel — sessionId generated on mount, reused across turns; react-markdown rendering of LLM replies; optional degree selector (sets context); last-6-turn history sent; 5 suggestion chips; "AP-AI Mentor is typing…" loading state; Enter-to-send; toast on error; footer disclaimer with shekhar.dube email + 9644084473 WhatsApp.
- All sections composed in src/app/page.tsx inside `min-h-screen flex flex-col` so the footer sticks to the bottom on short pages and pushes down naturally on long ones.
- Lucide icon fix: `Certificate` → `Award` (lucide-react doesn't export `Certificate`).
- `bun run lint` passes clean. `curl http://localhost:3000/` returns HTTP 200.
- Both the worklog (/home/z/my-project/worklog.md) and /agent-ctx/3-full-stack-developer.md have been updated per the orchestrator's instructions.

---
Task ID: 4
Agent: Z.ai Code (orchestrator) — verification & integration fixes
Task: Run the dev server, verify end-to-end with Agent Browser, fix issues, confirm sticky footer + responsiveness.

Work Log:
- Installed `nodemailer` (and `@types/nodemailer`) so the email-sending code path is fully resolvable; switched `src/lib/notify.ts` from a dynamic `import("nodemailer")` (which produced a webpack module-not-found warning) to a static top-level import. Warning gone.
- Ran Agent Browser against `http://localhost:3000/`:
  - First load hit a client-side exception: Radix `SelectItem` forbids empty-string `value=""`. Fixed in two places:
    - `src/components/agile/ai-assistant.tsx`: degree selector "— None —" option now uses `value="__none__"`, and the fetch sends `degree: undefined` when `__none__` is selected.
    - `src/components/agile/register-form.tsx` (`SelectField`): the `allowEmpty` option now uses `value="__none__"`, and the optional "How did you hear about us?" field converts `__none__` ↔ `""` on read/write.
  - After the fix, the page renders fully (HTTP 200, no client error overlay).
- Verified the complete registration golden path as a BE / B.Tech CSE 5th-sem student (Aditya Sharma, VIT Vellore, Tamil Nadu):
  - Step 1 → picked "ML & Predictive Analytics" (Next enabled).
  - Step 2 → searched & selected "Housing Price Prediction using Regression (End-to-End ML)" (project #21, the one that references the Medium end-to-end ML article).
  - Step 3 → filled all fields (degree, branch, semester, plan, college, state; source left as "— None —").
  - Step 4 → confirmed summary + both consent checkboxes, clicked "🚀 Submit Enrolment".
  - Success state showed "🎉 Enrolment Submitted!" with two action buttons surfaced from the API:
    - WhatsApp button href = `https://wa.me/919644084473?text=...` (pre-filled message to 9644084473) ✓
    - Email button href = `mailto:shekhar.dube@agileprojection.com?subject=...&body=...` (full registration to shekhar.dube@agileprojection.com) ✓
- Verified persistence: `GET /api/admin/registrations` returns `total: 3` with Aditya Sharma as the most recent record; `/home/z/my-project/notifications/emails.log` contains the full composed email body (audit trail).
- Verified the AI Learning Assistant: typed a B.Tech-CSE-specific question about the end-to-end ML pipeline; the LLM replied in ~2.8s with a tailored 5-step answer (Data Ingestion/EDA → Preprocessing → Feature Engineering → Model Training → Evaluation & Deployment) referencing the housing-price project. Conversation turns persisted to the `ChatMessage` table (verified via INSERT log lines).
- Verified mobile responsiveness: emulated iPhone 14 — nav collapses to a hamburger that opens a Sheet drawer with Internships/Schedule/Register links; all sections render single-column.
- Verified sticky footer: the page is wrapped in `min-h-screen flex flex-col` with the footer using `mt-auto`; footer is present at the bottom (brand "AgileProjection (NT-AI Network)", mission paragraph mentioning BE/B.Tech/ME/M.Tech/MCA, contact links training@agileprojection.com + WhatsApp, social links, © 2026 bottom bar).
- VLM analysis of the desktop hero screenshot confirmed: navy background with subtle grid pattern, clean nav (logo + links + phone + Register button), H1 "Launch Your Engineering Career with Free Industry Internships" with cyan emphasis, 3 right-side stat cards, category tags + 2 CTA buttons, high contrast, clean typography, no rendering/overflow issues.
- Final `bun run lint` is clean (no errors, no warnings).

Stage Summary:
- All headline features browser-verified end-to-end:
  1. Registration wizard (4 steps) → DB save → success screen with WhatsApp (9644084473) + email (shekhar.dube@agileprojection.com) action buttons.
  2. AI Learning Assistant (LLM) → tailored, degree-aware replies referencing the housing-price end-to-end ML project; conversation persisted.
- Responsive (mobile hamburger + single-column) and sticky-footer behavior confirmed.
- `bun run lint` clean; dev server returns HTTP 200 on `/` with no client-side exceptions.
- DB has 3 real registrations; notifications log has the full email body for the latest.
