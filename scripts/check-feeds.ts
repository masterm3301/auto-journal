// Dry run of the ingest pipeline's fetch/normalize half — no Claude calls,
// no database writes. Useful for checking that the configured RSS feeds are
// alive and parseable: `npm run feeds:check`
import Parser from "rss-parser";
import { FEEDS } from "../lib/feeds";
import { normalizeItem, type NormalizedItem, type RawFeedItem } from "../lib/pipeline/normalize";

const parser = new Parser({
  timeout: 15000,
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

async function main() {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items ?? [])
        .map((item) => normalizeItem(item as RawFeedItem, feed.name))
        .filter((item): item is NormalizedItem => item !== null);
      return {
        name: feed.name,
        items: items.length,
        withImage: items.filter((item) => item.imageUrl).length,
        newest: items[0]?.title?.slice(0, 60) ?? "(none)",
      };
    }),
  );

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      const r = result.value;
      console.log(`OK   ${r.name}: ${r.items} items (${r.withImage} with image) — ${r.newest}`);
    } else {
      console.log(`FAIL ${FEEDS[i].name}: ${String(result.reason).slice(0, 120)}`);
    }
  });
  process.exit(0);
}

main();
