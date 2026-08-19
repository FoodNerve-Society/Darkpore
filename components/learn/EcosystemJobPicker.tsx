'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Work as WorkIcon,
  VolunteerActivism as VolunteerIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  OpenInNew as OpenInNewIcon,
  CloudUpload as CloudUploadIcon,
  DeleteOutlined as DeleteIcon,
} from '@mui/icons-material';
import { Country, State, City } from 'country-state-city';
import { getEcosystemEmbedOptions, createTradeListing } from '@/lib/actions/trade';
import { searchExternalOrganizations } from '@/lib/actions/organizations';
import { VALUE_CHAIN_ACTORS } from '@/lib/taxonomy';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import PremiumDatePicker from '@/components/PremiumDatePicker';

export interface AttachedJobItem {
  jobId: string;
  title: string;
  organization: string;
  organizationLogo?: string;
  location: string;
  compensationOrTarget: string;
  ctaText: string;
  ctaLink: string;
  embedType: 'job' | 'deal' | 'cooperative';
}

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
    jobs?: AttachedJobItem[];
  };
  articleCommodity?: string;
  articleCategory?: string;
  articleSubcategory?: string;
  colorTheme?: string;
  userId?: string;
  userOrgs?: Array<{ id: string; name: string; logoUrl?: string; rank?: number }>;
  onSelectJob: (jobData: AttachedJobItem) => void;
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

  // Normalize attached list
  const attachedList: AttachedJobItem[] = useMemo(() => {
    if (content.jobs && content.jobs.length > 0) return content.jobs;
    if (content.title) {
      return [{
        jobId: content.jobId || '1',
        title: content.title,
        organization: content.organization || '',
        location: content.location || '',
        compensationOrTarget: content.compensationOrTarget || '',
        ctaText: content.ctaText || 'Apply for Position',
        ctaLink: content.ctaLink || '/careers',
        embedType: content.embedType || 'job'
      }];
    }
    return [];
  }, [content]);

  const [isSearching, setIsSearching] = useState(attachedList.length === 0);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);

  // ── Quick Create Modal State ──
  const [hiringEntityType, setHiringEntityType] = useState<'my-org' | 'external'>(
    userOrgs.length > 0 ? 'my-org' : 'external'
  );
  const [selectedMyOrgId, setSelectedMyOrgId] = useState<string>(userOrgs[0]?.id || '');
  
  // External Organization details
  const [externalOrgName, setExternalOrgName] = useState('');
  const [externalOrgId, setExternalOrgId] = useState<string | null>(null);
  const [externalOrgOptions, setExternalOrgOptions] = useState<any[]>([]);
  const [isSearchingOrgs, setIsSearchingOrgs] = useState(false);
  const [externalShortName, setExternalShortName] = useState('');
  const [externalCountry, setExternalCountry] = useState<any>(Country.getCountryByCode('NG') || null);
  const [externalState, setExternalState] = useState<any>(null);
  const [externalLga, setExternalLga] = useState<any>(null);
  const [externalLogoUrl, setExternalLogoUrl] = useState('');
  const [externalLogoFile, setExternalLogoFile] = useState<File | null>(null);

  // Cascading Geography lists
  const countries = useMemo(() => Country.getAllCountries(), []);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Role details
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newValueChainActor, setNewValueChainActor] = useState(VALUE_CHAIN_ACTORS[0] || 'Crop Farming & Horticulture');
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

  const { uploadFile, uploading: uploadingLogo } = useStorageUpload();

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

  // Update states when externalCountry changes
  useEffect(() => {
    if (externalCountry) {
      setStates(State.getStatesOfCountry(externalCountry.isoCode));
      setExternalState(null);
      setExternalLga(null);
    } else {
      setStates([]);
    }
  }, [externalCountry]);

  // Update cities when externalState changes
  useEffect(() => {
    if (externalState && externalCountry) {
      setCities(City.getCitiesOfState(externalCountry.isoCode, externalState.isoCode));
      setExternalLga(null);
    } else {
      setCities([]);
    }
  }, [externalState, externalCountry]);

  // Debounced search for external organizations
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleOrgSearch = (query: string) => {
    setExternalOrgName(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setExternalOrgOptions([]);
      return;
    }
    setIsSearchingOrgs(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchExternalOrganizations(query.trim());
        setExternalOrgOptions(results || []);
      } catch (e) {
        console.error('Error searching external orgs:', e);
      } finally {
        setIsSearchingOrgs(false);
      }
    }, 300);
  };

  // Filter listings based on category, filter pill, and search
  const filteredJobs = useMemo(() => {
    let pool = jobs.filter((j) => j.category === activeCategory);

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

    const commSlug = articleCommodity.toLowerCase().trim();
    const catSlug = articleCategory.toLowerCase().trim();
    const subSlug = articleSubcategory.toLowerCase().trim();

    if (activeFilterPill === 'subcategory' && subSlug) {
      return pool.filter((j) => {
        const inSub = j.subcategories?.some((s) => s.toLowerCase().includes(subSlug) || subSlug.includes(s.toLowerCase()));
        const inTitle = j.title.toLowerCase().includes(subSlug);
        return inSub || inTitle;
      });
    }

    if (activeFilterPill === 'category' && catSlug) {
      return pool.filter((j) => {
        const inCat = j.challenges?.some((c) => c.toLowerCase().includes(catSlug) || catSlug.includes(c.toLowerCase()));
        const inTitle = j.title.toLowerCase().includes(catSlug);
        return inCat || inTitle;
      });
    }

    if (activeFilterPill === 'commodity' && commSlug) {
      return pool.filter((j) => {
        const inComm = j.commodity && (j.commodity.toLowerCase().includes(commSlug) || commSlug.includes(j.commodity.toLowerCase()));
        const inTitle = j.title.toLowerCase().includes(commSlug);
        return inComm || inTitle;
      });
    }

    return pool;
  }, [jobs, activeCategory, activeFilterPill, searchQuery, articleCommodity, articleCategory, articleSubcategory]);

  const handleAttachJob = (job: EcosystemEmbedItem) => {
    const newItem: AttachedJobItem = {
      jobId: job.id,
      title: job.title,
      organization: job.organization,
      organizationLogo: job.organizationLogo,
      location: `${job.location} (${job.workModel})`,
      compensationOrTarget: job.compensationText || 'Competitive Compensation',
      ctaText: job.category === 'volunteer' ? 'Volunteer for Role' : 'Apply for Position',
      ctaLink: job.url || `/careers/${job.id}`,
      embedType: 'job',
    };

    // Append to list of attached jobs
    const updated = [...attachedList.filter(j => j.jobId !== newItem.jobId), newItem];
    onUpdateField('jobs', updated);
    
    // Also set first item for single-fallback compatibility
    onSelectJob(updated[0]);
    setIsSearching(false);
  };

  const handleDetachJob = (jobId: string) => {
    const updated = attachedList.filter((j) => j.jobId !== jobId);
    onUpdateField('jobs', updated);
    if (updated.length > 0) {
      onSelectJob(updated[0]);
    } else {
      onClear();
      setIsSearching(true);
    }
  };

  const handleUpdateJobField = (jobId: string, key: keyof AttachedJobItem, val: string) => {
    const updated = attachedList.map((j) => (j.jobId === jobId ? { ...j, [key]: val } : j));
    onUpdateField('jobs', updated);
    if (updated[0]?.jobId === jobId) {
      onUpdateField(key, val);
    }
  };

  const handleQuickCreate = async () => {
    if (!newJobTitle.trim()) return;

    let orgName = '';
    let orgId: string | undefined = undefined;
    let finalLogoUrl = externalLogoUrl;

    if (hiringEntityType === 'my-org') {
      const myOrg = userOrgs.find((o) => o.id === selectedMyOrgId) || userOrgs[0];
      orgName = myOrg?.name || 'My Organization';
      orgId = myOrg?.id;
      finalLogoUrl = myOrg?.logoUrl || '';
    } else {
      orgName = externalOrgName.trim() || 'Hiring Organization';
      if (externalLogoFile) {
        const res = await uploadFile(externalLogoFile);
        if (res?.publicUrl || res?.secure_url) {
          finalLogoUrl = res.publicUrl || res.secure_url;
        }
      }
    }

    setIsCreatingJob(true);
    try {
      const isVol = activeCategory === 'volunteer';
      const formattedSalary = isVol
        ? `${newJobNpAmount || '500'} NP`
        : newJobMinSalary && newJobMaxSalary
        ? `${newJobCurrency} ${Number(newJobMinSalary).toLocaleString()} - ${newJobCurrency} ${Number(newJobMaxSalary).toLocaleString()}`
        : `${newJobCurrency} ${newJobMinSalary || 'Competitive'}`;

      let locationString = newJobLocation.trim();
      if (hiringEntityType === 'external' && externalCountry) {
        const parts = [externalLga?.name, externalState?.name, externalCountry?.name].filter(Boolean);
        if (parts.length > 0) locationString = parts.join(', ');
      }

      const payload: any = {
        category: activeCategory,
        title: newJobTitle.trim(),
        description: `Active role for ${newJobTitle.trim()} at ${orgName}. Focus: ${articleCommodity || 'Agricultural Innovation'}.`,
        priceOrAsk: formattedSalary,
        location: locationString,
        commodity: articleCommodity || undefined,
        status: 'active',
        postedById: userId || 'system',
        organizationId: orgId,
        expiresAt: newJobDeadline ? new Date(newJobDeadline).toISOString() : undefined,
        metadata: {
          isExternal: hiringEntityType === 'external',
          externalEntityName: hiringEntityType === 'external' ? orgName : undefined,
          externalEntityId: (hiringEntityType === 'external' && externalOrgId) ? externalOrgId : undefined,
          externalEntityShortName: externalShortName || undefined,
          externalCountry: externalCountry?.name,
          externalState: externalState?.name,
          externalLga: externalLga?.name,
          externalEntityLogoUrl: finalLogoUrl || undefined,
          workModel: newJobWorkModel,
          jobFunction: newValueChainActor,
          sector: articleCommodity || undefined,
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
        commodity: articleCommodity,
        organization: orgName,
        organizationLogo: finalLogoUrl,
        location: locationString,
        workModel: newJobWorkModel,
        jobFunction: newValueChainActor,
        compensationText: formattedSalary,
        url: `/careers/${createdId}`,
        subcategories: articleSubcategory ? [articleSubcategory] : [],
      };

      setJobs((prev) => [newItem, ...prev]);
      handleAttachJob(newItem);
      setShowQuickCreateModal(false);
    } catch (err) {
      console.error('Error quick creating job:', err);
    } finally {
      setIsCreatingJob(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ── ATTACHED JOBS STACK (SUPPORTS MULTIPLE ATTACHED ROLES) ── */}
      {attachedList.length > 0 && !isSearching && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {attachedList.map((job) => (
            <Paper
              key={job.jobId}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
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
                  {job.location && (
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                      📍 {job.location}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<EditIcon />}
                    onClick={() => setEditingJobId(editingJobId === job.jobId ? null : job.jobId)}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: '#64748b',
                    }}
                  >
                    {editingJobId === job.jobId ? 'Done' : 'Fine-Tune Button'}
                  </Button>
                  <IconButton size="small" onClick={() => handleDetachJob(job.jobId)} sx={{ color: '#ef4444' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>
                  {job.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  {job.organization && (
                    <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                      🏢 {job.organization}
                    </Typography>
                  )}
                  {job.compensationOrTarget && (
                    <Typography sx={{ fontWeight: 800, color: colorTheme, fontSize: '0.9rem' }}>
                      💰 {job.compensationOrTarget}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Button Preview */}
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
                  <Chip label={job.ctaText || 'Apply for Position'} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>➔ {job.ctaLink || '/careers'}</Typography>
                </Box>
                {job.ctaLink && (
                  <IconButton size="small" href={job.ctaLink} target="_blank">
                    <OpenInNewIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>

              {/* Fine-Tune Button Override Area */}
              {editingJobId === job.jobId && (
                <Box sx={{ pt: 2, borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                    ✏️ Override Button Text & Link for this role:
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <PremiumTextField
                      colorTheme={colorTheme}
                      label="Button CTA Text"
                      value={job.ctaText || ''}
                      onChange={(e) => handleUpdateJobField(job.jobId, 'ctaText', e.target.value)}
                    />
                    <PremiumTextField
                      colorTheme={colorTheme}
                      label="CTA Link URL"
                      value={job.ctaLink || ''}
                      onChange={(e) => handleUpdateJobField(job.jobId, 'ctaLink', e.target.value)}
                    />
                  </Box>
                </Box>
              )}
            </Paper>
          ))}

          {/* Action Bar: Add Another Job / Post New */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', pt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setIsSearching(true)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                borderColor: colorTheme,
                color: colorTheme,
                px: 2,
                py: 0.75,
                '&:hover': { bgcolor: alpha(colorTheme, 0.05), borderColor: colorTheme }
              }}
            >
              + Attach Another Role to this Block
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<WorkIcon />}
              onClick={() => setShowQuickCreateModal(true)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: '#64748b',
              }}
            >
              Post New Role & Attach
            </Button>
          </Box>
        </Box>
      )}

      {/* ── SEARCH & ATTACH BROWSER (WHEN SEARCHING OR EMPTY) ── */}
      {(attachedList.length === 0 || isSearching) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {attachedList.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#475569' }}>
                🔍 Browse & Attach Another Role ({attachedList.length} currently attached)
              </Typography>
              <Button size="small" onClick={() => setIsSearching(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>
                Done
              </Button>
            </Box>
          )}

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
                    onClick={() => handleAttachJob(job)}
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
                handleAttachJob({
                  id: `manual-${Date.now()}`,
                  title: 'New Position',
                  category: 'jobs',
                  organization: 'Ecosystem Organization',
                  location: 'Pan-African',
                  workModel: 'Hybrid',
                  compensationText: 'Competitive',
                  url: '/careers',
                });
              }}
              sx={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'none', fontWeight: 600 }}
            >
              Or type custom role details manually ✏️
            </Button>
          </Box>
        </Box>
      )}

      {/* ── 80VW x 80VH QUICK CREATE MODAL WITH PREMIUM DATEPICKER ── */}
      <Modal
        open={showQuickCreateModal}
        onClose={() => setShowQuickCreateModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1.5, md: 3 } }}
      >
        <Paper
          elevation={8}
          sx={{
            width: { xs: '95vw', md: '80vw' },
            height: { xs: '90vh', md: '80vh' },
            maxWidth: '1000px',
            maxHeight: '850px',
            borderRadius: '24px',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          }}
        >
          {/* Modal Sticky Header */}
          <Box sx={{
            px: { xs: 2.5, md: 4 }, py: 2.5,
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha(colorTheme, 0.1), color: colorTheme, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WorkIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.1rem', md: '1.25rem' }, color: '#0f172a' }}>
                  Post New Role & Attach
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  Publish directly to the FoodNerve Careers database and lock into this article.
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setShowQuickCreateModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Modal Scrollable Body */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2.5, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            
            {/* ═══ 1. HIRING IDENTITY (FULL BLOCK 1 LOGIC) ═══ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. Hiring Identity
              </Typography>
              
              <RadioGroup
                row
                value={hiringEntityType}
                onChange={(e) => setHiringEntityType(e.target.value as any)}
              >
                <FormControlLabel
                  value="my-org"
                  control={<Radio size="small" sx={{ color: colorTheme, '&.Mui-checked': { color: colorTheme } }} />}
                  label={<Typography sx={{ fontSize: '0.88rem', fontWeight: 700 }}>My Organization</Typography>}
                />
                <FormControlLabel
                  value="external"
                  control={<Radio size="small" sx={{ color: colorTheme, '&.Mui-checked': { color: colorTheme } }} />}
                  label={<Typography sx={{ fontSize: '0.88rem', fontWeight: 700 }}>External Organization (Acme, Olam, AFEX...)</Typography>}
                />
              </RadioGroup>

              {hiringEntityType === 'my-org' ? (
                userOrgs.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <PremiumAutocomplete
                      label="Select Your Claimed Organization *"
                      value={userOrgs.find((o) => o.id === selectedMyOrgId)?.name || userOrgs[0].name}
                      options={userOrgs.map((o) => o.name)}
                      onChange={(e, val) => {
                        const matched = userOrgs.find((o) => o.name === val);
                        if (matched) setSelectedMyOrgId(matched.id);
                      }}
                      colorTheme={colorTheme}
                    />
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
                    You have no claimed organizations in your profile. Switch to &ldquo;External Organization&rdquo; to post on behalf of an enterprise or partner.
                  </Alert>
                )
              ) : (
                /* ── FULL EXTERNAL ORG REPLICATION ── */
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 2.5, borderRadius: '18px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <PremiumAutocomplete
                    colorTheme={colorTheme}
                    label="External Organization Name *"
                    options={externalOrgOptions}
                    getOptionLabel={(opt: any) => typeof opt === 'string' ? opt : (opt.name || '')}
                    renderOption={(props, option: any) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
                        <Avatar src={option.logoUrl} sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(colorTheme, 0.1), color: colorTheme, fontSize: '0.8rem', fontWeight: 800 }}>
                          {option.name?.charAt(0) || 'O'}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{option.name}</Typography>
                          {option.state && <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{option.state}, {option.country}</Typography>}
                        </Box>
                      </Box>
                    )}
                    value={externalOrgName}
                    freeSolo
                    loading={isSearchingOrgs}
                    onChange={(e, newValue: any) => {
                      if (typeof newValue === 'string') {
                        setExternalOrgName(newValue);
                        setExternalOrgId(null);
                      } else if (newValue && newValue.id) {
                        setExternalOrgName(newValue.name);
                        setExternalOrgId(newValue.id);
                        if (newValue.logoUrl) setExternalLogoUrl(newValue.logoUrl);
                      }
                    }}
                    onInputChange={(e, val) => handleOrgSearch(val)}
                    placeholder="e.g. Olam Agri, AFEX, Flour Mills of Nigeria"
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <PremiumTextField
                      colorTheme={colorTheme}
                      label="Short Name (Optional)"
                      placeholder="e.g. Olam"
                      value={externalShortName}
                      onChange={(e) => setExternalShortName(e.target.value)}
                    />
                    <PremiumAutocomplete
                      colorTheme={colorTheme}
                      label="Country *"
                      options={countries}
                      getOptionLabel={(opt: any) => opt.name || ''}
                      value={externalCountry}
                      onChange={(e, val) => setExternalCountry(val)}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <PremiumAutocomplete
                      colorTheme={colorTheme}
                      label="State / Province"
                      options={states}
                      getOptionLabel={(opt: any) => opt.name || ''}
                      value={externalState}
                      onChange={(e, val) => setExternalState(val)}
                      disabled={!externalCountry}
                    />
                    <PremiumAutocomplete
                      colorTheme={colorTheme}
                      label="City / LGA"
                      options={cities}
                      getOptionLabel={(opt: any) => opt.name || ''}
                      value={externalLga}
                      onChange={(e, val) => setExternalLga(val)}
                      disabled={!externalState}
                    />
                  </Box>

                  {/* Logo Upload Box */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#475569' }}>Company Logo</Typography>
                    <Box
                      component="label"
                      sx={{
                        borderRadius: '14px',
                        bgcolor: '#fff',
                        border: '2px dashed',
                        borderColor: externalLogoUrl ? colorTheme : '#cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        minHeight: 90,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: alpha(colorTheme, 0.02), borderColor: colorTheme }
                      }}
                    >
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            setExternalLogoFile(file);
                            setExternalLogoUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {externalLogoUrl ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img src={externalLogoUrl} alt="Preview" style={{ height: 48, objectFit: 'contain' }} />
                          <Typography sx={{ fontSize: '0.8rem', color: colorTheme, fontWeight: 700 }}>Click to change logo</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <CloudUploadIcon sx={{ color: '#94a3b8' }} />
                          <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                            Click to upload company logo
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* ═══ 2. ROLE MANDATE & VALUE CHAIN (TAXONOMY LOCKED TO ARTICLE) ═══ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Role Mandate & Value Chain
              </Typography>

              {/* Locked Article Context Banner */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: alpha(colorTheme, 0.04),
                  border: '1px solid',
                  borderColor: alpha(colorTheme, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  flexWrap: 'wrap',
                }}
              >
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: colorTheme, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🔒 Locked Article Taxonomy:
                </Typography>
                {articleCommodity && (
                  <Chip label={`🌾 ${articleCommodity}`} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#fff', border: '1px solid #e2e8f0' }} />
                )}
                {articleCategory && (
                  <Chip label={`🏷️ ${articleCategory}`} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#fff', border: '1px solid #e2e8f0' }} />
                )}
                {articleSubcategory && (
                  <Chip label={`⚡ ${articleSubcategory}`} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#fff', border: '1px solid #e2e8f0' }} />
                )}
              </Paper>

              <PremiumTextField
                colorTheme={colorTheme}
                label="Job Role Title *"
                placeholder="e.g. Senior Cold-Chain Operations Lead"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
              />

              {/* The Only Editable Taxonomy Field */}
              <PremiumAutocomplete
                label="Value Chain Actor / Function *"
                value={newValueChainActor}
                options={VALUE_CHAIN_ACTORS}
                onChange={(e, val: any) => setNewValueChainActor(val || VALUE_CHAIN_ACTORS[0])}
                colorTheme={colorTheme}
              />
            </Box>

            {/* ═══ 3. LOCATION & WORK SETUP ═══ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                3. Work Setup & Geography
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <PremiumTextField
                  colorTheme={colorTheme}
                  label="Location (State / Region) *"
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

            {/* ═══ 4. COMPENSATION & DEADLINE (PREMIUM DATEPICKER) ═══ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                4. Compensation & Deadline
              </Typography>

              {activeCategory === 'volunteer' ? (
                <PremiumTextField
                  colorTheme={colorTheme}
                  label="NervePoints (NP) Escrow Reward"
                  placeholder="e.g. 500 NP"
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

              {/* PREMIUM DATE PICKER */}
              <PremiumDatePicker
                label="Application Deadline (Optional)"
                value={newJobDeadline}
                onChange={(e) => setNewJobDeadline(e.target.value)}
                colorTheme={colorTheme}
              />
            </Box>

            {/* ═══ 5. HOW CANDIDATES APPLY ═══ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                  label={<Typography sx={{ fontSize: '0.88rem', fontWeight: 700 }}>Direct Email</Typography>}
                />
                <FormControlLabel
                  value="external"
                  control={<Radio size="small" sx={{ color: colorTheme, '&.Mui-checked': { color: colorTheme } }} />}
                  label={<Typography sx={{ fontSize: '0.88rem', fontWeight: 700 }}>External Careers Link</Typography>}
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
                  placeholder="https://company.com/careers/lead-123"
                  value={newJobAppUrl}
                  onChange={(e) => setNewJobAppUrl(e.target.value)}
                />
              )}
            </Box>
          </Box>

          {/* Modal Sticky Footer Actions */}
          <Box sx={{
            px: { xs: 2.5, md: 4 }, py: 2,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            display: 'flex', justifyContent: 'flex-end', gap: 2, flexShrink: 0
          }}>
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
              disabled={!newJobTitle.trim() || isCreatingJob || uploadingLogo || (hiringEntityType === 'external' && !externalOrgName.trim())}
              sx={{
                bgcolor: colorTheme,
                color: '#fff',
                fontWeight: 800,
                borderRadius: '12px',
                px: 4,
                py: 1,
                textTransform: 'none',
                '&:hover': { bgcolor: alpha(colorTheme, 0.9) },
              }}
            >
              {isCreatingJob || uploadingLogo ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Publish & Attach 🔗'}
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default EcosystemJobPicker;
