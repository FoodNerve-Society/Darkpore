import React from 'react';
import { Box, Typography } from '@mui/material';
import { Close as CloseIcon, Check as CheckIcon, Verified as VerifiedIcon } from '@mui/icons-material';

type MythRealityBlockProps = {
  content: {
    myth?: string;
    fact?: string;
    pairs?: Array<{ myth: string; fact: string }>;
    discussionPrompt?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
  author?: any;
  triggerInsights?: () => void;
};

export const MythRealityBlock: React.FC<MythRealityBlockProps> = ({ content, themeMode = 'light', accentColor, author, triggerInsights }) => {
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
              <Typography sx={{ 
                color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8', 
                fontSize: { xs: '1.1rem', md: '1.3rem' }, 
                lineHeight: 1.5, 
                textDecoration: 'line-through',
                fontWeight: 500
              }}>
                {pair.myth}
              </Typography>
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
              <Typography sx={{ 
                color: isDark ? '#fff' : '#0f172a', 
                fontSize: { xs: '1.1rem', md: '1.3rem' }, 
                lineHeight: 1.6, 
                fontWeight: 600 
              }}>
                {pair.fact}
              </Typography>
            </Box>
          )}
        </Box>
      ))}

      {/* Discussion Prompt */}
      {isComplete && author && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Box 
            onClick={triggerInsights}
            sx={{ 
              display: 'flex', alignItems: 'flex-start', gap: 1.5,
              maxWidth: '85%',
              cursor: 'pointer',
              '&:hover .reply-btn': { bgcolor: accentColor || '#8b5cf6', color: '#fff' }
            }}
          >
            <Box sx={{ 
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '18px', borderTopRightRadius: '0px',
              px: 2, py: 1.5,
              position: 'relative',
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: isDark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {author.name}
                {author.isVerified && <VerifiedIcon sx={{ fontSize: 14, color: accentColor || '#10b981', ml: 0.5 }} />}
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', color: isDark ? '#f8fafc' : '#334155', fontStyle: 'italic', mb: 1, textAlign: 'right' }}>
                "{content.discussionPrompt || "Have you encountered this myth in your own experience?"}"
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography className="reply-btn" sx={{ 
                  display: 'inline-block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', 
                  color: accentColor || '#8b5cf6', transition: 'all 0.2s', borderRadius: '12px', px: 1.5, py: 0.2, mr: -1
                }}>
                  {/* @ts-ignore */}
                  {content.repliesCount ? `${content.repliesCount} Replies` : 'Reply'}
                </Typography>
              </Box>
            </Box>
            <img src={author.avatarUrl} alt={author.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          </Box>
        </Box>
      )}
    </Box>
  );
};
