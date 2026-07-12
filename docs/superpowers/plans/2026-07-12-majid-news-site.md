# Majid (مجيد) News Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fully automatic Arabic (RTL) Moroccan news site with a WaPo-style UI, an RSS → Claude-rewrite → publish pipeline, and a minimal password-protected admin.

**Architecture:** One Next.js App Router app. Postgres via Drizzle with a runtime driver switch (postgres.js when `DATABASE_URL` is set, embedded PGlite otherwise). Pipeline is `/api/cron/ingest`, triggered by a GitHub Actions cron. Claude Haiku 4.5 rewrites items via structured outputs.

**Tech Stack:** Next.js 15, TypeScript, Tailwind v4, Drizzle ORM, postgres.js, @electric-sql/pglite, @anthropic-ai/sdk, rss-parser, Vitest.

## Global Constraints

- Language: Arabic only; `<html lang="ar" dir="rtl">` everywhere.
- Site name: **مجيد** (Majid). No Washington Post trademarks, logos, or slogans.
- Categories (slug → Arabic): politics→سياسة, economy→اقتصاد, sports→رياضة, society→مجتمع, culture→ثقافة, world→دولي, tech→تكنولوجيا.
- Model: `claude-haiku-4-5` (user-approved for cost). Structured outputs via `output_config.format` json_schema. No `thinking` param.
- Pipeline: max **5** rewrites per run; dedupe on unique `source_url`; per-feed and per-item try/catch; run summary JSON response.
- Plain `<img>` tags (arbitrary RSS image hosts), per-category placeholder fallback.
- Env vars: `DATABASE_URL` (optional locally), `ANTHROPIC_API_KEY`, `ADMIN_PASSWORD`, `CRON_SECRET`.
- Fonts: Aref Ruqaa (masthead), Noto Naskh Arabic (headlines/body), IBM Plex Sans Arabic (UI/meta) via `next/font/google`.
- Article `body` is plain Arabic paragraphs separated by blank lines (no markdown); rendered as `<p>` elements (React-escaped, no HTML injection).

---

### Task 1: Scaffold Next.js app

**Files:** Create `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx` (minimal shell), `app/page.tsx` (placeholder), `.gitignore`, `.env.example`.

- [ ] Write configs manually (directory name "auto journal" breaks create-next-app's npm-name validation); package name `majid`.
- [ ] Deps: `next react react-dom drizzle-orm postgres @electric-sql/pglite @anthropic-ai/sdk rss-parser`; dev: `typescript @types/* tailwindcss @tailwindcss/postcss vitest tsx`.
- [ ] `npm install`, `npm run build` passes with placeholder page.
- [ ] Commit.

### Task 2: Data layer

**Files:** Create `lib/categories.ts`, `lib/db/schema.ts`, `lib/db/index.ts`, `lib/articles.ts`, `scripts/seed.ts`.

**Interfaces (produced):**
- `CATEGORIES: {slug, name}[]`, `categoryName(slug): string`, `CategorySlug` union type.
- `articles` table: `id serial PK, slug text unique, title text, dek text, body text, category text, imageUrl text?, sourceName text?, sourceUrl text? unique, isAi boolean, publishedAt timestamptz, createdAt timestamptz`.
- `getDb(): Promise<Db>` — postgres.js driver when `DATABASE_URL` set, else PGlite persisted at `.pglite/`; runs `CREATE TABLE IF NOT EXISTS` once per process (`ensureSchema`).
- `lib/articles.ts`: `latestArticles(limit, offset?)`, `articlesByCategory(slug, limit, offset?)`, `articleBySlug(slug)`, `relatedArticles(category, excludeId, limit)`, `existingSourceUrls(urls: string[]): Promise<Set<string>>`, `insertArticle(data)`, `updateArticle(id, data)`, `deleteArticle(id)`, `articleById(id)`, `countByCategory(slug)`.

- [ ] Implement schema + driver-switching client (globalThis-cached instance).
- [ ] Seed script inserts ~14 Arabic sample articles across all 7 categories (picsum image URLs), skipping if slug exists. `npm run seed` runs it via tsx.
- [ ] Run seed against PGlite; verify row count via a quick tsx query.
- [ ] Commit.

### Task 3: Pipeline core (pure logic) + tests

**Files:** Create `lib/feeds.ts`, `lib/pipeline/normalize.ts`, `lib/pipeline/validate.ts`, `tests/normalize.test.ts`, `tests/validate.test.ts`, `vitest.config.ts`.

**Interfaces (produced):**
- `FEEDS: {name, url}[]` — Hespress, Alyaoum24, Le360 عربية, SNRT News, Hibapress.
- `normalizeItem(raw, feedName): NormalizedItem | null` — extracts `{title, snippet (HTML-stripped, ≤600 chars), link, imageUrl?, publishedAt?, sourceName}`; returns null when title or link missing.
- `filterNew(items, existing: Set<string>): NormalizedItem[]` — drops items whose link is in `existing`; also dedupes within the batch.
- `validateRewrite(json: unknown): Rewrite | null` — checks `{title, dek, body, category ∈ slugs, slug}`; normalizes slug to `[a-z0-9-]`, falls back to `khabar-<base36 time>` when empty.

Test cases (write first, watch fail, implement, watch pass):

```ts
// normalize: picks enclosure url, strips <b> tags from snippet, null on missing link
// filterNew: removes existing source_url, dedupes duplicate links in batch
// validateRewrite: accepts valid object; rejects bad category; slug "Économie 2024!" → "conomie-2024"; empty slug → khabar- prefix
```

- [ ] `npx vitest run` green.
- [ ] Commit.

### Task 4: Claude rewriter + ingest route + scheduler

**Files:** Create `lib/pipeline/rewrite.ts`, `lib/pipeline/ingest.ts`, `app/api/cron/ingest/route.ts`, `.github/workflows/ingest.yml`.

**Interfaces:**
- `rewriteItem(item: NormalizedItem): Promise<Rewrite>` — one `client.messages.create` call, model `claude-haiku-4-5`, `max_tokens: 3000`, `output_config: {format: {type: "json_schema", schema: REWRITE_SCHEMA}}`; system prompt: veteran Moroccan Arabic journalist, write original 250–400-word article from headline+snippet only, plain paragraphs, no fabricated specifics; JSON parsed then `validateRewrite`.
- `runIngest(): Promise<RunSummary>` — Promise.allSettled over feeds → normalize → filterNew against `existingSourceUrls` → take 5 → sequential rewrite+insert with per-item try/catch → `{feedsOk, feedsFailed, candidates, published, errors[]}`; calls `revalidatePath` on `/` and affected sections.
- Route: `POST` (and `GET` for manual testing) — 401 unless `Authorization: Bearer ${CRON_SECRET}`; 503 when `ANTHROPIC_API_KEY` unset; else run and return summary. `export const maxDuration = 300`.
- Workflow: `schedule: cron "*/30 * * * *"` + `workflow_dispatch`; curls `${{ secrets.APP_URL }}/api/cron/ingest` with `${{ secrets.CRON_SECRET }}`.

- [ ] Error handling per claude-api skill: catch `Anthropic.APIError` chain; item failures recorded in summary, never abort the run.
- [ ] Verify: `curl` the route locally — 401 without secret; with secret and no API key → 503; with key (if available) → real run, else mock-feed test via unit-level call.
- [ ] Commit.

### Task 5: Public UI (WaPo-style RTL)

**Files:** Create `components/Masthead.tsx`, `components/NavBar.tsx`, `components/Footer.tsx`, `components/ArticleCard.tsx`, `components/ArticleImage.tsx`, `lib/format.ts` (Arabic relative time via `Intl.RelativeTimeFormat("ar")`); rewrite `app/layout.tsx`, `app/page.tsx`; create `app/section/[category]/page.tsx`, `app/article/[slug]/page.tsx`, `app/not-found.tsx`.

Layout spec: white masthead, "مجيد" centered in Aref Ruqaa ~56px, Arabic date line above, 2px black rule below; nav bar of 7 sections + الرئيسية, thin bottom border, sticky; homepage grid (12-col): lead story (cols ~7, large image, 32px headline, dek), headline stack beside it (5 headline+thumb rows with hairline dividers), "آخر الأخبار" rail; below, one bordered block per category (section title linking to section page, lead card + 3 text headlines). Section page: title + list of cards, "المزيد" pagination via `?page=`. Article page: category label, 36px headline, dek, meta line (time + «المصدر: X» external link when present), image with caption strip, 680px max-width body of `<p>`s, related articles block. All pages `revalidate = 300`. Empty states render gracefully.

- [ ] Build + run dev server, curl `/`, a section, an article — 200s with seeded content.
- [ ] Commit.

### Task 6: Admin

**Files:** Create `lib/auth.ts`, `app/admin/page.tsx`, `app/admin/actions.ts`, `app/admin/login/page.tsx`, `app/admin/new/page.tsx`, `app/admin/edit/[id]/page.tsx`, `components/AdminForm.tsx`.

- `lib/auth.ts`: `isAdmin()` reads `majid_admin` cookie === sha256(ADMIN_PASSWORD); `login(password)` sets httpOnly cookie (30d); `logout()`.
- `/admin`: redirects to `/admin/login` when not authed; lists latest 50 articles with edit/delete buttons (server actions, `revalidatePath` after mutation).
- New/edit form: title, dek, body (textarea), category select, image URL; manual articles `isAi=false`, slug generated from timestamp if absent. All admin routes `dynamic = "force-dynamic"`.

- [ ] Verify with curl/dev server: login sets cookie, unauthenticated `/admin` redirects, create + delete round-trip works.
- [ ] Commit.

### Task 7: Docs + final verification

**Files:** Create `README.md`; finalize `.env.example`.

- [ ] README: what it is, local dev (`npm i && npm run seed && npm run dev`), production setup (Neon `DATABASE_URL`, Vercel env vars, GitHub secrets `APP_URL`/`CRON_SECRET`), how the pipeline works, admin usage.
- [ ] `npx vitest run` green; `npm run build` clean; dev-server smoke test of all pages.
- [ ] Commit.
