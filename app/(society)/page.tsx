"use client";

import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Avatar, Chip } from '@mui/material';
import { useSociety } from '@/context/SocietyContext';

export default function TownhallPage() {
  const { profile, loading } = useSociety();

  if (loading || !profile) return null; // Loading handled by layout

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome back to the Factory Floor.
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Based on your Wahaalas ({profile.wahaalas.join(', ')}), here is your localized feed.
      </Typography>

      {/* Initiatives Banner */}
      <Card sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', borderRadius: 4, mb: 4 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 4 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              🔥 Active Initiative: Campus Tree Planting
            </Typography>
            <Typography variant="body1">
              Upload proof of planting a tree in your local university campus to earn 50 Nerve Points.
            </Typography>
          </Box>
          <Button variant="contained" color="secondary" sx={{ fontWeight: 'bold' }}>
            Upload Proof
          </Button>
        </CardContent>
      </Card>

      {/* Algorithmic Feed */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Your Deal Feed
      </Typography>
      <Grid container spacing={3}>
        
        {/* Mock Feed Item 1 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Chip label="Flash Sale" color="error" size="small" />
                <Typography variant="caption" color="text.secondary">2 mins ago</Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                2 Tons of Tomatoes - Lagos (Discounted)
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Vendor looking to offload immediately to avoid post-harvest loss. Pick up at Mile 12.
              </Typography>
              <Button variant="outlined" fullWidth>Claim Deal</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Mock Feed Item 2 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Chip label="New in Rolodex" color="primary" size="small" />
                <Typography variant="caption" color="text.secondary">1 hr ago</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">SolarFreeze Logistics</Typography>
                  <Typography variant="caption" color="text.secondary">Cold Chain • Abuja</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                A new cold-chain rider just joined the network near your operations.
              </Typography>
              <Button variant="outlined" fullWidth>Connect on WhatsApp</Button>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}
