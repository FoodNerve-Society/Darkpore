'use client';

import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  alpha,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioIcon from '@mui/icons-material/Radio';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { motion, AnimatePresence } from 'framer-motion';

export interface LivestreamIdeaOption {
  id: string;
  typeTitle: string;
  typeIcon: string;
  timeframe: 'past' | 'present' | 'future';
  eraBadge: string;
  eraColor: string;
  title: string;
  description: string;
  hook: string;
  timelinePillars: Array<{ time: string; label: string; desc: string }>;
  suggestedJobsFocus: string;
}

interface LivestreamIdeasSidePaneProps {
  open: boolean;
  onClose: () => void;
  hubTitle?: string;
  hubColor?: string;
  currentCategory?: string;
  guidingArticles?: Array<{ id: string; title: string; description?: string }>;
  onApplyIdea: (idea: {
    title: string;
    description: string;
    timeframe: 'past' | 'present' | 'future';
    category?: string;
    blocks?: any[];
  }) => void;
}

export default function LivestreamIdeasSidePane({
  open,
  onClose,
  hubTitle = 'Agro Logistics',
  hubColor = '#10b981',
  currentCategory = 'capital',
  guidingArticles = [],
  onApplyIdea,
}: LivestreamIdeasSidePaneProps) {
  const defaultTopic = useMemo(() => {
    if (guidingArticles.length > 0) {
      return `${guidingArticles[0].title} — ${hubTitle}`;
    }
    return `${hubTitle} Value Chain & Market Solutions`;
  }, [guidingArticles, hubTitle]);

  const [topicInput, setTopicInput] = useState(defaultTopic);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  // Generate 4 distinct livestream formats based on the topic & active hub
  const generatedIdeas: LivestreamIdeaOption[] = useMemo(() => {
    const rawFocus = topicInput.trim() || defaultTopic;
    const cleanTopic = rawFocus.replace(/—.*$/, '').trim();

    return [
      {
        id: 'town-hall',
        typeTitle: 'Groundwork Town Hall & Field Deep-Dive',
        typeIcon: '🎙️',
        timeframe: 'present',
        eraBadge: '⚡ Present Era',
        eraColor: '#10b981',
        title: `${cleanTopic}: Grassroots Reality & Producer Town Hall`,
        description: `An interactive live town hall addressing immediate farmgate bottlenecks, aggregation logistics, and actionable producer takeaways.`,
        hook: `Connect directly with local producers and operators to uncover what is actually happening in the field today.`,
        timelinePillars: [
          { time: '00-12m', label: 'Field Data & Problem Spotlight', desc: 'Current cluster metrics and farmgate bottlenecks' },
          { time: '12-32m', label: 'Live Stakeholder Interview', desc: 'Deep dive with cooperative leaders and input suppliers' },
          { time: '32-50m', label: 'Interactive Q&A & Role Attachments', desc: 'Open audience questions with verified job opportunities' },
        ],
        suggestedJobsFocus: 'Operational Agronomists & Field Officers',
      },
      {
        id: 'market-disconnect',
        typeTitle: 'Market Disconnect & Offtake Pitchroom',
        typeIcon: '⚡',
        timeframe: 'present',
        eraBadge: '⚡ Present Era',
        eraColor: '#f59e0b',
        title: `The Offtake Disconnect: Unlocking Trade Deals for ${cleanTopic}`,
        description: `Contrasting supply-chain myths with actual buyer demands, featuring live trade listing reviews and escrow-backed commitments.`,
        hook: `Why is food wasting at farmgates while urban processors run at half capacity? Bridging the trust and escrow gap.`,
        timelinePillars: [
          { time: '00-15m', label: 'The Disconnect (Myth vs. Fact)', desc: 'Exposing price gouging and logistics blind spots' },
          { time: '15-35m', label: 'Solution & Trade Deal Showcase', desc: 'Live offtake contracts and quality grading specs' },
          { time: '35-50m', label: 'Escrow Pitch & Deal Room', desc: 'Connecting registered sellers with verified institutional buyers' },
        ],
        suggestedJobsFocus: 'Logistics Coordinators & Trade Escrow Agents',
      },
      {
        id: 'tech-showcase',
        typeTitle: 'Future Harvest & Mechanization Showcase',
        typeIcon: '🚀',
        timeframe: 'future',
        eraBadge: '🚀 Future Era',
        eraColor: '#8b5cf6',
        title: `Mechanization 2030: Next-Gen Technology for ${cleanTopic}`,
        description: `Forward-looking broadcast exploring solar-powered cold storage, automated processing, and emerging high-tech roles.`,
        hook: `Where is the industry heading in the next 5 years? The machinery, digital contracts, and skills you need to stay ahead.`,
        timelinePillars: [
          { time: '00-10m', label: 'Emerging Megatrends', desc: 'Climate-resilient inputs and automated processing tech' },
          { time: '10-32m', label: 'Live Machinery & Tooling Demo', desc: 'Tractor-as-a-service and decentralized cold chain' },
          { time: '32-50m', label: 'Future-Proof Careers & Upskilling', desc: 'High-income roles and technical apprenticeship openings' },
        ],
        suggestedJobsFocus: 'AgTech Engineers & Equipment Fleet Managers',
      },
      {
        id: 'policy-retrospective',
        typeTitle: 'Policy, Capital & Field Case Study',
        typeIcon: '📜',
        timeframe: 'past',
        eraBadge: '📜 Past Era',
        eraColor: '#6366f1',
        title: `Lessons from Past Interventions in ${cleanTopic}`,
        description: `A retrospective on previous subsidy programs, identifying what failed, and why decentralized cooperative finance is succeeding.`,
        hook: `Understanding the historical credit traps to construct foolproof, community-backed capital structures today.`,
        timelinePillars: [
          { time: '00-15m', label: 'Historical Context & Past Failures', desc: 'Why earlier government schemes suffered default cascades' },
          { time: '15-35m', label: 'Case Study: Cooperative Resilience', desc: 'How localized trust networks solved repayment problems' },
          { time: '35-50m', label: 'Policy Blueprint & Action Items', desc: 'Frameworks for institutional investors and donor partners' },
        ],
        suggestedJobsFocus: 'Risk Analysts & Cooperative Program Managers',
      },
    ];
  }, [topicInput, defaultTopic, hubTitle]);

  const handleTriggerRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 450);
  };

  const handleSelectAndApply = (idea: LivestreamIdeaOption) => {
    setSelectedIdeaId(idea.id);
    onApplyIdea({
      title: idea.title,
      description: idea.description,
      timeframe: idea.timeframe,
      category: currentCategory,
    });
    setTimeout(() => {
      onClose();
    }, 250);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
          }
        }
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 560, md: 640 },
          bgcolor: '#f8fafc',
          borderLeft: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '-20px 0 50px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      {/* ── 1. HEADER ── */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: alpha(hubColor, 0.12),
              border: `1.5px solid ${alpha(hubColor, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            <span>📡</span>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Livestream AI Ideation
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              4 broadcast formats tailored to {hubTitle}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ── 2. INPUT & TOPIC CUSTOMIZER ── */}
      <Box sx={{ p: { xs: 2.5, sm: 3 }, pb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '20px',
            bgcolor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1 }}>
            🎯 Core Broadcast Topic / Commodity Focus
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Cassava Processing, Tractor-as-a-service..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTriggerRegenerate()}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: hubColor, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: hubColor },
                  '&.Mui-focused fieldset': { borderColor: hubColor },
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleTriggerRegenerate}
              disabled={isGenerating}
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                borderRadius: '12px',
                px: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              {isGenerating ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Refine'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* ── 3. 4 LIVESTREAM FORMAT CARDS ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: { xs: 2.5, sm: 3 },
          pb: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
            Recommended Broadcast Blueprints (Select one to apply)
          </Typography>
          <Chip
            size="small"
            label="4 Formats Ready"
            sx={{ bgcolor: alpha(hubColor, 0.12), color: hubColor, fontWeight: 800, fontSize: '0.72rem' }}
          />
        </Box>

        {generatedIdeas.map((idea, idx) => {
          const isSelected = selectedIdeaId === idea.id;

          return (
            <Paper
              key={idea.id}
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '24px',
                bgcolor: '#ffffff',
                border: isSelected ? `2px solid ${idea.eraColor}` : '1.5px solid #e2e8f0',
                boxShadow: isSelected
                  ? `0 12px 32px ${alpha(idea.eraColor, 0.18)}`
                  : '0 4px 16px rgba(0,0,0,0.03)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: idea.eraColor,
                  boxShadow: `0 8px 24px ${alpha(idea.eraColor, 0.12)}`,
                  transform: 'translateY(-2px)',
                }
              }}
            >
              {/* Top Bar: Icon + Type Badge + Era Badge */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '1.25rem' }}>{idea.typeIcon}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#0f172a' }}>
                    {idea.typeTitle}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={idea.eraBadge}
                  sx={{
                    bgcolor: alpha(idea.eraColor, 0.12),
                    color: idea.eraColor,
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    border: `1px solid ${alpha(idea.eraColor, 0.3)}`,
                  }}
                />
              </Box>

              {/* Title & Hook */}
              <Typography sx={{ fontWeight: 900, fontSize: '1.08rem', color: '#0f172a', lineHeight: 1.4, mb: 1 }}>
                {idea.title}
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, mb: 2 }}>
                {idea.description}
              </Typography>

              {/* Rundown Timeline Pillars */}
              <Box
                sx={{
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  p: 2,
                  mb: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                }}
              >
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ⏱️ Recommended 50-Min Broadcast Rundown
                </Typography>
                {idea.timelinePillars.map((p, pIdx) => (
                  <Box key={pIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                    <Box
                      sx={{
                        bgcolor: alpha(idea.eraColor, 0.15),
                        color: idea.eraColor,
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        px: 0.9,
                        py: 0.2,
                        borderRadius: '6px',
                        flexShrink: 0,
                        mt: 0.2,
                      }}
                    >
                      {p.time}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1e293b' }}>
                        {p.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {p.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Action Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleSelectAndApply(idea)}
                startIcon={<CheckCircleIcon sx={{ fontSize: '18px !important' }} />}
                sx={{
                  bgcolor: idea.eraColor,
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  py: 1.3,
                  borderRadius: '14px',
                  textTransform: 'none',
                  boxShadow: `0 6px 18px ${alpha(idea.eraColor, 0.3)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: idea.eraColor,
                    opacity: 0.92,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 8px 24px ${alpha(idea.eraColor, 0.4)}`,
                  }
                }}
              >
                Use This Livestream Idea
              </Button>
            </Paper>
          );
        })}
      </Box>
    </Drawer>
  );
}
