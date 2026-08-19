'use client';

import React from 'react';
import { Box, Typography, alpha, Chip, Paper } from '@mui/material';

export interface TimelineTrackerBlockProps {
  content: {
    milestones?: Array<{
      dateOrYear: string;
      title: string;
      description?: string;
      status?: string;
    }>;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const TimelineTrackerBlock: React.FC<TimelineTrackerBlockProps> = ({
  content,
  themeMode = 'light',
  accentColor = '#3b82f6'
}) => {
  const isDark = themeMode === 'dark';
  const milestones = content.milestones || [];

  if (milestones.length === 0) return null;

  return (
    <Box sx={{ my: 6 }}>
      {/* ── MINIMAL TOP LABEL ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2.5,
        px: 1,
      }}>
        <Box sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: accentColor,
          boxShadow: `0 0 8px ${accentColor}`,
        }} />
        <Typography sx={{
          fontSize: '0.78rem',
          fontWeight: 800,
          color: isDark ? '#e2e8f0' : '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-quicksand), Quicksand, sans-serif',
        }}>
          Timeline & Roadmap
        </Typography>
      </Box>

      {/* ── CLEAN CONTAINER & CHRONOLOGICAL SPINE ── */}
      <Box sx={{
        p: { xs: 2.5, sm: 3.5, md: 4 },
        borderRadius: '26px',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : alpha(accentColor, 0.02),
        border: '1.5px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : alpha(accentColor, 0.16),
        boxShadow: isDark
          ? '0 16px 40px rgba(0, 0, 0, 0.3)'
          : `0 16px 40px ${alpha(accentColor, 0.04)}`,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {milestones.map((m, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === milestones.length - 1;

          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                gap: { xs: 2, sm: 2.5 },
                position: 'relative',
              }}
            >
              {/* ── 100% MATHEMATICALLY CENTERED SPINE ── */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 24,
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {/* Top Connector Line (invisible on first node) */}
                <Box
                  sx={{
                    width: 2,
                    height: 18,
                    bgcolor: isFirst ? 'transparent' : alpha(accentColor, 0.3),
                  }}
                />

                {/* Minimalist Solid Node Dot */}
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: accentColor,
                    border: '3px solid',
                    borderColor: isDark ? '#0f172a' : '#ffffff',
                    boxShadow: `0 0 0 2px ${alpha(accentColor, 0.25)}`,
                    flexShrink: 0,
                    zIndex: 2,
                  }}
                />

                {/* Bottom Connector Line (invisible on last node, stretches to content height) */}
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 24,
                    bgcolor: isLast ? 'transparent' : alpha(accentColor, 0.3),
                  }}
                />
              </Box>

              {/* ── MILESTONE CONTENT CARD ── */}
              <Box
                sx={{
                  flex: 1,
                  pb: isLast ? 0 : 3,
                  minWidth: 0,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: '18px',
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.75)' : '#ffffff',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : alpha(accentColor, 0.15),
                    boxShadow: isDark
                      ? '0 6px 20px rgba(0, 0, 0, 0.2)'
                      : `0 6px 20px ${alpha(accentColor, 0.04)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: accentColor,
                      transform: 'translateX(3px)',
                    },
                  }}
                >
                  {/* Top Row: Date/Year & Optional Status */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    mb: 0.75,
                  }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: accentColor,
                        fontSize: '0.85rem',
                        letterSpacing: '0.04em',
                        fontFamily: 'var(--font-quicksand), Quicksand, sans-serif',
                        textTransform: 'uppercase',
                      }}
                    >
                      {m.dateOrYear || `Phase ${idx + 1}`}
                    </Typography>

                    {m.status && (
                      <Chip
                        label={m.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(accentColor, isDark ? 0.2 : 0.08),
                          color: accentColor,
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          height: 22,
                          borderRadius: '6px',
                        }}
                      />
                    )}
                  </Box>

                  {/* Milestone Title */}
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: { xs: '0.98rem', sm: '1.05rem' },
                      lineHeight: 1.35,
                      mb: m.description ? 0.75 : 0,
                    }}
                  >
                    {m.title}
                  </Typography>

                  {/* Milestone Description */}
                  {m.description && (
                    <Typography
                      sx={{
                        color: isDark ? 'rgba(255, 255, 255, 0.82)' : '#475569',
                        fontSize: '0.88rem',
                        lineHeight: 1.65,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {m.description}
                    </Typography>
                  )}
                </Paper>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TimelineTrackerBlock;
