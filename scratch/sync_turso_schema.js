const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function syncTursoUserSchema() {
  const url = (process.env.TURSO_PROD_URL || process.env.DATABASE_URL || "https://darkpore-foodnervesociety.aws-eu-west-1.turso.io").replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log("Syncing Turso schema at:", url);
  const client = createClient({ url, authToken });

  try {
    console.log("Adding 'username' column to User table on Turso...");
    await client.execute('ALTER TABLE "User" ADD COLUMN "username" TEXT;');
    console.log("✅ Column 'username' added.");
  } catch (err) {
    console.log("Column 'username' note:", err.message);
  }

  try {
    console.log("Creating unique index on User.username...");
    await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");');
    console.log("✅ Unique index created.");
  } catch (err) {
    console.log("Index note:", err.message);
  }

  // Update adefolami's username in Turso if user exists
  try {
    const res = await client.execute("UPDATE User SET username = 'adefolami' WHERE email LIKE '%adefolami%' OR name LIKE '%Raphael%';");
    console.log(`✅ Updated ${res.rowsAffected} user records with username 'adefolami'.`);
  } catch (err) {
    console.log("Update user note:", err.message);
  }
}

syncTursoUserSchema();
