import React from 'react';
import type { Metadata } from 'next';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import { prisma } from '@/lib/db/client';
import { buildContentMetadata, buildArticleJsonLd, buildLivestreamJsonLd } from '@/lib/seo/schema';
import { PublicArticleViewer } from '@/components/learn/PublicArticleViewer';
import { PublicLivestreamViewer } from '@/components/learn/PublicLivestreamViewer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}): Promise<Metadata> {
  const { type, slug } = await params;
  const headersList = await headers();
  const host = headersList.get('host');

  const material = await prisma.learnContent.findFirst({
    where: {
      type,
      status: { in: ['published', 'scheduled'] },
      OR: [{ slug }, { id: slug }],
    },
    include: {
      article: {
        include: {
          blocks: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
      livestream: {
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
      title: 'Intelligence Not Found',
    };
  }

  const canonicalPath = `/learn/${type}/${material.slug || slug}`;
  return buildContentMetadata(material, host, canonicalPath);
}

export default async function GlobalLearnContentPage({ params }: { params: Promise<{ type: string, slug: string }> }) {
  const { type, slug } = await params;
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food';
  const tenant = getTenantConfig(tenantId);
  
  const material = await prisma.learnContent.findFirst({
    where: {
      type,
      status: { in: ['published', 'scheduled'] },
      OR: [{ slug }, { id: slug }]
    },
    include: {
      organization: true,
      article: {
        include: {
          blocks: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      },
      livestream: {
        include: {
          blocks: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      }
    }
  });

  if (!material) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#fff' }}>Intelligence not found.</div>;
  }

  // Resolve author details if authorId exists
  let authorObj: any = null;
  if (material.authorId) {
    try {
      authorObj = await prisma.user.findFirst({
        where: {
          OR: [{ id: material.authorId }, { firebaseUid: material.authorId }]
        }
      });
    } catch {
      authorObj = null;
    }
  }

  // Format the material for the public viewer component
  const formattedMaterial = {
    ...material,
    author: authorObj || (material.authorName ? { name: material.authorName, avatarUrl: material.authorAvatarUrl } : null),
    articleBlocks: material.article?.blocks || []
  };

  const orgDomain = tenantId === 'energy' ? 'energynerve.org' : 'foodnerve.org';
  const redirectUrl = type === 'livestream'
    ? `https://${orgDomain}/learn/livestream/${material.id || slug}`
    : `https://${orgDomain}/academy/${(material as any).challengeId || 'global'}/${slug}`;
  const loginUrl = `/join?redirect=${encodeURIComponent(redirectUrl)}`;

  // Find some related materials for the bottom
  const relatedRaw = await prisma.learnContent.findMany({
    where: {
      type,
      status: { in: ['published', 'scheduled'] },
      NOT: { OR: [{ id: material.id }, { slug: material.slug }] }
    },
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  const host = headersList.get('host');
  const canonicalPath = `/learn/${type}/${material.slug || slug}`;
  const jsonLd =
    type === 'livestream'
      ? buildLivestreamJsonLd(material, host, canonicalPath)
      : buildArticleJsonLd(material, host, canonicalPath);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#0f172a',
        backgroundImage: 'radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        pb: 12
      }}>
      <Box sx={{ maxWidth: type === 'livestream' ? 1040 : 860, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 14, md: 16 } }}>
        {/* ── Main Content Area ── */}
        {type === 'livestream' ? (
          <PublicLivestreamViewer material={formattedMaterial} tenant={tenant} loginUrl={loginUrl} themeMode="dark" />
        ) : (
          <PublicArticleViewer material={formattedMaterial} tenant={tenant} loginUrl={loginUrl} themeMode="dark" />
        )}

        {/* ── Related Knowledge ── */}
        {relatedRaw.length > 0 && (
          <Box sx={{ mt: 10 }}>
            <Typography sx={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              mb: 4,
            }}>
              More Intelligence
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              {relatedRaw.map((related) => (
                <Link key={related.slug} href={`/learn/${related.type}/${related.slug}`} passHref style={{ textDecoration: 'none' }}>
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    p: 3,
                    transition: 'all 0.25s',
                    height: '100%',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.15)', bgcolor: 'rgba(255,255,255,0.05)' },
                  }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'white', mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {related.title}
                    </Typography>
                  </Box>
                </Link>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
    </>
  );
}
