import React from 'react';
import { Box, Typography } from '@mui/material';

type BigStatCardBlockProps = {
  content: {
    imageUrl?: string;
    caption?: string;
    label?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
};

export const BigStatCardBlock: React.FC<BigStatCardBlockProps> = ({ content, themeMode = 'light', accentColor }) => {
  const isDark = themeMode === 'dark';

  const parseCaption = () => {
    let label = content.label;
    let body = content.caption || '';
    
    // Backwards compatibility: if no explicit label, try to parse from caption
    if (!label && body) {
      const match = body.match(/^([^:-]+)(:|-)(.*)$/);
      if (match) {
        label = match[1].trim();
        body = match[3].trim();
      }
    }
    
    if (!body && !label) return null;
      
    const renderMarkdown = (text: string) => {
      if (!text) return null;
      const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '');
      
      return paragraphs.map((p, i) => {
        let html = p
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(new RegExp('<u>(.*?)</u>', 'g'), '<span style="text-decoration: underline;">$1</span>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">$1</a>');
        
        return (
          <Typography 
            key={i}
            sx={{ 
              color: isDark ? '#fff' : '#0f172a', 
              fontSize: { xs: '1.1rem', md: '1.3rem' }, 
              fontWeight: 500, 
              lineHeight: 1.5,
              mb: i === paragraphs.length - 1 ? 0 : 2,
              '& strong': { fontWeight: 900, color: accentColor || (isDark ? '#fff' : '#0f172a') },
              '& em': { fontStyle: 'italic', opacity: 0.9 },
              '& a': { opacity: 0.9, transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      });
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {label && (
          <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: '999px', bgcolor: accentColor ? `${accentColor}40` : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'), width: 'fit-content' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: accentColor || (isDark ? '#e2e8f0' : '#475569') }}>
              {label}
            </Typography>
          </Box>
        )}
        {body && renderMarkdown(body)}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      my: 6, 
      borderRadius: '24px', 
      overflow: 'hidden', 
      bgcolor: isDark ? 'rgba(15, 23, 42, 0.4)' : (accentColor ? `${accentColor}1A` : 'rgba(255, 255, 255, 0.4)'),
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : (accentColor ? `${accentColor}80` : 'rgba(0,0,0,0.08)')}`,
      boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.04)',
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
    }}>
      {/* Image Section (Top) */}
      {content.imageUrl && (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
          <img 
            src={content.imageUrl} 
            alt={content.caption || content.label || 'Highlight Image'} 
            style={{ 
              width: '100%', 
              maxHeight: '600px', 
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </Box>
      )}

      {/* Caption Section (Bottom) */}
      {(content.caption || content.label) && (
        <Box sx={{ p: { xs: 3, md: 4 }, borderTop: content.imageUrl ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none' }}>
          {parseCaption()}
        </Box>
      )}
    </Box>
  );
};
