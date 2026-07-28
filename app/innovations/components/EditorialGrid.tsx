'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Button, Chip, Avatar, Grid } from '@mui/material';
import Link from 'next/link';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface ScheduleItem {
  day: string;
  dateStr: string;
  tag: string;
  tagColor?: string;
  title: string;
  badgeText?: string;
  badgeColor?: string;
  link?: string;
}

interface TrendingTopicItem {
  rank: string;
  topic: string;
  count: string;
  link?: string;
}

interface EditorialGridProps {
  schedule?: ScheduleItem[];
  liveDiscussion?: {
    title: string;
    speakers: string;
    dateStr: string;
    videoImageUrl?: string;
    link?: string;
  };
  trendingTopics?: TrendingTopicItem[];
}

export default function EditorialGrid({
  schedule,
  liveDiscussion,
  trendingTopics,
}: EditorialGridProps) {
  const defaultSchedule: ScheduleItem[] = [
    {
      day: 'MON',
      dateStr: '19 MAY',
      tag: 'SAVINGS',
      tagColor: '#b45309',
      title: 'Savings Groups in a Digital Age',
      badgeText: 'New Article',
      badgeColor: '#16a34a',
      link: '/learn',
    },
    {
      day: 'TUE',
      dateStr: '20 MAY',
      tag: 'TOMATOES',
      tagColor: '#dc2626',
      title: 'Post-Harvest Loss in Tomatoes',
      badgeText: 'New Article',
      badgeColor: '#16a34a',
      link: '/learn',
    },
    {
      day: 'WED',
      dateStr: '21 MAY',
      tag: 'LIVE DISCUSSION',
      tagColor: '#6366f1',
      title: 'Conflict, Food Systems & Resilience',
      badgeText: '7:00 PM WAT',
      badgeColor: '#6366f1',
      link: '/learn',
    },
    {
      day: 'THU',
      dateStr: '22 MAY',
      tag: 'EGGS',
      tagColor: '#d97706',
      title: 'Eggs: A Powerful Source of Nutrition',
      badgeText: 'Coming Tomorrow',
      badgeColor: '#64748b',
      link: '/learn',
    },
    {
      day: 'FRI',
      dateStr: '23 MAY',
      tag: 'FERTILIZER',
      tagColor: '#16a34a',
      title: 'Affordable Fertilizer for Smallholders',
      badgeText: 'Coming Soon',
      badgeColor: '#64748b',
      link: '/learn',
    },
  ];

  const defaultLive = liveDiscussion || {
    title: 'What This Week’s Three Stories Reveal About the Future of Food',
    speakers: 'With Ibidapo Agunbiade, Amaka Okafor, Chinedu Eze & Fatima Bello',
    dateStr: 'Wed, May 21 • 7:00 PM WAT',
    videoImageUrl: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&q=80&w=800',
    link: '/learn',
  };

  const defaultTrending: TrendingTopicItem[] = [
    { rank: '01', topic: 'Tomatoes', count: '8.4k', link: '/learn' },
    { rank: '02', topic: 'Savings', count: '6.7k', link: '/learn' },
    { rank: '03', topic: 'Eggs', count: '5.9k', link: '/learn' },
    { rank: '04', topic: 'Jihadism', count: '5.2k', link: '/learn' },
    { rank: '05', topic: 'Fertilizer', count: '4.8k', link: '/learn' },
    { rank: '06', topic: 'Land Ownership', count: '4.1k', link: '/learn' },
    { rank: '07', topic: 'Cold Storage', count: '3.9k', link: '/learn' },
    { rank: '08', topic: 'Youth in Agriculture', count: '3.6k', link: '/learn' },
  ];

  const daysList = schedule || defaultSchedule;
  const topicsList = trendingTopics || defaultTrending;

  return (
    <Box sx={{ bgcolor: '#ffffff', py: { xs: 5, md: 8 }, borderTop: '1px solid #f1f5f9' }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '4fr 4fr 4fr' },
            gap: { xs: 4, md: 5 },
            alignItems: 'stretch',
          }}
        >
          {/* COLUMN 1: THIS WEEK AT FOODNERVE */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: '24px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                pb: 1.5,
                borderBottom: '2px solid #f1f5f9',
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.05em', color: '#0f172a', textTransform: 'uppercase' }}>
                THIS WEEK AT FOODNERVE
              </Typography>
              <Typography
                component={Link}
                href="/learn"
                sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#16a34a', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                View full calendar →
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1, justifyContent: 'space-between' }}>
              {daysList.map((item, idx) => (
                <Box
                  key={idx}
                  component={Link}
                  href={item.link || '/learn'}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    py: 1,
                    px: 1.5,
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#f8fafc', transform: 'translateX(4px)' },
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ minWidth: 55, textAlign: 'left' }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '0.75rem', color: '#0f172a', lineHeight: 1 }}>
                        {item.day}
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.7rem', color: '#94a3b8', mt: 0.2 }}>
                        {item.dateStr}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '0.65rem',
                          color: item.tagColor || '#dc2626',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.tag}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: '#0f172a',
                          lineHeight: 1.2,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                  </Box>

                  {item.badgeText && (
                    <Chip
                      label={item.badgeText}
                      size="small"
                      sx={{
                        bgcolor: `${item.badgeColor || '#16a34a'}15`,
                        color: item.badgeColor || '#16a34a',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        borderRadius: '6px',
                        height: 24,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>

          {/* COLUMN 2: LIVE THIS WEEK */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: '24px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                pb: 1.5,
                borderBottom: '2px solid #f1f5f9',
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.05em', color: '#0f172a', textTransform: 'uppercase' }}>
                LIVE THIS WEEK
              </Typography>
              <Chip
                label="LIVE"
                size="small"
                sx={{ bgcolor: '#dc2626', color: '#ffffff', fontWeight: 900, fontSize: '0.7rem', height: 22, borderRadius: '4px' }}
              />
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                {/* Video Image Card */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: 180, md: 200 },
                    borderRadius: '16px',
                    overflow: 'hidden',
                    mb: 2.5,
                    bgcolor: '#0f172a',
                  }}
                >
                  <Box
                    component="img"
                    src={defaultLive.videoImageUrl}
                    alt={defaultLive.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayCircleFilledIcon sx={{ fontSize: 56, color: '#ffffff', opacity: 0.9 }} />
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.7rem',
                    letterSpacing: '0.08em',
                    color: '#6366f1',
                    textTransform: 'uppercase',
                    mb: 1,
                  }}
                >
                  LIVE DISCUSSION
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ fontWeight: 900, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: '#0f172a', lineHeight: 1.25, mb: 1.5 }}
                >
                  {defaultLive.title}
                </Typography>

                <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500, mb: 2 }}>
                  {defaultLive.speakers}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b', fontSize: '0.8rem', mb: 3 }}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{defaultLive.dateStr}</Typography>
                </Box>
              </Box>

              <Button
                component={Link}
                href={defaultLive.link || '/learn'}
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 900,
                  py: 1.5,
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  '&:hover': { bgcolor: '#15803d' },
                }}
              >
                Register for Live
              </Button>
            </Box>
          </Paper>

          {/* COLUMN 3: TRENDING TOPICS */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: '24px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                pb: 1.5,
                borderBottom: '2px solid #f1f5f9',
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.05em', color: '#0f172a', textTransform: 'uppercase' }}>
                TRENDING TOPICS
              </Typography>
              <Typography
                component={Link}
                href="/learn"
                sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#16a34a', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                View all →
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'space-between' }}>
              {topicsList.map((item) => (
                <Box
                  key={item.rank}
                  component={Link}
                  href={item.link || '/learn'}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    py: 1,
                    px: 1.5,
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#f8fafc', transform: 'translateX(4px)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#16a34a', minWidth: 24 }}>
                      {item.rank}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      {item.topic}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#94a3b8' }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
