'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientNavbar({ tenantName, orgDomain }: { tenantName: string, orgDomain: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract the current challenge from the URL (e.g., /land/innovations/some-update -> 'land')
  const pathSegments = pathname.split('/').filter(Boolean);
  const knownTopRoutes = ['challenges', 'projects', 'learn'];
  const currentChallenge = pathSegments.length > 0 && !knownTopRoutes.includes(pathSegments[0])
    ? pathSegments[0]
    : null;

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    
    // Smart deep link detection
    if (path === '/learn' && pathSegments.includes('learn')) return true;
    if (path === '/projects' && pathSegments.includes('innovations')) return true;
    if (path === '/challenges' && currentChallenge && !pathSegments.includes('learn') && !pathSegments.includes('innovations')) return true;
    
    return false;
  };

  const navLinks = [
    { label: 'Challenges', path: '/challenges' },
    { label: 'Innovations', path: '/projects' },
    { label: 'Knowledge', path: '/learn' },
  ];

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 0, left: 0, right: 0, 
      zIndex: 1000, 
      px: { xs: 1.5, md: scrolled ? 1.5 : 2.5 },
      py: { xs: 1, md: scrolled ? 1 : 1.5 },
      transition: 'all 0.3s ease',
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: scrolled ? 'rgba(10, 10, 12, 0.85)' : 'rgba(10, 10, 12, 0.4)', // Dark neutral glass
        backdropFilter: 'blur(24px)',
        borderRadius: scrolled ? '16px' : 0, // Rounded only on scroll
        px: { xs: 2, md: 3 },
        py: 1.2,
        border: scrolled ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: scrolled ? '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)' : '0 10px 30px rgba(0,0,0,0.2)',
        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
        gap: 2,
      }}>
        
        {/* Logo */}
        <Box sx={{ position: 'relative', width: scrolled ? '60px' : '85px', height: '100%', display: 'flex', transition: 'width 0.3s ease' }}>
          <Link href="/" passHref style={{ textDecoration: 'none', position: 'absolute', top: scrolled ? -14 : -16, left: 0, transition: 'top 0.3s ease' }}>
            <Box sx={{
                bgcolor: '#f1f8e9', /* Static brand color */
                px: scrolled ? 1.5 : 1.8, 
                pt: scrolled ? 2.5 : 3.5, 
                pb: scrolled ? 0.8 : 1.2,
                display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
                boxShadow: scrolled ? '0 6px 20px rgba(0, 0, 0, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.25)',
                borderRadius: 0, 
                minHeight: scrolled ? '60px' : '85px',
                transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)'
            }}>
                <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, fontSize: scrolled ? '0.65rem' : '0.9rem', color: '#1b5e20', lineHeight: 1, letterSpacing: '-0.02em', textAlign: 'left', transition: 'all 0.4s ease' }}>
                    {tenantName.split(' ')[0]?.toUpperCase()}<br />{tenantName.split(' ')[1]?.toUpperCase() || ''}
                </Typography>
            </Box>
          </Link>
        </Box>

        {/* Challenge context indicator */}
        {currentChallenge && (
          <Link href={`/${currentChallenge}`} passHref style={{ textDecoration: 'none' }}>
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center', 
              gap: 1,
              px: 1.5, py: 0.5,
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'rgba(255,255,255,0.2)' },
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: scrolled ? '#10b981' : 'rgba(255,255,255,0.3)' }} />
              <Typography sx={{ 
                color: scrolled ? '#f8fafc' : 'rgba(255,255,255,0.6)', 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                letterSpacing: 1.5, 
                textTransform: 'uppercase' 
              }}>
                {currentChallenge}
              </Typography>
            </Box>
          </Link>
        )}

        {/* Nav Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, alignItems: 'center', ml: 'auto' }}>
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path} passHref style={{ textDecoration: 'none' }}>
              <Button sx={{ 
                color: isActive(link.path) 
                   ? 'white' 
                   : (scrolled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)'), 
                bgcolor: isActive(link.path)
                   ? (scrolled ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255,255,255,0.1)')
                   : 'transparent',
                fontWeight: isActive(link.path) ? 800 : 600, 
                fontSize: '0.85rem',
                letterSpacing: 0.3,
                textTransform: 'none',
                borderRadius: 100,
                px: 2, py: 0.8,
                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                '&:hover': { 
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)'
                } 
              }}>
                {link.label}
              </Button>
            </Link>
          ))}
        </Box>

        {/* Society Login */}
        <Link href="/join" style={{ textDecoration: 'none', flexShrink: 0 }}>
           <Button variant="contained" size="small" sx={{ 
              bgcolor: 'white', 
              color: 'black', 
              borderRadius: 100, // M3 Expressive Pill
              px: 3.5, 
              py: 1,
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'none',
              boxShadow: scrolled ? '0 4px 14px rgba(27, 94, 32, 0.3)' : '0 4px 14px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
              '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'scale(1.02)' 
              }
           }}>
             Login
           </Button>
        </Link>
      </Box>
    </Box>
  );
}
