'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, MenuItem, IconButton, Backdrop, Fade, useTheme, alpha, Stack } from '@mui/material';
import { Close as CloseIcon, ArrowForward } from '@mui/icons-material';

export default function EmailCaptureModal() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Check if already seen
    if (localStorage.getItem('foodnerve_capture_seen')) {
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let fired = false;

    const triggerModal = () => {
      if (!fired) {
        fired = true;
        setOpen(true);
        localStorage.setItem('foodnerve_capture_seen', 'true');
      }
    };

    // Trigger 1: 10 second delay
    timeoutId = setTimeout(() => {
      triggerModal();
    }, 10000);

    // Trigger 2: Exit intent (mouse leaves top of viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        triggerModal();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
    }, 3000); // Close after showing success message for 3s
  };

  if (!hasMounted) return null;

  return (
    <Backdrop
      open={open}
      sx={{ 
        zIndex: 9999, 
        backdropFilter: 'blur(12px)',
        bgcolor: 'rgba(0,0,0,0.4)',
        perspective: '1200px', // high perspective for the 3D flip
      }}
    >
      <Fade in={open}>
        <Box sx={{
          width: '100%',
          maxWidth: '480px',
          height: '420px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          m: 2
        }}>
          
          {/* FRONT FACE */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            bgcolor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
            
            <Box sx={{ 
              width: 64, height: 64, borderRadius: '50%', 
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 900 }}>FN</Typography>
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#0f172a', letterSpacing: -0.5 }}>
              Big things are coming.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
              We're architecting the future of food logistics. Will you want to miss them?
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleClose}
                sx={{ 
                  borderRadius: '12px', py: 1.5, color: 'text.secondary', borderColor: 'rgba(0,0,0,0.1)',
                  textTransform: 'none', fontWeight: 700
                }}
              >
                Yes, I'll pass
              </Button>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => setFlipped(true)}
                sx={{ 
                  borderRadius: '12px', py: 1.5, textTransform: 'none', fontWeight: 800,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`
                }}
              >
                No, keep me in
              </Button>
            </Stack>
          </Box>

          {/* BACK FACE */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            bgcolor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            transform: 'rotateY(180deg)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>

            {submitted ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                   <Typography variant="h4" sx={{ color: 'white' }}>✓</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#0f172a' }}>
                  You're on the list.
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  Watch your inbox for dispatch briefings.
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, color: '#0f172a', mt: 1 }}>
                  Join the Vanguard
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Get exclusive briefings on our latest ventures.
                </Typography>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  <TextField 
                    fullWidth size="small" placeholder="Your Name" required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                  <TextField 
                    fullWidth size="small" type="email" placeholder="Email Address" required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                  <TextField
                    select fullWidth size="small" label="I am a..." defaultValue="" required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  >
                    <MenuItem value="investor">Investor / VC</MenuItem>
                    <MenuItem value="builder">Builder / Engineer</MenuItem>
                    <MenuItem value="partner">Logistics Partner</MenuItem>
                    <MenuItem value="farmer">Agribusiness</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                  
                  <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                    <Button 
                      variant="text" 
                      onClick={() => setFlipped(false)}
                      sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      variant="contained" 
                      fullWidth 
                      endIcon={<ArrowForward />}
                      sx={{ 
                        borderRadius: '12px', py: 1.5, textTransform: 'none', fontWeight: 800,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                      }}
                    >
                      Request Briefings
                    </Button>
                  </Box>
                </form>
              </>
            )}
          </Box>
        </Box>
      </Fade>
    </Backdrop>
  );
}
