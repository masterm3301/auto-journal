# Majid (مجيد) — Automated Moroccan News Site — Design

**Date:** 2026-07-12
**Status:** Approved (user approved architecture/pipeline; requested direct build for the rest)

## What it is

An Arabic-language (RTL) Moroccan news website named **مجيد (Majid)** with the look and feel of a serious American broadsheet site (Washington Post-style density and typography, original branding — no WaPo trademarks). It runs hands-free: a scheduled pipeline ingests Moroccan news via RSS, rewrites each story into an original Arabic article with the Claude API, and publishes automatically. An admin can also write, edit, and delete articles manually.

## Decisions made with the user

- **Language:** Arabic only, full RTL layout.
- **Content:** AI-rewritten original articles (never republish source text verbatim); every article links to its source.
- **Ingestion:** RSS feeds only (Hespress, Alyaoum24, Le360 عربية, SNRT News, Hibapress — configurable list). No news API.
- **Hosting:** Vercel + hosted Postgres (Neon free tier). External cron (GitHub Actions schedule) because Vercel free cron is once/day.
- **Admin:** minimal — password-protected write/edit/delete. AI articles publish with no review step.
- **Architecture:** one Next.js app (approach A) — public site, admin, and pipeline route in a single codebase.

## Architecture

- **Framework:** Next.js (App Router, TypeScript), Tailwind CSS.
- **Database:** Postgres via Drizzle ORM. Driver chosen at runtime in `lib/db.ts`:
  - `DATABASE_URL` set → `postgres` (postgres.js) — Neon in production.
  - unset → embedded PGlite (`@electric-sql/pglite`) persisted to `.pglite/` — zero-setup local dev.
- **AI:** `@anthropic-ai/sdk`, model `claude-haiku-4-5` (cheap; ~$0.30–0.60/day at 50–80 articles).
- **Scheduler:** GitHub Actions workflow every 30 min curls `POST /api/cron/ingest` with `Authorization: Bearer $CRON_SECRET`.

## Pipeline (`/api/cron/ingest`)

1. Fetch all feeds in `lib/feeds.ts` with `Promise.allSettled` (a dead feed never blocks the run).
2. Normalize items (title, snippet, link, image from enclosure/media tags, pubDate).
3. Dedupe: skip any item whose `source_url` already exists in `articles`.
4. Take up to **5** new items per run (serverless time limits).
5. Per item, one Claude call returns strict JSON: `{title, dek, body (markdown, 250–400 words), category, slug (latin)}`. The prompt: veteran Moroccan journalist, write an original Arabic news article from the given headline+snippet, do not invent specifics not present in the input.
6. Insert with `is_ai = true`, source attribution, image URL. A failed item is skipped and naturally retried next run (it never entered the DB).
7. Respond with a run summary: `{feedsOk, feedsFailed, candidates, published, errors[]}`.

**No `ANTHROPIC_API_KEY`:** the route returns 503 with a clear message (no silent degradation).

## Data model

`articles`: `id` (serial PK), `slug` (unique), `title`, `dek`, `body` (markdown), `category` (enum below), `image_url?`, `source_name?`, `source_url?` (unique, nullable), `is_ai` (bool), `published_at`, `created_at`. Index `(category, published_at desc)`.

**Categories (7):** politics/سياسة, economy/اقتصاد, sports/رياضة, society/مجتمع, culture/ثقافة, world/دولي, tech/تكنولوجيا.

## Pages

- `/` — homepage: masthead ("مجيد", Arabic display font, date line, thin black rules), sections nav, lead story (large image + headline + dek), headline column, latest-news rail, then one bordered block per category (lead + 3 headlines). Empty-state safe.
- `/section/[category]` — category page, paginated list.
- `/article/[slug]` — big headline, dek, meta line (category, time in `ar-MA`, «المصدر: …» link), ~680px reading column, related articles from same category.
- `/admin` — password form → httpOnly cookie (SHA-256 of `ADMIN_PASSWORD`); article list with delete; `/admin/new` and `/admin/edit/[id]` forms. Manual articles get `is_ai = false`, no source.
- `/api/cron/ingest` — POST, Bearer `CRON_SECRET`.

**Typography:** Aref Ruqaa (masthead), Noto Naskh Arabic (headlines + article body), IBM Plex Sans Arabic (nav, labels, meta) via `next/font/google`. Plain `<img>` tags (RSS images come from arbitrary hosts; avoids the image optimizer).

**Caching:** home/section/article use `revalidate = 300`; admin routes dynamic; mutations call `revalidatePath`.

## Error handling

- Per-feed and per-item try/catch in the pipeline; errors collected into the run summary, never thrown across items.
- Dedupe by unique `source_url` makes ingest idempotent — safe to re-run any time.
- Broken/missing images fall back to a per-category placeholder.
- Wrong cron secret → 401; missing env → explicit 5xx with message.

## Testing & verification

- Vitest unit tests for pipeline pure logic: item normalization, dedupe filtering, Claude-response validation/parsing, slug fallback.
- End-to-end local check: seed script (`scripts/seed.ts`, ~14 sample articles), `next build`, run server, curl `/`, a section, an article, admin login flow, and the ingest route with a mocked feed.

## Environment

`DATABASE_URL` (prod), `ANTHROPIC_API_KEY`, `ADMIN_PASSWORD`, `CRON_SECRET`. `.env.example` + README with Vercel/Neon/GitHub-Actions setup steps.

## Out of scope (v1)

Search, comments, newsletters, dark mode, bilingual content, image storage, AI-article review queue, analytics.
