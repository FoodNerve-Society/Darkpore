const { createClient } = require('@libsql/client');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("=== Turso Automated Schema Migration ===");
  const url = (process.env.TURSO_PROD_URL || process.env.DATABASE_URL || "").replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("❌ Missing TURSO_PROD_URL or TURSO_AUTH_TOKEN in .env.local");
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  console.log("1. Fetching live schema from Turso...");
  const schemaResult = await client.execute("SELECT sql FROM sqlite_schema WHERE sql IS NOT NULL");
  const liveSql = schemaResult.rows.map(r => r.sql).join(';\n') + ';';

  console.log("2. Creating local shadow database...");
  const shadowDbPath = path.join(__dirname, 'prisma', 'turso.db');
  if (fs.existsSync(shadowDbPath)) {
    fs.unlinkSync(shadowDbPath);
  }

  // Use local @libsql/client to create the shadow DB
  const shadowClient = createClient({ url: `file:${shadowDbPath}` });
  
  // Split liveSql and execute safely to build shadow schema
  const stmts = liveSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of stmts) {
    try {
      await shadowClient.execute(stmt);
    } catch (e) {
      console.warn("   Warning executing shadow statement:", e.message);
    }
  }

  console.log("3. Generating Prisma diff...");
  const diffScriptPath = path.join(__dirname, 'scratch', 'diff_utf8.sql');
  if (!fs.existsSync(path.join(__dirname, 'scratch'))) {
    fs.mkdirSync(path.join(__dirname, 'scratch'));
  }

  try {
    // We use the --from-config-datasource trick with TURSO_DATABASE_URL
    const cmd = `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > "${diffScriptPath}"`;
    execSync(cmd, { 
      env: { ...process.env, TURSO_DATABASE_URL: 'file:./turso.db' },
      stdio: 'pipe'
    });
  } catch (e) {
    console.error("❌ Failed to generate prisma diff:", e.message);
    if (e.stdout) console.log(e.stdout.toString());
    if (e.stderr) console.error(e.stderr.toString());
    process.exit(1);
  }

  // Close shadow client to release file lock
  try {
    if (shadowClient && shadowClient.close) shadowClient.close();
  } catch(e) {}

  let diffSql = fs.readFileSync(diffScriptPath, 'utf8');
  
  // Clean up shadow DB
  try {
    if (fs.existsSync(shadowDbPath)) fs.unlinkSync(shadowDbPath);
  } catch (e) {
    // Ignore unlock delay on Windows
  }

  const queries = diffSql.split(';')
    .map(q => q.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim())
    .filter(q => q.length > 0);

  if (queries.length === 0) {
    console.log("✅ Live database is already up to date with schema.prisma. No changes needed.");
    return;
  }

  console.log(`4. Pushing ${queries.length} changes to Turso...`);
  try {
    for (let i = 0; i < queries.length; i++) {
      const q = queries[i];
      try {
        await client.execute(q);
        console.log(`   [${i + 1}/${queries.length}] Executed successfully.`);
      } catch (e) {
        console.error(`❌ Failed at query ${i + 1}:\n${q.substring(0, 100)}...\nError: ${e.message}`);
        console.error("Aborting schema push due to query failure.");
        process.exit(1);
      }
    }
    console.log("🎉 Schema successfully pushed to Turso!");
  } catch(e) {
    console.error("❌ Error executing schema:", e);
    process.exit(1);
  }
}

main();
