'use client';

import React, { useState } from 'react';
import { Box, Typography, alpha, Button, Chip, Avatar } from '@mui/material';
import {
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
        ctaLink: content.ctaLink || (content.embedType === 'deal' || content.embedType === 'cooperative' ? '/trade' : '/innovations/careers'),
        embedType: content.embedType || 'job'
      }]
    : [];

  if (attachedJobs.length === 0) return null;

  return (
    <>
      <Box sx={{ my: 6, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {attachedJobs.map((job, idx) => {
          const rawType = String(job.embedType || '').toLowerCase();
          const isDeal = rawType === 'deal' || rawType === 'spv' || rawType === 'syndicate' || rawType.includes('deal');
          const isCoop = rawType === 'cooperative' || rawType === 'coop' || rawType.includes('coop');
          const type: 'deal' | 'job' | 'cooperative' = isDeal ? 'deal' : isCoop ? 'cooperative' : 'job';

          const typeConfig = {
            deal: {
              label: 'Deal Room · Syndicate Allocation',
              badgeColor: '#10b981',
              accentColor: '#f59e0b',
              accentGradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
              icon: <DealIcon sx={{ fontSize: 16 }} />,
              metaPrefix: '📈 IRR / Target:',
              defaultCta: 'Access Deal Room'
            },
            job: {
              label: 'Talent Guild · Paid Role',
              badgeColor: '#6366f1',
              accentColor: '#8b5cf6',
              accentGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              icon: <WorkIcon sx={{ fontSize: 16 }} />,
              metaPrefix: '💰 Compensation:',
              defaultCta: 'Explore Opportunity'
            },
            cooperative: {
              label: 'Verified Cooperative · Active Network',
              badgeColor: '#f59e0b',
              accentColor: '#d97706',
              accentGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              icon: <CoopIcon sx={{ fontSize: 16 }} />,
              metaPrefix: '🤝 Capital Commitment:',
              defaultCta: 'Join Cooperative'
            },
          }[type];

          return (
            <Box
              key={job.jobId || idx}
              sx={{
                p: { xs: 3, md: 3.5 },
                borderRadius: '26px',
                position: 'relative',
                overflow: 'hidden',
                background: isDark
                  ? `linear-gradient(135deg, rgba(30, 41, 59, 0.65) 0%, rgba(15, 23, 42, 0.75) 100%)`
                  : `linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.75) 100%)`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid',
                borderColor: isDark 
                  ? (isDeal ? 'rgba(16, 185, 129, 0.25)' : isCoop ? 'rgba(245, 158, 11, 0.25)' : 'rgba(99, 102, 241, 0.25)')
                  : (isDeal ? 'rgba(16, 185, 129, 0.3)' : isCoop ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.25)'),
                boxShadow: isDark
                  ? 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 20px 48px rgba(0, 0, 0, 0.45)'
                  : `inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 20px 44px ${alpha(typeConfig.badgeColor, 0.09)}, 0 2px 8px rgba(0,0,0,0.02)`,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 3,
                transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': {
                  borderColor: isDeal ? '#10b981' : typeConfig.badgeColor,
                  boxShadow: isDark
                    ? `inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 24px 54px rgba(0, 0, 0, 0.6)`
                    : `inset 0 1px 0 rgba(255, 255, 255, 1), 0 24px 52px ${alpha(typeConfig.badgeColor, 0.18)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {/* Left Details */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    icon={typeConfig.icon}
                    label={typeConfig.label}
                    size="small"
                    sx={{
                      bgcolor: isDeal 
                        ? (isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.1)') 
                        : alpha(typeConfig.badgeColor, isDark ? 0.2 : 0.1),
                      color: typeConfig.badgeColor,
                      fontWeight: 900,
                      fontSize: '0.74rem',
                      letterSpacing: '0.03em',
                      borderRadius: '9999px',
                      border: '1px solid',
                      borderColor: isDeal 
                        ? 'rgba(245, 158, 11, 0.45)' // Gold border for Deal Room SPV
                        : alpha(typeConfig.badgeColor, 0.3),
                      '& .MuiChip-icon': {
                        color: `${isDeal ? '#f59e0b' : typeConfig.badgeColor} !important`
                      }
                    }}
                  />
                  {job.location && (
                    <Typography sx={{ 
                      color: isDark ? '#94a3b8' : '#64748b', 
                      fontSize: '0.82rem', 
                      fontWeight: 650,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      📍 {job.location}
                    </Typography>
                  )}
                </Box>

                <Typography sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.2rem', md: '1.35rem' },
                  color: isDark ? '#ffffff' : '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3
                }}>
                  {job.title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  {job.organization && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {job.organizationLogo ? (
                        <Avatar src={job.organizationLogo} alt={job.organization} sx={{ width: 22, height: 22 }} />
                      ) : (
                        <Avatar sx={{ 
                          width: 22, height: 22, 
                          fontSize: '0.68rem', fontWeight: 800, 
                          bgcolor: alpha(typeConfig.badgeColor, isDark ? 0.25 : 0.12), 
                          color: typeConfig.badgeColor 
                        }}>
                          {job.organization.charAt(0)}
                        </Avatar>
                      )}
                      <Typography sx={{ 
                        fontWeight: 750, 
                        color: isDark ? '#cbd5e1' : '#475569', 
                        fontSize: '0.9rem',
                      }}>
                        {job.organization}
                      </Typography>
                    </Box>
                  )}
                  {job.compensationOrTarget && (
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 0.4,
                      borderRadius: '10px',
                      bgcolor: isDeal
                        ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)')
                        : alpha(typeConfig.badgeColor, isDark ? 0.15 : 0.08),
                      border: '1px solid',
                      borderColor: isDeal
                        ? (isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.3)') // Gold-accented metric pill for deals
                        : alpha(typeConfig.badgeColor, isDark ? 0.35 : 0.25),
                    }}>
                      <Typography sx={{
                        fontWeight: 900,
                        color: isDeal ? '#10b981' : typeConfig.badgeColor,
                        fontSize: '0.88rem',
                        letterSpacing: '-0.01em',
                        fontFamily: 'var(--font-quicksand), Quicksand, sans-serif'
                      }}>
                        {typeConfig.metaPrefix} {job.compensationOrTarget}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Right High-Contrast Pill CTA Button */}
              <Button
                variant="contained"
                onClick={() => setSelectedJob(job)}
                endIcon={<LaunchIcon sx={{ fontSize: '17px !important' }} />}
                sx={{
                  bgcolor: typeConfig.badgeColor,
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  borderRadius: '9999px',
                  px: 3.5,
                  py: 1.25,
                  flexShrink: 0,
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                  boxShadow: `0 8px 24px ${alpha(typeConfig.badgeColor, 0.35)}`,
                  '&:hover': {
                    bgcolor: alpha(typeConfig.badgeColor, 0.92),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 30px ${alpha(typeConfig.badgeColor, 0.45)}`
                  },
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                {job.ctaText || typeConfig.defaultCta}
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
