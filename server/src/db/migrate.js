const fs = require('fs');
const path = require('path');
const pool = require('./config');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  await pool.query(schema);
  console.log('Database schema applied successfully.');
}

migrate()
  .catch((error) => {
    const details = [error.name, error.code, error.message]
      .filter(Boolean)
      .join(': ');
    console.error('Database migration failed:', details || 'Unknown database error');
    process.exitCode = 1;
  })
  .finally(() => pool.end());
