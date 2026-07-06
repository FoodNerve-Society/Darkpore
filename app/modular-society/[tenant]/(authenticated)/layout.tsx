// @ts-nocheck
"use client";

import React, { useEffect, useState, FC, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSociety } from '@/context/SocietyContext';
import LivelyLoadingScreen from '@/components/LivelyLoadingScreen';
import { Box, useMediaQuery, useTheme, Dialog, DialogContent, Typography, Button, IconButton, Badge, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useParams } from 'next/navigation';

import AppDesktopSidebar from './components/navigation/AppDesktopSidebar';
import AppMobileBottomNav from './components/navigation/AppMobileBottomNav';
import AppMobileTopHeader from './components/navigation/AppMobileTopHeader';
import { getActiveTheme } from './components/navigation/NavThemes';
import AdminOnboardingModal from './components/AdminOnboardingModal';
import OnboardingWizard from '@/components/OnboardingWizard';
import MiniAuthModal from './components/MiniAuthModal';
import UpdatesFeed from './components/UpdatesFeed';

const AuthenticatedLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, loading, needsOnboarding, isUpdatesOpen, setUpdatesOpen } = useSociety();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const tenant = (params?.tenant as string) || 'society';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [showUnauthModal, setShowUnauthModal] = useState(false);

  // --- THE DEFINITIVE, RACE-CONDITION-FREE GATEKEEPER ---
  useEffect(() => {
    // State A: Still waiting for Firebase to confirm auth state. Do nothing yet.
    if (loading) {
      return;
    }

    // State B: Auth is confirmed, and there is NO user.
    // Instead of instantly showing the modal (which causes flashes during IndexedDB restores),
    // we debounce it slightly.
    if (!user) {
      const timer = setTimeout(() => {
        setShowUnauthModal(true);
      }, 500); // Wait 500ms before declaring them definitely logged out
      return () => clearTimeout(timer);
    }

    // From this point on, we know `user` exists.
    setShowUnauthModal(false);

    // State D (The Race Condition): The user is confirmed, but their DB profile is still loading.
    // We wait patiently for the profile to exist before making any logic decisions.
    if (!profile) {
      return;
    }

    // State C: We have a user AND their profile. Now we can safely run routing logic.
    // If the user navigates directly to a base authenticated route or logs in without a specific destination,
    // we route them to their last active tab, or default to trade.
    // However, since we don't have a specific "root" in authenticated, we handle it if they happen to hit a generic redirect.
    // Actually, if they are exactly on an onboarding path or a path that doesn't exist, we force them to trade.
    // --- PHANTOM LANDING FOR UPDATES ---
    if (pathname === '/updates') {
      const targetTab = profile.lastActiveTab || 'trade';
      setUpdatesOpen(true);
      router.replace(`/${targetTab}`);
      return;
    }

    const isBaseAuthPath = pathname === '/dashboard'; // We deleted this, but just in case they have a bookmark
    
    if (isBaseAuthPath) {
      const targetTab = profile.lastActiveTab || 'trade';
      router.replace(`/${targetTab}`);
      return;
    }

  }, [loading, user, profile, pathname, router, setUpdatesOpen]);

  // --- AUTO-CLOSE UPDATES ON ROUTE CHANGE ---
  useEffect(() => {
    // If the user navigates somewhere else (clicking a link in the updates feed), close the drawer.
    if (pathname !== '/updates' && isUpdatesOpen) {
      setUpdatesOpen(false);
    }
  }, [pathname]);

  // --- SCROLL LOCK FOR MOBILE UPDATES DRAWER ---
  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (isMobile && isUpdatesOpen && scrollContainer) {
      scrollContainer.style.overflow = 'hidden';
    } else if (scrollContainer) {
      scrollContainer.style.overflow = 'visible';
    }
    return () => {
      if (scrollContainer) scrollContainer.style.overflow = 'visible';
    };
  }, [isMobile, isUpdatesOpen]);

  // --- UNAUTHENTICATED LOGIC ---
  // The user must manually click to redirect. No auto-timer.

  const handleSignOut = async () => {
    // If Dev Bypass is active, just route out
    if (process.env.NODE_ENV === 'development') {
        router.push('/join');
        return;
    }
    await signOut(auth);
    router.push('/join');
  };

  // Only show the definitive loading screen if we are actively checking auth or fetching a profile for an existing user.
  if (loading || (user && !profile)) {
    return <LivelyLoadingScreen />;
  }

  // If we reach here, we either have a fully loaded user+profile, OR we have NO user (so showUnauthModal is true)
  const activeTheme = getActiveTheme(pathname);

  return (
    <Box sx={{ display: 'flex', height: '100dvh', flexDirection: isMobile ? 'column' : 'row', position: 'relative', bgcolor: '#f8fafc', overflow: 'hidden' }}>

      {/* --- DYNAMIC BACKGROUND LAYER (Fixed behind everything) --- */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        opacity: 1,
        background: activeTheme.desktopBg,
        zIndex: 0,
        pointerEvents: 'none',
        transition: 'background 0.5s ease'
      }} />

      {!isMobile && (
        <AppDesktopSidebar
          profile={profile}
          onSignOut={handleSignOut}
          tenant={tenant}
        />
      )}
      
      {/* Desktop Updates Panel (Hidden underneath, revealed when main page shifts right) */}
      {!isMobile && (
        <Box
          component={motion.div}
          animate={isUpdatesOpen ? {
            x: 60,
            scale: 1,
            opacity: 1,
          } : {
            x: 20,
            scale: 0.92,
            opacity: 0,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          sx={{
            position: 'absolute',
            top: 0, 
            left: 280, // Positioned right next to the 280px sidebar
            width: 360,
            height: '100vh',
            zIndex: 5,
            p: 3,
            pt: 4,
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: isUpdatesOpen ? 'auto' : 'none'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={800}>Updates</Typography>
            <IconButton onClick={() => setUpdatesOpen(false)}>
              <LockOutlinedIcon sx={{ fontSize: 20 }} /> {/* Temp close icon */}
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>Your activity feed and notifications will appear here.</Typography>
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <UpdatesFeed />
          </Box>
        </Box>
      )}
      
      {/* Scrollable Main Content Area */}
      <Box 
        id="main-scroll-container"
        component={motion.div}
        animate={(!isMobile && isUpdatesOpen) ? {
          scale: 0.95,
          x: 360,
          marginRight: 360, // Shrinks the flex width so x:360 doesn't shove it off screen
          opacity: 0.8,
        } : {
          scale: 1,
          x: 0,
          marginRight: 0,
          opacity: 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          position: 'relative', 
          zIndex: 10,
          // height: '100dvh', removed height constraint to let flex: 1 govern it
          overflowY: 'visible', // Allow page card shadow to bleed out seamlessly
          overflowX: 'visible',
          boxSizing: 'border-box'
        }}
      >
        {isMobile && (
          <AppMobileTopHeader
            profile={profile}
            onSignOut={handleSignOut}
            tenant={tenant}
            user={user}
          />
        )}
        
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            display: 'flex',
            flexDirection: 'column',
            pb: 0, // removed extra padding for bottom nav on mobile, layout is true flex now
          }}
        >
        {showUnauthModal ? (
            <Box sx={{ p: 4, opacity: 0.5 }}>
              <Box sx={{ height: 40, width: '30%', bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2, mb: 4 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 4 }}>
                {[1,2,3].map(i => <Box key={i} sx={{ height: 160, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 4 }} />)}
              </Box>
              <Box sx={{ height: 400, width: '100%', bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 4 }} />
            </Box>
        ) : (
          <>
            <OnboardingWizard 
              open={!!(profile && needsOnboarding && !(profile.isAdmin && profile.currentRank < 5))} 
              onComplete={() => window.location.reload()} 
              profile={profile}
            />
            {children}
            <AdminOnboardingModal />
          </>
        )}
        </Box>
      </Box>

      {/* The Unauthenticated Modal overlays the shell */}
      <Dialog 
        open={showUnauthModal} 
        disableEscapeKeyDown
        slotProps={{
          paper: {
            sx: { 
              borderRadius: 4, 
              p: 0, 
              overflow: 'hidden',
              bgcolor: 'rgba(255,255,255,0.95)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.4)',
              maxWidth: 800,
              width: '100%'
            }
          },
          backdrop: {
            sx: {
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }
          }
        }}
      >
        <MiniAuthModal pathname={pathname} />
      </Dialog>
      {isMobile && (
        <AppMobileBottomNav
          profile={profile}
          onSignOut={handleSignOut}
          tenant={tenant}
        />
      )}
    </Box>
  );
};

export default AuthenticatedLayout;
