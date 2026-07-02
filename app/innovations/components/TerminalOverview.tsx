'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function TerminalOverview() {
  const [lines, setLines] = useState<number>(0);
  
  useEffect(() => {
    // Simple staggering effect for terminal lines
    const timer1 = setTimeout(() => setLines(1), 500);
    const timer2 = setTimeout(() => setLines(2), 1200);
    const timer3 = setTimeout(() => setLines(3), 1900);
    const timer4 = setTimeout(() => setLines(4), 2600);
    const timer5 = setTimeout(() => setLines(5), 3200);
    
    return () => {
      clearTimeout(timer1); clearTimeout(timer2); 
      clearTimeout(timer3); clearTimeout(timer4); clearTimeout(timer5);
    };
  }, []);

  return (
    <Box sx={{ 
      bgcolor: '#020202', 
      borderTop: '1px solid rgba(0, 255, 65, 0.1)',
      borderBottom: '1px solid rgba(0, 255, 65, 0.1)',
      py: { xs: 4, md: 6 }, 
      fontFamily: 'monospace'
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          maxWidth: '800px', 
          mx: 'auto',
          bgcolor: 'rgba(0,0,0,0.5)',
          p: 4,
          borderRadius: 2,
          border: '1px solid rgba(0, 255, 65, 0.1)',
          boxShadow: 'inset 0 0 20px rgba(0, 255, 65, 0.02)',
          color: '#00ff41' // Classic terminal green
        }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1.5, opacity: lines >= 0 ? 1 : 0, transition: 'opacity 0.3s', fontSize: { xs: '0.8rem', md: '1rem' } }}>
            {'>'} INITIATING EXPLORATION PROTOCOL...
          </Typography>
          
          <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1.5, opacity: lines >= 1 ? 1 : 0, transition: 'opacity 0.3s', fontSize: { xs: '0.8rem', md: '1rem' } }}>
            {'>'} LOADING PHASE 1: Systemic Fault Lines (The Challenges)... <span style={{ color: '#fff' }}>[OK]</span>
          </Typography>
          
          <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1.5, opacity: lines >= 2 ? 1 : 0, transition: 'opacity 0.3s', fontSize: { xs: '0.8rem', md: '1rem' } }}>
            {'>'} LOADING PHASE 2: Live Interventions (Active Deployments)... <span style={{ color: '#fff' }}>[OK]</span>
          </Typography>
          
          <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1.5, opacity: lines >= 3 ? 1 : 0, transition: 'opacity 0.3s', fontSize: { xs: '0.8rem', md: '1rem' } }}>
            {'>'} LOADING PHASE 3: Core Intelligence Matrix (Knowledge Area)... <span style={{ color: '#fff' }}>[OK]</span>
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, opacity: lines >= 4 ? 1 : 0, transition: 'opacity 0.3s' }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#fff', fontWeight: 700, fontSize: { xs: '0.8rem', md: '1rem' } }}>
              {'>'} STATUS: READY. PROCEED BELOW.
            </Typography>
            <Box sx={{ 
              width: 8, 
              height: 18, 
              bgcolor: '#00ff41', 
              ml: 1,
              animation: 'blink 1s step-end infinite',
              '@keyframes blink': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0 }
              }
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
