// Some feeds (اليوم24, هبة بريس) carry no image at all. Every news site
// declares an og:image for social sharing, so when a feed item has no image
// we fetch the article page once and use that.

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export function extractOgImage(html: string): string | null {
  const match =
    html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  const url = match?.[1];
  return url && /^https?:\/\//.test(url) ? url : null;
}

export async function fetchOgImage(pageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(pageUrl, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    if (!response.ok) return null;
    const html = (await response.text()).slice(0, 300_000);
    return extractOgImage(html);
  } catch {
    return null;
  }
}
