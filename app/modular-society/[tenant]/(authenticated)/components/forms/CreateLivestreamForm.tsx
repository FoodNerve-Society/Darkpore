'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Chip, IconButton, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Article as ArticleIcon, AutoAwesome as SparkleIcon, Check as CheckIcon, Info as InfoIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { fetchLivestreamContentPool, createLearnContent } from '@/lib/actions/learn';
import LivestreamRundownBuilder from './livestream/LivestreamRundownBuilder';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { alpha } from '@mui/system';

const ERA_CONFIG: Record<string, any> = {
  past: { label: 'Past', color: '#6366f1', emoji: '📜' },
  present: { label: 'Present', color: '#10b981', emoji: '⚡' },
  future: { label: 'Future', color: '#f59e0b', emoji: '🚀' },
};

const LIVESTREAM_FRAMEWORKS: Record<string, any[]> = {
  past: [
    { type: 'transition', role: 'Intro: Historical Context', desc: 'Set the stage by discussing the history of the disconnect.' },
    { type: 'transition', role: 'Deep Dive: Case Studies', desc: 'Review articles covering past events and jobs that were relevant.' },
    { type: 'transition', role: 'Lessons Learned', desc: 'Summarize the key takeaways from historical analysis.' }
  ],
  present: [
    { type: 'transition', role: 'Intro: The Current Disconnect', desc: 'Highlight the immediate problems happening right now.' },
    { type: 'transition', role: 'Deep Dive: Current Landscape', desc: 'Discuss recent articles and active job postings.' },
    { type: 'transition', role: 'Call to Action', desc: 'What viewers need to do today.' }
  ],
  future: [
    { type: 'transition', role: 'Intro: The Coming Shift', desc: 'Cast a vision for where the industry is heading.' },
    { type: 'transition', role: 'Deep Dive: Future Opportunities', desc: 'Review forward-looking articles and future-proof roles.' },
    { type: 'transition', role: 'Q&A / Next Steps', desc: 'Open the floor for questions on how to prepare.' }
  ]
};

export default function CreateLivestreamForm({ 
  onSuccess, 
  onCancel,
  postingAs = 'personal',
  selectedOrgId = null,
  draftId = null,
  initialTaxonomy = null,
  initialDraftData = null
}: any) {
  const router = useRouter();
  const { profile } = useSociety();
  const { uploadFile, uploading } = useStorageUpload();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentPool, setContentPool] = useState<{ articles: any[], jobs: any[] } | null>(null);

  // Form State
  const [title, setTitle] = useState(initialDraftData?.title || '');
  const [description, setDescription] = useState(initialDraftData?.description || '');
  const [coverImage, setCoverImage] = useState<File | string | null>(initialDraftData?.coverImageUrl || null);
  const [streamUrl, setStreamUrl] = useState(initialDraftData?.livestream?.streamUrl || '');
  const [eventDate, setEventDate] = useState(initialDraftData?.livestream?.eventDate ? new Date(initialDraftData.livestream.eventDate).toISOString().slice(0,16) : '');
  
  // Taxonomy State
  const [category, setCategory] = useState(initialTaxonomy?.category || 'technology');
  const [subcategory, setSubcategory] = useState(initialTaxonomy?.subcategory || '');
  const [timeframe, setTimeframe] = useState(initialTaxonomy?.timeframe || 'present');

  // Rundown Blocks
  const [rundownBlocks, setRundownBlocks] = useState<any[]>(
    initialDraftData?.livestream?.blocks?.map((b: any) => ({
      id: b.id || Math.random().toString(),
      sourceType: b.blockType === 'transition' ? 'transition' : (b.content?.includes('jobTitle') ? 'job' : 'article_block'),
      sourceId: b.sourceId,
      originalBlockType: b.blockType,
      originalContent: typeof b.content === 'string' ? JSON.parse(b.content) : b.content,
      speakerNotes: b.speakerNotes || '',
      durationStr: b.durationStr || ''
    })) || []
  );

  const [frameworkLoaded, setFrameworkLoaded] = useState(rundownBlocks.length > 0);

  useEffect(() => {
    if (profile?.uid) {
      fetchLivestreamContentPool(profile.uid, postingAs === 'organization' ? selectedOrgId : null)
        .then(data => setContentPool(data))
        .catch(err => console.error(err));
    }
  }, [profile?.uid, postingAs, selectedOrgId]);

  // Handle distinct article calculation
  const getDistinctArticleCount = () => {
    const articleIds = new Set();
    rundownBlocks.forEach(b => {
      if (b.sourceType === 'article_block' && b.parentArticleId) {
        articleIds.add(b.parentArticleId);
      }
    });
    return articleIds.size;
  };
  const distinctArticles = getDistinctArticleCount();
  const canPublish = distinctArticles >= 5 && title && description && category && streamUrl && eventDate;

  // Action Items Checklist
  const actionItems = useMemo(() => {
    const items = [];
    if (!streamUrl) items.push('Configure Stream URL');
    if (!eventDate) items.push('Set Event Date & Time');
    if (!title) items.push('Add Livestream Title');
    if (!coverImage) items.push('Upload Cover Image');
    
    if (step === 2) {
      if (distinctArticles < 5) {
        items.push(`Reference at least 5 articles (${distinctArticles}/5)`);
      }
    }
    return items;
  }, [streamUrl, eventDate, title, coverImage, distinctArticles, step]);

  const [isActionItemsMinimized, setIsActionItemsMinimized] = useState(false);

  const handleSave = async (isPublish: boolean) => {
    if (!profile?.uid) return;
    setIsSubmitting(true);
    try {
      let finalCoverUrl = typeof coverImage === 'string' ? coverImage : '';
      if (coverImage instanceof File) {
        const res = await uploadFile(coverImage);
        finalCoverUrl = res;
      }

      // Format blocks for the backend
      const formattedBlocks = rundownBlocks.map((b, index) => ({
        blockType: b.sourceType === 'transition' ? 'transition' : b.originalBlockType || b.sourceType,
        orderIndex: index,
        content: JSON.stringify(b.originalContent || {}),
        speakerNotes: b.speakerNotes,
        durationStr: b.durationStr,
        sourceId: b.sourceId, // Keep reference to original source
      }));

      const payload = {
        title,
        description,
        type: 'livestream' as const,
        authorId: profile.uid,
        organizationId: postingAs === 'organization' ? selectedOrgId : undefined,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        coverImageUrl: finalCoverUrl,
        taxonomy: { category, subcategory, timeframe },
        livestream: {
          streamUrl,
          eventDate: new Date(eventDate),
          status: 'scheduled',
          blocks: formattedBlocks
        }
      };

      await createLearnContent(payload, !isPublish);
      alert(isPublish ? 'Livestream Scheduled!' : 'Draft Saved!');
      onSuccess();
    } catch (e: any) {
      alert(e.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyFramework = () => {
    const framework = LIVESTREAM_FRAMEWORKS[timeframe] || LIVESTREAM_FRAMEWORKS.present;
    const initialPlaceholders = framework.map((f: any) => ({
      id: Math.random().toString(),
      sourceType: 'transition',
      originalBlockType: 'transition',
      originalContent: { 
        title: f.role, 
        message: f.desc 
      },
      speakerNotes: '',
      durationStr: '5 min'
    }));
    
    setRundownBlocks(initialPlaceholders);
    setFrameworkLoaded(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* Floating Action Items Panel */}
      <Box sx={{ 
        position: 'absolute', top: 24, right: 24, zIndex: 10, width: isActionItemsMinimized ? 'auto' : 320,
        bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
        borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        overflow: 'hidden'
      }}>
        <Box 
          onClick={() => setIsActionItemsMinimized(!isActionItemsMinimized)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ position: 'relative' }}>
              <CheckCircleIcon sx={{ color: actionItems.length === 0 ? '#10b981' : '#f59e0b', fontSize: 20 }} />
              {actionItems.length > 0 && (
                <Box sx={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, bgcolor: '#ef4444', borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>{actionItems.length}</Typography>
                </Box>
              )}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>Action Items</Typography>
          </Box>
        </Box>
        
        {!isActionItemsMinimized && (
          <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {actionItems.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>All requirements met!</Typography>
              </Box>
            ) : (
              actionItems.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, bgcolor: 'rgba(245,158,11,0.05)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.1)' }}>
                  <InfoIcon sx={{ color: '#f59e0b', fontSize: 16, mt: 0.2 }} />
                  <Typography sx={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 500 }}>{item}</Typography>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>

      {/* Main Form Scroll Container */}
      <Box ref={scrollContainerRef} sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: { xs: 15, md: 20 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        
        {/* Context Header */}
        <Box sx={{
          display: 'inline-flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2,
          mb: 1, p: '12px 16px', borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.03) 0%, rgba(15, 23, 42, 0.08) 100%)',
          border: '1px solid rgba(15, 23, 42, 0.05)',
          backdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.02)',
          width: 'fit-content'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexWrap: 'wrap' }}>
            <Box 
              onClick={() => onCancel?.()} 
              sx={{ 
                display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75, borderRadius: '10px',
                cursor: 'pointer', transition: 'all 0.2s ease', color: '#0f172a', bgcolor: 'rgba(255,255,255,0.7)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)', transform: 'translateY(-1px)' }
              }}
            >
              <ArticleIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>Studio</Typography>
            </Box>
            <Typography sx={{ color: 'rgba(15, 23, 42, 0.3)', fontWeight: 400 }}>/</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, borderRadius: '6px', color: '#0f172a' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Livestream</Typography>
            </Box>
            <Typography sx={{ color: 'rgba(15, 23, 42, 0.3)', fontWeight: 400 }}>/</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, borderRadius: '6px', bgcolor: 'rgba(15, 23, 42, 0.04)', border: '1px solid rgba(15, 23, 42, 0.05)', color: '#0f172a' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{category || 'Category'}</Typography>
            </Box>
          </Box>
        </Box>

        {step === 1 && (
          <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Livestream Details
            </Typography>
            <Typography sx={{ color: '#475569', mb: 4, fontWeight: 500, fontSize: '1.05rem' }}>
              Define the core metadata for your livestream before building the rundown.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#fff', p: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 12px 40px rgba(0,0,0,0.03)' }}>
              <TextField fullWidth label="Livestream Title" value={title} onChange={e => setTitle(e.target.value)} />
              <TextField fullWidth multiline rows={4} label="Description / Overview" value={description} onChange={e => setDescription(e.target.value)} />
              
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField fullWidth type="url" label="Stream URL (e.g. YouTube Live, Meet)" value={streamUrl} onChange={e => setStreamUrl(e.target.value)} />
                <TextField fullWidth type="datetime-local" label="Event Date & Time" value={eventDate} onChange={e => setEventDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, mt: 2, mb: 1, color: '#0f172a' }}>Taxonomy</Typography>
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
                    <MenuItem value="technology">Technology</MenuItem>
                    <MenuItem value="agriculture">Agriculture</MenuItem>
                    <MenuItem value="finance">Finance</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Timeframe</InputLabel>
                  <Select value={timeframe} label="Timeframe" onChange={e => setTimeframe(e.target.value)}>
                    <MenuItem value="past">Past</MenuItem>
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="future">Future</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
            
            {/* FRAMEWORK EMPTY STATE */}
            {!frameworkLoaded && (
              <Box sx={{ mb: 4, mt: 8 }}>
                {(() => {
                  const era = ERA_CONFIG[timeframe] || ERA_CONFIG.present;
                  const framework = LIVESTREAM_FRAMEWORKS[timeframe] || LIVESTREAM_FRAMEWORKS.present;
                  return (
                    <Box>
                      <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography sx={{ fontSize: 48, mb: 1.5, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>{era.emoji}</Typography>
                        <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: '#0f172a', mb: 1.5, letterSpacing: '-0.02em' }}>
                          {era.label} Livestream Framework
                        </Typography>
                        <Typography sx={{ color: '#475569', fontSize: '1.05rem', maxWidth: 540, mx: 'auto', lineHeight: 1.7, fontWeight: 500 }}>
                          This framework defines the optimal presentation flow for a <strong style={{ color: era.color }}>{timeframe}</strong> focused broadcast. Load it to pre-fill your rundown canvas.
                        </Typography>
                      </Box>

                      <Box sx={{ position: 'relative', pl: { xs: 3, md: 5 }, maxWidth: 800, mx: 'auto' }}>
                        <Box sx={{
                          position: 'absolute', left: { xs: 12, md: 20 }, top: 12, bottom: 12,
                          width: 3, background: `linear-gradient(180deg, ${era.color} 0%, ${alpha(era.color, 0.1)} 100%)`,
                          borderRadius: 2,
                        }} />

                        {framework.map((f, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5, position: 'relative' }}>
                            <Box sx={{
                              position: 'absolute', left: { xs: -21.5, md: -33.5 },
                              width: 24, height: 24, borderRadius: '50%',
                              bgcolor: '#fff', border: `3px solid ${era.color}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              mt: 1.5, zIndex: 2, boxShadow: `0 2px 8px ${alpha(era.color, 0.3)}`
                            }}>
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#0f172a' }}>{idx + 1}</Typography>
                            </Box>
                            <Box sx={{
                              flex: 1, p: 2.5, borderRadius: '16px',
                              border: `1px solid rgba(0,0,0,0.08)`,
                              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)`,
                              backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                              opacity: 0.9,
                              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              '&:hover': { opacity: 1, transform: 'translateX(4px)', borderColor: alpha(era.color, 0.3), boxShadow: `0 8px 24px rgba(0,0,0,0.06)` },
                            }}>
                              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.01em', mb: 0.5 }}>{f.role}</Typography>
                              <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 500 }}>{f.desc}</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <Button
                          variant="contained"
                          onClick={applyFramework}
                          startIcon={<SparkleIcon />}
                          sx={{
                            bgcolor: era.color, color: '#fff', fontWeight: 800, px: 6, py: 2, borderRadius: '20px',
                            fontSize: '1.1rem', letterSpacing: '0.02em',
                            boxShadow: `0 8px 24px ${alpha(era.color, 0.4)}`,
                            '&:hover': { bgcolor: alpha(era.color, 0.9), transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${alpha(era.color, 0.5)}` },
                            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                          }}
                        >
                          Load Recommended Framework
                        </Button>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
            )}

            {/* EDITABLE BUILDER STATE */}
            {frameworkLoaded && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Livestream Rundown
                  </Typography>
                  <Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '1.05rem' }}>
                    Drag your published articles and jobs into the canvas to build your presentation.
                  </Typography>
                </Box>
                <LivestreamRundownBuilder 
                  postingAs={postingAs}
                  selectedOrgId={selectedOrgId}
                  contentPool={contentPool}
                  initialBlocks={rundownBlocks}
                  onBlocksChange={setRundownBlocks}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* FIXED BOTTOM ACTION BAR */}
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        p: { xs: 2, md: 3 }, px: { md: 4 },
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.03)'
      }}>
        {/* Left Side: Navigation & Progress */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => {
              if (step === 2) setStep(1);
              else onCancel?.();
            }}
            sx={{ color: '#475569', fontWeight: 700, borderRadius: '12px', px: 2 }}
          >
            {step === 2 ? 'Back to Details' : 'Cancel'}
          </Button>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {[1, 2].map((s) => (
              <Box key={s} sx={{
                width: s === step ? 32 : 12, height: 4, borderRadius: 2,
                bgcolor: s === step ? '#3b82f6' : (s < step ? '#10b981' : 'rgba(0,0,0,0.1)'),
                transition: 'all 0.3s ease'
              }} />
            ))}
          </Box>
        </Box>

        {/* Right Side: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => handleSave(false)} 
            disabled={isSubmitting}
            sx={{ 
              borderRadius: '14px', fontWeight: 700, px: 3,
              borderColor: 'rgba(15,23,42,0.2)', color: '#0f172a',
              '&:hover': { borderColor: '#0f172a', bgcolor: 'rgba(15,23,42,0.02)' }
            }}
          >
            Save Draft
          </Button>
          
          {step === 1 ? (
            <Button 
              variant="contained" 
              onClick={() => setStep(2)}
              sx={{ 
                borderRadius: '14px', fontWeight: 800, px: 4, bgcolor: '#0f172a',
                boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
                '&:hover': { bgcolor: '#1e293b' }
              }}
            >
              Next Step
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={() => handleSave(true)}
              disabled={!canPublish || isSubmitting}
              sx={{ 
                borderRadius: '14px', fontWeight: 800, px: 4, bgcolor: '#3b82f6',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                '&:hover': { bgcolor: '#2563eb' }
              }}
            >
              Schedule & Publish
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
