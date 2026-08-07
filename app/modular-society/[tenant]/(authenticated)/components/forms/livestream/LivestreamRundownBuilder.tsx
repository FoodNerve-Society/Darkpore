'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, IconButton, Avatar, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Add as AddIcon, ExpandMore as ExpandMoreIcon, DragIndicator as DragIndicatorIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { alpha } from '@mui/system';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchLivestreamContentPool } from '@/lib/actions/learn';
import { SlideSpikyTitle, SlideMythFact, SlideStatCard, SlideJob, SlideTransition, SlideQuote, SlideMedia, SlideFallback, SlideWrapper } from './SlideComponents';

// --- Types ---
type PoolArticle = any;
type PoolJob = any;

type RundownItem = {
  id: string; // unique instance id for the rundown
  sourceType: 'article_block' | 'job' | 'transition';
  sourceId?: string;
  parentArticleId?: string;
  parentArticleTitle?: string;
  originalBlockType?: string;
  originalContent?: any;
  speakerNotes: string;
  durationStr: string;
};

// --- Sortable Item Wrapper ---
function SortableRundownCard({ item, index, onUpdate, onRemove }: { item: RundownItem, index: number, onUpdate: (id: string, updates: Partial<RundownItem>) => void, onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [isFlipped, setIsFlipped] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  const renderBackSlide = () => {
    if (item.sourceType === 'job') return <SlideJob content={item.originalContent || {}} />;
    if (item.sourceType === 'transition') return <SlideTransition content={item.originalContent || {}} />;
    
    // Article Blocks
    const c = item.originalContent || {};
    switch (item.originalBlockType) {
      case 'subheading': return <SlideSpikyTitle content={c} />;
      case 'myth_fact': return <SlideMythFact content={c} />;
      case 'highlight_card': return <SlideStatCard content={c} />;
      case 'pull_quote': return <SlideQuote content={c} />;
      case 'media': return <SlideMedia content={c} />;
      default: return <SlideFallback content={c} type={item.originalBlockType || ''} />;
    }
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 2, perspective: '1600px', ...(isDragging ? { opacity: 0.8 } : {}) }}>
      <Box sx={{
        position: 'relative',
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateX(-180deg)' : 'none',
      }}>
        {/* FRONT - Config */}
        <Box sx={{
          backfaceVisibility: 'hidden',
          position: isFlipped ? 'absolute' : 'relative',
          width: '100%', top: 0,
          borderRadius: 4, p: 2,
          bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
              <DragIndicatorIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Chip size="small" label={item.sourceType === 'job' ? 'Job Listing' : item.sourceType === 'transition' ? 'Transition' : `From: ${item.parentArticleTitle}`} sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                <Button size="small" variant="contained" onClick={() => setIsFlipped(true)}>Preview Slide</Button>
              </Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                {item.sourceType === 'transition' ? 'Transition Note' : item.originalBlockType?.replace('_', ' ').toUpperCase() || 'Block'}
              </Typography>
              <TextField
                fullWidth multiline rows={2}
                placeholder="Speaker notes (private)..."
                value={item.speakerNotes}
                onChange={(e) => onUpdate(item.id, { speakerNotes: e.target.value })}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                  size="small"
                  placeholder="Duration (e.g. ~2m)"
                  value={item.durationStr}
                  onChange={(e) => onUpdate(item.id, { durationStr: e.target.value })}
                  sx={{ width: 150 }}
                />
                <Button color="error" onClick={() => onRemove(item.id)}>Remove</Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* BACK - Preview */}
        <Box sx={{
          backfaceVisibility: 'hidden',
          transform: 'rotateX(180deg)',
          position: isFlipped ? 'relative' : 'absolute',
          width: '100%', top: 0,
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.1)',
        }}>
          <Box sx={{ p: 1, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', ml: 1 }}>Slide Preview</Typography>
            <Button size="small" onClick={() => setIsFlipped(false)}>Back to Config</Button>
          </Box>
          <Box sx={{ p: 1 }}>
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
  contentPool
}: { 
  postingAs: string, 
  selectedOrgId: string | null,
  initialBlocks?: any[],
  onBlocksChange: (blocks: any[]) => void,
  contentPool: { articles: any[], jobs: any[] } | null
}) {
  const [rundown, setRundown] = useState<RundownItem[]>(initialBlocks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRundown((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onBlocksChange(newItems);
        return newItems;
      });
    }
  };

  const addBlockToRundown = (blockData: Partial<RundownItem>) => {
    const newItem: RundownItem = {
      id: Math.random().toString(36).substring(2, 9),
      sourceType: blockData.sourceType || 'transition',
      sourceId: blockData.sourceId,
      parentArticleId: blockData.parentArticleId,
      parentArticleTitle: blockData.parentArticleTitle,
      originalBlockType: blockData.originalBlockType,
      originalContent: blockData.originalContent || {},
      speakerNotes: '',
      durationStr: ''
    };
    const newItems = [...rundown, newItem];
    setRundown(newItems);
    onBlocksChange(newItems);
  };

  const updateItem = (id: string, updates: Partial<RundownItem>) => {
    const newItems = rundown.map(i => i.id === id ? { ...i, ...updates } : i);
    setRundown(newItems);
    onBlocksChange(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = rundown.filter(i => i.id !== id);
    setRundown(newItems);
    onBlocksChange(newItems);
  };

  return (
    <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* LEFT: Content Pool */}
      <Box sx={{ 
        width: { xs: '100%', md: '35%' }, 
        bgcolor: '#fff', p: 3, borderRadius: '24px', 
        overflowY: 'auto', 
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>Content Pool</Typography>
        <Typography variant="body2" sx={{ mb: 3, color: '#64748b', lineHeight: 1.5 }}>
          Click '+' to add blocks from your published articles and jobs to your rundown.
        </Typography>
        
        {!contentPool ? <CircularProgress /> : (
          <>
            <Accordion sx={{ mb: 2, bgcolor: '#f8fafc', borderRadius: '12px !important', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700, color: '#334155' }}>My Articles ({contentPool.articles.length})</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {contentPool.articles.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No articles found.</Typography>
                ) : (
                  contentPool.articles.map(article => (
                    <Accordion key={article.id} sx={{ mb: 1, borderTop: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none', bgcolor: 'transparent' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 48 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{article.title}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.5)' }}>
                        {article.article?.blocks?.map((b: any) => (
                          <Box key={b.id} sx={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            p: 1.5, mb: 1, bgcolor: '#fff', borderRadius: '8px', 
                            border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            transition: 'transform 0.2s', '&:hover': { transform: 'translateX(2px)' }
                          }}>
                            <Box>
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                                {b.blockType.replace('_', ' ')}
                              </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => addBlockToRundown({
                              sourceType: 'article_block',
                              sourceId: b.id,
                              parentArticleId: article.id,
                              parentArticleTitle: article.title,
                              originalBlockType: b.blockType,
                              originalContent: JSON.parse(b.content || '{}')
                            })} sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#3b82f6', '&:hover': { bgcolor: '#3b82f6', color: '#fff' } }}>
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, bgcolor: '#f8fafc', borderRadius: '12px !important', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700, color: '#334155' }}>My Jobs ({contentPool.jobs.length})</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {contentPool.jobs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No jobs found.</Typography>
                ) : (
                  contentPool.jobs.map(job => (
                    <Box key={job.id} sx={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      p: 2, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: 'transparent'
                    }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{job.title}</Typography>
                      <IconButton size="small" onClick={() => addBlockToRundown({
                        sourceType: 'job',
                        sourceId: job.id,
                        originalContent: { jobTitle: job.title, orgName: job.organization?.name, location: job.location, orgLogo: job.organization?.logoUrl }
                      })} sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#3b82f6', '&:hover': { bgcolor: '#3b82f6', color: '#fff' } }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))
                )}
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Box>

      {/* RIGHT: Rundown Canvas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 4 }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rundown.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {rundown.map((item, index) => (
                <SortableRundownCard key={item.id} item={item} index={index} onUpdate={updateItem} onRemove={removeItem} />
              ))}
            </SortableContext>
          </DndContext>
          
          <Button 
            fullWidth variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={() => addBlockToRundown({ sourceType: 'transition', originalContent: { title: 'Transition', message: 'New transition note' } })}
            sx={{ 
              mt: 2, borderStyle: 'dashed', borderWidth: 2, py: 2.5, borderRadius: '16px',
              color: '#64748b', borderColor: 'rgba(0,0,0,0.1)', fontWeight: 700,
              '&:hover': { borderColor: '#3b82f6', color: '#3b82f6', bgcolor: 'rgba(59,130,246,0.02)' }
            }}
          >
            Add Transition Note
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
