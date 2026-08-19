import React from 'react';
import { Box, Typography, alpha, Button, Chip } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, Work as WorkIcon, MonetizationOn as DealIcon, Groups as CoopIcon } from '@mui/icons-material';

export interface AttachedJobItem {
  jobId?: string;
  title: string;
  organization?: string;
  location?: string;
  compensationOrTarget?: string;
  ctaText?: string;
  ctaLink?: string;
  embedType?: 'job' | 'deal' | 'cooperative';
}

export interface EcosystemEmbedBlockProps {
  content: {
    embedType?: 'job' | 'deal' | 'cooperative';
    title?: string;
    organization?: string;
    location?: string;
    compensationOrTarget?: string;
    ctaText?: string;
    ctaLink?: string;
    jobId?: string;
    jobs?: AttachedJobItem[];
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

  // Normalize to an array of jobs (supports multiple attached jobs or single fallback)
  const attachedJobs: AttachedJobItem[] = (content.jobs && content.jobs.length > 0)
    ? content.jobs
    : content.title
    ? [{
        jobId: content.jobId || 'single',
        title: content.title,
        organization: content.organization,
        location: content.location,
        compensationOrTarget: content.compensationOrTarget,
        ctaText: content.ctaText,
        ctaLink: content.ctaLink,
        embedType: content.embedType || 'job'
      }]
    : [];

  if (attachedJobs.length === 0) return null;

  return (
    <Box sx={{ my: 6, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {attachedJobs.map((job, idx) => {
        const typeConfig = {
          job: { label: 'Active Opportunity', icon: <WorkIcon sx={{ fontSize: 18 }} />, color: '#6366f1' },
          deal: { label: 'Deal Room Investment', icon: <DealIcon sx={{ fontSize: 18 }} />, color: '#10b981' },
          cooperative: { label: 'Verified Cooperative', icon: <CoopIcon sx={{ fontSize: 18 }} />, color: '#f59e0b' },
        }[job.embedType || 'job'];

        return (
          <Box
            key={job.jobId || idx}
            sx={{
              p: { xs: 3, md: 3.5 },
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
              gap: 3,
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: typeConfig.color,
                boxShadow: `0 20px 48px ${alpha(typeConfig.color, 0.15)}`,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  icon={typeConfig.icon}
                  label={typeConfig.label}
                  size="small"
                  sx={{ bgcolor: alpha(typeConfig.color, 0.15), color: typeConfig.color, fontWeight: 900, fontSize: '0.72rem' }}
                />
                {job.location && (
                  <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                    📍 {job.location}
                  </Typography>
                )}
              </Box>

              <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: isDark ? '#fff' : '#0f172a', letterSpacing: '-0.01em' }}>
                {job.title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {job.organization && (
                  <Typography sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', fontSize: '0.9rem' }}>
                    🏢 {job.organization}
                  </Typography>
                )}
                {job.compensationOrTarget && (
                  <Typography sx={{ fontWeight: 800, color: typeConfig.color, fontSize: '0.9rem' }}>
                    💰 {job.compensationOrTarget}
                  </Typography>
                )}
              </Box>
            </Box>

            {job.ctaLink && (
              <Button
                variant="contained"
                href={job.ctaLink}
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
                {job.ctaText || 'View Position'}
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default EcosystemEmbedBlock;
