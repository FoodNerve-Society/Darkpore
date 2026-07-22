const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function fixUsernames() {
  const url = (process.env.TURSO_PROD_URL || process.env.DATABASE_URL || "https://darkpore-foodnervesociety.aws-eu-west-1.turso.io").replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  console.log("Setting username 'adefolami' for adefolami@darkpore.com...");
  await client.execute("UPDATE User SET username = 'adefolami' WHERE email = 'adefolami@darkpore.com';");

  console.log("Setting username 'inyangraphael' for inyangraphael@gmail.com...");
  await client.execute("UPDATE User SET username = 'inyangraphael' WHERE email = 'inyangraphael@gmail.com';");

  console.log("Setting username 'babafemi' for oyewolebabafemi@gmail.com...");
  await client.execute("UPDATE User SET username = 'babafemi' WHERE email = 'oyewolebabafemi@gmail.com';");

  const users = await client.execute("SELECT id, username, email, name FROM User");
  console.log("Updated Turso Users:", JSON.stringify(users.rows, null, 2));
}

fixUsernames();
