// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { getTenantConfig } from "@/lib/cms";
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
  Alert,
  Select,
  MenuItem
} from "@mui/material";

import { useRouter, useParams } from "next/navigation";
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
import AddIcon from "@mui/icons-material/Add";

import PremiumTextField from "@/components/PremiumTextField";
import PremiumPriceInput from "@/components/PremiumPriceInput";
import PremiumAutocomplete from "@/components/PremiumAutocomplete";
import PremiumDatePicker from "@/components/PremiumDatePicker";
import PremiumMarkdownEditor from "@/components/PremiumMarkdownEditor";
import PremiumSwitch from "@/components/PremiumSwitch";
import PreviewListingModal from "./PreviewListingModal";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Country, State, City } from 'country-state-city';
import { CATEGORY_OPTIONS } from "@/lib/taxonomy";
import { differenceInMonths, differenceInDays, addMonths } from 'date-fns';

const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";

const LISTING_FRAMEWORK = [
  { id: 'identity', type: 'identity', role: 'The Hiring Identity', desc: 'Establish the organization posting this job.', hint: '' },
  { id: 'mandate', type: 'mandate', role: 'The Primary Mandate', desc: 'Define the title, sector, and provide the deep dive description.', hint: 'e.g. Senior Agronomist' },
  { id: 'geography', type: 'geography', role: 'The Ground Operations', desc: 'Specify exactly where this role executes and the base of operations.', hint: '' },
  { id: 'compensation', type: 'compensation', role: 'The Value Exchange', desc: 'Set the duration, escrow terms, and financial commitment.', hint: '' },
  { id: 'cta', type: 'cta', role: 'Application Setup', desc: 'Configure how candidates apply.', hint: '' }
];

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "NGN", "KES", "ZAR", "RWF", "UGX", "GHS"];

const BLOCK_DEFINITIONS: Record<string, { label: string, color: string }> = {
  identity: { label: 'Hiring Identity', color: '#ef4444' },
  mandate: { label: 'Primary Mandate', color: '#3b82f6' },
  geography: { label: 'Location Details', color: '#10b981' },
  compensation: { label: 'Terms & Comp', color: '#f59e0b' },
  cta: { label: 'Application Setup', color: '#8b5cf6' },
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
  draftData?: any;
  onCancel: () => void;
  onSuccess: () => void;
  postingAs?: 'personal' | 'organization';
  selectedOrgId?: string | null;
}

export default function CreateListingForm({ 
  initialCategory = "", 
  initialSelections = null,
  draftData,
  onCancel,
  onSuccess,
  postingAs = 'personal',
  selectedOrgId = null 
}: CreateListingFormProps) {
  const { profile, activeOrg } = useSociety();
  const router = useRouter();
  const params = useParams();
  const tenantId = (params.tenant as string) || "food";
  const tenantConfig = getTenantConfig(tenantId);
  const availableChallenges = tenantConfig.com.homepage.challenges || [];

  const isJob = initialCategory === "jobs" || draftData?.category === "jobs";
  const isVolunteer = initialSelections?.primary === "volunteer" || draftData?.category === "volunteer" || draftData?.compType === "volunteer";

  // Form State
  const [title, setTitle] = useState("");
  const [draftLocation, setDraftLocation] = useState("");
  const [draftOrg, setDraftOrg] = useState<any>(null);
  
  // Identity Logic
  const tertiary = draftData 
      ? (draftData.jobSource === 'internal_foodnerve' ? 'foodnerve-org' : 
         draftData.jobSource === 'verified_tenant' ? 'my-org' : 
         draftData.jobSource === 'community_sourced' ? 'external' : undefined)
      : initialSelections?.tertiary;

  const isFoodNerve = tertiary === 'foodnerve-org';
  const isMyOrg = tertiary === 'my-org';
  const isExternal = tertiary === 'external';
  
  const primarySelection = initialSelections?.primary || draftData?.compType || draftData?.category || 'jobs';
  const secondarySelection = initialSelections?.secondary || draftData?.workModel || 'onsite';
  const isRemote = secondarySelection === 'remote';

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  
  // For External Organization
  const [externalEntityName, setExternalEntityName] = useState("");
  const [externalEntityShortName, setExternalEntityShortName] = useState("");
  const [externalCountry, setExternalCountry] = useState<any>(null);
  const [externalState, setExternalState] = useState<any>(null);
  const [externalLga, setExternalLga] = useState<any>(null);
  const [orgChallenges, setOrgChallenges] = useState<any[]>([]);
  const [orgSubcategories, setOrgSubcategories] = useState<any[]>([]);

  // Sector and Description
  const [sector, setSector] = useState("");
  
  // Job specific state
  const [jobChallenges, setJobChallenges] = useState<any[]>([]);
  const [jobSubcategories, setJobSubcategories] = useState<any[]>([]);
  const [externalStates, setExternalStates] = useState<any[]>([]);
  const [externalCities, setExternalCities] = useState<any[]>([]);

  // Food Nerve Organizations
  const [foodNerveOrgs, setFoodNerveOrgs] = useState<any[]>([]);
  const [loadingFoodNerveOrgs, setLoadingFoodNerveOrgs] = useState(false);

  // Derive if the active organization is a platform owner and its rank
  let isPlatformOwnerActive = false;
  let activeOrgRank = 0;
  if (!isExternal && selectedEntityId) {
    if (initialSelections?.tertiary === 'foodnerve-org') {
        const o = foodNerveOrgs.find((x: any) => x.id === selectedEntityId);
        if (o?.isPlatformOwner) isPlatformOwnerActive = true;
        if (o?.rank) activeOrgRank = o.rank;
    } else {
        const o = profile?.organizations?.find((x: any) => x.id === selectedEntityId);
        if (o?.isPlatformOwner) isPlatformOwnerActive = true;
        if (o?.rank) activeOrgRank = o.rank;
    }
  }

  useEffect(() => {
      if (initialSelections?.tertiary === 'foodnerve-org' && foodNerveOrgs.length === 0) {
          setLoadingFoodNerveOrgs(true);
          import("@/lib/actions/organizations").then(({ getFoodNerveOrganizations }) => {
              getFoodNerveOrganizations().then((res) => {
                  if (res.success && res.data) {
                      setFoodNerveOrgs(res.data);
                  }
                  setLoadingFoodNerveOrgs(false);
              });
          });
      }
  }, [initialSelections?.tertiary]);

  useEffect(() => {
      if (externalCountry) {
          setExternalStates(State.getStatesOfCountry(externalCountry.isoCode));
          setExternalState(null);
          setExternalLga(null);
      } else {
          setExternalStates([]);
      }
  }, [externalCountry]);

  // Auto-select if My Organisation and user only has 1
  useEffect(() => {
      const isMyOrg = initialSelections?.tertiary === 'my-org';
      if (isMyOrg && profile?.organizations?.length === 1 && !selectedEntityId) {
          setSelectedEntityId(profile.organizations[0].id);
      }
  }, [initialSelections?.tertiary, profile?.organizations]);

  useEffect(() => {
      if (externalState && externalCountry) {
          setExternalCities(City.getCitiesOfState(externalCountry.isoCode, externalState.isoCode));
          setExternalLga(null);
      } else {
          setExternalCities([]);
      }
  }, [externalState, externalCountry]);

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
  // External Logo
  const [externalEntityLogoUrl, setExternalEntityLogoUrl] = useState("");
  const [externalEntityLogoFile, setExternalEntityLogoFile] = useState<File | null>(null);
  const { uploadFile, uploading: uploadingLogo } = useStorageUpload();
  const [deadline, setDeadline] = useState("");

  // Application & CTA Setup
  const [applicationMethod, setApplicationMethod] = useState<'external' | 'native' | 'email'>('native');
  const [applicationUrl, setApplicationUrl] = useState("");
  const [externalButtonText, setExternalButtonText] = useState("Apply Now");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [applicationInstructions, setApplicationInstructions] = useState("");
  const [requireResume, setRequireResume] = useState(true);
  const [requireCoverLetter, setRequireCoverLetter] = useState(false);
  const [requirePortfolio, setRequirePortfolio] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<{id: string, question: string, type: string, required: boolean}[]>([]);

  useEffect(() => {
    if (isExternal && applicationMethod === 'native') {
      setApplicationMethod('external');
    } else if (!isExternal && !isPlatformOwnerActive && activeOrgRank < 3 && applicationMethod === 'native') {
      setApplicationMethod('email');
    }
  }, [isExternal, isPlatformOwnerActive, activeOrgRank, applicationMethod]);
  const [endDate, setEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");

  // Auto-calculate Duration (day-precise, with weeks)
  useEffect(() => {
      if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (start < end) {
              const months = differenceInMonths(end, start);
              const afterMonths = addMonths(start, months);
              const remainingDays = differenceInDays(end, afterMonths);

              const parts: string[] = [];
              if (months > 0) parts.push(`${months} Month${months > 1 ? 's' : ''}`);

              if (remainingDays > 0) {
                  if (months === 0) {
                      // No months — break into weeks + days
                      const weeks = Math.floor(remainingDays / 7);
                      const days = remainingDays % 7;
                      if (weeks > 0) parts.push(`${weeks} Week${weeks > 1 ? 's' : ''}`);
                      if (days > 0) parts.push(`${days} Day${days > 1 ? 's' : ''}`);
                  } else {
                      // Has months — just show remaining days
                      parts.push(`${remainingDays} Day${remainingDays > 1 ? 's' : ''}`);
                  }
              }

              setDuration(parts.length > 0 ? parts.join(', ') : 'Same Day');
          }
      }
  }, [startDate, endDate]);
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
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Logo toggle mode
  const [mediaUrlMode, setMediaUrlMode] = useState(false);

  // Salary Validation
  const hasSalaryError = Boolean(minSalary && maxSalary && Number(minSalary) > Number(maxSalary));

  // 3D Block State
  const [flippedBlockId, setFlippedBlockId] = useState<string | null>(null);

  // Rehydrate from draftData
  useEffect(() => {
    if (draftData) {
      setTitle(draftData.title || "");
      setDescription(draftData.description || "");
      
      if (draftData.expiresAt) {
        setDeadline(new Date(draftData.expiresAt).toISOString().slice(0, 10)); // e.g., 'YYYY-MM-DD'
      }

        if (draftData) {
          // Identity
          if (draftData.organizationId && draftData.jobSource !== 'community_sourced') {
            setSelectedEntityId(draftData.organizationId);
            if (draftData.organization) setDraftOrg(draftData.organization);
          }

          // Duration
          if (draftData.duration) setDuration(draftData.duration);
          if (draftData.commodity) setSector(draftData.commodity);
          
          // Location (Draft Mode Display)
          if (draftData.location) {
            setDraftLocation(draftData.location);
          }
          
          // Challenges & Subcategories
          if (draftData.challenges) {
            try { 
              const cIds = JSON.parse(draftData.challenges); 
              setJobChallenges(availableChallenges.filter((c: any) => cIds.includes(c.id)));
            } catch(e) {}
          }
          if (draftData.subcategories) {
            try { 
              const sIds = JSON.parse(draftData.subcategories); 
              const allSubs = availableChallenges.flatMap((c: any) => c.subcategories || []);
              setJobSubcategories(allSubs.filter((s: any) => sIds.includes(s.id)));
            } catch(e) {}
          }
          
          // Application & CTA Setup
          if (draftData.applicationMethod) setApplicationMethod(draftData.applicationMethod);
          if (draftData.externalUrl) {
            setApplicationUrl(draftData.externalUrl);
          }
          if (draftData.applicationEmail) setApplicationEmail(draftData.applicationEmail);
          if (draftData.applicationInstructions) setApplicationInstructions(draftData.applicationInstructions);
          if (draftData.customQuestions) {
            try { setCustomQuestions(JSON.parse(draftData.customQuestions)); } catch(e) {}
          }
          if (draftData.requiredDocuments) {
            try { 
              const docs = JSON.parse(draftData.requiredDocuments); 
              if (docs.requireResume !== undefined) setRequireResume(docs.requireResume);
              if (docs.requireCoverLetter !== undefined) setRequireCoverLetter(docs.requireCoverLetter);
              if (docs.requirePortfolio !== undefined) setRequirePortfolio(docs.requirePortfolio);
            } catch(e) {}
          }

          // External Organization Rehydration
          if (draftData.organization?.isExternal) {
            setExternalEntityName(draftData.organization.name || "");
            if (draftData.organization.logoUrl) setExternalEntityLogoUrl(draftData.organization.logoUrl);
            
            if (draftData.organization.challenges) {
              try { 
                const oCIds = JSON.parse(draftData.organization.challenges); 
                setOrgChallenges(availableChallenges.filter((c: any) => oCIds.includes(c.id)));
              } catch(e) {}
            }
            if (draftData.organization.subcategories) {
              try { 
                const oSIds = JSON.parse(draftData.organization.subcategories); 
                const allSubs = availableChallenges.flatMap((c: any) => c.subcategories || []);
                setOrgSubcategories(allSubs.filter((s: any) => oSIds.includes(s.id)));
              } catch(e) {}
            }
            
            if (draftData.organization.country) setExternalCountry({ name: draftData.organization.country });
            if (draftData.organization.state) setExternalState({ name: draftData.organization.state });
            if (draftData.organization.lga) setExternalLga({ name: draftData.organization.lga });
          }
        }
      
      // Price or ask (e.g. "₦ 1000 - 2000" or "500")
      if (draftData.category === 'volunteer') {
        setNpAmount(draftData.priceOrAsk || "");
      } else {
        const match = String(draftData.priceOrAsk || "").match(/^(.+?)\s+(\d+)\s+-\s+(\d+)$/);
        if (match) {
          setCurrency(match[1]);
          setMinSalary(match[2]);
          setMaxSalary(match[3]);
        }
      }
    }
  }, [draftData]);

  const getBlockFillStats = (blockId: string) => {
    let filled = 0;
    let total = 1;
    switch(blockId) {
      case 'identity':
        total = 1;
        if (isExternal) {
            total = 4; // Name, Logo, orgChallenges, orgSubcategories
            if (externalEntityName.trim().length > 0) filled++;
            if (externalEntityLogoUrl.trim().length > 0) filled++;
            if (orgChallenges.length > 0) filled++;
            if (orgSubcategories.length > 0) filled++;
        } else {
            if (selectedEntityId) filled++;
        }
        break;
        case 'mandate':
          total = 3;
          if (title.trim().length > 0) filled++;
          if (sector) filled++;
          if (description.trim().length > 0) filled++;
        if ((initialCategory === 'jobs' || initialCategory === 'volunteer') && !isPlatformOwnerActive) {
            total++;
            if (jobChallenges.length > 0) filled++;
        }
        break;
      case 'geography':
        total = 1;
        if (selectedCountry || draftLocation) {
           filled++;
           if (draftLocation && !selectedCountry) return { filled, total: 1 };
           // State is always compulsory
           total++;
           if (selectedState) filled++;
           
           if (!isRemote) {
               // City is compulsory if hybrid/onsite
               total++;
               if (selectedCity) filled++;
           }
        }
        break;
      case 'compensation':
        total = isVolunteer ? 1 : 3;
        if (isVolunteer) {
           if (duration) filled++;
        } else {
           if (currency) filled++;
           if (minSalary) filled++;
           if (maxSalary) filled++;
        }
        break;
      case 'cta':
        if (applicationMethod === 'external') {
            total = 2;
            if (applicationUrl.trim().length > 5) filled++;
            if (externalButtonText.trim().length > 0) filled++;
        } else if (applicationMethod === 'email') {
            total = 1;
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicationEmail)) filled++;
        } else {
            // Native flow: valid if at least one document is required or a custom question exists
            total = 1;
            filled = (requireResume || requireCoverLetter || requirePortfolio || customQuestions.length > 0) ? 1 : 0;
        }
        break;
    }
    return { filled, total };
  };

  const isBlockFilled = (blockId: string) => {
    const stats = getBlockFillStats(blockId);
    return stats.filled >= stats.total;
  };

  const areAllBlocksFilled = LISTING_FRAMEWORK.every(b => isBlockFilled(b.id)) && !hasSalaryError;

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

  const handleSubmit = async (status: 'draft' | 'active') => {
    setError(null);
    setSuccessMsg(null);

    // Enforce title and location for drafts as well
    if (status === 'draft') {
        if (!title.trim() || !selectedCountry) {
            setError("Add a job title and location to save to draft.");
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
    }

    if (status === 'active') {
        if (!areAllBlocksFilled) {
            const incompleteBlocks = LISTING_FRAMEWORK.filter(b => !isBlockFilled(b.id)).map(b => b.id);
            const stats = incompleteBlocks.map(id => `${id} (${getBlockFillStats(id).filled}/${getBlockFillStats(id).total})`);
            setError(`Please complete all required fields. Incomplete: ${stats.join(', ')}`);
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (hasSalaryError) {
            setError("Minimum salary cannot be greater than maximum salary.");
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
    }

    setIsSubmitting(true);
    
    // Upload Logo if a local file was selected
    let finalLogoUrl = "";
    if (isExternal && externalEntityLogoFile) {
        const result = await uploadFile(externalEntityLogoFile);
        if (result?.publicUrl || result?.secure_url) {
            finalLogoUrl = result.publicUrl || result.secure_url;
            setExternalEntityLogoUrl(finalLogoUrl);
        } else {
            alert("Failed to upload external organization logo. Try again.");
            setIsSubmitting(false);
            return;
        }
    } else if (isExternal) {
        finalLogoUrl = externalEntityLogoUrl;
    }

    const isVolunteer = initialCategory?.toLowerCase().includes('volunteer');
    let compTypeString = isVolunteer ? "Volunteer/NP" : "Fiat";
    let locationString = draftLocation || '';
    if (selectedCountry) {
      locationString = `${selectedCountry.name}`;
      if (selectedState) locationString = `${selectedState.name}, ${locationString}`;
      if (selectedCity) locationString = `${selectedCity.name}, ${locationString}`;
    }

    // Determine the organizationId
    let organizationId = selectedEntityId;
    if (isMyOrg || isFoodNerve) {
        organizationId = selectedEntityId; // User selected an org from dropdown
    } else if (isExternal) {
        organizationId = null; // We will handle creating external org in the server action if organizationId is not passed, but we pass metadata
    }

    const metadata = {
      sector: sector?.replace('  ↳ ', '') || '',
      compType: compTypeString,
      useEscrow,
      duration,
      currency,
      minSalary: minSalary ? parseFloat(minSalary) : undefined,
      maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
      startDate,
      endDate,
      npAmount: npAmount ? parseInt(npAmount) : undefined,
      commitment: primarySelection,
      workModel: secondarySelection,
      hiringEntity: tertiary,
      // External organization data
      isExternal,
      externalEntityName: isExternal ? externalEntityName : undefined,
      externalEntityShortName: isExternal ? externalEntityShortName : undefined,
      externalCountry: isExternal ? externalCountry?.name : undefined,
      externalState: isExternal ? externalState?.name : undefined,
      externalLga: isExternal ? externalLga?.name : undefined,
      externalEntityLogoUrl: isExternal ? finalLogoUrl : undefined,
      organizationChallenges: isExternal ? orgChallenges.map(c => c.id) : undefined,
      organizationSubcategories: isExternal ? orgSubcategories.map(s => s.id) : undefined,
      jobChallenges: jobChallenges.map(c => c.id),
      jobSubcategories: jobSubcategories.map(s => s.id),
      // CTA Setup
      applicationMethod,
      applicationUrl: applicationMethod === 'external' ? applicationUrl : undefined,
      externalButtonText: applicationMethod === 'external' ? externalButtonText : undefined,
      applicationEmail: applicationMethod === 'email' ? applicationEmail : undefined,
      applicationInstructions: applicationMethod === 'email' ? applicationInstructions : undefined,
      requiredDocuments: applicationMethod === 'native' ? JSON.stringify({ requireResume, requireCoverLetter, requirePortfolio }) : undefined,
      customQuestions: applicationMethod === 'native' ? JSON.stringify(customQuestions) : undefined,
    };

    const res = await createTradeListing({ 
      id: draftData?.id,
      category: initialCategory, 
      title, 
      description, 
      priceOrAsk: isVolunteer ? (npAmount || "0") : `${currency} ${minSalary} - ${maxSalary}`, 
      location: locationString, 
      lga: selectedCity?.name || "", 
      postedById: profile?.uid || "anon", 
      organizationId,
      nervePointsCost: 0,
      status,
      expiresAt: deadline || undefined,
      metadata
    });
    
    setIsSubmitting(false);
    if (res.success) {
      if (status === 'draft') {
        setSuccessMsg("Draft saved successfully.");
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitted(true);
        onSuccess();
      }
    } else {
      setError(res.error || "Failed to publish listing.");
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      {/* 3D Container Wrapper */}
      <Box ref={scrollContainerRef} sx={{ perspective: '1000px', flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {error && (
          <Alert severity="error" sx={{ mb: 0, borderRadius: '12px', '& .MuiAlert-message': { fontWeight: 600 } }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {successMsg && (
          <Alert severity="success" sx={{ mb: 0, borderRadius: '12px', '& .MuiAlert-message': { fontWeight: 600 } }} onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}

        {(!title.trim() || !selectedCountry) && (
          <Alert severity="info" sx={{ mb: 0, borderRadius: '12px', '& .MuiAlert-message': { fontWeight: 600 }, bgcolor: 'rgba(59,130,246,0.1)' }}>
            Please add a job title and location to preview or save this listing as a draft.
          </Alert>
        )}

        <Box sx={{ position: 'relative', width: '100%', maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          
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
                  {primarySelection || 'Listing'}
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

          {/* Title hint — disappears when title is filled */}
          {!title.trim() && (
              <Alert severity="info" sx={{ borderRadius: '16px', mb: 2, bgcolor: alpha('#3b82f6', 0.06), color: '#3b82f6', fontWeight: 600, '& .MuiAlert-icon': { color: '#3b82f6' } }}>
                  Add a <strong>Job Title</strong> in the first block to unlock the Preview button.
              </Alert>
          )}

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
                        
                        {b.id === 'identity' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {!isExternal ? (
                                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      {/* Mock FoodNerve Orgs for demo purposes, since global org search API is pending */}
                                      {(() => {
                                          if (isMyOrg) {
                                              const userOrgs = profile?.organizations || [];
                                              return (
                                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                      {userOrgs.map((org: any) => {
                                                          const isSelected = selectedEntityId === org.id;
                                                          return (
                                                              <Paper 
                                                                  key={org.id}
                                                                  onClick={() => setSelectedEntityId(org.id)}
                                                                  sx={{ 
                                                                      p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2,
                                                                      border: `2px solid ${isSelected ? color : 'transparent'}`, 
                                                                      bgcolor: isSelected ? alpha(color, 0.05) : 'rgba(0,0,0,0.02)',
                                                                      cursor: 'pointer', transition: 'all 0.2s',
                                                                      opacity: selectedEntityId && !isSelected ? 0.5 : 1,
                                                                      '&:hover': { bgcolor: isSelected ? alpha(color, 0.08) : 'rgba(0,0,0,0.04)' }
                                                                  }}
                                                              >
                                                                  <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                                      {org.logoUrl ? (
                                                                          <img src={org.logoUrl} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                                      ) : (
                                                                          <WorkIcon sx={{ color: 'rgba(0,0,0,0.2)' }} />
                                                                      )}
                                                                  </Box>
                                                                  <Box sx={{ flex: 1 }}>
                                                                      <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>{org.name}</Typography>
                                                                      <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>{org.role || 'Verified Entity'}</Typography>
                                                                  </Box>
                                                                  {isSelected && <CheckIcon sx={{ color }} />}
                                                              </Paper>
                                                          );
                                                      })}
                                                      {selectedEntityId && profile?.organizations?.find((o: any) => o.id === selectedEntityId && !o.logoUrl) && (
                                                          <Alert severity="warning" sx={{ borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#d97706', '& .MuiAlert-icon': { color: '#f59e0b' }, fontSize: '0.85rem', mt: 1 }}>
                                                              Your organization is missing a logo. Ask your admin to add one to improve listing validity.
                                                          </Alert>
                                                      )}
                                                  </Box>
                                              );
                                          }

                                          // Food Nerve Orgs (Global)
                                          const userOrgIds = profile?.organizations?.map((o: any) => o.id) || [];
                                          const options = foodNerveOrgs.filter(o => !userOrgIds.includes(o.id));
                                          
                                          const selectedOrg = options.find((o: any) => o.id === selectedEntityId);

                                          return (
                                            <Box>
                                              {draftOrg && !selectedOrg ? (
                                                <Box>
                                                    <Paper sx={{ 
                                                        p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2,
                                                        border: `2px solid ${color}`, bgcolor: alpha(color, 0.05), mb: 2
                                                    }}>
                                                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                            {draftOrg.logoUrl ? (
                                                                <img src={draftOrg.logoUrl} alt={draftOrg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <Typography sx={{ fontWeight: 800, color: '#94a3b8' }}>{draftOrg.name.charAt(0)}</Typography>
                                                            )}
                                                        </Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{draftOrg.name}</Typography>
                                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Saved Organization</Typography>
                                                        </Box>
                                                    </Paper>
                                                    <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%', fontWeight: 500 } }}>
                                                      To change this organization, use the search dropdown below.
                                                    </Alert>
                                                    
                                                    <Box sx={{ mt: 3 }}>
                                                        <PremiumAutocomplete
                                                            colorTheme={color}
                                                            label="Search Food Nerve Organizations"
                                                            options={options}
                                                            getOptionLabel={(opt: any) => opt.name || ''}
                                                            value={selectedOrg || null}
                                                            onChange={(e, val) => setSelectedEntityId(val ? val.id : null)}
                                                        />
                                                    </Box>
                                                </Box>
                                              ) : (
                                                  <>
                                                      <PremiumAutocomplete
                                                          colorTheme={color}
                                                          label="Search Food Nerve Organizations"
                                                          options={options}
                                                          getOptionLabel={(opt: any) => opt.name || ''}
                                                          value={selectedOrg || null}
                                                          onChange={(e, val) => setSelectedEntityId(val ? val.id : null)}
                                                      />
                                                      
                                                      {selectedOrg && (
                                                          <Paper sx={{ 
                                                              mt: 2, p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2,
                                                              border: `2px solid ${alpha(color, 0.2)}`, bgcolor: alpha(color, 0.02)
                                                          }}>
                                                              <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                                  {selectedOrg.logoUrl ? (
                                                                      <img src={selectedOrg.logoUrl} alt={selectedOrg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                  ) : (
                                                                      <Typography sx={{ fontWeight: 800, color: '#94a3b8' }}>{selectedOrg.name.charAt(0)}</Typography>
                                                                  )}
                                                              </Box>
                                                              <Box>
                                                                  <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{selectedOrg.name}</Typography>
                                                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Food Nerve Organization</Typography>
                                                              </Box>
                                                              <CheckIcon sx={{ color }} />
                                                          </Paper>
                                                      )}
                                                  </>
                                              )}
                                              {selectedEntityId && selectedOrg && !selectedOrg.logoUrl && (
                                                  <Alert severity="warning" sx={{ borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#d97706', '& .MuiAlert-icon': { color: '#f59e0b' }, fontSize: '0.85rem', mt: 1 }}>
                                                      Your organization is missing a logo. Ask your admin to add one to improve listing validity.
                                                  </Alert>
                                              )}
                                            </Box>
                                          );
                                      })()}
                                  </Box>
                              ) : (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                      <PremiumTextField colorTheme={color} fullWidth label="External Organization Name *" value={externalEntityName} onChange={(e) => setExternalEntityName(e.target.value)} placeholder="e.g. Acme Corp" />
                                      
                                      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                          <Box sx={{ flex: 1 }}>
                                              <PremiumTextField colorTheme={color} fullWidth label="Short Name (Optional)" value={externalEntityShortName} onChange={(e) => setExternalEntityShortName(e.target.value)} placeholder="e.g. Acme" />
                                          </Box>
                                          <Box sx={{ flex: 1 }}>
                                              <PremiumAutocomplete colorTheme={color} label="Country" options={countries} getOptionLabel={(opt: any) => opt.name || ''} value={externalCountry} onChange={(e, val) => setExternalCountry(val)} />
                                          </Box>
                                      </Box>

                                      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                          <Box sx={{ flex: 1 }}>
                                              <PremiumAutocomplete colorTheme={color} label="State" options={externalStates} getOptionLabel={(opt: any) => opt.name || ''} value={externalState} onChange={(e, val) => setExternalState(val)} disabled={!externalCountry} />
                                          </Box>
                                          <Box sx={{ flex: 1 }}>
                                              <PremiumAutocomplete colorTheme={color} label="LGA / City" options={externalCities} getOptionLabel={(opt: any) => opt.name || ''} value={externalLga} onChange={(e, val) => setExternalLga(val)} disabled={!externalState} />
                                          </Box>
                                      </Box>

                                      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                         <Box sx={{ flex: 1 }}>
                                             <PremiumAutocomplete 
                                                 multiple 
                                                 colorTheme={color} 
                                                 label="Organization Challenges *" 
                                                 options={availableChallenges} 
                                                 getOptionLabel={(opt: any) => opt.title} 
                                                 value={orgChallenges} 
                                                 onChange={(e, val: any) => {
                                                     setOrgChallenges(val);
                                                     setOrgSubcategories(prev => prev.filter(sub => val.some((c: any) => c.subcategories?.some((s: any) => s.id === sub.id))));
                                                 }} 
                                             />
                                         </Box>
                                         <Box sx={{ flex: 1 }}>
                                             <PremiumAutocomplete 
                                                 multiple 
                                                 colorTheme={color} 
                                                 label="Organization Subcategories *" 
                                                 options={orgChallenges.flatMap((c: any) => c.subcategories || [])} 
                                                 getOptionLabel={(opt: any) => opt.title} 
                                                 value={orgSubcategories} 
                                                 onChange={(e, val: any) => setOrgSubcategories(val)} 
                                                 disabled={orgChallenges.length === 0} 
                                             />
                                         </Box>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b' }}>Company Logo (Required) *</Typography>
                                          <Box component="label" sx={{ 
                                              borderRadius: '16px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.02)', 
                                              border: '2px dashed', borderColor: externalEntityLogoUrl ? 'transparent' : 'rgba(0,0,0,0.15)', 
                                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                              minHeight: 120, cursor: 'pointer', position: 'relative', 
                                              transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
                                          }}>
                                              <input type="file" hidden accept="image/*" onChange={(e) => {
                                                  if (e.target.files?.[0]) {
                                                      const file = e.target.files[0];
                                                      setExternalEntityLogoFile(file);
                                                      setExternalEntityLogoUrl(URL.createObjectURL(file));
                                                  }
                                              }} />
                                              {externalEntityLogoUrl ? (
                                                  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                                                      <img src={externalEntityLogoUrl} alt="Logo preview" style={{ width: '100%', height: 120, objectFit: 'contain', padding: '8px' }} />
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
                                  </Box>
                              )}
                          </Box>
                        )}

                        {b.id === 'mandate' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <PremiumTextField colorTheme={color} fullWidth label="Listing Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Agronomist" />
                              <PremiumAutocomplete colorTheme={color} label="Sector / Category *" options={CATEGORY_OPTIONS} value={sector} onChange={(e, val) => setSector(val as string)} />
                              
                              {(isJob || isVolunteer) && (
                                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' }, mt: 2 }}>
                                      <Box sx={{ flex: 1 }}>
                                          <PremiumAutocomplete 
                                              multiple 
                                              colorTheme={color} 
                                              label={isPlatformOwnerActive ? "Job Challenges (Optional)" : "Job Challenges *"} 
                                              options={availableChallenges} 
                                              getOptionLabel={(opt: any) => opt.title} 
                                              value={jobChallenges} 
                                              onChange={(e, val: any) => {
                                                  setJobChallenges(val);
                                                  setJobSubcategories(prev => prev.filter(sub => val.some((c: any) => c.subcategories?.some((s: any) => s.id === sub.id))));
                                              }} 
                                          />
                                      </Box>
                                      <Box sx={{ flex: 1 }}>
                                          <PremiumAutocomplete 
                                              multiple 
                                              colorTheme={color} 
                                              label="Job Subcategories" 
                                              options={jobChallenges.flatMap((c: any) => c.subcategories || [])} 
                                              getOptionLabel={(opt: any) => opt.title} 
                                              value={jobSubcategories} 
                                              onChange={(e, val: any) => setJobSubcategories(val)} 
                                              disabled={jobChallenges.length === 0} 
                                          />
                                      </Box>
                                  </Box>
                              )}

                              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#64748b', mt: 2, mb: -1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Description</Typography>
                              <PremiumMarkdownEditor 
                                  colorTheme={color}
                                  value={description}
                                  onChange={(e: any) => setDescription(e.target.value)}
                                  rows={8}
                                  label="Responsibilities & Context"
                                  placeholder="Write a detailed description. Use formatting tools above to structure responsibilities, expectations, etc."
                              />
                          </Box>
                        )}

                        {b.id === 'geography' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#64748b', mb: -1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location Details</Typography>
                                {draftLocation && !selectedCountry ? (
                                  <Box sx={{ mb: 2 }}>
                                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)', border: `1px solid rgba(0,0,0,0.05)`, mb: 2 }}>
                                      <Typography sx={{ fontWeight: 600, color: '#334155', mb: 0.5, fontSize: '0.85rem', textTransform: 'uppercase' }}>Saved Location</Typography>
                                      <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>{draftLocation}</Typography>
                                    </Paper>
                                    <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%', fontWeight: 500 }, mb: 3 }}>
                                      To edit this location, tap the Country dropdown below to reset your options.
                                    </Alert>
                                  </Box>
                                ) : null}
                              <PremiumAutocomplete colorTheme={color} label="Country *" options={countries} getOptionLabel={(opt: any) => opt.name || ''} value={selectedCountry} onChange={(e, val) => setSelectedCountry(val)} />
                              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                  <Box sx={{ flex: 1 }}>
                                      <PremiumAutocomplete colorTheme={color} label="State / Province *" options={states} getOptionLabel={(opt: any) => opt.name || ''} value={selectedState} onChange={(e, val) => setSelectedState(val)} disabled={!selectedCountry || states.length === 0} />
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                      <PremiumAutocomplete colorTheme={color} label={`City / LGA ${isRemote ? '(Optional)' : '*'}`} options={cities} getOptionLabel={(opt: any) => opt.name || ''} value={selectedCity} onChange={(e, val) => setSelectedCity(val)} disabled={!selectedState || cities.length === 0} />
                                  </Box>
                              </Box>
                          </Box>
                        )}

                        {b.id === 'compensation' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#64748b', mb: -1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time & Reward</Typography>
                                
                                <Alert severity="info" sx={{ borderRadius: 2, bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', '& .MuiAlert-icon': { color: '#3b82f6' } }}>
                                    <strong>Required to complete this block:</strong> {isVolunteer ? 'Duration / Engagement Length' : 'Currency, Min Budget, and Max Budget'}
                                </Alert>
                                
                                {/* Application Deadline — when can people apply by */}
                                <PremiumDatePicker colorTheme={color} fullWidth label="Application Deadline (Optional)" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

                                {/* ── Visual separator ── */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 0.5 }}>
                                    <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent 0%, ${alpha(color, 0.15)} 50%, transparent 100%)` }} />
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: alpha(color, 0.4), textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                                        Job Timeline
                                    </Typography>
                                    <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent 0%, ${alpha(color, 0.15)} 50%, transparent 100%)` }} />
                                </Box>

                                {/* Start / End — when does the work actually run */}
                                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                                    <Box sx={{ flex: 1 }}>
                                        <PremiumDatePicker colorTheme={color} fullWidth label="Start Date (Optional)" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <PremiumDatePicker colorTheme={color} fullWidth label="End Date (Optional)" value={endDate} onChange={(e) => setEndDate(e.target.value)} minDate={startDate ? new Date(startDate) : undefined} />
                                    </Box>
                                </Box>

                                {/* Auto-calculated duration */}
                                <PremiumTextField colorTheme={color} fullWidth label="Duration / Engagement Length *" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3 Months, Ongoing, Project-based (Auto-fills from dates)" />
                                
                                {isVolunteer ? (
                                     <PremiumPriceInput colorTheme={color} fullWidth label="Nerve Points Offered (Optional)" value={npAmount} onChange={(e: any) => setNpAmount(e.target.value)} placeholder="e.g. 500 NP" currencySymbol="NP" />
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                                            <Box sx={{ flex: 1 }}>
                                                <PremiumAutocomplete colorTheme={color} label="Currency *" options={CURRENCY_OPTIONS} value={currency} onChange={(e, val) => setCurrency(val as string)} disableClearable />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <PremiumPriceInput colorTheme={color} fullWidth label="Min Budget/Salary" value={minSalary} onChange={(e: any) => setMinSalary(e.target.value)} currencySymbol={currency} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <PremiumPriceInput colorTheme={color} fullWidth label="Max Budget/Salary" value={maxSalary} onChange={(e: any) => setMaxSalary(e.target.value)} currencySymbol={currency} />
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
                        {b.id === 'cta' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#64748b', mb: -1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Flow</Typography>
                            
                            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(color, 0.05), border: `1px solid ${alpha(color, 0.2)}` }}>
                                <Typography sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>How should candidates apply?</Typography>
                                <PremiumAutocomplete
                                    colorTheme={color}
                                    options={[
                                        ...((!isExternal && (isPlatformOwnerActive || activeOrgRank >= 3)) ? [{ label: 'Native Food Nerve Application', value: 'native' }] : []),
                                        { label: 'Direct Email', value: 'email' },
                                        { label: 'External Link', value: 'external' }
                                    ]}
                                    label="Select Application Method"
                                    value={{ 
                                        label: applicationMethod === 'native' ? 'Native Food Nerve Application' : applicationMethod === 'email' ? 'Direct Email' : 'External Link', 
                                        value: applicationMethod 
                                    }}
                                    onChange={(_, val) => {
                                        if (val) setApplicationMethod(val.value as any);
                                    }}
                                />

                                {applicationMethod === 'external' && (
                                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <PremiumTextField
                                            colorTheme={color}
                                            fullWidth
                                            label="External Application URL"
                                            value={applicationUrl}
                                            onChange={(e) => setApplicationUrl(e.target.value)}
                                            placeholder="https://company.com/careers/job-123"
                                        />
                                        <PremiumAutocomplete
                                            colorTheme={color}
                                            options={[
                                                { label: 'Apply Now', value: 'Apply Now' },
                                                { label: 'Apply on Company Site', value: 'Apply on Company Site' },
                                                { label: 'View Details', value: 'View Details' },
                                                { label: 'Submit Application', value: 'Submit Application' },
                                                { label: 'Register Interest', value: 'Register Interest' },
                                            ]}
                                            label="Button Text"
                                            value={{ label: externalButtonText, value: externalButtonText }}
                                            onChange={(_, val) => setExternalButtonText(val?.value || "Apply Now")}
                                        />
                                    </Box>
                                )}
                            </Box>

                            {applicationMethod === 'email' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <PremiumTextField colorTheme={color} fullWidth label="Application Email *" type="email" value={applicationEmail} onChange={(e) => setApplicationEmail(e.target.value)} placeholder="e.g. jobs@company.com" />
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, mb: 1, color: '#1e293b', fontSize: '0.9rem' }}>Application Instructions (Optional)</Typography>
                                        <PremiumMarkdownEditor 
                                            colorTheme={color} 
                                            value={applicationInstructions} 
                                            onChange={(e: any) => setApplicationInstructions(e?.target?.value ?? e)} 
                                            placeholder="e.g. Please format your subject line as..." 
                                        />
                                    </Box>
                                </Box>
                            )}

                            {applicationMethod === 'native' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2, borderRadius: '12px', bgcolor: alpha(color, 0.04), border: `1px solid ${alpha(color, 0.15)}` }}>
                                        <InfoOutlinedIcon sx={{ color, mt: 0.2 }} />
                                        <Typography sx={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                                            The Native Application is completed when <strong>at least one Required Document</strong> is toggled ON, or if you add Custom Questions. Selecting at least one ensures candidates have a clear submission process.
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography sx={{ fontWeight: 700, mb: 2, color: '#1e293b', fontSize: '1.1rem' }}>Required Documents</Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                            {[
                                                { label: 'Resume / CV', checked: requireResume, setter: setRequireResume },
                                                { label: 'Cover Letter', checked: requireCoverLetter, setter: setRequireCoverLetter },
                                                { label: 'Portfolio / Work', checked: requirePortfolio, setter: setRequirePortfolio }
                                            ].map((doc, idx) => (
                                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: '16px', bgcolor: alpha(color, 0.04), border: `1px solid ${alpha(color, 0.1)}`, transition: 'all 0.2s', '&:hover': { bgcolor: alpha(color, 0.08), borderColor: alpha(color, 0.2) } }}>
                                                    <Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>{doc.label}</Typography>
                                                    <PremiumSwitch colorTheme={color} checked={doc.checked} onChange={(e) => doc.setter(e.target.checked)} />
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography sx={{ fontWeight: 700, mb: 3, color: '#1e293b', fontSize: '1.1rem' }}>Custom Questions</Typography>
                                        {customQuestions.map((q, idx) => (
                                            <Box key={q.id} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 }, mb: 3, p: 3, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', bgcolor: '#fff', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                                <Typography sx={{ fontWeight: 800, color: alpha(color, 0.5), fontSize: '1.2rem', position: { xs: 'relative', md: 'absolute' }, left: { md: -16 }, top: { md: '50%' }, transform: { md: 'translateY(-50%)' } }}>
                                                    #{idx + 1}
                                                </Typography>
                                                <Box sx={{ width: { xs: '100%', md: '240px' } }}>
                                                    <PremiumAutocomplete 
                                                        colorTheme={color} 
                                                        label="Question Type" 
                                                        options={[
                                                            { label: 'Short Text', value: 'short_text' },
                                                            { label: 'Long Text (Rich)', value: 'markdown' },
                                                            { label: 'URL / Link', value: 'link' },
                                                            { label: 'Date', value: 'date' }
                                                        ]}
                                                        value={{
                                                            label: q.type === 'short_text' ? 'Short Text' : q.type === 'markdown' ? 'Long Text (Rich)' : q.type === 'link' ? 'URL / Link' : 'Date',
                                                            value: q.type
                                                        }}
                                                        onChange={(_, val) => {
                                                            if (val) {
                                                                const n = [...customQuestions]; 
                                                                n[idx].type = val.value as any; 
                                                                setCustomQuestions(n);
                                                            }
                                                        }}
                                                        disableClearable
                                                    />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <PremiumTextField colorTheme={color} fullWidth label="Question Prompt *" value={q.question} onChange={(e) => { const n = [...customQuestions]; n[idx].question = e.target.value; setCustomQuestions(n); }} />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, minWidth: { md: '140px' } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Required</Typography>
                                                        <PremiumSwitch colorTheme={color} checked={q.required} onChange={(e) => { const n = [...customQuestions]; n[idx].required = e.target.checked; setCustomQuestions(n); }} size="small" />
                                                    </Box>
                                                    <IconButton color="error" onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))} sx={{ bgcolor: 'rgba(239,68,68,0.1)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
                                                </Box>
                                            </Box>
                                        ))}
                                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCustomQuestions([...customQuestions, { id: Math.random().toString(), question: '', type: 'short_text', required: true }])} sx={{ borderRadius: '12px', color: color, borderColor: alpha(color, 0.4), bgcolor: alpha(color, 0.04), textTransform: 'none', fontWeight: 700, px: 3, py: 1.5, '&:hover': { borderColor: color, bgcolor: alpha(color, 0.1) } }}>
                                            Add Custom Question
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                          </Box>
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
            data={{
              title,
              companyName: isExternal ? externalEntityName : profile?.organizations?.find((o: any) => o.id === selectedEntityId)?.name || 'Unknown Entity',
              companyLogoUrl: isExternal ? externalEntityLogoUrl : profile?.organizations?.find((o: any) => o.id === selectedEntityId)?.logoUrl || '',
              category: sector || '',
              locationString: selectedCountry ? `${selectedCity ? selectedCity.name + ', ' : ''}${selectedState ? selectedState.name + ', ' : ''}${selectedCountry.name}` : '',
              duration,
              deadline,
              startDate,
              endDate,
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
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={() => {
              if (!title.trim() || !selectedCountry) {
                setError("Please add a job title and location to preview this listing.");
                scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                return;
              }
              setShowPreview(true);
            }}
            disabled={!title.trim() || !selectedCountry}
            startIcon={<SparkleIcon sx={{ color: '#64748b' }} />}
            sx={{
              color: '#64748b',
              fontWeight: 800,
              borderRadius: '12px',
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
                color: '#0f172a'
              },
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.8rem'
            }}
          >
            Preview
          </Button>
          <Button
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
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
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            variant="contained" 
            onClick={() => handleSubmit('active')} 
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


    </Box>
  );
}
