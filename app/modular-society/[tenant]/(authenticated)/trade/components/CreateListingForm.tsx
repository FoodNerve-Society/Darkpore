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

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/Shield";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";

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

const CATEGORY_OPTIONS = [
  { value: "jobs", label: "Jobs", emoji: "👷", description: "Hire talent or post work opportunities in the food system" },
  { value: "opportunities", label: "Opportunities", emoji: "💡", description: "Grants, RFPs, fellowships, and backing for ventures" },
  { value: "flash-sale", label: "Flash Sale", emoji: "⚡", description: "Sell perishable or surplus goods quickly before they expire" },
  { value: "group-buy", label: "Group-Buy (Ajo)", emoji: "🤝", description: "Pool resources with others to share costs on big purchases" },
  { value: "swap", label: "Swap", emoji: "♻️", description: "Trade goods directly without cash — barter economy style" },
  { value: "need", label: "Need", emoji: "🔍", description: "Post a request for a specific commodity or service" },
];

const STEPS = ["Title", "Location", "Pricing", "Description", "Image"];

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

  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState("");
  const [lga, setLga] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selections, setSelections] = useState<{ primary: string, secondary: string, tertiary?: string } | null>(initialSelections);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    switch (step) {
      case 0: return title.trim().length >= 5;
      case 1: return location.trim().length > 0 && lga.trim().length > 0;
      case 2: return price.trim().length > 0;
      case 3: return description.trim().length >= 10;
      case 4: return true;
      default: return false;
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
    const res = await createTradeListing({ 
      category: category as string, 
      title, 
      description, 
      priceOrAsk: price, 
      location, 
      lga, 
      postedById: postingAs === 'organization' && selectedOrgId ? selectedOrgId : profile.id, 
      nervePointsCost: 0 
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
        Create Listing
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>List something on the marketplace — it takes less than 2 minutes.</Typography>
      
      <Paper elevation={0} sx={{ ...glassCard, p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
      </Paper>

      <Paper elevation={0} sx={{ ...glassCard, p: { xs: 3, md: 4 }, flex: 1 }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>What are you listing?</Typography>
            <TextField fullWidth label="Listing Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 3, mt: 2 }} />
          </Box>
        )}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>Where is this available?</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>For digital opportunities, enter "Remote" or "Online".</Typography>
            <TextField fullWidth label="State / Region" value={location} onChange={(e) => setLocation(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Local Government Area (LGA) or City" value={lga} onChange={(e) => setLga(e.target.value)} />
          </Box>
        )}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>Set your price or compensation</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>E.g. "$5,000 Grant", "N150,000/mo", or "Equity".</Typography>
            <TextField fullWidth label="Price or Ask" value={price} onChange={(e) => setPrice(e.target.value)} sx={{ mt: 1 }} />
          </Box>
        )}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>Tell us more</Typography>
            <TextField fullWidth multiline rows={5} label="Description & Requirements" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mt: 2 }} />
          </Box>
        )}
        {activeStep === 4 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>Add an Image (Optional)</Typography>
            <Box sx={{ mt: 2, p: 4, border: `2px dashed ${alpha("#000", 0.2)}`, borderRadius: "14px", textAlign: "center" }}>
               <CloudUploadIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
               <Typography color="text.secondary">Upload an image of your listing</Typography>
            </Box>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
        <Button disabled={isSubmitting} onClick={handleBack} sx={{ fontWeight: 700, color: "text.secondary" }}>Back</Button>
        <Button variant="contained" onClick={handleNext} disabled={!isStepValid(activeStep) || isSubmitting} sx={{ bgcolor: EMERALD, "&:hover": { bgcolor: EMERALD_DARK }, minWidth: 120 }}>
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (activeStep === STEPS.length - 1 ? "Publish Listing" : "Continue")}
        </Button>
      </Box>
    </Box>
  );
}
