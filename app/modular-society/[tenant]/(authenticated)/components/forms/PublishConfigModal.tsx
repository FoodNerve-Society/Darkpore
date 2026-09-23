'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Avatar, Paper, Radio,
  IconButton, TextField, alpha, Chip, FormControlLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Bolt as BoltIcon,
  CalendarMonth as CalendarIcon,
  Check as CheckIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface PublishConfigModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmPublish: (config: {
    postingAs: 'user' | 'organization';
    selectedOrgId: string | null;
    publishMode: 'immediate' | 'scheduled';
    targetDate: string;
  }) => void;
  userProfile: any;
  organizations?: any[];
  initialPostingAs?: 'user' | 'organization';
  initialOrgId?: string | null;
  initialPublishMode?: 'immediate' | 'scheduled';
  initialTargetDate?: string;
  themeColor?: string;
  loading?: boolean;
}

export function PublishConfigModal({
  open,
  onClose,
  onConfirmPublish,
  userProfile,
  organizations = [],
  initialPostingAs = 'user',
  initialOrgId = null,
  initialPublishMode = 'immediate',
  initialTargetDate = '',
  themeColor = '#f59e0b',
  loading = false,
}: PublishConfigModalProps) {
  const [postingAs, setPostingAs] = useState<'user' | 'organization'>(initialPostingAs);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(initialOrgId || (organizations[0]?.id ?? null));
  const [publishMode, setPublishMode] = useState<'immediate' | 'scheduled'>(initialPublishMode);
  const [targetDate, setTargetDate] = useState<string>(initialTargetDate || '');

  // Sync state when modal opens
  React.useEffect(() => {
    if (open) {
      setPostingAs(initialPostingAs);
      setSelectedOrgId(initialOrgId || (organizations[0]?.id ?? null));
      setPublishMode(initialPublishMode);
      setTargetDate(initialTargetDate || '');
    }
  }, [open, initialPostingAs, initialOrgId, initialPublishMode, initialTargetDate, organizations]);

  // Handle default target date if scheduled selected but no date yet (using local timezone)
  const handleSelectSchedule = () => {
    setPublishMode('scheduled');
    if (!targetDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const offset = tomorrow.getTimezoneOffset() * 60000;
      const localIso = new Date(tomorrow.getTime() - offset).toISOString().slice(0, 16);
      setTargetDate(localIso);
    }
  };

  const handleConfirm = () => {
    onConfirmPublish({
      postingAs,
      selectedOrgId: postingAs === 'organization' ? selectedOrgId : null,
      publishMode,
      targetDate: publishMode === 'scheduled' ? targetDate : ''
    });
  };

  const isTargetDateInFuture = targetDate ? new Date(targetDate).getTime() > Date.now() : false;
  const isScheduleValid = publishMode === 'immediate' || (publishMode === 'scheduled' && isTargetDateInFuture);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        '& .MuiDialog-paper': {
          borderRadius: '24px',
          bgcolor: '#ffffff',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.08)'
        }
      }}
    >
      {/* ─── MODAL HEADER ─── */}
      <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '12px',
            bgcolor: alpha(themeColor, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: themeColor
          }}>
            <BoltIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
              Publish Article
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Confirm your author identity and release timing
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3.5 }}>

        {/* ══════════════════════════════════════════════════════════
            SECTION 1: WHO THE ARTICLE IS FOR
           ══════════════════════════════════════════════════════════ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{
              width: 22, height: 22, borderRadius: '50%', bgcolor: '#0f172a', color: '#fff',
              fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              1
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
              Who is this article being posted for?
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: organizations.length > 0 ? { xs: '1fr', sm: '1fr 1fr' } : '1fr', gap: 1.5 }}>
            
            {/* Card 1: Myself (Personal) */}
            <Paper
              elevation={0}
              onClick={() => setPostingAs('user')}
              sx={{
                p: 2, borderRadius: '16px', cursor: 'pointer',
                bgcolor: postingAs === 'user' ? alpha(themeColor, 0.06) : '#f8fafc',
                border: '2px solid',
                borderColor: postingAs === 'user' ? themeColor : 'rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: 1.5,
                transition: 'all 0.2s',
                '&:hover': { borderColor: alpha(themeColor, 0.5) }
              }}
            >
              <Radio
                checked={postingAs === 'user'}
                onChange={() => setPostingAs('user')}
                sx={{ p: 0, color: '#94a3b8', '&.Mui-checked': { color: themeColor } }}
              />
              <Avatar src={userProfile?.avatarUrl} sx={{ width: 36, height: 36, bgcolor: themeColor }}>
                {userProfile?.displayName?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {userProfile?.displayName || 'Personal Profile'}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Post as independent creator
                </Typography>
              </Box>
            </Paper>

            {/* Card 2: Organization (if user has any) */}
            {organizations.length > 0 && (
              <Paper
                elevation={0}
                onClick={() => setPostingAs('organization')}
                sx={{
                  p: 2, borderRadius: '16px', cursor: 'pointer',
                  bgcolor: postingAs === 'organization' ? alpha(themeColor, 0.06) : '#f8fafc',
                  border: '2px solid',
                  borderColor: postingAs === 'organization' ? themeColor : 'rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: alpha(themeColor, 0.5) }
                }}
              >
                <Radio
                  checked={postingAs === 'organization'}
                  onChange={() => setPostingAs('organization')}
                  sx={{ p: 0, color: '#94a3b8', '&.Mui-checked': { color: themeColor } }}
                />
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
                }}>
                  <BusinessIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                    Organization
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Publish under company brand
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>

          {/* Org Selector dropdown if organization selected */}
          {postingAs === 'organization' && organizations.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select Publishing Organization:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {organizations.map(org => (
                  <Box
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1.25, px: 2, borderRadius: '12px', cursor: 'pointer',
                      bgcolor: selectedOrgId === org.id ? 'rgba(59, 130, 246, 0.08)' : '#fff',
                      border: '1.5px solid',
                      borderColor: selectedOrgId === org.id ? '#3b82f6' : 'rgba(0,0,0,0.06)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Avatar src={org.logoUrl} sx={{ width: 28, height: 28, borderRadius: '8px' }}>
                        <BusinessIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {org.name}
                      </Typography>
                      {org.verified && <VerifiedIcon sx={{ fontSize: 15, color: '#3b82f6' }} />}
                    </Box>
                    <Radio
                      checked={selectedOrgId === org.id}
                      onChange={() => setSelectedOrgId(org.id)}
                      size="small"
                      sx={{ p: 0, '&.Mui-checked': { color: '#3b82f6' } }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* ══════════════════════════════════════════════════════════
            SECTION 2: WHEN IT IS TO BE POSTED
           ══════════════════════════════════════════════════════════ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{
              width: 22, height: 22, borderRadius: '50%', bgcolor: '#0f172a', color: '#fff',
              fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              2
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
              When do you want to post it?
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            
            {/* Option A: Post Now */}
            <Paper
              elevation={0}
              onClick={() => setPublishMode('immediate')}
              sx={{
                p: 2, borderRadius: '16px', cursor: 'pointer',
                bgcolor: publishMode === 'immediate' ? 'rgba(16, 185, 129, 0.06)' : '#f8fafc',
                border: '2px solid',
                borderColor: publishMode === 'immediate' ? '#10b981' : 'rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: 1.5,
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'rgba(16, 185, 129, 0.5)' }
              }}
            >
              <Radio
                checked={publishMode === 'immediate'}
                onChange={() => setPublishMode('immediate')}
                sx={{ p: 0, color: '#94a3b8', '&.Mui-checked': { color: '#10b981' } }}
              />
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981'
              }}>
                <BoltIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                  Post Now
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Go live immediately
                </Typography>
              </Box>
            </Paper>

            {/* Option B: Post on Scheduled Date */}
            <Paper
              elevation={0}
              onClick={handleSelectSchedule}
              sx={{
                p: 2, borderRadius: '16px', cursor: 'pointer',
                bgcolor: publishMode === 'scheduled' ? 'rgba(59, 130, 246, 0.06)' : '#f8fafc',
                border: '2px solid',
                borderColor: publishMode === 'scheduled' ? '#3b82f6' : 'rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: 1.5,
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'rgba(59, 130, 246, 0.5)' }
              }}
            >
              <Radio
                checked={publishMode === 'scheduled'}
                onChange={handleSelectSchedule}
                sx={{ p: 0, color: '#94a3b8', '&.Mui-checked': { color: '#3b82f6' } }}
              />
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
              }}>
                <CalendarIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                  Post on Scheduled Date
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Choose date & time
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Date Picker Input (Only if scheduled date selected) */}
          {publishMode === 'scheduled' && (
            <Box sx={{
              p: 2, borderRadius: '14px', bgcolor: 'rgba(59, 130, 246, 0.04)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex', flexDirection: 'column', gap: 1.5
            }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8' }}>
                Select Release Date & Time:
              </Typography>
              <TextField
                type="datetime-local"
                size="small"
                fullWidth
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ bgcolor: '#fff', borderRadius: '10px' }}
              />
              <Typography sx={{ fontSize: '0.72rem', color: targetDate && !isTargetDateInFuture ? '#ef4444' : '#64748b', fontWeight: targetDate && !isTargetDateInFuture ? 700 : 500 }}>
                {targetDate && !isTargetDateInFuture
                  ? 'Scheduled date & time must be set in the future.'
                  : 'Article will be queued in the Global Editorial Calendar and automatically published at this time.'}
              </Typography>
            </Box>
          )}
        </Box>

      </DialogContent>

      {/* ─── MODAL FOOTER ─── */}
      <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ fontWeight: 800, color: '#64748b', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading || !isScheduleValid}
          startIcon={publishMode === 'scheduled' ? <ScheduleIcon /> : <BoltIcon />}
          sx={{
            bgcolor: publishMode === 'scheduled' ? '#3b82f6' : (themeColor || '#10b981'),
            color: '#fff', fontWeight: 900, borderRadius: '12px', px: 3.5, py: 1.1,
            textTransform: 'none', fontSize: '0.9rem',
            boxShadow: `0 6px 20px ${alpha(publishMode === 'scheduled' ? '#3b82f6' : themeColor, 0.35)}`,
            '&:hover': {
              bgcolor: publishMode === 'scheduled' ? '#2563eb' : alpha(themeColor, 0.9)
            }
          }}
        >
          {loading ? 'Processing...' : (publishMode === 'scheduled' ? 'Confirm & Schedule' : 'Confirm & Publish')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
