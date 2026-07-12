import Parser from "rss-parser";
import { existingSourceUrls, insertArticle, latestArticles } from "../articles";
import { FEEDS } from "../feeds";
import {
  dedupeSimilar,
  filterNew,
  normalizeItem,
  type NormalizedItem,
  type RawFeedItem,
} from "./normalize";
import { fetchOgImage } from "./og-image";
import { rewriteItem } from "./rewrite";
import { selectCandidates } from "./select";
import { fallbackSlug } from "./validate";

export interface RunSummary {
  feedsOk: number;
  feedsFailed: number;
  candidates: number;
  published: number;
  errors: string[];
}

// 4 articles × ~2.5K tokens fits Groq's free-tier 12K tokens/minute budget;
// 5 consistently trips it and stalls the run on retry waits.
const MAX_PER_RUN = 4;

// The GitHub Actions curl gives up at 290s and Vercel kills the function at
// 300s — stop starting new rewrites well before that. Deferred items are
// simply picked up by the next run.
const RUN_DEADLINE_MS = 180_000;

const parser = new Parser({
  timeout: 15000,
  headers: {
    // Some Moroccan outlets 403 datacenter traffic with a bot-ish UA;
    // a browser-like one passes.
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

async function fetchFeed(name: string, url: string): Promise<NormalizedItem[]> {
  const feed = await parser.parseURL(url);
  return (feed.items ?? [])
    .map((item) => normalizeItem(item as RawFeedItem, name))
    .filter((item): item is NormalizedItem => item !== null);
}

export async function runIngest(): Promise<RunSummary> {
  const startedAt = Date.now();
  const deadlineAt = startedAt + RUN_DEADLINE_MS;
  const summary: RunSummary = {
    feedsOk: 0,
    feedsFailed: 0,
    candidates: 0,
    published: 0,
    errors: [],
  };

  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f.name, f.url)));
  const items: NormalizedItem[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      summary.feedsOk++;
      items.push(...result.value);
    } else {
      summary.feedsFailed++;
      summary.errors.push(`feed ${FEEDS[i].name}: ${String(result.reason).slice(0, 200)}`);
    }
  });

  // Newest first so the freshest stories win the per-run quota.
  items.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));

  const existing = await existingSourceUrls(items.map((i) => i.link));
  const fresh = dedupeSimilar(filterNew(items, existing));
  summary.candidates = fresh.length;

  const recentTitles = (await latestArticles(30)).map((article) => article.title);
  const picked = await selectCandidates(fresh, recentTitles, MAX_PER_RUN, deadlineAt);

  for (const item of picked) {
    if (Date.now() > deadlineAt) {
      summary.errors.push("run deadline reached — remaining items deferred to the next run");
      break;
    }
    try {
      const rewrite = await rewriteItem(item, deadlineAt);
      const imageUrl = item.imageUrl ?? (await fetchOgImage(item.link));
      await insertArticle({
        // A slug collision with an unrelated older article shouldn't kill the
        // insert — fall back to a unique generated slug.
        slug: rewrite.slug,
        title: rewrite.title,
        dek: rewrite.dek,
        body: rewrite.body,
        category: rewrite.category,
        imageUrl,
        sourceName: item.sourceName,
        sourceUrl: item.link,
        isAi: true,
        publishedAt: item.publishedAt ?? new Date(),
      }).catch(async (err) => {
        if (String(err).includes("articles_slug_unique") || String(err).includes("duplicate key")) {
          await insertArticle({
            slug: fallbackSlug(),
            title: rewrite.title,
            dek: rewrite.dek,
            body: rewrite.body,
            category: rewrite.category,
            imageUrl,
            sourceName: item.sourceName,
            sourceUrl: item.link,
            isAi: true,
            publishedAt: item.publishedAt ?? new Date(),
          });
        } else {
          throw err;
        }
      });
      summary.published++;
    } catch (err) {
      summary.errors.push(`item ${item.link}: ${String(err).slice(0, 200)}`);
    }
  }

  return summary;
}
