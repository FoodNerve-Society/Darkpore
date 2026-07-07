// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Chip,
  IconButton,
  Tooltip,
  Alert
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
import CheckIcon from "@mui/icons-material/Check";
import WorkIcon from "@mui/icons-material/Work";
import SparkleIcon from "@mui/icons-material/AutoAwesome";

import PremiumTextField from "@/components/PremiumTextField";
import PremiumAutocomplete from "@/components/PremiumAutocomplete";
import PremiumDatePicker from "@/components/PremiumDatePicker";
import PremiumMarkdownEditor from "@/components/PremiumMarkdownEditor";
import PreviewListingModal from "./PreviewListingModal";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import ImageIcon from "@mui/icons-material/Image";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Country, State, City } from 'country-state-city';
import { CATEGORY_OPTIONS } from "@/lib/taxonomy";

const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";

// Framework Definitions
const LISTING_FRAMEWORK = [
  { id: 'overview', type: 'role_overview', role: 'The Primary Mandate', desc: 'Define the title, company, and sector to attract the right talent.', hint: 'e.g. Senior Agronomist' },
  { id: 'geography', type: 'geography', role: 'The Ground Operations', desc: 'Specify exactly where this role executes and the base of operations.', hint: '' },
  { id: 'compensation', type: 'compensation', role: 'The Value Exchange', desc: 'Set the duration, escrow terms, and financial commitment.', hint: '' },
  { id: 'description', type: 'description', role: 'The Deep Dive', desc: 'Provide the full requirements, responsibilities, and context.', hint: '' }
];

const BLOCK_DEFINITIONS: Record<string, { label: string, color: string }> = {
  role_overview: { label: 'Role Overview', color: '#3b82f6' },
  geography: { label: 'Location Details', color: '#10b981' },
  compensation: { label: 'Terms & Comp', color: '#f59e0b' },
  description: { label: 'Full Description', color: '#8b5cf6' },
};

const glassCard = {
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
};

interface CreateListingFormProps {
  initialCategory?: string;
  initialSelections?: { primary: string, secondary: string, tertiary?: string } | null;
  onCancel: () => void;
  onSuccess: () => void;
  postingAs?: 'personal' | 'organization';
  selectedOrgId?: string | null;
}

export default function CreateListingForm({ 
  initialCategory = "", 
  initialSelections = null, 
  onCancel, 
  onSuccess, 
  postingAs = 'personal', 
  selectedOrgId = null 
}: CreateListingFormProps) {
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
  const [companyLogoUrl, setCompanyLogoUrl] = useState(
      isFoodNerve ? "https://foodnerve.com/logo.png" : 
      (isMyOrg && activeOrg?.logoUrl) ? activeOrg.logoUrl : ""
  );
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const { uploadFile, uploading: uploadingLogo } = useStorageUpload();
  const [deadline, setDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");
  const [currency, setCurrency] = useState("USD");
  const CURRENCY_OPTIONS = ["USD", "NGN", "EUR", "GBP", "CAD", "AUD", "KES", "ZAR", "GHS"];
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

  // Logo toggle mode
  const [mediaUrlMode, setMediaUrlMode] = useState(false);

  // Salary Validation
  const hasSalaryError = Boolean(minSalary && maxSalary && Number(minSalary) > Number(maxSalary));

  // 3D Block State
  const [flippedBlockId, setFlippedBlockId] = useState<string | null>(null);

  const getBlockFillStats = (blockId: string) => {
    let filled = 0;
    let total = 1;
    switch(blockId) {
      case 'overview':
        total = 3;
        if (title.trim().length >= 5) filled++;
        if (companyName.trim().length > 0) {
            // If it's a new company, logo is required
            if (!companyDisabled) {
                total++; // Needs logo
                if (companyLogoUrl.trim().length > 0) filled++;
            }
            filled++;
        }
        if (category) filled++;
        break;
      case 'geography':
        total = 1;
        if (selectedCountry) filled++;
        break;
      case 'compensation':
        total = isVolunteer ? 2 : 4;
        if (duration) filled++;
        if (isVolunteer) {
           if (npAmount) filled++;
        } else {
           if (currency) filled++;
           if (minSalary) filled++;
           if (maxSalary) filled++;
        }
        break;
      case 'description':
        total = 1;
        if (description.length > 20) filled++;
        break;
    }
    return { filled, total };
  };

  const isBlockFilled = (blockId: string) => {
    const stats = getBlockFillStats(blockId);
    return stats.filled >= stats.total;
  };

  const areAllBlocksFilled = LISTING_FRAMEWORK.every(b => isBlockFilled(b.id));

  if (!profile) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;

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

  const handlePublish = async () => {
    setIsSubmitting(true);
    
    // Upload Logo if a local file was selected
    let finalLogoUrl = companyLogoUrl;
    if (companyLogoFile) {
        const result = await uploadFile(companyLogoFile);
        if (result?.secure_url) {
            finalLogoUrl = result.secure_url;
        } else {
            alert("Failed to upload company logo.");
            setIsSubmitting(false);
            return;
        }
    }

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
      companyLogoUrl: finalLogoUrl,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* SCROLLABLE MAIN CONTENT */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, py: 3, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        
        <Box sx={{ maxWidth: 800, mx: "auto", width: '100%' }}>
          
          {/* ╭─── CONTEXT HEADER ───╮ */}
          <Box sx={{
            display: 'inline-flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2,
            mb: 4, p: '12px 16px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.03) 0%, rgba(15, 23, 42, 0.08) 100%)',
            border: '1px solid rgba(15, 23, 42, 0.05)',
            backdropFilter: 'blur(16px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.02)',
            width: 'fit-content'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexWrap: 'wrap' }}>
              
              {/* Studio Root */}
              <Box 
                onClick={onCancel} 
                sx={{ 
                  display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75, borderRadius: '10px',
                  cursor: 'pointer', transition: 'all 0.2s ease', color: '#0f172a', bgcolor: 'rgba(255,255,255,0.7)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)', transform: 'translateY(-1px)' }
                }}
              >
                <WorkIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>Marketplace</Typography>
              </Box>

              <Typography sx={{ color: 'rgba(15, 23, 42, 0.3)', fontWeight: 400 }}>/</Typography>

              {/* Category */}
              <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, color: '#475569' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.9, textTransform: 'capitalize' }}>
                  {initialCategory || 'Trade'}
                </Typography>
              </Box>

              <Typography sx={{ color: 'rgba(15, 23, 42, 0.3)', fontWeight: 400 }}>/</Typography>

              {/* Subcategory */}
              <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, color: '#475569' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.9, textTransform: 'capitalize' }}>
                  {initialSelections?.primary || 'Listing'}
                </Typography>
              </Box>

              <Typography sx={{ color: 'rgba(15, 23, 42, 0.3)', fontWeight: 400 }}>/</Typography>

              {/* Status Chip */}
              <Chip 
                label="NEW LISTING" 
                size="small" 
                sx={{ 
                  bgcolor: alpha(EMERALD, 0.1), color: EMERALD, 
                  fontWeight: 800, border: `1px solid ${alpha(EMERALD, 0.3)}`,
                  height: 24, fontSize: '0.75rem', letterSpacing: '0.05em', ml: 1
                }} 
              />
            </Box>
          </Box>
          {/* ╰─── END HEADER ───╯ */}

          
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', letterSpacing: '-0.02em' }}>Block Canvas</Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.95rem', mt: 0.5, fontWeight: 500 }}>
                Tap a card to flip it and edit. <strong style={{ color: '#0f172a' }}>{LISTING_FRAMEWORK.filter(b => isBlockFilled(b.id)).length}</strong> of <strong style={{ color: '#0f172a' }}>{LISTING_FRAMEWORK.length}</strong> blocks filled.
              </Typography>
            </Box>
          </Box>

          {/* 3D BLOCKS */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {LISTING_FRAMEWORK.map((b, i) => {
              const isFlipped = flippedBlockId === b.id;
              const fillStats = getBlockFillStats(b.id);
              const filled = fillStats.filled >= fillStats.total;
              const fillPercent = Math.min(100, Math.round((fillStats.filled / fillStats.total) * 100));
              const bDef = BLOCK_DEFINITIONS[b.type] || { color: EMERALD, label: 'Block' };
              const color = bDef.color;

              // Generate descriptive subtitle for front face when filled
              let filledSummary = 'Content added — tap to edit';
              if (filled) {
                if (b.id === 'overview') filledSummary = `${title} at ${companyName}`;
                if (b.id === 'geography') filledSummary = `${selectedCity ? selectedCity.name + ', ' : ''}${selectedCountry?.name || ''}`;
                if (b.id === 'compensation') filledSummary = isVolunteer ? `${duration} • ${npAmount} NP` : `${currency} ${minSalary} - ${maxSalary} • ${duration}`;
              }

              return (
                <Box key={b.id} sx={{ perspective: '1600px', mb: 2.5, scrollMarginTop: '120px' }}>
                  <Box sx={{
                    position: 'relative',
                    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'center center',
                    transform: isFlipped ? 'rotateX(-180deg)' : 'none',
                  }}>
                    
                    {/* FRONT FACE */}
                    <Box
                      onClick={() => !isFlipped && setFlippedBlockId(b.id)}
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
                      {fillPercent > 0 && (
                        <Typography sx={{ 
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                          fontWeight: 900, fontSize: { xs: '2rem', md: '3.5rem' }, 
                          color: filled ? 'rgba(255,255,255,0.15)' : alpha(color, 0.1), pointerEvents: 'none', letterSpacing: '0.05em',
                          textTransform: 'uppercase', whiteSpace: 'nowrap', zIndex: 0
                        }}>
                          {filled ? 'COMPLETED' : `${fillStats.filled} / ${fillStats.total} FILLED`}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
                        {/* Left accent bar */}
                        <Box sx={{ width: filled ? 0 : 6, flexShrink: 0, background: filled ? `transparent` : `linear-gradient(180deg, ${alpha(color, 0.4)} 0%, ${alpha(color, 0.1)} 100%)` }} />
                        
                        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                          {/* Number badge */}
                          <Box sx={{
                            width: 44, height: 44, borderRadius: '14px', flexShrink: 0,
                            bgcolor: filled ? 'rgba(255,255,255,0.2)' : alpha(color, 0.1), 
                            border: filled ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${alpha(color, 0.2)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: filled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            {filled ? <CheckIcon sx={{ color: '#fff' }} /> : <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color }}>{i + 1}</Typography>}
                          </Box>
                          {/* Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                              <Typography sx={{ fontWeight: 800, color: filled ? '#fff' : '#0f172a', fontSize: { xs: '1.05rem', md: '1.15rem' }, letterSpacing: '-0.01em' }}>
                                {b.role}
                              </Typography>
                              <Chip label={bDef.label} size="small" sx={{ height: 24, fontSize: '0.7rem', bgcolor: filled ? 'rgba(255,255,255,0.2)' : alpha(color, 0.15), color: filled ? '#fff' : color, fontWeight: 700, border: `1px solid ${filled ? 'rgba(255,255,255,0.3)' : alpha(color, 0.2)}` }} />
                            </Box>
                            <Typography sx={{ color: filled ? 'rgba(255,255,255,0.8)' : '#64748b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                              {filled ? filledSummary : b.desc}
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
                      {/* Back header */}
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        px: 3, py: 2,
                        borderBottom: `1px solid rgba(0,0,0,0.06)`,
                        background: alpha(color, 0.05),
                      }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: alpha(color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${alpha(color, 0.2)}` }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color }}>{i + 1}</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', flex: 1 }}>
                          {b.role}
                        </Typography>
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

                      {/* Back form fields */}
                      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        
                        {b.id === 'overview' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <PremiumTextField colorTheme={color} fullWidth label="Listing Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Agronomist" />
                              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      <PremiumTextField colorTheme={color} fullWidth label="Hiring Entity / Company *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={companyDisabled} />
                                      {/* Alert if their org has no logo */}
                                      {companyDisabled && !companyLogoUrl && (
                                          <Alert severity="warning" sx={{ borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#d97706', '& .MuiAlert-icon': { color: '#f59e0b' }, fontSize: '0.85rem' }}>
                                              Your organization is missing a logo. Ask your admin to add one to improve listing validity.
                                          </Alert>
                                      )}
                                      {/* If company is custom, ask for logo immediately */}
                                      {!companyDisabled && (
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b' }}>Company Logo (Required) *</Typography>
                                              <Box component="label" sx={{ 
                                                  borderRadius: '16px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.02)', 
                                                  border: '2px dashed', borderColor: companyLogoUrl ? 'transparent' : 'rgba(0,0,0,0.15)', 
                                                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                                  minHeight: 120, cursor: 'pointer', position: 'relative', 
                                                  transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
                                              }}>
                                                  <input type="file" hidden accept="image/*" onChange={(e) => {
                                                      if (e.target.files?.[0]) {
                                                          const file = e.target.files[0];
                                                          setCompanyLogoFile(file);
                                                          setCompanyLogoUrl(URL.createObjectURL(file));
                                                      }
                                                  }} />
                                                  {companyLogoUrl ? (
                                                      <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                                                          <img src={companyLogoUrl} alt="Logo preview" style={{ width: '100%', height: 120, objectFit: 'contain', padding: '8px' }} />
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
                                      )}
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                      <PremiumAutocomplete colorTheme={color} label="Sector / Category *" options={CATEGORY_OPTIONS} value={category} onChange={(e, val) => setCategory(val as string)} />
                                  </Box>
                              </Box>
                          </Box>
                        )}

                        {b.id === 'geography' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#64748b', mb: -1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location Details</Typography>
                              <PremiumAutocomplete colorTheme={color} label="Country *" options={countries} getOptionLabel={(opt: any) => opt.name || ''} value={selectedCountry} onChange={(e, val) => setSelectedCountry(val)} />
                              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                  <Box sx={{ flex: 1 }}>
                                      <PremiumAutocomplete colorTheme={color} label="State / Province" options={states} getOptionLabel={(opt: any) => opt.name || ''} value={selectedState} onChange={(e, val) => setSelectedState(val)} disabled={!selectedCountry || states.length === 0} />
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                      <PremiumAutocomplete colorTheme={color} label="City / LGA" options={cities} getOptionLabel={(opt: any) => opt.name || ''} value={selectedCity} onChange={(e, val) => setSelectedCity(val)} disabled={!selectedState || cities.length === 0} />
                                  </Box>
                              </Box>
                          </Box>
                        )}

                        {b.id === 'compensation' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#64748b', mb: -1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time & Reward</Typography>
                                
                                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                                    <Box sx={{ flex: 1 }}>
                                        <PremiumDatePicker colorTheme={color} fullWidth label="Application Deadline (Optional)" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <PremiumDatePicker colorTheme={color} fullWidth label="Start Date (Optional)" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    </Box>
                                </Box>
                                <PremiumTextField colorTheme={color} fullWidth label="Duration / Engagement Length *" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3 Months, Ongoing, Project-based" />
                                
                                {isVolunteer ? (
                                     <PremiumTextField colorTheme={color} fullWidth label="Nerve Points Offered (Optional)" type="number" value={npAmount} onChange={(e) => setNpAmount(e.target.value)} placeholder="e.g. 500 NP" />
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                                            <Box sx={{ flex: 1 }}>
                                                <PremiumAutocomplete colorTheme={color} label="Currency *" options={CURRENCY_OPTIONS} value={currency} onChange={(e, val) => setCurrency(val as string)} disableClearable />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <PremiumTextField colorTheme={color} fullWidth label="Min Budget/Salary" type="number" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <PremiumTextField colorTheme={color} fullWidth label="Max Budget/Salary" type="number" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} />
                                            </Box>
                                        </Box>
                                        {hasSalaryError && (
                                            <Alert severity="error" sx={{ borderRadius: 2, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', '& .MuiAlert-icon': { color: '#ef4444' } }}>
                                                Minimum salary cannot be greater than maximum salary.
                                            </Alert>
                                        )}
                                    </Box>
                                )}
                                
                            {isJob && !isVolunteer && (
                                <Box sx={{ mt: 1, p: 2.5, borderRadius: '12px', bgcolor: alpha(color, 0.05), border: `1px solid ${alpha(color, 0.2)}` }}>
                                  <FormControlLabel
                                    control={<Switch checked={useEscrow} onChange={(e) => setUseEscrow(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: color }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: color } }} />}
                                    label={<Typography sx={{ fontWeight: 800, color: '#0f172a' }}>Secure via Food Nerve Escrow</Typography>}
                                  />
                                  <Typography variant="body2" sx={{ color: "text.secondary", ml: 4, mt: 0.5, fontWeight: 500, lineHeight: 1.6 }}>
                                    Build trust by locking funds in escrow. Highly recommended for gig and contract work.
                                  </Typography>
                                </Box>
                            )}
                          </Box>
                        )}

                        {b.id === 'description' && (
                          <PremiumMarkdownEditor 
                              colorTheme={color}
                              value={description}
                              onChange={(e: any) => setDescription(e.target.value)}
                              rows={8}
                              label="Responsibilities & Context"
                              placeholder="Write a detailed description. Use formatting tools above to structure responsibilities, expectations, etc."
                          />
                        )}
                        
                        {/* Done Button on back face */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Button
                            variant="contained"
                            onClick={() => setFlippedBlockId(null)}
                            sx={{
                              bgcolor: color, '&:hover': { bgcolor: alpha(color, 0.9) },
                              borderRadius: '12px', fontWeight: 700, px: 4, boxShadow: 'none'
                            }}
                          >
                            Save & Close Block
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
          
          <PreviewListingModal 
            open={showPreview} 
            onClose={() => setShowPreview(false)}
            onPublish={handlePublish}
            isSubmitting={isSubmitting}
            data={{
              title,
              companyName,
              companyLogoUrl,
              category: category || '',
              locationString: selectedCountry ? `${selectedCity ? selectedCity.name + ', ' : ''}${selectedState ? selectedState.name + ', ' : ''}${selectedCountry.name}` : '',
              duration,
              deadline,
              startDate,
              compTypeString: isVolunteer ? "Volunteer/NP" : "Fiat",
              minSalary,
              maxSalary,
              currency,
              npAmount,
              description,
              color: '#3b82f6' // fallback primary color for the modal
            }}
          />
        </Box>
      </Box>

      {/* FOOTER ACTION CONTAINER */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={onCancel} sx={{ fontWeight: 700, color: "text.secondary", textTransform: 'none' }}>
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={() => setShowPreview(true)}
            disabled={!areAllBlocksFilled}
            startIcon={<SparkleIcon sx={{ color: '#8b5cf6' }} />}
            sx={{
              borderColor: 'rgba(139,92,246,0.3)',
              color: '#64748b',
              bgcolor: 'rgba(139,92,246,0.05)',
              fontWeight: 800,
              borderRadius: '12px',
              px: 3,
              '&:hover': {
                bgcolor: 'rgba(139,92,246,0.1)',
                borderColor: '#8b5cf6',
                color: '#0f172a',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Preview
          </Button>
          <Button
            sx={{
              bgcolor: 'rgba(245, 158, 11, 0.1)',
              color: '#d97706',
              fontWeight: 800,
              borderRadius: '12px',
              px: 3,
              '&:hover': {
                bgcolor: 'rgba(245, 158, 11, 0.2)',
                color: '#b45309'
              }
            }}
          >
            Save Draft
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePublish} 
            disabled={isSubmitting} 
            sx={{ 
              bgcolor: EMERALD, 
              fontWeight: 800, 
              px: 4, 
              borderRadius: '12px',
              opacity: areAllBlocksFilled ? 1 : 0.5,
              '&:hover': { bgcolor: EMERALD_DARK }
            }}
          >
            {isSubmitting ? 'Publishing...' : 'Publish'}
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
