// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Chip, Button, Card, CardContent, Stack, Divider, IconButton, Drawer, TextField } from '@mui/material';

import { useParams, useRouter } from 'next/navigation';
import { useSociety, RANK_NAMES, RANK_COLORS, checkGatekeeper, type RankLevel } from '@/context/SocietyContext';
import { mockMembers, type SocietyMember } from '@/lib/db/society';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MessageIcon from '@mui/icons-material/Message';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

// ============================================================
// GLASSMORPHISM
// ============================================================

const glassCard = {
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: 3,
};

function getMemberRank(nervePoints: number): RankLevel {
  if (nervePoints >= 10000) return 5;
  if (nervePoints >= 5000) return 4;
  if (nervePoints >= 2000) return 3;
  if (nervePoints >= 500) return 2;
  return 1;
}

// ============================================================
// CHAT DRAWER (RANK 3 LOCK)
// ============================================================

function ChatDrawer({ open, onClose, memberName }: { open: boolean; onClose: () => void; memberName: string }) {
  const { profile } = useSociety();
  const router = useRouter();
  const gate = profile ? checkGatekeeper(profile, 3) : null;
  const canSend = gate?.allowed ?? false;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 0 } }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onClose} size="small"><ArrowBackIcon /></IconButton>
          <Typography variant="subtitle1" fontWeight={700}>Chat with {memberName}</Typography>
        </Box>

        {/* Messages Area */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#fafbfc' }}>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <MessageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Start a conversation with {memberName}
            </Typography>
          </Box>
        </Box>

        {/* Input Area — Rank 3 Lock */}
        {canSend ? (
          <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth size="small" placeholder="Type a message..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton color="primary" sx={{ bgcolor: 'primary.main', color: "#ffffff", '&:hover': { bgcolor: 'primary.dark' } }}>
              <SendIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{
            p: 3, borderTop: '1px solid rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, rgba(124,77,255,0.05), rgba(255,152,0,0.05))',
            textAlign: 'center',
          }}>
            <LockIcon sx={{ fontSize: 32, color: '#ff9800', mb: 1 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              Messaging Locked
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              {gate?.message || 'Verify your identity to unlock direct messaging.'}
            </Typography>
            <Button
              variant="contained" size="small"
              onClick={() => { onClose(); router.push(gate?.upgradeRoute || '/profile/kyc'); }}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
            >
              Upgrade to {RANK_NAMES[3]}
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

// ============================================================
// PROOF OF WORK BADGE
// ============================================================

function ProofBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card sx={{ ...glassCard, textAlign: 'center', p: 2 }}>
      <Box sx={{ mb: 0.5 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={800}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Card>
  );
}

// ============================================================
// MEMBER PROFILE PAGE (PUBLIC CV)
// ============================================================

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { profile: myProfile } = useSociety();
  const [chatOpen, setChatOpen] = useState(false);

  const member = mockMembers.find(m => m.id === params.id);

  if (!member) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700}>Member not found</Typography>
        <Button onClick={() => router.push('/meet')} sx={{ mt: 2 }}>← Back to directory</Button>
      </Box>
    );
  }

  const rank = getMemberRank(member.nervePoints);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      {/* Back Button */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/meet')} sx={{ mb: 2, textTransform: 'none' }}>
        Back to directory
      </Button>

      {/* Hero Card */}
      <Box>
        <Card sx={{
          ...glassCard, overflow: 'visible', position: 'relative',
          background: `linear-gradient(135deg, ${RANK_COLORS[rank]}10, rgba(255,255,255,0.8))`,
        }}>
          {/* Banner Gradient */}
          <Box sx={{
            height: 120,
            background: `linear-gradient(135deg, ${RANK_COLORS[rank]}40, ${RANK_COLORS[rank]}10)`,
            borderRadius: '12px 12px 0 0',
          }} />

          <CardContent sx={{ pt: 0, position: 'relative' }}>
            {/* Avatar */}
            <Avatar
              src={member.avatarUrl}
              sx={{
                width: 96, height: 96,
                border: `4px solid white`,
                boxShadow: `0 4px 20px ${RANK_COLORS[rank]}40`,
                background: `linear-gradient(135deg, ${RANK_COLORS[rank]}, ${RANK_COLORS[rank]}88)`,
                fontSize: '2.2rem', fontWeight: 800,
                mt: -6,
              }}
            >
              {member.name.charAt(0)}
            </Avatar>

            {/* Name & Verification */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
              <Typography variant="h5" fontWeight={800}>{member.name}</Typography>
              {member.isVerified && <VerifiedIcon sx={{ color: '#1DA1F2', fontSize: 22 }} />}
            </Stack>

            {/* Role & Location */}
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip label={member.role.charAt(0).toUpperCase() + member.role.slice(1)} size="small" sx={{ fontWeight: 600 }} />
              <Chip icon={<LocationOnIcon sx={{ fontSize: 14 }} />} label={member.location} size="small" variant="outlined" />
            </Stack>

            {/* Rank Badge */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              mt: 1.5, px: 2, py: 0.75, borderRadius: 3,
              bgcolor: `${RANK_COLORS[rank]}15`,
              border: `1px solid ${RANK_COLORS[rank]}30`,
            }}>
              <EmojiEventsIcon sx={{ fontSize: 18, color: RANK_COLORS[rank] }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: RANK_COLORS[rank] }}>
                Rank {rank} · {RANK_NAMES[rank]} · {member.nervePoints.toLocaleString()} NP
              </Typography>
            </Box>

            {/* Bio */}
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.7 }}>
              {member.bio}
            </Typography>

            {/* Specialization */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" color="text.secondary">Specialization</Typography>
            <Typography variant="subtitle1" fontWeight={600}>{member.specialization}</Typography>
            <Typography variant="body2" color="text.secondary">{member.subSector}</Typography>

            {/* Message Button */}
            <Button
              variant="contained" fullWidth
              startIcon={<MessageIcon />}
              onClick={() => setChatOpen(true)}
              sx={{
                mt: 3, py: 1.5, borderRadius: 3,
                fontWeight: 700, fontSize: '1rem',
                background: `linear-gradient(135deg, ${RANK_COLORS[rank]}, ${RANK_COLORS[rank]}cc)`,
                '&:hover': { background: `linear-gradient(135deg, ${RANK_COLORS[rank]}dd, ${RANK_COLORS[rank]}aa)` },
              }}
            >
              Message {member.name.split(' ')[0]}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Proof of Work Section */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
        🏅 Proof of Work
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        <ProofBadge
          icon={<StarIcon sx={{ fontSize: 28, color: '#ffd700' }} />}
          label="Rating"
          value={`${member.rating}/5`}
        />
        <ProofBadge
          icon={<HandshakeIcon sx={{ fontSize: 28, color: '#4caf50' }} />}
          label="Reviews"
          value={member.reviewCount.toString()}
        />
        <ProofBadge
          icon={<SchoolIcon sx={{ fontSize: 28, color: '#2196f3' }} />}
          label="Member Since"
          value={new Date(member.joinedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        />
      </Box>

      {/* Wahaalas / Challenges */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
        🎯 Active Challenges
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {member.wahaalaCategories.map(w => (
          <Chip key={w} label={w} variant="outlined" sx={{ fontWeight: 600 }} />
        ))}
      </Stack>

      {/* Chat Drawer */}
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} memberName={member.name.split(' ')[0]} />
    </Box>
  );
}
