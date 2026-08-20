'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Typography, alpha } from '@mui/material';
import { SubcategoryData } from '@/lib/cms/types';

interface SubcategorySquircleScrollerProps {
  challengeId: string;
  subcategories: SubcategoryData[];
  primaryColor?: string;
}

export default function SubcategorySquircleScroller({
  challengeId,
  subcategories,
  primaryColor = '#10b981',
}: SubcategorySquircleScrollerProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Duplicate items to ensure seamless infinite looping
  const duplicatedSubcategories = [...subcategories, ...subcategories];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationFrameId: number;
    const speed = 0.65; // Pixels per frame for smooth continuous reading

    const step = () => {
      if (el && !isHovered && !isUserInteracting) {
        el.scrollLeft += speed;
        // When we've scrolled half the full scrollWidth (the first set of 10 items), reset seamlessly
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft -= el.scrollWidth / 2;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, isUserInteracting]);

  const handleTouchOrScroll = () => {
    setIsUserInteracting(true);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 2500);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        py: 0.5,
        maskImage: {
          xs: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
          md: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
        },
        WebkitMaskImage: {
          xs: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
          md: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchOrScroll}
    >
      <Box
        ref={scrollRef}
        onScroll={handleTouchOrScroll}
        sx={{
          display: 'flex',
          gap: 1.25,
          overflowX: 'auto',
          scrollBehavior: isUserInteracting ? 'smooth' : 'auto',
          py: 0.5,
          px: 1,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        {duplicatedSubcategories.map((subcat, idx) => {
          const trackNumber = String((idx % subcategories.length) + 1).padStart(2, '0');
          const itemKey = `${subcat.id}-${idx}`;

          return (
            <Link
              key={itemKey}
              href={`/${challengeId}/${subcat.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{ textDecoration: 'none', flexShrink: 0 }}
            >
              <Box
                sx={{
                  width: { xs: 155, sm: 175 },
                  height: 64,
                  borderRadius: '16px', // Squircle radius
                  p: 1.25,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0, 0, 0, 0.07)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    bgcolor: '#ffffff',
                    transform: 'translateY(-2px) scale(1.02)',
                    borderColor: alpha(primaryColor, 0.35),
                    boxShadow: `0 8px 20px ${alpha(primaryColor, 0.15)}, 0 2px 6px rgba(0,0,0,0.04)`,
                  },
                }}
              >
                {/* Micro-Squircle Index Badge */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px', // Nested squircle
                    bgcolor: alpha(primaryColor, 0.09),
                    border: `1px solid ${alpha(primaryColor, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-dosis), sans-serif',
                      color: primaryColor,
                      lineHeight: 1,
                    }}
                  >
                    {trackNumber}
                  </Typography>
                </Box>

                {/* Subcategory Clean Short Name */}
                <Typography
                  sx={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#1e293b',
                    lineHeight: 1.25,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {subcat.shortName || subcat.title}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}
