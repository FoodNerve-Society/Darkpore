'use client';

import React from 'react';
import { Box, Typography, Chip, Avatar, Button } from '@mui/material';
import { alpha } from '@mui/system';
import {
  FormatQuote as QuoteIcon,
  CheckCircleOutlined as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  AssignmentTurnedIn as DirectiveIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { SlideWrapper } from '../SlideComponents';

// ----------------------------------------------------------------------
// 1. Mobile Protocol Step Slide (Fills full 9:16 portrait window)
// ----------------------------------------------------------------------
export function MobileProtocolStepSlide({ content }: { content: any }) {
  const stepNum = content.stepNumber || 1;
  const totalSteps = content.totalSteps || 3;
  const title = content.stepTitle || content.title || `Protocol Step ${stepNum}`;
  const action = content.action || content.description || content.text || 'Execute verified standard operating procedure.';
  const owner = content.owner || 'Operations Controller';
  const output = content.output || 'Verified Handover Certificate';

  return (
    <SlideWrapper color="#3b82f6">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        {/* Top Header */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
            <Chip
              label={`STEP ${String(stepNum).padStart(2, '0')} OF ${String(totalSteps).padStart(2, '0')}`}
              size="small"
              sx={{ bgcolor: alpha('#3b82f6', 0.12), color: '#2563eb', fontWeight: 900, fontSize: '0.7rem' }}
            />
            <Chip
              label="SOP"
              size="small"
              sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '0.65rem' }}
            />
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1.45rem', color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
        </Box>

        {/* Center: Action Mandate Card */}
        <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.25)', my: 'auto' }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
            Execution Directive
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
            {action}
          </Typography>
        </Box>

        {/* Bottom Stack: Vertically Stacked Meta Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Responsible
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
              {owner}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckIcon sx={{ fontSize: 14 }} /> Output
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
              {output}
            </Typography>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 2. Mobile Myth vs. Fact Slides
// ----------------------------------------------------------------------
export function MobileMythSlide({ content }: { content: any }) {
  const myth = content.myth || content.text || 'The accepted industry belief goes here...';
  const context = content.context || content.subheadline || 'Why standard operating models fall into this assumptions trap.';

  return (
    <SlideWrapper color="#ef4444">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Chip
          label="THE CONVENTIONAL MYTH"
          size="small"
          sx={{ alignSelf: 'flex-start', bgcolor: alpha('#ef4444', 0.15), color: '#dc2626', fontWeight: 900, fontSize: '0.72rem' }}
        />
        <Box sx={{ my: 'auto' }}>
          <QuoteIcon sx={{ fontSize: '2.4rem', color: alpha('#ef4444', 0.35), mb: 0.5 }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.45rem', color: '#0f172a', lineHeight: 1.25, letterSpacing: '-0.02em', mb: 2 }}>
            "{myth}"
          </Typography>
        </Box>
        <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#7f1d1d', fontWeight: 600, lineHeight: 1.35 }}>
            {context}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

export function MobileFactSlide({ content }: { content: any }) {
  const fact = content.fact || content.reality || content.text || 'The ground operational reality...';
  const disproof = content.disproof || content.metric || content.subheadline || 'Empirical field verification data.';

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Chip
          label="THE GROUND TRUTH"
          size="small"
          sx={{ alignSelf: 'flex-start', bgcolor: '#0f172a', color: '#ffffff', fontWeight: 900, fontSize: '0.72rem' }}
        />
        <Box sx={{ my: 'auto' }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', mb: 2 }}>
            {fact}
          </Typography>
        </Box>
        <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', mb: 0.25 }}>
            Verified Reality
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: '#064e3b', fontWeight: 700, lineHeight: 1.35 }}>
            {disproof}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 3. Mobile Comparison Matrix Slides (Stacked vertically)
// ----------------------------------------------------------------------
export function MobileComparisonOptionSlide({ content }: { content: any }) {
  const optionNumber = content.optionNumber || 1;
  const optionName = content.name || content.title || `Model Option ${optionNumber}`;
  const isChallenger = Boolean(content.isChallenger || optionNumber === 2);
  const theme = isChallenger ? '#10b981' : '#64748b';
  const mechanics = content.mechanics || content.description || 'Core operating architecture.';
  const capex = content.capex || content.cost || 'Estimated capital & friction profile.';
  const outcome = content.outcome || content.result || 'Net operating realization.';

  return (
    <SlideWrapper color={theme}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Box>
          <Chip
            label={isChallenger ? 'MODEL B · CHALLENGER' : 'MODEL A · INCUMBENT'}
            size="small"
            sx={{ mb: 1, bgcolor: alpha(theme, 0.15), color: theme, fontWeight: 900, fontSize: '0.7rem' }}
          />
          <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {optionName}
          </Typography>
        </Box>

        {/* Vertically Stacked Attribute Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1 }}>
          <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)' }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              01 · Architecture
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
              {mechanics}
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)' }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              02 · Capex & Risk
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
              {capex}
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: isChallenger ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.06)', border: `1px solid ${alpha(theme, 0.3)}` }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: theme, textTransform: 'uppercase' }}>
              03 · Realized Outcome
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              {outcome}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
          Swipe or click Next for comparison benchmark
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

export function MobileComparisonVerdictSlide({ content }: { content: any }) {
  const winner = content.winner || 'The Decentralized Pipeline';
  const metric = content.metric || '+3.4x Net Margin';
  const verdict = content.verdict || content.text || 'Why capital must pivot away from legacy subsidized models to agile off-take clearing hubs.';

  return (
    <SlideWrapper color="#7c3aed">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1, textAlign: 'center' }}>
        <Chip
          label="STRATEGIC VERDICT"
          size="small"
          sx={{ alignSelf: 'center', bgcolor: alpha('#7c3aed', 0.15), color: '#6d28d9', fontWeight: 900, fontSize: '0.72rem' }}
        />
        <Box sx={{ my: 'auto' }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.75rem', color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', mb: 1.5 }}>
            {winner}
          </Typography>
          <Chip
            label={metric}
            sx={{ bgcolor: '#7c3aed', color: '#ffffff', fontWeight: 900, fontSize: '1rem', py: 1.75, px: 2, borderRadius: '10px', mb: 2 }}
          />
          <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
            {verdict}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
          Verified Head-to-Head Architecture
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 4. Mobile Timeline Milestone Slide
// ----------------------------------------------------------------------
export function MobileTimelineMilestoneSlide({ content }: { content: any }) {
  const era = content.era || content.year || content.date || '2023 - 2024';
  const title = content.title || content.event || 'The Catalytic Crisis Event';
  const desc = content.description || content.text || 'Sequence of supply chain shocks and policy shifts.';
  const consequence = content.consequence || content.impact || '₦180B Market Liquidity Deficit';

  return (
    <SlideWrapper color="#0ea5e9">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<TimelineIcon sx={{ fontSize: '0.85rem !important' }} />}
            label="TIMELINE"
            size="small"
            sx={{ bgcolor: alpha('#0ea5e9', 0.15), color: '#0284c7', fontWeight: 900, fontSize: '0.7rem' }}
          />
          <Chip label={era} size="small" sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 900, fontSize: '0.7rem' }} />
        </Box>

        <Box sx={{ my: 'auto' }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.45rem', color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', mb: 1.5 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
            {desc}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)' }}>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
            Corridor Consequence
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
            {consequence}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 5. Mobile Executive Summary Slide
// ----------------------------------------------------------------------
export function MobileExecSummarySlide({ content }: { content: any }) {
  const title = content.title || 'Executive Takeaways';
  const bullets = content.bullets || content.points || [
    'Infrastructure deficit requires corridor aggregation hubs.',
    'Informal syndicates capture 42% of farm-gate value.',
    'Bonded depots enable immediate bankable off-take.'
  ];
  const thesis = content.thesis || content.summary || 'Summary conclusion anchoring the presentation narrative.';

  return (
    <SlideWrapper color="#6366f1">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Box>
          <Chip label="EXECUTIVE BRIEFING" size="small" sx={{ mb: 1, bgcolor: alpha('#6366f1', 0.15), color: '#4f46e5', fontWeight: 900, fontSize: '0.7rem' }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
        </Box>

        {/* Vertically Stacked Bullets */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1 }}>
          {bullets.slice(0, 3).map((bullet: string, idx: number) => (
            <Box key={idx} sx={{ p: 1.25, borderRadius: '12px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#4f46e5' }}>0{idx + 1}</Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{bullet}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 1.25, borderRadius: '10px', bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#312e81', fontWeight: 600 }}>{thesis}</Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 6. Mobile Unit Economics Slide (Vertically Stacked)
// ----------------------------------------------------------------------
export function MobileUnitEconomicsSlide({ content }: { content: any }) {
  const title = content.title || 'Unit Economics';
  const c1 = content.inputCost || '₦420 / KG (Farm Gate)';
  const c2 = content.logisticsLeakage || '₦380 / KG (Tolls & Spoilage)';
  const c3 = content.netMargin || '-8.4% (Net Producer Return)';

  return (
    <SlideWrapper color="#0f172a">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Box>
          <Chip label="UNIT ECONOMICS" size="small" sx={{ mb: 1, bgcolor: '#0f172a', color: '#ffffff', fontWeight: 900, fontSize: '0.7rem' }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1 }}>
          <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)' }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>01 · Farm Gate Cost</Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>{c1}</Typography>
          </Box>
          <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>02 · Transit Friction</Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#b91c1c' }}>{c2}</Typography>
          </Box>
          <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>03 · Realized Return</Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#047857' }}>{c3}</Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          {content.summary || 'Logistics extortion eliminates downstream margin.'}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 7. Mobile Persona Dossier Slide
// ----------------------------------------------------------------------
export function MobilePersonaDossierSlide({ content }: { content: any }) {
  const name = content.name || 'Alhaji Haruna Bello';
  const role = content.role || 'Commercial Off-Taker';
  const location = content.location || 'Kano - Dawanau Market';
  const quote = content.quote || 'We lose 4 trucks a week to diesel pump seizures before reaching the port.';

  return (
    <SlideWrapper color="#d97706">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={content.avatarUrl} sx={{ width: 56, height: 56, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <PersonIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Chip label="OPERATOR DOSSIER" size="small" sx={{ mb: 0.5, bgcolor: alpha('#d97706', 0.15), color: '#b45309', fontWeight: 900, fontSize: '0.65rem' }} />
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.15 }}>{name}</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{role} · {location}</Typography>
          </Box>
        </Box>

        <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(217, 119, 6, 0.06)', border: '1px solid rgba(217, 119, 6, 0.25)', my: 'auto' }}>
          <Typography sx={{ fontSize: '0.95rem', fontStyle: 'italic', fontWeight: 700, color: '#78350f', lineHeight: 1.4 }}>
            "{quote}"
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
          Ground truth verification from the field
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 8. Mobile Strategic Directive Slide
// ----------------------------------------------------------------------
export function MobileStrategicDirectiveSlide({ content }: { content: any }) {
  const mandate = content.mandate || content.title || 'Immediate Corridor Mandate';
  const deadline = content.deadline || '30-Day Window';
  const action = content.action || content.text || 'Transition 50% of volume to bonded rail depots.';

  return (
    <SlideWrapper color="#e11d48">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip icon={<DirectiveIcon sx={{ fontSize: '0.8rem !important' }} />} label="ACTION MANDATE" size="small" sx={{ bgcolor: alpha('#e11d48', 0.15), color: '#be123c', fontWeight: 900, fontSize: '0.68rem' }} />
            <Chip label={deadline} size="small" sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 900, fontSize: '0.68rem' }} />
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {mandate}
          </Typography>
        </Box>

        <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(225, 29, 72, 0.06)', border: '1px solid rgba(225, 29, 72, 0.25)', my: 'auto' }}>
          <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: '#881337', lineHeight: 1.4 }}>
            {action}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
          Non-negotiable operational deadline
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 9. Mobile Call To Action Slide
// ----------------------------------------------------------------------
export function MobileCallToActionSlide({ content }: { content: any }) {
  const headline = content.headline || content.title || 'Join Working Group';
  const buttonText = content.buttonText || content.ctaText || 'Access Dossier';
  const subtext = content.subtext || content.subtitle || 'Visit foodnerve.org/stage to access data.';

  return (
    <SlideWrapper color="#8b5cf6">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1, textAlign: 'center' }}>
        <Chip label="NEXT MOVE" size="small" sx={{ alignSelf: 'center', bgcolor: alpha('#8b5cf6', 0.15), color: '#7c3aed', fontWeight: 900, fontSize: '0.7rem' }} />
        <Box sx={{ my: 'auto' }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.65rem', color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', mb: 2 }}>
            {headline}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 900, fontSize: '0.95rem', py: 1.5, borderRadius: '12px', mb: 1.5, boxShadow: 'none', '&:hover': { bgcolor: '#1e293b' } }}
          >
            {buttonText}
          </Button>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            {subtext}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
          Live Stage Interactive Access
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 10. Mobile Live Poll Slide
// ----------------------------------------------------------------------
export function MobileLivePollSlide({ content }: { content: any }) {
  const question = content.question || content.title || 'Where is your highest capital bleed?';
  const options = content.options || ['Highway tolls', 'Cold room spoilage', 'Supplier default', 'FX & seed inflation'];

  return (
    <SlideWrapper color="#2563eb">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
        <Box>
          <Chip label="LIVE POLL" size="small" sx={{ mb: 1, bgcolor: alpha('#2563eb', 0.15), color: '#1d4ed8', fontWeight: 900, fontSize: '0.7rem' }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {question}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 'auto' }}>
          {options.slice(0, 4).map((opt: string, i: number) => (
            <Box key={i} sx={{ p: 1.25, borderRadius: '12px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 1.25, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
              <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#2563eb', fontSize: '0.78rem' }}>
                {String.fromCharCode(65 + i)}
              </Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{opt}</Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
          Tap choice to submit your vote live.
        </Typography>
      </Box>
    </SlideWrapper>
  );
}
