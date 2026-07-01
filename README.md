# Elaya Frontend (Web)

Web UI for the Elaya platform — **Studio Dashboard** and **Admin Dashboard**.  
Customer experience is **mobile-only** (separate project); the landing page links to it as a placeholder.

**Stack:** React 19 · Vite 8 · React Router 7 · Tailwind CSS v4 · Zustand · Axios · React Hot Toast · Lucide React  
**Design source:** `inkderm-prototype/` (colors, layout, nav structure)  
**API:** Connects to [Elaya Backend API](../backend/README.md) at `/api/v1`  
**Last updated:** 2026-07-01

---

## Current progress

### Milestone 1 — Auth & shell (complete)

| Area | Status | Notes |
|---|---|---|
| **Landing page** | ✅ Done | Portal picker — Customer App (placeholder), Studio, Admin |
| **Routing** | ✅ Done | React Router — public, protected, guest, nested, 404 |
| **Studio auth — login** | ✅ Done | Wired to `POST /auth/login` + `GET /auth/me` |
| **Studio auth — register** | ✅ Done | Wired to `POST /auth/register/studio` |
| **Studio auth — forgot password** | ⏳ Placeholder | No backend route yet |
| **Admin auth — login** | ✅ Done | Shared login endpoint; role check for admin roles |
| **Auth state (Zustand)** | ✅ Done | Persisted session; login / logout |
| **Token auto-refresh** | ✅ Done | Axios interceptor — silent retry on 401 via HttpOnly cookie |
| **Route guards** | ✅ Done | `ProtectedRoute` + `GuestRoute` |
| **Theme / design tokens** | ✅ Done | Blue/white palette; dark/light/system switcher; CSS tokens |
| **Reusable UI components** | ✅ Done | Button, Input, Select, Badge, Card, Spinner, Modal, PageHeader, EmptyState |
| **StudioLayout** | ✅ Done | Collapsible sidebar — icon-only mode, hover tooltips, localStorage persist |

### Milestone 2 — Studio Dashboard pages (~70% complete)

| Area | Status | Notes |
|---|---|---|
| **Dashboard (Overview)** | ✅ Done | KPI cards + today's appointments table |
| **Customers list** | ✅ Done | Search (debounced), pipeline filter, create modal |
| **Customer Detail** | ✅ Done | Info card + edit modal, cases table, pipeline stage, notes |
| **Case Detail** | ✅ Done | Anamnesis, sessions log, status sidebar, progress bar |
| **New Session form** | ✅ Done | Laser params, sliders, payment, draft / finalize |
| **Session Detail** | ✅ Done | Read-only view; finalize draft button |
| **Appointments calendar** | ❌ Pending | |
| **Analytics** | ❌ Pending | Revenue, coins, shop |
| **Settings** | ❌ Pending | Pricing, hours, rooms, staff, profile |
| **Customer web portal** | ❌ Out of scope | Mobile app only |

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
```

---

## Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing — portal selector |
| `/studio/login` | Guest only | Studio login |
| `/studio/register` | Guest only | Studio registration |
| `/studio/forgot-password` | Guest only | Placeholder (not implemented) |
| `/studio` | Studio roles | Studio dashboard (Overview) |
| `/studio/customers` | Studio roles | Customer list |
| `/studio/customers/:id` | Studio roles | Customer detail |
| `/studio/cases/:id` | Studio roles | Case detail |
| `/studio/sessions/new` | Studio roles | New session form |
| `/studio/sessions/:id` | Studio roles | Session detail |
| `/studio/appointments` | Studio roles | Appointments (pending) |
| `/studio/analytics` | Studio roles | Analytics (pending) |
| `/studio/settings` | Studio roles | Settings (pending) |
| `/admin/login` | Guest only | Admin login |
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
│   │   └── auth.js              # login, registerStudio, getMe, refresh, logout
│   ├── components/
│   │   ├── layout/
│   │   │   ├── StudioLayout.jsx # Sidebar + main (studio theme)
│   │   │   └── AdminLayout.jsx  # Sidebar + main (admin theme)
│   │   ├── GuestRoute.jsx       # Blocks auth pages when logged in
│   │   └── ProtectedRoute.jsx   # Requires auth + allowed role
│   ├── constants/
│   │   └── roles.js             # STUDIO_ROLES, ADMIN_ROLES
│   ├── content/
│   │   ├── de.js                # German UI strings
│   │   ├── en.js                # English UI strings
│   │   └── index.js             # Locale picker (VITE_APP_LOCALE)
│   ├── lib/
│   │   ├── axios.js             # API client + token interceptor
│   │   ├── apiError.js          # Normalized error messages
│   │   └── authRedirect.js      # Role → dashboard path
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── studio/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── Dashboard.jsx
│   │   └── admin/
│   │       ├── Login.jsx
│   │       └── Dashboard.jsx
│   ├── store/
│   │   └── authStore.js         # Zustand — session persist (no Provider needed)
│   ├── styles/                  # Tailwind tokens + component classes
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                         # Local env (not committed — use .env.example)
├── package.json
└── README.md
```

---

## Getting started (local)

### Prerequisites

- Node.js 18+
- [Backend API](../backend/README.md) running (default `http://localhost:4000`)

### Install & run

```bash
cd frontend
npm install
cp .env.example .env    # then edit if needed
npm run dev
```

App: `http://localhost:5173`

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
5. Refresh cookie set by backend (HttpOnly) — auto-refresh not wired yet
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

## Planned next (not in this release)

- Studio: Appointments calendar
- Studio: Analytics (revenue, coins, shop)
- Studio: Settings (pricing, hours, rooms, staff, profile)
- Admin dashboard pages (studio approval, finance, Elaycoins, …)
- Forgot / reset password (when backend route exists)
- 18+ age validation on customer creation (Swiss law)

---

## Related

- Backend API docs: [backend/README.md](../backend/README.md)
- Client spec & prototype notes: [inkderm-prototype/DEVELOPER-HANDOFF.md](../inkderm-prototype/DEVELOPER-HANDOFF.md)
