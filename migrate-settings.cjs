// migrate-settings.cjs
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function migrate() {
  console.log("🚀 Starting migration...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Creating lab_settings table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS lab_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Ensuring slot_bookings table has rejection_reason...");
    await client.query(`
      ALTER TABLE slot_bookings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `);

    console.log("Inserting default settings if not exists...");
    await client.query(`
      INSERT INTO lab_settings (key, value)
      VALUES ('general', '{"openingTime": "09:00", "closingTime": "17:00", "slotDuration": 60}'::jsonb)
      ON CONFLICT (key) DO NOTHING;
    `);

    await client.query("COMMIT");
    console.log("✅ Migration completed successfully!");
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

migrate();
