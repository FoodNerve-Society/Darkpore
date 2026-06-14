// @ts-nocheck
'use client';

import React, { FC, useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, IconButton, Avatar, Typography, Badge, Popover, MenuItem, ListItemIcon, Divider, alpha, Button } from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { usePathname, useRouter } from 'next/navigation';
import { SocietyProfile, useSociety } from '@/context/SocietyContext';
import SocietyLogo from '../../../(public)/components/SocietyLogo';
import { getActiveTheme } from './NavThemes';
import UpdatesFeed from '../UpdatesFeed';
import { motion, AnimatePresence } from 'framer-motion';

interface AppMobileTopHeaderProps {
  profile: SocietyProfile | null;
  onSignOut: () => void;
  tenant?: string;
  user?: any;
}

const AppMobileTopHeader: FC<AppMobileTopHeaderProps> = ({ profile, onSignOut, tenant, user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeOrg, isUpdatesOpen, setUpdatesOpen } = useSociety();
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);

  const activeTheme = getActiveTheme(pathname);
  
  const displayRole = activeOrg?.role || (profile?.roles?.[0] ? profile.roles[0].charAt(0).toUpperCase() + profile.roles[0].slice(1) : 'Member');
  const displayName = profile?.displayName || user?.displayName || 'Partner';

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Backdrop overlay for dismissing when open */}
      <AnimatePresence>
        {isUpdatesOpen && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUpdatesOpen(false)}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.3)',
              zIndex: 1090, // Just below AppBar
              backdropFilter: 'blur(2px)'
            }}
          />
        )}
      </AnimatePresence>

      <AppBar 
        component={motion.div}
        onClick={() => {
          if (!isUpdatesOpen) setUpdatesOpen(true);
        }}
        position="sticky" 
        elevation={0}
        sx={{
          bgcolor: alpha(activeTheme.main, 0.12),
          backdropFilter: 'blur(24px)',
          borderBottom: isUpdatesOpen ? 'none' : `1px solid ${alpha(activeTheme.main, 0.15)}`,
          border: scrolled && !isUpdatesOpen ? `1px solid ${alpha(activeTheme.main, 0.15)}` : 'none',
          color: 'text.primary',
          zIndex: 1100,
          transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
          top: scrolled && !isUpdatesOpen ? 12 : 0,
          width: scrolled && !isUpdatesOpen ? '94%' : '100%',
          mx: 'auto',
          borderRadius: isUpdatesOpen ? '0 0 32px 32px' : (scrolled ? '24px' : 0),
          boxShadow: isUpdatesOpen ? '0 20px 40px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.06)',
          height: isUpdatesOpen ? '85vh' : '64px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible', // Prevent logo clipping, allow hanging logo
          cursor: isUpdatesOpen ? 'default' : 'pointer',
        }}
      >
        <AnimatePresence>
          {isUpdatesOpen && (
            <Box 
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 2, pb: 2, pt: 6, overflow: 'hidden', cursor: 'default' }}
              onClick={(e) => e.stopPropagation()} // Prevent clicking within open content from triggers
            >
              <Typography variant="h5" fontWeight={800} mb={2} sx={{ textAlign: 'center' }}>Updates & Alerts</Typography>
              <Box 
                sx={{ flex: 1, overflowY: 'auto', cursor: 'default' }}
                onPointerDown={(e) => e.stopPropagation()} // Let scroll events go to updates feed rather than drag container
              >
                <UpdatesFeed />
              </Box>
            </Box>
          )}
        </AnimatePresence>

        <Toolbar 
          sx={{ 
            justifyContent: 'space-between', 
            minHeight: '64px !important', 
            px: 2, 
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Logo (Left, Hanging Down) */}
          <Box sx={{ 
            position: 'absolute', 
            left: 16, 
            top: 12, 
            zIndex: 1200,
            transform: 'scale(0.9)', 
            transformOrigin: 'top left',
            transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
          }}>
             <SocietyLogo variant="dark" />
          </Box>

          {/* Spacer to push right content */}
          <Box sx={{ flex: 1 }} />

          {/* Updates Toggle Button (Right) */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setUpdatesOpen(!isUpdatesOpen);
            }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: isUpdatesOpen ? 'rgba(0,0,0,0.08)' : alpha('#10b981', 0.15),
              borderRadius: 10,
              px: 1.5, py: 0.8,
              textTransform: 'none',
              color: isUpdatesOpen ? 'text.primary' : '#0f2414',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isUpdatesOpen ? 'rgba(0,0,0,0.15)' : alpha('#10b981', 0.25),
              }
            }}
          >
            {isUpdatesOpen ? (
              <>
                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
                  Close
                </Typography>
              </>
            ) : (
              <>
                <Badge color="error" variant="dot" sx={{ '& .MuiBadge-badge': { right: 2, top: 2 } }}>
                  <NotificationsIcon sx={{ color: '#10b981', fontSize: 20 }} />
                </Badge>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
                  Updates
                </Typography>
              </>
            )}
          </Button>
        </Toolbar>
      </AppBar>

      <Popover
        open={Boolean(profileAnchorEl)}
        anchorEl={profileAnchorEl}
        onClose={handleProfileClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { mt: 1, minWidth: 200, borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap fontWeight="bold" color="text.primary">
            {displayName}
          </Typography>
          <Typography noWrap variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {displayRole}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column' }}>
          <MenuItem 
            onClick={() => { setProfileAnchorEl(null); router.push('/updates'); }}
            sx={{ borderRadius: 1.5, py: 1.5, fontWeight: 600, mb: 0.5 }}
          >
            <ListItemIcon>
              <Badge color="error" variant="dot">
                <NotificationsIcon fontSize="small" sx={{ color: '#10b981' }} />
              </Badge>
            </ListItemIcon>
            <Typography sx={{ color: '#10b981', fontWeight: 600 }}>Notifications & Updates</Typography>
          </MenuItem>

          <MenuItem 
            onClick={() => { setProfileAnchorEl(null); router.push('/profile'); }}
            sx={{ borderRadius: 1.5, py: 1.5, fontWeight: 600 }}
          >
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            Profile & Settings
          </MenuItem>
          <MenuItem 
            onClick={() => { setProfileAnchorEl(null); onSignOut(); }}
            sx={{ borderRadius: 1.5, py: 1.5, fontWeight: 600, color: 'error.main' }}
          >
            <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
            Sign Out
          </MenuItem>
        </Box>
      </Popover>
    </>
  );
};

export default AppMobileTopHeader;
