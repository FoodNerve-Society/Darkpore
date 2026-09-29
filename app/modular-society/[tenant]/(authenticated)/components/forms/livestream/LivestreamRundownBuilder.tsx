'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArticleBlockRenderer } from '@/components/learn/ArticleBlockRenderer';
import { EcosystemJobModal } from '@/components/learn/blocks/EcosystemJobModal';
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
  Dialog,
  DialogContent,
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
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Layers as LayersIcon,
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
            bgcolor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${alpha(themeColor, 0.35)}`,
            boxShadow: `0 8px 24px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px ${alpha(themeColor, 0.08)}`,
            transition: 'border-color 0.2s, box-shadow 0.2s',
            '&:hover': {
              borderColor: alpha(themeColor, 0.6),
              boxShadow: `0 12px 30px rgba(15, 23, 42, 0.08), 0 0 0 1px ${alpha(themeColor, 0.2)}`,
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
  guidingArticles = [],
  guidingJobs = [],
  guidingListings = [],
  guidingCampaigns = [],
  hubColor = '#10b981',
}: {
  postingAs: string;
  selectedOrgId: string | null;
  initialBlocks?: any[];
  onBlocksChange: (blocks: any[]) => void;
  contentPool: { articles: any[]; jobs: any[] } | null;
  guidingArticles?: any[];
  guidingJobs?: any[];
  guidingListings?: any[];
  guidingCampaigns?: any[];
  hubColor?: string;
}) {
  const [rundown, setRundown] = useState<RundownItem[]>(initialBlocks);
  const [previewArticle, setPreviewArticle] = useState<any | null>(null);
  const [previewJob, setPreviewJob] = useState<any | null>(null);
  const [selectedArticleForBlocks, setSelectedArticleForBlocks] = useState<any | null>(null);

  // Synchronize rundown state when initialBlocks changes externally
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

  // Curated Active Articles: only show studio handoff / selected articles (no external additions to avoid flow corruption)
  const activeArticles = useMemo(() => {
    const baseList = (guidingArticles && guidingArticles.length > 0)
      ? guidingArticles
      : (contentPool?.articles || []);

    return baseList.map((art: any) => {
      if (art.article?.blocks?.length || art.blocks?.length) return art;
      const foundInPool = contentPool?.articles?.find((p: any) => p.id === art.id);
      if (foundInPool) return foundInPool;
      return art;
    });
  }, [guidingArticles, contentPool?.articles]);

  // Curated Active Jobs/CTAs: only show studio handoff / selected opportunities
  const activeJobs = useMemo(() => {
    const list: any[] = [];
    if (guidingJobs && guidingJobs.length > 0) list.push(...guidingJobs);
    if (guidingListings && guidingListings.length > 0) list.push(...guidingListings);
    if (guidingCampaigns && guidingCampaigns.length > 0) list.push(...guidingCampaigns);

    if (list.length === 0 && contentPool?.jobs) {
      list.push(...contentPool.jobs);
    }
    return list;
  }, [guidingJobs, guidingListings, guidingCampaigns, contentPool?.jobs]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%' }}>

      {/* ── TOP SECTION: CONTENT POOL SWIMLANES ── */}
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: '24px',
          bgcolor: '#ffffff',
          border: '1.5px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Swimlanes Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                bgcolor: alpha(hubColor, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LayersIcon sx={{ color: hubColor, fontSize: '1.25rem' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Curated Content Pool & Ecosystem Resources
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.84rem' }}>
                Only selected anchor articles and ecosystem CTAs are locked in for this broadcast. Preview and pull modular blocks directly into your flow below.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${activeArticles.length} Anchor Articles`}
              size="small"
              sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.72rem' }}
            />
            <Chip
              label={`${activeJobs.length} Ecosystem CTAs`}
              size="small"
              sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '0.72rem' }}
            />
          </Box>
        </Box>

        {/* ── SWIMLANE 1: ANCHOR ARTICLES ── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookIcon sx={{ fontSize: '1.05rem', color: '#3b82f6' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Swimlane 1: Anchor Articles ({activeArticles.length})
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              {distinctCount} of {activeArticles.length} active in rundown
            </Typography>
          </Box>

          {activeArticles.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', borderRadius: '16px', bgcolor: '#f8fafc', border: '1px dashed #e2e8f0' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                No anchor articles attached to this studio session.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 1,
                pt: 0.5,
                '::-webkit-scrollbar': { height: 6 },
                '::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: 3 },
              }}
            >
              {activeArticles.map((article: any) => {
                const isReferenced = distinctArticleIds.has(article.id);
                const blocks = article.article?.blocks || article.blocks || [];
                const referencedBlocksCount = rundown.filter(
                  (b) => b.sourceType === 'article_block' && b.parentArticleId === article.id
                ).length;

                return (
                  <Box
                    key={article.id}
                    sx={{
                      minWidth: 290,
                      maxWidth: 320,
                      flexShrink: 0,
                      p: 2,
                      borderRadius: '18px',
                      bgcolor: isReferenced ? 'rgba(16, 185, 129, 0.03)' : '#ffffff',
                      border: isReferenced
                        ? '1.5px solid rgba(16, 185, 129, 0.5)'
                        : '1.5px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: isReferenced
                        ? '0 4px 16px rgba(16, 185, 129, 0.08)'
                        : '0 2px 8px rgba(15, 23, 42, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                      },
                    }}
                  >
                    {/* Top Row: Category + Referenced status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Chip
                        label={article.category || 'Article'}
                        size="small"
                        sx={{
                          bgcolor: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          height: 20,
                          textTransform: 'uppercase',
                        }}
                      />
                      {isReferenced ? (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#059669 !important' }} />}
                          label={`✓ In Rundown (${referencedBlocksCount})`}
                          size="small"
                          sx={{
                            bgcolor: '#d1fae5',
                            color: '#065f46',
                            fontWeight: 900,
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      ) : (
                        <Chip
                          label="Available"
                          size="small"
                          sx={{
                            bgcolor: 'transparent',
                            border: '1px solid #e2e8f0',
                            color: '#94a3b8',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      )}
                    </Box>

                    {/* Title & Blocks count */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          color: '#0f172a',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 0.5,
                        }}
                      >
                        {article.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {blocks.length} modular blocks available
                      </Typography>
                    </Box>

                    {/* Actions: Preview & Add Blocks */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon sx={{ fontSize: '0.85rem !important' }} />}
                        onClick={() => setPreviewArticle(article)}
                        sx={{
                          flex: 1,
                          borderRadius: '10px',
                          borderColor: '#cbd5e1',
                          color: '#475569',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          py: 0.4,
                          '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                        }}
                      >
                        Preview
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: '0.85rem !important' }} />}
                        onClick={() => setSelectedArticleForBlocks(article)}
                        sx={{
                          flex: 1,
                          borderRadius: '10px',
                          bgcolor: isReferenced ? '#059669' : '#3b82f6',
                          color: '#ffffff',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.4,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: isReferenced ? '#047857' : '#2563eb' },
                        }}
                      >
                        + Blocks
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* ── SWIMLANE 2: ECOSYSTEM CTAS & OPPORTUNITIES ── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ fontSize: '1.05rem', color: '#f59e0b' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Swimlane 2: Ecosystem CTAs & Opportunities ({activeJobs.length})
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Direct audience conversion for Act 3
            </Typography>
          </Box>

          {activeJobs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', borderRadius: '16px', bgcolor: '#f8fafc', border: '1px dashed #e2e8f0' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                No ecosystem CTAs attached to this studio session.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 1,
                pt: 0.5,
                '::-webkit-scrollbar': { height: 6 },
                '::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: 3 },
              }}
            >
              {activeJobs.map((job: any) => {
                const isJobReferenced = rundown.some(
                  (b) => b.sourceType === 'job' && (b.sourceId === job.id || b.originalContent?.jobTitle === job.title)
                );

                return (
                  <Box
                    key={job.id || Math.random().toString()}
                    sx={{
                      minWidth: 290,
                      maxWidth: 320,
                      flexShrink: 0,
                      p: 2,
                      borderRadius: '18px',
                      bgcolor: isJobReferenced ? 'rgba(245, 158, 11, 0.04)' : '#ffffff',
                      border: isJobReferenced
                        ? '1.5px solid rgba(245, 158, 11, 0.5)'
                        : '1.5px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: isJobReferenced
                        ? '0 4px 16px rgba(245, 158, 11, 0.08)'
                        : '0 2px 8px rgba(15, 23, 42, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                      },
                    }}
                  >
                    {/* Top Row: Org info + In Rundown status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                        {job.organization?.logoUrl ? (
                          <Avatar src={job.organization.logoUrl} sx={{ width: 18, height: 18 }} />
                        ) : (
                          <WorkIcon sx={{ fontSize: '0.9rem', color: '#f59e0b' }} />
                        )}
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.organization?.name || job.orgName || 'Ecosystem Partner'}
                        </Typography>
                      </Box>

                      {isJobReferenced ? (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#d97706 !important' }} />}
                          label="✓ Climax CTA"
                          size="small"
                          sx={{
                            bgcolor: '#fef3c7',
                            color: '#b45309',
                            fontWeight: 900,
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      ) : (
                        <Chip
                          label="Available"
                          size="small"
                          sx={{
                            bgcolor: 'transparent',
                            border: '1px solid #e2e8f0',
                            color: '#94a3b8',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      )}
                    </Box>

                    {/* Title & Target / Compensation */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          color: '#0f172a',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 0.5,
                        }}
                      >
                        {job.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 700 }}>
                        {job.compensationOrTarget || job.salary || job.budget || job.location || 'Ecosystem Role'}
                      </Typography>
                    </Box>

                    {/* Actions: Preview & Add Climax */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon sx={{ fontSize: '0.85rem !important' }} />}
                        onClick={() => setPreviewJob(job)}
                        sx={{
                          flex: 1,
                          borderRadius: '10px',
                          borderColor: '#cbd5e1',
                          color: '#475569',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          py: 0.4,
                          '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                        }}
                      >
                        Preview
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: '0.85rem !important' }} />}
                        onClick={() =>
                          addBlockToRundown({
                            sourceType: 'job',
                            sourceId: job.id,
                            originalContent: {
                              jobTitle: job.title,
                              orgName: job.organization?.name || job.orgName,
                              location: job.location,
                              orgLogo: job.organization?.logoUrl || job.orgLogo,
                              compensationOrTarget: job.compensationOrTarget || job.salary,
                            },
                            durationStr: '5m',
                          })
                        }
                        sx={{
                          flex: 1,
                          borderRadius: '10px',
                          bgcolor: isJobReferenced ? '#d97706' : '#f59e0b',
                          color: '#ffffff',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.4,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#d97706' },
                        }}
                      >
                        + Add Climax
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── BOTTOM SECTION: RUNDOWN CANVAS & TIMELINE BAR ── */}
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        
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
              {rundown.length} total blocks in broadcast
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
        <Box sx={{ width: '100%', px: 0.5, pb: 4 }}>
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
              <Typography sx={{ color: '#64748b', fontSize: '0.92rem', maxWidth: 480 }}>
                Click &ldquo;+ Add Broadcast Act&rdquo; above or click &ldquo;+ Blocks&rdquo; on any article in your content pool above to build your broadcast narrative.
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

      {/* ── Article Preview Modal ── */}
      <Dialog
        open={Boolean(previewArticle)}
        onClose={() => setPreviewArticle(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: '#ffffff',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 24px 64px rgba(15, 23, 42, 0.15)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {previewArticle && (
          <>
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#f8fafc',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Chip
                  label={previewArticle.category || 'Article'}
                  size="small"
                  sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {previewArticle.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setPreviewArticle(null)} size="small" sx={{ color: '#64748b' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <DialogContent sx={{ p: 3.5, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {previewArticle.description && (
                <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1.5px solid rgba(59, 130, 246, 0.15)' }}>
                  <Typography sx={{ fontSize: '0.88rem', color: '#1e40af', lineHeight: 1.6 }}>
                    {previewArticle.description}
                  </Typography>
                </Box>
              )}

              {/* Render Blocks using ArticleBlockRenderer */}
              {(() => {
                const blocks = previewArticle.article?.blocks || previewArticle.blocks || [];
                if (blocks.length === 0) {
                  return (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        No formatted blocks in this article. You can still add the article summary as a discussion point.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          addBlockToRundown({
                            sourceType: 'article_block',
                            parentArticleId: previewArticle.id,
                            parentArticleTitle: previewArticle.title,
                            originalBlockType: 'subheading',
                            originalContent: {
                              title: previewArticle.title,
                              spikyTitle: previewArticle.title,
                              description: previewArticle.description,
                            },
                            durationStr: '5m',
                          });
                          setPreviewArticle(null);
                        }}
                        sx={{ mt: 2, bgcolor: '#3b82f6', borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
                      >
                        + Add Article Overview to Rundown
                      </Button>
                    </Box>
                  );
                }

                return blocks.map((b: any, bIdx: number) => {
                  let parsed: any = {};
                  try {
                    parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
                  } catch {
                    parsed = {};
                  }

                  return (
                    <Box
                      key={b.id || bIdx}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        border: '1.5px solid rgba(226, 232, 240, 0.8)',
                        bgcolor: '#ffffff',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: '#cbd5e1', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Chip
                          label={b.blockType?.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: '0.65rem' }}
                        />
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon sx={{ fontSize: '0.85rem !important' }} />}
                          onClick={() => {
                            addBlockToRundown({
                              sourceType: 'article_block',
                              sourceId: b.id,
                              parentArticleId: previewArticle.id,
                              parentArticleTitle: previewArticle.title,
                              originalBlockType: b.blockType,
                              originalContent: parsed,
                              durationStr: '3m',
                            });
                          }}
                          sx={{
                            borderRadius: '10px',
                            bgcolor: '#3b82f6',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.74rem',
                            textTransform: 'none',
                            py: 0.3,
                            px: 1.5,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#2563eb' },
                          }}
                        >
                          + Add Block to Rundown
                        </Button>
                      </Box>

                      <ArticleBlockRenderer
                        block={{
                          id: b.id || String(bIdx),
                          blockType: b.blockType,
                          content: b.content,
                        }}
                        accentColor="#3b82f6"
                      />
                    </Box>
                  );
                });
              })()}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ── Block Selection Dialog ── */}
      <Dialog
        open={Boolean(selectedArticleForBlocks)}
        onClose={() => setSelectedArticleForBlocks(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: '#ffffff',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 24px 64px rgba(15, 23, 42, 0.15)',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {selectedArticleForBlocks && (
          <>
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#f8fafc',
              }}
            >
              <Box sx={{ minWidth: 0, pr: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                  Select Blocks to Add
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedArticleForBlocks.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedArticleForBlocks(null)} size="small" sx={{ color: '#64748b' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
              {(() => {
                const blocks = selectedArticleForBlocks.article?.blocks || selectedArticleForBlocks.blocks || [];
                if (blocks.length === 0) {
                  return (
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                      <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mb: 2 }}>
                        This article does not have pre-extracted blocks. Add the main summary into the rundown:
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          addBlockToRundown({
                            sourceType: 'article_block',
                            parentArticleId: selectedArticleForBlocks.id,
                            parentArticleTitle: selectedArticleForBlocks.title,
                            originalBlockType: 'subheading',
                            originalContent: {
                              title: selectedArticleForBlocks.title,
                              description: selectedArticleForBlocks.description,
                            },
                            durationStr: '5m',
                          });
                          setSelectedArticleForBlocks(null);
                        }}
                        sx={{ bgcolor: '#3b82f6', borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
                      >
                        + Add Article Summary
                      </Button>
                    </Box>
                  );
                }

                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          blocks.forEach((b: any) => {
                            let parsed: any = {};
                            try {
                              parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
                            } catch {
                              parsed = {};
                            }
                            addBlockToRundown({
                              sourceType: 'article_block',
                              sourceId: b.id,
                              parentArticleId: selectedArticleForBlocks.id,
                              parentArticleTitle: selectedArticleForBlocks.title,
                              originalBlockType: b.blockType,
                              originalContent: parsed,
                              durationStr: '3m',
                            });
                          });
                          setSelectedArticleForBlocks(null);
                        }}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          color: '#059669',
                          borderColor: 'rgba(16, 185, 129, 0.4)',
                          bgcolor: 'rgba(16, 185, 129, 0.04)',
                        }}
                      >
                        + Add All {blocks.length} Blocks
                      </Button>
                    </Box>

                    {blocks.map((b: any) => {
                      let parsed: any = {};
                      try {
                        parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
                      } catch {
                        parsed = {};
                      }

                      const snippet = parsed.text || parsed.stat || parsed.myth || parsed.quote || parsed.title || parsed.caption || parsed.takeaways?.[0] || 'Block content';

                      return (
                        <Box
                          key={b.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            p: 1.5,
                            borderRadius: '12px',
                            border: '1.5px solid #e2e8f0',
                            bgcolor: '#f8fafc',
                            transition: 'all 0.15s ease',
                            '&:hover': { bgcolor: '#ffffff', borderColor: '#cbd5e1' },
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {b.blockType?.replace('_', ' ')}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {String(snippet).substring(0, 70)}
                            </Typography>
                          </Box>

                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<AddIcon sx={{ fontSize: '0.85rem !important' }} />}
                            onClick={() => {
                              addBlockToRundown({
                                sourceType: 'article_block',
                                sourceId: b.id,
                                parentArticleId: selectedArticleForBlocks.id,
                                parentArticleTitle: selectedArticleForBlocks.title,
                                originalBlockType: b.blockType,
                                originalContent: parsed,
                                durationStr: '3m',
                              });
                            }}
                            sx={{
                              flexShrink: 0,
                              borderRadius: '8px',
                              bgcolor: '#3b82f6',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              textTransform: 'none',
                              py: 0.3,
                              px: 1.25,
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#2563eb' },
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })()}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ── Ecosystem Job Preview Modal ── */}
      <EcosystemJobModal
        open={Boolean(previewJob)}
        onClose={() => setPreviewJob(null)}
        jobId={previewJob?.id}
        initialJobData={previewJob ? {
          title: previewJob.title || previewJob.name || 'Ecosystem Opportunity',
          organization: previewJob.organization?.name || previewJob.orgName,
          organizationLogo: previewJob.organization?.logoUrl || previewJob.orgLogo,
          location: previewJob.location,
          compensationOrTarget: previewJob.compensationOrTarget || previewJob.salary || previewJob.target || previewJob.budget,
          ctaText: previewJob.ctaText || 'Apply / Learn More',
          ctaLink: previewJob.ctaLink || previewJob.applyUrl || previewJob.link,
          embedType: previewJob.category || 'job',
        } : undefined}
        accentColor="#f59e0b"
        themeMode="light"
      />
    </Box>
  );
}
