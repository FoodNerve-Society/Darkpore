'use client';

import React from 'react';
import { Box, Typography, alpha, Paper } from '@mui/material';
import {
  FormatQuote as QuoteIcon,
  LocationOn as LocationIcon,
  TrendingUp as TurnoverIcon,
} from '@mui/icons-material';

export interface PersonaDossierBlockProps {
  content: {
    name?: string;
    roleAndLocation?: string;
    age?: string;
    monthlyTurnover?: string;
    bio?: string;
    fieldQuote?: string;
    avatarUrl?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const PersonaDossierBlock: React.FC<PersonaDossierBlockProps> = ({
  content,
  themeMode = 'light',
  accentColor = '#ec4899'
}) => {
  const isDark = themeMode === 'dark';

  if (!content.name && !content.fieldQuote) return null;

  return (
    <Box sx={{ my: 6 }}>
      {/* ── MINIMAL TOP MICRO-BAR (CLEAN & SUBTLE) ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 1.75,
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
          Ground Reality · Operator Dossier
        </Typography>
      </Box>

      {/* ── THE PROFILE DOSSIER CARD WITH PATTERNED BG ── */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3.5, md: 4 },
          borderRadius: '28px',
          position: 'relative',
          background: isDark
            ? `radial-gradient(circle at 90% 10%, ${alpha(accentColor, 0.18)} 0%, transparent 55%),
               radial-gradient(circle at 10% 90%, ${alpha(accentColor, 0.12)} 0%, transparent 50%),
               radial-gradient(${alpha('#ffffff', 0.04)} 1px, transparent 1px),
               linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`
            : `radial-gradient(circle at 90% 10%, ${alpha(accentColor, 0.12)} 0%, transparent 55%),
               radial-gradient(circle at 10% 90%, ${alpha(accentColor, 0.08)} 0%, transparent 50%),
               radial-gradient(${alpha(accentColor, 0.08)} 1.2px, transparent 1.2px),
               linear-gradient(135deg, #ffffff 0%, #fdf4f8 100%)`,
          backgroundSize: '100% 100%, 100% 100%, 20px 20px, 100% 100%',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : alpha(accentColor, 0.22),
          boxShadow: isDark
            ? '0 24px 54px rgba(0, 0, 0, 0.45)'
            : `0 24px 54px ${alpha(accentColor, 0.08)}, 0 4px 14px rgba(0,0,0,0.03)`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Card Content Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
          gap: { xs: 3, md: 3.5 },
          alignItems: 'stretch',
        }}>
          {/* ── LEFT: FULL-IMAGE OPERATOR PORTRAIT CARD ── */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '22px',
              overflow: 'hidden',
              position: 'relative',
              minHeight: { xs: 340, md: 380 },
              bgcolor: isDark ? '#1e293b' : alpha(accentColor, 0.08),
              border: '1.5px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : alpha(accentColor, 0.2),
              boxShadow: isDark
                ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                : `0 12px 32px ${alpha(accentColor, 0.12)}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            {/* Full-bleed Photo Background */}
            {content.avatarUrl ? (
              <Box
                component="img"
                src={content.avatarUrl}
                alt={content.name || 'Operator'}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  transition: 'transform 0.4s ease',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
              />
            ) : (
              /* High-End Placeholder Background when no image is uploaded */
              <Box sx={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, ${accentColor} 0%, ${alpha(accentColor, 0.7)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Typography sx={{
                  fontSize: '5rem',
                  fontWeight: 900,
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontFamily: 'var(--font-quicksand), Quicksand, sans-serif',
                }}>
                  {content.name ? content.name.charAt(0).toUpperCase() : 'O'}
                </Typography>
              </Box>
            )}

            {/* Dark Scrim Gradient Overlay for Perfect Contrast */}
            <Box sx={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 45%, rgba(15, 23, 42, 0.1) 75%, transparent 100%)`,
              pointerEvents: 'none',
            }} />

            {/* Operator Details Overlaid at Bottom */}
            <Box sx={{
              position: 'relative',
              zIndex: 2,
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}>
              <Box>
                <Typography sx={{
                  fontWeight: 900,
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  lineHeight: 1.2,
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                }}>
                  {content.name || 'Anonymous Operator'}
                </Typography>

                {content.roleAndLocation && (
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    mt: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  }}>
                    <LocationIcon sx={{ fontSize: 15, color: '#f472b6' }} />
                    {content.roleAndLocation}
                    {content.age ? ` · ${content.age} yrs` : ''}
                  </Typography>
                )}
              </Box>

              {/* Monthly Volume / Turnover Badge (Frosted Overlay) */}
              {content.monthlyTurnover && (
                <Box sx={{
                  p: 1.25,
                  borderRadius: '12px',
                  bgcolor: 'rgba(0, 0, 0, 0.55)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <TurnoverIcon sx={{ fontSize: 16, color: '#f472b6' }} />
                  <Box>
                    <Typography sx={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      color: 'rgba(255, 255, 255, 0.7)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      lineHeight: 1,
                    }}>
                      Monthly Volume
                    </Typography>
                    <Typography sx={{
                      fontWeight: 900,
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontFamily: 'var(--font-quicksand), Quicksand, sans-serif',
                      lineHeight: 1.2,
                      mt: 0.25,
                    }}>
                      {content.monthlyTurnover}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          {/* ── RIGHT: TESTIMONY & OPERATING REALITY ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, justifyContent: 'center' }}>
            {/* Hero Field Quote Box */}
            {content.fieldQuote && (
              <Box
                sx={{
                  p: { xs: 2.75, sm: 3.5 },
                  borderRadius: '22px',
                  position: 'relative',
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                  border: '1.5px solid',
                  borderColor: alpha(accentColor, isDark ? 0.25 : 0.3),
                  boxShadow: isDark
                    ? '0 10px 28px rgba(0, 0, 0, 0.3)'
                    : `0 10px 28px ${alpha(accentColor, 0.07)}`,
                  overflow: 'hidden',
                }}
              >
                {/* Decorative Quotation Mark Watermark */}
                <QuoteIcon sx={{
                  fontSize: 88,
                  color: alpha(accentColor, isDark ? 0.09 : 0.06),
                  position: 'absolute',
                  top: -10,
                  right: 8,
                  pointerEvents: 'none',
                  transform: 'rotate(180deg)',
                }} />

                <Typography sx={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: accentColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}>
                  <QuoteIcon sx={{ fontSize: 15, transform: 'rotate(180deg)' }} /> Primary Value Chain Voice
                </Typography>

                <Typography sx={{
                  fontStyle: 'italic',
                  color: isDark ? '#ffffff' : '#0f172a',
                  lineHeight: 1.75,
                  fontSize: { xs: '1.05rem', sm: '1.15rem' },
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                }}>
                  &ldquo;{content.fieldQuote}&rdquo;
                </Typography>
              </Box>
            )}

            {/* Operating Reality & Field Context */}
            {content.bio && (
              <Box sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '20px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.55)' : alpha(accentColor, 0.04),
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : alpha(accentColor, 0.15),
              }}>
                <Typography sx={{
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 0.75,
                }}>
                  Operating Reality & Context
                </Typography>
                <Typography sx={{
                  color: isDark ? 'rgba(255, 255, 255, 0.88)' : '#334155',
                  fontSize: '0.94rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  fontWeight: 450,
                }}>
                  {content.bio}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Subtle Card Footer Watermark */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px dashed',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : alpha(accentColor, 0.15),
          pt: 1.5,
        }}>
          <Typography sx={{ fontSize: '0.7rem', color: isDark ? '#64748b' : '#94a3b8', fontWeight: 600 }}>
            Source: Primary Field Research & Ground Network
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: accentColor, fontWeight: 800, letterSpacing: '0.04em' }}>
            FOODNERVE ECOSYSTEM
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PersonaDossierBlock;
