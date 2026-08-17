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
import { FORMAT_CONFIG, ERA_CONFIG, ArticleFormat, ArticleEra, getBlueprint } from '@/lib/config/articleBlueprints';

const ACCENT = "#f59e0b";
const ACCENT_DARK = "#d97706";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const START_FRESH_OPTIONS = [
  {
    type: 'article', title: "Intelligence Brief", desc: "Write an in-depth article or report.",
    icon: <ArticleIcon sx={{ fontSize: 32 }} />, color: "#3b82f6", grad: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
  },
  {
    type: 'video', title: "Video Insights", desc: "Share short-form video analysis.",
    icon: <VideoLibraryIcon sx={{ fontSize: 32 }} />, color: "#ef4444", grad: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)"
  },
  {
    type: 'livestream', title: "Schedule Livestream", desc: "Host a live session.",
    icon: <LiveTvIcon sx={{ fontSize: 32 }} />, color: "#10b981", grad: "linear-gradient(135deg, #065f46 0%, #10b981 100%)"
  },
  {
    type: 'class', title: "Masterclass", desc: "Create a multi-module learning experience.",
    icon: <SchoolIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6", grad: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)"
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
        {START_FRESH_OPTIONS.map((opt) => {
          const isExpanded = expandedStartType === opt.type;
          const isHidden = expandedStartType !== null && !isExpanded;
          const isActive = true;

          return (
            <Paper
              key={opt.type}
              elevation={0}
              onClick={() => {
                if (!expandedStartType && isActive) {
                  handleOpenCreator(opt.type);
                }
              }}
              sx={{
                flex: isExpanded ? '1 1 100%' : (isHidden ? 0 : '1 1 calc(25% - 24px)'),
                minWidth: isHidden ? 0 : (isExpanded ? '100%' : { xs: 140, sm: 220 }),
                maxWidth: isHidden ? 0 : (isExpanded ? '100%' : { xs: 140, sm: 280 }),
                height: isExpanded ? 'auto' : (isHidden ? 0 : { xs: 160, sm: 260 }),
                opacity: isHidden ? 0 : (isActive ? 1 : 0.65),
                p: isExpanded ? 0 : (isHidden ? 0 : { xs: 1.5, sm: 2.5, md: 3 }),
                display: 'flex', flexDirection: 'column',
                borderRadius: { xs: '16px', sm: '24px' }, 
                cursor: isExpanded ? 'default' : (isActive ? 'pointer' : 'not-allowed'),
                background: isExpanded ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` : opt.grad,
                border: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isHidden ? 'none' : `0 10px 30px ${alpha(opt.color, 0.2)}`,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': !isExpanded && isActive ? {
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
                    <WikiHotspot id={`learn-start-fresh-${opt.type}`} label={opt.title} />
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
                            </Box>
                          </Paper>
                        );
                      })()}

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
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 2: 7 DAILY STRATEGIC PILLARS                            */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 2 && (
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
                          const isToday = format(item.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
                          return (
                            <Paper
                              key={item.dayOfWeek}
                              elevation={0}
                              onClick={() => handleSelectDayCategory(item.category, item.date)}
                              sx={{
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
                    <Box sx={{ animation: `${slideUpFade} 0.35s ease` }}>
                      {/* Sub Header & Actions */}
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
                        <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.8rem', mb: 2 }}>
                          {regenerateError}
                        </Typography>
                      )}

                      {loadingInsights ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                          <CircularProgress size={32} sx={{ color: ACCENT, mb: 2 }} />
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.88rem' }}>
                            Loading curated editorial angles for {selectedCommodity}...
                          </Typography>
                        </Box>
                      ) : (
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
