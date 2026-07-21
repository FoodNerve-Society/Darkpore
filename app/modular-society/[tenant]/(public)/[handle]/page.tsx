import React from 'react';
import { Box, Typography } from '@mui/material';
import PublicUserProfile from '@/components/profile/PublicUserProfile';
import PublicOrgProfile from '@/components/profile/PublicOrgProfile';

export default function HandleRoute({ params }: { params: { tenant: string, handle: string } }) {
  const { tenant, handle } = params;

  // Next.js params encode '@' as '%40'
  const decodedHandle = decodeURIComponent(handle);

  if (decodedHandle.startsWith('@u-')) {
    const username = decodedHandle.slice(3);
    return <PublicUserProfile username={username} tenant={tenant} />;
  }

  if (decodedHandle.startsWith('@o-')) {
    const slug = decodedHandle.slice(3);
    return <PublicOrgProfile slug={slug} tenant={tenant} />;
  }

  // Not a valid handle prefix
  return (
    <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', flexDirection: 'column' }}>
      <Typography variant="h2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>404</Typography>
      <Typography sx={{ color: '#64748b' }}>Profile not found.</Typography>
    </Box>
  );
}
