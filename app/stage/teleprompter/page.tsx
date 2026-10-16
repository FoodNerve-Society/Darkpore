'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Popover,
  GlobalStyles,
} from '@mui/material';
import {
  PlayArrowRounded as PlayIcon,
  PauseRounded as PauseIcon,
  FlipRounded as FlipHorizontalIcon,
  SwapVertRounded as FlipVerticalIcon,
  FullscreenRounded as FullscreenIcon,
  FullscreenExitRounded as FullscreenExitIcon,
  ChevronLeftRounded as PrevSlideIcon,
  ChevronRightRounded as NextSlideIcon,
  SpeedRounded as SpeedIcon,
  VerticalAlignCenterRounded as EyeLineIcon,
  SensorsRounded as LiveIcon,
  AccessTimeRounded as AccessTimeIcon,
  ForumRounded as ChatIcon,
  BoltRounded as CueIcon,
  TuneRounded as OpticsIcon,
  KeyboardArrowDownRounded as ArrowDownIcon,
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
    const parts = para.split(/(\[[^\]]+\])/g).filter(Boolean);

    return (
      <Box
        key={pIdx}
        sx={{
          mb: `${Math.round(fontSize * 0.62)}px`,
          lineHeight: 1.5,
          letterSpacing: '-0.015em',
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
                  gap: 0.65,
                  px: 1.5,
                  py: 0.35,
                  mx: 0.45,
                  my: 0.35,
                  borderRadius: '10px',
                  bgcolor: 'rgba(245, 158, 11, 0.16)',
                  border: '1.5px solid rgba(245, 158, 11, 0.6)',
                  color: '#fbbf24',
                  fontSize: `${Math.max(18, Math.round(fontSize * 0.52))}px`,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  verticalAlign: 'middle',
                }}
              >
                <CueIcon sx={{ fontSize: `${Math.max(18, Math.round(fontSize * 0.52))}px` }} />
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
                fontWeight: 600,
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
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.2);
  const [fontSize, setFontSize] = useState<number>(48);
  const [columnWidthPct, setColumnWidthPct] = useState<number>(68);
  const [mirrorX, setMirrorX] = useState<boolean>(false);
  const [mirrorY, setMirrorY] = useState<boolean>(false);
  const [showEyeLine, setShowEyeLine] = useState<boolean>(true);
  const [autoFollowDeck, setAutoFollowDeck] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Studio Dropdown Popovers
  const [speedAnchorEl, setSpeedAnchorEl] = useState<null | HTMLElement>(null);
  const [opticsAnchorEl, setOpticsAnchorEl] = useState<null | HTMLElement>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const slideSectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const subPixelAccumulatorRef = useRef<number>(0);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    document.title = `[Teleprompter] ${title || 'Live Broadcast'}`;
  }, [title]);

  const broadcastPrompterStatus = useCallback(
    (
      overrides?: Partial<{
        isPlaying: boolean;
        scrollSpeed: number;
        fontSize: number;
        mirrorX: boolean;
        mirrorY: boolean;
        keyLabel?: string;
      }>
    ) => {
      try {
        if (channelRef.current) {
          channelRef.current.postMessage({
            type: 'PROMPTER_STATUS',
            isPlaying: overrides?.isPlaying ?? isPlaying,
            scrollSpeed: overrides?.scrollSpeed ?? scrollSpeed,
            fontSize: overrides?.fontSize ?? fontSize,
            mirrorX: overrides?.mirrorX ?? mirrorX,
            mirrorY: overrides?.mirrorY ?? mirrorY,
            keyLabel: overrides?.keyLabel,
          });
        }
      } catch {}
    },
    [isPlaying, scrollSpeed, fontSize, mirrorX, mirrorY]
  );

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
              broadcastPrompterStatus({ isPlaying: next, keyLabel: data.keyLabel });
              return next;
            });
          } else if (data.action === 'SET_SPEED' && typeof data.value === 'number') {
            const clamped = Math.max(0.4, Math.min(3.5, Number(data.value.toFixed(1))));
            setScrollSpeed(clamped);
            broadcastPrompterStatus({ scrollSpeed: clamped, keyLabel: data.keyLabel });
          } else if (data.action === 'ADJUST_SPEED' && typeof data.delta === 'number') {
            setScrollSpeed((prev) => {
              const clamped = Math.max(0.4, Math.min(3.5, Number((prev + data.delta).toFixed(1))));
              broadcastPrompterStatus({ scrollSpeed: clamped, keyLabel: data.keyLabel });
              return clamped;
            });
          } else if (data.action === 'SET_FONT_SIZE' && typeof data.value === 'number') {
            const clamped = Math.max(28, Math.min(88, data.value));
            setFontSize(clamped);
            broadcastPrompterStatus({ fontSize: clamped, keyLabel: data.keyLabel });
          } else if (data.action === 'ADJUST_FONT_SIZE' && typeof data.delta === 'number') {
            setFontSize((prev) => {
              const clamped = Math.max(28, Math.min(88, prev + data.delta));
              broadcastPrompterStatus({ fontSize: clamped, keyLabel: data.keyLabel });
              return clamped;
            });
          } else if (data.action === 'TOGGLE_MIRROR_X') {
            setMirrorX((prev) => {
              const next = typeof data.value === 'boolean' ? data.value : !prev;
              broadcastPrompterStatus({ mirrorX: next, keyLabel: data.keyLabel });
              return next;
            });
          } else if (data.action === 'TOGGLE_MIRROR_Y') {
            setMirrorY((prev) => {
              const next = typeof data.value === 'boolean' ? data.value : !prev;
              broadcastPrompterStatus({ mirrorY: next, keyLabel: data.keyLabel });
              return next;
            });
          } else if (data.action === 'SCROLL_TO_SLIDE' && typeof data.index === 'number') {
            scrollToSlide(data.index);
          } else if (data.action === 'NUDGE_SCROLL' && typeof data.delta === 'number') {
            scrollContainerRef.current?.scrollBy({ top: data.delta, behavior: 'smooth' });
            if (data.keyLabel) {
              broadcastPrompterStatus({ keyLabel: data.keyLabel });
            }
          }
        }
      };

      channel.postMessage({ type: 'REQUEST_STATE' });
    } catch (e) {
      console.warn('BroadcastChannel error in Teleprompter:', e);
    }

    return () => {
      channel?.close();
      channelRef.current = null;
    };
  }, [autoFollowDeck, scrollToSlide, broadcastPrompterStatus]);

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
        const fontFactor = fontSize / 44;
        const pixelsPerSecond = 48 * scrollSpeed * fontFactor;
        subPixelAccumulatorRef.current += pixelsPerSecond * dt;

        if (subPixelAccumulatorRef.current >= 1) {
          const wholePixels = Math.floor(subPixelAccumulatorRef.current);
          subPixelAccumulatorRef.current -= wholePixels;
          container.scrollTop += wholePixels;

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
          channelRef.current.postMessage({
            type: 'SET_SLIDE_INDEX',
            index: targetIdx,
            keyLabel: direction === 'next' ? '→ Next Slide' : direction === 'prev' ? '← Prev Slide' : `Slide ${targetIdx + 1}`,
          });
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

  // Unified Studio Keyboard & Stream Deck Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => {
          const next = !prev;
          broadcastPrompterStatus({ isPlaying: next, keyLabel: 'SPACE • Play/Pause' });
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.shiftKey) {
          setScrollSpeed((s) => {
            const next = Math.min(3.5, Number((s + 0.2).toFixed(1)));
            broadcastPrompterStatus({ scrollSpeed: next, keyLabel: 'SHIFT+↑ • Speed +' });
            return next;
          });
        } else {
          scrollContainerRef.current?.scrollBy({ top: -140, behavior: 'smooth' });
          broadcastPrompterStatus({ keyLabel: '↑ • Scroll Up' });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.shiftKey) {
          setScrollSpeed((s) => {
            const next = Math.max(0.4, Number((s - 0.2).toFixed(1)));
            broadcastPrompterStatus({ scrollSpeed: next, keyLabel: 'SHIFT+↓ • Speed -' });
            return next;
          });
        } else {
          scrollContainerRef.current?.scrollBy({ top: 140, behavior: 'smooth' });
          broadcastPrompterStatus({ keyLabel: '↓ • Scroll Down' });
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setScrollSpeed((s) => {
          const next = Math.min(3.5, Number((s + 0.2).toFixed(1)));
          broadcastPrompterStatus({ scrollSpeed: next, keyLabel: '+ • Speed Up' });
          return next;
        });
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setScrollSpeed((s) => {
          const next = Math.max(0.4, Number((s - 0.2).toFixed(1)));
          broadcastPrompterStatus({ scrollSpeed: next, keyLabel: '- • Slow Down' });
          return next;
        });
      } else if (e.key === ']') {
        e.preventDefault();
        setFontSize((f) => {
          const next = Math.min(88, f + 4);
          broadcastPrompterStatus({ fontSize: next, keyLabel: '] • Font +' });
          return next;
        });
      } else if (e.key === '[') {
        e.preventDefault();
        setFontSize((f) => {
          const next = Math.max(28, f - 4);
          broadcastPrompterStatus({ fontSize: next, keyLabel: '[ • Font -' });
          return next;
        });
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        navigateSlide('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        navigateSlide('prev');
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMirrorX((prev) => {
          const next = !prev;
          broadcastPrompterStatus({ mirrorX: next, keyLabel: 'M • Flip X' });
          return next;
        });
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        channelRef.current?.postMessage({
          type: 'STUDIO_COMMAND',
          action: 'TOGGLE_TIMER',
          keyLabel: 'R • Timer',
        });
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
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
            background: 'rgba(255, 255, 255, 0.2)',
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
        {/* ── STUDIO CONSOLE TOP BAR ── */}
        <Box
          sx={{
            px: { xs: 2, md: 3.5 },
            py: 1.35,
            bgcolor: 'rgba(9, 13, 22, 0.92)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            zIndex: 30,
          }}
        >
          {/* Left: Clean Prev / Slide Counter & Clock / Next */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Button
              variant="contained"
              onClick={() => navigateSlide('prev')}
              disabled={activeSlideIndex <= 0}
              startIcon={<PrevSlideIcon sx={{ fontSize: '1.35rem !important' }} />}
              sx={{
                minHeight: 46,
                px: 2,
                borderRadius: '14px',
                bgcolor: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.92rem',
                textTransform: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' },
                '&:disabled': { opacity: 0.25, color: '#64748b' },
              }}
            >
              Prev
            </Button>

            <Box
              sx={{
                px: 2,
                py: 0.7,
                borderRadius: '14px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isConnected ? '#10b981' : '#f59e0b',
                    boxShadow: isConnected ? '0 0 10px #10b981' : 'none',
                  }}
                />
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: '#ffffff' }}>
                  {String(rundownBlocks.length > 0 ? activeSlideIndex + 1 : 0).padStart(2, '0')} / {String(rundownBlocks.length).padStart(2, '0')}
                </Typography>
              </Box>
              <Box sx={{ width: '1px', height: 18, bgcolor: 'rgba(255,255,255,0.14)' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: '#e2e8f0' }}>
                  {formatTimer(timerSeconds)}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={() => navigateSlide('next')}
              disabled={activeSlideIndex >= rundownBlocks.length - 1}
              endIcon={<NextSlideIcon sx={{ fontSize: '1.35rem !important' }} />}
              sx={{
                minHeight: 46,
                px: 2,
                borderRadius: '14px',
                bgcolor: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.92rem',
                textTransform: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' },
                '&:disabled': { opacity: 0.25, color: '#64748b' },
              }}
            >
              Next
            </Button>
          </Box>

          {/* Center: Sculptural Start / Pause Scroll Pill */}
          <Button
            variant="contained"
            onClick={() => {
              const next = !isPlaying;
              setIsPlaying(next);
              broadcastPrompterStatus({ isPlaying: next });
            }}
            startIcon={isPlaying ? <PauseIcon sx={{ fontSize: '1.4rem !important' }} /> : <PlayIcon sx={{ fontSize: '1.4rem !important' }} />}
            sx={{
              minHeight: 48,
              px: 3.5,
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              bgcolor: isPlaying ? '#ef4444' : '#10b981',
              color: isPlaying ? '#ffffff' : '#052e16',
              boxShadow: isPlaying ? '0 0 24px rgba(239, 68, 68, 0.4)' : '0 0 24px rgba(16, 185, 129, 0.35)',
              '&:hover': { bgcolor: isPlaying ? '#dc2626' : '#059669', color: '#ffffff' },
            }}
          >
            {isPlaying ? 'Pause Scroll' : 'Start Scroll'}
          </Button>

          {/* Right: Two Clean Studio Dropdowns + Fullscreen */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={(e) => setSpeedAnchorEl(e.currentTarget)}
              startIcon={<SpeedIcon sx={{ color: '#fbbf24', fontSize: '1.15rem !important' }} />}
              endIcon={<ArrowDownIcon />}
              sx={{
                minHeight: 46,
                px: 2,
                borderRadius: '14px',
                borderColor: 'rgba(255, 255, 255, 0.16)',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.3)' },
              }}
            >
              {scrollSpeed.toFixed(1)}x • {fontSize}px
            </Button>

            <Button
              variant="outlined"
              onClick={(e) => setOpticsAnchorEl(e.currentTarget)}
              startIcon={<OpticsIcon sx={{ color: mirrorX || mirrorY ? '#0f172a' : '#38bdf8', fontSize: '1.15rem !important' }} />}
              endIcon={<ArrowDownIcon />}
              sx={{
                minHeight: 46,
                px: 2,
                borderRadius: '14px',
                borderColor: mirrorX || mirrorY ? '#fbbf24' : 'rgba(255, 255, 255, 0.16)',
                bgcolor: mirrorX || mirrorY ? '#fbbf24' : 'rgba(255, 255, 255, 0.05)',
                color: mirrorX || mirrorY ? '#0f172a' : '#ffffff',
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: mirrorX || mirrorY ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)',
                  borderColor: '#fbbf24',
                },
              }}
            >
              {mirrorX ? 'Mirror X' : mirrorY ? 'Mirror Y' : 'Optics'}
            </Button>

            <IconButton
              onClick={toggleFullscreen}
              sx={{
                width: 46,
                height: 46,
                color: '#ffffff',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '14px',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.14)' },
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* ── STUDIO POPOVER 1: SPEED & FONT SIZE ── */}
        <Popover
          open={Boolean(speedAnchorEl)}
          anchorEl={speedAnchorEl}
          onClose={() => setSpeedAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.25,
                p: 2.5,
                width: 340,
                borderRadius: '22px',
                bgcolor: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
              },
            },
          }}
        >
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.25 }}>
            Scroll Speed ({estimatedWpm} WPM)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => {
                const next = Math.max(0.4, Number((scrollSpeed - 0.2).toFixed(1)));
                setScrollSpeed(next);
                broadcastPrompterStatus({ scrollSpeed: next });
              }}
              sx={{ minHeight: 46, minWidth: 68, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', fontSize: '1.25rem', fontWeight: 800 }}
            >
              −
            </Button>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: '#fbbf24' }}>
              {scrollSpeed.toFixed(1)}x
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                const next = Math.min(3.5, Number((scrollSpeed + 0.2).toFixed(1)));
                setScrollSpeed(next);
                broadcastPrompterStatus({ scrollSpeed: next });
              }}
              sx={{ minHeight: 46, minWidth: 68, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', fontSize: '1.25rem', fontWeight: 800 }}
            >
              +
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 2.5 }}>
            {[0.8, 1.2, 1.6, 2.2].map((preset) => (
              <Button
                key={preset}
                variant={scrollSpeed === preset ? 'contained' : 'outlined'}
                onClick={() => {
                  setScrollSpeed(preset);
                  broadcastPrompterStatus({ scrollSpeed: preset });
                }}
                sx={{
                  py: 0.85,
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  bgcolor: scrollSpeed === preset ? '#fbbf24' : 'transparent',
                  color: scrollSpeed === preset ? '#0f172a' : '#e2e8f0',
                  borderColor: 'rgba(255,255,255,0.16)',
                }}
              >
                {preset}x
              </Button>
            ))}
          </Box>

          <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.25 }}>
            Script Text Size
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => {
                const next = Math.max(28, fontSize - 4);
                setFontSize(next);
                broadcastPrompterStatus({ fontSize: next });
              }}
              sx={{ minHeight: 46, minWidth: 68, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', fontSize: '1rem', fontWeight: 800 }}
            >
              A−
            </Button>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8' }}>
              {fontSize}px
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                const next = Math.min(88, fontSize + 4);
                setFontSize(next);
                broadcastPrompterStatus({ fontSize: next });
              }}
              sx={{ minHeight: 46, minWidth: 68, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', fontSize: '1rem', fontWeight: 800 }}
            >
              A+
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {[36, 48, 60, 76].map((sizePreset) => (
              <Button
                key={sizePreset}
                variant={fontSize === sizePreset ? 'contained' : 'outlined'}
                onClick={() => {
                  setFontSize(sizePreset);
                  broadcastPrompterStatus({ fontSize: sizePreset });
                }}
                sx={{
                  py: 0.85,
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  bgcolor: fontSize === sizePreset ? '#38bdf8' : 'transparent',
                  color: fontSize === sizePreset ? '#0f172a' : '#e2e8f0',
                  borderColor: 'rgba(255,255,255,0.16)',
                }}
              >
                {sizePreset}px
              </Button>
            ))}
          </Box>
        </Popover>

        {/* ── STUDIO POPOVER 2: OPTICS, MIRRORING & RIG WIDTH ── */}
        <Popover
          open={Boolean(opticsAnchorEl)}
          anchorEl={opticsAnchorEl}
          onClose={() => setOpticsAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.25,
                p: 2.5,
                width: 340,
                borderRadius: '22px',
                bgcolor: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              },
            },
          }}
        >
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Optical Beamsplitter & Rig
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              const next = !mirrorX;
              setMirrorX(next);
              broadcastPrompterStatus({ mirrorX: next });
            }}
            startIcon={<FlipHorizontalIcon />}
            sx={{
              minHeight: 48,
              justifyContent: 'flex-start',
              px: 2,
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.92rem',
              textTransform: 'none',
              bgcolor: mirrorX ? '#fbbf24' : 'rgba(255,255,255,0.08)',
              color: mirrorX ? '#0f172a' : '#ffffff',
              '&:hover': { bgcolor: mirrorX ? '#f59e0b' : 'rgba(255,255,255,0.14)' },
            }}
          >
            Flip Horizontal (M): {mirrorX ? 'ON' : 'OFF'}
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              const next = !mirrorY;
              setMirrorY(next);
              broadcastPrompterStatus({ mirrorY: next });
            }}
            startIcon={<FlipVerticalIcon />}
            sx={{
              minHeight: 48,
              justifyContent: 'flex-start',
              px: 2,
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.92rem',
              textTransform: 'none',
              bgcolor: mirrorY ? '#fbbf24' : 'rgba(255,255,255,0.08)',
              color: mirrorY ? '#0f172a' : '#ffffff',
              '&:hover': { bgcolor: mirrorY ? '#f59e0b' : 'rgba(255,255,255,0.14)' },
            }}
          >
            Flip Vertical: {mirrorY ? 'ON' : 'OFF'}
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowEyeLine(!showEyeLine)}
            startIcon={<EyeLineIcon />}
            sx={{
              minHeight: 48,
              justifyContent: 'flex-start',
              px: 2,
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.92rem',
              textTransform: 'none',
              bgcolor: showEyeLine ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255,255,255,0.08)',
              color: showEyeLine ? '#34d399' : '#ffffff',
              border: showEyeLine ? '1px solid rgba(16, 185, 129, 0.45)' : 'none',
            }}
          >
            Eye-Line Focus Bar: {showEyeLine ? 'ON' : 'OFF'}
          </Button>

          <Box sx={{ pt: 0.75 }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
              Reading Column Width
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {[
                { pct: 52, label: '52%' },
                { pct: 68, label: '68%' },
                { pct: 84, label: '84%' },
              ].map((col) => (
                <Button
                  key={col.pct}
                  variant={columnWidthPct === col.pct ? 'contained' : 'outlined'}
                  onClick={() => setColumnWidthPct(col.pct)}
                  sx={{
                    py: 0.9,
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    textTransform: 'none',
                    bgcolor: columnWidthPct === col.pct ? '#10b981' : 'transparent',
                    color: columnWidthPct === col.pct ? '#052e16' : '#e2e8f0',
                    borderColor: 'rgba(255,255,255,0.16)',
                  }}
                >
                  {col.label}
                </Button>
              ))}
            </Box>
          </Box>
        </Popover>

        {/* ── MAIN OPTICAL TELEPROMPTER VIEWPORT ── */}
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
          {showEyeLine && (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '22%',
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
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

              {/* Precision Laser Eye-Line Focus Guide at 30% height */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '30%',
                  left: 0,
                  right: 0,
                  height: `${Math.round(fontSize * 1.65)}px`,
                  transform: 'translateY(-35%)',
                  borderTop: '1px solid rgba(251, 191, 36, 0.3)',
                  borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
                  bgcolor: 'rgba(251, 191, 36, 0.03)',
                  pointerEvents: 'none',
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: { xs: 2, md: 4 },
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: '65%',
                    borderRadius: '4px',
                    bgcolor: '#fbbf24',
                    boxShadow: '0 0 16px rgba(251, 191, 36, 0.85)',
                  }}
                />
                <Box
                  sx={{
                    width: 6,
                    height: '65%',
                    borderRadius: '4px',
                    bgcolor: '#fbbf24',
                    boxShadow: '0 0 16px rgba(251, 191, 36, 0.85)',
                  }}
                />
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
                  <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', mb: 1.5 }}>
                    {title || 'Teleprompter Standby'}
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: 600, mx: 'auto' }}>
                    Load a broadcast framework in your Director&apos;s Deck to populate your live script.
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
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        opacity: isCurrentSlide ? 1 : 0.65,
                        transition: 'opacity 0.25s ease',
                      }}
                    >
                      {/* Studio Slate Slide Header */}
                      <Box
                        onClick={() => navigateSlide(idx)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1.5,
                          px: 2.5,
                          py: 1.75,
                          mb: 3.5,
                          borderRadius: '16px',
                          bgcolor: isCurrentSlide ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderLeft: `4px solid ${isCurrentSlide ? '#10b981' : blockColor}`,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography
                            sx={{
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              color: isCurrentSlide ? '#34d399' : '#94a3b8',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {String(idx + 1).padStart(2, '0')} / {String(rundownBlocks.length).padStart(2, '0')}
                          </Typography>
                          <Chip
                            label={actLabel}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                              color: '#e2e8f0',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              height: 26,
                              borderRadius: '7px',
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: `${Math.max(20, Math.round(fontSize * 0.5))}px`,
                              fontWeight: 800,
                              color: '#ffffff',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {slideTitle}
                          </Typography>
                        </Box>

                        {slide.durationStr && (
                          <Chip
                            label={slide.durationStr}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(251, 191, 36, 0.14)',
                              color: '#fbbf24',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              height: 28,
                              borderRadius: '8px',
                            }}
                          />
                        )}
                      </Box>

                      {/* Main Spoken Teleprompter Script */}
                      <Box sx={{ px: { xs: 1, md: 2 } }}>{renderPrompterScriptWithCues(scriptText, fontSize)}</Box>

                      {/* Audience Chat Callout */}
                      {slide.originalContent?.description && (
                        <Box
                          sx={{
                            mt: 3.5,
                            p: 2.5,
                            borderRadius: '16px',
                            bgcolor: 'rgba(56, 189, 248, 0.08)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.75,
                          }}
                        >
                          <ChatIcon sx={{ color: '#38bdf8', fontSize: `${Math.max(24, Math.round(fontSize * 0.6))}px`, mt: 0.3 }} />
                          <Box>
                            <Typography
                              sx={{
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                color: '#38bdf8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                mb: 0.4,
                              }}
                            >
                              Audience Prompt
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: `${Math.max(22, Math.round(fontSize * 0.68))}px`,
                                fontWeight: 700,
                                color: '#f0f9ff',
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
