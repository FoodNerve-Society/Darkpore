'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { auth } from '@/lib/firebase/client';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function FinishSignUpPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Confirm the link is a sign-in with email link.
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again.
        email = window.prompt('Please provide your email for confirmation');
      }

      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            // Clear email from storage.
            window.localStorage.removeItem('emailForSignIn');
            setStatus('success');
            
            // Redirect after a short delay so they can see the success message
            setTimeout(() => {
              router.push('/society'); // Route them to the premium Society OS
            }, 2000);
          })
          .catch((error) => {
            console.error('Error signing in with email link', error);
            setStatus('error');
            setErrorMessage(error.message);
          });
      } else {
        setStatus('error');
        setErrorMessage('Email confirmation required.');
      }
    } else {
      setStatus('error');
      setErrorMessage('Invalid or expired sign-in link.');
    }
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
        p: 2,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            maxWidth: 500,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 4,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <CardContent sx={{ p: 6 }}>
            {status === 'verifying' && (
              <>
                <CircularProgress sx={{ color: '#00C853', mb: 3 }} size={60} />
                <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
                  Verifying your magic link...
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7 }}>
                  Please wait while we securely log you in.
                </Typography>
              </>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Typography variant="h3" sx={{ mb: 2 }}>🎉</Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
                  Welcome to Society OS
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7 }}>
                  Authentication successful! Redirecting you to the premium hub...
                </Typography>
              </motion.div>
            )}

            {status === 'error' && (
              <>
                <Typography variant="h3" sx={{ mb: 2 }}>⚠️</Typography>
                <Typography variant="h5" color="error" sx={{ fontWeight: 'bold' }} gutterBottom>
                  Authentication Failed
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7 }}>
                  {errorMessage}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
