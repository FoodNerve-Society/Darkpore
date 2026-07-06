'use server';

import { prisma } from '@/lib/db/client';

export interface CreateTradeListingPayload {
  category: string;
  title: string;
  description: string;
  priceOrAsk: string;
  location: string;
  lga: string;
  postedById: string;
  imageUrl?: string;
  nervePointsCost?: number;
}

export async function createTradeListing(data: CreateTradeListingPayload) {
  try {
    if (!data.title || !data.category || !data.priceOrAsk || !data.location || !data.lga || !data.postedById) {
      return { success: false, error: 'Missing required fields.' };
    }

    const listing = await prisma.tradeListing.create({
      data: {
        category: data.category,
        title: data.title,
        description: data.description,
        priceOrAsk: data.priceOrAsk,
        location: data.location,
        lga: data.lga,
        postedById: data.postedById,
        imageUrl: data.imageUrl,
        nervePointsCost: data.nervePointsCost || 0,
        status: 'active',
        urgency: 'normal',
      },
    });

    return { success: true, listing };
  } catch (error: any) {
    console.error('Failed to create trade listing:', error);
    return { success: false, error: error.message || 'Failed to create trade listing.' };
  }
}
