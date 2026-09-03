// @ts-nocheck
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  alpha,
  Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSociety } from '@/context/SocietyContext';

interface Props {
  onClose?: () => void;
}

const SECTORS = [
  'Agricultural Logistics & Cold Chain',
  'Grain Aggregation & Processing',
  'Input Supply & Mechanization',
  'Agro-Fintech & Venture Capital',
  'Export & Commodity Trading',
  'Livestock & Poultry Management',
  'Agronomy Research & Extension Services',
];

export default function CreateOrgBackstage({ onClose }: Props) {
  const { profile } = useSociety();

  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setOrgName(name);
    // Auto-generate slug
    const generated = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generated);
  };

  const handleCreate = async () => {
    if (!orgName.trim() || !slug.trim()) {
      setToastMsg('Please enter an organization name and handle.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setToastMsg('Organization workspace initialized! Ready for team onboarding.');
      if (onClose) {
        setTimeout(onClose, 1200);
      }
    }, 800);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* HEADER */}
      <Box sx={{ p: { xs: 2, md: 4 }, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Create Organization
        </Typography>
        {onClose && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onClose} sx={{ borderRadius: '12px', fontWeight: 700, borderColor: 'rgba(0,0,0,0.1)' }}>
            Cancel
          </Button>
        )}
      </Box>

      {/* FORM BODY */}
      <Box sx={{ p: { xs: 2, md: 4 }, flex: 1, overflowY: 'auto' }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '24px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', maxWidth: 680, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              variant="rounded"
              sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
            >
              <RocketLaunchIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>
                Establish New Enterprise Entity
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                Create a corporate organization to post job listings, aggregate trade lots, and manage team permissions.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Organization Legal / Trading Name *"
              value={orgName}
              onChange={handleNameChange}
              fullWidth
              size="small"
              placeholder="e.g. Sahel Cold Chain Logistics"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              label="Organization Public Handle *"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              fullWidth
              size="small"
              helperText={`Public URL will be: /@o-${slug || 'handle'}`}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              select
              label="Primary Sector / Domain *"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            >
              {SECTORS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Official Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                size="small"
                fullWidth
                placeholder="https://sahelcold.com"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Corporate Contact Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                fullWidth
                placeholder="operations@sahelcold.com"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>

            <TextField
              label="Organization Mission & Value Chain Mandate"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Brief summary of your operations, facilities, and regional coverage..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
              <Button
                variant="contained"
                disabled={isSubmitting}
                onClick={handleCreate}
                sx={{
                  bgcolor: '#10b981',
                  color: '#ffffff',
                  borderRadius: '12px',
                  fontWeight: 800,
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#059669' },
                }}
              >
                {isSubmitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Launch Organization Workspace'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* SNACKBAR FEEDBACK */}
      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setToastMsg(null)} severity="success" sx={{ width: '100%', borderRadius: '12px', fontWeight: 700 }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
