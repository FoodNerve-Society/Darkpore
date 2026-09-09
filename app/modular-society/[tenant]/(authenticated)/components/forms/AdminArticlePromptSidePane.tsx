'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Drawer, Box, Typography, Button, IconButton, Chip, Paper, Alert,
  useTheme, useMediaQuery, alpha, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import RemoveIcon from '@mui/icons-material/Remove';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import { motion, AnimatePresence } from 'framer-motion';

import { PromptTerminalBox } from '@/components/prompts/PromptTerminalBox';
import { PromptChecklistItem } from '@/components/prompts/PromptChecklistItem';
import { PromptFastIngestBox } from '@/components/prompts/PromptFastIngestBox';
import { getCommodityMeta } from '@/lib/cms/commodities';
import { foodChallenges } from '@/lib/cms/food/challenges';
import { parseDoc1cArticles, ParsedArticleBrief } from '@/lib/config/editorialPrompts';
import { AdminCalendarArticleRecord } from '@/lib/cms/adminEditorialCalendar';
import { fetchAdminDayNodeAction } from '@/lib/actions/adminEditorial';
import {
  buildAdminDoc1aPrompt,
  buildAdminDoc1bPrompt,
  buildAdminDoc1cPrompt,
} from '@/lib/config/adminEditorialPrompts';

export interface AdminArticlePromptSidePaneProps {
  open: boolean;
  onClose: () => void;
  commodity: string;
  category: string;
  targetDate?: string;
  onIngest: (briefs: ParsedArticleBrief[]) => void;
}

export function AdminArticlePromptSidePane({
  open,
  onClose,
  commodity,
  category,
  targetDate,
  onIngest,
}: AdminArticlePromptSidePaneProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Side Pane Drawer & Dock State
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(false);

  // Active Day Node from 1820 Calendar (loaded on server)
  const [dayNode, setDayNode] = useState<AdminCalendarArticleRecord | null>(null);
  const [dayNodeJson, setDayNodeJson] = useState<string>('');
  const [loadingNode, setLoadingNode] = useState<boolean>(false);

  // Ingest state & local storage persistence
  const storageKey = `admin_editorial_ingest_${commodity}_${category}`;
  const [customIngestMarkdown, setCustomIngestMarkdown] = useState<string>('');
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState<boolean>(false);

  // 4-Step Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    step1: false, // Doc 1a Copied
    step2: false, // Doc 1b Copied
    step3: false, // Doc 1c Copied
    step4: false, // Ingested to Studio
  });

  // Fetch the active day node whenever the side pane opens or context changes
  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setLoadingNode(true);

    fetchAdminDayNodeAction({
      dateStr: targetDate,
      commodity,
      category,
    }).then(res => {
      if (isMounted && res.node) {
        setDayNode(res.node);
        setDayNodeJson(res.jsonPayload);
      }
    }).catch(err => {
      console.error('Failed to load admin calendar node:', err);
    }).finally(() => {
      if (isMounted) setLoadingNode(false);
    });

    return () => {
      isMounted = false;
    };
  }, [open, targetDate, commodity, category]);

  // Hydrate persisted markdown
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCustomIngestMarkdown(saved);
      }
    }
  }, [storageKey]);

  // Sync back to storage on changes
  const handleMarkdownChange = (val: string) => {
    setCustomIngestMarkdown(val);
    setIngestError(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, val);
    }
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Visual Squircles Metadata
  const commodityMeta = getCommodityMeta(commodity);
  const challengeMeta = foodChallenges.find(c => c.id === category) || {
    id: category,
    title: category.toUpperCase(),
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
  };

  // ─────────────────────────────────────────────────────────────
  // PROMPT 1: ADMIN DOC 1a (CALENDAR DAY ROW INGESTION & OSINT)
  // Ready to receive exact prompt text from user
  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────
  // PROMPTS 1, 2, 3: ADMIN MASTER PIPELINE
  // ─────────────────────────────────────────────────────────────
  const prompt1Text = useMemo(() => {
    return buildAdminDoc1aPrompt(dayNodeJson);
  }, [dayNodeJson]);

  const prompt2Text = useMemo(() => {
    return buildAdminDoc1bPrompt();
  }, []);

  const prompt3Text = useMemo(() => {
    return buildAdminDoc1cPrompt();
  }, []);

  // Live block detection count
  const detectedArticles = useMemo(() => {
    if (!customIngestMarkdown.trim()) return [];
    return parseDoc1cArticles(customIngestMarkdown, commodity);
  }, [customIngestMarkdown, commodity]);

  const handleIngest = useCallback(() => {
    if (detectedArticles.length === 0) {
      setIngestError('No valid articles detected. Please paste the markdown generated from Document 1c.');
      return;
    }

    setIngestSuccess(true);
    setChecklist(prev => ({ ...prev, step4: true }));
    onIngest(detectedArticles);

    setTimeout(() => {
      setIngestSuccess(false);
      onClose();
    }, 1200);
  }, [detectedArticles, onIngest, onClose]);

  // Handlers for minimize / restore
  const handleMinimize = () => {
    setIsMinimized(true);
    setIsDockVisible(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  const handleDismissDock = () => {
    setIsDockVisible(false);
    setIsMinimized(false);
    onClose();
  };

  return (
    <>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* FLOATING LIQUID GLASS DOCK WIDGET (WHEN MINIMIZED)          */}
      {/* ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMinimized && isDockVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1400,
            }}
          >
            <Paper
              elevation={0}
              onClick={handleRestore}
              sx={{
                p: 1.5,
                pr: 2,
                borderRadius: '20px',
                bgcolor: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#f59e0b',
                  boxShadow: '0 16px 40px rgba(245, 158, 11, 0.25)',
                },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                }}
              >
                <LockIcon sx={{ fontSize: 18 }} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.86rem' }}>
                    Admin Flow Dock
                  </Typography>
                  <Chip
                    label={dayNode?.['Article ID'] || '6 Articles'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                      fontWeight: 800,
                      fontSize: '0.66rem',
                      height: 18,
                    }}
                  />
                </Box>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.72rem' }}>
                  {commodity.split(',')[0]} • Click to expand
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismissDock();
                }}
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  p: 0.5,
                  '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.15)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* FULL ADMIN SLIDE-OVER DRAWER                                */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={open && !isMinimized}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: 580, md: 680 },
              maxWidth: '100vw',
              bgcolor: '#f8fafc',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1350,
            }
          }
        }}
      >
        {/* Sticky Glassmorphism Header */}
        <Box
          sx={{
            px: { xs: 2.25, sm: 3.5 },
            py: { xs: 2, sm: 2.25 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                flexShrink: 0,
              }}
            >
              <ShieldIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.25,
                    fontSize: { xs: '1.05rem', sm: '1.18rem' },
                    letterSpacing: '-0.025em',
                  }}
                >
                  Admins Article Flow
                </Typography>
                <Chip
                  label={dayNode?.['Article ID'] ? `🔒 ${dayNode['Article ID']}` : '🔒 1,820 CALENDAR'}
                  size="small"
                  sx={{
                    bgcolor: '#fef3c7',
                    color: '#b45309',
                    fontWeight: 900,
                    fontSize: '0.64rem',
                    height: 20,
                    borderRadius: '6px',
                  }}
                />
              </Box>
              <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.78rem', mt: 0.25 }}>
                Zero-input automated pipeline powered by pre-planned calendar row
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Minimize Button */}
            <Button
              size="small"
              onClick={handleMinimize}
              startIcon={<RemoveIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                bgcolor: 'rgba(0,0,0,0.04)',
                color: '#334155',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '12px',
                px: 1.5,
                py: 0.7,
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'none',
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' },
              }}
            >
              Minimize
            </Button>

            {/* Close Button */}
            <IconButton
              onClick={onClose}
              sx={{
                color: '#64748b',
                p: 1,
                borderRadius: '12px',
                '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.05)' },
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Scrollable Body Content */}
        <Box
          sx={{
            p: { xs: 2, sm: 3.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 1: ACTIVE DAY SQUIRCIES ANCHOR & PRE-PLANNED NODE    */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, sm: 2.75 },
              borderRadius: '24px',
              bgcolor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            {/* Visual Overlapping Squircles */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
              {/* Commodity Squircle */}
              <Box
                sx={{
                  width: { xs: 72, sm: 84 },
                  height: { xs: 72, sm: 84 },
                  borderRadius: '22px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${commodityMeta?.imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2.5px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.85) 100%)' }} />
                <Typography sx={{ position: 'absolute', bottom: 4, left: 2, right: 2, color: '#fff', fontSize: '0.62rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🌾 {(dayNode?.['Food Focus'] || commodity).split(',')[0]}
                </Typography>
              </Box>

              {/* Center Intersection Badge */}
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: '#f59e0b',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.74rem',
                  boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)',
                  zIndex: 2,
                }}
              >
                ✕
              </Box>

              {/* Challenge / Category Squircle */}
              <Box
                sx={{
                  width: { xs: 72, sm: 84 },
                  height: { xs: 72, sm: 84 },
                  borderRadius: '22px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${challengeMeta.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2.5px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.85) 100%)' }} />
                <Typography sx={{ position: 'absolute', bottom: 4, left: 2, right: 2, color: '#93c5fd', fontSize: '0.62rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🛡️ {(dayNode?.['Category'] || challengeMeta.title).slice(0, 10)}
                </Typography>
              </Box>
            </Box>

            {/* Calendar Node Intelligence Info */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              {loadingNode ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <CircularProgress size={16} sx={{ color: '#f59e0b' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>Loading Day Record...</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <CalendarMonthIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                    <Typography sx={{ color: '#f59e0b', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {dayNode?.['Publication Date'] || targetDate || 'Scheduled Day'} • {dayNode?.['Day'] || ''} • Global Week {dayNode?.['Global Week'] || 1}
                    </Typography>
                    <Chip
                      label={dayNode?.['Subcategory'] || 'Active Subcategory'}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(59, 130, 246, 0.2)',
                        color: '#93c5fd',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        height: 20,
                      }}
                    />
                  </Box>
                  <Typography sx={{ color: '#ffffff', fontWeight: 900, fontSize: '0.98rem', lineHeight: 1.35 }}>
                    "{dayNode?.['Publishing Headline / Editorial Title'] || dayNode?.['Article Working Title'] || 'Editorial Calendar Entry'}"
                  </Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', mt: 0.6 }}>
                    📍 Primary: {dayNode?.['Primary Country'] || dayNode?.['Candidate Country (Pre-Gate)'] || 'Authoritative Global Signal'} • 6 Pre-Planned Articles
                  </Typography>
                </>
              )}
            </Box>
          </Paper>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 2: 4-STEP ACTION CHECKLIST (3 PROMPTS + INGEST)      */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '0.92rem', letterSpacing: '-0.01em' }}>
              Execution Roadmap (3 Prompts + Fast Ingest)
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <PromptChecklistItem
                id="step1"
                text="1. Copy Admin Doc 1a (inserts active day JSON node directly with zero manual input)"
                checked={checklist.step1}
                onToggle={toggleChecklist}
                colorTheme="#f59e0b"
                isImportant={!checklist.step1}
              />
              <PromptChecklistItem
                id="step2"
                text="2. Copy Admin Doc 1b (runs Drucker sparring across the 6 pre-planned titles & spectrum ranks)"
                checked={checklist.step2}
                onToggle={toggleChecklist}
                colorTheme="#8b5cf6"
                isImportant={checklist.step1 && !checklist.step2}
              />
              <PromptChecklistItem
                id="step3"
                text="3. Copy Admin Doc 1c (compiles the 6 articles into the Studio Markdown Schema)"
                checked={checklist.step3}
                onToggle={toggleChecklist}
                colorTheme="#10b981"
                isImportant={checklist.step2 && !checklist.step3}
              />
              <PromptChecklistItem
                id="step4"
                text="4. Paste the output into the Fast Ingest box below and apply to your Studio board"
                checked={checklist.step4}
                onToggle={toggleChecklist}
                colorTheme="#10b981"
                isImportant={checklist.step3 && !checklist.step4}
              />
            </Box>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 3: ADMIN DOC 1a (STAGE-4 EVIDENCE & MACRO CONTEXT)   */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '0.96rem' }}>
                  Prompt 1: Admin Doc 1a (Stage-4 Grounded Evidence)
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.76rem' }}>
                  Injects the complete calendar JSON node for this day directly into your AI chat.
                </Typography>
              </Box>
            </Box>

            <PromptTerminalBox
              title="Admin Doc 1a"
              codeLabel="ADMIN 1a"
              subtitle="Direct row insertion containing FAOSTAT signals, research questions, and 6 planned titles."
              prompt={prompt1Text}
              colorTheme="#f59e0b"
              copiedBannerText="Admin Doc 1a Copied to Clipboard!"
              copyButtonLabel="Copy Admin Doc 1a Prompt"
              maxHeight={250}
              onCopy={() => {
                setChecklist(prev => ({ ...prev, step1: true }));
              }}
            />
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 4: ADMIN DOC 1b (DRUCKER SPARRING & SPECTRUM RANKS)  */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '0.96rem' }}>
                  Prompt 2: Admin Doc 1b (The Cognitive Spectrum & Drucker Sparring)
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.76rem' }}>
                  Maps the day's 6 pre-planned titles into Ranks 1 to 6 with deep operational friction.
                </Typography>
              </Box>
            </Box>

            <PromptTerminalBox
              title="Admin Doc 1b"
              codeLabel="ADMIN 1b"
              subtitle="Calibrates the 6 titles through Peter Drucker's 5 Cardinal Questions and political economy."
              prompt={prompt2Text}
              colorTheme="#8b5cf6"
              copiedBannerText="Admin Doc 1b Copied to Clipboard!"
              copyButtonLabel="Copy Admin Doc 1b Prompt"
              maxHeight={250}
              onCopy={() => {
                setChecklist(prev => ({ ...prev, step2: true }));
              }}
            />
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 5: ADMIN DOC 1c (MASTER STUDIO MARKDOWN COMPILER)    */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '0.96rem' }}>
                  Prompt 3: Admin Doc 1c (Master Studio Schema Compiler)
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.76rem' }}>
                  Compiles the 6 articles into the exact Studio metadata and 6-sentence schema.
                </Typography>
              </Box>
            </Box>

            <PromptTerminalBox
              title="Admin Doc 1c"
              codeLabel="ADMIN 1c"
              subtitle="Compiles exactly 6 articles matching the Studio metadata and 6-sentence schema."
              prompt={prompt3Text}
              colorTheme="#10b981"
              copiedBannerText="Admin Doc 1c Copied to Clipboard!"
              copyButtonLabel="Copy Admin Doc 1c Prompt"
              maxHeight={250}
              onCopy={() => {
                setChecklist(prev => ({ ...prev, step3: true }));
              }}
            />
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SECTION 6: FAST INGEST RELAY TERMINAL                        */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <PromptFastIngestBox
              value={customIngestMarkdown}
              onChange={handleMarkdownChange}
              onIngest={handleIngest}
              title="Fast Ingest: 6 Admin Articles Relay"
              subtitle="Paste the generated markdown output from Admin Doc 1c below to apply to the Studio."
              codeLabel="ADMIN INGEST"
              colorTheme="#10b981"
              placeholder={`Paste the markdown output from Admin Doc 1c here...\n\nExample:\n---\n[SYSTEM_METADATA]\n- Category: ${category}\n- Subcategory: ${dayNode?.['Subcategory'] || 'sub-logistics'}\n- Commodity: ${commodity}\n- Format: brief\n- Era: present\n- Location: ${dayNode?.['Primary Country'] || 'National Corridor'}\n- Spectrum_Rank: #1 The Bleeding Neck\n- Target_Persona: Agro-Allocators & Fleet Operators\n\n### Title of the Article...\n\n**Description:**\n- Sentence 1...\n- Sentence 2...\n- Sentence 3...\n- Sentence 4...\n- Sentence 5...\n- Sentence 6...\n---`}
              liveBlockCount={detectedArticles.length}
              expectedBlockCount={6}
              buttonLabel={`⚡ Ingest & Apply ${detectedArticles.length > 0 ? detectedArticles.length : 6} Admin Articles to Studio`}
              error={ingestError}
              success={ingestSuccess}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default AdminArticlePromptSidePane;
