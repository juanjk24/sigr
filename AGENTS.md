# AGENTS.md

SIGR (Sistema Integral de Gestión de Restaurante) — monorepo with a `backend/` (Express + TypeScript + Prisma/PostgreSQL) API and a `frontend/` (React + Vite) SPA. Docs, changelog, and CI comments are in Spanish. Main branch only; Conventional Commits (`feat:`, `fix:`, ...).

## Backend is scaffold-only — do not assume it works
- **Every file under `backend/src/` and `prisma/schema.prisma` is an empty (0-byte) stub.** There is no implemented API, no Express wiring, no Prisma models, no database config, and no tests yet. If a task involves backend behavior, you are building it from scratch.
- `backend/package.json` only defines `dev` (`node --watch index.ts`), `start`, and `test` (which errors out). There is **no lockfile** in either package.

## Scripts do not match CI (known discrepancy)
`.github/workflows/ci-cd.yml` runs, in `backend/`: `npm run lint`, `npx tsc --noEmit`, `npm test -- --coverage` (needs a Postgres service at `DATABASE_URL`), and `npm run build`; both packages use `npm ci` (requires a lockfile). **None of these backend scripts exist yet** and no lockfile is committed. Don't be surprised when these fail; fixing them is unfinished work.

## Frontend is functional but missing declared dependencies
- `frontend/src/services/api.ts` imports `axios` and `frontend/src/routes/*` import `react-router` (incl. `react-router-dom`), but **neither is in `frontend/package.json`**. A fresh `npm install` won't provide them, so `npm run build` fails. Add them to dependencies before relying on a clean install/build.
- Frontend scripts: `npm run dev` (Vite), `npm run build` (`tsc -b && vite build`), `npm run lint` (ESLint flat config).
- API base URL from `VITE_API_BASE_URL`, defaulting to `http://localhost:3000/api`; JWT kept in `localStorage` key `token`, sent as `Authorization: Bearer`.
- Backend dev on `:3000`, frontend dev on `:5173`.

## Environment setup (backend)
Needed to run the backend: `.env` in `backend/` with `PORT`, `DATABASE_URL` (PostgreSQL >= 15), `JWT_SECRET`. Requires Node >= 20.
