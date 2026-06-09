import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Innovations Data...');

  const subcategoryId = 'soil-regeneration';
  const subcategoryTitle = 'Soil Regeneration';

  // Clear existing
  await prisma.challengeUpdate.deleteMany({ where: { subcategoryId } });
  await prisma.learningMaterial.deleteMany({ where: { subcategoryId } });

  // 1. Innovations (3 items)
  await prisma.challengeUpdate.createMany({
    data: [
      {
        title: '₦50M Soil Regeneration Grant by the Gates Foundation',
        summary: 'The Gates Foundation is seeking 5 startups to deploy drone-based soil analysis across 10,000 hectares in Northern Nigeria.',
        section: 'innovations',
        importance: 'high',
        linkText: 'Apply in the Deal Room',
        subcategoryId,
        subcategoryTitle,
      },
      {
        title: 'Series Seed: Bio-Fertilizer Startup XYZ',
        summary: 'A new startup just closed a $500k seed round to scale their organic microbiome fertilizer production locally.',
        section: 'innovations',
        importance: 'normal',
        linkText: 'View Pitch Deck',
        subcategoryId,
        subcategoryTitle,
      },
      {
        title: 'R&D Breakthrough: Cover Crop Yields',
        summary: 'Research from IITA shows a 40% increase in yield when using specific nitrogen-fixing cover crops in the Sahel.',
        section: 'innovations',
        importance: 'normal',
        linkText: 'Read Whitepaper',
        subcategoryId,
        subcategoryTitle,
      }
    ]
  });

  // 2. Library (6 items)
  for (let i = 1; i <= 6; i++) {
    await prisma.challengeUpdate.create({
      data: {
        title: i % 2 === 0 ? `Video: Soil Microbes Explained Part ${i}` : `Research Paper: Sahel Soil Data 2026-${i}`,
        summary: 'Open source documentation and deep dives into soil regeneration.',
        section: 'library',
        importance: 'normal',
        linkText: 'View Material',
        subcategoryId,
        subcategoryTitle,
      }
    });
  }

  // 3. Community (4 items)
  await prisma.challengeUpdate.createMany({
    data: [
      {
        title: 'Mapped 10,000 Hectares in Kano',
        summary: 'Our community successfully completed the open-source mapping of the Kano agricultural belt for soil degradation levels.',
        section: 'community',
        importance: 'high',
        linkText: 'View Map',
        subcategoryId,
        subcategoryTitle,
      },
      {
        title: 'Onboarded 500 Rural Farmers',
        summary: 'The field ops team successfully trained 500 farmers on zero-tillage farming practices.',
        section: 'community',
        importance: 'normal',
        linkText: 'View Report',
        subcategoryId,
        subcategoryTitle,
      },
      {
        title: 'Built Open-Source Soil Sensor',
        summary: 'Hardware team published schematics for a $15 soil moisture and NPK sensor.',
        section: 'community',
        importance: 'high',
        linkText: 'View GitHub',
        subcategoryId,
        subcategoryTitle,
      }
    ]
  });

  // 4. Activities (3 items)
  await prisma.challengeUpdate.createMany({
    data: [
      {
        title: 'Regenerative Ag Bootcamp',
        summary: 'Upcoming Bootcamps on regenerative agriculture practices starting next month in Kano.',
        section: 'activities',
        importance: 'normal',
        linkText: 'Register Now',
        subcategoryId,
        subcategoryTitle,
      },
      {
        title: 'Field Day: Drone Survey Demo',
        summary: 'Live demonstration of hyper-spectral drone scanning for soil health in Lagos.',
        section: 'activities',
        importance: 'high',
        linkText: 'RSVP',
        subcategoryId,
        subcategoryTitle,
      }
    ]
  });

  // 5. Jobs (4 items)
  await prisma.challengeUpdate.createMany({
    data: [
      {
        title: 'Senior Agronomist Needed',
        summary: 'We are hiring a senior agronomist to lead the microbiome engineering lab.',
        section: 'jobs',
        importance: 'high',
        linkText: 'Apply via Rolodex',
        subcategoryId,
        subcategoryTitle,
      },
      {
        title: 'Bounty: Translate Sensor Docs to Hausa',
        summary: 'We need someone to translate the open-source soil sensor documentation into Hausa for local manufacturers.',
        section: 'jobs',
        importance: 'normal',
        linkText: 'Claim Bounty',
        subcategoryId,
        subcategoryTitle,
      },
      {
        title: 'Drone Pilot (Kaduna Hub)',
        summary: 'Full-time drone pilot needed to run daily agricultural surveys.',
        section: 'jobs',
        importance: 'normal',
        linkText: 'Apply Now',
        subcategoryId,
        subcategoryTitle,
      }
    ]
  });

  console.log('Seeding Complete for Soil Regeneration.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
