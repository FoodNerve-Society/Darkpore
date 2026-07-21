'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import { useParams } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import UserCommandContainer from '@/components/profile/UserCommandContainer';
import OrgCommandContainer from '@/components/profile/OrgCommandContainer';

export default function CommandCenterLayout() {
  const { profile, activeOrg } = useSociety();
  const params = useParams();
  const tenant = params.tenant as string;
  
  const [activeView, setActiveView] = useState<'split' | 'user' | 'org'>('split');

  const isOrgEmpty = !activeOrg;
  const effectiveView = isOrgEmpty ? 'user' : activeView;

  if (!profile) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#3b82f6' }} /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 2, md: 4 }, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, flex: 1, minHeight: 0 }}>
        
        {/* USER CONTAINER */}
        <Box 
          sx={{ 
            flex: effectiveView === 'split' ? 1 : (effectiveView === 'user' ? 9 : 0.5),
            transition: 'flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <UserCommandContainer 
            tenant={tenant}
            username={profile.username || profile.id || profile.uid} 
            isActive={effectiveView === 'user'} 
            isCollapsed={effectiveView === 'org'}
            onActivate={() => setActiveView(effectiveView === 'user' ? (isOrgEmpty ? 'user' : 'split') : 'user')} 
          />
        </Box>

        {/* ORG CONTAINER */}
        <Box 
          sx={{ 
            flex: effectiveView === 'split' ? 1 : (effectiveView === 'org' ? 9 : 0.5),
            transition: 'flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <OrgCommandContainer 
            tenant={tenant}
            slug={activeOrg?.slug || null} 
            isActive={effectiveView === 'org'} 
            isCollapsed={effectiveView === 'user'}
            onActivate={() => {
              if (isOrgEmpty) return; // Cannot open if no org
              setActiveView(effectiveView === 'org' ? 'split' : 'org');
            }} 
          />
        </Box>

      </Box>
    </Box>
  );
}
