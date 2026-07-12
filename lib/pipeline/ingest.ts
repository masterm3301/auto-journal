import Parser from "rss-parser";
import { existingSourceUrls, insertArticle } from "../articles";
import { FEEDS } from "../feeds";
import { filterNew, normalizeItem, type NormalizedItem, type RawFeedItem } from "./normalize";
import { rewriteItem } from "./rewrite";
import { fallbackSlug } from "./validate";

export interface RunSummary {
  feedsOk: number;
  feedsFailed: number;
  candidates: number;
  published: number;
  errors: string[];
}

const MAX_PER_RUN = 5;

const parser = new Parser({
  timeout: 15000,
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
  const fresh = filterNew(items, existing);
  summary.candidates = fresh.length;

  for (const item of fresh.slice(0, MAX_PER_RUN)) {
    try {
      const rewrite = await rewriteItem(item);
      await insertArticle({
        // A slug collision with an unrelated older article shouldn't kill the
        // insert — fall back to a unique generated slug.
        slug: rewrite.slug,
        title: rewrite.title,
        dek: rewrite.dek,
        body: rewrite.body,
        category: rewrite.category,
        imageUrl: item.imageUrl,
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
            imageUrl: item.imageUrl,
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
