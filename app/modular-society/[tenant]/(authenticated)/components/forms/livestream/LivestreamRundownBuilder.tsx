'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Avatar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Mic as MicIcon,
  Delete as DeleteIcon,
  AutoAwesome as SparkleIcon,
  MenuBook as BookIcon,
  Work as WorkIcon,
  Flip as FlipIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/system';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SlideSpikyTitle,
  SlideMythFact,
  SlideStatCard,
  SlideJob,
  SlideTransition,
  SlideQuote,
  SlideMedia,
  SlideFallback,
  SlideRundownAct,
} from './SlideComponents';

// --- Types ---
export type RundownItem = {
  id: string; // unique instance id for the rundown
  sourceType: 'act' | 'article_block' | 'job' | 'transition';
  sourceId?: string;
  parentArticleId?: string;
  parentArticleTitle?: string;
  originalBlockType?: string;
  originalContent?: any;
  speakerNotes: string;
  durationStr: string;
};

// Preset duration options for fast tagging
const DURATION_PRESETS = ['2m', '5m', '10m', '15m', '20m'];

// --- Sortable Item Wrapper ---
function SortableRundownCard({
  item,
  index,
  actNumber,
  onUpdate,
  onRemove,
}: {
  item: RundownItem;
  index: number;
  actNumber?: number;
  onUpdate: (id: string, updates: Partial<RundownItem>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [isFlipped, setIsFlipped] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  const isAct = item.sourceType === 'act' || item.originalBlockType === 'rundown_act' || Boolean(item.originalContent?.role);
  const isJob = item.sourceType === 'job' || Boolean(item.originalContent?.jobTitle);
  const isTransition = item.sourceType === 'transition' && !isAct;

  // Thematic border and badge colors
  const themeColor = isAct ? '#10b981' : isJob ? '#f59e0b' : isTransition ? '#64748b' : '#3b82f6';

  const renderBackSlide = () => {
    if (isAct) {
      return (
        <SlideRundownAct
          content={item.originalContent || {}}
          durationStr={item.durationStr}
          color={themeColor}
        />
      );
    }
    if (isJob) return <SlideJob content={item.originalContent || {}} />;
    if (isTransition) return <SlideTransition content={item.originalContent || {}} />;

    // Article Blocks
    const c = item.originalContent || {};
    switch (item.originalBlockType) {
      case 'subheading':
        return <SlideSpikyTitle content={c} />;
      case 'myth_fact':
        return <SlideMythFact content={c} />;
      case 'highlight_card':
        return <SlideStatCard content={c} />;
      case 'pull_quote':
        return <SlideQuote content={c} />;
      case 'media':
        return <SlideMedia content={c} />;
      default:
        return <SlideFallback content={c} type={item.originalBlockType || ''} />;
    }
  };

  // Helper to render block preview snippet
  const renderBlockSnippet = () => {
    const c = item.originalContent || {};
    if (isAct) return null;
    if (isJob) {
      return (
        <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
          {c.orgName ? `${c.orgName} • ` : ''}{c.location || 'Remote'}
        </Typography>
      );
    }
    if (isTransition) return null;

    // Render article block summary
    switch (item.originalBlockType) {
      case 'subheading':
        return <Typography sx={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 700, fontStyle: 'italic' }}>"{c.text || 'Subheading'}"</Typography>;
      case 'myth_fact':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.82rem' }}>
            <Typography sx={{ color: '#ef4444', fontWeight: 700 }}>Myth: <span style={{ fontWeight: 400 }}>{c.myth || '—'}</span></Typography>
            <Typography sx={{ color: '#047857', fontWeight: 700 }}>Ground Truth: <span style={{ fontWeight: 400 }}>{c.fact || '—'}</span></Typography>
          </Box>
        );
      case 'highlight_card':
        return (
          <Typography sx={{ fontSize: '0.9rem', color: '#6d28d9', fontWeight: 800 }}>
            {c.stat || 'Metric'}: <span style={{ fontWeight: 500, color: '#475569' }}>{c.label || ''}</span>
          </Typography>
        );
      case 'pull_quote':
        return <Typography sx={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, fontStyle: 'italic' }}>"{c.quote?.slice(0, 120)}{c.quote?.length > 120 ? '...' : ''}"</Typography>;
      case 'media':
        return <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>Media Asset: {c.caption || c.imageUrl || c.videoUrl || 'Attached'}</Typography>;
      default:
        return c.text ? <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>{c.text.slice(0, 100)}...</Typography> : null;
    }
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 2.5, perspective: '1600px', ...(isDragging ? { opacity: 0.65 } : {}) }}>
      <Box
        sx={{
          position: 'relative',
          transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateX(-180deg)' : 'none',
        }}
      >
        {/* ── FRONT: CONFIG CARD ── */}
        <Box
          sx={{
            backfaceVisibility: 'hidden',
            position: isFlipped ? 'absolute' : 'relative',
            width: '100%',
            top: 0,
            borderRadius: '20px',
            p: { xs: 2, sm: 2.5 },
            bgcolor: '#ffffff',
            border: `1.5px solid ${alpha(themeColor, 0.25)}`,
            borderLeft: `5px solid ${themeColor}`,
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0,0,0,0.02)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            '&:hover': {
              borderColor: alpha(themeColor, 0.5),
              boxShadow: `0 8px 24px rgba(15, 23, 42, 0.08), 0 0 0 1px ${alpha(themeColor, 0.1)}`,
            },
          }}
        >
          <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 } }}>
            {/* Grab Drag Handle */}
            <Box
              {...attributes}
              {...listeners}
              sx={{
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                borderRadius: '8px',
                px: 0.5,
                transition: 'all 0.15s ease',
                '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 22 }} />
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              {/* Header: Source Chip, Act Indicator, Preview Slide & Delete */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {/* Badge */}
                  {isAct && (
                    <Chip
                      size="small"
                      icon={<SparkleIcon sx={{ fontSize: '0.85rem !important' }} />}
                      label={actNumber ? `ACT ${actNumber}` : 'BROADCAST ACT'}
                      sx={{
                        bgcolor: alpha(themeColor, 0.12),
                        color: themeColor,
                        fontWeight: 900,
                        fontSize: '0.74rem',
                        letterSpacing: '0.04em',
                        borderRadius: '8px',
                        px: 0.5,
                      }}
                    />
                  )}
                  {isJob && (
                    <Chip
                      size="small"
                      icon={<WorkIcon sx={{ fontSize: '0.85rem !important' }} />}
                      label="HIRING SPOTLIGHT"
                      sx={{
                        bgcolor: alpha(themeColor, 0.12),
                        color: themeColor,
                        fontWeight: 900,
                        fontSize: '0.74rem',
                        letterSpacing: '0.04em',
                        borderRadius: '8px',
                      }}
                    />
                  )}
                  {isTransition && (
                    <Chip
                      size="small"
                      label="INTERMISSION / CUE"
                      sx={{
                        bgcolor: '#f1f5f9',
                        color: '#475569',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        letterSpacing: '0.04em',
                        borderRadius: '8px',
                      }}
                    />
                  )}
                  {item.sourceType === 'article_block' && (
                    <>
                      <Chip
                        size="small"
                        icon={<BookIcon sx={{ fontSize: '0.85rem !important' }} />}
                        label={item.parentArticleTitle ? `From: ${item.parentArticleTitle}` : 'Article Block'}
                        sx={{
                          bgcolor: alpha(themeColor, 0.1),
                          color: themeColor,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          borderRadius: '8px',
                          maxWidth: 240,
                          '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                        }}
                      />
                      <Chip
                        size="small"
                        label={item.originalBlockType?.replace('_', ' ').toUpperCase() || 'BLOCK'}
                        sx={{
                          bgcolor: '#f8fafc',
                          color: '#64748b',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                        }}
                      />
                    </>
                  )}
                </Box>

                {/* Right Action Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon sx={{ fontSize: '0.95rem !important' }} />}
                    onClick={() => setIsFlipped(true)}
                    sx={{
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      borderRadius: '10px',
                      textTransform: 'none',
                      borderColor: '#cbd5e1',
                      color: '#0f172a',
                      bgcolor: '#ffffff',
                      py: 0.4,
                      px: 1.5,
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                    }}
                  >
                    Preview Slide (16:9)
                  </Button>

                  <Tooltip title="Remove item from rundown">
                    <IconButton
                      size="small"
                      onClick={() => onRemove(item.id)}
                      sx={{
                        color: '#94a3b8',
                        '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Editable Fields based on Type */}
              {isAct && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Act Title & Theme"
                    placeholder="e.g. Act 1: The Open — Anchor Tension & Reframe"
                    value={item.originalContent?.title || item.originalContent?.role || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdate(item.id, {
                        originalContent: {
                          ...(item.originalContent || {}),
                          title: val,
                          role: val,
                        },
                      });
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Key Narrative Beats & Discussion Focus"
                    placeholder="Summarize the core confrontation, evidence, or problem tackled in this act..."
                    value={item.originalContent?.description || item.originalContent?.desc || item.originalContent?.message || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdate(item.id, {
                        originalContent: {
                          ...(item.originalContent || {}),
                          description: val,
                          desc: val,
                          message: val,
                        },
                      });
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '0.86rem',
                        lineHeight: 1.5,
                      },
                    }}
                  />
                </Box>
              )}

              {isTransition && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Transition / Break Name"
                    placeholder="e.g. Q&A Session, Commercial Break, Next Segment"
                    value={item.originalContent?.title || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdate(item.id, {
                        originalContent: {
                          ...(item.originalContent || {}),
                          title: val,
                        },
                      });
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Screen Display Note / Cue"
                    placeholder="e.g. Taking questions from the chat now..."
                    value={item.originalContent?.message || item.originalContent?.text || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdate(item.id, {
                        originalContent: {
                          ...(item.originalContent || {}),
                          message: val,
                          text: val,
                        },
                      });
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.86rem' } }}
                  />
                </Box>
              )}

              {/* Block Snippet for Article Blocks & Jobs */}
              {!isAct && !isTransition && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', mb: 0.5 }}>
                    {isJob ? (item.originalContent?.jobTitle || 'Job Spotlight') : (item.originalBlockType?.replace('_', ' ').toUpperCase() || 'Article Block')}
                  </Typography>
                  {renderBlockSnippet()}
                </Box>
              )}

              {/* Speaker Notes Box (Private talking cues) */}
              <Box
                sx={{
                  bgcolor: '#fefce8',
                  borderRadius: '12px',
                  p: 1.25,
                  border: '1px solid #fef08a',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                }}
              >
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <MicIcon sx={{ fontSize: 15 }} /> Private Host Cues & Speaking Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Private cues: what to say, key questions, prompts for guests (only visible backstage)..."
                  value={item.speakerNotes}
                  onChange={(e) => onUpdate(item.id, { speakerNotes: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: '#ffffff',
                      fontSize: '0.82rem',
                    },
                  }}
                />
              </Box>

              {/* Duration Row: Presets & Custom Duration */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', pt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Duration:
                  </Typography>
                  {DURATION_PRESETS.map((preset) => {
                    const isSelected = item.durationStr === preset || item.durationStr.includes(preset);
                    return (
                      <Chip
                        key={preset}
                        label={preset}
                        size="small"
                        onClick={() => onUpdate(item.id, { durationStr: preset })}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          height: 24,
                          borderRadius: '6px',
                          bgcolor: isSelected ? '#0f172a' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#475569',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            bgcolor: isSelected ? '#0f172a' : '#e2e8f0',
                          },
                        }}
                      />
                    );
                  })}
                </Box>

                <TextField
                  size="small"
                  placeholder="e.g. ~10m"
                  value={item.durationStr}
                  onChange={(e) => onUpdate(item.id, { durationStr: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    width: 130,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      height: 32,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── BACK: 16:9 SLIDE PREVIEW ── */}
        <Box
          sx={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
            position: isFlipped ? 'relative' : 'absolute',
            width: '100%',
            top: 0,
            borderRadius: '20px',
            overflow: 'hidden',
            bgcolor: '#ffffff',
            border: `1.5px solid ${alpha(themeColor, 0.35)}`,
            boxShadow: '0 16px 48px rgba(15, 23, 42, 0.12)',
          }}
        >
          {/* Top Bar for Preview */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
                Broadcast Slide Preview (16:9)
              </Typography>
              <Chip
                label={item.durationStr || '5m'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
              />
            </Box>
            <Button
              size="small"
              variant="contained"
              startIcon={<FlipIcon sx={{ fontSize: '0.85rem !important' }} />}
              onClick={() => setIsFlipped(false)}
              sx={{
                bgcolor: '#ffffff',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.76rem',
                borderRadius: '8px',
                textTransform: 'none',
                py: 0.3,
                px: 1.5,
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
            >
              Flip Back to Edit
            </Button>
          </Box>

          {/* Slide Rendering */}
          <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
            {renderBackSlide()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// --- Main Builder Component ---
export default function LivestreamRundownBuilder({
  postingAs,
  selectedOrgId,
  initialBlocks = [],
  onBlocksChange,
  contentPool,
}: {
  postingAs: string;
  selectedOrgId: string | null;
  initialBlocks?: any[];
  onBlocksChange: (blocks: any[]) => void;
  contentPool: { articles: any[]; jobs: any[] } | null;
}) {
  const [rundown, setRundown] = useState<RundownItem[]>(initialBlocks);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize rundown state when initialBlocks changes externally (e.g. blueprint selection or framework loading)
  useEffect(() => {
    if (initialBlocks) {
      setRundown(initialBlocks);
    }
  }, [initialBlocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRundown((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onBlocksChange(newItems);
        return newItems;
      });
    }
  };

  const addBlockToRundown = (blockData: Partial<RundownItem>) => {
    const newItem: RundownItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceType: blockData.sourceType || 'transition',
      sourceId: blockData.sourceId,
      parentArticleId: blockData.parentArticleId,
      parentArticleTitle: blockData.parentArticleTitle,
      originalBlockType: blockData.originalBlockType,
      originalContent: blockData.originalContent || {},
      speakerNotes: blockData.speakerNotes || '',
      durationStr: blockData.durationStr || '5m',
    };
    const newItems = [...rundown, newItem];
    setRundown(newItems);
    onBlocksChange(newItems);
  };

  const updateItem = (id: string, updates: Partial<RundownItem>) => {
    const newItems = rundown.map((i) => (i.id === id ? { ...i, ...updates } : i));
    setRundown(newItems);
    onBlocksChange(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = rundown.filter((i) => i.id !== id);
    setRundown(newItems);
    onBlocksChange(newItems);
  };

  // Distinct articles referenced
  const distinctArticleIds = useMemo(() => {
    const ids = new Set<string>();
    rundown.forEach((b) => {
      if (b.sourceType === 'article_block' && b.parentArticleId) {
        ids.add(b.parentArticleId);
      }
    });
    return ids;
  }, [rundown]);

  const distinctCount = distinctArticleIds.size;

  // Total runtime estimation
  const totalEstimatedMinutes = useMemo(() => {
    let mins = 0;
    rundown.forEach((b) => {
      const match = (b.durationStr || '').match(/(\d+)/);
      if (match) {
        mins += parseInt(match[1], 10);
      } else {
        mins += 5; // default fallback
      }
    });
    return mins;
  }, [rundown]);

  // Compute act numbers
  let actCounter = 0;
  const itemActNumbers = useMemo(() => {
    const map: Record<string, number> = {};
    let counter = 0;
    rundown.forEach((b) => {
      const isAct = b.sourceType === 'act' || b.originalBlockType === 'rundown_act' || Boolean(b.originalContent?.role);
      if (isAct) {
        counter += 1;
        map[b.id] = counter;
      }
    });
    return map;
  }, [rundown]);

  // Filter content pool articles & jobs
  const filteredArticles = useMemo(() => {
    if (!contentPool?.articles) return [];
    if (!searchQuery.trim()) return contentPool.articles;
    const q = searchQuery.toLowerCase();
    return contentPool.articles.filter((a: any) =>
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.article?.blocks?.some((b: any) => b.blockType?.toLowerCase().includes(q) || b.content?.toLowerCase().includes(q))
    );
  }, [contentPool?.articles, searchQuery]);

  const filteredJobs = useMemo(() => {
    if (!contentPool?.jobs) return [];
    if (!searchQuery.trim()) return contentPool.jobs;
    const q = searchQuery.toLowerCase();
    return contentPool.jobs.filter((j: any) =>
      j.title?.toLowerCase().includes(q) ||
      j.organization?.name?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q)
    );
  }, [contentPool?.jobs, searchQuery]);

  return (
    <Box sx={{ display: 'flex', gap: { xs: 2.5, md: 3.5 }, height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
      
      {/* ── LEFT: Content Pool Sidebar ── */}
      <Box
        sx={{
          width: { xs: '100%', md: '360px', lg: '400px' },
          bgcolor: '#ffffff',
          p: 2.5,
          borderRadius: '24px',
          overflowY: 'auto',
          maxHeight: { xs: '450px', md: 'calc(100vh - 220px)' },
          border: '1.5px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Content Pool
            </Typography>
            <Chip
              label={`${contentPool?.articles?.length || 0} Articles`}
              size="small"
              sx={{ bgcolor: '#f1f5f9', fontWeight: 800, fontSize: '0.72rem', color: '#475569' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.5 }}>
            Pull published blocks & jobs into your presentation to back up your broadcast narrative.
          </Typography>
        </Box>

        {/* Search Field */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search articles or blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              bgcolor: '#f8fafc',
              fontSize: '0.85rem',
            },
          }}
        />

        {!contentPool ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Articles Accordion */}
            <Accordion
              defaultExpanded
              sx={{
                bgcolor: '#f8fafc',
                borderRadius: '16px !important',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', pr: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                    My Articles ({filteredArticles.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1, pt: 0 }}>
                {filteredArticles.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center', fontSize: '0.82rem' }}>
                    {searchQuery ? 'No articles match your search.' : 'No published articles found.'}
                  </Typography>
                ) : (
                  filteredArticles.map((article: any) => {
                    const isReferenced = distinctArticleIds.has(article.id);
                    const blocks = article.article?.blocks || [];

                    return (
                      <Accordion
                        key={article.id}
                        sx={{
                          mb: 1,
                          borderRadius: '12px !important',
                          border: isReferenced ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid #e2e8f0',
                          boxShadow: 'none',
                          bgcolor: isReferenced ? 'rgba(16, 185, 129, 0.03)' : '#ffffff',
                          '&:before': { display: 'none' },
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 46 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, pr: 1 }}>
                            {isReferenced && (
                              <Tooltip title="Referenced in rundown">
                                <Chip
                                  label="✓ In Rundown"
                                  size="small"
                                  sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 900, fontSize: '0.62rem', height: 18 }}
                                />
                              </Tooltip>
                            )}
                            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {article.title}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 1.25, pt: 0, bgcolor: 'transparent' }}>
                          {blocks.length === 0 ? (
                            <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', p: 1 }}>
                              No blocks in this article
                            </Typography>
                          ) : (
                            blocks.map((b: any) => {
                              let parsedContent: any = {};
                              try {
                                parsedContent = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
                              } catch {
                                parsedContent = {};
                              }

                              return (
                                <Box
                                  key={b.id}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.2,
                                    mb: 0.75,
                                    bgcolor: '#ffffff',
                                    borderRadius: '10px',
                                    border: '1px solid #f1f5f9',
                                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                                    '&:hover': { transform: 'translateX(2px)', borderColor: '#cbd5e1' },
                                  }}
                                >
                                  <Box sx={{ minWidth: 0, pr: 1 }}>
                                    <Typography sx={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.04em' }}>
                                      {b.blockType?.replace('_', ' ')}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {parsedContent.text || parsedContent.stat || parsedContent.myth || parsedContent.quote || parsedContent.caption || 'Block item'}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      addBlockToRundown({
                                        sourceType: 'article_block',
                                        sourceId: b.id,
                                        parentArticleId: article.id,
                                        parentArticleTitle: article.title,
                                        originalBlockType: b.blockType,
                                        originalContent: parsedContent,
                                        durationStr: '3m',
                                      })
                                    }
                                    sx={{
                                      bgcolor: 'rgba(59,130,246,0.1)',
                                      color: '#3b82f6',
                                      flexShrink: 0,
                                      '&:hover': { bgcolor: '#3b82f6', color: '#fff' },
                                    }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              );
                            })
                          )}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })
                )}
              </AccordionDetails>
            </Accordion>

            {/* Jobs Accordion */}
            <Accordion
              sx={{
                bgcolor: '#f8fafc',
                borderRadius: '16px !important',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                  My Jobs ({filteredJobs.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1, pt: 0 }}>
                {filteredJobs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center', fontSize: '0.82rem' }}>
                    {searchQuery ? 'No jobs match your search.' : 'No active jobs found.'}
                  </Typography>
                ) : (
                  filteredJobs.map((job: any) => (
                    <Box
                      key={job.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        mb: 1,
                        borderRadius: '10px',
                        bgcolor: '#ffffff',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <Box sx={{ minWidth: 0, pr: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                          {job.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {job.organization?.name || 'Organization'}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() =>
                          addBlockToRundown({
                            sourceType: 'job',
                            sourceId: job.id,
                            originalContent: {
                              jobTitle: job.title,
                              orgName: job.organization?.name,
                              location: job.location,
                              orgLogo: job.organization?.logoUrl,
                            },
                            durationStr: '3m',
                          })
                        }
                        sx={{
                          bgcolor: 'rgba(245, 158, 11, 0.12)',
                          color: '#d97706',
                          flexShrink: 0,
                          '&:hover': { bgcolor: '#f59e0b', color: '#fff' },
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>

      {/* ── RIGHT: Rundown Canvas & Timeline Bar ── */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Executive Broadcast Timeline Bar */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: '20px',
            bgcolor: '#ffffff',
            border: '1.5px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {/* Metrics: Run Time & Articles Reference Check */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: '0.95rem !important' }} />}
              label={`~${totalEstimatedMinutes} mins Total Runtime`}
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                borderRadius: '10px',
                height: 30,
              }}
            />

            <Chip
              label={`${distinctCount}/5 Articles Referenced`}
              sx={{
                bgcolor: distinctCount >= 5 ? '#d1fae5' : '#fef3c7',
                color: distinctCount >= 5 ? '#065f46' : '#b45309',
                fontWeight: 900,
                fontSize: '0.78rem',
                borderRadius: '10px',
                height: 30,
                border: `1.5px solid ${distinctCount >= 5 ? '#10b981' : '#f59e0b'}`,
              }}
            />

            <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
              {rundown.length} total blocks
            </Typography>
          </Box>

          {/* Quick Add Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                const nextActNum = Object.keys(itemActNumbers).length + 1;
                addBlockToRundown({
                  sourceType: 'act',
                  originalBlockType: 'rundown_act',
                  originalContent: {
                    title: `Act ${nextActNum}: Strategic Theme`,
                    role: `Act ${nextActNum}`,
                    description: 'Discussion points and tension reframe...',
                  },
                  durationStr: '15m',
                });
              }}
              sx={{
                bgcolor: '#10b981',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                borderRadius: '12px',
                textTransform: 'none',
                px: 2,
                py: 0.6,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                '&:hover': { bgcolor: '#059669' },
              }}
            >
              + Add Broadcast Act
            </Button>

            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() =>
                addBlockToRundown({
                  sourceType: 'transition',
                  originalContent: { title: 'Q&A / Intermission', message: 'Taking questions from the chat now' },
                  durationStr: '5m',
                })
              }
              sx={{
                borderColor: '#cbd5e1',
                color: '#475569',
                fontWeight: 800,
                fontSize: '0.8rem',
                borderRadius: '12px',
                textTransform: 'none',
                px: 2,
                py: 0.6,
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
              }}
            >
              + Add Transition
            </Button>
          </Box>
        </Box>

        {/* Rundown Sortable Canvas */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 0.5, pb: 4 }}>
          {rundown.length === 0 ? (
            <Box
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: '24px',
                border: '2px dashed #e2e8f0',
                bgcolor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography sx={{ fontSize: '2.5rem' }}>🎙️</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                Your Rundown is Empty
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.92rem', maxWidth: 460 }}>
                Click "+ Add Broadcast Act" above or click "+" on any block from your content pool to begin building your livestream.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  addBlockToRundown({
                    sourceType: 'act',
                    originalBlockType: 'rundown_act',
                    originalContent: {
                      title: 'Act 1: The Open',
                      role: 'Act 1: The Open',
                      description: 'Anchor the core tension and reframe the problem.',
                    },
                    durationStr: '15m',
                  })
                }
                sx={{
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 800,
                  borderRadius: '14px',
                  textTransform: 'none',
                  px: 3,
                  py: 1.1,
                }}
              >
                Create Act 1: The Open
              </Button>
            </Box>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={rundown.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {rundown.map((item, index) => (
                  <SortableRundownCard
                    key={item.id}
                    item={item}
                    index={index}
                    actNumber={itemActNumbers[item.id]}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {/* Bottom Add Buttons for convenience */}
          {rundown.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  const nextActNum = Object.keys(itemActNumbers).length + 1;
                  addBlockToRundown({
                    sourceType: 'act',
                    originalBlockType: 'rundown_act',
                    originalContent: {
                      title: `Act ${nextActNum}: Strategic Theme`,
                      role: `Act ${nextActNum}`,
                      description: 'Discussion points and tension reframe...',
                    },
                    durationStr: '15m',
                  });
                }}
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 1.75,
                  borderRadius: '16px',
                  color: '#059669',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  fontWeight: 800,
                  bgcolor: 'rgba(16, 185, 129, 0.02)',
                  '&:hover': {
                    borderColor: '#10b981',
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    borderWidth: 2,
                  },
                }}
              >
                + Add Broadcast Act
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  addBlockToRundown({
                    sourceType: 'transition',
                    originalContent: { title: 'Q&A / Intermission', message: 'Taking questions from the chat now' },
                    durationStr: '5m',
                  })
                }
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 1.75,
                  borderRadius: '16px',
                  color: '#64748b',
                  borderColor: 'rgba(0,0,0,0.12)',
                  fontWeight: 800,
                  '&:hover': {
                    borderColor: '#0f172a',
                    color: '#0f172a',
                    bgcolor: '#f8fafc',
                    borderWidth: 2,
                  },
                }}
              >
                + Add Transition Note
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
