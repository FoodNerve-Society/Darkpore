'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Chip } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { renderSlidePreviewContent } from '../../../components/forms/livestream/SlideComponents';
import { useSociety } from '@/context/SocietyContext';

export default function LivestreamPresentationViewer({
  content,
  onClose,
  initialSlideIndex = 0,
}: {
  content: any;
  onClose?: () => void;
  initialSlideIndex?: number;
}) {
  const { profile } = useSociety();

  const blocks = (content.livestream?.blocks || []).filter(
    (b: any) => b.blockType !== 'metadata'
  );
  const maxIndex = Math.max(0, blocks.length - 1);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(
    blocks.length > 0 ? Math.min(Math.max(0, initialSlideIndex), maxIndex) : 0
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (blocks.length <= 1) {
        if (e.key === 'Escape' && onClose) {
          e.preventDefault();
          onClose();
        }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(maxIndex, prev + 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blocks.length, maxIndex, onClose]);

  const renderSlide = (block: any) => {
    if (!block) return null;
    let c = block.content;
    if (typeof c === 'string') {
      try {
        c = JSON.parse(c);
      } catch {
        c = {};
      }
    }
    const item = {
      id: block.id,
      sourceType:
        c.sourceType ||
        (block.blockType === 'rundown_act'
          ? 'act'
          : block.blockType === 'transition'
          ? 'transition'
          : block.blockType === 'job'
          ? 'job'
          : 'def_block'),
      defBlockId: c.defBlockId,
      defBlockLabel: c.defBlockLabel,
      slideIndex: c.slideIndex,
      slideCount: c.slideCount,
      act: c.act,
      originalBlockType: c.originalBlockType || block.blockType,
      originalContent: c,
      durationStr: c.durationStr || block.durationStr,
      speakerNotes: c.speakerNotes || block.speakerNotes,
    };
    return renderSlidePreviewContent(item, '#3b82f6', { aspectRatio: '16:9' });
  };

  const currentBlock = blocks[currentSlideIndex];
  let currentBlockContent: any = {};
  if (currentBlock) {
    if (typeof currentBlock.content === 'string') {
      try {
        currentBlockContent = JSON.parse(currentBlock.content);
      } catch {
        currentBlockContent = {};
      }
    } else {
      currentBlockContent = currentBlock.content || {};
    }
  }

  const speakerNotes =
    currentBlockContent?.speakerNotes ||
    currentBlock?.speakerNotes ||
    'No speaker notes attached to this slide.';
  const durationStr =
    currentBlockContent?.durationStr || currentBlock?.durationStr;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        bgcolor: '#090d16',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
      }}
    >
      {/* Left: The Slide Stage (Shared Screen / Audience Mirror) */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1280px',
            aspectRatio: '16/9',
            boxShadow: '0 25px 70px rgba(0,0,0,0.6)',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#000',
            display: 'flex',
          }}
        >
          {blocks.length > 0 ? (
            renderSlide(currentBlock)
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>
                No slides available in this rundown.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Right: Speaker Teleprompter & Director Controls */}
      <Box
        sx={{
          width: { xs: '100%', md: 440 },
          bgcolor: '#0f172a',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(15, 23, 42, 0.95)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: '#ef4444',
                boxShadow: '0 0 10px #ef4444',
              }}
            />
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
              Host Teleprompter & Notes
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              if (onClose) onClose();
            }}
            sx={{
              color: '#94a3b8',
              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Teleprompter Notes Body */}
        <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography
              sx={{
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Slide {currentSlideIndex + 1} of {Math.max(1, blocks.length)}
            </Typography>
            {durationStr && (
              <Chip
                label={`Target: ${durationStr}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              minHeight: 200,
            }}
          >
            <Typography
              sx={{
                color: '#f8fafc',
                fontSize: '1.25rem',
                fontWeight: 450,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {speakerNotes}
            </Typography>
          </Box>

          {/* Quick Slide Jumper */}
          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{
                color: '#64748b',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                mb: 1.5,
              }}
            >
              Slide Sequence
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {blocks.map((_: any, idx: number) => (
                <Button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  size="small"
                  sx={{
                    minWidth: 36,
                    height: 32,
                    p: 0,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    bgcolor:
                      currentSlideIndex === idx
                        ? '#3b82f6'
                        : 'rgba(255,255,255,0.05)',
                    color: currentSlideIndex === idx ? '#fff' : '#94a3b8',
                    border:
                      currentSlideIndex === idx
                        ? '1px solid #60a5fa'
                        : '1px solid rgba(255,255,255,0.06)',
                    '&:hover': {
                      bgcolor:
                        currentSlideIndex === idx
                          ? '#2563eb'
                          : 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {idx + 1}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Footer Navigation Bar */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'rgba(15, 23, 42, 0.95)',
          }}
        >
          <Button
            disabled={blocks.length <= 1 || currentSlideIndex === 0}
            onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
            sx={{
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
            }}
            startIcon={<ArrowBackIcon />}
          >
            Previous
          </Button>

          <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
            Space / Arrows to navigate · Esc to close
          </Typography>

          <Button
            disabled={blocks.length <= 1 || currentSlideIndex >= maxIndex}
            onClick={() =>
              setCurrentSlideIndex((prev) => Math.min(maxIndex, prev + 1))
            }
            sx={{
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
            }}
            endIcon={<ArrowForwardIcon />}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
