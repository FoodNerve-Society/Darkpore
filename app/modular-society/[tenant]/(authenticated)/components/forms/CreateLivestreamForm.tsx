'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Chip, IconButton, Alert, Paper, useTheme, useMediaQuery } from '@mui/material';
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Article as ArticleIcon, AutoAwesome as SparkleIcon, Image as ImageIcon, Check as CheckIcon, Info as InfoIcon, ArrowForward as ArrowForwardIcon, Close as CloseIcon, Bolt as BoltIcon, CalendarMonth as CalendarMonthIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { fetchLivestreamContentPool, createLearnContent } from '@/lib/actions/learn';
import LivestreamRundownBuilder from './livestream/LivestreamRundownBuilder';
import LivestreamIdeasSidePane, { LivestreamIdeaOption } from './livestream/LivestreamIdeasSidePane';
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
  const [ingestedBlueprints, setIngestedBlueprints] = useState<LivestreamIdeaOption[]>([]);
  const [deckActiveIndex, setDeckActiveIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isIdeasCardFlipped, setIsIdeasCardFlipped] = useState(false);
  const [appliedBlueprint, setAppliedBlueprint] = useState<any>(initialDraftData?.livestream?.blueprint || null);
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

  const handleSelectBlueprint = (blueprint: any) => {
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

    if (blueprint.timelinePillars && blueprint.timelinePillars.length > 0) {
      setRundownBlocks(
        blueprint.timelinePillars.map((p: any, idx: number) => ({
          id: `act-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sourceType: 'act',
          originalBlockType: 'rundown_act',
          originalContent: {
            title: p.role,
            role: p.role,
            description: p.desc,
            desc: p.desc,
            focusSummary: blueprint.title,
          },
          speakerNotes: p.speakerNotes || '',
          durationStr: p.time || '15m',
        }))
      );
      setFrameworkLoaded(true);
    }
    setIsIdeasCardFlipped(false);
    setIsCardFlipped(false);
    setStep(2);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

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
  const [eventDate, setEventDate] = useState(initialDraftData?.livestream?.eventDate ? new Date(initialDraftData.livestream.eventDate).toISOString().slice(0,16) : '');
  
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
          timingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    if (step >= 2) {
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

  const applyFramework = () => {
    const framework = LIVESTREAM_FRAMEWORKS[timeframe] || LIVESTREAM_FRAMEWORKS.present;
    const initialPlaceholders = framework.map((f: any, idx: number) => ({
      id: `act-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceType: 'act',
      originalBlockType: 'rundown_act',
      originalContent: { 
        title: f.role, 
        role: f.role,
        description: f.desc,
        desc: f.desc,
        message: f.desc,
        focusSummary: `${timeframe.toUpperCase()} ERA LIVESTREAM`
      },
      speakerNotes: '',
      durationStr: f.time || '15m'
    }));
    
    setRundownBlocks(initialPlaceholders);
    setFrameworkLoaded(true);
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

            {/* ── SELECTED ANCHOR ARTICLES & CTAS CONTEXT BOARD ── */}
            {(guidingArticles.length > 0 || guidingJobs.length > 0 || guidingListings.length > 0 || guidingCampaigns.length > 0) && (
              <Box sx={{ mb: 3.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                
                {/* 1. Selected Anchor Articles */}
                {guidingArticles.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <span>📚</span> Selected Anchor Articles ({guidingArticles.length})
                      </Typography>
                      <Chip
                        label="Broadcast Inspiration"
                        size="small"
                        sx={{ bgcolor: 'rgba(15, 23, 42, 0.05)', color: '#475569', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                      />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: guidingArticles.length > 1 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr' }, gap: 1.5 }}>
                      {guidingArticles.map((art: any, artIdx: number) => {
                        const artTitle = art.title || 'Untitled Article';
                        const artDesc = art.description || art.summary || '';
                        const artImg = art.coverImageUrl || art.imageUrl || art.article?.coverImageUrl || '';
                        const artCat = art.category || art.taxonomy?.category || category;

                        return (
                          <Paper
                            key={art.id || `anchor-art-${artIdx}`}
                            elevation={0}
                            sx={{
                              p: 1.75,
                              borderRadius: '20px',
                              bgcolor: 'rgba(255, 255, 255, 0.88)',
                              backdropFilter: 'blur(16px)',
                              border: '1.5px solid rgba(226, 232, 240, 0.95)',
                              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255, 255, 255, 1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: 'rgba(15, 23, 42, 0.25)',
                                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                              }
                            }}
                          >
                            {/* Image Thumbnail */}
                            <Box
                              sx={{
                                width: { xs: 60, sm: 72 },
                                height: { xs: 60, sm: 72 },
                                borderRadius: '14px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                bgcolor: '#f1f5f9',
                                border: '1px solid rgba(0, 0, 0, 0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {artImg ? (
                                <img
                                  src={artImg}
                                  alt={artTitle}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <Typography sx={{ fontSize: '1.75rem' }}>📄</Typography>
                              )}
                            </Box>

                            {/* Content */}
                            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Chip
                                  label={(artCat || 'ARTICLE').toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                    color: '#2563eb',
                                    fontWeight: 900,
                                    fontSize: '0.64rem',
                                    letterSpacing: '0.04em',
                                    height: 18,
                                    borderRadius: '5px',
                                  }}
                                />
                              </Box>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  color: '#0f172a',
                                  lineHeight: 1.3,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {artTitle}
                              </Typography>
                              {artDesc && (
                                <Typography
                                  sx={{
                                    fontSize: '0.78rem',
                                    color: '#64748b',
                                    lineHeight: 1.4,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {artDesc}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* 2. Selected CTAs (Jobs / Deals / Listings) */}
                {(guidingJobs.length > 0 || guidingListings.length > 0 || guidingCampaigns.length > 0) && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <span>⚡</span> Spotlight CTAs & Deals ({guidingJobs.length + guidingListings.length + guidingCampaigns.length})
                      </Typography>
                      <Chip
                        label="Ecosystem Push"
                        size="small"
                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#b45309', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                      />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: (guidingJobs.length + guidingListings.length) > 1 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr' }, gap: 1.5 }}>
                      {/* Jobs */}
                      {guidingJobs.map((job: any, jobIdx: number) => {
                        const jobTitle = job.title || 'Job Opportunity';
                        const orgName = job.organization?.name || job.orgName || '';
                        const jobDesc = job.compensationOrTarget || job.organizationChallenges || job.description || job.location || '';
                        const jobLogo = job.organization?.logoUrl || job.orgLogo || job.coverImageUrl || '';

                        return (
                          <Paper
                            key={job.id || `anchor-job-${jobIdx}`}
                            elevation={0}
                            sx={{
                              p: 1.75,
                              borderRadius: '20px',
                              bgcolor: 'rgba(255, 255, 255, 0.88)',
                              backdropFilter: 'blur(16px)',
                              border: '1.5px solid rgba(226, 232, 240, 0.95)',
                              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255, 255, 255, 1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: 'rgba(245, 158, 11, 0.45)',
                                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.08)',
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: { xs: 60, sm: 72 },
                                height: { xs: 60, sm: 72 },
                                borderRadius: '14px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                bgcolor: '#fef3c7',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {jobLogo ? (
                                <img
                                  src={jobLogo}
                                  alt={jobTitle}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <Typography sx={{ fontSize: '1.75rem' }}>💼</Typography>
                              )}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Chip
                                  label="HIRING SPOTLIGHT"
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                                    color: '#b45309',
                                    fontWeight: 900,
                                    fontSize: '0.64rem',
                                    letterSpacing: '0.04em',
                                    height: 18,
                                    borderRadius: '5px',
                                  }}
                                />
                                {orgName && (
                                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {orgName}
                                  </Typography>
                                )}
                              </Box>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  color: '#0f172a',
                                  lineHeight: 1.3,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {jobTitle}
                              </Typography>
                              {jobDesc && (
                                <Typography
                                  sx={{
                                    fontSize: '0.78rem',
                                    color: '#64748b',
                                    lineHeight: 1.4,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {jobDesc}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        );
                      })}

                      {/* Listings / Deals */}
                      {guidingListings.map((listing: any, listIdx: number) => {
                        const lTitle = listing.title || 'Ecosystem Deal';
                        const lDesc = listing.description || listing.price || listing.location || '';
                        const lImg = listing.imageUrl || listing.coverImageUrl || '';

                        return (
                          <Paper
                            key={listing.id || `anchor-listing-${listIdx}`}
                            elevation={0}
                            sx={{
                              p: 1.75,
                              borderRadius: '20px',
                              bgcolor: 'rgba(255, 255, 255, 0.88)',
                              backdropFilter: 'blur(16px)',
                              border: '1.5px solid rgba(226, 232, 240, 0.95)',
                              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255, 255, 255, 1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: 'rgba(16, 185, 129, 0.45)',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.08)',
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: { xs: 60, sm: 72 },
                                height: { xs: 60, sm: 72 },
                                borderRadius: '14px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                bgcolor: '#ecfdf5',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {lImg ? (
                                <img
                                  src={lImg}
                                  alt={lTitle}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <Typography sx={{ fontSize: '1.75rem' }}>🤝</Typography>
                              )}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Chip
                                  label="DEAL ROOM"
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#065f46',
                                    fontWeight: 900,
                                    fontSize: '0.64rem',
                                    letterSpacing: '0.04em',
                                    height: 18,
                                    borderRadius: '5px',
                                  }}
                                />
                              </Box>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  color: '#0f172a',
                                  lineHeight: 1.3,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {lTitle}
                              </Typography>
                              {lDesc && (
                                <Typography
                                  sx={{
                                    fontSize: '0.78rem',
                                    color: '#64748b',
                                    lineHeight: 1.4,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {lDesc}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* ── DECOUPLED BROADCAST SCHEDULE & TIMING CARD ── */}
            <Paper
              ref={timingCardRef}
              elevation={0}
              sx={{
                mb: 3.5,
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: '24px',
                bgcolor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(226, 232, 240, 0.95)',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      bgcolor: alpha(hubColor, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1.5px solid ${alpha(hubColor, 0.25)}`,
                    }}
                  >
                    <Typography sx={{ fontSize: '1.3rem' }}>📅</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                      Broadcast Schedule & Timing
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                      Set the exact broadcast slot for this livestream. Pre-configured for your hub's weekly editorial rhythm.
                    </Typography>
                  </Box>
                </Box>

                {/* Ecosystem Category Tri-Pillar Chips */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  {hubCategoryPillars.map((catPillar) => (
                    <Chip
                      key={catPillar}
                      label={catPillar.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: alpha(hubColor, 0.1),
                        color: hubColor,
                        fontWeight: 900,
                        fontSize: '0.66rem',
                        letterSpacing: '0.04em',
                        height: 22,
                        borderRadius: '6px',
                        border: `1.5px solid ${alpha(hubColor, 0.25)}`,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Event Date & Time Pickers */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
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

              {/* Editorial Matrix Sync Strip */}
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: '16px', 
                  bgcolor: alpha(hubColor, 0.05), 
                  border: `1.5px solid ${alpha(hubColor, 0.2)}`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap', 
                  gap: 1.5 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(hubColor, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '1.1rem' }}>⏰</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 800 }}>
                      Weekly Editorial Matrix: Every <strong>{DAY_NAMES[CATEGORY_TO_DAY_MAP[category] || 1]}</strong> at 10:00 AM WAT
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                      Broadcasts in <strong>{hubTitle}</strong> air every {DAY_NAMES[CATEGORY_TO_DAY_MAP[category] || 1]} for maximum audience reach.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  onClick={() => {
                    const slotDate = getNextSlotForCategory(category, 10, 0);
                    const year = slotDate.getFullYear();
                    const month = String(slotDate.getMonth() + 1).padStart(2, '0');
                    const day = String(slotDate.getDate()).padStart(2, '0');
                    const hours = String(slotDate.getHours()).padStart(2, '0');
                    const mins = String(slotDate.getMinutes()).padStart(2, '0');
                    setEventDate(`${year}-${month}-${day}T${hours}:${mins}:00`);
                  }}
                  sx={{
                    color: hubColor,
                    bgcolor: '#ffffff',
                    border: `1.5px solid ${alpha(hubColor, 0.3)}`,
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    borderRadius: '10px',
                    px: 2,
                    py: 0.6,
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      bgcolor: alpha(hubColor, 0.08),
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Sync to Next {DAY_NAMES[CATEGORY_TO_DAY_MAP[category] || 1]} (10:00 AM)
                </Button>
              </Box>
            </Paper>

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
                                           const cleanActTitle = `Act ${aIdx + 1}: ${roleWithoutAct || 'Segment'}`;

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
                                       }
                                     }}
                                   >
                                     Pick This
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
          <Box sx={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
            
            {/* FRAMEWORK EMPTY STATE */}
            {!frameworkLoaded && (
              <Box sx={{ mb: 4, mt: 8 }}>
                {(() => {
                  const era = ERA_CONFIG[timeframe] || ERA_CONFIG.present;
                  const framework = LIVESTREAM_FRAMEWORKS[timeframe] || LIVESTREAM_FRAMEWORKS.present;
                  return (
                    <Box>
                      <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography sx={{ fontSize: 48, mb: 1.5, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>{era.emoji}</Typography>
                        <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: '#0f172a', mb: 1.5, letterSpacing: '-0.02em' }}>
                          {era.label} Livestream Framework
                        </Typography>
                        <Typography sx={{ color: '#475569', fontSize: '1.05rem', maxWidth: 540, mx: 'auto', lineHeight: 1.7, fontWeight: 500 }}>
                          This framework defines the optimal presentation flow for a <strong style={{ color: era.color }}>{timeframe}</strong> focused broadcast. Load it to pre-fill your rundown canvas.
                        </Typography>
                      </Box>

                      <Box sx={{ position: 'relative', pl: { xs: 3, md: 5 }, maxWidth: 800, mx: 'auto' }}>
                        <Box sx={{
                          position: 'absolute', left: { xs: 12, md: 20 }, top: 12, bottom: 12,
                          width: 3, background: `linear-gradient(180deg, ${era.color} 0%, ${alpha(era.color, 0.1)} 100%)`,
                          borderRadius: 2,
                        }} />

                        {framework.map((f, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5, position: 'relative' }}>
                            <Box sx={{
                              position: 'absolute', left: { xs: -21.5, md: -33.5 },
                              width: 24, height: 24, borderRadius: '50%',
                              bgcolor: '#fff', border: `3px solid ${era.color}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              mt: 1.5, zIndex: 2, boxShadow: `0 2px 8px ${alpha(era.color, 0.3)}`
                            }}>
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#0f172a' }}>{idx + 1}</Typography>
                            </Box>
                            <Box sx={{
                              flex: 1, p: 2.5, borderRadius: '16px',
                              border: `1px solid rgba(0,0,0,0.08)`,
                              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)`,
                              backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                              opacity: 0.9,
                              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              '&:hover': { opacity: 1, transform: 'translateX(4px)', borderColor: alpha(era.color, 0.3), boxShadow: `0 8px 24px rgba(0,0,0,0.06)` },
                            }}>
                              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.01em', mb: 0.5 }}>{f.role}</Typography>
                              <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 500 }}>{f.desc}</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <Button
                          variant="contained"
                          onClick={applyFramework}
                          startIcon={<SparkleIcon />}
                          sx={{
                            bgcolor: era.color, color: '#fff', fontWeight: 800, px: 6, py: 2, borderRadius: '20px',
                            fontSize: '1.1rem', letterSpacing: '0.02em',
                            boxShadow: `0 8px 24px ${alpha(era.color, 0.4)}`,
                            '&:hover': { bgcolor: alpha(era.color, 0.9), transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${alpha(era.color, 0.5)}` },
                            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                          }}
                        >
                          Load Recommended Framework
                        </Button>
                      </Box>
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

      {/* ── LIVESTREAM AI IDEAS SLIDE-OVER DRAWER ── */}
      <LivestreamIdeasSidePane
        open={isIdeasDrawerOpen}
        onClose={() => setIsIdeasDrawerOpen(false)}
        hubTitle={hubTitle}
        hubColor={hubColor}
        currentCategory={category}
        guidingArticles={guidingArticles}
        guidingJobs={guidingJobs}
        guidingListings={guidingListings}
        guidingCampaigns={guidingCampaigns}
        onApplyIdea={(idea) => {
          handleSelectBlueprint(idea.blueprint || idea);
        }}
        onIngestBlueprints={(blueprints) => {
          setIngestedBlueprints(blueprints);
          setDeckActiveIndex(0);
          setIsCardFlipped(false);
          setIsIdeasCardFlipped(false);
          setTimeout(() => {
            carouselRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        }}
      />
    </Box>
  );
}
