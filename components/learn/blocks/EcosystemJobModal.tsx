'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Chip,
  alpha,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  OpenInNew as OpenInNewIcon,
  Email as EmailIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Share as ShareIcon,
  Verified as VerifiedIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { getTradeListingById } from '@/lib/actions/trade';

export interface EcosystemJobModalProps {
  open: boolean;
  onClose: () => void;
  jobId?: string;
  initialJobData?: {
    title: string;
    organization?: string;
    organizationLogo?: string;
    location?: string;
    compensationOrTarget?: string;
    ctaText?: string;
    ctaLink?: string;
    embedType?: string;
  };
  accentColor?: string;
  themeMode?: 'light' | 'dark';
}

export const EcosystemJobModal: React.FC<EcosystemJobModalProps> = ({
  open,
  onClose,
  jobId,
  initialJobData,
  accentColor = '#6366f1',
  themeMode = 'light',
}) => {
  const isDark = themeMode === 'dark';
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (open && jobId && jobId !== 'single' && !jobId.startsWith('manual-')) {
      setLoading(true);
      getTradeListingById(jobId)
        .then((res) => {
          if (isMounted && res.success && res.listing) {
            setJobDetails(res.listing);
          }
        })
        .catch((err) => console.error('Failed to load listing details:', err))
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setJobDetails(null);
    }
    return () => {
      isMounted = false;
    };
  }, [open, jobId]);

  // Derived fields combining server data + initial fallbacks
  const title = jobDetails?.title || initialJobData?.title || 'Ecosystem Role';
  const organizationName = jobDetails?.organization?.name || jobDetails?.metadata?.externalEntityName || initialJobData?.organization || 'Ecosystem Enterprise';
  const organizationLogo = jobDetails?.organization?.logoUrl || jobDetails?.metadata?.externalEntityLogoUrl || initialJobData?.organizationLogo;
  const isVerified = jobDetails?.organization?.verified || (jobDetails?.organization?.rank && jobDetails.organization.rank > 1);
  const location = jobDetails?.location || initialJobData?.location || 'Pan-African';
  const workModel = jobDetails?.workModel || jobDetails?.metadata?.workModel;
  const description = jobDetails?.description || 'Active ecosystem role published through the FoodNerve talent network. Apply to connect directly with the hiring team.';
  const commodity = jobDetails?.commodity || jobDetails?.metadata?.sector;
  const jobFunction = jobDetails?.jobFunction || jobDetails?.metadata?.jobFunction;
  
  let compensation = initialJobData?.compensationOrTarget || jobDetails?.priceOrAsk;
  if (!compensation && jobDetails?.minSalary && jobDetails?.maxSalary) {
    compensation = `${jobDetails.currency || '₦'}${jobDetails.minSalary.toLocaleString()} - ${jobDetails.currency || '₦'}${jobDetails.maxSalary.toLocaleString()}`;
  }

  // Application Method Handling
  const appMethod = jobDetails?.applicationMethod || jobDetails?.metadata?.applicationMethod || 'native';
  const appEmail = jobDetails?.applicationEmail || jobDetails?.metadata?.applicationEmail;
  const appUrl = jobDetails?.applicationUrl || jobDetails?.metadata?.applicationUrl || initialJobData?.ctaLink;
  const appInstructions = jobDetails?.applicationInstructions || jobDetails?.metadata?.applicationInstructions;

  const handleApplyClick = () => {
    if (appMethod === 'external' && appUrl) {
      window.open(appUrl, '_blank', 'noopener,noreferrer');
    } else if (appMethod === 'email' && appEmail) {
      window.location.href = `mailto:${appEmail}?subject=Application for ${encodeURIComponent(title)} via FoodNerve`;
    } else {
      // Native route
      const targetUrl = jobId && !jobId.startsWith('manual-') ? `/careers/${jobId}?apply=true` : (appUrl || '/careers');
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyEmail = () => {
    if (appEmail) {
      navigator.clipboard.writeText(appEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1.5, sm: 3 },
        backdropFilter: 'blur(8px)',
      }}
    >
      <Paper
        elevation={12}
        sx={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          borderRadius: '28px',
          bgcolor: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#ffffff' : '#0f172a',
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : alpha(accentColor, 0.2),
          boxShadow: isDark
            ? '0 24px 64px rgba(0, 0, 0, 0.6)'
            : `0 24px 64px ${alpha(accentColor, 0.15)}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Sticky Header */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : alpha(accentColor, 0.03),
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 0 }}>
            <Avatar
              src={organizationLogo}
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                bgcolor: alpha(accentColor, 0.12),
                color: accentColor,
                fontWeight: 900,
                fontSize: '1.2rem',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: alpha(accentColor, 0.2),
              }}
            >
              {organizationName ? organizationName.charAt(0).toUpperCase() : 'O'}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#e2e8f0' : '#475569' }}>
                  {organizationName}
                </Typography>
                {isVerified && (
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: `${accentColor} !important` }} />}
                    label="Verified Partner"
                    size="small"
                    sx={{
                      bgcolor: alpha(accentColor, 0.1),
                      color: accentColor,
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 22,
                    }}
                  />
                )}
              </Box>

              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.15rem', sm: '1.35rem' }, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.25 }}>
                {title}
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" onClick={onClose} sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2.5, sm: 3.5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ color: accentColor }} />
            </Box>
          ) : (
            <>
              {/* Meta Highlights Badge Grid */}
              <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
                {location && (
                  <Chip
                    icon={<LocationIcon sx={{ fontSize: 16 }} />}
                    label={`${location} ${workModel ? `(${workModel})` : ''}`}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                      color: isDark ? '#cbd5e1' : '#334155',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    }}
                  />
                )}

                {compensation && (
                  <Chip
                    icon={<MoneyIcon sx={{ fontSize: 16, color: `${accentColor} !important` }} />}
                    label={compensation}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      bgcolor: alpha(accentColor, 0.12),
                      color: accentColor,
                      border: '1px solid',
                      borderColor: alpha(accentColor, 0.25),
                    }}
                  />
                )}

                {jobFunction && (
                  <Chip
                    label={`⚙️ ${jobFunction}`}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                      color: isDark ? '#cbd5e1' : '#475569',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    }}
                  />
                )}

                {commodity && (
                  <Chip
                    label={`🌾 ${commodity}`}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                      color: isDark ? '#cbd5e1' : '#475569',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    }}
                  />
                )}
              </Box>

              {/* Description & Context */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Role Overview & Responsibilities
                </Typography>
                <Typography
                  sx={{
                    color: isDark ? 'rgba(255, 255, 255, 0.88)' : '#334155',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {description}
                </Typography>
              </Box>

              {/* Specific Application Guidance for Email Application */}
              {appMethod === 'email' && appEmail && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: alpha(accentColor, 0.05),
                    border: '1px solid',
                    borderColor: alpha(accentColor, 0.2),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ color: accentColor, fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                      Direct Email Submission
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
                    Candidates for this position should submit their resume and portfolio directly to the hiring inbox below:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: isDark ? '#0f172a' : '#ffffff', p: 1.5, borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: accentColor, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {appEmail}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={copiedEmail ? <CheckIcon sx={{ fontSize: 16 }} /> : <CopyIcon sx={{ fontSize: 16 }} />}
                      onClick={handleCopyEmail}
                      sx={{ fontWeight: 800, textTransform: 'none', fontSize: '0.78rem' }}
                    >
                      {copiedEmail ? 'Copied!' : 'Copy'}
                    </Button>
                  </Box>
                  {appInstructions && (
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                      &ldquo;{appInstructions}&rdquo;
                    </Typography>
                  )}
                </Paper>
              )}
            </>
          )}
        </Box>

        {/* Sticky Footer Action Bar */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderTop: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexShrink: 0,
          }}
        >
          <Button
            variant="text"
            onClick={onClose}
            sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}
          >
            Close
          </Button>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {jobId && !jobId.startsWith('manual-') && (
              <Button
                variant="outlined"
                href={`/careers/${jobId}`}
                target="_blank"
                sx={{
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  borderColor: alpha(accentColor, 0.4),
                  color: accentColor,
                  '&:hover': { borderColor: accentColor, bgcolor: alpha(accentColor, 0.05) },
                }}
              >
                View Full Page
              </Button>
            )}

            <Button
              variant="contained"
              onClick={handleApplyClick}
              endIcon={appMethod === 'external' ? <OpenInNewIcon /> : appMethod === 'email' ? <EmailIcon /> : undefined}
              sx={{
                bgcolor: accentColor,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.9rem',
                borderRadius: '14px',
                px: 3.5,
                py: 1.1,
                textTransform: 'none',
                boxShadow: `0 8px 24px ${alpha(accentColor, 0.35)}`,
                '&:hover': { bgcolor: alpha(accentColor, 0.9), transform: 'translateY(-1px)' },
              }}
            >
              {appMethod === 'external'
                ? 'Apply on Company Site ↗'
                : appMethod === 'email'
                ? 'Open Email Draft ✉️'
                : 'Apply for Position ➔'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default EcosystemJobModal;
