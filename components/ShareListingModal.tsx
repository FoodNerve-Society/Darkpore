"use client";

import React, { useState } from "react";
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
  QrCode2 as QrCodeIcon,
} from "@mui/icons-material";

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
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!listing) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://foodnerve.org/trade/${listing.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
  const posterName = listing.organization?.name || listing.postedBy?.name || "FoodNerve Operator";
  const orgLogo = listing.organization?.logoUrl || listing.postedBy?.avatarUrl || "";
  const orgRank = listing.organization?.rank || listing.postedBy?.rank || 1;
  const initial = posterName.charAt(0).toUpperCase() || "O";

  // 1. Exact Category Labeling (Paid Job, Volunteer, Internship)
  const categoryLabel = listing.category === "volunteer" ? "VOLUNTEER" :
                        listing.category === "internship" ? "INTERNSHIP" :
                        listing.category === "jobs" || listing.category === "job" ? "PAID JOB" :
                        (listing.category?.replace("-", " ").toUpperCase() || "MANDATE");

  const shareText = `Check out this role on FoodNerve: ${listing.title} at ${posterName}. ${listing.priceOrAsk ? `Compensation: ${listing.priceOrAsk}. ` : ""}${currentUrl}`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      if (onToast) onToast("Listing link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `${listing.title} at ${posterName} - FoodNerve Ecosystem`,
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

  // ── High-Res 3:4 Vertical Canvas Image Generator (1080 × 1440) ────
  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1440; // 3:4 Vertical Portrait
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setIsGenerating(false);
        return;
      }

      // 1. Dark Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1440);
      bgGrad.addColorStop(0, "#05070d");
      bgGrad.addColorStop(0.35, "#0b0f19");
      bgGrad.addColorStop(0.7, "#0f172a");
      bgGrad.addColorStop(1, "#05070d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1440);

      // 2. Ambient Glowing Orbs
      ctx.fillStyle = `${themeColor}22`;
      ctx.beginPath();
      ctx.arc(880, 240, 320, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#7c3aed15";
      ctx.beginPath();
      ctx.arc(200, 1100, 350, 0, Math.PI * 2);
      ctx.fill();

      // Outer Rounded Border Frame
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(40, 40, 1000, 1360, 48);
      ctx.stroke();

      // 3. Top Header Pill Container
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.roundRect(80, 80, 920, 70, 35);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("⚡ FOODNERVE ECOSYSTEM", 120, 123);

      ctx.fillStyle = themeColor;
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(categoryLabel, 960, 123);
      ctx.textAlign = "left";

      // 4. Hiring Organization Card Container
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      ctx.roundRect(80, 180, 920, 120, 32);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      // Avatar
      ctx.fillStyle = `${themeColor}35`;
      ctx.beginPath();
      ctx.roundRect(110, 200, 76, 76, 22);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(initial, 148, 250);
      ctx.textAlign = "left";

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("HIRING ORGANIZATION", 210, 228);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(posterName, 210, 262);

      // 5. Mandate Title Section
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      const words = listing.title.split(" ");
      let line = "";
      let titleY = 360;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 880 && n > 0) {
          ctx.fillText(line, 80, titleY);
          line = words[n] + " ";
          titleY += 56;
          if (titleY > 440) {
            line += "...";
            break;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 80, titleY);

      // Thin divider
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, titleY + 35);
      ctx.lineTo(1000, titleY + 35);
      ctx.stroke();

      // 6. Metric List in the Middle (NO containers, clean list with colored icons)
      const metricsList = [
        { label: "LOCATION & BASE", value: listing.location || "Pan-African Operations", color: "#0284c7", icon: "📍" },
        { label: "VALUE EXCHANGE", value: listing.priceOrAsk || "Competitive Retainer", color: "#059669", icon: "💰" },
        { label: "VALUE CHAIN FUNCTION", value: listing.jobFunction || listing.commodity || "Agro-Enterprise Logistics", color: "#7c3aed", icon: "⚡" },
        { label: "APPLICATION STATUS", value: "Actively Open on Society", color: "#e11d48", icon: "⏳" },
      ];

      let listY = titleY + 95;
      metricsList.forEach((m) => {
        // Icon Dot
        ctx.fillStyle = `${m.color}25`;
        ctx.beginPath();
        ctx.arc(115, listY - 6, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(m.icon, 115, listY + 2);
        ctx.textAlign = "left";

        // Label
        ctx.fillStyle = m.color;
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(m.label, 160, listY - 14);

        // Value
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(m.value, 160, listY + 16);

        listY += 92;
      });

      // 7. Dedicated Bottom Container (QR Code + Full Link)
      const bottomBoxY = 1110;
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.roundRect(80, bottomBoxY, 920, 230, 36);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Load QR Code Image
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.src = qrCodeUrl;
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        qrImg.onerror = resolve;
      });

      // White QR background frame
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(110, bottomBoxY + 25, 180, 180, 24);
      ctx.fill();

      try {
        ctx.drawImage(qrImg, 120, bottomBoxY + 35, 160, 160);
      } catch (e) {
        // If image fails, render QR placeholder
      }

      // Link text right side
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 17px sans-serif";
      ctx.fillText("SCAN QR CODE OR VISIT LINK TO APPLY", 320, bottomBoxY + 70);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 26px monospace";
      ctx.fillText(currentUrl.replace(/^https?:\/\//, ''), 320, bottomBoxY + 115);

      ctx.fillStyle = "#10b981";
      ctx.font = "600 15px sans-serif";
      ctx.fillText("🛡️ Verified FoodNerve Society Trust Contract", 320, bottomBoxY + 160);

      // Download
      const link = document.createElement("a");
      link.download = `foodnerve-mandate-3x4-${listing.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      if (onToast) onToast("3:4 Vertical visual card downloaded!");
    } catch (err) {
      console.error("Canvas export failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: "28px", sm: "36px" },
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: "96vh", sm: "92vh" },
            overflowY: "auto",
            bgcolor: "#ffffff",
            boxShadow: "0 28px 70px rgba(0,0,0,0.3)",
            border: "1px solid #e2e8f0",
          },
        },
      }}
    >
      {/* Modal Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e2e8f0",
          bgcolor: "#f8fafc",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "14px",
              bgcolor: `${themeColor}15`,
              color: themeColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShareIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
              Share Mandate Card
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              3:4 Vertical Social Card with QR Code & Direct Links
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#64748b" }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
        
        {/* ── 3:4 VERTICAL SOCIAL CARD PREVIEW (DARK OBSIDIAN + CLEAN METRIC LIST) ── */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 380,
            p: { xs: 2.5, sm: 3 },
            borderRadius: "32px",
            background: "linear-gradient(150deg, #05070d 0%, #0f172a 45%, #05070d 100%)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Ambient Glow */}
          <Box
            sx={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 180,
              height: 180,
              borderRadius: "50%",
              bgcolor: themeColor,
              filter: "blur(60px)",
              opacity: 0.22,
              pointerEvents: "none",
            }}
          />

          {/* 1. Top Pill Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 0.8,
              px: 1.5,
              borderRadius: "9999px",
              bgcolor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: "0.64rem", fontWeight: 900, letterSpacing: "0.08em", color: "#94a3b8" }}>
              ⚡ FOODNERVE
            </Typography>
            <Chip
              label={categoryLabel}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.62rem",
                fontWeight: 900,
                bgcolor: `${themeColor}25`,
                color: themeColor,
                borderRadius: "9999px",
                border: `1px solid ${themeColor}40`,
              }}
            />
          </Box>

          {/* 2. Organization Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.2,
              borderRadius: "20px",
              bgcolor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              mb: 2,
            }}
          >
            <Avatar
              src={orgLogo}
              sx={{
                width: 38,
                height: 38,
                borderRadius: "14px",
                bgcolor: `${themeColor}30`,
                color: "#ffffff",
                fontWeight: 900,
                fontSize: "0.95rem",
              }}
            >
              {initial}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: "0.84rem", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
                {posterName}
              </Typography>
              <Typography sx={{ fontSize: "0.66rem", color: "#94a3b8", fontWeight: 600 }}>
                Verified Society Operator · Rank {orgRank}
              </Typography>
            </Box>
          </Box>

          {/* 3. Role Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: "#ffffff",
              fontSize: { xs: "1.08rem", sm: "1.22rem" },
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 2,
            }}
          >
            {listing.title}
          </Typography>

          {/* 4. 4 Metric Badges in a Clean List (NO Box on each, just left icons) */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, my: 1 }}>
            {/* Location */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "rgba(2, 132, 199, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: "#0284c7" }} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#0284c7", textTransform: "uppercase" }}>Location & Base</Typography>
                <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#ffffff" }}>{listing.location || "Pan-African Operations"}</Typography>
              </Box>
            </Box>

            {/* Compensation */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "rgba(5, 150, 105, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PaymentsIcon sx={{ fontSize: 16, color: "#059669" }} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Value Exchange</Typography>
                <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#ffffff" }}>{listing.priceOrAsk || "Competitive Retainer"}</Typography>
              </Box>
            </Box>

            {/* Value Chain Function */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "rgba(124, 58, 237, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CategoryIcon sx={{ fontSize: 16, color: "#7c3aed" }} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase" }}>Value Chain Function</Typography>
                <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#ffffff" }}>{listing.jobFunction || listing.commodity || "Agro-Enterprise Logistics"}</Typography>
              </Box>
            </Box>

            {/* Status */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "rgba(225, 29, 72, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <HourglassEmptyIcon sx={{ fontSize: 16, color: "#e11d48" }} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#e11d48", textTransform: "uppercase" }}>Application Status</Typography>
                <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#ffffff" }}>Actively Open on Society</Typography>
              </Box>
            </Box>
          </Box>

          {/* 5. Dedicated Bottom Container with Dynamic QR Code & Full URL */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: "22px",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* Dynamic Scannable QR Code */}
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: "12px",
                bgcolor: "#ffffff",
                p: 0.4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <Box
                component="img"
                src={qrCodeUrl}
                alt="QR Code"
                sx={{ width: "100%", height: "100%", borderRadius: "8px", objectFit: "contain" }}
              />
            </Box>

            {/* URL text */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Scan QR or visit to apply
              </Typography>
              <Typography
                noWrap
                sx={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: "#38bdf8",
                  fontFamily: "monospace",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                foodnerve.org/trade/{listing.id}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ── 1-Click 3:4 Vertical Image Download Button ───────── */}
        <Button
          variant="outlined"
          onClick={handleDownloadImage}
          disabled={isGenerating}
          startIcon={<DownloadIcon />}
          sx={{
            py: 1.4,
            width: "100%",
            borderRadius: "20px",
            fontWeight: 800,
            fontSize: "0.9rem",
            color: "#0f172a",
            borderColor: "#cbd5e1",
            textTransform: "none",
            bgcolor: "#f8fafc",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            "&:hover": { borderColor: themeColor, bgcolor: alpha(themeColor, 0.05), color: themeColor },
          }}
        >
          {isGenerating ? "Rendering 3:4 Card with QR..." : "Download 3:4 Story Card (PNG)"}
        </Button>

        {/* ── Multi-Channel Social Sharing ─────────────────────── */}
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5 }}>
            Share Directly To
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.2 }}>
            <Tooltip title="Share on WhatsApp">
              <Button
                onClick={handleWhatsAppShare}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  py: 1.2,
                  borderRadius: "20px",
                  bgcolor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#16a34a",
                  "&:hover": { bgcolor: "#dcfce7", transform: "translateY(-2px)" },
                  transition: "all 0.2s",
                }}
              >
                <WhatsAppIcon sx={{ fontSize: 22 }} />
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "none" }}>WhatsApp</Typography>
              </Button>
            </Tooltip>

            <Tooltip title="Share on LinkedIn">
              <Button
                onClick={handleLinkedInShare}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  py: 1.2,
                  borderRadius: "20px",
                  bgcolor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#0284c7",
                  "&:hover": { bgcolor: "#dbeafe", transform: "translateY(-2px)" },
                  transition: "all 0.2s",
                }}
              >
                <LinkedInIcon sx={{ fontSize: 22 }} />
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "none" }}>LinkedIn</Typography>
              </Button>
            </Tooltip>

            <Tooltip title="Share on X (Twitter)">
              <Button
                onClick={handleTwitterShare}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  py: 1.2,
                  borderRadius: "20px",
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#0f172a",
                  "&:hover": { bgcolor: "#f1f5f9", transform: "translateY(-2px)" },
                  transition: "all 0.2s",
                }}
              >
                <TwitterIcon sx={{ fontSize: 22 }} />
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "none" }}>X / Twitter</Typography>
              </Button>
            </Tooltip>

            <Tooltip title="Share on Telegram">
              <Button
                onClick={handleTelegramShare}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  py: 1.2,
                  borderRadius: "20px",
                  bgcolor: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  color: "#0284c7",
                  "&:hover": { bgcolor: "#e0f2fe", transform: "translateY(-2px)" },
                  transition: "all 0.2s",
                }}
              >
                <TelegramIcon sx={{ fontSize: 22 }} />
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "none" }}>Telegram</Typography>
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* ── Link Copy Bar ───────────────────────────────────── */}
        <Box
          sx={{
            width: "100%",
            p: 1.2,
            px: 1.8,
            borderRadius: "20px",
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#334155",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "monospace",
            }}
          >
            {currentUrl}
          </Typography>
          <Button
            size="small"
            onClick={handleCopyLink}
            startIcon={copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: copied ? "#10b981" : "#0f172a",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.72rem",
              borderRadius: "14px",
              px: 1.8,
              py: 0.7,
              textTransform: "none",
              flexShrink: 0,
              "&:hover": { bgcolor: copied ? "#059669" : "#1e293b" },
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button onClick={onClose} sx={{ color: "#64748b", fontWeight: 700, textTransform: "none", borderRadius: "14px" }}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleNativeShare}
          startIcon={<ShareIcon />}
          sx={{
            bgcolor: themeColor,
            color: "#ffffff",
            fontWeight: 800,
            borderRadius: "18px",
            px: 3,
            py: 1,
            textTransform: "none",
            boxShadow: `0 6px 20px ${alpha(themeColor, 0.35)}`,
            "&:hover": { bgcolor: alpha(themeColor, 0.9) },
          }}
        >
          More Options
        </Button>
      </DialogActions>
    </Dialog>
  );
}
