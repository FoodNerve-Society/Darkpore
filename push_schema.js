const { createClient } = require('@libsql/client');
const fs = require('fs');

async function main() {
  require('dotenv').config({ path: '.env.local' });

  const url = (process.env.TURSO_PROD_URL || process.env.DATABASE_URL || "https://darkpore-foodnervesociety.aws-eu-west-1.turso.io").replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!authToken) {
    console.error("Missing TURSO_AUTH_TOKEN in .env.local");
    return;
  }

  console.log("Connecting to", url);

  const client = createClient({
    url,
    authToken
  });
  let sql = fs.readFileSync('scratch/diff_utf8.sql', 'utf8');
  const queries = sql.split(';')
    .map(q => q.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim())
    .filter(q => q.length > 0);

  console.log(`Executing ${queries.length} queries...`);
  try {
    for (let i = 0; i < queries.length; i++) {
      const q = queries[i];
      try {
        await client.execute(q);
        console.log(`Executed query ${i + 1}/${queries.length}`);
      } catch (e) {
        console.error(`Failed at query ${i + 1}: ${q.substring(0, 50).replace(/\n/g, ' ')}... -> ${e.message}`);
        console.error("Aborting schema push due to query failure.");
        process.exit(1);
      }
    }
    console.log("Schema successfully pushed to Turso!");
  } catch(e) {
    console.error("Error executing schema:", e);
    process.exit(1);
  }
}
main();
