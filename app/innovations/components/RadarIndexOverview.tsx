'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';

const HEADER_HEIGHT = 64;

const SECTIONS = [
  { id: 'challenges', target: 'section-challenges', label: 'The Challenges', num: '01' },
  { id: 'deployments', target: 'section-deployments', label: 'Active Deployments', num: '02' },
  { id: 'knowledge', target: 'section-knowledge', label: 'Knowledge Matrix', num: '03' },
] as const;

export default function RadarIndexOverview() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ─── Stuck detection ───────────────────────────────────────────
  // We place an invisible 0-height sentinel *above* the sticky bar.
  // When it scrolls out of view, the bar is stuck.
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px` }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, []);

  // ─── Section tracking ─────────────────────────────────────────
  // A section becomes active when its top edge crosses the 25% mark
  // from the top of the viewport (i.e. 75% from the bottom).
  useEffect(() => {
    const sectionEls = SECTIONS
      .map(s => ({ id: s.id, el: document.getElementById(s.target) }))
      .filter((s): s is { id: string; el: HTMLElement } => s.el !== null);

    if (sectionEls.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // Build a set of currently-intersecting section ids
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const matched = sectionEls.find(s => s.el === target);
            if (matched) setActiveId(matched.id);
          }
        });
      },
      {
        // The observation window is the top 25% band of the viewport.
        // A section enters this band only when it has scrolled 75%+ into view.
        rootMargin: `${-HEADER_HEIGHT}px 0px -75% 0px`,
        threshold: 0,
      }
    );

    sectionEls.forEach(s => obs.observe(s.el));
    return () => obs.disconnect();
  }, []);

  // ─── Click-to-scroll ──────────────────────────────────────────
  const scrollToSection = useCallback((targetId: string) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT - 60;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  // ─── Progress line width calc ─────────────────────────────────
  const activeIndex = activeId ? SECTIONS.findIndex(s => s.id === activeId) : -1;
  // Progress as fraction: -1 = none, 0 = first, 1 = second, 2 = third
  const progressPercent = activeIndex >= 0
    ? ((activeIndex + 1) / SECTIONS.length) * 100
    : 0;

  return (
    <>
      {/* Invisible sentinel for stuck detection */}
      <Box ref={sentinelRef} sx={{ height: 0, width: '100%', pointerEvents: 'none' }} aria-hidden />

      {/* The actual sticky bar */}
      <Box
        sx={{
          position: 'sticky',
          top: HEADER_HEIGHT,
          zIndex: 50,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          // Outer padding animates to create the pill → full-width morph
          px: isStuck ? 0 : { xs: 2, md: 4 },
          transition: 'padding 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: isStuck ? '100%' : 900,
            borderRadius: isStuck ? 0 : '100px',
            overflow: 'hidden',
            transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
            border: isStuck ? 'none' : '1px solid rgba(0, 230, 118, 0.15)',
            borderBottom: isStuck ? '1px solid rgba(0, 230, 118, 0.15)' : '1px solid rgba(0, 230, 118, 0.15)',
            boxShadow: isStuck
              ? '0 4px 20px rgba(0,0,0,0.8)'
              : '0 10px 30px rgba(0,0,0,0.8)',
          }}
        >
          {/* Glassmorphic background layer */}
          <Box
            sx={{
              position: 'relative',
              background: isStuck ? 'rgba(20, 20, 20, 0.95)' : 'rgba(5, 5, 5, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              py: { xs: 0.75, md: 1 },
              px: { xs: 2, md: 4 },
              transition: 'background 0.45s ease'
            }}
          >
            {/* Progress track line (full width, behind everything) */}
            <Box sx={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '2px',
              bgcolor: 'rgba(255,255,255,0.04)',
              transition: 'background-color 0.45s ease'
            }}>
              <Box sx={{
                height: '100%',
                width: `${progressPercent}%`,
                bgcolor: '#00e676',
                boxShadow: '0 0 12px rgba(0, 230, 118, 0.6)',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </Box>

            {/* Section items */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: { xs: 1, md: 0 },
                overflowX: 'auto',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {SECTIONS.map((sec, idx) => {
                const isActive = activeId === sec.id;
                const isPast = activeIndex > idx;

                return (
                  <Box
                    key={sec.id}
                    onClick={() => scrollToSection(sec.target)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 1, md: 1.5 },
                      cursor: 'pointer',
                      py: 0.5,
                      px: { xs: 1, md: 2 },
                      borderRadius: '40px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      bgcolor: isActive ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
                      '&:hover': {
                        bgcolor: isActive ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255,255,255,0.04)',
                      },
                    }}
                  >
                    {/* Status dot */}
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        flexShrink: 0,
                        bgcolor: isActive ? '#00e676' : isPast ? 'rgba(0, 230, 118, 0.4)' : 'transparent',
                        border: `2px solid ${isActive ? '#00e676' : isPast ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255,255,255,0.2)'}`,
                        boxShadow: isActive ? '0 0 10px rgba(0, 230, 118, 0.7)' : 'none',
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />

                    {/* Number */}
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        color: isActive ? '#00e676' : isPast ? 'rgba(0, 230, 118, 0.5)' : 'rgba(255,255,255,0.3)',
                        fontFamily: 'monospace',
                        letterSpacing: 0,
                        transition: 'color 0.3s',
                        display: { xs: 'none', sm: 'inline' },
                      }}
                    >
                      {sec.num}
                    </Typography>

                    {/* Label */}
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: isActive ? 800 : 600,
                        fontSize: { xs: '0.65rem', md: '0.75rem' },
                        color: isActive ? '#fff' : isPast ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.6)',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s',
                      }}
                    >
                      {sec.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
