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
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0f172a',
      backgroundImage: 'radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      pb: 12
    }}>
      <Box sx={{ maxWidth: 860, mx: 'auto', pt: { xs: 14, md: 16 } }}>
        
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
                      boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
                    }
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
    </Box>
  );
}
