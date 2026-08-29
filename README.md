# Elaya Frontend (Web)

Web UI for the Elaya platform — **Studio Dashboard** and **Admin Dashboard**.  
Customer experience is **mobile-only** (separate project); the landing page links to it as a placeholder.

**Stack:** React 19 · Vite 8 · React Router 7 · Tailwind CSS v4 · Zustand · Axios · React Hot Toast · Lucide React  
**Design source:** `inkderm-prototype/` (colors, layout, nav structure)  
**API:** Connects to [Elaya Backend API](../elaya-backend/README.md) at `/api/v1`  
**Last updated:** 2026-08-29

---

## Current progress

### Milestone 1 — Auth & shell (complete)

| Area | Status | Notes |
|---|---|---|
| **Landing page** | ✅ Done | Portal picker — Customer App (placeholder), Studio, Admin |
| **Routing** | ✅ Done | React Router — public, protected, guest, nested, 404 |
| **Studio auth — login** | ✅ Done | Wired to `POST /auth/login` + `GET /auth/me` |
| **Studio auth — register** | ✅ Done | Wired to `POST /auth/register/studio` |
| **Studio auth — forgot password** | ✅ Done | Wired to `POST /auth/forgot-password` (portal: studio) |
| **Studio auth — reset password** | ✅ Done | `/studio/reset-password?token=…` → `POST /auth/reset-password` |
| **Admin auth — login** | ✅ Done | Shared login endpoint; role check for admin roles |
| **Admin auth — forgot password** | ✅ Done | `/admin/forgot-password` (portal: admin) |
| **Admin auth — reset password** | ✅ Done | `/admin/reset-password?token=…` |
| **Auth state (Zustand)** | ✅ Done | Persisted session; login / logout |
| **Token auto-refresh** | ✅ Done | Axios interceptor — silent retry on 401 via HttpOnly cookie |
| **Route guards** | ✅ Done | `ProtectedRoute` + `GuestRoute` |
| **Theme / design tokens** | ✅ Done | Blue/white palette; dark/light/system switcher; CSS tokens |
| **Reusable UI components** | ✅ Done | Button, Input, Select, Badge, Card, Spinner, Modal, PageHeader, EmptyState |
| **StudioLayout** | ✅ Done | Collapsible sidebar — icon-only mode, hover tooltips, localStorage persist |

### Milestone 2 — Studio Dashboard (complete + close-out)

| Area | Status | Notes |
|---|---|---|
| **Dashboard (Overview)** | ✅ Done | KPI cards + today's appointments table |
| **Heute (`/studio/today`)** | ✅ Done | Today's appointments table, links to case detail |
| **Customers list** | ✅ Done | Search (debounced), pipeline filter, create modal, pagination |
| **Alle Fälle (`/studio/cases`)** | ✅ Done | Search + status + **ampel filter**, pagination |
| **Case Detail** | ✅ Done | Tattoo intake, intake photos, anamnesis + klaerung/freigabe, signature, sessions, **estimate confirm/adjust**, pricing + lockout |
| **Customer Detail** | ✅ Done | Info + cases table with ampel, appointments, pipeline, **8-step tattoo / 7-step PMU wizard** |
| **Sitzungen (`/studio/sessions`)** | ✅ Done | Search + draft filter, pagination |
| **New Session form** | ✅ Done | Laser params, sliders, payment, draft / finalize |
| **Session Detail** | ✅ Done | Protocol + **KI-Verblassung** (studio % override, photo flags); skip KI on session 1 |
| **Appointments calendar** | ✅ Done | Week grid, lockout-aware booking, **Gruppen-Termin (15% + detail panel)**, pre-session UV/meds check |
| **Analytics** | ✅ Done | Revenue KPIs, charts, pipeline donut, revenue by source, platform fee, shop provision, coins, netto |
| **Settings** | ✅ Done | Theme; pricing; profile, hours, rooms, staff |
| **CRM (`/studio/crm`)** | ✅ Done | Pipeline + list + Aufgaben, notes, tasks, templates |
| **Shop (`/studio/shop`)** | ✅ Done | Order list, shipping status, pagination |
| **Elaycoins page** | ✅ Done | Studio coin overview (read-only) |
| **Customer web portal** | ❌ Out of scope | Mobile app only (M3) |

**Core workflow complete:** customers → cases → appointments (with lockout rules) → sessions → analytics → CRM → shop → settings.

**M2 close-out (2026-07-11 — 2026-07-13):**

| Area | Status | Notes |
|---|---|---|
| **Medical anamnesis** | ✅ Done | 19-question wizard, ampel badge, `CaseAnamnesisPanel` on case detail |
| **Lockout / availability UI** | ✅ Done | `CaseAvailabilityPanel` — Frühestens, sperren list, book link |
| **Pricing on case detail** | ✅ Done | `CasePricingPanel` + `EstimateConfirmationPanel` — confirm / adjust engine estimate |
| **Smart booking UX** | ✅ Done | Appointments modal — earliest date, blocked dates, German errors |
| **Pre-session check** | ✅ Done | UV + medications in booking modal; live availability refresh |
| **Financier demo verified** | ✅ Done | 49-day, 28-day cross-case, Beratung bypass, meds (Retinoide), recalc after booking |

**M2 sign-off:** Studio dashboard + financier demo lockout flow verified locally.

### Milestone 2.5 — Case intake wizard (2026-07-14)

| Area | Status | Notes |
|---|---|---|
| **8-step tattoo wizard** | ✅ Done | `CaseForm` on Customer Detail — TC_01–TC_06 + KI preview + review |
| **Step 1 TC_01 Basics** | ✅ Done | Type, title, body region, zones mode, age, type, cover-up, prior treatment |
| **Step 2 TC_02 Properties** | ✅ Done | Colors, density/saturation/shading/linework, size **or** 2–8 zones |
| **Step 3 TC_03 Skin** | ✅ Done | Fitzpatrick, hyperpig/keloid risk, sun exposure |
| **Step 4 TC_04 Lifestyle** | ✅ Done | Smoker, alcohol, activity, sleep, stress, BMI-related fields |
| **Step 5 TC_05 Goal** | ✅ Done | full / partial / lighten + notes |
| **Step 6 TC_06 Photos** | ✅ Done | `PhotoUploadField` — staging upload, square previews, linked on case create |
| **Step 7 KI · Analyse** | ✅ Done | `POST /cases/pricing/preview` — sessions + CHF estimate (rule-based, not photo AI) |
| **Step 8 Review → save** | ✅ Done | Summary + `POST /cases` with full intake payload |
| **PMU 7-step wizard** | ✅ Done | PMU_01–PMU_06 + review — prototype parity (`pmuIntake.js`, `CaseForm`) |
| **Intake photos on case detail** | ✅ Done | `CaseIntakePhotos` — read-only grid + lightbox via `/files/{id}/content` |
| **Wizard progress UI** | ✅ Done | `CaseWizardProgress` — step dots, scroll reset on step change |
| **Intake constants** | ✅ Done | `src/constants/caseIntake.js` — enums aligned with backend |

**Wizard flow (tattoo):** Customer Detail → **Fall anlegen** → 8 steps → case detail (anamnese there).  
**Wizard flow (PMU):** Customer Detail → **Fall anlegen** → 7 steps → case detail (anamnese + Merkblatt + signature there).

**Docs:** [`docs/CASE-WIZARD-TEST-DATA.md`](../docs/CASE-WIZARD-TEST-DATA.md) · [`docs/CUSTOMER-CASE-INTAKE-SPEC.md`](../docs/CUSTOMER-CASE-INTAKE-SPEC.md)

### Medical / booking parity with prototype (Phases A–E · 2026-07-16)

| Phase | Status | Studio UI | Notes |
|---|---|---|---|
| **A — Inline ampel warnings** | ✅ Done | `AnamnesisWizardModal` live preview | Uses `POST …/anamnesis/preview` |
| **B — Merkblatt + signature** | ✅ Done | `CaseSignaturePanel` + wizard | TC_08/09 on Case Detail |
| **C — Ampel on lists / CRM** | ✅ Done | Cases, Customer Detail, CRM cards/list/tasks | `MedicalAmpelDot` + worst-flag aggregation |
| **D — PS_01 booking pre-check** | ✅ API | — (customer/mobile) | Studio keeps UV/meds `PreSessionCheck` only |
| **E — Klaerung + freigabe** | ✅ Done | `KlaerungPanel` + `FreigabePanel` on Case Detail | Original answers immutable; audit trail |

**After case save (Case Detail):** TC_07 anamnese, TC_08 Merkblatt, TC_09 signature, klaerung/freigabe.

### Milestone 3 — Group booking (2026-07-18)

| Area | Status | Notes |
|---|---|---|
| **Gruppen-Termin modal** | ✅ Done | `GroupBookingModal` — multi tattoo cases, size points (max 4), live 15% price |
| **Live case pricing** | ✅ Done | Falls back to `GET /cases/:id/pricing` when `pricePerSession` unset |
| **Sperrfrist for group** | ✅ Done | Strictest `fruehestes` across selected cases; date `min` + auto-bump |
| **Calendar badge** | ✅ Done | Collapsed **Gruppen (N)** block; stores sibling appts |
| **Group detail panel** | ✅ Done | `GroupDetailModal` — list cases, rabatt, Gesamt; open Akte per case |
| **Config** | ✅ Done | `GET /config/public` → `gruppen_groessen` (`getPublicConfig`) |

**Flow:** Termine → **Gruppen-Termin** → customer → ≥2 tattoo cases → price + lockout → book → calendar → click → detail panel.

### Milestone 3 — Studio transfer / Firmenwechsel (2026-07-20)

| Area | Status | Notes |
|---|---|---|
| **Studio-Wechsel page** | ✅ Done | `/studio/transfers` — inbound + outbound queue, Anfrage / Beitritt / Wechsel dates |
| **Customer detail — transfer banners** | ✅ Done | `transferiert_ein` / `transferiert_aus` alerts + read-only state |
| **Customer detail — Studio-Verlauf** | ✅ Done | Sidebar timeline from `firma_timeline` (`firma_history` with studio names) |
| **Case list / detail badges** | ✅ Done | “Transferiert” on transferred-in cases |
| **Landing page portal switch** | ✅ Done | Logged-in user → dashboard or logout before other portal login |
| **Admin approve/reject UI** | ⏳ M4 | API only until admin dashboard (Swagger for M3 testing) |
| **Email on approve/reject** | ⏳ M4+ | Notify customer + both studios — reuse existing Nodemailer service |

**Flow:** Customer requests via mobile API → admin approves (API) → target studio sees customer + full Akte; source studio sees outgoing row + read-only history.

### Master Excel studio review (IT_Clarifications §8–§10 · 2026-08-19)

Price, sessions, lightening, and healing calculate automatically, but the studio must be able to confirm or correct each result (human-in-the-loop). Customers never see multipliers, weights, or internal scores.

| Area | Status | Notes |
|---|---|---|
| **Estimate confirmation** | ✅ Done | Case Detail — `offen` / `bestaetigt` / `angepasst`; review banner when `estimate_needs_review` |
| **Nachsorge (`/studio/aftercare`)** | ✅ Done | Healing status, red flags, structured symptoms; confirm or correct via `PATCH /nachsorge/:id/review` |
| **Verblassung on Session Detail** | ✅ Done | Internal estimate + studio % / notes; customer % only when comparison is eligible |
| **Kunden-Chat / Elaya FAB** | ✅ Done | `/studio/chat`, `/studio/elaya` |

### Studio-editable rules & multi-location settings (2026-08-29)

Everything that used to be a constant in the code is now editable by the studio and read from the API. Two new Settings tabs cover it.

| Area | Status | Notes |
|---|---|---|
| **Settings → Sperrfristen** (`BookingRulesTab`) | ✅ Done | Blocking periods (same-case, cross-case, UV moderate/intense, medication short/retinoids) and appointment defaults (treatment / consultation / group duration, booking horizon, minimum lead time) |
| **Settings → Standorte** (`LocationsTab`) | ✅ Done | Add / remove branches — name, address, own slot interval (15/30/45/60 or inherit), own buffer, and a bookable (`aktiv`) toggle |
| **Rooms + staff per location** | ✅ Done | `RoomsTab` / `StaffTab` gained a Location select (defaults to "All locations"), shown only once a location exists |
| **Group booking — all three tiers** | ✅ Done | `GroupBookingTab` lists **Klein (1 pt) · Mittelgross (2 pt) · Gross (4 pt)** with the cm² range per tier, editable thresholds, max points, and group discount |
| **Large is bookable alone** | ✅ Done | The Large note explains it always consumes the full point limit. "Large from" edits the *same* stored `mittelgross_max_cm2` threshold, so no unreachable gap can be configured |
| **Point values read-only** | ✅ Done | 1 / 2 / 4 come from the server (`gruppen_punkte`) and are platform-wide — studios tune the cm² thresholds instead |
| **Admin parity** | ✅ Done | `/admin` studio modal (`Studios.jsx`) gained the same Blocking periods, Appointments, and three-tier group sections for any studio |
| **No hardcoded defaults left** | ✅ Done | 50/150/4/15% group defaults, `'09:00'` prefills, `60`-minute durations, and `'10:00'`/`'19:00'` opening hours all now come from the studio |

### Zone-level case tracking (2026-08-29)

| Area | Status | Notes |
|---|---|---|
| **Zone intake measured** | ✅ Done | `CaseForm` zones take **length × width in cm** with a live `= N cm²` readout; the area-template picker (`ZONE_FLAECHEN`) is gone |
| **Zone name required** | ✅ Done | "Zone name" is no longer optional |
| **Photo required per zone** | ✅ Done | Each zone card has its own `PhotoUploadField` (`slot="zone"`) plus the re-photography notice — same area, same angle, every time |
| **Per-zone estimate** | ✅ Done | Each zone card shows its own price/session and session range once saved |
| **Grouping** | ✅ Done | A shared header makes clear the zone cards form **one** tattoo, even though each is treated as its own case |
| **Zone table on Case Detail** | ✅ Done | Photo thumbnail, zone ID, label, body area, cm² (+ L × W), price/session, progress, `sitzungen_erledigt / min–max`, and a **Log session** action |
| **Per-zone session logging** | ✅ Done | `NewSession` has a required Zone select (deep-linkable via `?zonen_id=`), and session number + AI-comparison availability follow the **selected zone**, not the case |
| **Zone on lists** | ✅ Done | `Sessions`, `SessionDetail`, and `Aftercare` all show which zone a record belongs to |
| **Intake prefill** | ✅ Done | Creating a second case for a customer carries over the 15 person-level skin/lifestyle answers, each shown as "Previous answer" with a **Change** link; sun exposure is always re-asked |

### Booking transparency & single socket connection (2026-08-29)

| Area | Status | Notes |
|---|---|---|
| **One socket for the whole dashboard** | ✅ Done | `SocketProvider` + `useSocketEvent` replace per-hook `io()` calls — a studio user held up to 8 connections before, now exactly 1 |
| **Lazy socket bundle** | ✅ Done | `socket.io-client` is dynamically imported on connect, so unauthenticated visitors don't download it |
| **Localized blocking reasons** | ✅ Done | `lockoutReason.js` maps `kategorie` + `tage` + `case_name` onto i18n keys — the German-only `sperre.grund` is no longer rendered |
| **"Why not earlier?"** | ✅ Done | `CaseAvailabilityPanel` lists every active blocking period; the earliest date is always the most restrictive one |
| **Live availability refresh** | ✅ Done | Case panel, booking modal, and group modal subscribe to `studio:availability_changed` (debounced 300 ms) and refresh silently, keeping the last known date if a background refresh fails |
| **Second signature** | ✅ Done | `CaseSignaturePanel` has a third step for tattoo cases — the customer confirms the medical anamnesis is truthful and complete and signs **again**, stored separately |
| **Live price preview** | ✅ Done | `PricingLiveCalculator` on the Pricing tab and in the admin modal — base price → each multiplier → final price, updating as values are typed |

**Live price preview:** debounces 280 ms and calls `POST /config/pricing/preview`, so the number shown is produced by the same engine that quotes customers. It shows **saved → draft** with the CHF delta, dims neutral (× 1) factors so the ones that actually move the price stand out, and flags settings that break the maths — a multiplier of `0` collapses every price it touches and is reported as an error.

### Changelog

```
[2026-06-28] — Initial frontend setup: auth, routing, Zustand store, i18n, layout shells
[2026-06-29] — Theming (blue/white palette, dark/light/system switcher, CSS tokens, FOUC fix)
[2026-06-29] — Landing page redesign; ElayaLogo SVG component
[2026-06-30] — Token auto-refresh interceptor; reusable UI component library
[2026-06-30] — M2: Dashboard overview, Customers list, Customer Detail, Case Detail
[2026-07-01] — M2: New Session form, Session Detail, customer edit modal
[2026-07-01] — Collapsible sidebar with icon-only mode and hover tooltips
[2026-07-01] — Fix: SliderField uncontrolled input (Chrome translate interference)
[2026-07-01] — Fix: Button DOM crash; appointments populate fix
[2026-07-02] — M2: Appointments week-grid calendar; customer appointments section
[2026-07-02] — M2: Analytics page (recharts); Settings (theme, profile, basic pricing)
[2026-07-02] — Route-level code splitting (React.lazy); sidebar collapse DOM stability fixes
[2026-07-02] — Today, Cases, Sessions list pages; Overview link to Heute
[2026-07-03] — Settings fully wired (profile, hours, rooms, staff); view/edit pattern; studio API client
[2026-07-03] — authStore.refreshProfile(); opening hours AM/PM display in settings view mode
[2026-07-06] — M2 complete: CRM (pipeline, tasks, notes, templates), Shop, Elaycoins pages
[2026-07-06] — Analytics: single summary API call; shop/elaycoins optimistic pagination UX
[2026-07-06] — Shared Pagination component; list pagination on Customers, Cases, Sessions, CRM
[2026-07-11] — Studio + admin forgot/reset password pages; auth API wired (portal studio/admin)
[2026-07-11] — Medical anamnesis wizard + panel on case detail (ampel traffic-light)
[2026-07-11] — Case detail: availability + pricing panels; customer name in header
[2026-07-11] — Appointments: lockout-aware booking, pre-session UV/meds, German lockout errors
[2026-07-13] — Financier demo lockout flow re-verified end-to-end
[2026-07-14] — Case intake: 8-step tattoo wizard (CaseForm, CaseWizardProgress, caseIntake constants)
[2026-07-14] — Wizard step 7: KI pricing preview via POST /cases/pricing/preview
[2026-07-14] — TC_06 photos placeholder; selected-option UI contrast in wizard
[2026-07-16] — Phase A–E: signature flow, CRM/list ampel, klaerung + freigabe panels, Freigabe UI fix
[2026-07-17] — PMU 7-step wizard (prototype parity); TC_06/PMU_06 photo upload + case detail gallery; square photo previews; duplicate create toast fix
[2026-07-18] — Studio Gruppen-Termin: multi-case booking, size points, 15% discount, lockout hint, calendar badge + group detail panel
[2026-07-20] — Studio transfer (M3): /studio/transfers queue, customer transfer banners, Studio-Verlauf timeline, case badges, landing portal fix
[2026-08-19] — Estimate confirmation on Case Detail (confirm/adjust AI price + session range)
[2026-08-19] — Nachsorge review UI (`/studio/aftercare`) — confirm/correct healing status
[2026-08-19] — Session Detail: lightening studio override; customers never see internal multipliers
[2026-08-29] — Settings: new Sperrfristen tab (blocking periods + appointment defaults) and Standorte tab (branches)
[2026-08-29] — Settings: group booking shows all three tiers (Klein 1 / Mittelgross 2 / Gross 4) with editable thresholds
[2026-08-29] — Rooms + staff can be assigned to a location; admin studio modal gained the same rules sections
[2026-08-29] — Zone intake: length × width per zone (area derived), required zone name, required per-zone photo + notice, per-zone estimate, group header
[2026-08-29] — Case Detail zone table: photo thumbnail, dimensions, price/session, sessions done, log-session action
[2026-08-29] — NewSession: required zone select (?zonen_id=), session number and KI availability per zone; zone shown on Sessions / SessionDetail / Aftercare
[2026-08-29] — Intake prefill: carry person-level skin/lifestyle answers from the customer's last case with per-question Change
[2026-08-29] — Second signature step: anamnesis truthfulness confirmed and signed separately
[2026-08-29] — Single multiplexed Socket.io connection (SocketProvider + useSocketEvent); socket.io-client dynamically imported
[2026-08-29] — Localized blocking-period reasons (lockoutReason.js) + live availability refresh on case panel and booking modals
[2026-08-29] — PricingLiveCalculator: live base → multipliers → final price with saved/draft delta and config sanity warnings
[2026-08-29] — Removed hardcoded '09:00' prefills, 60-min durations, '10:00'/'19:00' hours, and the zone area templates
[2026-08-29] — Fix: caseForm.ui.prefill copy was missing from the i18n bundles, crashing the wizard when an answer was carried over
```

---

## Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing — portal selector |
| `/studio/login` | Guest only | Studio login |
| `/studio/register` | Guest only | Studio registration |
| `/studio/forgot-password` | Guest only | Forgot password (studio) |
| `/studio/reset-password` | Guest only | Reset password (studio) |
| `/studio/dashboard` | Studio roles | Overview — KPIs + today's appointments |
| `/studio/today` | Studio roles | Today's appointments |
| `/studio/customers` | Studio roles | Customer list |
| `/studio/customers/:id` | Studio roles | Customer detail |
| `/studio/cases` | Studio roles | All cases list |
| `/studio/cases/:id` | Studio roles | Case detail |
| `/studio/sessions` | Studio roles | All sessions list |
| `/studio/sessions/new` | Studio roles | New session form — `?case_id=` and `?zonen_id=` preselect case + zone |
| `/studio/sessions/:id` | Studio roles | Session detail + Verblassung review |
| `/studio/appointments` | Studio roles | Week-grid calendar + single / Gruppen-Termin booking |
| `/studio/analytics` | Studio roles | Revenue KPIs + charts |
| `/studio/aftercare` | Studio roles | Nachsorge checks — healing review / correction |
| `/studio/crm` | Studio roles | CRM lead pipeline (kanban + list) |
| `/studio/activity` | Studio roles | Activity log |
| `/studio/elaya` | Studio roles | Elaya FAB chat |
| `/studio/chat` | Studio roles | Live customer chat |
| `/studio/shop` | Studio roles | ElayShop orders + shipping status |
| `/studio/transfers` | Studio roles | Studio-Wechsel — inbound/outbound transfer queue (read-only) |
| `/studio/elaycoins` | Studio roles | Customer coin balances (read-only) |
| `/studio/settings` | Studio roles | Settings — theme, pricing (live preview), group booking, blocking periods, locations, profile, hours, rooms, staff |
| `/admin/login` | Guest only | Admin login |
| `/admin/forgot-password` | Guest only | Forgot password (admin) |
| `/admin/reset-password` | Guest only | Reset password (admin) |
| `/admin` | Admin roles | Admin dashboard shell |
| `*` | Public | 404 Not Found |

**Guest only:** logged-in users are redirected to their dashboard.  
**Protected:** unauthenticated users are redirected to the portal login page.

---

## Project structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── auth.js              # login, registerStudio, forgot/reset password, getMe, refresh, logout
│   │   ├── anamnesis.js         # get/preview/upsert anamnesis, updateKlaerung, updateStudioFreigabe
│   │   ├── signature.js         # merkblatt, submit signature, signature image
│   │   ├── customers.js         # list, create, get, update
│   │   ├── cases.js             # list, create, get, update, availability, pricing, estimate confirmation
│   │   ├── appointments.js      # list, create, get, update
│   │   ├── sessions.js          # list, create, get, update (incl. lightening_studio_pct)
│   │   ├── nachsorge.js         # list, get, review aftercare checks
│   │   ├── verblassung.js       # POST /verblassung
│   │   ├── config.js            # getPublicConfig, studio pricing / platform config
│   │   ├── studio.js            # studio settings (profile, hours, rooms, staff)
│   │   ├── crm.js               # pipeline, tasks, notes, templates
│   │   ├── shop.js              # shop orders + status
│   │   ├── studioTransfers.js   # list studio transfer requests
│   │   ├── analytics.js         # studio analytics summary
│   │   ├── elaycoins.js         # studio coin overview
│   │   └── files.js             # staging upload, fetch photo blob, delete staging
│   ├── components/
│   │   ├── layout/
│   │   │   ├── StudioLayout.jsx # Sidebar + main (studio theme)
│   │   │   └── AdminLayout.jsx  # Sidebar + main (admin theme)
│   │   ├── forms/
│   │   │   ├── CaseForm.jsx           # 8-step tattoo / 7-step PMU intake wizard
│   │   │   ├── PhotoUploadField.jsx   # Staging photo upload + square preview
│   │   │   └── CaseWizardProgress.jsx # Step indicator + progress bar
│   │   ├── anamnesis/
│   │   │   ├── CaseAnamnesisPanel.jsx
│   │   │   ├── AnamnesisWizardModal.jsx
│   │   │   ├── KlaerungPanel.jsx
│   │   │   └── FreigabePanel.jsx
│   │   ├── signature/
│   │   │   ├── CaseSignaturePanel.jsx
│   │   │   ├── SignatureWizardModal.jsx
│   │   │   └── SignatureCanvas.jsx
│   │   ├── medical/
│   │   │   └── MedicalAmpelDot.jsx
│   │   ├── case/
│   │   │   ├── CaseAvailabilityPanel.jsx # Earliest date + "why not earlier?" (live)
│   │   │   ├── CaseIntakePhotos.jsx     # Read-only intake photo grid on case detail
│   │   │   ├── CasePricingPanel.jsx
│   │   │   └── PreSessionCheck/
│   │   │       ├── PreSessionCheck.jsx      # UV / medication component
│   │   │       └── preSessionCheckFields.js # EMPTY_PRE_SESSION + payload mappers
│   │   ├── pricing/
│   │   │   ├── PricingConfigForm.jsx    # Shared studio + admin pricing form
│   │   │   └── PricingLiveCalculator.jsx # Live base → multipliers → final price
│   │   ├── appointments/
│   │   │   ├── GroupBookingModal.jsx    # Gruppen-Termin create (discount from config)
│   │   │   └── GroupDetailModal.jsx     # Calendar click — sibling cases + total
│   │   ├── GuestRoute.jsx       # Blocks auth pages when logged in
│   │   └── ProtectedRoute.jsx   # Requires auth + allowed role
│   ├── constants/
│   │   ├── roles.js             # STUDIO_ROLES, ADMIN_ROLES
│   │   ├── caseIntake.js        # Wizard steps, intake enums, INITIAL_CASE_FORM
│   │   ├── pmuIntake.js         # PMU wizard enums + step config
│   │   └── studio.js            # WEEKDAYS, MITARBEITER_ROLLEN
│   ├── content/
│   │   ├── de.js                # German UI strings
│   │   ├── en.js                # English UI strings
│   │   └── index.js             # Locale picker (VITE_APP_LOCALE)
│   ├── lib/
│   │   ├── axios.js             # API client + token interceptor
│   │   ├── apiError.js          # Normalized error messages
│   │   ├── socketConnection.js  # Single multiplexed Socket.io manager (lazy import)
│   │   └── authRedirect.js      # Role → dashboard path
│   ├── socket/
│   │   ├── SocketProvider.jsx   # Connects once when authenticated
│   │   └── socketContext.js     # SocketContext + useSocketBus()
│   ├── hooks/
│   │   ├── useSocketEvent.js    # useSocketEvent(event, handler, { debounceMs }) + useSocketStatus
│   │   ├── usePlatformConfigSocket.js # Config / schedule / availability events
│   │   └── useMessagingSocket.js      # Live customer chat
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── studio/
│   │   │   ├── Overview.jsx, Today.jsx, Customers.jsx, CustomerDetail.jsx
│   │   │   ├── Cases.jsx, CaseDetail.jsx, Sessions.jsx, NewSession.jsx, SessionDetail.jsx
│   │   │   ├── Appointments.jsx, Analytics.jsx, Aftercare.jsx, Settings.jsx
│   │   │   ├── Crm.jsx, Shop.jsx, Elaycoins.jsx, Transfers.jsx, Chat.jsx, ElayaChat.jsx, Activity.jsx
│   │   │   └── Login.jsx, Register.jsx, ForgotPassword.jsx, ResetPassword.jsx
│   │   └── admin/
│   │       ├── Login.jsx, ForgotPassword.jsx, ResetPassword.jsx
│   │       └── Dashboard.jsx
│   ├── utils/
│   │   ├── groupBooking.js      # Size points + group pricing helpers
│   │   ├── lockoutReason.js     # Blocking period → localized reason key
│   │   ├── studioHours.js       # Opening hours / exceptions (no fallback times)
│   │   └── time.js              # fmtDateLong(iso, language), …
│   ├── store/
│   │   └── authStore.js         # Zustand — session persist (no Provider needed)
│   ├── styles/                  # Tailwind tokens + component classes
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── scripts/
│   ├── verifySocketMultiplexing.mjs # Asserts one listener per event, not per subscriber
│   └── checkPrefillCopy.mjs         # Asserts the wizard's prefill copy exists in both locales
├── .env                         # Local env (not committed — use .env.example)
├── package.json
└── README.md
```

### Real-time (single connection)

`SocketProvider` wraps the app and opens **one** Socket.io connection once the user is authenticated. Components never call `io()` themselves; they subscribe by event name and the manager keeps exactly one socket-level listener per event, fanning out to every subscriber.

```js
import useSocketEvent, { useSocketStatus } from './hooks/useSocketEvent'

// Bursty events can be collapsed — several bookings in a row cause one refresh.
useSocketEvent('studio:availability_changed', () => refresh(), { debounceMs: 300 })

const connected = useSocketStatus()   // separate, so event-only screens don't re-render on reconnect
```

`socket.io-client` (~40 kB) is dynamically imported inside `connect()`, so it stays out of the initial bundle for unauthenticated visitors. Verify the multiplexing with the backend running:

```bash
npx vite-node scripts/verifySocketMultiplexing.mjs
```

---

## Getting started (local)

### Prerequisites

- Node.js 18+
- [Backend API](../elaya-backend/README.md) running (default `http://localhost:4000`)

### Install & run

```bash
cd elaya-frontend
npm install
cp .env.example .env    # then edit if needed
npm run dev
```

App: `http://localhost:5173`

`.env` already uses `VITE_API_URL=http://localhost:4000/api/v1` for local backend. Keep the API running in `elaya-backend` (`npm run dev`). The customer app is `elaya-mobile` — point `EXPO_PUBLIC_BASE_URL` at the same API (LAN IP for a physical device).

### Environment variables

Create `.env` in the frontend root:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default `http://localhost:4000/api/v1`) |
| `VITE_APP_LOCALE` | UI language: `de` (default) or `en` |

**Production example:**

```env
VITE_API_URL=https://your-api.railway.app/api/v1
VITE_APP_LOCALE=de
```

Ensure the backend `CORS_ORIGINS` includes your deployed frontend URL (e.g. `https://your-app.vercel.app`).

---

## Auth flow

1. User submits login → `POST /auth/login` (shared for studio + admin)
2. Access token stored in Zustand + `localStorage` (`elaya_token` for axios)
3. Profile loaded via `GET /auth/me`
4. Role checked on the client — wrong portal shows an error and logs out
5. Refresh cookie set by backend (HttpOnly) — axios interceptor retries on 401
6. Logout → `POST /auth/logout` + clear local session

**Studio register:** `POST /auth/register/studio` → account status `ausstehend` until admin approval (login blocked until active).

### Dev test credentials

Requires backend `npm run seed:dev`:

| Portal | Email | Password |
|---|---|---|
| Admin | `admin@elaya.ch` | `Admin1234!` |
| Studio | `studio@inkfree.ch` | `Studio1234!` |

---

## Design & i18n

- **Variable names** in code are English; **display values** are in `src/content/de.js` or `en.js`.
- Switch language: set `VITE_APP_LOCALE=en` and restart the dev server.
- Studio nav labels and admin nav labels live in `studioNav` / `adminNav` content sections.
- Prototype reference: `inkderm-prototype/public/studio/index.html`, `inkderm-prototype/public/admin/index.html`.

---

## Build & deploy

```bash
npm run build    # output → dist/
npm run preview  # local preview of production build
```

Static hosting (Vercel, Netlify, Cloudflare Pages, etc.):

1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Add environment variables (`VITE_API_URL`, `VITE_APP_LOCALE`)
4. Configure SPA fallback to `index.html` for client-side routing

---

## Case intake wizard (studio)

Opened from **Customer Detail** → **Fall anlegen**. Tattoo cases use **8 steps**; PMU uses **7 steps** — both aligned with the mobile prototype.

| Step | Code | UI | API |
|---|---|---|---|
| 1 | TC_01 / PMU_01 | Basics | included in final `POST /cases` |
| 2 | TC_02 / PMU_02 | Properties / pretreatment (or 2–8 measured zones) | zone photos via `POST /files/staging` |
| 3 | TC_03 / PMU_03 | Skin / colors | included in final `POST /cases` |
| 4 | TC_04 / PMU_04 | Lifestyle | included in final `POST /cases` |
| 5 | TC_05 / PMU_05 | Goal / prognosis | included in final `POST /cases` |
| 6 | TC_06 / PMU_06 | Fotos | `POST /files/staging` → IDs on `POST /cases` |
| 7 | KI | Analyse · Preisschätzung | `POST /cases/pricing/preview` (tattoo) or create response (PMU) |
| 8 | ✓ | Review → Fall anlegen | `POST /cases` |

After save, **anamnese** (TC_07), **Merkblatt** (TC_08), and **signature** (TC_09) run on **Case Detail** — not inside the create wizard. Intake photos appear read-only via `CaseIntakePhotos`.

### Zoned tattoos (step 2)

A tattoo spread over several body areas is entered as 2–8 zones. Each zone is treated as its own case — own price, own sessions, own fading history — while a shared header keeps it visually one tattoo.

Per zone the studio enters a **name**, body area, colors, density, and **length × width in cm**; the area is calculated automatically. Every zone needs **its own photo**, uploaded with `slot="zone"`, next to a notice explaining that the same area must be photographed from the same angle for every later aftercare entry and session — otherwise healing and fading cannot be compared. Price and session range appear per zone once the case is saved.

### Intake prefill

Opening the wizard for a customer who already has a case calls `GET /cases/intake/prefill` and carries over the 15 person-level skin and lifestyle answers. Carried answers collapse into a **"Previous answer"** row with a **Change** link, so the studio confirms at a glance and edits only what actually changed. Sun exposure is always re-asked because it describes the treated area, and each case still stores the answers valid at its own creation time. If the prefill call fails it is ignored — it never blocks case creation.

### Frontend API calls

```js
import { createCase, previewCasePricing, getCasePricing } from './api/cases'
import { uploadStagingPhoto, fetchPhotoBlobUrl } from './api/files'

// Step 6 — upload before save
const res = await uploadStagingPhoto(file, { customerId, slot: 'main' })
// res.data.data.id → photo_intake_main on POST /cases

// Step 7 — preview before save (no case id yet)
previewCasePricing(intakePayload)

// After save — case detail panel
getCasePricing(caseId)
fetchPhotoBlobUrl(caseData.photo_intake_main)
```

Swagger: [`POST /cases/pricing/preview`](../backend/README.md) · full intake schema in `/api/v1/docs`.

---

## Planned next (M4+)

- **PMU intake card on case detail** — show PMU-specific fields (currently tattoo labels)
- **ElayShop admin product CRUD** — catalog seed + customer APIs done; admin UI in M4
- Admin dashboard pages (M4 — studio approval UI, finance, ElayShop catalog, Studio-Wechsel, …)
- 18+ age validation on customer creation (Swiss law)

---

## Related

- Backend API docs: [elaya-backend/README.md](../elaya-backend/README.md) · Swagger UI `/api/v1/docs` when backend is running
- Customer mobile app: [elaya-mobile/README.md](../elaya-mobile/README.md)
- Master Excel (domain): [masterExcelFile_EN.xlsx](../masterExcelFile_EN.xlsx)
- Case intake spec: [docs/CUSTOMER-CASE-INTAKE-SPEC.md](../docs/CUSTOMER-CASE-INTAKE-SPEC.md)
- Wizard test data: [docs/CASE-WIZARD-TEST-DATA.md](../docs/CASE-WIZARD-TEST-DATA.md)
- Mobile app guide: [MOBILE-APP-DEVELOPER.md](../MOBILE-APP-DEVELOPER.md) — update with backend/frontend READMEs when customer/mobile features change *(local monorepo — not in GitHub)*
- Client spec & prototype notes: [inkderm-prototype/DEVELOPER-HANDOFF.md](../inkderm-prototype/DEVELOPER-HANDOFF.md)
