"use client";

import React, { useState } from 'react';
import {
  Dialog,
  Typography,
  Button,
  Box,
  CircularProgress,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Backdrop
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useSociety } from '@/context/SocietyContext';
import { submitAdminOnboarding } from '@/lib/actions/admin';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import { useStorageUpload } from '@/hooks/useStorageUpload';

const DEPARTMENTS = [
  'Executive', 'Operations', 'Engineering', 'Marketing', 
  'Sales', 'Product', 'Customer Support', 'Finance', 'Legal', 'Logistics'
];

const ROLES = [
  'Founder', 'Chief Executive Officer', 'Director', 'Head of Department',
  'Senior Manager', 'Manager', 'Lead', 'Specialist', 'Coordinator'
];

export default function AdminOnboardingModal() {
  const { user, profile } = useSociety();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [step, setStep] = useState(1);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [prefixes, setPrefixes] = useState<string[]>([]);
  const [suffixes, setSuffixes] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { uploadFile, uploading } = useStorageUpload();
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const PREFIX_OPTIONS = ['Dr.', 'Prof.', 'Engr.', 'Arch.', 'Pharm.', 'Rev.', 'Chief', 'Mr.', 'Mrs.', 'Ms.'];
  const SUFFIX_OPTIONS = ['PhD', 'MSc', 'BSc', 'MBA', 'CFA', 'Esq.', 'MD', 'DO', 'CPA'];

  // Sync initial name if available
  React.useEffect(() => {
    if (profile?.displayName && !firstName && !lastName) {
      const parts = profile.displayName.trim().split(' ');
      if (parts.length === 1) {
        setFirstName(parts[0]);
      } else if (parts.length >= 2) {
        setFirstName(parts[0]);
        setLastName(parts.slice(1).join(' '));
      }
    }
  }, [profile, firstName, lastName]);

  // Trigger Logic: 
  // 1. Must be an admin (logged in via password)
  // 2. Must not yet have Apex rank (currentRank < 5)
  const isPendingAdmin = profile?.isAdmin && profile?.currentRank < 5;

  if (!isPendingAdmin || !user) return null;

  const handleNextStep = () => {
    if (!firstName || !lastName || !bio) return;
    setStep(2);
  };

  const handleReviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !role) return;
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      let finalAvatarUrl = avatarUrl;
      
      if (avatarFile) {
        const uploadResult = await uploadFile(avatarFile);
        if (uploadResult && uploadResult.secure_url) {
          finalAvatarUrl = uploadResult.secure_url;
        } else {
          throw new Error("Failed to upload profile picture.");
        }
      }

      await submitAdminOnboarding(user.uid, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        prefixes,
        suffixes,
        role,
        department,
        bio,
        avatarUrl: finalAvatarUrl,
      });
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const slideVariants: import('framer-motion').Variants = {
    hidden: (direction: number) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
    visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: (direction: number) => ({ x: direction < 0 ? 30 : -30, opacity: 0, transition: { duration: 0.3, ease: "easeIn" as const } })
  };

  return (
    <Dialog 
      open={true} 
      maxWidth="md"
      fullWidth
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }
        },
        paper: {
          elevation: 0,
          sx: {
            bgcolor: '#ffffff !important',
            backgroundImage: 'none !important',
            boxShadow: '0 24px 64px rgba(0,0,0,0.1) !important',
            border: 'none !important',
            borderRadius: 6,
            m: { xs: 2, md: 4 },
            overflow: 'hidden',
          }
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        minHeight: { xs: 'auto', md: 550 },
      }}>
        
        {/* ========================================= */}
        {/* LEFT BANNER (Top on Mobile) */}
        {/* ========================================= */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: { xs: '100%', md: '45%' },
          position: 'relative',
          bgcolor: '#ffffff',
          p: { xs: 4, md: 6 },
          textAlign: { xs: 'center', md: 'left' }
        }}>
          {/* The Gradient Banner Background */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
            zIndex: 0
          }} />
          
          {/* Decorative Glow inside the left panel */}
          <Box sx={{
            position: 'absolute', top: '-10%', left: '-10%', width: '80%', height: '80%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none'
          }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', background: 'white', mb: 3, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)' }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 36, color: '#059669' }} />
            </Box>
            <Typography variant="h4" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#0f172a', mb: 2, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Executive Clearance
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7, fontSize: '1.05rem' }}>
              Welcome to the inner circle of the Food Nerve Ecosystem. As a recognized authority, we need to establish your core profile before you direct operations.
            </Typography>
          </Box>
        </Box>

        {/* ========================================= */}
        {/* RIGHT FORMS (Bottom on Mobile) */}
        {/* ========================================= */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', md: '55%' },
          maxHeight: { xs: 'auto', md: '80vh' },
          overflowY: 'auto',
          bgcolor: '#ffffff',
          p: { xs: 3, md: 6 },
        }}>
          <Stepper activeStep={step - 1} alternativeLabel sx={{ mb: 5, '& .MuiStepIcon-root.Mui-active': { color: '#10b981' }, '& .MuiStepIcon-root.Mui-completed': { color: '#059669' } }}>
            <Step><StepLabel>Personal Base</StepLabel></Step>
            <Step><StepLabel>Business Designation</StepLabel></Step>
          </Stepper>

          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>
              {step === 1 && (
                <Box component={motion.div} key="step1" custom={-1} variants={slideVariants} initial="hidden" animate="visible" exit="exit" sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar 
                        src={avatarUrl} 
                        sx={{ 
                          width: 88, height: 88, 
                          bgcolor: 'white', color: '#059669', fontSize: '2rem',
                          border: '2px dashed rgba(16, 185, 129, 0.3)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                        }}
                      >
                        {firstName ? firstName.charAt(0).toUpperCase() : 'A'}
                      </Avatar>
                      <IconButton 
                        component="label" 
                        sx={{ 
                          position: 'absolute', bottom: -4, right: -4, 
                          bgcolor: '#10b981', color: 'white', width: 32, height: 32,
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          '&:hover': { bgcolor: '#059669' }
                        }}
                      >
                        <PhotoCameraIcon sx={{ fontSize: 18 }} />
                        <input 
                          hidden accept="image/*" type="file" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setAvatarFile(e.target.files[0]);
                              setAvatarUrl(URL.createObjectURL(e.target.files[0]));
                            }
                          }}
                        />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <PremiumAutocomplete
                      label="Prefixes (Optional)"
                      options={PREFIX_OPTIONS}
                      value={prefixes}
                      onChange={(e: any, newValue: any) => setPrefixes(newValue)}
                      multiple
                      freeSolo
                      colorTheme="#10b981"
                      placeholder="e.g. Dr., Prof."
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <PremiumTextField
                        label="First Name"
                        value={firstName}
                        onChange={(e: any) => setFirstName(e.target.value)}
                        placeholder="e.g. John"
                        colorTheme="#10b981"
                        required
                        fullWidth
                      />
                      <PremiumTextField
                        label="Last Name"
                        value={lastName}
                        onChange={(e: any) => setLastName(e.target.value)}
                        placeholder="e.g. Doe"
                        colorTheme="#10b981"
                        required
                        fullWidth
                      />
                    </Box>
                    <PremiumAutocomplete
                      label="Suffixes (Optional)"
                      options={SUFFIX_OPTIONS}
                      value={suffixes}
                      onChange={(e: any, newValue: any) => setSuffixes(newValue)}
                      multiple
                      freeSolo
                      colorTheme="#10b981"
                      placeholder="e.g. PhD, MBA"
                    />
                  </Box>

                  <PremiumTextField
                    fullWidth required multiline rows={3}
                    colorTheme="#10b981"
                    label="Executive Briefing (Bio)"
                    placeholder="A short blurb establishing your authority..."
                    value={bio}
                    onChange={(e: any) => setBio(e.target.value)}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained"
                      onClick={handleNextStep}
                      disabled={!firstName.trim() || !lastName.trim() || !bio.trim()}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        bgcolor: '#3b82f6', 
                        '&:hover': { bgcolor: '#2563eb' },
                        borderRadius: 100,
                        px: 4, py: 1.5,
                        fontWeight: 700
                      }}
                    >
                      Continue
                    </Button>
                  </Box>
                </Box>
              )}

              {step === 2 && (
                <Box component={motion.form} onSubmit={showConfirmation ? (e) => { e.preventDefault(); handleSubmit(); } : handleReviewClick} key="step2" custom={1} variants={slideVariants} initial="hidden" animate="visible" exit="exit" sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ color: '#0f172a', fontWeight: 800, mb: 0.5 }}>Business Core</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                      Establish your departmental placement within the Food Nerve infrastructure.
                    </Typography>
                  </Box>

                  <PremiumAutocomplete
                    freeSolo
                    colorTheme="#10b981"
                    label="Department Base"
                    options={DEPARTMENTS}
                    value={department}
                    onChange={(_, newValue) => setDepartment(typeof newValue === 'string' ? newValue : '')}
                    onInputChange={(_, newInputValue) => setDepartment(newInputValue)}
                  />

                  <PremiumAutocomplete
                    freeSolo
                    colorTheme="#10b981"
                    label="Official Designation"
                    options={ROLES}
                    value={role}
                    onChange={(_, newValue) => setRole(typeof newValue === 'string' ? newValue : '')}
                    onInputChange={(_, newInputValue) => setRole(newInputValue)}
                  />

                  {showConfirmation && (
                    <Box component={motion.div} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} sx={{
                      mt: 1, p: 3, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      display: 'flex', flexDirection: 'column', gap: 1
                    }}>
                      <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlinedIcon fontSize="small" /> Please Confirm Details
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}><strong>Name:</strong> {firstName} {lastName}</Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}><strong>Department:</strong> {department}</Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}><strong>Role:</strong> {role}</Typography>
                    </Box>
                  )}

                  {submitError && (
                    <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600, textAlign: 'center', mt: 1 }}>
                      {submitError}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      onClick={() => {
                        if (showConfirmation) setShowConfirmation(false);
                        else setStep(1);
                      }} 
                      variant="outlined"
                      disabled={loading}
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        py: 1.5, px: 3, borderRadius: 3, fontWeight: 700,
                        color: '#475569', borderColor: 'rgba(0,0,0,0.08)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.15)' }
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit" fullWidth variant="contained" disabled={loading || uploading || !department || !role}
                      sx={{
                        py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '0.95rem',
                        letterSpacing: '0.5px', color: 'white',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                        textTransform: 'uppercase', transition: 'all 0.3s ease',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.4)' },
                        '&.Mui-disabled': { background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.25)', boxShadow: 'none' }
                      }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (showConfirmation ? 'Finalize Profile' : 'Review Details')}
                    </Button>
                  </Box>
                </Box>
              )}
            </AnimatePresence>
          </Box>
        </Box>

      </Box>
    </Dialog>
  );
}
