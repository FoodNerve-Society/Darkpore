import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import ClientChallengeHero from '../components/ClientChallengeHero';
export default async function ChallengeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ challenge: string }>;
}) {
  const { challenge } = await params;
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  
  console.log('[Layout] Received challenge param:', challenge);
  const challengeData = tenant.com.homepage.challenges.find(w => w.id === challenge);

  if (!challengeData) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'white', backgroundColor: '#050505', minHeight: '100vh' }}>Challenge not found. Param was: {challenge}</div>;
  }


  return (
    <Box sx={{ minHeight: '100vh', pb: 15, bgcolor: '#050505', color: 'white' }}>
      <ClientChallengeHero challengeData={challengeData} />
      {children}
    </Box>
  );
}
