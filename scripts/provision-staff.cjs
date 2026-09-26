const { Pool } = require("pg");
const pool = new Pool({ connectionString: "postgres://postgres:postgres@localhost:5432/idea_lab" });

async function main() {
  const email = 'ambassador@idealab.reva.edu.in';
  const uid = 'XKeC6O5sWUX6VklhJmIdcC2uYe42';
  try {
    // Check if user exists
    const check = await pool.query("SELECT * FROM staff WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      await pool.query("UPDATE staff SET firebase_uid = $1, role = 'staff' WHERE email = $2", [uid, email]);
      console.log('Staff updated successfully');
    } else {
      await pool.query("INSERT INTO staff (name, email, firebase_uid, role) VALUES ('Ambassador', $1, $2, 'staff')", [email, uid]);
      console.log('Staff inserted successfully');
    }
  } catch (err) {
    console.error('Operation failed:', err);
  } finally {
    await pool.end();
  }
}

main();
