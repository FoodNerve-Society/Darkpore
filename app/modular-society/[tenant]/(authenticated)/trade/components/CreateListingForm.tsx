// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  alpha,
  CircularProgress,
  Switch,
  FormControlLabel,
  Grid,
  Modal,
  Chip
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
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";

import PremiumTextField from "@/components/PremiumTextField";
import PremiumAutocomplete from "@/components/PremiumAutocomplete";
import PremiumMarkdownEditor from "@/components/PremiumMarkdownEditor";
import { Country, State, City } from 'country-state-city';

const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";

const glassCard = {
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
};

// --- TAXONOMY (System Influencers & Value Chain Actors) ---
const TAXONOMY = {
  "Primary Production": ["Crop Farming & Horticulture", "Livestock & Poultry", "Aquaculture", "Greenhouse & Hydroponics"],
  "Processing & Manufacturing": ["Milling & Extrusion", "Cold Storage & Preservation", "Packaging & Labeling", "Fermentation & Bio-processing"],
  "Logistics & Supply Chain": ["Cold-Chain Transport", "Warehousing & Aggregation", "Last-Mile Delivery"],
  "Agritech & Data Ecosystem": ["IoT & Farm Sensors", "Drone Mapping & GIS", "Farm Management Software", "Marketplace Platforms"],
  "Policy, Research & Education": ["Agronomy & Extension Services", "Biotech & Seed Research", "Regulatory & NGO"],
  "Retail, Trade & Market Access": ["B2B Export", "Wholesale Aggregation", "B2C E-commerce & Grocery"],
  "Finance & Investment": ["Microfinance & Credit", "Venture Capital & Private Equity", "Insurance & Risk Mitigation"]
};

// Flatten for autocomplete options
const CATEGORY_OPTIONS = Object.entries(TAXONOMY).map(([influencer, actors]) => {
    return [influencer, ...actors.map(actor => `  ↳ ${actor}`)];
}).flat();

interface CreateListingFormProps {
  initialCategory?: string;
  initialSelections?: { primary: string, secondary: string, tertiary?: string } | null;
  onCancel: () => void;
  onSuccess: () => void;
  postingAs?: 'personal' | 'organization';
  selectedOrgId?: string | null;
}

export default function CreateListingForm({ initialCategory = "", initialSelections = null, onCancel, onSuccess, postingAs = 'personal', selectedOrgId = null }: CreateListingFormProps) {
  const { profile, activeOrg } = useSociety();
  const router = useRouter();

  const isJob = initialCategory === "jobs";
  const isVolunteer = initialSelections?.primary === "volunteer";

  // Form State
  const [title, setTitle] = useState("");
  
  // Company Logic
  const tertiary = initialSelections?.tertiary;
  const isFoodNerve = tertiary === 'foodnerve';
  const isMyOrg = tertiary === 'org';
  const [companyName, setCompanyName] = useState(
      isFoodNerve ? "Food Nerve Core" : 
      isMyOrg ? (activeOrg?.name || profile?.displayName || "My Organization") : ""
  );
  const companyDisabled = isFoodNerve || isMyOrg;

  const [category, setCategory] = useState<string | null>(null);
  
  // Geography
  const countries = Country.getAllCountries();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
      if (selectedCountry) {
          setStates(State.getStatesOfCountry(selectedCountry.isoCode));
          setSelectedState(null);
          setSelectedCity(null);
      } else {
          setStates([]);
      }
  }, [selectedCountry]);

  useEffect(() => {
      if (selectedState && selectedCountry) {
          setCities(City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode));
          setSelectedCity(null);
      } else {
          setCities([]);
      }
  }, [selectedState, selectedCountry]);

  // Compensation
  const [duration, setDuration] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [npAmount, setNpAmount] = useState("");
  const [useEscrow, setUseEscrow] = useState(false);

  useEffect(() => {
      if (selectedCountry && selectedCountry.currency) {
          setCurrency(selectedCountry.currency);
      }
  }, [selectedCountry]);

  // Description
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!profile) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;

  const gate = checkGatekeeper(profile, 2);
  if (gate && !gate.allowed) {
      // (Keep existing premium upgrade prompt)
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

  const isFormValid = () => {
      return title.trim().length >= 5 && companyName.trim().length > 0 && selectedCountry !== null;
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    
    let compTypeString = isVolunteer ? "Volunteer/NP" : "Fiat";
    let locationString = `${selectedCountry?.name || ''}`;
    if (selectedState) locationString = `${selectedState.name}, ${locationString}`;
    if (selectedCity) locationString = `${selectedCity.name}, ${locationString}`;

    const metadata = {
      sector: category?.replace('  ↳ ', '') || '',
      compType: compTypeString,
      useEscrow,
      duration,
      currency,
      minSalary,
      maxSalary,
      npAmount,
      companyName,
      commitment: initialSelections?.primary,
      workModel: initialSelections?.secondary,
      hiringEntity: initialSelections?.tertiary
    };

    const res = await createTradeListing({ 
      category: initialCategory, 
      title, 
      description, 
      priceOrAsk: isVolunteer ? (npAmount || "0") : `${currency} ${minSalary} - ${maxSalary}`, 
      location: locationString, 
      lga: selectedCity?.name || "", 
      postedById: postingAs === 'organization' && selectedOrgId ? selectedOrgId : profile.uid, 
      nervePointsCost: 0,
      metadata
    });
    
    if (res.success) {
      setSubmitted(true);
      setShowPreview(false);
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
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 2, lineHeight: 1.6 }}>Your listing is now live on the marketplace.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto", color: "#000" }}>
      
      <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.8rem" }, mb: 1, background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {isJob ? "Create Job Listing" : "Create Listing"}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
        Fill in the details below. Required fields are marked.
      </Typography>
      
      <Paper elevation={0} sx={{ ...glassCard, p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 5 }}>
        
        {/* SECTION 1: ROLE DETAILS */}
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>1. Role Details</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <PremiumTextField colorTheme={EMERALD} fullWidth label="Job Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Agronomist" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <PremiumTextField 
                        colorTheme={EMERALD} 
                        fullWidth 
                        label="Company Name *" 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                        disabled={companyDisabled}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <PremiumAutocomplete 
                        colorTheme={EMERALD}
                        label="Category / Sector"
                        options={CATEGORY_OPTIONS}
                        value={category}
                        onChange={(e, val) => setCategory(val as string)}
                    />
                </Grid>
            </Grid>
        </Box>

        {/* SECTION 2: GEOGRAPHY */}
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>2. Geography</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <PremiumAutocomplete
                        colorTheme={EMERALD}
                        label="Country *"
                        options={countries}
                        getOptionLabel={(opt: any) => opt.name || ''}
                        value={selectedCountry}
                        onChange={(e, val) => setSelectedCountry(val)}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <PremiumAutocomplete
                        colorTheme={EMERALD}
                        label="State"
                        options={states}
                        getOptionLabel={(opt: any) => opt.name || ''}
                        value={selectedState}
                        onChange={(e, val) => setSelectedState(val)}
                        disabled={!selectedCountry || states.length === 0}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <PremiumAutocomplete
                        colorTheme={EMERALD}
                        label="City / LGA"
                        options={cities}
                        getOptionLabel={(opt: any) => opt.name || ''}
                        value={selectedCity}
                        onChange={(e, val) => setSelectedCity(val)}
                        disabled={!selectedState || cities.length === 0}
                    />
                </Grid>
            </Grid>
        </Box>

        {/* SECTION 3: COMPENSATION & COMMITMENT */}
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>3. Compensation & Commitment</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <PremiumTextField 
                        colorTheme={EMERALD} 
                        fullWidth 
                        label="Duration / Tenure" 
                        value={duration} 
                        onChange={(e) => setDuration(e.target.value)} 
                        placeholder="e.g. 3 Months, Ongoing, Project-based" 
                    />
                </Grid>
                {isVolunteer ? (
                     <Grid item xs={12} sm={6}>
                         <PremiumTextField 
                             colorTheme={EMERALD} 
                             fullWidth 
                             label="Nerve Points Offered (Optional)" 
                             type="number"
                             value={npAmount} 
                             onChange={(e) => setNpAmount(e.target.value)} 
                         />
                     </Grid>
                ) : (
                    <>
                        <Grid item xs={12} sm={2}>
                            <PremiumTextField colorTheme={EMERALD} fullWidth label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <PremiumTextField colorTheme={EMERALD} fullWidth label="Min Salary" type="number" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <PremiumTextField colorTheme={EMERALD} fullWidth label="Max Salary" type="number" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} />
                        </Grid>
                    </>
                )}
            </Grid>
            {isJob && !isVolunteer && (
                <Box sx={{ mt: 3, p: 2, borderRadius: '12px', bgcolor: alpha(EMERALD, 0.05), border: `1px solid ${alpha(EMERALD, 0.2)}` }}>
                  <FormControlLabel
                    control={<Switch checked={useEscrow} onChange={(e) => setUseEscrow(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: EMERALD }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: EMERALD } }} />}
                    label={<Typography sx={{ fontWeight: 700 }}>Secure via Food Nerve Escrow</Typography>}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary", ml: 4, mt: -0.5 }}>
                    Build trust by locking funds in escrow. Recommended for gig and contract work.
                  </Typography>
                </Box>
            )}
        </Box>

        {/* SECTION 4: DESCRIPTION */}
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>4. Description</Typography>
            <PremiumMarkdownEditor 
                colorTheme={EMERALD}
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
                rows={10}
                placeholder="Write a detailed description. Use formatting tools above."
            />
        </Box>

      </Paper>

      {/* ACTIONS */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, gap: 2, flexWrap: 'wrap' }}>
        <Button onClick={onCancel} sx={{ fontWeight: 700, color: "text.secondary", textTransform: 'none' }}>
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
                variant="outlined" 
                onClick={() => setShowPreview(true)} 
                disabled={!isFormValid()} 
                sx={{ borderColor: EMERALD, color: EMERALD, "&:hover": { borderColor: EMERALD_DARK, bgcolor: alpha(EMERALD, 0.05) }, borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3 }}
            >
                Preview
            </Button>
            <Button 
                variant="contained" 
                sx={{ bgcolor: "#334155", "&:hover": { bgcolor: "#1e293b" }, borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3, boxShadow: 'none' }}
            >
                Save as Draft
            </Button>
            <Button 
                variant="contained" 
                onClick={handlePublish} 
                disabled={!isFormValid() || isSubmitting} 
                sx={{ bgcolor: EMERALD, "&:hover": { bgcolor: EMERALD_DARK }, borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 4, boxShadow: `0 4px 14px ${alpha(EMERALD, 0.4)}` }}
            >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Publish"}
            </Button>
        </Box>
      </Box>

      {/* PREVIEW MODAL */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95%', md: '700px' }, maxHeight: '90vh', bgcolor: 'background.paper', borderRadius: 4, boxShadow: 24, p: 4, overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight={800}>Preview Listing</Typography>
                  <Button onClick={() => setShowPreview(false)} sx={{ minWidth: 0, p: 1 }}><CloseIcon /></Button>
              </Box>
              
              <Box sx={{ p: 3, borderRadius: 3, border: `1px solid ${alpha('#000', 0.1)}`, bgcolor: '#fff' }}>
                  <Typography variant="h4" fontWeight={900} gutterBottom>{title}</Typography>
                  <Typography variant="h6" color="primary" gutterBottom>{companyName}</Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3, mt: 2 }}>
                      <Chip label={initialSelections?.primary || "Job"} sx={{ bgcolor: alpha(EMERALD, 0.1), color: EMERALD, fontWeight: 700 }} />
                      <Chip label={initialSelections?.secondary || "Location"} variant="outlined" />
                      <Chip label={category?.replace('  ↳ ', '') || 'No Sector'} variant="outlined" />
                      <Chip label={`${selectedCity?.name ? selectedCity.name + ', ' : ''}${selectedState?.name ? selectedState.name + ', ' : ''}${selectedCountry?.name || ''}`} variant="outlined" />
                  </Box>

                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {isVolunteer ? `Volunteer Role (${duration}) - ${npAmount} NP` : `${currency} ${minSalary} - ${maxSalary} (${duration})`}
                  </Typography>
                  
                  <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha('#000', 0.1)}`, '& h2': { mt: 0 } }}>
                      {/* Note: In a real app we'd use react-markdown here, dangerouslySetInnerHTML as fallback for simple preview */}
                      <div dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }} />
                  </Box>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button onClick={() => setShowPreview(false)} color="inherit" sx={{ fontWeight: 700 }}>Edit</Button>
                  <Button variant="contained" onClick={handlePublish} disabled={isSubmitting} sx={{ bgcolor: EMERALD, '&:hover': { bgcolor: EMERALD_DARK }, borderRadius: 3, fontWeight: 800 }}>
                      {isSubmitting ? "Publishing..." : "Publish Now"}
                  </Button>
              </Box>
          </Box>
      </Modal>

    </Box>
  );
}
