"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, Typography, Button, Box, TextField, Chip, Stack } from '@mui/material';
import { useSociety, UserRole } from '@/context/SocietyContext';
import { rtdb } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

export default function OnboardingModal() {
  const { user, needsOnboarding } = useSociety();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | ''>('');
  const [wahaalas, setWahaalas] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [sector, setSector] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const WAHAALA_TAGS = ['Land', 'Capital', 'Energy', 'Inputs', 'Insecurity', 'Post-Harvest Loss', 'Protein'];

  const toggleWahaala = (tag: string) => {
    if (wahaalas.includes(tag)) {
      setWahaalas(wahaalas.filter(t => t !== tag));
    } else if (wahaalas.length < 3) {
      setWahaalas([...wahaalas, tag]);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    // Save to RTDB
    const profileRef = ref(rtdb, `users/${user.uid}`);
    await set(profileRef, {
      uid: user.uid,
      role,
      wahaalas,
      businessDetails: role === 'industry' ? { location, sector, whatsapp } : null,
      nervePoints: 10, // Onboarding Reward
      onboardingComplete: true
    });
    
    // Toast notification can be added here or in layout
    // The context listener will auto-update and close this modal since needsOnboarding will become false
  };

  return (
    <Dialog open={needsOnboarding} fullWidth maxWidth="sm" disableEscapeKeyDown>
      <DialogContent sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome to the Society.
        </Typography>
        
        {step === 1 && (
          <Box>
            <Typography variant="body1" mb={3}>Which of these describes you best?</Typography>
            <Stack spacing={2}>
              <Button variant={role === 'student' ? 'contained' : 'outlined'} onClick={() => setRole('student')}>Student / Intern</Button>
              <Button variant={role === 'industry' ? 'contained' : 'outlined'} onClick={() => setRole('industry')}>In the Industry (Farmer/Vendor)</Button>
              <Button variant={role === 'investor' ? 'contained' : 'outlined'} onClick={() => setRole('investor')}>Investor</Button>
            </Stack>
            <Button fullWidth variant="contained" sx={{ mt: 4 }} disabled={!role} onClick={() => setStep(2)}>
              Next
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography variant="body1" mb={3}>Which Wahaalas do you deal with? (Select up to 3)</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {WAHAALA_TAGS.map(tag => (
                <Chip 
                  key={tag}
                  label={tag}
                  onClick={() => toggleWahaala(tag)}
                  color={wahaalas.includes(tag) ? 'primary' : 'default'}
                  variant={wahaalas.includes(tag) ? 'filled' : 'outlined'}
                  sx={{ p: 1 }}
                />
              ))}
            </Box>
            <Button fullWidth variant="contained" sx={{ mt: 4 }} disabled={wahaalas.length === 0} onClick={() => {
              if (role === 'industry') setStep(3);
              else handleComplete();
            }}>
              Next
            </Button>
          </Box>
        )}

        {step === 3 && role === 'industry' && (
          <Box>
            <Typography variant="body1" mb={3}>Add your business to the Connect Directory.</Typography>
            <Stack spacing={3}>
              <TextField label="LGA / Location" fullWidth value={location} onChange={e => setLocation(e.target.value)} />
              <TextField label="Specific Sub-sector" fullWidth value={sector} onChange={e => setSector(e.target.value)} />
              <TextField label="WhatsApp Number" fullWidth value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            </Stack>
            <Button fullWidth variant="contained" sx={{ mt: 4 }} disabled={!location || !sector || !whatsapp} onClick={handleComplete}>
              Complete & Earn 10 Nerve Points
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
