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
// 1. Protocol Steps Slide (1 Slide per Step)
// ----------------------------------------------------------------------
export function DesktopProtocolStepSlide({ content }: { content: any }) {
  const stepNum = content.stepNumber || 1;
  const totalSteps = content.totalSteps || 3;
  const title = content.stepTitle || content.title || `Protocol Step ${stepNum}`;
  const action = content.action || content.description || content.text || 'Execute verified standard operating procedure.';
  const owner = content.owner || 'Lead Operations Controller';
  const output = content.output || 'Verified Field Handover Certificate';

  return (
    <SlideWrapper color="#3b82f6">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        {/* Top Header */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Chip
              label={`STEP ${String(stepNum).padStart(2, '0')} OF ${String(totalSteps).padStart(2, '0')}`}
              size="small"
              sx={{ ...slideChipSx('0.78rem'), bgcolor: alpha('#3b82f6', 0.12), color: '#2563eb', px: 0.5 }}
            />
            <Chip
              label="SOP DIRECTIVE"
              size="small"
              sx={{ ...slideChipSx('0.72rem'), bgcolor: '#0f172a', color: '#ffffff' }}
            />
          </Box>
          <Typography sx={{ ...slideHeadingSx('2.4rem', 700), color: '#0f172a', lineHeight: 1.15, maxWidth: 900 }}>
            {title}
          </Typography>
        </Box>

        {/* Center & Bottom: Split Action & Meta */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 3, alignItems: 'stretch' }}>
          {/* Main Action Box */}
          <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography sx={{ ...slideLabelSx('0.78rem', 700), color: '#2563eb', mb: 1 }}>
              Execution Mandate
            </Typography>
            <Typography sx={{ ...slideBodySx('1.2rem', 500), color: '#0f172a', lineHeight: 1.45 }}>
              {action}
            </Typography>
          </Box>

          {/* Metadata Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, justifyContent: 'center' }}>
            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.9)', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Typography sx={{ ...slideLabelSx('0.7rem', 700), color: '#64748b', mb: 0.5 }}>
                Assigned Operator
              </Typography>
              <Typography sx={{ ...slideBodySx('1rem', 700), color: '#0f172a' }}>
                {owner}
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.9)', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Typography sx={{ ...slideLabelSx('0.7rem', 700), color: '#10b981', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckIcon sx={{ fontSize: 16 }} /> Target Output
              </Typography>
              <Typography sx={{ ...slideBodySx('1rem', 700), color: '#0f172a' }}>
                {output}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 2. Myth vs. Fact Slides (1 Slide per Side)
// ----------------------------------------------------------------------
export function DesktopMythSlide({ content }: { content: any }) {
  const myth = content.myth || content.text || 'The accepted industry belief goes here...';
  const context = content.context || content.subheadline || 'Why standard operating models fall into this assumptions trap.';

  return (
    <SlideWrapper color="#ef4444">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '85%' }}>
        <Chip
          label="THE CONVENTIONAL MYTH · BREAKDOWN"
          size="small"
          sx={{ ...slideChipSx('0.8rem'), alignSelf: 'flex-start', mb: 3, bgcolor: alpha('#ef4444', 0.15), color: '#dc2626', px: 0.75 }}
        />
        <QuoteIcon sx={{ fontSize: '3rem', color: alpha('#ef4444', 0.35), mb: 1 }} />
        <Typography sx={{ ...slideHeadingSx('2.5rem', 700), color: '#0f172a', lineHeight: 1.2, mb: 3 }}>
          "{myth}"
        </Typography>
        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', maxWidth: 680 }}>
          <Typography sx={{ ...slideBodySx('1rem', 500), color: '#7f1d1d', lineHeight: 1.4 }}>
            {context}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

export function DesktopFactSlide({ content }: { content: any }) {
  const fact = content.fact || content.reality || content.text || 'The ground operational reality...';
  const disproof = content.disproof || content.metric || content.subheadline || 'Empirical field verification data.';

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '85%' }}>
        <Chip
          label="THE GROUND TRUTH · VERIFIED REALITY"
          size="small"
          sx={{ ...slideChipSx('0.8rem'), alignSelf: 'flex-start', mb: 3, bgcolor: '#0f172a', color: '#ffffff', px: 0.75 }}
        />
        <Typography sx={{ ...slideHeadingSx('2.5rem', 700), color: '#0f172a', lineHeight: 1.2, mb: 3 }}>
          {fact}
        </Typography>
        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', maxWidth: 680 }}>
          <Typography sx={{ ...slideLabelSx('0.78rem', 700), color: '#059669', mb: 0.5 }}>
            Verified Proof Point
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
// 3. Comparison Matrix Slides (1 Slide per Option + 1 Verdict)
// ----------------------------------------------------------------------
export function DesktopComparisonOptionSlide({ content }: { content: any }) {
  const optionNumber = content.optionNumber || 1;
  const optionName = content.name || content.title || `Model Option ${optionNumber}`;
  const isChallenger = Boolean(content.isChallenger || optionNumber === 2);
  const theme = isChallenger ? '#10b981' : '#64748b';
  const mechanics = content.mechanics || content.description || 'Core operating architecture of this approach.';
  const capex = content.capex || content.cost || 'Estimated capital requirement & friction profile.';
  const outcome = content.outcome || content.result || 'Net operating realization after 12 months.';

  return (
    <SlideWrapper color={theme}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <Box>
          <Chip
            label={isChallenger ? 'MODEL B · THE CHALLENGER' : 'MODEL A · THE INCUMBENT'}
            size="small"
            sx={{ ...slideChipSx('0.78rem'), mb: 2, bgcolor: alpha(theme, 0.15), color: theme }}
          />
          <Typography sx={{ ...slideHeadingSx('2.4rem', 700), color: '#0f172a', lineHeight: 1.15 }}>
            {optionName}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#64748b', mb: 1 }}>
              01 · Architecture
            </Typography>
            <Typography sx={{ ...slideBodySx('0.98rem', 500), color: '#0f172a', lineHeight: 1.4 }}>
              {mechanics}
            </Typography>
          </Box>

          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#64748b', mb: 1 }}>
              02 · Capex & Risk
            </Typography>
            <Typography sx={{ ...slideBodySx('0.98rem', 500), color: '#0f172a', lineHeight: 1.4 }}>
              {capex}
            </Typography>
          </Box>

          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: isChallenger ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.06)', border: `1px solid ${alpha(theme, 0.3)}` }}>
            <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: theme, mb: 1 }}>
              03 · Realized Outcome
            </Typography>
            <Typography sx={{ ...slideBodySx('0.98rem', 700), color: '#0f172a', lineHeight: 1.4 }}>
              {outcome}
            </Typography>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

export function DesktopComparisonVerdictSlide({ content }: { content: any }) {
  const winner = content.winner || 'The Decentralized Pipeline';
  const metric = content.metric || '+3.4x Net Margin Efficiency';
  const verdict = content.verdict || content.text || 'Why capital must pivot away from legacy subsidized models to agile off-take clearing hubs.';

  return (
    <SlideWrapper color="#7c3aed">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', px: 4 }}>
        <Chip
          label="THE STRATEGIC VERDICT · HEAD-TO-HEAD"
          size="small"
          sx={{ ...slideChipSx('0.8rem'), mb: 2.5, bgcolor: alpha('#7c3aed', 0.15), color: '#6d28d9' }}
        />
        <Typography sx={{ ...slideHeadingSx('3.2rem', 700), color: '#0f172a', lineHeight: 1.15, mb: 2 }}>
          {winner}
        </Typography>
        <Chip
          label={metric}
          sx={{ ...slideChipSx('1.2rem'), bgcolor: '#7c3aed', color: '#ffffff', py: 2.5, px: 2, borderRadius: '12px', mb: 3 }}
        />
        <Typography sx={{ ...slideBodySx('1.15rem', 500), color: '#475569', maxWidth: 780, lineHeight: 1.45 }}>
          {verdict}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 4. Timeline Tracker Milestone Slide (1 Slide per Era)
// ----------------------------------------------------------------------
export function DesktopTimelineMilestoneSlide({ content }: { content: any }) {
  const era = content.era || content.year || content.date || '2023 - 2024';
  const title = content.title || content.event || 'The Catalytic Crisis Event';
  const desc = content.description || content.text || 'Detailed sequence of supply chain shocks and policy shifts.';
  const consequence = content.consequence || content.impact || '₦180B Market Liquidity Deficit';

  return (
    <SlideWrapper color="#0ea5e9">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<TimelineIcon sx={{ fontSize: '0.9rem !important' }} />}
            label="TIMELINE MILESTONE"
            size="small"
            sx={{ ...slideChipSx('0.78rem'), bgcolor: alpha('#0ea5e9', 0.15), color: '#0284c7' }}
          />
          <Chip label={era} size="small" sx={{ ...slideChipSx('0.78rem'), bgcolor: '#0f172a', color: '#ffffff' }} />
        </Box>

        <Box sx={{ my: 'auto' }}>
          <Typography sx={{ ...slideHeadingSx('2.5rem', 700), color: '#0f172a', lineHeight: 1.15, mb: 2 }}>
            {title}
          </Typography>
          <Typography sx={{ ...slideBodySx('1.15rem', 500), color: '#475569', maxWidth: 820, lineHeight: 1.45 }}>
            {desc}
          </Typography>
        </Box>

        <Box sx={{ p: 2.25, borderRadius: '16px', bgcolor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)', alignSelf: 'flex-start' }}>
          <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#0284c7', mb: 0.25 }}>
            Corridor Impact
          </Typography>
          <Typography sx={{ ...slideHeadingSx('1.1rem', 700), color: '#0f172a' }}>
            {consequence}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 5. Executive Summary Slide
// ----------------------------------------------------------------------
export function DesktopExecSummarySlide({ content }: { content: any }) {
  const title = content.title || 'Executive Summary: Strategic Takeaways';
  const bullets = safeStringArray(content.bullets || content.points, [
    'The physical infrastructure deficit cannot be bridged with software subsidies alone.',
    'Informal transit syndicates capture up to 42% of farm-gate value realization.',
    'Bonded aggregation depots offer the only verified path to institutional off-take.'
  ]);
  const thesis = content.thesis || content.summary || 'Summary conclusion anchoring the presentation narrative.';

  return (
    <SlideWrapper color="#6366f1">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <Box>
          <Chip label="EXECUTIVE READOUT" size="small" sx={{ ...slideChipSx('0.78rem'), mb: 1.5, bgcolor: alpha('#6366f1', 0.15), color: '#4f46e5' }} />
          <Typography sx={{ ...slideHeadingSx('2.2rem', 700), color: '#0f172a' }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {bullets.slice(0, 3).map((bullet: string, idx: number) => (
            <Box key={idx} sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ ...slideHeadingSx('1.2rem', 700), color: '#4f46e5' }}>0{idx + 1}</Typography>
              <Typography sx={{ ...slideBodySx('1rem', 500), color: '#0f172a' }}>{bullet}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <Typography sx={{ ...slideBodySx('0.92rem', 500), color: '#312e81' }}>{thesis}</Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 6. Unit Economics Card Slide
// ----------------------------------------------------------------------
export function DesktopUnitEconomicsSlide({ content }: { content: any }) {
  const title = content.title || 'Unit Economics: Margin Fracture Profile';
  const c1 = content.inputCost || '₦420 / KG (Farm Gate)';
  const c2 = content.logisticsLeakage || '₦380 / KG (Corridor Tolls)';
  const c3 = content.netMargin || '-8.4% (Net Producer Return)';

  return (
    <SlideWrapper color="#0f172a">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <Box>
          <Chip label="UNIT ECONOMICS BREAKDOWN" size="small" sx={{ ...slideChipSx('0.78rem'), mb: 1.5, bgcolor: '#0f172a', color: '#ffffff' }} />
          <Typography sx={{ ...slideHeadingSx('2.2rem', 700), color: '#0f172a' }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)' }}>
            <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#64748b', mb: 1 }}>01 · Farm Gate Cost</Typography>
            <Typography sx={{ ...slideHeadingSx('1.4rem', 700), color: '#0f172a' }}>{c1}</Typography>
          </Box>
          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#dc2626', mb: 1 }}>02 · Transit Friction</Typography>
            <Typography sx={{ ...slideHeadingSx('1.4rem', 700), color: '#b91c1c' }}>{c2}</Typography>
          </Box>
          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Typography sx={{ ...slideLabelSx('0.72rem', 700), color: '#059669', mb: 1 }}>03 · Realized Return</Typography>
            <Typography sx={{ ...slideHeadingSx('1.4rem', 700), color: '#047857' }}>{c3}</Typography>
          </Box>
        </Box>

        <Typography sx={{ ...slideBodySx('0.95rem', 500), color: '#64748b' }}>
          {content.summary || 'Without corridor aggregation, logistics extortion eliminates downstream margin.'}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 7. Persona Dossier Slide
// ----------------------------------------------------------------------
export function DesktopPersonaDossierSlide({ content }: { content: any }) {
  const name = content.name || 'Alhaji Haruna Bello';
  const role = content.role || 'Commercial Off-Taker & Aggregator';
  const location = content.location || 'Kano - Dawanau Grain Market';
  const quote = content.quote || 'We lose 4 trucks a week to diesel pump seizures before reaching the port.';

  return (
    <SlideWrapper color="#d97706">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Avatar src={content.avatarUrl} sx={{ width: 140, height: 140, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
          <PersonIcon sx={{ fontSize: 72 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Chip label="OPERATOR DOSSIER" size="small" sx={{ ...slideChipSx('0.78rem'), mb: 1.5, bgcolor: alpha('#d97706', 0.15), color: '#b45309' }} />
          <Typography sx={{ ...slideHeadingSx('2.2rem', 700), color: '#0f172a', lineHeight: 1.15 }}>{name}</Typography>
          <Typography sx={{ ...slideBodySx('1.05rem', 600), color: '#64748b', mb: 2 }}>{role} · {location}</Typography>
          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(217, 119, 6, 0.06)', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
            <Typography sx={{ ...slideBodySx('1.15rem', 500), fontStyle: 'italic', color: '#78350f' }}>"{quote}"</Typography>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 8. Strategic Directive Slide
// ----------------------------------------------------------------------
export function DesktopStrategicDirectiveSlide({ content }: { content: any }) {
  const mandate = content.mandate || content.title || 'Immediate Corridor Off-Take Mandate';
  const deadline = content.deadline || '30-Day Window';
  const action = content.action || content.text || 'Transition 50% of Northern volume to bonded rail depots.';

  return (
    <SlideWrapper color="#e11d48">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 850 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Chip icon={<DirectiveIcon sx={{ fontSize: '0.9rem !important' }} />} label="ACTION MANDATE" size="small" sx={{ ...slideChipSx('0.78rem'), bgcolor: alpha('#e11d48', 0.15), color: '#be123c' }} />
          <Chip label={deadline} size="small" sx={{ ...slideChipSx('0.78rem'), bgcolor: '#0f172a', color: '#ffffff' }} />
        </Box>
        <Typography sx={{ ...slideHeadingSx('2.5rem', 700), color: '#0f172a', lineHeight: 1.15, mb: 3 }}>
          {mandate}
        </Typography>
        <Box sx={{ p: 3, borderRadius: '18px', bgcolor: 'rgba(225, 29, 72, 0.06)', border: '1px solid rgba(225, 29, 72, 0.25)' }}>
          <Typography sx={{ ...slideBodySx('1.2rem', 500), color: '#881337', lineHeight: 1.45 }}>
            {action}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 9. Call To Action Slide
// ----------------------------------------------------------------------
export function DesktopCallToActionSlide({ content }: { content: any }) {
  const headline = content.headline || content.title || 'Join The Ecosystem Working Group';
  const buttonText = content.buttonText || content.ctaText || 'Access Working Dossier';
  const subtext = content.subtext || content.subtitle || 'Scan or visit foodnerve.org/stage to review full data models.';

  return (
    <SlideWrapper color="#8b5cf6">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', px: 4 }}>
        <Chip label="NEXT MOVE" size="small" sx={{ ...slideChipSx('0.78rem'), mb: 2, bgcolor: alpha('#8b5cf6', 0.15), color: '#7c3aed' }} />
        <Typography sx={{ ...slideHeadingSx('3rem', 700), color: '#0f172a', lineHeight: 1.15, mb: 3, maxWidth: 800 }}>
          {headline}
        </Typography>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            fontFamily: slideFonts.label,
            fontWeight: 700,
            fontSize: '1.1rem',
            bgcolor: '#0f172a',
            color: '#ffffff',
            py: 1.75,
            px: 4,
            borderRadius: '12px',
            mb: 2.5,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#1e293b' },
          }}
        >
          {buttonText}
        </Button>
        <Typography sx={{ ...slideBodySx('0.95rem', 500), color: '#64748b' }}>
          {subtext}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// 10. Live Poll / Interactive Slide
// ----------------------------------------------------------------------
export function DesktopLivePollSlide({ content }: { content: any }) {
  const question = content.question || content.title || 'Audience Poll: Where is your highest capital bleed point?';
  const options = safeStringArray(content.options, [
    'Highway extortion tolls',
    'Cold room spoilage',
    'Unbanked supplier default',
    'FX & seed inflation',
  ]);

  return (
    <SlideWrapper color="#2563eb">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <Box>
          <Chip label="LIVE AUDIENCE POLL" size="small" sx={{ ...slideChipSx('0.78rem'), mb: 1.5, bgcolor: alpha('#2563eb', 0.15), color: '#1d4ed8' }} />
          <Typography sx={{ ...slideHeadingSx('2.2rem', 700), color: '#0f172a', lineHeight: 1.2 }}>
            {question}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {options.slice(0, 4).map((opt: string, i: number) => (
            <Box key={i} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.95)', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ ...slideHeadingSx('0.85rem', 700), width: 32, height: 32, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                {String.fromCharCode(65 + i)}
              </Box>
              <Typography sx={{ ...slideBodySx('1.05rem', 600), color: '#0f172a' }}>{opt}</Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ ...slideBodySx('0.85rem', 400), color: '#64748b' }}>
          Vote now on stage or drop your choice into live chat.
        </Typography>
      </Box>
    </SlideWrapper>
  );
}
