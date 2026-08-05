'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Container, IconButton, Skeleton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Link from 'next/link';
import { EcosystemCard } from './EcosystemCard';
import { EcosystemItem } from './TabbedHero';

export default function Swimlane({ lane }: { lane: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTickerIndex, setActiveTickerIndex] = useState(0);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
  };

  const itemsToDisplay: EcosystemItem[] = lane.items && lane.items.length > 0 ? lane.items : [];

  // Event-driven sequencing: no timer, each card drives the next
  const advanceToNextCard = useCallback(() => {
    setActiveTickerIndex((prev) => (prev + 1) % Math.max(1, itemsToDisplay.length));
  }, [itemsToDisplay.length]);

  // Smoothly scroll the newly active card to center
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const child = container.children[activeTickerIndex] as HTMLElement | undefined;
    if (!child) return;

    const scrollTarget = child.offsetLeft - (container.clientWidth / 2) + (child.clientWidth / 2);
    container.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: 'smooth',
    });
  }, [activeTickerIndex]);

  return (
    <Box id={lane.id} sx={{ mb: { xs: 2, md: 3 }, scrollMarginTop: '120px' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, md: 2 }, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            <Box sx={{ width: { xs: 8, md: 12 }, height: { xs: 8, md: 12 }, borderRadius: '50%', bgcolor: lane.color }} />
            <Link href={`/categories/${lane.id.replace('lane-', '')}`} style={{ textDecoration: 'none' }}>
              <Typography 
                variant="h4" 
                sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.05rem', md: '1.6rem' }, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
              >
                {lane.title}
              </Typography>
            </Link>
            {lane.newCount > 0 && (
              <Box sx={{ bgcolor: `${lane.color}15`, color: lane.color, px: { xs: 1, md: 1.5 }, py: { xs: 0.25, md: 0.5 }, borderRadius: '8px', fontSize: { xs: '0.65rem', md: '0.85rem' }, fontWeight: 800, display: { xs: 'none', sm: 'block' } }}>
                {lane.newCount} Total
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Scroll container */}
        <Box sx={{ position: 'relative', width: '100%', mr: 'calc(-50vw + 50%)', py: 4, my: -4 }}>
          <Box 
            ref={scrollRef}
            sx={{ 
              display: 'flex', 
              gap: 3, 
              overflowX: 'auto', 
              pt: 2,
              pb: 6,
              px: 4,
              mx: -4,
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {itemsToDisplay.length > 0 ? (
              itemsToDisplay.map((item, idx) => (
                <Box key={item.id} sx={{ width: lane.id === 'lane-livestreams' ? { xs: 320, md: 480 } : lane.id === 'lane-top-stories' ? { xs: 260, md: 300 } : { xs: 280, md: 360 }, flexShrink: 0, pt: 1 }}>
                  <EcosystemCard 
                    item={item} 
                    themeColor={lane.color} 
                    isFirst={idx === 0}
                    isLast={idx === itemsToDisplay.length - 1}
                    tickerIndex={idx}
                    activeTickerIndex={activeTickerIndex}
                    variant={lane.id === 'lane-top-stories' ? 'compact' : 'default'}
                    onTickerComplete={advanceToNextCard}
                  />
                </Box>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, idx) => (
                <Box key={`skel-${idx}`} sx={{ width: lane.id === 'lane-livestreams' ? { xs: 320, md: 480 } : lane.id === 'lane-top-stories' ? { xs: 260, md: 300 } : { xs: 280, md: 360 }, flexShrink: 0, pt: 1 }}>
                  <Skeleton variant="rectangular" width="100%" height={380} sx={{ borderRadius: '24px', bgcolor: 'rgba(0,0,0,0.03)' }} />
                </Box>
              ))
            )}

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
                View All {lane.totalCount ? `(${lane.totalCount})` : ''}
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
