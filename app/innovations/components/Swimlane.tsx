'use client';

import React, { useRef } from 'react';
import { Box, Typography, Container, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Link from 'next/link';
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
    <Box id={lane.id} sx={{ mb: { xs: 4, md: 8 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            <Box sx={{ width: { xs: 8, md: 12 }, height: { xs: 8, md: 12 }, borderRadius: '50%', bgcolor: lane.color }} />
            <Link href={`/categories/${lane.id.replace('lane-', '')}`} style={{ textDecoration: 'none' }}>
              <Typography 
                variant="h4" 
                sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.25rem', md: '2.125rem' }, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
              >
                {lane.title}
              </Typography>
            </Link>
            <Box sx={{ bgcolor: `${lane.color}15`, color: lane.color, px: { xs: 1, md: 1.5 }, py: { xs: 0.25, md: 0.5 }, borderRadius: '8px', fontSize: { xs: '0.65rem', md: '0.85rem' }, fontWeight: 800, display: { xs: 'none', sm: 'block' } }}>
              {lane.newCount} New
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href={`/categories/${lane.id.replace('lane-', '')}`} style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                display: 'flex', alignItems: 'center', gap: 0.5, 
                color: lane.color, 
                fontWeight: 800, fontSize: { xs: '0.75rem', md: '0.9rem' },
                transition: 'all 0.2s',
                px: { xs: 1.5, md: 2 }, py: { xs: 0.75, md: 1 },
                borderRadius: '999px',
                bgcolor: `${lane.color}15`,
                '&:hover': { bgcolor: `${lane.color}25`, transform: 'translateX(4px)' }
              }}>
                Archive <ArrowForwardIosIcon sx={{ fontSize: '0.8rem' }} />
              </Box>
            </Link>
          </Box>          
        </Box>
        
        {/* Edge-Bleed Scroll Area (Right side only) */}
        <Box sx={{ position: 'relative', width: '100%', mr: 'calc(-50vw + 50%)', py: 5, my: -5 }}>
          <Box 
            ref={scrollRef}
            sx={{ 
              display: 'flex', 
              gap: 3, 
              overflowX: 'auto', 
              pb: 5,
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {mockItems.map((item) => (
              <Box key={item.id} sx={{ minWidth: { xs: '200px', sm: '280px' }, scrollSnapAlign: 'start' }}>
                <EcosystemCard item={item} themeColor={lane.color} hideTags={true} />
              </Box>
            ))}

            {/* VIEW ALL CARD */}
            <Box 
              component={Link}
              href={`/categories/${lane.id.replace('lane-', '')}`}
              sx={{ 
                minWidth: { xs: '160px', sm: '220px' }, 
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f8fafc',
                borderRadius: { xs: 2, sm: 4 },
                border: '2px dashed #e2e8f0',
                textDecoration: 'none',
                color: lane.color,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: lane.color,
                  color: '#ffffff',
                  borderStyle: 'solid',
                  borderColor: lane.color,
                  boxShadow: `0 20px 40px -10px ${lane.color}80`
                }
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: '2rem', mb: 2 }} />
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                View All 100+
              </Typography>
            </Box>
            
            {/* Right padding spacer to ensure last item can scroll fully into view */}
            <Box sx={{ minWidth: { xs: '20px', md: '50vw' } }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
