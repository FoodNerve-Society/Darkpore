// @ts-nocheck
"use client";

import React, { useEffect, useState, FC, ReactNode, useRef } from 'react';
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
import { WikiOverlayProvider } from '@/context/WikiOverlayContext';
import { CalendarOverlayProvider } from '@/context/CalendarOverlayContext';

const AuthenticatedLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, loading, needsOnboarding, isUpdatesOpen, setUpdatesOpen } = useSociety();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const tenant = (params?.tenant as string) || 'society';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [showUnauthModal, setShowUnauthModal] = useState(false);
  const phantomRedirectRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  // --- THE DEFINITIVE, RACE-CONDITION-FREE GATEKEEPER ---
  useEffect(() => {
    // State A: Still waiting for Firebase to confirm auth state. Do nothing yet.
    if (loading) {
      return;
    }

    // State B: Auth is confirmed, and there is NO user.
    if (!user) {
      const timer = setTimeout(() => {
        setShowUnauthModal(true);
      }, 500); 
      return () => clearTimeout(timer);
    }

    // From this point on, we know `user` exists.
    setShowUnauthModal(false);

    // State D (The Race Condition): The user is confirmed, but their DB profile is still loading.
    if (!profile) {
      return;
    }

    // --- PHANTOM LANDING FOR UPDATES ---
    const normalizedPath = pathname.replace(/\/$/, '');
    if (normalizedPath === '/updates' && !needsOnboarding) {
      let targetTab = profile.lastActiveTab || profile.landingPage || 'trade';
      if (targetTab === 'updates' || targetTab === '/updates') {
        targetTab = profile.landingPage && profile.landingPage !== 'updates' ? profile.landingPage : 'trade';
      }
      if (targetTab.startsWith('/')) {
        targetTab = targetTab.substring(1);
      }
      
      phantomRedirectRef.current = true;
      
      setTimeout(() => {
        router.replace(`/${targetTab}`);
      }, 10);
      
      return;
    }

    const isBaseAuthPath = pathname === '/dashboard'; 
    if (isBaseAuthPath) {
      const targetTab = profile.lastActiveTab || 'trade';
      router.replace(`/${targetTab}`);
      return;
    }

  }, [loading, user, profile, pathname, router]);

  // --- HANDLE PHANTOM REDIRECT COMPLETION & AUTO-CLOSE ---
  useEffect(() => {
    const normalizedPath = pathname.replace(/\/$/, '');
    const prevNormalized = prevPathnameRef.current.replace(/\/$/, '');
    
    if (normalizedPath !== prevNormalized) {
      if (normalizedPath !== '/updates') {
        if (phantomRedirectRef.current) {
          phantomRedirectRef.current = false;
          setUpdatesOpen(true);
        } else if (isUpdatesOpen) {
          setUpdatesOpen(false);
        }
      }
    }
    
    prevPathnameRef.current = pathname;
  }, [pathname, isUpdatesOpen, setUpdatesOpen]);

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
  const handleSignOut = async () => {
    if (process.env.NODE_ENV === 'development') {
        router.push('/join');
        return;
    }
    await signOut(auth);
    router.push('/join');
  };

  if (loading || (user && !profile)) {
    return <LivelyLoadingScreen />;
  }

  const activeTheme = getActiveTheme(pathname);

  return (
    <WikiOverlayProvider>
      <CalendarOverlayProvider>
      <Box sx={{ display: 'flex', height: '100dvh', flexDirection: isMobile ? 'column' : 'row', position: 'relative', bgcolor: '#f8fafc', overflow: 'hidden' }}>

        {/* --- DYNAMIC BACKGROUND LAYER --- */}
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
      
      {/* Desktop Updates Panel */}
      {!isMobile && (
        <Box
          component={motion.div}
          animate={isUpdatesOpen ? { x: 60, scale: 1, opacity: 1 } : { x: 20, scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          sx={{
            position: 'absolute',
            top: 0, 
            left: 280, 
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: activeTheme.main, boxShadow: `0 0 12px ${activeTheme.main}` }} />
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Updates</Typography>
            </Box>
            <IconButton onClick={() => setUpdatesOpen(false)} sx={{ bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}>
              <LockOutlinedIcon sx={{ fontSize: 18 }} /> 
            </IconButton>
          </Box>
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            pb: 10,
            px: 1, // Add slight horizontal padding for shadow clipping
            mx: -1, // Offset the padding
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none' 
          }}>
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
          marginRight: 360,
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
          minHeight: 0,
          display: 'flex', 
          flexDirection: 'column', 
          position: 'relative', 
          zIndex: 10,
          overflowY: 'visible', 
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
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            pb: 0, 
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
            {pathname.replace(/\/$/, '') === '/updates' ? (
              <LivelyLoadingScreen />
            ) : (
              children
            )}
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
              p: 0, 
              overflow: 'visible',
              bgcolor: 'transparent',
              boxShadow: 'none',
              maxWidth: 850,
              width: '100%',
              m: { xs: 2, md: 4 }
            }
          },
          backdrop: {
            sx: {
              backdropFilter: 'blur(30px)',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
            }
          }
        }}
      >
        <MiniAuthModal pathname={pathname} />
      </Dialog>
      {isMobile && !pathname.includes('/profile') && (
        <AppMobileBottomNav
          profile={profile}
          onSignOut={handleSignOut}
          tenant={tenant}
        />
      )}
      </Box>
      </CalendarOverlayProvider>
    </WikiOverlayProvider>
  );
};

export default AuthenticatedLayout;
