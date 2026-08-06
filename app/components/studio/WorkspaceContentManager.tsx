"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, alpha, IconButton, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  VisibilityOutlined as ViewIcon,
  Article as ArticleIcon,
  WorkOutlined as JobIcon,
  Event as EventIcon,
  PlayCircleOutlined as VideoIcon,
  School as ClassIcon,
  Storefront as ListingIcon
} from '@mui/icons-material';

export interface WorkspaceItem {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  authorName?: string;
  authorAvatar?: string;
  stats?: { views?: number; likes?: number; applications?: number; attendees?: number };
}

export interface WorkspaceTab {
  id: string;
  label: string;
  logoUrl?: string;
  items: WorkspaceItem[];
}

interface WorkspaceContentManagerProps {
  tabs: WorkspaceTab[];
  onEdit: (itemId: string, type: string) => void;
  onDelete: (itemId: string, type: string) => void;
  colorTheme?: string;
}

const getTypeIcon = (type: string, color: string) => {
  const props = { sx: { color, fontSize: '1.4rem' } };
  switch (type) {
    case 'article': return <ArticleIcon {...props} />;
    case 'job': return <JobIcon {...props} />;
    case 'event': return <EventIcon {...props} />;
    case 'video': return <VideoIcon {...props} />;
    case 'course': return <ClassIcon {...props} />;
    case 'listing': return <ListingIcon {...props} />;
    default: return <ArticleIcon {...props} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
    case 'active':
      return '#10b981'; // Emerald
    case 'draft':
    case 'scheduled':
    case 'pending_org_review':
      return '#f59e0b'; // Amber
    case 'rejected':
      return '#ef4444'; // Red
    default:
      return '#94a3b8'; // Slate
  }
};

export default function WorkspaceContentManager({ tabs, onEdit, onDelete, colorTheme = '#1e293b' }: WorkspaceContentManagerProps) {
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '');
  const [direction, setDirection] = useState(0);

  // Ensure activeTabId is set correctly if tabs load asynchronously
  useEffect(() => {
    if (tabs && tabs.length > 0 && !tabs.find(t => t.id === activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  if (!tabs || tabs.length === 0) return null;

  const handleTabChange = (newTabId: string) => {
    if (newTabId === activeTabId) return;
    const currentIndex = tabs.findIndex(t => t.id === activeTabId);
    const newIndex = tabs.findIndex(t => t.id === newTabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTabId(newTabId);
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  
  const draftsAndScheduled = activeTab.items.filter(item => ['draft', 'scheduled', 'pending_org_review'].includes(item.status));
  const publishedAndLive = activeTab.items.filter(item => ['published', 'active', 'rejected'].includes(item.status));

  const contentVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 40 : -40,
      opacity: 0
    })
  };

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Option 1: High-Contrast Segmented Track */}
      <Box sx={{ 
        width: '100%', overflowX: 'auto', pb: 2, pt: 1, px: 1,
        '&::-webkit-scrollbar': { height: 0 },
        scrollBehavior: 'smooth'
      }}>
        <Box sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          p: 0.75,
          borderRadius: '100px',
          bgcolor: 'rgba(0,0,0,0.03)', // subtle trough
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}>
          {tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            const count = tab.items.length;
            return (
              <Box
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                sx={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 1.25,
                  py: 1, px: 2.5, borderRadius: '100px',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover .tab-content': {
                    opacity: 1,
                  }
                }}
              >
                {/* Solid Colored Sliding Thumb */}
                {isActive && (
                  <Box
                    component={motion.div}
                    layoutId="activeTabThumb"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '100px',
                      bgcolor: colorTheme,
                      boxShadow: `0 4px 12px ${alpha(colorTheme, 0.4)}, inset 0 2px 4px rgba(255,255,255,0.2)`,
                      zIndex: 0
                    }}
                  />
                )}
                
                {/* Content (Sits above thumb) */}
                <Box className="tab-content" sx={{ 
                  position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.25,
                  opacity: isActive ? 1 : 0.6,
                  transition: 'opacity 0.3s ease'
                }}>
                  {tab.logoUrl ? (
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', overflow: 'hidden', 
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                      border: isActive ? '2px solid rgba(255,255,255,0.8)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      <img src={tab.logoUrl} alt={tab.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)', 
                      color: isActive ? '#fff' : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 900,
                      border: isActive ? '1px solid rgba(255,255,255,0.4)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {tab.label.charAt(0).toUpperCase()}
                    </Box>
                  )}
                  <Typography sx={{ 
                    fontWeight: isActive ? 900 : 600, 
                    color: isActive ? '#fff' : '#475569',
                    fontSize: '0.95rem',
                    letterSpacing: '-0.01em',
                    transition: 'color 0.3s ease'
                  }}>
                    {tab.label}
                  </Typography>
                  {count > 0 && (
                    <Box sx={{ 
                      bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)', 
                      color: isActive ? '#fff' : '#64748b',
                      px: 1.2, py: 0.25, borderRadius: '100px',
                      fontSize: '0.75rem', fontWeight: 900,
                      transition: 'all 0.3s ease'
                    }}>
                      {count}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Content Area with Sliding Animation */}
      <Box sx={{ position: 'relative', overflow: 'hidden', px: 1, py: 1, flex: 1, overflowY: 'auto' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <Box
            component={motion.div}
            key={activeTabId}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            sx={{ display: 'flex', flexDirection: 'column', gap: 5, pb: 10 }}
          >
            {/* Drafts & Scheduled Swimlane */}
            {draftsAndScheduled.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 2, mb: 0 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Drafts & Scheduled
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', flexDirection: 'row', gap: 2, 
                  overflowX: 'auto', 
                  pt: 2, pb: 4, px: 2, ml: -1, mr: -1, /* Generous padding to prevent shadow/hover clipping */
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none'
                }}>
                  {draftsAndScheduled.map((item) => (
                    <ContentRow key={item.id} item={item} colorTheme={colorTheme} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </Box>
              </Box>
            )}

            {/* Live & Published Swimlane */}
            {publishedAndLive.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 2, mb: 0 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                  <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Live & Published
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', flexDirection: 'row', gap: 2, 
                  overflowX: 'auto', 
                  pt: 2, pb: 4, px: 2, ml: -1, mr: -1, /* Generous padding to prevent shadow/hover clipping */
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none'
                }}>
                  {publishedAndLive.map((item) => (
                    <ContentRow key={item.id} item={item} colorTheme={colorTheme} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </Box>
              </Box>
            )}

            {/* Empty State */}
            {activeTab.items.length === 0 && (
              <Box sx={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                py: 12, opacity: 0.5 
              }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <ArticleIcon sx={{ fontSize: 32, color: colorTheme }} />
                </Box>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', mb: 1 }}>
                  No {activeTab.label.toLowerCase()} found
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Get started by creating a new one.
                </Typography>
              </Box>
            )}
          </Box>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

function ContentRow({ item, colorTheme, onEdit, onDelete }: { item: WorkspaceItem, colorTheme: string, onEdit: any, onDelete: any }) {
  // Determine if incomplete (draft) or complete (published)
  const isComplete = ['published', 'active'].includes(item.status);
  const completionTint = isComplete ? '#047857' : '#b45309'; // Very Dark Emerald (700), Very Dark Amber (700)
  
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minWidth: 280, maxWidth: 280, height: 210,
      p: 2.5, borderRadius: '24px', 
      bgcolor: alpha(completionTint, 0.08), 
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: `1px solid ${alpha(completionTint, 0.15)}`, 
      boxShadow: `0 8px 32px rgba(15, 23, 42, 0.03), inset 0 2px 6px rgba(255,255,255,0.8)`,
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      cursor: 'pointer',
      position: 'relative',
      flexShrink: 0,
      '&:hover': {
        bgcolor: alpha(completionTint, 0.12),
        boxShadow: `0 16px 40px ${alpha(completionTint, 0.15)}, inset 0 2px 4px rgba(255,255,255,1)`,
        transform: 'translateY(-4px)',
        '& .action-buttons': {
          opacity: 1,
          transform: 'scale(1)',
        }
      }
    }}>
      {/* Top Section: Icon & Type */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ 
          width: 44, height: 44, borderRadius: '14px', 
          background: `linear-gradient(135deg, ${alpha(colorTheme, 0.25)} 0%, ${alpha(colorTheme, 0.05)} 100%)`,
          border: `1px solid ${alpha(colorTheme, 0.2)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `inset 0 2px 6px ${alpha('#fff', 0.6)}, 0 4px 12px ${alpha(colorTheme, 0.1)}`
        }}>
          {getTypeIcon(item.type, colorTheme)}
        </Box>
        <Chip 
          label={item.status.replace(/_/g, ' ')} 
          size="small" 
          icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: completionTint, ml: '10px !important' }} />}
          sx={{ 
            bgcolor: alpha(completionTint, 0.15), color: completionTint, 
            backdropFilter: 'blur(12px)',
            fontWeight: 900, fontSize: '0.7rem', textTransform: 'capitalize',
            borderRadius: '10px', height: 26, px: 0.5,
            border: `1px solid ${alpha(completionTint, 0.3)}`,
            boxShadow: `inset 0 1px 4px rgba(255,255,255,0.6)`
          }} 
        />
      </Box>

      {/* Middle Section: Title & Date */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, justifyContent: 'center', mt: 2 }}>
        <Typography sx={{ 
          fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', 
          letterSpacing: '-0.02em', lineHeight: 1.2,
          display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 
        }}>
          {item.title}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Typography>
      </Box>

      {/* Bottom Section: Stats & Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {item.stats?.views !== undefined && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>{item.stats.views}</Typography>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Views</Typography>
            </Box>
          )}
          {item.stats?.applications !== undefined && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>{item.stats.applications}</Typography>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apps</Typography>
            </Box>
          )}
        </Box>

        <Box 
          className="action-buttons"
          sx={{ 
            display: 'flex', gap: 1, 
            opacity: { xs: 1, md: 0 }, 
            transform: { xs: 'none', md: 'scale(0.95)' }, 
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            transformOrigin: 'bottom right'
          }}
        >
          <IconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); onEdit(item.id, item.type); }} 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.7)', color: colorTheme,
              backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#fff', transform: 'scale(1.05)' }
            }}
          >
            {isComplete ? <ViewIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
          {!isComplete && (
            <IconButton 
              size="small" 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.type); }} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.7)', color: '#ef4444',
                backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: '#fff', transform: 'scale(1.05)' }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}

