// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Backdrop, Fade, useTheme, alpha,
  Card, CardContent, MenuItem, Chip,
} from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';

/* ── Constants ── */
const COLOR_THEME = '#0f172a';   // Ink-dark — the .com identity
const ACCENT      = '#d97706';   // Amber accent
const GRADIENT    = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
const GLASS_BG    = 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)';

const ROLE_OPTIONS = [
  { label: 'Investor / VC', value: 'investor' },
  { label: 'Builder / Engineer', value: 'builder' },
  { label: 'Logistics Partner', value: 'partner' },
  { label: 'Agribusiness', value: 'farmer' },
  { label: 'Other', value: 'other' },
];

/* ── Shared Card Shell ── */
const cardSx = (flipped: boolean, isFront: boolean) => ({
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  background: GRADIENT,
  border: `1px solid rgba(255,255,255,0.08)`,
  borderRadius: 5,
  boxShadow: `
    0 48px 100px -20px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.06)
  `,
  overflow: 'hidden',
  ...(isFront
    ? { zIndex: flipped ? 0 : 1 }
    : { transform: 'rotateY(180deg)', zIndex: flipped ? 1 : 0 }),
});

/* ── Mesh gradient overlay ── */
const MeshOverlay = () => (
  <Box sx={{
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `
      radial-gradient(ellipse at 20% 0%, rgba(217, 119, 6, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)
    `,
  }} />
);

export default function EmailCaptureModal() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [role, setRole] = useState<{ label: string; value: string } | null>(null);

  /* ── Lifecycle ── */
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

  /* ── Handlers ── */
  const handleNo = () => {
    setOpen(false);
    localStorage.setItem('foodnerve_capture_seen', 'true');
  };

  const handleYes = () => setFlipped(true);

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
        backdropFilter: 'blur(20px) saturate(1.8)',
        bgcolor: 'rgba(0,0,0,0.55)',
      }}
    >
      <Fade in={open}>
        <Box sx={{
          width: '100%',
          maxWidth: 460,
          minHeight: 460,
          position: 'relative',
          perspective: '1200px',
          mx: 2,
        }}>
          <motion.div
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', minHeight: '460px', transformStyle: 'preserve-3d', position: 'relative' }}
          >
            {/* ═══════════════════════════════════════════
                FRONT FACE — "Big things are coming"
                ═══════════════════════════════════════════ */}
            <Card sx={cardSx(flipped, true)}>
              <MeshOverlay />
              <CardContent sx={{
                position: 'relative', zIndex: 1,
                height: '100%', p: { xs: 4, sm: 5 },
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', textAlign: 'center',
              }}>

                {/* Pulsing notification icon */}
                <Box sx={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ACCENT} 0%, #f59e0b 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 4,
                  boxShadow: `0 12px 40px ${alpha(ACCENT, 0.45)}`,
                  animation: 'pulseGlow 2.5s ease-in-out infinite',
                  '@keyframes pulseGlow': {
                    '0%, 100%': { boxShadow: `0 12px 40px ${alpha(ACCENT, 0.35)}` },
                    '50%': { boxShadow: `0 16px 56px ${alpha(ACCENT, 0.6)}, 0 0 0 12px ${alpha(ACCENT, 0.08)}` },
                  },
                }}>
                  <NotificationsNoneOutlined sx={{ fontSize: 32, color: '#fff' }} />
                </Box>

                <Typography variant="h4" sx={{
                  fontWeight: 900, mb: 1.5, color: '#fff',
                  letterSpacing: '-0.03em', lineHeight: 1.15,
                  fontFamily: 'var(--font-playfair)',
                  fontSize: { xs: '1.8rem', sm: '2.1rem' },
                }}>
                  Big things are coming.
                </Typography>

                <Typography variant="body1" sx={{
                  color: alpha('#fff', 0.55), mb: 5, lineHeight: 1.7,
                  maxWidth: 320, fontSize: '1.05rem',
                }}>
                  Will you want to miss them?
                </Typography>

                {/* Button row */}
                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                  <Button
                    variant="text"
                    fullWidth
                    onClick={handleNo}
                    sx={{
                      borderRadius: '14px', py: 1.8,
                      color: alpha('#fff', 0.4),
                      border: `1px solid ${alpha('#fff', 0.08)}`,
                      textTransform: 'none', fontWeight: 700, fontSize: '0.95rem',
                      backdropFilter: 'blur(8px)',
                      background: alpha('#fff', 0.03),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: alpha('#fff', 0.06),
                        borderColor: alpha('#fff', 0.15),
                        color: alpha('#fff', 0.6),
                      },
                    }}
                  >
                    No
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleYes}
                    sx={{
                      borderRadius: '14px', py: 1.8,
                      textTransform: 'none', fontWeight: 800, fontSize: '0.95rem',
                      background: `linear-gradient(135deg, ${ACCENT} 0%, #f59e0b 100%)`,
                      color: '#0f172a',
                      boxShadow: `0 12px 32px ${alpha(ACCENT, 0.4)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 16px 40px ${alpha(ACCENT, 0.55)}`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Yes
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════
                BACK FACE — Premium Form
                ═══════════════════════════════════════════ */}
            <Card sx={cardSx(flipped, false)}>
              <MeshOverlay />
              <CardContent sx={{
                position: 'relative', zIndex: 1,
                height: '100%', p: { xs: 3.5, sm: 4.5 },
                display: 'flex', flexDirection: 'column',
              }}>

                {submitted ? (
                  /* ── Success State ── */
                  <Box sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                  }}>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <Box sx={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mb: 3,
                        boxShadow: `0 16px 48px ${alpha('#10b981', 0.4)}`,
                      }}>
                        <CheckCircleOutline sx={{ fontSize: 40, color: '#fff' }} />
                      </Box>
                    </motion.div>

                    <Typography variant="h5" sx={{
                      fontWeight: 900, mb: 1, color: '#fff',
                      fontFamily: 'var(--font-playfair)',
                    }}>
                      You're on the list.
                    </Typography>
                    <Typography sx={{ color: alpha('#fff', 0.5), fontSize: '0.95rem' }}>
                      Watch your inbox for dispatch briefings.
                    </Typography>
                  </Box>
                ) : (
                  /* ── Form State ── */
                  <>
                    {/* Header accent line */}
                    <Box sx={{
                      width: 48, height: 3, borderRadius: 2, mb: 2.5,
                      background: `linear-gradient(90deg, ${ACCENT}, #f59e0b)`,
                    }} />

                    <Typography variant="h5" sx={{
                      fontWeight: 900, mb: 0.5, color: '#fff',
                      fontFamily: 'var(--font-playfair)',
                      letterSpacing: '-0.02em',
                    }}>
                      Join the Vanguard
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: alpha('#fff', 0.45), mb: 3, lineHeight: 1.6,
                    }}>
                      Get exclusive briefings on our latest ventures.
                    </Typography>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                      <PremiumTextField
                        colorTheme="#fff"
                        fullWidth
                        label="Full Name"
                        placeholder="e.g. Aisha Ibrahim"
                        required
                        size="small"
                        sx={{
                          '& .MuiFilledInput-root': {
                            bgcolor: alpha('#fff', 0.04),
                            '&:hover': { bgcolor: alpha('#fff', 0.07) },
                            '&.Mui-focused': {
                              bgcolor: alpha('#fff', 0.06),
                              boxShadow: `inset 0 2px 4px rgba(0,0,0,0.1), 0 0 0 2px ${alpha(ACCENT, 0.5)}`,
                            },
                          },
                          '& label': { color: alpha('#fff', 0.5) },
                          '& label.Mui-focused': { color: ACCENT },
                        }}
                      />

                      <PremiumTextField
                        colorTheme="#fff"
                        fullWidth
                        label="Email Address"
                        placeholder="name@company.com"
                        type="email"
                        required
                        size="small"
                        sx={{
                          '& .MuiFilledInput-root': {
                            bgcolor: alpha('#fff', 0.04),
                            '&:hover': { bgcolor: alpha('#fff', 0.07) },
                            '&.Mui-focused': {
                              bgcolor: alpha('#fff', 0.06),
                              boxShadow: `inset 0 2px 4px rgba(0,0,0,0.1), 0 0 0 2px ${alpha(ACCENT, 0.5)}`,
                            },
                          },
                          '& label': { color: alpha('#fff', 0.5) },
                          '& label.Mui-focused': { color: ACCENT },
                        }}
                      />

                      <PremiumAutocomplete
                        colorTheme="#fff"
                        label="I am a..."
                        placeholder="Select your role"
                        options={ROLE_OPTIONS}
                        getOptionLabel={(option: any) => option.label}
                        value={role}
                        onChange={(_: any, newVal: any) => setRole(newVal)}
                        sx={{
                          '& .MuiFilledInput-root': {
                            bgcolor: alpha('#fff', 0.04),
                            '&:hover': { bgcolor: alpha('#fff', 0.07) },
                            '&.Mui-focused': {
                              bgcolor: alpha('#fff', 0.06),
                              boxShadow: `inset 0 2px 4px rgba(0,0,0,0.1), 0 0 0 2px ${alpha(ACCENT, 0.5)}`,
                            },
                          },
                          '& label': { color: alpha('#fff', 0.5) },
                          '& label.Mui-focused': { color: ACCENT },
                          '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': {
                            color: alpha('#fff', 0.4),
                          },
                        }}
                      />

                      {/* Actions */}
                      <Box sx={{ mt: 'auto', display: 'flex', gap: 2, pt: 1 }}>
                        <Button
                          onClick={() => setFlipped(false)}
                          startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                          sx={{
                            color: alpha('#fff', 0.35),
                            textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                            px: 2,
                            '&:hover': { color: alpha('#fff', 0.6), background: alpha('#fff', 0.04) },
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          endIcon={<ArrowForward />}
                          sx={{
                            borderRadius: '14px', py: 1.6,
                            textTransform: 'none', fontWeight: 800, fontSize: '0.95rem',
                            background: `linear-gradient(135deg, ${ACCENT} 0%, #f59e0b 100%)`,
                            color: '#0f172a',
                            boxShadow: `0 12px 32px ${alpha(ACCENT, 0.35)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 16px 40px ${alpha(ACCENT, 0.5)}`,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          Request Briefings
                        </Button>
                      </Box>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Fade>
    </Backdrop>
  );
}
