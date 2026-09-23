'use client';

import React from 'react';
import { Box, Typography, Button, Chip, alpha, TextField, LinearProgress } from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

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
  title = 'Fast Ingest Relay & Canvas Import',
  subtitle = 'Paste your generated JSON or markdown payload below to populate your blocks onto the canvas.',
  codeLabel = 'DOC 4b',
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
        borderRadius: '22px',
        bgcolor: '#0b1220',
        border: `1px solid ${alpha(colorTheme, 0.28)}`,
        boxShadow: `0 22px 50px -16px ${alpha(colorTheme, 0.38)}, 0 10px 28px rgba(0, 0, 0, 0.32)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(90% 70% at 0% -10%, ${alpha(colorTheme, 0.22)}, transparent 58%), radial-gradient(70% 50% at 100% 100%, ${alpha('#38bdf8', 0.08)}, transparent 50%)`,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
          px: { xs: 2.25, sm: 2.75 },
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '13px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(145deg, ${colorTheme} 0%, #047857 100%)`,
              boxShadow: `0 8px 20px ${alpha(colorTheme, 0.4)}`,
              border: '1px solid rgba(255, 255, 255, 0.22)',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.45, flexWrap: 'wrap' }}>
              {codeLabel && (
                <Chip
                  label={codeLabel}
                  size="small"
                  sx={{
                    height: 20,
                    borderRadius: '6px',
                    bgcolor: alpha(colorTheme, 0.16),
                    color: colorTheme,
                    fontWeight: 900,
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                    border: `1px solid ${alpha(colorTheme, 0.35)}`,
                  }}
                />
              )}
              <Typography
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: alpha('#fff', 0.45),
                }}
              >
                Payload Terminal
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 900, color: '#f8fafc', fontSize: '1.02rem', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: 'rgba(226, 232, 240, 0.62)', mt: 0.45, lineHeight: 1.45, fontWeight: 500 }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Button
            size="small"
            onClick={handlePasteFromClipboard}
            startIcon={<ContentPasteIcon sx={{ fontSize: '15px !important' }} />}
            sx={{
              color: colorTheme,
              bgcolor: alpha(colorTheme, 0.12),
              border: `1px solid ${alpha(colorTheme, 0.28)}`,
              fontWeight: 800,
              borderRadius: '10px',
              px: 1.4,
              py: 0.55,
              fontSize: '0.74rem',
              textTransform: 'none',
              '&:hover': { bgcolor: alpha(colorTheme, 0.2) },
            }}
          >
            {hasPayload ? 'Replace' : 'Paste'}
          </Button>
          {hasPayload && (
            <Button
              size="small"
              onClick={handleClear}
              sx={{
                color: 'rgba(148, 163, 184, 0.9)',
                fontWeight: 700,
                borderRadius: '10px',
                px: 1.1,
                py: 0.55,
                fontSize: '0.74rem',
                textTransform: 'none',
                '&:hover': { color: '#fca5a5', bgcolor: 'rgba(239, 68, 68, 0.12)' },
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ position: 'relative', px: { xs: 2.25, sm: 2.75 }, py: 2.25, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            bgcolor: '#060b14',
            border: `1px solid ${hasPayload ? alpha(colorTheme, 0.32) : 'rgba(255, 255, 255, 0.08)'}`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:focus-within': {
              borderColor: alpha(colorTheme, 0.55),
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 3px ${alpha(colorTheme, 0.16)}`,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.75,
              py: 0.85,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography sx={{ ml: 1, fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(148, 163, 184, 0.8)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                payload.json
              </Typography>
            </Box>
            <Chip
              size="small"
              label={hasPayload ? `${value.trim().length.toLocaleString()} chars` : 'empty'}
              sx={{
                height: 18,
                fontSize: '0.6rem',
                fontWeight: 800,
                bgcolor: 'rgba(255,255,255,0.06)',
                color: 'rgba(226, 232, 240, 0.7)',
              }}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            minRows={7}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              placeholder ||
              `{\n  "title": "Strategic Title...",\n  "description": "...",\n  "blocks": [\n    { "type": "subheading", "content": { ... } }\n  ]\n}`
            }
            variant="filled"
            slotProps={{ input: { disableUnderline: true } }}
            sx={{
              '& .MuiFilledInput-root': {
                bgcolor: 'transparent',
                alignItems: 'flex-start',
                p: 0,
                '&:hover, &.Mui-focused': { bgcolor: 'transparent' },
              },
              '& .MuiInputBase-input': {
                px: 1.85,
                py: 1.6,
                color: '#e2e8f0',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                fontSize: '0.78rem',
                lineHeight: 1.7,
                fontWeight: 500,
                caretColor: colorTheme,
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(148, 163, 184, 0.55)',
                opacity: 1,
                whiteSpace: 'pre-wrap',
              },
            }}
          />
        </Box>

        <Box
          sx={{
            borderRadius: '14px',
            px: 1.75,
            py: 1.35,
            bgcolor: alpha(isComplete ? colorTheme : '#fff', isComplete ? 0.1 : 0.03),
            border: `1px solid ${alpha(isComplete ? colorTheme : '#fff', isComplete ? 0.32 : 0.06)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
              {isComplete ? (
                <CheckCircleIcon sx={{ color: colorTheme, fontSize: 18 }} />
              ) : (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: hasPayload ? '#f59e0b' : 'rgba(148,163,184,0.5)', boxShadow: hasPayload ? '0 0 8px #f59e0b' : 'none' }} />
              )}
              <Typography sx={{ color: isComplete ? colorTheme : 'rgba(226, 232, 240, 0.78)', fontWeight: 800, fontSize: '0.78rem' }}>
                {isComplete
                  ? `Ready · ${liveBlockCount}${expectedBlockCount ? ` of ${expectedBlockCount}` : ''} blocks detected`
                  : liveBlockCount > 0
                    ? `Partial · ${liveBlockCount}${expectedBlockCount ? ` of ${expectedBlockCount}` : ''} blocks found`
                    : 'Awaiting valid payload'}
              </Typography>
            </Box>
            {expectedBlockCount ? (
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(148, 163, 184, 0.9)', letterSpacing: '0.06em' }}>
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
              bgcolor: 'rgba(255,255,255,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 99,
                background: isComplete
                  ? `linear-gradient(90deg, ${colorTheme}, #34d399)`
                  : `linear-gradient(90deg, ${alpha(colorTheme, 0.45)}, ${colorTheme})`,
              },
            }}
          />
        </Box>

        {error && (
          <Box
            sx={{
              px: 1.75,
              py: 1.2,
              borderRadius: '12px',
              bgcolor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.28)',
            }}
          >
            <Typography sx={{ color: '#fca5a5', fontSize: '0.8rem', fontWeight: 700 }}>
              {error}
            </Typography>
          </Box>
        )}

        {success && (
          <Box
            sx={{
              px: 1.75,
              py: 1.2,
              borderRadius: '12px',
              bgcolor: alpha(colorTheme, 0.12),
              border: `1px solid ${alpha(colorTheme, 0.32)}`,
            }}
          >
            <Typography sx={{ color: colorTheme, fontSize: '0.82rem', fontWeight: 800 }}>
              Ingested. Blocks applied to the canvas.
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={onIngest}
          disabled={!hasPayload || isIngesting}
          startIcon={<BoltIcon sx={{ fontSize: 20 }} />}
          sx={{
            background: `linear-gradient(135deg, ${colorTheme} 0%, #047857 100%)`,
            color: '#ffffff',
            fontWeight: 900,
            py: 1.5,
            borderRadius: '14px',
            fontSize: '0.92rem',
            letterSpacing: '-0.02em',
            textTransform: 'none',
            boxShadow: `0 10px 28px ${alpha(colorTheme, 0.38)}`,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              background: `linear-gradient(135deg, #34d399 0%, ${colorTheme} 100%)`,
              transform: 'translateY(-1px)',
              boxShadow: `0 14px 32px ${alpha(colorTheme, 0.48)}`,
            },
            '&.Mui-disabled': {
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(148, 163, 184, 0.7)',
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
