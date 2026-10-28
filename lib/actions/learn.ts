'use server';

import { prisma } from '@/lib/db/client';
import { syncCalendarEvent, removeCalendarEvent } from '@/lib/calendar-sync';
import { notifySearchEnginesOfContent } from '@/lib/seo/indexnow';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
  // Nested structure compatibility:
  taxonomy?: {
    category?: string;
    subcategory?: string;
    timeframe?: string;
    [key: string]: any;
  };
  livestream?: {
    streamUrl?: string;
    guestStudioUrl?: string;
    scheduledFor?: string | Date;
    eventDate?: string | Date;
    blocks?: ArticleBlockPayload[];
    communications?: any;
    [key: string]: any;
  };
  [key: string]: any;
};

export async function createLearnContent(data: CreateLearnContentPayload, isDraft = false) {
  let finalSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const rawData = data as any;
  const finalCategory = data.category || rawData.taxonomy?.category || null;
  const finalSubcategory = data.subcategory || rawData.taxonomy?.subcategory || null;
  const finalTimeframe = data.timeframe || rawData.taxonomy?.timeframe || null;
  const finalThumbnailUrl = data.thumbnailUrl || rawData.thumbnail || rawData.coverImageUrl || null;
  const finalLivestreamUrl = data.livestreamUrl || rawData.livestream?.streamUrl || rawData.livestream?.livestreamUrl || null;
  const rawTargetDate = data.targetDate || rawData.livestream?.scheduledFor || rawData.livestream?.eventDate || rawData.scheduledFor;
  const finalTargetDate = rawTargetDate ? new Date(rawTargetDate) : null;
  const finalLivestreamBlocks = data.livestreamBlocks || rawData.livestream?.blocks || null;

  let targetStatus = isDraft ? 'draft' : 'published';
  if (!isDraft && data.organizationId && data.authorId) {
    const { determineInitialContentStatus } = await import('./org-approval');
    targetStatus = await determineInitialContentStatus(data.authorId, data.organizationId);
  }

  // If approved to publish (not draft and not pending org approval), check if targetDate is scheduled for the future
  if (!isDraft && targetStatus === 'published' && finalTargetDate) {
    if (!isNaN(finalTargetDate.getTime()) && finalTargetDate.getTime() > Date.now()) {
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
          bottleneckTags: JSON.stringify(data.bottleneckTags || []),
          category: finalCategory,
          subcategory: finalSubcategory,
          timeframe: finalTimeframe,
          thumbnailUrl: finalThumbnailUrl,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatarUrl: data.authorAvatarUrl,
          organizationId: data.organizationId || null,
          collaborators: data.collaborators ? (typeof data.collaborators === 'string' ? data.collaborators : JSON.stringify(data.collaborators)) : undefined,
          targetDate: finalTargetDate,
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
          bottleneckTags: JSON.stringify(data.bottleneckTags || []),
          category: finalCategory,
          subcategory: finalSubcategory,
          timeframe: finalTimeframe,
          thumbnailUrl: finalThumbnailUrl,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatarUrl: data.authorAvatarUrl,
          organizationId: data.organizationId || null,
          collaborators: data.collaborators ? (typeof data.collaborators === 'string' ? data.collaborators : JSON.stringify(data.collaborators)) : '[]',
          targetDate: finalTargetDate,
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
              streamUrl: finalLivestreamUrl,
              scheduledFor: finalTargetDate,
            }
          });
        } else {
          stream = await tx.learnLivestream.create({
            data: {
              learnContentId: content.id,
              streamUrl: finalLivestreamUrl,
              scheduledFor: finalTargetDate,
            },
          });
        }
        
        // Delete old blocks
        await tx.learnLivestreamBlock.deleteMany({ where: { livestreamId: stream.id } });
        
        if (finalLivestreamBlocks && finalLivestreamBlocks.length > 0) {
          await tx.learnLivestreamBlock.createMany({
            data: finalLivestreamBlocks.map(block => ({
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
    if (result.type === 'livestream') {
      notifyCoHostsOnPublish(result.id, result.authorName || undefined).catch((err) => {
        console.error('Failed to notify co-hosts on publish/schedule:', err);
      });
    }

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

    const startDate = result.targetDate || result.createdAt;
    let calculatedEndDate: Date | undefined = undefined;

    if (result.type === 'livestream' && startDate) {
      let totalDurationMinutes = 0;
      if (finalLivestreamBlocks && Array.isArray(finalLivestreamBlocks)) {
        for (const block of finalLivestreamBlocks) {
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
            totalDurationMinutes += 2; // Default ~2 mins per slide
          }
        }
      }

      if (totalDurationMinutes < 15) {
        totalDurationMinutes = 35; // Standard default broadcast duration
      }

      calculatedEndDate = new Date(new Date(startDate).getTime() + totalDurationMinutes * 60 * 1000);
    }

    await syncCalendarEvent({
      sourceType: result.type,
      sourceId: result.id,
      slug: result.slug,
      dateType,
      title: result.title,
      date: startDate,
      endDate: calculatedEndDate,
      imageUrl: result.thumbnailUrl ?? undefined,
      category: result.category ?? result.type,
      organizationName: orgName,
      status: 'upcoming',
      tenantId: 'foodnerve',
      visibility: orgName ? 'organization' : 'society',
      organizationId: result.organizationId || undefined,
      userId: result.authorId,
    });

    // Non-blocking instant search push (Bing, Seznam, Yandex, WebSub)
    const contentPaths = [
      result.type === 'livestream'
        ? `/learn/livestream/${result.id}`
        : `/learn/article/${result.slug}`,
    ];

    notifySearchEnginesOfContent({
      domainHost: 'foodnerve.org', // Default society domain for learn content
      paths: contentPaths,
    }).catch((err) => {
      console.error('[IndexNow] Background push error:', err);
    });
  } else {
    await removeCalendarEvent(result.type, result.id);
  }

  return { success: true, slug: result.slug, id: result.id };
}

export async function getLearnContentBySlug(slug: string) {
  if (!slug || typeof slug !== 'string') return null;

  const content = await prisma.learnContent.findFirst({
    where: {
      OR: [
        { slug: slug },
        { id: slug }
      ],
      status: 'published'
    },
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

export async function getUserPublishedContent(userId: string, userEmail?: string) {
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
      authorId: { in: aliases }, 
      status: { in: ['published', 'scheduled'] } 
    },
    orderBy: { createdAt: 'desc' },
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
      organization: true,
    }
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
  const content = await prisma.learnContent.findUnique({
    where: { id },
    select: { type: true, slug: true },
  });
  if (content) {
    await removeCalendarEvent(content.type, id);
  }
  return await prisma.learnContent.delete({
    where: { id },
  });
}

export async function getLearnContentById(id: string) {
  return await prisma.learnContent.findFirst({
    where: {
      OR: [
        { id },
        { slug: id }
      ]
    },
    include: {
      organization: true,
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

  let lastUsedLinks: { guestStudioUrl: string; streamUrl: string; communications?: any } | null = null;
  try {
    let aliases: string[] = [userId];
    if (!orgId) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { id: userId },
              { firebaseUid: userId }
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
    }
    aliases = Array.from(new Set(aliases.filter(Boolean)));

    const recentLivestreams = await prisma.learnContent.findMany({
      where: {
        type: 'livestream',
        ...(orgId 
          ? { organizationId: orgId }
          : { authorId: { in: aliases } })
      },
      include: {
        livestream: {
          include: {
            blocks: {
              orderBy: { orderIndex: 'asc' },
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    let foundGuest = '';
    let foundStream = '';
    let foundComms: any = undefined;

    for (const ls of recentLivestreams) {
      if (!foundStream && ls.livestream?.streamUrl) {
        foundStream = ls.livestream.streamUrl;
      }

      const blocks = ls.livestream?.blocks || [];
      for (const b of blocks) {
        if (b.content) {
          try {
            const parsed = JSON.parse(b.content);
            if (parsed?._studioMeta) {
              if (!foundGuest && parsed._studioMeta.guestStudioUrl) {
                foundGuest = parsed._studioMeta.guestStudioUrl;
              }
              if (!foundStream && parsed._studioMeta.streamUrl) {
                foundStream = parsed._studioMeta.streamUrl;
              }
              if (!foundComms && parsed._studioMeta.communications) {
                foundComms = parsed._studioMeta.communications;
              }
            }
          } catch (e) {}
        }
      }

      if (foundGuest && foundStream && foundComms) break;
    }

    if (foundGuest || foundStream) {
      lastUsedLinks = {
        guestStudioUrl: foundGuest,
        streamUrl: foundStream,
        communications: foundComms,
      };
    }
  } catch (err) {
    console.error('Error fetching lastUsedLinks in fetchLivestreamContentPool:', err);
  }
  
  return { articles, jobs, lastUsedLinks };
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

export async function inviteCoHostAction(data: {
  draftId?: string;
  collaborator: {
    name: string;
    email: string;
    uid?: string;
    avatarUrl?: string;
    role?: 'Co-Host' | 'Guest Panelist' | 'Moderator' | 'Technical Presenter' | string;
    rank?: number;
    isOrg?: boolean;
    note?: string;
    status?: 'invited' | 'confirmed' | 'accepted' | 'declined';
  };
  inviterName?: string;
  livestreamTitle?: string;
  scheduledTime?: string;
  category?: string;
  tenant?: string;
  guestStudioUrl?: string;
  note?: string;
}) {
  try {
    const timestamp = new Date().toISOString();
    const normEmail = data.collaborator.email ? data.collaborator.email.toLowerCase().trim() : '';
    const newCollab = {
      ...data.collaborator,
      email: normEmail,
      role: data.collaborator.role || 'Co-Host',
      status: (data.collaborator.status || 'invited') as 'invited' | 'confirmed' | 'accepted' | 'declined',
      invitedAt: timestamp,
      timestamp,
      note: data.note || data.collaborator.note,
    };

    let resolvedTitle = data.livestreamTitle;
    let resolvedScheduledTime = data.scheduledTime;
    let resolvedCategory = data.category;
    let resolvedGuestStudioUrl = data.guestStudioUrl;
    let targetDraftParam = data.draftId || '';

    if (data.draftId) {
      const existing = await prisma.learnContent.findFirst({
        where: {
          OR: [
            { id: data.draftId },
            { slug: data.draftId }
          ]
        },
        select: {
          id: true,
          collaborators: true,
          title: true,
          targetDate: true,
          category: true,
          livestream: {
            include: { blocks: true }
          }
        }
      });

      if (existing) {
        targetDraftParam = existing.id;
        if (!resolvedTitle) resolvedTitle = existing.title;
        if (!resolvedScheduledTime && existing.targetDate) {
          resolvedScheduledTime = existing.targetDate.toISOString();
        }
        if (!resolvedCategory && existing.category) resolvedCategory = existing.category;

        let collabs: any[] = [];
        try {
          collabs = JSON.parse(existing.collaborators || '[]');
        } catch (e) {
          collabs = [];
        }

        // Fallback to studioMeta if empty
        if (collabs.length === 0 && existing.livestream?.blocks) {
          for (const b of existing.livestream.blocks) {
            try {
              const parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
              if (parsed?._studioMeta?.collaborators && Array.isArray(parsed._studioMeta.collaborators)) {
                collabs = parsed._studioMeta.collaborators;
                break;
              }
            } catch {}
          }
        }

        if (!resolvedGuestStudioUrl && existing.livestream?.blocks) {
          for (const b of existing.livestream.blocks) {
            try {
              const parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
              if (parsed?._studioMeta?.guestStudioUrl) {
                resolvedGuestStudioUrl = parsed._studioMeta.guestStudioUrl;
                break;
              }
            } catch {}
          }
        }

        const existingIdx = collabs.findIndex(c =>
          (normEmail && c.email?.toLowerCase().trim() === normEmail) ||
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
          where: { id: existing.id },
          data: { collaborators: JSON.stringify(collabs) }
        });
      }
    }

    // Build livestream viewer / acceptance URL
    const appBase = process.env.NEXT_PUBLIC_APP_URL || 'https://darkpore.com';
    const viewerUrl = targetDraftParam
      ? `${appBase}/modular-society/${data.tenant || 'food'}/learn/livestream/${targetDraftParam}`
      : `${appBase}/modular-society/${data.tenant || 'food'}/learn`;

    let formattedDate = '';
    if (resolvedScheduledTime) {
      try {
        const d = new Date(resolvedScheduledTime);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          });
        }
      } catch (e) {}
    }

    if (normEmail) {
      if (resend && process.env.RESEND_API_KEY) {
        try {
          const subject = `You're invited to co-host "${resolvedTitle || 'Livestream Broadcast'}" on FoodNerve`;
          const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a; line-height: 1.6;">
              <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 28px; border-radius: 16px; margin-bottom: 24px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
                <span style="display: inline-block; background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; border: 1px solid rgba(129, 140, 248, 0.3); margin-bottom: 12px;">
                  🎙️ Official Broadcast Co-Host Invitation
                </span>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">FoodNerve Broadcast Intelligence</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Studio Greenroom & Stage Participation</p>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 26px; margin-bottom: 24px;">
                <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                  Hello ${data.collaborator.name || 'there'},
                </p>
                <p style="font-size: 15px; color: #475569;">
                  <strong>${data.inviterName || 'The broadcast host'}</strong> has invited you to join the stage as an official <strong>${data.collaborator.role || 'Co-Host'}</strong> for the upcoming live broadcast:
                </p>
                <div style="background: #ffffff; border-left: 4px solid #6366f1; padding: 16px 20px; border-radius: 10px; margin: 18px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                  <div style="font-weight: 800; font-size: 18px; color: #0f172a; margin-bottom: 6px;">
                    "${resolvedTitle || 'Untitled Livestream Broadcast'}"
                  </div>
                  <div style="display: flex; gap: 12px; font-size: 13px; color: #64748b; flex-wrap: wrap;">
                    <span style="background: #eef2ff; color: #4338ca; padding: 3px 8px; border-radius: 6px; font-weight: 700;">Role: ${data.collaborator.role || 'Co-Host'}</span>
                    ${formattedDate ? `<span style="background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 6px; font-weight: 600;">🗓️ ${formattedDate}</span>` : ''}
                    ${resolvedCategory ? `<span style="background: #ecfdf5; color: #065f46; padding: 3px 8px; border-radius: 6px; font-weight: 600; text-transform: capitalize;">Corridor: ${resolvedCategory}</span>` : ''}
                  </div>
                </div>

                ${(data.note || data.collaborator.note) ? `
                  <div style="background: #f1f5f9; border-radius: 10px; padding: 14px 18px; margin: 18px 0; font-size: 14px; color: #475569; font-style: italic; border-left: 3px solid #94a3b8;">
                    <strong>Personal note from host:</strong> "${data.note || data.collaborator.note}"
                  </div>
                ` : ''}

                <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 18px 0;">
                  As a confirmed speaker, you will receive access to the private backstage greenroom studio link, live slide presentation deck, and host cue notes.
                </p>

                <div style="text-align: center; margin-top: 28px; margin-bottom: 12px;">
                  <a href="${viewerUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                    Review & Accept Co-Host Invitation →
                  </a>
                </div>
              </div>

              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                FoodNerve Broadcast Intelligence Network • Global Agribusiness Corridors
              </p>
            </div>
          `;

          const emailRes = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: normEmail,
            subject,
            html: emailHtml,
          });

          if (emailRes.error) {
            console.error('Failed to dispatch co-host invitation email via Resend:', emailRes.error);
          } else {
            console.log(`Co-host invitation email dispatched to ${normEmail}`);
          }
        } catch (mailErr) {
          console.error('Error sending co-host email:', mailErr);
        }
      } else {
        console.log(`[SIMULATED EMAIL DISPATCH] To: ${normEmail} | Subject: Invitation to Co-Host "${resolvedTitle}" | URL: ${viewerUrl}`);
      }
    }

    return {
      success: true,
      collaborator: newCollab,
      message: `Co-host invitation sent to ${data.collaborator.name} (${normEmail})`
    };
  } catch (err: any) {
    console.error('Error inviting co-host:', err);
    return { success: false, error: err.message };
  }
}

export async function respondToCoHostInvitation(data: {
  livestreamId: string;
  accept: boolean;
  user: {
    uid?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
}) {
  try {
    if (!data.livestreamId) {
      return { success: false, error: 'Livestream ID is required' };
    }

    const content = await prisma.learnContent.findFirst({
      where: {
        OR: [
          { id: data.livestreamId },
          { slug: data.livestreamId }
        ]
      },
      select: {
        id: true,
        collaborators: true,
        title: true,
        livestream: {
          include: { blocks: true }
        }
      }
    });

    if (!content) {
      return { success: false, error: 'Livestream not found' };
    }

    let collabs: any[] = [];
    try {
      collabs = JSON.parse(content.collaborators || '[]');
    } catch {
      collabs = [];
    }

    // Fallback to studioMeta if empty
    if (collabs.length === 0 && content.livestream?.blocks) {
      for (const b of content.livestream.blocks) {
        try {
          const parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
          if (parsed?._studioMeta?.collaborators && Array.isArray(parsed._studioMeta.collaborators)) {
            collabs = parsed._studioMeta.collaborators;
            break;
          }
        } catch {}
      }
    }

    const userEmail = data.user.email?.toLowerCase().trim();
    const userUid = data.user.uid;

    const targetIdx = collabs.findIndex(c =>
      (userUid && c.uid === userUid) ||
      (userEmail && c.email?.toLowerCase().trim() === userEmail)
    );

    const timestamp = new Date().toISOString();
    let updatedCollab: any = null;

    if (targetIdx !== -1) {
      const existingCollab = collabs[targetIdx];
      updatedCollab = {
        ...existingCollab,
        status: data.accept ? 'accepted' : 'declined',
        ...(data.accept ? { acceptedAt: timestamp } : { declinedAt: timestamp }),
        name: data.user.name || existingCollab.name,
        avatarUrl: data.user.avatarUrl || existingCollab.avatarUrl,
        uid: data.user.uid || existingCollab.uid,
        email: existingCollab.email || userEmail,
      };
      collabs[targetIdx] = updatedCollab;
    } else {
      if (data.accept && (userEmail || userUid)) {
        updatedCollab = {
          name: data.user.name || 'Co-Host',
          email: userEmail || '',
          uid: data.user.uid,
          avatarUrl: data.user.avatarUrl,
          role: 'Co-Host',
          status: 'accepted',
          acceptedAt: timestamp,
          timestamp,
        };
        collabs.push(updatedCollab);
      } else {
        return { success: false, error: 'Collaborator invitation not found in roster' };
      }
    }

    await prisma.learnContent.update({
      where: { id: content.id },
      data: { collaborators: JSON.stringify(collabs) }
    });

    return {
      success: true,
      status: updatedCollab?.status,
      collaborator: updatedCollab,
      message: data.accept
        ? 'Co-host invitation accepted successfully'
        : 'Co-host invitation declined'
    };
  } catch (err: any) {
    console.error('Error responding to co-host invitation:', err);
    return { success: false, error: err.message };
  }
}

export async function notifyCoHostsOnPublish(livestreamId: string, inviterName?: string) {
  try {
    const content = await prisma.learnContent.findFirst({
      where: {
        OR: [
          { id: livestreamId },
          { slug: livestreamId }
        ]
      },
      include: {
        livestream: {
          include: { blocks: true }
        }
      }
    });

    if (!content) return { success: false, error: 'Content not found' };

    let collabs: any[] = [];
    try {
      collabs = JSON.parse(content.collaborators || '[]');
    } catch {
      collabs = [];
    }

    // Fallback to studioMeta if empty
    if (collabs.length === 0 && content.livestream?.blocks) {
      for (const b of content.livestream.blocks) {
        try {
          const parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
          if (parsed?._studioMeta?.collaborators && Array.isArray(parsed._studioMeta.collaborators)) {
            collabs = parsed._studioMeta.collaborators;
            break;
          }
        } catch {}
      }
    }

    // Filter active co-hosts (exclude declined) and deduplicate by normalized email
    const activeCoHosts = collabs.filter(c => c.status !== 'declined' && c.email);
    const seenEmails = new Set<string>();
    const uniqueCoHosts: typeof activeCoHosts = [];
    for (const c of activeCoHosts) {
      const norm = c.email.toLowerCase().trim();
      if (!seenEmails.has(norm)) {
        seenEmails.add(norm);
        uniqueCoHosts.push(c);
      }
    }

    if (uniqueCoHosts.length === 0) {
      return { success: true, count: 0, message: 'No co-hosts to notify' };
    }

    const appBase = process.env.NEXT_PUBLIC_APP_URL || 'https://darkpore.com';
    const viewerUrl = `${appBase}/modular-society/food/learn/livestream/${content.id}`;

    // Extract guest greenroom link from studio metadata or livestream object
    let guestStudioLink = (content.livestream as any)?.guestStudioUrl || '';
    const rawBlocks = content.livestream?.blocks || [];
    if (!guestStudioLink) {
      for (const b of rawBlocks) {
        try {
          const parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
          if (parsed?._studioMeta?.guestStudioUrl) {
            guestStudioLink = parsed._studioMeta.guestStudioUrl;
            break;
          }
        } catch {}
      }
    }

    let formattedDate = '';
    const rawTargetDate = content.targetDate || content.livestream?.scheduledFor;
    if (rawTargetDate) {
      try {
        const d = new Date(rawTargetDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          });
        }
      } catch {}
    }

    const slideCount = rawBlocks.filter(b => b.blockType !== 'metadata').length;

    let dispatchedCount = 0;
    for (const coHost of uniqueCoHosts) {
      if (resend && process.env.RESEND_API_KEY) {
        try {
          const subject = `Confirmed Broadcast Schedule: "${content.title}" on FoodNerve`;
          const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a; line-height: 1.6;">
              <div style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 28px; border-radius: 16px; margin-bottom: 24px; text-align: center; border: 1px solid rgba(16, 185, 129, 0.2);">
                <span style="display: inline-block; background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; border: 1px solid rgba(52, 211, 153, 0.3); margin-bottom: 12px;">
                  🗓️ Broadcast Officially Scheduled & Published
                </span>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">Speaker Briefing & Schedule Confirmation</h1>
                <p style="color: #a7f3d0; margin: 8px 0 0 0; font-size: 14px;">FoodNerve Broadcast Intelligence</p>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 26px; margin-bottom: 24px;">
                <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                  Hello ${coHost.name || 'Co-Host'},
                </p>
                <p style="font-size: 15px; color: #475569;">
                  The live broadcast session <strong>"${content.title}"</strong> has been officially confirmed and published on the FoodNerve network by <strong>${inviterName || content.authorName || 'the host'}</strong>.
                </p>

                <div style="background: #ffffff; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 10px; margin: 18px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                  <div style="font-weight: 800; font-size: 17px; color: #0f172a; margin-bottom: 8px;">
                    "${content.title}"
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13.5px; color: #475569;">
                    <div><strong>Your Assigned Role:</strong> <span style="color: #065f46; font-weight: 700;">${coHost.role || 'Co-Host'}</span></div>
                    ${formattedDate ? `<div><strong>Broadcast Time:</strong> <span style="color: #0f172a; font-weight: 700;">${formattedDate}</span></div>` : ''}
                    ${slideCount > 0 ? `<div><strong>Presentation Deck:</strong> ${slideCount} DEF sequence slides prepared</div>` : ''}
                  </div>
                </div>

                ${guestStudioLink ? `
                  <div style="background: #ecfdf5; border: 1.5px dashed #10b981; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.05em;">
                      🎙️ Private Backstage Studio Greenroom Link:
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #047857;">
                      Join 15 minutes before showtime to test video, audio, and review the DEF rundown.
                    </p>
                    <a href="${guestStudioLink}" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13.5px;">
                      Enter Greenroom Studio Room ↗
                    </a>
                  </div>
                ` : ''}

                <div style="text-align: center; margin-top: 24px;">
                  <a href="${viewerUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 14px;">
                    Open Society Broadcast Viewer →
                  </a>
                </div>
              </div>

              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                FoodNerve Broadcast Intelligence Network • Global Agribusiness Corridors
              </p>
            </div>
          `;

          const emailRes = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: coHost.email,
            subject,
            html: emailHtml,
          });
          if (emailRes.error) {
            console.error(`Failed to dispatch schedule confirmation to ${coHost.email}:`, emailRes.error);
          } else {
            dispatchedCount++;
          }
        } catch (e) {
          console.error(`Failed to dispatch schedule confirmation to ${coHost.email}:`, e);
        }
      } else {
        console.log(`[SIMULATED PUBLISH NOTIFICATION] To: ${coHost.email} | Subject: Broadcast Schedule Confirmation: "${content.title}" | Viewer: ${viewerUrl}`);
        dispatchedCount++;
      }
    }

    return { success: true, count: dispatchedCount };
  } catch (err: any) {
    console.error('Error in notifyCoHostsOnPublish:', err);
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

export async function findMatchingLivestreamDraft({
  userId,
  userEmail,
  organizationId,
  anchorArticleIds = [],
  ctaIds = [],
  category,
  timeframe,
  blueprintTitle,
  excludeDraftId,
}: {
  userId?: string;
  userEmail?: string;
  organizationId?: string | null;
  anchorArticleIds?: string[];
  ctaIds?: string[];
  category?: string;
  timeframe?: string;
  blueprintTitle?: string;
  excludeDraftId?: string | null;
}) {
  try {
    if (!userId && !userEmail && !organizationId) {
      return { success: false, draft: null };
    }

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

    const userOrConditions: any[] = [];
    if (aliases.length > 0) {
      userOrConditions.push({ authorId: { in: aliases } });
      aliases.forEach(a => {
        userOrConditions.push({ collaborators: { contains: a } });
      });
    }

    const whereClause: any = {
      status: 'draft',
      type: 'livestream',
      ...(excludeDraftId ? { id: { not: excludeDraftId } } : {}),
    };

    if (organizationId) {
      whereClause.organizationId = organizationId;
      if (userOrConditions.length > 0) {
        whereClause.OR = userOrConditions;
      }
    } else {
      whereClause.organizationId = null;
      if (userOrConditions.length > 0) {
        whereClause.OR = userOrConditions;
      }
    }

    const drafts = await prisma.learnContent.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        livestream: {
          include: {
            blocks: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        },
        organization: true
      }
    });

    if (!drafts || drafts.length === 0) {
      return { success: true, draft: null };
    }

    const normAnchor = Array.from(new Set(anchorArticleIds)).filter(Boolean).sort();
    const normCtas = Array.from(new Set(ctaIds)).filter(Boolean).sort();
    const targetBpTitle = (blueprintTitle || '').toLowerCase().trim();
    const targetCategory = (category || '').toLowerCase().trim();
    const targetTimeframe = (timeframe || '').toLowerCase().trim();

    let bestMatch: any = null;
    let highestScore = -1;

    for (const draft of drafts) {
      let meta: any = null;
      if ((draft as any)._studioMeta) {
        meta = (draft as any)._studioMeta;
      } else if ((draft.livestream as any)?._studioMeta) {
        meta = (draft.livestream as any)._studioMeta;
      } else {
        const blocks = draft.livestream?.blocks || (draft as any).livestreamBlocks || [];
        for (const b of blocks) {
          try {
            const parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
            if (parsed?._studioMeta) {
              meta = parsed._studioMeta;
              break;
            }
          } catch (e) {}
        }
      }

      const draftArticleIds = (meta?.guidingArticles || []).map((a: any) => typeof a === 'string' ? a : (a?.id || '')).filter(Boolean);
      const draftCtaIds = [
        ...(meta?.guidingJobs || []),
        ...(meta?.guidingListings || []),
        ...(meta?.guidingCampaigns || [])
      ].map((c: any) => typeof c === 'string' ? c : (c?.id || '')).filter(Boolean);

      const normDraftAnchor = Array.from(new Set(draftArticleIds)).filter(Boolean).sort();
      const normDraftCtas = Array.from(new Set(draftCtaIds)).filter(Boolean).sort();

      const bp = meta?.appliedBlueprint;
      const draftBpTitle = (bp?.typeTitle || bp?.title || '').toLowerCase().trim();
      const draftCategory = (draft.category || bp?.category || '').toLowerCase().trim();
      const draftTimeframe = (draft.timeframe || bp?.timeframe || '').toLowerCase().trim();

      // Check anchor articles match
      const exactArticlesMatch = normAnchor.length > 0 &&
        normAnchor.length === normDraftAnchor.length &&
        normAnchor.every((id, idx) => id === normDraftAnchor[idx]);

      // Check CTAs match
      const exactCtasMatch = normCtas.length === normDraftCtas.length &&
        normCtas.every((id, idx) => id === normDraftCtas[idx]);

      const blueprintMatch = Boolean(
        targetBpTitle && draftBpTitle && (draftBpTitle === targetBpTitle || draftBpTitle.includes(targetBpTitle) || targetBpTitle.includes(draftBpTitle))
      );

      const categoryMatch = Boolean(targetCategory && draftCategory && draftCategory === targetCategory);
      const timeframeMatch = Boolean(targetTimeframe && draftTimeframe && draftTimeframe === targetTimeframe);

      // Scoring
      let score = 0;

      if (normAnchor.length > 0) {
        // Tier 1: Anchor articles + CTAs must match
        if (!exactArticlesMatch || !exactCtasMatch) continue;
        score += 100;

        if (blueprintMatch) score += 40;
        if (categoryMatch) score += 20;
        if (timeframeMatch) score += 10;
      } else if (targetBpTitle && blueprintMatch) {
        // Tier 2: Studio Blueprint match when blueprint is selected without articles
        score += 60;
        if (exactCtasMatch) score += 20;
        if (categoryMatch) score += 15;
        if (timeframeMatch) score += 10;
      } else {
        // Neither anchor articles nor blueprint matched: no collision
        continue;
      }

      const draftTime = new Date(draft.updatedAt || draft.createdAt || 0).getTime();
      const bestTime = bestMatch ? new Date(bestMatch.updatedAt || bestMatch.createdAt || 0).getTime() : -1;

      if (score > highestScore || (score === highestScore && draftTime > bestTime)) {
        highestScore = score;
        bestMatch = { ...draft, _studioMeta: meta };
      }
    }

    return { success: true, draft: bestMatch || null };
  } catch (err: any) {
    console.error('Error finding matching livestream draft:', err);
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

