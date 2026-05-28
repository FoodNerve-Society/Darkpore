import React from 'react';
import { Box, Typography, Chip, Divider } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';

export default async function BottleneckUpdateDetail({ params }: { params: Promise<{ bottleneck: string, section: string, updateId: string }> }) {
  const { bottleneck, section, updateId } = await params;
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  
  const bottleneckData = tenant.com.homepage.bottlenecks.find(w => w.id === bottleneck);
  if (!bottleneckData) return null;

  const update = bottleneckData.updates.find(u => u.id === updateId);

  if (!update) {
    return (
      <Box sx={{ py: 16, textAlign: 'center' }}>
        <Typography sx={{
          fontSize: '3rem',
          fontWeight: 900,
          color: 'white',
          mb: 2,
        }}>
          404
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', mb: 4 }}>
          This update could not be found.
        </Typography>
        <Link href={`/${bottleneck}`} passHref style={{ textDecoration: 'none' }}>
          <Box
            component="span"
            sx={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: 1,
              borderBottom: '1px solid rgba(255,255,255,0.15)',
              pb: 0.5,
              transition: 'all 0.2s',
              '&:hover': { color: 'white', borderColor: 'rgba(255,255,255,0.4)' },
            }}
          >
            ← Return to Master Feed
          </Box>
        </Link>
      </Box>
    );
  }

  // Related updates from the same section (excluding current)
  const sectionUpdates = bottleneckData.updates
    .filter(u => u.section === section)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const currentIndex = sectionUpdates.findIndex(u => u.id === updateId);
  const prevUpdate = currentIndex > 0 ? sectionUpdates[currentIndex - 1] : null;
  const nextUpdate = currentIndex < sectionUpdates.length - 1 ? sectionUpdates[currentIndex + 1] : null;

  const relatedUpdates = sectionUpdates
    .filter(u => u.id !== updateId)
    .slice(0, 8);

  const isGridLayout = section === 'jobs' || section === 'learn';

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', pt: { xs: 14, md: 16 }, pb: 12 }}>

      {/* ── Breadcrumb Navigation ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 5,
        flexWrap: 'wrap',
      }}>
        <Link href={`/${bottleneck}`} passHref style={{ textDecoration: 'none' }}>
          <Typography sx={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            transition: 'color 0.2s',
            '&:hover': { color: 'rgba(255,255,255,0.7)' },
          }}>
            {bottleneck}
          </Typography>
        </Link>
        <Typography sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', userSelect: 'none' }}>/</Typography>
        <Link href={`/${bottleneck}/${section}`} passHref style={{ textDecoration: 'none' }}>
          <Typography sx={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            transition: 'color 0.2s',
            '&:hover': { color: 'rgba(255,255,255,0.7)' },
          }}>
            {section}
          </Typography>
        </Link>
        <Typography sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', userSelect: 'none' }}>/</Typography>
        <Typography sx={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          Update
        </Typography>
      </Box>

      {/* ── Title ── */}
      <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          color: 'white',
          fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          mb: 4,
        }}
      >
        {update.title}
      </Typography>

      {/* ── Meta Row ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
        <Chip
          label={update.section.toUpperCase()}
          sx={{
            bgcolor: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: 1.5,
            height: 26,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        {update.importance === 'high' && (
          <Chip
            label="URGENT"
            sx={{
              bgcolor: 'rgba(255,60,60,0.12)',
              color: '#ff6b6b',
              fontWeight: 800,
              fontSize: '0.65rem',
              letterSpacing: 1.5,
              height: 26,
              border: '1px solid rgba(255,60,60,0.2)',
            }}
          />
        )}
        <Box sx={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.15)',
          mx: 0.5,
        }} />
        <Typography sx={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: 0.5,
        }}>
          {new Date(update.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
      </Box>

      {/* ── Divider ── */}
      <Divider sx={{
        borderColor: 'rgba(255,255,255,0.06)',
        mb: 6,
      }} />

      {/* ── Content Area ── */}
      <Box sx={{
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        p: { xs: 3, sm: 4, md: 6 },
      }}>
        {/* Lead Paragraph */}
        <Typography sx={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: { xs: '1.15rem', md: '1.3rem' },
          fontWeight: 500,
          lineHeight: 1.7,
          mb: 4,
        }}>
          {update.summary}
        </Typography>

        {/* Body */}
        <Typography sx={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: '0.95rem',
          lineHeight: 1.85,
          mb: 2,
        }}>
          Detailed intelligence reports, field data, and operational execution plans regarding this update
          are currently restricted. Society OS members with appropriate clearance can access full blueprints,
          deployment timelines, and strategic analysis below.
        </Typography>

        <Typography sx={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.95rem',
          lineHeight: 1.85,
        }}>
          This document contains proprietary methodologies, partner agreements, and resource allocation
          data that require authenticated access. Unlock the full report to explore the complete
          operational framework.
        </Typography>
      </Box>

      {/* ── Restricted Access Card ── */}
      <Box sx={{
        mt: 6,
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Subtle top accent line */}
        <Box sx={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
        }} />

        <Box sx={{ p: { xs: 4, md: 5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
            mb: 1.5,
            lineHeight: 1.3,
          }}>
            Full Operational Data
          </Typography>

          <Typography sx={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            mb: 4,
            maxWidth: 480,
          }}>
            Complete deployment data, strategic analysis, and execution frameworks require
            an active Society membership.
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
                boxShadow: '0 4px 20px rgba(255,255,255,0.1)',
              },
            }}
          >
            Authenticate via Society OS
          </Box>
        </Box>
      </Box>

      {/* ── Prev / Next Navigation ── */}
      <Box sx={{
        mt: 8,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        pt: 4,
      }}>
        {prevUpdate ? (
          <Link href={`/${bottleneck}/${section}/${prevUpdate.id}`} passHref style={{ textDecoration: 'none', flex: 1, maxWidth: '48%' }}>
            <Box sx={{
              p: 3,
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'rgba(255,255,255,0.15)', transform: 'translateY(-1px)' },
            }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', mb: 1 }}>
                ← Previous
              </Typography>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {prevUpdate.title}
              </Typography>
            </Box>
          </Link>
        ) : <Box sx={{ flex: 1 }} />}

        {nextUpdate ? (
          <Link href={`/${bottleneck}/${section}/${nextUpdate.id}`} passHref style={{ textDecoration: 'none', flex: 1, maxWidth: '48%' }}>
            <Box sx={{
              p: 3,
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              textAlign: 'right',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'rgba(255,255,255,0.15)', transform: 'translateY(-1px)' },
            }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', mb: 1 }}>
                Next →
              </Typography>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {nextUpdate.title}
              </Typography>
            </Box>
          </Link>
        ) : <Box sx={{ flex: 1 }} />}
      </Box>

      {/* ── Related Updates: Marquee (default) or Grid (jobs/learn) ── */}
      {relatedUpdates.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography sx={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            mb: 3,
          }}>
            More from {section}
          </Typography>

          {isGridLayout ? (
            /* 3-column grid for jobs & knowledge */
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2,
            }}>
              {relatedUpdates.slice(0, 6).map((related) => (
                <Link
                  key={related.id}
                  href={related.externalLink || `/${bottleneck}/${section}/${related.id}`}
                  passHref
                  style={{ textDecoration: 'none' }}
                >
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    p: 3,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    height: '100%',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.15)',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      transform: 'translateY(-2px)',
                    },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      {related.importance === 'high' && (
                        <Chip label="URGENT" size="small" sx={{ bgcolor: 'rgba(255,60,60,0.1)', color: '#ff6b6b', fontWeight: 700, fontSize: '0.6rem', height: 20, letterSpacing: 1 }} />
                      )}
                      <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontWeight: 600, ml: 'auto' }}>
                        {new Date(related.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', lineHeight: 1.35, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {related.title}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {related.summary}
                    </Typography>
                  </Box>
                </Link>
              ))}
            </Box>
          ) : (
            /* Marquee scroll for innovations, community, activities, livestreams */
            <Box sx={{ overflow: 'hidden' }}>
              <Box sx={{
                display: 'flex',
                animation: 'relatedMarquee 35s linear infinite',
                '&:hover': { animationPlayState: 'paused' },
                '@keyframes relatedMarquee': {
                  '0%': { transform: 'translateX(0)' },
                  '100%': { transform: 'translateX(-50%)' },
                },
                width: 'max-content',
              }}>
                {[...relatedUpdates, ...relatedUpdates].map((related, idx) => (
                  <Link
                    key={`${related.id}-${idx}`}
                    href={related.externalLink || `/${bottleneck}/${section}/${related.id}`}
                    passHref
                    style={{ textDecoration: 'none', flexShrink: 0 }}
                  >
                    <Box sx={{
                      width: 300,
                      mr: 2,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '14px',
                      p: 3,
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.15)',
                        bgcolor: 'rgba(255,255,255,0.05)',
                      },
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        {related.importance === 'high' && (
                          <Chip label="URGENT" size="small" sx={{ bgcolor: 'rgba(255,60,60,0.1)', color: '#ff6b6b', fontWeight: 700, fontSize: '0.6rem', height: 20, letterSpacing: 1 }} />
                        )}
                        <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontWeight: 600, ml: 'auto' }}>
                          {new Date(related.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', lineHeight: 1.35, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {related.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {related.summary}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
