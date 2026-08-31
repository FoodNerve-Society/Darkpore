"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Paper,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
  Share as ShareIcon,
  WhatsApp as WhatsAppIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Telegram as TelegramIcon,
  Verified as VerifiedIcon,
  LocationOn as LocationOnIcon,
  Payments as PaymentsIcon,
  Category as CategoryIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Check as CheckIcon,
  ArrowOutward as ArrowOutwardIcon,
  FlipCameraAndroid as FlipIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";

interface ShareListingModalProps {
  open: boolean;
  onClose: () => void;
  listing: any;
  themeColor?: string;
  onToast?: (msg: string) => void;
}

export default function ShareListingModal({
  open,
  onClose,
  listing,
  themeColor = "#10b981",
  onToast,
}: ShareListingModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!listing) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://foodnerve.org/trade/${listing.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}`;
  const posterName = listing.organization?.name || listing.postedBy?.name || "FoodNerve Operator";
  const orgLogo = listing.organization?.logoUrl || listing.postedBy?.avatarUrl || "";
  const initial = posterName.charAt(0).toUpperCase() || "O";
  const displayTitle = listing.title || listing.name || "Untitled Role";

  // Exact Category Labeling
  const categoryLabel = listing.category === "volunteer" ? "VOLUNTEER" :
                        listing.category === "internship" ? "INTERNSHIP" :
                        listing.category === "jobs" || listing.category === "job" ? "PAID JOB" :
                        (listing.category?.replace("-", " ").toUpperCase() || "JOB");

  // Value Chain & Compensation resolution
  const valueChainFunction = listing.jobFunction || listing.commodity || listing.metadata?.jobFunction || "Agro-Enterprise Logistics";
  const compensationValue = listing.priceOrAsk || "Competitive Salary";

  const shareText = `Check out this job on FoodNerve: ${displayTitle} at ${posterName}. ${listing.priceOrAsk ? `Compensation: ${listing.priceOrAsk}. ` : ""}${currentUrl}`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      if (onToast) onToast("Job link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: displayTitle,
          text: `${displayTitle} at ${posterName} - FoodNerve Ecosystem`,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ── Exact DOM-to-PNG Exporter (100% Pixel-for-Pixel Identical) ──
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `foodnerve-job-3x4-${listing.id}.png`;
      link.href = dataUrl;
      link.click();
      if (onToast) onToast("Exact 3:4 Job card downloaded!");
    } catch (err) {
      console.error("DOM Image export failed:", err);
      if (onToast) onToast("Failed to render image, please try again");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setIsFlipped(false);
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: "28px", sm: "36px" },
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: "96vh", sm: "92vh" },
            display: "flex",
            flexDirection: "column",
            bgcolor: "#ffffff",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
            border: "1px solid #e2e8f0",
            position: "relative",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Floating Close Button Top-Right (No clunky header) */}
      <IconButton
        onClick={() => {
          setIsFlipped(false);
          onClose();
        }}
        size="small"
        sx={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 30,
          bgcolor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(12px)",
          color: "#ffffff",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
        }}
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* Modal Body with /join 3D Flip Mechanics */}
      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 3 },
          pt: { xs: 2.5, sm: 3 },
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
        }}
      >
        {/* 3D Flip Container (Exact /join physics) */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 410,
            perspective: "1000px",
          }}
        >
          <motion.div
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              transformStyle: "preserve-3d",
              position: "relative",
            }}
          >
            {/* ══════════════════════════════════════════════════════ */}
            {/* ── FRONT OF CARD: 3:4 VISUAL JOB CARD ───────────────── */}
            {/* ══════════════════════════════════════════════════════ */}
            <Paper
              ref={cardRef}
              elevation={0}
              onClick={() => setIsFlipped(true)}
              sx={{
                width: "100%",
                p: { xs: 3, sm: 3.5 },
                borderRadius: "32px",
                background: "radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.18) 0%, transparent 60%), radial-gradient(circle at 15% 85%, rgba(124, 58, 237, 0.14) 0%, transparent 60%), #060911",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: "0 25px 65px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: 2.2,
                boxSizing: "border-box",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                cursor: "pointer",
                zIndex: isFlipped ? 0 : 1,
              }}
            >
              {/* Top Brand & Category Header */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 900, letterSpacing: "0.06em", color: "#f8fafc" }}>
                    FOODNERVE <Typography component="span" sx={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, ml: 0.5 }}>SOCIETY</Typography>
                  </Typography>
                </Box>
                <Chip
                  label={categoryLabel}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    letterSpacing: "0.04em",
                    bgcolor: `${themeColor}20`,
                    color: themeColor,
                    borderRadius: "9999px",
                    border: `1px solid ${themeColor}50`,
                    px: 0.5,
                  }}
                />
              </Box>

              {/* Organization & Verification Header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
                <Avatar
                  src={orgLogo}
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "16px",
                    bgcolor: `${themeColor}25`,
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: "1.15rem",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                  }}
                >
                  {initial}
                </Avatar>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <Typography sx={{ fontSize: "0.98rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.2 }}>
                      {posterName}
                    </Typography>
                    <VerifiedIcon sx={{ fontSize: 17, color: "#10b981" }} />
                  </Box>
                  <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, mt: 0.3 }}>
                    Verified Hiring Operator
                  </Typography>
                </Box>
              </Box>

              {/* Job Title Headline */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: "#ffffff",
                  fontSize: { xs: "1.25rem", sm: "1.42rem" },
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  wordBreak: "break-word",
                }}
              >
                {displayTitle}
              </Typography>

              {/* Divider Line */}
              <Box sx={{ height: "1px", bgcolor: "rgba(255, 255, 255, 0.1)", my: 0.5 }} />

              {/* Clean 4-Metric Executive Ledger */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Location */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "rgba(2, 132, 199, 0.18)", border: "1px solid rgba(2, 132, 199, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <LocationOnIcon sx={{ fontSize: 18, color: "#38bdf8" }} />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Location & Base
                    </Typography>
                    <Typography noWrap sx={{ fontSize: "0.92rem", fontWeight: 900, color: "#f8fafc", mt: 0.1 }}>
                      {listing.location || "Pan-African Operations"}
                    </Typography>
                  </Box>
                </Box>

                {/* Salary / Compensation */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "rgba(5, 150, 105, 0.18)", border: "1px solid rgba(5, 150, 105, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <PaymentsIcon sx={{ fontSize: 18, color: "#34d399" }} />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Salary / Compensation
                    </Typography>
                    <Typography noWrap sx={{ fontSize: "0.92rem", fontWeight: 900, color: "#f8fafc", mt: 0.1 }}>
                      {compensationValue}
                    </Typography>
                  </Box>
                </Box>

                {/* Value Chain Function */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "rgba(124, 58, 237, 0.18)", border: "1px solid rgba(124, 58, 237, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CategoryIcon sx={{ fontSize: 18, color: "#a78bfa" }} />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Value Chain Function
                    </Typography>
                    <Typography noWrap sx={{ fontSize: "0.92rem", fontWeight: 900, color: "#f8fafc", mt: 0.1 }}>
                      {valueChainFunction}
                    </Typography>
                  </Box>
                </Box>

                {/* Application Status */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "rgba(225, 29, 72, 0.18)", border: "1px solid rgba(225, 29, 72, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <HourglassEmptyIcon sx={{ fontSize: 18, color: "#fb7185" }} />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: "#fb7185", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Application Status
                    </Typography>
                    <Typography noWrap sx={{ fontSize: "0.92rem", fontWeight: 900, color: "#f8fafc", mt: 0.1 }}>
                      Actively Open on Society
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Dedicated Bottom QR Code Container */}
              <Box
                sx={{
                  p: 1.6,
                  borderRadius: "24px",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.6,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "14px",
                    bgcolor: "#ffffff",
                    p: 0.4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                  }}
                >
                  <Box
                    component="img"
                    src={qrCodeUrl}
                    alt="QR Code"
                    crossOrigin="anonymous"
                    sx={{ width: "100%", height: "100%", borderRadius: "8px", objectFit: "contain" }}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.64rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    SCAN QR OR VISIT TO APPLY
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "0.84rem",
                        fontWeight: 900,
                        color: "#38bdf8",
                        fontFamily: "monospace",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      foodnerve.org/trade/{listing.id}
                    </Typography>
                    <ArrowOutwardIcon sx={{ fontSize: 13, color: "#38bdf8", flexShrink: 0 }} />
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* ══════════════════════════════════════════════════════ */}
            {/* ── BACK OF CARD: SOCIAL MEDIA SHARING CHANNELS ──────── */}
            {/* ══════════════════════════════════════════════════════ */}
            <Paper
              elevation={0}
              onClick={() => setIsFlipped(false)}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                p: { xs: 3, sm: 3.5 },
                borderRadius: "32px",
                background: "radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.2) 0%, transparent 60%), radial-gradient(circle at 15% 85%, rgba(16, 185, 129, 0.16) 0%, transparent 60%), #060911",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: "0 25px 65px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                cursor: "pointer",
                zIndex: isFlipped ? 1 : 0,
              }}
            >
              {/* Back Header */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SendIcon sx={{ fontSize: 18, color: "#38bdf8" }} />
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 900, color: "#ffffff", letterSpacing: "0.02em" }}>
                    SHARE TO SOCIAL CHANNELS
                  </Typography>
                </Box>
                <Chip
                  label={categoryLabel}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    bgcolor: "rgba(56, 189, 248, 0.2)",
                    color: "#38bdf8",
                    borderRadius: "9999px",
                  }}
                />
              </Box>

              {/* Top Wide Button: Copy Link (Atop the 4 channels) */}
              <Button
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyLink();
                }}
                startIcon={copied ? <CheckIcon sx={{ color: "#4ade80", fontSize: 20 }} /> : <ContentCopyIcon sx={{ color: "#38bdf8", fontSize: 20 }} />}
                sx={{
                  py: 1.4,
                  px: 2,
                  borderRadius: "18px",
                  bgcolor: "rgba(255, 255, 255, 0.07)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textTransform: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.14)",
                    borderColor: "#38bdf8",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>
                  {copied ? "Link Copied to Clipboard!" : "Copy Job Link"}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.72rem",
                    color: "#94a3b8",
                    fontFamily: "monospace",
                    maxWidth: 150,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUrl.replace(/^https?:\/\//, "")}
                </Typography>
              </Button>

              {/* 4 Social Channel Grid */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.4 }}>
                {/* WhatsApp */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWhatsAppShare();
                  }}
                  sx={{
                    p: 1.8,
                    borderRadius: "18px",
                    bgcolor: "#14532d",
                    border: "1px solid #22c55e",
                    color: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.6,
                    "&:hover": { bgcolor: "#166534", transform: "translateY(-2px)" },
                    transition: "all 0.2s",
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: 26, color: "#4ade80" }} />
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 900, textTransform: "none" }}>
                    WhatsApp
                  </Typography>
                  <Typography sx={{ fontSize: "0.62rem", color: "#86efac", fontWeight: 600 }}>
                    Status & Chats
                  </Typography>
                </Button>

                {/* LinkedIn */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLinkedInShare();
                  }}
                  sx={{
                    p: 1.8,
                    borderRadius: "18px",
                    bgcolor: "#0c4a6e",
                    border: "1px solid #0284c7",
                    color: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.6,
                    "&:hover": { bgcolor: "#0369a1", transform: "translateY(-2px)" },
                    transition: "all 0.2s",
                  }}
                >
                  <LinkedInIcon sx={{ fontSize: 26, color: "#38bdf8" }} />
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 900, textTransform: "none" }}>
                    LinkedIn
                  </Typography>
                  <Typography sx={{ fontSize: "0.62rem", color: "#7dd3fc", fontWeight: 600 }}>
                    Post to Network
                  </Typography>
                </Button>

                {/* X / Twitter */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTwitterShare();
                  }}
                  sx={{
                    p: 1.8,
                    borderRadius: "18px",
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.6,
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)", transform: "translateY(-2px)" },
                    transition: "all 0.2s",
                  }}
                >
                  <TwitterIcon sx={{ fontSize: 26, color: "#ffffff" }} />
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 900, textTransform: "none" }}>
                    X / Twitter
                  </Typography>
                  <Typography sx={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 600 }}>
                    Tweet Role
                  </Typography>
                </Button>

                {/* Telegram */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTelegramShare();
                  }}
                  sx={{
                    p: 1.8,
                    borderRadius: "18px",
                    bgcolor: "#1e3a8a",
                    border: "1px solid #3b82f6",
                    color: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.6,
                    "&:hover": { bgcolor: "#1d4ed8", transform: "translateY(-2px)" },
                    transition: "all 0.2s",
                  }}
                >
                  <TelegramIcon sx={{ fontSize: 26, color: "#60a5fa" }} />
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 900, textTransform: "none" }}>
                    Telegram
                  </Typography>
                  <Typography sx={{ fontSize: "0.62rem", color: "#93c5fd", fontWeight: 600 }}>
                    Channel Dispatch
                  </Typography>
                </Button>
              </Box>

              {/* Bottom Wide Button: System Share / More Options */}
              <Button
                fullWidth
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNativeShare();
                }}
                startIcon={<ShareIcon sx={{ color: "#ffffff", fontSize: 20 }} />}
                sx={{
                  py: 1.4,
                  borderRadius: "18px",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  color: "#ffffff",
                  borderColor: "rgba(255, 255, 255, 0.25)",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  textTransform: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  "&:hover": {
                    borderColor: "#ffffff",
                    bgcolor: "rgba(255, 255, 255, 0.12)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Share via Device / More Apps
              </Button>
            </Paper>
          </motion.div>
        </Box>

        </DialogContent>

      {/* ── Bottom Docked Action Buttons (Download or Share) ───── */}
      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Download PNG Button */}
        <Button
          variant="outlined"
          onClick={handleDownloadImage}
          disabled={isGenerating}
          startIcon={<DownloadIcon />}
          sx={{
            flex: 1,
            borderRadius: "18px",
            fontWeight: 800,
            fontSize: "0.88rem",
            color: "#0f172a",
            borderColor: "#cbd5e1",
            textTransform: "none",
            bgcolor: "#ffffff",
            py: 1.1,
            "&:hover": { borderColor: themeColor, color: themeColor, bgcolor: alpha(themeColor, 0.05) },
          }}
        >
          {isGenerating ? "Saving..." : "Download PNG"}
        </Button>

        {/* Flip / Share Button */}
        <Button
          variant="contained"
          onClick={() => setIsFlipped(!isFlipped)}
          startIcon={isFlipped ? <VisibilityIcon /> : <FlipIcon />}
          sx={{
            flex: 1,
            bgcolor: isFlipped ? "#0284c7" : themeColor,
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "0.88rem",
            borderRadius: "18px",
            py: 1.1,
            textTransform: "none",
            boxShadow: isFlipped
              ? "0 6px 20px rgba(2, 132, 199, 0.35)"
              : `0 6px 20px ${alpha(themeColor, 0.35)}`,
            "&:hover": {
              bgcolor: isFlipped ? "#0369a1" : alpha(themeColor, 0.9),
            },
          }}
        >
          {isFlipped ? "View Job Card" : "Share"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
