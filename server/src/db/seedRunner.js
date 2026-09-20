const fs = require('fs');
const path = require('path');
const pool = require('./config');

async function seedReal() {
  const seedPath = path.join(__dirname, 'seed_real_data.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  await pool.query(sql);
  console.log('Real published baseline data applied successfully.');
}

seedReal()
  .catch((error) => {
    const details = [error.name, error.code, error.message].filter(Boolean).join(': ');
    console.error('Real data seed failed:', details || 'Unknown database error');
    process.exitCode = 1;
  })
  .finally(() => pool.end());