'use server';

import { prisma } from '@/lib/db/client';
import { syncCalendarEvent, removeCalendarEvent } from '@/lib/calendar-sync';

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
  commodity?: string;
  expiresAt?: string | Date | null;
}

export async function createTradeListing(data: CreateTradeListingPayload) {
  try {
    console.log("CREATE TRADE LISTING PAYLOAD:", JSON.stringify(data, null, 2));
    const isDraft = data.status === 'draft';

    // Title and Location are strictly required even for drafts
    if (!data.title || !data.location) {
      return { success: false, error: 'Title and location are required.' };
    }

    // Strict validation for active listings
    if (!isDraft) {
      const missing = [];
      if (!data.category) missing.push(`category='${data.category}'`);
      if (!data.priceOrAsk) missing.push(`priceOrAsk='${data.priceOrAsk}'`);
      // LGA (City) is intentionally omitted from strict validation because it is optional for Remote roles
      if (!data.postedById) missing.push(`postedById='${data.postedById}'`);

      if (missing.length > 0) {
        return { success: false, error: `Missing required fields for publishing: ${missing.join(', ')}. DEBUG: payload is ${JSON.stringify(data).substring(0, 150)}` };
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
    } else if (metadata.isExternal && metadata.externalEntityId) {
      finalOrganizationId = metadata.externalEntityId;
      
      // Fix: Update the existing external organization with any newly provided details
      const updateData: any = {};
      if (metadata.externalCountry?.name || metadata.externalCountry) updateData.country = metadata.externalCountry?.name || metadata.externalCountry;
      if (metadata.externalState?.name || metadata.externalState) updateData.state = metadata.externalState?.name || metadata.externalState;
      if (metadata.externalLga?.name || metadata.externalLga) updateData.lga = metadata.externalLga?.name || metadata.externalLga;
      if (metadata.externalEntityLogoUrl) updateData.logoUrl = metadata.externalEntityLogoUrl;
      if (metadata.organizationChallenges && metadata.organizationChallenges.length > 0) updateData.challenges = JSON.stringify(metadata.organizationChallenges);
      if (metadata.organizationSubcategories && metadata.organizationSubcategories.length > 0) updateData.subcategories = JSON.stringify(metadata.organizationSubcategories);

      if (Object.keys(updateData).length > 0) {
        await prisma.organization.update({
          where: { id: finalOrganizationId },
          data: updateData
        });
      }
    } else if (metadata.isExternal && metadata.externalEntityName) {
      // Auto-create a ghost organization for external entities OR reuse an existing one to prevent duplicates
      let baseSlug = metadata.externalEntityName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      let existingOrg = await prisma.organization.findUnique({ where: { slug: baseSlug } });
      


      if (existingOrg) {
        finalOrganizationId = existingOrg.id;
        
        // If it's a ghost org (rank 1), passively update it with any new details the user provided
        if (existingOrg.rank === 1) {
          const updateData: any = {};
          if (metadata.externalCountry?.name || metadata.externalCountry) updateData.country = metadata.externalCountry?.name || metadata.externalCountry;
          if (metadata.externalState?.name || metadata.externalState) updateData.state = metadata.externalState?.name || metadata.externalState;
          if (metadata.externalLga?.name || metadata.externalLga) updateData.lga = metadata.externalLga?.name || metadata.externalLga;
          if (metadata.externalEntityLogoUrl && !existingOrg.logoUrl) updateData.logoUrl = metadata.externalEntityLogoUrl;

          if (Object.keys(updateData).length > 0) {
            await prisma.organization.update({
              where: { id: existingOrg.id },
              data: updateData
            });
          }
        }
      } else {
        // Only create a brand new organization if it truly doesn't exist
        const extOrg = await prisma.organization.create({
          data: {
            name: metadata.externalEntityName,
            slug: baseSlug, // We know it's unique now
            isExternal: true,
            rank: 1, // Start as an unclaimed organization
            country: metadata.externalCountry?.name || metadata.externalCountry,
            state: metadata.externalState?.name || metadata.externalState,
            lga: metadata.externalLga?.name || metadata.externalLga,
            logoUrl: metadata.externalEntityLogoUrl || undefined,
            challenges: metadata.organizationChallenges ? JSON.stringify(metadata.organizationChallenges) : undefined,
            subcategories: metadata.organizationSubcategories ? JSON.stringify(metadata.organizationSubcategories) : undefined
          }
        });
        finalOrganizationId = extOrg.id;
      }
    }


    let initialStatus = data.status || 'draft';
    if (!isDraft && finalOrganizationId && data.postedById) {
      const { determineInitialContentStatus } = await import('./org-approval');
      const calculatedStatus = await determineInitialContentStatus(data.postedById, finalOrganizationId);
      if (calculatedStatus === 'pending_org_review') {
        initialStatus = 'pending_org_review';
      }
    }

    const listingData = {
      category: data.category || 'jobs',
      title: data.title,
      description: data.description || '',
      priceOrAsk: data.priceOrAsk || '0',
      location: data.location,
      lga: data.lga || '',
      commodity: data.commodity || metadata.sector || undefined,
      postedById: data.postedById,
      imageUrl: data.imageUrl,
      nervePointsCost: data.nervePointsCost || 0,
      status: initialStatus,
      organizationId: finalOrganizationId,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      
      // Job-specific mappings
      ...(isJobOrVolunteer ? {
        jobSource: metadata.jobSource || undefined,
        compType: metadata.compType || undefined,
        npReward: metadata.npAmount || undefined,
        targetTenantId: metadata.targetTenantId || undefined,
        currency: metadata.currency || undefined,
        minSalary: metadata.minSalary || undefined,
        maxSalary: metadata.maxSalary || undefined,
        duration: metadata.duration || undefined,
        startDate: metadata.startDate ? new Date(metadata.startDate) : undefined,
        endDate: metadata.endDate ? new Date(metadata.endDate) : undefined,
        workModel: metadata.workModel || undefined,
        jobFunction: metadata.jobFunction || undefined,
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

    // --- Sync to Calendar ---
    const isJob = listing.category === 'jobs' || listing.category === 'volunteer';
    const sourceType = isJob ? 'job' : 'listing';
    const eventDate = listing.expiresAt || listing.endDate || listing.startDate;

    if (listing.status !== 'draft' && eventDate) {
      let orgName: string | undefined;
      if (listing.organizationId) {
        const org = await prisma.organization.findUnique({
          where: { id: listing.organizationId },
          select: { name: true }
        });
        orgName = org?.name;
      }

      let dateType: 'DEADLINE' | 'START_TIME' | 'DATE_RANGE' = 'DEADLINE';
      if (listing.startDate && listing.endDate) {
        dateType = 'DATE_RANGE';
      } else if (listing.startDate) {
        dateType = 'START_TIME';
      }

      await syncCalendarEvent({
        sourceType,
        sourceId: listing.id,
        dateType,
        title: listing.title,
        date: eventDate,
        endDate: listing.endDate ?? undefined,
        imageUrl: listing.imageUrl ?? undefined,
        category: listing.category,
        organizationName: orgName,
        tenantId: 'foodnerve',
        visibility: listing.organizationId ? 'organization' : 'personal',
        organizationId: listing.organizationId || undefined,
        userId: listing.postedById,
      });
    } else {
      await removeCalendarEvent(sourceType, listing.id);
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

export async function getUserPublishedListings(userId: string) {
  try {
    const listings = await prisma.tradeListing.findMany({
      where: {
        postedById: userId,
        status: 'active'
      },
      orderBy: {
        postedAt: 'desc'
      },
      include: {
        organization: true
      }
    });
    return listings;
  } catch (error) {
    console.error('Failed to get user published listings:', error);
    return [];
  }
}

export async function deleteTradeListing(listingId: string, userId: string) {
  try {
    const listing = await prisma.tradeListing.findUnique({
      where: { id: listingId }
    });
    if (!listing) return { success: false, error: 'Not found' };
    if (listing.postedById !== userId) return { success: false, error: 'Unauthorized' };

    await removeCalendarEvent('job', listingId);

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
  } catch (error) {
    console.error("Error fetching careers listings:", error);
    return { success: false, error: String(error) };
  }
}

export async function searchExternalOrganizations(query: string, userId?: string, role?: string) {
  if (!query || query.trim() === '') return [];
  
  try {
    const isAdmin = role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'super_admin';

    const orgs = await prisma.organization.findMany({
      where: {
        name: {
          contains: query
        },
        OR: [
          // 1. Show unclaimed organizations
          { rank: 1 },
          // 2. Show organizations where the user is an official member
          ...(userId ? [{
            members: {
              some: {
                userId: userId
              }
            }
          }] : []),
          // 3. Ensure the platform owner is fetched so we can show it to Admins
          { isPlatformOwner: true }
        ]
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        country: true,
        state: true,
        isExternal: true,
        rank: true,
        isPlatformOwner: true
      },
      take: 10
    });

    // Apply the NOT logic properly after fetching if Prisma's NOT AND doesn't work perfectly, but Prisma handles it.
    // Wait, the NOT clause above with undefined might cause issues. Let's write it cleanly.
    return isAdmin ? orgs : orgs.filter(o => !o.isPlatformOwner);
    
  } catch (error) {
    console.error("Error searching organizations:", error);
    return [];
  }
}

/**
 * Fetches organization trade listings for governance and approval management in the Trade Studio.
 */
export async function getOrgTradeListings(organizationId: string, userId?: string) {
  try {
    const listings = await prisma.tradeListing.findMany({
      where: {
        organizationId,
        status: { in: ['pending_org_review', 'rejected', 'active', 'draft'] }
      },
      include: {
        postedBy: {
          select: { id: true, name: true, avatarUrl: true, email: true }
        },
        organization: {
          select: { id: true, name: true, logoUrl: true, verified: true }
        }
      },
      orderBy: { postedAt: 'desc' }
    });

    const pending = listings.filter(l => l.status === 'pending_org_review');
    const rejected = listings.filter(l => l.status === 'rejected');
    const active = listings.filter(l => l.status === 'active');
    const drafts = listings.filter(l => l.status === 'draft');

    return {
      success: true,
      pending,
      rejected,
      active,
      drafts,
      all: listings
    };
  } catch (error: any) {
    console.error('Failed to fetch org trade listings:', error);
    return { success: false, error: error?.message || 'Failed to fetch org trade listings.' };
  }
}

/**
 * Culls back / revokes an active organization listing, setting status back to 'rejected' or 'pending_org_review'.
 */
export async function cullBackTradeListing(listingId: string, userId: string, targetStatus: 'rejected' | 'pending_org_review' = 'rejected') {
  try {
    const listing = await prisma.tradeListing.findUnique({
      where: { id: listingId },
      include: { organization: true }
    });

    if (!listing) return { success: false, error: 'Listing not found.' };

    // Verify user permission (Admin/Owner of org OR original author)
    if (listing.organizationId) {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: listing.organizationId
          }
        }
      });

      const isOrgAdmin = membership?.role === 'owner' || membership?.role === 'admin';
      const isAuthor = listing.postedById === userId;

      if (!isOrgAdmin && !isAuthor) {
        return { success: false, error: 'Unauthorized to cull back this listing.' };
      }
    }

    const updated = await prisma.tradeListing.update({
      where: { id: listingId },
      data: { status: targetStatus }
    });

    return { success: true, listing: updated };
  } catch (error: any) {
    console.error('Failed to cull back listing:', error);
    return { success: false, error: error?.message || 'Failed to cull back listing.' };
  }
}

/**
 * Fetches active ecosystem listings (jobs, volunteering, and deal room campaigns)
 * with commodity, category, and subcategory metadata for Learn article embeds.
 */
export async function getEcosystemEmbedOptions(options?: {
  searchQuery?: string;
  limit?: number;
}) {
  try {
    const where: any = {
      status: 'active',
      category: { in: ['jobs', 'volunteer'] },
    };

    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
        { commodity: { contains: q } },
        { jobFunction: { contains: q } },
        { organization: { name: { contains: q } } }
      ];
    }

    const [rawJobs, rawCampaigns] = await Promise.all([
      prisma.tradeListing.findMany({
        where,
        take: options?.limit || 50,
        orderBy: { postedAt: 'desc' },
        include: {
          organization: {
            select: { id: true, name: true, logoUrl: true, isPlatformOwner: true, verified: true }
          },
          postedBy: {
            select: { id: true, name: true, avatarUrl: true }
          }
        }
      }),
      prisma.campaign.findMany({
        where: {
          status: 'funding',
          ...(options?.searchQuery && options.searchQuery.trim() ? {
            OR: [
              { title: { contains: options.searchQuery.trim() } },
              { description: { contains: options.searchQuery.trim() } },
              { originTag: { contains: options.searchQuery.trim() } },
            ]
          } : {})
        },
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: {
            select: { id: true, name: true, logoUrl: true }
          }
        }
      })
    ]);

    const jobs = rawJobs.map((j) => {
      let challenges: string[] = [];
      try {
        if (j.challenges) challenges = JSON.parse(j.challenges);
      } catch (e) {}

      let subcategories: string[] = [];
      try {
        if (j.subcategories) subcategories = JSON.parse(j.subcategories);
      } catch (e) {}

      let compText = '';
      if (j.compType === 'fiat' && (j.minSalary || j.maxSalary)) {
        const curr = j.currency || '₦';
        if (j.minSalary && j.maxSalary) {
          compText = `${curr}${j.minSalary.toLocaleString()} - ${curr}${j.maxSalary.toLocaleString()}`;
        } else if (j.minSalary) {
          compText = `${curr}${j.minSalary.toLocaleString()}+`;
        } else {
          compText = `Up to ${curr}${j.maxSalary?.toLocaleString()}`;
        }
        if (j.duration) compText += ` (${j.duration})`;
      } else if (j.npReward) {
        compText = `${j.npReward.toLocaleString()} NP Reward`;
      } else if (j.priceOrAsk) {
        compText = j.priceOrAsk;
      }

      return {
        id: j.id,
        title: j.title,
        category: j.category, // 'jobs' | 'volunteer'
        commodity: j.commodity || '',
        organization: j.organization?.name || (j.jobSource === 'internal_foodnerve' ? 'FoodNerve Core' : 'Independent Operator'),
        organizationLogo: j.organization?.logoUrl || '',
        location: j.location || 'Pan-African',
        workModel: j.workModel || 'onsite',
        jobFunction: j.jobFunction || 'AgTech',
        challenges,
        subcategories,
        compType: j.compType || 'fiat',
        compensationText: compText,
        url: `/careers/${j.id}`,
        postedAt: j.postedAt.toISOString(),
      };
    });

    const deals = rawCampaigns.map((c) => {
      const pct = c.goalAmount > 0 ? Math.round((c.raisedAmount / c.goalAmount) * 100) : 0;
      return {
        id: c.id,
        title: c.title,
        category: 'deal',
        commodity: c.originTag || '',
        organization: c.organization?.name || 'Deal Syndicate / SPV',
        organizationLogo: c.organization?.logoUrl || '',
        location: 'Pan-African Deal Room',
        workModel: `${c.tier?.toUpperCase() || 'VENTURE'} SPV`,
        jobFunction: 'Capital Allocation',
        challenges: [],
        subcategories: [],
        compType: 'deal',
        compensationText: `Target: ₦${c.goalAmount.toLocaleString()} (${pct}% Funded)`,
        url: `/support/${c.id}`,
        postedAt: c.createdAt.toISOString(),
      };
    });

    return { success: true, jobs, deals };
  } catch (error: any) {
    console.error('Failed to get ecosystem embed options:', error);
    return { success: false, error: error?.message || 'Failed to fetch options', jobs: [], deals: [] };
  }
}

/**
 * Fetches a single trade listing by ID for form editing/hydration.
 */
export async function getTradeListingById(listingId: string) {
  try {
    const listing = await prisma.tradeListing.findUnique({
      where: { id: listingId },
      include: {
        organization: true,
        postedBy: {
          select: { id: true, name: true, avatarUrl: true, email: true }
        }
      }
    });

    if (!listing) return { success: false, error: 'Listing not found.' };

    return { success: true, listing };
  } catch (error: any) {
    console.error('Failed to fetch listing by ID:', error);
    return { success: false, error: error?.message || 'Failed to fetch listing.' };
  }
}
