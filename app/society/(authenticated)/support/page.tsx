'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import HandshakeIcon from '@mui/icons-material/Handshake';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface Initiative {
  id: string;
  title: string;
  category: string;
  desc: string;
  raised: number;
  goal: number;
  unit: string;
  needs: string[];
}

const INITIAL_INITIATIVES: Initiative[] = [
  {
    id: 'coldroom',
    title: 'Decentralized Solar Cold Rooms',
    category: 'Infrastructure',
    desc: 'Deploy solar-powered cold storage units in market hubs to preserve tomato and vegetable yields, cutting post-harvest waste.',
    raised: 35,
    goal: 50,
    unit: 'rooms',
    needs: ['Solar panels', 'Compressors', 'Insulation boards', 'Funding'],
  },
  {
    id: 'drone',
    title: 'Northern Soil Hyperspectral Mapping',
    category: 'Intelligence',
    desc: 'Fund hyperspectral drone analysis flights across wheat-growing fields to generate soil maps for optimal fertilizer use.',
    raised: 7500,
    goal: 10000,
    unit: 'hectares',
    needs: ['Drone pilots', 'Spectrometers', 'Data analysis servers', 'Funding'],
  },
  {
    id: 'grants',
    title: 'Agritech Tool Developer Grants',
    category: 'Software',
    desc: 'Deploy mini-grants (via Nerve Points or cash) to local developers creating open-source API utilities for market integration.',
    raised: 12000,
    goal: 25000,
    unit: 'USD',
    needs: ['Software engineers', 'Mentors', 'Hosting credits', 'Funding'],
  },
];

export default function SupportPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>(INITIAL_INITIATIVES);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [supportType, setSupportType] = useState('funding');
  const [supportAmount, setSupportAmount] = useState('');
  const [supportDetail, setSupportDetail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenSupport = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
    setSupportType('funding');
    setSupportAmount('');
    setSupportDetail('');
    setSuccessMsg('');
  };

  const handleCloseSupport = () => {
    setSelectedInitiative(null);
  };

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInitiative) return;

    // Perform support update
    const updated = initiatives.map((ini) => {
      if (ini.id === selectedInitiative.id && supportType === 'funding') {
        const val = parseFloat(supportAmount) || 0;
        return {
          ...ini,
          raised: Math.min(ini.goal, ini.raised + val),
        };
      }
      return ini;
    });

    setInitiatives(updated);
    setSuccessMsg(
      supportType === 'funding'
        ? `Successfully pledged $${supportAmount} to support the ${selectedInitiative.title} initiative!`
        : `Thank you for pledging your resources: "${supportDetail}" to support this initiative!`
    );

    setTimeout(() => {
      handleCloseSupport();
    }, 3000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
          Support Society Initiatives
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640 }}>
          Back critical Food Nerve projects. Sponsoring can range from financial pledges to direct hardware contributions, transport resources, or expert labor.
        </Typography>
      </Box>

      {successMsg && (
        <Alert severity="success" icon={<FavoriteIcon />} sx={{ mb: 4, borderRadius: 3 }}>
          {successMsg}
        </Alert>
      )}

      <Grid container spacing={4}>
        {initiatives.map((ini) => {
          const pct = Math.round((ini.raised / ini.goal) * 100);
          return (
            <Grid item xs={12} md={6} lg={4} key={ini.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={ini.category.toUpperCase()}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      {pct}% Backed
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.3 }}>
                    {ini.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6, flexGrow: 1 }}>
                    {ini.desc}
                  </Typography>

                  {/* Progress bar */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 600 }}>
                        Pledge Status
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
                        {ini.raised.toLocaleString()} / {ini.goal.toLocaleString()} {ini.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.05)' }}
                    />
                  </Box>

                  {/* Critical Hardware / Resource Needs */}
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.4)', fontWeight: 800, letterSpacing: 1, mb: 1.2 }}>
                      IMMEDIATE HARDWARE/RESOURCE PLEDGES:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {ini.needs.map((need, index) => (
                        <Chip
                          key={index}
                          label={need}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(0,0,0,0.03)',
                            border: '1px solid rgba(0,0,0,0.06)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleOpenSupport(ini)}
                    startIcon={<HandshakeIcon />}
                    sx={{
                      py: 1.2,
                      fontWeight: 800,
                      borderRadius: 2,
                      boxShadow: 'none',
                    }}
                  >
                    Contribute Resources
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Support Dialog */}
      <Dialog
        open={Boolean(selectedInitiative)}
        onClose={handleCloseSupport}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 4, p: 2 },
        }}
      >
        {selectedInitiative && (
          <form onSubmit={handleSubmitSupport}>
            <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
              Support: {selectedInitiative.title}
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Help complete the launch of this agritech blueprint by contributing direct cash flow or donating critical equipment.
              </Typography>

              <TextField
                select
                fullWidth
                label="Support Type"
                value={supportType}
                onChange={(e) => setSupportType(e.target.value)}
                sx={{ mb: 3 }}
              >
                <MenuItem value="funding">💵 Financial Pledge (USD)</MenuItem>
                <MenuItem value="resources">🚜 Hardware / Tools Contribution</MenuItem>
                <MenuItem value="labor">🛠️ Skill / Labor Sponsoring</MenuItem>
              </TextField>

              {supportType === 'funding' ? (
                <TextField
                  fullWidth
                  type="number"
                  label="Pledge Amount (USD)"
                  required
                  value={supportAmount}
                  onChange={(e) => setSupportAmount(e.target.value)}
                  placeholder="Enter amount..."
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, fontWeight: 700 }}>$</Typography>,
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Pledge Details"
                  required
                  value={supportDetail}
                  onChange={(e) => setSupportDetail(e.target.value)}
                  placeholder={
                    supportType === 'resources'
                      ? 'Specify tools, solar panels, transportation, or cold room parts you wish to send...'
                      : 'Specify what skills or labor hours you wish to commit...'
                  }
                />
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleCloseSupport} color="inherit" sx={{ fontWeight: 700 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" sx={{ fontWeight: 800, borderRadius: 2 }}>
                Confirm Pledge
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </Box>
  );
}
