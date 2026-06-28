import React from 'react';
import { Box, Typography } from '@mui/material';

type EmbeddedDataBlockProps = {
  content: {
    iframeUrl?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
};

export const EmbeddedDataBlock: React.FC<EmbeddedDataBlockProps> = ({ content, themeMode = 'light', accentColor }) => {
  const isDark = themeMode === 'dark';

  if (!content.iframeUrl) return null;

  return (
    <Box sx={{ my: 5 }}>
      <Box sx={{ 
        width: '100%', 
        height: { xs: 400, md: 500 },
        borderRadius: '16px', 
        overflow: 'hidden', 
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      }}>
        <iframe 
          src={content.iframeUrl} 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          allowFullScreen 
          style={{ display: 'block' }}
        />
      </Box>
    </Box>
  );
};
