import { prisma } from '../lib/db/client';

async function main() {
  console.log('Clearing all users from the database...');
  const result = await prisma.user.deleteMany({});
  console.log(`Deleted ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
