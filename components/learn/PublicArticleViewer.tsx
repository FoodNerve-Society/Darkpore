'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ArticleBlockRenderer } from './ArticleBlockRenderer';

const ERA_COLORS = {
  past: '#ef4444',    // Red
  present: '#10b981', // Green
  future: '#3b82f6',  // Blue
  default: '#f59e0b'  // Amber (Fallback)
};

export function PublicArticleViewer({ material, tenant, loginUrl }: { material: any, tenant: any, loginUrl: string }) {
  // Determine era color based on material tags/timeframe
  const timeframe = material.bottleneckTags?.find((t: string) => ['past', 'present', 'future'].includes(t.toLowerCase()))?.toLowerCase() || 'default';
  const themeColor = ERA_COLORS[timeframe as keyof typeof ERA_COLORS] || ERA_COLORS.default;

  // Progress Bar State
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Parse blocks
  const rawBlocks = material.articleBlocks || [];
  const parsedBlocks = typeof rawBlocks === 'string' ? JSON.parse(rawBlocks) : rawBlocks;

  useEffect(() => {
    // Setup intersection observer for blocks
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveBlockId(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' }); // Trigger when block is in top half of screen

    parsedBlocks.forEach((block: any, idx: number) => {
      const el = document.getElementById(`article-block-${block.id || idx}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [parsedBlocks]);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* ── Broken Line Progress Bar (Sticky) ── */}
      {parsedBlocks.length > 0 && (
        <Box sx={{
          position: 'sticky',
          top: { xs: 80, md: 100 },
          zIndex: 40,
          mb: 6,
          px: { xs: 2, md: 0 },
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: 1, 
            height: 40,
          }}>
            {parsedBlocks.map((block: any, idx: number) => {
              const isActive = activeBlockId === `article-block-${block.id || idx}`;
              const label = block.role || block.blockType.replace('_', ' ');
              
              return (
                <Box key={block.id || idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {/* Floating Label for Active Block */}
                  <Typography sx={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 800, 
                    color: themeColor, 
                    textTransform: 'uppercase',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(4px)',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {label}
                  </Typography>
                  {/* Line Segment */}
                  <Box sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: isActive ? themeColor : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 10px ${themeColor}80` : 'none',
                    transition: 'all 0.3s ease',
                  }} />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Article Content ── */}
      <Box sx={{
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        p: { xs: 3, md: 6 },
        position: 'relative',
        overflow: 'hidden' // contain the blur/modal
      }}>
        {/* Render Preview Text First */}
        {material.previewText && (
          <Typography sx={{ 
            fontSize: '1.25rem',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 400,
            mb: 5,
          }}>
            {material.previewText}
          </Typography>
        )}

        {/* Render Intelligence Blocks */}
        {material.type === 'article' && parsedBlocks.length > 0 ? (
          <Box sx={{ position: 'relative' }}>
            {parsedBlocks.map((block: any, idx: number) => (
              <Box 
                id={`article-block-${block.id || idx}`} 
                key={block.id || idx} 
                sx={{ mb: 6 }}
              >
                <ArticleBlockRenderer block={block} themeMode="dark" accentColor={themeColor} />
              </Box>
            ))}
          </Box>
        ) : (
          /* Fallback for legacy articles without blocks */
          material.type === 'article' && !material.isPremium && (
            <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-line' }}>
              {material.fullContent}
            </Typography>
          )
        )}

        {/* ── Premium Glassmorphic Restricted Access Gate ── */}
        {material.isPremium && (
          <Box sx={{ position: 'relative', mt: 4 }}>
            {/* Fake faded content for legacy fullContent, or we just blur the bottom of the blocks */}
            {!parsedBlocks.length && (
              <Typography sx={{ 
                fontSize: '1.05rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.3)', whiteSpace: 'pre-line',
                maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                pointerEvents: 'none', filter: 'blur(2px)',
              }}>
                {material.fullContent?.substring(0, 800) || 'Premium intelligence blueprint content goes here...'}
              </Typography>
            )}

            <Box sx={{
              position: 'absolute',
              top: parsedBlocks.length > 0 ? '-100px' : '10%',
              left: 0,
              right: 0,
              bottom: parsedBlocks.length > 0 ? '-100px' : 'auto', // Cover remaining if blocks exist
              minHeight: 400,
              background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.8) 20%, rgba(15,23,42,0.95) 100%)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderBottomRadius: '24px',
              px: { xs: 3, md: 6 },
              py: 8,
              textAlign: 'center',
            }}>
              
              {/* Premium Inner Modal */}
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: `0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px ${themeColor}30`,
                backdropFilter: 'blur(40px)',
                borderRadius: '24px',
                p: { xs: 4, md: 6 },
                maxWidth: 540,
                width: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Glow effect inside modal */}
                <Box sx={{
                  position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                  background: `radial-gradient(circle at 50% 0%, ${themeColor}15 0%, transparent 50%)`,
                  pointerEvents: 'none'
                }} />

                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 72, height: 72, borderRadius: '50%',
                  background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)`,
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: `0 8px 32px ${themeColor}40`,
                  mb: 4,
                  position: 'relative'
                }}>
                  <LockOutlinedIcon sx={{ fontSize: 32, color: '#fff' }} />
                  {/* Pulsing ring */}
                  <Box sx={{
                    position: 'absolute', inset: -4, borderRadius: '50%',
                    border: `2px solid ${themeColor}`, opacity: 0.5,
                    animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)'
                  }} />
                </Box>

                <Typography sx={{
                  color: 'white', fontSize: '1.8rem', fontWeight: 900, mb: 2, letterSpacing: '-0.02em',
                }}>
                  Classified Blueprint
                </Typography>
                
                <Typography sx={{
                  color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', lineHeight: 1.6, mb: 5,
                }}>
                  You are viewing a restricted preview. Authenticate as a verified member of the {tenant.name} Society to unlock the strategic framework and full analysis.
                </Typography>
                
                <a href={loginUrl} style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                  <Button
                    fullWidth
                    sx={{
                      background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
                      color: '#fff',
                      borderRadius: '16px',
                      py: 2,
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      boxShadow: `0 8px 24px ${themeColor}40`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 32px ${themeColor}60`,
                        background: `linear-gradient(135deg, ${themeColor}ee 0%, ${themeColor} 100%)`,
                      },
                    }}
                  >
                    Unlock Full Intelligence
                  </Button>
                </a>
              </Box>

            </Box>
          </Box>
        )}
      </Box>

      {/* Global styles for pulse animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}} />
    </Box>
  );
}
