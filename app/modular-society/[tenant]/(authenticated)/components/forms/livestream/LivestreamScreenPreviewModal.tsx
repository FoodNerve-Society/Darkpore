'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Menu,
  MenuItem,
  Popover,
} from '@mui/material';
import { alpha } from '@mui/system';
import {
  Close as CloseIcon,
  PlayArrowRounded as PlayIcon,
  PauseRounded as PauseIcon,
  ChevronLeftRounded as PrevIcon,
  ChevronRightRounded as NextIcon,
  OpenInNewRounded as OpenInNewIcon,
  AccessTimeRounded as AccessTimeIcon,
  ForumRounded as QuestionIcon,
  LaptopMacRounded as DesktopIcon,
  PhoneIphoneRounded as MobileIcon,
  SubtitlesRounded as TeleprompterIcon,
  FlipRounded as FlipIcon,
  SwapVertRounded as FlipVerticalIcon,
  EditRounded as EditIcon,
  CheckRounded as CheckIcon,
  TvRounded as TvIcon,
  KeyboardCommandKeyRounded as KeyboardIcon,
  KeyboardArrowDownRounded as ArrowDownIcon,
  TuneRounded as TuneIcon,
  BoltRounded as CueIcon,
  AutoAwesomeMotionRounded as LaunchAllIcon,
} from '@mui/icons-material';
import { renderSlidePreviewContent, SlideAspectRatio } from './SlideComponents';
import { DEF_BLOCK_DEFINITIONS } from './defBlocksConfig';
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

/**
 * Synthesizes clean spoken talking points when explicit speakerNotes are empty
 */
function buildPreviewFallbackScript(slide: any, idx: number): string {
  const oc = slide?.originalContent || {};
  const lines: string[] = [];
  const title = slide?.title || oc.title || oc.jobTitle || '';
  const sub = oc.subheadline || oc.subtitle || '';
  const stat = oc.stat || oc.metric || '';
  const text = oc.text || oc.body || '';

  if (title) lines.push(`[SLIDE ${idx + 1}] Let's focus on ${title}.`);
  if (sub) lines.push(sub);
  if (stat) lines.push(`[KEY METRIC: ${stat}] Highlight figure on stage: ${stat}.`);
  if (text) lines.push(text);
  if (oc.convention) lines.push(`[CONVENTION] ${oc.convention}`);
  if (oc.reality) lines.push(`[GROUND REALITY] ${oc.reality}`);
  if (oc.workaround) lines.push(`[WORKAROUND] ${oc.workaround}`);

  if (lines.length === 0) {
    return `[SLIDE ${idx + 1} CUE] Walk the audience through the core visual insight on stage.`;
  }
  return lines.join('\n\n');
}

/**
 * Renders teleprompter script inside the Director's Deck OLED preview with amber cue badges
 */
function renderFormattedDeckScript(rawText: string) {
  const paragraphs = rawText.split(/\n+/).filter((p) => p.trim().length > 0);
  return paragraphs.map((para, pIdx) => {
    const parts = para.split(/(\[[^\]]+\])/g).filter(Boolean);
    return (
      <Box key={pIdx} sx={{ mb: 1.35, lineHeight: 1.6, '&:last-child': { mb: 0 } }}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const cue = part.slice(1, -1).trim();
            return (
              <Box
                component="span"
                key={partIdx}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.9,
                  py: 0.15,
                  mx: 0.35,
                  my: 0.2,
                  borderRadius: '6px',
                  bgcolor: 'rgba(245, 158, 11, 0.18)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  color: '#fbbf24',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  verticalAlign: 'middle',
                }}
              >
                <CueIcon sx={{ fontSize: '0.8rem' }} />
                {cue}
              </Box>
            );
          }
          return (
            <Box
              component="span"
              key={partIdx}
              sx={{
                color: '#f1f5f9',
                fontSize: '0.92rem',
                fontWeight: 500,
                letterSpacing: '-0.005em',
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
    fontSize: 48,
    mirrorX: false,
    mirrorY: false,
  });

  // Live telemetry for cross-window keyboard / Stream Deck presses
  const [lastTriggeredKey, setLastTriggeredKey] = useState<string>('Synced Across Windows');
  const [isKeyActive, setIsKeyActive] = useState(false);

  // Dropdown Menus & Popovers
  const [windowMenuAnchorEl, setWindowMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [prompterSettingsAnchorEl, setPrompterSettingsAnchorEl] = useState<null | HTMLElement>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const keyFlashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flashKeyTelemetry = useCallback((label: string) => {
    setLastTriggeredKey(label);
    setIsKeyActive(true);
    if (keyFlashTimeoutRef.current) clearTimeout(keyFlashTimeoutRef.current);
    keyFlashTimeoutRef.current = setTimeout(() => {
      setLastTriggeredKey('Synced Across Windows');
      setIsKeyActive(false);
    }, 2000);
  }, []);

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

  // Broadcast and Cache Helper
  const broadcastSync = useCallback(
    (
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
    },
    [aspectRatio, isTransparent, localBlocks, title, hubColor, timerSeconds, isTimerRunning]
  );

  const sendPrompterCommand = useCallback(
    (action: string, extra: Record<string, any> = {}, keyLabel?: string) => {
      if (keyLabel) {
        flashKeyTelemetry(keyLabel);
      }
      setPrompterStatus((prev) => {
        const next = { ...prev };
        if (action === 'TOGGLE_PLAY') {
          next.isPlaying = typeof extra.value === 'boolean' ? extra.value : !prev.isPlaying;
        } else if (action === 'SET_SPEED' && typeof extra.value === 'number') {
          next.scrollSpeed = Math.max(0.4, Math.min(3.5, Number(extra.value.toFixed(1))));
        } else if (action === 'ADJUST_SPEED' && typeof extra.delta === 'number') {
          next.scrollSpeed = Math.max(0.4, Math.min(3.5, Number((prev.scrollSpeed + extra.delta).toFixed(1))));
        } else if (action === 'SET_FONT_SIZE' && typeof extra.value === 'number') {
          next.fontSize = Math.max(28, Math.min(88, extra.value));
        } else if (action === 'ADJUST_FONT_SIZE' && typeof extra.delta === 'number') {
          next.fontSize = Math.max(28, Math.min(88, prev.fontSize + extra.delta));
        } else if (action === 'TOGGLE_MIRROR_X') {
          next.mirrorX = !prev.mirrorX;
        } else if (action === 'TOGGLE_MIRROR_Y') {
          next.mirrorY = !prev.mirrorY;
        }
        return next;
      });

      try {
        const payload = { type: 'PROMPTER_CONTROL', action, keyLabel, ...extra };
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
    },
    [flashKeyTelemetry]
  );

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
      channelRef.current?.postMessage({ type: 'SET_ASPECT', aspectRatio: nextAspect });
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

        if (data.keyLabel) {
          flashKeyTelemetry(data.keyLabel);
        }

        if (data.type === 'REQUEST_STATE') {
          broadcastSync(activeSlideIndex);
        } else if (data.type === 'SET_SLIDE_INDEX' && typeof data.index === 'number') {
          setActiveSlideIndex(data.index);
          broadcastSync(data.index);
        } else if (data.type === 'PROMPTER_STATUS') {
          setPrompterStatus({
            isPlaying: Boolean(data.isPlaying),
            scrollSpeed: typeof data.scrollSpeed === 'number' ? data.scrollSpeed : 1.2,
            fontSize: typeof data.fontSize === 'number' ? data.fontSize : 48,
            mirrorX: Boolean(data.mirrorX),
            mirrorY: Boolean(data.mirrorY),
          });
        } else if (data.type === 'STUDIO_COMMAND' && data.action === 'TOGGLE_TIMER') {
          setIsTimerRunning((prev) => !prev);
        } else if (data.type === 'NAVIGATE') {
          if (data.direction === 'next') {
            setActiveSlideIndex((prev) => {
              const next = prev < totalSlides - 1 ? prev + 1 : prev;
              broadcastSync(next);
              return next;
            });
          } else if (data.direction === 'prev') {
            setActiveSlideIndex((prev) => {
              const next = prev > 0 ? prev - 1 : 0;
              broadcastSync(next);
              return next;
            });
          }
        }
      };

      broadcastSync(activeSlideIndex);
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [open, activeSlideIndex, totalSlides, broadcastSync, flashKeyTelemetry]);

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

  const handleNext = useCallback(() => {
    if (activeSlideIndex < totalSlides - 1) {
      const nextIdx = activeSlideIndex + 1;
      setActiveSlideIndex(nextIdx);
      broadcastSync(nextIdx);
      flashKeyTelemetry('→ Next Slide');
    }
  }, [activeSlideIndex, totalSlides, broadcastSync, flashKeyTelemetry]);

  const handlePrev = useCallback(() => {
    if (activeSlideIndex > 0) {
      const prevIdx = activeSlideIndex - 1;
      setActiveSlideIndex(prevIdx);
      broadcastSync(prevIdx);
      flashKeyTelemetry('← Prev Slide');
    }
  }, [activeSlideIndex, broadcastSync, flashKeyTelemetry]);

  const handleSelectSlide = (idx: number) => {
    setActiveSlideIndex(idx);
    broadcastSync(idx);
    flashKeyTelemetry(`Slide ${idx + 1}`);
  };

  // Unified Cross-Window Keyboard & Stream Deck Hotkeys
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
      } else if (e.key === ' ') {
        e.preventDefault();
        sendPrompterCommand('TOGGLE_PLAY', {}, 'SPACE • Play/Pause');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.shiftKey) {
          sendPrompterCommand('ADJUST_SPEED', { delta: 0.2 }, 'SHIFT+↑ • Speed +');
        } else {
          sendPrompterCommand('NUDGE_SCROLL', { delta: -140 }, '↑ • Scroll Up');
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.shiftKey) {
          sendPrompterCommand('ADJUST_SPEED', { delta: -0.2 }, 'SHIFT+↓ • Speed -');
        } else {
          sendPrompterCommand('NUDGE_SCROLL', { delta: 140 }, '↓ • Scroll Down');
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        sendPrompterCommand('ADJUST_SPEED', { delta: 0.2 }, '+ • Speed Up');
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        sendPrompterCommand('ADJUST_SPEED', { delta: -0.2 }, '- • Slow Down');
      } else if (e.key === ']') {
        e.preventDefault();
        sendPrompterCommand('ADJUST_FONT_SIZE', { delta: 4 }, '] • Font +');
      } else if (e.key === '[') {
        e.preventDefault();
        sendPrompterCommand('ADJUST_FONT_SIZE', { delta: -4 }, '[ • Font -');
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        sendPrompterCommand('TOGGLE_MIRROR_X', {}, 'M • Flip X');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setIsTimerRunning((prev) => !prev);
        flashKeyTelemetry('R • Timer');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleNext, handlePrev, sendPrompterCommand, flashKeyTelemetry]);

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

    const desktopFeatures = getWindowPlacementFeatures('desktop_stage', {
      customScreens: activeScreens,
      suiteMode: true,
    });
    window.open(
      `/stage?aspect=16:9&transparent=${isTransparent}`,
      'LivestreamStage_Desktop',
      desktopFeatures
    );

    const mobileFeatures = getWindowPlacementFeatures('mobile_stage', {
      customScreens: activeScreens,
      suiteMode: true,
    });
    window.open(
      `/stage?aspect=9:16&transparent=${isTransparent}`,
      'LivestreamStage_Mobile',
      mobileFeatures
    );

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

  const renderSlideItem = (item: any) => {
    return renderSlidePreviewContent(item, hubColor, {
      aspectRatio,
      isTransparent,
    });
  };

  const hotkeyMatrix = [
    { keys: '←  →', label: 'Slides', onClick: () => handleNext() },
    { keys: 'SPACE', label: 'Play / Pause', onClick: () => sendPrompterCommand('TOGGLE_PLAY', {}, 'SPACE • Play/Pause') },
    { keys: '↑  ↓', label: 'Nudge Script', onClick: () => sendPrompterCommand('NUDGE_SCROLL', { delta: 140 }, '↓ • Scroll Down') },
    { keys: '+  −', label: 'Scroll Speed', onClick: () => sendPrompterCommand('ADJUST_SPEED', { delta: 0.2 }, '+ • Speed Up') },
    { keys: '[  ]', label: 'Font Size', onClick: () => sendPrompterCommand('ADJUST_FONT_SIZE', { delta: 4 }, '] • Font +') },
    { keys: 'M', label: 'Mirror Flip', onClick: () => sendPrompterCommand('TOGGLE_MIRROR_X', {}, 'M • Flip X') },
    { keys: 'R', label: 'Clock Timer', onClick: () => { setIsTimerRunning((p) => !p); flashKeyTelemetry('R • Timer'); } },
    { keys: 'F', label: 'Fullscreen', onClick: () => flashKeyTelemetry('F • Fullscreen') },
  ];

  const activeScriptText =
    currentItem?.speakerNotes && currentItem.speakerNotes.trim().length > 0
      ? currentItem.speakerNotes
      : buildPreviewFallbackScript(currentItem, activeSlideIndex);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '32px',
            bgcolor: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.04) 0%, transparent 50%)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 32px 80px -12px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* ── TOP STUDIO HEADER BAR ── */}
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: 1.5,
          borderBottom: '1px solid rgba(15, 23, 42, 0.07)',
          bgcolor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          zIndex: 10,
        }}
      >
        {/* Left: Display Active Chip Only */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Tooltip
            title={
              screens.length > 1
                ? `${screens.length} displays mapped (${screens.map((s) => s.label).join(' • ')}). Windows auto-route to their designated monitors.`
                : isExtended
                ? 'External display detected! Click to authorize automatic multi-monitor window placement.'
                : 'Single display mode — windows tile cleanly side-by-side. Plug in an HDMI/USB-C monitor anytime for auto-routing.'
            }
          >
            <Box
              onClick={() => {
                if (isExtended && permissionState !== 'granted') {
                  requestScreenAccess();
                }
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.1,
                px: 2,
                py: 0.9,
                borderRadius: '14px',
                cursor: isExtended && permissionState !== 'granted' ? 'pointer' : 'default',
                bgcolor: isExtended ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9',
                border: `1.5px solid ${isExtended ? 'rgba(16, 185, 129, 0.3)' : '#e2e8f0'}`,
                transition: 'all 0.2s ease',
                '&:hover': isExtended && permissionState !== 'granted' ? { bgcolor: 'rgba(16, 185, 129, 0.16)' } : {},
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isExtended ? '#10b981' : '#64748b',
                  boxShadow: isExtended ? '0 0 10px #10b981' : 'none',
                }}
              />
              <TvIcon sx={{ fontSize: '1.1rem', color: isExtended ? '#047857' : '#475569' }} />
              <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: isExtended ? '#065f46' : '#334155', letterSpacing: '-0.01em' }}>
                {screens.length > 1
                  ? `${screens.length} Displays Active`
                  : isExtended
                  ? '2 Displays Active'
                  : '1 Display Active'}
              </Typography>
            </Box>
          </Tooltip>
        </Box>

        {/* Center: Studio Chronometer Pill */}
        <Box
          onClick={() => setIsTimerRunning(!isTimerRunning)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.25,
            py: 0.7,
            borderRadius: '16px',
            bgcolor: '#0f172a',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: '#1e293b' },
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isTimerRunning ? '#ef4444' : '#64748b',
              boxShadow: isTimerRunning ? '0 0 10px #ef4444' : 'none',
            }}
          />
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#f8fafc',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
            }}
          >
            {formatTimer(timerSeconds)}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '9px',
              bgcolor: isTimerRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isTimerRunning ? '#f87171' : '#34d399',
            }}
          >
            {isTimerRunning ? <PauseIcon sx={{ fontSize: '1.1rem' }} /> : <PlayIcon sx={{ fontSize: '1.1rem' }} />}
          </Box>
        </Box>

        {/* Right: Launch All + Windows Dropdown + Close */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.15 }}>
          <Button
            variant="contained"
            onClick={handleLaunchFullStudioSuite}
            startIcon={<LaunchAllIcon sx={{ fontSize: '1.1rem !important' }} />}
            sx={{
              minHeight: 44,
              px: 2.25,
              borderRadius: '14px',
              fontWeight: 800,
              bgcolor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.86rem',
              textTransform: 'none',
              boxShadow: '0 6px 18px rgba(15, 23, 42, 0.16)',
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            Launch All Windows
          </Button>

          <Button
            variant="outlined"
            onClick={(e) => setWindowMenuAnchorEl(e.currentTarget)}
            endIcon={<ArrowDownIcon sx={{ fontSize: '1.15rem !important' }} />}
            sx={{
              minHeight: 44,
              px: 2,
              borderRadius: '14px',
              fontWeight: 800,
              borderColor: '#cbd5e1',
              bgcolor: '#ffffff',
              color: '#0f172a',
              fontSize: '0.86rem',
              textTransform: 'none',
              '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc' },
            }}
          >
            Windows
          </Button>

          {/* Dropdown Menu for Individual Studio Windows */}
          <Menu
            anchorEl={windowMenuAnchorEl}
            open={Boolean(windowMenuAnchorEl)}
            onClose={() => setWindowMenuAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  p: 1,
                  minWidth: 300,
                  borderRadius: '20px',
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 24px 48px rgba(15, 23, 42, 0.4)',
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleLaunchTeleprompterWindow();
                setWindowMenuAnchorEl(null);
              }}
              sx={{ py: 1.35, px: 1.75, borderRadius: '14px', mb: 0.5, gap: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}
            >
              <Box sx={{ width: 38, height: 38, borderRadius: '11px', bgcolor: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TeleprompterIcon fontSize="small" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                  Teleprompter
                </Typography>
                <Typography sx={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                  OLED Script & Beamsplitter Mirror
                </Typography>
              </Box>
              <OpenInNewIcon sx={{ fontSize: '1rem', color: '#64748b' }} />
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleLaunchStageWindow('16:9');
                setWindowMenuAnchorEl(null);
              }}
              sx={{ py: 1.35, px: 1.75, borderRadius: '14px', mb: 0.5, gap: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}
            >
              <Box sx={{ width: 38, height: 38, borderRadius: '11px', bgcolor: 'rgba(56, 189, 248, 0.16)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <DesktopIcon fontSize="small" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                  Desktop Stage (16:9)
                </Typography>
                <Typography sx={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                  Landscape Broadcast Window
                </Typography>
              </Box>
              <OpenInNewIcon sx={{ fontSize: '1rem', color: '#64748b' }} />
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleLaunchStageWindow('9:16');
                setWindowMenuAnchorEl(null);
              }}
              sx={{ py: 1.35, px: 1.75, borderRadius: '14px', gap: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}
            >
              <Box sx={{ width: 38, height: 38, borderRadius: '11px', bgcolor: 'rgba(244, 114, 182, 0.16)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MobileIcon fontSize="small" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                  Mobile Stage (9:16)
                </Typography>
                <Typography sx={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                  Vertical Reels / Shorts Window
                </Typography>
              </Box>
              <OpenInNewIcon sx={{ fontSize: '1rem', color: '#64748b' }} />
            </MenuItem>
          </Menu>

          <IconButton
            onClick={onClose}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              color: '#475569',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
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
            py: 1.15,
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
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 12px #10b981' }} />
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
              External Display Connected: <Box component="span" sx={{ color: '#34d399' }}>{newlyConnectedScreen.label}</Box>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleLaunchTeleprompterWindow(newlyConnectedScreen)}
              startIcon={<TeleprompterIcon />}
              sx={{
                borderRadius: '10px',
                bgcolor: '#f59e0b',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.78rem',
                textTransform: 'none',
                py: 0.5,
                px: 1.75,
                '&:hover': { bgcolor: '#d97706', color: '#fff' },
              }}
            >
              Send Teleprompter Here
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                handleLaunchStageWindow('16:9', newlyConnectedScreen);
                dismissNewScreenAlert();
              }}
              sx={{
                borderRadius: '10px',
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#f8fafc',
                fontWeight: 800,
                fontSize: '0.78rem',
                textTransform: 'none',
                py: 0.5,
                px: 1.75,
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Send 16:9 Stage Here
            </Button>
            <IconButton size="small" onClick={dismissNewScreenAlert} sx={{ color: '#94a3b8' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* ── MAIN COCKPIT: 2-COLUMN STUDIO SPLIT ── */}
      <DialogContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5, minHeight: 0, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2.75, flexDirection: { xs: 'column', lg: 'row' }, flex: 1, minHeight: 0 }}>
          
          {/* ── LEFT COLUMN: PURE STAGE VIEWPORT & SCULPTURAL CAROUSEL DOCK ── */}
          <Box sx={{ flex: 1.38, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            
            {/* Pure Stage Viewport Card (No Header Text Clutter) */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: '26px',
                bgcolor: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              {/* Floating Corner Aspect Ratio Pill */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Button
                  size="small"
                  onClick={handleToggleAspect}
                  startIcon={aspectRatio === '9:16' ? <MobileIcon sx={{ fontSize: '0.95rem !important' }} /> : <DesktopIcon sx={{ fontSize: '0.95rem !important' }} />}
                  sx={{
                    borderRadius: '12px',
                    py: 0.6,
                    px: 1.5,
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    textTransform: 'none',
                    bgcolor: 'rgba(15, 23, 42, 0.78)',
                    backdropFilter: 'blur(12px)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.92)' },
                  }}
                >
                  {aspectRatio === '9:16' ? '9:16 Vertical' : '16:9 Landscape'}
                </Button>
              </Box>

              {/* Active Slide Frame */}
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: isTransparent ? 'transparent' : '#f1f5f9',
                  p: isTransparent ? 1 : 0,
                  borderRadius: '20px',
                  border: isTransparent ? '1.5px dashed #cbd5e1' : 'none',
                  minHeight: 340,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: aspectRatio === '9:16' ? 'auto' : '100%',
                    height: aspectRatio === '9:16' ? { xs: 400, md: 480 } : 'auto',
                    maxWidth: aspectRatio === '16:9' ? '100%' : 'calc(480px * 9 / 16)',
                    aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    bgcolor: isTransparent ? 'transparent' : '#f8fafc',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {renderSlideItem(currentItem)}
                </Box>
              </Box>
            </Box>

            {/* ── SCULPTURAL SLIDE MANEUVERING DOCK (CLEAN PREV / NEXT BUTTONS + 3D CAROUSEL) ── */}
            <Box
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: '24px',
                bgcolor: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 10px 30px -6px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 1.5, md: 2.25 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Clean Prev Button (No Double Arrows) */}
              <Button
                variant="outlined"
                onClick={handlePrev}
                disabled={activeSlideIndex <= 0}
                startIcon={<PrevIcon sx={{ fontSize: '1.4rem !important' }} />}
                sx={{
                  minHeight: 64,
                  minWidth: { xs: 105, md: 135 },
                  borderRadius: '18px',
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  textTransform: 'none',
                  bgcolor: '#f8fafc',
                  flexShrink: 0,
                  zIndex: 10,
                  visibility: activeSlideIndex === 0 ? 'hidden' : 'visible',
                  '&:hover': { borderColor: '#0f172a', bgcolor: '#f1f5f9' },
                }}
              >
                Prev
              </Button>

              {/* Center: 3D Perspective Cover-Flow Carousel */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: 102,
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

                  let transform = 'scale(1) rotateY(0deg)';
                  let zIndex = 5;
                  let opacity = 1;

                  if (isActive) {
                    transform = 'scale(1.14) rotateY(0deg) translateZ(35px)';
                    zIndex = 10;
                    opacity = 1;
                  } else if (offset === -1) {
                    transform = 'translateX(-115px) scale(0.86) rotateY(26deg)';
                    zIndex = 6;
                    opacity = 0.72;
                  } else if (offset === 1) {
                    transform = 'translateX(115px) scale(0.86) rotateY(-26deg)';
                    zIndex = 6;
                    opacity = 0.72;
                  } else if (offset === -2) {
                    transform = 'translateX(-200px) scale(0.72) rotateY(38deg)';
                    zIndex = 3;
                    opacity = 0.38;
                  } else if (offset === 2) {
                    transform = 'translateX(200px) scale(0.72) rotateY(-38deg)';
                    zIndex = 3;
                    opacity = 0.38;
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
                        width: { xs: 115, sm: 140, md: 152 },
                        height: { xs: 74, md: 84 },
                        borderRadius: '16px',
                        bgcolor: isActive ? '#0f172a' : '#ffffff',
                        color: isActive ? '#ffffff' : '#0f172a',
                        border: isActive ? `1.5px solid ${blockColor}` : '1px solid rgba(15, 23, 42, 0.09)',
                        boxShadow: isActive
                          ? '0 18px 36px -6px rgba(15, 23, 42, 0.25)'
                          : '0 4px 12px rgba(15, 23, 42, 0.04)',
                        cursor: isActive ? 'default' : 'pointer',
                        p: 1.25,
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
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: isActive ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}>
                          {String(targetIdx + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                        </Typography>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: blockColor }} />
                      </Box>
                      <Typography noWrap sx={{ fontSize: '0.73rem', fontWeight: 800, color: isActive ? '#ffffff' : '#0f172a', lineHeight: 1.25 }}>
                        {slideTitle}
                      </Typography>
                      <Typography noWrap sx={{ fontSize: '0.58rem', fontWeight: 800, color: blockColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {defInfo?.name || slide.sourceType || 'SLIDE'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Clean Next Button (No Double Arrows) */}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeSlideIndex >= totalSlides - 1}
                endIcon={<NextIcon sx={{ fontSize: '1.4rem !important' }} />}
                sx={{
                  minHeight: 64,
                  minWidth: { xs: 105, md: 135 },
                  borderRadius: '18px',
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  textTransform: 'none',
                  flexShrink: 0,
                  zIndex: 10,
                  boxShadow: '0 10px 24px -4px rgba(15, 23, 42, 0.22)',
                  '&:hover': { bgcolor: '#1e293b' },
                  '&:disabled': { opacity: 0.3, bgcolor: '#cbd5e1' },
                }}
              >
                Next
              </Button>
            </Box>
          </Box>

          {/* ── RIGHT COLUMN: STUDIO OLED TELEPROMPTER MONITOR & STREAM DECK MATRIX ── */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            
            {/* 1. PREMIUM STUDIO OLED TELEPROMPTER MONITOR CARD */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                borderRadius: '26px',
                bgcolor: '#090d16',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 44px -10px rgba(15, 23, 42, 0.22)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Teleprompter Card Top Studio Bar */}
              <Box
                sx={{
                  px: 2.25,
                  py: 1.5,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: prompterStatus.isPlaying ? '#10b981' : '#f59e0b',
                      boxShadow: prompterStatus.isPlaying ? '0 0 10px #10b981' : 'none',
                    }}
                  />
                  <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Teleprompter
                  </Typography>
                  {currentItem?.durationStr && (
                    <Chip
                      label={currentItem.durationStr}
                      size="small"
                      sx={{
                        height: 22,
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        borderRadius: '6px',
                      }}
                    />
                  )}
                </Box>

                {/* Right Controls: Auto-Scroll, Optics Popover, Edit Script */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => sendPrompterCommand('TOGGLE_PLAY', {}, 'SPACE • Play/Pause')}
                    startIcon={prompterStatus.isPlaying ? <PauseIcon /> : <PlayIcon />}
                    sx={{
                      minHeight: 34,
                      px: 1.6,
                      borderRadius: '10px',
                      bgcolor: prompterStatus.isPlaying ? '#ef4444' : '#10b981',
                      color: prompterStatus.isPlaying ? '#ffffff' : '#052e16',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      textTransform: 'none',
                      '&:hover': { bgcolor: prompterStatus.isPlaying ? '#dc2626' : '#059669', color: '#ffffff' },
                    }}
                  >
                    {prompterStatus.isPlaying ? 'Pause' : 'Scroll'}
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => setPrompterSettingsAnchorEl(e.currentTarget)}
                    endIcon={<ArrowDownIcon sx={{ fontSize: '1rem !important' }} />}
                    sx={{
                      minHeight: 34,
                      px: 1.25,
                      borderRadius: '10px',
                      borderColor: prompterStatus.mirrorX ? '#fbbf24' : 'rgba(255, 255, 255, 0.16)',
                      bgcolor: prompterStatus.mirrorX ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: prompterStatus.mirrorX ? '#fbbf24' : '#e2e8f0',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.3)' },
                    }}
                  >
                    {prompterStatus.scrollSpeed.toFixed(1)}x • {prompterStatus.fontSize}px
                  </Button>

                  <IconButton
                    size="small"
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '10px',
                      bgcolor: isEditingNotes ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                      color: isEditingNotes ? '#052e16' : '#cbd5e1',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      '&:hover': { bgcolor: isEditingNotes ? '#059669' : 'rgba(255, 255, 255, 0.12)', color: '#ffffff' },
                    }}
                  >
                    {isEditingNotes ? <CheckIcon sx={{ fontSize: '1rem' }} /> : <EditIcon sx={{ fontSize: '0.95rem' }} />}
                  </IconButton>
                </Box>
              </Box>

              {/* Popover for Remote Teleprompter Speed, Font & Mirroring */}
              <Popover
                open={Boolean(prompterSettingsAnchorEl)}
                anchorEl={prompterSettingsAnchorEl}
                onClose={() => setPrompterSettingsAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      p: 2.25,
                      width: 320,
                      borderRadius: '20px',
                      bgcolor: '#0f172a',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.16)',
                      boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
                    },
                  },
                }}
              >
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                  Scroll Speed
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => sendPrompterCommand('ADJUST_SPEED', { delta: -0.2 }, '- • Slow Down')}
                    sx={{ minHeight: 42, minWidth: 64, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', fontSize: '1.15rem', fontWeight: 900 }}
                  >
                    −
                  </Button>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: '#fbbf24' }}>
                    {prompterStatus.scrollSpeed.toFixed(1)}x
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => sendPrompterCommand('ADJUST_SPEED', { delta: 0.2 }, '+ • Speed Up')}
                    sx={{ minHeight: 42, minWidth: 64, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', fontSize: '1.15rem', fontWeight: 900 }}
                  >
                    +
                  </Button>
                </Box>

                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                  Text Size
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => sendPrompterCommand('ADJUST_FONT_SIZE', { delta: -4 }, '[ • Font -')}
                    sx={{ minHeight: 42, minWidth: 64, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', fontSize: '0.95rem', fontWeight: 800 }}
                  >
                    A−
                  </Button>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8' }}>
                    {prompterStatus.fontSize}px
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => sendPrompterCommand('ADJUST_FONT_SIZE', { delta: 4 }, '] • Font +')}
                    sx={{ minHeight: 42, minWidth: 64, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', fontSize: '0.95rem', fontWeight: 800 }}
                  >
                    A+
                  </Button>
                </Box>

                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                  Optical Rig Mirror
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={() => sendPrompterCommand('TOGGLE_MIRROR_X', {}, 'M • Flip X')}
                    startIcon={<FlipIcon />}
                    sx={{
                      minHeight: 42,
                      borderRadius: '12px',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: prompterStatus.mirrorX ? '#fbbf24' : 'rgba(255,255,255,0.08)',
                      color: prompterStatus.mirrorX ? '#0f172a' : '#ffffff',
                    }}
                  >
                    Flip X {prompterStatus.mirrorX ? 'ON' : ''}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => sendPrompterCommand('TOGGLE_MIRROR_Y', {}, 'Flip Y')}
                    startIcon={<FlipVerticalIcon />}
                    sx={{
                      minHeight: 42,
                      borderRadius: '12px',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: prompterStatus.mirrorY ? '#fbbf24' : 'rgba(255,255,255,0.08)',
                      color: prompterStatus.mirrorY ? '#0f172a' : '#ffffff',
                    }}
                  >
                    Flip Y {prompterStatus.mirrorY ? 'ON' : ''}
                  </Button>
                </Box>
              </Popover>

              {/* OLED Script Body Canvas with Optical Eye-Line Accent */}
              <Box
                sx={{
                  p: 2.25,
                  flex: 1,
                  minHeight: 160,
                  maxHeight: 270,
                  overflowY: 'auto',
                  position: 'relative',
                  borderLeft: '3px solid rgba(251, 191, 36, 0.65)',
                  ml: 2,
                  my: 1.5,
                  pl: 2,
                }}
              >
                {isEditingNotes ? (
                  <TextField
                    multiline
                    minRows={4}
                    maxRows={8}
                    fullWidth
                    variant="standard"
                    placeholder="Type presenter script or cues like [PAUSE 2s]... Syncs live to the Teleprompter window."
                    value={currentItem?.speakerNotes || ''}
                    onChange={(e) => handleUpdateSpeakerNotes(e.target.value)}
                    slotProps={{
                      input: {
                        disableUnderline: true,
                        sx: {
                          fontSize: '0.92rem',
                          color: '#f8fafc',
                          lineHeight: 1.6,
                          fontFamily: 'inherit',
                        },
                      },
                    }}
                  />
                ) : (
                  renderFormattedDeckScript(activeScriptText)
                )}
              </Box>

              {/* Audience Discussion Callout Footer (Inside Prompter Card) */}
              {currentItem?.originalContent?.description && (
                <Box
                  sx={{
                    mx: 2,
                    mb: 2,
                    p: 1.5,
                    borderRadius: '14px',
                    bgcolor: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.22)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.25,
                  }}
                >
                  <QuestionIcon sx={{ fontSize: '1.05rem', color: '#38bdf8', mt: 0.25 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2 }}>
                      Audience Prompt
                    </Typography>
                    <Typography sx={{ fontSize: '0.84rem', color: '#e0f2fe', lineHeight: 1.45, fontWeight: 500 }}>
                      {currentItem.originalContent.description}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* 2. TACTILE STREAM DECK & GLOBAL KEYBOARD COMMAND CARD */}
            <Box
              sx={{
                p: 2.25,
                borderRadius: '26px',
                bgcolor: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 10px 30px -6px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {/* Header & Live Telemetry Pill */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '9px',
                      bgcolor: '#0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <KeyboardIcon sx={{ fontSize: '1rem' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
                    Stream Deck & Global Hotkeys
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: '10px',
                    bgcolor: isKeyActive ? 'rgba(16, 185, 129, 0.12)' : '#f1f5f9',
                    border: `1px solid ${isKeyActive ? 'rgba(16, 185, 129, 0.35)' : '#e2e8f0'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: isKeyActive ? '#10b981' : '#94a3b8',
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: isKeyActive ? '#047857' : '#64748b',
                    }}
                  >
                    {lastTriggeredKey}
                  </Typography>
                </Box>
              </Box>

              {/* 8-Pad Hardware Keycap Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                  gap: 1,
                }}
              >
                {hotkeyMatrix.map((hk) => (
                  <Box
                    key={hk.keys}
                    onClick={hk.onClick}
                    sx={{
                      p: 1.15,
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: '#ffffff',
                        borderColor: '#0f172a',
                        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.07)',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': {
                        transform: 'scale(0.97)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.1,
                        py: 0.3,
                        borderRadius: '8px',
                        bgcolor: '#0f172a',
                        color: '#ffffff',
                        boxShadow: '0 2px 0 #334155',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {hk.keys}
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', lineHeight: 1.15, mt: 0.2 }}>
                      {hk.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
