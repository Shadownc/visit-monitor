import { createClient } from '@libsql/client'

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

// 初始化表
export async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS page_views (
      url TEXT PRIMARY KEY,
      pv_count INTEGER DEFAULT 0,
      uv_count INTEGER DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS visitors (
      visitor_id TEXT,
      url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (visitor_id, url)
    )
  `);
}