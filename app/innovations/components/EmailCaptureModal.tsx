'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Backdrop, Fade, useTheme,
  Card, CardContent, Autocomplete, TextField, Snackbar, Alert
} from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import { motion } from 'framer-motion';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import { VALUE_CHAIN_ACTORS } from '@/lib/cms';

const cardSx = (flipped: boolean, isFront: boolean) => ({
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  bgcolor: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(24px) saturate(180%)',
  borderRadius: 5,
  boxShadow: '0 32px 64px -16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  ...(isFront
    ? { zIndex: flipped ? 0 : 1 }
    : { transform: 'rotateY(180deg)', zIndex: flipped ? 1 : 0 }),
});



export default function EmailCaptureModal() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [role, setRole] = useState<{ label: string; value: string } | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const handleOpenEvent = () => {
      setFlipped(false);
      setSubmitted(false);
      setOpen(true);
    };
    window.addEventListener('open-capture-modal', handleOpenEvent);

    if (localStorage.getItem('foodnerve_capture_seen')) {
      return () => window.removeEventListener('open-capture-modal', handleOpenEvent);
    }

    return () => {
      window.removeEventListener('open-capture-modal', handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem('foodnerve_capture_submitted')) setSubmitted(true);
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    localStorage.setItem('foodnerve_capture_seen', 'true');
    setShowToast(true);
  };

  const handleAccept = () => setFlipped(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    localStorage.setItem('foodnerve_capture_seen', 'true');
    localStorage.setItem('foodnerve_capture_submitted', 'true');
    setTimeout(() => setOpen(false), 3500);
  };

  if (!hasMounted) return null;

  return (
    <>
    <Backdrop
      open={open}
      sx={{
        zIndex: 9999,
        backdropFilter: 'blur(12px)',
        bgcolor: 'rgba(15,23,42,0.4)',
      }}
    >
      <Fade in={open}>
        <Box sx={{
          width: '100%',
          maxWidth: { xs: 480, sm: 840 },
          height: { xs: '90vh', sm: 520 },
          maxHeight: 700,
          position: 'relative',
          perspective: '1200px',
          mx: 2,
        }}>
          <motion.div
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
          >
            {/* FRONT FACE */}
            <Card sx={cardSx(flipped, true)}>
              <Box sx={{
                width: { xs: '100%', sm: '45%' },
                height: { xs: 240, sm: 'auto' },
                backgroundImage: 'url(https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
                borderRight: { sm: '1px solid rgba(0,0,0,0.06)' },
                borderBottom: { xs: '1px solid rgba(0,0,0,0.06)', sm: 'none' },
              }} />
              <CardContent sx={{
                flex: 1, p: { xs: 3, sm: 6 },
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', textAlign: { xs: 'center', sm: 'left' },
                overflowY: 'auto',
              }}>
                <Typography variant="h3" sx={{
                  fontWeight: 900, mb: { xs: 3, sm: 4 }, color: '#0f172a',
                  fontSize: { xs: '2.8rem', sm: '3rem' },
                  letterSpacing: '-0.05em', lineHeight: 1.1,
                }}>
                  Big things<br/>are coming.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2.5 }, mb: { xs: 3, sm: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.04)', color: '#0f172a', display: 'flex' }}>
                      <AutoAwesomeOutlined fontSize="small" />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', letterSpacing: '-0.01em', fontSize: '1.05rem' }}>
                      Early Access to Deals
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.04)', color: '#0f172a', display: 'flex' }}>
                      <InsightsOutlined fontSize="small" />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', letterSpacing: '-0.01em', fontSize: '1.05rem' }}>
                      Exclusive VC Briefings
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.04)', color: '#0f172a', display: 'flex' }}>
                      <BuildOutlined fontSize="small" />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', letterSpacing: '-0.01em', fontSize: '1.05rem' }}>
                      Advanced Beta Tools
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="subtitle1" sx={{
                    color: '#0f172a', mb: 2, fontWeight: 800,
                    fontSize: { xs: '1rem', sm: '1.1rem' }, letterSpacing: '-0.01em',
                  }}>
                    Do you want exclusive access?
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, width: '100%', flexDirection: { xs: 'row', sm: 'row' } }}>
                  <Button
                    variant="outlined"
                    onClick={handleDismiss}
                    sx={{
                      flex: 3,
                      borderRadius: '50px', py: { xs: 1.2, sm: 1.6 },
                      color: '#475569',
                      borderColor: 'rgba(0,0,0,0.15)',
                      textTransform: 'none', fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' },
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: 'rgba(0,0,0,0.3)',
                        background: 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    No
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAccept}
                    sx={{
                      flex: 7,
                      borderRadius: '50px', py: { xs: 1.2, sm: 1.6 },
                      textTransform: 'none', fontWeight: 800, fontSize: { xs: '0.9rem', sm: '1rem' },
                      background: '#0f172a',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: '#1e293b',
                        boxShadow: '0 12px 32px rgba(15,23,42,0.25)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Yes, I want in
                  </Button>
                </Box>
                </Box>
              </CardContent>
            </Card>

            {/* BACK FACE */}
            <Card sx={cardSx(flipped, false)}>
              <Button
                onClick={() => setFlipped(false)}
                startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                sx={{
                  position: 'absolute', top: { xs: 8, sm: 16 }, left: { xs: 8, sm: 16 }, zIndex: 10,
                  color: '#475569', textTransform: 'none', fontWeight: 700,
                  borderRadius: '50px', px: 2,
                  '&:hover': { background: 'rgba(0,0,0,0.05)' },
                }}
              >
                Back
              </Button>
              <CardContent sx={{
                flex: 1, p: { xs: 3, sm: 6 },
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {submitted ? (
                  <Box sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 6
                  }}>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <CheckCircleOutlined sx={{ fontSize: 72, color: '#10b981', mb: 3 }} />
                    </motion.div>
                    <Typography variant="h4" sx={{
                      fontWeight: 900, mb: 1.5, color: '#0f172a',
                      letterSpacing: '-0.03em',
                    }}>
                      You're on the list.
                    </Typography>
                    <Typography sx={{ color: '#475569', fontSize: '1.05rem', fontWeight: 500 }}>
                      Watch your inbox for dispatch briefings.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', flex: 1, mx: 'auto', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{
                      fontWeight: 900, mb: 1, color: '#0f172a',
                      letterSpacing: '-0.03em',
                    }}>
                      Join the Vanguard
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: '#475569', mb: 4, fontWeight: 500, fontSize: '1rem',
                    }}>
                      Get exclusive briefings on our latest ventures.
                    </Typography>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <PremiumTextField
                          colorTheme="#0f172a"
                          fullWidth
                          label="First Name"
                          placeholder="e.g. Aisha"
                          required
                        />
                        <PremiumTextField
                          colorTheme="#0f172a"
                          fullWidth
                          label="Last Name"
                          placeholder="e.g. Ibrahim"
                          required
                        />
                      </Box>
                      <PremiumTextField
                        colorTheme="#0f172a"
                        fullWidth
                        label="Email Address"
                        placeholder="name@company.com"
                        type="email"
                        required
                      />
                      <PremiumAutocomplete
                        colorTheme="#0f172a"
                        options={VALUE_CHAIN_ACTORS}
                        getOptionLabel={(option) => option.label}
                        value={role}
                        onChange={(_: any, newVal: any) => setRole(newVal)}
                        label="I am a..."
                        placeholder="Select your role"
                      />
                      <Box sx={{ mt: 'auto', display: 'flex', gap: 2, pt: { xs: 1, sm: 3 } }}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          endIcon={<ArrowForward />}
                          sx={{
                            borderRadius: '50px', py: { xs: 1.2, sm: 1.6 },
                            textTransform: 'none', fontWeight: 800, fontSize: { xs: '0.9rem', sm: '1rem' },
                            background: '#0f172a', color: '#fff',
                            boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: '#1e293b',
                              boxShadow: '0 12px 32px rgba(15,23,42,0.25)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          Request Briefings
                        </Button>
                      </Box>
                    </form>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Fade>
    </Backdrop>

      <Snackbar
        open={showToast}
        autoHideDuration={6000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box sx={{ 
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 16px 32px rgba(0,0,0,0.3)',
          borderRadius: '50px',
          px: 3, py: 1.5,
          display: 'flex', alignItems: 'center', gap: 2,
          color: '#f8fafc',
          mb: { xs: 2, sm: 4 }
        }}>
          <InsightsOutlined sx={{ color: '#38bdf8', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
            Changed your mind? Access early briefings in the Society section below.
          </Typography>
        </Box>
      </Snackbar>
    </>
  );
}
