// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
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
  Divider,
  IconButton,
} from "@mui/material";

import { useRouter, useParams } from "next/navigation";
import {
  useSociety,
  checkGatekeeper,
  RANK_NAMES,
  RANK_COLORS,
} from "@/context/SocietyContext";
import {
  mockTradeListings,
  type TradeListing,
  type TradeCategory,
} from "@/lib/db/society";

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

// ── Constants ──────────────────────────────────────────────
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const BLUE = "#3b82f6";

// ── Motion wrappers ────────────────────────────────────────


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

// ── Helpers ─────────────────────────────────────────────────
function timeAgo(dateString: string): string {
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now.getTime() - posted.getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getCategoryColor(category: TradeCategory): string {
  const map: Record<TradeCategory, string> = {
    "group-buy": EMERALD,
    "flash-sale": "#ef4444",
    swap: "#8b5cf6",
    need: BLUE,
    jobs: "#f59e0b",
  };
  return map[category] ?? EMERALD;
}

function getCategoryLabel(category: TradeCategory): string {
  const map: Record<TradeCategory, string> = {
    "group-buy": "🤝 Group-Buy (Ajo)",
    "flash-sale": "⚡ Flash Sale",
    swap: "♻️ Swap",
    need: "🔍 Need",
    jobs: "👷 Job",
  };
  return map[category] ?? category;
}

// ════════════════════════════════════════════════════════════
// LISTING DETAIL PAGE
// ════════════════════════════════════════════════════════════
export default function ListingDetailPage() {
  const { profile } = useSociety();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<TradeListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactGate, setShowContactGate] = useState(false);

  // Simulate fetching listing by ID
  useEffect(() => {
    const timer = setTimeout(() => {
      const found = mockTradeListings.find((l) => l.id === listingId) || null;
      setListing(found);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [listingId]);

  // Check Rank 3 gate for messaging
  const contactGate = profile ? checkGatekeeper(profile, 3) : null;

  const handleContactSeller = () => {
    if (!contactGate?.allowed) {
      setShowContactGate(true);
      return;
    }
    // TODO: Open messaging flow
    alert("Message sent! (Mock)");
  };

  // ── LOADING ──────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
        <Skeleton
          variant="rounded"
          width={80}
          height={36}
          sx={{ borderRadius: "12px", mb: 2 }}
        />
        <Skeleton
          variant="rounded"
          height={300}
          sx={{ borderRadius: "24px", mb: 3 }}
        />
        <Skeleton
          variant="rounded"
          height={200}
          sx={{ borderRadius: "24px" }}
        />
      </Box>
    );
  }

  // ── NOT FOUND ────────────────────────────────────────────
  if (!listing) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            mb: 3,
            color: "rgba(255, 255, 255, 0.7)",
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          Back
        </Button>
        <Paper
          elevation={0}
          sx={{ ...glassCard, p: 6, textAlign: "center" }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Listing Not Found
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            This listing may have been removed or expired.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/society/trade")}
            sx={{
              mt: 3,
              bgcolor: EMERALD,
              "&:hover": { bgcolor: EMERALD_DARK },
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Browse All Listings
          </Button>
        </Paper>
      </Box>
    );
  }

  const catColor = getCategoryColor(listing.category);
  const remaining = hoursLeft(listing.expiresAt);
  // Simulated NP score for seller
  const sellerNP = 2450;

  return (
    <Box
      sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}
    >
      {/* ── Back Button ─────────────────────────────────── */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{
          mb: 2,
          color: "rgba(255, 255, 255, 0.7)",
          fontWeight: 700,
          textTransform: "none",
          borderRadius: "12px",
          "&:hover": {
            bgcolor: alpha(EMERALD, 0.08),
          },
        }}
      >
        Back to Trade
      </Button>

      {/* ── Hero Image ──────────────────────────────────── */}
      <Paper elevation={0} sx={{ ...glassCard, overflow: "hidden", mb: 3, p: 0 }}>
        <Box
          sx={{
            height: { xs: 220, md: 340 },
            backgroundImage: `url(${listing.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          {/* Gradient overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background:
                "linear-gradient(transparent, rgba(0,0,0,0.55))",
            }}
          />
          {/* Category + badges overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              right: 16,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Chip
                label={getCategoryLabel(listing.category)}
                sx={{
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "#ffffff",
                  
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  height: 30,
                  border: `1px solid ${alpha(catColor, 0.5)}`,
                  mb: 1,
                }}
              />
              {remaining && (
                <Chip
                  size="small"
                  label={`⏰ ${remaining}`}
                  sx={{
                    ml: 1,
                    height: 26,
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    bgcolor: "rgba(239,68,68,0.85)",
                    color: "#ffffff",
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {listing.isBoosted && (
                <Chip
                  size="small"
                  icon={
                    <StarIcon
                      sx={{ fontSize: "14px !important", color: "#fbbf24 !important" }}
                    />
                  }
                  label="Boosted"
                  sx={{
                    height: 26,
                    fontWeight: 800,
                    fontSize: "0.68rem",
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "#fbbf24",
                    
                  }}
                />
              )}
              <IconButton
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.7)",
                  
                  color: "#ffffff",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.7)" },
                }}
              >
                <ShareIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* ── Listing Details ─────────────────────────────── */}
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.4rem", md: "1.8rem" },
              lineHeight: 1.3,
              mb: 1.5,
              color: "#ffffff",
            }}
          >
            {listing.title}
          </Typography>

          {/* Meta row */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOnIcon
                sx={{ fontSize: 16, color: "text.disabled" }}
              />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}
              >
                {listing.location} · {listing.lga}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon
                sx={{ fontSize: 16, color: "text.disabled" }}
              />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}
              >
                {timeAgo(listing.postedAt)}
              </Typography>
            </Box>
          </Box>

          {/* Price card */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: alpha(catColor, 0.06),
              border: `1px solid ${alpha(catColor, 0.15)}`,
              mb: 3,
            }}
          >
            {listing.category === "swap" ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: "#7c3aed", fontSize: "0.65rem" }}
                  >
                    Offering
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, fontSize: "1rem" }}
                  >
                    {listing.swapOffer}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: alpha("#8b5cf6", 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SwapHorizIcon sx={{ color: "#7c3aed", fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1, textAlign: "right" }}>
                  <Typography
                    variant="overline"
                    sx={{ color: EMERALD_DARK, fontSize: "0.65rem" }}
                  >
                    Wanting
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, fontSize: "1rem" }}
                  >
                    {listing.swapWant}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "text.disabled",
                    fontSize: "0.65rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  {listing.category === "jobs" ? "Compensation" : "Price / Ask"}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: catColor === "#f59e0b" ? "#d97706" : EMERALD_DARK,
                    mt: 0.3,
                  }}
                >
                  {listing.priceOrAsk}
                </Typography>
                {listing.quantity && (
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)", mt: 0.5 }}
                  >
                    Quantity: {listing.quantity}
                  </Typography>
                )}
              </Box>
            )}

            {/* Group-buy slots */}
            {listing.category === "group-buy" && listing.slots && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.8,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <GroupsIcon
                      sx={{ fontSize: 18, color: EMERALD_DARK }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: EMERALD_DARK,
                        fontSize: "0.78rem",
                      }}
                    >
                      {listing.slots.filled}/{listing.slots.total} slots filled
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "text.disabled" }}
                  >
                    {listing.slots.total - listing.slots.filled} remaining
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    (listing.slots.filled / listing.slots.total) * 100
                  }
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: alpha(EMERALD, 0.1),
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                      background: `linear-gradient(90deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`,
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Full description */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, fontSize: "1rem", mb: 1 }}
          >
            Description
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              lineHeight: 1.7,
              fontSize: "0.95rem",
              mb: 3,
            }}
          >
            {listing.description}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* ── Seller Info ────────────────────────────────── */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, fontSize: "1rem", mb: 2 }}
          >
            {listing.category === "jobs" ? "Hiring Organization" : "Seller"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              borderRadius: "16px",
              bgcolor: alpha(EMERALD, 0.04),
              border: `1px solid ${alpha(EMERALD, 0.12)}`,
            }}
          >
            <Avatar
              src={listing.postedBy.avatarUrl || undefined}
              sx={{
                width: 56,
                height: 56,
                fontSize: "1.1rem",
                fontWeight: 700,
                bgcolor: alpha(EMERALD, 0.15),
                color: EMERALD_DARK,
              }}
            >
              {getInitials(listing.postedBy.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 0.6 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, fontSize: "1rem" }}
                >
                  {listing.postedBy.name}
                </Typography>
                {listing.postedBy.isVerified && (
                  <VerifiedIcon
                    sx={{ fontSize: 18, color: "#3b82f6" }}
                  />
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mt: 0.5,
                }}
              >
                {/* NP Score */}
                <Chip
                  size="small"
                  label={`${sellerNP.toLocaleString()} NP`}
                  sx={{
                    height: 24,
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    bgcolor: alpha(EMERALD, 0.1),
                    color: EMERALD_DARK,
                    border: `1px solid ${alpha(EMERALD, 0.2)}`,
                  }}
                />
                {/* Rank badge */}
                <Chip
                  size="small"
                  icon={
                    <ShieldIcon
                      sx={{
                        fontSize: "13px !important",
                        color: `${RANK_COLORS[3]} !important`,
                      }}
                    />
                  }
                  label={RANK_NAMES[3]}
                  sx={{
                    height: 24,
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    bgcolor: alpha(RANK_COLORS[3], 0.1),
                    color: RANK_COLORS[3],
                    border: `1px solid ${alpha(RANK_COLORS[3], 0.2)}`,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ═══════════════════════════════════════════════════
          Contact / Offer Button
      ═══════════════════════════════════════════════════ */}
      <Box
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<MessageIcon />}
          onClick={handleContactSeller}
          sx={{
            background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`,
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "1rem",
            py: 2,
            borderRadius: "16px",
            textTransform: "none",
            boxShadow: `0 6px 24px ${alpha(EMERALD, 0.35)}`,
            mb: 2,
            "&:hover": {
              background: `linear-gradient(135deg, ${EMERALD_DARK} 0%, #047857 100%)`,
              boxShadow: `0 8px 32px ${alpha(EMERALD, 0.5)}`,
            },
          }}
        >
          {listing.category === "group-buy"
            ? "Join This Ajo"
            : listing.category === "jobs"
              ? "Apply Now"
              : "Make Offer / Contact Seller"}
        </Button>
      </Box>

      {/* ── Rank 3 Gate Modal ──────────────────────────── */}
      {showContactGate && contactGate && !contactGate.allowed && (
        <Box
        >
          <Paper
            elevation={0}
            sx={{
              ...glassCard,
              p: { xs: 3, md: 4 },
              textAlign: "center",
              border: `2px solid ${alpha("#f59e0b", 0.3)}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative gradient */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background:
                  "linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #8b5cf6 100%)",
              }}
            />

            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: alpha("#f59e0b", 0.12),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 30, color: "#f59e0b" }} />
            </Box>

            <Typography
              variant="h5"
              sx={{ fontWeight: 900, mb: 1, fontSize: "1.2rem" }}
            >
              Rank {contactGate.requiredRank} Required
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                mb: 3,
                maxWidth: 400,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              {contactGate.message}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Chip
                label={`Your Rank: ${RANK_NAMES[contactGate.currentRank as 1 | 2 | 3 | 4 | 5]}`}
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(
                    RANK_COLORS[contactGate.currentRank as 1 | 2 | 3 | 4 | 5],
                    0.12
                  ),
                  color:
                    RANK_COLORS[contactGate.currentRank as 1 | 2 | 3 | 4 | 5],
                  border: `1px solid ${alpha(
                    RANK_COLORS[contactGate.currentRank as 1 | 2 | 3 | 4 | 5],
                    0.3
                  )}`,
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: "text.disabled" }}
              >
                →
              </Typography>
              <Chip
                label={`Required: ${RANK_NAMES[contactGate.requiredRank as 1 | 2 | 3 | 4 | 5]}`}
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(
                    RANK_COLORS[contactGate.requiredRank as 1 | 2 | 3 | 4 | 5],
                    0.12
                  ),
                  color:
                    RANK_COLORS[contactGate.requiredRank as 1 | 2 | 3 | 4 | 5],
                  border: `1px solid ${alpha(
                    RANK_COLORS[contactGate.requiredRank as 1 | 2 | 3 | 4 | 5],
                    0.3
                  )}`,
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
              <Button
                variant="outlined"
                onClick={() => setShowContactGate(false)}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: alpha("#000", 0.15),
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    borderColor: alpha("#000", 0.3),
                  },
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() =>
                  router.push(contactGate.upgradeRoute || "/profile/kyc")
                }
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 800,
                  bgcolor: "#f59e0b",
                  "&:hover": { bgcolor: "#d97706" },
                  boxShadow: `0 4px 16px ${alpha("#f59e0b", 0.35)}`,
                }}
              >
                Upgrade Now
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Bottom spacer for mobile nav */}
      <Box sx={{ height: { xs: 24, md: 16 } }} />
    </Box>
  );
}
