// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, TextField, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { RANK_NAMES, RANK_COLORS } from '@/context/SocietyContext';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SecurityIcon from '@mui/icons-material/Security';

const glassCard = {
  background: '#ffffff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderRadius: 3,
};

export default function KYCPage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'reviewing' | 'done'>('upload');

  const handleSubmit = () => {
    setStep('reviewing');
    // Simulate review
    setTimeout(() => setStep('done'), 2000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 600, mx: 'auto' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }} sx={{ mb: 0.5 }}>
          Identity Verification
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Unlock <Chip icon={<EmojiEventsIcon sx={{ fontSize: 14 }} />} label={`Rank 3 · ${RANK_NAMES[3]}`} size="small" sx={{ bgcolor: `${RANK_COLORS[3]}15`, color: RANK_COLORS[3], fontWeight: 600, ml: 0.5 }} /> and gain access to direct messaging.
        </Typography>
      </Box>

      {step === 'upload' && (
        <Box>
          <Card sx={{ ...glassCard, mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack sx={{ alignItems: "center" }} spacing={2} sx={{ mb: 3 }}>
                <SecurityIcon sx={{ fontSize: 48, color: RANK_COLORS[3] }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }} textAlign="center">
                  Upload a Government-Issued ID
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  We accept National ID (NIN), International Passport, or Driver&apos;s License. Your data is encrypted and never shared.
                </Typography>
              </Stack>

              <TextField label="Full Legal Name" fullWidth sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField label="ID Number" fullWidth sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

              {/* Upload Area */}
              <Box sx={{
                border: '2px dashed rgba(0,0,0,0.15)', borderRadius: 3, p: 4,
                textAlign: 'center', cursor: 'pointer', mb: 2,
                '&:hover': { borderColor: RANK_COLORS[3], bgcolor: `${RANK_COLORS[3]}05` },
                transition: 'all 0.2s ease',
              }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  JPG, PNG or PDF (max 5MB)
                </Typography>
              </Box>

              <Button
                variant="contained" fullWidth
                startIcon={<VerifiedUserIcon />}
                onClick={handleSubmit}
                sx={{
                  py: 1.5, borderRadius: 3, fontWeight: 700, fontSize: '1rem',
                  background: `linear-gradient(135deg, ${RANK_COLORS[3]}, ${RANK_COLORS[3]}cc)`,
                }}
              >
                Submit for Verification
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {step === 'reviewing' && (
        <Box>
          <Card sx={{ ...glassCard, mt: 3, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{
                width: 60, height: 60, borderRadius: '50%', mx: 'auto', mb: 2,
                background: `${RANK_COLORS[3]}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
              }}>
                <SecurityIcon sx={{ fontSize: 32, color: RANK_COLORS[3] }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Reviewing your documents...</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This usually takes less than 24 hours.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {step === 'done' && (
        <Box>
          <Card sx={{ ...glassCard, mt: 3, textAlign: 'center', border: `2px solid ${RANK_COLORS[3]}30` }}>
            <CardContent sx={{ p: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: RANK_COLORS[3], mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Identity Verified!</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                You are now a Rank 3 Catalyst. Direct messaging is unlocked.
              </Typography>
              <Button
                variant="contained" onClick={() => router.push('/profile')}
                sx={{ borderRadius: 3, px: 4, fontWeight: 700, background: `linear-gradient(135deg, ${RANK_COLORS[3]}, ${RANK_COLORS[3]}cc)` }}
              >
                Back to Profile
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
