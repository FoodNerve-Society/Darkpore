'use server';

import { prisma } from '@/lib/db/client';

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
  // Specific fields depending on type:
  articleBlocks?: ArticleBlockPayload[];
  videoUrl?: string;
  videoDuration?: string;
  classModules?: number;
  classDuration?: string;
  livestreamUrl?: string;
  reportPdfUrl?: string;
  reportPages?: number;
  thumbnailUrl?: string;
};

export async function createLearnContent(data: CreateLearnContentPayload, isDraft = false) {
  let finalSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
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
          status: isDraft ? 'draft' : 'published',
          bottleneckTags: JSON.stringify(data.bottleneckTags),
          category: data.category || null,
          subcategory: data.subcategory || null,
          timeframe: data.timeframe || null,
          thumbnailUrl: data.thumbnailUrl,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatarUrl: data.authorAvatarUrl,
        },
      });
    } else {
      content = await tx.learnContent.create({
        data: {
          title: data.title,
          description: data.description,
          slug: finalSlug,
          type: data.type,
          status: isDraft ? 'draft' : 'published',
          bottleneckTags: JSON.stringify(data.bottleneckTags),
          category: data.category || null,
          subcategory: data.subcategory || null,
          timeframe: data.timeframe || null,
          thumbnailUrl: data.thumbnailUrl,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatarUrl: data.authorAvatarUrl,
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
        const existingStream = await tx.learnLivestream.findUnique({ where: { learnContentId: content.id } });
        if (existingStream) {
          await tx.learnLivestream.update({
            where: { learnContentId: content.id },
            data: { streamUrl: data.livestreamUrl }
          });
        } else {
          await tx.learnLivestream.create({
            data: {
              learnContentId: content.id,
              streamUrl: data.livestreamUrl,
            },
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
      livestream: true,
      report: true,
    }
  });
}
