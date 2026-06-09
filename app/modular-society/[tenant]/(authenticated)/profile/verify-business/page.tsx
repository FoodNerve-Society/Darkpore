// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, TextField, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { RANK_NAMES, RANK_COLORS } from '@/context/SocietyContext';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const glassCard = {
  background: '#ffffff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderRadius: 3,
};

export default function VerifyBusinessPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'reviewing' | 'done'>('form');

  const handleSubmit = () => {
    setStep('reviewing');
    setTimeout(() => setStep('done'), 2500);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 600, mx: 'auto' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }} sx={{ mb: 0.5 }}>
          Business Verification
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Unlock <Chip icon={<EmojiEventsIcon sx={{ fontSize: 14 }} />} label={`Rank 4 · ${RANK_NAMES[4]}`} size="small" sx={{ bgcolor: `${RANK_COLORS[4]}15`, color: RANK_COLORS[4], fontWeight: 600, ml: 0.5 }} /> to launch Support campaigns and act as escrow.
        </Typography>
      </Box>

      {step === 'form' && (
        <Box>
          <Card sx={{ ...glassCard, mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack sx={{ alignItems: "center" }} spacing={2} sx={{ mb: 3 }}>
                <BusinessIcon sx={{ fontSize: 48, color: RANK_COLORS[4] }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }} textAlign="center">
                  Verify Your Business Entity
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Upload your CAC (Corporate Affairs Commission) certificate to prove your business registration.
                </Typography>
              </Stack>

              <TextField label="Business Name" fullWidth sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField label="CAC Registration Number" fullWidth sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField label="Business Address" fullWidth multiline rows={2} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

              {/* Upload Area */}
              <Box sx={{
                border: '2px dashed rgba(0,0,0,0.15)', borderRadius: 3, p: 4,
                textAlign: 'center', cursor: 'pointer', mb: 2,
                '&:hover': { borderColor: RANK_COLORS[4], bgcolor: `${RANK_COLORS[4]}05` },
                transition: 'all 0.2s ease',
              }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Upload CAC Certificate
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  PDF or JPG (max 10MB)
                </Typography>
              </Box>

              <Button
                variant="contained" fullWidth
                startIcon={<BusinessIcon />}
                onClick={handleSubmit}
                sx={{
                  py: 1.5, borderRadius: 3, fontWeight: 700, fontSize: '1rem',
                  background: `linear-gradient(135deg, ${RANK_COLORS[4]}, ${RANK_COLORS[4]}cc)`,
                }}
              >
                Submit for Verification
              </Button>

              {/* Enterprise Fast-Track Info */}
              <Card sx={{ mt: 3, bgcolor: `${RANK_COLORS[4]}05`, border: `1px solid ${RANK_COLORS[4]}20`, borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} sx={{ color: RANK_COLORS[4] }}>
                    ⚡ Enterprise Fast-Track
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Verified businesses receive a Verification Grant of +5,000 Lifetime NP and +500 Promo NP ($5.00 in free credits), instantly jumping to Rank 4 Pioneer status.
                  </Typography>
                </CardContent>
              </Card>
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
                background: `${RANK_COLORS[4]}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
              }}>
                <BusinessIcon sx={{ fontSize: 32, color: RANK_COLORS[4] }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Verifying your business...</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                CAC verification typically takes 1-3 business days.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {step === 'done' && (
        <Box>
          <Card sx={{ ...glassCard, mt: 3, textAlign: 'center', border: `2px solid ${RANK_COLORS[4]}30` }}>
            <CardContent sx={{ p: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: RANK_COLORS[4], mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Business Verified!</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }} sx={{ color: RANK_COLORS[4], mt: 1 }}>
                +5,000 Lifetime NP · +500 Promo NP
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                You are now a Rank 4 Pioneer. You can launch Support campaigns and act as escrow.
              </Typography>
              <Button
                variant="contained" onClick={() => router.push('/profile')}
                sx={{ borderRadius: 3, px: 4, fontWeight: 700, background: `linear-gradient(135deg, ${RANK_COLORS[4]}, ${RANK_COLORS[4]}cc)` }}
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
