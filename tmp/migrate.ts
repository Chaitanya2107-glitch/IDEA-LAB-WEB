
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
});

async function runMigration() {
  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected successfully.");

    console.log("Updating lab_projects table...");
    await client.query(`
      ALTER TABLE lab_projects 
      ADD COLUMN IF NOT EXISTS category TEXT,
      ADD COLUMN IF NOT EXISTS image TEXT,
      ADD COLUMN IF NOT EXISTS video TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS long_description TEXT,
      ADD COLUMN IF NOT EXISTS author TEXT,
      ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS date TEXT,
      ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);
    console.log("lab_projects table updated.");

    console.log("Updating events table...");
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS banner_image TEXT,
      ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Workshop',
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Upcoming',
      ADD COLUMN IF NOT EXISTS start_date TEXT,
      ADD COLUMN IF NOT EXISTS end_date TEXT,
      ADD COLUMN IF NOT EXISTS start_time TEXT,
      ADD COLUMN IF NOT EXISTS end_time TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'AICTE IDEA Lab',
      ADD COLUMN IF NOT EXISTS max_attendees INTEGER DEFAULT 50,
      ADD COLUMN IF NOT EXISTS category TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);
    console.log("events table updated.");

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
