'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, Button } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function KnowledgeTeaser({ materials }: { materials: any[] }) {
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'All Intelligence' },
    { id: 'article', label: 'Articles' },
    { id: 'video', label: 'Videos' },
    { id: 'class', label: 'Classes' },
    { id: 'livestream', label: 'Livestreams' },
  ];

  const filteredMaterials = activeTab === 'all' 
    ? materials 
    : materials.filter(m => m.type && m.type.toLowerCase() === activeTab);

  const displayMaterials = filteredMaterials.slice(0, 5); // 1 featured + 4 standard = 5 items

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
            {displayMaterials.map((material, idx) => {
              const isFeatured = idx === 0;

              return (
                <Box 
                  key={material.id || idx}
                  sx={{
                    gridColumn: isFeatured ? { md: 'span 2' } : 'auto',
                    gridRow: isFeatured ? { md: 'span 2' } : 'auto',
                  }}
                >
                  <Link href={`/learn/${material.type || 'article'}/${material.slug}`} passHref style={{ textDecoration: 'none' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: isFeatured ? 2.5 : 1.5,
                      cursor: 'pointer',
                      height: '100%',
                      '&:hover .thumb': { transform: 'scale(1.03)', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }
                    }}>
                      {/* Thumbnail */}
                      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', aspectRatio: '16/9' }} className="thumb">
                        <Box sx={{ 
                          position: 'absolute', inset: -2, 
                          backgroundImage: `url(${material.thumbnailUrl})`, 
                          backgroundSize: 'cover', 
                          backgroundPosition: 'center',
                          transition: 'transform 0.4s ease',
                          '&:hover': { transform: 'scale(1.05)' }
                        }} />
                        {/* Type badge at bottom right */}
                        <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: '0.7rem', fontWeight: 800, letterSpacing: 1 }}>
                          {(material.type || 'article').toUpperCase()}
                        </Box>
                      </Box>
                      
                      {/* Metadata */}
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Box sx={{ width: isFeatured ? 48 : 40, height: isFeatured ? 48 : 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: isFeatured ? '1.3rem' : '1.1rem', color: 'rgba(255,255,255,0.9)' }}>{(material.author || 'Darkpore')[0]}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900, fontSize: isFeatured ? { xs: '1.2rem', md: '1.8rem' } : '1.05rem', color: 'white', lineHeight: 1.3, mb: 0.5, display: '-webkit-box', WebkitLineClamp: isFeatured ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
              );
            })}

            {displayMaterials.length === 0 && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography sx={{ p: 4, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No intelligence available in this category.</Typography>
              </Box>
            )}
          </Box>

          {/* Premium Wide CTA Card */}
          <Box sx={{ mt: 6 }}>
            <Link href="/learn" passHref style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                width: '100%',
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4,
                p: { xs: 3, md: 5 },
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }
              }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'white', letterSpacing: '-0.02em' }}>
                    Unlock the Information Center
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600 }}>
                    Dive deeper into our comprehensive library of field reports, masterclasses, and high-fidelity intelligence briefings.
                  </Typography>
                </Box>
                <Box sx={{ mt: { xs: 3, md: 0 }, flexShrink: 0 }}>
                  <Box sx={{ 
                    display: 'flex', alignItems: 'center', gap: 1.5, 
                    color: '#fcd34d', fontWeight: 900, letterSpacing: 1.5,
                    fontSize: '1.1rem', textTransform: 'uppercase'
                  }}>
                    Explore <ArrowForwardIcon sx={{ fontSize: '1.5rem' }} />
                  </Box>
                </Box>
              </Box>
            </Link>
          </Box>
        </Box>

      </Container>
    </Box>
  );
}
