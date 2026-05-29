import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { TENANTS, getTenantConfig } from '@/lib/cms';
import AuthwallGate from '../../components/AuthwallGate';

export function generateStaticParams() {
  const slugs: { bottleneck: string, section: string }[] = [];
  const sections = ['innovations', 'community', 'activities', 'livestreams', 'jobs'];
  
  Object.values(TENANTS).forEach((tenant) => {
    tenant.com.homepage.bottlenecks.forEach((w) => {
      sections.forEach(s => slugs.push({ bottleneck: w.id, section: s }));
    });
  });
  return slugs;
}

const SECTION_ICONS: Record<string, string> = {
  innovations: '◆',
  community: '◎',
  activities: '▲',
  livestreams: '●',
  jobs: '■',
  learn: '✦',
};

export default async function BottleneckSectionPage({ params }: { params: Promise<{ bottleneck: string, section: string }> }) {
  const { bottleneck, section } = await params;
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  
  const bottleneckData = tenant.com.homepage.bottlenecks.find(w => w.id === bottleneck);

  if (!bottleneckData) return null;

  const sectionData = bottleneckData.sections[section as keyof typeof bottleneckData.sections];
  
  const sectionUpdates = bottleneckData.updates
    .filter(u => u.section === section)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sectionIcon = SECTION_ICONS[section] || '◇';

  return (
    <Box sx={{ minHeight: '100vh', pb: 12, pt: { xs: 12, md: 16 } }}>

      {/* ── Internal Section Header ── */}
      <Box sx={{
        mb: 8,
        mx: { xs: 2, md: 0 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        pb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Link href={`/${bottleneck}`} passHref style={{ textDecoration: 'none' }}>
            <Typography sx={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              transition: 'color 0.2s',
              '&:hover': { color: 'white' },
            }}>
              ← {bottleneck}
            </Typography>
          </Link>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            color: 'white',
          }}>
            {sectionIcon}
          </Box>
          <Typography variant="h2" sx={{
            fontWeight: 900,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: 1,
            lineHeight: 1.1,
          }}>
            {(sectionData?.title) || section}
          </Typography>
        </Box>

        <Typography sx={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '1.1rem',
          maxWidth: 800,
          lineHeight: 1.6,
          mt: 2
        }}>
          {sectionData?.content || `All updates, deep dives, and intelligence regarding ${section} in the ${bottleneck} bottleneck.`}
        </Typography>
      </Box>

      {/* ── Updates Feed ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {sectionUpdates.map((update) => (
          <Link
            key={update.id}
            href={update.externalLink || `/${bottleneck}/${section}/${update.id}`}
            passHref
            style={{ textDecoration: 'none' }}
          >
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              p: { xs: 3, md: 4 },
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: 'rgba(255,255,255,0.18)',
                bgcolor: 'rgba(255,255,255,0.05)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              },
            }}>
              {/* Meta Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={section.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    letterSpacing: 1.2,
                    height: 24,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                />
                {update.importance === 'high' && (
                  <Chip
                    label="URGENT"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,60,60,0.12)',
                      color: '#ff6b6b',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      letterSpacing: 1.2,
                      height: 24,
                      border: '1px solid rgba(255,60,60,0.2)',
                    }}
                  />
                )}
                <Typography sx={{
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: 0.8,
                  ml: 'auto',
                }}>
                  {new Date(update.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>

              {/* Title */}
              <Typography sx={{
                fontWeight: 800,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                color: 'white',
                lineHeight: 1.35,
                mb: 1,
              }}>
                {update.title}
              </Typography>

              {/* Summary */}
              <Typography sx={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              }}>
                {update.summary}
              </Typography>
            </Box>
          </Link>
        ))}

        {sectionUpdates.length === 0 && (
          <Box sx={{
            py: 8,
            textAlign: 'center',
            bgcolor: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <Typography sx={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}>
              No recent updates for {section}.
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Locked Content Section ── */}
      {sectionData?.lockedContent && (
        <Box sx={{
          mt: 8,
          bgcolor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
        }}>
          <Box sx={{
            p: { xs: 3, md: 4 },
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.2)',
              }} />
              <Typography sx={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}>
                Restricted Access
              </Typography>
            </Box>
            <Typography sx={{
              fontWeight: 800,
              fontSize: { xs: '1.3rem', md: '1.5rem' },
              color: 'white',
              lineHeight: 1.3,
            }}>
              {sectionData.lockedContent.title}
            </Typography>
          </Box>

          <AuthwallGate>
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              <Typography sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '1rem',
                lineHeight: 1.8,
                mb: 3,
              }}>
                {sectionData.lockedContent.content}
              </Typography>
              <Box
                component="button"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 4,
                  py: 1.5,
                  bgcolor: 'white',
                  color: '#050505',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {sectionData.lockedContent.ctaText}
              </Box>
            </Box>
          </AuthwallGate>
        </Box>
      )}
    </Box>
  );
}
