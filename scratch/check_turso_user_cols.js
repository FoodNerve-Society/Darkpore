const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkUserColumns() {
  const url = (process.env.TURSO_PROD_URL || process.env.DATABASE_URL || "https://darkpore-foodnervesociety.aws-eu-west-1.turso.io").replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  const columns = await client.execute("PRAGMA table_info('User');");
  console.log("User table columns in Turso:", columns.rows.map(r => r.name));
}

checkUserColumns();
