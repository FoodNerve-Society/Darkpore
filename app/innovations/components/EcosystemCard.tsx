'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Card, Chip, CardMedia, Avatar, Button, keyframes } from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
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

  // ════════════════════════════════════════════════════════════════════════
  // 1. EXECUTIVE PLACEMENT DOSSIER (Jobs, Internships, Opportunities)
  // ════════════════════════════════════════════════════════════════════════
  if (isJobOrOpportunity) {
    return (
      <Card
        variant="outlined"
        onClick={() => router.push(item.link)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: '100%',
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: cardBorderRadius,
          boxShadow: isHovered ? `0 20px 45px -6px ${careerColor}25` : '0 6px 24px -4px rgba(0,0,0,0.04)',
          transform: isHovered ? 'translateY(-4px)' : 'none',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          p: { xs: 2.5, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          mt: 1.5,
          borderTop: `4px solid ${careerColor}`,
        }}
      >
        <Box>
          {/* Organization Avatar & Category Chip */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={item.companyLogo || item.authorAvatarUrl}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: `${themeColor || '#10b981'}15`,
                  color: themeColor || '#10b981',
                  fontWeight: 900,
                  fontSize: '1rem',
                  border: '1.5px solid #e2e8f0',
                }}
              >
                {item.authorOrOperator.charAt(0)}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.1 }}>
                  {item.authorOrOperator}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  Verified Partner
                </Typography>
              </Box>
            </Box>

            <Chip
              label={item.type?.toUpperCase()}
              size="small"
              sx={{
                bgcolor: `${careerColor}15`,
                color: careerColor,
                fontWeight: 900,
                fontSize: '0.68rem',
                height: 24,
                borderRadius: '8px',
                letterSpacing: '0.05em',
              }}
            />
          </Box>

          {/* Job Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.25,
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              mb: 2,
              letterSpacing: '-0.01em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.title}
          </Typography>

          {/* Location & Compensation Pill */}
          {item.locationOrSalary && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                px: 1.8,
                py: 0.8,
                borderRadius: '10px',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                mb: 2.5,
              }}
            >
              <LocationOnOutlinedIcon sx={{ fontSize: 17, color: themeColor || '#10b981' }} />
              {item.locationOrSalary}
            </Box>
          )}
        </Box>

        {/* Footer: Deadline & Apply Button */}
        <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
            {item.metaInfo || 'Actively Hiring'}
          </Typography>

          <Button
            size="small"
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor: careerColor,
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.78rem',
              borderRadius: '10px',
              px: 2.2,
              py: 0.8,
              textTransform: 'none',
              boxShadow: `0 4px 14px ${careerColor}40`,
              '&:hover': { opacity: 0.9, bgcolor: careerColor },
            }}
          >
            Apply Now
          </Button>
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
    let liveStatus = 'upcoming';
    if (item.metaInfo?.toLowerCase().includes('happening now') || item.metaInfo?.toLowerCase().includes('live')) liveStatus = 'live';
    else if (item.metaInfo?.toLowerCase().includes('ended') || item.metaInfo?.toLowerCase().includes('past') || item.metaInfo?.toLowerCase().includes('replay')) liveStatus = 'past';

    const getLiveBadgeProps = () => {
      if (liveStatus === 'live') return { label: '🔴 LIVE NOW', bg: 'rgba(220, 38, 38, 0.92)', color: '#ffffff', pulse: true };
      if (liveStatus === 'upcoming') return { label: '🗓️ UPCOMING', bg: 'rgba(245, 158, 11, 0.92)', color: '#ffffff', pulse: false };
      return { label: '▶️ REPLAY', bg: 'rgba(15, 23, 42, 0.92)', color: '#ffffff', pulse: false };
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
          bgcolor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible',
          position: 'relative',
          p: 0,
        }}
      >

        {/* Narrow Cover Image */}
        <Box
          sx={{
            position: 'relative',
            width: '100%', // Changed to 100% since badge is now inside
            mx: 'auto',
            mt: 0, // removed top margin
            pt: '56%', // slightly taller
            bgcolor: '#0f172a',
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
          }}
        >
          <CardMedia
            component="img"
            image={item.thumbnailUrl || 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&q=80&w=800'}
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
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {badgeProps.pulse ? (
              <Box sx={{ position: 'absolute', inset: 0, border: '4px solid rgba(220,38,38,0.5)', animation: `${pulseAnimation} 2s infinite` }} />
            ) : null}
            <PlayCircleFilledIcon sx={{ fontSize: 56, color: '#ffffff', opacity: 0.95, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }} />
          </Box>
          
          {/* Badge inside image space */}
          <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 25 }}>
            <Chip
              label={badgeProps.label}
              size="small"
              sx={{
                bgcolor: badgeProps.bg,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: badgeProps.color,
                fontWeight: 900,
                fontSize: '0.68rem',
                height: 26,
                px: 2,
                borderRadius: '8px',
                letterSpacing: '0.08em',
                boxShadow: badgeProps.pulse ? '0 4px 20px rgba(220, 38, 38, 0.4)' : 'none',
              }}
            />
          </Box>
        </Box>

        {/* Wider Text Area Container Base */}
        <Box
          sx={{
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: cardBorderRadius,
            mt: isHovered ? '-24px' : '-14px',
            position: 'relative',
            zIndex: 2,
            p: 2.5,
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.25,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.title}
            </Typography>

            {/* Presenter & Date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
              <Avatar src={item.authorAvatarUrl} sx={{ width: 28, height: 28, border: '1px solid #e2e8f0' }} />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#0f172a', lineHeight: 1.1 }}>
                  With {item.authorOrOperator}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                  {item.metaInfo || 'Wed • 7:00 PM WAT'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: '#16a34a',
              color: '#ffffff',
              fontWeight: 900,
              py: 1,
              borderRadius: '12px',
              fontSize: '0.85rem',
              textTransform: 'none',
              boxShadow: '0 4px 16px rgba(22, 163, 74, 0.35)',
              '&:hover': { bgcolor: '#15803d' },
            }}
          >
            Register for Live
          </Button>
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
      return 'rgba(147, 51, 234, 0.75)'; // Electric Purple for Future
    } else if (eraStr.includes('past') || eraStr.includes('history')) {
      return 'rgba(217, 119, 6, 0.75)'; // Warm Amber for Past
    }
    return 'rgba(22, 163, 74, 0.75)'; // Vibrant Emerald for Present
  };

  const getEraBgColor = (eraStr: string) => {
    if (eraStr.includes('future')) {
      return 'rgba(58, 12, 89, 0.85)'; // Deep Indigo for Future
    } else if (eraStr.includes('past')) {
      return 'rgba(67, 20, 7, 0.85)'; // Deep Terracotta for Past
    }
    return 'rgba(15, 23, 42, 0.85)'; // Slate Navy for Present
  };

  let generatedPills = [
    { icon: <AutoAwesomeIcon sx={{ fontSize: 13, color: '#16a34a' }} />, text: '3 Bottlenecks Isolated', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    { icon: <AnalyticsOutlinedIcon sx={{ fontSize: 14, color: '#3b82f6' }} />, text: 'Myth vs Fact Included', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
    { icon: '📊', text: 'Live Data Polls', bg: '#f8fafc', color: '#334155', border: '#e2e8f0' },
    { icon: '💡', text: '4 Actionable Solutions', bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  ];

  if (item.tags && item.tags.length > 0) {
    const colors = [
      { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
      { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
      { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' },
      { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
    ];
    generatedPills = item.tags.map((tag, idx) => ({
      icon: '🏷️',
      text: tag,
      ...colors[idx % colors.length]
    }));
  }

  const autoPills = generatedPills;

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

          {/* TICKER TAPE — Each card scrolls its own pills once, then signals completion */}
          <Box sx={{ overflow: 'hidden', width: '100%', position: 'relative', mb: 1.5, height: 26 }}>
            <Box
              key={tickerKey}
              onAnimationEnd={handleAnimationEnd}
              sx={{
                display: 'flex',
                gap: '12px',
                width: 'max-content',
                // Single pass: plays once, holds at end position
                animation: shouldPlay
                  ? `${marqueeOnce} ${Math.max(8, autoPills.length * 3)}s linear forwards`
                  : 'none',
              }}
            >
              {/* 2x duplication so -50% = exactly one full set scrolled through */}
              {[...autoPills, ...autoPills].map((p, idx) => (
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
                  {p.icon}
                  {p.text}
                </Box>
              ))}
            </Box>
          </Box>
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
