const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://darkpore-foodnervesociety.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODMxNjAzNTksImlkIjoiMDE5ZjE3MzEtNTYwMS03NmEwLWI2ZjQtMjA4YTNmNTVkZGM1Iiwia2lkIjoiRzlSMnAyQ3hucXlsQ0tuM1VnZ3lOa3hUOEM5U1N0OUZHWEVMWkprVnotNCIsInJpZCI6ImU4ZjNhYjdmLTRkMmMtNDJmMi1hMmFhLWExNjYzZGYzMzFjOSJ9.tF9DUPnWalDV-2Toc1SGqT0LOSU148a5eS6Ttqhe2m3yDBNLkj6KZfuRBq6VQh1fuE03T-Qs2IY0tAxSjHJjBw',
});

async function main() {
  try {
    const result = await client.execute('SELECT COUNT(*) as count FROM EarlyAccessLead');
    console.log('EarlyAccessLead count:', result.rows[0].count);

    if (result.rows[0].count > 0) {
      const leads = await client.execute('SELECT id, firstName, lastName, email, role, createdAt FROM EarlyAccessLead LIMIT 10');
      console.log('\nRecent leads:');
      leads.rows.forEach(row => {
        console.log(`  - ${row.firstName} ${row.lastName} (${row.email}) [${row.role}] | Created: ${row.createdAt}`);
      });
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
