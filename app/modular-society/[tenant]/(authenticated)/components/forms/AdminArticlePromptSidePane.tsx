'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Drawer, Box, Typography, Button, IconButton, Chip, Paper,
  useTheme, useMediaQuery, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RemoveIcon from '@mui/icons-material/Remove';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlaceIcon from '@mui/icons-material/Place';
import { motion, AnimatePresence } from 'framer-motion';

import { PromptTerminalBox } from '@/components/prompts/PromptTerminalBox';
import { PromptFastIngestBox } from '@/components/prompts/PromptFastIngestBox';
import { usePromptAssistant } from '@/context/PromptAssistantContext';
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
  const { suspendDock, setHasEditorDock } = usePromptAssistant();

  // Idea 2: Drawer-Aware Auto-Tuck - Suppress background floating docks while this drawer is open
  useEffect(() => {
    if (open && !isMinimized) {
      suspendDock(true);
    } else {
      suspendDock(false);
    }
    return () => {
      suspendDock(false);
    };
  }, [open, isMinimized, suspendDock]);

  // Idea 4: Stacking Coordination - Inform global context when this local dock is active
  useEffect(() => {
    if (open && isMinimized && isDockVisible) {
      setHasEditorDock(true);
    } else {
      setHasEditorDock(false);
    }
    return () => {
      setHasEditorDock(false);
    };
  }, [open, isMinimized, isDockVisible, setHasEditorDock]);

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

  // Persistent copied state for prompts 1a, 1b, 1c
  const [copiedPromptTabs, setCopiedPromptTabs] = useState<Record<string, boolean>>({});

  const handleCopyPromptText = useCallback((text: string, tabKey: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedPromptTabs(prev => ({ ...prev, [tabKey]: true }));
  }, []);

  const handleExpandPrompt = useCallback((tabKey: string) => {
    setCopiedPromptTabs(prev => ({ ...prev, [tabKey]: false }));
  }, []);

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
      try {
        const saved = localStorage.getItem(storageKey) || localStorage.getItem('admin_editorial_ingest_latest');
        if (saved) {
          setCustomIngestMarkdown(saved);
        }
      } catch {}
    }
  }, [storageKey]);

  // Sync back to storage on changes
  const handleMarkdownChange = (val: string) => {
    setCustomIngestMarkdown(val);
    setIngestError(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, val);
        localStorage.setItem('admin_editorial_ingest_latest', val);
      } catch {}
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

  const handleIngest = useCallback(() => {
    if (detectedArticles.length === 0) {
      setIngestError('No valid articles detected. Please paste the markdown generated from Document 1c.');
      return;
    }

    setIngestSuccess(true);
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
                py: 0.85,
                px: 1.6,
                borderRadius: '999px',
                background: 'rgba(15, 23, 42, 0.78)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: 'rgba(15, 23, 42, 0.88)',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {/* Minimal Amber Icon with Soft Glow */}
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 14 }} />
              </Box>

              {/* Minimal Clean 1-Line Meta */}
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                }}
              >
                <span>Article Ideas</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{commodity.split(',')[0]}</span>
              </Typography>

              {/* Minimal Expand Icon */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  ml: 0.2,
                  transition: 'color 0.2s',
                  '&:hover': { color: '#fff' },
                }}
              >
                <OpenInFullIcon sx={{ fontSize: 12 }} />
              </Box>

              {/* Minimal Dismiss (X) */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismissDock();
                }}
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  p: 0.35,
                  ml: -0.5,
                  '&:hover': {
                    color: '#ef4444',
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* FULL ADMIN SLIDE-OVER DRAWER                                */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open && !isMinimized}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: '80vw', md: '50vw' },
              minWidth: { sm: 540, md: 620 },
              maxWidth: { xl: 880 },
              height: { xs: '85vh', sm: '100%' },
              maxHeight: { xs: '85vh', sm: '100%' },
              borderRadius: { xs: '24px 24px 0 0', sm: 0 },
              bgcolor: '#f8fafc',
              boxShadow: { xs: '0 -12px 40px rgba(0,0,0,0.18)', sm: '-16px 0 48px rgba(0,0,0,0.18)' },
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
              overflow: 'hidden',
            }
          }
        }}
      >
        {/* ── FLOATING TOP CONTROLS (CIRCLE MINIMIZE & CIRCLE CLOSE) ── */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 14, sm: 20 },
            right: { xs: 14, sm: 24 },
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            zIndex: 50,
          }}
        >
          {/* Floating Minimize Button */}
          <IconButton
            onClick={handleMinimize}
            title="Minimize to dock"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              color: '#475569',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#ffffff',
                color: '#0f172a',
                transform: 'scale(1.08)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <RemoveIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Floating Close Button */}
          <IconButton
            onClick={onClose}
            title="Close assistant"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              color: '#475569',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                transform: 'scale(1.08)',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.18)',
              }
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── SCROLLABLE CANVAS ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Mobile Bottom-Sheet Grabber Pill */}
          {isMobile && (
            <Box sx={{ width: 44, height: 4.5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.22)', mx: 'auto', mt: 1.5, mb: 0.5 }} />
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* HERO SECTION                                                 */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box
            sx={{
              position: 'relative',
              pt: { xs: 6, sm: 8 },
              pb: { xs: 2.5, sm: 3.5 },
              px: { xs: 3, sm: 5 },
              background: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.08) 0%, rgba(59, 130, 246, 0.04) 55%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* 1. Intersecting Squircles Image Pair */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                mt: { xs: 1.5, sm: 1 },
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Left Squircle: Commodity */}
              <Box
                sx={{
                  width: { xs: 104, sm: 118 },
                  height: { xs: 104, sm: 118 },
                  borderRadius: '28px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${commodityMeta?.imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                  transform: 'rotate(-3deg)',
                  zIndex: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    borderColor: 'rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.55)',
                  },
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.85) 100%)' }} />
                <Typography sx={{ position: 'absolute', bottom: 7, left: 4, right: 4, color: '#fff', fontSize: '0.7rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🌾 {(dayNode?.['Food Focus'] || commodity).split(',')[0]}
                </Typography>
              </Box>

              {/* Center Intersection Badge */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#0f172a',
                  color: '#f59e0b',
                  border: '2px solid rgba(255, 255, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  zIndex: 2,
                  mx: { xs: -1.75, sm: -2 },
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                }}
              >
                ×
              </Box>

              {/* Right Squircle: Strategic Challenge */}
              <Box
                sx={{
                  width: { xs: 104, sm: 118 },
                  height: { xs: 104, sm: 118 },
                  borderRadius: '28px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${challengeMeta.imageUrl}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                  transform: 'rotate(3deg)',
                  zIndex: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    borderColor: 'rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.55)',
                  },
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.85) 100%)' }} />
                <Typography sx={{ position: 'absolute', bottom: 7, left: 4, right: 4, color: '#93c5fd', fontSize: '0.7rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🛡️ {categoryShortName}
                </Typography>
              </Box>
            </Box>

            {/* 2. Centered Large Hero Text */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 950,
                color: '#0f172a',
                letterSpacing: '-0.035em',
                fontSize: { xs: '1.6rem', sm: '2.05rem' },
                lineHeight: 1.18,
                textAlign: 'center',
              }}
            >
              Get Article Ideas with AI
            </Typography>

            {/* 3. Centered Smaller Description */}
            <Typography
              sx={{
                color: '#64748b',
                fontSize: { xs: '0.8rem', sm: '0.86rem' },
                fontWeight: 500,
                lineHeight: 1.55,
                textAlign: 'center',
                maxWidth: 480,
                mt: 1.15,
              }}
            >
              Run 3 quick AI prompts from the 1,820 editorial calendar, then paste the response into Fast Ingest to get 6 ready article briefs.
            </Typography>

            {/* 4. Unified Pre-Planned Editorial Dossier Card */}
            <Box
              sx={{
                width: '100%',
                maxWidth: 620,
                mt: 3,
                p: { xs: 2.25, sm: 2.5 },
                borderRadius: '22px',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 10px 32px -6px rgba(15, 23, 42, 0.07), 0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.75,
                textAlign: 'left',
              }}
            >
              {/* Subcategory Selector Header & Trigger */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#64748b',
                      }}
                    >
                      Selected Subcategory
                    </Typography>
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: '#cbd5e1',
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                      }}
                    >
                      {categoryShortName}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${calendarOptions.length || 10} Angles`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(245, 158, 11, 0.1)',
                      color: '#b45309',
                      fontWeight: 800,
                      fontSize: '0.64rem',
                      height: 20,
                      borderRadius: '6px',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                    }}
                  />
                </Box>

                {/* Subcategory Dropdown Pill */}
                <PremiumDropdown
                  fullWidth
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

              {/* Pre-Planned Headline & Minimal Context */}
              {loadingNode ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2 }}>
                  <CircularProgress size={16} sx={{ color: '#f59e0b' }} />
                  <Typography sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
                    Loading Calendar Record...
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    pt: 1.5,
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {/* Publishing Headline */}
                  <Typography
                    sx={{
                      color: '#0f172a',
                      fontWeight: 800,
                      fontSize: { xs: '0.96rem', sm: '1.04rem' },
                      lineHeight: 1.42,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    "{dayNode?.['Publishing Headline / Editorial Title'] || dayNode?.['Article Working Title'] || 'Editorial Calendar Entry'}"
                  </Typography>

                  {/* Clean Minimalist Metadata Ribbon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <CalendarMonthIcon sx={{ fontSize: 14, color: isToday ? '#dc2626' : '#f59e0b' }} />
                      <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: isToday ? '#dc2626' : '#64748b' }}>
                        {isToday
                          ? `Live Today (${dayNode?.['Publication Date'] || ''})`
                          : `${dayNode?.['Day'] || ''}, ${dayNode?.['Publication Date'] || ''} • W${dayNode?.['Global Week'] || 1}`}
                      </Typography>
                    </Box>

                    <Typography sx={{ color: '#cbd5e1', fontSize: '0.74rem' }}>•</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PlaceIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                      <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                        {dayNode?.['Primary Country'] || dayNode?.['Candidate Country (Pre-Gate)'] || 'Nigeria'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP PROGRESSION BODY CONTENT                                */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box sx={{ px: { xs: 2.5, sm: 4.5 }, pb: { xs: 4, sm: 5 }, pt: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 0: WORKFLOW OVERVIEW                                    */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="admin-step-0" sx={{ display: 'flex', flexDirection: 'column', gap: 2, scrollMarginTop: '80px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                  0
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 0: How You Guide the AI
                </Typography>
              </Box>

              {/* Step 0 Minimal Workflow Card */}
              <Box
                sx={{
                  ml: { xs: 0, sm: '42px' },
                  p: 2.25,
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    1
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                    Select your target subcategory angle above. The 1,820 calendar row and FAOSTAT signals auto-inject into Doc 1a.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    2
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                      Copy and run each prompt sequentially in your preferred AI:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        component="a"
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
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
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    3
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                    Paste the final response into Step 4 to import 6 complete admin articles directly into Studio.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 1: GROUND EVIDENCE & CONTEXT (ADMIN DOC 1a)             */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="admin-step-1" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem', flexShrink: 0 }}>
                  1
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    Step 1: Ground Evidence & Context (Admin Doc 1a)
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                    Injects the active 1,820 calendar JSON row with Stage-4 FAOSTAT evidence.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ ml: { xs: 0, sm: '42px' } }}>
                <PromptTerminalBox
                  title="Step 1 Prompt · Ground Evidence & Context"
                  codeLabel="DOC 1a"
                  subtitle="Direct row insertion containing FAOSTAT signals, research directives, and 6 planned titles."
                  prompt={prompt1Text}
                  colorTheme="#f59e0b"
                  copiedBannerText="Step 1 Prompt Copied to Clipboard!"
                  copyButtonLabel="Copy Step 1 Prompt (Ground Evidence)"
                  maxHeight={220}
                  isCopiedExternal={Boolean(copiedPromptTabs['admin1a'])}
                  onExpand={() => handleExpandPrompt('admin1a')}
                  onCopy={() => handleCopyPromptText(prompt1Text, 'admin1a')}
                />
              </Box>
            </Box>

            <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', my: 1 }} />

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 2: DRUCKER SPARRING & SPECTRUM RANKS (ADMIN DOC 1b)     */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="admin-step-2" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem', flexShrink: 0 }}>
                  2
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    Step 2: Drucker Sparring & Spectrum Ranks (Admin Doc 1b)
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                    Calibrates the 6 titles through Peter Drucker's 5 Cardinal Questions into Ranks #1 to #6.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ ml: { xs: 0, sm: '42px' } }}>
                <PromptTerminalBox
                  title="Step 2 Prompt · Drucker Sparring & OSINT"
                  codeLabel="DOC 1b"
                  subtitle="Interrogates the 6 titles with Peter Drucker's 5 Cardinal Questions without re-requesting payload."
                  prompt={prompt2Text}
                  colorTheme="#8b5cf6"
                  copiedBannerText="Step 2 Prompt Copied to Clipboard!"
                  copyButtonLabel="Copy Step 2 Prompt (Drucker Sparring)"
                  maxHeight={220}
                  isCopiedExternal={Boolean(copiedPromptTabs['admin1b'])}
                  onExpand={() => handleExpandPrompt('admin1b')}
                  onCopy={() => handleCopyPromptText(prompt2Text, 'admin1b')}
                />
              </Box>
            </Box>

            <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', my: 1 }} />

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 3: STUDIO MARKDOWN SYNTHESIZER (ADMIN DOC 1c)           */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="admin-step-3" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem', flexShrink: 0 }}>
                  3
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    Step 3: Studio Markdown Synthesizer (Admin Doc 1c)
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                    Translates franchises into internal formats and compiles 6 articles with valid metadata.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ ml: { xs: 0, sm: '42px' } }}>
                <PromptTerminalBox
                  title="Step 3 Prompt · Studio Markdown Synthesizer"
                  codeLabel="DOC 1c"
                  subtitle="Compiles exactly 6 articles matching the Studio metadata and 6-sentence schema."
                  prompt={prompt3Text}
                  colorTheme="#10b981"
                  copiedBannerText="Step 3 Prompt Copied to Clipboard!"
                  copyButtonLabel="Copy Step 3 Prompt (Studio Synthesizer)"
                  maxHeight={220}
                  isCopiedExternal={Boolean(copiedPromptTabs['admin1c'])}
                  onExpand={() => handleExpandPrompt('admin1c')}
                  onCopy={() => handleCopyPromptText(prompt3Text, 'admin1c')}
                />
              </Box>
            </Box>

            <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', my: 1 }} />

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 4: FAST INGEST RELAY TERMINAL & APPLY TO STUDIO         */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="admin-step-4" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem', flexShrink: 0 }}>
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

              <Box sx={{ ml: { xs: 0, sm: '42px' } }}>
                <PromptFastIngestBox
                  value={customIngestMarkdown}
                  onChange={handleMarkdownChange}
                  onIngest={handleIngest}
                  title="Fast Ingest: 6 Admin Articles Relay"
                  subtitle="Paste the generated markdown output from Admin Doc 1c below to apply to the Studio."
                  codeLabel="FAST INGEST"
                  fileName="articles.md"
                  unitLabel="articles"
                  colorTheme="#059669"
                  placeholder={`Paste the markdown output from Admin Doc 1c here...\n\nExample:\n---\n[SYSTEM_METADATA]\n- Category: ${category}\n- Subcategory: ${dayNode?.['Subcategory'] || 'sub-logistics'}\n- Commodity: ${commodity}\n- Format: brief\n- Era: present\n- Location: ${dayNode?.['Primary Country'] || 'National Corridor'}\n- Spectrum_Rank: #1 The Bleeding Neck\n- Target_Persona: Agro-Allocators & Fleet Operators\n\n### Title of the Article...\n\n**Description:**\n- Sentence 1...\n- Sentence 2...\n- Sentence 3...\n- Sentence 4...\n- Sentence 5...\n- Sentence 6...\n---`}
                  liveBlockCount={detectedArticles.length}
                  expectedBlockCount={6}
                  buttonLabel="Visualise articles"
                  hideButtonWhenEmpty={true}
                  showButtonIcon={false}
                  error={ingestError}
                  success={ingestSuccess}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default AdminArticlePromptSidePane;


