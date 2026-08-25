'use client';

import React from 'react';
import { Box, Typography, Button, Chip, Tooltip, alpha } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PushPinIcon from '@mui/icons-material/PushPin';
import { ArticleFormat, ArticleEra, FORMAT_CONFIG, ERA_CONFIG, getBlueprint } from '@/lib/config/articleBlueprints';

export function ArticleActionHub({
  format,
  era,
  commodity,
  category,
  subcategoryTitle,
  blocksCount,
  pinnedClipsCount = 0,
  onOpenAIDrafter,
  onLoadManualBlueprint,
  onOpenClipDrawer
}: {
  format: ArticleFormat;
  era: ArticleEra;
  commodity: string;
  category: string;
  subcategoryTitle?: string;
  blocksCount: number;
  pinnedClipsCount?: number;
  onOpenAIDrafter: () => void;
  onLoadManualBlueprint: () => void;
  onOpenClipDrawer?: () => void;
}) {
  const formatMeta = FORMAT_CONFIG[format] || FORMAT_CONFIG.brief;
  const eraMeta = ERA_CONFIG[era] || ERA_CONFIG.present;
  const blueprint = getBlueprint(format, era);

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: '24px',
        bgcolor: '#ffffff',
        border: `2px solid ${alpha(formatMeta.color, 0.2)}`,
        boxShadow: `0 12px 36px ${alpha(formatMeta.color, 0.08)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        mb: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Subtle Gradient Accent */}
      <Box sx={{
        position: 'absolute', top: 0, right: 0, width: 220, height: 220,
        background: `radial-gradient(circle, ${alpha(formatMeta.color, 0.08)} 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      {/* Top Meta Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '12px',
            bgcolor: alpha(formatMeta.color, 0.14), color: formatMeta.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 900
          }}>
            {formatMeta.emoji}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.2 }}>
              {formatMeta.label} ({eraMeta.label} Era)
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
              🎯 {subcategoryTitle || 'Selected Subcategory'} · {blueprint.length} Blocks SOP
            </Typography>
          </Box>
        </Box>

        {/* Pinned Clip Notes Context Pill */}
        {pinnedClipsCount > 0 && onOpenClipDrawer && (
          <Tooltip title="View attached field notes that will be used as ground intelligence">
            <Chip
              icon={<PushPinIcon sx={{ fontSize: 13, color: '#059669 !important' }} />}
              label={`${pinnedClipsCount} Pinned Ground Note${pinnedClipsCount > 1 ? 's' : ''}`}
              size="small"
              onClick={onOpenClipDrawer}
              sx={{
                height: 24, fontSize: '0.72rem', fontWeight: 800,
                bgcolor: alpha('#059669', 0.12), color: '#059669',
                border: `1px solid ${alpha('#059669', 0.3)}`,
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha('#059669', 0.22) }
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Primary Action Buttons */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        gap: 2
      }}>
        {/* Option 1: AI Co-Drafting */}
        <Box
          onClick={onOpenAIDrafter}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: alpha(formatMeta.color, 0.05),
            border: `2px solid ${alpha(formatMeta.color, 0.35)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            cursor: 'pointer',
            transition: 'all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&:hover': {
              bgcolor: alpha(formatMeta.color, 0.1),
              borderColor: formatMeta.color,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 24px ${alpha(formatMeta.color, 0.2)}`
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '10px',
              bgcolor: formatMeta.color, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            </Box>
            <Chip
              label="Recommended"
              size="small"
              sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: alpha(formatMeta.color, 0.2), color: formatMeta.color }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
              Co-Draft with AgroLLM
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.25, lineHeight: 1.4 }}>
              Execute our 5-step intelligence pipeline to draft research-backed analysis across all {blueprint.length} blocks.
            </Typography>
          </Box>
        </Box>

        {/* Option 2: Manual SOP Framework */}
        <Box
          onClick={onLoadManualBlueprint}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: 'rgba(0,0,0,0.02)',
            border: '2px solid rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            cursor: 'pointer',
            transition: 'all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&:hover': {
              bgcolor: '#ffffff',
              borderColor: '#0f172a',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '10px',
              bgcolor: '#0f172a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <EditNoteIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
              Manual Writing
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
              Write Yourself
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.25, lineHeight: 1.4 }}>
              Instantiate clean empty block scaffolds and write each section manually with structured SOP guidance.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
