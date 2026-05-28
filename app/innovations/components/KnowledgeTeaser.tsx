'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Chip, Button } from '@mui/material';
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
    : materials.filter(m => m.type.toLowerCase() === activeTab);

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
        <Box sx={{ position: 'relative' }}>
          <Grid container spacing={3}>
            {displayMaterials.map((material, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Link href={`/${material.bottleneckId}/learn/${material.slug}`} passHref style={{ textDecoration: 'none' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1.5,
                    cursor: 'pointer',
                    '&:hover .thumb': { transform: 'scale(1.03)', borderRadius: 2 }
                  }}>
                    {/* YouTube style thumbnail */}
                    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, transition: 'all 0.3s', aspectRatio: '16/9' }} className="thumb">
                      <Box sx={{ 
                        position: 'absolute', inset: 0, 
                        backgroundImage: `url(${material.thumbnailUrl})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center' 
                      }} />
                      {/* Duration or Type badge at bottom right */}
                      <Box sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.7rem', fontWeight: 700 }}>
                        {material.type.toUpperCase()}
                      </Box>
                    </Box>
                    
                    {/* Metadata */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'white' }}>{(material.author || 'Darkpore')[0]}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'white', lineHeight: 1.3, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {material.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                          {material.author || 'Darkpore Intelligence'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                          {new Date(material.dateAdded).toLocaleDateString()} • {material.readTime || '5 min read'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Link>
              </Grid>
            ))}

            {displayMaterials.length === 0 && (
              <Grid item xs={12}>
                <Typography sx={{ p: 4, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No intelligence available in this category.</Typography>
              </Grid>
            )}
          </Grid>

          {/* Fade out and "See More" button overlay */}
          <Box sx={{
            position: 'absolute',
            bottom: -2,
            left: 0,
            right: 0,
            height: 180,
            background: 'linear-gradient(to top, #451a03 0%, rgba(69, 26, 3, 0.9) 30%, transparent 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            pb: 2,
            zIndex: 10
          }}>
            <Link href="/learn" passHref style={{ textDecoration: 'none' }}>
              <Button 
                variant="outlined" 
                size="large" 
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  borderRadius: 8, px: 5, py: 1.5, whiteSpace: 'nowrap', 
                  color: 'white', borderColor: 'rgba(255,255,255,0.3)', 
                  bgcolor: 'rgba(69, 26, 3, 0.8)',
                  backdropFilter: 'blur(4px)',
                  fontWeight: 800,
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                See more in the Information Center
              </Button>
            </Link>
          </Box>
        </Box>

      </Container>
    </Box>
  );
}
