import { prisma } from './lib/db/client';

async function main() {
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  console.log('Successfully cleared User and Organization records.');
  await prisma.$disconnect();
}

main().catch(console.error);
