import { pool } from '../src/config/db.js';

async function migrate2FA() {
  try {
    console.log('--- Checking and Adding 2FA Columns to users table ---');
    
    // Check if columns already exist
    const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'two_factor_secret'");
    if (columns.length === 0) {
      console.log("Adding two_factor_secret column...");
      await pool.query("ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255) DEFAULT NULL AFTER password");
      console.log("✅ Added two_factor_secret column.");
    } else {
      console.log("ℹ️ two_factor_secret column already exists.");
    }

    const [enabledCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'two_factor_enabled'");
    if (enabledCols.length === 0) {
      console.log("Adding two_factor_enabled column...");
      await pool.query("ALTER TABLE users ADD COLUMN two_factor_enabled TINYINT(1) DEFAULT 0 AFTER two_factor_secret");
      console.log("✅ Added two_factor_enabled column.");
    } else {
      console.log("ℹ️ two_factor_enabled column already exists.");
    }

    console.log('--- 2FA Migration Completed Successfully ---');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate2FA();
