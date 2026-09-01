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

import PremiumAutocomplete from "@/components/PremiumAutocomplete";
import PremiumMarkdownEditor from "@/components/PremiumMarkdownEditor";
import ShareListingModal from "@/components/ShareListingModal";
import { toggleBookmark, checkIsBookmarked } from "@/lib/actions/bookmarks";
import { getEnrichedChallenges, formatDeadlineRemaining, parseMarkdownToHtml } from "../components/PreviewListingModal";

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
import LinkIcon from "@mui/icons-material/Link";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// ── Colors ──────────────────────────────────────────────────
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const FLASH_RED = "#ef4444";
const BLUE = "#3b82f6";
const PURPLE = "#7c3aed";

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
  const hours = Math.floor(diffMs / (1000 * 60));
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
        p: { xs: 2, sm: 2.5 },
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
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: `${color}15`, color, fontWeight: 800, borderRadius: "10px" }} src={listing.postedBy?.avatarUrl}>
            {initial}
          </Avatar>
          <Chip label={listing.category?.toUpperCase()} size="small" sx={{ height: 20, fontSize: "0.6rem", fontWeight: 900, bgcolor: `${color}15`, color, borderRadius: "6px" }} />
        </Box>
        <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, mb: 0.3 }}>{posterName}</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", fontSize: { xs: "0.92rem", sm: "1rem" }, lineHeight: 1.25, mb: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {listing.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 1.5 }}>
          {listing.location && (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, bgcolor: "#fff", border: "1px solid #e2e8f0", px: 0.8, py: 0.2, borderRadius: "6px", fontSize: "0.68rem", color: "#475569", fontWeight: 700 }}>
              <LocationOnIcon sx={{ fontSize: 11, color }} /> {listing.location}
            </Box>
          )}
          {listing.priceOrAsk && (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, bgcolor: "#fff", border: "1px solid #e2e8f0", px: 0.8, py: 0.2, borderRadius: "6px", fontSize: "0.68rem", color: "#0f172a", fontWeight: 800 }}>
              💰 {listing.priceOrAsk}
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px dashed #cbd5e1", pt: 1.2, mt: "auto" }}>
        <Typography sx={{ fontWeight: 800, fontSize: "0.76rem", color }}>View Role</Typography>
        <ArrowForwardIcon sx={{ fontSize: 13, color, transform: isHovered ? "translateX(3px)" : "none", transition: "transform 0.2s" }} />
      </Box>
    </Card>
  );
}

// remove duplicate declaration if present

// ── HIGH-FIDELITY SKELETON COMPONENT ────────────────────────
function JobDetailSkeleton() {
  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 4 }, pb: { xs: 16, sm: 12, md: 6 }, maxWidth: 1080, mx: "auto", width: "100%", boxSizing: "border-box" }}>
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
    </Box>
  );
}

// ── PITCH PRESETS & AUTOCOMPLETE GENERATOR ──────────────────
interface PitchPreset {
  id: string;
  label: string;
  category: string;
  tagline: string;
  generate: (listing: any, profile: any) => string;
}

const PITCH_PRESETS: PitchPreset[] = [
  {
    id: "executive",
    label: "💼 Executive & Strategic Leadership",
    category: "Leadership",
    tagline: "Comprehensive executive overview with focus on value-chain governance & outcomes.",
    generate: (listing, profile) => {
      const orgName = listing?.organization?.name || listing?.postedBy?.name || "Hiring Team";
      const rawUsername = profile?.username || (profile?.email ? profile.email.split('@')[0] : (profile?.uid ? profile.uid.slice(0, 10) : 'operator'));
      const cleanUsername = (rawUsername || '').replace(/^@+/, '');
      const profileUrl = `https://foodnerve.org/@u-${cleanUsername}`;
      const candidateName = profile?.displayName || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : cleanUsername);
      const candidateRank = (profile?.currentRank || profile?.rank || 1) as RankLevel;
      const rankTitle = RANK_NAMES[candidateRank] || "Initiate";
      const candidateBio = profile?.bio || "Agricultural Operations & Value Chain Specialist";
      const candidateLocation = profile?.state ? `${profile.state}, Nigeria` : "Nigeria";

      return `Dear Hiring Team at ${orgName},

I am writing to formally submit my candidacy for the "${listing?.title}" position on the FoodNerve Ecosystem.

=== VERIFIED CANDIDATE DOSSIER ===
• Candidate: ${candidateName}
• FoodNerve Handle: @${cleanUsername}
• Verified Profile Link: ${profileUrl}
• Ecosystem Rank: Rank ${candidateRank} (${rankTitle})
• Focus Area: ${candidateBio}
• Location: ${candidateLocation}
• Society Authentication: Verified via FoodNerve Trust Protocol

=== STRATEGIC FIT & OPERATIONAL CAPABILITY ===
I have thoroughly evaluated the mandate deliverables, organizational expectations, and systemic challenge alignment. With authenticated standing within the FoodNerve Society and active leadership experience across African agricultural value chains, I am prepared to execute this mandate with rigorous discipline and measurable results.

My complete verified ledger, operational endorsements, and identity credentials can be reviewed directly at:
🔗 ${profileUrl}

I look forward to discussing how my strategic background aligns with the goals of ${orgName}.

Warm regards,

${candidateName}
FoodNerve Society Member (Rank ${candidateRank} ${rankTitle})
${profileUrl}`;
    }
  },
  {
    id: "field-operations",
    label: "🌾 Field Operations & Commodity Logistics",
    category: "Operations",
    tagline: "Action-oriented pitch centered on post-harvest handling, distribution & physical execution.",
    generate: (listing, profile) => {
      const orgName = listing?.organization?.name || listing?.postedBy?.name || "Hiring Team";
      const rawUsername = profile?.username || (profile?.email ? profile.email.split('@')[0] : (profile?.uid ? profile.uid.slice(0, 10) : 'operator'));
      const cleanUsername = (rawUsername || '').replace(/^@+/, '');
      const profileUrl = `https://foodnerve.org/@u-${cleanUsername}`;
      const candidateName = profile?.displayName || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : cleanUsername);
      const candidateRank = (profile?.currentRank || profile?.rank || 1) as RankLevel;
      const rankTitle = RANK_NAMES[candidateRank] || "Initiate";
      const candidateBio = profile?.bio || "Agricultural Field & Logistics Specialist";
      const candidateLocation = profile?.state ? `${profile.state}, Nigeria` : "Nigeria";

      return `Dear Hiring Team at ${orgName},

I am applying for the "${listing?.title}" opportunity on FoodNerve with an immediate focus on field execution and operational excellence.

=== VERIFIED CANDIDATE PROFILE ===
• Name: ${candidateName} (@${cleanUsername})
• Society Profile: ${profileUrl}
• Verified Rank: Rank ${candidateRank} (${rankTitle})
• Specialty: ${candidateBio}
• Base: ${candidateLocation}

=== OPERATIONAL READINESS ===
My experience directly covers agricultural commodity movement, hub management, farmer network coordination, and post-harvest mitigation. I bring boots-on-the-ground discipline and proven reliability within the FoodNerve network.

Verify my active field credentials and endorsements:
👉 ${profileUrl}

Ready for immediate deployment upon review.

Best regards,

${candidateName}
${profileUrl}`;
    }
  },
  {
    id: "innovation-tech",
    label: "⚡ AgTech, Digital Telemetry & Innovation",
    category: "Technology",
    tagline: "Technical pitch for software, data telemetry, cold-chain monitoring & agronomic innovation.",
    generate: (listing, profile) => {
      const orgName = listing?.organization?.name || listing?.postedBy?.name || "Hiring Team";
      const rawUsername = profile?.username || (profile?.email ? profile.email.split('@')[0] : (profile?.uid ? profile.uid.slice(0, 10) : 'operator'));
      const cleanUsername = (rawUsername || '').replace(/^@+/, '');
      const profileUrl = `https://foodnerve.org/@u-${cleanUsername}`;
      const candidateName = profile?.displayName || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : cleanUsername);
      const candidateRank = (profile?.currentRank || profile?.rank || 1) as RankLevel;
      const rankTitle = RANK_NAMES[candidateRank] || "Initiate";
      const candidateBio = profile?.bio || "Agritech & Digital Systems Specialist";
      const candidateLocation = profile?.state ? `${profile.state}, Nigeria` : "Nigeria";

      return `Dear Hiring Team at ${orgName},

I am excited to submit my application for the "${listing?.title}" mandate on FoodNerve.

=== CANDIDATE IDENTITY & TELEMETRY ===
• Candidate: ${candidateName}
• FoodNerve Handle: @${cleanUsername}
• Profile URL: ${profileUrl}
• Verification Tier: Rank ${candidateRank} (${rankTitle})
• Core Discipline: ${candidateBio}

=== TECHNICAL CONTRIBUTION ===
I specialize in leveraging technology, digital logistics tracking, data pipelines, and scalable agricultural innovations to streamline operations. I am eager to apply this technical toolkit to scale the impact of ${orgName}.

Full public portfolio and smart verification:
🔗 ${profileUrl}

Sincerely,

${candidateName}
${profileUrl}`;
    }
  },
  {
    id: "fast-pitch",
    label: "🚀 High-Impact Direct Pitch (Concise)",
    category: "Fast Apply",
    tagline: "Short, punchy, high-velocity mandate introduction with direct profile link.",
    generate: (listing, profile) => {
      const orgName = listing?.organization?.name || listing?.postedBy?.name || "Hiring Team";
      const rawUsername = profile?.username || (profile?.email ? profile.email.split('@')[0] : (profile?.uid ? profile.uid.slice(0, 10) : 'operator'));
      const cleanUsername = (rawUsername || '').replace(/^@+/, '');
      const profileUrl = `https://foodnerve.org/@u-${cleanUsername}`;
      const candidateName = profile?.displayName || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : cleanUsername);
      const candidateRank = (profile?.currentRank || profile?.rank || 1) as RankLevel;
      const rankTitle = RANK_NAMES[candidateRank] || "Initiate";

      return `Hello ${orgName} Hiring Team,

I am writing to express my strong interest in your "${listing?.title}" opening.

As an authenticated FoodNerve Society member (Rank ${candidateRank} ${rankTitle}), I bring proven execution capability and a track record across the African food value chain.

Please inspect my verified qualifications and society endorsements here:
🔗 ${profileUrl}

I would welcome a conversation to get started.

Warm regards,
${candidateName} (@${cleanUsername})
${profileUrl}`;
    }
  }
];

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
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Application Modal & Form States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<PitchPreset | null>(PITCH_PRESETS[0]);
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync bookmark state with database on mount
  useEffect(() => {
    const userId = profile?.uid || profile?.id;
    if (userId && listingId) {
      checkIsBookmarked({ userId, itemType: "trade", itemId: listingId }).then((res) => {
        if (res?.isSaved) {
          setIsSaved(true);
        }
      });
    }
  }, [profile?.uid, profile?.id, listingId]);

  const handleToggleBookmark = async () => {
    const userId = profile?.uid || profile?.id;
    if (!userId) {
      setToastMsg("Please sign in to bookmark listings");
      return;
    }
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    const res = await toggleBookmark({
      userId,
      itemType: "trade",
      itemId: listing.id,
      title: listing.title,
      metadata: {
        category: listing.category,
        priceOrAsk: listing.priceOrAsk,
        location: listing.location,
        posterName: listing.organization?.name || listing.postedBy?.name || "FoodNerve Operator"
      }
    });

    if (res.success) {
      setToastMsg(res.isSaved ? "Saved to your bookmarks!" : "Removed from your bookmarks!");
    } else {
      setIsSaved(!nextSavedState);
      setToastMsg("Failed to update bookmark");
    }
  };

  // Compute accurate FoodNerve username and profile link
  const rawUsername = profile?.username || (profile?.email ? profile.email.split('@')[0] : (profile?.uid ? profile.uid.slice(0, 10) : 'operator'));
  const cleanUsername = rawUsername.replace(/^@+/, '');
  const foodnerveProfileUrl = `https://foodnerve.org/@u-${cleanUsername}`;
  const candidateName = profile?.displayName || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : cleanUsername);
  const candidateRank = (profile?.currentRank || profile?.rank || 1) as RankLevel;
  const rankTitle = RANK_NAMES[candidateRank] || "Initiate";
  const candidateBio = profile?.bio || "Agro-Enterprise & Value Chain Operator";
  const candidateLocation = profile?.state ? `${profile.state}, Nigeria` : "Nigeria";

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

          if ((!parsedChallenges || parsedChallenges.length === 0) && l.organization?.challenges) {
            try {
              parsedChallenges = typeof l.organization.challenges === 'string' ? JSON.parse(l.organization.challenges) : l.organization.challenges;
            } catch (e) {}
          }

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
            postedBy: l.postedBy ? {
              id: l.postedBy.id,
              name: l.postedBy.name || l.postedBy.firstName || 'FoodNerve Operator',
              avatarUrl: l.postedBy.avatarUrl || '',
              username: l.postedBy.username || l.postedBy.id,
              rank: l.postedBy.rank || 1,
              role: l.postedBy.role || 'Talent Scout',
              verified: l.postedBy.verified || false
            } : null,
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

  // Pre-fill executive application email letter
  useEffect(() => {
    if (listing && profile) {
      const preset = selectedPreset || PITCH_PRESETS[0];
      setEmailBody(preset.generate(listing, profile));
    }
  }, [listing, profile, selectedPreset]);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleApplyClick = () => {
    if (listing) {
      const preset = selectedPreset || PITCH_PRESETS[0];
      setEmailBody(preset.generate(listing, profile));
    }
    setShowApplyModal(true);
  };

  const handlePresetSelect = (preset: PitchPreset | null) => {
    setSelectedPreset(preset);
    if (preset && listing) {
      setEmailBody(preset.generate(listing, profile));
      setToastMsg(`Applied "${preset.label}" tone template!`);
    }
  };

  const handleSendEmailClient = () => {
    const targetEmail = listing?.applicationEmail || "hiring@organization.org";
    const subject = encodeURIComponent(`Application: ${listing?.title} - ${candidateName} (@${cleanUsername})`);
    const body = encodeURIComponent(emailBody);
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmailDossier = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(emailBody);
      setToastMsg("Full application letter copied to clipboard!");
    }
  };

  const handleCopyProfileUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(foodnerveProfileUrl);
      setToastMsg("FoodNerve profile link copied to clipboard!");
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
      <Box sx={{ flex: 1, height: "100%", minHeight: 0, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", width: "100%", boxSizing: "border-box" }}>
        <Box sx={{ p: { xs: 2, md: 4 }, pb: { xs: 14, sm: 10, md: 6 }, maxWidth: 800, mx: "auto", textAlign: "center", mt: 6 }}>
          <Paper elevation={0} sx={{ ...glassCard, p: { xs: 4, md: 6 } }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: "#0f172a" }}>Listing Not Found</Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>This listing may have expired, been fulfilled, or removed.</Typography>
            <Button variant="contained" onClick={() => router.push("/trade")} sx={{ bgcolor: EMERALD, "&:hover": { bgcolor: EMERALD_DARK }, borderRadius: "12px", textTransform: "none", fontWeight: 700, px: 3, py: 1.2 }}>
              Browse Active Listings
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  }

  const isJobOrVolunteer = listing.category === "jobs" || listing.category === "volunteer" || listing.category === "internship" || listing.category === "internships";
  const themeColor = isJobOrVolunteer ? getJobColor(listing.category) : getMarketplaceColor(listing.category);
  const remaining = hoursLeft(listing.expiresAt);
  const orgName = listing.organization?.name || "FoodNerve Operator";
  const orgLogo = listing.organization?.logoUrl || "";
  const orgRank = listing.organization?.rank || 1;
  const initial = orgName.charAt(0).toUpperCase() || "O";
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
        color: PURPLE
      };
    }
    return {
      icon: <RocketLaunchIcon />,
      label: "Apply with Profile",
      color: themeColor
    };
  };

  const applyBtn = getApplyButtonDetails();

  const orgSlug = listing?.organization?.slug || (listing?.organization?.name ? listing.organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : (orgName ? orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'org'));
  const orgProfilePath = listing?.organization ? `/@o-${orgSlug}` : (listing?.postedBy?.username ? `/@u-${listing.postedBy.username.replace(/^@+/, '')}` : `/@o-${orgSlug}`);
  const orgPublicUrl = `https://foodnerve.org${orgProfilePath}`;
  const orgDisplayUrl = `foodnerve.org${orgProfilePath}`;

  const timelineInfo = formatDeadlineRemaining(listing.applicationDeadline || listing.deadline || listing.expiresAt);

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
      label: "SALARY / COMPENSATION",
      value: listing.priceOrAsk || "Competitive Retainer",
      hint: listing.category === "volunteer" ? "NervePoints Reward" : "Monthly Compensation"
    },
    {
      id: "function",
      icon: <CategoryIcon sx={{ fontSize: 19, color: "#7c3aed" }} />,
      color: "#7c3aed",
      label: "VALUE CHAIN FUNCTION",
      value: listing.jobFunction || listing.commodity || "Agro-Enterprise",
      hint: "Ecosystem Function"
    },
    {
      id: "timeline",
      icon: <HourglassEmptyIcon sx={{ fontSize: 19, color: "#e11d48" }} />,
      color: "#e11d48",
      label: "TIMELINE & STATUS",
      value: timelineInfo.text,
      hint: listing.duration ? `${listing.duration} Engagement` : timelineInfo.hint
    }
  ];

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 4 }, pb: { xs: 16, sm: 12, md: 6 }, maxWidth: 1080, mx: "auto", width: "100%", boxSizing: "border-box" }}>
      
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
          <Tooltip title="Share job as image or link">
            <IconButton onClick={() => setShowShareModal(true)} sx={{ bgcolor: "#ffffff", border: "1px solid #e2e8f0", color: "#64748b", "&:hover": { bgcolor: "#f8fafc" } }}>
              <ShareIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
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
              p: { xs: 2.5, sm: 3.5, md: 4 },
              borderRadius: { xs: "20px", md: "24px" },
              border: "1px solid #e2e8f0",
              background: `linear-gradient(135deg, #ffffff 40%, ${themeColor}12 100%)`,
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "flex-start" }, justifyContent: "space-between", gap: 3, mb: 3.5 }}>
              <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
                {orgLogo ? (
                  <Box
                    onClick={() => router.push(orgProfilePath)}
                    sx={{
                      p: 0.8,
                      borderRadius: "14px",
                      bgcolor: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.03)" },
                    }}
                  >
                    <Box
                      component="img"
                      src={orgLogo}
                      alt={orgName}
                      sx={{
                        maxHeight: { xs: 46, md: 54 },
                        maxWidth: { xs: 120, md: 160 },
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </Box>
                ) : (
                  <Avatar
                    onClick={() => router.push(orgProfilePath)}
                    sx={{
                      width: { xs: 52, md: 60 },
                      height: { xs: 52, md: 60 },
                      bgcolor: `${themeColor}15`,
                      color: themeColor,
                      fontWeight: 900,
                      borderRadius: "14px",
                      fontSize: "1.4rem",
                      cursor: "pointer",
                    }}
                  >
                    {initial}
                  </Avatar>
                )}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                    <Typography
                      onClick={() => router.push(orgProfilePath)}
                      sx={{ fontWeight: 800, color: "#475569", fontSize: "0.95rem", cursor: "pointer", "&:hover": { color: themeColor, textDecoration: "underline" } }}
                    >
                      {orgName}
                    </Typography>
                    {/* Only Rank 4+ organizations are verified */}
                    {orgRank >= 4 && (
                      <Tooltip title="Rank 4 Verified Organization">
                        <VerifiedIcon sx={{ fontSize: 16, color: EMERALD, verticalAlign: 'middle' }} />
                      </Tooltip>
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: { xs: "100%", sm: "auto" }, minWidth: { sm: 190 } }}>
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
              
              {/* Full Description Card with Rich Markdown Styling */}
              <Paper elevation={0} sx={{ ...glassCard, p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 2.5, fontSize: "1.2rem", letterSpacing: '-0.01em' }}>
                  Role Overview & Responsibilities
                </Typography>
                <Box
                  sx={{
                    color: "#334155",
                    fontFamily: 'inherit',
                    '& .md-h1': { fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', mt: 3, mb: 1.5 },
                    '& .md-h2': { fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', mt: 3, mb: 1.2 },
                    '& .md-h3': { fontSize: '1.12rem', fontWeight: 800, color: '#0f172a', mt: 2.5, mb: 1 },
                    '& .md-h4': { fontSize: '1rem', fontWeight: 700, color: '#0f172a', mt: 2, mb: 0.8 },
                    '& .md-p': { fontSize: '0.96rem', lineHeight: 1.8, color: '#334155', mb: 1.2 },
                    '& .md-ul, & .md-ol': { pl: 3, mb: 2, color: '#334155', fontSize: '0.96rem' },
                    '& .md-ul li, & .md-ol li': { mb: 0.6, lineHeight: 1.7 },
                    '& .md-quote': { borderLeft: `4px solid ${alpha(themeColor, 0.4)}`, pl: 2, my: 2, fontStyle: 'italic', color: '#64748b' },
                    '& .md-code': { bgcolor: '#f1f5f9', px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace', color: '#0f172a' },
                    '& .md-hr': { border: 'none', borderTop: '1px solid #e2e8f0', my: 3 },
                    '& .md-spacer': { height: '8px' },
                    '& strong': { color: '#0f172a', fontWeight: 700 },
                    '& em': { fontStyle: 'italic' }
                  }}
                >
                  {listing.description ? (
                    <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(listing.description, themeColor) }} />
                  ) : (
                    <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>No description provided yet.</Typography>
                  )}
                </Box>
              </Paper>

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
                  {orgLogo ? (
                    <Box
                      sx={{
                        p: 0.6,
                        borderRadius: "12px",
                        bgcolor: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        component="img"
                        src={orgLogo}
                        alt={orgName}
                        sx={{
                          maxHeight: 36,
                          maxWidth: 85,
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    </Box>
                  ) : (
                    <Avatar sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: `${themeColor}15`, color: themeColor, fontWeight: 900 }}>
                      {initial}
                    </Avatar>
                  )}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>{orgName}</Typography>
                      {orgRank >= 4 && (
                        <VerifiedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                      )}
                    </Box>
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
                  onClick={() => router.push(orgProfilePath)}
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

              {/* Job Poster Dossier Card */}
              {(() => {
                const posterUserName = listing.postedBy?.name || listing.postedBy?.firstName || 'Ecosystem Talent Scout';
                const posterUserAvatar = listing.postedBy?.avatarUrl || '';
                const posterUserRank = listing.postedBy?.rank || 1;
                const posterUserRole = listing.postedBy?.role || (posterUserRank >= 4 ? 'Ecosystem Pillar' : 'Talent Scout');
                const posterUsername = listing.postedBy?.username || listing.postedBy?.id || '';
                const posterProfileUrl = posterUsername ? `/@u-${posterUsername}` : '#';

                return (
                  <Paper
                    elevation={0}
                    sx={{
                      ...glassCard,
                      p: 3.5,
                      borderRadius: "24px",
                      border: "1px solid #e2e8f0",
                      background: "linear-gradient(135deg, #ffffff 60%, rgba(248,250,252,0.9) 100%)",
                      boxShadow: "0 4px 20px -4px rgba(0,0,0,0.04)",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        borderColor: alpha(themeColor, 0.4),
                        transform: "translateY(-2px)",
                        boxShadow: `0 12px 28px -6px rgba(0,0,0,0.08), 0 0 0 1px ${alpha(themeColor, 0.2)}`
                      }
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: "#94a3b8",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        fontSize: "0.72rem",
                        display: "block",
                        mb: 1.5
                      }}
                    >
                      Curated & Posted By
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Avatar
                        src={posterUserAvatar}
                        alt={posterUserName}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          bgcolor: alpha(themeColor, 0.1),
                          color: themeColor,
                          fontWeight: 900,
                          fontSize: "1.05rem",
                          border: `2px solid ${alpha(themeColor, 0.2)}`
                        }}
                      >
                        {posterUserName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: "#0f172a",
                              fontSize: "1rem",
                              lineHeight: 1.3,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {posterUserName}
                          </Typography>
                          {posterUserRank >= 4 && (
                            <VerifiedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                          )}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.4, flexWrap: "wrap" }}>
                          <Chip
                            label={`Rank ${posterUserRank}`}
                            size="small"
                            sx={{
                              bgcolor: alpha(themeColor, 0.1),
                              color: themeColor,
                              fontWeight: 800,
                              fontSize: "0.68rem",
                              height: 20,
                              borderRadius: "6px"
                            }}
                          />
                          <Typography sx={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 600 }}>
                            {posterUserRole}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography sx={{ color: "#475569", fontSize: "0.83rem", lineHeight: 1.55, mb: 2.5 }}>
                      Verified ecosystem participant actively stewarding talent and opportunities across the FoodNerve network.
                    </Typography>

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push(posterProfileUrl)}
                      sx={{
                        borderRadius: "14px",
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: "0.86rem",
                        py: 1.2,
                        borderColor: "#e2e8f0",
                        color: "#0f172a",
                        bgcolor: "#ffffff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                        "&:hover": {
                          borderColor: themeColor,
                          bgcolor: alpha(themeColor, 0.04),
                          color: themeColor
                        }
                      }}
                    >
                      View Poster Profile
                    </Button>
                  </Paper>
                );
              })()}

              {/* Security & Verification Guarantee (Only if poster or org is Rank 4+) */}
              {((listing.postedBy?.rank || 1) >= 4 || orgRank >= 4) && (
                <Paper elevation={0} sx={{ ...glassCard, p: 3, bgcolor: alpha(EMERALD, 0.03), borderColor: alpha(EMERALD, 0.2) }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <ShieldIcon sx={{ color: EMERALD, fontSize: 22 }} />
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>Verified Opportunity</Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                    This opportunity is issued by an authenticated FoodNerve Society participant. All commitments are logged in the ecosystem trust ledger.
                  </Typography>
                </Paper>
              )}

              {/* Ecosystem Impact & Challenge Focus (Right Column - Invisible Background) */}
              {(() => {
                const enrichedChallenges = getEnrichedChallenges(listing.challenges || []);
                if (enrichedChallenges.length === 0) return null;
                return (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
                    <Box sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
                        Ecosystem Impact & Challenge Focus
                      </Typography>
                      <Typography sx={{ color: "#64748b", fontSize: "0.82rem", mt: 0.4, lineHeight: 1.5 }}>
                        This position directly addresses core agricultural bottlenecks in the FoodNerve {new Date().getFullYear()} Master Plan:
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {enrichedChallenges.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            borderRadius: "20px",
                            bgcolor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 16px -2px rgba(0,0,0,0.04)",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.25s ease",
                            "&:hover": {
                              borderColor: alpha(themeColor, 0.4),
                              transform: "translateY(-2px)",
                              boxShadow: `0 12px 24px -6px rgba(0,0,0,0.08), 0 0 0 1px ${alpha(themeColor, 0.2)}`,
                              "& img": {
                                transform: "scale(1.04)"
                              }
                            }
                          }}
                        >
                          {/* Card Image */}
                          <Box
                            sx={{
                              width: "100%",
                              height: 140,
                              position: "relative",
                              overflow: "hidden",
                              bgcolor: alpha(themeColor, 0.08),
                              flexShrink: 0
                            }}
                          >
                            <Box
                              component="img"
                              src={item.imageUrl}
                              alt={item.title}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                transition: "transform 0.4s ease"
                              }}
                            />
                          </Box>

                          {/* Card Content */}
                          <Box sx={{ p: 2.5 }}>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.98rem",
                                color: "#0f172a",
                                lineHeight: 1.35,
                                mb: 1
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.82rem",
                                color: "#475569",
                                lineHeight: 1.6,
                                display: "-webkit-box",
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}
                            >
                              {item.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })()}
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

      {/* ── SHARE MANDATE MODAL (VISUAL CARD + SOCIAL EXPORT) ── */}
      <ShareListingModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        listing={listing}
        themeColor={themeColor}
        onToast={(msg) => setToastMsg(msg)}
      />

      {/* ══════════════════════════════════════════════════════ */}
      {/* ── ULTRA-PREMIUM APPLICATION DOSSIER DIALOG ─────────── */}
      {/* ══════════════════════════════════════════════════════ */}
      <Dialog
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "28px",
            p: 0,
            overflow: "hidden",
            boxShadow: "0 24px 60px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
          }
        }}
      >
        {/* Modal Hero Banner */}
        <Box
          sx={{
            p: { xs: 3, sm: 3.5 },
            background: listing.applicationMethod === 'email'
              ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)"
              : listing.applicationMethod === 'external'
                ? "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)"
                : "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
            color: "#ffffff",
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                }}
              >
                {listing.applicationMethod === 'email' ? (
                  <EmailIcon sx={{ color: "#ffffff", fontSize: 24 }} />
                ) : listing.applicationMethod === 'external' ? (
                  <OpenInNewIcon sx={{ color: "#ffffff", fontSize: 24 }} />
                ) : (
                  <RocketLaunchIcon sx={{ color: "#ffffff", fontSize: 24 }} />
                )}
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.75)" }}>
                  {listing.applicationMethod === 'email' ? "Official Email Dispatch" : listing.applicationMethod === 'external' ? "External ATS Application" : "Direct Society Application"}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#ffffff", lineHeight: 1.2 }}>
                  {listing.title}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={`To: ${orgName}`}
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.72rem",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            />
          </Box>
        </Box>

        <DialogContent sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", gap: 3 }}>
          
          {/* ── 1. HIRING COMPANY IDENTITY & ORGANIZATION DOSSIER CARD ────── */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: "20px",
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={orgLogo}
                sx={{
                  width: { xs: 46, sm: 52 },
                  height: { xs: 46, sm: 52 },
                  borderRadius: "14px",
                  bgcolor: `${themeColor}15`,
                  color: themeColor,
                  fontWeight: 900,
                  fontSize: "1.25rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                }}
              >
                {initial}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.3 }}>
                  <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
                    {orgName}
                  </Typography>
                  {listing.postedBy?.isVerified && (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, bgcolor: "rgba(16, 185, 129, 0.1)", color: EMERALD, px: 0.8, py: 0.2, borderRadius: "6px" }}>
                      <VerifiedIcon sx={{ fontSize: 13 }} />
                      <Typography sx={{ fontSize: "0.65rem", fontWeight: 800 }}>VERIFIED</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, bgcolor: alpha(rColor, 0.1), color: rColor, px: 0.8, py: 0.2, borderRadius: "6px" }}>
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 800 }}>RANK {orgRank}</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                  {listing.organization?.description || "FoodNerve Society Verified Hiring Organization"}
                </Typography>
              </Box>
            </Box>

            {/* Public Company Profile / Website URL Pill */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", sm: "auto" } }}>
              <Tooltip title="Open organization profile">
                <Button
                  onClick={() => {
                    router.push(orgProfilePath);
                  }}
                  startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    bgcolor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#0f172a",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "12px",
                    px: 1.8,
                    py: 0.8,
                    flex: { xs: 1, sm: "initial" },
                    "&:hover": { borderColor: themeColor, color: themeColor, bgcolor: alpha(themeColor, 0.04) },
                  }}
                >
                  {orgDisplayUrl}
                </Button>
              </Tooltip>
              <Tooltip title="Copy profile URL">
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(orgPublicUrl);
                    setToastMsg("Organization profile link copied!");
                  }}
                  sx={{ bgcolor: "#ffffff", border: "1px solid #cbd5e1", color: "#64748b", "&:hover": { color: themeColor, borderColor: themeColor } }}
                >
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* ── 2. EMAIL APPLICATION FLOW ──────────────────────── */}
          {listing.applicationMethod === 'email' && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              
              {/* Destination Email */}
              <Box sx={{ p: 1.5, px: 2, borderRadius: "12px", bgcolor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Destination Email
                </Typography>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: PURPLE }}>
                  {listing.applicationEmail || "hiring@organization.org"}
                </Typography>
              </Box>

              {/* ── PREMIUM AUTOCOMPLETE TEMPLATE SELECTOR ───────── */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: PURPLE }} />
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Application Pitch Preset & Tone
                  </Typography>
                </Box>
                <PremiumAutocomplete
                  colorTheme={PURPLE}
                  label="Select Application Preset / Tone"
                  placeholder="Choose an executive, field operations, or technical pitch..."
                  options={PITCH_PRESETS}
                  getOptionLabel={(option: any) => typeof option === "string" ? option : option.label}
                  value={selectedPreset}
                  onChange={(_, newValue: any) => handlePresetSelect(newValue)}
                  fullWidth
                />
              </Box>

              {/* ── PRE-COMPOSED LETTER (PREMIUM MARKDOWN EDITOR) ─── */}
              <Box sx={{ position: "relative" }}>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", mb: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Pre-Composed Candidate Letter (Fully Editable)
                </Typography>
                <PremiumMarkdownEditor
                  colorTheme={PURPLE}
                  label="Candidate Application Letter"
                  placeholder="Review or customize your cover letter and candidate statement..."
                  value={emailBody}
                  onChange={(e: any) => setEmailBody(e.target.value)}
                  rows={8}
                  fullWidth
                />
              </Box>
            </Box>
          )}

          {/* ── 3. NATIVE IN-PLATFORM APPLICATION FLOW ─────────── */}
          {listing.applicationMethod === 'native' && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography sx={{ fontSize: "0.88rem", color: "#475569" }}>
                Your candidacy, verified rank, and application statement will be recorded directly into the organization’s recruitment desk.
              </Typography>
              <PremiumMarkdownEditor
                colorTheme={themeColor}
                label="Candidate Pitch & Statement"
                placeholder="Introduce yourself, your operational track record, and how you will execute this mandate..."
                value={applyMessage}
                onChange={(e: any) => setApplyMessage(e.target.value)}
                rows={5}
                fullWidth
              />
            </Box>
          )}

          {/* ── 4. EXTERNAL ATS APPLICATION FLOW ───────────────── */}
          {listing.applicationMethod === 'external' && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2, textAlign: "center" }}>
              <Typography sx={{ fontSize: "1rem", color: "#334155", fontWeight: 600 }}>
                You are about to be redirected to the official applicant portal of:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                {orgName}
              </Typography>
              <Typography sx={{ fontSize: "0.88rem", color: "#64748b", maxWidth: 460, mx: "auto" }}>
                Make sure to include your verified FoodNerve public link (<strong>{foodnerveProfileUrl}</strong>) on your application form.
              </Typography>
            </Box>
          )}

        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            pt: 2,
            bgcolor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Button
            onClick={() => setShowApplyModal(false)}
            sx={{
              fontWeight: 700,
              color: "#64748b",
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              py: { xs: 1, sm: "auto" }
            }}
          >
            Cancel
          </Button>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, width: { xs: "100%", sm: "auto" } }}>
            {listing.applicationMethod === 'email' && (
              <>
                <Button
                  variant="outlined"
                  onClick={handleCopyEmailDossier}
                  startIcon={<ContentCopyIcon />}
                  sx={{
                    borderRadius: "14px",
                    fontWeight: 800,
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    textTransform: "none",
                    px: 2.5,
                    py: 1.2,
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": { borderColor: PURPLE, bgcolor: "rgba(124, 58, 237, 0.04)" }
                  }}
                >
                  Copy Full Letter
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendEmailClient}
                  sx={{
                    bgcolor: PURPLE,
                    color: "#ffffff",
                    fontWeight: 800,
                    borderRadius: "14px",
                    px: 3.5,
                    py: 1.2,
                    width: { xs: "100%", sm: "auto" },
                    textTransform: "none",
                    boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)",
                    "&:hover": { bgcolor: "#6d28d9" }
                  }}
                >
                  Apply via Email
                </Button>
              </>
            )}

            {listing.applicationMethod === 'native' && (
              <Button
                variant="contained"
                onClick={handleApplySubmit}
                disabled={applySubmitted}
                endIcon={<RocketLaunchIcon />}
                sx={{
                  bgcolor: themeColor,
                  color: "#ffffff",
                  fontWeight: 800,
                  borderRadius: "14px",
                  px: 3.5,
                  py: 1.2,
                  width: { xs: "100%", sm: "auto" },
                  textTransform: "none",
                  boxShadow: `0 10px 25px -5px ${alpha(themeColor, 0.4)}`,
                  "&:hover": { bgcolor: alpha(themeColor, 0.9) }
                }}
              >
                {applySubmitted ? "Submitting..." : "Submit Direct Application"}
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
                sx={{
                  bgcolor: "#0284c7",
                  color: "#ffffff",
                  fontWeight: 800,
                  borderRadius: "14px",
                  px: 3.5,
                  py: 1.2,
                  width: { xs: "100%", sm: "auto" },
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0369a1" }
                }}
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
    </Box>
  );
}
