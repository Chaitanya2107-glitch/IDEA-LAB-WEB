const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/idea_lab' });

async function update() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query('UPDATE staff SET password_hash = $1 WHERE email = $2', [hash, 'admin@idealab.com']);
    console.log('Password hash updated successfully!');
  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    pool.end();
  }
}

update();
