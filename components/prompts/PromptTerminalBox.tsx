'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

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
  isCopiedExternal?: boolean;
}

export function PromptTerminalBox({
  title,
  codeLabel,
  subtitle,
  prompt,
  colorTheme = '#3b82f6',
  copiedBannerText,
  copyButtonLabel,
  maxHeight = 220,
  onCopy,
  isCopiedExternal,
}: PromptTerminalBoxProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [justReCopied, setJustReCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setIsMinimized(true);
    if (onCopy) onCopy(prompt);
  };

  const handleQuickCopyAgain = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    setJustReCopied(true);
    if (onCopy) onCopy(prompt);
    setTimeout(() => {
      setJustReCopied(false);
    }, 2000);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(false);
    setIsCopied(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MINIMIZED COPIED STATE (DARK MODE WITH COMPACT EXPAND ACTION)
  // ═══════════════════════════════════════════════════════════════════════════
  if (isMinimized) {
    return (
      <Box
        sx={{
          bgcolor: '#0f172a',
          borderRadius: '14px',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25), 0 0 14px rgba(16, 185, 129, 0.1)',
          px: { xs: 1.75, sm: 2.25 },
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          {/* Green Verified Checkmark */}
          <CheckCircleIcon sx={{ color: '#10b981', fontSize: 19, flexShrink: 0 }} />

          {/* Code Label Badge - Non-wrapping Box immune to MUI Chip clipping */}
          {codeLabel && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1,
                py: 0.4,
                borderRadius: '6px',
                bgcolor: '#10b981',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.68rem',
                lineHeight: 1,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {codeLabel}
            </Box>
          )}

          {/* Title with ellipsis if long */}
          <Typography
            sx={{
              color: '#f1f5f9',
              fontWeight: 800,
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: '#34d399',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: { xs: 'none', md: 'inline-block' },
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            · Copied to Clipboard
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {/* Re-copy button */}
          <Button
            size="small"
            onClick={handleQuickCopyAgain}
            startIcon={<ContentCopyIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              color: '#94a3b8',
              bgcolor: 'rgba(255, 255, 255, 0.06)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              px: 1.25,
              py: 0.4,
              borderRadius: '8px',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' },
            }}
          >
            {justReCopied ? 'Copied!' : 'Re-copy'}
          </Button>

          {/* Expand button to return to uncopied full terminal */}
          <Button
            size="small"
            onClick={handleExpand}
            endIcon={<OpenInFullIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              color: '#38bdf8',
              bgcolor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'none',
              px: 1.5,
              py: 0.4,
              borderRadius: '8px',
              transition: 'all 0.18s ease',
              '&:hover': {
                bgcolor: 'rgba(56, 189, 248, 0.2)',
                borderColor: '#38bdf8',
                transform: 'scale(1.02)',
              },
            }}
          >
            Expand
          </Button>
        </Box>
      </Box>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NORMAL UNCOPIED STATE (FULL DARK MODE TERMINAL)
  // ═══════════════════════════════════════════════════════════════════════════
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {/* Custom Non-wrapping Code Label Badge (No multi-line wrapping or clipping) */}
          {codeLabel && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1.1,
                py: 0.4,
                borderRadius: '6px',
                bgcolor: colorTheme,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.7rem',
                lineHeight: 1,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {codeLabel}
            </Box>
          )}

          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
