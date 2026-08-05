'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Stack, Avatar, useTheme, alpha, Collapse, keyframes } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const drapeSway = keyframes`
  0% { transform: perspective(600px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skewX(0deg); }
  25% { transform: perspective(600px) rotateX(6deg) rotateY(-4deg) rotateZ(1deg) skewX(-2deg); }
  75% { transform: perspective(600px) rotateX(-4deg) rotateY(3deg) rotateZ(-1deg) skewX(1deg); }
  100% { transform: perspective(600px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skewX(0deg); }
`;

export default function ClientNavbar({ tenantName, orgDomain }: { tenantName: string, orgDomain: string }) {
  const pathname = usePathname();
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentHour = new Date().getHours();
  const isMorning = hasMounted && (currentHour >= 5 && currentHour < 12);
  const isAfternoon = hasMounted && (currentHour >= 12 && currentHour < 18);
  const timeGradient = !hasMounted ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)' :
                       isMorning ? 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' :
                       isAfternoon ? 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' :
                       'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Extract the current challenge or top route from the URL
  const pathSegments = pathname.split('/').filter(Boolean);
  const knownTopRoutes = ['challenges', 'projects', 'learn', 'categories', 'careers', 'people'];
  const currentChallenge = pathSegments.length > 0 && !knownTopRoutes.includes(pathSegments[0])
    ? pathSegments[0]
    : null;
    
  const currentTopRoute = pathSegments.length > 0 && knownTopRoutes.includes(pathSegments[0])
    ? pathSegments[0]
    : null;
    
  const activeCategory = currentChallenge || currentTopRoute;

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


  // Extract logo parts for vertical rendering in the logo block
  const match = tenantName.match(/^(.*)(nerve)$/i);
  const logoPart1 = match ? match[1].toUpperCase() : tenantName.split(' ')[0]?.toUpperCase() || tenantName.toUpperCase();
  const logoPart2 = match ? match[2].toUpperCase() : tenantName.split(' ')[1]?.toUpperCase() || '';

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 12,
      marginX: 'auto',
      width: { xs: 'calc(100% - 24px)', md: 'calc(100% - 48px)' },
      maxWidth: '1200px',
      left: 0, right: 0,
      zIndex: 1100, 
      transition: 'all 0.3s ease',
      bgcolor: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(20px)',
      borderRadius: '12px 12px 24px 24px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: scrolled ? '0 12px 32px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0, 0, 0, 0.05)',
      overflow: 'visible', // Ensure the absolute logo can hang outside
    }}>
      {/* Brand Identity - Absolute positioned but inset from the edge, fixed at the inner top */}
      <Link href="/" passHref style={{ textDecoration: 'none', position: 'absolute', top: 0, left: 16, zIndex: 10 }}>
          <Box sx={{
              bgcolor: '#f1f8e9', /* Static brand color */
              px: 1.5, 
              pt: 3,
              pb: 1,
              display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), 0px 4px 10px rgba(0,0,0,0.15)', // Pronounced shadow to pop out
              borderRadius: 0,
              minHeight: '80px',
              width: '60px',
              animation: `${drapeSway} 8s ease-in-out infinite`,
              transformOrigin: 'top center',
              transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)'
          }}>
              <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, fontSize: '0.75rem', color: '#1b5e20', lineHeight: 1, letterSpacing: '-0.02em', textAlign: 'left', transition: 'all 0.4s ease' }}>
                  {logoPart1}{logoPart2 && <><br />{logoPart2}</>}
              </Typography>
          </Box>
      </Link>

      <Box sx={{ overflow: 'hidden', borderRadius: '12px 12px 24px 24px' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pr: { xs: 1.5, md: 2.5 },
          pl: 0,
          py: 1,
          gap: 2,
          position: 'relative'
        }}>
          
          {/* Spacer to push content right so it doesn't overlap the absolute positioned logo */}
          <Box sx={{ width: scrolled ? '90px' : '110px', transition: 'width 0.3s ease', flexShrink: 0 }} />

          {/* Category context indicator */}
          {activeCategory && (
            <Link href={`/${activeCategory}`} passHref style={{ textDecoration: 'none', display: 'flex' }}>
              <Box sx={{ 
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center', 
                gap: 1,
                px: 1.5, py: 0.5,
                bgcolor: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'rgba(0,0,0,0.15)' },
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                <Typography sx={{ 
                  color: '#0f172a', 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  letterSpacing: 1.5, 
                  textTransform: 'uppercase' 
                }}>
                  {activeCategory}
                </Typography>
              </Box>
            </Link>
          )}

          {/* Desktop Nav Links & Actions */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, alignItems: 'center', ml: 'auto' }}>
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path} passHref style={{ textDecoration: 'none' }}>
                <Button sx={{
                  position: 'relative',
                  borderRadius: 100,
                  color: isActive(link.path) ? theme.palette.primary.main : 'rgba(15,23,42,0.6)',
                  fontWeight: isActive(link.path) ? 800 : 600,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  letterSpacing: 0.3,
                  transition: 'all 0.3s',
                  px: 2,
                  py: 0.8,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 100,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    transform: isActive(link.path) ? 'scale(1)' : 'scale(0.8)',
                    opacity: isActive(link.path) ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 0
                  },
                  '&:hover': {
                    color: theme.palette.primary.main,
                    bgcolor: 'transparent'
                  },
                  '&:hover::before': {
                    opacity: 1,
                    transform: 'scale(1)'
                  }
                }}>
                  <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                    {link.label}
                  </Box>
                </Button>
              </Link>
            ))}

            <Link href={user ? `https://society.${orgDomain}` : "/join"} style={{ textDecoration: 'none', flexShrink: 0, marginLeft: 8 }}>
               {user ? (
                  <IconButton sx={{ p: 0.5, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, bgcolor: 'white', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                      <Avatar src={user.photoURL || undefined} sx={{ width: 32, height: 32, fontSize: '0.9rem', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: 'white', fontWeight: 'bold' }}>
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </Avatar>
                  </IconButton>
               ) : (
                  <Button variant="contained" size="small" sx={{ 
                      background: timeGradient,
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 100,
                      px: 3.5, 
                      py: 1,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s',
                      '&:hover': { 
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                      }
                  }}>
                  Login
                  </Button>
               )}
            </Link>
          </Box>

          {/* Mobile Menu Toggle */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto', gap: 1, alignItems: 'center' }}>
            <Link href={user ? `https://society.${orgDomain}` : "/join"} style={{ textDecoration: 'none' }}>
               {user ? (
                   <Avatar src={user.photoURL || undefined} sx={{ width: 30, height: 30, fontSize: '0.8rem', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: 'white', fontWeight: 'bold' }}>
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                   </Avatar>
               ) : (
                   <Button variant="contained" size="small" sx={{ 
                      background: timeGradient, color: '#ffffff', borderRadius: 100, px: 2, py: 0.6,
                      fontWeight: 800, fontSize: '0.75rem', textTransform: 'none', border: '1px solid rgba(255,255,255,0.2)'
                   }}>
                     Login
                   </Button>
               )}
            </Link>
            <IconButton onClick={() => setDrawerOpen(!drawerOpen)} sx={{ color: '#0f172a', bgcolor: 'rgba(15, 23, 42, 0.05)', borderRadius: '12px', p: 0.6 }}>
                {drawerOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>
        {/* Mobile Nav Collapse */}
        <Collapse in={drawerOpen}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1, p: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path} passHref style={{ textDecoration: 'none' }}>
                <Button
                  fullWidth
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    justifyContent: 'center', // Centered to avoid overlap with left logo
                    color: isActive(link.path) ? theme.palette.primary.main : '#0f172a',
                    fontWeight: isActive(link.path) ? 800 : 600,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    bgcolor: isActive(link.path) ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
