import {
  boolean,
  index,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    dek: text("dek").notNull().default(""),
    body: text("body").notNull(),
    category: text("category").notNull(),
    imageUrl: text("image_url"),
    sourceName: text("source_name"),
    sourceUrl: text("source_url").unique(),
    isAi: boolean("is_ai").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("articles_category_published_idx").on(table.category, table.publishedAt)],
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  dek TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  source_name TEXT,
  source_url TEXT UNIQUE,
  is_ai BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS articles_category_published_idx
  ON articles (category, published_at DESC);
`;
