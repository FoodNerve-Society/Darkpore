'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogContent, Grid, alpha, IconButton, Alert, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumCard from '@/components/PremiumCard';
import PremiumButton from '@/components/PremiumButton';
import PremiumChip from '@/components/PremiumChip';
import PremiumTextField from '@/components/PremiumTextField';
import { UserRole, Challenge } from '@/context/SocietyContext';
import { auth } from '@/lib/firebase/client';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  profile?: any;
}

const FEATURE_OPTIONS: { id: string; title: string; desc: string; icon: string; color: string }[] = [
  { id: 'trade', title: 'Trade', desc: 'Marketplace, commerce, and exchange.', icon: '🤝', color: '#3b82f6' },
  { id: 'meet', title: 'Meet', desc: 'Connect, network, and chat globally.', icon: '👥', color: '#8b5cf6' },
  { id: 'learn', title: 'Learn', desc: 'Courses, resources, and knowledge.', icon: '🎓', color: '#10b981' },
  { id: 'support', title: 'Support', desc: 'Grants, loans, and investments.', icon: '💰', color: '#f59e0b' },
  { id: 'updates', title: 'Updates', desc: 'News, feeds, and announcements.', icon: '📰', color: '#ef4444' },
  { id: 'profile', title: 'Profile', desc: 'Personal brand and settings.', icon: '⚙️', color: '#64748b' },
];

export default function OnboardingWizard({ open, onComplete, profile }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedPrimaryFeature, setSelectedPrimaryFeature] = useState<string | null>(null);
  const [rankedFeatures, setRankedFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const CORE_FEATURES = FEATURE_OPTIONS.filter(f => ['trade', 'meet', 'learn', 'support'].includes(f.id));

  // Pre-fill Step 2 so if the primary feature is a core feature, it gets locked at #1
  React.useEffect(() => {
    if (step === 2 && rankedFeatures.length === 0 && selectedPrimaryFeature) {
      if (['trade', 'meet', 'learn', 'support'].includes(selectedPrimaryFeature)) {
        setRankedFeatures([selectedPrimaryFeature]);
      }
    }
  }, [step, selectedPrimaryFeature, rankedFeatures.length]);

  const addFeatureRank = (id: string) => {
    if (!rankedFeatures.includes(id) && rankedFeatures.length < 4) {
      setRankedFeatures([...rankedFeatures, id]);
    }
  };

  const removeFeatureRank = (id: string) => {
    // Only prevent removing if it was the selected primary feature AND it is a core feature
    if (id !== selectedPrimaryFeature) {
      setRankedFeatures(rankedFeatures.filter(f => f !== id));
    }
  };

  const [displayName, setDisplayName] = useState('');

  // Sync displayName when profile is provided
  React.useEffect(() => {
    if (profile?.name && !displayName) {
      setDisplayName(profile.name);
    }
  }, [profile, displayName]);

  const handleSubmit = async () => {
    if (!selectedPrimaryFeature || rankedFeatures.length < 4 || !displayName.trim()) return;
    
    const user = auth.currentUser;
    if (!user) return;

    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/user/onboard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          landingPage: selectedPrimaryFeature,
          tabOrder: rankedFeatures,
          name: displayName.trim(),
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Failed to save onboarding data. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: { xs: 2, md: 4 }
          }
        }
      }}
    >
      <Box sx={{ width: '100%', position: 'relative' }}>
        
        {/* Step Indicator */}
        <Box sx={{ display: 'flex', gap: 1, mb: 4, justifyContent: 'center' }}>
          <Box sx={{ width: 40, height: 6, borderRadius: 3, bgcolor: step >= 1 ? '#10b981' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
          <Box sx={{ width: 40, height: 6, borderRadius: 3, bgcolor: step >= 2 ? '#10b981' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
        </Box>

        {step === 1 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, textAlign: 'center', fontFamily: 'var(--font-dosis)', letterSpacing: '-0.02em', color: 'text.primary' }}>
              Make the Society Yours
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 6, fontSize: '1.05rem' }}>
              Tap to select the primary feature you want to experience first.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              {FEATURE_OPTIONS.map((feature) => (
                <Box key={feature.id}>
                  <PremiumCard
                    variant="interactive"
                    onClick={() => {
                      if (selectedPrimaryFeature !== feature.id) {
                        setSelectedPrimaryFeature(feature.id);
                        setRankedFeatures([]);
                      }
                    }}
                    sx={{ 
                      p: 2.5, 
                      cursor: 'pointer',
                      borderRadius: 4, 
                      border: selectedPrimaryFeature === feature.id ? `2px solid ${feature.color}` : '1px solid rgba(0,0,0,0.1)',
                      bgcolor: selectedPrimaryFeature === feature.id ? alpha(feature.color, 0.1) : 'background.paper',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ fontSize: '2rem' }}>{feature.icon}</Box>
                      {selectedPrimaryFeature === feature.id ? (
                        <RadioButtonCheckedIcon sx={{ color: feature.color }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} />
                      )}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>{feature.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{feature.desc}</Typography>
                  </PremiumCard>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
              <PremiumButton 
                variant="filled" 
                baseColor="#10b981" 
                size="large"
                disabled={!selectedPrimaryFeature}
                onClick={() => setStep(2)}
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 6, py: 1.5, fontSize: '1.1rem', fontWeight: 800, borderRadius: 100 }}
              >
                Continue
              </PremiumButton>
            </Box>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, textAlign: 'center', fontFamily: 'var(--font-dosis)', letterSpacing: '-0.02em', color: 'text.primary' }}>
              Arrange Your Priorities
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 4, fontSize: '1.05rem' }}>
              {selectedPrimaryFeature && ['trade', 'meet', 'learn', 'support'].includes(selectedPrimaryFeature)
                ? 'Your primary feature is locked at #1. Tap the remaining features to build your list in order of priority.'
                : 'Tap the features below to build your navigation in order of priority.'}
            </Typography>

            <Alert severity="info" sx={{ mb: 6, borderRadius: 3, maxWidth: 500, mx: 'auto' }}>
              The feature you arrange in position 2 will appear second on your dashboard, and so on.
            </Alert>

            {/* AVAILABLE FEATURES TO TAP */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                Available to Arrange
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <AnimatePresence>
                  {CORE_FEATURES.filter(f => !rankedFeatures.includes(f.id)).map(feature => (
                    <motion.div 
                      key={feature.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    >
                      <PremiumChip
                        label={`${feature.icon} ${feature.title}`}
                        onClick={() => addFeatureRank(feature.id)}
                        sx={{ 
                          fontSize: '1rem', 
                          py: 2.5, px: 2, 
                          borderRadius: 3, 
                          bgcolor: 'background.paper',
                          border: `1px solid ${alpha(feature.color, 0.3)}`,
                          color: 'text.primary',
                          fontWeight: 700,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: alpha(feature.color, 0.1), transform: 'scale(1.05)' }
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {CORE_FEATURES.filter(f => !rankedFeatures.includes(f.id)).length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700, fontStyle: 'italic' }}>
                      All features arranged! You're ready.
                    </Typography>
                  </motion.div>
                )}
              </Box>
            </Box>

            {/* THE RANKED LIST */}
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
              Your Arrangement
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 500, mb: 4 }}>
              {Array.from({ length: 4 }).map((_, index) => {
                const featureId = rankedFeatures[index];
                const feature = featureId ? FEATURE_OPTIONS.find(f => f.id === featureId)! : null;
                const rankIndex = index + 1;
                
                return (
                  <motion.div key={`rank-${index}`} layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                    <PremiumCard
                      variant="standard"
                      sx={{ 
                        py: 1.5, px: 2, 
                        borderRadius: 3, 
                        border: feature ? `1px solid ${alpha(feature.color, 0.2)}` : '1px dashed rgba(0,0,0,0.1)',
                        bgcolor: feature ? alpha(feature.color, 0.05) : 'rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: feature ? 1 : 0.6
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <Box sx={{ 
                           width: 32, height: 32, borderRadius: '50%', 
                           bgcolor: feature ? feature.color : 'rgba(0,0,0,0.1)', color: 'white', 
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           fontSize: '0.9rem', fontWeight: 900,
                           boxShadow: feature ? `0 4px 12px ${alpha(feature.color, 0.4)}` : 'none'
                         }}>
                           {rankIndex}
                         </Box>
                         
                         {feature ? (
                           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                               <Box sx={{ fontSize: '1.2rem' }}>{feature.icon}</Box>
                               <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', m: 0 }}>{feature.title}</Typography>
                             </Box>
                           </motion.div>
                         ) : (
                           <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                             Tap a feature above to assign rank #{rankIndex}
                           </Typography>
                         )}
                      </Box>
                      
                      {feature && (
                        <Box>
                          {index === 0 && ['trade', 'meet', 'learn', 'support'].includes(selectedPrimaryFeature || '') ? (
                            <Box sx={{ px: 1, py: 0.5, color: 'text.disabled' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800 }}>LOCKED</Typography>
                            </Box>
                          ) : (
                            <Button 
                              size="small" 
                              color="error"
                              onClick={() => removeFeatureRank(feature.id)}
                              sx={{ minWidth: 0, p: 0.5, fontWeight: 700, borderRadius: 2 }}
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      )}
                    </PremiumCard>
                  </motion.div>
                );
              })}
            </Box>

            {submitError && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 3, maxWidth: 500, mx: 'auto' }}>
                {submitError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <PremiumButton 
                variant="outlined" 
                onClick={() => setStep(1)}
                sx={{ px: 4, py: 1.5, fontWeight: 700, borderRadius: 100 }}
              >
                Back
              </PremiumButton>
              <PremiumButton 
                variant="filled" 
                baseColor="#10b981" 
                size="large"
                disabled={rankedFeatures.length < 4}
                onClick={() => setStep(3)}
                sx={{ px: 6, py: 1.5, fontSize: '1.1rem', fontWeight: 800, borderRadius: 100 }}
              >
                Next Step
              </PremiumButton>
            </Box>
          </Box>
        )}

        {step === 3 && (
          <Box component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 2 }}>
                Just one more thing...
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                What should we call you? Your name helps us personalize your experience.
              </Typography>
            </Box>

            <Box sx={{ maxWidth: 400, mx: 'auto', mb: 6 }}>
              <PremiumTextField
                label="Your Full Name"
                value={displayName}
                onChange={(e: any) => setDisplayName(e.target.value)}
                placeholder="e.g. John Doe"
                colorTheme="#10b981"
                required
              />
            </Box>

            {submitError && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 3, maxWidth: 500, mx: 'auto' }}>
                {submitError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <PremiumButton 
                variant="outlined" 
                onClick={() => setStep(2)}
                sx={{ px: 4, py: 1.5, fontWeight: 700, borderRadius: 100 }}
              >
                Back
              </PremiumButton>
              <PremiumButton 
                variant="filled" 
                baseColor="#10b981" 
                size="large"
                disabled={!displayName.trim() || isSubmitting}
                onClick={handleSubmit}
                sx={{ px: 6, py: 1.5, fontSize: '1.1rem', fontWeight: 800, borderRadius: 100 }}
              >
                {isSubmitting ? 'Finalizing...' : 'Complete Experience'}
              </PremiumButton>
            </Box>
          </Box>
        )}

      </Box>
    </Dialog>
  );
}
