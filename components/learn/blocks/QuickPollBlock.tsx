import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';

type QuickPollBlockProps = {
  content: {
    question?: string;
    options?: string; // comma separated
    discussionPrompt?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
  author?: any;
  triggerInsights?: () => void;
};

export const QuickPollBlock: React.FC<QuickPollBlockProps> = ({ content, themeMode = 'light', accentColor, author, triggerInsights }) => {
  const isDark = themeMode === 'dark';
  const optionsList = React.useMemo(() => {
    if (!content.options) return [];
    try {
      const parsed = JSON.parse(content.options);
      if (Array.isArray(parsed)) return parsed.map(o => String(o).trim()).filter(Boolean);
    } catch(e) {}
    if (content.options.includes('|||')) return content.options.split('|||').map(o => o.trim()).filter(Boolean);
    return content.options.split(',').map(o => o.trim()).filter(Boolean);
  }, [content.options]);
  const isComplete = !!content.question && content.question.trim().length > 0;

  if (!content.question) return null;

  return (
    <Box sx={{ 
      my: 4, 
      p: { xs: 3, md: 4 }, 
      borderRadius: '24px', 
      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: '1px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
        <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Poll
        </Typography>
      </Box>

      <Typography sx={{ 
        color: isDark ? '#fff' : '#0f172a', 
        fontWeight: 800, 
        fontSize: { xs: '1.25rem', md: '1.5rem' }, 
        mb: 4,
        letterSpacing: '-0.01em' 
      }}>
        {content.question}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {optionsList.map((option, idx) => (
          <Button 
            key={idx}
            variant="outlined"
            fullWidth
            sx={{ 
              py: 2, px: 3, 
              justifyContent: 'flex-start',
              borderRadius: '16px',
              color: isDark ? '#fff' : '#0f172a',
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1.05rem',
              '&:hover': {
                borderColor: isDark ? '#fff' : '#0f172a',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
              }
            }}
          >
            {option}
          </Button>
        ))}
      </Box>

      {/* Discussion Prompt - wired to insights */}
      {isComplete && author && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
          <Box 
            onClick={triggerInsights}
            sx={{ 
              display: 'flex', alignItems: 'flex-start', gap: 1.5,
              maxWidth: '85%',
              cursor: 'pointer',
              '&:hover .reply-btn': { bgcolor: accentColor || '#8b5cf6', color: '#fff' }
            }}
          >
            <img src={author.avatarUrl} alt={author.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
            <Box sx={{ 
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '18px', borderTopLeftRadius: '0px',
              px: 2, py: 1.5,
              position: 'relative',
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: isDark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center' }}>
                {author.name}
                {author.isVerified && <VerifiedIcon sx={{ fontSize: 14, color: accentColor || '#10b981', ml: 0.5 }} />}
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', color: isDark ? '#f8fafc' : '#334155', fontStyle: 'italic', mb: 1 }}>
                "{content.discussionPrompt || "Why did you vote the way you did?"}"
              </Typography>
              <Typography className="reply-btn" sx={{ 
                display: 'inline-block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', 
                color: accentColor || '#8b5cf6', transition: 'all 0.2s', borderRadius: '12px', px: 1, py: 0.2, ml: -1
              }}>
                {/* @ts-ignore */}
                {content.repliesCount ? `${content.repliesCount} Replies` : 'Reply'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
