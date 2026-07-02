import React from 'react';
import { Box, Container, Typography, Chip, Button, Paper, Divider } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { TENANTS, getTenantConfig } from '@/lib/cms';
import { getKnowledgeMaterials, mockKnowledgeData } from '@/lib/db/knowledge';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { PublicArticleViewer } from '@/components/learn/PublicArticleViewer';

export function generateStaticParams() {
  const slugs: { challenge: string, slug: string }[] = [];
  mockKnowledgeData.forEach(m => {
    slugs.push({ challenge: m.challengeId, slug: m.slug });
  });
  return slugs;
}

export default async function ContentPage({ params }: { params: Promise<{ challenge: string, slug: string }> }) {
  const { challenge, slug } = await params;
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food';
  const tenant = getTenantConfig(tenantId);
  
  const challengeData = tenant.com.homepage.challenges.find(w => w.id === challenge);
  const materials = await getKnowledgeMaterials({ tenantId, challengeId: challengeData?.id });
  const material = materials.find(m => m.slug === slug);

  if (!material) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Intelligence not found.</div>;
  }

  // Define the target redirect URL on the .org domain
  // Using hardcoded tenant domain to build the cross-domain link
  const orgDomain = tenantId === 'energy' ? 'energynerve.org' : 'foodnerve.org';
  const redirectUrl = `https://${orgDomain}/academy/${challenge}/${slug}`;
  const loginUrl = `/join?redirect=${encodeURIComponent(redirectUrl)}`;

  const relatedMaterials = materials
    .filter(m => m.slug !== slug)
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 6);

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
        <Link href={`/${challenge}`} passHref style={{ textDecoration: 'none' }}>
          <Typography sx={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            transition: 'color 0.2s',
            '&:hover': { color: 'rgba(255,255,255,0.7)' },
          }}>
            {challenge}
          </Typography>
        </Link>
        <Typography sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', userSelect: 'none' }}>/</Typography>
        <Link href={`/${challenge}/learn`} passHref style={{ textDecoration: 'none' }}>
          <Typography sx={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            transition: 'color 0.2s',
            '&:hover': { color: 'rgba(255,255,255,0.7)' },
          }}>
            KNOWLEDGE
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
          {material.type}
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
        {material.title}
      </Typography>

      {/* ── Meta Data ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 5,
        flexWrap: 'wrap',
      }}>
        <Chip
          label={material.type.toUpperCase()}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.06)',
            color: 'white',
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: '6px',
          }}
        />
        {material.isPremium && (
          <Chip
            label="PREMIUM"
            size="small"
            sx={{
              bgcolor: 'rgba(255,60,60,0.15)',
              color: '#ff6b6b',
              fontWeight: 800,
              letterSpacing: 1,
              borderRadius: '6px',
            }}
          />
        )}
        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: 600 }}>
          {new Date(material.dateAdded).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
        {material.readTime && (
          <>
            <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>•</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>
              {material.readTime}
            </Typography>
          </>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 6 }} />

      {/* ── Main Content Area ── */}
      <PublicArticleViewer material={material} tenant={tenant} loginUrl={loginUrl} themeMode="dark" />

      {/* ── Related Knowledge ── */}
      {relatedMaterials.length > 0 && (
        <Box sx={{ mt: 10 }}>
          <Typography sx={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            mb: 4,
          }}>
            More Intelligence
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}>
            {relatedMaterials.map((related) => (
              <Link
                key={related.slug}
                href={`/${challenge}/learn/${related.slug}`}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip
                      label={related.type.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        height: 20,
                        letterSpacing: 1,
                      }}
                    />
                    {related.isPremium && (
                      <Chip
                        label="PREMIUM"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,60,60,0.1)',
                          color: '#ff6b6b',
                          fontWeight: 700,
                          fontSize: '0.6rem',
                          height: 20,
                          letterSpacing: 1,
                        }}
                      />
                    )}
                  </Box>

                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'white',
                    lineHeight: 1.35,
                    mb: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {related.title}
                  </Typography>

                  <Typography sx={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {related.previewText}
                  </Typography>
                </Box>
              </Link>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
