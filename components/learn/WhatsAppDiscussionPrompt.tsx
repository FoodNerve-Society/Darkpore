import React from 'react';
import { Box, Typography, Avatar, alpha } from '@mui/material';
import {
  Verified as VerifiedIcon,
  DoneAll as DoneAllIcon,
  ChatBubbleOutlined as ChatIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

export type WhatsAppDiscussionPromptProps = {
  prompt?: string;
  defaultPrompt?: string;
  author?: any;
  repliesCount?: number;
  accentColor?: string;
  themeMode?: 'light' | 'dark';
  triggerInsights?: () => void;
  maxWidth?: any;
  sx?: any;
};

export const WhatsAppDiscussionPrompt: React.FC<WhatsAppDiscussionPromptProps> = ({
  prompt,
  defaultPrompt = 'Do you know if operators in your corridor have deployed this workaround?',
  author,
  repliesCount,
  accentColor = '#10b981',
  themeMode = 'light',
  triggerInsights,
  maxWidth,
  sx,
}) => {
  const isDark = themeMode === 'dark';
  const whatsappGreen = '#25D366';
  const whatsappDarkGreen = '#059669';

  const authorName =
    typeof author === 'object' && author?.name
      ? author.name
      : typeof author === 'string' && author
      ? author
      : 'Society Architect';
  const authorAvatar = typeof author === 'object' ? author?.avatarUrl : undefined;
  const isAuthorVerified = typeof author === 'object' ? (author?.isVerified ?? true) : true;
  const promptText = prompt || defaultPrompt;

  const totalReplies =
    typeof repliesCount === 'number' ? repliesCount : promptText ? 14 : 0;
  const repliesLabel =
    totalReplies > 0
      ? `${totalReplies.toLocaleString()} ${totalReplies === 1 ? 'reply' : 'replies'}`
      : 'Start the chat';

  const renderPromptHeadline = () => {
    const doYouKnowMatch = promptText.match(/^(Do you know if\b)([\s\S]*)$/i);
    if (doYouKnowMatch) {
      return (
        <Typography
          sx={{
            fontFamily: 'var(--article-body-font, var(--font-lexend), sans-serif) !important',
            fontSize: { xs: '1rem', sm: '1.08rem' },
            color: isDark ? '#f8fafc' : '#0f172a',
            fontWeight: 500,
            lineHeight: 1.6,
            wordBreak: 'break-word',
          }}
        >
          <Box
            component="span"
            sx={{
              color: isDark ? '#34d399' : whatsappDarkGreen,
              fontWeight: 800,
              display: 'inline',
              mr: 0.5,
            }}
          >
            {doYouKnowMatch[1]}
          </Box>
          {doYouKnowMatch[2]}
        </Typography>
      );
    }

    return (
      <Typography
        sx={{
          fontFamily: 'var(--article-body-font, var(--font-lexend), sans-serif) !important',
          fontSize: { xs: '1rem', sm: '1.08rem' },
          color: isDark ? '#f8fafc' : '#0f172a',
          fontWeight: 500,
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {promptText}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: { xs: 1.5, sm: 2 },
        my: 4.5,
        width: '100%',
        ...sx,
      }}
    >
      {/* ── Left: Sender Avatar with Live WhatsApp Green Dot ── */}
      <Box sx={{ position: 'relative', flexShrink: 0, mt: 0.5 }}>
        <Avatar
          src={authorAvatar}
          alt={authorName}
          sx={{
            width: { xs: 40, sm: 46 },
            height: { xs: 40, sm: 46 },
            fontSize: '1rem',
            fontWeight: 800,
            bgcolor: isDark ? 'rgba(37, 211, 102, 0.2)' : '#dcfce7',
            color: isDark ? '#4ade80' : '#15803d',
            border: `2px solid ${isDark ? 'rgba(37, 211, 102, 0.4)' : '#bbf7d0'}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          {authorName.charAt(0).toUpperCase()}
        </Avatar>
        {/* Online Green Indicator Dot */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: whatsappGreen,
            border: `2px solid ${isDark ? '#0f172a' : '#ffffff'}`,
          }}
        />
      </Box>

      {/* ── Right: Authentic WhatsApp Speech Bubble with Tail ── */}
      <Box
        onClick={triggerInsights}
        sx={{
          position: 'relative',
          flex: 1,
          maxWidth: maxWidth || { xs: '100%', md: '84%' },
          cursor: 'pointer',
          // Top-left corner sharp (4px) like a real incoming WhatsApp message bubble
          borderRadius: '4px 22px 22px 22px',
          px: { xs: 2.25, sm: 3 },
          pt: { xs: 1.75, sm: 2.25 },
          pb: { xs: 1.5, sm: 1.85 },
          background: isDark
            ? 'linear-gradient(145deg, rgba(6, 78, 59, 0.42) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(145deg, #ecfdf5 0%, #f0fdf4 55%, #ffffff 100%)',
          border: `1px solid ${
            isDark ? 'rgba(52, 211, 153, 0.24)' : 'rgba(16, 185, 129, 0.22)'
          }`,
          boxShadow: isDark
            ? '0 14px 34px rgba(0, 0, 0, 0.38)'
            : '0 10px 28px rgba(5, 150, 105, 0.07), 0 2px 6px rgba(15, 23, 42, 0.03)',
          transition: 'all 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: isDark ? 'rgba(52, 211, 153, 0.48)' : 'rgba(16, 185, 129, 0.45)',
            boxShadow: isDark
              ? '0 18px 40px rgba(0, 0, 0, 0.48)'
              : '0 14px 34px rgba(5, 150, 105, 0.12)',
          },
          '&:hover .wa-reply-pill': {
            bgcolor: whatsappDarkGreen,
            color: '#ffffff',
          },
          // Speech Bubble Left Triangular Tail
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: -9,
            width: 0,
            height: 0,
            borderTop: `12px solid ${
              isDark ? 'rgba(6, 78, 59, 0.65)' : '#ecfdf5'
            }`,
            borderLeft: '10px solid transparent',
          },
        }}
      >
        {/* Sender Header Line inside the Bubble */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mb: 0.85,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-jakarta), sans-serif !important',
                fontWeight: 800,
                fontSize: '0.86rem',
                color: isDark ? '#34d399' : '#047857',
                letterSpacing: '0em !important',
              }}
            >
              {authorName}
            </Typography>
            {isAuthorVerified && (
              <VerifiedIcon
                sx={{ fontSize: 15, color: isDark ? '#34d399' : whatsappDarkGreen }}
              />
            )}
          </Box>

          <Typography
            sx={{
              fontFamily: 'var(--font-jakarta), sans-serif !important',
              fontSize: '0.73rem',
              fontWeight: 700,
              color: isDark ? 'rgba(148, 163, 184, 0.8)' : '#64748b',
            }}
          >
            Field Discussion
          </Typography>
        </Box>

        {/* Message Text */}
        <Box sx={{ mb: 1.5 }}>{renderPromptHeadline()}</Box>

        {/* Bottom-Right WhatsApp Read Receipt & Reply Pill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            pt: 1,
            borderTop: `1px solid ${
              isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(16, 185, 129, 0.12)'
            }`,
          }}
        >
          {/* Reply Pill */}
          <Box
            className="wa-reply-pill"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.45,
              borderRadius: '100px',
              bgcolor: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.12)',
              color: isDark ? '#6ee7b7' : '#047857',
              fontFamily: 'var(--font-jakarta), sans-serif !important',
              fontSize: '0.8rem',
              fontWeight: 800,
              transition: 'all 0.2s ease',
            }}
          >
            <ChatIcon sx={{ fontSize: 15 }} />
            <span>{repliesLabel} · Tap to join</span>
            <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Box>

          {/* Timestamp + Double Blue Checkmarks (✓✓) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-jakarta), sans-serif !important',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: isDark ? '#94a3b8' : '#64748b',
              }}
            >
              Live thread
            </Typography>
            <DoneAllIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WhatsAppDiscussionPrompt;
