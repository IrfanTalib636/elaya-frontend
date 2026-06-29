# Elaya Frontend (Web)

Web UI for the Elaya platform — **Studio Dashboard** and **Admin Dashboard**.  
Customer experience is **mobile-only** (separate project); the landing page links to it as a placeholder.

**Stack:** React 19 · Vite 8 · React Router 7 · Tailwind CSS v4 · Zustand · Axios · React Hot Toast · Lucide React  
**Design source:** `inkderm-prototype/` (colors, layout, nav structure)  
**API:** Connects to [Elaya Backend API](../backend/README.md) at `/api/v1`  
**Last updated:** 2026-06-28

---

## Current progress

| Area | Status | Notes |
|---|---|---|
| **Landing page** | ✅ Done | Portal picker — Customer App (placeholder), Studio, Admin |
| **Routing** | ✅ Done | React Router — public, protected, guest, and 404 routes |
| **Studio auth — login** | ✅ Done | Wired to `POST /auth/login` + `GET /auth/me` |
| **Studio auth — register** | ✅ Done | Wired to `POST /auth/register/studio` |
| **Studio auth — forgot password** | ⏳ Placeholder | No backend route yet |
| **Admin auth — login** | ✅ Done | Shared login endpoint; role check for admin roles |
| **Auth state (Zustand)** | ✅ Done | Persisted session; login / logout |
| **Route guards** | ✅ Done | `ProtectedRoute` + `GuestRoute` (logged-in users skip auth pages) |
| **404 page** | ✅ Done | Catch-all route |
| **i18n content** | ✅ Done | `content/de.js` + `content/en.js` via `VITE_APP_LOCALE` |
| **Toast notifications** | ✅ Done | Success/error — bilingual `toast` strings |
| **Studio dashboard shell** | ✅ Done | Sidebar + main content (headings only) |
| **Admin dashboard shell** | ✅ Done | Sidebar + main content (headings only) |
| **Theme / design tokens** | ✅ Done | Studio + admin palettes from prototype |
| **Customer web portal** | ❌ Out of scope | Mobile app only |
| **Dashboard feature pages** | ❌ Pending | Cases, calendar, customers, finance, etc. |
| **Token auto-refresh** | ❌ Pending | `POST /auth/refresh` exists in API layer, not wired in UI |

### Changelog

```
[2026-06-28] — Initial frontend README
[2026-06-28] — Landing page (prototype layout)
[2026-06-28] — Studio + admin login/register wired to backend auth API
[2026-06-28] — Zustand auth store, axios client, protected/guest routes
[2026-06-28] — i18n content (de/en), toast messages, 404 page
[2026-06-28] — Studio + admin dashboard layout shells (sidebar nav from prototype)
```

---

## Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing — portal selector |
| `/studio/login` | Guest only | Studio login |
| `/studio/register` | Guest only | Studio registration |
| `/studio/forgot-password` | Guest only | Placeholder (not implemented) |
| `/studio` | Studio roles | Studio dashboard shell |
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

- Studio dashboard pages (customers, cases, calendar, …)
- Admin dashboard pages (studio approval, finance, Elaycoins, …)
- Wire `POST /auth/refresh` before access token expiry
- Forgot / reset password (when backend routes exist)
- Admin staff user management (`admin` role vs `super_admin`)

---

## Related

- Backend API docs: [backend/README.md](../backend/README.md)
- Client spec & prototype notes: [inkderm-prototype/DEVELOPER-HANDOFF.md](../inkderm-prototype/DEVELOPER-HANDOFF.md)
