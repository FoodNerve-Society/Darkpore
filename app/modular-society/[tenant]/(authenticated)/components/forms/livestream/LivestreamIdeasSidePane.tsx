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
  guidingCampaigns?: Array<{ id: string; title: string; [key: string]: any }>;
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
 * Supports both [LIVESTREAM_MENU_PAYLOAD] (LS-Doc 1c) and legacy delimiter formats.
 */
function parseLivestreamPayload(rawText: string, fallbackHub: string, fallbackCategory: string): LivestreamIdeaOption[] {
  if (!rawText || !rawText.trim()) return [];

  const results: LivestreamIdeaOption[] = [];
  const normalized = rawText.replace(/\r\n/g, '\n');

  const eraConfigMap: Record<string, { badge: string; color: string; icon: string }> = {
    present: { badge: '⚡ Present Era', color: '#10b981', icon: '⚡' },
    future: { badge: '🚀 Future Era', color: '#8b5cf6', icon: '🚀' },
    past: { badge: '📜 Past Era', color: '#6366f1', icon: '📜' },
  };

  // ── DETECTION 1: LS-Doc 1c [LIVESTREAM_MENU_PAYLOAD] ──
  if (normalized.includes('OPTION') || normalized.includes('LIVESTREAM_MENU_PAYLOAD') || normalized.includes('Act 1') || normalized.includes('THE OPEN')) {
    const optionSections = normalized.split(/(?:###\s*(?:[🔴🟡🟢🔵🟣⚡]?\s*OPTION|\bOPTION\b|\d+\.))/i).map(s => s.trim()).filter(Boolean);

    optionSections.forEach((sec, idx) => {
      // Skip top metadata header if it contains no broadcast content
      if (sec.includes('[LIVESTREAM_MENU_PAYLOAD]') && !sec.includes('Broadcast Title') && !sec.includes('Act 1')) {
        return;
      }

      const firstLine = sec.split('\n')[0].replace(/^[:\s\d.-]+/, '').replace(/[*_`#]/g, '').trim();

      // 4 DEF Angles of Attack config
      const angleDefaults = [
        { title: 'The Head-On Assault', icon: '🔴', color: '#ef4444', badge: '🔴 Head-On Assault' },
        { title: 'The Flank / Sideways Attack', icon: '🟡', color: '#f59e0b', badge: '🟡 Flank Attack' },
        { title: 'The Trojan Horse', icon: '🟢', color: '#10b981', badge: '🟢 Trojan Horse' },
        { title: 'The Contrarian Crossfire', icon: '🟣', color: '#a855f7', badge: '🟣 Contrarian Crossfire' },
      ];
      const angleConfig = angleDefaults[idx % angleDefaults.length];
      const typeIcon = angleConfig.icon;
      const eraColor = angleConfig.color;
      const eraBadge = angleConfig.badge;
      const personaTitle = firstLine && firstLine.length > 2 ? firstLine : angleConfig.title;

      // Extract Broadcast Title
      const titleMatch = sec.match(/[*•-]?\s*\*?\*?Broadcast Title\*?\*?:\s*([^\n\r*]+)/i) ||
                         sec.match(/[*•-]?\s*\*?\*?Title\*?\*?:\s*([^\n\r*]+)/i);
      const title = titleMatch ? titleMatch[1].replace(/[*_`]/g, '').trim() : (firstLine || `${fallbackHub} Broadcast Option ${idx + 1}`);

      // Extract Acts & CTA
      const act1Match = sec.match(/[*•-]?\s*\*?\*?Act 1[^\n\r*]*\*?\*?:\s*([\s\S]*?)(?=(?:[*•-]?\s*\*?\*?Act 2|$))/i);
      const act2Match = sec.match(/[*•-]?\s*\*?\*?Act 2[^\n\r*]*\*?\*?:\s*([\s\S]*?)(?=(?:[*•-]?\s*\*?\*?Act 3|$))/i);
      const act3Match = sec.match(/[*•-]?\s*\*?\*?Act 3[^\n\r*]*\*?\*?:\s*([\s\S]*?)(?=(?:[*•-]?\s*\*?\*?The Ecosystem Push|[*•-]?\s*\*?\*?CTA|###|$))/i);
      const ctaMatch = sec.match(/[*•-]?\s*\*?\*?(?:The Ecosystem Push|CTA)[^\n\r*]*\*?\*?:\s*([\s\S]*?)(?=(?:###|---|$))/i);

      const act1Text = act1Match ? act1Match[1].replace(/[*_`]/g, '').trim() : '';
      const act2Text = act2Match ? act2Match[1].replace(/[*_`]/g, '').trim() : '';
      const act3Text = act3Match ? act3Match[1].replace(/[*_`]/g, '').trim() : '';
      const ctaText = ctaMatch ? ctaMatch[1].replace(/[*_`]/g, '').trim() : '';

      // Build 3 DEF Timeline Segments
      const segments: LivestreamRundownSegment[] = [];
      if (act1Text || act2Text || act3Text) {
        segments.push({
          time: '00-15m',
          role: 'Act 1: The Open (Tension & Reframe)',
          desc: act1Text || 'State the anchor tension and reframe conventional assumptions with hard field evidence.',
          speakerNotes: act1Text,
        });
        segments.push({
          time: '15-35m',
          role: 'Act 2: The Meat (Map System & Defend)',
          desc: act2Text || 'Expose the systemic villain, present unit economics, and dismantle skeptic counter-arguments live.',
          speakerNotes: act2Text,
        });
        segments.push({
          time: '35-50m',
          role: 'Act 3: The Close (Fork & Ecosystem CTA)',
          desc: `${act3Text}${ctaText ? ` | Conversion: ${ctaText}` : ''}`,
          speakerNotes: `${act3Text}\n\nEcosystem CTA:\n${ctaText}`,
        });
      }

      // Determine era
      const timeframe: 'past' | 'present' | 'future' = 
        /future|horizon|203\d/i.test(sec) ? 'future' :
        /past|historical|origin/i.test(sec) ? 'past' : 'present';

      // Extract hook & questions
      const hook = act1Text ? act1Text.slice(0, 140) + '...' : `Strategic livestream teardown for ${personaTitle}.`;
      const questions: string[] = [];
      const questionMatches = sec.match(/"([^"]+\?)"/g) || sec.match(/[*•-]\s*([^?\n\r]+?\?)/g);
      if (questionMatches) {
        questionMatches.forEach(q => {
          const cleanQ = q.replace(/^["*•\s-]+|["\s]+$/g, '').trim();
          if (cleanQ.length > 10) questions.push(cleanQ);
        });
      }

      if (title || segments.length > 0) {
        results.push({
          id: `ls-def-${idx}-${Date.now()}`,
          typeTitle: personaTitle,
          typeIcon,
          timeframe,
          eraBadge,
          eraColor,
          category: fallbackCategory,
          title,
          description: act1Text ? `${act1Text.slice(0, 220)}...` : `Broadcast blueprint engineered for ${personaTitle}.`,
          hook,
          timelinePillars: segments.length > 0 ? segments : [
            { time: '00-15m', role: 'Act 1: The Open', desc: 'Anchor Tension & Reframe Question' },
            { time: '15-35m', role: 'Act 2: The Meat', desc: 'Map System & Skeptic Defense' },
            { time: '35-50m', role: 'Act 3: The Close', desc: 'Forked Close & Job/Deal Spotlight' }
          ],
          keyQuestions: questions.length > 0 ? questions : undefined,
          suggestedJobsFocus: ctaText || undefined,
        });
      }
    });

    if (results.length > 0) return results;
  }

  // ── DETECTION 2: DELIMITER / HEADLINE PARSER (FALLBACK) ──
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
        { time: '00-15m', role: 'Act 1: The Open', desc: 'Framing the immediate operational bottleneck' },
        { time: '15-35m', role: 'Act 2: The Meat', desc: 'Case study analysis and live stakeholder discussion' },
        { time: '35-50m', role: 'Act 3: The Close', desc: 'Practical calls to action and verified opportunities' }
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
  guidingJobs = [],
  guidingListings = [],
  guidingCampaigns = [],
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

  // Dynamic Date Hooks (Zero Hardcoding)
  const currentDate = useMemo(() => new Date(), []);
  const currentMonthYear = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);
  const currentYear = useMemo(() => {
    return currentDate.getFullYear().toString();
  }, [currentDate]);
  const futureHorizonYear = useMemo(() => {
    return (currentDate.getFullYear() + 4).toString();
  }, [currentDate]);

  // Ingestion & Step Bridge States (LS-Doc 1a & 1b outputs)
  const [lsAssetMapInput, setLsAssetMapInput] = useState('');
  const [lsConflictMatrixInput, setLsConflictMatrixInput] = useState('');
  const [customIngestMarkdown, setCustomIngestMarkdown] = useState('');
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

  // ── SERIALIZED DATA PAYLOADS AUTO-APPENDED TO PROMPTS ──
  const articleJsonPayload = useMemo(() => {
    if (!guidingArticles || guidingArticles.length === 0) {
      return JSON.stringify([
        {
          id: 'article-brief-01',
          title: topicInput || `${hubTitle} Value Chain Intelligence`,
          description: `Empirical research brief on ${hubTitle} and ${currentCategory}.`,
          blocks: [
            { type: 'highlight_card', metricHeadline: 'Critical Systemic Metric', stat: '₦2.4M Loss per transit', caption: 'High friction and post-harvest spoilage across freight corridors' },
            { type: 'strategic_directive', urgency: 'critical', threat: 'Severe capital and logistics paralysis directly impacting producers and aggregators' },
            { type: 'myth_fact', myth: 'Farmers lack yield capacity', fact: 'Yield is sufficient but lack of preservation and transport causes 45% post-harvest collapse' }
          ]
        }
      ], null, 2);
    }
    return JSON.stringify(guidingArticles.map(a => {
      const rawBlocks = a.article?.blocks || a.blocks || a.contentBlocks || [];
      const parsedBlocks = rawBlocks.map((b: any, bIdx: number) => {
        let contentObj: any = {};
        if (typeof b.content === 'string') {
          try {
            contentObj = JSON.parse(b.content);
          } catch {
            contentObj = { text: b.content };
          }
        } else if (b.content && typeof b.content === 'object') {
          contentObj = b.content;
        } else {
          const { id, articleId, orderIndex, blockType, type, content, revisions, comments, ...rest } = b;
          contentObj = rest;
        }

        return {
          orderIndex: typeof b.orderIndex === 'number' ? b.orderIndex : bIdx + 1,
          type: b.blockType || b.type || contentObj.type || 'content_block',
          ...contentObj
        };
      });

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        subcategory: a.subcategory,
        timeframe: a.timeframe,
        authorName: a.authorName,
        organization: a.organization?.name || 'Food Nerve Society',
        blocks: parsedBlocks.length > 0 ? parsedBlocks : [
          { type: 'highlight_card', metricHeadline: a.title, stat: 'Verified Field Metric', caption: a.description || 'Primary evidence block' },
          { type: 'strategic_directive', urgency: 'critical', threat: a.description || 'Operational deadlock across the value chain' },
          { type: 'myth_fact', myth: 'Conventional market dogma', fact: a.description || 'Ground-level operational reality' }
        ]
      };
    }), null, 2);
  }, [guidingArticles, topicInput, hubTitle, currentCategory]);

  const ecosystemJsonPayload = useMemo(() => {
    const combined = [...guidingJobs, ...guidingListings, ...(guidingCampaigns || [])];
    if (combined.length === 0) {
      return JSON.stringify([
        {
          id: 'cta-listing-1',
          type: 'Job / Bounty',
          jobTitle: `${hubTitle} Logistics & Field Dispatch Lead`,
          organizationName: 'Food Nerve Ecosystem Partner',
          location: targetLocation || 'Nigeria (Dawanau / Bodija / Mile 12)',
          compensationOrTarget: '₦850,000 / month (Paystack Escrow Locked)',
          description: `Direct operational role deploying decentralised preservation infrastructure and routing solutions for ${hubTitle}.`,
          skills: ['Cold-Chain Telemetry', 'Cluster Aggregation', 'Dispatch Optimization']
        }
      ], null, 2);
    }
    return JSON.stringify(combined.map(item => {
      let comp = 'Disclosed via Escrow';
      if (item.minSalary && item.maxSalary) {
        const cur = item.currency || '₦';
        comp = `${cur}${Number(item.minSalary).toLocaleString()} - ${cur}${Number(item.maxSalary).toLocaleString()}${item.compType === 'volunteer' ? ' (Volunteer Stipend)' : ' / month'}`;
      } else if (item.priceOrAsk) {
        comp = item.priceOrAsk;
      } else if (item.salaryRange || item.compensationOrTarget) {
        comp = item.salaryRange || item.compensationOrTarget;
      } else if (item.goalAmount) {
        comp = `Target: ₦${Number(item.goalAmount).toLocaleString()}`;
      } else if (item.npReward) {
        comp = `${item.npReward.toLocaleString()} NervePoints (Escrow Locked)`;
      }

      const loc = item.location 
        ? `${item.location}${item.lga ? ` (${item.lga} LGA)` : ''}`
        : (item.state || targetLocation || 'Nigeria');

      let challengesList: any = item.challenges;
      if (typeof challengesList === 'string') {
        try {
          challengesList = JSON.parse(challengesList);
        } catch {
          challengesList = [item.challenges];
        }
      }

      const isJobType = item.category === 'jobs' || item.category === 'job' || item.category === 'volunteer' || item.category === 'internship' || Boolean(item.jobSource) || Boolean(item.minSalary);

      return {
        id: item.id,
        type: isJobType ? 'Job / Bounty' : (item.goalAmount ? 'Campaign / Initiative' : 'Trade Listing / Deal'),
        jobTitle: item.title || item.name,
        organizationName: item.organization?.name || item.orgName || 'Food Nerve Ecosystem Partner',
        category: item.category || item.tier || 'ecosystem',
        jobFunction: item.jobFunction || (item.commodity ? `Commodity: ${item.commodity}` : undefined),
        location: loc,
        compensationOrTarget: comp,
        description: item.description || item.challenges || item.organizationChallenges || 'Execution mandate resolving systemic bottlenecks.',
        skills: item.skills || item.requiredSkills || challengesList || [],
        challenges: challengesList || []
      };
    }), null, 2);
  }, [guidingJobs, guidingListings, guidingCampaigns, hubTitle, targetLocation]);

  // ── COMPILED MASTER PROMPTS (LS-DOC 1a, 1b, 1c) ──
  const compiledPrompt1 = useMemo(() => {
    return `### 📄 LS-DOCUMENT 1a: THE DEEP DOSSIER ENGINE (MASTER PROMPT)

**[SYSTEM PERSONA & EXTRACTION CONSTRAINTS]**
You are the Senior Broadcast Architect and Data Ingestor for Food Nerve Society operating in ${currentMonthYear}. Your ONLY job is to digest raw JSON payloads from published articles and ecosystem CTAs (Jobs, Deals, Grants, Opportunities) and extract them into deep, structured intelligence dossiers.

- **Zero Synthesis Rule:** Do NOT attempt to connect the articles together, find commonalities, or build a "bridge" between the problems and the solutions yet. Your job is pure, isolated, deep extraction for each asset provided.
- **Elasticity:** You must process every single item provided, whether there is 1 article or 5, and 1 CTA or 5.
- **Tone:** Highly analytical, strict third-person. Use hard verbs.

**[INPUT PAYLOAD DEFINITION]**

\`\`\`
Broadcast Hub & Category: ${hubTitle} | ${currentCategory}
Livestream Timeframe: Present
[ANCHOR_ARTICLE_JSON_ARRAY]: 
${articleJsonPayload}

[ANCHOR_CTA_JSON_ARRAY]: 
${ecosystemJsonPayload}
\`\`\`

---

#### PHASE 1: Deep Article Dissection

Iterate through EVERY article provided in the \`[ANCHOR_ARTICLE_JSON_ARRAY]\`. For each article, you must extract a rich, 6-point systemic insight (mirroring the depth of our editorial blueprints):

1. **The Metadata:** Title, Era, and Micro-Geography.
2. **The Killer Stat:** Extract the exact metric and image context from Block 1 (\`highlight_card\`).
3. **The Core Problem:** What is the fundamental crisis or bottleneck?
4. **The Mechanics:** How exactly does the operational reality or the workaround function on the ground?
5. **The Value Chain Impact:** Explicitly name the Value Chain Actor affected and the systemic/financial outcome.
6. **The Political Economy:** Who explicitly benefits from this problem persisting? (Extracted from the \`myth_fact\` or core analysis blocks).

#### PHASE 2: Ecosystem CTA Dissection

Iterate through EVERY listing provided in the \`[ANCHOR_CTA_JSON_ARRAY]\`. A CTA might be a Job, a Corporate Deal, a Government Grant, or a Bounty. For each, extract:

1. **The Opportunity Profile:** Title, Listing Type (Job/Deal/Grant/etc.), and Organization.
2. **The Capital/Compensation:** The exact salary, grant size, or deal facility limit.
3. **The Execution Mandate:** The core skills, deliverables, or operational requirements needed to execute or win this opportunity.

---

#### OUTPUT FORMAT (LS-DOC 1a PAYLOAD)

Output your entire response inside this single, clean Markdown block:

\`\`\`markdown
# [LS_ASSET_INVENTORY]

**Broadcast Context:** Hub: ${hubTitle} | Category: ${currentCategory} | Timeframe: Present

### PART 1: The Article Dossiers
*(Generate a dossier for EACH article provided in the payload)*

#### 📄 Article 1: [Extracted Publishing Headline]
*   **Era & Location:** [Extracted Era] | [Extracted Micro-Geography]
*   **The Killer Stat:** [Extracted metric/data point]
*   **The Core Problem:** [1 sentence plainly stating the bottleneck]
*   **The Mechanics:** [1-2 sentences explaining the operational reality/workaround]
*   **Value Chain Impact:** [Actor affected and the financial/systemic outcome]
*   **Political Economy:** [Who profits from this problem persisting]

#### 📄 Article 2: [Extracted Publishing Headline] *(If present)*
*   [Repeat structure...]

#### 📄 Article 3: [Extracted Publishing Headline] *(If present)*
*   [Repeat structure...]

---

### PART 2: The Ecosystem CTA Dossiers
*(Generate a dossier for EACH opportunity provided in the payload)*

#### 💼 CTA 1: [Extracted Title]
*   **Type & Organization:** [Job / Deal / Grant] | [Organization Name]
*   **Capital / Compensation:** [Salary, Deal Size, or Bounty Reward]
*   **Execution Mandate:** [1-2 sentences explaining exactly what physical/intellectual work is required to fulfill this opportunity]

#### 💼 CTA 2: [Extracted Title] *(If present)*
*   [Repeat structure...]
\`\`\``;
  }, [hubTitle, currentCategory, articleJsonPayload, ecosystemJsonPayload, currentMonthYear]);

  const compiledPrompt2 = useMemo(() => {
    return `### 📄 LS-DOCUMENT 1b: THE PATTERN & INTERSECTION MAPPING (MASTER PROMPT)

**[SYSTEM PERSONA & EXTRACTION CONSTRAINTS]**
You are a Senior Intelligence Analyst and Debate Architect for Food Nerve Society operating in ${currentMonthYear}. Your job is to take the isolated dossiers from Step 1a and find the "Smear"—the deep, underlying patterns, the brutal contradictions, and the timeline evolutions that connect these assets together.

- **Zero Broadcasting Strategy Yet:** Do not write livestream pitches or format ideas. Focus purely on mapping how the information interacts.
- **Deep Extraction Rule:** Do not provide a single sentence per section. You must provide an extended, highly detailed list of insights (3-4 bullet points minimum) for each analytical category to give the production team deep material to work with.
- **Tone:** Highly analytical, strict third-person, brutal honesty.

**[INPUT PAYLOAD DEFINITION]**

\`\`\`
[LS_ASSET_INVENTORY]: 
${lsAssetMapInput.trim() ? lsAssetMapInput.trim() : '[Paste the complete Markdown output block from LS-Document 1a]'}
\`\`\`

---

#### PHASE 1: The Commonalities (The Core Through-lines)

Analyze all provided Articles and CTAs. Identify the undeniable shared realities. What systemic bottlenecks, macro-economic triggers, or resource deficits appear across multiple assets? How does the "Execution Mandate" of the CTAs perfectly map to the "Core Problem" of the articles?

#### PHASE 2: The Contradictions & Friction (The Tension)

Livestreams thrive on conflict. Look for where the data fights itself.

- Does Article A's solution contradict Article B's reality?
- Does the compensation/target of the CTA seem inadequate for the brutal reality described in the articles?
- Is there a gap between what the "Myth" says and what the CTAs are actually funding?

#### PHASE 3: The Era & Trajectory Shifts (The Evolution)

Map how the information moves through time. If there are Past, Present, and Future articles, how did the historical failure birth the current ${currentYear} hack? How will the current ${currentYear} crisis force the ${futureHorizonYear} technology adoption?

#### PHASE 4: The Political Economy Nexus (The Profiteers)

Synthesize the "Villains." Across all the assets, who is consistently capturing the margins? Is there a shared cartel, legacy policy, or middleman network that benefits from these combined problems persisting?

---

#### OUTPUT FORMAT (LS-DOC 1b PAYLOAD)

Output your entire response inside this single, clean Markdown block:

\`\`\`markdown
# [LS_THE_SMEAR_MATRIX]

**Broadcast Context:** Derived from [LS_ASSET_INVENTORY]

### 1. The Commonalities (The Core Through-lines)
*(List 3-4 detailed analytical insights where the articles and CTAs perfectly intersect)*
*   **[Insight Title]:** [2-3 sentences explaining how Article X and Asset Y share a fundamental operational reality, bottleneck, or technological requirement].
*   **[Insight Title]:** [2-3 sentences detailing...].
*   **[Insight Title]:** [2-3 sentences detailing...].
*   **[Insight Title]:** [2-3 sentences detailing...].

### 2. The Contradictions & Friction Points (The Tension)
*(List 3-4 detailed analytical insights where the assets contradict, reveal market gaps, or expose flaws)*
*   **[Friction Point Title]:** [2-3 sentences exposing a contradiction between the articles, or highlighting why a proposed CTA solution might fail against the brutal ground truth of an article].
*   **[Friction Point Title]:** [2-3 sentences detailing...].
*   **[Friction Point Title]:** [2-3 sentences detailing...].
*   **[Friction Point Title]:** [2-3 sentences detailing...].

### 3. The Era & Trajectory Shifts (The Evolution)
*(List 3-4 detailed analytical insights tracking the movement of time across the assets)*
*   **[Trajectory Shift Title]:** [2-3 sentences mapping how a historical root caused a present crisis, or how a present workaround sets the stage for a future ${futureHorizonYear} disruption].
*   **[Trajectory Shift Title]:** [2-3 sentences detailing...].
*   **[Trajectory Shift Title]:** [2-3 sentences detailing...].

### 4. The Political Economy Nexus (The Profiteers)
*(List 2-3 detailed insights synthesizing who is making money off the systemic failure)*
*   **[Profiteer/Cartel Identification]:** [2-3 sentences explicitly naming the actors who benefit from the combined problems persisting across these assets, and how they extract their margin].
*   **[Profiteer/Cartel Identification]:** [2-3 sentences detailing...].
\`\`\``;
  }, [lsAssetMapInput, currentMonthYear, currentYear, futureHorizonYear]);

  const compiledPrompt3 = useMemo(() => {
    return `### 📄 LS-DOCUMENT 1c: THE ANGLES OF ATTACK & BROADCAST SYNTHESIZER (MASTER PROMPT)

**[SYSTEM PERSONA & SYNTHESIS CONSTRAINTS]**
You are the Executive Producer and Showrunner for Food Nerve Society operating in ${currentMonthYear}. Your ONLY job is to take the raw inventory and the analytical "Smear" matrices, and synthesize them into 4 to 5 highly distinct, high-retention Livestream Pitches.

- **Tone:** Aggressive, highly structured, strict third-person. Use hard verbs. No fluffy adjectives.
- **The DEF Rule:** Every single pitch MUST obey the Determinant Engagement Framework: Act 1 (Open/Tension) $\\to$ Act 2 (Meat/Diagnosis & Defense) $\\to$ Act 3 (Close/Conversion).

**[INPUT PAYLOAD DEFINITION]**

\`\`\`
Hub Title & Category: ${hubTitle} | ${currentCategory}
[LS_ASSET_INVENTORY]: 
${lsAssetMapInput.trim() ? lsAssetMapInput.trim() : '[Paste the output from LS-Doc 1a]'}

[LS_THE_SMEAR_MATRIX]: 
${lsConflictMatrixInput.trim() ? lsConflictMatrixInput.trim() : '[Paste the output from LS-Doc 1b]'}
\`\`\`

---

#### PHASE 1: The "Angles of Attack" Mapping

Read the \`[LS_THE_SMEAR_MATRIX]\`. You must generate exactly 4 Livestream pitch options by applying these 4 specific editorial "Angles of Attack" to the data:

1. **The Head-On Assault (The Obvious Bleed):** Attack the biggest, most undeniable "Commonality" found in Doc 1b. This is a direct problem-and-solution broadcast targeting the primary victim of the crisis.
2. **The Flank / Sideways Attack (The Ignored Actor):** Do not focus on the obvious victim (e.g., the farmer). Focus on the hidden secondary actor (e.g., the truck mechanic, the warehouse guard, the local bureaucrat). Build the broadcast around how fixing *their* problem solves the macro crisis.
3. **The Trojan Horse (The Bait & Switch):** Hook the audience using a highly relatable, everyday pain point (from a Present-era article), but midway through the Meat, execute a radical pivot to pitch a futuristic, obscure, or ${futureHorizonYear} technology (from a Future-era article or CTA) as the only real solution.
4. **The Contrarian Crossfire (The Debate):** Build the entire broadcast around the biggest "Contradiction/Friction Point" found in Doc 1b. Pit the official narrative directly against the grassroots hack. This stream is designed for high-conflict live chat engagement.

#### PHASE 2: The DEF Structure Enforcement

For every pitch option, you must format the broadcast into the 3-Act DEF structure:

1. **Act 1 (THE OPEN):** State the Anchor Tension (The Killer Stat) and the Reframe Question to break the audience's assumptions immediately.
2. **Act 2 (THE MEAT):** Map the system. Expose the Villain (Political Economy). Preempt the audience's primary objection (The Skeptic's FAQ) and destroy it live using the data.
3. **Act 3 (THE CLOSE):** Force the audience into a corner. Provide the Forked Close: A Binary Choice (for a room that needs to make a decision today) OR an Open Question (for a room setting boundaries).
4. **The Ecosystem Push:** Explicitly state how the Job/Deal/Grant from the \`[LS_ASSET_INVENTORY]\` is injected at the climax of the show.

---

#### OUTPUT FORMAT (LS-DOC 1c PAYLOAD)

Output your entire response inside this single, clean Markdown block:

\`\`\`markdown
# [LIVESTREAM_MENU_PAYLOAD]

**Broadcast Hub:** ${hubTitle} | **Category:** ${currentCategory}

### 🔴 OPTION 1: The Head-On Assault (Targeting: [Insert Persona])
*   **Broadcast Title:** [Punchy, Action-Spiky Title targeting the core crisis]
*   **Act 1 (THE OPEN - Tension):** We open with [Insert Killer Stat]. We reframe the narrative by asking the audience: *"[Insert Reframe Question]"*
*   **Act 2 (THE MEAT - Map & Defend):** We expose [Insert Villain/Profiteer]. We preempt the audience's primary objection: *"[Insert Skeptic FAQ]"* and destroy it live using [Insert Data Defense].
*   **Act 3 (THE CLOSE - The Fork):** [Binary Choice OR Open Question].
    *   *Path A (Status Quo):* [Cost of doing nothing].
    *   *Path B (Intervention):* [The specific workaround/hack].
*   **The Ecosystem Push (CTA):** We climax the stream by flashing \`[Insert Job/Deal Title]\` on screen to execute Path B today.

### 🟡 OPTION 2: The Flank / Sideways Attack (Targeting: [Secondary Actor])
*   **Broadcast Title:** [Punchy, Action-Spiky Title targeting the ignored actor]
*   **Act 1 (THE OPEN - Tension):** [Content mapped to the DEF]
*   **Act 2 (THE MEAT - Map & Defend):** [Content mapped to the DEF]
*   **Act 3 (THE CLOSE - The Fork):** [Content mapped to the DEF]
*   **The Ecosystem Push (CTA):** [Content mapped to the DEF]

### 🟢 OPTION 3: The Trojan Horse (Targeting: [Investors/Visionaries])
*   **Broadcast Title:** [Punchy, Action-Spiky Title bridging a present crisis to a future tech]
*   **Act 1 (THE OPEN - Tension):** [Content mapped to the DEF]
*   **Act 2 (THE MEAT - Map & Defend):** [Content mapped to the DEF - Must include the radical pivot]
*   **Act 3 (THE CLOSE - The Fork):** [Content mapped to the DEF]
*   **The Ecosystem Push (CTA):** [Content mapped to the DEF]

### 🟣 OPTION 4: The Contrarian Crossfire (Targeting: [Operators/Policymakers])
*   **Broadcast Title:** [Punchy, Action-Spiky Title highlighting a deep contradiction]
*   **Act 1 (THE OPEN - Tension):** [Content mapped to the DEF]
*   **Act 2 (THE MEAT - Map & Defend):** [Content mapped to the DEF - Must highlight the clash between models]
*   **Act 3 (THE CLOSE - The Fork):** [Content mapped to the DEF]
*   **The Ecosystem Push (CTA):** [Content mapped to the DEF]
\`\`\``;
  }, [hubTitle, currentCategory, lsAssetMapInput, lsConflictMatrixInput, currentMonthYear, futureHorizonYear]);

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
        {/* STEP 1: THE DEEP DOSSIER ENGINE (LS-DOC 1a)                  */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
              1
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Step 1: The Deep Dossier Engine (LS-Doc 1a)
            </Typography>
          </Box>

          {/* Quick Inputs & Injected Payloads */}
          <Box sx={{ p: 2.25, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(59, 130, 246, 0.25)', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.05)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>🎯</span> Who & Where are we broadcasting for?
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                Context for the AI to extract deep, structured intelligence dossiers for your selected articles and CTA listings.
              </Typography>
            </Box>

            {/* Auto-Injected Data Status Badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={`✓ ${guidingArticles.length} Anchor Articles Auto-Injected`}
                sx={{ bgcolor: 'rgba(59, 130, 246, 0.09)', color: '#1d4ed8', fontWeight: 800, fontSize: '0.72rem', border: '1px solid rgba(59, 130, 246, 0.22)' }}
              />
              <Chip
                size="small"
                label={`✓ ${guidingJobs.length + guidingListings.length} Ecosystem CTA Listings Injected`}
                sx={{ bgcolor: 'rgba(59, 130, 246, 0.09)', color: '#1d4ed8', fontWeight: 800, fontSize: '0.72rem', border: '1px solid rgba(59, 130, 246, 0.22)' }}
              />
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
                  LS-Doc 1a Master Prompt Copied to Clipboard!
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
                  STEP 1 PROMPT · THE DEEP DOSSIER ENGINE (LS-DOC 1a)
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
                  Copy Step 1 Prompt (LS-Doc 1a: Deep Dossier Engine)
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 0.5 }} />

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 2: THE PATTERN & INTERSECTION MAPPING (LS-DOC 1b)       */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
              2
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Step 2: The Pattern & Intersection Mapping (LS-Doc 1b)
            </Typography>
          </Box>

          {/* Optional Paste Area for Step 1 Output */}
          <Box sx={{ p: 2.25, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(245, 158, 11, 0.25)', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.05)', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>📥</span> Optional: Paste [LS_ASSET_INVENTORY] Output from Step 1
              </Typography>
              {lsAssetMapInput.trim() && (
                <Chip label="Auto-Embedded Below ✓" size="small" sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: '0.68rem' }} />
              )}
            </Box>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
              Paste the Markdown response from Step 1 here to auto-embed it into the Step 2 and Step 3 prompts.
            </Typography>
            <PremiumMarkdownEditor
              colorTheme="#f59e0b"
              minRows={3}
              placeholder="# [LS_ASSET_INVENTORY] ... (Paste Step 1 output here)"
              value={lsAssetMapInput}
              onChange={(e: any) => setLsAssetMapInput(e.target.value)}
            />
          </Box>

          {/* Terminal Box for Step 2 Prompt */}
          {copiedPromptTab === 'doc1b' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.25, bgcolor: 'rgba(245, 158, 11, 0.08)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <CheckCircleIcon sx={{ color: '#f59e0b' }} />
                <Typography sx={{ color: '#b45309', fontWeight: 700, fontSize: '0.9rem' }}>
                  LS-Doc 1b Master Prompt Copied to Clipboard!
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
                  STEP 2 PROMPT · PATTERN & INTERSECTION MAPPING (LS-DOC 1b)
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
                  Copy Step 2 Prompt (LS-Doc 1b: The Smear Matrix)
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 0.5 }} />

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 3: ANGLES OF ATTACK & BROADCAST SYNTHESIZER (LS-DOC 1c) */}
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
              Step 3: The Angles of Attack & Broadcast Synthesizer (LS-Doc 1c)
            </Typography>
          </Box>

          {/* Optional Paste Area for Step 2 Output */}
          <Box sx={{ p: 2.25, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(168, 85, 247, 0.25)', boxShadow: '0 4px 16px rgba(168, 85, 247, 0.05)', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>📥</span> Optional: Paste [LS_THE_SMEAR_MATRIX] Output from Step 2
              </Typography>
              {lsConflictMatrixInput.trim() && (
                <Chip label="Auto-Embedded Below ✓" size="small" sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: '0.68rem' }} />
              )}
            </Box>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
              Paste the Markdown response from Step 2 here to auto-embed it into the final blueprint synthesis prompt.
            </Typography>
            <PremiumMarkdownEditor
              colorTheme="#a855f7"
              minRows={3}
              placeholder="# [LS_THE_SMEAR_MATRIX] ... (Paste Step 2 output here)"
              value={lsConflictMatrixInput}
              onChange={(e: any) => setLsConflictMatrixInput(e.target.value)}
            />
          </Box>

          {/* Terminal Box for Step 3 Prompt */}
          {copiedPromptTab === 'doc1c' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.25, bgcolor: 'rgba(168, 85, 247, 0.08)', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <CheckCircleIcon sx={{ color: '#a855f7' }} />
                <Typography sx={{ color: '#6b21a8', fontWeight: 700, fontSize: '0.9rem' }}>
                  LS-Doc 1c Master Prompt Copied to Clipboard!
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
                  STEP 3 PROMPT · ANGLES OF ATTACK & BROADCAST SYNTHESIZER (LS-DOC 1c)
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
                  Copy Step 3 Prompt (LS-Doc 1c: Broadcast Synthesizer)
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
              Step 4: Import Broadcast Blueprints into Studio
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
              placeholder={`# [LIVESTREAM_MENU_PAYLOAD]\n**Hub:** ${hubTitle} | **Category:** ${currentCategory}\n\n### 🔴 OPTION 1: The Logistics Operator Approach\n* **Broadcast Title:** Bypassing the Highway: Kaduna Farm-Gate Processing\n* **Act 1 (THE OPEN - Tension):** We open with ₦2.4M freight loss. We reframe: "What if the solution isn't safer trucks, but zero trucks?"\n* **Act 2 (THE MEAT - Map & Defend):** We expose checkpoint extortion syndicates. We preempt skepticism with micro-mill unit economics.\n* **Act 3 (THE CLOSE - The Fork):** Binary Choice.\n  * Path A: Keep bleeding transit rot.\n  * Path B: Deploy capital into local processing.\n* **The Ecosystem Push (CTA):** Flash [Deal ID: Sabou Capital $2M Facility] on screen.\n\n### 🟡 OPTION 2: The Deal Room Pitch (VC & Capital Focus)\n...`}
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
