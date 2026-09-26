const { Pool } = require("pg");
const fs = require("fs");

const pool = new Pool({ connectionString: "postgres://postgres:postgres@localhost:5432/idea_lab" });

async function main() {
  try {
    const res = await pool.query("SELECT * FROM staff WHERE email = 'ambassador@idealab.reva.edu.in'");
    fs.writeFileSync('staff_check_result.json', JSON.stringify(res.rows, null, 2));
    console.log("Results written to staff_check_result.json");
  } catch (err) {
    console.error("Error querying staff table:", err);
  } finally {
    await pool.end();
  }
}

main();
