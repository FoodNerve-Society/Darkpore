'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  Sensors as LiveIcon,
} from '@mui/icons-material';
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
  const [isTransparent, setIsTransparent] = useState(false);

  // Initialize aspect ratio and transparency from URL query params (e.g. ?aspect=9:16&transparent=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const aspectParam = params.get('aspect');
      if (aspectParam === '9:16' || aspectParam === 'portrait' || aspectParam === 'mobile') {
        setAspectRatio('9:16');
        setLockedAspect('9:16');
      } else if (aspectParam === '16:9' || aspectParam === 'landscape' || aspectParam === 'desktop') {
        setAspectRatio('16:9');
        setLockedAspect('16:9');
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
        if (!lockedAspect && parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
        if (typeof parsed.isTransparent === 'boolean') setIsTransparent(parsed.isTransparent);
        setIsConnected(true);
      }
    } catch (e) {
      console.error('Failed to load stage cache:', e);
    }
  }, [lockedAspect]);

  // Connect to BroadcastChannel for real-time synchronization with Control Pane
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'SYNC_STATE') {
          if (data.rundownBlocks) setRundownBlocks(data.rundownBlocks);
          if (typeof data.activeSlideIndex === 'number') setActiveSlideIndex(data.activeSlideIndex);
          if (data.title) setTitle(data.title);
          if (data.hubColor) setHubColor(data.hubColor);
          if (!lockedAspect && data.aspectRatio) setAspectRatio(data.aspectRatio);
          if (typeof data.isTransparent === 'boolean') setIsTransparent(data.isTransparent);
          setIsConnected(true);
        } else if (data.type === 'SET_SLIDE_INDEX') {
          if (typeof data.index === 'number') setActiveSlideIndex(data.index);
          setIsConnected(true);
        } else if (data.type === 'SET_ASPECT') {
          if (!lockedAspect && data.aspectRatio) {
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
    };
  }, [lockedAspect]);

  // Keyboard navigation & Fullscreen controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        handleToggleTransparent();
      } else if (e.key === 'a' || e.key === 'A') {
        handleToggleAspect();
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        navigateStage('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        navigateStage('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rundownBlocks.length, activeSlideIndex, aspectRatio, isTransparent]);

  const navigateStage = (direction: 'next' | 'prev') => {
    try {
      const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
      ch.postMessage({ type: 'NAVIGATE', direction });
      ch.close();
    } catch {}

    setActiveSlideIndex((prev) => {
      if (direction === 'next') {
        return prev < rundownBlocks.length - 1 ? prev + 1 : 0;
      } else {
        return prev > 0 ? prev - 1 : rundownBlocks.length - 1;
      }
    });
  };

  const handleToggleAspect = () => {
    const nextAspect: SlideAspectRatio = aspectRatio === '16:9' ? '9:16' : '16:9';
    setAspectRatio(nextAspect);
    try {
      const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
      ch.postMessage({ type: 'SET_ASPECT', aspectRatio: nextAspect });
      ch.close();
    } catch {}
  };

  const handleToggleTransparent = () => {
    const nextTransparent = !isTransparent;
    setIsTransparent(nextTransparent);
    try {
      const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
      ch.postMessage({ type: 'SET_TRANSPARENT', isTransparent: nextTransparent });
      ch.close();
    } catch {}
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const currentItem = rundownBlocks[activeSlideIndex] || null;

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
          <LiveIcon sx={{ fontSize: '4rem', color: hubColor, mb: 2, animation: 'pulse 2s infinite' }} />
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.02em' }}>
            {title || 'Broadcast Standby'}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: 500, fontSize: '1.1rem' }}>
            Presentation stage connected. Switch slides from your Director Control Deck to begin.
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
    <Box
      onDoubleClick={toggleFullscreen}
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: isTransparent ? 'transparent' : '#000000',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Presentation Stage Surface: Container adjusts to 16:9 Landscape or 9:16 Portrait cleanly */}
      <Box
        sx={{
          height: '100%',
          maxHeight: '100vh',
          aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9',
          maxWidth: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {renderCurrentSlide()}
      </Box>
    </Box>
  );
}
