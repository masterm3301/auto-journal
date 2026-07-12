import { describe, expect, it } from "vitest";
import { filterNew, normalizeItem, type RawFeedItem } from "../lib/pipeline/normalize";

const base: RawFeedItem = {
  title: "  خبر مهم اليوم  ",
  link: "https://example.ma/news/1",
  contentSnippet: "نص الخبر المختصر",
  pubDate: "Sat, 11 Jul 2026 10:00:00 GMT",
};

describe("normalizeItem", () => {
  it("normalizes a basic item and trims the title", () => {
    const item = normalizeItem(base, "هسبريس");
    expect(item).not.toBeNull();
    expect(item!.title).toBe("خبر مهم اليوم");
    expect(item!.link).toBe("https://example.ma/news/1");
    expect(item!.sourceName).toBe("هسبريس");
    expect(item!.publishedAt).toBeInstanceOf(Date);
  });

  it("returns null when title or link is missing", () => {
    expect(normalizeItem({ ...base, title: undefined }, "س")).toBeNull();
    expect(normalizeItem({ ...base, link: undefined }, "س")).toBeNull();
  });

  it("picks the image from enclosure, then media:content", () => {
    const withEnclosure = normalizeItem(
      { ...base, enclosure: { url: "https://img.example/a.jpg" } },
      "س",
    );
    expect(withEnclosure!.imageUrl).toBe("https://img.example/a.jpg");

    const withMedia = normalizeItem(
      { ...base, mediaContent: { $: { url: "https://img.example/b.jpg" } } },
      "س",
    );
    expect(withMedia!.imageUrl).toBe("https://img.example/b.jpg");
  });

  it("strips HTML tags from the snippet and caps its length", () => {
    const item = normalizeItem(
      { ...base, content: "<p>فقرة <b>مهمة</b> جدا</p>", contentSnippet: undefined },
      "س",
    );
    expect(item!.snippet).toBe("فقرة مهمة جدا");

    const long = normalizeItem({ ...base, contentSnippet: "ا".repeat(1000) }, "س");
    expect(long!.snippet.length).toBeLessThanOrEqual(600);
  });
});

describe("filterNew", () => {
  const items = [
    normalizeItem({ ...base, link: "https://a.ma/1" }, "س")!,
    normalizeItem({ ...base, link: "https://a.ma/2" }, "س")!,
    normalizeItem({ ...base, link: "https://a.ma/2" }, "س")!, // duplicate within batch
  ];

  it("drops items whose link already exists and in-batch duplicates", () => {
    const fresh = filterNew(items, new Set(["https://a.ma/1"]));
    expect(fresh.map((i) => i.link)).toEqual(["https://a.ma/2"]);
  });

  it("keeps everything when nothing exists", () => {
    const fresh = filterNew(items, new Set());
    expect(fresh.map((i) => i.link)).toEqual(["https://a.ma/1", "https://a.ma/2"]);
  });
});
