'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, rtdb } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { Box, Typography } from '@mui/material';

export default function ClientOneTapAuth() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // Do not initialize if client ID is placeholder, empty, or missing
    if (!client_id || client_id === 'placeholder_google_client_id') {
      console.warn('Google One Tap Client ID is missing or placeholder. Skipping initialization.');
      return;
    }

    // Callback when user signs in via Google One Tap
    const handleCredentialResponse = async (response: any) => {
      try {
        const idToken = response.credential;
        const credential = GoogleAuthProvider.credential(idToken);
        
        // Sign in to Firebase Auth using Google credential
        const result = await signInWithCredential(auth, credential);
        
        // Seed user profile if new
        const profileRef = ref(rtdb, `users/${result.user.uid}`);
        const snapshot = await get(profileRef);
        
        if (!snapshot.exists()) {
          await set(profileRef, {
            uid: result.user.uid,
            email: result.user.email,
            onboardingComplete: false,
            nervePoints: 0,
            wahaalas: ['infrastructure'], // Seed fallback
          });
        }
        
        // Navigate to dashboard
        router.push('/dashboard');
      } catch (err: any) {
        console.error('Google One Tap Sign-In Error:', err);
        setError(err.message || 'One Tap Authentication failed.');
      }
    };

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        // @ts-ignore
        google.accounts.id.initialize({
          client_id: client_id,
          callback: handleCredentialResponse,
          auto_select: false, // Don't auto-sign them in without permission
        });
        
        // @ts-ignore
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap prompt was not displayed:', notification.getNotDisplayedReason());
          }
        });
      } catch (err) {
        console.error('Failed to initialize Google One Tap:', err);
      }
    };

    document.body.appendChild(script);

    return () => {
      // Clean up script if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [router]);

  if (error) {
    return (
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, bgcolor: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', p: 2, borderRadius: 2, zIndex: 1000 }}>
        <Typography color="error" variant="caption">{error}</Typography>
      </Box>
    );
  }

  return null;
}
