import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { MarkdownText } from '../MarkdownText';
import { WhatsAppDiscussionPrompt } from '../WhatsAppDiscussionPrompt';

type StrongQuoteBlockProps = {
  content: {
    quote?: string;
    attribution?: string;
    authorName?: string;
    authorRole?: string;
    avatarUrl?: string;
    sourceUrl?: string;
    discussionPrompt?: string;
    repliesCount?: number;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
  author?: any;
  triggerInsights?: () => void;
};

export const StrongQuoteBlock: React.FC<StrongQuoteBlockProps> = ({ content, themeMode = 'light', accentColor = '#f59e0b', author, triggerInsights }) => {
  const isDark = themeMode === 'dark';
  const isComplete = !!content.quote && content.quote.trim().length > 0;
  const embeddedSourceUrl = content.attribution?.match(/https?:\/\/[^\s]+/)?.[0];
  const sourceUrl = content.sourceUrl || embeddedSourceUrl;
  const attributionText = content.attribution?.replace(/\s*Source:\s*https?:\/\/[^\s]+/i, '').trim();

  if (!content.quote) return null;

  return (
    <Box sx={{ my: 6, px: { xs: 2, md: 4 } }}>
      <Box sx={{ position: 'relative' }}>
        {/* Giant Quote Mark */}
          <MarkdownText sx={{ 
          position: 'absolute', top: -40, left: -20, 
          fontSize: '6rem', color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
          fontWeight: 900, lineHeight: 1, fontFamily: 'serif' 
        }}>
          &ldquo;
        </MarkdownText>

        <MarkdownText sx={{ 
          color: isDark ? '#fff' : '#0f172a', 
          fontSize: { xs: '1.25rem', md: '1.75rem' }, 
          fontWeight: 700, 
          lineHeight: 1.5,
          letterSpacing: '-0.01em',
          position: 'relative',
          zIndex: 1,
          fontStyle: 'italic', fontFamily: 'var(--article-stylised-font) !important'
          }}>
            {content.quote}
          </MarkdownText>
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
              {content.authorName || (attributionText && attributionText.split(',')[0].trim())}
            </Typography>
            <Typography sx={{ 
              color: isDark ? '#94a3b8' : '#64748b', 
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mt: 0.2
            }}>
              {content.authorRole || (attributionText && attributionText.includes(',') ? attributionText.split(',').slice(1).join(',').trim() : '')}
            </Typography>
            {sourceUrl && (
              <Box
                component="a"
                href={sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.35,
                  mt: 0.75,
                  color: accentColor || (isDark ? '#93c5fd' : '#2563eb'),
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                <LinkIcon sx={{ fontSize: 14 }} />
                Source
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* WhatsApp Discussion Prompt */}
      {isComplete && (content.discussionPrompt || author) && (
        <WhatsAppDiscussionPrompt
          prompt={content.discussionPrompt}
          defaultPrompt="Do you know if this quote reflects your current corridor reality?"
          author={author}
          repliesCount={content.repliesCount ?? 9}
          accentColor={accentColor}
          themeMode={themeMode}
          triggerInsights={triggerInsights}
        />
      )}
    </Box>
  );
};
