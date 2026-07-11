import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users);
  const listings = await prisma.tradeListing.findMany();
  console.log("Listings in DB:", listings);
}

main().catch(console.error).finally(() => prisma.$disconnect());
