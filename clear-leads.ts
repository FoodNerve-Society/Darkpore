import { prisma } from './lib/db/client';

async function clearLeads() {
  const result = await prisma.earlyAccessLead.deleteMany({});
  console.log(`Deleted ${result.count} leads from the local database.`);
}

clearLeads()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Note: disconnect isn't strictly necessary for driverAdapters, but good practice
  });
