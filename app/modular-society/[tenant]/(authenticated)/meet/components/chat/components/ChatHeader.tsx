"use client";

import React, { useState, FC } from 'react';
import { Typography, IconButton, Box, Tooltip, Menu, MenuItem, Button, alpha, Stack, Avatar, Skeleton } from '@mui/material';
import {
  ArrowBackIosRounded, MoreVert as MoreVertIcon, HourglassTop as PendingIcon,
  GppBadOutlined as UnverifyIcon, Person as ProfileIcon, Flag as ReportIcon
} from '@mui/icons-material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { ChatConversation } from '@/lib/actions/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const stringToColor = (string: string) => {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) hash = string.charCodeAt(i) + ((hash << 5) - hash);
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const ChatHeaderSkeleton: FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, minHeight: '70px', width: '100%' }}>
    {isMobile && (
      <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
    )}
    <Skeleton variant="circular" width={44} height={44} sx={{ mr: 1.5 }} />
    <Stack sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" sx={{ fontSize: '1.2rem' }} width="40%" />
      <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width="60%" />
    </Stack>
    <Skeleton variant="circular" width={24} height={24} />
  </Box>
);

interface ChatHeaderProps {
  isMobile: boolean;
  selectedConversation: ChatConversation | null;
  onCloseChat: () => void;
  currentUserType?: string | null;
  isOtherUserGloballyVerified?: boolean;
  verificationReason?: string;
  onUnverifyClick?: () => void;
  onVerifyClick?: () => void;
  onDeclineClick?: () => void;
  onViewProfileClick?: (userId: string) => void;
  onReportUserClick?: (userId: string) => void;
  isLoading: boolean;
  applicationStatus?: 'pending' | 'approved' | 'rejected' | null;
  gracePeriodEnds?: number;
}

export default function ChatHeader({
  isMobile,
  selectedConversation,
  onCloseChat,
  currentUserType,
  isOtherUserGloballyVerified = false,
  verificationReason,
  onUnverifyClick,
  onVerifyClick,
  onDeclineClick,
  onViewProfileClick,
  onReportUserClick,
  isLoading,
  applicationStatus,
  gracePeriodEnds
}: ChatHeaderProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (isLoading) {
    return <ChatHeaderSkeleton isMobile={isMobile} />;
  }

  if (!selectedConversation) return null;

  const { otherName, otherUid, otherPic } = selectedConversation;
  const subtitle = isOtherUserGloballyVerified ? (verificationReason || "Verified Member") : "Community Member";
  
  // Simplified for now without the countdown hook
  const isExpired = gracePeriodEnds ? gracePeriodEnds < Date.now() : true;
  const showActionPanel = applicationStatus === 'pending' && !isExpired;

  return (
    <Box sx={{
      position: 'sticky', top: 0, zIndex: 1100,
      mt: { xs: '68px', md: '76px' },
      bgcolor: alpha(theme.palette.background.paper, 0.7),
      backdropFilter: 'blur(12px)',
      borderBottom: (t) => `1px solid ${t.palette.divider}`,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, minHeight: '70px' }}>
        {isMobile && <IconButton onClick={onCloseChat} sx={{ mr: 1 }}><ArrowBackIosRounded /></IconButton>}
        <Avatar
          sx={{
            width: 44,
            height: 44,
            mr: 1.5,
            bgcolor: !otherPic ? stringToColor(otherName || 'U') : undefined,
          }}
          src={otherPic || undefined}
          alt={otherName || 'User'}
        >
          {(otherName || 'U').charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Dosis, sans-serif' }} noWrap>{otherName}</Typography>
            {isOtherUserGloballyVerified && <Tooltip title={subtitle}><VerifiedIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} /></Tooltip>}
          </Box>
          <Typography variant="body2" color="text.secondary" noWrap>{subtitle}</Typography>
        </Box>
        <IconButton aria-label="more options" onClick={(e) => setAnchorEl(e.currentTarget)}><MoreVertIcon /></IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { onViewProfileClick?.(otherUid); setAnchorEl(null); }}><ProfileIcon sx={{ mr: 1.5 }} /> View Profile</MenuItem>
          <MenuItem onClick={() => { onReportUserClick?.(otherUid); setAnchorEl(null); }}><ReportIcon sx={{ mr: 1.5 }} /> Report User</MenuItem>
          {isOtherUserGloballyVerified && (currentUserType === 'Admin' || currentUserType === 'School') && (
            <MenuItem onClick={() => { onUnverifyClick?.(); setAnchorEl(null); }} sx={{ color: 'error.main' }}><UnverifyIcon sx={{ mr: 1.5 }} /> Unverify</MenuItem>
          )}
        </Menu>
      </Box>

      <AnimatePresence>
        {showActionPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <Box sx={{
              m: 1.5, mt: 0, p: 1.5, borderRadius: 3,
              bgcolor: alpha(theme.palette.warning.main, 0.15),
              border: `1px solid ${alpha(theme.palette.warning.dark, 0.2)}`,
            }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', color: 'warning.dark' }}>
                  <PendingIcon />
                  <Box>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Action Required</Typography>
                    <Typography variant="caption">Pending Review</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" color="warning" onClick={onDeclineClick} sx={{ borderRadius: '12px', textTransform: 'none' }}>Decline</Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={onVerifyClick}
                    sx={{
                      borderRadius: '12px', textTransform: 'none',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                    }}
                  >
                    Verify
                  </Button>
                </Box>
                </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
