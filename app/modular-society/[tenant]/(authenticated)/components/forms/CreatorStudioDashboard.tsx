import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, IconButton, alpha, Tooltip, CircularProgress, Button,
  Drawer, TextField, Accordion, AccordionSummary, AccordionDetails, Breadcrumbs, Link,
  Alert, AlertTitle, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  LiveTv as LiveTvIcon,
  School as SchoolIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Close as CloseIcon,
  ArrowForwardIos as ArrowForwardIcon,
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForward as ArrowForwardArrow,
  Minimize as MinimizeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  ContentPaste as ContentPasteIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  SwapHoriz as SwapHorizIcon,
  TrendingUp as TrendingUpIcon,
  Build as BuildIcon,
  CompareArrows as CompareArrowsIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  Spa as SpaIcon,
  ContentCopy as ContentCopyIcon,
  Terminal as TerminalIcon,
  FilterList as FilterListIcon,
  Check as CheckIcon,
  LocationOn as LocationIcon,
  AccountCircle as AccountCircleIcon,
  MonetizationOn as MonetizationIcon,
  SmartToy as SmartToyIcon,
  Bolt as BoltIcon,
  Input as InputIcon,
  Output as OutputIcon,
  Send as SendIcon,
  Code as CodeIcon,
  Lightbulb as LightbulbIcon,
  AutoFixHigh as AutoFixHighIcon,
  Storage as StorageIcon,
  MenuBook as MenuBookIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DocIcon,
  NavigateNext as NavigateNextIcon,
  Folder as FolderIcon,
  PlayArrow as PlayArrowIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import WikiHotspot from '@/components/wiki/WikiHotspot';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import WorkspaceContentManager from '@/app/components/studio/WorkspaceContentManager';
import { usePromptAssistant } from '@/context/PromptAssistantContext';
import { commoditiesList, getCommodityMeta } from '@/lib/cms/commodities';
import { getISOWeek, startOfISOWeek, addDays, format, getYear } from 'date-fns';
import { CATEGORY_MAP } from '@/lib/config/editorialMatrix';
import { getDailyEditorialIntel, regenerateCustomAnglesAction, ArticleInsightItem } from '@/lib/actions/editorialMatrix';
import { FORMAT_CONFIG, ERA_CONFIG, ArticleFormat, ArticleEra } from '@/lib/config/articleBlueprints';
import { fetchGlobalLivestreamArticles, fetchGlobalJobs } from '@/lib/actions/learn';
import { parseDoc1cArticles, buildDoc1aPrompt, buildDoc1bPrompt, buildDoc1cPrompt } from '@/lib/config/editorialPrompts';
import { foodChallenges } from '@/lib/cms/food/challenges';
const ACCENT = "#f59e0b";
const ACCENT_DARK = "#d97706";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const START_FRESH_OPTIONS = [
  {
    type: 'article', title: "Intelligence Brief", desc: "Write an in-depth article or report.",
    icon: <ArticleIcon sx={{ fontSize: 32 }} />, color: "#3b82f6", grad: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    readiness: 'live'
  },
  {
    type: 'livestream', title: "Schedule Livestream", desc: "Host a live session.",
    icon: <LiveTvIcon sx={{ fontSize: 32 }} />, color: "#10b981", grad: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
    readiness: 'live'
  },
  {
    type: 'video', title: "Video Insights", desc: "Share short-form video analysis.",
    icon: <VideoLibraryIcon sx={{ fontSize: 32 }} />, color: "#ef4444", grad: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)",
    readiness: 'coming_soon'
  },
  {
    type: 'class', title: "Masterclass", desc: "Create a multi-module learning experience.",
    icon: <SchoolIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6", grad: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)",
    readiness: 'coming_soon'
  }
];

const SPECTRUM_CONFIG: Record<string, { label: string; shortLabel: string; color: string; emoji: string; bg: string }> = {
  '1': { label: 'The Bleeding Neck', shortLabel: '#1 Bleeding Neck', color: '#3b82f6', emoji: '🔵', bg: 'rgba(59, 130, 246, 0.15)' },
  '2': { label: 'Institutional Pivot', shortLabel: '#2 Institutional Pivot', color: '#f59e0b', emoji: '🟡', bg: 'rgba(245, 158, 11, 0.15)' },
  '3': { label: 'The Grassroots Hack', shortLabel: '#3 Grassroots Hack', color: '#f59e0b', emoji: '🟡', bg: 'rgba(245, 158, 11, 0.15)' },
  '4': { label: 'The R&D Horizon', shortLabel: '#4 R&D Horizon', color: '#10b981', emoji: '🟢', bg: 'rgba(16, 185, 129, 0.15)' },
  '5': { label: 'The Macro Threat', shortLabel: '#5 Macro Threat', color: '#10b981', emoji: '🟢', bg: 'rgba(16, 185, 129, 0.15)' },
  '6': { label: 'The Black Swan', shortLabel: '#6 Black Swan', color: '#a855f7', emoji: '🟣', bg: 'rgba(168, 85, 247, 0.15)' },
};

function getSpectrumMeta(spectrumRank?: string) {
  if (!spectrumRank) return SPECTRUM_CONFIG['1'];
  if (spectrumRank.includes('1') || spectrumRank.toLowerCase().includes('bleeding')) return SPECTRUM_CONFIG['1'];
  if (spectrumRank.includes('2') || spectrumRank.toLowerCase().includes('institutional')) return SPECTRUM_CONFIG['2'];
  if (spectrumRank.includes('3') || spectrumRank.toLowerCase().includes('grassroots')) return SPECTRUM_CONFIG['3'];
  if (spectrumRank.includes('4') || spectrumRank.toLowerCase().includes('r&d') || spectrumRank.toLowerCase().includes('horizon')) return SPECTRUM_CONFIG['4'];
  if (spectrumRank.includes('5') || spectrumRank.toLowerCase().includes('macro') || spectrumRank.toLowerCase().includes('threat')) return SPECTRUM_CONFIG['5'];
  if (spectrumRank.includes('6') || spectrumRank.toLowerCase().includes('black') || spectrumRank.toLowerCase().includes('swan')) return SPECTRUM_CONFIG['6'];
  return SPECTRUM_CONFIG['1'];
}

function getSpectrumKey(spectrumRank?: string): string {
  if (!spectrumRank) return '1';
  if (spectrumRank.includes('1') || spectrumRank.toLowerCase().includes('bleeding')) return '1';
  if (spectrumRank.includes('2') || spectrumRank.toLowerCase().includes('institutional')) return '2';
  if (spectrumRank.includes('3') || spectrumRank.toLowerCase().includes('grassroots')) return '3';
  if (spectrumRank.includes('4') || spectrumRank.toLowerCase().includes('r&d') || spectrumRank.toLowerCase().includes('horizon')) return '4';
  if (spectrumRank.includes('5') || spectrumRank.toLowerCase().includes('macro') || spectrumRank.toLowerCase().includes('threat')) return '5';
  if (spectrumRank.includes('6') || spectrumRank.toLowerCase().includes('black') || spectrumRank.toLowerCase().includes('swan')) return '6';
  return '1';
}

const RANK_DETAILS = [
  { rank: '1', name: 'The Bleeding Neck', tag: 'Immediate Crisis', color: '#3b82f6', emoji: '🔵', desc: 'Urgent pain points, shortages, and price shocks needing immediate solutions today.' },
  { rank: '2', name: 'Institutional Pivot', tag: 'Big Player Moves', color: '#f59e0b', emoji: '🟡', desc: 'Corporate capital allocation, government policies, and major industry shifts.' },
  { rank: '3', name: 'The Grassroots Hack', tag: 'Operator Hacks', color: '#f59e0b', emoji: '🟡', desc: 'Practical survival tactics and informal workarounds used on the ground by local traders.' },
  { rank: '4', name: 'The R&D Horizon', tag: 'Yield & Tech Science', color: '#10b981', emoji: '🟢', desc: 'Biological innovations, agronomy breakthroughs, and high-efficiency processing tech.' },
  { rank: '5', name: 'The Macro Threat', tag: 'Systemic Risks', color: '#10b981', emoji: '🟢', desc: 'Cross-border currency dynamics, regional tariffs, and global climate shifts.' },
  { rank: '6', name: 'The Black Swan', tag: 'Wildcards & Ruptures', color: '#a855f7', emoji: '🟣', desc: 'Unforeseen outlier events and radical industry flips that rewrite the rules.' },
];

const FORMAT_DETAILS = [
  { format: 'Brief', emoji: '📑', color: '#3b82f6', desc: 'Market breakdown: What is breaking or working, and why.' },
  { format: 'Memo', emoji: '💼', color: '#10b981', desc: 'Investment focus: Deal-flow, unit economics, TAM, and capital returns.' },
  { format: 'Playbook', emoji: '🛠️', color: '#f59e0b', desc: 'Step-by-step operator guide: Tactical SOPs and survival blueprints.' },
  { format: 'Comparison', emoji: '⚖️', color: '#8b5cf6', desc: 'Head-to-head benchmark: Comparing regions, tools, or business models.' },
  { format: 'Culture', emoji: '🌾', color: '#ec4899', desc: 'Human side: Demographics, trader stories, and labor sociology.' },
];

const ERA_DETAILS = [
  { era: 'Past', emoji: '⏳', color: '#ef4444', desc: 'Historical lessons and root causes from prior cycles.' },
  { era: 'Present', emoji: '⚡', color: '#10b981', desc: 'Real-time dynamics: What is happening on the ground right now.' },
  { era: 'Future', emoji: '🔮', color: '#3b82f6', desc: 'Forward-looking roadmap: Projections, 2030 forecasts, and next trends.' },
];

export default function CreatorStudioDashboard({
  drafts = [],
  workspaceTabs = [],
  onStartFresh,
  onEditDraft,
  onDeleteDraft,
  challengesData = [],
  userName,
  userSpendableNP = 0,
  firebaseUid,
}: {
  drafts?: any[];
  workspaceTabs?: any[];
  onStartFresh: (type: string, taxonomy: any, initialDraftData?: any) => void;
  onEditDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  challengesData: any[];
  userName?: string;
  userSpendableNP?: number;
  firebaseUid?: string;
}) {
  const [expandedStartType, setExpandedStartType] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════
  // EDITORIAL MATRIX 3-STEP WIZARD STATE (FOR ARTICLES)
  // ═══════════════════════════════════════════════════════════
  const currentDate = new Date();
  const currentWeek = getISOWeek(currentDate);
  const currentYear = getYear(currentDate);

  const [matrixStep, setMatrixStep] = useState<1 | 2 | 3>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedCommodity, setSelectedCommodity] = useState<string>(() => {
    const idx = (currentWeek - 1) % commoditiesList.length;
    return commoditiesList[idx];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('land');
  const [selectedTargetDate, setSelectedTargetDate] = useState<string>(() => currentDate.toISOString());
  const [focusedDayIdx, setFocusedDayIdx] = useState<number>(0);
  
  // Step 3 Insights State
  const [insights, setInsights] = useState<ArticleInsightItem[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [spectrumFilter, setSpectrumFilter] = useState<string>('all');
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [hasLaunchedAssistant, setHasLaunchedAssistant] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [collapsedRanks, setCollapsedRanks] = useState<Record<string, boolean>>({});

  const toggleRankCollapse = useCallback((rankKey: string) => {
    setCollapsedRanks(prev => ({ ...prev, [rankKey]: !prev[rankKey] }));
  }, []);

  const insightsByRank = useMemo(() => {
    const groups: Record<string, ArticleInsightItem[]> = {
      '1': [],
      '2': [],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
    };
    insights.forEach(item => {
      const key = getSpectrumKey(item.spectrumRank);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [insights]);

  // Step 3 Prompts & Interactive Relay Terminal State
  const [rawPrompts, setRawPrompts] = useState<{
    doc1aPrompt: string;
    doc1aOutput: string;
    doc1bPrompt: string;
    doc1bOutput: string;
    doc1cPrompt: string;
    doc1cOutput: string;
  } | null>(null);

  const { openAssistant, registerIngestHandler } = usePromptAssistant();

  // Register ingest handler to sync parsed articles into Creator Studio cards
  useEffect(() => {
    return registerIngestHandler((newBriefs) => {
      if (newBriefs && newBriefs.length > 0) {
        setInsights(newBriefs);
      }
    });
  }, [registerIngestHandler]);

  // Hydrate insights from localStorage if previously ingested while on another page or step
  useEffect(() => {
    if (matrixStep === 3 && selectedCommodity && selectedCategory && insights.length === 0) {
      if (typeof window !== 'undefined') {
        const key = `editorial_ingested_briefs_${selectedCommodity}_${selectedCategory}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setInsights(parsed);
            }
          } catch {}
        }
      }
    }
  }, [matrixStep, selectedCommodity, selectedCategory, insights.length]);

  // Non-article legacy wizard state
  const [legacyCategory, setLegacyCategory] = useState('');
  const [legacySubcategory, setLegacySubcategory] = useState('');

  // Fast Ingest State
  const [fastPayloadText, setFastPayloadText] = useState('');
  const [fastIngestError, setFastIngestError] = useState('');

  const activeOption = START_FRESH_OPTIONS.find(o => o.type === expandedStartType);

  // ═══════════════════════════════════════════════════════════
  // LIVESTREAM 3-STEP WIZARD STATE
  // ═══════════════════════════════════════════════════════════
  const [lsStep, setLsStep] = useState<1 | 2 | 3>(1);
  const [lsEngine, setLsEngine] = useState<'the_breakdown' | 'the_masterclass' | 'the_opportunity_desk' | null>(null);
  const [lsAnchorArticleId, setLsAnchorArticleId] = useState<string | null>(null);
  const [lsAnchorJobIds, setLsAnchorJobIds] = useState<string[]>([]);
  
  // Real DB state
  const [lsArticles, setLsArticles] = useState<any[]>([]);
  const [lsJobs, setLsJobs] = useState<any[]>([]);
  const [lsLoadingDB, setLsLoadingDB] = useState(false);

  useEffect(() => {
    if (expandedStartType === 'livestream' && lsEngine) {
      setLsLoadingDB(true);
      Promise.all([
        fetchGlobalLivestreamArticles(lsEngine),
        fetchGlobalJobs()
      ]).then(([articles, jobs]) => {
        setLsArticles(articles);
        setLsJobs(jobs);
        setLsLoadingDB(false);
      }).catch(err => {
        console.error('Failed to fetch livestream data:', err);
        setLsLoadingDB(false);
      });
    }
  }, [expandedStartType, lsEngine]);

  // ───────────────────────────────────────────────────────────
  // FETCH INSIGHTS FOR STEP 3
  // ───────────────────────────────────────────────────────────
  const fetchInsightsForMatrixSlot = useCallback(async (dateStr: string) => {
    setLoadingInsights(true);
    setRegenerateError(null);
    try {
      const res = await getDailyEditorialIntel(dateStr);
      if (res && res.insights && res.insights.length > 0) {
        setInsights(res.insights);
      } else {
        setInsights([]);
      }
      if (res?.prompts) {
        setRawPrompts(res.prompts);
      }
      if (!res?.success && res?.error) {
        setRegenerateError(res.error);
      }
    } catch (e: any) {
      console.error('Failed to fetch daily editorial intel', e);
      setRegenerateError(e?.message || 'Error connecting to editorial intelligence service.');
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  const handleOpenCreator = (type: string) => {
    setExpandedStartType(type);
    if (type === 'livestream') {
      setLsStep(1);
      setLsEngine(null);
      setLsAnchorArticleId(null);
      setLsAnchorJobIds([]);
    } else {
      setMatrixStep(1);
      setSelectedWeek(currentWeek);
      setSelectedYear(currentYear);
      const idx = (currentWeek - 1) % commoditiesList.length;
      setSelectedCommodity(commoditiesList[idx]);
    }
    setLegacyCategory('');
    setLegacySubcategory('');
  };

  const handleClose = () => {
    setExpandedStartType(null);
    setMatrixStep(1);
    setLsStep(1);
    setLegacyCategory('');
    setLegacySubcategory('');
  };

  const handleSelectCommodityAndWeek = (week: number, commodity: string) => {
    setSelectedWeek(week);
    setSelectedCommodity(commodity);
    setFocusedDayIdx(0);
    setMatrixStep(2);
  };

  const handleSelectDayCategory = (catId: string, dayDate: Date) => {
    setSelectedCategory(catId);
    const isoDate = dayDate.toISOString();
    setSelectedTargetDate(isoDate);
    setMatrixStep(3);
    fetchInsightsForMatrixSlot(isoDate);
  };

  const resolveInsightSubcategory = (item: ArticleInsightItem) => {
    if (item.subcategoryId && item.subcategoryId.trim()) {
      return item.subcategoryId.trim();
    }
    if (item.subcategoryTitle && item.subcategoryTitle.trim()) {
      return item.subcategoryTitle.trim();
    }
    // Fallback: match against challenge subcategories if item title/hook mentions one
    const currentCat = (challengesData || []).find((c: any) => c.id === selectedCategory);
    if (currentCat?.subcategories && currentCat.subcategories.length > 0) {
      const match = currentCat.subcategories.find((s: any) => {
        const cleanSub = (s.title || '').toLowerCase().replace(/\s*\(.*?\)\s*$/, '').trim();
        const cleanTitle = (item.title || '').toLowerCase();
        const cleanHook = (item.hook || '').toLowerCase();
        return (cleanSub.length > 3 && (cleanTitle.includes(cleanSub) || cleanHook.includes(cleanSub)));
      });
      if (match) return match.id || match.title;
      return currentCat.subcategories[0]?.id || currentCat.subcategories[0]?.title || '';
    }
    return '';
  };

  const handleSelectInsight = (item: ArticleInsightItem) => {
    const resolvedSub = resolveInsightSubcategory(item);

    onStartFresh('article', {
      commodity: selectedCommodity,
      category: selectedCategory,
      subcategory: resolvedSub,
      format: item.format,
      timeframe: item.era,
      targetDate: selectedTargetDate,
      title: item.title,
      description: item.hook,
    }, {
      title: item.title,
      description: item.hook,
      category: selectedCategory,
      subcategory: resolvedSub,
      format: item.format,
      timeframe: item.era,
      targetDate: selectedTargetDate,
      commodity: selectedCommodity,
    });
  };

  const handleStartCustomArticle = () => {
    onStartFresh('article', {
      commodity: selectedCommodity,
      category: selectedCategory,
      subcategory: '',
      format: 'brief',
      timeframe: 'present',
      targetDate: selectedTargetDate,
      title: '',
      description: '',
    }, {
      title: '',
      description: '',
      category: selectedCategory,
      subcategory: '',
      format: 'brief',
      timeframe: 'present',
      targetDate: selectedTargetDate,
      commodity: selectedCommodity,
    });
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setRegenerateError(null);
    try {
      const res = await regenerateCustomAnglesAction({
        commodity: selectedCommodity,
        category: selectedCategory,
        date: selectedTargetDate,
        firebaseUid,
      });

      if (res.success && res.insights) {
        setInsights(res.insights);
        if (res.prompts) {
          setRawPrompts(res.prompts);
        }
      } else {
        setRegenerateError(res.error || 'Failed to regenerate angles.');
      }
    } catch (e: any) {
      setRegenerateError(e.message || 'Error connecting to regeneration service.');
    } finally {
      setRegenerating(false);
    }
  };

  // Generate 7 days for the selected week
  const weekStart = startOfISOWeek(new Date(selectedYear, 0, 4 + (selectedWeek - 1) * 7));
  const weekDays = [1, 2, 3, 4, 5, 6, 0].map((dayIdx, offset) => {
    const dayDate = addDays(weekStart, offset);
    const catKey = CATEGORY_MAP[dayIdx] || 'land';
    const challenge = challengesData.find(c => c.id === catKey) || {
      id: catKey,
      title: catKey.charAt(0).toUpperCase() + catKey.slice(1),
      imageUrl: '/images/challenges/land.webp'
    };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      dayOfWeek: dayIdx,
      dayName: dayNames[dayIdx],
      date: dayDate,
      dateFormatted: format(dayDate, 'MMM d, yyyy'),
      category: catKey,
      challenge,
    };
  });

  // Auto-scroll Step 2 active day into center view
  useEffect(() => {
    if (matrixStep === 2) {
      const todayFormatted = format(currentDate, 'yyyy-MM-dd');
      const todayIdx = weekDays.findIndex(d => format(d.date, 'yyyy-MM-dd') === todayFormatted);
      const targetIdx = todayIdx !== -1 ? todayIdx : 0;
      setFocusedDayIdx(targetIdx);

      const timer = setTimeout(() => {
        const activeEl = document.getElementById(`step2-day-${targetIdx}`);
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [matrixStep, selectedWeek, selectedYear]);

  const handleFastIngest = () => {
    setFastIngestError('');
    if (!fastPayloadText.trim()) return;
    try {
      const parsed = JSON.parse(fastPayloadText);
      if (!parsed || typeof parsed !== 'object') throw new Error("Payload must be a JSON object.");
      
      const type = parsed.type || 'article';
      const category = parsed.category || '';
      const subcategory = parsed.subcategory || '';
      const timeframe = parsed.timeframe || '';
      
      delete parsed.authorName;
      delete parsed.authorAvatarUrl;
      delete parsed.authorId;

      (onStartFresh as any)(type, { category, subcategory, timeframe }, parsed);
    } catch (e: any) {
      setFastIngestError(e.message || "Invalid JSON payload.");
    }
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Morning' : currentHour < 18 ? 'Afternoon' : 'Evening';

  return (
    <Box sx={{
      p: { xs: 1.5, sm: 3, md: 5, lg: 8 }, mx: 'auto', width: '100%', flex: 1, overflowY: 'auto',
      background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%)',
    }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap');`}
      </style>
      
      {/* Greeting */}
      <Box sx={{ mb: { xs: 2.5, sm: 4, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h3" sx={{ fontFamily: 'Caveat, cursive', color: ACCENT, mb: 0.5, fontSize: { xs: '1.4rem', sm: '2.5rem', md: '3rem' } }}>
          Good {greeting}, {userName || 'Creator'}.
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 1.5, color: '#1e293b', fontSize: { xs: '1.1rem', sm: '1.75rem', md: '2.125rem' } }}>
          Welcome to the Studio
        </Typography>
        <Chip
          label={`${drafts.length} active draft${drafts.length !== 1 ? 's' : ''} in your workspace`}
          size="small"
          sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: 'text.secondary', fontWeight: 600, borderRadius: '8px' }}
        />
      </Box>

      {/* FAST INGEST SECTION */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: ACCENT }} /> Fast Ingest
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', bgcolor: '#0f172a',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
              payload.json
            </Typography>
            <Tooltip title="Paste JSON payload">
              <IconButton 
                size="small" 
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    setFastPayloadText(text);
                    setFastIngestError('');
                  } catch (err) {}
                }}
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}
              >
                <ContentPasteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <textarea
            placeholder='Paste article JSON payload...'
            value={fastPayloadText}
            onChange={(e) => { setFastPayloadText(e.target.value); setFastIngestError(''); }}
            style={{
              width: '100%', minHeight: '80px', maxHeight: '200px', backgroundColor: 'transparent',
              color: '#e2e8f0', border: 'none', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none'
            }}
          />
          {fastPayloadText.trim() && (
            <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>{fastIngestError}</Typography>
              <Button onClick={handleFastIngest} variant="contained" size="small" sx={{ bgcolor: ACCENT, color: '#fff', fontWeight: 700, borderRadius: '8px' }}>
                Ingest Payload
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* ================================================================ */}
      {/* START FRESH CARDS                                                */}
      {/* ================================================================ */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
        Start Fresh
      </Typography>

      <Box sx={{
        display: 'flex',
        flexDirection: expandedStartType ? 'column' : 'row',
        flexWrap: expandedStartType ? 'nowrap' : 'wrap',
        gap: { xs: 2, sm: 3 },
        width: '100%',
        mb: 6
      }}>
        {(expandedStartType ? START_FRESH_OPTIONS.filter(o => o.type === expandedStartType) : START_FRESH_OPTIONS).map((opt) => {
          const isExpanded = expandedStartType === opt.type;
          const isActive = true;

          return (
            <Paper
              key={opt.type}
              elevation={0}
              onClick={() => {
                if (opt.readiness === 'coming_soon') return;
                
                if (!expandedStartType) {
                  handleOpenCreator(opt.type);
                }
              }}
              sx={{
                flex: isExpanded ? '1 1 100%' : '1 1 calc(25% - 24px)',
                minWidth: isExpanded ? '100%' : { xs: 140, sm: 220 },
                maxWidth: isExpanded ? '100%' : { xs: 140, sm: 280 },
                height: isExpanded ? 'auto' : { xs: 160, sm: 260 },
                opacity: opt.readiness === 'live' ? 1 : 0.65,
                p: isExpanded ? 0 : { xs: 1.5, sm: 2.5, md: 3 },
                display: 'flex', flexDirection: 'column',
                borderRadius: { xs: '16px', sm: '24px' }, 
                cursor: isExpanded ? 'default' : (opt.readiness === 'live' ? 'pointer' : 'not-allowed'),
                background: isExpanded ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` : opt.grad,
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: `0 10px 30px ${alpha(opt.color, 0.2)}`,
                position: 'relative', overflow: isExpanded ? 'visible' : 'hidden',
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': !isExpanded && opt.readiness === 'live' ? {
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: `0 20px 40px ${alpha(opt.color, 0.35)}`,
                } : {}
              }}
            >
              {!isExpanded ? (
                <>
                  <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.12, transform: 'scale(4)', pointerEvents: 'none', color: '#fff' }}>
                    {opt.icon}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                      {opt.icon}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      {opt.readiness === 'coming_soon' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0,0,0,0.2)', px: 1, py: 0.25, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>COMING SOON</Typography>
                        </Box>
                      )}
                      <WikiHotspot id={`learn-start-fresh-${opt.type}`} label={opt.title} />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 'auto', zIndex: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.9rem', sm: '1.15rem' }, color: '#fff', mb: 0.5 }}>
                      {opt.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                      {opt.desc}
                    </Typography>
                  </Box>
                </>
              ) : (
                /* ============================================================== */
                /* EXPANDED 3-STEP WIZARD                                         */
                /* ============================================================== */
                <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 }, width: '100%', position: 'relative' }}>
                  
                  {opt.type === 'livestream' ? (
                    // ───────────────────────────────────────────────────────────
                    // LIVESTREAM 3-STEP WIZARD
                    // ───────────────────────────────────────────────────────────
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                              {opt.icon}
                            </Box>
                            <Box>
                              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Livestream Broadcast Studio
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mt: 0.2 }}>
                                {lsStep === 1 && "1. Select Community Engine"}
                                {lsStep === 2 && "2. Anchor Your Article"}
                                {lsStep === 3 && "3. Anchor Jobs & Finalize"}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                              {[1, 2, 3].map(stepNum => (
                                <Box
                                  key={stepNum}
                                  onClick={() => stepNum < lsStep && setLsStep(stepNum as any)}
                                  sx={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: lsStep === stepNum ? '#10b981' : lsStep > stepNum ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)',
                                    color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                                    cursor: stepNum < lsStep ? 'pointer' : 'default',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {stepNum}
                                </Box>
                              ))}
                            </Box>
                            <Button onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ minWidth: 0, p: 1, borderRadius: '12px', color: 'rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' } }}>✕</Button>
                          </Box>
                       </Box>

                       {lsStep === 1 && (
                         <Box>
                           <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, mb: 3 }}>
                             Select the strategic engine for your broadcast. This will smart-filter the available articles.
                           </Typography>
                           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                             {[
                               { id: 'the_breakdown', icon: '📊', title: 'The Breakdown', desc: 'Edutainment & Storytelling', tags: ['Culture', 'Autopsies', 'Benchmarks'] },
                               { id: 'the_masterclass', icon: '🧠', title: 'The Masterclass', desc: 'Tactical Upskilling', tags: ['Playbooks', 'Foresight Briefs'] },
                               { id: 'the_opportunity_desk', icon: '💼', title: 'The Opportunity Desk', desc: 'Money & Execution', tags: ['Battlefield Reports', 'Memos'] },
                             ].map(engine => (
                               <Paper
                                 key={engine.id}
                                 onClick={() => { setLsEngine(engine.id as any); setLsStep(2); }}
                                 sx={{
                                   p: 3, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                   cursor: 'pointer', transition: 'all 0.2s',
                                   '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', transform: 'translateY(-4px)', borderColor: 'rgba(255,255,255,0.3)' }
                                 }}
                               >
                                 <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>{engine.icon}</Typography>
                                 <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', mb: 0.5 }}>{engine.title}</Typography>
                                 <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontSize: '0.85rem', mb: 2 }}>{engine.desc}</Typography>
                                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                   {engine.tags.map(t => (
                                     <Chip key={t} label={t} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontWeight: 700 }} />
                                   ))}
                                 </Box>
                               </Paper>
                             ))}
                           </Box>
                         </Box>
                       )}

                       {lsStep === 2 && (
                         <Box sx={{ minHeight: 300 }}>
                           <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, mb: 3 }}>
                             Select the Anchor Article. We've filtered the global database to only show formats compatible with <strong style={{ color: '#fff' }}>{lsEngine}</strong>.
                           </Typography>
                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                             {/* GLOBAL ARTICLES FROM DB */}
                             {lsLoadingDB ? (
                               <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress size={32} sx={{ color: '#10b981' }} /></Box>
                             ) : lsArticles.length === 0 ? (
                               <Typography sx={{ color: 'rgba(255,255,255,0.5)', py: 2 }}>No suitable articles found for this engine in the database.</Typography>
                             ) : lsArticles.map((art) => (
                               <Paper key={art.id} onClick={() => { setLsAnchorArticleId(art.id); setLsStep(3); }} sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <Box>
                                   <Typography sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>{art.title}</Typography>
                                   <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Anchoring research by {art.authorName || 'FoodNerve Intelligence'}</Typography>
                                 </Box>
                                 <Chip label={art.subcategory || 'Article'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, textTransform: 'capitalize' }} />
                               </Paper>
                             ))}
                           </Box>
                         </Box>
                       )}

                       {lsStep === 3 && (
                         <Box sx={{ minHeight: 300 }}>
                           <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', mb: 1 }}>Attach Anchor Jobs (Optional)</Typography>
                           <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', mb: 3 }}>
                             Select open roles to display during your broadcast. Essential for the Talent Liquidity engine.
                           </Typography>
                           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
                             {lsLoadingDB ? (
                               <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', gridColumn: '1 / -1' }}><CircularProgress size={32} sx={{ color: '#10b981' }} /></Box>
                             ) : lsJobs.length === 0 ? (
                               <Typography sx={{ color: 'rgba(255,255,255,0.5)', gridColumn: '1 / -1' }}>No active jobs found in the global talent exchange.</Typography>
                             ) : lsJobs.map(job => (
                               <Paper 
                                 key={job.id} 
                                 onClick={() => setLsAnchorJobIds(prev => prev.includes(job.id) ? prev.filter(x => x !== job.id) : [...prev, job.id])} 
                                 sx={{ p: 2, bgcolor: lsAnchorJobIds.includes(job.id) ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: lsAnchorJobIds.includes(job.id) ? '#10b981' : 'rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: '12px', '&:hover': { bgcolor: lsAnchorJobIds.includes(job.id) ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)' } }}
                               >
                                 <Typography sx={{ color: '#fff', fontWeight: 700 }}>{job.title}</Typography>
                                 <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{job.organization?.name || 'Company'}</Typography>
                               </Paper>
                             ))}
                           </Box>
                           <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                             <Button
                               variant="contained"
                               onClick={() => onStartFresh('livestream', { lsEngine, lsAnchorArticleId, lsAnchorJobIds })}
                               sx={{ bgcolor: '#fff', color: '#000', fontWeight: 800, py: 1.5, px: 4, borderRadius: '12px', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                             >
                               Generate Studio & Rundown
                             </Button>
                           </Box>
                         </Box>
                       )}
                    </Box>
                  ) : (
                    // ───────────────────────────────────────────────────────────
                    // ARTICLE 3-STEP WIZARD
                    // ───────────────────────────────────────────────────────────
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Container Header & Minimize Button (TradeListingStudio style) */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 1, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                          {matrixStep > 1 && (
                            <IconButton
                              onClick={() => setMatrixStep((matrixStep - 1) as any)}
                              size="small"
                              sx={{
                                color: '#fff',
                                bgcolor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' }
                              }}
                            >
                              <ArrowBackIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                          <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            {opt.icon}
                          </Box>
                          <Box>
                            {matrixStep === 3 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.75rem', sm: '0.85rem' }, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  🔥 Trending Titles for
                                </Typography>
                                <Box component="span" sx={{ color: ACCENT, fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.9rem' }, px: 1, py: 0.2, bgcolor: alpha(ACCENT, 0.12), borderRadius: '8px', border: `1px solid ${alpha(ACCENT, 0.3)}`, lineHeight: 1.2 }}>
                                  {selectedCommodity}
                                </Box>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: 'rgba(255,255,255,0.06)', px: 1.2, py: 0.25, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                  <Typography sx={{ color: '#93c5fd', fontSize: { xs: '0.75rem', sm: '0.82rem' }, fontWeight: 800 }}>
                                    {challengesData.find(c => c.id === selectedCategory)?.title || selectedCategory}
                                  </Typography>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>•</Typography>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.75rem', sm: '0.82rem' }, fontWeight: 700 }}>
                                    {weekDays.find(d => d.category === selectedCategory)?.dayName || 'Day'}, {format(new Date(selectedTargetDate), 'MMM d')}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.75rem', sm: '0.85rem' }, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                {opt.title} Setup {matrixStep > 1 && `· Week ${selectedWeek}: ${selectedCommodity}`}
                              </Typography>
                            )}
                            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                              {matrixStep === 1 ? "Ready to create?" : matrixStep === 2 ? "Select Daily Strategic Pillar" : "Pick one to write on"}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {matrixStep === 3 && (
                            <Tooltip title="Refresh Trending Angles (50 NP)">
                              <IconButton 
                                onClick={() => setIsRegenerateModalOpen(true)}
                                disabled={regenerating || loadingInsights}
                                sx={{
                                  color: ACCENT,
                                  bgcolor: 'rgba(245, 158, 11, 0.1)',
                                  border: `1px solid ${alpha(ACCENT, 0.25)}`,
                                  borderRadius: '12px',
                                  p: 1.1,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: 'rgba(245, 158, 11, 0.2)',
                                    transform: 'rotate(180deg)',
                                    borderColor: ACCENT,
                                  }
                                }}
                              >
                                {regenerating ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon sx={{ fontSize: 18 }} />}
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Minimize">
                            <IconButton
                              onClick={(e) => { e.stopPropagation(); handleClose(); }}
                              sx={{ color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(0,0,0,0.3)', color: '#fff' } }}
                            >
                              <MinimizeIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 1: COMMODITY & WEEK SELECTION (BENTO GRID VIEW)         */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 1 && (
                    <Box sx={{ animation: `${slideUpFade} 0.3s ease` }}>
                      {/* Bento Grid: Prominent Hero Tile for Active Week + Upcoming Tiles */}
                      <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 2,
                        height: 'auto',
                        overflow: 'visible',
                        py: 1,
                        px: 0.5,
                        pb: 2,
                      }}>
                        {(() => {
                          const activeIdx = (currentWeek - 1) % commoditiesList.length;
                          const activeComm = commoditiesList[activeIdx];
                          const activeMeta = getCommodityMeta(activeComm);
                          const activeStart = startOfISOWeek(new Date(selectedYear, 0, 4 + (currentWeek - 1) * 7));
                          const activeEnd = addDays(activeStart, 6);
                          const activeDateStr = `${format(activeStart, 'MMM d')} – ${format(activeEnd, 'MMM d')}`;

                          // All upcoming commodities sorted chronologically
                          const upcomingList = commoditiesList.map((comm, idx) => {
                            let offset = idx - activeIdx;
                            if (offset <= 0) offset += commoditiesList.length;
                            const targetWeek = currentWeek + offset;
                            const wStart = startOfISOWeek(new Date(selectedYear, 0, 4 + (targetWeek - 1) * 7));
                            const wEnd = addDays(wStart, 6);
                            const dateRangeStr = `${format(wStart, 'MMM d')} – ${format(wEnd, 'MMM d')}`;
                            const meta = getCommodityMeta(comm);
                            return { comm, targetWeek, dateRangeStr, meta, offset };
                          }).sort((a, b) => a.offset - b.offset);

                          return (
                            <>
                              {/* ── BENTO HERO TILE: DISTINCT ACTIVE WEEK CARD ── */}
                              <Paper
                                elevation={0}
                                onClick={() => handleSelectCommodityAndWeek(currentWeek, activeComm)}
                                sx={{
                                  gridColumn: { xs: '1 / -1', md: 'span 2' },
                                  minHeight: { xs: 200, md: 220 },
                                  borderRadius: '24px',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  border: '2px solid #3b82f6',
                                  boxShadow: '0 0 35px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                  transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  p: { xs: 2.5, sm: 3 },
                                  '&:hover': {
                                    transform: 'translateY(-4px) scale(1.01)',
                                    borderColor: '#60a5fa',
                                    boxShadow: '0 16px 40px rgba(59, 130, 246, 0.5)',
                                    '& .hero-bg': { transform: 'scale(1.08)' }
                                  }
                                }}
                              >
                                {/* Background Image */}
                                <Box
                                  className="hero-bg"
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundImage: `url(${activeMeta.imageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    transition: 'transform 0.6s ease',
                                    zIndex: 0,
                                  }}
                                />

                                {/* Dark Gradient Vignette */}
                                <Box sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.85) 100%)',
                                  zIndex: 1,
                                }} />

                                {/* Top Badges */}
                                <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={`⚡ ACTIVE WEEK ${currentWeek}`}
                                      size="small"
                                      sx={{
                                        bgcolor: '#3b82f6',
                                        color: '#fff',
                                        fontWeight: 900,
                                        fontSize: '0.72rem',
                                        height: 24,
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)'
                                      }}
                                    />
                                    <Chip
                                      label="LIVE FOCUS"
                                      size="small"
                                      sx={{
                                        bgcolor: 'rgba(59, 130, 246, 0.2)',
                                        color: '#93c5fd',
                                        fontWeight: 800,
                                        fontSize: '0.68rem',
                                        height: 24,
                                        border: '1px solid rgba(59, 130, 246, 0.4)'
                                      }}
                                    />
                                  </Box>
                                  <Typography sx={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {activeDateStr}
                                  </Typography>
                                </Box>

                                {/* Bottom Title & Trigger */}
                                <Box sx={{ position: 'relative', zIndex: 2, mt: 'auto', pt: 2 }}>
                                  <Typography variant="h4" sx={{
                                    color: '#fff',
                                    fontWeight: 900,
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.15,
                                    fontSize: { xs: '1.35rem', sm: '1.65rem' },
                                    textShadow: '0 4px 14px rgba(0,0,0,0.7)'
                                  }}>
                                    {activeComm}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#93c5fd', fontWeight: 800, fontSize: '0.82rem', mt: 0.75 }}>
                                    Select Active Cycle <ArrowForwardArrow sx={{ fontSize: 15 }} />
                                  </Box>
                                </Box>
                              </Paper>

                              {/* ── BENTO UPCOMING TILES ── */}
                              {upcomingList.map((item) => (
                                <Paper
                                  key={`${item.comm}-${item.targetWeek}`}
                                  elevation={0}
                                  onClick={() => handleSelectCommodityAndWeek(item.targetWeek, item.comm)}
                                  sx={{
                                    height: 160,
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    '&:hover': {
                                      transform: 'translateY(-3px) scale(1.02)',
                                      borderColor: 'rgba(255,255,255,0.35)',
                                      boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                                      '& .bento-bg': { transform: 'scale(1.08)' }
                                    }
                                  }}
                                >
                                  {/* Background Image */}
                                  <Box
                                    className="bento-bg"
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundImage: `url(${item.meta.imageUrl})`,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                      transition: 'transform 0.5s ease',
                                      zIndex: 0,
                                    }}
                                  />

                                  {/* Dark Vignette Overlay */}
                                  <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.35) 50%, rgba(0, 0, 0, 0.65) 100%)',
                                    zIndex: 1,
                                  }} />

                                  {/* Top Bar: Week + Date Range */}
                                  <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.02em' }}>
                                      Week {item.targetWeek}
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 600 }}>
                                      {item.dateRangeStr}
                                    </Typography>
                                  </Box>

                                  {/* Bottom: Commodity Title */}
                                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                                    <Typography sx={{
                                      color: '#fff',
                                      fontWeight: 900,
                                      fontSize: '0.95rem',
                                      lineHeight: 1.3,
                                      letterSpacing: '-0.01em',
                                      textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                                    }}>
                                      {item.comm}
                                    </Typography>
                                  </Box>
                                </Paper>
                              ))}
                            </>
                          );
                        })()}
                      </Box>
                    </Box>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 2: 7 DAILY STRATEGIC PILLARS (3D PERSPECTIVE STACK)     */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 2 && (
                    <Box sx={{ animation: `${slideUpFade} 0.3s ease` }}>
                      {/* 3D Perspective Stacking Accordion Container */}
                      <Box 
                        id="step2-scroll-container"
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                          perspective: '1200px',
                          py: 2,
                          px: 1,
                          pb: 3,
                          height: 'auto',
                          overflow: 'visible',
                        }}
                      >
                        <Box sx={{ height: 8, flexShrink: 0 }} />
                        {weekDays.map((item, idx) => {
                          const distance = Math.abs(idx - focusedDayIdx);
                          const isFocused = distance === 0;
                          const cardWidth = isFocused ? '100%' : `${Math.max(86, 100 - (distance * 3.5))}%`;
                          const tiltDirection = idx < focusedDayIdx ? -1 : 1;
                          const tiltDegree = isFocused ? 0 : distance * 2.5 * tiltDirection;
                          const isToday = format(item.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');

                          return (
                            <Paper
                              key={item.dayOfWeek}
                              id={`step2-day-${idx}`}
                              elevation={0}
                              onMouseEnter={() => setFocusedDayIdx(idx)}
                              onClick={() => handleSelectDayCategory(item.category, item.date)}
                              sx={{
                                width: cardWidth,
                                mx: 'auto',
                                borderRadius: '18px',
                                p: { xs: 2, sm: 2.25 },
                                bgcolor: isFocused
                                  ? 'rgba(59, 130, 246, 0.16)'
                                  : (isToday ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.03)'),
                                border: '1.5px solid',
                                borderColor: isFocused
                                  ? '#3b82f6'
                                  : (isToday ? 'rgba(245, 158, 11, 0.35)' : 'rgba(255,255,255,0.08)'),
                                boxShadow: isFocused ? '0 12px 30px rgba(59, 130, 246, 0.25)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                transform: isFocused ? 'scale(1.02)' : `rotateX(${tiltDegree}deg)`,
                                transformOrigin: 'center center',
                                zIndex: 10 - distance,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                '&:hover': {
                                  bgcolor: isFocused ? 'rgba(59, 130, 246, 0.22)' : 'rgba(255,255,255,0.07)',
                                  borderColor: '#60a5fa',
                                  transform: isFocused ? 'scale(1.02)' : `rotateX(${tiltDegree * 0.5}deg) translateY(-2px)`
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {/* Day Date Block */}
                                <Box sx={{
                                  width: 46,
                                  height: 46,
                                  borderRadius: '12px',
                                  bgcolor: isFocused ? '#3b82f6' : (isToday ? '#f59e0b' : 'rgba(255,255,255,0.08)'),
                                  color: '#fff',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  boxShadow: isFocused ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'
                                }}>
                                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>
                                    {item.dayName.slice(0, 3)}
                                  </Typography>
                                  <Typography sx={{ fontSize: '1rem', fontWeight: 900, lineHeight: 1.1, mt: 0.25 }}>
                                    {item.date.getDate()}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                                    <Typography sx={{ color: isFocused ? '#93c5fd' : 'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                      {item.category}
                                    </Typography>
                                    {isToday && (
                                      <Chip label="TODAY" size="small" sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#f59e0b', color: '#fff', fontWeight: 900 }} />
                                    )}
                                  </Box>
                                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1.05rem' }, lineHeight: 1.2 }}>
                                    {item.challenge.title}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                                <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                                  {item.dateFormatted}
                                </Typography>
                                <Box sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  color: isFocused ? '#93c5fd' : 'rgba(255,255,255,0.4)',
                                  fontSize: '0.8rem',
                                  fontWeight: 800
                                }}>
                                  <ArrowForwardArrow sx={{ fontSize: 16 }} />
                                </Box>
                              </Box>
                            </Paper>
                          );
                        })}
                        <Box sx={{ height: 16, flexShrink: 0 }} />
                      </Box>
                    </Box>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 3: 10–12 AI ARTICLE BRIEFING ANGLES                     */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 3 && (
                    <Box sx={{ animation: `${slideUpFade} 0.35s ease`, mt: 1 }}>
                      {/* LOADING STATE */}
                      {loadingInsights ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                          <CircularProgress size={36} sx={{ color: ACCENT, mb: 2 }} />
                          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
                            Loading Trending Editorial Angles...
                          </Typography>
                        </Box>
                      ) : insights.length === 0 ? (
                        /* FALLBACK STATE: Responsive card - side-by-side on desktop, stacked on mobile */
                        <Box sx={{ my: 4 }}>
                          <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 3.5, sm: 4.5 },
                            borderRadius: '32px',
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(24px)',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'center', md: 'stretch' },
                            textAlign: { xs: 'center', md: 'left' },
                            gap: { xs: 3, md: 4.5 },
                            my: 4,
                            maxWidth: { xs: 500, md: 740 },
                            mx: 'auto',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {/* Visual Column: Vertically Stacked Overlapping Squircles representing Commodity x Strategic Pillar */}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              flexShrink: 0,
                              py: 0.5,
                            }}
                          >
                            {/* Top Squircle: Commodity */}
                            <Box
                              sx={{
                                width: { xs: 104, sm: 118 },
                                height: { xs: 104, sm: 118 },
                                borderRadius: '28px',
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundImage: `url(${getCommodityMeta(selectedCommodity)?.imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '2.5px solid rgba(255,255,255,0.25)',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                                transform: 'rotate(-3deg)',
                                zIndex: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'rotate(0deg) scale(1.05)', zIndex: 3 },
                              }}
                            >
                              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.85) 100%)' }} />
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
                                color: ACCENT,
                                border: '2px solid rgba(255,255,255,0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 900,
                                zIndex: 2,
                                my: -2,
                                boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                              }}
                            >
                              ×
                            </Box>

                            {/* Bottom Squircle: Strategic Pillar */}
                            <Box
                              sx={{
                                width: { xs: 104, sm: 118 },
                                height: { xs: 104, sm: 118 },
                                borderRadius: '28px',
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundImage: `url(${challengesData.find(c => c.id === selectedCategory)?.imageUrl || '/images/challenges/insecurity.webp'}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '2.5px solid rgba(255,255,255,0.25)',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                                transform: 'rotate(3deg)',
                                zIndex: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'rotate(0deg) scale(1.05)', zIndex: 3 },
                              }}
                            >
                              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.85) 100%)' }} />
                              <Typography sx={{ position: 'absolute', bottom: 7, left: 4, right: 4, color: '#93c5fd', fontSize: '0.7rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                🛡️ {challengesData.find(c => c.id === selectedCategory)?.title?.split('&')[0]?.trim() || selectedCategory}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Content Section: Title, Description & Action Buttons with space-between layout */}
                          <Box
                            sx={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              alignItems: { xs: 'center', md: 'flex-start' },
                              gap: { xs: 2.5, md: 3 },
                              py: { xs: 0, md: 0.75 },
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
                                Get article ideas here
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem', lineHeight: 1.6, fontWeight: 400 }}>
                                Spend 1 minute to get fresh, realistic article ideas people want to read, or choose Ignore to write yourself.
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2, flexWrap: 'wrap' }}>
                              <Button
                                variant="contained"
                                onClick={() => {
                                  setHasLaunchedAssistant(true);
                                  openAssistant({
                                    commodity: selectedCommodity,
                                    category: selectedCategory,
                                    targetDate: selectedTargetDate,
                                    rawPrompts,
                                  });
                                }}
                                endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                                sx={{
                                  bgcolor: '#fff',
                                  color: '#000',
                                  fontWeight: 900,
                                  px: 3.5,
                                  py: 1.2,
                                  borderRadius: '14px',
                                  textTransform: 'none',
                                  fontSize: '0.9rem',
                                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    transform: 'translateY(-1px)',
                                  }
                                }}
                              >
                                Start (~1 min)
                              </Button>
                              <Button
                                variant="text"
                                onClick={handleStartCustomArticle}
                                sx={{
                                  color: 'rgba(255,255,255,0.6)',
                                  fontWeight: 700,
                                  px: 3,
                                  py: 1.2,
                                  borderRadius: '14px',
                                  textTransform: 'none',
                                  fontSize: '0.88rem',
                                  '&:hover': {
                                    color: '#fff',
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                  }
                                }}
                              >
                                Ignore
                              </Button>
                            </Box>
                          </Box>
                        </Paper>

                        {/* SUPPORTIVE ASSISTANT STATUS ALERT (Shows if assistant was launched but articles not yet ingested) */}
                        {hasLaunchedAssistant && insights.length === 0 && (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: '16px',
                              bgcolor: 'rgba(59, 130, 246, 0.08)',
                              border: '1px solid rgba(59, 130, 246, 0.25)',
                              maxWidth: { xs: 500, md: 740 },
                              mx: 'auto',
                              mt: 2.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              animation: `${slideUpFade} 0.3s ease`,
                            }}
                          >
                            <InfoOutlinedIcon sx={{ color: '#60a5fa', fontSize: 22, flexShrink: 0 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ color: '#bfdbfe', fontSize: '0.84rem', fontWeight: 600, lineHeight: 1.5 }}>
                                We haven't detected your ingested articles yet. Don't worry — your progress is saved in your browser, and you can resume anytime by clicking <strong>Start</strong> above.
                              </Typography>
                            </Box>
                          </Paper>
                        )}
                        </Box>
                      ) : (
                        /* NORMAL STATE: Swimlane Grid Grouped by Spectrum Rank + Editorial Framework Guide */
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          
                          {/* EDITORIAL FRAMEWORK & RANKS GUIDE (Collapsible) */}
                          <Box
                            sx={{
                              borderRadius: '20px',
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              backdropFilter: 'blur(16px)',
                              overflow: 'hidden',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <Box
                              onClick={() => setIsGuideOpen(!isGuideOpen)}
                              sx={{
                                p: { xs: 1.75, sm: 2 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                userSelect: 'none',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ p: 0.8, borderRadius: '10px', bgcolor: alpha(ACCENT, 0.15), color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <LightbulbIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                                    Editorial Guide: Ranks (1–6), Formats & Eras
                                  </Typography>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.76rem' }}>
                                    Learn how the 6 ranks, 5 article types, and 3 time eras shape your articles
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={isGuideOpen ? "Hide" : "Explore"}
                                  size="small"
                                  sx={{
                                    bgcolor: isGuideOpen ? 'rgba(255,255,255,0.1)' : alpha(ACCENT, 0.15),
                                    color: isGuideOpen ? '#fff' : ACCENT,
                                    fontWeight: 800,
                                    fontSize: '0.72rem',
                                    height: 24,
                                    cursor: 'pointer'
                                  }}
                                />
                                <ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.6)', transform: isGuideOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                              </Box>
                            </Box>

                            {/* Expanded Guide Content */}
                            {isGuideOpen && (
                              <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: 0, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {/* 1. The 6 Ranks */}
                                <Box sx={{ mt: 1.5 }}>
                                  <Typography sx={{ color: ACCENT, fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                                    🎯 6 Cognitive Spectrum Ranks (Why the order matters)
                                  </Typography>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1.25 }}>
                                    {RANK_DETAILS.map(r => (
                                      <Box key={r.rank} sx={{ p: 1.25, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: `1px solid ${alpha(r.color, 0.2)}` }}>
                                        <Typography sx={{ color: r.color, fontWeight: 800, fontSize: '0.82rem', mb: 0.25 }}>
                                          {r.emoji} Rank #{r.rank}: {r.name}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.74rem', lineHeight: 1.4 }}>
                                          {r.desc}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>

                                {/* 2. Formats & Eras side by side */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 2 }}>
                                  {/* Formats */}
                                  <Box>
                                    <Typography sx={{ color: '#60a5fa', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                                      📑 5 Article Types (Formats)
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                      {FORMAT_DETAILS.map(f => (
                                        <Box key={f.format} sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography sx={{ fontSize: '0.85rem' }}>{f.emoji}</Typography>
                                          <Box>
                                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.78rem' }}>{f.format}</Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>{f.desc}</Typography>
                                          </Box>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>

                                  {/* Eras */}
                                  <Box>
                                    <Typography sx={{ color: '#34d399', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                                      ⏳ 3 Time Eras
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                      {ERA_DETAILS.map(e => (
                                        <Box key={e.era} sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography sx={{ fontSize: '0.85rem' }}>{e.emoji}</Typography>
                                          <Box>
                                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.78rem' }}>{e.era}</Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>{e.desc}</Typography>
                                          </Box>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            )}
                          </Box>

                          {/* SWIMLANE GRID: Grouped by Spectrum Rank 1 to 6 */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {RANK_DETAILS.map((rMeta) => {
                              const rankItems = insightsByRank[rMeta.rank] || [];
                              if (rankItems.length === 0) return null;
                              const isCollapsed = !!collapsedRanks[rMeta.rank];

                              return (
                                <Box
                                  key={`rank-swimlane-${rMeta.rank}`}
                                  sx={{
                                    borderRadius: '22px',
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${alpha(rMeta.color, 0.2)}`,
                                    p: { xs: 1.75, sm: 2.25 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {/* Swimlane Header Dropdown */}
                                  <Box
                                    onClick={() => toggleRankCollapse(rMeta.rank)}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      cursor: 'pointer',
                                      userSelect: 'none',
                                      p: 0.75,
                                      borderRadius: '12px',
                                      '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ fontSize: '1.05rem' }}>{rMeta.emoji}</Typography>
                                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '0.92rem', sm: '1.02rem' } }}>
                                          Rank #{rMeta.rank}: {rMeta.name}
                                        </Typography>
                                      </Box>
                                      <Chip
                                        label={`${rankItems.length} ${rankItems.length === 1 ? 'idea' : 'ideas'}`}
                                        size="small"
                                        sx={{
                                          bgcolor: alpha(rMeta.color, 0.15),
                                          color: rMeta.color,
                                          fontWeight: 800,
                                          fontSize: '0.72rem',
                                          height: 22,
                                          border: `1px solid ${alpha(rMeta.color, 0.3)}`
                                        }}
                                      />
                                      <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', display: { xs: 'none', md: 'block' } }}>
                                        • {rMeta.tag}
                                      </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255,255,255,0.6)' }}>
                                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
                                        {isCollapsed ? 'Show' : 'Hide'}
                                      </Typography>
                                      <ExpandMoreIcon sx={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                    </Box>
                                  </Box>

                                  {/* Cards inside Swimlane */}
                                  {!isCollapsed && (
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                      {rankItems.map((item, idx) => {
                                        const fMeta = FORMAT_CONFIG[item.format] || FORMAT_CONFIG.brief;
                                        const eraMeta = ERA_CONFIG[item.era || 'present'] || ERA_CONFIG.present;

                                        return (
                                          <Paper
                                            key={item.id || `insight-${rMeta.rank}-${idx}`}
                                            elevation={0}
                                            onClick={() => handleSelectInsight(item)}
                                            sx={{
                                              p: 2.5,
                                              borderRadius: '18px',
                                              bgcolor: 'rgba(255,255,255,0.035)',
                                              border: '1px solid rgba(255,255,255,0.07)',
                                              backdropFilter: 'blur(16px)',
                                              cursor: 'pointer',
                                              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              justifyContent: 'space-between',
                                              gap: 1.5,
                                              position: 'relative',
                                              overflow: 'hidden',
                                              '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.07)',
                                                borderColor: alpha(rMeta.color, 0.5),
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 12px 28px rgba(0,0,0,0.25)`,
                                                '& .card-cta-bar': {
                                                  maxHeight: '40px',
                                                  opacity: 1,
                                                  mt: 1,
                                                  pt: 1,
                                                }
                                              }
                                            }}
                                          >
                                            <Box>
                                              {/* Top Pill Tags */}
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2, flexWrap: 'wrap' }}>
                                                <Chip
                                                  label={`${fMeta.emoji} ${fMeta.label}`}
                                                  size="small"
                                                  sx={{ bgcolor: alpha(fMeta.color, 0.15), color: fMeta.color, fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                                                />
                                                <Chip
                                                  label={`${eraMeta.emoji} ${eraMeta.label}`}
                                                  size="small"
                                                  sx={{ bgcolor: alpha(eraMeta.color, 0.15), color: eraMeta.color, fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                                                />
                                                {item.subcategoryTitle && (
                                                  <Chip
                                                    label={item.subcategoryTitle}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.68rem', height: 22 }}
                                                  />
                                                )}
                                              </Box>

                                              {/* Clean Authoritative Title */}
                                              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.02rem', lineHeight: 1.35, mb: 0.75, letterSpacing: '-0.015em' }}>
                                                {item.title}
                                              </Typography>

                                              {/* Brief ellipsis hook (clamped to 2 lines) */}
                                              <Typography
                                                sx={{
                                                  color: 'rgba(255,255,255,0.65)',
                                                  fontSize: '0.8rem',
                                                  lineHeight: 1.45,
                                                  fontWeight: 400,
                                                  display: '-webkit-box',
                                                  WebkitLineClamp: 2,
                                                  WebkitBoxOrient: 'vertical',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                }}
                                              >
                                                {item.hook || item.descriptionSentences?.[0] || `Strategic operational brief on ${selectedCommodity}.`}
                                              </Typography>
                                            </Box>

                                            {/* Start writing text - ONLY visible when interacted with / hovered */}
                                            <Box
                                              className="card-cta-bar"
                                              sx={{
                                                maxHeight: 0,
                                                opacity: 0,
                                                overflow: 'hidden',
                                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                transition: 'all 0.22s ease-in-out',
                                              }}
                                            >
                                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: rMeta.color, fontWeight: 800, fontSize: '0.78rem' }}>
                                                Start Writing <ArrowForwardIcon sx={{ fontSize: 13 }} />
                                              </Box>
                                            </Box>
                                          </Paper>
                                        );
                                      })}
                                    </Box>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>

                          {/* Prominent Bottom Center Button */}
                          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 2 }}>
                            <Button
                              variant="contained"
                              onClick={handleStartCustomArticle}
                              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.08)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(12px)',
                                fontWeight: 800,
                                fontSize: '0.88rem',
                                px: 3.5,
                                py: 1.2,
                                borderRadius: '14px',
                                textTransform: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: '#fff',
                                  color: '#000',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 24px rgba(255,255,255,0.2)',
                                }
                              }}
                            >
                              ✍️ Write your own title
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Paper>
      );
    })}
  </Box>

      {/* ================================================================ */}
      {/* WORKSPACE CONTENT MANAGER                                        */}
      {/* ================================================================ */}
      {!expandedStartType && (
        <Box sx={{ mt: 6 }}>
          <WorkspaceContentManager 
            tabs={workspaceTabs && workspaceTabs.length > 0 ? workspaceTabs : [
              {
                id: 'drafts',
                label: 'My Drafts',
                items: drafts.map((d: any) => ({
                  id: d.id,
                  title: d.title || 'Untitled Draft',
                  type: d.type || 'article',
                  status: d.status || 'draft',
                  date: d.updatedAt || d.createdAt || new Date().toISOString(),
                }))
              }
            ]}
            onEdit={(id) => onEditDraft(id)}
            onDelete={(id) => onDeleteDraft(id)}
          />
        </Box>
      )}

      {/* 50 NP REGENERATE CONFIRMATION MODAL */}
      <Dialog
        open={isRegenerateModalOpen}
        onClose={() => !regenerating && setIsRegenerateModalOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: '#0f172a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              p: 1.5,
              maxWidth: 440,
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.2rem', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: ACCENT }} /> Regenerate Fresh Angles
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5, mb: 2 }}>
            This will run the AI intelligence engine to generate 10 new, localized editorial angles for <strong>{selectedCommodity}</strong> ({selectedCategory}).
          </DialogContentText>
          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              Cost:
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: ACCENT, fontWeight: 900 }}>
              50 NP
            </Typography>
          </Box>
          <Box sx={{ mt: 1, px: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
              Your Balance:
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: userSpendableNP >= 50 ? '#10b981' : '#ef4444', fontWeight: 800 }}>
              {userSpendableNP} NP {userSpendableNP < 50 && '(Insufficient balance)'}
            </Typography>
          </Box>
          {regenerateError && (
            <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px' }}>
              {regenerateError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setIsRegenerateModalOpen(false)}
            disabled={regenerating}
            sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await handleRegenerate();
              if (!regenerateError) setIsRegenerateModalOpen(false);
            }}
            disabled={regenerating || userSpendableNP < 50}
            variant="contained"
            sx={{
              bgcolor: ACCENT,
              color: '#000',
              fontWeight: 900,
              borderRadius: '12px',
              px: 2.5,
              textTransform: 'none',
              '&:hover': { bgcolor: ACCENT_DARK, color: '#fff' }
            }}
          >
            {regenerating ? <CircularProgress size={16} color="inherit" /> : 'Confirm & Regenerate (50 NP)'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
