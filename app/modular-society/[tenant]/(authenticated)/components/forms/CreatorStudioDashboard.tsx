import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, IconButton, alpha, Tooltip } from '@mui/material';
import {
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  LiveTv as LiveTvIcon,
  School as SchoolIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Close as CloseIcon,
  ArrowForwardIos as ArrowForwardIcon,
  ArrowBackIosNew as ArrowBackIcon
} from '@mui/icons-material';

const ACCENT = "#f59e0b";

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
  const [creationStep, setCreationStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const activeOption = START_FRESH_OPTIONS.find(o => o.type === expandedStartType);
  const activeCategory = challengesData.find((c: any) => c.id === selectedCategory);

  const handleOpenCreator = (type: string) => {
    setExpandedStartType(type);
    setCreationStep(0);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleClose = () => {
    setExpandedStartType(null);
    setCreationStep(0);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id);
    setCreationStep(1);
  };

  const handleSelectSubcategory = (id: string) => {
    setSelectedSubcategory(id);
    setCreationStep(2);
  };

  const handleBack = () => {
    if (creationStep === 2) {
      setSelectedSubcategory('');
      setCreationStep(1);
    } else if (creationStep === 1) {
      setSelectedCategory('');
      setCreationStep(0);
    } else {
      handleClose();
    }
  };

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

      {!expandedStartType ? (
        <>
          {/* Section header */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
            Start Fresh
          </Typography>

          {/* Cards row */}
          <Box sx={{
            display: 'flex', gap: 3, overflowX: 'auto', pt: 1, pb: 5, mb: 2,
            '&::-webkit-scrollbar': { height: 0 }, px: 0.5, mx: -0.5,
          }}>
            {START_FRESH_OPTIONS.map((opt) => (
              <Paper
                key={opt.type}
                onClick={() => handleOpenCreator(opt.type)}
                elevation={0}
                sx={{
                  flex: '0 0 260px', maxWidth: 300, p: 3.5,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  borderRadius: '28px', cursor: 'pointer',
                  background: opt.grad,
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: `inset 0 2px 10px rgba(255,255,255,0.2), 0 10px 30px ${alpha(opt.color, 0.25)}`,
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `inset 0 2px 10px rgba(255,255,255,0.3), 0 24px 48px ${alpha(opt.color, 0.4)}`,
                    borderColor: 'rgba(255,255,255,0.3)',
                    '& .sf-icon': { transform: 'scale(1.1) rotate(-5deg)', bgcolor: 'rgba(255,255,255,0.3)' }
                  }
                }}
              >
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
              </Paper>
            ))}
          </Box>
        </>
      ) : activeOption && (
        /* ============================================================== */
        /* CREATOR WIZARD (inline, light, centered)                       */
        /* ============================================================== */
        <Box sx={{ mb: 4 }}>

          {/* Wizard header — minimal bar */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, mb: 5,
          }}>
            <IconButton
              onClick={handleBack}
              size="small"
              sx={{ color: '#64748b', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* Breadcrumb trail */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={activeOption.title}
                size="small"
                onClick={creationStep > 0 ? () => { setCreationStep(0); setSelectedCategory(''); setSelectedSubcategory(''); } : undefined}
                sx={{
                  fontWeight: 700, fontSize: '0.8rem', borderRadius: '8px',
                  bgcolor: alpha(activeOption.color, 0.08), color: activeOption.color,
                  cursor: creationStep > 0 ? 'pointer' : 'default',
                }}
              />
              {selectedCategory && activeCategory && (
                <>
                  <ArrowForwardIcon sx={{ color: '#cbd5e1', fontSize: 12 }} />
                  <Chip
                    label={activeCategory.title}
                    size="small"
                    onClick={creationStep > 1 ? () => { setCreationStep(1); setSelectedSubcategory(''); } : undefined}
                    sx={{
                      fontWeight: 700, fontSize: '0.8rem', borderRadius: '8px',
                      bgcolor: 'rgba(0,0,0,0.04)', color: '#475569',
                      cursor: creationStep > 1 ? 'pointer' : 'default',
                    }}
                  />
                </>
              )}
              {selectedSubcategory && (
                <>
                  <ArrowForwardIcon sx={{ color: '#cbd5e1', fontSize: 12 }} />
                  <Chip
                    label={activeCategory?.subcategories?.find((s: any) => s.id === selectedSubcategory)?.title || ''}
                    size="small"
                    sx={{
                      fontWeight: 700, fontSize: '0.8rem', borderRadius: '8px',
                      bgcolor: 'rgba(0,0,0,0.04)', color: '#475569',
                    }}
                  />
                </>
              )}
            </Box>

            <Box sx={{ flex: 1 }} />
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ color: '#94a3b8', '&:hover': { color: '#475569', bgcolor: 'rgba(0,0,0,0.04)' } }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Step content — centered */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* ======== STEP 0: Categories ======== */}
            {creationStep === 0 && (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography sx={{ color: '#1e293b', fontWeight: 900, fontSize: { xs: '1.3rem', md: '1.6rem' }, letterSpacing: '-0.03em', mb: 0.5 }}>
                  What's this about?
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, mb: 5 }}>
                  Pick a category for your {activeOption.title.toLowerCase()}.
                </Typography>

                <Box sx={{
                  display: 'flex', gap: 2.5, overflowX: 'auto', pb: 3, justifyContent: { md: 'center' },
                  '&::-webkit-scrollbar': { height: 0 },
                }}>
                  {challengesData.map((chal: any) => (
                    <Box
                      key={chal.id}
                      onClick={() => handleSelectCategory(chal.id)}
                      sx={{
                        flex: '0 0 170px', height: 220,
                        position: 'relative', overflow: 'hidden', borderRadius: '20px',
                        cursor: 'pointer',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                          borderColor: 'rgba(0,0,0,0.1)',
                          '& .cat-img': { transform: 'scale(1.06)' },
                        }
                      }}
                    >
                      <Box className="cat-img" sx={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url(${chal.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                        transition: 'transform 0.6s ease',
                      }} />
                      <Box sx={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.7) 100%)',
                      }} />
                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, zIndex: 1 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                          {chal.title}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* ======== STEP 1: Subcategories ======== */}
            {creationStep === 1 && activeCategory && (
              <Box sx={{ width: '100%', maxWidth: 800, textAlign: 'center' }}>
                <Typography sx={{ color: '#1e293b', fontWeight: 900, fontSize: { xs: '1.3rem', md: '1.6rem' }, letterSpacing: '-0.03em', mb: 0.5 }}>
                  Narrow it down
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, mb: 5 }}>
                  Pick a topic within <strong style={{ color: '#475569' }}>{activeCategory.title}</strong>.
                </Typography>

                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                  gap: 2, textAlign: 'left',
                }}>
                  {activeCategory.subcategories?.map((sub: any) => (
                    <Paper
                      key={sub.id}
                      elevation={0}
                      onClick={() => handleSelectSubcategory(sub.id)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2, p: 2,
                        borderRadius: '16px', cursor: 'pointer',
                        bgcolor: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                          borderColor: alpha(activeOption.color, 0.25),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 24px ${alpha(activeOption.color, 0.08)}`,
                        }
                      }}
                    >
                      <Box sx={{
                        width: 48, height: 48, borderRadius: '12px', overflow: 'hidden', flexShrink: 0,
                        backgroundImage: `url(${sub.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                      }} />
                      <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3 }}>
                        {sub.title}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {/* ======== STEP 2: Timeframe ======== */}
            {creationStep === 2 && (
              <Box sx={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>
                <Typography sx={{ color: '#1e293b', fontWeight: 900, fontSize: { xs: '1.3rem', md: '1.6rem' }, letterSpacing: '-0.03em', mb: 0.5 }}>
                  What era of intelligence?
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, mb: 5 }}>
                  Choose the strategic lens for your briefing.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { key: 'past', emoji: '🕰️', label: 'The Autopsy', desc: 'Break down what no longer works.', color: '#ef4444' },
                    { key: 'present', emoji: '🔥', label: 'The Playbook', desc: 'Strategies working right now.', color: '#10b981' },
                    { key: 'future', emoji: '🔮', label: 'The Thesis', desc: 'Predict what works tomorrow.', color: '#3b82f6' },
                  ].map(tf => (
                    <Paper
                      key={tf.key}
                      elevation={0}
                      onClick={() => finalizeTaxonomy(tf.key)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2.5, p: 3, textAlign: 'left',
                        borderRadius: '18px', cursor: 'pointer',
                        bgcolor: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                          borderColor: alpha(tf.color, 0.3),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 24px ${alpha(tf.color, 0.1)}`,
                          '& .tf-arrow': { transform: 'translateX(4px)', color: tf.color }
                        }
                      }}
                    >
                      <Box sx={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{tf.emoji}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#1e293b', fontWeight: 800, fontSize: '1.05rem', mb: 0.25 }}>
                          {tf.label}
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                          {tf.desc}
                        </Typography>
                      </Box>
                      <ArrowForwardIcon className="tf-arrow" sx={{ color: '#cbd5e1', fontSize: 18, transition: 'all 0.3s' }} />
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

          </Box>

          {/* Step dots */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 5 }}>
            {[0, 1, 2].map(i => (
              <Box key={i} sx={{
                width: i === creationStep ? 24 : 6, height: 6, borderRadius: 3,
                bgcolor: i <= creationStep ? alpha(activeOption.color, i === creationStep ? 0.6 : 0.2) : 'rgba(0,0,0,0.06)',
                transition: 'all 0.4s ease',
              }} />
            ))}
          </Box>
        </Box>
      )}

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
