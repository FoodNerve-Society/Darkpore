'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, Box, Typography, Button, LinearProgress, 
  Chip, CircularProgress, alpha
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ArticleFormat, ArticleEra, FORMAT_CONFIG, ERA_CONFIG } from '@/lib/config/articleBlueprints';
import { generateArticleBlocksPipeline, GeneratedBlockResult } from '@/lib/actions/articleDraftPipeline';

const PIPELINE_STEPS = [
  { label: 'Spiky Thesis & Contrarian Hook', desc: 'Crafting the contrarian editorial angle...' },
  { label: 'Executive Summary & Field Findings', desc: 'Extracting 3-4 key market takeaways...' },
  { label: 'Ground Intel & Numeric Benchmarks', desc: 'Synthesizing local pricing, loss metrics & corridors...' },
  { label: 'Deep Analysis & Showdown Matrix', desc: 'Benchmarking operational models & unit economics...' },
  { label: 'Strategic Directive & Next SOPs', desc: 'Formatting ready-to-execute operational directives...' }
];

export function PipelineGenerationModal({
  open,
  onClose,
  commodity,
  category,
  subcategory,
  format,
  era,
  title,
  description,
  targetPersona,
  pinnedClips = [],
  onSuccess,
  onFallbackManual
}: {
  open: boolean;
  onClose: () => void;
  commodity: string;
  category: string;
  subcategory: string;
  format: ArticleFormat;
  era: ArticleEra;
  title: string;
  description?: string;
  targetPersona?: string;
  pinnedClips?: string[];
  onSuccess: (result: { title: string; description: string; blocks: GeneratedBlockResult[] }) => void;
  onFallbackManual: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatMeta = FORMAT_CONFIG[format] || FORMAT_CONFIG.brief;
  const eraMeta = ERA_CONFIG[era] || ERA_CONFIG.present;

  // Step progression animation effect
  useEffect(() => {
    if (!open) {
      setCurrentStepIndex(0);
      setIsGenerating(false);
      setErrorMessage(null);
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setCurrentStepIndex(0);

    // Simulate gentle progressive steps while the server action runs
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < PIPELINE_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1400);

    // Run the actual Server Action in parallel
    generateArticleBlocksPipeline({
      commodity,
      category,
      subcategory,
      format,
      era,
      title,
      description,
      targetPersona,
      pinnedClips
    }).then((res) => {
      clearInterval(interval);
      if (res.success && res.blocks.length > 0) {
        setCurrentStepIndex(PIPELINE_STEPS.length);
        setTimeout(() => {
          setIsGenerating(false);
          onSuccess(res);
          onClose();
        }, 600);
      } else {
        setIsGenerating(false);
        setErrorMessage(res.error || 'Unable to complete AI drafting. You can continue by writing in the framework blueprint.');
      }
    }).catch((err) => {
      clearInterval(interval);
      setIsGenerating(false);
      setErrorMessage(err.message || 'An unexpected error occurred during generation.');
    });

    return () => clearInterval(interval);
  }, [open, commodity, category, subcategory, format, era, title, description, targetPersona, pinnedClips, onSuccess, onClose]);

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100));

  return (
    <Dialog
      open={open}
      onClose={isGenerating ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: 1,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(24px)',
            border: `1.5px solid ${alpha(formatMeta.color, 0.3)}`,
            boxShadow: `0 24px 60px ${alpha(formatMeta.color, 0.2)}`,
            overflow: 'hidden'
          }
        }
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        {/* Header Badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '12px',
              bgcolor: alpha(formatMeta.color, 0.15), color: formatMeta.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem'
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>
              AgroLLM Drafting Pipeline
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Chip
              label={`${formatMeta.emoji} ${formatMeta.label}`}
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: alpha(formatMeta.color, 0.12), color: formatMeta.color }}
            />
            <Chip
              label={`${eraMeta.emoji} ${eraMeta.label}`}
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: alpha(eraMeta.color, 0.12), color: eraMeta.color }}
            />
          </Box>
        </Box>

        {/* Target Title & Commodity */}
        <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.05)', mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a', lineHeight: 1.3, mb: 0.5 }}>
            {title || 'Untitled Strategic Article'}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
            🌾 {commodity} · 💼 {category} ({subcategory})
          </Typography>
          {pinnedClips.length > 0 && (
            <Chip
              label={`📎 Ingesting ${pinnedClips.length} Pinned Ground Note${pinnedClips.length > 1 ? 's' : ''}`}
              size="small"
              sx={{ mt: 1, height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: alpha('#059669', 0.12), color: '#059669' }}
            />
          )}
        </Box>

        {/* ─── Running State ─── */}
        {!errorMessage ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: formatMeta.color }}>
                  {isGenerating ? `Step ${Math.min(currentStepIndex + 1, PIPELINE_STEPS.length)} of ${PIPELINE_STEPS.length}` : 'Done!'}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>
                  {progressPercent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 8, borderRadius: 4,
                  bgcolor: 'rgba(0,0,0,0.06)',
                  '& .MuiLinearProgress-bar': { bgcolor: formatMeta.color, borderRadius: 4 }
                }}
              />
            </Box>

            {/* Stepper List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {PIPELINE_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex && isGenerating;
                const isPending = idx > currentStepIndex;

                return (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 1.25, px: 1.75, borderRadius: '12px',
                      bgcolor: isCurrent ? alpha(formatMeta.color, 0.08) : 'transparent',
                      border: `1px solid ${isCurrent ? alpha(formatMeta.color, 0.25) : 'transparent'}`,
                      transition: 'all 0.25s ease',
                      opacity: isPending ? 0.4 : 1
                    }}
                  >
                    <Box sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isPassed ? (
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                      ) : isCurrent ? (
                        <CircularProgress size={16} sx={{ color: formatMeta.color }} />
                      ) : (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.86rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#0f172a' : '#475569' }}>
                        {step.label}
                      </Typography>
                      {isCurrent && (
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic' }}>
                          {step.desc}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          /* ─── Fallback / Error State ─── */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'center', py: 1 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto'
            }}>
              <ErrorIcon sx={{ fontSize: 28 }} />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                AI Generation Fallback
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mt: 0.5, lineHeight: 1.4 }}>
                {errorMessage}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ borderRadius: '12px', fontWeight: 700, color: '#64748b', borderColor: 'rgba(0,0,0,0.15)' }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  onClose();
                  onFallbackManual();
                }}
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: '12px', fontWeight: 800, bgcolor: '#0f172a', color: '#fff' }}
              >
                ✍️ Write in Framework Blueprint
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
