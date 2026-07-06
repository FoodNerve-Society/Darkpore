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
    <Box
      sx={{
        width: '100%',
        zIndex: 1200,
        pointerEvents: 'none',
        flexShrink: 0,
        pb: { xs: 2, sm: 3 },
        pt: 1,
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          display: 'flex', 
          alignItems: 'center', 
          height: '68px',
          bgcolor: '#ffffff',
          borderRadius: 4,
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
          pointerEvents: 'auto',
          px: 1,
          gap: 0.5,
        }}
      >
        {filteredNavItems.map(item => {
          const isActive = displayPath.includes(item.href);
          const navTheme = PAGE_THEMES[item.themeKey];
          const badgeVal = badges[item.href];
          
          return (
            <Button
              key={item.href}
              variant={isActive ? 'contained' : 'text'}
              onClick={() => handleNavClick(item.href)}
              sx={{
                flex: isActive ? 1.5 : 1, // Active item takes more space
                borderRadius: 3, // Match sidebar theming
                textTransform: 'none', 
                fontWeight: isActive ? 800 : 600, 
                minWidth: 0,
                height: '52px',
                bgcolor: isActive ? navTheme.main : 'transparent',
                color: isActive ? navTheme.contrastText : 'rgba(0,0,0,0.5)',
                boxShadow: isActive ? `0 6px 16px -4px ${alpha(navTheme.main || '#000', 0.5)}` : 'none',
                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { 
                  bgcolor: isActive ? navTheme.main : 'rgba(0,0,0,0.04)', 
                }
              }}
            >
              <Badge badgeContent={badgeVal} color="error" sx={{ '& .MuiBadge-badge': { top: 4, right: 4 } }}>
                <Box sx={{ fontSize: isActive ? 24 : 26, '& svg': { fontSize: 'inherit' }, mb: isActive ? 0.3 : 0 }}>
                  {item.icon}
                </Box>
              </Badge>
              {isActive && (
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, lineHeight: 1 }}>
                  {item.label}
                </Typography>
              )}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

export default AppMobileBottomNav;
