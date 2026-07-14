const { createClient } = require('@libsql/client');

async function main() {
  require('dotenv').config({ path: '.env.local' });
  const url = (process.env.TURSO_PROD_URL || "https://darkpore-foodnervesociety.aws-eu-west-1.turso.io").replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log("Checking Turso Database:", url);
  const client = createClient({ url, authToken });

  try {
    const res = await client.execute("PRAGMA table_info(Organization);");
    console.log("Columns in Organization table:");
    console.log(res.rows.map(r => r.name));
  } catch (e) {
    console.error("Error querying Organization:", e.message);
  }
}
main();
