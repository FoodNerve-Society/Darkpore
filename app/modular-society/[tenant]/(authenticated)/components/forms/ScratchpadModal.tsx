'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, Box, Typography, Button, TextField,
  Chip, Tooltip, IconButton, MenuItem, Select, FormControl,
  InputLabel, Tabs, Tab, alpha, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useClipNotes } from '@/context/ClipNoteContext';
import { BlockType } from '@/lib/config/articleBlueprints';
import { ClipAttachment } from '@/types/clipNotes';

export function ScratchpadModal({
  open,
  onClose,
  commodity,
  category,
  currentTitle,
  blocks = [],
  onInsertToBlock
}: {
  open: boolean;
  onClose: () => void;
  commodity: string;
  category: string;
  currentTitle: string;
  blocks: Array<{ id: string; type: BlockType; role?: string; sopDesc?: string; content: Record<string, any> }>;
  onInsertToBlock?: (blockId: string, text: string) => void;
}) {
  const { notes, createNote, updateNote, deleteNote } = useClipNotes();

  // Active Filter Tab: 'all' | 'pair' | 'article' | 'block'
  const [filterScope, setFilterScope] = useState<'all' | 'pair' | 'article' | 'block'>('all');
  const [filterBlockId, setFilterBlockId] = useState<string>('all');

  // New Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [targetScope, setTargetScope] = useState<'pair' | 'article' | 'block'>('pair');
  const [targetBlockId, setTargetBlockId] = useState<string>(blocks[0]?.id || '');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Filtered Notes based on active scope
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (filterScope === 'all') return true;
      if (filterScope === 'pair') {
        return n.attachments?.some(a => a.scope === 'commodity_category' && a.commodity === commodity && a.category === category);
      }
      if (filterScope === 'article') {
        return n.attachments?.some(a => a.scope === 'article');
      }
      if (filterScope === 'block') {
        if (filterBlockId === 'all') {
          return n.attachments?.some(a => a.scope === 'block');
        }
        return n.attachments?.some(a => a.scope === 'block' && a.blockId === filterBlockId);
      }
      return true;
    });
  }, [notes, filterScope, filterBlockId, commodity, category]);

  // Handle Save Note
  const handleSaveNote = () => {
    if (!noteContent.trim()) return;

    let attachments: ClipAttachment[] = [];
    if (targetScope === 'pair') {
      attachments = [{ scope: 'commodity_category', commodity, category }];
    } else if (targetScope === 'article') {
      attachments = [{ scope: 'article', articleId: 'current_draft' }];
    } else if (targetScope === 'block') {
      const blk = blocks.find(b => b.id === targetBlockId) || blocks[0];
      attachments = [{
        scope: 'block',
        blockId: targetBlockId,
        blockRole: blk?.role || blk?.type || 'Block',
        articleId: 'current_draft'
      }];
    }

    const tags = selectedTag ? [selectedTag] : [];

    if (editingNoteId) {
      updateNote(editingNoteId, {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        attachments,
        tags
      });
      setEditingNoteId(null);
    } else {
      createNote(noteContent.trim(), noteTitle.trim(), attachments, tags);
    }

    setNoteTitle('');
    setNoteContent('');
  };

  const handleStartEdit = (note: any) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title || '');
    setNoteContent(note.content || '');
    const blockAtt = note.attachments?.find((a: any) => a.scope === 'block');
    const articleAtt = note.attachments?.find((a: any) => a.scope === 'article');
    if (blockAtt) {
      setTargetScope('block');
      if (blockAtt.blockId) setTargetBlockId(blockAtt.blockId);
    } else if (articleAtt) {
      setTargetScope('article');
    } else {
      setTargetScope('pair');
    }
  };

  const handleCopyNote = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
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
            width: '80vw',
            height: '80vh',
            maxWidth: '80vw',
            maxHeight: '80vh',
            borderRadius: '28px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(32px)',
            border: '1.5px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.25)'
          }
        }
      }}
    >
      {/* ═══ TOP HEADER ═══ */}
      <Box sx={{
        px: 3,
        py: 2,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'rgba(255,255,255,0.8)',
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 42,
            height: 42,
            borderRadius: '14px',
            bgcolor: alpha('#16a34a', 0.12),
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            📝
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
              Scratchpad & Research Stream
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
              Capture raw thoughts, field notes, and assign them to topics, articles, or specific blocks
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={`${filteredNotes.length} Notes in View`}
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.74rem', bgcolor: 'rgba(0,0,0,0.05)', color: '#475569' }}
          />
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: 'rgba(0,0,0,0.04)',
              color: '#64748b',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: '#0f172a' }
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ═══ MAIN 2-PANE BODY (80vh split) ═══ */}
      <DialogContent sx={{ p: 0, display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ─── LEFT PANE: NOTE STREAM DRAFTER (45% width) ─── */}
        <Box sx={{
          width: { xs: '100%', md: '46%' },
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          bgcolor: 'rgba(248, 250, 252, 0.6)',
          overflowY: 'auto'
        }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', mb: 1.5 }}>
            {editingNoteId ? '✏️ Edit Note' : '➕ Capture New Stream Note'}
          </Typography>

          {/* Attribution Scope Selector */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', mb: 0.75, textTransform: 'uppercase' }}>
              Where does this note belong?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="🌾 Category & Commodity"
                onClick={() => setTargetScope('pair')}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  bgcolor: targetScope === 'pair' ? alpha('#16a34a', 0.15) : 'rgba(0,0,0,0.04)',
                  color: targetScope === 'pair' ? '#16a34a' : '#475569',
                  border: `1.5px solid ${targetScope === 'pair' ? '#16a34a' : 'transparent'}`
                }}
              />
              <Chip
                label="📄 This Article"
                onClick={() => setTargetScope('article')}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  bgcolor: targetScope === 'article' ? alpha('#2563eb', 0.15) : 'rgba(0,0,0,0.04)',
                  color: targetScope === 'article' ? '#2563eb' : '#475569',
                  border: `1.5px solid ${targetScope === 'article' ? '#2563eb' : 'transparent'}`
                }}
              />
              <Chip
                label="🧱 Specific Block"
                onClick={() => setTargetScope('block')}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  bgcolor: targetScope === 'block' ? alpha('#d97706', 0.15) : 'rgba(0,0,0,0.04)',
                  color: targetScope === 'block' ? '#d97706' : '#475569',
                  border: `1.5px solid ${targetScope === 'block' ? '#d97706' : 'transparent'}`
                }}
              />
            </Box>
          </Box>

          {/* Block Selection dropdown if targetScope === 'block' */}
          {targetScope === 'block' && blocks.length > 0 && (
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ fontSize: '0.8rem', fontWeight: 700 }}>Select Target Block</InputLabel>
              <Select
                value={targetBlockId}
                label="Select Target Block"
                onChange={(e) => setTargetBlockId(e.target.value)}
                sx={{ borderRadius: '12px', bgcolor: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
              >
                {blocks.map((b, idx) => (
                  <MenuItem key={b.id} value={b.id} sx={{ fontSize: '0.82rem' }}>
                    <strong>Block {idx + 1}:</strong> {b.role || b.type} {b.sopDesc ? `— ${b.sopDesc.substring(0, 35)}...` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Note Title */}
          <TextField
            placeholder="Note Title / Key Takeaway (optional)..."
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            size="small"
            fullWidth
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 700
              }
            }}
          />

          {/* Note Stream Markdown Content */}
          <TextField
            placeholder="Write continuous research notes, quote snippets, price indicators, or bullet points here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            multiline
            rows={10}
            fullWidth
            sx={{
              flex: 1,
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                borderRadius: '16px',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                fontFamily: 'inherit'
              }
            }}
          />

          {/* Bottom Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            {editingNoteId ? (
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setEditingNoteId(null);
                  setNoteTitle('');
                  setNoteContent('');
                }}
                sx={{ color: '#64748b', fontWeight: 700 }}
              >
                Cancel Edit
              </Button>
            ) : (
              <Typography sx={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                {noteContent.length} characters · {noteContent.split(/\s+/).filter(Boolean).length} words
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={handleSaveNote}
              disabled={!noteContent.trim()}
              startIcon={editingNoteId ? <CheckIcon /> : <AddIcon />}
              sx={{
                bgcolor: '#16a34a',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.84rem',
                borderRadius: '12px',
                px: 2.5,
                py: 0.85,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                '&:hover': { bgcolor: '#15803d' }
              }}
            >
              {editingNoteId ? 'Update Note' : 'Save to Stream'}
            </Button>
          </Box>
        </Box>

        {/* ─── RIGHT PANE: ATTRIBUTED NOTES TIMELINE (54% width) ─── */}
        <Box sx={{
          width: { xs: '100%', md: '54%' },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff'
        }}>
          {/* Filter Bar */}
          <Box sx={{
            p: 2,
            px: 3,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                Scope Filter:
              </Typography>
            </Box>

            <Tabs
              value={filterScope}
              onChange={(_, v) => setFilterScope(v)}
              sx={{
                minHeight: 32,
                '& .MuiTab-root': {
                  minHeight: 32,
                  py: 0.5,
                  px: 1.5,
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: '10px'
                }
              }}
            >
              <Tab value="all" label="All" />
              <Tab value="pair" label="Commodity/Category" />
              <Tab value="article" label="This Article" />
              <Tab value="block" label="Blocks" />
            </Tabs>
          </Box>

          {/* Notes List */}
          <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredNotes.length === 0 ? (
              <Box sx={{
                py: 8,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5
              }}>
                <Box sx={{
                  width: 54, height: 54, borderRadius: '50%',
                  bgcolor: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  📝
                </Box>
                <Typography sx={{ fontWeight: 800, color: '#475569', fontSize: '0.95rem' }}>
                  No Notes in This Scope Yet
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: 320 }}>
                  Use the left drafter to capture continuous thoughts or research findings for this topic.
                </Typography>
              </Box>
            ) : (
              filteredNotes.map((note) => {
                const isPairScope = note.attachments?.some(a => a.scope === 'commodity_category');
                const isArticleScope = note.attachments?.some(a => a.scope === 'article');
                const blockAtt = note.attachments?.find(a => a.scope === 'block');

                return (
                  <Paper
                    key={note.id}
                    elevation={0}
                    sx={{
                      p: 2.25,
                      borderRadius: '18px',
                      border: '1.5px solid rgba(0,0,0,0.06)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      transition: 'all 0.18s',
                      '&:hover': {
                        borderColor: 'rgba(0,0,0,0.14)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                      }
                    }}
                  >
                    {/* Note Card Header: Scope Tag + Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25, gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {isPairScope && (
                          <Chip
                            label={`🌾 ${commodity} · ${category}`}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: alpha('#16a34a', 0.12), color: '#16a34a', height: 22 }}
                          />
                        )}
                        {isArticleScope && (
                          <Chip
                            label="📄 Article Scope"
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: alpha('#2563eb', 0.12), color: '#2563eb', height: 22 }}
                          />
                        )}
                        {blockAtt && (
                          <Chip
                            label={`🧱 ${blockAtt.blockRole || 'Block'}`}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: alpha('#d97706', 0.12), color: '#d97706', height: 22 }}
                          />
                        )}
                      </Box>

                      {/* Card Action Icons */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={copiedId === note.id ? "Copied!" : "Copy note content"}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyNote(note.id, note.content)}
                            sx={{ color: copiedId === note.id ? '#16a34a' : '#64748b' }}
                          >
                            {copiedId === note.id ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit note">
                          <IconButton
                            size="small"
                            onClick={() => handleStartEdit(note)}
                            sx={{ color: '#64748b' }}
                          >
                            <EditNoteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete note">
                          <IconButton
                            size="small"
                            onClick={() => deleteNote(note.id)}
                            sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Title if present */}
                    {note.title && (
                      <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', mb: 0.5 }}>
                        {note.title}
                      </Typography>
                    )}

                    {/* Note Content */}
                    <Typography sx={{
                      fontSize: '0.84rem',
                      color: '#334155',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      bgcolor: 'rgba(0,0,0,0.02)',
                      p: 1.5,
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.04)'
                    }}>
                      {note.content}
                    </Typography>

                    {/* Quick Insert into active block if available */}
                    {blockAtt?.blockId && onInsertToBlock && (
                      <Box sx={{ mt: 1.25, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          onClick={() => onInsertToBlock(blockAtt.blockId!, note.content)}
                          sx={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            textTransform: 'none',
                            color: '#d97706',
                            bgcolor: alpha('#d97706', 0.08),
                            borderRadius: '8px',
                            px: 1.5,
                            '&:hover': { bgcolor: alpha('#d97706', 0.15) }
                          }}
                        >
                          📥 Insert into this Block
                        </Button>
                      </Box>
                    )}
                  </Paper>
                );
              })
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
