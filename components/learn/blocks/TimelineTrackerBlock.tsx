'use client';

import React, { useState } from 'react';
import { Box, Typography, alpha, Chip, Tooltip, Paper } from '@mui/material';
import {
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  FlagOutlined as FlagIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  ErrorOutlined as AlertIcon,
} from '@mui/icons-material';

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (milestones.length === 0) return null;

  const getStatusMeta = (statusStr?: string) => {
    if (!statusStr) return null;
    const lower = statusStr.toLowerCase();
    if (lower.includes('complete') || lower.includes('done') || lower.includes('success')) {
      return { color: '#10b981', bg: alpha('#10b981', 0.12), icon: <CheckIcon sx={{ fontSize: 13 }} /> };
    }
    if (lower.includes('fail') || lower.includes('crisis') || lower.includes('bottleneck') || lower.includes('risk')) {
      return { color: '#ef4444', bg: alpha('#ef4444', 0.12), icon: <AlertIcon sx={{ fontSize: 13 }} /> };
    }
    if (lower.includes('target') || lower.includes('horizon') || lower.includes('future') || lower.includes('goal')) {
      return { color: '#8b5cf6', bg: alpha('#8b5cf6', 0.12), icon: <FlagIcon sx={{ fontSize: 13 }} /> };
    }
    return { color: accentColor, bg: alpha(accentColor, 0.12), icon: <TrendingUpIcon sx={{ fontSize: 13 }} /> };
  };

  return (
    <Box sx={{
      my: 6,
      p: { xs: 3, sm: 4, md: 5 },
      borderRadius: '28px',
      position: 'relative',
      background: isDark
        ? `linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%)`
        : `linear-gradient(135deg, #ffffff 0%, ${alpha(accentColor, 0.025)} 100%)`,
      backdropFilter: 'blur(16px)',
      border: '1.5px solid',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : alpha(accentColor, 0.18),
      boxShadow: isDark
        ? '0 20px 48px rgba(0, 0, 0, 0.35)'
        : `0 20px 48px ${alpha(accentColor, 0.06)}, 0 4px 12px rgba(0,0,0,0.02)`,
      overflow: 'hidden',
    }}>
      {/* Subtle Ambient Background Watermark Glow */}
      <Box sx={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 220,
        height: 220,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(accentColor, 0.15)} 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── HEADER CONTAINER ── */}
      <Box sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mb: 4.5,
        position: 'relative',
        zIndex: 1,
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : alpha(accentColor, 0.12),
        pb: 2.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box sx={{
            width: 42,
            height: 42,
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${accentColor} 0%, ${alpha(accentColor, 0.8)} 100%)`,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 6px 18px ${alpha(accentColor, 0.35)}`,
            flexShrink: 0,
          }}>
            <TimelineIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{
              color: isDark ? '#ffffff' : '#0f172a',
              fontWeight: 900,
              fontSize: { xs: '1.05rem', md: '1.2rem' },
              letterSpacing: '-0.01em',
              fontFamily: 'var(--font-quicksand), Quicksand, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              Chronological Timeline & Roadmap
            </Typography>
            <Typography sx={{
              fontSize: '0.78rem',
              color: isDark ? '#94a3b8' : '#64748b',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              Strategic Trajectory & Milestone Sequence
            </Typography>
          </Box>
        </Box>

        {/* Milestone Count Pill */}
        <Chip
          label={`${milestones.length} Strategic ${milestones.length === 1 ? 'Phase' : 'Phases'}`}
          size="small"
          sx={{
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : alpha(accentColor, 0.08),
            color: accentColor,
            fontWeight: 800,
            fontSize: '0.75rem',
            borderRadius: '10px',
            border: '1px solid',
            borderColor: alpha(accentColor, 0.2),
            px: 0.5,
          }}
        />
      </Box>

      {/* ── CHRONOLOGICAL SPINE & MILESTONES ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {milestones.map((m, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === milestones.length - 1;
          const isHovered = hoveredIdx === idx;
          const statusMeta = getStatusMeta(m.status);
          const indexFormatted = String(idx + 1).padStart(2, '0');

          return (
            <Box
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              sx={{
                display: 'flex',
                gap: { xs: 2, sm: 3 },
                position: 'relative',
              }}
            >
              {/* ── 100% MATHEMATICALLY CENTERED TIMELINE SPINE ── */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: { xs: 36, sm: 44 },
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {/* Top Connector Segment (Invisible on first node) */}
                <Box
                  sx={{
                    width: 3.5,
                    height: 24,
                    background: isFirst
                      ? 'transparent'
                      : `linear-gradient(180deg, ${alpha(accentColor, 0.2)} 0%, ${alpha(accentColor, 0.5)} 100%)`,
                    borderRadius: isFirst ? 0 : '3px 3px 0 0',
                    transition: 'background 0.3s ease',
                  }}
                />

                {/* Interactive Milestone Node */}
                <Tooltip title={`Milestone ${idx + 1}: ${m.dateOrYear}`} arrow placement="left">
                  <Box
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      borderRadius: '50%',
                      background: isHovered
                        ? `linear-gradient(135deg, ${accentColor} 0%, ${alpha(accentColor, 0.8)} 100%)`
                        : isDark
                        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        : '#ffffff',
                      border: '3.5px solid',
                      borderColor: isHovered ? '#ffffff' : accentColor,
                      boxShadow: isHovered
                        ? `0 0 0 4px ${alpha(accentColor, 0.3)}, 0 6px 18px ${alpha(accentColor, 0.45)}`
                        : `0 0 0 3px ${alpha(accentColor, 0.15)}, 0 4px 10px rgba(0,0,0,0.06)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        color: isHovered ? '#ffffff' : accentColor,
                        fontFamily: 'var(--font-quicksand), Quicksand, sans-serif',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {indexFormatted}
                    </Typography>
                  </Box>
                </Tooltip>

                {/* Bottom Connector Segment (Stretches to card height) */}
                <Box
                  sx={{
                    width: 3.5,
                    flex: 1,
                    minHeight: 28,
                    background: isLast
                      ? 'transparent'
                      : isHovered
                      ? `linear-gradient(180deg, ${accentColor} 0%, ${alpha(accentColor, 0.4)} 100%)`
                      : `linear-gradient(180deg, ${alpha(accentColor, 0.5)} 0%, ${alpha(accentColor, 0.2)} 100%)`,
                    borderRadius: isLast ? 0 : '0 0 3px 3px',
                    transition: 'all 0.3s ease',
                  }}
                />
              </Box>

              {/* ── MILESTONE GLASS CARD ── */}
              <Box
                sx={{
                  flex: 1,
                  pb: isLast ? 0 : 3.5,
                  minWidth: 0,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: '22px',
                    position: 'relative',
                    bgcolor: isDark
                      ? isHovered
                        ? 'rgba(30, 41, 59, 0.85)'
                        : 'rgba(15, 23, 42, 0.65)'
                      : isHovered
                      ? '#ffffff'
                      : 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid',
                    borderColor: isHovered
                      ? accentColor
                      : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : alpha(accentColor, 0.16),
                    boxShadow: isHovered
                      ? `0 16px 36px ${alpha(accentColor, 0.14)}, 0 4px 12px rgba(0,0,0,0.04)`
                      : isDark
                      ? '0 8px 24px rgba(0, 0, 0, 0.22)'
                      : `0 6px 20px ${alpha(accentColor, 0.04)}`,
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transform: isHovered ? 'translateY(-2px) translateX(3px)' : 'none',
                    overflow: 'hidden',
                  }}
                >
                  {/* Left Accent Stripe */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: isHovered ? 5 : 0,
                      bgcolor: accentColor,
                      transition: 'width 0.25s ease',
                    }}
                  />

                  {/* Header Row: Temporal Pill + Status Badge */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.25,
                    mb: 1.25,
                  }}>
                    {/* Date / Horizon Pill */}
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '10px',
                      bgcolor: alpha(accentColor, isDark ? 0.2 : 0.08),
                      border: '1px solid',
                      borderColor: alpha(accentColor, 0.25),
                    }}>
                      <CalendarIcon sx={{ fontSize: 14, color: accentColor }} />
                      <Typography sx={{
                        fontWeight: 900,
                        color: accentColor,
                        fontSize: '0.82rem',
                        letterSpacing: '0.04em',
                        fontFamily: 'var(--font-quicksand), Quicksand, sans-serif',
                        textTransform: 'uppercase',
                      }}>
                        {m.dateOrYear || `Phase ${idx + 1}`}
                      </Typography>
                    </Box>

                    {/* Status Pill */}
                    {statusMeta && m.status && (
                      <Chip
                        icon={statusMeta.icon}
                        label={m.status}
                        size="small"
                        sx={{
                          bgcolor: statusMeta.bg,
                          color: statusMeta.color,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: alpha(statusMeta.color, 0.25),
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                    )}
                  </Box>

                  {/* Milestone Title */}
                  <Typography
                    sx={{
                      fontWeight: 850,
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: { xs: '1.05rem', sm: '1.15rem' },
                      lineHeight: 1.35,
                      letterSpacing: '-0.01em',
                      mb: m.description ? 1 : 0,
                    }}
                  >
                    {m.title}
                  </Typography>

                  {/* Milestone Description */}
                  {m.description && (
                    <Typography
                      sx={{
                        color: isDark ? 'rgba(255, 255, 255, 0.85)' : '#475569',
                        fontSize: '0.92rem',
                        lineHeight: 1.68,
                        whiteSpace: 'pre-line',
                        fontWeight: 450,
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
