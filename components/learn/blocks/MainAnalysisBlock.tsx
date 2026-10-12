import React from 'react';
import { Box, Typography, alpha, Avatar } from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';
import { MarkdownText } from '../MarkdownText';

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
            fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif',
            fontSize: { xs: '1.05rem', md: '1.125rem' }, 
            lineHeight: 1.78,
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
        <Box sx={{ mb: 4 }}>
          {renderMarkdown(content.bionicText)}
        </Box>
      )}

      {/* Author Chat Prompt Container */}
      {isComplete && (content.discussionPrompt || content.anchorQuestion || author) && (() => {
        const authorName = typeof author === 'object' && author?.name 
          ? author.name 
          : (typeof author === 'string' && author ? author : 'Society Architect');
        const authorAvatar = typeof author === 'object' ? author?.avatarUrl : undefined;
        const isAuthorVerified = typeof author === 'object' ? (author?.isVerified ?? true) : true;
        const replyLabel = content.repliesCount ? `${content.repliesCount} ${content.repliesCount === 1 ? 'Reply' : 'Replies'}` : 'Reply';

        return (
          <Box 
            onClick={triggerInsights}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              mt: 4,
              cursor: 'pointer',
              width: '100%',
              maxWidth: { xs: '100%', md: '85%' },
              p: { xs: 1.5, sm: 2 },
              borderRadius: '16px',
              bgcolor: alpha(accentColor || '#8b5cf6', isDark ? 0.08 : 0.05),
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              borderLeft: `3px solid ${accentColor || '#8b5cf6'}`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: alpha(accentColor || '#8b5cf6', isDark ? 0.12 : 0.08),
                transform: 'translateY(-1px)',
                boxShadow: `0 8px 24px ${alpha(accentColor || '#8b5cf6', 0.12)}`
              },
              '&:hover .reply-btn': { bgcolor: accentColor || '#8b5cf6', color: '#fff' }
            }}
          >
            {/* Author Avatar */}
            <Box sx={{ flexShrink: 0, position: 'relative' }}>
              <Avatar 
                src={authorAvatar} 
                alt={authorName}
                sx={{ width: 30, height: 30, fontSize: '0.85rem', fontWeight: 700 }} 
              >
                {authorName?.charAt(0) || 'S'}
              </Avatar>
              <Box sx={{ 
                position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, 
                bgcolor: '#10b981', borderRadius: '50%', border: `1.5px solid ${isDark ? '#0f172a' : '#fff'}` 
              }} />
            </Box>
            
            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: isDark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center' }}>
                  {authorName}
                  {isAuthorVerified && <VerifiedIcon sx={{ fontSize: 13, color: accentColor || '#10b981', ml: 0.5 }} />}
                </Typography>
                <Typography className="reply-btn" sx={{ 
                  px: 1.2, py: 0.3, 
                  borderRadius: '10px',
                  bgcolor: alpha(accentColor || '#8b5cf6', 0.1),
                  color: accentColor || '#8b5cf6',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  {replyLabel}
                </Typography>
              </Box>
              <Typography sx={{ 
                color: isDark ? 'rgba(255,255,255,0.85)' : '#334155',
                fontSize: { xs: '0.88rem', sm: '0.92rem' },
                lineHeight: 1.5,
                fontWeight: 500,
                fontStyle: 'italic'
              }}>
                {`"${content.discussionPrompt || content.anchorQuestion || 'What are your thoughts on this analysis? Drop an insight below.'}"`}
              </Typography>
            </Box>
          </Box>
        );
      })()}

    </Box>
  );
};
