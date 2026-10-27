import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Box, Container, Typography, Avatar, Divider } from '@mui/material';
import { getLearnContentBySlug } from '@/lib/actions/learn';
import { ArticleBlockRenderer } from '@/components/learn/ArticleBlockRenderer';
import { getCorridorResurfaceInfo } from '@/lib/cms/commodities';
import { buildContentMetadata, buildArticleJsonLd } from '@/lib/seo/schema';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ tenant: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) return { title: 'Intelligence Not Found' };

  let host: string | null = null;
  try {
    const headersList = await headers();
    host = headersList.get('host');
  } catch {
    host = null;
  }
  const content = await getLearnContentBySlug(slug);

  if (!content) return { title: 'Intelligence Not Found' };

  return buildContentMetadata(content, host, `/learn/article/${content.slug || slug}`);
}

export default async function LearnContentPage({ 
  params 
}: { 
  params: Promise<{ tenant: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const content = await getLearnContentBySlug(slug);

  if (!content) {
    notFound();
  }

  let host: string | null = null;
  try {
    const headersList = await headers();
    host = headersList.get('host');
  } catch {
    host = null;
  }
  const jsonLd = buildArticleJsonLd(content, host, `/learn/article/${content.slug || slug}`);

  // Determine which layout to show based on the type
  // For now, focusing on 'article'
  if (content.type !== 'article' || !content.article) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4">Content type {content.type} rendering is coming soon.</Typography>
      </Container>
    );
  }

  const { article } = content;
  const corridorInfo = getCorridorResurfaceInfo({
    bottleneckTags: content.bottleneckTags,
    targetDate: content.targetDate,
    createdAt: content.createdAt,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pt: 12, pb: 16 }}>
        <Container maxWidth="md">
        {/* Article Header */}
        <Box sx={{ mb: 6 }}>
          {/* Living Corridor Memo / Resurfaced Banner */}
          {corridorInfo.isResurfaced && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.25,
                px: 2,
                py: 1,
                mb: 2.5,
                borderRadius: '16px',
                bgcolor: 'rgba(59, 130, 246, 0.08)',
                border: '1.5px solid rgba(59, 130, 246, 0.25)',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)',
              }}
            >
              <Box sx={{ fontSize: '1.1rem', lineHeight: 1 }}>🔄</Box>
              <Box>
                <Typography sx={{ color: '#1d4ed8', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                  Living Corridor Memo • Resurfaced for Week {corridorInfo.currentWeek}: {corridorInfo.currentWeekCommodity} Focus
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600, mt: 0.15 }}>
                  Originally published {corridorInfo.authorWeek ? `for Week ${corridorInfo.authorWeek}` : ''} • Covers {corridorInfo.coveredCommodities.join(', ')}
                </Typography>
              </Box>
            </Box>
          )}

          {corridorInfo.isEvergreen && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.25,
                px: 2,
                py: 1,
                mb: 2.5,
                borderRadius: '16px',
                bgcolor: 'rgba(16, 185, 129, 0.08)',
                border: '1.5px solid rgba(16, 185, 129, 0.25)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)',
              }}
            >
              <Box sx={{ fontSize: '1.1rem', lineHeight: 1 }}>🌐</Box>
              <Box>
                <Typography sx={{ color: '#047857', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                  Evergreen Macro Supply-Chain Intelligence
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600, mt: 0.15 }}>
                  Systemic national reference active across all 52 corridor weeks
                </Typography>
              </Box>
            </Box>
          )}

          {/* Tags */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {(() => {
              try {
                const tags = JSON.parse(content.bottleneckTags);
                return tags.map((tag: string, i: number) => (
                  <Box key={i} sx={{ 
                    px: 2, py: 0.5, borderRadius: '12px', 
                    bgcolor: 'rgba(0,0,0,0.04)', color: '#475569', 
                    fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' 
                  }}>
                    {tag}
                  </Box>
                ));
              } catch {
                return null;
              }
            })()}
          </Box>

          <Typography variant="h1" sx={{ color: '#0f172a', fontWeight: 900, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1, letterSpacing: '-0.02em', mb: 3 }}>
            {content.title}
          </Typography>

          <Typography sx={{ color: '#475569', fontSize: { xs: '1.2rem', md: '1.5rem' }, lineHeight: 1.5, mb: 4, fontWeight: 500 }}>
            {content.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={content.authorAvatarUrl || ''} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography sx={{ color: '#0f172a', fontWeight: 700 }}>{content.authorName || 'Anonymous'}</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(content.createdAt))}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Thumbnail if present */}
        {content.thumbnailUrl && (
          <Box sx={{ mb: 6, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <img src={content.thumbnailUrl} alt={content.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </Box>
        )}

        {/* Article Blocks */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {article.blocks.map((block: any) => (
            <ArticleBlockRenderer 
              key={block.id} 
              block={{ id: block.id, blockType: block.blockType, content: block.content }} 
              themeMode="light" 
            />
          ))}
        </Box>

        <Divider sx={{ my: 8 }} />
        
        {/* End of article / author bio / footer can go here */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#64748b', fontWeight: 600 }}>End of Briefing.</Typography>
        </Box>

      </Container>
    </Box>
    </>
  );
}
