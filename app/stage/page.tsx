'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  GlobalStyles,
} from '@mui/material';
import {
  SensorsRounded as LiveIcon,
  ChevronLeftRounded as PrevIcon,
  ChevronRightRounded as NextIcon,
  TuneRounded as TuneIcon,
  FullscreenRounded as FullscreenIcon,
  FullscreenExitRounded as FullscreenExitIcon,
  LaptopMacRounded as DesktopIcon,
  PhoneIphoneRounded as MobileIcon,
  OpacityRounded as TransparencyIcon,
} from '@mui/icons-material';
import ThemeRegistry from '@/theme/ThemeRegistry';
import {
  renderSlidePreviewContent,
  SlideAspectRatio,
} from '@/app/modular-society/[tenant]/(authenticated)/components/forms/livestream/SlideComponents';

const SYNC_CHANNEL_NAME = 'livestream_presentation_sync';
const STAGE_CACHE_KEY = 'livestream_stage_cache';

export default function LivestreamStagePage() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [rundownBlocks, setRundownBlocks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [hubColor, setHubColor] = useState('#10b981');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<SlideAspectRatio>('16:9');
  const [lockedAspect, setLockedAspect] = useState<SlideAspectRatio | null>(null);
  const lockedAspectRef = useRef<SlideAspectRatio | null>(null);
  const [isTransparent, setIsTransparent] = useState(false);

  // Auto-hiding oversized HUD controls when mouse moves on stage monitor
  const [showHud, setShowHud] = useState(false);
  const [optionsAnchorEl, setOptionsAnchorEl] = useState<null | HTMLElement>(null);
  const hideHudTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const triggerHudWake = useCallback(() => {
    setShowHud(true);
    if (hideHudTimeoutRef.current) clearTimeout(hideHudTimeoutRef.current);
    hideHudTimeoutRef.current = setTimeout(() => {
      setShowHud(false);
    }, 2800);
  }, []);

  // Initialize aspect ratio and transparency from URL query params (e.g. ?aspect=9:16&transparent=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const aspectParam = params.get('aspect');
      if (aspectParam === '9:16' || aspectParam === 'portrait' || aspectParam === 'mobile') {
        setAspectRatio('9:16');
        setLockedAspect('9:16');
        lockedAspectRef.current = '9:16';
      } else if (aspectParam === '16:9' || aspectParam === 'landscape' || aspectParam === 'desktop') {
        setAspectRatio('16:9');
        setLockedAspect('16:9');
        lockedAspectRef.current = '16:9';
      }
      if (params.get('transparent') === 'true' || params.get('obs') === 'true') {
        setIsTransparent(true);
      }
    }
  }, []);

  // Update distinct window title for OBS window capture recognition
  useEffect(() => {
    const stageTitle = title || 'Livestream Stage';
    if (aspectRatio === '9:16') {
      document.title = `[Mobile 9:16] ${stageTitle}`;
    } else {
      document.title = `[Desktop 16:9] ${stageTitle}`;
    }
  }, [aspectRatio, title]);

  // Load initial state from cache if available
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STAGE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.rundownBlocks) setRundownBlocks(parsed.rundownBlocks);
        if (typeof parsed.activeSlideIndex === 'number') setActiveSlideIndex(parsed.activeSlideIndex);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.hubColor) setHubColor(parsed.hubColor);
        if (!lockedAspectRef.current && parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
        if (typeof parsed.isTransparent === 'boolean') setIsTransparent(parsed.isTransparent);
        setIsConnected(true);
      }
    } catch (e) {
      console.error('Failed to load stage cache:', e);
    }
  }, []);

  // Connect to BroadcastChannel for real-time synchronization with Control Pane & Teleprompter
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channelRef.current = channel;
      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'SYNC_STATE') {
          if (data.rundownBlocks) setRundownBlocks(data.rundownBlocks);
          if (typeof data.activeSlideIndex === 'number') setActiveSlideIndex(data.activeSlideIndex);
          if (data.title) setTitle(data.title);
          if (data.hubColor) setHubColor(data.hubColor);
          if (!lockedAspectRef.current && data.aspectRatio) setAspectRatio(data.aspectRatio);
          if (typeof data.isTransparent === 'boolean') setIsTransparent(data.isTransparent);
          setIsConnected(true);
        } else if (data.type === 'SET_SLIDE_INDEX') {
          if (typeof data.index === 'number') setActiveSlideIndex(data.index);
          setIsConnected(true);
        } else if (data.type === 'SET_ASPECT') {
          if (!lockedAspectRef.current && data.aspectRatio) {
            setAspectRatio(data.aspectRatio);
            try {
              if (typeof window !== 'undefined' && window.opener) {
                if (data.aspectRatio === '9:16') {
                  window.resizeTo(520, 920);
                } else {
                  window.resizeTo(1280, 750);
                }
              }
            } catch (err) {
              console.warn('Window resize constrained by browser:', err);
            }
          }
        } else if (data.type === 'SET_TRANSPARENT') {
          if (typeof data.isTransparent === 'boolean') setIsTransparent(data.isTransparent);
        }
      };

      // Ping control pane to request latest state
      channel.postMessage({ type: 'REQUEST_STATE' });
    } catch (e) {
      console.warn('BroadcastChannel not supported or error:', e);
    }

    return () => {
      channel?.close();
      channelRef.current = null;
    };
  }, [lockedAspect]);

  const navigateStage = useCallback(
    (direction: 'next' | 'prev') => {
      const total = rundownBlocks.length;
      if (total === 0) return;

      setActiveSlideIndex((prev) => {
        const nextIdx =
          direction === 'next'
            ? Math.min(total - 1, prev + 1)
            : Math.max(0, prev - 1);
        try {
          channelRef.current?.postMessage({
            type: 'SET_SLIDE_INDEX',
            index: nextIdx,
            keyLabel: direction === 'next' ? '→ Next Slide' : '← Prev Slide',
          });
        } catch {}
        return nextIdx;
      });
    },
    [rundownBlocks.length]
  );

  const handleToggleAspect = useCallback(() => {
    const nextAspect: SlideAspectRatio = aspectRatio === '16:9' ? '9:16' : '16:9';
    setAspectRatio(nextAspect);
    try {
      channelRef.current?.postMessage({ type: 'SET_ASPECT', aspectRatio: nextAspect });
      if (typeof window !== 'undefined') {
        if (nextAspect === '9:16') {
          window.resizeTo(540, 960);
        } else {
          window.resizeTo(1280, 760);
        }
      }
    } catch {}
  }, [aspectRatio]);

  const handleToggleTransparent = useCallback(() => {
    const nextTransparent = !isTransparent;
    setIsTransparent(nextTransparent);
    try {
      channelRef.current?.postMessage({ type: 'SET_TRANSPARENT', isTransparent: nextTransparent });
    } catch {}
  }, [isTransparent]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  }, []);

  // Unified Cross-Window Keyboard & Stream Deck Relay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        navigateStage('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        navigateStage('prev');
      } else if (e.key === ' ') {
        e.preventDefault();
        channelRef.current?.postMessage({
          type: 'PROMPTER_CONTROL',
          action: 'TOGGLE_PLAY',
          keyLabel: 'SPACE • Prompter Play/Pause',
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.shiftKey) {
          channelRef.current?.postMessage({
            type: 'PROMPTER_CONTROL',
            action: 'ADJUST_SPEED',
            delta: 0.2,
            keyLabel: 'SHIFT+↑ • Speed +',
          });
        } else {
          channelRef.current?.postMessage({
            type: 'PROMPTER_CONTROL',
            action: 'NUDGE_SCROLL',
            delta: -140,
            keyLabel: '↑ • Scroll Up',
          });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.shiftKey) {
          channelRef.current?.postMessage({
            type: 'PROMPTER_CONTROL',
            action: 'ADJUST_SPEED',
            delta: -0.2,
            keyLabel: 'SHIFT+↓ • Speed -',
          });
        } else {
          channelRef.current?.postMessage({
            type: 'PROMPTER_CONTROL',
            action: 'NUDGE_SCROLL',
            delta: 140,
            keyLabel: '↓ • Scroll Down',
          });
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        channelRef.current?.postMessage({
          type: 'PROMPTER_CONTROL',
          action: 'ADJUST_SPEED',
          delta: 0.2,
          keyLabel: '+ • Speed Up',
        });
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        channelRef.current?.postMessage({
          type: 'PROMPTER_CONTROL',
          action: 'ADJUST_SPEED',
          delta: -0.2,
          keyLabel: '- • Slow Down',
        });
      } else if (e.key === ']') {
        e.preventDefault();
        channelRef.current?.postMessage({
          type: 'PROMPTER_CONTROL',
          action: 'ADJUST_FONT_SIZE',
          delta: 4,
          keyLabel: '] • Font Size +',
        });
      } else if (e.key === '[') {
        e.preventDefault();
        channelRef.current?.postMessage({
          type: 'PROMPTER_CONTROL',
          action: 'ADJUST_FONT_SIZE',
          delta: -4,
          keyLabel: '[ • Font Size -',
        });
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        channelRef.current?.postMessage({
          type: 'PROMPTER_CONTROL',
          action: 'TOGGLE_MIRROR_X',
          keyLabel: 'M • Mirror Flip X',
        });
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        channelRef.current?.postMessage({
          type: 'STUDIO_COMMAND',
          action: 'TOGGLE_TIMER',
          keyLabel: 'R • Broadcast Timer',
        });
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleToggleTransparent();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleToggleAspect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateStage, toggleFullscreen, handleToggleTransparent, handleToggleAspect]);

  const currentItem = rundownBlocks[activeSlideIndex] || null;
  const isPortrait = aspectRatio === '9:16';

  const renderCurrentSlide = () => {
    if (!currentItem) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            textAlign: 'center',
            background: isTransparent ? 'transparent' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: '24px',
            border: isTransparent ? '1.5px dashed rgba(255,255,255,0.3)' : 'none',
          }}
        >
          <LiveIcon sx={{ fontSize: '4.5rem', color: hubColor, mb: 2, animation: 'pulse 2s infinite' }} />
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.02em' }}>
            {title || 'Broadcast Standby'}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.75)', maxWidth: 520, fontSize: '1.15rem' }}>
            Stage connected. Use Arrow Keys (← / →), Stream Deck, or the floating dock below to maneuver slides.
          </Typography>
        </Box>
      );
    }

    return renderSlidePreviewContent(currentItem, hubColor, {
      aspectRatio,
      isTransparent,
    });
  };

  return (
    <ThemeRegistry initialTenant="food" initialMode="dark">
      <GlobalStyles
        styles={{
          'html, body': {
            margin: '0 !important',
            padding: '0 !important',
            width: '100vw !important',
            height: '100vh !important',
            overflow: 'hidden !important',
            backgroundColor: isTransparent ? 'transparent !important' : '#f8fafc !important',
            boxSizing: 'border-box !important',
          },
          '#root, #__next': {
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
          },
        }}
      />
      <Box
        onMouseMove={triggerHudWake}
        onTouchStart={triggerHudWake}
        onDoubleClick={toggleFullscreen}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: isTransparent ? 'transparent' : '#f8fafc',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          m: 0,
          p: 0,
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        {/* Presentation Stage Surface */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            position: 'relative',
            m: 0,
            p: 0,
            overflow: 'hidden',
          }}
        >
          {renderCurrentSlide()}
        </Box>

        {/* ── AUTO-HIDING OVERSIZED FLOATING STUDIO HUD DOCK (FOR FAR SCREENS) ── */}
        <Box
          onMouseEnter={() => {
            if (hideHudTimeoutRef.current) clearTimeout(hideHudTimeoutRef.current);
            setShowHud(true);
          }}
          onMouseLeave={triggerHudWake}
          sx={{
            position: 'fixed',
            bottom: isPortrait ? 20 : 28,
            left: '50%',
            transform: `translateX(-50%) translateY(${showHud || Boolean(optionsAnchorEl) ? '0px' : '24px'})`,
            opacity: showHud || Boolean(optionsAnchorEl) ? 1 : 0,
            pointerEvents: showHud || Boolean(optionsAnchorEl) ? 'auto' : 'none',
            transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: isPortrait ? 1.25 : 2,
            px: isPortrait ? 2 : 2.75,
            py: isPortrait ? 1.25 : 1.5,
            borderRadius: '24px',
            bgcolor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Huge Prev Button */}
          <Button
            variant="contained"
            disabled={activeSlideIndex <= 0}
            onClick={() => navigateStage('prev')}
            startIcon={<PrevIcon sx={{ fontSize: '1.1rem !important' }} />}
            sx={{
              minHeight: isPortrait ? 48 : 54,
              minWidth: isPortrait ? 95 : 130,
              borderRadius: '16px',
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: isPortrait ? '0.92rem' : '1.02rem',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.22)' },
              '&:disabled': { opacity: 0.3, color: '#64748b' },
            }}
          >
            Prev
          </Button>

          {/* Big Slide Counter Pill */}
          <Box
            sx={{
              px: isPortrait ? 1.75 : 2.5,
              py: 1,
              borderRadius: '14px',
              bgcolor: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              textAlign: 'center',
              minWidth: isPortrait ? 85 : 120,
            }}
          >
            <Typography sx={{ fontSize: isPortrait ? '0.95rem' : '1.1rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
              {rundownBlocks.length > 0 ? `${activeSlideIndex + 1} / ${rundownBlocks.length}` : '0 / 0'}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {isPortrait ? '9:16 Portrait' : '16:9 Stage'}
            </Typography>
          </Box>

          {/* Huge Next Button */}
          <Button
            variant="contained"
            disabled={activeSlideIndex >= rundownBlocks.length - 1}
            onClick={() => navigateStage('next')}
            endIcon={<NextIcon sx={{ fontSize: '1.1rem !important' }} />}
            sx={{
              minHeight: isPortrait ? 48 : 54,
              minWidth: isPortrait ? 95 : 130,
              borderRadius: '16px',
              bgcolor: '#10b981',
              color: '#052e16',
              fontWeight: 900,
              fontSize: isPortrait ? '0.92rem' : '1.02rem',
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
              '&:hover': { bgcolor: '#059669', color: '#ffffff' },
              '&:disabled': { opacity: 0.3, bgcolor: 'rgba(255,255,255,0.08)', color: '#64748b' },
            }}
          >
            Next
          </Button>

          {/* Big Stage Options Dropdown Trigger */}
          <IconButton
            onClick={(e) => setOptionsAnchorEl(e.currentTarget)}
            sx={{
              width: isPortrait ? 48 : 54,
              height: isPortrait ? 48 : 54,
              borderRadius: '16px',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
            }}
          >
            <TuneIcon sx={{ fontSize: '1.4rem' }} />
          </IconButton>

          {/* Big Dropdown Menu for Stage Options */}
          <Menu
            anchorEl={optionsAnchorEl}
            open={Boolean(optionsAnchorEl)}
            onClose={() => setOptionsAnchorEl(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  mb: 1.5,
                  p: 1,
                  minWidth: 270,
                  borderRadius: '20px',
                  bgcolor: 'rgba(15, 23, 42, 0.96)',
                  backdropFilter: 'blur(24px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                toggleFullscreen();
                setOptionsAnchorEl(null);
              }}
              sx={{ py: 1.5, px: 2, borderRadius: '12px', gap: 1.5, fontWeight: 800, fontSize: '0.95rem' }}
            >
              {isFullscreen ? <FullscreenExitIcon sx={{ color: '#38bdf8' }} /> : <FullscreenIcon sx={{ color: '#38bdf8' }} />}
              {isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleToggleAspect();
                setOptionsAnchorEl(null);
              }}
              sx={{ py: 1.5, px: 2, borderRadius: '12px', gap: 1.5, fontWeight: 800, fontSize: '0.95rem' }}
            >
              {isPortrait ? <DesktopIcon sx={{ color: '#f472b6' }} /> : <MobileIcon sx={{ color: '#f472b6' }} />}
              {isPortrait ? 'Switch to 16:9 Landscape (A)' : 'Switch to 9:16 Portrait (A)'}
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleToggleTransparent();
                setOptionsAnchorEl(null);
              }}
              sx={{ py: 1.5, px: 2, borderRadius: '12px', gap: 1.5, fontWeight: 800, fontSize: '0.95rem' }}
            >
              <TransparencyIcon sx={{ color: isTransparent ? '#10b981' : '#94a3b8' }} />
              {isTransparent ? 'Disable OBS Alpha Overlay (T)' : 'Enable OBS Alpha Overlay (T)'}
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </ThemeRegistry>
  );
}
