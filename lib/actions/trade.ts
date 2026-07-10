'use server';

import { prisma } from '@/lib/db/client';

export interface CreateTradeListingPayload {
  id?: string;
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
  organizationId?: string | null;
  expiresAt?: string | Date | null;
}

export async function createTradeListing(data: CreateTradeListingPayload) {
  try {
    const isDraft = data.status === 'draft';

    // Title and Location are strictly required even for drafts
    if (!data.title || !data.location) {
      return { success: false, error: 'Title and location are required.' };
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

    let finalOrganizationId = data.organizationId;
    let isPlatformOwner = false;

    if (finalOrganizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: finalOrganizationId },
        select: { isPlatformOwner: true }
      });
      isPlatformOwner = org?.isPlatformOwner || false;
    } else if (metadata.isExternal && metadata.externalEntityName) {
      // Auto-create a ghost organization for external entities
      let baseSlug = metadata.externalEntityName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const extOrg = await prisma.organization.create({
        data: {
          name: metadata.externalEntityName,
          slug,
          isExternal: true,
          country: metadata.externalCountry?.name,
          state: metadata.externalState?.name,
          lga: metadata.externalLga?.name
        }
      });
      finalOrganizationId = extOrg.id;
    }

    if (!isDraft && isJobOrVolunteer && !isPlatformOwner) {
      if (!metadata.jobChallenges || metadata.jobChallenges.length === 0) {
        return { success: false, error: 'You must select at least one challenge this role addresses.' };
      }
    }

    const listingData = {
      category: data.category || 'jobs',
      title: data.title,
      description: data.description || '',
      priceOrAsk: data.priceOrAsk || '0',
      location: data.location,
      lga: data.lga || '',
      commodity: metadata.sector || undefined,
      postedById: data.postedById,
      imageUrl: data.imageUrl,
      nervePointsCost: data.nervePointsCost || 0,
      status: data.status || 'draft',
      organizationId: finalOrganizationId,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      
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
        challenges: metadata.jobChallenges ? JSON.stringify(metadata.jobChallenges) : undefined,
        subcategories: metadata.jobSubcategories ? JSON.stringify(metadata.jobSubcategories) : undefined,
        
        // Application & CTA Setup
        applicationMethod: metadata.applicationMethod || 'native',
        externalUrl: metadata.applicationUrl || undefined,
        applicationEmail: metadata.applicationEmail || undefined,
        applicationInstructions: metadata.applicationInstructions || undefined,
        requiredDocuments: metadata.requiredDocuments || undefined,
        customQuestions: metadata.customQuestions || undefined,
        externalButtonText: metadata.externalButtonText || undefined,
      } : {})
    };

    let listing;
    if (data.id) {
      listing = await prisma.tradeListing.update({
        where: { id: data.id },
        data: listingData
      });
    } else {
      listing = await prisma.tradeListing.create({
        data: listingData
      });
    }

    return { success: true, listing };
  } catch (error: any) {
    console.error('Failed to create trade listing:', error);
    return { success: false, error: error.message || 'Failed to create trade listing.' };
  }
}
export async function getUserDrafts(userId: string) {
  try {
    const drafts = await prisma.tradeListing.findMany({
      where: {
        postedById: userId,
        status: 'draft'
      },
      orderBy: {
        postedAt: 'desc'
      },
      include: {
        organization: true
      }
    });
    
    const formattedDrafts = drafts.map(d => ({
      ...d,
      lastEdited: d.postedAt.toLocaleDateString()
    }));

    return { success: true, drafts: formattedDrafts };
  } catch (error: any) {
    console.error('Failed to get drafts:', error);
    return { success: false, error: error.message };
  }
}
export async function deleteTradeListing(listingId: string, userId: string) {
  try {
    const listing = await prisma.tradeListing.findUnique({
      where: { id: listingId }
    });
    if (!listing) return { success: false, error: 'Not found' };
    if (listing.postedById !== userId) return { success: false, error: 'Unauthorized' };

    await prisma.tradeListing.delete({
      where: { id: listingId }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete listing:', error);
    return { success: false, error: error.message };
  }
}
export async function getTradeListings(options?: { categories?: string[] }) {
  try {
    const whereClause: any = {
      status: 'active',
    };
    if (options?.categories && options.categories.length > 0) {
      whereClause.category = { in: options.categories };
    }

    const listings = await prisma.tradeListing.findMany({
      where: whereClause,
      orderBy: {
        endDate: 'asc' // Nulls last isn't natively supported, we'll sort in JS or use another strategy, but let's default to asc for deadlines
      },
      include: {
        postedBy: {
          select: {
            id: true,
            firstName: true,
            name: true,
            avatarUrl: true,
            verified: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            verified: true
          }
        }
      }
    });

    // Formatting for the frontend
    const formattedListings = listings.map(l => ({
      id: l.id,
      category: l.category,
      title: l.title,
      description: l.description,
      priceOrAsk: l.priceOrAsk,
      location: l.location,
      lga: l.lga,
      postedBy: { 
        name: l.organization?.name || l.postedBy?.name || l.postedBy?.firstName || 'User',
        avatarUrl: l.organization?.logoUrl || l.postedBy?.avatarUrl || '',
        isVerified: l.organization?.verified || l.postedBy?.verified || false
      },
      postedAt: l.postedAt.toISOString(),
      urgency: l.urgency,
      status: l.status,
      isBoosted: l.isBoosted,
      imageUrl: l.imageUrl,
      jobSource: l.jobSource,
      compType: l.compType,
      endDate: l.endDate ? l.endDate.toISOString() : null,
      workModel: l.workModel,
    }));

    // In Prisma SQLite, sorting by endDate asc puts nulls at the top, or we can just sort in JS
    formattedListings.sort((a, b) => {
      if (a.endDate && b.endDate) return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      if (a.endDate) return -1;
      if (b.endDate) return 1;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(); // fallback to postedAt desc
    });

    return { success: true, listings: formattedListings };
  } catch (error: any) {
    console.error('Failed to get trade listings:', error);
    return { success: false, error: error.message };
  }
}

export async function getCareersListings() {
  try {
    const listingsResult = await getTradeListings({ categories: ['jobs', 'volunteer'] });
    if (!listingsResult.success || !listingsResult.listings) {
      throw new Error(listingsResult.error || "Failed to fetch listings");
    }

    const allListings = listingsResult.listings;

    const coreEcosystemRoles: any[] = [];
    const societyPartners: any[] = [];
    const externalSourced: any[] = [];

    allListings.forEach((job: any) => {
      const isPlatformOwner = job.organization?.isPlatformOwner;
      const isExternal = job.organization?.isExternal;
      
      if (isPlatformOwner) {
        coreEcosystemRoles.push(job);
      } else if (!isExternal) {
        societyPartners.push(job);
      } else {
        externalSourced.push(job);
      }
    });

    return {
      success: true,
      coreEcosystemRoles,
      societyPartners,
      externalSourced
    };
  } catch (error: any) {
    console.error('Failed to get career listings:', error);
    return { success: false, error: error.message };
  }
}
