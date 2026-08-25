'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, Box, Typography, Button, TextField, 
  Chip, Tooltip, IconButton, Divider, alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddIcon from '@mui/icons-material/Add';
import { ArticleFormat, ArticleEra, FORMAT_CONFIG, ERA_CONFIG, getBlueprint, BLOCK_DEFINITIONS, BlockType } from '@/lib/config/articleBlueprints';
import { blocksToMarkdownStream, markdownStreamToBlocks, ParsedStreamBlock } from '@/lib/utils/articleStreamParser';

export function StreamDraftingModal({
  open,
  onClose,
  format,
  era,
  commodity,
  category,
  currentTitle,
  currentDescription,
  currentBlocks,
  onSyncToCanvas
}: {
  open: boolean;
  onClose: () => void;
  format: ArticleFormat;
  era: ArticleEra;
  commodity: string;
  category: string;
  currentTitle: string;
  currentDescription: string;
  currentBlocks: Array<{ id: string; type: BlockType; role?: string; sopDesc?: string; content: Record<string, any> }>;
  onSyncToCanvas: (payload: { title?: string; description?: string; blocks: ParsedStreamBlock[] }) => void;
}) {
  const [streamText, setStreamText] = useState('');
  const [copied, setCopied] = useState(false);

  const formatMeta = FORMAT_CONFIG[format] || FORMAT_CONFIG.brief;
  const eraMeta = ERA_CONFIG[era] || ERA_CONFIG.present;
  const blueprint = useMemo(() => getBlueprint(format, era), [format, era]);

  // Load from Canvas on open
  useEffect(() => {
    if (open) {
      if (currentBlocks.length > 0 || currentTitle) {
        const serialized = blocksToMarkdownStream(currentBlocks, currentTitle, currentDescription);
        setStreamText(serialized);
      } else {
        // Generate empty template from blueprint
        const emptyBlocks = blueprint.map(b => ({
          type: b.type,
          role: b.role,
          sopDesc: b.desc,
          content: {}
        }));
        const initialTemplate = blocksToMarkdownStream(emptyBlocks, currentTitle || `${formatMeta.label} Draft`, currentDescription);
        setStreamText(initialTemplate);
      }
    }
  }, [open, currentBlocks, currentTitle, currentDescription, blueprint, formatMeta.label]);

  // Real-time live parser preview
  const liveParsed = useMemo(() => {
    return markdownStreamToBlocks(streamText, blueprint);
  }, [streamText, blueprint]);

  const handleInsertToken = (blockType: BlockType, roleName: string) => {
    const nextIdx = liveParsed.blocks.length + 1;
    let snippet = `\n## [${nextIdx}. ${roleName} | ${blockType}]\n`;
    if (blockType === 'exec_summary') snippet += '• Point 1: \n• Point 2: \n• Point 3: \n';
    else if (blockType === 'myth_fact') snippet += '**Myth:** Common belief\n**Fact:** Ground reality\n';
    else if (blockType === 'pull_quote') snippet += '> "Quote text"\n-- Field Operator\n';
    else if (blockType === 'comparison_matrix') {
      snippet += '**Model A:** Traditional\n**Model B:** Modern\n**Verdict:** Decisive winner\n| Criterion | Option A | Option B | Winner (A/B) |\n| :--- | :--- | :--- | :--- |\n| CAPEX | Low | High | A |\n| Margin | 10% | 35% | B |\n';
    } else if (blockType === 'protocol_steps') {
      snippet += '**Action Title:** Tactical Checklist\n1. **Step 1**: Details\n2. **Step 2**: Details\n';
    } else {
      snippet += 'Enter analysis paragraphs here...\n';
    }

    setStreamText(prev => prev + snippet);
  };

  const handleApplySync = () => {
    onSyncToCanvas(liveParsed);
    onClose();
  };

  const handlePullFromCanvas = () => {
    const serialized = blocksToMarkdownStream(currentBlocks, currentTitle, currentDescription);
    setStreamText(serialized);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(streamText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: `1.5px solid ${alpha(formatMeta.color, 0.3)}`,
            boxShadow: '0 24px 70px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      {/* Top Header */}
      <Box sx={{ p: 2.5, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: alpha(formatMeta.color, 0.15), color: formatMeta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
            📝
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>
              Stream Drafting & Token Ingestion
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
              Edit entire article as continuous markdown — token headers will automatically parse into interactive blocks.
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Blueprint Inserter Tokens Bar */}
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto' }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', whiteSpace: 'nowrap', mr: 0.5 }}>
          + Insert Block Token:
        </Typography>
        {blueprint.map((b, idx) => {
          const bDef = BLOCK_DEFINITIONS[b.type] || { label: b.type, color: formatMeta.color };
          return (
            <Chip
              key={idx}
              label={b.role}
              size="small"
              onClick={() => handleInsertToken(b.type, b.role)}
              sx={{
                fontWeight: 800,
                fontSize: '0.7rem',
                cursor: 'pointer',
                bgcolor: alpha(bDef.color, 0.12),
                color: bDef.color,
                border: `1px solid ${alpha(bDef.color, 0.25)}`,
                '&:hover': { bgcolor: alpha(bDef.color, 0.22), transform: 'translateY(-1px)' },
                transition: 'all 0.15s'
              }}
            />
          );
        })}
      </Box>

      {/* Editor Body */}
      <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
        <TextField
          multiline
          fullWidth
          minRows={16}
          maxRows={24}
          value={streamText}
          onChange={(e) => setStreamText(e.target.value)}
          placeholder="# Article Title&#10;> Executive Description...&#10;&#10;## [1. Hook | subheading]&#10;Your text here..."
          slotProps={{
            input: {
              sx: {
                fontFamily: 'monospace',
                fontSize: '0.86rem',
                lineHeight: 1.6,
                borderRadius: '16px',
                bgcolor: '#fafafa',
                p: 2
              }
            }
          }}
        />

        {/* Live Detected Blocks Indicator */}
        <Box sx={{ p: 1.75, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a' }}>
              🎯 Live Parser: {liveParsed.blocks.length} Block{liveParsed.blocks.length !== 1 ? 's' : ''} Detected
            </Typography>
            {liveParsed.title && (
              <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                Title: &ldquo;{liveParsed.title}&rdquo;
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {liveParsed.blocks.map((b, idx) => {
              const bDef = BLOCK_DEFINITIONS[b.type] || { label: b.type, color: formatMeta.color };
              return (
                <Chip
                  key={idx}
                  label={`${idx + 1}. ${b.role}`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    bgcolor: alpha(bDef.color, 0.15),
                    color: bDef.color
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </DialogContent>

      {/* Footer Actions */}
      <Box sx={{ p: 2.5, pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handlePullFromCanvas}
            startIcon={<FileDownloadIcon />}
            sx={{ borderRadius: '12px', fontWeight: 700, fontSize: '0.78rem', color: '#64748b', borderColor: 'rgba(0,0,0,0.15)' }}
          >
            Pull Canvas Blocks
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCopy}
            startIcon={<ContentCopyIcon />}
            sx={{ borderRadius: '12px', fontWeight: 700, fontSize: '0.78rem', color: '#64748b', borderColor: 'rgba(0,0,0,0.15)' }}
          >
            {copied ? '✓ Copied!' : 'Copy Stream'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button size="small" onClick={onClose} sx={{ fontWeight: 700, color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApplySync}
            startIcon={<SyncAltIcon />}
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.85rem',
              bgcolor: formatMeta.color,
              color: '#fff',
              px: 3,
              boxShadow: `0 4px 14px ${alpha(formatMeta.color, 0.35)}`
            }}
          >
            ⚡ Sync to Block Canvas ({liveParsed.blocks.length} Blocks)
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
