'use server';

import { prisma } from '@/lib/db/client';

export interface SubmitJobApplicationPayload {
  listingId: string;
  firebaseUid?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateAvatar?: string;
  candidateRank?: number;
  candidateLga?: string;
  candidateState?: string;
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  customAnswers?: Record<string, any> | string;
  pitchTone?: string;
}

export async function submitJobApplication(payload: SubmitJobApplicationPayload) {
  try {
    const { listingId, firebaseUid } = payload;
    if (!listingId) {
      return { success: false, error: 'Listing ID is required.' };
    }

    // Verify listing exists
    const listing = await prisma.tradeListing.findUnique({
      where: { id: listingId },
      include: { organization: true },
    });

    if (!listing) {
      return { success: false, error: 'Listing not found.' };
    }

    let userId: string | null = null;
    let name = payload.candidateName || 'Anonymous Applicant';
    let email = payload.candidateEmail || '';
    let phone = payload.candidatePhone || null;
    let avatarUrl = payload.candidateAvatar || null;
    let rank = payload.candidateRank || 1;
    let lga = payload.candidateLga || null;
    let state = payload.candidateState || null;

    // If user is logged in, grab their canonical profile to ensure verified snapshot
    if (firebaseUid) {
      const user = await prisma.user.findFirst({
        where: { firebaseUid },
      });

      if (user) {
        userId = user.id;
        name = user.name || name;
        email = user.email || email;
        avatarUrl = user.avatarUrl || avatarUrl;
        rank = user.rank || rank;
        lga = user.lga || lga;
        state = user.location || state;
      }
    }

    if (!email) {
      return { success: false, error: 'Candidate email is required to submit an application.' };
    }

    // Check if user already applied to this specific listing
    if (userId) {
      const existing = await prisma.jobApplication.findFirst({
        where: { listingId, userId },
      });
      if (existing) {
        return {
          success: false,
          error: 'You have already submitted an application for this opportunity.',
          existingApplicationId: existing.id,
        };
      }
    }

    const customAnswersStr = typeof payload.customAnswers === 'object'
      ? JSON.stringify(payload.customAnswers)
      : (payload.customAnswers || null);

    const application = await prisma.jobApplication.create({
      data: {
        listingId,
        userId,
        candidateName: name,
        candidateEmail: email,
        candidatePhone: phone,
        candidateAvatar: avatarUrl,
        candidateRank: rank,
        candidateLga: lga,
        candidateState: state,
        coverLetter: payload.coverLetter || null,
        resumeUrl: payload.resumeUrl || null,
        portfolioUrl: payload.portfolioUrl || null,
        customAnswers: customAnswersStr,
        pitchTone: payload.pitchTone || null,
        status: 'new',
      },
    });

    return {
      success: true,
      applicationId: application.id,
      application,
    };
  } catch (error: any) {
    console.error('SERVER LOG - Failed to submit job application:', error);
    return { success: false, error: error.message || 'Failed to submit application.' };
  }
}

export interface GetOrgJobApplicationsOptions {
  listingId?: string;
  status?: string;
  search?: string;
  rankMin?: number;
}

export async function getOrgJobApplications(organizationId: string, options?: GetOrgJobApplicationsOptions) {
  try {
    if (!organizationId) {
      return { success: false, error: 'Organization ID is required.', data: [] };
    }

    const whereClause: any = {
      listing: {
        organizationId: organizationId,
      },
    };

    if (options?.listingId && options.listingId !== 'all') {
      whereClause.listingId = options.listingId;
    }

    if (options?.status && options.status !== 'all') {
      whereClause.status = options.status;
    }

    if (options?.rankMin) {
      whereClause.candidateRank = { gte: options.rankMin };
    }

    if (options?.search) {
      const q = options.search.trim();
      whereClause.OR = [
        { candidateName: { contains: q } },
        { candidateEmail: { contains: q } },
        { coverLetter: { contains: q } },
      ];
    }

    const applications = await prisma.jobApplication.findMany({
      where: whereClause,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            category: true,
            jobFunction: true,
            status: true,
            priceOrAsk: true,
            location: true,
            organization: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                slug: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            rank: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: applications };
  } catch (error: any) {
    console.error('SERVER LOG - Failed to get org job applications:', error);
    return { success: false, error: error.message || 'Failed to retrieve applications.', data: [] };
  }
}

export async function getListingJobApplications(listingId: string) {
  try {
    if (!listingId) {
      return { success: false, error: 'Listing ID is required.', data: [] };
    }

    const applications = await prisma.jobApplication.findMany({
      where: { listingId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            rank: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: applications };
  } catch (error: any) {
    console.error('SERVER LOG - Failed to get listing job applications:', error);
    return { success: false, error: error.message || 'Failed to retrieve applications.', data: [] };
  }
}

export async function updateJobApplicationStatus(
  applicationId: string,
  updates: { status?: string; internalNotes?: string; rating?: number }
) {
  try {
    if (!applicationId) {
      return { success: false, error: 'Application ID is required.' };
    }

    const data: any = {};
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.internalNotes !== undefined) data.internalNotes = updates.internalNotes;
    if (updates.rating !== undefined) data.rating = updates.rating;

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data,
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('SERVER LOG - Failed to update job application status:', error);
    return { success: false, error: error.message || 'Failed to update application.' };
  }
}

export async function deleteJobApplication(applicationId: string) {
  try {
    if (!applicationId) {
      return { success: false, error: 'Application ID is required.' };
    }

    await prisma.jobApplication.delete({
      where: { id: applicationId },
    });

    return { success: true };
  } catch (error: any) {
    console.error('SERVER LOG - Failed to delete job application:', error);
    return { success: false, error: error.message || 'Failed to delete application.' };
  }
}

export async function getOrgApplicantStats(organizationId: string) {
  try {
    if (!organizationId) {
      return {
        success: true,
        stats: { total: 0, new: 0, reviewing: 0, shortlisted: 0, interview: 0, hired: 0, rejected: 0 },
      };
    }

    const apps = await prisma.jobApplication.findMany({
      where: {
        listing: {
          organizationId: organizationId,
        },
      },
      select: {
        status: true,
      },
    });

    const stats = {
      total: apps.length,
      new: apps.filter((a: any) => a.status === 'new').length,
      reviewing: apps.filter((a: any) => a.status === 'reviewing').length,
      shortlisted: apps.filter((a: any) => a.status === 'shortlisted').length,
      interview: apps.filter((a: any) => a.status === 'interview').length,
      hired: apps.filter((a: any) => a.status === 'hired').length,
      rejected: apps.filter((a: any) => a.status === 'rejected').length,
    };

    return { success: true, stats };
  } catch (error: any) {
    console.error('SERVER LOG - Failed to get org applicant stats:', error);
    return {
      success: false,
      error: error.message,
      stats: { total: 0, new: 0, reviewing: 0, shortlisted: 0, interview: 0, hired: 0, rejected: 0 },
    };
  }
}
