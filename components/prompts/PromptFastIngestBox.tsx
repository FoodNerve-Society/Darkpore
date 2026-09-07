'use client';

import React from 'react';
import { Box, Typography, Button, Paper, Alert, Chip, alpha } from '@mui/material';
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
  title = 'Fast Ingest Relay & Canvas Import',
  subtitle = 'Paste your generated JSON or markdown payload below to populate your blocks onto the canvas.',
  codeLabel = 'DOC 4b',
  colorTheme = '#10b981',
  placeholder,
  error,
  success = false,
  liveBlockCount = 0,
  expectedBlockCount,
  buttonLabel = '⚡ Ingest & Apply All Blocks to Canvas',
  isIngesting = false,
}: PromptFastIngestBoxProps) {
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
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.25, sm: 2.75 },
        borderRadius: '20px',
        bgcolor: '#ffffff',
        border: `2px solid ${alpha(colorTheme, 0.35)}`,
        boxShadow: `0 10px 30px -4px ${alpha(colorTheme, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {codeLabel && (
            <Chip
              label={codeLabel}
              size="small"
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.72rem',
                height: 22,
                borderRadius: '6px',
              }}
            />
          )}
          <Box>
            <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.98rem', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748b', mt: 0.2 }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>

        {value.trim() ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              onClick={handlePasteFromClipboard}
              startIcon={<ContentPasteIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                color: '#059669',
                bgcolor: 'rgba(16, 185, 129, 0.08)',
                fontWeight: 800,
                borderRadius: '8px',
                px: 1.5,
                py: 0.4,
                fontSize: '0.76rem',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.16)' },
              }}
            >
              Replace from Clipboard
            </Button>
            <Button
              size="small"
              onClick={handleClear}
              sx={{
                color: '#94a3b8',
                fontWeight: 700,
                borderRadius: '8px',
                px: 1,
                py: 0.4,
                fontSize: '0.76rem',
                textTransform: 'none',
                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)' },
              }}
            >
              Clear
            </Button>
          </Box>
        ) : null}
      </Box>

      {/* Dashed Large Button When Empty */}
      {!value.trim() && (
        <Button
          variant="outlined"
          onClick={handlePasteFromClipboard}
          startIcon={<ContentPasteIcon sx={{ fontSize: 20 }} />}
          sx={{
            py: 2.2,
            borderRadius: '16px',
            border: `2px dashed ${colorTheme}`,
            bgcolor: alpha(colorTheme, 0.04),
            color: '#059669',
            fontWeight: 900,
            fontSize: '0.92rem',
            textTransform: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.2,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: alpha(colorTheme, 0.1),
              borderColor: '#047857',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Tap to Paste from Clipboard
        </Button>
      )}

      {/* Premium Markdown / JSON Editor */}
      <PremiumMarkdownEditor
        colorTheme={colorTheme}
        minRows={6}
        fullWidth
        placeholder={
          placeholder ||
          `{\n  "title": "Strategic Title...",\n  "description": "...",\n  "blocks": [\n    { "type": "subheading", "content": { ... } }\n  ]\n}`
        }
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
      />

      {/* Live Detection Pill Banner */}
      {liveBlockCount > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 1.75,
            bgcolor: '#ecfdf5',
            borderRadius: '14px',
            border: '1.5px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: '#059669', fontSize: 20 }} />
            <Typography sx={{ color: '#065f46', fontWeight: 900, fontSize: '0.86rem' }}>
              ✓ Live Detection: {liveBlockCount} valid {expectedBlockCount ? `of ${expectedBlockCount}` : ''} blocks detected in payload!
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Feedback Alerts */}
      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '0.82rem', fontWeight: 600 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ borderRadius: '12px', fontWeight: 800, fontSize: '0.84rem' }}>
          ✓ Successfully ingested and applied blocks to canvas!
        </Alert>
      )}

      {/* Primary Ingest CTA Button */}
      <Button
        variant="contained"
        onClick={onIngest}
        disabled={!value.trim() || isIngesting}
        startIcon={<BoltIcon sx={{ fontSize: 20 }} />}
        sx={{
          bgcolor: '#0f172a',
          color: '#ffffff',
          fontWeight: 900,
          py: 1.45,
          borderRadius: '16px',
          fontSize: '0.94rem',
          textTransform: 'none',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            bgcolor: '#1e293b',
            transform: 'translateY(-1px)',
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.35)',
          },
          '&.Mui-disabled': {
            bgcolor: '#e2e8f0',
            color: '#94a3b8',
          },
        }}
      >
        {buttonLabel}
      </Button>
    </Paper>
  );
}

export default PromptFastIngestBox;
