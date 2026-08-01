'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, IconButton, Button, TextField, MenuItem, alpha, useTheme 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useSociety, checkGatekeeper } from '@/context/SocietyContext';
import { useRouter } from 'next/navigation';
import PremiumButton from '@/components/PremiumButton';

interface AddEventSidebarProps {
  onClose: () => void;
  tenantId: string;
}

export default function AddEventSidebar({ onClose, tenantId }: AddEventSidebarProps) {
  const theme = useTheme();
  const router = useRouter();
  const { user, profile } = useSociety();
  
  const [targetScope, setTargetScope] = useState<'personal' | 'organization' | 'society'>('personal');
  const [eventType, setEventType] = useState<'article' | 'livestream' | 'general'>('general');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  
  const [challengeId, setChallengeId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [eraId, setEraId] = useState('ideation');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  // If user is completely unauthenticated, show login prompt
  if (!user || !profile) {
    return (
      <Box sx={sidebarStyles}>
        <Header onClose={onClose} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3 }}>
          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '50%', mb: 2 }}>
            <LockOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, mb: 1 }}>
            Sign In Required
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            You need to be logged into Society OS to schedule events and drafts.
          </Typography>
          <PremiumButton variant="filled" baseColor="primary" onClick={() => router.push('/join')}>
            Start Upgrading Now
          </PremiumButton>
        </Box>
      </Box>
    );
  }

  const isSociety = targetScope === 'society';
  const gatekeeper = isSociety ? checkGatekeeper(profile, 4) : { allowed: true };

  // If they selected Society but aren't Rank 4
  if (isSociety && !gatekeeper.allowed) {
    return (
      <Box sx={sidebarStyles}>
        <Header onClose={onClose} />
        
        <Box sx={{ p: 1, mb: 3 }}>
          <TextField 
            select 
            label="Where are you posting this to?" 
            fullWidth 
            size="small" 
            value={targetScope} 
            onChange={(e) => setTargetScope(e.target.value as any)}
          >
            <MenuItem value="personal">Personal Calendar</MenuItem>
            {profile.organizations && profile.organizations.length > 0 && (
              <MenuItem value="organization">Organization Calendar</MenuItem>
            )}
            <MenuItem value="society">FoodNerve Society</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 3, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
          <LockOutlinedIcon sx={{ fontSize: 40, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, mb: 1, color: 'error.dark' }}>
            Rank 4 Required
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Only authenticated Rank 4 members can add public events to the Society.
          </Typography>
          <PremiumButton variant="outlined" baseColor="error" onClick={() => router.push(gatekeeper.upgradeRoute || '/profile')}>
            Start Upgrading Now
          </PremiumButton>
        </Box>
      </Box>
    );
  }

  // Handle Event Type Constraints
  if (isSociety && eventType === 'general') {
    setEventType('article'); // Force content draft for society
  }

  const handleSubmit = async () => {
    if (!title || !date || !time) return;
    if (isSociety && (!challengeId || !subcategoryId)) {
      alert("Category and Subcategory are required for Society postings.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create scheduled draft / event logic via API or Server Action
      // We will create the unified endpoint in lib/actions/calendar.ts
      const res = await fetch('/api/calendar/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetScope,
          eventType,
          title,
          date,
          time,
          challengeId,
          subcategoryId,
          eraId,
          tenantId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDraftId(data.draftId); // Might be null if it's a general personal event
        setIsSuccess(true);
      } else {
        throw new Error('Failed to schedule event');
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong scheduling the event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Box sx={sidebarStyles}>
        <Header onClose={onClose} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, mb: 1 }}>
            {eventType === 'general' ? 'Event Scheduled!' : 'Draft Created!'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {eventType === 'general' 
              ? 'Your event has been added to your calendar.' 
              : 'Your scheduled draft has been created and initialized.'}
          </Typography>
          
          <PremiumButton variant="filled" baseColor="primary" onClick={() => {
            if (eventType !== 'general' && challengeId && subcategoryId) {
              router.push(`/${challengeId}/${subcategoryId}/learn`);
            } else {
              onClose();
            }
          }}>
            {eventType === 'general' ? 'Done' : 'Go to Learn Tab'}
          </PremiumButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={sidebarStyles}>
      <Header onClose={onClose} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField 
          select 
          label="Where are you posting this to?" 
          fullWidth 
          size="small" 
          value={targetScope} 
          onChange={(e) => setTargetScope(e.target.value as any)}
        >
          <MenuItem value="personal">Personal Calendar</MenuItem>
          {profile.organizations && profile.organizations.length > 0 && (
            <MenuItem value="organization">Organization Calendar</MenuItem>
          )}
          <MenuItem value="society">FoodNerve Society</MenuItem>
        </TextField>

        <TextField 
          select 
          label="Event Type" 
          fullWidth 
          size="small" 
          value={eventType} 
          onChange={(e) => setEventType(e.target.value as any)}
        >
          <MenuItem value="article">Article Draft</MenuItem>
          <MenuItem value="livestream">Livestream Draft</MenuItem>
          {!isSociety && <MenuItem value="general">General Event (Text Reminder)</MenuItem>}
        </TextField>

        <TextField 
          label="Event / Draft Title" 
          placeholder="e.g. Monthly Investor Update" 
          fullWidth 
          size="small" 
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            label={isSociety ? "Scheduled Publish Date" : "Date"} 
            type="date" 
            fullWidth 
            size="small" 
            slotProps={{ inputLabel: { shrink: true } }} 
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <TextField 
            label="Time" 
            type="time" 
            fullWidth 
            size="small" 
            slotProps={{ inputLabel: { shrink: true } }} 
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </Box>

        {(isSociety || eventType !== 'general') && (
          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              Categorization {isSociety ? '(Required)' : '(Optional)'}
            </Typography>
            <TextField 
              select 
              label="Challenge (Category)" 
              fullWidth 
              size="small"
              value={challengeId}
              onChange={e => setChallengeId(e.target.value)}
              required={isSociety}
            >
              <MenuItem value="post-harvest-loss">Post-Harvest Loss</MenuItem>
              <MenuItem value="cold-chain">Cold Chain</MenuItem>
              <MenuItem value="soil-health">Soil Health</MenuItem>
              <MenuItem value="market-access">Market Access</MenuItem>
              <MenuItem value="capital">Capital</MenuItem>
            </TextField>
            <TextField 
              label="Subcategory ID (slug)" 
              placeholder="e.g. aggregation-centers" 
              fullWidth 
              size="small"
              value={subcategoryId}
              onChange={e => setSubcategoryId(e.target.value)}
              required={isSociety}
            />
            <TextField 
              select 
              label="Era" 
              fullWidth 
              size="small"
              value={eraId}
              onChange={e => setEraId(e.target.value)}
            >
              <MenuItem value="ideation">Ideation</MenuItem>
              <MenuItem value="pilot">Pilot</MenuItem>
              <MenuItem value="scale">Scale</MenuItem>
            </TextField>
          </Box>
        )}

        <Button 
          variant="contained" 
          size="large" 
          disabled={isSubmitting || !title || !date || !time || (isSociety && (!challengeId || !subcategoryId))}
          onClick={handleSubmit}
          sx={{ mt: 2, borderRadius: 2, fontWeight: 800 }}
        >
          {isSubmitting ? 'Processing...' : (eventType === 'general' ? 'Add Event' : 'Initialize Scheduled Draft')}
        </Button>
      </Box>
    </Box>
  );
}

const Header = ({ onClose }: { onClose: () => void }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#0f172a' }}>
      Create New Event
    </Typography>
    <IconButton size="small" onClick={onClose} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>
);

const sidebarStyles = {
  width: { xs: '100%', md: '40%' }, 
  minWidth: 320, 
  bgcolor: 'rgba(255,255,255,0.7)', 
  backdropFilter: 'blur(20px)', 
  borderRadius: 4, 
  p: 3, 
  border: '1px solid rgba(255,255,255,0.8)', 
  boxShadow: '-8px 0 32px rgba(0,0,0,0.03)',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto'
};
