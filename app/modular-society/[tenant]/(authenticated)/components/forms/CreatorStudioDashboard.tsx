'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Paper, Chip, IconButton, alpha, Tooltip, CircularProgress, Button } from '@mui/material';
import {
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  LiveTv as LiveTvIcon,
  School as SchoolIcon,
  Minimize as MinimizeIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowForward as ArrowForwardIcon,
  Bolt as BoltIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import WikiHotspot from '@/components/wiki/WikiHotspot';
import WorkspaceContentManager from '@/app/components/studio/WorkspaceContentManager';
import { commoditiesList, getCommodityMeta } from '@/lib/cms/commodities';
import { getISOWeek, startOfISOWeek, addDays, format, getYear } from 'date-fns';
import { CATEGORY_MAP } from '@/lib/config/editorialMatrix';
import { getDailyEditorialIntel, regenerateCustomAnglesAction, ArticleInsightItem } from '@/lib/actions/editorialMatrix';
import { FORMAT_CONFIG, ERA_CONFIG } from '@/lib/config/articleBlueprints';

const ACCENT = "#f59e0b";

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const START_FRESH_OPTIONS = [
  {
    type: 'article',
    title: "Intelligence Brief",
    tagline: "15 SOP Editorial Matrix",
    icon: <ArticleIcon sx={{ fontSize: 28 }} />,
    color: "#3b82f6",
    grad: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
    accentColor: "#60a5fa"
  },
  {
    type: 'video',
    title: "Video Insights",
    tagline: "Short-Form Analysis",
    icon: <VideoLibraryIcon sx={{ fontSize: 28 }} />,
    color: "#ef4444",
    grad: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #ef4444 100%)",
    accentColor: "#f87171"
  },
  {
    type: 'livestream',
    title: "Live Stream",
    tagline: "Interactive Session",
    icon: <LiveTvIcon sx={{ fontSize: 28 }} />,
    color: "#10b981",
    grad: "linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)",
    accentColor: "#34d399"
  },
  {
    type: 'class',
    title: "Masterclass",
    tagline: "Multi-Module Course",
    icon: <SchoolIcon sx={{ fontSize: 28 }} />,
    color: "#8b5cf6",
    grad: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #8b5cf6 100%)",
    accentColor: "#a78bfa"
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
  // EDITORIAL MATRIX 3-STEP WIZARD STATE
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

  // Non-article creator state
  const [legacyCategory, setLegacyCategory] = useState('');
  const [legacySubcategory, setLegacySubcategory] = useState('');

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

  // Fetch Insights for Matrix Slot
  const fetchInsightsForMatrixSlot = useCallback(async (dateStr: string) => {
    setLoadingInsights(true);
    setRegenerateError(null);
    try {
      const data = await getDailyEditorialIntel(dateStr);
      if (data && Array.isArray(data.insights)) {
        setInsights(data.insights);
      } else {
        setInsights([]);
      }
    } catch (e: any) {
      setRegenerateError(e.message || "Failed to load intelligence brief angles.");
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
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      dayOfWeek: dayIdx,
      dayName: dayNames[dayIdx],
      date: dayDate,
      dateFormatted: format(dayDate, 'MMM d'),
      category: catKey,
      challenge,
    };
  });

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Morning' : currentHour < 18 ? 'Afternoon' : 'Evening';

  return (
    <Box sx={{
      p: { xs: 2, sm: 4, md: 6 }, mx: 'auto', width: '100%', flex: 1, overflowY: 'auto',
      background: 'radial-gradient(ellipse at 15% 15%, rgba(16, 185, 129, 0.04) 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(59, 130, 246, 0.04) 0%, transparent 50%)',
    }}>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* EXECUTIVE HEADER                                             */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box sx={{ mb: { xs: 3, sm: 4, md: 5 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: '#64748b' }}>
              Intelligence Studio
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#94a3b8' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', animation: `${pulseGlow} 2s infinite ease-in-out` }} />
              Live Cycle Week {currentWeek}
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.4rem' } }}>
            Good {greeting}, {userName?.split(' ')[0] || 'Architect'}
          </Typography>
        </Box>

        {/* Live Drafts & Points Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<BoltIcon sx={{ fontSize: 16, color: '#f59e0b !important' }} />}
            label={`${userSpendableNP} NP`}
            size="small"
            sx={{
              fontWeight: 800, fontSize: '0.8rem',
              bgcolor: 'rgba(245, 158, 11, 0.08)',
              color: '#d97706',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '10px'
            }}
          />
          <Chip
            label={`${drafts.length} Draft${drafts.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              fontWeight: 700, fontSize: '0.8rem',
              bgcolor: 'rgba(15, 23, 42, 0.04)',
              color: '#475569',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              borderRadius: '10px'
            }}
          />
        </Box>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* START FRESH DECK (APPLE LIQUID GLASS)                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'stretch' }}>
        {START_FRESH_OPTIONS.map((opt) => {
          const isExpanded = expandedStartType === opt.type;
          const isHidden = expandedStartType && !isExpanded;

          return (
            <Paper
              key={opt.type}
              elevation={0}
              onClick={() => {
                if (!expandedStartType) {
                  handleOpenCreator(opt.type);
                }
              }}
              sx={{
                flex: isExpanded ? '1 1 100%' : (isHidden ? 0 : '1 1 calc(25% - 20px)'),
                minWidth: isHidden ? 0 : (isExpanded ? '100%' : { xs: 140, sm: 200 }),
                maxWidth: isHidden ? 0 : (isExpanded ? '100%' : '100%'),
                height: isExpanded ? 'auto' : (isHidden ? 0 : { xs: 150, sm: 190 }),
                opacity: isHidden ? 0 : 1,
                p: isExpanded ? 0 : (isHidden ? 0 : { xs: 2, sm: 2.5 }),
                display: 'flex', flexDirection: 'column',
                borderRadius: { xs: '18px', sm: '22px' },
                cursor: isExpanded ? 'default' : 'pointer',
                background: isExpanded ? '#0b0f19' : opt.grad,
                border: isHidden ? 'none' : isExpanded ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.18)',
                boxShadow: isHidden ? 'none' : isExpanded ? '0 24px 64px rgba(0,0,0,0.5)' : `0 10px 28px ${alpha(opt.color, 0.22)}`,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': !isExpanded ? {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 18px 40px ${alpha(opt.color, 0.35)}`,
                } : {}
              }}
            >
              {!isExpanded ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{
                      p: 1.2, borderRadius: '14px',
                      bgcolor: 'rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {opt.icon}
                    </Box>
                    <WikiHotspot id={`learn-start-fresh-${opt.type}`} label={opt.title} />
                  </Box>

                  <Box sx={{ mt: 'auto', zIndex: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1rem', sm: '1.15rem' }, color: '#fff', letterSpacing: '-0.02em', mb: 0.2 }}>
                      {opt.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                      {opt.tagline}
                    </Typography>
                  </Box>
                </>
              ) : (
                /* ═══════════════════════════════════════════════════════════ */
                /* EXPANDED 3-STEP EDITORIAL WIZARD                            */
                /* ═══════════════════════════════════════════════════════════ */
                <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 }, width: '100%', position: 'relative' }}>
                  
                  {/* Top Bar Navigation */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5, pb: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                        {opt.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Editorial Engine · Step {matrixStep} of 3
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                          {matrixStep === 1 && "Select Commodity Focus"}
                          {matrixStep === 2 && "Select Daily Pillar"}
                          {matrixStep === 3 && "Curated Briefing Angles"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Step Dots & Minimize */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                        {[1, 2, 3].map(stepNum => (
                          <Box
                            key={stepNum}
                            onClick={() => stepNum < matrixStep && setMatrixStep(stepNum as any)}
                            sx={{
                              width: 26, height: 26, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: matrixStep === stepNum ? ACCENT : matrixStep > stepNum ? '#10b981' : 'rgba(255,255,255,0.08)',
                              color: '#fff', fontSize: '0.72rem', fontWeight: 800,
                              cursor: stepNum < matrixStep ? 'pointer' : 'default',
                              transition: 'all 0.2s'
                            }}
                          >
                            {matrixStep > stepNum ? '✓' : stepNum}
                          </Box>
                        ))}
                      </Box>

                      <Tooltip title="Close Wizard">
                        <IconButton onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ color: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.06)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' } }}>
                          <MinimizeIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 1: COMMODITY & WEEK SELECTION                           */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 1 && (
                    <Box sx={{ animation: `${slideUp} 0.3s ease` }}>
                      
                      {/* Active Hero Commodity */}
                      {(() => {
                        const activeIdx = (currentWeek - 1) % commoditiesList.length;
                        const activeComm = commoditiesList[activeIdx];
                        const meta = getCommodityMeta(activeComm);
                        return (
                          <Paper
                            elevation={0}
                            onClick={() => handleSelectCommodityAndWeek(currentWeek, activeComm)}
                            sx={{
                              p: { xs: 3, md: 3.5 }, mb: 3.5, borderRadius: '20px',
                              background: `linear-gradient(135deg, ${alpha(meta.color, 0.25)} 0%, rgba(15, 23, 42, 0.85) 100%)`,
                              border: `1.5px solid ${alpha(meta.color, 0.5)}`,
                              boxShadow: `0 12px 36px ${alpha(meta.color, 0.25)}`,
                              cursor: 'pointer', transition: 'all 0.25s',
                              display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              justifyContent: 'space-between', gap: 2,
                              '&:hover': { transform: 'translateY(-2px)', borderColor: meta.color, boxShadow: `0 16px 44px ${alpha(meta.color, 0.35)}` }
                            }}
                          >
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Chip
                                  label={`LIVE · WEEK ${currentWeek}`}
                                  size="small"
                                  sx={{ bgcolor: meta.color, color: '#fff', fontWeight: 900, fontSize: '0.7rem', height: 22 }}
                                />
                                <Chip
                                  label={meta.category}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                                />
                              </Box>
                              <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
                                {activeComm}
                              </Typography>
                            </Box>

                            <Button
                              variant="contained"
                              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                bgcolor: '#fff', color: '#0f172a', fontWeight: 800,
                                borderRadius: '12px', px: 2.5, py: 1, textTransform: 'none',
                                '&:hover': { bgcolor: '#f1f5f9' }
                              }}
                            >
                              Select Active Focus
                            </Button>
                          </Paper>
                        );
                      })()}

                      {/* Upcoming Cycles Deck */}
                      <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                        Upcoming Cycles
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
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
                                border: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer', transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', borderColor: meta.color, transform: 'translateY(-2px)' }
                              }}
                            >
                              <Typography sx={{ color: meta.color, fontWeight: 900, fontSize: '0.75rem', mb: 0.5 }}>
                                Week {futWeek}
                              </Typography>
                              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.92rem', mb: 0.5 }}>
                                {futComm}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 600 }}>
                                {meta.category}
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
                    <Box sx={{ animation: `${slideUp} 0.3s ease` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Button
                          onClick={() => setMatrixStep(1)}
                          size="small"
                          sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
                        >
                          ← Change Asset
                        </Button>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                        <Chip
                          label={`🌾 ${selectedCommodity} · Week ${selectedWeek}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 800, fontSize: '0.75rem' }}
                        />
                      </Box>

                      {/* 7 Days Minimalist Grid */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)', md: 'repeat(7, 1fr)' }, gap: 1.5 }}>
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
                                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                  : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isToday ? alpha(ACCENT, 0.6) : 'rgba(255,255,255,0.08)'}`,
                                cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', flexDirection: 'column',
                                '&:hover': { borderColor: ACCENT, transform: 'translateY(-3px)', bgcolor: 'rgba(255,255,255,0.07)' }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ color: isToday ? ACCENT : 'rgba(255,255,255,0.5)', fontWeight: 900, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                  {item.dayName}
                                </Typography>
                                {isToday && (
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ACCENT }} />
                                )}
                              </Box>
                              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', mb: 1 }}>
                                {item.challenge.title}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 600, mt: 'auto' }}>
                                {item.dateFormatted}
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
                    <Box sx={{ animation: `${slideUp} 0.3s ease` }}>
                      
                      {/* Compact Action Bar */}
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            onClick={() => setMatrixStep(2)}
                            size="small"
                            sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
                          >
                            ← Change Day
                          </Button>
                          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                          <Chip label={`🌾 ${selectedCommodity}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, fontSize: '0.72rem' }} />
                          <Chip label={`💼 ${selectedCategory.toUpperCase()}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, fontSize: '0.72rem' }} />
                          <Chip label={`📅 ${format(new Date(selectedTargetDate), 'MMM d')}`} size="small" sx={{ bgcolor: alpha(ACCENT, 0.2), color: ACCENT, fontWeight: 800, fontSize: '0.72rem' }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Button
                            onClick={handleRegenerate}
                            disabled={regenerating || loadingInsights}
                            startIcon={regenerating ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.12)', color: ACCENT, border: `1px solid ${alpha(ACCENT, 0.3)}`,
                              borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 2, py: 0.6, fontSize: '0.78rem',
                              '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.22)' }
                            }}
                          >
                            {regenerating ? "Regenerating..." : "Regenerate (50 NP)"}
                          </Button>
                          <Button
                            onClick={handleStartCustomArticle}
                            variant="outlined"
                            sx={{
                              color: '#fff', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px',
                              fontWeight: 700, textTransform: 'none', fontSize: '0.78rem', py: 0.6,
                              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.06)' }
                            }}
                          >
                            ✍️ Custom Draft
                          </Button>
                        </Box>
                      </Box>

                      {regenerateError && (
                        <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.8rem', mb: 2 }}>
                          {regenerateError}
                        </Typography>
                      )}

                      {loadingInsights ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                          <CircularProgress size={30} sx={{ color: ACCENT, mb: 1.5 }} />
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.85rem' }}>
                            Loading curated angles for {selectedCommodity}...
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
                                  p: 2.5, borderRadius: '16px',
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.07)',
                                  cursor: 'pointer', transition: 'all 0.25s',
                                  display: 'flex', flexDirection: 'column',
                                  '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                    borderColor: fMeta.color,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 24px ${alpha(fMeta.color, 0.2)}`
                                  }
                                }}
                              >
                                {/* Micro-Pills */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.2, flexWrap: 'wrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={`${fMeta.emoji} ${fMeta.label}`}
                                      size="small"
                                      sx={{ bgcolor: alpha(fMeta.color, 0.18), color: fMeta.color, fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                                    />
                                    <Chip
                                      label={`${eMeta.emoji} ${eMeta.label}`}
                                      size="small"
                                      sx={{ bgcolor: alpha(eMeta.color, 0.12), color: eMeta.color, fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                                    />
                                  </Box>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', fontWeight: 700 }}>
                                    {item.subcategoryTitle}
                                  </Typography>
                                </Box>

                                {/* Title */}
                                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.35, mb: 0.8 }}>
                                  {item.title}
                                </Typography>

                                {/* Hook */}
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.4, mb: 1.5 }}>
                                  {item.hook}
                                </Typography>

                                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: fMeta.color, fontWeight: 800, fontSize: '0.75rem', gap: 0.5 }}>
                                  Launch Blueprint <ArrowForwardIcon sx={{ fontSize: 12 }} />
                                </Box>
                              </Paper>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* NON-ARTICLE CREATORS (VIDEO / LIVE / MASTERCLASS)            */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {opt.type !== 'article' && (
                    <Box sx={{ animation: `${slideUp} 0.3s ease` }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontWeight: 600, mb: 2 }}>
                        Select category to initialize {opt.title.toLowerCase()}:
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                        {challengesData.map((c) => (
                          <Paper
                            key={c.id}
                            elevation={0}
                            onClick={() => onStartFresh(opt.type, { category: c.id, subcategory: '', timeframe: 'present' })}
                            sx={{
                              p: 2, borderRadius: '14px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              cursor: 'pointer', transition: 'all 0.2s',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: opt.accentColor, transform: 'translateY(-2px)' }
                            }}
                          >
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.88rem' }}>
                              {c.title}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}

                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* WORKSPACE CONTENT MANAGER                                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {!expandedStartType && (
        <Box sx={{ mt: 5 }}>
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
