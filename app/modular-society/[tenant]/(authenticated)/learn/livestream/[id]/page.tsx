import React from 'react';
import { getLearnContentById } from '@/lib/actions/learn';
import { notFound } from 'next/navigation';
import { Box, Paper } from '@mui/material';
import LivestreamViewer from './LivestreamViewer';

export default async function LivestreamPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  const content = await getLearnContentById(resolvedParams.id);

  if (!content || content.type !== 'livestream') {
    return notFound();
  }

  return (
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
  );
}
