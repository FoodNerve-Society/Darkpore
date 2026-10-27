import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/client';
import { buildContentMetadata, buildArticleJsonLd } from '@/lib/seo/schema';
import ArticleReaderClientPage from './ArticleReaderClientPage';

interface PageProps {
  params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let host: string | null = null;
  try {
    const headersList = await headers();
    host = headersList.get('host');
  } catch {
    host = null;
  }

  const material = await prisma.learnContent.findFirst({
    where: {
      type: 'article',
      status: { in: ['published', 'scheduled'] },
      OR: [{ slug }, { id: slug }],
    },
    include: {
      organization: true,
      article: {
        include: {
          blocks: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  if (!material) {
    return {
      title: 'Article Not Found',
    };
  }

  const canonicalPath = `/learn/article/${material.slug || slug}`;
  return buildContentMetadata(material, host, canonicalPath);
}

export default async function SocietyArticleReaderPage({ params }: PageProps) {
  const { slug } = await params;
  let host: string | null = null;
  try {
    const headersList = await headers();
    host = headersList.get('host');
  } catch {
    host = null;
  }

  const material = await prisma.learnContent.findFirst({
    where: {
      type: 'article',
      status: { in: ['published', 'scheduled'] },
      OR: [{ slug }, { id: slug }],
    },
    include: {
      organization: true,
      article: {
        include: {
          blocks: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  const canonicalPath = `/learn/article/${material?.slug || slug}`;
  const jsonLd = material ? buildArticleJsonLd(material, host, canonicalPath) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ArticleReaderClientPage slug={slug} />
    </>
  );
}
