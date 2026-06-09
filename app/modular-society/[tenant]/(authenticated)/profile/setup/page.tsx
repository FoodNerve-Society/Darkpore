// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, Chip, Avatar, Stepper, Step, StepLabel } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSociety, type UserRole, type Challenge, RANK_NAMES, RANK_COLORS } from '@/context/SocietyContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const glassCard = {
  background: '#ffffff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderRadius: 3,
};

const ROLES: { key: UserRole; label: string; emoji: string }[] = [
  { key: 'student', label: 'Student', emoji: '🎓' },
  { key: 'farmer', label: 'Farmer', emoji: '🌾' },
  { key: 'processor', label: 'Processor', emoji: '🏭' },
  { key: 'investor', label: 'Investor', emoji: '💰' },
  { key: 'entrepreneur', label: 'Entrepreneur', emoji: '🚀' },
  { key: 'researcher', label: 'Researcher', emoji: '🔬' },
  { key: 'logistics', label: 'Logistics', emoji: '🚚' },
  { key: 'chef', label: 'Chef', emoji: '👨‍🍳' },
  { key: 'vendor', label: 'Vendor', emoji: '🏪' },
  { key: 'employee', label: 'Employee', emoji: '👷' },
];

const CHALLENGES: { key: Challenge; label: string; emoji: string }[] = [
  { key: 'post-harvest-loss', label: 'Post-Harvest Loss', emoji: '🍅' },
  { key: 'cold-chain', label: 'Cold Chain', emoji: '❄️' },
  { key: 'soil-health', label: 'Soil Health', emoji: '🌱' },
  { key: 'market-access', label: 'Market Access', emoji: '📊' },
  { key: 'capital', label: 'Capital', emoji: '💰' },
  { key: 'energy', label: 'Energy', emoji: '⚡' },
];

const steps = ['Your Identity', 'Your Sectors', 'Your Challenges'];

export default function ProfileSetupPage() {
  const { profile } = useSociety();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(profile?.roles || []);
  const [selectedChallenges, setSelectedChallenges] = useState<Challenge[]>(profile?.selectedChallenges || []);
  const [wahaalas, setWahaalas] = useState<string[]>(profile?.wahaalas || []);
  const [bio, setBio] = useState(profile?.bio || '');

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const toggleChallenge = (b: Challenge) => {
    setSelectedChallenges(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const handleComplete = () => {
    // In production, this would save to Firebase
    router.push('/profile');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 700, mx: 'auto' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }} sx={{ mb: 0.5 }}>
          Complete Your Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Unlock <Chip icon={<EmojiEventsIcon sx={{ fontSize: 14 }} />} label={`Rank 2 · ${RANK_NAMES[2]}`} size="small" sx={{ bgcolor: `${RANK_COLORS[2]}15`, color: RANK_COLORS[2], fontWeight: 600, ml: 0.5 }} /> status and start posting.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ my: 3 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ my: 3 }}>
        {activeStep === 0 && (
          <Box>
            <Card sx={{ ...glassCard }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }} sx={{ mb: 2 }}>How do you identify?</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select all that apply.</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {ROLES.map(r => (
                    <Chip
                      key={r.key}
                      label={`${r.emoji} ${r.label}`}
                      onClick={() => toggleRole(r.key)}
                      sx={{
                        fontWeight: 600, px: 1, fontSize: '0.85rem',
                        bgcolor: selectedRoles.includes(r.key) ? 'primary.main' : 'rgba(0,0,0,0.04)',
                        color: selectedRoles.includes(r.key) ? 'white' : 'text.primary',
                        '&:hover': { bgcolor: selectedRoles.includes(r.key) ? 'primary.dark' : 'rgba(0,0,0,0.08)' },
                      }}
                    />
                  ))}
                </Box>

                <TextField
                  label="Short Bio" multiline rows={3} fullWidth
                  value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about yourself..."
                  sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </CardContent>
            </Card>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Card sx={{ ...glassCard }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }} sx={{ mb: 2 }}>Which sectors are you active in?</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>These set your default feed filters.</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {CHALLENGES.map(b => (
                    <Chip
                      key={b.key}
                      label={`${b.emoji} ${b.label}`}
                      onClick={() => toggleChallenge(b.key)}
                      sx={{
                        fontWeight: 600, px: 1, fontSize: '0.85rem',
                        bgcolor: selectedChallenges.includes(b.key) ? 'primary.main' : 'rgba(0,0,0,0.04)',
                        color: selectedChallenges.includes(b.key) ? 'white' : 'text.primary',
                        '&:hover': { bgcolor: selectedChallenges.includes(b.key) ? 'primary.dark' : 'rgba(0,0,0,0.08)' },
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Card sx={{ ...glassCard }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }} sx={{ mb: 2 }}>What are your biggest challenges?</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>We will optimize your recommendations.</Typography>
                <TextField
                  fullWidth placeholder="e.g., Finding reliable buyers, Securing funding, Cold storage..."
                  helperText="Separate challenges with commas"
                  value={wahaalas.join(', ')}
                  onChange={(e) => setWahaalas(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={() => setActiveStep(p => p - 1)} sx={{ textTransform: 'none' }}>
          Back
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep(p => p + 1)}
            disabled={activeStep === 0 && selectedRoles.length === 0}
            sx={{ borderRadius: 3, px: 4, fontWeight: 700, textTransform: 'none' }}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={handleComplete}
            sx={{
              borderRadius: 3, px: 4, fontWeight: 700, textTransform: 'none',
              background: `linear-gradient(135deg, ${RANK_COLORS[2]}, ${RANK_COLORS[2]}cc)`,
            }}
          >
            Complete Setup → Unlock Builder
          </Button>
        )}
      </Stack>
    </Box>
  );
}
