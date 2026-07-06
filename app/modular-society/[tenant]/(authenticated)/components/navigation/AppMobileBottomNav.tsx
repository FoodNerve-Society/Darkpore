// @ts-nocheck
'use client';

import React, { FC, useState, useEffect } from 'react';
import { Box, Paper, IconButton, Button, Typography, Badge, alpha } from '@mui/material';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Avatar from '@mui/material/Avatar';
import { useRouter, usePathname } from 'next/navigation';
import { SocietyProfile, useSociety } from '@/context/SocietyContext';
import { getActiveTheme, PAGE_THEMES } from './NavThemes';

interface AppMobileBottomNavProps {
  profile: SocietyProfile | null;
  onSignOut: () => void;
  badges?: { [key: string]: number | boolean };
  tenant?: string;
}

const defaultNavItems = [
  { href: '/trade', label: 'Trade', icon: <HandshakeIcon />, themeKey: 'TRADE' as keyof typeof PAGE_THEMES },
  { href: '/meet', label: 'Meet', icon: <ContactsIcon />, themeKey: 'MEET' as keyof typeof PAGE_THEMES },
  { href: '/learn', label: 'Learn', icon: <SchoolIcon />, themeKey: 'LEARN' as keyof typeof PAGE_THEMES },
  { href: '/support', label: 'Support', icon: <AttachMoneyIcon />, themeKey: 'SUPPORT' as keyof typeof PAGE_THEMES },
];

const getDynamicNavItems = (profile: SocietyProfile | null) => {
  let items = [...defaultNavItems];

  // Use tabOrder from profile if available and it has 4 items
  if (profile?.tabOrder && profile.tabOrder.length === 4) {
    items.sort((a, b) => {
      const indexA = profile.tabOrder.indexOf(a.href.replace('/', ''));
      const indexB = profile.tabOrder.indexOf(b.href.replace('/', ''));
      // If a tab isn't in tabOrder, push it to the end
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return items;
  }

  // Fallback to role-based sorting if tabOrder is missing
  if (!profile || !profile.roles || profile.roles.length === 0) return items;

  const primaryRole = profile.roles[0];
  
  if (primaryRole === 'investor' || primaryRole === 'logistics') {
    items.sort((a, b) => {
      if (a.href === '/support') return -1;
      if (b.href === '/support') return 1;
      if (a.href === '/meet') return -1;
      if (b.href === '/meet') return 1;
      return 0;
    });
  } else if (primaryRole === 'researcher' || primaryRole === 'student') {
    items.sort((a, b) => {
      if (a.href === '/learn') return -1;
      if (b.href === '/learn') return 1;
      if (a.href === '/meet') return -1;
      if (b.href === '/meet') return 1;
      return 0;
    });
  } else {
    items.sort((a, b) => {
      if (a.href === '/trade') return -1;
      if (b.href === '/trade') return 1;
      if (a.href === '/learn') return -1;
      if (b.href === '/learn') return 1;
      return 0;
    });
  }
  
  return items;
};

const AppMobileBottomNav: FC<AppMobileBottomNavProps> = ({ profile, onSignOut, badges = {}, tenant = 'society' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSociety();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingPathname, setPendingPathname] = useState<string | null>(null);

  const displayPath = pendingPathname || pathname;
  
  const filteredNavItems = getDynamicNavItems(profile).filter(item => {
    if (tenant === 'innovations' && (item.href === '/trade' || item.href === '/learn')) return false;
    return true;
  });

  const activeItem = filteredNavItems.find(item => displayPath.includes(item.href)) || filteredNavItems[0];
  const activeNavTheme = PAGE_THEMES[activeItem.themeKey];
  const activeIndex = filteredNavItems.findIndex(item => item.href === activeItem.href);

  useEffect(() => {
    if (pendingPathname && pathname.includes(pendingPathname)) {
      setPendingPathname(null);
      setIsNavigating(false);
    }
  }, [pathname, pendingPathname]);

  const handleNavClick = (href: string) => {
    if (pathname.includes(href)) { setIsExpanded(false); return; }
    setIsNavigating(true);
    setPendingPathname(href);
    setIsExpanded(false);
    setTimeout(() => { router.push(href); }, 300);
  };

  const handlePrevious = () => { if (activeIndex > 0) handleNavClick(filteredNavItems[activeIndex - 1].href); };
  const handleNext = () => { if (activeIndex < filteredNavItems.length - 1) handleNavClick(filteredNavItems[activeIndex + 1].href); };
  const toggleNavState = () => setIsExpanded(prev => !prev);
  
  const totalBadgeCount = Object.values(badges).reduce<number>((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);

  return (
    <>
      <Box
        sx={{
          width: '100%',
          px: 2,
          pb: 2,
          pt: 1,
          zIndex: 1200,
          display: 'flex',
          gap: 1.5,
          pointerEvents: 'none', // Let touches pass through the empty space
          bgcolor: 'transparent',
          flexShrink: 0, // Prevent it from shrinking in flex column
        }}
      >
          {/* Left Bubble: Nav Items */}
          <Paper
            elevation={8}
            sx={{
              flex: 1,
              borderRadius: '24px',
              background: activeNavTheme.mobileBg,
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
              display: 'flex', alignItems: 'center', height: '64px', px: 1,
              pointerEvents: 'auto', // Re-enable touches for the bubble
            }}
          >
                {isExpanded ? (
                  <Box
                    style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', padding: '0 4px', width: '100%', justifyContent: 'space-evenly' }}
                  >
                    {filteredNavItems.map(item => {
                      const isActive = displayPath.includes(item.href);
                      const navTheme = PAGE_THEMES[item.themeKey];
                      return (
                        <Box key={item.href}>
                          <Badge badgeContent={badges[item.href]} color="error">
                            <Button
                              variant={isActive ? 'contained' : 'text'}
                              onClick={() => handleNavClick(item.href)}
                              sx={{
                                borderRadius: 100, // M3 Expressive Pill
                                textTransform: 'none', fontWeight: 'bold', minWidth: 0,
                                bgcolor: isActive ? navTheme.main : 'transparent',
                                color: isActive ? navTheme.contrastText : 'rgba(0,0,0,0.6)',
                                boxShadow: isActive ? `0 4px 12px ${alpha(navTheme.main, 0.4)}` : 'none',
                                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                                p: isActive ? '8px 20px' : '8px',
                                '&:hover': { bgcolor: isActive ? navTheme.main : alpha(navTheme.main, 0.1), transform: 'scale(1.05)' }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', fontSize: isActive ? 24 : 28, '& svg': { fontSize: 'inherit' } }}>
                                {item.icon}
                              </Box>
                              {isActive && (
                                <Typography sx={{ ml: 1, fontWeight: 800 }}>{item.label}</Typography>
                              )}
                            </Button>
                          </Badge>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'space-between', padding: '0 8px' }}
                  >
                    <IconButton onClick={handlePrevious} size="small" disabled={activeIndex === 0} sx={{ opacity: activeIndex === 0 ? 0 : 1 }}>
                      <ChevronLeft />
                    </IconButton>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <Badge badgeContent={totalBadgeCount > 0 ? totalBadgeCount : undefined} color="error">
                        <Box>
                          <Button
                            variant="contained"
                            onClick={toggleNavState}
                            startIcon={activeItem.icon}
                            sx={{
                              borderRadius: 100, // M3 Expressive Pill
                              textTransform: 'none', fontWeight: 800,
                              bgcolor: activeNavTheme.main, color: activeNavTheme.contrastText,
                              boxShadow: `0 4px 16px ${alpha(activeNavTheme.main, 0.4)}`, 
                              transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                              p: '8px 32px',
                              fontSize: '1.1rem',
                              '&:hover': { bgcolor: activeNavTheme.main, transform: 'scale(1.02)' },
                            }}
                          >
                            {activeItem.label}
                          </Button>
                        </Box>
                      </Badge>
                    </Box>
                    <IconButton onClick={handleNext} size="small" disabled={activeIndex === filteredNavItems.length - 1} sx={{ opacity: activeIndex === filteredNavItems.length - 1 ? 0 : 1 }}>
                      <ChevronRight />
                    </IconButton>
                  </Box>
                )}
          </Paper>

          {/* Right Bubble: Profile Avatar */}
          <Paper
            elevation={8}
            sx={{
              borderRadius: '24px', // Keep consistent pill roundness
              background: activeNavTheme.mobileBg,
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '64px', height: '64px',
              pointerEvents: 'auto',
            }}
          >
            <IconButton onClick={() => router.push('/profile')} sx={{ p: 0 }}>
              <Avatar 
                src={profile?.avatarUrl || user?.photoURL || undefined} 
                sx={{ width: 44, height: 44, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
              />
            </IconButton>
          </Paper>
      </Box>

    </>
  );
};

export default AppMobileBottomNav;
