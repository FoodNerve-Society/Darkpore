// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Paper,
  Divider,
  Button,
  TextField,
  IconButton,
  Skeleton,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  ChatBubbleOutlined as ChatIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOffAlt as ThumbUpOffAltIcon,
  Send as SendIcon,
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



// ═══════════════════════════════════════════════════════════
// MOCK ARTICLE BODY PARAGRAPHS (food/agriculture themed)
// ═══════════════════════════════════════════════════════════

const MOCK_ARTICLE_SECTIONS = [
  {
    heading: "The Challenge of Land Acquisition in Nigeria",
    body: `Securing large tracts of arable land in Nigeria remains one of the most complex undertakings for any agricultural enterprise. The Land Use Act of 1978, which vests all land in each state's governor, creates a labyrinthine bureaucracy that can stall even the most well-funded operations. Farmers seeking 100 hectares or more must navigate community consent, customary rights, government allocation processes, and certificate-of-occupancy requirements simultaneously.

The real challenge isn't capital — it's trust. Communities that have farmed ancestral land for generations are understandably cautious about external actors. The successful approach requires what we call "community-first engagement": showing up before you need something, contributing to local infrastructure, and ensuring the community sees tangible benefits before any soil is turned.`,
  },
  {
    heading: "Building the Legal Framework",
    body: `Every state in Nigeria has slightly different requirements for land acquisition. In the North Central zone, where the Sahel belt meets the Guinea savanna, the process typically involves three parallel tracks: (1) community engagement and traditional authority buy-in, (2) state government land allocation, and (3) survey and registration.

A critical lesson from our fieldwork across Kaduna and Benue states is that the Environmental Impact Assessment (EIA) should be initiated concurrently with the land application — not sequentially. This alone can save 6–8 weeks in the overall timeline. Additionally, engaging a local solicitor who has existing relationships with the state land registry is invaluable.`,
  },
  {
    heading: "The 30-Day Sprint: A Practical Timeline",
    body: `Week 1 focuses entirely on community engagement. This includes meeting with the village head, local government chairman, and ward councillors. Bring nothing but your presence and genuine interest. Share kola nuts. Listen to their challenges — water access, road conditions, school funding. Make no promises about land yet.

Week 2 shifts to formal application. With community support documented (via a signed community consent letter), you submit the formal application to the state Ministry of Lands. Simultaneously, commission a licensed surveyor to begin boundary demarcation. The survey plan is a prerequisite for the Certificate of Occupancy (C of O).

Weeks 3–4 are the acceleration phase. This is where your community relationships pay dividends. A community that supports your application can expedite processing through informal advocacy. Parallel-track your EIA report submission, and prepare the development plan that demonstrates how the land will be used for agricultural production.`,
  },
  {
    heading: "Post-Harvest Infrastructure: The Hidden Multiplier",
    body: `One insight that transforms land negotiation outcomes is this: commit to building cold-chain infrastructure that serves the surrounding community, not just your operation. A 50-tonne solar cold storage facility costs approximately ₦15–20 million but can reduce community post-harvest losses by 40%. 

When communities see that your operation includes shared infrastructure — cold storage, water boreholes, access roads — the entire dynamic shifts from extraction to partnership. This is the principle of "shared value creation" and it's the single most effective strategy for accelerating land deals in rural Nigeria.`,
  },
  {
    heading: "Conclusion: Speed Through Trust",
    body: `The 30-day timeline is ambitious but achievable when you prioritize relationship-building over paperwork. The legal process is mechanical; the human process is where deals succeed or fail. Invest 70% of your energy in the community engagement track and 30% in the formal application track.

Remember: the fastest land deal is the one where the community wants you there. Everything else — the C of O, the survey plan, the EIA — follows naturally from that foundation. Build trust first, then build farms.`,
  },
];

// ═══════════════════════════════════════════════════════════
// MOCK COMMENTS
// ═══════════════════════════════════════════════════════════

interface MockComment {
  id: string;
  author: string;
  avatarLetter: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

const MOCK_COMMENTS: MockComment[] = [
  {
    id: "c1",
    author: "Amina Yusuf",
    avatarLetter: "A",
    text: "This is incredibly practical. I secured 200 hectares in Kaduna using almost exactly this process. The community engagement phase is everything — took us 10 days, but it made the remaining 20 days seamless.",
    timestamp: "2 days ago",
    likes: 14,
    isLiked: false,
  },
  {
    id: "c2",
    author: "Chidi Okoro",
    avatarLetter: "C",
    text: "The shared cold-storage strategy is genius. We did this in Ogun State and the village council literally expedited our C of O because they wanted the cold room operational before yam harvest.",
    timestamp: "1 day ago",
    likes: 9,
    isLiked: true,
  },
  {
    id: "c3",
    author: "Ibrahim Sule",
    avatarLetter: "I",
    text: "As a student of AgriEng, this is the kind of real-world knowledge we never get in lectures. Any chance Food Nerve can do a video walkthrough of this process?",
    timestamp: "5 hours ago",
    likes: 6,
    isLiked: false,
  },
  {
    id: "c4",
    author: "Dr. Ngozi Eze",
    avatarLetter: "N",
    text: "I'd add one caveat: in the Sahel region, soil testing should happen during Week 1 alongside community engagement. No point securing land with severely depleted laterite soils unless you've budgeted for 2–3 seasons of rehabilitation.",
    timestamp: "3 hours ago",
    likes: 21,
    isLiked: false,
  },
];

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
// COMMENT COMPONENT
// ═══════════════════════════════════════════════════════════

function CommentItem({ comment }: { comment: MockComment }) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <Box
      sx={{ display: "flex", gap: 1.5, mb: 2.5 }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          fontSize: "0.8rem",
          fontWeight: 700,
          bgcolor: "rgba(255, 255, 255, 0.03)",
          color: ACCENT_DARK,
          flexShrink: 0,
        }}
      >
        {comment.avatarLetter}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, fontSize: "0.85rem" }}
          >
            {comment.author}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", fontSize: "0.72rem" }}
          >
            {comment.timestamp}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.85rem",
            lineHeight: 1.6,
            mb: 0.75,
          }}
        >
          {comment.text}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton size="small" onClick={handleLike} sx={{ p: 0.4 }}>
            {liked ? (
              <ThumbUpIcon sx={{ fontSize: 15, color: ACCENT }} />
            ) : (
              <ThumbUpOffAltIcon
                sx={{ fontSize: 15, color: "text.disabled" }}
              />
            )}
          </IconButton>
          <Typography
            variant="caption"
            sx={{
              color: liked ? ACCENT_DARK : "text.disabled",
              fontWeight: 600,
              fontSize: "0.72rem",
            }}
          >
            {likeCount}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════
// ARTICLE READER PAGE
// ═══════════════════════════════════════════════════════════

export default function ArticleReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useSociety();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<LearnContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [hearted, setHearted] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const allContent = await getLearnContent();
      if (cancelled) return;
      // Match by id (slug is the id)
      const found = allContent.find(
        (c) =>
          (c.swimlane === "articles" || c.swimlane === "reports") &&
          c.id === slug
      );
      setArticle(found || null);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, md: 4 }, pt: { xs: 3, md: 5 } }}>
        <Skeleton variant="rounded" width={100} height={36} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={48} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={24} width="60%" sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={300} sx={{ mb: 3, borderRadius: 3 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (!article) {
    return (
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          p: { xs: 2, md: 4 },
          pt: { xs: 3, md: 5 },
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Article not found
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3 }}>
          This article may have been moved or removed.
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

  const publishDate = new Date(article.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 12,
        background:
          "linear-gradient(180deg, rgba(245,158,11,0.03) 0%, transparent 25%)",
      }}
    >
      {/* ═══════════════════════ BACK NAVIGATION ═══════════════════════ */}
      <Box
        sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 } }}
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

      {/* ═══════════════════════ ARTICLE HEADER ═══════════════════════ */}
      <Box
        sx={{ maxWidth: 800, mx: "auto", px: { xs: 2.5, md: 4 }, pt: 2 }}
      >
        {/* Tags */}
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
          {article.tags.map((tag) => (
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
          {article.isPaid && <NpBadge cost={article.nervePointsCost} />}
        </Box>

        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            lineHeight: 1.15,
            mb: 2,
            fontSize: { xs: "1.7rem", sm: "2.1rem", md: "2.4rem" },
            letterSpacing: "-0.02em",
          }}
        >
          {article.title}
        </Typography>

        {/* Description / Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: { xs: "1rem", sm: "1.1rem" },
            lineHeight: 1.65,
            mb: 3,
            maxWidth: 700,
          }}
        >
          {article.description}
        </Typography>

        {/* Author + Meta */}
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            gap: 2,
            p: 2.5,
            borderRadius: 3,
            bgcolor: "rgba(0,0,0,)",
            border: (t) =>
              `1px solid ${
                t.palette.mode === "dark"
                  ? alpha("#fff", 0.08)
                  : alpha("#000", 0.06)
              }`,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                fontSize: "1rem",
                fontWeight: 700,
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: ACCENT_DARK,
              }}
            >
              {article.author.name.charAt(0)}
            </Avatar>
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  {article.author.name}
                </Typography>
                {article.author.isVerified && (
                  <VerifiedIcon sx={{ fontSize: 15, color: ACCENT }} />
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mt: 0.3,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.4,
                    color: "text.disabled",
                    fontSize: "0.75rem",
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 13 }} />
                  {publishDate}
                </Typography>
                {article.readTime && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.4,
                      color: "text.disabled",
                      fontSize: "0.75rem",
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 13 }} />
                    {article.readTime}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={() => setHearted((h) => !h)}
              sx={{
                color: hearted ? "#ef4444" : "text.disabled",
                transition: "color 0.2s, transform 0.2s",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              {hearted ? (
                <FavoriteIcon sx={{ fontSize: 20 }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
            <IconButton
              onClick={() => setBookmarked((b) => !b)}
              sx={{
                color: bookmarked ? ACCENT : "text.disabled",
                transition: "color 0.2s, transform 0.2s",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              {bookmarked ? (
                <BookmarkIcon sx={{ fontSize: 20 }} />
              ) : (
                <BookmarkBorderIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
            <IconButton sx={{ color: "text.disabled" }}>
              <ShareIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Paper>

        {/* ═══════════════════════ HERO IMAGE ═══════════════════════ */}
        <Box
          sx={{
            position: "relative",
            height: { xs: 200, sm: 280, md: 360 },
            borderRadius: 4,
            overflow: "hidden",
            mb: 5,
            boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${article.thumbnailUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.3) 100%)",
            }}
          />
        </Box>

        {/* ═══════════════════════ ARTICLE BODY ═══════════════════════ */}
        {MOCK_ARTICLE_SECTIONS.map((section, idx) => (
          <Box
            key={idx}
            sx={{ mb: 4 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                mb: 1.5,
                fontSize: { xs: "1.2rem", sm: "1.35rem" },
                lineHeight: 1.3,
              }}
            >
              {section.heading}
            </Typography>
            {section.body.split("\n\n").map((para, pi) => (
              <Typography
                key={pi}
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: { xs: "0.95rem", sm: "1.02rem" },
                  lineHeight: 1.85,
                  mb: 2,
                }}
              >
                {para}
              </Typography>
            ))}
          </Box>
        ))}

        {/* ═══════════════════════ DISCUSSION SECTION ═══════════════════════ */}
        <Divider sx={{ my: 5 }} />

        <Box
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <ChatIcon sx={{ fontSize: 22, color: ACCENT_DARK }} />
            <Typography variant="h5" sx={{ fontWeight: 800, fontSize: "1.25rem" }}>
              Community Discussion
            </Typography>
            <Chip
              label={MOCK_COMMENTS.length}
              size="small"
              sx={{
                height: 22,
                fontWeight: 700,
                fontSize: "0.7rem",
                bgcolor: "rgba(255, 255, 255, 0.03)",
                color: ACCENT_DARK,
              }}
            />
          </Box>

          {/* Comment Input */}
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              gap: 1.5,
              p: 2,
              mb: 3,
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
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: "0.8rem",
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
              multiline
              maxRows={4}
              size="small"
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.88rem",
                  bgcolor: "transparent",
                },
              }}
            />
            <IconButton
              disabled={!commentText.trim()}
              sx={{
                alignSelf: "flex-end",
                color: commentText.trim() ? ACCENT : "text.disabled",
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Paper>

          {/* Comments List */}
          <Box>
            {MOCK_COMMENTS.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
