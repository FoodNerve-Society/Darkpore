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

  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [displayPath]);

  return (
    <Box
      sx={{
        width: '100%',
        zIndex: 1200,
        pointerEvents: 'none',
        flexShrink: 0,
        pb: { xs: 1.5, sm: 2.5 },
        pt: 0.5,
      }}
    >
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollSnapType: 'x mandatory',
          pointerEvents: 'auto',
          px: 2,
          gap: 1,
          pb: 0.5,
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {filteredNavItems.map(item => {
          const isActive = displayPath.includes(item.href);
          const navTheme = PAGE_THEMES[item.themeKey];
          const badgeVal = badges[item.href];
          
          return (
            <Button
              key={item.href}
              data-active={isActive}
              variant={isActive ? 'contained' : 'text'}
              onClick={() => handleNavClick(item.href)}
              sx={{
                flexShrink: 0,
                minWidth: isActive ? '38vw' : 'auto',
                scrollSnapAlign: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                textTransform: 'none', 
                bgcolor: isActive ? navTheme.main : alpha(navTheme.main || '#000', 0.03),
                color: isActive ? '#ffffff' : '#0f2414',
                backdropFilter: isActive ? 'none' : 'blur(4px)',
                WebkitBackdropFilter: isActive ? 'none' : 'blur(4px)',
                border: 'none',
                boxShadow: isActive 
                  ? `0 4px 14px -2px ${alpha(navTheme.main || '#000', 0.4)}` 
                  : 'none',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                p: isActive ? '10px 20px' : '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transform: 'scale(1)',
                opacity: 1,
                '&:hover': { 
                  bgcolor: isActive ? navTheme.main : alpha(navTheme.main || '#000', 0.08),
                  color: isActive ? '#ffffff' : 'rgba(15, 36, 20, 0.85)',
                  boxShadow: isActive 
                    ? `0 6px 20px -2px ${alpha(navTheme.main || '#000', 0.5)}`
                    : 'none',
                  transform: isActive ? 'scale(1)' : 'translateY(-1px)',
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: isActive ? 22 : 20, 
                '& svg': { fontSize: 'inherit' },
                color: isActive ? '#ffffff' : '#0f2414',
                transition: 'all 0.3s ease',
              }}>
                {item.icon}
              </Box>
              
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ 
                  fontSize: isActive ? '0.9rem' : '0.85rem', 
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: isActive ? '-0.01em' : 0,
                }}>
                  {item.label}
                </Typography>
                
                {badgeVal ? (
                  <Box component="span" sx={{
                    bgcolor: isActive ? '#ffffff' : navTheme.main, 
                    color: isActive ? navTheme.main : '#ffffff', 
                    fontSize: '0.65rem', fontWeight: 'bold',
                    px: 0.8, py: 0.1, borderRadius: 10, minWidth: 20, textAlign: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  }}>
                    {badgeVal}
                  </Box>
                ) : null}
              </Box>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

export default AppMobileBottomNav;
