const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Pool } = require('pg');

// Supabase provides a standard PostgreSQL connection URL. Prefer DATABASE_URL
// in every deployed environment, while retaining the individual variables for
// a local PostgreSQL fallback.
const databaseUrl = process.env.DATABASE_URL;
const isPlaceholder = (value) => /YOUR_|PROJECT_REF|POOLER_HOST|your_password/i.test(value || '');

// pg-connection-string treats sslmode=require as verify-full, which rejects
// Supabase's certificate chain. Drop sslmode so the explicit ssl option below
// decides how the certificate is validated.
const stripSslMode = (url) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('sslmode');
    return parsed.toString();
  } catch {
    return url;
  }
};

// A copied example URL must not mask otherwise valid local/database settings.
const pool = databaseUrl && !isPlaceholder(databaseUrl)
  ? new Pool({
      connectionString: stripSslMode(databaseUrl),
      // Supabase requires encrypted database connections. Set
      // DB_SSL_REJECT_UNAUTHORIZED=true when a CA certificate is configured.
      ssl: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
        ? { rejectUnauthorized: true }
        : { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'cv_benchmarks',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
