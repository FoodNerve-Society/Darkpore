'use client';

import React from 'react';
import { Box, Container, Typography, Button, Chip, Paper, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

const sharedPaperSx = {
  flex: 1,
  m: { xs: 1, md: 2 },
  minHeight: 0,
  height: { xs: 'calc(100% - 16px)', md: 'calc(100% - 32px)' },
  bgcolor: '#ffffff',
  borderRadius: 4,
  boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
  overflowY: 'auto',
  overflowX: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

export default function WikiFrontContent({ 
  wikiDocs, 
  isAdmin, 
  currentUserId,
  onDocSelect, 
  onEditDoc,
  onCreateClick 
}: { 
  wikiDocs: any[];
  isAdmin: boolean;
  currentUserId?: string;
  onDocSelect: (slug: string) => void;
  onEditDoc?: (slug: string) => void;
  onCreateClick: () => void;
}) {
  const router = useRouter();

  return (
    <Paper elevation={0} sx={{ ...sharedPaperSx, bgcolor: '#f8fafc', p: 0 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
              Omni-Wiki Hub
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>
              Internal Playbooks, SOPs, and AI Context Libraries
            </Typography>
          </Box>
          {isAdmin && (
            <Button 
              variant="contained" 
              onClick={onCreateClick}
              sx={{ 
                bgcolor: '#10b981', color: '#fff', borderRadius: '14px', py: 1.5, px: 3, fontWeight: 800,
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                '&:hover': { bgcolor: '#059669', transform: 'translateY(-2px)' }
              }}
            >
              + Create Document
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {wikiDocs.length === 0 ? (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 10, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '24px' }}>
               <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem', fontStyle: 'italic' }}>
                 No playbooks available for your clearance level.
               </Typography>
            </Box>
          ) : (
            wikiDocs.map(item => (
              <Box
                key={item.id}
                onClick={() => onDocSelect(item.slug)}
                sx={{
                  bgcolor: '#0f172a',
                  borderRadius: '24px',
                  p: 3,
                  display: 'flex', alignItems: 'center', gap: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 12px 32px rgba(15,23,42,0.15)',
                  '&:hover': {
                     transform: 'translateY(-4px)',
                     boxShadow: '0 20px 40px rgba(15,23,42,0.25)',
                     bgcolor: '#1e293b',
                  }
                }}
              >
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '16px', color: '#10b981' }}>
                  <MenuBookIcon sx={{ fontSize: 36 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{item.title}</Typography>
                    {item.isPublic ? (
                       <Chip label="Public" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800, bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }} />
                    ) : (
                       <Chip label="Restricted" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800, bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} />
                    )}
                  </Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    Category: <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {onEditDoc && (isAdmin || item.authorId === currentUserId) && (
                    <Tooltip title="Edit Playbook">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditDoc(item.slug);
                        }}
                        sx={{
                          color: '#fff',
                          bgcolor: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.3)', color: '#10b981', transform: 'scale(1.08)' },
                          transition: 'all 0.2s'
                        }}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <ArrowForwardIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 28 }} />
                </Box>
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ position: 'fixed', bottom: { xs: 24, md: 32 }, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          <Button
            onClick={() => router.push(`/profile`)}
            startIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#0f2414',
              fontWeight: 800,
              fontSize: '0.95rem',
              px: 4,
              py: 1.2,
              borderRadius: '100px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.4)',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#fff',
                transform: 'scale(1.02)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.2s',
            }}
          >
            Back to Profile
          </Button>
        </Box>
      </Container>
    </Paper>
  );
}
