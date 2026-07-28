'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import PublicIcon from '@mui/icons-material/Public';
import SchoolIcon from '@mui/icons-material/School';

export interface TopicItem {
  id: string;
  name: string;
  iconUrl?: string;
  emoji?: string;
  link: string;
}

interface TopicExplorerRowProps {
  topics?: TopicItem[];
}

export default function TopicExplorerRow({ topics }: TopicExplorerRowProps) {
  const defaultTopics: TopicItem[] = [
    { id: '1', name: 'Savings', emoji: '🫙', link: '/learn' },
    { id: '2', name: 'Tomatoes', emoji: '🍅', link: '/learn' },
    { id: '3', name: 'Eggs', emoji: '🥚', link: '/learn' },
    { id: '4', name: 'Fertilizer', emoji: '🪴', link: '/learn' },
    { id: '5', name: 'Seeds', emoji: '🌱', link: '/learn' },
    { id: '6', name: 'Cold Storage', emoji: '🧊', link: '/learn' },
    { id: '7', name: 'Jihadism', emoji: '🛡️', link: '/learn' },
    { id: '8', name: 'Land Ownership', emoji: '🏞️', link: '/learn' },
    { id: '9', name: 'Solar Power', emoji: '☀️', link: '/learn' },
    { id: '10', name: 'Fish', emoji: '🐟', link: '/learn' },
  ];

  const topicsList = topics || defaultTopics;

  const trustBadges = [
    { icon: <VerifiedUserIcon sx={{ color: '#16a34a', fontSize: 20 }} />, label: 'Independent & Evidence-Based' },
    { icon: <EmojiObjectsIcon sx={{ color: '#f59e0b', fontSize: 20 }} />, label: 'Solutions-Oriented Journalism' },
    { icon: <PublicIcon sx={{ color: '#3b82f6', fontSize: 20 }} />, label: 'Voices from the Global South' },
    { icon: <SchoolIcon sx={{ color: '#ec4899', fontSize: 20 }} />, label: 'Open Knowledge for All' },
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff', py: { xs: 6, md: 8 }, borderTop: '1px solid #f1f5f9' }}>
      <Container maxWidth="xl">
        {/* HEADER */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>
              EXPLORE 70 TOPICS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: '#0f172a' }}>
              Dive deep into every part of the food system.
            </Typography>
          </Box>

          <Typography
            component={Link}
            href="/learn"
            sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#16a34a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}
          >
            View all 70 topics <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Typography>
        </Box>

        {/* ICON GRID */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
            gap: 2,
            mb: 8,
          }}
        >
          {topicsList.map((item) => (
            <Paper
              key={item.id}
              component={Link}
              href={item.link}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#ffffff',
                  transform: 'translateY(-4px)',
                  borderColor: '#16a34a',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                }}
              >
                {item.emoji || '📌'}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', textAlign: 'center' }}>
                {item.name}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* CREDIBILITY BADGES FOOTER */}
        <Box
          sx={{
            pt: 4,
            borderTop: '1px solid #f1f5f9',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 3,
            alignItems: 'center',
          }}
        >
          {trustBadges.map((badge, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'flex-start', md: 'center' } }}>
              {badge.icon}
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>
                {badge.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
