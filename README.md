# Manifest — Freight Rate Ledger

A minimal full-stack app for logging and viewing ocean freight rates by route and carrier.
Built as a portfolio project demonstrating Next.js (App Router, TypeScript) + FastAPI +
SQLAlchemy, in the spirit of a 24-hour build.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy, Pydantic v2
- **Database:** SQLite (single file, zero setup — swap the connection string for Postgres in production)
- **Auth:** none (prototype scope)

## Features

- `GET /rates` — list all logged freight rates, most recent first
- `POST /rates` — log a new rate (origin/destination port, carrier, container type, rate, currency, valid date)
- A ledger-style list view (`/`) and a create form (`/new`)

## Running locally

**Backend**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

This creates `freight.db` (SQLite) in the `backend/` folder on first run.

**Frontend**

In a separate terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local   # confirm NEXT_PUBLIC_API_BASE points at your backend
npm run dev
```

Visit `http://localhost:3000`.

## Deployment

**Backend → Railway or Fly.io**

1. Push this repo to GitHub.
2. On Railway: New Project → Deploy from GitHub → select the `backend` folder as root.
3. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Note the deployed URL (e.g. `https://your-app.up.railway.app`).
5. For Fly.io instead: `fly launch` inside `backend/`, then `fly deploy`. Add a `fly.toml`
   with the same start command.
6. SQLite is fine for a demo but doesn't persist across redeploys on most platforms — for
   anything beyond a portfolio demo, switch `SQLALCHEMY_DATABASE_URL` in `database.py` to a
   managed Postgres instance (Railway and Fly both offer one-click Postgres add-ons).

**Frontend → Vercel**

1. Import the repo into Vercel, set the project root to `frontend`.
2. Add an environment variable: `NEXT_PUBLIC_API_BASE` = your deployed backend URL.
3. Deploy. Vercel auto-detects Next.js.

**CORS**

`main.py` currently allows only `http://localhost:3000`. Add your deployed frontend's
Vercel URL to `allow_origins` in `backend/main.py` before going live.

## Project structure

```
freight-tracker/
├── backend/
│   ├── main.py          # FastAPI app, routes, CORS
│   ├── models.py        # SQLAlchemy ORM model
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── database.py       # Engine + session setup
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── layout.tsx    # Shared chrome, fonts
    │   ├── page.tsx      # Ledger list (server component)
    │   ├── new/page.tsx  # Create-rate form (client component)
    │   └── globals.css   # Design tokens (navy/brass ledger theme)
    └── lib/api.ts        # Typed fetch helpers
```

## Notes on scope

Deliberately excluded per the 24-hour build constraint: authentication, migrations tooling
(Alembic), state management libraries, and CI/CD. These are natural next additions once the
core loop is proven out.
