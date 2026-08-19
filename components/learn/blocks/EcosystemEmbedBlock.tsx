import React from 'react';
import { Box, Typography, alpha, Button, Chip } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, Work as WorkIcon, MonetizationOn as DealIcon, Groups as CoopIcon } from '@mui/icons-material';

export interface EcosystemEmbedBlockProps {
  content: {
    embedType?: 'job' | 'deal' | 'cooperative';
    title?: string;
    organization?: string;
    location?: string;
    compensationOrTarget?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const EcosystemEmbedBlock: React.FC<EcosystemEmbedBlockProps> = ({
  content,
  themeMode = 'light',
  accentColor = '#6366f1'
}) => {
  const isDark = themeMode === 'dark';

  if (!content.title) return null;

  const typeConfig = {
    job: { label: 'Active Opportunity', icon: <WorkIcon sx={{ fontSize: 18 }} />, color: '#6366f1' },
    deal: { label: 'Deal Room Investment', icon: <DealIcon sx={{ fontSize: 18 }} />, color: '#10b981' },
    cooperative: { label: 'Verified Cooperative', icon: <CoopIcon sx={{ fontSize: 18 }} />, color: '#f59e0b' },
  }[content.embedType || 'job'];

  return (
    <Box sx={{
      my: 6,
      p: { xs: 3, md: 4 },
      borderRadius: '24px',
      background: isDark
        ? `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)`
        : `linear-gradient(135deg, #fff 0%, ${alpha(typeConfig.color, 0.04)} 100%)`,
      border: '2px solid',
      borderColor: alpha(typeConfig.color, 0.3),
      boxShadow: `0 16px 40px ${alpha(typeConfig.color, 0.08)}`,
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      gap: 3
    }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={typeConfig.icon}
            label={typeConfig.label}
            size="small"
            sx={{ bgcolor: alpha(typeConfig.color, 0.15), color: typeConfig.color, fontWeight: 900, fontSize: '0.72rem' }}
          />
          {content.location && (
            <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
              📍 {content.location}
            </Typography>
          )}
        </Box>

        <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: isDark ? '#fff' : '#0f172a', letterSpacing: '-0.01em' }}>
          {content.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {content.organization && (
            <Typography sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', fontSize: '0.9rem' }}>
              {content.organization}
            </Typography>
          )}
          {content.compensationOrTarget && (
            <Typography sx={{ fontWeight: 800, color: typeConfig.color, fontSize: '0.9rem' }}>
              💰 {content.compensationOrTarget}
            </Typography>
          )}
        </Box>
      </Box>

      {content.ctaLink && (
        <Button
          variant="contained"
          href={content.ctaLink}
          target="_blank"
          endIcon={<ArrowForwardIcon />}
          sx={{
            bgcolor: typeConfig.color,
            color: '#fff',
            fontWeight: 800,
            borderRadius: '14px',
            px: 3.5,
            py: 1.25,
            flexShrink: 0,
            boxShadow: `0 6px 20px ${alpha(typeConfig.color, 0.35)}`,
            '&:hover': { bgcolor: alpha(typeConfig.color, 0.9), transform: 'translateY(-2px)' },
            transition: 'all 0.2s'
          }}
        >
          {content.ctaText || 'View Position'}
        </Button>
      )}
    </Box>
  );
};
