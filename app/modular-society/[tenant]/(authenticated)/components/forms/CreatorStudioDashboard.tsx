import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, IconButton, alpha, Tooltip, CircularProgress, Button,
  Drawer, TextField, Accordion, AccordionSummary, AccordionDetails, Breadcrumbs, Link,
  Alert, AlertTitle, Divider
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
<<<<<<< HEAD
import { FORMAT_CONFIG, ERA_CONFIG, ArticleFormat, ArticleEra, getBlueprint } from '@/lib/config/articleBlueprints';

=======
import { FORMAT_CONFIG, ERA_CONFIG, ArticleFormat, ArticleEra } from '@/lib/config/articleBlueprints';
import { fetchGlobalLivestreamArticles, fetchGlobalJobs } from '@/lib/actions/learn';
import { parseDoc1cArticles, buildDoc1aPrompt, buildDoc1bPrompt, buildDoc1cPrompt } from '@/lib/config/editorialPrompts';
import { foodChallenges } from '@/lib/cms/food/challenges';
>>>>>>> dev
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

  const handleSelectInsight = (item: ArticleInsightItem) => {
    const blueprint = getBlueprint(item.format, item.era);
    const initialBlocks = blueprint.map((b, idx) => ({
      id: Math.random().toString(36).substring(7),
      type: b.type,
      content: idx === 0 ? { point1: item.hook } : {}
    }));

    onStartFresh('article', {
      commodity: selectedCommodity,
      category: selectedCategory,
      subcategory: item.subcategoryId,
      format: item.format,
      timeframe: item.era,
      targetDate: selectedTargetDate,
      title: item.title,
      description: item.hook,
    }, {
      type: 'article',
      title: item.title,
      description: item.hook,
      category: selectedCategory,
      subcategory: item.subcategoryId,
      format: item.format,
      timeframe: item.era,
      targetDate: selectedTargetDate,
      commodity: selectedCommodity,
      articleBlocks: initialBlocks.map((b, idx) => ({
        blockType: b.type,
        orderIndex: idx,
        content: b.content
      }))
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
      type: 'article',
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
                <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 }, width: '100%', position: 'relative' }}>
                  {/* EXPANDED 3-STEP WIZARD (LIQUID GLASS / ULTRA-PREMIUM) */}
                  
<<<<<<< HEAD
                  {/* Top Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5, pb: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', color: '#fff' }}>
                        {opt.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Intelligence Briefing Studio
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mt: 0.2, letterSpacing: '-0.02em', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                          {matrixStep === 1 && "1. Target Commodity & Cycle"}
                          {matrixStep === 2 && "2. Daily Strategic Pillar"}
                          {matrixStep === 3 && "3. Curated Briefing Angles"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Step Stepper & Minimize */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                        {[1, 2, 3].map(stepNum => (
                          <Box
                            key={stepNum}
                            onClick={() => stepNum < matrixStep && setMatrixStep(stepNum as any)}
                            sx={{
                              width: 30, height: 30, borderRadius: '10px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: matrixStep === stepNum ? ACCENT : matrixStep > stepNum ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                              border: `1px solid ${matrixStep === stepNum ? ACCENT : matrixStep > stepNum ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                              color: matrixStep > stepNum ? '#10b981' : '#fff', fontSize: '0.75rem', fontWeight: 800,
                              cursor: stepNum < matrixStep ? 'pointer' : 'default',
                              transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                            }}
                          >
                            {matrixStep > stepNum ? '✓' : stepNum}
                          </Box>
                        ))}
                      </Box>

                      <Tooltip title="Minimize">
                        <IconButton onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' } }}>
                          <MinimizeIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 1: COMMODITY & WEEK SELECTION                           */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 1 && (
                    <Box sx={{ animation: `${slideUpFade} 0.35s ease` }}>
                      {/* HERO CARD: Active Commodity of the Week */}
                      {(() => {
                        const activeIdx = (currentWeek - 1) % commoditiesList.length;
                        const activeComm = commoditiesList[activeIdx];
                        const meta = getCommodityMeta(activeComm);
                        return (
                          <Paper
                            elevation={0}
                            onClick={() => handleSelectCommodityAndWeek(currentWeek, activeComm)}
                            sx={{
                              p: { xs: 3, sm: 4 }, mb: 3.5, borderRadius: '22px',
                              background: `linear-gradient(135deg, ${alpha(meta.color, 0.2)} 0%, rgba(15, 23, 42, 0.65) 100%)`,
                              backdropFilter: 'blur(20px)',
                              border: `1.5px solid ${alpha(meta.color, 0.5)}`,
                              boxShadow: `0 16px 40px ${alpha(meta.color, 0.2)}`,
                              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              position: 'relative', overflow: 'hidden',
                              '&:hover': { transform: 'translateY(-3px)', borderColor: meta.color, boxShadow: `0 20px 48px ${alpha(meta.color, 0.35)}` }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                                <Typography sx={{ color: '#10b981', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.06em' }}>
                                  LIVE FOCUS • WEEK {currentWeek}
                                </Typography>
                              </Box>
                              <Chip label={meta.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.15)' }} />
                            </Box>

                            <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', mb: 2, fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>
                              {activeComm}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: meta.color, fontWeight: 800, fontSize: '0.88rem', gap: 1 }}>
                              Target Live Focus <ArrowForwardArrow sx={{ fontSize: 16 }} />
=======
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
>>>>>>> dev
                            </Box>
                            <Button onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ minWidth: 0, p: 1, borderRadius: '12px', color: 'rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' } }}>✕</Button>
                          </Box>
                       </Box>

<<<<<<< HEAD
                      {/* UPCOMING CYCLES GRID */}
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                        Upcoming Cycles
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                        {[1, 2, 3, 4].map(offset => {
                          const futWeek = currentWeek + offset;
                          const futIdx = (futWeek - 1) % commoditiesList.length;
                          const futComm = commoditiesList[futIdx];
                          const meta = getCommodityMeta(futComm);
                          return (
                            <Paper
                              key={futWeek}
                              elevation={0}
                              onClick={() => handleSelectCommodityAndWeek(futWeek, futComm)}
                              sx={{
                                p: 2, borderRadius: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', borderColor: alpha(meta.color, 0.6), transform: 'translateY(-2px)' }
                              }}
                            >
                              <Box>
                                <Typography sx={{ color: meta.color, fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                                  Week {futWeek}
                                </Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.92rem', mt: 0.2 }}>
                                  {futComm}
                                </Typography>
                              </Box>
                              <ArrowForwardArrow sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                            </Paper>
=======
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
                            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.75rem', sm: '0.85rem' }, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                              {opt.title} Setup {matrixStep > 1 && `· Week ${selectedWeek}: ${selectedCommodity}`}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', mt: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                              {matrixStep === 1 ? "Ready to create?" : matrixStep === 2 ? "Select Daily Strategic Pillar" : "Pick Editorial Angle"}
                            </Typography>
                          </Box>
                        </Box>
                        <Tooltip title="Minimize">
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); handleClose(); }}
                            sx={{ color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(0,0,0,0.3)', color: '#fff' } }}
                          >
                            <MinimizeIcon />
                          </IconButton>
                        </Tooltip>
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
>>>>>>> dev
                          );
                        })()}
                      </Box>
                    </Box>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 2: 7 DAILY STRATEGIC PILLARS (3D PERSPECTIVE STACK)     */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 2 && (
<<<<<<< HEAD
                    <Box sx={{ animation: `${slideUpFade} 0.35s ease` }}>
                      {/* Breadcrumb Navigation */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                        <Button 
                          onClick={() => setMatrixStep(1)} 
                          size="small" 
                          startIcon={<ArrowBackIcon sx={{ fontSize: '10px !important' }} />}
                          sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px', px: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' } }}
                        >
                          Change Focus
                        </Button>
                        <Chip 
                          label={`Week ${selectedWeek} • ${selectedCommodity}`} 
                          size="small" 
                          sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.15)' }} 
                        />
                      </Box>

                      {/* 7 Daily Columns Strip */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(7, 1fr)' }, gap: 1.5 }}>
                        {weekDays.map(item => {
=======
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
>>>>>>> dev
                          const isToday = format(item.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');

                          return (
                            <Paper
                              key={item.dayOfWeek}
                              id={`step2-day-${idx}`}
                              elevation={0}
                              onMouseEnter={() => setFocusedDayIdx(idx)}
                              onClick={() => handleSelectDayCategory(item.category, item.date)}
                              sx={{
<<<<<<< HEAD
                                p: 2, borderRadius: '16px',
                                background: isToday
                                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)'
                                  : 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(16px)',
                                border: `1.5px solid ${isToday ? alpha(ACCENT, 0.7) : 'rgba(255,255,255,0.08)'}`,
                                boxShadow: isToday ? `0 8px 24px ${alpha(ACCENT, 0.25)}` : 'none',
                                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                display: 'flex', flexDirection: 'column', minHeight: 120,
                                '&:hover': { borderColor: ACCENT, transform: 'translateY(-3px)', bgcolor: 'rgba(255,255,255,0.08)' }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ color: isToday ? ACCENT : 'rgba(255,255,255,0.5)', fontWeight: 900, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                                  {item.dayName.slice(0, 3).toUpperCase()}
                                </Typography>
                                {isToday && (
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
                                )}
                              </Box>
                              
                              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3, mb: 1 }}>
                                {item.challenge.title}
                              </Typography>
                              
                              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 600, mt: 'auto' }}>
                                {format(item.date, 'MMM d')}
                              </Typography>
=======
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
>>>>>>> dev
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
                    <Box sx={{ animation: `${slideUpFade} 0.35s ease` }}>
                      {/* Sub Header & Actions */}
<<<<<<< HEAD
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1.5, mb: 3, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Button 
                            onClick={() => setMatrixStep(2)} 
                            size="small" 
                            startIcon={<ArrowBackIcon sx={{ fontSize: '10px !important' }} />}
                            sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px', px: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' } }}
                          >
                            Change Day
                          </Button>
                          <Chip label={`${selectedCommodity} › ${selectedCategory.toUpperCase()} › ${format(new Date(selectedTargetDate), 'MMM d')}`} size="small" sx={{ bgcolor: alpha(ACCENT, 0.15), color: ACCENT, fontWeight: 800, fontSize: '0.72rem', border: `1px solid ${alpha(ACCENT, 0.3)}` }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
=======
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, mb: 2.5, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Chip label={`🌾 ${selectedCommodity}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 800 }} />
                          <Chip label={`💼 ${selectedCategory.toUpperCase()}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 800 }} />
                          <Chip label={`📅 ${format(new Date(selectedTargetDate), 'MMM d, yyyy')}`} size="small" sx={{ bgcolor: alpha(ACCENT, 0.2), color: ACCENT, fontWeight: 800 }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Button
                            onClick={() => openAssistant({
                              commodity: selectedCommodity,
                              category: selectedCategory,
                              targetDate: selectedTargetDate,
                              rawPrompts,
                            })}
                            startIcon={<MenuBookIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.35)',
                              borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 2, fontSize: '0.8rem',
                              '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.25)' }
                            }}
                          >
                            📖 AI Guide & Step-by-Step SOP
                          </Button>
                          <WikiHotspot id="creator_studio_relay" label="Editorial Relay SOP" icon="book" />
>>>>>>> dev
                          <Button
                            onClick={handleRegenerate}
                            disabled={regenerating || loadingInsights}
                            startIcon={regenerating ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.15)', color: ACCENT, border: `1px solid ${alpha(ACCENT, 0.3)}`,
                              borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 1.5, py: 0.6, fontSize: '0.75rem',
                              '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.25)' }
                            }}
                          >
                            {regenerating ? "Regenerating..." : "Regenerate (50 NP)"}
                          </Button>
                          <Button
                            onClick={handleStartCustomArticle}
                            variant="outlined"
                            sx={{
                              color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px',
                              fontWeight: 700, textTransform: 'none', fontSize: '0.75rem', px: 1.5, py: 0.6,
                              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.06)', color: '#fff' }
                            }}
                          >
                            ✍️ Custom Title
                          </Button>
                        </Box>
                      </Box>

                      {regenerateError && (
<<<<<<< HEAD
                        <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.8rem', mb: 2 }}>
                          {regenerateError}
                        </Typography>
=======
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            mb: 3,
                            borderRadius: '16px',
                            bgcolor: 'rgba(239, 68, 68, 0.08)',
                            border: '1.5px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', mt: '2px', flexShrink: 0 }}>
                              ⚠️
                            </Box>
                            <Box>
                              <Typography sx={{ color: '#fca5a5', fontWeight: 800, fontSize: '0.92rem', mb: 0.25 }}>
                                AI Intelligence Pipeline Notice
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                                {regenerateError}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => openAssistant({
                              commodity: selectedCommodity,
                              category: selectedCategory,
                              targetDate: selectedTargetDate,
                              rawPrompts,
                            })}
                            startIcon={<TerminalIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              bgcolor: '#3b82f6', color: '#fff', fontWeight: 800, textTransform: 'none', px: 2, py: 0.75, borderRadius: '10px', flexShrink: 0,
                              '&:hover': { bgcolor: '#2563eb' }
                            }}
                          >
                            Open Prompt Terminal
                          </Button>
                        </Paper>
>>>>>>> dev
                      )}

                      {/* Cognitive Spectrum Filter Chips */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        overflowX: 'auto',
                        pb: 2,
                        mb: 2.5,
                        '&::-webkit-scrollbar': { height: '4px' },
                        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }
                      }}>
                        <Chip
                          label={`All Angles (${insights.length})`}
                          onClick={() => setSpectrumFilter('all')}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            bgcolor: spectrumFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.06)',
                            color: spectrumFilter === 'all' ? '#000' : 'rgba(255,255,255,0.7)',
                            border: '1px solid',
                            borderColor: spectrumFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.1)',
                            '&:hover': { bgcolor: spectrumFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.12)' }
                          }}
                        />
                        {Object.entries(SPECTRUM_CONFIG).map(([rankKey, meta]) => {
                          const isSelected = spectrumFilter === rankKey;
                          return (
                            <Chip
                              key={rankKey}
                              label={`${meta.emoji} ${meta.shortLabel}`}
                              onClick={() => setSpectrumFilter(isSelected ? 'all' : rankKey)}
                              sx={{
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                bgcolor: isSelected ? meta.color : meta.bg,
                                color: isSelected ? '#fff' : meta.color,
                                border: '1px solid',
                                borderColor: isSelected ? meta.color : alpha(meta.color, 0.3),
                                '&:hover': { bgcolor: isSelected ? meta.color : alpha(meta.color, 0.25) }
                              }}
                            />
                          );
                        })}
                      </Box>

                      {loadingInsights ? (
<<<<<<< HEAD
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                          <CircularProgress size={32} sx={{ color: ACCENT, mb: 2 }} />
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.88rem' }}>
                            Loading curated editorial angles for {selectedCommodity}...
=======
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
                          <CircularProgress size={40} sx={{ color: ACCENT, mb: 2 }} />
                          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', mb: 0.5 }}>
                            Running Gemini 3.7 Flash Intelligence Engine...
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                            Synthesizing 5 Micro-Geographies ➔ 6 Cognitive Spectrums ➔ 10–12 Briefs
>>>>>>> dev
                          </Typography>
                        </Box>
                      ) : insights.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: '24px',
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1.5px dashed rgba(255,255,255,0.15)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            my: 3
                          }}
                        >
                          <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                            <TerminalIcon sx={{ fontSize: 36 }} />
                          </Box>
                          <Box sx={{ maxWidth: '600px' }}>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, mb: 0.5 }}>
                              AI Intelligence Pipeline Ready
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                              {regenerateError || `The 3-stage prompts for ${selectedCommodity} have been compiled. You can open the AI Prompt Terminal to copy the prompts, run them in your external LLM, or paste custom outlines.`}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
                            <Button
                              variant="contained"
                              onClick={() => openAssistant({
                                commodity: selectedCommodity,
                                category: selectedCategory,
                                targetDate: selectedTargetDate,
                                rawPrompts,
                              })}
                              startIcon={<MenuBookIcon />}
                              sx={{
                                bgcolor: '#3b82f6',
                                color: '#fff',
                                fontWeight: 800,
                                px: 3,
                                py: 1,
                                borderRadius: '12px',
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#2563eb' }
                              }}
                            >
                              📖 Open Step-by-Step Relay SOP & Prompts
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={handleStartCustomArticle}
                              sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.25)',
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                borderRadius: '12px',
                                textTransform: 'none',
                                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                              }}
                            >
                              ✍️ Write with Custom Title
                            </Button>
                          </Box>
                        </Paper>
                      ) : (
<<<<<<< HEAD
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                          {insights.map((item) => {
                            const fMeta = FORMAT_CONFIG[item.format] || FORMAT_CONFIG.brief;
                            const eMeta = ERA_CONFIG[item.era] || ERA_CONFIG.present;
                            return (
                              <Paper
                                key={item.id}
                                elevation={0}
                                onClick={() => handleSelectInsight(item)}
                                sx={{
                                  p: 2.5, borderRadius: '18px',
                                  background: 'rgba(255,255,255,0.03)',
                                  backdropFilter: 'blur(20px)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                  display: 'flex', flexDirection: 'column',
                                  position: 'relative', overflow: 'hidden',
                                  '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                    borderColor: alpha(fMeta.color, 0.7),
                                    transform: 'translateY(-3px)',
                                    boxShadow: `0 12px 30px ${alpha(fMeta.color, 0.2)}`
                                  }
                                }}
                              >
                                {/* Top Format, Era & Subcategory Badges */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Chip
                                      label={`${fMeta.emoji} ${fMeta.label}`}
                                      size="small"
                                      sx={{ bgcolor: alpha(fMeta.color, 0.18), color: fMeta.color, fontWeight: 800, fontSize: '0.7rem', border: `1px solid ${alpha(fMeta.color, 0.35)}`, height: 22 }}
                                    />
                                    <Chip
                                      label={`${eMeta.emoji} ${eMeta.label}`}
                                      size="small"
                                      sx={{ bgcolor: alpha(eMeta.color, 0.12), color: eMeta.color, fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                                    />
                                  </Box>
                                  <Chip
                                    label={item.subcategoryTitle}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '0.68rem', height: 22 }}
                                  />
                                </Box>

                                {/* Title */}
                                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.35, mb: 0.8, letterSpacing: '-0.01em' }}>
                                  {item.title}
                                </Typography>

                                {/* Hook */}
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', lineHeight: 1.45, fontWeight: 500 }}>
                                  {item.hook}
                                </Typography>
                              </Paper>
                            );
                          })}
=======
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5, pb: 4 }}>
                          {insights
                            .filter(item => {
                              if (spectrumFilter === 'all') return true;
                              const rankMeta = getSpectrumMeta(item.spectrumRank);
                              return rankMeta.shortLabel.includes(spectrumFilter) || (item.spectrumRank && item.spectrumRank.includes(spectrumFilter));
                            })
                            .map((item, idx) => {
                              const fMeta = FORMAT_CONFIG[item.format] || FORMAT_CONFIG.brief;
                              const eMeta = ERA_CONFIG[item.era] || ERA_CONFIG.present;
                              const sMeta = getSpectrumMeta(item.spectrumRank);

                              return (
                                <Paper
                                  key={item.id || `insight-${idx}`}
                                  elevation={0}
                                  onClick={() => handleSelectInsight(item)}
                                  sx={{
                                    p: 3,
                                    borderRadius: '22px',
                                    background: 'rgba(255,255,255,0.035)',
                                    border: '1.5px solid rgba(255,255,255,0.08)',
                                    cursor: 'pointer',
                                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,255,255,0.07)',
                                      borderColor: sMeta.color,
                                      transform: 'translateY(-4px)',
                                      boxShadow: `0 16px 36px ${alpha(sMeta.color, 0.22)}`
                                    }
                                  }}
                                >
                                  <Box>
                                    {/* Top Spectrum & Format Badges */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                          label={`${sMeta.emoji} ${item.spectrumRank || sMeta.label}`}
                                          size="small"
                                          sx={{ bgcolor: sMeta.bg, color: sMeta.color, fontWeight: 900, fontSize: '0.72rem', border: `1px solid ${alpha(sMeta.color, 0.35)}` }}
                                        />
                                        <Chip
                                          label={`${fMeta.emoji} ${fMeta.label}`}
                                          size="small"
                                          sx={{ bgcolor: alpha(fMeta.color, 0.2), color: fMeta.color, fontWeight: 800, fontSize: '0.7rem' }}
                                        />
                                        <Chip
                                          label={`${eMeta.emoji} ${eMeta.label}`}
                                          size="small"
                                          sx={{ bgcolor: alpha(eMeta.color, 0.15), color: eMeta.color, fontWeight: 700, fontSize: '0.68rem' }}
                                        />
                                      </Box>
                                      {item.subcategoryTitle && (
                                        <Chip
                                          label={item.subcategoryTitle}
                                          size="small"
                                          sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.68rem' }}
                                        />
                                      )}
                                    </Box>

                                    {/* Location & Persona Sub-Bar */}
                                    {(item.location || item.targetPersona) && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                                        {item.location && (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#93c5fd', fontSize: '0.75rem', fontWeight: 700 }}>
                                            <LocationIcon sx={{ fontSize: 13 }} />
                                            {item.location}
                                          </Box>
                                        )}
                                        {item.targetPersona && (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>
                                            <AccountCircleIcon sx={{ fontSize: 13 }} />
                                            {item.targetPersona}
                                          </Box>
                                        )}
                                      </Box>
                                    )}

                                    {/* Dynamic Institutional Title */}
                                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.15rem', lineHeight: 1.35, mb: 1.5, letterSpacing: '-0.015em' }}>
                                      {item.title}
                                    </Typography>

                                    {/* 6-Sentence Formula Description */}
                                    {item.descriptionSentences && item.descriptionSentences.length > 0 ? (
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                                        {item.descriptionSentences.map((sentence, sIdx) => {
                                          const isWhoProfits = sIdx === 5 || sentence.toLowerCase().includes('profit') || sentence.toLowerCase().includes('cartel') || sentence.toLowerCase().includes('syndicate');
                                          return (
                                            <Box
                                              key={sIdx}
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 1,
                                                p: isWhoProfits ? 1 : 0,
                                                borderRadius: isWhoProfits ? '8px' : 0,
                                                bgcolor: isWhoProfits ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                                                border: isWhoProfits ? '1px solid rgba(239, 68, 68, 0.25)' : 'none',
                                              }}
                                            >
                                              <Typography sx={{ color: isWhoProfits ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 800, mt: '2px', flexShrink: 0 }}>
                                                {isWhoProfits ? '⚖️' : `•`}
                                              </Typography>
                                              <Typography sx={{ color: isWhoProfits ? '#fca5a5' : 'rgba(255,255,255,0.7)', fontSize: '0.82rem', lineHeight: 1.45, fontWeight: isWhoProfits ? 700 : 500 }}>
                                                {sentence}
                                              </Typography>
                                            </Box>
                                          );
                                        })}
                                      </Box>
                                    ) : (
                                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.5, mb: 2, fontWeight: 500 }}>
                                        {item.hook}
                                      </Typography>
                                    )}
                                  </Box>

                                  {/* Bottom CTA Action Bar */}
                                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600 }}>
                                      {item.format?.toUpperCase()} · {item.era?.toUpperCase()}
                                    </Typography>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: sMeta.color, fontWeight: 800, fontSize: '0.85rem' }}>
                                      Write This Brief <ArrowForwardIcon sx={{ fontSize: 13 }} />
                                    </Box>
                                  </Box>
                                </Paper>
                              );
                            })}
>>>>>>> dev
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
    </Box>
  );
}
