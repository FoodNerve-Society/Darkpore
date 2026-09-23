'use client';

import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Chip, Button, Paper,
  alpha, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FormatSize as SubheadingIcon,
  FactCheck as ExecSummaryIcon,
  MonetizationOn as HighlightIcon,
  Article as CoreIcon,
  Collections as MediaIcon,
  Compare as MythFactIcon,
  FormatQuote as QuoteIcon,
  HowToVote as PollIcon,
  QueryStats as DataEmbedIcon,
  Terminal as StrategicDirectiveIcon,
  TouchApp as CtaIcon,
  TableChart as ComparisonMatrixIcon,
  Calculate as UnitEconomicsIcon,
  Checklist as ProtocolStepsIcon,
  Timeline as TimelineTrackerIcon,
  Badge as PersonaDossierIcon,
  Hub as EcosystemEmbedIcon,
  AutoAwesome as SparkleIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { BlockType, BLOCK_DEFINITIONS } from '@/lib/config/articleBlueprints';

export interface BlockOptionMeta {
  type: BlockType;
  label: string;
  role: string;
  category: 'core' | 'data' | 'tactical' | 'engagement';
  categoryLabel: string;
  desc: string;
  hint: string;
  badge: string;
  color: string;
  icon: React.ReactNode;
}

export const RICH_BLOCK_OPTIONS: BlockOptionMeta[] = [
  {
    type: 'subheading',
    label: 'Spiky Title',
    role: 'The Action Hook',
    category: 'core',
    categoryLabel: 'Core Editorial',
    desc: 'Hook readers by explicitly naming the systemic failure, geography, affected actors, and urgent command.',
    hint: 'e.g. The ₦1,400/L Fuel Reality: Why Kano Truckers Must Adapt',
    badge: 'Header / H1',
    color: '#64748b',
    icon: <SubheadingIcon />
  },
  {
    type: 'exec_summary',
    label: 'Key Takeaways',
    role: 'Executive TL;DR',
    category: 'core',
    categoryLabel: 'Core Editorial',
    desc: '3 punchy executive bullet points summarizing the thesis, key friction point, and operational takeaway.',
    hint: '3 structured bullets synthesizing the essential insights',
    badge: 'Executive Summary',
    color: '#10b981',
    icon: <ExecSummaryIcon />
  },
  {
    type: 'highlight_card',
    label: 'Big Stat Card',
    role: 'The Hero KPI',
    category: 'data',
    categoryLabel: 'Data & Evidence',
    desc: 'High-impact stat callout highlighting total financial loss, yield percentage, or headline metric with high visual weight.',
    hint: 'e.g. 82% default rate across ₦400B in disbursed credit',
    badge: 'Hero KPI',
    color: '#8b5cf6',
    icon: <HighlightIcon />
  },
  {
    type: 'core_interactive',
    label: 'Main Analysis',
    role: 'The Core Breakdown',
    category: 'core',
    categoryLabel: 'Core Editorial',
    desc: 'Bionic structured prose breaking down the economic mechanics, root causes, and cascading value chain ripples.',
    hint: 'In-depth analysis of systemic levers and operational bottlenecks',
    badge: 'Deep Narrative',
    color: '#3b82f6',
    icon: <CoreIcon />
  },
  {
    type: 'media',
    label: 'Evidence Gallery',
    role: 'Ground Proof',
    category: 'data',
    categoryLabel: 'Data & Evidence',
    desc: 'Photographic evidence, field charts, satellite snapshots, or video embeds documenting ground truth.',
    hint: 'Multi-image gallery with captions, source names, and verified links',
    badge: 'Evidence Proof',
    color: '#0ea5e9',
    icon: <MediaIcon />
  },
  {
    type: 'myth_fact',
    label: 'Myth vs Reality',
    role: 'Historical Disconnect',
    category: 'core',
    categoryLabel: 'Core Editorial',
    desc: 'Side-by-side comparison debunking popular industry assumptions against brutal on-the-ground operational reality.',
    hint: 'Belief: Central subsidies solve yields vs Reality: Arbitrage & loss',
    badge: 'Counter-Intuitive Truth',
    color: '#ef4444',
    icon: <MythFactIcon />
  },
  {
    type: 'pull_quote',
    label: 'Strong Quote',
    role: 'Voice of the Ground',
    category: 'core',
    categoryLabel: 'Core Editorial',
    desc: 'Raw emotional testimony, interview snippet, or bold quote from a frontline operator, aggregator, or executive.',
    hint: 'Direct quote paired with persona attribution and role',
    badge: 'Operator Voice',
    color: '#f59e0b',
    icon: <QuoteIcon />
  },
  {
    type: 'live_poll',
    label: 'Quick Poll',
    role: 'Audience Consensus',
    category: 'engagement',
    categoryLabel: 'Community & Engagement',
    desc: 'Interactive voting widget asking readers to weigh in on contentious market choices, pricing, or predictions.',
    hint: 'Reader poll with dynamic voting tallies and customizable choices',
    badge: 'Interactive Poll',
    color: '#d946ef',
    icon: <PollIcon />
  },
  {
    type: 'data_embed',
    label: 'Embedded Data',
    role: 'Live Data Feed',
    category: 'data',
    categoryLabel: 'Data & Evidence',
    desc: 'Live iframe embed, external trading chart, interactive graphic, or dynamic spreadsheet view.',
    hint: 'Embed interactive dashboards, TradingView charts, or live tables',
    badge: 'Live IFrame',
    color: '#14b8a6',
    icon: <DataEmbedIcon />
  },
  {
    type: 'strategic_directive',
    label: 'Strategic Directive',
    role: "Commander's Intent",
    category: 'tactical',
    categoryLabel: 'Tactical & SOP',
    desc: 'Monospace terminal box issuing strict, authoritative commands for DFIs, policymakers, or farm managers.',
    hint: 'Strict command decree with target persona and actionable mandates',
    badge: 'Terminal Directive',
    color: '#111827',
    icon: <StrategicDirectiveIcon />
  },
  {
    type: 'call_to_action',
    label: 'Call to Action',
    role: 'Ecosystem Conversion',
    category: 'engagement',
    categoryLabel: 'Community & Engagement',
    desc: 'High-conversion banner driving readers to join the intelligence network, apply for grants, or trade.',
    hint: 'Targeted CTA button with link to ecosystem initiatives',
    badge: 'Growth Banner',
    color: '#f59e0b',
    icon: <CtaIcon />
  },
  {
    type: 'comparison_matrix',
    label: 'Showdown Table',
    role: 'Head-to-Head Benchmark',
    category: 'tactical',
    categoryLabel: 'Tactical & SOP',
    desc: 'Rigorous side-by-side benchmark table comparing CAPEX, OPEX, payback period, or tech between models.',
    hint: 'Option A vs Option B with criteria rows and verdict',
    badge: 'Comparison Matrix',
    color: '#8b5cf6',
    icon: <ComparisonMatrixIcon />
  },
  {
    type: 'unit_economics_card',
    label: 'Financial Dashboard',
    role: 'Unit Economics Model',
    category: 'data',
    categoryLabel: 'Data & Evidence',
    desc: 'Granular cost-per-hectare, margin breakdown, freight costs, or gross revenue financial model.',
    hint: 'Detailed metrics table with cost drivers and net margins',
    badge: 'Unit Economics',
    color: '#10b981',
    icon: <UnitEconomicsIcon />
  },
  {
    type: 'protocol_steps',
    label: 'Action Checklist',
    role: 'Operator Protocol',
    category: 'tactical',
    categoryLabel: 'Tactical & SOP',
    desc: 'Numbered, sequential SOP instructions detailing step-by-step field actions for team execution.',
    hint: 'Sequential phases: Setup ➔ Execution ➔ Verification',
    badge: 'Step-by-Step SOP',
    color: '#f59e0b',
    icon: <ProtocolStepsIcon />
  },
  {
    type: 'timeline_tracker',
    label: 'Timeline Tracker',
    role: 'Sequence & Roadmap',
    category: 'tactical',
    categoryLabel: 'Tactical & SOP',
    desc: 'Multi-node visual sequence mapping historical collapse stages or a multi-year 2030 rollout roadmap.',
    hint: 'Chronological timeline with event milestones and descriptions',
    badge: 'Roadmap Sequence',
    color: '#3b82f6',
    icon: <TimelineTrackerIcon />
  },
  {
    type: 'persona_dossier',
    label: 'Ground Dossier',
    role: 'Stakeholder Profile',
    category: 'core',
    categoryLabel: 'Core Editorial',
    desc: 'Deep-dive personality profile on a specific operator type (e.g. Kano Broker, Middle-Belt Miller, DFI Banker).',
    hint: 'Persona name, pain points, financial stakes, and hidden incentives',
    badge: 'Stakeholder Dossier',
    color: '#ec4899',
    icon: <PersonaDossierIcon />
  },
  {
    type: 'ecosystem_embed',
    label: 'Ecosystem Bridge',
    role: 'Marketplace Link',
    category: 'engagement',
    categoryLabel: 'Community & Engagement',
    desc: 'Direct bridge to platform jobs, trade listings, offtake contracts, or vetted service partners.',
    hint: 'Connect live trade listings or jobs from the ecosystem directory',
    badge: 'Network Bridge',
    color: '#6366f1',
    icon: <EcosystemEmbedIcon />
  },
];

interface AddCustomBlockGridProps {
  onAddBlock: (type: BlockType) => void;
  activeThemeColor?: string;
  currentBlockCount?: number;
}

export function AddCustomBlockGrid({
  onAddBlock,
  activeThemeColor = '#f59e0b',
  currentBlockCount = 0,
}: AddCustomBlockGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'data' | 'tactical' | 'engagement'>('all');
  const [recentlyAdded, setRecentlyAdded] = useState<BlockType | null>(null);

  const categories = [
    { key: 'all', label: `All Blocks (${RICH_BLOCK_OPTIONS.length})` },
    { key: 'core', label: 'Core Editorial' },
    { key: 'data', label: 'Data & Evidence' },
    { key: 'tactical', label: 'Tactical & SOP' },
    { key: 'engagement', label: 'Community & Bridge' },
  ] as const;

  const filteredBlocks = useMemo(() => {
    return RICH_BLOCK_OPTIONS.filter(b => {
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        b.label.toLowerCase().includes(q) ||
        b.role.toLowerCase().includes(q) ||
        b.desc.toLowerCase().includes(q) ||
        b.badge.toLowerCase().includes(q) ||
        b.hint.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectBlock = (type: BlockType) => {
    onAddBlock(type);
    setRecentlyAdded(type);
    setTimeout(() => setRecentlyAdded(null), 1500);
  };

  return (
    <Box sx={{
      mt: 5, p: { xs: 2.5, sm: 3.5 }, borderRadius: '28px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
      border: '1.5px solid rgba(15, 23, 42, 0.08)',
      boxShadow: '0 16px 40px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* ─── HEADER ROW ─── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '10px',
              bgcolor: alpha(activeThemeColor, 0.15),
              color: activeThemeColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AddIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 900, fontSize: { xs: '1.05rem', sm: '1.2rem' }, letterSpacing: '-0.02em' }}>
              Add Custom Block
            </Typography>
            <Chip
              label={`${currentBlockCount} In Article`}
              size="small"
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.06)', color: '#475569',
                fontWeight: 800, fontSize: '0.72rem', borderRadius: '8px'
              }}
            />
          </Box>
          <Typography sx={{ color: '#64748b', fontSize: '0.84rem', fontWeight: 500 }}>
            Choose from 17 specialized editorial blocks with rich layouts, verification badges, and field formats
          </Typography>
        </Box>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search by block name, role, or feature..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: { borderRadius: '14px', bgcolor: '#ffffff', minWidth: { xs: '100%', sm: 280 } }
            }
          }}
        />
      </Box>

      {/* ─── CATEGORY FILTER PILLS ─── */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.key;
          return (
            <Chip
              key={cat.key}
              label={cat.label}
              onClick={() => setSelectedCategory(cat.key as any)}
              sx={{
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.78rem',
                borderRadius: '12px',
                px: 0.5,
                bgcolor: isSelected ? '#0f172a' : 'rgba(255,255,255,0.9)',
                color: isSelected ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: isSelected ? '#0f172a' : 'rgba(0,0,0,0.08)',
                boxShadow: isSelected ? '0 4px 12px rgba(15,23,42,0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                '&:hover': {
                  bgcolor: isSelected ? '#1e293b' : 'rgba(0,0,0,0.04)',
                },
                transition: 'all 0.15s ease'
              }}
            />
          );
        })}
      </Box>

      {/* ─── EXPANSIVE RESPONSIVE GRID ─── */}
      {filteredBlocks.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '20px', bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
            No blocks found matching "{searchQuery}".
          </Typography>
          <Button size="small" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} sx={{ mt: 1, textTransform: 'none', fontWeight: 700 }}>
            Reset Filters
          </Button>
        </Paper>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 2.25,
        }}>
          {filteredBlocks.map(item => {
            const isJustAdded = recentlyAdded === item.type;

            return (
              <Paper
                key={item.type}
                elevation={0}
                onClick={() => handleSelectBlock(item.type)}
                sx={{
                  p: 2.25,
                  borderRadius: '20px',
                  bgcolor: '#ffffff',
                  border: '1.5px solid',
                  borderColor: isJustAdded ? '#10b981' : alpha(item.color, 0.22),
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: item.color,
                    boxShadow: `0 14px 30px ${alpha(item.color, 0.18)}, 0 2px 6px rgba(0,0,0,0.04)`,
                    '& .add-btn': {
                      bgcolor: item.color,
                      color: '#ffffff',
                      transform: 'scale(1.05)'
                    }
                  }
                }}
              >
                {/* Top Subtle Color Accent Bar */}
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                  bgcolor: item.color
                }} />

                {/* Main Card Content */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  
                  {/* Top Bar with Icon & Role Badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '12px',
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.2)} 0%, ${alpha(item.color, 0.05)} 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color,
                      border: `1px solid ${alpha(item.color, 0.25)}`,
                      boxShadow: `0 2px 8px ${alpha(item.color, 0.12)}`,
                      '& .MuiSvgIcon-root': { fontSize: 20 }
                    }}>
                      {item.icon}
                    </Box>

                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: alpha(item.color, 0.08),
                        color: item.color,
                        border: `1px solid ${alpha(item.color, 0.2)}`,
                        borderRadius: '8px'
                      }}
                    />
                  </Box>

                  {/* Title & Editorial Role */}
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.25 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: item.color, mt: 0.25, letterSpacing: '0.02em' }}>
                      {item.role}
                    </Typography>
                  </Box>

                  {/* Rich Description */}
                  <Typography sx={{
                    fontSize: '0.8rem', color: '#475569', lineHeight: 1.45,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', minHeight: 52
                  }}>
                    {item.desc}
                  </Typography>
                </Box>

                {/* Bottom Row: Hint & Add Action */}
                <Box sx={{
                  pt: 1.5, borderTop: '1px dashed rgba(0,0,0,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1
                }}>
                  <Typography sx={{
                    fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    maxWidth: '65%'
                  }}>
                    {item.hint}
                  </Typography>

                  <Button
                    className="add-btn"
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      bgcolor: isJustAdded ? '#10b981' : alpha(item.color, 0.12),
                      color: isJustAdded ? '#ffffff' : item.color,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      borderRadius: '10px',
                      p: '4px 10px',
                      minWidth: 'auto',
                      textTransform: 'none',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: item.color,
                        color: '#ffffff'
                      }
                    }}
                  >
                    {isJustAdded ? 'Added!' : 'Add'}
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
