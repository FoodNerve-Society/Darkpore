'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Divider, useTheme, alpha } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientFooter({ tenantName, tenantDomain, orgDomain }: { tenantName: string, tenantDomain: string, orgDomain: string }) {
  const pathname = usePathname();
  const theme = useTheme();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: 'The Challenges', path: '/challenges' },
    { label: 'Active Innovations', path: '/projects' },
    { label: 'Knowledge Center', path: '/learn' },
    { label: 'Our People', path: '/people' },
  ];

  return (
    <Box sx={{ 
      bgcolor: '#050505', 
      color: 'rgba(255,255,255,0.6)', 
      pt: { xs: 8, md: 12 }, 
      pb: 6, 
      borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient Glowing Background */}
      <Box sx={{
        position: 'absolute',
        bottom: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at center bottom, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 60%)`,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Subtle Top Glow */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60%',
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.4)}, transparent)`,
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={{ xs: 6, md: 4 }} sx={{ mb: 8 }}>
          
          {/* Column 1: Brand & Mission */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ pr: { xs: 0, md: 6 } }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 900, 
                color: 'white', 
                mb: 2,
                letterSpacing: 1
              }}>
                {tenantName}
              </Typography>
              <Typography variant="body1" sx={{ 
                lineHeight: 1.8, 
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.5)',
                mb: 4
              }}>
                The {tenantName} ecosystem is an open, decentralized initiative deploying capital and technology to solve Africa's most pressing infrastructure challenges. We back builders, researchers, and innovators.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ 
                  width: 40, height: 40, borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                      transform: 'translateY(-4px) scale(1.05)' 
                  }
                }}>
                  <Typography sx={{ fontSize: '1rem', color: 'white', transition: 'color 0.3s' }}>𝕏</Typography>
                </Box>
                <Box sx={{ 
                  width: 40, height: 40, borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                      transform: 'translateY(-4px) scale(1.05)' 
                  }
                }}>
                  <Typography sx={{ fontSize: '1rem', color: 'white', transition: 'color 0.3s' }}>in</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Platform Links */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="overline" sx={{ 
              color: 'rgba(255,255,255,0.3)', 
              fontWeight: 900, 
              letterSpacing: 2, 
              mb: 3, 
              display: 'block' 
            }}>
              PLATFORM
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {navLinks.map(link => (
                <Link key={link.path} href={link.path} style={{ 
                  color: isActive(link.path) ? theme.palette.primary.light : 'rgba(255,255,255,0.5)', 
                  textDecoration: 'none', 
                  fontSize: '0.9rem',
                  fontWeight: isActive(link.path) ? 700 : 500,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = theme.palette.primary.main)}
                onMouseLeave={(e) => (e.currentTarget.style.color = isActive(link.path) ? theme.palette.primary.light : 'rgba(255,255,255,0.5)')}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Column 3: Society Links */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="overline" sx={{ 
              color: 'rgba(255,255,255,0.3)', 
              fontWeight: 900, 
              letterSpacing: 2, 
              mb: 3, 
              display: 'block' 
            }}>
              THE SOCIETY
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <a href={`https://${orgDomain}`} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = theme.palette.primary.main)} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>About Society OS</a>
              <Link href="/join" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = theme.palette.primary.main)} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Member Login</Link>
              <a href={`https://${orgDomain}/register`} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = theme.palette.primary.main)} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Apply for Access</a>
              <Link href="/careers" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = theme.palette.primary.main)} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Careers</Link>
            </Box>
          </Grid>

          {/* Column 4: Disclaimer */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ 
              p: 3, 
              bgcolor: 'rgba(255,255,255,0.02)', 
              borderRadius: 4, 
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Typography variant="overline" sx={{ color: 'white', fontWeight: 900, letterSpacing: 1.5, mb: 1, display: 'block' }}>
                RESTRICTED ACCESS
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.4)' }}>
                {tenantDomain} serves as a public registry. To deploy capital or view full technical blueprints, you must hold an active membership in the {tenantName} Society on {orgDomain}.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 4 }} />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 3 
        }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            &copy; {new Date().getFullYear()} {tenantName} Initiative. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = theme.palette.primary.main)} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>Privacy Policy</Link>
            <Link href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = theme.palette.primary.main)} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>Terms of Service</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
