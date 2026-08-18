import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Paper, Chip, IconButton, alpha, Tooltip, CircularProgress, Button } from '@mui/material';
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
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import WikiHotspot from '@/components/wiki/WikiHotspot';
import WorkspaceContentManager from '@/app/components/studio/WorkspaceContentManager';
import { commoditiesList, getCommodityMeta } from '@/lib/cms/commodities';
import { getISOWeek, startOfISOWeek, addDays, format, getYear } from 'date-fns';
import { CATEGORY_MAP } from '@/lib/config/editorialMatrix';
import { getDailyEditorialIntel, regenerateCustomAnglesAction, ArticleInsightItem } from '@/lib/actions/editorialMatrix';
import { FORMAT_CONFIG, ERA_CONFIG, ArticleFormat, ArticleEra } from '@/lib/config/articleBlueprints';

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
  
  // Step 3 Insights State
  const [insights, setInsights] = useState<ArticleInsightItem[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  // Non-article legacy wizard state
  const [legacyCategory, setLegacyCategory] = useState('');
  const [legacySubcategory, setLegacySubcategory] = useState('');

  // Fast Ingest State
  const [fastPayloadText, setFastPayloadText] = useState('');
  const [fastIngestError, setFastIngestError] = useState('');

  const activeOption = START_FRESH_OPTIONS.find(o => o.type === expandedStartType);

  const handleOpenCreator = (type: string) => {
    setExpandedStartType(type);
    setMatrixStep(1);
    setSelectedWeek(currentWeek);
    setSelectedYear(currentYear);
    const idx = (currentWeek - 1) % commoditiesList.length;
    setSelectedCommodity(commoditiesList[idx]);
    setLegacyCategory('');
    setLegacySubcategory('');
  };

  const handleClose = () => {
    setExpandedStartType(null);
    setMatrixStep(1);
    setLegacyCategory('');
    setLegacySubcategory('');
  };

  // ───────────────────────────────────────────────────────────
  // FETCH INSIGHTS FOR STEP 3
  // ───────────────────────────────────────────────────────────
  const fetchInsightsForMatrixSlot = useCallback(async (dateStr: string) => {
    setLoadingInsights(true);
    setRegenerateError(null);
    try {
      const res = await getDailyEditorialIntel(dateStr);
      if (res && res.insights) {
        setInsights(res.insights);
      }
    } catch (e: any) {
      console.error('Failed to fetch daily editorial intel', e);
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  const handleSelectCommodityAndWeek = (week: number, commodity: string) => {
    setSelectedWeek(week);
    setSelectedCommodity(commodity);
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
      title: item.title,
      description: item.hook,
      category: selectedCategory,
      subcategory: item.subcategoryId,
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
                
                if (opt.type === 'livestream') {
                  onStartFresh('livestream');
                } else if (!expandedStartType) {
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
                position: 'relative', overflow: 'hidden',
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
                  
                  {/* Top Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                        {opt.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Intelligence Briefing Studio
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mt: 0.2 }}>
                          {matrixStep === 1 && "1. Choose Commodity & Week"}
                          {matrixStep === 2 && "2. Select Daily Strategic Pillar"}
                          {matrixStep === 3 && "3. Pick Your Intelligence Briefing Angle"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Step Progress & Minimize */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                        {[1, 2, 3].map(stepNum => (
                          <Box
                            key={stepNum}
                            onClick={() => stepNum < matrixStep && setMatrixStep(stepNum as any)}
                            sx={{
                              width: 28, height: 28, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: matrixStep === stepNum ? ACCENT : matrixStep > stepNum ? '#10b981' : 'rgba(255,255,255,0.1)',
                              color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                              cursor: stepNum < matrixStep ? 'pointer' : 'default',
                              transition: 'all 0.2s'
                            }}
                          >
                            {matrixStep > stepNum ? '✓' : stepNum}
                          </Box>
                        ))}
                      </Box>

                      <Button
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleClose(); }}
                        sx={{
                          color: 'rgba(255,255,255,0.8)',
                          bgcolor: 'rgba(255,255,255,0.08)',
                          fontWeight: 800,
                          borderRadius: '12px',
                          px: 1.8,
                          py: 0.6,
                          fontSize: '0.78rem',
                          textTransform: 'none',
                          border: '1px solid rgba(255,255,255,0.12)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }
                        }}
                      >
                        ✕ All Formats
                      </Button>
                    </Box>
                  </Box>

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 1: COMMODITY & WEEK SELECTION                           */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 1 && (
                    <Box sx={{ animation: `${slideUpFade} 0.4s ease` }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', mb: 3, fontWeight: 500 }}>
                        Every week in FoodNerve focuses on a single agro-commodity asset. Select the active week or target an upcoming cycle.
                      </Typography>

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
                              p: { xs: 3, md: 4 }, mb: 4, borderRadius: '24px',
                              background: `linear-gradient(135deg, ${alpha(meta.color, 0.25)} 0%, rgba(15, 23, 42, 0.8) 100%)`,
                              border: `2px solid ${alpha(meta.color, 0.6)}`,
                              boxShadow: `0 12px 36px ${alpha(meta.color, 0.3)}`,
                              cursor: 'pointer', transition: 'all 0.3s',
                              '&:hover': { transform: 'translateY(-3px)', borderColor: meta.color, boxShadow: `0 16px 48px ${alpha(meta.color, 0.45)}` }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                              <Chip
                                label={`🌟 ACTIVE WEEK ${currentWeek} COMMODITY`}
                                size="small"
                                sx={{ bgcolor: meta.color, color: '#fff', fontWeight: 900, fontSize: '0.75rem' }}
                              />
                              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>
                                Live Editorial Focus
                              </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', mb: 1 }}>
                              {activeComm}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Chip label={meta.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }} />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                                Write for Week {currentWeek} <ArrowForwardIcon sx={{ fontSize: 14 }} />
                              </Box>
                            </Box>
                          </Paper>
                        );
                      })()}

                      {/* UPCOMING WEEKS CAROUSEL */}
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2 }}>
                        Upcoming Weeks (Schedule in Advance)
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
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
                                p: 2.5, borderRadius: '18px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer', transition: 'all 0.3s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: meta.color, transform: 'translateY(-2px)' }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ color: meta.color, fontWeight: 900, fontSize: '0.8rem' }}>
                                  Week {futWeek}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                                  Cyclic
                                </Typography>
                              </Box>
                              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', mb: 1, minHeight: 44 }}>
                                {futComm}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 500 }}>
                                Subject to bidding override
                              </Typography>
                            </Paper>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 2: 7 DAILY STRATEGIC PILLARS                            */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 2 && (
                    <Box sx={{ animation: `${slideUpFade} 0.4s ease` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <Button onClick={() => setMatrixStep(1)} size="small" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 700 }}>
                          ← Change Week / Commodity
                        </Button>
                        <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>|</Typography>
                        <Chip label={`Week ${selectedWeek}: ${selectedCommodity}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800 }} />
                      </Box>

                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', mb: 3, fontWeight: 500 }}>
                        Select the daily strategic pillar. Your article will be automatically scheduled on the Ecosystem Calendar for this date.
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(7, 1fr)' }, gap: 2 }}>
                        {weekDays.map(item => {
                          const isToday = format(item.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
                          return (
                            <Paper
                              key={item.dayOfWeek}
                              elevation={0}
                              onClick={() => handleSelectDayCategory(item.category, item.date)}
                              sx={{
                                p: 2, borderRadius: '18px',
                                background: isToday
                                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                  : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isToday ? alpha(ACCENT, 0.6) : 'rgba(255,255,255,0.1)'}`,
                                cursor: 'pointer', transition: 'all 0.3s',
                                display: 'flex', flexDirection: 'column',
                                '&:hover': { borderColor: ACCENT, transform: 'translateY(-3px)', bgcolor: 'rgba(255,255,255,0.08)' }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ color: isToday ? ACCENT : 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                  {item.dayName.slice(0, 3)}
                                </Typography>
                                {isToday && (
                                  <Chip label="TODAY" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: ACCENT, color: '#fff', fontWeight: 900 }} />
                                )}
                              </Box>
                              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1rem', mb: 0.5 }}>
                                {item.challenge.title}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 600, mt: 'auto', pt: 2 }}>
                                📅 {item.dateFormatted}
                              </Typography>
                            </Paper>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 3: 10–12 AI ARTICLE BRIEFING ANGLES                     */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 3 && (
                    <Box sx={{ animation: `${slideUpFade} 0.4s ease` }}>
                      {/* Sub Header & Actions */}
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Button onClick={() => setMatrixStep(2)} size="small" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 700 }}>
                            ← Change Day
                          </Button>
                          <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>|</Typography>
                          <Chip label={`🌾 ${selectedCommodity}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800 }} />
                          <Chip label={`💼 ${selectedCategory.toUpperCase()}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800 }} />
                          <Chip label={`📅 ${format(new Date(selectedTargetDate), 'MMM d, yyyy')}`} size="small" sx={{ bgcolor: alpha(ACCENT, 0.2), color: ACCENT, fontWeight: 800 }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Button
                            onClick={handleRegenerate}
                            disabled={regenerating || loadingInsights}
                            startIcon={regenerating ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.15)', color: ACCENT, border: `1px solid ${alpha(ACCENT, 0.3)}`,
                              borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 2, fontSize: '0.8rem',
                              '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.25)' }
                            }}
                          >
                            {regenerating ? "Regenerating..." : "Regenerate Angles (50 NP)"}
                          </Button>
                          <Button
                            onClick={handleStartCustomArticle}
                            variant="outlined"
                            sx={{
                              color: '#fff', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px',
                              fontWeight: 700, textTransform: 'none', fontSize: '0.8rem',
                              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                            }}
                          >
                            ✍️ Custom Title
                          </Button>
                        </Box>
                      </Box>

                      {regenerateError && (
                        <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', mb: 2 }}>
                          {regenerateError}
                        </Typography>
                      )}

                      {loadingInsights ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                          <CircularProgress size={36} sx={{ color: ACCENT, mb: 2 }} />
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                            Loading curated editorial angles for {selectedCommodity}...
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                          {insights.map((item) => {
                            const fMeta = FORMAT_CONFIG[item.format] || FORMAT_CONFIG.brief;
                            const eMeta = ERA_CONFIG[item.era] || ERA_CONFIG.present;
                            return (
                              <Paper
                                key={item.id}
                                elevation={0}
                                onClick={() => handleSelectInsight(item)}
                                sx={{
                                  p: 3, borderRadius: '20px',
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                  display: 'flex', flexDirection: 'column',
                                  '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    borderColor: fMeta.color,
                                    transform: 'translateY(-3px)',
                                    boxShadow: `0 12px 32px ${alpha(fMeta.color, 0.25)}`
                                  }
                                }}
                              >
                                {/* Top Format & Subcategory Badge */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={`${fMeta.emoji} ${fMeta.label}`}
                                      size="small"
                                      sx={{ bgcolor: alpha(fMeta.color, 0.2), color: fMeta.color, fontWeight: 800, fontSize: '0.72rem', border: `1px solid ${alpha(fMeta.color, 0.3)}` }}
                                    />
                                    <Chip
                                      label={`${eMeta.emoji} ${eMeta.label}`}
                                      size="small"
                                      sx={{ bgcolor: alpha(eMeta.color, 0.15), color: eMeta.color, fontWeight: 700, fontSize: '0.7rem' }}
                                    />
                                  </Box>
                                  <Chip
                                    label={item.subcategoryTitle}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.7rem' }}
                                  />
                                </Box>

                                {/* Title */}
                                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.4, mb: 1, letterSpacing: '-0.01em' }}>
                                  {item.title}
                                </Typography>

                                {/* Hook */}
                                <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', lineHeight: 1.5, mb: 2, fontWeight: 500 }}>
                                  {item.hook}
                                </Typography>

                                <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: fMeta.color, fontWeight: 800, fontSize: '0.82rem', gap: 0.5 }}>
                                  Write This Brief <ArrowForwardIcon sx={{ fontSize: 13 }} />
                                </Box>
                              </Paper>
                            );
                          })}
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
