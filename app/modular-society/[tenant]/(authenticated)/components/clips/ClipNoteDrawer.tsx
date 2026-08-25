'use client';

import React, { useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, Button, TextField, Chip, 
  InputAdornment, Tooltip, Divider, alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useClipNotes } from '@/context/ClipNoteContext';

export function ClipNoteDrawer({
  currentCommodity,
  currentCategory,
  currentArticleId,
  onInsertIntoCanvas
}: {
  currentCommodity?: string;
  currentCategory?: string;
  currentArticleId?: string;
  onInsertIntoCanvas?: (content: string) => void;
}) {
  const { 
    notes, isOpen, closeClipDrawer, createNote, deleteNote, 
    currentFilter, setFilter 
  } = useClipNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Filter notes based on active scope & search query
  const filteredNotes = notes.filter(note => {
    if (searchQuery.trim()) {
      const matchSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;
    }

    if (currentFilter.scope === 'commodity_category' && currentCommodity && currentCategory) {
      return note.attachments.some(a => 
        a.scope === 'commodity_category' && 
        (!a.commodity || a.commodity.toLowerCase() === currentCommodity.toLowerCase()) &&
        (!a.category || a.category.toLowerCase() === currentCategory.toLowerCase())
      );
    }
    if (currentFilter.scope === 'article' && currentArticleId) {
      return note.attachments.some(a => a.scope === 'article' && a.articleId === currentArticleId);
    }
    if (currentFilter.scope === 'block' && currentFilter.blockRole) {
      return note.attachments.some(a => a.scope === 'block' && a.blockRole === currentFilter.blockRole);
    }
    return true;
  });

  const handleCreateSubmit = () => {
    if (!newContent.trim()) return;
    const attachments = [];
    if (currentCommodity && currentCategory) {
      attachments.push({
        scope: 'commodity_category' as const,
        commodity: currentCommodity,
        category: currentCategory,
        articleId: currentArticleId
      });
    } else {
      attachments.push({ scope: 'global' as const });
    }

    createNote(newContent.trim(), newTitle.trim(), attachments);
    setNewContent('');
    setNewTitle('');
    setIsCreating(false);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={closeClipDrawer}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 440 },
            p: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1.5px solid rgba(0,0,0,0.08)',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      {/* ─── Top Header ─── */}
      <Box sx={{ p: 2.5, pb: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '1.25rem' }}>📎</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>
            Clip Notes
          </Typography>
          <Chip label={`${notes.length}`} size="small" sx={{ fontWeight: 800, height: 20, fontSize: '0.7rem' }} />
        </Box>
        <IconButton size="small" onClick={closeClipDrawer}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ─── Search & Scope Filter Bar ─── */}
      <Box sx={{ p: 2, pb: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <TextField
          size="small"
          placeholder="Search research notes, stats, quotes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.02)' } }}
        />

        {/* Filter Pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Chip
            label="All Notes"
            size="small"
            onClick={() => setFilter({ scope: 'all' })}
            sx={{
              fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
              bgcolor: currentFilter.scope === 'all' ? '#0f172a' : 'rgba(0,0,0,0.04)',
              color: currentFilter.scope === 'all' ? '#fff' : '#475569',
            }}
          />
          {currentCommodity && (
            <Chip
              label={`🌾 ${currentCommodity.split(',')[0]}`}
              size="small"
              onClick={() => setFilter({ scope: 'commodity_category', commodity: currentCommodity, category: currentCategory })}
              sx={{
                fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
                bgcolor: currentFilter.scope === 'commodity_category' ? '#059669' : 'rgba(0,0,0,0.04)',
                color: currentFilter.scope === 'commodity_category' ? '#fff' : '#475569',
              }}
            />
          )}
        </Box>
      </Box>

      {/* ─── Quick Note Creation ─── */}
      <Box sx={{ px: 2, py: 1 }}>
        {!isCreating ? (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIsCreating(true)}
            sx={{
              borderRadius: '14px', py: 1, fontWeight: 800, fontSize: '0.85rem',
              borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.2)', color: '#334155',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: '#0f172a' }
            }}
          >
            + Clip a Quick Note / Stat
          </Button>
        ) : (
          <Box sx={{ p: 2, borderRadius: '16px', border: '1.5px solid #059669', bgcolor: '#f0fdf4', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="Note Title (Optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '10px' } }}
            />
            <TextField
              multiline
              rows={3}
              placeholder="Type or paste field research, interview quotes, unit economics numbers..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '10px' } }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
              <Button size="small" onClick={() => setIsCreating(false)} sx={{ fontWeight: 700, color: '#64748b' }}>
                Cancel
              </Button>
              <Button size="small" variant="contained" onClick={handleCreateSubmit} sx={{ bgcolor: '#059669', fontWeight: 800, borderRadius: '8px' }}>
                Save Clip
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 1, borderColor: 'rgba(0,0,0,0.06)' }} />

      {/* ─── Notes List ─── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {filteredNotes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>📝</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748b' }}>
              No Clip Notes Found
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mt: 0.5 }}>
              Clip field data, price numbers, or interview quotes here to reuse across blocks.
            </Typography>
          </Box>
        ) : (
          filteredNotes.map((note) => (
            <Box
              key={note.id}
              sx={{
                p: 2, borderRadius: '16px', bgcolor: '#ffffff',
                border: '1.5px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex', flexDirection: 'column', gap: 1,
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'rgba(0,0,0,0.15)', transform: 'translateY(-1px)' }
              }}
            >
              {note.title && (
                <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                  {note.title}
                </Typography>
              )}
              <Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {note.content}
              </Typography>

              {/* Attachments Pills */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', pt: 0.5 }}>
                {note.attachments.map((att, idx) => (
                  <Chip
                    key={idx}
                    icon={<PushPinIcon sx={{ fontSize: 12 }} />}
                    label={
                      att.scope === 'commodity_category' ? `🌾 ${att.commodity?.split(',')[0]}` :
                      att.scope === 'block' ? `🧱 ${att.blockRole}` : '🌐 Global'
                    }
                    size="small"
                    sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.04)' }}
                  />
                ))}
              </Box>

              {/* Card Footer Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px dashed rgba(0,0,0,0.06)' }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                  {new Date(note.createdAt).toLocaleDateString()}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {onInsertIntoCanvas && (
                    <Button
                      size="small"
                      onClick={() => onInsertIntoCanvas(note.content)}
                      sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', py: 0.2 }}
                    >
                      ⚡ Insert
                    </Button>
                  )}
                  <Tooltip title="Copy text">
                    <IconButton size="small" onClick={() => navigator.clipboard.writeText(note.content)}>
                      <ContentCopyIcon sx={{ fontSize: 14, color: '#64748b' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete clip">
                    <IconButton size="small" onClick={() => deleteNote(note.id)}>
                      <DeleteIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Drawer>
  );
}
