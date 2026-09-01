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
  alpha,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  Container,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ShareListingModal from "@/components/ShareListingModal";
import PremiumAutocomplete from "@/components/PremiumAutocomplete";
import PremiumMarkdownEditor from "@/components/PremiumMarkdownEditor";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShareIcon from "@mui/icons-material/Share";
import ShieldIcon from "@mui/icons-material/Shield";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PaymentsIcon from "@mui/icons-material/Payments";
import CategoryIcon from "@mui/icons-material/Category";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import EmailIcon from "@mui/icons-material/Email";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { getEnrichedChallenges, formatDeadlineRemaining, parseMarkdownToHtml } from "@/app/modular-society/[tenant]/(authenticated)/trade/components/PreviewListingModal";

const EMERALD = "#10b981";
const PURPLE = "#7c3aed";
const FLASH_RED = "#ef4444";

const GoogleGIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const glassCard = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 20px -4px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
};

const PITCH_PRESETS = [
  {
    id: "executive",
    label: "🏛️ Executive & Leadership Pitch",
    template:
      "### Executive Alignment\nI bring extensive leadership and strategic management capabilities to accelerate your agro-enterprise goals with operational excellence.\n\n### Key Contributions\n- **Cross-Functional Leadership:** Scaling high-efficiency supply chain & commodity distribution.\n- **Ecosystem Governance:** Aligning field teams with verified FoodNerve benchmarks."
  },
  {
    id: "operations",
    label: "🚜 Field Operations & Technical Expertise",
    template:
      "### Operational Competency\nWith hands-on experience in agricultural production, cold-chain logistics, and farm management, I am prepared to execute immediately.\n\n### Key Capabilities\n- **Yield Optimization:** Data-driven agronomy & post-harvest loss prevention.\n- **Logistics Delivery:** Real-time commodity tracking & warehouse accountability."
  },
  {
    id: "growth",
    label: "🚀 Growth & Commercial Strategy",
    template:
      "### Commercial Directives\nI specialize in scaling market access, B2B merchant acquisition, and institutional partnerships across the Pan-African agricultural landscape.\n\n### Focus Areas\n- **Revenue Expansion:** Unlocking tier-1 buyer networks and off-taker agreements.\n- **Community Engagement:** Driving grassroots operator adoption."
  }
];

function hoursLeft(expiresAt?: any): string {
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

function MiniJobCard({ listing, onClick }: { listing: any; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const color = listing.category === "volunteer" ? "#ec4899" : listing.category === "internship" ? "#3b82f6" : "#10b981";
  const posterName = listing.organization?.name || listing.postedBy?.name || "FoodNerve Operator";
  const initial = posterName.charAt(0).toUpperCase() || "O";

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
          {(listing.organization?.logoUrl || listing.postedBy?.avatarUrl) ? (
            <Box
              sx={{
                p: 0.5,
                borderRadius: "10px",
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
                src={listing.organization?.logoUrl || listing.postedBy?.avatarUrl}
                alt={posterName}
                sx={{
                  maxHeight: 26,
                  maxWidth: 60,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>
          ) : (
            <Avatar sx={{ width: 34, height: 34, bgcolor: `${color}15`, color, fontWeight: 800, borderRadius: "10px" }}>
              {initial}
            </Avatar>
          )}
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

export default function PublicCareerDetailView({ listing, similarListings = [] }: { listing: any; similarListings?: any[] }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<any>(PITCH_PRESETS[0]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const themeColor = listing.category === "volunteer" ? "#ec4899" : listing.category === "internship" ? "#3b82f6" : "#10b981";
  const orgName = listing.organization?.name || (listing.isExternal ? "External Organization" : (listing.postedBy?.name || "FoodNerve Operator"));
  const orgLogo = listing.organization?.logoUrl || "";
  const orgRank = listing.organization?.rank || 1;
  const initial = orgName.charAt(0).toUpperCase() || "O";
  const remaining = hoursLeft(listing.expiresAt);

  const orgSlug = listing?.organization?.slug || (listing?.organization?.name ? listing.organization.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : (orgName ? orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "org"));
  const orgProfilePath = listing?.organization ? `/@o-${orgSlug}` : (listing?.postedBy?.username ? `/@u-${listing.postedBy.username.replace(/^@+/, "")}` : `/@o-${orgSlug}`);
  const orgDisplayUrl = `foodnerve.org${orgProfilePath}`;

  const handleOpenOrgProfile = () => {
    if (typeof window !== "undefined") {
      const isOrg = window.location.hostname.includes(".org") || window.location.hostname.startsWith("foodnerve.org");
      if (isOrg) {
        router.push(orgProfilePath);
      } else {
        const isLocal = window.location.hostname.includes("localhost");
        const targetUrl = isLocal 
          ? `http://foodnerve.org.localhost:3000${orgProfilePath}`
          : `https://foodnerve.org${orgProfilePath}`;
        window.open(targetUrl, "_blank");
      }
    }
  };

  const handleCopyOrgLink = () => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname.includes("localhost");
      const fullUrl = isLocal 
        ? `http://foodnerve.org.localhost:3000${orgProfilePath}`
        : `https://foodnerve.org${orgProfilePath}`;
      navigator.clipboard.writeText(fullUrl);
      setToastMsg("Organization profile link copied to clipboard!");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setToastMsg("Successfully signed in with Google!");
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setToastMsg(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    setEmailSubject(`Application for ${listing.title} - FoodNerve Society Dossier`);
    setEmailBody(
      `Hello ${orgName} Team,\n\nI am applying for the **${listing.title}** position posted on the FoodNerve Ecosystem.\n\n${selectedPreset.template}\n\nBest regards,\nFoodNerve Operator`
    );
  }, [listing, orgName, selectedPreset]);

  const getSocietyTradeUrl = () => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname.includes("localhost");
      return isLocal 
        ? `http://foodnerve.org.localhost:3000/trade/${listing.id}`
        : `https://foodnerve.org/trade/${listing.id}`;
    }
    return `https://foodnerve.org/trade/${listing.id}`;
  };

  const handleApplyClick = () => {
    if (!currentUser) {
      setIsRedirecting(true);
      window.location.href = getSocietyTradeUrl();
      return;
    }
    setShowApplyModal(true);
  };

  const handleToggleBookmark = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    setToastMsg(nextSaved ? "Job saved to your bookmarks!" : "Job removed from bookmarks!");
  };

  const getApplyButtonDetails = () => {
    if (listing.applicationMethod === "external") {
      return {
        icon: <OpenInNewIcon />,
        label: listing.externalButtonText || "Apply on Company Site",
        color: "#0284c7"
      };
    }
    if (listing.applicationMethod === "email") {
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

  const getAuthGateTitle = () => {
    if (listing.applicationMethod === "email") {
      return "Sign in to see email";
    }
    if (listing.applicationMethod === "external") {
      return "Sign in to get application link";
    }
    return "Sign in to apply now";
  };

  const applyBtn = getApplyButtonDetails();

  let challenges: any[] = [];
  try {
    if (listing.challenges) challenges = typeof listing.challenges === "string" ? JSON.parse(listing.challenges) : listing.challenges;
  } catch (e) {}

  if ((!challenges || challenges.length === 0) && listing.organization?.challenges) {
    try {
      challenges = typeof listing.organization.challenges === "string" ? JSON.parse(listing.organization.challenges) : listing.organization.challenges;
    } catch (e) {}
  }

  let requiredDocs: any = {};
  try {
    if (listing.requiredDocuments) requiredDocs = typeof listing.requiredDocuments === "string" ? JSON.parse(listing.requiredDocuments) : listing.requiredDocuments;
  } catch (e) {}

  const timelineInfo = formatDeadlineRemaining(listing.applicationDeadline || listing.deadline || listing.expiresAt);

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
      value: listing.jobFunction || listing.commodity || "Agro-Enterprise Logistics",
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
    <Box sx={{ flex: 1, height: "100%", overflowY: "auto", pb: { xs: 16, sm: 12, md: 8 } }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2.5, sm: 3.5, md: 4.5 }, px: { xs: 2, sm: 3, md: 6 } }}>
        
        {/* ── TOP UTILITY ACTION BAR ──────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Button
            onClick={() => router.push("/careers")}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: "#475569",
              fontWeight: 800,
              fontSize: "0.88rem",
              textTransform: "none",
              borderRadius: "14px",
              px: 2,
              py: 1,
              bgcolor: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              "&:hover": { bgcolor: "#f8fafc", color: "#0f172a" },
            }}
          >
            Back to Careers
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Chip
              label={listing.category === "volunteer" ? "VOLUNTEER" : listing.category === "internship" ? "INTERNSHIP" : "PAID JOB"}
              sx={{
                bgcolor: `${themeColor}15`,
                color: themeColor,
                fontWeight: 900,
                fontSize: "0.74rem",
                borderRadius: "8px",
                border: `1px solid ${themeColor}30`,
                px: 0.5,
              }}
            />
            <IconButton onClick={handleToggleBookmark} sx={{ bgcolor: "#ffffff", border: "1px solid #e2e8f0", color: isSaved ? themeColor : "#64748b", "&:hover": { bgcolor: "#f8fafc" } }}>
              {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
            <Tooltip title="Share job as image or link">
              <IconButton onClick={() => setShowShareModal(true)} sx={{ bgcolor: "#ffffff", border: "1px solid #e2e8f0", color: "#64748b", "&:hover": { bgcolor: "#f8fafc" } }}>
                <ShareIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── HERO HEADER CARD (MULTI-COLOR RIBBON) ───────────── */}
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
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "flex-start" }, justifyContent: "space-between", gap: 3, mb: 3.5 }}>
            <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
              {orgLogo ? (
                <Box
                  onClick={handleOpenOrgProfile}
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
                  onClick={handleOpenOrgProfile}
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
                    onClick={handleOpenOrgProfile}
                    sx={{ fontWeight: 800, color: "#475569", fontSize: "0.95rem", cursor: "pointer", "&:hover": { color: themeColor, textDecoration: "underline" } }}
                  >
                    {orgName}
                  </Typography>
                  {/* Only Rank 4+ organizations are verified */}
                  {orgRank >= 4 && (
                    <Tooltip title="Rank 4 Verified Organization">
                      <VerifiedIcon sx={{ fontSize: 16, color: EMERALD, verticalAlign: "middle" }} />
                    </Tooltip>
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, bgcolor: "rgba(100, 116, 139, 0.1)", color: "#475569", px: 0.8, py: 0.2, borderRadius: "6px" }}>
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 800 }}>RANK {orgRank}</Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "1.35rem", md: "1.85rem" }, lineHeight: 1.25 }}>
                  {listing.title}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: { xs: "100%", sm: "auto" }, minWidth: { sm: 200 } }}>
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

          {/* ── MULTI-COLOR SEGMENTED 4-POINT RIBBON BAR ─────── */}
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
                  p: { xs: 2, sm: 2.2 },
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "#ffffff",
                  borderRight: { md: idx < specSegments.length - 1 ? "1px solid #e2e8f0" : "none" },
                  borderBottom: { xs: idx < specSegments.length - 1 ? "1px solid #e2e8f0" : "none", md: "none" },
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha(item.color, 0.02),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    bgcolor: alpha(item.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: item.color,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      lineHeight: 1.1,
                      mb: 0.4,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1.05rem" },
                      fontWeight: 800,
                      color: "#0f172a",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* ── TWO-COLUMN MAIN CONTENT ─────────────────────────── */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "8fr 4fr" }, gap: 4 }}>
          
          {/* Left Column: Responsibilities, Challenges, Requirements */}
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

            {/* Application Requirements Card */}
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
                {requiredDocs.requireResume && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: themeColor, fontSize: 20 }} />
                    <Typography sx={{ color: "#334155", fontSize: "0.92rem", fontWeight: 600 }}>
                      Curriculum Vitae / Professional Resume required
                    </Typography>
                  </Box>
                )}
                {requiredDocs.requireCoverLetter && (
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
                onClick={handleOpenOrgProfile}
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
                    component="a"
                    href={posterProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
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
              const enrichedChallenges = getEnrichedChallenges(challenges);
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

        {/* ── SIMILAR OPPORTUNITIES SECTION ───────────────────── */}
        {similarListings.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", mb: 3 }}>
              Similar Opportunities
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 3 }}>
              {similarListings.map((sim) => (
                <MiniJobCard
                  key={sim.id}
                  listing={sim}
                  onClick={() => {
                    router.push(`/careers/${sim.id}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* ── SHARE LISTING MODAL ─────────────────────────────── */}
        <ShareListingModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          listing={listing}
          themeColor={themeColor}
          onToast={(msg) => setToastMsg(msg)}
        />

        {/* ── APPLICATION DOSSIER MODAL (WITH OPERATOR AUTH GATE) ───────────────── */}
        <Dialog
          open={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: "28px",
                p: 0,
                overflow: "hidden",
                boxShadow: "0 24px 60px -12px rgba(15, 23, 42, 0.25)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
              }
            }
          }}
        >
          {/* Modal Hero Banner */}
          <Box
            sx={{
              p: { xs: 3, sm: 3.5 },
              background: !currentUser
                ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                : listing.applicationMethod === "email"
                ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)"
                : "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
              color: "#ffffff",
              position: "relative",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
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
                  {!currentUser ? (
                    <LockOutlinedIcon sx={{ color: "#ffffff", fontSize: 24 }} />
                  ) : listing.applicationMethod === "email" ? (
                    <EmailIcon sx={{ color: "#ffffff", fontSize: 24 }} />
                  ) : (
                    <RocketLaunchIcon sx={{ color: "#ffffff", fontSize: 24 }} />
                  )}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.75)" }}>
                    {!currentUser ? "Operator Authentication Required" : listing.applicationMethod === "email" ? "Official Email Dispatch" : "Direct Society Application"}
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
            
            {/* Hiring Company Dossier */}
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
                  }}
                >
                  {initial}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.05rem" }}>
                    {orgName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                    Verified FoodNerve Hiring Organization
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  onClick={handleOpenOrgProfile}
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
                    "&:hover": { bgcolor: "#f1f5f9", borderColor: "#94a3b8" },
                  }}
                >
                  {orgDisplayUrl}
                </Button>
                <Tooltip title="Copy Organization Profile Link">
                  <IconButton
                    onClick={handleCopyOrgLink}
                    sx={{ bgcolor: "#ffffff", border: "1px solid #cbd5e1", "&:hover": { bgcolor: "#f1f5f9" } }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>

            {/* UNAUTHENTICATED STATE: ROUTE TO SOCIETY PORTAL */}
            {!currentUser ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 3, px: { xs: 1, sm: 2 } }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "18px",
                    bgcolor: alpha(EMERALD, 0.1),
                    color: EMERALD,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    border: `1px solid ${alpha(EMERALD, 0.2)}`,
                  }}
                >
                  <ShieldIcon sx={{ fontSize: 28 }} />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 1, fontSize: "1.25rem", letterSpacing: "-0.01em" }}>
                  {getAuthGateTitle()}
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "0.9rem", maxWidth: 420, lineHeight: 1.5, mb: 3.5 }}>
                  Continue to the FoodNerve Society portal to sign in and submit your verified application.
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={isRedirecting}
                  onClick={() => {
                    setIsRedirecting(true);
                    window.location.href = getSocietyTradeUrl();
                  }}
                  startIcon={isRedirecting ? <CircularProgress size={18} sx={{ color: "#ffffff" }} /> : undefined}
                  endIcon={isRedirecting ? undefined : <OpenInNewIcon />}
                  sx={{
                    maxWidth: 380,
                    bgcolor: isRedirecting ? "#0f172a" : EMERALD,
                    color: "#ffffff",
                    fontWeight: 800,
                    borderRadius: "14px",
                    py: 1.5,
                    fontSize: "0.95rem",
                    textTransform: "none",
                    boxShadow: isRedirecting ? "none" : `0 8px 24px ${alpha(EMERALD, 0.35)}`,
                    "&:hover": { bgcolor: isRedirecting ? "#0f172a" : "#059669", transform: isRedirecting ? "none" : "translateY(-1px)" },
                    transition: "all 0.2s ease",
                    "&.Mui-disabled": {
                      bgcolor: "#0f172a",
                      color: "#ffffff",
                      opacity: 0.9,
                    },
                  }}
                >
                  {isRedirecting ? "Connecting to Society Portal..." : "Continue to Society to Apply"}
                </Button>
              </Box>
            ) : (
              /* AUTHENTICATED STATE: FULL APPLICATION DOSSIER */
              <>
                {/* External Method */}
                {listing.applicationMethod === "external" && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 1 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: alpha("#0284c7", 0.04), border: "1px solid rgba(2, 132, 199, 0.2)" }}>
                      <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem", mb: 0.5 }}>
                        Company Application Portal
                      </Typography>
                      <Typography sx={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.5, mb: 2 }}>
                        This organization handles direct candidate intake through their external applicant tracking system.
                      </Typography>
                      {listing.applicationInstructions && (
                        <Box sx={{ p: 1.5, px: 2, borderRadius: "10px", bgcolor: "#ffffff", border: "1px solid #e2e8f0", mb: 2 }}>
                          <Typography sx={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>
                            📌 <strong>Instructions:</strong> {listing.applicationInstructions}
                          </Typography>
                        </Box>
                      )}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          if (listing.externalUrl) window.open(listing.externalUrl, "_blank");
                          setShowApplyModal(false);
                        }}
                        endIcon={<OpenInNewIcon />}
                        sx={{
                          bgcolor: "#0284c7",
                          color: "#ffffff",
                          fontWeight: 800,
                          borderRadius: "14px",
                          py: 1.4,
                          fontSize: "0.95rem",
                          textTransform: "none",
                          boxShadow: "0 8px 20px rgba(2, 132, 199, 0.3)",
                          "&:hover": { bgcolor: "#0369a1" },
                        }}
                      >
                        {listing.externalButtonText || "Proceed to Company Portal"}
                      </Button>
                    </Paper>
                  </Box>
                )}

                {/* Email Dispatch Flow */}
                {listing.applicationMethod === "email" && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box sx={{ p: 1.5, px: 2, borderRadius: "12px", bgcolor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                        Destination Email
                      </Typography>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: PURPLE }}>
                        {listing.applicationEmail || "hiring@foodnerve.org"}
                      </Typography>
                    </Box>

                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 16, color: PURPLE }} />
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                          Application Pitch Preset
                        </Typography>
                      </Box>
                      <PremiumAutocomplete
                        colorTheme={PURPLE}
                        label="Select Application Preset / Tone"
                        placeholder="Choose an executive, field operations, or technical pitch..."
                        options={PITCH_PRESETS}
                        getOptionLabel={(opt: any) => typeof opt === "string" ? opt : opt.label}
                        value={selectedPreset}
                        onChange={(_: any, val: any) => {
                          if (val) {
                            setSelectedPreset(val);
                            setEmailBody(
                              `Hello ${orgName} Team,\n\nI am applying for the **${listing.title}** position posted on the FoodNerve Ecosystem.\n\n${val.template}\n\nBest regards,\nFoodNerve Operator`
                            );
                          }
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", mb: 1 }}>
                        Subject Line
                      </Typography>
                      <Paper elevation={0} sx={{ p: 1.5, px: 2, borderRadius: "12px", border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                        <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>
                          {emailSubject}
                        </Typography>
                      </Paper>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", mb: 1 }}>
                        Cover Letter & Dossier
                      </Typography>
                      <PremiumMarkdownEditor
                        value={emailBody}
                        onChange={(v: string) => setEmailBody(v)}
                        minHeight={180}
                        colorTheme={PURPLE}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => {
                        const mailtoUrl = `mailto:${listing.applicationEmail || "hiring@foodnerve.org"}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                        window.location.href = mailtoUrl;
                        setShowApplyModal(false);
                        setToastMsg("Email client opened with application pitch!");
                      }}
                      startIcon={<EmailIcon />}
                      sx={{
                        bgcolor: PURPLE,
                        color: "#ffffff",
                        fontWeight: 800,
                        borderRadius: "16px",
                        py: 1.5,
                        fontSize: "0.95rem",
                        textTransform: "none",
                        boxShadow: `0 8px 24px ${alpha(PURPLE, 0.35)}`,
                        "&:hover": { bgcolor: "#6d28d9" },
                      }}
                    >
                      Send Application Email
                    </Button>
                  </Box>
                )}

                {/* Native Application Flow */}
                {listing.applicationMethod !== "email" && listing.applicationMethod !== "external" && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", mb: 1 }}>
                        Statement of Interest / Pitch
                      </Typography>
                      <PremiumMarkdownEditor
                        value={emailBody}
                        onChange={(v: string) => setEmailBody(v)}
                        minHeight={180}
                        colorTheme={themeColor}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => {
                        setShowApplyModal(false);
                        setToastMsg("Application submitted via FoodNerve Society Trust Protocol!");
                      }}
                      startIcon={<RocketLaunchIcon />}
                      sx={{
                        bgcolor: themeColor,
                        color: "#ffffff",
                        fontWeight: 800,
                        borderRadius: "16px",
                        py: 1.5,
                        fontSize: "0.95rem",
                        textTransform: "none",
                        boxShadow: `0 8px 24px ${alpha(themeColor, 0.35)}`,
                        "&:hover": { bgcolor: alpha(themeColor, 0.9) },
                      }}
                    >
                      Submit Application with Profile
                    </Button>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── GLOBAL TOAST SNACKBAR ───────────────────────────── */}
        <Snackbar
          open={!!toastMsg}
          autoHideDuration={3500}
          onClose={() => setToastMsg("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ borderRadius: "14px", fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
            {toastMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
