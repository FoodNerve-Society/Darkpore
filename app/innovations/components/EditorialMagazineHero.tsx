'use client';

import React from 'react';
import { Box, Typography, Container, Button, Avatar, Chip, IconButton, Paper } from '@mui/material';
import Link from 'next/link';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

export interface EditorialStoryItem {
  id: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  readTime?: string;
  categoryLabel?: string;
  link: string;
  videoUrl?: string;
  audioUrl?: string;
}

interface EditorialMagazineHeroProps {
  featuredStory?: EditorialStoryItem | null;
  topStories?: EditorialStoryItem[];
}

export default function EditorialMagazineHero({
  featuredStory,
  topStories = [],
}: EditorialMagazineHeroProps) {
  // Default fallback if featuredStory is not provided
  const mainStory: EditorialStoryItem = featuredStory || {
    id: 'default-featured',
    title: 'Can community savings groups transform food security?',
    summary: 'Across Africa, informal savings networks are helping families fund farms, survive shocks, and build resilient local businesses.',
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200',
    authorName: 'Amaka Okafor',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    readTime: '8 min read • Analysis',
    categoryLabel: 'SAVINGS',
    link: '/learn',
  };

  const defaultTopStories: EditorialStoryItem[] = [
    {
      id: 'top-1',
      title: 'Why Nigeria loses so many tomatoes before they reach the market',
      categoryLabel: 'TOMATOES',
      authorName: 'Chinedu Eze',
      readTime: '7 min read',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400',
      link: '/learn',
    },
    {
      id: 'top-2',
      title: 'How insecurity is reshaping food trade across the Sahel',
      categoryLabel: 'JIHADISM',
      authorName: 'Fatima Bello',
      readTime: '12 min read',
      imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=400',
      link: '/learn',
    },
    {
      id: 'top-3',
      title: 'Could one egg a day transform child nutrition?',
      categoryLabel: 'EGGS',
      authorName: 'Dr. Tobi Adeyemi',
      readTime: '6 min read',
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=400',
      link: '/learn',
    },
    {
      id: 'top-4',
      title: 'Why fertilizer remains unaffordable for small farmers',
      categoryLabel: 'FERTILIZER',
      authorName: 'Kelechi Iheanacho',
      readTime: '6 min read',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400',
      link: '/learn',
    },
  ];

  const sideStories = topStories.length > 0 ? topStories : defaultTopStories;

  return (
    <Box sx={{ bgcolor: '#ffffff', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
            gap: { xs: 3, md: 4 },
            alignItems: 'stretch',
          }}
        >
          {/* LEFT: MASSIVE FEATURED STORY CARD */}
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              bgcolor: '#0f172a',
              color: '#ffffff',
              minHeight: { xs: '450px', md: '560px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: { xs: 3, sm: 4, md: 5 },
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            }}
          >
            {/* Background Image & Gradient Overlays */}
            {mainStory.imageUrl && (
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Box
                  component="img"
                  src={mainStory.imageUrl}
                  alt={mainStory.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.7) 50%, rgba(15,23,42,0.2) 100%)',
                  }}
                />
              </Box>
            )}

            {/* Top Category / Type Tag */}
            <Box sx={{ position: 'relative', zIndex: 1, mb: 2 }}>
              <Chip
                label={`ARTICLE • ${mainStory.categoryLabel || 'SAVINGS'}`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '999px',
                  px: 1.2,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              />
            </Box>

            {/* Title & Summary */}
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '680px', mb: 3 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.2rem' },
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  mb: 2,
                  color: '#ffffff',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                {mainStory.title}
              </Typography>
              {mainStory.summary && (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                    lineHeight: 1.5,
                    mb: 3,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {mainStory.summary}
                </Typography>
              )}

              {/* Author & Reading Time */}
              {mainStory.authorName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Avatar
                    src={mainStory.authorAvatarUrl}
                    sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.4)' }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.1 }}>
                      By {mainStory.authorName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>
                      {mainStory.readTime || '5 min read'}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* 3 FORMAT ACTION BUTTONS */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Button
                  component={Link}
                  href={mainStory.link}
                  variant="contained"
                  startIcon={<MenuBookIcon />}
                  sx={{
                    bgcolor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 800,
                    borderRadius: '10px',
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                    '&:hover': { bgcolor: '#15803d' },
                  }}
                >
                  Read Article
                </Button>
                <Button
                  component={Link}
                  href={mainStory.link}
                  variant="outlined"
                  startIcon={<PlayCircleIcon />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '10px',
                    px: 2.5,
                    py: 1.2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  Watch Video
                </Button>
                <Button
                  component={Link}
                  href={mainStory.link}
                  variant="outlined"
                  startIcon={<HeadphonesIcon />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '10px',
                    px: 2.5,
                    py: 1.2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  Listen
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* RIGHT: TOP STORIES COLUMN */}
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2.5,
                pb: 1,
                borderBottom: '2px solid #f1f5f9',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '1rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#0f172a',
                }}
              >
                TOP STORIES
              </Typography>
              <Typography
                component={Link}
                href="/learn"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#16a34a',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View all stories →
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1, justifyContent: 'space-between' }}>
              {sideStories.slice(0, 4).map((story) => (
                <Box
                  key={story.id}
                  component={Link}
                  href={story.link}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    textDecoration: 'none',
                    p: 1.5,
                    borderRadius: '16px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#f8fafc',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    sx={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 90 },
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      bgcolor: '#e2e8f0',
                    }}
                  >
                    {story.imageUrl && (
                      <Box
                        component="img"
                        src={story.imageUrl}
                        alt={story.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </Box>

                  {/* Text details */}
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '0.7rem',
                          letterSpacing: '0.08em',
                          color: '#dc2626', // Saturated tag color
                          textTransform: 'uppercase',
                        }}
                      >
                        {story.categoryLabel || 'INSIGHT'}
                      </Typography>
                      <IconButton size="small" sx={{ p: 0.5, color: '#94a3b8' }}>
                        <BookmarkBorderIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: '#0f172a',
                        lineHeight: 1.25,
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {story.title}
                    </Typography>

                    <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                      By {story.authorName || 'FoodNerve'} • {story.readTime || '5 min read'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
