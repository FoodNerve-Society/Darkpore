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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import PremiumDropdown, { PremiumDropdownOption } from '@/components/PremiumDropdown';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import PremiumTextField from '@/components/PremiumTextField';
import {
  PromptTerminalBox,
  PromptChecklistItem,
  PromptFastIngestBox,
} from '@/components/prompts';

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
  isSuspended: boolean;
  hasEditorDock: boolean;
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
  suspendDock: (suspend: boolean) => void;
  setHasEditorDock: (active: boolean) => void;
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
  isSuspended: false,
  hasEditorDock: false,
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
  suspendDock: () => {},
  setHasEditorDock: () => {},
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

const ACTOR_METADATA: Record<string, { desc: string; emoji: string }> = {
  producer: { desc: 'Smallholders, commercial farm estates & outgrower schemes', emoji: '🌾' },
  processor: { desc: 'Commercial feed mills, packaging plants, processing hubs', emoji: '🏭' },
  distributor: { desc: 'Inter-state grain haulers, cold-chain transport, fleet handlers', emoji: '🚛' },
  retailer: { desc: 'Commodity aggregators, physical market dealers, grain merchants', emoji: '🏪' },
  consumer: { desc: 'Urban consumers, institutional buyers & household shoppers', emoji: '🛒' },
  regulator: { desc: 'Federal ministries, export promotion councils, standards bodies', emoji: '🏛️' },
  innovator: { desc: 'Agri-tech startups, extension researchers, biotech labs', emoji: '💡' },
  investor: { desc: 'PE funds, commercial lenders, deal sponsors & impact investors', emoji: '💼' },
};

export const TARGET_AUDIENCE_OPTIONS: PremiumDropdownOption<string>[] = CMS_ACTORS.map(actor => ({
  id: actor.id,
  label: actor.label,
  secondaryLabel: ACTOR_METADATA[actor.id]?.desc || actor.label,
  emoji: ACTOR_METADATA[actor.id]?.emoji || '👥',
}));

export const usePromptAssistant = () => useContext(PromptAssistantContext);

export function PromptAssistantProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isOpen, setIsOpen] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [hasEditorDock, setHasEditorDock] = useState(false);

  const suspendDock = useCallback((suspend: boolean) => {
    setIsSuspended(suspend);
  }, []);

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
  const [copiedPromptTabs, setCopiedPromptTabs] = useState<Record<string, boolean>>({});

  // === SPARRING PARTNER INTERACTIVE INPUTS ===
  const [targetActors, setTargetActors] = useState<string[]>([]);
  const [targetLocation, setTargetLocation] = useState('');
  
  // Step 2 State
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [whyNow, setWhyNow] = useState('');

  // Expandable Questions state for "Answer Now" toggles
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const isQOpen = useCallback((qId: string, value: string | string[]) => {
    if (expandedQuestions[qId] !== undefined) {
      return expandedQuestions[qId];
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Boolean(value && value.trim());
  }, [expandedQuestions]);

  const toggleQuestion = useCallback((qId: string, value: string | string[]) => {
    setExpandedQuestions(prev => {
      const hasVal = Array.isArray(value) ? value.length > 0 : Boolean(value && value.trim());
      const current = prev[qId] !== undefined ? prev[qId] : hasVal;
      return { ...prev, [qId]: !current };
    });
  }, []);

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
      setCopiedPromptTabs(prev => ({ ...prev, [tabKey]: true }));

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

  const handleExpandPrompt = useCallback((tabKey: string) => {
    setCopiedPromptTabs(prev => ({ ...prev, [tabKey]: false }));
  }, []);

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
  // Anchor temporal context strictly to the active writing date (the month and year the author is writing the piece)
  const currentMonthYearStr = useMemo(() => {
    return format(new Date(), 'MMMM yyyy');
  }, []);

  const compiledPrompt1a = useMemo(() => {
    const actorsVal = targetActors.join(', ').trim();
    // If rawPrompts was passed from an external caller, inject user inputs into it
    if (rawPrompts?.doc1aPrompt) {
      let updated = rawPrompts.doc1aPrompt;
      const locVal = targetLocation.trim() || '[Optional: Global Top 5 to be determined by AI]';

      if (updated.includes('{{target_actors}}')) {
        updated = updated.replace(/\{\{target_actors\}\}/g, actorsVal);
      } else if (updated.includes('Target Value Chain Actor(s):')) {
        updated = updated.replace(/Target Value Chain Actor\(s\):[^\n]+/g, `Target Value Chain Actor(s): ${actorsVal}`);
      } else if (actorsVal) {
        updated = updated.replace(/Commodity Pair:[^\n]+/g, `$& \nTarget Value Chain Actor(s): ${actorsVal}`);
      }

      if (updated.includes('{{user_location}}')) {
        updated = updated.replace(/\{\{user_location\}\}/g, locVal);
      } else if (updated.includes("User's Optional Location:")) {
        updated = updated.replace(/User's Optional Location:[^\n]+/g, `User's Optional Location: ${locVal}`);
      } else if (targetLocation.trim()) {
        updated = updated.replace(/Commodity Pair:[^\n]+/g, `$& \nUser's Optional Location: ${locVal}`);
      }

      if (updated.includes('{{current_month_year}}')) {
        updated = updated.replace(/\{\{current_month_year\}\}/g, currentMonthYearStr);
      }

      return updated;
    }

    return buildDoc1aPrompt({
      category: activeChallenge?.title || selectedCategory,
      commodity: selectedCommodity,
      subcategoriesList: activeSubsList,
      currentMonthYear: currentMonthYearStr,
      targetActors: targetActors.length > 0 ? targetActors : undefined,
      userLocation: targetLocation.trim() || undefined,
    });
  }, [rawPrompts?.doc1aPrompt, activeChallenge, selectedCategory, selectedCommodity, activeSubsList, currentMonthYearStr, targetActors, targetLocation]);

  const compiledPrompt1b = useMemo(() => {
    const actorsVal = targetActors.join(', ').trim();
    if (rawPrompts?.doc1bPrompt) {
      let updated = rawPrompts.doc1bPrompt;
      const locVal = targetLocation.trim()
        ? `${targetLocation.trim()} (plus all Ranked Epicenters from Doc 1a)`
        : 'All Ranked Epicenters from Doc 1a';
      const outcomeVal = expectedOutcome.trim() || '[Specify what operational/commercial change the actor must make]';
      const whyNowVal = whyNow.trim() || '[Specify what market shift or news event triggered this]';

      if (updated.includes('{{target_actors}}')) {
        updated = updated.replace(/\{\{target_actors\}\}/g, actorsVal);
      } else if (updated.includes('Target Value Chain Actor(s):')) {
        updated = updated.replace(/Target Value Chain Actor\(s\):[^\n]+/g, `Target Value Chain Actor(s): ${actorsVal}`);
      }

      if (updated.includes('{{ranked_locations}}')) {
        updated = updated.replace(/\{\{ranked_locations\}\}/g, locVal);
      } else if (updated.includes('{{selected_location}}')) {
        updated = updated.replace(/\{\{selected_location\}\}/g, locVal);
      } else if (updated.includes('Ranked Locations / Corridor Scope:')) {
        updated = updated.replace(/Ranked Locations \/ Corridor Scope:[^\n]+/g, `Ranked Locations / Corridor Scope: ${locVal}`);
      } else if (updated.includes('Selected Location:')) {
        updated = updated.replace(/Selected Location:[^\n]+/g, `Ranked Locations / Corridor Scope: ${locVal}`);
      }

      if (updated.includes('{{user_outcome}}')) {
        updated = updated.replace(/\{\{user_outcome\}\}/g, outcomeVal);
      } else if (updated.includes("User's Desired Outcome:")) {
        updated = updated.replace(/User's Desired Outcome:[^\n]+/g, `User's Desired Outcome: ${outcomeVal}`);
      }

      if (updated.includes('{{user_why_now}}')) {
        updated = updated.replace(/\{\{user_why_now\}\}/g, whyNowVal);
      } else if (updated.includes("User's 'Why Now' (Timing):")) {
        updated = updated.replace(/User's 'Why Now' \(Timing\):[^\n]+/g, `User's 'Why Now' (Timing): ${whyNowVal}`);
      }

      if (updated.includes('{{current_month_year}}')) {
        updated = updated.replace(/\{\{current_month_year\}\}/g, currentMonthYearStr);
      }

      return updated;
    }

    return buildDoc1bPrompt({
      commodity: selectedCommodity,
      currentMonthYear: currentMonthYearStr,
      doc1aOutput: '[PASTE YOUR DOCUMENT 1A OUTPUT BELOW TO AUTO-INJECT]',
      subcategoriesList: activeSubsList,
      targetActors: targetActors.length > 0 ? targetActors : undefined,
      selectedLocation: targetLocation.trim() || undefined,
      userOutcome: expectedOutcome.trim() || undefined,
      userWhyNow: whyNow.trim() || undefined,
    });
  }, [rawPrompts?.doc1bPrompt, selectedCommodity, currentMonthYearStr, activeSubsList, targetActors, targetLocation, expectedOutcome, whyNow]);

  const compiledPrompt1c = useMemo(() => {
    return buildDoc1cPrompt({
      doc1aOutput: '[PASTE YOUR DOCUMENT 1A OUTPUT IN TURN 1/2 TO AUTO-INJECT]',
      doc1bOutput: '[PASTE YOUR DOCUMENT 1B OUTPUT IN TURN 2 TO AUTO-INJECT]',
      currentMonthYear: currentMonthYearStr,
      userFinalDecision: targetLocation.trim()
        ? `Focus primarily on optimal location (${targetLocation.trim()}) while contrasting against all ranked corridors from Doc 1a`
        : 'Distribute article outlines across all optimal ranked locations identified in Doc 1a & 1b',
      targetPersona: targetActors.join(', ').trim() || undefined,
    });
  }, [currentMonthYearStr, targetLocation, targetActors]);

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
      setIsDockVisible(false); // Idea 1: Auto-dismiss ideas dock on ingest once briefs are rendered to Studio
    } catch (err: any) {
      setCustomIngestError(err.message || 'Failed to parse custom article outlines.');
    }
  }, [customIngestMarkdown, selectedCommodity, selectedCategory]);

  return (
    <PromptAssistantContext.Provider
      value={{
        isOpen,
        isDockVisible,
        isSuspended,
        hasEditorDock,
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
        suspendDock,
        setHasEditorDock,
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
        {!isOpen && isDockVisible && !isSuspended && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: isMobile ? (hasEditorDock ? 146 : 86) : (hasEditorDock ? 82 : 24),
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
        anchor={isMobile ? 'bottom' : 'right'}
        open={isOpen}
        onClose={closeAssistant}
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
            onClick={minimizeAssistant}
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
            onClick={closeAssistant}
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
              background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.04) 55%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* 1. Intersecting Squircles Image Pair (Above Hero Text) */}
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
                  backgroundImage: `url(${getCommodityMeta(selectedCommodity)?.imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
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
                  🌾 {selectedCommodity.split(',')[0]}
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
                  backgroundImage: `url(${foodChallenges.find(c => c.id.toLowerCase() === selectedCategory.toLowerCase())?.imageUrl || '/images/challenges/insecurity.webp'}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
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
                  🛡️ {getCategoryShortName(selectedCategory)}
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
              Run 3 quick AI prompts, then paste the response into Fast Ingest to get 12 ready article briefs.
            </Typography>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP PROGRESSION BODY CONTENT (NO HARD SEPARATION FROM HERO) */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box sx={{ px: { xs: 2.5, sm: 4.5 }, pb: { xs: 4, sm: 5 }, pt: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 0: WORKFLOW OVERVIEW                                    */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="wiki-step-0" sx={{ display: 'flex', flexDirection: 'column', gap: 2, scrollMarginTop: '80px' }}>
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
                  <Box component="span" sx={{ color: '#059669', fontWeight: 800 }}>Optional:</Box> Answer any question below to customize your prompt, or skip them to use defaults.
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
                  Paste the final response into Step 4 to import 12 article briefs directly onto your board.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 1: TRADE HUBS & GEOGRAPHY                               */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="wiki-step-1" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem', flexShrink: 0 }}>
                1
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Step 1: Where is the Action Happening?
              </Typography>
            </Box>

            {/* Step 1 Questions (No outer white bg, tight question cards) */}
            <Box
              sx={{
                ml: { xs: 0, sm: '42px' },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              {/* Question 1 Card: Target Audience (Multi-Select Premium Dropdown) */}
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  p: { xs: 1.25, sm: 1.5 },
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                  },
                }}
              >
                <Box
                  onClick={() => toggleQuestion('step1_q1', targetActors)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    cursor: 'pointer',
                    userSelect: 'none',
                    pb: isQOpen('step1_q1', targetActors) ? 0.75 : 0,
                    borderBottom: isQOpen('step1_q1', targetActors) ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                    1. Who are we writing for? (Target Audience)
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuestion('step1_q1', targetActors);
                    }}
                    sx={{
                      flexShrink: 0,
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      p: 0.5,
                      minWidth: 'auto',
                      color: isQOpen('step1_q1', targetActors)
                        ? '#2563eb'
                        : targetActors.length > 0
                        ? '#059669'
                        : '#64748b',
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    {targetActors.length > 0
                      ? (isQOpen('step1_q1', targetActors) ? 'Collapse' : 'Edit')
                      : (isQOpen('step1_q1', targetActors) ? 'Collapse' : 'Answer')}
                  </Button>
                </Box>

                {isQOpen('step1_q1', targetActors) && (
                  <Box sx={{ pt: 0.5, pb: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <PremiumDropdown
                      options={TARGET_AUDIENCE_OPTIONS}
                      value={TARGET_AUDIENCE_OPTIONS.filter(opt => targetActors.includes(opt.label))}
                      onChange={(selected: any) => {
                        if (Array.isArray(selected)) {
                          setTargetActors(selected.map((item: any) => item.label || item));
                        } else if (selected?.label) {
                          setTargetActors([selected.label]);
                        } else {
                          setTargetActors([]);
                        }
                      }}
                      label="Select target audience (optional)..."
                      colorTheme="#3b82f6"
                      multiple
                      fullWidth
                      popoverTitle="Target Value Chain Stakeholders"
                      popoverSubtitle="Select one or more stakeholder personas to sharpen this research cycle"
                    />
                    <Typography sx={{ fontSize: '0.71rem', color: '#64748b', fontWeight: 500, px: 0.5 }}>
                      Optional · Select one or more value chain actors, or leave blank to cover the whole value chain
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Question 2 Card: Specific City or Hub */}
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  p: { xs: 1.25, sm: 1.5 },
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                  },
                }}
              >
                <Box
                  onClick={() => toggleQuestion('step1_q2', targetLocation)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    cursor: 'pointer',
                    userSelect: 'none',
                    pb: isQOpen('step1_q2', targetLocation) ? 0.75 : 0,
                    borderBottom: isQOpen('step1_q2', targetLocation) ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                    2. Do you have a specific city or market in mind?
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuestion('step1_q2', targetLocation);
                    }}
                    sx={{
                      flexShrink: 0,
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      p: 0.5,
                      minWidth: 'auto',
                      color: isQOpen('step1_q2', targetLocation)
                        ? '#2563eb'
                        : targetLocation.trim()
                        ? '#059669'
                        : '#64748b',
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    {targetLocation.trim()
                      ? (isQOpen('step1_q2', targetLocation) ? 'Collapse' : 'Edit')
                      : (isQOpen('step1_q2', targetLocation) ? 'Collapse' : 'Answer')}
                  </Button>
                </Box>

                {isQOpen('step1_q2', targetLocation) && (
                  <Box sx={{ pt: 0.5, pb: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <PremiumMarkdownEditor
                      colorTheme="#3b82f6"
                      placeholder="e.g. Dawanau Grain Market, Kano, or Bodija Market, Ibadan..."
                      value={targetLocation}
                      onChange={(e) => setTargetLocation(e.target.value)}
                      minRows={2}
                      fullWidth
                    />
                    <Typography sx={{ fontSize: '0.71rem', color: '#64748b', fontWeight: 500, px: 0.5 }}>
                      Default if blank: <Box component="span" sx={{ color: '#0f172a', fontWeight: 700 }}>Top 5 Global & Nigerian Epicenters mapped dynamically by AI</Box>
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Prompt Customization Status Banner for Step 1 (Only shows when vars ingested) */}
            <Box sx={{ ml: { xs: 0, sm: '42px' } }}>
              {(targetActors.length > 0 || Boolean(targetLocation.trim())) && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.75,
                    py: 1,
                    borderRadius: '12px',
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    mb: 1.25,
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#065f46' }}>
                    Prompt updated with your answers
                  </Typography>
                </Box>
              )}

              {/* PromptTerminalBox for Step 1 */}
              <PromptTerminalBox
                title="Step 1 Prompt · Find 5 Hot Markets"
                codeLabel="DOC 1a"
                subtitle="Grounds target audience personas and identifies 5 high-volume physical trading corridors."
                prompt={compiledPrompt1a}
                colorTheme="#3b82f6"
                copiedBannerText="Step 1 Prompt Copied to Clipboard!"
                copyButtonLabel="Copy Step 1 Prompt (Find 5 Markets)"
                maxHeight={220}
                isCopiedExternal={Boolean(copiedPromptTabs['doc1a'])}
                onExpand={() => handleExpandPrompt('doc1a')}
                onCopy={() => {
                  handleCopyPromptText(compiledPrompt1a, 'doc1a');
                }}
              />
            </Box>
          </Box>

          <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', my: 1 }} />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 2: DRUCKER INNOVATION OSINT ENGINE                      */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="wiki-step-2" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem', flexShrink: 0 }}>
                2
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Step 2: Real Market Costs & Traps
              </Typography>
            </Box>

            {/* Step 2 Questions (No outer white bg, tight question cards) */}
            <Box
              sx={{
                ml: { xs: 0, sm: '42px' },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              {/* Question 1 Card: Desired Outcome */}
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  p: { xs: 1.25, sm: 1.5 },
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  transition: 'border-color 0.15s ease',
                  '&:hover': { borderColor: 'rgba(245, 158, 11, 0.3)' },
                }}
              >
                <Box
                  onClick={() => toggleQuestion('step2_q1', expectedOutcome)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    cursor: 'pointer',
                    userSelect: 'none',
                    pb: isQOpen('step2_q1', expectedOutcome) ? 0.75 : 0,
                    borderBottom: isQOpen('step2_q1', expectedOutcome) ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                    1. What should this audience do differently? (The Solution)
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuestion('step2_q1', expectedOutcome);
                    }}
                    sx={{
                      flexShrink: 0,
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      p: 0.5,
                      minWidth: 'auto',
                      color: isQOpen('step2_q1', expectedOutcome)
                        ? '#d97706'
                        : expectedOutcome.trim()
                        ? '#059669'
                        : '#64748b',
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    {expectedOutcome.trim()
                      ? (isQOpen('step2_q1', expectedOutcome) ? 'Collapse' : 'Edit')
                      : (isQOpen('step2_q1', expectedOutcome) ? 'Collapse' : 'Answer')}
                  </Button>
                </Box>

                {isQOpen('step2_q1', expectedOutcome) && (
                  <Box sx={{ pt: 0.5, pb: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <PremiumMarkdownEditor
                      colorTheme="#f59e0b"
                      placeholder="e.g. Start solar drying ginger before loading trucks, or bypass middlemen with cooperative buyer contracts..."
                      value={expectedOutcome}
                      onChange={(e: any) => setExpectedOutcome(e.target.value)}
                      minRows={2}
                      fullWidth
                    />
                    <Typography sx={{ fontSize: '0.71rem', color: '#64748b', fontWeight: 500, px: 0.5 }}>
                      Default if blank: <Box component="span" sx={{ color: '#0f172a', fontWeight: 700 }}>AI automatically determines the best operational pivot</Box>
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Question 2 Card: Why Now */}
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  p: { xs: 1.25, sm: 1.5 },
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  transition: 'border-color 0.15s ease',
                  '&:hover': { borderColor: 'rgba(245, 158, 11, 0.3)' },
                }}
              >
                <Box
                  onClick={() => toggleQuestion('step2_q2', whyNow)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    cursor: 'pointer',
                    userSelect: 'none',
                    pb: isQOpen('step2_q2', whyNow) ? 0.75 : 0,
                    borderBottom: isQOpen('step2_q2', whyNow) ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                    2. Why is this urgent right now? (The Trigger)
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuestion('step2_q2', whyNow);
                    }}
                    sx={{
                      flexShrink: 0,
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      p: 0.5,
                      minWidth: 'auto',
                      color: isQOpen('step2_q2', whyNow)
                        ? '#d97706'
                        : whyNow.trim()
                        ? '#059669'
                        : '#64748b',
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    {whyNow.trim()
                      ? (isQOpen('step2_q2', whyNow) ? 'Collapse' : 'Edit')
                      : (isQOpen('step2_q2', whyNow) ? 'Collapse' : 'Answer')}
                  </Button>
                </Box>

                {isQOpen('step2_q2', whyNow) && (
                  <Box sx={{ pt: 0.5, pb: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <PremiumMarkdownEditor
                      colorTheme="#f59e0b"
                      placeholder="e.g. Diesel prices doubled, new export quality regulations, or recent flood ruined 40% of harvest..."
                      value={whyNow}
                      onChange={(e: any) => setWhyNow(e.target.value)}
                      minRows={2}
                      fullWidth
                    />
                    <Typography sx={{ fontSize: '0.71rem', color: '#64748b', fontWeight: 500, px: 0.5 }}>
                      Default if blank: <Box component="span" sx={{ color: '#0f172a', fontWeight: 700 }}>AI automatically searches current breaking news and market events</Box>
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Prompt Customization Status Banner for Step 2 (Only shows if Step 2 vars ingested) */}
            <Box sx={{ ml: { xs: 0, sm: '42px' } }}>
              {Boolean(expectedOutcome.trim() || whyNow.trim()) && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.75,
                    py: 1,
                    borderRadius: '12px',
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    mb: 1.25,
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#065f46' }}>
                    Prompt updated with your answers
                  </Typography>
                </Box>
              )}

              {/* PromptTerminalBox for Step 2 */}
              <PromptTerminalBox
                title="Step 2 Prompt · Uncover Real Market Costs"
                codeLabel="DOC 1b"
                subtitle="Interrogates supply chain frictions, input costs, and operator workarounds."
                prompt={compiledPrompt1b}
                colorTheme="#f59e0b"
                copiedBannerText="Step 2 Prompt Copied to Clipboard!"
              copyButtonLabel="Copy Step 2 Prompt (Market Costs)"
              maxHeight={220}
              isCopiedExternal={Boolean(copiedPromptTabs['doc1b'])}
              onExpand={() => handleExpandPrompt('doc1b')}
              onCopy={() => {
                handleCopyPromptText(compiledPrompt1b, 'doc1b');
              }}
            />
            </Box>
          </Box>

          <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', my: 1 }} />

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
                  Step 3: Studio Markdown Synthesizer (Doc 1c)
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                  Engages AI coding compiler to serialize 10–12 article briefs directly into Fast Ingest markdown
                </Typography>
              </Box>
            </Box>

            {/* Step 3 Content Wrapper */}
            <Box sx={{ ml: { xs: 0, sm: '42px' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
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

              {/* Prompt Customization Status Banner for Step 3 (Only shows if vars ingested) */}
              {Boolean(targetActors.length > 0 || targetLocation.trim()) && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.75,
                    py: 1,
                    borderRadius: '12px',
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    mb: 1.25,
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#065f46' }}>
                    Prompt updated with your answers
                  </Typography>
                </Box>
              )}

              {/* PromptBuilderBlock Terminal */}
              <PromptTerminalBox
                title="Step 3 Prompt · Studio Markdown Synthesizer"
                codeLabel="DOC 1c"
                colorTheme="#a855f7"
                prompt={compiledPrompt1c}
                isCopiedExternal={Boolean(copiedPromptTabs['doc1c'])}
                onExpand={() => handleExpandPrompt('doc1c')}
                onCopy={() => {
                  handleCopyPromptText(compiledPrompt1c, 'doc1c');
                }}
              />
            </Box>
          </Box>

          <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', my: 1 }} />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* STEP 4: FAST INGEST SCRATCHPAD & STUDIO PARSER              */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box id="wiki-step-4" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, scrollMarginTop: '80px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem', flexShrink: 0 }}>
                4
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Step 4: Import Articles into Studio
              </Typography>
            </Box>

            {/* Step 4 Fast Ingest Component */}
            <Box sx={{ ml: { xs: 0, sm: '42px' } }}>
              <PromptFastIngestBox
                value={customIngestMarkdown}
                onChange={(val) => {
                  setCustomIngestMarkdown(val);
                  saveScratchpadToStorage({ ingest: val });
                }}
                onIngest={handleFastIngestCustomOutlines}
                title="Step 4 Fast Ingest · 12 Articles Relay"
                subtitle="Paste the generated markdown output from Step 3 to apply and render directly in Studio."
                codeLabel="FAST INGEST"
                fileName="articles.md"
                unitLabel="articles"
                colorTheme="#10b981"
                placeholder={`---\n**[SYSTEM_METADATA]**\n* Category_ID: Land\n* Subcategory_ID: Sole Farmland Ownership\n* Commodity: ${selectedCommodity}\n* Format_Type: Brief\n* Era: Present\n* Location: Dawanau Hub, Kano\n* Spectrum_Rank: #1 (The Bleeding Neck)\n* Target_Persona: Agri-VCs & Haulers\n\n### Title...\n\n**Description:**\n* Bullet 1...\n* Bullet 2...\n---`}
                liveBlockCount={liveParsedBriefs.length}
                expectedBlockCount={12}
                buttonLabel="Visualise articles"
                hideButtonWhenEmpty={true}
                showButtonIcon={false}
                error={customIngestError}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  </PromptAssistantContext.Provider>
  );
}
