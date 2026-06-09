"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

export default function ScrollReveal({ children, direction = 'up', delay = 0 }: { children: React.ReactNode, direction?: 'up' | 'left' | 'right', delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    if (direction === 'up') return 'translate(0, 60px)';
    if (direction === 'left') return 'translate(-60px, 0)';
    if (direction === 'right') return 'translate(60px, 0)';
    return 'translate(0, 0)';
  };

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `all 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        width: '100%',
        height: '100%'
      }}
    >
      {children}
    </Box>
  );
}
