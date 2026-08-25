'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, Box, Typography, Button, TextField,
  Chip, Tooltip, IconButton, Paper, alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useClipNotes } from '@/context/ClipNoteContext';
import { BlockType, ArticleFormat, ArticleEra, FORMAT_CONFIG, ERA_CONFIG, BLOCK_DEFINITIONS } from '@/lib/config/articleBlueprints';

export function BlockScratchpadModal({
  open,
  onClose,
  block,
  blockIndex = 0,
  format,
  era,
  commodity,
  category,
  currentTitle,
  onInsertToBlock
}: {
  open: boolean;
  onClose: () => void;
  block: { id: string; type: BlockType; role?: string; sopDesc?: string; sopHint?: string; content: Record<string, any> } | null;
  blockIndex?: number;
  format: ArticleFormat;
  era: ArticleEra;
  commodity: string;
  category: string;
  currentTitle: string;
  onInsertToBlock?: (blockId: string, text: string) => void;
}) {
  const { notes, createNote, updateNote } = useClipNotes();

  // 3D Flip state: false = Block Front / Note Preview, true = Back (Rambling Markdown Editor)
  const [isNoteFlipped, setIsNoteFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  // Single note for this block
  const existingNote = useMemo(() => {
    if (!block) return null;
    return notes.find(n =>
      n.attachments?.some(a => a.scope === 'block' && (a.blockId === block.id || a.blockRole === block.role || a.blockRole === block.type))
    ) || null;
  }, [notes, block]);

  const [noteDraftText, setNoteDraftText] = useState('');

  // Sync draft text when block or note changes
  useEffect(() => {
    if (existingNote) {
      setNoteDraftText(existingNote.content || '');
    } else {
      setNoteDraftText('');
    }
    setIsNoteFlipped(false);
  }, [existingNote, block]);

  if (!block) return null;

  const formatMeta = FORMAT_CONFIG[format] || FORMAT_CONFIG.brief;
  const eraMeta = ERA_CONFIG[era] || ERA_CONFIG.present;
  const bDef = BLOCK_DEFINITIONS[block.type] || { color: '#10b981', label: 'Block' };
  const color = bDef.color;

  const handleSaveNote = () => {
    if (!noteDraftText.trim()) return;

    if (existingNote) {
      updateNote(existingNote.id, { content: noteDraftText.trim() });
    } else {
      createNote(noteDraftText.trim(), `Block ${blockIndex + 1} Note`, [{
        scope: 'block',
        blockId: block.id,
        blockRole: block.role || block.type,
        articleId: 'current_draft',
        commodity,
        category
      }]);
    }
  };

  const handleSaveAndFlipBack = () => {
    handleSaveNote();
    setIsNoteFlipped(false);
  };

  const handleCopyNote = () => {
    if (!noteDraftText) return;
    navigator.clipboard.writeText(noteDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview of block content
  const blockPreviewText = block.content?.text || block.content?.summary || block.content?.description || block.content?.bionicText || block.content?.title || block.content?.quote || '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(12px)'
          }
        },
        paper: {
          elevation: 0,
          sx: {
            borderRadius: '26px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(32px)',
            border: `1.5px solid ${alpha(color, 0.25)}`,
            boxShadow: `0 24px 64px -12px ${alpha(color, 0.25)}`
          }
        }
      }}
    >
      {/* ═══ MODAL TOP HEADER ═══ */}
      <Box sx={{
        px: 3, py: 2,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        bgcolor: alpha(color, 0.05),
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '12px',
            bgcolor: alpha(color, 0.15), color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.05rem', fontWeight: 900,
            border: `1px solid ${alpha(color, 0.3)}`
          }}>
            {blockIndex + 1}
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                {block.role || bDef.label}
              </Typography>
              <Chip
                label={bDef.label}
                size="small"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: alpha(color, 0.12), color }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
              {isNoteFlipped ? 'Editing Scratchpad Rambling Note' : 'Block Overview & Scratchpad Note'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={onClose}
            sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#64748b', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: '#0f172a' } }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>
        {/* ═══ 1. TOP DIRECTIVE: WHAT THIS BLOCK IS FOR (ARTICLE TYPE & ERA) ═══ */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, rgba(255,255,255,0.95) 100%)`,
            border: `1.5px solid ${alpha(color, 0.22)}`,
            boxShadow: `0 4px 14px ${alpha(color, 0.04)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${formatMeta.emoji} ${formatMeta.label}`}
                size="small"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: formatMeta.color, color: '#fff' }}
              />
              <Chip
                label={`${eraMeta.emoji} ${eraMeta.label} Horizon`}
                size="small"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: eraMeta.color, color: '#fff' }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              SOP Objective
            </Typography>
          </Box>

          <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.45 }}>
            🎯 Purpose: {block.sopDesc || "Provides critical pedagogical structure and analytical insight for this briefing."}
          </Typography>

          {block.sopHint && (
            <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
              💡 <strong>Angle:</strong> &ldquo;{block.sopHint}&rdquo;
            </Typography>
          )}
        </Paper>

        {/* ═══ 2. 3D FLIPPING CARD: SIDE A (BLOCK & NOTE PREVIEW) vs SIDE B (EDITABLE RAMBLING NOTE) ═══ */}
        <Box sx={{ perspective: '1600px', minHeight: 340, position: 'relative' }}>
          <Box sx={{
            position: 'relative',
            transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
            transform: isNoteFlipped ? 'rotateY(180deg)' : 'none'
          }}>
            {/* ─── SIDE A: BLOCK OVERVIEW & SCRATCHPAD PREVIEW BAR ─── */}
            <Paper
              elevation={0}
              sx={{
                backfaceVisibility: 'hidden',
                position: isNoteFlipped ? 'absolute' : 'relative',
                width: '100%', top: 0,
                p: 2.5,
                borderRadius: '20px',
                border: '1.5px solid rgba(0,0,0,0.08)',
                background: '#ffffff',
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {/* Block Content Snapshot */}
              <Box>
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', mb: 1 }}>
                  Block Content:
                </Typography>
                <Box sx={{
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: 'rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  minHeight: 90
                }}>
                  {blockPreviewText ? (
                    <Typography sx={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {typeof blockPreviewText === 'string' ? blockPreviewText : JSON.stringify(blockPreviewText)}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: '0.84rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Block content is currently empty.
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* ─── NOTE PREVIEW BAR AT THE BOTTOM (TAP TO EDIT & FLIP) ─── */}
              <Box
                onClick={() => setIsNoteFlipped(true)}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: alpha('#16a34a', 0.05),
                  border: `1.5px solid ${alpha('#16a34a', 0.25)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha('#16a34a', 0.1),
                    borderColor: '#16a34a',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '1rem' }}>📝</span>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', color: '#16a34a', letterSpacing: '0.06em' }}>
                      Scratchpad Rambling Note
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      color: '#16a34a',
                      bgcolor: '#fff',
                      borderRadius: '8px',
                      px: 1.5,
                      py: 0.4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      textTransform: 'none'
                    }}
                  >
                    Tap to Edit Note
                  </Button>
                </Box>

                <Typography sx={{
                  fontSize: '0.82rem',
                  color: noteDraftText ? '#334155' : '#94a3b8',
                  fontStyle: noteDraftText ? 'normal' : 'italic',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {noteDraftText || 'No rambling notes added yet. Tap here to flip and write unstructured thoughts, quotes, or field data for this block.'}
                </Typography>
              </Box>
            </Paper>

            {/* ─── SIDE B: THE FULL EDITABLE MARKDOWN TEXTFIELD (RAMBLING SCRATCHPAD) ─── */}
            <Paper
              elevation={0}
              sx={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                position: isNoteFlipped ? 'relative' : 'absolute',
                width: '100%', top: 0,
                p: 2.5,
                borderRadius: '20px',
                border: `1.5px solid ${alpha('#16a34a', 0.4)}`,
                background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240,253,244,0.7) 100%)',
                boxShadow: '0 12px 36px rgba(22,163,74,0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {/* Flip Back Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                    onClick={handleSaveAndFlipBack}
                    sx={{ color: '#475569', fontWeight: 800, fontSize: '0.78rem', textTransform: 'none' }}
                  >
                    Back to Block
                  </Button>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase', color: '#16a34a', letterSpacing: '0.06em' }}>
                    Block {blockIndex + 1} Rambling Scratchpad
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={handleSaveAndFlipBack}
                  sx={{
                    bgcolor: '#16a34a',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    borderRadius: '10px',
                    px: 2,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#15803d' }
                  }}
                >
                  Done & Flip Back
                </Button>
              </Box>

              {/* Full Editable Markdown Textarea for Rambling */}
              <TextField
                placeholder="Write, ramble, brainstorm, paste voice transcripts, quote snippets, price indicators, or bullet points here... (Auto-saves to Main Scratchpad)"
                value={noteDraftText}
                onChange={(e) => setNoteDraftText(e.target.value)}
                multiline
                rows={10}
                fullWidth
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#ffffff',
                    borderRadius: '16px',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    fontFamily: 'inherit',
                    border: '1.5px solid rgba(0,0,0,0.08)'
                  }
                }}
              />

              {/* Bottom Actions inside the flipped note */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {noteDraftText.length} characters · {noteDraftText.split(/\s+/).filter(Boolean).length} words · Auto-syncs with Main Scratchpad
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                    onClick={handleCopyNote}
                    disabled={!noteDraftText}
                    sx={{ color: copied ? '#16a34a' : '#64748b', fontWeight: 700, fontSize: '0.74rem', textTransform: 'none' }}
                  >
                    {copied ? 'Copied!' : 'Copy Note'}
                  </Button>

                  {onInsertToBlock && (
                    <Button
                      size="small"
                      onClick={() => {
                        handleSaveNote();
                        onInsertToBlock(block.id, noteDraftText);
                        setIsNoteFlipped(false);
                      }}
                      disabled={!noteDraftText.trim()}
                      sx={{
                        color: color,
                        bgcolor: alpha(color, 0.1),
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        borderRadius: '10px',
                        px: 2,
                        textTransform: 'none',
                        '&:hover': { bgcolor: alpha(color, 0.2) }
                      }}
                    >
                      📥 Insert into Block Content
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
