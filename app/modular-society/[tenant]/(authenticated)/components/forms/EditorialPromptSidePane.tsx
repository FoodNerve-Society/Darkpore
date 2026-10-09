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
import PlaceIcon from '@mui/icons-material/Place';
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
import { usePromptAssistant } from '@/context/PromptAssistantContext';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Floating dock visibility (mimics PromptAssistantContext minimal liquid glass dock)
  const [isDockVisible, setIsDockVisible] = useState(false);
  const { suspendDock, setHasEditorDock } = usePromptAssistant();

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

  // Idea 2: Drawer-Aware Auto-Tuck - Suppress background floating docks while this drawer is open
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

  // Idea 4: Stacking Coordination - Inform global context when this local dock is active to stack without collision
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
      doc_4a: 'sop_doc4_1',
      doc_4b: 'sop_doc4_2',
      doc_4c: 'sop_doc4_3',
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

  const cleanSubcategory = useMemo(() => {
    if (!subcategory) return '';
    return subcategory.replace(/\s*\(.*?\)\s*$/, '').trim();
  }, [subcategory]);

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
      stepNum: 1,
      code: 'DOC 2a',
      title: 'The Emotional Wireframer (The Architect)',
      instruction: `Run Doc 2a in your AI model to map out your ${currentBlueprint.length}-block article sequence and assign emotional engagement targets (Greed, Paranoia, Outrage, Clarity) to anchor audience tension.`,
      role: `Map ${currentBlueprint.length} blocks sequence & assign emotional targets (Greed, Paranoia, Outrage, Clarity)`,
      prompt: buildDoc2aPrompt(promptContext),
      checkId: 'sop_doc2_1',
      checkText: `Run Doc 2a to look up sequence & assign 4 emotional targets across ${currentBlueprint.length} blocks.`,
    },
    {
      key: 'doc_2b',
      stepNum: 2,
      code: 'DOC 2b',
      title: 'The Intelligence Writer (The Muscle)',
      instruction: 'Feed the Doc 2a response into your model and run Doc 2b. This drafts raw investigative prose with live OSINT evidence in brutal 8th-grade English without fluff.',
      role: 'Brutal 8th-grade investigative analysis, live OSINT grounding & raw block drafting',
      prompt: buildDoc2bPrompt(promptContext),
      checkId: 'sop_doc2_2',
      checkText: 'Run Doc 2b with live OSINT to draft raw text in brutal 8th-grade English.',
    },
    {
      key: 'doc_2c',
      stepNum: 3,
      code: 'DOC 2c',
      title: 'The Component Assembler (The Skin)',
      instruction: 'Feed the drafted text into Doc 2c to assemble all sections into canonical React component Markdown matching our 17 platform UI blocks.',
      role: 'Strict Markdown compilation matching 17 UI blocks with zero word alterations',
      prompt: buildDoc2cPrompt(promptContext),
      checkId: 'sop_doc2_3',
      checkText: 'Run Doc 2c to assemble raw text into canonical React component Markdown.',
    },
  ], [promptContext, currentBlueprint.length]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 3: ENRICHMENT, VISUAL ASSETS & CONVERSION QA (3a, 3b, 3c)
  // ═══════════════════════════════════════════════════════════
  const doc3Prompts = useMemo(() => [
    {
      key: 'doc_3a',
      stepNum: 4,
      code: 'DOC 3a',
      title: 'The OSINT Fact-Checking & Sourcing Engine',
      instruction: 'Run Doc 3a to perform an in-place forensic audit verifying real price quotes, production metrics, source URLs, and live market trade data.',
      role: 'In-place factual audit, real price quotes, verified links, and live listings',
      prompt: buildDoc3aPrompt(promptContext),
      checkId: 'sop_doc3_1',
      checkText: 'Run Doc 3a for in-place factual audits, verified quotes & live ecosystem opportunities.',
    },
    {
      key: 'doc_3b',
      stepNum: 5,
      code: 'DOC 3b',
      title: 'The Art Director & Visual Asset Expansion Engine',
      instruction: 'Run Doc 3b to expand visual placeholders into authentic photojournalism prompts (-ar 16:9 cinematic & -ar 1:1 square) ready for Midjourney or DALL-E.',
      role: 'Documentary photojournalism Midjourney/DALL-E prompts with calibrated aspect ratios',
      prompt: buildDoc3bPrompt(promptContext),
      checkId: 'sop_doc3_2',
      checkText: 'Run Doc 3b to expand image placeholders into photojournalism prompts (-ar 16:9, -ar 1:1).',
    },
    {
      key: 'doc_3c',
      stepNum: 6,
      code: 'DOC 3c',
      title: 'The Conversion Architect & Structural QA Engine',
      instruction: 'Run Doc 3c to map high-converting platform CTAs (Jobs, Deals, Bounties) and pass the mandatory 5-point structural pre-flight QA checklist.',
      role: 'Canonical CTA catalog mapping & 5-point pre-flight structural QA audit',
      prompt: buildDoc3cPrompt(promptContext),
      checkId: 'sop_doc3_3',
      checkText: 'Run Doc 3c to map canonical platform CTAs and complete the 5-point structural QA audit.',
    },
  ], [promptContext]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 4: REFINEMENT, BIONIC & CMS COMPILATION (4a, 4b, 4c)
  // ═══════════════════════════════════════════════════════════
  const doc4Prompts = useMemo(() => [
    {
      key: 'doc_4a',
      stepNum: 7,
      code: 'DOC 4a',
      title: 'The Jargon Translator & Headline Polisher',
      instruction: 'Run Doc 4a to craft category-split spiky headlines and scrub any remaining insider academic jargon into direct 8th-grade punch.',
      role: 'Spiky Title badge formatting, plain 8th-grade English scrub & persona tuning',
      prompt: buildDoc4aPrompt(promptContext),
      checkId: 'sop_doc4_1',
      checkText: 'Run Doc 4a to calibrate spiky headline for badge splitting and translate to plain English.',
    },
    {
      key: 'doc_4b',
      stepNum: 8,
      code: 'DOC 4b',
      title: 'The Bionic Editor & Syntax Linter',
      instruction: 'Run Doc 4b to inject bolded bionic reading anchors for rapid mobile reading and lint Markdown delimiters for clean JSON parsing.',
      role: 'Mobile F-pattern bionic reading anchors & syntax linter for clean JSON parsing',
      prompt: buildDoc4bPrompt(promptContext),
      checkId: 'sop_doc4_2',
      checkText: 'Run Doc 4b to inject bionic reading bolding anchors and lint Markdown syntax.',
    },
    {
      key: 'doc_4c',
      stepNum: 9,
      code: 'DOC 4c',
      title: 'The Payload Parser (CMS API Bridge)',
      instruction: 'Run Doc 4c to compile the entire validated article into strict, machine-readable JSON format ready for instant import.',
      role: 'Final compilation into strictly valid, headless CMS JSON payload for direct canvas ingest',
      prompt: buildDoc4cPrompt(promptContext),
      checkId: 'sop_doc4_3',
      checkText: 'Run Doc 4c to compile the payload into strictly valid headless CMS JSON.',
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
            onClick={handleMinimize}
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
          {/* HERO SECTION                                                 */}
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
            {/* 1. Intersecting Squircles Image Pair */}
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
              {/* Left Squircle: Commodity */}
              <Box
                sx={{
                  width: { xs: 104, sm: 118 },
                  height: { xs: 104, sm: 118 },
                  borderRadius: '28px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${commodityMeta?.imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                  transform: 'rotate(-3deg)',
                  zIndex: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    borderColor: 'rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.55)',
                  },
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.85) 100%)' }} />
                <Typography sx={{ position: 'absolute', bottom: 7, left: 4, right: 4, color: '#fff', fontSize: '0.7rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🌾 {commodity.split(',')[0]}
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
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                }}
              >
                ×
              </Box>

              {/* Right Squircle: Strategic Challenge */}
              <Box
                sx={{
                  width: { xs: 104, sm: 118 },
                  height: { xs: 104, sm: 118 },
                  borderRadius: '28px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${challengeMeta.imageUrl}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                  transform: 'rotate(3deg)',
                  zIndex: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    borderColor: 'rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.55)',
                  },
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.85) 100%)' }} />
                <Typography sx={{ position: 'absolute', bottom: 7, left: 4, right: 4, color: '#93c5fd', fontSize: '0.7rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🛡️ {category.split(' ')[0]}
                </Typography>
              </Box>
            </Box>

            {/* 2. Centered Large Hero Text */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 950,
                color: '#0f172a',
                letterSpacing: '-0.035em',
                fontSize: { xs: '1.6rem', sm: '2.05rem' },
                lineHeight: 1.18,
                textAlign: 'center',
              }}
            >
              Get Full Articles Here
            </Typography>

            {/* 3. Centered Smaller Description */}
            <Typography
              sx={{
                color: '#64748b',
                fontSize: { xs: '0.8rem', sm: '0.86rem' },
                fontWeight: 500,
                lineHeight: 1.55,
                textAlign: 'center',
                maxWidth: 520,
                mt: 1.15,
              }}
            >
              Sequenced master prompts across Docs 2, 3 &amp; 4 for your {currentBlueprint.length}-block SOP framework.
            </Typography>

            {/* 4. Unified Pre-Planned Editorial Dossier Card */}
            <Box
              sx={{
                width: '100%',
                maxWidth: 620,
                mt: 3,
                p: { xs: 2.25, sm: 2.5 },
                borderRadius: '22px',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 10px 32px -6px rgba(15, 23, 42, 0.07), 0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.75,
                textAlign: 'left',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                {cleanSubcategory && (
                  <Chip
                    label={`📍 ${cleanSubcategory}`}
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
                  gap: 1,
                  flexWrap: 'wrap',
                  pt: 0.5,
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                }}
              >
                <Chip
                  label="STEP 0 · Overview"
                  size="small"
                  onClick={() => scrollToSection('editorial-step-0')}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    bgcolor: '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer',
                    border: '1px solid rgba(15, 23, 42, 0.15)',
                    '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.06)' },
                  }}
                />
                <Chip
                  label="DOC 2 · Steps 1–3"
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
                  label="DOC 3 · Steps 4–6"
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
                  label="DOC 4 · Steps 7–9"
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
                  label="FAST INGEST · Step 10"
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
            </Box>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP PROGRESSION BODY CONTENT                                */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box sx={{ px: { xs: 2.5, sm: 4.5 }, pb: { xs: 4, sm: 5 }, pt: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 0: WORKFLOW OVERVIEW                                    */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="editorial-step-0" sx={{ display: 'flex', flexDirection: 'column', gap: 2, scrollMarginTop: '80px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                  0
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 0: How You Guide the AI
                </Typography>
              </Box>

              {/* Step 0 Minimal Workflow Card */}
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
                    Your selected commodity, category, and {currentBlueprint.length}-block blueprint are auto-injected into each prompt below.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    2
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                      Copy and run each prompt sequentially (Steps 1 to 9) in your preferred AI model:
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
                    Paste the Step 9 (DOC 4c) JSON output directly into Step 10 (Fast Ingest) to apply all {currentBlueprint.length} blocks to your canvas.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* DOCUMENT 2: THE DRAFTING ENGINE (STEPS 1, 2, 3)              */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="editorial-doc-2" sx={{ display: 'flex', flexDirection: 'column', gap: 3, scrollMarginTop: '80px' }}>
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
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
                  }}
                >
                  2
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                    Document 2: The Drafting Engine (Steps 1, 2, 3)
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                    Map your {currentBlueprint.length} blocks, write brutal OSINT intelligence, and assemble component Markdown.
                  </Typography>
                </Box>
              </Box>

              {doc2Prompts.map((p) => (
                <Box id={`editorial-step-${p.stepNum}`} key={p.key} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, scrollMarginTop: '80px' }}>
                  {/* Step Header with Step Badge & Instructions */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
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
                        fontSize: '0.88rem',
                        flexShrink: 0,
                        mt: 0.25,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
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
                            bgcolor: alpha('#3b82f6', 0.12),
                            color: '#3b82f6',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 20,
                            borderRadius: '6px',
                            border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                          }}
                        />
                      </Box>

                      {/* Clear Step Instruction */}
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, lineHeight: 1.5, mt: 0.5 }}>
                        {p.instruction}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Prompt Terminal Box & Checklist */}
                  <Box sx={{ ml: { xs: 0, sm: '44px' }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <PromptTerminalBox
                      id={p.key}
                      codeLabel={p.code}
                      title={`Step ${p.stepNum} · ${p.code}: ${p.title}`}
                      subtitle={p.role}
                      prompt={p.prompt}
                      colorTheme="#3b82f6"
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
                      colorTheme="#3b82f6"
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', my: 0.5 }} />

            {/* ──────────────────────────────────────────────────────────── */}
            {/* DOCUMENT 3: ENRICHMENT, VISUAL ASSETS & QA (STEPS 4, 5, 6)   */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="editorial-doc-3" sx={{ display: 'flex', flexDirection: 'column', gap: 3, scrollMarginTop: '80px' }}>
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
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  3
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                    Document 3: Enrichment, Visual Assets &amp; QA (Steps 4, 5, 6)
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                    Verify live metrics, calibrate documentary photojournalism prompts, and map conversion CTAs.
                  </Typography>
                </Box>
              </Box>

              {doc3Prompts.map((p) => (
                <Box id={`editorial-step-${p.stepNum}`} key={p.key} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, scrollMarginTop: '80px' }}>
                  {/* Step Header with Step Badge & Instructions */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
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
                        fontSize: '0.88rem',
                        flexShrink: 0,
                        mt: 0.25,
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
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
                            bgcolor: alpha('#f59e0b', 0.12),
                            color: '#f59e0b',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 20,
                            borderRadius: '6px',
                            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
                          }}
                        />
                      </Box>

                      {/* Clear Step Instruction */}
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, lineHeight: 1.5, mt: 0.5 }}>
                        {p.instruction}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Prompt Terminal Box & Checklist */}
                  <Box sx={{ ml: { xs: 0, sm: '44px' }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <PromptTerminalBox
                      id={p.key}
                      codeLabel={p.code}
                      title={`Step ${p.stepNum} · ${p.code}: ${p.title}`}
                      subtitle={p.role}
                      prompt={p.prompt}
                      colorTheme="#f59e0b"
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
                      colorTheme="#f59e0b"
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', my: 0.5 }} />

            {/* ──────────────────────────────────────────────────────────── */}
            {/* DOCUMENT 4: REFINEMENT & CMS COMPILATION (STEPS 7, 8, 9)     */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="editorial-doc-4" sx={{ display: 'flex', flexDirection: 'column', gap: 3, scrollMarginTop: '80px' }}>
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
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  4
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                    Document 4: Refinement, Typography &amp; CMS Compilation (Steps 7, 8, 9)
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                    Polish headlines, apply bionic bolding anchors, and compile into headless CMS JSON.
                  </Typography>
                </Box>
              </Box>

              {doc4Prompts.map((p) => (
                <Box id={`editorial-step-${p.stepNum}`} key={p.key} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, scrollMarginTop: '80px' }}>
                  {/* Step Header with Step Badge & Instructions */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
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
                        fontSize: '0.88rem',
                        flexShrink: 0,
                        mt: 0.25,
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
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
                            bgcolor: alpha('#10b981', 0.12),
                            color: '#10b981',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 20,
                            borderRadius: '6px',
                            border: `1px solid ${alpha('#10b981', 0.3)}`,
                          }}
                        />
                      </Box>

                      {/* Clear Step Instruction */}
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, lineHeight: 1.5, mt: 0.5 }}>
                        {p.instruction}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Prompt Terminal Box & Checklist */}
                  <Box sx={{ ml: { xs: 0, sm: '44px' }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <PromptTerminalBox
                      id={p.key}
                      codeLabel={p.code}
                      title={`Step ${p.stepNum} · ${p.code}: ${p.title}`}
                      subtitle={p.role}
                      prompt={p.prompt}
                      colorTheme="#10b981"
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
                      colorTheme="#10b981"
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', my: 0.5 }} />

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 10: FAST INGEST — INGEST TO CANVAS                       */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="editorial-doc-fast-ingest" sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, scrollMarginTop: '80px', mt: 1, pb: 2 }}>
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
                  10
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.25, fontSize: '0.98rem' }}>
                      Step 10: Ingest &amp; Apply All {currentBlueprint.length} Blocks to Canvas
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
                        border: '1px solid rgba(16, 185, 129, 0.45)',
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, lineHeight: 1.5, mt: 0.5 }}>
                    Paste the raw JSON payload produced by Step 9 (DOC 4c) to instantly populate all {currentBlueprint.length} blocks onto your canvas in one pass.
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
                  liveBlockCount={detectedBlockCount}
                  expectedBlockCount={currentBlueprint.length}
                  error={ingestError}
                  success={ingestSuccess}
                  buttonLabel={`Ingest & Apply All ${currentBlueprint.length} Blocks to Canvas`}
                />
              </Box>
            </Box>

          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default EditorialPromptSidePane;
