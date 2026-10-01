'use client';

import React from 'react';
import { Box, Typography, Avatar, Chip, Divider } from '@mui/material';
import { alpha } from '@mui/system';
import { 
  AutoAwesome as SparkleIcon,
  PlayArrow as PlayIcon,
  FormatQuote as QuoteIcon
} from '@mui/icons-material';
import { DEF_BLOCK_DEFINITIONS } from './defBlocksConfig';
import {
  DesktopProtocolStepSlide,
  DesktopMythSlide,
  DesktopFactSlide,
  DesktopComparisonOptionSlide,
  DesktopComparisonVerdictSlide,
  DesktopTimelineMilestoneSlide,
  DesktopExecSummarySlide,
  DesktopUnitEconomicsSlide,
  DesktopPersonaDossierSlide,
  DesktopStrategicDirectiveSlide,
  DesktopCallToActionSlide,
  DesktopLivePollSlide,
} from './slides/ArticleDesktopSlides';
import {
  MobileProtocolStepSlide,
  MobileMythSlide,
  MobileFactSlide,
  MobileComparisonOptionSlide,
  MobileComparisonVerdictSlide,
  MobileTimelineMilestoneSlide,
  MobileExecSummarySlide,
  MobileUnitEconomicsSlide,
  MobilePersonaDossierSlide,
  MobileStrategicDirectiveSlide,
  MobileCallToActionSlide,
  MobileLivePollSlide,
} from './slides/ArticleMobileSlides';
import {
  DesktopJobOpportunitySlide,
  DesktopJobExecutionSlide,
  MobileJobOpportunitySlide,
  MobileJobExecutionSlide,
} from './slides/JobSlides';

export function safeStringArray(val: any, fallback: string[] = []): string[] {
  if (!val) return fallback;
  if (Array.isArray(val)) {
    if (val.length === 0) return fallback;
    return val
      .map((item: any) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return item.text || item.label || item.title || item.name || item.value || JSON.stringify(item);
        }
        return String(item ?? '');
      })
      .filter(Boolean);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return fallback;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return safeStringArray(parsed, fallback);
      }
    } catch {}
    const split = trimmed.split(/[\n\r,;|]+/).map((s) => s.trim()).filter(Boolean);
    return split.length > 0 ? split : fallback;
  }
  if (typeof val === 'object') {
    const vals = Object.values(val)
      .map((v) => (typeof v === 'string' ? v : (v as any)?.text || (v as any)?.label || String(v)))
      .filter(Boolean);
    return vals.length > 0 ? vals : fallback;
  }
  return fallback;
}

export * from './slides/ArticleDesktopSlides';
export * from './slides/ArticleMobileSlides';
export * from './slides/JobSlides';

// ── Slide Context: Dual Aspect Ratio & Transparency Engine ──
export type SlideAspectRatio = '16:9' | '9:16';

export interface SlideRenderContextType {
  aspectRatio: SlideAspectRatio;
  isTransparent: boolean;
}

export const SlideRenderContext = React.createContext<SlideRenderContextType>({
  aspectRatio: '16:9',
  isTransparent: false,
});

export const useSlideRenderContext = () => React.useContext(SlideRenderContext);

// ── Common Slide Wrapper: Responsive Aspect Ratio + OBS Transparency ──
export function SlideWrapper({
  children,
  color = '#3b82f6',
  bgUrl,
}: {
  children: React.ReactNode;
  color?: string;
  bgUrl?: string;
}) {
  const { aspectRatio, isTransparent } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: isVertical ? '9/16' : '16/9',
        height: '100%',
        maxHeight: isVertical ? '100%' : undefined,
        position: 'relative',
        borderRadius: isVertical ? '24px' : '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'inherit',
        bgcolor: isTransparent ? 'transparent' : '#ffffff',
        border: isTransparent
          ? '1.5px solid rgba(255, 255, 255, 0.25)'
          : '1.5px solid rgba(255, 255, 255, 0.85)',
        boxShadow: isTransparent ? 'none' : '0 20px 50px rgba(0,0,0,0.06)',
        ...(isTransparent
          ? {}
          : bgUrl
          ? {
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,1) 30%, rgba(255,255,255,0.7) 100%), url(${bgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
            }
          : {
              background: `linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)`,
            }),
      }}
    >
      {/* Background Ambient Blurred Orbs & Side Pattern (where there are no texts, hidden in transparent OBS overlay) */}
      {!isTransparent && (
        <>
          {/* Top-Right Ambient Blurred Orb */}
          <Box
            sx={{
              position: 'absolute',
              top: isVertical ? -30 : -60,
              right: isVertical ? -30 : -60,
              width: isVertical ? 180 : 280,
              height: isVertical ? 180 : 280,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(color || '#6366f1', 0.16)} 0%, transparent 70%)`,
              filter: 'blur(50px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          {/* Bottom-Left Ambient Blurred Orb */}
          <Box
            sx={{
              position: 'absolute',
              bottom: isVertical ? -40 : -80,
              left: isVertical ? -40 : -80,
              width: isVertical ? 200 : 320,
              height: isVertical ? 200 : 320,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(color || '#3b82f6', 0.1)} 0%, transparent 75%)`,
              filter: 'blur(60px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          {/* Subtle Side Ambient Pattern Accent in negative space */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: isVertical ? '65%' : '45%',
              backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.14) 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px',
              pointerEvents: 'none',
              zIndex: 1,
              maskImage: 'radial-gradient(circle at top right, black 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(circle at top right, black 30%, transparent 80%)',
            }}
          />
        </>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: isVertical ? { xs: 2, md: 2.5 } : { xs: 3.5, md: 5.5 },
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
          justifyContent: isVertical ? 'center' : 'flex-start',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Specific Slide Types (Responsive across 16:9 and 9:16)
// ----------------------------------------------------------------------

export function SlideSpikyTitle({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <SlideWrapper color="#64748b">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: isVertical ? '100%' : '80%' }}>
        <Chip 
          icon={<SparkleIcon sx={{ fontSize: '0.9rem !important' }} />} 
          label="KEY TOPIC" 
          size="small" 
          sx={{ alignSelf: 'flex-start', mb: isVertical ? 1.5 : 3, bgcolor: alpha('#64748b', 0.1), color: '#64748b', fontWeight: 800, fontSize: '0.72rem' }} 
        />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.35rem' : '2.5rem', md: isVertical ? '1.65rem' : '3.5rem' }, lineHeight: 1.18, color: '#0f172a', letterSpacing: '-0.02em', mb: 1.5 }}>
          {content.text || content.title || "Spiky Title"}
        </Typography>
        {content.subheadline && (
          <Typography sx={{ fontSize: isVertical ? '0.88rem' : '1.25rem', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
            {content.subheadline}
          </Typography>
        )}
      </Box>
    </SlideWrapper>
  );
}

export function SlideMythFact({ content }: { content: any }) {
  const { aspectRatio, isTransparent } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <SlideWrapper color="#ef4444">
      <Typography sx={{ fontWeight: 800, color: '#ef4444', mb: isVertical ? 1.5 : 3, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: isVertical ? '0.75rem' : '0.9rem' }}>
        The Disconnect
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row', gap: isVertical ? 1.5 : 3.5, flex: 1 }}>
        {/* Myth Side */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: isVertical ? 1.75 : 3.5, bgcolor: isTransparent ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.18)', backdropFilter: isTransparent ? 'blur(12px)' : undefined }}>
          <Chip label="THE MYTH" size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: '#ef4444', color: '#fff', fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
          <Typography sx={{ fontSize: isVertical ? '0.92rem' : '1.45rem', fontWeight: 600, color: '#0f172a', opacity: 0.85, lineHeight: 1.35 }}>
            "{content.myth || 'The widely accepted belief goes here...'}"
          </Typography>
        </Box>
        {/* Fact Side */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: isVertical ? 1.75 : 3.5, bgcolor: '#0f172a', borderRadius: '16px', color: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.2)' }}>
          <Chip label="GROUND TRUTH" size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
          <Typography sx={{ fontSize: isVertical ? '0.98rem' : '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.35 }}>
            {content.fact || 'The harsh reality that operators know...'}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

export function SlideStatCard({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <SlideWrapper color="#8b5cf6" bgUrl={content.imageUrl}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: isVertical ? 'center' : 'flex-start', textAlign: isVertical ? 'center' : 'left' }}>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '3.2rem' : '6rem', md: isVertical ? '4.2rem' : '9.5rem' }, lineHeight: 1, color: '#8b5cf6', letterSpacing: '-0.04em', mb: isVertical ? 1 : 2, textShadow: '0 10px 30px rgba(139,92,246,0.2)' }}>
          {content.stat || '99%'}
        </Typography>
        <Typography sx={{ fontSize: isVertical ? '1.1rem' : '2rem', fontWeight: 700, color: '#0f172a', maxWidth: isVertical ? '100%' : '65%', lineHeight: 1.25 }}>
          {content.label || 'The contextual label explaining the statistic'}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

export function SlideQuote({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <SlideWrapper color="#f59e0b">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <QuoteIcon sx={{ fontSize: isVertical ? '2.2rem' : '4rem', color: alpha('#f59e0b', 0.3), mb: 1 }} />
        <Typography sx={{ fontWeight: 800, fontSize: isVertical ? '1.15rem' : '2.4rem', color: '#0f172a', maxWidth: isVertical ? '100%' : '80%', lineHeight: 1.35, mb: isVertical ? 1.5 : 3 }}>
          "{content.quote || 'The insight goes here.'}"
        </Typography>
        {content.author && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 24, height: 2, bgcolor: '#f59e0b' }} />
            <Typography sx={{ fontWeight: 700, fontSize: isVertical ? '0.85rem' : '1.15rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {content.author}
            </Typography>
            <Box sx={{ width: 24, height: 2, bgcolor: '#f59e0b' }} />
          </Box>
        )}
      </Box>
    </SlideWrapper>
  );
}

export function SlideMedia({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <Box sx={{
      width: '100%',
      aspectRatio: isVertical ? '9/16' : '16/9',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative',
      bgcolor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
    }}>
      {content.imageUrl ? (
        <img src={content.imageUrl} alt="Media" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : content.videoUrl ? (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <video src={content.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <PlayIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: isVertical ? '3.5rem' : '5rem', color: 'rgba(255,255,255,0.8)' }} />
        </Box>
      ) : (
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Media Placeholder</Typography>
      )}
      {content.caption && (
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', p: isVertical ? 1.5 : 2.5, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: isVertical ? '0.82rem' : '1.15rem' }}>{content.caption}</Typography>
        </Box>
      )}
    </Box>
  );
}

export function SlideJob({ content }: { content: any }) {
  const { aspectRatio, isTransparent } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <Chip label="WE ARE HIRING" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 800, letterSpacing: '0.08em', mb: isVertical ? 1.5 : 3, fontSize: '0.72rem' }} />
        
        {content.orgLogo && <Avatar src={content.orgLogo} sx={{ width: isVertical ? 52 : 80, height: isVertical ? 52 : 80, mb: 1.5, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />}
        
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.35rem' : '2.5rem', md: isVertical ? '1.65rem' : '3.5rem' }, color: '#0f172a', lineHeight: 1.15, mb: 1 }}>
          {content.jobTitle || 'Role Title'}
        </Typography>
        <Typography sx={{ fontWeight: 600, fontSize: isVertical ? '0.88rem' : '1.35rem', color: '#64748b', display: 'flex', flexDirection: isVertical ? 'column' : 'row', alignItems: 'center', gap: isVertical ? 0.35 : 1 }}>
          <span>{content.orgName}</span>
          {!isVertical && (
            <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
          )}
          <span>{content.location}</span>
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

export function SlideRundownAct({ content, durationStr, color = '#10b981' }: { content: any; durationStr?: string; color?: string }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  const title = content.title || content.role || 'Act';
  const desc = content.description || content.desc || content.message || '';
  const focus = content.focusSummary || '';
  
  return (
    <SlideWrapper color={color}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row', alignItems: 'flex-start', gap: isVertical ? 0.75 : 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<SparkleIcon sx={{ fontSize: '0.85rem !important' }} />}
            label="BROADCAST ACT"
            size="small"
            sx={{
              bgcolor: alpha(color, 0.12),
              color: color,
              fontWeight: 900,
              letterSpacing: '0.06em',
              borderRadius: '8px',
              px: 0.5,
              fontSize: '0.72rem',
            }}
          />
          {durationStr && (
            <Chip
              label={durationStr}
              size="small"
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.68rem',
                borderRadius: '8px',
                height: 22,
              }}
            />
          )}
        </Box>

        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.5rem' : '3rem', md: isVertical ? '1.85rem' : '4.5rem' }, lineHeight: 1.1, color: '#0f172a', letterSpacing: '-0.03em', mb: 1.5 }}>
          {title}
        </Typography>

        {desc && (
          <Typography sx={{ fontSize: isVertical ? '0.92rem' : '1.5rem', color: '#475569', fontWeight: 600, maxWidth: isVertical ? '100%' : '75%', lineHeight: 1.35, mb: focus ? 1.5 : 0 }}>
            {desc}
          </Typography>
        )}

        {focus && (
          <Box sx={{ mt: 1.5, p: isVertical ? 1.25 : 2, borderRadius: '12px', bgcolor: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.25)}`, maxWidth: isVertical ? '100%' : 500 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>
              Act Directive
            </Typography>
            <Typography sx={{ fontSize: isVertical ? '0.82rem' : '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              {focus}
            </Typography>
          </Box>
        )}
      </Box>
    </SlideWrapper>
  );
}

export function SlideTransition({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <SlideWrapper color="#64748b">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <Chip label="UP NEXT" sx={{ bgcolor: '#0f172a', color: '#fff', fontWeight: 800, letterSpacing: '0.1em', mb: 3 }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '2rem' : '2.8rem', md: isVertical ? '2.8rem' : '4rem' }, color: '#0f172a', maxWidth: '85%', lineHeight: 1.15 }}>
          {content.label || content.title || 'Next Segment'}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

export function SlideFallback({ content, type }: { content: any; type: string }) {
  return (
    <SlideWrapper color="#cbd5e1">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <Chip label={type.replace('_', ' ').toUpperCase()} sx={{ bgcolor: '#e2e8f0', color: '#475569', fontWeight: 800, mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: '#0f172a', maxWidth: '75%', lineHeight: 1.3 }}>
          {content.title || content.text || content.question || 'Slide Content'}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// Adaptive Image Display supporting Wide (16:9), Square (1:1), and Portrait (9:16)
export function AdaptiveSlideImage({
  imageUrl,
  aspectRatio = '16:9',
  alt = 'Slide Visual',
  caption,
  sx = {},
}: {
  imageUrl?: string;
  aspectRatio?: 'auto' | '16:9' | '1:1' | '9:16' | string;
  alt?: string;
  caption?: string;
  sx?: any;
}) {
  if (!imageUrl) return null;

  const isWide = aspectRatio === '16:9';
  const isSquare = aspectRatio === '1:1';
  const isPortrait = aspectRatio === '9:16' || aspectRatio === 'portrait';

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: isPortrait ? '14px' : '18px',
        overflow: 'hidden',
        border: '1.5px solid rgba(255, 255, 255, 0.4)',
        boxShadow: isSquare
          ? '0 16px 36px rgba(0,0,0,0.12)'
          : isPortrait
          ? '0 20px 40px rgba(0,0,0,0.18)'
          : '0 12px 32px rgba(0,0,0,0.08)',
        bgcolor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(isWide
          ? { width: '100%', aspectRatio: '16/9' }
          : isSquare
          ? { width: { xs: 140, md: 220 }, height: { xs: 140, md: 220 }, aspectRatio: '1/1', flexShrink: 0 }
          : isPortrait
          ? { width: { xs: 120, md: 180 }, aspectRatio: '9/16', flexShrink: 0 }
          : { maxWidth: '100%', maxHeight: 260 }),
        ...sx,
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      {caption && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1.25,
            background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 100%)',
          }}
        >
          <Typography sx={{ color: '#fff', fontSize: '0.72rem', fontWeight: 600 }}>{caption}</Typography>
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------
// DEF Broadcast Slide Components (The 12 Distinct Block Layouts)
// ----------------------------------------------------------------------

// 1. Anchor Tension (Crisis photo + tension killer stat)
export function SlideAnchorTension({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  const isWide = content.aspectRatio === '16:9';
  const bg = isWide && content.imageUrl && !isVertical ? content.imageUrl : undefined;

  return (
    <SlideWrapper color="#ef4444" bgUrl={bg}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: isVertical ? 'column' : 'row', gap: isVertical ? 1.5 : 4, alignItems: isVertical ? 'stretch' : 'center' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Chip
            label="ACT 1 · ANCHOR TENSION"
            size="small"
            sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: alpha('#ef4444', 0.15), color: '#dc2626', fontWeight: 800, fontSize: '0.7rem' }}
          />
          <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.25rem' : '2rem', md: isVertical ? '1.45rem' : '3rem' }, lineHeight: 1.15, color: '#0f172a', letterSpacing: '-0.02em', mb: isVertical ? 1 : 2.5 }}>
            {content.title || content.text || 'The Operational Reality: Field Crisis Snapshot'}
          </Typography>

          <Box sx={{ p: isVertical ? 1.5 : 2.5, borderRadius: '16px', bgcolor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', maxWidth: isVertical ? '100%' : 440 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>
              The Ground Disconnect
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.35rem' : '1.8rem', md: isVertical ? '1.6rem' : '2.4rem' }, color: '#b91c1c', lineHeight: 1 }}>
              {content.stat || '₦340B Lost'}
            </Typography>
            <Typography sx={{ fontSize: isVertical ? '0.78rem' : '0.88rem', color: '#475569', mt: 0.5, fontWeight: 500 }}>
              {content.subheadline || content.label || 'Capital evaporated between farm gate and off-taker'}
            </Typography>
          </Box>
        </Box>

        {content.imageUrl && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <AdaptiveSlideImage
              imageUrl={content.imageUrl}
              aspectRatio={isVertical ? '16:9' : (content.aspectRatio || '1:1')}
              caption={content.caption}
              sx={isVertical ? { maxHeight: 125 } : undefined}
            />
          </Box>
        )}
      </Box>
    </SlideWrapper>
  );
}

// 2. Reframe Question (The Spiky Strategic Pivot)
export function SlideReframeQuestion({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <SlideWrapper color="#f59e0b">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', px: isVertical ? 0.5 : 4 }}>
        <Chip
          icon={<SparkleIcon sx={{ fontSize: '0.85rem !important' }} />}
          label="THE STRATEGIC REFRAME"
          size="small"
          sx={{ mb: isVertical ? 1.5 : 3, bgcolor: alpha('#f59e0b', 0.15), color: '#b45309', fontWeight: 800, fontSize: '0.7rem' }}
        />
        {content.convention && (
          <Typography sx={{ fontSize: isVertical ? '0.82rem' : '1.1rem', color: '#94a3b8', textDecoration: 'line-through', mb: 1, fontWeight: 600 }}>
            "{content.convention}"
          </Typography>
        )}
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.3rem' : '2.4rem', md: isVertical ? '1.5rem' : '3.6rem' }, lineHeight: 1.2, color: '#0f172a', letterSpacing: '-0.02em', maxWidth: 880, mb: isVertical ? 1.5 : 2.5 }}>
          "{content.title || content.text || 'What if the barrier isn’t seed access, but spatial land tenure?'}"
        </Typography>
        <Typography sx={{ fontSize: isVertical ? '0.85rem' : '1.1rem', color: '#64748b', fontWeight: 600, maxWidth: 650 }}>
          {content.subheadline || 'Pivoting from the visible symptom to the structural lock.'}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// 3. Funnel System (3-Layer Diagnostic)
export function SlideFunnelSystem({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  const l1 = content.layer1 || 'Layer 1: Immediate Field Symptoms (48h spoilage)';
  const l2 = content.layer2 || 'Layer 2: Logistics & Highway Corridors (Extortion & breakages)';
  const l3 = content.layer3 || 'Layer 3: Structural Policy Lock (Unbankable land titles)';

  return (
    <SlideWrapper color="#3b82f6">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isVertical ? 1 : 2.5 }}>
          <Chip label="ACT 2 · SYSTEM DIAGNOSTIC" size="small" sx={{ bgcolor: alpha('#3b82f6', 0.12), color: '#2563eb', fontWeight: 800, fontSize: '0.7rem' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>The 3-Layer Diagnostic</Typography>
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.15rem' : '1.8rem', md: isVertical ? '1.35rem' : '2.5rem' }, color: '#0f172a', mb: isVertical ? 1.25 : 3 }}>
          {content.title || 'Layered Diagnostic: Tracing the Root Friction'}
        </Typography>

        <Box sx={{ display: isVertical ? 'flex' : 'grid', flexDirection: isVertical ? 'column' : undefined, gridTemplateColumns: isVertical ? undefined : 'repeat(3, 1fr)', gap: isVertical ? 1 : 2.5 }}>
          {[
            { num: '01', title: 'IMMEDIATE FIELD', text: l1, color: '#3b82f6' },
            { num: '02', title: 'CORRIDOR & TRANSIT', text: l2, color: '#6366f1' },
            { num: '03', title: 'STRUCTURAL ROOT', text: l3, color: '#0f172a' },
          ].map((card, i) => (
            <Box
              key={i}
              sx={{
                p: isVertical ? 1.25 : 3,
                borderRadius: '16px',
                bgcolor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography sx={{ fontSize: isVertical ? '0.95rem' : '1.1rem', fontWeight: 900, color: card.color }}>{card.num}</Typography>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{card.title}</Typography>
              <Typography sx={{ fontSize: isVertical ? '0.78rem' : '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{card.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 4. Ideal vs Feasible (The NGO Dream vs Fracture vs Feasible Fix)
export function SlideIdealVsFeasible({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  const dream = content.ngoDream || content.myth || 'The NGO Dream: "Just install solar cold rooms at every farm cluster"';
  const fracture = content.fracturePoint || 'The Fracture: Inverter theft, degraded battery storage, diesel tariff spikes';
  const fix = content.feasibleFix || content.fact || 'The Feasible Fix: Decentralized dry routes, moisture bags, scheduled night rails';

  return (
    <SlideWrapper color="#8b5cf6">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 2 · THE DISCONNECT" size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: alpha('#8b5cf6', 0.12), color: '#7c3aed', fontWeight: 800, fontSize: '0.7rem' }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.15rem' : '1.8rem', md: isVertical ? '1.35rem' : '2.5rem' }, color: '#0f172a', mb: isVertical ? 1.25 : 3 }}>
          {content.title || 'Ideal vs. Feasible: Why Generic Fixes Fail'}
        </Typography>

        <Box sx={{ display: isVertical ? 'flex' : 'grid', flexDirection: isVertical ? 'column' : undefined, gridTemplateColumns: isVertical ? undefined : 'repeat(3, 1fr)', gap: isVertical ? 1 : 2.5 }}>
          {/* Dream */}
          <Box sx={{ p: isVertical ? 1.25 : 3, borderRadius: '16px', bgcolor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <Chip label="THE NGO DREAM" size="small" sx={{ bgcolor: '#f59e0b', color: '#fff', fontWeight: 800, mb: 0.5, fontSize: '0.65rem', height: 20 }} />
            <Typography sx={{ fontSize: isVertical ? '0.78rem' : '1rem', fontWeight: 600, color: '#78350f', lineHeight: 1.35 }}>{dream}</Typography>
          </Box>
          {/* Fracture */}
          <Box sx={{ p: isVertical ? 1.25 : 3, borderRadius: '16px', bgcolor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <Chip label="THE FRACTURE" size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 800, mb: 0.5, fontSize: '0.65rem', height: 20 }} />
            <Typography sx={{ fontSize: isVertical ? '0.78rem' : '1rem', fontWeight: 600, color: '#7f1d1d', lineHeight: 1.35 }}>{fracture}</Typography>
          </Box>
          {/* Fix */}
          <Box sx={{ p: isVertical ? 1.25 : 3, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <Chip label="THE FEASIBLE FIX" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 800, mb: 0.5, fontSize: '0.65rem', height: 20 }} />
            <Typography sx={{ fontSize: isVertical ? '0.78rem' : '1rem', fontWeight: 700, color: '#064e3b', lineHeight: 1.35 }}>{fix}</Typography>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 5. Scaled Burden (Macro Economics & Capital Bleed)
export function SlideScaledBurden({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <SlideWrapper color="#ec4899">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: isVertical ? 'column' : 'row', alignItems: isVertical ? 'stretch' : 'center', gap: isVertical ? 1.5 : 5 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Chip label="ACT 2 · SCALED BURDEN" size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: alpha('#ec4899', 0.12), color: '#db2777', fontWeight: 800, fontSize: '0.7rem' }} />
          <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '2.8rem' : '4.5rem', md: isVertical ? '3.4rem' : '7rem' }, lineHeight: 1, color: '#db2777', letterSpacing: '-0.04em', mb: 1 }}>
            {content.stat || '2.4M Tons'}
          </Typography>
          <Typography sx={{ fontSize: isVertical ? '1.1rem' : '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, mb: 1 }}>
            {content.label || content.title || 'Annual Perishable Crop Loss Across The Corridor'}
          </Typography>
          <Typography sx={{ fontSize: isVertical ? '0.8rem' : '1rem', color: '#64748b', fontWeight: 500 }}>
            {content.absorption || content.subheadline || 'Who absorbs the bleed: Smallholder margins drop to -8% while consumers pay 3x premiums.'}
          </Typography>
        </Box>

        {content.imageUrl && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <AdaptiveSlideImage
              imageUrl={content.imageUrl}
              aspectRatio={isVertical ? '16:9' : (content.aspectRatio || '1:1')}
              caption={content.caption}
              sx={isVertical ? { maxHeight: 125 } : undefined}
            />
          </Box>
        )}
      </Box>
    </SlideWrapper>
  );
}

// 6. Power Map (Deciders, Enforcers, Payers)
export function SlidePowerMap({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  const d = content.deciders || 'Federal Export Boards & State Port Councils';
  const e = content.enforcers || 'Informal Toll Cartels & Highway Middlemen Unions';
  const p = content.payers || 'Downstream Processing Lines Operating at 30% Capacity';

  return (
    <SlideWrapper color="#0ea5e9">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 2 · POLITICAL ECONOMY" size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: alpha('#0ea5e9', 0.12), color: '#0284c7', fontWeight: 800, fontSize: '0.7rem' }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.15rem' : '1.8rem', md: isVertical ? '1.35rem' : '2.5rem' }, color: '#0f172a', mb: isVertical ? 1.25 : 3 }}>
          {content.title || 'Power Map: Deciders, Enforcers & Payers'}
        </Typography>

        <Box sx={{ display: isVertical ? 'flex' : 'grid', flexDirection: isVertical ? 'column' : undefined, gridTemplateColumns: isVertical ? undefined : 'repeat(3, 1fr)', gap: isVertical ? 1 : 2.5 }}>
          {[
            { icon: '🏛️', tag: 'THE DECIDERS', text: d, color: '#0284c7' },
            { icon: '⚖️', tag: 'THE ENFORCERS', text: e, color: '#d97706' },
            { icon: '💸', tag: 'THE PAYERS', text: p, color: '#ef4444' },
          ].map((item, i) => (
            <Box key={i} sx={{ p: isVertical ? 1.25 : 3, borderRadius: '16px', bgcolor: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.9)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
              <Typography sx={{ fontSize: isVertical ? '1.2rem' : '1.5rem', mb: 0.25 }}>{item.icon}</Typography>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: item.color, mb: 0.25 }}>{item.tag}</Typography>
              <Typography sx={{ fontSize: isVertical ? '0.78rem' : '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{item.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 7. Response Audit (Subsidies vs Forward Contracts)
export function SlideResponseAudit({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  const sq = content.statusQuo || 'Subsidized Input Handouts (₦40B spent with 0% measurable margin improvement)';
  const pw = content.provenMove || 'Forward Contract Clearing Houses (Guaranteed off-take price at planting)';
  const gain = content.metricGain || '+34% Net Realization';

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 2 · RESPONSE AUDIT" size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 800, fontSize: '0.7rem' }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.15rem' : '1.8rem', md: isVertical ? '1.35rem' : '2.5rem' }, color: '#0f172a', mb: isVertical ? 1.25 : 3 }}>
          {content.title || 'Response Audit: Status Quo vs. What Actually Works'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: isVertical ? '1fr' : '1fr 1fr', gap: isVertical ? 1.25 : 3 }}>
          <Box sx={{ p: isVertical ? 1.5 : 3.5, borderRadius: '20px', bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <Chip label="WHAT INDUSTRY KEEPS DOING" size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 800, mb: 1, fontSize: '0.65rem', height: 20 }} />
            <Typography sx={{ fontSize: isVertical ? '0.85rem' : '1.1rem', fontWeight: 600, color: '#7f1d1d', lineHeight: 1.4 }}>{sq}</Typography>
          </Box>

          <Box sx={{ p: isVertical ? 1.5 : 3.5, borderRadius: '20px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.3)' }}>
            <Box sx={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row', alignItems: isVertical ? 'flex-start' : 'center', gap: 0.75, mb: 1 }}>
              <Chip label="WHAT ACTUALLY MOVES THE NEEDLE" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
              <Chip label={gain} size="small" sx={{ bgcolor: '#047857', color: '#fff', fontWeight: 900, fontSize: '0.65rem', height: 20 }} />
            </Box>
            <Typography sx={{ fontSize: isVertical ? '0.85rem' : '1.15rem', fontWeight: 700, color: '#064e3b', lineHeight: 1.4 }}>{pw}</Typography>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 8. Boundary Test (4-Part Gateway)
export function SlideBoundaryTest({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  const g1 = content.gate1 || 'Regulatory Pathway: Operates within state warehousing acts';
  const g2 = content.gate2 || 'Scale Velocity: Extends beyond pilot across northern corridor';
  const g3 = content.gate3 || 'Intervention Point: Bonded depot aggregation hub';
  const g4 = content.gate4 || 'Day 90 Target: 500 Tons Cleared';

  return (
    <SlideWrapper color="#6366f1">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 2 · THE 4-GATE PROOF" size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: alpha('#6366f1', 0.12), color: '#4f46e5', fontWeight: 800, fontSize: '0.7rem' }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.15rem' : '1.8rem', md: isVertical ? '1.35rem' : '2.4rem' }, color: '#0f172a', mb: isVertical ? 1.25 : 3 }}>
          {content.title || 'Boundary Test: 4 Non-Negotiable Gateways'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: isVertical ? '1fr' : 'repeat(4, 1fr)', gap: isVertical ? 1 : 2 }}>
          {[
            { num: 'G1', label: 'PATHWAY', text: g1 },
            { num: 'G2', label: 'SCALE', text: g2 },
            { num: 'G3', label: 'POINT', text: g3 },
            { num: 'G4', label: '90D KPI', text: g4 },
          ].map((gate, i) => (
            <Box key={i} sx={{ p: isVertical ? 1.25 : 2.5, borderRadius: '16px', bgcolor: '#ffffff', border: '1.5px solid rgba(99, 102, 241, 0.25)', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
              <Box sx={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row', alignItems: isVertical ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 0.5, mb: 0.5 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#4f46e5' }}>{gate.num}</Typography>
                <Chip label="VERIFIED" size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 900, bgcolor: '#dcfce7', color: '#166534' }} />
              </Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', mb: 0.25 }}>{gate.label}</Typography>
              <Typography sx={{ fontSize: isVertical ? '0.75rem' : '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{gate.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 9. Preempt Objections (Voicing the Skeptic)
export function SlidePreemptObjections({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  const quote = content.skepticQuote || content.quote || 'Farmers will default and side-sell as soon as open market prices spike';
  const disproof = content.disproofData || '94.2% Compliance Rate via Input Escrow Protocol';

  return (
    <SlideWrapper color="#d97706">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: isVertical ? 'column' : 'row', gap: isVertical ? 1.25 : 4, alignItems: isVertical ? 'stretch' : 'center' }}>
        <Box sx={{ flex: 1, p: isVertical ? 1.75 : 3.5, borderRadius: '20px', bgcolor: '#ffffff', border: '1px solid rgba(217, 119, 6, 0.25)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
          <Chip label="THE SKEPTIC'S VOICE" size="small" sx={{ bgcolor: '#d97706', color: '#fff', fontWeight: 800, mb: 1, fontSize: '0.68rem', height: 22 }} />
          <Typography sx={{ fontSize: isVertical ? '0.98rem' : '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
            "{quote}"
          </Typography>
        </Box>

        <Box sx={{ flex: 1, p: isVertical ? 1.75 : 3.5, borderRadius: '20px', bgcolor: '#0f172a', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}>
          <Chip label="HARD DATA DISPROOF" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, mb: 1, fontSize: '0.68rem', height: 22 }} />
          <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.8rem' : '2.4rem', md: isVertical ? '2.2rem' : '3.5rem' }, color: '#10b981', lineHeight: 1, mb: 0.5 }}>
            {content.stat || '94.2%'}
          </Typography>
          <Typography sx={{ fontSize: isVertical ? '0.82rem' : '1.1rem', fontWeight: 600, color: '#cbd5e1', lineHeight: 1.35 }}>
            {disproof}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 10. Return to Case (Re-evaluating the Case)
export function SlideReturnToCase({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  return (
    <SlideWrapper color="#059669">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: isVertical ? 'column' : 'row', gap: isVertical ? 1.5 : 4, alignItems: isVertical ? 'stretch' : 'center' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Chip label="ACT 3 · RETURN TO CASE" size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: alpha('#059669', 0.12), color: '#047857', fontWeight: 800, fontSize: '0.7rem' }} />
          <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.25rem' : '2.2rem', md: isVertical ? '1.45rem' : '3.2rem' }, color: '#0f172a', lineHeight: 1.15, mb: 1 }}>
            {content.title || 'Re-evaluating the Opening Case: A Solved Equation'}
          </Typography>
          <Typography sx={{ fontSize: isVertical ? '0.82rem' : '1.15rem', color: '#475569', fontWeight: 500, lineHeight: 1.45 }}>
            {content.subheadline || 'From unquantifiable field risk to an engineered, insured supply chain.'}
          </Typography>
        </Box>

        {content.imageUrl && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <AdaptiveSlideImage
              imageUrl={content.imageUrl}
              aspectRatio={isVertical ? '16:9' : (content.aspectRatio || '1:1')}
              caption={content.caption}
              sx={isVertical ? { maxHeight: 125 } : undefined}
            />
          </Box>
        )}
      </Box>
    </SlideWrapper>
  );
}

// 11. Forked Close (Status Quo Bleed vs Action ROI)
export function SlideForkedClose({ content }: { content: any }) {
  const { aspectRatio } = useSlideRenderContext();
  const isVertical = aspectRatio === '9:16';

  const pA = content.pathACost || 'Path A: Status Quo Bleed — ₦850K Lost Per Day in Avoidable Shrinkage';
  const pB = content.pathBROI || 'Path B: Corridor Deployment — 3.2x Capital Return in 18 Months';

  return (
    <SlideWrapper color="#7c3aed">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 3 · THE AUDIENCE FORK" size="small" sx={{ alignSelf: 'flex-start', mb: 1, bgcolor: alpha('#7c3aed', 0.12), color: '#6d28d9', fontWeight: 800, fontSize: '0.7rem' }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: isVertical ? '1.15rem' : '1.8rem', md: isVertical ? '1.35rem' : '2.5rem' }, color: '#0f172a', mb: isVertical ? 1.25 : 3 }}>
          {content.title || 'Two Diverging Futures: The Operational Choice'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: isVertical ? '1fr' : '1fr 1fr', gap: isVertical ? 1.25 : 3 }}>
          <Box sx={{ p: isVertical ? 1.5 : 3.5, borderRadius: '20px', bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <Chip label="PATH A · STATUS QUO" size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 800, mb: 1, fontSize: '0.65rem', height: 20 }} />
            <Typography sx={{ fontSize: isVertical ? '0.85rem' : '1.15rem', fontWeight: 700, color: '#7f1d1d', lineHeight: 1.4 }}>{pA}</Typography>
          </Box>

          <Box sx={{ p: isVertical ? 1.5 : 3.5, borderRadius: '20px', bgcolor: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
            <Chip label="PATH B · CAPITAL CONVERSION" size="small" sx={{ bgcolor: '#7c3aed', color: '#fff', fontWeight: 800, mb: 1, fontSize: '0.65rem', height: 20 }} />
            <Typography sx={{ fontSize: isVertical ? '0.85rem' : '1.15rem', fontWeight: 700, color: '#5b21b6', lineHeight: 1.4 }}>{pB}</Typography>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

/**
 * Centralized slide rendering engine for the entire Livestream Studio.
 * Synchronously consumed across:
 * 1. LivestreamRundownBuilder (Single Slide Modal Preview)
 * 2. LivestreamScreenPreviewModal (Director's Control Deck: Live Stage Monitor & Next Up)
 * 3. /stage window (External Screen-Share Broadcast Window)
 */
export function renderSlidePreviewContent(
  item: any,
  fallbackHubColor?: string,
  options?: {
    aspectRatio?: SlideAspectRatio;
    isTransparent?: boolean;
  }
) {
  const currentAspect = options?.aspectRatio || '16:9';
  const currentTransparent = Boolean(options?.isTransparent);

  const renderInner = () => {
    if (!item) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            aspectRatio: currentAspect === '9:16' ? '9/16' : '16/9',
            borderRadius: '16px',
            bgcolor: currentTransparent ? 'transparent' : '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
            No slide selected or available
          </Typography>
        </Box>
      );
    }

    const isVertical = currentAspect === '9:16';

    const isAct =
      item.sourceType === 'act' ||
      item.originalBlockType === 'rundown_act' ||
      Boolean(item.originalContent?.role);
    const isJob =
      item.sourceType === 'job' ||
      item.defBlockId === 'talent_spotlight' ||
      item.defBlockId === 'job_opportunity' ||
      item.defBlockId === 'job_execution' ||
      item.originalBlockType === 'job_opportunity' ||
      item.originalBlockType === 'job_execution' ||
      item.originalBlockType === 'job';
    const isTransition = item.sourceType === 'transition' && !isAct;

    const defBlock = item.defBlockId ? DEF_BLOCK_DEFINITIONS[item.defBlockId] : null;
    const themeColor =
      defBlock?.themeColor ||
      fallbackHubColor ||
      (isAct ? '#10b981' : isJob ? '#f59e0b' : isTransition ? '#64748b' : '#3b82f6');
    const c = item.originalContent || {};

    // 1. DEF Broadcast Block ID (11 Distinct Analytical Containers)
    if (item.defBlockId && item.defBlockId !== 'talent_spotlight') {
      switch (item.defBlockId) {
        case 'anchor_tension':
          return <SlideAnchorTension content={c} />;
        case 'reframe_question':
          return <SlideReframeQuestion content={c} />;
        case 'funnel_system':
          return <SlideFunnelSystem content={c} />;
        case 'ideal_vs_feasible':
          return <SlideIdealVsFeasible content={c} />;
        case 'scaled_burden':
          return <SlideScaledBurden content={c} />;
        case 'power_map':
          return <SlidePowerMap content={c} />;
        case 'response_audit':
          return <SlideResponseAudit content={c} />;
        case 'boundary_test':
          return <SlideBoundaryTest content={c} />;
        case 'preempt_objections':
          return <SlidePreemptObjections content={c} />;
        case 'return_to_case':
          return <SlideReturnToCase content={c} />;
        case 'forked_close':
          return <SlideForkedClose content={c} />;
        default:
          break;
      }
    }

    // 2. Ecosystem Job / Talent Spotlight (Format B: Opportunity & Execution Slides)
    if (isJob) {
      const isExecution =
        item.originalBlockType === 'job_execution' ||
        item.defBlockId === 'job_execution' ||
        item.slideIndex === 2 ||
        Boolean(c.roleScope);
      if (isVertical) {
        return isExecution ? (
          <MobileJobExecutionSlide content={c} />
        ) : (
          <MobileJobOpportunitySlide content={c} />
        );
      } else {
        return isExecution ? (
          <DesktopJobExecutionSlide content={c} />
        ) : (
          <DesktopJobOpportunitySlide content={c} />
        );
      }
    }

    // 3. Act Segment Cards
    if (isAct) {
      return (
        <SlideRundownAct
          content={c}
          durationStr={item.durationStr}
          color={themeColor}
        />
      );
    }

    // 4. Transitions
    if (isTransition) return <SlideTransition content={c} />;

    // 5. Modular Article Block Types & Decomposed Step Slides
    const blockType = item.originalBlockType || (defBlock ? 'subheading' : '');

    if (isVertical) {
      switch (blockType) {
        // Protocol / SOP steps (decomposed 1 slide per step)
        case 'protocol_step':
        case 'protocol_steps':
        case 'sop_step':
        case 'sop_steps':
        case 'workflow_step':
          return <MobileProtocolStepSlide content={c} />;

        // Myth vs Fact (decomposed 1 slide per side)
        case 'myth_slide':
        case 'myth':
          return <MobileMythSlide content={c} />;
        case 'fact_slide':
        case 'fact':
          return <MobileFactSlide content={c} />;

        // Comparison Matrix (decomposed per option and verdict)
        case 'comparison_option':
          return <MobileComparisonOptionSlide content={c} />;
        case 'comparison_verdict':
          return <MobileComparisonVerdictSlide content={c} />;

        // Timeline Milestones (decomposed per milestone)
        case 'timeline_milestone':
        case 'timeline_tracker':
        case 'milestones':
          return <MobileTimelineMilestoneSlide content={c} />;

        // Executive Summary
        case 'exec_summary':
        case 'summary':
          return <MobileExecSummarySlide content={c} />;

        // Unit Economics / Pricing
        case 'unit_economics':
        case 'pricing_model':
          return <MobileUnitEconomicsSlide content={c} />;

        // Persona Dossier
        case 'persona_dossier':
        case 'persona':
          return <MobilePersonaDossierSlide content={c} />;

        // Strategic Directive / Action Checklist
        case 'strategic_directive':
        case 'action_checklist':
          return <MobileStrategicDirectiveSlide content={c} />;

        // Call To Action / Conversion Card
        case 'call_to_action':
        case 'conversion_card':
          return <MobileCallToActionSlide content={c} />;

        // Live Poll / Audience Q&A
        case 'live_poll':
        case 'audience_qa':
          return <MobileLivePollSlide content={c} />;

        case 'subheading':
          return <SlideSpikyTitle content={c} />;
        case 'myth_fact':
        case 'myth_reality':
          return <SlideMythFact content={c} />;
        case 'highlight_card':
        case 'stat_card':
          return <SlideStatCard content={c} />;
        case 'pull_quote':
        case 'strong_quote':
          return <SlideQuote content={c} />;
        case 'media':
          return <SlideMedia content={c} />;
        default:
          return <SlideFallback content={c} type={blockType || 'slide'} />;
      }
    } else {
      switch (blockType) {
        // Protocol / SOP steps (decomposed 1 slide per step)
        case 'protocol_step':
        case 'protocol_steps':
        case 'sop_step':
        case 'sop_steps':
        case 'workflow_step':
          return <DesktopProtocolStepSlide content={c} />;

        // Myth vs Fact (decomposed 1 slide per side)
        case 'myth_slide':
        case 'myth':
          return <DesktopMythSlide content={c} />;
        case 'fact_slide':
        case 'fact':
          return <DesktopFactSlide content={c} />;

        // Comparison Matrix (decomposed per option and verdict)
        case 'comparison_option':
          return <DesktopComparisonOptionSlide content={c} />;
        case 'comparison_verdict':
          return <DesktopComparisonVerdictSlide content={c} />;

        // Timeline Milestones (decomposed per milestone)
        case 'timeline_milestone':
        case 'timeline_tracker':
        case 'milestones':
          return <DesktopTimelineMilestoneSlide content={c} />;

        // Executive Summary
        case 'exec_summary':
        case 'summary':
          return <DesktopExecSummarySlide content={c} />;

        // Unit Economics / Pricing
        case 'unit_economics':
        case 'pricing_model':
          return <DesktopUnitEconomicsSlide content={c} />;

        // Persona Dossier
        case 'persona_dossier':
        case 'persona':
          return <DesktopPersonaDossierSlide content={c} />;

        // Strategic Directive / Action Checklist
        case 'strategic_directive':
        case 'action_checklist':
          return <DesktopStrategicDirectiveSlide content={c} />;

        // Call To Action / Conversion Card
        case 'call_to_action':
        case 'conversion_card':
          return <DesktopCallToActionSlide content={c} />;

        // Live Poll / Audience Q&A
        case 'live_poll':
        case 'audience_qa':
          return <DesktopLivePollSlide content={c} />;

        case 'subheading':
          return <SlideSpikyTitle content={c} />;
        case 'myth_fact':
        case 'myth_reality':
          return <SlideMythFact content={c} />;
        case 'highlight_card':
        case 'stat_card':
          return <SlideStatCard content={c} />;
        case 'pull_quote':
        case 'strong_quote':
          return <SlideQuote content={c} />;
        case 'media':
          return <SlideMedia content={c} />;
        default:
          return <SlideFallback content={c} type={blockType || 'slide'} />;
      }
    }
  };

  return (
    <SlideRenderContext.Provider value={{ aspectRatio: currentAspect, isTransparent: currentTransparent }}>
      {renderInner()}
    </SlideRenderContext.Provider>
  );
}
