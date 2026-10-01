'use client';

import React from 'react';
import { Box, Typography, Chip, Avatar, Button } from '@mui/material';
import { alpha } from '@mui/system';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { SlideWrapper, safeStringArray } from '../SlideComponents';

// ----------------------------------------------------------------------
// SINGLE CONSOLIDATED JOB SLIDE (DESKTOP 16:9)
// Clean layout: Job, Job Title, Key Details, Application Mode & Apply Link
// ----------------------------------------------------------------------
export function DesktopJobOpportunitySlide({ content }: { content: any }) {
  const jobTitle = content.jobTitle || content.title || 'Lead Operations Architect';
  const orgName = content.orgName || content.organization?.name || 'Corridor Infrastructure Network';
  const orgLogo = content.orgLogo || content.organization?.logoUrl;
  const salary = content.salary || content.compensation || '₦18M - ₦26M + Equity';
  const location = content.location || 'Kano / Northern Corridor (Hybrid)';
  const department = content.department || 'Infrastructure & Logistics';
  const applicationMode = content.applicationMode || 'Apply Live On Stage';

  // Construct full verified careers deep-link
  const rawId = content.id || content.jobId || content.sourceId;
  const jobId = rawId && !String(rawId).startsWith('manual-') ? String(rawId) : null;
  let applyUrl = content.applyUrl || content.applicationUrl || content.url || content.link || content.ctaLink;

  const isGenericCareers =
    !applyUrl ||
    applyUrl === 'foodnerve.org/careers' ||
    applyUrl === '/careers' ||
    applyUrl === 'https://foodnerve.org/careers' ||
    applyUrl === 'http://foodnerve.org/careers' ||
    applyUrl === 'https://foodnerve.org/careers/' ||
    applyUrl.endsWith('/careers') ||
    applyUrl.endsWith('/careers/');

  if (isGenericCareers) {
    applyUrl = jobId ? `https://foodnerve.org/careers/${jobId}` : 'https://foodnerve.org/careers';
  } else if (applyUrl.startsWith('/')) {
    applyUrl = `https://foodnerve.org${applyUrl}`;
  } else if (!applyUrl.startsWith('http://') && !applyUrl.startsWith('https://')) {
    applyUrl = `https://${applyUrl}`;
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(applyUrl)}&margin=1`;

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        {/* Top Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<WorkIcon sx={{ fontSize: '0.85rem !important' }} />}
              label="ECOSYSTEM HIRING"
              size="small"
              sx={{ bgcolor: alpha('#10b981', 0.15), color: '#059669', fontWeight: 900, fontSize: '0.78rem', borderRadius: '10px' }}
            />
            <Chip label="ACTIVE OPPORTUNITY" size="small" sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '0.72rem', borderRadius: '10px' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Avatar src={orgLogo} sx={{ width: 36, height: 36, bgcolor: '#0f172a', borderRadius: '10px' }}>
              <BusinessIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              {orgName}
            </Typography>
          </Box>
        </Box>

        {/* Center: Hero Job Title & Key Details */}
        <Box sx={{ my: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.4rem', md: '3.4rem' }, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', maxWidth: 900 }}>
            {jobTitle}
          </Typography>

          {/* Key Details Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon sx={{ color: '#059669', fontSize: 22 }} />
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#064e3b' }}>{salary}</Typography>
            </Box>

            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 1, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
              <LocationIcon sx={{ color: '#64748b', fontSize: 20 }} />
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{location}</Typography>
            </Box>

            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '12px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 1, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
              <WorkIcon sx={{ color: '#64748b', fontSize: 18 }} />
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{department}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Bottom: QR Code Scan Badge + Mode of Application & Full Apply Deep-Link */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3.5, mt: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.25,
              pr: 2.25,
              borderRadius: '14px',
              bgcolor: '#ffffff',
              border: '1.5px solid rgba(226, 232, 240, 0.95)',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
            }}
          >
            <Box
              component="img"
              src={qrCodeUrl}
              alt="Scan to apply"
              sx={{ width: 72, height: 72, borderRadius: '8px', display: 'block' }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Scan To Apply Live
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                Point Phone Camera
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              component="a"
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1rem',
                py: 1.25,
                px: 3.5,
                borderRadius: '12px',
                boxShadow: 'none',
                textDecoration: 'none',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              {applicationMode}
            </Button>

            <Box
              component="a"
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2,
                py: 0.6,
                borderRadius: '10px',
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                color: '#059669',
                fontWeight: 800,
                fontSize: '0.85rem',
                textDecoration: 'none',
                wordBreak: 'break-all',
                maxWidth: 440,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(16, 185, 129, 0.18)',
                  borderColor: '#10b981',
                  textDecoration: 'underline',
                },
              }}
            >
              <LinkIcon sx={{ fontSize: 16, flexShrink: 0 }} />
              <span>{applyUrl}</span>
            </Box>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// SINGLE CONSOLIDATED JOB SLIDE (MOBILE 9:16)
// Stacked vertically taking full commanding advantage of the tall canvas
// ----------------------------------------------------------------------
export function MobileJobOpportunitySlide({ content }: { content: any }) {
  const jobTitle = content.jobTitle || content.title || 'Lead Operations Architect';
  const orgName = content.orgName || content.organization?.name || 'Corridor Infrastructure Network';
  const orgLogo = content.orgLogo || content.organization?.logoUrl;
  const salary = content.salary || content.compensation || '₦18M - ₦26M + Equity';
  const location = content.location || 'Kano / Hybrid Hub';
  const department = content.department || 'Operations';
  const applicationMode = content.applicationMode || 'Apply Live On Stage';

  // Construct full verified careers deep-link
  const rawId = content.id || content.jobId || content.sourceId;
  const jobId = rawId && !String(rawId).startsWith('manual-') ? String(rawId) : null;
  let applyUrl = content.applyUrl || content.applicationUrl || content.url || content.link || content.ctaLink;

  const isGenericCareers =
    !applyUrl ||
    applyUrl === 'foodnerve.org/careers' ||
    applyUrl === '/careers' ||
    applyUrl === 'https://foodnerve.org/careers' ||
    applyUrl === 'http://foodnerve.org/careers' ||
    applyUrl === 'https://foodnerve.org/careers/' ||
    applyUrl.endsWith('/careers') ||
    applyUrl.endsWith('/careers/');

  if (isGenericCareers) {
    applyUrl = jobId ? `https://foodnerve.org/careers/${jobId}` : 'https://foodnerve.org/careers';
  } else if (applyUrl.startsWith('/')) {
    applyUrl = `https://foodnerve.org${applyUrl}`;
  } else if (!applyUrl.startsWith('http://') && !applyUrl.startsWith('https://')) {
    applyUrl = `https://${applyUrl}`;
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(applyUrl)}&margin=1`;

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        {/* Top Header - Vertically Stacked with Bold Breathing Space */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Chip
              icon={<WorkIcon sx={{ fontSize: '0.82rem !important' }} />}
              label="ECOSYSTEM HIRING"
              size="small"
              sx={{ bgcolor: alpha('#10b981', 0.15), color: '#059669', fontWeight: 900, fontSize: '0.72rem', borderRadius: '10px' }}
            />
            <Chip
              label="ACTIVE OPPORTUNITY"
              size="small"
              sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '0.68rem', borderRadius: '10px' }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <Avatar src={orgLogo} sx={{ width: 52, height: 52, bgcolor: '#0f172a', borderRadius: '12px' }}>
              <BusinessIcon sx={{ fontSize: 26 }} />
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.2 }}>
                {orgName}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', mt: 0.25 }}>
                Verified Partner
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.75rem', sm: '2.1rem' }, color: '#0f172a', lineHeight: 1.18, letterSpacing: '-0.025em', mt: 1 }}>
            {jobTitle}
          </Typography>
        </Box>

        {/* Center: Key Details & QR Code - Spread evenly across the tall canvas */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, my: 'auto', py: 0.5 }}>
          <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verified Compensation
            </Typography>
            <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, color: '#064e3b', lineHeight: 1.2 }}>
              {salary}
            </Typography>
          </Box>

          <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.35, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Location & Track
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
              {location} · {department}
            </Typography>
          </Box>

          {/* QR Code Scan on Phone to Apply */}
          <Box
            sx={{
              alignSelf: 'center',
              p: 1.25,
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1.5px solid rgba(226, 232, 240, 0.95)',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.25,
            }}
          >
            <Box
              component="img"
              src={qrCodeUrl}
              alt="Scan to apply"
              sx={{ width: 102, height: 102, borderRadius: '8px', display: 'block' }}
            />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Scan on phone to apply
            </Typography>
          </Box>
        </Box>

        {/* Bottom: Mode of Application & Clickable Full Apply Deep-Link */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, textAlign: 'center' }}>
          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            component="a"
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: '#0f172a',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1rem',
              py: 1.6,
              borderRadius: '12px',
              boxShadow: 'none',
              textDecoration: 'none',
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            {applicationMode}
          </Button>

          <Box
            component="a"
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              px: 2,
              py: 0.85,
              borderRadius: '10px',
              bgcolor: 'rgba(16, 185, 129, 0.1)',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              color: '#059669',
              fontWeight: 800,
              fontSize: '0.82rem',
              textDecoration: 'none',
              wordBreak: 'break-all',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(16, 185, 129, 0.18)',
                borderColor: '#10b981',
                textDecoration: 'underline',
              },
            }}
          >
            <LinkIcon sx={{ fontSize: 16, flexShrink: 0 }} />
            <span>{applyUrl}</span>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// Aliases for backwards compatibility with any existing saved rundown items
export const DesktopJobExecutionSlide = DesktopJobOpportunitySlide;
export const MobileJobExecutionSlide = MobileJobOpportunitySlide;
