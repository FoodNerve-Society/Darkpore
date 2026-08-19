'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  alpha,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Avatar,
  Modal,
  ToggleButtonGroup,
  ToggleButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Work as WorkIcon,
  VolunteerActivism as VolunteerIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  SwapHoriz as SwapIcon,
  Edit as EditIcon,
  Add as AddIcon,
  OpenInNew as OpenInNewIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  MailOutlined as MailIcon,
  Link as LinkIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { getEcosystemEmbedOptions, createTradeListing } from '@/lib/actions/trade';
import { JOB_FUNCTIONS } from '@/lib/taxonomy';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';

export interface EcosystemEmbedItem {
  id: string;
  title: string;
  category: string; // 'jobs' | 'volunteer'
  commodity?: string;
  organization: string;
  organizationLogo?: string;
  location: string;
  workModel: string;
  jobFunction?: string;
  challenges?: string[];
  subcategories?: string[];
  compType?: string;
  compensationText?: string;
  url: string;
  postedAt?: string;
}

export interface EcosystemJobPickerProps {
  blockId: string;
  content: {
    embedType?: 'job' | 'deal' | 'cooperative';
    title?: string;
    organization?: string;
    location?: string;
    compensationOrTarget?: string;
    ctaText?: string;
    ctaLink?: string;
    jobId?: string;
  };
  articleCommodity?: string;
  articleCategory?: string;
  articleSubcategory?: string;
  colorTheme?: string;
  userId?: string;
  userOrgs?: Array<{ id: string; name: string; logoUrl?: string; rank?: number }>;
  onSelectJob: (jobData: {
    title: string;
    organization: string;
    location: string;
    compensationOrTarget: string;
    ctaText: string;
    ctaLink: string;
    jobId: string;
    embedType: 'job' | 'deal' | 'cooperative';
  }) => void;
  onUpdateField: (key: string, val: any) => void;
  onClear: () => void;
}

export const EcosystemJobPicker: React.FC<EcosystemJobPickerProps> = ({
  blockId,
  content,
  articleCommodity = '',
  articleCategory = '',
  articleSubcategory = '',
  colorTheme = '#6366f1',
  userId,
  userOrgs = [],
  onSelectJob,
  onUpdateField,
  onClear,
}) => {
  const [jobs, setJobs] = useState<EcosystemEmbedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Top Tabs: Paid Jobs vs Volunteering
  const [activeCategory, setActiveCategory] = useState<'jobs' | 'volunteer'>('jobs');

  // The 4 Distinct Taxonomy Filter Pills: 'commodity' | 'category' | 'subcategory' | 'all'
  const [activeFilterPill, setActiveFilterPill] = useState<'commodity' | 'category' | 'subcategory' | 'all'>(
    articleSubcategory ? 'subcategory' : articleCommodity ? 'commodity' : 'all'
  );

  const [isSearching, setIsSearching] = useState(!content.title);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);

  // ── Quick Create Modal State ──
  const [hiringEntityType, setHiringEntityType] = useState<'my-org' | 'external'>(
    userOrgs.length > 0 ? 'my-org' : 'external'
  );
  const [selectedMyOrgId, setSelectedMyOrgId] = useState<string>(userOrgs[0]?.id || '');
  const [externalOrgName, setExternalOrgName] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobFunction, setNewJobFunction] = useState(JOB_FUNCTIONS[0] || 'Agronomy & Farm Operations');
  const [newJobCommodity, setNewJobCommodity] = useState(articleCommodity || '');
  const [newJobLocation, setNewJobLocation] = useState('Nigeria');
  const [newJobWorkModel, setNewJobWorkModel] = useState('hybrid');
  const [newJobCurrency, setNewJobCurrency] = useState('NGN');
  const [newJobMinSalary, setNewJobMinSalary] = useState('');
  const [newJobMaxSalary, setNewJobMaxSalary] = useState('');
  const [newJobNpAmount, setNewJobNpAmount] = useState('');
  const [newJobDeadline, setNewJobDeadline] = useState('');
  const [newJobAppMethod, setNewJobAppMethod] = useState<'email' | 'external'>('email');
  const [newJobAppEmail, setNewJobAppEmail] = useState('');
  const [newJobAppUrl, setNewJobAppUrl] = useState('');
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  // Load jobs from TradeListing
  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await getEcosystemEmbedOptions();
        if (res.success && isMounted) {
          setJobs(res.jobs || []);
        }
      } catch (err) {
        console.error('Failed to load ecosystem jobs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter listings based on category, filter pill, and search
  const filteredJobs = useMemo(() => {
    // 1. Filter by Paid Jobs vs Volunteering
    let pool = jobs.filter((j) => j.category === activeCategory);

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.organization.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.commodity && j.commodity.toLowerCase().includes(q)) ||
          (j.jobFunction && j.jobFunction.toLowerCase().includes(q))
      );
    }

    // 3. The 4 Discrete Filter Pills
    const commSlug = articleCommodity.toLowerCase().trim();
    const catSlug = articleCategory.toLowerCase().trim();
    const subSlug = articleSubcategory.toLowerCase().trim();

    if (activeFilterPill === 'subcategory' && subSlug) {
      const matched = pool.filter((j) => {
        const inSub = j.subcategories?.some((s) => s.toLowerCase().includes(subSlug) || subSlug.includes(s.toLowerCase()));
        const inTitle = j.title.toLowerCase().includes(subSlug);
        return inSub || inTitle;
      });
      return matched;
    }

    if (activeFilterPill === 'category' && catSlug) {
      const matched = pool.filter((j) => {
        const inCat = j.challenges?.some((c) => c.toLowerCase().includes(catSlug) || catSlug.includes(c.toLowerCase()));
        const inTitle = j.title.toLowerCase().includes(catSlug);
        return inCat || inTitle;
      });
      return matched;
    }

    if (activeFilterPill === 'commodity' && commSlug) {
      const matched = pool.filter((j) => {
        const inComm = j.commodity && (j.commodity.toLowerCase().includes(commSlug) || commSlug.includes(j.commodity.toLowerCase()));
        const inTitle = j.title.toLowerCase().includes(commSlug);
        return inComm || inTitle;
      });
      return matched;
    }

    return pool;
  }, [jobs, activeCategory, activeFilterPill, searchQuery, articleCommodity, articleCategory, articleSubcategory]);

  const handleSelectJob = (job: EcosystemEmbedItem) => {
    onSelectJob({
      title: job.title,
      organization: job.organization,
      location: `${job.location} (${job.workModel})`,
      compensationOrTarget: job.compensationText || 'Competitive Compensation',
      ctaText: job.category === 'volunteer' ? 'Volunteer for Role' : 'Apply for Position',
      ctaLink: job.url || `/careers/${job.id}`,
      jobId: job.id,
      embedType: 'job',
    });
    setIsSearching(false);
  };

  const handleQuickCreate = async () => {
    if (!newJobTitle.trim()) return;

    let orgName = '';
    let orgId: string | undefined = undefined;

    if (hiringEntityType === 'my-org') {
      const myOrg = userOrgs.find((o) => o.id === selectedMyOrgId) || userOrgs[0];
      orgName = myOrg?.name || 'My Organization';
      orgId = myOrg?.id;
    } else {
      orgName = externalOrgName.trim() || 'Hiring Organization';
    }

    setIsCreatingJob(true);
    try {
      const isVol = activeCategory === 'volunteer';
      const formattedSalary = isVol
        ? `${newJobNpAmount || '500'} NP`
        : newJobMinSalary && newJobMaxSalary
        ? `${newJobCurrency} ${Number(newJobMinSalary).toLocaleString()} - ${newJobCurrency} ${Number(newJobMaxSalary).toLocaleString()}`
        : `${newJobCurrency} ${newJobMinSalary || 'Competitive'}`;

      const payload: any = {
        category: activeCategory,
        title: newJobTitle.trim(),
        description: `Active role for ${newJobTitle.trim()} at ${orgName}. Focus: ${newJobCommodity || articleCommodity || 'Agricultural Innovation'}.`,
        priceOrAsk: formattedSalary,
        location: newJobLocation.trim(),
        commodity: newJobCommodity.trim() || articleCommodity || undefined,
        status: 'active',
        postedById: userId || 'system',
        organizationId: orgId,
        expiresAt: newJobDeadline ? new Date(newJobDeadline).toISOString() : undefined,
        metadata: {
          isExternal: hiringEntityType === 'external',
          externalEntityName: hiringEntityType === 'external' ? orgName : undefined,
          workModel: newJobWorkModel,
          jobFunction: newJobFunction,
          sector: newJobCommodity.trim() || articleCommodity || undefined,
          jobChallenges: articleCategory ? [articleCategory] : [],
          jobSubcategories: articleSubcategory ? [articleSubcategory] : [],
          currency: newJobCurrency,
          minSalary: newJobMinSalary ? Number(newJobMinSalary) : undefined,
          maxSalary: newJobMaxSalary ? Number(newJobMaxSalary) : undefined,
          npAmount: isVol && newJobNpAmount ? Number(newJobNpAmount) : undefined,
          applicationMethod: newJobAppMethod,
          applicationEmail: newJobAppMethod === 'email' ? newJobAppEmail.trim() : undefined,
          applicationUrl: newJobAppMethod === 'external' ? newJobAppUrl.trim() : undefined,
          externalButtonText: 'Apply for Position',
        },
      };

      const res = await createTradeListing(payload);
      const createdId = res.listing?.id || 'new-job';

      const newItem: EcosystemEmbedItem = {
        id: createdId,
        title: newJobTitle.trim(),
        category: activeCategory,
        commodity: newJobCommodity.trim() || articleCommodity,
        organization: orgName,
        location: newJobLocation.trim(),
        workModel: newJobWorkModel,
        jobFunction: newJobFunction,
        compensationText: formattedSalary,
        url: `/careers/${createdId}`,
        subcategories: articleSubcategory ? [articleSubcategory] : [],
      };

      setJobs((prev) => [newItem, ...prev]);
      handleSelectJob(newItem);
      setShowQuickCreateModal(false);
    } catch (err) {
      console.error('Error quick creating job:', err);
    } finally {
      setIsCreatingJob(false);
    }
  };

  const hasAttachedJob = !!content.title;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ── ATTACHED JOB PREVIEW CARD ── */}
      {hasAttachedJob && !isSearching ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '18px',
            border: '2px solid',
            borderColor: alpha(colorTheme, 0.4),
            bgcolor: alpha(colorTheme, 0.03),
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: `${colorTheme} !important` }} />}
                label="Attached Live Role"
                size="small"
                sx={{
                  bgcolor: alpha(colorTheme, 0.12),
                  color: colorTheme,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              />
              {content.location && (
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  📍 {content.location}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SwapIcon />}
                onClick={() => setIsSearching(true)}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderColor: alpha(colorTheme, 0.3),
                  color: colorTheme,
                  '&:hover': { borderColor: colorTheme, bgcolor: alpha(colorTheme, 0.05) },
                }}
              >
                Change Role
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<EditIcon />}
                onClick={() => setIsCustomMode(!isCustomMode)}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#64748b',
                }}
              >
                {isCustomMode ? 'Hide Overrides' : 'Customize'}
              </Button>
              <IconButton size="small" onClick={onClear} sx={{ color: '#ef4444' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>
              {content.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {content.organization && (
                <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                  🏢 {content.organization}
                </Typography>
              )}
              {content.compensationOrTarget && (
                <Typography sx={{ fontWeight: 800, color: colorTheme, fontSize: '0.9rem' }}>
                  💰 {content.compensationOrTarget}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: '#fff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Button:</Typography>
              <Chip label={content.ctaText || 'Apply Now'} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
              <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>➔ {content.ctaLink || '/careers'}</Typography>
            </Box>
            {content.ctaLink && (
              <IconButton size="small" href={content.ctaLink} target="_blank">
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>

          {/* Custom Overrides Area */}
          {isCustomMode && (
            <Box sx={{ pt: 2, borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                ✏️ Fine-Tune Button Text & Link:
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <PremiumTextField
                  colorTheme={colorTheme}
                  label="Button CTA Text"
                  value={content.ctaText || ''}
                  onChange={(e) => onUpdateField('ctaText', e.target.value)}
                />
                <PremiumTextField
                  colorTheme={colorTheme}
                  label="CTA Link URL"
                  value={content.ctaLink || ''}
                  onChange={(e) => onUpdateField('ctaLink', e.target.value)}
                />
              </Box>
            </Box>
          )}
        </Paper>
      ) : (
        /* ── SEARCH & ATTACH BROWSER ── */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Top Tabs: Paid Jobs vs Volunteering */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <ToggleButtonGroup
              value={activeCategory}
              exclusive
              onChange={(e, val) => {
                if (val) setActiveCategory(val);
              }}
              size="small"
              sx={{
                bgcolor: '#f1f5f9',
                p: 0.5,
                borderRadius: '14px',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '10px !important',
                  px: 2.5,
                  py: 0.75,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  color: '#64748b',
                  '&.Mui-selected': {
                    bgcolor: '#ffffff',
                    color: colorTheme,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  },
                },
              }}
            >
              <ToggleButton value="jobs">
                <WorkIcon sx={{ fontSize: 16, mr: 0.75 }} />
                Paid Jobs
              </ToggleButton>
              <ToggleButton value="volunteer">
                <VolunteerIcon sx={{ fontSize: 16, mr: 0.75 }} />
                Volunteering (NP)
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowQuickCreateModal(true)}
              sx={{
                bgcolor: colorTheme,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                borderRadius: '10px',
                px: 2,
                '&:hover': { bgcolor: alpha(colorTheme, 0.9) },
              }}
            >
              Post New Role & Attach
            </Button>
          </Box>

          {/* Search Input */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search active roles by title, department, company, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  borderRadius: '14px',
                  bgcolor: '#f8fafc',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: alpha(colorTheme, 0.5) },
                  '&.Mui-focused fieldset': { borderColor: colorTheme },
                },
              },
            }}
          />

          {/* ── THE 4 DISCRETE FILTER PILLS ── */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {articleCommodity && (
              <Chip
                label={`🌾 Commodity: ${articleCommodity}`}
                size="small"
                onClick={() => setActiveFilterPill('commodity')}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  bgcolor: activeFilterPill === 'commodity' ? alpha(colorTheme, 0.15) : '#f1f5f9',
                  color: activeFilterPill === 'commodity' ? colorTheme : '#475569',
                  border: activeFilterPill === 'commodity' ? `1px solid ${colorTheme}` : '1px solid transparent',
                  cursor: 'pointer',
                }}
              />
            )}

            {articleCategory && (
              <Chip
                label={`🏷️ Category: ${articleCategory}`}
                size="small"
                onClick={() => setActiveFilterPill('category')}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  bgcolor: activeFilterPill === 'category' ? alpha(colorTheme, 0.15) : '#f1f5f9',
                  color: activeFilterPill === 'category' ? colorTheme : '#475569',
                  border: activeFilterPill === 'category' ? `1px solid ${colorTheme}` : '1px solid transparent',
                  cursor: 'pointer',
                }}
              />
            )}

            {articleSubcategory && (
              <Chip
                label={`⚡ Subcategory: ${articleSubcategory}`}
                size="small"
                onClick={() => setActiveFilterPill('subcategory')}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  bgcolor: activeFilterPill === 'subcategory' ? alpha(colorTheme, 0.15) : '#f1f5f9',
                  color: activeFilterPill === 'subcategory' ? colorTheme : '#475569',
                  border: activeFilterPill === 'subcategory' ? `1px solid ${colorTheme}` : '1px solid transparent',
                  cursor: 'pointer',
                }}
              />
            )}

            <Chip
              label="🌐 All Roles"
              size="small"
              onClick={() => setActiveFilterPill('all')}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: activeFilterPill === 'all' ? alpha(colorTheme, 0.15) : '#f1f5f9',
                color: activeFilterPill === 'all' ? colorTheme : '#475569',
                border: activeFilterPill === 'all' ? `1px solid ${colorTheme}` : '1px solid transparent',
                cursor: 'pointer',
              }}
            />
          </Box>

          {/* Job Feed */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} sx={{ color: colorTheme }} />
            </Box>
          ) : filteredJobs.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: '#f8fafc',
                borderRadius: '16px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.9rem', mb: 1 }}>
                No active roles found matching this filter
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', mb: 2 }}>
                Switch to &ldquo;All Roles&rdquo; or post a new role for your organization.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowQuickCreateModal(true)}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: colorTheme,
                  color: colorTheme,
                }}
              >
                Post New Role
              </Button>
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                maxHeight: '320px',
                overflowY: 'auto',
                pr: 0.5,
              }}
            >
              {filteredJobs.map((job) => (
                <Paper
                  key={job.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: colorTheme,
                      boxShadow: `0 4px 14px ${alpha(colorTheme, 0.1)}`,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, flex: 1, minWidth: 0 }}>
                    <Avatar
                      src={job.organizationLogo}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(colorTheme, 0.1),
                        color: colorTheme,
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        borderRadius: '10px',
                      }}
                    >
                      {job.organization ? job.organization.charAt(0).toUpperCase() : 'J'}
                    </Avatar>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {job.title}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>
                          {job.organization}
                        </Typography>
                        {job.commodity && (
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                            🌾 {job.commodity}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                          📍 {job.location} {job.workModel && `(${job.workModel})`}
                        </Typography>
                        {job.compensationText && (
                          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: colorTheme }}>
                            💰 {job.compensationText}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleSelectJob(job)}
                    sx={{
                      bgcolor: colorTheme,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      borderRadius: '10px',
                      px: 2,
                      py: 0.75,
                      flexShrink: 0,
                      '&:hover': { bgcolor: alpha(colorTheme, 0.9) },
                    }}
                  >
                    Attach 🔗
                  </Button>
                </Paper>
              ))}
            </Box>
          )}

          {/* Manual Entry Override */}
          <Box sx={{ pt: 1, display: 'flex', justifyContent: 'center' }}>
            <Button
              size="small"
              variant="text"
              onClick={() => {
                onSelectJob({
                  title: 'New Position',
                  organization: 'Ecosystem Organization',
                  location: 'Pan-African',
                  compensationOrTarget: 'Competitive',
                  ctaText: 'Apply Now',
                  ctaLink: '/careers',
                  jobId: 'manual',
                  embedType: 'job',
                });
                setIsSearching(false);
                setIsCustomMode(true);
              }}
              sx={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'none', fontWeight: 600 }}
            >
              Or type custom role details manually ✏️
            </Button>
          </Box>
        </Box>
      )}

      {/* ── QUICK CREATE MODAL ── */}
      <Modal
        open={showQuickCreateModal}
        onClose={() => setShowQuickCreateModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Paper
          elevation={4}
          sx={{
            width: '100%',
            maxWidth: 580,
            maxHeight: '90vh',
            overflowY: 'auto',
            p: 3.5,
            borderRadius: '24px',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ color: colorTheme }} />
              <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>
                Post New Job & Attach
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setShowQuickCreateModal(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography sx={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            This opportunity will be published directly to the FoodNerve Careers database and instantly locked into this article.
          </Typography>

          {/* Hiring Entity Selector */}
          <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Hiring Entity
            </Typography>
            <RadioGroup
              row
              value={hiringEntityType}
              onChange={(e) => setHiringEntityType(e.target.value as any)}
            >
              <FormControlLabel
                value="my-org"
                control={<Radio size="small" sx={{ color: colorTheme, '&.Mui-checked': { color: colorTheme } }} />}
                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>My Organization</Typography>}
              />
              <FormControlLabel
                value="external"
                control={<Radio size="small" sx={{ color: colorTheme, '&.Mui-checked': { color: colorTheme } }} />}
                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>External Company</Typography>}
              />
            </RadioGroup>

            {hiringEntityType === 'my-org' ? (
              userOrgs.length > 0 ? (
                <PremiumAutocomplete
                  label="Select Your Organization"
                  value={userOrgs.find((o) => o.id === selectedMyOrgId)?.name || userOrgs[0].name}
                  options={userOrgs.map((o) => o.name)}
                  onChange={(e, val) => {
                    const matched = userOrgs.find((o) => o.name === val);
                    if (matched) setSelectedMyOrgId(matched.id);
                  }}
                  colorTheme={colorTheme}
                />
              ) : (
                <Typography sx={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                  You do not have a claimed organization yet. Switch to &ldquo;External Company&rdquo; or register your organization in settings.
                </Typography>
              )
            ) : (
              <PremiumTextField
                colorTheme={colorTheme}
                label="External Company / Entity Name *"
                placeholder="e.g. Olam Agri, AFEX, Flour Mills"
                value={externalOrgName}
                onChange={(e) => setExternalOrgName(e.target.value)}
              />
            )}
          </Box>

          {/* Role Mandate & Function */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2. Role & Department
            </Typography>

            <PremiumTextField
              colorTheme={colorTheme}
              label="Job Role Title *"
              placeholder="e.g. Senior Cold-Chain Agronomist"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <PremiumAutocomplete
                label="Department / Function *"
                value={newJobFunction}
                options={JOB_FUNCTIONS}
                onChange={(e, val: any) => setNewJobFunction(val || JOB_FUNCTIONS[0])}
                colorTheme={colorTheme}
              />
              <PremiumTextField
                colorTheme={colorTheme}
                label="Commodity / Value Chain"
                placeholder="e.g. Soybeans, Maize, Cassava"
                value={newJobCommodity}
                onChange={(e) => setNewJobCommodity(e.target.value)}
              />
            </Box>
          </Box>

          {/* Geography & Work Model */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3. Location & Work Setup
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <PremiumTextField
                colorTheme={colorTheme}
                label="Location (State / City) *"
                placeholder="e.g. Kano & Kaduna State"
                value={newJobLocation}
                onChange={(e) => setNewJobLocation(e.target.value)}
              />
              <PremiumAutocomplete
                label="Work Model"
                value={newJobWorkModel}
                options={['Hybrid', 'On-Site', 'Remote']}
                onChange={(e, val: any) => setNewJobWorkModel(String(val || 'hybrid').toLowerCase())}
                colorTheme={colorTheme}
              />
            </Box>
          </Box>

          {/* Terms & Compensation */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              4. Compensation & Deadline
            </Typography>

            {activeCategory === 'volunteer' ? (
              <PremiumTextField
                colorTheme={colorTheme}
                label="NervePoints (NP) Reward"
                placeholder="e.g. 500"
                value={newJobNpAmount}
                onChange={(e) => setNewJobNpAmount(e.target.value)}
              />
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr 2fr' }, gap: 2 }}>
                <PremiumAutocomplete
                  label="Currency"
                  value={newJobCurrency}
                  options={['NGN', 'USD', 'EUR', 'GBP', 'KES', 'ZAR', 'GHS']}
                  onChange={(e, val: any) => setNewJobCurrency(val || 'NGN')}
                  colorTheme={colorTheme}
                />
                <PremiumTextField
                  colorTheme={colorTheme}
                  label="Min Salary"
                  placeholder="e.g. 350000"
                  value={newJobMinSalary}
                  onChange={(e) => setNewJobMinSalary(e.target.value)}
                />
                <PremiumTextField
                  colorTheme={colorTheme}
                  label="Max Salary"
                  placeholder="e.g. 500000"
                  value={newJobMaxSalary}
                  onChange={(e) => setNewJobMaxSalary(e.target.value)}
                />
              </Box>
            )}

            <PremiumTextField
              colorTheme={colorTheme}
              label="Application Deadline (Optional)"
              type="date"
              value={newJobDeadline}
              onChange={(e) => setNewJobDeadline(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          {/* Application Method */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              5. How Candidates Apply
            </Typography>

            <RadioGroup
              row
              value={newJobAppMethod}
              onChange={(e) => setNewJobAppMethod(e.target.value as any)}
            >
              <FormControlLabel
                value="email"
                control={<Radio size="small" sx={{ color: colorTheme, '&.Mui-checked': { color: colorTheme } }} />}
                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Direct Email</Typography>}
              />
              <FormControlLabel
                value="external"
                control={<Radio size="small" sx={{ color: colorTheme, '&.Mui-checked': { color: colorTheme } }} />}
                label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>External Careers Link</Typography>}
              />
            </RadioGroup>

            {newJobAppMethod === 'email' ? (
              <PremiumTextField
                colorTheme={colorTheme}
                label="Application Email *"
                placeholder="careers@company.com"
                type="email"
                value={newJobAppEmail}
                onChange={(e) => setNewJobAppEmail(e.target.value)}
              />
            ) : (
              <PremiumTextField
                colorTheme={colorTheme}
                label="External Application URL *"
                placeholder="https://company.com/careers/lead"
                value={newJobAppUrl}
                onChange={(e) => setNewJobAppUrl(e.target.value)}
              />
            )}
          </Box>

          {/* Footer Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
            <Button
              variant="text"
              onClick={() => setShowQuickCreateModal(false)}
              sx={{ fontWeight: 700, textTransform: 'none', color: '#64748b' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleQuickCreate}
              disabled={!newJobTitle.trim() || isCreatingJob || (hiringEntityType === 'external' && !externalOrgName.trim())}
              sx={{
                bgcolor: colorTheme,
                color: '#fff',
                fontWeight: 800,
                borderRadius: '12px',
                px: 3,
                textTransform: 'none',
                '&:hover': { bgcolor: alpha(colorTheme, 0.9) },
              }}
            >
              {isCreatingJob ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Publish & Attach 🔗'}
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default EcosystemJobPicker;
