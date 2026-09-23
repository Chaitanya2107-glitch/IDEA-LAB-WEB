// api/_handlers/lib/db.ts
import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export const getPool = () => {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
};

export const query = async (text: string, params?: any[]) => {
  const p = getPool();
  return p.query(text, params);
};
