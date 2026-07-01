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
  Breadcrumbs,
  Link as MuiLink,
  useTheme,
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
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";

import { useParams, useRouter } from "next/navigation";
import {
  getLearnContent,
  type LearnContent,
} from "@/lib/db/society";
import { useSociety } from "@/context/SocietyContext";
import { ArticleBlockRenderer } from "@/components/learn/ArticleBlockRenderer";

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const ACCENT = "#f59e0b";
const ACCENT_DARK = "#d97706";



// Mock text removed, using real articleBlocks from DB.

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

export function ArticleReader({ slug, articleData, onBack }: { slug?: string; articleData?: LearnContent | null; onBack?: () => void }) {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useSociety();

  const [article, setArticle] = useState<LearnContent | null>(articleData || null);
  const [loading, setLoading] = useState(!articleData);
  const [bookmarked, setBookmarked] = useState(false);
  const [hearted, setHearted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (articleData) {
      setArticle(articleData);
      setLoading(false);
      return;
    }
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
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
  }, [slug, articleData]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('main-scroll-container');
      if (container) {
        setIsScrolled(container.scrollTop > 20);
      } else {
        setIsScrolled(window.scrollY > 20);
      }
    };

    const scrollContainer = document.getElementById('main-scroll-container') || window;
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    if (!article || !article.articleBlocks) return;
    
    // Setup intersection observer for blocks
    const blockObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveBlockId(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' }); // Trigger when block is in top half of screen

    article.articleBlocks.forEach((block: any, idx: number) => {
      const el = document.getElementById(`article-block-${block.id || idx}`);
      if (el) blockObserver.observe(el);
    });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      blockObserver.disconnect();
    };
  }, [article]);

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
          onClick={() => onBack ? onBack() : router.push("/learn")}
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

  const isBlockComplete = (b: any) => {
    const type = b.type || b.blockType;
    const c = b.content || {};
    switch (type) {
      case 'subheading': case 'title': case 'text': return !!c.text;
      case 'exec_summary': return !!c.point1 || !!c.point2 || !!c.point3;
      case 'myth_fact': 
        return (!!c.myth && !!c.fact) || (c.pairs && c.pairs.some((p: any) => p.myth || p.fact));
      case 'core_interactive': return !!c.bionicText || !!c.text;
      case 'pull_quote': case 'expert_quote': return !!c.quote || !!c.text;
      case 'media': case 'evidence_gallery':
        return !!c.mediaUrl || !!c.url || (c.items && c.items.some((i: any) => i.url || i.mediaUrl));
      case 'key_takeaways': case 'action_plan':
        return !!c.text || !!c.point1 || (c.items && c.items.some((i: any) => i.text));
      case 'highlight_card': return !!c.caption || !!c.label || !!c.imageUrl || !!c.text;
      case 'data_embed': return !!c.iframeUrl;
      case 'live_poll': case 'quick_poll': return !!c.question;
      default: return Object.values(c).some(v => !!v);
    }
  };

  const displayBlocks = article.articleBlocks?.filter((block: any) => isBlockComplete(block)) || [];

  // Determine accent color based on era tags
  const eraTag = article.tags?.find(t => ['past', 'present', 'future'].includes(t.toLowerCase()))?.toLowerCase();
  const accentColor = eraTag === 'past' ? '#ef4444' : eraTag === 'present' ? '#10b981' : eraTag === 'future' ? '#3b82f6' : ACCENT;

  return (
    <Box sx={{ pb: 12 }}>
      <Box sx={{ maxWidth: { xs: '100%', md: '90%', lg: '85%' }, mx: "auto", px: { xs: 2.5, md: 4, lg: 8 }, pt: { xs: 4, md: 8 }, position: 'relative' }}>
        <Box id="article-top-sentinel" sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, pointerEvents: 'none' }} />

        {/* ── Vertical Beaded Progress Bar (Custom Scrollbar) ── */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: { xs: 0, sm: -8, md: -24 },
          width: 24,
          pointerEvents: 'none',
          zIndex: 40,
        }}>
          <Box sx={{
            position: 'sticky',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            pointerEvents: 'auto',
            py: 2,
          }}>
          {displayBlocks.length > 0 && displayBlocks.map((block: any, idx: number) => {
            const isActive = activeBlockId === `article-block-${block.id || idx}`;
            return (
              <Box 
                key={block.id || idx} 
                onClick={() => {
                  document.getElementById(`article-block-${block.id || idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                sx={{
                  flex: 1,
                  width: isActive ? 6 : 4,
                  minHeight: 12,
                  borderRadius: '4px',
                  bgcolor: isActive ? accentColor : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'),
                  boxShadow: isActive ? `0 0 12px ${alpha(accentColor, 0.6)}` : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isActive ? accentColor : alpha(accentColor, 0.4),
                    width: 6,
                  }
                }} 
              />
            );
          })}
          </Box>
        </Box>

        {/* ═══════════════════════ ARTICLE BODY ═══════════════════════ */}
        {displayBlocks.length > 0 && displayBlocks.map((block: any, idx: number) => (
          <Box id={`article-block-${block.id || idx}`} key={block.id || idx} sx={{ mb: 5 }}>
            <ArticleBlockRenderer block={block} themeMode={theme.palette.mode} accentColor={accentColor} />
          </Box>
        ))}

      </Box>
    </Box>
  );
}
