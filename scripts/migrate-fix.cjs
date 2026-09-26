const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgres://postgres:postgres@localhost:5432/idea_lab" });

async function main() {
  try {
    console.log("Adding employee_id column...");
    await pool.query("ALTER TABLE staff ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50)");
    
    console.log("Updating ambassador account...");
    const res = await pool.query(
      "UPDATE staff SET role = 'AMBASSADOR', employee_id = 'AMB001' WHERE email = 'ambassador@idealab.reva.edu.in'"
    );
    console.log("Updated rows:", res.rowCount);
    
    const check = await pool.query("SELECT * FROM staff WHERE email = 'ambassador@idealab.reva.edu.in'");
    console.log("Current state:", JSON.stringify(check.rows[0], null, 2));
    
  } catch (err) {
    console.error("Migration/Update failed:", err);
  } finally {
    await pool.end();
  }
}

main();
