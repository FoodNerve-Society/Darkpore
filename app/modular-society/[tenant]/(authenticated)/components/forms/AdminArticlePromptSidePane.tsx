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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { motion, AnimatePresence } from 'framer-motion';

import { PromptTerminalBox } from '@/components/prompts/PromptTerminalBox';
import { PromptChecklistItem } from '@/components/prompts/PromptChecklistItem';
import { PromptFastIngestBox } from '@/components/prompts/PromptFastIngestBox';
import PremiumDropdown from '@/components/PremiumDropdown';
import { getCommodityMeta } from '@/lib/cms/commodities';
import { foodChallenges } from '@/lib/cms/food/challenges';
import { parseDoc1cArticles, ParsedArticleBrief } from '@/lib/config/editorialPrompts';
import { AdminCalendarArticleRecord, AdminCalendarOption } from '@/lib/cms/adminEditorialCalendar';
import { fetchAdminDayNodeAction } from '@/lib/actions/adminEditorial';
import {
  buildAdminDoc1aPrompt,
  buildAdminDoc1bPrompt,
  buildAdminDoc1cPrompt,
} from '@/lib/config/adminEditorialPrompts';

const CATEGORY_SHORT_NAMES: Record<string, string> = {
  'capital': 'Capital',
  'financial exclusion': 'Capital',
  'land': 'Land Access',
  'land access': 'Land Access',
  'inputs': 'Agro Inputs',
  'agricultural inputs': 'Agro Inputs',
  'energy': 'Energy',
  'energy poverty': 'Energy',
  'insecurity': 'Insecurity',
  'food-system insecurity': 'Insecurity',
  'harvest-to-market': 'Post-Harvest',
  'post-harvest': 'Post-Harvest',
  'people': 'People & Skills',
  'people, skills': 'People & Skills',
};

function getCategoryShortName(cat?: string, fallbackId?: string): string {
  const target = (cat || fallbackId || '').toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_SHORT_NAMES)) {
    if (target.includes(key)) return val;
  }
  return cat ? cat.split(/[\s,&-]+/)[0] : 'Challenge';
}

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

  // Active Day Node & Available Calendar Options from 1820 Calendar
  const [dayNode, setDayNode] = useState<AdminCalendarArticleRecord | null>(null);
  const [dayNodeJson, setDayNodeJson] = useState<string>('');
  const [calendarOptions, setCalendarOptions] = useState<AdminCalendarOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<AdminCalendarOption | null>(null);
  const [loadingNode, setLoadingNode] = useState<boolean>(false);

  // Ingest state & local storage persistence
  const storageKey = `admin_editorial_ingest_${commodity}_${category}`;
  const [customIngestMarkdown, setCustomIngestMarkdown] = useState<string>('');
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState<boolean>(false);

  // High-level execution roadmap & checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    step0_ai: false, // Step 0: Open AI in new tab
    step0_seq: false, // Step 0: Sequential prompt workflow
    step1: false,    // Step 1: Doc 1a Copied
    step2: false,    // Step 2: Doc 1b Copied
    step3: false,    // Step 3: Doc 1c Copied
    step4: false,    // Step 4: Ingested to Studio
  });

  const toggleChecklist = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dedicated Per-Prompt Verifications (strictly 2 high-signal items each)
  const [promptChecks, setPromptChecks] = useState<Record<string, boolean>>({
    // Step 1 (Doc 1a)
    '1a-payload-evidence': false,
    '1a-titles-macro': false,

    // Step 2 (Doc 1b)
    '1b-context-drucker': false,
    '1b-spectrum-osint': false,

    // Step 3 (Doc 1c)
    '1c-format-sentence': false,
    '1c-schema-articles': false,

    // Step 4 (Fast Ingest)
    'ingest-syntax': false,
    'ingest-apply': false,
  });

  const togglePromptCheck = (id: string) => {
    setPromptChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
        if (res.options && res.options.length > 0) {
          setCalendarOptions(res.options);
          const currentArticleId = res.node['Article ID'];
          const matchedOpt = res.options.find(o => o.id === currentArticleId);
          if (matchedOpt) {
            setSelectedOption(matchedOpt);
          } else {
            setSelectedOption(res.options[0]);
          }
        }
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

  // Handle switching subcategory / date via Autocomplete
  const handleSelectOption = useCallback((opt: AdminCalendarOption) => {
    setSelectedOption(opt);
    setLoadingNode(true);
    fetchAdminDayNodeAction({
      articleId: opt.id,
      commodity,
    }).then(res => {
      if (res.node) {
        setDayNode(res.node);
        setDayNodeJson(res.jsonPayload);
      }
    }).catch(err => {
      console.error('Failed to load selected day node:', err);
    }).finally(() => {
      setLoadingNode(false);
    });
  }, [commodity]);

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

  // Visual Squircles Metadata
  const commodityMeta = getCommodityMeta(commodity);
  const challengeMeta = foodChallenges.find(c => c.id === category) || {
    id: category,
    title: category.toUpperCase(),
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
  };

  const categoryShortName = useMemo(() => {
    return getCategoryShortName(dayNode?.['Category'] || category, challengeMeta?.id);
  }, [dayNode, category, challengeMeta]);

  // Determine if today's date matches the calendar entry
  const isToday = useMemo(() => {
    if (!dayNode?.['Publication Date']) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return dayNode['Publication Date'] === todayStr;
  }, [dayNode]);

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

  // Auto-sync ingest checklist based on markdown state
  useEffect(() => {
    if (detectedArticles.length > 0) {
      setPromptChecks(prev => ({
        ...prev,
        'ingest-syntax': true,
      }));
    } else {
      setPromptChecks(prev => ({
        ...prev,
        'ingest-syntax': false,
      }));
    }
  }, [detectedArticles.length]);

  const handleIngest = useCallback(() => {
    if (detectedArticles.length === 0) {
      setIngestError('No valid articles detected. Please paste the markdown generated from Document 1c.');
      return;
    }

    setIngestSuccess(true);
    setChecklist(prev => ({ ...prev, step4: true }));
    setPromptChecks(prev => ({ ...prev, 'ingest-apply': true }));
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
            bgcolor: 'rgba(255, 255, 255, 0.94)',
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
            gap: 4,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* ──────────────────────────────────────────────────────────── */}
          {/* VISUAL ANCHOR: FREE-FLOATING SQUIRCLES (NO BOUNDING BOX)     */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              pt: 0.5,
              overflow: 'visible',
            }}
          >
            {/* Squircles Pair (Unclipped, Dynamic Float with Drop Shadows) */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 1,
                overflow: 'visible',
              }}
            >
              {/* Left Squircle: Commodity */}
              <Box
                sx={{
                  width: { xs: 105, sm: 120 },
                  height: { xs: 105, sm: 120 },
                  borderRadius: '26px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${commodityMeta?.imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '3px solid #ffffff',
                  boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)',
                  transform: 'rotate(-3deg)',
                  zIndex: 1,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    boxShadow: '0 20px 44px -8px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.85) 100%)' }} />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 6,
                    right: 6,
                    p: '3px 8px',
                    borderRadius: '10px',
                    bgcolor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                  }}
                >
                  <Typography sx={{ color: '#fff', fontSize: '0.72rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    🌾 {(dayNode?.['Food Focus'] || commodity).split(',')[0]}
                  </Typography>
                </Box>
              </Box>

              {/* Center Intersection Badge */}
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  bgcolor: '#0f172a',
                  color: '#f59e0b',
                  border: '3px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  zIndex: 2,
                  mx: { xs: -2, sm: -2.5 },
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.3)',
                }}
              >
                ×
              </Box>

              {/* Right Squircle: Strategic Pillar with Short Name */}
              <Box
                sx={{
                  width: { xs: 105, sm: 120 },
                  height: { xs: 105, sm: 120 },
                  borderRadius: '26px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${challengeMeta.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '3px solid #ffffff',
                  boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)',
                  transform: 'rotate(3deg)',
                  zIndex: 1,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    boxShadow: '0 20px 44px -8px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.85) 100%)' }} />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 6,
                    right: 6,
                    p: '3px 8px',
                    borderRadius: '10px',
                    bgcolor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                  }}
                >
                  <Typography sx={{ color: '#93c5fd', fontSize: '0.72rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    🛡️ {categoryShortName}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ═══ ACTIVE ANGLE SWITCHER (INTUITIVE PILL DROPDOWN) ═══ */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                Active Angle:
              </Typography>
              <PremiumDropdown
                colorTheme="#f59e0b"
                label={selectedOption?.subcategory || "Select Subcategory"}
                popoverTitle={`Select ${categoryShortName} Subcategory`}
                popoverSubtitle={`10 pre-planned editorial angles for ${(dayNode?.['Food Focus'] || commodity).split(',')[0]} × ${categoryShortName}`}
                options={calendarOptions}
                value={selectedOption}
                onChange={handleSelectOption}
                getOptionId={(opt) => opt.id}
                getOptionLabel={(opt) => opt.subcategory}
                getOptionSecondary={(opt) => opt.title}
                getOptionTag={(opt) => `W${opt.globalWeek} • ${opt.day}`}
                getOptionEmoji={() => '🌿'}
              />
            </Box>

            {/* ═══ UNIFIED PRE-PLANNED EDITORIAL DOSSIER CARD ═══ */}
            <Box
              sx={{
                width: '100%',
                p: { xs: 2, sm: 2.25 },
                borderRadius: '18px',
                bgcolor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 1.25,
              }}
            >
              {loadingNode ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
                  <CircularProgress size={18} sx={{ color: '#f59e0b' }} />
                  <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                    Loading Calendar Day Record...
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Publishing Headline */}
                  <Typography
                    sx={{
                      color: '#0f172a',
                      fontWeight: 800,
                      fontSize: { xs: '0.98rem', sm: '1.08rem' },
                      lineHeight: 1.35,
                      letterSpacing: '-0.015em',
                      maxWidth: '96%',
                    }}
                  >
                    "{dayNode?.['Publishing Headline / Editorial Title'] || dayNode?.['Article Working Title'] || 'Editorial Calendar Entry'}"
                  </Typography>

                  {/* Single Clean Metadata Badges Line */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<CalendarMonthIcon sx={{ fontSize: '13px !important', color: isToday ? '#dc2626' : '#b45309' }} />}
                      label={
                        isToday
                          ? `Live Today • ${dayNode?.['Day'] || ''}, ${dayNode?.['Publication Date'] || ''}`
                          : `📅 Planned for ${dayNode?.['Day'] || ''}, ${dayNode?.['Publication Date'] || ''} (W${dayNode?.['Global Week'] || 1})`
                      }
                      size="small"
                      sx={{
                        bgcolor: isToday ? '#fef2f2' : '#fef3c7',
                        color: isToday ? '#dc2626' : '#b45309',
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        height: 22,
                        borderRadius: '8px',
                        border: `1px solid ${isToday ? '#fecaca' : '#fde68a'}`,
                      }}
                    />
                    <Chip
                      label={`📍 ${dayNode?.['Primary Country'] || dayNode?.['Candidate Country (Pre-Gate)'] || 'Nigeria'}`}
                      size="small"
                      sx={{
                        bgcolor: '#f8fafc',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        height: 22,
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <Chip
                      label={`🔒 ${dayNode?.['Article ID'] || '1820-CALENDAR'}`}
                      size="small"
                      sx={{
                        bgcolor: '#f8fafc',
                        color: '#64748b',
                        fontWeight: 800,
                        fontSize: '0.64rem',
                        height: 22,
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 0: WORKFLOW OVERVIEW                                    */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="admin-step-0" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                0
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 0: How You Guide the AI
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  You are the Executive Editor steering the research; the AI is your OSINT Analyst.
                </Typography>
              </Box>
            </Box>

            {/* Step 0 Action Checklist (2 items) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, border: '1px solid rgba(15, 23, 42, 0.12)', borderRadius: '16px', bgcolor: 'rgba(15, 23, 42, 0.02)' }}>
              {/* Item 1: Open AI in new tab */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <PromptChecklistItem
                  id="step0_ai"
                  text="1. Open your AI in a new tab (ChatGPT, Claude, or Gemini)"
                  checked={checklist.step0_ai}
                  onToggle={() => toggleChecklist('step0_ai')}
                  colorTheme="#0f172a"
                  isImportant={!checklist.step0_ai}
                />
                {/* AI Quick Launcher Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3.5, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    component="a"
                    href="https://chatgpt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setChecklist(prev => ({ ...prev, step0_ai: true }))}
                    endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                    sx={{
                      bgcolor: 'rgba(16, 163, 127, 0.08)',
                      color: '#0d9488',
                      border: '1px solid rgba(13, 148, 136, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      py: 0.35,
                      px: 1.25,
                      '&:hover': { bgcolor: 'rgba(16, 163, 127, 0.15)', borderColor: '#0d9488' },
                    }}
                  >
                    ChatGPT
                  </Button>
                  <Button
                    size="small"
                    component="a"
                    href="https://claude.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setChecklist(prev => ({ ...prev, step0_ai: true }))}
                    endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                    sx={{
                      bgcolor: 'rgba(217, 119, 6, 0.08)',
                      color: '#d97706',
                      border: '1px solid rgba(217, 119, 6, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      py: 0.35,
                      px: 1.25,
                      '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.15)', borderColor: '#d97706' },
                    }}
                  >
                    Claude
                  </Button>
                  <Button
                    size="small"
                    component="a"
                    href="https://gemini.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setChecklist(prev => ({ ...prev, step0_ai: true }))}
                    endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                    sx={{
                      bgcolor: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563eb',
                      border: '1px solid rgba(37, 99, 235, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      py: 0.35,
                      px: 1.25,
                      '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.15)', borderColor: '#2563eb' },
                    }}
                  >
                    Gemini
                  </Button>
                </Box>
              </Box>

              {/* Item 2: Sequential Execution */}
              <PromptChecklistItem
                id="step0_seq"
                text="2. Copy Steps 1–3 sequentially into your AI thread, then paste output into Step 4"
                checked={checklist.step0_seq}
                onToggle={() => toggleChecklist('step0_seq')}
                colorTheme="#0f172a"
                isImportant={checklist.step0_ai && !checklist.step0_seq}
              />
            </Box>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 1: GROUND EVIDENCE & CONTEXT (ADMIN DOC 1a)             */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="admin-step-1" sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                1
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 1: Ground Evidence & Context (Admin Doc 1a)
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  Injects the active calendar JSON row with Stage-4 FAOSTAT evidence and macro context.
                </Typography>
              </Box>
            </Box>

            <PromptTerminalBox
              title="Admin Doc 1a (The Deterministic Context Engine)"
              codeLabel="STEP 1"
              subtitle="Direct row insertion containing FAOSTAT signals, research questions, and 6 planned titles."
              prompt={prompt1Text}
              colorTheme="#f59e0b"
              copiedBannerText="Admin Doc 1a Copied to Clipboard!"
              copyButtonLabel="Copy Admin Doc 1a Prompt"
              maxHeight={250}
              onCopy={() => {
                setChecklist(prev => ({ ...prev, step1: true }));
                setPromptChecks(prev => ({
                  ...prev,
                  '1a-payload-evidence': true,
                  '1a-titles-macro': true,
                }));
              }}
            />

            {/* Dedicated 2-Item Checklist for Step 1 */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(245, 158, 11, 0.04)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#b45309', fontWeight: 900, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <span>📋</span> Admin Doc 1a Payload Ingredients
                </Typography>
                <Chip
                  label={checklist.step1 ? "COPIED & INJECTED" : "2 VERIFICATIONS"}
                  size="small"
                  sx={{
                    bgcolor: checklist.step1 ? '#d1fae5' : '#fef3c7',
                    color: checklist.step1 ? '#065f46' : '#b45309',
                    fontWeight: 900,
                    fontSize: '0.62rem',
                    height: 18,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <PromptChecklistItem
                  id="1a-payload-evidence"
                  text="Pre-Planned Row Injected: Complete 1,820 calendar JSON record injected directly with Stage-4 FAOSTAT evidence & zero manual typing"
                  checked={promptChecks['1a-payload-evidence']}
                  onToggle={togglePromptCheck}
                  colorTheme="#f59e0b"
                />
                <PromptChecklistItem
                  id="1a-titles-macro"
                  text="6 Planned Titles & Macro Scope: Canonical evidence title + 5 exploratory titles framed across 20 value chain actors"
                  checked={promptChecks['1a-titles-macro']}
                  onToggle={togglePromptCheck}
                  colorTheme="#f59e0b"
                />
              </Box>
            </Paper>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 2: DRUCKER SPARRING & SPECTRUM RANKS (ADMIN DOC 1b)     */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="admin-step-2" sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                2
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 2: Drucker Sparring & Spectrum Ranks (Admin Doc 1b)
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  Executes Drucker sparring across the 6 titles into Cognitive Spectrum Ranks #1 to #6.
                </Typography>
              </Box>
            </Box>

            <PromptTerminalBox
              title="Admin Doc 1b (The Deterministic Drucker OSINT Engine)"
              codeLabel="STEP 2"
              subtitle="Calibrates the 6 titles through Peter Drucker's 5 Cardinal Questions and political economy."
              prompt={prompt2Text}
              colorTheme="#8b5cf6"
              copiedBannerText="Admin Doc 1b Copied to Clipboard!"
              copyButtonLabel="Copy Admin Doc 1b Prompt"
              maxHeight={250}
              onCopy={() => {
                setChecklist(prev => ({ ...prev, step2: true }));
                setPromptChecks(prev => ({
                  ...prev,
                  '1b-context-drucker': true,
                  '1b-spectrum-osint': true,
                }));
              }}
            />

            {/* Dedicated 2-Item Checklist for Step 2 */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(139, 92, 246, 0.04)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#6d28d9', fontWeight: 900, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <span>⚡</span> Admin Doc 1b Sparring & OSINT Ingredients
                </Typography>
                <Chip
                  label={checklist.step2 ? "COPIED & CALIBRATED" : "2 VERIFICATIONS"}
                  size="small"
                  sx={{
                    bgcolor: checklist.step2 ? '#d1fae5' : '#ede9fe',
                    color: checklist.step2 ? '#065f46' : '#6d28d9',
                    fontWeight: 900,
                    fontSize: '0.62rem',
                    height: 18,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <PromptChecklistItem
                  id="1b-context-drucker"
                  text="Continuous Context & Drucker Sparring: Interrogates the 6 titles with Peter Drucker's 5 Cardinal Questions without re-requesting payload"
                  checked={promptChecks['1b-context-drucker']}
                  onToggle={togglePromptCheck}
                  colorTheme="#8b5cf6"
                />
                <PromptChecklistItem
                  id="1b-spectrum-osint"
                  text="Cognitive Spectrum & OSINT Reality: Calibrates Ranks #1 Bleeding Neck to #6 Black Swan with raw ground trade frictions & hard verbs"
                  checked={promptChecks['1b-spectrum-osint']}
                  onToggle={togglePromptCheck}
                  colorTheme="#8b5cf6"
                />
              </Box>
            </Paper>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 3: STUDIO MARKDOWN SYNTHESIZER (ADMIN DOC 1c)           */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="admin-step-3" sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                3
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 3: Studio Markdown Synthesizer (Admin Doc 1c)
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  Translates external Franchises into internal formats & compiles all 6 articles into Studio schema.
                </Typography>
              </Box>
            </Box>

            <PromptTerminalBox
              title="Admin Doc 1c (The Master Franchise Synthesizer)"
              codeLabel="STEP 3"
              subtitle="Compiles exactly 6 articles matching the Studio metadata and 6-sentence schema."
              prompt={prompt3Text}
              colorTheme="#10b981"
              copiedBannerText="Admin Doc 1c Copied to Clipboard!"
              copyButtonLabel="Copy Admin Doc 1c Prompt"
              maxHeight={250}
              onCopy={() => {
                setChecklist(prev => ({ ...prev, step3: true }));
                setPromptChecks(prev => ({
                  ...prev,
                  '1c-format-sentence': true,
                  '1c-schema-articles': true,
                }));
              }}
            />

            {/* Dedicated 2-Item Checklist for Step 3 */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#047857', fontWeight: 900, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <span>🚀</span> Admin Doc 1c Studio Schema Ingredients
                </Typography>
                <Chip
                  label={checklist.step3 ? "COPIED & COMPILED" : "2 VERIFICATIONS"}
                  size="small"
                  sx={{
                    bgcolor: checklist.step3 ? '#d1fae5' : '#ecfdf5',
                    color: checklist.step3 ? '#065f46' : '#047857',
                    fontWeight: 900,
                    fontSize: '0.62rem',
                    height: 18,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <PromptChecklistItem
                  id="1c-format-sentence"
                  text="Franchise Translation & 6-Sentence Formula: Maps formats, 7 geographic hubs, and strict 6-sentence structures per article"
                  checked={promptChecks['1c-format-sentence']}
                  onToggle={togglePromptCheck}
                  colorTheme="#10b981"
                />
                <PromptChecklistItem
                  id="1c-schema-articles"
                  text="Clean Studio Markdown: Compiles all 6 discrete articles with valid [SYSTEM_METADATA] ready for 1-click Fast Ingest"
                  checked={promptChecks['1c-schema-articles']}
                  onToggle={togglePromptCheck}
                  colorTheme="#10b981"
                />
              </Box>
            </Paper>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 4: FAST INGEST RELAY TERMINAL & APPLY TO STUDIO         */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="admin-step-4" sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                4
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 4: Fast Ingest Relay (Apply to Studio)
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  Paste the generated markdown output from Step 3 to dispatch all 6 articles into Studio.
                </Typography>
              </Box>
            </Box>

            <PromptFastIngestBox
              value={customIngestMarkdown}
              onChange={handleMarkdownChange}
              onIngest={handleIngest}
              title="Fast Ingest: 6 Admin Articles Relay"
              subtitle="Paste the generated markdown output from Admin Doc 1c below to apply to the Studio."
              codeLabel="STEP 4"
              colorTheme="#059669"
              placeholder={`Paste the markdown output from Admin Doc 1c here...\n\nExample:\n---\n[SYSTEM_METADATA]\n- Category: ${category}\n- Subcategory: ${dayNode?.['Subcategory'] || 'sub-logistics'}\n- Commodity: ${commodity}\n- Format: brief\n- Era: present\n- Location: ${dayNode?.['Primary Country'] || 'National Corridor'}\n- Spectrum_Rank: #1 The Bleeding Neck\n- Target_Persona: Agro-Allocators & Fleet Operators\n\n### Title of the Article...\n\n**Description:**\n- Sentence 1...\n- Sentence 2...\n- Sentence 3...\n- Sentence 4...\n- Sentence 5...\n- Sentence 6...\n---`}
              liveBlockCount={detectedArticles.length}
              expectedBlockCount={6}
              buttonLabel={`⚡ Ingest & Apply ${detectedArticles.length > 0 ? detectedArticles.length : 6} Admin Articles to Studio`}
              error={ingestError}
              success={ingestSuccess}
            />

            {/* Ingest Readiness 2-Item Checklist */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#047857', fontWeight: 900, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <span>⚡</span> Fast Ingest Ingestion Status
                </Typography>
                <Chip
                  label={
                    detectedArticles.length === 6
                      ? "6/6 READY TO APPLY"
                      : detectedArticles.length > 0
                      ? `${detectedArticles.length}/6 DETECTED`
                      : "AWAITING PASTE"
                  }
                  size="small"
                  sx={{
                    bgcolor: detectedArticles.length === 6 ? '#d1fae5' : '#fef3c7',
                    color: detectedArticles.length === 6 ? '#065f46' : '#b45309',
                    fontWeight: 900,
                    fontSize: '0.62rem',
                    height: 18,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <PromptChecklistItem
                  id="ingest-syntax"
                  text={`Syntax Verification: Live parser detects ${detectedArticles.length} of 6 structured articles with valid metadata and complete sentences`}
                  checked={promptChecks['ingest-syntax']}
                  onToggle={togglePromptCheck}
                  colorTheme="#10b981"
                />
                <PromptChecklistItem
                  id="ingest-apply"
                  text="Batch Dispatch: Pushes all 6 articles directly into your Creator Studio draft boards"
                  checked={promptChecks['ingest-apply'] || checklist.step4}
                  onToggle={togglePromptCheck}
                  colorTheme="#10b981"
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default AdminArticlePromptSidePane;


