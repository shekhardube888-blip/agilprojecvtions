# Task ID: 3 — Frontend (full-stack-developer agent)

## Task
Build the entire frontend of the AgileProjection · NT-AI Network portal in React + Tailwind + shadcn/ui — 20 components in `src/components/agile/` composed in `src/app/page.tsx`, all wired to the existing `/api/register`, `/api/ai-assistant`, `/api/newsletter`, `/api/admin/registrations` routes built by Task ID 2.

## Work Log
- Read `/home/z/my-project/worklog.md` and `src/lib/data.ts` (full 580-line data source) before touching code.
- Read all relevant shadcn UI primitives (Sheet, Tabs, Accordion, Select, Checkbox, Button, Input, Textarea, Table, Badge, Card, Toaster/useToast) so the React idioms match the local shadcn API.
- Created 20 components in `src/components/agile/`:
  1. `nav.tsx` (client) — sticky top nav with desktop dropdowns + mobile Sheet drawer.
  2. `hero.tsx` (server) — full-viewport hero with `.ap-grid-pattern` + `.ap-beam`, gradient H1, track pills, two CTA buttons, trust row, 3 right-side stat cards.
  3. `counters.tsx` (server) — strip with the 4 `COUNTERS`.
  4. `how-it-works.tsx` (server) — 5-step horizontal stepper with a connecting line on desktop.
  5. `programs.tsx` (server) — grid of 4 `PROGRAMS` cards (gradient thumbnail, tags, meta row, primary + ghost CTAs).
  6. `program-details.tsx` (client) — Tabs component for the 3 `PROGRAM_DETAILS`; hash-change listener so `#detail-embedded`/`#detail-iot`/`#detail-cap` deep-links auto-switch tabs.
  7. `schedule.tsx` (server) — responsive table on desktop, cards on mobile, with green/amber status badges.
  8. `benefits.tsx` (server) — grid of 8 `BENEFITS` cards with `.ap-lift` hover.
  9. `testimonials.tsx` (server) — 6 cards with 5-star rating, quote, gradient avatar w/ initials.
  10. `about.tsx` (server) — 2-col: narrative + AICTE highlight box, plus 2×3 `ABOUT_STATS` grid.
  11. `mentors.tsx` (server) — 5 mentor cards with gradient avatars.
  12. `faq.tsx` (client) — single-open Accordion of 8 `FAQS` using shadcn Accordion.
  13. `resources.tsx` (server) — 4 cards; the AI Learning Assistant + ML Guide cards link to `#ai-assistant` / `#aiml-program`.
  14. `register-form.tsx` (client) — the headline 4-step enrolment wizard:
      - Step 1: 10 `CATEGORIES` radio cards.
      - Step 2: searchable project list filtered by selected category.
      - Step 3: 2-col form with all 11 fields + `DEGREES`/`BRANCHES`/`SEMESTERS`/`PLANS`/`STATES`/`SOURCES` selects. Inline validation (email regex, mobile regex, required fields).
      - Step 4: summary cards + 2 consent checkboxes + submit.
      - Success panel: shows project name, "Send WhatsApp" (opens `notification.whatsappUrl`) and "Email AgileProjection Team" (opens `notification.mailtoUrl`) buttons + the 24-hour follow-up note.
      - Uses `useToast` for success/error toasts, `Loader2` spinner on submit, full step indicator (1·2·3·4 with active/done states).
      - POST body matches backend's `StudentRecord` exactly.
  15. `it-courses.tsx` (server) — SkillGorila partnership banner, SAP feature banner with 95% placement stat, 9-category filter pill bar (decorative), grid of 8 `COURSES` cards (rating, badges, FREE price, SkillGorila store link), "View All 86 Courses" CTA.
  16. `instructors.tsx` (server) — reuses mentor style with "Top 1%" heading.
  17. `aiml-program.tsx` (server) — purple/cyan divider banner, AIML_FEATURES grid, 6-step ML pipeline pill diagram (housing-price as worked example), 6-week curriculum as vertical timeline with weeks 1/3/4 highlighted, Medium article rendered as `target=_blank rel=noopener noreferrer` link, CTA → `#register`.
  18. `ai-assistant.tsx` (client) — full chat panel:
      - sessionId generated on mount, reused across turns.
      - Optional degree selector (sets context for the LLM via `degree` param).
      - Scrollable chat area with `react-markdown` rendering, user-right/assistant-left bubbles.
      - 5 suggestion chips.
      - Loading "AP-AI Mentor is typing…" state, Enter-to-send, error toast.
      - Sends `history` (last 6 turns) with each request.
      - Footer disclaimer w/ shekhar.dube email + 9644084473 WhatsApp.
  19. `newsletter.tsx` (client) — "Stay in the Loop" strip with email input + Subscribe button → `/api/newsletter`.
  20. `footer.tsx` (server) — sticky footer (uses `mt-auto` from page wrapper). Brand, mission paragraph, contact links (training@agileprojection.com mailto, +91 80955 57332 tel, +91 80955 57334 WhatsApp), 4 footer columns, social icons, bottom bar with © 2026 + legal links.
- Composed `src/app/page.tsx` (server) with all sections in the exact order specified, wrapped in `min-h-screen flex flex-col` so the footer sticks to the bottom. Includes the closing CTA strip before the footer.
- Hit a runtime error first time: `Certificate` doesn't exist in lucide-react. Replaced with `Award`. After fix, `curl /` returns HTTP 200, page renders cleanly.
- Verified all 4 API endpoints still work end-to-end via curl:
  - `POST /api/ai-assistant` → returned a real LLM reply from z-ai-web-dev-sdk.
  - `POST /api/register` with full `StudentRecord` body → returned `notification.whatsappUrl` + `notification.mailtoUrl` (both URL-encoded, ready to use as `href`).
  - `POST /api/newsletter` → returned success message.
  - `GET /api/admin/registrations` → returns total count + breakdowns.
- Ran `bun run lint` — clean (no errors or warnings).

## Stage Summary
- All 20 components live in `src/components/agile/`. Two are interactive headlines:
  - **RegisterForm**: 4-step wizard (category → project → details → confirm) with summary + consent + success panel that surfaces the backend's `whatsappUrl` + `mailtoUrl` action buttons.
  - **AIAssistant**: full chat with `react-markdown` rendering, history context, degree selector, suggestion chips, loading state.
- All sections composed in `src/app/page.tsx` inside a `min-h-screen flex flex-col` wrapper; footer uses `mt-auto` so it sticks on short pages and pushes down on long ones.
- Lucide icon fix: `Certificate` → `Award` (lucide-react doesn't export `Certificate`).
- `bun run lint` passes clean. `curl /` returns HTTP 200.
- Both the worklog (`/home/z/my-project/worklog.md`) and this file (`/agent-ctx/3-full-stack-developer.md`) have been updated.
