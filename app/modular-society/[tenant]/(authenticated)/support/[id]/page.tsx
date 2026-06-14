// @ts-nocheck
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Avatar,
  Skeleton,
  alpha,
  LinearProgress,
  Modal,
  TextField,
  Divider,
  IconButton,
} from "@mui/material";

import { useSociety } from "@/context/SocietyContext";
import {
  getCampaigns,
  type SupportCampaign,
  type CampaignTier,
  type ContributionType,
} from "@/lib/db/society";
import { mockCampaigns } from "@/lib/db/mocks";
import { useParams, useRouter } from "next/navigation";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BoltIcon from "@mui/icons-material/Bolt";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import CelebrationIcon from "@mui/icons-material/Celebration";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import VerifiedIcon from "@mui/icons-material/Verified";

// ── Framer-motion v12+ wrappers ─────────────────────────────



// ── Constants ────────────────────────────────────────────────
const PINK = "#ec4899";
const PINK_DARK = "#db2777";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const PURPLE = "#8b5cf6";

// ── Tier config ──────────────────────────────────────────────
const TIER_CONFIG: Record<
  CampaignTier,
  { label: string; emoji: string; color: string }
> = {
  initiative: { label: "Initiative", emoji: "🌱", color: GREEN },
  innovation: { label: "Innovation", emoji: "🔬", color: AMBER },
  industry: { label: "Industry", emoji: "🏗️", color: PURPLE },
};

const CONTRIBUTION_ICONS: Record<ContributionType, { emoji: string; label: string }> = {
  money: { emoji: "💰", label: "Money" },
  time: { emoji: "⏰", label: "Time" },
  land: { emoji: "🌍", label: "Land" },
  data: { emoji: "📊", label: "Data" },
  equipment: { emoji: "🔧", label: "Equipment" },
};

// ── Animation Variants ───────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

// ── Glassmorphism ────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────
function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

function daysLeft(deadline: string): string {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "Ended";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Mock Top Backers ─────────────────────────────────────────
const MOCK_BACKERS = [
  { name: "David Adeyemi", amount: 5000000, avatarUrl: "", rank: 4 },
  { name: "Fatima Bello", amount: 2500000, avatarUrl: "", rank: 3 },
  { name: "Chidi Okoro", amount: 1800000, avatarUrl: "", rank: 3 },
  { name: "Amina Yusuf", amount: 1200000, avatarUrl: "", rank: 2 },
  { name: "Dr. Ngozi Eze", amount: 800000, avatarUrl: "", rank: 4 },
  { name: "Ibrahim Sule", amount: 350000, avatarUrl: "", rank: 2 },
  { name: "Chef Adaeze Obi", amount: 250000, avatarUrl: "", rank: 2 },
  { name: "Musa Garba", amount: 200000, avatarUrl: "", rank: 3 },
];

// ── Funding Amount Presets ───────────────────────────────────
const FUND_AMOUNTS = [5000, 10000, 25000, 50000, 100000, 500000];

// ════════════════════════════════════════════════════════════
// CHECKOUT MODAL
// ════════════════════════════════════════════════════════════
function CheckoutModal({
  open,
  onClose,
  campaign,
}: {
  open: boolean;
  onClose: () => void;
  campaign: SupportCampaign;
}) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25000);
  const [customAmount, setCustomAmount] = useState("");
  const [step, setStep] = useState<"amount" | "confirm" | "success">("amount");

  const finalAmount = selectedAmount ?? (parseInt(customAmount) || 0);
  const tierCfg = TIER_CONFIG[campaign.tier];

  const handleFund = () => {
    setStep("success");
  };

  const handleClose = () => {
    setStep("amount");
    setSelectedAmount(25000);
    setCustomAmount("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          ...glassCard,
          background: "#fff",
          p: 0,
          overflow: "hidden",
          outline: "none",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
            color: "#ffffff",
            p: 3,
            position: "relative",
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "#ffffff",
              bgcolor: alpha("#fff", 0.15),
              "&:hover": { bgcolor: alpha("#fff", 0.25) },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Avatar sx={{ bgcolor: alpha("#fff", 0.2), width: 44, height: 44 }}>
              {step === "success" ? (
                <CelebrationIcon />
              ) : (
                <VolunteerActivismIcon />
              )}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: "1.15rem",
                  lineHeight: 1.2,
                }}
              >
                {step === "success" ? "Thank You! 🎉" : "Fund This Campaign"}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", opacity: 0.85 }}>
                {step === "success"
                  ? "Your contribution makes a difference"
                  : campaign.title}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ p: 3 }}>
          
            {step === "amount" && (
              <Box
                key="amount"
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    mb: 2,
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  Select or enter an amount (₦)
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 1.5,
                    mb: 2.5,
                  }}
                >
                  {FUND_AMOUNTS.map((amt) => (
                    <Chip
                      key={amt}
                      label={formatCurrency(amt)}
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                      }}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        height: 44,
                        borderRadius: "12px",
                        cursor: "pointer",
                        ...(selectedAmount === amt
                          ? {
                              bgcolor: PINK,
                              color: "#ffffff",
                              boxShadow: `0 4px 16px ${alpha(PINK, 0.35)}`,
                              "&:hover": { bgcolor: PINK_DARK },
                            }
                          : {
                              bgcolor: alpha(PINK, 0.06),
                              color: "#ffffff",
                              border: `1.5px solid ${alpha(PINK, 0.15)}`,
                              "&:hover": { bgcolor: alpha(PINK, 0.12) },
                            }),
                      }}
                    />
                  ))}
                </Box>

                <TextField
                  fullWidth
                  placeholder="Or enter custom amount..."
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <Typography sx={{ mr: 1, fontWeight: 700, color: "rgba(255, 255, 255, 0.7)" }}>
                          ₦
                        </Typography>
                      ),
                    },
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      fontWeight: 600,
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  disabled={finalAmount <= 0}
                  onClick={() => setStep("confirm")}
                  sx={{
                    background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "1rem",
                    textTransform: "none",
                    borderRadius: "14px",
                    py: 1.5,
                    boxShadow: `0 6px 24px ${alpha(PINK, 0.35)}`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${PINK_DARK} 0%, #a21caf 100%)`,
                    },
                    "&:disabled": {
                      background: alpha(PINK, 0.2),
                      color: alpha("#fff", 0.5),
                    },
                  }}
                >
                  Continue — {finalAmount > 0 ? formatCurrency(finalAmount) : "₦0"}
                </Button>
              </Box>
            )}

            {step === "confirm" && (
              <Box
                key="confirm"
              >
                <Box
                  sx={{
                    ...glassCard,
                    background: alpha(PINK, 0.04),
                    border: `1.5px solid ${alpha(PINK, 0.15)}`,
                    p: 2.5,
                    mb: 3,
                  }}
                >
                  <Typography
                    sx={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)", mb: 0.5 }}
                  >
                    You are funding
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", mb: 1 }}>
                    {campaign.title}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.85rem" }}>
                      Contribution
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "1rem" }}>
                      {formatCurrency(finalAmount)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.85rem" }}>
                      NP Reward
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: AMBER,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.3,
                      }}
                    >
                      <BoltIcon sx={{ fontSize: 16 }} />
                      {campaign.nervePointsReward} NP
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    fullWidth
                    onClick={() => setStep("amount")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "14px",
                      py: 1.5,
                      border: `1.5px solid ${alpha(PINK, 0.2)}`,
                      color: "#ffffff",
                      "&:hover": { bgcolor: alpha(PINK, 0.06) },
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleFund}
                    sx={{
                      background: `linear-gradient(135deg, ${GREEN} 0%, #059669 100%)`,
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "1rem",
                      textTransform: "none",
                      borderRadius: "14px",
                      py: 1.5,
                      boxShadow: `0 6px 24px ${alpha(GREEN, 0.35)}`,
                      "&:hover": {
                        background: `linear-gradient(135deg, #059669 0%, #047857 100%)`,
                      },
                    }}
                  >
                    Confirm & Fund
                  </Button>
                </Box>
              </Box>
            )}

            {step === "success" && (
              <Box
                key="success"
                sx={{ textAlign: "center", py: 2 }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: alpha(GREEN, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 44, color: GREEN }} />
                </Box>
                <Typography
                  sx={{ fontWeight: 900, fontSize: "1.3rem", mb: 0.5 }}
                >
                  Contribution Recorded!
                </Typography>
                <Typography
                  sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem", mb: 1 }}
                >
                  {formatCurrency(finalAmount)} to {campaign.title}
                </Typography>
                <Chip
                  icon={<BoltIcon sx={{ fontSize: 14, color: `${AMBER} !important` }} />}
                  label={`+${campaign.nervePointsReward} NP Earned`}
                  sx={{
                    bgcolor: alpha(AMBER, 0.1),
                    color: AMBER,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    height: 34,
                    mb: 3,
                  }}
                />
                <Button
                  fullWidth
                  onClick={handleClose}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "14px",
                    py: 1.2,
                    bgcolor: alpha(PINK, 0.06),
                    color: PINK,
                    "&:hover": { bgcolor: alpha(PINK, 0.12) },
                  }}
                >
                  Close
                </Button>
              </Box>
            )}
          
        </Box>
      </Box>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// CAMPAIGN DETAIL PAGE
// ════════════════════════════════════════════════════════════
export default function CampaignDetailPage() {
  const { profile } = useSociety();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<SupportCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    // Find the campaign from mock data
    const found = mockCampaigns.find((c) => c.id === id) ?? null;
    setCampaign(found);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: "24px", mb: 3 }} />
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: "16px", mb: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: "16px" }} />
      </Box>
    );
  }

  if (!campaign) {
    return (
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          maxWidth: 900,
          mx: "auto",
          textAlign: "center",
          mt: 8,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Campaign Not Found
        </Typography>
        <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3 }}>
          The campaign you&apos;re looking for doesn&apos;t exist or has been removed.
        </Typography>
        <Button
          onClick={() => router.push("/support")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            color: PINK,
            border: `1.5px solid ${alpha(PINK, 0.3)}`,
            borderRadius: 2.5,
            px: 4,
          }}
        >
          Back to Campaigns
        </Button>
      </Box>
    );
  }

  const tierCfg = TIER_CONFIG[campaign.tier];
  const isFunded = campaign.status === "funded" || campaign.status === "completed";
  const financialPct =
    campaign.goalAmount && campaign.raisedAmount
      ? Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)
      : 0;
  const volunteerPct =
    campaign.volunteersNeeded && campaign.volunteersJoined
      ? Math.min((campaign.volunteersJoined / campaign.volunteersNeeded) * 100, 100)
      : 0;

  return (
    <>
      <Box
        sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto", pb: 8 }}
      >
        {/* ═══════════════════════════════════════════════════
            BACK NAVIGATION
        ═══════════════════════════════════════════════════ */}
        <Box sx={{ mb: 2 }}>
          <Button
            onClick={() => router.push("/support")}
            startIcon={<ArrowBackIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.7)",
              borderRadius: 2,
              "&:hover": { bgcolor: alpha(PINK, 0.06) },
            }}
          >
            All Campaigns
          </Button>
        </Box>

        {/* ═══════════════════════════════════════════════════
            FUNDED SUCCESS BANNER
        ═══════════════════════════════════════════════════ */}
        {isFunded && (
          <Box sx={{ mb: 3 }}>
            <Paper
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${GREEN} 0%, #059669 100%)`,
                color: "#ffffff",
                borderRadius: "20px",
                p: { xs: 2.5, md: 3.5 },
                display: "flex",
                alignItems: "center",
                gap: 2,
                boxShadow: `0 8px 32px ${alpha(GREEN, 0.3)}`,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: alpha("#fff", 0.2),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CelebrationIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: "1.15rem", mb: 0.3 }}>
                  🎉 Fully Funded!
                </Typography>
                <Typography sx={{ fontSize: "0.88rem", opacity: 0.9 }}>
                  This campaign has reached its funding goal. Thank you to all {campaign.backers} backers
                  who made this possible!
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        {/* ═══════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════ */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              position: "relative",
              borderRadius: "24px",
              overflow: "hidden",
              height: { xs: 240, md: 360 },
            }}
          >
            <Box
              component="img"
              src={campaign.imageUrl}
              alt={campaign.title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Gradient overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.7) 100%)",
              }}
            />

            {/* Badges */}
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                display: "flex",
                gap: 1,
              }}
            >
              <Chip
                label={`${tierCfg.emoji} ${tierCfg.label}`}
                sx={{
                  bgcolor: alpha(tierCfg.color, 0.9),
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  height: 30,
                  
                }}
              />
              <Chip
                label={campaign.source}
                sx={{
                  bgcolor: alpha("#000", 0.5),
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  height: 28,
                  
                }}
              />
            </Box>

            {/* NP Reward */}
            <Chip
              icon={<BoltIcon sx={{ fontSize: "14px !important", color: `${AMBER} !important` }} />}
              label={`Earn ${campaign.nervePointsReward} NP`}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                bgcolor: alpha("#000", 0.6),
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.72rem",
                height: 28,
                
              }}
            />

            {/* Title overlay */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                p: { xs: 2.5, md: 4 },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: "#ffffff",
                  fontWeight: 900,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  lineHeight: 1.2,
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  maxWidth: 600,
                }}
              >
                {campaign.title}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ═══════════════════════════════════════════════════
            TWO-COLUMN LAYOUT
        ═══════════════════════════════════════════════════ */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 360px" },
            gap: 3,
          }}
        >
          {/* ── LEFT COLUMN ─────────────────────────────── */}
          <Box>
            {/* Funding Progress Card */}
            <Box sx={{ mb: 3 }}>
              <Paper elevation={0} sx={{ ...glassCard, p: { xs: 2.5, md: 3.5 } }}>
                {campaign.goalAmount != null && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: { xs: "1.5rem", md: "1.9rem" },
                            color: isFunded ? GREEN : PINK,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {formatCurrency(campaign.raisedAmount ?? 0)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.82rem",
                            color: "rgba(255, 255, 255, 0.7)",
                            fontWeight: 500,
                          }}
                        >
                          raised of {formatCurrency(campaign.goalAmount)} goal
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "1.3rem",
                          color: isFunded ? GREEN : PINK,
                        }}
                      >
                        {Math.round(financialPct)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={financialPct}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        mb: 2,
                        bgcolor: alpha(isFunded ? GREEN : PINK, 0.1),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 6,
                          background: isFunded
                            ? `linear-gradient(90deg, ${GREEN}, #34d399)`
                            : `linear-gradient(90deg, ${PINK}, ${PINK_DARK})`,
                        },
                      }}
                    />
                  </>
                )}

                {/* Stats row */}
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 2, md: 4 },
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <PeopleAltIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1 }}>
                        {campaign.backers}
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.7)" }}>
                        backers
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <AccessTimeIcon
                      sx={{
                        fontSize: 18,
                        color: daysLeft(campaign.deadline) === "Ended" ? "#dc2626" : "text.disabled",
                      }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1rem",
                          lineHeight: 1,
                          color: daysLeft(campaign.deadline) === "Ended" ? "#dc2626" : "text.primary",
                        }}
                      >
                        {daysLeft(campaign.deadline)}
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.7)" }}>
                        deadline
                      </Typography>
                    </Box>
                  </Box>
                  {campaign.volunteersNeeded != null && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <VolunteerActivismIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1 }}>
                          {campaign.volunteersJoined ?? 0}/{campaign.volunteersNeeded}
                        </Typography>
                        <Typography sx={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          volunteers
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Volunteer progress bar */}
                {campaign.volunteersNeeded != null && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={volunteerPct}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha("#6366f1", 0.08),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background: "linear-gradient(90deg, #6366f1, #818cf8)",
                        },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Paper elevation={0} sx={{ ...glassCard, p: { xs: 2.5, md: 3.5 } }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📝 About this Campaign
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                    mb: 2.5,
                  }}
                >
                  {campaign.description}
                </Typography>

                {/* Contribution types */}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "rgba(255, 255, 255, 0.7)",
                    mb: 1,
                  }}
                >
                  Accepted Contributions
                </Typography>
                <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 2.5 }}>
                  {campaign.contributionTypes.map((type) => {
                    const cfg = CONTRIBUTION_ICONS[type];
                    return (
                      <Chip
                        key={type}
                        label={`${cfg.emoji} ${cfg.label}`}
                        sx={{
                          height: 32,
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          bgcolor: alpha(PINK, 0.06),
                          color: "#ffffff",
                          border: `1px solid ${alpha(PINK, 0.12)}`,
                        }}
                      />
                    );
                  })}
                </Box>

                {/* Tags */}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "rgba(255, 255, 255, 0.7)",
                    mb: 1,
                  }}
                >
                  Tags
                </Typography>
                <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap" }}>
                  {campaign.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        height: 26,
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        bgcolor: alpha("#000", 0.04),
                        color: "rgba(255, 255, 255, 0.7)",
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* ── RIGHT COLUMN ────────────────────────────── */}
          <Box>
            {/* Fund CTA */}
            <Box sx={{ mb: 3 }}>
              {!isFunded ? (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setCheckoutOpen(true)}
                  startIcon={<FavoriteIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 60%, #7c3aed 100%)`,
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    textTransform: "none",
                    borderRadius: "16px",
                    py: 2,
                    boxShadow: `0 8px 32px ${alpha(PINK, 0.4)}`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${PINK_DARK} 0%, #a21caf 60%, #6d28d9 100%)`,
                      boxShadow: `0 12px 40px ${alpha(PINK, 0.5)}`,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Fund This Campaign
                </Button>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    ...glassCard,
                    background: alpha(GREEN, 0.06),
                    border: `1.5px solid ${alpha(GREEN, 0.2)}`,
                    p: 2.5,
                    textAlign: "center",
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 40, color: GREEN, mb: 1 }} />
                  <Typography sx={{ fontWeight: 800, color: GREEN }}>
                    Campaign Fully Funded
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Share/Actions */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  fullWidth
                  startIcon={<ShareIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "14px",
                    py: 1.2,
                    border: `1.5px solid ${alpha("#000", 0.08)}`,
                    color: "rgba(255, 255, 255, 0.7)",
                    "&:hover": { bgcolor: alpha(PINK, 0.06) },
                  }}
                >
                  Share
                </Button>
              </Box>
            </Box>

            {/* Organizer Card */}
            <Box sx={{ mb: 3 }}>
              <Paper elevation={0} sx={{ ...glassCard, p: 2.5 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "rgba(255, 255, 255, 0.7)",
                    mb: 1.5,
                  }}
                >
                  Organizer
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: alpha(tierCfg.color, 0.15),
                      color: tierCfg.color,
                      fontWeight: 800,
                      fontSize: "0.95rem",
                    }}
                  >
                    {getInitials(campaign.organizer)}
                  </Avatar>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {campaign.organizer}
                      <VerifiedIcon sx={{ fontSize: 16, color: tierCfg.color }} />
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      {campaign.source}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Top Backers */}
            <Box>
              <Paper elevation={0} sx={{ ...glassCard, p: 2.5 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "rgba(255, 255, 255, 0.7)",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 18, color: AMBER }} />
                  Top Backers
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {MOCK_BACKERS.slice(0, 6).map((backer, idx) => (
                    <Box
                      key={backer.name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      {/* Rank number */}
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "0.78rem",
                          color: idx < 3 ? AMBER : "text.disabled",
                          width: 20,
                          textAlign: "center",
                        }}
                      >
                        {idx + 1}
                      </Typography>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(PINK, 0.1),
                          color: PINK,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(backer.name)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {backer.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.7)" }}
                        >
                          {formatCurrency(backer.amount)}
                        </Typography>
                      </Box>
                      {idx < 3 && (
                        <Chip
                          label={idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                          size="small"
                          sx={{
                            height: 24,
                            bgcolor: alpha(AMBER, 0.08),
                            fontSize: "0.8rem",
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        campaign={campaign}
      />
    </>
  );
}
