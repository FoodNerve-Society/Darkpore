'use server';

import { prisma } from '@/lib/db/client';

export type ArticleBlockPayload = {
  blockType: string;
  orderIndex: number;
  content: string; // JSON string
};

export type CreateLearnContentPayload = {
  title: string;
  description: string;
  slug: string;
  type: 'article' | 'video' | 'class' | 'livestream' | 'report';
  bottleneckTags: string[]; // We will JSON.stringify this before DB insert
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

export async function createLearnContent(data: CreateLearnContentPayload) {
  let finalSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  // 1. Uniqueness check loop
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

  // 2. Perform insert in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Insert Master record
    const content = await tx.learnContent.create({
      data: {
        title: data.title,
        description: data.description,
        slug: finalSlug,
        type: data.type,
        bottleneckTags: JSON.stringify(data.bottleneckTags),
        thumbnailUrl: data.thumbnailUrl,
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatarUrl: data.authorAvatarUrl,
      },
    });

    // Insert Polymorphic Child record
    switch (data.type) {
      case 'article':
        const article = await tx.learnArticle.create({
          data: {
            learnContentId: content.id,
          },
        });
        if (data.articleBlocks && data.articleBlocks.length > 0) {
          await tx.learnArticleBlock.createMany({
            data: data.articleBlocks.map(block => ({
              articleId: article.id,
              orderIndex: block.orderIndex,
              blockType: block.blockType,
              content: block.content,
            })),
          });
        }
        break;
      case 'video':
        await tx.learnVideo.create({
          data: {
            learnContentId: content.id,
            videoUrl: data.videoUrl || '',
            duration: data.videoDuration,
          },
        });
        break;
      case 'class':
        await tx.learnClass.create({
          data: {
            learnContentId: content.id,
            moduleCount: data.classModules || 1,
            totalDuration: data.classDuration,
          },
        });
        break;
      case 'livestream':
        await tx.learnLivestream.create({
          data: {
            learnContentId: content.id,
            streamUrl: data.livestreamUrl,
          },
        });
        break;
      case 'report':
        await tx.learnReport.create({
          data: {
            learnContentId: content.id,
            pdfUrl: data.reportPdfUrl || '',
            pageCount: data.reportPages,
          },
        });
        break;
    }

    return content;
  });

  return { success: true, slug: result.slug };
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
