import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Paper, Chip, IconButton, alpha, Tooltip } from '@mui/material';
import {
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  LiveTv as LiveTvIcon,
  School as SchoolIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Close as CloseIcon,
  ArrowForwardIos as ArrowForwardIcon,
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForward as ArrowForwardArrow,
  Minimize as MinimizeIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

const ACCENT = "#f59e0b";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const START_FRESH_OPTIONS = [
  {
    type: 'article', title: "Intelligence Brief", desc: "Write an in-depth article or report.",
    icon: <ArticleIcon sx={{ fontSize: 32 }} />, color: "#3b82f6", grad: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
  },
  {
    type: 'video', title: "Video Insights", desc: "Share short-form video analysis.",
    icon: <VideoLibraryIcon sx={{ fontSize: 32 }} />, color: "#ef4444", grad: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)"
  },
  {
    type: 'livestream', title: "Schedule Livestream", desc: "Host a live session.",
    icon: <LiveTvIcon sx={{ fontSize: 32 }} />, color: "#10b981", grad: "linear-gradient(135deg, #065f46 0%, #10b981 100%)"
  },
  {
    type: 'class', title: "Masterclass", desc: "Create a multi-module learning experience.",
    icon: <SchoolIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6", grad: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)"
  }
];

export default function CreatorStudioDashboard({
  drafts = [],
  onStartFresh,
  onEditDraft,
  onDeleteDraft,
  challengesData = [],
  userName
}: {
  drafts: any[];
  onStartFresh: (type: string, taxonomy: any) => void;
  onEditDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  challengesData: any[];
  userName?: string;
}) {
  const [expandedStartType, setExpandedStartType] = useState<string | null>(null);

  // Accordion State
  const [activeAccordionIdx, setActiveAccordionIdx] = useState(0);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  const accordionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeOption = START_FRESH_OPTIONS.find(o => o.type === expandedStartType);

  // Auto-cycle accordion when not locked
  useEffect(() => {
    if (!expandedStartType || categoryLocked) return;
    accordionTimerRef.current = setInterval(() => {
      setActiveAccordionIdx(prev => (prev + 1) % challengesData.length);
    }, 3000);
    return () => {
      if (accordionTimerRef.current) clearInterval(accordionTimerRef.current);
    };
  }, [expandedStartType, categoryLocked, challengesData.length]);

  const handleOpenCreator = (type: string) => {
    setExpandedStartType(type);
    setActiveAccordionIdx(0);
    setCategoryLocked(false);
    setShowSubcategories(false);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleClose = () => {
    setExpandedStartType(null);
    setCategoryLocked(false);
    setShowSubcategories(false);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleCategorySelect = useCallback((idx: number, catId: string) => {
    setActiveAccordionIdx(idx);
    setSelectedCategory(catId);
    setCategoryLocked(true);
    setSelectedSubcategory('');
    if (accordionTimerRef.current) clearInterval(accordionTimerRef.current);
    setTimeout(() => setShowSubcategories(true), 50);
  }, []);

  const handleResetCategory = useCallback(() => {
    setCategoryLocked(false);
    setShowSubcategories(false);
    setSelectedSubcategory('');
    setSelectedCategory('');
  }, []);

  const finalizeTaxonomy = (timeframe: string) => {
    onStartFresh(expandedStartType as string, {
      category: selectedCategory,
      subcategory: selectedSubcategory,
      timeframe: timeframe
    });
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Morning' : currentHour < 18 ? 'Afternoon' : 'Evening';

  return (
    <Box sx={{
      p: { xs: 2, sm: 4, md: 6, lg: 8 }, mx: 'auto', width: '100%', flex: 1, overflowY: 'auto',
      background: 'radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 40%)',
    }}>
      {/* Greeting */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h3" sx={{ fontFamily: 'Caveat, cursive', color: ACCENT, mb: 1 }}>
          Good {greeting}, {userName || 'Creative'}.
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 1.5, color: '#1e293b' }}>
          Welcome to the Studio
        </Typography>
        <Chip
          label={`${drafts.length} active draft${drafts.length !== 1 ? 's' : ''} in your workspace`}
          size="small"
          sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: 'text.secondary', fontWeight: 600, borderRadius: '8px' }}
        />
      </Box>

      {/* ================================================================ */}
      {/* START FRESH SECTION                                              */}
      {/* ================================================================ */}

      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
        Start Fresh
      </Typography>

      <Box sx={{
        display: 'flex', 
        gap: expandedStartType ? 0 : 3, 
        overflowX: expandedStartType ? 'visible' : 'auto', 
        pt: 1, pb: expandedStartType ? 0 : 5, mb: 2,
        '&::-webkit-scrollbar': { height: 0 }, 
        px: expandedStartType ? 0 : 0.5, 
        mx: expandedStartType ? 0 : -0.5,
        transition: 'gap 0.4s ease, padding 0.4s ease, margin 0.4s ease'
      }}>
        {START_FRESH_OPTIONS.map((opt) => {
          const isExpanded = expandedStartType === opt.type;
          const isHidden = expandedStartType !== null && expandedStartType !== opt.type;

          return (
            <Paper
              key={opt.type}
              onClick={() => {
                if (!expandedStartType) handleOpenCreator(opt.type);
              }}
              elevation={0}
              sx={{
                flex: isHidden ? '0 0 0%' : (isExpanded ? '0 0 100%' : '0 0 auto'),
                minWidth: isHidden ? 0 : (isExpanded ? '100%' : 280),
                maxWidth: isHidden ? 0 : (isExpanded ? '100%' : 280),
                height: isExpanded ? 'auto' : (isHidden ? 0 : 320),
                opacity: isHidden ? 0 : 1,
                p: isExpanded ? 0 : (isHidden ? 0 : 3.5),
                display: 'flex', flexDirection: 'column', gap: 2,
                borderRadius: '28px', cursor: isExpanded ? 'default' : 'pointer',
                background: isExpanded ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` : opt.grad,
                border: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isHidden ? 'none' : `inset 0 2px 10px rgba(255,255,255,0.2), 0 10px 30px ${alpha(opt.color, 0.25)}`,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': !isExpanded ? {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `inset 0 2px 10px rgba(255,255,255,0.3), 0 24px 48px ${alpha(opt.color, 0.4)}`,
                  borderColor: 'rgba(255,255,255,0.3)',
                  '& .sf-icon': { transform: 'scale(1.1) rotate(-5deg)', bgcolor: 'rgba(255,255,255,0.3)' }
                } : {}
              }}
            >
              {!isExpanded ? (
                <>
                  <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.12, transform: 'scale(4)', pointerEvents: 'none', color: '#fff' }}>
                    {opt.icon}
                  </Box>
                  <Box className="sf-icon" sx={{
                    p: 1.5, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#fff', width: 'fit-content',
                    backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)',
                    transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}>
                    {opt.icon}
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1, mt: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', mb: 0.5, color: '#fff', letterSpacing: '-0.02em' }}>
                      {opt.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, fontWeight: 500 }}>
                      {opt.desc}
                    </Typography>
                  </Box>
                </>
              ) : (
                /* ============================================================== */
                /* CREATOR WIZARD (Cinematic Accordion INSIDE the card)           */
                /* ============================================================== */
                <Box sx={{ p: 4, width: '100%', height: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  
                  {/* Container Header & Minimize Button */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                        {opt.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                          {opt.title} Setup
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', mt: 0.5 }}>
                          Where does this belong?
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Minimize">
                      <IconButton onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(0,0,0,0.3)', color: '#fff' } }}>
                        <MinimizeIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Accordion Container */}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    width: '100%',
                    minHeight: { xs: 400, md: 450 },
                    height: categoryLocked ? 'auto' : { xs: 400, md: 450 }, 
                    borderRadius: '24px', 
                    overflow: 'hidden',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    position: 'relative',
                    bgcolor: 'transparent' // Inherit the dark slate from the expanded card
                  }}>
                    {challengesData.map((chal: any, idx: number) => {
                      const isActive = activeAccordionIdx === idx;
                      const isLocked = categoryLocked && isActive;
                      const isHidden = categoryLocked && !isActive;
                      return (
                        <Box
                          key={chal.id}
                          onClick={() => {
                            if (!categoryLocked) {
                              handleCategorySelect(idx, chal.id);
                            } else if (isLocked && !selectedSubcategory) {
                              handleResetCategory();
                            }
                          }}
                          sx={{
                            display: 'flex', flexDirection: 'column',
                            position: 'relative',
                            flex: isHidden ? '0 0 0%' : isActive ? (categoryLocked ? '0 0 100%' : '0 0 45%') : '1 1 0%',
                            minWidth: isHidden ? 0 : (isActive ? undefined : 0),
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            opacity: isHidden ? 0 : 1,
                            '&:not(:last-child)': {
                              borderRight: { xs: 'none', md: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)' },
                              borderBottom: { xs: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)', md: 'none' },
                            },
                            '&:hover': !categoryLocked ? {
                              flex: '0 0 50%',
                            } : {},
                          }}
                        >
                          {/* Background Image */}
                          <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: `url(${chal.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.6s ease',
                            transform: isActive ? 'scale(1.05)' : 'scale(1.15)',
                          }} />

                          {/* Dark Overlay */}
                          <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: isActive
                              ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)'
                              : 'rgba(0,0,0,0.55)',
                            transition: 'background 0.4s',
                          }} />

                          {/* Category Label / Breadcrumb */}
                          <Box sx={{
                            position: 'absolute',
                            bottom: categoryLocked && isLocked ? 'auto' : 20,
                            top: categoryLocked && isLocked ? 20 : 'auto',
                            left: 20, right: 20,
                            zIndex: 5,
                            transition: 'all 0.4s',
                          }}>
                            {categoryLocked && isLocked ? (
                              <Box 
                                sx={{ 
                                  display: 'inline-flex', alignItems: 'center', p: 1, ml: -1, borderRadius: 3, 
                                  bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)',
                                  maxWidth: '100%', overflowX: 'auto', whiteSpace: 'nowrap',
                                  '&::-webkit-scrollbar': { display: 'none' }
                                }}
                              >
                                <Box 
                                  onClick={(e) => { e.stopPropagation(); handleResetCategory(); }}
                                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 }, transition: 'opacity 0.2s' }}
                                >
                                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    Categories
                                  </Typography>
                                </Box>

                                <Typography sx={{ color: 'rgba(255,255,255,0.3)', mx: 1, fontSize: '0.8rem' }}>/</Typography>
                                <Typography 
                                  onClick={(e) => { e.stopPropagation(); setSelectedSubcategory(''); }}
                                  sx={{ color: selectedSubcategory ? 'rgba(255,255,255,0.7)' : '#fff', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: selectedSubcategory ? 'pointer' : 'default', '&:hover': selectedSubcategory ? { opacity: 0.7 } : {}, transition: 'opacity 0.2s' }}
                                >
                                  {chal.title}
                                </Typography>

                                {selectedSubcategory && (
                                  <>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', mx: 1, fontSize: '0.8rem' }}>/</Typography>
                                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                      {chal.subcategories?.find((s: any) => s.id === selectedSubcategory)?.title || 'Subcategory'}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            ) : (
                              <Box>
                                <Typography sx={{
                                  color: '#fff',
                                  fontWeight: 900,
                                  fontSize: isActive ? '1.4rem' : '1rem',
                                  letterSpacing: '-0.01em',
                                  lineHeight: 1.2,
                                  transition: 'font-size 0.4s',
                                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                  whiteSpace: isActive ? 'normal' : 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {chal.title}
                                </Typography>
                                {isActive && !categoryLocked && (
                                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', mt: 0.5, fontWeight: 600 }}>
                                    Tap to select
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>

                          {/* ┌── GLASSMORPHIC REVEAL (inside the locked card) ──┐ */}
                          {isLocked && showSubcategories && (
                            <Box 
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                position: 'relative',
                                mt: { xs: 8, md: 9 }, // push down past the "Categories / Subcategory" header
                                flex: 'none',
                                background: 'rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(32px)',
                                WebkitBackdropFilter: 'blur(32px)',
                                zIndex: 10,
                                animation: `${slideUpFade} 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
                                overflow: 'hidden',
                                borderBottomLeftRadius: '24px',
                                borderBottomRightRadius: '24px',
                                borderTopLeftRadius: { xs: 0, md: '24px' },
                                borderTopRightRadius: { xs: 0, md: '24px' },
                                mx: { xs: 0, md: 2 },
                                mb: { xs: 0, md: 2 },
                                boxShadow: '0 -4px 24px rgba(0,0,0,0.2)'
                              }}>
                              {/* Sliding Track - Now 200% wide for 2 views */}
                              <Box sx={{
                                display: 'flex',
                                width: '200%',
                                height: 'auto',
                                transform: selectedSubcategory ? 'translateX(-50%)' : 'translateX(0)',
                                transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              }}>
                                {/* VIEW 1: SUBCATEGORIES */}
                                <Box sx={{ width: '50%', height: 'auto', p: 4, pb: 4 }}>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
                                    Select Subcategory
                                  </Typography>
                                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, pb: 2 }}>
                                    {chal.subcategories?.map((sub: any) => {
                                      const isSubActive = selectedSubcategory === sub.id;
                                      return (
                                        <Box
                                          key={sub.id}
                                          onClick={(e) => { e.stopPropagation(); setSelectedSubcategory(sub.id); }}
                                          sx={{
                                            display: 'flex', alignItems: 'center', gap: 2,
                                            p: 2, borderRadius: '16px',
                                            cursor: 'pointer', transition: 'all 0.3s',
                                            border: '1px solid',
                                            borderColor: isSubActive ? activeOption.color : 'rgba(255,255,255,0.15)',
                                            bgcolor: isSubActive ? alpha(activeOption.color, 0.25) : 'rgba(255,255,255,0.08)',
                                            boxShadow: isSubActive ? `0 4px 20px ${alpha(activeOption.color, 0.3)}` : 'none',
                                            backdropFilter: 'blur(8px)',
                                            '&:hover': { bgcolor: isSubActive ? alpha(activeOption.color, 0.35) : 'rgba(255,255,255,0.15)', transform: 'translateY(-2px)' }
                                          }}
                                        >
                                          <Box sx={{ 
                                            width: 48, height: 48, borderRadius: '12px', overflow: 'hidden', flexShrink: 0,
                                            backgroundImage: `url(${sub.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                          }} />
                                          <Box>
                                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', mb: 0.25 }}>{sub.title}</Typography>
                                            {sub.desc && (
                                              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {sub.desc}
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>

                                {/* VIEW 2: TIMELINE (ERA OF INTELLIGENCE) */}
                                <Box sx={{ width: '50%', height: 'auto', p: 4, pb: 4, display: 'flex', flexDirection: 'column' }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.01em' }}>
                                      What era of intelligence is this?
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', mt: 0.5 }}>
                                      Choose the strategic lens for your briefing to apply the correct editorial framework.
                                    </Typography>
                                  </Box>

                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', maxWidth: 500, mx: 'auto' }}>
                                    {[
                                      { key: 'past' as const, emoji: '🕰️', label: 'The Autopsy', desc: 'Break down something that no longer works.', color: '#ef4444' },
                                      { key: 'present' as const, emoji: '🔥', label: 'The Playbook', desc: 'Share strategies that are working right now.', color: '#10b981' },
                                      { key: 'future' as const, emoji: '🔮', label: 'The Thesis', desc: 'Predict what will work tomorrow.', color: '#3b82f6' },
                                    ].map(tf => {
                                      return (
                                        <Box
                                          key={tf.key}
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            finalizeTaxonomy(tf.key);
                                          }}
                                          sx={{
                                            display: 'flex', alignItems: 'center', p: 3, borderRadius: '20px',
                                            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            '&:hover': {
                                              background: `linear-gradient(135deg, ${alpha(tf.color, 0.2)} 0%, ${alpha(tf.color, 0.05)} 100%)`,
                                              borderColor: tf.color,
                                              boxShadow: `0 12px 40px ${alpha(tf.color, 0.25)}`,
                                              transform: 'translateX(8px)',
                                              '& .tf-arrow': { transform: 'translateX(4px)', color: tf.color }
                                            }
                                          }}
                                        >
                                          <Box sx={{ fontSize: 36, mr: 3 }}>{tf.emoji}</Box>
                                          <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.01em', mb: 0.25 }}>{tf.label}</Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500 }}>{tf.desc}</Typography>
                                          </Box>
                                          <ArrowForwardArrow className="tf-arrow" sx={{ color: 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* ================================================================ */}
      {/* DRAFTS SECTION                                                   */}
      {/* ================================================================ */}
      {!expandedStartType && (
        <Box sx={{ mt: 6 }}>
          <style>{`
            @keyframes pulseDot {
              0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
              70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
              100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
          `}</style>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
              Active Drafts
            </Typography>
            <Chip label={`${drafts.length} In Progress`} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '8px', px: 0.5 }} />
          </Box>

          {drafts.length === 0 ? (
            <Paper sx={{ p: 5, borderRadius: '24px', border: '2px dashed rgba(0,0,0,0.08)', bgcolor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>No active drafts found.</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {drafts.map((draft: any) => {
                const typeColor = draft.type === 'article' ? '#3b82f6' : draft.type === 'video' ? '#ef4444' : draft.type === 'livestream' ? '#10b981' : draft.type === 'class' ? '#8b5cf6' : '#64748b';

                return (
                  <Paper
                    key={draft.id}
                    onClick={() => onEditDraft(draft.id)}
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: '24px',
                      background: 'rgba(255,255,255,0.5)',
                      backdropFilter: 'blur(30px)',
                      border: '1px solid rgba(255,255,255,0.9)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.04), inset 0 2px 10px rgba(255,255,255,0.6)',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      position: 'relative', overflow: 'hidden', cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.7)',
                        borderColor: alpha(typeColor, 0.4),
                        boxShadow: `0 16px 48px rgba(0,0,0,0.06), inset 0 2px 10px rgba(255,255,255,1), 0 0 0 1px ${alpha(typeColor, 0.2)}`,
                        transform: 'translateY(-3px) scale(1.01)',
                        '& .delete-btn': { opacity: 1, transform: 'translateX(0)' },
                        '& .resume-btn': { bgcolor: '#0f172a', color: '#fff' },
                        '& .resume-arrow': { transform: 'translateX(4px)' }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: alpha(typeColor, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColor, flexShrink: 0 }}>
                        {draft.type === 'article' ? <ArticleIcon /> : draft.type === 'video' ? <VideoLibraryIcon /> : draft.type === 'livestream' ? <LiveTvIcon /> : <SchoolIcon />}
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: typeColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{draft.type}</Typography>
                          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.2)' }} />
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Updated {new Date(draft.updatedAt).toLocaleDateString()}</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                          {draft.title || 'Untitled Draft'}
                        </Typography>
                        {(draft.category || draft.timeframe) && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {draft.category && <Chip label={draft.category} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.04)' }} />}
                            {draft.timeframe && <Chip label={draft.timeframe} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.04)' }} />}
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-end', sm: 'auto' } }}>
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, mr: 2 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulseDot 2s infinite' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.05em' }}>IN PROGRESS</Typography>
                      </Box>
                      <Tooltip title="Delete Draft">
                        <IconButton
                          className="delete-btn"
                          onClick={(e) => { e.stopPropagation(); onDeleteDraft(draft.id); }}
                          sx={{
                            opacity: { xs: 1, sm: 0 }, transform: { xs: 'none', sm: 'translateX(10px)' },
                            transition: 'all 0.3s', color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)',
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' }
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Box className="resume-btn" sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        px: 2.5, py: 1.2, borderRadius: '12px',
                        bgcolor: 'rgba(0,0,0,0.03)', color: '#334155',
                        fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.3s'
                      }}>
                        Resume
                        <ArrowForwardIcon className="resume-arrow" sx={{ fontSize: 16, transition: 'transform 0.3s' }} />
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
