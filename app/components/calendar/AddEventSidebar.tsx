'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, IconButton, Button, TextField, MenuItem, alpha, useTheme, styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useSociety, checkGatekeeper } from '@/context/SocietyContext';
import { useRouter } from 'next/navigation';
import PremiumButton from '@/components/PremiumButton';
import { scheduleCalendarEvent } from '@/app/actions/calendar';

// --- Premium Styled Components ---

const darkMenuProps = {
  slotProps: {
    paper: {
      sx: {
        bgcolor: 'rgba(20, 20, 22, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        borderRadius: '12px',
        mt: 1,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        '& .MuiMenuItem-root': {
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.08)'
          },
          '&.Mui-selected': {
            bgcolor: 'rgba(255,255,255,0.12)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
          }
        }
      }
    }
  }
};

const GlassTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    color: '#fff',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'var(--font-inter), sans-serif',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ff3366', 
      borderWidth: '1px',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      boxShadow: '0 0 20px rgba(255, 51, 102, 0.15)',
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#ff3366',
    }
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.5)'
  },
  // Ensure date/time picker inputs have correct text color
  '& input[type="date"]::-webkit-calendar-picker-indicator, & input[type="time"]::-webkit-calendar-picker-indicator': {
    filter: 'invert(1)',
    opacity: 0.6,
    cursor: 'pointer',
    '&:hover': { opacity: 1 }
  }
});

const PremiumGlassButton = styled(Button)({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  borderRadius: '12px',
  textTransform: 'none',
  padding: '12px 24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.8) 0%, rgba(255, 153, 51, 0.8) 100%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
    zIndex: 0
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(255, 51, 102, 0.3)',
    border: '1px solid rgba(255,255,255,0.3)',
    '&::before': { opacity: 1 }
  },
  '&.Mui-disabled': {
    color: 'rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  '& .MuiButton-label, & .MuiTypography-root, & span': {
    position: 'relative',
    zIndex: 1
  }
});

// --- Main Component ---

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
          <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%', mb: 3, boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }}>
            <LockOutlinedIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
          </Box>
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, mb: 1, color: '#fff' }}>
            Sign In Required
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, lineHeight: 1.6 }}>
            Access to the Boardroom Calendar requires authentication. Sign in to Society OS to schedule events and manage drafts.
          </Typography>
          <PremiumButton variant="filled" baseColor={theme.palette.primary.main} onClick={() => router.push('/join')}>
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
          <GlassTextField 
            select 
            label="Where are you posting this to?" 
            fullWidth 
            size="small" 
            value={targetScope} 
            onChange={(e) => setTargetScope(e.target.value as any)}
            slotProps={{ select: { MenuProps: darkMenuProps } }}
          >
            <MenuItem value="personal">Personal Calendar</MenuItem>
            {profile.organizations && profile.organizations.length > 0 && (
              <MenuItem value="organization">Organization Calendar</MenuItem>
            )}
            <MenuItem value="society">FoodNerve Society</MenuItem>
          </GlassTextField>
        </Box>

        <Box sx={{ 
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          textAlign: 'center', p: 4, 
          bgcolor: 'rgba(255, 51, 102, 0.05)', 
          borderRadius: 4, 
          border: `1px solid rgba(255, 51, 102, 0.15)`,
          boxShadow: 'inset 0 0 30px rgba(255, 51, 102, 0.05)'
        }}>
          <LockOutlinedIcon sx={{ fontSize: 48, color: '#ff3366', mb: 3, filter: 'drop-shadow(0 0 10px rgba(255,51,102,0.4))' }} />
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, mb: 1, color: '#fff' }}>
            Rank 4 Required
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, lineHeight: 1.6 }}>
            Exclusive access: Only authenticated Rank 4 members can broadcast events directly to the Society Boardroom.
          </Typography>
          <PremiumButton variant="outlined" baseColor={theme.palette.error.main} onClick={() => router.push((gatekeeper as any).upgradeRoute || '/profile')}>
            Upgrade Authorization
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
      const result = await scheduleCalendarEvent({
        targetScope,
        eventType,
        title,
        date,
        time,
        challengeId,
        subcategoryId,
        eraId,
        tenantId
      });

      if (result.success) {
        setDraftId(result.draftId);
        setIsSuccess(true);
      } else {
        throw new Error(result.error || 'Failed to schedule event');
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
          <Box sx={{ 
            p: 3, 
            bgcolor: 'rgba(76, 175, 80, 0.1)', 
            borderRadius: '50%', 
            mb: 3, 
            boxShadow: '0 0 30px rgba(76, 175, 80, 0.2)' 
          }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 64, color: '#4caf50' }} />
          </Box>
          <Typography variant="h4" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, mb: 1, color: '#fff' }}>
            {eventType === 'general' ? 'Event Secured' : 'Draft Initialized'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 5, lineHeight: 1.6 }}>
            {eventType === 'general' 
              ? 'Your event has been successfully logged to the secure timeline.' 
              : 'Your scheduled draft has been created and securely stored.'}
          </Typography>
          
          <PremiumGlassButton sx={{ width: '100%', maxWidth: 280 }} onClick={() => {
            if (eventType !== 'general' && challengeId && subcategoryId) {
              router.push(`/${challengeId}/${subcategoryId}/learn`);
            } else {
              onClose();
            }
          }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em' }}>
              {eventType === 'general' ? 'Acknowledge' : 'Proceed to Learn Tab'}
            </Typography>
          </PremiumGlassButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={sidebarStyles}>
      <Header onClose={onClose} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
        <GlassTextField 
          select 
          label="Target Scope" 
          fullWidth 
          size="medium" 
          value={targetScope} 
          onChange={(e) => setTargetScope(e.target.value as any)}
          slotProps={{ select: { MenuProps: darkMenuProps } }}
        >
          <MenuItem value="personal">Personal Calendar</MenuItem>
          {profile.organizations && profile.organizations.length > 0 && (
            <MenuItem value="organization">Organization Calendar</MenuItem>
          )}
          <MenuItem value="society">FoodNerve Society (Public)</MenuItem>
        </GlassTextField>

        <GlassTextField 
          select 
          label="Event Type" 
          fullWidth 
          size="medium" 
          value={eventType} 
          onChange={(e) => setEventType(e.target.value as any)}
          slotProps={{ select: { MenuProps: darkMenuProps } }}
        >
          <MenuItem value="article">Article Draft</MenuItem>
          <MenuItem value="livestream">Livestream Draft</MenuItem>
          {!isSociety && <MenuItem value="general">General Event (Text Reminder)</MenuItem>}
        </GlassTextField>

        <GlassTextField 
          label="Event / Draft Title" 
          placeholder="e.g. Q3 Investor Update" 
          fullWidth 
          size="medium" 
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <GlassTextField 
            label={isSociety ? "Publish Date" : "Date"} 
            type="date" 
            fullWidth 
            size="medium" 
            slotProps={{ inputLabel: { shrink: true } }} 
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <GlassTextField 
            label="Time" 
            type="time" 
            fullWidth 
            size="medium" 
            slotProps={{ inputLabel: { shrink: true } }} 
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </Box>

        {(isSociety || eventType !== 'general') && (
          <Box sx={{ 
            p: 3, 
            bgcolor: 'rgba(255,255,255,0.02)', 
            borderRadius: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2.5, 
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: -1 }}>
              <Box sx={{ width: 4, height: 16, bgcolor: '#ff3366', borderRadius: 1 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Categorization {isSociety ? '(Required)' : '(Optional)'}
              </Typography>
            </Box>
            
            <GlassTextField 
              select 
              label="Challenge (Category)" 
              fullWidth 
              size="medium"
              value={challengeId}
              onChange={e => setChallengeId(e.target.value)}
              required={isSociety}
              slotProps={{ select: { MenuProps: darkMenuProps } }}
            >
              <MenuItem value="post-harvest-loss">Post-Harvest Loss</MenuItem>
              <MenuItem value="cold-chain">Cold Chain</MenuItem>
              <MenuItem value="soil-health">Soil Health</MenuItem>
              <MenuItem value="market-access">Market Access</MenuItem>
              <MenuItem value="capital">Capital</MenuItem>
            </GlassTextField>
            
            <GlassTextField 
              label="Subcategory ID (slug)" 
              placeholder="e.g. aggregation-centers" 
              fullWidth 
              size="medium"
              value={subcategoryId}
              onChange={e => setSubcategoryId(e.target.value)}
              required={isSociety}
            />
            
            <GlassTextField 
              select 
              label="Era" 
              fullWidth 
              size="medium"
              value={eraId}
              onChange={e => setEraId(e.target.value)}
              slotProps={{ select: { MenuProps: darkMenuProps } }}
            >
              <MenuItem value="ideation">Ideation</MenuItem>
              <MenuItem value="pilot">Pilot</MenuItem>
              <MenuItem value="scale">Scale</MenuItem>
            </GlassTextField>
          </Box>
        )}

        <PremiumGlassButton 
          disabled={isSubmitting || !title || !date || !time || (isSociety && (!challengeId || !subcategoryId))}
          onClick={handleSubmit}
          sx={{ mt: 2 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.02em' }}>
            {isSubmitting ? 'Authenticating...' : (eventType === 'general' ? 'Schedule Event' : 'Initialize Scheduled Draft')}
          </Typography>
        </PremiumGlassButton>
      </Box>
    </Box>
  );
}

const Header = ({ onClose }: { onClose: () => void }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
      Create Event
    </Typography>
    <IconButton 
      size="small" 
      onClick={onClose} 
      sx={{ 
        bgcolor: 'rgba(255,255,255,0.05)', 
        color: 'rgba(255,255,255,0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', transform: 'rotate(90deg)' },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>
);

const sidebarStyles = {
  width: { xs: '100%', md: '400px', lg: '450px' }, 
  minWidth: 320, 
  bgcolor: 'rgba(12, 12, 14, 0.75)', 
  backdropFilter: 'blur(32px) saturate(180%)', 
  borderRadius: { xs: 0, md: 6 }, 
  p: { xs: 3, md: 4 }, 
  border: { xs: 'none', md: '1px solid rgba(255,255,255,0.08)' }, 
  borderLeft: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  height: '100%',
  
  // Custom scrollbar for webkit
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(255,255,255,0.2)',
  }
};
