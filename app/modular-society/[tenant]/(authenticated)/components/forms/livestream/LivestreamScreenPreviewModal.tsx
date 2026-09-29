'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/system';
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ArrowBackIosNew as PrevIcon,
  ArrowForwardIos as NextIcon,
  ChatBubbleOutlineOutlined as ChatIcon,
  Videocam as VideocamIcon,
  Mic as MicIcon,
  Visibility as VisibilityIcon,
  FiberManualRecord as DotIcon,
  Send as SendIcon,
  OpenInNew as OpenInNewIcon,
  AutoAwesome as SparkleIcon,
  Work as WorkIcon,
  Layers as LayersIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
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

// Simulated audience messages to show realistic chat flow
const SAMPLE_CHAT_MESSAGES = [
  { id: '1', user: 'Adaeze K.', avatar: '', text: 'Sound and video are crystal clear! 🙌', time: '10:02 AM' },
  { id: '2', user: 'Marcus Vance', avatar: '', text: 'The capital allocation stat is mind-blowing.', time: '10:04 AM' },
  { id: '3', user: 'Dr. Chinedu', avatar: '', text: 'Can you speak on the registry decentralization aspect?', time: '10:06 AM' },
  { id: '4', user: 'Elena Rostova', avatar: '', text: 'Just bookmarked this slide for our working group.', time: '10:08 AM' },
  { id: '5', user: 'Tunde B.', avatar: '', text: 'Is that ecosystem role remote-friendly?', time: '10:11 AM' },
];

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showPip, setShowPip] = useState(true);
  const [chatMessages, setChatMessages] = useState(SAMPLE_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [simulatedReactions, setSimulatedReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const reactionIdRef = useRef(0);

  // Reset to first slide when opened
  useEffect(() => {
    if (open) {
      setActiveSlideIndex(0);
      setIsPlaying(false);
    }
  }, [open]);

  // Slides count
  const totalSlides = rundownBlocks.length;
  const currentItem = rundownBlocks[activeSlideIndex] || null;

  // Auto-play slideshow timer
  useEffect(() => {
    if (!isPlaying || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, totalSlides]);

  // Periodic floating reaction simulation
  useEffect(() => {
    if (!open) return;
    const emojis = ['🔥', '💡', '👏', '❤️', '🚀', '🎯'];
    const interval = setInterval(() => {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const id = ++reactionIdRef.current;
      const left = Math.floor(Math.random() * 80) + 10; // 10% to 90%
      setSimulatedReactions((prev) => [...prev.slice(-8), { id, emoji, left }]);
    }, 3200);

    return () => clearInterval(interval);
  }, [open]);

  const handlePrev = () => {
    setIsPlaying(false);
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActiveSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: String(Date.now()),
      user: 'You (Host)',
      avatar: hostAvatar,
      text: chatInput.trim(),
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  // Render the current slide from SlideComponents
  const renderCurrentSlide = () => {
    if (!currentItem) {
      return (
        <Box
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: '24px',
            bgcolor: '#090d16',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>🎙️</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mb: 1 }}>
            Broadcast Standby Screen
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.65)', maxWidth: 440, fontSize: '0.95rem' }}>
            No presentation slides in rundown yet. Add Broadcast Acts and article blocks in Step 2 to preview your presentation flow.
          </Typography>
        </Box>
      );
    }

    const isAct = currentItem.sourceType === 'act' || currentItem.originalBlockType === 'rundown_act' || Boolean(currentItem.originalContent?.role);
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '28px',
            bgcolor: '#090d16',
            backgroundImage: 'radial-gradient(ellipse at top, rgba(30, 41, 59, 0.7) 0%, #090d16 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 32px 96px rgba(0, 0, 0, 0.8)',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* ── BROADCAST SIMULATOR TOP BAR ── */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1.5px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          zIndex: 10,
        }}
      >
        {/* Left: Live indicator + Stream metadata */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Live pulsing badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: '10px',
              bgcolor: 'rgba(239, 68, 68, 0.18)',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
            }}
          >
            <DotIcon sx={{ color: '#ef4444', fontSize: '0.85rem', animation: 'pulse 1.5s infinite' }} />
            <Typography sx={{ color: '#ef4444', fontWeight: 900, fontSize: '0.74rem', letterSpacing: '0.08em' }}>
              LIVE BROADCAST
            </Typography>
          </Box>

          <Chip
            label="1080p 60fps"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              fontWeight: 800,
              fontSize: '0.68rem',
              height: 22,
            }}
          />

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.75, color: '#10b981' }}>
            <MicIcon sx={{ fontSize: '0.95rem' }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.03em' }}>
              HOST AUDIO LIVE
            </Typography>
          </Box>
        </Box>

        {/* Center: Stream Title & Hub */}
        <Box sx={{ textAlign: 'center', maxWidth: { xs: '100%', md: 480 }, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 900,
              color: '#ffffff',
              fontSize: '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title || 'Untitled Livestream Broadcast'}
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>
            {hubTitle} • {category.toUpperCase()}
          </Typography>
        </Box>

        {/* Right: Viewers Count & Action Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Chip
            icon={<VisibilityIcon sx={{ fontSize: '0.9rem !important', color: '#10b981 !important' }} />}
            label="248 Watching"
            size="small"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              fontWeight: 800,
              fontSize: '0.74rem',
              height: 24,
            }}
          />

          <Tooltip title={showPip ? 'Hide Host Webcam PiP' : 'Show Host Webcam PiP'}>
            <IconButton
              size="small"
              onClick={() => setShowPip(!showPip)}
              sx={{
                bgcolor: showPip ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: showPip ? '#60a5fa' : '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.3)' },
              }}
            >
              <VideocamIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={showChat ? 'Hide Live Chat' : 'Show Live Chat'}>
            <IconButton
              size="small"
              onClick={() => setShowChat(!showChat)}
              sx={{
                bgcolor: showChat ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: showChat ? '#34d399' : '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.3)' },
              }}
            >
              <ChatIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* ── MAIN STUDIO BODY: BROADCAST SCREEN + CHAT SIDEBAR ── */}
      <DialogContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', gap: 2.5, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left / Center: 16:9 Cinema Stage + Bottom Scrubber */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* 16:9 Broadcast Stage Canvas */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: '24px',
              overflow: 'hidden',
              bgcolor: '#0f172a',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* The Active Slide Component */}
            <Box sx={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
              {renderCurrentSlide()}
            </Box>

            {/* Host Webcam Picture-in-Picture (PiP) Overlay */}
            {showPip && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: { xs: 12, md: 20 },
                  right: { xs: 12, md: 20 },
                  zIndex: 20,
                  width: { xs: 130, md: 170 },
                  height: { xs: 80, md: 104 },
                  borderRadius: '16px',
                  bgcolor: '#0a0e17',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 1,
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                }}
              >
                {/* Host PiP Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip
                    label="CAM 1 • LIVE"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.25)',
                      color: '#ef4444',
                      fontWeight: 900,
                      fontSize: '0.58rem',
                      height: 16,
                      px: 0.2,
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <Box sx={{ width: 4, height: 10, bgcolor: '#10b981', borderRadius: 1 }} />
                    <Box sx={{ width: 4, height: 14, bgcolor: '#10b981', borderRadius: 1 }} />
                    <Box sx={{ width: 4, height: 8, bgcolor: '#10b981', borderRadius: 1 }} />
                  </Box>
                </Box>

                {/* Host Avatar & Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={hostAvatar}
                    sx={{
                      width: 28,
                      height: 28,
                      border: '1.5px solid #10b981',
                      bgcolor: hubColor,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {hostName.charAt(0)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        color: '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {hostName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8' }}>Host</Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Lower-Third Glass Banner Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 12, md: 20 },
                left: { xs: 12, md: 20 },
                zIndex: 15,
                p: { xs: 1.25, md: 1.75 },
                borderRadius: '16px',
                bgcolor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
                maxWidth: { xs: '60%', md: '50%' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label={hubTitle.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: alpha(hubColor, 0.2),
                    color: hubColor,
                    fontWeight: 900,
                    fontSize: '0.62rem',
                    height: 18,
                  }}
                />
                {currentItem && (
                  <Typography sx={{ color: '#cbd5e1', fontSize: '0.7rem', fontWeight: 700 }}>
                    {currentItem.sourceType === 'act'
                      ? 'Act Introduction'
                      : currentItem.sourceType === 'job'
                      ? 'Ecosystem Spotlight'
                      : 'Key Analysis Block'}
                  </Typography>
                )}
              </Box>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: { xs: '0.78rem', md: '0.92rem' },
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title || 'Scheduled Broadcast'}
              </Typography>
            </Box>

            {/* Climax CTA Banner Overlay (if active slide is a job) */}
            {currentItem && (currentItem.sourceType === 'job' || Boolean(currentItem.originalContent?.jobTitle)) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  zIndex: 25,
                  p: 1.5,
                  borderRadius: '16px',
                  bgcolor: 'rgba(245, 158, 11, 0.95)',
                  color: '#0f172a',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <WorkIcon sx={{ fontSize: '1.2rem', color: '#0f172a' }} />
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.8rem', lineHeight: 1.1 }}>
                    CLIMAX OPPORTUNITY SPOTLIGHT
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                    Audience link active: {currentItem.originalContent?.jobTitle || 'Ecosystem Role'}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  endIcon={<OpenInNewIcon sx={{ fontSize: '0.75rem !important' }} />}
                  sx={{
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    borderRadius: '8px',
                    textTransform: 'none',
                    py: 0.3,
                    px: 1.2,
                    '&:hover': { bgcolor: '#1e293b' },
                  }}
                >
                  Apply Live
                </Button>
              </Box>
            )}

            {/* Floating Live Reaction Emojis */}
            {simulatedReactions.map((r) => (
              <Box
                key={r.id}
                sx={{
                  position: 'absolute',
                  bottom: 30,
                  left: `${r.left}%`,
                  fontSize: '1.75rem',
                  zIndex: 30,
                  pointerEvents: 'none',
                  animation: 'floatUpReaction 2.8s ease-out forwards',
                  '@keyframes floatUpReaction': {
                    '0%': { transform: 'translateY(0) scale(0.6)', opacity: 0 },
                    '20%': { transform: 'translateY(-30px) scale(1.1)', opacity: 1 },
                    '80%': { transform: 'translateY(-160px) scale(1)', opacity: 0.85 },
                    '100%': { transform: 'translateY(-220px) scale(0.8)', opacity: 0 },
                  },
                }}
              >
                {r.emoji}
              </Box>
            ))}
          </Box>

          {/* Director Deck: Playback Controls & Scrubber */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: '20px',
              bgcolor: 'rgba(15, 23, 42, 0.7)',
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {/* Control Buttons & Progress */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={handlePrev}
                  disabled={totalSlides <= 1}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                  }}
                >
                  <PrevIcon sx={{ fontSize: '0.85rem' }} />
                </IconButton>

                <Button
                  size="small"
                  variant="contained"
                  startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={totalSlides <= 1}
                  sx={{
                    bgcolor: isPlaying ? '#ef4444' : '#10b981',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    borderRadius: '10px',
                    textTransform: 'none',
                    px: 2,
                    py: 0.5,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: isPlaying ? '#dc2626' : '#059669' },
                  }}
                >
                  {isPlaying ? 'Pause Slideshow' : 'Auto Play'}
                </Button>

                <IconButton
                  size="small"
                  onClick={handleNext}
                  disabled={totalSlides <= 1}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                  }}
                >
                  <NextIcon sx={{ fontSize: '0.85rem' }} />
                </IconButton>
              </Box>

              {/* Slide Counter & Runtime */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label={totalSlides > 0 ? `Slide ${activeSlideIndex + 1} of ${totalSlides}` : '0 Slides'}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                  }}
                />

                {currentItem && (
                  <Chip
                    label={`Pacing: ${currentItem.durationStr || '5m'}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Slide Scrubber Pills */}
            {totalSlides > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  pb: 0.5,
                  '::-webkit-scrollbar': { height: 4 },
                  '::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
                }}
              >
                {rundownBlocks.map((b, idx) => {
                  const isActive = idx === activeSlideIndex;
                  const isActBlock = b.sourceType === 'act' || b.originalBlockType === 'rundown_act';
                  const isJobBlock = b.sourceType === 'job';

                  return (
                    <Box
                      key={b.id || idx}
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveSlideIndex(idx);
                      }}
                      sx={{
                        flexShrink: 0,
                        px: 1.5,
                        py: 0.6,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        bgcolor: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: isActive
                          ? '1.5px solid #10b981'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#34d399' : '#94a3b8',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 900 }}>
                        {idx + 1}.
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          maxWidth: 140,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isActBlock
                          ? b.originalContent?.role || b.originalContent?.title || 'Act'
                          : isJobBlock
                          ? b.originalContent?.jobTitle || 'Job Spotlight'
                          : b.originalBlockType?.replace('_', ' ') || 'Slide'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        {/* Right: Live Audience Chat Simulator */}
        {showChat && (
          <Box
            sx={{
              width: { xs: 240, md: 320 },
              borderRadius: '24px',
              bgcolor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatIcon sx={{ color: '#34d399', fontSize: '1.1rem' }} />
                <Typography sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.85rem' }}>
                  Live Stream Chat
                </Typography>
              </Box>
              <Chip
                label="Simulated"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  height: 18,
                }}
              />
            </Box>

            {/* Chat Messages Stream */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                '::-webkit-scrollbar': { width: 4 },
                '::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
              }}
            >
              {chatMessages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    p: 1.25,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#60a5fa' }}>
                      {msg.user}
                    </Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: '#64748b' }}>
                      {msg.time}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                    {msg.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Chat Input Form */}
            <Box
              component="form"
              onSubmit={handleSendChat}
              sx={{
                p: 1.5,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                bgcolor: 'rgba(10, 14, 23, 0.6)',
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Say something to the stream..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="submit" size="small" sx={{ color: '#10b981' }}>
                          <SendIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.25)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
