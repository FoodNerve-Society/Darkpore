import { prisma } from '../lib/db/client';
import { mockTradeListings, mockCampaigns, mockLearnContent } from '../lib/db/mocks';
import { foodChallenges } from '../lib/cms/food/challenges';
import { energyBottlenecks } from '../lib/cms/energy/bottlenecks';

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create a dummy User (Organizer/Poster)
  const dummyUser = await prisma.user.upsert({
    where: { email: 'admin@societyos.com' },
    update: {},
    create: {
      id: 'dummy-user-1',
      firebaseUid: 'dummy-firebase-uid-1',
      name: 'System Admin',
      email: 'admin@societyos.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin',
      role: 'ADMIN',
      rank: 5,
    },
  });

  // 2. Seed Trade Listings
  for (const item of mockTradeListings) {
    await prisma.tradeListing.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        title: item.title,
        category: (item as any).type || 'need',
        priceOrAsk: (item as any).price || 'Free',
        quantity: item.quantity,
        location: item.location,
        imageUrl: (item as any).image,
        postedById: dummyUser.id,
        lga: 'Ikeja', // mock
        description: item.description || 'Mock trade description',
      },
    });
  }

  // 3. Seed Campaigns
  for (const campaign of mockCampaigns) {
    await prisma.campaign.upsert({
      where: { id: campaign.id },
      update: {},
      create: {
        id: campaign.id,
        title: campaign.title,
        tier: campaign.tier,
        raisedAmount: typeof (campaign as any).raised === 'number' ? (campaign as any).raised : parseFloat((campaign as any).raised?.toString().replace(/[^0-9.]/g, '')) || 0,
        goalAmount: typeof (campaign as any).goal === 'number' ? (campaign as any).goal : parseFloat((campaign as any).goal?.toString().replace(/[^0-9.]/g, '')) || 1000,
        deadline: new Date(campaign.deadline),
        backerCount: campaign.backers,
        imageUrl: (campaign as any).image,
        organizerId: dummyUser.id,
        description: 'Mock campaign description',
      },
    });
  }

  // 4. Seed Learn Content
  for (const item of mockLearnContent || []) {
    await prisma.learnContent.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        title: item.title,
        type: (item as any).type === 'CLASS' ? 'class' : (item as any).type === 'LIVESTREAM' ? 'livestream' : 'video',
        bottleneckTags: '[]',
        authorName: typeof item.author === 'string' ? item.author : item.author?.name || (item as any).instructor || (item as any).host || 'Unknown',
        authorAvatarUrl: typeof item.author === 'object' ? item.author.avatarUrl : null,
        thumbnailUrl: (item as any).thumbnail || null,
        description: item.description || 'Mock description',
        costNP: (item as any).cost || null,
      },
    });
  }

  // 5. Seed Challenge Updates (Master Feed)
  for (const chal of foodChallenges) {
    for (const sub of chal.subcategories) {
      if (sub.updates) {
        for (const update of sub.updates) {
          await prisma.challengeUpdate.upsert({
            where: { id: update.id },
            update: {},
            create: {
              id: update.id,
              title: update.title,
              summary: (update as any).content || update.summary || 'Mock summary',
              section: (update as any).type || update.section || 'innovations',
              linkText: 'Read More',
              date: new Date(update.date || new Date()),
              subcategoryId: sub.id,
              subcategoryTitle: sub.title,
            },
          });
        }
      }

      // 6. Seed Learning Materials (Library)
      if (sub.learningMaterials) {
        for (const mat of sub.learningMaterials) {
          await prisma.learningMaterial.upsert({
            where: { id: mat.slug },
            update: {},
            create: {
              id: mat.slug,
              slug: mat.slug,
              title: mat.title,
              type: mat.type,
              previewText: 'Mock preview text',
              subcategoryId: sub.id,
              subcategoryTitle: sub.title,
              author: mat.author,
            },
          });
        }
      }
    }
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
