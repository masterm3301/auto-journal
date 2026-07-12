# ماجد (Majid)

An Arabic-language (RTL) Moroccan news site that runs itself: a scheduled pipeline pulls headlines from Moroccan RSS feeds, rewrites each story into an original Arabic article with an LLM (Groq free tier), and publishes it automatically — with source attribution on every article. A minimal password-protected admin lets a human write, edit, or delete articles.

Design spec: `docs/superpowers/specs/2026-07-12-majid-news-site-design.md`

## Stack

- **Next.js 15** (App Router, TypeScript) + Tailwind v4, fully RTL
- **Postgres** via Drizzle ORM — Neon in production (`DATABASE_URL`), embedded [PGlite](https://pglite.dev) locally (zero setup, data in `.pglite/`)
- **Groq** (`llama-3.3-70b-versatile`, OpenAI-compatible API called via plain `fetch`, JSON mode) for article rewriting — free tier
- **GitHub Actions** cron (every 30 min) triggering `/api/cron/ingest`

## Local development

```bash
npm install
cp .env.example .env      # set ADMIN_PASSWORD and CRON_SECRET; leave DATABASE_URL empty
npm run seed              # inserts 14 Arabic sample articles into the local PGlite db
npm run dev               # http://localhost:3000
```

Useful commands:

| Command | What it does |
|---|---|
| `npm run seed` | Insert sample articles (idempotent) |
| `npm run feeds:check` | Dry-run the RSS half of the pipeline — no Claude calls, no DB writes |
| `npm test` | Unit tests for the pipeline's pure logic |
| `npm run build` | Production build |

To run the full pipeline locally, set `GROQ_API_KEY` in `.env` (free key at [console.groq.com](https://console.groq.com)), then:

```bash
curl -X POST http://localhost:3000/api/cron/ingest \
  -H "Authorization: Bearer $CRON_SECRET"
```

The response is a run summary: `{feedsOk, feedsFailed, candidates, published, errors}`.

## How the pipeline works

1. Every 30 minutes the GitHub Actions workflow (`.github/workflows/ingest.yml`) calls `POST /api/cron/ingest` with the `CRON_SECRET` bearer token.
2. The route fetches all feeds in `lib/feeds.ts` (a dead feed never blocks the run), normalizes items, drops anything whose source URL is already in the database, and drops near-identical titles within the batch — re-running is always safe.
3. A cheap curation call (`lib/pipeline/select.ts`) shows the model the recently published headlines plus the candidates and asks which are genuinely **new, distinct events** — this is what stops the same story arriving from three outlets under different headlines. If the call fails, the pipeline falls back to "take the newest 5".
4. Up to **5** picked items per run are rewritten by Groq's `llama-3.3-70b-versatile` into original Arabic articles (title, dek, body, category, slug) and published immediately with `is_ai = true` and a link to the original source.
5. A failed item (including a Groq rate-limit hit) is simply retried on a later run, because it never entered the database.

Cost: **$0**. At 48 runs/day × 5 articles the pipeline makes at most 240 Groq requests/day, well inside the free tier; Vercel, Neon, and GitHub Actions also fit free tiers.

## Production setup (Vercel + Neon + GitHub Actions)

1. **Neon**: create a free Postgres database, copy the connection string.
2. **Vercel**: import this repo; set environment variables:
   - `DATABASE_URL` — the Neon connection string
   - `GROQ_API_KEY` — free from console.groq.com
   - `ADMIN_PASSWORD` — for `/admin`
   - `CRON_SECRET` — any long random string
   The `articles` table is created automatically on first use.
3. **GitHub repository secrets** (Settings → Secrets → Actions):
   - `APP_URL` — your deployed URL, e.g. `https://majid.vercel.app`
   - `CRON_SECRET` — same value as on Vercel
4. Push to GitHub. The workflow runs every 30 minutes (or trigger it manually from the Actions tab via *Run workflow*).

> Vercel's own cron is once-a-day on the free plan, which is why the schedule lives in GitHub Actions. Any external cron (e.g. cron-job.org) works the same way — just call the endpoint with the bearer secret.

## Admin

- `/admin` — article list with edit/delete (login with `ADMIN_PASSWORD`)
- `/admin/new` — write a manual article (published as `is_ai = false`, no source line)

## Configuration points

- `lib/feeds.ts` — RSS sources
- `lib/categories.ts` — the 7 sections (سياسة، اقتصاد، رياضة، مجتمع، ثقافة، دولي، تكنولوجيا)
- `lib/pipeline/rewrite.ts` — provider, model, and prompt (this one file is all that changes to swap LLM providers later)
- `lib/pipeline/ingest.ts` — per-run article cap (`MAX_PER_RUN`)
