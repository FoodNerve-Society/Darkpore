'use server';

import { prisma } from '@/lib/db/client';

export async function getChallengeUpdatesBySubcategories(subcategoryIds: string[]) {
  const updates = await prisma.challengeUpdate.findMany({
    where: {
      subcategoryId: { in: subcategoryIds },
      section: { in: ['jobs', 'activities', 'innovations'] }
    },
    orderBy: {
      date: 'desc',
    },
    take: 15,
  });
  return updates;
}

export async function getSubcategoryUpdates(subcategoryId: string) {
  const updates = await prisma.challengeUpdate.findMany({
    where: {
      subcategoryId: subcategoryId,
    },
    orderBy: {
      date: 'desc',
    },
  });
  return updates;
}

export async function getSubcategoryLearningMaterials(subcategoryId: string) {
  const materials = await prisma.learningMaterial.findMany({
    where: {
      subcategoryId: subcategoryId,
    },
    orderBy: {
      dateAdded: 'desc',
    },
  });
  return materials;
}
