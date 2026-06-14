import React, { useRef } from 'react';
import { Dialog, Box, IconButton, Typography, Button, CircularProgress } from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
import { SocialCardWrapper } from './SocialCardWrapper';
import { useExportCard } from './useExportCard';

type QuoteCardGeneratorModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode; // The block to render
  authorName?: string;
  authorAvatarUrl?: string;
  tenantLogoUrl?: string;
  tenantName?: string;
  themeMode?: 'light' | 'dark';
};

export const QuoteCardGeneratorModal: React.FC<QuoteCardGeneratorModalProps> = ({
  open, onClose, children, authorName, authorAvatarUrl, tenantLogoUrl, tenantName, themeMode = 'light'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { exportAsImage, isExporting } = useExportCard();

  const handleExport = () => {
    exportAsImage(cardRef.current, `social-card-${Date.now()}.png`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '24px', bgcolor: themeMode === 'dark' ? '#1e293b' : '#f8fafc', overflow: 'hidden' } }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
        <Typography sx={{ color: themeMode === 'dark' ? '#fff' : '#0f172a', fontWeight: 800, fontSize: '1.25rem' }}>
          Social Card Generator
        </Typography>
        <IconButton onClick={onClose} sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {/* Preview Container - We scale down the 1080x1080 canvas using CSS transform so it fits on screen */}
        <Box sx={{ 
          width: '100%', 
          maxWidth: 500, 
          aspectRatio: '1 / 1', 
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          bgcolor: '#000',
        }}>
          {/* We use a wrapper that is absolutely positioned to hold the massive 1080x1080 canvas, scaled down to fit */}
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: 1080, 
            height: 1080, 
            transform: 'scale(0.4629)', // 500 / 1080 ≈ 0.4629
            transformOrigin: 'top left' 
          }}>
            <SocialCardWrapper
              ref={cardRef}
              authorName={authorName}
              authorAvatarUrl={authorAvatarUrl}
              tenantLogoUrl={tenantLogoUrl}
              tenantName={tenantName}
              themeMode={themeMode}
            >
              {children}
            </SocialCardWrapper>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={isExporting}
          onClick={handleExport}
          startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          sx={{
            py: 2,
            borderRadius: '16px',
            bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.1rem',
            textTransform: 'none',
            '&:hover': {
              bgcolor: themeMode === 'dark' ? '#2563eb' : '#1d4ed8'
            }
          }}
        >
          {isExporting ? 'Generating High-Res Image...' : 'Download Social Card'}
        </Button>
      </Box>
    </Dialog>
  );
};
