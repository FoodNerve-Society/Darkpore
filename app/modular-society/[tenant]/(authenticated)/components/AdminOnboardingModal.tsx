"use client";

import React, { useState, useEffect } from 'react';
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
  Backdrop,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Checkbox
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import { useSociety } from '@/context/SocietyContext';
import { submitAdminOnboarding, getCoreOrganizations, AffiliationData } from '@/lib/actions/admin';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import { useStorageUpload } from '@/hooks/useStorageUpload';

const ROLES = [
  'Founder', 'Chief Executive Officer', 'Director', 'Head of Department',
  'Senior Manager', 'Manager', 'Lead', 'Specialist', 'Coordinator'
];

type OrgData = {
  active: boolean;
  role: string;
  longName: string;
  shortName: string;
  logoUrl: string;
  country: string;
  state: string;
  lga: string;
  address: string;
  isVirtual: boolean;
};

const DEFAULT_ORG_STATE: OrgData = {
  active: false,
  role: '',
  longName: '',
  shortName: '',
  logoUrl: '',
  country: '',
  state: '',
  lga: '',
  address: '',
  isVirtual: false
};

export default function AdminOnboardingModal() {
  const { user, profile } = useSociety();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [fetchingOrgs, setFetchingOrgs] = useState(true);
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
  
  // New Affiliation States
  const [darkpore, setDarkpore] = useState<OrgData>({ ...DEFAULT_ORG_STATE });
  const [foodnerve, setFoodnerve] = useState<OrgData>({ ...DEFAULT_ORG_STATE });
  
  // Existing Orgs pulled from DB
  const [existingOrgs, setExistingOrgs] = useState<{ darkpore: any; foodnerve: any }>({ darkpore: null, foodnerve: null });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const PREFIX_OPTIONS = ['Dr.', 'Prof.', 'Engr.', 'Arch.', 'Pharm.', 'Rev.', 'Chief', 'Mr.', 'Mrs.', 'Ms.'];
  const SUFFIX_OPTIONS = ['PhD', 'MSc', 'BSc', 'MBA', 'CFA', 'Esq.', 'MD', 'DO', 'CPA'];

  // Trigger Logic
  const isPendingAdmin = profile?.isAdmin && profile?.currentRank < 5;

  useEffect(() => {
    if (isPendingAdmin) {
      getCoreOrganizations().then((res) => {
        setExistingOrgs(res);
        setFetchingOrgs(false);
      });
    }
  }, [isPendingAdmin]);

  // Sync initial name if available
  useEffect(() => {
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

  if (!isPendingAdmin || !user) return null;

  const handleNextStep = () => {
    if (!firstName || !lastName || !bio) return;
    setStep(2);
  };

  const handleReviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!darkpore.active && !foodnerve.active) {
      setSubmitError("You must affiliate with at least one organization.");
      return;
    }
    if (darkpore.active && !darkpore.role) {
      setSubmitError("Please specify a role for Darkpore.");
      return;
    }
    if (foodnerve.active && !foodnerve.role) {
      setSubmitError("Please specify a role for Food Nerve.");
      return;
    }
    setShowConfirmation(true);
    setSubmitError("");
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
        bio,
        avatarUrl: finalAvatarUrl,
        darkpore,
        foodnerve,
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

  const renderOrgAccordion = (key: 'darkpore' | 'foodnerve', defaultName: string, state: OrgData, setState: React.Dispatch<React.SetStateAction<OrgData>>, existingData: any) => {
    const isExisting = !!existingData;

    return (
      <Accordion 
        expanded={state.active} 
        onChange={(e, expanded) => setState({ ...state, active: expanded })}
        sx={{ 
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          borderRadius: '12px !important',
          boxShadow: 'none',
          mb: 2,
          '&:before': { display: 'none' },
          bgcolor: state.active ? 'rgba(16, 185, 129, 0.02)' : 'white'
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#059669' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Checkbox 
              checked={state.active} 
              onClick={(e) => e.stopPropagation()} 
              onChange={(e) => setState({ ...state, active: e.target.checked })} 
              sx={{ color: '#10b981', '&.Mui-checked': { color: '#059669' } }}
            />
            <Avatar src={existingData?.logoUrl} sx={{ width: 40, height: 40, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
              <BusinessIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>{defaultName}</Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {isExisting ? 'Existing Organization detected. Select to affiliate.' : 'Setup required.'}
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, px: 3, pb: 3 }}>
          {isExisting ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>Verified Details</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', gap: 1 }}><strong>Legal Name:</strong> {existingData.legalName}</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', gap: 1 }}><strong>Location:</strong> {existingData.isVirtual ? 'Virtual Entity' : `${existingData.state}, ${existingData.country}`}</Typography>
              </Box>
              <PremiumAutocomplete
                freeSolo
                label={`Role at ${defaultName}`}
                options={ROLES}
                value={state.role}
                onChange={(_, newValue) => setState({ ...state, role: typeof newValue === 'string' ? newValue : '' })}
                onInputChange={(_, newInputValue) => setState({ ...state, role: newInputValue })}
                colorTheme="#10b981"
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600, bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1.5, borderRadius: 2 }}>
                As the first admin, please establish the core profile for {defaultName}.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <PremiumTextField label="Full Legal Name" value={state.longName} onChange={(e: any) => setState({...state, longName: e.target.value})} fullWidth colorTheme="#10b981" required />
                <PremiumTextField label="Short Name" value={state.shortName} onChange={(e: any) => setState({...state, shortName: e.target.value})} fullWidth colorTheme="#10b981" required />
              </Box>
              
              {/* Note: In a real app we'd have another file uploader here for the logo. For brevity in this Modal, using a TextField for Logo URL, or we can use our existing hook. We'll leave it as TextField for now to keep the Modal simple. */}
              <PremiumTextField label="Logo URL (Optional)" value={state.logoUrl} onChange={(e: any) => setState({...state, logoUrl: e.target.value})} fullWidth colorTheme="#10b981" />
              
              <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <FormControlLabel
                  control={<Switch checked={state.isVirtual} onChange={(e) => setState({...state, isVirtual: e.target.checked})} color="success" />}
                  label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Virtual / Remote Organization</Typography>}
                  sx={{ mb: state.isVirtual ? 0 : 2 }}
                />
                
                {!state.isVirtual && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                      <PremiumTextField label="Country" value={state.country} onChange={(e: any) => setState({...state, country: e.target.value})} fullWidth colorTheme="#10b981" />
                      <PremiumTextField label="State/Province" value={state.state} onChange={(e: any) => setState({...state, state: e.target.value})} fullWidth colorTheme="#10b981" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                      <PremiumTextField label="LGA/County" value={state.lga} onChange={(e: any) => setState({...state, lga: e.target.value})} fullWidth colorTheme="#10b981" />
                      <PremiumTextField label="Street Address" value={state.address} onChange={(e: any) => setState({...state, address: e.target.value})} fullWidth colorTheme="#10b981" />
                    </Box>
                  </Box>
                )}
              </Box>

              <PremiumAutocomplete
                freeSolo
                label={`Your Initial Role at ${defaultName}`}
                options={ROLES}
                value={state.role}
                onChange={(_, newValue) => setState({ ...state, role: typeof newValue === 'string' ? newValue : '' })}
                onInputChange={(_, newInputValue) => setState({ ...state, role: newInputValue })}
                colorTheme="#10b981"
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Dialog 
      open={true} 
      maxWidth={false}
      fullWidth
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
          }
        },
        paper: {
          elevation: 0,
          sx: {
            bgcolor: 'rgba(255, 255, 255, 0.95) !important',
            backdropFilter: 'blur(24px)',
            backgroundImage: 'none !important',
            boxShadow: '0 32px 80px rgba(0,0,0,0.2) !important',
            border: '1px solid rgba(255, 255, 255, 0.4) !important',
            borderRadius: 8,
            width: { xs: '95vw', md: '80vw' },
            height: { xs: '95vh', md: '80vh' },
            maxHeight: 'none',
            maxWidth: 'none',
            m: { xs: 2, md: 0 },
            overflow: 'hidden',
          }
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        height: '100%',
      }}>
        
        {/* ========================================= */}
        {/* LEFT BANNER (Top on Mobile) */}
        {/* ========================================= */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: { xs: 'flex-start', md: 'center' },
          width: { xs: '100%', md: '45%' },
          height: { xs: 'auto', md: '100%' },
          position: 'relative',
          bgcolor: 'rgba(248, 250, 252, 0.6)',
          p: { xs: 3, md: 6 },
          textAlign: { xs: 'center', md: 'left' },
          borderRight: { xs: 'none', md: '1px solid rgba(0,0,0,0.05)' },
          borderBottom: { xs: '1px solid rgba(0,0,0,0.05)', md: 'none' }
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

          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box>
              <Box sx={{ display: 'inline-flex', p: { xs: 1, md: 1.5 }, borderRadius: '50%', background: 'white', mb: { xs: 1.5, md: 3 }, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)' }}>
                <AdminPanelSettingsIcon sx={{ fontSize: { xs: 28, md: 36 }, color: '#059669' }} />
              </Box>
              <Typography variant="h4" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#0f172a', mb: { xs: 1, md: 2 }, letterSpacing: '-0.02em', lineHeight: 1.1, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                Executive Clearance
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7, fontSize: '1.05rem', display: { xs: 'none', md: 'block' } }}>
                Welcome to the inner circle. We need to establish your core profile and organizational ties before you direct operations.
              </Typography>
            </Box>

            {/* Custom Step Indicator */}
            <Box sx={{ 
              mt: { xs: 2, md: 'auto' }, 
              mb: { xs: 0, md: 'auto' },
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              justifyContent: { xs: 'center', md: 'flex-start' },
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: { xs: 2, md: 4 }
            }}>
              {[ 
                { num: 1, label: 'Personal Base', desc: 'Identify your profile' },
                { num: 2, label: 'Affiliations', desc: 'Organizational ties' }
              ].map((s) => (
                <Box key={s.num} sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: step === s.num ? 1 : 0.4, transition: 'all 0.3s ease' }}>
                  <Box sx={{ 
                    width: { xs: 32, md: 48 }, height: { xs: 32, md: 48 }, 
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: step === s.num ? '#10b981' : (step > s.num ? '#059669' : 'transparent'),
                    border: step === s.num ? 'none' : '2px solid #cbd5e1',
                    color: step >= s.num ? 'white' : '#64748b',
                    fontWeight: 800, fontSize: { xs: '0.9rem', md: '1.2rem' },
                    boxShadow: step === s.num ? '0 8px 24px rgba(16, 185, 129, 0.4)' : 'none'
                  }}>
                    {step > s.num ? <CheckCircleOutlinedIcon fontSize="small" /> : s.num}
                  </Box>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: step === s.num ? '#0f172a' : '#64748b', lineHeight: 1.2 }}>{s.label}</Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>{s.desc}</Typography>
                  </Box>
                  {/* Mobile compact label */}
                  {step === s.num && (
                    <Typography variant="subtitle2" sx={{ display: { xs: 'block', md: 'none' }, fontWeight: 800, color: '#0f172a' }}>
                      {s.label}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ========================================= */}
        {/* RIGHT FORMS (Bottom on Mobile) */}
        {/* ========================================= */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', md: '55%' },
          height: '100%',
          overflowY: 'auto',
          bgcolor: 'transparent',
          p: { xs: 3, md: 6 },
        }}>
          {fetchingOrgs ? (
            <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
              <CircularProgress sx={{ color: '#10b981' }} />
              <Typography variant="body2" sx={{ color: '#64748b' }}>Establishing secure connection...</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>
                  {step === 1 && (
                    <Box component={motion.div} key="step1" custom={-1} variants={slideVariants} initial="hidden" animate="visible" exit="exit" sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Box 
                          component={motion.div}
                          whileHover={{ scale: 1.05 }}
                          sx={{ 
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            p: 1,
                            background: avatarUrl ? 'linear-gradient(135deg, #10b981, #3b82f6)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                            boxShadow: avatarUrl ? '0 12px 32px rgba(16, 185, 129, 0.4)' : '0 12px 32px rgba(0, 0, 0, 0.1)',
                            animation: !avatarUrl ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                              '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
                              '70%': { boxShadow: '0 0 0 15px rgba(16, 185, 129, 0)' },
                              '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
                            }
                          }}
                        >
                          <Avatar 
                            src={avatarUrl} 
                            sx={{ 
                              width: 140, height: 140, 
                              bgcolor: 'white', color: '#059669', fontSize: '3rem',
                              border: '4px solid white',
                              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {firstName ? firstName.charAt(0).toUpperCase() : <PhotoCameraIcon sx={{ fontSize: 48, opacity: 0.5 }} />}
                          </Avatar>
                          <Button 
                            component="label"
                            variant="contained"
                            startIcon={<PhotoCameraIcon />}
                            sx={{ 
                              position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)',
                              bgcolor: '#10b981', color: 'white',
                              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.4)',
                              borderRadius: 100, px: 3, py: 1, whiteSpace: 'nowrap',
                              fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase',
                              fontSize: '0.75rem', '&:hover': { bgcolor: '#059669', transform: 'translateX(-50%) translateY(-2px)' }
                            }}
                          >
                            Upload Profile
                            <input 
                              hidden accept="image/*" type="file" 
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  setAvatarFile(e.target.files[0]);
                                  setAvatarUrl(URL.createObjectURL(e.target.files[0]));
                                }
                              }}
                            />
                          </Button>
                        </Box>
                        {!avatarUrl && (
                          <Typography variant="caption" sx={{ mt: 3, color: '#ef4444', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            * Professional Headshot Highly Recommended *
                          </Typography>
                        )}
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
                    <Box component={motion.form} onSubmit={showConfirmation ? (e) => { e.preventDefault(); handleSubmit(); } : handleReviewClick} key="step2" custom={1} variants={slideVariants} initial="hidden" animate="visible" exit="exit" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body1" sx={{ color: '#0f172a', fontWeight: 800, mb: 0.5 }}>Organizational Ties</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                          Establish your placement within the ecosystem's anchors.
                        </Typography>
                      </Box>

                      {renderOrgAccordion('darkpore', 'Darkpore', darkpore, setDarkpore, existingOrgs.darkpore)}
                      {renderOrgAccordion('foodnerve', 'Food Nerve', foodnerve, setFoodnerve, existingOrgs.foodnerve)}

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
                          {darkpore.active && <Typography variant="body2" sx={{ color: '#334155' }}><strong>Darkpore Role:</strong> {darkpore.role}</Typography>}
                          {foodnerve.active && <Typography variant="body2" sx={{ color: '#334155' }}><strong>Food Nerve Role:</strong> {foodnerve.role}</Typography>}
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
                          type="submit" fullWidth variant="contained" disabled={loading || uploading}
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
            </>
          )}
        </Box>

      </Box>
    </Dialog>
  );
}
