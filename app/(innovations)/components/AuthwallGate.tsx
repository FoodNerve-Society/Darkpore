"use client";

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal, Paper } from '@mui/material';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface AuthwallGateProps {
  children: React.ReactNode;
  teaseOnly?: boolean;
}

export default function AuthwallGate({ children, teaseOnly = false }: AuthwallGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Real auth check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => setIsAuthenticated(!!user));
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsAuthenticated(true);
      setIsModalOpen(false);
      // window.location.href = '/society/trade'; // Redirect mock
    } catch (error) {
      console.error("Auth error", error);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* The blurred content trap */}
      <Box 
        sx={{ 
          filter: teaseOnly ? 'blur(0px)' : 'blur(8px)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: teaseOnly ? 1 : 0.4,
          maxHeight: teaseOnly ? 'auto' : '300px'
        }}
      >
        {children}
      </Box>

      {/* The intercept overlay */}
      {!teaseOnly && (
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.8))',
          zIndex: 10
        }}>
          <Button 
            variant="contained" 
            size="large"
            color="primary"
            onClick={() => setIsModalOpen(true)}
            sx={{ boxShadow: 4 }}
          >
            Unlock Details
          </Button>
        </Box>
      )}

      {/* The Auth Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="authwall-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
          textAlign: 'center'
        }}>
          <Typography id="authwall-modal" variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>
            Unlock the Ecosystem
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Log in with Google to view full application details and earn 5 Nerve Points.
          </Typography>
          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={handleLogin}
          >
            Sign in with Google
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
