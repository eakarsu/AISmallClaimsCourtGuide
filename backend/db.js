const { Pool } = require('pg');
const { databaseUrl } = require('./config/security');

const pool = new Pool({
  connectionString: databaseUrl,
});

async function verifyDatabase() {
  const result = await pool.query("SELECT to_regclass('public.claim_guides') AS workflow_table");
  if (!result.rows[0].workflow_table) throw new Error('Database migrations are required; run ./scripts/migrate.sh');
}

module.exports = { pool, verifyDatabase };
