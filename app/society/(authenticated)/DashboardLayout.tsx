"use client";

import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Avatar, Badge, IconButton } from '@mui/material';
import { useSociety } from '@/context/SocietyContext';
import Link from 'next/link';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const drawerWidth = 260;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useSociety();

  if (loading) return <Box p={4}>Loading Ecosystem Engine...</Box>;

  return (
    <Box sx={{ display: 'flex' }}>
      
      {/* Top App Bar */}
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Townhall
          </Typography>

          <Box display="flex" alignItems="center" gap={3}>
            {/* Live Nerve Points Wallet */}
            <Box sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', px: 2, py: 0.5, borderRadius: 5, fontWeight: 'bold' }}>
              {profile?.nervePoints || 0} Nerves
            </Box>

            {/* Flashing Updates Bell */}
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { animation: 'pulse 2s infinite' }}}>
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Avatar */}
            <Avatar />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Left Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0,0,0,0.05)',
            bgcolor: 'background.default'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="900" color="primary">Society OS</Typography>
        </Box>
        <List sx={{ px: 2 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={Link} href="/trade" sx={{ borderRadius: 2 }}>
              <ListItemIcon><HandshakeIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Trade" primaryTypographyProps={{ fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={Link} href="/meet" sx={{ borderRadius: 2 }}>
              <ListItemIcon><ContactsIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Meet" primaryTypographyProps={{ fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={Link} href="/learn" sx={{ borderRadius: 2 }}>
              <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Learn" primaryTypographyProps={{ fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>

          {/* Support Tab */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={Link} href="/support" sx={{ borderRadius: 2 }}>
              <ListItemIcon><AttachMoneyIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Support" primaryTypographyProps={{ fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        {children}
      </Box>

    </Box>
  );
}
