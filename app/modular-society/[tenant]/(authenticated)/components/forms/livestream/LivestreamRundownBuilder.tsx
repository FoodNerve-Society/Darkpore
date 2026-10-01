'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArticleBlockRenderer } from '@/components/learn/ArticleBlockRenderer';
import { EcosystemJobModal } from '@/components/learn/blocks/EcosystemJobModal';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Avatar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Mic as MicIcon,
  Delete as DeleteIcon,
  AutoAwesome as SparkleIcon,
  MenuBook as BookIcon,
  Work as WorkIcon,
  Flip as FlipIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Layers as LayersIcon,
  Image as ImageIcon,
  AspectRatio as AspectRatioIcon,
  Laptop as DesktopIcon,
  PhoneIphone as MobileIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/system';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DEF_BLOCK_DEFINITIONS, DEF_ACTS, DEF_BLOCKS_ORDER, LIVESTREAM_TYPE_FLOWS } from './defBlocksConfig';
import {
  SlideSpikyTitle,
  SlideMythFact,
  SlideStatCard,
  SlideJob,
  SlideTransition,
  SlideQuote,
  SlideMedia,
  SlideFallback,
  SlideRundownAct,
  SlideAnchorTension,
  SlideReframeQuestion,
  SlideFunnelSystem,
  SlideIdealVsFeasible,
  SlideScaledBurden,
  SlidePowerMap,
  SlideResponseAudit,
  SlideBoundaryTest,
  SlidePreemptObjections,
  SlideReturnToCase,
  SlideForkedClose,
  AdaptiveSlideImage,
  renderSlidePreviewContent,
} from './SlideComponents';

// --- Types ---
export type RundownItem = {
  id: string; // unique instance id for the rundown
  sourceType: 'act' | 'article_block' | 'job' | 'transition' | 'def_block' | 'slide';
  defBlockId?: string; // e.g. 'anchor_tension', 'ideal_vs_feasible'
  defBlockLabel?: string; // e.g. 'Block 4: Ideal vs Feasible'
  slideIndex?: number; // e.g. 1
  slideCount?: number; // e.g. 3
  act?: 'OPEN' | 'MEAT' | 'CLOSE';
  sourceId?: string;
  parentArticleId?: string;
  parentArticleTitle?: string;
  originalBlockType?: string;
  originalContent?: any;
  speakerNotes: string;
  durationStr: string;
};

// Preset duration options for fast tagging
const DURATION_PRESETS = ['15s', '30s', '45s', '1m', '2m', '5m'];

// Aspect ratio choices for media
const ASPECT_RATIO_OPTIONS = [
  { id: '16:9', label: '16:9 Wide' },
  { id: '1:1', label: '1:1 Square' },
  { id: '9:16', label: '9:16 Portrait' },
  { id: 'auto', label: 'Auto' },
];

// ── Format B: Job 2-Slide Progression Decomposition ──
export function decomposeJobIntoSlides(job: any): Partial<RundownItem>[] {
  const orgName = job.organization?.name || job.orgName || 'Ecosystem Partner';
  const orgLogo = job.organization?.logoUrl || job.orgLogo || job.logoUrl;
  const salary = job.salary || job.compensationOrTarget || job.compensation || 'Competitive / Verified Package';
  const location = job.location || 'Remote / Regional Hub';
  const department = job.department || job.track || (Array.isArray(job.tags) && job.tags[0]) || 'Operations';
  const applicationMode = job.applicationMode || 'Apply Live On Stage';

  // Construct full verified careers deep-link
  let fullApplyUrl = job.applicationUrl || job.applyUrl || job.url || job.link || job.ctaLink;
  if (!fullApplyUrl || fullApplyUrl === 'foodnerve.org/careers' || fullApplyUrl === '/careers') {
    fullApplyUrl = job.id && !String(job.id).startsWith('manual-')
      ? `https://foodnerve.org/careers/${job.id}`
      : 'https://foodnerve.org/careers';
  } else if (fullApplyUrl.startsWith('/')) {
    fullApplyUrl = `https://foodnerve.org${fullApplyUrl}`;
  } else if (!fullApplyUrl.startsWith('http://') && !fullApplyUrl.startsWith('https://')) {
    fullApplyUrl = `https://${fullApplyUrl}`;
  }

  return [
    {
      sourceType: 'job',
      sourceId: job.id,
      defBlockId: 'job_opportunity',
      defBlockLabel: 'Job Opportunity & Apply',
      slideIndex: 1,
      slideCount: 1,
      originalBlockType: 'job_opportunity',
      originalContent: {
        id: job.id,
        jobTitle: job.title,
        title: job.title,
        orgName,
        orgLogo,
        salary,
        location,
        department,
        applicationMode,
        applyUrl: fullApplyUrl,
      },
      speakerNotes: `Highlighting this verified ecosystem opportunity: ${job.title} with ${orgName}. Compensation is ${salary}. Apply live on stage at ${fullApplyUrl}.`,
      durationStr: '45s',
    },
  ];
}

// ── Multi-Slide Decomposition for Modular Article Blocks ──
export function decomposeArticleBlockIntoSlides(b: any, parentArticle: any): Partial<RundownItem>[] {
  let parsed: any = {};
  try {
    parsed = typeof b.content === 'string' ? JSON.parse(b.content) : (b.content || {});
  } catch {
    parsed = {};
  }

  const blockType = b.blockType;

  // 1. Protocol / SOP steps -> 1 slide per step
  if (
    blockType === 'protocol_steps' ||
    blockType === 'sop_steps' ||
    blockType === 'workflow_steps' ||
    (Array.isArray(parsed.steps) && parsed.steps.length > 0)
  ) {
    const steps: any[] = Array.isArray(parsed.steps) ? parsed.steps : [];
    if (steps.length > 0) {
      return steps.map((step, idx) => ({
        sourceType: 'article_block',
        sourceId: `${b.id || 'step'}-${idx + 1}`,
        parentArticleId: parentArticle?.id,
        parentArticleTitle: parentArticle?.title,
        originalBlockType: 'protocol_step',
        slideIndex: idx + 1,
        slideCount: steps.length,
        originalContent: {
          stepNumber: idx + 1,
          totalSteps: steps.length,
          stepTitle: step.title || step.stepTitle || `Step ${idx + 1}`,
          action: step.action || step.description || step.text || '',
          owner: step.owner || parsed.owner || 'Lead Operations Controller',
          output: step.output || step.targetOutput || 'Verified Completion Milestone',
        },
        speakerNotes: `Step ${idx + 1} of ${steps.length}: ${step.title || step.stepTitle}. ${step.action || step.description || ''}`,
        durationStr: '45s',
      }));
    }
  }

  // 2. Myth vs. Fact -> 2 slides (Myth Breakdown + Ground Truth & Data)
  if (
    blockType === 'myth_fact' ||
    blockType === 'myth_reality' ||
    (parsed.myth && (parsed.fact || parsed.reality))
  ) {
    return [
      {
        sourceType: 'article_block',
        sourceId: `${b.id || 'myth'}-1`,
        parentArticleId: parentArticle?.id,
        parentArticleTitle: parentArticle?.title,
        originalBlockType: 'myth_slide',
        slideIndex: 1,
        slideCount: 2,
        originalContent: {
          myth: parsed.myth || parsed.text || 'Conventional Industry Assumption',
          context: parsed.context || parsed.subheadline || 'Why standard operating models fall into this trap.',
        },
        speakerNotes: `Let us address the conventional industry myth: ${parsed.myth || ''}`,
        durationStr: '45s',
      },
      {
        sourceType: 'article_block',
        sourceId: `${b.id || 'fact'}-2`,
        parentArticleId: parentArticle?.id,
        parentArticleTitle: parentArticle?.title,
        originalBlockType: 'fact_slide',
        slideIndex: 2,
        slideCount: 2,
        originalContent: {
          fact: parsed.fact || parsed.reality || 'The ground truth revealed by field data.',
          stat: parsed.stat || 'Field Verified',
          proof: parsed.proof || parsed.evidence || parsed.subheadline || 'Direct field measurements confirming operational advantage.',
        },
        speakerNotes: `Now, here is the empirical ground truth: ${parsed.fact || parsed.reality || ''}`,
        durationStr: '45s',
      },
    ];
  }

  // 3. Comparison Matrix -> 1 slide per Option + 1 slide for Verdict
  if (
    blockType === 'comparison_matrix' ||
    blockType === 'comparison_table' ||
    Array.isArray(parsed.options)
  ) {
    const options: any[] = Array.isArray(parsed.options) ? parsed.options : [];
    if (options.length > 0) {
      const hasVerdict = Boolean(parsed.verdict || parsed.recommendation || parsed.winner);
      const total = options.length + (hasVerdict ? 1 : 0);
      const optionSlides: Partial<RundownItem>[] = options.map((opt, idx) => ({
        sourceType: 'article_block',
        sourceId: `${b.id || 'cmp'}-opt-${idx + 1}`,
        parentArticleId: parentArticle?.id,
        parentArticleTitle: parentArticle?.title,
        originalBlockType: 'comparison_option',
        slideIndex: idx + 1,
        slideCount: total,
        originalContent: {
          title: opt.name || opt.title || `Option ${idx + 1}`,
          subtitle: opt.subtitle || opt.category || 'Strategic Pathway',
          pros: opt.pros || [],
          cons: opt.cons || [],
          verdict: opt.summary || opt.description || '',
          isRecommended: Boolean(opt.recommended || opt.isWinner),
        },
        speakerNotes: `Option ${idx + 1}: ${opt.name || opt.title}. Pros and trade-offs.`,
        durationStr: '45s',
      }));

      if (hasVerdict) {
        optionSlides.push({
          sourceType: 'article_block',
          sourceId: `${b.id || 'cmp'}-verdict`,
          parentArticleId: parentArticle?.id,
          parentArticleTitle: parentArticle?.title,
          originalBlockType: 'comparison_verdict',
          slideIndex: total,
          slideCount: total,
          originalContent: {
            title: parsed.verdictTitle || 'Strategic Recommendation & Verdict',
            winnerName: parsed.recommendedOption || parsed.winner || 'Recommended Architecture',
            justification: parsed.verdict || parsed.recommendation || 'The quantitative model demonstrates superior ROI and resilience.',
            roiScore: parsed.roiScore || '3.4x Capital Efficiency',
          },
          speakerNotes: `The verdict: ${parsed.winner || 'our recommendation'}. ${parsed.verdict || ''}`,
          durationStr: '45s',
        });
      }

      return optionSlides;
    }
  }

  // 4. Timeline Milestones -> 1 slide per milestone
  if (
    blockType === 'timeline_tracker' ||
    blockType === 'milestones' ||
    (Array.isArray(parsed.milestones) && parsed.milestones.length > 0)
  ) {
    const milestones: any[] = Array.isArray(parsed.milestones) ? parsed.milestones : [];
    if (milestones.length > 0) {
      return milestones.map((m, idx) => ({
        sourceType: 'article_block',
        sourceId: `${b.id || 'tl'}-${idx + 1}`,
        parentArticleId: parentArticle?.id,
        parentArticleTitle: parentArticle?.title,
        originalBlockType: 'timeline_milestone',
        slideIndex: idx + 1,
        slideCount: milestones.length,
        originalContent: {
          milestoneNumber: idx + 1,
          totalMilestones: milestones.length,
          phaseOrYear: m.phase || m.year || m.date || `Phase ${idx + 1}`,
          title: m.title || `Milestone ${idx + 1}`,
          description: m.description || m.text || '',
          status: m.status || 'Active Target',
        },
        speakerNotes: `Phase ${m.phase || idx + 1}: ${m.title}. ${m.description || ''}`,
        durationStr: '45s',
      }));
    }
  }

  // 5. Single Blocks mapped directly to their specialized slide type
  let targetBlockType = blockType || 'slide';
  if (blockType === 'summary' || blockType === 'exec_summary') targetBlockType = 'exec_summary';
  if (blockType === 'financials' || blockType === 'unit_economics') targetBlockType = 'unit_economics';
  if (blockType === 'persona' || blockType === 'persona_dossier') targetBlockType = 'persona_dossier';
  if (blockType === 'directive' || blockType === 'strategic_directive' || blockType === 'action_checklist') targetBlockType = 'strategic_directive';
  if (blockType === 'cta' || blockType === 'call_to_action') targetBlockType = 'call_to_action';
  if (blockType === 'poll' || blockType === 'live_poll' || blockType === 'quick_poll' || blockType === 'survey') targetBlockType = 'live_poll';

  return [
    {
      sourceType: 'article_block',
      sourceId: b.id,
      parentArticleId: parentArticle?.id,
      parentArticleTitle: parentArticle?.title,
      originalBlockType: targetBlockType,
      originalContent: parsed,
      speakerNotes: parsed.notes || parsed.speakerNotes || `Discussing: ${parsed.title || parsed.text || targetBlockType}`,
      durationStr: '45s',
    },
  ];
}

// --- Sortable Item Wrapper (Compact Flippable Card with Block-Tailored Inputs) ---
function SortableRundownCard({
  item,
  index,
  actNumber,
  onUpdate,
  onRemove,
  onPreviewSlide,
}: {
  item: RundownItem;
  index: number;
  actNumber?: number;
  onUpdate: (id: string, updates: Partial<RundownItem>) => void;
  onRemove: (id: string) => void;
  onPreviewSlide: (item: RundownItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [isFlipped, setIsFlipped] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  const isAct = item.sourceType === 'act' || item.originalBlockType === 'rundown_act' || Boolean(item.originalContent?.role);
  const isJob = item.sourceType === 'job' || item.defBlockId === 'talent_spotlight' || Boolean(item.originalContent?.jobTitle);
  const isTransition = item.sourceType === 'transition' && !isAct;

  const defBlock = item.defBlockId ? DEF_BLOCK_DEFINITIONS[item.defBlockId] : null;

  // Theme color for glassmorphic borders and tags
  const themeColor = defBlock
    ? defBlock.themeColor
    : isAct
    ? '#10b981'
    : isJob
    ? '#f59e0b'
    : isTransition
    ? '#64748b'
    : '#3b82f6';

  // Chip label calculation
  const chipLabel = useMemo(() => {
    if (defBlock) {
      const slidePart = item.slideIndex ? ` · Slide ${item.slideIndex}${item.slideCount ? `/${item.slideCount}` : ''}` : '';
      return `Block ${defBlock.blockNumber}: ${defBlock.name}${slidePart}`;
    }
    if (isAct) return actNumber ? `ACT ${actNumber}: THE OPEN` : 'BROADCAST ACT';
    if (item.originalBlockType === 'job_opportunity') return 'JOB: OPPORTUNITY & COMP';
    if (item.originalBlockType === 'job_execution') return 'JOB: EXECUTION & APPLY';
    if (isJob) return 'HIRING SPOTLIGHT';
    if (item.originalBlockType === 'protocol_step') {
      return `SOP STEP ${item.slideIndex || 1}${item.slideCount ? `/${item.slideCount}` : ''}`;
    }
    if (item.originalBlockType === 'myth_slide') return 'MYTH BREAKDOWN';
    if (item.originalBlockType === 'fact_slide') return 'GROUND TRUTH & DATA';
    if (item.originalBlockType === 'comparison_option') {
      return `OPTION ${item.slideIndex || 1}${item.slideCount ? `/${item.slideCount}` : ''}`;
    }
    if (item.originalBlockType === 'comparison_verdict') return 'STRATEGIC VERDICT';
    if (item.originalBlockType === 'timeline_milestone') {
      return `MILESTONE ${item.slideIndex || 1}${item.slideCount ? `/${item.slideCount}` : ''}`;
    }
    if (item.originalBlockType === 'exec_summary') return 'EXECUTIVE SUMMARY';
    if (item.originalBlockType === 'unit_economics') return 'UNIT ECONOMICS';
    if (item.originalBlockType === 'persona_dossier') return 'PERSONA DOSSIER';
    if (item.originalBlockType === 'strategic_directive') return 'STRATEGIC DIRECTIVE';
    if (item.originalBlockType === 'call_to_action') return 'CALL TO ACTION';
    if (item.originalBlockType === 'live_poll') return 'LIVE POLL';
    if (isTransition) return 'INTERMISSION / CUE';
    if (item.parentArticleTitle) return `Article: ${item.parentArticleTitle}`;
    return item.originalBlockType?.replace('_', ' ').toUpperCase() || 'SLIDE BLOCK';
  }, [defBlock, item, isAct, isJob, isTransition, actNumber]);

  // Content helper
  const c = item.originalContent || {};

  // Front snippet context pill based on block type
  const renderFrontSnippetPill = () => {
    if (item.defBlockId === 'anchor_tension') {
      return (
        <Chip
          size="small"
          label={c.stat || '₦340B Lost'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}
        />
      );
    }
    if (item.defBlockId === 'funnel_system') {
      return (
        <Chip
          size="small"
          label="Field → Corridor → Policy"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}
        />
      );
    }
    if (item.defBlockId === 'ideal_vs_feasible') {
      return (
        <Chip
          size="small"
          label="Dream vs Fracture vs Fix"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed' }}
        />
      );
    }
    if (item.defBlockId === 'scaled_burden') {
      return (
        <Chip
          size="small"
          label={c.stat || '2.4M Tons'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900, bgcolor: 'rgba(236, 72, 153, 0.1)', color: '#db2777' }}
        />
      );
    }
    if (item.defBlockId === 'power_map') {
      return (
        <Chip
          size="small"
          label="Deciders / Enforcers / Payers"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#0284c7' }}
        />
      );
    }
    if (item.defBlockId === 'response_audit') {
      return (
        <Chip
          size="small"
          label="Status Quo vs Solution"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
        />
      );
    }
    if (item.defBlockId === 'boundary_test') {
      return (
        <Chip
          size="small"
          label="4-Gate Verification"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}
        />
      );
    }
    if (item.defBlockId === 'preempt_objections') {
      return (
        <Chip
          size="small"
          label="Skeptic Voice & Disproof"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}
        />
      );
    }
    if (item.defBlockId === 'forked_close') {
      return (
        <Chip
          size="small"
          label="Path A vs Path B"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(124, 58, 237, 0.1)', color: '#6d28d9' }}
        />
      );
    }
    if (item.originalBlockType === 'job_opportunity') {
      return (
        <Chip
          size="small"
          label={c.salary || 'Compensation'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#b45309' }}
        />
      );
    }
    if (item.originalBlockType === 'job_execution') {
      return (
        <Chip
          size="small"
          label="Execution & Apply"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
        />
      );
    }
    if (item.originalBlockType === 'protocol_step') {
      return (
        <Chip
          size="small"
          label={c.owner || 'Execution Directive'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}
        />
      );
    }
    if (item.originalBlockType === 'myth_slide') {
      return (
        <Chip
          size="small"
          label="Conventional Myth"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}
        />
      );
    }
    if (item.originalBlockType === 'fact_slide') {
      return (
        <Chip
          size="small"
          label={c.stat || 'Ground Truth'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
        />
      );
    }
    if (item.originalBlockType === 'comparison_option') {
      return (
        <Chip
          size="small"
          label={c.subtitle || 'Comparison Option'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}
        />
      );
    }
    if (item.originalBlockType === 'comparison_verdict') {
      return (
        <Chip
          size="small"
          label={c.roiScore || 'Final Verdict'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900, bgcolor: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}
        />
      );
    }
    if (item.originalBlockType === 'timeline_milestone') {
      return (
        <Chip
          size="small"
          label={c.phaseOrYear || 'Milestone'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#0284c7' }}
        />
      );
    }
    if (isJob) {
      return (
        <Chip
          size="small"
          label={c.salary || c.compensationOrTarget || 'Verified Role'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#b45309' }}
        />
      );
    }
    if (c.imageUrl) {
      return (
        <Chip
          size="small"
          icon={<ImageIcon sx={{ fontSize: '0.75rem !important' }} />}
          label={c.aspectRatio || 'Image'}
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: '#f1f5f9', color: '#475569' }}
        />
      );
    }
    return null;
  };

  // Headline snippet calculation
  const headlineText = useMemo(() => {
    return (
      c.title ||
      c.text ||
      c.role ||
      c.jobTitle ||
      c.headline ||
      (c.stat ? `${c.stat}: ${c.label || ''}` : '') ||
      (c.myth ? `Myth: ${c.myth}` : '') ||
      (c.quote ? `"${c.quote}"` : '') ||
      'Untitled Slide'
    );
  }, [c]);

  // Update specific content property
  const updateContent = (fields: Record<string, any>) => {
    onUpdate(item.id, {
      originalContent: {
        ...(item.originalContent || {}),
        ...fields,
      },
    });
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 2, perspective: '1600px', ...(isDragging ? { opacity: 0.65 } : {}) }}>
      <Box
        sx={{
          position: 'relative',
          transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateX(-180deg)' : 'none',
        }}
      >
        {/* ── FRONT: COMPACT ARTICLE-STYLE STRIP (~68px) ── */}
        <Box
          sx={{
            backfaceVisibility: 'hidden',
            position: isFlipped ? 'absolute' : 'relative',
            width: '100%',
            top: 0,
            borderRadius: '16px',
            px: { xs: 1.75, sm: 2.25 },
            py: 1.5,
            minHeight: 68,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${alpha(themeColor, 0.28)}`,
            boxShadow: `0 4px 20px -2px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              borderColor: alpha(themeColor, 0.55),
              boxShadow: `0 8px 24px rgba(15, 23, 42, 0.08)`,
              transform: 'translateY(-1px)',
            },
          }}
        >
          {/* Drag Handle */}
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              borderRadius: '8px',
              p: 0.5,
              transition: 'all 0.15s ease',
              '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: 20 }} />
          </Box>

          {/* Identifier Tag Chip */}
          <Chip
            size="small"
            icon={<LayersIcon sx={{ fontSize: '0.85rem !important' }} />}
            label={chipLabel}
            sx={{
              bgcolor: alpha(themeColor, 0.12),
              color: themeColor,
              fontWeight: 800,
              fontSize: '0.72rem',
              borderRadius: '8px',
              maxWidth: { xs: 140, sm: 220 },
              '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
            }}
          />

          {/* Context Snippet Pill */}
          {renderFrontSnippetPill()}

          {/* Center: Slide Headline / Claim Snippet */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.88rem',
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {headlineText}
            </Typography>
          </Box>

          {/* Right Action Elements */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {/* Duration Badge */}
            <Chip
              size="small"
              icon={<AccessTimeIcon sx={{ fontSize: '0.8rem !important' }} />}
              label={item.durationStr || '30s'}
              sx={{
                bgcolor: '#f1f5f9',
                color: '#475569',
                fontWeight: 800,
                fontSize: '0.72rem',
                height: 26,
                borderRadius: '6px',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />

            {/* Preview Slide Modal Trigger */}
            <Tooltip title="Preview Slide (16:9 Modal)">
              <Button
                size="small"
                variant="outlined"
                startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem !important' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewSlide(item);
                }}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  bgcolor: '#ffffff',
                  py: 0.35,
                  px: 1.25,
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                }}
              >
                Preview
              </Button>
            </Tooltip>

            {/* Edit / Flip Trigger */}
            <Tooltip title="Edit Slide Inputs">
              <Button
                size="small"
                variant="contained"
                startIcon={<FlipIcon sx={{ fontSize: '0.85rem !important' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                  textTransform: 'none',
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  py: 0.35,
                  px: 1.25,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                Edit / Flip
              </Button>
            </Tooltip>

            {/* Remove Slide */}
            <Tooltip title="Remove item">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                sx={{
                  color: '#94a3b8',
                  '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── BACK: FOCUSED TAILORED FORM FOR THIS SPECIFIC SLIDE ── */}
        <Box
          sx={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
            position: isFlipped ? 'relative' : 'absolute',
            width: '100%',
            top: 0,
            borderRadius: '20px',
            p: { xs: 2.25, sm: 3 },
            bgcolor: '#ffffff',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${alpha(themeColor, 0.35)}`,
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Header Bar with Chip & Done & Flip Back Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.25, borderBottom: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                label={chipLabel}
                sx={{ bgcolor: alpha(themeColor, 0.12), color: themeColor, fontWeight: 900, fontSize: '0.74rem' }}
              />
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                Configure {defBlock?.name || 'Slide'}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              startIcon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important' }} />}
              onClick={() => setIsFlipped(false)}
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.75rem',
                borderRadius: '8px',
                textTransform: 'none',
                py: 0.45,
                px: 1.75,
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              Done & Flip Back
            </Button>
          </Box>

          {/* ── TAILORED FORM FIELDS BY BLOCK TYPE ── */}

          {/* 1. Anchor Tension */}
          {item.defBlockId === 'anchor_tension' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Crisis Reality Headline"
                placeholder="e.g. Field Crisis Snapshot: The Ground Disconnect"
                value={c.title || c.text || ''}
                onChange={(e) => updateContent({ title: e.target.value, text: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  sx={{ width: '38%' }}
                  size="small"
                  label="Tension Metric / Stat"
                  placeholder="e.g. ₦340B Lost"
                  value={c.stat || ''}
                  onChange={(e) => updateContent({ stat: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Stat Scope / Citation"
                  placeholder="e.g. Capital evaporated between farm gate and off-taker"
                  value={c.subheadline || c.label || ''}
                  onChange={(e) => updateContent({ subheadline: e.target.value, label: e.target.value })}
                />
              </Box>
              {/* Image & Aspect Ratio Section */}
              <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <ImageIcon sx={{ fontSize: 16 }} /> Crisis Photo / Evidence URL & Aspect Ratio
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="https://... photo or field report image URL"
                  value={c.imageUrl || ''}
                  onChange={(e) => updateContent({ imageUrl: e.target.value })}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Styling:</Typography>
                  {ASPECT_RATIO_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.id}
                      size="small"
                      label={opt.label}
                      onClick={() => updateContent({ aspectRatio: opt.id })}
                      sx={{
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        bgcolor: (c.aspectRatio || '1:1') === opt.id ? '#0f172a' : '#ffffff',
                        color: (c.aspectRatio || '1:1') === opt.id ? '#ffffff' : '#475569',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* 2. Reframe Question */}
          {item.defBlockId === 'reframe_question' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="The Spiky Pivot Question"
                placeholder="e.g. What if the barrier isn’t seed access, but spatial land tenure?"
                value={c.title || c.text || ''}
                onChange={(e) => updateContent({ title: e.target.value, text: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="The Conventional Belief Being Rejected (Strikethrough)"
                placeholder="e.g. 'Just give farmers more seed subsidies and yields will triple'"
                value={c.convention || ''}
                onChange={(e) => updateContent({ convention: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Strategic Shift / Takeaway"
                placeholder="e.g. Pivoting from the symptom to the structural lock."
                value={c.subheadline || ''}
                onChange={(e) => updateContent({ subheadline: e.target.value })}
              />
            </Box>
          )}

          {/* 3. Funnel System */}
          {item.defBlockId === 'funnel_system' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Diagnostic Overview Title"
                placeholder="e.g. Layered Diagnostic: Tracing the Root Friction"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Layer 1: Immediate Field Symptom"
                placeholder="e.g. Spoilage at aggregation centers within 48 hours"
                value={c.layer1 || ''}
                onChange={(e) => updateContent({ layer1: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Layer 2: Logistics & Highway Friction"
                placeholder="e.g. Reefer trucks hit 14 informal checkpoints along corridor"
                value={c.layer2 || ''}
                onChange={(e) => updateContent({ layer2: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Layer 3: Structural Policy Lock"
                placeholder="e.g. Without titled rights, infrastructure cannot be bonded or insured"
                value={c.layer3 || ''}
                onChange={(e) => updateContent({ layer3: e.target.value })}
              />
            </Box>
          )}

          {/* 4. Ideal vs Feasible */}
          {item.defBlockId === 'ideal_vs_feasible' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Slide Title"
                placeholder="e.g. Ideal vs. Feasible: Why Generic Fixes Fail"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="The NGO Dream (The Superficial Proposal)"
                placeholder="e.g. Just install solar cold hubs everywhere"
                value={c.ngoDream || c.myth || ''}
                onChange={(e) => updateContent({ ngoDream: e.target.value, myth: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="The Ground Fracture (Where it Breaks)"
                placeholder="e.g. Inverters stolen within 6 months, fuel tariffs spike"
                value={c.fracturePoint || ''}
                onChange={(e) => updateContent({ fracturePoint: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="The Feasible Operator Workaround"
                placeholder="e.g. Decentralized dry aggregation, moisture barrier bags, scheduled night rails"
                value={c.feasibleFix || c.fact || ''}
                onChange={(e) => updateContent({ feasibleFix: e.target.value, fact: e.target.value })}
              />
            </Box>
          )}

          {/* 5. Scaled Burden */}
          {item.defBlockId === 'scaled_burden' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Macro Loss Headline"
                placeholder="e.g. Annual Perishable Crop Loss Across The Belt"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  sx={{ width: '40%' }}
                  size="small"
                  label="Big Stat Numeral"
                  placeholder="e.g. 2.4M Tons or ₦340B"
                  value={c.stat || ''}
                  onChange={(e) => updateContent({ stat: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Stat Scope Label"
                  placeholder="e.g. Total perishable tonnage evaporated"
                  value={c.label || ''}
                  onChange={(e) => updateContent({ label: e.target.value })}
                />
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Who Absorbs The Loss"
                placeholder="e.g. Smallholders absorb -8% margins while consumers pay 3x premiums"
                value={c.absorption || c.subheadline || ''}
                onChange={(e) => updateContent({ absorption: e.target.value, subheadline: e.target.value })}
              />
              {/* Optional Chart/Image */}
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Optional Chart / Graph URL"
                  value={c.imageUrl || ''}
                  onChange={(e) => updateContent({ imageUrl: e.target.value })}
                />
                <Chip
                  size="small"
                  label={c.aspectRatio || '1:1'}
                  onClick={() => updateContent({ aspectRatio: (c.aspectRatio === '16:9' ? '1:1' : '16:9') })}
                  sx={{ cursor: 'pointer', fontWeight: 800 }}
                />
              </Box>
            </Box>
          )}

          {/* 6. Power Map */}
          {item.defBlockId === 'power_map' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Power Map Headline"
                placeholder="e.g. Power Map: Deciders, Enforcers & Payers"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="🏛️ The Deciders (Regulators & Boards)"
                placeholder="e.g. Federal Export Boards & State Port Councils"
                value={c.deciders || ''}
                onChange={(e) => updateContent({ deciders: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="⚖️ The Enforcers (Cartels & Middlemen)"
                placeholder="e.g. Market Middlemen & Transport Unions"
                value={c.enforcers || ''}
                onChange={(e) => updateContent({ enforcers: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="💸 The Payers (Processors & Plants)"
                placeholder="e.g. Downstream Processing Plants Operating at 30% Capacity"
                value={c.payers || ''}
                onChange={(e) => updateContent({ payers: e.target.value })}
              />
            </Box>
          )}

          {/* 7. Response Audit */}
          {item.defBlockId === 'response_audit' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Response Audit Headline"
                placeholder="e.g. Response Audit: Status Quo vs. What Actually Works"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="What The Industry Keeps Doing (Status Quo Failure)"
                placeholder="e.g. Subsidized Input Handouts (₦40B spent with 0% margin lift)"
                value={c.statusQuo || ''}
                onChange={(e) => updateContent({ statusQuo: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="What Actually Moves The Needle"
                  placeholder="e.g. Forward Contract Clearing Houses"
                  value={c.provenMove || ''}
                  onChange={(e) => updateContent({ provenMove: e.target.value })}
                />
                <TextField
                  sx={{ width: '35%' }}
                  size="small"
                  label="Measured Gain"
                  placeholder="e.g. +34% Net Margin"
                  value={c.metricGain || ''}
                  onChange={(e) => updateContent({ metricGain: e.target.value })}
                />
              </Box>
            </Box>
          )}

          {/* 8. Boundary Test */}
          {item.defBlockId === 'boundary_test' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                label="Boundary Test Title"
                placeholder="e.g. Boundary Test: 4 Non-Negotiable Gateways"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <TextField
                  size="small"
                  label="Gate 1: Regulatory Pathway"
                  placeholder="e.g. Operates within existing state gazettes"
                  value={c.gate1 || ''}
                  onChange={(e) => updateContent({ gate1: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Gate 2: Scale Velocity"
                  placeholder="e.g. Can expand along corridor"
                  value={c.gate2 || ''}
                  onChange={(e) => updateContent({ gate2: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Gate 3: Exact Intervention Point"
                  placeholder="e.g. Bonded aggregation hub"
                  value={c.gate3 || ''}
                  onChange={(e) => updateContent({ gate3: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Gate 4: 90-Day Target KPI"
                  placeholder="e.g. 500 Tons Cleared by Q3"
                  value={c.gate4 || ''}
                  onChange={(e) => updateContent({ gate4: e.target.value })}
                />
              </Box>
            </Box>
          )}

          {/* 9. Preempt Objections */}
          {item.defBlockId === 'preempt_objections' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="The Skeptic's Objection (Voiced from Chat)"
                placeholder="e.g. Farmers will default and side-sell as soon as open market prices spike"
                value={c.skepticQuote || c.quote || ''}
                onChange={(e) => updateContent({ skepticQuote: e.target.value, quote: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  sx={{ width: '35%' }}
                  size="small"
                  label="Proof Stat Numeral"
                  placeholder="e.g. 94.2% Honor Rate"
                  value={c.stat || ''}
                  onChange={(e) => updateContent({ stat: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Empirical Disproof Data"
                  placeholder="e.g. Input escrow and milestone payouts eliminate side-selling"
                  value={c.disproofData || ''}
                  onChange={(e) => updateContent({ disproofData: e.target.value })}
                />
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Citation / Historical Cohort Source"
                placeholder="e.g. 2024 Northern Maize Corridor pilot data"
                value={c.citation || ''}
                onChange={(e) => updateContent({ citation: e.target.value })}
              />
            </Box>
          )}

          {/* 10. Return to Case */}
          {item.defBlockId === 'return_to_case' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Case Re-evaluation Headline"
                placeholder="e.g. Re-evaluating the Opening Case: A Solved Equation"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Proven Operational Transformation"
                placeholder="e.g. From unquantifiable risk to an engineered, insured supply chain."
                value={c.subheadline || ''}
                onChange={(e) => updateContent({ subheadline: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                placeholder="Image URL (optional before/after comparison)"
                value={c.imageUrl || ''}
                onChange={(e) => updateContent({ imageUrl: e.target.value })}
              />
            </Box>
          )}

          {/* 11. Forked Close */}
          {item.defBlockId === 'forked_close' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Fork Title"
                placeholder="e.g. Two Diverging Futures: The Operational Choice"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Path A: Status Quo Bleed"
                placeholder="e.g. Status Quo Bleed — ₦850K Lost Per Day in Avoidable Shrinkage"
                value={c.pathACost || ''}
                onChange={(e) => updateContent({ pathACost: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Path B: Scaled Action ROI"
                placeholder="e.g. Corridor Deployment — 3.2x Capital Return in 18 Months"
                value={c.pathBROI || ''}
                onChange={(e) => updateContent({ pathBROI: e.target.value })}
              />
            </Box>
          )}

          {/* 12. Talent Spotlight / Jobs (Format B: Opportunity vs Execution) */}
          {item.originalBlockType === 'job_execution' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Role Title (Execution Mandate)"
                value={c.jobTitle || c.title || ''}
                onChange={(e) => updateContent({ jobTitle: e.target.value, title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Execution Scope & Responsibilities"
                placeholder="Key deliverables and operational scope..."
                value={c.roleScope || ''}
                onChange={(e) => updateContent({ roleScope: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Prerequisites / Qualification Standard"
                placeholder="e.g. Verified profile on FoodNerve platform"
                value={c.prerequisites || ''}
                onChange={(e) => updateContent({ prerequisites: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Direct Application URL / CTA Link"
                placeholder="https://..."
                value={c.applyUrl || ''}
                onChange={(e) => updateContent({ applyUrl: e.target.value })}
              />
            </Box>
          )}

          {(item.originalBlockType === 'job_opportunity' || item.defBlockId === 'talent_spotlight' || (isJob && item.originalBlockType !== 'job_execution')) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Opportunity / Role Title"
                placeholder="e.g. Lead Logistics Operator — Northern Corridor"
                value={c.jobTitle || c.title || ''}
                onChange={(e) => updateContent({ jobTitle: e.target.value, title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Hiring Organization"
                  placeholder="e.g. FoodNerve Rail Logistics Hub"
                  value={c.orgName || ''}
                  onChange={(e) => updateContent({ orgName: e.target.value })}
                />
                <TextField
                  sx={{ width: '45%' }}
                  size="small"
                  label="Compensation / Package"
                  placeholder="e.g. $45k - $60k + Equity"
                  value={c.salary || c.compensationOrTarget || ''}
                  onChange={(e) => updateContent({ salary: e.target.value, compensationOrTarget: e.target.value })}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Location"
                  placeholder="e.g. Remote / Northern Corridor Hub"
                  value={c.location || ''}
                  onChange={(e) => updateContent({ location: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Application URL"
                  placeholder="e.g. https://foodnerve.org/talent/apply/123"
                  value={c.applyUrl || c.ctaLink || ''}
                  onChange={(e) => updateContent({ applyUrl: e.target.value, ctaLink: e.target.value })}
                />
              </Box>
            </Box>
          )}

          {/* 13. Protocol Step Slide */}
          {item.originalBlockType === 'protocol_step' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Step Title"
                placeholder="e.g. Calibrate Spatial Moisture Sensors"
                value={c.stepTitle || c.title || ''}
                onChange={(e) => updateContent({ stepTitle: e.target.value, title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Execution Action / Directive"
                placeholder="Describe the action in detail..."
                value={c.action || c.description || c.text || ''}
                onChange={(e) => updateContent({ action: e.target.value, description: e.target.value, text: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Assigned Operator"
                  placeholder="e.g. Lead Logistics Controller"
                  value={c.owner || ''}
                  onChange={(e) => updateContent({ owner: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Target Deliverable / Output"
                  placeholder="e.g. Verified Ingestion Ticket"
                  value={c.output || ''}
                  onChange={(e) => updateContent({ output: e.target.value })}
                />
              </Box>
            </Box>
          )}

          {/* 14. Myth Slide */}
          {item.originalBlockType === 'myth_slide' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="The Conventional Myth / Misconception"
                placeholder="The industry assumption..."
                value={c.myth || c.text || ''}
                onChange={(e) => updateContent({ myth: e.target.value, text: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Context / Narrative Breakdown"
                placeholder="Why standard models fall for this..."
                value={c.context || c.subheadline || ''}
                onChange={(e) => updateContent({ context: e.target.value, subheadline: e.target.value })}
              />
            </Box>
          )}

          {/* 15. Fact Slide */}
          {item.originalBlockType === 'fact_slide' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Ground Truth / Operator Reality"
                placeholder="The verified fact..."
                value={c.fact || c.reality || ''}
                onChange={(e) => updateContent({ fact: e.target.value, reality: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  sx={{ width: '40%' }}
                  size="small"
                  label="Key Metric / Stat"
                  placeholder="e.g. 98.4% Retention"
                  value={c.stat || ''}
                  onChange={(e) => updateContent({ stat: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Empirical Proof Data"
                  placeholder="Field evidence summary..."
                  value={c.proof || c.subheadline || ''}
                  onChange={(e) => updateContent({ proof: e.target.value, subheadline: e.target.value })}
                />
              </Box>
            </Box>
          )}

          {/* 16. Comparison Option */}
          {item.originalBlockType === 'comparison_option' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Option / Model Name"
                placeholder="e.g. Option A: Decentralized Storage Hubs"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Subtitle / Classification"
                placeholder="e.g. Capital-light corridor pathway"
                value={c.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Verdict / Trade-off Summary"
                placeholder="Analysis of this option..."
                value={c.verdict || ''}
                onChange={(e) => updateContent({ verdict: e.target.value })}
              />
            </Box>
          )}

          {/* 17. Comparison Verdict */}
          {item.originalBlockType === 'comparison_verdict' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Verdict Title"
                placeholder="e.g. Strategic Recommendation & Verdict"
                value={c.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Recommended Architecture / Winner"
                  placeholder="e.g. Northern Hybrid Corridor"
                  value={c.winnerName || ''}
                  onChange={(e) => updateContent({ winnerName: e.target.value })}
                />
                <TextField
                  sx={{ width: '40%' }}
                  size="small"
                  label="ROI Score / Advantage"
                  placeholder="e.g. 3.4x Capital Efficiency"
                  value={c.roiScore || ''}
                  onChange={(e) => updateContent({ roiScore: e.target.value })}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Justification & Final Conclusion"
                placeholder="Why this model succeeds where others fail..."
                value={c.justification || ''}
                onChange={(e) => updateContent({ justification: e.target.value })}
              />
            </Box>
          )}

          {/* 18. Timeline Milestone */}
          {item.originalBlockType === 'timeline_milestone' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  size="small"
                  label="Phase / Year"
                  placeholder="e.g. Phase 01: Q2 2026"
                  value={c.phaseOrYear || ''}
                  onChange={(e) => updateContent({ phaseOrYear: e.target.value })}
                  sx={{ width: '40%', '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Milestone Title"
                  placeholder="e.g. Grid Ingestion Calibration"
                  value={c.title || ''}
                  onChange={(e) => updateContent({ title: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Milestone Scope / Action"
                placeholder="Deployment details..."
                value={c.description || ''}
                onChange={(e) => updateContent({ description: e.target.value })}
              />
            </Box>
          )}

          {/* Fallback for regular article blocks or generic slides */}
          {!item.defBlockId && !isJob && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                label="Slide Headline / Main Claim"
                placeholder="Enter punchy slide claim..."
                value={c.title || c.text || c.role || ''}
                onChange={(e) => updateContent({ title: e.target.value, text: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
              {item.originalBlockType === 'highlight_card' ? (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    sx={{ width: '40%' }}
                    size="small"
                    label="Callout Stat / Value"
                    placeholder="e.g. ₦340B Lost"
                    value={c.stat || ''}
                    onChange={(e) => updateContent({ stat: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Stat Label / Context"
                    placeholder="e.g. Capital evaporated"
                    value={c.label || c.subheadline || ''}
                    onChange={(e) => updateContent({ label: e.target.value, subheadline: e.target.value })}
                  />
                </Box>
              ) : item.originalBlockType === 'myth_fact' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="The Myth"
                    placeholder="The conventional belief..."
                    value={c.myth || ''}
                    onChange={(e) => updateContent({ myth: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Ground Truth"
                    placeholder="The operator reality..."
                    value={c.fact || ''}
                    onChange={(e) => updateContent({ fact: e.target.value })}
                  />
                </Box>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label="Subheadline / Context Description"
                  placeholder="Context or secondary explanation for this slide..."
                  value={c.subheadline || c.description || c.desc || ''}
                  onChange={(e) => updateContent({ subheadline: e.target.value, description: e.target.value, desc: e.target.value })}
                />
              )}
            </Box>
          )}

          {/* Host Teleprompter / Speaker Notes Box (Present on all blocks) */}
          <Box
            sx={{
              bgcolor: '#fefce8',
              borderRadius: '12px',
              p: 1.25,
              border: '1.5px solid rgba(254, 240, 138, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
            }}
          >
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <MicIcon sx={{ fontSize: 15 }} /> Presenter Teleprompter (1–2 punchy spoken lines)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              placeholder="What to speak aloud during this slide (visible backstage)..."
              value={item.speakerNotes}
              onChange={(e) => onUpdate(item.id, { speakerNotes: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                  fontSize: '0.82rem',
                },
              }}
            />
          </Box>

          {/* Duration Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Pacing:
              </Typography>
              {DURATION_PRESETS.map((preset) => {
                const isSelected = item.durationStr === preset || item.durationStr.includes(preset);
                return (
                  <Chip
                    key={preset}
                    label={preset}
                    size="small"
                    onClick={() => onUpdate(item.id, { durationStr: preset })}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      height: 24,
                      borderRadius: '6px',
                      bgcolor: isSelected ? '#0f172a' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#475569',
                      '&:hover': { bgcolor: isSelected ? '#0f172a' : '#e2e8f0' },
                    }}
                  />
                );
              })}
            </Box>

            <TextField
              size="small"
              placeholder="e.g. 45s"
              value={item.durationStr}
              onChange={(e) => onUpdate(item.id, { durationStr: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: 110,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  height: 30,
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// --- Main Builder Component ---
export default function LivestreamRundownBuilder({
  postingAs,
  selectedOrgId,
  initialBlocks = [],
  onBlocksChange,
  contentPool,
  guidingArticles = [],
  guidingJobs = [],
  guidingListings = [],
  guidingCampaigns = [],
  hubColor = '#10b981',
}: {
  postingAs: string;
  selectedOrgId: string | null;
  initialBlocks?: any[];
  onBlocksChange: (blocks: any[]) => void;
  contentPool: { articles: any[]; jobs: any[] } | null;
  guidingArticles?: any[];
  guidingJobs?: any[];
  guidingListings?: any[];
  guidingCampaigns?: any[];
  hubColor?: string;
}) {
  const [rundown, setRundown] = useState<RundownItem[]>(initialBlocks);
  const [previewArticle, setPreviewArticle] = useState<any | null>(null);
  const [previewJob, setPreviewJob] = useState<any | null>(null);
  const [selectedArticleForBlocks, setSelectedArticleForBlocks] = useState<any | null>(null);
  const [articleModalAspect, setArticleModalAspect] = useState<'16:9' | '9:16'>('16:9');
  const [previewSlideItem, setPreviewSlideItem] = useState<RundownItem | null>(null);
  const [singlePreviewAspect, setSinglePreviewAspect] = useState<'16:9' | '9:16'>('16:9');

  const addDEFBlockToRundown = (blockId: string) => {
    const def = DEF_BLOCK_DEFINITIONS[blockId];
    if (!def) return;

    const newSlides: RundownItem[] = def.subSlideTemplates.map((template, idx) => ({
      id: `def-${def.id}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      sourceType: 'def_block',
      defBlockId: def.id,
      defBlockLabel: `Block ${def.blockNumber}: ${def.name}`,
      slideIndex: idx + 1,
      slideCount: def.subSlideTemplates.length,
      act: def.act,
      originalBlockType: template.slideType,
      originalContent: {
        title: template.title,
        text: template.title,
        subheadline: template.subheadline,
        stat: template.dataValue,
        label: template.subheadline,
        myth: template.subheadline,
        fact: template.title,
        role: `Block ${def.blockNumber}: ${def.name}`,
        description: template.subheadline,
        ...(def.id === 'talent_spotlight' ? { jobTitle: template.title } : {}),
      },
      speakerNotes: template.speakerNotes,
      durationStr: template.durationStr,
    }));

    const updatedRundown = [...rundown, ...newSlides];
    setRundown(updatedRundown);
    onBlocksChange(updatedRundown);
  };
  const loadDefaultFrameworkSlides = () => {
    const suggestedBlockIds = LIVESTREAM_TYPE_FLOWS.default;
    const newSlides: RundownItem[] = [];

    suggestedBlockIds.forEach((blockId) => {
      const def = DEF_BLOCK_DEFINITIONS[blockId];
      if (!def) return;

      def.subSlideTemplates.forEach((template, idx) => {
        newSlides.push({
          id: `def-${def.id}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          sourceType: 'def_block',
          defBlockId: def.id,
          defBlockLabel: `Block ${def.blockNumber}: ${def.name}`,
          slideIndex: idx + 1,
          slideCount: def.subSlideTemplates.length,
          act: def.act,
          originalBlockType: template.slideType,
          originalContent: {
            title: template.title,
            text: template.title,
            subheadline: template.subheadline,
            stat: template.dataValue,
            label: template.subheadline,
            myth: template.subheadline,
            fact: template.title,
            role: `Block ${def.blockNumber}: ${def.name}`,
            description: template.subheadline,
            ...(def.id === 'talent_spotlight' ? { jobTitle: template.title } : {}),
          },
          speakerNotes: template.speakerNotes,
          durationStr: template.durationStr,
        });
      });
    });

    const updatedRundown = [...rundown, ...newSlides];
    setRundown(updatedRundown);
    onBlocksChange(updatedRundown);
  };

  // Synchronize rundown state when initialBlocks changes externally
  useEffect(() => {
    if (initialBlocks) {
      setRundown(initialBlocks);
    }
  }, [initialBlocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRundown((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onBlocksChange(newItems);
        return newItems;
      });
    }
  };

  const addBlockToRundown = (blockData: Partial<RundownItem>) => {
    const newItem: RundownItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceType: blockData.sourceType || 'transition',
      sourceId: blockData.sourceId,
      parentArticleId: blockData.parentArticleId,
      parentArticleTitle: blockData.parentArticleTitle,
      originalBlockType: blockData.originalBlockType,
      originalContent: blockData.originalContent || {},
      speakerNotes: blockData.speakerNotes || '',
      durationStr: blockData.durationStr || '5m',
    };
    const newItems = [...rundown, newItem];
    setRundown(newItems);
    onBlocksChange(newItems);
  };

  const addMultipleBlocksToRundown = (items: Partial<RundownItem>[]) => {
    const newItems: RundownItem[] = items.map((b, idx) => ({
      id: b.id || `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      sourceType: b.sourceType || 'article_block',
      sourceId: b.sourceId,
      defBlockId: b.defBlockId,
      defBlockLabel: b.defBlockLabel,
      slideIndex: b.slideIndex,
      slideCount: b.slideCount,
      act: b.act,
      parentArticleId: b.parentArticleId,
      parentArticleTitle: b.parentArticleTitle,
      originalBlockType: b.originalBlockType,
      originalContent: b.originalContent || {},
      speakerNotes: b.speakerNotes || '',
      durationStr: b.durationStr || '45s',
    }));
    const updated = [...rundown, ...newItems];
    setRundown(updated);
    onBlocksChange(updated);
  };

  const addJobToRundown = (job: any) => {
    const slides = decomposeJobIntoSlides(job);
    addMultipleBlocksToRundown(slides);
  };

  const addArticleBlockToRundown = (block: any, parentArticle: any) => {
    const slides = decomposeArticleBlockIntoSlides(block, parentArticle);
    addMultipleBlocksToRundown(slides);
  };

  const updateItem = (id: string, updates: Partial<RundownItem>) => {
    const newItems = rundown.map((i) => (i.id === id ? { ...i, ...updates } : i));
    setRundown(newItems);
    onBlocksChange(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = rundown.filter((i) => i.id !== id);
    setRundown(newItems);
    onBlocksChange(newItems);
  };

  // Distinct articles referenced
  const distinctArticleIds = useMemo(() => {
    const ids = new Set<string>();
    rundown.forEach((b) => {
      if (b.sourceType === 'article_block' && b.parentArticleId) {
        ids.add(b.parentArticleId);
      }
    });
    return ids;
  }, [rundown]);

  const distinctCount = distinctArticleIds.size;

  // Total runtime estimation
  const totalEstimatedMinutes = useMemo(() => {
    let mins = 0;
    rundown.forEach((b) => {
      const match = (b.durationStr || '').match(/(\d+)/);
      if (match) {
        mins += parseInt(match[1], 10);
      } else {
        mins += 5; // default fallback
      }
    });
    return mins;
  }, [rundown]);

  // Compute act numbers
  const itemActNumbers = useMemo(() => {
    const map: Record<string, number> = {};
    let counter = 0;
    rundown.forEach((b) => {
      const isAct = b.sourceType === 'act' || b.originalBlockType === 'rundown_act' || Boolean(b.originalContent?.role);
      if (isAct) {
        counter += 1;
        map[b.id] = counter;
      }
    });
    return map;
  }, [rundown]);

  // Curated Active Articles: only show studio handoff / selected articles (no external additions to avoid flow corruption)
  const activeArticles = useMemo(() => {
    const baseList = (guidingArticles && guidingArticles.length > 0)
      ? guidingArticles
      : (contentPool?.articles || []);

    return baseList.map((art: any) => {
      if (art.article?.blocks?.length || art.blocks?.length) return art;
      const foundInPool = contentPool?.articles?.find((p: any) => p.id === art.id);
      if (foundInPool) return foundInPool;
      return art;
    });
  }, [guidingArticles, contentPool?.articles]);

  // Curated Active Jobs/CTAs: only show studio handoff / selected opportunities
  const activeJobs = useMemo(() => {
    const list: any[] = [];
    if (guidingJobs && guidingJobs.length > 0) list.push(...guidingJobs);
    if (guidingListings && guidingListings.length > 0) list.push(...guidingListings);
    if (guidingCampaigns && guidingCampaigns.length > 0) list.push(...guidingCampaigns);

    if (list.length === 0 && contentPool?.jobs) {
      list.push(...contentPool.jobs);
    }
    return list;
  }, [guidingJobs, guidingListings, guidingCampaigns, contentPool?.jobs]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%' }}>

      {/* ── TOP SECTION: CONTENT POOL SWIMLANES ── */}
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: '24px',
          bgcolor: '#ffffff',
          border: '1.5px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Swimlanes Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                bgcolor: alpha(hubColor, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LayersIcon sx={{ color: hubColor, fontSize: '1.25rem' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Curated Content Pool & Ecosystem Resources
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.84rem' }}>
                Only selected anchor articles and ecosystem CTAs are locked in for this broadcast. Preview and pull modular blocks directly into your flow below.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${activeArticles.length} Anchor Articles`}
              size="small"
              sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.72rem' }}
            />
            <Chip
              label={`${activeJobs.length} Ecosystem CTAs`}
              size="small"
              sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '0.72rem' }}
            />
          </Box>
        </Box>

        {/* ── SWIMLANE 1: ANCHOR ARTICLES (IMAGE-FIRST) ── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookIcon sx={{ fontSize: '1.15rem', color: '#3b82f6' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Swimlane 1: Anchor Articles ({activeArticles.length})
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              {distinctCount} of {activeArticles.length} active in rundown
            </Typography>
          </Box>

          {activeArticles.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', borderRadius: '20px', bgcolor: '#f8fafc', border: '1.5px dashed #e2e8f0' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                No anchor articles attached to this studio session.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2.5,
                overflowX: 'auto',
                pb: 1.5,
                pt: 0.5,
                '::-webkit-scrollbar': { height: 6 },
                '::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: 3 },
              }}
            >
              {activeArticles.map((article: any) => {
                const isReferenced = distinctArticleIds.has(article.id);
                const blocks = article.article?.blocks || article.blocks || [];
                const referencedBlocksCount = rundown.filter(
                  (b) => b.sourceType === 'article_block' && b.parentArticleId === article.id
                ).length;
                const cover = article.coverImageUrl || article.coverImage || article.imageUrl;

                return (
                  <Box
                    key={article.id}
                    sx={{
                      minWidth: 300,
                      maxWidth: 320,
                      flexShrink: 0,
                      borderRadius: '20px',
                      overflow: 'hidden',
                      bgcolor: '#ffffff',
                      border: isReferenced
                        ? '1.5px solid rgba(16, 185, 129, 0.6)'
                        : '1.5px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: isReferenced
                        ? '0 8px 24px rgba(16, 185, 129, 0.1)'
                        : '0 4px 16px rgba(15, 23, 42, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                        borderColor: isReferenced ? '#10b981' : '#cbd5e1',
                      },
                    }}
                  >
                    {/* Large Image Header */}
                    <Box sx={{ position: 'relative', width: '100%', height: 155, bgcolor: '#0f172a', overflow: 'hidden' }}>
                      {cover ? (
                        <img
                          src={cover}
                          alt={article.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <BookIcon sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 44 }} />
                        </Box>
                      )}
                      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)' }} />
                      <Box sx={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={article.category || 'Article'}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(8px)',
                            color: '#0f172a',
                            fontWeight: 800,
                            fontSize: '0.66rem',
                            height: 22,
                            textTransform: 'uppercase',
                          }}
                        />
                        {isReferenced && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#059669 !important' }} />}
                            label={`${referencedBlocksCount} in Rundown`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.95)',
                              backdropFilter: 'blur(8px)',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '0.66rem',
                              height: 22,
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ position: 'absolute', bottom: 8, left: 10 }}>
                        <Chip
                          size="small"
                          label={`${blocks.length} Modular Blocks`}
                          sx={{
                            bgcolor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.66rem',
                            height: 20,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Card Content & Single Action Button */}
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: 1.5 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: '#0f172a',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.title}
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<LayersIcon sx={{ fontSize: '0.95rem !important' }} />}
                        onClick={() => setSelectedArticleForBlocks(article)}
                        sx={{
                          borderRadius: '12px',
                          bgcolor: isReferenced ? '#0f172a' : '#2563eb',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          textTransform: 'none',
                          py: 0.85,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: isReferenced ? '#1e293b' : '#1d4ed8',
                          },
                        }}
                      >
                        Pick Slides
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* ── SWIMLANE 2: ECOSYSTEM CTAS & OPPORTUNITIES (IMAGE-FIRST) ── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ fontSize: '1.15rem', color: '#f59e0b' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Swimlane 2: Ecosystem CTAs & Opportunities ({activeJobs.length})
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Direct audience conversion for Act 3
            </Typography>
          </Box>

          {activeJobs.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', borderRadius: '20px', bgcolor: '#f8fafc', border: '1.5px dashed #e2e8f0' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                No ecosystem CTAs attached to this studio session.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2.5,
                overflowX: 'auto',
                pb: 1.5,
                pt: 0.5,
                '::-webkit-scrollbar': { height: 6 },
                '::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: 3 },
              }}
            >
              {activeJobs.map((job: any) => {
                const isJobReferenced = rundown.some(
                  (b) => b.sourceType === 'job' && (b.sourceId === job.id || b.originalContent?.jobTitle === job.title)
                );
                const jobCover = job.coverImageUrl || job.imageUrl || job.organization?.logoUrl || job.orgLogo;

                return (
                  <Box
                    key={job.id || Math.random().toString()}
                    sx={{
                      minWidth: 300,
                      maxWidth: 320,
                      flexShrink: 0,
                      borderRadius: '20px',
                      overflow: 'hidden',
                      bgcolor: '#ffffff',
                      border: isJobReferenced
                        ? '1.5px solid rgba(245, 158, 11, 0.6)'
                        : '1.5px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: isJobReferenced
                        ? '0 8px 24px rgba(245, 158, 11, 0.1)'
                        : '0 4px 16px rgba(15, 23, 42, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                        borderColor: isJobReferenced ? '#f59e0b' : '#cbd5e1',
                      },
                    }}
                  >
                    {/* Large Image / Org Header */}
                    <Box sx={{ position: 'relative', width: '100%', height: 140, bgcolor: '#0f172a', overflow: 'hidden' }}>
                      {jobCover ? (
                        <img
                          src={jobCover}
                          alt={job.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #78350f 0%, #1e293b 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <WorkIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 44 }} />
                        </Box>
                      )}
                      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)' }} />
                      <Box sx={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={job.organization?.name || job.orgName || 'Ecosystem Partner'}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(8px)',
                            color: '#0f172a',
                            fontWeight: 800,
                            fontSize: '0.66rem',
                            height: 22,
                          }}
                        />
                        {isJobReferenced && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#b45309 !important' }} />}
                            label="In Rundown"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.95)',
                              backdropFilter: 'blur(8px)',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '0.66rem',
                              height: 22,
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ position: 'absolute', bottom: 8, left: 10 }}>
                        <Chip
                          size="small"
                          label={job.salary || job.compensationOrTarget || 'Verified Opportunity'}
                          sx={{
                            bgcolor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            color: '#fde68a',
                            fontWeight: 800,
                            fontSize: '0.66rem',
                            height: 20,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Card Content & Action Button */}
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: 1.5 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: '#0f172a',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {job.title}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<WorkIcon sx={{ fontSize: '0.95rem !important' }} />}
                          onClick={() => addJobToRundown(job)}
                          sx={{
                            borderRadius: '12px',
                            bgcolor: isJobReferenced ? '#0f172a' : '#d97706',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            textTransform: 'none',
                            py: 0.85,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: isJobReferenced ? '#1e293b' : '#b45309' },
                          }}
                        >
                          {isJobReferenced ? 'Add Format B Again' : 'Pick Format B Slides'}
                        </Button>
                        <Tooltip title="Preview Format B Opportunity Slide">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              const slides = decomposeJobIntoSlides(job);
                              if (slides.length > 0) {
                                setPreviewSlideItem(slides[0] as RundownItem);
                              }
                            }}
                            sx={{
                              borderRadius: '12px',
                              border: '1.5px solid rgba(226, 232, 240, 0.9)',
                              bgcolor: '#f8fafc',
                              px: 1.25,
                              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#d97706' },
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: '1.1rem', color: '#64748b' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── BOTTOM SECTION: RUNDOWN CANVAS & TIMELINE BAR ── */}
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Executive Broadcast Timeline Bar */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: '20px',
            bgcolor: '#ffffff',
            border: '1.5px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {/* Metrics: Run Time & Articles Reference Check */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: '0.95rem !important' }} />}
              label={`~${totalEstimatedMinutes} mins Total Runtime`}
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                borderRadius: '10px',
                height: 30,
              }}
            />

            <Chip
              label={`${distinctCount}/5 Articles Referenced`}
              sx={{
                bgcolor: distinctCount >= 5 ? '#d1fae5' : '#fef3c7',
                color: distinctCount >= 5 ? '#065f46' : '#b45309',
                fontWeight: 900,
                fontSize: '0.78rem',
                borderRadius: '10px',
                height: 30,
                border: `1.5px solid ${distinctCount >= 5 ? '#10b981' : '#f59e0b'}`,
              }}
            />

            <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
              {rundown.length} total blocks in broadcast
            </Typography>
          </Box>

          {/* Quick Add Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                addBlockToRundown({
                  sourceType: 'slide',
                  originalBlockType: 'subheading',
                  originalContent: {
                    title: 'Strategic Insight / Discussion Point',
                    role: 'Slide',
                    subheadline: 'Key tension or operational reframe...',
                    description: 'Discussion points and audience takeaway...',
                  },
                  durationStr: '5m',
                });
              }}
              sx={{
                bgcolor: '#10b981',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                borderRadius: '12px',
                textTransform: 'none',
                px: 2,
                py: 0.6,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                '&:hover': { bgcolor: '#059669' },
              }}
            >
              + Add Slide
            </Button>

            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() =>
                addBlockToRundown({
                  sourceType: 'transition',
                  originalContent: { title: 'Q&A / Intermission', message: 'Taking questions from the chat now' },
                  durationStr: '5m',
                })
              }
              sx={{
                borderColor: '#cbd5e1',
                color: '#475569',
                fontWeight: 800,
                fontSize: '0.8rem',
                borderRadius: '12px',
                textTransform: 'none',
                px: 2,
                py: 0.6,
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
              }}
            >
              + Add Transition
            </Button>
          </Box>
        </Box>

        {/* Rundown Sortable Canvas */}
        <Box sx={{ width: '100%', px: 0.5, pb: 4 }}>
          {rundown.length === 0 ? (
            <Box
              sx={{
                p: { xs: 4, md: 5 },
                textAlign: 'center',
                borderRadius: '24px',
                border: '1.5px solid rgba(226, 232, 240, 0.95)',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  bgcolor: alpha(hubColor, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                }}
              >
                🎙️
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>
                Your Presentation Rundown is Empty
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 480, lineHeight: 1.5 }}>
                Load the recommended broadcast framework slide sequence, or pull modular blocks from your anchor articles and the 12 broadcast blocks tray below.
              </Typography>
              <Button
                variant="contained"
                startIcon={<SparkleIcon />}
                onClick={() => loadDefaultFrameworkSlides()}
                sx={{
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 900,
                  borderRadius: '14px',
                  textTransform: 'none',
                  px: 3.5,
                  py: 1.1,
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.18)',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                Load Recommended Framework Slides
              </Button>
            </Box>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={rundown.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {rundown.map((item, index) => (
                  <SortableRundownCard
                    key={item.id}
                    item={item}
                    index={index}
                    actNumber={itemActNumbers[item.id]}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                    onPreviewSlide={setPreviewSlideItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {/* ── 12 BROADCAST DEF BLOCKS TRAY ── */}
          <Box
            sx={{
              mt: 4,
              p: { xs: 2.5, sm: 3 },
              borderRadius: '24px',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SparkleIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                  <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
                    Determinant Engagement Framework (12 Broadcast Blocks)
                  </Typography>
                </Box>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.5, fontWeight: 500 }}>
                  Tap any broadcast block below to append its rapid-fire slide(s) to your rundown.
                </Typography>
              </Box>
            </Box>

            {/* Render grouped by Acts */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {DEF_ACTS.map((actGroup) => (
                <Box key={actGroup.act}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                    <Chip
                      size="small"
                      label={actGroup.label}
                      sx={{ bgcolor: alpha(actGroup.color, 0.12), color: actGroup.color, fontWeight: 900, fontSize: '0.72rem' }}
                    />
                    <Typography sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
                      {actGroup.subtitle}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                    {actGroup.blockIds.map((blockId) => {
                      const def = DEF_BLOCK_DEFINITIONS[blockId];
                      if (!def) return null;
                      return (
                        <Box
                          key={def.id}
                          onClick={() => addDEFBlockToRundown(def.id)}
                          sx={{
                            p: 1.75,
                            borderRadius: '16px',
                            bgcolor: '#ffffff',
                            border: `1.5px solid ${alpha(def.themeColor, 0.22)}`,
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.75,
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            '&:hover': {
                              borderColor: def.themeColor,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 24px ${alpha(def.themeColor, 0.15)}`,
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: def.themeColor, textTransform: 'uppercase' }}>
                              Block {def.blockNumber}
                            </Typography>
                            <Chip
                              size="small"
                              label={`+ ${def.subSlideTemplates.length} ${def.subSlideTemplates.length === 1 ? 'Slide' : 'Slides'}`}
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                bgcolor: alpha(def.themeColor, 0.1),
                                color: def.themeColor,
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.2 }}>
                            {def.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.35 }}>
                            {def.subtitle}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Bottom Add Buttons for convenience */}
          {rundown.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  const nextActNum = Object.keys(itemActNumbers).length + 1;
                  addBlockToRundown({
                    sourceType: 'act',
                    originalBlockType: 'rundown_act',
                    originalContent: {
                      title: `Act ${nextActNum}: Strategic Theme`,
                      role: `Act ${nextActNum}`,
                      description: 'Discussion points and tension reframe...',
                    },
                    durationStr: '15m',
                  });
                }}
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 1.75,
                  borderRadius: '16px',
                  color: '#059669',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  fontWeight: 800,
                  bgcolor: 'rgba(16, 185, 129, 0.02)',
                  '&:hover': {
                    borderColor: '#10b981',
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    borderWidth: 2,
                  },
                }}
              >
                + Add Broadcast Act
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  addBlockToRundown({
                    sourceType: 'transition',
                    originalContent: { title: 'Q&A / Intermission', message: 'Taking questions from the chat now' },
                    durationStr: '5m',
                  })
                }
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 1.75,
                  borderRadius: '16px',
                  color: '#64748b',
                  borderColor: 'rgba(0,0,0,0.12)',
                  fontWeight: 800,
                  '&:hover': {
                    borderColor: '#0f172a',
                    color: '#0f172a',
                    bgcolor: '#f8fafc',
                    borderWidth: 2,
                  },
                }}
              >
                + Add Transition Note
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Article Preview Modal ── */}
      <Dialog
        open={Boolean(previewArticle)}
        onClose={() => setPreviewArticle(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(226, 232, 240, 0.95)',
              boxShadow: '0 24px 64px rgba(15, 23, 42, 0.15)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {previewArticle && (
          <>
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#f8fafc',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Chip
                  label={previewArticle.category || 'Article'}
                  size="small"
                  sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {previewArticle.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setPreviewArticle(null)} size="small" sx={{ color: '#64748b' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <DialogContent sx={{ p: 3.5, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {previewArticle.description && (
                <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1.5px solid rgba(59, 130, 246, 0.15)' }}>
                  <Typography sx={{ fontSize: '0.88rem', color: '#1e40af', lineHeight: 1.6 }}>
                    {previewArticle.description}
                  </Typography>
                </Box>
              )}

              {/* Render Blocks using ArticleBlockRenderer */}
              {(() => {
                const blocks = previewArticle.article?.blocks || previewArticle.blocks || [];
                if (blocks.length === 0) {
                  return (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        No formatted blocks in this article. You can still add the article summary as a discussion point.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          addBlockToRundown({
                            sourceType: 'article_block',
                            parentArticleId: previewArticle.id,
                            parentArticleTitle: previewArticle.title,
                            originalBlockType: 'subheading',
                            originalContent: {
                              title: previewArticle.title,
                              spikyTitle: previewArticle.title,
                              description: previewArticle.description,
                            },
                            durationStr: '5m',
                          });
                          setPreviewArticle(null);
                        }}
                        sx={{ mt: 2, bgcolor: '#3b82f6', borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
                      >
                        + Add Article Overview to Rundown
                      </Button>
                    </Box>
                  );
                }

                return blocks.map((b: any, bIdx: number) => {
                  let parsed: any = {};
                  try {
                    parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
                  } catch {
                    parsed = {};
                  }

                  return (
                    <Box
                      key={b.id || bIdx}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        border: '1.5px solid rgba(226, 232, 240, 0.8)',
                        bgcolor: '#ffffff',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: '#cbd5e1', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Chip
                          label={b.blockType?.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: '0.65rem' }}
                        />
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon sx={{ fontSize: '0.85rem !important' }} />}
                          onClick={() => {
                            addArticleBlockToRundown(b, previewArticle);
                          }}
                          sx={{
                            borderRadius: '10px',
                            bgcolor: '#3b82f6',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.74rem',
                            textTransform: 'none',
                            py: 0.3,
                            px: 1.5,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#2563eb' },
                          }}
                        >
                          + Add Block to Rundown
                        </Button>
                      </Box>

                      <ArticleBlockRenderer
                        block={{
                          id: b.id || String(bIdx),
                          blockType: b.blockType,
                          content: b.content,
                        }}
                        accentColor="#3b82f6"
                      />
                    </Box>
                  );
                });
              })()}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ── Block Selection Dialog (85vh × 85vw Premium Studio Modal) ── */}
      <Dialog
        open={Boolean(selectedArticleForBlocks)}
        onClose={() => setSelectedArticleForBlocks(null)}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '96vw', md: '85vw' },
              maxWidth: '1440px',
              height: { xs: '94vh', md: '85vh' },
              maxHeight: '85vh',
              borderRadius: '28px',
              bgcolor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(28px)',
              color: '#0f172a',
              border: '1.5px solid rgba(226, 232, 240, 0.95)',
              boxShadow: '0 32px 80px rgba(15, 23, 42, 0.16)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          },
        }}
      >
        {selectedArticleForBlocks && (() => {
          const blocks = selectedArticleForBlocks.article?.blocks || selectedArticleForBlocks.blocks || [];

          // Decompose all blocks into slide candidates
          const allCandidateSlides: Array<{
            slideItem: RundownItem;
            parentBlock: any;
            blockIndex: number;
            stepIndex: number;
            totalSteps: number;
            isCompound: boolean;
          }> = [];

          blocks.forEach((b: any, bIdx: number) => {
            const decomposed = decomposeArticleBlockIntoSlides(b, selectedArticleForBlocks);
            decomposed.forEach((partialItem, sIdx) => {
              const candidateId = `cand-${b.id || bIdx}-${sIdx}`;
              const fullItem: RundownItem = {
                id: candidateId,
                sourceType: partialItem.sourceType || 'article_block',
                sourceId: partialItem.sourceId || `${b.id || bIdx}-${sIdx}`,
                parentArticleId: selectedArticleForBlocks.id,
                parentArticleTitle: selectedArticleForBlocks.title,
                originalBlockType: partialItem.originalBlockType || b.blockType,
                originalContent: partialItem.originalContent || {},
                durationStr: partialItem.durationStr || '45s',
                speakerNotes: partialItem.speakerNotes || '',
                slideIndex: partialItem.slideIndex || (sIdx + 1),
                slideCount: partialItem.slideCount || decomposed.length,
              };
              allCandidateSlides.push({
                slideItem: fullItem,
                parentBlock: b,
                blockIndex: bIdx,
                stepIndex: sIdx + 1,
                totalSteps: decomposed.length,
                isCompound: decomposed.length > 1,
              });
            });
          });

          return (
            <>
              {/* Studio Top Navigation Bar */}
              <Box
                sx={{
                  px: { xs: 2.5, sm: 3.5 },
                  py: 1.75,
                  borderBottom: '1.5px solid rgba(226, 232, 240, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LayersIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                    Article Slide Deck Generator
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={() => setSelectedArticleForBlocks(null)}
                  sx={{
                    color: '#64748b',
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    '&:hover': { color: '#0f172a', bgcolor: 'rgba(0, 0, 0, 0.08)' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>

              {/* Scrollable Body: Centered Hero + Centered Switcher + Slide Candidates Grid */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: { xs: 2.5, sm: 3.5, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3.5,
                  bgcolor: '#f8fafc',
                }}
              >
                {/* ── Centered Hero Section ── */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    maxWidth: 880,
                    mx: 'auto',
                    gap: 1.25,
                    pt: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.1rem' },
                      color: '#0f172a',
                      lineHeight: 1.25,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Add an Article Block in Your Presentation
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: '0.88rem', md: '0.98rem' },
                      color: '#475569',
                      lineHeight: 1.6,
                      maxWidth: 720,
                    }}
                  >
                    Select specific visual slides decomposed from this article to enrich your live broadcast rundown. Switch between 16:9 Broadcast and 9:16 Mobile views, preview step-by-step breakdowns, and pick the slides you want to present on stage.
                  </Typography>

                  <Chip
                    label={`Article: ${selectedArticleForBlocks.title}`}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563eb',
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      borderRadius: '10px',
                      maxWidth: '90%',
                    }}
                  />
                </Box>

                {/* ── Centered Controls: Portrait vs Wide Aspect Switcher ── */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 1,
                    borderTop: '1.5px solid rgba(226, 232, 240, 0.7)',
                    borderBottom: '1.5px solid rgba(226, 232, 240, 0.7)',
                  }}
                >
                  {/* Aspect Ratio Switcher */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      bgcolor: '#f1f5f9',
                      p: 0.5,
                      borderRadius: '12px',
                      border: '1.5px solid rgba(226, 232, 240, 0.9)',
                      gap: 0.5,
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() => setArticleModalAspect('16:9')}
                      startIcon={<DesktopIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: '10px',
                        px: 2.25,
                        py: 0.75,
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        bgcolor: articleModalAspect === '16:9' ? '#ffffff' : 'transparent',
                        color: articleModalAspect === '16:9' ? '#2563eb' : '#64748b',
                        boxShadow: articleModalAspect === '16:9' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        border: articleModalAspect === '16:9' ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent',
                        '&:hover': {
                          bgcolor: articleModalAspect === '16:9' ? '#ffffff' : 'rgba(0,0,0,0.04)',
                        },
                      }}
                    >
                      16:9 Broadcast (Wide)
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setArticleModalAspect('9:16')}
                      startIcon={<MobileIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: '10px',
                        px: 2.25,
                        py: 0.75,
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        bgcolor: articleModalAspect === '9:16' ? '#ffffff' : 'transparent',
                        color: articleModalAspect === '9:16' ? '#db2777' : '#64748b',
                        boxShadow: articleModalAspect === '9:16' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        border: articleModalAspect === '9:16' ? '1px solid rgba(219, 39, 119, 0.2)' : '1px solid transparent',
                        '&:hover': {
                          bgcolor: articleModalAspect === '9:16' ? '#ffffff' : 'rgba(0,0,0,0.04)',
                        },
                      }}
                    >
                      9:16 Mobile (Portrait)
                    </Button>
                  </Box>
                </Box>

                {/* ── Slide Candidates Grid ── */}
                {allCandidateSlides.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                      No modular blocks found in this article.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        articleModalAspect === '9:16'
                          ? {
                              xs: '1fr',
                              sm: 'repeat(auto-fill, minmax(240px, 1fr))',
                              md: 'repeat(auto-fill, minmax(260px, 1fr))',
                            }
                          : {
                              xs: '1fr',
                              sm: 'repeat(auto-fill, minmax(320px, 1fr))',
                              md: 'repeat(auto-fill, minmax(380px, 1fr))',
                            },
                      gap: 2.5,
                      pb: 4,
                    }}
                  >
                    {allCandidateSlides.map((candidate, idx) => {
                      const { slideItem, parentBlock, isCompound, stepIndex, totalSteps } = candidate;
                      const c = slideItem.originalContent || {};
                      const title =
                        c.title ||
                        c.stepTitle ||
                        c.myth ||
                        c.fact ||
                        c.name ||
                        c.headline ||
                        c.question ||
                        c.mandate ||
                        c.text ||
                        parentBlock.blockType?.replace('_', ' ').toUpperCase() ||
                        `Slide ${idx + 1}`;

                      const isAlreadyInRundown = rundown.some(
                        (r) =>
                          r.sourceType === 'article_block' &&
                          (r.sourceId === slideItem.sourceId ||
                            (r.originalContent?.stepTitle && r.originalContent?.stepTitle === c.stepTitle) ||
                            (r.originalContent?.myth && r.originalContent?.myth === c.myth) ||
                            (r.originalContent?.fact && r.originalContent?.fact === c.fact) ||
                            (r.originalContent?.title && r.originalContent?.title === c.title))
                      );

                      return (
                        <Box
                          key={slideItem.id || idx}
                          sx={{
                            p: 2,
                            borderRadius: '20px',
                            bgcolor: '#ffffff',
                            border: isAlreadyInRundown
                              ? '1.5px solid rgba(16, 185, 129, 0.6)'
                              : '1.5px solid rgba(226, 232, 240, 0.95)',
                            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 1.5,
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              borderColor: isAlreadyInRundown ? '#10b981' : '#2563eb',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
                            },
                          }}
                        >
                          {/* Slide Header: Block Tag & In Rundown status */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Chip
                                size="small"
                                label={
                                  isCompound
                                    ? `${slideItem.originalBlockType?.replace('_', ' ').toUpperCase()} · ${stepIndex}/${totalSteps}`
                                    : (slideItem.originalBlockType || parentBlock.blockType)?.replace('_', ' ').toUpperCase() || 'SLIDE'
                                }
                                sx={{
                                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                                  color: '#2563eb',
                                  fontWeight: 900,
                                  fontSize: '0.65rem',
                                  height: 20,
                                  borderRadius: '10px',
                                }}
                              />
                              <Chip
                                size="small"
                                label={slideItem.durationStr || '45s'}
                                sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontSize: '0.62rem', height: 20, fontWeight: 700, borderRadius: '10px' }}
                              />
                            </Box>
                            {isAlreadyInRundown && (
                              <Chip
                                size="small"
                                label="✓ In Rundown"
                                sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.62rem', height: 20, borderRadius: '10px' }}
                              />
                            )}
                          </Box>

                          {/* Real Scaled Visual Slide Preview Frame */}
                          <Box
                            onClick={() => {
                              setPreviewSlideItem(slideItem);
                              setSinglePreviewAspect(articleModalAspect);
                            }}
                            sx={{
                              width: '100%',
                              maxWidth: articleModalAspect === '9:16' ? 220 : '100%',
                              aspectRatio: articleModalAspect === '9:16' ? '9/16' : '16/9',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              border: '1.5px solid rgba(226, 232, 240, 0.95)',
                              bgcolor: '#f8fafc',
                              position: 'relative',
                              cursor: 'pointer',
                              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                              mx: 'auto',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: '#2563eb',
                                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.15)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: '200%',
                                height: '200%',
                                transform: 'scale(0.5)',
                                transformOrigin: 'top left',
                                pointerEvents: 'none',
                                userSelect: 'none',
                              }}
                            >
                              {renderSlidePreviewContent(slideItem, hubColor, {
                                aspectRatio: articleModalAspect,
                              })}
                            </Box>
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 6,
                                right: 6,
                                bgcolor: 'rgba(15, 23, 42, 0.75)',
                                color: '#ffffff',
                                px: 0.85,
                                py: 0.35,
                                borderRadius: '8px',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                backdropFilter: 'blur(4px)',
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 11 }} /> Expand
                            </Box>
                          </Box>

                          {/* Slide Summary */}
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              color: '#0f172a',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {String(title)}
                          </Typography>

                          {/* Action Buttons */}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              startIcon={<AddIcon sx={{ fontSize: '0.9rem !important' }} />}
                              onClick={() => {
                                addMultipleBlocksToRundown([slideItem]);
                              }}
                              sx={{
                                borderRadius: '12px',
                                bgcolor: isAlreadyInRundown ? '#f8fafc' : '#2563eb',
                                color: isAlreadyInRundown ? '#334155' : '#ffffff',
                                border: isAlreadyInRundown ? '1.5px solid #cbd5e1' : 'none',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                textTransform: 'none',
                                py: 0.7,
                                boxShadow: 'none',
                                '&:hover': {
                                  bgcolor: isAlreadyInRundown ? '#f1f5f9' : '#1d4ed8',
                                },
                              }}
                            >
                              {isAlreadyInRundown ? 'Add Duplicate Slide' : 'Pick This Slide'}
                            </Button>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </>
          );
        })()}
      </Dialog>

      {/* ── Single Slide Preview Modal (Dual 16:9 Desktop & 9:16 Mobile) ── */}
      <Dialog
        open={Boolean(previewSlideItem)}
        onClose={() => setPreviewSlideItem(null)}
        maxWidth={singlePreviewAspect === '9:16' ? 'xs' : 'md'}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '28px',
              bgcolor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(226, 232, 240, 0.95)',
              boxShadow: '0 24px 64px rgba(15, 23, 42, 0.14)',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          },
        }}
      >
        {previewSlideItem && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)',
                bgcolor: '#ffffff',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Chip
                  size="small"
                  label={previewSlideItem.defBlockLabel || previewSlideItem.sourceType.toUpperCase()}
                  sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontWeight: 800, fontSize: '0.72rem' }}
                />
                <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '0.92rem' }}>
                  {singlePreviewAspect === '9:16' ? '9:16 Mobile' : '16:9 Broadcast'} Slide Preview
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* 16:9 vs 9:16 Toggle */}
                <Box
                  onClick={() => setSinglePreviewAspect((prev) => (prev === '16:9' ? '9:16' : '16:9'))}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    cursor: 'pointer',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '10px',
                    bgcolor: singlePreviewAspect === '9:16' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    border: `1.5px solid ${singlePreviewAspect === '9:16' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: singlePreviewAspect === '9:16' ? 'rgba(236, 72, 153, 0.18)' : 'rgba(59, 130, 246, 0.18)' },
                  }}
                >
                  {singlePreviewAspect === '9:16' ? (
                    <>
                      <MobileIcon sx={{ fontSize: 16, color: '#db2777' }} />
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#db2777' }}>9:16 Mobile</Typography>
                    </>
                  ) : (
                    <>
                      <DesktopIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb' }}>16:9 Desktop</Typography>
                    </>
                  )}
                </Box>

                <IconButton size="small" onClick={() => setPreviewSlideItem(null)} sx={{ color: '#64748b', '&:hover': { color: '#0f172a', bgcolor: 'rgba(0, 0, 0, 0.05)' } }}>
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Visual Slide Canvas */}
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                bgcolor: '#f8fafc',
                borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: singlePreviewAspect === '9:16' ? 'auto' : '100%',
                  height: singlePreviewAspect === '9:16' ? { xs: 380, md: 480 } : 'auto',
                  aspectRatio: singlePreviewAspect === '9:16' ? '9/16' : '16/9',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                }}
              >
                {renderSlidePreviewContent(previewSlideItem, hubColor, {
                  aspectRatio: singlePreviewAspect,
                })}
              </Box>
            </Box>

            {/* Presenter Teleprompter Bar */}
            {previewSlideItem.speakerNotes && (
              <Box sx={{ p: 2.25, bgcolor: 'rgba(254, 249, 195, 0.55)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <MicIcon sx={{ color: '#b45309', fontSize: 22, mt: 0.2 }} />
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Presenter Teleprompter Cue ({previewSlideItem.durationStr || '30s'})
                  </Typography>
                  <Typography sx={{ color: '#1e293b', fontSize: '0.94rem', lineHeight: 1.5, mt: 0.25, fontWeight: 500 }}>
                    "{previewSlideItem.speakerNotes}"
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Dialog>

      {/* ── Ecosystem Job Preview Modal ── */}
      <EcosystemJobModal
        open={Boolean(previewJob)}
        onClose={() => setPreviewJob(null)}
        jobId={previewJob?.id}
        initialJobData={previewJob ? {
          title: previewJob.title || previewJob.name || 'Ecosystem Opportunity',
          organization: previewJob.organization?.name || previewJob.orgName,
          organizationLogo: previewJob.organization?.logoUrl || previewJob.orgLogo,
          location: previewJob.location,
          compensationOrTarget: previewJob.compensationOrTarget || previewJob.salary || previewJob.target || previewJob.budget,
          ctaText: previewJob.ctaText || 'Apply / Learn More',
          ctaLink: previewJob.ctaLink || previewJob.applyUrl || previewJob.link,
          embedType: previewJob.category || 'job',
        } : undefined}
        accentColor="#f59e0b"
        themeMode="light"
      />
    </Box>
  );
}
