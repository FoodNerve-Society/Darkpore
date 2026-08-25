'use client';

import React, { useState, useMemo } from 'react';
import {
  Drawer, Box, Typography, IconButton, Button, TextField, 
  Tabs, Tab, Chip, Tooltip, CircularProgress, Divider, MenuItem, Select, FormControl, InputLabel, alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TerminalIcon from '@mui/icons-material/Terminal';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import { ArticleFormat, ArticleEra, FORMAT_CONFIG, ERA_CONFIG, BLOCK_DEFINITIONS, BlockType } from '@/lib/config/articleBlueprints';
import { regenerateSingleBlock } from '@/lib/actions/articleDraftPipeline';

export function EditorialPromptSidePane({
  open,
  onClose,
  format,
  era,
  commodity,
  category,
  subcategory,
  currentTitle,
  blocks,
  pinnedClips = [],
  onUpdateBlockContent
}: {
  open: boolean;
  onClose: () => void;
  format: ArticleFormat;
  era: ArticleEra;
  commodity: string;
  category: string;
  subcategory: string;
  currentTitle: string;
  blocks: Array<{ id: string; type: BlockType; role?: string; sopDesc?: string; content: Record<string, any> }>;
  pinnedClips?: string[];
  onUpdateBlockContent: (blockId: string, updatedContent: Record<string, any>) => void;
}) {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'block_refiner'>('pipeline');
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  // Block Refiner state
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id || '');
  const [customDirective, setCustomDirective] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [refineSuccess, setRefineSuccess] = useState(false);

  const formatMeta = FORMAT_CONFIG[format] || FORMAT_CONFIG.brief;
  const eraMeta = ERA_CONFIG[era] || ERA_CONFIG.present;

  // Selected block for refiner
  const selectedBlock = useMemo(() => {
    return blocks.find(b => b.id === selectedBlockId) || blocks[0];
  }, [blocks, selectedBlockId]);

  // Pre-compiled pipeline prompts with live variable injection
  const compiledPrompts = useMemo(() => {
    return [
      {
        step: 1,
        title: 'DOC 1A: Macro & Temporal Anchors',
        role: 'Synthesize historical precedents & macro corridors',
        prompt: `You are the Lead Agro Systems Director for Food Nerve (Nigeria).
Analyze the macro economic drivers, historical precedents, and policy shifts for:
- Commodity: "${commodity}"
- Challenge Area: "${category}" (${subcategory})
- Time Horizon: ${era.toUpperCase()} ERA

Identify:
1. The historical anchor & structural bottleneck in Nigeria.
2. The monetary / currency / import substitution pressure.
3. The active production corridors (e.g. Kano, Oyo, Kaduna, Benue).`
      },
      {
        step: 2,
        title: 'DOC 1B: Drucker Innovation Engine',
        role: 'Scan for incongruities & process need breakthroughs',
        prompt: `Apply Peter Drucker's 7 Sources of Innovation to:
- Commodity: "${commodity}"
- Category: "${category}" (${subcategory})

Highlight:
1. The Unexpected Success / Failure in recent operations.
2. Incongruity between economic reality and farmer assumptions.
3. Specific Process Needs (storage, cold chain, aggregation protocols).`
      },
      {
        step: 3,
        title: 'DOC 1C: Spectrum & Spiky Thesis',
        role: 'Synthesize contrarian editorial angles',
        prompt: `Generate 3 contrarian thesis angles for an editorial piece on "${commodity}" (${category}):
Format: ${format.toUpperCase()} (${era.toUpperCase()} ERA)
Working Title: "${currentTitle || 'Agribusiness Strategic Intelligence'}"

Each angle must:
- Challenge mainstream NGO / conventional assumptions.
- Provide a concrete unit economics hypothesis (₦/ton, margins, % waste).
- Target operational aggregators and agtech investors.`
      },
      {
        step: 4,
        title: 'DOC 2: Multi-Block Blueprint Composer',
        role: `Compose full ${blocks.length}-block interactive article`,
        prompt: `Generate complete structured JSON payloads for the following ${blocks.length} blocks:
${blocks.map((b, i) => `${i + 1}. Block Type: "${b.type}", Role: "${b.role}"`).join('\n')}

Commodity: ${commodity}
Category: ${category} (${subcategory})
Title: "${currentTitle}"
${pinnedClips.length > 0 ? `\nPinned Ground Clips:\n${pinnedClips.join('\n---\n')}` : ''}`
      }
    ];
  }, [commodity, category, subcategory, era, format, currentTitle, blocks, pinnedClips]);

  const handleCopyPrompt = (text: string, stepIdx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIdx);
    setTimeout(() => setCopiedStep(null), 2000);
  };

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
        pinnedClips
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
            width: { xs: '100%', sm: 480 },
            p: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(24px)',
            borderLeft: `1.5px solid ${alpha(formatMeta.color, 0.25)}`,
            boxShadow: '-10px 0 50px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      {/* ─── Top Header ─── */}
      <Box sx={{ p: 2.5, pb: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: '10px',
            bgcolor: alpha(formatMeta.color, 0.15), color: formatMeta.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem'
          }}>
            <TerminalIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>
              Editorial Prompt Engine
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              Live variable inspection & block-level AI re-prompter
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ─── Tabs Bar ─── */}
      <Box sx={{ px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', bgcolor: 'rgba(0,0,0,0.015)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': { minHeight: 44, fontWeight: 800, fontSize: '0.8rem', textTransform: 'none' },
            '& .Mui-selected': { color: formatMeta.color },
            '& .MuiTabs-indicator': { bgcolor: formatMeta.color }
          }}
        >
          <Tab value="pipeline" label="📡 Pipeline Prompts (Doc 1A-2)" />
          <Tab value="block_refiner" label={`✨ Block Refiner (${blocks.length})`} />
        </Tabs>
      </Box>

      {/* ─── TAB 1: PIPELINE PROMPTS ─── */}
      {activeTab === 'pipeline' && (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Active Context Overview */}
          <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
              Active Injected Context
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip label={`🌾 ${commodity}`} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
              <Chip label={`💼 ${category}`} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
              <Chip label={`${formatMeta.emoji} ${formatMeta.label}`} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: alpha(formatMeta.color, 0.12), color: formatMeta.color }} />
              <Chip label={`${eraMeta.emoji} ${eraMeta.label}`} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: alpha(eraMeta.color, 0.12), color: eraMeta.color }} />
              {pinnedClips.length > 0 && (
                <Chip label={`📎 ${pinnedClips.length} Clips`} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: alpha('#059669', 0.12), color: '#059669' }} />
              )}
            </Box>
          </Box>

          {/* Prompts Accordion / Cards */}
          {compiledPrompts.map((p) => (
            <Box
              key={p.step}
              sx={{
                p: 2, borderRadius: '16px', bgcolor: '#fff',
                border: '1.5px solid rgba(0,0,0,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex', flexDirection: 'column', gap: 1.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#0f172a' }}>
                    {p.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {p.role}
                  </Typography>
                </Box>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleCopyPrompt(p.prompt, p.step)}
                  startIcon={copiedStep === p.step ? <CheckIcon /> : <ContentCopyIcon />}
                  sx={{
                    borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800,
                    color: copiedStep === p.step ? '#10b981' : '#475569',
                    borderColor: copiedStep === p.step ? '#10b981' : 'rgba(0,0,0,0.15)'
                  }}
                >
                  {copiedStep === p.step ? 'Copied' : 'Copy'}
                </Button>
              </Box>

              <TextField
                multiline
                rows={4}
                fullWidth
                value={p.prompt}
                slotProps={{
                  input: {
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.76rem', lineHeight: 1.5, bgcolor: '#f8fafc', borderRadius: '12px' }
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* ─── TAB 2: BLOCK REFINER ─── */}
      {activeTab === 'block_refiner' && (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {blocks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
              <Typography sx={{ fontSize: '2rem', mb: 1 }}>🧱</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748b' }}>
                No Canvas Blocks Loaded
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mt: 0.5 }}>
                Load the framework or co-draft with AgroLLM to refine individual blocks here.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Select Block to Refine */}
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
                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 0.5 }}>
                    Current Block Content
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.4, maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {JSON.stringify(selectedBlock.content, null, 2)}
                  </Typography>
                </Box>
              )}

              {/* Custom Directive Input */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  Custom Directive / Prompt Refinement
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="e.g. 'Add specific price data in Naira for Northern corridors and make the tone more urgent for aggregators...'"
                  value={customDirective}
                  onChange={(e) => setCustomDirective(e.target.value)}
                  slotProps={{
                    input: { sx: { borderRadius: '14px', fontSize: '0.85rem' } }
                  }}
                />
              </Box>

              {/* Status alerts */}
              {refineError && (
                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
                  ⚠️ {refineError}
                </Box>
              )}
              {refineSuccess && (
                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>
                  ✓ Block refined and updated on canvas!
                </Box>
              )}

              {/* Refine Submit Button */}
              <Button
                fullWidth
                variant="contained"
                disabled={isRefining}
                onClick={handleExecuteRefine}
                startIcon={isRefining ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AutoAwesomeIcon />}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  bgcolor: formatMeta.color,
                  color: '#fff',
                  boxShadow: `0 6px 20px ${alpha(formatMeta.color, 0.35)}`
                }}
              >
                {isRefining ? 'Re-drafting Block with AgroLLM...' : '✨ Refine & Apply to Canvas'}
              </Button>
            </>
          )}
        </Box>
      )}
    </Drawer>
  );
}
