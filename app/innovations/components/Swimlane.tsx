'use client';

import React, { useRef } from 'react';
import { Box, Typography, Container, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { EcosystemCard } from './EcosystemCard';
import { EcosystemItem } from './TabbedHero';

export default function Swimlane({ lane }: { lane: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
  };

  // Generate mock items based on the newCount
  const mockItems: EcosystemItem[] = Array.from({ length: Math.max(1, lane.newCount) }).map((_, i) => ({
    id: `mock-${lane.id}-${i}`,
    title: `Mock ${lane.title} Item #${i + 1}`,
    type: lane.title.includes('Articles') ? 'Intelligence' : lane.title.includes('Jobs') ? 'Jobs' : 'Innovations',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    tags: ['Ecosystem', 'New'],
    link: '#',
    description: 'This is a mock description for the UI to represent the data correctly.',
    date: '2026-07-17',
    authorName: 'Food Nerve'
  }));

  return (
    <Box id={lane.id} sx={{ mb: { xs: 4, md: 8 }, px: { xs: 2, md: 6 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            <Box sx={{ width: { xs: 8, md: 12 }, height: { xs: 8, md: 12 }, borderRadius: '50%', bgcolor: lane.color }} />
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.25rem', md: '2.125rem' } }}>
              {lane.title}
            </Typography>
            <Box sx={{ bgcolor: `${lane.color}15`, color: lane.color, px: { xs: 1, md: 1.5 }, py: { xs: 0.25, md: 0.5 }, borderRadius: '8px', fontSize: { xs: '0.65rem', md: '0.85rem' }, fontWeight: 800 }}>
              {lane.newCount} New Additions
            </Box>
          </Box>
          
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            <IconButton onClick={scrollLeft} sx={{ border: '1px solid #e2e8f0', bgcolor: '#ffffff', '&:hover': { bgcolor: '#f8fafc' } }}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={scrollRight} sx={{ border: '1px solid #e2e8f0', bgcolor: '#ffffff', '&:hover': { bgcolor: '#f8fafc' } }}>
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ position: 'relative' }}>
          <Box 
            ref={scrollRef}
            sx={{ 
              display: 'flex', 
              gap: 3, 
              overflowX: 'auto', 
              py: 5,
              px: 2,
              my: -5,
              mx: -2,
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for a much cleaner look
            }}
          >
            {mockItems.map((item) => (
              <Box key={item.id} sx={{ minWidth: { xs: '200px', sm: '280px' }, scrollSnapAlign: 'start' }}>
                <EcosystemCard item={item} themeColor={lane.color} hideTags={true} />
              </Box>
            ))}
          </Box>
          
          {/* Right side blur overlay to indicate more scrollable content */}
          <Box sx={{ 
            position: 'absolute', top: 0, bottom: '24px', right: 0, width: { xs: '50px', md: '100px' }, 
            background: 'linear-gradient(to right, transparent, #ffffff)', 
            pointerEvents: 'none', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: { xs: 1, md: 3 }
          }}>
            <ArrowForwardIosIcon sx={{ color: 'rgba(0,0,0,0.2)', fontSize: '1.5rem' }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
