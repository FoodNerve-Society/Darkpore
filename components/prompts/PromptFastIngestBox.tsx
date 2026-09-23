'use client';

import React from 'react';
import { Box, Typography, Button, Chip, alpha, LinearProgress } from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';

export interface PromptFastIngestBoxProps {
  value: string;
  onChange: (val: string) => void;
  onIngest: () => void;
  title?: string;
  subtitle?: string;
  codeLabel?: string;
  colorTheme?: string;
  placeholder?: string;
  error?: string | null;
  success?: boolean;
  liveBlockCount?: number;
  expectedBlockCount?: number;
  buttonLabel?: string;
  isIngesting?: boolean;
}

export function PromptFastIngestBox({
  value,
  onChange,
  onIngest,
  colorTheme = '#10b981',
  placeholder,
  error,
  success = false,
  liveBlockCount = 0,
  expectedBlockCount,
  buttonLabel = 'Ingest & Apply All Blocks to Canvas',
  isIngesting = false,
}: PromptFastIngestBoxProps) {
  const hasPayload = Boolean(value.trim());
  const isComplete =
    liveBlockCount > 0 &&
    (!expectedBlockCount || liveBlockCount === expectedBlockCount);
  const progress = expectedBlockCount && expectedBlockCount > 0
    ? Math.min(100, (liveBlockCount / expectedBlockCount) * 100)
    : liveBlockCount > 0
      ? 100
      : 0;

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '20px',
        bgcolor: '#ffffff',
        border: '1.5px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Light Mode Clean Top Action Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label="payload.json"
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 800,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              bgcolor: '#ffffff',
              color: '#334155',
              border: '1px solid #e2e8f0',
            }}
          />
          {hasPayload && (
            <Chip
              size="small"
              label={`${value.trim().length.toLocaleString()} chars`}
              sx={{
                height: 20,
                fontSize: '0.64rem',
                fontWeight: 700,
                bgcolor: alpha(colorTheme, 0.08),
                color: colorTheme,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Button
            size="small"
            onClick={handlePasteFromClipboard}
            startIcon={<ContentPasteIcon sx={{ fontSize: '15px !important' }} />}
            sx={{
              color: colorTheme,
              bgcolor: alpha(colorTheme, 0.08),
              border: `1px solid ${alpha(colorTheme, 0.25)}`,
              fontWeight: 800,
              borderRadius: '10px',
              px: 1.5,
              py: 0.5,
              fontSize: '0.76rem',
              textTransform: 'none',
              '&:hover': { bgcolor: alpha(colorTheme, 0.16) },
            }}
          >
            {hasPayload ? 'Replace' : 'Paste'}
          </Button>
          {hasPayload && (
            <Button
              size="small"
              onClick={handleClear}
              sx={{
                color: '#64748b',
                fontWeight: 700,
                borderRadius: '10px',
                px: 1.25,
                py: 0.5,
                fontSize: '0.74rem',
                textTransform: 'none',
                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)' },
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* Editor & Actions Body */}
      <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Ingest Text Field using PremiumMarkdownEditor */}
        <Box sx={{ width: '100%' }}>
          <PremiumMarkdownEditor
            colorTheme={colorTheme}
            value={value}
            onChange={(e: any) => {
              const val = e?.target ? e.target.value : (typeof e === 'string' ? e : '');
              onChange(val);
            }}
            minRows={7}
            rows={8}
            placeholder={
              placeholder ||
              `{\n  "title": "Strategic Title...",\n  "description": "...",\n  "blocks": [\n    { "type": "subheading", "content": { ... } }\n  ]\n}`
            }
          />
        </Box>

        {/* Live Block Detection & Progress Meter */}
        <Box
          sx={{
            borderRadius: '14px',
            px: 2,
            py: 1.35,
            bgcolor: isComplete ? alpha(colorTheme, 0.06) : '#f8fafc',
            border: `1px solid ${isComplete ? alpha(colorTheme, 0.3) : 'rgba(226, 232, 240, 0.9)'}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.85 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
              {isComplete ? (
                <CheckCircleIcon sx={{ color: colorTheme, fontSize: 18 }} />
              ) : (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: hasPayload ? '#f59e0b' : '#94a3b8',
                    boxShadow: hasPayload ? '0 0 8px #f59e0b' : 'none',
                  }}
                />
              )}
              <Typography
                sx={{
                  color: isComplete ? colorTheme : '#334155',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                }}
              >
                {isComplete
                  ? `Ready · ${liveBlockCount}${expectedBlockCount ? ` of ${expectedBlockCount}` : ''} blocks detected`
                  : liveBlockCount > 0
                    ? `Partial · ${liveBlockCount}${expectedBlockCount ? ` of ${expectedBlockCount}` : ''} blocks found`
                    : 'Awaiting valid payload'}
              </Typography>
            </Box>
            {expectedBlockCount ? (
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>
                {liveBlockCount}/{expectedBlockCount}
              </Typography>
            ) : null}
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 5,
              borderRadius: 99,
              bgcolor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 99,
                background: isComplete
                  ? `linear-gradient(90deg, ${colorTheme}, #34d399)`
                  : `linear-gradient(90deg, ${alpha(colorTheme, 0.45)}, ${colorTheme})`,
              },
            }}
          />
        </Box>

        {/* Error message */}
        {error && (
          <Box
            sx={{
              px: 1.75,
              py: 1.2,
              borderRadius: '12px',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <Typography sx={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 700 }}>
              {error}
            </Typography>
          </Box>
        )}

        {/* Success message */}
        {success && (
          <Box
            sx={{
              px: 1.75,
              py: 1.2,
              borderRadius: '12px',
              bgcolor: alpha(colorTheme, 0.08),
              border: `1px solid ${alpha(colorTheme, 0.3)}`,
            }}
          >
            <Typography sx={{ color: colorTheme, fontSize: '0.82rem', fontWeight: 800 }}>
              ✓ Ingested successfully. Blocks applied to the canvas.
            </Typography>
          </Box>
        )}

        {/* Primary Action Ingest Button */}
        <Button
          variant="contained"
          onClick={onIngest}
          disabled={!hasPayload || isIngesting}
          startIcon={<BoltIcon sx={{ fontSize: 20 }} />}
          sx={{
            background: `linear-gradient(135deg, ${colorTheme} 0%, #047857 100%)`,
            color: '#ffffff',
            fontWeight: 900,
            py: 1.35,
            borderRadius: '14px',
            fontSize: '0.9rem',
            letterSpacing: '-0.01em',
            textTransform: 'none',
            boxShadow: `0 6px 18px ${alpha(colorTheme, 0.32)}`,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              background: `linear-gradient(135deg, #34d399 0%, ${colorTheme} 100%)`,
              transform: 'translateY(-1px)',
              boxShadow: `0 8px 24px ${alpha(colorTheme, 0.42)}`,
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(0, 0, 0, 0.06)',
              color: '#94a3b8',
              boxShadow: 'none',
            },
          }}
        >
          {buttonLabel.replace(/^⚡\s*/, '')}
        </Button>
      </Box>
    </Box>
  );
}

export default PromptFastIngestBox;
