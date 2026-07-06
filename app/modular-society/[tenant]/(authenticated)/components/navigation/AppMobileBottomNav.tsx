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
          <Box
            sx={{
              flex: 1,
              display: 'flex', alignItems: 'center', height: '64px', px: 1,
              pointerEvents: 'auto', // Re-enable touches for the bubble
              justifyContent: 'space-around', // Distribute icons evenly
            }}
          >
                  <Box
                    style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', padding: '0 4px', width: '100%', justifyContent: 'space-evenly' }}
                  >
                    {filteredNavItems.map(item => {
                      const isActive = displayPath.includes(item.href);
                      const navTheme = PAGE_THEMES[item.themeKey];
                      const badgeVal = badges[item.href];
                      
                      const IconWrapper = ({ children }: { children: React.ReactNode }) => (
                        isActive ? <>{children}</> : <Badge badgeContent={badgeVal} color="error">{children}</Badge>
                      );

                      return (
                        <Box key={item.href}>
                          <IconWrapper>
                            <Button
                              variant={isActive ? 'contained' : 'text'}
                              onClick={() => handleNavClick(item.href)}
                              sx={{
                                borderRadius: 3, // Match sidebar
                                textTransform: 'none', 
                                fontWeight: isActive ? 800 : 700, 
                                minWidth: 0,
                                bgcolor: isActive ? navTheme.main : 'transparent',
                                color: isActive ? navTheme.contrastText : 'rgba(0,0,0,0.6)',
                                backdropFilter: 'none',
                                boxShadow: isActive ? `0 6px 16px -4px ${alpha(navTheme.main || '#000', 0.5)}` : 'none',
                                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                                p: isActive ? '8px 16px' : '8px 12px',
                                '&:hover': { 
                                  bgcolor: isActive ? navTheme.main : alpha(navTheme.main, 0.08), 
                                  transform: 'scale(1.05)' 
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', fontSize: isActive ? 24 : 26, '& svg': { fontSize: 'inherit' } }}>
                                {item.icon}
                              </Box>
                              {isActive && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography sx={{ ml: 1, fontWeight: 800 }}>{item.label}</Typography>
                                  {badgeVal ? (
                                    <Box component="span" sx={{
                                      ml: 1,
                                      bgcolor: '#ffffff', 
                                      color: navTheme.main, 
                                      fontSize: '0.65rem', fontWeight: 'bold',
                                      px: 0.8, py: 0.2, borderRadius: 10, minWidth: 22, textAlign: 'center',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    }}>
                                      {badgeVal}
                                    </Box>
                                  ) : null}
                                </Box>
                              )}
                            </Button>
                          </IconWrapper>
                        </Box>
                      );
                    })}
                  </Box>
          </Box>

          {/* Right Bubble: Profile Avatar */}
          <Box
            sx={{
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
          </Box>
      </Box>

    </>
  );
};

export default AppMobileBottomNav;
