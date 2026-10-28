'use server';

import { prisma } from '@/lib/db/client';
import { syncCalendarEvent, removeCalendarEvent } from '@/lib/calendar-sync';
import { notifySearchEnginesOfContent } from '@/lib/seo/indexnow';
const CAREER_CATEGORIES = ['jobs', 'job', 'volunteer', 'internship', 'internships'];

export interface PendingContentItem {
  id: string;
  type: 'trade' | 'job' | 'learn' | 'meet' | 'wiki';
  title: string;
  description?: string;
  status: string;
  authorId: string;
  authorName?: string;
  authorAvatarUrl?: string;
  organizationId: string;
  createdAt: string;
  editUrl: string;
}

/**
 * Determines whether new content posted under an organization can be auto-published
 * or must enter the 'pending_org_review' state based on the user's role.
 */
export async function determineInitialContentStatus(
  userId: string,
  organizationId?: string | null
): Promise<string> {
  if (!organizationId) {
    return 'published';
  }

  try {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!membership) {
      return 'published';
    }

    // Owners and Admins can auto-publish on behalf of the org
    if (membership.role === 'owner' || membership.role === 'admin') {
      return 'published';
    }

    // Employees and Members require approval
    return 'pending_org_review';
  } catch (error) {
    console.error('Error checking organization member role:', error);
    return 'published';
  }
}

/**
 * Fetches all pending content items awaiting approval for a specific organization.
 */
export async function getPendingOrgContent(organizationId: string): Promise<PendingContentItem[]> {
  try {
    const [tradeListings, learnContent, meetEvents, wikiDocs] = await Promise.all([
      prisma.tradeListing.findMany({
        where: {
          organizationId,
          status: 'pending_org_review',
        },
        include: {
          postedBy: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { postedAt: 'desc' },
      }),

      prisma.learnContent.findMany({
        where: {
          organizationId,
          status: 'pending_org_review',
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.meetEvent.findMany({
        where: {
          organizationId,
          status: 'pending_org_review',
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.omniWikiDoc.findMany({
        where: {
          organizationId,
          status: 'pending_org_review',
        },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const pendingItems: PendingContentItem[] = [];

    tradeListings.forEach((item) => {
      const isJob = CAREER_CATEGORIES.includes(item.category);
      pendingItems.push({
        id: item.id,
        type: isJob ? 'job' : 'trade',
        title: item.title,
        description: item.description,
        status: item.status,
        authorId: item.postedById,
        authorName: item.postedBy?.name || 'Unknown',
        authorAvatarUrl: item.postedBy?.avatarUrl || undefined,
        organizationId,
        createdAt: item.postedAt.toISOString(),
        editUrl: isJob
          ? `/innovations/careers?edit=${item.id}`
          : `/trade?edit=${item.id}`,
      });
    });

    learnContent.forEach((item) => {
      pendingItems.push({
        id: item.id,
        type: 'learn',
        title: item.title,
        description: item.description,
        status: item.status,
        authorId: item.authorId || '',
        authorName: item.authorName || 'Unknown',
        authorAvatarUrl: item.authorAvatarUrl || undefined,
        organizationId,
        createdAt: item.createdAt.toISOString(),
        editUrl: `/learn/create?id=${item.id}`,
      });
    });

    meetEvents.forEach((item) => {
      pendingItems.push({
        id: item.id,
        type: 'meet',
        title: item.title,
        description: item.description,
        status: item.status,
        authorId: item.hostUserId || '',
        authorName: item.hostName || 'Unknown',
        authorAvatarUrl: item.hostAvatarUrl || undefined,
        organizationId,
        createdAt: item.createdAt.toISOString(),
        editUrl: `/meet?edit=${item.id}`,
      });
    });

    wikiDocs.forEach((item) => {
      pendingItems.push({
        id: item.id,
        type: 'wiki',
        title: item.title,
        status: item.status,
        authorId: item.authorId,
        authorName: item.author?.name || 'Unknown',
        authorAvatarUrl: item.author?.avatarUrl || undefined,
        organizationId,
        createdAt: item.createdAt.toISOString(),
        editUrl: `/wiki/edit?id=${item.id}`,
      });
    });

    return pendingItems;
  } catch (error) {
    console.error('Failed to fetch pending org content:', error);
    return [];
  }
}

/**
 * Fetches organization submissions for a specific user (Pending, Published, Rejected).
 */
export async function getOrgSubmissionsForUser(
  userId: string,
  organizationId?: string | null
): Promise<PendingContentItem[]> {
  try {
    const whereOrg = organizationId ? { organizationId } : { organizationId: { not: null } };

    const [tradeListings, learnContent, meetEvents, wikiDocs] = await Promise.all([
      prisma.tradeListing.findMany({
        where: {
          postedById: userId,
          ...whereOrg,
          status: { in: ['pending_org_review', 'rejected', 'published'] },
        },
        orderBy: { postedAt: 'desc' },
      }),

      prisma.learnContent.findMany({
        where: {
          authorId: userId,
          ...whereOrg,
          status: { in: ['pending_org_review', 'rejected', 'published'] },
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.meetEvent.findMany({
        where: {
          hostUserId: userId,
          ...whereOrg,
          status: { in: ['pending_org_review', 'rejected', 'published'] },
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.omniWikiDoc.findMany({
        where: {
          authorId: userId,
          ...whereOrg,
          status: { in: ['pending_org_review', 'rejected', 'published'] },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const submissions: PendingContentItem[] = [];

    tradeListings.forEach((item) => {
      const isJob = CAREER_CATEGORIES.includes(item.category);
      submissions.push({
        id: item.id,
        type: isJob ? 'job' : 'trade',
        title: item.title,
        description: item.description,
        status: item.status,
        authorId: userId,
        organizationId: item.organizationId!,
        createdAt: item.postedAt.toISOString(),
        editUrl: isJob
          ? `/innovations/careers?edit=${item.id}`
          : `/trade?edit=${item.id}`,
      });
    });

    learnContent.forEach((item) => {
      submissions.push({
        id: item.id,
        type: 'learn',
        title: item.title,
        description: item.description,
        status: item.status,
        authorId: userId,
        organizationId: item.organizationId!,
        createdAt: item.createdAt.toISOString(),
        editUrl: `/learn/create?id=${item.id}`,
      });
    });

    meetEvents.forEach((item) => {
      submissions.push({
        id: item.id,
        type: 'meet',
        title: item.title,
        description: item.description,
        status: item.status,
        authorId: userId,
        organizationId: item.organizationId!,
        createdAt: item.createdAt.toISOString(),
        editUrl: `/meet?edit=${item.id}`,
      });
    });

    wikiDocs.forEach((item) => {
      submissions.push({
        id: item.id,
        type: 'wiki',
        title: item.title,
        status: item.status,
        authorId: userId,
        organizationId: item.organizationId!,
        createdAt: item.createdAt.toISOString(),
        editUrl: `/wiki/edit?id=${item.id}`,
      });
    });

    return submissions;
  } catch (error) {
    console.error('Failed to fetch user org submissions:', error);
    return [];
  }
}

/**
 * Approves a pending organization content item (sets status to 'published').
 */
export async function approveOrgContent(
  contentId: string,
  contentType: 'trade' | 'job' | 'learn' | 'meet' | 'wiki',
  reviewerUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (contentType === 'trade' || contentType === 'job') {
      const listing = await prisma.tradeListing.update({
        where: { id: contentId },
        data: { status: 'active' },
        include: {
          organization: { select: { name: true } },
        },
      });

      const isJobOrVolunteer = contentType === 'job' || CAREER_CATEGORIES.includes(listing.category);
      const sourceType = isJobOrVolunteer ? 'job' : 'listing';
      const eventDate = listing.expiresAt || listing.endDate || listing.startDate;

      if (eventDate) {
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
          organizationName: listing.organization?.name,
          tenantId: 'foodnerve',
          visibility: listing.organizationId ? 'organization' : 'personal',
          organizationId: listing.organizationId || undefined,
          userId: listing.postedById,
        });
      }

      if (isJobOrVolunteer) {
        notifySearchEnginesOfContent({
          domainHost: 'foodnerve.com',
          paths: [`/careers/${listing.id}`],
        }).catch((err) => {
          console.error('[IndexNow] Background career approval push error:', err);
        });
      }
    } else if (contentType === 'learn') {
      const content = await prisma.learnContent.update({
        where: { id: contentId },
        data: { status: 'published' },
        include: {
          organization: { select: { name: true } },
          livestream: {
            include: { blocks: { orderBy: { orderIndex: 'asc' } } },
          },
        },
      });

      let dateType: 'START_TIME' | 'PUBLISH_DATE' | 'DATE_RANGE' = 'PUBLISH_DATE';
      if (content.type === 'livestream' || content.type === 'class') {
        dateType = 'START_TIME';
      }

      const startDate = content.targetDate || content.createdAt;
      let calculatedEndDate: Date | undefined = undefined;

      if (content.type === 'livestream' && startDate) {
        let totalDurationMinutes = 0;
        const blocks = content.livestream?.blocks;
        if (blocks && Array.isArray(blocks)) {
          for (const block of blocks) {
            let dStr = (block as any).durationStr;
            if (!dStr && block.content) {
              try {
                const parsed = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
                dStr = parsed?.durationStr;
              } catch (e) {}
            }
            if (dStr && typeof dStr === 'string') {
              const match = dStr.match(/(\d+)\s*m/i);
              if (match) {
                totalDurationMinutes += parseInt(match[1], 10);
              }
            } else {
              totalDurationMinutes += 2;
            }
          }
        }
        if (totalDurationMinutes < 15) {
          totalDurationMinutes = 35;
        }
        calculatedEndDate = new Date(new Date(startDate).getTime() + totalDurationMinutes * 60 * 1000);
      }

      await syncCalendarEvent({
        sourceType: content.type,
        sourceId: content.id,
        slug: content.slug,
        dateType,
        title: content.title,
        date: startDate,
        endDate: calculatedEndDate,
        imageUrl: content.thumbnailUrl ?? undefined,
        category: content.category ?? content.type,
        organizationName: content.organization?.name,
        status: 'upcoming',
        tenantId: 'foodnerve',
        visibility: content.organization?.name ? 'organization' : 'society',
        organizationId: content.organizationId || undefined,
        userId: content.authorId,
      });

      const contentPaths = [
        content.type === 'livestream'
          ? `/learn/livestream/${content.id}`
          : `/learn/article/${content.slug}`,
      ];

      notifySearchEnginesOfContent({
        domainHost: 'foodnerve.org',
        paths: contentPaths,
      }).catch((err) => {
        console.error('[IndexNow] Background learn approval push error:', err);
      });
    } else if (contentType === 'meet') {
      await prisma.meetEvent.update({
        where: { id: contentId },
        data: { status: 'published' },
      });
    } else if (contentType === 'wiki') {
      await prisma.omniWikiDoc.update({
        where: { id: contentId },
        data: { status: 'published' },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to approve content:', error);
    return { success: false, error: error?.message || 'Failed to approve content' };
  }
}

/**
 * Rejects a pending organization content item (sets status to 'rejected').
 */
export async function rejectOrgContent(
  contentId: string,
  contentType: 'trade' | 'job' | 'learn' | 'meet' | 'wiki',
  reviewerUserId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (contentType === 'trade' || contentType === 'job') {
      const listing = await prisma.tradeListing.update({
        where: { id: contentId },
        data: { status: 'rejected' },
        select: { category: true },
      });
      const isJob = contentType === 'job' || CAREER_CATEGORIES.includes(listing.category);
      await removeCalendarEvent(isJob ? 'job' : 'listing', contentId).catch(() => {});
    } else if (contentType === 'learn') {
      const content = await prisma.learnContent.update({
        where: { id: contentId },
        data: { status: 'rejected' },
        select: { type: true },
      });
      await removeCalendarEvent(content.type, contentId).catch(() => {});
    } else if (contentType === 'meet') {
      await prisma.meetEvent.update({
        where: { id: contentId },
        data: { status: 'rejected' },
      });
    } else if (contentType === 'wiki') {
      await prisma.omniWikiDoc.update({
        where: { id: contentId },
        data: { status: 'rejected' },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to reject content:', error);
    return { success: false, error: error?.message || 'Failed to reject content' };
  }
}
