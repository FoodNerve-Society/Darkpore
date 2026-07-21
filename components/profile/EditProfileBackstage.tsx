'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Collapse, alpha } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BadgeIcon from '@mui/icons-material/Badge';
import ShieldIcon from '@mui/icons-material/Shield';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface ActionBlockProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ActionBlock({ id, icon, title, subtitle, color, isExpanded, onToggle, children }: ActionBlockProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        onClick={onToggle}
        sx={{
          p: 2.5,
          bgcolor: isExpanded ? alpha(color, 0.05) : '#fff',
          borderRadius: isExpanded ? '20px 20px 0 0' : '20px',
          border: `1px solid ${isExpanded ? alpha(color, 0.3) : 'rgba(0,0,0,0.08)'}`,
          borderBottom: isExpanded ? 'none' : undefined,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isExpanded ? 'none' : '0 4px 12px rgba(0,0,0,0.02)',
          '&:hover': {
            bgcolor: isExpanded ? alpha(color, 0.05) : alpha(color, 0.02),
          }
        }}
      >
        <Box sx={{
          width: 48, height: 48, borderRadius: '14px',
          bgcolor: alpha(color, 0.1),
          color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '& svg': { fontSize: 24 }
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{title}</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{subtitle}</Typography>
        </Box>
      </Box>
      
      <Collapse in={isExpanded}>
        <Box sx={{
          p: 3,
          bgcolor: '#fff',
          borderRadius: '0 0 20px 20px',
          border: `1px solid ${alpha(color, 0.3)}`,
          borderTop: 'none',
          boxShadow: `0 8px 24px ${alpha(color, 0.08)}`,
        }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

interface Props {
  onClose?: () => void;
  initialBlockId?: string | null;
}

export default function EditProfileBackstage({ onClose, initialBlockId }: Props) {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  useEffect(() => {
    if (initialBlockId) {
      setActiveBlock(initialBlockId);
    }
  }, [initialBlockId]);

  const toggleBlock = (id: string) => {
    setActiveBlock(prev => prev === id ? null : id);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* HEADER */}
      <Box sx={{ p: { xs: 2, md: 4 }, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Action Center
        </Typography>
        {onClose && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onClose} sx={{ borderRadius: '12px', fontWeight: 700, borderColor: 'rgba(0,0,0,0.1)' }}>
            Back to Dashboard
          </Button>
        )}
      </Box>

      {/* BLOCKS */}
      <Box sx={{ p: { xs: 2, md: 4 }, flex: 1, overflowY: 'auto' }}>
        <ActionBlock
          id="edit-profile"
          icon={<EditIcon />}
          title="Edit Profile Details"
          subtitle="Update your name, bio, and personal information"
          color="#3b82f6"
          isExpanded={activeBlock === 'edit-profile'}
          onToggle={() => toggleBlock('edit-profile')}
        >
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: '#64748b', mb: 2 }}>Profile editing interface loaded here.</Typography>
            <Button variant="contained" sx={{ bgcolor: '#3b82f6', borderRadius: '12px', fontWeight: 700 }}>Open Full Editor</Button>
          </Box>
        </ActionBlock>

        <ActionBlock
          id="wallet"
          icon={<AccountBalanceWalletIcon />}
          title="Nerve Wallet"
          subtitle="Fund, withdraw, and track your NP balance"
          color="#7c4dff"
          isExpanded={activeBlock === 'wallet'}
          onToggle={() => toggleBlock('wallet')}
        >
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: '#64748b', mb: 2 }}>Wallet management features loaded here.</Typography>
            <Button variant="contained" sx={{ bgcolor: '#7c4dff', borderRadius: '12px', fontWeight: 700 }}>Deposit Funds</Button>
          </Box>
        </ActionBlock>

        <ActionBlock
          id="quests"
          icon={<EmojiEventsIcon />}
          title="Gatekeeper Quests"
          subtitle="Complete verification steps to unlock features"
          color="#10b981"
          isExpanded={activeBlock === 'quests'}
          onToggle={() => toggleBlock('quests')}
        >
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: '#64748b', mb: 2 }}>Quest progress and verification steps loaded here.</Typography>
            <Button variant="contained" sx={{ bgcolor: '#10b981', borderRadius: '12px', fontWeight: 700 }}>Continue Verification</Button>
          </Box>
        </ActionBlock>

        <ActionBlock
          id="identity-cards"
          icon={<BadgeIcon />}
          title="Executive Identity Cards"
          subtitle="View and download your official ID cards"
          color="#f59e0b"
          isExpanded={activeBlock === 'identity-cards'}
          onToggle={() => toggleBlock('identity-cards')}
        >
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: '#64748b', mb: 2 }}>Identity card viewer loaded here.</Typography>
            <Button variant="contained" sx={{ bgcolor: '#f59e0b', borderRadius: '12px', fontWeight: 700 }}>Download Cards</Button>
          </Box>
        </ActionBlock>

        <ActionBlock
          id="security"
          icon={<ShieldIcon />}
          title="Security & Privacy"
          subtitle="Manage passwords, 2FA, and privacy settings"
          color="#ef4444"
          isExpanded={activeBlock === 'security'}
          onToggle={() => toggleBlock('security')}
        >
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: '#64748b', mb: 2 }}>Security settings loaded here.</Typography>
            <Button variant="contained" sx={{ bgcolor: '#ef4444', borderRadius: '12px', fontWeight: 700 }}>Update Password</Button>
          </Box>
        </ActionBlock>

        <ActionBlock
          id="notifications"
          icon={<NotificationsActiveIcon />}
          title="Notification Preferences"
          subtitle="Configure how and when you receive alerts"
          color="#8b5cf6"
          isExpanded={activeBlock === 'notifications'}
          onToggle={() => toggleBlock('notifications')}
        >
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: '#64748b', mb: 2 }}>Notification toggles loaded here.</Typography>
            <Button variant="contained" sx={{ bgcolor: '#8b5cf6', borderRadius: '12px', fontWeight: 700 }}>Save Preferences</Button>
          </Box>
        </ActionBlock>
      </Box>
    </Box>
  );
}
