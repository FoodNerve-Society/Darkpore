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
  Subtitles as TeleprompterIcon,
  Flip as FlipIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Tv as TvIcon,
  Speed as SpeedIcon,
  FormatSize as FormatSizeIcon,
} from '@mui/icons-material';
import { useMultiScreenPlacement, ScreenInfo } from './useMultiScreenPlacement';

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
  const [localBlocks, setLocalBlocks] = useState<any[]>(rundownBlocks);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [prompterStatus, setPrompterStatus] = useState({
    isPlaying: false,
    scrollSpeed: 1.2,
    fontSize: 44,
    mirrorX: false,
    mirrorY: false,
  });
  const channelRef = useRef<BroadcastChannel | null>(null);

  const {
    screens,
    isMultiScreenExtended: isExtended,
    permissionState,
    newlyConnectedScreen,
    dismissNewScreenAlert,
    requestScreenAccess,
    getWindowPlacementFeatures,
  } = useMultiScreenPlacement(open);

  useEffect(() => {
    setLocalBlocks(rundownBlocks);
  }, [rundownBlocks]);

  const totalSlides = localBlocks.length;
  const currentItem = localBlocks[activeSlideIndex] || null;
  const nextItem = activeSlideIndex < totalSlides - 1 ? localBlocks[activeSlideIndex + 1] : null;

  // Broadcast and Cache Helper
  const broadcastSync = (
    index: number,
    aspect = aspectRatio,
    transparent = isTransparent,
    blocksOverride = localBlocks,
    secOverride = timerSeconds,
    runningOverride = isTimerRunning
  ) => {
    try {
      const statePayload = {
        type: 'SYNC_STATE',
        activeSlideIndex: index,
        rundownBlocks: blocksOverride,
        title,
        hubColor,
        aspectRatio: aspect,
        isTransparent: transparent,
        timerSeconds: secOverride,
        isTimerRunning: runningOverride,
      };

      localStorage.setItem(STAGE_CACHE_KEY, JSON.stringify(statePayload));

      if (channelRef.current) {
        channelRef.current.postMessage(statePayload);
      }
    } catch (e) {
      console.error('Error broadcasting state:', e);
    }
  };

  const sendPrompterCommand = (action: string, extra: Record<string, any> = {}) => {
    try {
      const payload = { type: 'PROMPTER_CONTROL', action, ...extra };
      if (channelRef.current) {
        channelRef.current.postMessage(payload);
      } else {
        const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
        ch.postMessage(payload);
        ch.close();
      }
    } catch (e) {
      console.warn('Error sending prompter command:', e);
    }
  };

  const handleUpdateSpeakerNotes = (newNotes: string) => {
    const updated = localBlocks.map((b, idx) =>
      idx === activeSlideIndex ? { ...b, speakerNotes: newNotes } : b
    );
    setLocalBlocks(updated);
    broadcastSync(activeSlideIndex, aspectRatio, isTransparent, updated);
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
          // A stage or teleprompter window just opened and requested state
          broadcastSync(activeSlideIndex);
        } else if (data.type === 'SET_SLIDE_INDEX' && typeof data.index === 'number') {
          setActiveSlideIndex(data.index);
          broadcastSync(data.index);
        } else if (data.type === 'PROMPTER_STATUS') {
          setPrompterStatus({
            isPlaying: Boolean(data.isPlaying),
            scrollSpeed: typeof data.scrollSpeed === 'number' ? data.scrollSpeed : 1.2,
            fontSize: typeof data.fontSize === 'number' ? data.fontSize : 44,
            mirrorX: Boolean(data.mirrorX),
            mirrorY: Boolean(data.mirrorY),
          });
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
  }, [open, activeSlideIndex, localBlocks, title, hubColor, timerSeconds, isTimerRunning]);

  // Elapsed Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const nextSec = prev + 1;
          return nextSec;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Keyboard navigation inside Control Deck (non-looping)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

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
    if (activeSlideIndex < totalSlides - 1) {
      const nextIdx = activeSlideIndex + 1;
      setActiveSlideIndex(nextIdx);
      broadcastSync(nextIdx);
    }
  };

  const handlePrev = () => {
    if (activeSlideIndex > 0) {
      const prevIdx = activeSlideIndex - 1;
      setActiveSlideIndex(prevIdx);
      broadcastSync(prevIdx);
    }
  };

  const handleSelectSlide = (idx: number) => {
    setActiveSlideIndex(idx);
    broadcastSync(idx);
  };

  const handleLaunchStageWindow = async (targetAspect?: SlideAspectRatio, targetScreen?: ScreenInfo) => {
    const finalAspect = targetAspect || aspectRatio;
    broadcastSync(activeSlideIndex, finalAspect, isTransparent, localBlocks, timerSeconds, true);
    setIsTimerRunning(true);

    let activeScreens = screens;
    if (isExtended && permissionState === 'prompt') {
      activeScreens = await requestScreenAccess();
    }

    const stageUrl = `/stage?aspect=${finalAspect}&transparent=${isTransparent}`;
    const role = finalAspect === '9:16' ? 'mobile_stage' : 'desktop_stage';
    const windowName = finalAspect === '9:16' ? 'LivestreamStage_Mobile' : 'LivestreamStage_Desktop';
    const features = getWindowPlacementFeatures(role, {
      customScreens: activeScreens,
      targetScreen,
    });
    window.open(stageUrl, windowName, features);
  };

  const handleLaunchTeleprompterWindow = async (targetScreen?: ScreenInfo) => {
    broadcastSync(activeSlideIndex, aspectRatio, isTransparent, localBlocks, timerSeconds, true);
    setIsTimerRunning(true);

    let activeScreens = screens;
    if (isExtended && permissionState === 'prompt') {
      activeScreens = await requestScreenAccess();
    }

    const features = getWindowPlacementFeatures('teleprompter', {
      customScreens: activeScreens,
      targetScreen,
    });
    window.open('/stage/teleprompter', 'LivestreamStage_Teleprompter', features);
    if (newlyConnectedScreen) {
      dismissNewScreenAlert();
    }
  };

  const handleLaunchFullStudioSuite = async () => {
    broadcastSync(activeSlideIndex, aspectRatio, isTransparent, localBlocks, timerSeconds, true);
    setIsTimerRunning(true);

    let activeScreens = screens;
    if (isExtended && permissionState === 'prompt') {
      activeScreens = await requestScreenAccess();
    }

    // 1. Open Desktop 16:9 Stage in its designated monitor/coords
    const desktopFeatures = getWindowPlacementFeatures('desktop_stage', {
      customScreens: activeScreens,
      suiteMode: true,
    });
    window.open(
      `/stage?aspect=16:9&transparent=${isTransparent}`,
      'LivestreamStage_Desktop',
      desktopFeatures
    );

    // 2. Open Mobile 9:16 Stage in its designated monitor/coords
    const mobileFeatures = getWindowPlacementFeatures('mobile_stage', {
      customScreens: activeScreens,
      suiteMode: true,
    });
    window.open(
      `/stage?aspect=9:16&transparent=${isTransparent}`,
      'LivestreamStage_Mobile',
      mobileFeatures
    );

    // 3. Open Dedicated Teleprompter Window in its designated monitor/coords
    const prompterFeatures = getWindowPlacementFeatures('teleprompter', {
      customScreens: activeScreens,
      suiteMode: true,
    });
    window.open(
      '/stage/teleprompter',
      'LivestreamStage_Teleprompter',
      prompterFeatures
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
        {/* Left: Deck Branding & Display Sensor */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Director&apos;s Deck
              </Typography>
              <Tooltip
                title={
                  screens.length > 1
                    ? `${screens.length} displays mapped (${screens.map((s) => s.label).join(' • ')}). Windows will auto-route to their designated monitors.`
                    : isExtended
                    ? 'External display detected! Click to authorize automatic multi-monitor window placement.'
                    : 'Single display mode — windows will tile cleanly side-by-side. Plug in an HDMI/USB-C monitor anytime for auto-routing.'
                }
              >
                <Chip
                  icon={<TvIcon sx={{ fontSize: '0.85rem !important', color: isExtended ? '#10b981 !important' : '#64748b !important' }} />}
                  label={
                    screens.length > 1
                      ? `${screens.length} Displays Active`
                      : isExtended
                      ? 'Multi-Display Ready (Sync)'
                      : '1 Display'
                  }
                  size="small"
                  onClick={() => {
                    if (isExtended && permissionState !== 'granted') {
                      requestScreenAccess();
                    }
                  }}
                  sx={{
                    height: 22,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: isExtended && permissionState !== 'granted' ? 'pointer' : 'default',
                    bgcolor: isExtended ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9',
                    color: isExtended ? '#047857' : '#64748b',
                    border: `1px solid ${isExtended ? 'rgba(16, 185, 129, 0.3)' : '#e2e8f0'}`,
                  }}
                />
              </Tooltip>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.76rem' }}>
              Multi-monitor stage router, live teleprompter & broadcast controller
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

        {/* Right: Stage & Teleprompter Window Launchers & Close */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, flexWrap: 'wrap' }}>
          <Tooltip title="Launch dedicated OLED Teleprompter window (auto-places on external/teleprompter monitor with Flip X/Y mirror support)">
            <Button
              variant="contained"
              onClick={() => handleLaunchTeleprompterWindow()}
              startIcon={<TeleprompterIcon sx={{ fontSize: '0.9rem !important' }} />}
              endIcon={<OpenInNewIcon sx={{ fontSize: '0.78rem !important' }} />}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                px: 1.6,
                py: 0.65,
                bgcolor: '#f59e0b',
                color: '#0f172a',
                fontSize: '0.76rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                '&:hover': { bgcolor: '#d97706', color: '#ffffff' },
              }}
            >
              Teleprompter
            </Button>
          </Tooltip>

          <Tooltip title="Launch 16:9 widescreen stage (auto-places on external presentation monitor)">
            <Button
              variant="contained"
              onClick={() => handleLaunchStageWindow('16:9')}
              startIcon={<DesktopIcon sx={{ fontSize: '0.9rem !important' }} />}
              endIcon={<OpenInNewIcon sx={{ fontSize: '0.78rem !important' }} />}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                px: 1.6,
                py: 0.65,
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.76rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              16:9 Stage
            </Button>
          </Tooltip>

          <Tooltip title="Launch 9:16 vertical stage for TikTok/Instagram/Reels monitor">
            <Button
              variant="contained"
              onClick={() => handleLaunchStageWindow('9:16')}
              startIcon={<MobileIcon sx={{ fontSize: '0.9rem !important' }} />}
              endIcon={<OpenInNewIcon sx={{ fontSize: '0.78rem !important' }} />}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                px: 1.6,
                py: 0.65,
                bgcolor: '#db2777',
                color: '#ffffff',
                fontSize: '0.76rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(219, 39, 119, 0.25)',
                '&:hover': { bgcolor: '#be185d' },
              }}
            >
              9:16 Stage
            </Button>
          </Tooltip>

          <Tooltip title="Automatically open and place Desktop Stage (16:9), Mobile Stage (9:16), and Teleprompter into their respective windows/monitors">
            <Button
              variant="outlined"
              onClick={handleLaunchFullStudioSuite}
              sx={{
                borderRadius: '12px',
                fontWeight: 900,
                px: 1.5,
                py: 0.65,
                borderColor: '#10b981',
                color: '#047857',
                bgcolor: 'rgba(16, 185, 129, 0.06)',
                fontSize: '0.76rem',
                textTransform: 'none',
                '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16, 185, 129, 0.14)' },
              }}
            >
              Launch All (3 Windows)
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

      {/* ── LIVE HARDWARE HOT-PLUG BANNER (WHEN NEW DISPLAY IS CONNECTED) ── */}
      {newlyConnectedScreen && (
        <Box
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: 1,
            bgcolor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            borderBottom: '1px solid rgba(16, 185, 129, 0.35)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
              New Display Connected: <Box component="span" sx={{ color: '#34d399' }}>{newlyConnectedScreen.label}</Box> ({newlyConnectedScreen.width}×{newlyConnectedScreen.height})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleLaunchTeleprompterWindow(newlyConnectedScreen)}
              startIcon={<TeleprompterIcon sx={{ fontSize: '0.85rem !important' }} />}
              sx={{
                borderRadius: '8px',
                bgcolor: '#f59e0b',
                color: '#0f172a',
                fontWeight: 900,
                fontSize: '0.72rem',
                textTransform: 'none',
                py: 0.35,
                '&:hover': { bgcolor: '#d97706', color: '#fff' },
              }}
            >
              Send Teleprompter to {newlyConnectedScreen.label}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                handleLaunchStageWindow('16:9', newlyConnectedScreen);
                dismissNewScreenAlert();
              }}
              sx={{
                borderRadius: '8px',
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#f8fafc',
                fontWeight: 800,
                fontSize: '0.72rem',
                textTransform: 'none',
                py: 0.35,
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Send 16:9 Stage Here
            </Button>
            <IconButton size="small" onClick={dismissNewScreenAlert} sx={{ color: '#94a3b8', p: 0.3 }}>
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        </Box>
      )}

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
              {/* Prev Button: Starts at slide 1 without prev button */}
              <Box sx={{ flexShrink: 0, zIndex: 10, minWidth: 90, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  variant="outlined"
                  onClick={handlePrev}
                  disabled={activeSlideIndex <= 0}
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
                    visibility: activeSlideIndex === 0 ? 'hidden' : 'visible',
                    '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' },
                  }}
                >
                  Prev
                </Button>
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
                  perspective: '1000px',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const targetIdx = activeSlideIndex + offset;
                  if (targetIdx < 0 || targetIdx >= totalSlides) return null;
                  const slide = localBlocks[targetIdx];
                  const isActive = offset === 0;

                  // 3D Transform and depth values with proper horizontal spread
                  let transform = 'scale(1) rotateY(0deg)';
                  let zIndex = 5;
                  let opacity = 1;

                  if (isActive) {
                    transform = 'scale(1.15) rotateY(0deg) translateZ(35px)';
                    zIndex = 10;
                    opacity = 1;
                  } else if (offset === -1) {
                    transform = 'translateX(-115px) scale(0.85) rotateY(28deg)';
                    zIndex = 6;
                    opacity = 0.7;
                  } else if (offset === 1) {
                    transform = 'translateX(115px) scale(0.85) rotateY(-28deg)';
                    zIndex = 6;
                    opacity = 0.7;
                  } else if (offset === -2) {
                    transform = 'translateX(-200px) scale(0.72) rotateY(40deg)';
                    zIndex = 3;
                    opacity = 0.4;
                  } else if (offset === 2) {
                    transform = 'translateX(200px) scale(0.72) rotateY(-40deg)';
                    zIndex = 3;
                    opacity = 0.4;
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
                        width: { xs: 110, sm: 135, md: 145 },
                        height: { xs: 72, md: 84 },
                        borderRadius: '14px',
                        bgcolor: '#ffffff',
                        border: '1px solid rgba(226, 232, 240, 0.95)',
                        boxShadow: isActive
                          ? '0 16px 36px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(0,0,0,0.06)'
                          : '0 4px 12px rgba(0,0,0,0.04)',
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
                            ? 'scale(1.18) rotateY(0deg) translateZ(40px)'
                            : offset < 0
                            ? 'translateX(-115px) scale(0.88) rotateY(22deg)'
                            : 'translateX(115px) scale(0.88) rotateY(-22deg)',
                        },
                      }}
                    >
                      {/* Top Header Row: Slide number & block indicator dot */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 900, color: '#64748b' }}>
                          #{targetIdx + 1}
                        </Typography>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: blockColor,
                            opacity: isActive ? 1 : 0.6,
                          }}
                        />
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
              <Box sx={{ flexShrink: 0, zIndex: 10, minWidth: 90, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeSlideIndex >= totalSlides - 1}
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
                    '&:disabled': { opacity: 0.35, bgcolor: '#cbd5e1' },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Box>

          {/* ── RIGHT COLUMN: NEXT UP & PRESENTER NOTES / TELEPROMPTER REMOTE ── */}
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

            {/* 2. Presenter Notes, Teleprompter Remote & Cues */}
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
                gap: 1.5,
              }}
            >
              {/* Header: Title, Edit Script Toggle & Target Duration */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotesIcon sx={{ color: hubColor, fontSize: '1.15rem' }} />
                  <Typography sx={{ fontWeight: 900, fontSize: '0.84rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Teleprompter Script & Notes
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Button
                    size="small"
                    variant={isEditingNotes ? 'contained' : 'outlined'}
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                    startIcon={isEditingNotes ? <CheckIcon sx={{ fontSize: '0.85rem !important' }} /> : <EditIcon sx={{ fontSize: '0.8rem !important' }} />}
                    sx={{
                      borderRadius: '8px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      py: 0.25,
                      px: 1,
                      minWidth: 0,
                      bgcolor: isEditingNotes ? '#10b981' : 'transparent',
                      borderColor: isEditingNotes ? '#10b981' : '#cbd5e1',
                      color: isEditingNotes ? '#ffffff' : '#475569',
                      '&:hover': {
                        bgcolor: isEditingNotes ? '#059669' : '#f8fafc',
                        borderColor: isEditingNotes ? '#059669' : '#0f172a',
                      },
                    }}
                  >
                    {isEditingNotes ? 'Done' : 'Edit Live'}
                  </Button>

                  {currentItem?.durationStr && (
                    <Chip
                      label={`⏱️ ${currentItem.durationStr}`}
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
              </Box>

              {/* Remote Teleprompter Control Bar */}
              <Box
                sx={{
                  px: 1.25,
                  py: 0.85,
                  borderRadius: '12px',
                  bgcolor: '#0f172a',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => sendPrompterCommand('TOGGLE_PLAY')}
                    startIcon={prompterStatus.isPlaying ? <PauseIcon sx={{ fontSize: '0.85rem !important' }} /> : <PlayIcon sx={{ fontSize: '0.85rem !important' }} />}
                    sx={{
                      borderRadius: '8px',
                      bgcolor: prompterStatus.isPlaying ? '#ef4444' : '#10b981',
                      color: prompterStatus.isPlaying ? '#fff' : '#052e16',
                      fontWeight: 900,
                      fontSize: '0.68rem',
                      textTransform: 'none',
                      py: 0.3,
                      px: 1.1,
                      minWidth: 0,
                      '&:hover': { bgcolor: prompterStatus.isPlaying ? '#dc2626' : '#059669' },
                    }}
                  >
                    {prompterStatus.isPlaying ? 'Pause Scroll' : 'Auto-Scroll'}
                  </Button>

                  {/* Speed remote */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: 'rgba(255,255,255,0.08)', px: 0.75, py: 0.2, borderRadius: '7px' }}>
                    <SpeedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                    <IconButton
                      size="small"
                      onClick={() => sendPrompterCommand('SET_SPEED', { value: Math.max(0.4, Number((prompterStatus.scrollSpeed - 0.2).toFixed(1))) })}
                      sx={{ color: '#e2e8f0', p: 0.2, fontSize: '0.72rem', fontWeight: 900 }}
                    >
                      -
                    </IconButton>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, fontFamily: 'monospace', color: '#f8fafc', minWidth: 28, textAlign: 'center' }}>
                      {prompterStatus.scrollSpeed.toFixed(1)}x
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => sendPrompterCommand('SET_SPEED', { value: Math.min(3.5, Number((prompterStatus.scrollSpeed + 0.2).toFixed(1))) })}
                      sx={{ color: '#e2e8f0', p: 0.2, fontSize: '0.72rem', fontWeight: 900 }}
                    >
                      +
                    </IconButton>
                  </Box>

                  {/* Font size remote */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: 'rgba(255,255,255,0.08)', px: 0.75, py: 0.2, borderRadius: '7px' }}>
                    <FormatSizeIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                    <IconButton
                      size="small"
                      onClick={() => sendPrompterCommand('SET_FONT_SIZE', { value: Math.max(24, prompterStatus.fontSize - 4) })}
                      sx={{ color: '#e2e8f0', p: 0.2, fontSize: '0.68rem', fontWeight: 900 }}
                    >
                      -
                    </IconButton>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, fontFamily: 'monospace', color: '#f8fafc' }}>
                      {prompterStatus.fontSize}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => sendPrompterCommand('SET_FONT_SIZE', { value: Math.min(84, prompterStatus.fontSize + 4) })}
                      sx={{ color: '#e2e8f0', p: 0.2, fontSize: '0.68rem', fontWeight: 900 }}
                    >
                      +
                    </IconButton>
                  </Box>
                </Box>

                {/* Mirror toggle & Pop Out */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Remote toggle horizontal mirror (Flip X) on the Teleprompter window">
                    <Chip
                      icon={<FlipIcon sx={{ fontSize: '0.75rem !important', color: prompterStatus.mirrorX ? '#0f172a !important' : '#cbd5e1 !important' }} />}
                      label="Flip X"
                      size="small"
                      onClick={() => sendPrompterCommand('TOGGLE_MIRROR_X')}
                      sx={{
                        height: 22,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        bgcolor: prompterStatus.mirrorX ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                        color: prompterStatus.mirrorX ? '#0f172a' : '#cbd5e1',
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>

              {/* Private Speaker Notes (Clean, compact, ergonomic, or live-editable) */}
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  maxHeight: 200,
                  minHeight: 95,
                  overflowY: 'auto',
                }}
              >
                {isEditingNotes ? (
                  <TextField
                    multiline
                    minRows={3}
                    maxRows={6}
                    fullWidth
                    variant="standard"
                    placeholder="Type presenter script or cues like [PAUSE 2s], [SHOW STAT]... Updates live on the Teleprompter window."
                    value={currentItem?.speakerNotes || ''}
                    onChange={(e) => handleUpdateSpeakerNotes(e.target.value)}
                    slotProps={{
                      input: {
                        disableUnderline: true,
                        sx: {
                          fontSize: '0.86rem',
                          color: '#0f172a',
                          lineHeight: 1.55,
                          fontFamily: 'inherit',
                        },
                      },
                    }}
                  />
                ) : currentItem?.speakerNotes ? (
                  <Typography sx={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {currentItem.speakerNotes}
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No private speaker notes written for this slide. The Teleprompter window will automatically synthesize talking points from the slide&apos;s headline, stat, and body copy—or click &ldquo;Edit Live&rdquo; above to type custom notes.
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
