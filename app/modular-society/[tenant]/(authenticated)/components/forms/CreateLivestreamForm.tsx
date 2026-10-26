'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Chip, IconButton, Alert, Paper, useTheme, useMediaQuery, Dialog, DialogContent, Tooltip, Avatar, Divider, InputBase } from '@mui/material';
import { ArrowBack as ArrowBackIcon, LiveTv as LiveTvIcon, CheckCircle as CheckCircleIcon, Article as ArticleIcon, AutoAwesome as SparkleIcon, Image as ImageIcon, Check as CheckIcon, Info as InfoIcon, ArrowForward as ArrowForwardIcon, Close as CloseIcon, Bolt as BoltIcon, CalendarMonth as CalendarMonthIcon, Edit as EditIcon, AccessTime as AccessTimeIcon, ConfirmationNumber as TicketIcon, OpenInNew as OpenInNewIcon, PhotoCamera as PhotoCameraIcon, Fullscreen as FullscreenIcon, RestartAlt as RestartAltIcon, Mic as MicIcon, Sensors as SensorsIcon, Palette as PaletteIcon, AccountBalance as CapitalIcon, Landscape as LandIcon, Science as InputsIcon, Shield as SecurityIcon, Inventory as HarvestIcon, Groups as TalentIcon, People as PeopleIcon, PersonAdd as PersonAddIcon, Send as SendIcon, DeleteOutlined as DeleteIcon } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { fetchLivestreamContentPool, createLearnContent, findMatchingLivestreamDraft, CreateLearnContentPayload, ArticleBlockPayload, inviteCoHostAction } from '@/lib/actions/learn';
import { CoAuthorModal, CollaboratorItem } from './CoAuthorModal';
import LivestreamRundownBuilder from './livestream/LivestreamRundownBuilder';
import { DEF_BLOCK_DEFINITIONS, LIVESTREAM_TYPE_FLOWS } from './livestream/defBlocksConfig';
import LivestreamIdeasSidePane, { LivestreamIdeaOption, parseLivestreamPayload } from './livestream/LivestreamIdeasSidePane';
import LivestreamSlideDraftingSidePane from './livestream/LivestreamSlideDraftingSidePane';
import LivestreamScreenPreviewModal from './livestream/LivestreamScreenPreviewModal';
import LivestreamThumbnailGeneratorSidePane from './livestream/LivestreamThumbnailGeneratorSidePane';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumDatePicker from '@/components/PremiumDatePicker';
import PremiumTimePicker from '@/components/PremiumTimePicker';
import PremiumDropdown from '@/components/PremiumDropdown';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { alpha } from '@mui/system';

const CATEGORY_OPTIONS = [
  { id: 'capital', label: 'Capital', secondaryLabel: 'Financing, credit, investments & subsidies', emoji: '💰' },
  { id: 'land', label: 'Land', secondaryLabel: 'Tenure, soil health, clustering & spatial planning', emoji: '🌾' },
  { id: 'inputs', label: 'Inputs', secondaryLabel: 'Certified seeds, fertilizer & biological treatments', emoji: '🧪' },
  { id: 'energy', label: 'Energy', secondaryLabel: 'Solar cold storage, off-grid power & processing fuels', emoji: '⚡' },
  { id: 'insecurity', label: 'Insecurity', secondaryLabel: 'Risk mitigation, pastoral conflict & insurance', emoji: '🛡️' },
  { id: 'post-harvest', label: 'Post-Harvest', secondaryLabel: 'Cold chain, transit loss, aggregation & grading', emoji: '🚚' },
  { id: 'people-talent', label: 'People & Talent', secondaryLabel: 'Skilled labor, youth upskilling & agronomy', emoji: '👥' },
];

const TIMEFRAME_OPTIONS = [
  { id: 'present', label: 'Present Era', secondaryLabel: 'Immediate friction, active market disconnects & live offtake pitches', emoji: '⚡', tag: '⚡ Current' },
  { id: 'future', label: 'Future Era', secondaryLabel: 'Next-gen mechanization, AI tech & emerging career pathways', emoji: '🚀', tag: '🚀 2030' },
  { id: 'past', label: 'Past Era', secondaryLabel: 'Historical retrospect, colonial legacy & failed policy case studies', emoji: '📜', tag: '📜 History' },
];

const ERA_CONFIG: Record<string, any> = {
  past: { label: 'Past', color: '#6366f1', emoji: '📜' },
  present: { label: 'Present', color: '#10b981', emoji: '⚡' },
  future: { label: 'Future', color: '#f59e0b', emoji: '🚀' },
};

export const CATEGORY_TO_DAY_MAP: Record<string, number> = {
  capital: 1,             // Monday
  land: 2,                // Tuesday
  inputs: 3,              // Wednesday
  energy: 4,              // Thursday
  insecurity: 5,          // Friday
  'post-harvest': 6,      // Saturday
  'harvest-to-market': 6, // Saturday
  'people-talent': 0,     // Sunday
  people: 0,              // Sunday
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface CorridorPreset {
  key: string;
  name: string;
  shortName: string;
  color: string;
  url: string;
  description: string;
}

export const CORRIDOR_PRESETS: CorridorPreset[] = [
  {
    key: 'capital',
    name: 'Capital & Finance',
    shortName: 'Capital',
    color: '#3b82f6',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    description: 'Trading floors, sovereign ag-funds & liquidity corridors'
  },
  {
    key: 'land',
    name: 'Land & Agro-Corridors',
    shortName: 'Land',
    color: '#10b981',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    description: 'Fertile acreage, river basins & land tenure maps'
  },
  {
    key: 'inputs',
    name: 'Inputs & Agriscience',
    shortName: 'Inputs',
    color: '#84cc16',
    url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=1200&q=80',
    description: 'High-yield seeds, fertilizer blenders & bio-stimulants'
  },
  {
    key: 'energy',
    name: 'Energy & Cold Chain',
    shortName: 'Energy',
    color: '#f59e0b',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
    description: 'Mini-grids, solar chillers & off-grid packhouses'
  },
  {
    key: 'insecurity',
    name: 'Corridor Security & Ops',
    shortName: 'Security',
    color: '#ef4444',
    url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
    description: 'Haulage escort telemetry, checkpoint radar & asset safety'
  },
  {
    key: 'post-harvest',
    name: 'Post-Harvest & Storage',
    shortName: 'Harvest',
    color: '#ec4899',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    description: 'Dry grain silos, jetty transshipment & spoilage control'
  },
  {
    key: 'people-talent',
    name: 'Talent & Extension',
    shortName: 'Talent',
    color: '#8b5cf6',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    description: 'Lead agronomists, warehouse superintendents & operators'
  },
];

export function renderPresetIcon(key: string, color?: string) {
  const iconColor = color || 'inherit';
  switch (key) {
    case 'capital': return <CapitalIcon sx={{ fontSize: 16, color: iconColor }} />;
    case 'land': return <LandIcon sx={{ fontSize: 16, color: iconColor }} />;
    case 'inputs': return <InputsIcon sx={{ fontSize: 16, color: iconColor }} />;
    case 'energy': return <BoltIcon sx={{ fontSize: 16, color: iconColor }} />;
    case 'insecurity': return <SecurityIcon sx={{ fontSize: 16, color: iconColor }} />;
    case 'post-harvest': return <HarvestIcon sx={{ fontSize: 16, color: iconColor }} />;
    case 'people-talent': return <TalentIcon sx={{ fontSize: 16, color: iconColor }} />;
    default: return <PaletteIcon sx={{ fontSize: 16, color: iconColor }} />;
  }
}

export function getNextSlotForCategory(categorySlug: string, defaultHour = 10, defaultMinute = 0): Date {
  const normKey = (categorySlug || 'capital').toLowerCase().trim();
  const targetDay = CATEGORY_TO_DAY_MAP[normKey] !== undefined ? CATEGORY_TO_DAY_MAP[normKey] : 1;
  const now = new Date();
  const currentDay = now.getDay();

  const daysToAdd = (targetDay - currentDay + 7) % 7;
  const candidate = new Date(now);
  candidate.setDate(now.getDate() + daysToAdd);
  candidate.setHours(defaultHour, defaultMinute, 0, 0);

  // If candidate is in the past or within 2 hours from now, schedule for next week's occurrence
  if (candidate.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
}

const LIVESTREAM_FRAMEWORKS: Record<string, any[]> = {
  past: [
    { type: 'transition', role: 'Intro: Historical Context', desc: 'Set the stage by discussing the history of the disconnect.' },
    { type: 'transition', role: 'Deep Dive: Case Studies', desc: 'Review articles covering past events and jobs that were relevant.' },
    { type: 'transition', role: 'Lessons Learned', desc: 'Summarize the key takeaways from historical analysis.' }
  ],
  present: [
    { type: 'transition', role: 'Intro: The Current Disconnect', desc: 'Highlight the immediate problems happening right now.' },
    { type: 'transition', role: 'Deep Dive: Current Landscape', desc: 'Discuss recent articles and active job postings.' },
    { type: 'transition', role: 'Call to Action', desc: 'What viewers need to do today.' }
  ],
  future: [
    { type: 'transition', role: 'Intro: The Coming Shift', desc: 'Cast a vision for where the industry is heading.' },
    { type: 'transition', role: 'Deep Dive: Future Opportunities', desc: 'Review forward-looking articles and future-proof roles.' },
    { type: 'transition', role: 'Q&A / Next Steps', desc: 'Open the floor for questions on how to prepare.' }
  ]
};

export function extractStudioMetaFromDraft(draftData: any) {
  if (draftData?._studioMeta) return draftData._studioMeta;
  if (draftData?.livestream?._studioMeta) return draftData.livestream._studioMeta;
  const blocks = draftData?.livestream?.blocks || draftData?.livestreamBlocks || (draftData as any)?.blocks || [];
  for (const b of blocks) {
    try {
      if (b?._studioMeta) return b._studioMeta;
      const parsed = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
      if (parsed?._studioMeta) return parsed._studioMeta;
      if (b?.originalContent?._studioMeta) return b.originalContent._studioMeta;
    } catch (e) {}
  }
  return null;
}

export default function CreateLivestreamForm({ 
  onSuccess, 
  onCancel,
  postingAs = 'personal',
  selectedOrgId = null,
  draftId = null,
  initialTaxonomy = null,
  initialDraftData = null,
  onDraftSaved
}: any) {
  const router = useRouter();
  const params = useParams();
  const tenant = (params?.tenant as string) || 'food';
  const { profile } = useSociety();
  const { uploadFile, uploading } = useStorageUpload();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Studio metadata extracted from draft blocks or initialDraftData
  const studioMeta = useMemo(() => {
    return extractStudioMetaFromDraft(initialDraftData);
  }, [initialDraftData]);

  // Hub & Context from Studio Handoff
  const hubTitle = studioMeta?.hubTitle || initialTaxonomy?.hubTitle || initialDraftData?.livestream?.hub?.title || 'Production & Capital';
  const hubColor = studioMeta?.hubColor || initialTaxonomy?.hubColor || initialDraftData?.livestream?.hub?.color || '#10b981';

  const [appliedBlueprint, setAppliedBlueprint] = useState<any>(
    studioMeta?.appliedBlueprint || initialDraftData?.livestream?.blueprint || (initialDraftData as any)?.blueprint || null
  );

  // Requirement 1: Dynamically initialize step: if initialDraftData has slide blocks (rundownBlocks.length > 0)
  // or an appliedBlueprint (from _studioMeta or draft.livestream.blueprint), initialize step to 2 instead of 1.
  const [step, setStep] = useState<number>(() => {
    const rawBlocks = initialDraftData?.livestream?.blocks || initialDraftData?.livestreamBlocks || (initialDraftData as any)?.blocks || [];
    const hasSlides = rawBlocks.filter((b: any) => b.blockType !== 'metadata').length > 0;
    const initialMeta = extractStudioMetaFromDraft(initialDraftData);
    const hasBlueprint = Boolean(initialMeta?.appliedBlueprint || initialDraftData?.livestream?.blueprint || (initialDraftData as any)?.blueprint);
    return (hasSlides || hasBlueprint) ? 2 : 1;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentPool, setContentPool] = useState<{ articles: any[], jobs: any[] } | null>(null);

  // Track draft ID for updating in-place
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(
    (draftId && draftId !== 'new') ? draftId : (initialDraftData?.type === 'livestream' && initialDraftData?.id ? initialDraftData.id : null)
  );
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Auto-Save & Collision Detection State
  const [detectedDraft, setDetectedDraft] = useState<any | null>(null);
  const [checkingDraft, setCheckingDraft] = useState<boolean>(false);
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [lastAutosavedAt, setLastAutosavedAt] = useState<Date | null>(null);
  const [userDeclinedResume, setUserDeclinedResume] = useState<boolean>(
    Boolean(initialTaxonomy?.forceNewDraft)
  );
  const lastSavedContentRef = useRef<string>('');

  // Ideation Assistant & Studio Slideshow State
  const [isIdeasDrawerOpen, setIsIdeasDrawerOpen] = useState(false);
  const [isDraftingDrawerOpen, setIsDraftingDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isThumbnailDrawerOpen, setIsThumbnailDrawerOpen] = useState(false);

  // Requirement 2: Multi-tier hydration for ingestedBlueprints:
  // Tier 1: studioMeta?.ingestedBlueprints (from draft blocks / metadata)
  // Tier 2: localStorage payload for category or general parsed via parseLivestreamPayload
  // Fallback: [appliedBlueprint]
  const [ingestedBlueprints, setIngestedBlueprints] = useState<LivestreamIdeaOption[]>(() => {
    const initialMeta = extractStudioMetaFromDraft(initialDraftData);
    if (Array.isArray(initialMeta?.ingestedBlueprints) && initialMeta.ingestedBlueprints.length > 0) {
      return initialMeta.ingestedBlueprints;
    }

    if (typeof window !== 'undefined') {
      try {
        const catKey = (initialTaxonomy?.category || initialDraftData?.category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const hub = initialTaxonomy?.hubTitle || initialDraftData?.livestream?.hub?.title || 'Production & Capital';
        const savedPayload =
          localStorage.getItem(`ls_ideas_ingest_${catKey}_latest_payload`) ||
          localStorage.getItem('ls_ideas_ingest_latest_payload');
        if (savedPayload) {
          const parsed = parseLivestreamPayload(savedPayload, hub, catKey);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }

    const initialBp = initialMeta?.appliedBlueprint || initialDraftData?.livestream?.blueprint;
    if (initialBp) {
      return [initialBp];
    }

    return [];
  });

  // Requirement 4: Synchronize deckActiveIndex: initialize to index of appliedBlueprint
  const [deckActiveIndex, setDeckActiveIndex] = useState<number>(() => {
    const initialMeta = extractStudioMetaFromDraft(initialDraftData);
    const initialBp = initialMeta?.appliedBlueprint || initialDraftData?.livestream?.blueprint || (initialDraftData as any)?.blueprint;
    if (initialBp && ingestedBlueprints.length > 0) {
      const target = initialBp.title?.trim().toLowerCase();
      const idx = ingestedBlueprints.findIndex((b: any) => b.title?.trim().toLowerCase() === target);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const lastAlignedBlueprintRef = useRef<string | null>(
    (studioMeta?.appliedBlueprint || initialDraftData?.livestream?.blueprint || (initialDraftData as any)?.blueprint)?.title?.trim().toLowerCase() || null
  );

  useEffect(() => {
    if (appliedBlueprint?.title && ingestedBlueprints.length > 0) {
      const target = appliedBlueprint.title.trim().toLowerCase();
      if (lastAlignedBlueprintRef.current !== target) {
        lastAlignedBlueprintRef.current = target;
        const idx = ingestedBlueprints.findIndex((b: any) => b.title?.trim().toLowerCase() === target);
        if (idx >= 0) {
          setDeckActiveIndex(idx);
        }
      }
    }
  }, [appliedBlueprint?.title, ingestedBlueprints]);

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isIdeasCardFlipped, setIsIdeasCardFlipped] = useState(false);
  const [isScheduleFlipped, setIsScheduleFlipped] = useState(false);
  const [isStep3ScheduleFlipped, setIsStep3ScheduleFlipped] = useState(false);

  const resolvedFormat = useMemo(() => {
    const bpFmt = appliedBlueprint?.format;
    const bpTitle = (appliedBlueprint?.typeTitle || appliedBlueprint?.title || '').toLowerCase();
    if (bpFmt && LIVESTREAM_TYPE_FLOWS[bpFmt]) return bpFmt;
    if (bpTitle.includes('teardown') || bpTitle.includes('audit')) return 'industry_teardown';
    if (bpTitle.includes('debate') || bpTitle.includes('panel')) return 'panel_debate';
    if (bpTitle.includes('talent') || bpTitle.includes('spotlight') || bpTitle.includes('job')) return 'talent_spotlight';
    return 'industry_teardown';
  }, [appliedBlueprint]);

  const manualFieldsRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timingCardRef = useRef<HTMLDivElement>(null);
  const coverCardRef = useRef<HTMLDivElement>(null);

  const handleNextCard = () => {
    setIsCardFlipped(false);
    setDeckActiveIndex(prev => Math.min(ingestedBlueprints.length - 1, prev + 1));
  };

  const handlePrevCard = () => {
    setIsCardFlipped(false);
    setDeckActiveIndex(prev => Math.max(0, prev - 1));
  };

  const currentBlueprint = (ingestedBlueprints.length > 0 && ingestedBlueprints[deckActiveIndex]) ? ingestedBlueprints[deckActiveIndex] : (ingestedBlueprints[0] || null);

  const guidingArticles = useMemo(() => {
    const list = [...(studioMeta?.guidingArticles || initialDraftData?.anchorArticles || initialDraftData?.livestream?.anchorArticles || [])];
    if (initialDraftData?.type === 'article' && initialDraftData.id && !list.some((a: any) => a.id === initialDraftData.id)) {
      list.unshift(initialDraftData);
    }
    return list;
  }, [initialDraftData, studioMeta]);
  const guidingJobs = studioMeta?.guidingJobs || initialDraftData?.livestream?.ctaJobs || [];
  const guidingListings = studioMeta?.guidingListings || initialDraftData?.livestream?.ctaListings || [];
  const guidingCampaigns = studioMeta?.guidingCampaigns || initialDraftData?.livestream?.ctaCampaigns || [];

  const hubCategoryPillars = useMemo(() => {
    const hubKey = (hubTitle || '').toLowerCase();
    if (hubKey.includes('production') || hubKey.includes('capital')) {
      return ['capital', 'land', 'inputs'];
    }
    if (hubKey.includes('resilience') || hubKey.includes('energy') || hubKey.includes('security')) {
      return ['energy', 'insecurity'];
    }
    if (hubKey.includes('market') || hubKey.includes('talent') || hubKey.includes('people')) {
      return ['harvest-to-market', 'post-harvest', 'people-talent'];
    }
    return ['capital', 'land', 'inputs'];
  }, [hubTitle]);

  // Form State
  const [title, setTitle] = useState(initialDraftData?.title || '');
  const [description, setDescription] = useState(initialDraftData?.description || '');
  const [coverImage, setCoverImage] = useState<File | string | null>(initialDraftData?.thumbnailUrl || initialDraftData?.coverImageUrl || null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState(initialDraftData?.livestream?.streamUrl || studioMeta?.streamUrl || initialDraftData?.livestreamUrl || '');
  const [guestStudioUrl, setGuestStudioUrl] = useState(studioMeta?.guestStudioUrl || initialDraftData?.livestream?.guestStudioUrl || initialDraftData?.guestStudioUrl || '');

  const [eventDate, setEventDate] = useState<string>(() => {
    const scheduledDate = initialDraftData?.targetDate || initialDraftData?.livestream?.scheduledFor || initialDraftData?.livestream?.eventDate;
    if (scheduledDate) {
      const d = new Date(scheduledDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${mins}:00`;
      }
    }
    const slotDate = getNextSlotForCategory(initialTaxonomy?.category || initialDraftData?.category || 'capital', 10, 0);
    const year = slotDate.getFullYear();
    const month = String(slotDate.getMonth() + 1).padStart(2, '0');
    const day = String(slotDate.getDate()).padStart(2, '0');
    const hours = String(slotDate.getHours()).padStart(2, '0');
    const mins = String(slotDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}:00`;
  });
  
  // Step 3 (Communications) State
  const initialComms = studioMeta?.communications || initialDraftData?.livestream?.communications;
  const [guestMessageText, setGuestMessageText] = useState(initialComms?.guestMessage?.text || '');
  const [guestButtonText, setGuestButtonText] = useState(initialComms?.guestMessage?.buttonText || '');
  
  const [audienceMessageText, setAudienceMessageText] = useState(initialComms?.audienceMessage?.text || '');
  const [audienceButtonText, setAudienceButtonText] = useState(initialComms?.audienceMessage?.buttonText || '');
  
  // Collaborators & Co-Host State
  const [collaborators, setCollaborators] = useState<CollaboratorItem[]>(() => {
    if (initialDraftData?.collaborators) {
      try {
        return typeof initialDraftData.collaborators === 'string'
          ? JSON.parse(initialDraftData.collaborators)
          : initialDraftData.collaborators;
      } catch (e) {
        return [];
      }
    }
    if (studioMeta?.collaborators && Array.isArray(studioMeta.collaborators)) {
      return studioMeta.collaborators;
    }
    return [];
  });
  const [isCoHostModalOpen, setIsCoHostModalOpen] = useState(false);
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlineRole, setInlineRole] = useState<'Co-Host' | 'Guest Panelist' | 'Moderator' | 'Technical Presenter'>('Co-Host');
  const [invitingCoHost, setInvitingCoHost] = useState(false);
  const [coHostNotification, setCoHostNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (initialDraftData) {
      if (initialDraftData.collaborators) {
        try {
          const parsed = typeof initialDraftData.collaborators === 'string'
            ? JSON.parse(initialDraftData.collaborators)
            : initialDraftData.collaborators;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCollaborators(parsed);
          }
        } catch (e) {}
      } else if (studioMeta?.collaborators && Array.isArray(studioMeta.collaborators)) {
        setCollaborators(studioMeta.collaborators);
      }
    }
  }, [initialDraftData, studioMeta]);

  const handleAddInlineCoHost = async () => {
    if (!inlineEmail.trim()) {
      setCoHostNotification({ type: 'error', message: 'Please enter a valid co-host email.' });
      return;
    }
    const email = inlineEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setCoHostNotification({ type: 'error', message: 'Please enter a valid email address (e.g. speaker@organization.com).' });
      return;
    }
    if (collaborators.some(c => c.email?.toLowerCase().trim() === email)) {
      setCoHostNotification({ type: 'error', message: 'This email is already in the invited roster.' });
      return;
    }
    setInvitingCoHost(true);
    setCoHostNotification(null);
    try {
      let activeDraftId = currentDraftId;
      if (!activeDraftId) {
        const saveRes = await handleSave(false, { isAutoSave: true });
        if (saveRes?.id) {
          activeDraftId = saveRes.id;
          setCurrentDraftId(saveRes.id);
        }
      }

      const newCollab: CollaboratorItem = {
        name: email.split('@')[0],
        email: email,
        role: inlineRole,
        status: 'invited',
        timestamp: new Date().toISOString(),
        invitedAt: new Date().toISOString(),
      };

      const res = await inviteCoHostAction({
        draftId: activeDraftId || undefined,
        collaborator: newCollab,
        inviterName: profile?.displayName || profile?.firstName || 'Broadcast Host',
        livestreamTitle: title,
        scheduledTime: eventDate,
        category,
        tenant,
        guestStudioUrl,
      });

      if (res.success) {
        setCollaborators(prev => [...prev, (res.collaborator as CollaboratorItem) || newCollab]);
        setInlineEmail('');
        setCoHostNotification({ type: 'success', message: `Invitation dispatched to ${email}!` });
        setTimeout(() => setCoHostNotification(null), 4000);
      } else {
        setCoHostNotification({ type: 'error', message: res.error || 'Failed to dispatch invitation.' });
      }
    } catch (err: any) {
      setCoHostNotification({ type: 'error', message: err.message || 'Error sending invite.' });
    } finally {
      setInvitingCoHost(false);
    }
  };

  const handleResendCoHostInvite = async (collab: CollaboratorItem) => {
    try {
      let activeDraftId = currentDraftId;
      if (!activeDraftId) {
        const saveRes = await handleSave(false, { isAutoSave: true });
        if (saveRes?.id) {
          activeDraftId = saveRes.id;
          setCurrentDraftId(saveRes.id);
        }
      }

      const res = await inviteCoHostAction({
        draftId: activeDraftId || undefined,
        collaborator: collab,
        inviterName: profile?.displayName || profile?.firstName || 'Broadcast Host',
        livestreamTitle: title,
        scheduledTime: eventDate,
        category,
        tenant,
        guestStudioUrl,
      });
      if (res.success) {
        setCoHostNotification({ type: 'success', message: `Invitation resent to ${collab.email}` });
        setTimeout(() => setCoHostNotification(null), 3500);
      }
    } catch (err: any) {
      setCoHostNotification({ type: 'error', message: err.message || 'Failed to resend invite.' });
    }
  };

  const handleRemoveCoHost = (indexToRemove: number) => {
    setCollaborators(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Taxonomy State
  const [category, setCategory] = useState(initialDraftData?.category || initialTaxonomy?.category || 'capital');
  const [subcategory, setSubcategory] = useState(initialDraftData?.subcategory || initialTaxonomy?.subcategory || '');
  const [timeframe, setTimeframe] = useState(initialDraftData?.timeframe || initialTaxonomy?.timeframe || 'present');

  // Tier 2 Hydration on mount/category change if ingestedBlueprints is empty
  useEffect(() => {
    if (ingestedBlueprints.length === 0 && typeof window !== 'undefined') {
      try {
        const catKey = (category || initialTaxonomy?.category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const savedPayload =
          localStorage.getItem(`ls_ideas_ingest_${catKey}_latest_payload`) ||
          localStorage.getItem('ls_ideas_ingest_latest_payload');
        if (savedPayload) {
          const parsed = parseLivestreamPayload(savedPayload, hubTitle, category || 'general');
          if (Array.isArray(parsed) && parsed.length > 0) {
            setIngestedBlueprints(parsed);
          }
        }
      } catch (e) {}
    }
  }, [category, hubTitle, ingestedBlueprints.length]);

  const activeCoverUrl = useMemo(() => {
    if (coverImage) {
      return typeof coverImage === 'string' ? coverImage : URL.createObjectURL(coverImage);
    }
    const preset = CORRIDOR_PRESETS.find(p => p.key === category);
    return preset?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';
  }, [coverImage, category]);

  // Smart Link Memory: auto-prefill from last livestream or localStorage
  const [linksPrefilledFromMemory, setLinksPrefilledFromMemory] = useState(false);

  useEffect(() => {
    // If both links already have values, no need to auto-fill
    if (guestStudioUrl && streamUrl) return;

    queueMicrotask(() => {
      let candidateGuest = guestStudioUrl;
      let candidateStream = streamUrl;
      let didPrefill = false;

      // 1. Check contentPool?.lastUsedLinks
      const lastUsed = (contentPool as any)?.lastUsedLinks;
      if (lastUsed) {
        if (!candidateGuest && lastUsed.guestStudioUrl) {
          candidateGuest = lastUsed.guestStudioUrl;
          didPrefill = true;
        }
        if (!candidateStream && lastUsed.streamUrl) {
          candidateStream = lastUsed.streamUrl;
          didPrefill = true;
        }
        if (lastUsed.communications) {
          if (!guestMessageText && lastUsed.communications.guestMessage?.text) {
            setGuestMessageText(lastUsed.communications.guestMessage.text);
          }
          if (!guestButtonText && lastUsed.communications.guestMessage?.buttonText) {
            setGuestButtonText(lastUsed.communications.guestMessage.buttonText);
          }
          if (!audienceMessageText && lastUsed.communications.audienceMessage?.text) {
            setAudienceMessageText(lastUsed.communications.audienceMessage.text);
          }
          if (!audienceButtonText && lastUsed.communications.audienceMessage?.buttonText) {
            setAudienceButtonText(lastUsed.communications.audienceMessage.buttonText);
          }
        }
      }

      // 2. Check localStorage fallback if either is still missing
      if (typeof window !== 'undefined' && (!candidateGuest || !candidateStream)) {
        try {
          const storageKey = `foodnerve_last_livestream_links_${profile?.uid || 'default'}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (!candidateGuest && parsed.guestStudioUrl) {
              candidateGuest = parsed.guestStudioUrl;
              didPrefill = true;
            }
            if (!candidateStream && parsed.streamUrl) {
              candidateStream = parsed.streamUrl;
              didPrefill = true;
            }
            if (parsed.communications && !lastUsed?.communications) {
              if (!guestMessageText && parsed.communications.guestMessage?.text) {
                setGuestMessageText(parsed.communications.guestMessage.text);
              }
              if (!guestButtonText && parsed.communications.guestMessage?.buttonText) {
                setGuestButtonText(parsed.communications.guestMessage.buttonText);
              }
              if (!audienceMessageText && parsed.communications.audienceMessage?.text) {
                setAudienceMessageText(parsed.communications.audienceMessage.text);
              }
              if (!audienceButtonText && parsed.communications.audienceMessage?.buttonText) {
                setAudienceButtonText(parsed.communications.audienceMessage.buttonText);
              }
            }
          }
        } catch (e) {}
      }

      if (candidateGuest !== guestStudioUrl) setGuestStudioUrl(candidateGuest);
      if (candidateStream !== streamUrl) setStreamUrl(candidateStream);
      if (didPrefill) setLinksPrefilledFromMemory(true);
    });
  }, [(contentPool as any)?.lastUsedLinks, profile?.uid]);

  const updateGuestStudioUrl = (val: string) => {
    setGuestStudioUrl(val);
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `foodnerve_last_livestream_links_${profile?.uid || 'default'}`;
        const stored = localStorage.getItem(storageKey);
        const prev = stored ? JSON.parse(stored) : {};
        localStorage.setItem(storageKey, JSON.stringify({ ...prev, guestStudioUrl: val }));
      } catch (e) {}
    }
  };

  const updateStreamUrl = (val: string) => {
    setStreamUrl(val);
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `foodnerve_last_livestream_links_${profile?.uid || 'default'}`;
        const stored = localStorage.getItem(storageKey);
        const prev = stored ? JSON.parse(stored) : {};
        localStorage.setItem(storageKey, JSON.stringify({ ...prev, streamUrl: val }));
      } catch (e) {}
    }
  };

  // Auto-sync schedule when category changes if user hasn't manually customized a pre-existing saved draft
  const hasLoadedInitialDate = useRef(Boolean(initialDraftData?.targetDate || initialDraftData?.livestream?.scheduledFor || initialDraftData?.livestream?.eventDate));
  const isFirstCategoryRun = useRef(true);
  useEffect(() => {
    if (isFirstCategoryRun.current) {
      isFirstCategoryRun.current = false;
      return;
    }
    if (!hasLoadedInitialDate.current) {
      const slotDate = getNextSlotForCategory(category || 'capital', 10, 0);
      const year = slotDate.getFullYear();
      const month = String(slotDate.getMonth() + 1).padStart(2, '0');
      const day = String(slotDate.getDate()).padStart(2, '0');
      const hours = String(slotDate.getHours()).padStart(2, '0');
      const mins = String(slotDate.getMinutes()).padStart(2, '0');
      setEventDate(`${year}-${month}-${day}T${hours}:${mins}:00`);
    }
  }, [category]);

  // Live Clock & Ticket Helpers
  const [currentTime, setCurrentTime] = useState<number>(0);
  useEffect(() => {
    queueMicrotask(() => setCurrentTime(Date.now()));
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const ticketDateObj = useMemo(() => {
    if (!eventDate) return null;
    const d = new Date(eventDate);
    if (isNaN(d.getTime())) return null;
    return d;
  }, [eventDate]);

  const ticketMonth = useMemo(() => {
    if (!ticketDateObj) return 'OCT';
    return ticketDateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  }, [ticketDateObj]);

  const ticketDayNumber = useMemo(() => {
    if (!ticketDateObj) return '20';
    return String(ticketDateObj.getDate());
  }, [ticketDateObj]);

  const ticketDayName = useMemo(() => {
    if (!ticketDateObj) return 'TUESDAY';
    return ticketDateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  }, [ticketDateObj]);

  const ticketTimeString = useMemo(() => {
    if (!ticketDateObj) return '10:00 AM WAT';
    try {
      return ticketDateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ' WAT';
    } catch {
      return '10:00 AM WAT';
    }
  }, [ticketDateObj]);

  const countdown = useMemo(() => {
    if (!ticketDateObj) return null;
    const diffMs = ticketDateObj.getTime() - currentTime;
    if (diffMs <= 0) {
      return { isPast: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return { isPast: false, days, hours, minutes, seconds };
  }, [ticketDateObj, currentTime]);

  // Split eventDate into date and time components for PremiumDatePicker and PremiumTimePicker
  let eventDatePart = '';
  if (eventDate) {
    try {
      if (eventDate.includes('T')) {
        eventDatePart = eventDate.split('T')[0];
      } else {
        const d = new Date(eventDate);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          eventDatePart = `${year}-${month}-${day}`;
        }
      }
    } catch {}
  }

  let eventTimePart = '10:00';
  if (eventDate) {
    try {
      if (eventDate.includes('T')) {
        const timeSub = eventDate.split('T')[1];
        eventTimePart = timeSub.substring(0, 5);
      } else {
        const d = new Date(eventDate);
        if (!isNaN(d.getTime())) {
          const hours = String(d.getHours()).padStart(2, '0');
          const mins = String(d.getMinutes()).padStart(2, '0');
          eventTimePart = `${hours}:${mins}`;
        }
      }
    } catch {}
  }

  const handleDateChange = (newDateStr: string) => {
    const time = eventTimePart || '10:00';
    if (newDateStr) {
      setEventDate(`${newDateStr}T${time}:00`);
    } else {
      setEventDate('');
    }
  };

  const handleTimeChange = (newTimeStr: string) => {
    const date = eventDatePart || new Date().toISOString().split('T')[0];
    if (newTimeStr) {
      setEventDate(`${date}T${newTimeStr}:00`);
    }
  };

  // Rundown Blocks
  const [rundownBlocks, setRundownBlocks] = useState<any[]>(() => {
    const rawBlocks = initialDraftData?.livestream?.blocks || initialDraftData?.livestreamBlocks || (initialDraftData as any)?.blocks || [];
    const filtered = rawBlocks.filter((b: any) => b.blockType !== 'metadata');
    return filtered.map((b: any, index: number) => {
      let parsedContent: any = {};
      try {
        parsedContent = typeof b.content === 'string' ? JSON.parse(b.content) : (b.content || {});
      } catch (e) {
        parsedContent = {};
      }
      const isAct = b.blockType === 'rundown_act' || parsedContent.role || parsedContent.title?.toLowerCase().includes('act');
      return {
        id: b.id || `restored-block-${index}-${Date.now()}`,
        sourceType: parsedContent.sourceType || (isAct ? 'act' : (b.blockType === 'transition' ? 'transition' : (parsedContent.jobTitle ? 'job' : 'def_block'))),
        defBlockId: parsedContent.defBlockId || b.defBlockId,
        defBlockLabel: parsedContent.defBlockLabel || b.defBlockLabel,
        slideIndex: parsedContent.slideIndex || b.slideIndex,
        slideCount: parsedContent.slideCount || b.slideCount,
        act: parsedContent.act || b.act,
        originalBlockType: parsedContent.originalBlockType || b.blockType,
        originalContent: parsedContent,
        speakerNotes: b.speakerNotes || parsedContent.speakerNotes || '',
        durationStr: b.durationStr || parsedContent.durationStr || '',
        parentArticleId: b.parentArticleId || parsedContent.parentArticleId,
        parentArticleTitle: b.parentArticleTitle || parsedContent.parentArticleTitle,
        sourceId: b.sourceId || parsedContent.sourceId
      };
    });
  });

  const [frameworkLoaded, setFrameworkLoaded] = useState(rundownBlocks.length > 0);

  useEffect(() => {
    if (profile?.uid) {
      fetchLivestreamContentPool(profile.uid, postingAs === 'organization' ? selectedOrgId : null)
        .then(data => setContentPool(data))
        .catch(err => console.error(err));
    }
  }, [profile?.uid, postingAs, selectedOrgId]);

  const canPublish = Boolean(
    title.trim() && 
    category && 
    eventDatePart && 
    eventTimePart && 
    rundownBlocks.length > 0 && 
    guestStudioUrl.trim() && 
    streamUrl.trim()
  );
  const canAdvanceStep1 = Boolean(title.trim() && eventDatePart && eventTimePart);

  const handleScrollToTiming = () => {
    setIsScheduleFlipped(true);
    if (typeof document !== 'undefined') {
      document.getElementById('broadcast-timing-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleScrollToCover = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('broadcast-cover-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleScrollToBackstage = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('broadcast-guest-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleScrollToStage = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('broadcast-stream-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Action Items Checklist
  const actionItems: { id: string; label: string; onClick: () => void }[] = [];
  if (!title.trim()) {
    actionItems.push({
      id: 'title',
      label: 'Add Livestream Title',
      onClick: () => {
        setIsIdeasDrawerOpen(true);
      }
    });
  }
  if (!eventDatePart || !eventTimePart) {
    actionItems.push({
      id: 'timing',
      label: 'Select Event Date & Time',
      onClick: handleScrollToTiming
    });
  }

  if (step >= 2) {
    if (!frameworkLoaded || rundownBlocks.length === 0) {
      actionItems.push({
        id: 'draft_slides',
        label: 'Draft Slides with AI (~1 min)',
        onClick: () => {
          setIsDraftingDrawerOpen(true);
        }
      });
    }
  }
  if (step === 3) {
    if (!guestStudioUrl.trim()) {
      actionItems.push({
        id: 'guestStudioUrl',
        label: 'Configure Guest Studio Link (Required)',
        onClick: handleScrollToBackstage
      });
    }
    if (!streamUrl.trim()) {
      actionItems.push({
        id: 'streamUrl',
        label: 'Configure Public Stream Link (Required)',
        onClick: handleScrollToStage
      });
    }
    if (!coverImage) {
      actionItems.push({
        id: 'cover',
        label: 'Upload or Generate Cover Image',
        onClick: handleScrollToCover
      });
    }
  }

  const [isActionItemsMinimized, setIsActionItemsMinimized] = useState(false);

  const serializeContentState = useCallback(() => {
    return JSON.stringify({
      title,
      description,
      category,
      subcategory,
      timeframe,
      eventDate,
      streamUrl,
      guestStudioUrl,
      guestMessageText,
      guestButtonText,
      audienceMessageText,
      audienceButtonText,
      appliedBlueprintTitle: appliedBlueprint?.title || appliedBlueprint?.typeTitle || '',
      ingestedBlueprintsCount: ingestedBlueprints.length,
      ingestedBlueprintsTitles: ingestedBlueprints.map(b => b.title).join('|'),
      blocksCount: rundownBlocks.length,
      blocks: rundownBlocks.map(b => ({
        id: b.id,
        speakerNotes: b.speakerNotes,
        content: b.originalContent,
        durationStr: b.durationStr
      }))
    });
  }, [
    title, description, category, subcategory, timeframe, eventDate,
    streamUrl, guestStudioUrl, guestMessageText, guestButtonText,
    audienceMessageText, audienceButtonText, appliedBlueprint, ingestedBlueprints, rundownBlocks
  ]);

  const handleSave = async (
    isPublish: boolean = false,
    options?: {
      isAutoSave?: boolean;
      forceNew?: boolean;
      overrideBlueprint?: any;
      overrideTitle?: string;
      overrideDescription?: string;
      overrideCategory?: string;
      overrideSubcategory?: string;
      overrideTimeframe?: string;
      overrideEventDate?: string;
      overrideBlocks?: any[];
    }
  ) => {
    if (!profile?.uid) return null;
    const isAutoSave = Boolean(options?.isAutoSave);

    if (isAutoSave) {
      setIsAutosaving(true);
    } else {
      setIsSubmitting(true);
      setSaveErrorMsg(null);
      setSaveStatusMsg(null);
    }

    try {
      const activeBlueprint = options?.overrideBlueprint !== undefined ? options.overrideBlueprint : appliedBlueprint;
      const activeTitle = (options?.overrideTitle !== undefined ? options.overrideTitle : title) || '';
      const activeDescription = (options?.overrideDescription !== undefined ? options.overrideDescription : description) || '';
      const activeCategory = (options?.overrideCategory !== undefined ? options.overrideCategory : category) || 'capital';
      const activeSubcategory = (options?.overrideSubcategory !== undefined ? options.overrideSubcategory : subcategory) || '';
      const activeTimeframe = (options?.overrideTimeframe !== undefined ? options.overrideTimeframe : timeframe) || 'present';
      const activeEventDate = options?.overrideEventDate !== undefined ? options.overrideEventDate : eventDate;
      const activeBlocks = options?.overrideBlocks !== undefined ? options.overrideBlocks : rundownBlocks;

      let finalCoverUrl = typeof coverImage === 'string' ? coverImage : '';
      if (!isAutoSave && coverImage instanceof File) {
        const res = await uploadFile(coverImage);
        finalCoverUrl = res?.secure_url || '';
      }
      if (!finalCoverUrl && isPublish) {
        const categoryCoverMap: Record<string, string> = {
          capital: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
          land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
          inputs: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=1200&q=80',
          energy: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
          insecurity: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
          'post-harvest': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          'people-talent': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        };
        finalCoverUrl = categoryCoverMap[activeCategory] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';
      }

      const communications = {
        guestMessage: {
          text: guestMessageText,
          buttonText: guestButtonText.trim() || 'Join Backstage Studio',
          buttonLink: guestStudioUrl.trim()
        },
        audienceMessage: {
          text: audienceMessageText,
          buttonText: audienceButtonText.trim() || 'Watch Livestream',
          buttonLink: streamUrl.trim()
        }
      };

      const metaPayload = {
        appliedBlueprint: activeBlueprint,
        ingestedBlueprints: ingestedBlueprints.length > 0 ? ingestedBlueprints : (activeBlueprint ? [activeBlueprint] : []),
        guidingArticles,
        guidingJobs,
        guidingListings,
        guidingCampaigns,
        guestStudioUrl,
        streamUrl,
        communications,
        collaborators,
        hubTitle,
        hubColor
      };

      if (typeof window !== 'undefined') {
        try {
          const storageKey = `foodnerve_last_livestream_links_${profile?.uid || 'default'}`;
          const stored = localStorage.getItem(storageKey);
          const prev = stored ? JSON.parse(stored) : {};
          localStorage.setItem(storageKey, JSON.stringify({
            ...prev,
            guestStudioUrl,
            streamUrl,
            communications
          }));
        } catch (e) {}
      }

      let formattedBlocks: ArticleBlockPayload[] = [];
      if (activeBlocks && activeBlocks.length > 0) {
        formattedBlocks = activeBlocks.map((b: any, index: number) => {
          const blockContentObj: any = {
            ...(b.originalContent || {}),
            sourceType: b.sourceType || 'def_block',
            defBlockId: b.defBlockId,
            defBlockLabel: b.defBlockLabel,
            slideIndex: b.slideIndex,
            slideCount: b.slideCount,
            act: b.act,
            originalBlockType: b.originalBlockType,
            speakerNotes: b.speakerNotes,
            durationStr: b.durationStr,
            parentArticleId: b.parentArticleId,
            parentArticleTitle: b.parentArticleTitle,
          };
          if (index === 0) {
            blockContentObj._studioMeta = metaPayload;
          }
          return {
            blockType: b.sourceType === 'act' ? 'rundown_act' : (b.sourceType === 'transition' ? 'transition' : (b.originalBlockType || b.sourceType)),
            orderIndex: index,
            content: JSON.stringify(blockContentObj),
          };
        });
      } else {
        formattedBlocks = [{
          blockType: 'metadata',
          orderIndex: 0,
          content: JSON.stringify({ _studioMeta: metaPayload }),
        }];
      }

      const saveDraftId = options?.forceNew ? undefined : (currentDraftId || undefined);

      const payload: CreateLearnContentPayload = {
        id: saveDraftId,
        title: activeTitle.trim() || 'Untitled Livestream Draft',
        description: activeDescription.trim() || activeBlueprint?.description || '',
        slug: (activeTitle.trim() || 'untitled-livestream').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        type: 'livestream',
        bottleneckTags: [activeCategory, activeSubcategory, activeTimeframe].filter(Boolean) as string[],
        category: activeCategory,
        subcategory: activeSubcategory,
        timeframe: activeTimeframe,
        authorId: profile.uid,
        authorName: profile.displayName || profile.firstName || 'Broadcast Host',
        authorAvatarUrl: profile.avatarUrl || '',
        organizationId: postingAs === 'organization' ? selectedOrgId : null,
        collaborators: collaborators,
        thumbnailUrl: finalCoverUrl || undefined,
        targetDate: activeEventDate ? new Date(activeEventDate).toISOString() : new Date().toISOString(),
        livestreamUrl: streamUrl,
        livestreamBlocks: formattedBlocks,
      };

      const res = await createLearnContent(payload, !isPublish);

      if (res?.id) {
        setCurrentDraftId(res.id);
        const now = new Date();
        setLastAutosavedAt(now);
        lastSavedContentRef.current = serializeContentState();
        onDraftSaved?.(res.id);
      }

      if (isPublish) {
        onSuccess?.();
      } else if (!isAutoSave) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSaveStatusMsg(`Draft saved at ${timeStr}`);
        setTimeout(() => setSaveStatusMsg(null), 5000);
      }
      return res;
    } catch (e: any) {
      console.error('Error saving livestream:', e);
      if (!isAutoSave) {
        setSaveErrorMsg(e.message || 'Failed to save');
        setTimeout(() => setSaveErrorMsg(null), 6000);
      }
      return null;
    } finally {
      if (isAutoSave) {
        setIsAutosaving(false);
      } else {
        setIsSubmitting(false);
      }
    }
  };

  const applyFramework = (blueprintToApply?: any) => {
    const targetBlueprint = blueprintToApply || appliedBlueprint;
    const bpFmt = targetBlueprint?.format;
    const bpTitle = (targetBlueprint?.typeTitle || targetBlueprint?.title || '').toLowerCase();
    let flowKey = 'default';
    if (bpFmt && LIVESTREAM_TYPE_FLOWS[bpFmt]) {
      flowKey = bpFmt;
    } else if (bpTitle.includes('teardown') || bpTitle.includes('audit')) {
      flowKey = 'industry_teardown';
    } else if (bpTitle.includes('debate') || bpTitle.includes('panel')) {
      flowKey = 'panel_debate';
    } else if (bpTitle.includes('talent') || bpTitle.includes('spotlight') || bpTitle.includes('job')) {
      flowKey = 'talent_spotlight';
    }

    const suggestedBlockIds = LIVESTREAM_TYPE_FLOWS[flowKey] || LIVESTREAM_TYPE_FLOWS.default;
    const realSlides: any[] = [];

    suggestedBlockIds.forEach((blockId) => {
      const def = DEF_BLOCK_DEFINITIONS[blockId];
      if (!def) return;
      const customDesc = targetBlueprint?.customBlockDescriptions?.[blockId]
        || targetBlueprint?.timelinePillars?.find((p: any) => p.blockId === blockId || (p.role && def.name && p.role.toLowerCase().includes(def.name.toLowerCase())))?.desc;

      def.subSlideTemplates.forEach((template: any, idx: number) => {
        realSlides.push({
          id: `def-${def.id}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          sourceType: 'def_block',
          defBlockId: def.id,
          defBlockLabel: `Block ${def.blockNumber}: ${def.name}`,
          slideIndex: idx + 1,
          slideCount: def.subSlideTemplates.length,
          act: def.act,
          originalBlockType: template.slideType,
          originalContent: {
            title: template.title,
            text: customDesc || template.title,
            subheadline: customDesc || template.subheadline,
            stat: template.dataValue,
            label: template.subheadline,
            myth: template.subheadline,
            fact: template.title,
            jobTitle: targetBlueprint?.suggestedJobsFocus || template.title,
            role: `Block ${def.blockNumber}: ${def.name}`,
            description: customDesc || template.subheadline,
            focusSummary: customDesc ? `${def.name} • ${customDesc}` : `${def.actLabel} • ${def.name}`,
          },
          speakerNotes: customDesc || template.speakerNotes || '',
          durationStr: template.durationStr || '2m',
        });
      });
    });

    if (blueprintToApply) {
      setAppliedBlueprint(blueprintToApply);
    }
    setRundownBlocks(realSlides);
    setFrameworkLoaded(true);
  };

  const checkDraftCollisionAndAutoSave = async (overrides?: {
    overrideBlueprint?: any;
    overrideTitle?: string;
    overrideDescription?: string;
    overrideCategory?: string;
    overrideSubcategory?: string;
    overrideTimeframe?: string;
    overrideEventDate?: string;
    overrideBlocks?: any[];
  }) => {
    const activeBp = overrides?.overrideBlueprint !== undefined ? overrides.overrideBlueprint : appliedBlueprint;
    const activeCat = (overrides?.overrideCategory !== undefined ? overrides.overrideCategory : category) || 'capital';
    const activeTf = (overrides?.overrideTimeframe !== undefined ? overrides.overrideTimeframe : timeframe) || 'present';
    const activeAnchorIds = guidingArticles.map((a: any) => typeof a === 'string' ? a : (a?.id || '')).filter(Boolean);
    const activeCtaIds = [
      ...guidingJobs,
      ...guidingListings,
      ...guidingCampaigns
    ].map((c: any) => typeof c === 'string' ? c : (c?.id || '')).filter(Boolean);

    // If user has NOT declined resume, and we don't already have an established draft ID
    if (!userDeclinedResume && !currentDraftId) {
      setCheckingDraft(true);
      try {
        const res = await findMatchingLivestreamDraft({
          userId: profile?.uid,
          userEmail: (profile as any)?.email,
          organizationId: postingAs === 'organization' ? selectedOrgId : null,
          anchorArticleIds: activeAnchorIds,
          ctaIds: activeCtaIds,
          category: activeCat,
          timeframe: activeTf,
          blueprintTitle: activeBp?.title || activeBp?.typeTitle,
          excludeDraftId: currentDraftId,
        });

        if (res.success && res.draft && res.draft.id !== currentDraftId) {
          setDetectedDraft(res.draft);
          setCheckingDraft(false);
          return;
        }
      } catch (err) {
        console.error('Failed checking matching livestream draft:', err);
      } finally {
        setCheckingDraft(false);
      }
    }

    // No conflict, or resume declined, or current draft already open:
    await handleSave(false, {
      isAutoSave: true,
      ...overrides
    });
  };

  const handleResumeDetectedDraft = (draft: any) => {
    if (!draft) return;
    setCurrentDraftId(draft.id);
    if (draft.title) setTitle(draft.title);
    if (draft.description) setDescription(draft.description);
    if (draft.category) setCategory(draft.category);
    if (draft.subcategory) setSubcategory(draft.subcategory);
    if (draft.timeframe) setTimeframe(draft.timeframe);
    if (draft.thumbnailUrl) setCoverImage(draft.thumbnailUrl);
    if (draft.livestream?.streamUrl || draft.livestreamUrl) {
      setStreamUrl(draft.livestream?.streamUrl || draft.livestreamUrl);
    }
    if (draft.targetDate || draft.livestream?.scheduledFor || draft.livestream?.eventDate) {
      const raw = draft.targetDate || draft.livestream?.scheduledFor || draft.livestream?.eventDate;
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        setEventDate(`${year}-${month}-${day}T${hours}:${mins}:00`);
      }
    }

    const meta = extractStudioMetaFromDraft(draft);

    if (meta?.guestStudioUrl) setGuestStudioUrl(meta.guestStudioUrl);
    if (meta?.streamUrl) setStreamUrl(meta.streamUrl);
    if (meta?.communications) {
      if (meta.communications.guestMessage?.text) setGuestMessageText(meta.communications.guestMessage.text);
      if (meta.communications.guestMessage?.buttonText) setGuestButtonText(meta.communications.guestMessage.buttonText);
      if (meta.communications.audienceMessage?.text) setAudienceMessageText(meta.communications.audienceMessage.text);
      if (meta.communications.audienceMessage?.buttonText) setAudienceButtonText(meta.communications.audienceMessage.buttonText);
    }

    if (draft.collaborators) {
      try {
        const parsed = typeof draft.collaborators === 'string' ? JSON.parse(draft.collaborators) : draft.collaborators;
        if (Array.isArray(parsed)) setCollaborators(parsed);
      } catch (e) {}
    } else if (meta?.collaborators && Array.isArray(meta.collaborators)) {
      setCollaborators(meta.collaborators);
    }

    const bp = meta?.appliedBlueprint || draft.livestream?.blueprint || draft.blueprint;
    if (bp) {
      setAppliedBlueprint(bp);
    }

    // Hydrate ingestedBlueprints cascade from resumed draft
    const draftBlueprints = meta?.ingestedBlueprints;
    if (Array.isArray(draftBlueprints) && draftBlueprints.length > 0) {
      setIngestedBlueprints(draftBlueprints);
      if (bp) {
        const target = bp.title?.trim().toLowerCase();
        const bpIdx = target ? draftBlueprints.findIndex((b: any) => b.title?.trim().toLowerCase() === target) : -1;
        if (bpIdx !== -1) {
          setDeckActiveIndex(bpIdx);
          lastAlignedBlueprintRef.current = target;
        }
      }
    } else if (bp) {
      setIngestedBlueprints([bp]);
      setDeckActiveIndex(0);
      lastAlignedBlueprintRef.current = bp.title?.trim().toLowerCase() || null;
    } else if (typeof window !== 'undefined') {
      try {
        const catKey = (draft.category || category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const hub = meta?.hubTitle || initialTaxonomy?.hubTitle || 'Production & Capital';
        const savedPayload =
          localStorage.getItem(`ls_ideas_ingest_${catKey}_latest_payload`) ||
          localStorage.getItem('ls_ideas_ingest_latest_payload');
        if (savedPayload) {
          const parsed = parseLivestreamPayload(savedPayload, hub, catKey);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setIngestedBlueprints(parsed);
            setDeckActiveIndex(0);
          }
        }
      } catch (e) {}
    }

    const blocks = draft.livestream?.blocks || draft.livestreamBlocks || draft.blocks || [];
    const hydratedSlides: any[] = [];
    if (blocks && blocks.length > 0) {
      const sorted = [...blocks].sort((a: any, b: any) => a.orderIndex - b.orderIndex);
      sorted.forEach((b: any, idx: number) => {
        let contentObj: any = {};
        try {
          contentObj = typeof b.content === 'string' ? JSON.parse(b.content) : (b.content || {});
        } catch (e) {}

        if (b.blockType === 'metadata' && !contentObj.title && !contentObj.defBlockId) {
          return;
        }

        const isAct = b.blockType === 'rundown_act' || contentObj.role || contentObj.title?.toLowerCase().includes('act');
        hydratedSlides.push({
          id: b.id || `block_${Date.now()}_${idx}`,
          sourceType: contentObj.sourceType || (isAct ? 'act' : (b.blockType === 'transition' ? 'transition' : (contentObj.jobTitle ? 'job' : 'def_block'))),
          defBlockId: contentObj.defBlockId || b.defBlockId,
          defBlockLabel: contentObj.defBlockLabel || b.defBlockLabel || `Block: ${contentObj.title || 'Slide'}`,
          slideIndex: contentObj.slideIndex || b.slideIndex || (idx + 1),
          slideCount: contentObj.slideCount || b.slideCount || 1,
          act: contentObj.act || b.act || 1,
          originalBlockType: contentObj.originalBlockType || b.blockType,
          originalContent: contentObj,
          speakerNotes: contentObj.speakerNotes || b.speakerNotes || '',
          durationStr: contentObj.durationStr || b.durationStr || '2m',
          parentArticleId: contentObj.parentArticleId || b.parentArticleId,
          parentArticleTitle: contentObj.parentArticleTitle || b.parentArticleTitle,
          sourceId: contentObj.sourceId || b.sourceId,
        });
      });

      if (hydratedSlides.length > 0) {
        setRundownBlocks(hydratedSlides);
        setFrameworkLoaded(true);
      }
    }

    // Direct Landing on Slides (Step 2) when resuming a draft with slides or blueprint
    if (hydratedSlides.length > 0 || bp) {
      setStep(2);
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }

    setDetectedDraft(null);
    setUserDeclinedResume(false);
    // Reset auto-save reference to avoid an immediate phantom auto-save right after resuming
    lastSavedContentRef.current = '';
    const updatedDate = draft.updatedAt ? new Date(draft.updatedAt) : new Date();
    setLastAutosavedAt(!isNaN(updatedDate.getTime()) ? updatedDate : new Date());
    onDraftSaved?.(draft.id);
  };

  const handleResumeDraft = handleResumeDetectedDraft;

  const handleStartFreshFromBanner = async () => {
    setUserDeclinedResume(true);
    setDetectedDraft(null);
    setCurrentDraftId(null);
    await handleSave(false, {
      isAutoSave: true,
      forceNew: true
    });
  };

  const handleAdvanceFromStep1 = async () => {
    if (!canAdvanceStep1) return;
    setStep(2);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    await checkDraftCollisionAndAutoSave();
  };

  const handleSelectBlueprint = async (blueprint: any, autoLoadSlides: boolean = false) => {
    if (!blueprint) return;
    setAppliedBlueprint(blueprint);
    if (blueprint.title) setTitle(blueprint.title);
    if (blueprint.description) setDescription(blueprint.description);
    if (blueprint.timeframe) setTimeframe(blueprint.timeframe);
    
    const chosenCategory = blueprint.category || category || 'capital';
    if (blueprint.category) setCategory(blueprint.category);

    const slotDate = getNextSlotForCategory(chosenCategory, 10, 0);
    const year = slotDate.getFullYear();
    const month = String(slotDate.getMonth() + 1).padStart(2, '0');
    const day = String(slotDate.getDate()).padStart(2, '0');
    const hours = String(slotDate.getHours()).padStart(2, '0');
    const mins = String(slotDate.getMinutes()).padStart(2, '0');
    const newEventDate = `${year}-${month}-${day}T${hours}:${mins}:00`;
    setEventDate(newEventDate);

    if (autoLoadSlides) {
      applyFramework(blueprint);
    } else {
      setRundownBlocks([]);
      setFrameworkLoaded(false);
    }
    setIsIdeasCardFlipped(false);
    setIsCardFlipped(false);
    setStep(2);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);

    await checkDraftCollisionAndAutoSave({
      overrideBlueprint: blueprint,
      overrideTitle: blueprint.title || title,
      overrideDescription: blueprint.description || description,
      overrideCategory: chosenCategory,
      overrideTimeframe: blueprint.timeframe || timeframe,
      overrideEventDate: newEventDate,
      overrideBlocks: autoLoadSlides ? undefined : []
    });
  };

  // Continuous Debounced Auto-Save (Steps 2 & 3)
  useEffect(() => {
    if (step < 2) return;
    if (detectedDraft) return;
    if (!currentDraftId && !title.trim() && !appliedBlueprint) return;

    const currentContent = serializeContentState();

    if (!lastSavedContentRef.current) {
      lastSavedContentRef.current = currentContent;
      return;
    }

    if (currentContent === lastSavedContentRef.current) {
      return;
    }

    setIsAutosaving(true);

    const timer = setTimeout(async () => {
      try {
        await handleSave(false, { isAutoSave: true });
      } catch (err) {
        console.error('Debounced auto-save failed:', err);
      } finally {
        setIsAutosaving(false);
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    step,
    detectedDraft,
    title,
    description,
    category,
    subcategory,
    timeframe,
    eventDate,
    streamUrl,
    guestStudioUrl,
    guestMessageText,
    guestButtonText,
    audienceMessageText,
    audienceButtonText,
    appliedBlueprint,
    rundownBlocks,
    serializeContentState
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* Floating Action Items Panel */}
      <Box sx={{ 
        position: 'absolute', top: 24, right: 24, zIndex: 10, width: isActionItemsMinimized ? 'auto' : 320,
        bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
        borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        overflow: 'hidden'
      }}>
        <Box 
          onClick={() => setIsActionItemsMinimized(!isActionItemsMinimized)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ position: 'relative' }}>
              <CheckCircleIcon sx={{ color: actionItems.length === 0 ? '#10b981' : '#f59e0b', fontSize: 20 }} />
              {actionItems.length > 0 && (
                <Box sx={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, bgcolor: '#ef4444', borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>{actionItems.length}</Typography>
                </Box>
              )}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>Action Items</Typography>
          </Box>
        </Box>
        
        {!isActionItemsMinimized && (
          <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {actionItems.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}>
                <CheckIcon sx={{ color: '#10b981', fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>All requirements met!</Typography>
              </Box>
            ) : (
              actionItems.map((item, idx) => (
                <Box
                  key={idx}
                  onClick={item.onClick}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1.25,
                    bgcolor: 'rgba(245,158,11,0.06)',
                    borderRadius: '10px',
                    border: '1.2px solid rgba(245,158,11,0.18)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(245,158,11,0.14)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(245,158,11,0.12)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>{item.label}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 900 }}>→</Typography>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>

      {/* Main Form Scroll Container */}
      <Box ref={scrollContainerRef} sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: { xs: 15, md: 20 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        
        {/* Context Header */}
        <Box sx={{
          display: 'inline-flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2,
          mb: 1, p: '12px 16px', borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.03) 0%, rgba(15, 23, 42, 0.08) 100%)',
          border: '1px solid rgba(15, 23, 42, 0.05)',
          backdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.02)',
          width: 'fit-content'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexWrap: 'wrap' }}>
            <Box 
              onClick={() => onCancel?.()} 
              sx={{ 
                display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75, borderRadius: '10px',
                cursor: 'pointer', transition: 'all 0.2s ease', color: '#0f172a', bgcolor: 'rgba(255,255,255,0.7)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)', transform: 'translateY(-1px)' }
              }}
            >
              <ArticleIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>Studio</Typography>
            </Box>
            <Typography sx={{ color: 'rgba(15, 23, 42, 0.3)', fontWeight: 400 }}>/</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, borderRadius: '6px', color: '#0f172a' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Livestream</Typography>
            </Box>
            <Typography sx={{ color: 'rgba(15, 23, 42, 0.3)', fontWeight: 400 }}>/</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, borderRadius: '6px', bgcolor: 'rgba(15, 23, 42, 0.04)', border: '1px solid rgba(15, 23, 42, 0.05)', color: '#0f172a' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{category || 'Category'}</Typography>
            </Box>

            {/* Top Stepper Navigation Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mx: { xs: 0, sm: 0.5 }, flexWrap: 'wrap' }}>
              {[
                { sNum: 1, label: 'Details' },
                { sNum: 2, label: 'Framework & Slides' },
                { sNum: 3, label: 'Broadcast Studio & Links' }
              ].map(({ sNum, label }) => {
                const isActive = step === sNum;
                const isPassed = step > sNum;
                const canClick = sNum === 1 || (sNum === 2 && (canAdvanceStep1 || rundownBlocks.length > 0 || appliedBlueprint)) || (sNum === 3 && rundownBlocks.length > 0);
                return (
                  <Box
                    key={`top-step-${sNum}`}
                    onClick={() => {
                      if (canClick) {
                        setStep(sNum);
                        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '10px',
                      cursor: canClick ? 'pointer' : 'not-allowed',
                      opacity: canClick ? 1 : 0.45,
                      bgcolor: isActive ? '#0f172a' : (isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.7)'),
                      color: isActive ? '#ffffff' : (isPassed ? '#065f46' : '#475569'),
                      border: `1.2px solid ${isActive ? '#0f172a' : (isPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(15, 23, 42, 0.08)')}`,
                      boxShadow: isActive ? '0 2px 8px rgba(15, 23, 42, 0.18)' : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': canClick ? {
                        bgcolor: isActive ? '#0f172a' : (isPassed ? 'rgba(16, 185, 129, 0.18)' : '#ffffff'),
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                      } : {}
                    }}
                  >
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        bgcolor: isActive ? '#ffffff' : (isPassed ? '#10b981' : 'rgba(15, 23, 42, 0.08)'),
                        color: isActive ? '#0f172a' : (isPassed ? '#ffffff' : '#64748b')
                      }}
                    >
                      {isPassed ? '✓' : sNum}
                    </Box>
                    <Typography sx={{ fontWeight: isActive ? 800 : 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {isAutosaving ? (
              <Chip
                size="small"
                icon={<CircularProgress size={12} sx={{ color: '#d97706' }} />}
                label="Autosaving..."
                sx={{
                  bgcolor: 'rgba(245, 158, 11, 0.12)',
                  color: '#b45309',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  border: '1px solid rgba(245, 158, 11, 0.28)',
                }}
              />
            ) : lastAutosavedAt ? (
              <Chip
                size="small"
                icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important', color: '#10b981' }} />}
                label={`Saved ${lastAutosavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  color: '#065f46',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              />
            ) : null}
          </Box>
        </Box>

        {step === 1 && (
          <Box sx={{ maxWidth: 840, mx: 'auto', width: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Livestream Details
              </Typography>
              <Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '1.05rem' }}>
                Define the core metadata for your livestream before building the rundown.
              </Typography>
            </Box>

            {/* ── TWO DARK ASSET CARDS SIDE BY SIDE (ANCHOR ARTICLES & ECOSYSTEM CTAS) ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              {/* Card 1: Anchor Articles */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: '22px',
                  bgcolor: '#090d16',
                  backgroundImage: 'radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 145,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                    Anchor Articles
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '2.4rem', sm: '2.8rem' }, fontWeight: 950, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {guidingArticles.length}
                  </Typography>
                </Box>

                {/* Fanned Images under the number */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2.25, position: 'relative', height: 48 }}>
                  {guidingArticles.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '12px',
                          border: '1.5px dashed rgba(255, 255, 255, 0.15)',
                          bgcolor: 'rgba(255, 255, 255, 0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ArticleIcon sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.3)' }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                        No articles linked
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {guidingArticles.slice(0, 5).map((art: any, idx: number) => {
                        const img = art.imageUrl || art.coverImageUrl || art.featuredImage || (typeof art.coverImage === 'string' ? art.coverImage : '');
                        const count = Math.min(guidingArticles.length, 5);
                        const rot = count > 1 ? -8 + (idx / (count - 1)) * 16 : 0;
                        return (
                          <Box
                            key={art.id || `art-img-${idx}`}
                            sx={{
                              width: 46,
                              height: 46,
                              borderRadius: '12px',
                              overflow: 'hidden',
                              bgcolor: '#1e293b',
                              border: '2px solid #090d16',
                              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
                              ml: idx === 0 ? 0 : -2,
                              transform: `rotate(${rot}deg)`,
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              flexShrink: 0,
                              zIndex: idx + 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': {
                                transform: 'rotate(0deg) scale(1.15) translateY(-4px)',
                                zIndex: 25,
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                              },
                            }}
                          >
                            {img ? (
                              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <ArticleIcon sx={{ fontSize: 20, color: '#38bdf8' }} />
                            )}
                          </Box>
                        );
                      })}
                      {guidingArticles.length > 5 && (
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            border: '1.5px solid rgba(255, 255, 255, 0.15)',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ml: 1,
                            flexShrink: 0,
                          }}
                        >
                          +{guidingArticles.length - 5}
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </Paper>

              {/* Card 2: Ecosystem CTAs */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: '22px',
                  bgcolor: '#090d16',
                  backgroundImage: 'radial-gradient(ellipse at top left, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 145,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                    Ecosystem CTAs
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '2.4rem', sm: '2.8rem' }, fontWeight: 950, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {guidingJobs.length + guidingListings.length + guidingCampaigns.length}
                  </Typography>
                </Box>

                {/* Fanned Images/Icons under the number */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2.25, position: 'relative', height: 48 }}>
                  {(guidingJobs.length + guidingListings.length + guidingCampaigns.length) === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '12px',
                          border: '1.5px dashed rgba(255, 255, 255, 0.15)',
                          bgcolor: 'rgba(255, 255, 255, 0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BoltIcon sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.3)' }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                        No CTAs linked
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {[...guidingListings, ...guidingJobs, ...guidingCampaigns].slice(0, 5).map((item: any, idx: number) => {
                        const img = item.imageUrl || item.coverImageUrl || item.logoUrl || item.organizationLogo || '';
                        const totalCount = Math.min(guidingJobs.length + guidingListings.length + guidingCampaigns.length, 5);
                        const rot = totalCount > 1 ? -8 + (idx / (totalCount - 1)) * 16 : 0;
                        return (
                          <Box
                            key={item.id || `cta-img-${idx}`}
                            sx={{
                              width: 46,
                              height: 46,
                              borderRadius: '12px',
                              overflow: 'hidden',
                              bgcolor: '#1e293b',
                              border: '2px solid #090d16',
                              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
                              ml: idx === 0 ? 0 : -2,
                              transform: `rotate(${rot}deg)`,
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              flexShrink: 0,
                              zIndex: idx + 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': {
                                transform: 'rotate(0deg) scale(1.15) translateY(-4px)',
                                zIndex: 25,
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                              },
                            }}
                          >
                            {img ? (
                              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <BoltIcon sx={{ fontSize: 20, color: '#fbbf24' }} />
                            )}
                          </Box>
                        );
                      })}
                      {(guidingJobs.length + guidingListings.length + guidingCampaigns.length) > 5 && (
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            border: '1.5px solid rgba(255, 255, 255, 0.15)',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ml: 1,
                            flexShrink: 0,
                          }}
                        >
                          +{(guidingJobs.length + guidingListings.length + guidingCampaigns.length) - 5}
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </Paper>
            </Box>

            {/* ── 3D FLIPPABLE BROADCAST TICKET CARD (Front: Authentic Event Ticket with Countdown, Back: Schedule Editor) ── */}
            <Box
              id="broadcast-timing-card" ref={timingCardRef}
              sx={{
                width: '100%',
                mb: 3.5,
                perspective: '2000px',
                position: 'relative',
              }}
            >
              <motion.div
                animate={{ rotateY: isScheduleFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 24, mass: 0.8 }}
                style={{
                  width: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                }}
              >
                {/* ── TICKET FRONT: AUTHENTIC LIVESTREAM BROADCAST PASS ── */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '26px',
                    bgcolor: '#ffffff',
                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'stretch',
                    position: isScheduleFlipped ? 'absolute' : 'relative',
                    inset: isScheduleFlipped ? 0 : 'auto',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg) translateZ(1px)',
                    pointerEvents: isScheduleFlipped ? 'none' : 'auto',
                    overflow: 'hidden',
                  }}
                >
                  {/* Left: Main Ticket Pass */}
                  <Box
                    sx={{
                      flex: 1,
                      p: { xs: 2.5, sm: 3 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    {/* Ticket Header Row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TicketIcon sx={{ fontSize: 18, color: hubColor }} />
                        <Typography
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            letterSpacing: '0.08em',
                            color: '#64748b',
                            textTransform: 'uppercase',
                          }}
                        >
                          Broadcast Pass · #{`FN-${(category || 'LIVE').toUpperCase()}-2026`}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={countdown?.isPast ? 'Broadcast Concluded' : 'Awaiting Schedule'}
                        icon={
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: countdown?.isPast ? '#94a3b8' : '#f59e0b',
                              boxShadow: countdown?.isPast ? 'none' : '0 0 6px #f59e0b',
                              ml: '6px !important',
                            }}
                          />
                        }
                        sx={{
                          height: 24,
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          bgcolor: countdown?.isPast ? 'rgba(148, 163, 184, 0.12)' : 'rgba(245, 158, 11, 0.1)',
                          color: countdown?.isPast ? '#64748b' : '#b45309',
                          border: `1px solid ${countdown?.isPast ? 'rgba(148, 163, 184, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                        }}
                      />
                    </Box>

                    {/* Middle Row: Big Date Stub + Details */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 2.5 } }}>
                      {/* Calendar Date Block */}
                      <Box
                        sx={{
                          width: { xs: 74, sm: 84 },
                          height: { xs: 84, sm: 94 },
                          borderRadius: '18px',
                          overflow: 'hidden',
                          bgcolor: '#ffffff',
                          border: '1.5px solid rgba(15, 23, 42, 0.1)',
                          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          flexShrink: 0,
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: alpha(hubColor, 0.12),
                            color: hubColor,
                            fontWeight: 900,
                            fontSize: '0.72rem',
                            letterSpacing: '0.06em',
                            py: 0.4,
                          }}
                        >
                          {ticketMonth}
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: { xs: '1.85rem', sm: '2.15rem' },
                            fontWeight: 950,
                            color: '#0f172a',
                            lineHeight: 1,
                          }}
                        >
                          {ticketDayNumber}
                        </Box>
                        <Box
                          sx={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: '#64748b',
                            letterSpacing: '0.04em',
                            pb: 0.4,
                          }}
                        >
                          {ticketDayName}
                        </Box>
                      </Box>

                      {/* Title & Metadata */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: '#0f172a',
                            fontSize: { xs: '1.02rem', sm: '1.18rem' },
                            lineHeight: 1.25,
                            letterSpacing: '-0.015em',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {title || appliedBlueprint?.title || 'Your Scheduled Livestream Broadcast'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={appliedBlueprint?.format ? appliedBlueprint.format.replace('_', ' ').toUpperCase() : 'INDUSTRY TEARDOWN'}
                            sx={{
                              height: 22,
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              bgcolor: alpha(hubColor, 0.1),
                              color: hubColor,
                            }}
                          />
                          <Chip
                            size="small"
                            icon={<AccessTimeIcon sx={{ fontSize: '13px !important', color: '#475569 !important' }} />}
                            label={ticketTimeString}
                            sx={{
                              height: 22,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: 'rgba(15, 23, 42, 0.05)',
                              color: '#334155',
                            }}
                          />
                          <Chip
                            size="small"
                            label={`Hub: ${hubTitle}`}
                            sx={{
                              height: 22,
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              bgcolor: 'transparent',
                              color: '#64748b',
                              border: '1px solid #e2e8f0',
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Bottom Ticket Strip */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid rgba(226, 232, 240, 0.7)', flexWrap: 'wrap', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                        Every {DAY_NAMES[CATEGORY_TO_DAY_MAP[category] || 1]} · Standard 45m Studio Window · DEF Sequence
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', opacity: 0.35 }}>
                          {[2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2].map((w, i) => (
                            <Box key={i} sx={{ width: w, height: 11, bgcolor: '#0f172a' }} />
                          ))}
                        </Box>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                          ADMIT ALL VIEWERS
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Desktop Vertical Perforation Divider with Circular Notches */}
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      width: 0,
                      borderLeft: '2px dashed rgba(203, 213, 225, 0.95)',
                      position: 'relative',
                      alignSelf: 'stretch',
                      my: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -27,
                        left: -13,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        zIndex: 4,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -27,
                        left: -13,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        zIndex: 4,
                      }}
                    />
                  </Box>

                  {/* Mobile Horizontal Perforation Divider with Circular Notches */}
                  <Box
                    sx={{
                      display: { xs: 'block', md: 'none' },
                      height: 0,
                      borderTop: '2px dashed rgba(203, 213, 225, 0.95)',
                      position: 'relative',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -13,
                        top: -12,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        zIndex: 4,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        right: -13,
                        top: -12,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        zIndex: 4,
                      }}
                    />
                  </Box>

                  {/* Right: Ticket Stub (Countdown & Edit Action) */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: 260, lg: 280 },
                      bgcolor: 'rgba(248, 250, 252, 0.75)',
                      p: { xs: 2.5, sm: 3 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: 1.75,
                      flexShrink: 0,
                    }}
                  >
                    {/* Countdown Title */}
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        color: '#dc2626',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.6,
                      }}
                    >
                      <Box component="span" sx={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', bgcolor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                      ⏱️ Goes Live In
                    </Typography>

                    {/* Live Digital Countdown Timer */}
                    {countdown && !countdown.isPast ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', px: 1, py: 0.6, minWidth: 40, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)' }}>
                          <Typography sx={{ fontWeight: 950, fontSize: '1.2rem', color: '#dc2626', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.days).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase', mt: 0.25 }}>days</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: '#ef4444', fontSize: '1.1rem', mb: 1 }}>:</Typography>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', px: 1, py: 0.6, minWidth: 40, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)' }}>
                          <Typography sx={{ fontWeight: 950, fontSize: '1.2rem', color: '#dc2626', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.hours).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase', mt: 0.25 }}>hrs</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: '#ef4444', fontSize: '1.1rem', mb: 1 }}>:</Typography>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', px: 1, py: 0.6, minWidth: 40, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)' }}>
                          <Typography sx={{ fontWeight: 950, fontSize: '1.2rem', color: '#dc2626', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.minutes).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase', mt: 0.25 }}>mins</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: '#ef4444', fontSize: '1.1rem', mb: 1 }}>:</Typography>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.14)', border: '1.5px solid rgba(239, 68, 68, 0.38)', borderRadius: '10px', px: 1, py: 0.6, minWidth: 40, boxShadow: '0 2px 10px rgba(239, 68, 68, 0.18)' }}>
                          <Typography sx={{ fontWeight: 950, fontSize: '1.2rem', color: '#ef4444', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.seconds).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase', mt: 0.25 }}>secs</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Chip
                        label="Broadcast Time Concluded"
                        size="small"
                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#b45309', fontWeight: 800, fontSize: '0.74rem' }}
                      />
                    )}

                    {/* Edit Ticket Button */}
                    <Button
                      variant="contained"
                      onClick={() => setIsScheduleFlipped(true)}
                      startIcon={<EditIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.84rem',
                        px: 3.2,
                        py: 0.9,
                        borderRadius: '999px',
                        textTransform: 'none',
                        letterSpacing: '0.01em',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
                          transform: 'translateY(-2px) scale(1.02)',
                          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.28)',
                        },
                      }}
                    >
                      Edit Schedule
                    </Button>

                    <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                      Auto-synced to format slot
                    </Typography>
                  </Box>
                </Paper>

                {/* ── TICKET BACK: BROADCAST SCHEDULE & TIMING EDITOR ── */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '26px',
                    p: { xs: 2.5, sm: 3.5 },
                    bgcolor: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 12px 36px rgba(15, 23, 42, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    position: isScheduleFlipped ? 'relative' : 'absolute',
                    inset: isScheduleFlipped ? 'auto' : 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(1px)',
                    pointerEvents: isScheduleFlipped ? 'auto' : 'none',
                  }}
                >
                  {/* Top Bar on Back of Card */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '12px',
                          bgcolor: alpha(hubColor, 0.12),
                          color: hubColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                        }}
                      >
                        📅
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                          Edit Broadcast Timing
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                          Format Slot: Every {DAY_NAMES[CATEGORY_TO_DAY_MAP[category] || 1]} · 10:00 AM WAT
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      onClick={() => setIsScheduleFlipped(false)}
                      startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        color: '#0f172a',
                        bgcolor: 'rgba(15, 23, 42, 0.05)',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        borderRadius: '999px',
                        px: 2.4,
                        py: 0.6,
                        textTransform: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(15, 23, 42, 0.1)',
                          transform: 'translateX(2px)',
                        },
                      }}
                    >
                      Done & View Ticket
                    </Button>
                  </Box>

                  {/* Event Date & Time Pickers */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <PremiumDatePicker
                      fullWidth
                      label="Broadcast Date"
                      value={eventDatePart}
                      onChange={(e) => handleDateChange(e.target.value)}
                      colorTheme={hubColor}
                      minDate={new Date()}
                    />
                    <PremiumTimePicker
                      fullWidth
                      label="Broadcast Time"
                      value={eventTimePart}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      colorTheme={hubColor}
                    />
                  </Box>

                  {/* Actions Footer on Back of Card */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid rgba(226, 232, 240, 0.8)', flexWrap: 'wrap', gap: 1.5 }}>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        const slotDate = getNextSlotForCategory(category, 10, 0);
                        const year = slotDate.getFullYear();
                        const month = String(slotDate.getMonth() + 1).padStart(2, '0');
                        const day = String(slotDate.getDate()).padStart(2, '0');
                        const hours = String(slotDate.getHours()).padStart(2, '0');
                        const mins = String(slotDate.getMinutes()).padStart(2, '0');
                        setEventDate(`${year}-${month}-${day}T${hours}:${mins}:00`);
                      }}
                      startIcon={<BoltIcon sx={{ fontSize: 15 }} />}
                      sx={{
                        color: hubColor,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 1.5,
                        '&:hover': { bgcolor: alpha(hubColor, 0.08) },
                      }}
                    >
                      Reset to Standard {DAY_NAMES[CATEGORY_TO_DAY_MAP[category] || 1]} (10 AM)
                    </Button>

                    <Button
                      variant="contained"
                      onClick={() => setIsScheduleFlipped(false)}
                      sx={{
                        bgcolor: '#0f172a',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        px: 3.5,
                        py: 0.9,
                        borderRadius: '999px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#020617',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      Save & View Ticket
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Box>

            {/* ── 3D FLIPPABLE "GET LIVESTREAM IDEAS HERE" CARD (Front: AI Ideation, Back: Manual Form Textfields) ── */}
            <Box
              ref={manualFieldsRef}
              sx={{
                width: '100%',
                mb: 4,
                perspective: '2000px',
                position: 'relative',
              }}
            >
              <motion.div
                animate={{ rotateY: isIdeasCardFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 24, mass: 0.8 }}
                style={{
                  width: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                }}
              >
                {/* ── CARD FRONT (AI IDEATION INVITATION) ── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    borderRadius: '28px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                    border: '1.5px solid rgba(226, 232, 240, 0.9)',
                    boxShadow: '0 12px 36px -10px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: { xs: 2.5, md: 4 },
                    position: isIdeasCardFlipped ? 'absolute' : 'relative',
                    inset: isIdeasCardFlipped ? 0 : 'auto',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg) translateZ(1px)',
                    pointerEvents: isIdeasCardFlipped ? 'none' : 'auto',
                    overflow: 'hidden',
                  }}
                >
                  {/* Left Visual: 2 Overlapping Squircles (Live Studio Screen + Master Hub Topic) with "×" connector */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      py: { xs: 1, md: 1.5 },
                      px: { xs: 1, md: 1.5 },
                      flexShrink: 0,
                      mx: { xs: 'auto', md: 0 },
                    }}
                  >
                    {/* Top Squircle: Livestream Interface */}
                    <Box
                      sx={{
                        width: { xs: 104, sm: 116 },
                        height: { xs: 104, sm: 116 },
                        borderRadius: '28px',
                        overflow: 'hidden',
                        position: 'relative',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        border: '2.5px solid rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)',
                        transform: 'rotate(-4deg)',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': { transform: 'rotate(0deg) scale(1.05)', zIndex: 3 },
                      }}
                    >
                      <Box sx={{ position: 'relative', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '2rem' }}>🎙️</Typography>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#22c55e',
                            boxShadow: '0 0 0 2px #ffffff',
                          }}
                        />
                      </Box>
                      <Typography sx={{ color: '#ffffff', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.02em' }}>
                        Live Studio
                      </Typography>
                    </Box>

                    {/* Center "×" Badge */}
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        bgcolor: '#0f172a',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        border: '2px solid #ffffff',
                        zIndex: 3,
                        my: -2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      ×
                    </Box>

                    {/* Bottom Squircle: Active Master Hub Topic */}
                    <Box
                      sx={{
                        width: { xs: 104, sm: 116 },
                        height: { xs: 104, sm: 116 },
                        borderRadius: '28px',
                        overflow: 'hidden',
                        position: 'relative',
                        background: `linear-gradient(135deg, ${hubColor} 0%, #0f172a 100%)`,
                        border: '2.5px solid rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
                        transform: 'rotate(4deg)',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': { transform: 'rotate(0deg) scale(1.05)', zIndex: 3 },
                      }}
                    >
                      <Typography sx={{ fontSize: '1.75rem', mb: 0.5 }}>
                        {initialTaxonomy?.hubId === 'energy-security' ? '⚡' : initialTaxonomy?.hubId === 'markets-talent' ? '🤝' : '🏗️'}
                      </Typography>
                      <Typography sx={{ color: '#ffffff', fontSize: '0.72rem', fontWeight: 900, textAlign: 'center', px: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {hubTitle}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Content Section: Title, Description & Action Buttons */}
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: { xs: 'center', md: 'flex-start' },
                      gap: 2.5,
                      py: { xs: 0, md: 0.5 },
                      zIndex: 1,
                      width: '100%',
                    }}
                  >
                    {ingestedBlueprints.length > 0 ? (
                      <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                          <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
                            💡 AI Ideas Active ({ingestedBlueprints.length} Options Available)
                          </Typography>
                          <Typography sx={{ color: '#334155', fontSize: { xs: '0.92rem', sm: '0.96rem' }, lineHeight: 1.6, fontWeight: 500 }}>
                            Review your generated broadcast blueprints in the 3D stage below, or launch the assistant to generate alternative angles.
                          </Typography>
                          {appliedBlueprint?.title && (
                            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: '#059669 !important' }} />}
                                label={`Selected: "${appliedBlueprint.title}"`}
                                sx={{
                                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                                  color: '#065f46',
                                  fontWeight: 800,
                                  fontSize: '0.82rem',
                                  border: '1px solid rgba(16, 185, 129, 0.28)',
                                  maxWidth: '100%',
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }
                                }}
                              />
                            </Box>
                          )}
                        </Box>

                        {/* Buttons for active intelligence state */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1.5, flexWrap: 'wrap' }}>
                          <Button
                            variant="contained"
                            onClick={() => {
                              carouselRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            startIcon={<SparkleIcon sx={{ fontSize: '16px !important' }} />}
                            sx={{
                              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                              color: '#ffffff',
                              fontWeight: 900,
                              px: 3.5,
                              py: 1.25,
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
                            View Ingested Cards
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => setIsIdeasDrawerOpen(true)}
                            endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                            sx={{
                              color: '#0f172a',
                              bgcolor: '#ffffff',
                              border: '1.5px solid #cbd5e1',
                              fontWeight: 800,
                              px: 3,
                              py: 1.2,
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
                            Open Ideas Assistant
                          </Button>
                          <Button
                            variant="text"
                            onClick={() => setIsIdeasCardFlipped(true)}
                            sx={{
                              color: '#64748b',
                              fontWeight: 700,
                              px: 2,
                              py: 1.2,
                              borderRadius: '14px',
                              textTransform: 'none',
                              fontSize: '0.85rem',
                              '&:hover': {
                                color: '#0f172a',
                                bgcolor: 'rgba(15, 23, 42, 0.04)',
                              }
                            }}
                          >
                            Manual Form ↺
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.35rem', sm: '1.55rem' } }}>
                            Get livestream ideas here
                          </Typography>
                          <Typography sx={{ color: '#334155', fontSize: { xs: '0.92rem', sm: '0.96rem' }, lineHeight: 1.6, fontWeight: 500 }}>
                            Spend 1 minute to get fresh, realistic livestream ideas people want to watch, or choose Ignore to write yourself.
                          </Typography>
                        </Box>

                        {/* Buttons underneath the text */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2, flexWrap: 'wrap' }}>
                          <Button
                            variant="contained"
                            onClick={() => setIsIdeasDrawerOpen(true)}
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
                            onClick={() => {
                              setIsIdeasCardFlipped(true);
                              if (!eventDate) {
                                const slotDate = getNextSlotForCategory(category || 'capital', 10, 0);
                                const year = slotDate.getFullYear();
                                const month = String(slotDate.getMonth() + 1).padStart(2, '0');
                                const day = String(slotDate.getDate()).padStart(2, '0');
                                const hours = String(slotDate.getHours()).padStart(2, '0');
                                const mins = String(slotDate.getMinutes()).padStart(2, '0');
                                setEventDate(`${year}-${month}-${day}T${hours}:${mins}:00`);
                              }
                            }}
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
                      </>
                    )}
                  </Box>
                </Paper>

                {/* ── CARD BACK (MANUAL BROADCAST DETAILS FORM) ── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 4.5 },
                    borderRadius: '28px',
                    bgcolor: '#ffffff',
                    border: '1.5px solid rgba(226, 232, 240, 0.9)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    position: isIdeasCardFlipped ? 'relative' : 'absolute',
                    inset: isIdeasCardFlipped ? 'auto' : 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(1px)',
                    pointerEvents: isIdeasCardFlipped ? 'auto' : 'none',
                  }}
                >
                  {/* Top Bar on Back of Card */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'rgba(15,23,42,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '1.25rem' }}>✍️</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
                          {appliedBlueprint ? 'Fine-Tune Broadcast Details' : 'Manual Broadcast Details'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                          {appliedBlueprint ? 'Adjust pre-populated values or set the exact date, time, and taxonomy below.' : 'Fill in your custom livestream title, overview, and schedule manually.'}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      onClick={() => setIsIdeasCardFlipped(false)}
                      startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
                      sx={{
                        color: '#475569',
                        bgcolor: '#f1f5f9',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        borderRadius: '999px',
                        px: 2.2,
                        py: 0.7,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#e2e8f0',
                          color: '#0f172a',
                          transform: 'translateX(-2px)',
                        }
                      }}
                    >
                      Back to AI Ideas
                    </Button>
                  </Box>

                  {/* Form Textfields */}
                  <PremiumTextField
                    fullWidth
                    label="Livestream Title"
                    placeholder="e.g. Mechanization Bottlenecks in Southwest Cassava Clusters"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    colorTheme={hubColor}
                  />

                  <PremiumTextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description / Overview"
                    placeholder="Explain what topics, field case studies, and actionable takeaways will be discussed..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    colorTheme={hubColor}
                  />

                  {/* Note about auto and manual inputs */}
                  <Box sx={{ p: 2.25, borderRadius: '18px', bgcolor: 'rgba(15, 23, 42, 0.03)', border: '1.5px solid rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>💡</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500, lineHeight: 1.5 }}>
                      Broadcast title and description can be entered manually here, or generated automatically via <strong>AI Broadcast Blueprints</strong> on the front of this card. Scheduling and timing are configured on the main flow above.
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Box>

            {/* ── BROADCAST BLUEPRINTS 3D CAROUSEL STAGE (When Blueprints Ingested) ── */}
            {ingestedBlueprints.length > 0 && (
              <Box ref={carouselRef} sx={{ width: '100%', mb: 4 }}>
                {/* Progress & Quick Jump Strip */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, mb: 2 }}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.84rem', fontWeight: 800 }}>
                    Broadcast Blueprint <strong style={{ color: '#0f172a' }}>{deckActiveIndex + 1}</strong> of {ingestedBlueprints.length}
                  </Typography>
                  
                  {/* Dot indicators */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    {ingestedBlueprints.map((item, dotIdx) => {
                      const isCurrentDot = dotIdx === deckActiveIndex;
                      const dotColor = item.eraColor || '#10b981';
                      return (
                        <Box
                          key={`blueprint-dot-${dotIdx}`}
                          onClick={() => {
                            setIsCardFlipped(false);
                            setDeckActiveIndex(dotIdx);
                          }}
                          sx={{
                            width: isCurrentDot ? 26 : 8,
                            height: 8,
                            borderRadius: '999px',
                            bgcolor: isCurrentDot ? dotColor : alpha(dotColor, 0.3),
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            '&:hover': { bgcolor: dotColor }
                          }}
                        />
                      );
                    })}
                  </Box>

                  <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}>
                    {currentBlueprint?.eraBadge || 'Broadcast Blueprint'}
                  </Typography>
                </Box>

                {/* 3D Carousel Stage with Floating Prev/Next Buttons */}
                <Box sx={{ position: 'relative', width: '100%' }}>
                  {/* Floating Previous Button */}
                  <IconButton
                    onClick={handlePrevCard}
                    disabled={deckActiveIndex === 0}
                    aria-label="Previous Blueprint"
                    sx={{
                      position: 'absolute',
                      left: { xs: -8, sm: -18, md: -28 },
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 25,
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      bgcolor: '#ffffff',
                      border: '1.5px solid rgba(226, 232, 240, 0.95)',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      opacity: deckActiveIndex === 0 ? 0.3 : 1,
                      pointerEvents: deckActiveIndex === 0 ? 'none' : 'auto',
                      '&:hover': {
                        bgcolor: '#0f172a',
                        color: '#ffffff',
                        transform: 'translateY(-50%) scale(1.08)',
                      }
                    }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 18 }} />
                  </IconButton>

                  {/* Floating Next Button */}
                  <IconButton
                    onClick={handleNextCard}
                    disabled={deckActiveIndex === ingestedBlueprints.length - 1}
                    aria-label="Next Blueprint"
                    sx={{
                      position: 'absolute',
                      right: { xs: -8, sm: -18, md: -28 },
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 25,
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      bgcolor: '#0f172a',
                      border: '1.5px solid #0f172a',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
                      color: '#ffffff',
                      transition: 'all 0.2s ease',
                      opacity: deckActiveIndex === ingestedBlueprints.length - 1 ? 0.3 : 1,
                      pointerEvents: deckActiveIndex === ingestedBlueprints.length - 1 ? 'none' : 'auto',
                      '&:hover': {
                        bgcolor: '#1e293b',
                        transform: 'translateY(-50%) scale(1.08)',
                      }
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 18 }} />
                  </IconButton>

                  {/* Stage Area: Perspective & Stack */}
                  <Box
                    sx={{
                      width: '100%',
                      minHeight: { xs: 460, sm: 500, md: 520 },
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'visible',
                      perspective: '1400px',
                      py: { xs: 1, sm: 2 },
                    }}
                  >
                    <AnimatePresence initial={false} custom={deckActiveIndex}>
                      {ingestedBlueprints.map((item, index) => {
                        const diff = index - deckActiveIndex;
                        const isActive = diff === 0;
                        const isApplied = Boolean(
                          appliedBlueprint?.title &&
                          item?.title &&
                          appliedBlueprint.title.trim().toLowerCase() === item.title.trim().toLowerCase()
                        );

                        let x = 0;
                        let y = 0;
                        let scale = 1;
                        let zIndex = 0;
                        let opacity = 1;
                        let rotateX = 0;
                        let rotateY = 0;

                        if (isMobile) {
                          if (diff === 0) {
                            x = 0;
                            y = 0;
                            scale = 1;
                            zIndex = 10;
                            opacity = 1;
                            rotateX = 0;
                            rotateY = isCardFlipped ? 180 : 0;
                          } else if (diff === 1) {
                            x = 0;
                            y = 20;
                            scale = 0.94;
                            zIndex = 8;
                            opacity = 1;
                            rotateX = -2;
                            rotateY = 0;
                          } else if (diff === 2) {
                            x = 0;
                            y = 38;
                            scale = 0.88;
                            zIndex = 6;
                            opacity = 0.85;
                            rotateX = -4;
                            rotateY = 0;
                          } else if (diff > 2) {
                            x = 0;
                            y = 52 + (diff - 3) * 10;
                            scale = Math.max(0.72, 0.82 - (diff - 3) * 0.04);
                            zIndex = Math.max(1, 5 - diff);
                            opacity = 0;
                            rotateX = -6;
                            rotateY = 0;
                          } else if (diff === -1) {
                            x = 0;
                            y = 420;
                            scale = 0.95;
                            zIndex = 12;
                            opacity = 0;
                            rotateX = 6;
                            rotateY = 0;
                          } else {
                            x = 0;
                            y = 500 + Math.abs(diff + 1) * 40;
                            scale = 0.9;
                            zIndex = 1;
                            opacity = 0;
                            rotateX = 8;
                            rotateY = 0;
                          }
                        } else {
                          // Desktop horizontal 3D carousel
                          const xOffset = isTablet ? 340 : 420;
                          const scaleFactor = 0.88;
                          const rotateAngle = 12;

                          if (diff === 0) {
                            x = 0;
                            y = 0;
                            scale = 1;
                            zIndex = 10;
                            opacity = 1;
                            rotateX = 0;
                            rotateY = isCardFlipped ? 180 : 0;
                          } else if (diff === 1) {
                            x = xOffset;
                            y = 0;
                            scale = scaleFactor;
                            zIndex = 5;
                            opacity = 1;
                            rotateX = 0;
                            rotateY = -rotateAngle;
                          } else if (diff === -1) {
                            x = -xOffset;
                            y = 0;
                            scale = scaleFactor;
                            zIndex = 5;
                            opacity = 1;
                            rotateX = 0;
                            rotateY = rotateAngle;
                          } else if (diff > 1) {
                            x = diff * xOffset;
                            y = 0;
                            scale = Math.max(0.68, scaleFactor - (diff - 1) * 0.08);
                            zIndex = Math.max(1, 5 - diff);
                            opacity = 0;
                            rotateX = 0;
                            rotateY = -rotateAngle * 1.4;
                          } else {
                            x = diff * xOffset;
                            y = 0;
                            scale = Math.max(0.68, scaleFactor - (Math.abs(diff) - 1) * 0.08);
                            zIndex = Math.max(1, 5 - Math.abs(diff));
                            opacity = 0;
                            rotateX = 0;
                            rotateY = rotateAngle * 1.4;
                          }
                        }

                        return (
                          <motion.div
                            key={item.id || `blueprint-deck-card-${index}`}
                            drag={isActive && !isCardFlipped ? (isMobile ? "y" : "x") : false}
                            dragConstraints={isMobile ? { top: -40, bottom: 260 } : { left: 0, right: 0 }}
                            dragElastic={0.45}
                            onDragEnd={(_, { offset, velocity }) => {
                              if (!isActive || isCardFlipped) return;
                              if (isMobile) {
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
                              minHeight: isMobile ? 420 : 480,
                              transformStyle: 'preserve-3d',
                              WebkitTransformStyle: 'preserve-3d',
                              cursor: isActive ? (isCardFlipped ? 'default' : 'grab') : (Math.abs(diff) === 1 ? 'pointer' : 'default'),
                              borderRadius: '28px',
                              touchAction: isMobile ? 'pan-x' : 'pan-y',
                              pointerEvents: (isMobile ? (diff > 2 || diff < 0) : Math.abs(diff) > 1) ? 'none' : 'auto',
                            }}
                            onClick={() => {
                              if (!isActive && Math.abs(diff) === 1) {
                                setIsCardFlipped(false);
                                setDeckActiveIndex(index);
                              }
                            }}
                          >
                            {/* ── CARD FRONT (3D FACE) ── */}
                            <Box
                              onClick={() => {
                                if (isActive && !isCardFlipped) setIsCardFlipped(true);
                              }}
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(0deg) translateZ(1px)',
                                pointerEvents: (isActive && isCardFlipped) ? 'none' : 'auto',
                                borderRadius: '28px',
                                bgcolor: '#ffffff',
                                border: `1.5px solid ${alpha(item.eraColor || '#10b981', isActive ? 0.35 : 0.2)}`,
                                boxShadow: isActive 
                                  ? `0 24px 60px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px #ffffff inset, 0 12px 36px -8px ${alpha(item.eraColor || '#10b981', 0.22)}` 
                                  : '0 16px 38px -8px rgba(15, 23, 42, 0.12), 0 0 0 1px #ffffff inset',
                                p: { xs: 2.5, sm: 4.5 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                textAlign: 'center',
                                background: '#ffffff',
                                overflow: 'hidden',
                                userSelect: 'none',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '35%',
                                  background: `linear-gradient(180deg, ${alpha(item.eraColor || '#10b981', 0.06)} 0%, rgba(255,255,255,0) 100%)`,
                                  pointerEvents: 'none',
                                  zIndex: 1,
                                }
                              }}
                            >
                              {isActive ? (
                                <>
                                  {/* Middle Section: Option Pill, Big Centered Title, Clean Hook */}
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 2, sm: 2.5 }, my: 'auto', width: '100%', maxWidth: 680, position: 'relative', zIndex: 2 }}>
                                    
                                    {/* Option Pill & Active Blueprint Badge */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', justifyContent: 'center' }}>
                                      {isApplied && (
                                        <Box
                                          sx={{
                                            bgcolor: '#f59e0b',
                                            color: '#ffffff',
                                            px: { xs: 2.25, sm: 2.75 },
                                            py: { xs: 0.6, sm: 0.8 },
                                            borderRadius: '999px',
                                            boxShadow: '0 6px 18px rgba(245, 158, 11, 0.45)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                          }}
                                        >
                                          <Typography
                                            sx={{
                                              textTransform: 'uppercase',
                                              fontSize: { xs: '0.74rem', sm: '0.8rem' },
                                              fontWeight: 900,
                                              letterSpacing: '0.06em',
                                              color: '#ffffff',
                                            }}
                                          >
                                            ⭐ Active Blueprint (Applied)
                                          </Typography>
                                        </Box>
                                      )}
                                      <Box
                                        sx={{
                                          bgcolor: item.eraColor || '#10b981',
                                          color: '#ffffff',
                                          px: { xs: 2.25, sm: 3 },
                                          py: { xs: 0.6, sm: 0.8 },
                                          borderRadius: '999px',
                                          boxShadow: `0 6px 18px ${alpha(item.eraColor || '#10b981', 0.38)}`,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            textTransform: 'uppercase',
                                            fontSize: { xs: '0.74rem', sm: '0.8rem' },
                                            fontWeight: 900,
                                            letterSpacing: '0.06em',
                                            color: '#ffffff',
                                          }}
                                        >
                                          OPTION {index + 1}: {item.typeTitle || 'BROADCAST BLUEPRINT'}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    {/* Big Bold Broadcast Show Title */}
                                    <Typography
                                      variant="h3"
                                      sx={{
                                        color: '#0f172a',
                                        fontWeight: 900,
                                        fontSize: { xs: '1.45rem', sm: '2.1rem', md: '2.45rem' },
                                        lineHeight: 1.25,
                                        letterSpacing: '-0.03em',
                                        px: { xs: 0.5, sm: 2 },
                                        textAlign: 'center',
                                      }}
                                    >
                                      {item.title}
                                    </Typography>

                                    {/* Cold Open Hook Box */}
                                    <Box
                                      sx={{
                                        width: '100%',
                                        maxWidth: 620,
                                        p: { xs: 2, sm: 2.5 },
                                        borderRadius: '16px',
                                        bgcolor: 'rgba(15, 23, 42, 0.03)',
                                        border: '1.5px solid rgba(15, 23, 42, 0.08)',
                                        backdropFilter: 'blur(10px)',
                                        textAlign: 'center',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                                      }}
                                    >
                                      <Typography sx={{ fontSize: { xs: '0.86rem', sm: '0.94rem' }, color: '#1e293b', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.5 }}>
                                        {item.hook ? item.hook : `"${item.title} — Ground-Level Breakdown & Field Debate"`}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Bottom Row: Broadcast Count & View Details Button */}
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
                                        fontSize: { xs: '0.78rem', sm: '0.86rem' },
                                        fontWeight: 800,
                                        letterSpacing: '0.02em',
                                        textTransform: 'uppercase',
                                      }}
                                    >
                                      Broadcast {index + 1} of {ingestedBlueprints.length}
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
                                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                        fontWeight: 800,
                                        fontSize: { xs: '0.85rem', sm: '0.92rem' },
                                        px: { xs: 3, sm: 4 },
                                        py: { xs: 1, sm: 1.2 },
                                        borderRadius: '999px',
                                        textTransform: 'none',
                                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.22)',
                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                        '&:hover': {
                                          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
                                          transform: 'translateY(-2px) scale(1.02)',
                                          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.32)',
                                        }
                                      }}
                                    >
                                      View Details
                                    </Button>
                                  </Box>
                                </>
                              ) : (
                                /* ── NEIGHBOR REGULAR CARD: SIMPLIFIED CLEAN OVERVIEW ── */
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
                                  {/* Broadcast Count & Active Badge */}
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    {isApplied && (
                                      <Chip
                                        label="⭐ Active Blueprint (Applied)"
                                        sx={{
                                          bgcolor: '#fef3c7',
                                          color: '#b45309',
                                          fontWeight: 900,
                                          fontSize: '0.8rem',
                                          height: 28,
                                          borderRadius: '999px',
                                          border: '1px solid #fde68a'
                                        }}
                                      />
                                    )}
                                    <Chip
                                      label={`Broadcast ${index + 1} of ${ingestedBlueprints.length}`}
                                      sx={{
                                        bgcolor: alpha(item.eraColor || '#10b981', 0.1),
                                        color: item.eraColor || '#10b981',
                                        fontWeight: 900,
                                        fontSize: '0.85rem',
                                        height: 32,
                                        px: 1.5,
                                        borderRadius: '999px',
                                        border: `1.5px solid ${alpha(item.eraColor || '#10b981', 0.28)}`,
                                      }}
                                    />
                                  </Box>

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
                                    Tap to View Broadcast
                                  </Typography>

                                  {/* Flow Tag */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.eraColor || '#10b981' }} />
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                      {item.typeTitle || 'Broadcast Blueprint'}
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                            </Box>

                            {/* ── CARD BACK (3D FACE ROTATED 180 DEG) ── */}
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
                                bgcolor: '#ffffff',
                                border: `2px solid ${alpha(item.eraColor || '#10b981', 0.55)}`,
                                boxShadow: `0 24px 60px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px #ffffff inset, 0 16px 40px -8px ${alpha(item.eraColor || '#10b981', 0.25)}`,
                                p: { xs: 2.5, sm: 3.75 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                textAlign: 'left',
                                background: '#ffffff',
                                overflow: 'hidden',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '35%',
                                  background: `linear-gradient(180deg, ${alpha(item.eraColor || '#10b981', 0.05)} 0%, rgba(255,255,255,0) 100%)`,
                                  pointerEvents: 'none',
                                  zIndex: 1,
                                }
                              }}
                            >
                              <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                  {/* Top Bar: Back Button on Top Left, Option & Countdown on Top Right */}
                                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid rgba(226, 232, 240, 0.7)' }}>
                                     <Button
                                       size="small"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setIsCardFlipped(false);
                                       }}
                                       startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                                       sx={{
                                         color: '#334155',
                                         bgcolor: 'rgba(0,0,0,0.05)',
                                         fontSize: '0.8rem',
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

                                     {(() => {
                                       const slot = getNextSlotForCategory(item.category || category, 10, 0);
                                       const now = new Date();
                                       const diffMs = Math.max(0, slot.getTime() - now.getTime());
                                       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                       const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                       const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                       const liveInText = `Goes live in ${diffDays > 0 ? `${diffDays}d ` : ''}${diffHours}h ${diffMins}m`;
                                       return (
                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                           {isApplied && (
                                             <Chip
                                               label="⭐ Active Blueprint (Applied)"
                                               size="small"
                                               sx={{
                                                 bgcolor: '#fef3c7',
                                                 color: '#b45309',
                                                 fontWeight: 900,
                                                 fontSize: '0.72rem',
                                                 height: 26,
                                                 borderRadius: '999px',
                                                 border: '1px solid #fde68a'
                                               }}
                                             />
                                           )}
                                           <Chip
                                             label={`Option ${index + 1}`}
                                             size="small"
                                             sx={{
                                               bgcolor: 'rgba(0, 0, 0, 0.05)',
                                               color: '#475569',
                                               fontWeight: 800,
                                               fontSize: '0.72rem',
                                               height: 26,
                                               borderRadius: '999px'
                                             }}
                                           />
                                           <Chip
                                             label={liveInText}
                                             size="small"
                                             sx={{
                                               bgcolor: alpha(item.eraColor || '#10b981', 0.12),
                                               color: item.eraColor || '#059669',
                                               fontWeight: 800,
                                               fontSize: '0.72rem',
                                               height: 26,
                                               borderRadius: '999px',
                                               border: `1px solid ${alpha(item.eraColor || '#10b981', 0.25)}`
                                             }}
                                           />
                                         </Box>
                                       );
                                     })()}
                                   </Box>

                                   {/* Smaller Title on Top */}
                                   <Typography
                                     sx={{
                                       color: '#0f172a',
                                       fontWeight: 900,
                                       fontSize: { xs: '1.05rem', sm: '1.28rem' },
                                       lineHeight: 1.3,
                                       letterSpacing: '-0.02em',
                                       mb: 1,
                                     }}
                                   >
                                     {item.title}
                                   </Typography>

                                   {/* Scrollable Content: 3-Act Rundown & Ecosystem CTA */}
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
                                     {/* 3-Act Presentation Rundown */}
                                     {item.timelinePillars && item.timelinePillars.length > 0 ? (
                                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                         {item.timelinePillars.map((act: any, aIdx: number) => {
                                           const actColors = ['#ef4444', '#f59e0b', '#10b981'];
                                           const actColor = actColors[aIdx % actColors.length];
                                           
                                           // Clean header: prevent repeating "Act X: Act X:"
                                           const rawRole = act.role || `Act ${aIdx + 1}`;
                                           const roleWithoutAct = rawRole.replace(/^Act\s*\d+\s*[:.-]?\s*/i, '').trim();
                                           const cleanActTitle = /^Act\s*\d+/i.test(rawRole) ? rawRole : (rawRole.toLowerCase().startsWith('block') ? rawRole : `Block ${aIdx + 1}: ${rawRole}`);

                                           // Extract question if present
                                           const questionMatch = act.desc?.match(/"([^"]+\?)"/) || act.desc?.match(/“([^”]+\?)”/) || act.desc?.match(/\*([^*]+\?)\*/);
                                           const actQ = questionMatch ? questionMatch[1] : (item.keyQuestions && item.keyQuestions[aIdx] ? item.keyQuestions[aIdx] : null);

                                           return (
                                             <Box key={aIdx} sx={{ p: 1.25, borderRadius: '14px', bgcolor: 'rgba(15, 23, 42, 0.02)', border: '1.2px solid rgba(15, 23, 42, 0.06)', display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                                               <Box
                                                 sx={{
                                                   width: 10,
                                                   height: 10,
                                                   borderRadius: '50%',
                                                   bgcolor: actColor,
                                                   mt: '6px',
                                                   flexShrink: 0,
                                                   boxShadow: `0 0 6px ${alpha(actColor, 0.6)}`
                                                 }}
                                               />
                                               <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.25 }}>
                                                   <Typography sx={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: 800 }}>
                                                     <span style={{ color: actColor }}>{cleanActTitle}</span>
                                                   </Typography>
                                                   {act.time && (
                                                     <Chip
                                                       label={act.time}
                                                       size="small"
                                                       sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: alpha(actColor, 0.1), color: actColor }}
                                                     />
                                                   )}
                                                 </Box>
                                                 <Typography sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, fontWeight: 500 }}>
                                                   {act.desc}
                                                 </Typography>

                                                 {/* Question Container under each Act */}
                                                 {actQ && (
                                                   <Box sx={{ mt: 0.85, p: 1, borderRadius: '10px', bgcolor: 'rgba(15, 23, 42, 0.03)', border: '1px solid rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                                                     <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>❓</Typography>
                                                     <Typography sx={{ color: '#1e293b', fontSize: '0.78rem', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.4 }}>
                                                       {actQ}
                                                     </Typography>
                                                   </Box>
                                                 )}
                                               </Box>
                                             </Box>
                                           );
                                         })}
                                       </Box>
                                     ) : (
                                       <Typography sx={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                                         &ldquo;{item.description || item.hook}&rdquo;
                                       </Typography>
                                     )}

                                     {/* Simple Livestream CTA */}
                                     {item.suggestedJobsFocus && (
                                       <Box sx={{ mt: 1.5, p: 2, borderRadius: '16px', bgcolor: alpha(item.eraColor || '#10b981', 0.08), border: `1.5px solid ${alpha(item.eraColor || '#10b981', 0.25)}` }}>
                                         <Typography sx={{ color: item.eraColor || '#059669', fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                                           Livestream CTA
                                         </Typography>
                                         <Typography sx={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: 1.6, fontWeight: 600 }}>
                                           {item.suggestedJobsFocus}
                                         </Typography>
                                       </Box>
                                     )}
                                   </Box>
                                 </Box>

                                 {/* Bottom Action Area: Dynamic Applied / Switch / Re-apply actions */}
                                 <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isApplied ? 'space-between' : 'flex-end', pt: 1.5, borderTop: '1px solid rgba(226, 232, 240, 0.8)', mt: 1, gap: 1.5, flexWrap: 'wrap' }}>
                                   {isApplied ? (
                                     <>
                                       <Chip
                                         icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: '#059669 !important' }} />}
                                         label="✓ Currently Applied"
                                         sx={{
                                           bgcolor: 'rgba(16, 185, 129, 0.12)',
                                           color: '#065f46',
                                           fontWeight: 900,
                                           fontSize: '0.84rem',
                                           border: '1.5px solid rgba(16, 185, 129, 0.3)',
                                           py: 0.5,
                                           px: 0.5
                                         }}
                                       />
                                       <Button
                                         variant="outlined"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           handleSelectBlueprint(item, true);
                                         }}
                                         sx={{
                                           color: '#0f172a',
                                           borderColor: '#cbd5e1',
                                           fontWeight: 800,
                                           fontSize: '0.88rem',
                                           px: 3,
                                           py: 1,
                                           borderRadius: '999px',
                                           textTransform: 'none',
                                           transition: 'all 0.2s ease',
                                           '&:hover': {
                                             bgcolor: '#f8fafc',
                                             borderColor: '#94a3b8',
                                             transform: 'translateY(-1px)'
                                           }
                                         }}
                                       >
                                         Re-apply Framework
                                       </Button>
                                     </>
                                   ) : (
                                     <Button
                                       variant="contained"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleSelectBlueprint(item, false);
                                       }}
                                       sx={{
                                         background: `linear-gradient(135deg, ${item.eraColor || '#10b981'} 0%, ${alpha(item.eraColor || '#10b981', 0.9)} 100%)`,
                                         color: '#ffffff',
                                         fontWeight: 900,
                                         fontSize: '0.94rem',
                                         px: 4.5,
                                         py: 1.1,
                                         borderRadius: '999px',
                                         textTransform: 'none',
                                         boxShadow: `0 8px 24px ${alpha(item.eraColor || '#10b981', 0.4)}`,
                                         transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                         '&:hover': {
                                           background: `linear-gradient(135deg, ${item.eraColor || '#10b981'} 0%, ${item.eraColor || '#10b981'} 100%)`,
                                           transform: 'translateY(-2px) scale(1.02)',
                                           boxShadow: `0 12px 30px ${alpha(item.eraColor || '#10b981', 0.55)}`,
                                         },
                                       }}
                                     >
                                       Switch to this Blueprint
                                     </Button>
                                   )}
                                 </Box>
                               </Box>
                             </Box>
                           </motion.div>
                         );
                       })}
                     </AnimatePresence>
                   </Box>
                 </Box>
               </Box>
             )}
           </Box>
         )}

         {step === 2 && (
          <Box sx={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: 0, width: '100%', pb: { xs: 16, md: 22 } }}>
            
            {/* IN-PROGRESS DRAFT RESUMPTION BANNER */}
            {detectedDraft && (
              <Paper
                elevation={0}
                sx={{
                  maxWidth: 880,
                  mx: 'auto',
                  width: '100%',
                  p: { xs: 2.25, sm: 3 },
                  mb: 3,
                  borderRadius: '24px',
                  bgcolor: alpha('#f59e0b', 0.08),
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  boxShadow: '0 12px 32px rgba(245, 158, 11, 0.12)',
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
                      width: 48,
                      height: 48,
                      borderRadius: '16px',
                      bgcolor: '#f59e0b',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 6px 16px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <LiveTvIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
                        In-Progress Livestream Draft Detected
                      </Typography>
                      <Chip
                        label="Matching Blueprint / CTAs Found"
                        size="small"
                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#b45309', fontWeight: 800, fontSize: '0.72rem' }}
                      />
                    </Box>
                    {(() => {
                      const dateVal = detectedDraft.updatedAt || detectedDraft.createdAt;
                      const parsedDate = dateVal ? new Date(dateVal) : null;
                      const isValid = parsedDate && !isNaN(parsedDate.getTime());
                      const blocks = detectedDraft.livestream?.blocks || detectedDraft.livestreamBlocks || [];
                      const slideCount = blocks.filter((b: any) => b.blockType !== 'metadata').length;
                      return (
                        <Typography sx={{ color: '#475569', fontSize: '0.86rem', mt: 0.35 }}>
                          You previously started &quot;<strong>{detectedDraft.title || 'Untitled Draft'}</strong>&quot;{' '}
                          {isValid
                            ? `(last updated ${parsedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })})`
                            : ''}
                          {' '}with {slideCount > 0 ? `${slideCount} rundown slide${slideCount !== 1 ? 's' : ''} saved` : 'framework details saved'}.
                        </Typography>
                      );
                    })()}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-end', md: 'flex-start' } }}>
                  <Button
                    variant="contained"
                    onClick={() => handleResumeDetectedDraft(detectedDraft)}
                    startIcon={<CheckIcon />}
                    sx={{
                      bgcolor: '#f59e0b',
                      color: '#ffffff',
                      fontWeight: 900,
                      borderRadius: '14px',
                      textTransform: 'none',
                      px: 2.75,
                      py: 1.1,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 6px 18px rgba(245, 158, 11, 0.35)',
                      '&:hover': { bgcolor: '#d97706' },
                    }}
                  >
                    Resume Existing Draft
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleStartFreshFromBanner()}
                    sx={{
                      borderColor: 'rgba(15, 23, 42, 0.25)',
                      color: '#0f172a',
                      fontWeight: 800,
                      borderRadius: '14px',
                      textTransform: 'none',
                      px: 2.25,
                      py: 1.1,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      '&:hover': { borderColor: '#0f172a', bgcolor: 'rgba(15, 23, 42, 0.04)' },
                    }}
                  >
                    Start a New One
                  </Button>
                </Box>
              </Paper>
            )}

            {/* FRAMEWORK EMPTY STATE: RECOMMENDED BLUEPRINT & SLIDE ARRAY */}
            {!frameworkLoaded && (
              <Box sx={{ mb: 6, mt: 2, maxWidth: 880, mx: 'auto', width: '100%' }}>
                {(() => {
                  const era = ERA_CONFIG[timeframe] || ERA_CONFIG.present;
                  const flowKey = resolvedFormat;
                  const suggestedBlockIds = LIVESTREAM_TYPE_FLOWS[flowKey] || LIVESTREAM_TYPE_FLOWS.default;
                  const totalSlides = suggestedBlockIds.reduce((acc: number, bId: string) => {
                    const def = DEF_BLOCK_DEFINITIONS[bId];
                    return acc + (def?.subSlideTemplates?.length || 1);
                  }, 0);

                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      {/* ── HERO HEADER (MATCHING SIDEBAR: SQUIRCLE BADGE, HERO HEADLINE & DESCRIPTION, NO BUTTONS, NO IMAGES FAN) ── */}
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        pt: 1,
                        pb: 1,
                      }}>
                        {/* Hub Squircle Badge */}
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '18px',
                            background: `linear-gradient(135deg, ${hubColor} 0%, #0f172a 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 24px ${alpha(hubColor, 0.35)}`,
                            mb: 1.5,
                          }}
                        >
                          <Typography sx={{ fontSize: '1.65rem' }}>🎙️</Typography>
                        </Box>

                        {/* Hero Headline */}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 900,
                            color: '#0f172a',
                            letterSpacing: '-0.025em',
                            fontSize: { xs: '1.4rem', sm: '1.75rem' },
                            maxWidth: 720,
                            mx: 'auto',
                            mb: 1,
                            lineHeight: 1.3,
                          }}
                        >
                          {title || appliedBlueprint?.title || 'Your Livestream Presentation'}
                        </Typography>

                        {/* Hero Description */}
                        <Typography
                          sx={{
                            color: '#475569',
                            fontSize: { xs: '0.92rem', sm: '0.98rem' },
                            maxWidth: 580,
                            mx: 'auto',
                            lineHeight: 1.55,
                            fontWeight: 500,
                          }}
                        >
                          Here is how your livestream will flow. The {suggestedBlockIds.length} blocks below are the exact slide sequence you will present, from opening to close.
                        </Typography>
                      </Box>

                      {/* Live Reactive Timeline Preview (List of Broadcast Blocks) */}
                      <Box sx={{ position: 'relative', pl: { xs: 3, md: 5 }, width: '100%', mx: 'auto', mt: 1 }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: { xs: 12, md: 20 },
                            top: 14,
                            bottom: 14,
                            width: 3,
                            background: `linear-gradient(180deg, ${era.color} 0%, ${alpha(era.color, 0.1)} 100%)`,
                            borderRadius: 2,
                          }}
                        />

                        {suggestedBlockIds.map((bId: string, idx: number) => {
                          const def = DEF_BLOCK_DEFINITIONS[bId];
                          if (!def) return null;
                          const slideCount = def.subSlideTemplates?.length || 1;
                          const color = def.themeColor || hubColor;
                          const customDesc = appliedBlueprint?.customBlockDescriptions?.[bId]
                            || appliedBlueprint?.timelinePillars?.find((p: any) => p.blockId === bId || (p.role && def.name && p.role.toLowerCase().includes(def.name.toLowerCase())))?.desc;

                          return (
                            <Box key={bId} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, position: 'relative' }}>
                              {/* Numbered Node on Timeline */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: { xs: -21.5, md: -33.5 },
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  bgcolor: '#fff',
                                  border: `3px solid ${color}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mt: 1.5,
                                  zIndex: 2,
                                  boxShadow: `0 2px 8px ${alpha(color, 0.3)}`,
                                }}
                              >
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#0f172a' }}>{idx + 1}</Typography>
                              </Box>

                              {/* Block Card */}
                              <Paper
                                elevation={0}
                                sx={{
                                  flex: 1,
                                  p: 2.25,
                                  borderRadius: '18px',
                                  bgcolor: '#ffffff',
                                  border: '1.5px solid #e2e8f0',
                                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                                  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                  '&:hover': {
                                    transform: 'translateX(6px)',
                                    borderColor: alpha(color, 0.5),
                                    boxShadow: `0 8px 24px ${alpha(color, 0.12)}`,
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.98rem' }}>
                                      {def.name}
                                    </Typography>
                                    <Chip
                                      label={`${slideCount} ${slideCount === 1 ? 'slide' : 'slides'} • ${def.defaultDuration || '2m'}`}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.68rem',
                                        bgcolor: alpha(color, 0.12),
                                        color: color,
                                        fontWeight: 800,
                                      }}
                                    />
                                  </Box>
                                  <Typography sx={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>
                                    {def.subtitle}
                                  </Typography>
                                </Box>
                                <Typography sx={{ color: '#475569', fontSize: '0.84rem', lineHeight: 1.45 }}>
                                  {customDesc || def.description}
                                </Typography>
                              </Paper>
                            </Box>
                          );
                        })}
                      </Box>

                      {/* ═══ BUILD WITH AI: START OR IGNORE CALL TO ACTION CARD ═══ */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 3, md: 3.75 },
                          borderRadius: '28px',
                          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.94) 100%)',
                          backdropFilter: 'blur(24px)',
                          border: '1.5px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          alignItems: { xs: 'center', md: 'center' },
                          justifyContent: 'space-between',
                          gap: { xs: 2.5, md: 4 },
                          position: 'relative',
                          overflow: 'hidden',
                          mt: 1,
                          width: '100%',
                        }}
                      >
                        {/* Ambient Radial Glow */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${alpha(era.color, 0.25)} 0%, transparent 70%)`,
                            pointerEvents: 'none',
                            filter: 'blur(20px)',
                          }}
                        />

                        {/* Left Content */}
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, position: 'relative', zIndex: 1 }}>
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: { xs: '1.25rem', md: '1.4rem' },
                              letterSpacing: '-0.025em',
                              mb: 0.75,
                              lineHeight: 1.2,
                            }}
                          >
                            Build This Livestream with AI
                          </Typography>
                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.88rem',
                              lineHeight: 1.55,
                              maxWidth: 520,
                              fontWeight: 450,
                            }}
                          >
                            Spend 1 minute to draft your presentation slides with AI, or choose Ignore to load the blank sequence directly into your rundown.
                          </Typography>
                        </Box>

                        {/* Right Action Buttons: Start & Ignore */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexShrink: 0,
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            position: 'relative',
                            zIndex: 1,
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={() => {
                              setIsDraftingDrawerOpen(true);
                            }}
                            startIcon={<SparkleIcon sx={{ fontSize: 18 }} />}
                            sx={{
                              bgcolor: era.color,
                              color: '#fff',
                              fontWeight: 900,
                              px: 3.75,
                              py: 1.35,
                              borderRadius: '16px',
                              fontSize: '0.95rem',
                              textTransform: 'none',
                              letterSpacing: '0.01em',
                              boxShadow: `0 8px 24px ${alpha(era.color, 0.5)}`,
                              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              '&:hover': {
                                bgcolor: alpha(era.color, 0.9),
                                transform: 'translateY(-2px)',
                                boxShadow: `0 12px 30px ${alpha(era.color, 0.65)}`,
                              },
                            }}
                          >
                            Start
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={applyFramework}
                            sx={{
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontWeight: 800,
                              px: 3.25,
                              py: 1.35,
                              borderRadius: '16px',
                              fontSize: '0.95rem',
                              textTransform: 'none',
                              letterSpacing: '0.01em',
                              backdropFilter: 'blur(10px)',
                              bgcolor: 'rgba(255, 255, 255, 0.05)',
                              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            Ignore
                          </Button>
                        </Box>
                      </Paper>
                    </Box>
                  );
                })()}
              </Box>
            )}
            
            {/* EDITABLE BUILDER STATE */}
            {frameworkLoaded && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Livestream Rundown
                  </Typography>
                  <Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '1.05rem' }}>
                    Drag your published articles and jobs into the canvas to build your presentation.
                  </Typography>
                </Box>
                <LivestreamRundownBuilder 
                  postingAs={postingAs}
                  selectedOrgId={selectedOrgId}
                  contentPool={contentPool}
                  guidingArticles={guidingArticles}
                  guidingJobs={guidingJobs}
                  guidingListings={guidingListings}
                  guidingCampaigns={guidingCampaigns}
                  hubColor={hubColor}
                  initialBlocks={rundownBlocks}
                  onBlocksChange={setRundownBlocks}
                />
              </Box>
            )}
          </Box>
        )}

        {step === 3 && (
          <Box sx={{ animation: 'fadeIn 0.3s', maxWidth: 840, mx: 'auto', width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Communications & Links
            </Typography>
            <Typography sx={{ color: '#475569', mb: 3.5, fontWeight: 500, fontSize: '1.05rem' }}>
              Configure your broadcasting links and set up automated messages for your guests and audience.
            </Typography>

            {/* ── BROADCAST CONFIRMATION TICKET (BOARDING PASS) ── */}
            <Box
              id="step3-broadcast-confirmation-card"
              sx={{
                width: '100%',
                mb: 4,
                perspective: '2000px',
                position: 'relative',
              }}
            >
              <motion.div
                animate={{ rotateY: isStep3ScheduleFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 24, mass: 0.8 }}
                style={{
                  width: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                }}
              >
                {/* ── TICKET FRONT: BROADCAST CONFIRMATION PASS ── */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '24px',
                    bgcolor: '#ffffff',
                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'stretch',
                    position: isStep3ScheduleFlipped ? 'absolute' : 'relative',
                    inset: isStep3ScheduleFlipped ? 0 : 'auto',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg) translateZ(1px)',
                    pointerEvents: isStep3ScheduleFlipped ? 'none' : 'auto',
                    overflow: 'hidden',
                  }}
                >
                  {/* Left: Main Ticket Pass */}
                  <Box
                    sx={{
                      flex: 1,
                      p: { xs: 2.5, sm: 3 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    {/* Ticket Header Row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TicketIcon sx={{ fontSize: 17, color: hubColor }} />
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            color: '#64748b',
                            textTransform: 'uppercase',
                          }}
                        >
                          Broadcast Pass · #{`FN-${(category || 'LIVE').toUpperCase()}-2026`}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={countdown?.isPast ? 'Broadcast Concluded' : 'Confirmed Schedule Slot'}
                        icon={
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: countdown?.isPast ? '#94a3b8' : '#10b981',
                              boxShadow: countdown?.isPast ? 'none' : '0 0 4px #10b981',
                              ml: '6px !important',
                            }}
                          />
                        }
                        sx={{
                          height: 22,
                          fontSize: '0.67rem',
                          fontWeight: 800,
                          bgcolor: countdown?.isPast ? 'rgba(148, 163, 184, 0.08)' : 'rgba(16, 185, 129, 0.06)',
                          color: countdown?.isPast ? '#64748b' : '#065f46',
                          border: `1px solid ${countdown?.isPast ? 'rgba(148, 163, 184, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                        }}
                      />
                    </Box>

                    {/* Middle Row: Big Date Stub + Details */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 2.5 } }}>
                      {/* Calendar Date Block */}
                      <Box
                        sx={{
                          width: { xs: 72, sm: 80 },
                          height: { xs: 80, sm: 88 },
                          borderRadius: '16px',
                          overflow: 'hidden',
                          bgcolor: '#ffffff',
                          border: '1px solid rgba(15, 23, 42, 0.08)',
                          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          flexShrink: 0,
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: alpha(hubColor, 0.08),
                            color: hubColor,
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            letterSpacing: '0.05em',
                            py: 0.35,
                          }}
                        >
                          {ticketMonth}
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: { xs: '1.75rem', sm: '2rem' },
                            fontWeight: 900,
                            color: '#0f172a',
                            lineHeight: 1,
                          }}
                        >
                          {ticketDayNumber}
                        </Box>
                        <Box
                          sx={{
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            color: '#64748b',
                            letterSpacing: '0.03em',
                            pb: 0.35,
                          }}
                        >
                          {ticketDayName}
                        </Box>
                      </Box>

                      {/* Title & Metadata */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: '#0f172a',
                            fontSize: { xs: '1rem', sm: '1.14rem' },
                            lineHeight: 1.25,
                            letterSpacing: '-0.015em',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {title || appliedBlueprint?.title || 'Your Scheduled Livestream Broadcast'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={appliedBlueprint?.format ? appliedBlueprint.format.replace('_', ' ').toUpperCase() : 'INDUSTRY TEARDOWN'}
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              bgcolor: alpha(hubColor, 0.08),
                              color: hubColor,
                              border: `1px solid ${alpha(hubColor, 0.15)}`,
                            }}
                          />
                          <Chip
                            size="small"
                            icon={<AccessTimeIcon sx={{ fontSize: '12px !important', color: '#475569 !important' }} />}
                            label={ticketTimeString}
                            sx={{
                              height: 20,
                              fontSize: '0.67rem',
                              fontWeight: 700,
                              bgcolor: 'rgba(15, 23, 42, 0.04)',
                              color: '#334155',
                              border: '1px solid rgba(15, 23, 42, 0.06)',
                            }}
                          />
                          <Chip
                            size="small"
                            label={`Hub: ${hubTitle}`}
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              bgcolor: 'transparent',
                              color: '#64748b',
                              border: '1px solid rgba(15, 23, 42, 0.08)',
                            }}
                          />
                          <Chip
                            size="small"
                            label={`${rundownBlocks.length || 15} Slides`}
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              bgcolor: 'rgba(16, 185, 129, 0.06)',
                              color: '#065f46',
                              border: '1px solid rgba(16, 185, 129, 0.18)',
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Bottom Ticket Strip */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid rgba(15, 23, 42, 0.06)', flexWrap: 'wrap', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.71rem', color: '#94a3b8', fontWeight: 500 }}>
                        Every {DAY_NAMES[CATEGORY_TO_DAY_MAP[category] || 1]} · Standard Format Studio Window · Verified
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', opacity: 0.35 }}>
                          {[2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2].map((w, i) => (
                            <Box key={i} sx={{ width: w, height: 10, bgcolor: '#0f172a' }} />
                          ))}
                        </Box>
                        <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                          STAGE ACCESS PASS
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Desktop Vertical Perforation Divider with Circular Notches */}
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      width: 0,
                      borderLeft: '1.5px dashed rgba(203, 213, 225, 0.8)',
                      position: 'relative',
                      alignSelf: 'stretch',
                      my: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -27,
                        left: -13,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#f8fafc',
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        zIndex: 4,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -27,
                        left: -13,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#f8fafc',
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        zIndex: 4,
                      }}
                    />
                  </Box>

                  {/* Mobile Horizontal Perforation Divider with Circular Notches */}
                  <Box
                    sx={{
                      display: { xs: 'block', md: 'none' },
                      height: 0,
                      borderTop: '1.5px dashed rgba(203, 213, 225, 0.8)',
                      position: 'relative',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -13,
                        top: -12,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#f8fafc',
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        zIndex: 4,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        right: -13,
                        top: -12,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#f8fafc',
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        zIndex: 4,
                      }}
                    />
                  </Box>

                  {/* Right: Ticket Stub (Countdown & Edit Action) */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: 270, lg: 290 },
                      bgcolor: 'rgba(248, 250, 252, 0.65)',
                      p: { xs: 2.5, sm: 3 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: 1.75,
                      flexShrink: 0,
                    }}
                  >
                    {/* Countdown Title */}
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
                      <Box component="span" sx={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444' }} />
                      Goes Live In
                    </Typography>

                    {/* Live Digital Countdown Timer */}
                    {countdown && !countdown.isPast ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', px: 0.9, py: 0.5, minWidth: 38 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#dc2626', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.days).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.56rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', mt: 0.2 }}>days</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: 'rgba(239, 68, 68, 0.5)', fontSize: '1rem', mb: 0.75 }}>:</Typography>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', px: 0.9, py: 0.5, minWidth: 38 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#dc2626', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.hours).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.56rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', mt: 0.2 }}>hrs</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: 'rgba(239, 68, 68, 0.5)', fontSize: '1rem', mb: 0.75 }}>:</Typography>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', px: 0.9, py: 0.5, minWidth: 38 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#dc2626', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.minutes).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.56rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', mt: 0.2 }}>mins</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: 'rgba(239, 68, 68, 0.5)', fontSize: '1rem', mb: 0.75 }}>:</Typography>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.22)', borderRadius: '8px', px: 0.9, py: 0.5, minWidth: 38 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#ef4444', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.seconds).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.56rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', mt: 0.2 }}>secs</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Chip
                        label="Broadcast Time Concluded"
                        size="small"
                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)', color: '#b45309', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}
                      />
                    )}

                    {/* Edit Ticket Button */}
                    <Button
                      variant="contained"
                      onClick={() => setIsStep3ScheduleFlipped(true)}
                      startIcon={<EditIcon sx={{ fontSize: '13px !important' }} />}
                      sx={{
                        background: '#0f172a',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        px: 2.8,
                        py: 0.75,
                        borderRadius: '999px',
                        textTransform: 'none',
                        letterSpacing: '0.01em',
                        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.12)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: '#020617',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
                        },
                      }}
                    >
                      Change Date & Time
                    </Button>

                    <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
                      Flip to adjust broadcast timing
                    </Typography>
                  </Box>
                </Paper>

                {/* ── TICKET BACK: BROADCAST SCHEDULE & TIMING EDITOR ── */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '24px',
                    p: { xs: 2.5, sm: 3.5 },
                    bgcolor: '#ffffff',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    position: isStep3ScheduleFlipped ? 'relative' : 'absolute',
                    inset: isStep3ScheduleFlipped ? 'auto' : 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(1px)',
                    pointerEvents: isStep3ScheduleFlipped ? 'auto' : 'none',
                  }}
                >
                  {/* Top Bar on Back of Card */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid rgba(15, 23, 42, 0.06)', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          bgcolor: alpha(hubColor, 0.08),
                          border: `1px solid ${alpha(hubColor, 0.15)}`,
                          color: hubColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                        }}
                      >
                        📅
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                          Adjust Broadcast Timing
                        </Typography>
                        <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500 }}>
                          Format Slot: Every {DAY_NAMES[CATEGORY_TO_DAY_MAP[category] || 1]} · 10:00 AM WAT
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      onClick={() => setIsStep3ScheduleFlipped(false)}
                      startIcon={<CheckIcon sx={{ fontSize: 15 }} />}
                      sx={{
                        color: '#0f172a',
                        bgcolor: 'rgba(15, 23, 42, 0.04)',
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        borderRadius: '999px',
                        px: 2.2,
                        py: 0.5,
                        textTransform: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(15, 23, 42, 0.08)',
                          transform: 'translateX(1px)',
                        },
                      }}
                    >
                      Done & View Ticket
                    </Button>
                  </Box>

                  {/* Event Date & Time Pickers */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <PremiumDatePicker
                      fullWidth
                      label="Broadcast Date"
                      value={eventDatePart}
                      onChange={(e) => handleDateChange(e.target.value)}
                      colorTheme={hubColor}
                      minDate={new Date()}
                    />
                    <PremiumTimePicker
                      fullWidth
                      label="Broadcast Time"
                      value={eventTimePart}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      colorTheme={hubColor}
                    />
                  </Box>

                  {/* Actions Footer on Back of Card */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid rgba(15, 23, 42, 0.06)', flexWrap: 'wrap', gap: 1.5 }}>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        const slotDate = getNextSlotForCategory(category, 10, 0);
                        const year = slotDate.getFullYear();
                        const month = String(slotDate.getMonth() + 1).padStart(2, '0');
                        const day = String(slotDate.getDate()).padStart(2, '0');
                        const hours = String(slotDate.getHours()).padStart(2, '0');
                        const mins = String(slotDate.getMinutes()).padStart(2, '0');
                        setEventDate(`${year}-${month}-${day}T${hours}:${mins}:00`);
                      }}
                      startIcon={<BoltIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        color: hubColor,
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 1.25,
                        '&:hover': { bgcolor: alpha(hubColor, 0.06) },
                      }}
                    >
                      Reset to Standard {DAY_NAMES[CATEGORY_TO_DAY_MAP[category] || 1]} (10 AM)
                    </Button>

                    <Button
                      variant="contained"
                      onClick={() => setIsStep3ScheduleFlipped(false)}
                      sx={{
                        bgcolor: '#0f172a',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        px: 3,
                        py: 0.75,
                        borderRadius: '999px',
                        textTransform: 'none',
                        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.14)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#020617',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      Save & View Confirmation
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Broadcast Stage Media & Cover Canvas */}
              <Box
                id="broadcast-cover-card"
                ref={coverCardRef}
                sx={{
                  p: { xs: 2.5, sm: 3.5, md: 4 },
                  borderRadius: '24px',
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                {/* Hidden File Input for Direct Tapping */}
                <input
                  type="file"
                  ref={coverFileInputRef}
                  hidden
                  accept="image/*"
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = '';
                  }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) setCoverImage(e.target.files[0]);
                  }}
                />

                {/* 16:9 Cinema Stage Canvas */}
                <Box
                  onClick={() => setIsCoverPreviewOpen(true)}
                  title="Click to view fullscreen preview"
                  sx={{
                    width: '100%',
                    aspectRatio: { xs: '16/10', sm: '16/9' },
                    minHeight: { xs: 220, sm: 300, md: 360 },
                    maxHeight: 460,
                    borderRadius: '22px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: '#0f172a',
                    backgroundImage: `url(${activeCoverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 20px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.45), 0 0 0 1.5px rgba(255, 255, 255, 0.3) inset',
                    },
                  }}
                >
                  {/* Subtle Cinematic Vignette Scrim */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.15) 50%, rgba(15, 23, 42, 0.55) 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Top Right Stage Controls: Reset and Fullscreen Icon Buttons */}
                  <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      position: 'absolute',
                      top: { xs: 12, sm: 16 },
                      right: { xs: 12, sm: 16 },
                      zIndex: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {coverImage ? (
                      <Tooltip title="Reset to default cover">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImage(null);
                            if (coverFileInputRef.current) {
                              coverFileInputRef.current.value = '';
                            }
                          }}
                          aria-label="Reset cover to default"
                          sx={{
                            bgcolor: 'rgba(15, 23, 42, 0.75)',
                            backdropFilter: 'blur(12px)',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                            p: 0.9,
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.22)',
                              borderColor: 'rgba(255, 255, 255, 0.4)',
                              color: '#ffffff',
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <RestartAltIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Default cover active">
                        <span style={{ display: 'inline-flex' }} onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            size="small"
                            disabled
                            aria-label="Default cover active"
                            sx={{
                              bgcolor: 'rgba(15, 23, 42, 0.5)',
                              backdropFilter: 'blur(12px)',
                              color: 'rgba(255, 255, 255, 0.35) !important',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                              p: 0.9,
                              cursor: 'not-allowed',
                            }}
                          >
                            <RestartAltIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    <Tooltip title="View fullscreen">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCoverPreviewOpen(true);
                        }}
                        aria-label="View fullscreen preview"
                        sx={{
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(12px)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                          p: 0.9,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderColor: 'rgba(255, 255, 255, 0.35)',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <FullscreenIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Bottom Minimal Info Overlay: Corridor & Title */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: { xs: 14, sm: 20 },
                      left: { xs: 14, sm: 22 },
                      right: { xs: 14, sm: 22 },
                      zIndex: 2,
                      pointerEvents: 'none',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: alpha('#ffffff', 0.8),
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        mb: 0.5,
                      }}
                    >
                      {CORRIDOR_PRESETS.find(p => p.key === category)?.name || hubTitle}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 900,
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.25,
                        fontSize: { xs: '1.15rem', sm: '1.45rem', md: '1.65rem' },
                        textShadow: '0 2px 14px rgba(0, 0, 0, 0.85)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {title.trim() || 'Untitled Broadcast Stage'}
                    </Typography>
                  </Box>
                </Box>

                {/* Centered Action Buttons Toolbar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    pt: 0.5,
                  }}
                >
                  {/* 1. Upload Image (Actual Button) */}
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => coverFileInputRef.current?.click()}
                    startIcon={<PhotoCameraIcon sx={{ fontSize: '18px !important' }} />}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 750,
                      fontSize: '0.84rem',
                      borderColor: '#cbd5e1',
                      color: '#334155',
                      bgcolor: '#ffffff',
                      px: 2.25,
                      py: 0.85,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      '&:hover': {
                        borderColor: '#94a3b8',
                        bgcolor: '#f8fafc',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Upload Image
                  </Button>

                  {/* 2. AI Generate Thumbnail (Actual Button with Sidepane Drawer Trigger) */}
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={() => setIsThumbnailDrawerOpen(true)}
                    startIcon={<SparkleIcon sx={{ fontSize: '18px !important', color: '#ffffff !important' }} />}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                      color: '#ffffff',
                      px: 2.5,
                      py: 0.85,
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)',
                        boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                        transform: 'translateY(-1.5px)',
                      },
                    }}
                  >
                    AI Generate Thumbnail
                  </Button>
                </Box>
              </Box>

              {/* Fullscreen Stage Cover Lightbox Dialog */}
              <Dialog
                open={isCoverPreviewOpen}
                onClose={() => setIsCoverPreviewOpen(false)}
                maxWidth="md"
                fullWidth
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '24px',
                      bgcolor: '#0f172a',
                      p: 0,
                      overflow: 'hidden',
                      border: '1.5px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8)',
                    },
                  },
                }}
              >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '16/9',
                      backgroundImage: `url(${activeCoverUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.2) 50%, rgba(15, 23, 42, 0.7) 100%)',
                      }}
                    />
                    <IconButton
                      onClick={() => setIsCoverPreviewOpen(false)}
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: '#fff',
                        bgcolor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.95)' },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>

                    <Box sx={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Chip
                          label={appliedBlueprint?.typeTitle || 'Agribusiness Broadcast'}
                          size="small"
                          sx={{ bgcolor: hubColor, color: '#fff', fontWeight: 900 }}
                        />
                        <Chip
                          label={`${ticketMonth} ${ticketDayNumber} · ${ticketTimeString}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 800 }}
                        />
                      </Box>
                      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 1, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>
                        {title.trim() || 'Untitled Broadcast'}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', maxWidth: 650 }}>
                        {description.trim() || 'Executive corridor intelligence session broadcasting across the FoodNerve network.'}
                      </Typography>
                    </Box>
                  </Box>
                </DialogContent>
              </Dialog>

              {/* The Backstage (Guests) Card */}
              <Box
                id="broadcast-guest-card"
                sx={{
                  p: { xs: 2.5, sm: 3.5, md: 4 },
                  borderRadius: '24px',
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: '1.2rem' }}>🎙️</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                        The Backstage (Guests)
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                        Private greenroom & studio link for co-hosts, speakers, and moderators with automated onboarding copy
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status Chip */}
                  <Chip
                    size="small"
                    label={guestStudioUrl.trim() ? 'Backstage Ready' : 'Required to Publish'}
                    icon={
                      guestStudioUrl.trim() ? (
                        <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />
                      ) : (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: '#ef4444',
                            ml: '6px !important',
                          }}
                        />
                      )
                    }
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      bgcolor: guestStudioUrl.trim() ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                      color: guestStudioUrl.trim() ? '#065f46' : '#b91c1c',
                      border: `1px solid ${guestStudioUrl.trim() ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    }}
                  />
                </Box>

                {/* Form Fields */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Guest Studio Link <span style={{ color: '#ef4444' }}>*</span>
                      </Typography>
                      {guestStudioUrl.trim() && (
                        <Button
                          component="a"
                          href={guestStudioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#6366f1',
                            p: 0,
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                          }}
                        >
                          Test Studio Room
                        </Button>
                      )}
                    </Box>
                    <PremiumTextField
                      fullWidth
                      label="Guest Studio Link (Required to publish)"
                      placeholder="e.g. https://meet.google.com/xyz or https://streamyard.com/abc"
                      value={guestStudioUrl}
                      onChange={(e) => updateGuestStudioUrl(e.target.value)}
                      errorHelperText={
                        !guestStudioUrl.trim() && actionItems.some((i) => i.id === 'guestStudioUrl')
                          ? 'Required: internal participation link for you and guests.'
                          : null
                      }
                      helperText={
                        linksPrefilledFromMemory
                          ? 'Pre-filled from your previous livestream — edit anytime'
                          : 'Private backstage room invite for speakers and presenters.'
                      }
                      colorTheme="#6366f1"
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75 }}>
                      Automated Message to Guests
                    </Typography>
                    <PremiumTextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Message to Guests"
                      placeholder="e.g. Join 15 minutes early to test microphones, camera angles, and review the DEF sequence."
                      value={guestMessageText}
                      onChange={(e) => setGuestMessageText(e.target.value)}
                      helperText="Automatically included in guest onboarding notifications and calendar calendar notes."
                      colorTheme="#6366f1"
                    />
                  </Box>

                  {/* ── Co-Host & Speaker Invitation Module ── */}
                  <Divider sx={{ my: 0.5, borderColor: 'rgba(15, 23, 42, 0.06)' }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            🎙️ Invited Co-Hosts & Speakers ({collaborators.length})
                          </Typography>
                          {collaborators.length > 0 && (
                            <Chip
                              size="small"
                              label={`${collaborators.filter(c => c.status === 'accepted' || c.status === 'confirmed').length} Confirmed`}
                              sx={{ height: 18, fontSize: '0.66rem', fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                            />
                          )}
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                          Add co-hosts, guest panelists, moderators, or presenters. They immediately receive an official invitation email with greenroom details.
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={async () => {
                          if (!currentDraftId) {
                            await handleSave(false, { isAutoSave: true });
                          }
                          setIsCoHostModalOpen(true);
                        }}
                        startIcon={<PeopleIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          borderRadius: '10px',
                          borderColor: 'rgba(15, 23, 42, 0.14)',
                          color: '#0f172a',
                          px: 1.75,
                          py: 0.5,
                          '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.04)', borderColor: '#0f172a' },
                        }}
                      >
                        Browse Society Directory
                      </Button>
                    </Box>

                    {coHostNotification && (
                      <Alert
                        severity={coHostNotification.type}
                        onClose={() => setCoHostNotification(null)}
                        sx={{ borderRadius: '12px', fontSize: '0.82rem', py: 0.5 }}
                      >
                        {coHostNotification.message}
                      </Alert>
                    )}

                    {/* Quick Inline Email Adder (Unified Glass Pill Container) */}
                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 0.85 },
                        pl: { sm: 2.25 },
                        borderRadius: { xs: '18px', sm: '999px' },
                        bgcolor: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1.25, sm: 1 },
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ flex: 1.6, width: { xs: '100%', sm: 'auto' } }}>
                        <InputBase
                          fullWidth
                          placeholder="Enter co-host email (e.g. speaker@agribusiness.org)"
                          value={inlineEmail}
                          onChange={(e) => setInlineEmail(e.target.value)}
                          sx={{
                            fontSize: '0.84rem',
                            fontWeight: 500,
                            color: '#0f172a',
                            px: { xs: 1, sm: 0 },
                            '& input::placeholder': {
                              color: '#94a3b8',
                              opacity: 1,
                            },
                          }}
                        />
                      </Box>

                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                          display: { xs: 'none', sm: 'block' },
                          height: 22,
                          my: 'auto',
                          borderColor: 'rgba(15, 23, 42, 0.08)',
                        }}
                      />

                      <Box sx={{ minWidth: { xs: '100%', sm: 175 }, flexShrink: 0 }}>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={inlineRole}
                            onChange={(e) => setInlineRole(e.target.value as any)}
                            variant="standard"
                            disableUnderline
                            sx={{
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: '#334155',
                              px: { xs: 1, sm: 0.5 },
                              '& .MuiSelect-select': {
                                py: 0.4,
                                pr: '24px !important',
                              },
                            }}
                          >
                            <MenuItem value="Co-Host">Role: Co-Host</MenuItem>
                            <MenuItem value="Guest Panelist">Role: Guest Panelist</MenuItem>
                            <MenuItem value="Moderator">Role: Moderator</MenuItem>
                            <MenuItem value="Technical Presenter">Role: Tech Presenter</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Button
                        variant="contained"
                        onClick={handleAddInlineCoHost}
                        disabled={invitingCoHost || !inlineEmail.trim()}
                        startIcon={
                          invitingCoHost ? (
                            <CircularProgress size={14} sx={{ color: '#fff' }} />
                          ) : (
                            <PersonAddIcon sx={{ fontSize: '14px !important' }} />
                          )
                        }
                        sx={{
                          bgcolor: '#0f172a',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRadius: '999px',
                          textTransform: 'none',
                          px: 2.4,
                          py: 0.85,
                          flexShrink: 0,
                          width: { xs: '100%', sm: 'auto' },
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#020617', boxShadow: 'none' },
                        }}
                      >
                        {invitingCoHost ? 'Inviting...' : 'Invite Co-Host'}
                      </Button>
                    </Box>

                    {/* Live Invited Co-Host Roster */}
                    {collaborators.length === 0 ? (
                      <Box
                        sx={{
                          py: 2.5,
                          px: 3,
                          borderRadius: '16px',
                          bgcolor: 'rgba(15, 23, 42, 0.02)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(15, 23, 42, 0.05)',
                          textAlign: 'center',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                          No co-hosts or speakers invited yet. Use the field above to invite collaborators or browse the Society Directory.
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                        {collaborators.map((c, idx) => {
                          const isConfirmed = c.status === 'accepted' || c.status === 'confirmed';
                          const isDeclined = c.status === 'declined';
                          return (
                            <Box
                              key={c.email || c.uid || idx}
                              sx={{
                                p: 1.75,
                                borderRadius: '16px',
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(15, 23, 42, 0.08)',
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1.5,
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                '&:hover': {
                                  borderColor: 'rgba(15, 23, 42, 0.16)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.04)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                                <Avatar
                                  src={c.avatarUrl}
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    bgcolor: isConfirmed ? '#10b981' : (isDeclined ? '#ef4444' : '#6366f1'),
                                    color: '#fff',
                                    flexShrink: 0,
                                    border: `1.5px solid ${isConfirmed ? 'rgba(16, 185, 129, 0.3)' : (isDeclined ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)')}`,
                                  }}
                                >
                                  {c.name?.charAt(0)?.toUpperCase() || c.email?.charAt(0)?.toUpperCase() || 'C'}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                                    <Typography
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: '0.84rem',
                                        color: '#0f172a',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {c.name || c.email?.split('@')[0]}
                                    </Typography>
                                    <Box
                                      sx={{
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        bgcolor: 'rgba(15, 23, 42, 0.04)',
                                        color: '#475569',
                                        px: 0.75,
                                        py: 0.2,
                                        borderRadius: '999px',
                                        border: '1px solid rgba(15, 23, 42, 0.06)',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {c.role || 'Co-Host'}
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap', overflow: 'hidden' }}>
                                    <Typography
                                      sx={{
                                        fontSize: '0.72rem',
                                        color: '#64748b',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {c.email}
                                    </Typography>
                                    <Box sx={{ flexShrink: 0 }}>
                                      {isConfirmed ? (
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.66rem', fontWeight: 700, color: '#059669', bgcolor: 'rgba(16, 185, 129, 0.08)', px: 0.75, py: 0.15, borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#10b981' }} />
                                          Confirmed
                                        </Box>
                                      ) : isDeclined ? (
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.66rem', fontWeight: 700, color: '#e11d48', bgcolor: 'rgba(239, 68, 68, 0.08)', px: 0.75, py: 0.15, borderRadius: '999px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#f43f5e' }} />
                                          Declined
                                        </Box>
                                      ) : (
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.66rem', fontWeight: 700, color: '#d97706', bgcolor: 'rgba(245, 158, 11, 0.08)', px: 0.75, py: 0.15, borderRadius: '999px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                                          Invited
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>

                              {/* Actions */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                                <Tooltip title="Resend Invitation Email">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleResendCoHostInvite(c)}
                                    sx={{
                                      color: '#64748b',
                                      p: 0.75,
                                      opacity: 0.75,
                                      transition: 'all 0.15s ease',
                                      '&:hover': { color: '#4f46e5', bgcolor: 'rgba(79, 70, 229, 0.06)', opacity: 1, transform: 'scale(1.05)' },
                                    }}
                                  >
                                    <SendIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove Co-Host">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveCoHost(idx)}
                                    sx={{
                                      color: '#94a3b8',
                                      p: 0.75,
                                      opacity: 0.75,
                                      transition: 'all 0.15s ease',
                                      '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.06)', opacity: 1, transform: 'scale(1.05)' },
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* The Stage (Audience) Card */}
              <Box
                id="broadcast-stream-card"
                sx={{
                  p: { xs: 2.5, sm: 3.5, md: 4 },
                  borderRadius: '24px',
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: '1.2rem' }}>📺</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                        The Stage (Audience)
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                        Public live-stream destination where registered viewers and community members watch the broadcast
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status Chip */}
                  <Chip
                    size="small"
                    label={streamUrl.trim() ? 'Public Stage Ready' : 'Required to Publish'}
                    icon={
                      streamUrl.trim() ? (
                        <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />
                      ) : (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: '#ef4444',
                            ml: '6px !important',
                          }}
                        />
                      )
                    }
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      bgcolor: streamUrl.trim() ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                      color: streamUrl.trim() ? '#065f46' : '#b91c1c',
                      border: `1px solid ${streamUrl.trim() ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    }}
                  />
                </Box>

                {/* Form Fields */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Public Stream Link <span style={{ color: '#ef4444' }}>*</span>
                      </Typography>
                      {streamUrl.trim() && (
                        <Button
                          component="a"
                          href={streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#10b981',
                            p: 0,
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                          }}
                        >
                          Test Public Stream
                        </Button>
                      )}
                    </Box>
                    <PremiumTextField
                      fullWidth
                      label="Public Stream Link (Required to publish)"
                      placeholder="e.g. https://youtube.com/live/... or https://twitch.tv/..."
                      value={streamUrl}
                      onChange={(e) => updateStreamUrl(e.target.value)}
                      errorHelperText={
                        !streamUrl.trim() && actionItems.some((i) => i.id === 'streamUrl')
                          ? 'Required: link where audience watches the live broadcast.'
                          : null
                      }
                      helperText={
                        linksPrefilledFromMemory
                          ? 'Pre-filled from your previous livestream — edit anytime'
                          : 'Destination URL where community members watch the live stream.'
                      }
                      colorTheme="#10b981"
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75 }}>
                      RSVP Confirmation & Calendar Message
                    </Typography>
                    <PremiumTextField
                      fullWidth
                      multiline
                      rows={3}
                      label="RSVP Confirmation Message"
                      placeholder="e.g. Thank you for registering! Add this session to your calendar and review the attached field dossier before we go live."
                      value={audienceMessageText}
                      onChange={(e) => setAudienceMessageText(e.target.value)}
                      helperText="Delivered to community members upon RSVP and embedded in the event calendar listing."
                      colorTheme="#10b981"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* FIXED BOTTOM ACTION BAR */}
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        p: { xs: 2, md: 3 }, px: { md: 4 },
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.03)'
      }}>
        {/* Left Side: Navigation & Progress */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else onCancel?.();
            }}
            sx={{ color: '#475569', fontWeight: 700, borderRadius: '12px', px: 2 }}
          >
            {step > 1 ? (step === 3 ? 'Back to Rundown' : 'Back to Details') : 'Cancel'}
          </Button>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {[1, 2, 3].map((s) => (
              <Box key={s} sx={{
                width: s === step ? 32 : 12, height: 5, borderRadius: 3,
                bgcolor: s === step ? hubColor : (s < step ? '#10b981' : 'rgba(0,0,0,0.12)'),
                transition: 'all 0.3s ease'
              }} />
            ))}
          </Box>
        </Box>

        {/* Right Side: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAutosaving ? (
            <Chip
              size="small"
              icon={<CircularProgress size={12} sx={{ color: '#d97706' }} />}
              label="Autosaving..."
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.1)',
                color: '#b45309',
                fontWeight: 800,
                fontSize: '0.78rem',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            />
          ) : lastAutosavedAt && !saveStatusMsg ? (
            <Chip
              size="small"
              icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: '#10b981' }} />}
              label={`Saved ${lastAutosavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
              sx={{
                bgcolor: 'rgba(16,185,129,0.1)',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '0.78rem',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            />
          ) : null}
          {saveStatusMsg && (
            <Chip
              size="small"
              icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: '#10b981' }} />}
              label={saveStatusMsg}
              sx={{
                bgcolor: 'rgba(16,185,129,0.1)',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '0.78rem',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            />
          )}
          {saveErrorMsg && (
            <Chip
              size="small"
              label={saveErrorMsg}
              color="error"
              sx={{ fontWeight: 700, fontSize: '0.78rem' }}
            />
          )}

          <Button 
            variant="outlined" 
            onClick={() => handleSave(false)} 
            disabled={isSubmitting || isAutosaving}
            sx={{ 
              borderRadius: '14px', fontWeight: 700, px: 3,
              borderColor: 'rgba(15,23,42,0.2)', color: '#0f172a',
              '&:hover': { borderColor: '#0f172a', bgcolor: 'rgba(15,23,42,0.02)' }
            }}
          >
            Save Draft
          </Button>

          <Button
            variant="outlined"
            onClick={() => setIsPreviewModalOpen(true)}
            startIcon={<LiveTvIcon sx={{ fontSize: '1.15rem !important', color: '#ef4444' }} />}
            sx={{
              borderRadius: '14px',
              fontWeight: 800,
              px: 3,
              py: 1,
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#0f172a',
              bgcolor: 'rgba(239, 68, 68, 0.04)',
              textTransform: 'none',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: 'rgba(239, 68, 68, 0.09)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Livestream Preview
          </Button>
          
          {step < 3 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Button 
                variant="contained" 
                onClick={() => {
                  if (step === 1 && !canAdvanceStep1) return;
                  if (step === 1) {
                    handleAdvanceFromStep1();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={step === 1 && !canAdvanceStep1}
                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                sx={{ 
                  borderRadius: '14px', 
                  fontWeight: 900, 
                  px: 4, 
                  py: 1.25,
                  background: (step === 1 && !canAdvanceStep1)
                    ? 'rgba(15,23,42,0.12)'
                    : `linear-gradient(135deg, ${hubColor} 0%, ${alpha(hubColor, 0.88)} 100%)`,
                  color: (step === 1 && !canAdvanceStep1)
                    ? 'rgba(15,23,42,0.38)'
                    : '#ffffff',
                  boxShadow: (step === 1 && !canAdvanceStep1)
                    ? 'none'
                    : `0 8px 24px ${alpha(hubColor, 0.4)}`,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  letterSpacing: '-0.01em',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    background: `linear-gradient(135deg, ${hubColor} 0%, ${hubColor} 100%)`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 10px 28px ${alpha(hubColor, 0.5)}`
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(15,23,42,0.12)',
                    color: 'rgba(15,23,42,0.38)',
                    boxShadow: 'none'
                  }
                }}
              >
                Next Step
              </Button>
              {step === 1 && !canAdvanceStep1 && (
                <Typography sx={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 700, mr: 0.5 }}>
                  {!title.trim() ? 'Livestream title required' : 'Event date & time required'}
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Button 
                variant="contained" 
                onClick={() => handleSave(true)}
                disabled={!canPublish || isSubmitting}
                sx={{ 
                  borderRadius: '14px', 
                  fontWeight: 900, 
                  px: 4, 
                  py: 1.25,
                  background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  letterSpacing: '-0.01em',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    background: `linear-gradient(135deg, #059669 0%, #047857 100%)`,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 28px rgba(16,185,129,0.45)'
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(15,23,42,0.12)',
                    color: 'rgba(15,23,42,0.38)',
                    boxShadow: 'none'
                  }
                }}
              >
                Schedule & Publish
              </Button>
              {!canPublish && (
                <Typography sx={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 700, mr: 0.5 }}>
                  {!title.trim() ? 'Livestream title required' :
                   (!eventDatePart || !eventTimePart) ? 'Event date & time required' :
                   rundownBlocks.length === 0 ? 'Broadcast slides required' :
                   (!guestStudioUrl.trim() || !streamUrl.trim()) ? 'Both Guest & Public stream links required' :
                   'Complete required fields to publish'}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>

      
      {/* ── BROADCAST SCREEN SIMULATOR MODAL ── */}
      <LivestreamScreenPreviewModal
        open={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={title}
        category={category}
        hubTitle={hubTitle}
        hubColor={hubColor}
        hostName={profile?.displayName || (profile as any)?.handle || 'Broadcast Host'}
        hostAvatar={profile?.avatarUrl || ''}
        rundownBlocks={rundownBlocks}
        streamUrl={streamUrl}
        eventDate={eventDate}
      />

      {/* ── LIVESTREAM AI IDEAS SLIDE-OVER DRAWER ── */}
      <LivestreamIdeasSidePane
        open={isIdeasDrawerOpen}
        onClose={() => setIsIdeasDrawerOpen(false)}
        onOpen={() => setIsIdeasDrawerOpen(true)}
        hubTitle={hubTitle}
        hubColor={hubColor}
        currentCategory={category}
        currentTimeframe={timeframe as any}
        guidingArticles={guidingArticles}
        guidingJobs={guidingJobs}
        guidingListings={guidingListings}
        guidingCampaigns={guidingCampaigns}
        onApplyIdea={(idea) => {
          handleSelectBlueprint(idea.blueprint || idea, false);
        }}
        onIngestBlueprints={(blueprints) => {
          setIngestedBlueprints(blueprints);
          const target = appliedBlueprint?.title?.trim().toLowerCase();
          const matchedIdx = target ? blueprints.findIndex((b: any) => b.title?.trim().toLowerCase() === target) : -1;
          setDeckActiveIndex(matchedIdx >= 0 ? matchedIdx : 0);
          if (matchedIdx >= 0 && target) {
            lastAlignedBlueprintRef.current = target;
          }
          setIsCardFlipped(false);
          setIsIdeasCardFlipped(false);
          setIsIdeasDrawerOpen(false);
          setStep(1);
          setTimeout(() => {
            carouselRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        }}
      />

      {/* ── BROADCAST SLIDE DRAFTING & SCRIPTING SIDE PANE (PHASE 2) ── */}
      <LivestreamSlideDraftingSidePane
        open={isDraftingDrawerOpen}
        onClose={() => setIsDraftingDrawerOpen(false)}
        onOpen={() => setIsDraftingDrawerOpen(true)}
        draftId={currentDraftId}
        title={title}
        description={description}
        category={category}
        subcategory={subcategory}
        timeframe={timeframe as any}
        format={resolvedFormat}
        hubTitle={hubTitle}
        hubColor={hubColor}
        appliedBlueprint={appliedBlueprint}
        guidingArticles={guidingArticles}
        guidingJobs={guidingJobs}
        guidingListings={guidingListings}
        guidingCampaigns={guidingCampaigns}
        onIngestSlides={(slides) => {
          setRundownBlocks(slides);
          setFrameworkLoaded(true);
          setIsDraftingDrawerOpen(false);
          setTimeout(() => {
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }, 150);
        }}
        onUpdateTitle={(newTitle) => setTitle(newTitle)}
        onUpdateDescription={(newDesc) => setDescription(newDesc)}
      />

      {/* ── BROADCAST 16:9 THUMBNAIL & COVER GENERATOR SIDE PANE ── */}
      <LivestreamThumbnailGeneratorSidePane
        open={isThumbnailDrawerOpen}
        onClose={() => setIsThumbnailDrawerOpen(false)}
        onOpen={() => setIsThumbnailDrawerOpen(true)}
        title={title}
        category={category}
        subcategory={subcategory}
        format={resolvedFormat}
        timeframe={timeframe as any}
        hubTitle={hubTitle}
        hubColor={hubColor}
        currentCoverUrl={activeCoverUrl}
        onApplyThumbnail={(thumb) => {
          setCoverImage(thumb);
        }}
      />
      {/* ── BROADCAST CO-HOST & SPEAKER DIRECTORY MODAL ── */}
      <CoAuthorModal
        open={isCoHostModalOpen}
        onClose={() => setIsCoHostModalOpen(false)}
        draftId={currentDraftId}
        articleTitle={title}
        collaborators={collaborators}
        onUpdateCollaborators={setCollaborators}
        currentUserId={profile?.uid}
        currentUserName={profile?.displayName || profile?.firstName || 'Broadcast Host'}
        themeColor="#6366f1"
        tenant={tenant}
        contentCategory="livestream"
      />
    </Box>
  );
}
