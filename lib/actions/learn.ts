'use server';

import { prisma } from '@/lib/db/client';
import { syncCalendarEvent, removeCalendarEvent } from '@/lib/calendar-sync';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type ArticleBlockPayload = {
  blockType: string;
  orderIndex: number;
  content: string; // JSON string
};

export type CreateLearnContentPayload = {
  id?: string;
  title: string;
  description: string;
  slug: string;
  type: 'article' | 'video' | 'class' | 'livestream' | 'report';
  bottleneckTags: string[]; // We will JSON.stringify this before DB insert
  category?: string;
  subcategory?: string;
  timeframe?: string;
  authorId?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  organizationId?: string | null;
  collaborators?: any[];
  commodity?: string;
  // Specific fields depending on type:
  articleBlocks?: ArticleBlockPayload[];
  videoUrl?: string;
  videoDuration?: string;
  classModules?: number;
  classDuration?: string;
  livestreamUrl?: string;
  livestreamBlocks?: ArticleBlockPayload[];
  reportPdfUrl?: string;
  reportPages?: number;
  thumbnailUrl?: string;
  targetDate?: string;
};

export async function createLearnContent(data: CreateLearnContentPayload, isDraft = false) {
  let finalSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  let targetStatus = isDraft ? 'draft' : 'published';
  if (!isDraft && data.organizationId && data.authorId) {
    const { determineInitialContentStatus } = await import('./org-approval');
    targetStatus = await determineInitialContentStatus(data.authorId, data.organizationId);
  }

  // If approved to publish (not draft and not pending org approval), check if targetDate is scheduled for the future
  if (!isDraft && targetStatus === 'published' && data.targetDate) {
    const targetDateObj = new Date(data.targetDate);
    if (!isNaN(targetDateObj.getTime()) && targetDateObj.getTime() > Date.now()) {
      targetStatus = 'scheduled';
    }
  }
  
  // 1. Uniqueness check loop (only if new)
  if (!data.id) {
    let isUnique = false;
    let counter = 0;
    
    while (!isUnique) {
      const candidateSlug = counter === 0 ? finalSlug : `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
      const existing = await prisma.learnContent.findUnique({
        where: { slug: candidateSlug },
      });
      
      if (!existing) {
        finalSlug = candidateSlug;
        isUnique = true;
      }
      counter++;
    }
  }

  // 2. Perform insert or update in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Upsert Master record
    let content;
    if (data.id) {
      content = await tx.learnContent.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          status: targetStatus,
          bottleneckTags: JSON.stringify(data.bottleneckTags),
          category: data.category || null,
          subcategory: data.subcategory || null,
          timeframe: data.timeframe || null,
          thumbnailUrl: data.thumbnailUrl,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatarUrl: data.authorAvatarUrl,
          organizationId: data.organizationId || null,
          collaborators: data.collaborators ? (typeof data.collaborators === 'string' ? data.collaborators : JSON.stringify(data.collaborators)) : undefined,
          targetDate: data.targetDate ? new Date(data.targetDate) : null,
        },
      });
    } else {
      content = await tx.learnContent.create({
        data: {
          title: data.title,
          description: data.description,
          slug: finalSlug,
          type: data.type,
          status: targetStatus,
          bottleneckTags: JSON.stringify(data.bottleneckTags),
          category: data.category || null,
          subcategory: data.subcategory || null,
          timeframe: data.timeframe || null,
          thumbnailUrl: data.thumbnailUrl,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatarUrl: data.authorAvatarUrl,
          organizationId: data.organizationId || null,
          collaborators: data.collaborators ? (typeof data.collaborators === 'string' ? data.collaborators : JSON.stringify(data.collaborators)) : '[]',
          targetDate: data.targetDate ? new Date(data.targetDate) : null,
        },
      });
    }

    // Insert Polymorphic Child record
    switch (data.type) {
      case 'article':
        let article = await tx.learnArticle.findUnique({ where: { learnContentId: content.id }});
        if (!article) {
          article = await tx.learnArticle.create({
            data: {
              learnContentId: content.id,
            },
          });
        }
        
        // Delete old blocks
        await tx.learnArticleBlock.deleteMany({ where: { articleId: article.id } });
        
        if (data.articleBlocks && data.articleBlocks.length > 0) {
          await tx.learnArticleBlock.createMany({
            data: data.articleBlocks.map(block => ({
              articleId: article!.id,
              orderIndex: block.orderIndex,
              blockType: block.blockType,
              content: block.content,
            })),
          });
        }
        break;
      case 'video':
        const existingVideo = await tx.learnVideo.findUnique({ where: { learnContentId: content.id } });
        if (existingVideo) {
          await tx.learnVideo.update({
            where: { learnContentId: content.id },
            data: { videoUrl: data.videoUrl || '', duration: data.videoDuration }
          });
        } else {
          await tx.learnVideo.create({
            data: {
              learnContentId: content.id,
              videoUrl: data.videoUrl || '',
              duration: data.videoDuration,
            },
          });
        }
        break;
      case 'class':
        const existingClass = await tx.learnClass.findUnique({ where: { learnContentId: content.id } });
        if (existingClass) {
          await tx.learnClass.update({
            where: { learnContentId: content.id },
            data: { moduleCount: data.classModules || 1, totalDuration: data.classDuration }
          });
        } else {
          await tx.learnClass.create({
            data: {
              learnContentId: content.id,
              moduleCount: data.classModules || 1,
              totalDuration: data.classDuration,
            },
          });
        }
        break;
      case 'livestream':
        let stream = await tx.learnLivestream.findUnique({ where: { learnContentId: content.id } });
        if (stream) {
          stream = await tx.learnLivestream.update({
            where: { learnContentId: content.id },
            data: { 
              streamUrl: data.livestreamUrl,
              scheduledFor: data.targetDate ? new Date(data.targetDate) : null,
            }
          });
        } else {
          stream = await tx.learnLivestream.create({
            data: {
              learnContentId: content.id,
              streamUrl: data.livestreamUrl,
              scheduledFor: data.targetDate ? new Date(data.targetDate) : null,
            },
          });
        }
        
        // Delete old blocks
        await tx.learnLivestreamBlock.deleteMany({ where: { livestreamId: stream.id } });
        
        if (data.livestreamBlocks && data.livestreamBlocks.length > 0) {
          await tx.learnLivestreamBlock.createMany({
            data: data.livestreamBlocks.map(block => ({
              livestreamId: stream!.id,
              orderIndex: block.orderIndex,
              blockType: block.blockType,
              content: block.content,
            })),
          });
        }
        break;
      case 'report':
        const existingReport = await tx.learnReport.findUnique({ where: { learnContentId: content.id } });
        if (existingReport) {
          await tx.learnReport.update({
            where: { learnContentId: content.id },
            data: { pdfUrl: data.reportPdfUrl || '', pageCount: data.reportPages }
          });
        } else {
          await tx.learnReport.create({
            data: {
              learnContentId: content.id,
              pdfUrl: data.reportPdfUrl || '',
              pageCount: data.reportPages,
            },
          });
        }
        break;
    }

    return content;
  });

  if (result.status === 'published' || result.status === 'scheduled') {
    let orgName: string | undefined;
    if (result.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: result.organizationId },
        select: { name: true }
      });
      orgName = org?.name;
    }

    let dateType: 'START_TIME' | 'PUBLISH_DATE' | 'DATE_RANGE' = 'PUBLISH_DATE';
    if (result.type === 'livestream' || result.type === 'class') {
      dateType = 'START_TIME';
    }

    await syncCalendarEvent({
      sourceType: result.type,
      sourceId: result.id,
      slug: result.slug,
      dateType,
      title: result.title,
      date: result.targetDate || result.createdAt,
      imageUrl: result.thumbnailUrl ?? undefined,
      category: result.category ?? result.type,
      organizationName: orgName,
      status: 'upcoming',
      tenantId: 'foodnerve',
      visibility: orgName ? 'organization' : 'society',
      organizationId: result.organizationId || undefined,
      userId: result.authorId,
    });
  } else {
    await removeCalendarEvent(result.type, result.id);
  }

  return { success: true, slug: result.slug, id: result.id };
}

export async function getLearnContentBySlug(slug: string) {
  const content = await prisma.learnContent.findUnique({
    where: { slug, status: 'published' },
    include: {
      article: {
        include: {
          blocks: {
            orderBy: {
              orderIndex: 'asc'
            }
          }
        }
      },
      video: true,
      class: true,
      livestream: true,
      report: true,
    }
  });
  return content;
}

export async function getUserDrafts(userId: string, userEmail?: string) {
  let aliases: string[] = [userId];
  if (userEmail) aliases.push(userEmail);

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { firebaseUid: userId },
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      },
      select: { id: true, firebaseUid: true, email: true }
    });
    if (user) {
      if (user.id) aliases.push(user.id);
      if (user.firebaseUid) aliases.push(user.firebaseUid);
      if (user.email) aliases.push(user.email);
    }
  } catch (e) {}

  aliases = Array.from(new Set(aliases.filter(Boolean)));

  return await prisma.learnContent.findMany({
    where: {
      status: 'draft',
      OR: [
        { authorId: { in: aliases } },
        ...aliases.map(a => ({ collaborators: { contains: a } }))
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      article: {
        include: { blocks: true }
      },
      video: true,
      class: true,
      livestream: true,
      report: true,
    }
  });
}

export async function getUserPublishedContent(userId: string) {
  return await prisma.learnContent.findMany({
    where: { authorId: userId, status: 'published' },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getOrgLearnContent(organizationId: string) {
  return await prisma.learnContent.findMany({
    where: { 
      organizationId,
      status: {
        in: ['draft', 'scheduled', 'published', 'pending_org_review']
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      organization: true
    }
  });
}

export async function deleteLearnContent(id: string) {
  return await prisma.learnContent.delete({
    where: { id }
  });
}

export async function getLearnContentById(id: string) {
  return await prisma.learnContent.findUnique({
    where: { id },
    include: {
      article: {
        include: {
          blocks: {
            orderBy: {
              orderIndex: 'asc'
            }
          }
        }
      },
      video: true,
      class: true,
      livestream: {
        include: {
          blocks: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      },
      report: true,
    }
  });
}

// ─── BLOCK COMMENTS ──────────────────────────────────────────

export async function getBlockComments(blockId: string) {
  return await prisma.blockComment.findMany({
    where: { blockId, parentId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' },
      }
    }
  });
}

export async function postBlockComment(data: {
  blockId: string;
  text: string;
  userId?: string | null;
  displayName?: string;
  avatarUrl?: string | null;
  parentId?: string | null;
}) {
  return await prisma.blockComment.create({
    data: {
      blockId: data.blockId,
      text: data.text,
      userId: data.userId || null,
      displayName: data.displayName || 'Anonymous',
      avatarUrl: data.avatarUrl || null,
      parentId: data.parentId || null,
    }
  });
}

export async function likeBlockComment(commentId: string) {
  return await prisma.blockComment.update({
    where: { id: commentId },
    data: { likes: { increment: 1 } }
  });
}


export async function fetchLivestreamContentPool(userId: string, orgId: string | null) {
  const articles = await prisma.learnContent.findMany({
    where: {
      type: 'article',
      status: 'published',
      OR: orgId 
        ? [{ organizationId: orgId }]
        : [{ authorId: userId }]
    },
    include: { article: { include: { blocks: { orderBy: { orderIndex: 'asc' } } } }, organization: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  
  const jobs = await prisma.tradeListing.findMany({
    where: {
      category: 'jobs',
      status: 'active',
      OR: orgId ? [{ organizationId: orgId }] : [{ postedById: userId }]
    },
    include: { organization: true },
    orderBy: { postedAt: 'desc' },
    take: 10
  });
  
  return { articles, jobs };
}

export async function fetchGlobalLivestreamArticles(engine: 'production_foundations' | 'resilience_disruption' | 'markets_people_solutions' | 'the_breakdown' | 'the_masterclass' | 'the_opportunity_desk' | string) {
  let orConditions: any[] = [];
  
  if (engine === 'production_foundations') {
    orConditions = [
      { category: { in: ['capital', 'land', 'inputs', 'finance', 'financial-exclusion', 'financial_exclusion', 'land-access', 'land_access', 'inputs-production', 'inputs_production'] } },
      { subcategory: { in: ['credit_loans', 'affording_land', 'getting_seeds', 'breeding_animals', 'capital', 'land', 'inputs', 'finance', 'mechanization', 'fertilizer', 'irrigation'] } },
      { bottleneckTags: { contains: 'capital' } },
      { bottleneckTags: { contains: 'land' } },
      { bottleneckTags: { contains: 'inputs' } },
      { bottleneckTags: { contains: 'credit' } },
      { bottleneckTags: { contains: 'production' } },
    ];
  } else if (engine === 'resilience_disruption') {
    orConditions = [
      { category: { in: ['energy', 'insecurity', 'energy-poverty', 'energy_poverty', 'food-insecurity', 'food_insecurity', 'food-system-insecurity', 'food_system_insecurity'] } },
      { subcategory: { in: ['reliable_energy', 'banditry_crime', 'insecurity', 'energy', 'cold_grid', 'theft', 'tariffs', 'risk'] } },
      { bottleneckTags: { contains: 'energy' } },
      { bottleneckTags: { contains: 'insecurity' } },
      { bottleneckTags: { contains: 'risk' } },
      { bottleneckTags: { contains: 'banditry' } },
    ];
  } else if (engine === 'markets_people_solutions') {
    orConditions = [
      { category: { in: ['harvest-to-market', 'people', 'post-harvest', 'postharvest', 'post_harvest', 'market-access', 'market_access', 'workforce', 'talent', 'people_skills'] } },
      { subcategory: { in: ['harvesting_handling', 'cold_chain', 'building_enterprises', 'hiring_talent', 'post-harvest', 'people', 'workforce', 'talent', 'market', 'storage', 'processing'] } },
      { bottleneckTags: { contains: 'harvest' } },
      { bottleneckTags: { contains: 'market' } },
      { bottleneckTags: { contains: 'people' } },
      { bottleneckTags: { contains: 'talent' } },
      { bottleneckTags: { contains: 'workforce' } },
    ];
  } else if (engine === 'the_breakdown') {
    orConditions = [
      { subcategory: 'culture', timeframe: { in: ['present', 'future'] } },
      { subcategory: 'brief', timeframe: 'past' },
      { subcategory: 'comparison', timeframe: { in: ['past', 'present', 'future'] } }
    ];
  } else if (engine === 'the_masterclass') {
    orConditions = [
      { subcategory: 'playbook', timeframe: { in: ['present', 'future'] } },
      { subcategory: 'brief', timeframe: 'future' }
    ];
  } else if (engine === 'the_opportunity_desk') {
    orConditions = [
      { subcategory: 'brief', timeframe: 'present' },
      { subcategory: 'memo', timeframe: { in: ['present', 'future'] } }
    ];
  }

  let articles = await prisma.learnContent.findMany({
    where: {
      type: 'article',
      status: 'published',
      ...(orConditions.length > 0 ? { OR: orConditions } : {})
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          logoUrl: true
        }
      },
      article: {
        include: {
          blocks: {
            orderBy: {
              orderIndex: 'asc'
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 24
  });

  // Fallback if very few matches in DB so creators always have relevant articles to select from
  if (articles.length < 3) {
    const existingIds = articles.map(a => a.id);
    const fallbackArticles = await prisma.learnContent.findMany({
      where: {
        type: 'article',
        status: 'published',
        ...(existingIds.length > 0 ? { id: { notIn: existingIds } } : {})
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        article: {
          include: {
            blocks: {
              orderBy: {
                orderIndex: 'asc'
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 12
    });
    articles = [...articles, ...fallbackArticles];
  }

  return articles;
}

export async function fetchGlobalJobs() {
  const jobs = await prisma.tradeListing.findMany({
    where: {
      category: 'jobs',
      status: 'active'
    },
    select: {
      id: true,
      title: true,
      location: true,
      organization: {
        select: {
          name: true,
          logoUrl: true
        }
      }
    },
    orderBy: { postedAt: 'desc' },
    take: 20
  });
  return jobs;
}

export async function fetchGlobalCtaAssets() {
  try {
    const [jobs, listings, campaigns] = await Promise.all([
      // 1. Talent Exchange & Career Roles (Jobs, Internships, Volunteering)
      prisma.tradeListing.findMany({
        where: {
          category: { in: ['jobs', 'job', 'volunteer', 'internship', 'internships'] },
          status: 'active'
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          location: true,
          lga: true,
          workModel: true,
          priceOrAsk: true,
          nervePointsCost: true,
          imageUrl: true,
          postedAt: true,
          jobSource: true,
          compType: true,
          npReward: true,
          minRank: true,
          currency: true,
          minSalary: true,
          maxSalary: true,
          jobFunction: true,
          challenges: true,
          subcategories: true,
          duration: true,
          organization: {
            select: {
              name: true,
              logoUrl: true,
              isPlatformOwner: true,
              isExternal: true,
              rank: true,
              verified: true,
            }
          },
          postedBy: {
            select: {
              name: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { postedAt: 'desc' },
        take: 30
      }),
      // 2. Trade Listings & Offtake Deals
      prisma.tradeListing.findMany({
        where: {
          category: { in: ['group-buy', 'flash-sale', 'swap', 'need'] },
          status: 'active'
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          commodity: true,
          quantity: true,
          priceOrAsk: true,
          location: true,
          lga: true,
          imageUrl: true,
          postedAt: true,
          organization: {
            select: {
              name: true,
              logoUrl: true
            }
          }
        },
        orderBy: { postedAt: 'desc' },
        take: 30
      }),
      // 3. Community Campaigns & Initiatives
      prisma.campaign.findMany({
        where: {
          status: { in: ['funding', 'active_deployment', 'completed'] }
        },
        select: {
          id: true,
          title: true,
          description: true,
          tier: true,
          goalAmount: true,
          raisedAmount: true,
          tractionMetric: true,
          originTag: true,
          imageUrl: true,
          createdAt: true,
          organization: {
            select: {
              name: true,
              logoUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 30
      })
    ]);

    return {
      jobs: jobs || [],
      listings: listings || [],
      campaigns: campaigns || []
    };
  } catch (error) {
    console.error('Failed to fetch CTA assets:', error);
    return {
      jobs: [],
      listings: [],
      campaigns: []
    };
  }
}

// ─── CO-AUTHORING ACTIONS ──────────────────────────────────────────

function hasBlockInformation(blocks?: any[]): boolean {
  if (!blocks || blocks.length === 0) return false;
  return blocks.some(b => {
    let parsed: any = b.content;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { return false; }
    }
    if (!parsed || typeof parsed !== 'object') return false;
    return Object.values(parsed).some((val: any) => {
      if (typeof val === 'string') return val.trim().length > 0;
      if (typeof val === 'number') return true;
      if (Array.isArray(val)) {
        return val.length > 0 && val.some((v: any) => {
          if (typeof v === 'string') return v.trim().length > 0;
          if (typeof v === 'object' && v !== null) {
            return Object.values(v).some(subVal => typeof subVal === 'string' && subVal.trim().length > 0);
          }
          return false;
        });
      }
      return false;
    });
  });
}

export async function getPotentialCoAuthors(query?: string) {
  try {
    const userWhere: any = {};
    const orgWhere: any = {};
    
    if (query && query.trim()) {
      const q = query.trim();
      userWhere.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { bio: { contains: q } }
      ];
      orgWhere.OR = [
        { name: { contains: q } },
        { slug: { contains: q } }
      ];
    }

    const [users, orgs] = await Promise.all([
      prisma.user.findMany({
        where: userWhere,
        select: {
          id: true,
          firebaseUid: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          rank: true,
          bio: true,
          specialization: true,
        },
        orderBy: { rank: 'desc' },
        take: 120,
      }),
      prisma.organization.findMany({
        where: orgWhere,
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          rank: true,
          verified: true,
          isPlatformOwner: true,
          members: {
            where: { role: { in: ['owner', 'admin'] } },
            take: 1,
            select: {
              user: {
                select: { email: true, name: true }
              }
            }
          }
        },
        orderBy: { rank: 'desc' },
        take: 80,
      })
    ]);

    return {
      success: true,
      members: users.map(u => ({
        id: u.id,
        uid: u.firebaseUid || u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        role: u.role,
        rank: u.rank,
        bio: u.bio || u.specialization || '',
        isOrg: false,
        canCoAuthor: u.rank >= 4,
      })),
      organizations: orgs.map(o => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        email: o.members?.[0]?.user?.email || `${o.slug || o.name.toLowerCase().replace(/\s+/g, '')}@foodnerve.org`,
        logoUrl: o.logoUrl,
        rank: o.rank,
        verified: o.verified,
        isPlatformOwner: o.isPlatformOwner,
        isOrg: true,
        canCoAuthor: o.rank >= 4,
      }))
    };
  } catch (err: any) {
    console.error('Error fetching potential co-authors:', err);
    return { success: false, members: [], organizations: [], error: err.message };
  }
}

export async function inviteCoAuthorAction(data: {
  draftId?: string;
  collaborator: {
    name: string;
    email: string;
    uid?: string;
    avatarUrl?: string;
    role?: string;
    rank?: number;
    isOrg?: boolean;
    upgradePrompt?: boolean;
  };
  inviterName?: string;
  articleTitle?: string;
  tenant?: string;
  note?: string;
}) {
  try {
    const timestamp = new Date().toISOString();
    const newCollab = {
      ...data.collaborator,
      role: data.collaborator.role || 'Co-Author',
      status: 'invited',
      timestamp,
    };

    if (data.draftId) {
      const existing = await prisma.learnContent.findUnique({
        where: { id: data.draftId },
        select: { id: true, collaborators: true, title: true }
      });

      if (existing) {
        let collabs: any[] = [];
        try {
          collabs = JSON.parse(existing.collaborators || '[]');
        } catch (e) {
          collabs = [];
        }

        const existingIdx = collabs.findIndex(c => 
          (data.collaborator.email && c.email?.toLowerCase() === data.collaborator.email.toLowerCase()) ||
          (data.collaborator.uid && c.uid === data.collaborator.uid)
        );

        if (existingIdx !== -1) {
          collabs[existingIdx] = {
            ...collabs[existingIdx],
            ...newCollab,
            timestamp,
          };
        } else {
          collabs.push(newCollab);
        }

        await prisma.learnContent.update({
          where: { id: data.draftId },
          data: { collaborators: JSON.stringify(collabs) }
        });
      }
    }

    // Build collaboration URL for email
    const appBase = process.env.NEXT_PUBLIC_APP_URL || 'https://darkpore.com';
    const targetDraftParam = data.draftId || '';
    const collaborationUrl = targetDraftParam
      ? `${appBase}/modular-society/${data.tenant || 'food'}/learn?draftId=${targetDraftParam}&invite=true`
      : `${appBase}/modular-society/${data.tenant || 'food'}/learn`;

    // Attempt email dispatch via Resend
    if (data.collaborator.email) {
      if (process.env.RESEND_API_KEY) {
        try {
          const isUpgrade = !!data.collaborator.upgradePrompt;
          const subject = isUpgrade
            ? `Editorial Invitation & Rank Upgrade Required for "${data.articleTitle || 'New Editorial Brief'}"`
            : `You're invited to co-author "${data.articleTitle || 'New Editorial Brief'}" on FoodNerve`;

          const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a; line-height: 1.6;">
              <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 24px; border-radius: 16px; margin-bottom: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">FoodNerve Editorial Intelligence</h1>
                <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">Collaborative Co-Authorship</p>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                  Hello ${data.collaborator.name},
                </p>
                <p style="font-size: 15px; color: #475569;">
                  <strong>${data.inviterName || 'A collaborator'}</strong> has invited you to write and co-author the article:
                </p>
                <div style="background: #ffffff; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-weight: 700; font-size: 17px; color: #0f172a;">
                  "${data.articleTitle || 'Untitled Editorial Brief'}"
                </div>
                ${data.note ? `
                  <div style="background: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #475569; font-style: italic;">
                    <strong>Personal note:</strong> "${data.note}"
                  </div>
                ` : ''}
                ${isUpgrade ? `
                  <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 16px; margin: 16px 0;">
                    <p style="margin: 0; font-size: 14px; color: #1d4ed8; font-weight: 700;">
                      💡 Editorial Rank Authorization:
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #334155; line-height: 1.5;">
                      Official editorial co-authors on the FoodNerve network require Rank 4+ authorization. Use the link below to join the canvas and upgrade your rank to unlock full co-author publishing privileges.
                    </p>
                  </div>
                ` : ''}
                <div style="text-align: center; margin-top: 24px;">
                  <a href="${collaborationUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(15,23,42,0.2);">
                    ${isUpgrade ? 'Open Canvas & Upgrade Rank' : 'Join Collaborative Canvas'}
                  </a>
                </div>
              </div>

              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                FoodNerve Editorial Intelligence Network • Collaborative Writing Studio
              </p>
            </div>
          `;

          const emailRes = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: data.collaborator.email,
            subject,
            html: emailHtml,
          });

          if (emailRes.error) {
            console.error('Failed to dispatch co-author email via Resend:', emailRes.error);
          } else {
            console.log(`Co-author invitation email successfully dispatched to ${data.collaborator.email}`);
          }
        } catch (mailErr) {
          console.error('Error sending co-author email:', mailErr);
        }
      } else {
        console.log(`[SIMULATED EMAIL DISPATCH] To: ${data.collaborator.email} | Subject: Invitation to Co-Author "${data.articleTitle}" | URL: ${collaborationUrl}`);
      }
    }

    return { 
      success: true, 
      collaborator: newCollab,
      message: data.collaborator.upgradePrompt 
        ? `Upgrade invitation and email dispatched to ${data.collaborator.name} (${data.collaborator.email})`
        : `Co-author invitation and email dispatched to ${data.collaborator.name} (${data.collaborator.email})`
    };
  } catch (err: any) {
    console.error('Error inviting co-author:', err);
    return { success: false, error: err.message };
  }
}

export async function findMatchingDraft({
  userId,
  userEmail,
  category,
  subcategory,
  era,
  commodity,
}: {
  userId?: string;
  userEmail?: string;
  category?: string;
  subcategory?: string;
  era?: string;
  commodity?: string;
}) {
  try {
    if (!userId && !userEmail) return { success: false, draft: null };

    // Resolve aliases
    let aliases: string[] = [];
    if (userId) aliases.push(userId);
    if (userEmail) aliases.push(userEmail);

    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(userId ? [{ id: userId }, { firebaseUid: userId }] : []),
            ...(userEmail ? [{ email: userEmail }] : [])
          ]
        },
        select: { id: true, firebaseUid: true, email: true }
      });
      if (user) {
        if (user.id) aliases.push(user.id);
        if (user.firebaseUid) aliases.push(user.firebaseUid);
        if (user.email) aliases.push(user.email);
      }
    } catch (e) {}

    aliases = Array.from(new Set(aliases.filter(Boolean)));

    const drafts = await prisma.learnContent.findMany({
      where: {
        status: 'draft',
        type: 'article',
        category: category || undefined,
        subcategory: subcategory || undefined,
        timeframe: era || undefined,
        OR: [
          { authorId: { in: aliases } },
          ...aliases.map(a => ({ collaborators: { contains: a } }))
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        article: {
          include: {
            blocks: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    if (!drafts || drafts.length === 0) {
      return { success: true, draft: null };
    }

    // Filter to drafts that actually contain user-inputted information in some block
    const draftsWithInfo = drafts.filter(d => hasBlockInformation(d.article?.blocks));
    if (draftsWithInfo.length === 0) {
      return { success: true, draft: null };
    }

    // Exact commodity check
    if (commodity) {
      const targetComm = commodity.toLowerCase().trim();
      const matchingCommodityDraft = draftsWithInfo.find(d => {
        try {
          const tags = JSON.parse(d.bottleneckTags || '[]');
          return Array.isArray(tags) && tags.some((t: string) => t.toLowerCase().trim() === targetComm);
        } catch (e) {
          return false;
        }
      });
      // MUST match commodity if commodity was requested!
      return { success: true, draft: matchingCommodityDraft || null };
    }

    return { success: true, draft: draftsWithInfo[0] };
  } catch (err: any) {
    console.error('Error finding matching draft:', err);
    return { success: false, draft: null, error: err.message };
  }
}

export async function getCollaborationDraft(draftId: string, userId?: string) {
  try {
    const draft = await prisma.learnContent.findUnique({
      where: { id: draftId },
      include: {
        article: {
          include: {
            blocks: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        },
        video: true,
        class: true,
        livestream: true,
        report: true,
      }
    });

    if (!draft) return { success: false, draft: null, error: 'Draft not found' };

    let authorProfile: any = null;
    if (draft.authorId) {
      const author = await prisma.user.findFirst({
        where: {
          OR: [
            { id: draft.authorId },
            { firebaseUid: draft.authorId }
          ]
        },
        select: { id: true, name: true, avatarUrl: true, firstName: true }
      });
      if (author) authorProfile = author;
    }

    return {
      success: true,
      draft: {
        ...draft,
        authorName: draft.authorName || authorProfile?.name || authorProfile?.firstName || 'Lead Author',
        authorAvatarUrl: draft.authorAvatarUrl || authorProfile?.avatarUrl || ''
      }
    };
  } catch (err: any) {
    console.error('Error fetching collaboration draft:', err);
    return { success: false, draft: null, error: err.message };
  }
}

export async function joinCollaborationDraft(draftId: string, user: { uid: string; name: string; email?: string; avatarUrl?: string }) {
  try {
    const draft = await prisma.learnContent.findUnique({
      where: { id: draftId },
      select: { id: true, authorId: true, collaborators: true }
    });
    if (!draft) return { success: false, error: 'Draft not found' };
    if (draft.authorId === user.uid) return { success: true };

    let collabs: any[] = [];
    try {
      collabs = JSON.parse(draft.collaborators || '[]');
    } catch (e) {
      collabs = [];
    }

    const existingIdx = collabs.findIndex(c => 
      c.uid === user.uid || 
      (user.email && c.email && c.email.toLowerCase() === user.email.toLowerCase())
    );

    if (existingIdx !== -1) {
      // Reconcile and bond the logged-in user's UID to their invited record
      collabs[existingIdx] = {
        ...collabs[existingIdx],
        uid: user.uid,
        name: user.name || collabs[existingIdx].name,
        email: user.email || collabs[existingIdx].email,
        avatarUrl: user.avatarUrl || collabs[existingIdx].avatarUrl,
        status: 'accepted',
        joinedAt: new Date().toISOString()
      };
    } else {
      collabs.push({
        uid: user.uid,
        name: user.name,
        email: user.email || '',
        avatarUrl: user.avatarUrl || '',
        role: 'Co-Author',
        status: 'accepted',
        timestamp: new Date().toISOString()
      });
    }

    await prisma.learnContent.update({
      where: { id: draftId },
      data: { collaborators: JSON.stringify(collabs) }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error joining collaboration draft:', err);
    return { success: false, error: err.message };
  }
}

