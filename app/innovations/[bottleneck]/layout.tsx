import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import ClientBottleneckHero from '../components/ClientBottleneckHero';
export default async function BottleneckLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ bottleneck: string }>;
}) {
  const { bottleneck } = await params;
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  
  const bottleneckData = tenant.com.homepage.bottlenecks.find(w => w.id === bottleneck);

  if (!bottleneckData) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'white', backgroundColor: '#050505', minHeight: '100vh' }}>Bottleneck not found.</div>;
  }

  const highPriorityUpdates = bottleneckData.updates.filter(u => u.importance === 'high');

  return (
    <Box sx={{ minHeight: '100vh', pb: 15, bgcolor: '#050505', color: 'white' }}>
      
      {/* ═══════════════════════════════════════════════════════════
          DYNAMIC PREMIUM HERO
      ═══════════════════════════════════════════════════════════ */}
      <ClientBottleneckHero bottleneckData={bottleneckData} />

      {/* ═══════════════════════════════════════════════════════════
          DYNAMIC CONTENT AREA
      ═══════════════════════════════════════════════════════════ */}
      <Container maxWidth="lg">
        {children}
      </Container>
      
    </Box>
  );
}
