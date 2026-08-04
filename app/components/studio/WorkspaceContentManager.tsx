"use client";

import React, { useState } from 'react';
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
  switch (type) {
    case 'article': return <ArticleIcon sx={{ color, fontSize: 20 }} />;
    case 'jobs': return <JobIcon sx={{ color, fontSize: 20 }} />;
    case 'volunteer': return <JobIcon sx={{ color, fontSize: 20 }} />;
    case 'meetup': return <EventIcon sx={{ color, fontSize: 20 }} />;
    case 'livestream': return <VideoIcon sx={{ color, fontSize: 20 }} />;
    case 'masterclass': return <ClassIcon sx={{ color, fontSize: 20 }} />;
    default: return <ListingIcon sx={{ color, fontSize: 20 }} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return '#64748b'; // Slate
    case 'scheduled': return '#3b82f6'; // Blue
    case 'pending_org_review': return '#f59e0b'; // Amber
    case 'published': case 'active': return '#10b981'; // Emerald
    case 'rejected': return '#ef4444'; // Red
    default: return '#64748b';
  }
};

export default function WorkspaceContentManager({ tabs, onEdit, onDelete, colorTheme = '#1e293b' }: WorkspaceContentManagerProps) {
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '');
  const [direction, setDirection] = useState(0);

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
      
      {/* Option 1: iOS Segmented Track */}
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
          bgcolor: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
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
                }}
              >
                {/* Sliding Thumb Background */}
                {isActive && (
                  <Box
                    component={motion.div}
                    layoutId="activeTabThumb"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '100px',
                      bgcolor: '#fff',
                      boxShadow: `0 4px 16px ${alpha(colorTheme, 0.15)}, 0 1px 4px ${alpha(colorTheme, 0.05)}`,
                      zIndex: 0
                    }}
                  />
                )}
                
                {/* Content (Sits above thumb) */}
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  {tab.logoUrl ? (
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <img src={tab.logoUrl} alt={tab.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      width: 22, height: 22, borderRadius: '50%', 
                      bgcolor: isActive ? colorTheme : alpha(colorTheme, 0.1), 
                      color: isActive ? '#fff' : colorTheme,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 900,
                      transition: 'all 0.3s ease'
                    }}>
                      {tab.label.charAt(0).toUpperCase()}
                    </Box>
                  )}
                  <Typography sx={{ 
                    fontWeight: isActive ? 800 : 600, 
                    color: isActive ? '#0f172a' : '#64748b',
                    fontSize: '0.9rem',
                    letterSpacing: '-0.01em',
                    transition: 'color 0.3s ease'
                  }}>
                    {tab.label}
                  </Typography>
                  {count > 0 && (
                    <Box sx={{ 
                      bgcolor: isActive ? alpha(colorTheme, 0.1) : 'rgba(0,0,0,0.05)', 
                      color: isActive ? colorTheme : '#64748b',
                      px: 1, py: 0.25, borderRadius: '100px',
                      fontSize: '0.7rem', fontWeight: 800,
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
      <Box sx={{ position: 'relative', overflow: 'hidden', px: 1, py: 1 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTabId}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Drafts & Scheduled */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#1e293b', letterSpacing: '-0.02em' }}>
                  Drafts & Scheduled
                </Typography>
                <Chip 
                  label={draftsAndScheduled.length} 
                  size="small" 
                  sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#64748b', fontWeight: 800, fontSize: '0.75rem', height: 22 }} 
                />
              </Box>
              {draftsAndScheduled.length === 0 ? (
                <Box sx={{ 
                  p: 6, borderRadius: '24px', border: '2px dashed rgba(0,0,0,0.06)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)'
                }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <EditIcon sx={{ color: '#94a3b8' }} />
                  </Box>
                  <Typography sx={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Empty Workspace</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, mt: 0.5 }}>You don't have any drafts or scheduled items here.</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {draftsAndScheduled.map(item => (
                    <ContentRow key={item.id} item={item} colorTheme={colorTheme} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </Box>
              )}
            </Box>

            {/* Published & Live */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#1e293b', letterSpacing: '-0.02em' }}>
                  Published & Live
                </Typography>
                <Chip 
                  label={publishedAndLive.length} 
                  size="small" 
                  sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#64748b', fontWeight: 800, fontSize: '0.75rem', height: 22 }} 
                />
              </Box>
              {publishedAndLive.length === 0 ? (
                <Box sx={{ 
                  p: 6, borderRadius: '24px', border: '2px dashed rgba(0,0,0,0.06)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)'
                }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <ViewIcon sx={{ color: '#94a3b8' }} />
                  </Box>
                  <Typography sx={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em' }}>No Live Content</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, mt: 0.5 }}>Items you publish will appear here for management.</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {publishedAndLive.map(item => (
                    <ContentRow key={item.id} item={item} colorTheme={colorTheme} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </Box>
              )}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

function ContentRow({ item, colorTheme, onEdit, onDelete }: { item: WorkspaceItem, colorTheme: string, onEdit: any, onDelete: any }) {
  const statusColor = getStatusColor(item.status);
  
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      p: 2.5, borderRadius: '24px', 
      bgcolor: 'rgba(255,255,255,0.5)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.8)',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      cursor: 'pointer',
      position: 'relative',
      '&:hover': {
        bgcolor: 'rgba(255,255,255,0.9)',
        borderColor: alpha(colorTheme, 0.4),
        boxShadow: `0 16px 40px ${alpha(colorTheme, 0.12)}, inset 0 2px 4px rgba(255,255,255,1)`,
        transform: 'translateY(-2px)',
        '& .action-buttons': {
          opacity: 1,
          transform: 'translateX(0)',
        }
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, pl: 1 }}>
        {/* Spatial Gradient Icon Container */}
        <Box sx={{ 
          width: 52, height: 52, borderRadius: '16px', 
          background: `linear-gradient(135deg, ${alpha(colorTheme, 0.2)} 0%, ${alpha(colorTheme, 0.05)} 100%)`,
          border: `1px solid ${alpha(colorTheme, 0.15)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `inset 0 2px 6px ${alpha('#fff', 0.6)}, 0 4px 12px ${alpha(colorTheme, 0.08)}`
        }}>
          {getTypeIcon(item.type, colorTheme)}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem', letterSpacing: '-0.02em', mb: 0.5 }}>
            {item.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: colorTheme, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.type}
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
            {item.authorName && (
              <>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                  By <span style={{ fontWeight: 800, color: '#334155' }}>{item.authorName}</span>
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, pr: 1 }}>
        {/* Spatial Stats */}
        {item.stats && (
          <Box sx={{ display: 'flex', gap: 3, mr: 2 }}>
            {item.stats.views !== undefined && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>{item.stats.views}</Typography>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Views</Typography>
              </Box>
            )}
            {item.stats.applications !== undefined && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>{item.stats.applications}</Typography>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apps</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Frosted Status Pill */}
        <Chip 
          label={item.status.replace(/_/g, ' ')} 
          size="small" 
          icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor, ml: '10px !important' }} />}
          sx={{ 
            bgcolor: alpha(statusColor, 0.1), color: statusColor, 
            backdropFilter: 'blur(8px)',
            fontWeight: 900, fontSize: '0.75rem', textTransform: 'capitalize',
            borderRadius: '12px', height: 30, px: 0.5,
            border: `1px solid ${alpha(statusColor, 0.2)}`,
            boxShadow: `inset 0 1px 2px rgba(255,255,255,0.3)`
          }} 
        />
        
        <Box 
          className="action-buttons"
          sx={{ 
            display: 'flex', gap: 1, 
            opacity: { xs: 1, md: 0 }, 
            transform: { xs: 'none', md: 'translateX(10px)' }, 
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            ml: 1
          }}
        >
          <IconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); onEdit(item.id, item.type); }} 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.6)', color: colorTheme,
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#fff', transform: 'scale(1.05)' }
            }}
          >
            {['published', 'active'].includes(item.status) ? <ViewIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
          {['draft', 'scheduled', 'rejected'].includes(item.status) && (
            <IconButton 
              size="small" 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.type); }} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.6)', color: '#ef4444',
                backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.8)',
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

