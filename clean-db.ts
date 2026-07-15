import { prisma } from './lib/db/client';

async function main() {
  await prisma.tradeListing.deleteMany();
  console.log("Deleted all trade listings");
}
main().catch(console.error);
