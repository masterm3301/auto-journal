import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SCHEMA_SQL } from "./schema";

export type Db = PostgresJsDatabase<Record<string, never>>;

const globalStore = globalThis as unknown as { __majidDb?: Promise<Db> };

async function createDb(): Promise<Db> {
  let db: Db;
  if (process.env.DATABASE_URL) {
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const postgres = (await import("postgres")).default;
    const client = postgres(process.env.DATABASE_URL, { max: 5 });
    db = drizzle(client);
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const client = new PGlite(".pglite");
    db = drizzle(client) as unknown as Db;
  }
  for (const statement of SCHEMA_SQL.split(";")) {
    if (statement.trim()) await db.execute(sql.raw(statement));
  }
  return db;
}

export function getDb(): Promise<Db> {
  if (!globalStore.__majidDb) {
    globalStore.__majidDb = createDb();
  }
  return globalStore.__majidDb;
}
