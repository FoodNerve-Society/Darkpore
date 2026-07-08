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
  Checkbox,
  Tooltip,
  Alert
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import { useSociety } from '@/context/SocietyContext';
import { submitAdminOnboarding, getCoreOrganizations, getExecutiveProfile, AffiliationData } from '@/lib/actions/admin';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckIcon from '@mui/icons-material/Check';
import { alpha } from '@mui/material';
import { Country, State, City } from 'country-state-city';
import { useExportAsImage } from '@/components/ExportAsImage';
import { useParams } from 'next/navigation';
import ShareIcon from '@mui/icons-material/Share';
import ExecutiveCard from './ExecutiveCard';

const ROLES = [
  'Founder', 'Chief Executive Officer', 'Director', 'Head of Department',
  'Senior Manager', 'Manager', 'Lead', 'Specialist', 'Coordinator'
];

const DEPARTMENTS = [
  'Executive', 'Engineering', 'Product', 'Marketing', 'Sales', 
  'Operations', 'Finance', 'Human Resources', 'Legal', 'Design'
];

type OrgData = {
  active: boolean;
  department: string;
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
  department: '',
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

export default function AdminOnboardingModal({ 
  isEditMode = false, 
  open: openProp, 
  onClose 
}: { 
  isEditMode?: boolean; 
  open?: boolean; 
  onClose?: () => void; 
} = {}) {
  const { user, profile } = useSociety();
  const theme = useTheme();
  const params = useParams();
  const tenant = params?.tenant as string;
  const cardRef = React.useRef<HTMLDivElement>(null);
  const { exportAsImage, isExporting: isDownloading } = useExportAsImage();
  
  const [loading, setLoading] = useState(false);
  const [fetchingOrgs, setFetchingOrgs] = useState(true);
  const [submitError, setSubmitError] = useState<string>('');
  const [step, setStep] = useState(1);

  // Form State
  const errorRef = React.useRef<HTMLDivElement>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
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
  const [darkporeLogoFile, setDarkporeLogoFile] = useState<File | null>(null);
  const [foodnerveLogoFile, setFoodnerveLogoFile] = useState<File | null>(null);
  const [flippedBlockId, setFlippedBlockId] = useState<string | null>(null);
  
  // Existing Orgs pulled from DB
  const [existingOrgs, setExistingOrgs] = useState<{ darkpore: any; foodnerve: any }>({ darkpore: null, foodnerve: null });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cardTheme, setCardTheme] = useState(tenant === 'innovations' ? '#10b981' : '#0ea5e9');
  const [cardStyle, setCardStyle] = useState<'announcement' | 'membership'>('announcement');

  const PREFIX_OPTIONS = ['Dr.', 'Prof.', 'Engr.', 'Arch.', 'Pharm.', 'Rev.', 'Chief', 'Mr.', 'Mrs.', 'Ms.'];
  const SUFFIX_OPTIONS = ['PhD', 'MSc', 'BSc', 'MBA', 'CFA', 'Esq.', 'MD', 'DO', 'CPA'];
  const CARD_THEMES = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#0f172a'];

  // Trigger Logic
  const isPendingAdmin = profile?.isAdmin && profile?.currentRank < 5;
  const isModalOpen = openProp !== undefined ? openProp : isPendingAdmin;

  useEffect(() => {
    if (isModalOpen) {
      getCoreOrganizations().then((res) => {
        setExistingOrgs(res);
        setFetchingOrgs(false);
      });
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isEditMode && user?.uid && isModalOpen) {
      setLoading(true);
      getExecutiveProfile(user.uid).then((data) => {
        if (data) {
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatarUrl || '');
          
          try {
            if (data.prefixes) setPrefixes(JSON.parse(data.prefixes));
            if (data.suffixes) setSuffixes(JSON.parse(data.suffixes));
          } catch(e) {}

          const orgs = (data as any).organizationMembers || [];
          const dpOrg = orgs.find((o: any) => o.organization.slug === 'darkpore');
          const fnOrg = orgs.find((o: any) => o.organization.slug === 'foodnerve');

          if (dpOrg) {
            setDarkpore(prev => ({
              ...prev,
              active: true,
              role: dpOrg.role,
              department: dpOrg.department || '',
            }));
          }
          if (fnOrg) {
            setFoodnerve(prev => ({
              ...prev,
              active: true,
              role: fnOrg.role,
              department: fnOrg.department || '',
            }));
          }
        }
        setLoading(false);
      });
    }
  }, [isEditMode, user?.uid, isModalOpen]);

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

  if (!isModalOpen || !user) return null;

  const handleNextStep = () => {
    if (!firstName || !lastName || !bio || !avatarUrl) return;
    setStep(2);
  };

  const isOrgFilled = (state: OrgData, existingData: any) => {
    const isExisting = !!existingData;
    return state.active && (isExisting ? (state.role && state.department) : (state.role && state.department && state.longName && state.shortName && state.logoUrl));
  };

  const darkporeFilled = isOrgFilled(darkpore, existingOrgs?.darkpore);
  const foodnerveFilled = isOrgFilled(foodnerve, existingOrgs?.foodnerve);

  const handleReviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!darkpore.active && !foodnerve.active) {
      setSubmitError("You must affiliate with at least one organization.");
      return;
    }
    if (darkpore.active && !darkporeFilled) {
      setSubmitError("Please complete the required fields for Darkpore.");
      return;
    }
    if (foodnerve.active && !foodnerveFilled) {
      setSubmitError("Please complete the required fields for Food Nerve.");
      return;
    }
    setStep(3);
    setSubmitError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');
    setLoadingStep('Initializing secure connection...');
    try {
      let finalAvatarUrl = avatarUrl;
      
      if (avatarFile) {
        setLoadingStep('Uploading professional headshot...');
        const uploadResult = await uploadFile(avatarFile);
        if (uploadResult && uploadResult.secure_url) {
          finalAvatarUrl = uploadResult.secure_url;
        } else {
          throw new Error("Failed to upload profile picture.");
        }
      }
      
      let finalDarkpore = { ...darkpore };
      if (darkporeLogoFile) {
        setLoadingStep('Uploading Darkpore organization logo...');
        const uploadResult = await uploadFile(darkporeLogoFile);
        if (uploadResult && uploadResult.secure_url) {
          finalDarkpore.logoUrl = uploadResult.secure_url;
        } else {
          throw new Error("Failed to upload Darkpore logo.");
        }
      }
      
      let finalFoodnerve = { ...foodnerve };
      if (foodnerveLogoFile) {
        setLoadingStep('Uploading Food Nerve organization logo...');
        const uploadResult = await uploadFile(foodnerveLogoFile);
        if (uploadResult && uploadResult.secure_url) {
          finalFoodnerve.logoUrl = uploadResult.secure_url;
        } else {
          throw new Error("Failed to upload Food Nerve logo.");
        }
      }

      setLoadingStep('Finalizing profile and organization affiliations in database...');
      await submitAdminOnboarding(user.uid, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        prefixes,
        suffixes,
        bio,
        avatarUrl: finalAvatarUrl,
        darkpore: finalDarkpore,
        foodnerve: finalFoodnerve,
      });
      setLoadingStep('Success! Entering dashboard...');
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
      setLoadingStep('');
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const slideVariants: import('framer-motion').Variants = {
    hidden: (direction: number) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
    visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: (direction: number) => ({ x: direction < 0 ? 30 : -30, opacity: 0, transition: { duration: 0.3, ease: "easeIn" as const } })
  };

  const renderOrgBlock = (key: 'darkpore' | 'foodnerve', defaultName: string, state: OrgData, setState: React.Dispatch<React.SetStateAction<OrgData>>, existingData: any, logoFile: File | null, setLogoFile: React.Dispatch<React.SetStateAction<File | null>>, color: string) => {
    const isExisting = !!existingData;
    const isFlipped = flippedBlockId === key;
    const filled = isOrgFilled(state, existingData);
    const fillPercent = filled ? 100 : (state.active ? 50 : 0);

    const countries = Country.getAllCountries();
    const selectedCountry = countries.find(c => c.name === state.country);
    const states = selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode) : [];
    const selectedState = states.find(s => s.name === state.state);
    const lgas = selectedCountry && selectedState ? City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode) : [];

    return (
      <Box sx={{ perspective: '1600px', mb: 2.5 }}>
        <Box sx={{
          position: 'relative',
          transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          transform: isFlipped ? 'rotateX(-180deg)' : 'none',
        }}>
          
          {/* FRONT FACE */}
          <Box
            onClick={() => !isFlipped && setFlippedBlockId(key)}
            sx={{
              backfaceVisibility: 'hidden',
              position: isFlipped ? 'absolute' : 'relative',
              width: '100%', top: 0,
              borderRadius: '20px',
              border: `1px solid ${filled ? alpha(color, 0.8) : alpha(color, 0.15)}`,
              background: filled 
                ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`
                : `linear-gradient(to right, ${alpha(color, 0.2)} ${fillPercent}%, rgba(255,255,255,0.95) ${fillPercent}%, rgba(248,250,252,0.9) 100%)`,
              backdropFilter: 'blur(16px)',
              boxShadow: filled ? `0 12px 32px ${alpha(color, 0.3)}` : `0 8px 32px rgba(0,0,0,0.04)`,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              '&:hover': {
                borderColor: filled ? color : alpha(color, 0.6),
                boxShadow: filled ? `0 16px 48px ${alpha(color, 0.4)}` : `0 12px 48px rgba(0,0,0,0.08)`,
                transform: 'translateY(-2px)'
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: filled ? 0 : 6, flexShrink: 0, background: filled ? `transparent` : `linear-gradient(180deg, ${alpha(color, 0.4)} 0%, ${alpha(color, 0.1)} 100%)` }} />
              
              <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: '14px', flexShrink: 0,
                  bgcolor: filled ? 'rgba(255,255,255,0.2)' : alpha(color, 0.1), 
                  border: filled ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${alpha(color, 0.2)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: filled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                }}>
                  <Avatar src={state.logoUrl || existingData?.logoUrl} sx={{ width: 40, height: 40, bgcolor: 'transparent', color: filled ? '#fff' : color }}>
                    <BusinessIcon />
                  </Avatar>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 800, color: filled ? '#fff' : '#0f172a', fontSize: { xs: '1.1rem', md: '1.25rem' }, letterSpacing: '-0.01em' }}>
                      {defaultName}
                    </Typography>
                    <Box sx={{ px: 1, py: 0.5, borderRadius: '12px', fontSize: '0.7rem', bgcolor: filled ? 'rgba(255,255,255,0.2)' : alpha(color, 0.15), color: filled ? '#fff' : color, fontWeight: 700, border: `1px solid ${filled ? 'rgba(255,255,255,0.3)' : alpha(color, 0.2)}` }}>
                      {state.active ? (filled ? "Completed" : "Incomplete") : "Click to Configure"}
                    </Box>
                  </Box>
                  <Typography sx={{ color: filled ? 'rgba(255,255,255,0.8)' : '#64748b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {filled ? `${state.role} • ${state.department}` : (isExisting ? 'Existing Organization. Setup required.' : 'New Organization. Core profile required.')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* BACK FACE */}
          <Box sx={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
            position: isFlipped ? 'relative' : 'absolute',
            width: '100%', top: 0,
            borderRadius: '20px',
            border: `1px solid ${alpha(color, 0.4)}`,
            background: `linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.95) 100%)`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 16px 48px rgba(0,0,0,0.08)`,
            overflow: 'hidden',
          }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 2,
              px: 3, py: 2,
              borderBottom: `1px solid rgba(0,0,0,0.06)`,
              background: alpha(color, 0.05),
            }}>
              <FormControlLabel
                control={<Switch size="medium" checked={state.active} onChange={(e) => setState({ ...state, active: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: color } }} />}
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Enable Affiliation</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Include {defaultName} in your profile</Typography>
                  </Box>
                }
                sx={{ flex: 1, m: 0 }}
              />
              <Tooltip title="Done editing">
                <IconButton
                  size="medium"
                  onClick={() => setFlippedBlockId(null)}
                  sx={{
                    bgcolor: color, color: '#fff',
                    boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
                    '&:hover': { bgcolor: alpha(color, 0.9), transform: 'scale(1.05)' },
                  }}
                >
                  <CheckIcon sx={{ fontSize: 20, fontWeight: 900 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, opacity: state.active ? 1 : 0.5, pointerEvents: state.active ? 'auto' : 'none' }}>
              {isExisting ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>Verified Details</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', gap: 1 }}><strong>Legal Name:</strong> {existingData.legalName}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', gap: 1 }}><strong>Location:</strong> {existingData.isVirtual ? 'Virtual Entity' : `${existingData.state}, ${existingData.country}`}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ flex: 1 }}>
                      <PremiumAutocomplete
                        freeSolo
                        label={`Department`}
                        options={DEPARTMENTS}
                        value={state.department}
                        onChange={(_, newValue) => setState({ ...state, department: typeof newValue === 'string' ? newValue : '' })}
                        onInputChange={(_, newInputValue) => setState({ ...state, department: newInputValue })}
                        colorTheme={color}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <PremiumAutocomplete
                        freeSolo
                        label={`Role at ${defaultName}`}
                        options={ROLES}
                        value={state.role}
                        onChange={(_, newValue) => setState({ ...state, role: typeof newValue === 'string' ? newValue : '' })}
                        onInputChange={(_, newInputValue) => setState({ ...state, role: newInputValue })}
                        colorTheme={color}
                      />
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="body2" sx={{ color: color, fontWeight: 600, bgcolor: alpha(color, 0.1), p: 1.5, borderRadius: 2 }}>
                    As the first admin, please establish the core profile for {defaultName}.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(color, 0.1), color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>1</Box>
                    <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                      Organization Details
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ flex: 1 }}>
                      <PremiumTextField label="Organization Full Legal Name" value={state.longName} onChange={(e: any) => setState({...state, longName: e.target.value})} fullWidth colorTheme={color} required={state.active} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <PremiumTextField label="Short Name" value={state.shortName} onChange={(e: any) => setState({...state, shortName: e.target.value})} fullWidth colorTheme={color} required={state.active} />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b' }}>Organization Logo (Required) *</Typography>
                    <Box component="label" sx={{ 
                        borderRadius: '16px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.02)', 
                        border: '2px dashed', borderColor: state.logoUrl ? 'transparent' : 'rgba(0,0,0,0.15)', 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                        minHeight: 120, cursor: 'pointer', position: 'relative', 
                        transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
                    }}>
                        <input type="file" hidden accept="image/*" onChange={(e) => {
                            if (e.target.files?.[0]) {
                                const file = e.target.files[0];
                                setLogoFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setState(prev => ({...prev, logoUrl: reader.result as string}));
                                };
                                reader.readAsDataURL(file);
                            }
                        }} />
                        {state.logoUrl ? (
                            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                                <img src={state.logoUrl} alt="Logo preview" style={{ width: '100%', height: 120, objectFit: 'contain', padding: '8px' }} />
                                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { opacity: 1 } }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Change Logo</Typography>
                                </Box>
                            </Box>
                        ) : (
                            <>
                                <CloudUploadIcon sx={{ fontSize: 32, color: 'rgba(0,0,0,0.2)', mb: 1 }} />
                                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Click to upload logo</Typography>
                            </>
                        )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={<Switch checked={state.isVirtual} onChange={(e) => setState({...state, isVirtual: e.target.checked})} color="success" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: color }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: color } }} />}
                      label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Virtual / Remote Organization</Typography>}
                      sx={{ mb: 0 }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                      <Box sx={{ flex: 1 }}>
                        <PremiumAutocomplete 
                          label="Country" 
                          options={countries.map(c => c.name)} 
                          value={state.country || ''} 
                          onChange={(_, v) => setState({...state, country: typeof v === 'string' ? v : '', state: '', lga: ''})} 
                          colorTheme={color} 
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <PremiumAutocomplete 
                          label="State/Province" 
                          options={states.map(s => s.name)} 
                          value={state.state || ''} 
                          onChange={(_, v) => setState({...state, state: typeof v === 'string' ? v : '', lga: ''})} 
                          colorTheme={color} 
                          disabled={!state.country}
                        />
                      </Box>
                    </Box>
                    
                    {!state.isVirtual && (
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <Box sx={{ flex: 1 }}>
                          <PremiumAutocomplete 
                            label="LGA/County/City" 
                            options={lgas.map(l => l.name)} 
                            value={state.lga || ''} 
                            onChange={(_, v) => setState({...state, lga: typeof v === 'string' ? v : ''})} 
                            colorTheme={color} 
                            disabled={!state.state}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <PremiumTextField label="Street Address" value={state.address} onChange={(e: any) => setState({...state, address: e.target.value})} fullWidth colorTheme={color} />
                        </Box>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(color, 0.1), color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>2</Box>
                    <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                      Your Affiliation Details
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ flex: 1 }}>
                      <PremiumAutocomplete
                        freeSolo
                        label={`Department`}
                        options={DEPARTMENTS}
                        value={state.department}
                        onChange={(_, newValue) => setState({ ...state, department: typeof newValue === 'string' ? newValue : '' })}
                        onInputChange={(_, newInputValue) => setState({ ...state, department: newInputValue })}
                        colorTheme={color}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <PremiumAutocomplete
                        freeSolo
                        label={`Initial Role`}
                        options={ROLES}
                        value={state.role}
                        onChange={(_, newValue) => setState({ ...state, role: typeof newValue === 'string' ? newValue : '' })}
                        onInputChange={(_, newInputValue) => setState({ ...state, role: newInputValue })}
                        colorTheme={color}
                      />
                    </Box>
                  </Box>


                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog 
      open={isModalOpen} 
      onClose={() => { if (isEditMode && onClose) onClose(); }}
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
        {isEditMode && (
          <IconButton 
            onClick={onClose} 
            sx={{ position: 'absolute', top: 16, right: 16, zIndex: 100, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
          >
            <Box sx={{ transform: 'rotate(45deg)', fontSize: 24, lineHeight: 1 }}>+</Box>
          </IconButton>
        )}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: { xs: 'flex-start', md: 'center' },
          width: { xs: '100%', md: '30%' },
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
                { num: 2, label: 'Affiliations', desc: 'Organizational ties' },
                { num: 3, label: 'Review Details', desc: 'Confirm profile details' }
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
          width: { xs: '100%', md: '70%' },
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b' }}>Professional Headshot (Required) *</Typography>
                        <Box component="label" sx={{ 
                            borderRadius: '16px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.02)', 
                            border: '2px dashed', borderColor: avatarUrl ? 'transparent' : 'rgba(0,0,0,0.15)', 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                            minHeight: 160, cursor: 'pointer', position: 'relative', 
                            transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: 'rgba(16, 185, 129, 0.4)' } 
                        }}>
                            <input type="file" hidden accept="image/*" onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    setAvatarFile(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setAvatarUrl(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }} />
                            {avatarUrl ? (
                                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <img src={avatarUrl} alt="Profile preview" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { opacity: 1 } }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Change Photo</Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <PhotoCameraIcon sx={{ fontSize: 40, color: 'rgba(16, 185, 129, 0.5)', mb: 1 }} />
                                    <Typography sx={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 700 }}>Click to upload profile picture</Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5 }}>JPEG, PNG, or WebP (Max 5MB)</Typography>
                                </>
                            )}
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

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          variant="contained"
                          onClick={handleNextStep}
                          disabled={!firstName.trim() || !lastName.trim() || !bio.trim() || !avatarUrl}
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            py: 1.5, px: 5, borderRadius: 3, fontWeight: 800, fontSize: '0.95rem',
                            letterSpacing: '0.5px', color: 'white',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                            textTransform: 'uppercase', transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.4)' },
                            '&.Mui-disabled': { background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.25)', boxShadow: 'none' }
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
                        <Alert severity="info" sx={{ mt: 2, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
                          You must belong to and complete the required fields for at least one organization to proceed.
                        </Alert>
                      </Box>

                      {renderOrgBlock('darkpore', 'Darkpore', darkpore, setDarkpore, existingOrgs.darkpore, darkporeLogoFile, setDarkporeLogoFile, '#0ea5e9')}
                      {renderOrgBlock('foodnerve', 'Food Nerve', foodnerve, setFoodnerve, existingOrgs.foodnerve, foodnerveLogoFile, setFoodnerveLogoFile, '#10b981')}

                      {submitError && (
                        <Box ref={errorRef} sx={{ mt: 2, scrollMarginTop: '20px' }}>
                          <Alert severity="error" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
                            {submitError}
                          </Alert>
                        </Box>
                      )}

                      {loadingStep && loading && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#10b981', 0.05), border: '1px solid', borderColor: alpha('#10b981', 0.2), borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={20} sx={{ color: '#10b981' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>{loadingStep}</Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          onClick={() => setStep(1)} 
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
                          type="submit" fullWidth variant="contained" 
                          disabled={loading || uploading || (!darkpore.active && !foodnerve.active) || (darkpore.active && !darkporeFilled) || (foodnerve.active && !foodnerveFilled)}
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
                          Review Details
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {step === 3 && (
                    <Box component={motion.form} onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSubmit(); }} key="step3" custom={1} variants={slideVariants} initial="hidden" animate="visible" exit="exit" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body1" sx={{ color: '#0f172a', fontWeight: 800, mb: 0.5 }}>Final Review</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                          Confirm your executive profile details before deployment.
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, textAlign: 'center', mb: 1.5, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem' }}>
                          Select Card Type
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                          <Button 
                            variant={cardStyle === 'announcement' ? 'contained' : 'outlined'} 
                            onClick={() => setCardStyle('announcement')}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 3, bgcolor: cardStyle === 'announcement' ? '#0f172a' : 'transparent', color: cardStyle === 'announcement' ? '#fff' : '#475569', borderColor: '#cbd5e1' }}
                          >
                            New Role Announcement
                          </Button>
                          <Button 
                            variant={cardStyle === 'membership' ? 'contained' : 'outlined'} 
                            onClick={() => setCardStyle('membership')}
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 3, bgcolor: cardStyle === 'membership' ? '#0f172a' : 'transparent', color: cardStyle === 'membership' ? '#fff' : '#475569', borderColor: '#cbd5e1' }}
                          >
                            Official Membership
                          </Button>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, textAlign: 'center', mb: 1.5, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem' }}>
                          Select Card Theme
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                          {CARD_THEMES.map(t => (
                            <Box 
                              key={t} 
                              onClick={() => setCardTheme(t)}
                              sx={{ 
                                width: 32, height: 32, borderRadius: '50%', bgcolor: t, cursor: 'pointer',
                                border: cardTheme === t ? '3px solid #fff' : '2px solid transparent',
                                boxShadow: cardTheme === t ? `0 0 0 2px ${t}` : '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease',
                                '&:hover': { transform: 'scale(1.1)' }
                              }} 
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <ExecutiveCard 
                          ref={cardRef}
                          cardTheme={cardTheme}
                          cardStyle={cardStyle}
                          prefixes={prefixes}
                          firstName={firstName}
                          lastName={lastName}
                          suffixes={suffixes}
                          avatarUrl={avatarUrl}
                          darkpore={darkpore}
                          foodnerve={foodnerve}
                        />
                      </Box>

                      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          disabled={isDownloading}
                          onClick={() => exportAsImage(cardRef.current, `${firstName}-Announcement`)}
                          startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <ShareIcon />}
                          sx={{
                            bgcolor: cardTheme,
                            color: '#fff',
                            py: 1.5,
                            px: 4,
                              borderRadius: 4,
                              fontWeight: 800,
                              textTransform: 'none',
                              fontSize: '1rem',
                              boxShadow: `0 8px 24px ${alpha(cardTheme, 0.4)}`,
                              '&:hover': {
                                bgcolor: cardTheme,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 12px 28px ${alpha(cardTheme, 0.6)}`
                              }
                            }}
                          >
                            {isDownloading ? 'Generating High-Res Image...' : 'Download & Share Card'}
                          </Button>
                        </Box>

                        {submitError && (
                          <Box ref={errorRef} sx={{ mt: 2, scrollMarginTop: '20px' }}>
                            <Alert severity="error" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
                              {submitError}
                            </Alert>
                          </Box>
                        )}

                        {loadingStep && loading && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#10b981', 0.05), border: '1px solid', borderColor: alpha('#10b981', 0.2), borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={20} sx={{ color: '#10b981' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>{loadingStep}</Typography>
                          </Box>
                        )}

                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          onClick={() => setStep(2)} 
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
                          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Finalize Profile'}
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
