# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build — run this to verify TypeScript and catch errors
npm run lint      # ESLint via next lint
npm start         # Serve production build
```

There are no tests. If the dev server was previously running, the `.next` cache may be stale after dependency upgrades — delete `.next/` before restarting.

## Architecture

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, date-fns. No backend — all data lives in `localStorage`.

### Data layer (`lib/`)

- `lib/types.ts` — shared interfaces: `Student`, `AttendanceRecord`, `AttendanceStatus` (`"present" | "absent" | "late" | "excused"`), `DashboardStats`.
- `lib/store.ts` — all CRUD for students and attendance records via `localStorage`. Keys: `sa_students`, `sa_attendance`. On first load, seeds from mock data automatically. Every function guards against SSR with `typeof window !== "undefined"`.
- `lib/mockData.ts` — 8 seeded students and a `generateMockAttendance()` function that creates ~30 weekdays of randomised records. Called once by `store.ts` when `localStorage` is empty.
- `lib/auth.ts` — hardcoded teacher credentials (3 accounts, all password `teacher123`), session stored under `sa_session` in `localStorage`. Exports `login()`, `logout()`, `getSession()`, `isAuthenticated()`, `DEMO_ACCOUNTS`.

### Auth flow

`app/layout.tsx` renders only `<AppShell>` (no sidebar, no structure of its own).

`components/AppShell.tsx` is a client component that runs on every page load:
- If `pathname === "/login"` → renders children full-screen with no sidebar.
- Otherwise → checks `isAuthenticated()`. If falsy, redirects to `/login`. If truthy, renders `<Sidebar>` + the main content area.

This means **all routes except `/login` are protected client-side**. There is no middleware or server-side auth.

### Styling conventions

Tailwind utility classes are used everywhere. `app/globals.css` defines reusable `@layer components` classes that must be used consistently:

| Class | Usage |
|---|---|
| `.card` | White rounded container with shadow |
| `.btn-primary` | Blue filled button |
| `.btn-secondary` | White/outlined button |
| `.btn-danger` | Red filled button |
| `.input` | Form input / select |
| `.label` | Form label |
| `.badge-present/absent/late/excused` | Coloured status pills |

Use `<StatusBadge status={...} />` (not bare badge classes) when rendering attendance status in tables.

### IDs

Student IDs use prefix `s` + number (mock data). New students get `generateId()` from `store.ts` which returns `${Date.now()}-${randomAlphanumeric}`. Attendance record IDs follow the same pattern.

### Windows / ESM note

The project is on an `E:` drive. `postcss.config.js` must stay as CommonJS (`module.exports`), not `.mjs`, because Next.js's bundled postcss-loader uses `import()` with raw Windows paths which Node.js rejects as an unsupported URL scheme when using ESM. This is the reason the project uses Next.js 15 (14 had this bug unfixed).
