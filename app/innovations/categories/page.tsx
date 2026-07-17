'use client';

import React from 'react';
import { Box, Container, Typography, Grid, InputBase, Paper, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Swimlane from '../components/Swimlane';

const HARDCODED_CATEGORIES = [
  { id: 'lane-articles', title: 'Articles & Intelligence', color: '#3b82f6', newCount: 142 },
  { id: 'lane-livestreams', title: 'Livestreams', color: '#f59e0b', newCount: 24 },
  { id: 'lane-jobs', title: 'Jobs & Internships', color: '#10b981', newCount: 110 },
  { id: 'lane-volunteering', title: 'Volunteering', color: '#ec4899', newCount: 15 },
  { id: 'lane-opportunities', title: 'Funding & Grants', color: '#8b5cf6', newCount: 53 },
];

export default function CategoriesDirectory() {
  const scrollToLane = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
      {/* Premium Hero Section */}
      <Box sx={{ 
        position: 'relative',
        pt: { xs: 16, md: 24 }, 
        pb: { xs: 12, md: 16 },
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
        overflow: 'hidden',
        mb: 8
      }}>
        {/* Decorative background blur */}
        <Box sx={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '100%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '60%', height: '100%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '3rem', md: '5rem' }, color: '#0f172a', mb: 3, letterSpacing: '-0.02em' }}>
              Global Directory
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', fontSize: { xs: '1.1rem', md: '1.35rem' }, maxWidth: '650px', mx: 'auto', mb: 6, lineHeight: 1.6 }}>
              Search across the entire FoodNerve ecosystem or browse our primary categories to find exactly what you need.
            </Typography>
            
            <Paper
              elevation={0}
              sx={{
                p: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '700px',
                mx: 'auto',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.4)',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08), 0 0 0 4px rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
                '&:focus-within': { 
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 20px 40px -10px rgba(16,185,129,0.15), 0 0 0 4px rgba(16,185,129,0.1)',
                  borderColor: '#10b981'
                }
              }}
            >
              <IconButton sx={{ p: '12px', color: '#10b981' }} aria-label="search">
                <SearchIcon sx={{ fontSize: '1.8rem' }} />
              </IconButton>
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: '1.2rem', color: '#0f172a', fontWeight: 500 }}
                placeholder="Search for articles, jobs, grants, or events..."
                inputProps={{ 'aria-label': 'search the ecosystem' }}
              />
            </Paper>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 } }}>
        {/* Quick Jump Tabs */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto', 
          pb: 2, 
          mb: 8,
          '&::-webkit-scrollbar': { display: 'none' },
          justifyContent: { xs: 'flex-start', md: 'center' }
        }}>
          {HARDCODED_CATEGORIES.map((cat) => (
            <Box
              key={cat.id}
              onClick={() => scrollToLane(cat.id)}
              sx={{
                whiteSpace: 'nowrap',
                px: 3,
                py: 1.5,
                borderRadius: '999px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                '&:hover': {
                  borderColor: cat.color,
                  color: cat.color,
                  bgcolor: `${cat.color}08`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cat.color }} />
              {cat.title}
            </Box>
          ))}
        </Box>
      </Container>

      {/* Render all Swimlanes directly on the directory page */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, md: 8 } }}>
        {HARDCODED_CATEGORIES.map((cat) => (
          <Swimlane key={cat.id} lane={cat} />
        ))}
      </Box>
    </Box>
  );
}
