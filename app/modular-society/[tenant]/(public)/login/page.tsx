"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, TextField, Divider } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, rtdb } from '@/lib/firebase';
import { 
  GoogleAuthProvider, signInWithPopup, 
  signInWithEmailAndPassword, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink 
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import Link from 'next/link';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';

function LoginEngine() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const redirectUrl = searchParams.get('redirect') || '/trade';

  // DEV BYPASS CHECK
  const isDevBypass = process.env.NODE_ENV === 'development';

  // Resolve Magic Link if the user clicked the link in their email
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setLoading(true);
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        // User opened the link on a different device. Prompt for email.
        storedEmail = window.prompt('Please provide your email for confirmation');
      }
      
      if (storedEmail) {
        signInWithEmailLink(auth, storedEmail, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn');
            await handleProfileSeed(result.user);
          })
          .catch((err) => {
            setError('Error signing in with magic link: ' + err.message);
            setLoading(false);
          });
      } else {
        setError('Email confirmation required to sign in with this link.');
        setLoading(false);
      }
    }
  }, []);

  const handleProfileSeed = async (user: any) => {
    if (isDevBypass) {
      router.push(redirectUrl);
      return;
    }
    try {
      const profileRef = ref(rtdb, `users/${user.uid}`);
      const snapshot = await get(profileRef);
      if (!snapshot.exists()) {
        await set(profileRef, {
          uid: user.uid,
          email: user.email,
          onboardingComplete: false,
          nervePoints: 0,
        });
      }
      router.push(redirectUrl);
    } catch (err: any) {
      console.error("Profile seed error:", err);
      router.push(redirectUrl); // Still push if RTDB fails (they are auth'd)
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setError(''); setSuccessMsg('');
    if (isDevBypass) { setTimeout(() => router.push(redirectUrl), 1000); return; }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleProfileSeed(result.user);
    } catch (err: any) {
      setError(err.message || 'Google Authentication failed.');
      setLoading(false);
    }
  };

  const handleEmailPasswordLogin = async () => {
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true); setError(''); setSuccessMsg('');
    if (isDevBypass) { setTimeout(() => router.push(redirectUrl), 1000); return; }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleProfileSeed(result.user);
    } catch (err: any) {
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    if (!email) { setError('Please enter your email to receive a magic link.'); return; }
    setLoading(true); setError(''); setSuccessMsg('');
    if (isDevBypass) {
      setSuccessMsg('DEV MODE: Magic link "sent" to ' + email + '. Check console.');
      console.log('Mock magic link sent to:', email);
      setLoading(false);
      return;
    }
    
    const actionCodeSettings = {
      url: window.location.origin + '/society/login?redirect=' + encodeURIComponent(redirectUrl),
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setSuccessMsg('Magic link sent! Check your email inbox to log in instantly.');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 4, md: 5 },
        borderRadius: '32px',
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 24px 60px rgba(15, 36, 20, 0.08), 0 0 0 1px rgba(255,255,255,0.5) inset',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        color: '#0f2414',
        maxWidth: '480px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '3px', color: '#1b5e20', mb: 1, display: 'block' }}>
          AUTHENTICATION
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1.5px', color: '#0f2414' }}>
          Society OS
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(15, 36, 20, 0.6)', lineHeight: 1.6 }}>
          Sign in to access the Trade Floor and connect with pioneers.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{successMsg}</Alert>}

      {/* Stacked Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {/* Google Login */}
        <Button
          variant="contained" size="large" fullWidth onClick={handleGoogleLogin} disabled={loading}
          startIcon={<GoogleIcon />}
          sx={{
            py: 1.8, fontSize: '1.05rem', fontWeight: 800, borderRadius: '16px',
            bgcolor: 'white', color: '#0f2414', border: '1px solid rgba(15,36,20,0.1)',
            boxShadow: '0 4px 15px rgba(15, 36, 20, 0.05)', textTransform: 'none',
            '&:hover': { bgcolor: '#f2f7f1', transform: 'translateY(-2px)' }
          }}
        >
          Continue with Google
        </Button>

        <Divider sx={{ my: 1, color: 'rgba(15, 36, 20, 0.4)', fontSize: '0.8rem', fontWeight: 700 }}>OR</Divider>

        {/* Email Inputs */}
        <TextField
          fullWidth placeholder="office@domain.com" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.5)' } 
          }}
        />
        <TextField
          fullWidth placeholder="Password (for Admin)" type="password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.5)' } 
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            variant="contained" fullWidth onClick={handleEmailPasswordLogin} disabled={loading}
            sx={{
              py: 1.5, fontWeight: 800, borderRadius: '14px', bgcolor: '#0f2414', color: 'white',
              textTransform: 'none', '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
          </Button>
          
          <Button
            variant="outlined" fullWidth onClick={handleSendMagicLink} disabled={loading}
            startIcon={<EmailIcon />}
            sx={{
              py: 1.5, fontWeight: 800, borderRadius: '14px', borderColor: '#1b5e20', color: '#1b5e20',
              textTransform: 'none', '&:hover': { bgcolor: 'rgba(27, 94, 32, 0.05)', borderColor: '#1b5e20' },
              fontSize: '0.85rem'
            }}
          >
            Magic Link
          </Button>
        </Box>

      </Box>

      {isDevBypass && (
        <Typography variant="caption" sx={{ color: '#d97706', display: 'block', mt: 3, fontWeight: 700, textAlign: 'center' }}>
          DEV MODE: Bypassing real Firebase auth.
        </Typography>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Button
            variant="text"
            sx={{
              color: 'rgba(15, 36, 20, 0.5)', textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
              '&:hover': { color: '#1b5e20', bgcolor: 'rgba(27, 94, 32, 0.05)' },
            }}
          >
            ← Return to Ecosystem
          </Button>
        </Link>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#f2f7f1',
      }}
    >
      {/* Left Split: Premium Imagery */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1.2,
          position: 'relative',
          bgcolor: '#0f2414',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 8,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1600&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.6,
          }}
        />
        {/* Gradient overlay to make text readable */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 36, 20, 0.9) 0%, rgba(15, 36, 20, 0.2) 50%, transparent 100%)',
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 900,
              letterSpacing: '-1px',
              mb: 3,
              lineHeight: 1.1,
            }}
          >
            Empowering the agrarian renaissance.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Join thousands of operators, founders, and innovators building the future of sustainable food supply chains.
          </Typography>
        </Box>
      </Box>

      {/* Right Split: Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          p: 3,
        }}
      >
        {/* Subtle mesh glow on the right side */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(27, 94, 32, 0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <Suspense fallback={<Box sx={{ textAlign: 'center', color: '#1b5e20' }}><CircularProgress color="inherit" /></Box>}>
          <LoginEngine />
        </Suspense>
      </Box>
    </Box>
  );
}
