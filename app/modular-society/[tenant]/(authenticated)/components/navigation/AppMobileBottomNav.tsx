// @ts-nocheck
'use client';

import React, { FC, useState, useEffect } from 'react';
import { Box, Paper, IconButton, Avatar, Button, Popover, Divider, Typography, Badge, alpha } from '@mui/material';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import NotificationsIcon from '@mui/icons-material/Notifications';
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
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
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

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

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
      <Paper
        elevation={8}
        sx={{
          position: 'fixed', bottom: 16, left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          zIndex: 1200,
          borderRadius: '24px',
          background: activeNavTheme.mobileBg,
          opacity: 0.95,
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
          <Box
            sx={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', height: '64px', padding: '0 8px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton onClick={() => handleNavClick('/trade')} sx={{ p: 1 }}>
                <Box sx={{ bgcolor: '#1b5e20', width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '0.9rem' }}>FN</Typography>
                </Box>
              </IconButton>
              
              <IconButton onClick={() => handleNavClick('/updates')} sx={{ p: 0.5 }}>
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { right: 2, top: 2, minWidth: 16, height: 16, fontSize: '0.65rem' } }}>
                  <Box sx={{ bgcolor: 'rgba(27,94,32,0.1)', width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <NotificationsIcon sx={{ fontSize: 18, color: '#1b5e20' }} />
                  </Box>
                </Badge>
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                {isExpanded ? (
                  <Box
                    style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', padding: '0 4px' }}
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
                                '&:hover': { bgcolor: isActive ? navTheme.main : alpha(navTheme.main, 0.1), transform: 'scale(1.05)' }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', fontSize: isActive ? 24 : 28, '& svg': { fontSize: 'inherit' } }}>
                                {item.icon}
                              </Box>
                            </Button>
                          </Badge>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {activeIndex > 0 && ( <IconButton onClick={handlePrevious} size="small"><ChevronLeft /></IconButton> )}
                    <Box>
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
                              p: '8px 20px',
                              '&:hover': { bgcolor: activeNavTheme.main, transform: 'scale(1.02)' },
                            }}
                          >
                            {activeItem.label}
                          </Button>
                        </Box>
                      </Badge>
                    </Box>
                    {activeIndex < filteredNavItems.length - 1 && ( <IconButton onClick={handleNext} size="small"><ChevronRight /></IconButton> )}
                  </Box>
                )}
            </Box>
            
            <IconButton onClick={handleProfileOpen} sx={{ p: 0 }}>
              <Avatar src={user?.photoURL || ''} sx={{ width: 38, height: 38, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
            </IconButton>
          </Box>
      </Paper>

      <Popover
        open={Boolean(profileAnchorEl)}
        anchorEl={profileAnchorEl}
        onClose={handleProfileClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: 4 }
          }
        }}
      >
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', minWidth: '180px' }}>
          <Button
            fullWidth
            onClick={() => { setProfileAnchorEl(null); router.push('/profile'); }}
            sx={{
              justifyContent: 'flex-start', textTransform: 'none', fontWeight: 600,
              borderRadius: 1, py: 1, px: 2, color: 'text.primary',
              '&:hover': { bgcolor: alpha('#6366f1', 0.08) },
            }}
            startIcon={<Settings fontSize="small" />}
          >
            Profile & Settings
          </Button>
          <Divider sx={{ my: 0.5 }} />
          <Button
            fullWidth
            onClick={() => { setProfileAnchorEl(null); onSignOut(); }}
            sx={{
              justifyContent: 'flex-start', textTransform: 'none', fontWeight: 600,
              borderRadius: 1, py: 1, px: 2, color: 'error.main',
              '&:hover': { bgcolor: alpha('#ef4444', 0.08) },
            }}
            startIcon={<Logout fontSize="small" color="error" />}
          >
            Sign Out
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default AppMobileBottomNav;
