// @ts-nocheck
'use client';

import React, { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Button, Typography, Avatar, Paper, alpha } from '@mui/material';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BoltIcon from '@mui/icons-material/Bolt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, IconButton } from '@mui/material';
import { SocietyProfile, useSociety } from '@/context/SocietyContext';
import { useRouter, usePathname } from 'next/navigation';
import { getActiveTheme, PAGE_THEMES } from './NavThemes';

interface AppDesktopSidebarProps {
  profile: SocietyProfile | null;
  onSignOut: () => void;
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

const AppDesktopSidebar: FC<AppDesktopSidebarProps> = ({ profile, onSignOut, tenant = 'society' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSociety();
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingPathname, setPendingPathname] = useState<string | null>(null);

  const displayPath = pendingPathname || pathname;
  const activeTheme = getActiveTheme(displayPath);

  useEffect(() => {
    if (pendingPathname && pathname.includes(pendingPathname)) {
      setPendingPathname(null);
      setIsNavigating(false);
    }
  }, [pathname, pendingPathname]);

  const handleNavClick = (href: string) => {
    if (pathname.includes(href)) return;
    setIsNavigating(true);
    setPendingPathname(href);
    setTimeout(() => { router.push(href); }, 300);
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <Box component="aside" sx={{ p: 2, height: '100vh', boxSizing: 'border-box' }}>
      <Paper
        elevation={4}
        sx={{
          display: 'flex', flexDirection: 'column',
          width: '280px', height: '100%', borderRadius: 5,
          boxShadow: '0 10px 35px rgba(0,0,0,0.04)',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, pt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
              <Box sx={{ bgcolor: '#1b5e20', width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Typography sx={{ color: 'white', fontWeight: 900 }}>FN</Typography>
              </Box>
              <Typography sx={{
                ml: 1.5,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: '1.4rem',
                color: 'text.primary',
                letterSpacing: '-1px'
              }}>
                Society OS
              </Typography>
            </Box>
          </Link>

          <Link href="/updates" passHref style={{ textDecoration: 'none' }}>
            <IconButton sx={{ 
              bgcolor: 'rgba(27,94,32,0.08)', color: '#1b5e20', width: 40, height: 40,
              '&:hover': { bgcolor: 'rgba(27,94,32,0.15)', transform: 'scale(1.05)' }, transition: 'all 0.2s ease'
            }}>
              <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { right: 2, top: 2 } }}>
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Link>
        </Box>

        <Box component="nav" sx={{ px: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 4, gap: 1.5 }}>
          {getDynamicNavItems(profile).map((item) => {
            if (tenant === 'innovations' && (item.href === '/trade' || item.href === '/learn')) return null;
            
            const isActive = displayPath.includes(item.href);
            const navTheme = PAGE_THEMES[item.themeKey];
            return (
              <Box key={item.href} sx={{ width: '100%' }}>
                <Button
                  fullWidth
                  onClick={() => handleNavClick(item.href)}
                  startIcon={item.icon}
                  sx={{
                    justifyContent: 'flex-start', 
                    p: '14px 24px', 
                    borderRadius: 100, // M3 fully rounded pill
                    textTransform: 'none', 
                    fontWeight: isActive ? 800 : 600, 
                    fontSize: '1.05rem',
                    color: isActive ? navTheme.main : 'rgba(15, 36, 20, 0.65)',
                    bgcolor: isActive ? alpha(navTheme.main, 0.12) : 'transparent',
                    boxShadow: 'none',
                    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': isActive ? {
                      content: '""', position: 'absolute', left: 0, top: '15%', height: '70%', width: 4, 
                      bgcolor: navTheme.main, borderRadius: '0 4px 4px 0'
                    } : {},
                    '& .MuiButton-startIcon': {
                      marginRight: 2,
                      transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    },
                    '&:hover': { 
                      bgcolor: isActive ? alpha(navTheme.main, 0.18) : alpha(navTheme.main, 0.08), 
                      color: navTheme.main,
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              </Box>
            );
          })}
        </Box>

        {/* --- Profile Footer --- */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button
            fullWidth
            onClick={handleProfileClick}
            sx={{
              display: 'flex', justifyContent: 'flex-start', alignItems: 'center',
              textTransform: 'none', p: 1.5, borderRadius: 100, // M3 fully rounded pill
              bgcolor: pathname.includes('/profile') ? alpha('#6366f1', 0.08) : 'rgba(0,0,0,0.02)',
              border: 'none',
              boxShadow: pathname.includes('/profile') ? `0 0 0 2px ${alpha('#6366f1', 0.25)}` : '0 0 0 1px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
              '&:hover': {
                bgcolor: pathname.includes('/profile') ? alpha('#6366f1', 0.12) : 'rgba(0,0,0,0.06)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Avatar src={user?.photoURL || undefined} sx={{ width: 40, height: 40 }} />
            <Box sx={{ ml: 1.5, textAlign: 'left', overflow: 'hidden', flex: 1 }}>
              <Typography noWrap sx={{ fontWeight: 'bold' }} color="text.primary">
                {user?.displayName || 'Partner'}
              </Typography>
              <Typography noWrap variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {profile?.roles?.[0] ? profile.roles[0].charAt(0).toUpperCase() + profile.roles[0].slice(1) : 'Member'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, ml: 1 }}>
              <BoltIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#d97706' }}>
                {profile?.wallet?.lifetimeNP?.toLocaleString() ?? 0}
              </Typography>
            </Box>
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AppDesktopSidebar;
