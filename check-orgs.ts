import { prisma } from './lib/db/client';

async function main() {
  const orgCount = await prisma.organization.count();
  console.log('Org count:', orgCount);
  
  const allOrgs = await prisma.organization.findMany();
  console.log('Orgs:', JSON.stringify(allOrgs, null, 2));
}
main().catch(console.error);
