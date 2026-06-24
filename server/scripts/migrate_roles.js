import { pool } from '../src/config/db.js';

async function migrate() {
  console.log('Starting migration for project_roles...');
  try {
    // 1. Create the new project_roles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    console.log('project_roles table created or already exists.');

    // 2. Insert standard roles
    await pool.query(`
      INSERT IGNORE INTO project_roles (id, name) VALUES 
      (1, 'Manager'), 
      (2, 'Member')
    `);
    console.log('Standard project roles inserted.');

    // 3. Find existing foreign key on project_members.role_id linking to roles.id
    const [fkRows] = await pool.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'project_members' 
        AND COLUMN_NAME = 'role_id' 
        AND REFERENCED_TABLE_NAME = 'roles'
    `);

    if (fkRows.length > 0) {
      const fkName = fkRows[0].CONSTRAINT_NAME;
      await pool.query(`ALTER TABLE project_members DROP FOREIGN KEY ${fkName}`);
      console.log(`Dropped old foreign key constraint: ${fkName}`);
    } else {
      console.log('No existing foreign key found linking project_members.role_id to roles.id');
    }

    // 4. Migrate data
    // Old roles table IDs: 2=manager, 7=project_manager
    await pool.query(`UPDATE project_members SET role_id = 1 WHERE role_id IN (2, 7)`);
    // Everyone else becomes a Member (ID=2)
    await pool.query(`UPDATE project_members SET role_id = 2 WHERE role_id != 1`);
    console.log('Migrated existing project_members data.');

    // 5. Add new foreign key mapping to project_roles
    // First, check if the new FK already exists to prevent duplicate key errors
    const [newFkRows] = await pool.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'project_members' 
        AND COLUMN_NAME = 'role_id' 
        AND REFERENCED_TABLE_NAME = 'project_roles'
    `);

    if (newFkRows.length === 0) {
      await pool.query(`
        ALTER TABLE project_members
        ADD CONSTRAINT fk_project_members_project_role_id
        FOREIGN KEY (role_id) REFERENCES project_roles(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
      `);
      console.log('Added new foreign key linking to project_roles.');
    } else {
      console.log('Foreign key to project_roles already exists.');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
