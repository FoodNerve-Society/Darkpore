'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Chip, Tooltip } from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Sensors as LiveIcon,
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
        setIsConnected(true);
      }
    } catch (e) {
      console.error('Failed to load stage cache:', e);
    }
  }, []);

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
          setIsConnected(true);
        } else if (data.type === 'SET_SLIDE_INDEX') {
          if (typeof data.index === 'number') setActiveSlideIndex(data.index);
          setIsConnected(true);
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
  }, []);

  // Keyboard navigation & Fullscreen controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        try {
          const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
          ch.postMessage({ type: 'NAVIGATE', direction: 'next' });
          ch.close();
        } catch {}
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        try {
          const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
          ch.postMessage({ type: 'NAVIGATE', direction: 'prev' });
          ch.close();
        } catch {}
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rundownBlocks.length]);

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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
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

    const isAct =
      currentItem.sourceType === 'act' ||
      currentItem.originalBlockType === 'rundown_act' ||
      Boolean(currentItem.originalContent?.role);
    const isJob = currentItem.sourceType === 'job' || Boolean(currentItem.originalContent?.jobTitle);
    const isTransition = currentItem.sourceType === 'transition' && !isAct;

    if (isAct) {
      return (
        <SlideRundownAct
          content={currentItem.originalContent || {}}
          durationStr={currentItem.durationStr}
          color={hubColor}
        />
      );
    }

    if (isJob) {
      return <SlideJob content={currentItem.originalContent || {}} />;
    }

    if (isTransition) {
      return <SlideTransition content={currentItem.originalContent || {}} />;
    }

    // Article Blocks
    const c = currentItem.originalContent || {};
    switch (currentItem.originalBlockType) {
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
        return <SlideFallback content={c} type={currentItem.originalBlockType || 'slide'} />;
    }
  };

  return (
    <Box
      onDoubleClick={toggleFullscreen}
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: '#000000',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* 16:9 Presentation Stage Surface */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          aspectRatio: '16/9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {renderCurrentSlide()}
      </Box>

      {/* Discrete Hover Toolbar (Top Right) */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          opacity: 0,
          transition: 'opacity 0.2s ease',
          '&:hover': { opacity: 1 },
          zIndex: 50,
        }}
      >
        <Tooltip title="Toggle Fullscreen (F)">
          <IconButton
            onClick={toggleFullscreen}
            size="small"
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.85)' },
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
