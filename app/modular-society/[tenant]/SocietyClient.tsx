"use client";
import { Button, Typography, Box } from '@mui/material';

export default function SocietyClient({ tenantId }: { tenantId: string }) {
  const isEnergy = tenantId === 'energynerve';
  const title = isEnergy ? 'Energy Nerve Society' : 'FoodNerve Society';
  const themeColor = isEnergy ? 'warning' : 'secondary';

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Tenant ID detected from Middleware: <strong>{tenantId}</strong>
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Welcome to the public operational dashboard (.org). Feel free to browse!
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, fontStyle: 'italic', color: 'gray' }}>
        Note: The silent redirect only kicks in if you log in and try to access the secure area without '{tenantId}' access in your database profile!
      </Typography>
      <Button variant="contained" color={themeColor as any}>
        Enter Secure Dashboard
      </Button>
    </Box>
  );
}
