const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lc = await prisma.learnContent.findMany();
  console.log(lc.map(l => ({id: l.id, type: l.type})));
}

main().finally(() => prisma.$disconnect());
