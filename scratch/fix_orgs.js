const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOrgs() {
  try {
    // 1. Fix Food Nerve
    await prisma.organization.updateMany({
      where: { slug: 'foodnerve' },
      data: { isPlatformOwner: true }
    });
    console.log("Updated Food Nerve to isPlatformOwner: true");

    // 2. Fix all external organizations to be Rank 1
    const res = await prisma.organization.updateMany({
      where: { isExternal: true },
      data: { rank: 1 }
    });
    console.log(`Updated ${res.count} external organizations to rank: 1`);

  } catch (e) {
    console.error("Error fixing orgs:", e);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrgs();
