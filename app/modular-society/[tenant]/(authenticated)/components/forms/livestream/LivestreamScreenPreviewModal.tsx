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
import { DEF_BLOCK_DEFINITIONS } from './defBlocksConfig';
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

  const handleLaunchStageWindow = (targetAspect?: SlideAspectRatio) => {
    const finalAspect = targetAspect || aspectRatio;
    broadcastSync(activeSlideIndex);
    // Auto-start elapsed timer when stage is launched
    setIsTimerRunning(true);

    const stageUrl = `/stage?aspect=${finalAspect}&transparent=${isTransparent}`;
    const windowName = finalAspect === '9:16' ? 'LivestreamStage_Mobile' : 'LivestreamStage_Desktop';
    const features = finalAspect === '9:16'
      ? 'width=520,height=920,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
      : 'width=1280,height=750,menubar=no,toolbar=no,location=no,status=no,resizable=yes';
    window.open(stageUrl, windowName, features);
  };

  const handleLaunchBothStages = () => {
    broadcastSync(activeSlideIndex);
    setIsTimerRunning(true);
    // Open Desktop 16:9 stage
    window.open(
      `/stage?aspect=16:9&transparent=${isTransparent}`,
      'LivestreamStage_Desktop',
      'width=1280,height=750,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );
    // Open Mobile 9:16 stage
    window.open(
      `/stage?aspect=9:16&transparent=${isTransparent}`,
      'LivestreamStage_Mobile',
      'width=520,height=920,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );
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
        {/* Left: Deck Branding */}
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
              Live stage cockpit & dual presentation controller
            </Typography>
          </Box>
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

        {/* Right: Dual Stage Window Launchers & Close */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Launch 16:9 widescreen stage for YouTube/Twitch/Desktop monitor">
            <Button
              variant="contained"
              onClick={() => handleLaunchStageWindow('16:9')}
              startIcon={<DesktopIcon sx={{ fontSize: '0.9rem !important' }} />}
              endIcon={<OpenInNewIcon sx={{ fontSize: '0.8rem !important' }} />}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                px: 1.8,
                py: 0.65,
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.78rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              Desktop Stage (16:9)
            </Button>
          </Tooltip>

          <Tooltip title="Launch 9:16 vertical stage for TikTok/Instagram/Mobile monitor">
            <Button
              variant="contained"
              onClick={() => handleLaunchStageWindow('9:16')}
              startIcon={<MobileIcon sx={{ fontSize: '0.9rem !important' }} />}
              endIcon={<OpenInNewIcon sx={{ fontSize: '0.8rem !important' }} />}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                px: 1.8,
                py: 0.65,
                bgcolor: '#db2777',
                color: '#ffffff',
                fontSize: '0.78rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(219, 39, 119, 0.25)',
                '&:hover': { bgcolor: '#be185d' },
              }}
            >
              Mobile Stage (9:16)
            </Button>
          </Tooltip>

          <Tooltip title="Launch both Desktop and Mobile stage windows simultaneously">
            <Button
              variant="outlined"
              onClick={handleLaunchBothStages}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                px: 1.5,
                py: 0.65,
                borderColor: '#cbd5e1',
                color: '#0f172a',
                fontSize: '0.78rem',
                textTransform: 'none',
                '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' },
              }}
            >
              Launch Dual
            </Button>
          </Tooltip>

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

                <Tooltip title="Click to toggle monitor view between 16:9 and 9:16">
                  <Chip
                    label={aspectRatio === '9:16' ? '9:16 Vertical Stage' : '16:9 Landscape Stage'}
                    size="small"
                    onClick={handleToggleAspect}
                    sx={{
                      bgcolor: aspectRatio === '9:16' ? 'rgba(219, 39, 119, 0.1)' : '#f8fafc',
                      color: aspectRatio === '9:16' ? '#db2777' : '#64748b',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 22,
                      cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.06)',
                      '&:hover': { bgcolor: '#f1f5f9' },
                    }}
                  />
                </Tooltip>
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

            {/* Expanded Carousel Dock with 3D Cover-Flow Slide Viewer between Prev and Next */}
            <Box
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.95)',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 1.5, md: 2.5 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Prev Button with Slide Counter */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75, flexShrink: 0, zIndex: 10 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrev}
                  disabled={totalSlides <= 1}
                  startIcon={<PrevIcon sx={{ fontSize: '0.85rem !important' }} />}
                  sx={{
                    borderRadius: '12px',
                    borderColor: '#cbd5e1',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    py: 0.85,
                    px: 2,
                    bgcolor: '#ffffff',
                    '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' },
                    '&:disabled': { opacity: 0.4 },
                  }}
                >
                  Prev
                </Button>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', pl: 0.5 }}>
                  {totalSlides > 0 ? `${activeSlideIndex + 1} of ${totalSlides}` : '0 of 0'}
                </Typography>
              </Box>

              {/* Center: 3D Perspective Cover-Flow Carousel */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: 105,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  perspective: '900px',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const targetIdx = activeSlideIndex + offset;
                  if (targetIdx < 0 || targetIdx >= totalSlides) return null;
                  const slide = rundownBlocks[targetIdx];
                  const isActive = offset === 0;

                  // 3D Transform and depth values
                  let transform = 'scale(1) rotateY(0deg)';
                  let zIndex = 5;
                  let opacity = 1;

                  if (isActive) {
                    transform = 'scale(1.15) rotateY(0deg) translateZ(30px)';
                    zIndex = 10;
                    opacity = 1;
                  } else if (offset === -1) {
                    transform = 'scale(0.85) rotateY(26deg) translateX(20px)';
                    zIndex = 6;
                    opacity = 0.65;
                  } else if (offset === 1) {
                    transform = 'scale(0.85) rotateY(-26deg) translateX(-20px)';
                    zIndex = 6;
                    opacity = 0.65;
                  } else if (offset === -2) {
                    transform = 'scale(0.7) rotateY(38deg) translateX(40px)';
                    zIndex = 3;
                    opacity = 0.35;
                  } else if (offset === 2) {
                    transform = 'scale(0.7) rotateY(-38deg) translateX(-40px)';
                    zIndex = 3;
                    opacity = 0.35;
                  }

                  const defInfo = slide.defBlockId ? DEF_BLOCK_DEFINITIONS[slide.defBlockId] : null;
                  const slideTitle =
                    slide.title ||
                    slide.originalContent?.title ||
                    slide.originalContent?.jobTitle ||
                    slide.originalContent?.text ||
                    defInfo?.name ||
                    `Slide ${targetIdx + 1}`;
                  const blockColor = defInfo?.themeColor || (slide.sourceType === 'act' ? '#10b981' : '#6366f1');

                  return (
                    <Box
                      key={targetIdx}
                      onClick={() => handleSelectSlide(targetIdx)}
                      sx={{
                        position: 'absolute',
                        width: { xs: 110, sm: 135, md: 150 },
                        height: { xs: 72, md: 85 },
                        borderRadius: '14px',
                        bgcolor: '#ffffff',
                        border: isActive ? `2px solid ${blockColor}` : '1px solid rgba(226, 232, 240, 0.95)',
                        boxShadow: isActive
                          ? `0 12px 28px ${alpha(blockColor, 0.25)}, 0 4px 12px rgba(0,0,0,0.08)`
                          : '0 4px 12px rgba(0,0,0,0.05)',
                        cursor: isActive ? 'default' : 'pointer',
                        p: 1.15,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transform,
                        zIndex,
                        opacity,
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        transformStyle: 'preserve-3d',
                        userSelect: 'none',
                        overflow: 'hidden',
                        '&:hover': {
                          opacity: isActive ? 1 : 0.92,
                          transform: isActive
                            ? 'scale(1.18) rotateY(0deg) translateZ(35px)'
                            : offset < 0
                            ? 'scale(0.88) rotateY(20deg) translateX(14px)'
                            : 'scale(0.88) rotateY(-20deg) translateX(-14px)',
                        },
                      }}
                    >
                      {/* Top Header Row inside mini card */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 900, color: '#64748b' }}>
                          #{targetIdx + 1}
                        </Typography>
                        {isActive ? (
                          <Chip
                            label="ACTIVE"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.52rem',
                              fontWeight: 900,
                              bgcolor: blockColor,
                              color: '#ffffff',
                              px: 0.25,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: blockColor,
                              opacity: 0.6,
                            }}
                          />
                        )}
                      </Box>

                      {/* Middle: Title Snippet */}
                      <Typography
                        noWrap
                        sx={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          lineHeight: 1.25,
                        }}
                      >
                        {slideTitle}
                      </Typography>

                      {/* Bottom Tag */}
                      <Typography
                        noWrap
                        sx={{
                          fontSize: '0.56rem',
                          fontWeight: 800,
                          color: blockColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {defInfo?.name || slide.sourceType || 'SLIDE'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Next Button */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75, flexShrink: 0, zIndex: 10 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={totalSlides <= 1}
                  endIcon={<NextIcon sx={{ fontSize: '0.85rem !important' }} />}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    py: 0.85,
                    px: 2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#1e293b' },
                    '&:disabled': { opacity: 0.4 },
                  }}
                >
                  Next
                </Button>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', pr: 0.5 }}>
                  Key: &rarr; / PageDn
                </Typography>
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
