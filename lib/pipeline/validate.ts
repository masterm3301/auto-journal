import { isCategorySlug } from "../categories";

export interface Rewrite {
  title: string;
  dek: string;
  body: string;
  category: string;
  slug: string;
}

export function fallbackSlug(): string {
  return `khabar-${Date.now().toString(36)}${Math.floor(Math.random() * 36).toString(36)}`;
}

export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Response shape for the curation step: {"keep": [indices]}. Returns the
// valid, deduplicated indices (capped at `max`), or null when the shape is
// wrong entirely.
export function validateSelection(
  json: unknown,
  candidateCount: number,
  max: number,
): number[] | null {
  if (typeof json !== "object" || json === null) return null;
  const keep = (json as Record<string, unknown>).keep;
  if (!Array.isArray(keep)) return null;
  const indices: number[] = [];
  for (const value of keep) {
    if (!Number.isInteger(value)) continue;
    const index = value as number;
    if (index < 0 || index >= candidateCount || indices.includes(index)) continue;
    indices.push(index);
    if (indices.length >= max) break;
  }
  return indices;
}

export function validateRewrite(json: unknown): Rewrite | null {
  if (typeof json !== "object" || json === null) return null;
  const obj = json as Record<string, unknown>;

  const title = typeof obj.title === "string" ? obj.title.trim() : "";
  const dek = typeof obj.dek === "string" ? obj.dek.trim() : "";
  const body = typeof obj.body === "string" ? obj.body.trim() : "";
  const category = typeof obj.category === "string" ? obj.category : "";
  if (!title || !body || !isCategorySlug(category)) return null;

  const rawSlug = typeof obj.slug === "string" ? obj.slug : "";
  const slug = normalizeSlug(rawSlug) || fallbackSlug();

  return { title, dek, body, category, slug };
}
