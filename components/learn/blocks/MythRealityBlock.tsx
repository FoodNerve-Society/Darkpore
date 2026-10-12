import React from 'react';
import { Box, Typography, Avatar, alpha } from '@mui/material';
import { Close as CloseIcon, Check as CheckIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import { MarkdownText } from '../MarkdownText';

type MythRealityBlockProps = {
  content: {
    myth?: string;
    fact?: string;
    pairs?: Array<{ myth: string; fact: string }>;
    discussionPrompt?: string;
    repliesCount?: number;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
  author?: any;
  triggerInsights?: () => void;
};

export const MythRealityBlock: React.FC<MythRealityBlockProps> = ({ content, themeMode = 'light', accentColor = '#ef4444', author, triggerInsights }) => {
  const isDark = themeMode === 'dark';

  const pairs = content.pairs || (content.myth || content.fact ? [{ myth: content.myth, fact: content.fact }] : []);
  const isComplete = pairs.length > 0 && pairs.some(p => p.myth && p.fact);

  if (pairs.length === 0) return null;

  return (
    <Box sx={{ my: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {pairs.map((pair, idx) => (
        <Box 
          key={idx} 
          sx={{ 
            borderRadius: '24px', 
            overflow: 'hidden', 
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.04)',
            display: 'flex', 
            flexDirection: 'column',
          }}
        >
          {/* THE MYTH */}
          {pair.myth && (
            <Box sx={{ p: { xs: 3, md: 4 }, borderBottom: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: '#ef4444' }}>
                <CloseIcon sx={{ fontSize: '1.2rem', strokeWidth: 2 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  The Myth
                </Typography>
              </Box>
              <MarkdownText sx={{ 
                color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8', 
                fontSize: { xs: '1.1rem', md: '1.3rem' }, 
                lineHeight: 1.5, 
                textDecoration: 'line-through',
                fontWeight: 500
              }}>
                {pair.myth}
              </MarkdownText>
            </Box>
          )}

          {/* THE REALITY */}
          {pair.fact && (
            <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: isDark ? 'rgba(16, 185, 129, 0.03)' : 'rgba(16, 185, 129, 0.03)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: '#10b981' }}>
                <CheckIcon sx={{ fontSize: '1.2rem', strokeWidth: 2 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  The Reality
                </Typography>
              </Box>
              <MarkdownText sx={{ 
                color: isDark ? '#fff' : '#0f172a', 
                fontSize: { xs: '1.1rem', md: '1.3rem' }, 
                lineHeight: 1.6, 
                fontWeight: 600 
              }}>
                {pair.fact}
              </MarkdownText>
            </Box>
          )}
        </Box>
      ))}

      {/* Discussion Prompt */}
      {isComplete && author && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
          <Box 
            onClick={triggerInsights}
            sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 1.5,
              width: '100%',
              maxWidth: { xs: '100%', md: '85%' },
              p: { xs: 1.5, sm: 2 },
              borderRadius: '16px',
              bgcolor: alpha(accentColor || '#ef4444', isDark ? 0.08 : 0.05),
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              borderLeft: `3px solid ${accentColor || '#ef4444'}`,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: alpha(accentColor || '#ef4444', isDark ? 0.12 : 0.08),
                transform: 'translateY(-1px)',
                boxShadow: `0 8px 24px ${alpha(accentColor || '#ef4444', 0.12)}`
              },
              '&:hover .reply-btn': { bgcolor: accentColor || '#ef4444', color: '#fff' }
            }}
          >
            <Box sx={{ flexShrink: 0, position: 'relative' }}>
              <Avatar src={author.avatarUrl} alt={author.name} sx={{ width: 30, height: 30, fontSize: '0.85rem', fontWeight: 700 }}>
                {author.name?.charAt(0)}
              </Avatar>
              <Box sx={{ 
                position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, 
                bgcolor: '#10b981', borderRadius: '50%', border: `1.5px solid ${isDark ? '#0f172a' : '#fff'}` 
              }} />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: isDark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center' }}>
                  {author.name}
                  {author.isVerified && <VerifiedIcon sx={{ fontSize: 13, color: accentColor || '#10b981', ml: 0.5 }} />}
                </Typography>
                <Typography className="reply-btn" sx={{ 
                  px: 1.2, py: 0.3, 
                  borderRadius: '10px',
                  bgcolor: alpha(accentColor || '#ef4444', 0.1),
                  color: accentColor || '#ef4444',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  {content.repliesCount ? `${content.repliesCount} Replies` : 'Reply'}
                </Typography>
              </Box>
              <Typography sx={{ 
                fontSize: { xs: '0.88rem', sm: '0.92rem' }, 
                color: isDark ? 'rgba(255,255,255,0.85)' : '#334155', 
                fontStyle: 'italic', 
                fontWeight: 500,
                lineHeight: 1.5 
              }}>
                "{content.discussionPrompt || "Have you encountered this myth in your own experience?"}"
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
