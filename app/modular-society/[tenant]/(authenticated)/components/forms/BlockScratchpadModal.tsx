'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog, Box, Typography, Button, Chip, Tooltip, IconButton, Paper, alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useClipNotes } from '@/context/ClipNoteContext';
import { ArticleBlockRenderer } from '@/components/learn/ArticleBlockRenderer';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import { BlockType, ArticleFormat, ArticleEra, BLOCK_DEFINITIONS } from '@/lib/config/articleBlueprints';

export function BlockScratchpadModal({
  open,
  onClose,
  block,
  blockIndex = 0,
  format,
  era,
  commodity,
  category,
  currentTitle
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
}) {
  const { notes, createNote, updateNote } = useClipNotes();

  // Full-modal 3D flip: false = Face 1 (Block Preview & Note Snippet), true = Face 2 (Flipped Rambling Markdown Workspace)
  const [isModalFlipped, setIsModalFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  // Single note for this block
  const existingNote = useMemo(() => {
    if (!block) return null;
    return notes.find(n =>
      n.attachments?.some(a => a.scope === 'block' && (a.blockId === block.id || a.blockRole === block.role || a.blockRole === block.type))
    ) || null;
  }, [notes, block]);

  const [noteDraftText, setNoteDraftText] = useState('');
  const existingNoteIdRef = useRef<string | null>(existingNote?.id || null);

  useEffect(() => {
    existingNoteIdRef.current = existingNote?.id || null;
  }, [existingNote]);

  // Sync draft text when modal opens or block changes
  useEffect(() => {
    if (existingNote) {
      setNoteDraftText(existingNote.content || '');
    } else {
      setNoteDraftText('');
    }
    setIsModalFlipped(false);
  }, [existingNote?.id, block?.id]);

  if (!block) return null;

  const bDef = BLOCK_DEFINITIONS[block.type] || { color: '#10b981', label: 'Block' };
  const color = bDef.color;

  // Auto-save logic
  const handleAutoSaveNote = (newText: string) => {
    setNoteDraftText(newText);
    const trimmed = newText.trim();
    if (!trimmed) return;

    if (existingNoteIdRef.current) {
      updateNote(existingNoteIdRef.current, { content: trimmed });
    } else {
      createNote(trimmed, `Block ${blockIndex + 1} Note`, [{
        scope: 'block',
        blockId: block.id,
        blockRole: block.role || block.type,
        articleId: 'current_draft',
        commodity,
        category
      }]);
    }
  };

  const handleFlipBack = () => {
    if (noteDraftText.trim()) {
      if (existingNoteIdRef.current) {
        updateNote(existingNoteIdRef.current, { content: noteDraftText.trim() });
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
    }
    setIsModalFlipped(false);
  };

  const handleCopyNote = () => {
    if (!noteDraftText) return;
    navigator.clipboard.writeText(noteDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if block has filled content
  const hasContent = Boolean(
    block.content?.text ||
    block.content?.heading ||
    block.content?.bionicText ||
    block.content?.quote ||
    block.content?.statValue ||
    block.content?.question ||
    (block.content?.pairs && block.content.pairs.length > 0 && block.content.pairs[0]?.myth) ||
    (block.content?.items && block.content.items.length > 0)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(16px)'
          }
        },
        paper: {
          elevation: 0,
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
            maxWidth: '860px',
            width: '92vw'
          }
        }
      }}
    >
      {/* ═══ 3D ROTATING WHOLE MODAL WRAPPER ═══ */}
      <Box sx={{
        perspective: '2400px',
        width: '100%',
        minHeight: '74vh',
        position: 'relative'
      }}>
        <Box sx={{
          position: 'relative',
          width: '100%',
          minHeight: '74vh',
          transition: 'transform 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          transform: isModalFlipped ? 'rotateY(180deg)' : 'none'
        }}>

          {/* ═══════════════════════════════════════════════════════════
              FACE 1 (FRONT): COMMODITY/CATEGORY SUBHEADER + BLOCK PREVIEW + NOTE BAR
             ═══════════════════════════════════════════════════════════ */}
          <Paper
            elevation={0}
            sx={{
              backfaceVisibility: 'hidden',
              position: isModalFlipped ? 'absolute' : 'relative',
              width: '100%',
              minHeight: '74vh',
              borderRadius: '26px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(32px)',
              border: `1.5px solid ${alpha(color, 0.25)}`,
              boxShadow: `0 24px 64px -12px ${alpha(color, 0.25)}`,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* ─── MODAL HEADER (With Commodity & Category under header) ─── */}
            <Box sx={{
              px: 3, py: 2,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              bgcolor: alpha(color, 0.04),
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, mr: 2 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '10px',
                  bgcolor: alpha(color, 0.15), color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.95rem', fontWeight: 900,
                  border: `1px solid ${alpha(color, 0.3)}`,
                  flexShrink: 0
                }}>
                  {blockIndex + 1}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                      {block.role || bDef.label}
                    </Typography>
                    <Chip
                      label={bDef.label}
                      size="small"
                      sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: alpha(color, 0.12), color }}
                    />
                  </Box>
                  {/* Commodity & Category Subtitle */}
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                    🌾 {commodity} · 💼 {category}
                  </Typography>
                </Box>
              </Box>

              <IconButton
                onClick={onClose}
                size="small"
                sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#64748b', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: '#0f172a' } }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* ─── SOP DIRECTIVE LINE ─── */}
            <Box sx={{
              px: 3, py: 1.25,
              bgcolor: 'rgba(248, 250, 252, 0.9)',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', gap: 1
            }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600, flex: 1 }}>
                🎯 <strong>{block.sopDesc || "Provides critical structure and analytical insight."}</strong>
                {block.sopHint && (
                  <span style={{ color: '#64748b', marginLeft: 8, fontStyle: 'italic' }}>
                    (e.g. &ldquo;{block.sopHint}&rdquo;)
                  </span>
                )}
              </Typography>
            </Box>

            {/* ─── LIVE ARTICLE BLOCK VISUAL PREVIEW ─── */}
            <Box sx={{
              p: 3,
              flex: 1,
              overflowY: 'auto',
              bgcolor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: hasContent ? 'flex-start' : 'center'
            }}>
              {hasContent ? (
                <Box sx={{ width: '100%', maxWidth: 740, mx: 'auto' }}>
                  <ArticleBlockRenderer
                    block={{
                      id: block.id,
                      blockType: block.type,
                      content: block.content
                    }}
                    themeMode="light"
                    accentColor={color}
                  />
                </Box>
              ) : (
                <Box sx={{
                  py: 6,
                  textAlign: 'center',
                  borderRadius: '16px',
                  bgcolor: 'rgba(0,0,0,0.02)',
                  border: '1px dashed rgba(0,0,0,0.1)',
                  maxWidth: 600,
                  mx: 'auto',
                  width: '100%'
                }}>
                  <Typography sx={{ fontWeight: 800, color: '#475569', fontSize: '0.92rem', mb: 0.5 }}>
                    Block Content is Empty
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: 360, mx: 'auto' }}>
                    Fill the fields on the canvas card or use the scratchpad note below to draft and save your thoughts.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* ─── BOTTOM SCRATCHPAD NOTE PREVIEW BAR (TAP TO ROTATE MODAL) ─── */}
            <Box sx={{
              p: 2, px: 3,
              borderTop: '1px solid rgba(0,0,0,0.06)',
              bgcolor: 'rgba(248, 250, 252, 0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 2,
              flexShrink: 0
            }}>
              <Box
                onClick={() => setIsModalFlipped(true)}
                sx={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  p: 1.25, px: 2,
                  borderRadius: '14px',
                  bgcolor: alpha('#16a34a', 0.06),
                  border: `1.5px solid ${alpha('#16a34a', 0.25)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha('#16a34a', 0.12),
                    borderColor: '#16a34a',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>📝</span>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', color: '#16a34a', letterSpacing: '0.06em' }}>
                    Scratchpad Note:
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.8rem',
                    color: noteDraftText ? '#334155' : '#94a3b8',
                    fontStyle: noteDraftText ? 'normal' : 'italic',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {noteDraftText || 'No note added yet. Tap to flip modal and write freeform thoughts, quotes, or research...'}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                onClick={() => setIsModalFlipped(true)}
                startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#16a34a',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  borderRadius: '12px',
                  px: 2.5,
                  py: 1,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#15803d' }
                }}
              >
                {noteDraftText ? 'Edit Note' : 'Add Note'}
              </Button>
            </Box>
          </Paper>


          {/* ═══════════════════════════════════════════════════════════
              FACE 2 (BACK / FLIPPED): FULL EDITABLE RAMBLING WORKSPACE (PremiumMarkdownEditor)
             ═══════════════════════════════════════════════════════════ */}
          <Paper
            elevation={0}
            sx={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: isModalFlipped ? 'relative' : 'absolute',
              width: '100%',
              minHeight: '74vh',
              borderRadius: '26px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240,253,244,0.6) 100%)',
              backdropFilter: 'blur(32px)',
              border: `1.5px solid ${alpha('#16a34a', 0.4)}`,
              boxShadow: '0 24px 64px -12px rgba(22, 163, 74, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* ─── BACK HEADER (Single Back Button + Title + Commodity/Category) ─── */}
            <Box sx={{
              px: 3, py: 2,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              bgcolor: 'rgba(255,255,255,0.9)',
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Button
                  size="small"
                  startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                  onClick={handleFlipBack}
                  sx={{
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    bgcolor: 'rgba(0,0,0,0.05)',
                    borderRadius: '10px',
                    px: 1.75,
                    py: 0.6,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.1)', color: '#0f172a' }
                  }}
                >
                  Back to Block
                </Button>
                <Box>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, textTransform: 'uppercase', color: '#16a34a', letterSpacing: '0.06em' }}>
                    Block {blockIndex + 1} Scratchpad Note
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    🌾 {commodity} · 💼 {category}
                  </Typography>
                </Box>
              </Box>

              <IconButton
                onClick={onClose}
                size="small"
                sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#64748b', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: '#0f172a' } }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* ─── FULL PREMIUM MARKDOWN EDITOR WORKSPACE ─── */}
            <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
              <PremiumMarkdownEditor
                colorTheme="#16a34a"
                value={noteDraftText}
                onChange={(e: any) => handleAutoSaveNote(e.target.value)}
                label="Rambling Notes & Field Data"
                placeholder="Write, ramble, brainstorm, paste voice transcripts, quote snippets, price indicators, or bullet points here... (Auto-saves in real time)"
                rows={13}
                fullWidth
              />
            </Box>

            {/* ─── BACK FOOTER ACTIONS ─── */}
            <Box sx={{
              p: 2, px: 3,
              borderTop: '1px solid rgba(0,0,0,0.06)',
              bgcolor: 'rgba(248, 250, 252, 0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              flexShrink: 0
            }}>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                {noteDraftText.length} characters · {noteDraftText.split(/\s+/).filter(Boolean).length} words · <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Auto-saved</span>
              </Typography>

              <Button
                size="small"
                startIcon={copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                onClick={handleCopyNote}
                disabled={!noteDraftText}
                sx={{ color: copied ? '#16a34a' : '#64748b', fontWeight: 700, fontSize: '0.76rem', textTransform: 'none' }}
              >
                {copied ? 'Copied!' : 'Copy Note'}
              </Button>
            </Box>
          </Paper>

        </Box>
      </Box>
    </Dialog>
  );
}
