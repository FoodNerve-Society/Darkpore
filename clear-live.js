const { createClient } = require("@libsql/client");
const dotenv = require("dotenv");
const dns = require("dns");

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: ".env.local" });

const url = process.env.TURSO_PROD_URL.replace(/"/g, '');
const authToken = process.env.TURSO_AUTH_TOKEN.replace(/"/g, '');

const client = createClient({
  url,
  authToken
});

async function clear() {
  console.log("Fetching tables from live Turso DB...");
  
  const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations'");
  const tables = res.rows.map(r => r.name);
  
  console.log(`Found ${tables.length} tables to clear.`);

  let deletedSomething = true;
  let attempts = 0;
  while(deletedSomething && attempts < 10) {
    deletedSomething = false;
    attempts++;
    for (const table of tables) {
      try {
        const deleteRes = await client.execute(`DELETE FROM "${table}"`);
        if (deleteRes.rowsAffected > 0) {
            console.log(`Deleted ${deleteRes.rowsAffected} records from ${table}`);
            deletedSomething = true;
        }
      } catch (e) {
        // Ignore FK errors on first pass
      }
    }
  }
  
  console.log("Live database cleared completely.");
}

clear().catch(console.error).finally(() => process.exit(0));
