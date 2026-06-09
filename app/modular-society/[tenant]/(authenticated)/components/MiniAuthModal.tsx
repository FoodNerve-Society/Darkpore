'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert, Divider } from '@mui/material';
import { auth } from '@/lib/firebase/client';
import { sendSignInLinkToEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface MiniAuthModalProps {
  pathname: string;
}

export default function MiniAuthModal({ pathname }: MiniAuthModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      let callbackUrl = `${window.location.origin}/finishSignUp?returnUrl=${encodeURIComponent(pathname)}`;
      const actionCodeSettings = { url: callbackUrl, handleCodeInApp: true };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setStatus('success');
    } catch (error: any) {
      console.error('Error:', error);
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Global listener will automatically close the modal when user is detected
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row' }, minHeight: 450, overflow: 'hidden' }}>
      
      {/* LEFT SIDE: IMAGE & VALUE PROP */}
      <Box sx={{ 
        flex: 1, 
        bgcolor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 3, md: 5 },
        borderRight: { md: '1px solid rgba(0,0,0,0.05)' }
      }}>
        <Box sx={{ 
          width: '100%', 
          height: 220, 
          backgroundImage: 'url(/images/society/login-hero.png)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          borderRadius: 4,
          boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
          mb: 4
        }} />
        
        <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.1) 0%, rgba(27, 94, 32, 0.05) 100%)', mb: 2, width: 'fit-content' }}>
           <LockOutlinedIcon sx={{ fontSize: 28, color: '#1b5e20' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0f172a', fontFamily: 'var(--font-dosis)' }}>
          The Society OS
        </Typography>
        <Typography sx={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
          A gated ecosystem for innovators, operators, and investors to trade, meet, and secure funding globally.
        </Typography>
      </Box>

      {/* RIGHT SIDE: LOGIN FORM */}
      <Box sx={{ 
        flex: 1, 
        p: { xs: 3, md: 5 }, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
      }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontFamily: 'var(--font-dosis)', letterSpacing: '-0.02em', color: '#0f172a' }}>
            Authentication Required
          </Typography>
          <Typography sx={{ color: '#1b5e20', fontWeight: 700, mb: 1, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Destination: {pathname}
          </Typography>
          <Typography sx={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Sign in to access this secured zone.
          </Typography>
        </Box>

        {status === 'success' ? (
          <Alert severity="success" sx={{ mb: 3 }}>Check your email for the magic link!</Alert>
        ) : (
          <form onSubmit={handleEmailSignIn}>
            {status === 'error' && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.02)',
                  '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#1b5e20' },
                }
              }}
            />
            <Button
              fullWidth type="submit" variant="contained" disabled={status === 'loading'}
              sx={{
                py: 1.5, fontWeight: 700, fontSize: '1rem', mb: 3, borderRadius: 2,
                textTransform: 'none', background: '#10b981', color: 'white',
                boxShadow: `0 8px 24px rgba(16, 185, 129, 0.25)`,
                '&:hover': { background: '#059669' }
              }}
            >
              {status === 'loading' ? 'Sending Magic Link...' : 'Continue with Email'}
            </Button>
          </form>
        )}

        <Divider sx={{ borderColor: 'rgba(0,0,0,0.1)', mb: 3 }}>
          <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', px: 1, letterSpacing: '1px' }}>OR</Typography>
        </Divider>

        <Button
          fullWidth variant="outlined" onClick={handleGoogleSignIn} startIcon={<GoogleIcon />}
          sx={{
            py: 1.5, color: '#000', borderColor: 'rgba(0,0,0,0.15)', borderRadius: 2, textTransform: 'none', fontWeight: 700,
            '&:hover': { borderColor: 'rgba(0,0,0,0.4)', background: 'rgba(0,0,0,0.02)' },
          }}
        >
          Continue with Google
        </Button>
      </Box>

    </Box>
  );
}
