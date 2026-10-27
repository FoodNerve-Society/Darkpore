import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getLearnContentById } from '@/lib/actions/learn';
import { buildContentMetadata, buildLivestreamJsonLd } from '@/lib/seo/schema';
import { notFound } from 'next/navigation';
import { Box, Paper } from '@mui/material';
import LivestreamViewer from './LivestreamViewer';

interface PageProps {
  params: Promise<{ tenant: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let host: string | null = null;
  try {
    const headersList = await headers();
    host = headersList.get('host');
  } catch {
    host = null;
  }
  const content = await getLearnContentById(resolvedParams.id);

  if (!content || content.type !== 'livestream') {
    return {
      title: 'Livestream Not Found',
    };
  }

  const canonicalPath = `/learn/livestream/${content.id}`;
  return buildContentMetadata(content, host, canonicalPath);
}

export default async function LivestreamPage({ params }: PageProps) {
  const resolvedParams = await params;
  let host: string | null = null;
  try {
    const headersList = await headers();
    host = headersList.get('host');
  } catch {
    host = null;
  }
  const content = await getLearnContentById(resolvedParams.id);

  if (!content || content.type !== 'livestream') {
    return notFound();
  }

  const canonicalPath = `/learn/livestream/${content.id}`;
  const jsonLd = buildLivestreamJsonLd(content, host, canonicalPath);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Box
        id="article-reader-scroll-container"
        sx={{
          flex: 1,
          minHeight: 0,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          p: { xs: 0.5, sm: 1, md: 2 },
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 0, md: 3 },
            borderRadius: { xs: 2, md: 4 },
            minHeight: '100%',
            bgcolor: 'background.paper',
            boxShadow: { xs: 'none', md: '0 10px 40px rgba(0,0,0,0.04)' },
          }}
        >
          <LivestreamViewer content={content} />
        </Paper>
      </Box>
    </>
  );
}
