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

  // Extract the current bottleneck from the URL (e.g., /land/innovations/some-update -> 'land')
  const pathSegments = pathname.split('/').filter(Boolean);
  const knownTopRoutes = ['bottlenecks', 'projects', 'learn'];
  const currentBottleneck = pathSegments.length > 0 && !knownTopRoutes.includes(pathSegments[0])
    ? pathSegments[0]
    : null;

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    
    // Smart deep link detection
    if (path === '/learn' && pathSegments.includes('learn')) return true;
    if (path === '/projects' && pathSegments.includes('innovations')) return true;
    if (path === '/bottlenecks' && currentBottleneck && !pathSegments.includes('learn') && !pathSegments.includes('innovations')) return true;
    
    return false;
  };

  const navLinks = [
    { label: 'Bottlenecks', path: '/bottlenecks' },
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
        bgcolor: scrolled ? 'rgba(10, 10, 10, 0.9)' : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
        borderRadius: { xs: 3, md: 4 },
        px: { xs: 2, md: 3 },
        py: 1.2,
        border: '1px solid',
        borderColor: scrolled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : 'none',
        transition: 'all 0.3s ease',
        gap: 2,
      }}>
        
        {/* Logo */}
        <Link href="/" passHref style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 900, color: 'white', fontSize: '1.1rem', letterSpacing: 0.5 }}>
            {tenantName.split(' ')[0]}<span style={{ color: 'rgba(255,255,255,0.5)' }}>{tenantName.split(' ')[1] ? ' ' + tenantName.split(' ')[1] : ''}</span>
          </Typography>
        </Link>

        {/* Bottleneck context indicator */}
        {currentBottleneck && (
          <Link href={`/${currentBottleneck}`} passHref style={{ textDecoration: 'none' }}>
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
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Typography sx={{ 
                color: 'rgba(255,255,255,0.6)', 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                letterSpacing: 1.5, 
                textTransform: 'uppercase' 
              }}>
                {currentBottleneck}
              </Typography>
            </Box>
          </Link>
        )}

        {/* Nav Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center', ml: 'auto' }}>
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path} passHref style={{ textDecoration: 'none' }}>
              <Typography sx={{ 
                color: isActive(link.path) ? 'white' : 'rgba(255,255,255,0.5)', 
                fontWeight: isActive(link.path) ? 700 : 500, 
                fontSize: '0.82rem',
                letterSpacing: 0.3,
                transition: 'all 0.2s',
                '&:hover': { color: 'white' } 
              }}>
                {link.label}
              </Typography>
            </Link>
          ))}
        </Box>

        {/* Society Login */}
        <a href={`https://${orgDomain}/login`} style={{ textDecoration: 'none', flexShrink: 0 }}>
           <Button variant="contained" size="small" sx={{ 
              bgcolor: 'white', 
              color: 'black', 
              borderRadius: 2, 
              px: 2.5, 
              py: 0.8,
              fontWeight: 800,
              fontSize: '0.78rem',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
           }}>
             Login
           </Button>
        </a>
      </Box>
    </Box>
  );
}
