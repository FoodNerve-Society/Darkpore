import React from 'react';
import { Box } from '@mui/material';
import { getLearnContentBySlug } from '@/lib/actions/learn';
import { ArticleReader } from '@/components/learn/ArticleReader';
import { redirect } from 'next/navigation';

export default async function PublicArticlePage({
  params
}: {
  params: Promise<{ challenge: string; subcategory: string; section: string; slug: string }>
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  // Fetch the article data from the database
  const articleData = await getLearnContentBySlug(slug);

  if (!articleData) {
    // If not found, redirect back to the section page
    redirect(`/innovations/${resolvedParams.challenge}/${resolvedParams.subcategory}/${resolvedParams.section}`);
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      // Provide some top padding to account for the site navigation
      pt: { xs: 12, md: 16 },
      pb: 10
    }}>
      <ArticleReader slug={slug} articleData={articleData as any} />
    </Box>
  );
}
