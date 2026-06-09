'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, Button } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function KnowledgeTeaser({ materials }: { materials: any[] }) {
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'All Updates' },
    { id: 'video', label: 'Videos' },
    { id: 'article', label: 'Articles' },
    { id: 'pdf', label: 'Reports' },
  ];

  const filteredMaterials = activeTab === 'all' 
    ? materials 
    : materials.filter(m => m.type && m.type.toLowerCase() === activeTab);

  const displayMaterials = filteredMaterials.slice(0, 6); // show up to 6 items

  return (
    <Box sx={{ pt: { xs: 10, md: 15 }, pb: { xs: 10, md: 15 }, px: 2, bgcolor: '#451a03', color: 'white', position: 'relative' }}>
      <Container maxWidth="lg">
        
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#fcd34d', fontWeight: 900, letterSpacing: 3, mb: 2, display: 'block' }}>
            KNOWLEDGE CENTER
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 4 }}>
            Open source intelligence from the field.
          </Typography>

          {/* YouTube-style Category Tabs */}
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
            {tabs.map(tab => (
              <Chip
                key={tab.id}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  bgcolor: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.1)',
                  color: activeTab === tab.id ? '#451a03' : 'white',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  px: 1,
                  py: 2.5,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.2)' },
                  cursor: 'pointer'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Grid Section */}
        <Box sx={{ position: 'relative', pb: 8 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, 
            gap: { xs: 4, md: 4 }
          }}>
            {displayMaterials.map((material, idx) => (
              <Box key={idx}>
                <Link href={`/${material.challengeId}/learn/${material.slug}`} passHref style={{ textDecoration: 'none' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1.5,
                    cursor: 'pointer',
                    '&:hover .thumb': { transform: 'scale(1.03)', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }
                  }}>
                    {/* YouTube style thumbnail */}
                    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', aspectRatio: '16/9' }} className="thumb">
                      <Box sx={{ 
                        position: 'absolute', inset: -2, 
                        backgroundImage: `url(${material.thumbnailUrl})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        transition: 'transform 0.4s ease',
                        '&:hover': { transform: 'scale(1.05)' }
                      }} />
                      {/* Duration or Type badge at bottom right */}
                      <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: '0.7rem', fontWeight: 800, letterSpacing: 1 }}>
                        {material.type.toUpperCase()}
                      </Box>
                    </Box>
                    
                    {/* Metadata */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>{(material.author || 'Darkpore')[0]}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'white', lineHeight: 1.4, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {material.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                          {material.author || 'Darkpore Intelligence'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                          {new Date(material.dateAdded).toLocaleDateString()} • {material.readTime || '5 min read'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Link>
              </Box>
            ))}

            {displayMaterials.length === 0 && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography sx={{ p: 4, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No intelligence available in this category.</Typography>
              </Box>
            )}
          </Box>

          {/* Fade out and "See More" button overlay */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: -20,
            right: -20,
            height: '80%',
            minHeight: 300,
            background: 'linear-gradient(to top, #451a03 0%, rgba(69, 26, 3, 0.98) 15%, rgba(69, 26, 3, 0.7) 40%, transparent 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            pb: { xs: 4, md: 6 },
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <Box sx={{ pointerEvents: 'auto' }}>
              <Link href="/learn" passHref style={{ textDecoration: 'none' }}>
                <Button 
                  variant="outlined" 
                  size="large" 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    borderRadius: 12, px: 6, py: 2, whiteSpace: 'nowrap', 
                    color: 'white', borderColor: 'rgba(255,255,255,0.2)', 
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      borderColor: 'rgba(255,255,255,0.6)', 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
                    } 
                  }}
                >
                  See more in the Information Center
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>

      </Container>
    </Box>
  );
}
