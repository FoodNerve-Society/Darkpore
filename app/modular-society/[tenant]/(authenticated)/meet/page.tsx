// @ts-nocheck
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Chip, Avatar, Card, CardContent, Stack, Button, TextField, InputAdornment, Badge, Skeleton, Paper } from '@mui/material';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSociety, RANK_NAMES, RANK_COLORS, type Challenge, type RankLevel } from '@/context/SocietyContext';
import { getMembers, getEvents, type SocietyMember, type MeetEvent } from '@/lib/db/society';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// ============================================================
// WU WEI FILTER BAR (Reusable — will eventually be extracted)
// ============================================================

const CHALLENGES: { key: Challenge; label: string; emoji: string }[] = [
  { key: 'post-harvest-loss', label: 'Post-Harvest Loss', emoji: '🍅' },
  { key: 'cold-chain', label: 'Cold Chain', emoji: '❄️' },
  { key: 'soil-health', label: 'Soil Health', emoji: '🌱' },
  { key: 'market-access', label: 'Market Access', emoji: '📊' },
  { key: 'capital', label: 'Capital', emoji: '💰' },
  { key: 'energy', label: 'Energy', emoji: '⚡' },
];

// ============================================================
// GLASSMORPHISM STYLES
// ============================================================

const glassCard = {
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: 3,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
  },
};

// ============================================================
// MEMBER RANK BADGE
// ============================================================

function getMemberRank(nervePoints: number): RankLevel {
  if (nervePoints >= 10000) return 5;
  if (nervePoints >= 5000) return 4;
  if (nervePoints >= 2000) return 3;
  if (nervePoints >= 500) return 2;
  return 1;
}

// ============================================================
// MEMBER CARD COMPONENT
// ============================================================

function MemberCard({ member, index }: { member: SocietyMember; index: number }) {
  const router = useRouter();
  const rank = getMemberRank(member.nervePoints);

  return (
    <Box
      sx={{ '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}
    >
      <Card
        sx={{ ...glassCard, cursor: 'pointer' }}
        onClick={() => router.push(`/meet/${member.id}`)}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
            {/* Avatar with Online Badge */}
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                member.isOnline ? (
                  <Box sx={{
                    width: 12, height: 12, borderRadius: '50%',
                    bgcolor: '#4caf50', border: '2px solid white',
                  }} />
                ) : null
              }
            >
              <Avatar
                src={member.avatarUrl}
                sx={{
                  width: 56, height: 56,
                  background: `linear-gradient(135deg, ${RANK_COLORS[rank]}, ${RANK_COLORS[rank]}88)`,
                  fontSize: '1.4rem', fontWeight: 700,
                }}
              >
                {member.name.charAt(0)}
              </Avatar>
            </Badge>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                  {member.name}
                </Typography>
                {member.isVerified && <VerifiedIcon sx={{ fontSize: 16, color: '#1DA1F2' }} />}
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {member.specialization}
              </Typography>

              {/* Rank Badge */}
              <Chip
                icon={<EmojiEventsIcon sx={{ fontSize: 14 }} />}
                label={`${RANK_NAMES[rank]} · ${member.nervePoints.toLocaleString()} NP`}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: `${RANK_COLORS[rank]}15`,
                  color: RANK_COLORS[rank],
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                }}
              />
            </Box>
          </Stack>

          {/* Tags */}
          <Stack direction="row" spacing={0.5} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              icon={<LocationOnIcon sx={{ fontSize: 12 }} />}
              label={member.location}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
            <Chip
              icon={<StarIcon sx={{ fontSize: 12 }} />}
              label={`${member.rating} (${member.reviewCount})`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================
// EVENT CARD COMPONENT
// ============================================================

function EventCard({ event, index }: { event: MeetEvent; index: number }) {
  const router = useRouter();

  return (
    <Box
    >
      <Card
        sx={{
          ...glassCard,
          minWidth: 280, maxWidth: 320, cursor: 'pointer',
          background: `linear-gradient(135deg, rgba(124,77,255,0.05), rgba(255,152,0,0.05))`,
        }}
        onClick={() => router.push(`/meet/events/${event.id}`)}
      >
        <Box
          sx={{
            height: 120,
            backgroundImage: `url(${event.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {event.isVirtual && (
            <Chip label="Virtual" size="small" sx={{
              position: 'absolute', top: 8, right: 8,
              bgcolor: 'rgba(0,0,0,0.6)', color: "#ffffff", fontSize: '0.7rem',
            }} />
          )}
        </Box>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{event.title}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              icon={<EventIcon sx={{ fontSize: 12 }} />}
              label={new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              size="small" sx={{ fontSize: '0.7rem', height: 22 }}
            />
            <Chip
              icon={<PeopleIcon sx={{ fontSize: 12 }} />}
              label={`${event.attendees}/${event.maxAttendees}`}
              size="small" sx={{ fontSize: '0.7rem', height: 22 }}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================
// MEET MAIN PAGE
// ============================================================

export default function MeetPage() {
  const { profile } = useSociety();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [members, setMembers] = useState<SocietyMember[]>([]);
  const [events, setEvents] = useState<MeetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeChallenge = searchParams.get('challenge') as Challenge | null;

  useEffect(() => {
    async function load() {
      const [m, e] = await Promise.all([getMembers(), getEvents()]);
      setMembers(m);
      setEvents(e);
      setLoading(false);
    }
    load();
  }, []);

  const filteredMembers = useMemo(() => {
    let result = members;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.specialization.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [members, search]);

  const onlineMembers = useMemo(() => filteredMembers.filter(m => m.isOnline), [filteredMembers]);
  const verifiedPioneers = useMemo(() => filteredMembers.filter(m => m.isVerified && m.nervePoints >= 2000), [filteredMembers]);

  const handleChallengeClick = (key: Challenge) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeChallenge === key) {
      params.delete('challenge');
    } else {
      params.set('challenge', key);
    }
    router.push(`/meet?${params.toString()}`, { scroll: false });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" width={120} height={36} />)}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap', gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} variant="rounded" width={300} height={150} />)}
        </Stack>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 4 },
        flex: 1,
        m: { xs: 0, md: 2 },
        minHeight: { xs: '100vh', md: 'calc(100vh - 32px)' },
        bgcolor: '#ffffff',
        borderRadius: { xs: 0, md: 4 },
        boxShadow: { xs: 'none', md: '0 10px 40px rgba(0,0,0,0.04)' },
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Meet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The Trust Ledger — Connect with verified players across the food ecosystem.
        </Typography>
      </Box>

      {/* Wu Wei Filter Bar */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
        {CHALLENGES.map(b => {
          const isActive = activeChallenge === b.key || (!activeChallenge && profile?.selectedChallenges?.includes(b.key));
          return (
            <Chip
              key={b.key}
              label={`${b.emoji} ${b.label}`}
              onClick={() => handleChallengeClick(b.key)}
              sx={{
                fontWeight: 600, fontSize: '0.8rem', px: 1,
                bgcolor: isActive ? 'primary.main' : 'rgba(0,0,0,0.04)',
                color: isActive ? 'white' : 'text.secondary',
                '&:hover': { bgcolor: isActive ? 'primary.dark' : 'rgba(0,0,0,0.08)' },
                transition: 'all 0.2s ease',
              }}
            />
          );
        })}
      </Stack>

      {/* Search */}
      <TextField
        placeholder="Search members by name, role, or specialization..."
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            background: 'rgba(255,255,255,0.7)',
          },
        }}
      />

      {/* Upcoming Events Row */}
      {events.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            📅 Upcoming Events
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Verified Pioneers */}
      {verifiedPioneers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            🏆 Verified Pioneers
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {verifiedPioneers.map((member, i) => (
              <MemberCard key={member.id} member={member} index={i} />
            ))}
          </Box>
        </Box>
      )}

      {/* Online Now */}
      {onlineMembers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            🟢 Online Now
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {onlineMembers.map((member, i) => (
              <MemberCard key={member.id} member={member} index={i} />
            ))}
          </Box>
        </Box>
      )}

      {/* All Members */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }} sx={{ mb: 1.5 }}>
          👥 All Members
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {filteredMembers.map((member, i) => (
              <MemberCard key={member.id} member={member} index={i} />
            ))}
        </Box>
      </Box>
    </Paper>
  );
}
