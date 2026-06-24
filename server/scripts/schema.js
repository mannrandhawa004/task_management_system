import { pool } from '../src/config/db.js';

async function checkSchema() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('--- TABLES ---');
    console.log(tables);

    const [attendance] = await pool.query('DESCRIBE attendance');
    console.log('\n--- ATTENDANCE TABLE ---');
    console.log(attendance);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkSchema();
