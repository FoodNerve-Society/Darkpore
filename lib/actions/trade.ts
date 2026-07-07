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
  status?: string;
  metadata?: any;
}

export async function createTradeListing(data: CreateTradeListingPayload) {
  try {
    const isDraft = data.status === 'draft';

    // Title and Location are strictly required even for drafts
    if (!data.title || !data.location) {
      return { success: false, error: 'Add a job title and location to save to draft.' };
    }

    // Strict validation for active listings
    if (!isDraft) {
      if (!data.category || !data.priceOrAsk || !data.lga || !data.postedById) {
        return { success: false, error: 'Missing required fields for publishing.' };
      }
    }

    if (!data.postedById) {
      return { success: false, error: 'User context missing.' };
    }

    // Extract additional metadata fields
    const metadata = data.metadata || {};
    const isJobOrVolunteer = data.category === 'jobs' || data.category === 'volunteer';

    const listing = await prisma.tradeListing.create({
      data: {
        category: data.category || 'jobs', // Fallback for drafts
        title: data.title,
        description: data.description || '',
        priceOrAsk: data.priceOrAsk || '0',
        location: data.location,
        lga: data.lga || '',
        postedById: data.postedById,
        imageUrl: data.imageUrl,
        nervePointsCost: data.nervePointsCost || 0,
        status: data.status || 'active',
        urgency: 'normal',
        commodity: metadata.sector || undefined, // We map Sector to commodity here
        
        // Job-specific mappings
        ...(isJobOrVolunteer ? {
          jobSource: metadata.jobSource || undefined,
          compType: metadata.compType || undefined,
          externalCompany: metadata.companyName || undefined,
          npReward: metadata.npAmount || undefined,
          targetTenantId: metadata.targetTenantId || undefined,
          currency: metadata.currency || undefined,
          minSalary: metadata.minSalary || undefined,
          maxSalary: metadata.maxSalary || undefined,
          duration: metadata.duration || undefined,
          startDate: metadata.startDate ? new Date(metadata.startDate) : undefined,
          endDate: metadata.endDate ? new Date(metadata.endDate) : undefined,
          workModel: metadata.workModel || undefined,
        } : {}),
      },
    });

    return { success: true, listing };
  } catch (error: any) {
    console.error('Failed to create trade listing:', error);
    return { success: false, error: error.message || 'Failed to create trade listing.' };
  }
}
