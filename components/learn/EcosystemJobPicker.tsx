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
} from '@mui/material';
import {
  Search as SearchIcon,
  Work as WorkIcon,
  VolunteerActivism as VolunteerIcon,
  MonetizationOn as DealIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  SwapHoriz as SwapIcon,
  Edit as EditIcon,
  Add as AddIcon,
  OpenInNew as OpenInNewIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { getEcosystemEmbedOptions, createTradeListing } from '@/lib/actions/trade';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';

export interface EcosystemEmbedItem {
  id: string;
  title: string;
  category: string; // 'jobs' | 'volunteer' | 'deal'
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
  articleCommodity,
  articleCategory,
  articleSubcategory,
  colorTheme = '#6366f1',
  userId,
  onSelectJob,
  onUpdateField,
  onClear,
}) => {
  const [jobs, setJobs] = useState<EcosystemEmbedItem[]>([]);
  const [deals, setDeals] = useState<EcosystemEmbedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Top Ecosystem Type: 'jobs' | 'volunteer' | 'deals'
  const [activeTab, setActiveTab] = useState<'jobs' | 'volunteer' | 'deals'>(
    content.embedType === 'deal' ? 'deals' : 'jobs'
  );

  // Taxonomy Filter: 'match' (matches article commodity/cat/subcat) or 'all'
  const [taxonomyFilter, setTaxonomyFilter] = useState<'match' | 'all'>('match');
  const [isSearching, setIsSearching] = useState(!content.title);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);

  // Quick Create Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobOrg, setNewJobOrg] = useState('');
  const [newJobLocation, setNewJobLocation] = useState(articleSubcategory ? `${articleSubcategory} Region` : 'Nigeria');
  const [newJobWorkModel, setNewJobWorkModel] = useState('hybrid');
  const [newJobSalary, setNewJobSalary] = useState('');
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  // Fetch jobs and deals on mount
  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const res = await getEcosystemEmbedOptions();
        if (res.success && isMounted) {
          setJobs(res.jobs || []);
          setDeals(res.deals || []);
        }
      } catch (err) {
        console.error('Failed to load ecosystem options for picker:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter listings based on activeTab, taxonomy, and search query
  const displayedItems = useMemo(() => {
    // 1. Pick pool by tab
    let pool: EcosystemEmbedItem[] = [];
    if (activeTab === 'deals') {
      pool = deals;
    } else if (activeTab === 'volunteer') {
      pool = jobs.filter((j) => j.category === 'volunteer');
    } else {
      pool = jobs.filter((j) => j.category === 'jobs');
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.organization.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          (item.commodity && item.commodity.toLowerCase().includes(q)) ||
          (item.jobFunction && item.jobFunction.toLowerCase().includes(q))
      );
    }

    // 3. Taxonomy Match filter (Commodity, Category, Subcategory)
    if (taxonomyFilter === 'match') {
      const commSlug = articleCommodity?.toLowerCase() || '';
      const catSlug = articleCategory?.toLowerCase() || '';
      const subSlug = articleSubcategory?.toLowerCase() || '';

      const matched = pool.filter((item) => {
        // Match commodity
        const matchComm = commSlug && item.commodity && (item.commodity.toLowerCase().includes(commSlug) || commSlug.includes(item.commodity.toLowerCase()));
        // Match subcategory
        const matchSub = subSlug && item.subcategories?.some((s) => s.toLowerCase().includes(subSlug) || subSlug.includes(s.toLowerCase()));
        // Match category/challenge
        const matchCat = catSlug && item.challenges?.some((c) => c.toLowerCase().includes(catSlug) || catSlug.includes(c.toLowerCase()));
        // Match in title
        const matchTitle = (subSlug && item.title.toLowerCase().includes(subSlug)) || (commSlug && item.title.toLowerCase().includes(commSlug));

        return matchComm || matchSub || matchCat || matchTitle;
      });

      // If matches exist, return them; otherwise return full pool so the author is never blocked
      if (matched.length > 0) {
        return matched;
      }
    }

    return pool;
  }, [jobs, deals, activeTab, taxonomyFilter, searchQuery, articleCommodity, articleCategory, articleSubcategory]);

  const handleSelect = (item: EcosystemEmbedItem) => {
    const isDeal = item.category === 'deal';
    onSelectJob({
      title: item.title,
      organization: item.organization,
      location: isDeal ? item.location : `${item.location} (${item.workModel})`,
      compensationOrTarget: item.compensationText || 'Competitive Allocation',
      ctaText: isDeal ? 'View Deal Room' : item.category === 'volunteer' ? 'Volunteer for Role' : 'Apply for Position',
      ctaLink: item.url,
      jobId: item.id,
      embedType: isDeal ? 'deal' : 'job',
    });
    setIsSearching(false);
  };

  const handleQuickCreateJob = async () => {
    if (!newJobTitle.trim() || !newJobOrg.trim()) return;
    setIsCreatingJob(true);
    try {
      const payload: any = {
        category: activeTab === 'volunteer' ? 'volunteer' : 'jobs',
        title: newJobTitle.trim(),
        description: `Active listing for ${newJobTitle.trim()} at ${newJobOrg.trim()}. Relevant to ${articleCommodity || ''} ${articleSubcategory || ''}.`,
        priceOrAsk: newJobSalary.trim() || 'Competitive',
        location: newJobLocation.trim(),
        lga: '',
        status: 'active',
        postedById: userId || 'system',
        metadata: {
          externalEntityName: newJobOrg.trim(),
          isExternal: true,
          workModel: newJobWorkModel,
          sector: articleCommodity || undefined,
          organizationChallenges: articleCategory ? [articleCategory] : [],
          organizationSubcategories: articleSubcategory ? [articleSubcategory] : [],
        },
      };

      const res = await createTradeListing(payload);
      const createdId = res.listing?.id || 'new-job';
      const newItem: EcosystemEmbedItem = {
        id: createdId,
        title: newJobTitle.trim(),
        category: activeTab === 'volunteer' ? 'volunteer' : 'jobs',
        commodity: articleCommodity || '',
        organization: newJobOrg.trim(),
        location: newJobLocation.trim(),
        workModel: newJobWorkModel,
        compensationText: newJobSalary.trim() || 'Competitive',
        url: `/careers/${createdId}`,
        subcategories: articleSubcategory ? [articleSubcategory] : [],
      };

      setJobs((prev) => [newItem, ...prev]);
      handleSelect(newItem);
      setShowQuickCreateModal(false);
    } catch (err) {
      console.error('Error quick creating job:', err);
    } finally {
      setIsCreatingJob(false);
    }
  };

  const hasAttachedItem = !!content.title;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ── ATTACHED ITEM PREVIEW CARD ── */}
      {hasAttachedItem && !isSearching ? (
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
                label={content.embedType === 'deal' ? 'Attached Deal Room SPV' : 'Attached Live Job'}
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
                Change Listing
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
          {/* Top Tabs: Jobs, Volunteering, Deal Room */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <ToggleButtonGroup
              value={activeTab}
              exclusive
              onChange={(e, val) => {
                if (val) setActiveTab(val);
              }}
              size="small"
              sx={{
                bgcolor: '#f1f5f9',
                p: 0.5,
                borderRadius: '14px',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '10px !important',
                  px: 2,
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
                Volunteering
              </ToggleButton>
              <ToggleButton value="deals">
                <DealIcon sx={{ fontSize: 16, mr: 0.75 }} />
                Deal Room & SPVs
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
              {activeTab === 'deals' ? 'Create Deal Note' : 'Post New Job'}
            </Button>
          </Box>

          {/* Search Bar */}
          <TextField
            fullWidth
            size="small"
            placeholder={
              activeTab === 'deals'
                ? 'Search active deal room campaigns or SPVs...'
                : 'Search active roles by title, company, commodity, or city...'
            }
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

          {/* Streamlined Taxonomy Filters: Match Article vs Browse All */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              label={
                articleSubcategory || articleCommodity
                  ? `🎯 Match Article (${[articleCommodity, articleSubcategory].filter(Boolean).join(' · ')})`
                  : '🎯 Match Article Context'
              }
              size="small"
              onClick={() => setTaxonomyFilter('match')}
              sx={{
                fontWeight: 800,
                fontSize: '0.75rem',
                bgcolor: taxonomyFilter === 'match' ? alpha(colorTheme, 0.15) : '#f1f5f9',
                color: taxonomyFilter === 'match' ? colorTheme : '#475569',
                border: taxonomyFilter === 'match' ? `1px solid ${colorTheme}` : '1px solid transparent',
                cursor: 'pointer',
              }}
            />
            <Chip
              label="🌐 Browse All Available"
              size="small"
              onClick={() => setTaxonomyFilter('all')}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: taxonomyFilter === 'all' ? alpha(colorTheme, 0.15) : '#f1f5f9',
                color: taxonomyFilter === 'all' ? colorTheme : '#475569',
                border: taxonomyFilter === 'all' ? `1px solid ${colorTheme}` : '1px solid transparent',
                cursor: 'pointer',
              }}
            />
          </Box>

          {/* Listings List Feed */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} sx={{ color: colorTheme }} />
            </Box>
          ) : displayedItems.length === 0 ? (
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
                No listings found matching this filter
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', mb: 2 }}>
                Switch to &ldquo;Browse All&rdquo; or post a new opportunity directly.
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
                Post New Listing
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
              {displayedItems.map((item) => (
                <Paper
                  key={item.id}
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
                      src={item.organizationLogo}
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
                      {item.organization ? item.organization.charAt(0).toUpperCase() : 'E'}
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
                        {item.title}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>
                          {item.organization}
                        </Typography>
                        {item.commodity && (
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                            🌾 {item.commodity}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                          📍 {item.location}
                        </Typography>
                        {item.compensationText && (
                          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: colorTheme }}>
                            💰 {item.compensationText}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleSelect(item)}
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

          {/* Manual Entry Fallback */}
          <Box sx={{ pt: 1, display: 'flex', justifyContent: 'center' }}>
            <Button
              size="small"
              variant="text"
              onClick={() => {
                onSelectJob({
                  title: 'New Ecosystem Opportunity',
                  organization: 'Ecosystem Entity',
                  location: 'Pan-African',
                  compensationOrTarget: 'Competitive',
                  ctaText: activeTab === 'deals' ? 'Access Data Room' : 'Apply Now',
                  ctaLink: activeTab === 'deals' ? '/support' : '/careers',
                  jobId: 'manual',
                  embedType: activeTab === 'deals' ? 'deal' : 'job',
                });
                setIsSearching(false);
                setIsCustomMode(true);
              }}
              sx={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'none', fontWeight: 600 }}
            >
              Or type custom deal / role details manually ✏️
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
            maxWidth: 520,
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
              {activeTab === 'deals' ? <DealIcon sx={{ color: colorTheme }} /> : <WorkIcon sx={{ color: colorTheme }} />}
              <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>
                {activeTab === 'deals' ? 'Create Deal Room Opportunity' : 'Post New Job & Attach'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setShowQuickCreateModal(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
            This opportunity will be published to the ecosystem database and instantly attached to this article.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PremiumTextField
              colorTheme={colorTheme}
              label={activeTab === 'deals' ? 'Deal / SPV Title' : 'Job Role Title'}
              placeholder={activeTab === 'deals' ? 'e.g. ₦500M Off-Taker SPV: Middle Belt Maize' : 'e.g. Cold-Chain Operations Lead'}
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
            />

            <PremiumTextField
              colorTheme={colorTheme}
              label="Hiring / Issuing Entity"
              placeholder="e.g. AgroNerve Logistics Ltd"
              value={newJobOrg}
              onChange={(e) => setNewJobOrg(e.target.value)}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <PremiumTextField
                colorTheme={colorTheme}
                label="Location (State / Region)"
                placeholder="e.g. Kano & Kaduna"
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

            <PremiumTextField
              colorTheme={colorTheme}
              label={activeTab === 'deals' ? 'Fund Target / IRR' : 'Salary Range / Compensation'}
              placeholder={activeTab === 'deals' ? 'e.g. 24% Net IRR · ₦500M Facility' : 'e.g. ₦12M - ₦18M / yr'}
              value={newJobSalary}
              onChange={(e) => setNewJobSalary(e.target.value)}
            />
          </Box>

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
              onClick={handleQuickCreateJob}
              disabled={!newJobTitle.trim() || !newJobOrg.trim() || isCreatingJob}
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
