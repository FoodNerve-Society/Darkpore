'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog, DialogContent, Box, Typography, Button,
  Chip, IconButton, Paper, alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DescriptionIcon from '@mui/icons-material/Description';
import { useClipNotes } from '@/context/ClipNoteContext';
import { BlockType } from '@/lib/config/articleBlueprints';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';

// Helper to parse the unified markdown text into article note & block notes
function parseScratchpadDocument(fullText: string, blocks: Array<{ id: string; role?: string; type: BlockType }>) {
  const blockDelimRegex = /(?:^|\n)(?:---\s*\n)?::\s*Block\s*(\d+)(?::[^\n]*|\s*-[^\n]*|[^\n]*)\n/gi;

  let matches: Array<{ blockIndex: number; startIndex: number; headerLength: number; endHeaderIndex: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = blockDelimRegex.exec(fullText)) !== null) {
    matches.push({
      blockIndex: parseInt(match[1], 10) - 1,
      startIndex: match.index,
      headerLength: match[0].length,
      endHeaderIndex: match.index + match[0].length
    });
  }

  let articleNote = '';
  let blockNotes: Record<string, string> = {};

  if (matches.length === 0) {
    articleNote = fullText.trim();
  } else {
    articleNote = fullText.substring(0, matches[0].startIndex).trim();

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextStart = (i + 1 < matches.length) ? matches[i + 1].startIndex : fullText.length;
      let rawBlockContent = fullText.substring(current.endHeaderIndex, nextStart).trim();
      rawBlockContent = rawBlockContent.replace(/\n---\s*$/, '').trim();

      const blockObj = blocks[current.blockIndex];
      if (blockObj) {
        blockNotes[blockObj.id] = rawBlockContent;
      }
    }
  }

  return { articleNote, blockNotes };
}

// Helper to compile existing notes into a single markdown document
function compileScratchpadDocument(
  articleNote: string,
  blocks: Array<{ id: string; role?: string; type: BlockType }>,
  getBlockNoteFn: (blockId: string) => string
) {
  let doc = '';
  if (articleNote && articleNote.trim()) {
    doc += articleNote.trim() + '\n\n';
  }

  blocks.forEach((b, idx) => {
    const note = getBlockNoteFn(b.id) || '';
    doc += `---\n:: Block ${idx + 1}: ${b.role || b.type}\n`;
    if (note.trim()) {
      doc += `${note.trim()}\n\n`;
    } else {
      doc += '\n';
    }
  });

  return doc;
}

export function ScratchpadModal({
  open,
  onClose,
  commodity,
  category,
  currentTitle,
  blocks = []
}: {
  open: boolean;
  onClose: () => void;
  commodity: string;
  category: string;
  currentTitle: string;
  blocks: Array<{ id: string; type: BlockType; role?: string; sopDesc?: string; content: Record<string, any> }>;
}) {
  const { notes, createNote, updateNote } = useClipNotes();

  const [documentContent, setDocumentContent] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('article');
  const [copied, setCopied] = useState(false);
  const isInitializedRef = useRef(false);

  // Existing article note
  const existingArticleNote = useMemo(() => {
    return notes.find(n => n.attachments?.some(a => a.scope === 'article')) || null;
  }, [notes]);

  // Map of existing block notes
  const blockNotesMap = useMemo(() => {
    const map: Record<string, { id: string; content: string }> = {};
    blocks.forEach(b => {
      const found = notes.find(n =>
        n.attachments?.some(a => a.scope === 'block' && (a.blockId === b.id || a.blockRole === b.role || a.blockRole === b.type))
      );
      if (found) {
        map[b.id] = { id: found.id, content: found.content };
      }
    });
    return map;
  }, [notes, blocks]);

  // Initial compilation on open
  useEffect(() => {
    if (open) {
      const initialArticleText = existingArticleNote?.content || '';
      const compiled = compileScratchpadDocument(
        initialArticleText,
        blocks,
        (blockId) => blockNotesMap[blockId]?.content || ''
      );
      setDocumentContent(compiled);
      isInitializedRef.current = true;
    } else {
      isInitializedRef.current = false;
    }
  }, [open, blocks.length]);

  // Debounced Auto-sync parser
  useEffect(() => {
    if (!open || !isInitializedRef.current) return;

    const timer = setTimeout(() => {
      const { articleNote, blockNotes } = parseScratchpadDocument(documentContent, blocks);

      // 1. Sync Article Note
      if (existingArticleNote) {
        if (existingArticleNote.content !== articleNote) {
          updateNote(existingArticleNote.id, { content: articleNote });
        }
      } else if (articleNote.trim()) {
        createNote(articleNote.trim(), 'General Article Notes', [{ scope: 'article', articleId: 'current_draft', commodity, category }]);
      }

      // 2. Sync Block Notes
      blocks.forEach((b, idx) => {
        const text = blockNotes[b.id] || '';
        const existingBlockNote = blockNotesMap[b.id];

        if (existingBlockNote) {
          if (existingBlockNote.content !== text) {
            updateNote(existingBlockNote.id, { content: text });
          }
        } else if (text.trim()) {
          createNote(text.trim(), `Block ${idx + 1} Note`, [{
            scope: 'block',
            blockId: b.id,
            blockRole: b.role || b.type,
            articleId: 'current_draft',
            commodity,
            category
          }]);
        }
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [documentContent, open]);

  // Breadcrumb scroll jump
  const handleJumpToSection = (targetId: string, idx?: number) => {
    setActiveSectionId(targetId);
    let targetPattern = '';
    if (targetId === 'article') {
      targetPattern = '#';
    } else if (typeof idx === 'number') {
      targetPattern = `:: Block ${idx + 1}`;
    }

    // Locate the textarea element inside the editor
    const textarea = document.querySelector('textarea[name="scratchpad-editor"]') as HTMLTextAreaElement | null;
    if (textarea && targetPattern) {
      const pos = documentContent.indexOf(targetPattern);
      if (pos !== -1) {
        textarea.focus();
        textarea.setSelectionRange(pos, pos + targetPattern.length);
        const lineHeight = 24;
        const lineCount = documentContent.substring(0, pos).split('\n').length;
        textarea.scrollTop = Math.max(0, (lineCount - 2) * lineHeight);
      }
    }
  };

  const handleCopyAll = () => {
    if (!documentContent) return;
    navigator.clipboard.writeText(documentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parsed note stats for breadcrumb indicators
  const parsedStats = useMemo(() => {
    return parseScratchpadDocument(documentContent, blocks);
  }, [documentContent, blocks]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
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
            width: '80vw',
            height: '80vh',
            maxWidth: '80vw',
            maxHeight: '80vh',
            borderRadius: '26px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(32px)',
            border: '1.5px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.25)'
          }
        }
      }}
    >
      {/* ═══ TOP HEADER ═══ */}
      <Box sx={{
        px: 3, py: 1.75,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        bgcolor: 'rgba(255, 255, 255, 0.85)',
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '12px',
            bgcolor: alpha('#16a34a', 0.12), color: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            📝
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
              General Research Scratchpad
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              🌾 {commodity} · 💼 {category} {currentTitle ? `· "${currentTitle}"` : ''}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label="✓ Real-time Sync"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: alpha('#16a34a', 0.12), color: '#16a34a' }}
          />
          <Button
            size="small"
            startIcon={copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
            onClick={handleCopyAll}
            sx={{
              fontWeight: 800,
              fontSize: '0.74rem',
              color: copied ? '#16a34a' : '#475569',
              bgcolor: 'rgba(0,0,0,0.04)',
              borderRadius: '10px',
              px: 1.5,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
            }}
          >
            {copied ? 'Copied Full Stream!' : 'Copy Stream'}
          </Button>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#64748b', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: '#0f172a' } }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ═══ 2-PANE BODY: LEFT VERTICAL BREADCRUMB RAIL + RIGHT CONTINUOUS MARKDOWN EDITOR ═══ */}
      <DialogContent sx={{ p: 0, display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ─── LEFT: VERTICAL BREADCRUMB NAVIGATOR (260px) ─── */}
        <Box sx={{
          width: { xs: 200, sm: 260 },
          flexShrink: 0,
          borderRight: '1px solid rgba(0,0,0,0.06)',
          bgcolor: 'rgba(248, 250, 252, 0.75)',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflowY: 'auto'
        }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', mb: 0.5, px: 1 }}>
            Scratchpad Outline
          </Typography>

          {/* General Article Note Breadcrumb */}
          <Paper
            elevation={0}
            onClick={() => handleJumpToSection('article')}
            sx={{
              p: 1.25, px: 1.5,
              borderRadius: '12px',
              border: `1.5px solid ${activeSectionId === 'article' ? '#16a34a' : 'rgba(0,0,0,0.06)'}`,
              bgcolor: activeSectionId === 'article' ? alpha('#16a34a', 0.1) : 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.18s',
              '&:hover': {
                bgcolor: alpha('#16a34a', 0.15),
                transform: 'translateX(3px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <DescriptionIcon sx={{ fontSize: 16, color: activeSectionId === 'article' ? '#16a34a' : '#64748b' }} />
              <Typography sx={{
                fontSize: '0.78rem',
                fontWeight: activeSectionId === 'article' ? 900 : 700,
                color: activeSectionId === 'article' ? '#16a34a' : '#0f172a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                General Article Notes
              </Typography>
            </Box>

            {parsedStats.articleNote && (
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16a34a', flexShrink: 0 }} />
            )}
          </Paper>

          <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', mt: 1, mb: 0.25, px: 1 }}>
            Blocks ({blocks.length})
          </Typography>

          {/* Block Breadcrumb List */}
          {blocks.map((b, idx) => {
            const hasNote = Boolean(parsedStats.blockNotes[b.id]);
            const isSelected = activeSectionId === b.id;

            return (
              <Paper
                key={b.id}
                elevation={0}
                onClick={() => handleJumpToSection(b.id, idx)}
                sx={{
                  p: 1.1, px: 1.5,
                  borderRadius: '12px',
                  border: `1.5px solid ${isSelected ? '#16a34a' : 'rgba(0,0,0,0.05)'}`,
                  bgcolor: isSelected ? alpha('#16a34a', 0.1) : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.18s',
                  '&:hover': {
                    bgcolor: alpha('#16a34a', 0.12),
                    transform: 'translateX(3px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <Box sx={{
                    width: 20, height: 20, borderRadius: '6px',
                    bgcolor: isSelected ? '#16a34a' : 'rgba(0,0,0,0.06)',
                    color: isSelected ? '#fff' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.68rem', fontWeight: 900, flexShrink: 0
                  }}>
                    {idx + 1}
                  </Box>
                  <Typography sx={{
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? 900 : 600,
                    color: isSelected ? '#16a34a' : '#334155',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {b.role || b.type}
                  </Typography>
                </Box>

                {hasNote && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16a34a', flexShrink: 0 }} />
                )}
              </Paper>
            );
          })}
        </Box>

        {/* ─── RIGHT: CONTINUOUS MARKDOWN STREAM EDITOR (Fills Remaining Space) ─── */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          overflow: 'hidden'
        }}>
          {/* Editor Sub-Bar */}
          <Box sx={{
            px: 3, py: 1,
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            bgcolor: 'rgba(248, 250, 252, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 2
          }}>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              💡 Use <code>:: Block N: [Name]</code> and <code>---</code> to assign notes to specific blocks. Any text outside belongs to the article.
            </Typography>

            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>
              {documentContent.length} chars · {documentContent.split(/\s+/).filter(Boolean).length} words
            </Typography>
          </Box>

          {/* Premium Markdown Editor Stream */}
          <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <PremiumMarkdownEditor
              colorTheme="#16a34a"
              value={documentContent}
              onChange={(e: any) => setDocumentContent(e.target.value)}
              label="Continuous Research Stream & Block Notes"
              placeholder="Write continuous notes here. Demarcate blocks with :: Block Name..."
              rows={22}
              fullWidth
              name="scratchpad-editor"
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
