'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
  Alert,
  alpha,
  Divider,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import { motion, AnimatePresence } from 'framer-motion';

export interface LivestreamRundownSegment {
  time: string;
  role: string;
  desc: string;
  speakerNotes?: string;
}

export interface LivestreamIdeaOption {
  id: string;
  typeTitle: string;
  typeIcon: string;
  timeframe: 'past' | 'present' | 'future';
  eraBadge: string;
  eraColor: string;
  category?: string;
  title: string;
  description: string;
  hook: string;
  timelinePillars: LivestreamRundownSegment[];
  keyQuestions?: string[];
  suggestedJobsFocus?: string;
}

interface LivestreamIdeasSidePaneProps {
  open: boolean;
  onClose: () => void;
  hubTitle?: string;
  hubColor?: string;
  currentCategory?: string;
  guidingArticles?: Array<{ id: string; title: string; description?: string; [key: string]: any }>;
  guidingJobs?: Array<{ id: string; title: string; compensationOrTarget?: string; organizationChallenges?: string; [key: string]: any }>;
  guidingListings?: Array<{ id: string; title: string; [key: string]: any }>;
  onApplyIdea: (idea: {
    title: string;
    description: string;
    timeframe: 'past' | 'present' | 'future';
    category?: string;
    blocks?: any[];
  }) => void;
}

/**
 * Parses raw text containing livestream blueprint payloads.
 */
function parseLivestreamPayload(rawText: string, fallbackHub: string, fallbackCategory: string): LivestreamIdeaOption[] {
  if (!rawText || !rawText.trim()) return [];

  const results: LivestreamIdeaOption[] = [];
  const normalized = rawText.replace(/\r\n/g, '\n');
  const sections = normalized.split(/(?:---|\n(?=###?\s*(?:Blueprint|Livestream|Format|\d+\.)))/i).map(s => s.trim()).filter(Boolean);

  sections.forEach((sec, idx) => {
    const titleMatch = sec.match(/###?\s*(?:Blueprint\s*\d*[:.-]?\s*)?([^\n\r]+)/i) ||
                       sec.match(/[*•-]?\s*\*?\*?Title\*?\*?:\s*([^\n\r*]+)/i);
    const title = titleMatch ? titleMatch[1].replace(/[*_`]/g, '').trim() : '';

    const eraMatch = sec.match(/[*•-]?\s*\*?\*?(?:Era|Timeframe)\*?\*?:\s*([^\n\r*]+)/i);
    const rawEra = eraMatch ? eraMatch[1].toLowerCase().trim() : 'present';
    const timeframe: 'past' | 'present' | 'future' = rawEra.includes('past') ? 'past' : (rawEra.includes('future') ? 'future' : 'present');

    const catMatch = sec.match(/[*•-]?\s*\*?\*?Category\*?\*?:\s*([^\n\r*]+)/i);
    const category = catMatch ? catMatch[1].replace(/[*_`]/g, '').trim().toLowerCase() : fallbackCategory;

    const descMatch = sec.match(/[*•-]?\s*\*?\*?Description\*?\*?:([\s\S]*?)(?=(?:[*•-]?\s*\*?\*?(?:Hook|Rundown|Segments|Key Questions|---)|$))/i);
    const description = descMatch ? descMatch[1].replace(/[*_`]/g, '').trim() : `Comprehensive live panel on ${title || fallbackHub}.`;

    const hookMatch = sec.match(/[*•-]?\s*\*?\*?(?:Hook|Angle|Core Debate)\*?\*?:\s*([^\n\r*]+)/i);
    const hook = hookMatch ? hookMatch[1].replace(/[*_`]/g, '').trim() : `Unpack the structural mechanics behind ${title || fallbackHub}.`;

    // Parse rundown / segments
    const segments: LivestreamRundownSegment[] = [];
    const rundownMatch = sec.match(/[*•-]?\s*\*?\*?(?:Rundown|Segments|Framework)\*?\*?:([\s\S]*?)(?=(?:[*•-]?\s*\*?\*?(?:Key Questions|Questions|---)|$))/i);
    if (rundownMatch) {
      const segLines = rundownMatch[1].split('\n').filter(l => l.trim().length > 0);
      segLines.forEach((line) => {
        const timeMatch = line.match(/(?:~?\d+[-–]\d+m|\d+m|Segment \d+|Part \d+)/i);
        const time = timeMatch ? timeMatch[0] : '~15m';
        const cleanLine = line.replace(/^[\s*•-]+/, '').replace(time, '').replace(/^[:\s-]+/, '').trim();
        const parts = cleanLine.split(/[-–:]/);
        const role = parts[0]?.trim() || 'Key Segment';
        const desc = parts.slice(1).join(' - ').trim() || role;
        if (role) {
          segments.push({ time, role, desc });
        }
      });
    }

    if (segments.length === 0) {
      segments.push(
        { time: '00-15m', role: 'Intro: The Disconnect', desc: 'Framing the immediate operational bottleneck' },
        { time: '15-35m', role: 'Deep Dive: Field Reality', desc: 'Case study analysis and live stakeholder discussion' },
        { time: '35-50m', role: 'Actionable Takeaways & Next Steps', desc: 'Practical calls to action and verified opportunities' }
      );
    }

    const questionsMatch = sec.match(/[*•-]?\s*\*?\*?(?:Key Questions|Discussion Points)\*?\*?:([\s\S]*?)(?:---|$)/i);
    const keyQuestions: string[] = [];
    if (questionsMatch) {
      questionsMatch[1].split('\n').forEach(q => {
        const cleanQ = q.replace(/^[\s*•\d.-]+/, '').trim();
        if (cleanQ.length > 5) keyQuestions.push(cleanQ);
      });
    }

    const eraConfigMap: Record<string, { badge: string; color: string; icon: string }> = {
      present: { badge: '⚡ Present Era', color: '#10b981', icon: '⚡' },
      future: { badge: '🚀 Future Era', color: '#8b5cf6', icon: '🚀' },
      past: { badge: '📜 Past Era', color: '#6366f1', icon: '📜' },
    };

    if (title) {
      results.push({
        id: `custom-idea-${idx}-${Date.now()}`,
        typeTitle: `${timeframe.toUpperCase()} Blueprint`,
        typeIcon: eraConfigMap[timeframe]?.icon || '🎙️',
        timeframe,
        eraBadge: eraConfigMap[timeframe]?.badge || '⚡ Present Era',
        eraColor: eraConfigMap[timeframe]?.color || '#10b981',
        category,
        title,
        description,
        hook,
        timelinePillars: segments,
        keyQuestions: keyQuestions.length > 0 ? keyQuestions : undefined,
      });
    }
  });

  return results;
}

export default function LivestreamIdeasSidePane({
  open,
  onClose,
  hubTitle = 'Production & Capital',
  hubColor = '#10b981',
  currentCategory = 'capital',
  guidingArticles = [],
  onApplyIdea,
}: LivestreamIdeasSidePaneProps) {
  const defaultTopic = useMemo(() => {
    if (guidingArticles.length > 0) {
      return `${guidingArticles[0].title} — ${hubTitle}`;
    }
    return `${hubTitle} Value Chain & Field Solutions`;
  }, [guidingArticles, hubTitle]);

  const [topicInput, setTopicInput] = useState(defaultTopic);
  const [targetAudience, setTargetAudience] = useState('Farmgate Producers, Commercial Offtakers & Allocators');
  const [targetLocation, setTargetLocation] = useState('Dawanau Hub, Kano & Bodija Cluster, Ibadan');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [copiedPromptTab, setCopiedPromptTab] = useState<string | null>(null);

  // Ingest state
  const [customIngestMarkdown, setCustomIngestMarkdown] = useState('');
  const [customIngestError, setCustomIngestError] = useState('');
  const [deckActiveIndex, setDeckActiveIndex] = useState(0);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPromptText = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptTab(tabKey);
    setTimeout(() => setCopiedPromptTab(null), 3000);
  };

  // Pre-configured default 4 blueprints
  const defaultIdeas: LivestreamIdeaOption[] = useMemo(() => {
    const cleanTopic = (topicInput.trim() || defaultTopic).replace(/—.*$/, '').trim();

    return [
      {
        id: 'town-hall',
        typeTitle: 'Groundwork Town Hall & Field Deep-Dive',
        typeIcon: '🎙️',
        timeframe: 'present',
        eraBadge: '⚡ Present Era',
        eraColor: '#10b981',
        category: currentCategory,
        title: `${cleanTopic}: Farmgate Reality & Producer Town Hall`,
        description: `An interactive live town hall addressing immediate farmgate bottlenecks, aggregation logistics, and actionable producer takeaways.`,
        hook: `Connect directly with local producers and operators to uncover what is actually happening in the field today.`,
        timelinePillars: [
          { time: '00-15m', role: 'Field Data & Problem Spotlight', desc: 'Current cluster metrics and farmgate bottlenecks' },
          { time: '15-35m', role: 'Live Stakeholder Interview', desc: 'Deep dive with cooperative leaders and input suppliers' },
          { time: '35-50m', role: 'Interactive Q&A & Role Attachments', desc: 'Open audience questions with verified job opportunities' },
        ],
        keyQuestions: [
          'What is the real cash-to-farmgate spread this harvest?',
          'How are aggregator cooperatives handling diesel & storage costs?',
          'What immediate capital solutions can farmers access before next planting?'
        ],
      },
      {
        id: 'offtake-pitch',
        typeTitle: 'Market Disconnect & Offtake Pitchroom',
        typeIcon: '⚡',
        timeframe: 'present',
        eraBadge: '⚡ Present Era',
        eraColor: '#f59e0b',
        category: currentCategory,
        title: `${cleanTopic}: Offtake Contracts & Trade Escrow Live`,
        description: `Matching verified commercial processors with organized farmer clusters to eliminate middlemen friction and secure volume contracts.`,
        hook: `Bridge the gap between off-taker quality specs and smallholder field deliveries in real-time.`,
        timelinePillars: [
          { time: '00-15m', role: 'Contract Parameters & Pricing Index', desc: 'Transparency on off-taker moisture & purity benchmarks' },
          { time: '15-35m', role: 'Live Cluster Negotiations', desc: 'Producer clusters pitch available metric tons and harvest dates' },
          { time: '35-50m', role: 'Deal Room Escrow Activation', desc: 'Formalizing letters of intent and Paystack escrow commitments' },
        ],
        keyQuestions: [
          'Why are standard off-taker specs rejected by 40% of smallholders?',
          'How does structured digital escrow protect both buyer and cluster?',
        ],
      },
      {
        id: 'future-harvest',
        typeTitle: 'Future Harvest & Mechanization Showcase',
        typeIcon: '🚀',
        timeframe: 'future',
        eraBadge: '🚀 Future Era',
        eraColor: '#8b5cf6',
        category: currentCategory,
        title: `${cleanTopic}: 2030 Mechanization & Technology Horizon`,
        description: `Explore the next frontier of climate-resilient inputs, automated processing, and digital infrastructure reshaping this value chain.`,
        hook: `Discover the breakthrough tools and talent profiles that will dominate African agribusiness over the next decade.`,
        timelinePillars: [
          { time: '00-15m', role: 'Emerging Tech & Input Demos', desc: 'Solar drying, drone sprayers, and biological crop treatments' },
          { time: '15-35m', role: 'Operator Case Studies', desc: 'Early adopters reveal unit economics and payback periods' },
          { time: '35-50m', role: 'Upskilling & Career Pathways', desc: 'Connecting young professionals to high-growth agro-tech roles' },
        ],
        keyQuestions: [
          'Which mechanization models yield sub-18 month ROI on 50ha clusters?',
          'How can youth transition from manual labor to machinery piloting?',
        ],
      },
      {
        id: 'policy-case-study',
        typeTitle: 'Policy, Capital & Field Case Study',
        typeIcon: '📜',
        timeframe: 'past',
        eraBadge: '📜 Past Era',
        eraColor: '#6366f1',
        category: currentCategory,
        title: `${cleanTopic}: Retrospective on Subsidies & Cluster Finance`,
        description: `Analyzing past government intervention programs, anchor-borrower schemes, and cooperative models to avoid repeating costly historical mistakes.`,
        hook: `Extract hard lessons from the past 15 years of agricultural policy and capital allocation.`,
        timelinePillars: [
          { time: '00-15m', role: 'Historical Root & Policy Timeline', desc: 'What failed in previous government financing cycles' },
          { time: '15-35m', role: 'Comparative Case Analysis', desc: 'Contrasting successful private hubs against subsidized models' },
          { time: '35-50m', role: 'Future Policy Safeguards', desc: 'Framework for resilient private sector-led financing' },
        ],
        keyQuestions: [
          'Why did the 2016-2022 anchor subsidy programs face high default rates?',
          'What structural differences separate self-sustaining cooperatives?',
        ],
      },
    ];
  }, [topicInput, defaultTopic, currentCategory]);

  const liveParsedBriefs = useMemo(() => {
    return parseLivestreamPayload(customIngestMarkdown, hubTitle, currentCategory);
  }, [customIngestMarkdown, hubTitle, currentCategory]);

  const displayBlueprints = useMemo(() => {
    return liveParsedBriefs.length > 0 ? liveParsedBriefs : defaultIdeas;
  }, [liveParsedBriefs, defaultIdeas]);

  // ── COMPILED 3 PROMPTS ──
  const compiledPrompt1 = useMemo(() => {
    const articlesList = guidingArticles.map(a => `* ${a.title}: ${a.description || 'Verified research brief'}`).join('\n');
    return `### 📄 STEP 1: LIVESTREAM STRATEGIC ANGLE & AUDIENCE DISCONNECT

[MASTER CONTEXT]
* Master Category Hub: ${hubTitle}
* Focus Pillar / Category: ${currentCategory.toUpperCase()}
* Focus Topic: ${topicInput}
* Target Audience: ${targetAudience}
* Location / Hotspots: ${targetLocation}
* Anchor Research Articles:
${articlesList || '* General Sector Intelligence'}

[OBJECTIVE]
You are a Senior Broadcast Director at an elite Agribusiness Intelligence Network in August 2026.
Conduct a rigorous OSINT & field friction analysis on "${hubTitle}" and "${currentCategory}".

Deliver the following in structured markdown:
1. 🎯 **The 3 Sharpest Audience Frictions:** What exact commercial fights are happening between farmgate producers, processors, and institutional financiers right now?
2. 🎙️ **The Host Opening Monologue Hook:** A 3-sentence brutal, high-engagement hook framing the stakes for viewers.
3. 💬 **Top 3 Debate Questions:** Controversial, data-grounded questions guaranteed to spark comments in the live chat.`;
  }, [hubTitle, currentCategory, topicInput, targetAudience, targetLocation, guidingArticles]);

  const compiledPrompt2 = useMemo(() => {
    return `### 📄 STEP 2: 50-MINUTE SHOW RUNDOWN & GUEST SEGMENTS

[INPUT PAYLOAD]
* Topic: ${topicInput}
* Hub: ${hubTitle} (${currentCategory})
* Target Audience: ${targetAudience}
* Focus Epicenters: ${targetLocation}

[OBJECTIVE]
Design an exact 50-minute live presentation rundown structured across 3 distinct ~15m segments.

Provide:
1. **Segment 1 (00-15m) — Macro Reality & Friction:**
   - Segment Title & Role
   - Host Key Talking Points (3 bullet points)
   - Visual Slide / Chart recommendation
2. **Segment 2 (15-35m) — Field Witness & Live Deal Pitch:**
   - Segment Title & Role
   - Recommended Guest Persona (e.g. Cooperative Head, Sourcing Director)
   - 3 Hard-Hitting Interview Questions
3. **Segment 3 (35-50m) — Audience Q&A & Verified Action:**
   - Segment Title & Role
   - Live Call to Action (Job Attachments, Trade Escrow Listing, or Campaign)`;
  }, [topicInput, hubTitle, currentCategory, targetAudience, targetLocation]);

  const compiledPrompt3 = useMemo(() => {
    return `### 📄 STEP 3: FAST INGEST LIVESTREAM FORMATS (STRUCTURED PAYLOAD)

[OBJECTIVE]
Output 3 to 4 complete, distinct broadcast blueprints tailored to "${topicInput}" under "${hubTitle}".
Ensure a mix of Present (⚡), Future (🚀), and Past (📜) Eras.

Format your entire response strictly using this markdown delimiter structure so it can be parsed in 1-click:

---
### Groundwork Town Hall: [Insert Clickable Title]
* **Era:** Present
* **Category:** ${currentCategory}
* **Description:** [2-3 sentences summarizing the show]
* **Hook:** [1-sentence punchy teaser]
* **Rundown:**
  - 00-15m: [Role 1] - [Description of segment 1]
  - 15-35m: [Role 2] - [Description of segment 2]
  - 35-50m: [Role 3] - [Description of segment 3]
* **Key Questions:**
  - [Question 1]
  - [Question 2]
  - [Question 3]

---
### Offtake Pitchroom: [Insert Clickable Title]
* **Era:** Present
* **Category:** ${currentCategory}
* **Description:** [2-3 sentences]
* **Hook:** [1 sentence]
* **Rundown:**
  - 00-15m: [Role 1] - [Description]
  - 15-35m: [Role 2] - [Description]
  - 35-50m: [Role 3] - [Description]
* **Key Questions:**
  - [Question 1]
  - [Question 2]

---
### Future Showcase: [Insert Clickable Title]
* **Era:** Future
* **Category:** ${currentCategory}
* **Description:** [2-3 sentences]
* **Hook:** [1 sentence]
* **Rundown:**
  - 00-15m: [Role 1] - [Description]
  - 15-35m: [Role 2] - [Description]
  - 35-50m: [Role 3] - [Description]

---`;
  }, [topicInput, hubTitle, currentCategory]);

  const handleApplyBlueprint = (blueprint: LivestreamIdeaOption) => {
    onApplyIdea({
      title: blueprint.title,
      description: blueprint.description,
      timeframe: blueprint.timeframe,
      category: blueprint.category || currentCategory,
      blocks: blueprint.timelinePillars.map(p => ({
        id: Math.random().toString(),
        sourceType: 'transition',
        originalBlockType: 'transition',
        originalContent: {
          role: p.role,
          description: p.desc,
          focusSummary: blueprint.title,
        },
        speakerNotes: p.speakerNotes || '',
        durationStr: p.time,
      })),
    });
    onClose();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCustomIngestMarkdown(text);
        if (!checklist['chk4_ingest']) toggleChecklistItem('chk4_ingest');
      }
    } catch {
      // Fallback
    }
  };

  const currentDeckItem = displayBlueprints[deckActiveIndex] || displayBlueprints[0];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100vw', sm: 580, md: 680 },
            maxWidth: '100vw',
            bgcolor: '#f8fafc',
            boxShadow: '-12px 0 40px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
          }
        }
      }}
    >
      {/* ── STICKY GLASSMORPHISM LUXURY HEADER (EXACT ARTICLE STYLE) ── */}
      <Box
        sx={{
          px: { xs: 2.25, sm: 3.5 },
          py: { xs: 2, sm: 2.25 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${hubColor} 0%, #0f172a 100%)`,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${alpha(hubColor, 0.35)}`,
              border: '1.5px solid rgba(255,255,255,0.4)',
              flexShrink: 0,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.25, fontSize: { xs: '1.05rem', sm: '1.18rem' }, letterSpacing: '-0.025em' }}>
              Livestream AI Assistant
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.35 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '-0.01em' }}>
                You guide the AI with market facts to uncover 4 sharp broadcast blueprints
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            color: '#64748b',
            bgcolor: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: '12px',
            p: 0.85,
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', transform: 'scale(1.05)' }
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ── SCROLLABLE BODY ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* VISUAL ANCHOR: SIDE-BY-SIDE SQUIRCLE INTERSECTION             */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 1.5, sm: 2 } }}>
          {/* Left Squircle: Live Studio */}
          <Box
            sx={{
              width: { xs: 104, sm: 118 },
              height: { xs: 104, sm: 118 },
              borderRadius: '28px',
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '2.5px solid rgba(255,255,255,0.25)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              transform: 'rotate(-3deg)',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'rotate(0deg) scale(1.05)', zIndex: 3 },
            }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 10px #22c55e', mb: 1 }} />
            <Typography sx={{ fontSize: '1.75rem', lineHeight: 1 }}>📡</Typography>
            <Typography sx={{ color: '#fff', fontSize: '0.68rem', fontWeight: 900, mt: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Live Studio
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
              border: '2px solid rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 900,
              zIndex: 2,
              mx: { xs: -1.75, sm: -2 },
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            ×
          </Box>

          {/* Right Squircle: Master Category Hub */}
          <Box
            sx={{
              width: { xs: 104, sm: 118 },
              height: { xs: 104, sm: 118 },
              borderRadius: '28px',
              overflow: 'hidden',
              position: 'relative',
              background: `linear-gradient(135deg, ${hubColor} 0%, #0f172a 100%)`,
              border: '2.5px solid rgba(255,255,255,0.25)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              transform: 'rotate(3deg)',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'rotate(0deg) scale(1.05)', zIndex: 3 },
            }}
          >
            <Typography sx={{ fontSize: '1.75rem', lineHeight: 1, mb: 0.5 }}>🌾</Typography>
            <Typography sx={{ color: '#ffffff', fontSize: '0.72rem', fontWeight: 900, lineHeight: 1.2 }}>
              {hubTitle}
            </Typography>
          </Box>
        </Box>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 0: WORKFLOW OVERVIEW                                    */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
              0
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Step 0: How You Guide the AI
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                You are the Director steering the broadcast; the AI is your Research Analyst.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.75, border: '1px solid rgba(15, 23, 42, 0.15)', borderRadius: '14px', bgcolor: 'rgba(15, 23, 42, 0.02)' }}>
            {[
              { id: 'sop_0a', text: '1. Fill in 2 quick inputs below to shape your broadcast theme.' },
              { id: 'sop_0b', text: '2. Copy and run each prompt sequentially in ChatGPT, Claude, or Gemini.' },
              { id: 'sop_0c', text: '3. Paste the final output into Step 4 to import 4 broadcast blueprints directly onto your canvas.' },
            ].map(item => {
              const isChecked = !!checklist[item.id];
              return (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1.25,
                    borderRadius: '10px',
                    bgcolor: isChecked ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                    border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(15, 23, 42, 0.12)',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.05)' },
                  }}
                >
                  <Box
                    onClick={() => toggleChecklistItem(item.id)}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '6px',
                      border: '2px solid',
                      borderColor: isChecked ? '#10b981' : '#0f172a',
                      bgcolor: isChecked ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mr: 1.25, flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {isChecked && (
                        <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{
                      fontSize: '0.85rem',
                      color: isChecked ? '#94a3b8' : '#1e293b',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: isChecked ? 500 : 700,
                      lineHeight: 1.45
                    }}>
                      {item.text}
                    </Typography>
                  </Box>

                  {/* AI Quick Launcher Buttons */}
                  {item.id === 'sop_0b' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, pl: 3.75, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        component="a"
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!checklist['sop_0b']) toggleChecklistItem('sop_0b');
                        }}
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          bgcolor: 'rgba(16, 163, 127, 0.08)',
                          color: '#0d9488',
                          border: '1px solid rgba(13, 148, 136, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: 'rgba(16, 163, 127, 0.15)', borderColor: '#0d9488' },
                        }}
                      >
                        ChatGPT
                      </Button>
                      <Button
                        size="small"
                        component="a"
                        href="https://claude.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!checklist['sop_0b']) toggleChecklistItem('sop_0b');
                        }}
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          bgcolor: 'rgba(217, 119, 6, 0.08)',
                          color: '#d97706',
                          border: '1px solid rgba(217, 119, 6, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.15)', borderColor: '#d97706' },
                        }}
                      >
                        Claude
                      </Button>
                      <Button
                        size="small"
                        component="a"
                        href="https://gemini.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!checklist['sop_0b']) toggleChecklistItem('sop_0b');
                        }}
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          bgcolor: 'rgba(37, 99, 235, 0.08)',
                          color: '#2563eb',
                          border: '1px solid rgba(37, 99, 235, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.15)', borderColor: '#2563eb' },
                        }}
                      >
                        Gemini
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 1: STRATEGIC ANGLE & AUDIENCE DISCONNECT                */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
              1
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Step 1: Where is the Friction Happening?
            </Typography>
          </Box>

          {/* Quick Inputs */}
          <Box sx={{ p: 2.25, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(59, 130, 246, 0.25)', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.05)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>🎯</span> Who & Where are we broadcasting for?
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                Tell the AI who your target live audience is and key operational hubs.
              </Typography>
            </Box>

            <PremiumTextField
              colorTheme="#3b82f6"
              label="Broadcast Topic / Commodity Pair"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              fullWidth
            />

            <PremiumTextField
              colorTheme="#3b82f6"
              label="Target Audience Personas"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              fullWidth
            />

            <PremiumTextField
              colorTheme="#3b82f6"
              label="Location / Hotspot Clusters"
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              fullWidth
            />
          </Box>

          {/* Terminal Box for Step 1 Prompt */}
          {copiedPromptTab === 'doc1a' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.25, bgcolor: 'rgba(59, 130, 246, 0.06)', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <CheckCircleIcon sx={{ color: '#3b82f6' }} />
                <Typography sx={{ color: '#1e40af', fontWeight: 700, fontSize: '0.9rem' }}>
                  Step 1 Prompt Copied to Clipboard!
                </Typography>
              </Box>
              <Button size="small" onClick={() => setCopiedPromptTab(null)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', color: '#2563eb' }}>
                View Prompt Code
              </Button>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', bgcolor: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(0,0,0,0.15)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#1e293b', borderBottom: '1px solid #334155' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#10b981' }} />
                </Box>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 1 PROMPT · AUDIENCE DISCONNECT & HOOK
                </Typography>
                <Box sx={{ width: 33 }} />
              </Box>

              <Box sx={{ p: 2.5, maxHeight: 180, overflowY: 'auto' }}>
                <Typography component="pre" sx={{ color: '#e2e8f0', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', m: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {compiledPrompt1}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, pt: 1.25, bgcolor: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Button
                  onClick={() => handleCopyPromptText(compiledPrompt1, 'doc1a')}
                  sx={{
                    bgcolor: '#3b82f6',
                    color: '#fff',
                    borderRadius: '16px',
                    py: 1,
                    px: 3.5,
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#2563eb', transform: 'translateY(-1px)' }
                  }}
                >
                  <ContentCopyIcon sx={{ mr: 1, fontSize: 16 }} />
                  Copy Step 1 Prompt (Audience Disconnect)
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 0.5 }} />

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 2: 50-MINUTE SHOW RUNDOWN & GUEST SEGMENTS              */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
              2
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Step 2: 50-Minute Show Rundown & Guests
            </Typography>
          </Box>

          {/* Terminal Box for Step 2 Prompt */}
          {copiedPromptTab === 'doc1b' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.25, bgcolor: 'rgba(245, 158, 11, 0.08)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <CheckCircleIcon sx={{ color: '#f59e0b' }} />
                <Typography sx={{ color: '#b45309', fontWeight: 700, fontSize: '0.9rem' }}>
                  Step 2 Prompt Copied to Clipboard!
                </Typography>
              </Box>
              <Button size="small" onClick={() => setCopiedPromptTab(null)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', color: '#b45309' }}>
                View Prompt Code
              </Button>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', bgcolor: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(0,0,0,0.15)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#1e293b', borderBottom: '1px solid #334155' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#10b981' }} />
                </Box>
                <Typography sx={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 2 PROMPT · 50-MIN RUNDOWN & GUESTS
                </Typography>
                <Box sx={{ width: 33 }} />
              </Box>

              <Box sx={{ p: 2.5, maxHeight: 180, overflowY: 'auto' }}>
                <Typography component="pre" sx={{ color: '#fbbf24', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', m: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {compiledPrompt2}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, pt: 1.25, bgcolor: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Button
                  onClick={() => handleCopyPromptText(compiledPrompt2, 'doc1b')}
                  sx={{
                    bgcolor: '#f59e0b',
                    color: '#000',
                    borderRadius: '16px',
                    py: 1,
                    px: 3.5,
                    fontWeight: 900,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#d97706', transform: 'translateY(-1px)' }
                  }}
                >
                  <ContentCopyIcon sx={{ mr: 1, fontSize: 16 }} />
                  Copy Step 2 Prompt (Show Rundown)
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 0.5 }} />

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 3: STRUCTURED BLUEPRINT GENERATOR (FAST INGEST)         */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.88rem',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)'
            }}>
              3
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Step 3: Generate Structured Broadcast Formats
            </Typography>
          </Box>

          {/* Terminal Box for Step 3 Prompt */}
          {copiedPromptTab === 'doc1c' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.25, bgcolor: 'rgba(168, 85, 247, 0.08)', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <CheckCircleIcon sx={{ color: '#a855f7' }} />
                <Typography sx={{ color: '#6b21a8', fontWeight: 700, fontSize: '0.9rem' }}>
                  Step 3 Prompt Copied to Clipboard!
                </Typography>
              </Box>
              <Button size="small" onClick={() => setCopiedPromptTab(null)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', color: '#6b21a8' }}>
                View Prompt Code
              </Button>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', bgcolor: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(0,0,0,0.15)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.75, bgcolor: '#1e293b', borderBottom: '1px solid #334155' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#10b981' }} />
                </Box>
                <Typography sx={{ color: '#c084fc', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 3 PROMPT · GENERATE 4 BROADCAST BLUEPRINTS
                </Typography>
                <Box sx={{ width: 33 }} />
              </Box>

              <Box sx={{ p: 2.5, maxHeight: 180, overflowY: 'auto' }}>
                <Typography component="pre" sx={{ color: '#c084fc', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', m: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {compiledPrompt3}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, pt: 1.25, bgcolor: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Button
                  onClick={() => handleCopyPromptText(compiledPrompt3, 'doc1c')}
                  sx={{
                    bgcolor: '#a855f7',
                    color: '#fff',
                    borderRadius: '16px',
                    py: 1,
                    px: 3.5,
                    fontWeight: 900,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#9333ea', transform: 'translateY(-1px)' }
                  }}
                >
                  <ContentCopyIcon sx={{ mr: 1, fontSize: 16 }} />
                  Copy Step 3 Prompt (Generate Formats)
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 0.5 }} />

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 4: IMPORT BLUEPRINTS & INTERACTIVE SLIDESHOW DECK       */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
              4
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Step 4: Import Blueprints into Studio
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Tap to Paste Button */}
            <Button
              onClick={handlePasteFromClipboard}
              startIcon={<ContentPasteIcon />}
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.08)',
                color: '#047857',
                border: '1.5px dashed #10b981',
                borderRadius: '14px',
                py: 1.25,
                fontWeight: 800,
                fontSize: '0.85rem',
                textTransform: 'none',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.14)', borderColor: '#047857', transform: 'translateY(-1px)' }
              }}
            >
              Tap to Paste Your Blueprints from Clipboard
            </Button>

            <PremiumMarkdownEditor
              colorTheme="#10b981"
              minRows={6}
              fullWidth
              placeholder={`---\n### Groundwork Town Hall: Cassava Farmgate Realities\n* Era: Present\n* Category: ${currentCategory}\n* Description: An interactive live panel on cluster bottlenecks...\n* Hook: Real cash-to-farmgate data direct from producers.\n* Rundown:\n  - 00-15m: Field Data - Farmgate spread\n  - 15-35m: Producer Interview - Cluster logistics\n  - 35-50m: Audience Q&A - Escrow deals\n---`}
              value={customIngestMarkdown}
              onChange={(e: any) => setCustomIngestMarkdown(e.target.value)}
            />
          </Box>

          {/* Live Detection Banner */}
          {liveParsedBriefs.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: '#ecfdf5', borderRadius: '14px', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <CheckCircleIcon sx={{ color: '#059669', fontSize: 22 }} />
                <Typography sx={{ color: '#065f46', fontWeight: 900, fontSize: '0.9rem' }}>
                  ✓ Live Detection: {liveParsedBriefs.length} Valid Broadcast Blueprints Ready!
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {Array.from(new Set(liveParsedBriefs.map(b => b.timeframe))).map(era => (
                  <Chip key={era} label={era.toUpperCase()} size="small" sx={{ bgcolor: '#059669', color: '#fff', fontSize: '0.65rem', fontWeight: 800 }} />
                ))}
              </Box>
            </Paper>
          )}

          {/* ── INTERACTIVE EDITORIAL BLUEPRINT DECK (SLIDESHOW) ── */}
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Progress & Quick Jump Strip */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.84rem', fontWeight: 800 }}>
                Blueprint <strong style={{ color: '#0f172a' }}>{deckActiveIndex + 1}</strong> of {displayBlueprints.length}
              </Typography>
              
              {/* Dot indicators for blueprints */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                {displayBlueprints.map((dotItem, dotIdx) => {
                  const isCurrentDot = dotIdx === deckActiveIndex;
                  return (
                    <Box
                      key={`deck-dot-${dotIdx}`}
                      onClick={() => setDeckActiveIndex(dotIdx)}
                      sx={{
                        width: isCurrentDot ? 22 : 7,
                        height: 7,
                        borderRadius: '999px',
                        bgcolor: isCurrentDot ? dotItem.eraColor : alpha(dotItem.eraColor, 0.35),
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        '&:hover': { bgcolor: dotItem.eraColor }
                      }}
                    />
                  );
                })}
              </Box>

              <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}>
                {currentDeckItem.eraBadge}
              </Typography>
            </Box>

            {/* ── CARD CONTAINER WITH FLOATING CONTROLS & DROP STACK ── */}
            <Box sx={{ position: 'relative', width: '100%' }}>
              {/* Floating Previous Button */}
              <IconButton
                onClick={() => setDeckActiveIndex(prev => Math.max(0, prev - 1))}
                disabled={deckActiveIndex === 0}
                aria-label="Previous Blueprint"
                sx={{
                  position: 'absolute',
                  left: { xs: -12, sm: -18 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  bgcolor: '#ffffff',
                  border: '1.5px solid rgba(226, 232, 240, 0.95)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.14)',
                  color: '#0f172a',
                  transition: 'all 0.2s ease',
                  opacity: deckActiveIndex === 0 ? 0.35 : 1,
                  pointerEvents: deckActiveIndex === 0 ? 'none' : 'auto',
                  '&:hover': {
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    borderColor: '#0f172a',
                    transform: 'translateY(-50%) scale(1.08)',
                  }
                }}
              >
                <ArrowBackIosNewIcon sx={{ fontSize: 16, ml: '3px' }} />
              </IconButton>

              {/* Floating Next Button */}
              <IconButton
                onClick={() => setDeckActiveIndex(prev => Math.min(displayBlueprints.length - 1, prev + 1))}
                disabled={deckActiveIndex === displayBlueprints.length - 1}
                aria-label="Next Blueprint"
                sx={{
                  position: 'absolute',
                  right: { xs: -12, sm: -18 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  bgcolor: '#0f172a',
                  border: '1.5px solid #0f172a',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  opacity: deckActiveIndex === displayBlueprints.length - 1 ? 0.35 : 1,
                  pointerEvents: deckActiveIndex === displayBlueprints.length - 1 ? 'none' : 'auto',
                  '&:hover': {
                    bgcolor: '#1e293b',
                    borderColor: '#1e293b',
                    transform: 'translateY(-50%) scale(1.08)',
                  }
                }}
              >
                <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
              </IconButton>

              {/* Main Blueprint Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDeckItem.id || deckActiveIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.75, sm: 3.5 },
                      borderRadius: '24px',
                      bgcolor: '#ffffff',
                      border: '1.5px solid',
                      borderColor: alpha(currentDeckItem.eraColor, 0.35),
                      boxShadow: `0 12px 32px ${alpha(currentDeckItem.eraColor, 0.12)}, 0 2px 8px rgba(0,0,0,0.04)`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2.2,
                    }}
                  >
                    {/* Top Row: Era Chip & Pillar Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={currentDeckItem.eraBadge}
                          size="small"
                          sx={{
                            bgcolor: alpha(currentDeckItem.eraColor, 0.14),
                            color: currentDeckItem.eraColor,
                            border: `1.5px solid ${alpha(currentDeckItem.eraColor, 0.35)}`,
                            fontWeight: 900,
                            fontSize: '0.74rem',
                            borderRadius: '999px',
                            px: 0.5,
                          }}
                        />
                        <Chip
                          label={`📍 ${(currentDeckItem.category || currentCategory).toUpperCase()}`}
                          size="small"
                          sx={{
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '999px',
                          }}
                        />
                      </Box>
                      <Typography sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {currentDeckItem.typeIcon} {currentDeckItem.typeTitle}
                      </Typography>
                    </Box>

                    {/* Blueprint Title */}
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.35, fontSize: { xs: '1.15rem', sm: '1.28rem' }, letterSpacing: '-0.02em' }}>
                      {currentDeckItem.title}
                    </Typography>

                    {/* Description */}
                    <Typography sx={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                      {currentDeckItem.description}
                    </Typography>

                    {/* Core Hook Box */}
                    <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: alpha(currentDeckItem.eraColor, 0.06), border: `1px dashed ${alpha(currentDeckItem.eraColor, 0.3)}` }}>
                      <Typography sx={{ color: currentDeckItem.eraColor, fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.4 }}>
                        🎙️ Opening Monologue Hook
                      </Typography>
                      <Typography sx={{ color: '#0f172a', fontSize: '0.86rem', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.45 }}>
                        "{currentDeckItem.hook}"
                      </Typography>
                    </Box>

                    {/* 50-Min Presentation Rundown */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.75, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        ⏱️ 50-Min Presentation Rundown:
                      </Typography>
                      {currentDeckItem.timelinePillars.map((pillar, pIdx) => (
                        <Box key={pIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                          <Chip
                            label={pillar.time}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.68rem',
                              fontWeight: 900,
                              bgcolor: '#e2e8f0',
                              color: '#0f172a',
                              borderRadius: '6px',
                              flexShrink: 0,
                              mt: 0.2
                            }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
                              {pillar.role}
                            </Typography>
                            <Typography sx={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                              {pillar.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* Key Questions (if present) */}
                    {currentDeckItem.keyQuestions && currentDeckItem.keyQuestions.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          💬 Live Debate Questions:
                        </Typography>
                        {currentDeckItem.keyQuestions.map((q, qIdx) => (
                          <Typography key={qIdx} sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500, display: 'flex', gap: 0.8 }}>
                            <span style={{ color: currentDeckItem.eraColor }}>•</span> {q}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {/* Bottom Action Footer */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid #f1f5f9', mt: 0.5 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                        Select this blueprint to populate Title, Era & Rundown Canvas
                      </Typography>

                      <Button
                        variant="contained"
                        onClick={() => handleApplyBlueprint(currentDeckItem)}
                        sx={{
                          background: `linear-gradient(135deg, ${currentDeckItem.eraColor} 0%, ${alpha(currentDeckItem.eraColor, 0.88)} 100%)`,
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '0.92rem',
                          textTransform: 'none',
                          py: 1.3,
                          px: 3.5,
                          borderRadius: '14px',
                          boxShadow: `0 6px 18px ${alpha(currentDeckItem.eraColor, 0.38)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${currentDeckItem.eraColor} 0%, ${currentDeckItem.eraColor} 100%)`,
                            transform: 'translateY(-1px)',
                            boxShadow: `0 8px 24px ${alpha(currentDeckItem.eraColor, 0.5)}`,
                          }
                        }}
                      >
                        🚀 Use This Blueprint
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              </AnimatePresence>
            </Box>
          </Box>
        </Box>

      </Box>
    </Drawer>
  );
}
