import { PrismaClient } from '@prisma/client';
import { prisma } from './lib/db/client';

async function main() {
  const result = await prisma.learnContent.deleteMany({});
  console.log(`Successfully deleted ${result.count} LearnContent records.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
