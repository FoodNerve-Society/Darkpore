import React from 'react';
import { Box, Typography, alpha } from '@mui/material';

export interface KeyTakeawaysBlockProps {
  content: {
    point1?: string;
    point2?: string;
    point3?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const KeyTakeawaysBlock: React.FC<KeyTakeawaysBlockProps> = ({ 
  content, 
  themeMode = 'light',
  accentColor = '#3b82f6'
}) => {
  const isDark = themeMode === 'dark';
  const points = [content.point1, content.point2, content.point3].filter(Boolean);

  if (points.length === 0) return null;

  return (
    <Box sx={{ 
      my: 6, 
      p: { xs: 3, md: 5 }, 
      borderRadius: '24px', 
      bgcolor: isDark ? alpha(accentColor, 0.03) : alpha(accentColor, 0.02),
      border: '1px solid',
      borderColor: alpha(accentColor, 0.15),
      boxShadow: `0 8px 32px ${alpha(accentColor, 0.03)}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative gradient orb */}
      <Box sx={{
        position: 'absolute',
        top: -100, right: -100,
        width: 300, height: 300,
        background: `radial-gradient(circle, ${alpha(accentColor, 0.1)} 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <Typography sx={{ 
        color: isDark ? '#fff' : '#0f172a', 
        fontWeight: 900, 
        fontSize: '1rem', 
        mb: 4,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        fontFamily: 'var(--font-quicksand), Quicksand, sans-serif'
      }}>
        <Box sx={{ width: 8, height: 24, borderRadius: 4, bgcolor: accentColor }} />
        Executive Summary
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, position: 'relative', zIndex: 1 }}>
        {points.map((point, idx) => {
          let html = point
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(new RegExp('<u>(.*?)</u>', 'g'), '<span style="text-decoration: underline;">$1</span>')
            .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color: ${accentColor}; text-decoration: underline;">$1</a>`);

          return (
          <Box key={idx} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
            <Box sx={{ 
              width: 36, height: 36, borderRadius: '12px', 
              background: `linear-gradient(135deg, ${accentColor} 0%, ${alpha(accentColor, 0.7)} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 12px ${alpha(accentColor, 0.3)}`,
              color: '#fff',
              mt: 0.5
            }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800 }}>
                {idx + 1}
              </Typography>
            </Box>
            <Box sx={{ 
              color: isDark ? 'rgba(255,255,255,0.9)' : '#1e293b', 
              lineHeight: 1.7, 
              fontSize: '1.05rem',
              fontWeight: 500,
              '& p': { m: 0 },
              '& strong': { fontWeight: 800, color: isDark ? '#fff' : '#0f172a' },
              '& a': { color: accentColor, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
            }} dangerouslySetInnerHTML={{ __html: html }} />
          </Box>
        )})}
      </Box>
    </Box>
  );
};


