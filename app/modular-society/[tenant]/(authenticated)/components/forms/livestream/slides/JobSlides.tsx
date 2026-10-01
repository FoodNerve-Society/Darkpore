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
  let applyUrl = content.applyUrl || content.applicationUrl || content.url || content.link || content.ctaLink;
  if (!applyUrl || applyUrl === 'foodnerve.org/careers' || applyUrl === '/careers') {
    applyUrl = content.id && !String(content.id).startsWith('manual-')
      ? `https://foodnerve.org/careers/${content.id}`
      : 'https://foodnerve.org/careers';
  } else if (applyUrl.startsWith('/')) {
    applyUrl = `https://foodnerve.org${applyUrl}`;
  } else if (!applyUrl.startsWith('http://') && !applyUrl.startsWith('https://')) {
    applyUrl = `https://${applyUrl}`;
  }

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

        {/* Bottom: Mode of Application & Full Apply Link */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
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
              px: 4,
              borderRadius: '12px',
              boxShadow: 'none',
              textDecoration: 'none',
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            {applicationMode}
          </Button>
          <Typography
            component="a"
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '0.88rem',
              color: '#059669',
              fontWeight: 700,
              letterSpacing: '0.01em',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {applyUrl}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// SINGLE CONSOLIDATED JOB SLIDE (MOBILE 9:16)
// Stacked vertically with internal container stacking
// ----------------------------------------------------------------------
export function MobileJobOpportunitySlide({ content }: { content: any }) {
  const jobTitle = content.jobTitle || content.title || 'Operations Architect';
  const orgName = content.orgName || content.organization?.name || 'Corridor Network';
  const orgLogo = content.orgLogo || content.organization?.logoUrl;
  const salary = content.salary || content.compensation || '₦18M - ₦26M';
  const location = content.location || 'Kano / Hybrid';
  const department = content.department || 'Operations';
  const applicationMode = content.applicationMode || 'Apply Live On Stage';

  // Construct full verified careers deep-link
  let applyUrl = content.applyUrl || content.applicationUrl || content.url || content.link || content.ctaLink;
  if (!applyUrl || applyUrl === 'foodnerve.org/careers' || applyUrl === '/careers') {
    applyUrl = content.id && !String(content.id).startsWith('manual-')
      ? `https://foodnerve.org/careers/${content.id}`
      : 'https://foodnerve.org/careers';
  } else if (applyUrl.startsWith('/')) {
    applyUrl = `https://foodnerve.org${applyUrl}`;
  } else if (!applyUrl.startsWith('http://') && !applyUrl.startsWith('https://')) {
    applyUrl = `https://${applyUrl}`;
  }

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1.5 }}>
        {/* Top Header - Vertically Stacked */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Chip
            icon={<WorkIcon sx={{ fontSize: '0.8rem !important' }} />}
            label="ECOSYSTEM HIRING"
            size="small"
            sx={{ alignSelf: 'flex-start', bgcolor: alpha('#10b981', 0.15), color: '#059669', fontWeight: 900, fontSize: '0.7rem', borderRadius: '10px' }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
            <Avatar src={orgLogo} sx={{ width: 44, height: 44, bgcolor: '#0f172a', borderRadius: '10px' }}>
              <BusinessIcon sx={{ fontSize: 22 }} />
            </Avatar>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{orgName}</Typography>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Verified Partner</Typography>
          </Box>

          <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', mt: 0.5 }}>
            {jobTitle}
          </Typography>
        </Box>

        {/* Center: Key Details - Vertically Stacked with Internal Stacking */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 'auto' }}>
          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Verified Compensation</Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#064e3b' }}>{salary}</Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Location & Track</Typography>
            <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{location} · {department}</Typography>
          </Box>
        </Box>

        {/* Bottom: Mode of Application & Full Apply Link */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'center' }}>
          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            component="a"
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 900, fontSize: '0.9rem', py: 1.25, borderRadius: '12px', boxShadow: 'none', textDecoration: 'none', '&:hover': { bgcolor: '#1e293b' } }}
          >
            {applicationMode}
          </Button>
          <Typography
            component="a"
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {applyUrl}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// Aliases for backwards compatibility with any existing saved rundown items
export const DesktopJobExecutionSlide = DesktopJobOpportunitySlide;
export const MobileJobExecutionSlide = MobileJobOpportunitySlide;
