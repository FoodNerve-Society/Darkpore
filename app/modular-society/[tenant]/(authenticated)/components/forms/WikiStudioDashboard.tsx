import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Paper, Chip, IconButton, alpha, Tooltip } from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Gavel as PolicyIcon,
  EmojiObjects as PlaybookIcon,
  Code as TechnicalIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  AutoAwesome as AutoAwesomeIcon,
  ContentPaste as ContentPasteIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

const ACCENT = "#10b981"; // Emerald
const ACCENT_DARK = "#059669";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const WIKI_START_OPTIONS = [
  {
    type: 'sop', title: "SOP", desc: "Standard Operating Procedure",
    icon: <MenuBookIcon sx={{ fontSize: 32 }} />, color: "#3b82f6", grad: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
  },
  {
    type: 'policy', title: "Policy", desc: "Governance & Regulations",
    icon: <PolicyIcon sx={{ fontSize: 32 }} />, color: "#ef4444", grad: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)"
  },
  {
    type: 'technical', title: "Technical Doc", desc: "System Architecture",
    icon: <TechnicalIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6", grad: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)"
  }
];

const WIKI_DOMAINS = [
  {
    id: 'platform_features', title: 'Platform Features', imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    subcategories: [
      { id: 'innovations', title: 'Innovations Hub', desc: 'Articles, Projects & Bounties', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80' },
      { id: 'workspace', title: 'Workspace Hub', desc: 'Jobs & Organizations', imageUrl: 'https://images.unsplash.com/photo-1516244799014-9988b0f02375?w=200&q=80' },
      { id: 'society', title: 'Modular Society', desc: 'Meet & Learn, Communities', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&q=80' }
    ]
  },
  {
    id: 'operations', title: 'Operations & Admin', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    subcategories: [
      { id: 'moderation', title: 'Moderation', desc: 'Content & User Policies', imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&q=80' },
      { id: 'finance', title: 'Finance & Escrow', desc: 'Paystack & Payments', imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&q=80' }
    ]
  },
  {
    id: 'engineering', title: 'Engineering', imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    subcategories: [
      { id: 'frontend', title: 'Frontend (UI/UX)', desc: 'Next.js & Material UI', imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&q=80' },
      { id: 'backend', title: 'Backend (Data)', desc: 'Firebase & Cloudflare', imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&q=80' }
    ]
  }
];

// Predefined templates for each type
const WIKI_TEMPLATES: Record<string, any[]> = {
  sop: [
    { id: `b-${Date.now()}-1`, type: 'HEADER', visibility: 'public', content: 'Objective & Scope', headerLevel: 2 },
    { id: `b-${Date.now()}-2`, type: 'CALLOUT', visibility: 'public', content: 'Prerequisites & Access: List required software or management approvals here.', calloutType: 'warning' },
    { id: `b-${Date.now()}-3`, type: 'CHECKLIST', visibility: 'public', content: '', checklistItems: [{ id: '1', text: 'Step 1', checked: false }, { id: '2', text: 'Step 2', checked: false }] },
    { id: `b-${Date.now()}-4`, type: 'PROMPT_BUILDER', visibility: 'public', content: 'Act as an expert...', variables: [{name: 'task', label: 'Task Name'}] },
    { id: `b-${Date.now()}-5`, type: 'CALLOUT', visibility: 'public', content: 'Edge Cases & Escalation: If X fails, escalate to Y.', calloutType: 'danger' }
  ],
  policy: [
    { id: `b-${Date.now()}-1`, type: 'HEADER', visibility: 'public', content: 'The Policy Mandate', headerLevel: 2 },
    { id: `b-${Date.now()}-2`, type: 'CALLOUT', visibility: 'public', content: 'Applicability: Define exactly who is bound by this policy.', calloutType: 'info' },
    { id: `b-${Date.now()}-3`, type: 'TEXT', visibility: 'public', content: 'Provide the detailed guidelines and rules here.' },
    { id: `b-${Date.now()}-4`, type: 'CALLOUT', visibility: 'public', content: 'Enforcement: State the consequences of violating this policy.', calloutType: 'danger' },
    { id: `b-${Date.now()}-5`, type: 'TEXT', visibility: 'internal_staff', content: 'Authority & Revision History: Owned by [Name], Last updated [Date].' }
  ],
  technical: [
    { id: `b-${Date.now()}-1`, type: 'HEADER', visibility: 'public', content: 'System Overview', headerLevel: 2 },
    { id: `b-${Date.now()}-2`, type: 'MEDIA', visibility: 'public', content: 'Upload Architecture Diagram here' },
    { id: `b-${Date.now()}-3`, type: 'TEXT', visibility: 'public', content: 'Explain data flows and external APIs.' },
    { id: `b-${Date.now()}-4`, type: 'CODE_SNIPPET', visibility: 'public', content: 'npm run deploy', codeLanguage: 'bash' },
    { id: `b-${Date.now()}-5`, type: 'PROMPT_BUILDER', visibility: 'public', content: 'Analyze the following error log for the system...', variables: [{name: 'error_log', label: 'Error Log'}] }
  ]
};

export default function WikiStudioDashboard({
  docs = [],
  onStartFresh,
  userName
}: {
  docs?: any[];
  onStartFresh: (type: string, taxonomy: any, templateBlocks?: any[]) => void;
  userName?: string;
}) {
  const [expandedStartType, setExpandedStartType] = useState<string | null>(null);

  // Accordion State
  const [activeAccordionIdx, setActiveAccordionIdx] = useState(0);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  // Fast Ingest State
  const [fastPayloadText, setFastPayloadText] = useState('');
  const [fastIngestError, setFastIngestError] = useState('');

  const accordionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeOption = WIKI_START_OPTIONS.find(o => o.type === expandedStartType);

  // Auto-cycle accordion when not locked
  useEffect(() => {
    if (!expandedStartType || categoryLocked) return;
    accordionTimerRef.current = setInterval(() => {
      setActiveAccordionIdx(prev => (prev + 1) % WIKI_DOMAINS.length);
    }, 3000);
    return () => {
      if (accordionTimerRef.current) clearInterval(accordionTimerRef.current);
    };
  }, [expandedStartType, categoryLocked]);

  const handleOpenCreator = (type: string) => {
    setExpandedStartType(type);
    setActiveAccordionIdx(0);
    setCategoryLocked(false);
    setShowSubcategories(false);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleClose = () => {
    setExpandedStartType(null);
    setCategoryLocked(false);
    setShowSubcategories(false);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleCategorySelect = useCallback((idx: number, catId: string) => {
    setActiveAccordionIdx(idx);
    setSelectedCategory(catId);
    setCategoryLocked(true);
    setSelectedSubcategory('');
    if (accordionTimerRef.current) clearInterval(accordionTimerRef.current);
    setTimeout(() => setShowSubcategories(true), 50);
  }, []);

  const handleResetCategory = useCallback(() => {
    setCategoryLocked(false);
    setShowSubcategories(false);
    setSelectedSubcategory('');
    setSelectedCategory('');
  }, []);

  const finalizeTaxonomy = (clearanceLevel: string) => {
    const defaultBlocks = WIKI_TEMPLATES[expandedStartType as string] || [];
    onStartFresh(expandedStartType as string, {
      category: selectedCategory, // Maps to 'operations', 'playbooks', 'academy'
      subcategory: selectedSubcategory,
      clearance: clearanceLevel
    }, defaultBlocks);
  };

  const handleFastIngest = () => {
    setFastIngestError('');
    if (!fastPayloadText.trim()) return;
    try {
      const parsed = JSON.parse(fastPayloadText);
      if (!parsed || !Array.isArray(parsed)) {
        throw new Error("Payload must be a JSON array of WikiBlock objects.");
      }
      
      // Fast ingest assumes we just want to load blocks instantly for an SOP in 'operations'
      onStartFresh('sop', { category: 'operations', subcategory: '', clearance: 'public' }, parsed);
    } catch (e: any) {
      setFastIngestError(e.message || "Invalid JSON payload.");
    }
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
        <Typography variant="h3" sx={{ fontFamily: 'Caveat, cursive', color: ACCENT, mb: 0.5, fontSize: { xs: '1.4rem', sm: '2.5rem', md: '3rem' } }}>
          Good {greeting}, {userName || 'Creator'}.
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 1.5, color: '#1e293b', fontSize: { xs: '1.1rem', sm: '1.75rem', md: '2.125rem' } }}>
          Welcome to the Omni-Wiki Studio
        </Typography>
        <Chip
          label={`${docs.length} active document${docs.length !== 1 ? 's' : ''} in your workspace`}
          size="small"
          sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: 'text.secondary', fontWeight: 600, borderRadius: '8px' }}
        />
      </Box>

      {/* FAST INGEST SECTION */}
      {(() => {
        let parsedPreview: any = null;
        let parseStatus: 'empty' | 'valid' | 'invalid' = 'empty';
        if (fastPayloadText.trim()) {
          try {
            parsedPreview = JSON.parse(fastPayloadText);
            parseStatus = (Array.isArray(parsedPreview)) ? 'valid' : 'invalid';
          } catch { parseStatus = 'invalid'; }
        }
        const blockCount = Array.isArray(parsedPreview) ? parsedPreview.length : 0;

        return (
          <Box sx={{ mb: 5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: ACCENT }} /> Fast Block Ingest
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: '16px', overflow: 'hidden',
                border: parseStatus === 'valid' ? `1.5px solid ${alpha(ACCENT, 0.5)}` : parseStatus === 'invalid' ? '1.5px solid rgba(239,68,68,0.4)' : '1px solid rgba(0,0,0,0.06)',
                bgcolor: '#0f172a',
                transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                boxShadow: parseStatus === 'valid' ? `0 0 24px ${alpha(ACCENT, 0.12)}, 0 4px 20px rgba(0,0,0,0.15)` : '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.2, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: parseStatus === 'invalid' ? '#ef4444' : 'rgba(255,255,255,0.15)' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: parseStatus === 'valid' ? '#22c55e' : 'rgba(255,255,255,0.15)' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: parseStatus === 'valid' ? ACCENT : 'rgba(255,255,255,0.15)' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', fontSize: '0.7rem', ml: 1 }}>
                      blocks.json
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Paste JSON payload">
                      <IconButton 
                        size="small" 
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            setFastPayloadText(text);
                            setFastIngestError('');
                          } catch (err) {}
                        }}
                        sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                      >
                        <ContentPasteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {parseStatus === 'valid' && <Chip label="Valid JSON Array" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: '6px' }} />}
                    {parseStatus === 'invalid' && <Chip label="Invalid JSON" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(239,68,68,0.15)', color: '#ef4444', borderRadius: '6px' }} />}
                  </Box>
                </Box>
                <textarea
                  placeholder='[\n  { "type": "TEXT", "content": "..." }\n]'
                  value={fastPayloadText}
                  onChange={(e) => { setFastPayloadText(e.target.value); setFastIngestError(''); }}
                  style={{ width: '100%', minHeight: '120px', maxHeight: '300px', backgroundColor: 'transparent', color: '#e2e8f0', border: 'none', padding: '16px 20px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.82rem', lineHeight: 1.7, resize: 'vertical', outline: 'none' }}
                />
              </Box>
              {parseStatus === 'valid' && blockCount > 0 && (
                <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 1.5, animation: `${slideUpFade} 0.3s ease` }}>
                  <Chip label={`${blockCount} block${blockCount !== 1 ? 's' : ''}`} size="small" sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600, bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px' }} />
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#ef4444', fontSize: '0.72rem' }}>{fastIngestError}</Typography>
                <Box 
                  onClick={handleFastIngest}
                  sx={{ px: 3, py: 0.9, bgcolor: parseStatus === 'valid' ? ACCENT : 'rgba(255,255,255,0.08)', color: parseStatus === 'valid' ? '#fff' : 'rgba(255,255,255,0.3)', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: parseStatus === 'valid' ? 'pointer' : 'default', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: 1, pointerEvents: parseStatus === 'valid' ? 'auto' : 'none', '&:hover': parseStatus === 'valid' ? { bgcolor: ACCENT_DARK, transform: 'translateY(-1px)' } : {} }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 16 }} /> Ingest & Edit
                </Box>
              </Box>
            </Paper>
          </Box>
        );
      })()}

      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
        Start Fresh
      </Typography>

      <Box sx={{
        display: 'flex', gap: expandedStartType ? 0 : 3, overflowX: expandedStartType ? 'visible' : 'auto', pt: 1, pb: expandedStartType ? 0 : 5, mb: 2,
        '&::-webkit-scrollbar': { height: 0 }, px: expandedStartType ? 0 : 0.5, mx: expandedStartType ? 0 : -0.5,
        transition: 'gap 0.4s ease, padding 0.4s ease, margin 0.4s ease'
      }}>
        {WIKI_START_OPTIONS.map((opt) => {
          const isExpanded = expandedStartType === opt.type;
          const isHidden = expandedStartType !== null && expandedStartType !== opt.type;

          return (
            <Paper
              key={opt.type}
              onClick={() => { if (!expandedStartType) handleOpenCreator(opt.type); }}
              elevation={0}
              sx={{
                flex: isHidden ? '0 0 0%' : (isExpanded ? '0 0 100%' : '0 0 auto'),
                minWidth: isHidden ? 0 : (isExpanded ? '100%' : { xs: 140, sm: 240, md: 280 }),
                maxWidth: isHidden ? 0 : (isExpanded ? '100%' : { xs: 140, sm: 240, md: 280 }),
                height: isExpanded ? 'auto' : (isHidden ? 0 : { xs: 160, sm: 280, md: 320 }),
                opacity: isHidden ? 0 : 1, p: isExpanded ? 0 : (isHidden ? 0 : { xs: 1.5, sm: 2.5, md: 3.5 }),
                display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5, md: 2 },
                borderRadius: { xs: '16px', sm: '24px', md: '28px' }, cursor: isExpanded ? 'default' : 'pointer',
                background: isExpanded ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` : opt.grad,
                border: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isHidden ? 'none' : `inset 0 2px 10px rgba(255,255,255,0.2), 0 10px 30px ${alpha(opt.color, 0.25)}`,
                position: 'relative', overflow: 'hidden', transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': !isExpanded ? { transform: 'translateY(-8px) scale(1.02)', boxShadow: `inset 0 2px 10px rgba(255,255,255,0.3), 0 24px 48px ${alpha(opt.color, 0.4)}`, borderColor: 'rgba(255,255,255,0.3)', '& .sf-icon': { transform: 'scale(1.1) rotate(-5deg)', bgcolor: 'rgba(255,255,255,0.3)' } } : {}
              }}
            >
              {!isExpanded ? (
                <>
                  <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.12, transform: 'scale(4)', pointerEvents: 'none', color: '#fff' }}>{opt.icon}</Box>
                  <Box className="sf-icon" sx={{ p: { xs: 1, sm: 1.5 }, borderRadius: { xs: '12px', sm: '18px' }, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', width: 'fit-content', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>{opt.icon}</Box>
                  <Box sx={{ position: 'relative', zIndex: 1, mt: { xs: 0, sm: 1 } }}>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.85rem', sm: '1.2rem' }, mb: 0.25, color: '#fff', letterSpacing: '-0.02em' }}>{opt.title}</Typography>
                    <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.85rem' }, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, fontWeight: 500 }}>{opt.desc}</Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ p: { xs: 2.5, sm: 4 }, width: '100%', height: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                      <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}>{opt.icon}</Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.75rem', sm: '0.85rem' }, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{opt.title} Setup</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', mt: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Which domain does this cover?</Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Minimize">
                      <IconButton onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(0,0,0,0.3)', color: '#fff' } }}><MinimizeIcon /></IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', minHeight: { xs: 400, md: 450 }, height: categoryLocked ? 'auto' : { xs: 400, md: 450 }, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.4)', transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)', position: 'relative' }}>
                    {WIKI_DOMAINS.map((chal: any, idx: number) => {
                      const isActive = activeAccordionIdx === idx;
                      const isLocked = categoryLocked && isActive;
                      const isHidden = categoryLocked && !isActive;
                      return (
                        <Box
                          key={chal.id}
                          onClick={() => { if (!categoryLocked) { handleCategorySelect(idx, chal.id); } else if (isLocked && !selectedSubcategory) { handleResetCategory(); } }}
                          sx={{ display: 'flex', flexDirection: 'column', position: 'relative', flex: isHidden ? '0 0 0%' : isActive ? (categoryLocked ? '0 0 100%' : '0 0 45%') : '1 1 0%', minWidth: isHidden ? 0 : (isActive ? undefined : 0), overflow: 'hidden', cursor: 'pointer', transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)', opacity: isHidden ? 0 : 1, '&:not(:last-child)': { borderRight: { xs: 'none', md: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)' }, borderBottom: { xs: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)', md: 'none' } }, '&:hover': !categoryLocked ? { flex: '0 0 50%' } : {} }}
                        >
                          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${chal.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.6s ease', transform: isActive ? 'scale(1.05)' : 'scale(1.15)' }} />
                          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: isActive ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)' : 'rgba(0,0,0,0.55)', transition: 'background 0.4s' }} />
                          
                          <Box sx={{ position: 'absolute', bottom: categoryLocked && isLocked ? 'auto' : 20, top: categoryLocked && isLocked ? 20 : 'auto', left: 20, right: 20, zIndex: 5, transition: 'all 0.4s' }}>
                            {categoryLocked && isLocked ? (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', p: 1, ml: -1, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '100%', overflowX: 'auto', whiteSpace: 'nowrap', '&::-webkit-scrollbar': { display: 'none' } }}>
                                <Box onClick={(e) => { e.stopPropagation(); handleResetCategory(); }} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 }, transition: 'opacity 0.2s' }}>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Domains</Typography>
                                </Box>
                                <Typography sx={{ color: 'rgba(255,255,255,0.3)', mx: 1, fontSize: '0.8rem' }}>/</Typography>
                                <Typography onClick={(e) => { e.stopPropagation(); setSelectedSubcategory(''); }} sx={{ color: selectedSubcategory ? 'rgba(255,255,255,0.7)' : '#fff', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: selectedSubcategory ? 'pointer' : 'default', '&:hover': selectedSubcategory ? { opacity: 0.7 } : {}, transition: 'opacity 0.2s' }}>
                                  {chal.title}
                                </Typography>
                                {selectedSubcategory && (
                                  <>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', mx: 1, fontSize: '0.8rem' }}>/</Typography>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{chal.subcategories?.find((s: any) => s.id === selectedSubcategory)?.title || 'Subcategory'}</Typography>
                                  </>
                                )}
                              </Box>
                            ) : (
                              <Box>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: isActive ? '1.4rem' : '1rem', letterSpacing: '-0.01em', lineHeight: 1.2, transition: 'font-size 0.4s', textShadow: '0 2px 8px rgba(0,0,0,0.5)', whiteSpace: isActive ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chal.title}</Typography>
                                {isActive && !categoryLocked && <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', mt: 0.5, fontWeight: 600 }}>Tap to select</Typography>}
                              </Box>
                            )}
                          </Box>

                          {/* GLASSMORPHIC REVEAL */}
                          {isLocked && showSubcategories && (
                            <Box onClick={(e) => e.stopPropagation()} sx={{ position: 'relative', mt: { xs: 8, md: 9 }, flex: 'none', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', zIndex: 10, animation: `${slideUpFade} 0.6s cubic-bezier(0.16, 1, 0.3, 1)`, overflow: 'hidden', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', borderTopLeftRadius: { xs: 0, md: '24px' }, borderTopRightRadius: { xs: 0, md: '24px' }, mx: { xs: 0, md: 2 }, mb: { xs: 0, md: 2 }, boxShadow: '0 -4px 24px rgba(0,0,0,0.2)' }}>
                              <Box sx={{ display: 'flex', width: '200%', height: 'auto', transform: selectedSubcategory ? 'translateX(-50%)' : 'translateX(0)', transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                                
                                {/* VIEW 1: SUBCATEGORIES */}
                                <Box sx={{ width: '50%', height: 'auto', p: 4, pb: 4 }}>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>Select Tag</Typography>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, pb: 2 }}>
                                    {chal.subcategories?.map((sub: any) => {
                                      const isSubActive = selectedSubcategory === sub.id;
                                      return (
                                        <Box
                                          key={sub.id}
                                          onClick={(e) => { e.stopPropagation(); setSelectedSubcategory(sub.id); }}
                                          sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid', borderColor: isSubActive ? activeOption!.color : 'rgba(255,255,255,0.15)', bgcolor: isSubActive ? alpha(activeOption!.color, 0.25) : 'rgba(255,255,255,0.08)', boxShadow: isSubActive ? `0 4px 20px ${alpha(activeOption!.color, 0.3)}` : 'none', backdropFilter: 'blur(8px)', '&:hover': { bgcolor: isSubActive ? alpha(activeOption!.color, 0.35) : 'rgba(255,255,255,0.15)', transform: 'translateY(-2px)' } }}
                                        >
                                          <Box sx={{ width: 48, height: 48, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, backgroundImage: `url(${sub.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.1)' }} />
                                          <Box>
                                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', mb: 0.25 }}>{sub.title}</Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 500 }}>{sub.desc}</Typography>
                                          </Box>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>

                                {/* VIEW 2: CLEARANCE */}
                                <Box sx={{ width: '50%', height: 'auto', p: 4, pb: 4, display: 'flex', flexDirection: 'column' }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.01em' }}>What is the clearance level?</Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', mt: 0.5 }}>Set the base visibility for this document.</Typography>
                                  </Box>

                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', maxWidth: 500, mx: 'auto' }}>
                                    {[
                                      { key: 'public', emoji: '🌍', label: 'Public Open Source', desc: 'Anyone can view this.', color: '#3b82f6' },
                                      { key: 'internal_staff', emoji: '🔒', label: 'Internal Staff', desc: 'Restricted to internal authenticated members.', color: '#10b981' },
                                      { key: 'admin', emoji: '🛡️', label: 'Admin Only', desc: 'Top secret. Super Admins only.', color: '#ef4444' },
                                    ].map(tf => (
                                      <Box
                                        key={tf.key}
                                        onClick={(e) => { e.stopPropagation(); finalizeTaxonomy(tf.key); }}
                                        sx={{ display: 'flex', alignItems: 'center', p: 3, borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', '&:hover': { background: alpha(tf.color, 0.15), borderColor: tf.color, transform: 'translateY(-2px)' } }}
                                      >
                                        <Typography sx={{ fontSize: '2rem', mr: 3 }}>{tf.emoji}</Typography>
                                        <Box>
                                          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{tf.label}</Typography>
                                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{tf.desc}</Typography>
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
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
    </Box>
  );
}
