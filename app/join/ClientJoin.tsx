// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Alert, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { auth } from '@/lib/firebase/client';
import { sendSignInLinkToEmail, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';
import AdminPanelSettingsTwoToneIcon from '@mui/icons-material/AdminPanelSettingsTwoTone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';

interface ClientJoinProps {
  initialTenant: 'society' | 'darkpore' | 'innovations';
}

const Polaroid = ({ src, rotate, left, top, zIndex, caption, stickerText, stickerBg }: any) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left,
        top,
        transform: { xs: `translate(-50%, -50%) rotate(${rotate}deg)`, md: `translate(0, 0) rotate(${rotate}deg)` },
        background: '#ffffff',
        padding: { xs: '8px 8px 32px 8px', md: '16px 16px 64px 16px' },
        borderRadius: '0px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), 0 10px 15px -3px rgba(0,0,0,0.2)',
        zIndex,
        transition: 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      {/* Premium Tape Effect */}
      <Box sx={{
        position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)',
        width: '80px', height: '24px', background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(8px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)', zIndex: 2,
      }} />
      <Box sx={{ 
        width: { xs: 140, sm: 180, lg: 220 }, height: { xs: 180, sm: 220, lg: 260 }, 
        backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', 
        borderRadius: '0px', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        {/* Playful Sticker */}
        {stickerText && (
          <Box sx={{
            position: 'absolute', top: -15, right: -15,
            width: 45, height: 45, borderRadius: '50%',
            background: stickerBg || '#fbbf24',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: 'rotate(12deg)',
            color: '#000', fontWeight: 900, fontSize: '0.65rem',
            fontFamily: 'var(--font-quicksand)', letterSpacing: '0.5px',
            border: '2px solid white'
          }}>
             {stickerText}
          </Box>
        )}
      </Box>
      
      {/* Handwriting Caption */}
      {caption && (
        <Typography sx={{
            fontFamily: '"Caveat", "Shadows Into Light", "Kalam", "Comic Sans MS", cursive',
            fontSize: { xs: '1rem', md: '1.25rem' },
            color: 'rgba(0,0,0,0.8)',
            textAlign: 'center',
            position: 'absolute',
            bottom: { xs: '8px', md: '20px' },
            left: 0, right: 0,
            lineHeight: 1,
            transform: 'rotate(-2deg)'
        }}>
            {caption}
        </Typography>
      )}
    </Box>
  );
};

const SocietyLogo = () => (
  <Box sx={{
      bgcolor: '#0f2414', px: 1.5, pt: 4, pb: 1.5,
      display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
      boxShadow: '0 8px 25px rgba(15, 36, 20, 0.15)',
  }}>
      <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, fontSize: '1rem', color: 'white', lineHeight: 1, letterSpacing: '-0.02em', textAlign: 'left' }}>
          FOOD<br />NERVE
      </Typography>
      <Typography variant="overline" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, fontSize: '0.55rem', color: '#d97706', letterSpacing: '2px', lineHeight: 1, mt: 1, textAlign: 'left' }}>
          SOCIETY
      </Typography>
  </Box>
);

const InnovationsLogo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{
        bgcolor: '#0f2414', px: 1.5, pt: 4, pb: 1.5,
        display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end',
        boxShadow: '0 8px 25px rgba(15, 36, 20, 0.15)',
    }}>
        <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, fontSize: '1rem', color: 'white', lineHeight: 1, letterSpacing: '-0.02em', textAlign: 'left' }}>
            FOOD<br />NERVE
        </Typography>
    </Box>
  </Box>
);

const DarkporeLogo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{
        width: 48, height: 48, bgcolor: '#000', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-playfair)', fontWeight: 900, fontSize: '1.5rem',
        borderRadius: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
        D
    </Box>
    <Typography variant="h5" fontWeight={800} fontFamily="var(--font-playfair)" sx={{ color: '#000' }}>
       Darkpore Ventures
    </Typography>
  </Box>
);

export default function ClientJoin({ initialTenant }: ClientJoinProps) {
  const [email, setEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnUrl = searchParams.get('returnUrl');

  const getReturnUrlText = () => {
    if (!returnUrl) return null;
    if (returnUrl.includes('/trade')) return 'Trade Dashboard';
    if (returnUrl.includes('/learn')) return 'Learn Academy';
    if (returnUrl.includes('/support')) return 'Support Board';
    if (returnUrl.includes('/meet')) return 'Meet Global';
    if (returnUrl.includes('/dashboard')) return 'Dashboard';
    if (returnUrl.includes('/profile')) return 'Profile Setup';
    return 'Secure Area';
  };
  const returnTarget = getReturnUrlText();

  const isDarkpore = initialTenant === 'darkpore';
  const isSociety = initialTenant === 'society';
  
  const totalImages = isSociety ? 3 : 2;
  const [frontIndex, setFrontIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Reversing the cycle to shift front right, then back left
      setFrontIndex((prev) => (prev + totalImages - 1) % totalImages);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalImages]);

  const getSocietyPosition = (index: number) => {
    const dist = (index - frontIndex + 3) % 3;
    if (dist === 0) return { rotate: 0, left: { xs: '50%', md: '15%' }, top: { xs: '38%', md: '30%' }, zIndex: 4 }; // Front
    if (dist === 1) return { rotate: 15, left: { xs: '68%', md: '25%' }, top: { xs: '34%', md: '20%' }, zIndex: 2 }; // Back Right
    return { rotate: -15, left: { xs: '32%', md: '5%' }, top: { xs: '36%', md: '25%' }, zIndex: 3 }; // Middle Left
  };

  const getOtherPosition = (index: number) => {
    const dist = (index - frontIndex + 2) % 2;
    if (dist === 0) return { rotate: -5, left: { xs: '50%', md: '15%' }, top: { xs: '38%', md: '30%' }, zIndex: 3 }; // Front
    return { rotate: 10, left: { xs: '65%', md: '25%' }, top: { xs: '35%', md: '22%' }, zIndex: 2 }; // Back Right
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      let callbackUrl = `${window.location.origin}/finishSignUp`;
      if (returnUrl) {
         callbackUrl += `?returnUrl=${encodeURIComponent(returnUrl)}`;
      }
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
      // If we use NextRouter, we could redirect to returnUrl right here upon success.
      // But for Google popup, we might need an onAuthStateChanged listener to handle redirection.
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
      // The app's global auth state listener in SocietyContext 
      // will pick up the user and redirect them automatically.
    } catch (error: any) {
      console.error('Admin login error:', error);
      setStatus('error');
      // Use Firebase's error message
      setErrorMessage(error.message || 'Invalid Admin Credentials.');
    }
  };

  const appName = isDarkpore ? 'Darkpore Ventures' : isSociety ? 'Society OS' : 'Society Investor Portal';
  const appDesc = isDarkpore 
    ? 'Internal Access Gateway'
    : isSociety
      ? 'Join the global network of food and agriculture innovators.'
      : 'Innovator & Investor Access Gateway';

  const cardBg = 'rgba(255, 255, 255, 0.6)';
  const textColor = '#000000';
  const subTextColor = 'rgba(0,0,0,0.7)';
  const borderColor = 'rgba(255,255,255,0.4)';
  const inputBg = 'rgba(255,255,255,0.6)';
  const primaryColor = isSociety ? '#10b981' : '#000000';
  const primaryText = '#ffffff';

  return (
    <Box sx={{ 
      width: '100vw', 
      minHeight: '100vh', 
      display: 'flex', 
      backgroundColor: '#f8fafc', 
      fontFamily: 'var(--font-quicksand)', 
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>
      
      {/* VIBRANT MESH GRADIENT */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        opacity: 1,
        background: isSociety 
          ? `radial-gradient(at 0% 0%, rgba(52, 211, 153, 0.3) 0px, transparent 50%),
             radial-gradient(at 100% 0%, rgba(251, 191, 36, 0.2) 0px, transparent 50%),
             radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.3) 0px, transparent 50%), 
             radial-gradient(at 0% 100%, rgba(251, 191, 36, 0.2) 0px, transparent 50%),
             radial-gradient(at 50% 50%, rgba(255, 255, 255, 0.8) 0px, transparent 50%)`
          : `radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.2) 0px, transparent 50%),
             radial-gradient(at 100% 0%, rgba(147, 51, 234, 0.2) 0px, transparent 50%),
             radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.2) 0px, transparent 50%), 
             radial-gradient(at 0% 100%, rgba(147, 51, 234, 0.2) 0px, transparent 50%),
             radial-gradient(at 50% 50%, rgba(255, 255, 255, 0.8) 0px, transparent 50%)`,
        filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none'
      }} />

      {/* TOP LEFT LOGO */}
      <Box component="a" href="/" sx={{
        position: 'absolute', top: 0, left: 0, p: { xs: 2, md: 4 }, zIndex: 20,
        textDecoration: 'none', cursor: 'pointer', transition: 'transform 0.2s ease',
        '&:hover': { transform: 'scale(1.02)' }
      }}>
         {isSociety ? <SocietyLogo /> : isDarkpore ? <DarkporeLogo /> : <InnovationsLogo />}
      </Box>

      {/* TOP RIGHT NAVIGATION */}
      <Box sx={{
        position: 'absolute', top: 0, right: 0, p: { xs: 2, md: 4 }, zIndex: 20, display: 'flex', gap: 3
      }}>
        {isSociety && (
          <>
            <Button href="/about" sx={{ color: '#000', fontWeight: 700, textTransform: 'none', fontFamily: 'var(--font-quicksand)' }}>About Us</Button>
            <Button href="/explore" variant="outlined" sx={{ borderColor: 'rgba(0,0,0,0.2)', color: '#000', fontWeight: 700, textTransform: 'none', borderRadius: 6, '&:hover': { background: 'rgba(0,0,0,0.05)', borderColor: '#000' } }}>Explore</Button>
          </>
        )}
      </Box>

      {/* Floating Polaroids Layer */}
      <Box sx={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none'
      }}>
        {isSociety ? (
          <>
            <Polaroid src="/images/society/login-hero.png" {...getSocietyPosition(0)} caption="Nairobi, Kenya '25" stickerText="⭐" stickerBg="#fbbf24" />
            <Polaroid src="/images/society/about-hero.png" {...getSocietyPosition(1)} caption="Harvest Time" />
            <Polaroid src="/images/society/hero.png" {...getSocietyPosition(2)} caption="Paris Summit" stickerText="NEW" stickerBg="#10b981" />
          </>
        ) : (
          <>
            <Polaroid src="/media/innovating.jpg" {...getOtherPosition(0)} caption="Lab Alpha - 04" stickerText="TOP" stickerBg="#3b82f6" />
            <Polaroid src="/media/discussion.jpg" {...getOtherPosition(1)} caption="Strategy Sync" />
          </>
        )}
      </Box>

      {/* Auth Card Layer */}
      <Box sx={{ 
        width: '100%', minHeight: '100vh', display: 'flex', 
        alignItems: { xs: 'flex-start', md: 'center' }, 
        justifyContent: { xs: 'center', md: 'flex-end' }, 
        px: { xs: 2, sm: 4, md: '8%', lg: '12%' }, zIndex: 10,
        pt: { xs: '65vh', md: 0 },
        pb: { xs: 6, md: 0 }
      }}>
        
        <Box sx={{ width: '100%', maxWidth: 420, perspective: '1000px', mt: { xs: 0, md: 0 } }}>
          <motion.div
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
          >
            
            {/* FRONT OF CARD (USER JOIN) */}
            <Card
              sx={{
                width: '100%',
                background: cardBg,
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
                color: textColor,
                boxShadow: '0 32px 64px -12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,1)',
                backfaceVisibility: 'hidden',
                zIndex: isFlipped ? 0 : 1,
              }}
            >
              <CardContent sx={{ p: { xs: 4, md: 5 }, maxHeight: '85vh', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" fontWeight={800} letterSpacing={'-0.5px'} fontFamily="var(--font-playfair)" gutterBottom>
                    {appName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: subTextColor, fontSize: '0.95rem', fontWeight: 500 }}>
                    {appDesc}
                  </Typography>
                </Box>

                {returnTarget && (
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2, background: 'rgba(59, 130, 246, 0.1)', color: '#1e3a8a', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    Sign in to continue to <strong>{returnTarget}</strong>
                  </Alert>
                )}

                {status === 'success' ? (
                  <Alert severity="success" sx={{ mb: 3 }}>Check your email for the magic link!</Alert>
                ) : (
                  <form onSubmit={handleEmailSignIn}>
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
                          color: textColor, background: inputBg, borderRadius: 2,
                          '& fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
                          '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
                          '&.Mui-focused fieldset': { borderColor: primaryColor },
                        }
                      }}
                    />
                    <Button
                      fullWidth type="submit" variant="contained" disabled={status === 'loading'}
                      sx={{
                        py: 1.8, fontWeight: 700, fontSize: '1rem', mb: 3, borderRadius: 2,
                        textTransform: 'none', background: primaryColor, color: primaryText,
                        boxShadow: `0 8px 24px ${primaryColor}40`,
                        '&:hover': { background: isSociety ? '#059669' : '#333' }
                      }}
                    >
                      {status === 'loading' ? 'Sending Magic Link...' : 'Continue with Email'}
                    </Button>
                  </form>
                )}

                <Divider sx={{ borderColor: 'rgba(0,0,0,0.1)', mb: 3 }}>
                  <Typography variant="caption" sx={{ color: subTextColor, px: 1, letterSpacing: '1px' }}>OR</Typography>
                </Divider>

                <Button
                  fullWidth variant="outlined" onClick={handleGoogleSignIn} startIcon={<GoogleIcon />}
                  sx={{
                    py: 1.5, color: textColor, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 2, textTransform: 'none', fontWeight: 700, mb: 3,
                    background: inputBg,
                    '&:hover': { borderColor: 'rgba(0,0,0,0.4)', background: 'rgba(255,255,255,0.9)' },
                  }}
                >
                  Continue with Google
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Button 
                    onClick={() => setIsFlipped(true)}
                    endIcon={<AdminPanelSettingsTwoToneIcon />}
                    sx={{ textTransform: 'none', color: subTextColor, fontWeight: 600, '&:hover': { color: primaryColor } }}
                  >
                    For Admins
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* BACK OF CARD (ADMIN LOGIN) */}
            <Card
              sx={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                background: cardBg,
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
                color: textColor,
                boxShadow: '0 32px 64px -12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,1)',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                zIndex: isFlipped ? 1 : 0,
              }}
            >
              <Box sx={{ height: '6px', width: '100%', background: '#d97706', flexShrink: 0 }} />
              <CardContent sx={{ p: { xs: 4, md: 5 }, height: '100%', display: 'flex', flexDirection: 'column', maxHeight: 'calc(85vh - 6px)', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                
                <Box sx={{ mb: 4, flexShrink: 0 }}>
                  <Button 
                    startIcon={<ArrowBackIcon />} onClick={() => setIsFlipped(false)}
                    sx={{ textTransform: 'none', color: subTextColor, mb: 2, fontWeight: 600 }}
                  >
                    Back to User Login
                  </Button>
                  <Typography variant="h4" fontWeight={800} fontFamily="var(--font-playfair)" gutterBottom>
                    Admin Portal
                  </Typography>
                  <Typography variant="body2" sx={{ color: subTextColor, fontWeight: 500 }}>
                    Authorized personnel only.
                  </Typography>
                </Box>

                {status === 'error' && (
                  <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>
                )}

                <form onSubmit={handleAdminSignIn} style={{ flexGrow: 1 }}>
                  <TextField
                    fullWidth variant="outlined" placeholder="Admin Username"
                    value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                    sx={{ mb: 3, '& .MuiOutlinedInput-root': { color: textColor, background: inputBg, borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth variant="outlined" placeholder="Password" type={showPassword ? 'text' : 'password'}
                    value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                    sx={{ mb: 4, '& .MuiOutlinedInput-root': { color: textColor, background: inputBg, borderRadius: 2 } }}
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
                      py: 1.8, fontWeight: 700, fontSize: '1rem', borderRadius: 2, textTransform: 'none',
                      background: '#d97706', color: '#fff', '&:hover': { background: '#b45309' },
                      boxShadow: '0 8px 24px rgba(217, 119, 6, 0.4)'
                    }}
                  >
                    {status === 'loading' ? 'Authenticating...' : 'Login'}
                  </Button>
                </form>

              </CardContent>
            </Card>

          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
