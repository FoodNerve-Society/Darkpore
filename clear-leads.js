const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    await prisma.$disconnect();
  });
