'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog, DialogContent, Box, Typography, Button,
  Chip, IconButton, Paper, alpha, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DescriptionIcon from '@mui/icons-material/Description';
import GrassIcon from '@mui/icons-material/Grass';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useClipNotes } from '@/context/ClipNoteContext';
import { BlockType, ArticleFormat, ArticleEra, FORMAT_CONFIG, ERA_CONFIG, BLOCK_DEFINITIONS } from '@/lib/config/articleBlueprints';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';

// Helper to sanitize subcategory string (remove bracketed descriptions)
function getCleanSubcategory(subcategory?: string): string {
  if (!subcategory) return '';
  return subcategory.replace(/\s*\([^)]*\)/g, '').trim();
}

// Helper to create default block content schema
function createDefaultBlockContent(bType: BlockType): Record<string, any> {
  const content: Record<string, any> = {};
  if (bType === 'myth_fact') Object.assign(content, { myth: '', fact: '' });
  if (bType === 'live_poll') Object.assign(content, { question: '', options: 'Yes,No' });
  if (bType === 'pull_quote') Object.assign(content, { quote: '', attribution: '' });
  if (bType === 'exec_summary') Object.assign(content, { points: '' });
  if (bType === 'core_interactive') Object.assign(content, { bionicText: '', anchorQuestion: '', imageUrl: '' });
  if (bType === 'subheading') Object.assign(content, { text: '' });
  if (bType === 'highlight_card') Object.assign(content, { imageUrl: '', caption: '' });
  if (bType === 'media') Object.assign(content, { mediaUrl: '', caption: '' });
  if (bType === 'comparison_matrix') Object.assign(content, { 
    optionAName: '', optionBName: '', winnerVerdict: '', 
    rows: [
      { criterion: 'CAPEX', optionAValue: '', optionBValue: '', winner: 'A' },
      { criterion: 'OPEX / mo', optionAValue: '', optionBValue: '', winner: 'B' },
      { criterion: 'Payback Period', optionAValue: '', optionBValue: '', winner: 'A' }
    ] 
  });
  if (bType === 'unit_economics_card') Object.assign(content, { 
    tam: '', targetIrr: '', ticketSize: '', paybackPeriod: '', grossMargin: '', primaryRisk: '', dealThesis: '' 
  });
  if (bType === 'protocol_steps') Object.assign(content, { 
    steps: [
      { stepNumber: 1, title: 'Initial Action Step', role: 'Operator', timeWindow: 'Phase 1', description: '', checklist: [] }
    ] 
  });
  if (bType === 'timeline_tracker') Object.assign(content, { 
    milestones: [
      { dateOrYear: 'Milestone 1', title: 'Primary Target', description: '', status: 'Active' }
    ] 
  });
  if (bType === 'persona_dossier') Object.assign(content, { 
    name: '', roleAndLocation: '', age: '', monthlyTurnover: '', bio: '', fieldQuote: '', avatarUrl: '' 
  });
  if (bType === 'ecosystem_embed') Object.assign(content, { 
    embedType: 'job', title: '', organization: '', location: '', compensationOrTarget: '', ctaText: 'Apply Now', ctaLink: '' 
  });
  return content;
}

// Universal parser that extracts clean notes from nested curly tag format and legacy formats
function parseScratchpadDocument(fullText: string, blocks: Array<{ id: string; role?: string; type: BlockType }>) {
  let pairNote = '';
  let articleNote = '';
  let blockNotes: Record<string, string> = {};

  if (!fullText) return { pairNote, articleNote, blockNotes };

  // 1. If text uses new {Commodity...} / {Article...} / {Block...} format
  if (fullText.includes('{Commodity') || fullText.includes('{Article') || fullText.includes('{Block')) {
    const commodityMatch = fullText.match(/\{Commodity[^}]*\}([\s\S]*?)(?:\{Article|\{\/Commodity\}|$)/i);
    if (commodityMatch) {
      pairNote = commodityMatch[1].trim();
    }

    const articleMatch = fullText.match(/\{Article[^}]*\}([\s\S]*?)(?:\{Block|\{\/Article\}|$)/i);
    if (articleMatch) {
      articleNote = articleMatch[1].trim();
    }

    const blockRegex = /\{Block\s*(\d+)[^}]*\}([\s\S]*?)(?:\{\/Block\s*\1\}|(?=\{Block\s*\d+)|\{\/Article\}|$)/gi;
    let bMatch: RegExpExecArray | null;
    while ((bMatch = blockRegex.exec(fullText)) !== null) {
      const blockIdx = parseInt(bMatch[1], 10) - 1;
      const rawContent = bMatch[2].trim();
      const blockObj = blocks[blockIdx];
      if (blockObj) {
        blockNotes[blockObj.id] = rawContent;
      }
    }
    return { pairNote, articleNote, blockNotes };
  }

  // 2. Legacy fallback parser (for existing saved notes using # :: or :: Block headers)
  const headerRegex = /(?:^|\n)(?:---\s*\n)?(?:#+\s*)?::\s*([^\n]+)\n/gi;
  let sections: Array<{ header: string; startIndex: number; endHeaderIndex: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(fullText)) !== null) {
    sections.push({
      header: match[1].trim(),
      startIndex: match.index,
      endHeaderIndex: match.index + match[0].length
    });
  }

  if (sections.length > 0) {
    for (let i = 0; i < sections.length; i++) {
      const current = sections[i];
      const nextStart = (i + 1 < sections.length) ? sections[i + 1].startIndex : fullText.length;
      let rawContent = fullText.substring(current.endHeaderIndex, nextStart).trim();
      rawContent = rawContent.replace(/\n---\s*$/, '').trim();

      const headerLower = current.header.toLowerCase();
      if (headerLower.includes('commodity') || headerLower.includes('category')) {
        pairNote = rawContent;
      } else if (headerLower.includes('article')) {
        articleNote = rawContent;
      } else {
        const blockMatch = current.header.match(/block\s*(\d+)/i);
        if (blockMatch) {
          const blockIdx = parseInt(blockMatch[1], 10) - 1;
          const blockObj = blocks[blockIdx];
          if (blockObj) {
            blockNotes[blockObj.id] = rawContent;
          }
        }
      }
    }
  } else {
    articleNote = fullText.trim();
  }

  return { pairNote, articleNote, blockNotes };
}

// Helper to compile the clean nested curly bracket document with Era & Format in Article tag
function compileScratchpadDocument(
  pairNote: string,
  articleNote: string,
  commodity: string,
  category: string,
  cleanSubcategory: string,
  formatLabel: string,
  eraLabel: string,
  blocks: Array<{ id: string; role?: string; type: BlockType }>,
  getBlockNoteFn: (blockId: string) => string
) {
  let doc = `{Commodity: ${commodity} · ${category}}\n`;
  if (pairNote && pairNote.trim()) {
    doc += `${pairNote.trim()}\n\n`;
  } else {
    doc += '\n';
  }

  const articleName = cleanSubcategory
    ? `${cleanSubcategory} (${formatLabel || 'Brief'} · ${eraLabel || 'Present'})`
    : `Article Draft (${formatLabel || 'Brief'} · ${eraLabel || 'Present'})`;

  doc += `{Article: ${articleName}}\n`;
  if (articleNote && articleNote.trim()) {
    doc += `${articleNote.trim()}\n\n`;
  } else {
    doc += '\n';
  }

  blocks.forEach((b, idx) => {
    const note = getBlockNoteFn(b.id) || '';
    doc += `{Block ${idx + 1}: ${b.role || b.type}}\n`;
    if (note && note.trim()) {
      doc += `${note.trim()}\n`;
    }
    doc += `{/Block ${idx + 1}}\n\n`;
  });

  doc += `{/Article}\n`;
  doc += `{/Commodity}\n`;

  return doc;
}

// ─── SORTABLE BREADCRUMB ITEM COMPONENT ───
function SortableBreadcrumbBlockItem({
  id,
  index,
  role,
  type,
  isSelected,
  hasNote,
  isMissingTag,
  onSelect,
  onRemove,
  onRestoreTag
}: {
  id: string;
  index: number;
  role?: string;
  type: BlockType;
  isSelected: boolean;
  hasNote: boolean;
  isMissingTag: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  onRestoreTag?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const bDef = BLOCK_DEFINITIONS[type] || { color: '#64748b', label: type };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 0.85, px: 1.25,
        borderRadius: '12px',
        border: `1.5px solid ${isMissingTag ? '#f59e0b' : isSelected ? '#16a34a' : 'rgba(0,0,0,0.05)'}`,
        bgcolor: isSelected ? alpha('#16a34a', 0.1) : isMissingTag ? alpha('#f59e0b', 0.08) : 'rgba(255,255,255,0.7)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.18s',
        '&:hover': {
          bgcolor: alpha('#16a34a', 0.12),
          transform: 'translateX(2px)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
        {/* Drag handle */}
        <Box
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          sx={{
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            color: '#94a3b8',
            display: 'flex', alignItems: 'center',
            p: 0.25,
            borderRadius: '4px',
            '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.05)' }
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: 16 }} />
        </Box>

        <Box sx={{
          width: 20, height: 20, borderRadius: '6px',
          bgcolor: isSelected ? '#16a34a' : alpha(bDef.color, 0.15),
          color: isSelected ? '#fff' : bDef.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.68rem', fontWeight: 900, flexShrink: 0
        }}>
          {index + 1}
        </Box>

        <Typography sx={{
          fontSize: '0.74rem',
          fontWeight: isSelected ? 900 : 600,
          color: isSelected ? '#16a34a' : '#334155',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {role || bDef.label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isMissingTag && onRestoreTag && (
          <Tooltip title="Tag missing in document. Click to insert tag">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRestoreTag();
              }}
              sx={{ p: 0.25, color: '#f59e0b', '&:hover': { bgcolor: alpha('#f59e0b', 0.15) } }}
            >
              <AutoFixHighIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}

        {hasNote && !isMissingTag && (
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16a34a', flexShrink: 0 }} />
        )}
        {onRemove && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            sx={{
              p: 0.25,
              color: '#94a3b8',
              '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' }
            }}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
}

export function ScratchpadModal({
  open,
  onClose,
  commodity,
  category,
  subcategory = '',
  format = 'brief',
  era = 'present',
  currentTitle,
  blocks = [],
  onReorderBlocks
}: {
  open: boolean;
  onClose: () => void;
  commodity: string;
  category: string;
  subcategory?: string;
  format?: ArticleFormat;
  era?: ArticleEra;
  currentTitle: string;
  blocks: Array<{ id: string; type: BlockType; role?: string; sopDesc?: string; content: Record<string, any> }>;
  onReorderBlocks?: (reorderedBlocks: Array<{ id: string; type: BlockType; role?: string; sopDesc?: string; content: Record<string, any> }>) => void;
}) {
  const { notes, createNote, updateNote } = useClipNotes();

  const [documentContent, setDocumentContent] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('pair');
  const [copied, setCopied] = useState(false);
  const [restoredToast, setRestoredToast] = useState(false);
  const isInitializedRef = useRef(false);

  const cleanSubcategory = getCleanSubcategory(subcategory);
  const formatMeta = FORMAT_CONFIG[format] || FORMAT_CONFIG.brief;
  const eraMeta = ERA_CONFIG[era] || ERA_CONFIG.present;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Existing pair note
  const existingPairNote = useMemo(() => {
    return notes.find(n =>
      n.attachments?.some(a => a.scope === 'commodity_category' && a.commodity === commodity && a.category === category)
    ) || null;
  }, [notes, commodity, category]);

  // Existing article note
  const existingArticleNote = useMemo(() => {
    return notes.find(n => n.attachments?.some(a => a.scope === 'article')) || null;
  }, [notes]);

  // Map of existing block notes (pure user-written note content)
  const blockNotesMap = useMemo(() => {
    const map: Record<string, { id: string; content: string }> = {};
    blocks.forEach(b => {
      const found = notes.find(n =>
        n.attachments?.some(a => a.scope === 'block' && (a.blockId === b.id || a.blockRole === b.role || a.blockRole === b.type))
      );
      if (found && typeof found.content === 'string') {
        let textContent = found.content;
        if (textContent.trim().startsWith('{') && textContent.trim().endsWith('}') && textContent.includes('":"')) {
          try {
            const parsed = JSON.parse(textContent);
            textContent = parsed.text || parsed.summary || parsed.description || '';
          } catch (e) {}
        }
        map[b.id] = { id: found.id, content: textContent };
      }
    });
    return map;
  }, [notes, blocks]);

  // Initial compilation on open with smart legacy sanitization
  useEffect(() => {
    if (open) {
      const rawPair = existingPairNote?.content || '';
      const rawArticle = existingArticleNote?.content || '';

      const parsedPair = parseScratchpadDocument(rawPair, blocks);
      const parsedArticle = parseScratchpadDocument(rawArticle, blocks);

      const initialPairText = parsedPair.pairNote || (rawPair.startsWith('{') || rawPair.startsWith('#') ? '' : rawPair);
      const initialArticleText = parsedArticle.articleNote || (rawArticle.startsWith('{') || rawArticle.startsWith('#') ? '' : rawArticle);

      const compiled = compileScratchpadDocument(
        initialPairText,
        initialArticleText,
        commodity,
        category,
        cleanSubcategory,
        formatMeta.label,
        eraMeta.label,
        blocks,
        (blockId) => blockNotesMap[blockId]?.content || parsedArticle.blockNotes[blockId] || parsedPair.blockNotes[blockId] || ''
      );
      setDocumentContent(compiled);
      isInitializedRef.current = true;
    } else {
      isInitializedRef.current = false;
    }
  }, [open, blocks.length, commodity, category, cleanSubcategory, format, era]);

  // Debounced Auto-sync parser
  useEffect(() => {
    if (!open || !isInitializedRef.current) return;

    const timer = setTimeout(() => {
      const { pairNote, articleNote, blockNotes } = parseScratchpadDocument(documentContent, blocks);

      // 1. Sync Pair Note
      if (existingPairNote) {
        if (existingPairNote.content !== pairNote) {
          updateNote(existingPairNote.id, { content: pairNote });
        }
      } else if (pairNote.trim()) {
        createNote(pairNote.trim(), `${commodity} · ${category} Notes`, [{ scope: 'commodity_category', commodity, category }]);
      }

      // 2. Sync Article Note
      if (existingArticleNote) {
        if (existingArticleNote.content !== articleNote) {
          updateNote(existingArticleNote.id, { content: articleNote });
        }
      } else if (articleNote.trim()) {
        createNote(articleNote.trim(), `Article: ${cleanSubcategory || 'Draft'} Notes`, [{ scope: 'article', articleId: 'current_draft', commodity, category }]);
      }

      // 3. Sync Block Notes
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

  // Re-build / Repair all tags losslessly
  const handleRepairAndRebuildStructure = () => {
    const { pairNote, articleNote, blockNotes } = parseScratchpadDocument(documentContent, blocks);
    const rebuilt = compileScratchpadDocument(
      pairNote,
      articleNote,
      commodity,
      category,
      cleanSubcategory,
      formatMeta.label,
      eraMeta.label,
      blocks,
      (blockId) => blockNotes[blockId] || blockNotesMap[blockId]?.content || ''
    );
    setDocumentContent(rebuilt);
    setRestoredToast(true);
    setTimeout(() => setRestoredToast(false), 2500);
  };

  // Restore a specific missing block tag into the document
  const handleRestoreSpecificBlockTag = (idx: number, b: typeof blocks[0]) => {
    const tagHeader = `{Block ${idx + 1}: ${b.role || b.type}}`;
    const tagCloser = `{/Block ${idx + 1}}`;
    const blockBlock = `${tagHeader}\n\n${tagCloser}\n\n`;

    if (documentContent.includes('{/Article}')) {
      const updated = documentContent.replace('{/Article}', `${blockBlock}{/Article}`);
      setDocumentContent(updated);
    } else {
      setDocumentContent(documentContent + '\n\n' + blockBlock);
    }
  };

  // Handle Drag & Drop reordering in left sidebar
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(item => item.id === active.id);
      const newIndex = blocks.findIndex(item => item.id === over.id);
      const reordered = arrayMove(blocks, oldIndex, newIndex);

      onReorderBlocks?.(reordered);

      const { pairNote, articleNote, blockNotes } = parseScratchpadDocument(documentContent, blocks);
      const recompiled = compileScratchpadDocument(
        pairNote,
        articleNote,
        commodity,
        category,
        cleanSubcategory,
        formatMeta.label,
        eraMeta.label,
        reordered,
        (id) => blockNotes[id] || blockNotesMap[id]?.content || ''
      );
      setDocumentContent(recompiled);
    }
  };

  // Add a new block from the ecosystem library directly into the article & scratchpad
  const handleAddBlockFromLibrary = (bType: BlockType) => {
    const bDef = BLOCK_DEFINITIONS[bType] || { label: bType, color: '#10b981' };
    const newBlock = {
      id: Math.random().toString(),
      type: bType,
      role: bDef.label,
      content: createDefaultBlockContent(bType)
    };

    const newBlocks = [...blocks, newBlock];
    onReorderBlocks?.(newBlocks);

    const { pairNote, articleNote, blockNotes } = parseScratchpadDocument(documentContent, blocks);
    const recompiled = compileScratchpadDocument(
      pairNote,
      articleNote,
      commodity,
      category,
      cleanSubcategory,
      formatMeta.label,
      eraMeta.label,
      newBlocks,
      (id) => blockNotes[id] || ''
    );
    setDocumentContent(recompiled);
    setActiveSectionId(newBlock.id);
  };

  // Remove a block from the active list
  const handleRemoveBlock = (blockId: string) => {
    const filtered = blocks.filter(b => b.id !== blockId);
    onReorderBlocks?.(filtered);

    const { pairNote, articleNote, blockNotes } = parseScratchpadDocument(documentContent, blocks);
    const recompiled = compileScratchpadDocument(
      pairNote,
      articleNote,
      commodity,
      category,
      cleanSubcategory,
      formatMeta.label,
      eraMeta.label,
      filtered,
      (id) => blockNotes[id] || ''
    );
    setDocumentContent(recompiled);
  };

  // Breadcrumb scroll jump (or auto-restore if missing tag)
  const handleJumpToSection = (targetId: string, idx?: number, blockObj?: typeof blocks[0]) => {
    setActiveSectionId(targetId);
    let targetPattern = '';
    if (targetId === 'pair') {
      targetPattern = '{Commodity:';
    } else if (targetId === 'article') {
      targetPattern = '{Article:';
    } else if (typeof idx === 'number') {
      targetPattern = `{Block ${idx + 1}:`;
    }

    const textarea = document.querySelector('textarea[name="scratchpad-editor"]') as HTMLTextAreaElement | null;
    if (textarea && targetPattern) {
      const pos = documentContent.indexOf(targetPattern);
      if (pos !== -1) {
        textarea.focus();
        textarea.setSelectionRange(pos, pos + targetPattern.length);
        const lineHeight = 24;
        const lineCount = documentContent.substring(0, pos).split('\n').length;
        textarea.scrollTop = Math.max(0, (lineCount - 2) * lineHeight);
      } else if (typeof idx === 'number' && blockObj) {
        handleRestoreSpecificBlockTag(idx, blockObj);
      }
    }
  };

  const handleCopyAll = () => {
    if (!documentContent) return;
    navigator.clipboard.writeText(documentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allLibraryBlocks = Object.entries(BLOCK_DEFINITIONS);

  const parsedStats = useMemo(() => {
    return parseScratchpadDocument(documentContent, blocks);
  }, [documentContent, blocks]);

  const displayArticleTitle = cleanSubcategory || currentTitle || 'Article Draft';

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
            width: '82vw',
            height: '82vh',
            maxWidth: '82vw',
            maxHeight: '82vh',
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
      {/* ═══ TOP HEADER (Includes Commodity, Category, Clean Subcategory, Era & Format) ═══ */}
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
              Research Scratchpad
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              🌾 {commodity} · 💼 {category} {cleanSubcategory ? `· ${cleanSubcategory}` : ''} · {formatMeta.label} · {eraMeta.label}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Rebuild & Fix Tags Button */}
          <Button
            size="small"
            startIcon={<AutoFixHighIcon sx={{ fontSize: 15 }} />}
            onClick={handleRepairAndRebuildStructure}
            sx={{
              fontWeight: 800,
              fontSize: '0.74rem',
              color: restoredToast ? '#16a34a' : '#2563eb',
              bgcolor: restoredToast ? alpha('#16a34a', 0.1) : alpha('#2563eb', 0.08),
              borderRadius: '10px',
              px: 1.5,
              textTransform: 'none',
              '&:hover': { bgcolor: alpha('#2563eb', 0.15) }
            }}
          >
            {restoredToast ? '✓ Tags Restored!' : 'Fix Tags & Restore Blocks'}
          </Button>

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

      {/* ═══ 2-PANE BODY: LEFT NAVIGATOR + RIGHT CONTINUOUS MARKDOWN EDITOR ═══ */}
      <DialogContent sx={{ p: 0, display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ─── LEFT: NESTED BREADCRUMBS, REORDERING & ALL AVAILABLE BLOCK LIBRARY (280px) ─── */}
        <Box sx={{
          width: { xs: 220, sm: 280 },
          flexShrink: 0,
          borderRight: '1px solid rgba(0,0,0,0.06)',
          bgcolor: 'rgba(248, 250, 252, 0.75)',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          overflowY: 'auto'
        }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', mb: 0.25, px: 1 }}>
            Hierarchical Outline
          </Typography>

          {/* 1. Commodity & Category Global Note Breadcrumb */}
          <Paper
            elevation={0}
            onClick={() => handleJumpToSection('pair')}
            sx={{
              p: 1.1, px: 1.35,
              borderRadius: '12px',
              border: `1.5px solid ${activeSectionId === 'pair' ? '#16a34a' : 'rgba(0,0,0,0.06)'}`,
              bgcolor: activeSectionId === 'pair' ? alpha('#16a34a', 0.1) : 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.18s',
              '&:hover': {
                bgcolor: alpha('#16a34a', 0.15),
                transform: 'translateX(2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <GrassIcon sx={{ fontSize: 16, color: activeSectionId === 'pair' ? '#16a34a' : '#64748b' }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{
                  fontSize: '0.75rem',
                  fontWeight: activeSectionId === 'pair' ? 900 : 700,
                  color: activeSectionId === 'pair' ? '#16a34a' : '#0f172a',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  🌾 {commodity} · {category}
                </Typography>
                <Typography sx={{ fontSize: '0.64rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Global Topic Scope
                </Typography>
              </Box>
            </Box>

            {parsedStats.pairNote && (
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16a34a', flexShrink: 0, ml: 1 }} />
            )}
          </Paper>

          {/* 2. Article Container Breadcrumb (Clean Subcategory Name + Format & Era) */}
          <Paper
            elevation={0}
            onClick={() => handleJumpToSection('article')}
            sx={{
              p: 1.1, px: 1.35,
              borderRadius: '12px',
              border: `1.5px solid ${activeSectionId === 'article' ? '#16a34a' : 'rgba(0,0,0,0.06)'}`,
              bgcolor: activeSectionId === 'article' ? alpha('#16a34a', 0.1) : 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.18s',
              '&:hover': {
                bgcolor: alpha('#16a34a', 0.15),
                transform: 'translateX(2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <DescriptionIcon sx={{ fontSize: 16, color: activeSectionId === 'article' ? '#16a34a' : '#64748b' }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{
                  fontSize: '0.75rem',
                  fontWeight: activeSectionId === 'article' ? 900 : 700,
                  color: activeSectionId === 'article' ? '#16a34a' : '#0f172a',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  📄 {displayArticleTitle}
                </Typography>
                <Typography sx={{ fontSize: '0.64rem', color: '#64748b' }}>
                  {formatMeta.label} · {eraMeta.label}
                </Typography>
              </Box>
            </Box>

            {parsedStats.articleNote && (
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16a34a', flexShrink: 0, ml: 1 }} />
            )}
          </Paper>

          {/* ─── 3. ACTIVE BLOCKS NESTED UNDER ARTICLE ─── */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, px: 1 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
              Article SOP Blocks ({blocks.length})
            </Typography>
            <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Drag to reorder
            </Typography>
          </Box>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {blocks.map((b, idx) => {
                  const hasNote = Boolean(parsedStats.blockNotes[b.id]);
                  const isSelected = activeSectionId === b.id;
                  const isMissingTag = !documentContent.includes(`{Block ${idx + 1}:`);

                  return (
                    <SortableBreadcrumbBlockItem
                      key={b.id}
                      id={b.id}
                      index={idx}
                      role={b.role}
                      type={b.type}
                      isSelected={isSelected}
                      hasNote={hasNote}
                      isMissingTag={isMissingTag}
                      onSelect={() => handleJumpToSection(b.id, idx, b)}
                      onRemove={() => handleRemoveBlock(b.id)}
                      onRestoreTag={() => handleRestoreSpecificBlockTag(idx, b)}
                    />
                  );
                })}
              </Box>
            </SortableContext>
          </DndContext>

          {/* ─── 4. ALL AVAILABLE ECOSYSTEM BLOCKS CATALOGUE (FULL LIST) ─── */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', mb: 1, px: 1 }}>
              + Add Blocks to Article ({allLibraryBlocks.length})
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {allLibraryBlocks.map(([key, def]) => (
                <Paper
                  key={key}
                  elevation={0}
                  onClick={() => handleAddBlockFromLibrary(key as BlockType)}
                  sx={{
                    p: 0.75, px: 1.25,
                    borderRadius: '10px',
                    border: '1px dashed rgba(0,0,0,0.12)',
                    bgcolor: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.18s',
                    '&:hover': {
                      bgcolor: alpha(def.color, 0.1),
                      borderColor: def.color,
                      transform: 'translateX(2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: def.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {def.label}
                    </Typography>
                  </Box>

                  <AddIcon sx={{ fontSize: 16, color: def.color }} />
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ─── RIGHT: CONTINUOUS MARKDOWN STREAM EDITOR (Fills Remaining Space) ─── */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          overflow: 'hidden'
        }}>
          {/* Editor Sub-Bar with simplified, natural helper text & Quick Fix action */}
          <Box sx={{
            px: 3, py: 1.25,
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            bgcolor: 'rgba(248, 250, 252, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 2
          }}>
            <Typography sx={{ fontSize: '0.76rem', color: '#334155', fontWeight: 600 }}>
              💡 Write your notes inside the <code>{'{Block N: ...}'}</code> and <code>{' {/Block N}'}</code> tags. If tags are deleted, click <b>Fix Tags & Restore Blocks</b> above.
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
              label="Continuous Research Stream & Notes"
              placeholder="Write continuous notes here. Place notes inside the matching {Block N} ... {/Block N} tags..."
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
