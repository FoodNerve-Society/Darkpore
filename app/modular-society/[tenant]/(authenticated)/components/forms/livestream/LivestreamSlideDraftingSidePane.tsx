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

  const formatEmoji = useMemo(() => {
    if (format === 'panel_debate') return '⚔️';
    if (format === 'talent_spotlight') return '🌟';
    return '🔬';
  }, [format]);

  const formatLabel = useMemo(() => {
    if (format === 'panel_debate') return 'Panel Debate';
    if (format === 'talent_spotlight') return 'Talent Spotlight';
    return 'Industry Teardown';
  }, [format]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                }}
              >
                <span>Slide Drafting Assistant</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                  {formatEmoji} {formatLabel}
                </span>
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

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  ml: 0.2,
                  transition: 'color 0.2s',
                  '&:hover': { color: '#fff' },
                }}
              >
                <OpenInFullIcon sx={{ fontSize: 12 }} />
              </Box>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDockVisible(false);
                }}
                sx={{
                  p: 0.25,
                  ml: 0.2,
                  color: 'rgba(255, 255, 255, 0.45)',
                  '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.15)' },
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
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: '80vw', md: '50vw' },
              minWidth: { sm: 540, md: 620 },
              maxWidth: { xl: 880 },
              height: { xs: '85vh', sm: '100%' },
              maxHeight: { xs: '85vh', sm: '100%' },
              borderRadius: { xs: '24px 24px 0 0', sm: 0 },
              bgcolor: '#f8fafc',
              boxShadow: { xs: '0 -12px 40px rgba(0, 0, 0, 0.18)', sm: '-16px 0 48px rgba(0, 0, 0, 0.18)' },
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* ── FLOATING TOP CONTROLS (CIRCLE MINIMIZE & CIRCLE CLOSE) ── */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 14, sm: 20 },
            right: { xs: 14, sm: 24 },
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            zIndex: 50,
          }}
        >
          {/* Floating Minimize Button */}
          <IconButton
            onClick={() => {
              onClose();
              setIsDockVisible(true);
            }}
            title="Minimize to dock"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              color: '#475569',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#ffffff',
                color: '#0f172a',
                transform: 'scale(1.08)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <RemoveIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Floating Close Button */}
          <IconButton
            onClick={onClose}
            title="Close assistant"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              color: '#475569',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                transform: 'scale(1.08)',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.18)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── SCROLLABLE CANVAS ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Mobile Bottom-Sheet Grabber Pill */}
          {isMobile && (
            <Box sx={{ width: 44, height: 4.5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.22)', mx: 'auto', mt: 1.5, mb: 0.5 }} />
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* HERO SECTION WITH LUXURY RADIAL GRADIENT                     */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box
            sx={{
              position: 'relative',
              pt: { xs: 6, sm: 8 },
              pb: { xs: 2.5, sm: 3.5 },
              px: { xs: 3, sm: 5 },
              background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.09) 0%, rgba(59, 130, 246, 0.04) 55%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Visual Anchor Squircles */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                mt: { xs: 1.5, sm: 1 },
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Left Squircle: Format & Live Studio */}
              <Box
                sx={{
                  width: { xs: 104, sm: 118 },
                  height: { xs: 104, sm: 118 },
                  borderRadius: '28px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  border: '2.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                  transform: 'rotate(-3deg)',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    borderColor: 'rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.55)',
                  },
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 10px #22c55e', mb: 0.75 }} />
                <Typography sx={{ fontSize: '1.75rem', lineHeight: 1 }}>{formatEmoji}</Typography>
                <Typography sx={{ color: '#fff', fontSize: '0.68rem', fontWeight: 900, mt: 0.6, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>
                  {formatLabel}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.58rem', fontWeight: 800, mt: 0.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {expectedSlideCount} Slides
                </Typography>
              </Box>

              {/* Center Intersection Badge */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#0f172a',
                  color: '#f59e0b',
                  border: '2px solid rgba(255, 255, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  zIndex: 2,
                  mx: { xs: -1.75, sm: -2 },
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                }}
              >
                ×
              </Box>

              {/* Right Squircle: Master Category Hub */}
              <Box
                sx={{
                  width: { xs: 104, sm: 118 },
                  height: { xs: 104, sm: 118 },
                  borderRadius: '28px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: `linear-gradient(135deg, ${hubColor} 0%, #0f172a 100%)`,
                  border: '2.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                  transform: 'rotate(3deg)',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    borderColor: 'rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.55)',
                  },
                }}
              >
                <Typography sx={{ fontSize: '1.75rem', lineHeight: 1, mb: 0.5 }}>🌾</Typography>
                <Typography sx={{ color: '#ffffff', fontSize: '0.72rem', fontWeight: 900, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {hubTitle}
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.58rem', fontWeight: 800, mt: 0.3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {timeframe.toUpperCase()} ERA
                </Typography>
              </Box>
            </Box>

            {/* Title & Subtitle */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 950,
                color: '#0f172a',
                letterSpacing: '-0.035em',
                fontSize: { xs: '1.6rem', sm: '2.05rem' },
                lineHeight: 1.18,
                textAlign: 'center',
                mt: 0.5,
              }}
            >
              Get The Full Livestream Here
            </Typography>

            <Typography
              sx={{
                color: '#64748b',
                fontSize: { xs: '0.82rem', sm: '0.88rem' },
                fontWeight: 500,
                lineHeight: 1.55,
                textAlign: 'center',
                maxWidth: 520,
                mt: 1.15,
              }}
            >
              {prompts.length} sequenced master prompts to structure, map diagnostic layers, and ingest your {expectedSlideCount}-slide DEF presentation framework.
            </Typography>

            {/* Quick-Jump Step Anchor Pills */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', justifyContent: 'center', mt: 2.25 }}>
              <Chip
                label="Step 0: Guide"
                size="small"
                onClick={() => scrollToSection('ls-step-0-guide')}
                sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(15, 23, 42, 0.05)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.1)' } }}
              />
              <Chip
                label="1. LS-Doc 2a (The Open)"
                size="small"
                onClick={() => scrollToSection('ls-step-1')}
                icon={checklist['ls_check_2a'] ? <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#ef4444 !important' }} /> : undefined}
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: checklist['ls_check_2a'] ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                  color: '#dc2626',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.18)' },
                }}
              />
              <Chip
                label="2. LS-Doc 2b (The Meat)"
                size="small"
                onClick={() => scrollToSection('ls-step-2')}
                icon={checklist['ls_check_2b'] ? <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#3b82f6 !important' }} /> : undefined}
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: checklist['ls_check_2b'] ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)',
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.18)' },
                }}
              />
              <Chip
                label="3. LS-Doc 2c (The Close)"
                size="small"
                onClick={() => scrollToSection('ls-step-3')}
                icon={checklist['ls_check_2c'] ? <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} /> : undefined}
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: checklist['ls_check_2c'] ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                  color: '#047857',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.18)' },
                }}
              />
              <Chip
                label="4. LS-Doc 3 (Notes)"
                size="small"
                onClick={() => scrollToSection('ls-step-4')}
                icon={checklist['ls_check_3'] ? <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#8b5cf6 !important' }} /> : undefined}
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: checklist['ls_check_3'] ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)',
                  color: '#6d28d9',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.18)' },
                }}
              />
              <Chip
                label="5. LS-Doc 4 (Schema)"
                size="small"
                onClick={() => scrollToSection('ls-step-5')}
                icon={checklist['ls_check_4'] ? <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#06b6d4 !important' }} /> : undefined}
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: checklist['ls_check_4'] ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.08)',
                  color: '#0e7490',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(6, 182, 212, 0.18)' },
                }}
              />
              <Chip
                label="6. Fast Ingest"
                size="small"
                onClick={() => scrollToSection('ls-step-fast-ingest')}
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  bgcolor: detectedSlideCount > 0 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.08)',
                  color: '#047857',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.18)' },
                }}
              />
            </Box>
          </Box>

          {/* ── SCROLLABLE BODY CONTENT ── */}
          <Box sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 0: WORKFLOW OVERVIEW                                    */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="ls-step-0-guide" sx={{ display: 'flex', flexDirection: 'column', gap: 2, scrollMarginTop: '80px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                  0
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 0: How You Guide the AI
                </Typography>
              </Box>

              {/* Step 0 Clean Workflow Card */}
              <Box
                sx={{
                  ml: { xs: 0, sm: '42px' },
                  p: 2.25,
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    1
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                    Your broadcast title (<strong>{title || 'Untitled'}</strong>), {formatLabel} format, {timeframe.toUpperCase()} era, and {expectedSlideCount}-slide DEF framework are auto-injected into each prompt below.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    2
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                      Copy and run each prompt sequentially (Steps 1 to 5) in your preferred AI model:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        component="a"
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          bgcolor: 'rgba(16, 163, 127, 0.08)',
                          color: '#0d9488',
                          border: '1px solid rgba(13, 148, 136, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: 'rgba(16, 163, 127, 0.15)', borderColor: '#0d9488' },
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
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          bgcolor: 'rgba(217, 119, 6, 0.08)',
                          color: '#d97706',
                          border: '1px solid rgba(217, 119, 6, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.15)', borderColor: '#d97706' },
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
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          bgcolor: 'rgba(37, 99, 235, 0.08)',
                          color: '#2563eb',
                          border: '1px solid rgba(37, 99, 235, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.15)', borderColor: '#2563eb' },
                        }}
                      >
                        Gemini
                      </Button>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    3
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                    Paste the JSON output produced by Step 5 (LS-Doc 4) into Step 6 (Fast Ingest) to hydrate your {expectedSlideCount} slides, speaker teleprompter notes, and stage directions directly into the studio.
                  </Typography>
                </Box>
              </Box>
            </Box>

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
      </Box>
    </Drawer>
  </>
);
}
