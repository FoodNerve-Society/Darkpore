"use client";

import React, { useState } from 'react';
import { Box, Typography, alpha, IconButton, Chip } from '@mui/material';
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

  if (!tabs || tabs.length === 0) return null;

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  
  const draftsAndScheduled = activeTab.items.filter(item => ['draft', 'scheduled', 'pending_org_review'].includes(item.status));
  const publishedAndLive = activeTab.items.filter(item => ['published', 'active', 'rejected'].includes(item.status));

  return (
    <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Workspace Switcher Tabs */}
      <Box sx={{ 
        display: 'flex', gap: 1, overflowX: 'auto', pb: 1,
        '&::-webkit-scrollbar': { height: 0 }
      }}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          const count = tab.items.length;
          return (
            <Box
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                py: 1.5, px: 2.5, borderRadius: '12px',
                cursor: 'pointer', transition: 'all 0.2s ease',
                bgcolor: isActive ? alpha(colorTheme, 0.08) : 'transparent',
                border: `1px solid ${isActive ? colorTheme : 'transparent'}`,
                '&:hover': {
                  bgcolor: isActive ? alpha(colorTheme, 0.1) : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              {tab.logoUrl ? (
                <Box sx={{ width: 24, height: 24, borderRadius: '6px', overflow: 'hidden' }}>
                  <img src={tab.logoUrl} alt={tab.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ) : (
                <Box sx={{ 
                  width: 24, height: 24, borderRadius: '6px', 
                  bgcolor: colorTheme, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800
                }}>
                  {tab.label.charAt(0).toUpperCase()}
                </Box>
              )}
              <Typography sx={{ 
                fontWeight: isActive ? 800 : 600, 
                color: isActive ? colorTheme : '#64748b',
                fontSize: '0.9rem'
              }}>
                {tab.label}
              </Typography>
              {count > 0 && (
                <Box sx={{ 
                  bgcolor: isActive ? colorTheme : '#cbd5e1', 
                  color: isActive ? '#fff' : '#475569',
                  px: 1, py: 0.25, borderRadius: '100px',
                  fontSize: '0.7rem', fontWeight: 800
                }}>
                  {count}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Content Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Drafts & Scheduled */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', ml: 1 }}>
            Drafts & Scheduled ({draftsAndScheduled.length})
          </Typography>
          {draftsAndScheduled.length === 0 ? (
            <Box sx={{ p: 4, borderRadius: '16px', border: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'center' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>No drafts or scheduled items.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {draftsAndScheduled.map(item => (
                <ContentRow key={item.id} item={item} colorTheme={colorTheme} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </Box>
          )}
        </Box>

        {/* Published & Live */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', ml: 1 }}>
            Published & Live ({publishedAndLive.length})
          </Typography>
          {publishedAndLive.length === 0 ? (
            <Box sx={{ p: 4, borderRadius: '16px', border: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'center' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>No published items yet.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {publishedAndLive.map(item => (
                <ContentRow key={item.id} item={item} colorTheme={colorTheme} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </Box>
          )}
        </Box>

      </Box>
    </Box>
  );
}

function ContentRow({ item, colorTheme, onEdit, onDelete }: { item: WorkspaceItem, colorTheme: string, onEdit: any, onDelete: any }) {
  const statusColor = getStatusColor(item.status);
  
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      p: 2, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)',
      bgcolor: '#fff', transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: alpha(colorTheme, 0.3),
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          width: 40, height: 40, borderRadius: '10px', 
          bgcolor: alpha(colorTheme, 0.1),
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {getTypeIcon(item.type, colorTheme)}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
            {item.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              {item.type}
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
            {item.authorName && (
              <>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                  By {item.authorName}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {/* Stats */}
        {item.stats && (
          <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
            {item.stats.views !== undefined && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>{item.stats.views}</Typography>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Views</Typography>
              </Box>
            )}
            {item.stats.applications !== undefined && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>{item.stats.applications}</Typography>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Apps</Typography>
              </Box>
            )}
          </Box>
        )}

        <Chip 
          label={item.status.replace(/_/g, ' ')} 
          size="small" 
          sx={{ 
            bgcolor: alpha(statusColor, 0.1), color: statusColor, 
            fontWeight: 800, fontSize: '0.7rem', textTransform: 'capitalize',
            borderRadius: '6px', height: 24
          }} 
        />
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => onEdit(item.id, item.type)} sx={{ color: colorTheme }}>
            {['published', 'active'].includes(item.status) ? <ViewIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
          {['draft', 'scheduled', 'rejected'].includes(item.status) && (
            <IconButton size="small" onClick={() => onDelete(item.id, item.type)} sx={{ color: '#ef4444' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}
