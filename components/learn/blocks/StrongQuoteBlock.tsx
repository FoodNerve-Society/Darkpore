import React from 'react';
import { Box, Typography } from '@mui/material';

type StrongQuoteBlockProps = {
  content: {
    quote?: string;
    attribution?: string;
    authorName?: string;
    authorRole?: string;
    avatarUrl?: string;
    discussionPrompt?: string;
  };
  themeMode?: 'light' | 'dark';
};

export const StrongQuoteBlock: React.FC<StrongQuoteBlockProps> = ({ content, themeMode = 'light' }) => {
  const isDark = themeMode === 'dark';
  const isComplete = !!content.quote && content.quote.trim().length > 0;

  if (!content.quote) return null;

  return (
    <Box sx={{ my: 6, px: { xs: 2, md: 4 } }}>
      <Box sx={{ position: 'relative' }}>
        {/* Giant Quote Mark */}
        <Typography sx={{ 
          position: 'absolute', top: -40, left: -20, 
          fontSize: '6rem', color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
          fontWeight: 900, lineHeight: 1, fontFamily: 'serif' 
        }}>
          &ldquo;
        </Typography>

        <Typography sx={{ 
          color: isDark ? '#fff' : '#0f172a', 
          fontSize: { xs: '1.25rem', md: '1.75rem' }, 
          fontWeight: 700, 
          lineHeight: 1.5,
          letterSpacing: '-0.01em',
          position: 'relative',
          zIndex: 1,
          fontStyle: 'italic'
        }}>
          {content.quote}
        </Typography>
      </Box>

      {(content.authorName || content.attribution) && (
        <Box sx={{ 
          display: 'flex', alignItems: 'center', gap: 2, mt: 4
        }}>
          <Box sx={{ width: 32, height: 3, bgcolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', borderRadius: 2 }} />
          {content.avatarUrl && (
            <Box sx={{ 
              width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flexShrink: 0
            }}>
              <img src={content.avatarUrl} alt={content.authorName || content.attribution} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          )}
          <Box>
            <Typography sx={{ 
              color: isDark ? '#fff' : '#0f172a', 
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '-0.01em'
            }}>
              {content.authorName || (content.attribution && content.attribution.split(',')[0].trim())}
            </Typography>
            <Typography sx={{ 
              color: isDark ? '#94a3b8' : '#64748b', 
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mt: 0.2
            }}>
              {content.authorRole || (content.attribution && content.attribution.includes(',') ? content.attribution.split(',').slice(1).join(',').trim() : '')}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Discussion Prompt - to be wired later */}
      {isComplete && (
        <Box sx={{ display: 'flex', mt: 3 }}>
          <Box sx={{ 
            px: 2, py: 1, 
            borderRadius: '20px', 
            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: isDark ? '#fff' : '#0f172a',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }
          }}>
            💬 Discuss: {content.discussionPrompt || "How does this quote resonate with your perspective?"}
            <Typography sx={{ ml: 1, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '0.75rem', fontWeight: 500 }}>
              • 24 Replies
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};
