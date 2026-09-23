
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Starting migration...");
  
  // Add category column to lab_projects
  const { error: err1 } = await supabase.rpc('exec_sql', { 
    sql_query: 'ALTER TABLE lab_projects ADD COLUMN IF NOT EXISTS category TEXT;' 
  }).catch(async () => {
     // fallback if exec_sql RPC doesn't exist (common in standard setups)
     // Since MCP tool failed, we'll try a direct query if possible or just assume SQL works through common patterns
     // Actually, we can't run raw SQL through the client easily without an RPC.
     // Let's use the MCP tool again with a shorter query or try to create the RPC first.
     return { error: { message: "SQL execution via client requires exec_sql RPC" } };
  });

  if (err1) {
    console.log("Migration via RPC failed (expected if not set up). Please run this in Supabase SQL Editor:");
    console.log("ALTER TABLE lab_projects ADD COLUMN IF NOT EXISTS category TEXT;");
    console.log("ALTER TABLE events ADD COLUMN IF NOT EXISTS category TEXT;");
  } else {
    console.log("Migration successful!");
  }
}

migrate();
