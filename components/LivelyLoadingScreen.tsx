"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { transform: scale(0.98); box-shadow: 0 10px 25px rgba(15, 36, 20, 0.05); }
  50% { transform: scale(1.02); box-shadow: 0 20px 45px rgba(15, 36, 20, 0.15); }
  100% { transform: scale(0.98); box-shadow: 0 10px 25px rgba(15, 36, 20, 0.05); }
`;

const LivelyLoadingScreen = () => {
  const [loadingMessage, setLoadingMessage] = useState("");
  const [gatewayText, setGatewayText] = useState("Initializing Ecosystem");

  useEffect(() => {
    // Determine the environment text based on the hostname
    const hostname = window.location.hostname;
    if (hostname.includes('.org')) {
      setGatewayText("Ecosystem Core");
    } else {
      setGatewayText("Abridged Gateway");
    }
    setLoadingMessage(hostname.includes('.org') ? "Ecosystem Core" : "Abridged Gateway");

    // If the loading screen stays mounted, update the user on what is taking so long
    const timer1 = setTimeout(() => setLoadingMessage("Authenticating Identity..."), 3000);
    const timer2 = setTimeout(() => setLoadingMessage("Syncing Ecosystem Profiles..."), 6000);
    const timer3 = setTimeout(() => setLoadingMessage("Waking up Database..."), 10000);
    const timer4 = setTimeout(() => setLoadingMessage("Taking longer than usual. Check connection..."), 15000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: '#f8faf8',
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          px: { xs: 3, md: 4 },
          pt: { xs: 8, md: 10 },
          pb: { xs: 3, md: 4 },
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          animation: `${pulse} 1.5s ease-in-out infinite`,
          minWidth: { xs: '180px', md: '220px' },
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-dosis), Dosis, sans-serif',
            fontWeight: 900,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textAlign: 'left',
            // Shimmer effect on text
            background: 'linear-gradient(90deg, #0f2414 0%, #4caf50 50%, #0f2414 100%)',
            backgroundSize: '200% auto',
            color: 'transparent',
            WebkitBackgroundClip: 'text',
            animation: `${shimmer} 1.5s linear infinite`,
          }}
        >
          FOOD
          <br />
          NERVE
        </Typography>

        <Typography
          variant="overline"
          sx={{
            fontFamily: 'var(--font-dosis), Dosis, sans-serif',
            fontWeight: 800,
            fontSize: { xs: '1rem', md: '1.2rem' },
            color: '#d97706',
            letterSpacing: '4px',
            lineHeight: 1,
            mt: 2,
            textAlign: 'left',
          }}
        >
          SOCIETY
        </Typography>
      </Box>

      <Box sx={{ mt: 6, minHeight: '2rem', display: 'flex', justifyContent: 'center' }}>
        <Typography
          key={loadingMessage} // Changing key triggers the animation again
          variant="overline"
          sx={{
            fontWeight: 600,
            color: 'rgba(15, 36, 20, 0.5)',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            animation: 'fadeInUp 0.5s ease-out forwards',
            opacity: 0,
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(8px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          {loadingMessage}
        </Typography>
      </Box>
    </Box>
  );
};

export default LivelyLoadingScreen;
