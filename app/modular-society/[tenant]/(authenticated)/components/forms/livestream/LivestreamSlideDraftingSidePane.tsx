'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RemoveIcon from '@mui/icons-material/Remove';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import LayersIcon from '@mui/icons-material/Layers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion, AnimatePresence } from 'framer-motion';

import {
  PromptTerminalBox,
  PromptChecklistItem,
  PromptFastIngestBox,
} from '@/components/prompts';
import { usePromptAssistant } from '@/context/PromptAssistantContext';
import {
  buildLSDoc2aPrompt,
  buildLSDoc2bPrompt,
  buildLSDoc2cPrompt,
  buildLSDoc3Prompt,
  buildLSDoc4Prompt,
  calculateExpectedSlideCount,
  normalizeLivestreamSlidePayload,
  resolveCustomBlockDescriptions,
  LivestreamPromptContext,
} from '@/lib/config/livestreamMasterPrompts';
import { RundownItem } from './LivestreamRundownBuilder';

export interface LivestreamSlideDraftingSidePaneProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  timeframe: 'past' | 'present' | 'future';
  format?: 'industry_teardown' | 'panel_debate' | 'talent_spotlight' | string;
  hubTitle?: string;
  hubColor?: string;
  appliedBlueprint?: any;
  guidingArticles?: any[];
  guidingJobs?: any[];
  guidingListings?: any[];
  guidingCampaigns?: any[];
  onIngestSlides: (slides: RundownItem[]) => void;
  onUpdateTitle?: (title: string) => void;
  onUpdateDescription?: (desc: string) => void;
}

export default function LivestreamSlideDraftingSidePane({
  open,
  onClose,
  onOpen,
  title,
  description = '',
  category,
  subcategory = '',
  timeframe,
  format = 'industry_teardown',
  hubTitle = 'Production & Capital',
  hubColor = '#10b981',
  appliedBlueprint,
  guidingArticles = [],
  guidingJobs = [],
  guidingListings = [],
  guidingCampaigns = [],
  onIngestSlides,
  onUpdateTitle,
  onUpdateDescription,
}: LivestreamSlideDraftingSidePaneProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Floating dock visibility (learn studio glass parity)
  const [isDockVisible, setIsDockVisible] = useState(false);
  const { suspendDock, setHasEditorDock } = usePromptAssistant();

  // Fast Ingest State
  const [rawIngestPayload, setRawIngestPayload] = useState('');
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState(false);

  // Keep dock available once opened
  useEffect(() => {
    if (open) {
      setIsDockVisible(true);
    }
  }, [open]);

  // Drawer-Aware Auto-Tuck: Suppress background floating docks while this drawer is open
  useEffect(() => {
    if (open) {
      suspendDock(true);
    } else {
      suspendDock(false);
    }
    return () => {
      suspendDock(false);
    };
  }, [open, suspendDock]);

  // Stacking Coordination: Inform global context when this local dock is active
  useEffect(() => {
    if (!open && isDockVisible) {
      setHasEditorDock(true);
    } else {
      setHasEditorDock(false);
    }
    return () => {
      setHasEditorDock(false);
    };
  }, [open, isDockVisible, setHasEditorDock]);

  // Storage Persistence for checklist and scratchpad
  const storagePrefix = useMemo(() => {
    const slug = (title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return `ls_slide_drafting_${slug}_${category}`;
  }, [title, category]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedChecklist = localStorage.getItem(`${storagePrefix}_checklist`);
        if (savedChecklist) setChecklist(JSON.parse(savedChecklist));
        else setChecklist({});

        const savedPayload = localStorage.getItem(`${storagePrefix}_payload`);
        if (savedPayload) {
          const parsed = JSON.parse(savedPayload);
          setRawIngestPayload(parsed.payload || '');
        } else {
          setRawIngestPayload('');
        }
      } catch {}
    }
  }, [storagePrefix]);

  const savePayloadToStorage = useCallback((payload: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${storagePrefix}_payload`, JSON.stringify({ payload }));
      } catch {}
    }
  }, [storagePrefix]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${storagePrefix}_checklist`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleCopyPromptAutoCheck = (promptKey: string) => {
    const map: Record<string, string> = {
      ls_doc_2a: 'ls_check_2a',
      ls_doc_2b: 'ls_check_2b',
      ls_doc_2c: 'ls_check_2c',
      ls_doc_3: 'ls_check_3',
      ls_doc_4: 'ls_check_4',
    };
    const targetCheck = map[promptKey];
    if (targetCheck) {
      setChecklist((prev) => {
        const next = { ...prev, [targetCheck]: true };
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_checklist`, JSON.stringify(next));
        }
        return next;
      });
    }
  };

  // Build Context for Prompts
  const promptContext: LivestreamPromptContext = useMemo(() => ({
    title,
    description,
    category,
    subcategory,
    timeframe,
    format,
    hubTitle,
    hubColor,
    appliedBlueprint,
    customBlockDescriptions: resolveCustomBlockDescriptions(appliedBlueprint),
    guidingArticles,
    guidingJobs,
    guidingListings,
    guidingCampaigns,
  }), [
    title,
    description,
    category,
    subcategory,
    timeframe,
    format,
    hubTitle,
    hubColor,
    appliedBlueprint,
    guidingArticles,
    guidingJobs,
    guidingListings,
    guidingCampaigns,
  ]);

  const expectedSlideCount = useMemo(() => calculateExpectedSlideCount(format), [format]);

  // Live Detected Slide Count
  const detectedSlideCount = useMemo(() => {
    if (!rawIngestPayload.trim()) return 0;
    try {
      const slides = normalizeLivestreamSlidePayload(rawIngestPayload, promptContext);
      return slides.length;
    } catch {
      return 0;
    }
  }, [rawIngestPayload, promptContext]);

  // Sequenced Prompts (Documents 2a, 2b, 2c, 3, 4)
  const prompts = useMemo(() => [
    {
      key: 'ls_doc_2a',
      stepNum: 1,
      code: 'LS-DOC 2a',
      title: 'Act 1: The Open & Tension (Hook, Field Crisis & Strategic Reframe)',
      instruction: 'Feed your approved blueprint into your AI model and run LS-Doc 2a to draft the opening slides: the authentic field crisis imagery, the killer numeric stat, and the provocative strategic reframe question.',
      role: 'Act 1 Slide Content: Field Crisis Media, Killer Stat Card, Strategic Reframe Question',
      prompt: buildLSDoc2aPrompt(promptContext),
      checkId: 'ls_check_2a',
      checkText: 'Run LS-Doc 2a to draft Act 1 slides (Field Crisis, Killer Stat, Strategic Reframe).',
      colorTheme: '#ef4444',
    },
    {
      key: 'ls_doc_2b',
      stepNum: 2,
      code: 'LS-DOC 2b',
      title: 'Act 2: The Meat & Diagnostic Map (Deep Diagnostic, System Mapping & Defense)',
      instruction: 'Feed the Act 1 output into LS-Doc 2b to draft all Act 2 diagnostic slides: 3-layer symptoms, ideal vs. feasible contrast, scaled burden, power map, response audit, and preemptive objection defense.',
      role: 'Act 2 Slide Content: 3-Layer Diagnostic, Ground Reality Workaround, Power Map & Objections',
      prompt: buildLSDoc2bPrompt(promptContext),
      checkId: 'ls_check_2b',
      checkText: 'Run LS-Doc 2b to draft Act 2 slides tailored to your broadcast format.',
      colorTheme: '#3b82f6',
    },
    {
      key: 'ls_doc_2c',
      stepNum: 3,
      code: 'LS-DOC 2c',
      title: 'Act 3: The Close & Conversion (Return, Divergence & Talent/Deal Spotlight)',
      instruction: 'Run LS-Doc 2c to draft the closing sequence: re-evaluating the opening crisis image with the operational model, presenting the diverging futures (Path A vs Path B), and spotlighting verified ecosystem careers and bounties.',
      role: 'Act 3 Slide Content: Re-evaluated Opening Case, Forked Futures & Ecosystem Talent Conversion',
      prompt: buildLSDoc2cPrompt(promptContext),
      checkId: 'ls_check_2c',
      checkText: 'Run LS-Doc 2c to draft Act 3 slides and live ecosystem conversion CTAs.',
      colorTheme: '#10b981',
    },
    {
      key: 'ls_doc_3',
      stepNum: 4,
      code: 'LS-DOC 3',
      title: 'Executive Presenter Notes & Bionic Teleprompter Script',
      instruction: 'Feed all drafted slides into LS-Doc 3 to generate spoken broadcast scripts for every slide: verbatim teleprompter copy, bracketed stage directions [PAUSE 2s], cadence cues, and spoken transitions.',
      role: 'Full Broadcast Teleprompter Script, Bracketed Stage Directions, Spoken Transitions & Chat Prompts',
      prompt: buildLSDoc3Prompt(promptContext),
      checkId: 'ls_check_3',
      checkText: 'Run LS-Doc 3 to generate teleprompter script and executive stage directions for each slide.',
      colorTheme: '#8b5cf6',
    },
    {
      key: 'ls_doc_4',
      stepNum: 5,
      code: 'LS-DOC 4',
      title: 'Headless CMS Slide Payload Compiler (JSON Relay)',
      instruction: `Run LS-Doc 4 to compile all validated slides and speaker notes into a strictly valid JSON array of ${expectedSlideCount} slides ready for direct studio ingest.`,
      role: 'Full syntax validation & compilation into headless RundownItem JSON array for direct canvas ingest',
      prompt: buildLSDoc4Prompt(promptContext),
      checkId: 'ls_check_4',
      checkText: `Run LS-Doc 4 to compile all ${expectedSlideCount} slides into strict CMS JSON.`,
      colorTheme: '#06b6d4',
    },
  ], [promptContext, expectedSlideCount]);

  // Fast Ingest Handler
  const handleParseAndIngest = () => {
    setIngestError(null);
    setIngestSuccess(false);

    const trimmed = rawIngestPayload.trim();
    if (!trimmed) {
      setIngestError('Please paste your generated JSON from LS-Doc 4 into the terminal below.');
      return;
    }

    try {
      const slides = normalizeLivestreamSlidePayload(trimmed, promptContext);
      if (slides.length === 0) {
        setIngestError('No valid slides were detected in the pasted payload. Please check the JSON array format from LS-Doc 4.');
        return;
      }

      // Extract optional metadata (title, description) from payload
      const meta = (slides as any).metadata;
      if (meta?.title && onUpdateTitle) {
        onUpdateTitle(String(meta.title));
      }
      if (meta?.description && onUpdateDescription) {
        onUpdateDescription(String(meta.description));
      }

      setIngestSuccess(true);
      setTimeout(() => {
        onIngestSlides(slides);
      }, 500);
    } catch (err: any) {
      setIngestError(err.message || 'Failed to parse slide payload. Please ensure you copied the complete JSON array.');
    }
  };

  const completedCount = useMemo(() => {
    return prompts.filter((p) => checklist[p.checkId]).length;
  }, [prompts, checklist]);

  return (
    <>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* MINIMAL LIQUID GLASS FLOATING DOCK (RESTORE BUTTON)          */}
      {/* ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!open && isDockVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1250,
            }}
          >
            <Paper
              elevation={0}
              onClick={() => {
                if (onOpen) onOpen();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                py: 0.85,
                px: 1.6,
                borderRadius: '999px',
                background: 'rgba(15, 23, 42, 0.78)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1.5px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: 'rgba(15, 23, 42, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: alpha(hubColor, 0.2),
                  border: `1.5px solid ${alpha(hubColor, 0.4)}`,
                  color: hubColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 14 }} />
              </Box>

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                Slide Drafting Assistant
              </Typography>

              <Chip
                label={`${completedCount}/5 Steps`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                }}
              />

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDockVisible(false);
                }}
                sx={{
                  p: 0.25,
                  ml: 0.5,
                  color: 'rgba(255, 255, 255, 0.45)',
                  '&:hover': { color: '#fff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MAIN LIQUID GLASS SLIDE-OVER DRAWER                          */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 580, md: 660, lg: 720 },
              maxWidth: '100vw',
              bgcolor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '-8px 0 36px rgba(0, 0, 0, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Sticky Glass Header */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: 2.25,
            borderBottom: '1.5px solid rgba(226, 232, 240, 0.8)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.95) 100%)',
            color: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${hubColor} 0%, #0f172a 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(hubColor, 0.4)}`,
                  flexShrink: 0,
                }}
              >
                <LiveTvIcon sx={{ fontSize: 19, color: '#fff' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    color: '#ffffff',
                    fontSize: { xs: '0.98rem', sm: '1.1rem' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Phase 2: Slide Drafting &amp; Scripting Assistant
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
                  Draft presentation slides, teleprompter notes &amp; fast-ingest into studio
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={() => {
                  onClose();
                  setIsDockVisible(true);
                }}
                title="Minimize to floating dock"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#fff' },
                }}
              >
                <RemoveIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onClose}
                title="Close assistant"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#fff' },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Broadcast Metadata Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', pt: 0.5 }}>
            <Chip
              label={title || 'Untitled Livestream'}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.74rem',
                maxWidth: { xs: 200, sm: 280 },
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            />
            <Chip
              label={category.toUpperCase()}
              size="small"
              sx={{
                bgcolor: alpha(hubColor, 0.25),
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.7rem',
                borderRadius: '8px',
                border: `1px solid ${alpha(hubColor, 0.4)}`,
              }}
            />
            <Chip
              label={`${timeframe.toUpperCase()} ERA`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                fontWeight: 700,
                fontSize: '0.68rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            />
            <Chip
              label={(format || 'industry_teardown').toUpperCase().replace(/_/g, ' ')}
              size="small"
              sx={{
                bgcolor: 'rgba(59, 130, 246, 0.2)',
                color: '#93c5fd',
                fontWeight: 700,
                fontSize: '0.68rem',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.35)',
              }}
            />
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LayersIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
              <Typography sx={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 800 }}>
                {expectedSlideCount} Target Slides
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Scrollable Body Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: { xs: 2.5, sm: 3.5 },
            py: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
          }}
        >
          {/* Quick-Jump Step Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              {prompts.map((p) => {
                const isDone = !!checklist[p.checkId];
                return (
                  <Chip
                    key={p.key}
                    label={`Step ${p.stepNum}: ${p.code}`}
                    size="small"
                    onClick={() => {
                      const el = document.getElementById(`ls-step-${p.stepNum}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    icon={isDone ? <CheckCircleIcon sx={{ fontSize: '13px !important', color: `${p.colorTheme} !important` }} /> : undefined}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isDone ? alpha(p.colorTheme, 0.1) : 'rgba(15, 23, 42, 0.04)',
                      color: isDone ? p.colorTheme : '#475569',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${isDone ? alpha(p.colorTheme, 0.3) : 'rgba(15, 23, 42, 0.08)'}`,
                      '&:hover': {
                        bgcolor: alpha(p.colorTheme, 0.15),
                        borderColor: p.colorTheme,
                      },
                    }}
                  />
                );
              })}
              <Chip
                label="Step 6: Fast Ingest"
                size="small"
                onClick={() => {
                  const el = document.getElementById('ls-step-fast-ingest');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                sx={{
                  cursor: 'pointer',
                  bgcolor: detectedSlideCount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.04)',
                  color: detectedSlideCount > 0 ? '#10b981' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  borderRadius: '8px',
                  border: `1.5px solid ${detectedSlideCount > 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(15, 23, 42, 0.08)'}`,
                }}
              />
            </Box>

            {/* External AI Launch Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button
                size="small"
                component="a"
                href="https://chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.08)',
                  color: '#059669',
                  border: '1.5px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  py: 0.3,
                  px: 1,
                  '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.15)' },
                }}
              >
                ChatGPT
              </Button>
              <Button
                size="small"
                component="a"
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                sx={{
                  bgcolor: 'rgba(217, 119, 6, 0.08)',
                  color: '#d97706',
                  border: '1.5px solid rgba(217, 119, 6, 0.25)',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  py: 0.3,
                  px: 1,
                  '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.15)' },
                }}
              >
                Claude
              </Button>
              <Button
                size="small"
                component="a"
                href="https://gemini.google.com"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                sx={{
                  bgcolor: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563eb',
                  border: '1.5px solid rgba(37, 99, 235, 0.25)',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  py: 0.3,
                  px: 1,
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.15)' },
                }}
              >
                Gemini
              </Button>
            </Box>
          </Paper>

          {/* Sequential Step Prompts */}
          {prompts.map((p) => (
            <Box
              id={`ls-step-${p.stepNum}`}
              key={p.key}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, scrollMarginTop: '90px' }}
            >
              {/* Step Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: p.colorTheme,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    flexShrink: 0,
                    mt: 0.25,
                    boxShadow: `0 4px 12px ${alpha(p.colorTheme, 0.4)}`,
                  }}
                >
                  {p.stepNum}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.25, fontSize: '0.98rem' }}>
                      Step {p.stepNum}: {p.title}
                    </Typography>
                    <Chip
                      label={p.code}
                      size="small"
                      sx={{
                        bgcolor: alpha(p.colorTheme, 0.12),
                        color: p.colorTheme,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        height: 20,
                        borderRadius: '6px',
                        border: `1.5px solid ${alpha(p.colorTheme, 0.3)}`,
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, lineHeight: 1.5, mt: 0.5 }}>
                    {p.instruction}
                  </Typography>
                </Box>
              </Box>

              {/* Terminal Box & Checklist */}
              <Box sx={{ ml: { xs: 0, sm: '44px' }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <PromptTerminalBox
                  id={p.key}
                  codeLabel={p.code}
                  title={`Step ${p.stepNum} · ${p.code}: ${p.title}`}
                  subtitle={p.role}
                  prompt={p.prompt}
                  colorTheme={p.colorTheme}
                  copyButtonLabel={`Copy Step ${p.stepNum} Prompt (${p.code})`}
                  copiedBannerText={`Step ${p.stepNum} (${p.code}) Copied to Clipboard!`}
                  isCopiedExternal={!!checklist[p.checkId]}
                  onCopy={() => handleCopyPromptAutoCheck(p.key)}
                />
                <PromptChecklistItem
                  id={p.checkId}
                  text={p.checkText}
                  checked={!!checklist[p.checkId]}
                  onToggle={toggleChecklistItem}
                  colorTheme={p.colorTheme}
                />
              </Box>
            </Box>
          ))}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 6: FAST INGEST RELAY — INGEST TO STUDIO CANVAS         */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box
            id="ls-step-fast-ingest"
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, scrollMarginTop: '90px', mt: 1, pb: 4 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#0f172a',
                  color: '#10b981',
                  border: '1.5px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  flexShrink: 0,
                  mt: 0.25,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                }}
              >
                6
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.25, fontSize: '0.98rem' }}>
                    Step 6: Ingest &amp; Apply All {expectedSlideCount} Slides to Studio
                  </Typography>
                  <Chip
                    label="FAST INGEST"
                    size="small"
                    sx={{
                      bgcolor: '#0f172a',
                      color: '#10b981',
                      fontWeight: 900,
                      fontSize: '0.68rem',
                      height: 20,
                      borderRadius: '6px',
                      border: '1.5px solid rgba(16, 185, 129, 0.45)',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, lineHeight: 1.5, mt: 0.5 }}>
                  Paste the JSON array output produced by Step 5 (LS-DOC 4) into the terminal below to instantly hydrate your complete presentation slides, presenter notes, and transitions into the editable studio canvas.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ ml: { xs: 0, sm: '44px' } }}>
              <PromptFastIngestBox
                value={rawIngestPayload}
                onChange={(val) => {
                  setRawIngestPayload(val);
                  savePayloadToStorage(val);
                  if (ingestError) setIngestError(null);
                }}
                onIngest={handleParseAndIngest}
                colorTheme="#10b981"
                unitLabel="slides"
                fileName="livestream-slides.json"
                placeholder={`Paste the JSON output from LS-Doc 4 here...\n\nExample:\n[\n  {\n    "id": "def-anchor_tension-1",\n    "sourceType": "def_block",\n    "defBlockId": "anchor_tension",\n    "defBlockLabel": "Block 1: Anchor Tension",\n    "act": "OPEN",\n    "slideIndex": 1,\n    "slideCount": 2,\n    "originalBlockType": "media",\n    "durationStr": "45s",\n    "originalContent": {\n      "title": "The Operational Reality: Field Crisis Snapshot",\n      "subheadline": "The ground disconnect nobody is reporting on",\n      "stat": "₦340B Lost",\n      "text": "Post-harvest perishables sitting at terminal depots."\n    },\n    "speakerNotes": "[LEAN FORWARD] Look closely at this image. Three hundred and forty billion naira evaporates annually..."\n  }\n]`}
                liveBlockCount={detectedSlideCount}
                expectedBlockCount={expectedSlideCount}
                error={ingestError}
                success={ingestSuccess}
                buttonLabel="Ingest &amp; Apply All Slides to Studio"
                hideButtonWhenEmpty={false}
                showButtonIcon={true}
              />
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
