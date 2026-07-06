'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export interface AccordionArticle {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  link: string;
  author: string;
  dateAdded: Date | string;
}

export interface AccordionCategory {
  id: string;
  title: string;
  articles: AccordionArticle[];
}

interface AccordionHeroProps {
  categories: AccordionCategory[];
}

export default function AccordionHero({ categories }: AccordionHeroProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');

  return (
    <Box sx={{ width: '100%', minHeight: '80vh', bgcolor: '#ffffff', color: '#000000', display: 'flex', flexDirection: 'column', pt: 8, pb: 4 }}>
      <Box sx={{ px: { xs: 2, md: 6 }, mb: 4 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, fontFamily: 'serif', fontSize: { xs: '2.5rem', md: '4rem' }, mb: 1, letterSpacing: '-0.02em' }}>
          Intelligence Hub
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
          Select an area of focus to explore our latest deployments and insights.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid #e0e0e0' }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <Box
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              sx={{
                flex: isActive ? '1 1 500px' : '0 0 85px',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                borderBottom: '1px solid #e0e0e0',
                overflow: 'hidden',
                cursor: isActive ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                bgcolor: isActive ? '#fafafa' : '#ffffff',
                '&:hover': {
                  bgcolor: isActive ? '#fafafa' : '#f5f5f5'
                }
              }}
            >
              {/* Header Area */}
              <Box sx={{ 
                height: '85px', 
                display: 'flex', 
                alignItems: 'center', 
                px: { xs: 2, md: 6 } 
              }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  fontFamily: 'serif', 
                  fontSize: { xs: '1.5rem', md: '2.5rem' },
                  color: isActive ? '#000000' : '#757575',
                  transition: 'color 0.3s'
                }}>
                  {cat.title}
                </Typography>
                {!isActive && (
                  <Typography variant="body2" sx={{ ml: 'auto', color: '#9e9e9e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {cat.articles.length} Updates
                  </Typography>
                )}
              </Box>

              {/* Content Area */}
              <Box sx={{ 
                opacity: isActive ? 1 : 0, 
                transition: 'opacity 0.4s 0.2s',
                flex: 1,
                display: 'flex',
                px: { xs: 2, md: 6 },
                pb: 4,
                overflowX: 'auto',
                gap: 4,
                alignItems: 'center',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' }
              }}>
                {cat.articles.length === 0 ? (
                  <Typography sx={{ color: '#999', fontStyle: 'italic' }}>No recent updates in this category.</Typography>
                ) : (
                  cat.articles.slice(0, 5).map(article => (
                    <Box 
                      key={article.id} 
                      component={Link}
                      href={article.link}
                      sx={{ 
                        minWidth: { xs: '280px', md: '350px' },
                        maxWidth: '350px',
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        group: 'true'
                      }}
                    >
                      <Box sx={{ 
                        width: '100%', 
                        aspectRatio: '16/9', 
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}>
                        <Box 
                          component="img" 
                          src={article.thumbnailUrl} 
                          alt={article.title}
                          sx={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.4s',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }} 
                        />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'serif', lineHeight: 1.3, mb: 1, color: '#000', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {article.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                          By {article.author}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
                
                {cat.articles.length > 0 && (
                  <Button 
                    variant="outlined" 
                    endIcon={<ArrowForwardIcon />}
                    component={Link}
                    href={`/innovations/${cat.id}`}
                    sx={{ 
                      minWidth: '200px', 
                      height: '60px',
                      borderRadius: 8,
                      borderColor: '#000',
                      color: '#000',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: '#000',
                        color: '#fff'
                      }
                    }}
                  >
                    View all {cat.title}
                  </Button>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
