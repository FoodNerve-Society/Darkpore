import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';

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
  accentColor?: string;
  author?: any;
  triggerInsights?: () => void;
};

export const StrongQuoteBlock: React.FC<StrongQuoteBlockProps> = ({ content, themeMode = 'light', accentColor, author, triggerInsights }) => {
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
            <Avatar src={author.avatarUrl} alt={author.name} sx={{ width: 28, height: 28 }}>
              {author.name?.charAt(0)}
            </Avatar>
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
                "{content.discussionPrompt || "How does this quote resonate with your perspective?"}"
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
