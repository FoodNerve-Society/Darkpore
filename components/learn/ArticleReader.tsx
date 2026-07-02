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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
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
  Print as PrintIcon,
  ShortcutOutlined as ForwardIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";

import { useParams, useRouter } from "next/navigation";
import {
  getLearnContent,
  type LearnContent,
} from "@/lib/db/society";
import { useSociety } from "@/context/SocietyContext";
import { ArticleBlockRenderer } from "@/components/learn/ArticleBlockRenderer";
import { BlockInsightsDrawer } from "@/components/learn/BlockInsightsDrawer";

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
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeInsightBlockId, setActiveInsightBlockId] = useState<string | null>(null);
  const activeBlock = article?.articleBlocks?.find((b: any) => b.id === activeInsightBlockId) || null;
  const [isScrolled, setIsScrolled] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
      try {
        const allContent = await getLearnContent();
        if (cancelled) return;
        // Match by id (slug is the id)
        const found = allContent.find(
          (c) =>
            (c.swimlane === "articles" || c.swimlane === "reports") &&
            c.id === slug
        );
        setArticle(found || null);
      } catch (error) {
        console.error("Failed to load article:", error);
        setArticle(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
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
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, md: 4 },
          textAlign: "center",
        }}
      >
        <Box sx={{ 
          p: 4, 
          borderRadius: 4, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          backdropFilter: 'blur(10px)',
          maxWidth: 400
        }}>
          <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 900, color: alpha(ACCENT, 0.2), mb: 2 }}>
            404
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a' }}>
            Article Not Found
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b', mb: 4, lineHeight: 1.6 }}>
            The content you're looking for may have been removed, restricted to a higher Gatekeeper Rank, or simply doesn't exist.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => onBack ? onBack() : router.push("/learn")}
            sx={{ 
              fontWeight: 700, 
              bgcolor: ACCENT, 
              color: '#fff',
              py: 1.5,
              borderRadius: 3,
              '&:hover': { bgcolor: ACCENT_DARK }
            }}
          >
            Return to Learning Hub
          </Button>
        </Box>
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

  // Find the index of the currently active block
  const activeIndex = displayBlocks.findIndex((b: any, i: number) => activeBlockId === `article-block-${b.id || i}`);

  // Helper to estimate proportional height of a block
  const getBlockWeight = (block: any) => {
    if (!block || !block.type) return 1;
    switch (block.type) {
      case 'paragraph':
      case 'markdown':
      case 'heading':
        return Math.max(1, Math.min(10, (JSON.stringify(block.content || {}).length / 300)));
      case 'media': return 8;
      case 'fact_myth': return 5;
      case 'interactive_poll': return 4;
      case 'quote': return 3;
      default: return 2;
    }
  };

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
            gap: 0.4, // Reduced gap so more space can be given to beads
            pointerEvents: 'auto',
            py: 2,
            height: '70vh', // Slightly taller
            maxHeight: 650,
          }}>
          {displayBlocks.length > 0 && displayBlocks.map((block: any, idx: number) => {
            const isActive = activeBlockId === `article-block-${block.id || idx}`;
            const isPast = activeIndex !== -1 && idx < activeIndex;
            const weight = getBlockWeight(block);
            
            return (
              <Tooltip key={block.id || idx} title={String(block.blockType || 'Block').replace('_', ' ').toUpperCase()} placement="left" arrow>
                <Box 
                  onClick={() => {
                    document.getElementById(`article-block-${block.id || idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  sx={{
                    flex: weight, // Distribute proportional space
                    width: isActive ? 8 : 4,
                    minHeight: 4, // Crucial: lowered minHeight so flex can work its magic!
                    borderRadius: 10,
                    bgcolor: (isActive || isPast) ? accentColor : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'),
                    boxShadow: isActive ? `0 0 16px ${alpha(accentColor, 0.8)}` : 'none',
                    opacity: isActive ? 1 : (isPast ? 0.7 : 0.4),
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isActive ? accentColor : alpha(accentColor, 0.6),
                      width: 8,
                      opacity: 1
                    }
                  }} 
                />
              </Tooltip>
            );
          })}
          </Box>
        </Box>

        {/* ═══════════════════════ BREADCRUMB PANE (STICKY) ═══════════════════════ */}
        <Box sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          mb: 5, p: 1.5, px: { xs: 2.5, md: 4, lg: 8 }, 
          mx: { xs: -2.5, md: -4, lg: -8 },
          mt: { xs: -4, md: -8 },
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          borderTopLeftRadius: { md: '16px' },
          borderTopRightRadius: { md: '16px' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: 'Quicksand, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#475569' }}>
            <Box 
              component="span" 
              onClick={() => router.push('/learn?type=article')}
              sx={{ 
                cursor: 'pointer', 
                color: accentColor,
                bgcolor: alpha(accentColor, 0.1),
                px: 1.5, py: 0.5, borderRadius: '100px',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                fontWeight: 800,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: alpha(accentColor, 0.2), transform: 'translateY(-1px)' } 
              }} 
            >
              Article
            </Box>
            {article.category && (
              <>
                <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />
                <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: accentColor } }} onClick={() => router.push(`/learn?category=${encodeURIComponent(article.category)}`)}>
                  {article.category}
                </Box>
              </>
            )}
            {article.subcategory && (
              <>
                <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />
                <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: accentColor } }} onClick={() => router.push(`/learn?subcategory=${encodeURIComponent(article.subcategory)}`)}>
                  {article.subcategory}
                </Box>
              </>
            )}
            {article.timeframe && (
              <>
                <NavigateNextIcon sx={{ fontSize: 16, opacity: 0.4 }} />
                <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: accentColor } }} onClick={() => router.push(`/learn?timeframe=${encodeURIComponent(article.timeframe)}`)}>
                  {article.timeframe}
                </Box>
              </>
            )}
          </Box>
          
          <Tooltip title="Share Article">
            <IconButton onClick={() => setShareModalOpen(true)} size="small" sx={{ color: 'text.secondary', '&:hover': { color: accentColor, bgcolor: alpha(accentColor, 0.1) } }}>
              <ForwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ═══════════════════════ PREMIUM ARTICLE HEADER ═══════════════════════ */}
        <Box sx={{ mb: 6 }}>


          {/* Title - only show if there is no SpikyTitleBlock (subheading) at the top */}
          {!displayBlocks.some((b: any) => b.blockType === 'subheading') && article.title && (
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 4, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.1, color: theme.palette.mode === 'dark' ? '#fff' : '#0f172a' }}>
              {article.title}
            </Typography>
          )}

          {/* Render the first block if it's a subheading, so metadata appears below it */}
          {displayBlocks[0]?.blockType === 'subheading' && (
            <Box id={`article-block-${displayBlocks[0].id}`} sx={{ mb: 4 }}>
              <ArticleBlockRenderer 
                block={displayBlocks[0]} 
                themeMode={theme.palette.mode} 
                accentColor={accentColor} 
                onOpenInsights={(id) => setActiveInsightBlockId(id)}
                author={article.author}
              />
            </Box>
          )}

          {/* Metadata Area - Glassy Centered Container */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              width: { xs: '100%', sm: '80%', md: '70%' },
              p: 2.5,
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05)}`,
              gap: 1.5
            }}>
              
              {/* Primary Author */}
              {article.author && (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: '100%' }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={article.author.avatarUrl} sx={{ width: 32, height: 32, fontSize: '0.8rem' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', lineHeight: 1.2 }}>
                        {article.author.name}
                        {article.author.isVerified && <VerifiedIcon sx={{ fontSize: 14, color: accentColor, ml: 0.5 }} />}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8', fontWeight: 500, lineHeight: 1.2 }}>
                        {new Date(article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.65rem', color: accentColor, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {article.author.role || article.author.title || 'Author'}
                  </Typography>
                </Box>
              )}

              {/* Collaborators */}
              {article.collaborators && article.collaborators.length > 0 && article.collaborators.map((collab: any, i: number) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: '100%' }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={collab.avatarUrl} sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>{collab.name?.charAt(0)}</Avatar>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b' }}>
                      {collab.name}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.6rem', color: theme.palette.mode === 'dark' ? '#475569' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {collab.role || collab.title || 'Editor'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ═══════════════════════ ARTICLE BODY ═══════════════════════ */}
        {displayBlocks.length > 0 && displayBlocks.slice(displayBlocks[0]?.blockType === 'subheading' ? 1 : 0).map((block: any, idx: number) => (
          <Box id={`article-block-${block.id || idx}`} key={block.id || idx} sx={{ mb: 5 }}>
            <ArticleBlockRenderer 
              block={block} 
              themeMode={theme.palette.mode} 
              accentColor={accentColor} 
              onOpenInsights={(id) => setActiveInsightBlockId(id)}
              author={article.author}
            />
          </Box>
        ))}

      </Box>

      {/* ═══════════════════════ INSIGHTS DRAWER ═══════════════════════ */}
      <BlockInsightsDrawer 
        open={!!activeInsightBlockId} 
        onClose={() => setActiveInsightBlockId(null)} 
        blockId={activeInsightBlockId}
        activeBlock={activeBlock}
        accentColor={accentColor}
      />

      {/* Share Modal */}
      <Dialog 
        open={shareModalOpen} 
        onClose={() => setShareModalOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
            backgroundImage: 'none',
            borderRadius: '16px',
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 2, color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#0f172a' }}>
            Share this Insight
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            borderRadius: '12px', 
            bgcolor: theme.palette.mode === 'dark' ? alpha(accentColor, 0.1) : alpha(accentColor, 0.05),
            border: `1px solid ${alpha(accentColor, 0.2)}`,
            mb: 3
          }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 1, color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a', lineHeight: 1.3 }}>
              {article.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={article.author?.avatarUrl} sx={{ width: 20, height: 20 }} />
              <Typography sx={{ fontSize: '0.8rem', color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b' }}>
                By {article.author?.name || 'Society'}
              </Typography>
            </Box>
          </Box>

          <Button 
            fullWidth 
            variant="contained" 
            disableElevation
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setShareModalOpen(false);
              // In a real app, you'd show a snackbar here, but this is fine for now
            }}
            sx={{ 
              bgcolor: accentColor, 
              color: '#fff',
              py: 1.5,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: alpha(accentColor, 0.8) }
            }}
          >
            Copy Link
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
