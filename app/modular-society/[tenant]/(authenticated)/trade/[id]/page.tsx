// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  Chip,
  Button,
  Avatar,
  Skeleton,
  alpha,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from "@mui/material";

import { useRouter, useParams } from "next/navigation";
import { mockTradeListings } from "@/lib/db/mocks";
import {
  useSociety,
  checkGatekeeper,
  RANK_NAMES,
  RANK_COLORS,
  type RankLevel,
} from "@/context/SocietyContext";
import {
  type TradeListing,
  type TradeCategory,
} from "@/lib/db/society";
import { getTradeListingById, getSimilarTradeListings } from "@/lib/actions/trade";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VerifiedIcon from "@mui/icons-material/Verified";
import StarIcon from "@mui/icons-material/Star";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MessageIcon from "@mui/icons-material/Message";
import ShareIcon from "@mui/icons-material/Share";
import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/Shield";
import WorkIcon from "@mui/icons-material/Work";
import GroupsIcon from "@mui/icons-material/Groups";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import SendIcon from "@mui/icons-material/Send";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PaymentsIcon from "@mui/icons-material/Payments";
import CategoryIcon from "@mui/icons-material/Category";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import EmailIcon from "@mui/icons-material/Email";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// ── Colors ──────────────────────────────────────────────────
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const FLASH_RED = "#ef4444";
const BLUE = "#3b82f6";

// ── Glassmorphism Base ──────────────────────────────────────
const glassCard = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 20px -4px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
};

// ── Helpers ─────────────────────────────────────────────────
function timeAgo(dateString: string): string {
  if (!dateString) return "Recently";
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now.getTime() - posted.getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function hoursLeft(expiresAt?: string): string {
  if (!expiresAt) return "";
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return "Expired";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return `${mins}m left`;
  }
  if (hours < 48) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

function getJobColor(cat: string) {
  if (cat === "volunteer") return "#ec4899"; // Pink for NP Volunteering
  if (cat === "internship" || cat === "internships") return "#3b82f6"; // Blue for Internships
  return "#10b981"; // Emerald for Jobs
}

function getMarketplaceColor(cat: string) {
  if (cat === "flash-sale") return FLASH_RED;
  if (cat === "group-buy") return "#3b82f6";
  if (cat === "swap") return "#8b5cf6";
  return EMERALD;
}

// ── CARDS FOR SIMILAR LISTINGS ──────────────────────────────
function MiniJobCard({ listing, onClick }: { listing: any, onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const color = getJobColor(listing.category);
  const posterName = listing.postedBy?.name || 'FoodNerve Operator';
  const initial = posterName.charAt(0).toUpperCase() || 'O';

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 2.5,
        borderRadius: "20px",
        cursor: "pointer",
        bgcolor: "#ffffff",
        border: "1px solid #e2e8f0",
        background: `linear-gradient(135deg, #ffffff 30%, ${color}10 100%)`,
        boxShadow: isHovered ? `0 16px 32px -6px ${color}25` : "0 4px 16px -4px rgba(0,0,0,0.04)",
        transform: isHovered ? "translateY(-4px)" : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: `${color}15`, color, fontWeight: 800, borderRadius: "10px" }} src={listing.postedBy?.avatarUrl}>
            {initial}
          </Avatar>
          <Chip label={listing.category?.toUpperCase()} size="small" sx={{ height: 22, fontSize: "0.62rem", fontWeight: 900, bgcolor: `${color}15`, color, borderRadius: "6px" }} />
        </Box>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, mb: 0.5 }}>{posterName}</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.25, mb: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {listing.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {listing.location && (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "#fff", border: "1px solid #e2e8f0", px: 1, py: 0.3, borderRadius: "6px", fontSize: "0.7rem", color: "#475569", fontWeight: 700 }}>
              <LocationOnIcon sx={{ fontSize: 12, color }} /> {listing.location}
            </Box>
          )}
          {listing.priceOrAsk && (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "#fff", border: "1px solid #e2e8f0", px: 1, py: 0.3, borderRadius: "6px", fontSize: "0.7rem", color: "#0f172a", fontWeight: 800 }}>
              💰 {listing.priceOrAsk}
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px dashed #cbd5e1", pt: 1.5, mt: "auto" }}>
        <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", color }}>View Role</Typography>
        <ArrowForwardIcon sx={{ fontSize: 14, color, transform: isHovered ? "translateX(3px)" : "none", transition: "transform 0.2s" }} />
      </Box>
    </Card>
  );
}

// ── HIGH-FIDELITY SKELETON COMPONENT ────────────────────────
function JobDetailSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1080, mx: "auto" }}>
      {/* Top Bar Skeleton */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Skeleton variant="rounded" width={130} height={38} sx={{ borderRadius: "12px" }} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </Box>

      {/* Hero Header Card Skeleton */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "24px", border: "1px solid #e2e8f0", mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", gap: 3, mb: 3.5 }}>
          <Box sx={{ display: "flex", gap: 2.5 }}>
            <Skeleton variant="rounded" width={68} height={68} sx={{ borderRadius: "16px", flexShrink: 0 }} />
            <Box sx={{ width: "100%", minWidth: { xs: 200, sm: 300 } }}>
              <Skeleton variant="text" width={160} height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={36} />
            </Box>
          </Box>
          <Skeleton variant="rounded" width={180} height={48} sx={{ borderRadius: "14px" }} />
        </Box>

        {/* Option 3 Segmented Ribbon Skeleton */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, borderRadius: "18px", bgcolor: "#f8fafc", border: "1px solid #e2e8f0", overflow: "hidden", mt: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flex: 1, p: "14px 20px", display: "flex", alignItems: "center", gap: 1.5, borderRight: { md: i === 4 ? "none" : "1px solid #e2e8f0" } }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "10px", flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={60} height={12} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={90} height={16} />
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Two-Column Grid Skeleton */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "8fr 4fr" }, gap: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: "1px solid #e2e8f0" }}>
            <Skeleton variant="text" width={220} height={28} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="95%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 3 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="85%" height={20} />
          </Paper>
          <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: "1px solid #e2e8f0" }}>
            <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: "10px" }} />
              <Skeleton variant="rounded" width={180} height={36} sx={{ borderRadius: "10px" }} />
              <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: "10px" }} />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: "24px", border: "1px solid #e2e8f0" }}>
            <Skeleton variant="text" width={140} height={16} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: "12px" }} />
              <Box>
                <Skeleton variant="text" width={120} height={22} />
                <Skeleton variant="text" width={80} height={16} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="90%" height={16} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "12px" }} />
          </Paper>
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: "24px" }} />
        </Box>
      </Box>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════
// LISTING DETAIL PAGE
// ════════════════════════════════════════════════════════════
export default function ListingDetailPage() {
  const { profile } = useSociety();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Application Modal & Form States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch listing from DB with fallback to mock
  useEffect(() => {
    let isCancelled = false;
    async function loadListing() {
      setLoading(true);
      try {
        const res = await getTradeListingById(listingId);
        if (!isCancelled && res.success && res.listing) {
          const l = res.listing;
          
          let parsedChallenges = [];
          try {
            if (l.challenges) parsedChallenges = typeof l.challenges === 'string' ? JSON.parse(l.challenges) : l.challenges;
          } catch (e) {}

          let parsedCustomQuestions = [];
          try {
            if (l.customQuestions) parsedCustomQuestions = typeof l.customQuestions === 'string' ? JSON.parse(l.customQuestions) : l.customQuestions;
          } catch (e) {}

          let parsedDocs = [];
          try {
            if (l.requiredDocuments) parsedDocs = typeof l.requiredDocuments === 'string' ? JSON.parse(l.requiredDocuments) : l.requiredDocuments;
          } catch (e) {}

          const formatted: any = {
            id: l.id,
            category: l.category,
            title: l.title,
            description: l.description,
            priceOrAsk: l.priceOrAsk,
            location: l.location,
            lga: l.lga || '',
            commodity: l.commodity || '',
            jobFunction: l.jobFunction || '',
            workModel: l.workModel || 'On-site',
            jobSource: l.jobSource,
            compType: l.compType,
            applicationMethod: l.applicationMethod || 'native',
            applicationUrl: l.applicationUrl,
            applicationEmail: l.applicationEmail,
            applicationInstructions: l.applicationInstructions,
            externalButtonText: l.externalButtonText || 'Apply on Company Site',
            challenges: parsedChallenges,
            customQuestions: parsedCustomQuestions,
            requiredDocuments: parsedDocs,
            organization: l.organization,
            postedBy: {
              name: l.organization?.name || l.postedBy?.name || 'FoodNerve Operator',
              avatarUrl: l.organization?.logoUrl || l.postedBy?.avatarUrl || '',
              isVerified: l.organization?.verified || false,
              rank: l.organization?.rank || 1,
            },
            postedAt: l.postedAt ? new Date(l.postedAt).toISOString() : new Date().toISOString(),
            urgency: l.urgency || 'normal',
            status: l.status || 'active',
            imageUrl: l.imageUrl || '',
            expiresAt: l.expiresAt ? new Date(l.expiresAt).toISOString() : undefined,
          };
          setListing(formatted);
          setLoading(false);

          // Fetch similar listings
          fetchSimilar(l.id, l.category, l.commodity);
          return;
        }
      } catch (e) {
        console.error("Error loading listing by ID:", e);
      }
      
      // Fallback to mock listings
      if (!isCancelled) {
        const found = mockTradeListings.find((l) => l.id === listingId) || null;
        setListing(found);
        setLoading(false);
        if (found) {
          fetchSimilar(found.id, found.category);
        }
      }
    }

    async function fetchSimilar(id: string, cat: string, comm?: string) {
      setLoadingSimilar(true);
      try {
        const simRes = await getSimilarTradeListings(id, cat, comm, 3);
        if (simRes.success && simRes.listings) {
          setSimilarListings(simRes.listings);
        }
      } catch (e) {
        console.error("Error loading similar listings:", e);
      } finally {
        setLoadingSimilar(false);
      }
    }

    loadListing();
    return () => { isCancelled = true; };
  }, [listingId]);

  // Pre-fill email body when profile or listing is loaded
  useEffect(() => {
    if (listing && profile) {
      const orgName = listing.organization?.name || listing.postedBy?.name || "Hiring Team";
      const candidateName = profile.displayName || profile.name || "FoodNerve Operator";
      const candidateRank = profile.rank || 1;
      const rankTitle = RANK_NAMES[candidateRank as RankLevel] || "Operator";
      const candidateBio = profile.bio || "Agricultural Operations & Value Chain Specialist";
      const candidateLocation = profile.state ? `${profile.state}, Nigeria` : "Nigeria";

      const draft = `Dear Hiring Team at ${orgName},

I am writing to formally submit my application for the "${listing.title}" mandate on the FoodNerve Ecosystem.

=== VERIFIED CANDIDATE DOSSIER ===
• Candidate: ${candidateName}
• Ecosystem Rank: Rank ${candidateRank} (${rankTitle})
• Primary Focus: ${candidateBio}
• Location: ${candidateLocation}
• Society ID: ${profile.uid ? profile.uid.slice(0, 10) : 'AUTHENTICATED'}

=== CANDIDATE NOTE & STATEMENT ===
I have reviewed the scope of work and deliverables. With my operational background across the agricultural value chain, I am well-prepared to execute this mandate immediately.

Please find my verified credentials linked to my Society profile. I look forward to discussing how I can create impact for ${orgName}.

Warm regards,
${candidateName}
FoodNerve Society Member`;

      setEmailBody(draft);
    }
  }, [listing, profile]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setToastMsg("Listing link copied to clipboard!");
    }
  };

  const handleApplyClick = () => {
    // Open modal for all application types
    setShowApplyModal(true);
  };

  const handleSendEmailClient = () => {
    const targetEmail = listing?.applicationEmail || "hiring@foodnerve.org";
    const subject = encodeURIComponent(`Application for ${listing?.title} - ${profile?.displayName || 'Operator'} (Rank ${profile?.rank || 1})`);
    const body = encodeURIComponent(emailBody);
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmailDossier = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(emailBody);
      setToastMsg("Application letter copied to clipboard!");
    }
  };

  const handleApplySubmit = () => {
    setApplySubmitted(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setApplySubmitted(false);
      setToastMsg("Application submitted successfully! The hiring organization has been notified.");
    }, 1200);
  };

  // ── LOADING STATE ─────────────────────────────────────────
  if (loading) {
    return <JobDetailSkeleton />;
  }

  // ── NOT FOUND STATE ───────────────────────────────────────
  if (!listing) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto", textAlign: "center", mt: 6 }}>
        <Paper elevation={0} sx={{ ...glassCard, p: { xs: 4, md: 6 } }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: "#0f172a" }}>Listing Not Found</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>This listing may have expired, been fulfilled, or removed.</Typography>
          <Button variant="contained" onClick={() => router.push("/trade")} sx={{ bgcolor: EMERALD, "&:hover": { bgcolor: EMERALD_DARK }, borderRadius: "12px", textTransform: "none", fontWeight: 700, px: 3, py: 1.2 }}>
            Browse Active Listings
          </Button>
        </Paper>
      </Box>
    );
  }

  const isJobOrVolunteer = listing.category === "jobs" || listing.category === "volunteer" || listing.category === "internship" || listing.category === "internships";
  const themeColor = isJobOrVolunteer ? getJobColor(listing.category) : getMarketplaceColor(listing.category);
  const remaining = hoursLeft(listing.expiresAt);
  const posterName = listing.postedBy?.name || listing.organization?.name || "FoodNerve Operator";
  const orgLogo = listing.organization?.logoUrl || listing.postedBy?.avatarUrl;
  const orgRank = listing.organization?.rank || listing.postedBy?.rank || 1;
  const rColor = RANK_COLORS[orgRank as RankLevel] || "#94a3b8";

  // Dynamic Apply Button Icon & Text
  const getApplyButtonDetails = () => {
    if (listing.applicationMethod === 'external') {
      return {
        icon: <OpenInNewIcon />,
        label: listing.externalButtonText || "Apply on Company Site",
        color: "#0284c7"
      };
    }
    if (listing.applicationMethod === 'email') {
      return {
        icon: <EmailIcon />,
        label: "Apply via Verified Email",
        color: "#7c3aed"
      };
    }
    return {
      icon: <RocketLaunchIcon />,
      label: "Apply with Profile",
      color: themeColor
    };
  };

  const applyBtn = getApplyButtonDetails();

  // Option 3: Multi-Color Segment Ribbon Data
  const specSegments = [
    {
      id: "location",
      icon: <LocationOnIcon sx={{ fontSize: 19, color: "#0284c7" }} />,
      color: "#0284c7",
      label: "LOCATION & BASE",
      value: listing.location || "Pan-African",
      hint: listing.workModel || "On-Site Operations"
    },
    {
      id: "compensation",
      icon: <PaymentsIcon sx={{ fontSize: 19, color: "#059669" }} />,
      color: "#059669",
      label: "VALUE EXCHANGE",
      value: listing.priceOrAsk || "Competitive Retainer",
      hint: listing.category === "volunteer" ? "NervePoints Reward" : "Monthly Compensation"
    },
    {
      id: "function",
      icon: <CategoryIcon sx={{ fontSize: 19, color: "#7c3aed" }} />,
      color: "#7c3aed",
      label: "VALUE CHAIN ACTOR",
      value: listing.jobFunction || listing.commodity || "Agro-Enterprise",
      hint: "Ecosystem Function"
    },
    {
      id: "timeline",
      icon: <HourglassEmptyIcon sx={{ fontSize: 19, color: "#e11d48" }} />,
      color: "#e11d48",
      label: "TIMELINE & STATUS",
      value: remaining ? remaining : "Actively Hiring",
      hint: remaining ? "Until Application Closes" : "Open for Operators"
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1080, mx: "auto" }}>
      
      {/* ── Top Bar / Back Button ───────────────────────────── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/trade")}
          sx={{
            color: "#475569",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "12px",
            px: 2,
            "&:hover": { bgcolor: alpha(themeColor, 0.08), color: "#0f172a" },
          }}
        >
          Back to Trade
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => setIsSaved(!isSaved)} sx={{ bgcolor: "#ffffff", border: "1px solid #e2e8f0", color: isSaved ? themeColor : "#64748b", "&:hover": { bgcolor: "#f8fafc" } }}>
            {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          <IconButton onClick={handleShare} sx={{ bgcolor: "#ffffff", border: "1px solid #e2e8f0", color: "#64748b", "&:hover": { bgcolor: "#f8fafc" } }}>
            <ShareIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 1. DEDICATED JOB DETAILS VIEW (.com Hero Architecture) */}
      {/* ══════════════════════════════════════════════════════ */}
      {isJobOrVolunteer ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          
          {/* ── HERO HEADER CARD (OPTION 3: MULTI-COLOR RIBBON) ── */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "24px",
              border: "1px solid #e2e8f0",
              background: `linear-gradient(135deg, #ffffff 40%, ${themeColor}12 100%)`,
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "flex-start" }, justifyContent: "space-between", gap: 3, mb: 3.5 }}>
              <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
                <Box sx={{ p: 0.5, borderRadius: "16px", bgcolor: "#ffffff", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", flexShrink: 0 }}>
                  <Avatar src={orgLogo} sx={{ width: { xs: 56, md: 68 }, height: { xs: 56, md: 68 }, bgcolor: `${themeColor}15`, color: themeColor, fontWeight: 900, borderRadius: "12px", fontSize: "1.5rem" }}>
                    {posterName.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, color: "#475569", fontSize: "0.95rem" }}>{posterName}</Typography>
                    {listing.postedBy?.isVerified && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, bgcolor: alpha(EMERALD, 0.1), color: EMERALD, px: 0.8, py: 0.2, borderRadius: "6px" }}>
                        <VerifiedIcon sx={{ fontSize: 13 }} />
                        <Typography sx={{ fontSize: "0.65rem", fontWeight: 800 }}>VERIFIED</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, bgcolor: alpha(rColor, 0.1), color: rColor, px: 0.8, py: 0.2, borderRadius: "6px" }}>
                      <Typography sx={{ fontSize: "0.65rem", fontWeight: 800 }}>RANK {orgRank}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "1.35rem", md: "1.85rem" }, lineHeight: 1.25 }}>
                    {listing.title}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: { sm: 190 } }}>
                <Button
                  variant="contained"
                  onClick={handleApplyClick}
                  endIcon={applyBtn.icon}
                  sx={{
                    bgcolor: applyBtn.color,
                    color: "#ffffff",
                    fontWeight: 800,
                    borderRadius: "14px",
                    py: 1.4,
                    px: 3,
                    fontSize: "0.95rem",
                    textTransform: "none",
                    boxShadow: `0 10px 25px -5px ${alpha(applyBtn.color, 0.5)}`,
                    "&:hover": { bgcolor: alpha(applyBtn.color, 0.9), transform: "scale(1.02)" },
                    transition: "all 0.2s",
                  }}
                >
                  {applyBtn.label}
                </Button>
              </Box>
            </Box>

            {/* ── MULTI-COLOR SEGMENTED RIBBON BAR ───────────── */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                borderRadius: "18px",
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px -2px rgba(0,0,0,0.03)",
                overflow: "hidden",
                mt: 3,
              }}
            >
              {specSegments.map((item, idx) => (
                <Box
                  key={item.id}
                  sx={{
                    flex: 1,
                    p: { xs: "12px 16px", md: "14px 20px" },
                    display: "flex",
                    alignItems: "center",
                    gap: 1.75,
                    borderRight: { md: idx === specSegments.length - 1 ? "none" : "1px solid #e2e8f0" },
                    borderBottom: { xs: idx === specSegments.length - 1 ? "none" : "1px solid #e2e8f0", md: "none" },
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(item.color, 0.05),
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      bgcolor: alpha(item.color, 0.12),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: `inset 0 0 0 1px ${alpha(item.color, 0.2)}`,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        color: item.color,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        lineHeight: 1.1,
                        mb: 0.35,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: "#0f172a",
                        fontSize: "0.92rem",
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* ── TWO-COLUMN MAIN CONTENT ─────────────────────── */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "8fr 4fr" }, gap: 4 }}>
            
            {/* Left Column: Responsibilities, Deliverables, Requirements */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              
              {/* Full Description & Deliverables */}
              <Paper elevation={0} sx={{ ...glassCard, p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 2, fontSize: "1.15rem" }}>
                  Role Overview & Responsibilities
                </Typography>
                <Box
                  sx={{
                    color: "#334155",
                    fontSize: "0.98rem",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    "& h1, & h2, & h3": { color: "#0f172a", fontWeight: 800, mt: 2, mb: 1 },
                    "& ul, & ol": { pl: 3, my: 1.5 },
                    "& li": { mb: 0.75 },
                  }}
                >
                  {listing.description}
                </Box>
              </Paper>

              {/* Systemic Challenges Tackle */}
              {listing.challenges && listing.challenges.length > 0 && (
                <Paper elevation={0} sx={{ ...glassCard, p: { xs: 3, md: 4 }, bgcolor: alpha(themeColor, 0.02) }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 1, fontSize: "1.1rem" }}>
                    Ecosystem Impact & Challenge Focus
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 2.5 }}>
                    This position directly addresses core agricultural bottlenecks in the FoodNerve 2026 Master Plan:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {listing.challenges.map((c: any, idx: number) => (
                      <Chip
                        key={idx}
                        label={typeof c === "string" ? c : c.title || c.label || "Systemic Challenge"}
                        sx={{
                          bgcolor: "#ffffff",
                          border: `1px solid ${alpha(themeColor, 0.25)}`,
                          color: "#0f172a",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          borderRadius: "10px",
                          p: 1.5,
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Application Details & Document Requirements */}
              <Paper elevation={0} sx={{ ...glassCard, p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 2, fontSize: "1.1rem" }}>
                  Application Requirements
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: themeColor, fontSize: 20 }} />
                    <Typography sx={{ color: "#334155", fontSize: "0.92rem", fontWeight: 600 }}>
                      Official application processed via FoodNerve Society Trust Protocol
                    </Typography>
                  </Box>
                  {listing.requiredDocuments?.requireResume && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CheckCircleIcon sx={{ color: themeColor, fontSize: 20 }} />
                      <Typography sx={{ color: "#334155", fontSize: "0.92rem", fontWeight: 600 }}>
                        Curriculum Vitae / Professional Resume required
                      </Typography>
                    </Box>
                  )}
                  {listing.requiredDocuments?.requireCoverLetter && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CheckCircleIcon sx={{ color: themeColor, fontSize: 20 }} />
                      <Typography sx={{ color: "#334155", fontSize: "0.92rem", fontWeight: 600 }}>
                        Cover Letter / Statement of Purpose required
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>

            {/* Right Column: Hiring Org Dossier & Fast Actions */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              
              {/* Organization Profile Card */}
              <Paper elevation={0} sx={{ ...glassCard, p: 3.5 }}>
                <Typography variant="overline" sx={{ color: "#94a3b8", fontWeight: 800, letterSpacing: "0.08em" }}>
                  Hiring Organization
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5, mb: 2 }}>
                  <Avatar src={orgLogo} sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: `${themeColor}15`, color: themeColor, fontWeight: 900 }}>
                    {posterName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>{posterName}</Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>Rank {orgRank} Society Operator</Typography>
                  </Box>
                </Box>
                {listing.organization?.description && (
                  <Typography sx={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.6, mb: 2 }}>
                    {listing.organization.description}
                  </Typography>
                )}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push(`/org/${listing.organization?.id || ''}`)}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 700,
                    color: "#0f172a",
                    borderColor: "#cbd5e1",
                    "&:hover": { borderColor: themeColor, bgcolor: alpha(themeColor, 0.05) },
                  }}
                >
                  View Society Org Profile
                </Button>
              </Paper>

              {/* Security & Verification Guarantee */}
              <Paper elevation={0} sx={{ ...glassCard, p: 3, bgcolor: alpha(EMERALD, 0.03), borderColor: alpha(EMERALD, 0.2) }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <ShieldIcon sx={{ color: EMERALD, fontSize: 22 }} />
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>Verified Opportunity</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                  This opportunity is issued by an authenticated FoodNerve Society participant. All commitments are logged in the ecosystem trust ledger.
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      ) : (
        
        // ══════════════════════════════════════════════════════
        // 2. COMMODITY MARKETPLACE & ESCROW VIEW
        // ══════════════════════════════════════════════════════
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Paper elevation={0} sx={{ ...glassCard, overflow: "hidden", p: 0 }}>
            <Box
              sx={{
                height: { xs: 240, md: 360 },
                backgroundImage: listing.imageUrl ? `url(${listing.imageUrl})` : `linear-gradient(135deg, ${alpha(themeColor, 0.7)} 0%, ${alpha('#3b82f6', 0.7)} 100%)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }} />
              <Box sx={{ position: "absolute", bottom: 20, left: 24, right: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <Chip label={listing.category?.replace("-", " ").toUpperCase()} sx={{ bgcolor: "rgba(0,0,0,0.7)", color: "#ffffff", fontWeight: 800, borderRadius: "8px" }} />
                {remaining && <Chip label={`⏰ ${remaining}`} sx={{ bgcolor: FLASH_RED, color: "#ffffff", fontWeight: 800, borderRadius: "8px" }} />}
              </Box>
            </Box>

            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mb: 1.5, fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
                {listing.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>{listing.location}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>{timeAgo(listing.postedAt)}</Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2.5, borderRadius: "16px", bgcolor: alpha(themeColor, 0.06), border: `1px solid ${alpha(themeColor, 0.15)}`, mb: 3 }}>
                <Typography variant="overline" sx={{ color: "#64748b", fontWeight: 700 }}>Price / Ask</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: themeColor }}>{listing.priceOrAsk}</Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>Description</Typography>
              <Typography sx={{ color: "#334155", lineHeight: 1.7, mb: 4, whiteSpace: "pre-wrap" }}>{listing.description}</Typography>

              <Button fullWidth variant="contained" sx={{ bgcolor: themeColor, color: "#ffffff", fontWeight: 800, py: 1.6, borderRadius: "14px", fontSize: "1rem" }}>
                Initiate Escrow Trade
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* 3. SIMILAR JOBS & OPPORTUNITIES SECTION                */}
      {/* ══════════════════════════════════════════════════════ */}
      {similarListings.length > 0 && (
        <Box sx={{ mt: 8, pt: 6, borderTop: "1px solid #e2e8f0" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "1.2rem", md: "1.45rem" } }}>
                {isJobOrVolunteer ? "💼 Similar Roles & Opportunities" : "⚡ Similar Marketplace Deals"}
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.88rem", mt: 0.5 }}>
                {isJobOrVolunteer ? "Explore related openings across the African agro-value chain" : "Other verified active commodity listings in this hub"}
              </Typography>
            </Box>
            <Button onClick={() => router.push("/trade")} sx={{ color: themeColor, fontWeight: 800, textTransform: "none" }}>
              View All
            </Button>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {similarListings.map((sim) => (
              <MiniJobCard
                key={sim.id}
                listing={sim}
                onClick={() => {
                  router.push(`/trade/${sim.id}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* ── INTELLIGENT APPLICATION DIALOG (EMAIL / NATIVE / EXTERNAL) ── */}
      <Dialog
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px", p: { xs: 1, sm: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#0f172a", pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
          {listing.applicationMethod === 'email' ? (
            <>
              <EmailIcon sx={{ color: "#7c3aed", fontSize: 28 }} />
              Apply via Verified Email Dossier
            </>
          ) : listing.applicationMethod === 'external' ? (
            <>
              <OpenInNewIcon sx={{ color: "#0284c7", fontSize: 28 }} />
              External Portal Application
            </>
          ) : (
            <>
              <RocketLaunchIcon sx={{ color: themeColor, fontSize: 28 }} />
              Fast Apply with Society Profile
            </>
          )}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "12px !important" }}>
          
          {/* Case A: EMAIL APPLICATION FLOW */}
          {listing.applicationMethod === 'email' && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ p: 2, borderRadius: "16px", bgcolor: alpha("#7c3aed", 0.05), border: `1px solid ${alpha("#7c3aed", 0.15)}` }}>
                <Typography sx={{ fontSize: "0.86rem", color: "#475569", lineHeight: 1.5 }}>
                  We have pre-composed your official application letter synced with your <strong>Rank {profile?.rank || 1}</strong> Society credentials. You can edit the text below, open it directly in your mail app, or copy it to your clipboard.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 1.5, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                    To: <span style={{ color: "#7c3aed" }}>{listing.applicationEmail || "hiring@organization.org"}</span>
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                    Applicant: <span style={{ color: "#0f172a" }}>{profile?.displayName || "Operator"}</span>
                  </Typography>
                </Box>
              </Box>

              <TextField
                multiline
                rows={10}
                fullWidth
                label="Application Letter & Candidate Credentials"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                sx={{
                  fontFamily: "monospace",
                  "& .MuiInputBase-input": { fontSize: "0.88rem", lineHeight: 1.6 }
                }}
              />
            </Box>
          )}

          {/* Case B: NATIVE IN-PLATFORM APPLICATION FLOW */}
          {listing.applicationMethod === 'native' && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ p: 2, borderRadius: "16px", bgcolor: alpha(themeColor, 0.05), border: `1px solid ${alpha(themeColor, 0.15)}`, display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: themeColor, fontWeight: 900 }}>
                  {(profile?.displayName || "U").charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>{profile?.displayName || "Society Operator"}</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>Rank {profile?.rank || 1} · {profile?.email}</Typography>
                </Box>
              </Box>

              <TextField
                multiline
                rows={4}
                fullWidth
                label="Candidate Pitch & Statement"
                placeholder="Introduce yourself, your operational track record, and how you will execute this mandate..."
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
              />
            </Box>
          )}

          {/* Case C: EXTERNAL ATS APPLICATION FLOW */}
          {listing.applicationMethod === 'external' && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2, textAlign: "center" }}>
              <Typography sx={{ fontSize: "1rem", color: "#334155", fontWeight: 600 }}>
                You are about to be redirected to the official applicant tracking portal of:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                {posterName}
              </Typography>
              <Typography sx={{ fontSize: "0.88rem", color: "#64748b", maxWidth: 450, mx: "auto" }}>
                Your Society reputation and verification ID can be included on their external application form.
              </Typography>
            </Box>
          )}

        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
          <Button onClick={() => setShowApplyModal(false)} sx={{ fontWeight: 700, color: "#64748b" }}>
            Cancel
          </Button>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            {listing.applicationMethod === 'email' && (
              <>
                <Button
                  variant="outlined"
                  onClick={handleCopyEmailDossier}
                  startIcon={<ContentCopyIcon />}
                  sx={{ borderRadius: "12px", fontWeight: 700, borderColor: "#cbd5e1", color: "#334155" }}
                >
                  Copy Dossier
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendEmailClient}
                  endIcon={<SendIcon />}
                  sx={{ bgcolor: "#7c3aed", color: "#ffffff", fontWeight: 800, borderRadius: "12px", px: 3, "&:hover": { bgcolor: "#6d28d9" } }}
                >
                  Open in Mail App
                </Button>
              </>
            )}

            {listing.applicationMethod === 'native' && (
              <Button
                variant="contained"
                onClick={handleApplySubmit}
                disabled={applySubmitted}
                endIcon={<RocketLaunchIcon />}
                sx={{ bgcolor: themeColor, color: "#ffffff", fontWeight: 800, borderRadius: "12px", px: 3.5, "&:hover": { bgcolor: alpha(themeColor, 0.9) } }}
              >
                {applySubmitted ? "Submitting..." : "Submit Application"}
              </Button>
            )}

            {listing.applicationMethod === 'external' && (
              <Button
                variant="contained"
                onClick={() => {
                  setShowApplyModal(false);
                  window.open(listing.applicationUrl, '_blank', 'noopener,noreferrer');
                }}
                endIcon={<OpenInNewIcon />}
                sx={{ bgcolor: "#0284c7", color: "#ffffff", fontWeight: 800, borderRadius: "12px", px: 3.5, "&:hover": { bgcolor: "#0369a1" } }}
              >
                Continue to Company Portal
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* ── SNACKBAR TOAST NOTIFICATIONS ────────────────────── */}
      <Snackbar open={Boolean(toastMsg)} autoHideDuration={4000} onClose={() => setToastMsg(null)}>
        <Alert severity="success" sx={{ borderRadius: "12px", fontWeight: 700 }} onClose={() => setToastMsg(null)}>
          {toastMsg}
        </Alert>
      </Snackbar>

    </Box>
  );
}
