'use client';

import React from 'react';
import { Box, Typography, Avatar, Chip, Divider } from '@mui/material';
import { alpha } from '@mui/system';
import { 
  AutoAwesome as SparkleIcon,
  PlayArrow as PlayIcon,
  FormatQuote as QuoteIcon
} from '@mui/icons-material';

// Common Slide Wrapper to ensure consistent aspect ratio (16:9) and basic layout
export function SlideWrapper({ children, color = '#3b82f6', bgUrl }: { children: React.ReactNode, color?: string, bgUrl?: string }) {
  return (
    <Box sx={{
      width: '100%',
      aspectRatio: '16/9',
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#fff',
      border: `1px solid ${alpha(color, 0.2)}`,
      boxShadow: `0 24px 64px rgba(0,0,0,0.08)`,
      ...(bgUrl ? {
        backgroundImage: `linear-gradient(to right, rgba(255,255,255,1) 30%, rgba(255,255,255,0.7) 100%), url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
      } : {
        background: `linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)`,
      })
    }}>
      {/* Top Accent Line */}
      <Box sx={{ height: 6, width: '100%', background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.5)} 100%)` }} />
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 4, md: 6 }, position: 'relative', zIndex: 2 }}>
        {children}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Specific Slide Types
// ----------------------------------------------------------------------

export function SlideSpikyTitle({ content }: { content: any }) {
  return (
    <SlideWrapper color="#64748b">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '80%' }}>
        <Chip 
          icon={<SparkleIcon sx={{ fontSize: '1rem !important' }} />} 
          label="KEY TOPIC" 
          size="small" 
          sx={{ alignSelf: 'flex-start', mb: 3, bgcolor: alpha('#64748b', 0.1), color: '#64748b', fontWeight: 800 }} 
        />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1, color: '#0f172a', letterSpacing: '-0.02em', mb: 2 }}>
          {content.text || "Spiky Title"}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

export function SlideMythFact({ content }: { content: any }) {
  return (
    <SlideWrapper color="#ef4444">
      <Typography sx={{ fontWeight: 800, color: '#ef4444', mb: 4, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1rem' }}>
        The Disconnect
      </Typography>
      <Box sx={{ display: 'flex', gap: 4, flex: 1 }}>
        {/* Myth Side */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 4, bgcolor: 'rgba(239,68,68,0.05)', borderRadius: 4, border: '1px solid rgba(239,68,68,0.1)' }}>
          <Chip label="THE MYTH" size="small" sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: '#ef4444', color: '#fff', fontWeight: 700 }} />
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', opacity: 0.8 }}>
            "{content.myth || 'The widely accepted belief goes here...'}"
          </Typography>
        </Box>
        {/* Fact Side */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 4, bgcolor: '#0f172a', borderRadius: 4, color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <Chip label="GROUND TRUTH" size="small" sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }} />
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            {content.fact || 'The harsh reality that operators know...'}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

export function SlideStatCard({ content }: { content: any }) {
  return (
    <SlideWrapper color="#8b5cf6" bgUrl={content.imageUrl}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '6rem', md: '10rem' }, lineHeight: 1, color: '#8b5cf6', letterSpacing: '-0.04em', mb: 2, textShadow: '0 10px 30px rgba(139,92,246,0.2)' }}>
          {content.stat || '99%'}
        </Typography>
        <Typography sx={{ fontSize: '2rem', fontWeight: 600, color: '#0f172a', maxWidth: '60%', lineHeight: 1.2 }}>
          {content.label || 'The contextual label explaining the statistic'}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

export function SlideQuote({ content }: { content: any }) {
  return (
    <SlideWrapper color="#f59e0b">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <QuoteIcon sx={{ fontSize: '4rem', color: alpha('#f59e0b', 0.3), mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '2.5rem', color: '#0f172a', maxWidth: '80%', lineHeight: 1.3, mb: 4 }}>
          "{content.quote || 'The insight goes here.'}"
        </Typography>
        {content.author && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 2, bgcolor: '#f59e0b' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {content.author}
            </Typography>
            <Box sx={{ width: 40, height: 2, bgcolor: '#f59e0b' }} />
          </Box>
        )}
      </Box>
    </SlideWrapper>
  );
}

export function SlideMedia({ content }: { content: any }) {
  return (
    <Box sx={{
      width: '100%', aspectRatio: '16/9', borderRadius: '20px', overflow: 'hidden', position: 'relative',
      bgcolor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 24px 64px rgba(0,0,0,0.15)`
    }}>
      {content.imageUrl ? (
        <img src={content.imageUrl} alt="Media" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : content.videoUrl ? (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <video src={content.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <PlayIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '6rem', color: 'rgba(255,255,255,0.8)' }} />
        </Box>
      ) : (
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Media Placeholder</Typography>
      )}
      {content.caption && (
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', p: 3, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1.2rem' }}>{content.caption}</Typography>
        </Box>
      )}
    </Box>
  );
}

export function SlideJob({ content }: { content: any }) {
  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <Chip label="WE ARE HIRING" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 800, letterSpacing: '0.1em', mb: 4 }} />
        
        {content.orgLogo && <Avatar src={content.orgLogo} sx={{ width: 80, height: 80, mb: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />}
        
        <Typography sx={{ fontWeight: 900, fontSize: '3.5rem', color: '#0f172a', lineHeight: 1.1, mb: 2 }}>
          {content.jobTitle || 'Role Title'}
        </Typography>
        <Typography sx={{ fontWeight: 600, fontSize: '1.5rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
          {content.orgName} 
          <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
          {content.location}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

export function SlideRundownAct({ content, durationStr, color = '#10b981' }: { content: any; durationStr?: string; color?: string }) {
  const title = content.title || content.role || 'Act';
  const desc = content.description || content.desc || content.message || '';
  const focus = content.focusSummary || '';
  
  return (
    <SlideWrapper color={color}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<SparkleIcon sx={{ fontSize: '0.95rem !important' }} />}
            label="BROADCAST ACT"
            size="small"
            sx={{
              bgcolor: alpha(color, 0.12),
              color: color,
              fontWeight: 900,
              letterSpacing: '0.06em',
              borderRadius: '8px',
              px: 0.5,
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
                fontSize: '0.72rem',
                borderRadius: '8px',
              }}
            />
          )}
        </Box>

        <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.15, color: '#0f172a', letterSpacing: '-0.03em', mb: 2 }}>
          {title}
        </Typography>

        {desc && (
          <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.35rem' }, fontWeight: 500, color: '#475569', lineHeight: 1.55, maxWidth: '90%' }}>
            {desc}
          </Typography>
        )}

        {focus && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Broadcast Focus:
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
              {focus}
            </Typography>
          </Box>
        )}
      </Box>
    </SlideWrapper>
  );
}

export function SlideTransition({ content }: { content: any }) {
  const displayTitle = content.title || (content.role && content.role !== 'transition' ? content.role : '');
  const displayText = content.message || content.text || content.description || 'Intermission / Transition';

  return (
    <Box sx={{
      width: '100%', aspectRatio: '16/9', borderRadius: '20px', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: { xs: 4, md: 8 },
      boxShadow: `0 24px 64px rgba(0,0,0,0.2)`,
      position: 'relative'
    }}>
      {displayTitle && (
        <Chip
          label={displayTitle}
          size="small"
          sx={{
            mb: 2,
            bgcolor: 'rgba(255,255,255,0.12)',
            color: '#ffffff',
            fontWeight: 800,
            letterSpacing: '0.06em',
            borderRadius: '8px'
          }}
        />
      )}
      <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3.2rem' }, color: '#fff', textAlign: 'center', lineHeight: 1.25, maxWidth: '85%' }}>
        {displayText}
      </Typography>
    </Box>
  );
}

export function SlideFallback({ content, type }: { content: any, type: string }) {
  // Generic slide for unmapped block types (e.g. core_interactive, exec_summary)
  return (
    <SlideWrapper color="#3b82f6">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label={type.replace('_', ' ').toUpperCase()} size="small" sx={{ alignSelf: 'flex-start', mb: 3, bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', fontWeight: 800 }} />
        
        {content.text ? (
          <Typography sx={{ fontWeight: 700, fontSize: '2rem', color: '#0f172a', lineHeight: 1.4 }}>
            {content.text.substring(0, 200)}
            {content.text.length > 200 ? '...' : ''}
          </Typography>
        ) : (
          <Typography sx={{ fontWeight: 500, color: '#64748b' }}>
            {JSON.stringify(content)}
          </Typography>
        )}
      </Box>
    </SlideWrapper>
  );
}

// ----------------------------------------------------------------------
// Adaptive Image Component (Supports 16:9, 1:1, 9:16 aspect ratios)
// ----------------------------------------------------------------------
export function AdaptiveSlideImage({
  imageUrl,
  aspectRatio = 'auto',
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
          ? { width: { xs: 160, md: 240 }, height: { xs: 160, md: 240 }, aspectRatio: '1/1', flexShrink: 0 }
          : isPortrait
          ? { width: { xs: 140, md: 200 }, aspectRatio: '9/16', flexShrink: 0 }
          : { maxWidth: '100%', maxHeight: 280 }),
        ...sx,
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: isPortrait ? 'cover' : isSquare ? 'cover' : 'cover',
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
            p: 1.5,
            background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 100%)',
          }}
        >
          <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>{caption}</Typography>
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
  const isWide = content.aspectRatio === '16:9';
  const bg = isWide && content.imageUrl ? content.imageUrl : undefined;

  return (
    <SlideWrapper color="#ef4444" bgUrl={bg}>
      <Box sx={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Chip
            label="ACT 1 · ANCHOR TENSION"
            size="small"
            sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: alpha('#ef4444', 0.15), color: '#dc2626', fontWeight: 800, fontSize: '0.75rem' }}
          />
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.15, color: '#0f172a', letterSpacing: '-0.02em', mb: 3 }}>
            {content.title || content.text || 'The Operational Reality: Field Crisis Snapshot'}
          </Typography>

          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.2)', maxWidth: 440 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
              The Ground Disconnect
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.4rem' }, color: '#b91c1c', lineHeight: 1 }}>
              {content.stat || '₦340B Lost'}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#475569', mt: 0.5, fontWeight: 500 }}>
              {content.subheadline || content.label || 'Capital evaporated between farm gate and off-taker'}
            </Typography>
          </Box>
        </Box>

        {!isWide && content.imageUrl && (
          <AdaptiveSlideImage
            imageUrl={content.imageUrl}
            aspectRatio={content.aspectRatio || '1:1'}
            caption={content.caption}
          />
        )}
      </Box>
    </SlideWrapper>
  );
}

// 2. Reframe Question (The Spiky Strategic Pivot)
export function SlideReframeQuestion({ content }: { content: any }) {
  return (
    <SlideWrapper color="#f59e0b">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', px: 4 }}>
        <Chip
          icon={<SparkleIcon sx={{ fontSize: '0.9rem !important' }} />}
          label="THE STRATEGIC REFRAME"
          size="small"
          sx={{ mb: 3, bgcolor: alpha('#f59e0b', 0.15), color: '#b45309', fontWeight: 800, fontSize: '0.75rem' }}
        />
        {content.convention && (
          <Typography sx={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through', mb: 2, fontWeight: 600 }}>
            "{content.convention}"
          </Typography>
        )}
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.4rem', md: '3.6rem' }, lineHeight: 1.15, color: '#0f172a', letterSpacing: '-0.02em', maxWidth: 880, mb: 3 }}>
          "{content.title || content.text || 'What if the barrier isn’t seed access, but spatial land tenure?'}"
        </Typography>
        <Typography sx={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600, maxWidth: 650 }}>
          {content.subheadline || 'Pivoting from the visible symptom to the structural lock.'}
        </Typography>
      </Box>
    </SlideWrapper>
  );
}

// 3. Funnel System (3-Layer Diagnostic)
export function SlideFunnelSystem({ content }: { content: any }) {
  const l1 = content.layer1 || 'Layer 1: Immediate Field Symptoms (48h spoilage)';
  const l2 = content.layer2 || 'Layer 2: Logistics & Highway Corridors (Extortion & breakages)';
  const l3 = content.layer3 || 'Layer 3: Structural Policy Lock (Unbankable land titles)';

  return (
    <SlideWrapper color="#3b82f6">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Chip label="ACT 2 · SYSTEM DIAGNOSTIC" size="small" sx={{ bgcolor: alpha('#3b82f6', 0.12), color: '#2563eb', fontWeight: 800 }} />
          <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>The 3-Layer Diagnostic</Typography>
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.5rem' }, color: '#0f172a', mb: 4 }}>
          {content.title || 'Layered Diagnostic: Tracing the Root Friction'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
          {[
            { num: '01', title: 'IMMEDIATE FIELD', text: l1, color: '#3b82f6' },
            { num: '02', title: 'CORRIDOR & TRANSIT', text: l2, color: '#6366f1' },
            { num: '03', title: 'STRUCTURAL ROOT', text: l3, color: '#0f172a' },
          ].map((card, i) => (
            <Box
              key={i}
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: '#ffffff',
                border: '1.5px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: card.color }}>{card.num}</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{card.title}</Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>{card.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 4. Ideal vs Feasible (The NGO Dream vs Fracture vs Feasible Fix)
export function SlideIdealVsFeasible({ content }: { content: any }) {
  const dream = content.ngoDream || content.myth || 'The NGO Dream: "Just install solar cold rooms at every farm cluster"';
  const fracture = content.fracturePoint || 'The Fracture: Inverter theft, degraded battery storage, diesel tariff spikes';
  const fix = content.feasibleFix || content.fact || 'The Feasible Fix: Decentralized dry routes, moisture bags, scheduled night rails';

  return (
    <SlideWrapper color="#8b5cf6">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 2 · THE DISCONNECT" size="small" sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: alpha('#8b5cf6', 0.12), color: '#7c3aed', fontWeight: 800 }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.5rem' }, color: '#0f172a', mb: 3 }}>
          {content.title || 'Ideal vs. Feasible: Why Generic Fixes Fail'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
          {/* Dream */}
          <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(245, 158, 11, 0.06)', border: '1.5px solid rgba(245, 158, 11, 0.25)' }}>
            <Chip label="THE NGO DREAM" size="small" sx={{ bgcolor: '#f59e0b', color: '#fff', fontWeight: 800, mb: 1.5 }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#78350f', lineHeight: 1.45 }}>{dream}</Typography>
          </Box>
          {/* Fracture */}
          <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(239, 68, 68, 0.06)', border: '1.5px solid rgba(239, 68, 68, 0.25)' }}>
            <Chip label="THE FRACTURE" size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 800, mb: 1.5 }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#7f1d1d', lineHeight: 1.45 }}>{fracture}</Typography>
          </Box>
          {/* Fix */}
          <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.06)', border: '1.5px solid rgba(16, 185, 129, 0.25)' }}>
            <Chip label="THE FEASIBLE FIX" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 800, mb: 1.5 }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#064e3b', lineHeight: 1.45 }}>{fix}</Typography>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 5. Scaled Burden (Macro Economics & Capital Bleed)
export function SlideScaledBurden({ content }: { content: any }) {
  return (
    <SlideWrapper color="#ec4899">
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Chip label="ACT 2 · SCALED BURDEN" size="small" sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: alpha('#ec4899', 0.12), color: '#db2777', fontWeight: 800 }} />
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '4.5rem', md: '7rem' }, lineHeight: 1, color: '#db2777', letterSpacing: '-0.04em', mb: 1.5 }}>
            {content.stat || '2.4M Tons'}
          </Typography>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, mb: 2 }}>
            {content.label || content.title || 'Annual Perishable Crop Loss Across The Corridor'}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>
            {content.absorption || content.subheadline || 'Who absorbs the bleed: Smallholder margins drop to -8% while consumers pay 3x premiums.'}
          </Typography>
        </Box>

        {content.imageUrl && (
          <AdaptiveSlideImage
            imageUrl={content.imageUrl}
            aspectRatio={content.aspectRatio || '1:1'}
            caption={content.caption}
          />
        )}
      </Box>
    </SlideWrapper>
  );
}

// 6. Power Map (Deciders, Enforcers, Payers)
export function SlidePowerMap({ content }: { content: any }) {
  const d = content.deciders || 'Federal Export Boards & State Port Councils';
  const e = content.enforcers || 'Informal Toll Cartels & Highway Middlemen Unions';
  const p = content.payers || 'Downstream Processing Lines Operating at 30% Capacity';

  return (
    <SlideWrapper color="#0ea5e9">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 2 · POLITICAL ECONOMY" size="small" sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: alpha('#0ea5e9', 0.12), color: '#0284c7', fontWeight: 800 }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.5rem' }, color: '#0f172a', mb: 3 }}>
          {content.title || 'Power Map: Deciders, Enforcers & Payers'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
          {[
            { icon: '🏛️', tag: 'THE DECIDERS', text: d, color: '#0284c7' },
            { icon: '⚖️', tag: 'THE ENFORCERS', text: e, color: '#d97706' },
            { icon: '💸', tag: 'THE PAYERS', text: p, color: '#ef4444' },
          ].map((item, i) => (
            <Box key={i} sx={{ p: 3, borderRadius: '16px', bgcolor: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.9)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
              <Typography sx={{ fontSize: '2rem', mb: 1 }}>{item.icon}</Typography>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 900, color: item.color, mb: 1 }}>{item.tag}</Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.45 }}>{item.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 7. Response Audit (Subsidies vs Forward Contracts)
export function SlideResponseAudit({ content }: { content: any }) {
  const sq = content.statusQuo || 'Subsidized Input Handouts (₦40B spent with 0% measurable margin improvement)';
  const pw = content.provenMove || 'Forward Contract Clearing Houses (Guaranteed off-take price at planting)';
  const gain = content.metricGain || '+34% Net Realization';

  return (
    <SlideWrapper color="#10b981">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 2 · RESPONSE AUDIT" size="small" sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 800 }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.5rem' }, color: '#0f172a', mb: 3 }}>
          {content.title || 'Response Audit: Status Quo vs. What Actually Works'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Box sx={{ p: 3.5, borderRadius: '20px', bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1.5px solid rgba(239, 68, 68, 0.2)' }}>
            <Chip label="WHAT INDUSTRY KEEPS DOING" size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 800, mb: 2 }} />
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#7f1d1d', lineHeight: 1.5 }}>{sq}</Typography>
          </Box>

          <Box sx={{ p: 3.5, borderRadius: '20px', bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.3)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Chip label="WHAT ACTUALLY MOVES THE NEEDLE" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 800 }} />
              <Chip label={gain} size="small" sx={{ bgcolor: '#047857', color: '#fff', fontWeight: 900 }} />
            </Box>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#064e3b', lineHeight: 1.5 }}>{pw}</Typography>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 8. Boundary Test (4-Part Gateway)
export function SlideBoundaryTest({ content }: { content: any }) {
  const g1 = content.gate1 || 'Regulatory Pathway: Operates within state warehousing acts';
  const g2 = content.gate2 || 'Scale Velocity: Extends beyond pilot across northern corridor';
  const g3 = content.gate3 || 'Intervention Point: Bonded depot aggregation hub';
  const g4 = content.gate4 || 'Day 90 Target: 500 Tons Cleared';

  return (
    <SlideWrapper color="#6366f1">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 2 · THE 4-GATE PROOF" size="small" sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: alpha('#6366f1', 0.12), color: '#4f46e5', fontWeight: 800 }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.4rem' }, color: '#0f172a', mb: 3 }}>
          {content.title || 'Boundary Test: 4 Non-Negotiable Gateways'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {[
            { num: 'G1', label: 'PATHWAY', text: g1 },
            { num: 'G2', label: 'SCALE', text: g2 },
            { num: 'G3', label: 'POINT', text: g3 },
            { num: 'G4', label: '90D KPI', text: g4 },
          ].map((gate, i) => (
            <Box key={i} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#ffffff', border: '1.5px solid rgba(99, 102, 241, 0.25)', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#4f46e5' }}>{gate.num}</Typography>
                <Chip label="VERIFIED" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 900, bgcolor: '#dcfce7', color: '#166534' }} />
              </Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', mb: 0.75 }}>{gate.label}</Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>{gate.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 9. Preempt Objections (Voicing the Skeptic)
export function SlidePreemptObjections({ content }: { content: any }) {
  const quote = content.skepticQuote || content.quote || 'Farmers will default and side-sell as soon as open market prices spike';
  const disproof = content.disproofData || '94.2% Compliance Rate via Input Escrow Protocol';

  return (
    <SlideWrapper color="#d97706">
      <Box sx={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center' }}>
        <Box sx={{ flex: 1, p: 3.5, borderRadius: '20px', bgcolor: '#ffffff', border: '1.5px solid rgba(217, 119, 6, 0.25)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
          <Chip label="THE SKEPTIC'S VOICE" size="small" sx={{ bgcolor: '#d97706', color: '#fff', fontWeight: 800, mb: 2 }} />
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
            "{quote}"
          </Typography>
        </Box>

        <Box sx={{ flex: 1, p: 3.5, borderRadius: '20px', bgcolor: '#0f172a', color: '#fff', border: '1.5px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}>
          <Chip label="HARD DATA DISPROOF" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, mb: 2 }} />
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.4rem', md: '3.5rem' }, color: '#10b981', lineHeight: 1, mb: 1.5 }}>
            {content.stat || '94.2%'}
          </Typography>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#cbd5e1', lineHeight: 1.4 }}>
            {disproof}
          </Typography>
        </Box>
      </Box>
    </SlideWrapper>
  );
}

// 10. Return to Case (Re-evaluating the Case)
export function SlideReturnToCase({ content }: { content: any }) {
  return (
    <SlideWrapper color="#059669">
      <Box sx={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Chip label="ACT 3 · RETURN TO CASE" size="small" sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: alpha('#059669', 0.12), color: '#047857', fontWeight: 800 }} />
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.2rem', md: '3.2rem' }, color: '#0f172a', lineHeight: 1.15, mb: 2.5 }}>
            {content.title || 'Re-evaluating the Opening Case: A Solved Equation'}
          </Typography>
          <Typography sx={{ fontSize: '1.15rem', color: '#475569', fontWeight: 500, lineHeight: 1.5 }}>
            {content.subheadline || 'From unquantifiable field risk to an engineered, insured supply chain.'}
          </Typography>
        </Box>

        {content.imageUrl && (
          <AdaptiveSlideImage
            imageUrl={content.imageUrl}
            aspectRatio={content.aspectRatio || '1:1'}
            caption={content.caption}
          />
        )}
      </Box>
    </SlideWrapper>
  );
}

// 11. Forked Close (Status Quo Bleed vs Action ROI)
export function SlideForkedClose({ content }: { content: any }) {
  const pA = content.pathACost || 'Path A: Status Quo Bleed — ₦850K Lost Per Day in Avoidable Shrinkage';
  const pB = content.pathBROI || 'Path B: Corridor Deployment — 3.2x Capital Return in 18 Months';

  return (
    <SlideWrapper color="#7c3aed">
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label="ACT 3 · THE AUDIENCE FORK" size="small" sx={{ alignSelf: 'flex-start', mb: 2, bgcolor: alpha('#7c3aed', 0.12), color: '#6d28d9', fontWeight: 800 }} />
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.5rem' }, color: '#0f172a', mb: 3 }}>
          {content.title || 'Two Diverging Futures: The Operational Choice'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Box sx={{ p: 3.5, borderRadius: '20px', bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1.5px solid rgba(239, 68, 68, 0.25)' }}>
            <Chip label="PATH A · STATUS QUO" size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 800, mb: 1.5 }} />
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#7f1d1d', lineHeight: 1.45 }}>{pA}</Typography>
          </Box>

          <Box sx={{ p: 3.5, borderRadius: '20px', bgcolor: 'rgba(124, 58, 237, 0.08)', border: '1.5px solid rgba(124, 58, 237, 0.3)' }}>
            <Chip label="PATH B · CAPITAL CONVERSION" size="small" sx={{ bgcolor: '#7c3aed', color: '#fff', fontWeight: 800, mb: 1.5 }} />
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#5b21b6', lineHeight: 1.45 }}>{pB}</Typography>
          </Box>
        </Box>
      </Box>
    </SlideWrapper>
  );
}
