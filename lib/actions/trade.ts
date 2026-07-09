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
  organizationId?: string | null;
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

    let finalOrganizationId = data.organizationId;
    let isPlatformOwner = false;

    if (finalOrganizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: finalOrganizationId },
        select: { isPlatformOwner: true }
      });
      if (org) isPlatformOwner = org.isPlatformOwner;
    }

    if (!isDraft && isJobOrVolunteer && !isPlatformOwner) {
      if (!metadata.jobChallenges || metadata.jobChallenges.length === 0) {
        return { success: false, error: 'You must select at least one challenge this role addresses.' };
      }
    }
    if (metadata.isExternal && !finalOrganizationId) {
      // Create external organization
      const extOrg = await prisma.organization.create({
        data: {
          name: metadata.externalEntityName || 'External Organization',
          slug: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          legalName: metadata.externalEntityShortName,
          country: metadata.externalCountry,
          state: metadata.externalState,
          lga: metadata.externalLga,
          logoUrl: metadata.externalEntityLogoUrl,
          isExternal: true,
          rank: 1, // Or whatever rank is deemed appropriate for external entities
          challenges: metadata.organizationChallenges ? JSON.stringify(metadata.organizationChallenges) : undefined,
          subcategories: metadata.organizationSubcategories ? JSON.stringify(metadata.organizationSubcategories) : undefined,
        }
      });
      finalOrganizationId = extOrg.id;
    }

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
        organizationId: finalOrganizationId,
        
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
        } : {}),
      },
    });

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
      select: {
        id: true,
        title: true,
        category: true,
        postedAt: true
      }
    });
    
    const formattedDrafts = drafts.map(d => ({
      id: d.id,
      title: d.title || 'Untitled Listing',
      category: d.category,
      lastEdited: d.postedAt.toLocaleDateString() // Simplistic relative time placeholder
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
