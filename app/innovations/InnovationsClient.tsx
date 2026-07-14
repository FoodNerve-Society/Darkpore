"use client";
import { Button, Typography, Box } from '@mui/material';

export default function InnovationsClient({ tenantId }: { tenantId: string }) {
  const isEnergy = tenantId === 'energynerve';
  const title = isEnergy ? 'Energy Nerve Innovations' : 'FoodNerve Innovations';
  const themeColor = isEnergy ? 'warning' : 'primary';
  const welcomeText = isEnergy 
    ? 'Welcome to the Energy sector moonshot matrix (.com).' 
    : 'Welcome to the Agricultural moonshot matrix (.com).';

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Tenant ID detected from Middleware: <strong>{tenantId}</strong>
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {welcomeText}
      </Typography>
      <Button variant="contained" color={themeColor as any}>
        Explore Moonshots
      </Button>
    </Box>
  );
}
