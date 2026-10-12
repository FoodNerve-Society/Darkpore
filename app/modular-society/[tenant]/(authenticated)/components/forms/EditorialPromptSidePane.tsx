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
      instruction: 'Feed the Doc 2a response into your model and run Doc 2b. This drafts raw investigative prose with live OSINT evidence and the final badge-splitting headline formula.',
      role: 'Brutal 8th-grade investigative analysis, live OSINT grounding & baked-in badge-splitting title',
      prompt: buildDoc2bPrompt(promptContext),
      checkId: 'sop_doc2_2',
      checkText: 'Run Doc 2b with live OSINT to draft raw text with badge-splitting headline.',
    },
    {
      key: 'doc_2c',
      stepNum: 3,
      code: 'DOC 2c',
      title: 'The Component Assembler (The Skin)',
      instruction: 'Feed the drafted text into Doc 2c to assemble all sections into canonical React component Markdown matching our platform UI blocks.',
      role: 'Strict Markdown compilation matching 17 UI blocks with zero word alterations',
      prompt: buildDoc2cPrompt(promptContext),
      checkId: 'sop_doc2_3',
      checkText: 'Run Doc 2c to assemble raw text into canonical React component Markdown.',
    },
  ], [promptContext, currentBlueprint.length]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 3: ENRICHMENT, VISUAL ASSETS & CONVERSION (3a, 3b)
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
      title: 'The Art Director & Conversion Engine',
      instruction: 'Run Doc 3b to expand visual placeholders into authentic photojournalism prompts (-ar 16:9, -ar 1:1) and map canonical platform CTAs in one step.',
      role: 'Documentary photojournalism Midjourney prompts (-ar 16:9, -ar 1:1) & canonical CTA catalog binding',
      prompt: buildDoc3bPrompt(promptContext),
      checkId: 'sop_doc3_2',
      checkText: 'Run Doc 3b to expand photojournalism prompts and bind canonical platform CTAs.',
    },
  ], [promptContext]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 4: REFINEMENT, FLOW & CMS COMPILATION (4a, 4b, 4c)
  // ═══════════════════════════════════════════════════════════
  const doc4Prompts = useMemo(() => [
    {
      key: 'doc_4a',
      stepNum: 6,
      code: 'DOC 4a',
      title: 'The Plain English & Bionic Reading Editor',
      instruction: 'Run Doc 4a to translate insider academic jargon into direct 8th-grade punch and apply mobile bionic bolding anchors in one pass.',
      role: 'Plain 8th-grade English scrub, sentence de-nesting & mobile F-pattern bionic bolding',
      prompt: buildDoc4aPrompt(promptContext),
      checkId: 'sop_doc4_1',
      checkText: 'Run Doc 4a to translate to plain English and inject bionic reading bolding anchors.',
    },
    {
      key: 'doc_4b',
      stepNum: 7,
      code: 'DOC 4b',
      title: 'The Narrative Flow & Sequence Optimizer',
      instruction: 'Run Doc 4b to review the full draft, keep the 3-Up/3-Down bookends locked, and reorder the middle blocks for maximum dramatic pacing and reader retention.',
      role: 'Macro narrative flow audit, middle block re-sequencing & dramatic pacing optimization',
      prompt: buildDoc4bPrompt(promptContext),
      checkId: 'sop_doc4_2',
      checkText: 'Run Doc 4b to audit narrative tension and optimize middle block sequencing.',
    },
    {
      key: 'doc_4c',
      stepNum: 8,
      code: 'DOC 4c',
      title: 'The Payload Parser (CMS API Bridge)',
      instruction: 'Run Doc 4c to sanitize formatting and compile the entire validated article into strict, machine-readable JSON format ready for instant import.',
      role: 'Full sanitization sweep & compilation into strictly valid, headless CMS JSON payload for direct canvas ingest',
      prompt: buildDoc4cPrompt(promptContext),
      checkId: 'sop_doc4_3',
      checkText: 'Run Doc 4c to sanitize syntax and compile the payload into strictly valid headless CMS JSON.',
    },
  ], [promptContext]);

  const allPrompts = useMemo(() => [
    ...doc2Prompts.map(p => ({ ...p, colorTheme: '#3b82f6' })),
    ...doc3Prompts.map(p => ({ ...p, colorTheme: '#f59e0b' })),
    ...doc4Prompts.map(p => ({ ...p, colorTheme: '#10b981' })),
  ], [doc2Prompts, doc3Prompts, doc4Prompts]);

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
          const rawType = (b.blockType || b.type || currentBlueprint[idx]?.type || 'core_interactive') as BlockType;
          const sop = currentBlueprint.find((s) => s.type === rawType) || currentBlueprint[idx];
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

          if (rawType === 'live_poll' && typeof blockContent === 'object') {
            if (Array.isArray(blockContent.options)) {
              blockContent.options = blockContent.options.map((o: any) => String(o).trim()).filter(Boolean).join(',');
            }
          }

          if (rawType === 'exec_summary' && typeof blockContent === 'object') {
            if (Array.isArray(blockContent.points) && blockContent.points.length >= 3 && !blockContent.point1) {
              blockContent.point1 = blockContent.points[0];
              blockContent.point2 = blockContent.points[1];
              blockContent.point3 = blockContent.points[2];
            }
          }

          if (rawType === 'ecosystem_embed' && typeof blockContent === 'object') {
            blockContent = {
              embedType: blockContent.embedType || 'job',
              title: blockContent.title || '',
              organization: blockContent.organization || '',
              location: blockContent.location || '',
              compensationOrTarget: blockContent.compensationOrTarget || '',
              ctaText: blockContent.ctaText || (blockContent.embedType === 'deal' ? 'Access Deal Room' : 'Apply Now'),
              ctaLink: blockContent.ctaLink || (blockContent.embedType === 'deal' ? '/support' : '/careers'),
              jobId: blockContent.jobId || '',
              ...blockContent,
            };
          }

          return {
            id: `block_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
            type: rawType,
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
                <span>Get The Full Article</span>
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
              Get The Full Article Here
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
              {allPrompts.length} sequenced master prompts to craft, fact-check, and ingest your {currentBlueprint.length}-block SOP framework.
            </Typography>
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
                      Copy and run each prompt sequentially (Steps 1 to 8) in your preferred AI model:
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
                    Continue the conversation in the same AI chat session that started the previous prompt so the model retains full context across all steps.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    4
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                    Paste the Step 8 (DOC 4c) JSON output directly into Step 9 (Fast Ingest) to apply all {currentBlueprint.length} blocks to your canvas.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* SEQUENTIAL PROMPT STEPS (STEPS 1 TO 9)                      */}
            {/* ──────────────────────────────────────────────────────────── */}
            {allPrompts.map((p) => (
              <Box id={`editorial-step-${p.stepNum}`} key={p.key} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, scrollMarginTop: '80px' }}>
                {/* Step Header with Step Badge & Instructions */}
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
                          border: `1px solid ${alpha(p.colorTheme, 0.3)}`,
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
            {/* STEP 9: FAST INGEST — INGEST TO CANVAS                        */}
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
                  9
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.25, fontSize: '0.98rem' }}>
                      Step 9: Ingest &amp; Apply All {currentBlueprint.length} Blocks to Canvas
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
                    Paste the raw JSON payload produced by Step 8 (DOC 4c) to instantly populate all {currentBlueprint.length} blocks onto your canvas in one pass.
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
                  buttonLabel="Visualise your article"
                  hideButtonWhenEmpty={true}
                  showButtonIcon={false}
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
