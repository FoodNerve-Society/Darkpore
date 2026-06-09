'use client';

import React from 'react';
import { Modal, Box, IconButton, Fade, Backdrop } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl?: string; // YouTube or Vimeo embed URL
}

export default function VideoModal({ open, onClose, videoUrl }: VideoModalProps) {
  // Fallback to a stunning placeholder video if none is provided
  const embedUrl = videoUrl || 'https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&controls=0&modestbranding=1&rel=0';

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(10px)' }
        },
      }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: 1200,
          aspectRatio: '16/9',
          bgcolor: '#000',
          borderRadius: 4,
          boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          outline: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(255,0,0,0.8)' }
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Video Iframe */}
          {open && (
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title="Video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </Box>
      </Fade>
    </Modal>
  );
}
