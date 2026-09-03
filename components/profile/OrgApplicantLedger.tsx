'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Tooltip,
  Rating,
  alpha,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  getOrgJobApplications,
  updateJobApplicationStatus,
  getOrgApplicantStats,
} from '@/lib/actions/applications';
import { useRouter } from 'next/navigation';

const STAGES = [
  { id: 'all', label: 'All Candidates', color: '#64748b' },
  { id: 'new', label: 'New / Unreviewed', color: '#3b82f6' },
  { id: 'reviewing', label: 'Under Review', color: '#f59e0b' },
  { id: 'shortlisted', label: 'Shortlisted', color: '#8b5cf6' },
  { id: 'interview', label: 'Interview Scheduled', color: '#06b6d4' },
  { id: 'hired', label: 'Hired / Accepted', color: '#10b981' },
  { id: 'rejected', label: 'Archived / Rejected', color: '#ef4444' },
];

function getStageMeta(status: string) {
  return STAGES.find((s) => s.id === status) || { id: status, label: status.toUpperCase(), color: '#64748b' };
}

interface Props {
  organizationId: string;
  organizationName?: string;
  organizationSlug?: string;
  tenant?: string;
  onBack?: () => void;
  initialListingId?: string;
}

export default function OrgApplicantLedger({
  organizationId,
  organizationName = 'Company',
  organizationSlug,
  tenant = 'food',
  onBack,
  initialListingId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    new: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
  });

  // Filters
  const [selectedListingId, setSelectedListingId] = useState<string>(initialListingId || 'all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Candidate Drawer
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [internalNotesDraft, setInternalNotesDraft] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Fetch applications & stats
  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, statsRes] = await Promise.all([
        getOrgJobApplications(organizationId, {
          listingId: selectedListingId !== 'all' ? selectedListingId : undefined,
          status: selectedStage !== 'all' ? selectedStage : undefined,
          search: searchQuery.trim() || undefined,
        }),
        getOrgApplicantStats(organizationId),
      ]);

      if (appRes.success && appRes.data) {
        setApplications(appRes.data);
      }
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (e) {
      console.error('Error loading applicant data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      loadData();
    }
  }, [organizationId, selectedListingId, selectedStage]);

  // Unique listings for dropdown
  const uniqueListings = useMemo(() => {
    const map = new Map<string, string>();
    applications.forEach((app) => {
      if (app.listing?.id && app.listing?.title) {
        map.set(app.listing.id, app.listing.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [applications]);

  // Filtered applications client-side for immediate responsive search
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter((app) => {
      return (
        app.candidateName?.toLowerCase().includes(q) ||
        app.candidateEmail?.toLowerCase().includes(q) ||
        app.listing?.title?.toLowerCase().includes(q) ||
        app.coverLetter?.toLowerCase().includes(q)
      );
    });
  }, [applications, searchQuery]);

  // Update Status
  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await updateJobApplicationStatus(appId, { status: newStatus });
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
        }
        setToastMsg(`Application status updated to ${newStatus.toUpperCase()}`);
        // Refresh stats in background
        getOrgApplicantStats(organizationId).then((r) => r.success && setStats(r.stats));
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setIsSavingNotes(true);
    try {
      const res = await updateJobApplicationStatus(selectedApp.id, {
        internalNotes: internalNotesDraft,
      });
      if (res.success) {
        setSelectedApp((prev: any) => ({ ...prev, internalNotes: internalNotesDraft }));
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? { ...a, internalNotes: internalNotesDraft } : a))
        );
        setToastMsg('Recruiter internal notes saved.');
      }
    } catch (e) {
      console.error('Failed to save notes:', e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── TOP HEADER ──────────────────────────────────────────────── */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          pb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {onBack && (
              <IconButton onClick={onBack} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Talent & Applicant Ledger
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                {organizationName} • {stats.total} total candidate submissions
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
          <Button
            variant="outlined"
            onClick={loadData}
            startIcon={<RefreshIcon />}
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              color: '#475569',
              borderColor: '#e2e8f0',
              textTransform: 'none',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* ── STAGE SUMMARY METRICS BAR ──────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          px: { xs: 2.5, md: 3.5 },
          py: 2,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {STAGES.map((st) => {
          const isSelected = selectedStage === st.id;
          const count =
            st.id === 'all'
              ? stats.total
              : st.id === 'new'
              ? stats.new
              : st.id === 'reviewing'
              ? stats.reviewing
              : st.id === 'shortlisted'
              ? stats.shortlisted
              : st.id === 'interview'
              ? stats.interview
              : st.id === 'hired'
              ? stats.hired
              : stats.rejected;

          return (
            <Paper
              key={st.id}
              elevation={0}
              onClick={() => setSelectedStage(st.id)}
              sx={{
                px: 2,
                py: 1,
                borderRadius: '14px',
                cursor: 'pointer',
                bgcolor: isSelected ? st.color : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                border: `1.5px solid ${isSelected ? st.color : '#e2e8f0'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 4px 12px ${alpha(st.color, 0.3)}` : '0 2px 4px rgba(0,0,0,0.02)',
                '&:hover': {
                  borderColor: st.color,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>{st.label}</Typography>
              <Chip
                label={count}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  bgcolor: isSelected ? 'rgba(255,255,255,0.25)' : `${st.color}15`,
                  color: isSelected ? '#ffffff' : st.color,
                  borderRadius: '6px',
                }}
              />
            </Paper>
          );
        })}
      </Box>

      {/* ── FILTERS & SEARCH ROW ───────────────────────────────────── */}
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 2,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search by candidate name, email, role, or pitch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            flex: 1,
            width: { xs: '100%', md: 'auto' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: '#f8fafc',
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }
          }}
        />

        {/* Listing Dropdown Filter */}
        {uniqueListings.length > 0 && (
          <Select
            size="small"
            value={selectedListingId}
            onChange={(e) => setSelectedListingId(e.target.value)}
            sx={{
              minWidth: 220,
              width: { xs: '100%', md: 'auto' },
              borderRadius: '12px',
              bgcolor: '#f8fafc',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <MenuItem value="all">
              <em>All Company Listings</em>
            </MenuItem>
            {uniqueListings.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.title}
              </MenuItem>
            ))}
          </Select>
        )}
      </Box>

      {/* ── CANDIDATE TABLE / CARDS ────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3.5 }, bgcolor: '#f8fafc' }}>
        {loading ? (
          <Box sx={{ display: 'flex', height: 260, alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#3b82f6' }} />
          </Box>
        ) : filteredApps.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '24px',
              border: '1px dashed #cbd5e1',
              bgcolor: '#ffffff',
            }}
          >
            <PersonIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
              No applications match this filter
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.88rem', maxWidth: 460, mx: 'auto' }}>
              When operators apply to your published job listings on FoodNerve, their complete verified dossier will appear here automatically.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filteredApps.map((app) => {
              const stageMeta = getStageMeta(app.status);
              const rankColor =
                app.candidateRank >= 4
                  ? '#10b981'
                  : app.candidateRank >= 2
                  ? '#3b82f6'
                  : '#94a3b8';
              const appliedDate = app.createdAt
                ? new Date(app.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <Paper
                  key={app.id}
                  elevation={0}
                  onClick={() => {
                    setSelectedApp(app);
                    setInternalNotesDraft(app.internalNotes || '');
                  }}
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Left: Candidate Avatar & Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                    <Avatar
                      src={app.candidateAvatar || app.user?.avatarUrl || ''}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        bgcolor: `${rankColor}20`,
                        color: rankColor,
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        flexShrink: 0,
                      }}
                    >
                      {app.candidateName.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem' }}>
                          {app.candidateName}
                        </Typography>
                        {app.candidateRank >= 4 && (
                          <VerifiedIcon sx={{ fontSize: 16, color: '#10b981' }} />
                        )}
                        <Chip
                          label={`Rank ${app.candidateRank}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            bgcolor: `${rankColor}15`,
                            color: rankColor,
                            borderRadius: '6px',
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 0.3,
                        }}
                      >
                        <span>{app.candidateEmail}</span>
                        {app.candidateState && (
                          <span>• {app.candidateState}</span>
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Center: Job Role Applied For */}
                  <Box sx={{ minWidth: 0, flex: 1, px: { md: 2 } }}>
                    <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                      Target Listing
                    </Typography>
                    <Typography
                      noWrap
                      sx={{
                        fontWeight: 800,
                        color: '#1e293b',
                        fontSize: '0.92rem',
                        display: 'block',
                      }}
                    >
                      {app.listing?.title || 'General Application'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.2 }}>
                      Applied {appliedDate}
                    </Typography>
                  </Box>

                  {/* Right: Stage Pill & Dossier Trigger */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' }, justifyContent: 'space-between' }}>
                    <Select
                      size="small"
                      value={app.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(app.id, e.target.value);
                      }}
                      sx={{
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        bgcolor: `${stageMeta.color}15`,
                        color: stageMeta.color,
                        border: `1px solid ${stageMeta.color}40`,
                        '& .MuiSelect-select': { py: 0.8, px: 1.5 },
                      }}
                    >
                      {STAGES.filter((s) => s.id !== 'all').map((st) => (
                        <MenuItem key={st.id} value={st.id} sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
                          {st.label}
                        </MenuItem>
                      ))}
                    </Select>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApp(app);
                        setInternalNotesDraft(app.internalNotes || '');
                      }}
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 800,
                        textTransform: 'none',
                        color: '#0f172a',
                        borderColor: '#cbd5e1',
                        fontSize: '0.8rem',
                        px: 1.8,
                        py: 0.7,
                        '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
                      }}
                    >
                      Inspect Dossier
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      {/* ── CANDIDATE DOSSIER INSPECTION DRAWER ─────────────────────── */}
      <Drawer
        anchor="right"
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: 580, md: 660 },
              p: 0,
              bgcolor: '#f8fafc',
            },
          },
        }}
      >
        {selectedApp && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                bgcolor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedApp.candidateAvatar || selectedApp.user?.avatarUrl || ''}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                  }}
                >
                  {selectedApp.candidateName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>
                      {selectedApp.candidateName}
                    </Typography>
                    {selectedApp.candidateRank >= 4 && (
                      <VerifiedIcon sx={{ fontSize: 18, color: '#10b981' }} />
                    )}
                  </Box>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                    Rank {selectedApp.candidateRank} Verified FoodNerve Operator
                  </Typography>
                </Box>
              </Box>

              <IconButton onClick={() => setSelectedApp(null)} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Action Bar (Meet Chat & Email) */}
            <Box
              sx={{
                p: 2,
                px: { xs: 2.5, md: 3 },
                bgcolor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              {selectedApp.user?.username && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    router.push(`/modular-society/${tenant}/meet?chatWith=${selectedApp.user.username}`);
                  }}
                  startIcon={<ChatIcon />}
                  sx={{
                    bgcolor: '#3b82f6',
                    borderRadius: '12px',
                    fontWeight: 800,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#2563eb' },
                  }}
                >
                  Chat on FoodNerve Meet
                </Button>
              )}

              {selectedApp.candidateEmail && (
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={`mailto:${selectedApp.candidateEmail}?subject=${encodeURIComponent(`Update on your application for ${selectedApp.listing?.title || 'Job Opportunity'}`)}`}
                  startIcon={<EmailIcon />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 800,
                    textTransform: 'none',
                    color: '#0f172a',
                    borderColor: '#cbd5e1',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  Email Candidate
                </Button>
              )}

              {selectedApp.resumeUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={selectedApp.resumeUrl}
                  target="_blank"
                  startIcon={<DescriptionIcon />}
                  endIcon={<LaunchIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 800,
                    textTransform: 'none',
                    color: '#059669',
                    borderColor: '#a7f3d0',
                    bgcolor: '#ecfdf5',
                    '&:hover': { bgcolor: '#d1fae5' },
                  }}
                >
                  View Resume
                </Button>
              )}
            </Box>

            {/* Drawer Body Scroll */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Target Role Card */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Target Opportunity
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.3 }}>
                  {selectedApp.listing?.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={selectedApp.listing?.category?.toUpperCase()}
                    size="small"
                    sx={{ height: 22, fontSize: '0.65rem', fontWeight: 900, bgcolor: '#f1f5f9', color: '#475569', borderRadius: '6px' }}
                  />
                  {selectedApp.listing?.priceOrAsk && (
                    <Chip
                      label={`💰 ${selectedApp.listing.priceOrAsk}`}
                      size="small"
                      sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#f1f5f9', color: '#0f172a', borderRadius: '6px' }}
                    />
                  )}
                </Box>
              </Paper>

              {/* Stage Selector */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', mb: 1.5 }}>
                  Pipeline Stage
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {STAGES.filter((s) => s.id !== 'all').map((st) => {
                    const isCurrent = selectedApp.status === st.id;
                    return (
                      <Chip
                        key={st.id}
                        label={st.label}
                        onClick={() => handleStatusChange(selectedApp.id, st.id)}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          bgcolor: isCurrent ? st.color : `${st.color}12`,
                          color: isCurrent ? '#ffffff' : st.color,
                          border: `1.5px solid ${isCurrent ? st.color : 'transparent'}`,
                          borderRadius: '8px',
                          '&:hover': {
                            bgcolor: isCurrent ? st.color : `${st.color}25`,
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Paper>

              {/* Pitch Statement / Cover Letter */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', mb: 1.5 }}>
                  Candidate Pitch & Statement
                </Typography>
                {selectedApp.coverLetter ? (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.88rem',
                      lineHeight: 1.7,
                      color: '#334155',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                    }}
                  >
                    {selectedApp.coverLetter}
                  </Box>
                ) : (
                  <Typography sx={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    No pitch statement provided with this application.
                  </Typography>
                )}
              </Paper>

              {/* Recruiter Private Notes */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Internal Recruiter Notes (Private)
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={isSavingNotes}
                    onClick={handleSaveNotes}
                    sx={{
                      bgcolor: '#0f172a',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: 800,
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      '&:hover': { bgcolor: '#1e293b' },
                    }}
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Note'}
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Record interview notes, compensation requests, or screening feedback..."
                  value={internalNotesDraft}
                  onChange={(e) => setInternalNotesDraft(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#f8fafc',
                      fontSize: '0.85rem',
                    },
                  }}
                />
              </Paper>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* ── GLOBAL TOAST SNACKBAR ─────────────────────────────────── */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={3000}
        onClose={() => setToastMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: '12px', fontWeight: 700 }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
