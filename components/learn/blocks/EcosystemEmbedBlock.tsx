'use client';

import React, { useState } from 'react';
import { Box, Typography, alpha, Button, Chip, Avatar } from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Work as WorkIcon,
  MonetizationOn as DealIcon,
  Groups as CoopIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import EcosystemJobModal from './EcosystemJobModal';

export interface AttachedJobItem {
  jobId?: string;
  title: string;
  organization?: string;
  organizationLogo?: string;
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
    organizationLogo?: string;
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
  const [selectedJob, setSelectedJob] = useState<AttachedJobItem | null>(null);

  // Normalize to an array of jobs (supports multiple attached jobs or single fallback)
  const attachedJobs: AttachedJobItem[] = (content.jobs && content.jobs.length > 0)
    ? content.jobs
    : content.title
    ? [{
        jobId: content.jobId || 'single',
        title: content.title,
        organization: content.organization,
        organizationLogo: content.organizationLogo,
        location: content.location,
        compensationOrTarget: content.compensationOrTarget,
        ctaText: content.ctaText,
        ctaLink: content.ctaLink,
        embedType: content.embedType || 'job'
      }]
    : [];

  if (attachedJobs.length === 0) return null;

  return (
    <>
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
                borderRadius: '26px',
                position: 'relative',
                background: isDark
                  ? `linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.8) 100%)`
                  : `linear-gradient(135deg, #ffffff 0%, ${alpha(typeConfig.color, 0.035)} 100%)`,
                backdropFilter: 'blur(16px)',
                border: '1.5px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : alpha(typeConfig.color, 0.22),
                boxShadow: isDark
                  ? '0 16px 40px rgba(0, 0, 0, 0.35)'
                  : `0 16px 40px ${alpha(typeConfig.color, 0.08)}, 0 2px 8px rgba(0,0,0,0.02)`,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 3,
                transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': {
                  borderColor: typeConfig.color,
                  boxShadow: isDark
                    ? `0 20px 48px rgba(0, 0, 0, 0.5)`
                    : `0 20px 48px ${alpha(typeConfig.color, 0.16)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {/* Left Details */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    icon={typeConfig.icon}
                    label={typeConfig.label}
                    size="small"
                    sx={{
                      bgcolor: alpha(typeConfig.color, isDark ? 0.22 : 0.12),
                      color: typeConfig.color,
                      fontWeight: 900,
                      fontSize: '0.72rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: alpha(typeConfig.color, 0.25),
                    }}
                  />
                  {job.location && (
                    <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                      📍 {job.location}
                    </Typography>
                  )}
                </Box>

                <Typography sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.15rem', md: '1.3rem' },
                  color: isDark ? '#ffffff' : '#0f172a',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3
                }}>
                  {job.title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  {job.organization && (
                    <Typography sx={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', fontSize: '0.9rem' }}>
                      🏢 {job.organization}
                    </Typography>
                  )}
                  {job.compensationOrTarget && (
                    <Typography sx={{
                      fontWeight: 850,
                      color: typeConfig.color,
                      fontSize: '0.92rem',
                      fontFamily: 'var(--font-quicksand), Quicksand, sans-serif'
                    }}>
                      💰 {job.compensationOrTarget}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Right CTA Button (Opens Modal) */}
              <Button
                variant="contained"
                onClick={() => setSelectedJob(job)}
                endIcon={<LaunchIcon sx={{ fontSize: '18px !important' }} />}
                sx={{
                  bgcolor: typeConfig.color,
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  borderRadius: '14px',
                  px: 3.5,
                  py: 1.2,
                  flexShrink: 0,
                  textTransform: 'none',
                  boxShadow: `0 8px 24px ${alpha(typeConfig.color, 0.32)}`,
                  '&:hover': {
                    bgcolor: alpha(typeConfig.color, 0.9),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 10px 28px ${alpha(typeConfig.color, 0.42)}`
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {job.ctaText || 'Explore Role'}
              </Button>
            </Box>
          );
        })}
      </Box>

      {/* Interactive Job Modal */}
      {selectedJob && (
        <EcosystemJobModal
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          jobId={selectedJob.jobId}
          initialJobData={selectedJob}
          accentColor={accentColor}
          themeMode={themeMode}
        />
      )}
    </>
  );
};

export default EcosystemEmbedBlock;
