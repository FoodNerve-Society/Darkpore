'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, alpha } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ArticleBlockRenderer } from './ArticleBlockRenderer';
import { BlockInsightsDrawer } from './BlockInsightsDrawer';
import { Share as ShareIcon, ShortcutOutlined as ForwardIcon } from '@mui/icons-material';

const ERA_COLORS = {
  past: '#ef4444',    // Red
  present: '#10b981', // Green
  future: '#3b82f6',  // Blue
  default: '#f59e0b'  // Amber (Fallback)
};

export function PublicArticleViewer({ 
  material, 
  tenant, 
  loginUrl,
  themeMode = 'light'
}: { 
  material: any; 
  tenant: any; 
  loginUrl: string;
  themeMode?: 'light' | 'dark';
}) {
  // Determine era color based on material tags/timeframe
  let tags = [];
  try {
    tags = typeof material.bottleneckTags === 'string' 
      ? JSON.parse(material.bottleneckTags) 
      : (material.bottleneckTags || []);
  } catch(e) {
    tags = [];
  }
  const timeframe = tags.find((t: string) => ['past', 'present', 'future'].includes(t?.toLowerCase?.() || ''))?.toLowerCase() || 'default';
  const themeColor = ERA_COLORS[timeframe as keyof typeof ERA_COLORS] || ERA_COLORS.default;

  // Progress Bar State
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  // Insights Drawer State
  const [activeInsightBlockId, setActiveInsightBlockId] = useState<string | null>(null);

  // Parse blocks
  const rawBlocks = material.articleBlocks || [];
  const parsedBlocks = typeof rawBlocks === 'string' ? JSON.parse(rawBlocks) : rawBlocks;

  const activeInsightBlock = parsedBlocks.find((b: any) => b.id === activeInsightBlockId) || null;

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

  // Helper to estimate proportional height of a block
  const getBlockWeight = (block: any) => {
    if (!block || !block.blockType) return 1;
    switch (block.blockType) {
      case 'subheading': return 2;
      case 'exec_summary': return 3;
      case 'highlight_card': return 4;
      case 'core_interactive': return 6;
      case 'media': return 8;
      case 'myth_fact': return 5;
      case 'pull_quote': return 3;
      case 'live_poll': return 4;
      default: return 2;
    }
  };

  const activeIndex = parsedBlocks.findIndex((b: any, i: number) => activeBlockId === `article-block-${b.id || i}`);

  return (
    <Box sx={{ position: 'relative' }}>
      
      {/* ── Vertical Beaded Progress Bar (Custom Scrollbar) ── */}
      {parsedBlocks.length > 0 && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: { xs: -16, sm: -24, md: -48 }, // Push outside the main content block
          width: 24,
          pointerEvents: 'none',
          zIndex: 40,
        }}>
          <Box sx={{
            position: 'sticky',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.4,
            pointerEvents: 'auto',
            py: 2,
            height: '70vh',
            maxHeight: 650,
          }}>
            {parsedBlocks.map((block: any, idx: number) => {
              const isActive = activeBlockId === `article-block-${block.id || idx}`;
              const isPast = activeIndex !== -1 && idx < activeIndex;
              const weight = getBlockWeight(block);
              
              return (
                <Tooltip key={block.id || idx} title={String(block.blockType || 'Block').replace('_', ' ').toUpperCase()} placement="left" arrow>
                  <Box 
                    onClick={() => {
                      document.getElementById(`article-block-${block.id || idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    sx={{
                      flex: weight, 
                      width: isActive ? 8 : 4,
                      minHeight: 4, 
                      borderRadius: 10,
                      bgcolor: (isActive || isPast) ? themeColor : (themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'),
                      boxShadow: isActive ? `0 0 16px ${alpha(themeColor, 0.8)}` : 'none',
                      opacity: isActive ? 1 : (isPast ? 0.7 : 0.4),
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: isActive ? themeColor : alpha(themeColor, 0.6),
                        width: 8,
                        opacity: 1
                      }
                    }} 
                  />
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Article Content Wrapper ── */}
      <Box sx={{
        bgcolor: themeMode === 'dark' ? 'transparent' : 'transparent', // Remove the boxy background to match ArticleReader
        position: 'relative',
        overflow: 'hidden' 
      }}>
        {/* Render Preview Text First */}
        {material.previewText && (
          <Typography sx={{ 
            fontSize: '1.25rem',
            lineHeight: 1.6,
            color: themeMode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
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
                <ArticleBlockRenderer 
                  block={block} 
                  themeMode={themeMode} 
                  accentColor={themeColor} 
                  onOpenInsights={(id) => setActiveInsightBlockId(id)}
                  author={material.author}
                />
              </Box>
            ))}
          </Box>
        ) : (
          /* Fallback for legacy articles without blocks */
          material.type === 'article' && !material.isPremium && (
            <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.8, color: themeMode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)', whiteSpace: 'pre-line' }}>
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
                fontSize: '1.05rem', lineHeight: 1.8, color: themeMode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', whiteSpace: 'pre-line',
                maskImage: `linear-gradient(to bottom, ${themeMode === 'dark' ? 'black' : 'white'} 0%, transparent 100%)`,
                WebkitMaskImage: `linear-gradient(to bottom, ${themeMode === 'dark' ? 'black' : 'white'} 0%, transparent 100%)`,
                pointerEvents: 'none', filter: 'blur(2px)',
              }}>
                {material.fullContent?.substring(0, 800) || 'Premium intelligence blueprint content goes here...'}
              </Typography>
            )}

            <Box sx={{
              position: 'absolute',
              top: parsedBlocks.length > 0 ? '-100px' : '10%',
              left: -48,
              right: -48,
              bottom: parsedBlocks.length > 0 ? '-150px' : 'auto', // Cover remaining if blocks exist
              minHeight: 400,
              background: themeMode === 'dark' 
                ? 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.85) 20%, rgba(15,23,42,1) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,1) 100%)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              px: { xs: 3, md: 6 },
              py: 8,
              textAlign: 'center',
            }}>
              
              {/* Premium Inner Modal */}
              <Box sx={{
                bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                boxShadow: themeMode === 'dark' 
                  ? `0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px ${themeColor}30`
                  : `0 30px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1), 0 0 40px ${themeColor}20`,
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
                  background: themeMode === 'dark' 
                    ? `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)`
                    : `linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.01) 100%)`,
                  border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: `0 8px 32px ${themeColor}40`,
                  mb: 4,
                  position: 'relative'
                }}>
                  <LockOutlinedIcon sx={{ fontSize: 32, color: themeMode === 'dark' ? '#fff' : '#000' }} />
                  {/* Pulsing ring */}
                  <Box sx={{
                    position: 'absolute', inset: -4, borderRadius: '50%',
                    border: `2px solid ${themeColor}`, opacity: 0.5,
                    animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)'
                  }} />
                </Box>

                <Typography sx={{
                  color: themeMode === 'dark' ? 'white' : 'black', fontSize: '1.8rem', fontWeight: 900, mb: 2, letterSpacing: '-0.02em',
                }}>
                  Classified Blueprint
                </Typography>
                
                <Typography sx={{
                  color: themeMode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '1.05rem', lineHeight: 1.6, mb: 5,
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

      {/* ── Block Insights Drawer ── */}
      <BlockInsightsDrawer 
        open={Boolean(activeInsightBlockId)}
        onClose={() => setActiveInsightBlockId(null)}
        blockId={activeInsightBlockId}
        activeBlock={activeInsightBlock}
        accentColor={themeColor}
      />
    </Box>
  );
}
