// @ts-nocheck
'use client';

import React, { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Button, Typography, Avatar, Paper, alpha, Badge, IconButton } from '@mui/material';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BoltIcon from '@mui/icons-material/Bolt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { SocietyProfile, useSociety, RANK_NAMES, RANK_COLORS } from '@/context/SocietyContext';
import { useRouter, usePathname } from 'next/navigation';
import { getActiveTheme, PAGE_THEMES } from './NavThemes';
import SocietyLogo from '../../../(public)/components/SocietyLogo';

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
  
  if (profile?.tabOrder && profile.tabOrder.length === 4) {
    items.sort((a, b) => {
      const indexA = profile.tabOrder.indexOf(a.href.replace('/', ''));
      const indexB = profile.tabOrder.indexOf(b.href.replace('/', ''));
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return items;
  }

  if (!profile || !profile.roles || profile.roles.length === 0) return items;

  const primaryRole = profile.roles[0];
  if (primaryRole === 'investor' || primaryRole === 'logistics') {
    items.sort((a, b) => {
      if (a.href === '/support') return -1; if (b.href === '/support') return 1;
      if (a.href === '/meet') return -1; if (b.href === '/meet') return 1;
      return 0;
    });
  } else if (primaryRole === 'researcher' || primaryRole === 'student') {
    items.sort((a, b) => {
      if (a.href === '/learn') return -1; if (b.href === '/learn') return 1;
      if (a.href === '/meet') return -1; if (b.href === '/meet') return 1;
      return 0;
    });
  } else {
    items.sort((a, b) => {
      if (a.href === '/trade') return -1; if (b.href === '/trade') return 1;
      if (a.href === '/learn') return -1; if (b.href === '/learn') return 1;
      return 0;
    });
  }
  
  return items;
};

const AppDesktopSidebar: FC<AppDesktopSidebarProps> = ({ profile, onSignOut, tenant = 'society' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isUpdatesOpen, setUpdatesOpen } = useSociety();
  
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

  const displayName = profile?.displayName || user?.displayName || 'Anonymous Partner';
  const displayRole = profile?.roles?.[0] || 'Member';
  const rankLevel = profile?.currentRank || 1;
  const rankName = RANK_NAMES[rankLevel as keyof typeof RANK_NAMES] || 'Initiate';
  const rankColor = RANK_COLORS[rankLevel as keyof typeof RANK_COLORS] || '#9e9e9e';

  return (
    <Box 
      component="aside" 
      sx={{ 
        p: 2, 
        height: '100vh', 
        boxSizing: 'border-box',
        width: '280px',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <Box
        sx={{
          display: 'flex', flexDirection: 'column',
          width: '100%', height: '100%',
        }}
      >
        <Box sx={{ p: 1, pt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
             <SocietyLogo variant="dark" />
          </Box>
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
                    p: '12px 20px', 
                    borderRadius: 3, 
                    textTransform: 'none', 
                    fontWeight: isActive ? 800 : 700, 
                    fontSize: '0.95rem',
                    color: isActive ? '#ffffff' : '#0f2414',
                    bgcolor: isActive ? navTheme.main : alpha(navTheme.main || '#000', 0.03),
                    backdropFilter: isActive ? 'none' : 'blur(4px)',
                    border: 'none',
                    boxShadow: isActive ? `0 6px 16px -4px ${alpha(navTheme.main || '#000', 0.5)}` : 'none',
                    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '& .MuiButton-startIcon': {
                      marginRight: 2,
                      transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      color: isActive ? '#ffffff' : '#0f2414',
                    },
                    '&:hover': { 
                      bgcolor: isActive ? navTheme.main : alpha(navTheme.main || '#000', 0.08), 
                      color: isActive ? '#ffffff' : 'rgba(15, 36, 20, 0.85)',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Box component="span">{item.label}</Box>
                    
                    {/* Conditional Notification Badge */}
                    {['/trade', '/meet'].includes(item.href) && (
                      <Box component="span" sx={{
                        bgcolor: isActive ? '#ffffff' : '#ef4444', 
                        color: isActive ? navTheme.main : 'white', 
                        fontSize: '0.65rem', fontWeight: 'bold',
                        px: 0.8, py: 0.2, borderRadius: 10, minWidth: 22, textAlign: 'center',
                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : '0 2px 4px rgba(239,68,68,0.3)',
                      }}>
                        {item.href === '/trade' ? '3' : '1'}
                      </Box>
                    )}
                  </Box>
                </Button>
              </Box>
            );
          })}
        </Box>

        {/* --- Profile Footer --- */}
        <Box sx={{ mt: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Updates Mini Card */}
          <Button
            fullWidth
            onClick={() => setUpdatesOpen(!isUpdatesOpen)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              p: 1, py: 0.8, borderRadius: 3,
              bgcolor: isUpdatesOpen ? alpha('#10b981', 0.15) : alpha('#10b981', 0.05),
              border: `1px solid ${alpha('#10b981', 0.2)}`,
              textTransform: 'none',
              transition: 'all 0.2s',
              minWidth: 0,
              '&:hover': {
                bgcolor: alpha('#10b981', 0.12),
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha('#10b981', 0.15)}`
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              <Box sx={{ p: 0.5, borderRadius: '50%', bgcolor: alpha('#10b981', 0.15), display: 'flex', mr: 1.5 }}>
                <NotificationsIcon sx={{ color: '#10b981', fontSize: 18 }} />
              </Box>
              <Box sx={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f2414', lineHeight: 1.2 }}>
                  Updates & Alerts
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600, mt: 0.2 }}>
                  Check what's new
                </Typography>
              </Box>
            </Box>

            {/* Notification Count Badge */}
            <Box sx={{
              bgcolor: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 'bold',
              px: 1, py: 0.3, borderRadius: 10, minWidth: 24, textAlign: 'center',
              boxShadow: '0 2px 4px rgba(239,68,68,0.3)',
              ml: 1
            }}>
              {3 > 9 ? '9+' : 3}
            </Box>
          </Button>

          {/* Profile Button */}
          <Button
            fullWidth
            onClick={() => router.push('/profile')}
            sx={{
              display: 'flex', justifyContent: 'flex-start', alignItems: 'center',
              textTransform: 'none', p: 1.5, borderRadius: '16px',
              bgcolor: pathname.includes('/profile') ? alpha('#6366f1', 0.08) : 'rgba(0,0,0,0.02)',
              border: 'none',
              minWidth: 0,
              boxShadow: pathname.includes('/profile') ? `0 0 0 2px ${alpha('#6366f1', 0.25)}` : '0 0 0 1px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
              '&:hover': {
                bgcolor: pathname.includes('/profile') ? alpha('#6366f1', 0.12) : 'rgba(0,0,0,0.06)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Avatar src={profile?.avatarUrl || user?.photoURL || undefined} sx={{ width: 40, height: 40, transition: 'all 0.3s' }} />
            <Box sx={{ ml: 1.5, textAlign: 'left', overflow: 'hidden', flex: 1, whiteSpace: 'nowrap' }}>
              <Typography noWrap sx={{ fontWeight: 'bold' }} color="text.primary">
                {displayName}
              </Typography>
              <Typography noWrap variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {displayRole}
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
      </Box>
    </Box>
  );
};

export default AppDesktopSidebar;
