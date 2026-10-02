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
import {
  SlideWrapper,
  safeStringArray,
  slideFonts,
  slideHeadingSx,
  slideBodySx,
  slideLabelSx,
  slideChipSx,
} from '../SlideComponents';

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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        {/* Top Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Chip
              label={`STEP ${String(stepNum).padStart(2, '0')} OF ${String(totalSteps).padStart(2, '0')}`}
              size="small"
              sx={{ ...slideChipSx('0.72rem'), bgcolor: alpha('#3b82f6', 0.12), color: '#2563eb', borderRadius: '10px' }}
            />
            <Chip
              label="SOP MANDATE"
              size="small"
              sx={{ ...slideChipSx('0.68rem'), bgcolor: '#0f172a', color: '#ffffff', borderRadius: '10px' }}
            />
          </Box>
          <Typography sx={{ ...slideHeadingSx({ xs: '1.75rem', sm: '2.1rem' }, 700), color: '#0f172a', lineHeight: 1.18, mt: 0.5 }}>
            {title}
          </Typography>
        </Box>

        {/* Center: Action Mandate Card - Expanded vertically */}
        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(59, 130, 246, 0.06)', border: '1.5px solid rgba(59, 130, 246, 0.25)', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#2563eb' }}>
            Execution Directive
          </Typography>
          <Typography sx={{ ...slideBodySx('1.1rem', 500), color: '#0f172a', lineHeight: 1.45 }}>
            {action}
          </Typography>
        </Box>

        {/* Bottom Stack: Vertically Stacked Meta Cards with Rich Padding */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.5, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)' }}>
            <Typography sx={{ ...slideLabelSx('0.68rem', 700), color: '#64748b' }}>
              Responsible
            </Typography>
            <Typography sx={{ ...slideBodySx('1.05rem', 700), color: '#0f172a' }}>
              {owner}
            </Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.5, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)' }}>
            <Typography sx={{ ...slideLabelSx('0.68rem', 700), color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckIcon sx={{ fontSize: 16 }} /> Output
            </Typography>
            <Typography sx={{ ...slideBodySx('1.05rem', 700), color: '#0f172a' }}>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Chip
            label="THE CONVENTIONAL MYTH"
            size="small"
            sx={{ ...slideChipSx('0.72rem'), alignSelf: 'flex-start', bgcolor: alpha('#ef4444', 0.15), color: '#dc2626', borderRadius: '10px' }}
          />
          <Box sx={{ pt: 1 }}>
            <QuoteIcon sx={{ fontSize: '3rem', color: alpha('#ef4444', 0.35), mb: 1 }} />
            <Typography sx={{ ...slideHeadingSx({ xs: '1.85rem', sm: '2.25rem' }, 700), color: '#0f172a', lineHeight: 1.2, mb: 2 }}>
              "{myth}"
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(239, 68, 68, 0.06)', border: '1.5px solid rgba(239, 68, 68, 0.25)' }}>
          <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#dc2626', mb: 0.5 }}>
            Conventional Trap
          </Typography>
          <Typography sx={{ ...slideBodySx('0.95rem', 500), color: '#7f1d1d', lineHeight: 1.45 }}>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Chip
            label="THE GROUND TRUTH"
            size="small"
            sx={{ ...slideChipSx('0.72rem'), alignSelf: 'flex-start', bgcolor: '#0f172a', color: '#ffffff', borderRadius: '10px' }}
          />
          <Box sx={{ pt: 1 }}>
            <Typography sx={{ ...slideHeadingSx({ xs: '1.85rem', sm: '2.25rem' }, 700), color: '#0f172a', lineHeight: 1.2, mb: 2 }}>
              {fact}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.3)' }}>
          <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#059669', mb: 0.5 }}>
            Verified Reality
          </Typography>
          <Typography sx={{ ...slideBodySx('1.05rem', 600), color: '#064e3b', lineHeight: 1.4 }}>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Chip
            label={isChallenger ? 'MODEL B · CHALLENGER' : 'MODEL A · INCUMBENT'}
            size="small"
            sx={{ ...slideChipSx('0.72rem'), alignSelf: 'flex-start', mb: 0.5, bgcolor: alpha(theme, 0.15), color: theme, borderRadius: '10px' }}
          />
          <Typography sx={{ ...slideHeadingSx({ xs: '1.75rem', sm: '2.1rem' }, 700), color: '#0f172a', lineHeight: 1.15 }}>
            {optionName}
          </Typography>
        </Box>

        {/* Vertically Stacked Attribute Cards with Generous Spacing */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
          <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ ...slideLabelSx('0.68rem', 700), color: '#64748b' }}>
              01 · Architecture
            </Typography>
            <Typography sx={{ ...slideBodySx('0.95rem', 500), color: '#0f172a', lineHeight: 1.35 }}>
              {mechanics}
            </Typography>
          </Box>

          <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ ...slideLabelSx('0.68rem', 700), color: '#64748b' }}>
              02 · Capex & Risk
            </Typography>
            <Typography sx={{ ...slideBodySx('0.95rem', 500), color: '#0f172a', lineHeight: 1.35 }}>
              {capex}
            </Typography>
          </Box>

          <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: isChallenger ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.06)', border: `1.5px solid ${alpha(theme, 0.35)}`, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ ...slideLabelSx('0.68rem', 700), color: theme }}>
              03 · Realized Outcome
            </Typography>
            <Typography sx={{ ...slideBodySx('1rem', 700), color: '#0f172a', lineHeight: 1.35 }}>
              {outcome}
            </Typography>
          </Box>
        </Box>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 }, textAlign: 'center' }}>
        <Chip
          label="STRATEGIC VERDICT"
          size="small"
          sx={{ ...slideChipSx('0.75rem'), alignSelf: 'center', bgcolor: alpha('#7c3aed', 0.15), color: '#6d28d9', borderRadius: '10px' }}
        />
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ ...slideHeadingSx({ xs: '2rem', sm: '2.5rem' }, 700), color: '#0f172a', lineHeight: 1.15 }}>
            {winner}
          </Typography>
          <Chip
            label={metric}
            sx={{ ...slideChipSx('1.15rem'), bgcolor: '#7c3aed', color: '#ffffff', py: 2, px: 3, borderRadius: '12px', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)' }}
          />
        </Box>
        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(124, 58, 237, 0.06)', border: '1.5px solid rgba(124, 58, 237, 0.25)' }}>
          <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#6d28d9', mb: 0.5 }}>
            Comparative Realization
          </Typography>
          <Typography sx={{ ...slideBodySx('1.05rem', 500), color: '#475569', lineHeight: 1.45 }}>
            {verdict}
          </Typography>
        </Box>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<TimelineIcon sx={{ fontSize: '0.85rem !important' }} />}
              label="TIMELINE"
              size="small"
              sx={{ ...slideChipSx('0.72rem'), bgcolor: alpha('#0ea5e9', 0.15), color: '#0284c7', borderRadius: '10px' }}
            />
            <Chip label={era} size="small" sx={{ ...slideChipSx('0.72rem'), bgcolor: '#0f172a', color: '#ffffff', borderRadius: '10px' }} />
          </Box>
          <Typography sx={{ ...slideHeadingSx({ xs: '1.75rem', sm: '2.1rem' }, 700), color: '#0f172a', lineHeight: 1.18, mt: 1 }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ p: 2.25, borderRadius: '16px', bgcolor: 'rgba(14, 165, 233, 0.05)', border: '1.5px solid rgba(14, 165, 233, 0.2)', py: 2 }}>
          <Typography sx={{ ...slideBodySx('1.05rem', 500), color: '#334155', lineHeight: 1.45 }}>
            {desc}
          </Typography>
        </Box>

        <Box sx={{ p: 2.25, borderRadius: '14px', bgcolor: 'rgba(14, 165, 233, 0.08)', border: '1.5px solid rgba(14, 165, 233, 0.25)', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ ...slideLabelSx('0.68rem', 700), color: '#0284c7' }}>
            Corridor Consequence
          </Typography>
          <Typography sx={{ ...slideHeadingSx('1.25rem', 700), color: '#0f172a' }}>
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
  const bullets = safeStringArray(content.bullets || content.points, [
    'Infrastructure deficit requires corridor aggregation hubs.',
    'Informal syndicates capture 42% of farm-gate value.',
    'Bonded depots enable immediate bankable off-take.'
  ]);
  const thesis = content.thesis || content.summary || 'Summary conclusion anchoring the presentation narrative.';

  return (
    <SlideWrapper color="#6366f1">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Chip label="EXECUTIVE BRIEFING" size="small" sx={{ ...slideChipSx('0.72rem'), alignSelf: 'flex-start', bgcolor: alpha('#6366f1', 0.15), color: '#4f46e5', borderRadius: '10px' }} />
          <Typography sx={{ ...slideHeadingSx({ xs: '1.75rem', sm: '2.1rem' }, 700), color: '#0f172a', lineHeight: 1.15, mt: 0.5 }}>
            {title}
          </Typography>
        </Box>

        {/* Vertically Stacked Bullets with Stacked Internal Content & Generous Spacing */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
          {bullets.slice(0, 3).map((bullet: string, idx: number) => (
            <Box key={idx} sx={{ p: 1.75, borderRadius: '14px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.35, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)' }}>
              <Typography sx={{ ...slideHeadingSx('0.95rem', 700), color: '#4f46e5' }}>0{idx + 1}</Typography>
              <Typography sx={{ ...slideBodySx('0.95rem', 500), color: '#0f172a', lineHeight: 1.35 }}>{bullet}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1.5px solid rgba(99, 102, 241, 0.25)' }}>
          <Typography sx={{ ...slideBodySx('0.88rem', 500), color: '#312e81', lineHeight: 1.4 }}>{thesis}</Typography>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Chip label="UNIT ECONOMICS" size="small" sx={{ ...slideChipSx('0.72rem'), alignSelf: 'flex-start', bgcolor: '#0f172a', color: '#ffffff', borderRadius: '10px' }} />
          <Typography sx={{ ...slideHeadingSx({ xs: '1.75rem', sm: '2.1rem' }, 700), color: '#0f172a', lineHeight: 1.15, mt: 0.5 }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', flexDirection: 'column', gap: 0.35, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)' }}>
            <Typography sx={{ ...slideLabelSx('0.68rem', 700), color: '#64748b' }}>01 · Farm Gate Cost</Typography>
            <Typography sx={{ ...slideHeadingSx('1.25rem', 700), color: '#0f172a' }}>{c1}</Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1.5px solid rgba(239, 68, 68, 0.25)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ ...slideLabelSx('0.68rem', 700), color: '#dc2626' }}>02 · Transit Friction</Typography>
            <Typography sx={{ ...slideHeadingSx('1.25rem', 700), color: '#b91c1c' }}>{c2}</Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography sx={{ ...slideLabelSx('0.68rem', 700), color: '#059669' }}>03 · Realized Return</Typography>
            <Typography sx={{ ...slideHeadingSx('1.25rem', 700), color: '#047857' }}>{c3}</Typography>
          </Box>
        </Box>

        <Typography sx={{ ...slideBodySx('0.85rem', 500), color: '#64748b', textAlign: 'center' }}>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
          <Chip label="OPERATOR DOSSIER" size="small" sx={{ ...slideChipSx('0.72rem'), bgcolor: alpha('#d97706', 0.15), color: '#b45309', borderRadius: '10px' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={content.avatarUrl} sx={{ width: 64, height: 64, borderRadius: '14px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
              <PersonIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography sx={{ ...slideHeadingSx('1.45rem', 700), color: '#0f172a', lineHeight: 1.15 }}>{name}</Typography>
              <Typography sx={{ ...slideBodySx('0.9rem', 600), color: '#64748b' }}>{role}</Typography>
              <Typography sx={{ ...slideLabelSx('0.82rem', 700), color: '#b45309' }}>{location}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(217, 119, 6, 0.06)', border: '1.5px solid rgba(217, 119, 6, 0.25)', py: 2.5 }}>
          <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#b45309', mb: 0.5 }}>
            Field Reality Voice
          </Typography>
          <Typography sx={{ ...slideBodySx('1.15rem', 500), fontStyle: 'italic', color: '#78350f', lineHeight: 1.45 }}>
            "{quote}"
          </Typography>
        </Box>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip icon={<DirectiveIcon sx={{ fontSize: '0.82rem !important' }} />} label="ACTION MANDATE" size="small" sx={{ ...slideChipSx('0.72rem'), bgcolor: alpha('#e11d48', 0.15), color: '#be123c', borderRadius: '10px' }} />
            <Chip label={deadline} size="small" sx={{ ...slideChipSx('0.72rem'), bgcolor: '#0f172a', color: '#ffffff', borderRadius: '10px' }} />
          </Box>
          <Typography sx={{ ...slideHeadingSx({ xs: '1.75rem', sm: '2.1rem' }, 700), color: '#0f172a', lineHeight: 1.18, mt: 0.5 }}>
            {mandate}
          </Typography>
        </Box>

        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(225, 29, 72, 0.06)', border: '1.5px solid rgba(225, 29, 72, 0.25)', py: 2.5 }}>
          <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#be123c', mb: 0.5 }}>
            Operational Directive
          </Typography>
          <Typography sx={{ ...slideBodySx('1.15rem', 500), color: '#881337', lineHeight: 1.45 }}>
            {action}
          </Typography>
        </Box>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 }, textAlign: 'center' }}>
        <Chip label="NEXT MOVE" size="small" sx={{ ...slideChipSx('0.75rem'), alignSelf: 'center', bgcolor: alpha('#8b5cf6', 0.15), color: '#7c3aed', borderRadius: '10px' }} />
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ ...slideHeadingSx({ xs: '2rem', sm: '2.4rem' }, 700), color: '#0f172a', lineHeight: 1.15 }}>
            {headline}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              ...slideLabelSx('1.05rem', 700),
              bgcolor: '#0f172a',
              color: '#ffffff',
              py: 1.8,
              borderRadius: '12px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            {buttonText}
          </Button>
          <Typography sx={{ ...slideBodySx('0.92rem', 500), color: '#64748b' }}>
            {subtext}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 10. Mobile Live Poll Slide
// ----------------------------------------------------------------------
export function MobileLivePollSlide({ content }: { content: any }) {
  const question = content.question || content.title || 'Where is your highest capital bleed?';
  const options = safeStringArray(content.options, [
    'Highway tolls',
    'Cold room spoilage',
    'Supplier default',
    'FX & seed inflation',
  ]);

  return (
    <SlideWrapper color="#2563eb">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: { xs: 1.5, md: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Chip label="LIVE POLL" size="small" sx={{ ...slideChipSx('0.72rem'), alignSelf: 'flex-start', bgcolor: alpha('#2563eb', 0.15), color: '#1d4ed8', borderRadius: '10px' }} />
          <Typography sx={{ ...slideHeadingSx({ xs: '1.65rem', sm: '2rem' }, 700), color: '#0f172a', lineHeight: 1.2, mt: 0.5 }}>
            {question}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
          {options.slice(0, 4).map((opt: string, i: number) => (
            <Box key={i} sx={{ p: 1.75, borderRadius: '14px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 1.5, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)' }}>
              <Box sx={{ ...slideHeadingSx('0.82rem', 700), width: 28, height: 28, borderRadius: '8px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}
              </Box>
              <Typography sx={{ ...slideBodySx('0.98rem', 600), color: '#0f172a', lineHeight: 1.3 }}>{opt}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </SlideWrapper>
  );
}
