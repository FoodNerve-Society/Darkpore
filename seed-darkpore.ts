import { prisma } from './lib/db/client';

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'darkpore' },
    update: {},
    create: {
      slug: 'darkpore',
      name: 'Darkpore',
      legalName: 'Darkpore Media Africa',
      isPlatformOwner: true,
      isExternal: false,
      verified: true,
      rank: 5,
      country: 'Nigeria',
      state: 'Lagos'
    }
  });
  console.log('Upserted Darkpore:', org);
}

main().catch(console.error);
