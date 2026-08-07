'use server';

import { prisma } from '@/lib/db/client';
import { syncCalendarEvent, removeCalendarEvent } from '@/lib/calendar-sync';

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

  if (result.status === 'published') {
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
      date: result.createdAt,
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
    where: { slug },
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

export async function getUserDrafts(userId: string) {
  return await prisma.learnContent.findMany({
    where: { authorId: userId, status: 'draft' },
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
      type: 'job',
      status: 'active',
      OR: orgId ? [{ organizationId: orgId }] : [{ postedById: userId }]
    },
    include: { organization: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  return { articles, jobs };
}
