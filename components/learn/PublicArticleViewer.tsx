'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, alpha, Avatar, Dialog } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { ArticleBlockRenderer } from './ArticleBlockRenderer';
import { BlockInsightsDrawer } from './BlockInsightsDrawer';
import { 
  Share as ShareIcon, 
  ShortcutOutlined as ForwardIcon,
  NavigateNext as NavigateNextIcon,
  Verified as VerifiedIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const ERA_COLORS = {
  past: '#ef4444',    
  present: '#10b981', 
  future: '#3b82f6',  
  default: '#f59e0b'  
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
  const router = useRouter();

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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Insights Drawer State
  const [activeInsightBlockId, setActiveInsightBlockId] = useState<string | null>(null);

  // Parse blocks
  const rawBlocks = material.articleBlocks || [];
  const parsedBlocks = typeof rawBlocks === 'string' ? JSON.parse(rawBlocks) : rawBlocks;

  const activeInsightBlock = parsedBlocks.find((b: any) => b.id === activeInsightBlockId) || null;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveBlockId(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' }); 

    parsedBlocks.forEach((block: any, idx: number) => {
      const el = document.getElementById(`article-block-${block.id || idx}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [parsedBlocks]);

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

  // Safely parse author object
  let authorObj = material.author;
  if (typeof material.author === 'string') {
    try {
      authorObj = JSON.parse(material.author);
    } catch(e) {
      authorObj = { name: material.author };
    }
  }
  // Ensure authorObj is truthy so that blocks requiring an author will render their insights trigger
  if (!authorObj) {
    authorObj = { name: material.authorName || 'Society Architect', role: 'Author' };
  }

  return (
    <Box sx={{ position: 'relative' }}>
      
      {/* ── Vertical Beaded Progress Bar (Custom Scrollbar) ── */}
      {parsedBlocks.length > 0 && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: { xs: -16, sm: -24, md: -48 }, 
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
        bgcolor: 'transparent',
        position: 'relative',
        overflow: 'hidden' 
      }}>

        {/* ═══════════════════════ BREADCRUMB PANE (STICKY) ═══════════════════════ */}
        <Box sx={{ 
          position: 'sticky', 
          top: { xs: 70, md: 90 }, 
          zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          mb: 5, p: 1.5, px: { xs: 2.5, md: 4 }, 
          mx: { xs: -2.5, md: -4 },
          mt: { xs: -4, md: -8 },
          bgcolor: themeMode === 'dark' ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          borderTopLeftRadius: { md: '16px' },
          borderTopRightRadius: { md: '16px' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: 'Quicksand, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: themeMode === 'dark' ? '#cbd5e1' : '#475569' }}>
            <Box 
              component="span" 
              onClick={() => router.push('/learn?type=article')}
              sx={{ 
                cursor: 'pointer', 
                color: themeColor,
                bgcolor: alpha(themeColor, 0.1),
                px: 1.5, py: 0.5, borderRadius: '100px',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                fontWeight: 800,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: alpha(themeColor, 0.2), transform: 'translateY(-1px)' } 
              }} 
            >
              Article
            </Box>
            
            {/* Display Category/Subcategory */}
            {material.category && (
              <>
                <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />
                <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: themeColor } }} onClick={() => router.push(`/learn?category=${encodeURIComponent(material.category)}`)}>
                  {material.category}
                </Box>
              </>
            )}
          </Box>
          
          <Tooltip title="Share Article">
            <IconButton onClick={() => setShareModalOpen(true)} size="small" sx={{ color: 'text.secondary', '&:hover': { color: themeColor, bgcolor: alpha(themeColor, 0.1) } }}>
              <ForwardIcon fontSize="small" sx={{ color: themeMode === 'dark' ? '#fff' : '#000' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ═══════════════════════ PREMIUM ARTICLE HEADER ═══════════════════════ */}
        <Box sx={{ mb: 6 }}>
          
          {/* Title - only show if there is no SpikyTitleBlock (subheading) at the top */}
          {!parsedBlocks.some((b: any) => b.blockType === 'subheading') && material.title && (
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 4, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.1, color: themeMode === 'dark' ? '#fff' : '#0f172a' }}>
              {material.title}
            </Typography>
          )}

          {/* Render the first block if it's a subheading, so metadata appears below it */}
          {parsedBlocks[0]?.blockType === 'subheading' && (
            <Box id={`article-block-${parsedBlocks[0].id}`} sx={{ mb: 4 }}>
              <ArticleBlockRenderer 
                block={parsedBlocks[0]} 
                themeMode={themeMode} 
                accentColor={themeColor} 
                onOpenInsights={(id) => setActiveInsightBlockId(id)}
                author={authorObj}
              />
            </Box>
          )}

          {/* Metadata Area - Glassy Centered Container */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              width: { xs: '100%', sm: '80%', md: '70%' },
              p: 2.5,
              borderRadius: '16px',
              bgcolor: themeMode === 'dark' ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${themeMode === 'dark' ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05)}`,
              gap: 1.5
            }}>
              
              {/* Primary Author (Fallback if author is just a string in DB) */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: '100%' }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar src={authorObj?.avatarUrl || ''} sx={{ width: 32, height: 32, fontSize: '0.8rem' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: themeMode === 'dark' ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', lineHeight: 1.2 }}>
                      {authorObj?.name || authorObj || material.authorName || 'Society Architect'}
                      {(authorObj?.isVerified || true) && <VerifiedIcon sx={{ fontSize: 14, color: themeColor, ml: 0.5 }} />}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: themeMode === 'dark' ? '#64748b' : '#94a3b8', fontWeight: 500, lineHeight: 1.2 }}>
                      {new Date(material.createdAt || material.dateAdded).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: themeColor, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {authorObj?.role || authorObj?.title || 'Author'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Render Preview Text First (if any) */}
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

        {/* ═══════════════════════ ARTICLE BODY ═══════════════════════ */}
        {/* Render Intelligence Blocks, skipping the first if it was already rendered as a subheading */}
        {material.type === 'article' && parsedBlocks.length > 0 ? (
          <Box sx={{ position: 'relative' }}>
            {parsedBlocks.slice(parsedBlocks[0]?.blockType === 'subheading' ? 1 : 0).map((block: any, idx: number) => (
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
                  author={authorObj}
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
              bottom: parsedBlocks.length > 0 ? '-150px' : 'auto', 
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

      {/* Share Modal */}
      <Dialog 
        open={shareModalOpen} 
        onClose={() => setShareModalOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: themeMode === 'dark' ? '#0f172a' : '#ffffff',
            backgroundImage: 'none',
            borderRadius: '16px',
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#0f172a' }}>
            Share this Insight
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            borderRadius: '12px', 
            bgcolor: themeMode === 'dark' ? alpha(themeColor, 0.1) : alpha(themeColor, 0.05),
            border: `1px solid ${alpha(themeColor, 0.2)}`,
            mb: 3
          }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 1, color: themeMode === 'dark' ? '#f8fafc' : '#0f172a', lineHeight: 1.3 }}>
              {material.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={authorObj?.avatarUrl} sx={{ width: 20, height: 20 }} />
              <Typography sx={{ fontSize: '0.8rem', color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}>
                By {authorObj?.name || 'Society'}
              </Typography>
            </Box>
          </Box>

          <Button 
            fullWidth 
            variant="contained" 
            disableElevation
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setShareModalOpen(false);
            }}
            sx={{ 
              bgcolor: themeColor, 
              color: '#fff',
              py: 1.5,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: alpha(themeColor, 0.8) }
            }}
          >
            Copy Link
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
