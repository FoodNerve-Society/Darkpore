const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://darkpore-foodnervesociety.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODMxNjAzNTksImlkIjoiMDE5ZjE3MzEtNTYwMS03NmEwLWI2ZjQtMjA4YTNmNTVkZGM1Iiwia2lkIjoiRzlSMnAyQ3hucXlsQ0tuM1VnZ3lOa3hUOEM5U1N0OUZHWEVMWkprVnotNCIsInJpZCI6ImU4ZjNhYjdmLTRkMmMtNDJmMi1hMmFhLWExNjYzZGYzMzFjOSJ9.tF9DUPnWalDV-2Toc1SGqT0LOSU148a5eS6Ttqhe2m3yDBNLkj6KZfuRBq6VQh1fuE03T-Qs2IY0tAxSjHJjBw',
});

async function main() {
  try {
    // Check User table schema
    const schema = await client.execute("PRAGMA table_info(User)");
    console.log('User table columns:');
    schema.rows.forEach(row => console.log(`  - ${row.name} (${row.type})`));

    // Get all users
    const users = await client.execute('SELECT * FROM User LIMIT 10');
    console.log('\nUsers in database:');
    users.rows.forEach(row => {
      console.log(JSON.stringify(row, null, 2));
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
