'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, IconButton, Button, Chip, Tooltip, GlobalStyles } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Flip as FlipHorizontalIcon,
  SwapVert as FlipVerticalIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  SkipPrevious as PrevSlideIcon,
  SkipNext as NextSlideIcon,
  Speed as SpeedIcon,
  FormatSize as FontSizeIcon,
  VerticalAlignCenter as EyeLineIcon,
  Sensors as LiveIcon,
  AccessTime as AccessTimeIcon,
  Forum as ChatIcon,
  Bolt as CueIcon,
  ViewColumn as ColumnWidthIcon,
} from '@mui/icons-material';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { DEF_BLOCK_DEFINITIONS } from '@/app/modular-society/[tenant]/(authenticated)/components/forms/livestream/defBlocksConfig';

const SYNC_CHANNEL_NAME = 'livestream_presentation_sync';
const STAGE_CACHE_KEY = 'livestream_stage_cache';

/**
 * Synthesizes clean, natural fallback spoken talking points from slide content
 * if explicit speakerNotes have not yet been drafted for a slide.
 */
function buildFallbackScriptFromSlide(slide: any, idx: number): string {
  const oc = slide?.originalContent || {};
  const lines: string[] = [];

  const title = slide?.title || oc.title || oc.jobTitle || '';
  const sub = oc.subheadline || oc.subtitle || '';
  const stat = oc.stat || oc.metric || '';
  const text = oc.text || oc.body || '';

  if (title) {
    lines.push(`[INTRODUCE SLIDE ${idx + 1}] Let's focus on ${title}.`);
  }
  if (sub) {
    lines.push(sub);
  }
  if (stat) {
    lines.push(`[EMPHASIZE KEY METRIC: ${stat}] Look closely at this figure on screen: ${stat}.`);
  }
  if (text) {
    lines.push(text);
  }

  // Analytical & diagnostic fields from Phase 2 blocks
  if (oc.convention) {
    lines.push(`[LAYER 1: CONVENTION] On the surface, the conventional industry view says: ${oc.convention}`);
  }
  if (oc.ideal || oc.myth) {
    lines.push(`[CONTRAST THE IDEAL] The textbook prescription is: ${oc.ideal || oc.myth}`);
  }
  if (oc.reality) {
    lines.push(`[GROUND REALITY] However, on the ground in the corridor: ${oc.reality}`);
  }
  if (oc.workaround) {
    lines.push(`[THE WORKAROUND] Here is the feasible operational fix: ${oc.workaround}`);
  }
  if (oc.absorbedBy) {
    lines.push(`[WHO PAYS THE PRICE] Ultimately, this burden is absorbed by: ${oc.absorbedBy}`);
  }
  if (oc.pathA && oc.pathB) {
    lines.push(`[DIVERGING FUTURES] If we stay on Path A: ${oc.pathA} — But if we execute Path B: ${oc.pathB}`);
  }

  if (lines.length === 0) {
    return `[SLIDE ${idx + 1} CUE] Walk the audience through the core visual takeaway on stage before transitioning to the next point.`;
  }

  return lines.join('\n\n');
}

/**
 * Renders teleprompter text while visually separating [BRACKETED STAGE DIRECTIONS]
 * into high-contrast amber badges so the presenter never reads stage directions aloud.
 */
function renderPrompterScriptWithCues(rawScript: string, fontSize: number) {
  const paragraphs = rawScript.split(/\n+/).filter((p) => p.trim().length > 0);

  return paragraphs.map((para, pIdx) => {
    // Split paragraph by bracketed stage directions e.g. [PAUSE 2s], [LEAN FORWARD]
    const parts = para.split(/(\[[^\]]+\])/g).filter(Boolean);

    return (
      <Box
        key={pIdx}
        sx={{
          mb: `${Math.round(fontSize * 0.65)}px`,
          lineHeight: 1.48,
          letterSpacing: '-0.01em',
        }}
      >
        {parts.map((part, partIdx) => {
          const isBracketCue = part.startsWith('[') && part.endsWith(']');
          if (isBracketCue) {
            const cueContent = part.slice(1, -1).trim();
            return (
              <Box
                component="span"
                key={partIdx}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.35,
                  mx: 0.5,
                  my: 0.4,
                  borderRadius: '10px',
                  bgcolor: 'rgba(245, 158, 11, 0.18)',
                  border: '2px solid rgba(245, 158, 11, 0.65)',
                  color: '#fbbf24',
                  fontSize: `${Math.max(18, Math.round(fontSize * 0.58))}px`,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  verticalAlign: 'middle',
                  boxShadow: '0 0 18px rgba(245, 158, 11, 0.15)',
                }}
              >
                <CueIcon sx={{ fontSize: `${Math.max(18, Math.round(fontSize * 0.58))}px` }} />
                {cueContent}
              </Box>
            );
          }

          return (
            <Box
              component="span"
              key={partIdx}
              sx={{
                color: '#f8fafc',
                fontSize: `${fontSize}px`,
                fontWeight: 700,
                fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif',
              }}
            >
              {part}
            </Box>
          );
        })}
      </Box>
    );
  });
}

export default function LivestreamTeleprompterPage() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [rundownBlocks, setRundownBlocks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [hubColor, setHubColor] = useState('#10b981');
  const [isConnected, setIsConnected] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Teleprompter Optical & Ergonomic Controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.2); // 0.4x to 3.5x (~135 WPM at 1.2x)
  const [fontSize, setFontSize] = useState<number>(44); // px
  const [columnWidthPct, setColumnWidthPct] = useState<number>(68); // 50%, 68%, 85%
  const [mirrorX, setMirrorX] = useState<boolean>(false); // Horizontal flip for beamsplitter glass
  const [mirrorY, setMirrorY] = useState<boolean>(false); // Vertical flip for inverted rigs
  const [showEyeLine, setShowEyeLine] = useState<boolean>(true);
  const [autoFollowDeck, setAutoFollowDeck] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const slideSectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const subPixelAccumulatorRef = useRef<number>(0);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Set distinct window title
  useEffect(() => {
    document.title = `[Teleprompter] ${title || 'Live Broadcast'}`;
  }, [title]);

  // Broadcast current prompter status back to Director's Deck
  const broadcastPrompterStatus = useCallback(
    (overrides?: Partial<{ isPlaying: boolean; scrollSpeed: number; fontSize: number; mirrorX: boolean; mirrorY: boolean }>) => {
      try {
        if (channelRef.current) {
          channelRef.current.postMessage({
            type: 'PROMPTER_STATUS',
            isPlaying: overrides?.isPlaying ?? isPlaying,
            scrollSpeed: overrides?.scrollSpeed ?? scrollSpeed,
            fontSize: overrides?.fontSize ?? fontSize,
            mirrorX: overrides?.mirrorX ?? mirrorX,
            mirrorY: overrides?.mirrorY ?? mirrorY,
          });
        }
      } catch {}
    },
    [isPlaying, scrollSpeed, fontSize, mirrorX, mirrorY]
  );

  // Scroll smoothly to a specific slide section
  const scrollToSlide = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const targetEl = slideSectionRefs.current[index];
    const container = scrollContainerRef.current;
    if (targetEl && container) {
      isProgrammaticScrollRef.current = true;
      const eyeLineOffset = container.clientHeight * 0.26;
      const targetTop = Math.max(0, targetEl.offsetTop - eyeLineOffset);
      container.scrollTo({ top: targetTop, behavior });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 600);
    }
  }, []);

  // Load initial state from localStorage cache
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STAGE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.rundownBlocks) setRundownBlocks(parsed.rundownBlocks);
        if (typeof parsed.activeSlideIndex === 'number') setActiveSlideIndex(parsed.activeSlideIndex);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.hubColor) setHubColor(parsed.hubColor);
        if (typeof parsed.timerSeconds === 'number') setTimerSeconds(parsed.timerSeconds);
        if (typeof parsed.isTimerRunning === 'boolean') setIsTimerRunning(parsed.isTimerRunning);
        setIsConnected(true);
      }
    } catch (e) {
      console.error('Failed to load teleprompter cache:', e);
    }
  }, []);

  // Connect to BroadcastChannel for real-time two-way sync with Director's Deck
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
          if (typeof data.activeSlideIndex === 'number') {
            setActiveSlideIndex((prev) => {
              if (prev !== data.activeSlideIndex && autoFollowDeck) {
                setTimeout(() => scrollToSlide(data.activeSlideIndex), 50);
              }
              return data.activeSlideIndex;
            });
          }
          if (data.title) setTitle(data.title);
          if (data.hubColor) setHubColor(data.hubColor);
          if (typeof data.timerSeconds === 'number') setTimerSeconds(data.timerSeconds);
          if (typeof data.isTimerRunning === 'boolean') setIsTimerRunning(data.isTimerRunning);
          setIsConnected(true);
        } else if (data.type === 'SET_SLIDE_INDEX') {
          if (typeof data.index === 'number') {
            setActiveSlideIndex(data.index);
            if (autoFollowDeck) {
              scrollToSlide(data.index);
            }
          }
          setIsConnected(true);
        } else if (data.type === 'PROMPTER_CONTROL') {
          if (data.action === 'TOGGLE_PLAY') {
            setIsPlaying((prev) => {
              const next = typeof data.value === 'boolean' ? data.value : !prev;
              broadcastPrompterStatus({ isPlaying: next });
              return next;
            });
          } else if (data.action === 'SET_SPEED' && typeof data.value === 'number') {
            const clamped = Math.max(0.4, Math.min(3.5, Number(data.value.toFixed(1))));
            setScrollSpeed(clamped);
            broadcastPrompterStatus({ scrollSpeed: clamped });
          } else if (data.action === 'SET_FONT_SIZE' && typeof data.value === 'number') {
            const clamped = Math.max(24, Math.min(84, data.value));
            setFontSize(clamped);
            broadcastPrompterStatus({ fontSize: clamped });
          } else if (data.action === 'TOGGLE_MIRROR_X') {
            setMirrorX((prev) => {
              const next = typeof data.value === 'boolean' ? data.value : !prev;
              broadcastPrompterStatus({ mirrorX: next });
              return next;
            });
          } else if (data.action === 'TOGGLE_MIRROR_Y') {
            setMirrorY((prev) => {
              const next = typeof data.value === 'boolean' ? data.value : !prev;
              broadcastPrompterStatus({ mirrorY: next });
              return next;
            });
          } else if (data.action === 'SCROLL_TO_SLIDE' && typeof data.index === 'number') {
            scrollToSlide(data.index);
          } else if (data.action === 'NUDGE_SCROLL' && typeof data.delta === 'number') {
            scrollContainerRef.current?.scrollBy({ top: data.delta, behavior: 'smooth' });
          }
        }
      };

      // Request latest state from Director's Deck on open
      channel.postMessage({ type: 'REQUEST_STATE' });
    } catch (e) {
      console.warn('BroadcastChannel error in Teleprompter:', e);
    }

    return () => {
      channel?.close();
      channelRef.current = null;
    };
  }, [autoFollowDeck, scrollToSlide, broadcastPrompterStatus]);

  // Local timer tick if running
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

  // 60fps requestAnimationFrame Auto-Scroll Loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const container = scrollContainerRef.current;
      if (container) {
        // Base speed: ~48 pixels per second at 1.0x, scaled by fontSize ratio
        const fontFactor = fontSize / 44;
        const pixelsPerSecond = 48 * scrollSpeed * fontFactor;
        subPixelAccumulatorRef.current += pixelsPerSecond * dt;

        if (subPixelAccumulatorRef.current >= 1) {
          const wholePixels = Math.floor(subPixelAccumulatorRef.current);
          subPixelAccumulatorRef.current -= wholePixels;
          container.scrollTop += wholePixels;

          // Auto-pause if reached very bottom of script
          if (container.scrollTop + container.clientHeight >= container.scrollHeight - 4) {
            setIsPlaying(false);
            broadcastPrompterStatus({ isPlaying: false });
            return;
          }
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, scrollSpeed, fontSize, broadcastPrompterStatus]);

  // Navigate slide & sync back to Director's Deck + Stage windows
  const navigateSlide = useCallback(
    (direction: 'next' | 'prev' | number) => {
      const total = rundownBlocks.length;
      if (total === 0) return;

      let targetIdx = activeSlideIndex;
      if (typeof direction === 'number') {
        targetIdx = Math.max(0, Math.min(total - 1, direction));
      } else if (direction === 'next') {
        targetIdx = activeSlideIndex < total - 1 ? activeSlideIndex + 1 : activeSlideIndex;
      } else {
        targetIdx = activeSlideIndex > 0 ? activeSlideIndex - 1 : 0;
      }

      setActiveSlideIndex(targetIdx);
      scrollToSlide(targetIdx);

      try {
        if (channelRef.current) {
          if (typeof direction === 'string') {
            channelRef.current.postMessage({ type: 'NAVIGATE', direction });
          } else {
            channelRef.current.postMessage({ type: 'SET_SLIDE_INDEX', index: targetIdx });
          }
        }
      } catch {}
    },
    [activeSlideIndex, rundownBlocks.length, scrollToSlide]
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts for hands-free / foot-pedal / clicker operation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => {
          const next = !prev;
          broadcastPrompterStatus({ isPlaying: next });
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.shiftKey) {
          setScrollSpeed((s) => {
            const next = Math.min(3.5, Number((s + 0.2).toFixed(1)));
            broadcastPrompterStatus({ scrollSpeed: next });
            return next;
          });
        } else {
          scrollContainerRef.current?.scrollBy({ top: -120, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.shiftKey) {
          setScrollSpeed((s) => {
            const next = Math.max(0.4, Number((s - 0.2).toFixed(1)));
            broadcastPrompterStatus({ scrollSpeed: next });
            return next;
          });
        } else {
          scrollContainerRef.current?.scrollBy({ top: 120, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        navigateSlide('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        navigateSlide('prev');
      } else if (e.key === 'm' || e.key === 'M') {
        setMirrorX((prev) => {
          const next = !prev;
          broadcastPrompterStatus({ mirrorX: next });
          return next;
        });
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [broadcastPrompterStatus, navigateSlide, toggleFullscreen]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const estimatedWpm = Math.round(scrollSpeed * 115);

  const cycleColumnWidth = () => {
    setColumnWidthPct((prev) => (prev === 68 ? 52 : prev === 52 ? 84 : 68));
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
            backgroundColor: '#000000 !important',
            color: '#ffffff !important',
            boxSizing: 'border-box !important',
          },
          '*::-webkit-scrollbar': {
            width: '6px',
          },
          '*::-webkit-scrollbar-track': {
            background: '#050505',
          },
          '*::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.18)',
            borderRadius: '3px',
          },
        }}
      />

      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* ── TOP BROADCAST TELEPROMPTER HUD BAR ── */}
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 1.25,
            bgcolor: 'rgba(10, 10, 12, 0.92)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            zIndex: 30,
          }}
        >
          {/* Left: Connection Status, Clock & Slide Counter */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.4,
                borderRadius: '8px',
                bgcolor: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isConnected ? '#10b981' : '#f59e0b',
                  boxShadow: isConnected ? '0 0 8px #10b981' : 'none',
                }}
              />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>
                {isConnected ? 'STUDIO SYNC' : 'STANDBY'}
              </Typography>
            </Box>

            {/* Elapsed Timer */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.4,
                borderRadius: '8px',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, fontFamily: 'monospace', color: '#f8fafc' }}>
                {formatTimer(timerSeconds)}
              </Typography>
            </Box>

            {/* Slide Stepper */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => navigateSlide('prev')}
                disabled={activeSlideIndex <= 0}
                sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.06)', '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' } }}
              >
                <PrevSlideIcon fontSize="small" />
              </IconButton>
              <Chip
                label={`SLIDE ${rundownBlocks.length > 0 ? activeSlideIndex + 1 : 0} / ${rundownBlocks.length}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  borderRadius: '8px',
                }}
              />
              <IconButton
                size="small"
                onClick={() => navigateSlide('next')}
                disabled={activeSlideIndex >= rundownBlocks.length - 1}
                sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.06)', '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' } }}
              >
                <NextSlideIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Center: Auto-Scroll Play/Pause & Speed Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => {
                const next = !isPlaying;
                setIsPlaying(next);
                broadcastPrompterStatus({ isPlaying: next });
              }}
              startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
              sx={{
                borderRadius: '10px',
                px: 2.25,
                py: 0.6,
                fontWeight: 900,
                fontSize: '0.8rem',
                textTransform: 'none',
                bgcolor: isPlaying ? '#ef4444' : '#10b981',
                color: '#ffffff',
                boxShadow: isPlaying ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 0 20px rgba(16, 185, 129, 0.35)',
                '&:hover': { bgcolor: isPlaying ? '#dc2626' : '#059669' },
              }}
            >
              {isPlaying ? 'Pause Scroll (Space)' : 'Start Scroll (Space)'}
            </Button>

            {/* Speed Multiplier & WPM */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.3,
                borderRadius: '10px',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <SpeedIcon sx={{ fontSize: 16, color: '#fbbf24', ml: 0.5 }} />
              <IconButton
                size="small"
                onClick={() => {
                  const next = Math.max(0.4, Number((scrollSpeed - 0.2).toFixed(1)));
                  setScrollSpeed(next);
                  broadcastPrompterStatus({ scrollSpeed: next });
                }}
                sx={{ color: '#fff', p: 0.4 }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', lineHeight: 1 }}>−</Typography>
              </IconButton>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 900, color: '#fff', minWidth: 74, textAlign: 'center' }}>
                {scrollSpeed.toFixed(1)}x ({estimatedWpm} WPM)
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  const next = Math.min(3.5, Number((scrollSpeed + 0.2).toFixed(1)));
                  setScrollSpeed(next);
                  broadcastPrompterStatus({ scrollSpeed: next });
                }}
                sx={{ color: '#fff', p: 0.4 }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', lineHeight: 1 }}>+</Typography>
              </IconButton>
            </Box>

            {/* Font Size Control */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                px: 1,
                py: 0.3,
                borderRadius: '10px',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <FontSizeIcon sx={{ fontSize: 16, color: '#94a3b8', ml: 0.5 }} />
              <IconButton
                size="small"
                onClick={() => {
                  const next = Math.max(24, fontSize - 4);
                  setFontSize(next);
                  broadcastPrompterStatus({ fontSize: next });
                }}
                sx={{ color: '#fff', p: 0.4 }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: '0.75rem' }}>A−</Typography>
              </IconButton>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#e2e8f0', minWidth: 36, textAlign: 'center' }}>
                {fontSize}px
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  const next = Math.min(84, fontSize + 4);
                  setFontSize(next);
                  broadcastPrompterStatus({ fontSize: next });
                }}
                sx={{ color: '#fff', p: 0.4 }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: '0.75rem' }}>A+</Typography>
              </IconButton>
            </Box>
          </Box>

          {/* Right: Optical Mirroring, Column Width, Eye-Line & Fullscreen */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Tooltip title="Cycle eye-scan reading column width (Narrow 52% / Standard 68% / Wide 84%)">
              <Chip
                icon={<ColumnWidthIcon sx={{ fontSize: '14px !important', color: '#cbd5e1 !important' }} />}
                label={`${columnWidthPct}% Width`}
                size="small"
                onClick={cycleColumnWidth}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.07)',
                  color: '#e2e8f0',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              />
            </Tooltip>

            <Tooltip title="Toggle Camera Eye-Line Focus Guide">
              <IconButton
                size="small"
                onClick={() => setShowEyeLine(!showEyeLine)}
                sx={{
                  color: showEyeLine ? '#fbbf24' : '#64748b',
                  bgcolor: showEyeLine ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${showEyeLine ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '8px',
                }}
              >
                <EyeLineIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Horizontal Mirror (Flip X) for physical beamsplitter teleprompter glass (Shortcut: M)">
              <Button
                size="small"
                onClick={() => {
                  const next = !mirrorX;
                  setMirrorX(next);
                  broadcastPrompterStatus({ mirrorX: next });
                }}
                startIcon={<FlipHorizontalIcon sx={{ fontSize: '15px !important' }} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  px: 1.25,
                  py: 0.4,
                  color: mirrorX ? '#000' : '#fff',
                  bgcolor: mirrorX ? '#fbbf24' : 'rgba(255, 255, 255, 0.07)',
                  border: `1px solid ${mirrorX ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)'}`,
                  '&:hover': { bgcolor: mirrorX ? '#f59e0b' : 'rgba(255, 255, 255, 0.14)' },
                }}
              >
                Flip X {mirrorX ? 'ON' : ''}
              </Button>
            </Tooltip>

            <Tooltip title="Vertical Flip (Flip Y) for inverted teleprompter monitor mounts">
              <IconButton
                size="small"
                onClick={() => {
                  const next = !mirrorY;
                  setMirrorY(next);
                  broadcastPrompterStatus({ mirrorY: next });
                }}
                sx={{
                  color: mirrorY ? '#000' : '#cbd5e1',
                  bgcolor: mirrorY ? '#fbbf24' : 'rgba(255, 255, 255, 0.07)',
                  border: `1px solid ${mirrorY ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)'}`,
                  borderRadius: '8px',
                }}
              >
                <FlipVerticalIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Toggle Fullscreen (Shortcut: F)">
              <IconButton
                size="small"
                onClick={toggleFullscreen}
                sx={{
                  color: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.16)' },
                }}
              >
                {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── MAIN OPTICAL TELEPROMPTER VIEWPORT (WITH MIRROR TRANSFORMS) ── */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#000000',
            transform: `${mirrorX ? 'scaleX(-1)' : ''} ${mirrorY ? 'scaleY(-1)' : ''}`.trim() || 'none',
            transition: 'transform 0.25s ease',
          }}
        >
          {/* Top & Bottom Optical Vignette Shades to keep eyes locked on the reading zone */}
          {showEyeLine && (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '22%',
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0) 100%)',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '38%',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 100%)',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />

              {/* Fixed Eye-Line Reading Sweet-Spot Bar at 30% height */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '30%',
                  left: 0,
                  right: 0,
                  height: `${Math.round(fontSize * 1.65)}px`,
                  transform: 'translateY(-35%)',
                  borderTop: '1.5px solid rgba(251, 191, 36, 0.28)',
                  borderBottom: '1.5px solid rgba(251, 191, 36, 0.28)',
                  bgcolor: 'rgba(251, 191, 36, 0.03)',
                  pointerEvents: 'none',
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: { xs: 1.5, md: 3 },
                }}
              >
                <Typography
                  sx={{
                    color: '#fbbf24',
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    textShadow: '0 0 16px rgba(251, 191, 36, 0.8)',
                  }}
                >
                  ▶
                </Typography>
                <Typography
                  sx={{
                    color: '#fbbf24',
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    textShadow: '0 0 16px rgba(251, 191, 36, 0.8)',
                  }}
                >
                  ◀
                </Typography>
              </Box>
            </>
          )}

          {/* ── SCROLLABLE SCRIPT CANVAS ── */}
          <Box
            ref={scrollContainerRef}
            sx={{
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: '26vh',
              pb: '65vh',
            }}
          >
            <Box
              sx={{
                width: `${columnWidthPct}%`,
                maxWidth: 1200,
                transition: 'width 0.25s ease',
              }}
            >
              {rundownBlocks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 12 }}>
                  <LiveIcon sx={{ fontSize: '4rem', color: hubColor, mb: 2 }} />
                  <Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', mb: 1.5 }}>
                    {title || 'Teleprompter Ready'}
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: 640, mx: 'auto' }}>
                    Waiting for slide rundown from your Director&apos;s Deck. Load a presentation framework in the Livestream Studio to populate your teleprompter script.
                  </Typography>
                </Box>
              ) : (
                rundownBlocks.map((slide, idx) => {
                  const isCurrentSlide = idx === activeSlideIndex;
                  const defInfo = slide.defBlockId ? DEF_BLOCK_DEFINITIONS[slide.defBlockId] : null;
                  const slideTitle =
                    slide.title ||
                    slide.originalContent?.title ||
                    slide.originalContent?.jobTitle ||
                    defInfo?.name ||
                    `Slide ${idx + 1}`;
                  const actLabel = slide.act || defInfo?.act || 'SEGMENT';
                  const blockColor = defInfo?.themeColor || hubColor;

                  const scriptText =
                    slide.speakerNotes && slide.speakerNotes.trim().length > 0
                      ? slide.speakerNotes
                      : buildFallbackScriptFromSlide(slide, idx);

                  return (
                    <Box
                      key={slide.id || idx}
                      ref={(el: HTMLDivElement | null) => {
                        slideSectionRefs.current[idx] = el;
                      }}
                      sx={{
                        mb: 8,
                        pb: 6,
                        borderBottom: '2px dashed rgba(255, 255, 255, 0.14)',
                        opacity: isCurrentSlide ? 1 : 0.72,
                        transition: 'opacity 0.25s ease',
                      }}
                    >
                      {/* Slide Boundary Header Bar */}
                      <Box
                        onClick={() => navigateSlide(idx)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1.5,
                          p: 2,
                          mb: 3.5,
                          borderRadius: '16px',
                          bgcolor: isCurrentSlide ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.05)',
                          border: `2px solid ${isCurrentSlide ? '#10b981' : 'rgba(255, 255, 255, 0.12)'}`,
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: '#10b981',
                            bgcolor: 'rgba(16, 185, 129, 0.18)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Chip
                            label={`SLIDE ${idx + 1} OF ${rundownBlocks.length}`}
                            sx={{
                              bgcolor: isCurrentSlide ? '#10b981' : '#334155',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '0.85rem',
                              height: 30,
                              borderRadius: '8px',
                            }}
                          />
                          <Chip
                            label={`ACT: ${actLabel}`}
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                              color: blockColor,
                              fontWeight: 900,
                              fontSize: '0.8rem',
                              height: 30,
                              borderRadius: '8px',
                              border: `1.5px solid ${blockColor}`,
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: `${Math.max(20, Math.round(fontSize * 0.55))}px`,
                              fontWeight: 900,
                              color: '#ffffff',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {slideTitle}
                          </Typography>
                        </Box>

                        {slide.durationStr && (
                          <Chip
                            label={`⏱️ Target: ${slide.durationStr}`}
                            sx={{
                              bgcolor: 'rgba(251, 191, 36, 0.14)',
                              color: '#fbbf24',
                              fontWeight: 900,
                              fontSize: '0.82rem',
                              height: 30,
                              borderRadius: '8px',
                              border: '1px solid rgba(251, 191, 36, 0.4)',
                            }}
                          />
                        )}
                      </Box>

                      {/* Main Spoken Teleprompter Script with Highlighted [STAGE DIRECTIONS] */}
                      <Box sx={{ px: { xs: 1, md: 2 } }}>{renderPrompterScriptWithCues(scriptText, fontSize)}</Box>

                      {/* Audience Chat / Discussion Prompt Callout */}
                      {slide.originalContent?.description && (
                        <Box
                          sx={{
                            mt: 3.5,
                            p: 2.5,
                            borderRadius: '16px',
                            bgcolor: 'rgba(6, 182, 212, 0.12)',
                            border: '2px solid rgba(6, 182, 212, 0.45)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 2,
                          }}
                        >
                          <ChatIcon sx={{ color: '#22d3ee', fontSize: `${Math.max(24, Math.round(fontSize * 0.65))}px`, mt: 0.4 }} />
                          <Box>
                            <Typography
                              sx={{
                                fontSize: '0.85rem',
                                fontWeight: 900,
                                color: '#22d3ee',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                mb: 0.5,
                              }}
                            >
                              💬 Ask The Live Audience / Chat Callout
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: `${Math.max(22, Math.round(fontSize * 0.72))}px`,
                                fontWeight: 800,
                                color: '#ecfeff',
                                lineHeight: 1.4,
                              }}
                            >
                              &ldquo;{slide.originalContent.description}&rdquo;
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeRegistry>
  );
}
