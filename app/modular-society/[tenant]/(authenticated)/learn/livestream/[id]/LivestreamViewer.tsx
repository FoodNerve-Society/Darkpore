'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  Paper,
  LinearProgress,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Verified as VerifiedIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  NavigateNext as NavigateNextIcon,
  PlayArrow as PlayArrowIcon,
  Fullscreen as FullscreenIcon,
  Tv as TvIcon,
  OpenInNew as OpenInNewIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOffAlt as ThumbUpOffAltIcon,
  Send as SendIcon,
  Work as WorkIcon,
  MenuBook as BookIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  Edit as EditIcon,
  ArrowForward as ArrowForwardIcon,
  Layers as LayersIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  EmojiEvents as TrophyIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { respondToCoHostInvitation } from '@/lib/actions/learn';
import { CollaboratorItem } from '../../../components/forms/CoAuthorModal';
import { renderSlidePreviewContent } from '../../../components/forms/livestream/SlideComponents';
import LivestreamPresentationViewer from './LivestreamPresentationViewer';
import {
  getGoogleCalendarUrl,
  generateIcsContent,
  downloadIcsFile,
} from '@/components/learn/LivestreamCalendarHelper';
import { EcosystemJobModal } from '@/components/learn/blocks/EcosystemJobModal';

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

// ── Initial Discussion Mock Seed ──────────────────────────────
interface LiveComment {
  id: string;
  author: string;
  avatarUrl?: string;
  role?: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

const SEED_COMMENTS: LiveComment[] = [
  {
    id: 'lc-1',
    author: 'Amina Yusuf',
    role: 'Corridor Operator · Kaduna',
    text: 'Watching this cold-chain aggregation model closely. Looking forward to Act 2 diagnostic on reefer truck bottlenecks.',
    timestamp: '15m ago',
    likes: 8,
  },
  {
    id: 'lc-2',
    author: 'Dr. Ngozi Eze',
    role: 'Agronomy Lead',
    text: 'The pre-read article on spatial land tenure is required context for this teardown. Excited for the live session.',
    timestamp: '8m ago',
    likes: 5,
  },
];

export type BroadcastPhase = 'upcoming' | 'live' | 'replay';

interface LivestreamViewerProps {
  content: any;
  onBack?: () => void;
}

export default function LivestreamViewer({ content, onBack }: LivestreamViewerProps) {
  const router = useRouter();
  const theme = useTheme();
  const { profile, user } = useSociety();

  // ── Extract Metadata & Carrier Blocks ──
  const blocks = useMemo(() => {
    return (content.livestream?.blocks || []).filter((b: any) => b.blockType !== 'metadata');
  }, [content.livestream?.blocks]);

  const studioMeta = useMemo(() => {
    const rawBlocks = content.livestream?.blocks || [];
    for (const b of rawBlocks) {
      if (b.content) {
        try {
          const parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
          if (parsed?._studioMeta) return parsed._studioMeta;
        } catch {}
      }
    }
    return (content as any)?._studioMeta || {};
  }, [content]);

  const appliedBlueprint = studioMeta?.appliedBlueprint || null;
  const guidingArticles = studioMeta?.guidingArticles || [];
  const guidingJobs = studioMeta?.guidingJobs || [];
  const featuredJob = guidingJobs[0] || null;

  // Normalize featured job organization name and logo cleanly to avoid object-as-child runtime errors
  const featuredJobOrgName = useMemo(() => {
    if (!featuredJob) {
      const org = content.organization;
      if (typeof org === 'string') return org;
      if (typeof org === 'object' && org?.name) return org.name;
      return 'FoodNerve Cooperative';
    }
    const org = featuredJob.organization;
    if (typeof org === 'string') return org;
    if (typeof org === 'object' && org?.name) return org.name;
    if (typeof (featuredJob as any).organizationName === 'string') return (featuredJob as any).organizationName;
    const fallbackOrg = content.organization;
    if (typeof fallbackOrg === 'string') return fallbackOrg;
    if (typeof fallbackOrg === 'object' && fallbackOrg?.name) return fallbackOrg.name;
    return 'FoodNerve Cooperative';
  }, [featuredJob, content.organization]);

  const featuredJobOrgLogo = useMemo(() => {
    if (!featuredJob) {
      const org = content.organization;
      return typeof org === 'object' ? org?.logoUrl : undefined;
    }
    if (typeof featuredJob.organizationLogo === 'string') return featuredJob.organizationLogo;
    if (typeof featuredJob.organization === 'object' && featuredJob.organization?.logoUrl) {
      return featuredJob.organization.logoUrl;
    }
    const fallbackOrg = content.organization;
    return typeof fallbackOrg === 'object' ? fallbackOrg?.logoUrl : undefined;
  }, [featuredJob, content.organization]);

  // Stream links
  const streamUrl = content.livestream?.streamUrl || studioMeta?.streamUrl || '';
  const guestStudioUrl =
    studioMeta?.guestStudioUrl ||
    content.livestream?.guestStudioUrl ||
    content.guestStudioUrl ||
    '';

  // Collaborators & Acceptance State
  const [collaborators, setCollaborators] = useState<CollaboratorItem[]>(() => {
    try {
      const raw = content.collaborators || studioMeta?.collaborators;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const rawCollabs = content.collaborators || studioMeta?.collaborators;
    if (rawCollabs) {
      try {
        const raw = typeof rawCollabs === 'string'
          ? JSON.parse(rawCollabs)
          : rawCollabs;
        if (Array.isArray(raw)) setCollaborators(raw);
      } catch {}
    }
  }, [content.collaborators, studioMeta?.collaborators]);

  const userCollab = useMemo(() => {
    const myUid = profile?.uid || user?.uid || (profile as any)?.id;
    const myEmail = user?.email?.toLowerCase() || (profile as any)?.email?.toLowerCase();
    return collaborators.find(c =>
      (myUid && c.uid === myUid) ||
      (myEmail && c.email?.toLowerCase() === myEmail)
    );
  }, [collaborators, profile, user]);

  const isPendingCoHost = Boolean(userCollab && userCollab.status === 'invited');
  const isConfirmedCoHost = Boolean(
    userCollab && (userCollab.status === 'accepted' || userCollab.status === 'confirmed')
  );

  const [respondingInvitation, setRespondingInvitation] = useState(false);
  const [invitationResponseSuccess, setInvitationResponseSuccess] = useState<string | null>(null);

  const handleRespondInvitation = async (accept: boolean) => {
    if (!profile && !user) return;
    setRespondingInvitation(true);
    const myUid = profile?.uid || user?.uid || (profile as any)?.id;
    const myEmail = user?.email || (profile as any)?.email || userCollab?.email;
    try {
      const res = await respondToCoHostInvitation({
        livestreamId: content.id,
        accept,
        user: {
          uid: myUid,
          name: profile?.displayName || profile?.firstName || user?.displayName || userCollab?.name,
          email: myEmail,
          avatarUrl: profile?.avatarUrl || user?.photoURL || userCollab?.avatarUrl,
        }
      });
      if (res.success && res.collaborator) {
        setCollaborators(prev => {
          const exists = prev.some(c =>
            (myUid && c.uid === myUid) ||
            (myEmail && c.email?.toLowerCase().trim() === myEmail.toLowerCase().trim())
          );
          if (exists) {
            return prev.map(c =>
              ((myUid && c.uid === myUid) || (myEmail && c.email?.toLowerCase().trim() === myEmail.toLowerCase().trim()))
                ? res.collaborator!
                : c
            );
          }
          return [...prev, res.collaborator!];
        });
        setInvitationResponseSuccess(
          accept
            ? '🎉 You have accepted the co-host invitation! The private Backstage Studio link is now unlocked.'
            : 'You have declined the co-host invitation.'
        );
      }
    } catch (err: any) {
      console.error('Failed to respond to co-host invite:', err);
    } finally {
      setRespondingInvitation(false);
    }
  };

  // Host info & robust permission check
  const userIdentifier = profile?.uid || (profile as any)?.id;
  const isAuthor = Boolean(
    (userIdentifier && content.authorId === userIdentifier) ||
    isConfirmedCoHost ||
    (userIdentifier && content.collaborators && (
      typeof content.collaborators === 'string'
        ? content.collaborators.includes(userIdentifier)
        : Array.isArray(content.collaborators) && content.collaborators.includes(userIdentifier)
    )) ||
    profile?.organizations?.some((o: any) => o.id === content.organizationId) ||
    profile?.isAdmin
  );
  const canAccessGreenroom = Boolean((isAuthor || isConfirmedCoHost) && guestStudioUrl);

  // Category & Corridor Color
  const category = (content.category || 'general').toLowerCase();
  const corridorColor =
    category === 'capital'
      ? '#f59e0b'
      : category === 'land'
      ? '#10b981'
      : category === 'inputs'
      ? '#3b82f6'
      : category === 'energy'
      ? '#8b5cf6'
      : category === 'insecurity'
      ? '#ef4444'
      : category.includes('harvest')
      ? '#059669'
      : '#3b82f6';

  // Target Broadcast Date
  const scheduledTime = useMemo(() => {
    const raw =
      content.livestream?.scheduledFor ||
      content.targetDate ||
      content.scheduledFor ||
      content.createdAt;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [content]);

  // Determine initial phase from status and target date
  const initialPhase = useMemo<BroadcastPhase>(() => {
    if (content.livestream?.isLive) return 'live';
    const now = Date.now();
    const eventTime = scheduledTime.getTime();
    if (content.status === 'scheduled' || eventTime > now) {
      return 'upcoming';
    }
    return 'replay';
  }, [content.status, content.livestream?.isLive, scheduledTime]);

  // View state override (Creator Live State Switcher)
  const [viewPhase, setViewPhase] = useState<BroadcastPhase>(initialPhase);

  // Presenter Mode Overlay
  const [presenterModeOpen, setPresenterModeOpen] = useState(false);

  // Deck Browser / Companion Slide Index
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Modals & Snackbars
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  // Live Poll State
  const [pollVotedOption, setPollVotedOption] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState<number[]>([42, 78, 14]);

  // Discussion Comments State
  const [comments, setComments] = useState<LiveComment[]>(SEED_COMMENTS);
  const [commentInput, setCommentInput] = useState('');

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
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, isPast: false });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [scheduledTime]);

  // Active cover image
  const coverImageUrl =
    content.thumbnailUrl ||
    CORRIDOR_COVERS[category] ||
    CORRIDOR_COVERS['post-harvest'];

  // Format Badge String (e.g. "15 Slides · 3 Acts · Industry Teardown")
  const formatBadgeString = useMemo(() => {
    const slideCount = blocks.length > 0 ? blocks.length : 15;
    const rawFormat = appliedBlueprint?.format || appliedBlueprint?.typeTitle || 'Industry Teardown';
    const formatTitle = rawFormat.replace(/_/g, ' ').toUpperCase();
    return `${slideCount} Slides · 3 Acts · ${formatTitle}`;
  }, [blocks.length, appliedBlueprint?.format, appliedBlueprint?.typeTitle]);

  // Check if stream URL is embeddable (YouTube / Twitch / Vimeo)
  const isEmbeddableVideo = useMemo(() => {
    if (!streamUrl) return false;
    const lower = streamUrl.toLowerCase();
    return (
      lower.includes('youtube.com') ||
      lower.includes('youtu.be') ||
      lower.includes('twitch.tv') ||
      lower.includes('vimeo.com')
    );
  }, [streamUrl]);

  const embedUrl = useMemo(() => {
    if (!streamUrl) return '';
    if (streamUrl.includes('youtube.com/embed/')) {
      return streamUrl;
    }
    if (streamUrl.includes('youtube.com/live/')) {
      const id = streamUrl.split('youtube.com/live/')[1]?.split('?')[0]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (streamUrl.includes('youtube.com/watch?v=')) {
      const id = streamUrl.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (streamUrl.includes('youtu.be/')) {
      const id = streamUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (streamUrl.includes('twitch.tv/')) {
      const channel = streamUrl.split('twitch.tv/')[1]?.split('?')[0]?.split('/')[0];
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      return `https://player.twitch.tv/?channel=${channel}&parent=${host}`;
    }
    if (streamUrl.includes('vimeo.com/')) {
      const id = streamUrl.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return streamUrl;
  }, [streamUrl]);

  // Dynamic navigation beads according to current lifecycle phase
  const navSections = useMemo(() => {
    if (viewPhase === 'upcoming') {
      return [
        { id: 'section-stage', label: 'Broadcast Stage & Ticket' },
        { id: 'section-speakers', label: 'Speakers & Co-Hosts' },
        { id: 'section-pre-read', label: 'Pre-Read Intelligence' },
        { id: 'section-act-1', label: 'Act 1: The Open (Tension)' },
        { id: 'section-act-2', label: 'Act 2: The Meat (Diagnostic)' },
        { id: 'section-act-3', label: 'Act 3: The Close (Solution)' },
        { id: 'section-opportunity', label: 'Featured Opportunity' },
        { id: 'section-discussion', label: 'Community Discussion' },
      ];
    }
    if (viewPhase === 'live') {
      return [
        { id: 'section-stage', label: 'Live Broadcast Stream' },
        { id: 'section-speakers', label: 'Speakers & Co-Hosts' },
        { id: 'section-companion', label: 'Companion Slide Deck' },
        { id: 'section-pulse-poll', label: 'Live Pulse Poll' },
        { id: 'section-discussion', label: 'Live Q&A & Community' },
        { id: 'section-opportunity', label: 'Act 3 Opportunity' },
      ];
    }
    // Replay
    return [
      { id: 'section-stage', label: 'Recording Archive' },
      { id: 'section-speakers', label: 'Speakers & Co-Hosts' },
      { id: 'section-deck-browser', label: '15-Slide Deck Browser' },
      { id: 'section-takeaways', label: 'Executive Takeaways & Poll Outcome' },
      { id: 'section-pre-read', label: 'Linked Anchor Articles' },
      { id: 'section-opportunity', label: 'Ecosystem Opportunities' },
      { id: 'section-discussion', label: 'Discussion Archive' },
    ];
  }, [viewPhase]);

  const [activeSectionId, setActiveSectionId] = useState<string>('section-stage');

  // Real-time Scroll Spy to track sections on scroll
  useEffect(() => {
    const scrollContainer = document.getElementById('article-reader-scroll-container') || window;
    const handleScroll = () => {
      const sectionIds = navSections.map((s) => s.id);
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 280) {
            current = id;
          }
        }
      }
      setActiveSectionId(current);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navSections]);

  // ── Render Companion / Replay Slide ──
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
            Companion slides will synchronize automatically as the presenter transitions through the 3 Acts.
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
    return renderSlidePreviewContent(item, corridorColor, { aspectRatio: '16:9' });
  };

  // ── Calendar RSVP Helpers ──
  const handleAddToGoogleCalendar = () => {
    const url = getGoogleCalendarUrl({
      title: content.title,
      description: content.description,
      startTime: scheduledTime,
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadIcs = () => {
    const ics = generateIcsContent({
      title: content.title,
      description: content.description,
      startTime: scheduledTime,
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
    const filename = `${content.slug || 'livestream'}-rsvp.ics`;
    downloadIcsFile(filename, ics);
    setSnackbarMsg('Calendar (.ics) invite downloaded.');
  };

  const handleCopyInviteLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setSnackbarMsg('Broadcast invite link copied to clipboard.');
    }
  };

  // ── Comment Submission Handler ──
  const handlePostComment = () => {
    if (!commentInput.trim()) return;
    const newComment: LiveComment = {
      id: `lc-${Date.now()}`,
      author: profile?.displayName || profile?.firstName || 'Broadcast Attendee',
      role: (profile?.roles && profile.roles.length > 0) ? profile.roles[0] : (profile?.bio || 'Society Member'),
      avatarUrl: profile?.avatarUrl,
      text: commentInput.trim(),
      timestamp: 'Just now',
      likes: 0,
    };
    setComments((prev) => [newComment, ...prev]);
    setCommentInput('');
  };

  return (
    <Box sx={{ pb: 14, position: 'relative' }}>
      {/* ── Vertical Beaded Navigation Rail (Desktop) ── */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: { xs: 0, sm: -8, md: -24 },
          width: 24,
          pointerEvents: 'none',
          zIndex: 40,
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.8,
            pointerEvents: 'auto',
            py: 2,
            height: '60vh',
            maxHeight: 520,
          }}
        >
          {navSections.map((sec) => {
            const isActive = activeSectionId === sec.id;
            return (
              <Tooltip key={sec.id} title={sec.label} placement="left" arrow>
                <Box
                  onClick={() => {
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    flex: isActive ? 2 : 1,
                    width: isActive ? 8 : 4,
                    minHeight: 10,
                    borderRadius: 10,
                    bgcolor: isActive ? corridorColor : alpha(corridorColor, 0.35),
                    opacity: isActive ? 1 : 0.6,
                    boxShadow: isActive ? `0 0 14px ${corridorColor}` : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: corridorColor,
                      width: 8,
                      opacity: 1,
                      boxShadow: `0 0 14px ${corridorColor}`,
                    },
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* ═══════════════════════ STICKY FROSTED GLASS BREADCRUMB BAR ═══════════════════════ */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          p: 1.5,
          px: { xs: 2, md: 4, lg: 6 },
          mx: { xs: -2, md: -3 },
          mt: { xs: -2, md: -3 },
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(15,23,42,0.88)'
              : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(0,0,0,0.06)'
          }`,
          borderTopLeftRadius: { md: '16px' },
          borderTopRightRadius: { md: '16px' },
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {/* Left: Breadcrumbs & Capsule Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={() => {
              if (onBack) onBack();
              else router.push('/learn');
            }}
            size="small"
            sx={{
              px: 1.6,
              py: 0.4,
              borderRadius: '100px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
              border: `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)'
              }`,
              backdropFilter: 'blur(8px)',
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.16)'
                    : 'rgba(0, 0, 0, 0.1)',
                transform: 'translateX(-2px)',
              },
              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            Back to Learn
          </Button>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: 18,
              alignSelf: 'center',
              borderColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.1)',
            }}
          />

          <Box
            component="span"
            onClick={() => router.push('/learn?type=livestream')}
            sx={{
              cursor: 'pointer',
              color: '#ef4444',
              bgcolor: alpha('#ef4444', 0.1),
              px: 1.4,
              py: 0.4,
              borderRadius: '100px',
              textTransform: 'uppercase',
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: alpha('#ef4444', 0.2), transform: 'translateY(-1px)' },
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
            Livestream
          </Box>

          {content.category && (
            <>
              <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />
              <Box
                component="span"
                sx={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'capitalize',
                  color: corridorColor,
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={() =>
                  router.push(`/learn?category=${encodeURIComponent(content.category)}`)
                }
              >
                {content.category}
              </Box>
            </>
          )}

          {content.subcategory && (
            <>
              <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />
              <Box
                component="span"
                sx={{
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary' },
                }}
                onClick={() =>
                  router.push(`/learn?subcategory=${encodeURIComponent(content.subcategory)}`)
                }
              >
                {content.subcategory}
              </Box>
            </>
          )}

          {content.timeframe && (
            <>
              <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />
              <Box
                component="span"
                sx={{
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary' },
                }}
                onClick={() =>
                  router.push(`/learn?timeframe=${encodeURIComponent(content.timeframe)}`)
                }
              >
                {content.timeframe}
              </Box>
            </>
          )}
        </Box>

        {/* Right: Creator State Switcher & Action Tools */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          {/* Creator Live State Switcher (Author & Admin Testing) */}
          {isAuthor && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 0.4,
                borderRadius: '100px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.08)'
                }`,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: 'text.secondary',
                  px: 1,
                  display: { xs: 'none', sm: 'inline' },
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Preview As:
              </Typography>
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
                  bgcolor:
                    viewPhase === 'upcoming'
                      ? corridorColor
                      : 'transparent',
                  color: viewPhase === 'upcoming' ? '#fff' : 'text.secondary',
                  '&:hover': {
                    bgcolor:
                      viewPhase === 'upcoming'
                        ? corridorColor
                        : alpha(corridorColor, 0.1),
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
                  bgcolor:
                    viewPhase === 'live' ? '#ef4444' : 'transparent',
                  color: viewPhase === 'live' ? '#fff' : 'text.secondary',
                  '&:hover': {
                    bgcolor:
                      viewPhase === 'live' ? '#dc2626' : alpha('#ef4444', 0.1),
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
                  bgcolor:
                    viewPhase === 'replay' ? '#3b82f6' : 'transparent',
                  color: viewPhase === 'replay' ? '#fff' : 'text.secondary',
                  '&:hover': {
                    bgcolor:
                      viewPhase === 'replay' ? '#2563eb' : alpha('#3b82f6', 0.1),
                  },
                }}
              >
                Replay
              </Button>
            </Box>
          )}

          {/* Host Presenter Mode Trigger */}
          {isAuthor && (
            <Button
              variant="contained"
              size="small"
              startIcon={<FullscreenIcon sx={{ fontSize: '1rem !important' }} />}
              onClick={() => setPresenterModeOpen(true)}
              sx={{
                borderRadius: '100px',
                px: 1.8,
                py: 0.45,
                fontWeight: 800,
                fontSize: '0.74rem',
                textTransform: 'none',
                bgcolor: '#0f172a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              Enter Presenter Mode
            </Button>
          )}

          {/* Quick Edit in Studio Trigger */}
          {isAuthor && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon sx={{ fontSize: '0.9rem !important' }} />}
              onClick={() => router.push(`/learn?draftId=${content.id}&type=livestream`)}
              sx={{
                borderRadius: '100px',
                px: 1.6,
                py: 0.4,
                fontWeight: 800,
                fontSize: '0.74rem',
                textTransform: 'none',
                borderColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.2)',
                color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b',
                '&:hover': {
                  borderColor: corridorColor,
                  color: corridorColor,
                  bgcolor: alpha(corridorColor, 0.08),
                },
              }}
            >
              Edit Livestream
            </Button>
          )}

          {canAccessGreenroom && guestStudioUrl && (
            <Button
              component="a"
              href={guestStudioUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              size="small"
              startIcon={<RadioButtonCheckedIcon sx={{ fontSize: '13px !important', color: '#10b981' }} />}
              sx={{
                px: 1.6,
                py: 0.4,
                fontWeight: 800,
                fontSize: '0.74rem',
                textTransform: 'none',
                bgcolor: '#059669',
                color: '#fff',
                borderRadius: '100px',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                '&:hover': { bgcolor: '#047857' },
              }}
            >
              Backstage Greenroom ↗
            </Button>
          )}

          {/* Share Modal Trigger */}
          <Tooltip title="Share Broadcast">
            <IconButton
              onClick={() => setShareModalOpen(true)}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: corridorColor,
                  bgcolor: alpha(corridorColor, 0.1),
                },
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ═══════════════════════ INTERACTIVE CO-HOST INVITATION BANNER ═══════════════════════ */}
      {(isPendingCoHost || invitationResponseSuccess) && (
        <Box sx={{ maxWidth: { xs: '100%', md: '90%', lg: '85%' }, mx: 'auto', mb: 4 }}>
          <Box
            sx={{
              p: { xs: 2.25, md: 2.75 },
              borderRadius: '20px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.25)'}`,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 12px 36px -4px rgba(0, 0, 0, 0.5), 0 0 24px rgba(245, 158, 11, 0.06)'
                  : '0 12px 36px -4px rgba(245, 158, 11, 0.08), 0 4px 12px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'center' },
              justifyContent: 'space-between',
              gap: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  bgcolor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.22)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}
              >
                🎙️
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a', fontSize: '1rem', lineHeight: 1.2 }}>
                    Co-Host & Speaker Invitation
                  </Typography>
                  <Chip
                    size="small"
                    label={userCollab?.role || 'Co-Host'}
                    sx={{
                      height: 19,
                      fontWeight: 700,
                      fontSize: '0.66rem',
                      bgcolor: 'rgba(99, 102, 241, 0.1)',
                      color: '#4f46e5',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.84rem', color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#475569', mt: 0.5 }}>
                  {invitationResponseSuccess || (
                    <>
                      <strong>{content.authorName || 'The host'}</strong> has invited you to co-host this live broadcast as a <strong>{userCollab?.role || 'Co-Host'}</strong>. Accept below to unlock private backstage greenroom access and join the live stage.
                    </>
                  )}
                </Typography>
                {userCollab?.note && !invitationResponseSuccess && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.25,
                      px: 1.75,
                      borderRadius: '12px',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.16)',
                      fontSize: '0.78rem',
                      color: theme.palette.mode === 'dark' ? '#fcd34d' : '#92400e',
                      fontStyle: 'italic',
                      maxWidth: 620,
                    }}
                  >
                    “{userCollab.note}”
                  </Box>
                )}
              </Box>
            </Box>

            {isPendingCoHost && !invitationResponseSuccess && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
                <Button
                  variant="contained"
                  onClick={() => handleRespondInvitation(true)}
                  disabled={respondingInvitation}
                  startIcon={respondingInvitation ? <CircularProgress size={15} sx={{ color: '#fff' }} /> : <CheckIcon sx={{ fontSize: '15px !important' }} />}
                  sx={{
                    bgcolor: '#059669',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderRadius: '999px',
                    px: 2.4,
                    py: 0.8,
                    boxShadow: '0 2px 10px rgba(5, 150, 105, 0.25)',
                    '&:hover': { bgcolor: '#047857' },
                  }}
                >
                  {respondingInvitation ? 'Accepting...' : 'Accept Co-Host Role'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleRespondInvitation(false)}
                  disabled={respondingInvitation}
                  sx={{
                    borderColor: 'rgba(239, 68, 68, 0.25)',
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderRadius: '999px',
                    px: 2,
                    py: 0.8,
                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.05)', borderColor: '#dc2626' },
                  }}
                >
                  Decline
                </Button>
              </Box>
            )}

            {invitationResponseSuccess && userCollab?.status === 'accepted' && guestStudioUrl && (
              <Button
                component="a"
                href={guestStudioUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                startIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  bgcolor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  borderRadius: '999px',
                  px: 2.4,
                  py: 0.8,
                  boxShadow: '0 2px 10px rgba(5, 150, 105, 0.25)',
                  '&:hover': { bgcolor: '#047857' },
                  flexShrink: 0,
                }}
              >
                Enter Backstage Greenroom ↗
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* ═══════════════════════ BROADCAST TITLE & FROSTED METADATA CAPSULE ═══════════════════════ */}
      <Box sx={{ maxWidth: { xs: '100%', md: '90%', lg: '85%' }, mx: 'auto', mb: 5 }}>
        {/* Headline */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            mb: 2,
            fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' },
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
            textAlign: 'center',
          }}
        >
          {content.title}
        </Typography>

        {content.description && (
          <Typography
            sx={{
              maxWidth: 780,
              mx: 'auto',
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: { xs: '0.95rem', md: '1.15rem' },
              lineHeight: 1.5,
              mb: 4,
            }}
          >
            {content.description}
          </Typography>
        )}

        {/* Centered Frosted Glass Metadata Capsule */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', sm: '85%', md: '75%' },
              p: 2.25,
              borderRadius: '18px',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.025)'
                  : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(15,23,42,0.06)'
              }`,
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
              gap: 2,
            }}
          >
            {/* Top Row: Host Profile & Format Badge */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              {/* Host Profile */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Avatar
                  src={content.authorAvatarUrl || ''}
                  sx={{ width: 38, height: 38, fontSize: '0.85rem', bgcolor: corridorColor }}
                >
                  {(content.authorName || 'B').charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {content.authorName || 'FoodNerve Host'}
                    {content.isVerified && (
                      <VerifiedIcon sx={{ fontSize: 15, color: corridorColor, ml: 0.6 }} />
                    )}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      color: 'text.secondary',
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {typeof content.organization === 'string'
                      ? content.organization
                      : (content.organization?.name ||
                        (category ? `${category.toUpperCase()} CORRIDOR LEAD` : 'BROADCAST HOST'))}
                  </Typography>
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
                  border: `1px solid ${alpha(corridorColor, 0.18)}`,
                  height: 22,
                }}
              />
            </Box>

            <Divider
              sx={{
                borderColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(15,23,42,0.06)',
              }}
            />

            {/* Bottom Row: Timing Pill & Red Pulsing Countdown */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              {/* Timing Pill */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
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

              {/* Live Digital Countdown or Status Beacon */}
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
                      color: '#dc2626',
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
                      border: '1px solid rgba(239, 68, 68, 0.18)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: countdown.isPast ? 'inherit' : 'monospace',
                        fontWeight: 900,
                        fontSize: countdown.isPast ? '0.78rem' : '0.85rem',
                        color: '#dc2626',
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
                    bgcolor: 'rgba(239, 68, 68, 0.12)',
                    px: 1.5,
                    py: 0.4,
                    borderRadius: '100px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
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
                  label="On-Demand Replay Available"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(59, 130, 246, 0.12)',
                    color: '#3b82f6',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════ ADAPTIVE 3-PHASE STAGE MEDIA ═══════════════════════ */}
      <Box
        id="section-stage"
        sx={{
          maxWidth: { xs: '100%', md: '90%', lg: '85%' },
          mx: 'auto',
          mb: 8,
        }}
      >
        {/* ── PHASE 1: UPCOMING CINEMA STAGE & BOARDING PASS ── */}
        {viewPhase === 'upcoming' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* 16:9 Cinema Stage with Artwork & Scrim */}
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.08)'
                }`,
                backgroundImage: `url(${coverImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Cinematic Vignette Scrim */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: { xs: 2.5, md: 4.5 },
                }}
              >
                {/* Top Badge Strip */}
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
                    }}
                  />
                </Box>

                {/* Center / Bottom Title Overlay */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.25rem', md: '2.1rem' },
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1.2,
                      maxWidth: '85%',
                      textShadow: '0 4px 16px rgba(0,0,0,0.6)',
                      mb: 1,
                    }}
                  >
                    {content.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.85rem', md: '1.05rem' },
                      color: 'rgba(255,255,255,0.8)',
                      maxWidth: '75%',
                    }}
                  >
                    {appliedBlueprint?.subtitle ||
                      'Join live for an analytical teardown, 15 verified slides, and immediate talent opportunities.'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Boarding Pass / Ticket Card */}
            <Box
              sx={{
                width: '100%',
                borderRadius: '24px',
                bgcolor:
                  theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(15,23,42,0.08)'
                }`,
                boxShadow: '0 8px 30px -4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Left Stub: Event Details & Barcode */}
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
                      width: 68,
                      height: 72,
                      borderRadius: '14px',
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.04)'
                          : 'rgba(15,23,42,0.03)',
                      border: `1px solid ${
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(15,23,42,0.08)'
                      }`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        color: corridorColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {scheduledTime.toLocaleDateString('en-US', { month: 'short' })}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '1.85rem',
                        fontWeight: 900,
                        lineHeight: 1,
                        color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                      }}
                    >
                      {scheduledTime.getDate()}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        color: 'text.secondary',
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
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                        mb: 1,
                      }}
                    >
                      {content.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        icon={<AccessTimeIcon sx={{ fontSize: '12px !important' }} />}
                        label={scheduledTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: alpha(corridorColor, 0.08),
                          color: corridorColor,
                          border: `1px solid ${alpha(corridorColor, 0.16)}`,
                        }}
                      />
                      <Chip
                        size="small"
                        label={`Corridor: ${content.category || 'Agribusiness'}`}
                        sx={{
                          height: 20,
                          fontSize: '0.66rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          bgcolor: 'transparent',
                          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Bottom Barcode Strip */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pt: 1.5,
                    borderTop: `1px solid ${
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(15,23,42,0.06)'
                    }`,
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: '0.71rem', color: 'text.secondary', fontWeight: 500 }}>
                    Standard 45-Minute Studio Window · 3 Acts · Live Q&A
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', opacity: 0.35 }}>
                      {[2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2].map((w, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: w,
                            height: 10,
                            bgcolor: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        color: 'text.secondary',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ADMIT ALL VIEWERS
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Perforation Divider */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: 0,
                  borderLeft: '1.5px dashed rgba(203, 213, 225, 0.7)',
                  alignSelf: 'stretch',
                  my: 2,
                }}
              />

              {/* Right Stub: Red Countdown & 1-Click Calendar RSVPs */}
              <Box
                sx={{
                  width: { xs: '100%', md: 320 },
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.015)'
                      : 'rgba(248, 250, 252, 0.65)',
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
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#dc2626',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#ef4444',
                    }}
                  />
                  {countdown.isPast ? 'Broadcast Status' : 'Goes Live In'}
                </Typography>

                {/* Digital Monospace Countdown Units */}
                {countdown.isPast ? (
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                      bgcolor: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#dc2626' }}>
                      Broadcasting Shortly · Imminent
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.3 }}>
                      The stage is connecting to the live stream.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        bgcolor: 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: '8px',
                        px: 0.9,
                        py: 0.5,
                        minWidth: 38,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.15rem',
                          color: '#dc2626',
                          fontFamily: 'monospace',
                          lineHeight: 1,
                        }}
                      >
                        {String(countdown.days).padStart(2, '0')}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.56rem',
                          color: '#b91c1c',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          mt: 0.2,
                        }}
                      >
                        days
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: 'rgba(239, 68, 68, 0.5)', fontSize: '1rem', mb: 0.75 }}>
                      :
                    </Typography>
                    <Box
                      sx={{
                        textAlign: 'center',
                        bgcolor: 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: '8px',
                        px: 0.9,
                        py: 0.5,
                        minWidth: 38,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.15rem',
                          color: '#dc2626',
                          fontFamily: 'monospace',
                          lineHeight: 1,
                        }}
                      >
                        {String(countdown.hours).padStart(2, '0')}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.56rem',
                          color: '#b91c1c',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          mt: 0.2,
                        }}
                      >
                        hrs
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: 'rgba(239, 68, 68, 0.5)', fontSize: '1rem', mb: 0.75 }}>
                      :
                    </Typography>
                    <Box
                      sx={{
                        textAlign: 'center',
                        bgcolor: 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: '8px',
                        px: 0.9,
                        py: 0.5,
                        minWidth: 38,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.15rem',
                          color: '#dc2626',
                          fontFamily: 'monospace',
                          lineHeight: 1,
                        }}
                      >
                        {String(countdown.minutes).padStart(2, '0')}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.56rem',
                          color: '#b91c1c',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          mt: 0.2,
                        }}
                      >
                        mins
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: 'rgba(239, 68, 68, 0.5)', fontSize: '1rem', mb: 0.75 }}>
                      :
                    </Typography>
                    <Box
                      sx={{
                        textAlign: 'center',
                        bgcolor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.22)',
                        borderRadius: '8px',
                        px: 0.9,
                        py: 0.5,
                        minWidth: 38,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.15rem',
                          color: '#ef4444',
                          fontFamily: 'monospace',
                          lineHeight: 1,
                        }}
                      >
                        {String(countdown.seconds).padStart(2, '0')}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.56rem',
                          color: '#ef4444',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          mt: 0.2,
                        }}
                      >
                        secs
                      </Typography>
                    </Box>
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
                      bgcolor: '#0f172a',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      py: 1,
                      borderRadius: '10px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#1e293b' },
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
                        borderRadius: '8px',
                        textTransform: 'none',
                      }}
                    >
                      .ICS File
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
                        borderRadius: '8px',
                        textTransform: 'none',
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

        {/* ── PHASE 2: LIVE BROADCAST STAGE ── */}
        {viewPhase === 'live' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* Live Video Player Canvas */}
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: '#090d16',
                boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
                border: '1.5px solid rgba(239, 68, 68, 0.35)',
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
                /* External Studio / Launchpad Mode (Google Meet, StreamYard, Evmux, Zoom) */
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
                    {content.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#94a3b8',
                      fontSize: '1.05rem',
                      maxWidth: 600,
                      mb: 4,
                    }}
                  >
                    The host is actively broadcasting this session. Join the external live room to watch the high-fidelity feed and participate in the discussion.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {streamUrl && (
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
                          fontSize: '1rem',
                          px: 4,
                          py: 1.6,
                          borderRadius: '100px',
                          textTransform: 'none',
                          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
                          '&:hover': { bgcolor: '#dc2626' },
                        }}
                      >
                        🔴 Watch Live Broadcast Now ↗
                      </Button>
                    )}

                    {isAuthor && guestStudioUrl && (
                      <Button
                        variant="outlined"
                        size="large"
                        href={guestStudioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<OpenInNewIcon />}
                        sx={{
                          color: '#fff',
                          borderColor: 'rgba(255,255,255,0.25)',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          px: 3,
                          borderRadius: '100px',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#fff',
                            bgcolor: 'rgba(255,255,255,0.06)',
                          },
                        }}
                      >
                        Join Guest Backstage Studio ↗
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Companion Slide Deck Synchronizer (Audience Companion View) */}
            <Box
              id="section-companion"
              sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(0,0,0,0.02)',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.06)'
                }`,
              }}
            >
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LayersIcon sx={{ color: corridorColor, fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    Companion Slide Deck Synchronizer
                  </Typography>
                  <Chip
                    label={`Slide ${blocks.length > 0 ? activeSlideIndex + 1 : 1} of ${Math.max(1, blocks.length)}`}
                    size="small"
                    sx={{
                      bgcolor: alpha(corridorColor, 0.1),
                      color: corridorColor,
                      fontWeight: 800,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    disabled={activeSlideIndex === 0 || blocks.length <= 1}
                    onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Previous Slide
                  </Button>
                  <Button
                    size="small"
                    disabled={activeSlideIndex >= blocks.length - 1 || blocks.length <= 1}
                    onClick={() =>
                      setActiveSlideIndex((prev) => Math.min(blocks.length - 1, prev + 1))
                    }
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Next Slide
                  </Button>
                </Box>
              </Box>

              {/* Slide Preview Frame */}
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  bgcolor: '#000',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {renderCurrentSlide(currentSlideBlock)}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── PHASE 3: REPLAY / ARCHIVED BROADCAST STAGE ── */}
        {viewPhase === 'replay' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* Replay Video Player */}
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: '#090d16',
                boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)'
                }`,
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
                /* Archived Cover with Replay Prompt */
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
                      color: '#94a3b8',
                      fontSize: '0.95rem',
                      maxWidth: 550,
                    }}
                  >
                    This session has concluded. Watch the full recording above or skim the complete 15-slide breakdown below in 90 seconds.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Interactive 14–15 DEF Slide Deck Browser (The 90-Second Executive Skim) */}
            <Box
              id="section-deck-browser"
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: '20px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(0,0,0,0.02)',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.06)'
                }`,
              }}
            >
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
                  <Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                    Interactive Slide Deck Browser
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    Skim the complete DEF teardown sequence in 90 seconds.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
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
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                  >
                    Prev
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={activeSlideIndex >= blocks.length - 1 || blocks.length <= 1}
                    onClick={() =>
                      setActiveSlideIndex((prev) => Math.min(blocks.length - 1, prev + 1))
                    }
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '8px',
                      bgcolor: corridorColor,
                      '&:hover': { bgcolor: alpha(corridorColor, 0.85) },
                    }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>

              {/* High-Fidelity Slide Rendering Stage */}
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  bgcolor: '#000',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                  mb: 2,
                }}
              >
                {renderCurrentSlide(currentSlideBlock)}
              </Box>

              {/* Slide Pills Quick Jumper */}
              {blocks.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                    overflowX: 'auto',
                    pb: 1,
                  }}
                >
                  {blocks.map((b: any, idx: number) => {
                    const isActive = activeSlideIndex === idx;
                    return (
                      <Chip
                        key={idx}
                        label={`${idx + 1}`}
                        size="small"
                        onClick={() => setActiveSlideIndex(idx)}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          minWidth: 32,
                          bgcolor: isActive
                            ? corridorColor
                            : theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.05)',
                          color: isActive ? '#fff' : 'text.secondary',
                          '&:hover': {
                            bgcolor: isActive
                              ? corridorColor
                              : alpha(corridorColor, 0.15),
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* ═══════════════════════ BROADCAST SPEAKERS & CO-HOSTS SECTION ═══════════════════════ */}
      <Box
        id="section-speakers"
        sx={{
          maxWidth: { xs: '100%', md: '90%', lg: '85%' },
          mx: 'auto',
          mb: 8,
        }}
      >
        <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                🎙️
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', md: '1.75rem' }, color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a' }}
              >
                Broadcast Speakers & Co-Hosts
              </Typography>
            </Box>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.88rem' }}>
              Verified panel leaders, technical specialists, and co-hosts facilitating this live corridor session.
            </Typography>
          </Box>

          {canAccessGreenroom && guestStudioUrl && (
            <Button
              component="a"
              href={guestStudioUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<RadioButtonCheckedIcon sx={{ fontSize: '13px !important', color: '#10b981' }} />}
              sx={{
                bgcolor: '#059669',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'none',
                borderRadius: '999px',
                px: 2.4,
                py: 0.8,
                boxShadow: '0 2px 10px rgba(5, 150, 105, 0.25)',
                '&:hover': { bgcolor: '#047857' },
              }}
            >
              Enter Backstage Studio Greenroom ↗
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(280px, 1fr))' },
            gap: 2.5,
          }}
        >
          {/* Primary Host Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '18px',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.025)'
                  : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${alpha(corridorColor, 0.22)}`,
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                borderColor: alpha(corridorColor, 0.35),
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
                src={content.authorAvatarUrl || undefined}
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
                {content.authorName?.charAt(0) || 'H'}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a' }}>
                    {content.authorName || 'Broadcast Host'}
                  </Typography>
                  <VerifiedIcon sx={{ fontSize: 15, color: corridorColor }} />
                </Box>
                <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>
                  {typeof content.organization === 'object' ? content.organization?.name : (content.organization || 'FoodNerve Host')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, pt: 1.5, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}` }}>
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
                  color: '#059669',
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
          </Paper>

          {/* Invited Co-Hosts and Speakers */}
          {collaborators.map((collab, index) => {
            const isConfirmed = collab.status === 'accepted' || collab.status === 'confirmed';
            const isDeclined = collab.status === 'declined';
            return (
              <Paper
                key={collab.email || collab.uid || index}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.025)'
                      : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid ${isConfirmed ? 'rgba(16, 185, 129, 0.22)' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)')}`,
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2,
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                    borderColor: isConfirmed ? 'rgba(16, 185, 129, 0.4)' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.14)'),
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
                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a' }}>
                      {collab.name || collab.email?.split('@')[0]}
                    </Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {collab.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, pt: 1.5, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}` }}>
                  <Chip
                    size="small"
                    label={collab.role || 'Co-Host'}
                    sx={{
                      height: 20,
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(99, 102, 241, 0.08)',
                      color: '#4f46e5',
                      border: '1px solid rgba(99, 102, 241, 0.16)',
                    }}
                  />

                  {/* Stage Dot Indicator Capsule */}
                  {isConfirmed ? (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#059669',
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
                        color: '#e11d48',
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
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#d97706',
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
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>

      {/* ═══════════════════════ REPLAY PHASE: EXECUTIVE TAKEAWAYS & FINAL POLL OUTCOME ═══════════════════════ */}
      {viewPhase === 'replay' && (
        <Box
          id="section-takeaways"
          sx={{
            maxWidth: { xs: '100%', md: '90%', lg: '85%' },
            mx: 'auto',
            mb: 8,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '1.4rem', md: '1.85rem' } }}
            >
              Executive Takeaways & Final Poll Outcome
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
              Core conclusions synthesized from the 3 Acts and verified attendee polling consensus.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' },
              gap: 3.5,
            }}
          >
            {/* Left: 3 Executive Takeaways */}
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '20px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha(corridorColor, 0.03)
                    : alpha(corridorColor, 0.02),
                border: `1.5px solid ${alpha(corridorColor, 0.2)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    color: corridorColor,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ width: 6, height: 16, borderRadius: 2, bgcolor: corridorColor }} />
                  Executive Debrief
                </Typography>
                <Chip
                  label="VERIFIED INTELLIGENCE"
                  size="small"
                  sx={{
                    bgcolor: alpha(corridorColor, 0.1),
                    color: corridorColor,
                    fontWeight: 800,
                    fontSize: '0.66rem',
                  }}
                />
              </Box>

              {[
                {
                  act: 'Act 1 · Structural Tension',
                  title: 'Logistics Leakage Trumps Raw Farmgate Volume',
                  desc: `Audit confirms agricultural loss in the ${content.category || 'target'} corridor is driven by checkpoint extortion and haulage delays rather than inadequate harvest supply.`,
                },
                {
                  act: 'Act 2 · Systems Diagnostic',
                  title: 'Cold-Chain Aggregation Yields 4x Margin Preservation',
                  desc: 'Deploying modular decentralized cold aggregation hubs at primary jetty and truck transit nodes reduces post-harvest spoilage by 72% within 30 days.',
                },
                {
                  act: 'Act 3 · Actionable Conversion',
                  title: 'Immediate Deployment into Vetted SPVs & Vacancies',
                  desc: 'Capital and operators must bypass speculative spot intermediaries by engaging directly with verified cooperative infrastructure pipelines and active roles.',
                },
              ].map((takeaway, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${corridorColor} 0%, ${alpha(corridorColor, 0.75)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      flexShrink: 0,
                      boxShadow: `0 4px 12px ${alpha(corridorColor, 0.3)}`,
                      mt: 0.5,
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: corridorColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        mb: 0.25,
                      }}
                    >
                      {takeaway.act}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        lineHeight: 1.3,
                        color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                        mb: 0.5,
                      }}
                    >
                      {takeaway.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.84rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {takeaway.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Right: Final Poll Outcome (Audience Consensus) */}
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '20px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha('#ffffff', 0.02)
                    : alpha('#000000', 0.02),
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? alpha('#ffffff', 0.06)
                    : alpha('#000000', 0.06)
                }`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <TrendingUpIcon sx={{ color: corridorColor, fontSize: 18 }} />
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      color: corridorColor,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Final Poll Outcome · Concluded
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5, fontSize: '1.05rem', lineHeight: 1.35 }}>
                  What is the primary operational friction preventing scale in your corridor?
                </Typography>

                {/* Poll Results with Consensus Winner */}
                {[
                  { label: 'Informal checkpoint extortion & logistics leakage', votes: 42, isWinner: false },
                  { label: 'Unhedged off-take price volatility at harvest', votes: 78, isWinner: true },
                  { label: 'Lack of verified cold-chain aggregation hubs', votes: 14, isWinner: false },
                ].map((opt, idx) => {
                  const total = 42 + 78 + 14;
                  const pct = Math.round((opt.votes / total) * 100);

                  return (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: '12px',
                        border: `1.5px solid ${
                          opt.isWinner
                            ? corridorColor
                            : theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.08)'
                            : '#e2e8f0'
                        }`,
                        bgcolor: opt.isWinner
                          ? alpha(corridorColor, 0.08)
                          : theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.02)'
                          : 'rgba(0,0,0,0.01)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          {opt.isWinner && (
                            <Chip
                              icon={<TrophyIcon sx={{ fontSize: '12px !important', color: `${corridorColor} !important` }} />}
                              label="CONSENSUS WINNER"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.62rem',
                                fontWeight: 900,
                                bgcolor: alpha(corridorColor, 0.15),
                                color: corridorColor,
                              }}
                            />
                          )}
                          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                            {opt.label}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: corridorColor, ml: 1 }}>
                          {pct}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(0,0,0,0.08)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: opt.isWinner ? corridorColor : alpha(corridorColor, 0.4),
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ pt: 1.5, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', fontWeight: 600 }}>
                  Certified consensus: 134 verified society operators cast live votes during broadcast.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ═══════════════════════ UPCOMING PHASE: 3-ACT AGENDA PREVIEW ═══════════════════════ */}
      {viewPhase === 'upcoming' && (
        <Box
          sx={{
            maxWidth: { xs: '100%', md: '90%', lg: '85%' },
            mx: 'auto',
            mb: 8,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '1.4rem', md: '1.85rem' } }}
            >
              3-Act Broadcast Breakdown
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
              Structured using the Society DEF intelligence framework: Tension, Deep Diagnostic, and Opportunity Conversion.
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
              id="section-act-1"
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.025)'
                    : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(15, 23, 42, 0.08)'
                }`,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 8px 30px -4px rgba(0, 0, 0, 0.35)'
                    : '0 8px 30px -4px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  borderColor: alpha('#ef4444', 0.28),
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.038)'
                      : 'rgba(255, 255, 255, 1)',
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
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: '1.05rem',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                Tension & Reframe
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  mb: 2.5,
                  flexGrow: 1,
                }}
              >
                Exposes the critical bottleneck between official agricultural policy and reality on the ground, creating high-urgency clarity.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  pt: 1.5,
                  borderTop: `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(15, 23, 42, 0.06)'
                  }`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#ef4444', opacity: 0.85, flexShrink: 0 }} />
                  Crisis imagery and killer statistics
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#ef4444', opacity: 0.85, flexShrink: 0 }} />
                  Reframing the core bottleneck
                </Typography>
              </Box>
            </Box>

            {/* Act 2 Card */}
            <Box
              id="section-act-2"
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.025)'
                    : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(15, 23, 42, 0.08)'
                }`,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 8px 30px -4px rgba(0, 0, 0, 0.35)'
                    : '0 8px 30px -4px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  borderColor: alpha('#3b82f6', 0.28),
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.038)'
                      : 'rgba(255, 255, 255, 1)',
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
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: '1.05rem',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                Deep Diagnostic & Map
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  mb: 2.5,
                  flexGrow: 1,
                }}
              >
                Three-layer system funnel mapping symptoms, logistics corridors, and structural incentives holding the industry back.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  pt: 1.5,
                  borderTop: `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(15, 23, 42, 0.06)'
                  }`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#3b82f6', opacity: 0.85, flexShrink: 0 }} />
                  Ideal vs Feasible operational test
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#3b82f6', opacity: 0.85, flexShrink: 0 }} />
                  Empirical audit of what works
                </Typography>
              </Box>
            </Box>

            {/* Act 3 Card */}
            <Box
              id="section-act-3"
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.025)'
                    : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(15, 23, 42, 0.08)'
                }`,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 8px 30px -4px rgba(0, 0, 0, 0.35)'
                    : '0 8px 30px -4px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  borderColor: alpha('#10b981', 0.28),
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.038)'
                      : 'rgba(255, 255, 255, 1)',
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
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: '1.05rem',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                Solution & Opportunities
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  mb: 2.5,
                  flexGrow: 1,
                }}
              >
                Converts teardown insights into direct action: verified job vacancies, deal room SPVs, and cooperative participation.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  pt: 1.5,
                  borderTop: `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(15, 23, 42, 0.06)'
                  }`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981', opacity: 0.85, flexShrink: 0 }} />
                  Forked close (Status Quo vs ROI)
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981', opacity: 0.85, flexShrink: 0 }} />
                  Live talent spotlight & application link
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ═══════════════════════ PRE-READ INTELLIGENCE / LINKED ANCHOR ARTICLES ═══════════════════════ */}
      <Box
        id="section-pre-read"
        sx={{
          maxWidth: { xs: '100%', md: '90%', lg: '85%' },
          mx: 'auto',
          mb: 8,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '1.4rem', md: '1.85rem' } }}
          >
            {viewPhase === 'replay' ? 'Linked Anchor Articles' : 'Pre-Read Intelligence'}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
            Foundational research articles and field operational evidence connected to this broadcast.
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
              <Box
                key={art.id || i}
                onClick={() => router.push(`/learn/article/${art.slug || art.id}`)}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha('#ffffff', 0.03)
                      : alpha('#000000', 0.02),
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${
                    theme.palette.mode === 'dark'
                      ? alpha('#ffffff', 0.06)
                      : alpha('#000000', 0.06)
                  }`,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: alpha(corridorColor, 0.4),
                    boxShadow: `0 12px 30px ${alpha(corridorColor, 0.1)}`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <BookIcon sx={{ fontSize: 16, color: corridorColor }} />
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
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
                    fontWeight: 800,
                    lineHeight: 1.3,
                    mb: 1,
                    color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                  }}
                >
                  {art.title}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  {art.description ||
                    'Foundational research and field operational evidence prepared for this session.'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontWeight: 600 }}>
                    2 min read · Verified Evidence
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.76rem',
                      color: corridorColor,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    Read Pre-Session Intelligence ↗
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          /* Fallback Corridor Primer Card */
          <Box
            sx={{
              p: 3,
              borderRadius: '16px',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? alpha('#ffffff', 0.02)
                  : alpha('#000000', 0.02),
              border: `1px solid ${
                theme.palette.mode === 'dark'
                  ? alpha('#ffffff', 0.05)
                  : alpha('#000000', 0.05)
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Corridor Research Briefing
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', maxWidth: 650 }}>
                Explore the latest published research articles and intelligence reports across the {content.category || 'Agribusiness'} corridor in our Learning Hub.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => router.push(`/learn?category=${encodeURIComponent(content.category || 'general')}`)}
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: '100px', fontWeight: 700, textTransform: 'none' }}
            >
              Browse Corridor Articles
            </Button>
          </Box>
        )}
      </Box>

      {/* ═══════════════════════ FEATURED ECOSYSTEM OPPORTUNITY (ACT 3 CONVERSION) ═══════════════════════ */}
      <Box
        id="section-opportunity"
        sx={{
          maxWidth: { xs: '100%', md: '90%', lg: '85%' },
          mx: 'auto',
          mb: 8,
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: '20px',
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(16, 185, 129, 0.035)'
                : 'rgba(16, 185, 129, 0.04)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 12px 36px -6px rgba(0, 0, 0, 0.35)'
                : '0 8px 30px -4px rgba(16, 185, 129, 0.06)',
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
                color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                fontSize: { xs: '1.2rem', md: '1.35rem' },
                lineHeight: 1.25,
                mb: 1,
                letterSpacing: '-0.01em',
              }}
            >
              {featuredJob?.title ||
                `Field Operations Lead — ${content.category || 'Agribusiness'} Corridor`}
            </Typography>

            <Typography
              sx={{
                color: 'text.secondary',
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
                  router.push('/trade');
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
                color: 'text.secondary',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              Applications open to verified society members
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════ LIVE PULSE POLL & DISCUSSION SECTION ═══════════════════════ */}
      <Box
        id="section-discussion"
        sx={{
          maxWidth: { xs: '100%', md: '90%', lg: '85%' },
          mx: 'auto',
          mb: 8,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: viewPhase === 'replay' ? '1fr' : '1fr 1fr' },
            gap: 4,
          }}
        >
          {/* Interactive Live Pulse Poll (Rendered during Upcoming & Live phases) */}
          {viewPhase !== 'replay' && (
            <Box
              id="section-pulse-poll"
              sx={{
                p: 3.5,
                borderRadius: '20px',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha('#ffffff', 0.02)
                    : alpha('#000000', 0.02),
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? alpha('#ffffff', 0.06)
                    : alpha('#000000', 0.06)
                }`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <TrendingUpIcon sx={{ color: corridorColor, fontSize: 18 }} />
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    color: corridorColor,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Broadcast Pulse Poll
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontSize: '1.1rem' }}>
                What is the primary operational friction preventing scale in your corridor?
              </Typography>

              {/* Poll Options */}
              {[
                { label: 'Informal checkpoint extortion & logistics leakage', votes: pollVotes[0] },
                { label: 'Unhedged off-take price volatility at harvest', votes: pollVotes[1] },
                { label: 'Lack of verified cold-chain aggregation hubs', votes: pollVotes[2] },
              ].map((opt, idx) => {
                const totalVotes = pollVotes.reduce((a, b) => a + b, 0);
                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const isSelected = pollVotedOption === idx;

                return (
                  <Box
                    key={idx}
                    onClick={() => {
                      if (pollVotedOption === null) {
                        setPollVotedOption(idx);
                        const updated = [...pollVotes];
                        updated[idx] += 1;
                        setPollVotes(updated);
                      }
                    }}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: '12px',
                      border: `1.5px solid ${
                        isSelected
                          ? corridorColor
                          : theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : '#e2e8f0'
                      }`,
                      bgcolor: isSelected
                        ? alpha(corridorColor, 0.08)
                        : theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.02)'
                        : 'rgba(0,0,0,0.01)',
                      cursor: pollVotedOption === null ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: pollVotedOption === null ? corridorColor : undefined,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {opt.label}
                      </Typography>
                      {pollVotedOption !== null && (
                        <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: corridorColor }}>
                          {pct}%
                        </Typography>
                      )}
                    </Box>
                    {pollVotedOption !== null && (
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(0,0,0,0.08)',
                          '& .MuiLinearProgress-bar': { bgcolor: corridorColor },
                        }}
                      />
                    )}
                  </Box>
                );
              })}

              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 1 }}>
                {pollVotedOption === null
                  ? 'Tap an option to cast your vote.'
                  : `Vote registered. Total votes: ${pollVotes.reduce((a, b) => a + b, 0)}.`}
              </Typography>
            </Box>
          )}

          {/* Live Discussion & Questions Thread */}
          <Box
            sx={{
              p: 3.5,
              borderRadius: '20px',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? alpha('#ffffff', 0.02)
                  : alpha('#000000', 0.02),
              border: `1px solid ${
                theme.palette.mode === 'dark'
                  ? alpha('#ffffff', 0.06)
                  : alpha('#000000', 0.06)
              }`,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 520,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontSize: '1.1rem' }}>
              {viewPhase === 'replay' ? 'Discussion & Q&A Archive' : 'Attendee Discussion & Q&A'}
            </Typography>

            {/* Comments Scrollable Stream */}
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, mb: 2 }}>
              {comments.map((comment) => (
                <Box
                  key={comment.id}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: '12px',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(0,0,0,0.04)'
                    }`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={comment.avatarUrl}
                        sx={{ width: 26, height: 26, fontSize: '0.72rem' }}
                      >
                        {comment.author.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2 }}>
                          {comment.author}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                          {comment.role} · {comment.timestamp}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.75 }}>
                    {comment.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Input Box */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={
                  viewPhase === 'replay'
                    ? 'Leave a follow-up question on this recording...'
                    : 'Ask a question for the live Q&A...'
                }
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '100px',
                    fontSize: '0.82rem',
                  },
                }}
              />
              <IconButton
                onClick={handlePostComment}
                sx={{
                  bgcolor: corridorColor,
                  color: '#fff',
                  '&:hover': { bgcolor: alpha(corridorColor, 0.85) },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════ STICKY ACT 3 ECOSYSTEM CONVERSION CARD (LIVE PHASE) ═══════════════════════ */}
      {viewPhase === 'live' && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 45,
            width: { xs: '92%', sm: '80%', md: '640px' },
            p: 1.5,
            px: 2.5,
            borderRadius: '100px',
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(15, 23, 42, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 12px 36px rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <WorkIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a',
                }}
              >
                {featuredJob?.title || `${content.category || 'Agribusiness'} Operations Lead`}
              </Typography>
              <Typography
                noWrap
                sx={{
                  fontSize: '0.7rem',
                  color: '#10b981',
                  fontWeight: 700,
                }}
              >
                Act 3 Opportunity · {featuredJobOrgName}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (featuredJob?.id) {
                setJobModalOpen(true);
              } else {
                router.push('/trade');
              }
            }}
            sx={{
              borderRadius: '100px',
              px: 2.5,
              py: 0.6,
              fontWeight: 900,
              fontSize: '0.76rem',
              textTransform: 'none',
              bgcolor: '#10b981',
              color: '#ffffff',
              flexShrink: 0,
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            {featuredJob?.ctaText || 'Apply for Role ↗'}
          </Button>
        </Paper>
      )}

      {/* ═══════════════════════ FULLSCREEN PRESENTER MODE OVERLAY ═══════════════════════ */}
      {presenterModeOpen && (
        <LivestreamPresentationViewer
          content={content}
          onClose={() => setPresenterModeOpen(false)}
          initialSlideIndex={activeSlideIndex}
        />
      )}

      {/* ═══════════════════════ SHARE MODAL ═══════════════════════ */}
      <Dialog
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        slotProps={{
          paper: {
            sx: {
              bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
              backgroundImage: 'none',
              borderRadius: '16px',
              width: '100%',
              maxWidth: 420,
              p: 3,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.2rem',
            mb: 2,
            color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#0f172a',
          }}
        >
          Share Broadcast Intelligence
        </Typography>

        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: alpha(corridorColor, 0.08),
            border: `1px solid ${alpha(corridorColor, 0.2)}`,
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              mb: 0.5,
              lineHeight: 1.3,
            }}
          >
            {content.title}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
            Hosted by {content.authorName || 'FoodNerve Host'} · {formatBadgeString}
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyInviteLink}
          sx={{
            bgcolor: corridorColor,
            color: '#fff',
            py: 1.3,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 800,
            '&:hover': { bgcolor: alpha(corridorColor, 0.85) },
          }}
        >
          Copy Broadcast Link
        </Button>
      </Dialog>

      {/* ═══════════════════════ ECOSYSTEM JOB MODAL ═══════════════════════ */}
      {featuredJob && (
        <EcosystemJobModal
          open={jobModalOpen}
          onClose={() => setJobModalOpen(false)}
          jobId={featuredJob.id}
          initialJobData={{
            title: typeof featuredJob.title === 'string' ? featuredJob.title : 'Corridor Operations Lead',
            organization: featuredJobOrgName,
            organizationLogo: featuredJobOrgLogo,
            location: featuredJob.location || 'Agribusiness Corridor',
            compensationOrTarget: featuredJob.compensation || '$45k - $65k / yr',
            ctaText: featuredJob.ctaText || 'Apply for Verified Role',
            ctaLink: featuredJob.ctaLink || '/trade',
            embedType: featuredJob.embedType || 'job',
          }}
          accentColor={corridorColor}
          themeMode={theme.palette.mode}
        />
      )}

      {/* ═══════════════════════ NOTIFICATIONS ═══════════════════════ */}
      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarMsg(null)}
          severity="success"
          sx={{ borderRadius: '10px', fontWeight: 700 }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
