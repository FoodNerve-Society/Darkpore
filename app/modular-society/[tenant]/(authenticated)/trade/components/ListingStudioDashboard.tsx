"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  AutoAwesome as AutoAwesomeIcon,
  ContentPaste as ContentPasteIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import WikiHotspot from '@/components/wiki/WikiHotspot';
import { ECOSYSTEM_EVENT_TYPES } from '@/lib/config/eventTypes';
import WorkspaceContentManager from '@/app/components/studio/WorkspaceContentManager';

const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";

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
  userName,
  drafts = [],
  workspaceTabs = [],
  onStartFresh,
  onEditDraft,
  onDeleteDraft,
}: {
  userName?: string;
  drafts?: any[];
  workspaceTabs?: any[];
  onStartFresh: (type: string, selections?: any, fastIngestData?: any) => void;
  onEditDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
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

  const router = useRouter();
  const params = useParams();
  const tenant = (params?.tenant as string) || 'food';

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={`${drafts.length} active draft${drafts.length !== 1 ? 's' : ''} in your workspace`}
            size="small"
            sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: 'text.secondary', fontWeight: 600, borderRadius: '8px' }}
          />
          {profile?.organizations && profile.organizations.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => router.push(`/modular-society/${tenant}/profile?tab=talent`)}
              startIcon={<PeopleIcon sx={{ color: '#3b82f6' }} />}
              sx={{
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.78rem',
                borderColor: '#cbd5e1',
                color: '#0f172a',
                py: 0.3,
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)', borderColor: '#3b82f6' },
              }}
            >
              Review Org Applicant Ledger
            </Button>
          )}
        </Box>
      </Box>

      {/* ================================================================ */}
      {/* 1. FAST INGEST AI BAR (TOP COMPULSORY)                           */}
      {/* ================================================================ */}
      {(() => {
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
            const normalize = (v: any) => (Array.isArray(v) ? v[0] : v);

            const rawCat = parsedPreview.taxonomy?.category || parsedPreview.category || 'jobs';
            const category = normalize(rawCat);

            let selections = undefined;
            if (parsedPreview.taxonomy) {
              selections = {
                primary: normalize(parsedPreview.taxonomy.primary),
                secondary: normalize(parsedPreview.taxonomy.secondary),
                tertiary: normalize(parsedPreview.taxonomy.tertiary)
              };
            }
            const formPayload = parsedPreview.payload || parsedPreview;
            if (selections?.tertiary && !formPayload.tertiary) {
              formPayload.tertiary = selections.tertiary;
            }
            onStartFresh(category, selections, formPayload);
          } catch (e: any) {
            setFastIngestError(e.message || "Invalid JSON payload.");
          }
        };

        const handlePasteClipboard = async () => {
          try {
            const text = await navigator.clipboard.readText();
            setFastPayloadText(text);
            setFastIngestError('');
          } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
          }
        };

        return (
          <Box sx={{ mb: 5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: "#10b981" }} /> Fast Ingest Payload (Paste AI JSON)
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: '20px', 
                overflow: 'hidden',
                border: parseStatus === 'valid' 
                  ? `1.5px solid ${alpha("#10b981", 0.5)}` 
                  : parseStatus === 'invalid' 
                    ? '1.5px solid rgba(239,68,68,0.4)' 
                    : '1px solid rgba(0,0,0,0.08)',
                bgcolor: '#0f172a',
                transition: 'all 0.4s ease',
                boxShadow: parseStatus === 'valid' 
                  ? `0 0 24px ${alpha("#10b981", 0.15)}, 0 8px 32px rgba(0,0,0,0.2)` 
                  : '0 8px 32px rgba(0,0,0,0.12)',
              }}
            >
              <Box sx={{ position: 'relative' }}>
                {/* Header Bar with 1-Tap Paste Button */}
                <Box sx={{ 
                  display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1.5,
                  px: { xs: 1.5, sm: 2.5 }, py: 1.5, 
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: parseStatus === 'invalid' ? '#ef4444' : 'rgba(255,255,255,0.15)' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: parseStatus === 'valid' ? '#22c55e' : 'rgba(255,255,255,0.15)' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: parseStatus === 'valid' ? "#10b981" : 'rgba(255,255,255,0.15)' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}>
                      payload.json
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' }, overflowX: 'auto', pb: { xs: 0.5, sm: 0 }, '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Button
                      size="small"
                      startIcon={<ContentPasteIcon sx={{ fontSize: 16 }} />}
                      onClick={handlePasteClipboard}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '10px',
                        textTransform: 'none',
                        px: 2, py: 0.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'translateY(-1px)' },
                        transition: 'all 0.2s'
                      }}
                    >
                      Paste Clipboard JSON
                    </Button>

                    {parseStatus === 'valid' && (
                      <Chip label="Valid Payload" size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: '6px' }} />
                    )}
                    {parseStatus === 'invalid' && (
                      <Chip label="Invalid Payload" size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(239,68,68,0.15)', color: '#ef4444', borderRadius: '6px' }} />
                    )}
                  </Box>
                </Box>

                <textarea
                  placeholder='{\n  "title": "Precision Agriculture Specialist",\n  "category": "jobs",\n  ...\n}'
                  value={fastPayloadText}
                  onChange={(e) => { setFastPayloadText(e.target.value); setFastIngestError(''); }}
                  style={{
                    width: '100%',
                    minHeight: '110px',
                    maxHeight: '260px',
                    backgroundColor: 'transparent',
                    color: '#e2e8f0',
                    border: 'none',
                    padding: '16px 20px',
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontSize: '0.82rem',
                    lineHeight: 1.7,
                    resize: 'vertical',
                    outline: 'none',
                    caretColor: "#10b981",
                  }}
                />
              </Box>

              {/* Action Bar */}
              <Box sx={{ 
                display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1.5,
                px: { xs: 1.5, sm: 2.5 }, py: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#ef4444', fontSize: '0.72rem' }}>
                  {fastIngestError}
                </Typography>
                <Box 
                  onClick={handleFastIngest}
                  sx={{ 
                    px: 3, py: 0.9, 
                    bgcolor: parseStatus === 'valid' ? "#10b981" : 'rgba(255,255,255,0.08)',
                    color: parseStatus === 'valid' ? '#fff' : 'rgba(255,255,255,0.3)',
                    borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem',
                    cursor: parseStatus === 'valid' ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                    display: 'flex', alignItems: 'center', gap: 1,
                    pointerEvents: parseStatus === 'valid' ? 'auto' : 'none',
                    '&:hover': parseStatus === 'valid' ? { bgcolor: "#059669", transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${alpha("#10b981", 0.4)}` } : {}
                  }}
                >
                  Parse & Start Listing <ArrowForwardArrow fontSize="small" sx={{ ml: 0.5 }} />
                </Box>
              </Box>
            </Paper>
          </Box>
        );
      })()}

      {/* ================================================================ */}
      {/* 2. START FRESH FORMAT CARDS (MIDDLE)                             */}
      {/* ================================================================ */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
        Start Fresh (Format Pickers)
      </Typography>
      <Box sx={{
        display: 'flex', 
        gap: expandedStartType ? 0 : 3, 
        overflowX: expandedStartType ? 'visible' : 'auto', 
        pt: 1, pb: expandedStartType ? 0 : 4, mb: 4,
        '&::-webkit-scrollbar': { height: 0 }, 
        px: expandedStartType ? 0 : 0.5, 
        mx: expandedStartType ? 0 : -0.5,
        transition: 'gap 0.4s ease, padding 0.4s ease, margin 0.4s ease'
      }}>
        {LISTING_OPTIONS.map((opt) => {
          const config = ECOSYSTEM_EVENT_TYPES.find(t => t.id === opt.type && t.tab === 'trade');
          const isActive = config?.isActive;
          const isExpanded = expandedStartType === opt.type;
          const isHidden = expandedStartType !== null && expandedStartType !== opt.type;

          return (
            <Paper
              key={opt.type}
              onClick={() => {
                if (isActive && !expandedStartType) handleOpenCreator(opt.type);
              }}
              elevation={0}
              sx={{
                flex: isHidden ? '0 0 0%' : (isExpanded ? '0 0 100%' : '0 0 auto'),
                minWidth: isHidden ? 0 : (isExpanded ? '100%' : { xs: 150, sm: 260, md: 300 }),
                maxWidth: isHidden ? 0 : (isExpanded ? '100%' : { xs: 150, sm: 260, md: 300 }),
                height: isExpanded ? 'auto' : (isHidden ? 0 : { xs: 170, sm: 290, md: 340 }),
                opacity: isHidden ? 0 : (isActive ? 1 : 0.65),
                filter: isActive ? 'none' : 'grayscale(0.8)',
                p: isExpanded ? 0 : (isHidden ? 0 : { xs: 1.5, sm: 2.5, md: 3.5 }),
                display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5, md: 2 },
                borderRadius: { xs: '16px', sm: '24px', md: '28px' }, 
                cursor: isExpanded ? 'default' : (isActive ? 'pointer' : 'not-allowed'),
                background: isExpanded ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` : opt.grad,
                border: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isHidden ? 'none' : `inset 0 2px 10px rgba(255,255,255,0.2), 0 10px 30px ${alpha(opt.color, 0.25)}`,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': !isExpanded && isActive ? {
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box className="sf-icon" sx={{
                      p: { xs: 1, sm: 1.5 }, borderRadius: { xs: '12px', sm: '18px' }, bgcolor: 'rgba(255,255,255,0.18)',
                      color: '#fff', width: 'fit-content',
                      backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)',
                      transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}>
                      {opt.icon}
                    </Box>
                    <Box sx={{ position: 'relative', zIndex: 10 }}>
                      <WikiHotspot id={`trade-start-fresh-${opt.type}`} label={opt.title} />
                    </Box>
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1, mt: { xs: 0, sm: 1 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.85rem', sm: '1.25rem' }, mb: 0.25, color: '#fff', letterSpacing: '-0.02em' }}>
                        {opt.title}
                      </Typography>
                      {!isActive && (
                        <Chip 
                          label="Coming Soon" 
                          size="small" 
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(0,0,0,0.4)', color: '#fff' }} 
                        />
                      )}
                    </Box>
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
      {/* 3. BOTTOM SECTION: WORKSPACE CONTENT MANAGER                     */}
      {/* ================================================================ */}
      {workspaceTabs && (
        <Box sx={{ width: '100%', mt: 4 }}>
          <WorkspaceContentManager
            tabs={workspaceTabs}
            colorTheme={EMERALD}
            onEdit={onEditDraft}
            onDelete={onDeleteDraft}
          />
        </Box>
      )}
    </Box>
  );
}

