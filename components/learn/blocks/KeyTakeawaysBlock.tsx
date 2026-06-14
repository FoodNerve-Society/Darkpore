import React from 'react';
import { Box, Typography } from '@mui/material';

type KeyTakeawaysBlockProps = {
  content: {
    point1?: string;
    point2?: string;
    point3?: string;
  };
  themeMode?: 'light' | 'dark';
};

export const KeyTakeawaysBlock: React.FC<KeyTakeawaysBlockProps> = ({ content, themeMode = 'light' }) => {
  const isDark = themeMode === 'dark';
  const points = [content.point1, content.point2, content.point3].filter(Boolean);

  if (points.length === 0) return null;

  return (
    <Box sx={{ 
      my: 4, 
      p: { xs: 3, md: 4 }, 
      borderRadius: '24px', 
      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: '1px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    }}>
      <Typography sx={{ 
        color: isDark ? '#fff' : '#0f172a', 
        fontWeight: 800, 
        fontSize: '1.25rem', 
        mb: 3,
        letterSpacing: '-0.01em' 
      }}>
        Executive Summary
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {points.map((point, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ 
              width: 24, height: 24, borderRadius: '50%', 
              bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, mt: 0.25
            }}>
              <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                {idx + 1}
              </Typography>
            </Box>
            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#334155', lineHeight: 1.6 }}>
              {point}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
