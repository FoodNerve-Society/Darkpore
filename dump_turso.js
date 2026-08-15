const { createClient } = require('@libsql/client');
const fs = require('fs');

const client = createClient({
  url: 'libsql://darkpore-foodnervesociety.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODMxNjAzNTksImlkIjoiMDE5ZjE3MzEtNTYwMS03NmEwLWI2ZjQtMjA4YTNmNTVkZGM1Iiwia2lkIjoiRzlSMnAyQ3hucXlsQ0tuM1VnZ3lOa3hUOEM5U1N0OUZHWEVMWkprVnotNCIsInJpZCI6ImU4ZjNhYjdmLTRkMmMtNDJmMi1hMmFhLWExNjYzZGYzMzFjOSJ9.tF9DUPnWalDV-2Toc1SGqT0LOSU148a5eS6Ttqhe2m3yDBNLkj6KZfuRBq6VQh1fuE03T-Qs2IY0tAxSjHJjBw',
});

async function main() {
  try {
    const result = await client.execute("SELECT sql FROM sqlite_schema WHERE type IN ('table', 'index') AND sql IS NOT NULL;");
    const sql = result.rows.map(r => r.sql + ';').join('\n');
    fs.writeFileSync('turso_schema.sql', sql);
    console.log('Saved to turso_schema.sql');
  } catch (e) {
    console.error(e);
  }
}
main();
