'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArticleReader } from '@/components/learn/ArticleReader';
import { Box, Paper } from '@mui/material';

export default function ArticleReaderClientPage({ slug }: { slug: string }) {
  const router = useRouter();

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
        <ArticleReader slug={slug} onBack={() => router.push('/learn')} />
      </Paper>
    </Box>
  );
}
