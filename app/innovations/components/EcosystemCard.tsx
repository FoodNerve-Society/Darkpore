'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Card, Chip, CardMedia, Avatar, Button, keyframes, CircularProgress } from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import { motion } from 'framer-motion';
import { EcosystemItem } from './TabbedHero';
import { useRouter } from 'next/navigation';

interface EcosystemCardProps {
  item: EcosystemItem;
  themeColor: string;
  hideTags?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  tickerIndex?: number;
  activeTickerIndex?: number;
  variant?: 'default' | 'compact';
  /** Called when this card's ticker tape finishes one full scroll */
  onTickerComplete?: () => void;
}

// Single-pass scroll: content scrolls from 0 to -50% exactly once
const marqueeOnce = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
`;

export const EcosystemCard: React.FC<EcosystemCardProps> = ({
  item,
  themeColor,
  hideTags = false,
  isFirst = false,
  isLast = false,
  tickerIndex = 0,
  activeTickerIndex = -1,
  variant = 'default',
  onTickerComplete,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Each card tracks whether IT is the active sequenced card
  const isSequencedActive = tickerIndex === activeTickerIndex;
  // Ticker plays if: this card is the sequenced active card, OR user is hovering this card
  const shouldPlay = isSequencedActive || isHovered;

  // Key trick: increment to force-remount the animation element, resetting it to position 0
  const [tickerKey, setTickerKey] = useState(0);
  useEffect(() => {
    if (isSequencedActive) {
      // Reset the animation to the start whenever this card becomes active
      setTickerKey(prev => prev + 1);
    }
  }, [isSequencedActive]);

  // Called when the CSS animation completes its single pass
  const handleAnimationEnd = useCallback(() => {
    // Only advance the sequence if this card is the sequenced active one
    // (not if it was just being hovered)
    if (isSequencedActive && onTickerComplete) {
      onTickerComplete();
    }
  }, [isSequencedActive, onTickerComplete]);

  const isJobOrOpportunity =
    item.type === 'Jobs' ||
    item.type === 'Internships' ||
    item.type === 'Opportunities' ||
    item.type === 'Volunteering';

  const isLivestream = item.type === 'Activities' || item.isLive || item.categoryLabel === 'LIVESTREAM';
  const isMission = item.type === 'Missions';

  // Asymmetric corner radii for swimlane flow: First card super-rounded left, Last card super-rounded right
  const cardBorderRadius = '20px'; // Standardized smooth radii

  const getCareerColor = (type: string) => {
    if (type?.toLowerCase().includes('job')) return '#10b981'; // Emerald for Jobs
    if (type?.toLowerCase().includes('intern')) return '#3b82f6'; // Blue for Internships
    if (type?.toLowerCase().includes('volunteer')) return '#ec4899'; // Pink for Volunteering
    if (type?.toLowerCase().includes('opportunit')) return '#8b5cf6'; // Purple for Opportunities
    return themeColor || '#10b981';
  };
  const careerColor = getCareerColor(item.type || '');

  const liveStatus = React.useMemo(() => {
    if (item.metaInfo?.toLowerCase().includes('happening now') || item.metaInfo?.toLowerCase().includes('live')) return 'live';
    if (item.metaInfo?.toLowerCase().includes('ended') || item.metaInfo?.toLowerCase().includes('past') || item.metaInfo?.toLowerCase().includes('replay')) return 'past';
    return 'upcoming';
  }, [item.metaInfo]);

  const autoPills = React.useMemo(() => {
    const defaultColors = [
      { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
      { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
      { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' },
      { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
    ];
    if (isJobOrOpportunity) {
      return [
        { icon: '📍', text: item.locationOrSalary || 'Remote', ...defaultColors[0] },
        { icon: '💰', text: item.metaInfo || 'Actively Hiring', ...defaultColors[1] },
        { icon: '→', text: 'Apply before deadline', ...defaultColors[3] }
      ];
    }
    if (isLivestream) {
      return [
        { icon: liveStatus === 'live' ? '🔴' : '🗓️', text: liveStatus === 'live' ? 'LIVE NOW' : 'UPCOMING', ...defaultColors[3] },
        { icon: '🎙️', text: `With ${item.authorOrOperator}`, ...defaultColors[1] },
        { icon: '→', text: liveStatus === 'live' ? 'Join Broadcast' : 'Set Reminder', ...defaultColors[2] }
      ];
    }
    if (isMission) {
      return [
        { icon: '🤝', text: `Partner: ${item.organizationName || 'FoodNerve'}`, ...defaultColors[0] },
        { icon: '📈', text: `${item.progress || 0}% Funded`, ...defaultColors[1] },
        { icon: '→', text: 'View Mission Impact', ...defaultColors[2] }
      ];
    }
    if (item.tags && item.tags.length > 0) {
      return item.tags.map((tag, idx) => ({
        icon: '🏷️',
        text: tag,
        ...defaultColors[idx % defaultColors.length]
      }));
    }
    return [
      { icon: '⏱️', text: item.metaInfo || '5 min read', ...defaultColors[1] },
      { icon: '🔥', text: 'Trending Analysis', ...defaultColors[3] },
      { icon: '→', text: 'Read full analysis', ...defaultColors[0] }
    ];
  }, [isJobOrOpportunity, isLivestream, isMission, item, liveStatus]);

  const renderTickerTape = () => (
    <Box sx={{ overflow: 'hidden', width: '100%', position: 'relative', mb: 1.5, height: 26, flexShrink: 0 }}>
      <Box
        sx={{
          display: 'flex',
          gap: '12px',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {autoPills.map((p, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: p.bg,
              color: p.color,
              border: `1px solid ${p.border}`,
              px: 1.2,
              py: 0.4,
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            <Box component="span" sx={{ fontSize: '0.75rem' }}>{p.icon}</Box>
            {p.text}
          </Box>
        ))}
      </Box>
    </Box>
  );

  // ════════════════════════════════════════════════════════════════════════
  // 1. EXECUTIVE PLACEMENT DOSSIER (Jobs, Internships, Opportunities)
  // ════════════════════════════════════════════════════════════════════════
  if (isJobOrOpportunity) {
    return (
      <Card
        variant="outlined"
        onClick={() => router.push(item.link || '#')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: '100%',
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: cardBorderRadius,
          boxShadow: isHovered ? `0 20px 40px -8px ${careerColor}30, 0 0 0 1px ${careerColor}40` : '0 4px 20px -4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)',
          transform: isHovered ? 'translateY(-6px)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          p: { xs: 2.5, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          mt: 1.5,
          background: `linear-gradient(135deg, #ffffff 10%, ${careerColor}15 100%)`,
        }}
      >
        <Box>
          {/* Organization Avatar & Category Chip */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
            {(item.companyLogo || item.authorAvatarUrl) ? (
              <Box
                sx={{
                  p: 0.6,
                  borderRadius: "12px",
                  bgcolor: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={item.companyLogo || item.authorAvatarUrl}
                  alt={item.authorOrOperator}
                  sx={{
                    maxHeight: 34,
                    maxWidth: 80,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </Box>
            ) : (
              <Avatar
                sx={{ width: 40, height: 40, bgcolor: `${careerColor}15`, color: careerColor, fontWeight: 900, borderRadius: "10px" }}
              >
                {item.authorOrOperator.charAt(0)}
              </Avatar>
            )}
            
            <Chip
              label={item.type?.toUpperCase()}
              size="small"
              sx={{
                bgcolor: `${careerColor}15`,
                color: careerColor,
                fontWeight: 900,
                fontSize: '0.65rem',
                height: 24,
                borderRadius: '6px',
                letterSpacing: '0.05em',
                boxShadow: `inset 0 0 0 1px ${careerColor}30`,
              }}
            />
          </Box>
          
          <Box sx={{ mb: 3, flex: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, mb: 0.5, letterSpacing: '0.02em' }}>
              {item.authorOrOperator}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.25, fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
               {item.locationOrSalary && (
                 <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', px: 1.5, py: 0.5, borderRadius: '8px', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                   <LocationOnOutlinedIcon sx={{ fontSize: 14, color: careerColor }} /> {item.locationOrSalary}
                 </Box>
               )}
               <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', px: 1.5, py: 0.5, borderRadius: '8px', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                 <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: careerColor }} /> {item.metaInfo || 'Actively Hiring'}
               </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', pt: 2.5, mt: 'auto' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: careerColor }}>
            View Details
          </Typography>
          <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: `${careerColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: careerColor, transition: 'all 0.3s', '.MuiCard-root:hover &': { bgcolor: careerColor, color: '#fff', transform: 'translateX(4px)' } }}>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      </Card>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 1.5 MISSIONS DOSSIER
  // ════════════════════════════════════════════════════════════════════════
  if (isMission) {
    return (
      <Card
        variant="outlined"
        onClick={() => router.push(item.link || '#')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: '100%',
          bgcolor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: cardBorderRadius,
          boxShadow: isHovered ? `0 20px 45px -6px rgba(236, 72, 153, 0.25)` : '0 6px 24px -4px rgba(0,0,0,0.5)',
          transform: isHovered ? 'translateY(-4px)' : 'none',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          mt: 1.5,
        }}
      >
        <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={item.thumbnailUrl}
            alt={item.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', transform: isHovered ? 'scale(1.05)' : 'none', transition: 'transform 0.4s ease' }}
          />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f172a, transparent)' }} />
          <Chip
            label={item.metaInfo?.toUpperCase() || 'MISSION'}
            size="small"
            sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(236, 72, 153, 0.9)', color: '#fff', fontWeight: 900, fontSize: '0.65rem', borderRadius: '8px' }}
          />
        </Box>
        <Box sx={{ p: { xs: 2.5, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.25, fontSize: { xs: '1.05rem', sm: '1.15rem' }, mb: 1, letterSpacing: '-0.01em' }}>
              {item.title}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, mb: 3 }}>
              Led by: <Box component="span" sx={{ color: '#ec4899' }}>{item.authorOrOperator}</Box>
            </Typography>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>Progress</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#ec4899' }}>{item.progress || 0}%</Typography>
            </Box>
            <Box sx={{ width: '100%', height: 6, bgcolor: '#334155', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ width: `${item.progress || 0}%`, height: '100%', bgcolor: '#ec4899', borderRadius: 3 }} />
            </Box>
          </Box>
        </Box>
      </Card>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. LIVE SUMMIT / BROADCAST EXPERIENCE CARD (Livestreams)
  // ════════════════════════════════════════════════════════════════════════
  if (isLivestream) {
    const getLiveBadgeProps = () => {
      if (liveStatus === 'live') {
        return { 
          label: 'LIVE', 
          color: '#ef4444', 
          pulse: true, 
          iconNode: <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444', mr: 0.75, animation: `${pulseAnimation} 1.5s infinite` }} /> 
        };
      }
      if (liveStatus === 'upcoming') {
        return { 
          label: 'UPCOMING', 
          color: '#ffffff', 
          pulse: false, 
          iconNode: <Box sx={{ display: 'flex', gap: 0.3, mr: 0.75, alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#fff', animation: `${pulseAnimation} 1.5s infinite`, animationDelay: `${i * 0.2}s` }} />
            ))}
          </Box>
        };
      }
      return { 
        label: 'WATCH', 
        color: '#ffffff', 
        pulse: false, 
        iconNode: <PlayArrowIcon sx={{ fontSize: '1rem', mr: 0.25, color: '#fff' }} /> 
      };
    };
    const badgeProps = getLiveBadgeProps();

    return (
      <Card
        variant="outlined"
        onClick={() => router.push(item.link || '#')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: '100%',
          minHeight: { xs: 360, sm: 420 },
          bgcolor: '#000000',
          border: badgeProps?.pulse ? '1px solid rgba(239,68,68,0.6)' : '1px solid #1e293b',
          borderRadius: cardBorderRadius,
          boxShadow: badgeProps?.pulse 
            ? (isHovered ? '0 0 50px rgba(239,68,68,0.6)' : '0 0 30px rgba(239,68,68,0.3)')
            : (isHovered ? '0 20px 45px -6px rgba(0,0,0,0.6)' : '0 6px 24px -4px rgba(0,0,0,0.4)'),
          transform: isHovered ? 'translateY(-4px)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 0,
        }}
      >
        {/* MINIMALIST TOP-LEFT TAG OVERLAY */}
        {badgeProps && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 25,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(0,0,0,0.5)',
              px: 1.5, py: 0.5, borderRadius: '8px',
              backdropFilter: 'blur(8px)',
            }}
          >
            {badgeProps.iconNode}
            <Typography sx={{ color: badgeProps.color, fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.08em' }}>
              {badgeProps.label}
            </Typography>
          </Box>
        )}

        {/* Split Layout: Image 16:9 Top, Content Bottom */}
        <Box sx={{ position: 'relative', height: 'auto', aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0 }}>
          <CardMedia
            component="img"
            image={item.thumbnailUrl || 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&q=80&w=800'}
            alt={item.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.08)' : 'scale(1.02)',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </Box>

        {/* Content Container */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5, bgcolor: '#0f172a', zIndex: 2 }}>
          {/* Button Floating Between Image and Text Area */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: '-44px',
              mb: 2,
              position: 'relative',
              zIndex: 10,
              backdropFilter: 'blur(8px)',
              bgcolor: badgeProps?.pulse ? '#dc2626' : 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontWeight: 800,
              py: 1.2,
              borderRadius: '10px',
              fontSize: '0.9rem',
              textTransform: 'none',
              boxShadow: badgeProps?.pulse ? '0 4px 16px rgba(220,38,38,0.4)' : '0 4px 12px rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: badgeProps?.pulse ? '#b91c1c' : 'rgba(255,255,255,0.25)' },
            }}
          >
            {liveStatus === 'live' ? 'Join Livestream Now' : liveStatus === 'upcoming' ? 'Set Reminder' : 'Watch Replay'}
          </Button>

          {/* Bottom Area: Title, Presenter */}
          <Box sx={{ mt: 'auto' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.25,
                fontSize: { xs: '1.05rem', sm: '1.15rem' },
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar src={item.authorAvatarUrl} sx={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)' }} />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.1 }}>
                  {item.authorOrOperator}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                  {item.metaInfo || 'Wed • 7:00 PM WAT'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. SYSTEM INTELLIGENCE BRIEF (Articles & Research Dossiers)
  // ════════════════════════════════════════════════════════════════════════
  const eraRaw = (item.era || 'Present').toLowerCase();
  const eraLabel = (item.era || 'Present').toUpperCase();
  const subcategoryTag = (item.categoryLabel || 'SAVINGS').toUpperCase();
  const organizationName = item.organizationName || 'FoodNerve Systems';

  // Dynamic Era color palette for subcategory & era pills
  const getSubcategoryBgColor = (eraStr: string) => {
    if (eraStr.includes('future') || eraStr.includes('next')) {
      return 'rgba(147, 51, 234, 0.45)'; // Electric Purple for Future
    } else if (eraStr.includes('past') || eraStr.includes('history')) {
      return 'rgba(217, 119, 6, 0.45)'; // Warm Amber for Past
    }
    return 'rgba(22, 163, 74, 0.45)'; // Vibrant Emerald for Present
  };

  const getEraBgColor = (eraStr: string) => {
    if (eraStr.includes('future')) {
      return 'rgba(58, 12, 89, 0.55)'; // Deep Indigo for Future
    } else if (eraStr.includes('past')) {
      return 'rgba(67, 20, 7, 0.55)'; // Deep Terracotta for Past
    }
    return 'rgba(15, 23, 42, 0.55)'; // Slate Navy for Present
  };

  const articleTargetUrl = (item.link && item.link !== '/learn') 
    ? item.link 
    : `/learn/article/${item.slug || item.id}`;

  return (
    <Card
      variant="outlined"
      onClick={() => router.push(articleTargetUrl)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        bgcolor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        position: 'relative',
        p: 0,
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* COHESIVE DUAL-PILL CAPSULE AT THE VERY TOP EDGE (SOFTENED ASYMMETRIC INNER RADII) */}
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          display: 'flex',
          alignItems: 'center',
          gap: 0.3,
          width: 'max-content',
        }}
      >
        {/* Subcategory Pill */}
        <Chip
          label={subcategoryTag}
          size="small"
          sx={{
            bgcolor: getSubcategoryBgColor(eraRaw),
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.6rem',
            height: 20,
            px: 1,
            borderRadius: '999px 12px 12px 999px',
            letterSpacing: '0.05em',
            boxShadow: 'none',
            border: 'none',
          }}
        />

        {/* Era Pill */}
        <Chip
          label={eraLabel}
          size="small"
          sx={{
            bgcolor: getEraBgColor(eraRaw),
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.6rem',
            height: 20,
            px: 1,
            borderRadius: '12px 999px 999px 12px',
            letterSpacing: '0.05em',
            boxShadow: 'none',
            border: 'none',
          }}
        />
      </Box>

      {/* NARROWER COVER IMAGE CONTAINER (Sits cleanly inside wider text base) */}
      <Box
        sx={{
          position: 'relative',
          width: variant === 'compact' ? '96%' : '92%',
          mx: 'auto',
          mt: variant === 'compact' ? 0.5 : 1,
          pt: variant === 'compact' ? '45%' : '52%',
          bgcolor: '#0f172a',
          borderRadius: '24px 24px 0 0',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        }}
      >
        <CardMedia
          component="img"
          image={item.thumbnailUrl}
          alt={item.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(15,23,42,0.35) 100%)' }} />
      </Box>

      {/* WIDER TEXT CONTAINER BASE (Asymmetric Corner Radii for Swimlane Flow & Hover Motion) */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: cardBorderRadius,
          mt: isHovered ? '-26px' : '-16px',
          position: 'relative',
          zIndex: 2,
          p: { xs: 2.2, sm: 2.5 },
          pt: 2.5,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHovered ? '0 20px 45px -6px rgba(0,0,0,0.14)' : '0 6px 24px -4px rgba(0,0,0,0.04)',
          transform: isHovered ? 'translateY(-4px)' : 'none',
        }}
      >
        <Box>
          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.3,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              letterSpacing: '-0.01em',
              mb: 1.8,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.title}
          </Typography>

          {renderTickerTape()}
        </Box>

        {/* FOOTER: Smaller & Ultra-Premium Author Name & Organization Section */}
        <Box sx={{ pt: 1.2, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={item.authorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            sx={{ width: 26, height: 26, border: '1px solid #e2e8f0' }}
          />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a', lineHeight: 1.1 }}>
              {item.authorOrOperator}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, lineHeight: 1 }}>
              {organizationName}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};
