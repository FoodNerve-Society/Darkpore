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

export function SlideTransition({ content }: { content: any }) {
  return (
    <Box sx={{
      width: '100%', aspectRatio: '16/9', borderRadius: '20px', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 8,
      boxShadow: `0 24px 64px rgba(0,0,0,0.2)`
    }}>
      <Typography sx={{ fontWeight: 800, fontSize: '3.5rem', color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
        {content.text || 'Moving on...'}
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
