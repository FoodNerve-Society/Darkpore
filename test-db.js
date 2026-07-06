const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const userCount = await prisma.user.count().catch(() => 0);
  const tradeCount = await prisma.tradeListing.count().catch(() => 0);
  console.log('Users:', userCount, 'TradeListings:', tradeCount);
}
main().finally(() => prisma.());