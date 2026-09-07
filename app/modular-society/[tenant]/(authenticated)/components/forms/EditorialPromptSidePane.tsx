'use client';

import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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

  // Fast Ingest State under Document 4
  const [rawIngestPayload, setRawIngestPayload] = useState('');
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState(false);

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

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Live Block Detection
  const detectedBlockCount = useMemo(() => {
    if (!rawIngestPayload.trim()) return 0;
    try {
      const trimmed = rawIngestPayload.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.length;
        if (parsed.blocks && Array.isArray(parsed.blocks)) return parsed.blocks.length;
      }
      const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        if (Array.isArray(extracted)) return extracted.length;
        if (extracted.blocks && Array.isArray(extracted.blocks)) return extracted.blocks.length;
      }
    } catch {
      // ignore
    }
    return 0;
  }, [rawIngestPayload]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 2: NARRATIVE ARCHITECTURE & THESIS (2a, 2b, 2c)
  // ═══════════════════════════════════════════════════════════
  const doc2Prompts = useMemo(() => {
    return [
      {
        key: 'doc_2a',
        code: 'DOC 2a',
        title: 'Narrative Angle & Spiky Hook Formulation',
        role: 'Synthesize the central contrarian argument and attention-arresting hook',
        prompt: `You are the Lead Agribusiness Editorial Strategist for Food Nerve (Nigeria).
We are drafting an interactive strategic publication with the following specifications:
- Commodity: "${commodity}"
- Strategic Challenge: "${category}" (${subcategory || 'General'})
- Format Lens: "${formatMeta.label}" (${format.toUpperCase()})
- Temporal Era: "${eraMeta.label}" (${era.toUpperCase()} ERA)
- Working Title: "${currentTitle || 'Agribusiness Strategic Intelligence'}"

[TASK 2a: NARRATIVE ANGLE & SPIKY HOOK]
1. Formulate 3 distinct "Spiky Points of View" that challenge lazy conventional assumptions in the Nigerian agricultural market.
2. For each angle, write a 2-sentence opening hook designed to grab commercial aggregators, processors, and investors.
3. Establish the central economic thesis: what structural bottleneck (e.g. FX volatility, storage losses, diesel costs, aggregation fragmentation) is creating the crisis or opportunity right now?`,
      },
      {
        key: 'doc_2b',
        code: 'DOC 2b',
        title: 'Target Value Chain Persona & Operational Stakes',
        role: 'Define reader persona, daily frictions, and financial downside of inaction',
        prompt: `[TASK 2b: TARGET PERSONA & OPERATIONAL STAKES]
Context: "${commodity}" × "${category}" (${subcategory || 'General'}) in Nigeria.
Publication Type: ${formatMeta.label} (${eraMeta.label}).

1. Identify the primary commercial operator affected (e.g., Northern Commodity Aggregator, Industrial Food Processor, Cold-Chain Fleet Operator, Commercial Farmer).
2. Detail their current "Workaround" vs the "Real Cost of Inaction":
   - Unit Economics impact: specify losses in ₦ per metric ton, percentage spoilage, or margin erosion.
   - Seasonal operational timeline: when does the pressure peak (planting, harvest glut, or lean season)?
3. Draft a crisp 1-paragraph Persona Dossier describing their operational reality on the ground.`,
      },
      {
        key: 'doc_2c',
        code: 'DOC 2c',
        title: 'Blueprint Skeleton & Block Sequence Mapping',
        role: `Map the narrative arc across all ${currentBlueprint.length} blueprint blocks`,
        prompt: `[TASK 2c: BLUEPRINT SKELETON MAPPING]
Our interactive publication requires exactly ${currentBlueprint.length} blocks following our structured editorial SOP:

${currentBlueprint
  .map(
    (b, i) =>
      `Block ${i + 1}: [${b.type.toUpperCase()}]\n- Editorial Role: "${b.role}"\n- SOP Directive: ${b.desc}\n- Core Hint: ${b.hint}`
  )
  .join('\n\n')}

Review the topic: "${commodity}" in "${category}" (${subcategory || 'General'}).
Map out a bulleted 1-sentence outline for each of the ${currentBlueprint.length} blocks above so the narrative flows seamlessly from opening hook to empirical proof, unit economics, and final strategic directive.`,
      },
    ];
  }, [commodity, category, subcategory, formatMeta, eraMeta, format, era, currentTitle, currentBlueprint]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 3: BLOCK-BY-BLOCK CONTENT DRAFTING (3a, 3b, 3c)
  // ═══════════════════════════════════════════════════════════
  const doc3Prompts = useMemo(() => {
    return [
      {
        key: 'doc_3a',
        code: 'DOC 3a',
        title: 'Foundation Blocks: Hook, Subheading & 3-Point Executive Summary',
        role: 'Draft the opening anchor blocks with temporal markers',
        prompt: `[TASK 3a: FOUNDATION BLOCKS]
Generate the opening content blocks for our ${formatMeta.label} on "${commodity}" (${category}):

1. Subheading Block:
   - A punchy 1-sentence subheadline with high operational specificity (mentioning corridors like Kano, Benue, Oyo, or Kaduna).

2. Executive Summary Block (Strict 3-Point Structure for ${era.toUpperCase()} Era):
   - Point 1 (${era === 'past' ? 'The Original Promise' : era === 'future' ? 'The Dying Paradigm' : 'The Crisis'}): State the empirical reality with concrete data.
   - Point 2 (${era === 'past' ? 'The Friction Point' : era === 'future' ? 'The Disruption' : 'The Workaround'}): Detail the commercial bottleneck.
   - Point 3 (${era === 'past' ? 'The Loss' : era === 'future' ? 'The Horizon Year' : 'The Primary Actor Affected'}): Summarize the net financial consequence in ₦ or percentage.`,
      },
      {
        key: 'doc_3b',
        code: 'DOC 3b',
        title: 'Analytical & Interactive Core Blocks: Directives, Economics & Proof',
        role: 'Draft unit economics calculations, comparison matrices, and tactical directives',
        prompt: `[TASK 3b: ANALYTICAL & INTERACTIVE CORE BLOCKS]
Draft the rigorous data and interactive blocks for "${commodity}" (${category}):

1. Strategic Directive Block:
   - Urgency Level: High / Critical / Immediate.
   - Target Persona: Primary operator who must execute this directive.
   - 3 Actionable Bullet Directives: Concrete operational instructions (storage temperature, aggregation protocol, contract hedging).

2. Unit Economics / Comparison Matrix Block:
   - Provide realistic Nigerian agribusiness figures (e.g. ₦350,000/ton farmgate vs ₦580,000/ton terminal market; 18-24% post-harvest loss; transport costs per truckload).
   - Show the margin difference between business-as-usual vs the proposed intervention.

3. Myth vs Fact / Core Interactive Block:
   - Myth: Common misconception held by traders or farmers.
   - Fact: Ground operational reality backed by logistics data.`,
      },
      {
        key: 'doc_3c',
        code: 'DOC 3c',
        title: 'Ground Intelligence & Ecosystem Call to Action',
        role: 'Synthesize field evidence, pull quotes, and final network action triggers',
        prompt: `[TASK 3c: GROUND INTELLIGENCE & CALL TO ACTION]
${pinnedClips.length > 0 ? `Incorporate the following attached field notes:\n${pinnedClips.join('\n---\n')}\n\n` : ''}
1. Pull Quote / Field Voice:
   - Draft a raw, authentic quote from a market operator, warehouse manager, or truck driver on the corridor.

2. Call to Action (CTA) Block:
   - What should the reader do next on the Food Nerve Network?
   - Offer a clear next step: e.g. join the regional aggregation cooperative, access cold-storage capacity, apply for equipment leasing, or inspect live market prices.`,
      },
    ];
  }, [commodity, category, formatMeta, era, pinnedClips]);

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT 4: FULL SYNTHESIS & INGESTION COMPOSER (4a, 4b)
  // ═══════════════════════════════════════════════════════════
  const doc4Prompts = useMemo(() => {
    return [
      {
        key: 'doc_4a',
        code: 'DOC 4a',
        title: 'Master Multi-Block Blueprint Composer',
        role: `Assemble all ${currentBlueprint.length} blocks into structured JSON for direct canvas import`,
        prompt: `[TASK 4a: MASTER COMPILATION]
You have conducted the research across Docs 2 and 3. Now compile the complete, publication-ready article payload for Food Nerve.

Return ONLY a valid JSON object with the following schema:
{
  "title": "${currentTitle || `Strategic Intelligence: ${commodity} on the ${category} Corridor`}",
  "description": "${currentDescription || `A comprehensive ${formatMeta.label.toLowerCase()} evaluating unit economics, supply bottlenecks, and tactical directives for Nigerian operators.`}",
  "blocks": [
${currentBlueprint
  .map(
    (b, i) => `    {
      "type": "${b.type}",
      "role": "${b.role}",
      "content": { /* Complete payload matching ${b.type} SOP requirements */ }
    }`
  )
  .join(',\n')}
  ]
}

Ensure all ${currentBlueprint.length} blocks contain substantive, realistic data in Naira (₦) for Nigerian agribusiness corridors. Do not truncate with placeholders.`,
      },
    ];
  }, [commodity, category, formatMeta, currentTitle, currentDescription, currentBlueprint]);

  // Fast Ingest Parser handler with Fast Ingest Protocol Normalization
  const handleParseAndIngest = () => {
    setIngestError(null);
    setIngestSuccess(false);

    const trimmed = rawIngestPayload.trim();
    if (!trimmed) {
      setIngestError('Please paste your generated JSON or block payload into the editor below.');
      return;
    }

    try {
      let parsedBlocks: any[] = [];

      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsedBlocks = parsed;
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
        const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const extracted = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          if (Array.isArray(extracted)) {
            parsedBlocks = extracted;
          } else if (extracted.blocks && Array.isArray(extracted.blocks)) {
            parsedBlocks = extracted.blocks;
          }
        }
      }

      if (parsedBlocks.length === 0) {
        setIngestError('Could not locate a valid block array in the pasted output. Please check formatting.');
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
              Editorial AI Assistant
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

        {/* Tactical Context Chips */}
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

        {/* ──────────────────────────────────────────────────────────── */}
        {/* SECTION 2: DOCUMENT 2 — ARCHITECTURE & THESIS (2a, 2b, 2c)   */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                Document 2: Architecture, Thesis &amp; Blueprint
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                Establish contrarian angles, target commercial operators, and outline your {currentBlueprint.length} blocks.
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
              { id: 'sop_doc2_1', text: '1. Copy Doc 2a to discover 3 sharp contrarian angles in ChatGPT, Claude, or Gemini.' },
              { id: 'sop_doc2_2', text: '2. Run Doc 2b to establish unit economics in Naira and primary operator stakes.' },
              { id: 'sop_doc2_3', text: `3. Run Doc 2c to map the narrative flow across all ${currentBlueprint.length} blueprint blocks.` },
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
            />
          ))}
        </Box>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* SECTION 3: DOCUMENT 3 — BLOCK CONTENT DRAFTING (3a, 3b, 3c)   */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                Document 3: Block-by-Block Content Drafting
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                Synthesize opening executive summaries, interactive economics directives, and ground evidence.
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
              { id: 'sop_doc3_1', text: '1. Copy Doc 3a to draft the 3-point temporal executive summary with sharp data.' },
              { id: 'sop_doc3_2', text: '2. Run Doc 3b to build unit economics cards, margin impacts, and strategic directives.' },
              { id: 'sop_doc3_3', text: '3. Run Doc 3c to integrate field voices and ecosystem action triggers.' },
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
            />
          ))}
        </Box>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* SECTION 4: DOCUMENT 4 — FULL SYNTHESIS & INGESTION (4a, 4b)   */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 2 }}>
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
                Document 4: Multi-Block Assembly &amp; Direct Canvas Ingest
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                Assemble all {currentBlueprint.length} blocks into a single payload, then paste below to populate the canvas.
              </Typography>
            </Box>
          </Box>

          {/* Doc 4a: Master Compilation Prompt using PromptTerminalBox */}
          {doc4Prompts.map((p) => (
            <PromptTerminalBox
              key={p.key}
              id={p.key}
              codeLabel={p.code}
              title={p.title}
              subtitle={p.role}
              prompt={p.prompt}
              colorTheme="#10b981"
              copyButtonLabel={`Copy ${p.code} Master Prompt`}
              copiedBannerText={`${p.code} Copied to Clipboard!`}
            />
          ))}

          {/* Doc 4b: Integrated Fast Ingest Relay Terminal using PromptFastIngestBox */}
          <PromptFastIngestBox
            value={rawIngestPayload}
            onChange={(val) => {
              setRawIngestPayload(val);
              if (ingestError) setIngestError(null);
            }}
            onIngest={handleParseAndIngest}
            codeLabel="DOC 4b"
            title="Fast Ingest Relay & Canvas Import"
            subtitle={`Paste the JSON array output from Doc 4a below to automatically populate all ${currentBlueprint.length} blocks onto your canvas.`}
            colorTheme="#10b981"
            liveBlockCount={detectedBlockCount}
            expectedBlockCount={currentBlueprint.length}
            error={ingestError}
            success={ingestSuccess}
            buttonLabel="⚡ Ingest & Apply All Blocks to Canvas"
          />
        </Box>
      </Box>
    </Drawer>
  );
}

export default EditorialPromptSidePane;
