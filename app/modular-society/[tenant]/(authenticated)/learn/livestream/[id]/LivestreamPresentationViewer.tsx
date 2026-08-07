'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Chip, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { PlayArrow as PlayArrowIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon, Close as CloseIcon } from '@mui/icons-material';
import { SlideSpikyTitle, SlideMythFact, SlideStatCard, SlideJob, SlideTransition, SlideQuote, SlideMedia, SlideFallback } from '../../../components/forms/livestream/SlideComponents';
import { useSociety } from '@/context/SocietyContext';

export default function LivestreamPresentationViewer({ content }: { content: any }) {
  const { profile } = useSociety();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [presenterMode, setPresenterMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const blocks = content.livestream?.blocks || [];
  const isAuthor = profile?.uid === content.authorId || profile?.organizations?.some((o: any) => o.id === content.organizationId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!presenterMode) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex(prev => Math.min(blocks.length - 1, prev + 1));
      }
      if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
      }
      if (e.key === 'Escape') {
        setPresenterMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presenterMode, blocks.length]);

  const renderSlide = (block: any) => {
    const c = typeof block.content === 'string' ? JSON.parse(block.content) : block.content || {};
    const type = block.blockType;
    if (type === 'job') return <SlideJob content={c} />;
    if (type === 'transition') return <SlideTransition content={c} />;
    switch (type) {
      case 'subheading': return <SlideSpikyTitle content={c} />;
      case 'myth_fact': return <SlideMythFact content={c} />;
      case 'highlight_card': return <SlideStatCard content={c} />;
      case 'pull_quote': return <SlideQuote content={c} />;
      case 'media': return <SlideMedia content={c} />;
      default: return <SlideFallback content={c} type={type} />;
    }
  };

  // --- PRESENTER MODE ---
  if (presenterMode) {
    const currentBlock = blocks[currentSlideIndex];
    return (
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, bgcolor: '#0f172a', display: 'flex' }}>
        {/* Left: The Slide (Shared Window) */}
        <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: '1600px' }}>
            {blocks.length > 0 ? renderSlide(currentBlock) : <Typography color="white">No slides available.</Typography>}
          </Box>
        </Box>

        {/* Right: Speaker Notes (Private) */}
        <Box sx={{ width: 400, bgcolor: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
            <Typography sx={{ color: '#fff', fontWeight: 700 }}>Presenter View</Typography>
            <IconButton onClick={() => setPresenterMode(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
          </Box>
          
          <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
              Slide {currentSlideIndex + 1} of {blocks.length}
            </Typography>
            <Typography sx={{ color: '#fff', fontSize: '1.2rem', fontWeight: 400, whiteSpace: 'pre-wrap', mb: 4 }}>
              {currentBlock?.speakerNotes || "No speaker notes for this slide."}
            </Typography>

            {currentBlock?.durationStr && (
              <Chip label={`Estimated: ${currentBlock.durationStr}`} sx={{ bgcolor: '#3b82f6', color: '#fff' }} />
            )}
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
            <Button disabled={currentSlideIndex === 0} onClick={() => setCurrentSlideIndex(prev => prev - 1)} sx={{ color: '#fff' }} startIcon={<ArrowBackIcon />}>Prev</Button>
            <Button disabled={currentSlideIndex === blocks.length - 1} onClick={() => setCurrentSlideIndex(prev => prev + 1)} sx={{ color: '#fff' }} endIcon={<ArrowForwardIcon />}>Next</Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // --- AUDIENCE VIEW ---
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>{content.title}</Typography>
          <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.2rem', maxWidth: 800 }}>{content.description}</Typography>
        </Box>
        {isAuthor && (
          <Button variant="contained" color="primary" startIcon={<FullscreenIcon />} onClick={() => setPresenterMode(true)} sx={{ borderRadius: 8, px: 3, py: 1.5, fontWeight: 700 }}>
            Enter Presenter Mode
          </Button>
        )}
      </Box>

      {/* Video Embed */}
      {content.livestream?.streamUrl && (
        <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#0f172a', borderRadius: 4, mb: 6, overflow: 'hidden' }}>
          <iframe 
            src={content.livestream.streamUrl.replace('watch?v=', 'embed/')} 
            width="100%" height="100%" 
            frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
          />
        </Box>
      )}

      {/* Slide Deck Viewer */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>Curated Resources & Rundown</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {blocks.map((block: any, i: number) => (
          <Box key={block.id || i} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ transform: 'scale(0.95)', transformOrigin: 'top left', width: '105.26%' }}>
              {renderSlide(block)}
            </Box>
            {block.speakerNotes && isAuthor && (
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '4px solid #3b82f6' }}>
                <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>{block.speakerNotes}</Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
