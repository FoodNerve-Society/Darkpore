"use client";

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Box, Typography, Paper, Chip, IconButton, alpha, Tooltip, Button } from '@mui/material';
import {
  Add as AddIcon,
  Minimize as MinimizeIcon,
  Storefront as StorefrontIcon,
  VolunteerActivism as VolunteerIcon,
  FlashOn as FlashIcon,
  Handshake as HandshakeIcon,
  SwapHoriz as SwapIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Edit as EditIcon,
  ArrowForward as ArrowForwardArrow,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

const EMERALD = "#10b981";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LISTING_OPTIONS = [
  {
    type: 'jobs', title: "Jobs, Interns & Volunteering", desc: "Post full-time roles, internships, gigs, or volunteer opportunities.",
    icon: <StorefrontIcon sx={{ fontSize: 32 }} />, color: "#1e293b", grad: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", emoji: "🏢"
  },
  {
    type: 'flash-sale', title: "Flash Sale", desc: "Sell perishable goods quickly.",
    icon: <FlashIcon sx={{ fontSize: 32 }} />, color: "#ef4444", grad: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)", emoji: "⚡"
  },
  {
    type: 'group-buy', title: "Group-Buy", desc: "Pool resources to share costs.",
    icon: <HandshakeIcon sx={{ fontSize: 32 }} />, color: "#3b82f6", grad: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", emoji: "🤝"
  },
  {
    type: 'swap', title: "Swap/Barter", desc: "Trade goods directly without cash.",
    icon: <SwapIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6", grad: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)", emoji: "♻️"
  },
  {
    type: 'opportunities', title: "Opportunities", desc: "Grants, RFPs, fellowships.",
    icon: <VolunteerIcon sx={{ fontSize: 32 }} />, color: "#10b981", grad: "linear-gradient(135deg, #065f46 0%, #10b981 100%)", emoji: "💡"
  }
];

const hiringEntityOptions = [
  { id: 'my-org', title: 'My Organisations', desc: 'Direct hire for your business', minRank: 2 },
  { id: 'foodnerve-org', title: 'Organisations in FoodNerve', desc: 'Recruit for a verified partner', reqAdmin: false },
  { id: 'external', title: 'External Organisations', desc: 'Sourcing labor for an outside entity', minRank: 2 }
];

const TRADE_CONFIGS: Record<string, any[]> = {
  'jobs': [
    {
      id: 'full-time', title: 'Full-Time Role', desc: 'Standard employment', color: '#10b981', imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=80',
      options: [ 
        { id: 'remote', title: 'Remote', desc: 'Work from anywhere', nextOptions: hiringEntityOptions }, 
        { id: 'on-site', title: 'On-site', desc: 'Physical location required', nextOptions: hiringEntityOptions }, 
        { id: 'hybrid', title: 'Hybrid', desc: 'Mix of both', nextOptions: hiringEntityOptions } 
      ]
    },
    {
      id: 'internship', title: 'Internship', desc: 'Entry-level or student role', color: '#f59e0b', imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=400&q=80',
      options: [ 
        { id: 'remote', title: 'Remote', desc: 'Work from anywhere', nextOptions: hiringEntityOptions }, 
        { id: 'on-site', title: 'On-site', desc: 'Physical location required', nextOptions: hiringEntityOptions }, 
        { id: 'hybrid', title: 'Hybrid', desc: 'Mix of both', nextOptions: hiringEntityOptions } 
      ]
    },
    {
      id: 'contract', title: 'Contract / Freelance', desc: 'Project-based or fixed-term', color: '#3b82f6', imageUrl: 'https://images.unsplash.com/photo-1588196749597-9ff04689e526?auto=format&fit=crop&w=400&q=80',
      options: [ 
        { id: 'remote', title: 'Remote', desc: 'Work from anywhere', nextOptions: hiringEntityOptions }, 
        { id: 'on-site', title: 'On-site', desc: 'Physical location required', nextOptions: hiringEntityOptions }, 
        { id: 'hybrid', title: 'Hybrid', desc: 'Mix of both', nextOptions: hiringEntityOptions } 
      ]
    },
    {
      id: 'volunteer', title: 'Volunteer (Earn NP)', desc: 'Give back, earn Nerve Points', color: '#8b5cf6', imageUrl: 'https://images.unsplash.com/photo-1593113589914-009f4561ea90?auto=format&fit=crop&w=400&q=80',
      options: [ 
        { id: 'remote', title: 'Remote', desc: 'Work from anywhere', nextOptions: hiringEntityOptions }, 
        { id: 'on-site', title: 'On-site', desc: 'Physical location required', nextOptions: hiringEntityOptions } 
      ]
    }
  ],
  'flash-sale': [
    {
      id: 'perishable', title: 'Perishable Goods', desc: 'Fresh produce, dairy, etc.', color: '#ef4444', imageUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=400&q=80',
      options: [ { id: 'pickup', title: 'Buyer Picks Up', desc: 'Buyer comes to you' }, { id: 'delivery', title: 'Seller Delivers', desc: 'You drop it off' } ]
    },
    {
      id: 'non-perishable', title: 'Non-Perishable / Dry', desc: 'Grains, packaged items', color: '#f59e0b', imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
      options: [ { id: 'pickup', title: 'Buyer Picks Up', desc: 'Buyer comes to you' }, { id: 'delivery', title: 'Seller Delivers', desc: 'You drop it off' }, { id: 'nationwide', title: 'Nationwide Shipping', desc: 'Courier dispatch' } ]
    }
  ],
  'group-buy': [
    {
      id: 'binding', title: 'Binding (Deposit Required)', desc: 'Firm commitment to buy', color: '#10b981', imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=400&q=80',
      options: [ { id: 'hub', title: 'Central Hub Pickup', desc: 'Everyone meets at a location' }, { id: 'dispatch', title: 'Individual Dispatch', desc: 'Last mile to each buyer' } ]
    },
    {
      id: 'interest', title: 'Express Interest Only', desc: 'Gauge demand first', color: '#3b82f6', imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953eb1f55f?auto=format&fit=crop&w=400&q=80',
      options: [ { id: 'hub', title: 'Central Hub Pickup', desc: 'Everyone meets at a location' }, { id: 'dispatch', title: 'Individual Dispatch', desc: 'Last mile to each buyer' } ]
    }
  ],
  'swap': [
    {
      id: 'new', title: 'Brand New', desc: 'Unused, in original packaging', color: '#3b82f6', imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
      options: [ { id: 'pickup', title: 'Buyer Picks Up', desc: 'Buyer comes to you' }, { id: 'delivery', title: 'Seller Delivers', desc: 'You drop it off' } ]
    },
    {
      id: 'used', title: 'Used (Fair Condition)', desc: 'Has wear and tear', color: '#8b5cf6', imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80',
      options: [ { id: 'pickup', title: 'Buyer Picks Up', desc: 'Buyer comes to you' }, { id: 'delivery', title: 'Seller Delivers', desc: 'You drop it off' } ]
    }
  ],
  'opportunities': [
    {
      id: 'grant', title: 'Grant / Funding', desc: 'Financial support available', color: '#10b981', imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      options: [ { id: 'digital', title: 'Digital/Remote', desc: 'Apply online' } ]
    },
    {
      id: 'rfp', title: 'RFP / Tender', desc: 'Request for Proposals', color: '#ef4444', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
      options: [ { id: 'digital', title: 'Digital/Remote', desc: 'Apply online' }, { id: 'physical', title: 'Physical Submission', desc: 'Deliver physical documents' } ]
    }
  ]
};

export default function ListingStudioDashboard({
  drafts = [],
  onStartFresh,
  onEditDraft,
  onDeleteDraft,
  userName
}: {
  drafts: any[];
  onStartFresh: (category: string, selections?: { primary: string, secondary: string, tertiary?: string }, fastIngestData?: any) => void;
  onEditDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  userName?: string;
}) {
  const { profile } = useSociety();
  const [expandedStartType, setExpandedStartType] = useState<string | null>(null);
  
  // Accordion / Slide states
  const [activeAccordionIdx, setActiveAccordionIdx] = useState<number | null>(null);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [selectedSubOption, setSelectedSubOption] = useState<string>('');
  const [selectedTertiaryOption, setSelectedTertiaryOption] = useState<string>('');
  const [showSubOptions, setShowSubOptions] = useState(false);
  
  // Fast Ingest
  const [fastPayloadText, setFastPayloadText] = useState("");
  const [fastIngestError, setFastIngestError] = useState("");

  const activeOption = LISTING_OPTIONS.find(o => o.type === expandedStartType);
  const currentConfig = expandedStartType ? TRADE_CONFIGS[expandedStartType] : [];

  const handleOpenCreator = (type: string) => {
    setExpandedStartType(type);
    setActiveAccordionIdx(null);
    setCategoryLocked(false);
    setSelectedSubOption('');
    setSelectedTertiaryOption('');
    setShowSubOptions(false);
  };

  const handleClose = () => {
    setExpandedStartType(null);
    setActiveAccordionIdx(null);
    setCategoryLocked(false);
    setSelectedSubOption('');
    setSelectedTertiaryOption('');
    setShowSubOptions(false);
  };

  const handleCategorySelect = (idx: number, id: string) => {
    if (categoryLocked) return;
    setActiveAccordionIdx(idx);
    setCategoryLocked(true);
    setTimeout(() => {
      setShowSubOptions(true);
    }, 400); // Wait for the horizontal slide animation
  };

  const handleResetCategory = () => {
    setShowSubOptions(false);
    setTimeout(() => {
      setCategoryLocked(false);
      setSelectedSubOption('');
      setSelectedTertiaryOption('');
      // We don't nullify activeAccordionIdx immediately to allow smooth transition back
    }, 300);
  };

  const finalizeTaxonomy = (subOptionId: string, tertiaryId?: string) => {
    if (tertiaryId) setSelectedTertiaryOption(tertiaryId);
    else setSelectedSubOption(subOptionId);

    if (!expandedStartType || activeAccordionIdx === null) return;
    
    // Call onStartFresh with the collected choices
    const primaryChoice = currentConfig[activeAccordionIdx].id;
    onStartFresh(expandedStartType, { primary: primaryChoice, secondary: subOptionId, tertiary: tertiaryId });
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
        <Typography variant="h3" sx={{ fontFamily: 'Caveat, cursive', color: '#10b981', mb: 0.5, fontSize: { xs: '1.4rem', sm: '2.5rem', md: '3rem' } }}>
          Good {greeting}, {userName || 'Creative'}.
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

      {/* ================================================================ */}
      {/* FAST INGEST SECTION (ADMINS)                                     */}
      {/* ================================================================ */}
      {(() => {
        // Real-time parse preview
        let parsedPreview: any = null;
        let parseStatus: 'empty' | 'valid' | 'invalid' = 'empty';
        if (fastPayloadText.trim()) {
          try {
            parsedPreview = JSON.parse(fastPayloadText);
            parseStatus = (parsedPreview && typeof parsedPreview === 'object') ? 'valid' : 'invalid';
          } catch { parseStatus = 'invalid'; }
        }

        const handleFastIngest = () => {
          if (parseStatus !== 'valid' || !parsedPreview) return;
          try {
            // Support both old flat format (for safety) and new Omni-Trade format
            const category = parsedPreview.taxonomy?.category || parsedPreview.category || 'jobs';
            
            let selections = undefined;
            if (parsedPreview.taxonomy) {
                selections = {
                    primary: parsedPreview.taxonomy.primary,
                    secondary: parsedPreview.taxonomy.secondary,
                    tertiary: parsedPreview.taxonomy.tertiary
                };
            }
            
            const formPayload = parsedPreview.payload || parsedPreview;

            onStartFresh(category, selections, formPayload);
          } catch (e: any) {
            setFastIngestError(e.message || "Invalid JSON payload.");
          }
        };

        return (
          <Box sx={{ mb: 5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: EMERALD }} /> Fast Ingest
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: '16px', 
                overflow: 'hidden',
                border: parseStatus === 'valid' 
                  ? `1.5px solid ${alpha(EMERALD, 0.5)}` 
                  : parseStatus === 'invalid' 
                    ? '1.5px solid rgba(239,68,68,0.4)' 
                    : '1px solid rgba(0,0,0,0.06)',
                bgcolor: '#0f172a',
                transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                boxShadow: parseStatus === 'valid' 
                  ? `0 0 24px ${alpha(EMERALD, 0.12)}, 0 4px 20px rgba(0,0,0,0.15)` 
                  : '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              {/* Code Editor Area */}
              <Box sx={{ position: 'relative' }}>
                {/* Top Bar */}
                <Box sx={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 2, py: 1.2, 
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Traffic light dots */}
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: parseStatus === 'invalid' ? '#ef4444' : 'rgba(255,255,255,0.15)' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: parseStatus === 'valid' ? '#22c55e' : 'rgba(255,255,255,0.15)' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: parseStatus === 'valid' ? EMERALD : 'rgba(255,255,255,0.15)' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', fontSize: '0.7rem', ml: 1 }}>
                      payload.json
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {parseStatus === 'valid' && (
                      <Chip label="Valid JSON" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: '6px' }} />
                    )}
                    {parseStatus === 'invalid' && (
                      <Chip label="Invalid JSON" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(239,68,68,0.15)', color: '#ef4444', borderRadius: '6px' }} />
                    )}
                  </Box>
                </Box>

                {/* Textarea */}
                <textarea
                  placeholder='{\n  "title": "Precision Agriculture Specialist",\n  "category": "jobs",\n  ...\n}'
                  value={fastPayloadText}
                  onChange={(e) => { setFastPayloadText(e.target.value); setFastIngestError(''); }}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    maxHeight: '300px',
                    backgroundColor: 'transparent',
                    color: '#e2e8f0',
                    border: 'none',
                    padding: '16px 20px',
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontSize: '0.82rem',
                    lineHeight: 1.7,
                    resize: 'vertical',
                    outline: 'none',
                    caretColor: EMERALD,
                  }}
                />
              </Box>

              {/* Preview Stats Bar */}
              {parseStatus === 'valid' && parsedPreview && (
                <Box sx={{ 
                  px: 2, py: 1.5, 
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
                  animation: `${slideUpFade} 0.3s ease`,
                }}>
                  {parsedPreview.title && (
                    <Chip 
                      label={parsedPreview.title.length > 40 ? parsedPreview.title.slice(0, 40) + '…' : parsedPreview.title}
                      size="small"
                      sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', borderRadius: '8px', maxWidth: 260 }}
                    />
                  )}
                  {parsedPreview.sector && (
                    <Chip 
                      label={parsedPreview.sector}
                      size="small"
                      sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, bgcolor: alpha(EMERALD, 0.15), color: EMERALD, borderRadius: '8px' }}
                    />
                  )}
                  {parsedPreview.commitment && (
                    <Chip 
                      label={parsedPreview.commitment}
                      size="small"
                      sx={{ height: 24, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha('#3b82f6', 0.15), color: '#3b82f6', borderRadius: '8px', textTransform: 'capitalize' }}
                    />
                  )}
                </Box>
              )}

              {/* Error / Action Bar */}
              <Box sx={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 2, py: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(0,0,0,0.15)',
              }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#ef4444', fontSize: '0.72rem' }}>
                  {fastIngestError}
                </Typography>
                <Box 
                  onClick={handleFastIngest}
                  sx={{ 
                    px: 3, py: 0.9, 
                    bgcolor: parseStatus === 'valid' ? EMERALD : 'rgba(255,255,255,0.08)',
                    color: parseStatus === 'valid' ? '#fff' : 'rgba(255,255,255,0.3)',
                    borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem',
                    cursor: parseStatus === 'valid' ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                    display: 'flex', alignItems: 'center', gap: 1,
                    pointerEvents: parseStatus === 'valid' ? 'auto' : 'none',
                    '&:hover': parseStatus === 'valid' ? { bgcolor: EMERALD_DARK, transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${alpha(EMERALD, 0.4)}` } : {}
                  }}
                >
                  Parse & Proceed <ArrowForwardArrow fontSize="small" sx={{ ml: 0.5, transition: 'transform 0.2s', ...(parseStatus === 'valid' && { transform: 'translateX(2px)' }) }} />
                </Box>
              </Box>
            </Paper>
          </Box>
        );
      })()}

      {/* ================================================================ */}
      {/* START FRESH SECTION                                              */}
      {/* ================================================================ */}

      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
        Start Fresh
      </Typography>

      <Box sx={{
        display: 'flex', 
        gap: expandedStartType ? 0 : 3, 
        overflowX: expandedStartType ? 'visible' : 'auto', 
        pt: 1, pb: expandedStartType ? 0 : 5, mb: 2,
        '&::-webkit-scrollbar': { height: 0 }, 
        px: expandedStartType ? 0 : 0.5, 
        mx: expandedStartType ? 0 : -0.5,
        transition: 'gap 0.4s ease, padding 0.4s ease, margin 0.4s ease'
      }}>
        {LISTING_OPTIONS.map((opt) => {
          const isExpanded = expandedStartType === opt.type;
          const isHidden = expandedStartType !== null && expandedStartType !== opt.type;

          return (
            <Paper
              key={opt.type}
              onClick={() => {
                if (!expandedStartType) handleOpenCreator(opt.type);
              }}
              elevation={0}
              sx={{
                flex: isHidden ? '0 0 0%' : (isExpanded ? '0 0 100%' : '0 0 auto'),
                minWidth: isHidden ? 0 : (isExpanded ? '100%' : { xs: 140, sm: 240, md: 280 }),
                maxWidth: isHidden ? 0 : (isExpanded ? '100%' : { xs: 140, sm: 240, md: 280 }),
                height: isExpanded ? 'auto' : (isHidden ? 0 : { xs: 160, sm: 280, md: 320 }),
                opacity: isHidden ? 0 : 1,
                p: isExpanded ? 0 : (isHidden ? 0 : { xs: 1.5, sm: 2.5, md: 3.5 }),
                display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5, md: 2 },
                borderRadius: { xs: '16px', sm: '24px', md: '28px' }, cursor: isExpanded ? 'default' : 'pointer',
                background: isExpanded ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` : opt.grad,
                border: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isHidden ? 'none' : `inset 0 2px 10px rgba(255,255,255,0.2), 0 10px 30px ${alpha(opt.color, 0.25)}`,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': !isExpanded ? {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `inset 0 2px 10px rgba(255,255,255,0.3), 0 24px 48px ${alpha(opt.color, 0.4)}`,
                  borderColor: 'rgba(255,255,255,0.3)',
                  '& .sf-icon': { transform: 'scale(1.1) rotate(-5deg)', bgcolor: 'rgba(255,255,255,0.3)' }
                } : {}
              }}
            >
              {!isExpanded ? (
                <>
                  <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.12, transform: 'scale(4)', pointerEvents: 'none', color: '#fff' }}>
                    {opt.icon}
                  </Box>
                  <Box className="sf-icon" sx={{
                    p: { xs: 1, sm: 1.5 }, borderRadius: { xs: '12px', sm: '18px' }, bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#fff', width: 'fit-content',
                    backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)',
                    transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}>
                    {opt.icon}
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1, mt: { xs: 0, sm: 1 } }}>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.85rem', sm: '1.2rem' }, mb: 0.25, color: '#fff', letterSpacing: '-0.02em' }}>
                      {opt.title}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.85rem' }, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, fontWeight: 500 }}>
                      {opt.desc}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ p: { xs: 2.5, sm: 4 }, width: '100%', height: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {/* Container Header & Minimize Button */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 2, sm: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                      <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                        {opt.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.75rem', sm: '0.85rem' }, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                          {opt.title} Setup
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', mt: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                          Ready to create?
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Minimize">
                      <IconButton onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(0,0,0,0.3)', color: '#fff' } }}>
                        <MinimizeIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Accordion Container */}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    width: '100%',
                    minHeight: { xs: 400, md: 450 },
                    height: categoryLocked ? 'auto' : { xs: 400, md: 450 }, 
                    borderRadius: '24px', 
                    overflow: 'hidden',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    position: 'relative',
                    bgcolor: 'transparent'
                  }}>
                    {currentConfig.map((config: any, idx: number) => {
                      const isActive = activeAccordionIdx === idx;
                      const isLocked = categoryLocked && isActive;
                      const isHidden = categoryLocked && !isActive;
                      return (
                        <Box
                          key={config.id}
                          onClick={() => {
                            if (!categoryLocked) {
                              handleCategorySelect(idx, config.id);
                            } else if (isLocked && !selectedSubOption) {
                              handleResetCategory();
                            }
                          }}
                          sx={{
                            display: 'flex', flexDirection: 'column',
                            position: 'relative',
                            flex: isHidden ? '0 0 0%' : isActive ? (categoryLocked ? '0 0 100%' : '0 0 45%') : '1 1 0%',
                            minWidth: isHidden ? 0 : (isActive ? undefined : 0),
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            opacity: isHidden ? 0 : 1,
                            '&:not(:last-child)': {
                              borderRight: { xs: 'none', md: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)' },
                              borderBottom: { xs: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)', md: 'none' },
                            },
                            '&:hover': !categoryLocked ? {
                              flex: '0 0 50%',
                            } : {},
                          }}
                        >
                          {/* Background Image */}
                          <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: `url(${config.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.6s ease',
                            transform: isActive ? 'scale(1.05)' : 'scale(1.15)',
                          }} />

                          {/* Dark Overlay */}
                          <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: isActive
                              ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)'
                              : 'rgba(0,0,0,0.55)',
                            transition: 'background 0.4s',
                          }} />

                          {/* Category Label / Breadcrumb */}
                          <Box sx={{
                            position: 'absolute',
                            bottom: categoryLocked && isLocked ? 'auto' : 20,
                            top: categoryLocked && isLocked ? 20 : 'auto',
                            left: 20, right: 20,
                            zIndex: 5,
                            transition: 'all 0.4s',
                          }}>
                            {categoryLocked && isLocked ? (
                              <Box 
                                sx={{ 
                                  display: 'inline-flex', alignItems: 'center', p: 1, ml: -1, borderRadius: 3, 
                                  bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)',
                                  maxWidth: '100%', overflowX: 'auto', whiteSpace: 'nowrap',
                                  '&::-webkit-scrollbar': { display: 'none' }
                                }}
                              >
                                <Box 
                                  onClick={(e) => { e.stopPropagation(); handleResetCategory(); }}
                                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 }, transition: 'opacity 0.2s' }}
                                >
                                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    Listing Type
                                  </Typography>
                                </Box>

                                <Typography sx={{ color: 'rgba(255,255,255,0.3)', mx: 1, fontSize: '0.8rem' }}>/</Typography>
                                <Typography 
                                  onClick={(e) => { e.stopPropagation(); setSelectedSubOption(''); }}
                                  sx={{ color: selectedSubOption ? 'rgba(255,255,255,0.7)' : '#fff', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: selectedSubOption ? 'pointer' : 'default', '&:hover': selectedSubOption ? { opacity: 0.7 } : {}, transition: 'opacity 0.2s' }}
                                >
                                  {config.title}
                                </Typography>

                                {selectedSubOption && (
                                  <>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', mx: 1, fontSize: '0.8rem' }}>/</Typography>
                                    <Typography 
                                      onClick={(e) => { e.stopPropagation(); setSelectedTertiaryOption(''); }}
                                      sx={{ color: selectedTertiaryOption ? 'rgba(255,255,255,0.7)' : '#fff', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: selectedTertiaryOption ? 'pointer' : 'default', '&:hover': selectedTertiaryOption ? { opacity: 0.7 } : {}, transition: 'opacity 0.2s' }}
                                    >
                                      {config.options?.find((s: any) => s.id === selectedSubOption)?.title || 'Details'}
                                    </Typography>
                                  </>
                                )}

                                {selectedTertiaryOption && (
                                  <>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', mx: 1, fontSize: '0.8rem' }}>/</Typography>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                      {config.options?.find((s: any) => s.id === selectedSubOption)?.nextOptions?.find((t: any) => t.id === selectedTertiaryOption)?.title || 'Role'}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            ) : (
                              <Box>
                                <Typography sx={{
                                  color: '#fff',
                                  fontWeight: 900,
                                  fontSize: isActive ? '1.4rem' : '1rem',
                                  letterSpacing: '-0.01em',
                                  lineHeight: 1.2,
                                  transition: 'font-size 0.4s',
                                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                  whiteSpace: isActive ? 'normal' : 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {config.title}
                                </Typography>
                                {isActive && !categoryLocked && (
                                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', mt: 0.5, fontWeight: 600 }}>
                                    Tap to select
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>

                          {/* ┌── GLASSMORPHIC REVEAL (inside the locked card) ──┐ */}
                          {isLocked && showSubOptions && (
                            <Box 
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                position: 'relative',
                                mt: { xs: 8, md: 9 }, // push down past the "Categories / Subcategory" header
                                flex: 'none',
                                background: 'rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(32px)',
                                WebkitBackdropFilter: 'blur(32px)',
                                zIndex: 10,
                                animation: `${slideUpFade} 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
                                overflow: 'hidden',
                                borderBottomLeftRadius: '24px',
                                borderBottomRightRadius: '24px',
                                borderTopLeftRadius: { xs: 0, md: '24px' },
                                borderTopRightRadius: { xs: 0, md: '24px' },
                                mx: { xs: 0, md: 2 },
                                mb: { xs: 0, md: 2 },
                                boxShadow: '0 -4px 24px rgba(0,0,0,0.2)'
                              }}>
                              {/* Sliding Track */}
                              <Box sx={{
                                display: 'flex',
                                width: (config.options?.find((s: any) => s.id === selectedSubOption)?.nextOptions) ? '200%' : '100%',
                                height: 'auto',
                                transform: selectedSubOption && config.options?.find((s: any) => s.id === selectedSubOption)?.nextOptions 
                                  ? 'translateX(-50%)' 
                                  : 'translateX(0)',
                                transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              }}>
                                {/* VIEW 1: OPTIONS */}
                                <Box sx={{ width: (config.options?.find((s: any) => s.id === selectedSubOption)?.nextOptions) ? '50%' : '100%', height: 'auto', p: 4, pb: 4 }}>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
                                    Additional Details
                                  </Typography>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, pb: 2 }}>
                                    {config.options?.map((sub: any) => {
                                      const isSubActive = selectedSubOption === sub.id;
                                      return (
                                        <Box
                                          key={sub.id}
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (sub.nextOptions && sub.nextOptions.length > 0) {
                                              setSelectedSubOption(sub.id); 
                                              setSelectedTertiaryOption('');
                                            } else {
                                              finalizeTaxonomy(sub.id);
                                            }
                                          }}
                                          sx={{
                                            display: 'flex', alignItems: 'center', gap: 2,
                                            p: 2, borderRadius: '16px',
                                            cursor: 'pointer', transition: 'all 0.3s',
                                            border: '1px solid',
                                            borderColor: isSubActive ? opt.color : 'rgba(255,255,255,0.15)',
                                            bgcolor: isSubActive ? alpha(opt.color, 0.25) : 'rgba(255,255,255,0.08)',
                                            boxShadow: isSubActive ? `0 4px 20px ${alpha(opt.color, 0.3)}` : 'none',
                                            backdropFilter: 'blur(8px)',
                                            '&:hover': { bgcolor: isSubActive ? alpha(opt.color, 0.35) : 'rgba(255,255,255,0.15)', transform: 'translateY(-2px)' }
                                          }}
                                        >
                                          <Box>
                                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', mb: 0.25 }}>{sub.title}</Typography>
                                            {sub.desc && (
                                              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {sub.desc}
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>

                                {/* VIEW 2: TERTIARY OPTIONS (If applicable) */}
                                {config.options?.find((s: any) => s.id === selectedSubOption)?.nextOptions && (
                                  <Box sx={{ width: '50%', height: 'auto', p: 4, pb: 4 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
                                      Who are you hiring for?
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, pb: 2 }}>
                                      {config.options.find((s: any) => s.id === selectedSubOption).nextOptions.map((ter: any) => {
                                        const isTerActive = selectedTertiaryOption === ter.id;
                                        const isAdmin = profile?.isAdmin || false;
                                        const rank = profile?.currentRank || 1;
                                        const isLocked = (ter.minRank && rank < ter.minRank) || (ter.reqAdmin && !isAdmin);

                                        return (
                                          <Box
                                            key={ter.id}
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              if (!isLocked) {
                                                setSelectedTertiaryOption(ter.id); 
                                                finalizeTaxonomy(selectedSubOption, ter.id);
                                              }
                                            }}
                                            sx={{
                                              display: 'flex', alignItems: 'center', gap: 2,
                                              p: 2, borderRadius: '16px',
                                              cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                                              border: '1px solid',
                                              borderColor: isTerActive ? opt.color : 'rgba(255,255,255,0.15)',
                                              bgcolor: isTerActive ? alpha(opt.color, 0.25) : (isLocked ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.08)'),
                                              boxShadow: isTerActive ? `0 4px 20px ${alpha(opt.color, 0.3)}` : 'none',
                                              backdropFilter: 'blur(8px)',
                                              opacity: isLocked ? 0.6 : 1,
                                              '&:hover': !isLocked ? { bgcolor: isTerActive ? alpha(opt.color, 0.35) : 'rgba(255,255,255,0.15)', transform: 'translateY(-2px)' } : {}
                                            }}
                                          >
                                            <Box>
                                              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', mb: 0.25 }}>
                                                {ter.title} {isLocked && '🔒'}
                                              </Typography>
                                              {ter.desc && (
                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                  {ter.desc}
                                                </Typography>
                                              )}
                                              {isLocked && ter.minRank && (
                                                <Typography sx={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, mt: 0.5 }}>
                                                  Requires Rank {ter.minRank}
                                                </Typography>
                                              )}
                                              {isLocked && ter.reqAdmin && (
                                                <Typography sx={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, mt: 0.5 }}>
                                                  Admin Only
                                                </Typography>
                                              )}
                                            </Box>
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  </Box>
                                )}

                              </Box>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* ================================================================ */}
      {/* YOUR DRAFTS SECTION                                              */}
      {/* ================================================================ */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
          Your Drafts
        </Typography>

        {drafts.length === 0 ? (
          <Box sx={{ 
            p: 4, borderRadius: '20px', border: '2px dashed rgba(0,0,0,0.06)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)'
          }}>
            <Typography sx={{ fontWeight: 700, color: '#94a3b8', mb: 1 }}>No active drafts</Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Select a format above to start a new listing.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {drafts.map((draft) => {
              const opt = LISTING_OPTIONS.find(o => o.type === draft.category) || LISTING_OPTIONS[0];
              return (
                <Paper key={draft.id} elevation={0} sx={{
                  p: 2.5, borderRadius: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                  backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' },
                  flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                    <Box sx={{ 
                      width: 48, height: 48, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: opt.grad, color: '#fff', flexShrink: 0, boxShadow: `0 4px 12px ${alpha(opt.color, 0.3)}`
                    }}>
                      {opt.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip label={opt.title} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: alpha(opt.color, 0.1), color: opt.color }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FF416C', animation: 'pulseGlow 2s infinite' }} />
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#FF416C', letterSpacing: '0.05em' }}>IN PROGRESS</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.3, mb: 0.5 }}>
                        {draft.title || 'Untitled Listing'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                        Last edited {draft.lastEdited || 'recently'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                      <IconButton onClick={() => onDeleteDraft(draft.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                        <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                      <Button
                        variant="contained"
                        onClick={() => onEditDraft(draft.id)}
                        endIcon={<ArrowForwardArrow />}
                        sx={{
                          bgcolor: '#1e293b', color: '#fff', borderRadius: '12px', fontWeight: 700, px: 2, py: 1, textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          '&:hover': { bgcolor: '#0f172a' }
                        }}
                      >
                        Resume
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

    </Box>
  );
}
