const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkTurso() {
  const url = (process.env.TURSO_PROD_URL || process.env.DATABASE_URL || "https://darkpore-foodnervesociety.aws-eu-west-1.turso.io").replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log("Connecting to Turso:", url);
  const client = createClient({ url, authToken });

  try {
    const orgs = await client.execute("SELECT id, name, slug, verified FROM Organization");
    console.log("Turso Organizations:", JSON.stringify(orgs.rows, null, 2));

    const users = await client.execute("SELECT id, username, email, name FROM User");
    console.log("Turso Users:", JSON.stringify(users.rows, null, 2));
  } catch (err) {
    console.error("Turso error:", err);
  }
}

checkTurso();
