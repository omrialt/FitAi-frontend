# FitAi — Frontend

Web client for **FitAi**, a training and nutrition tracking platform for
athletes, personal trainers, and their clients. Users build and follow training
and nutrition plans, log sets, track body measurements over time, and see it all
on a weekly schedule that syncs both ways with Google Calendar.

Built with **React 19**, **TypeScript**, **Vite 7**, **Mantine v8** and
**Tailwind CSS v4**, fully bilingual (English / Hebrew) with RTL support.

- **Live app:** https://fitai-jade.vercel.app
- **API:** https://fitai-backend.vercel.app ([repo](https://github.com/omrialt/FitAi-backend))

---

## Features

- **Dashboard** — one landing route that renders a public marketing hero for
  guests and the personal dashboard for signed-in users.
- **Training plans** — weekly plans broken into days, exercises and sets;
  per-set history logging, plan sharing, cloning and activation.
- **Nutrition plans** — meals and macro targets, sharing, ratings, activation.
- **Physical data** — weight, body fat, height and waist over time, with charts
  and derived BMI/progress.
- **Weekly schedule** — training days and Google Calendar events side by side;
  connect and disconnect Google from the app.
- **Trainer ↔ client** — trainers invite clients, manage a client list, and
  share plans; clients accept or decline invitations.
- **Admin** — user management with search, filters and pagination.
- **Auth** — email/password and Google OAuth, password reset, profile
  completion, silent access-token refresh on 401.
- **Exports** — training and nutrition plans to PDF (`jspdf`) and Excel (`xlsx`).
- **i18n / RTL** — 808 English and 836 Hebrew keys, kept key-for-key in sync;
  layout, icons, dates and validation messages all follow the active language.
- **Responsive** — desktop layouts plus a mobile bottom nav and card-based
  variants of every table-heavy screen.

## Tech stack

| | |
| --- | --- |
| Framework | React 19 (React Compiler enabled), Vite 7 |
| Language | TypeScript 5.9 |
| UI | Mantine v8, Tailwind CSS v4, Radix primitives, Tabler icons |
| Routing | React Router 7 |
| State | Zustand (auth, UI, pending invites) |
| Forms | React Hook Form + Zod via `@hookform/resolvers` |
| Data | Axios with interceptors |
| Charts / tables | Recharts, TanStack Table |
| i18n | i18next + react-i18next, browser language detection |
| Extras | framer-motion, dnd-kit, sonner (toasts), date-fns |
| Hosting | Vercel |

---

## Getting started

**Prerequisites:** Node.js 20+ and npm. The [backend](https://github.com/omrialt/FitAi-backend)
must be running (locally or deployed) for anything past the landing page.

```bash
npm install
cp .env.example .env    # then set VITE_API_URL
npm run dev
```

The dev server runs at `http://localhost:5173`.

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the FitAi API, no trailing slash. `http://localhost:3000` locally. |

> Vite inlines `import.meta.env.*` at **build** time. `VITE_API_URL` must be set
> in the hosting environment *before* the build runs — changing it afterwards
> has no effect until you redeploy. `src/config/env.ts` is the single place it
> is read, and it logs a loud error if the variable is missing in a production build.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

---

## Project structure

```
src/
├── App.tsx               # route table
├── main.tsx              # providers, Mantine theme, document direction
├── pages/                # one component per route
├── components/
│   ├── AppLayout.tsx  LandingHero.tsx  MobileBottomNav.tsx  ProtectedRoute.tsx
│   ├── admin/  auth/  calendar/  common/
│   └── dashboard/  nutrition/  profile/  trainings/
├── services/             # one axios module per API domain
├── hooks/                # useApi, useAuth, useFormHandler, useCalendar, exports…
├── store/                # Zustand stores
├── schemas/              # Zod form schemas (messages are i18n keys)
├── types/                # shared TypeScript types
├── i18n/locales/         # en.json / he.json
├── styles/               # theme.css (design tokens) + per-area CSS
└── config/env.ts         # resolved environment
```

### Routing

`/` is deliberately unguarded — it shows the landing hero to guests and the
dashboard to signed-in users. `/complete-profile` and `/auth/google/callback`
are also unguarded, because the OAuth redirect lands there with tokens in the
URL that the page itself stores.

| Route | Access |
| --- | --- |
| `/` | Public (dual-purpose) |
| `/login`, `/register` | Public, redirect when already signed in |
| `/reset-password`, `/complete-profile`, `/auth/google/callback` | Public |
| `/my-trainings`, `/training-plans/:id` | Authenticated |
| `/nutrition-plans`, `/nutrition-plans/:id` | Authenticated |
| `/physical-data`, `/schedule`, `/profile` | Authenticated |
| `/clients` | `trainer`, `admin` |
| `/users` | `admin` |

---

## Conventions

A few patterns are load-bearing — following them keeps the app consistent:

- **All user-facing copy goes through `t()`**, into *both* locale files. Use full
  dotted keys (`t('trainings.foo')`) and `<Trans>` for embedded markup. Module-level
  option arrays and label maps must live inside the component (or take `t` as a
  parameter) so they re-render on a language switch.
- **Validation messages are i18n keys.** Zod schemas in `src/schemas/` carry keys
  rather than sentences, and `useFormHandler` maps every error message through
  `t()` at one choke point.
- **RTL:** prefer logical properties — `ms-*` / `me-*`, `start-*` / `end-*`,
  `marginInlineStart` — over left/right. Directional Tabler icons are mirrored by
  a single CSS rule under `[dir='rtl']` in `index.css`, so new call sites are
  covered automatically.
- **Design tokens** live in `src/styles/theme.css` and are wired into Tailwind v4
  via `@theme`. A `@custom-variant dark` maps Tailwind's `dark:` onto Mantine's
  `data-mantine-color-scheme` attribute — without it, `dark:` classes compile but
  never fire.
- **API access goes through `src/services/`**, never `axios` directly from a
  component. The shared instance handles auth headers and the 401 refresh retry.
- The mobile breakpoint is **768px** (`md`), matching the app's
  `useMediaQuery("(max-width: 768px)")` checks.

## Deployment

Deployed on Vercel. `vercel.json` rewrites every non-asset path to `index.html`
(without it, deep links 404 on refresh) and marks hashed assets `immutable`.

Two things to remember when deploying:

- `VITE_API_URL` must be set for the **production** environment specifically,
  before the build — a preview-only value will not reach the production bundle.
- The webfont `@import` must stay at the very top of `src/index.css`, above
  `@import "tailwindcss"`. Tailwind's Vite plugin inlines its import in place,
  so anything below it ends up after thousands of rules and browsers discard a
  late `@import`.
