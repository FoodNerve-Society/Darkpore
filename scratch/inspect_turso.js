const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function inspectDatabase() {
  const url = (process.env.TURSO_PROD_URL || process.env.DATABASE_URL || "https://darkpore-foodnervesociety.aws-eu-west-1.turso.io").replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!authToken) {
    console.error("Missing TURSO_AUTH_TOKEN in .env.local");
    return;
  }

  console.log(`Connecting to Turso Database: ${url}\n`);

  const client = createClient({ url, authToken });

  try {
    // 1. Get all tables in the database
    const tablesResult = await client.execute(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_prisma_migrations'
      ORDER BY name;
    `);

    const tables = tablesResult.rows.map(r => r.name);
    console.log(`Found ${tables.length} tables in the database.`);
    console.log("==================================================");

    // 2. Count rows in each table
    for (const table of tables) {
      try {
        const countResult = await client.execute(`SELECT COUNT(*) as count FROM "${table}"`);
        const count = countResult.rows[0].count;
        console.log(`- ${table.padEnd(30, ' ')} : ${count} rows`);
      } catch (err) {
        console.error(`- ${table.padEnd(30, ' ')} : Error reading data`);
      }
    }

    console.log("==================================================\n");

    // 3. Let's peek at the "Organization" table to see the external organizations
    console.log("Peeking at the 'Organization' table data:");
    const orgResult = await client.execute(`SELECT name, slug, isExternal FROM "Organization" LIMIT 5`);
    console.table(orgResult.rows);

  } catch (error) {
    console.error("Failed to inspect database:", error.message);
  }
}

inspectDatabase();
