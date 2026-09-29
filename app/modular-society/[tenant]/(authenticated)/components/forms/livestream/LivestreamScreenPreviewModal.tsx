'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Tooltip,
  TextField,
} from '@mui/material';
import { alpha } from '@mui/system';
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ArrowBackIosNew as PrevIcon,
  ArrowForwardIos as NextIcon,
  OpenInNew as OpenInNewIcon,
  Sensors as LiveIcon,
  AccessTime as AccessTimeIcon,
  QuestionAnswer as QuestionIcon,
  Notes as NotesIcon,
  Layers as LayersIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
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

export interface LivestreamScreenPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  hubTitle?: string;
  hubColor?: string;
  hostName?: string;
  hostAvatar?: string;
  rundownBlocks: any[];
  streamUrl?: string;
  eventDate?: string;
}

const SYNC_CHANNEL_NAME = 'livestream_presentation_sync';
const STAGE_CACHE_KEY = 'livestream_stage_cache';

export default function LivestreamScreenPreviewModal({
  open,
  onClose,
  title,
  category = 'capital',
  hubTitle = 'Production & Capital',
  hubColor = '#10b981',
  hostName = 'Broadcast Host',
  hostAvatar = '',
  rundownBlocks = [],
  streamUrl = '',
  eventDate = '',
}: LivestreamScreenPreviewModalProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const totalSlides = rundownBlocks.length;
  const currentItem = rundownBlocks[activeSlideIndex] || null;
  const nextItem = activeSlideIndex < totalSlides - 1 ? rundownBlocks[activeSlideIndex + 1] : null;

  // Broadcast and Cache Helper
  const broadcastSync = (index: number) => {
    try {
      const statePayload = {
        type: 'SYNC_STATE',
        activeSlideIndex: index,
        rundownBlocks,
        title,
        hubColor,
      };

      // Write to localStorage for immediate cross-tab fallback
      localStorage.setItem(STAGE_CACHE_KEY, JSON.stringify(statePayload));

      // Post to active BroadcastChannel
      if (channelRef.current) {
        channelRef.current.postMessage(statePayload);
      }
    } catch (e) {
      console.error('Error broadcasting state:', e);
    }
  };

  // Initialize BroadcastChannel
  useEffect(() => {
    if (!open) return;

    try {
      const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channelRef.current = ch;

      ch.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'REQUEST_STATE') {
          // A stage window just opened and requested state
          broadcastSync(activeSlideIndex);
        } else if (data.type === 'NAVIGATE') {
          if (data.direction === 'next') {
            setActiveSlideIndex((prev) => {
              const next = prev < totalSlides - 1 ? prev + 1 : 0;
              broadcastSync(next);
              return next;
            });
          } else if (data.direction === 'prev') {
            setActiveSlideIndex((prev) => {
              const next = prev > 0 ? prev - 1 : totalSlides - 1;
              broadcastSync(next);
              return next;
            });
          }
        }
      };

      // Broadcast on initial open
      broadcastSync(activeSlideIndex);
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [open, activeSlideIndex, rundownBlocks, title, hubColor]);

  // Elapsed Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Keyboard navigation inside Control Deck
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, activeSlideIndex, totalSlides]);

  const handleNext = () => {
    if (totalSlides <= 1) return;
    const nextIdx = activeSlideIndex < totalSlides - 1 ? activeSlideIndex + 1 : 0;
    setActiveSlideIndex(nextIdx);
    broadcastSync(nextIdx);
  };

  const handlePrev = () => {
    if (totalSlides <= 1) return;
    const prevIdx = activeSlideIndex > 0 ? activeSlideIndex - 1 : totalSlides - 1;
    setActiveSlideIndex(prevIdx);
    broadcastSync(prevIdx);
  };

  const handleSelectSlide = (idx: number) => {
    setActiveSlideIndex(idx);
    broadcastSync(idx);
  };

  const handleLaunchStageWindow = () => {
    broadcastSync(activeSlideIndex);
    const stageUrl = '/stage';
    const features = 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes';
    window.open(stageUrl, 'LivestreamStage', features);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Render a Slide Component cleanly
  const renderSlideItem = (item: any) => {
    if (!item) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
            bgcolor: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '16px',
          }}
        >
          <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>No slide available</Typography>
        </Box>
      );
    }

    const isAct =
      item.sourceType === 'act' || item.originalBlockType === 'rundown_act' || Boolean(item.originalContent?.role);
    const isJob = item.sourceType === 'job' || Boolean(item.originalContent?.jobTitle);
    const isTransition = item.sourceType === 'transition' && !isAct;

    if (isAct) {
      return (
        <SlideRundownAct
          content={item.originalContent || {}}
          durationStr={item.durationStr}
          color={hubColor}
        />
      );
    }
    if (isJob) return <SlideJob content={item.originalContent || {}} />;
    if (isTransition) return <SlideTransition content={item.originalContent || {}} />;

    const c = item.originalContent || {};
    switch (item.originalBlockType) {
      case 'subheading':
        return <SlideSpikyTitle content={c} />;
      case 'myth_fact':
      case 'myth_reality':
        return <SlideMythFact content={c} />;
      case 'highlight_card':
      case 'stat_card':
        return <SlideStatCard content={c} />;
      case 'pull_quote':
      case 'strong_quote':
        return <SlideQuote content={c} />;
      case 'media':
        return <SlideMedia content={c} />;
      default:
        return <SlideFallback content={c} type={item.originalBlockType || 'slide'} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '28px',
            bgcolor: '#ffffff',
            border: '1.5px solid rgba(226, 232, 240, 0.95)',
            boxShadow: '0 24px 64px rgba(15, 23, 42, 0.12)',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* ── TOP CONTROL DECK HEADER ── */}
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: 2,
          borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)',
          bgcolor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          zIndex: 10,
        }}
      >
        {/* Left: Deck Branding & Live Sync Status */}
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
            <LiveIcon sx={{ color: hubColor, fontSize: '1.25rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Director&apos;s Control Deck
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              Control your live presentation screen-share from this cockpit
            </Typography>
          </Box>

          <Chip
            icon={<LiveIcon sx={{ fontSize: '0.85rem !important', color: '#059669 !important' }} />}
            label="Stage Sync Active"
            size="small"
            sx={{
              bgcolor: '#d1fae5',
              color: '#065f46',
              fontWeight: 900,
              fontSize: '0.68rem',
              height: 22,
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
        </Box>

        {/* Center: Slide Position & Elapsed Timer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={totalSlides > 0 ? `Slide ${activeSlideIndex + 1} of ${totalSlides}` : '0 Slides'}
            size="small"
            sx={{
              bgcolor: '#0f172a',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              height: 28,
              borderRadius: '8px',
            }}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.4,
              borderRadius: '10px',
              bgcolor: '#f1f5f9',
              border: '1px solid #e2e8f0',
            }}
          >
            <AccessTimeIcon sx={{ fontSize: '0.95rem', color: '#64748b' }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', fontFamily: 'monospace' }}>
              {formatTimer(timerSeconds)}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              sx={{ p: 0.3, color: isTimerRunning ? '#ef4444' : '#10b981' }}
            >
              {isTimerRunning ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>
        </Box>

        {/* Right: Launch Stage Window & Close */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Button
            variant="contained"
            onClick={handleLaunchStageWindow}
            endIcon={<OpenInNewIcon sx={{ fontSize: '0.95rem !important' }} />}
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              px: 2.2,
              py: 0.75,
              background: `linear-gradient(135deg, ${hubColor} 0%, #059669 100%)`,
              color: '#ffffff',
              fontSize: '0.82rem',
              textTransform: 'none',
              boxShadow: `0 4px 14px ${alpha(hubColor, 0.35)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 18px ${alpha(hubColor, 0.45)}`,
              },
            }}
          >
            Launch Stage Window (Screen Share)
          </Button>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#64748b',
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)', color: '#0f172a' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* ── MAIN COCKPIT: 2-COLUMN SPLIT ── */}
      <DialogContent sx={{ p: { xs: 2.5, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5, minHeight: 0, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' }, flex: 1 }}>
          
          {/* ── LEFT COLUMN: LIVE MONITOR & NEXT UP ── */}
          <Box sx={{ flex: 1.3, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Live Monitor Card */}
            <Box
              sx={{
                p: 2,
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: '1.5px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Live Stage Monitor (Audience View)
                  </Typography>
                </Box>

                <Chip
                  label="16:9 Stage Surface"
                  size="small"
                  sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                />
              </Box>

              {/* 16:9 Active Slide Frame */}
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  bgcolor: '#0f172a',
                  border: '1.5px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                }}
              >
                {renderSlideItem(currentItem)}
              </Box>
            </Box>

            {/* Next Up Peek Preview Card */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: '16px',
                bgcolor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box sx={{ width: 140, aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', bgcolor: '#0f172a', flexShrink: 0, position: 'relative' }}>
                {nextItem ? (
                  <Box sx={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '285%', height: '285%' }}>
                    {renderSlideItem(nextItem)}
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>End of Deck</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>
                  Next Up On Stage
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nextItem
                    ? nextItem.originalContent?.role || nextItem.originalContent?.title || nextItem.originalBlockType?.replace('_', ' ').toUpperCase() || 'Upcoming Segment'
                    : 'Broadcast Conclusion'}
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {nextItem ? `Pacing: ${nextItem.durationStr || '5m'}` : 'All slides completed'}
                </Typography>
              </Box>

              {nextItem && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleNext}
                  sx={{
                    borderRadius: '10px',
                    borderColor: '#cbd5e1',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    textTransform: 'none',
                    py: 0.5,
                    px: 1.5,
                    '&:hover': { borderColor: '#0f172a', bgcolor: '#ffffff' },
                  }}
                >
                  Skip To Next
                </Button>
              )}
            </Box>
          </Box>

          {/* ── RIGHT COLUMN: PRESENTER TELEPROMPTER & CUES ── */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#ffffff',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Header: Segment Title & Pacing */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotesIcon sx={{ color: hubColor, fontSize: '1.2rem' }} />
                <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Presenter Teleprompter & Notes
                </Typography>
              </Box>

              {currentItem?.durationStr && (
                <Chip
                  label={`⏱️ Target: ${currentItem.durationStr}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(hubColor, 0.1),
                    color: hubColor,
                    fontWeight: 900,
                    fontSize: '0.72rem',
                    borderRadius: '8px',
                  }}
                />
              )}
            </Box>

            {/* Current Slide Context Banner */}
            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
                Current Segment Header
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.3 }}>
                {currentItem?.originalContent?.role || currentItem?.originalContent?.title || currentItem?.originalBlockType?.replace('_', ' ').toUpperCase() || 'Presentation Segment'}
              </Typography>
              {currentItem?.parentArticleTitle && (
                <Typography sx={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700, mt: 0.5 }}>
                  📖 Derived from: {currentItem.parentArticleTitle}
                </Typography>
              )}
            </Box>

            {/* Speaker Notes */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 140 }}>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1 }}>
                Private Speaker Notes & Talking Points
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: '#ffffff',
                  border: '1.5px solid rgba(226, 232, 240, 0.9)',
                  overflowY: 'auto',
                }}
              >
                {currentItem?.speakerNotes ? (
                  <Typography sx={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {currentItem.speakerNotes}
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No specific speaker notes written for this card. Focus on delivering the core graphic insight on screen.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Discussion Questions / Audience Cues */}
            {currentItem?.originalContent?.description && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: 'rgba(59, 130, 246, 0.05)',
                  border: '1.5px solid rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <QuestionIcon sx={{ fontSize: '1.15rem', color: '#2563eb', mt: 0.2 }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.03em', mb: 0.25 }}>
                    Discussion Prompt / Audience Question
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.45, fontWeight: 500 }}>
                    {currentItem.originalContent.description}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── BOTTOM DIRECTOR CONTROLS & SLIDE SCRUBBER ── */}
        <Box
          sx={{
            p: 2,
            borderRadius: '20px',
            bgcolor: '#ffffff',
            border: '1.5px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Action Row: Prev / Next Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PrevIcon sx={{ fontSize: '0.85rem !important' }} />}
                onClick={handlePrev}
                disabled={totalSlides <= 1}
                sx={{
                  borderRadius: '12px',
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  px: 2.5,
                  py: 0.8,
                  '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' },
                }}
              >
                Previous Slide
              </Button>

              <Button
                variant="contained"
                endIcon={<NextIcon sx={{ fontSize: '0.85rem !important' }} />}
                onClick={handleNext}
                disabled={totalSlides <= 1}
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  px: 3,
                  py: 0.8,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                Next Slide
              </Button>
            </Box>

            <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
              Keyboard shortcut: Use <strong>Left / Right Arrow</strong> keys or <strong>Spacebar</strong> to navigate slides
            </Typography>
          </Box>

          {/* Clickable Scrubber Pills */}
          {totalSlides > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 0.5,
                pt: 0.5,
                '::-webkit-scrollbar': { height: 5 },
                '::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: 2.5 },
              }}
            >
              {rundownBlocks.map((b, idx) => {
                const isActive = idx === activeSlideIndex;
                const isActBlock = b.sourceType === 'act' || b.originalBlockType === 'rundown_act';
                const isJobBlock = b.sourceType === 'job';

                return (
                  <Box
                    key={b.id || idx}
                    onClick={() => handleSelectSlide(idx)}
                    sx={{
                      flexShrink: 0,
                      px: 1.75,
                      py: 0.75,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      bgcolor: isActive ? alpha(hubColor, 0.12) : '#f8fafc',
                      border: isActive
                        ? `1.5px solid ${hubColor}`
                        : '1px solid #e2e8f0',
                      color: isActive ? hubColor : '#475569',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      '&:hover': {
                        bgcolor: isActive ? alpha(hubColor, 0.16) : '#f1f5f9',
                        borderColor: isActive ? hubColor : '#cbd5e1',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 900 }}>
                      {idx + 1}.
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.76rem',
                        fontWeight: isActive ? 800 : 600,
                        maxWidth: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isActBlock
                        ? b.originalContent?.role || b.originalContent?.title || 'Act'
                        : isJobBlock
                        ? b.originalContent?.jobTitle || 'Job Spotlight'
                        : b.originalBlockType?.replace('_', ' ').toUpperCase() || 'Slide'}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
