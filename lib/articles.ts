import { and, count, desc, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "./db";
import { articles, type Article, type NewArticle } from "./db/schema";

export async function latestArticles(limit: number, offset = 0): Promise<Article[]> {
  const db = await getDb();
  return db
    .select()
    .from(articles)
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function articlesByCategory(
  category: string,
  limit: number,
  offset = 0,
): Promise<Article[]> {
  const db = await getDb();
  return db
    .select()
    .from(articles)
    .where(eq(articles.category, category))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function countByCategory(category: string): Promise<number> {
  const db = await getDb();
  const rows = await db
    .select({ value: count() })
    .from(articles)
    .where(eq(articles.category, category));
  return rows[0]?.value ?? 0;
}

export async function articleBySlug(slug: string): Promise<Article | undefined> {
  const db = await getDb();
  const rows = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return rows[0];
}

export async function articleById(id: number): Promise<Article | undefined> {
  const db = await getDb();
  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return rows[0];
}

export async function relatedArticles(
  category: string,
  excludeId: number,
  limit: number,
): Promise<Article[]> {
  const db = await getDb();
  return db
    .select()
    .from(articles)
    .where(and(eq(articles.category, category), ne(articles.id, excludeId)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function existingSourceUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) return new Set();
  const db = await getDb();
  const rows = await db
    .select({ sourceUrl: articles.sourceUrl })
    .from(articles)
    .where(inArray(articles.sourceUrl, urls));
  return new Set(rows.map((r) => r.sourceUrl).filter((u): u is string => u !== null));
}

export async function insertArticle(data: NewArticle): Promise<Article> {
  const db = await getDb();
  const rows = await db.insert(articles).values(data).returning();
  return rows[0];
}

export async function updateArticle(id: number, data: Partial<NewArticle>): Promise<void> {
  const db = await getDb();
  await db.update(articles).set(data).where(eq(articles.id, id));
}

export async function deleteArticle(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(articles).where(eq(articles.id, id));
}
