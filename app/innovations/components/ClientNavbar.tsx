'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Stack, Avatar, useTheme, alpha } from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ClientNavbar({ tenantName, orgDomain }: { tenantName: string, orgDomain: string }) {
  const pathname = usePathname();
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        pr: { xs: 1.5, md: 2.5 },
        pl: 0, // No left padding so the logo forms the edge
        py: 1,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: scrolled ? '0 12px 32px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
        gap: 2,
        position: 'relative' // Needed for absolute positioning the logo
      }}>
        
        {/* Spacer to push content right so it doesn't overlap the absolute positioned logo */}
        <Box sx={{ width: scrolled ? '30px' : '40px', transition: 'width 0.3s ease', flexShrink: 0 }} />

        {/* Brand Identity - Perfectly centered vertically and on the left edge */}
        <Link href="/" passHref style={{ textDecoration: 'none', position: 'absolute', top: '50%', left: 0, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <Box sx={{
                bgcolor: '#f1f8e9', /* Static brand color */
                px: scrolled ? 1.5 : 2, 
                py: scrolled ? 2.5 : 3.5,
                display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
                boxShadow: scrolled ? '4px 4px 20px rgba(0, 0, 0, 0.1)' : '6px 6px 30px rgba(0, 0, 0, 0.15)',
                borderRadius: 0, // No border radius
                minHeight: scrolled ? '80px' : '110px',
                width: scrolled ? '60px' : '80px',
                transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)'
            }}>
                <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, fontSize: scrolled ? '0.75rem' : '1rem', color: '#1b5e20', lineHeight: 1, letterSpacing: '-0.02em', textAlign: 'left', transition: 'all 0.4s ease' }}>
                    {logoPart1}{logoPart2 && <><br />{logoPart2}</>}
                </Typography>
            </Box>
        </Link>

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
              <Box sx={{
                position: 'relative',
                cursor: 'pointer',
                px: 2, py: 0.8,
                borderRadius: 100,
                color: isActive(link.path) ? theme.palette.primary.main : 'rgba(15,23,42,0.6)',
                fontWeight: isActive(link.path) ? 800 : 600,
                fontSize: '0.85rem',
                letterSpacing: 0.3,
                transition: 'all 0.3s',
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
                },
                '&:hover::before': {
                  opacity: 1,
                  transform: 'scale(1)'
                }
              }}>
                <Typography sx={{ position: 'relative', zIndex: 1, fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }}>
                  {link.label}
                </Typography>
              </Box>
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
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: '#0f172a',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 100,
                    px: 3.5, 
                    py: 1,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s',
                    '&:hover': { 
                        background: 'rgba(255, 255, 255, 1)',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        transform: 'translateY(-1px)' 
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
                    bgcolor: 'rgba(255,255,255,0.8)', color: '#0f172a', borderRadius: 100, px: 2, py: 0.6,
                    fontWeight: 800, fontSize: '0.75rem', textTransform: 'none', border: '1px solid rgba(0,0,0,0.1)'
                 }}>
                   Login
                 </Button>
             )}
          </Link>
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)} sx={{ color: '#0f172a', bgcolor: 'rgba(15, 23, 42, 0.05)', borderRadius: '12px', p: 0.6, zIndex: 1200 }}>
              {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Full-Screen Blurred Mobile Menu */}
      <Box sx={{ 
        position: 'fixed', inset: 0, zIndex: 1150, 
        bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(30px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        pt: 10
      }}>
          <Stack spacing={4} sx={{ width: '100%', px: 4, alignItems: 'center' }}>
              {navLinks.map((link, i) => (
                  <Link key={link.path} href={link.path} passHref style={{ textDecoration: 'none', width: '100%', textAlign: 'center' }}>
                      <Box 
                          onClick={() => setDrawerOpen(false)}
                          sx={{ 
                              color: isActive(link.path) ? theme.palette.primary.main : '#0f172a',
                              fontWeight: 900,
                              fontSize: '2rem',
                              letterSpacing: '-0.03em',
                              fontFamily: 'var(--font-playfair)',
                              transform: drawerOpen ? 'translateY(0)' : 'translateY(20px)',
                              opacity: drawerOpen ? 1 : 0,
                              transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`,
                          }}
                      >
                          {link.label}
                      </Box>
                  </Link>
              ))}
              <Box sx={{ 
                  width: '40px', height: '2px', bgcolor: alpha(theme.palette.primary.main, 0.3), my: 2,
                  transform: drawerOpen ? 'scaleX(1)' : 'scaleX(0)',
                  opacity: drawerOpen ? 1 : 0,
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }} />
              <Link href="/join" passHref style={{ textDecoration: 'none' }}>
                <Button 
                    onClick={() => setDrawerOpen(false)}
                    variant="contained"
                    sx={{ 
                        borderRadius: 100, px: 5, py: 1.5, fontSize: '1.1rem', fontWeight: 800, textTransform: 'none',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                        transform: drawerOpen ? 'translateY(0)' : 'translateY(20px)',
                        opacity: drawerOpen ? 1 : 0,
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.25s',
                    }}
                >
                    {user ? 'Open Dashboard' : 'Join the Society'}
                </Button>
              </Link>
          </Stack>
      </Box>
    </Box>
  );
}
