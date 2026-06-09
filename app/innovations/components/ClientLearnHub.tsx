'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import Link from 'next/link';

interface LearningMaterial {
  slug: string;
  title: string;
  type: 'article' | 'video' | 'pdf';
  thumbnailUrl: string;
  previewText: string;
  isPremium: boolean;
  dateAdded: string;
  author?: string;
  readTime?: string;
  challengeId: string;
  challengeTitle: string;
}

interface ClientLearnHubProps {
  initialMaterials: LearningMaterial[];
  categories: string[];
  tenantName: string;
}

const typeMeta: Record<string, { color: string; icon: string; label: string }> = {
  article: { color: 'rgba(99, 102, 241, 0.85)', icon: '📰', label: 'ARTICLE' },
  video: { color: 'rgba(236, 72, 153, 0.85)', icon: '🎬', label: 'VIDEO' },
  pdf: { color: 'rgba(245, 158, 11, 0.85)', icon: '📄', label: 'PDF' },
};

export default function ClientLearnHub({ initialMaterials, categories, tenantName }: ClientLearnHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter materials based on search query, category, and type
  const filteredMaterials = useMemo(() => {
    return initialMaterials.filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.previewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.author && material.author.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = !selectedCategory || material.challengeTitle === selectedCategory;
      const matchesType = selectedType === 'all' || material.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [initialMaterials, searchQuery, selectedCategory, selectedType]);

  // All items rendered in a unified compact grid
  const gridMaterials = filteredMaterials;

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // Get top 6 materials to loop in the marquee
  const marqueeMaterials = useMemo(() => {
    return initialMaterials.slice(0, 6);
  }, [initialMaterials]);

  const marqueeKeyframes = `
    @keyframes learnMarquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;

  return (
    <Box sx={{ minHeight: '100vh', pb: 15, bgcolor: '#050505' }}>
      <style>{marqueeKeyframes}</style>
      {/* ═══════════════════════════════════════════════════════════════
          1. THE CINEMATIC HERO
         ═══════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#030303',
          color: 'white',
          pt: { xs: 18, md: 24 },
          pb: { xs: 12, md: 16 },
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Ambient background glows */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            left: '10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            right: '5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        {/* Subtle grid mesh */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="overline"
            sx={{
              color: '#10b981',
              fontWeight: 900,
              letterSpacing: 4,
              mb: 2,
              display: 'block',
              fontSize: { xs: '0.7rem', md: '0.8rem' },
            }}
          >
            {tenantName.toUpperCase()} KNOWLEDGE VAULT
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 3,
              lineHeight: 1.1,
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '-0.03em',
              background: 'linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            We do not hoard knowledge.
            <br />
            We distribute it.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.8,
              mb: 5,
              fontWeight: 400,
              maxWidth: 700,
              fontSize: { xs: '0.95rem', md: '1.15rem' },
            }}
          >
            Access open-source blueprints, research papers, and technical logs. Search below to filter through the collective intelligence of agritech operators.
          </Typography>

          {/* Interactive Search Bar */}
          <Box sx={{ maxWidth: 640 }}>
            <TextField
              fullWidth
              placeholder="Search reports, authors, or blueprints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontSize: '1.2rem', mr: 1, opacity: 0.7 }}>🔍</Typography>
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <Button
                        onClick={() => setSearchQuery('')}
                        sx={{
                          color: 'rgba(255,255,255,0.4)',
                          minWidth: 'auto',
                          p: 0.5,
                          '&:hover': { color: 'white' },
                        }}
                      >
                        ✕
                      </Button>
                    </InputAdornment>
                  ),
                  sx: {
                    color: 'white',
                    fontFamily: 'inherit',
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.15)',
                      bgcolor: 'rgba(255,255,255,0.04)',
                    },
                    '&.Mui-focused': {
                      borderColor: '#10b981',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
                      bgcolor: 'rgba(255,255,255,0.03)',
                    },
                    '& input::placeholder': {
                      color: 'rgba(255,255,255,0.4)',
                      opacity: 1,
                    },
                  },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED MARQUEE
         ═══════════════════════════════════════════════════════════════ */}
      {marqueeMaterials.length > 0 && (
        <Box
          sx={{
            py: 3,
            bgcolor: 'rgba(16, 185, 129, 0.03)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', px: 4, mb: 1.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', mr: 1.5 }} />
            <Typography variant="overline" sx={{ color: '#10b981', fontWeight: 900, letterSpacing: 3 }}>
              FEATURED RESOURCES
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              animation: 'learnMarquee 35s linear infinite',
              '&:hover': { animationPlayState: 'paused' },
              width: 'max-content',
            }}
          >
            {[...marqueeMaterials, ...marqueeMaterials].map((material, idx) => {
              const meta = typeMeta[material.type] ?? {
                color: '#64748b',
                icon: '📰',
                label: material.type.toUpperCase(),
              };
              return (
                <Link
                  key={`${material.slug}-${idx}`}
                  href={`/${material.challengeId}/learn/${material.slug}`}
                  style={{ textDecoration: 'none', flexShrink: 0 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2.5,
                      mr: 4,
                      p: 2,
                      borderRadius: '16px',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                      width: 420,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: '#10b981',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '10px',
                        backgroundImage: `url(${material.thumbnailUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ color: '#10b981', fontSize: '0.65rem', fontWeight: 800 }}>
                          {meta.icon} {meta.label}
                        </Typography>
                        {material.isPremium && (
                          <Typography sx={{ color: '#f59e0b', fontSize: '0.65rem', fontWeight: 800 }}>
                            💎 PREMIUM
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'white',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.85rem',
                          mb: 0.2,
                        }}
                      >
                        {material.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.4)',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.75rem',
                        }}
                      >
                        {material.previewText}
                      </Typography>
                    </Box>
                  </Box>
                </Link>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          2. FILTER & CATEGORY NAVIGATION
         ═══════════════════════════════════════════════════════════════ */}
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* Category Filters */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            pb: 2,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            mb: 3,
          }}
        >
          <Chip
            label="All Categories"
            onClick={() => setSelectedCategory(null)}
            sx={{
              fontWeight: 700,
              px: 2,
              py: 2.2,
              borderRadius: '12px',
              fontSize: '0.8rem',
              bgcolor: !selectedCategory ? '#10b981' : 'rgba(255,255,255,0.03)',
              color: !selectedCategory ? '#000000' : 'rgba(255,255,255,0.6)',
              border: !selectedCategory ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.25s ease',
              '&:hover': {
                bgcolor: !selectedCategory ? '#10b981' : 'rgba(255,255,255,0.08)',
                color: !selectedCategory ? '#000000' : '#ffffff',
                borderColor: !selectedCategory ? '#10b981' : 'rgba(255,255,255,0.2)',
              },
            }}
          />
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <Chip
                key={idx}
                label={cat}
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  fontWeight: 700,
                  px: 2,
                  py: 2.2,
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  bgcolor: isSelected ? '#10b981' : 'rgba(255,255,255,0.03)',
                  color: isSelected ? '#000000' : 'rgba(255,255,255,0.6)',
                  border: isSelected ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: isSelected ? '#10b981' : 'rgba(255,255,255,0.08)',
                    color: isSelected ? '#000000' : '#ffffff',
                    borderColor: isSelected ? '#10b981' : 'rgba(255,255,255,0.2)',
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Media Type Sub-Filters */}
        <Box sx={{ display: 'flex', gap: 1, mb: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', mr: 2, fontWeight: 700 }}>
            FILTER BY TYPE:
          </Typography>
          {['all', 'article', 'video', 'pdf'].map((type) => {
            const isSelected = selectedType === type;
            return (
              <Button
                key={type}
                size="small"
                onClick={() => setSelectedType(type)}
                sx={{
                  bgcolor: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isSelected ? 'white' : 'rgba(255,255,255,0.4)',
                  border: '1px solid',
                  borderColor: isSelected ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderRadius: '8px',
                  fontWeight: 800,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                  },
                }}
              >
                {type === 'all' && 'ALL TYPES'}
                {type === 'article' && '📰 ARTICLES'}
                {type === 'video' && '🎬 VIDEOS'}
                {type === 'pdf' && '📄 PDFs'}
              </Button>
            );
          })}
        </Box>

        {/* Unified Compact Grid */}

        {/* ═══════════════════════════════════════════════════════════════
            4. GRID OF REST OF CONTENT
           ═══════════════════════════════════════════════════════════════ */}
        {/* Unified CSS Grid (YouTube-style cards, 4 columns on large screens) */}
        {gridMaterials.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 4,
            }}
          >
            {gridMaterials.map((material, idx) => {
              const meta = typeMeta[material.type] ?? {
                color: '#64748b',
                icon: '📰',
                label: material.type.toUpperCase(),
              };

              return (
                <Link
                  key={idx}
                  href={`/${material.challengeId}/learn/${material.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        '& .thumb-img': { transform: 'scale(1.05)' },
                        '& .video-title': { color: '#10b981' },
                      },
                    }}
                  >
                    {/* 16:9 Thumbnail Frame */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        mb: 1.8,
                      }}
                    >
                      <Box
                        className="thumb-img"
                        sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${material.thumbnailUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                          pointerEvents: 'none',
                        }}
                      />
                      
                      {/* Floating Type Icon overlay */}
                      <Chip
                        label={`${meta.icon} ${meta.label}`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.8)',
                          backdropFilter: 'blur(4px)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.6rem',
                          height: 20,
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />

                      {material.isPremium && (
                        <Chip
                          label="💎 PREMIUM"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(245,158,11,0.95)',
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: '0.6rem',
                            height: 20,
                            borderRadius: '4px',
                          }}
                        />
                      )}
                    </Box>

                    {/* Metadata stack (YouTube layout) */}
                    <Box sx={{ display: 'flex', gap: 1.5, px: 0.5 }}>
                      {/* Avatar */}
                      {material.author && (
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.7rem',
                            bgcolor: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            flexShrink: 0,
                            mt: 0.2,
                          }}
                        >
                          {material.author.charAt(0)}
                        </Avatar>
                      )}

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          className="video-title"
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            lineHeight: 1.3,
                            color: 'white',
                            fontSize: '0.92rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 0.5,
                            transition: 'color 0.2s ease',
                          }}
                        >
                          {material.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            mb: 0.4,
                          }}
                        >
                          {material.author || 'Ecosystem Operator'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
                            {material.readTime ? `⏱️ ${material.readTime}` : fmtDate(material.dateAdded)}
                          </Typography>
                          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                          <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 800 }}>
                            {material.challengeTitle}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Link>
              );
            })}
          </Box>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            5. EMPTY STATE (when filters yield no results)
           ═══════════════════════════════════════════════════════════════ */}
        {filteredMaterials.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 12,
              textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.08)',
              borderRadius: '24px',
              bgcolor: 'rgba(255,255,255,0.01)',
              px: 4,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.03)',
                mb: 3,
                fontSize: 32,
              }}
            >
              🔍
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: 'white', mb: 1.5 }}
            >
              No Blueprints Found
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.4)', maxWidth: 420, lineHeight: 1.7, fontSize: '0.9rem' }}
            >
              We couldn't find any resources matching your search query or selected filters. Try adjusting your settings or clearing the search.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedType('all');
              }}
              sx={{
                mt: 4,
                borderColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                borderRadius: '30px',
                px: 3,
                py: 1,
                fontSize: '0.8rem',
                fontWeight: 700,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
