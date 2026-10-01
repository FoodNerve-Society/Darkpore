'use client';

import React from 'react';
import { Box, Typography, Chip, Avatar, Button } from '@mui/material';
import { alpha } from '@mui/system';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CheckCircleOutlined as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { SlideWrapper, safeStringArray } from '../SlideComponents';

// ----------------------------------------------------------------------
// FORMAT B: JOB SLIDE 1 — The Opportunity & Compensation
// ----------------------------------------------------------------------

export function DesktopJobOpportunitySlide({ content }: { content: any }) {
  const jobTitle = content.jobTitle || content.title || 'Lead Operations Architect';
  const orgName = content.orgName || content.organization?.name || 'Corridor Infrastructure Network';
  const orgLogo = content.orgLogo || content.organization?.logoUrl;
  const salary = content.salary || content.compensation || '₦18M - ₦26M + Equity';
  const location = content.location || 'Kano / Northern Corridor (Hybrid)';
  const department = content.department || 'Infrastructure & Logistics';
  const mission = content.mission || content.description || 'Architecting cold-chain transfer hubs to prevent ₦340B in annual perishable haulage loss.';

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        {/* Top Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<WorkIcon sx={{ fontSize: '0.85rem !important' }} />}
              label="ECOSYSTEM HIRING · 01 OF 02"
              size="small"
              sx={{ bgcolor: alpha('#10b981', 0.15), color: '#059669', fontWeight: 900, fontSize: '0.78rem' }}
            />
            <Chip label="ACTIVE SEARCH" size="small" sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '0.72rem' }} />
          </Box>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>
            Part 1: The Opportunity
          </Typography>
        </Box>

        {/* Center: Hero Branding & Role Title */}
        <Box sx={{ my: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar src={orgLogo} sx={{ width: 60, height: 60, bgcolor: '#0f172a', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <BusinessIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                {orgName}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                Verified Partner Search
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.8rem' }, color: '#0f172a', lineHeight: 1.12, letterSpacing: '-0.02em', mb: 2 }}>
            {jobTitle}
          </Typography>

          <Typography sx={{ fontSize: '1.15rem', color: '#475569', fontWeight: 600, maxWidth: 850, lineHeight: 1.45 }}>
            {mission}
          </Typography>
        </Box>

        {/* Bottom Metadata Badges */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocationIcon sx={{ color: '#64748b' }} />
            <Box>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Location</Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{location}</Typography>
            </Box>
          </Box>

          <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MoneyIcon sx={{ color: '#059669' }} />
            <Box>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Compensation</Typography>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#064e3b' }}>{salary}</Typography>
            </Box>
          </Box>

          <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WorkIcon sx={{ color: '#64748b' }} />
            <Box>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Track</Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{department}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

export function MobileJobOpportunitySlide({ content }: { content: any }) {
  const jobTitle = content.jobTitle || content.title || 'Operations Architect';
  const orgName = content.orgName || content.organization?.name || 'Corridor Network';
  const orgLogo = content.orgLogo || content.organization?.logoUrl;
  const salary = content.salary || content.compensation || '₦18M - ₦26M';
  const location = content.location || 'Kano / Hybrid';
  const mission = content.mission || content.description || 'Architecting cold-chain transfer hubs to prevent haulage loss.';

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        {/* Top Header - Vertically Stacked */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Chip
            icon={<WorkIcon sx={{ fontSize: '0.8rem !important' }} />}
            label="HIRING · THE OPPORTUNITY"
            size="small"
            sx={{ alignSelf: 'flex-start', bgcolor: alpha('#10b981', 0.15), color: '#059669', fontWeight: 900, fontSize: '0.7rem' }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75 }}>
            <Avatar src={orgLogo} sx={{ width: 44, height: 44, bgcolor: '#0f172a' }}>
              <BusinessIcon sx={{ fontSize: 22 }} />
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{orgName}</Typography>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Verified Partner</Typography>
            </Box>
          </Box>

          <Typography sx={{ fontWeight: 900, fontSize: '1.45rem', color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', mt: 0.5 }}>
            {jobTitle}
          </Typography>

          <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
            {mission}
          </Typography>
        </Box>

        {/* Vertically Stacked Cards with Stacked Inner Contents */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Verified Compensation</Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#064e3b' }}>{salary}</Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Deployment Location</Typography>
            <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{location}</Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>
          Swipe for deliverables & live application
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// FORMAT B: JOB SLIDE 2 — Execution & How to Apply
// ----------------------------------------------------------------------

export function DesktopJobExecutionSlide({ content }: { content: any }) {
  const jobTitle = content.jobTitle || content.title || 'Role Execution';
  const applyUrl = content.applyUrl || 'foodnerve.org/careers';
  const responsibilities = safeStringArray(content.responsibilities, [
    'Deploy 3 bonded rail aggregation depots along Kano-Lagos corridor within 180 days.',
    'Negotiate off-take contracts with institutional grain and tomato processors.',
    'Lead digital tracking compliance across informal transit cartels.'
  ]);
  const requirements = content.requirements || '7+ years physical corridor logistics or commodity trading infrastructure experience.';

  return (
    <SlideWrapper color="#d97706">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        {/* Top Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<WorkIcon sx={{ fontSize: '0.85rem !important' }} />}
              label="ECOSYSTEM HIRING · 02 OF 02"
              size="small"
              sx={{ bgcolor: alpha('#d97706', 0.15), color: '#b45309', fontWeight: 900, fontSize: '0.78rem' }}
            />
            <Chip label="EXECUTION & APPLY" size="small" sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '0.72rem' }} />
          </Box>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>
            Part 2: Execution & How to Apply
          </Typography>
        </Box>

        {/* Center: Deliverables & Requirements */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 3, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Day 90 Core Deliverables
            </Typography>
            {responsibilities.slice(0, 3).map((resp: string, idx: number) => (
              <Box key={idx} sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 1.75 }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 20 }} />
                <Typography sx={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>{resp}</Typography>
              </Box>
            ))}
          </Box>

          {/* Right: Requirements & Apply CTA */}
          <Box sx={{ p: 3, borderRadius: '20px', bgcolor: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 16px 40px rgba(0,0,0,0.2)', border: '1.5px solid rgba(255, 255, 255, 0.15)' }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
              Candidate Profile
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
              {requirements}
            </Typography>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#10b981', color: '#ffffff', fontWeight: 900, fontSize: '0.95rem', py: 1.25, borderRadius: '12px', mt: 1, boxShadow: 'none', '&:hover': { bgcolor: '#059669' } }}
            >
              Apply Live On Stage
            </Button>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
              {applyUrl}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
          Broadcast interview & expedited fast-track available for live stream attendees.
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

export function MobileJobExecutionSlide({ content }: { content: any }) {
  const responsibilities = safeStringArray(content.responsibilities, [
    'Deploy 3 bonded rail aggregation depots.',
    'Negotiate off-take contracts with food processors.',
    'Lead digital tracking compliance across transit cartels.'
  ]);
  const applyUrl = content.applyUrl || 'foodnerve.org/careers';

  return (
    <SlideWrapper color="#d97706">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75, mb: 1.5 }}>
            <Chip
              icon={<WorkIcon sx={{ fontSize: '0.8rem !important' }} />}
              label="HIRING · DELIVERABLES & APPLY"
              size="small"
              sx={{ bgcolor: alpha('#d97706', 0.15), color: '#b45309', fontWeight: 900, fontSize: '0.7rem' }}
            />
            <Typography sx={{ fontWeight: 900, fontSize: '1.45rem', color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Key Deliverables
            </Typography>
          </Box>

          {/* Vertically Stacked Responsibilities with internal vertical stacking */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {responsibilities.slice(0, 3).map((resp: string, idx: number) => (
              <Box key={idx} sx={{ p: 1.25, borderRadius: '12px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckIcon sx={{ color: '#10b981', fontSize: 16, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                    Deliverable 0{idx + 1}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                  {resp}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom CTA Box with internal vertical stacking */}
        <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#0f172a', color: '#ffffff', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{ bgcolor: '#10b981', color: '#ffffff', fontWeight: 900, fontSize: '0.9rem', py: 1.25, borderRadius: '10px', boxShadow: 'none', '&:hover': { bgcolor: '#059669' } }}
          >
            Apply Live On Stage
          </Button>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
            {applyUrl}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}
