// @ts-nocheck
"use client";

import React, { useState, Suspense } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Avatar,
  alpha,
  Skeleton,
  IconButton,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  Store as StoreIcon,
  LocalOffer as LocalOfferIcon,
  SwapHoriz as SwapIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Bolt as BoltIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSociety } from "@/context/SocietyContext";
import { TradeListing, TradeCategory } from "@/lib/db/society";

// ── Colors ────────────────────────────────────────────────
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const FLASH_RED = "#ef4444";

const glassCard = {
  bgcolor: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
  transition: "all 0.3s ease",
};

// ── Mock Data (until backend is fully wired) ────────────────
const MOCK_LISTINGS: TradeListing[] = [
  {
    id: "l1",
    category: "flash-sale",
    title: "10 Crates of Ripe Tomatoes (Must Go Today)",
    description: "Harvested yesterday, need to move them quickly.",
    priceOrAsk: "₦12,000 / crate",
    location: "Mile 12 Market",
    lga: "Kosofe",
    postedBy: { name: "Alhaja Food Supply", avatarUrl: "", isVerified: true },
    postedAt: new Date().toISOString(),
    urgency: "expiring",
    status: "active",
    isBoosted: true,
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop",
  },
  {
    id: "l2",
    category: "group-buy",
    title: "Community Solar Generator (10kVA)",
    description: "Looking for 5 people to co-own and share power for our processing hub.",
    priceOrAsk: "₦450,000 / slot",
    location: "Ikeja Tech Hub",
    lga: "Ikeja",
    postedBy: { name: "Oluwaseun GreenTech", avatarUrl: "", isVerified: true },
    postedAt: new Date().toISOString(),
    urgency: "normal",
    status: "active",
    slots: { filled: 2, total: 5 },
    isBoosted: false,
    imageUrl: "https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?w=800&auto=format&fit=crop",
  },
  {
    id: "l3",
    category: "swap",
    title: "Tractor Time for Fertilizer",
    description: "I have 2 days of tractor usage, need 10 bags of NPK fertilizer.",
    priceOrAsk: "Barter",
    location: "Ogbomoso Farm",
    lga: "Ogbomoso",
    postedBy: { name: "Kunle Farms", avatarUrl: "", isVerified: false },
    postedAt: new Date().toISOString(),
    urgency: "normal",
    status: "active",
    swapOffer: "Tractor",
    swapWant: "Fertilizer",
    isBoosted: false,
    imageUrl: "https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?w=800&auto=format&fit=crop",
  },
];

// ════════════════════════════════════════════════════════════
// UI COMPONENTS
// ════════════════════════════════════════════════════════════

function CategoryAccentBar({ category }: { category: string }) {
  let color = EMERALD;
  if (category === "flash-sale") color = FLASH_RED;
  if (category === "group-buy") color = "#3b82f6";
  if (category === "swap") color = "#8b5cf6";
  if (category === "need") color = "#f59e0b";

  return (
    <Box sx={{ width: "100%", height: 4, background: `linear-gradient(90deg, ${color} 0%, transparent 100%)` }} />
  );
}

function ListingCard({ listing }: { listing: TradeListing }) {
  const router = useRouter();
  
  return (
    <Paper
      elevation={0}
      onClick={() => router.push(`/society/trade/${listing.id}`)}
      sx={{
        ...glassCard,
        minWidth: { xs: 280, sm: 300 },
        maxWidth: 320,
        scrollSnapAlign: "start",
        flexShrink: 0,
        cursor: "pointer",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${alpha(EMERALD, 0.15)}`,
          borderColor: alpha(EMERALD, 0.3),
        }
      }}
    >
      {/* Image */}
      <Box sx={{ height: 160, position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${listing.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {listing.urgency === "expiring" && (
          <Chip
            icon={<BoltIcon sx={{ fontSize: 14 }} />}
            label="EXPIRING SOON"
            size="small"
            sx={{
              position: "absolute", top: 12, left: 12,
              bgcolor: FLASH_RED, color: "#fff", fontWeight: 800, fontSize: "0.7rem",
              "& .MuiChip-icon": { color: "#fff" }
            }}
          />
        )}
      </Box>

      <CategoryAccentBar category={listing.category} />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
           <Typography variant="caption" sx={{ color: EMERALD_DARK, fontWeight: 700, textTransform: "uppercase" }}>
             {listing.category.replace("-", " ")}
           </Typography>
           <Typography variant="caption" color="text.secondary">
             2h ago
           </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 1, color: "#000" }}>
          {listing.title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {listing.description}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Box>
             <Typography variant="h6" sx={{ fontWeight: 900, color: EMERALD_DARK, lineHeight: 1 }}>
               {listing.priceOrAsk}
             </Typography>
             <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
               <LocationIcon sx={{ fontSize: 12, color: "text.secondary" }} />
               <Typography variant="caption" color="text.secondary">{listing.location}</Typography>
             </Box>
          </Box>
          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(EMERALD, 0.1), color: EMERALD_DARK, fontSize: "0.8rem", fontWeight: 700 }}>
            {listing.postedBy.name.charAt(0)}
          </Avatar>
        </Box>
      </Box>
    </Paper>
  );
}

function HorizontalScrollRow({ title, emoji, items }: { title: string; emoji: string; items: TradeListing[] }) {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, px: { xs: 2, md: 0 } }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#000" }}>
          {emoji} {title}
        </Typography>
        <Button sx={{ color: EMERALD_DARK, fontWeight: 700, fontSize: "0.8rem" }}>View All</Button>
      </Box>
      <Box
        sx={{
          display: "flex", gap: 2, overflowX: "auto", pb: 2, px: { xs: 2, md: 0 }, scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none",
        }}
      >
        {items.map((item) => (
          <ListingCard key={item.id} listing={item} />
        ))}
      </Box>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════

function TradePageContent() {
  const router = useRouter();

  return (
    <Box sx={{ p: { xs: 0, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ px: { xs: 2, md: 0 }, pt: { xs: 3, md: 0 }, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: "#000" }}>
          Trade & Procure
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 600 }}>
          Connect directly with farmers, suppliers, and innovators to buy, sell, or barter.
        </Typography>
      </Box>

      {/* Filter Chips */}
      <Box sx={{ display: "flex", gap: 1, overflowX: "auto", px: { xs: 2, md: 0 }, mb: 4, pb: 1, "&::-webkit-scrollbar": { display: "none" } }}>
        {["All Listings", "Flash Sales", "Group-Buy", "Swaps", "Needs", "Jobs"].map((filter, i) => (
          <Chip
            key={filter}
            label={filter}
            onClick={() => {}}
            sx={{
              fontWeight: 700,
              bgcolor: i === 0 ? EMERALD : "rgba(0,0,0,0.04)",
              color: i === 0 ? "#fff" : "text.primary",
              "&:hover": { bgcolor: i === 0 ? EMERALD_DARK : "rgba(0,0,0,0.08)" }
            }}
          />
        ))}
      </Box>

      {/* Swimlanes */}
      <HorizontalScrollRow title="Urgent Flash Sales" emoji="⚡" items={MOCK_LISTINGS.filter(l => l.category === "flash-sale")} />
      <HorizontalScrollRow title="Community Group-Buys" emoji="🤝" items={MOCK_LISTINGS.filter(l => l.category === "group-buy")} />
      <HorizontalScrollRow title="Barter & Swaps" emoji="♻️" items={MOCK_LISTINGS.filter(l => l.category === "swap")} />

      {/* Post Button */}
      <Box sx={{ px: { xs: 2, md: 0 }, mt: 2, mb: 4 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/society/trade/create")}
          sx={{
            background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`,
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "1.05rem",
            py: 1.8,
            borderRadius: "16px",
            textTransform: "none",
            boxShadow: `0 8px 32px ${alpha(EMERALD, 0.4)}`,
            "&:hover": { background: `linear-gradient(135deg, ${EMERALD_DARK} 0%, #047857 100%)` },
          }}
        >
          Post a Listing
        </Button>
      </Box>

      <Box sx={{ height: { xs: 24, md: 16 } }} />
    </Box>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={<Skeleton variant="rounded" width="100%" height={400} sx={{ borderRadius: "20px" }} />}>
      <TradePageContent />
    </Suspense>
  );
}
