'use client';

import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import RadarIcon from '@mui/icons-material/Radar';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

export default function MasterPlanOverview() {
  const steps = [
    {
      num: '01',
      title: 'The Audit',
      desc: 'Isolating the structural flaws and systemic challenges.',
      icon: <RadarIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.7)' }} />
    },
    {
      num: '02',
      title: 'The Execution',
      desc: 'Real-world capital and operational deployments.',
      icon: <AutoGraphIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.7)' }} />
    },
    {
      num: '03',
      title: 'The Intelligence',
      desc: 'The tactical knowledge base and blueprints.',
      icon: <MemoryIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.7)' }} />
    }
  ];

  return (
    <Box sx={{ 
      position: 'relative',
      py: { xs: 6, md: 8 }, 
      bgcolor: '#000',
      overflow: 'hidden'
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 4, fontWeight: 800 }}>
            EXPLORATION PROTOCOL
          </Typography>
        </Box>

        <Box sx={{ position: 'relative' }}>
          {/* Connecting Line (Desktop) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: '50%',
            left: '10%',
            right: '10%',
            height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.2) 80%, transparent 100%)',
            zIndex: 0
          }} />

          <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
            {steps.map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Box sx={{
                  bgcolor: 'rgba(15,15,15,0.6)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 4,
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(25,25,25,0.8)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    '& .icon-box': {
                      borderColor: 'rgba(255,255,255,0.5)',
                      transform: 'scale(1.1)',
                      boxShadow: '0 0 20px rgba(255,255,255,0.1)'
                    }
                  }
                }}>
                  <Box className="icon-box" sx={{
                    width: 64, height: 64,
                    borderRadius: '50%',
                    bgcolor: '#050505',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 3,
                    transition: 'all 0.4s ease'
                  }}>
                    {step.icon}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>
                      {step.num}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, letterSpacing: 0.5 }}>
                      {step.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
        
      </Container>
    </Box>
  );
}
