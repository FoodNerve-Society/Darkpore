'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Chip, IconButton, Alert, Paper, useTheme, useMediaQuery } from '@mui/material';
import { ArrowBack as ArrowBackIcon, LiveTv as LiveTvIcon, CheckCircle as CheckCircleIcon, Article as ArticleIcon, AutoAwesome as SparkleIcon, Image as ImageIcon, Check as CheckIcon, Info as InfoIcon, ArrowForward as ArrowForwardIcon, Close as CloseIcon, Bolt as BoltIcon, CalendarMonth as CalendarMonthIcon, Edit as EditIcon, AccessTime as AccessTimeIcon, ConfirmationNumber as TicketIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { fetchLivestreamContentPool, createLearnContent } from '@/lib/actions/learn';
import LivestreamRundownBuilder from './livestream/LivestreamRundownBuilder';
import { DEF_BLOCK_DEFINITIONS, LIVESTREAM_TYPE_FLOWS } from './livestream/defBlocksConfig';
import LivestreamIdeasSidePane, { LivestreamIdeaOption } from './livestream/LivestreamIdeasSidePane';
import LivestreamSlideDraftingSidePane from './livestream/LivestreamSlideDraftingSidePane';
import LivestreamScreenPreviewModal from './livestream/LivestreamScreenPreviewModal';
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

export function getNextSlotForCategory(categorySlug: string, defaultHour = 10, defaultMinute = 0): Date {
  const normKey = (categorySlug || 'capital').toLowerCase().trim();
  const targetDay = CATEGORY_TO_DAY_MAP[normKey] !== undefined ? CATEGORY_TO_DAY_MAP[normKey] : 1;
  const now = new Date();
  const currentDay = now.getDay();

  let daysToAdd = (targetDay - currentDay + 7) % 7;
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

export default function CreateLivestreamForm({ 
  onSuccess, 
  onCancel,
  postingAs = 'personal',
  selectedOrgId = null,
  draftId = null,
  initialTaxonomy = null,
  initialDraftData = null
}: any) {
  const router = useRouter();
  const { profile } = useSociety();
  const { uploadFile, uploading } = useStorageUpload();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentPool, setContentPool] = useState<{ articles: any[], jobs: any[] } | null>(null);

  // Ideation Assistant & Studio Slideshow State
  const [isIdeasDrawerOpen, setIsIdeasDrawerOpen] = useState(false);
  const [isDraftingDrawerOpen, setIsDraftingDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [ingestedBlueprints, setIngestedBlueprints] = useState<LivestreamIdeaOption[]>([]);
  const [deckActiveIndex, setDeckActiveIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isIdeasCardFlipped, setIsIdeasCardFlipped] = useState(false);
  const [isScheduleFlipped, setIsScheduleFlipped] = useState(false);
  const [appliedBlueprint, setAppliedBlueprint] = useState<any>(initialDraftData?.livestream?.blueprint || null);
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

  // Hub & Context from Studio Handoff
  const hubTitle = initialTaxonomy?.hubTitle || initialDraftData?.livestream?.hub?.title || 'Production & Capital';
  const hubColor = initialTaxonomy?.hubColor || initialDraftData?.livestream?.hub?.color || '#10b981';
  const guidingArticles = useMemo(() => {
    const list = [...(initialDraftData?.anchorArticles || initialDraftData?.livestream?.anchorArticles || [])];
    if (initialDraftData?.type === 'article' && initialDraftData.id && !list.some((a: any) => a.id === initialDraftData.id)) {
      list.unshift(initialDraftData);
    }
    return list;
  }, [initialDraftData]);
  const guidingJobs = initialDraftData?.livestream?.ctaJobs || [];
  const guidingListings = initialDraftData?.livestream?.ctaListings || [];
  const guidingCampaigns = initialDraftData?.livestream?.ctaCampaigns || [];

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

  // Form State: Do NOT auto-select title or description from an article handoff!
  const isActualLivestreamDraft = initialDraftData?.type === 'livestream';
  const [title, setTitle] = useState(isActualLivestreamDraft ? (initialDraftData?.title || '') : '');
  const [description, setDescription] = useState(isActualLivestreamDraft ? (initialDraftData?.description || '') : '');
  const [coverImage, setCoverImage] = useState<File | string | null>(initialDraftData?.coverImageUrl || null);
  const [streamUrl, setStreamUrl] = useState(initialDraftData?.livestream?.streamUrl || '');
  const [eventDate, setEventDate] = useState<string>(() => {
    if (initialDraftData?.livestream?.eventDate) {
      return new Date(initialDraftData.livestream.eventDate).toISOString().slice(0, 16);
    }
    const slotDate = getNextSlotForCategory(initialTaxonomy?.category || 'capital', 10, 0);
    const year = slotDate.getFullYear();
    const month = String(slotDate.getMonth() + 1).padStart(2, '0');
    const day = String(slotDate.getDate()).padStart(2, '0');
    const hours = String(slotDate.getHours()).padStart(2, '0');
    const mins = String(slotDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}:00`;
  });
  
  // Step 3 (Communications) State
  const [guestStudioUrl, setGuestStudioUrl] = useState(initialDraftData?.livestream?.guestStudioUrl || '');
  const [guestMessageText, setGuestMessageText] = useState(initialDraftData?.livestream?.communications?.guestMessage?.text || '');
  const [guestButtonText, setGuestButtonText] = useState(initialDraftData?.livestream?.communications?.guestMessage?.buttonText || '');
  const [guestButtonLink, setGuestButtonLink] = useState(initialDraftData?.livestream?.communications?.guestMessage?.buttonLink || '');
  
  const [audienceMessageText, setAudienceMessageText] = useState(initialDraftData?.livestream?.communications?.audienceMessage?.text || '');
  const [audienceButtonText, setAudienceButtonText] = useState(initialDraftData?.livestream?.communications?.audienceMessage?.buttonText || '');
  const [audienceButtonLink, setAudienceButtonLink] = useState(initialDraftData?.livestream?.communications?.audienceMessage?.buttonLink || '');
  
  // Taxonomy State
  const [category, setCategory] = useState(initialTaxonomy?.category || 'capital');
  const [subcategory, setSubcategory] = useState(initialTaxonomy?.subcategory || '');
  const [timeframe, setTimeframe] = useState(initialTaxonomy?.timeframe || 'present');

  // Auto-sync schedule when category changes if user hasn't manually customized a pre-existing saved draft
  const hasLoadedInitialDate = useRef(Boolean(initialDraftData?.livestream?.eventDate));
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
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  useEffect(() => {
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
  const eventDatePart = useMemo(() => {
    if (!eventDate) return '';
    try {
      if (eventDate.includes('T')) {
        return eventDate.split('T')[0];
      }
      const d = new Date(eventDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return '';
    } catch {
      return '';
    }
  }, [eventDate]);

  const eventTimePart = useMemo(() => {
    if (!eventDate) return '10:00';
    try {
      if (eventDate.includes('T')) {
        const timeSub = eventDate.split('T')[1];
        return timeSub.substring(0, 5);
      }
      const d = new Date(eventDate);
      if (!isNaN(d.getTime())) {
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${mins}`;
      }
      return '10:00';
    } catch {
      return '10:00';
    }
  }, [eventDate]);

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
  const [rundownBlocks, setRundownBlocks] = useState<any[]>(
    initialDraftData?.livestream?.blocks?.map((b: any) => {
      const parsedContent = typeof b.content === 'string' ? JSON.parse(b.content) : (b.content || {});
      const isAct = b.blockType === 'rundown_act' || parsedContent.role || parsedContent.title?.toLowerCase().includes('act');
      return {
        id: b.id || Math.random().toString(),
        sourceType: isAct ? 'act' : (b.blockType === 'transition' ? 'transition' : (parsedContent.jobTitle ? 'job' : 'article_block')),
        sourceId: b.sourceId,
        parentArticleId: b.parentArticleId || parsedContent.parentArticleId,
        parentArticleTitle: b.parentArticleTitle || parsedContent.parentArticleTitle,
        originalBlockType: b.blockType,
        originalContent: parsedContent,
        speakerNotes: b.speakerNotes || parsedContent.speakerNotes || '',
        durationStr: b.durationStr || parsedContent.durationStr || ''
      };
    }) || []
  );

  const [frameworkLoaded, setFrameworkLoaded] = useState(rundownBlocks.length > 0);

  useEffect(() => {
    if (profile?.uid) {
      fetchLivestreamContentPool(profile.uid, postingAs === 'organization' ? selectedOrgId : null)
        .then(data => setContentPool(data))
        .catch(err => console.error(err));
    }
  }, [profile?.uid, postingAs, selectedOrgId]);

  // Handle distinct article calculation
  const distinctArticles = useMemo(() => {
    const articleIds = new Set<string>();
    rundownBlocks.forEach(b => {
      if (b.sourceType === 'article_block' && b.parentArticleId) {
        articleIds.add(b.parentArticleId);
      }
    });
    return articleIds.size;
  }, [rundownBlocks]);

  const canPublish = distinctArticles >= 5 && title.trim() && description.trim() && category && eventDatePart && eventTimePart && streamUrl;
  const canAdvanceStep1 = Boolean(title.trim() && eventDatePart && eventTimePart);

  // Action Items Checklist
  const actionItems = useMemo(() => {
    const items: { id: string; label: string; onClick: () => void }[] = [];
    if (!title.trim()) {
      items.push({
        id: 'title',
        label: 'Add Livestream Title',
        onClick: () => {
          setIsIdeasDrawerOpen(true);
        }
      });
    }
    if (!eventDatePart || !eventTimePart) {
      items.push({
        id: 'timing',
        label: 'Select Event Date & Time',
        onClick: () => {
          setIsScheduleFlipped(true);
          timingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    if (step >= 2) {
      if (!frameworkLoaded) {
        items.push({
          id: 'draft_slides',
          label: 'Draft Slides with AI (~1 min)',
          onClick: () => {
            setIsDraftingDrawerOpen(true);
          }
        });
      }
      if (distinctArticles < 5) {
        items.push({
          id: 'articles',
          label: `Reference at least 5 articles (${distinctArticles}/5)`,
          onClick: () => {}
        });
      }
    }
    if (step === 3) {
      if (!streamUrl) {
        items.push({
          id: 'streamUrl',
          label: 'Configure Public Stream URL',
          onClick: () => {}
        });
      }
      if (!coverImage) {
        items.push({
          id: 'cover',
          label: 'Upload or Generate Cover Image',
          onClick: () => {
            coverCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    }
    return items;
  }, [streamUrl, eventDatePart, eventTimePart, title, coverImage, distinctArticles, step]);

  const [isActionItemsMinimized, setIsActionItemsMinimized] = useState(false);

  const handleSave = async (isPublish: boolean) => {
    if (!profile?.uid) return;
    setIsSubmitting(true);
    try {
      let finalCoverUrl = typeof coverImage === 'string' ? coverImage : '';
      if (coverImage instanceof File) {
        const res = await uploadFile(coverImage);
        finalCoverUrl = res?.secure_url || '';
      }

      // Format blocks for the backend
      const formattedBlocks = rundownBlocks.map((b, index) => ({
        blockType: b.sourceType === 'act' ? 'rundown_act' : (b.sourceType === 'transition' ? 'transition' : b.originalBlockType || b.sourceType),
        orderIndex: index,
        content: JSON.stringify({
          ...(b.originalContent || {}),
          speakerNotes: b.speakerNotes,
          durationStr: b.durationStr,
          parentArticleId: b.parentArticleId,
          parentArticleTitle: b.parentArticleTitle,
        }),
        speakerNotes: b.speakerNotes,
        durationStr: b.durationStr,
        sourceId: b.sourceId, // Keep reference to original source
      }));

      const payload = {
        title,
        description,
        type: 'livestream' as const,
        authorId: profile.uid,
        organizationId: postingAs === 'organization' ? selectedOrgId : undefined,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        coverImageUrl: finalCoverUrl,
        taxonomy: { category, subcategory, timeframe },
        bottleneckTags: [],
        livestream: {
          streamUrl,
          guestStudioUrl,
          eventDate: new Date(eventDate),
          status: 'scheduled',
          blocks: formattedBlocks,
          communications: {
            guestMessage: {
              text: guestMessageText,
              buttonText: guestButtonText,
              buttonLink: guestButtonLink
            },
            audienceMessage: {
              text: audienceMessageText,
              buttonText: audienceButtonText,
              buttonLink: audienceButtonLink
            }
          }
        }
      };

      await createLearnContent(payload, !isPublish);
      alert(isPublish ? 'Livestream Scheduled!' : 'Draft Saved!');
      onSuccess();
    } catch (e: any) {
      alert(e.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
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

  const handleSelectBlueprint = (blueprint: any, autoLoadSlides: boolean = false) => {
    if (!blueprint) return;
    setAppliedBlueprint(blueprint);
    if (blueprint.title) setTitle(blueprint.title);
    if (blueprint.description) setDescription(blueprint.description);
    if (blueprint.timeframe) setTimeframe(blueprint.timeframe);
    
    const chosenCategory = blueprint.category || category || 'capital';
    if (blueprint.category) setCategory(blueprint.category);

    // Auto-calculate exact scheduled livestream date & time based on Category Group in the Editorial Matrix!
    const slotDate = getNextSlotForCategory(chosenCategory, 10, 0);
    const year = slotDate.getFullYear();
    const month = String(slotDate.getMonth() + 1).padStart(2, '0');
    const day = String(slotDate.getDate()).padStart(2, '0');
    const hours = String(slotDate.getHours()).padStart(2, '0');
    const mins = String(slotDate.getMinutes()).padStart(2, '0');
    setEventDate(`${year}-${month}-${day}T${hours}:${mins}:00`);

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
  };

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
              ref={timingCardRef}
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
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.6,
                      }}
                    >
                      ⏱️ Goes Live In
                    </Typography>

                    {/* Live Digital Countdown Timer */}
                    {countdown && !countdown.isPast ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(15, 23, 42, 0.05)', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '10px', px: 1, py: 0.6, minWidth: 40 }}>
                          <Typography sx={{ fontWeight: 950, fontSize: '1.15rem', color: '#0f172a', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.days).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', mt: 0.25 }}>days</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: '#94a3b8', fontSize: '1.1rem', mb: 1 }}>:</Typography>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(15, 23, 42, 0.05)', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '10px', px: 1, py: 0.6, minWidth: 40 }}>
                          <Typography sx={{ fontWeight: 950, fontSize: '1.15rem', color: '#0f172a', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.hours).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', mt: 0.25 }}>hrs</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: '#94a3b8', fontSize: '1.1rem', mb: 1 }}>:</Typography>
                        <Box sx={{ textAlign: 'center', bgcolor: 'rgba(15, 23, 42, 0.05)', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '10px', px: 1, py: 0.6, minWidth: 40 }}>
                          <Typography sx={{ fontWeight: 950, fontSize: '1.15rem', color: '#0f172a', fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.minutes).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', mt: 0.25 }}>mins</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: '#94a3b8', fontSize: '1.1rem', mb: 1 }}>:</Typography>
                        <Box sx={{ textAlign: 'center', bgcolor: alpha(hubColor, 0.1), border: `1px solid ${alpha(hubColor, 0.25)}`, borderRadius: '10px', px: 1, py: 0.6, minWidth: 40 }}>
                          <Typography sx={{ fontWeight: 950, fontSize: '1.15rem', color: hubColor, fontFamily: 'monospace', lineHeight: 1 }}>
                            {String(countdown.seconds).padStart(2, '0')}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: hubColor, fontWeight: 800, textTransform: 'uppercase', mt: 0.25 }}>secs</Typography>
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
                    }}
                  >
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
                                    
                                    {/* Option Pill */}
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
                                  {/* Broadcast Count Badge */}
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
                                         "{item.description || item.hook}"
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

                                 {/* Bottom Right: Pick This Action Button */}
                                 <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pt: 1.5, borderTop: '1px solid rgba(226, 232, 240, 0.8)', mt: 1 }}>
                                   <Button
                                     variant="contained"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleSelectBlueprint(item);
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
                                      Use This Livestream Blueprint
                                    </Button>
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
          <Box sx={{ animation: 'fadeIn 0.3s', maxWidth: 800, mx: 'auto', width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Communications & Links
            </Typography>
            <Typography sx={{ color: '#475569', mb: 4, fontWeight: 500, fontSize: '1.05rem' }}>
              Configure your broadcasting links and set up automated messages for your guests and audience.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Broadcast Cover Image Section */}
              <Box ref={coverCardRef} sx={{ p: 4, borderRadius: '24px', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(hubColor, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '1.2rem' }}>🖼️</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>Broadcast Cover Image</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>A high-contrast 16:9 thumbnail for video feeds, social cards, and calendar listings</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Cover Preview & Controls */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: { sm: 'center' } }}>
                  <Box
                    sx={{
                      width: { xs: '100%', sm: 260 },
                      height: 146,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      bgcolor: 'rgba(15, 23, 42, 0.04)',
                      border: '1.5px dashed rgba(15, 23, 42, 0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundImage: coverImage 
                        ? (typeof coverImage === 'string' ? `url(${coverImage})` : `url(${URL.createObjectURL(coverImage)})`)
                        : 'none'
                    }}
                  >
                    {!coverImage && (
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>🎨</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>No cover selected</Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>
                      Upload an official broadcast banner, or generate one styled for <strong>{hubTitle}</strong>.
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Button
                        component="label"
                        variant="outlined"
                        size="small"
                        startIcon={<ImageIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          borderColor: 'rgba(15, 23, 42, 0.2)',
                          color: '#0f172a'
                        }}
                      >
                        Upload Cover
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) setCoverImage(e.target.files[0]);
                          }}
                        />
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          // Contextual food-systems graphic for immediate live presentation
                          setCoverImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80');
                        }}
                        startIcon={<SparkleIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          background: `linear-gradient(135deg, ${hubColor} 0%, ${alpha(hubColor, 0.88)} 100%)`,
                          color: '#fff',
                          boxShadow: `0 4px 14px ${alpha(hubColor, 0.35)}`
                        }}
                      >
                        Generate AI Cover
                      </Button>

                      {coverImage && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setCoverImage(null)}
                          sx={{ fontSize: '0.78rem', textTransform: 'none', fontWeight: 700 }}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Backstage (Guests) */}
              <Box sx={{ p: 4, borderRadius: '24px', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>🎙️</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>The Backstage (Guests)</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField 
                    fullWidth label="Guest Studio Link (Optional)" placeholder="e.g. Evmux, Streamyard, or Meet invite link" 
                    value={guestStudioUrl} onChange={e => setGuestStudioUrl(e.target.value)} 
                  />
                  <TextField 
                    fullWidth multiline rows={3} label="Message to Guests" placeholder="e.g. Join 15 mins early to test your mic." 
                    value={guestMessageText} onChange={e => setGuestMessageText(e.target.value)} 
                  />
                  <Box sx={{ display: 'flex', gap: 2, p: 2.5, bgcolor: 'rgba(15, 23, 42, 0.02)', borderRadius: '12px', border: '1px dashed rgba(15, 23, 42, 0.1)' }}>
                    <TextField fullWidth size="small" label="Action Button Text" placeholder="e.g. Join Studio" value={guestButtonText} onChange={e => setGuestButtonText(e.target.value)} />
                    <TextField fullWidth size="small" label="Action Button Link" placeholder="Auto-fills with studio link if empty" value={guestButtonLink} onChange={e => setGuestButtonLink(e.target.value)} />
                  </Box>
                </Box>
              </Box>

              {/* Stage (Audience) */}
              <Box sx={{ p: 4, borderRadius: '24px', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>📺</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>The Stage (Audience)</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField 
                    fullWidth label="Public Stream Link (Required)" placeholder="e.g. YouTube Live or Twitch embed URL" 
                    value={streamUrl} onChange={e => setStreamUrl(e.target.value)} 
                    error={!streamUrl && actionItems.some(i => i.id === 'streamUrl')}
                  />
                  <TextField 
                    fullWidth multiline rows={3} label="RSVP Confirmation Message" placeholder="e.g. Thanks for registering! Read our prep article below." 
                    value={audienceMessageText} onChange={e => setAudienceMessageText(e.target.value)} 
                  />
                  <Box sx={{ display: 'flex', gap: 2, p: 2.5, bgcolor: 'rgba(15, 23, 42, 0.02)', borderRadius: '12px', border: '1px dashed rgba(15, 23, 42, 0.1)' }}>
                    <TextField fullWidth size="small" label="Action Button Text" placeholder="e.g. Read Prep Material" value={audienceButtonText} onChange={e => setAudienceButtonText(e.target.value)} />
                    <TextField fullWidth size="small" label="Action Button Link" placeholder="e.g. https://foodnerve.com/article/123" value={audienceButtonLink} onChange={e => setAudienceButtonLink(e.target.value)} />
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
          <Button 
            variant="outlined" 
            onClick={() => handleSave(false)} 
            disabled={isSubmitting}
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
                  setStep(step + 1);
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
        guidingArticles={guidingArticles}
        guidingJobs={guidingJobs}
        guidingListings={guidingListings}
        guidingCampaigns={guidingCampaigns}
        onApplyIdea={(idea) => {
          handleSelectBlueprint(idea.blueprint || idea, false);
        }}
        onIngestBlueprints={(blueprints) => {
          setIngestedBlueprints(blueprints);
          setDeckActiveIndex(0);
          setIsCardFlipped(false);
          setIsIdeasCardFlipped(false);
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
    </Box>
  );
}
