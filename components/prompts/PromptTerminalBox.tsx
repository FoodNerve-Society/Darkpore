'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Chip, alpha } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface PromptTerminalBoxProps {
  id?: string;
  title: string;
  codeLabel?: string;
  subtitle?: string;
  prompt: string;
  colorTheme?: string;
  copiedBannerText?: string;
  copyButtonLabel?: string;
  maxHeight?: number | string;
  onCopy?: (text: string) => void;
}

export function PromptTerminalBox({
  title,
  codeLabel,
  subtitle,
  prompt,
  colorTheme = '#3b82f6',
  copiedBannerText,
  copyButtonLabel,
  maxHeight = 200,
  onCopy,
}: PromptTerminalBoxProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    if (onCopy) onCopy(prompt);
    setTimeout(() => {
      setIsCopied(false);
    }, 4000);
  };

  if (isCopied) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2.25,
          bgcolor: alpha(colorTheme, 0.06),
          borderRadius: '16px',
          border: `1px solid ${alpha(colorTheme, 0.25)}`,
          boxShadow: `0 4px 16px ${alpha(colorTheme, 0.08)}`,
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <CheckCircleIcon sx={{ color: colorTheme, fontSize: 22 }} />
          <Box>
            <Typography sx={{ color: colorTheme, fontWeight: 800, fontSize: '0.9rem' }}>
              {copiedBannerText || `${codeLabel || 'Prompt'} Copied to Clipboard!`}
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>
              Ready to paste directly into ChatGPT, Claude, or Gemini.
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          onClick={() => setIsCopied(false)}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '8px',
            color: colorTheme,
            px: 1.5,
            py: 0.5,
            bgcolor: alpha(colorTheme, 0.08),
            '&:hover': {
              bgcolor: alpha(colorTheme, 0.16),
            },
          }}
        >
          View Prompt Code
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: '#0f172a',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.16)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* 3-Dot macOS Window Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2.5,
          py: 1.6,
          bgcolor: '#1e293b',
          borderBottom: '1px solid #334155',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#ef4444' }} />
          <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#f59e0b' }} />
          <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#10b981' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {codeLabel && (
            <Chip
              label={codeLabel}
              size="small"
              sx={{
                bgcolor: colorTheme,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.68rem',
                height: 20,
                borderRadius: '6px',
              }}
            />
          )}
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ width: 33 }} />
      </Box>

      {/* Subtitle / Role context if provided */}
      {subtitle && (
        <Box
          sx={{
            px: 2.5,
            py: 1,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem', fontWeight: 500 }}>
            {subtitle}
          </Typography>
        </Box>
      )}

      {/* Monospace Code Body */}
      <Box
        sx={{
          p: 2.5,
          maxHeight,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'rgba(0,0,0,0.2)',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: '3px',
          },
        }}
      >
        <Typography
          component="pre"
          sx={{
            color: '#e2e8f0',
            fontFamily: '"JetBrains Mono", Consolas, Monaco, monospace',
            fontSize: '0.78rem',
            m: 0,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {prompt}
        </Typography>
      </Box>

      {/* Bottom Bar with Centered/Themed Pill Copy Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 1.75,
          bgcolor: '#1e293b',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Button
          onClick={handleCopy}
          sx={{
            bgcolor: colorTheme,
            color: '#ffffff',
            borderRadius: '16px',
            py: 1,
            px: 3.5,
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '0.84rem',
            boxShadow: `0 4px 14px ${alpha(colorTheme, 0.35)}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: colorTheme,
              filter: 'brightness(1.1)',
              transform: 'translateY(-1px)',
              boxShadow: `0 6px 18px ${alpha(colorTheme, 0.45)}`,
            },
          }}
        >
          <ContentCopyIcon sx={{ mr: 1, fontSize: 16 }} />
          {copyButtonLabel || `Copy ${codeLabel || 'Prompt'}`}
        </Button>
      </Box>
    </Box>
  );
}

export default PromptTerminalBox;
