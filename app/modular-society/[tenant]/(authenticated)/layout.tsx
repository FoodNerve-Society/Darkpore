// @ts-nocheck
"use client";

import React, { useEffect, useState, FC, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSociety } from '@/context/SocietyContext';
import LivelyLoadingScreen from '@/components/LivelyLoadingScreen';
import { Box, useMediaQuery, useTheme, Dialog, DialogContent, Typography, Button, IconButton, Badge } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useParams } from 'next/navigation';

import AppDesktopSidebar from './components/navigation/AppDesktopSidebar';
import AppMobileBottomNav from './components/navigation/AppMobileBottomNav';
import { getActiveTheme } from './components/navigation/NavThemes';
import AdminOnboardingModal from './components/AdminOnboardingModal';
import OnboardingWizard from '@/components/OnboardingWizard';
import MiniAuthModal from './components/MiniAuthModal';

const AuthenticatedLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, loading, needsOnboarding } = useSociety();
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
    const isBaseAuthPath = pathname === '/dashboard'; // We deleted this, but just in case they have a bookmark
    
    if (isBaseAuthPath) {
      const targetTab = profile.lastActiveTab || 'trade';
      router.replace(`/${targetTab}`);
      return;
    }

  }, [loading, user, profile, pathname, router]);

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
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: isMobile ? 'column' : 'row', position: 'relative', bgcolor: '#f8fafc' }}>

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
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            p: { xs: 0, sm: 2, md: 3 }, 
            pb: { xs: 12, md: 3 },
            position: 'relative', 
            zIndex: 10,
            overflowY: 'auto'
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
                open={!!(profile && needsOnboarding)} 
                onComplete={() => window.location.reload()} 
              />
              {children}
              <AdminOnboardingModal />
            </>
          )}
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
