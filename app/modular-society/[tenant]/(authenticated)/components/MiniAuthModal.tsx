'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert, Divider, IconButton, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import { auth } from '@/lib/firebase/client';
import { sendSignInLinkToEmail, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AdminPanelSettingsTwoToneIcon from '@mui/icons-material/AdminPanelSettingsTwoTone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface MiniAuthModalProps {
  pathname: string;
}

export default function MiniAuthModal({ pathname }: MiniAuthModalProps) {
  const [email, setEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setStatus('error');
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setStatus('loading');
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      setStatus('success');
    } catch (error: any) {
      console.error('Admin login error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Invalid Admin Credentials.');
    }
  };

  return (
    <Box sx={{ perspective: '1200px', width: '100%', minHeight: { xs: 'auto', md: 480 } }}>
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
      >
        
        {/* FRONT SIDE: USER AUTH (LIQUID GLASS UPGRADE) */}
        <Box sx={{ 
          backfaceVisibility: 'hidden', zIndex: isFlipped ? 0 : 1,
          display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: { xs: 'auto', md: 480 },
          background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          borderRadius: { xs: 4, md: 6 }, overflow: 'hidden',
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1)'
        }}>
          
          {/* LEFT SIDE: IMAGE & VALUE PROP (Hidden on very small screens, sleek banner on mobile) */}
          <Box sx={{ 
            flex: { xs: 'none', md: 1 }, 
            bgcolor: 'rgba(255, 255, 255, 0.4)',
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 3, md: 5 },
            borderRight: { md: '1px solid rgba(0,0,0,0.08)' }
          }}>
            <Box sx={{ 
              width: '100%', 
              height: { sm: 140, md: 220 }, 
              backgroundImage: 'url(/images/society/login-hero.png)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              borderRadius: 3,
              boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
              mb: 4
            }} />
            
            <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.15) 0%, rgba(27, 94, 32, 0.05) 100%)', mb: 2, width: 'fit-content' }}>
               <LockOutlinedIcon sx={{ fontSize: 24, color: '#1b5e20' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0f172a', fontFamily: 'var(--font-dosis)' }}>
              The Society OS
            </Typography>
            <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
              A gated ecosystem for innovators, operators, and investors.
            </Typography>
          </Box>

          {/* RIGHT SIDE: LOGIN FORM */}
          <Box sx={{ 
            flex: 1, 
            p: { xs: 4, md: 5 }, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            position: 'relative'
          }}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: { xs: 'inline-flex', sm: 'none' }, p: 1.2, borderRadius: '50%', background: 'rgba(27, 94, 32, 0.1)', mb: 2 }}>
                 <LockOutlinedIcon sx={{ fontSize: 20, color: '#1b5e20' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontFamily: 'var(--font-dosis)', letterSpacing: '-0.02em', color: '#0f172a' }}>
                Authentication Required
              </Typography>
              <Typography sx={{ color: '#1b5e20', fontWeight: 700, mb: 1, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Destination: {pathname}
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Sign in to access this secured zone.
              </Typography>
            </Box>

            {status === 'success' ? (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Check your email for the magic link!</Alert>
            ) : (
              <form onSubmit={handleEmailSignIn}>
                {status === 'error' && !isFlipped && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMessage}</Alert>}
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
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(10px)',
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                      '&.Mui-focused fieldset': { borderColor: '#1b5e20' },
                    }
                  }}
                />
                <Button
                  fullWidth type="submit" variant="contained" disabled={status === 'loading'}
                  sx={{
                    py: 1.5, fontWeight: 700, fontSize: '0.95rem', mb: 3, borderRadius: 3,
                    textTransform: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                    '&:hover': { background: '#059669', transform: 'translateY(-1px)', boxShadow: '0 12px 28px rgba(16, 185, 129, 0.4)' },
                    transition: 'all 0.2s'
                  }}
                >
                  {status === 'loading' ? 'Sending Magic Link...' : 'Continue with Email'}
                </Button>
              </form>
            )}

            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)', mb: 3 }}>
              <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.4)', px: 1, letterSpacing: '1px', fontWeight: 600 }}>OR</Typography>
            </Divider>

            <Button
              fullWidth variant="outlined" onClick={handleGoogleSignIn} startIcon={<GoogleIcon />}
              sx={{
                py: 1.5, color: '#0f172a', borderColor: 'rgba(0,0,0,0.15)', borderRadius: 3, textTransform: 'none', fontWeight: 700, mb: 3,
                bgcolor: 'rgba(255,255,255,0.7)',
                '&:hover': { borderColor: 'rgba(0,0,0,0.3)', background: 'rgba(255,255,255,1)', transform: 'translateY(-1px)' },
                transition: 'all 0.2s'
              }}
            >
              Continue with Google
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Button 
                onClick={() => {
                  setStatus('idle');
                  setErrorMessage('');
                  setIsFlipped(true);
                }}
                endIcon={<AdminPanelSettingsTwoToneIcon />}
                sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', '&:hover': { color: '#1b5e20' } }}
              >
                For Admins
              </Button>
            </Box>
          </Box>
        </Box>

        {/* BACK SIDE: ADMIN AUTH */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
          zIndex: isFlipped ? 1 : 0,
          background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          borderRadius: { xs: 4, md: 6 }, overflow: 'hidden',
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1)',
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Admin Accent Bar */}
          <Box sx={{ height: '6px', width: '100%', background: 'linear-gradient(90deg, #d97706, #fbbf24)', flexShrink: 0 }} />
          
          <Box sx={{ p: { xs: 4, md: 6 }, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => {
                setStatus('idle');
                setErrorMessage('');
                setIsFlipped(false);
              }}
              sx={{ position: 'absolute', top: 16, left: 16, textTransform: 'none', color: '#64748b', fontWeight: 600 }}
            >
              Back
            </Button>
            
            <Box sx={{ textAlign: 'center', mb: 5, mt: 2 }}>
              <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', background: 'rgba(217, 119, 6, 0.1)', mb: 2 }}>
                 <AdminPanelSettingsTwoToneIcon sx={{ fontSize: 32, color: '#d97706' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "var(--font-playfair)", color: "#0f172a" }} gutterBottom>
                Admin Portal
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                Authorized personnel only.
              </Typography>
            </Box>

            {status === 'error' && isFlipped && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMessage}</Alert>
            )}

            <form onSubmit={handleAdminSignIn} style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
              <TextField
                fullWidth variant="outlined" placeholder="Admin Email" type="email"
                value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                sx={{ 
                  mb: 3, 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3, bgcolor: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused fieldset': { borderColor: '#d97706' }
                  } 
                }}
              />
              <TextField
                fullWidth variant="outlined" placeholder="Password" type={showPassword ? 'text' : 'password'}
                value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                sx={{ 
                  mb: 4, 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3, bgcolor: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused fieldset': { borderColor: '#d97706' }
                  } 
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <Button
                fullWidth type="submit" variant="contained" disabled={status === 'loading'}
                sx={{
                  py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 3, textTransform: 'none',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff',
                  boxShadow: '0 8px 24px rgba(217, 119, 6, 0.4)',
                  '&:hover': { background: '#b45309', transform: 'translateY(-1px)', boxShadow: '0 12px 28px rgba(217, 119, 6, 0.5)' },
                  transition: 'all 0.2s'
                }}
              >
                {status === 'loading' ? 'Authenticating...' : 'Secure Login'}
              </Button>
            </form>
          </Box>
        </Box>

      </motion.div>
    </Box>
  );
}
