// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Paper,
  Button,
  IconButton,
  Skeleton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Divider,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  LiveTv as LiveTvIcon,
  FiberManualRecord as DotIcon,
  Verified as VerifiedIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Download as DownloadIcon,
  Description as DocIcon,
  Send as SendIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  MenuOpen as MenuOpenIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

import { useParams, useRouter } from "next/navigation";
import {
  getLearnContent,
  type LearnContent,
} from "@/lib/db/society";
import { useSociety } from "@/context/SocietyContext";

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const ACCENT = "#f59e0b";
const ACCENT_DARK = "#d97706";
const LIVE_RED = "#ef4444";



// ═══════════════════════════════════════════════════════════
// MOCK WORKSHEETS — 10 Subcategory Worksheets
// ═══════════════════════════════════════════════════════════

interface Worksheet {
  id: string;
  title: string;
  fileType: string;
  size: string;
  category: string;
}

const MOCK_WORKSHEETS: Worksheet[] = [
  { id: "w1", title: "Cold-Chain Gap Analysis Framework", fileType: "PDF", size: "2.4 MB", category: "Infrastructure" },
  { id: "w2", title: "Post-Harvest Loss Calculator", fileType: "XLSX", size: "1.1 MB", category: "Analytics" },
  { id: "w3", title: "Solar Cold Storage ROI Template", fileType: "PDF", size: "890 KB", category: "Finance" },
  { id: "w4", title: "EV Fleet Route Optimization Sheet", fileType: "XLSX", size: "1.8 MB", category: "Logistics" },
  { id: "w5", title: "Farmer Cooperative Agreement Template", fileType: "DOCX", size: "340 KB", category: "Legal" },
  { id: "w6", title: "Commodity Grading Standards Guide", fileType: "PDF", size: "3.2 MB", category: "Quality" },
  { id: "w7", title: "Soil Nutrient Testing Protocol", fileType: "PDF", size: "1.5 MB", category: "Agronomy" },
  { id: "w8", title: "Supply Chain Mapping Worksheet", fileType: "PDF", size: "2.1 MB", category: "Strategy" },
  { id: "w9", title: "Market Price Monitoring Dashboard", fileType: "XLSX", size: "950 KB", category: "Market Intel" },
  { id: "w10", title: "Impact Measurement Framework", fileType: "PDF", size: "1.7 MB", category: "Reporting" },
];

// ═══════════════════════════════════════════════════════════
// MOCK CHAT MESSAGES
// ═══════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  author: string;
  avatarLetter: string;
  text: string;
  timestamp: string;
  isHost: boolean;
}

const MOCK_CHAT: ChatMessage[] = [
  { id: "ch1", author: "Fatima Bello", avatarLetter: "F", text: "Welcome everyone! We'll be starting in just a moment. Get your questions ready.", timestamp: "2:00 PM", isHost: true },
  { id: "ch2", author: "Amina Yusuf", avatarLetter: "A", text: "Excited for this session! Cold-chain is the biggest challenge in our region.", timestamp: "2:01 PM", isHost: false },
  { id: "ch3", author: "Ibrahim Sule", avatarLetter: "I", text: "Can we discuss the solar-powered cold rooms? I'm building a prototype for my final year project.", timestamp: "2:03 PM", isHost: false },
  { id: "ch4", author: "FoodNerve", avatarLetter: "FN", text: "Absolutely Ibrahim! We'll cover solar cold storage in the second segment. Stay tuned 🌞", timestamp: "2:04 PM", isHost: true },
  { id: "ch5", author: "Chidi Okoro", avatarLetter: "C", text: "The cassava processing industry alone loses 40% to post-harvest failures. This is critical.", timestamp: "2:05 PM", isHost: false },
  { id: "ch6", author: "David Adeyemi", avatarLetter: "D", text: "From an investment perspective, cold-chain infrastructure is the highest-ROI play in Nigerian AgTech right now.", timestamp: "2:07 PM", isHost: false },
  { id: "ch7", author: "Dr. Ngozi Eze", avatarLetter: "N", text: "Quick data point: our Sahel region research shows 35% loss reduction with even basic evaporative cooling structures.", timestamp: "2:09 PM", isHost: false },
];

// ═══════════════════════════════════════════════════════════
// FILE TYPE COLOR
// ═══════════════════════════════════════════════════════════

function getFileColor(type: string): string {
  switch (type) {
    case "PDF": return "#ef4444";
    case "XLSX": return "#10b981";
    case "DOCX": return "#3b82f6";
    default: return "#6b7280";
  }
}

// ═══════════════════════════════════════════════════════════
// COMPANION DRAWER (Worksheets)
// ═══════════════════════════════════════════════════════════

function CompanionDrawer({
  open,
  onClose,
  isMobile,
}: {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant={isMobile ? "temporary" : "persistent"}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "85vw", sm: 380 },
          bgcolor: "rgba(0,0,0,)",
          borderLeft: (t) =>
            `1px solid ${
              t.palette.mode === "dark"
                ? alpha("#fff", 0.08)
                : alpha("#000", 0.06)
            }`,
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: (t) =>
            `1px solid ${
              t.palette.mode === "dark"
                ? alpha("#fff", 0.06)
                : alpha("#000", 0.06)
            }`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIcon sx={{ color: ACCENT_DARK, fontSize: 22 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.2 }}>
              Companion Materials
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.7rem" }}>
              {MOCK_WORKSHEETS.length} downloadable resources
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Worksheet List */}
      <List
        sx={{
          px: 1,
          pt: 1,
          overflowY: "auto",
          flex: 1,
        }}
      >
        {MOCK_WORKSHEETS.map((ws, idx) => (
          <Box
            key={ws.id}
          >
            <ListItemButton
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                py: 1.5,
                px: 2,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: "rgba(255, 255, 255, 0.03)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DocIcon
                    sx={{
                      fontSize: 16,
                      color: getFileColor(ws.fileType),
                    }}
                  />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={ws.title}
                secondary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>
                    <Chip
                      label={ws.fileType}
                      size="small"
                      sx={{
                        height: 18,
                        fontWeight: 700,
                        fontSize: "0.6rem",
                        bgcolor: "rgba(255, 255, 255, 0.03)",
                        color: getFileColor(ws.fileType),
                      }}
                    />
                    <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.68rem" }}>
                      {ws.size}
                    </Typography>
                    <Chip
                      label={ws.category}
                      size="small"
                      sx={{
                        height: 18,
                        fontWeight: 600,
                        fontSize: "0.58rem",
                        bgcolor: "rgba(255, 255, 255, 0.03)",
                        color: ACCENT_DARK,
                      }}
                    />
                  </Box>
                }
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      lineHeight: 1.3,
                    },
                  },
                }}
              />
              <IconButton
                size="small"
                sx={{
                  color: ACCENT_DARK,
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)" },
                  ml: 0.5,
                }}
              >
                <DownloadIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </ListItemButton>
          </Box>
        ))}
      </List>
    </Drawer>
  );
}

// ═══════════════════════════════════════════════════════════
// LIVESTREAM THEATER PAGE
// ═══════════════════════════════════════════════════════════

export default function LivestreamTheaterPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useSociety();
  const id = params?.id as string;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [stream, setStream] = useState<LearnContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const allContent = await getLearnContent();
      if (cancelled) return;
      const found = allContent.find(
        (c) => c.swimlane === "livestreams" && c.id === id
      );
      setStream(found || null);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Update drawer state when screen size changes
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const isLive = stream?.liveStatus === "live";
  const isUpcoming = stream?.liveStatus === "upcoming";

  const scheduledDate = stream?.scheduledAt
    ? new Date(stream.scheduledAt).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Skeleton variant="rounded" width={100} height={36} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="rounded" sx={{ height: { xs: 220, md: 450 }, borderRadius: 3, mb: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (!stream) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, textAlign: "center", pt: 8 }}>
        <LiveTvIcon sx={{ fontSize: 56, color: alpha(LIVE_RED, 0.3), mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Livestream not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/learn")}
          sx={{ fontWeight: 700, color: ACCENT_DARK }}
        >
          Back to Learn
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 12,
        background: isLive
          ? `linear-gradient(180deg, ${alpha(LIVE_RED, 0.04)} 0%, transparent 20%)`
          : "linear-gradient(180deg, rgba(245,158,11,0.03) 0%, transparent 20%)",
      }}
    >
      {/* Companion Drawer */}
      <CompanionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isMobile={isMobile}
      />

      {/* ═══════════════════════ BACK NAV + CONTROLS ═══════════════════════ */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pt: { xs: 2, md: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/learn")}
          sx={{
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "rgba(255, 255, 255, 0.7)",
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)", color: ACCENT_DARK },
          }}
        >
          Back to Learn
        </Button>
        <Button
          startIcon={<MenuOpenIcon />}
          onClick={() => setDrawerOpen((prev) => !prev)}
          sx={{
            fontWeight: 700,
            fontSize: "0.82rem",
            color: ACCENT_DARK,
            textTransform: "none",
            bgcolor: "rgba(255, 255, 255, 0.03)",
            borderRadius: 2,
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)" },
          }}
        >
          {drawerOpen ? "Hide" : "Show"} Materials
        </Button>
      </Box>

      {/* ═══════════════════════ STREAM HEADER ═══════════════════════ */}
      <Box
        sx={{ px: { xs: 2, md: 3 }, pt: 1, pb: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, flexWrap: "wrap" }}>
          {/* Live Status Badge */}
          {isLive && (
            <Chip
              icon={
                <DotIcon
                  sx={{
                    fontSize: 10,
                    animation: "pulse-dot 1.2s ease-in-out infinite",
                    "@keyframes pulse-dot": {
                      "0%, 100%": { opacity: 1, transform: "scale(1)" },
                      "50%": { opacity: 0.5, transform: "scale(1.4)" },
                    },
                  }}
                />
              }
              label="LIVE NOW"
              size="small"
              sx={{
                height: 26,
                fontWeight: 800,
                fontSize: "0.72rem",
                letterSpacing: "0.05em",
                bgcolor: LIVE_RED,
                color: "#ffffff",
                "& .MuiChip-icon": { color: "#ffffff" },
                animation: "pulse-glow 2s ease-in-out infinite",
                "@keyframes pulse-glow": {
                  "0%, 100%": { boxShadow: `0 0 8px ${alpha(LIVE_RED, 0.4)}` },
                  "50%": { boxShadow: `0 0 18px ${alpha(LIVE_RED, 0.7)}` },
                },
              }}
            />
          )}
          {isUpcoming && (
            <Chip
              icon={<CalendarIcon sx={{ fontSize: 14 }} />}
              label="UPCOMING"
              size="small"
              sx={{
                height: 26,
                fontWeight: 700,
                fontSize: "0.72rem",
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: "#ffffff",
                "& .MuiChip-icon": { color: "#ffffff" },
              }}
            />
          )}
          {stream.enrolledCount != null && (
            <Chip
              icon={<PeopleIcon sx={{ fontSize: 13 }} />}
              label={isLive ? `${stream.enrolledCount} watching` : `${stream.enrolledCount} registered`}
              size="small"
              sx={{
                height: 24,
                fontWeight: 600,
                fontSize: "0.7rem",
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: isLive ? LIVE_RED : ACCENT_DARK,
                "& .MuiChip-icon": { color: isLive ? LIVE_RED : ACCENT_DARK },
              }}
            />
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.4rem", sm: "1.7rem", md: "2rem" },
            lineHeight: 1.15,
            mb: 1,
          }}
        >
          {stream.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: "0.7rem",
                fontWeight: 700,
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: ACCENT_DARK,
              }}
            >
              {stream.author.name.charAt(0)}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "rgba(255, 255, 255, 0.7)", fontSize: "0.85rem" }}>
              {stream.author.name}
            </Typography>
            {stream.author.isVerified && (
              <VerifiedIcon sx={{ fontSize: 15, color: ACCENT }} />
            )}
          </Box>
          {scheduledDate && (
            <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.78rem" }}>
              {scheduledDate}
            </Typography>
          )}
          {stream.duration && (
            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
              label={stream.duration}
              size="small"
              sx={{
                height: 22,
                fontWeight: 600,
                fontSize: "0.68rem",
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: "rgba(255, 255, 255, 0.7)",
                "& .MuiChip-icon": { color: "text.disabled" },
              }}
            />
          )}
        </Box>
      </Box>

      {/* ═══════════════════════ VIDEO EMBED AREA ═══════════════════════ */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          mb: 3,
          // Adjust width when drawer is open (desktop)
          mr: !isMobile && drawerOpen ? "380px" : 0,
          transition: "margin-right 0.3s ease",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            height: { xs: 220, sm: 340, md: 480 },
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: isLive
              ? `2px solid ${alpha(LIVE_RED, 0.3)}`
              : `1px solid ${alpha("#fff", 0.06)}`,
            boxShadow: isLive
              ? `0 0 40px ${alpha(LIVE_RED, 0.15)}`
              : "0 12px 48px rgba(0,0,0,0.15)",
          }}
        >
          {/* Background thumbnail */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${stream.thumbnailUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.2) blur(6px)",
            }}
          />

          {/* Play / Join button */}
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: isLive
                  ? `linear-gradient(135deg, ${LIVE_RED} 0%, #dc2626 100%)`
                  : `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isLive
                  ? `0 0 40px ${alpha(LIVE_RED, 0.5)}`
                  : `0 0 30px ${alpha(ACCENT, 0.4)}`,
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: isLive
                    ? `0 0 60px ${alpha(LIVE_RED, 0.6)}`
                    : `0 0 50px ${alpha(ACCENT, 0.5)}`,
                },
              }}
            >
              {isLive ? (
                <LiveTvIcon sx={{ fontSize: 42, color: "#ffffff" }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: 48, color: "#ffffff", ml: 0.3 }} />
              )}
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: alpha("#fff", 0.8),
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              {isLive ? "Join Live Stream" : isUpcoming ? "Set Reminder" : "Watch Replay"}
            </Typography>
          </Box>

          {/* Live indicator bar */}
          {isLive && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                bgcolor: LIVE_RED,
                animation: "live-bar 1.5s ease-in-out infinite",
                "@keyframes live-bar": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
              }}
            />
          )}
        </Paper>
      </Box>

      {/* ═══════════════════════ LIVE CHAT AREA ═══════════════════════ */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          mr: !isMobile && drawerOpen ? "380px" : 0,
          transition: "margin-right 0.3s ease",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "rgba(0,0,0,)",
            border: (t) =>
              `1px solid ${
                t.palette.mode === "dark"
                  ? alpha("#fff", 0.08)
                  : alpha("#000", 0.06)
              }`,
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderBottom: (t) =>
                `1px solid ${
                  t.palette.mode === "dark"
                    ? alpha("#fff", 0.06)
                    : alpha("#000", 0.06)
                }`,
            }}
          >
            <ChatIcon sx={{ fontSize: 20, color: isLive ? LIVE_RED : ACCENT_DARK }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1rem" }}>
              {isLive ? "Live Chat" : "Discussion"}
            </Typography>
            {isLive && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: LIVE_RED,
                  animation: "pulse 2s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1, transform: "scale(1)" },
                    "50%": { opacity: 0.4, transform: "scale(0.8)" },
                  },
                }}
              />
            )}
            <Chip
              label={`${MOCK_CHAT.length} messages`}
              size="small"
              sx={{
                height: 20,
                fontWeight: 600,
                fontSize: "0.65rem",
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: ACCENT_DARK,
                ml: "auto",
              }}
            />
          </Box>

          {/* Messages */}
          <Box
            sx={{
              maxHeight: 350,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(255, 255, 255, 0.03)",
                borderRadius: 2,
              },
            }}
          >
            {MOCK_CHAT.map((msg, idx) => (
              <Box
                key={msg.id}
                sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
              >
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    bgcolor: msg.isHost
                      ? alpha(LIVE_RED, 0.12)
                      : alpha(ACCENT, 0.1),
                    color: msg.isHost ? LIVE_RED : ACCENT_DARK,
                  }}
                >
                  {msg.avatarLetter}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        color: msg.isHost ? LIVE_RED : "text.primary",
                      }}
                    >
                      {msg.author}
                    </Typography>
                    {msg.isHost && (
                      <Chip
                        label="HOST"
                        size="small"
                        sx={{
                          height: 16,
                          fontWeight: 800,
                          fontSize: "0.55rem",
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                          color: LIVE_RED,
                        }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{ color: "text.disabled", fontSize: "0.68rem" }}
                    >
                      {msg.timestamp}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "0.83rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Chat Input */}
          <Box
            sx={{
              p: 2,
              borderTop: (t) =>
                `1px solid ${
                  t.palette.mode === "dark"
                    ? alpha("#fff", 0.06)
                    : alpha("#000", 0.06)
                }`,
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                fontSize: "0.65rem",
                fontWeight: 700,
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: ACCENT_DARK,
                flexShrink: 0,
              }}
            >
              {profile?.displayName?.charAt(0) ?? "U"}
            </Avatar>
            <TextField
              fullWidth
              size="small"
              placeholder={isLive ? "Say something..." : "Leave a comment..."}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  fontSize: "0.85rem",
                  bgcolor: "transparent",
                },
              }}
            />
            <IconButton
              disabled={!chatMessage.trim()}
              sx={{
                color: chatMessage.trim()
                  ? isLive
                    ? LIVE_RED
                    : ACCENT
                  : "text.disabled",
                bgcolor: chatMessage.trim()
                  ? alpha(isLive ? LIVE_RED : ACCENT, 0.08)
                  : "transparent",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                },
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* ═══════════════════════ STREAM DESCRIPTION ═══════════════════════ */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          mt: 3,
          mr: !isMobile && drawerOpen ? "380px" : 0,
          transition: "margin-right 0.3s ease",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: "rgba(0,0,0,)",
            border: (t) =>
              `1px solid ${
                t.palette.mode === "dark"
                  ? alpha("#fff", 0.08)
                  : alpha("#000", 0.06)
              }`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1rem", mb: 1 }}>
            About This Stream
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.92rem",
              lineHeight: 1.7,
              mb: 2,
            }}
          >
            {stream.description}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {stream.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  color: ACCENT_DARK,
                  border: `1px solid ${alpha(ACCENT, 0.15)}`,
                }}
              />
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
