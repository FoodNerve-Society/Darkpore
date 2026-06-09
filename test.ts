import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const updates = await prisma.challengeUpdate.findMany();
  console.log(updates);
}
main().finally(async () => await prisma.$disconnect());
