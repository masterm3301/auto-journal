export interface RawFeedItem {
  title?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  pubDate?: string;
  isoDate?: string;
  enclosure?: { url?: string };
  mediaContent?: { $?: { url?: string } };
  mediaThumbnail?: { $?: { url?: string } };
}

export interface NormalizedItem {
  title: string;
  snippet: string;
  link: string;
  imageUrl: string | null;
  publishedAt: Date | null;
  sourceName: string;
}

const MAX_SNIPPET = 600;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function pickImage(raw: RawFeedItem): string | null {
  const candidates = [
    raw.enclosure?.url,
    raw.mediaContent?.$?.url,
    raw.mediaThumbnail?.$?.url,
  ];
  for (const url of candidates) {
    if (url && /^https?:\/\//.test(url)) return url;
  }
  const inline = raw.content?.match(/<img[^>]+src=["']([^"']+)["']/);
  if (inline && /^https?:\/\//.test(inline[1])) return inline[1];
  return null;
}

export function normalizeItem(raw: RawFeedItem, sourceName: string): NormalizedItem | null {
  const title = raw.title?.trim();
  const link = raw.link?.trim();
  if (!title || !link) return null;

  const snippetSource = raw.contentSnippet ?? raw.content ?? "";
  const snippet = stripHtml(snippetSource).slice(0, MAX_SNIPPET);

  const dateString = raw.isoDate ?? raw.pubDate;
  let publishedAt: Date | null = null;
  if (dateString) {
    const parsed = new Date(dateString);
    if (!Number.isNaN(parsed.getTime())) publishedAt = parsed;
  }

  return { title, snippet, link, imageUrl: pickImage(raw), publishedAt, sourceName };
}

export function filterNew(
  items: NormalizedItem[],
  existing: Set<string>,
): NormalizedItem[] {
  const seen = new Set(existing);
  const fresh: NormalizedItem[] = [];
  for (const item of items) {
    if (seen.has(item.link)) continue;
    seen.add(item.link);
    fresh.push(item);
  }
  return fresh;
}
