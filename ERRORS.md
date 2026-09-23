# Known Issues

Found while getting the site to run locally (`npm run dev` → http://localhost:3000).
Only the white-screen bug was fixed. Everything below is **not fixed**.

## Fixed

- **White screen on load**: `src/App.tsx` `ScrollToTop` used `useEffect(() => window.scrollTo(0, 0), ...)`.
  Recent Chrome versions appear to return a Promise from `window.scrollTo`, so React received it as a cleanup
  function and crashed with `TypeError: destroy is not a function`, unmounting the whole app.
  Changed it to a block body so the effect returns nothing.

## Not fixed

### 1. Security (high priority)
- **`.env` is committed to git** even though `.gitignore` lists it. It holds `JWT_SECRET`,
  `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`, and `FIREBASE_SERVICE_ACCOUNT_KEY`.
  Rotate all of them, then run `git rm --cached .env`.
- **`client_secret_2_...apps.googleusercontent.com.json` is committed to git** (Google OAuth client secret).
  Rotate the secret and remove the file from the repo.
- `src/services/supabase.ts` hardcodes a fallback Supabase URL and anon key.
- `src/services/firebase.ts` hardcodes the Firebase config instead of reading the `VITE_FIREBASE_*` env vars.

### 2. API does not work under `npm run dev`
- The frontend calls `/api/*` (events, gallery, slots, blocked dates, auth, etc.). These are Vercel
  serverless functions in `api/` with rewrites in `vercel.json`, so plain Vite does not serve them.
  The server returns `index.html`, which produces console errors such as
  `Load events error: SyntaxError: Unexpected token '<'` and `Error fetching gallery: ...`.
  Pages render, but their data sections are empty.
  To run the backend locally, use `vercel dev` (Vercel CLI) or add a Vite proxy to a deployed backend.

### 3. Uncommitted dependency changes (`package.json` / `package-lock.json`)
- The working tree has these uncommitted version changes:
  - `firebase-admin` 13 → 14
  - `jspdf` 3 → 4
  - `@vercel/node` 5 → 4 (a downgrade)
  - `sharp` 0.34 → 0.35
- `firebase-admin@14` breaks `api/auth-heavy.ts`: `admin.apps`, `admin.credential`, and `admin.auth`
  no longer exist on the default import (TS2339). This probably breaks the staff-creation endpoint.

### 4. TypeScript errors (`npx tsc --noEmit`, 21 errors; Vite still builds and runs)
- `types.ts` `Event` type is missing `date`, `category`, and `imageUrl`, but they are used in
  `constants.ts`, `src/components/EventCard.tsx`, and `src/utils/calendar.ts`.
- `src/pages/Components.tsx:70,74`: item `type` `"component" | "consumable" | "tool"` does not match
  `IndentItem` `"consumable" | "non-consumable"`.
- `src/components/ErrorBoundary.tsx:68`: `children` is not typed on the class props.
- `migrate-settings.ts` and `tmp/migrate.ts` import `dotenv`, which is not installed.

### 5. `index.html` leftovers (from the AI Studio template)
- An `<script type="importmap">` points `react`, `jspdf`, `pg`, `fs`, `@vercel/node`, `jsonwebtoken`, etc.
  at CDNs. Vite bundles from `node_modules`, so this is unused at best and could load
  duplicate or server-only packages at worst.
- `jspdf` and `jspdf-autotable` are also loaded from cdnjs as `<script>` tags (v2.5.1 / 3.5.29), which
  duplicates the npm versions (v4 / v5).
- `<link rel="stylesheet" href="/index.css">` points to a file that does not exist (404).
- Tailwind is loaded from `cdn.tailwindcss.com`. The browser warns that this is not meant for production.

### 6. Misc
- `vite.config.ts` defines `process.env.GEMINI_API_KEY` / `API_KEY`, but no such key is in `.env`
  (probably another template leftover).
- The project root has many one-off scripts (`check-staff.cjs`, `fix-ambassador.cjs`, `migrate-fix.cjs`,
  `provision-staff.cjs`, `test-staff.cjs`, `check_db.js`, `migrate-settings.*`).
