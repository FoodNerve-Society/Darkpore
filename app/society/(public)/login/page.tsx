"use client";

import React, { Suspense, useState } from 'react';
import { Box, Button, Typography, Container, Card, CircularProgress, Alert } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, rtdb } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import Link from 'next/link';
import { useSociety } from '@/context/SocietyContext';

function LoginEngine() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // DEV BYPASS CHECK
  const isDevBypass = process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock-key" || 
                      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "placeholder_api_key" || 
                      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    if (isDevBypass) {
      // Mock login for Dev
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in RTDB
      const profileRef = ref(rtdb, `users/${result.user.uid}`);
      const snapshot = await get(profileRef);
      
      if (!snapshot.exists()) {
        // First time login - seed initial minimal profile
        await set(profileRef, {
          uid: result.user.uid,
          email: result.user.email,
          onboardingComplete: false,
          nervePoints: 0,
        });
        router.push(redirectUrl); // They'll hit the dashboard and the onboarding modal will pop up!
      } else {
        router.push(redirectUrl);
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        p: { xs: 4, md: 6 },
        borderRadius: '24px',
        bgcolor: 'rgba(255, 255, 255, 0.75)',
        border: '1px solid rgba(27, 94, 32, 0.08)',
        boxShadow: '0 12px 40px rgba(27, 94, 32, 0.04)',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        color: '#112918',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          mb: 1.5,
          letterSpacing: '-1px',
          background: 'linear-gradient(to right, #2e7d32, #689f38)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Society OS Gateway
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(17,41,24,0.6)', mb: 4, lineHeight: 1.6 }}>
        Authenticate to access the Trade Floor, the Rolodex, and your Personalized Wahaala Feed.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(255,60,60,0.05)', color: '#cc3333', border: '1px solid rgba(255,60,60,0.1)' }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleGoogleLogin}
        disabled={loading}
        sx={{
          py: 1.8,
          fontSize: '1rem',
          fontWeight: 800,
          borderRadius: '12px',
          bgcolor: '#2e7d32',
          color: 'white',
          boxShadow: '0 4px 14px rgba(46, 125, 50, 0.15)',
          textTransform: 'none',
          '&:hover': {
            bgcolor: '#1b5e20',
          },
          '&.Mui-disabled': {
            bgcolor: 'rgba(0,0,0,0.05)',
            color: 'rgba(0,0,0,0.3)',
          },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue with Google'}
      </Button>

      {isDevBypass && (
        <Typography variant="caption" sx={{ color: '#d97706', display: 'block', mt: 3, fontWeight: 700 }}>
          DEV MODE: Clicking continue will bypass real Firebase auth.
        </Typography>
      )}

      <Box mt={4}>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Button
            variant="text"
            sx={{
              color: 'rgba(17,41,24,0.5)',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              '&:hover': { color: '#1b5e20', bgcolor: 'transparent' },
            }}
          >
            ← Return Home
          </Button>
        </Link>
      </Box>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f9f3', // Soft organic cream-green canvas
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46, 125, 50, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<Box sx={{ textAlign: 'center', color: '#2e7d32' }}><CircularProgress color="inherit" /></Box>}>
          <LoginEngine />
        </Suspense>
      </Container>
    </Box>
  );
}
