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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RemoveIcon from '@mui/icons-material/Remove';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { motion, AnimatePresence } from 'framer-motion';

import {
  ArticleFormat,
  ArticleEra,
  FORMAT_CONFIG,
  ERA_CONFIG,
  BlockType,
  getBlueprint,
} from '@/lib/config/articleBlueprints';
import { getCommodityMeta } from '@/lib/cms/commodities';
import { foodChallenges } from '@/lib/cms/food/challenges';
import {
  PromptTerminalBox,
  PromptChecklistItem,
  PromptFastIngestBox,
} from '@/components/prompts';
import {
  buildDoc2aPrompt,
  buildDoc2bPrompt,
  buildDoc2cPrompt,
  buildDoc3aPrompt,
  buildDoc3bPrompt,
  buildDoc3cPrompt,
  buildDoc4aPrompt,
  buildDoc4bPrompt,
  buildDoc4cPrompt,
} from '@/lib/config/articleMasterPrompts';

interface EditorialPromptSidePaneProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  format: ArticleFormat;
  era: ArticleEra;
  commodity: string;
  category: string;
  subcategory: string;
  currentTitle: string;
  currentDescription?: string;
  blocks: Array<{
    id: string;
    type: BlockType;
    role?: string;
    sopDesc?: string;
    sopHint?: string;
    content: Record<string, any>;
  }>;
  pinnedClips?: string[];
  onUpdateBlockContent?: (blockId: string, updatedContent: Record<string, any>) => void;
  onIngestAllBlocks?: (
    newBlocks: Array<{
      id: string;
      type: BlockType;
      content: Record<string, any>;
      role?: string;
      sopDesc?: string;
      sopHint?: string;
    }>
  ) => void;
  onUpdateTitle?: (title: string) => void;
  onUpdateDescription?: (desc: string) => void;
}

export function EditorialPromptSidePane({
  open,
  onClose,
  onOpen,
  format,
  era,
  commodity,
  category,
  subcategory,
  currentTitle,
  currentDescription = '',
  blocks,
  pinnedClips = [],
  onIngestAllBlocks,
  onUpdateTitle,
  onUpdateDescription,
}: EditorialPromptSidePaneProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Floating dock visibility (mimics PromptAssistantContext minimal liquid glass dock)
  const [isDockVisible, setIsDockVisible] = useState(false);

  // Fast Ingest State under Document 4
  const [rawIngestPayload, setRawIngestPayload] = useState('');
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState(false);

  const formatMeta = FORMAT_CONFIG[format] || FORMAT_CONFIG.brief;
  const eraMeta = ERA_CONFIG[era] || ERA_CONFIG.present;
  const currentBlueprint = useMemo(() => getBlueprint(format, era) || [], [format, era]);

  // Keep dock available once opened
  useEffect(() => {
    if (open) {
      setIsDockVisible(true);
    }
  }, [open]);

  // Restore persistence on commodity / category switch
  useEffect(() => {
    if (typeof window !== 'undefined' && commodity && category) {
      const checklistKey = `learn_editorial_sop_tasks_${commodity}_${category}`;
      const scratchpadKey = `learn_editorial_sop_scratchpad_${commodity}_${category}`;

      try {
        const savedChecklist = localStorage.getItem(checklistKey);
        if (savedChecklist) setChecklist(JSON.parse(savedChecklist));
        else setChecklist({});

        const savedScratchpad = localStorage.getItem(scratchpadKey);
        if (savedScratchpad) {
          const parsed = JSON.parse(savedScratchpad);
          setRawIngestPayload(parsed.payload || '');
        } else {
          setRawIngestPayload('');
        }
      } catch {}
    }
  }, [commodity, category]);

  const savePayloadToStorage = useCallback((payload: string) => {
    if (typeof window !== 'undefined' && commodity && category) {
      const scratchpadKey = `learn_editorial_sop_scratchpad_${commodity}_${category}`;
      try {
        localStorage.setItem(scratchpadKey, JSON.stringify({ payload }));
      } catch {}
    }
  }, [commodity, category]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (typeof window !== 'undefined' && commodity && category) {
        localStorage.setItem(`learn_editorial_sop_tasks_${commodity}_${category}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleCopyPromptAutoCheck = (promptKey: string) => {
    const map: Record<string, string> = {
      doc_2a: 'sop_doc2_1',
      doc_2b: 'sop_doc2_2',
      doc_2c: 'sop_doc2_3',
      doc_3a: 'sop_doc3_1',
      doc_3b: 'sop_doc3_2',
      doc_3c: 'sop_doc3_3',
    };
    const targetCheck = map[promptKey];
    if (targetCheck) {
      setChecklist((prev) => {
        const next = { ...prev, [targetCheck]: true };
        if (typeof window !== 'undefined' && commodity && category) {
          localStorage.setItem(`learn_editorial_sop_tasks_${commodity}_${category}`, JSON.stringify(next));
        }
        return next;
      });
    }
  };

  // Commodity & Challenge visual assets
  const commodityMeta = useMemo(() => getCommodityMeta(commodity), [commodity]);
  const challengeMeta = useMemo(() => {
    return (
      foodChallenges.find((c) => c.id.toLowerCase() === category.toLowerCase()) ||
      foodChallenges[0]
    );
  }, [category]);

  // Live Block Detection
  const detectedBlockCount = useMemo(() => {
    if (!rawIngestPayload.trim()) return 0;
    try {
      const trimmed = rawIngestPayload.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.length;
        if (parsed.articleBlocks && Array.isArray(parsed.articleBlocks)) return parsed.articleBlocks.length;
        if (parsed.blocks && Array.isArray(parsed.blocks)) return parsed.blocks.length;
      }
      const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/) || trimmed.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        if (Array.isArray(extracted)) return extracted.length;
        if (extracted.articleBlocks && Array.isArray(extracted.articleBlocks)) return extracted.articleBlocks.length;
        if (extracted.blocks && Array.isArray(extracted.blocks)) return extracted.blocks.length;
      }
    } catch {
      // ignore
    }
    return 0;
  }, [rawIngestPayload]);

  const promptContext = useMemo(() => ({
    format,
    era,
    commodity,
    category,
    subcategory,
    currentTitle,
    currentDescription,
    currentBlueprint,
    pinnedClips,
  }), [format, era, commodity, category, subcategory, currentTitle, currentDescription, currentBlueprint, pinnedClips]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 2: THE DRAFTING ENGINE (2a, 2b, 2c)
  // ═══════════════════════════════════════════════════════════
  const doc2Prompts = useMemo(() => [
    {
      key: 'doc_2a',
      code: 'DOC 2a',
      title: 'The Emotional Wireframer (The Architect)',
      role: `Map ${currentBlueprint.length} blocks sequence & assign emotional targets (Greed, Paranoia, Outrage, Clarity)`,
      prompt: buildDoc2aPrompt(promptContext),
    },
    {
      key: 'doc_2b',
      code: 'DOC 2b',
      title: 'The Intelligence Writer (The Muscle)',
      role: 'Brutal 8th-grade investigative analysis, live OSINT grounding & raw block drafting',
      prompt: buildDoc2bPrompt(promptContext),
    },
    {
      key: 'doc_2c',
      code: 'DOC 2c',
      title: 'The Component Assembler (The Skin)',
      role: 'Strict Markdown compilation matching 17 UI blocks with zero word alterations',
      prompt: buildDoc2cPrompt(promptContext),
    },
  ], [promptContext, currentBlueprint.length]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 3: ENRICHMENT, VISUALS & CONVERSION QA (3a, 3b, 3c)
  // ═══════════════════════════════════════════════════════════
  const doc3Prompts = useMemo(() => [
    {
      key: 'doc_3a',
      code: 'DOC 3a',
      title: 'The OSINT Fact-Checking & Sourcing Engine',
      role: 'In-place factual audit, real price quotes, verified links, and live listings',
      prompt: buildDoc3aPrompt(promptContext),
    },
    {
      key: 'doc_3b',
      code: 'DOC 3b',
      title: 'The Art Director & Visual Asset Expansion Engine',
      role: 'Documentary photojournalism Midjourney/DALL-E prompts with calibrated aspect ratios',
      prompt: buildDoc3bPrompt(promptContext),
    },
    {
      key: 'doc_3c',
      code: 'DOC 3c',
      title: 'The Conversion Architect & Structural QA Engine',
      role: 'Canonical CTA catalog mapping & 5-point pre-flight structural QA audit',
      prompt: buildDoc3cPrompt(promptContext),
    },
  ], [promptContext]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 4: REFINEMENT, BIONIC & CMS COMPILATION (4a, 4b, 4c)
  // ═══════════════════════════════════════════════════════════
  const doc4Prompts = useMemo(() => [
    {
      key: 'doc_4a',
      code: 'DOC 4a',
      title: 'The Jargon Translator & Headline Polisher',
      role: 'Spiky Title badge formatting, plain 8th-grade English scrub & persona tuning',
      prompt: buildDoc4aPrompt(promptContext),
    },
    {
      key: 'doc_4b',
      code: 'DOC 4b',
      title: 'The Bionic Editor & Syntax Linter',
      role: 'Mobile F-pattern bionic reading anchors & syntax linter for clean JSON parsing',
      prompt: buildDoc4bPrompt(promptContext),
    },
    {
      key: 'doc_4c',
      code: 'DOC 4c',
      title: 'The Payload Parser (CMS API Bridge)',
      role: 'Final compilation into strictly valid, headless CMS JSON payload for direct canvas ingest',
      prompt: buildDoc4cPrompt(promptContext),
    },
  ], [promptContext]);

  // Fast Ingest Parser handler with Fast Ingest Protocol Normalization
  const handleParseAndIngest = () => {
    setIngestError(null);
    setIngestSuccess(false);

    const trimmed = rawIngestPayload.trim();
    if (!trimmed) {
      setIngestError('Please paste your generated JSON from Doc 4c into the editor below.');
      return;
    }

    try {
      let parsedBlocks: any[] = [];

      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsedBlocks = parsed;
        } else if (parsed.articleBlocks && Array.isArray(parsed.articleBlocks)) {
          parsedBlocks = parsed.articleBlocks;
          if (parsed.title && onUpdateTitle) {
            const rawTitle = Array.isArray(parsed.title) ? parsed.title[0] : parsed.title;
            onUpdateTitle(String(rawTitle));
          }
          if (parsed.description && onUpdateDescription) {
            const rawDesc = Array.isArray(parsed.description) ? parsed.description[0] : parsed.description;
            onUpdateDescription(String(rawDesc));
          }
        } else if (parsed.blocks && Array.isArray(parsed.blocks)) {
          parsedBlocks = parsed.blocks;
          if (parsed.title && onUpdateTitle) {
            const rawTitle = Array.isArray(parsed.title) ? parsed.title[0] : parsed.title;
            onUpdateTitle(String(rawTitle));
          }
          if (parsed.description && onUpdateDescription) {
            const rawDesc = Array.isArray(parsed.description) ? parsed.description[0] : parsed.description;
            onUpdateDescription(String(rawDesc));
          }
        }
      }

      if (parsedBlocks.length === 0) {
        const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/) || trimmed.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extracted = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          if (Array.isArray(extracted)) {
            parsedBlocks = extracted;
          } else if (extracted.articleBlocks && Array.isArray(extracted.articleBlocks)) {
            parsedBlocks = extracted.articleBlocks;
            if (extracted.title && onUpdateTitle) {
              const rawTitle = Array.isArray(extracted.title) ? extracted.title[0] : extracted.title;
              onUpdateTitle(String(rawTitle));
            }
            if (extracted.description && onUpdateDescription) {
              const rawDesc = Array.isArray(extracted.description) ? extracted.description[0] : extracted.description;
              onUpdateDescription(String(rawDesc));
            }
          } else if (extracted.blocks && Array.isArray(extracted.blocks)) {
            parsedBlocks = extracted.blocks;
            if (extracted.title && onUpdateTitle) {
              const rawTitle = Array.isArray(extracted.title) ? extracted.title[0] : extracted.title;
              onUpdateTitle(String(rawTitle));
            }
            if (extracted.description && onUpdateDescription) {
              const rawDesc = Array.isArray(extracted.description) ? extracted.description[0] : extracted.description;
              onUpdateDescription(String(rawDesc));
            }
          }
        }
      }

      if (parsedBlocks.length === 0) {
        setIngestError('Could not locate a valid block array in the pasted Doc 4c output. Please check formatting.');
        return;
      }

      if (onIngestAllBlocks) {
        const hydrated = parsedBlocks.map((b, idx) => {
          const sop = currentBlueprint[idx];
          const rawType = b.blockType || b.type || sop?.type || 'core_interactive';
          let blockContent = b.content || {};

          // If content is stringified JSON (as generated by Doc 4c), safely parse it
          if (typeof blockContent === 'string') {
            try {
              blockContent = JSON.parse(blockContent);
            } catch (e) {
              // fallback if it's already an unescaped or raw string
            }
          }

          // Fast Ingest Ingestion Protocol: unwrap array wrappers across all fields
          if (blockContent && typeof blockContent === 'object') {
            for (const key of Object.keys(blockContent)) {
              if (
                Array.isArray(blockContent[key]) &&
                blockContent[key].length === 1 &&
                typeof blockContent[key][0] === 'string' &&
                key !== 'checklist' &&
                key !== 'rows' &&
                key !== 'steps' &&
                key !== 'milestones' &&
                key !== 'pairs' &&
                key !== 'items'
              ) {
                blockContent[key] = blockContent[key][0];
              }
            }
          }

          return {
            id: `block_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
            type: rawType as BlockType,
            role: b.role || sop?.role || 'Analysis',
            sopDesc: sop?.desc || '',
            sopHint: sop?.hint || '',
            content: blockContent,
          };
        });

        onIngestAllBlocks(hydrated);
        setIngestSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setIngestError(`Failed to parse payload: ${err.message}`);
    }
  };

  const handleMinimize = () => {
    setIsDockVisible(true);
    onClose();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* MINIMAL LIQUID GLASS FLOATING DOCK (LEARNSTUDIO PARITY)      */}
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
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: 'rgba(15, 23, 42, 0.88)',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {/* Minimal AI Sparkle Icon with Soft Glow */}
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 14 }} />
              </Box>

              {/* Minimal Clean 1-Line Meta */}
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
                <span>Get Full Articles</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{commodity.split(',')[0]}</span>
              </Typography>

              {/* Minimal Expand Icon */}
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

              {/* Minimal Dismiss (X) */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDockVisible(false);
                }}
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  p: 0.35,
                  ml: -0.5,
                  '&:hover': {
                    color: '#ef4444',
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* FULL DRAWER                                                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: 580, md: 680 },
              maxWidth: '100vw',
              bgcolor: '#f8fafc',
              boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
            },
          },
        }}
      >
        {/* ──────────────────────────────────────────────────────────── */}
        {/* STICKY GLASSMORPHISM LUXURY HEADER (LEARNSTUDIO & WIKI PARITY) */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box
          sx={{
            px: { xs: 2.25, sm: 3.5 },
            py: { xs: 2, sm: 2.25 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                flexShrink: 0,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  fontSize: { xs: '1.05rem', sm: '1.18rem' },
                  letterSpacing: '-0.025em',
                }}
              >
                Get Full Articles Here
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.35 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
                <Typography
                  sx={{
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Sequenced master prompts across Docs 2, 3 &amp; 4 for your {currentBlueprint.length}-block SOP
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Minimize Button (Studio parity) */}
            <Button
              size="small"
              onClick={handleMinimize}
              startIcon={<RemoveIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                color: '#334155',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '12px',
                px: 1.5,
                py: 0.6,
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)', transform: 'translateY(-1px)' },
              }}
            >
              Minimize
            </Button>

            {/* Close Button */}
            <IconButton
              onClick={onClose}
              sx={{
                color: '#64748b',
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '12px',
                p: 0.85,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* SCROLLABLE SEQUENTIAL PROMPT BODY (NO TABS, SEAMLESS FLOW)    */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 2.5, sm: 3.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4.5,
          }}
        >
          {/* ──────────────────────────────────────────────────────────── */}
          {/* VISUAL ANCHOR: DUAL SQUIRCLE INTERSECTION                     */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 1,
            }}
          >
            {/* Left Squircle: Commodity */}
            <Box
              sx={{
                width: { xs: 120, sm: 135 },
                height: { xs: 120, sm: 135 },
                borderRadius: '28px',
                overflow: 'hidden',
                position: 'relative',
                backgroundImage: `url(${commodityMeta?.imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid #ffffff',
                boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)',
                transform: 'rotate(-3deg)',
                zIndex: 1,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'rotate(0deg) scale(1.06)',
                  zIndex: 3,
                  boxShadow: '0 20px 44px -8px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.85) 100%)' }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 6,
                  right: 6,
                  p: '3px 8px',
                  borderRadius: '10px',
                  bgcolor: 'rgba(0, 0, 0, 0.55)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <Typography
                  sx={{
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  🌾 {commodity.split(',')[0]}
                </Typography>
              </Box>
            </Box>

            {/* Center Intersection Badge */}
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                bgcolor: '#0f172a',
                color: '#f59e0b',
                border: '3px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 900,
                zIndex: 2,
                mx: { xs: -2, sm: -2.5 },
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.3)',
              }}
            >
              ×
            </Box>

            {/* Right Squircle: Strategic Pillar */}
            <Box
              sx={{
                width: { xs: 120, sm: 135 },
                height: { xs: 120, sm: 135 },
                borderRadius: '28px',
                overflow: 'hidden',
                position: 'relative',
                backgroundImage: `url(${challengeMeta?.imageUrl || '/images/challenges/insecurity.webp'}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid #ffffff',
                boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)',
                transform: 'rotate(3deg)',
                zIndex: 1,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'rotate(0deg) scale(1.06)',
                  zIndex: 3,
                  boxShadow: '0 20px 44px -8px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.85) 100%)' }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 6,
                  right: 6,
                  p: '3px 8px',
                  borderRadius: '10px',
                  bgcolor: 'rgba(0, 0, 0, 0.55)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <Typography
                  sx={{
                    color: '#93c5fd',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  🛡️ {category.split(' ')[0]}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Tactical Context Chips & Quick Section Jumps */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              flexWrap: 'wrap',
              mt: -1.5,
            }}
          >
            <Chip
              label={`${formatMeta.emoji} ${formatMeta.label} (${eraMeta.label} Era)`}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: alpha(formatMeta.color, 0.12),
                color: formatMeta.color,
                border: `1px solid ${alpha(formatMeta.color, 0.25)}`,
              }}
            />
            <Chip
              label={`🎯 ${currentBlueprint.length} Blocks SOP`}
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#f1f5f9', color: '#334155' }}
            />
            {subcategory && (
              <Chip
                label={`📍 ${subcategory}`}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#f1f5f9', color: '#475569' }}
              />
            )}
            {pinnedClips.length > 0 && (
              <Chip
                label={`📎 ${pinnedClips.length} Attached Ground Notes`}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: alpha('#059669', 0.12),
                  color: '#059669',
                  border: `1px solid ${alpha('#059669', 0.25)}`,
                }}
              />
            )}
          </Box>

          {/* Quick Anchor Navigation Pills */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              flexWrap: 'wrap',
              bgcolor: 'rgba(0, 0, 0, 0.03)',
              p: 1,
              borderRadius: '16px',
            }}
          >
            <Chip
              label="DOC 2 · Drafting Engine"
              size="small"
              onClick={() => scrollToSection('editorial-doc-2')}
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: '#ffffff',
                color: '#3b82f6',
                cursor: 'pointer',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                '&:hover': { bgcolor: alpha('#3b82f6', 0.1) },
              }}
            />
            <Chip
              label="DOC 3 · Visuals & QA"
              size="small"
              onClick={() => scrollToSection('editorial-doc-3')}
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: '#ffffff',
                color: '#f59e0b',
                cursor: 'pointer',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                '&:hover': { bgcolor: alpha('#f59e0b', 0.1) },
              }}
            />
            <Chip
              label="DOC 4 · CMS Compiler"
              size="small"
              onClick={() => scrollToSection('editorial-doc-4')}
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: '#ffffff',
                color: '#10b981',
                cursor: 'pointer',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                '&:hover': { bgcolor: alpha('#10b981', 0.1) },
              }}
            />
            <Chip
              label="FAST INGEST · Canvas Relay"
              size="small"
              onClick={() => scrollToSection('editorial-doc-fast-ingest')}
              sx={{
                fontWeight: 900,
                fontSize: '0.72rem',
                bgcolor: '#0f172a',
                color: '#10b981',
                cursor: 'pointer',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            />
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 2: DOCUMENT 2 — DRAFTING ENGINE (2a, 2b, 2c)         */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="editorial-doc-2" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#3b82f6',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                }}
              >
                2
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  Document 2: The Drafting Engine (2a, 2b, 2c)
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  Map your {currentBlueprint.length} blocks, write brutal OSINT intelligence, and assemble component Markdown.
                </Typography>
              </Box>
            </Box>

            {/* Action Checklist for Document 2 using PromptChecklistItem */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.75,
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '14px',
                bgcolor: 'rgba(59, 130, 246, 0.03)',
              }}
            >
              {[
                { id: 'sop_doc2_1', text: `1. Run Doc 2a to look up sequence & assign 4 emotional targets across ${currentBlueprint.length} blocks.` },
                { id: 'sop_doc2_2', text: `2. Run Doc 2b with live OSINT to draft raw text in brutal 8th-grade English.` },
                { id: 'sop_doc2_3', text: `3. Run Doc 2c to assemble raw text into canonical React component Markdown.` },
              ].map((item) => (
                <PromptChecklistItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  checked={!!checklist[item.id]}
                  onToggle={toggleChecklistItem}
                  colorTheme="#3b82f6"
                />
              ))}
            </Box>

            {/* Prompt Cards for Document 2 using PromptTerminalBox */}
            {doc2Prompts.map((p) => (
              <PromptTerminalBox
                key={p.key}
                id={p.key}
                codeLabel={p.code}
                title={p.title}
                subtitle={p.role}
                prompt={p.prompt}
                colorTheme="#3b82f6"
                copyButtonLabel={`Copy ${p.code} Prompt`}
                copiedBannerText={`${p.code} Copied to Clipboard!`}
                onCopy={() => handleCopyPromptAutoCheck(p.key)}
              />
            ))}
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 3: DOCUMENT 3 — ENRICHMENT, VISUALS & QA (3a, 3b, 3c)*/}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="editorial-doc-3" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#f59e0b',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                }}
              >
                3
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  Document 3: Enrichment, Visual Assets &amp; QA (3a, 3b, 3c)
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  Verify live metrics, calibrate documentary photojournalism prompts, and map conversion CTAs.
                </Typography>
              </Box>
            </Box>

            {/* Action Checklist for Document 3 using PromptChecklistItem */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.75,
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '14px',
                bgcolor: 'rgba(245, 158, 11, 0.03)',
              }}
            >
              {[
                { id: 'sop_doc3_1', text: '1. Run Doc 3a for in-place factual audits, verified quotes & live ecosystem opportunities.' },
                { id: 'sop_doc3_2', text: '2. Run Doc 3b to expand image placeholders into photojournalism prompts (-ar 16:9, -ar 1:1).' },
                { id: 'sop_doc3_3', text: '3. Run Doc 3c to map canonical platform CTAs and complete the 5-point structural QA audit.' },
              ].map((item) => (
                <PromptChecklistItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  checked={!!checklist[item.id]}
                  onToggle={toggleChecklistItem}
                  colorTheme="#f59e0b"
                />
              ))}
            </Box>

            {/* Prompt Cards for Document 3 using PromptTerminalBox */}
            {doc3Prompts.map((p) => (
              <PromptTerminalBox
                key={p.key}
                id={p.key}
                codeLabel={p.code}
                title={p.title}
                subtitle={p.role}
                prompt={p.prompt}
                colorTheme="#f59e0b"
                copyButtonLabel={`Copy ${p.code} Prompt`}
                copiedBannerText={`${p.code} Copied to Clipboard!`}
                onCopy={() => handleCopyPromptAutoCheck(p.key)}
              />
            ))}
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 4: DOCUMENT 4 — REFINEMENT & INGESTION (4a, 4b, 4c)  */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="editorial-doc-4" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 2, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                }}
              >
                4
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  Document 4: Refinement, Typography &amp; CMS Compilation (4a, 4b, 4c)
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  Polish headlines, apply bionic bolding anchors, and compile into headless CMS JSON.
                </Typography>
              </Box>
            </Box>

            {/* Action Checklist for Document 4 using PromptChecklistItem */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.75,
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '14px',
                bgcolor: 'rgba(16, 185, 129, 0.03)',
              }}
            >
              {[
                { id: 'sop_doc4_1', text: '1. Run Doc 4a to calibrate spiky headline for badge splitting and translate to plain English.' },
                { id: 'sop_doc4_2', text: '2. Run Doc 4b to inject bionic reading bolding anchors and lint Markdown syntax.' },
                { id: 'sop_doc4_3', text: '3. Run Doc 4c to compile the payload into strictly valid headless CMS JSON.' },
              ].map((item) => (
                <PromptChecklistItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  checked={!!checklist[item.id]}
                  onToggle={toggleChecklistItem}
                  colorTheme="#10b981"
                />
              ))}
            </Box>

            {/* Prompt Cards for Document 4 (4a, 4b, 4c) using PromptTerminalBox */}
            {doc4Prompts.map((p) => (
              <PromptTerminalBox
                key={p.key}
                id={p.key}
                codeLabel={p.code}
                title={p.title}
                subtitle={p.role}
                prompt={p.prompt}
                colorTheme="#10b981"
                copyButtonLabel={`Copy ${p.code} Prompt`}
                copiedBannerText={`${p.code} Copied to Clipboard!`}
                onCopy={() => handleCopyPromptAutoCheck(p.key)}
              />
            ))}

            {/* Fast Ingest Relay Terminal using PromptFastIngestBox */}
            <Box id="editorial-doc-fast-ingest" sx={{ scrollMarginTop: '80px', mt: 1 }}>
              <PromptFastIngestBox
                value={rawIngestPayload}
                onChange={(val) => {
                  setRawIngestPayload(val);
                  savePayloadToStorage(val);
                  if (ingestError) setIngestError(null);
                }}
                onIngest={handleParseAndIngest}
                codeLabel="FAST INGEST"
                title="Fast Ingest Relay & Canvas Import"
                subtitle={`Paste the JSON output from Doc 4c below to automatically populate all ${currentBlueprint.length} blocks onto your canvas.`}
                colorTheme="#10b981"
                liveBlockCount={detectedBlockCount}
                expectedBlockCount={currentBlueprint.length}
                error={ingestError}
                success={ingestSuccess}
                buttonLabel="⚡ Ingest & Apply All Blocks to Canvas"
              />
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default EditorialPromptSidePane;
