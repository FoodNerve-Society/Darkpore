import React from 'react';
import { Box, Typography } from '@mui/material';
import { MarkdownText } from '../MarkdownText';
import { WhatsAppDiscussionPrompt } from '../WhatsAppDiscussionPrompt';

type MainAnalysisBlockProps = {
  content: {
    bionicText?: string;
    heading?: string;
    anchorQuestion?: string; // legacy support
    discussionPrompt?: string;
    imageUrl?: string;
    repliesCount?: number;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
  author?: any;
  triggerInsights?: () => void;
};

export const MainAnalysisBlock: React.FC<MainAnalysisBlockProps> = ({ content, themeMode = 'light', accentColor = '#8b5cf6', author, triggerInsights }) => {
  const isDark = themeMode === 'dark';

  const headingText = content.heading || content.anchorQuestion;
  const isComplete = !!content.bionicText && content.bionicText.trim().length > 0;

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '');
    
    return paragraphs.map((p, i) => {
      return (
        <MarkdownText 
          key={i}
          sx={{ 
            color: isDark ? 'rgba(255,255,255,0.85)' : '#334155', 
            fontFamily: 'var(--article-body-font, var(--font-lexend), system-ui, sans-serif)',
            fontSize: 'var(--article-body-size, 1.2rem)', 
            lineHeight: 'var(--article-line-height, 1.82)',
            letterSpacing: '-0.01em',
            mb: 2.5, // Creates the one-line paragraph spacing
            '& strong': { fontWeight: 800, color: isDark ? '#fff' : '#0f172a' },
            '& em': { fontStyle: 'italic', color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' },
            '& a': { color: accentColor || '#8b5cf6', textDecoration: 'underline', transition: 'opacity 0.2s', '&:hover': { opacity: 0.8 } }
          }}
        >
          {p}
        </MarkdownText>
      );
    });
  };

  return (
    <Box sx={{ my: 4 }}>
      {/* Heading */}
      {headingText && (
        <Typography variant="h3" sx={{ fontFamily: 'var(--article-heading-font) !important', 
          fontWeight: 900, 
          fontSize: '1.8rem', 
          mb: 3,
          letterSpacing: '-0.03em',
          background: isDark ? 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)' : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
          WebkitBackgroundClip: 'text',
          color: isDark ? '#f8fafc' : '#0f172a'
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
        <Box sx={{ mb: 4 }}>
          {renderMarkdown(content.bionicText)}
        </Box>
      )}

      {/* WhatsApp Discussion Prompt */}
      {isComplete && (content.discussionPrompt || content.anchorQuestion || author) && (
        <WhatsAppDiscussionPrompt
          prompt={content.discussionPrompt || content.anchorQuestion}
          defaultPrompt="Do you know if your organization has deployed this workaround?"
          author={author}
          repliesCount={content.repliesCount ?? 14}
          accentColor={accentColor}
          themeMode={themeMode}
          triggerInsights={triggerInsights}
        />
      )}

    </Box>
  );
};
