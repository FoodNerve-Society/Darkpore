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
  Drawer,
  Tooltip,
  Rating,
  alpha,
  Snackbar,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
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
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import BoltIcon from '@mui/icons-material/Bolt';
import TuneIcon from '@mui/icons-material/Tune';

import {
  getOrgJobApplications,
  updateJobApplicationStatus,
  getOrgApplicantStats,
} from '@/lib/actions/applications';
import { useRouter } from 'next/navigation';

const STAGES = [
  { id: 'all', label: 'All Candidates', color: '#64748b', emoji: '👥' },
  { id: 'new', label: 'New / Inbox', color: '#3b82f6', emoji: '📬' },
  { id: 'reviewing', label: 'Under Review', color: '#f59e0b', emoji: '🔍' },
  { id: 'shortlisted', label: 'Shortlisted', color: '#8b5cf6', emoji: '⭐' },
  { id: 'interview', label: 'Interview Scheduled', color: '#06b6d4', emoji: '🎙️' },
  { id: 'hired', label: 'Hired / Accepted', color: '#10b981', emoji: '🎉' },
  { id: 'rejected', label: 'Archived', color: '#ef4444', emoji: '📁' },
];

const KANBAN_STAGES = STAGES.filter((s) => s.id !== 'all');

function getStageMeta(status: string) {
  return STAGES.find((s) => s.id === status) || { id: status, label: status.toUpperCase(), color: '#64748b', emoji: '📋' };
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

  // Views & Filters
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [selectedListingId, setSelectedListingId] = useState<string>(initialListingId || 'all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRank4Only, setFilterRank4Only] = useState<boolean>(false);
  const [filterWithResumeOnly, setFilterWithResumeOnly] = useState<boolean>(false);

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
    let list = applications;

    if (filterRank4Only) {
      list = list.filter((app) => (app.candidateRank || 1) >= 4);
    }

    if (filterWithResumeOnly) {
      list = list.filter((app) => !!app.resumeUrl);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((app) => {
        return (
          app.candidateName?.toLowerCase().includes(q) ||
          app.candidateEmail?.toLowerCase().includes(q) ||
          app.listing?.title?.toLowerCase().includes(q) ||
          app.coverLetter?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [applications, searchQuery, filterRank4Only, filterWithResumeOnly]);

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
        setToastMsg(`Status updated to ${newStatus.toUpperCase()}`);
        getOrgApplicantStats(organizationId).then((r) => r.success && setStats(r.stats));
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Update Rating
  const handleRatingChange = async (appId: string, newRating: number | null) => {
    try {
      const res = await updateJobApplicationStatus(appId, { rating: newRating || 0 });
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, rating: newRating } : a))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp((prev: any) => ({ ...prev, rating: newRating }));
        }
        setToastMsg(`Candidate rating saved (${newRating} stars)`);
      }
    } catch (e) {
      console.error('Failed to update rating:', e);
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

  // Pre-fill quick outreach email
  const handleQuickOutreach = (type: 'screening' | 'offer' | 'reject') => {
    if (!selectedApp) return;
    let subject = '';
    let body = '';
    const candidateFirst = selectedApp.candidateName.split(' ')[0] || 'Operator';
    const roleTitle = selectedApp.listing?.title || 'Job Opportunity';

    if (type === 'screening') {
      subject = `Invitation for Screening: ${roleTitle} with ${organizationName}`;
      body = `Hi ${candidateFirst},\n\nThank you for applying for the ${roleTitle} opportunity at ${organizationName}.\n\nWe were very impressed by your FoodNerve operator profile and would love to schedule a quick 20-minute introductory conversation.\n\nPlease let us know what times work best for you this week, or connect directly on FoodNerve Meet.\n\nBest regards,\n${organizationName} Hiring Team`;
    } else if (type === 'offer') {
      subject = `Offer of Engagement: ${roleTitle} at ${organizationName}`;
      body = `Hi ${candidateFirst},\n\nOn behalf of ${organizationName}, we are thrilled to offer you the position of ${roleTitle}!\n\nWe look forward to onboarding you onto the FoodNerve ecosystem network.\n\nBest regards,\n${organizationName} Leadership`;
    } else {
      subject = `Update regarding your application for ${roleTitle}`;
      body = `Hi ${candidateFirst},\n\nThank you for your interest in the ${roleTitle} position with ${organizationName}.\n\nWhile we were impressed with your background, we have chosen to move forward with another candidate whose experience more closely matches our immediate operational requirements.\n\nWe wish you the very best in your endeavors across the FoodNerve ecosystem.\n\nSincerely,\n${organizationName} Hiring Team`;
    }

    const mailto = `mailto:${selectedApp.candidateEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── TOP HEADER ──────────────────────────────────────────────── */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          pb: 2.5,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2.5,
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Talent & Applicant Ledger
                </Typography>
                <Chip
                  label="PRO ATS"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    fontWeight: 900,
                    fontSize: '0.68rem',
                    borderRadius: '6px',
                    height: 20,
                  }}
                />
              </Box>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, mt: 0.3 }}>
                {organizationName} • {stats.total} total candidate submissions across all listings
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* View Switcher & Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, val) => val && setViewMode(val)}
            size="small"
            sx={{
              bgcolor: '#f1f5f9',
              borderRadius: '12px',
              p: 0.4,
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '8px',
                px: 1.5,
                py: 0.6,
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'none',
                color: '#64748b',
                '&.Mui-selected': {
                  bgcolor: '#ffffff',
                  color: '#0f172a',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                },
              },
            }}
          >
            <ToggleButton value="table">
              <TableRowsIcon sx={{ fontSize: 16, mr: 0.6 }} /> Ledger Table
            </ToggleButton>
            <ToggleButton value="kanban">
              <ViewKanbanIcon sx={{ fontSize: 16, mr: 0.6 }} /> Pipeline Board
            </ToggleButton>
          </ToggleButtonGroup>

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
              fontSize: '0.82rem',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
            }}
          >
            Sync
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
              <Typography sx={{ fontSize: '0.85rem' }}>{st.emoji}</Typography>
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
          p: { xs: 2, md: 2.5 },
          px: { xs: 2.5, md: 3.5 },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {/* Left: Search & Listing Picker */}
        <Box sx={{ display: 'flex', gap: 1.5, flex: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            size="small"
            placeholder="Search candidate name, email, role, or pitch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                fontSize: '0.88rem',
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
              },
            }}
          />

          {uniqueListings.length > 0 && (
            <Select
              size="small"
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              sx={{
                minWidth: 220,
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

        {/* Right: Quick Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '15px !important' }} />}
            label="Rank 4+ Verified Only"
            onClick={() => setFilterRank4Only((prev) => !prev)}
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
              bgcolor: filterRank4Only ? '#10b981' : '#f8fafc',
              color: filterRank4Only ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: filterRank4Only ? '#10b981' : '#e2e8f0',
              borderRadius: '8px',
              '& .MuiChip-icon': { color: filterRank4Only ? '#ffffff' : '#10b981' },
            }}
          />

          <Chip
            icon={<DescriptionIcon sx={{ fontSize: '15px !important' }} />}
            label="With Resume Attached"
            onClick={() => setFilterWithResumeOnly((prev) => !prev)}
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
              bgcolor: filterWithResumeOnly ? '#3b82f6' : '#f8fafc',
              color: filterWithResumeOnly ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: filterWithResumeOnly ? '#3b82f6' : '#e2e8f0',
              borderRadius: '8px',
              '& .MuiChip-icon': { color: filterWithResumeOnly ? '#ffffff' : '#3b82f6' },
            }}
          />
        </Box>
      </Box>

      {/* ── CANDIDATE WORKSPACE BODY ───────────────────────────────── */}
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
              When operators apply to your published opportunities on FoodNerve, their complete verified dossier will appear here automatically.
            </Typography>
          </Paper>
        ) : viewMode === 'kanban' ? (
          /* ── KANBAN PIPELINE BOARD ── */
          <Box
            sx={{
              display: 'flex',
              gap: 2.5,
              overflowX: 'auto',
              alignItems: 'flex-start',
              pb: 3,
              minHeight: '100%',
              scrollbarWidth: 'thin',
            }}
          >
            {KANBAN_STAGES.map((stage) => {
              const stageApps = filteredApps.filter((a) => a.status === stage.id);

              return (
                <Box
                  key={stage.id}
                  sx={{
                    width: 320,
                    minWidth: 320,
                    bgcolor: '#f1f5f9',
                    borderRadius: '20px',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  {/* Column Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: stage.color }} />
                      <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#0f172a' }}>
                        {stage.label}
                      </Typography>
                    </Box>
                    <Chip
                      label={stageApps.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        bgcolor: `${stage.color}15`,
                        color: stage.color,
                        borderRadius: '6px',
                      }}
                    />
                  </Box>

                  {/* Cards Stack */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 120 }}>
                    {stageApps.length === 0 ? (
                      <Box
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          borderRadius: '14px',
                          border: '1px dashed #cbd5e1',
                          bgcolor: 'rgba(255,255,255,0.5)',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                          Empty stage
                        </Typography>
                      </Box>
                    ) : (
                      stageApps.map((app) => {
                        const rankColor =
                          app.candidateRank >= 4
                            ? '#10b981'
                            : app.candidateRank >= 2
                            ? '#3b82f6'
                            : '#94a3b8';

                        return (
                          <Paper
                            key={app.id}
                            elevation={0}
                            onClick={() => {
                              setSelectedApp(app);
                              setInternalNotesDraft(app.internalNotes || '');
                            }}
                            sx={{
                              p: 2,
                              borderRadius: '16px',
                              bgcolor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                borderColor: stage.color,
                                boxShadow: `0 8px 20px ${alpha(stage.color, 0.12)}`,
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Avatar
                                  src={app.candidateAvatar || app.user?.avatarUrl || ''}
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '10px',
                                    bgcolor: '#f1f5f9',
                                    color: rankColor,
                                    fontWeight: 900,
                                    fontSize: '0.9rem',
                                    border: '1px solid #e2e8f0',
                                  }}
                                >
                                  {app.candidateName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                      {app.candidateName}
                                    </Typography>
                                    {app.candidateRank >= 4 && (
                                      <VerifiedIcon sx={{ fontSize: 14, color: '#10b981' }} />
                                    )}
                                  </Box>
                                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                                    Rank {app.candidateRank}
                                  </Typography>
                                </Box>
                              </Box>

                              <Rating
                                size="small"
                                value={app.rating || 0}
                                onChange={(e, val) => {
                                  e.stopPropagation();
                                  handleRatingChange(app.id, val);
                                }}
                                sx={{ fontSize: '0.85rem' }}
                              />
                            </Box>

                            <Typography
                              noWrap
                              sx={{
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#334155',
                                mb: 0.5,
                              }}
                            >
                              {app.listing?.title || 'Job Opportunity'}
                            </Typography>

                            {app.coverLetter && (
                              <Typography
                                sx={{
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.4,
                                  mb: 1.5,
                                }}
                              >
                                {app.coverLetter}
                              </Typography>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #f1f5f9' }}>
                              <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                                {app.createdAt
                                  ? new Date(app.createdAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'Recent'}
                              </Typography>

                              {app.resumeUrl && (
                                <Chip
                                  label="Resume"
                                  size="small"
                                  icon={<DescriptionIcon sx={{ fontSize: '12px !important' }} />}
                                  sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#ecfdf5', color: '#059669' }}
                                />
                              )}
                            </Box>
                          </Paper>
                        );
                      })
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          /* ── LEDGER TABLE / CARDS ── */
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1.2 }}>
                    <Avatar
                      src={app.candidateAvatar || app.user?.avatarUrl || ''}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        bgcolor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
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
                        <Rating
                          size="small"
                          value={app.rating || 0}
                          onChange={(e, val) => {
                            e.stopPropagation();
                            handleRatingChange(app.id, val);
                          }}
                          sx={{ fontSize: '0.85rem' }}
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
                        {app.candidateState && <span>• {app.candidateState}</span>}
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
              width: { xs: '100vw', sm: 580, md: 680 },
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
                    width: 60,
                    height: 60,
                    borderRadius: '18px',
                    bgcolor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    fontWeight: 900,
                    fontSize: '1.5rem',
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                      Rank {selectedApp.candidateRank} Verified FoodNerve Operator
                    </Typography>
                    <Rating
                      size="small"
                      value={selectedApp.rating || 0}
                      onChange={(e, val) => handleRatingChange(selectedApp.id, val)}
                      sx={{ fontSize: '0.95rem' }}
                    />
                  </Box>
                </Box>
              </Box>

              <IconButton onClick={() => setSelectedApp(null)} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Action Bar (Meet Chat & Email & Quick Presets) */}
            <Box
              sx={{
                p: 2,
                px: { xs: 2.5, md: 3 },
                bgcolor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                gap: 1.2,
                flexWrap: 'wrap',
                alignItems: 'center',
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
                    fontSize: '0.8rem',
                    '&:hover': { bgcolor: '#2563eb' },
                  }}
                >
                  Meet Chat
                </Button>
              )}

              {selectedApp.candidateEmail && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickOutreach('screening')}
                  startIcon={<EmailIcon />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 800,
                    textTransform: 'none',
                    color: '#0f172a',
                    borderColor: '#cbd5e1',
                    fontSize: '0.8rem',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  Invite Screening
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
                    fontSize: '0.8rem',
                    '&:hover': { bgcolor: '#d1fae5' },
                  }}
                >
                  Resume
                </Button>
              )}

              <Button
                variant="text"
                size="small"
                onClick={() => handleQuickOutreach('offer')}
                startIcon={<BoltIcon sx={{ color: '#10b981' }} />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: '#10b981',
                  fontSize: '0.8rem',
                  '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.08)' },
                }}
              >
                Send Offer
              </Button>
            </Box>

            {/* Drawer Body Scroll */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                  {selectedApp.pitchTone && (
                    <Chip
                      label={`Tone: ${selectedApp.pitchTone}`}
                      size="small"
                      sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed', borderRadius: '6px' }}
                    />
                  )}
                </Box>
              </Paper>

              {/* Stage Progression Selector */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', mb: 1.5 }}>
                  Pipeline Stage & Triage
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {KANBAN_STAGES.map((st) => {
                    const isCurrent = selectedApp.status === st.id;
                    return (
                      <Chip
                        key={st.id}
                        label={`${st.emoji} ${st.label}`}
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
