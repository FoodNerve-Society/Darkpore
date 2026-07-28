'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, Chip, CardMedia, Avatar, Button } from '@mui/material';
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
}

export const EcosystemCard: React.FC<EcosystemCardProps> = ({
  item,
  themeColor,
  hideTags = false,
  isFirst = false,
  isLast = false,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const isJobOrOpportunity =
    item.type === 'Jobs' ||
    item.type === 'Internships' ||
    item.type === 'Opportunities' ||
    item.type === 'Volunteering';

  const isLivestream = item.type === 'Activities' || item.isLive || item.categoryLabel === 'LIVESTREAM';

  // Asymmetric corner radii for swimlane flow: First card super-rounded left, Last card super-rounded right
  const cardBorderRadius = isFirst
    ? '36px 24px 24px 36px'
    : isLast
    ? '24px 36px 36px 24px'
    : '28px';

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
          boxShadow: isHovered ? '0 20px 45px -6px rgba(0,0,0,0.12)' : '0 6px 24px -4px rgba(0,0,0,0.04)',
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
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgcolor: themeColor || '#10b981',
            opacity: isHovered ? 1 : 0.6,
            transition: 'opacity 0.3s ease',
          },
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
              label={item.categoryLabel || item.type.toUpperCase()}
              size="small"
              sx={{
                bgcolor: `${themeColor || '#10b981'}15`,
                color: themeColor || '#10b981',
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
              bgcolor: themeColor || '#10b981',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.78rem',
              borderRadius: '10px',
              px: 2.2,
              py: 0.8,
              textTransform: 'none',
              boxShadow: `0 4px 14px ${themeColor || '#10b981'}40`,
              '&:hover': { opacity: 0.9, bgcolor: themeColor || '#10b981' },
            }}
          >
            Apply Now
          </Button>
        </Box>
      </Card>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. LIVE SUMMIT / BROADCAST EXPERIENCE CARD (Livestreams)
  // ════════════════════════════════════════════════════════════════════════
  if (isLivestream) {
    return (
      <Card
        variant="outlined"
        onClick={() => router.push(item.link)}
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
        {/* Floating Pulsing Broadcast Pill at Top Edge */}
        <Box sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 25, width: 'max-content' }}>
          <Chip
            label="🔴 LIVE BROADCAST"
            size="small"
            sx={{
              bgcolor: 'rgba(220, 38, 38, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.68rem',
              height: 26,
              px: 2,
              borderRadius: '999px',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 20px rgba(220, 38, 38, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
            }}
          />
        </Box>

        {/* Narrow Cover Image */}
        <Box
          sx={{
            position: 'relative',
            width: '92%',
            mx: 'auto',
            mt: 1,
            pt: '52%',
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
            <PlayCircleFilledIcon sx={{ fontSize: 56, color: '#ffffff', opacity: 0.95, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }} />
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
  const eraLabel = (item.era || 'Present').toUpperCase();
  const subcategoryTag = (item.categoryLabel || 'SAVINGS').toUpperCase();
  const organizationName = item.organizationName || 'FoodNerve Systems';

  const autoPills = [
    { icon: <AutoAwesomeIcon sx={{ fontSize: 13, color: '#16a34a' }} />, text: '3 Bottlenecks Isolated', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    { icon: <AnalyticsOutlinedIcon sx={{ fontSize: 14, color: '#3b82f6' }} />, text: 'Myth vs Fact Included', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
    { icon: '📊', text: 'Live Data Polls', bg: '#f8fafc', color: '#334155', border: '#e2e8f0' },
    { icon: '⚡', text: '4 Actionable Solutions', bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  ];

  // Compute a deterministic start offset based on item.id so each card's ticker starts at a different position
  const startPercent = -((item.id.charCodeAt(item.id.length - 1) || 0) % 4) * 25;

  return (
    <Card
      variant="outlined"
      onClick={() => router.push(item.link)}
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
      {/* COHESIVE DUAL-PILL CAPSULE AT THE VERY TOP EDGE (SOFTENED ASYMMETRIC INNER RADII) */}
      <Box
        sx={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
          display: 'flex',
          alignItems: 'center',
          gap: 0.3,
          width: 'max-content',
        }}
      >
        {/* Subcategory Pill - Left Outer Fully Rounded, Inner Right Softened (12px) */}
        <Chip
          label={subcategoryTag}
          size="small"
          sx={{
            bgcolor: 'rgba(22, 163, 74, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.68rem',
            height: 26,
            px: 1.8,
            borderRadius: '999px 12px 12px 999px',
            letterSpacing: '0.08em',
            boxShadow: '0 6px 18px rgba(22, 163, 74, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
          }}
        />

        {/* Era Pill - Inner Left Softened (12px), Right Outer Fully Rounded */}
        <Chip
          label={eraLabel}
          size="small"
          sx={{
            bgcolor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.68rem',
            height: 26,
            px: 1.8,
            borderRadius: '12px 999px 999px 12px',
            letterSpacing: '0.08em',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
          }}
        />
      </Box>

      {/* NARROWER COVER IMAGE CONTAINER (Sits cleanly inside wider text base) */}
      <Box
        sx={{
          position: 'relative',
          width: '92%',
          mx: 'auto',
          mt: 1,
          pt: '52%',
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

          {/* AUTO-SWIPING CONTINUOUS INSIGHT PILLS MARQUEE WITH STAGGERED START POSITION */}
          <Box sx={{ overflow: 'hidden', width: '100%', position: 'relative', mb: 1.5 }}>
            <motion.div
              initial={{ x: `${startPercent}%` }}
              animate={{ x: [`${startPercent}%`, `${startPercent - 50}%`] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 14 }}
              style={{ display: 'flex', gap: 8, width: 'max-content' }}
            >
              {[...autoPills, ...autoPills, ...autoPills].map((p, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    bgcolor: p.bg,
                    color: p.color,
                    border: `1px solid ${p.border}`,
                    px: 1.2,
                    py: 0.4,
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {p.icon}
                  {p.text}
                </Box>
              ))}
            </motion.div>
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
