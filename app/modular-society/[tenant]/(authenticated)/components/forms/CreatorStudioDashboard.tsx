import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, IconButton, alpha, Tooltip, CircularProgress, Button,
  Drawer, TextField, Accordion, AccordionSummary, AccordionDetails, Breadcrumbs, Link,
  Alert, AlertTitle, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Grid, Stack, Collapse, useTheme, useMediaQuery
} from '@mui/material';
import { AnimatePresence, motion, LayoutGroup, type Variants } from 'framer-motion';
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
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
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
  Favorite as FavoriteIcon,
  ThumbUp as ThumbUpIcon,
  TouchApp as TouchAppIcon,
  Visibility as VisibilityIcon,
  FlipToBack as FlipIcon,
  GridView as GridViewIcon,
  Style as DeckIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import WikiHotspot from '@/components/wiki/WikiHotspot';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import WorkspaceContentManager from '@/app/components/studio/WorkspaceContentManager';
import { usePromptAssistant } from '@/context/PromptAssistantContext';
import { useSociety } from '@/context/SocietyContext';
import { AdminArticlePromptSidePane } from './AdminArticlePromptSidePane';
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

const gridStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    }
  }
};

const cardProgressiveTiltVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
    rotateX: -18,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 340,
      damping: 24,
    }
  }
};

const START_FRESH_OPTIONS: Array<{
  type: string;
  title: string;
  value: string;
  icon: React.ReactElement;
  color: string;
  grad: string;
  readiness: 'live' | 'coming_soon';
  badge?: { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' };
}> = [
  {
    type: 'article',
    title: "Intelligence Brief",
    value: "Write",
    icon: <ArticleIcon sx={{ fontSize: 32 }} />,
    color: "#3b82f6",
    grad: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    readiness: 'live',
  },
  {
    type: 'livestream',
    title: "Schedule Livestream",
    value: "Go Live",
    icon: <LiveTvIcon sx={{ fontSize: 32 }} />,
    color: "#10b981",
    grad: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
    readiness: 'live',
  },
  {
    type: 'video',
    title: "Video Insights",
    value: "Record",
    icon: <VideoLibraryIcon sx={{ fontSize: 32 }} />,
    color: "#ef4444",
    grad: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)",
    readiness: 'coming_soon',
    badge: { label: 'COMING SOON', color: 'default' as const }
  },
  {
    type: 'class',
    title: "Masterclass",
    value: "Teach",
    icon: <SchoolIcon sx={{ fontSize: 32 }} />,
    color: "#8b5cf6",
    grad: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)",
    readiness: 'coming_soon',
    badge: { label: 'COMING SOON', color: 'default' as const }
  }
];

export const MASTER_LIVESTREAM_HUBS = [
  {
    id: 'production_foundations',
    icon: '🏗️',
    title: 'Production Foundations',
    subtitle: 'Finance, Land & Inputs',
    badge: 'Mon · Tue · Wed Pillars',
    color: '#3b82f6',
    grad: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    desc: 'Synthesizes capital access, land tenure, seeds, fertilizers, feeds & mechanization bottlenecks.',
    tags: ['Capital & Credit', 'Land Rights', 'Seeds & Inputs', 'Mechanization'],
    underlyingCategories: ['capital', 'land', 'inputs'],
    targetAudience: 'Operators, Farm Managers, Agronomists, Financial Institutions',
  },
  {
    id: 'resilience_disruption',
    icon: '⚡',
    title: 'Resilience & Disruption',
    subtitle: 'Energy, Insecurity & Risk',
    badge: 'Thu · Fri Pillars',
    color: '#ef4444',
    grad: 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)',
    desc: 'Autopsies on energy poverty, cold grid failures, insecurity, banditry, extortion & systemic shocks.',
    tags: ['Energy Poverty', 'Cold Grid', 'Food Insecurity', 'Banditry & Crime'],
    underlyingCategories: ['energy', 'insecurity'],
    targetAudience: 'Policymakers, Security Analysts, Logistics Heads, Risk Officers',
  },
  {
    id: 'markets_people_solutions',
    icon: '🤝',
    title: 'Markets, People & Solutions',
    subtitle: 'Post-Harvest, Workforce & Enterprise',
    badge: 'Sat · Sun Pillars',
    color: '#10b981',
    grad: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    desc: 'Market linkage mechanics, reducing spoilage, cold chain logistics, talent hiring & agro-enterprises.',
    tags: ['Post-Harvest Systems', 'Market Access', 'Workforce & Talent', 'Enterprise Building'],
    underlyingCategories: ['harvest-to-market', 'people'],
    targetAudience: 'Founders, Off-takers, Recruiters, Job Seekers, Agro-Processors',
  },
];

const StatTabHeader: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClose?: () => void;
}> = ({ title, value, icon, color, onClose }) => (
  <Box sx={{ p: { xs: 2.25, sm: 3 }, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <Box sx={{
      position: 'absolute',
      right: -20,
      bottom: -20,
      zIndex: 0,
      transform: 'rotate(-20deg)',
      color: alpha('#fff', 0.18),
      pointerEvents: 'none'
    }}>
      {React.isValidElement(icon) ? React.cloneElement(icon as any, { sx: { fontSize: { xs: '110px !important', sm: '140px !important' } } }) : icon}
    </Box>
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', fontSize: { xs: '1.6rem', sm: '2.1rem' }, letterSpacing: '-0.02em', lineHeight: 1.1, textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700, mt: 0.5, fontSize: '0.95rem' }}>
        {title}
      </Typography>
    </Box>
    {onClose && (
      <IconButton
        onClick={onClose}
        sx={{
          color: '#ffffff',
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          zIndex: 1,
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.35)', color: '#fff' }
        }}
      >
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>
    )}
  </Box>
);

const FreshCard: React.FC<{
  opt: (typeof START_FRESH_OPTIONS)[number];
  onClick: () => void;
  compact?: boolean;
}> = ({ opt, onClick, compact }) => {
  const isLive = opt.readiness === 'live';
  return (
    <motion.div
      layoutId={`stat-card-container-${opt.type}`}
      style={{ height: '100%', cursor: isLive ? 'pointer' : 'not-allowed' }}
      onClick={onClick}
    >
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          width: compact ? 180 : '100%',
          borderRadius: compact ? '16px' : '20px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          background: opt.grad,
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `0 10px 25px -5px ${alpha(opt.color, 0.4)}, 0 4px 10px -4px ${alpha(opt.color, 0.25)}`,
          opacity: isLive ? 1 : 0.65,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': isLive ? {
            transform: 'translateY(-4px)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
            boxShadow: `0 16px 36px -6px ${alpha(opt.color, 0.55)}, 0 0 24px ${alpha(opt.color, 0.25)}`,
          } : {}
        }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden', p: compact ? 1.75 : 2.5, height: '100%' }}>
          <Box sx={{
            position: 'absolute',
            right: -20,
            bottom: -20,
            zIndex: 0,
            transform: 'rotate(-20deg)',
            color: alpha('#fff', 0.18),
            pointerEvents: 'none'
          }}>
            {React.cloneElement(opt.icon as React.ReactElement<{ sx?: any }>, {
              sx: { fontSize: compact ? '70px !important' : '100px !important' }
            })}
          </Box>

          <Stack sx={{ zIndex: 1, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h4" sx={{
                color: '#ffffff',
                fontWeight: 900,
                fontSize: compact ? '1.15rem' : { xs: '1.45rem', sm: '1.75rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.18)'
              }}>
                {opt.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {opt.badge && (
                  <Chip
                    label={compact && opt.badge.label === 'COMING SOON' ? 'SOON' : opt.badge.label}
                    size="small"
                    sx={{
                      fontWeight: 'bold',
                      height: compact ? 18 : 22,
                      fontSize: compact ? '0.55rem' : '0.625rem',
                      letterSpacing: '0.04em',
                      bgcolor: 'rgba(255, 255, 255, 0.22)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                )}
                {!compact && (
                  <Box sx={{ color: 'rgba(255, 255, 255, 0.85)', '& svg': { color: 'rgba(255, 255, 255, 0.85)' } }}>
                    <WikiHotspot id={`learn-start-fresh-${opt.type}`} label={opt.title} />
                  </Box>
                )}
              </Box>
            </Box>
            <Typography variant="body2" sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 700,
              fontSize: compact ? '0.8rem' : '0.875rem',
              whiteSpace: compact ? 'nowrap' : 'normal',
              overflow: compact ? 'hidden' : 'visible',
              textOverflow: compact ? 'ellipsis' : 'clip'
            }}>
              {opt.title}
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </motion.div>
  );
};

const SPECTRUM_CONFIG: Record<string, { label: string; shortLabel: string; color: string; emoji: string; bg: string }> = {
  '1': { label: 'The Bleeding Neck', shortLabel: '#1 Bleeding Neck', color: '#2563eb', emoji: '🔵', bg: 'rgba(37, 99, 235, 0.15)' },
  '2': { label: 'Institutional Pivot', shortLabel: '#2 Institutional Pivot', color: '#f59e0b', emoji: '🟡', bg: 'rgba(245, 158, 11, 0.15)' },
  '3': { label: 'The Grassroots Hack', shortLabel: '#3 Grassroots Hack', color: '#10b981', emoji: '🌱', bg: 'rgba(16, 185, 129, 0.15)' },
  '4': { label: 'The R&D Horizon', shortLabel: '#4 R&D Horizon', color: '#0284c7', emoji: '🔬', bg: 'rgba(2, 132, 199, 0.15)' },
  '5': { label: 'The Macro Threat', shortLabel: '#5 Macro Threat', color: '#ef4444', emoji: '🔴', bg: 'rgba(239, 68, 68, 0.15)' },
  '6': { label: 'The Black Swan', shortLabel: '#6 Black Swan', color: '#9333ea', emoji: '🟣', bg: 'rgba(147, 51, 234, 0.15)' },
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

function getFlowSentence(
  spectrumRank?: string,
  formatName?: string,
  subcategoryTitle?: string,
  actorName?: string
): string {
  const key = getSpectrumKey(spectrumRank);
  const articleType = (formatName || 'brief').toLowerCase();
  const subcategory = subcategoryTitle ? `in ${subcategoryTitle}` : 'across key operational segments';
  const cleanActor = (actorName && actorName.trim()) ? actorName.trim() : 'key value chain operators';
  const actorStr = cleanActor.toLowerCase().startsWith('for ') ? cleanActor : `for ${cleanActor}`;

  let flowTheme = 'practical operator workarounds, survival tactics, and informal hacks';
  if (key === '1') {
    flowTheme = 'urgent shortages, price shocks, and immediate pain points';
  } else if (key === '2') {
    flowTheme = 'corporate capital allocations, policy shifts, and institutional pivots';
  } else if (key === '3') {
    flowTheme = 'practical operator workarounds, survival tactics, and informal hacks';
  } else if (key === '4') {
    flowTheme = 'biological innovations, agronomy breakthroughs, and yield tech science';
  } else if (key === '5') {
    flowTheme = 'cross-border currency dynamics, regional tariffs, and systemic climate risks';
  } else if (key === '6') {
    flowTheme = 'unforeseen outlier disruptions, black swans, and radical industry ruptures';
  }

  return `This ${articleType} explores the ${flowTheme} ${subcategory} ${actorStr}.`;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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
  const [showAllCommodities, setShowAllCommodities] = useState(false);
  const isInitialOpenRef = useRef(true);
  
  // Step 3 Insights State
  const [insights, setInsights] = useState<ArticleInsightItem[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [spectrumFilter, setSpectrumFilter] = useState<string>('all');
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [hasLaunchedAssistant, setHasLaunchedAssistant] = useState(false);

  // Tinder-style Deck State
  const [deckActiveIndex, setDeckActiveIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [bookmarkedBriefIds, setBookmarkedBriefIds] = useState<Record<string, boolean>>({});

  const displayCards = useMemo(() => {
    if (!insights || !insights.length) return [];
    return [
      ...insights,
      {
        id: 'deck-end-retry-card',
        isRetryCard: true,
        title: 'All Editorial Briefs Reviewed',
      } as any,
    ];
  }, [insights]);

  const totalDeckCards = displayCards.length;
  const currentDeckItem = displayCards[deckActiveIndex] || displayCards[0] || null;
  const isCurrentRetryCard = Boolean(currentDeckItem?.isRetryCard);
  const currentItem = isCurrentRetryCard ? (insights[0] || currentDeckItem) : currentDeckItem;

  const handleNextCard = useCallback(() => {
    setIsCardFlipped(false);
    setDeckActiveIndex((prev) => Math.min(prev + 1, Math.max(0, displayCards.length - 1)));
  }, [displayCards.length]);

  const handlePrevCard = useCallback(() => {
    setIsCardFlipped(false);
    setDeckActiveIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleRestartDeck = useCallback(() => {
    setIsCardFlipped(false);
    setDeckActiveIndex(0);
  }, []);

  const isFirstCard = deckActiveIndex === 0;
  const isLastCard = deckActiveIndex >= totalDeckCards - 1;

  // Society Profile & Admin Gating
  const { profile } = useSociety();
  const isAdmin = Boolean(profile?.isAdmin || profile?.roles?.includes('admin' as any) || profile?.roles?.includes('super_admin' as any));
  const [isAdminSidePaneOpen, setIsAdminSidePaneOpen] = useState(false);

  const handleAdminIngest = useCallback((newBriefs: any[]) => {
    if (newBriefs && newBriefs.length > 0) {
      setInsights(newBriefs);
      if (typeof window !== 'undefined') {
        const key = `editorial_ingested_briefs_${selectedCommodity}_${selectedCategory}`;
        localStorage.setItem(key, JSON.stringify(newBriefs));
      }
    }
  }, [selectedCommodity, selectedCategory]);


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

  // Hydrate insights strictly for the active (commodity x category) pair
  useEffect(() => {
    if (matrixStep === 3 && selectedCommodity && selectedCategory) {
      if (typeof window !== 'undefined') {
        const key = `editorial_ingested_briefs_${selectedCommodity}_${selectedCategory}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setInsights(parsed);
              return;
            }
          } catch {}
        }
      }
    }
  }, [matrixStep, selectedCommodity, selectedCategory]);

  // Non-article legacy wizard state
  const [legacyCategory, setLegacyCategory] = useState('');
  const [legacySubcategory, setLegacySubcategory] = useState('');

  const activeOption = START_FRESH_OPTIONS.find(o => o.type === expandedStartType);

  // ═══════════════════════════════════════════════════════════
  // LIVESTREAM 3-STEP WIZARD STATE (3 MASTER CATEGORY HUBS)
  // ═══════════════════════════════════════════════════════════
  const [lsStep, setLsStep] = useState<1 | 2 | 3>(1);
  const [lsEngine, setLsEngine] = useState<'production_foundations' | 'resilience_disruption' | 'markets_people_solutions' | 'the_breakdown' | 'the_masterclass' | 'the_opportunity_desk' | string | null>(null);
  const [lsAnchorArticleId, setLsAnchorArticleId] = useState<string | null>(null);
  const [lsAnchorJobIds, setLsAnchorJobIds] = useState<string[]>([]);
  const [lsArticleSearch, setLsArticleSearch] = useState('');
  
  // Real DB state
  const [lsArticles, setLsArticles] = useState<any[]>([]);
  const [lsJobs, setLsJobs] = useState<any[]>([]);
  const [lsLoadingDB, setLsLoadingDB] = useState(false);

  const activeLsHub = useMemo(() => {
    return MASTER_LIVESTREAM_HUBS.find(h => h.id === lsEngine) || MASTER_LIVESTREAM_HUBS[0];
  }, [lsEngine]);

  const selectedAnchorArticle = useMemo(() => {
    return lsArticles.find(a => a.id === lsAnchorArticleId) || null;
  }, [lsArticles, lsAnchorArticleId]);

  const filteredLsArticles = useMemo(() => {
    if (!lsArticleSearch.trim()) return lsArticles;
    const q = lsArticleSearch.toLowerCase().trim();
    return lsArticles.filter(a => 
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.description && a.description.toLowerCase().includes(q)) ||
      (a.authorName && a.authorName.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q)) ||
      (a.subcategory && a.subcategory.toLowerCase().includes(q))
    );
  }, [lsArticles, lsArticleSearch]);

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
  const fetchInsightsForMatrixSlot = useCallback(async (dateStr: string, commOverride?: string, catOverride?: string) => {
    const activeCommodity = commOverride || selectedCommodity;
    const activeCat = catOverride || selectedCategory;

    setLoadingInsights(true);
    setRegenerateError(null);
    setInsights([]);
    setRawPrompts(null);
    setDeckActiveIndex(0);
    setIsCardFlipped(false);

    // 1. Check local storage first for this specific pair
    if (typeof window !== 'undefined') {
      const key = `editorial_ingested_briefs_${activeCommodity}_${activeCat}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInsights(parsed);
            setDeckActiveIndex(0);
            setIsCardFlipped(false);
            setLoadingInsights(false);
            return;
          }
        } catch {}
      }
    }

    try {
      const res = await getDailyEditorialIntel(dateStr, activeCommodity, activeCat);
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
  }, [selectedCommodity, selectedCategory]);

  const handleOpenCreator = (type: string) => {
    setExpandedStartType(type);
    setInsights([]);
    setRawPrompts(null);
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
    isInitialOpenRef.current = true;
    setShowAllCommodities(false);
    setMatrixStep(1);
    setLsStep(1);
    setInsights([]);
    setRawPrompts(null);
    setLegacyCategory('');
    setLegacySubcategory('');
  };

  useEffect(() => {
    if (expandedStartType) {
      const timer = setTimeout(() => {
        isInitialOpenRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    } else {
      isInitialOpenRef.current = true;
    }
  }, [expandedStartType]);

  const handleSelectCommodityAndWeek = (week: number, commodity: string) => {
    setSelectedWeek(week);
    setSelectedCommodity(commodity);
    setInsights([]);
    setRawPrompts(null);
    setFocusedDayIdx(0);
    setMatrixStep(2);
  };

  const handleSelectDayCategory = (catId: string, dayDate: Date) => {
    setSelectedCategory(catId);
    setInsights([]);
    setRawPrompts(null);
    const isoDate = dayDate.toISOString();
    setSelectedTargetDate(isoDate);
    setMatrixStep(3);
    fetchInsightsForMatrixSlot(isoDate, selectedCommodity, catId);
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

  const handleClearSavedBriefs = useCallback(() => {
    if (typeof window !== 'undefined') {
      const key = `editorial_ingested_briefs_${selectedCommodity}_${selectedCategory}`;
      const scratchKey = `editorial_sop_scratchpad_${selectedCommodity}_${selectedCategory}`;
      const tasksKey = `editorial_sop_tasks_${selectedCommodity}_${selectedCategory}`;
      localStorage.removeItem(key);
      localStorage.removeItem(scratchKey);
      localStorage.removeItem(tasksKey);
    }
    setInsights([]);
    setRawPrompts(null);
    setHasLaunchedAssistant(false);
  }, [selectedCommodity, selectedCategory]);

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

  // Set Step 2 active day into focused view
  useEffect(() => {
    if (matrixStep === 2) {
      const todayFormatted = format(currentDate, 'yyyy-MM-dd');
      const todayIdx = weekDays.findIndex(d => format(d.date, 'yyyy-MM-dd') === todayFormatted);
      const targetIdx = todayIdx !== -1 ? todayIdx : 0;
      setFocusedDayIdx(targetIdx);
    }
  }, [matrixStep, selectedWeek, selectedYear]);

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
        <Typography variant="h3" sx={{ fontFamily: 'Caveat, cursive', color: ACCENT, mb: 0.5, fontSize: { xs: '1.7rem', sm: '2.7rem', md: '3.2rem' } }}>
          Good {greeting}, {userName || 'Creator'}.
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 1.5, color: '#1e293b', fontSize: { xs: '1.35rem', sm: '1.9rem', md: '2.3rem' } }}>
          Welcome to the Studio
        </Typography>
        <Chip
          label={`${drafts.length} active draft${drafts.length !== 1 ? 's' : ''} in your workspace`}
          size="small"
          sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: 'text.secondary', fontWeight: 600, borderRadius: '8px' }}
        />
      </Box>

      {/* ================================================================ */}
      {/* ================================================================ */}
      {/* START FRESH CARDS                                                */}
      {/* ================================================================ */}
      <LayoutGroup id="creator-studio-hub">
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
            Start Fresh
          </Typography>

          {expandedStartType ? (
            <Box sx={{
              overflowX: 'auto',
              pb: 1,
              mx: -2,
              px: 2,
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              mb: 2
            }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  minWidth: 'min-content',
                  mx: 'auto'
                }}
              >
                {START_FRESH_OPTIONS.map((opt) => {
                  const isActive = opt.type === expandedStartType;
                  return (
                    <Box
                      key={opt.type}
                      sx={{ transform: 'scale(0.85)', flexShrink: 0 }}
                    >
                      {isActive ? (
                        <Box onClick={handleClose} sx={{ cursor: 'pointer' }}>
                          <Paper
                            elevation={0}
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '50%',
                              bgcolor: alpha(opt.color, 0.15),
                              border: `2px solid ${opt.color}`,
                              boxShadow: `0 4px 14px ${alpha(opt.color, 0.25)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: alpha(opt.color, 0.25),
                                transform: 'scale(1.08)'
                              }
                            }}
                          >
                            <KeyboardArrowUpIcon sx={{ color: opt.color, fontSize: 24 }} />
                          </Paper>
                        </Box>
                      ) : (
                        <FreshCard
                          opt={opt}
                          compact
                          onClick={() => {
                            if (opt.readiness === 'live') {
                              handleOpenCreator(opt.type);
                            }
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
              {START_FRESH_OPTIONS.map((opt) => (
                <Grid key={opt.type} size={{ xs: 12, sm: 6, md: 3 }}>
                  <FreshCard
                    opt={opt}
                    onClick={() => {
                      if (opt.readiness === 'live') {
                        handleOpenCreator(opt.type);
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* EXPANDED CONTENT CONTAINER */}
        <Box sx={{ position: 'relative', mt: 2, minHeight: expandedStartType ? '60vh' : 0 }}>
          <AnimatePresence mode="popLayout">
            {expandedStartType && (() => {
              const activeOpt = START_FRESH_OPTIONS.find(o => o.type === expandedStartType);
              if (!activeOpt) return null;

              return (
                <motion.div
                  key={activeOpt.type}
                  layoutId={`stat-card-container-${activeOpt.type}`}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40, transition: { duration: 0.25 } }}
                  transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      borderRadius: { xs: '20px', sm: '28px' },
                      background: activeOpt.grad,
                      boxShadow: `0 24px 50px -10px ${alpha(activeOpt.color, 0.45)}, 0 10px 20px -8px ${alpha(activeOpt.color, 0.3)}`,
                      position: 'relative',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.2)',
                      mb: 6
                    }}
                  >
                    <StatTabHeader
                      title={activeOpt.title}
                      value={activeOpt.value}
                      icon={activeOpt.icon}
                      color={activeOpt.color}
                      onClose={handleClose}
                    />

                    <Collapse in={true} timeout={400}>
                      {/* Active Wizard Canvas: Clean Frosted Glass (Light Mode) */}
                      <Box sx={{
                        p: { xs: 2.5, sm: 3.5, md: 4.5 },
                        m: { xs: 1.5, sm: 2 },
                        mt: 0,
                        borderRadius: { xs: '16px', sm: '20px' },
                        bgcolor: 'rgba(255, 255, 255, 0.96)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)',
                        position: 'relative',
                        zIndex: 1,
                        color: '#0f172a'
                      }}>
                  
                  {expandedStartType === 'livestream' ? (
                    // ───────────────────────────────────────────────────────────
                    // LIVESTREAM 3-STEP WIZARD
                    // ───────────────────────────────────────────────────────────
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {lsStep > 1 && (
                              <IconButton
                                onClick={() => setLsStep((lsStep - 1) as any)}
                                size="small"
                                sx={{
                                  color: '#0f172a',
                                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                                  border: '1px solid rgba(0, 0, 0, 0.1)',
                                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' }
                                }}
                              >
                                <ArrowBackIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            )}
                            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: alpha(activeOpt.color, 0.12), color: activeOpt.color }}>
                              {activeOpt.icon}
                            </Box>
                            <Box>
                              <Typography sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Livestream Broadcast Studio
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.2 }}>
                                {lsStep === 1 && "1. Select Master Category Hub"}
                                {lsStep === 2 && "2. Anchor Published Research"}
                                {lsStep === 3 && "3. Attach Anchor Jobs & Finalize"}
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
                                    bgcolor: lsStep === stepNum ? (activeLsHub?.color || activeOpt.color) : lsStep > stepNum ? alpha(activeLsHub?.color || activeOpt.color, 0.15) : 'rgba(0, 0, 0, 0.06)',
                                    color: lsStep === stepNum ? '#fff' : lsStep > stepNum ? (activeLsHub?.color || activeOpt.color) : '#64748b',
                                    fontSize: '0.75rem', fontWeight: 800,
                                    cursor: stepNum < lsStep ? 'pointer' : 'default',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {stepNum}
                                </Box>
                              ))}
                            </Box>
                            <Button onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ minWidth: 0, p: 1, borderRadius: '12px', color: '#64748b', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: '#0f172a' } }}>✕</Button>
                          </Box>
                       </Box>

                       {/* STEP 1: 3 MASTER CATEGORY HUBS */}
                       {lsStep === 1 && (
                         <Box>
                           <Typography sx={{ color: '#475569', fontWeight: 500, mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                             Choose one of the <strong>3 Master Category Hubs</strong> for your broadcast. This dynamically filters published research across connected value-chain pillars.
                           </Typography>
                           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: { xs: 2.5, sm: 3 } }}>
                             {MASTER_LIVESTREAM_HUBS.map(hub => (
                               <Paper
                                 key={hub.id}
                                 onClick={() => {
                                   setLsEngine(hub.id);
                                   setLsAnchorArticleId(null);
                                   setLsStep(2);
                                 }}
                                 sx={{
                                   p: { xs: 2.5, sm: 3 },
                                   borderRadius: '20px',
                                   bgcolor: '#ffffff',
                                   border: '1.5px solid rgba(0, 0, 0, 0.08)',
                                   boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                                   cursor: 'pointer',
                                   transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                   display: 'flex',
                                   flexDirection: 'column',
                                   justifyContent: 'space-between',
                                   position: 'relative',
                                   overflow: 'hidden',
                                   '&:hover': {
                                     bgcolor: '#ffffff',
                                     transform: 'translateY(-5px)',
                                     borderColor: hub.color,
                                     boxShadow: `0 16px 36px -6px rgba(0, 0, 0, 0.12), 0 0 20px ${alpha(hub.color, 0.2)}`
                                   },
                                   '&::before': {
                                     content: '""',
                                     position: 'absolute',
                                     top: 0,
                                     left: 0,
                                     right: 0,
                                     height: '4px',
                                     bgcolor: hub.color
                                   }
                                 }}
                               >
                                 <Box>
                                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                     <Chip
                                       label={hub.badge}
                                       size="small"
                                       sx={{
                                         bgcolor: alpha(hub.color, 0.1),
                                         color: hub.color,
                                         fontWeight: 900,
                                         fontSize: '0.72rem',
                                         height: 24,
                                         borderRadius: '999px',
                                         border: `1px solid ${alpha(hub.color, 0.25)}`
                                       }}
                                     />
                                     <Typography sx={{ fontSize: '1.8rem' }}>{hub.icon}</Typography>
                                   </Box>

                                   <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: { xs: '1.15rem', sm: '1.3rem' }, lineHeight: 1.25, mb: 0.5 }}>
                                     {hub.title}
                                   </Typography>
                                   <Typography sx={{ color: hub.color, fontWeight: 800, fontSize: '0.85rem', mb: 1.5 }}>
                                     {hub.subtitle}
                                   </Typography>
                                   <Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '0.84rem', lineHeight: 1.5, mb: 2 }}>
                                     {hub.desc}
                                   </Typography>
                                 </Box>

                                 <Box>
                                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                                     {hub.tags.map(t => (
                                       <Chip
                                         key={t}
                                         label={t}
                                         size="small"
                                         sx={{
                                           bgcolor: 'rgba(0, 0, 0, 0.04)',
                                           color: '#475569',
                                           fontSize: '0.7rem',
                                           fontWeight: 700,
                                           border: '1px solid rgba(0, 0, 0, 0.06)'
                                         }}
                                       />
                                     ))}
                                   </Box>

                                   <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                     <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700 }}>
                                       Audience: {hub.targetAudience.split(',')[0]}
                                     </Typography>
                                     <Box sx={{ color: hub.color, display: 'flex', alignItems: 'center' }}>
                                       <ArrowForwardArrow sx={{ fontSize: 18 }} />
                                     </Box>
                                   </Box>
                                 </Box>
                               </Paper>
                             ))}
                           </Box>
                         </Box>
                       )}

                       {/* STEP 2: ANCHOR RESEARCH ARTICLE */}
                       {lsStep === 2 && (
                         <Box sx={{ minHeight: 350 }}>
                           {/* Step 2 Top Bar with Back Action & Active Hub Header */}
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, pb: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)', flexWrap: 'wrap', gap: 1.5 }}>
                             <Button
                               size="small"
                               onClick={() => setLsStep(1)}
                               startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
                               sx={{
                                 color: '#475569',
                                 bgcolor: 'rgba(0, 0, 0, 0.05)',
                                 fontWeight: 800,
                                 fontSize: '0.82rem',
                                 textTransform: 'none',
                                 borderRadius: '999px',
                                 px: 2,
                                 py: 0.5,
                                 '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.09)', color: '#0f172a' }
                               }}
                             >
                               Change Hub
                             </Button>

                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <Chip
                                 label={`${activeLsHub.icon} ${activeLsHub.title}`}
                                 sx={{
                                   bgcolor: alpha(activeLsHub.color, 0.12),
                                   color: activeLsHub.color,
                                   fontWeight: 900,
                                   fontSize: '0.82rem',
                                   border: `1px solid ${alpha(activeLsHub.color, 0.3)}`
                                 }}
                               />
                               <Chip
                                 label={activeLsHub.subtitle}
                                 size="small"
                                 sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: '#475569', fontWeight: 700, fontSize: '0.75rem', display: { xs: 'none', sm: 'inline-flex' } }}
                               />
                             </Box>
                           </Box>

                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                             <Box>
                               <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
                                 Select Anchor Research Article
                               </Typography>
                               <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                 Found {lsArticles.length} published research articles in the <strong>{activeLsHub.title}</strong> ecosystem.
                               </Typography>
                             </Box>

                             <TextField
                               size="small"
                               placeholder="Search articles..."
                               value={lsArticleSearch}
                               onChange={(e) => setLsArticleSearch(e.target.value)}
                               sx={{
                                 width: { xs: '100%', sm: 260 },
                                 '& .MuiOutlinedInput-root': {
                                   borderRadius: '12px',
                                   bgcolor: '#ffffff',
                                   fontSize: '0.86rem'
                                 }
                               }}
                             />
                           </Box>

                           {/* ARTICLES LIST */}
                           {lsLoadingDB ? (
                             <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                               <CircularProgress size={36} sx={{ color: activeLsHub.color }} />
                               <Typography sx={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                                 Curating research articles for {activeLsHub.title}...
                               </Typography>
                             </Box>
                           ) : filteredLsArticles.length === 0 ? (
                             <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px', bgcolor: '#f8fafc', border: '1px dashed rgba(0,0,0,0.15)' }}>
                               <Typography sx={{ color: '#64748b', fontWeight: 700, mb: 1 }}>
                                 No published articles matched your search filter.
                               </Typography>
                               <Button size="small" onClick={() => setLsArticleSearch('')} sx={{ color: activeLsHub.color, fontWeight: 800, textTransform: 'none' }}>
                                 Clear Search Filter
                               </Button>
                             </Paper>
                           ) : (
                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
                               {filteredLsArticles.map((art) => {
                                 const isSelected = lsAnchorArticleId === art.id;
                                 return (
                                   <Paper
                                     key={art.id}
                                     onClick={() => setLsAnchorArticleId(isSelected ? null : art.id)}
                                     sx={{
                                       p: { xs: 2, sm: 2.25 },
                                       borderRadius: '16px',
                                       bgcolor: isSelected ? alpha(activeLsHub.color, 0.05) : '#ffffff',
                                       border: '2px solid',
                                       borderColor: isSelected ? activeLsHub.color : 'rgba(0, 0, 0, 0.08)',
                                       boxShadow: isSelected ? `0 8px 24px ${alpha(activeLsHub.color, 0.18)}` : '0 2px 6px rgba(0, 0, 0, 0.03)',
                                       cursor: 'pointer',
                                       transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'space-between',
                                       gap: 2,
                                       '&:hover': {
                                         bgcolor: isSelected ? alpha(activeLsHub.color, 0.08) : '#f8fafc',
                                         borderColor: activeLsHub.color,
                                         transform: 'translateY(-2px)'
                                       }
                                     }}
                                   >
                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                                       {/* Radio Indicator */}
                                       <Box
                                         sx={{
                                           width: 22,
                                           height: 22,
                                           borderRadius: '50%',
                                           border: '2px solid',
                                           borderColor: isSelected ? activeLsHub.color : '#cbd5e1',
                                           bgcolor: isSelected ? activeLsHub.color : 'transparent',
                                           display: 'flex',
                                           alignItems: 'center',
                                           justifyContent: 'center',
                                           flexShrink: 0,
                                           transition: 'all 0.2s ease'
                                         }}
                                       >
                                         {isSelected && <CheckIcon sx={{ fontSize: 14, color: '#ffffff' }} />}
                                       </Box>

                                       <Box sx={{ flex: 1, minWidth: 0 }}>
                                         <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '0.94rem', sm: '1.05rem' }, lineHeight: 1.3, mb: 0.5 }}>
                                           {art.title}
                                         </Typography>
                                         {art.description && (
                                           <Typography
                                             sx={{
                                               color: '#64748b',
                                               fontSize: '0.82rem',
                                               lineHeight: 1.4,
                                               display: '-webkit-box',
                                               WebkitLineClamp: 2,
                                               WebkitBoxOrient: 'vertical',
                                               overflow: 'hidden',
                                               mb: 0.75
                                             }}
                                           >
                                             {art.description}
                                           </Typography>
                                         )}
                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                           <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', fontWeight: 600 }}>
                                             By {art.organization?.name || art.authorName || 'FoodNerve Intelligence'}
                                           </Typography>
                                           {art.timeframe && (
                                             <Chip
                                               label={art.timeframe.toUpperCase()}
                                               size="small"
                                               sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.04)', color: '#475569' }}
                                             />
                                           )}
                                         </Box>
                                       </Box>
                                     </Box>

                                     <Chip
                                       label={art.subcategory || art.category || 'Research'}
                                       size="small"
                                       sx={{
                                         bgcolor: alpha(activeLsHub.color, 0.1),
                                         color: activeLsHub.color,
                                         fontWeight: 800,
                                         textTransform: 'capitalize',
                                         fontSize: '0.74rem',
                                         flexShrink: 0
                                       }}
                                     />
                                   </Paper>
                                 );
                               })}
                             </Box>
                           )}

                           {/* Bottom Action Bar */}
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, pt: 2.5, borderTop: '1px solid rgba(0, 0, 0, 0.08)', flexWrap: 'wrap', gap: 1.5 }}>
                             <Button
                               variant="text"
                               onClick={() => {
                                 setLsAnchorArticleId(null);
                                 setLsStep(3);
                               }}
                               sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.84rem', textTransform: 'none' }}
                             >
                               Skip Article (Create Open Broadcast)
                             </Button>

                             <Button
                               variant="contained"
                               onClick={() => setLsStep(3)}
                               endIcon={<ArrowForwardArrow sx={{ fontSize: 16 }} />}
                               sx={{
                                 bgcolor: activeLsHub.color,
                                 color: '#ffffff',
                                 fontWeight: 900,
                                 fontSize: '0.9rem',
                                 px: 3.5,
                                 py: 1.2,
                                 borderRadius: '12px',
                                 textTransform: 'none',
                                 boxShadow: `0 6px 20px ${alpha(activeLsHub.color, 0.35)}`,
                                 '&:hover': {
                                   bgcolor: activeLsHub.color,
                                   opacity: 0.9,
                                   transform: 'translateY(-1px)'
                                 }
                               }}
                             >
                               {lsAnchorArticleId ? 'Continue with Selected Article →' : 'Continue to Attach Jobs →'}
                             </Button>
                           </Box>
                         </Box>
                       )}

                       {/* STEP 3: ATTACH ANCHOR JOBS & FINALIZE */}
                       {lsStep === 3 && (
                         <Box sx={{ minHeight: 350 }}>
                           {/* Step 3 Top Bar with Back Action & Summary Header */}
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, pb: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)', flexWrap: 'wrap', gap: 1.5 }}>
                             <Button
                               size="small"
                               onClick={() => setLsStep(2)}
                               startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
                               sx={{
                                 color: '#475569',
                                 bgcolor: 'rgba(0, 0, 0, 0.05)',
                                 fontWeight: 800,
                                 fontSize: '0.82rem',
                                 textTransform: 'none',
                                 borderRadius: '999px',
                                 px: 2,
                                 py: 0.5,
                                 '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.09)', color: '#0f172a' }
                               }}
                             >
                               Back to Articles
                             </Button>

                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                               <Chip
                                 label={`${activeLsHub.icon} ${activeLsHub.title}`}
                                 sx={{
                                   bgcolor: alpha(activeLsHub.color, 0.12),
                                   color: activeLsHub.color,
                                   fontWeight: 900,
                                   fontSize: '0.82rem',
                                   border: `1px solid ${alpha(activeLsHub.color, 0.3)}`
                                 }}
                               />
                               {selectedAnchorArticle ? (
                                 <Chip
                                   label={`⚓ ${selectedAnchorArticle.title.slice(0, 28)}...`}
                                   size="small"
                                   sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: '#0f172a', fontWeight: 800, fontSize: '0.75rem' }}
                                 />
                               ) : (
                                 <Chip
                                   label="Freeform Thesis"
                                   size="small"
                                   sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: '#64748b', fontWeight: 700, fontSize: '0.75rem' }}
                                 />
                               )}
                             </Box>
                           </Box>

                           <Box sx={{ mb: 2 }}>
                             <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
                               Attach Anchor Jobs (Optional)
                             </Typography>
                             <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                               Select open roles from the talent exchange to feature during your broadcast's Talent Liquidity close.
                             </Typography>
                           </Box>

                           {/* JOBS GRID */}
                           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3, maxHeight: 300, overflowY: 'auto', pr: 0.5 }}>
                             {lsLoadingDB ? (
                               <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', gridColumn: '1 / -1' }}>
                                 <CircularProgress size={32} sx={{ color: activeLsHub.color }} />
                               </Box>
                             ) : lsJobs.length === 0 ? (
                               <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '12px', bgcolor: '#f8fafc', gridColumn: '1 / -1', border: '1px dashed rgba(0,0,0,0.1)' }}>
                                 <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                   No active jobs currently available in the global talent exchange.
                                 </Typography>
                               </Paper>
                             ) : (
                               lsJobs.map(job => {
                                 const isJobSelected = lsAnchorJobIds.includes(job.id);
                                 return (
                                   <Paper
                                     key={job.id}
                                     onClick={() => setLsAnchorJobIds(prev => prev.includes(job.id) ? prev.filter(x => x !== job.id) : [...prev, job.id])}
                                     sx={{
                                       p: 2,
                                       borderRadius: '14px',
                                       bgcolor: isJobSelected ? alpha(activeLsHub.color, 0.08) : '#ffffff',
                                       border: '1.5px solid',
                                       borderColor: isJobSelected ? activeLsHub.color : 'rgba(0, 0, 0, 0.08)',
                                       boxShadow: isJobSelected ? `0 4px 14px ${alpha(activeLsHub.color, 0.15)}` : '0 2px 6px rgba(0,0,0,0.03)',
                                       cursor: 'pointer',
                                       transition: 'all 0.2s ease',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'space-between',
                                       gap: 1.5,
                                       '&:hover': {
                                         bgcolor: isJobSelected ? alpha(activeLsHub.color, 0.12) : '#f8fafc',
                                         borderColor: activeLsHub.color
                                       }
                                     }}
                                   >
                                     <Box sx={{ minWidth: 0, flex: 1 }}>
                                       <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.3 }}>
                                         {job.title}
                                       </Typography>
                                       <Typography sx={{ color: '#64748b', fontSize: '0.78rem', mt: 0.25 }}>
                                         {job.organization?.name || 'Agro Enterprise'}
                                       </Typography>
                                     </Box>
                                     <Box
                                       sx={{
                                         width: 20,
                                         height: 20,
                                         borderRadius: '6px',
                                         border: '1.5px solid',
                                         borderColor: isJobSelected ? activeLsHub.color : '#cbd5e1',
                                         bgcolor: isJobSelected ? activeLsHub.color : 'transparent',
                                         display: 'flex',
                                         alignItems: 'center',
                                         justifyContent: 'center',
                                         flexShrink: 0
                                       }}
                                     >
                                       {isJobSelected && <CheckIcon sx={{ fontSize: 13, color: '#ffffff' }} />}
                                     </Box>
                                   </Paper>
                                 );
                               })
                             )}
                           </Box>

                           {/* Launch Studio Button & Summary */}
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, pt: 2.5, borderTop: '1px solid rgba(0, 0, 0, 0.08)', flexWrap: 'wrap', gap: 2 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <Chip
                                 label={`${lsAnchorJobIds.length} Job${lsAnchorJobIds.length !== 1 ? 's' : ''} Attached`}
                                 size="small"
                                 sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: '#475569', fontWeight: 700 }}
                               />
                             </Box>

                             <Button
                               variant="contained"
                               onClick={() => {
                                 onStartFresh(
                                   'livestream',
                                   {
                                     lsEngine,
                                     lsAnchorArticleId,
                                     lsAnchorJobIds,
                                     category: activeLsHub.underlyingCategories[0],
                                     subcategory: '',
                                     timeframe: 'present'
                                   },
                                   {
                                     title: selectedAnchorArticle?.title ? `${selectedAnchorArticle.title} — Livestream` : `${activeLsHub.title} Broadcast`,
                                     description: selectedAnchorArticle?.description || `Livestream broadcast focusing on ${activeLsHub.subtitle}.`,
                                     category: activeLsHub.underlyingCategories[0]
                                   }
                                 );
                               }}
                               sx={{
                                 bgcolor: activeLsHub.color,
                                 color: '#ffffff',
                                 fontWeight: 900,
                                 fontSize: '0.95rem',
                                 py: 1.4,
                                 px: 4,
                                 borderRadius: '14px',
                                 textTransform: 'none',
                                 boxShadow: `0 8px 24px ${alpha(activeLsHub.color, 0.35)}`,
                                 transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                 '&:hover': {
                                   bgcolor: activeLsHub.color,
                                   opacity: 0.95,
                                   transform: 'translateY(-2px)',
                                   boxShadow: `0 12px 30px ${alpha(activeLsHub.color, 0.45)}`
                                 }
                               }}
                             >
                               🚀 Launch Livestream Studio
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
                                color: '#0f172a',
                                bgcolor: 'rgba(0, 0, 0, 0.05)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' }
                              }}
                            >
                              <ArrowBackIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                          <Box sx={{ p: 1, borderRadius: '12px', bgcolor: alpha(activeOpt.color, 0.12), color: activeOpt.color }}>
                            {activeOpt.icon}
                          </Box>
                          <Box>
                            {matrixStep === 3 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                <Typography sx={{ color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.85rem' }, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  🔥 Trending Titles for
                                </Typography>
                                <Box component="span" sx={{ color: ACCENT, fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.9rem' }, px: 1, py: 0.2, bgcolor: alpha(ACCENT, 0.12), borderRadius: '8px', border: `1px solid ${alpha(ACCENT, 0.3)}`, lineHeight: 1.2 }}>
                                  {selectedCommodity}
                                </Box>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: 'rgba(0, 0, 0, 0.04)', px: 1.2, py: 0.25, borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                                  <Typography sx={{ color: '#2563eb', fontSize: { xs: '0.75rem', sm: '0.82rem' }, fontWeight: 800 }}>
                                    {challengesData.find(c => c.id === selectedCategory)?.title || selectedCategory}
                                  </Typography>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>•</Typography>
                                  <Typography sx={{ color: '#475569', fontSize: { xs: '0.75rem', sm: '0.82rem' }, fontWeight: 700 }}>
                                    {weekDays.find(d => d.category === selectedCategory)?.dayName || 'Day'}, {format(new Date(selectedTargetDate), 'MMM d')}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : matrixStep === 2 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Chip
                                  label={`Week ${selectedWeek} · ${selectedCommodity}`}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(activeOpt.color, 0.12),
                                    color: activeOpt.color,
                                    fontWeight: 900,
                                    fontSize: '0.82rem',
                                    borderRadius: '8px',
                                    height: 24
                                  }}
                                />
                              </Box>
                            ) : null}
                            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a', fontSize: { xs: '1.25rem', sm: '1.6rem' } }}>
                              {matrixStep === 1
                                ? "What commodity do you want to write about?"
                                : matrixStep === 2
                                ? "What do you want to focus on?"
                                : `Pick one of the ${insights.length || 'articles'} to write on`}
                            </Typography>
                            {matrixStep === 1 && (
                              <Typography sx={{ color: '#64748b', fontSize: { xs: '0.95rem', sm: '1.05rem' }, fontWeight: 700, mt: 0.5 }}>
                                Tap one to continue.
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {matrixStep === 3 && isAdmin && (
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsAdminSidePaneOpen(true);
                              }}
                              startIcon={<LockIcon sx={{ fontSize: '13px !important' }} />}
                              sx={{
                                bgcolor: 'rgba(245, 158, 11, 0.12)',
                                color: '#d97706',
                                fontWeight: 800,
                                fontSize: '0.74rem',
                                borderRadius: '10px',
                                px: 1.5,
                                py: 0.6,
                                textTransform: 'none',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                '&:hover': {
                                  bgcolor: 'rgba(245, 158, 11, 0.2)',
                                }
                              }}
                            >
                              Admin Flow
                            </Button>
                          )}
                          {matrixStep === 3 && (
                            <Tooltip title="Refresh Trending Angles (50 NP)">
                              <IconButton 
                                onClick={() => setIsRegenerateModalOpen(true)}
                                disabled={regenerating || loadingInsights}
                                sx={{
                                  color: ACCENT,
                                  bgcolor: alpha(ACCENT, 0.1),
                                  border: `1px solid ${alpha(ACCENT, 0.25)}`,
                                  borderRadius: '12px',
                                  p: 1.1,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: alpha(ACCENT, 0.2),
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
                              sx={{ color: '#64748b', bgcolor: 'rgba(0, 0, 0, 0.05)', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)', color: '#0f172a' } }}
                            >
                              <MinimizeIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* STEP 1: COMMODITY & WEEK SELECTION (2-COLUMN GRID VIEW)      */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {matrixStep === 1 && (
                    <Box sx={{ overflow: 'visible' }}>
                      {/* Bento Grid: 2-Column with Progressive 3D Tilt Cascade */}
                      <Box
                        component={motion.div}
                        variants={gridStaggerVariants}
                        initial="hidden"
                        animate="visible"
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                          gap: { xs: 2.5, sm: 3 },
                          perspective: '1400px',
                          height: 'auto',
                          overflow: 'visible',
                          py: 1,
                          px: 0.5,
                          pb: 2,
                        }}
                      >
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

                          const visibleUpcoming = showAllCommodities ? upcomingList : upcomingList.slice(0, 6);

                          return (
                            <>
                              {/* ── BENTO HERO TILE: 80% WIDTH, CENTERED & TILTED UP ── */}
                              <Box
                                component={motion.div}
                                variants={cardProgressiveTiltVariants}
                                sx={{
                                  gridColumn: '1 / -1',
                                  width: '100%',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  perspective: '1200px'
                                }}
                              >
                                <Paper
                                  elevation={0}
                                  onClick={() => handleSelectCommodityAndWeek(currentWeek, activeComm)}
                                  sx={{
                                    width: { xs: '100%', md: '80%' },
                                    minHeight: { xs: 220, sm: 240, md: 255 },
                                    borderRadius: '24px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: '2.5px solid #3b82f6',
                                    boxShadow: '0 0 35px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                    transform: { xs: 'none', md: 'rotateX(5deg)' },
                                    transformOrigin: 'bottom center',
                                    transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    p: { xs: 2.5, sm: 3.5 },
                                    '&:hover': {
                                      transform: { xs: 'translateY(-4px) scale(1.01)', md: 'rotateX(0deg) translateY(-6px) scale(1.01)' },
                                      borderColor: '#60a5fa',
                                      boxShadow: '0 20px 48px rgba(59, 130, 246, 0.55)',
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
                                  <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                      <Chip
                                        label={`⚡ ACTIVE WEEK ${currentWeek}`}
                                        size="small"
                                        sx={{
                                          bgcolor: '#3b82f6',
                                          color: '#fff',
                                          fontWeight: 900,
                                          fontSize: '0.85rem',
                                          height: 28,
                                          px: 0.5,
                                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)'
                                        }}
                                      />
                                      <Chip
                                        label="LIVE FOCUS"
                                        size="small"
                                        sx={{
                                          bgcolor: 'rgba(59, 130, 246, 0.25)',
                                          color: '#bfdbfe',
                                          fontWeight: 900,
                                          fontSize: '0.8rem',
                                          height: 28,
                                          border: '1px solid rgba(59, 130, 246, 0.5)'
                                        }}
                                      />
                                    </Box>
                                    <Typography sx={{ color: '#bfdbfe', fontSize: '1rem', fontWeight: 800 }}>
                                      {activeDateStr}
                                    </Typography>
                                  </Box>

                                  {/* Bottom Title & Trigger */}
                                  <Box sx={{ position: 'relative', zIndex: 2, mt: 'auto', pt: 2.5 }}>
                                    <Typography variant="h4" sx={{
                                      color: '#fff',
                                      fontWeight: 900,
                                      letterSpacing: '-0.02em',
                                      lineHeight: 1.15,
                                      fontSize: { xs: '1.85rem', sm: '2.4rem', md: '2.75rem' },
                                      textShadow: '0 4px 14px rgba(0,0,0,0.7)'
                                    }}>
                                      {activeComm}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#93c5fd', fontWeight: 900, fontSize: '1.05rem', mt: 1 }}>
                                      Select Active Cycle <ArrowForwardArrow sx={{ fontSize: 20 }} />
                                    </Box>
                                  </Box>
                                </Paper>
                              </Box>

                              {/* ── BENTO UPCOMING TILES (PROGRESSIVE TILT-IN) ── */}
                              {visibleUpcoming.map((item) => (
                                <Box
                                  key={`${item.comm}-${item.targetWeek}`}
                                  component={motion.div}
                                  variants={cardProgressiveTiltVariants}
                                  sx={{
                                    width: '100%',
                                    transformOrigin: 'bottom center'
                                  }}
                                >
                                  <Paper
                                    elevation={0}
                                    onClick={() => handleSelectCommodityAndWeek(item.targetWeek, item.comm)}
                                    sx={{
                                      minHeight: { xs: 175, sm: 190, md: 205 },
                                      borderRadius: '22px',
                                      position: 'relative',
                                      overflow: 'hidden',
                                      cursor: 'pointer',
                                      border: '1.5px solid rgba(255,255,255,0.18)',
                                      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'space-between',
                                      p: { xs: 2.5, sm: 3 },
                                      '&:hover': {
                                        transform: 'translateY(-4px) scale(1.015)',
                                        borderColor: 'rgba(255,255,255,0.4)',
                                        boxShadow: '0 14px 34px rgba(0,0,0,0.45)',
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
                                      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.7) 100%)',
                                      zIndex: 1,
                                    }} />

                                    {/* Top Bar: Week + Date Range */}
                                    <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <Chip
                                        label={`Week ${item.targetWeek}`}
                                        size="small"
                                        sx={{
                                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                                          color: '#fff',
                                          fontWeight: 900,
                                          fontSize: '0.88rem',
                                          height: 26,
                                          px: 0.5,
                                          border: '1px solid rgba(255, 255, 255, 0.3)',
                                          backdropFilter: 'blur(8px)'
                                        }}
                                      />
                                      <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.88rem', fontWeight: 800 }}>
                                        {item.dateRangeStr}
                                      </Typography>
                                    </Box>

                                    {/* Bottom: Commodity Title */}
                                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                                      <Typography sx={{
                                        color: '#fff',
                                        fontWeight: 900,
                                        fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
                                        lineHeight: 1.2,
                                        letterSpacing: '-0.02em',
                                        textShadow: '0 2px 6px rgba(0,0,0,0.7)'
                                      }}>
                                        {item.comm}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </Box>
                              ))}

                              {/* Toggle for remaining commodities beyond initial preview */}
                              {upcomingList.length > 6 && (
                                <Box
                                  component={motion.div}
                                  variants={cardProgressiveTiltVariants}
                                  sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', mt: 1.5 }}
                                >
                                  <Button
                                    onClick={() => setShowAllCommodities(!showAllCommodities)}
                                    size="small"
                                    sx={{
                                      borderRadius: '20px',
                                      textTransform: 'none',
                                      fontWeight: 800,
                                      fontSize: '0.9rem',
                                      bgcolor: 'rgba(0, 0, 0, 0.05)',
                                      color: '#334155',
                                      border: '1px solid rgba(0, 0, 0, 0.1)',
                                      px: 3,
                                      py: 0.9,
                                      '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                                        color: '#0f172a',
                                        borderColor: '#3b82f6'
                                      }
                                    }}
                                  >
                                    {showAllCommodities ? 'Show less' : `Browse all ${upcomingList.length + 1} commodities (${upcomingList.length - 6} more)`}
                                  </Button>
                                </Box>
                              )}
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
                                borderRadius: '20px',
                                p: { xs: 2.25, sm: 2.75 },
                                bgcolor: isFocused
                                  ? 'rgba(59, 130, 246, 0.08)'
                                  : (isToday ? 'rgba(245, 158, 11, 0.05)' : '#ffffff'),
                                border: '2px solid',
                                borderColor: isFocused
                                  ? '#3b82f6'
                                  : (isToday ? '#f59e0b' : 'rgba(0, 0, 0, 0.08)'),
                                boxShadow: isFocused ? '0 14px 32px rgba(59, 130, 246, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                transform: isFocused ? 'scale(1.02)' : `rotateX(${tiltDegree}deg)`,
                                transformOrigin: 'center center',
                                zIndex: 10 - distance,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                '&:hover': {
                                  bgcolor: isFocused ? 'rgba(59, 130, 246, 0.12)' : '#f8fafc',
                                  borderColor: '#3b82f6',
                                  transform: isFocused ? 'scale(1.02)' : `rotateX(${tiltDegree * 0.5}deg) translateY(-2px)`
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.25 }}>
                                {/* Day Date Block */}
                                <Box sx={{
                                  width: { xs: 52, sm: 60 },
                                  height: { xs: 52, sm: 60 },
                                  borderRadius: '16px',
                                  bgcolor: isFocused ? '#3b82f6' : (isToday ? '#f59e0b' : 'rgba(0, 0, 0, 0.05)'),
                                  color: isFocused || isToday ? '#fff' : '#334155',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  boxShadow: isFocused ? '0 4px 14px rgba(59, 130, 246, 0.4)' : 'none'
                                }}>
                                  <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.78rem' }, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1 }}>
                                    {item.dayName.slice(0, 3)}
                                  </Typography>
                                  <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' }, fontWeight: 900, lineHeight: 1.1, mt: 0.25 }}>
                                    {item.date.getDate()}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography sx={{ color: isFocused ? '#2563eb' : '#64748b', fontSize: { xs: '0.85rem', sm: '0.95rem' }, fontWeight: 800, lineHeight: 1.25 }}>
                                      {item.challenge.title}
                                    </Typography>
                                    {isToday && (
                                      <Chip label="TODAY" size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#f59e0b', color: '#fff', fontWeight: 900, flexShrink: 0 }} />
                                    )}
                                  </Box>
                                  <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 900, fontSize: { xs: '1.25rem', sm: '1.45rem' }, lineHeight: 1.25, letterSpacing: '-0.015em' }}>
                                    {getCategoryShortName(item.category)}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                                <Typography sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
                                  {item.dateFormatted}
                                </Typography>
                                <Box sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  bgcolor: isFocused ? 'rgba(37, 99, 235, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                                  color: isFocused ? '#2563eb' : '#94a3b8',
                                  transition: 'all 0.2s ease',
                                }}>
                                  <ArrowForwardArrow sx={{ fontSize: 20 }} />
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
                          <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '0.95rem' }}>
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
                              borderRadius: '24px',
                              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                              border: '2px solid #93c5fd',
                              boxShadow: '0 20px 45px -10px rgba(59, 130, 246, 0.16), 0 4px 16px -2px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                              display: 'flex',
                              flexDirection: { xs: 'column', md: 'row' },
                              alignItems: { xs: 'center', md: 'stretch' },
                              textAlign: { xs: 'center', md: 'left' },
                              gap: { xs: 3, md: 4.5 },
                              my: 4,
                              maxWidth: { xs: 500, md: 740 },
                              mx: 'auto',
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                borderColor: '#60a5fa',
                                boxShadow: '0 24px 50px -10px rgba(59, 130, 246, 0.22), 0 8px 24px -4px rgba(59, 130, 246, 0.15)',
                              }
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
                                backgroundImage: `url(${getCommodityMeta(selectedCommodity)?.imageUrl || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'}), linear-gradient(135deg, #1e3a8a, #0f172a)`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '2.5px solid rgba(255, 255, 255, 0.25)',
                                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                                transform: 'rotate(-3deg)',
                                zIndex: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'rotate(0deg) scale(1.05)', zIndex: 3 },
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
                                my: -2,
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
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
                                border: '2.5px solid rgba(255, 255, 255, 0.25)',
                                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                                transform: 'rotate(3deg)',
                                zIndex: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'rotate(0deg) scale(1.05)', zIndex: 3 },
                              }}
                            >
                              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.85) 100%)' }} />
                              <Typography sx={{ position: 'absolute', bottom: 7, left: 4, right: 4, color: '#93c5fd', fontSize: '0.7rem', fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                🛡️ {getCategoryShortName(selectedCategory)}
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
                              zIndex: 1,
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.35rem', sm: '1.55rem' } }}>
                                Get article ideas here
                              </Typography>
                              <Typography sx={{ color: '#334155', fontSize: { xs: '0.92rem', sm: '0.96rem' }, lineHeight: 1.6, fontWeight: 500 }}>
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
                                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                  color: '#ffffff',
                                  fontWeight: 900,
                                  px: 3.8,
                                  py: 1.3,
                                  borderRadius: '14px',
                                  textTransform: 'none',
                                  fontSize: '0.92rem',
                                  boxShadow: '0 6px 20px rgba(15, 23, 42, 0.25)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.35)',
                                  }
                                }}
                              >
                                Start (~1 min)
                              </Button>
                              <Button
                                variant="text"
                                onClick={handleStartCustomArticle}
                                sx={{
                                  color: '#475569',
                                  bgcolor: '#ffffff',
                                  border: '1.5px solid #cbd5e1',
                                  fontWeight: 800,
                                  px: 3,
                                  py: 1.25,
                                  borderRadius: '14px',
                                  textTransform: 'none',
                                  fontSize: '0.9rem',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    color: '#0f172a',
                                    bgcolor: '#f8fafc',
                                    borderColor: 'rgba(0, 0, 0, 0.25)',
                                    transform: 'translateY(-1px)',
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
                              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.06)',
                              maxWidth: { xs: 500, md: 740 },
                              mx: 'auto',
                              mt: 2.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              animation: `${slideUpFade} 0.3s ease`,
                            }}
                          >
                            <InfoOutlinedIcon sx={{ color: '#2563eb', fontSize: 22, flexShrink: 0 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ color: '#1e40af', fontSize: '0.84rem', fontWeight: 600, lineHeight: 1.5 }}>
                                We haven't detected your ingested articles yet. Don't worry — your progress is saved in your browser, and you can resume anytime by clicking <strong>Start</strong> above.
                              </Typography>
                            </Box>
                          </Paper>
                        )}

                        {/* ──────────────────────────────────────────────────────────── */}
                        {/* DEDICATED ADMIN ARTICLE FLOW CARD (Gated to Admin Profiles)  */}
                        {/* ──────────────────────────────────────────────────────────── */}
                        {isAdmin && (
                          <Paper
                            elevation={0}
                            sx={{
                              p: { xs: 2.75, sm: 3.25 },
                              borderRadius: '24px',
                              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                              border: '2px solid #fcd34d',
                              boxShadow: '0 16px 36px -6px rgba(217, 119, 6, 0.18), 0 4px 12px -2px rgba(217, 119, 6, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                              maxWidth: { xs: 500, md: 740 },
                              mx: 'auto',
                              mt: 3,
                              position: 'relative',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              justifyContent: 'space-between',
                              gap: 2.5,
                              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                              '&:hover': {
                                borderColor: '#f59e0b',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 20px 42px -6px rgba(217, 119, 6, 0.25), 0 6px 16px -2px rgba(217, 119, 6, 0.1)',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.25 }}>
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: '16px',
                                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 6px 18px rgba(245, 158, 11, 0.35)',
                                  flexShrink: 0,
                                }}
                              >
                                <LockIcon sx={{ fontSize: 24 }} />
                              </Box>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
                                  <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '1.08rem', letterSpacing: '-0.01em' }}>
                                    Admins Article Flow
                                  </Typography>
                                  <Chip
                                    label="ADMIN ONLY"
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(245, 158, 11, 0.22)',
                                      color: '#b45309',
                                      fontWeight: 900,
                                      fontSize: '0.64rem',
                                      height: 20,
                                      borderRadius: '6px',
                                      border: '1px solid rgba(245, 158, 11, 0.4)',
                                      letterSpacing: '0.04em',
                                    }}
                                  />
                                </Box>
                                <Typography sx={{ color: '#475569', fontSize: '0.86rem', lineHeight: 1.55, fontWeight: 500 }}>
                                  This uses the admin internal calendar to help them write specific articles that have been pre-planned.
                                </Typography>
                              </Box>
                            </Box>

                            <Button
                              variant="contained"
                              onClick={() => setIsAdminSidePaneOpen(true)}
                              endIcon={<ArrowForwardIcon sx={{ fontSize: '13px !important' }} />}
                              sx={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: '#ffffff',
                                fontWeight: 900,
                                px: 3.2,
                                py: 1.2,
                                borderRadius: '14px',
                                textTransform: 'none',
                                fontSize: '0.88rem',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 6px 18px rgba(245, 158, 11, 0.35)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.45)',
                                }
                              }}
                            >
                              Start Flow
                            </Button>
                          </Paper>
                        )}
                        </Box>
                      ) : (
                        /* NORMAL STATE: Swimlane Grid Grouped by Spectrum Rank + Editorial Framework Guide */
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          
                          {/* ════════════════════════════════════════════════════════════ */}
                          {/* SWIPEABLE EDITORIAL DECK                                     */}
                          {/* ════════════════════════════════════════════════════════════ */}
                          <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto', py: 1 }}>
                            {displayCards.length > 0 && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                  {/* Progress & Quick Jump Strip */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                                    <Typography sx={{ color: '#64748b', fontSize: '0.84rem', fontWeight: 800 }}>
                                      {isCurrentRetryCard ? (
                                        <span style={{ color: '#0f172a' }}>Completion & Review</span>
                                      ) : (
                                        <>Article <strong style={{ color: '#0f172a' }}>{deckActiveIndex + 1}</strong> of {insights.length}</>
                                      )}
                                    </Typography>
                                    
                                    {/* Dot indicators for cards (includes completion dot) */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                      {displayCards.slice(0, 14).map((dotItem, dotIdx) => {
                                        const isRetryDot = Boolean(dotItem?.isRetryCard);
                                        const dotKey = isRetryDot ? '1' : (dotItem?.spectrumRank ? getSpectrumKey(dotItem.spectrumRank) : String((dotIdx % 6) + 1));
                                        const dotMeta = isRetryDot ? { color: '#0f172a' } : (SPECTRUM_CONFIG[dotKey] || SPECTRUM_CONFIG[String((dotIdx % 6) + 1)]);
                                        const isCurrentDot = dotIdx === deckActiveIndex;
                                        return (
                                           <Box
                                             key={`deck-dot-${dotIdx}`}
                                             onClick={() => {
                                               setIsCardFlipped(false);
                                               setDeckActiveIndex(dotIdx);
                                             }}
                                             sx={{
                                               width: isCurrentDot ? 22 : 7,
                                               height: 7,
                                               borderRadius: '999px',
                                               bgcolor: isCurrentDot ? dotMeta.color : alpha(dotMeta.color, 0.35),
                                               cursor: 'pointer',
                                               transition: 'all 0.25s ease',
                                               '&:hover': { bgcolor: dotMeta.color }
                                             }}
                                           />
                                         );
                                       })}
                                     </Box>

                                     <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}>
                                       {isCurrentRetryCard ? 'End of Flow' : (isCardFlipped ? 'Inspect View' : 'Front View')}
                                     </Typography>
                                   </Box>

                                  {/* ── 3D FLIPPABLE CARD CONTAINER WITH DROP STACK & FLOATING CONTROLS ── */}
                                  <Box
                                    sx={{
                                      position: 'relative',
                                      width: '100%',
                                    }}
                                  >
                                      {/* Floating Previous Card Icon Button */}
                                      <IconButton
                                        onClick={handlePrevCard}
                                        disabled={isFirstCard}
                                        aria-label="Previous Brief"
                                        sx={{
                                          position: 'absolute',
                                          left: { xs: '50%', sm: -16, md: -20 },
                                          top: { xs: -14, sm: '50%' },
                                          transform: { xs: 'translateX(-50%)', sm: 'translateY(-50%)' },
                                          zIndex: 25,
                                          width: { xs: 40, sm: 50 },
                                          height: { xs: 40, sm: 50 },
                                          bgcolor: '#ffffff',
                                          border: '1.5px solid rgba(226, 232, 240, 0.95)',
                                          boxShadow: '0 10px 28px rgba(15, 23, 42, 0.14), 0 2px 8px rgba(0,0,0,0.04)',
                                          color: '#0f172a',
                                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                          opacity: isFirstCard ? 0.35 : 1,
                                          pointerEvents: isFirstCard ? 'none' : 'auto',
                                          '&:hover': {
                                            bgcolor: '#0f172a',
                                            color: '#ffffff',
                                            borderColor: '#0f172a',
                                            transform: { xs: 'translateX(-50%) scale(1.08)', sm: 'translateY(-50%) scale(1.1)' },
                                            boxShadow: '0 14px 32px rgba(15, 23, 42, 0.24)',
                                          }
                                        }}
                                      >
                                        {isMobile ? (
                                          <KeyboardArrowUpIcon sx={{ fontSize: 24 }} />
                                        ) : (
                                          <ArrowBackIcon sx={{ fontSize: { xs: 18, sm: 20 }, ml: '2px' }} />
                                        )}
                                      </IconButton>

                                      {/* Floating Next Card Icon Button */}
                                      <IconButton
                                        onClick={handleNextCard}
                                        disabled={isLastCard}
                                        aria-label="Next Brief"
                                        sx={{
                                          position: 'absolute',
                                          left: { xs: '50%', sm: 'auto' },
                                          right: { xs: 'auto', sm: -16, md: -20 },
                                          bottom: { xs: -20, sm: 'auto' },
                                          top: { xs: 'auto', sm: '50%' },
                                          transform: { xs: 'translateX(-50%)', sm: 'translateY(-50%)' },
                                          zIndex: 25,
                                          width: { xs: 44, sm: 50 },
                                          height: { xs: 44, sm: 50 },
                                          bgcolor: '#0f172a',
                                          border: '1.5px solid #0f172a',
                                          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.28)',
                                          color: '#ffffff',
                                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                          opacity: isLastCard ? 0.35 : 1,
                                          pointerEvents: isLastCard ? 'none' : 'auto',
                                          '&:hover': {
                                            bgcolor: '#1e293b',
                                            color: '#ffffff',
                                            borderColor: '#1e293b',
                                            transform: { xs: 'translateX(-50%) scale(1.08)', sm: 'translateY(-50%) scale(1.1)' },
                                            boxShadow: '0 14px 32px rgba(15, 23, 42, 0.36)',
                                          }
                                        }}
                                      >
                                        {isMobile ? (
                                          <KeyboardArrowDownIcon sx={{ fontSize: 24 }} />
                                        ) : (
                                          <ArrowForwardIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                        )}
                                      </IconButton>

                                        {/* ── 3D CAROUSEL STAGE (RESPONSIVE: VERTICAL ON MOBILE, HORIZONTAL ON DESKTOP) ── */}
                                        <Box
                                          sx={{
                                            width: '100%',
                                            minHeight: { xs: 520, sm: 540, md: 560 },
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'visible',
                                            perspective: '1400px',
                                            py: { xs: 2, sm: 3 },
                                          }}
                                        >
                                          <AnimatePresence initial={false} custom={deckActiveIndex}>
                                            {displayCards.map((item, index) => {
                                             // Non-looping linear index delta
                                             const diff = index - deckActiveIndex;

                                             // For mobile vertical deck: render exiting (-1), active (0), and stacked (1, 2)
                                             // On desktop horizontal carousel: render active (0) and immediate neighbors (-1, 1)
                                             if (isMobile) {
                                               if (diff < -1 || diff > 2) return null;
                                             } else {
                                               if (Math.abs(diff) > 1) return null;
                                             }

                                              const isActive = diff === 0;

                                              // Check if item is the completion/retry card
                                              const isItemRetryCard = Boolean(item.isRetryCard);

                                              const itemRankKey = item?.spectrumRank ? getSpectrumKey(item.spectrumRank) : String((index % 6) + 1);
                                              const itemRMeta = isItemRetryCard 
                                                ? { label: 'Completion & Review', shortLabel: 'Review', color: '#0f172a', emoji: '🏁', bg: 'rgba(15, 23, 42, 0.08)' }
                                                : (SPECTRUM_CONFIG[itemRankKey] || SPECTRUM_CONFIG[String((index % 6) + 1)]);
                                              const itemFMeta = FORMAT_CONFIG[item.format] || FORMAT_CONFIG.brief;
                                              const itemArticleType = itemFMeta.label || item.format || 'Article';
                                              const itemCommodityTarget = item.era
                                                ? `${item.era.toUpperCase()} ERA`
                                                : (selectedCommodity ? `${selectedCommodity.toUpperCase()} VALUE CHAIN` : 'AGRICULTURAL VALUE CHAIN');
                                              const itemSubtitle = isItemRetryCard
                                                ? 'EDITORIAL BRIEF CYCLE COMPLETE'
                                                : `A${/^[AEIOU]/i.test(itemArticleType) ? 'N' : ''} ${itemArticleType.toUpperCase()} FOR THE ${itemCommodityTarget}`;

                                              let x = 0;
                                              let y = 0;
                                              let scale = 1;
                                              let zIndex = 0;
                                              let opacity = 1;
                                              let rotateX = 0;
                                              let rotateY = 0;

                                              if (isMobile) {
                                                if (diff === 0) {
                                                  // Active front card
                                                  x = 0;
                                                  y = 0;
                                                  scale = 1;
                                                  zIndex = 10;
                                                  opacity = 1;
                                                  rotateX = 0;
                                                  rotateY = (!isItemRetryCard && isCardFlipped) ? 180 : 0;
                                                } else if (diff === 1) {
                                                  // 1st stacked card behind active (peeks 20px below)
                                                  x = 0;
                                                  y = 20;
                                                  scale = 0.94;
                                                  zIndex = 8;
                                                  opacity = 1;
                                                  rotateX = -2;
                                                  rotateY = 0;
                                                } else if (diff === 2) {
                                                  // 2nd stacked card behind (peeks 38px below)
                                                  x = 0;
                                                  y = 38;
                                                  scale = 0.88;
                                                  zIndex = 6;
                                                  opacity = 0.85;
                                                  rotateX = -4;
                                                  rotateY = 0;
                                                } else if (diff === -1) {
                                                  // Exiting card: drops down off the screen (top-to-bottom swipe animation)
                                                  x = 0;
                                                  y = 420;
                                                  scale = 0.95;
                                                  zIndex = 12;
                                                  opacity = 0;
                                                  rotateX = 6;
                                                  rotateY = 0;
                                                }
                                              } else {
                                                // Desktop horizontal 3D carousel
                                                const xOffset = isTablet ? 340 : 420;
                                                const scaleFactor = 0.88;
                                                const rotateAngle = 12;

                                                if (isActive) {
                                                  x = 0;
                                                  y = 0;
                                                  scale = 1;
                                                  zIndex = 10;
                                                  opacity = 1;
                                                  rotateX = 0;
                                                  rotateY = (!isItemRetryCard && isCardFlipped) ? 180 : 0;
                                                } else {
                                                  x = diff * xOffset;
                                                  y = 0;
                                                  scale = scaleFactor;
                                                  zIndex = 5;
                                                  opacity = 1;
                                                  rotateX = 0;
                                                  rotateY = diff * -rotateAngle;
                                                }
                                              }

                                              return (
                                                <motion.div
                                                  key={item.id || `deck-card-${index}`}
                                                  drag={isActive && (!isCardFlipped || isItemRetryCard) ? (isMobile ? "y" : "x") : false}
                                                  dragConstraints={isMobile ? { top: -40, bottom: 260 } : { left: 0, right: 0 }}
                                                  dragElastic={0.45}
                                                  onDragEnd={(_, { offset, velocity }) => {
                                                    if (!isActive || (!isItemRetryCard && isCardFlipped)) return;
                                                    if (isMobile) {
                                                      // Top to bottom swipe (downward drag): offset.y > 40 or velocity.y > 220 -> Next card
                                                      // Bottom to top swipe (upward drag): offset.y < -40 or velocity.y < -220 -> Prev card
                                                      if (offset.y > 40 || velocity.y > 220) {
                                                        handleNextCard();
                                                      } else if (offset.y < -40 || velocity.y < -220) {
                                                        handlePrevCard();
                                                      }
                                                    } else {
                                                      const swipe = offset.x;
                                                      const swipeVelocity = velocity.x;
                                                      if (swipe < -50 || swipeVelocity < -400) handleNextCard();
                                                      else if (swipe > 50 || swipeVelocity > 400) handlePrevCard();
                                                    }
                                                  }}
                                                  animate={{ 
                                                    x, 
                                                    y,
                                                    scale, 
                                                    zIndex, 
                                                    opacity, 
                                                    rotateX,
                                                    rotateY 
                                                  }}
                                                  transition={{ 
                                                    type: "spring", 
                                                    stiffness: 240, 
                                                    damping: 24, 
                                                    mass: 0.8 
                                                  }}
                                                  style={{
                                                    position: 'absolute',
                                                    width: isMobile ? '92%' : '100%',
                                                    maxWidth: isMobile ? 420 : 760,
                                                    minHeight: isMobile ? 420 : 500,
                                                    transformStyle: 'preserve-3d',
                                                    WebkitTransformStyle: 'preserve-3d',
                                                    cursor: isActive ? (isItemRetryCard ? 'default' : (isCardFlipped ? 'default' : 'grab')) : 'pointer',
                                                    borderRadius: '28px',
                                                    touchAction: isMobile ? 'pan-x' : 'pan-y',
                                                  }}
                                                  onClick={() => {
                                                    if (!isActive) {
                                                      setIsCardFlipped(false);
                                                      setDeckActiveIndex(index);
                                                    }
                                                  }}
                                                >
                                                 {/* ── CARD FRONT (3D FACE) ── */}
                                                 <Box
                                                   onClick={() => {
                                                     if (isActive && !isCardFlipped && !isItemRetryCard) setIsCardFlipped(true);
                                                   }}
                                                   sx={{
                                                     position: 'absolute',
                                                     inset: 0,
                                                     backfaceVisibility: 'hidden',
                                                     WebkitBackfaceVisibility: 'hidden',
                                                     transform: 'rotateY(0deg) translateZ(1px)',
                                                     pointerEvents: (isActive && isCardFlipped) ? 'none' : 'auto',
                                                     borderRadius: '28px',
                                                     bgcolor: '#ffffff', // 100% Solid white opaque
                                                     border: `1.5px solid ${alpha(itemRMeta.color, isActive ? 0.35 : 0.2)}`,
                                                     boxShadow: isActive 
                                                       ? `0 24px 60px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px #ffffff inset, 0 12px 36px -8px ${alpha(itemRMeta.color, 0.22)}` 
                                                       : '0 16px 38px -8px rgba(15, 23, 42, 0.12), 0 0 0 1px #ffffff inset',
                                                     p: { xs: 2.5, sm: 4.5 },
                                                     display: 'flex',
                                                     flexDirection: 'column',
                                                     justifyContent: 'space-between',
                                                     alignItems: 'center',
                                                     textAlign: 'center',
                                                     background: '#ffffff', // Completely opaque solid background to prevent bleed
                                                     overflow: 'hidden',
                                                     userSelect: 'none',
                                                     '&::before': {
                                                       content: '""',
                                                       position: 'absolute',
                                                       top: 0,
                                                       left: 0,
                                                       right: 0,
                                                       height: '35%',
                                                       background: `linear-gradient(180deg, ${alpha(itemRMeta.color, 0.06)} 0%, rgba(255,255,255,0) 100%)`,
                                                       pointerEvents: 'none',
                                                       zIndex: 1,
                                                     }
                                                   }}
                                                 >
                                                   {isItemRetryCard ? (
                                                     /* ── SPECIAL RETRY / RESTART CARD ── */
                                                     isActive ? (
                                                       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 'auto', gap: { xs: 2, sm: 3 }, width: '100%', maxWidth: 600, position: 'relative', zIndex: 2 }}>
                                                         {/* Big Icon / Badge */}
                                                         <Box
                                                           sx={{
                                                             width: { xs: 56, sm: 76 },
                                                             height: { xs: 56, sm: 76 },
                                                             borderRadius: { xs: '18px', sm: '24px' },
                                                             bgcolor: '#0f172a',
                                                             color: '#ffffff',
                                                             display: 'flex',
                                                             alignItems: 'center',
                                                             justifyContent: 'center',
                                                             boxShadow: '0 16px 36px rgba(15, 23, 42, 0.28)',
                                                             transform: 'rotate(-4deg)',
                                                             mb: 0.5
                                                           }}
                                                         >
                                                           <RefreshIcon sx={{ fontSize: { xs: 28, sm: 42 } }} />
                                                         </Box>

                                                         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                           <Typography
                                                             variant="h3"
                                                             sx={{
                                                               color: '#0f172a',
                                                               fontWeight: 900,
                                                               fontSize: { xs: '1.45rem', sm: '2.25rem' },
                                                               lineHeight: 1.2,
                                                               letterSpacing: '-0.03em',
                                                             }}
                                                           >
                                                             You've Explored Every Angle
                                                           </Typography>
                                                           <Typography
                                                             sx={{
                                                               color: '#475569',
                                                               fontSize: { xs: '0.88rem', sm: '1.05rem' },
                                                               lineHeight: 1.6,
                                                               fontWeight: 500,
                                                               maxWidth: 520,
                                                             }}
                                                           >
                                                             All {insights.length} editorial angles for the <strong>{selectedCommodity}</strong> value chain have been reviewed. Ready to start from Card 1 or regenerate new angles?
                                                           </Typography>
                                                         </Box>

                                                         {/* Action Buttons */}
                                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mt: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                           <Button
                                                             variant="contained"
                                                             onClick={(e) => {
                                                               e.stopPropagation();
                                                               handleRestartDeck();
                                                             }}
                                                             startIcon={<RefreshIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                                                             sx={{
                                                               bgcolor: '#0f172a',
                                                               color: '#ffffff',
                                                               fontWeight: 900,
                                                               fontSize: { xs: '0.86rem', sm: '0.98rem' },
                                                               px: { xs: 3, sm: 5 },
                                                               py: { xs: 1.1, sm: 1.35 },
                                                               borderRadius: '999px',
                                                               textTransform: 'none',
                                                               boxShadow: '0 10px 28px rgba(15, 23, 42, 0.28)',
                                                               transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                               '&:hover': {
                                                                 bgcolor: '#1e293b',
                                                                 transform: 'translateY(-2px) scale(1.02)',
                                                                 boxShadow: '0 14px 34px rgba(15, 23, 42, 0.36)',
                                                               }
                                                             }}
                                                           >
                                                             Start Again from Card 1
                                                           </Button>

                                                           <Button
                                                             variant="outlined"
                                                             onClick={(e) => {
                                                               e.stopPropagation();
                                                               handlePrevCard();
                                                             }}
                                                             startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                                                             sx={{
                                                               color: '#475569',
                                                               borderColor: 'rgba(203, 213, 225, 0.9)',
                                                               fontWeight: 800,
                                                               py: 1.35,
                                                               borderRadius: '999px',
                                                               textTransform: 'none',
                                                               '&:hover': {
                                                                 borderColor: '#0f172a',
                                                                 color: '#0f172a',
                                                                 bgcolor: 'rgba(15, 23, 42, 0.04)',
                                                               }
                                                             }}
                                                           >
                                                             Previous Card
                                                           </Button>
                                                         </Box>
                                                       </Box>
                                                     ) : (
                                                       /* Neighbor Card View of Retry Card */
                                                       <Box
                                                         sx={{
                                                           display: 'flex',
                                                           flexDirection: 'column',
                                                           alignItems: 'center',
                                                           justifyContent: 'center',
                                                           height: '100%',
                                                           width: '100%',
                                                           gap: 2.5,
                                                           position: 'relative',
                                                           zIndex: 2,
                                                         }}
                                                       >
                                                         <Chip
                                                           label="Review Finished"
                                                           sx={{
                                                             bgcolor: 'rgba(15, 23, 42, 0.08)',
                                                             color: '#0f172a',
                                                             fontWeight: 900,
                                                             fontSize: '0.85rem',
                                                             height: 32,
                                                             px: 1.5,
                                                             borderRadius: '999px',
                                                             border: '1.5px solid rgba(15, 23, 42, 0.22)',
                                                           }}
                                                         />
                                                         <Typography
                                                           sx={{
                                                             color: '#94a3b8',
                                                             fontSize: '0.88rem',
                                                             fontWeight: 700,
                                                             letterSpacing: '0.04em',
                                                             textTransform: 'uppercase',
                                                           }}
                                                         >
                                                           Tap to Start Over
                                                         </Typography>
                                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                                                           <RefreshIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                                                           <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                                                             Restart Deck
                                                           </Typography>
                                                         </Box>
                                                       </Box>
                                                     )
                                                   ) : isActive ? (
                                                     /* ── ACTIVE REGULAR CARD: FULL EDITORIAL BRIEF DETAILS ── */
                                                     <>
                                                       {/* Top: Premium Subtitle Badge with flow accent color */}
                                                       <Box
                                                         sx={{
                                                           display: 'inline-flex',
                                                           alignItems: 'center',
                                                           gap: 1,
                                                           px: 2.2,
                                                           py: 0.65,
                                                           borderRadius: '999px',
                                                           bgcolor: alpha(itemRMeta.color, 0.08),
                                                           border: `1.5px solid ${alpha(itemRMeta.color, 0.26)}`,
                                                           boxShadow: `0 4px 14px ${alpha(itemRMeta.color, 0.1)}`,
                                                           position: 'relative',
                                                           zIndex: 2,
                                                         }}
                                                       >
                                                         <Box
                                                           sx={{
                                                             width: 7,
                                                             height: 7,
                                                             borderRadius: '50%',
                                                             bgcolor: itemRMeta.color,
                                                             boxShadow: `0 0 8px ${itemRMeta.color}`,
                                                           }}
                                                         />
                                                         <Typography
                                                           sx={{
                                                             textTransform: 'uppercase',
                                                             fontSize: { xs: '0.72rem', sm: '0.78rem' },
                                                             fontWeight: 900,
                                                             letterSpacing: '0.07em',
                                                             color: itemRMeta.color,
                                                           }}
                                                         >
                                                           {itemSubtitle}
                                                         </Typography>
                                                       </Box>

                                                       {/* Middle Section: Bigger Title and Flow Sentence */}
                                                       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, my: 'auto', width: '100%', maxWidth: 660, position: 'relative', zIndex: 2 }}>
                                                         <Typography
                                                           variant="h3"
                                                           sx={{
                                                             color: '#0f172a',
                                                             fontWeight: 900,
                                                             fontSize: { xs: '1.35rem', sm: '2.15rem', md: '2.45rem' },
                                                             lineHeight: 1.25,
                                                             letterSpacing: '-0.03em',
                                                             px: { xs: 0.5, sm: 2 },
                                                           }}
                                                         >
                                                           {item.title}
                                                         </Typography>

                                                         {/* Contextual Flow Sentence */}
                                                         <Typography
                                                           sx={{
                                                             color: '#475569',
                                                             fontSize: { xs: '0.86rem', sm: '1rem' },
                                                             lineHeight: 1.6,
                                                             fontWeight: 500,
                                                             maxWidth: 600,
                                                           }}
                                                         >
                                                           {getFlowSentence(
                                                             item.spectrumRank,
                                                             itemArticleType,
                                                             item.subcategoryTitle || item.subcategoryId,
                                                             item.targetPersona || (item as any).valueChainActor || (item as any).actor || (item as any).jobFunction || 'Value Chain Operators'
                                                           )}
                                                         </Typography>
                                                       </Box>

                                                       {/* Bottom Row: Article Count (Bottom Left) & View More Details (Far Bottom Right) */}
                                                       <Box 
                                                         sx={{ 
                                                           width: '100%', 
                                                           pt: { xs: 1.5, sm: 2 }, 
                                                           display: 'flex', 
                                                           alignItems: 'center', 
                                                           justifyContent: 'space-between', 
                                                           position: 'relative', 
                                                           zIndex: 2 
                                                         }}
                                                       >
                                                         <Typography
                                                           sx={{
                                                             color: '#64748b',
                                                             fontSize: { xs: '0.78rem', sm: '0.88rem' },
                                                             fontWeight: 800,
                                                             letterSpacing: '0.02em',
                                                             textTransform: 'uppercase',
                                                           }}
                                                         >
                                                           Article {index + 1} of {insights.length}
                                                         </Typography>

                                                         <Button
                                                           variant="contained"
                                                           onClick={(e) => {
                                                             e.stopPropagation();
                                                             setIsCardFlipped(true);
                                                           }}
                                                           sx={{
                                                             width: 'auto',
                                                             color: '#ffffff',
                                                             bgcolor: '#0f172a',
                                                             fontWeight: 800,
                                                             fontSize: { xs: '0.82rem', sm: '0.9rem' },
                                                             px: { xs: 2.5, sm: 4.5 },
                                                             py: { xs: 1, sm: 1.25 },
                                                             borderRadius: '999px',
                                                             textTransform: 'none',
                                                             boxShadow: '0 8px 24px rgba(15, 23, 42, 0.22)',
                                                             transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                             '&:hover': {
                                                               bgcolor: '#1e293b',
                                                               transform: 'translateY(-2px) scale(1.02)',
                                                               boxShadow: '0 12px 28px rgba(15, 23, 42, 0.32)',
                                                             }
                                                           }}
                                                         >
                                                           View More Details
                                                         </Button>
                                                       </Box>
                                                     </>
                                                   ) : (
                                                     /* ── NEIGHBOR REGULAR CARD: SIMPLIFIED CLEAN OVERVIEW (AVOIDS BLEED) ── */
                                                     <Box
                                                       sx={{
                                                         display: 'flex',
                                                         flexDirection: 'column',
                                                         alignItems: 'center',
                                                         justifyContent: 'center',
                                                         height: '100%',
                                                         width: '100%',
                                                         gap: 2.5,
                                                         position: 'relative',
                                                         zIndex: 2,
                                                       }}
                                                     >
                                                       {/* Article Count Badge */}
                                                       <Chip
                                                         label={`Article ${index + 1} of ${insights.length}`}
                                                         sx={{
                                                           bgcolor: alpha(itemRMeta.color, 0.1),
                                                           color: itemRMeta.color,
                                                           fontWeight: 900,
                                                           fontSize: '0.85rem',
                                                           height: 32,
                                                           px: 1.5,
                                                           borderRadius: '999px',
                                                           border: `1.5px solid ${alpha(itemRMeta.color, 0.28)}`,
                                                         }}
                                                       />

                                                       {/* Tap to inspect prompt */}
                                                       <Typography
                                                         sx={{
                                                           color: '#94a3b8',
                                                           fontSize: '0.88rem',
                                                           fontWeight: 700,
                                                           letterSpacing: '0.04em',
                                                           textTransform: 'uppercase',
                                                         }}
                                                       >
                                                         Tap to View Article
                                                       </Typography>

                                                       {/* Flow Tag */}
                                                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                                                         <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: itemRMeta.color }} />
                                                         <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                                           {itemRMeta.label}
                                                         </Typography>
                                                       </Box>
                                                     </Box>
                                                   )}
                                                 </Box>

                                                 {/* ── CARD BACK (3D FACE ROTATED 180 DEG) ── */}
                                                 {!isItemRetryCard && (
                                                   <Box
                                                     onClick={(e) => e.stopPropagation()}
                                                     sx={{
                                                       position: 'absolute',
                                                       inset: 0,
                                                       backfaceVisibility: 'hidden',
                                                       WebkitBackfaceVisibility: 'hidden',
                                                       transform: 'rotateY(180deg) translateZ(1px)',
                                                       pointerEvents: (isActive && isCardFlipped) ? 'auto' : 'none',
                                                       borderRadius: '28px',
                                                       bgcolor: '#ffffff', // 100% solid white
                                                       border: `2px solid ${alpha(itemRMeta.color, 0.55)}`,
                                                       boxShadow: `0 24px 60px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px #ffffff inset, 0 16px 40px -8px ${alpha(itemRMeta.color, 0.25)}`,
                                                       p: { xs: 2.25, sm: 3.75 },
                                                       display: 'flex',
                                                       flexDirection: 'column',
                                                       justifyContent: 'space-between',
                                                       textAlign: 'left',
                                                       background: '#ffffff', // 100% solid white
                                                       overflow: 'hidden',
                                                       '&::before': {
                                                         content: '""',
                                                         position: 'absolute',
                                                         top: 0,
                                                         left: 0,
                                                         right: 0,
                                                         height: '35%',
                                                         background: `linear-gradient(180deg, ${alpha(itemRMeta.color, 0.05)} 0%, rgba(255,255,255,0) 100%)`,
                                                         pointerEvents: 'none',
                                                         zIndex: 1,
                                                       }
                                                     }}
                                                   >
                                                     <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                                                       <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                         {/* Top Bar: Back Button in Top Left, Rank Chip in Top Right */}
                                                         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid rgba(226, 232, 240, 0.7)' }}>
                                                           {/* Back button on the TOP LEFT */}
                                                           <Button
                                                             size="small"
                                                             onPointerDown={(e) => e.stopPropagation()}
                                                             onClick={(e) => {
                                                               e.stopPropagation();
                                                               setIsCardFlipped(false);
                                                             }}
                                                             startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
                                                             sx={{
                                                               color: '#334155',
                                                               bgcolor: 'rgba(0,0,0,0.05)',
                                                               fontSize: '0.78rem',
                                                               fontWeight: 800,
                                                               textTransform: 'none',
                                                               borderRadius: '999px',
                                                               px: 2,
                                                               py: 0.5,
                                                               transition: 'all 0.2s ease',
                                                               '&:hover': {
                                                                 bgcolor: 'rgba(0,0,0,0.09)',
                                                                 color: '#0f172a',
                                                                 transform: 'translateX(-2px)',
                                                               }
                                                             }}
                                                           >
                                                             Back
                                                           </Button>

                                                           {/* Flow and Format Chips on the TOP RIGHT */}
                                                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                             <Chip
                                                               label={`${itemRMeta.emoji} ${itemRMeta.shortLabel || itemRMeta.label}`}
                                                               size="small"
                                                               sx={{
                                                                 bgcolor: alpha(itemRMeta.color, 0.12),
                                                                 color: itemRMeta.color,
                                                                 fontWeight: 900,
                                                                 fontSize: '0.74rem',
                                                                 height: 26,
                                                                 borderRadius: '999px',
                                                                 border: `1px solid ${alpha(itemRMeta.color, 0.25)}`
                                                               }}
                                                             />
                                                             <Chip
                                                               label={`${itemFMeta.emoji} ${itemFMeta.label}`}
                                                               size="small"
                                                               sx={{
                                                                 bgcolor: 'rgba(0, 0, 0, 0.04)',
                                                                 color: '#475569',
                                                                 fontWeight: 700,
                                                                 fontSize: '0.7rem',
                                                                 height: 26,
                                                                 borderRadius: '999px'
                                                               }}
                                                             />
                                                           </Box>
                                                         </Box>

                                                         {/* Smaller Title on Top */}
                                                         <Typography
                                                           sx={{
                                                             color: '#0f172a',
                                                             fontWeight: 900,
                                                             fontSize: { xs: '1.05rem', sm: '1.28rem' },
                                                             lineHeight: 1.3,
                                                             letterSpacing: '-0.02em',
                                                             mb: 1.5,
                                                           }}
                                                         >
                                                           {item.title}
                                                         </Typography>

                                                         {/* List of Descriptions / Points - fills available space without redundant white gap */}
                                                         <Box
                                                           sx={{
                                                             flex: 1,
                                                             minHeight: 0,
                                                             overflowY: 'auto',
                                                             pr: 1,
                                                             display: 'flex',
                                                             flexDirection: 'column',
                                                             gap: 1.5,
                                                             '::-webkit-scrollbar': { width: '4px' },
                                                             '::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '4px' },
                                                           }}
                                                         >
                                                           {item.descriptionSentences && item.descriptionSentences.length > 0 ? (
                                                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                               {item.descriptionSentences.map((sentence, sIdx) => (
                                                                 <Box key={sIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                                                                   <Box
                                                                     sx={{
                                                                       width: 7,
                                                                       height: 7,
                                                                       borderRadius: '50%',
                                                                       bgcolor: itemRMeta.color,
                                                                       mt: '8px',
                                                                       flexShrink: 0,
                                                                       boxShadow: `0 0 6px ${alpha(itemRMeta.color, 0.6)}`
                                                                     }}
                                                                   />
                                                                   <Typography
                                                                     sx={{
                                                                       color: '#334155',
                                                                       fontSize: { xs: '0.96rem', sm: '1.05rem' },
                                                                       lineHeight: 1.55,
                                                                       fontWeight: 500,
                                                                     }}
                                                                   >
                                                                     {sentence}
                                                                   </Typography>
                                                                 </Box>
                                                               ))}
                                                             </Box>
                                                           ) : (
                                                             <Typography sx={{ color: '#475569', fontSize: { xs: '0.96rem', sm: '1.05rem' }, lineHeight: 1.6, fontStyle: 'italic' }}>
                                                               "{item.hook || `Strategic editorial insight covering real-time dynamics in ${selectedCommodity}.`}"
                                                             </Typography>
                                                           )}

                                                           {item.politicalEconomy && (
                                                             <Box sx={{ mt: 1, p: 1.5, borderRadius: '14px', bgcolor: alpha(itemRMeta.color, 0.05), border: `1px solid ${alpha(itemRMeta.color, 0.18)}` }}>
                                                               <Typography sx={{ color: itemRMeta.color, fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.35 }}>
                                                                 Market Context & Political Economy
                                                               </Typography>
                                                               <Typography sx={{ color: '#334155', fontSize: { xs: '0.86rem', sm: '0.92rem' }, lineHeight: 1.5, fontWeight: 500 }}>
                                                                 {item.politicalEconomy}
                                                               </Typography>
                                                             </Box>
                                                           )}
                                                         </Box>
                                                       </Box>

                                                       {/* Bottom Right: Start Writing Button */}
                                                       <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pt: 1.5, borderTop: '1px solid rgba(226, 232, 240, 0.8)', mt: 1.25 }}>
                                                         <Button
                                                           variant="contained"
                                                           onPointerDown={(e) => e.stopPropagation()}
                                                           onClick={(e) => {
                                                             e.stopPropagation();
                                                             handleSelectInsight(item);
                                                           }}
                                                           endIcon={<ArrowForwardArrow sx={{ fontSize: 17 }} />}
                                                           sx={{
                                                             background: `linear-gradient(135deg, ${itemRMeta.color} 0%, ${alpha(itemRMeta.color, 0.9)} 100%)`,
                                                             color: '#ffffff',
                                                             fontWeight: 900,
                                                             fontSize: '0.94rem',
                                                             px: 4.5,
                                                             py: 1.2,
                                                             borderRadius: '999px',
                                                             textTransform: 'none',
                                                             boxShadow: `0 8px 24px ${alpha(itemRMeta.color, 0.4)}`,
                                                             transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                             '&:hover': {
                                                               background: `linear-gradient(135deg, ${itemRMeta.color} 0%, ${itemRMeta.color} 100%)`,
                                                               transform: 'translateY(-2px) scale(1.02)',
                                                               boxShadow: `0 12px 30px ${alpha(itemRMeta.color, 0.55)}`,
                                                             }
                                                           }}
                                                         >
                                                           Start Writing
                                                         </Button>
                                                       </Box>
                                                     </Box>
                                                   </Box>
                                               )}
                                             </motion.div>
                                           );
                                         })}
                                        </AnimatePresence>
                                      </Box>
                                  </Box>
                                </Box>
                              )}
                          </Box>

                          {/* Bottom Action Row: Write Custom Title & Clear Saved Briefs */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, pt: { xs: 3.5, sm: 1.5 }, pb: 2, flexWrap: 'wrap' }}>
                            <Button
                              variant="contained"
                              onClick={handleStartCustomArticle}
                              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                bgcolor: '#0f172a',
                                color: '#ffffff',
                                fontWeight: 800,
                                fontSize: '0.88rem',
                                px: 3.5,
                                py: 1.2,
                                borderRadius: '14px',
                                textTransform: 'none',
                                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: '#1e293b',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
                                }
                              }}
                            >
                              ✍️ Write your own title
                            </Button>

                            <Button
                              variant="text"
                              onClick={handleClearSavedBriefs}
                              startIcon={<DeleteOutlineIcon sx={{ fontSize: 16, color: '#ef4444' }} />}
                              sx={{
                                color: '#ef4444',
                                bgcolor: 'rgba(239, 68, 68, 0.06)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                fontWeight: 700,
                                fontSize: '0.84rem',
                                px: 2.5,
                                py: 1.1,
                                borderRadius: '14px',
                                textTransform: 'none',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'rgba(239, 68, 68, 0.12)',
                                  borderColor: 'rgba(239, 68, 68, 0.35)',
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              Clear Saved Briefs
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
        </Paper>
        </motion.div>
        );
      })()}
    </AnimatePresence>
  </Box>
</LayoutGroup>

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
              bgcolor: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)',
              p: 1.5,
              maxWidth: 440,
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.2rem', pb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#0f172a' }}>
          <AutoAwesomeIcon sx={{ color: ACCENT }} /> Regenerate Fresh Angles
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, mb: 2 }}>
            This will run the AI intelligence engine to generate 10 new, localized editorial angles for <strong style={{ color: '#0f172a' }}>{selectedCommodity}</strong> ({selectedCategory}).
          </DialogContentText>
          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid rgba(0, 0, 0, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Cost:
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: ACCENT, fontWeight: 900 }}>
              50 NP
            </Typography>
          </Box>
          <Box sx={{ mt: 1, px: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
              Your Balance:
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: userSpendableNP >= 50 ? '#059669' : '#ef4444', fontWeight: 800 }}>
              {userSpendableNP} NP {userSpendableNP < 50 && '(Insufficient balance)'}
            </Typography>
          </Box>
          {regenerateError && (
            <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px' }}>
              {regenerateError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setIsRegenerateModalOpen(false)}
            disabled={regenerating}
            sx={{ color: '#64748b', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: '#0f172a' } }}
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

      {/* ──────────────────────────────────────────────────────────── */}
      {/* DEDICATED ADMIN ARTICLE PROMPT SIDE PANE                      */}
      {/* ──────────────────────────────────────────────────────────── */}
      <AdminArticlePromptSidePane
        open={isAdminSidePaneOpen}
        onClose={() => setIsAdminSidePaneOpen(false)}
        commodity={selectedCommodity}
        category={selectedCategory}
        targetDate={selectedTargetDate}
        onIngest={handleAdminIngest}
      />
    </Box>
  );
}
