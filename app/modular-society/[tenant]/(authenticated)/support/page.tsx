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
} from "@mui/material";

import { useSociety } from "@/context/SocietyContext";
import {
  getCampaigns,
  type SupportCampaign,
  type CampaignTier,
  type ContributionType,
} from "@/lib/db/society";
import { useRouter } from "next/navigation";

import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import BoltIcon from "@mui/icons-material/Bolt";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";

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
  { label: string; emoji: string; color: string; description: string }
> = {
  initiative: { label: "Initiatives", emoji: "🌱", color: GREEN, description: "Community grassroots" },
  innovation: { label: "Innovations", emoji: "🔬", color: AMBER, description: "R&D moonshots" },
  industry: { label: "Industries", emoji: "🏗️", color: PURPLE, description: "Infrastructure" },
};

const SOURCE_COLORS: Record<string, string> = {
  "foodnerve.org": GREEN,
  "foodnerve.com": AMBER,
  "darkpore.com": PURPLE,
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
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 26 },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
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
  return `${days}d left`;
}

// ════════════════════════════════════════════════════════════
// ANIMATED IMPACT COUNTER — Odometer-style number animation
// ════════════════════════════════════════════════════════════
function ImpactCounter({ target, label, icon, delay = 0 }: {
  target: number;
  label: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target <= 0) return;

    const duration = 2000; // 2 second animation
    const startTime = Date.now() + delay;
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) return; // wait for delay
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));

      if (progress >= 1) {
        setCurrent(target);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target, delay]);

  const formattedValue = typeof target === "number" && target >= 1000
    ? formatCurrency(current)
    : current.toLocaleString();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: alpha("#fff", 0.15),
        
        borderRadius: 3,
        px: { xs: 2, md: 3 },
        py: 1.5,
        border: `1px solid ${alpha("#fff", 0.2)}`,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: alpha("#fff", 0.2),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.3rem", md: "1.6rem" },
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {formattedValue}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", opacity: 0.8, mt: 0.2 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════
// SUPPORT PAGE
// ════════════════════════════════════════════════════════════
export default function SupportPage() {
  const { profile } = useSociety();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<SupportCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<CampaignTier | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getCampaigns();
      if (!cancelled) {
        setCampaigns(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Computed ─────────────────────────────────────────────
  const totalRaised = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c.raisedAmount ?? 0), 0),
    [campaigns]
  );
  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === "active").length,
    [campaigns]
  );
  const totalBackers = useMemo(
    () => campaigns.reduce((sum, c) => sum + c.backers, 0),
    [campaigns]
  );

  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    if (tierFilter !== "all") result = result.filter((c) => c.tier === tierFilter);
    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter);
    return result;
  }, [campaigns, tierFilter, statusFilter]);

  // ── Swimlane groups ────────────────────────────────────
  const initiatives = useMemo(
    () => filteredCampaigns.filter((c) => c.tier === "initiative"),
    [filteredCampaigns]
  );
  const innovations = useMemo(
    () => filteredCampaigns.filter((c) => c.tier === "innovation"),
    [filteredCampaigns]
  );
  const industries = useMemo(
    () => filteredCampaigns.filter((c) => c.tier === "industry"),
    [filteredCampaigns]
  );

  // When a specific tier is selected, show flat grid; otherwise show swimlanes
  const showSwimlanes = tierFilter === "all";

  const filterKey = `${tierFilter}__${statusFilter}`;

  // ── Loading Skeleton ────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: "20px", mb: 3 }} />
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" width={140} height={38} sx={{ borderRadius: "19px" }} />
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={320} sx={{ borderRadius: "20px" }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 4 },
        flex: 1,
        m: { xs: 0, md: 2 },
        minHeight: { xs: '100vh', md: 'calc(100vh - 32px)' },
        bgcolor: '#ffffff',
        borderRadius: { xs: 0, md: 4 },
        boxShadow: { xs: 'none', md: '0 10px 40px rgba(0,0,0,0.04)' },
        overflow: 'hidden',
        boxSizing: 'border-box',
        pb: 8
      }}
    >
      {/* ═══════════════════════════════════════════════════
          1. HERO HEADER WITH ANIMATED IMPACT COUNTER
      ═══════════════════════════════════════════════════ */}
      <Box>
        <Box
          sx={{
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 40%, #7c3aed 100%)`,
            color: "#ffffff",
            p: { xs: 3, md: 5 },
            mb: 3,
          }}
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: alpha("#fff", 0.08),
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: "30%",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: alpha("#fff", 0.06),
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "40%",
              right: "15%",
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: alpha("#fff", 0.05),
              display: { xs: "none", md: "block" },
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            {/* Icon + Launch button row */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: alpha("#fff", 0.2),
                  
                }}
              >
                <VolunteerActivismIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Button
                onClick={() => router.push("/support/launch")}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: alpha("#fff", 0.2),
                  
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  textTransform: "none",
                  borderRadius: "14px",
                  px: 2.5,
                  py: 1,
                  border: `1px solid ${alpha("#fff", 0.3)}`,
                  "&:hover": {
                    bgcolor: alpha("#fff", 0.3),
                  },
                }}
              >
                Launch Campaign
              </Button>
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.75rem", md: "2.25rem" },
                letterSpacing: "-0.03em",
                mb: 1,
              }}
            >
              Support Initiatives
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                maxWidth: 560,
                mb: 3,
                fontSize: { xs: "0.88rem", md: "0.95rem" },
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              &ldquo;If you want to go fast, go alone. If you want to go far, go
              together.&rdquo; — Back community grassroots, fund R&D moonshots,
              and build infrastructure for 2050.
            </Typography>

            {/* Animated Impact Counter Stats */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 1.5, md: 2 },
                flexWrap: "wrap",
              }}
            >
              <ImpactCounter
                target={totalRaised}
                label="Total Raised"
                icon={<TrendingUpIcon sx={{ fontSize: 20, color: "#ffffff" }} />}
                delay={200}
              />
              <ImpactCounter
                target={activeCampaigns}
                label="Active Campaigns"
                icon={<RocketLaunchIcon sx={{ fontSize: 20, color: "#ffffff" }} />}
                delay={500}
              />
              <ImpactCounter
                target={totalBackers}
                label="Total Backers"
                icon={<GroupsIcon sx={{ fontSize: 20, color: "#ffffff" }} />}
                delay={800}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════
          2. WU WEI FILTER BAR — Challenge / Tier Filters
      ═══════════════════════════════════════════════════ */}
      <Box sx={{ mb: 1.5 }}>
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "rgba(255, 255, 255, 0.7)",
            mb: 1,
          }}
        >
          Campaign Tier
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            pb: 0.5,
            "&::-webkit-scrollbar": { height: 0 },
          }}
        >
          {/* All chip */}
          <Chip
            label="All"
            onClick={() => setTierFilter("all")}
            sx={{
              fontWeight: 700,
              fontSize: "0.82rem",
              height: 38,
              px: 1,
              flexShrink: 0,
              borderRadius: "19px",
              ...(tierFilter === "all"
                ? {
                    bgcolor: PINK,
                    color: "#ffffff",
                    boxShadow: `0 0 20px ${alpha(PINK, 0.4)}`,
                    "&:hover": { bgcolor: PINK_DARK },
                  }
                : {
                    bgcolor: alpha(PINK, 0.06),
                    color: "rgba(255, 255, 255, 0.7)",
                    border: `1px solid ${alpha(PINK, 0.15)}`,
                    "&:hover": { bgcolor: alpha(PINK, 0.12) },
                  }),
            }}
          />
          {(["initiative", "innovation", "industry"] as CampaignTier[]).map(
            (tier) => {
              const cfg = TIER_CONFIG[tier];
              const isActive = tierFilter === tier;
              return (
                <Chip
                  key={tier}
                  label={`${cfg.emoji} ${cfg.label}`}
                  onClick={() => setTierFilter(tier)}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    height: 38,
                    px: 1,
                    flexShrink: 0,
                    borderRadius: "19px",
                    ...(isActive
                      ? {
                          bgcolor: cfg.color,
                          color: "#ffffff",
                          boxShadow: `0 0 20px ${alpha(cfg.color, 0.4)}`,
                          "&:hover": { bgcolor: cfg.color },
                        }
                      : {
                          bgcolor: alpha(cfg.color, 0.06),
                          color: "rgba(255, 255, 255, 0.7)",
                          border: `1px solid ${alpha(cfg.color, 0.15)}`,
                          "&:hover": { bgcolor: alpha(cfg.color, 0.12) },
                        }),
                  }}
                />
              );
            }
          )}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════
          3. STATUS SUB-FILTER
      ═══════════════════════════════════════════════════ */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "rgba(255, 255, 255, 0.7)",
            mb: 1,
          }}
        >
          Status
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {["all", "active", "funded"].map((s) => {
            const isActive = statusFilter === s;
            return (
              <Chip
                key={s}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
                onClick={() => setStatusFilter(s)}
                sx={{
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  height: 34,
                  px: 0.5,
                  borderRadius: "17px",
                  ...(isActive
                    ? {
                        bgcolor: PINK,
                        color: "#ffffff",
                        "&:hover": { bgcolor: PINK_DARK },
                      }
                    : {
                        bgcolor: alpha(PINK, 0.06),
                        color: "rgba(255, 255, 255, 0.7)",
                        border: `1px solid ${alpha(PINK, 0.12)}`,
                        "&:hover": { bgcolor: alpha(PINK, 0.1) },
                      }),
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════
          4. CAMPAIGN SWIMLANES / GRID
      ═══════════════════════════════════════════════════ */}
      
        <Box
          key={filterKey}
        >
          {filteredCampaigns.length === 0 ? (
            <Box>
              <Paper
                elevation={0}
                sx={{ ...glassCard, p: { xs: 5, md: 8 }, textAlign: "center" }}
              >
                <SearchOffIcon
                  sx={{ fontSize: 56, color: alpha(PINK, 0.3), mb: 2 }}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
                >
                  No campaigns found
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.disabled", maxWidth: 360, mx: "auto" }}
                >
                  Try adjusting the tier or status filters to discover campaigns you
                  can support.
                </Typography>
                <Button
                  onClick={() => {
                    setTierFilter("all");
                    setStatusFilter("all");
                  }}
                  sx={{
                    mt: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                    color: PINK,
                    border: `1.5px solid ${alpha(PINK, 0.3)}`,
                    borderRadius: 2.5,
                    px: 3,
                    "&:hover": {
                      bgcolor: alpha(PINK, 0.08),
                      borderColor: PINK,
                    },
                  }}
                >
                  Clear All Filters
                </Button>
              </Paper>
            </Box>
          ) : showSwimlanes ? (
            // ── Swimlane Mode ────────────────────────────
            <>
              {initiatives.length > 0 && (
                <SwimlaneSection
                  tier="initiative"
                  campaigns={initiatives}
                />
              )}
              {innovations.length > 0 && (
                <SwimlaneSection
                  tier="innovation"
                  campaigns={innovations}
                />
              )}
              {industries.length > 0 && (
                <SwimlaneSection
                  tier="industry"
                  campaigns={industries}
                />
              )}
            </>
          ) : (
            // ── Flat Grid Mode (when specific tier selected) ─
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </Box>
          )}
        </Box>
      

      {/* Bottom spacer */}
      <Box sx={{ height: { xs: 24, md: 16 } }} />
    </Paper>
  );
}

// ════════════════════════════════════════════════════════════
// SWIMLANE SECTION — Groups campaigns by tier
// ════════════════════════════════════════════════════════════
function SwimlaneSection({
  tier,
  campaigns,
}: {
  tier: CampaignTier;
  campaigns: SupportCampaign[];
}) {
  const cfg = TIER_CONFIG[tier];

  return (
    <Box sx={{ mb: 4 }}>
      {/* Swimlane Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2,
          px: 0.5,
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 28,
            borderRadius: 2,
            bgcolor: cfg.color,
            boxShadow: `0 0 12px ${alpha(cfg.color, 0.4)}`,
          }}
        />
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: "1.1rem",
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: 0.8,
            }}
          >
            {cfg.emoji} {cfg.label}
            <Chip
              label={campaigns.length}
              size="small"
              sx={{
                height: 22,
                fontWeight: 800,
                fontSize: "0.7rem",
                bgcolor: alpha(cfg.color, 0.1),
                color: cfg.color,
              }}
            />
          </Typography>
          <Typography
            sx={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.7)", mt: 0.2 }}
          >
            {cfg.description}
          </Typography>
        </Box>
      </Box>

      {/* Campaign Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2.5,
        }}
      >
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </Box>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════
// CAMPAIGN CARD
// ════════════════════════════════════════════════════════════
function CampaignCard({ campaign }: { campaign: SupportCampaign }) {
  const router = useRouter();
  const tierCfg = TIER_CONFIG[campaign.tier];
  const sourceColor = SOURCE_COLORS[campaign.source] || PINK;
  const isFunded = campaign.status === "funded" || campaign.status === "completed";

  const financialPct =
    campaign.goalAmount && campaign.raisedAmount
      ? Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)
      : 0;

  const volunteerPct =
    campaign.volunteersNeeded && campaign.volunteersJoined
      ? Math.min((campaign.volunteersJoined / campaign.volunteersNeeded) * 100, 100)
      : 0;

  const handleClick = useCallback(() => {
    router.push(`/support/${campaign.id}`);
  }, [router, campaign.id]);

  return (
    <Paper
      elevation={0}
      onClick={handleClick}
      sx={{
        ...glassCard,
        p: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        cursor: "pointer",
      }}
    >
      {/* ── Cover Image ──────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          height: 180,
          overflow: "hidden",
          "&:hover img": { transform: "scale(1.06)" },
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
            transition: "transform 0.5s ease",
          }}
        />
        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        {/* Badges on image */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            gap: 0.8,
          }}
        >
          {/* Tier badge */}
          <Chip
            label={`${tierCfg.emoji} ${tierCfg.label.slice(0, -1)}`}
            size="small"
            sx={{
              bgcolor: alpha(tierCfg.color, 0.85),
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 26,
              
              "& .MuiChip-label": { px: 1 },
            }}
          />
          {/* Source badge */}
          <Chip
            label={campaign.source}
            size="small"
            sx={{
              bgcolor: alpha(sourceColor, 0.85),
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.65rem",
              height: 24,
              
              "& .MuiChip-label": { px: 0.8 },
            }}
          />
        </Box>

        {/* NP Reward badge (top right) */}
        <Chip
          icon={<BoltIcon sx={{ fontSize: "14px !important", color: `${AMBER} !important` }} />}
          label={`Earn ${campaign.nervePointsReward} NP`}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: alpha("#000", 0.6),
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.68rem",
            height: 26,
            
            "& .MuiChip-icon": { color: AMBER },
          }}
        />

        {/* Title on image bottom */}
        <Box sx={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
          <Typography
            sx={{
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "1.05rem",
              lineHeight: 1.3,
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          >
            {campaign.title}
          </Typography>
        </Box>
      </Box>

      {/* ── Card Body ────────────────────────────────────── */}
      <Box sx={{ p: { xs: 2.5, md: 3 }, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.83rem",
            lineHeight: 1.55,
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {campaign.description}
        </Typography>

        {/* ── Contribution Types Row ─────────────────────── */}
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
          {campaign.contributionTypes.map((type) => {
            const cfg = CONTRIBUTION_ICONS[type];
            return (
              <Chip
                key={type}
                label={`${cfg.emoji} ${cfg.label}`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  bgcolor: alpha(PINK, 0.06),
                  color: "rgba(255, 255, 255, 0.7)",
                  border: `1px solid ${alpha(PINK, 0.1)}`,
                  "& .MuiChip-label": { px: 0.8 },
                }}
              />
            );
          })}
        </Box>

        {/* ── Progress Section ────────────────────────────── */}
        <Box sx={{ flex: 1 }}>
          {/* Financial progress */}
          {campaign.goalAmount != null && (
            <Box sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}
                >
                  {formatCurrency(campaign.raisedAmount ?? 0)}{" "}
                  <Typography
                    component="span"
                    sx={{ fontSize: "0.72rem", fontWeight: 500, color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    of {formatCurrency(campaign.goalAmount)}
                  </Typography>
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
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
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(isFunded ? GREEN : PINK, 0.1),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background: isFunded
                      ? `linear-gradient(90deg, ${GREEN}, #34d399)`
                      : `linear-gradient(90deg, ${PINK}, ${PINK_DARK})`,
                  },
                }}
              />
            </Box>
          )}

          {/* Volunteer progress */}
          {campaign.volunteersNeeded != null && (
            <Box sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}
                >
                  🙋 {campaign.volunteersJoined ?? 0} / {campaign.volunteersNeeded}{" "}
                  volunteers
                </Typography>
                <Typography
                  sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#6366f1" }}
                >
                  {Math.round(volunteerPct)}%
                </Typography>
              </Box>
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
        </Box>

        {/* ── Footer: Meta + CTA ─────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 2,
            mt: "auto",
            borderTop: `1px solid ${alpha("#000", 0.05)}`,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {/* Organizer */}
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.7)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {campaign.organizer}
            </Typography>
            {/* Meta row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mt: 0.3,
              }}
            >
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.3,
                  fontSize: "0.7rem",
                  color: "text.disabled",
                }}
              >
                <PeopleAltIcon sx={{ fontSize: 12 }} />
                {campaign.backers} backers
              </Typography>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.3,
                  fontSize: "0.7rem",
                  color: daysLeft(campaign.deadline) === "Ended" ? "#dc2626" : "text.disabled",
                  fontWeight: daysLeft(campaign.deadline) === "Ended" ? 700 : 400,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 12 }} />
                {daysLeft(campaign.deadline)}
              </Typography>
            </Box>
          </Box>

          {/* CTA Button */}
          {isFunded ? (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: "16px !important", color: "#fff !important" }} />}
              label="Funded ✓"
              sx={{
                bgcolor: GREEN,
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.78rem",
                height: 36,
                "& .MuiChip-icon": { color: "#ffffff" },
              }}
            />
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: "16px !important" }} />}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/support/${campaign.id}`);
              }}
              sx={{
                background: `linear-gradient(135deg, ${PINK} 0%, ${PINK_DARK} 100%)`,
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.82rem",
                textTransform: "none",
                borderRadius: "12px",
                px: 2.5,
                py: 1,
                boxShadow: `0 4px 16px ${alpha(PINK, 0.35)}`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${PINK_DARK} 0%, #a21caf 100%)`,
                  boxShadow: `0 6px 24px ${alpha(PINK, 0.45)}`,
                },
              }}
            >
              Support This
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
