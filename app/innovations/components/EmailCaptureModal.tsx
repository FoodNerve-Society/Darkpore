'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Backdrop, Fade, useTheme,
  Card, CardContent, Autocomplete, TextField
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

const ROLE_OPTIONS = [
  { label: 'Investor / VC', value: 'investor' },
  { label: 'Builder / Engineer', value: 'builder' },
  { label: 'Logistics Partner', value: 'partner' },
  { label: 'Agribusiness', value: 'farmer' },
  { label: 'Other', value: 'other' },
];

const cardSx = (flipped: boolean, isFront: boolean) => ({
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  bgcolor: '#0f172a',
  borderRadius: 5,
  boxShadow: '0 32px 64px -16px rgba(0,0,0,0.4)',
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

    let timeoutId: NodeJS.Timeout;
    let fired = false;
    const triggerModal = () => {
      if (!fired) { fired = true; setOpen(true); }
    };
    timeoutId = setTimeout(triggerModal, 10000);
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) triggerModal();
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('open-capture-modal', handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem('foodnerve_capture_submitted')) setSubmitted(true);
  }, []);

  const handleYes = () => {
    setOpen(false);
    localStorage.setItem('foodnerve_capture_seen', 'true');
  };

  const handleNo = () => setFlipped(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    localStorage.setItem('foodnerve_capture_seen', 'true');
    localStorage.setItem('foodnerve_capture_submitted', 'true');
    setTimeout(() => setOpen(false), 3500);
  };

  if (!hasMounted) return null;

  return (
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
          height: { xs: '85vh', sm: 520 },
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
                aspectRatio: { xs: '4/3', sm: 'auto' },
                backgroundImage: 'url(https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
                borderRight: { sm: '1px solid rgba(255,255,255,0.1)' },
                borderBottom: { xs: '1px solid rgba(255,255,255,0.1)', sm: 'none' },
              }} />
              <CardContent sx={{
                flex: 1, p: { xs: 4, sm: 6 },
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', textAlign: { xs: 'center', sm: 'left' },
                overflowY: 'auto',
              }}>
                <Typography variant="h3" sx={{
                  fontWeight: 900, mb: 4, color: '#ffffff',
                  letterSpacing: '-0.05em', lineHeight: 1.1,
                }}>
                  Big things<br/>are coming.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', color: '#60a5fa', display: 'flex' }}>
                      <AutoAwesomeOutlined fontSize="small" />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#cbd5e1', letterSpacing: '-0.01em', fontSize: '1.05rem' }}>
                      Early Access to Deals
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', color: '#60a5fa', display: 'flex' }}>
                      <InsightsOutlined fontSize="small" />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#cbd5e1', letterSpacing: '-0.01em', fontSize: '1.05rem' }}>
                      Exclusive VC Briefings
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', color: '#60a5fa', display: 'flex' }}>
                      <BuildOutlined fontSize="small" />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#cbd5e1', letterSpacing: '-0.01em', fontSize: '1.05rem' }}>
                      Advanced Beta Tools
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 'auto', flexDirection: { xs: 'row', sm: 'row' } }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleYes}
                    sx={{
                      borderRadius: '50px', py: 1.6,
                      color: '#94a3b8',
                      borderColor: 'rgba(255,255,255,0.2)',
                      textTransform: 'none', fontWeight: 700, fontSize: '1rem',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        background: 'rgba(255,255,255,0.05)',
                      },
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleNo}
                    sx={{
                      borderRadius: '50px', py: 1.6,
                      textTransform: 'none', fontWeight: 800, fontSize: '1rem',
                      background: '#ffffff',
                      color: '#0f172a',
                      boxShadow: '0 8px 24px rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: '#f8fafc',
                        boxShadow: '0 12px 32px rgba(255,255,255,0.2)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    No
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* BACK FACE */}
            <Card sx={cardSx(flipped, false)}>
              <Button
                onClick={() => setFlipped(false)}
                startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                sx={{
                  position: 'absolute', top: 16, left: 16, zIndex: 10,
                  color: '#94a3b8', textTransform: 'none', fontWeight: 700,
                  borderRadius: '50px', px: 2,
                  '&:hover': { background: 'rgba(255,255,255,0.05)' },
                }}
              >
                Back
              </Button>
              <CardContent sx={{
                flex: 1, p: { xs: 4, sm: 6 },
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
                      fontWeight: 900, mb: 1.5, color: '#ffffff',
                      letterSpacing: '-0.03em',
                    }}>
                      You're on the list.
                    </Typography>
                    <Typography sx={{ color: '#cbd5e1', fontSize: '1.05rem', fontWeight: 500 }}>
                      Watch your inbox for dispatch briefings.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', flex: 1, mx: 'auto', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{
                      fontWeight: 900, mb: 1, color: '#ffffff',
                      letterSpacing: '-0.03em',
                    }}>
                      Join the Vanguard
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: '#cbd5e1', mb: 4, fontWeight: 500, fontSize: '1rem',
                    }}>
                      Get exclusive briefings on our latest ventures.
                    </Typography>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                      <PremiumTextField
                        colorTheme="#ffffff"
                        fullWidth
                        label="Full Name"
                        placeholder="e.g. Aisha Ibrahim"
                        required
                      />
                      <PremiumTextField
                        colorTheme="#ffffff"
                        fullWidth
                        label="Email Address"
                        placeholder="name@company.com"
                        type="email"
                        required
                      />
                      <PremiumAutocomplete
                        colorTheme="#ffffff"
                        options={ROLE_OPTIONS}
                        getOptionLabel={(option) => option.label}
                        value={role}
                        onChange={(_: any, newVal: any) => setRole(newVal)}
                        label="I am a..."
                        placeholder="Select your role"
                      />
                      <Box sx={{ mt: 'auto', display: 'flex', gap: 2, pt: 3 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          endIcon={<ArrowForward />}
                          sx={{
                            borderRadius: '50px', py: 1.6,
                            textTransform: 'none', fontWeight: 800, fontSize: '1rem',
                            background: '#ffffff', color: '#0f172a',
                            boxShadow: '0 8px 24px rgba(255,255,255,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: '#f8fafc',
                              boxShadow: '0 12px 32px rgba(255,255,255,0.2)',
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
  );
}
