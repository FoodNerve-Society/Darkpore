'use client';

import React, { use } from 'react';
import { Box, Container, Typography, Grid, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { EcosystemCard } from '../../components/EcosystemCard';
import { EcosystemItem } from '../../components/TabbedHero';

// Simple helper to capitalize and format the slug into a title
const formatTitle = (slug: string) => {
  if (!slug) return '';
  const titles: Record<string, string> = {
    articles: 'Articles & Intelligence',
    livestreams: 'Livestreams',
    jobs: 'Jobs & Internships',
    volunteering: 'Volunteering',
    opportunities: 'Funding & Grants',
  };
  return titles[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1);
};

// Helper for color
const getColor = (slug: string) => {
  if (!slug) return '#0f172a';
  const colors: Record<string, string> = {
    articles: '#3b82f6',
    livestreams: '#f59e0b',
    jobs: '#10b981',
    volunteering: '#ec4899',
    opportunities: '#8b5cf6',
  };
  return colors[slug.toLowerCase()] || '#0f172a';
};

export default function CategoryArchive({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const title = formatTitle(slug);
  const color = getColor(slug);

  // Generate 20 mock items for this category archive
  const mockItems: EcosystemItem[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `mock-${slug}-${i}`,
    title: `${title} Item #${i + 1}: Detailed insights and opportunities`,
    type: title,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    tags: ['Ecosystem', 'Archived'],
    link: '#',
    description: 'This is a mock description for the UI to represent the data correctly in the archive view.',
    date: '2026-07-17',
    authorName: 'Food Nerve',
    metaInfo: '2 days ago'
  }));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pt: { xs: 12, md: 16 }, pb: 10 }}>
      <Container maxWidth="xl">
        {/* Navigation & Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton 
              component={Link} 
              href="/categories" 
              sx={{ mr: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f1f5f9' } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
              Back to Global Directory
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: color }} />
            <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '3.5rem' }, color: '#0f172a' }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 2, color: '#64748b', fontSize: '1.2rem', maxWidth: '800px' }}>
            Browse all available {title.toLowerCase()} within the FoodNerve ecosystem.
          </Typography>
        </Box>

        {/* Vertical Grid Layout */}
        <Grid container spacing={3}>
          {mockItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Box sx={{ height: { xs: '280px', sm: '320px' } }}>
                <EcosystemCard item={item} themeColor={color} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
