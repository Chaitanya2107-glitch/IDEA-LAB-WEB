
const { Client } = require('pg');

const client = new Client({
  host: 'db.hbfelcsjdyzijxvmgvqf.supabase.co',
  port: 5432,
  user: 'postgres.hbfelcsjdyzijxvmgvqf',
  password: 'iCqG2grQOMjzKJel',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function inspect() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position;
    `);
    console.log("COLUMNS:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Inspection failed:", err);
  } finally {
    await client.end();
  }
}

inspect();
