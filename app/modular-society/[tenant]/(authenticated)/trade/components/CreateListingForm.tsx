// @ts-nocheck
"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  alpha,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from "@mui/material";

import { useRouter } from "next/navigation";
import {
  useSociety,
  checkGatekeeper,
  RANK_NAMES,
  RANK_COLORS,
  type RankLevel,
} from "@/context/SocietyContext";
import { createTradeListing } from "@/lib/actions/trade";

import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/Shield";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import StarIcon from "@mui/icons-material/Star";

// ── Constants ──────────────────────────────────────────────
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";

// ── Glassmorphism Base ──────────────────────────────────────
const glassCard = {
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
};

const SECTORS = [
  "Primary Production (Farming)",
  "Processing & Manufacturing",
  "Logistics & Supply Chain",
  "Agritech & Software",
  "Research & Development",
  "Retail & Market Access",
  "Other"
];

const EXPERIENCE_LEVELS = ["Entry Level", "Mid-Level", "Senior", "Executive"];
const COMPENSATION_TYPES = ["Fiat (NGN)", "Nerve Points (NP)", "Equity / Profit-Share", "Unpaid / Volunteer"];

interface CreateListingFormProps {
  initialCategory?: string;
  initialSelections?: { primary: string, secondary: string, tertiary?: string } | null;
  onCancel: () => void;
  onSuccess: () => void;
  postingAs?: 'personal' | 'organization';
  selectedOrgId?: string | null;
}

export default function CreateListingForm({ initialCategory = "", initialSelections = null, onCancel, onSuccess, postingAs = 'personal', selectedOrgId = null }: CreateListingFormProps) {
  const { profile } = useSociety();
  const router = useRouter();

  const isJob = initialCategory === "jobs";
  const isVolunteer = initialSelections?.primary === "volunteer";

  // Dynamic Steps
  const STEPS = isJob 
    ? ["Role & Location", "Compensation & Details", "Media"]
    : ["Item & Location", "Pricing & Details", "Media"];

  const [activeStep, setActiveStep] = useState(0);
  
  // Shared Form State
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [lga, setLga] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Jobs Specific State
  const [sector, setSector] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [compType, setCompType] = useState(isVolunteer ? "Nerve Points (NP)" : "Fiat (NGN)");
  const [useEscrow, setUseEscrow] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!profile) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ color: "text.secondary" }}>Loading...</Typography>
      </Box>
    );
  }

  const gate = checkGatekeeper(profile, 2);

  if (gate && !gate.allowed) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: "auto" }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onCancel} sx={{ mb: 3, color: "text.secondary", fontWeight: 700, textTransform: "none" }}>
            Close ✕
          </Button>
        </Box>
        <Paper elevation={0} sx={{ ...glassCard, p: { xs: 4, md: 5 }, textAlign: "center", position: "relative", overflow: "hidden", bgcolor: "#000", color: "#fff" }}>
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "linear-gradient(90deg, #10b981 0%, #3b82f6 33%, #8b5cf6 66%, #f59e0b 100%)" }} />
          <Box sx={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${alpha(EMERALD, 0.2)} 0%, transparent 70%)`, pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${alpha("#8b5cf6", 0.2)} 0%, transparent 70%)`, pointerEvents: "none" }} />
          <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: alpha("#f59e0b", 0.2), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3, border: `2px solid ${alpha("#f59e0b", 0.4)}` }}>
            <LockIcon sx={{ fontSize: 36, color: "#f59e0b" }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: "1.5rem", md: "1.8rem" }, background: `linear-gradient(135deg, ${EMERALD} 0%, #3b82f6 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Premium Upgrade Prompt
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3, maxWidth: 400, mx: "auto", lineHeight: 1.7 }}>
            {gate.message} Complete your profile to unlock premium features and the marketplace.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", alignItems: "center", mb: 4, flexWrap: "wrap" }}>
            <Chip icon={<ShieldIcon sx={{ fontSize: "15px !important", color: `${RANK_COLORS[gate.currentRank as RankLevel]} !important` }} />} label={`Current: ${RANK_NAMES[gate.currentRank as RankLevel]}`} sx={{ fontWeight: 700, fontSize: "0.82rem", height: 36, bgcolor: alpha(RANK_COLORS[gate.currentRank as RankLevel], 0.15), color: RANK_COLORS[gate.currentRank as RankLevel], border: `1px solid ${alpha(RANK_COLORS[gate.currentRank as RankLevel], 0.3)}` }} />
            <Typography variant="h6" sx={{ color: "text.disabled", fontSize: "1.2rem" }}>→</Typography>
            <Chip icon={<StarIcon sx={{ fontSize: "15px !important", color: `${RANK_COLORS[gate.requiredRank as RankLevel]} !important` }} />} label={`Needed: ${RANK_NAMES[gate.requiredRank as RankLevel]}`} sx={{ fontWeight: 700, fontSize: "0.82rem", height: 36, bgcolor: alpha(RANK_COLORS[gate.requiredRank as RankLevel], 0.15), color: RANK_COLORS[gate.requiredRank as RankLevel], border: `1px solid ${alpha(RANK_COLORS[gate.requiredRank as RankLevel], 0.3)}` }} />
          </Box>
          <Button variant="contained" fullWidth onClick={() => router.push(gate.upgradeRoute || "/profile/setup")} sx={{ background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`, color: "#ffffff", fontWeight: 800, fontSize: "1rem", py: 1.8, borderRadius: "16px", textTransform: "none", boxShadow: `0 6px 24px ${alpha(EMERALD, 0.35)}`, "&:hover": { background: `linear-gradient(135deg, ${EMERALD_DARK} 0%, #047857 100%)` } }}>
            Upgrade Now
          </Button>
        </Paper>
      </Box>
    );
  }

  const isStepValid = (step: number): boolean => {
    if (isJob) {
      switch (step) {
        case 0: return title.trim().length >= 5 && location.trim().length > 0 && sector.length > 0;
        case 1: return description.trim().length >= 10 && price.trim().length > 0;
        case 2: return true;
        default: return false;
      }
    } else {
      switch (step) {
        case 0: return title.trim().length >= 5 && location.trim().length > 0;
        case 1: return price.trim().length > 0 && description.trim().length >= 10;
        case 2: return true;
        default: return false;
      }
    }
  };

  const handleNext = () => {
    if (activeStep === STEPS.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) onCancel();
    else setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Structure metadata based on listing type
    const metadata = isJob ? {
      sector,
      experienceLevel,
      compType,
      useEscrow,
      commitment: initialSelections?.primary,
      workModel: initialSelections?.secondary,
      hiringEntity: initialSelections?.tertiary
    } : {
      primary: initialSelections?.primary,
      secondary: initialSelections?.secondary
    };

    const res = await createTradeListing({ 
      category: initialCategory, 
      title, 
      description, 
      priceOrAsk: price, 
      location: `${location}${lga ? `, ${lga}` : ''}`, 
      lga, 
      postedById: postingAs === 'organization' && selectedOrgId ? selectedOrgId : profile.uid, 
      nervePointsCost: 0,
      metadata
    });
    
    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onSuccess();
      }, 2500);
    } else {
      alert(res.error || "Failed to publish listing.");
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 500, mx: "auto", textAlign: "center", mt: { xs: 4, md: 8 } }}>
        <Paper elevation={0} sx={{ ...glassCard, p: { xs: 4, md: 5 } }}>
          <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: alpha(EMERALD, 0.12), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
            <RocketLaunchIcon sx={{ fontSize: 40, color: EMERALD }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontSize: "1.4rem", color: "#000" }}>Listing Published! 🎉</Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 2, lineHeight: 1.6 }}>Your listing is now live on the marketplace. Flipping back...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 640, mx: "auto", color: "#000", height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.8rem" }, mb: 1, background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {isJob ? "Create Job Listing" : "Create Listing"}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        {isJob ? "Post a role or gig to the community. Fast and simple." : "List something on the marketplace — it takes less than 2 minutes."}
      </Typography>
      
      <Paper elevation={0} sx={{ ...glassCard, p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
      </Paper>

      <Paper elevation={0} sx={{ ...glassCard, p: { xs: 3, md: 4 }, flex: 1 }}>
        
        {/* ============================================================== */}
        {/* STEP 1: ROLE/ITEM & LOCATION                                   */}
        {/* ============================================================== */}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>
                {isJob ? "Role Details" : "What are you listing?"}
              </Typography>
              <TextField fullWidth label={isJob ? "Job Title (e.g. Senior Agronomist)" : "Listing Title"} value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mt: 1 }} />
            </Box>

            {isJob && (
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth>
                  <InputLabel>Sector</InputLabel>
                  <Select value={sector} label="Sector" onChange={(e) => setSector(e.target.value)}>
                    {SECTORS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Experience Level</InputLabel>
                  <Select value={experienceLevel} label="Experience Level" onChange={(e) => setExperienceLevel(e.target.value)}>
                    {EXPERIENCE_LEVELS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            )}

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>Location</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                {initialSelections?.secondary === 'remote' ? "You selected Remote, but you can specify a timezone or HQ location." : "Where is this available or based?"}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField fullWidth label="State / Region" value={location} onChange={(e) => setLocation(e.target.value)} />
                <TextField fullWidth label="LGA or City (Optional)" value={lga} onChange={(e) => setLga(e.target.value)} />
              </Box>
            </Box>
          </Box>
        )}

        {/* ============================================================== */}
        {/* STEP 2: COMPENSATION & DETAILS                                 */}
        {/* ============================================================== */}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>
                {isJob ? "Compensation" : "Set your price or ask"}
              </Typography>
              
              {isJob ? (
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mt: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Compensation Type</InputLabel>
                    <Select value={compType} label="Compensation Type" onChange={(e) => setCompType(e.target.value)}>
                      {COMPENSATION_TYPES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField 
                    fullWidth 
                    label={compType === 'Nerve Points (NP)' ? "NP Amount" : "Salary Range / Budget"} 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder={compType === 'Fiat (NGN)' ? "e.g. ₦150k - ₦200k/mo" : "e.g. 500 NP"}
                  />
                </Box>
              ) : (
                <TextField fullWidth label="Price or Ask" value={price} onChange={(e) => setPrice(e.target.value)} sx={{ mt: 1 }} />
              )}
            </Box>

            {isJob && (
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(EMERALD, 0.05), border: `1px solid ${alpha(EMERALD, 0.2)}` }}>
                <FormControlLabel
                  control={<Switch checked={useEscrow} onChange={(e) => setUseEscrow(e.target.checked)} color="primary" />}
                  label={<Typography sx={{ fontWeight: 700 }}>Secure via Food Nerve Escrow</Typography>}
                />
                <Typography variant="body2" sx={{ color: "text.secondary", ml: 7, mt: -0.5 }}>
                  Build trust by locking funds in escrow. Recommended for gig and contract work.
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>
                {isJob ? "Job Description & Requirements" : "Tell us more"}
              </Typography>
              <TextField 
                fullWidth 
                multiline 
                rows={5} 
                label={isJob ? "Key responsibilities, required skills, etc." : "Description & Requirements"} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                sx={{ mt: 1 }} 
              />
            </Box>
          </Box>
        )}

        {/* ============================================================== */}
        {/* STEP 3: MEDIA                                                  */}
        {/* ============================================================== */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>Add Media (Optional)</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {isJob ? "Upload a company logo or an image relating to the role." : "Upload an image of your listing"}
            </Typography>
            <Box sx={{ mt: 3, p: 5, border: `2px dashed ${alpha("#000", 0.15)}`, borderRadius: "16px", textAlign: "center", bgcolor: "rgba(0,0,0,0.02)", cursor: "pointer", "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}>
               <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
               <Typography color="text.secondary" sx={{ fontWeight: 600 }}>Tap to browse or drag and drop</Typography>
               <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 1 }}>PNG, JPG, or GIF up to 5MB</Typography>
            </Box>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
        <Button disabled={isSubmitting} onClick={handleBack} sx={{ fontWeight: 700, color: "text.secondary" }}>
          {activeStep === 0 ? "Cancel" : "Back"}
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={!isStepValid(activeStep) || isSubmitting} sx={{ bgcolor: EMERALD, "&:hover": { bgcolor: EMERALD_DARK }, minWidth: 120, borderRadius: '12px', fontWeight: 800, textTransform: 'none', py: 1 }}>
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (activeStep === STEPS.length - 1 ? "Publish Listing" : "Continue")}
        </Button>
      </Box>
    </Box>
  );
}
