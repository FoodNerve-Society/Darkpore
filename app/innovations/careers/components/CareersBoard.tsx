"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  alpha,
  Card,
  Chip,
  Button,
  Container,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedIcon from "@mui/icons-material/Verified";
import PaymentsIcon from "@mui/icons-material/Payments";
import ClearIcon from "@mui/icons-material/Clear";
import ShieldIcon from "@mui/icons-material/Shield";
import BoltIcon from "@mui/icons-material/Bolt";
import LanguageIcon from "@mui/icons-material/Language";
import SearchOffIcon from "@mui/icons-material/SearchOff";

const EMERALD = "#10b981";
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const AMBER = "#d97706";
const CYAN = "#0891b2";

function getCategoryTheme(cat: string) {
  if (cat === "volunteer") return { label: "Volunteer", color: PINK };
  if (cat === "internship" || cat === "internships") return { label: "Internship", color: BLUE };
  return { label: "Job", color: EMERALD };
}

export function getCompanyTier(job: any) {
  const org = job.organization;
  const isPlatformOwner = org?.isPlatformOwner || job.jobSource === "internal_foodnerve";
  const orgRank = typeof org?.rank === "number" ? org.rank : 1;
  const isExternal = org?.isExternal || job.jobSource === "external";

  if (isPlatformOwner) {
    return {
      id: "core",
      tierName: "FoodNerve Core",
      icon: <BoltIcon sx={{ fontSize: 14 }} />,
      color: "#059669",
      bg: "rgba(16, 185, 129, 0.16)",
      borderColor: "rgba(16, 185, 129, 0.45)",
    };
  }

  if (!isExternal && orgRank >= 3) {
    return {
      id: "partner",
      tierName: `Society Partner • Rank ${orgRank}+`,
      icon: <ShieldIcon sx={{ fontSize: 14 }} />,
      color: "#2563eb",
      bg: "rgba(37, 99, 235, 0.14)",
      borderColor: "rgba(37, 99, 235, 0.4)",
    };
  }

  if (!isExternal && orgRank === 2) {
    return {
      id: "partner",
      tierName: "Society Partner • Rank 2",
      icon: <ShieldIcon sx={{ fontSize: 14 }} />,
      color: CYAN,
      bg: "rgba(8, 145, 178, 0.14)",
      borderColor: "rgba(8, 145, 178, 0.4)",
    };
  }

  return {
    id: "external",
    tierName: "External Job",
    icon: <LanguageIcon sx={{ fontSize: 14 }} />,
    color: AMBER,
    bg: "rgba(217, 119, 6, 0.14)",
    borderColor: "rgba(217, 119, 6, 0.4)",
  };
}

function CoherentExecutiveJobCard({
  job,
  selectedTier,
  onSelectTier,
}: {
  job: any;
  selectedTier: string;
  onSelectTier: (tierId: string) => void;
}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const org = job.organization;
  const isExternal = org?.isExternal;
  const orgName = isExternal ? org.externalEntityName : (org?.name || job.postedBy?.name || "FoodNerve Operator");
  const orgLogo = isExternal ? org.externalEntityLogoUrl : (org?.logoUrl || job.postedBy?.avatarUrl || "");
  const initial = orgName.charAt(0).toUpperCase() || "O";

  const { label: catLabel, color: categoryColor } = getCategoryTheme(job.category);
  const tier = getCompanyTier(job);
  const locationText = job.location || "Pan-African";
  const compDisplay = job.priceOrAsk || (job.npReward ? `${job.npReward} NP` : "Competitive");
  const isTierActive = selectedTier === tier.id;

  return (
    <Box
      sx={{
        position: "relative",
        pt: "28px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── 1. INTERACTIVE TIER BAR LAYERED AT BACK (z-index: 1) ── */}
      <Tooltip title={`Click to filter by ${tier.tierName}`} arrow placement="top">
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onSelectTier(isTierActive ? "all" : tier.id);
          }}
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "74%",
            maxWidth: 240,
            pt: 0.8,
            pb: 2.6,
            px: 2,
            bgcolor: isTierActive ? tier.color : tier.bg,
            color: isTierActive ? "#ffffff" : tier.color,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1.5px solid ${isTierActive ? tier.color : tier.borderColor}`,
            borderBottom: "none",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 0.6,
            zIndex: 1,
            cursor: "pointer",
            boxShadow: `0 -4px 16px ${alpha(tier.color, isTierActive ? 0.35 : 0.16)}`,
            transition: "all 0.25s ease",
            "&:hover": {
              transform: "translateX(-50%) translateY(-3px)",
              bgcolor: isTierActive ? tier.color : alpha(tier.color, 0.24),
              boxShadow: `0 -6px 20px ${alpha(tier.color, 0.35)}`,
            },
            ...(isHovered && !isTierActive && {
              transform: "translateX(-50%) translateY(-2px)",
              boxShadow: `0 -6px 20px ${alpha(tier.color, 0.25)}`,
            }),
          }}
        >
          {tier.icon}
          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 900,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              color: isTierActive ? "#ffffff" : tier.color,
            }}
          >
            {tier.tierName}
          </Typography>
        </Box>
      </Tooltip>

      {/* ── 2. MAIN CARD BODY (z-index: 2) ── */}
      <Card
        variant="outlined"
        onClick={() => router.push(`/careers/${job.id}`)}
        sx={{
          borderRadius: "26px",
          cursor: "pointer",
          bgcolor: "#ffffff",
          border: "1px solid #e2e8f0",
          background: `linear-gradient(145deg, #ffffff 40%, ${categoryColor}08 100%)`,
          boxShadow: isHovered
            ? `0 24px 48px -10px ${alpha(tier.color, 0.2)}, 0 0 0 1px ${alpha(tier.color, 0.28)}`
            : "0 2px 14px -2px rgba(0,0,0,0.04)",
          transform: isHovered ? "translateY(-4px)" : "none",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          position: "relative",
          overflow: "hidden",
          p: { xs: 2.5, sm: 3 },
          zIndex: 2,
        }}
      >
        <Box>
          {/* Top Row: Avatar & Category Chip */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Box
                sx={{
                  p: 0.3,
                  borderRadius: "14px",
                  bgcolor: "#ffffff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  border: "1px solid #f1f5f9",
                  flexShrink: 0,
                }}
              >
                <Avatar
                  src={orgLogo}
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: `${categoryColor}15`,
                    color: categoryColor,
                    fontWeight: 900,
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                >
                  {initial}
                </Avatar>
              </Box>

              <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.86rem",
                    color: "#475569",
                    fontWeight: 800,
                  }}
                >
                  {orgName}
                </Typography>
                {org?.verified && (
                  <VerifiedIcon sx={{ fontSize: 14, color: EMERALD, flexShrink: 0 }} />
                )}
              </Box>
            </Box>

            <Chip
              label={catLabel}
              size="small"
              sx={{
                height: 24,
                fontSize: "0.68rem",
                fontWeight: 800,
                bgcolor: `${categoryColor}15`,
                color: categoryColor,
                borderRadius: "9999px",
                border: `1px solid ${categoryColor}25`,
                px: 0.5,
              }}
            />
          </Box>

          {/* Job Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.3,
              fontSize: { xs: "1.1rem", sm: "1.18rem" },
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.6em",
            }}
          >
            {job.title}
          </Typography>

          {/* Location & Compensation Badges */}
          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 2.5 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                px: 1.2,
                py: 0.4,
                borderRadius: "9999px",
                color: "#475569",
                fontSize: "0.74rem",
                fontWeight: 700,
              }}
            >
              <LocationOnIcon sx={{ fontSize: 13, color: categoryColor }} /> {locationText}
            </Box>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                px: 1.2,
                py: 0.4,
                borderRadius: "9999px",
                color: "#0f172a",
                fontSize: "0.74rem",
                fontWeight: 800,
              }}
            >
              <PaymentsIcon sx={{ fontSize: 13, color: categoryColor }} /> {compDisplay}
            </Box>
          </Box>
        </Box>

        {/* Action Footer */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px dashed #e2e8f0",
            pt: 2,
            mt: "auto",
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: "0.84rem", color: categoryColor }}>
            View Job
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: `${categoryColor}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: categoryColor,
              transform: isHovered ? "translateX(4px)" : "none",
              transition: "all 0.25s ease",
              ...(isHovered && {
                bgcolor: categoryColor,
                color: "#ffffff",
              }),
            }}
          >
            <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default function CareersBoard({
  coreEcosystemRoles,
  societyPartners,
  externalSourced,
  tenantId,
}: {
  coreEcosystemRoles: any[];
  societyPartners: any[];
  externalSourced: any[];
  tenantId: string;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allJobs = useMemo(() => {
    return [...(coreEcosystemRoles || []), ...(societyPartners || []), ...(externalSourced || [])];
  }, [coreEcosystemRoles, societyPartners, externalSourced]);

  const categories = useMemo(() => {
    const jobCount = allJobs.filter((j) => j.category === "jobs" || j.category === "job").length;
    const internCount = allJobs.filter((j) => j.category === "internship" || j.category === "internships").length;
    const volunteerCount = allJobs.filter((j) => j.category === "volunteer").length;

    return [
      { id: "all", title: "All", count: allJobs.length, color: EMERALD },
      { id: "jobs", title: "Jobs", count: jobCount, color: EMERALD },
      { id: "internships", title: "Internships", count: internCount, color: BLUE },
      { id: "volunteer", title: "Volunteering", count: volunteerCount, color: PINK },
    ];
  }, [allJobs]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // 1. Category Filter
      const cat = job.category?.toLowerCase() || "";
      if (activeCategory === "jobs" && cat !== "jobs" && cat !== "job") return false;
      if (activeCategory === "internships" && cat !== "internship" && cat !== "internships") return false;
      if (activeCategory === "volunteer" && cat !== "volunteer") return false;

      // 2. Interactive Tier Filter (Tapped from tier bar)
      if (selectedTier !== "all") {
        const jobTier = getCompanyTier(job);
        if (jobTier.id !== selectedTier) return false;
      }

      // 3. Global Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = job.title?.toLowerCase().includes(q);
        const orgMatch = (job.organization?.name || job.postedBy?.name || "").toLowerCase().includes(q);
        const locMatch = (job.location || "").toLowerCase().includes(q);
        const catMatch = (job.category || "").toLowerCase().includes(q);
        if (!titleMatch && !orgMatch && !locMatch && !catMatch) return false;
      }

      return true;
    });
  }, [allJobs, activeCategory, selectedTier, searchQuery]);

  const activeThemeColor = categories.find((c) => c.id === activeCategory)?.color || EMERALD;

  const tierBadgeData = {
    core: { label: "FoodNerve Core", color: EMERALD },
    partner: { label: "Society Partners", color: BLUE },
    external: { label: "External Jobs", color: AMBER },
  }[selectedTier] || null;

  return (
    <Container maxWidth="xl" sx={{ mt: -6, position: "relative", zIndex: 10, px: { xs: 2, sm: 3, md: 6 } }}>
      
      {/* ── 1. GLOBAL SEARCH BAR (ATOP THE PILLS) ── */}
      <Box sx={{ maxWidth: 640, mx: "auto", mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search jobs, companies, or locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="medium"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: activeThemeColor, fontSize: 22, ml: 1 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <ClearIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              bgcolor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.06)",
              "& fieldset": { borderColor: "rgba(226, 232, 240, 0.9)" },
              "&:hover fieldset": { borderColor: activeThemeColor },
              "&.Mui-focused fieldset": { borderColor: activeThemeColor, borderWidth: "2px" },
            },
          }}
        />
      </Box>

      {/* ── 2. PILL CATEGORY TAB MENU ── */}
      <Box sx={{ display: "flex", width: "100%", mb: 3, alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ position: "relative", width: "max-content", maxWidth: "100%" }}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflowX: "auto",
              p: 0.75,
              gap: 1.2,
              bgcolor: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "32px",
              border: "1px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 8px 30px -6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <Box
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  sx={{
                    px: { xs: 2, sm: 2.8 },
                    py: 1.2,
                    position: "relative",
                    zIndex: 2,
                    color: isActive ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    borderRadius: "999px",
                    "&:hover": {
                      color: isActive ? "#ffffff" : "#0f172a",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                    <Typography
                      sx={{
                        fontWeight: isActive ? 900 : 700,
                        textTransform: "none",
                        fontSize: { xs: "0.85rem", sm: "0.92rem" },
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {cat.title}
                    </Typography>
                    {cat.count > 0 && (
                      <Box
                        sx={{
                          bgcolor: isActive ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                          color: isActive ? "#ffffff" : "#64748b",
                          px: 0.9,
                          py: 0.2,
                          borderRadius: "999px",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                        }}
                      >
                        {cat.count}
                      </Box>
                    )}
                  </Box>

                  {/* Spring Highlight Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-career-category"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: "999px",
                        backgroundColor: cat.color,
                        zIndex: -1,
                        boxShadow: `0 6px 20px ${alpha(cat.color, 0.45)}`,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ── 3. ACTIVE TIER FILTER BADGE (DISMISSIBLE) ── */}
      {tierBadgeData && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 4 }}>
          <Typography sx={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 700 }}>
            Filtering:
          </Typography>
          <Chip
            label={tierBadgeData.label}
            onDelete={() => setSelectedTier("all")}
            sx={{
              bgcolor: alpha(tierBadgeData.color, 0.12),
              color: tierBadgeData.color,
              border: `1px solid ${alpha(tierBadgeData.color, 0.35)}`,
              fontWeight: 800,
              fontSize: "0.78rem",
              borderRadius: "9999px",
              "& .MuiChip-deleteIcon": {
                color: tierBadgeData.color,
                "&:hover": { color: "#0f172a" },
              },
            }}
          />
        </Box>
      )}

      {/* ── 4. UNIFIED DYNAMIC GRID ── */}
      {filteredJobs.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: { xs: 3, sm: 3.5, md: 4 },
          }}
        >
          {filteredJobs.map((job) => (
            <CoherentExecutiveJobCard
              key={job.id}
              job={job}
              selectedTier={selectedTier}
              onSelectTier={setSelectedTier}
            />
          ))}
        </Box>
      ) : (
        /* ── 5. MINIMAL CLEAN EMPTY STATE ── */
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <SearchOffIcon sx={{ fontSize: 36, color: "#94a3b8" }} />
          <Typography sx={{ fontWeight: 800, color: "#475569", fontSize: "1rem" }}>
            No matching opportunities found
          </Typography>
          <Button
            variant="text"
            onClick={() => {
              setActiveCategory("all");
              setSelectedTier("all");
              setSearchQuery("");
            }}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              fontSize: "0.85rem",
              color: EMERALD,
              borderRadius: "9999px",
              px: 2,
              "&:hover": { bgcolor: alpha(EMERALD, 0.08) },
            }}
          >
            Clear filters
          </Button>
        </Box>
      )}
    </Container>
  );
}
