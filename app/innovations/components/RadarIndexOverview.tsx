'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function RadarIndexOverview() {
  const [activeSection, setActiveSection] = useState('challenges');

  // Accurate scroll-spy using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the intersection entry that is most visible
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            const id = entry.target.getAttribute('id');
            if (id === 'section-challenges') setActiveSection('challenges');
            if (id === 'section-deployments') setActiveSection('deployments');
            if (id === 'section-knowledge') setActiveSection('knowledge');
          }
        });
      },
      { threshold: [0.2, 0.5, 0.8], rootMargin: '-10% 0px -50% 0px' }
    );

    const challengesEl = document.getElementById('section-challenges');
    const deploymentsEl = document.getElementById('section-deployments');
    const knowledgeEl = document.getElementById('section-knowledge');

    if (challengesEl) observer.observe(challengesEl);
    if (deploymentsEl) observer.observe(deploymentsEl);
    if (knowledgeEl) observer.observe(knowledgeEl);

    return () => observer.disconnect();
  }, []);

  const sections = [
    { id: 'challenges', label: '01 / The Challenges' },
    { id: 'deployments', label: '02 / Active Deployments' },
    { id: 'knowledge', label: '03 / Knowledge Matrix' },
  ];

  return (
    <Box sx={{
      position: 'sticky',
      top: 64, // below standard header
      zIndex: 50,
      width: '100%',
      py: 2,
      borderTop: '1px solid rgba(0, 230, 118, 0.3)',
      borderBottom: '1px solid rgba(0, 230, 118, 0.3)',
      background: 'linear-gradient(90deg, rgba(2, 44, 34, 0.85) 0%, rgba(0, 77, 64, 0.95) 50%, rgba(2, 44, 34, 0.85) 100%)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0, 230, 118, 0.1)',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <Container maxWidth="md">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: { xs: 2, md: 4 },
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' }
        }}>
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <Box 
                key={sec.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  opacity: isActive ? 1 : 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                <Box sx={{
                  width: isActive ? 12 : 8, 
                  height: isActive ? 12 : 8, 
                  borderRadius: '50%',
                  bgcolor: isActive ? '#69f0ae' : 'transparent',
                  border: `2px solid ${isActive ? '#69f0ae' : 'rgba(255,255,255,0.4)'}`,
                  boxShadow: isActive ? '0 0 15px #69f0ae' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
                <Typography variant="body2" sx={{ 
                  fontWeight: isActive ? 900 : 600, 
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  letterSpacing: 1,
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.7rem', md: isActive ? '0.9rem' : '0.8rem' },
                  textShadow: isActive ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {sec.label}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Container>
    </Box>
  );
}
