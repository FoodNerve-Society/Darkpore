import React from 'react';
import { Box, Typography } from '@mui/material';

type MainAnalysisBlockProps = {
  content: {
    bionicText?: string;
    heading?: string;
    anchorQuestion?: string; // legacy support
    discussionPrompt?: string;
    imageUrl?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
};

export const MainAnalysisBlock: React.FC<MainAnalysisBlockProps> = ({ content, themeMode = 'light', accentColor }) => {
  const isDark = themeMode === 'dark';

  const headingText = content.heading || content.anchorQuestion;
  const isComplete = !!content.bionicText && content.bionicText.trim().length > 0;

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '');
    
    return paragraphs.map((p, i) => {
      let html = p
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(new RegExp('<u>(.*?)</u>', 'g'), '<span style="text-decoration: underline;">$1</span>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #8b5cf6; text-decoration: underline;">$1</a>');
      
      return (
        <Typography 
          key={i}
          sx={{ 
            color: isDark ? 'rgba(255,255,255,0.85)' : '#334155', 
            fontFamily: '"Playfair Display", serif',
            fontSize: { xs: '1.1rem', md: '1.25rem' }, 
            lineHeight: 1.9,
            letterSpacing: '0.01em',
            mb: 2.5, // Creates the one-line paragraph spacing
            '& strong': { fontWeight: 800, color: isDark ? '#fff' : '#0f172a' },
            '& em': { fontStyle: 'italic', color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' },
            '& a': { color: '#8b5cf6', textDecoration: 'underline', transition: 'opacity 0.2s', '&:hover': { opacity: 0.8 } }
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
  };

  return (
    <Box sx={{ my: 4 }}>
      {/* Heading */}
      {headingText && (
        <Typography sx={{ 
          fontWeight: 900, 
          fontSize: '1.8rem', 
          mb: 3,
          letterSpacing: '-0.03em',
          background: isDark ? 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)' : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {headingText}
        </Typography>
      )}

      {/* Image (Optional) */}
      {content.imageUrl && (
        <Box sx={{ my: 3, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <img src={content.imageUrl} alt="Analysis Graphic" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </Box>
      )}

      {/* The Meat (Bionic Text) */}
      {content.bionicText && (
        <Box sx={{ mb: 2 }}>
          {renderMarkdown(content.bionicText)}
        </Box>
      )}


    </Box>
  );
};
