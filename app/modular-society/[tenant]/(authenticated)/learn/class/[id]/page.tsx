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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PlayCircle as PlayCircleIcon,
  PlayArrow as PlayArrowIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Verified as VerifiedIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";

import { useParams, useRouter } from "next/navigation";
import {
  getLearnContent,
  type LearnContent,
} from "@/lib/db/society";
import { useSociety, checkGatekeeper } from "@/context/SocietyContext";

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const ACCENT = "#f59e0b";
const ACCENT_DARK = "#d97706";
const ACCENT_LIGHT = "#fbbf24";




// ═══════════════════════════════════════════════════════════
// MOCK MODULE DATA
// ═══════════════════════════════════════════════════════════

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

function generateModules(classItem: LearnContent): Module[] {
  const moduleTitles: Record<string, Module[]> = {
    "lrn-4": [
      {
        id: "m1",
        title: "Module 1: Understanding Soil Health",
        lessons: [
          { id: "l1", title: "Introduction to Soil Microbiomes", duration: "12 min", isCompleted: true, isLocked: false },
          { id: "l2", title: "Testing Your Soil: A Field Guide", duration: "18 min", isCompleted: true, isLocked: false },
          { id: "l3", title: "Reading Soil Test Results", duration: "15 min", isCompleted: true, isLocked: false },
          { id: "l4", title: "Nutrient Deficiency Identification", duration: "20 min", isCompleted: false, isLocked: false },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Regeneration Techniques",
        lessons: [
          { id: "l5", title: "Cover Crops for Nigerian Climates", duration: "22 min", isCompleted: false, isLocked: false },
          { id: "l6", title: "Biochar Production from Crop Residue", duration: "25 min", isCompleted: false, isLocked: false },
          { id: "l7", title: "Composting at Scale", duration: "18 min", isCompleted: false, isLocked: false },
          { id: "l8", title: "Indigenous Microbial Solutions", duration: "30 min", isCompleted: false, isLocked: true },
        ],
      },
      {
        id: "m3",
        title: "Module 3: Field Assignments",
        lessons: [
          { id: "l9", title: "Soil Sample Collection Protocol", duration: "10 min", isCompleted: false, isLocked: true },
          { id: "l10", title: "Before-After Photo Documentation", duration: "8 min", isCompleted: false, isLocked: true },
          { id: "l11", title: "Community Soil Report Template", duration: "15 min", isCompleted: false, isLocked: true },
          { id: "l12", title: "Final Assessment & Certification", duration: "45 min", isCompleted: false, isLocked: true },
        ],
      },
    ],
    default: [
      {
        id: "m1",
        title: "Module 1: Foundations",
        lessons: [
          { id: "l1", title: "Course Introduction & Overview", duration: "8 min", isCompleted: true, isLocked: false },
          { id: "l2", title: "Core Concepts & Terminology", duration: "15 min", isCompleted: true, isLocked: false },
          { id: "l3", title: "The Nigerian Context", duration: "18 min", isCompleted: false, isLocked: false },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Deep Dive",
        lessons: [
          { id: "l4", title: "Case Study: Kaduna Success Story", duration: "22 min", isCompleted: false, isLocked: false },
          { id: "l5", title: "Hands-On Workshop", duration: "30 min", isCompleted: false, isLocked: false },
          { id: "l6", title: "Expert Panel Discussion", duration: "45 min", isCompleted: false, isLocked: true },
        ],
      },
      {
        id: "m3",
        title: "Module 3: Certification",
        lessons: [
          { id: "l7", title: "Final Project Brief", duration: "10 min", isCompleted: false, isLocked: true },
          { id: "l8", title: "Peer Review Process", duration: "20 min", isCompleted: false, isLocked: true },
          { id: "l9", title: "Assessment & Certificate", duration: "35 min", isCompleted: false, isLocked: true },
        ],
      },
    ],
  };

  return moduleTitles[classItem.id] || moduleTitles.default;
}

// ═══════════════════════════════════════════════════════════
// NP PAYWALL MODAL
// ═══════════════════════════════════════════════════════════

function NpPaywallModal({
  open,
  onClose,
  classItem,
  userNP,
}: {
  open: boolean;
  onClose: () => void;
  classItem: LearnContent;
  userNP: number;
}) {
  const canAfford = userNP >= classItem.nervePointsCost;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: "rgba(0,0,0,)",
          border: (t) =>
            `1px solid ${
              t.palette.mode === "dark"
                ? alpha("#fff", 0.1)
                : alpha("#000", 0.06)
            }`,
          overflow: "hidden",
        },
      }}
    >
      {/* Gradient top bar */}
      <Box
        sx={{
          height: 6,
          background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_LIGHT} 50%, ${ACCENT_DARK} 100%)`,
        }}
      />

      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 16px ${alpha(ACCENT, 0.35)}`,
            }}
          >
            <LockIcon sx={{ color: "#ffffff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2 }}>
              Premium Content
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              Unlock with Nerve Points
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Class preview */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: "rgba(0,0,0,)",
            border: `1px solid ${alpha(ACCENT, 0.12)}`,
            mb: 3,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.3 }}>
            {classItem.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {classItem.description}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5 }}>
            <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.75rem" }}>
              by {classItem.author.name}
            </Typography>
            {classItem.duration && (
              <Chip
                label={classItem.duration}
                size="small"
                sx={{
                  height: 20,
                  fontWeight: 600,
                  fontSize: "0.65rem",
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  color: ACCENT_DARK,
                }}
              />
            )}
            {classItem.lessonsCount && (
              <Chip
                label={`${classItem.lessonsCount} lessons`}
                size="small"
                sx={{
                  height: 20,
                  fontWeight: 600,
                  fontSize: "0.65rem",
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  color: ACCENT_DARK,
                }}
              />
            )}
          </Box>
        </Paper>

        {/* Wallet balance */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderRadius: 2.5,
            bgcolor: "rgba(0,0,0,)",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WalletIcon sx={{ color: "text.disabled", fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
              Your Balance
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: canAfford ? "#10b981" : "#ef4444",
              fontSize: "1.1rem",
            }}
          >
            {userNP.toLocaleString()} NP
          </Typography>
        </Box>

        {/* Cost breakdown */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderRadius: 2.5,
            bgcolor: "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${alpha(ACCENT, 0.15)}`,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: ACCENT_DARK }}>
            Course Cost
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 900, color: ACCENT_DARK, fontSize: "1.1rem" }}>
            {classItem.nervePointsCost.toLocaleString()} NP
          </Typography>
        </Box>

        {!canAfford && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1.5,
              color: "#ef4444",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            You need {(classItem.nervePointsCost - userNP).toLocaleString()} more NP to unlock this course.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.7)",
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Maybe Later
        </Button>
        <Button
          variant="contained"
          disabled={!canAfford}
          sx={{
            fontWeight: 800,
            textTransform: "none",
            px: 4,
            borderRadius: 2,
            background: canAfford
              ? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`
              : undefined,
            boxShadow: canAfford
              ? `0 4px 16px ${alpha(ACCENT, 0.35)}`
              : undefined,
            "&:hover": {
              background: canAfford
                ? `linear-gradient(135deg, ${ACCENT_DARK} 0%, #b45309 100%)`
                : undefined,
            },
          }}
        >
          {canAfford ? `Unlock for ${classItem.nervePointsCost} NP` : "Insufficient NP"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════
// CLASS EXECUTION HUB PAGE
// ═══════════════════════════════════════════════════════════

export default function ClassHubPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useSociety();
  const id = params?.id as string;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [classItem, setClassItem] = useState<LearnContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallDismissed, setPaywallDismissed] = useState(false);

  const modules = classItem ? generateModules(classItem) : [];
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.isCompleted).length,
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const allContent = await getLearnContent();
      if (cancelled) return;
      const found = allContent.find(
        (c) => c.swimlane === "classes" && c.id === id
      );
      setClassItem(found || null);
      setLoading(false);

      // Auto-select first incomplete lesson
      if (found) {
        const mods = generateModules(found);
        for (const mod of mods) {
          for (const lesson of mod.lessons) {
            if (!lesson.isCompleted && !lesson.isLocked) {
              setActiveLesson(lesson.id);
              return;
            }
          }
        }
        // All complete? Select first
        if (mods[0]?.lessons[0]) {
          setActiveLesson(mods[0].lessons[0].id);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Check NP paywall
  useEffect(() => {
    if (classItem?.isPaid && !paywallDismissed && profile) {
      const gate = checkGatekeeper(profile, 1);
      if (gate.allowed) {
        // Show paywall modal for paid content
        setShowPaywall(true);
      }
    }
  }, [classItem, profile, paywallDismissed]);

  const userNP = profile
    ? profile.wallet.spendableNP + profile.wallet.promoNP
    : 0;

  const currentLesson = modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === activeLesson);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Skeleton variant="rounded" width={100} height={36} sx={{ mb: 3, borderRadius: 2 }} />
        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
          <Skeleton variant="rounded" sx={{ flex: 2, height: { xs: 220, md: 400 }, borderRadius: 3 }} />
          <Skeleton variant="rounded" sx={{ flex: 1, height: 500, borderRadius: 3 }} />
        </Box>
      </Box>
    );
  }

  if (!classItem) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, textAlign: "center", pt: 8 }}>
        <SchoolIcon sx={{ fontSize: 56, color: alpha(ACCENT, 0.3), mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Class not found
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
        background:
          "linear-gradient(180deg, rgba(245,158,11,0.03) 0%, transparent 20%)",
      }}
    >
      {/* NP Paywall Modal */}
      {classItem.isPaid && (
        <NpPaywallModal
          open={showPaywall}
          onClose={() => {
            setShowPaywall(false);
            setPaywallDismissed(true);
          }}
          classItem={classItem}
          userNP={userNP}
        />
      )}

      {/* ═══════════════════════ BACK NAV ═══════════════════════ */}
      <Box
        sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}
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
      </Box>

      {/* ═══════════════════════ CLASS HEADER ═══════════════════════ */}
      <Box
        sx={{ px: { xs: 2, md: 3 }, pt: 1, pb: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.4rem", sm: "1.7rem", md: "1.9rem" },
              lineHeight: 1.15,
              flex: 1,
            }}
          >
            {classItem.title}
          </Typography>
          {classItem.isPaid && (
            <Chip
              icon={<LockIcon sx={{ fontSize: 13 }} />}
              label={`${classItem.nervePointsCost} NP`}
              size="small"
              onClick={() => setShowPaywall(true)}
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: ACCENT_DARK,
                border: `1px solid ${alpha(ACCENT, 0.25)}`,
                cursor: "pointer",
                "& .MuiChip-icon": { color: ACCENT_DARK },
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)" },
              }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: "0.65rem",
                fontWeight: 700,
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: ACCENT_DARK,
              }}
            >
              {classItem.author.name.charAt(0)}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "rgba(255, 255, 255, 0.7)", fontSize: "0.8rem" }}>
              {classItem.author.name}
            </Typography>
            {classItem.author.isVerified && (
              <VerifiedIcon sx={{ fontSize: 14, color: ACCENT }} />
            )}
          </Box>
          {classItem.duration && (
            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: 13 }} />}
              label={classItem.duration}
              size="small"
              sx={{
                height: 22,
                fontWeight: 600,
                fontSize: "0.7rem",
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: "rgba(255, 255, 255, 0.7)",
                "& .MuiChip-icon": { color: "text.disabled" },
              }}
            />
          )}
          {classItem.enrolledCount != null && (
            <Chip
              icon={<PeopleIcon sx={{ fontSize: 13 }} />}
              label={`${classItem.enrolledCount} enrolled`}
              size="small"
              sx={{
                height: 22,
                fontWeight: 600,
                fontSize: "0.7rem",
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: "rgba(255, 255, 255, 0.7)",
                "& .MuiChip-icon": { color: "text.disabled" },
              }}
            />
          )}
        </Box>

        {/* Progress bar */}
        <Box sx={{ mt: 2, maxWidth: 500 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.disabled", fontSize: "0.72rem" }}>
              {completedLessons}/{totalLessons} lessons completed
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: ACCENT_DARK, fontSize: "0.72rem" }}>
              {progressPercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(255, 255, 255, 0.03)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_LIGHT} 100%)`,
              },
            }}
          />
        </Box>
      </Box>

      {/* ═══════════════════════ MAIN LAYOUT ═══════════════════════ */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          px: { xs: 2, md: 3 },
          pt: 1,
        }}
      >
        {/* ─── VIDEO PLAYER AREA ─── */}
        <Box
          sx={{ flex: 2, minWidth: 0 }}
        >
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              height: { xs: 220, sm: 300, md: 420 },
              borderRadius: 4,
              overflow: "hidden",
              bgcolor: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: `1px solid ${alpha("#fff", 0.06)}`,
              "&:hover .play-btn": {
                transform: "scale(1.12)",
                boxShadow: `0 0 40px ${alpha(ACCENT, 0.5)}`,
              },
            }}
          >
            {/* Background thumbnail with dark overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${classItem.thumbnailUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "brightness(0.25) blur(4px)",
              }}
            />

            {/* Play button */}
            <Box
              className="play-btn"
              sx={{
                position: "relative",
                zIndex: 2,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 30px ${alpha(ACCENT, 0.4)}`,
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 42, color: "#ffffff", ml: 0.4 }} />
            </Box>

            {/* Current lesson label */}
            {currentLesson && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                  zIndex: 2,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha("#fff", 0.5),
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Now Playing
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "1rem",
                    lineHeight: 1.3,
                  }}
                >
                  {currentLesson.title}
                </Typography>
              </Box>
            )}

            {/* Duration badge */}
            {currentLesson && (
              <Chip
                label={currentLesson.duration}
                size="small"
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 2,
                  height: 24,
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  color: "#ffffff",
                }}
              />
            )}
          </Paper>

          {/* Resources download area */}
          <Paper
            elevation={0}
            sx={{
              mt: 2.5,
              p: 2.5,
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
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, fontSize: "0.9rem" }}>
              📎 Lesson Resources
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {["Worksheet.pdf", "Field Guide.pdf", "Soil Chart.png"].map(
                (file) => (
                  <Chip
                    key={file}
                    icon={<DownloadIcon sx={{ fontSize: 14 }} />}
                    label={file}
                    size="small"
                    clickable
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      color: "rgba(255, 255, 255, 0.7)",
                      border: `1px solid ${alpha(ACCENT, 0.12)}`,
                      "& .MuiChip-icon": { color: ACCENT_DARK },
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.03)",
                      },
                    }}
                  />
                )
              )}
            </Box>
          </Paper>
        </Box>

        {/* ─── MODULE SIDEBAR ─── */}
        <Box
          sx={{
            flex: 1,
            minWidth: { md: 320 },
            maxWidth: { md: 400 },
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
              maxHeight: { md: 600 },
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(255, 255, 255, 0.03)",
                borderRadius: 2,
              },
            }}
          >
            {/* Sidebar header */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: (t) =>
                  `1px solid ${
                    t.palette.mode === "dark"
                      ? alpha("#fff", 0.06)
                      : alpha("#000", 0.06)
                  }`,
                position: "sticky",
                top: 0,
                bgcolor: "rgba(0,0,0,)",
                zIndex: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, fontSize: "1rem" }}
              >
                📚 Course Modules
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontSize: "0.72rem" }}
              >
                {totalLessons} lessons · {classItem.duration}
              </Typography>
            </Box>

            {/* Module list */}
            {modules.map((mod, modIdx) => (
              <Box key={mod.id}>
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    bgcolor: "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: ACCENT_DARK,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {mod.title}
                  </Typography>
                </Box>
                <List disablePadding>
                  {mod.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLesson;
                    return (
                      <ListItemButton
                        key={lesson.id}
                        selected={isActive}
                        disabled={lesson.isLocked}
                        onClick={() => !lesson.isLocked && setActiveLesson(lesson.id)}
                        sx={{
                          py: 1.2,
                          px: 2.5,
                          borderLeft: isActive
                            ? `3px solid ${ACCENT}`
                            : "3px solid transparent",
                          bgcolor: isActive
                            ? alpha(ACCENT, 0.06)
                            : "transparent",
                          "&:hover": {
                            bgcolor: isActive
                              ? alpha(ACCENT, 0.08)
                              : alpha("#000", 0.02),
                          },
                          "&.Mui-disabled": {
                            opacity: 0.5,
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {lesson.isCompleted ? (
                            <CheckCircleIcon
                              sx={{ fontSize: 18, color: "#10b981" }}
                            />
                          ) : lesson.isLocked ? (
                            <LockIcon
                              sx={{ fontSize: 16, color: "text.disabled" }}
                            />
                          ) : isActive ? (
                            <PlayCircleIcon
                              sx={{ fontSize: 18, color: ACCENT }}
                            />
                          ) : (
                            <UncheckedIcon
                              sx={{ fontSize: 18, color: "text.disabled" }}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={lesson.title}
                          secondary={lesson.duration}
                          slotProps={{
                            primary: {
                              sx: {
                                fontWeight: isActive ? 700 : 600,
                                fontSize: "0.82rem",
                                lineHeight: 1.3,
                                color: isActive ? "text.primary" : "text.secondary",
                              },
                            },
                            secondary: {
                              sx: {
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                color: "text.disabled",
                              },
                            },
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
                {modIdx < modules.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
