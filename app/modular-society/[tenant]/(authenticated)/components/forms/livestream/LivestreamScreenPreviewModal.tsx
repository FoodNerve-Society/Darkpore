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
import { renderSlidePreviewContent, SlideAspectRatio } from './SlideComponents';
import {
  Laptop as DesktopIcon,
  PhoneIphone as MobileIcon,
  Opacity as TransparencyIcon,
} from '@mui/icons-material';

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
  const [aspectRatio, setAspectRatio] = useState<SlideAspectRatio>('16:9');
  const [isTransparent, setIsTransparent] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const totalSlides = rundownBlocks.length;
  const currentItem = rundownBlocks[activeSlideIndex] || null;
  const nextItem = activeSlideIndex < totalSlides - 1 ? rundownBlocks[activeSlideIndex + 1] : null;

  // Broadcast and Cache Helper
  const broadcastSync = (index: number, aspect = aspectRatio, transparent = isTransparent) => {
    try {
      const statePayload = {
        type: 'SYNC_STATE',
        activeSlideIndex: index,
        rundownBlocks,
        title,
        hubColor,
        aspectRatio: aspect,
        isTransparent: transparent,
      };

      localStorage.setItem(STAGE_CACHE_KEY, JSON.stringify(statePayload));

      if (channelRef.current) {
        channelRef.current.postMessage(statePayload);
      }
    } catch (e) {
      console.error('Error broadcasting state:', e);
    }
  };

  const handleToggleAspect = () => {
    const nextAspect: SlideAspectRatio = aspectRatio === '16:9' ? '9:16' : '16:9';
    setAspectRatio(nextAspect);
    broadcastSync(activeSlideIndex, nextAspect, isTransparent);
    try {
      const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
      ch.postMessage({ type: 'SET_ASPECT', aspectRatio: nextAspect });
      ch.close();
    } catch {}
  };

  const handleToggleTransparent = () => {
    const nextTransparent = !isTransparent;
    setIsTransparent(nextTransparent);
    broadcastSync(activeSlideIndex, aspectRatio, nextTransparent);
    try {
      const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
      ch.postMessage({ type: 'SET_TRANSPARENT', isTransparent: nextTransparent });
      ch.close();
    } catch {}
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
    const stageUrl = `/stage?aspect=${aspectRatio}&transparent=${isTransparent}`;
    const features = aspectRatio === '9:16'
      ? 'width=520,height=920,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
      : 'width=1280,height=750,menubar=no,toolbar=no,location=no,status=no,resizable=yes';
    window.open(stageUrl, 'LivestreamStage', features);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Render a Slide Component cleanly via centralized engine
  const renderSlideItem = (item: any) => {
    return renderSlidePreviewContent(item, hubColor, {
      aspectRatio,
      isTransparent,
    });
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
            bgcolor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(24px)',
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
          py: 1.75,
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
              Director&apos;s Deck
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
              Live stage cockpit & presentation controller
            </Typography>
          </Box>

          <Chip
            icon={<LiveIcon sx={{ fontSize: '0.85rem !important', color: '#059669 !important' }} />}
            label="Stage Live Sync"
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

        {/* Center: Elapsed Timer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.75,
            py: 0.5,
            borderRadius: '12px',
            bgcolor: '#f1f5f9',
            border: '1px solid #e2e8f0',
          }}
        >
          <AccessTimeIcon sx={{ fontSize: '1rem', color: '#64748b' }} />
          <Typography sx={{ fontWeight: 900, fontSize: '0.86rem', color: '#0f172a', fontFamily: 'monospace' }}>
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
      <DialogContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' }, flex: 1 }}>
          
          {/* ── LEFT COLUMN: LIVE MONITOR & BROADCASTER DOCK ── */}
          <Box sx={{ flex: 1.35, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            
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
                  label={aspectRatio === '9:16' ? '9:16 Vertical Stage' : '16:9 Landscape Stage'}
                  size="small"
                  sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                />
              </Box>

              {/* Active Slide Frame: Container adapts size to 16:9 vs 9:16 without squishing content */}
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: isTransparent ? 'transparent' : '#f8fafc',
                  p: isTransparent ? 1 : 0,
                  borderRadius: '16px',
                  border: isTransparent ? '1.5px dashed #cbd5e1' : 'none',
                  minHeight: 320,
                }}
              >
                <Box
                  sx={{
                    width: aspectRatio === '9:16' ? 'auto' : '100%',
                    height: aspectRatio === '9:16' ? { xs: 400, md: 480 } : 'auto',
                    maxWidth: aspectRatio === '16:9' ? '100%' : 'calc(480px * 9 / 16)',
                    aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    bgcolor: isTransparent ? 'transparent' : '#f8fafc',
                    border: '1.5px solid rgba(226, 232, 240, 0.95)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {renderSlideItem(currentItem)}
                </Box>
              </Box>
            </Box>

            {/* Consolidated Broadcaster Mini Dock (Relocated from Stage, replacing old bottom controls) */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '16px',
                bgcolor: '#ffffff',
                border: '1.5px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.25,
              }}
            >
              {/* Aspect Ratio & Transparency Toggles */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={aspectRatio === '16:9' ? 'Switch to 9:16 Vertical (TikTok/Mobile)' : 'Switch to 16:9 Landscape (YouTube/Desktop)'}>
                  <Box
                    onClick={handleToggleAspect}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      cursor: 'pointer',
                      px: 1.4,
                      py: 0.6,
                      borderRadius: '10px',
                      bgcolor: aspectRatio === '9:16' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                      border: `1.5px solid ${aspectRatio === '9:16' ? 'rgba(236, 72, 153, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
                      color: aspectRatio === '9:16' ? '#db2777' : '#2563eb',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: aspectRatio === '9:16' ? 'rgba(236, 72, 153, 0.18)' : 'rgba(59, 130, 246, 0.18)' },
                    }}
                  >
                    {aspectRatio === '9:16' ? (
                      <>
                        <MobileIcon sx={{ fontSize: 16, color: '#db2777' }} />
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#db2777' }}>9:16 Mobile</Typography>
                      </>
                    ) : (
                      <>
                        <DesktopIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#2563eb' }}>16:9 Desktop</Typography>
                      </>
                    )}
                  </Box>
                </Tooltip>

                <Tooltip title={isTransparent ? 'Transparent active for OBS camera overlay (Click for solid)' : 'Make backdrop transparent for OBS camera feed'}>
                  <Box
                    onClick={handleToggleTransparent}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      cursor: 'pointer',
                      px: 1.4,
                      py: 0.6,
                      borderRadius: '10px',
                      bgcolor: isTransparent ? 'rgba(16, 185, 129, 0.12)' : '#f8fafc',
                      border: `1.5px solid ${isTransparent ? 'rgba(16, 185, 129, 0.4)' : '#e2e8f0'}`,
                      color: isTransparent ? '#059669' : '#64748b',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: isTransparent ? 'rgba(16, 185, 129, 0.18)' : '#f1f5f9' },
                    }}
                  >
                    <TransparencyIcon sx={{ fontSize: 16, color: isTransparent ? '#059669' : '#64748b' }} />
                    <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: isTransparent ? '#059669' : '#64748b' }}>
                      {isTransparent ? 'OBS Alpha' : 'Solid Canvas'}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>

              {/* Navigation Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PrevIcon sx={{ fontSize: '0.8rem !important' }} />}
                  onClick={handlePrev}
                  disabled={totalSlides <= 1}
                  sx={{
                    borderRadius: '10px',
                    borderColor: '#cbd5e1',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    textTransform: 'none',
                    py: 0.5,
                    px: 1.6,
                    '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' },
                  }}
                >
                  Prev
                </Button>

                <Chip
                  label={totalSlides > 0 ? `Slide ${activeSlideIndex + 1} / ${totalSlides}` : '0 / 0'}
                  size="small"
                  sx={{
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.76rem',
                    height: 28,
                    borderRadius: '8px',
                    px: 0.5,
                  }}
                />

                <Button
                  size="small"
                  variant="contained"
                  endIcon={<NextIcon sx={{ fontSize: '0.8rem !important' }} />}
                  onClick={handleNext}
                  disabled={totalSlides <= 1}
                  sx={{
                    borderRadius: '10px',
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    textTransform: 'none',
                    py: 0.5,
                    px: 2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#1e293b' },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Box>

          {/* ── RIGHT COLUMN: NEXT UP & PRESENTER NOTES ── */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* 1. Next Up On Stage (Atop the right column) */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: '18px',
                bgcolor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
              }}
            >
              <Box
                sx={{
                  width: 120,
                  aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  flexShrink: 0,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {nextItem ? (
                  <Box
                    sx={{
                      transform: aspectRatio === '9:16' ? 'scale(0.3)' : 'scale(0.35)',
                      transformOrigin: 'top left',
                      width: aspectRatio === '9:16' ? '333%' : '285%',
                      height: aspectRatio === '9:16' ? '333%' : '285%',
                    }}
                  >
                    {renderSlideItem(nextItem)}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>End of Deck</Typography>
                )}
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>
                  Next Up On Stage
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nextItem
                    ? nextItem.originalContent?.role || nextItem.originalContent?.title || nextItem.originalBlockType?.replace('_', ' ').toUpperCase() || 'Upcoming Slide'
                    : 'Broadcast Conclusion'}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
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
                    fontSize: '0.72rem',
                    textTransform: 'none',
                    py: 0.4,
                    px: 1.25,
                    '&:hover': { borderColor: '#0f172a', bgcolor: '#ffffff' },
                  }}
                >
                  Skip To Next
                </Button>
              )}
            </Box>

            {/* 2. Presenter Notes & Cues (Current Segment Header card removed, notes smaller) */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                p: 2.25,
                borderRadius: '18px',
                bgcolor: '#ffffff',
                border: '1.5px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.75,
              }}
            >
              {/* Header: Title & Target Duration */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotesIcon sx={{ color: hubColor, fontSize: '1.15rem' }} />
                  <Typography sx={{ fontWeight: 900, fontSize: '0.84rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Presenter Notes & Talking Points
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
                      fontSize: '0.7rem',
                      borderRadius: '8px',
                    }}
                  />
                )}
              </Box>

              {/* Private Speaker Notes (Clean, compact, ergonomic) */}
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  maxHeight: 180,
                  minHeight: 80,
                  overflowY: 'auto',
                }}
              >
                {currentItem?.speakerNotes ? (
                  <Typography sx={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {currentItem.speakerNotes}
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No private speaker notes written for this slide. Focus on the core graphic insight on stage.
                  </Typography>
                )}
              </Box>

              {/* Discussion Prompt / Audience Question */}
              {currentItem?.originalContent?.description && (
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: '12px',
                    bgcolor: 'rgba(59, 130, 246, 0.05)',
                    border: '1.5px solid rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.25,
                  }}
                >
                  <QuestionIcon sx={{ fontSize: '1.05rem', color: '#2563eb', mt: 0.2 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.03em', mb: 0.2 }}>
                      Discussion Prompt / Chat Engagement
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.45, fontWeight: 500 }}>
                      {currentItem.originalContent.description}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
