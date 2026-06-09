import React from 'react';
import { Box, Container, Typography, Chip, Button, Paper, Divider } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { TENANTS, getTenantConfig } from '@/lib/cms';
import { getKnowledgeMaterials, mockKnowledgeData } from '@/lib/db/knowledge';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

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
      <Box sx={{
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        p: { xs: 3, md: 6 },
        position: 'relative',
      }}>
        {/* Render Preview */}
        <Typography sx={{ 
          fontSize: '1.25rem',
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 400,
          mb: 5,
        }}>
          {material.previewText}
        </Typography>

        {/* Render Full Content if not premium */}
        {material.type === 'video' && !material.isPremium && (
          <Box sx={{ position: 'relative', pt: '56.25%', mb: 4, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <iframe 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src={`https://www.youtube.com/embed/${material.fullContent}`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </Box>
        )}

        {material.type === 'article' && !material.isPremium && (
          <Typography sx={{ 
            fontSize: '1.05rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.6)',
            whiteSpace: 'pre-line',
          }}>
            {material.fullContent}
          </Typography>
        )}

        {/* ── Restricted Access Gate ── */}
        {material.isPremium && (
          <Box sx={{ position: 'relative', mt: 4 }}>
            {/* Fake faded content */}
            <Typography sx={{ 
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.3)',
              whiteSpace: 'pre-line',
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
              pointerEvents: 'none',
              filter: 'blur(1px)',
            }}>
              {material.fullContent?.substring(0, 800) || 'Premium intelligence blueprint content goes here...'}
            </Typography>

            <Box sx={{
              position: 'absolute',
              top: '10%',
              left: 0,
              right: 0,
              bgcolor: 'rgba(10,10,10,0.85)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              px: { xs: 3, md: 6 },
              py: 8,
              textAlign: 'center',
              borderRadius: 4,
            }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 3,
              }}>
                <LockOutlinedIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography sx={{
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 800,
                mb: 2,
                letterSpacing: -0.5,
              }}>
                Restricted Access
              </Typography>
              <Typography sx={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1rem',
                lineHeight: 1.6,
                maxWidth: 480,
                mx: 'auto',
                mb: 5,
              }}>
                This blueprint is classified. You must be an authenticated member of the {tenant.name} Society to access the remaining 80% of this intelligence.
              </Typography>
              
              <a href={loginUrl} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'white',
                    color: 'black',
                    borderRadius: '30px',
                    px: 6,
                    py: 1.8,
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  Join the Society to Unlock
                </Button>
              </a>
            </Box>
          </Box>
        )}
      </Box>

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
