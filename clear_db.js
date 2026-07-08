const { PrismaClient } = require('./node_modules/@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  console.log('Successfully cleared User and Organization records.');
  await prisma.$disconnect();
}

main().catch(console.error);
