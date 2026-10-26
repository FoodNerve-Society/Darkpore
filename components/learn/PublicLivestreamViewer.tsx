'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  Tooltip,
  Dialog,
  Snackbar,
  Alert,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Verified as VerifiedIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  NavigateNext as NavigateNextIcon,
  PlayArrow as PlayArrowIcon,
  Tv as TvIcon,
  OpenInNew as OpenInNewIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  Work as WorkIcon,
  MenuBook as BookIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Layers as LayersIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  EmojiEvents as TrophyIcon,
  LockOutlined as LockOutlinedIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { renderSlidePreviewContent } from '@/app/modular-society/[tenant]/(authenticated)/components/forms/livestream/SlideComponents';
import {
  getGoogleCalendarUrl,
  generateIcsContent,
  downloadIcsFile,
  getEmbeddableVideoUrl,
} from '@/components/learn/LivestreamCalendarHelper';
import { EcosystemJobModal } from '@/components/learn/blocks/EcosystemJobModal';
import { CollaboratorItem } from '@/app/modular-society/[tenant]/(authenticated)/components/forms/CoAuthorModal';

// ── Default Agribusiness Corridor Covers ───────────────────────
const CORRIDOR_COVERS: Record<string, string> = {
  capital: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  inputs: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=1200&q=80',
  energy: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
  insecurity: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
  'post-harvest': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
  'harvest-to-market': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
  'people-talent': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
};

export type BroadcastPhase = 'upcoming' | 'live' | 'replay';

export interface PublicLivestreamViewerProps {
  material: any;
  tenant: any;
  loginUrl: string;
  themeMode?: 'light' | 'dark';
}

export default function PublicLivestreamViewerWrapper(props: PublicLivestreamViewerProps) {
  return <PublicLivestreamViewer {...props} />;
}

export function PublicLivestreamViewer({
  material,
  tenant,
  loginUrl,
  themeMode = 'dark',
}: PublicLivestreamViewerProps) {
  const router = useRouter();

  // ── Extract Metadata & Carrier Blocks ──
  const blocks = useMemo(() => {
    const raw = material.livestream?.blocks || material.blocks || [];
    return raw.filter((b: any) => b.blockType !== 'metadata');
  }, [material.livestream?.blocks, material.blocks]);

  const studioMeta = useMemo(() => {
    if ((material as any)?._studioMeta) return (material as any)._studioMeta;
    if ((material.livestream as any)?._studioMeta) return (material.livestream as any)._studioMeta;
    const rawBlocks = material.livestream?.blocks || material.blocks || [];
    for (const b of rawBlocks) {
      if (b?._studioMeta) return b._studioMeta;
      if (b?.originalContent?._studioMeta) return b.originalContent._studioMeta;
      if (b.content) {
        try {
          const parsed =
            typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
          if (parsed?._studioMeta) return parsed._studioMeta;
        } catch {}
      }
    }
    return {};
  }, [material]);

  const appliedBlueprint = studioMeta?.appliedBlueprint || null;
  const guidingArticles = studioMeta?.guidingArticles || [];
  const guidingJobs = studioMeta?.guidingJobs || [];
  const featuredJob = guidingJobs[0] || null;

  // Safe Organization Extraction to eliminate object-as-child errors
  const safeOrgName = useMemo(() => {
    const org = material.organization;
    if (typeof org === 'string') return org;
    if (typeof org === 'object' && org?.name) return org.name;
    return `${tenant?.name || 'FoodNerve'} Society`;
  }, [material.organization, tenant?.name]);

  const safeOrgLogo = useMemo(() => {
    const org = material.organization;
    if (typeof org === 'object' && org?.logoUrl) return org.logoUrl;
    return undefined;
  }, [material.organization]);

  const featuredJobOrgName = useMemo(() => {
    if (!featuredJob) return safeOrgName;
    const org = featuredJob.organization;
    if (typeof org === 'string') return org;
    if (typeof org === 'object' && org?.name) return org.name;
    if (typeof (featuredJob as any).organizationName === 'string') {
      return (featuredJob as any).organizationName;
    }
    return safeOrgName;
  }, [featuredJob, safeOrgName]);

  const featuredJobOrgLogo = useMemo(() => {
    if (!featuredJob) return safeOrgLogo;
    if (typeof featuredJob.organizationLogo === 'string') return featuredJob.organizationLogo;
    if (typeof featuredJob.organization === 'object' && featuredJob.organization?.logoUrl) {
      return featuredJob.organization.logoUrl;
    }
    return safeOrgLogo;
  }, [featuredJob, safeOrgLogo]);

  // Safe Host Info Extraction
  const safeAuthorName = useMemo(() => {
    if (material.authorName) return material.authorName;
    if (material.author) {
      if (typeof material.author === 'string') {
        try {
          const parsed = JSON.parse(material.author);
          if (parsed && typeof parsed === 'object') return parsed.name || 'Society Host';
        } catch {
          return material.author;
        }
      }
      if (typeof material.author === 'object') return material.author.name || 'Society Host';
    }
    return 'Society Host';
  }, [material.authorName, material.author]);

  const safeAuthorAvatar = useMemo(() => {
    if (material.authorAvatarUrl) return material.authorAvatarUrl;
    if (material.author) {
      if (typeof material.author === 'string') {
        try {
          const parsed = JSON.parse(material.author);
          if (parsed && typeof parsed === 'object') return parsed.avatarUrl || parsed.avatar;
        } catch {
          return undefined;
        }
      }
      if (typeof material.author === 'object') return material.author.avatarUrl || material.author.avatar;
    }
    return undefined;
  }, [material.authorAvatarUrl, material.author]);

  // Stream URLs
  const streamUrl = material.livestream?.streamUrl || studioMeta?.streamUrl || '';

  // Collaborators & Co-Hosts
  const collaborators = useMemo<CollaboratorItem[]>(() => {
    try {
      const raw = material.collaborators || studioMeta?.collaborators;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  }, [material.collaborators, studioMeta?.collaborators]);

  // Corridor Color
  const category = (material.category || 'general').toLowerCase();
  const corridorColor = useMemo(() => {
    if (category.includes('capital')) return '#f59e0b';
    if (category.includes('land')) return '#10b981';
    if (category.includes('input')) return '#3b82f6';
    if (category.includes('energy')) return '#8b5cf6';
    if (category.includes('insecurity')) return '#ef4444';
    if (category.includes('harvest')) return '#059669';
    if (category.includes('talent') || category.includes('people')) return '#3b82f6';
    return '#f59e0b';
  }, [category]);

  // Target Broadcast Time
  const scheduledTime = useMemo(() => {
    const raw =
      material.livestream?.scheduledFor ||
      material.targetDate ||
      material.scheduledFor ||
      material.createdAt;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [material]);

  // Determine Lifecycle Phase
  const initialPhase = useMemo<BroadcastPhase>(() => {
    if (material.livestream?.isLive) return 'live';
    const now = Date.now();
    const eventTime = scheduledTime.getTime();
    if (material.status === 'scheduled' || eventTime > now) {
      return 'upcoming';
    }
    return 'replay';
  }, [material.status, material.livestream?.isLive, scheduledTime]);

  const [viewPhase, setViewPhase] = useState<BroadcastPhase>(initialPhase);
  useEffect(() => {
    setViewPhase(initialPhase);
  }, [initialPhase]);

  // Active Cover Image
  const coverImageUrl =
    material.thumbnailUrl ||
    CORRIDOR_COVERS[category] ||
    CORRIDOR_COVERS['post-harvest'] ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';

  // Format Badge String (e.g. "15 Slides · 3 Acts · Industry Teardown")
  const formatBadgeString = useMemo(() => {
    const slideCount = blocks.length > 0 ? blocks.length : 15;
    const rawFormat =
      appliedBlueprint?.format || appliedBlueprint?.typeTitle || 'Industry Teardown';
    const formatTitle = rawFormat.replace(/_/g, ' ').toUpperCase();
    return `${slideCount} Slides · 3 Acts · ${formatTitle}`;
  }, [blocks.length, appliedBlueprint?.format, appliedBlueprint?.typeTitle]);

  // Dynamic Host for Twitch iframe & Embeddable Video Normalization
  const [currentHost, setCurrentHost] = useState('localhost');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.hostname);
    }
  }, []);

  const { isEmbeddable: isEmbeddableVideo, embedUrl } = useMemo(() => {
    return getEmbeddableVideoUrl(streamUrl, currentHost);
  }, [streamUrl, currentHost]);

  // ── Countdown Timer State ──
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = scheduledTime.getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60));
      const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, isPast: false });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [scheduledTime]);

  // Deck Browser State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Keyboard navigation for DEF slide deck browser
  useEffect(() => {
    if (blocks.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        setActiveSlideIndex((prev) => Math.min(blocks.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blocks.length]);

  // Modals & Feedback
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  // 1-Click RSVPs
  const handleAddToGoogleCalendar = useCallback(() => {
    const gCalUrl = getGoogleCalendarUrl({
      title: material.title,
      description: material.description || 'FoodNerve Broadcast Intelligence Teardown',
      location: typeof window !== 'undefined' ? window.location.href : 'FoodNerve Live Stage',
      url: typeof window !== 'undefined' ? window.location.href : '',
      startTime: scheduledTime,
    });
    window.open(gCalUrl, '_blank', 'noopener,noreferrer');
  }, [material.title, material.description, scheduledTime]);

  const handleDownloadIcs = useCallback(() => {
    const icsContent = generateIcsContent({
      title: material.title,
      description: material.description || 'FoodNerve Broadcast Intelligence Teardown',
      location: typeof window !== 'undefined' ? window.location.href : 'FoodNerve Live Stage',
      url: typeof window !== 'undefined' ? window.location.href : '',
      startTime: scheduledTime,
    });
    downloadIcsFile(`livestream-${material.slug || 'session'}`, icsContent);
    setSnackbarMsg('Calendar (.ics) invite downloaded.');
  }, [material.title, material.description, material.slug, scheduledTime]);

  const handleCopyInviteLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setSnackbarMsg('Broadcast invite link copied to clipboard.');
    }
  }, []);

  // Slide Render Helper
  const currentSlideBlock = blocks[activeSlideIndex] || blocks[0] || null;
  const renderCurrentSlide = (block: any) => {
    if (!block) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            bgcolor: '#090d16',
            color: '#94a3b8',
            textAlign: 'center',
          }}
        >
          <LayersIcon sx={{ fontSize: 48, color: alpha(corridorColor, 0.4), mb: 2 }} />
          <Typography sx={{ fontWeight: 800, color: '#f1f5f9', mb: 0.5 }}>
            Slide Deck Staged by Host
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', maxWidth: 460 }}>
            Interactive 14–15 DEF slides will synchronize as the presenter advances through the 3 Acts.
          </Typography>
        </Box>
      );
    }
    let c = block.content;
    if (typeof c === 'string') {
      try {
        c = JSON.parse(c);
      } catch {
        c = {};
      }
    }
    const item = {
      id: block.id,
      sourceType:
        c.sourceType ||
        (block.blockType === 'rundown_act'
          ? 'act'
          : block.blockType === 'transition'
          ? 'transition'
          : block.blockType === 'job'
          ? 'job'
          : 'def_block'),
      defBlockId: c.defBlockId,
      defBlockLabel: c.defBlockLabel,
      slideIndex: c.slideIndex,
      slideCount: c.slideCount,
      act: c.act,
      originalBlockType: c.originalBlockType || block.blockType,
      originalContent: c,
      durationStr: c.durationStr || block.durationStr,
      speakerNotes: c.speakerNotes || block.speakerNotes,
    };
    try {
      return renderSlidePreviewContent(item, corridorColor, { aspectRatio: '16:9' });
    } catch {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            bgcolor: '#090d16',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            {c.title || c.label || `Slide ${activeSlideIndex + 1}`}
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: 500 }}>
            {c.subtitle || c.summary || c.notes || 'Intelligence block breakdown'}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* ═══════════════════════ BREADCRUMB PANE (STICKY FROSTED) ═══════════════════════ */}
      <Box
        sx={{
          position: 'sticky',
          top: { xs: 58, md: 64 },
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 5,
          p: 1.5,
          px: { xs: 2.5, md: 4 },
          mx: { xs: -2.5, md: -4 },
          mt: { xs: -4, md: -8 },
          bgcolor: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {/* Breadcrumb Trail: Ecosystem Directory > Livestreams > [Category] > [Title] */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            fontFamily: 'inherit',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#cbd5e1',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/categories" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box
              component="span"
              sx={{
                cursor: 'pointer',
                transition: 'color 0.2s',
                '&:hover': { color: '#ffffff' },
              }}
            >
              Ecosystem Directory
            </Box>
          </Link>

          <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />

          <Link href="/categories/livestreams" style={{ textDecoration: 'none' }}>
            <Box
              component="span"
              sx={{
                cursor: 'pointer',
                color: '#ef4444',
                bgcolor: alpha('#ef4444', 0.12),
                border: '1px solid rgba(239, 68, 68, 0.25)',
                px: 1.5,
                py: 0.4,
                borderRadius: '100px',
                textTransform: 'uppercase',
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha('#ef4444', 0.22),
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#ef4444',
                  boxShadow: '0 0 6px #ef4444',
                }}
              />
              Livestreams
            </Box>
          </Link>

          {material.category && (
            <>
              <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />
              <Link
                href={`/categories/${encodeURIComponent(category)}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Box
                  component="span"
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    color: corridorColor,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {material.category}
                </Box>
              </Link>
            </>
          )}

          <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />

          <Typography
            component="span"
            sx={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: { xs: 160, sm: 260 },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {material.title}
          </Typography>
        </Box>

        {/* Right Tools: Phase Preview Switcher & Share */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Phase Switcher Pill */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.4,
              borderRadius: '100px',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Button
              size="small"
              onClick={() => setViewPhase('upcoming')}
              sx={{
                px: 1.2,
                py: 0.25,
                borderRadius: '100px',
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: viewPhase === 'upcoming' ? corridorColor : 'transparent',
                color: viewPhase === 'upcoming' ? '#fff' : 'rgba(255,255,255,0.6)',
                '&:hover': {
                  bgcolor: viewPhase === 'upcoming' ? corridorColor : alpha(corridorColor, 0.15),
                },
              }}
            >
              Upcoming
            </Button>
            <Button
              size="small"
              onClick={() => setViewPhase('live')}
              sx={{
                px: 1.2,
                py: 0.25,
                borderRadius: '100px',
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: viewPhase === 'live' ? '#ef4444' : 'transparent',
                color: viewPhase === 'live' ? '#fff' : 'rgba(255,255,255,0.6)',
                '&:hover': {
                  bgcolor: viewPhase === 'live' ? '#dc2626' : alpha('#ef4444', 0.15),
                },
              }}
            >
              🔴 Live Now
            </Button>
            <Button
              size="small"
              onClick={() => setViewPhase('replay')}
              sx={{
                px: 1.2,
                py: 0.25,
                borderRadius: '100px',
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: viewPhase === 'replay' ? '#3b82f6' : 'transparent',
                color: viewPhase === 'replay' ? '#fff' : 'rgba(255,255,255,0.6)',
                '&:hover': {
                  bgcolor: viewPhase === 'replay' ? '#2563eb' : alpha('#3b82f6', 0.15),
                },
              }}
            >
              Replay
            </Button>
          </Box>

          <Tooltip title="Share Broadcast">
            <IconButton
              onClick={() => setShareModalOpen(true)}
              size="small"
              sx={{
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.06)',
                '&:hover': {
                  color: corridorColor,
                  bgcolor: alpha(corridorColor, 0.15),
                },
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ═══════════════════════ HERO TITLE & METADATA CAPSULE ═══════════════════════ */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        {/* Title */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.75rem', md: '3.3rem' },
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: '#ffffff',
          }}
        >
          {material.title}
        </Typography>

        {material.description && (
          <Typography
            sx={{
              maxWidth: 780,
              mx: 'auto',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            {material.description}
          </Typography>
        )}

        {/* Centered Frosted Metadata Capsule */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', sm: '90%', md: '80%' },
              p: 2.25,
              borderRadius: '18px',
              bgcolor: 'rgba(255, 255, 255, 0.025)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
              gap: 2,
            }}
          >
            {/* Top Row: Host Profile, Organization & Format Badge */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              {/* Host & Org Profile */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Avatar
                  src={safeAuthorAvatar || ''}
                  sx={{ width: 38, height: 38, fontSize: '0.85rem', bgcolor: corridorColor }}
                >
                  {safeAuthorName.charAt(0)}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      color: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {safeAuthorName}
                    <VerifiedIcon sx={{ fontSize: 15, color: corridorColor, ml: 0.6 }} />
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.25 }}>
                    {safeOrgLogo && (
                      <Avatar
                        src={safeOrgLogo}
                        sx={{ width: 14, height: 14, borderRadius: '4px' }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        color: 'rgba(255,255,255,0.5)',
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      {safeOrgName} · {category.toUpperCase()} CORRIDOR
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Format Badge */}
              <Chip
                label={formatBadgeString}
                size="small"
                sx={{
                  bgcolor: alpha(corridorColor, 0.08),
                  color: corridorColor,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  letterSpacing: '0.04em',
                  borderRadius: '8px',
                  border: `1px solid ${alpha(corridorColor, 0.22)}`,
                  height: 22,
                }}
              />
            </Box>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

            {/* Bottom Row: Broadcast Timing & Red Digital Countdown */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              {/* Scheduled Timing */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>
                  {scheduledTime.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {' · '}
                  {scheduledTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>

              {/* Lifecycle State Beacon / Countdown */}
              {viewPhase === 'upcoming' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: '#ef4444',
                      boxShadow: '0 0 6px #ef4444',
                      animation: countdown.isPast ? 'pulse 1.5s infinite' : 'none',
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#ef4444',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {countdown.isPast ? 'Status:' : 'Goes Live In:'}
                  </Typography>
                  <Box
                    sx={{
                      px: 0.9,
                      py: 0.2,
                      borderRadius: '6px',
                      bgcolor: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    <Typography
                      suppressHydrationWarning
                      sx={{
                        fontFamily: countdown.isPast ? 'inherit' : 'monospace',
                        fontWeight: 800,
                        fontSize: countdown.isPast ? '0.76rem' : '0.84rem',
                        color: '#ef4444',
                      }}
                    >
                      {countdown.isPast
                        ? 'Broadcasting Shortly · Imminent'
                        : `${String(countdown.days).padStart(2, '0')}d : ${String(countdown.hours).padStart(2, '0')}h : ${String(countdown.minutes).padStart(2, '0')}m : ${String(countdown.seconds).padStart(2, '0')}s`}
                    </Typography>
                  </Box>
                </Box>
              )}

              {viewPhase === 'live' && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    px: 1.6,
                    py: 0.45,
                    borderRadius: '100px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#ef4444',
                      boxShadow: '0 0 10px #ef4444',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: '0.76rem',
                      color: '#ef4444',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Broadcasting Live Now
                  </Typography>
                </Box>
              )}

              {viewPhase === 'replay' && (
                <Chip
                  icon={<TvIcon sx={{ fontSize: '14px !important', color: '#3b82f6 !important' }} />}
                  label="On-Demand Recording Archive"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════ ADAPTIVE 16:9 PUBLIC STAGE ═══════════════════════ */}
      <Box sx={{ mb: 8 }}>
        {/* PHASE 1: UPCOMING CINEMA STAGE & BOARDING PASS */}
        {viewPhase === 'upcoming' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* 16:9 Stage Cover with Gradient Scrim */}
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundImage: `url(${coverImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Cinematic Scrim */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.9) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: { xs: 2.5, md: 5 },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    icon={
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#ef4444',
                          boxShadow: '0 0 8px #ef4444',
                        }}
                      />
                    }
                    label="UPCOMING BROADCAST"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(15,23,42,0.85)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      letterSpacing: '0.08em',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  />
                  <Chip
                    label="1080p HD LIVE STAGE"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(15,23,42,0.85)',
                      color: '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.4rem', sm: '2rem', md: '2.5rem' },
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1.2,
                      maxWidth: '90%',
                      textShadow: '0 4px 16px rgba(0,0,0,0.7)',
                      mb: 1.5,
                    }}
                  >
                    {material.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.9rem', md: '1.1rem' },
                      color: 'rgba(255,255,255,0.85)',
                      maxWidth: '80%',
                      lineHeight: 1.5,
                    }}
                  >
                    {appliedBlueprint?.subtitle ||
                      'Tune in live for verified data points, interactive 15-slide breakdown, and immediate operator roles.'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Boarding Pass / RSVP Action Capsule */}
            <Box
              sx={{
                width: '100%',
                borderRadius: '20px',
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                overflow: 'hidden',
              }}
            >
              {/* Left Stub: Event Details */}
              <Box
                sx={{
                  flex: 1,
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                  {/* Big Date Number Box */}
                  <Box
                    sx={{
                      width: 72,
                      height: 76,
                      borderRadius: '16px',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        color: corridorColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {scheduledTime.toLocaleDateString('en-US', { month: 'short' })}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 950,
                        lineHeight: 1,
                        color: '#fff',
                      }}
                    >
                      {scheduledTime.getDate()}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {scheduledTime.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Typography>
                  </Box>

                  {/* Title & Timing Chips */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        lineHeight: 1.3,
                        color: '#ffffff',
                        mb: 1,
                      }}
                    >
                      {material.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        icon={<AccessTimeIcon sx={{ fontSize: '13px !important' }} />}
                        label={scheduledTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        sx={{
                          height: 24,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          bgcolor: alpha(corridorColor, 0.15),
                          color: corridorColor,
                          border: `1px solid ${alpha(corridorColor, 0.3)}`,
                        }}
                      />
                      <Chip
                        size="small"
                        label={`Corridor: ${material.category || 'Agribusiness'}`}
                        sx={{
                          height: 24,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          bgcolor: 'rgba(255,255,255,0.06)',
                          color: '#e2e8f0',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Bottom Strip */}
                <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  Standard 45-Minute Studio Teardown · 3 Acts · Live Executive Q&A
                </Typography>
              </Box>

              {/* Perforation Divider */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: 0,
                  borderLeft: '2px dashed rgba(255, 255, 255, 0.15)',
                  alignSelf: 'stretch',
                  my: 2,
                }}
              />

              {/* Right Stub: Countdown & 1-Click RSVPs */}
              <Box
                sx={{
                  width: { xs: '100%', md: 340 },
                  bgcolor: 'rgba(255,255,255,0.02)',
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.76rem',
                    fontWeight: 900,
                    color: '#ef4444',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: '#ef4444',
                      boxShadow: '0 0 8px #ef4444',
                      animation: countdown.isPast ? 'pulse 1.5s infinite' : 'none',
                    }}
                  />
                  {countdown.isPast ? '🔴 Broadcast Status' : '⏱️ Goes Live In'}
                </Typography>

                {/* Digital Countdown Display */}
                {countdown.isPast ? (
                  <Box
                    sx={{
                      px: 2,
                      py: 1.2,
                      borderRadius: '12px',
                      bgcolor: 'rgba(239, 68, 68, 0.12)',
                      border: '1.5px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#ef4444' }}>
                      Broadcasting Shortly · Imminent
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {[
                      { val: countdown.days, label: 'days' },
                      { val: countdown.hours, label: 'hrs' },
                      { val: countdown.minutes, label: 'mins' },
                      { val: countdown.seconds, label: 'secs' },
                    ].map((unit, idx, arr) => (
                      <React.Fragment key={idx}>
                        <Box
                          sx={{
                            textAlign: 'center',
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            border: '1.5px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '10px',
                            px: 1,
                            py: 0.6,
                            minWidth: 44,
                          }}
                        >
                          <Typography
                            suppressHydrationWarning
                            sx={{
                              fontWeight: 950,
                              fontSize: '1.3rem',
                              color: '#ef4444',
                              fontFamily: 'monospace',
                              lineHeight: 1,
                            }}
                          >
                            {String(unit.val).padStart(2, '0')}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.58rem',
                              color: '#f87171',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              mt: 0.25,
                            }}
                          >
                            {unit.label}
                          </Typography>
                        </Box>
                        {idx < arr.length - 1 && (
                          <Typography sx={{ fontWeight: 900, color: '#ef4444', fontSize: '1.1rem' }}>
                            :
                          </Typography>
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                )}

                {/* 1-Click Action Buttons */}
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddToGoogleCalendar}
                    startIcon={<CalendarIcon sx={{ fontSize: '15px !important' }} />}
                    sx={{
                      bgcolor: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      py: 1.1,
                      borderRadius: '12px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#e2e8f0' },
                    }}
                  >
                    Add to Google Calendar
                  </Button>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleDownloadIcs}
                      startIcon={<DownloadIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        py: 0.8,
                        borderRadius: '10px',
                        textTransform: 'none',
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.2)',
                        '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
                      }}
                    >
                      Download .ics
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleCopyInviteLink}
                      startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        py: 0.8,
                        borderRadius: '10px',
                        textTransform: 'none',
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.2)',
                        '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
                      }}
                    >
                      Copy Link
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* PHASE 2: LIVE BROADCAST STAGE */}
        {viewPhase === 'live' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: '#090d16',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
              }}
            >
              {isEmbeddableVideo ? (
                <iframe
                  src={embedUrl}
                  title="Livestream Broadcast"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                /* External Studio / Launchpad Mode (Google Meet, StreamYard, Zoom) */
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.7) 0%, rgba(9,13,22,0.95) 100%), url(${coverImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 0.6,
                      borderRadius: '100px',
                      bgcolor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      mb: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#ef4444',
                        boxShadow: '0 0 12px #ef4444',
                        animation: 'pulse 1.5s infinite',
                      }}
                    />
                    <Typography
                      sx={{
                        color: '#ef4444',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      On-Air Live Broadcast
                    </Typography>
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 900,
                      maxWidth: 700,
                      lineHeight: 1.25,
                      mb: 1.5,
                    }}
                  >
                    {material.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '1.05rem',
                      maxWidth: 600,
                      mb: 4,
                    }}
                  >
                    The host is actively broadcasting this session in an external studio room. Click below to join the live feed.
                  </Typography>

                  {streamUrl ? (
                    <Button
                      variant="contained"
                      size="large"
                      href={streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<RadioButtonCheckedIcon sx={{ color: '#fff' }} />}
                      sx={{
                        bgcolor: '#ef4444',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: { xs: '0.95rem', md: '1.1rem' },
                        px: { xs: 3.5, md: 5 },
                        py: 1.8,
                        borderRadius: '100px',
                        textTransform: 'none',
                        boxShadow: '0 10px 30px rgba(239, 68, 68, 0.5)',
                        '&:hover': { bgcolor: '#dc2626' },
                      }}
                    >
                      🔴 Join Live Broadcast Now ↗
                    </Button>
                  ) : (
                    <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>
                      Broadcasting link being configured by host.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* PHASE 3: REPLAY / ON-DEMAND STAGE */}
        {viewPhase === 'replay' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: '#090d16',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {isEmbeddableVideo ? (
                <iframe
                  src={embedUrl}
                  title="Broadcast Replay"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(9,13,22,0.95) 100%), url(${coverImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    textAlign: 'center',
                  }}
                >
                  <IconButton
                    size="large"
                    onClick={() => {
                      if (streamUrl) window.open(streamUrl, '_blank');
                    }}
                    sx={{
                      bgcolor: '#3b82f6',
                      color: '#fff',
                      width: 72,
                      height: 72,
                      mb: 2.5,
                      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
                      '&:hover': { bgcolor: '#2563eb', transform: 'scale(1.05)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: '2.5rem' }} />
                  </IconButton>

                  <Typography
                    variant="h5"
                    sx={{
                      color: '#fff',
                      fontWeight: 900,
                      maxWidth: 650,
                      lineHeight: 1.25,
                      mb: 1,
                    }}
                  >
                    On-Demand Recording Archive
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.65)',
                      fontSize: '0.95rem',
                      maxWidth: 550,
                    }}
                  >
                    This live session has concluded. You can review the recording above or inspect the complete 14–15 DEF slide breakdown below.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* ═══════════════════════ INTERACTIVE 14–15 DEF SLIDE DECK BROWSER ═══════════════════════ */}
      <Box sx={{ mb: 8 }}>
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '20px',
            bgcolor: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2.5,
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffffff' }}>
                Interactive DEF Slide Deck Browser
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                Flip through the 14–15 verified presentation slides to skim the intelligence teardown in 90 seconds.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: corridorColor,
                }}
              >
                Slide {blocks.length > 0 ? activeSlideIndex + 1 : 1} / {Math.max(1, blocks.length)}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                disabled={activeSlideIndex === 0 || blocks.length <= 1}
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  borderRadius: '999px',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.14)',
                  px: 1.75,
                  py: 0.4,
                  '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.04)' },
                }}
              >
                Prev
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={activeSlideIndex >= blocks.length - 1 || blocks.length <= 1}
                onClick={() => setActiveSlideIndex((prev) => Math.min(blocks.length - 1, prev + 1))}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  borderRadius: '999px',
                  bgcolor: corridorColor,
                  color: '#fff',
                  px: 1.75,
                  py: 0.4,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: alpha(corridorColor, 0.85) },
                }}
              >
                Next
              </Button>
            </Box>
          </Box>

          {/* High-Fidelity 16:9 Slide Stage */}
          <Box
            sx={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: '16px',
              overflow: 'hidden',
              bgcolor: '#000',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
              mb: 2,
            }}
          >
            {renderCurrentSlide(currentSlideBlock)}
          </Box>

          {/* Quick-Jump Slide Chips */}
          {blocks.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                overflowX: 'auto',
                pb: 0.5,
              }}
            >
              {blocks.map((_: any, idx: number) => {
                const isActive = activeSlideIndex === idx;
                return (
                  <Chip
                    key={idx}
                    label={`${idx + 1}`}
                    size="small"
                    onClick={() => setActiveSlideIndex(idx)}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      minWidth: 30,
                      height: 22,
                      bgcolor: isActive ? corridorColor : 'rgba(255,255,255,0.04)',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      border: isActive
                        ? `1px solid ${corridorColor}`
                        : '1px solid rgba(255,255,255,0.08)',
                      '&:hover': {
                        bgcolor: isActive ? corridorColor : alpha(corridorColor, 0.15),
                      },
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* ═══════════════════════ BROADCAST SPEAKERS & CO-HOSTS ═══════════════════════ */}
      <Box id="section-speakers" sx={{ mb: 8 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                bgcolor: alpha(corridorColor, 0.1),
                border: `1px solid ${alpha(corridorColor, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
              }}
            >
              🎙️
            </Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', md: '1.75rem' }, color: '#fff' }}
            >
              Broadcast Speakers & Co-Hosts
            </Typography>
          </Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.86rem' }}>
            Verified panel leaders, technical specialists, and co-hosts facilitating this live corridor session.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(280px, 1fr))' },
            gap: 2.5,
          }}
        >
          {/* Primary Host Card */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '18px',
              bgcolor: 'rgba(255, 255, 255, 0.025)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${alpha(corridorColor, 0.22)}`,
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: alpha(corridorColor, 0.38),
                bgcolor: 'rgba(255, 255, 255, 0.035)',
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 90,
                height: 90,
                background: `radial-gradient(circle at top right, ${alpha(corridorColor, 0.12)} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Avatar
                src={safeAuthorAvatar || undefined}
                sx={{
                  width: 48,
                  height: 48,
                  border: `1.5px solid ${corridorColor}`,
                  boxShadow: `0 0 10px ${alpha(corridorColor, 0.2)}`,
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  bgcolor: corridorColor,
                  color: '#fff',
                }}
              >
                {safeAuthorName?.charAt(0) || 'H'}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    {safeAuthorName}
                  </Typography>
                  <VerifiedIcon sx={{ fontSize: 15, color: corridorColor }} />
                </Box>
                <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)' }}>
                  {safeOrgName}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                pt: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Chip
                size="small"
                label="👑 Broadcast Lead"
                sx={{
                  height: 20,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  bgcolor: alpha(corridorColor, 0.08),
                  color: corridorColor,
                  border: `1px solid ${alpha(corridorColor, 0.18)}`,
                }}
              />
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#34d399',
                  bgcolor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '999px',
                  px: 1.1,
                  py: 0.25,
                }}
              >
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#10b981' }} />
                Confirmed Speaker
              </Box>
            </Box>
          </Box>

          {/* Invited Co-Hosts and Speakers */}
          {collaborators.map((collab, index) => {
            const isConfirmed = collab.status === 'accepted' || collab.status === 'confirmed';
            const isDeclined = collab.status === 'declined';
            return (
              <Box
                key={collab.email || collab.uid || index}
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor: 'rgba(255, 255, 255, 0.025)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid ${isConfirmed ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.06)'}`,
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2,
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.035)',
                    borderColor: isConfirmed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.14)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Avatar
                    src={collab.avatarUrl}
                    sx={{
                      width: 46,
                      height: 46,
                      bgcolor: isConfirmed ? '#10b981' : (isDeclined ? '#ef4444' : '#6366f1'),
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1rem',
                    }}
                  >
                    {collab.name?.charAt(0)?.toUpperCase() || collab.email?.charAt(0)?.toUpperCase() || 'C'}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                      {collab.name || collab.email?.split('@')[0]}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.74rem',
                        color: 'rgba(255,255,255,0.5)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {collab.email}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    pt: 1.5,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Chip
                    size="small"
                    label={collab.role || 'Co-Host'}
                    sx={{
                      height: 20,
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(99, 102, 241, 0.1)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(129, 140, 248, 0.2)',
                    }}
                  />

                  {/* Stage Dot Indicator */}
                  {isConfirmed ? (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#34d399',
                        bgcolor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '999px',
                        px: 1.1,
                        py: 0.25,
                      }}
                    >
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#10b981' }} />
                      Confirmed Speaker
                    </Box>
                  ) : isDeclined ? (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#f87171',
                        bgcolor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '999px',
                        px: 1.1,
                        py: 0.25,
                      }}
                    >
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#f43f5e' }} />
                      Declined
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.6,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#fbbf24',
                          bgcolor: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          borderRadius: '999px',
                          px: 1.1,
                          py: 0.25,
                        }}
                      >
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                        Invitation Pending
                      </Box>
                      {loginUrl && (
                        <Button
                          component="a"
                          href={loginUrl}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            bgcolor: 'rgba(245, 158, 11, 0.1)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            borderRadius: '999px',
                            px: 1.2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'rgba(245, 158, 11, 0.2)',
                              borderColor: '#f59e0b',
                              transform: 'translateX(1px)',
                            },
                          }}
                        >
                          Sign in to Accept →
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ═══════════════════════ 3-ACT AGENDA PREVIEW ═══════════════════════ */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '1.4rem', md: '1.85rem' } }}>
            3-Act Broadcast Agenda Breakdown
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
            Engineered through the Society DEF intelligence framework: Structural Tension, Diagnostic System Map, and Actionable Conversion.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {/* Act 1 Card */}
          <Box
            sx={{
              p: 3,
              borderRadius: '18px',
              bgcolor: 'rgba(255, 255, 255, 0.025)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                borderColor: alpha('#ef4444', 0.28),
                bgcolor: 'rgba(255, 255, 255, 0.038)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.2,
                py: 0.35,
                borderRadius: '999px',
                bgcolor: alpha('#ef4444', 0.08),
                border: `1px solid ${alpha('#ef4444', 0.2)}`,
                width: 'fit-content',
                mb: 1.8,
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#ef4444' }} />
              <Typography
                sx={{
                  color: '#ef4444',
                  fontWeight: 800,
                  fontSize: '0.66rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Act 1 · The Trigger
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.01em' }}>
              Tension & Reframe
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6, mb: 2.5, flexGrow: 1 }}>
              Exposes the critical bottleneck between official agricultural policy and reality on the ground, creating high-urgency clarity.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: '#ef4444', opacity: 0.85, flexShrink: 0 }} />
                Real-world ground footage & killer loss metrics
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: '#ef4444', opacity: 0.85, flexShrink: 0 }} />
                Reframing the problem away from raw yield
              </Typography>
            </Box>
          </Box>

          {/* Act 2 Card */}
          <Box
            sx={{
              p: 3,
              borderRadius: '18px',
              bgcolor: 'rgba(255, 255, 255, 0.025)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                borderColor: alpha('#3b82f6', 0.28),
                bgcolor: 'rgba(255, 255, 255, 0.038)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.2,
                py: 0.35,
                borderRadius: '999px',
                bgcolor: alpha('#3b82f6', 0.08),
                border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                width: 'fit-content',
                mb: 1.8,
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#3b82f6' }} />
              <Typography
                sx={{
                  color: '#3b82f6',
                  fontWeight: 800,
                  fontSize: '0.66rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Act 2 · The Diagnostic
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.01em' }}>
              Deep Diagnostic Teardown
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6, mb: 2.5, flexGrow: 1 }}>
              A 3-layer system funnel diagnosing infrastructure failure, logistics transit leakage, and distorted commercial incentives.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: '#3b82f6', opacity: 0.85, flexShrink: 0 }} />
                Ideal vs Feasible operational model
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: '#3b82f6', opacity: 0.85, flexShrink: 0 }} />
                Empirical audit of what interventions work
              </Typography>
            </Box>
          </Box>

          {/* Act 3 Card */}
          <Box
            sx={{
              p: 3,
              borderRadius: '18px',
              bgcolor: 'rgba(255, 255, 255, 0.025)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                borderColor: alpha('#10b981', 0.28),
                bgcolor: 'rgba(255, 255, 255, 0.038)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.2,
                py: 0.35,
                borderRadius: '999px',
                bgcolor: alpha('#10b981', 0.08),
                border: `1px solid ${alpha('#10b981', 0.2)}`,
                width: 'fit-content',
                mb: 1.8,
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography
                sx={{
                  color: '#10b981',
                  fontWeight: 800,
                  fontSize: '0.66rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Act 3 · The Solution
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.01em' }}>
              Solution & Opportunity
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6, mb: 2.5, flexGrow: 1 }}>
              Converts analysis directly into tangible action: verified job vacancies, deal room SPVs, and cooperative infrastructure onboarding.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981', opacity: 0.85, flexShrink: 0 }} />
                Clear ROI pathways for capital partners
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981', opacity: 0.85, flexShrink: 0 }} />
                Direct talent spotlight & role application
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════ PRE-READ INTELLIGENCE ARTICLES ═══════════════════════ */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '1.4rem', md: '1.85rem' } }}>
            Pre-Read Intelligence
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
            Foundational research articles and field evidence linked directly to this teardown session.
          </Typography>
        </Box>

        {guidingArticles.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(320px, 1fr))' },
              gap: 2.5,
            }}
          >
            {guidingArticles.map((art: any, i: number) => (
              <Link
                key={art.id || i}
                href={`/learn/article/${art.slug || art.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <Box
                  sx={{
                    p: 2.8,
                    height: '100%',
                    borderRadius: '18px',
                    bgcolor: 'rgba(255,255,255,0.025)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: alpha(corridorColor, 0.3),
                      bgcolor: 'rgba(255,255,255,0.04)',
                      boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.45)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '6px',
                          bgcolor: alpha(corridorColor, 0.1),
                          border: `1px solid ${alpha(corridorColor, 0.2)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BookIcon sx={{ fontSize: 12, color: corridorColor }} />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: corridorColor,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Anchor Article #{i + 1}
                      </Typography>
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        lineHeight: 1.35,
                        mb: 1,
                        color: '#ffffff',
                      }}
                    >
                      {art.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.84rem',
                        lineHeight: 1.55,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2.2,
                      }}
                    >
                      {art.description ||
                        'Foundational operational evidence and corridor research prepared for this session.'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                      2 min read · Verified Evidence
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.74rem',
                        color: corridorColor,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      Read Pre-Session Intelligence ↗
                    </Typography>
                  </Box>
                </Box>
              </Link>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
              borderRadius: '18px',
              bgcolor: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, color: '#fff' }}>
                Corridor Research Briefing
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', maxWidth: 650 }}>
                Explore the latest published research articles and intelligence reports across the {material.category || 'Agribusiness'} corridor in our Learning Hub.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => router.push(`/categories/${encodeURIComponent(category)}`)}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '999px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.84rem',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.12)',
                bgcolor: 'rgba(255,255,255,0.03)',
                px: 2.2,
                py: 0.9,
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  bgcolor: 'rgba(255,255,255,0.06)',
                },
              }}
            >
              Browse Corridor Articles
            </Button>
          </Box>
        )}
      </Box>

      {/* ═══════════════════════ FEATURED OPPORTUNITY CARD (ACT 3 CONVERSION) ═══════════════════════ */}
      <Box sx={{ mb: 8 }}>
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: '20px',
            bgcolor: 'rgba(16, 185, 129, 0.035)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.18)',
            boxShadow: '0 12px 36px -6px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box sx={{ maxWidth: 650 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.7,
                  px: 1.2,
                  py: 0.35,
                  borderRadius: '999px',
                  bgcolor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.22)',
                }}
              >
                <WorkIcon sx={{ fontSize: 13, color: '#10b981' }} />
                <Typography
                  sx={{
                    color: '#10b981',
                    fontWeight: 800,
                    fontSize: '0.66rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Ecosystem Conversion · Act 3
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.1,
                  py: 0.35,
                  borderRadius: '999px',
                  bgcolor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#10b981' }} />
                <Typography
                  sx={{
                    color: '#10b981',
                    fontWeight: 800,
                    fontSize: '0.64rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Verified Opportunity
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                fontSize: { xs: '1.2rem', md: '1.35rem' },
                lineHeight: 1.25,
                mb: 1,
                letterSpacing: '-0.01em',
              }}
            >
              {featuredJob?.title ||
                `Field Operations Lead — ${material.category || 'Agribusiness'} Corridor`}
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '0.88rem',
                lineHeight: 1.55,
              }}
            >
              {featuredJobOrgName}{' '}
              is actively onboarding operators, venture builders, and capital partners to execute the protocols covered in this teardown.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                if (featuredJob?.id) {
                  setJobModalOpen(true);
                } else {
                  window.location.href = loginUrl;
                }
              }}
              startIcon={<WorkIcon sx={{ fontSize: 17 }} />}
              sx={{
                bgcolor: '#10b981',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                px: 3,
                py: 1.1,
                borderRadius: '999px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#059669', boxShadow: 'none' },
              }}
            >
              {featuredJob?.ctaText || 'Inspect Ecosystem Opportunity ↗'}
            </Button>
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              Applications open to verified society members
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════ "JOIN FOODNERVE SOCIETY" CTA BANNER ═══════════════════════ */}
      <Box
        sx={{
          mt: 8,
          p: { xs: 4, md: 6 },
          borderRadius: '28px',
          bgcolor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: `0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 40px ${corridorColor}25`,
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* Ambient Radial Flare */}
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `radial-gradient(circle at 50% 0%, ${alpha(corridorColor, 0.15)} 0%, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: `0 8px 32px ${corridorColor}40`,
            mb: 3,
            position: 'relative',
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 32, color: '#fff' }} />
          <Box
            sx={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: `2px solid ${corridorColor}`,
              opacity: 0.5,
              animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)',
            }}
          />
        </Box>

        <Typography
          variant="h3"
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1.75rem', md: '2.4rem' },
            fontWeight: 900,
            mb: 1.5,
            letterSpacing: '-0.02em',
          }}
        >
          Join {tenant?.name || 'FoodNerve'} Society
        </Typography>

        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.6,
            maxWidth: 620,
            mx: 'auto',
            mb: 4,
          }}
        >
          Participate in live broadcasts, ask questions during executive Q&A, collaborate in real-time chat, and unlock exclusive deal rooms & operator opportunities.
        </Typography>

        {/* Feature Badges */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 1.5, md: 3 },
            flexWrap: 'wrap',
            mb: 4,
          }}
        >
          {['Live Broadcast Chat & Q&A', 'Cooperative Deal Rooms & SPVs', 'Direct Operator Network'].map(
            (feature, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 1.8,
                  py: 0.7,
                  borderRadius: '100px',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 16, color: corridorColor }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>
                  {feature}
                </Typography>
              </Box>
            )
          )}
        </Box>

        <Box sx={{ maxWidth: 380, mx: 'auto' }}>
          <a href={loginUrl} style={{ textDecoration: 'none', display: 'block' }}>
            <Button
              fullWidth
              size="large"
              sx={{
                background: `linear-gradient(135deg, ${corridorColor} 0%, ${alpha(corridorColor, 0.85)} 100%)`,
                color: '#ffffff',
                borderRadius: '16px',
                py: 1.8,
                fontSize: '1rem',
                fontWeight: 900,
                textTransform: 'none',
                boxShadow: `0 10px 30px ${alpha(corridorColor, 0.4)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 14px 40px ${alpha(corridorColor, 0.6)}`,
                },
              }}
            >
              Join Society to Participate Live →
            </Button>
          </a>
        </Box>
      </Box>

      {/* Global pulse keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `,
        }}
      />

      {/* Share Dialog */}
      <Dialog
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        // @ts-ignore
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            backgroundImage: 'none',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
              Share this Broadcast
            </Typography>
            <IconButton onClick={() => setShareModalOpen(false)} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: '14px',
              bgcolor: alpha(corridorColor, 0.1),
              border: `1px solid ${alpha(corridorColor, 0.25)}`,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                mb: 1,
                color: '#fff',
                lineHeight: 1.3,
              }}
            >
              {material.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={safeAuthorAvatar} sx={{ width: 22, height: 22, fontSize: '0.7rem' }}>
                {safeAuthorName.charAt(0)}
              </Avatar>
              <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                Host: {safeAuthorName} · {safeOrgName}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            disableElevation
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
              }
              setShareModalOpen(false);
              setSnackbarMsg('Broadcast link copied to clipboard.');
            }}
            sx={{
              bgcolor: corridorColor,
              color: '#fff',
              py: 1.4,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              '&:hover': { bgcolor: alpha(corridorColor, 0.85) },
            }}
          >
            Copy Invite Link
          </Button>
        </Box>
      </Dialog>

      {/* Ecosystem Job Modal */}
      {featuredJob && (
        <EcosystemJobModal
          open={jobModalOpen}
          onClose={() => setJobModalOpen(false)}
          jobId={featuredJob?.id}
          initialJobData={{
            title: featuredJob.title,
            organization: featuredJobOrgName,
            organizationLogo: featuredJobOrgLogo,
            location: featuredJob.location || 'Pan-African Corridor',
            compensationOrTarget: featuredJob.compensation || featuredJob.salary || '$45k - $60k / yr',
            ctaText: featuredJob.ctaText || 'Apply for Operator Role',
            ctaLink: featuredJob.ctaLink || loginUrl,
          }}
          accentColor={corridorColor}
          themeMode="dark"
        />
      )}

      {/* Snackbar feedback */}
      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarMsg(null)}
          severity="success"
          sx={{
            width: '100%',
            bgcolor: '#0f172a',
            color: '#fff',
            border: `1px solid ${corridorColor}`,
          }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
