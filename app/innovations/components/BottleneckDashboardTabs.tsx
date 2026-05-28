'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Card, Chip, Button } from '@mui/material';
import Link from 'next/link';
import type { BottleneckUpdate, LearningMaterial } from '@/lib/cms/types';

interface Props {
  bottleneckId: string;
  feedUpdates: BottleneckUpdate[];
  learningMaterials: LearningMaterial[];
}

type TabKey = 'master' | 'innovations' | 'community' | 'activities' | 'livestreams' | 'jobs' | 'intelligence';

const TABS: { key: TabKey; label: string; section?: string }[] = [
  { key: 'master',       label: 'Master Feed' },
  { key: 'innovations',  label: 'Innovations',    section: 'innovations' },
  { key: 'community',    label: 'Community',       section: 'community' },
  { key: 'activities',   label: 'Activities',      section: 'activities' },
  { key: 'livestreams',  label: 'Livestreams',     section: 'livestreams' },
  { key: 'jobs',         label: 'Jobs & Earn',     section: 'jobs' },
  { key: 'intelligence', label: 'Intelligence' },
];

const VISIBLE_COUNT = 10;

function FadeOverlay() {
  return (
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to bottom, transparent, #050505)', pointerEvents: 'none', zIndex: 2 }} />
  );
}

function ContinueButton({ href, label }: { href: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, position: 'relative', zIndex: 3 }}>
      <Link href={href} passHref style={{ textDecoration: 'none' }}>
        <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '60px', px: 5, py: 1.5, fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.04)', '&:hover': { borderColor: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)' } }}>
          {label}
        </Button>
      </Link>
    </Box>
  );
}

function UpdateCard({ update, bottleneckId }: { update: BottleneckUpdate; bottleneckId: string }) {
  return (
    <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', transition: 'all 0.35s', '&:hover': { transform: 'translateX(6px)', borderColor: 'rgba(255,255,255,0.18)', bgcolor: 'rgba(255,255,255,0.055)' } }}>
      <Link href={`/${bottleneckId}/${update.section}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {update.importance === 'high' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ff4444' }} />
                  <Typography sx={{ color: '#ff4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1 }}>URGENT</Typography>
                </Box>
              )}
              <Chip label={update.section.toUpperCase()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 800, fontSize: '0.65rem' }} />
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 500 }}>
              {new Date(update.date).toLocaleDateString()}
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 1.5 }}>{update.title}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', mb: 3 }}>{update.summary}</Typography>
        </Box>
      </Link>
    </Card>
  );
}

function MaterialCard({ material, bottleneckId }: { material: LearningMaterial; bottleneckId: string }) {
  return (
    <Link href={`/${bottleneckId}/learn/${material.slug}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
      <Box sx={{ display: 'flex', gap: 3, p: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, transition: 'all 0.35s', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', transform: 'translateX(6px)' } }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: '#60a5fa', fontWeight: 800, fontSize: '0.6rem', mb: 0.5 }}>{material.type.toUpperCase()}</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'white' }}>{material.title}</Typography>
        </Box>
      </Box>
    </Link>
  );
}

export default function BottleneckDashboardTabs({ bottleneckId, feedUpdates, learningMaterials }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('master');

  const currentItems = useMemo(() => {
    if (activeTab === 'master') return feedUpdates;
    if (activeTab === 'intelligence') return []; // Handled separately
    const tab = TABS.find((t) => t.key === activeTab);
    if (!tab) return [];
    return feedUpdates.filter((u) => u.section === tab.section);
  }, [activeTab, feedUpdates]);

  const activeTabObj = TABS.find(t => t.key === activeTab);

  return (
    <Box>
      {/* Tab Bar - Sticky */}
      <Box sx={{ position: 'sticky', top: { xs: 64, md: 76 }, zIndex: 100, backdropFilter: 'blur(24px)', background: 'rgba(5,5,5,0.75)', borderBottom: '1px solid rgba(255,255,255,0.06)', mb: 5, mx: { xs: -2, md: -3 }, px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', gap: 1, py: 1.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                type="button"
                key={tab.key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(tab.key);
                }}
                style={{
                  padding: '8px 20px', cursor: 'pointer', borderRadius: '12px', whiteSpace: 'nowrap',
                  fontWeight: 700, fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                  transition: 'all 0.3s', position: 'relative', flexShrink: 0
                }}
              >
                {tab.label}
                {isActive && <div style={{ position: 'absolute', bottom: '-6px', left: '20%', right: '20%', height: '2px', background: 'white' }} />}
              </button>
            );
          })}
        </Box>
      </Box>

      {/* Content */}
      <Box>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: 3, mb: 1, display: 'block' }}>
          {activeTab === 'intelligence' ? 'KNOWLEDGE CENTER' : 'LATEST INTELLIGENCE'}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: 'white' }}>
          {activeTabObj?.label}
        </Typography>

        {activeTab === 'intelligence' ? (
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {learningMaterials.slice(0, VISIBLE_COUNT).map((m) => <MaterialCard key={m.slug} material={m} bottleneckId={bottleneckId} />)}
              {learningMaterials.length === 0 && <Typography sx={{ p: 6, textAlign: 'center', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>No learning materials available yet.</Typography>}
            </Box>
            {learningMaterials.length > VISIBLE_COUNT && <FadeOverlay />}
            <ContinueButton href={`/${bottleneckId}/learn`} label="View Knowledge Center →" />
          </Box>
        ) : (
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {currentItems.slice(0, VISIBLE_COUNT).map((u) => <UpdateCard key={u.id} update={u} bottleneckId={bottleneckId} />)}
              {currentItems.length === 0 && <Typography sx={{ p: 6, textAlign: 'center', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>No updates available in this section yet.</Typography>}
            </Box>
            {currentItems.length > VISIBLE_COUNT && <FadeOverlay />}
            {activeTabObj?.section && <ContinueButton href={`/${bottleneckId}/${activeTabObj.section}`} label={`Continue in ${activeTabObj.label} →`} />}
          </Box>
        )}
      </Box>
    </Box>
  );
}
