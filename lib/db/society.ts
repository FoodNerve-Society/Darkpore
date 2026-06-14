"use server";

import { prisma } from '@/lib/db/client';

export type TradeCategory = 'group-buy' | 'flash-sale' | 'swap' | 'need' | 'jobs';

export interface TradeListing {
  id: string;
  category: TradeCategory;
  title: string;
  description: string;
  commodity?: string;
  quantity?: string;
  priceOrAsk: string;
  location: string;
  lga: string;
  postedBy: { name: string; avatarUrl: string; isVerified: boolean; };
  postedAt: string;
  expiresAt?: string;
  urgency: 'normal' | 'urgent' | 'expiring';
  status: 'active' | 'fulfilled' | 'expired';
  slots?: { filled: number; total: number; };
  swapOffer?: string;
  swapWant?: string;
  isBoosted: boolean;
  imageUrl: string;
  nervePointsCost?: number;
  wahaalaCategories?: string[];
}

export interface MarketPrice {
  commodity: string;
  currentPrice: string;
  previousPrice: string;
  unit: string;
  change: number;
  region: string;
}

export type MemberRole = 'farmer' | 'processor' | 'logistics' | 'investor' | 'researcher' | 'student' | 'chef' | 'vendor';

export interface SocietyMember {
  id: string;
  name: string;
  role: MemberRole;
  avatarUrl: string;
  location: string;
  lga: string;
  specialization: string;
  subSector: string;
  bio: string;
  nervePoints: number;
  isOnline: boolean;
  isVerified: boolean;
  wahaalaCategories: string[];
  rating: number;
  reviewCount: number;
  joinedAt: string;
}

export interface MeetEvent {
  id: string;
  title: string;
  type: 'webinar' | 'field-day' | 'workshop' | 'meetup';
  date: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  hostName: string;
  hostAvatarUrl: string;
  description: string;
  imageUrl: string;
  isVirtual: boolean;
  wahaalaCategories?: string[];
}

export type LearnSwimlane = 'livestreams' | 'classes' | 'videos' | 'articles' | 'reports';

export interface LearnContent {
  id: string;
  swimlane: LearnSwimlane;
  title: string;
  description: string;
  thumbnailUrl: string;
  author: { name: string; avatarUrl: string; isVerified: boolean; };
  createdAt: string;
  duration?: string;
  readTime?: string;
  isPaid: boolean;
  nervePointsCost: number;
  enrolledCount?: number;
  maxEnrollment?: number;
  liveStatus?: 'past' | 'live' | 'upcoming';
  scheduledAt?: string;
  lessonsCount?: number;
  completionRate?: number;
  tags: string[];
  wahaalaCategories?: string[];
}

export type CampaignTier = 'initiative' | 'innovation' | 'industry';
export type CampaignSource = 'foodnerve.org' | 'foodnerve.com' | 'darkpore.com';
export type ContributionType = 'money' | 'time' | 'land' | 'data' | 'equipment';

export interface SupportCampaign {
  id: string;
  tier: CampaignTier;
  source: CampaignSource;
  title: string;
  description: string;
  goalAmount?: number;
  raisedAmount?: number;
  contributionTypes: ContributionType[];
  backers: number;
  volunteersNeeded?: number;
  volunteersJoined?: number;
  nervePointsReward: number;
  deadline: string;
  imageUrl: string;
  organizer: string;
  status: 'active' | 'funded' | 'completed';
  tags: string[];
  wahaalaCategories?: string[];
}



export async function getTradeListings(options?: { category?: TradeCategory; limit?: number }) {
  const result = await prisma.tradeListing.findMany({
    where: {
      status: 'active',
      ...(options?.category ? { category: options.category } : {})
    },
    include: {
      postedBy: true
    },
    orderBy: [
      { isBoosted: 'desc' },
      { postedAt: 'desc' }
    ],
    take: options?.limit
  });

  return JSON.parse(JSON.stringify(result.map((r: any) => ({
    ...r,
    postedBy: {
      name: r.postedBy.name,
      avatarUrl: r.postedBy.avatarUrl || '',
      isVerified: r.postedBy.hasBusinessVerification || r.postedBy.hasKYC
    },
    slots: r.slotsTotal ? { filled: r.slotsFilled || 0, total: r.slotsTotal } : undefined,
    wahaalaCategories: [],
    imageUrl: r.imageUrl || ''
  }))));
}

export async function getMarketPrices() {
  const result = await prisma.marketPrice.findMany({
    orderBy: { updatedAt: 'desc' }
  });
  return JSON.parse(JSON.stringify(result));
}

export async function getMembers(options?: { role?: string; wahaala?: string; limit?: number }) {
  const result = await prisma.user.findMany({
    where: {
      ...(options?.role && options.role !== 'all' ? { role: options.role } : {}),
      ...(options?.wahaala ? { wahaalaCategories: { contains: options.wahaala } } : {})
    },
    orderBy: { lifetimeNP: 'desc' },
    take: options?.limit
  });

  return JSON.parse(JSON.stringify(result.map((r: any) => ({
    id: r.id,
    name: r.name,
    role: r.role as MemberRole,
    avatarUrl: r.avatarUrl || '',
    location: r.location || '',
    lga: r.lga || '',
    specialization: r.specialization || '',
    subSector: r.subSector || '',
    bio: r.bio || '',
    nervePoints: r.lifetimeNP,
    isOnline: false,
    isVerified: r.hasBusinessVerification || r.hasKYC,
    wahaalaCategories: r.wahaalaCategories ? r.wahaalaCategories.split(',') : [],
    rating: 5.0,
    reviewCount: 0,
    joinedAt: r.joinedAt
  }))));
}

export async function getEvents(options?: { limit?: number }) {
  const result = await prisma.meetEvent.findMany({
    orderBy: { date: 'asc' },
    take: options?.limit
  });
  return JSON.parse(JSON.stringify(result.map((r: any) => ({
    ...r,
    hostAvatarUrl: r.hostAvatarUrl || '',
    imageUrl: r.imageUrl || '',
    wahaalaCategories: []
  }))));
}

export async function getLearnContent(options?: { swimlane?: LearnSwimlane; limit?: number }) {
  // Map plural swimlane keys to singular Prisma types
  const typeMap: Record<LearnSwimlane, string> = {
    livestreams: 'livestream',
    classes: 'class',
    videos: 'video',
    articles: 'article',
    reports: 'report'
  };

  const result = await prisma.learnContent.findMany({
    where: {
      ...(options?.swimlane ? { type: typeMap[options.swimlane] } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit
  });

  return JSON.parse(JSON.stringify(result.map((r: any) => {
    // Reverse map Prisma type back to LearnSwimlane for the UI
    const swimlaneMap: Record<string, LearnSwimlane> = {
      livestream: 'livestreams',
      class: 'classes',
      video: 'videos',
      article: 'articles',
      report: 'reports'
    };
    
    let tags = [];
    try { tags = JSON.parse(r.bottleneckTags || '[]'); } catch (e) {}

    return {
      ...r,
      swimlane: swimlaneMap[r.type] || 'articles',
      author: {
        name: r.authorName,
        avatarUrl: r.authorAvatarUrl || '',
        isVerified: r.isVerified
      },
      tags,
      wahaalaCategories: [],
      thumbnailUrl: r.thumbnailUrl || ''
    };
  })));
}

export async function getCampaigns(options?: { tier?: CampaignTier; status?: string; limit?: number }) {
  const result = await prisma.campaign.findMany({
    where: {
      ...(options?.tier ? { tier: options.tier } : {}),
      ...(options?.status ? { status: options.status } : {})
    },
    include: {
      organizer: true
    },
    orderBy: { deadline: 'desc' },
    take: options?.limit
  });

  return JSON.parse(JSON.stringify(result.map((r: any) => ({
    id: r.id,
    tier: r.tier as CampaignTier,
    source: 'foodnerve.org' as CampaignSource,
    title: r.title,
    description: r.description,
    goalAmount: r.goalAmount,
    raisedAmount: r.raisedAmount,
    contributionTypes: ['money'] as ContributionType[],
    backers: r.backerCount,
    volunteersNeeded: 0,
    volunteersJoined: 0,
    nervePointsReward: 0,
    deadline: r.deadline,
    imageUrl: r.imageUrl || '',
    organizer: r.organizer.name,
    status: r.status,
    tags: [],
    wahaalaCategories: []
  }))));
}
