'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Chip, IconButton, Alert, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Article as ArticleIcon, AutoAwesome as SparkleIcon, Check as CheckIcon, Info as InfoIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { fetchLivestreamContentPool, createLearnContent } from '@/lib/actions/learn';
import LivestreamRundownBuilder from './livestream/LivestreamRundownBuilder';
import LivestreamIdeasSidePane from './livestream/LivestreamIdeasSidePane';
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
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentPool, setContentPool] = useState<{ articles: any[], jobs: any[] } | null>(null);

  // Ideation Assistant Drawer State
  const [isIdeasDrawerOpen, setIsIdeasDrawerOpen] = useState(false);
  const [dismissedIdeasCard, setDismissedIdeasCard] = useState(false);

  // Hub & Context from Studio Handoff
  const hubTitle = initialTaxonomy?.hubTitle || initialDraftData?.livestream?.hub?.title || 'Production & Capital';
  const hubColor = initialTaxonomy?.hubColor || initialDraftData?.livestream?.hub?.color || '#10b981';
  const guidingArticles = initialDraftData?.anchorArticles || initialDraftData?.livestream?.anchorArticles || [];
  const guidingJobs = initialDraftData?.livestream?.ctaJobs || [];
  const guidingListings = initialDraftData?.livestream?.ctaListings || [];

  // Form State
  const [title, setTitle] = useState(initialDraftData?.title || '');
  const [description, setDescription] = useState(initialDraftData?.description || '');
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
    initialDraftData?.livestream?.blocks?.map((b: any) => ({
      id: b.id || Math.random().toString(),
      sourceType: b.blockType === 'transition' ? 'transition' : (b.content?.includes('jobTitle') ? 'job' : 'article_block'),
      sourceId: b.sourceId,
      originalBlockType: b.blockType,
      originalContent: typeof b.content === 'string' ? JSON.parse(b.content) : b.content,
      speakerNotes: b.speakerNotes || '',
      durationStr: b.durationStr || ''
    })) || []
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
  const getDistinctArticleCount = () => {
    const articleIds = new Set();
    rundownBlocks.forEach(b => {
      if (b.sourceType === 'article_block' && b.parentArticleId) {
        articleIds.add(b.parentArticleId);
      }
    });
    return articleIds.size;
  };
  const distinctArticles = getDistinctArticleCount();
  const canPublish = distinctArticles >= 5 && title && description && category && eventDate && streamUrl;

  // Action Items Checklist
  const actionItems = useMemo(() => {
    const items = [];
    if (!eventDate) items.push('Set Event Date & Time');
    if (!title) items.push('Add Livestream Title');
    if (!coverImage) items.push('Upload Cover Image');
    
    if (step >= 2) {
      if (distinctArticles < 5) {
        items.push(`Reference at least 5 articles (${distinctArticles}/5)`);
      }
    }
    if (step === 3) {
      if (!streamUrl) items.push('Configure Public Stream URL');
    }
    return items;
  }, [streamUrl, eventDate, title, coverImage, distinctArticles, step]);

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
        blockType: b.sourceType === 'transition' ? 'transition' : b.originalBlockType || b.sourceType,
        orderIndex: index,
        content: JSON.stringify(b.originalContent || {}),
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
    const initialPlaceholders = framework.map((f: any) => ({
      id: Math.random().toString(),
      sourceType: 'transition',
      originalBlockType: 'transition',
      originalContent: { 
        title: f.role, 
        message: f.desc 
      },
      speakerNotes: '',
      durationStr: '5 min'
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
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, bgcolor: 'rgba(245,158,11,0.05)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.1)' }}>
                  <InfoIcon sx={{ color: '#f59e0b', fontSize: 16, mt: 0.2 }} />
                  <Typography sx={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 500 }}>{item}</Typography>
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

            {/* ── GET LIVESTREAM IDEAS HERE (Exact Article Replica Architecture) ── */}
            {!dismissedIdeasCard && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  mb: 4,
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  border: '1.5px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 12px 36px -10px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: { xs: 2.5, md: 4 },
                  position: 'relative',
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

                {/* Content Section: Title, Description & Action Buttons (Exact Article Hierarchy) */}
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
                      onClick={() => setDismissedIdeasCard(true)}
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
            )}

            {/* ── CORE METADATA FORM BOX (Using Premium Components) ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#ffffff', p: { xs: 3, sm: 4.5 }, borderRadius: '28px', border: '1.5px solid rgba(226, 232, 240, 0.9)', boxShadow: '0 12px 40px rgba(0,0,0,0.03)' }}>
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
              
              {/* Event Date & Time Pickers */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <PremiumDatePicker
                  fullWidth
                  label="Event Date"
                  value={eventDatePart}
                  onChange={(e) => handleDateChange(e.target.value)}
                  colorTheme={hubColor}
                  minDate={new Date()}
                />
                <PremiumTimePicker
                  fullWidth
                  label="Event Time"
                  value={eventTimePart}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  colorTheme={hubColor}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 900, mt: 1, mb: 0.5, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                Taxonomy & Timeline
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', ml: 0.5 }}>
                    Category Focus
                  </Typography>
                  <PremiumDropdown
                    fullWidth
                    colorTheme={hubColor}
                    label={CATEGORY_OPTIONS.find(c => c.id === category)?.label || 'Select Category'}
                    popoverTitle="Select Category Focus"
                    popoverSubtitle="Choose the structural pillar this broadcast addresses"
                    options={CATEGORY_OPTIONS}
                    value={CATEGORY_OPTIONS.find(c => c.id === category) || null}
                    onChange={(opt) => setCategory(opt?.id || opt)}
                    getOptionId={(opt) => opt?.id || opt}
                    getOptionLabel={(opt) => opt?.label || opt}
                    getOptionSecondary={(opt) => opt?.secondaryLabel}
                    getOptionEmoji={(opt) => opt?.emoji}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', ml: 0.5 }}>
                    Temporal Timeframe & Era
                  </Typography>
                  <PremiumDropdown
                    fullWidth
                    colorTheme={hubColor}
                    label={TIMEFRAME_OPTIONS.find(t => t.id === timeframe)?.label || 'Select Timeframe'}
                    popoverTitle="Select Broadcast Timeframe"
                    popoverSubtitle="Determines presentation narrative arc and default segment templates"
                    options={TIMEFRAME_OPTIONS}
                    value={TIMEFRAME_OPTIONS.find(t => t.id === timeframe) || null}
                    onChange={(opt) => setTimeframe(opt?.id || opt)}
                    getOptionId={(opt) => opt?.id || opt}
                    getOptionLabel={(opt) => opt?.label || opt}
                    getOptionSecondary={(opt) => opt?.secondaryLabel}
                    getOptionTag={(opt) => opt?.tag}
                    getOptionEmoji={(opt) => opt?.emoji}
                  />
                </Box>
              </Box>
            </Box>
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
                    error={!streamUrl && actionItems.includes('Configure Public Stream URL')}
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
            <Button 
              variant="contained" 
              onClick={() => setStep(step + 1)}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{ 
                borderRadius: '14px', 
                fontWeight: 900, 
                px: 4, 
                py: 1.25,
                background: `linear-gradient(135deg, ${hubColor} 0%, ${alpha(hubColor, 0.88)} 100%)`,
                color: '#ffffff',
                boxShadow: `0 8px 24px ${alpha(hubColor, 0.4)}`,
                textTransform: 'none',
                fontSize: '0.95rem',
                letterSpacing: '-0.01em',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  background: `linear-gradient(135deg, ${hubColor} 0%, ${hubColor} 100%)`,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 10px 28px ${alpha(hubColor, 0.5)}`
                }
              }}
            >
              Next Step
            </Button>
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
        onApplyIdea={(idea) => {
          setTitle(idea.title);
          setDescription(idea.description);
          if (idea.timeframe) {
            setTimeframe(idea.timeframe);
            const framework = LIVESTREAM_FRAMEWORKS[idea.timeframe] || LIVESTREAM_FRAMEWORKS.present;
            const initialPlaceholders = framework.map((f: any) => ({
              id: Math.random().toString(),
              sourceType: 'transition',
              originalBlockType: 'transition',
              originalContent: { 
                role: f.role, 
                description: f.desc,
                focusSummary: idea.title 
              },
              speakerNotes: '',
              durationStr: '~15m'
            }));
            setRundownBlocks(initialPlaceholders);
            setFrameworkLoaded(true);
          }
          if (idea.category) setCategory(idea.category);
        }}
      />
    </Box>
  );
}
