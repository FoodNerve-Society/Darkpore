import { prisma } from './lib/db/client';

async function main() {
  console.log('Seeding Campaigns (Active Deployments)...');

  // Find or create a mock organizer
  let user = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: 'mock-uid-seed-1',
        email: 'admin@darkpore.com',
        name: 'Society Gatekeeper',
        role: 'admin',
        avatarUrl: '/avatars/04.png',
        lifetimeNP: 20000,
        rank: 5,
        hasCompletedProfile: true,
        hasKYC: true,
        hasBusinessVerification: true,
        verified: true,
      }
    });
  }

  // Define some active deployments matching our existing showcase format
  const activeDeployments = [
    {
      tier: 'venture',
      title: 'Land Access: 10,000 Hectares Under Third-Party Mortgage',
      description: 'We secured 10,000 hectares of arable land in Ogun State. Instead of farmers buying land, investors hold the mortgage and lease it out at micro-rates to verified Society farmers.',
      imageUrl: '/images/showcase/land-access.jpg',
      goalAmount: 1000000,
      raisedAmount: 1000000,
      backerCount: 145,
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: 'active_deployment',
      originTag: 'Land Access',
      tractionMetric: 'Vetted by 5 Gatekeepers & Fully Funded',
      organizerId: user.id
    },
    {
      tier: 'initiative',
      title: 'Solar Cold-Chain Network: Hub 1 Deployed',
      description: 'The first of 50 planned solar-powered cold storage units is live in Kano. Farmers can now store perishables up to 3 weeks longer, drastically reducing post-harvest loss.',
      imageUrl: '/images/showcase/cold-chain.jpg',
      goalAmount: 500000,
      raisedAmount: 500000,
      backerCount: 82,
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: 'active_deployment',
      originTag: 'Energy / Storage',
      tractionMetric: 'Operational in 1 Hub, 49 to go',
      organizerId: user.id
    },
    {
      tier: 'innovation',
      title: 'Drought-Resistant Seed Breeding Initiative',
      description: 'Partnering with local agricultural universities to develop and distribute drought-resistant maize varieties to 5,000 Society farmers ahead of the dry season.',
      imageUrl: '/images/showcase/seed-breeding.jpg',
      goalAmount: 250000,
      raisedAmount: 250000,
      backerCount: 41,
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: 'active_deployment',
      originTag: 'Inputs',
      tractionMetric: 'Phase 1 R&D Complete. Distribution starts next month.',
      organizerId: user.id
    }
  ];

  for (const data of activeDeployments) {
    const created = await prisma.campaign.create({ data });
    console.log(`Created Active Deployment: ${created.title}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
