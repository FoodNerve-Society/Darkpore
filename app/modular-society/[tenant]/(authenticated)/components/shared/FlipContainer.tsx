'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

interface FlipContainerProps {
  isFlipped: boolean;
  frontContent: ReactNode;
  backContent: ReactNode;
}

export default function FlipContainer({ isFlipped, frontContent, backContent }: FlipContainerProps) {
  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        perspective: '2000px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component={motion.div}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        sx={{
          flex: 1,
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* FRONT */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: isFlipped ? 0 : 1,
          }}
        >
          {frontContent}
        </Box>

        {/* BACK */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: isFlipped ? 1 : 0,
          }}
        >
          {backContent}
        </Box>
      </Box>
    </Box>
  );
}
