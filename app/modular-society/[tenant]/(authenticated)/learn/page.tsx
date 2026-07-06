// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
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
  LinearProgress,
  Tooltip,
  Select,
  MenuItem,
  Collapse
} from "@mui/material";
import {
  PlayCircle as PlayCircleIcon,
  Article as ArticleIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Lock as LockIcon,
  LiveTv as LiveTvIcon,
  School as SchoolIcon,
  VideoLibrary as VideoLibraryIcon,
  FiberManualRecord as DotIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  ArrowForwardIos as ArrowForwardIcon,
  ArrowBackIos as ArrowBackIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarIcon,
  Replay as ReplayIcon,
  TuneRounded as TuneIcon,
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  SwapHoriz as SwapHorizIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";

import { useRouter, useParams, usePathname } from "next/navigation";
import {
  getLearnContent,
  type LearnContent,
  type LearnSwimlane,
} from "@/lib/db/society";
import { useSociety, type Challenge, RANK_NAMES, type RankLevel } from "@/context/SocietyContext";
import { getTenantConfig } from "@/lib/cms";
import { getUserDrafts, deleteLearnContent } from "@/lib/actions/learn";
import FlipContainer from "../components/shared/FlipContainer";
import CreateLearnContentForm from "../components/forms/CreateLearnContentForm";
import CreatorStudioDashboard from "../components/forms/CreatorStudioDashboard";
import { ArticleReader } from "@/components/learn/ArticleReader";

const ACCENT = "#f59e0b";
const ACCENT_DARK = "#d97706";
const ACCENT_LIGHT = "#fbbf24";
const LIVE_RED = "#ef4444";




// ═══════════════════════════════════════════════════════════
// WU WEI FILTER CONFIG — Challenge-based filtering
// ═══════════════════════════════════════════════════════════

interface ChallengeFilter {
  key: Challenge | 'all';
  label: string;
  emoji: string;
  tagMatches: string[];
}

// Filters will be generated dynamically based on the active tenant

// ═══════════════════════════════════════════════════════════
// SWIMLANE CONFIG
// ═══════════════════════════════════════════════════════════

interface SwimlaneConfig {
  key: LearnSwimlane;
  title: string;
  icon: React.ReactNode;
  emoji: string;
}

const swimlaneConfigs: SwimlaneConfig[] = [
  {
    key: "livestreams",
    title: "Livestreams",
    icon: <LiveTvIcon sx={{ fontSize: 20 }} />,
    emoji: "🔴",
  },
  {
    key: "classes",
    title: "Classes",
    icon: <SchoolIcon sx={{ fontSize: 20 }} />,
    emoji: "🎓",
  },
  {
    key: "videos",
    title: "Videos",
    icon: <VideoLibraryIcon sx={{ fontSize: 20 }} />,
    emoji: "🎬",
  },
  {
    key: "articles",
    title: "Articles",
    icon: <ArticleIcon sx={{ fontSize: 20 }} />,
    emoji: "📰",
  },
  {
    key: "reports",
    title: "Reports",
    icon: <PictureAsPdfIcon sx={{ fontSize: 20 }} />,
    emoji: "📊",
  },
];

// ═══════════════════════════════════════════════════════════
// HORIZONTAL SCROLL ROW
// ═══════════════════════════════════════════════════════════

function HorizontalScrollRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, children]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <IconButton
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            left: { xs: 0, sm: 4 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 36,
            height: 36,
            bgcolor: "rgba(255,255,255,0.9)",
            border: (t) =>
              `1px solid ${
                t.palette.mode === "dark"
                  ? alpha("#fff", 0.1)
                  : alpha("#000", 0.08)
              }`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.03)",
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <IconButton
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            right: { xs: 0, sm: 4 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 36,
            height: 36,
            bgcolor: "rgba(255,255,255,0.9)",
            border: (t) =>
              `1px solid ${
                t.palette.mode === "dark"
                  ? alpha("#fff", 0.1)
                  : alpha("#000", 0.08)
              }`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.03)",
            },
          }}
        >
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}

      {/* Scrollable Container */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          px: { xs: 2, sm: 3, md: 4 },
          pb: 1,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255, 255, 255, 0.03)",
            borderRadius: 3,
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)" },
          },
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha(ACCENT, 0.2)} transparent`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════
// NP COST BADGE
// ═══════════════════════════════════════════════════════════

function NpBadge({ cost }: { cost: number }) {
  if (cost <= 0) return null;
  return (
    <Chip
      icon={<LockIcon sx={{ fontSize: 12 }} />}
      label={`${cost} NP`}
      size="small"
      sx={{
        height: 24,
        fontWeight: 700,
        fontSize: "0.68rem",
        bgcolor: "rgba(255, 255, 255, 0.03)",
        color: ACCENT_DARK,
        border: `1px solid ${alpha(ACCENT, 0.25)}`,
        "& .MuiChip-icon": { color: ACCENT_DARK, ml: 0.5 },
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// LIVE STATUS INDICATOR
// ═══════════════════════════════════════════════════════════

function LiveBadge({ status }: { status: "past" | "live" | "upcoming" }) {
  if (status === "live") {
    return (
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
          height: 24,
          fontWeight: 800,
          fontSize: "0.65rem",
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
    );
  }
  if (status === "upcoming") {
    return (
      <Chip
        icon={<CalendarIcon sx={{ fontSize: 13 }} />}
        label="UPCOMING"
        size="small"
        sx={{
          height: 24,
          fontWeight: 700,
          fontSize: "0.65rem",
          letterSpacing: "0.03em",
          bgcolor: "rgba(255, 255, 255, 0.03)",
          color: "#ffffff",
          "& .MuiChip-icon": { color: "#ffffff" },
        }}
      />
    );
  }
  return (
    <Chip
      icon={<ReplayIcon sx={{ fontSize: 13 }} />}
      label="REPLAY"
      size="small"
      sx={{
        height: 24,
        fontWeight: 700,
        fontSize: "0.65rem",
        letterSpacing: "0.03em",
        bgcolor: "rgba(255, 255, 255, 0.03)",
        color: "#ffffff",
        border: `1px solid ${alpha("#fff", 0.2)}`,
        "& .MuiChip-icon": { color: "#ffffff" },
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// CARD: LIVESTREAM
// ═══════════════════════════════════════════════════════════

function LivestreamCard({
  item,
  index,
  onClick,
}: {
  item: LearnContent;
  index: number;
  onClick?: () => void;
}) {
  const isLive = item.liveStatus === "live";
  const scheduledDate = item.scheduledAt
    ? new Date(item.scheduledAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        minWidth: { xs: 260, sm: 280 },
        maxWidth: 300,
        scrollSnapAlign: "start",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        bgcolor: "rgba(255, 255, 255, 0.03)",
        border: (t) =>
          `1px solid ${
            isLive
              ? alpha(LIVE_RED, 0.3)
              : t.palette.mode === "dark"
              ? alpha("#fff", 0.08)
              : alpha("#000", 0.06)
          }`,
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: isLive
            ? `0 16px 48px ${alpha(LIVE_RED, 0.2)}`
            : `0 16px 48px ${alpha(ACCENT, 0.15)}`,
          borderColor: isLive ? alpha(LIVE_RED, 0.5) : alpha(ACCENT, 0.3),
        },
      }}
    >
      {/* Thumbnail */}
      <Box sx={{ position: "relative", height: 160, overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${item.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.5s ease",
            ".MuiPaper-root:hover &": { transform: "scale(1.08)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* Live Badge */}
        <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}>
          {item.liveStatus && <LiveBadge status={item.liveStatus} />}
        </Box>

        {/* NP Badge */}
        {item.isPaid && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
            <NpBadge cost={item.nervePointsCost} />
          </Box>
        )}

        {/* Duration */}
        {item.duration && (
          <Chip
            label={item.duration}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              height: 22,
              fontWeight: 700,
              fontSize: "0.65rem",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: "#ffffff",
            }}
          />
        )}

        {/* Live indicator bar at bottom */}
        {isLive && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: LIVE_RED,
              animation: "live-bar 1.5s ease-in-out infinite",
              "@keyframes live-bar": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.4 },
              },
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 0.75,
            fontSize: "0.88rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        {/* Author row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
          <Avatar
            src={item.author.avatarUrl || undefined}
            sx={{
              width: 20,
              height: 20,
              fontSize: "0.6rem",
              fontWeight: 700,
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: ACCENT_DARK,
            }}
          >
            {item.author.name.charAt(0)}
          </Avatar>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "rgba(255, 255, 255, 0.7)", fontSize: "0.73rem" }}
          >
            {item.author.name}
          </Typography>
        </Box>

        {/* Meta */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {item.enrolledCount != null && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <PeopleIcon sx={{ fontSize: 13, color: "text.disabled" }} />
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontWeight: 600, fontSize: "0.7rem" }}
              >
                {item.enrolledCount}
              </Typography>
            </Box>
          )}
          {item.liveStatus === "upcoming" && scheduledDate && (
            <Typography
              variant="caption"
              sx={{ color: ACCENT_DARK, fontWeight: 600, fontSize: "0.7rem" }}
            >
              {scheduledDate}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD: CLASS
// ═══════════════════════════════════════════════════════════

function ClassCard({ item, index, onClick }: { item: LearnContent; index: number; onClick?: () => void }) {
  const enrollmentText =
    item.enrolledCount != null && item.maxEnrollment
      ? `${item.enrolledCount}/${item.maxEnrollment}`
      : item.enrolledCount != null
      ? `${item.enrolledCount} enrolled`
      : null;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        minWidth: { xs: 260, sm: 280 },
        maxWidth: 300,
        scrollSnapAlign: "start",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        bgcolor: "rgba(255, 255, 255, 0.03)",
        border: (t) =>
          `1px solid ${
            t.palette.mode === "dark"
              ? alpha("#fff", 0.08)
              : alpha("#000", 0.06)
          }`,
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 16px 48px ${alpha(ACCENT, 0.15)}`,
          borderColor: alpha(ACCENT, 0.3),
        },
      }}
    >
      {/* Thumbnail */}
      <Box sx={{ position: "relative", height: 150, overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${item.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.5s ease",
            ".MuiPaper-root:hover &": { transform: "scale(1.08)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* NP Badge */}
        {item.isPaid && item.nervePointsCost > 0 && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
            <NpBadge cost={item.nervePointsCost} />
          </Box>
        )}

        {/* Lesson count */}
        {item.lessonsCount && (
          <Chip
            icon={<SchoolIcon sx={{ fontSize: 12 }} />}
            label={`${item.lessonsCount} lessons`}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              height: 22,
              fontWeight: 700,
              fontSize: "0.65rem",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: "#ffffff",
              "& .MuiChip-icon": { color: "#ffffff" },
            }}
          />
        )}

        {/* Duration */}
        {item.duration && (
          <Chip
            label={item.duration}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              height: 22,
              fontWeight: 700,
              fontSize: "0.65rem",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: "#ffffff",
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 0.75,
            fontSize: "0.88rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        {/* Author + verified */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <Avatar
            src={item.author.avatarUrl || undefined}
            sx={{
              width: 20,
              height: 20,
              fontSize: "0.6rem",
              fontWeight: 700,
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: ACCENT_DARK,
            }}
          >
            {item.author.name.charAt(0)}
          </Avatar>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "rgba(255, 255, 255, 0.7)", fontSize: "0.73rem" }}
          >
            {item.author.name}
          </Typography>
          {item.author.isVerified && (
            <VerifiedIcon sx={{ fontSize: 13, color: ACCENT }} />
          )}
        </Box>

        {/* Enrollment progress */}
        {enrollmentText && (
          <Box sx={{ mb: 0.75 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.3,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.disabled",
                  fontWeight: 600,
                  fontSize: "0.68rem",
                }}
              >
                <PeopleIcon sx={{ fontSize: 12, mr: 0.3, verticalAlign: "middle" }} />
                {enrollmentText}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Completion rate */}
        {item.completionRate != null && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.3,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.disabled",
                  fontWeight: 600,
                  fontSize: "0.68rem",
                }}
              >
                Completion
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: ACCENT_DARK,
                  fontWeight: 700,
                  fontSize: "0.68rem",
                }}
              >
                {item.completionRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.completionRate}
              sx={{
                height: 5,
                borderRadius: 3,
                bgcolor: "rgba(245, 158, 11, 0.1)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_LIGHT} 100%)`,
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD: VIDEO
// ═══════════════════════════════════════════════════════════

function VideoCard({ item, index, onClick }: { item: LearnContent; index: number; onClick?: () => void }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        minWidth: { xs: 260, sm: 280 },
        maxWidth: 300,
        scrollSnapAlign: "start",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        bgcolor: "rgba(255, 255, 255, 0.03)",
        border: (t) =>
          `1px solid ${
            t.palette.mode === "dark"
              ? alpha("#fff", 0.08)
              : alpha("#000", 0.06)
          }`,
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 16px 48px ${alpha(ACCENT, 0.15)}`,
          borderColor: alpha(ACCENT, 0.3),
        },
        "&:hover .play-overlay": {
          opacity: 1,
        },
      }}
    >
      {/* Thumbnail with play overlay */}
      <Box sx={{ position: "relative", height: 165, overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${item.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.5s ease",
            ".MuiPaper-root:hover &": { transform: "scale(1.08)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* Play button overlay */}
        <Box
          className="play-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255, 255, 255, 0.03)",
            opacity: 0.7,
            transition: "opacity 0.3s ease",
          }}
        >
          <PlayCircleIcon
            sx={{
              fontSize: 52,
              color: "#ffffff",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
            }}
          />
        </Box>

        {/* NP Badge */}
        {item.isPaid && item.nervePointsCost > 0 && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
            <NpBadge cost={item.nervePointsCost} />
          </Box>
        )}

        {/* Duration */}
        {item.duration && (
          <Chip
            label={item.duration}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              height: 22,
              fontWeight: 700,
              fontSize: "0.65rem",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: "#ffffff",
              zIndex: 2,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 0.75,
            fontSize: "0.88rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Avatar
            src={item.author.avatarUrl || undefined}
            sx={{
              width: 20,
              height: 20,
              fontSize: "0.6rem",
              fontWeight: 700,
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: ACCENT_DARK,
            }}
          >
            {item.author.name.charAt(0)}
          </Avatar>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "rgba(255, 255, 255, 0.7)", fontSize: "0.73rem" }}
          >
            {item.author.name}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD: ARTICLE
// ═══════════════════════════════════════════════════════════

function ArticleCard({ item, index, onClick }: { item: LearnContent; index: number; onClick?: () => void }) {
  const isCommunityAuthor = !item.author.isVerified;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        minWidth: { xs: 260, sm: 280 },
        maxWidth: 300,
        scrollSnapAlign: "start",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        bgcolor: "rgba(255, 255, 255, 0.03)",
        border: (t) =>
          `1px solid ${
            t.palette.mode === "dark"
              ? alpha("#fff", 0.08)
              : alpha("#000", 0.06)
          }`,
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 16px 48px ${alpha(ACCENT, 0.15)}`,
          borderColor: alpha(ACCENT, 0.3),
        },
      }}
    >
      {/* Thumbnail */}
      <Box sx={{ position: "relative", height: 150, overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${item.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.5s ease",
            ".MuiPaper-root:hover &": { transform: "scale(1.08)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        {/* NP Badge */}
        {item.isPaid && item.nervePointsCost > 0 && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
            <NpBadge cost={item.nervePointsCost} />
          </Box>
        )}

        {/* Read time */}
        {item.readTime && (
          <Chip
            icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
            label={item.readTime}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              height: 22,
              fontWeight: 700,
              fontSize: "0.65rem",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: "#ffffff",
              "& .MuiChip-icon": { color: "#ffffff" },
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 0.75,
            fontSize: "0.88rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        {/* Author row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Avatar
            src={item.author.avatarUrl || undefined}
            sx={{
              width: 22,
              height: 22,
              fontSize: "0.6rem",
              fontWeight: 700,
              bgcolor: isCommunityAuthor
                ? alpha("#6366f1", 0.15)
                : alpha(ACCENT, 0.15),
              color: isCommunityAuthor ? "#6366f1" : ACCENT_DARK,
              border: isCommunityAuthor
                ? `1.5px solid ${alpha("#6366f1", 0.3)}`
                : "none",
            }}
          >
            {item.author.name.charAt(0)}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: isCommunityAuthor ? "#6366f1" : "text.secondary",
              fontSize: "0.73rem",
            }}
          >
            {item.author.name}
          </Typography>
          {isCommunityAuthor && (
            <Chip
              label="Community"
              size="small"
              sx={{
                height: 18,
                fontWeight: 700,
                fontSize: "0.58rem",
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: "#6366f1",
                border: `1px solid ${alpha("#6366f1", 0.2)}`,
              }}
            />
          )}
          {item.author.isVerified && (
            <VerifiedIcon sx={{ fontSize: 13, color: ACCENT }} />
          )}
        </Box>
      </Box>
    </Paper>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD: REPORT
// ═══════════════════════════════════════════════════════════

function ReportCard({ item, index, onClick }: { item: LearnContent; index: number; onClick?: () => void }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        minWidth: { xs: 260, sm: 280 },
        maxWidth: 300,
        scrollSnapAlign: "start",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        bgcolor: "rgba(255, 255, 255, 0.03)",
        border: (t) =>
          `1px solid ${
            t.palette.mode === "dark"
              ? alpha("#fff", 0.08)
              : alpha("#000", 0.06)
          }`,
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 16px 48px ${alpha(ACCENT, 0.15)}`,
          borderColor: alpha(ACCENT, 0.3),
        },
      }}
    >
      {/* Thumbnail */}
      <Box sx={{ position: "relative", height: 150, overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${item.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.5s ease",
            ".MuiPaper-root:hover &": { transform: "scale(1.08)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* PDF icon overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            width: 32,
            height: 32,
            borderRadius: "8px",
            bgcolor: "rgba(255, 255, 255, 0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 18, color: "#ffffff" }} />
        </Box>

        {/* NP Badge */}
        {item.isPaid && item.nervePointsCost > 0 && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
            <NpBadge cost={item.nervePointsCost} />
          </Box>
        )}

        {/* Page count */}
        {item.readTime && (
          <Chip
            label={item.readTime}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              height: 22,
              fontWeight: 700,
              fontSize: "0.65rem",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: "#ffffff",
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 0.75,
            fontSize: "0.88rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Avatar
            src={item.author.avatarUrl || undefined}
            sx={{
              width: 20,
              height: 20,
              fontSize: "0.6rem",
              fontWeight: 700,
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: ACCENT_DARK,
            }}
          >
            {item.author.name.charAt(0)}
          </Avatar>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "rgba(255, 255, 255, 0.7)", fontSize: "0.73rem" }}
          >
            {item.author.name}
          </Typography>
          {item.author.isVerified && (
            <VerifiedIcon sx={{ fontSize: 13, color: ACCENT }} />
          )}
        </Box>
      </Box>
    </Paper>
  );
}

// ═══════════════════════════════════════════════════════════
// SWIMLANE SKELETON
// ═══════════════════════════════════════════════════════════

function SwimlaneSkeleton() {
  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Skeleton variant="rounded" width={130} height={28} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" width={32} height={22} sx={{ borderRadius: 10 }} />
      </Box>
      <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            sx={{
              minWidth: { xs: 260, sm: 280 },
              height: 260,
              borderRadius: 3,
              flexShrink: 0,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD RENDERER
// ═══════════════════════════════════════════════════════════

function renderCard(
  swimlane: LearnSwimlane,
  item: LearnContent,
  index: number,
  onNavigate: (item: LearnContent) => void
) {
  const handleClick = () => onNavigate(item);
  switch (swimlane) {
    case "livestreams":
      return <LivestreamCard key={item.id} item={item} index={index} onClick={handleClick} />;
    case "classes":
      return <ClassCard key={item.id} item={item} index={index} onClick={handleClick} />;
    case "videos":
      return <VideoCard key={item.id} item={item} index={index} onClick={handleClick} />;
    case "articles":
      return <ArticleCard key={item.id} item={item} index={index} onClick={handleClick} />;
    case "reports":
      return <ReportCard key={item.id} item={item} index={index} onClick={handleClick} />;
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export default function LearnPage() {
  const baseTheme = useTheme();
  const learnTheme = useMemo(() => createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      primary: { main: ACCENT, dark: ACCENT_DARK, light: ACCENT_LIGHT },
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        disabled: '#94a3b8',
      }
    }
  }), [baseTheme]);

  const { profile } = useSociety();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const tenantId = (params?.tenant as string) || 'food';
  const tenantConfig = getTenantConfig(tenantId);

  // Dynamically generate Bottleneck Filters from CMS
  const BOTTLENECK_FILTERS: ChallengeFilter[] = useMemo(() => {
    const filters: ChallengeFilter[] = [{ key: 'all', label: 'All Content', emoji: '✨', tagMatches: [] }];
    tenantConfig.com.homepage.challenges.forEach(chal => {
      filters.push({
        key: chal.id as Challenge,
        label: chal.title,
        emoji: '📌', // Can be customized later in CMS
        tagMatches: [chal.id]
      });
    });
    return filters;
  }, [tenantConfig]);

  const [isFlipped, setIsFlipped] = useState(false);
  useEffect(() => {
    if (profile?.uid) {
      getUserDrafts(profile.uid).then(setDrafts);
    }
  }, [profile?.uid, isFlipped]);

  const [sessionKey, setSessionKey] = useState(0);
  const [postingAs, setPostingAs] = useState<'personal' | 'organization'>('personal');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [createContentType, setCreateContentType] = useState<string>('');
  
  const handleCategorySelect = (catId: string) => {
    setSelectedChallenge(catId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subId: string) => {
    setSelectedSubcategory(subId);
  };

  const handleTimeframeSelect = (tf: string) => {
    setDraftTaxonomy({
      category: selectedChallenge,
      subcategory: selectedSubcategory,
      timeframe: tf
    });
    setCreateContentType(expandedStartType as string);
    setIsFlipped(true);
  };

  // Color mapping based on content type
  const typeConfig: Record<string, { label: string, color: string }> = {
    article: { label: 'Article', color: '#3b82f6' },
    video: { label: 'Video', color: '#ef4444' },
    class: { label: 'Masterclass', color: '#8b5cf6' },
    livestream: { label: 'Livestream', color: '#10b981' },
    report: { label: 'Report', color: '#f59e0b' },
  };

  const currentConfig = typeConfig[createContentType] || { label: 'Content', color: ACCENT };
  
  useEffect(() => {
    if (profile?.organizations && profile.organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(profile.organizations[0].id);
    }
  }, [profile?.organizations, selectedOrgId]);
  
  const [showSwitchState, setShowSwitchState] = useState(false);
  const canCreate = profile && profile.currentRank >= 4;

  const handleTogglePostingAs = () => {
    setPostingAs(prev => prev === 'personal' ? 'organization' : 'personal');
    setShowSwitchState(true);
    setTimeout(() => {
      setShowSwitchState(false);
    }, 1500);
  };

  const [contentMap, setContentMap] = useState<Record<LearnSwimlane, LearnContent[]>>({
    livestreams: [],
    classes: [],
    videos: [],
    articles: [],
    reports: [],
  });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | 'all'>('all');
  const [activeArticle, setActiveArticle] = useState<LearnContent | null>(null);

  // ADD NEW STATES:
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [expandedStartType, setExpandedStartType] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [draftTaxonomy, setDraftTaxonomy] = useState<any>(null);
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.includes('/article/')) {
        setActiveArticle(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ═══════════════════════ NAVIGATION HANDLER ═══════════════════════
  const handleNavigate = useCallback((item: LearnContent) => {
    switch (item.swimlane) {
      case 'livestreams':
        router.push(`/learn/livestream/${item.id}`);
        break;
      case 'classes':
        router.push(`/learn/class/${item.id}`);
        break;
      case 'articles':
      case 'reports':
        window.history.pushState(null, '', `${pathname}/article/${item.id}`);
        setActiveArticle(item);
        break;
      case 'videos':
        // Videos stay in-page for now
        break;
      default:
        break;
    }
  }, [router]);

  // ═══════════════════════ FILTERED CONTENT ═══════════════════════
  const filteredContentMap = useMemo(() => {
    if (activeChallenge === 'all') return contentMap;
    const filterConfig = BOTTLENECK_FILTERS.find(f => f.key === activeChallenge);
    if (!filterConfig) return contentMap;
    const tagMatches = filterConfig.tagMatches;

    const filtered: Record<LearnSwimlane, LearnContent[]> = {
      livestreams: [],
      classes: [],
      videos: [],
      articles: [],
      reports: [],
    };

    for (const key of Object.keys(contentMap) as LearnSwimlane[]) {
      filtered[key] = contentMap[key].filter(item =>
        item.tags.some(tag => tagMatches.includes(tag))
      );
    }

    return filtered;
  }, [contentMap, activeChallenge]);

  const filteredTotalCount = useMemo(() => {
    return Object.values(filteredContentMap).reduce((sum, arr) => sum + arr.length, 0);
  }, [filteredContentMap]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const allContent = await getLearnContent();
        if (cancelled) return;

        const grouped: Record<LearnSwimlane, LearnContent[]> = {
          livestreams: [],
          classes: [],
          videos: [],
          articles: [],
          reports: [],
        };
        for (const item of allContent) {
          if (grouped[item.swimlane]) {
            grouped[item.swimlane].push(item);
          }
        }

        // Sort livestreams: live first, then upcoming, then past
        const liveOrder = { live: 0, upcoming: 1, past: 2 };
        grouped.livestreams.sort(
          (a, b) =>
            (liveOrder[a.liveStatus ?? "past"] ?? 2) -
            (liveOrder[b.liveStatus ?? "past"] ?? 2)
        );

        setContentMap(grouped);
        setTotalCount(allContent.length);
        setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const frontContent = (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        m: { xs: 1, md: 2 },
        minHeight: 0,
        height: { xs: 'calc(100% - 16px)', md: 'calc(100% - 32px)' },
        bgcolor: '#ffffff',
        borderRadius: 4,
        boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {activeArticle ? (
        <ArticleReader 
          slug={activeArticle.id} 
          articleData={activeArticle} 
          onBack={() => {
            window.history.pushState(null, '', pathname);
            setActiveArticle(null);
          }} 
        />
      ) : (
        <>
            <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
                @keyframes glideLeftEdge {
                  0% { transform: translate(-10%, -20%) scale(1); }
                  100% { transform: translate(50%, 120%) scale(1.5); }
                }
                @keyframes glideBottomEdge {
                  0% { transform: translate(20%, 20%) scale(1); }
                  100% { transform: translate(-120%, -60%) scale(1.4); }
                }
                @keyframes glideTopEdge {
                  0% { transform: translate(10%, -10%) scale(1); }
                  100% { transform: translate(-100%, 80%) scale(1.3); }
                }
              `}
            </style>
            
            {/* ── THE MASTER YOUR CRAFT HERO ── */}
            <Box sx={{ 
              position: 'relative', 
              borderRadius: '24px', 
              p: { xs: 4, md: 5 }, 
              mb: 3,
              overflow: 'hidden',
              flexShrink: 0,
              bgcolor: '#1a1a1a', 
              color: 'white',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              zIndex: 1,
            }}>
              {/* Fiery Edge Gradients (Moving along edges) */}
              <Box sx={{ 
                position: 'absolute', top: '-10%', left: '-5%', width: '35%', height: '65%', 
                bgcolor: '#FF416C', opacity: 0.55, filter: 'blur(50px)', borderRadius: '50%', zIndex: 0, 
                animation: 'glideLeftEdge 8s ease-in-out infinite alternate',
              }} />
              <Box sx={{ 
                position: 'absolute', bottom: '-10%', right: '-5%', width: '45%', height: '75%', 
                bgcolor: '#FCA048', opacity: 0.50, filter: 'blur(60px)', borderRadius: '50%', zIndex: 0, 
                animation: 'glideBottomEdge 10s ease-in-out infinite alternate-reverse',
              }} />
              <Box sx={{ 
                position: 'absolute', top: '-10%', right: '-10%', width: '35%', height: '55%', 
                bgcolor: '#FF4B2B', opacity: 0.45, filter: 'blur(50px)', borderRadius: '50%', zIndex: 0, 
                animation: 'glideTopEdge 9s ease-in-out infinite alternate',
              }} />

              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', width: '100%', gap: { xs: 4, md: 5 } }}>
                <Box sx={{ flex: 1, pr: { md: 4 } }}>
                  <Typography variant="h2" sx={{ 
                    color: '#ffffff', 
                    fontFamily: '"Caveat", cursive',
                    fontWeight: 700, 
                    fontSize: { xs: '3.5rem', md: '5rem' }, 
                    lineHeight: 1,
                    mb: 1.5,
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}>
                    Master Your Craft
                  </Typography>
                  
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: { xs: '1rem', md: '1.15rem' }, 
                    lineHeight: 1.6, 
                    fontWeight: 500, 
                    mb: { xs: 2, md: 0 }, 
                    maxWidth: 550 
                  }}>
                    Read simple guides, take classes, and watch live videos to learn everything you need to grow.
                  </Typography>
                </Box>

                {/* ═══════════════════════ CREATOR STUDIO WIDGET ═══════════════════════ */}
                {!isFlipped && canCreate && (
                  <Paper sx={{
                    p: { xs: 2.5, md: 3 }, borderRadius: '20px', 
                    bgcolor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(40px) saturate(200%)', 
                    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.5)',
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 3,
                    width: { xs: '100%', md: '300px' }, 
                    flexShrink: 0
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: 'rgba(255, 65, 108, 0.15)', color: '#FF416C' }}>
                          <ArticleIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', mb: 0.2 }}>
                            Creator Studio
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: drafts.length > 0 ? '#FCA048' : '#64748b', fontWeight: 600 }}>
                            {drafts.length > 0 
                              ? `${drafts.length} Active Draft${drafts.length === 1 ? '' : 's'}`
                              : "No active drafts"
                            }
                          </Typography>
                        </Box>
                      </Box>

                      {drafts.length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {drafts.slice(0, 3).map((draft: any) => (
                            <Box 
                              key={draft.id}
                              onClick={() => { setIsFlipped(true); setSelectedDraftId(draft.id); }}
                              sx={{ 
                                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.2, borderRadius: '10px', 
                                cursor: 'pointer', bgcolor: 'rgba(0,0,0,0.03)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.1)', transform: 'translateX(4px)' },
                                transition: 'all 0.2s'
                              }}
                            >
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FF416C', boxShadow: '0 0 8px #FF416C', flexShrink: 0 }} />
                              <Typography sx={{ 
                                fontSize: '0.8rem', fontWeight: 700, color: '#334155', 
                                noWrap: true, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' 
                              }}>
                                {draft.title || "Untitled Draft"}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    
                    <Button 
                      onClick={() => { setIsFlipped(true); setSelectedDraftId(null); }}
                      variant="contained"
                      sx={{ 
                        width: '100%',
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        color: '#fff', borderRadius: '12px', fontWeight: 700, px: 3, py: 1.5, textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.85rem',
                        '&:hover': { opacity: 0.9, transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' },
                        transition: 'all 0.2s ease'
                      }}>
                        Create New Content
                    </Button>
                  </Paper>
                )}
              </Box>
            </Box>

          {/* ═══════════════════════ TOP PICKS SECTION ═══════════════════════ */}
          <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, mt: 4, mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>Top Picks</Typography>
            {/* Placeholder for Top Picks */}
            <Box sx={{ p: 4, borderRadius: '16px', border: '2px dashed rgba(0,0,0,0.1)', textAlign: 'center', color: 'text.disabled', fontWeight: 600 }}>
              Top Picks Content Placeholder
            </Box>
          </Box>

          {/* ═══════════════════════ CONTINUE SECTION ═══════════════════════ */}
          <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>Continue</Typography>
            {/* Placeholder for Continue */}
            <Box sx={{ p: 4, borderRadius: '16px', border: '2px dashed rgba(0,0,0,0.1)', textAlign: 'center', color: 'text.disabled', fontWeight: 600 }}>
              Continue Content Placeholder
            </Box>
          </Box>
          
      {/* ═══════════════════════ WU WEI FILTER BAR ═══════════════════════ */}
      <Box
        sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 1, pt: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TuneIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filter by Challenge
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 0 },
            scrollbarWidth: 'none',
          }}
        >
          {BOTTLENECK_FILTERS.map((filter) => {
            const isActive = activeChallenge === filter.key;
            return (
              <Chip
                key={filter.key}
                label={`${filter.emoji} ${filter.label}`}
                onClick={() => setActiveChallenge(filter.key)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  height: 38,
                  px: 1,
                  flexShrink: 0,
                  borderRadius: '19px',
                  transition: 'all 0.25s ease',
                  ...(isActive
                    ? {
                        bgcolor: ACCENT,
                        color: "#ffffff",
                        boxShadow: `0 0 20px ${alpha(ACCENT, 0.45)}`,
                        '&:hover': { bgcolor: ACCENT_DARK },
                      }
                    : {
                        bgcolor: "rgba(255, 255, 255, 0.03)",
                        color: 'text.secondary',
                        border: `1px solid ${alpha(ACCENT, 0.15)}`,
                        '&:hover': {
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                        },
                      }),
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* ═══════════════════════ SWIMLANE ROWS ═══════════════════════ */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 4, md: 5 }, pt: 1 }}>
        {loading
          ? swimlaneConfigs.map((cfg) => (
              <SwimlaneSkeleton key={cfg.key} />
            ))
          : swimlaneConfigs.map((cfg, rowIndex) => {
              const items = filteredContentMap[cfg.key];
              if (items.length === 0) return null;

              return (
                <Box
                  key={`${cfg.key}-${activeChallenge}`}
                >
                  {/* Section Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: { xs: 2, sm: 3, md: 4 },
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: "10px",
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                          color: ACCENT_DARK,
                        }}
                      >
                        {cfg.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                        }}
                      >
                        {cfg.emoji} {cfg.title}
                      </Typography>
                      <Chip
                        label={items.length}
                        size="small"
                        sx={{
                          height: 22,
                          minWidth: 22,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                          color: ACCENT_DARK,
                          "& .MuiChip-label": { px: 0.8 },
                        }}
                      />
                    </Box>
                    <Button
                      endIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        color: ACCENT_DARK,
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                        },
                      }}
                    >
                      See All
                    </Button>
                  </Box>

                  {/* Horizontal Scroll Row */}
                  <HorizontalScrollRow>
                    {items.map((item, idx) => renderCard(cfg.key, item, idx, handleNavigate))}
                  </HorizontalScrollRow>
                </Box>
              );
            })}
      </Box>

      {/* ═══════════════════════ EMPTY STATE ═══════════════════════ */}
      {/* Empty state — no content at all */}
      {!loading && totalCount === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            px: 3,
          }}
        >
          <SchoolIcon
            sx={{ fontSize: 56, color: alpha(ACCENT, 0.3), mb: 2 }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "rgba(255, 255, 255, 0.7)", mb: 0.5 }}
          >
            No content available
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.disabled", textAlign: "center" }}
          >
            New courses, livestreams, and articles are added regularly. Check
            back soon.
          </Typography>
        </Box>
      )}

      {/* Empty state — filter active but no matches */}
      {!loading && totalCount > 0 && filteredTotalCount === 0 && activeChallenge !== 'all' && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 3,
          }}
        >
          <TuneIcon
            sx={{ fontSize: 48, color: alpha(ACCENT, 0.3), mb: 2 }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "rgba(255, 255, 255, 0.7)", mb: 0.5 }}
          >
            No matches for this challenge
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.disabled", textAlign: "center", mb: 2 }}
          >
            Try selecting a different challenge or view all content.
          </Typography>
          <Button
            onClick={() => setActiveChallenge('all')}
            sx={{
              fontWeight: 700,
              color: ACCENT_DARK,
              textTransform: 'none',
              '&:hover': { bgcolor: "rgba(255, 255, 255, 0.03)" },
            }}
          >
            Show All Content
          </Button>
        </Box>
      )}
        </>
      )}

    </Paper>
  );

  const backContent = (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        m: { xs: 1, md: 2 },
        minHeight: 0,
        height: { xs: 'calc(100% - 16px)', md: 'calc(100% - 32px)' },
        bgcolor: '#ffffff',
        borderRadius: 4,
        boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Premium Gradient Header Bar - Adapts to Content Type */}
      <Box sx={{ height: 4, width: '100%', background: `linear-gradient(90deg, ${currentConfig.color} 0%, ${currentConfig.color}88 50%, #7c3aed 100%)`, flexShrink: 0, transition: 'background 0.5s ease' }} />
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          flexShrink: 0,
        }}
      >
        <Tooltip title="Close Editor">
          <IconButton
            onClick={() => {
              if ((!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new') {
                setIsFlipped(false);
              } else {
                setCreateContentType('');
                setSelectedDraftId(null);
              }
            }}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'rgba(0,0,0,0.03)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', transition: 'color 0.3s ease', display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ opacity: 0.5 }}>Studio</span>
            <span style={{ opacity: 0.5 }}>/</span>
            {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? 'Overview' : (selectedDraftId === 'new' ? `Create ${currentConfig.label}` : `Edit ${currentConfig.label}`)}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontWeight: 600, mt: 0.2 }}>
            Publishing as {postingAs === 'personal' ? (profile?.displayName || 'Unknown') : (profile?.organizations?.find(o => o.id === selectedOrgId)?.name || 'Organization')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Post as Personal">
            <IconButton 
              onClick={() => setPostingAs('personal')}
              sx={{ 
                bgcolor: postingAs === 'personal' ? 'rgba(0,0,0,0.04)' : 'transparent', 
                width: 36, height: 36,
                border: postingAs === 'personal' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }
              }}
            >
              <Avatar src={profile?.avatarUrl} sx={{ width: 24, height: 24 }} />
            </IconButton>
          </Tooltip>

          {profile?.organizations && profile.organizations.length > 0 && (
            <Tooltip title="Post as Organization">
              <IconButton 
                onClick={() => setPostingAs('organization')}
                sx={{ 
                  bgcolor: postingAs === 'organization' ? 'rgba(0,0,0,0.04)' : 'transparent', 
                  width: 36, height: 36,
                  border: postingAs === 'organization' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }
                }}
              >
                <BusinessIcon sx={{ color: postingAs === 'organization' ? '#0f172a' : '#94a3b8', fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}

          {postingAs === 'organization' && profile?.organizations && profile.organizations.length > 0 && (
            <Select
              size="small"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              renderValue={(selected) => {
                const org = profile.organizations?.find((o: any) => o.id === selected);
                if (!org) return null;
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={org.logoUrl} sx={{ width: 20, height: 20 }} />
                    <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, fontSize: '0.85rem' }}>
                      {org.name}
                    </Typography>
                  </Box>
                );
              }}
              sx={{
                ml: 0.5,
                height: 36,
                minWidth: { xs: 60, sm: 140 },
                borderRadius: '12px',
                bgcolor: 'rgba(0,0,0,0.02)',
                '& .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.15)' },
                '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: '0.85rem' }
              }}
            >
              {profile.organizations.map((org: any) => (
                <MenuItem key={org.id} value={org.id} sx={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Avatar src={org.logoUrl} sx={{ width: 20, height: 20 }} />
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
      </Box>

      {/* Dashboard vs Form Body */}
      {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? (
        <CreatorStudioDashboard
          userName={
            profile?.firstName 
              ? `${profile.prefixes && profile.prefixes.length > 0 ? profile.prefixes.join(' ') + ' ' : ''}${profile.firstName}`
              : (profile?.displayName ? profile.displayName.split(' ')[0] : 'Creative')
          }
          drafts={drafts}
          challengesData={tenantConfig.com.homepage.challenges}
          onStartFresh={(type, taxonomy) => {
            setCreateContentType(type);
            setDraftTaxonomy(taxonomy);
            setSelectedDraftId('new');
          }}
          onEditDraft={(draftId) => {
            setSelectedDraftId(draftId);
          }}
          onDeleteDraft={async (draftId) => {
            await deleteLearnContent(draftId);
            setDrafts(drafts.filter((d: any) => d.id !== draftId));
          }}
        />
      ) : (
        <CreateLearnContentForm 
          key={sessionKey}
          onSuccess={() => {
            setIsFlipped(false);
            setTimeout(() => {
              setCreateContentType('');
              setSelectedDraftId(null);
              setSessionKey(k => k + 1);
            }, 600);
          }} 
          onCancel={() => {
            setCreateContentType('');
            setSelectedDraftId(null);
          }} 
          postingAs={postingAs}
          selectedOrgId={selectedOrgId}
          onTypeChange={(t) => setCreateContentType(t)}
          draftId={selectedDraftId}
          initialTaxonomy={draftTaxonomy}
          initialType={createContentType}
          initialDraftData={drafts.find((d: any) => d.id === selectedDraftId)}
        />
      )}
    </Paper>
  );

  return (
    <ThemeProvider theme={learnTheme}>
      <FlipContainer 
        isFlipped={isFlipped}
        frontContent={frontContent}
        backContent={backContent}
      />
    </ThemeProvider>
  );
}
