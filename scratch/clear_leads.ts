import { prisma } from '../lib/db/client';

async function main() {
  await prisma.earlyAccessLead.deleteMany({});
  console.log('Successfully cleared all leads from the database.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
