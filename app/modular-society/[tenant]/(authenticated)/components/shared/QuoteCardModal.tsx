'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogTitle, IconButton, 
  Typography, Button, Box, CircularProgress, alpha
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon, Share as ShareIcon } from '@mui/icons-material';

interface QuoteCardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  blockText: string;
  userName: string;
  userRole: string;
  comment: string;
  avatarUrl: string;
}

export default function QuoteCardModal({ open, onClose, title, blockText, userName, userRole, comment, avatarUrl }: QuoteCardModalProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) {
      // Construct the URL with params
      const params = new URLSearchParams({
        title,
        blockText,
        userName,
        userRole,
        comment,
        avatarUrl
      });
      setImageUrl(`/api/og/card?${params.toString()}`);
    }
  }, [open, title, blockText, userName, userRole, comment, avatarUrl]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Generate a clean filename
      const filename = `foodnerve-insight-${new Date().getTime()}.png`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '24px',
          bgcolor: '#1e293b',
          color: '#fff',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Brilliant take.</Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            Your peers on LinkedIn would love to see this.
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 0 }}>
        {/* Preview Area */}
        <Box 
          sx={{ 
            width: '100%', 
            aspectRatio: '1 / 1', 
            bgcolor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            position: 'relative',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={imageUrl} 
              alt="Generated Card Preview" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              // Show a spinner while the image loads natively
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
              }}
            />
          ) : (
            <CircularProgress color="inherit" />
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleDownload}
            disabled={!imageUrl || downloading}
            startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            sx={{ 
              bgcolor: '#f59e0b', 
              color: '#000',
              fontWeight: 800, 
              py: 1.5, 
              borderRadius: '12px',
              '&:hover': { bgcolor: '#d97706' }
            }}
          >
            {downloading ? 'Generating...' : 'Download Image'}
          </Button>
          
          {/* Optional Share API fallback for mobile */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button
              variant="outlined"
              onClick={async () => {
                try {
                  await navigator.share({
                    title: 'Foodnerve Intelligence',
                    text: 'Check out this insight on the Foodnerve Action Group.',
                    url: window.location.href, // Link to the article
                  });
                } catch (err) {
                  // Ignore share cancellation
                }
              }}
              sx={{ 
                color: '#fff', 
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                px: 3
              }}
            >
              <ShareIcon />
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
