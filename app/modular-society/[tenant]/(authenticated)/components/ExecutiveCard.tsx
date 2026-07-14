"use client";

import React, { forwardRef } from 'react';
import { Box, Typography, alpha } from '@mui/material';

export type ExecutiveCardProps = {
  cardTheme: string;
  cardStyle: 'announcement' | 'membership';
  prefixes: string[];
  firstName: string;
  lastName: string;
  suffixes: string[];
  avatarUrl: string;
  darkpore: { active: boolean; role?: string; department?: string; logoUrl?: string };
  foodnerve: { active: boolean; role?: string; department?: string; logoUrl?: string };
};

const safeAlpha = (color: string, opacity: number) => {
  try {
    return alpha(color, opacity);
  } catch (e) {
    return `rgba(0,0,0,${opacity})`;
  }
};

const ExecutiveCard = forwardRef<HTMLDivElement, ExecutiveCardProps>(({
  cardTheme,
  cardStyle,
  prefixes,
  firstName,
  lastName,
  suffixes,
  avatarUrl,
  darkpore,
  foodnerve
}, ref) => {
  return (
    <Box ref={ref} sx={{
      p: 4, borderRadius: '24px', 
      background: '#ffffff',
      border: `1px solid ${safeAlpha(cardTheme, 0.1)}`,
      boxShadow: `0 20px 40px ${safeAlpha(cardTheme, 0.15)}`,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      width: { xs: 320, sm: 400 },
      aspectRatio: '3 / 4',
    }}>
      {cardStyle === 'announcement' ? (
        <>
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, background: `radial-gradient(circle, ${safeAlpha(cardTheme, 0.05)} 0%, transparent 70%)`, borderRadius: '50%', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, background: `radial-gradient(circle, ${safeAlpha(cardTheme, 0.05)} 0%, transparent 70%)`, borderRadius: '50%', zIndex: 1 }} />

          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 3, zIndex: 2 }}>
            {darkpore.active && darkpore.logoUrl && (
              <img src={darkpore.logoUrl} alt="Darkpore" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
            )}
            {foodnerve.active && foodnerve.logoUrl && (
              <img src={foodnerve.logoUrl} alt="FoodNerve" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
            )}
          </Box>

          <Box sx={{ zIndex: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ color: cardTheme, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', mb: 1.5 }}>
              I'm thrilled to announce...
            </Typography>
            
            <Typography sx={{ fontWeight: 900, fontSize: '1.45rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.3, mb: 3, maxWidth: '85%' }}>
              I started a new position as <span style={{ color: cardTheme }}>{[darkpore.active ? darkpore.role : '', foodnerve.active ? foodnerve.role : ''].filter(Boolean).join(' & ')}</span> at {[darkpore.active ? 'Darkpore' : '', foodnerve.active ? 'FoodNerve' : ''].filter(Boolean).join(' and ')} in the <span style={{ color: '#475569' }}>{[darkpore.active ? darkpore.department : '', foodnerve.active ? foodnerve.department : ''].filter(Boolean).join(' & ')}</span> department.
            </Typography>

            <Box sx={{ mt: 'auto', mb: 4, maxWidth: '60%' }}>
              <Box sx={{ width: 32, height: 3, bgcolor: cardTheme, borderRadius: 2, mb: 1 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>
                {[...prefixes, firstName, lastName, ...suffixes].filter(Boolean).join(' ')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            position: 'absolute', bottom: -10, right: -20, width: 220, height: 220, 
            borderRadius: '50%', 
            border: '8px solid #fff', 
            backgroundImage: `url(${avatarUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            bgcolor: '#f8fafc',
            zIndex: 3 
          }} />
          
          <Box sx={{ position: 'absolute', bottom: 24, left: 32, zIndex: 2 }}>
            <Typography sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: '2px', fontSize: '0.65rem', textTransform: 'uppercase' }}>
              foodnerve.org
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ height: '35%', background: cardTheme, position: 'relative', overflow: 'hidden', mx: -4, mt: -4, mb: 4 }}>
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-80px', position: 'relative', zIndex: 2 }}>
            <Box sx={{ 
              width: 120, height: 120, 
              borderRadius: '50%', 
              border: '6px solid #fff', 
              backgroundImage: `url(${avatarUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              bgcolor: '#f8fafc' 
            }} />
          </Box>

          <Box sx={{ flexGrow: 1, pt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {[...prefixes, firstName, lastName, ...suffixes].filter(Boolean).join(' ')}
            </Typography>
            <Typography sx={{ color: cardTheme, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', mb: 0.5 }}>
              Proud Member of FoodNerve Society
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 4, alignItems: 'flex-start' }}>
              {darkpore.active && darkpore.logoUrl && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <img src={darkpore.logoUrl} style={{ height: 32, objectFit: 'contain' }} />
                  <Typography sx={{ color: '#0f172a', fontSize: '0.75rem', fontWeight: 700 }}>Darkpore</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600 }}>{darkpore.role}</Typography>
                </Box>
              )}
              {foodnerve.active && foodnerve.logoUrl && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <img src={foodnerve.logoUrl} style={{ height: 32, objectFit: 'contain' }} />
                  <Typography sx={{ color: '#0f172a', fontSize: '0.75rem', fontWeight: 700 }}>FoodNerve</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600 }}>{foodnerve.role}</Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mt: 'auto', mb: 2 }}>
              <Typography sx={{ fontWeight: 900, color: '#cbd5e1', letterSpacing: '2px', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                foodnerve.org
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
});

ExecutiveCard.displayName = 'ExecutiveCard';

export default ExecutiveCard;