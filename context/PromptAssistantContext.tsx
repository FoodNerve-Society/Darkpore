'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  Drawer, Box, Typography, Button, IconButton, Chip, Paper, Alert,
  useTheme, useMediaQuery
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
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import PremiumTextField from '@/components/PremiumTextField';

import {
  buildDoc1aPrompt,
  buildDoc1bPrompt,
  buildDoc1cPrompt,
  parseDoc1cArticles
} from '@/lib/config/editorialPrompts';
import { foodChallenges } from '@/lib/cms/food/challenges';
import { VALUE_CHAIN_ACTORS as CMS_ACTORS } from '@/lib/cms';
import { VALUE_CHAIN_ACTORS as TAXONOMY_ACTORS } from '@/lib/taxonomy';
import { getCommodityMeta } from '@/lib/cms/commodities';
import { keyframes } from '@mui/system';

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.4), 0 0 30px rgba(59, 130, 246, 0.25);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 25px rgba(16, 185, 129, 0.75), 0 0 45px rgba(59, 130, 246, 0.45);
    transform: scale(1.04);
  }
`;

const beaconRadar = keyframes`
  0% { transform: scale(0.9); opacity: 0.9; }
  70% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(0.9); opacity: 0; }
`;

const ambientSheen = keyframes`
  0% { transform: translateX(-150%) skewX(-25deg); }
  50%, 100% { transform: translateX(250%) skewX(-25deg); }
`;

export interface PromptAssistantOpenOptions {
  commodity?: string;
  category?: string;
  targetDate?: string;
  rawPrompts?: {
    doc1aPrompt?: string;
    doc1aOutput?: string;
    doc1bPrompt?: string;
    doc1bOutput?: string;
    doc1cPrompt?: string;
    doc1cOutput?: string;
  } | null;
  onIngest?: (briefs: any[]) => void;
}

interface PromptAssistantContextType {
  isOpen: boolean;
  isDockVisible: boolean;
  selectedCommodity: string;
  selectedCategory: string;
  selectedTargetDate: string;
  customIngestMarkdown: string;
  wikiChecklist: Record<string, boolean>;
  copiedPromptTab: string | null;
  openAssistant: (opts?: PromptAssistantOpenOptions) => void;
  closeAssistant: () => void;
  minimizeAssistant: () => void;
  maximizeAssistant: () => void;
  dismissDock: () => void;
  setCommodity: (c: string) => void;
  setCategory: (c: string) => void;
  setTargetDate: (d: string) => void;
  setCustomIngestMarkdown: (md: string) => void;
  toggleChecklistItem: (id: string) => void;
  handleCopyPromptText: (text: string, tabKey: string) => void;
  registerIngestHandler: (handler: (briefs: any[]) => void) => () => void;
}

const PromptAssistantContext = createContext<PromptAssistantContextType>({
  isOpen: false,
  isDockVisible: false,
  selectedCommodity: 'Ginger',
  selectedCategory: 'land',
  selectedTargetDate: new Date().toISOString(),
  customIngestMarkdown: '',
  wikiChecklist: {},
  copiedPromptTab: null,
  openAssistant: () => {},
  closeAssistant: () => {},
  minimizeAssistant: () => {},
  maximizeAssistant: () => {},
  dismissDock: () => {},
  setCommodity: () => {},
  setCategory: () => {},
  setTargetDate: () => {},
  setCustomIngestMarkdown: () => {},
  toggleChecklistItem: () => {},
  handleCopyPromptText: () => {},
  registerIngestHandler: () => () => {},
});


const ACTOR_OPTIONS: string[] = Array.from(new Set([
  ...CMS_ACTORS.map(a => a.label),
  ...TAXONOMY_ACTORS,
]));

const getCategoryShortName = (catId?: string): string => {
  if (!catId) return 'Category';
  const id = catId.toLowerCase().trim();
  switch (id) {
    case 'capital': return 'Capital';
    case 'land': return 'Land';
    case 'inputs': return 'Inputs';
    case 'energy': return 'Energy';
    case 'insecurity': return 'Insecurity';
    case 'harvest-to-market':
    case 'harvest': return 'Harvest';
    case 'people': return 'People';
    default: return catId.charAt(0).toUpperCase() + catId.slice(1);
  }
};

export const usePromptAssistant = () => useContext(PromptAssistantContext);

export function PromptAssistantProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isOpen, setIsOpen] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(false);

  const [selectedCommodity, setSelectedCommodity] = useState('Ginger');
  const [selectedCategory, setSelectedCategory] = useState('land');
  const [selectedTargetDate, setSelectedTargetDate] = useState<string>(() => new Date().toISOString());

  const [rawPrompts, setRawPrompts] = useState<{
    doc1aPrompt?: string;
    doc1aOutput?: string;
    doc1bPrompt?: string;
    doc1bOutput?: string;
    doc1cPrompt?: string;
    doc1cOutput?: string;
  } | null>(null);

  const [customIngestMarkdown, setCustomIngestMarkdown] = useState('');
  const [customIngestError, setCustomIngestError] = useState('');
  const [wikiChecklist, setWikiChecklist] = useState<Record<string, boolean>>({});
  const [copiedPromptTab, setCopiedPromptTab] = useState<string | null>(null);

  // === SPARRING PARTNER INTERACTIVE INPUTS ===
  const [targetActors, setTargetActors] = useState<string[]>([]);
  const [targetLocation, setTargetLocation] = useState('');
  
  // Step 2 State
  const [locationPivot, setLocationPivot] = useState(true);
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [whyNow, setWhyNow] = useState('');

  // Step 3 State
  const [strategicPivot, setStrategicPivot] = useState(true);

  // Ingest subscriber callbacks (allows CreatorStudio or other active views to receive ingested briefs)
  const ingestSubscribersRef = React.useRef<Set<(briefs: any[]) => void>>(new Set());

  const registerIngestHandler = useCallback((handler: (briefs: any[]) => void) => {
    ingestSubscribersRef.current.add(handler);
    return () => {
      ingestSubscribersRef.current.delete(handler);
    };
  }, []);

  // Restore persistence on commodity / category switch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checklistKey = `editorial_sop_tasks_${selectedCommodity}_${selectedCategory}`;
      const scratchpadKey = `editorial_sop_scratchpad_${selectedCommodity}_${selectedCategory}`;

      try {
        const savedChecklist = localStorage.getItem(checklistKey);
        if (savedChecklist) setWikiChecklist(JSON.parse(savedChecklist));
        else setWikiChecklist({});

        const savedScratchpad = localStorage.getItem(scratchpadKey);
        if (savedScratchpad) {
          const parsed = JSON.parse(savedScratchpad);
          setCustomIngestMarkdown(parsed.ingest || parsed.doc1c || '');
        } else {
          setCustomIngestMarkdown('');
        }
      } catch {}
    }
  }, [selectedCommodity, selectedCategory]);

  const saveScratchpadToStorage = useCallback((data: { ingest?: string }) => {
    if (typeof window !== 'undefined') {
      const scratchpadKey = `editorial_sop_scratchpad_${selectedCommodity}_${selectedCategory}`;
      try {
        const existing = localStorage.getItem(scratchpadKey);
        const parsed = existing ? JSON.parse(existing) : {};
        const updated = { ...parsed, ...data };
        localStorage.setItem(scratchpadKey, JSON.stringify(updated));
      } catch {}
    }
  }, [selectedCommodity, selectedCategory]);

  const toggleChecklistItem = useCallback((id: string) => {
    setWikiChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (typeof window !== 'undefined') {
        const key = `editorial_sop_tasks_${selectedCommodity}_${selectedCategory}`;
        localStorage.setItem(key, JSON.stringify(next));
      }
      return next;
    });
  }, [selectedCommodity, selectedCategory]);

  const handleCopyPromptText = useCallback((text: string, tabKey: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPromptTab(tabKey);

      const actionKey = tabKey === 'doc1a' ? 'act_copy_1a' : tabKey === 'doc1b' ? 'act_copy_1b' : tabKey === 'doc1c' ? 'act_copy_1c' : null;
      if (actionKey) {
        setWikiChecklist(prev => {
          const next = { ...prev, [actionKey]: true };
          if (typeof window !== 'undefined') {
            const key = `editorial_sop_tasks_${selectedCommodity}_${selectedCategory}`;
            localStorage.setItem(key, JSON.stringify(next));
          }
          return next;
        });
      }

      setTimeout(() => setCopiedPromptTab(null), 2000);
    }
  }, [selectedCommodity, selectedCategory]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setCustomIngestMarkdown(text);
          saveScratchpadToStorage({ ingest: text });
          setCustomIngestError('');
        }
      }
    } catch (err) {
      console.error('Failed to read from clipboard', err);
    }
  }, [saveScratchpadToStorage]);

  const openAssistant = useCallback((opts?: PromptAssistantOpenOptions) => {
    if (opts?.commodity) setSelectedCommodity(opts.commodity);
    if (opts?.category) setSelectedCategory(opts.category);
    if (opts?.targetDate) setSelectedTargetDate(opts.targetDate);
    if (opts?.rawPrompts) setRawPrompts(opts.rawPrompts);
    if (opts?.onIngest) {
      ingestSubscribersRef.current.add(opts.onIngest);
    }
    setIsOpen(true);
    setIsDockVisible(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
    // Keep dock visible so user can respawn anytime
    setIsDockVisible(true);
  }, []);

  const minimizeAssistant = useCallback(() => {
    setIsOpen(false);
    setIsDockVisible(true);
  }, []);

  const maximizeAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  const dismissDock = useCallback(() => {
    setIsOpen(false);
    setIsDockVisible(false);
  }, []);

  // Compute dynamic prompt text
  const activeChallenge = useMemo(() => foodChallenges.find(c => c.id === selectedCategory) || foodChallenges[0], [selectedCategory]);
  const activeSubsList = useMemo(() => (activeChallenge?.subcategories || []).map(s => ({ title: s.title, desc: s.desc })), [activeChallenge]);
  const currentMonthYearStr = useMemo(() => {
    try {
      return format(new Date(selectedTargetDate), 'MMMM yyyy');
    } catch {
      return format(new Date(), 'MMMM yyyy');
    }
  }, [selectedTargetDate]);

  const compiledPrompt1a = useMemo(() => {
    return rawPrompts?.doc1aPrompt || buildDoc1aPrompt({
      category: activeChallenge?.title || selectedCategory,
      commodity: selectedCommodity,
      subcategoriesList: activeSubsList,
      currentMonthYear: currentMonthYearStr,
    });
  }, [rawPrompts?.doc1aPrompt, activeChallenge, selectedCategory, selectedCommodity, activeSubsList, currentMonthYearStr]);

  const compiledPrompt1b = useMemo(() => {
    return buildDoc1bPrompt({
      commodity: selectedCommodity,
      currentMonthYear: currentMonthYearStr,
      doc1aOutput: '[PASTE YOUR DOCUMENT 1A OUTPUT BELOW TO AUTO-INJECT]',
      subcategoriesList: activeSubsList,
    });
  }, [selectedCommodity, currentMonthYearStr, activeSubsList]);

  const compiledPrompt1c = useMemo(() => {
    return buildDoc1cPrompt({
      doc1aOutput: '[PASTE YOUR DOCUMENT 1A OUTPUT IN TURN 1/2 TO AUTO-INJECT]',
      doc1bOutput: '[PASTE YOUR DOCUMENT 1B OUTPUT IN TURN 2 TO AUTO-INJECT]',
    });
  }, []);

  const liveParsedBriefs = useMemo(() => {
    if (!customIngestMarkdown.trim()) return [];
    try {
      return parseDoc1cArticles(customIngestMarkdown, selectedCommodity);
    } catch {
      return [];
    }
  }, [customIngestMarkdown, selectedCommodity]);

  const handleFastIngestCustomOutlines = useCallback(() => {
    setCustomIngestError('');
    if (!customIngestMarkdown.trim()) {
      setCustomIngestError('Please paste Document 1c Markdown payload.');
      return;
    }
    try {
      const parsed = parseDoc1cArticles(customIngestMarkdown, selectedCommodity);
      if (!parsed || parsed.length === 0) {
        throw new Error('No valid article outlines found. Ensure your text follows the [SYSTEM_METADATA] format separated by ---');
      }

      // Notify all active subscribers (e.g. CreatorStudioDashboard)
      ingestSubscribersRef.current.forEach(callback => {
        try {
          callback(parsed);
        } catch (e) {
          console.error('Error notifying ingest subscriber', e);
        }
      });

      // Also persist to localStorage for cross-page retrieval
      if (typeof window !== 'undefined') {
        const key = `editorial_ingested_briefs_${selectedCommodity}_${selectedCategory}`;
        localStorage.setItem(key, JSON.stringify(parsed));
      }

      setIsOpen(false);
      setIsDockVisible(true);
    } catch (err: any) {
      setCustomIngestError(err.message || 'Failed to parse custom article outlines.');
    }
  }, [customIngestMarkdown, selectedCommodity, selectedCategory]);

  return (
    <PromptAssistantContext.Provider
      value={{
        isOpen,
        isDockVisible,
        selectedCommodity,
        selectedCategory,
        selectedTargetDate,
        customIngestMarkdown,
        wikiChecklist,
        copiedPromptTab,
        openAssistant,
        closeAssistant,
        minimizeAssistant,
        maximizeAssistant,
        dismissDock,
        setCommodity: setSelectedCommodity,
        setCategory: setSelectedCategory,
        setTargetDate: setSelectedTargetDate,
        setCustomIngestMarkdown,
        toggleChecklistItem,
        handleCopyPromptText,
        registerIngestHandler,
      }}
    >
      {children}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MINIMAL LIQUID GLASS FLOATING DOCK                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!isOpen && isDockVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: isMobile ? 86 : 24,
              right: isMobile ? 16 : 24,
              zIndex: 1250,
            }}
          >
            <Paper
              elevation={0}
              onClick={maximizeAssistant}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
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
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: 'rgba(15, 23, 42, 0.88)',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              {/* Minimal AI Sparkle Icon with Soft Glow */}
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 14 }} />
              </Box>

              {/* Minimal Clean 1-Line Meta */}
              <Typography sx={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.6
              }}>
                <span>AI Assistant</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{selectedCommodity}</span>
              </Typography>

              {/* Minimal Expand Icon */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  ml: 0.2,
                  transition: 'color 0.2s',
                  '&:hover': { color: '#fff' }
                }}
              >
                <OpenInFullIcon sx={{ fontSize: 12 }} />
              </Box>

              {/* Minimal Dismiss (X) */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissDock();
                }}
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  p: 0.35,
                  ml: -0.5,
                  '&:hover': {
                    color: '#ef4444',
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                  }
                }}
              >
                <CloseIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FULL GLOBAL DRAWER (RETAINS FULL STATE ACROSS PAGES)        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={closeAssistant}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: 580, md: 680 },
              maxWidth: '100vw',
              bgcolor: '#f8fafc',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
            }
          }
        }}
      >
        {/* Sticky Glassmorphism Luxury Header */}
        <Box sx={{
          px: { xs: 2.25, sm: 3.5 },
          py: { xs: 2, sm: 2.25 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              flexShrink: 0,
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.25, fontSize: { xs: '1.05rem', sm: '1.18rem' }, letterSpacing: '-0.025em' }}>
                AI Idea Assistant
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.35 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '-0.01em' }}>
                  You guide the AI with your market knowledge to uncover 10–12 sharp article outlines
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Minimize Button */}
            <Button
              size="small"
              onClick={minimizeAssistant}
              startIcon={<RemoveIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                bgcolor: 'rgba(0,0,0,0.04)',
                color: '#334155',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '12px',
                px: 1.5,
                py: 0.6,
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', transform: 'translateY(-1px)' }
              }}
            >
              Minimize
            </Button>

            {/* Close Button */}
            <IconButton
              onClick={closeAssistant}
              sx={{
                color: '#64748b',
                bgcolor: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '12px',
                p: 0.85,
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', transform: 'scale(1.05)' }
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Scrollable Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* VISUAL ANCHOR: SIDE-BY-SIDE SQUIRCLE INTERSECTION             */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: { xs: 1.5, sm: 2 },
            }}
          >
            {/* Left Squircle: Commodity */}
            <Box
              sx={{
                width: { xs: 125, sm: 145 },
                height: { xs: 125, sm: 145 },
                borderRadius: '32px',
                overflow: 'hidden',
                position: 'relative',
                backgroundImage: `url(${getCommodityMeta(selectedCommodity)?.imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid #ffffff',
                boxShadow: '0 16px 36px -8px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)',
                transform: 'rotate(-3deg)',
                zIndex: 1,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': { transform: 'rotate(0deg) scale(1.06)', zIndex: 3, boxShadow: '0 20px 44px -8px rgba(0,0,0,0.3)' },
              }}
            >
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.85) 100%)' }} />
              <Box sx={{
                position: 'absolute',
                bottom: 10,
                left: 8,
                right: 8,
                p: '3px 8px',
                borderRadius: '10px',
                bgcolor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <Typography sx={{ color: '#fff', fontSize: '0.74rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🌾 {selectedCommodity.split(',')[0]}
                </Typography>
              </Box>
            </Box>

            {/* Center Intersection Badge */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#0f172a',
                color: '#f59e0b',
                border: '3px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
                fontWeight: 900,
                zIndex: 2,
                mx: { xs: -2, sm: -2.5 },
                boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
              }}
            >
              ×
            </Box>

            {/* Right Squircle: Strategic Pillar */}
            <Box
              sx={{
                width: { xs: 125, sm: 145 },
                height: { xs: 125, sm: 145 },
                borderRadius: '32px',
                overflow: 'hidden',
                position: 'relative',
                backgroundImage: `url(${foodChallenges.find(c => c.id.toLowerCase() === selectedCategory.toLowerCase())?.imageUrl || '/images/challenges/insecurity.webp'}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid #ffffff',
                boxShadow: '0 16px 36px -8px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)',
                transform: 'rotate(3deg)',
                zIndex: 1,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': { transform: 'rotate(0deg) scale(1.06)', zIndex: 3, boxShadow: '0 20px 44px -8px rgba(0,0,0,0.3)' },
              }}
            >
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.85) 100%)' }} />
              <Box sx={{
                position: 'absolute',
                bottom: 10,
                left: 8,
                right: 8,
                p: '3px 8px',
                borderRadius: '10px',
                bgcolor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <Typography sx={{ color: '#93c5fd', fontSize: '0.74rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🛡️ {getCategoryShortName(selectedCategory)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 0: WORKFLOW OVERVIEW                                    */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="wiki-step-0" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                0
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 0: How You Guide the AI
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  You are the Director steering the research; the AI is your OSINT Analyst.
                </Typography>
              </Box>
            </Box>

            {/* Step 0 Action Checklist */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.75, border: '1px solid rgba(15, 23, 42, 0.15)', borderRadius: '14px', bgcolor: 'rgba(15, 23, 42, 0.02)' }}>
              {[
                { id: 'act_sop_0a', text: '1. Fill in 2 quick inputs per step to shape your research.' },
                { id: 'act_sop_0b', text: '2. Copy and run each prompt sequentially in ChatGPT, Claude, or Gemini.' },
                { id: 'act_sop_0c', text: '3. Paste the final output into Step 4 to import 12 article cards directly onto your board.' },
              ].map(item => {
                const isChecked = !!wikiChecklist[item.id];
                return (
                  <Box
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', p: 1.25, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(15, 23, 42, 0.12)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.05)' }
                    }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '6px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#0f172a',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.25, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.85rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      lineHeight: 1.45
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 1: TRADE HUBS & GEOGRAPHY                               */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="wiki-step-1" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                1
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Step 1: Where is the Action Happening?
              </Typography>
            </Box>

            {/* Step 1 Quick Inputs */}
            <Box sx={{
              p: 2.25,
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <Box>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>🎯</span> Who & Where are we focusing on?
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                  Tell the AI who your target reader is and if you have a specific city in mind.
                </Typography>
              </Box>
              
              <PremiumAutocomplete
                multiple
                freeSolo
                colorTheme="#3b82f6"
                label="Who are we writing for? (Target Audience)"
                placeholder="Select or type e.g. Farmer / Producer, Processor, Investor..."
                options={ACTOR_OPTIONS}
                value={targetActors}
                onChange={(_, val) => setTargetActors(val as string[])}
              />

              <PremiumTextField
                colorTheme="#3b82f6"
                label="Do you have a specific city or market in mind? (Optional)"
                placeholder="e.g. Dawanau Market, Kano or Mile 12, Lagos"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                fullWidth
              />
            </Box>

            

            

                        {/* Action Checklist: Before Prompt */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.75, border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '14px', bgcolor: 'rgba(59, 130, 246, 0.03)' }}>
              {[
                { id: 'act_copy_1a', text: '1. Copy Step 1 Prompt below and run it in ChatGPT, Claude, or Gemini.' }
              ].map(item => {
                const isChecked = !!wikiChecklist[item.id];
                return (
                  <Box
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', p: 1.2, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.18)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.06)' }
                    }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '6px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#3b82f6',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.25, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.84rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      lineHeight: 1.4
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* PromptBuilderBlock Terminal */}
            {copiedPromptTab === 'doc1a' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.25, bgcolor: 'rgba(59, 130, 246, 0.06)', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#3b82f6' }} />
                  <Typography sx={{ color: '#1e40af', fontWeight: 700, fontSize: '0.9rem' }}>
                    Step 1 Prompt Copied to Clipboard!
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setCopiedPromptTab(null)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', color: '#2563eb' }}>
                  View Prompt Code
                </Button>
              </Box>
            ) : (
              <Box sx={{ position: 'relative', bgcolor: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(0,0,0,0.15)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#1e293b', borderBottom: '1px solid #334155' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#10b981' }} />
                  </Box>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    STEP 1 PROMPT · FIND 5 HOT MARKETS
                  </Typography>
                  <Box sx={{ width: 33 }} />
                </Box>

                <Box sx={{ p: 2.5, maxHeight: 180, overflowY: 'auto' }}>
                  <Typography component="pre" sx={{ color: '#e2e8f0', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', m: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {compiledPrompt1a}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, pt: 1.25, bgcolor: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Button
                    onClick={() => handleCopyPromptText(compiledPrompt1a, 'doc1a')}
                    sx={{
                      bgcolor: '#3b82f6',
                      color: '#fff',
                      borderRadius: '16px',
                      py: 1,
                      px: 3.5,
                      fontWeight: 800,
                      textTransform: 'none',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#2563eb', transform: 'translateY(-1px)' }
                    }}
                  >
                    <ContentCopyIcon sx={{ mr: 1, fontSize: 16 }} />
                    Copy Step 1 Prompt (Find 5 Markets)
                  </Button>
                </Box>
              </Box>
            )}

            {/* Verification Checklist: Under Prompt */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, p: 2, border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '16px', bgcolor: 'rgba(59, 130, 246, 0.04)' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ Check the AI Output for Step 1:
              </Typography>
              {[
                { id: 'chk1_hubs', text: `Did the AI identify 5 real cities/markets where ${selectedCommodity} is traded or struggling?` },
                { id: 'chk1_eras', text: "Did it explain past history, today's active crisis, and what will happen by 2030?" },
              ].map(item => {
                const isChecked = !!wikiChecklist[item.id];
                return (
                  <Box
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', p: 1.2, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.08)' }
                    }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '6px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#3b82f6',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.25, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.84rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      transition: 'all 0.2s',
                      lineHeight: 1.4
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            </Box>

          <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 1.5 }} />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 2: DRUCKER INNOVATION OSINT ENGINE                      */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="wiki-step-2" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                2
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Step 2: Real Market Costs & Traps
              </Typography>
            </Box>

            {/* Step 2 Quick Inputs */}
            <Box sx={{
              p: 2.25,
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <Box>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>🔄</span> What problem are we solving?
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                  Tell the AI what practical action you want the reader to take, and why it is urgent.
                </Typography>
              </Box>

              {/* Crash-Proof Segmented Pill Switcher for Location */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  Choose your focus location:
                </Typography>
                <Box sx={{
                  display: 'flex',
                  p: 0.5,
                  borderRadius: '12px',
                  bgcolor: '#f1f5f9',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <Button
                    onClick={() => setLocationPivot(false)}
                    sx={{
                      flex: 1,
                      py: 0.75,
                      borderRadius: '9px',
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      fontWeight: !locationPivot ? 800 : 600,
                      color: !locationPivot ? '#0f172a' : '#64748b',
                      bgcolor: !locationPivot ? '#ffffff' : 'transparent',
                      boxShadow: !locationPivot ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: !locationPivot ? '#ffffff' : 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    📍 Stick to My City / Market
                  </Button>
                  <Button
                    onClick={() => setLocationPivot(true)}
                    sx={{
                      flex: 1,
                      py: 0.75,
                      borderRadius: '9px',
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      fontWeight: locationPivot ? 800 : 600,
                      color: locationPivot ? '#b45309' : '#64748b',
                      bgcolor: locationPivot ? '#ffffff' : 'transparent',
                      boxShadow: locationPivot ? '0 2px 8px rgba(245, 158, 11, 0.15)' : 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: locationPivot ? '#ffffff' : 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    ⚡ Use AI Top Market
                  </Button>
                </Box>
              </Box>

              {/* Question 1: Desired Outcome */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  💡 What should this person do differently? (The Solution)
                </Typography>
                <PremiumMarkdownEditor
                  colorTheme="#f59e0b"
                  placeholder="e.g. Start solar drying ginger before loading trucks, or sell directly to juice factories."
                  value={expectedOutcome}
                  onChange={(e: any) => setExpectedOutcome(e.target.value)}
                  minRows={3}
                  fullWidth
                />
              </Box>

              {/* Question 2: Why Now (The Trigger) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  ⚡ Why is this urgent right now? (The Trigger)
                </Typography>
                <PremiumMarkdownEditor
                  colorTheme="#f59e0b"
                  placeholder="e.g. Diesel prices doubled, new export standards, or recent floods ruined 40% of crops."
                  value={whyNow}
                  onChange={(e: any) => setWhyNow(e.target.value)}
                  minRows={3}
                  fullWidth
                />
              </Box>
            </Box>

                        {/* Action Checklist: Before Prompt */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.75, border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '14px', bgcolor: 'rgba(245, 158, 11, 0.03)' }}>
              {[
                { id: 'act_copy_1b', text: '1. Copy Step 2 Prompt below and run it in the SAME AI chat thread.' }
              ].map(item => {
                const isChecked = !!wikiChecklist[item.id];
                return (
                  <Box
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', p: 1.2, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.25)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.08)' }
                    }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '6px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#f59e0b',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.25, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.84rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      lineHeight: 1.4
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* PromptBuilderBlock Terminal */}
            {copiedPromptTab === 'doc1b' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.25, bgcolor: 'rgba(245, 158, 11, 0.08)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#f59e0b' }} />
                  <Typography sx={{ color: '#b45309', fontWeight: 700, fontSize: '0.9rem' }}>
                    Step 2 Prompt Copied to Clipboard!
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setCopiedPromptTab(null)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', color: '#b45309' }}>
                  View Prompt Code
                </Button>
              </Box>
            ) : (
              <Box sx={{ position: 'relative', bgcolor: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(0,0,0,0.15)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#1e293b', borderBottom: '1px solid #334155' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#10b981' }} />
                  </Box>
                  <Typography sx={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    STEP 2 PROMPT · UNCOVER REAL MARKET COSTS
                  </Typography>
                  <Box sx={{ width: 33 }} />
                </Box>

                <Box sx={{ p: 2.5, maxHeight: 180, overflowY: 'auto' }}>
                  <Typography component="pre" sx={{ color: '#fbbf24', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', m: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {compiledPrompt1b}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, pt: 1.25, bgcolor: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Button
                    onClick={() => handleCopyPromptText(compiledPrompt1b, 'doc1b')}
                    sx={{
                      bgcolor: '#f59e0b',
                      color: '#000',
                      borderRadius: '16px',
                      py: 1,
                      px: 3.5,
                      fontWeight: 900,
                      textTransform: 'none',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#d97706', transform: 'translateY(-1px)' }
                    }}
                  >
                    <ContentCopyIcon sx={{ mr: 1, fontSize: 16 }} />
                    Copy Step 2 Prompt (Market Costs)
                  </Button>
                </Box>
              </Box>
            )}

            {/* Verification Checklist: Under Prompt */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, p: 2, border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', bgcolor: 'rgba(245, 158, 11, 0.04)' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ Check the AI Output for Step 2:
              </Typography>
              {[
                { id: 'chk2_vectors', text: 'Did the AI pick the 6 best, most practical topics for this commodity?' },
                { id: 'chk2_asymmetry', text: 'Did it clearly name who is losing money and who is profiting from the problem?' },
              ].map(item => {
                const isChecked = !!wikiChecklist[item.id];
                return (
                  <Box
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', p: 1.2, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.2)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.08)' }
                    }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '6px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#f59e0b',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.25, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.84rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      transition: 'all 0.2s',
                      lineHeight: 1.4
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            </Box>

          <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 1.5 }} />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 3: SPECTRUM SYNTHESIZER & OUTLINES                      */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="wiki-step-3" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)'
              }}>
                3
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 3: Generate 12 Article Ideas
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  Creates 10–12 clickable article headlines across 6 practical story angles
                </Typography>
              </Box>
            </Box>

            {/* 6 Cognitive Spectrum Market Angles Quick Guide */}
            <Box sx={{
              p: 2,
              bgcolor: '#faf5ff',
              border: '1px solid #e9d5ff',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 900, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <span>🎯</span> The 6 Nigerian Market Angles in this Turn:
                </Typography>
                <Chip label="10–12 Outlines" size="small" sx={{ bgcolor: 'rgba(168, 85, 247, 0.2)', color: '#6b21a8', fontWeight: 800, fontSize: '0.68rem', height: 20 }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                {[
                  { rank: '#1', name: 'Urgent Crisis', desc: 'Everyday fuel, spoilage & freight squeeze', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', emoji: '🔴' },
                  { rank: '#2', name: 'Big Business Move', desc: 'Large company investments & buyer contracts', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', emoji: '🏛️' },
                  { rank: '#3', name: 'Grassroots Hack', desc: 'Everyday farmer and truck driver survival tricks', color: '#d97706', bg: '#fffbeb', border: '#fde68a', emoji: '🚜' },
                  { rank: '#4', name: 'Future Tech', desc: 'Solar drying, simple cold storage & new seeds', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', emoji: '🧬' },
                  { rank: '#5', name: 'Government & Macro Risk', desc: 'Currency drops, high loan rates & export laws', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', emoji: '⚠️' },
                  { rank: '#6', name: 'Wild Surprise', desc: 'Unusual market tricks and hidden opportunities', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', emoji: '🔮' },
                ].map(spectrum => (
                  <Box
                    key={spectrum.rank}
                    sx={{
                      p: 1.25,
                      bgcolor: spectrum.bg,
                      border: `1px solid ${spectrum.border}`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.25
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>{spectrum.emoji}</Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: spectrum.color, lineHeight: 1.2 }}>
                        {spectrum.rank} {spectrum.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500, lineHeight: 1.3, mt: 0.25 }}>
                        {spectrum.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Step 3 Quick Inputs */}
            <Box sx={{
              p: 2.25,
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}>
              <Box>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#7e22ce', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>🥊</span> Choose your story angle:
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                  Decide whether to stick to your original angle or follow the AI market suggestion.
                </Typography>
              </Box>

              {/* Crash-Proof Segmented Pill Switcher for Strategy */}
              <Box sx={{
                display: 'flex',
                p: 0.5,
                borderRadius: '12px',
                bgcolor: '#f1f5f9',
                border: '1px solid rgba(0,0,0,0.06)'
              }}>
                <Button
                  onClick={() => setStrategicPivot(false)}
                  sx={{
                    flex: 1,
                    py: 0.75,
                    borderRadius: '9px',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: !strategicPivot ? 800 : 600,
                    color: !strategicPivot ? '#0f172a' : '#64748b',
                    bgcolor: !strategicPivot ? '#ffffff' : 'transparent',
                    boxShadow: !strategicPivot ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: !strategicPivot ? '#ffffff' : 'rgba(0,0,0,0.04)' }
                  }}
                >
                  🥊 Stick to My Original Idea
                </Button>
                <Button
                  onClick={() => setStrategicPivot(true)}
                  sx={{
                    flex: 1,
                    py: 0.75,
                    borderRadius: '9px',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: strategicPivot ? 800 : 600,
                    color: strategicPivot ? '#7e22ce' : '#64748b',
                    bgcolor: strategicPivot ? '#ffffff' : 'transparent',
                    boxShadow: strategicPivot ? '0 2px 8px rgba(168, 85, 247, 0.15)' : 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: strategicPivot ? '#ffffff' : 'rgba(0,0,0,0.04)' }
                  }}
                >
                  🔄 Follow AI Recommendation
                </Button>
              </Box>
            </Box>

                        {/* Action Checklist: Before Prompt */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.75, border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '14px', bgcolor: 'rgba(168, 85, 247, 0.03)' }}>
              {[
                { id: 'act_copy_1c', text: '1. Copy Step 3 Prompt below and run it in the SAME AI chat thread.' }
              ].map(item => {
                const isChecked = !!wikiChecklist[item.id];
                return (
                  <Box
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', p: 1.2, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(168, 85, 247, 0.25)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(168, 85, 247, 0.08)' }
                    }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '6px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#a855f7',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.25, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.84rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      lineHeight: 1.4
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* PromptBuilderBlock Terminal */}
            {copiedPromptTab === 'doc1c' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.25, bgcolor: 'rgba(168, 85, 247, 0.08)', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#a855f7' }} />
                  <Typography sx={{ color: '#7e22ce', fontWeight: 700, fontSize: '0.9rem' }}>
                    Step 3 Prompt Copied to Clipboard!
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setCopiedPromptTab(null)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', color: '#7e22ce' }}>
                  View Prompt Code
                </Button>
              </Box>
            ) : (
              <Box sx={{ position: 'relative', bgcolor: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(0,0,0,0.15)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#1e293b', borderBottom: '1px solid #334155' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#10b981' }} />
                  </Box>
                  <Typography sx={{ color: '#c084fc', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    STEP 3 PROMPT · GENERATE 12 ARTICLES
                  </Typography>
                  <Box sx={{ width: 33 }} />
                </Box>

                <Box sx={{ p: 2.5, maxHeight: 180, overflowY: 'auto' }}>
                  <Typography component="pre" sx={{ color: '#c084fc', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', m: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {compiledPrompt1c}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, pt: 1.25, bgcolor: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Button
                    onClick={() => handleCopyPromptText(compiledPrompt1c, 'doc1c')}
                    sx={{
                      bgcolor: '#a855f7',
                      color: '#fff',
                      borderRadius: '16px',
                      py: 1.1,
                      px: 4,
                      fontWeight: 800,
                      textTransform: 'none',
                      fontSize: '0.88rem',
                      boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#9333ea', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(168, 85, 247, 0.5)' }
                    }}
                  >
                    <ContentCopyIcon sx={{ mr: 1, fontSize: 16 }} />
                    Copy Step 3 Prompt (Generate 12 Articles)
                  </Button>
                </Box>
              </Box>
            )}

            {/* Verification Checklist: Under Prompt */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, p: 2, border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', bgcolor: 'rgba(168, 85, 247, 0.04)' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ Check the AI Output for Step 3:
              </Typography>
              {[
                { id: 'chk3_ranks', text: 'Did the AI produce 10 to 12 distinct, clickable article titles across all 6 angles?' },
                { id: 'chk3_headers', text: 'Does every article start with a [SYSTEM_METADATA] block and a 6-sentence summary?' },
              ].map(item => {
                const isChecked = !!wikiChecklist[item.id];
                return (
                  <Box
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', p: 1.2, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(168, 85, 247, 0.2)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(168, 85, 247, 0.08)' }
                    }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '6px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#a855f7',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.25, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.84rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      transition: 'all 0.2s',
                      lineHeight: 1.4
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            </Box>

          <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 1.5 }} />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 4: FAST INGEST SCRATCHPAD & STUDIO PARSER              */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="wiki-step-4" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                4
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Step 4: Import Articles into Studio
              </Typography>
            </Box>

                        {/* Action Checklist: Before Scratchpad */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.75, border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.03)' }}>
              {[
                { id: 'chk4_paste', text: '1. Paste your final Document 1c output from ChatGPT/Claude into the box below.' }
              ].map(item => {
                const isChecked = !!wikiChecklist[item.id] || !!customIngestMarkdown.trim();
                return (
                  <Box
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', p: 1.2, borderRadius: '10px', cursor: 'pointer',
                      bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)' }
                    }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '6px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#059669',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.25, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.84rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      lineHeight: 1.4
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Step 4 Scratchpad Block */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="overline" sx={{ color: '#10b981', fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  📝 Step 4 Scratchpad · Paste Final 12 Articles
                </Typography>
                {customIngestMarkdown.trim() ? (
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
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.15)' }
                      }}
                    >
                      Replace from Clipboard
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setCustomIngestMarkdown('');
                        saveScratchpadToStorage({ ingest: '' });
                      }}
                      sx={{
                        color: '#94a3b8',
                        fontWeight: 700,
                        borderRadius: '8px',
                        px: 1,
                        py: 0.4,
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)' }
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                ) : null}
              </Box>

              {!customIngestMarkdown.trim() && (
                <Button
                  variant="outlined"
                  onClick={handlePasteFromClipboard}
                  startIcon={<ContentPasteIcon sx={{ fontSize: 20 }} />}
                  sx={{
                    py: 2.2,
                    borderRadius: '16px',
                    border: '2px dashed #10b981',
                    bgcolor: 'rgba(16, 185, 129, 0.04)',
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
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      borderColor: '#047857',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Tap to Paste Your 12 Articles from Clipboard
                </Button>
              )}

              <PremiumMarkdownEditor
                colorTheme="#10b981"
                minRows={6}
                fullWidth
                placeholder={`---\n**[SYSTEM_METADATA]**\n* Category_ID: Land\n* Subcategory_ID: Sole Farmland Ownership\n* Commodity: ${selectedCommodity}\n* Format_Type: Brief\n* Era: Present\n* Location: Dawanau Hub, Kano\n* Spectrum_Rank: #1 (The Bleeding Neck)\n* Target_Persona: Agri-VCs & Haulers\n\n### Title...\n\n**Description:**\n* Bullet 1...\n* Bullet 2...\n---`}
                value={customIngestMarkdown}
                onChange={(e: any) => {
                  setCustomIngestMarkdown(e.target.value);
                  saveScratchpadToStorage({ ingest: e.target.value });
                }}
              />
            </Box>

            {/* Verification Checklist */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, p: 2.25, border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.04)' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ Check Before Importing:
              </Typography>
              {[
                { id: 'chk4_detected', text: `Live Detection: ${liveParsedBriefs.length} valid article cards detected.` },
                { id: 'chk4_ingest', text: 'Ready to click "Import Articles into Studio" to render them directly on your canvas.' },
              ].map(item => {
                const isChecked = !!wikiChecklist[item.id];
                return (
                  <Box
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', p: 1.25, borderRadius: '12px', cursor: 'pointer',
                      bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }
                    }}
                  >
                    <Box sx={{
                      width: 22, height: 22, borderRadius: '7px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#10b981',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.5, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="12" height="9" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.86rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      transition: 'all 0.2s',
                      lineHeight: 1.4
                    }}>
                      {item.text}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Live Detection Banner */}
            {liveParsedBriefs.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: '#ecfdf5', borderRadius: '14px', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#059669', fontSize: 22 }} />
                  <Typography sx={{ color: '#065f46', fontWeight: 900, fontSize: '0.9rem' }}>
                    ✓ Live Detection: {liveParsedBriefs.length} Valid Briefs Ready to Ingest!
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {Array.from(new Set(liveParsedBriefs.map(b => b.spectrumRank))).map(rank => (
                    <Chip key={rank} label={rank} size="small" sx={{ bgcolor: '#059669', color: '#fff', fontSize: '0.65rem', fontWeight: 800 }} />
                  ))}
                </Box>
              </Paper>
            )}

            {customIngestError && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {customIngestError}
              </Alert>
            )}

            {/* Ingest Action CTA */}
            <Button
              variant="contained"
              onClick={handleFastIngestCustomOutlines}
              disabled={!customIngestMarkdown.trim()}
              startIcon={<BoltIcon />}
              sx={{
                bgcolor: '#10b981',
                color: '#fff',
                fontWeight: 900,
                py: 1.5,
                px: 4,
                borderRadius: '16px',
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)',
                '&:hover': { bgcolor: '#059669' },
                '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
              }}
            >
              🚀 Ingest & Render {liveParsedBriefs.length ? `${liveParsedBriefs.length} Briefs` : 'Outlines'} into Studio
            </Button>
          </Box>

        </Box>
      </Drawer>
    </PromptAssistantContext.Provider>
  );
}
