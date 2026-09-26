const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgres://postgres:postgres@localhost:5432/idea_lab" });

async function main() {
  try {
    const res = await pool.query(
      "UPDATE staff SET role = 'AMBASSADOR', employeeId = 'AMB001' WHERE email = 'ambassador@idealab.reva.edu.in'"
    );
    console.log("Updated rows:", res.rowCount);
  } catch (err) {
    console.error("Update failed:", err);
  } finally {
    await pool.end();
  }
}

main();
