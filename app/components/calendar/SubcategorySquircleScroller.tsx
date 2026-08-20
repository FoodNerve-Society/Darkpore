'use client';

import React from 'react';
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
  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        py: 0.5,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          width: 'max-content',
          py: 0.25,
          px: 0.25,
        }}
      >
        {subcategories.map((subcat, idx) => {
          const trackNumber = String(idx + 1).padStart(2, '0');

          return (
            <Link
              key={subcat.id}
              href={`/${challengeId}/${subcat.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{ textDecoration: 'none' }}
            >
              <Box
                sx={{
                  height: 34,
                  borderRadius: '10px', // Sleek squircle
                  pl: 0.6,
                  pr: 1.25,
                  bgcolor: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.8,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    bgcolor: alpha(primaryColor, 0.05),
                    borderColor: alpha(primaryColor, 0.4),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(primaryColor, 0.12)}`,
                    '& .track-num': {
                      bgcolor: primaryColor,
                      color: 'white',
                    },
                    '& .track-label': {
                      color: primaryColor,
                    },
                  },
                }}
              >
                {/* Track Number Squircle Badge */}
                <Box
                  className="track-num"
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '6px',
                    bgcolor: alpha(primaryColor, 0.1),
                    color: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-dosis), sans-serif',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {trackNumber}
                </Box>

                {/* Subcategory Clean Short Name */}
                <Typography
                  className="track-label"
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#334155',
                    lineHeight: 1,
                    transition: 'color 0.18s ease',
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
