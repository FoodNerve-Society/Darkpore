'use client';

import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  alpha,
  Paper,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TerminalIcon from '@mui/icons-material/Terminal';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckIcon from '@mui/icons-material/Check';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import SparkleIcon from '@mui/icons-material/AutoAwesome';
import {
  ArticleFormat,
  ArticleEra,
  FORMAT_CONFIG,
  ERA_CONFIG,
  BLOCK_DEFINITIONS,
  BlockType,
  getBlueprint,
} from '@/lib/config/articleBlueprints';
import { getCommodityMeta } from '@/lib/cms/commodities';
import { foodChallenges } from '@/lib/cms/food/challenges';
import {
  generateArticleBlocksPipeline,
  regenerateSingleBlock,
  GeneratedBlockResult,
} from '@/lib/actions/articleDraftPipeline';

interface EditorialPromptSidePaneProps {
  open: boolean;
  onClose: () => void;
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
  onUpdateBlockContent: (blockId: string, updatedContent: Record<string, any>) => void;
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
  format,
  era,
  commodity,
  category,
  subcategory,
  currentTitle,
  currentDescription = '',
  blocks,
  pinnedClips = [],
  onUpdateBlockContent,
  onIngestAllBlocks,
  onUpdateTitle,
  onUpdateDescription,
}: EditorialPromptSidePaneProps) {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'codraft' | 'ingest' | 'block_refiner'>('pipeline');
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  // Instant Co-Draft State
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<{
    title: string;
    description: string;
    blocks: GeneratedBlockResult[];
  } | null>(null);

  // Fast Ingest State
  const [rawIngestPayload, setRawIngestPayload] = useState('');
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState(false);

  // Block Refiner State
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id || '');
  const [customDirective, setCustomDirective] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [refineSuccess, setRefineSuccess] = useState(false);

  const formatMeta = FORMAT_CONFIG[format] || FORMAT_CONFIG.brief;
  const eraMeta = ERA_CONFIG[era] || ERA_CONFIG.present;
  const currentBlueprint = useMemo(() => getBlueprint(format, era) || [], [format, era]);

  // Commodity & Challenge visual assets
  const commodityMeta = useMemo(() => getCommodityMeta(commodity), [commodity]);
  const challengeMeta = useMemo(() => {
    return (
      foodChallenges.find((c) => c.id.toLowerCase() === category.toLowerCase()) ||
      foodChallenges[0]
    );
  }, [category]);

  // Selected block for refiner
  const selectedBlock = useMemo(() => {
    return blocks.find((b) => b.id === selectedBlockId) || blocks[0];
  }, [blocks, selectedBlockId]);

  // Pre-compiled pipeline prompts with dynamic parameters
  const compiledPrompts = useMemo(() => {
    return [
      {
        step: 1,
        title: 'DOC 1A: Macro & Temporal Anchors',
        role: 'Synthesize historical precedents, policy shifts & spatial bottlenecks',
        prompt: `You are the Lead Agro Systems Director for Food Nerve (Nigeria).
Analyze the macro economic drivers, historical precedents, and policy shifts for:
- Commodity: "${commodity}"
- Challenge Area: "${category}" (${subcategory || 'General'})
- Time Horizon: ${era.toUpperCase()} ERA

Identify:
1. The historical anchor & structural bottleneck in Nigeria.
2. The monetary / currency / import substitution pressure (e.g. FX volatility, tariffs, fuel subsidies).
3. The active production corridors (e.g. Kano, Oyo, Kaduna, Benue, Niger).
4. Concrete unit friction points experienced by aggregators, processors, and farmers.`,
      },
      {
        step: 2,
        title: 'DOC 1B: Drucker Innovation Engine',
        role: 'Scan for incongruities, demographic shifts & process need breakthroughs',
        prompt: `Apply Peter Drucker's 7 Sources of Innovation to:
- Commodity: "${commodity}"
- Category: "${category}" (${subcategory || 'General'})

Highlight:
1. The Unexpected Success / Failure in recent commercial operations.
2. Incongruity between economic reality and farmer/market assumptions.
3. Specific Process Needs (storage protocols, cold chain, aggregation standards).
4. New Knowledge & technological catalysts ready for deployment.`,
      },
      {
        step: 3,
        title: 'DOC 1C: Spectrum & Spiky Thesis',
        role: 'Synthesize contrarian editorial angles & high-conviction hooks',
        prompt: `Generate 3 contrarian thesis angles for an editorial piece on "${commodity}" (${category}):
Format: ${format.toUpperCase()} (${era.toUpperCase()} ERA)
Working Title: "${currentTitle || 'Agribusiness Strategic Intelligence'}"

Each angle must:
- Challenge mainstream NGO / conventional donor assumptions.
- Provide a concrete unit economics hypothesis (₦/ton, margins, % waste).
- Target operational aggregators, enterprise off-takers, and agtech investors.
- Conclude with a clear strategic posture for Nigerian operators.`,
      },
      {
        step: 4,
        title: 'DOC 2: Multi-Block Blueprint Composer',
        role: `Compose full ${currentBlueprint.length}-block interactive article JSON payload`,
        prompt: `Generate complete structured JSON payloads for the following ${currentBlueprint.length} blocks matching our editorial SOP:

${currentBlueprint
  .map(
    (b, i) =>
      `${i + 1}. Block Type: "${b.type}", Role: "${b.role}"\n   SOP Directive: ${b.desc}\n   Content Hint: ${b.hint}`
  )
  .join('\n\n')}

Topic Parameters:
- Commodity: "${commodity}"
- Category: "${category}" (${subcategory || 'General'})
- Format: "${format.toUpperCase()}" (${era.toUpperCase()} ERA)
- Working Title: "${currentTitle || 'Agribusiness Strategic Intelligence'}"
${pinnedClips.length > 0 ? `\nPinned Ground Intelligence:\n${pinnedClips.join('\n---\n')}` : ''}

Output format: Return an array of ${currentBlueprint.length} JSON objects with fields: { "type": string, "role": string, "content": object }`,
      },
    ];
  }, [commodity, category, subcategory, era, format, currentTitle, currentBlueprint, pinnedClips]);

  const handleCopyPrompt = (text: string, stepIdx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIdx);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  // Instant Co-Draft execution
  const handleExecuteFullPipeline = async () => {
    setIsGeneratingAll(true);
    setGenerateError(null);

    try {
      const res = await generateArticleBlocksPipeline({
        commodity,
        category,
        subcategory,
        format,
        era,
        title: currentTitle || `${commodity} Strategic Blueprint`,
        description: currentDescription,
        pinnedClips,
      });

      if (res.success && res.blocks && res.blocks.length > 0) {
        setGeneratedDraft({
          title: res.title,
          description: res.description,
          blocks: res.blocks,
        });
      } else {
        setGenerateError(res.error || 'Failed to generate blocks pipeline.');
      }
    } catch (err: any) {
      setGenerateError(err.message || 'Error occurred during pipeline generation.');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleApplyGeneratedToCanvas = () => {
    if (!generatedDraft) return;

    if (onUpdateTitle && generatedDraft.title) {
      onUpdateTitle(generatedDraft.title);
    }
    if (onUpdateDescription && generatedDraft.description) {
      onUpdateDescription(generatedDraft.description);
    }

    if (onIngestAllBlocks && generatedDraft.blocks.length > 0) {
      const hydrated = generatedDraft.blocks.map((b, idx) => {
        const sop = currentBlueprint[idx];
        return {
          id: `block_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          type: (sop?.type || b.type) as BlockType,
          role: sop?.role || b.role || 'Analysis',
          sopDesc: sop?.desc || '',
          sopHint: sop?.hint || '',
          content: b.content || {},
        };
      });
      onIngestAllBlocks(hydrated);
    }

    onClose();
  };

  // Fast Ingest Parser
  const handleParseAndIngest = () => {
    setIngestError(null);
    setIngestSuccess(false);

    const trimmed = rawIngestPayload.trim();
    if (!trimmed) {
      setIngestError('Please paste your generated output or JSON payload first.');
      return;
    }

    try {
      let parsedBlocks: any[] = [];

      // Case 1: Pure JSON array or object with blocks
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsedBlocks = parsed;
        } else if (parsed.blocks && Array.isArray(parsed.blocks)) {
          parsedBlocks = parsed.blocks;
          if (parsed.title && onUpdateTitle) onUpdateTitle(parsed.title);
          if (parsed.description && onUpdateDescription) onUpdateDescription(parsed.description);
        }
      }

      // Case 2: Markdown blocks or embedded JSON blocks
      if (parsedBlocks.length === 0) {
        const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const extracted = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          if (Array.isArray(extracted)) parsedBlocks = extracted;
        }
      }

      if (parsedBlocks.length === 0) {
        setIngestError('Could not find structured block array in pasted text. Please verify formatting.');
        return;
      }

      if (onIngestAllBlocks) {
        const hydrated = parsedBlocks.map((b, idx) => {
          const sop = currentBlueprint[idx];
          return {
            id: `block_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
            type: (b.type || sop?.type || 'core_interactive') as BlockType,
            role: b.role || sop?.role || 'Analysis',
            sopDesc: sop?.desc || '',
            sopHint: sop?.hint || '',
            content: b.content || {},
          };
        });
        onIngestAllBlocks(hydrated);
        setIngestSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setIngestError(`Failed to parse payload: ${err.message}`);
    }
  };

  // Block Refiner execution
  const handleExecuteRefine = async () => {
    if (!selectedBlock) return;
    setIsRefining(true);
    setRefineError(null);
    setRefineSuccess(false);

    try {
      const res = await regenerateSingleBlock({
        blockType: selectedBlock.type,
        role: selectedBlock.role || selectedBlock.type,
        sopDesc: selectedBlock.sopDesc,
        currentContent: selectedBlock.content,
        customInstruction: customDirective.trim(),
        commodity,
        category,
        subcategory,
        title: currentTitle,
        pinnedClips,
      });

      if (res.success && res.content) {
        onUpdateBlockContent(selectedBlock.id, res.content);
        setRefineSuccess(true);
        setTimeout(() => setRefineSuccess(false), 3000);
      } else {
        setRefineError(res.error || 'Failed to refine block.');
      }
    } catch (err: any) {
      setRefineError(err.message || 'Error occurred during block regeneration.');
    } finally {
      setIsRefining(false);
    }
  };

  return (
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
      {/* STICKY GLASSMORPHISM LUXURY HEADER                            */}
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
              Editorial AI Assistant
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.35 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  letterSpacing: '-0.01em',
                }}
              >
                Guide AI with ground intelligence to compose all {currentBlueprint.length} blocks
              </Typography>
            </Box>
          </Box>
        </Box>

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

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TABS BAR                                                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          bgcolor: '#ffffff',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 800,
              fontSize: '0.82rem',
              textTransform: 'none',
              color: '#64748b',
              '&.Mui-selected': { color: '#0f172a' },
            },
            '& .MuiTabs-indicator': {
              bgcolor: formatMeta.color,
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab value="pipeline" label="📡 Master Prompts (Doc 1 & 2)" />
          <Tab value="codraft" label="⚡ Instant AI Co-Draft" />
          <Tab value="ingest" label="📥 Fast Ingest Terminal" />
          <Tab value="block_refiner" label={`✨ Block Refiner (${blocks.length})`} />
        </Tabs>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SCROLLABLE BODY                                              */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 2.5, sm: 3.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3.5,
        }}
      >
        {/* ──────────────────────────────────────────────────────────── */}
        {/* VISUAL ANCHOR: DUAL SQUIRCLE INTERSECTION (LEARNSTUDIO STYLE) */}
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

        {/* Tactical Context Chips */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flexWrap: 'wrap',
            mt: -1,
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

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 1: MASTER PROMPTS (DOC 1 & DOC 2)                        */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'pipeline' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ px: 0.5 }}>
              <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                4-Phase Editorial Prompt Engine
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.82rem', mt: 0.25, lineHeight: 1.5 }}>
                Copy each prompt into Claude, Gemini, or ChatGPT to synthesize rigorous Nigerian market intelligence, then paste the output in the Ingest tab.
              </Typography>
            </Box>

            {compiledPrompts.map((p) => (
              <Paper
                key={p.step}
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: '20px',
                  bgcolor: '#ffffff',
                  border: '1.5px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.75,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    boxShadow: '0 8px 28px -4px rgba(15, 23, 42, 0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '9px',
                        bgcolor: '#0f172a',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        flexShrink: 0,
                      }}
                    >
                      {p.step}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>
                        {p.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {p.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleCopyPrompt(p.prompt, p.step)}
                    startIcon={copiedStep === p.step ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      borderRadius: '10px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      bgcolor: copiedStep === p.step ? '#10b981' : '#0f172a',
                      color: '#ffffff',
                      textTransform: 'none',
                      px: 2,
                      py: 0.7,
                      flexShrink: 0,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: copiedStep === p.step ? '#059669' : '#1e293b',
                      },
                    }}
                  >
                    {copiedStep === p.step ? 'Copied ✓' : 'Copy Prompt'}
                  </Button>
                </Box>

                {/* Dark Luxury Monospace Code Box */}
                <Box
                  sx={{
                    bgcolor: '#0f172a',
                    borderRadius: '14px',
                    p: 2,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  <Typography
                    component="pre"
                    sx={{
                      color: '#e2e8f0',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '0.76rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      m: 0,
                    }}
                  >
                    {p.prompt}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 2: INSTANT AI CO-DRAFT                                   */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'codraft' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: `2px solid ${alpha(formatMeta.color, 0.25)}`,
                boxShadow: `0 12px 32px ${alpha(formatMeta.color, 0.08)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    bgcolor: alpha(formatMeta.color, 0.14),
                    color: formatMeta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BoltIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem' }}>
                    Automated 5-Step AgroLLM Pipeline
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Directly synthesizes intelligence across all {currentBlueprint.length} blocks using Gemini
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                AgroLLM will ingest <strong>{commodity}</strong> in <strong>{category}</strong>, evaluate historical anchors, Drucker innovation sources, contrarian thesis angles, and structure interactive block schemas automatically.
              </Typography>

              {generateError && (
                <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '0.82rem' }}>
                  {generateError}
                </Alert>
              )}

              {generatedDraft ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                  <Alert severity="success" sx={{ borderRadius: '12px', fontWeight: 700, fontSize: '0.84rem' }}>
                    Generated {generatedDraft.blocks.length} blocks successfully for: &quot;{generatedDraft.title}&quot;
                  </Alert>

                  <Button
                    variant="contained"
                    onClick={handleApplyGeneratedToCanvas}
                    sx={{
                      bgcolor: formatMeta.color,
                      color: '#ffffff',
                      borderRadius: '14px',
                      fontWeight: 900,
                      py: 1.4,
                      fontSize: '0.92rem',
                      textTransform: 'none',
                      boxShadow: `0 8px 24px ${alpha(formatMeta.color, 0.4)}`,
                      '&:hover': { bgcolor: alpha(formatMeta.color, 0.9) },
                    }}
                  >
                    Apply All Blocks to Canvas →
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  disabled={isGeneratingAll}
                  onClick={handleExecuteFullPipeline}
                  startIcon={
                    isGeneratingAll ? (
                      <CircularProgress size={18} sx={{ color: '#fff' }} />
                    ) : (
                      <AutoAwesomeIcon />
                    )
                  }
                  sx={{
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    borderRadius: '14px',
                    fontWeight: 900,
                    py: 1.5,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
                    '&:hover': { bgcolor: '#1e293b' },
                  }}
                >
                  {isGeneratingAll
                    ? 'Executing Pipeline (~15-30s)...'
                    : `Execute AI Co-Drafting (${currentBlueprint.length} Blocks)`}
                </Button>
              )}
            </Paper>
          </Box>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 3: FAST INGEST TERMINAL                                  */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'ingest' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ px: 0.5 }}>
              <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                Direct Payload Relay Terminal
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.82rem', mt: 0.25, lineHeight: 1.5 }}>
                Paste the JSON array or markdown blocks produced by Claude, ChatGPT, or Gemini. The parser will automatically map and hydrate your canvas blocks.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: '1.5px solid rgba(226, 232, 240, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <TextField
                multiline
                rows={9}
                fullWidth
                placeholder="Paste JSON blocks array or Markdown output here..."
                value={rawIngestPayload}
                onChange={(e) => setRawIngestPayload(e.target.value)}
                slotProps={{
                  input: {
                    sx: {
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                    },
                  },
                }}
              />

              {ingestError && (
                <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '0.82rem' }}>
                  {ingestError}
                </Alert>
              )}

              {ingestSuccess && (
                <Alert severity="success" sx={{ borderRadius: '12px', fontWeight: 800, fontSize: '0.84rem' }}>
                  ✓ Successfully ingested blocks into your canvas!
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={handleParseAndIngest}
                startIcon={<ContentPasteIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '14px',
                  fontWeight: 900,
                  py: 1.4,
                  fontSize: '0.92rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                ⚡ Parse & Ingest to Canvas
              </Button>
            </Paper>
          </Box>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 4: SINGLE BLOCK REFINER                                  */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'block_refiner' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {blocks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                <Typography sx={{ fontSize: '2rem', mb: 1 }}>🧱</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#334155' }}>
                  No Canvas Blocks Loaded
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.5 }}>
                  Click &quot;Instant AI Co-Draft&quot; or load the manual framework to refine individual blocks here.
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 0.5 }}>
                  <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                    Surgical Block-Level Re-Prompter
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.82rem', mt: 0.25, lineHeight: 1.5 }}>
                    Select any block currently on your canvas, inject custom instructions (e.g. adjust tone, add local Naira pricing), and AgroLLM will re-draft just that block.
                  </Typography>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '20px',
                    bgcolor: '#ffffff',
                    border: '1.5px solid rgba(226, 232, 240, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Select Block to Refine</InputLabel>
                    <Select
                      value={selectedBlockId || blocks[0]?.id}
                      label="Select Block to Refine"
                      onChange={(e) => setSelectedBlockId(e.target.value)}
                      sx={{ borderRadius: '12px', fontWeight: 800, fontSize: '0.86rem' }}
                    >
                      {blocks.map((b, idx) => {
                        const bDef = BLOCK_DEFINITIONS[b.type] || { label: b.type, color: formatMeta.color };
                        return (
                          <MenuItem key={b.id} value={b.id} sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {idx + 1}. {b.role || bDef.label} ({bDef.label})
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>

                  {/* Current Block Content Preview */}
                  {selectedBlock && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          mb: 0.5,
                        }}
                      >
                        Current Block Content ({selectedBlock.type})
                      </Typography>
                      <Typography
                        component="pre"
                        sx={{
                          fontSize: '0.76rem',
                          color: '#334155',
                          lineHeight: 1.5,
                          maxHeight: 140,
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'Consolas, Monaco, monospace',
                          m: 0,
                        }}
                      >
                        {JSON.stringify(selectedBlock.content, null, 2)}
                      </Typography>
                    </Box>
                  )}

                  {/* Custom Directive */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                      Custom Directive / Refinement Instructions
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      placeholder="e.g. 'Add specific transport costs in Naira per ton between Kano and Lagos, and make the tone urgent for off-takers...'"
                      value={customDirective}
                      onChange={(e) => setCustomDirective(e.target.value)}
                      slotProps={{
                        input: { sx: { borderRadius: '14px', fontSize: '0.85rem' } },
                      }}
                    />

                    {/* Quick Suggestions Chips */}
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
                      {[
                        'Add Naira unit economics',
                        'Emphasize cold-chain risks',
                        'Target corporate off-takers',
                        'Keep it concise for mobile',
                      ].map((chip) => (
                        <Chip
                          key={chip}
                          label={`+ ${chip}`}
                          size="small"
                          onClick={() => setCustomDirective((prev) => (prev ? `${prev}. ${chip}` : chip))}
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {refineError && (
                    <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '0.82rem' }}>
                      {refineError}
                    </Alert>
                  )}

                  {refineSuccess && (
                    <Alert severity="success" sx={{ borderRadius: '12px', fontWeight: 800, fontSize: '0.84rem' }}>
                      ✓ Block refined and updated on canvas!
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isRefining}
                    onClick={handleExecuteRefine}
                    startIcon={
                      isRefining ? (
                        <CircularProgress size={16} sx={{ color: '#fff' }} />
                      ) : (
                        <AutoAwesomeIcon />
                      )
                    }
                    sx={{
                      py: 1.4,
                      borderRadius: '14px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      bgcolor: formatMeta.color,
                      color: '#ffffff',
                      textTransform: 'none',
                      boxShadow: `0 6px 20px ${alpha(formatMeta.color, 0.35)}`,
                      '&:hover': { bgcolor: alpha(formatMeta.color, 0.9) },
                    }}
                  >
                    {isRefining ? 'Re-drafting Block with AgroLLM...' : '✨ Refine & Apply to Canvas'}
                  </Button>
                </Paper>
              </>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
