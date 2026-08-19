'use client';

import React, { useState, useRef } from 'react';
import { Box, Typography, alpha, Avatar, Chip, Paper, Button, Tooltip, IconButton, CircularProgress } from '@mui/material';
import {
  FormatQuote as QuoteIcon,
  LocationOn as LocationIcon,
  TrendingUp as TurnoverIcon,
  Shield as ShieldIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useExportCard } from '@/components/learn/social/useExportCard';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const { exportAsImage, isExporting } = useExportCard();
  const [copied, setCopied] = useState(false);

  if (!content.name && !content.fieldQuote) return null;

  const handleCopyQuote = () => {
    if (content.fieldQuote) {
      const textToCopy = `"${content.fieldQuote}" — ${content.name || 'Ground Operator'}${content.roleAndLocation ? ` (${content.roleAndLocation})` : ''} | FoodNerve Ground Dossier`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCard = () => {
    const slug = (content.name || 'operator').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    exportAsImage(cardRef.current, `foodnerve-dossier-${slug}.png`);
  };

  return (
    <Box sx={{ my: 6 }}>
      {/* ── MINIMAL TOP BAR ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 1.75,
        px: 1,
      }}>
        {/* Minimalist Micro-Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

        {/* Share & Export Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={copied ? 'Copied to Clipboard!' : 'Copy Citation'}>
            <Button
              size="small"
              variant="text"
              startIcon={copied ? <CheckIcon sx={{ fontSize: '15px !important' }} /> : <CopyIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleCopyQuote}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: copied ? '#10b981' : isDark ? '#94a3b8' : '#64748b',
                textTransform: 'none',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              {copied ? 'Copied' : 'Cite'}
            </Button>
          </Tooltip>

          <Button
            size="small"
            variant="outlined"
            startIcon={isExporting ? <CircularProgress size={13} sx={{ color: accentColor }} /> : <DownloadIcon sx={{ fontSize: '15px !important' }} />}
            onClick={handleDownloadCard}
            disabled={isExporting}
            sx={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: accentColor,
              borderColor: alpha(accentColor, 0.35),
              textTransform: 'none',
              borderRadius: '10px',
              px: 1.75,
              py: 0.5,
              '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.05) },
            }}
          >
            {isExporting ? 'Exporting...' : 'Share Card'}
          </Button>
        </Box>
      </Box>

      {/* ── THE SHAREABLE PROFILE CARD WITH PATTERNED BG ── */}
      <Box
        ref={cardRef}
        sx={{
          p: { xs: 3, sm: 4, md: 4.5 },
          borderRadius: '26px',
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
        {/* Card Header Micro-Bar */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : alpha(accentColor, 0.12),
          pb: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<ShieldIcon sx={{ fontSize: '13px !important', color: `${accentColor} !important` }} />}
              label="Verified Field Testimony"
              size="small"
              sx={{
                bgcolor: alpha(accentColor, isDark ? 0.22 : 0.1),
                color: accentColor,
                fontWeight: 800,
                fontSize: '0.72rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: alpha(accentColor, 0.25),
              }}
            />
          </Box>

          <Typography sx={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: isDark ? '#94a3b8' : '#64748b',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            FoodNerve Intelligence Report
          </Typography>
        </Box>

        {/* Card Content Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
          gap: { xs: 3, md: 4 },
          alignItems: 'start',
        }}>
          {/* ── LEFT: OPERATOR IDENTITY PROFILE ── */}
          <Box sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff',
            border: '1.5px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : alpha(accentColor, 0.16),
            boxShadow: isDark
              ? '0 10px 28px rgba(0, 0, 0, 0.3)'
              : `0 10px 28px ${alpha(accentColor, 0.06)}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1.5,
          }}>
            {/* Portrait with Glowing Concentric Rings */}
            <Box sx={{ position: 'relative', mb: 0.5 }}>
              <Avatar
                src={content.avatarUrl || ''}
                alt={content.name || 'Operator'}
                sx={{
                  width: { xs: 88, sm: 96 },
                  height: { xs: 88, sm: 96 },
                  bgcolor: alpha(accentColor, 0.15),
                  color: accentColor,
                  fontWeight: 900,
                  fontSize: '2rem',
                  border: '3.5px solid #ffffff',
                  boxShadow: `0 0 0 3px ${accentColor}, 0 8px 24px ${alpha(accentColor, 0.35)}`,
                }}
              >
                {content.name ? content.name.charAt(0).toUpperCase() : 'O'}
              </Avatar>
            </Box>

            {/* Operator Details */}
            <Box sx={{ width: '100%' }}>
              <Typography sx={{
                fontWeight: 900,
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '1.18rem',
                lineHeight: 1.25,
              }}>
                {content.name || 'Anonymous Operator'}
              </Typography>

              {content.roleAndLocation && (
                <Typography sx={{
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  mt: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}>
                  <LocationIcon sx={{ fontSize: 15, color: accentColor }} />
                  {content.roleAndLocation}
                  {content.age ? ` · ${content.age} yrs` : ''}
                </Typography>
              )}
            </Box>

            {/* Monthly Volume / Turnover Badge */}
            {content.monthlyTurnover && (
              <Box sx={{
                width: '100%',
                p: 1.5,
                mt: 0.5,
                borderRadius: '14px',
                bgcolor: alpha(accentColor, isDark ? 0.2 : 0.08),
                border: '1px solid',
                borderColor: alpha(accentColor, 0.25),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.25,
              }}>
                <Typography sx={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: isDark ? '#f472b6' : accentColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}>
                  <TurnoverIcon sx={{ fontSize: 13 }} /> Monthly Throughput
                </Typography>
                <Typography sx={{
                  fontWeight: 900,
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.96rem',
                  fontFamily: 'var(--font-quicksand), Quicksand, sans-serif',
                }}>
                  {content.monthlyTurnover}
                </Typography>
              </Box>
            )}
          </Box>

          {/* ── RIGHT: TESTIMONY & OPERATING REALITY ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            {/* Hero Field Quote Box */}
            {content.fieldQuote && (
              <Box
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: '20px',
                  position: 'relative',
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.75)' : '#ffffff',
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
                  mb: 1.25,
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
                  fontSize: { xs: '1.02rem', sm: '1.12rem' },
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
                p: { xs: 2.25, sm: 2.75 },
                borderRadius: '18px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : alpha(accentColor, 0.04),
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
                  color: isDark ? 'rgba(255, 255, 255, 0.85)' : '#334155',
                  fontSize: '0.92rem',
                  lineHeight: 1.68,
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
            Source: Primary Field Research & Trader Network
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
