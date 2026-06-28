import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, IconButton, alpha, Tooltip } from '@mui/material';
import {
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  LiveTv as LiveTvIcon,
  School as SchoolIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Close as CloseIcon,
  ArrowForwardIos as ArrowForwardIcon
} from '@mui/icons-material';

const ACCENT = "#f59e0b";

export default function CreatorStudioDashboard({
  drafts = [],
  onStartFresh,
  onEditDraft,
  onDeleteDraft,
  challengesData = []
}: {
  drafts: any[];
  onStartFresh: (type: string, taxonomy: any) => void;
  onEditDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  challengesData: any[];
}) {
  const [expandedStartType, setExpandedStartType] = useState<string | null>(null);
  const [activeAccordionIdx, setActiveAccordionIdx] = useState<number>(0);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showSubcategories, setShowSubcategories] = useState(false);

  const handleCategorySelect = (idx: number, id: string) => {
    setActiveAccordionIdx(idx);
    setCategoryLocked(true);
    setSelectedCategory(id);
    setTimeout(() => setShowSubcategories(true), 400);
  };

  const handleResetCategory = () => {
    setShowSubcategories(false);
    setTimeout(() => {
      setCategoryLocked(false);
      setSelectedCategory('');
      setSelectedSubcategory('');
    }, 300);
  };

  const handleStartFreshClose = (e: any) => {
    e.stopPropagation();
    setExpandedStartType(null);
    handleResetCategory();
  };

  const finalizeTaxonomy = (timeframe: string) => {
    setTimeout(() => {
      onStartFresh(expandedStartType as string, {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        timeframe: timeframe
      });
    }, 500);
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Morning' : currentHour < 18 ? 'Afternoon' : 'Evening';

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 4, md: 6, lg: 8 }, mx: 'auto', width: '100%', flex: 1, overflowY: 'auto',
      background: 'radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 40%)',
    }}>
      <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h3" sx={{ fontFamily: 'Caveat, cursive', color: ACCENT, mb: 1 }}>
          Good {greeting}, Creative.
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

      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>Start Fresh</Typography>
      
      <Box sx={{ display: 'flex', gap: 4, overflowX: 'auto', pt: 2, pb: 5, mb: 2, '&::-webkit-scrollbar': { height: 0 }, px: 1, mx: -1 }}>
        {[{
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
        }].map((opt) => {
          const isExpanded = expandedStartType === opt.type;
          const isHidden = expandedStartType !== null && expandedStartType !== opt.type;

          return (
            <Paper key={opt.title} onClick={() => { if (!expandedStartType) setExpandedStartType(opt.type); }} sx={{ 
              flex: isHidden ? '0 0 0%' : (isExpanded ? '0 0 100%' : '0 0 auto'),
              minWidth: isHidden ? 0 : (isExpanded ? '100%' : 260), 
              maxWidth: isHidden ? 0 : (isExpanded ? '100%' : 300), 
              height: isExpanded ? {xs: 700, md: 600} : 'auto',
              opacity: isHidden ? 0 : 1, overflow: 'hidden', p: isExpanded ? 0 : 3.5, 
              display: 'flex', flexDirection: 'column', gap: 2, borderRadius: '28px', cursor: isExpanded ? 'default' : 'pointer',
              background: opt.grad, border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: `inset 0 2px 10px rgba(255,255,255,0.2), 0 10px 30px ${alpha(opt.color, 0.4)}`,
              position: 'relative', transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              '&:hover': !isExpanded ? { transform: 'translateY(-4px)', boxShadow: `inset 0 2px 10px rgba(255,255,255,0.3), 0 16px 40px ${alpha(opt.color, 0.5)}` } : {}
            }}>
              {isExpanded ? (
                <Box sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <IconButton onClick={handleStartFreshClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(0,0,0,0.2)', zIndex: 50, '&:hover': { bgcolor: 'rgba(0,0,0,0.4)', color: '#fff' } }}>
                    <CloseIcon />
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    {opt.icon}
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900 }}>{opt.title}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 4 } }}>
                      {/* Left: Categories (Slanted Accordion) */}
                      <Box sx={{ 
                        flex: categoryLocked ? '0 0 120px' : '1', 
                        height: { xs: categoryLocked ? '120px' : '100%', md: '100%' }, 
                        transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)', 
                        display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, 
                        overflowX: { xs: 'auto', md: 'visible' }, overflowY: { xs: 'hidden', md: 'auto' }, pr: 2, pb: 2 
                      }}>
                        {challengesData.map((chal, idx) => {
                          const isActive = activeAccordionIdx === idx;
                          const isLocked = categoryLocked;
                          return (
                            <Box key={chal.id} onClick={(e) => {
                              if (!isLocked) {
                                e.stopPropagation();
                                handleCategorySelect(idx, chal.id);
                              } else if (selectedCategory === chal.id) {
                                e.stopPropagation();
                                handleResetCategory();
                              }
                            }}
                            sx={{
                              flex: isLocked ? (selectedCategory === chal.id ? '0 0 auto' : '0 0 0%') : (isActive ? '3' : '1'),
                              minHeight: { xs: '100%', md: isLocked ? (selectedCategory === chal.id ? '120px' : 0) : '80px' },
                              minWidth: { xs: isLocked ? (selectedCategory === chal.id ? '120px' : 0) : '120px', md: '100%' },
                              opacity: isLocked && selectedCategory !== chal.id ? 0 : 1,
                              overflow: 'hidden', position: 'relative', borderRadius: '20px',
                              cursor: isLocked && selectedCategory !== chal.id ? 'default' : 'pointer',
                              border: '1px solid', borderColor: isActive && !isLocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
                              transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              transform: !isLocked && !isActive ? 'skew(-5deg)' : 'none',
                              transformOrigin: 'left center',
                              '&:hover': {
                                flex: !isLocked ? (isActive ? '3' : '1.5') : undefined,
                                borderColor: !isLocked ? 'rgba(255,255,255,0.3)' : undefined,
                                transform: !isLocked && !isActive ? 'skew(-2deg)' : 'none'
                              }
                            }}>
                              <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `url(${chal.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.8s', transform: isActive ? 'scale(1.05)' : 'scale(1)', '&::after': { content: '""', position: 'absolute', inset: 0, background: isActive ? 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)' : 'rgba(0,0,0,0.6)' } }} />
                              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: isLocked ? '0.85rem' : isActive ? '1.2rem' : '1rem', letterSpacing: '-0.01em', lineHeight: 1.2, transition: 'all 0.3s' }}>{chal.title}</Typography>
                                {isActive && !isLocked && chal.desc && (
                                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{chal.desc}</Typography>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>

                      {/* Right: Subcategories & Timeframe */}
                      {categoryLocked && (
                        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', opacity: showSubcategories ? 1 : 0, transform: showSubcategories ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease-out' }}>
                          <Box sx={{ display: 'flex', width: '200%', height: { xs: 'auto', md: '100%' }, transform: selectedSubcategory ? 'translateX(-50%)' : 'translateX(0)', transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                            
                            {/* View 1: Subcategories */}
                            <Box sx={{ width: '50%', height: { xs: 'auto', md: '100%' }, overflowY: { xs: 'visible', md: 'auto' }, p: {xs:0, md:3}, pb: 8 }}>
                              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>Select Subcategory</Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, pb: 2 }}>
                                {challengesData.find(c => c.id === selectedCategory)?.subcategories?.map((sub: any) => {
                                  const isSubActive = selectedSubcategory === sub.id;
                                  return (
                                    <Box key={sub.id} onClick={(e) => { e.stopPropagation(); setSelectedSubcategory(sub.id); }} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '16px', cursor: 'pointer', border: '1px solid', borderColor: isSubActive ? '#fff' : 'rgba(255,255,255,0.15)', bgcolor: isSubActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', '&:hover': { bgcolor: isSubActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)' } }}>
                                      <Box sx={{ width: 48, height: 48, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, backgroundImage: `url(${sub.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.1)' }} />
                                      <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>{sub.title}</Typography>
                                      </Box>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Box>

                            {/* View 2: Timeframe */}
                            <Box sx={{ width: '50%', height: { xs: 'auto', md: '100%' }, overflowY: { xs: 'visible', md: 'auto' }, p: {xs:0, md:3}, pb: 8, display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>What era of intelligence is this?</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', mt: 0.5 }}>Choose the strategic lens for your briefing.</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 500, mx: 'auto' }}>
                                {[
                                  { key: 'past', emoji: '🕰️', label: 'The Autopsy', desc: 'Break down something that no longer works.', color: '#ef4444' },
                                  { key: 'present', emoji: '🔥', label: 'The Playbook', desc: 'Share strategies that are working right now.', color: '#10b981' },
                                  { key: 'future', emoji: '🔮', label: 'The Thesis', desc: 'Predict what will work tomorrow.', color: '#3b82f6' },
                                ].map(tf => (
                                  <Box key={tf.key} onClick={(e) => { e.stopPropagation(); finalizeTaxonomy(tf.key); }} sx={{ display: 'flex', alignItems: 'center', p: 2.5, borderRadius: '20px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', '&:hover': { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' } }}>
                                    <Box sx={{ fontSize: 32, mr: 2.5 }}>{tf.emoji}</Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', mb: 0.5 }}>{tf.label}</Typography>
                                      <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500 }}>{tf.desc}</Typography>
                                    </Box>
                                    <ArrowForwardIcon sx={{ color: tf.color }} />
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.15, transform: 'scale(3)', color: '#fff' }}>{opt.icon}</Box>
                  <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', mb: 2, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', position: 'relative', zIndex: 2 }}>{opt.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.01em', position: 'relative', zIndex: 2 }}>{opt.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, lineHeight: 1.5, position: 'relative', zIndex: 2 }}>{opt.desc}</Typography>
                </>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, mt: 4, letterSpacing: '0.05em' }}>Your Drafts</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
            {drafts.map(draft => (
              <Paper key={draft.id} onClick={() => onEditDraft(draft.id)} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '24px', background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.6), 0 10px 30px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)', '&:hover': { borderColor: alpha(ACCENT, 0.4), boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.8), 0 20px 40px rgba(0,0,0,0.06)', transform: 'translateY(-2px)', '& .delete-btn': { opacity: 1, transform: 'translateX(0)' } } }}>
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', bgcolor: draft.type === 'article' ? '#3b82f6' : draft.type === 'video' ? '#ef4444' : draft.type === 'livestream' ? '#10b981' : draft.type === 'class' ? '#8b5cf6' : ACCENT }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pl: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Chip label={draft.type.toUpperCase()} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: draft.type === 'article' ? alpha('#3b82f6', 0.1) : draft.type === 'video' ? alpha('#ef4444', 0.1) : draft.type === 'livestream' ? alpha('#10b981', 0.1) : alpha('#8b5cf6', 0.1), color: draft.type === 'article' ? '#3b82f6' : draft.type === 'video' ? '#ef4444' : draft.type === 'livestream' ? '#10b981' : '#8b5cf6' }} />
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', fontWeight: 600 }}>Last edited: {new Date(draft.updatedAt).toLocaleDateString()}</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', lineHeight: 1.3 }}>{draft.title || 'Untitled Draft'}</Typography>
                  </Box>
                  <Tooltip title="Delete Draft">
                    <IconButton className="delete-btn" onClick={(e) => { e.stopPropagation(); onDeleteDraft(draft.id); }} sx={{ opacity: 0, transform: 'translateX(10px)', transition: 'all 0.3s', color: 'error.main', '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
