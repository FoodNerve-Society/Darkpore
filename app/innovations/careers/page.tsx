import React from 'react';
import { Box, Container, Typography, alpha } from '@mui/material';
import { getCareersListings } from '../../../lib/actions/trade';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import CareersBoard from './components/CareersBoard';

export const metadata: Metadata = {
    title: 'Careers & Opportunities | FoodNerve',
    description: 'Find jobs, internships, and opportunities across the FoodNerve ecosystem.',
};

const EMERALD = '#10b981';

export default async function CareersPage() {
    const headersList = await headers();
    const rawTenantId = headersList.get('x-tenant-id') || 'food';
    const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food';

    const result = await getCareersListings();

    if (!result.success) {
        return (
            <Container sx={{ py: 15, textAlign: 'center' }}>
                <Typography variant="h6" color="error">Failed to load careers.</Typography>
            </Container>
        );
    }

    const { coreEcosystemRoles, societyPartners, externalSourced } = result;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 14, position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Mesh Background */}
            <Box sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 480,
                pointerEvents: 'none',
                zIndex: 0,
                backgroundImage: [
                    `radial-gradient(ellipse 80% 60% at 20% 20%, ${alpha(EMERALD, 0.14)} 0%, transparent 70%)`,
                    `radial-gradient(ellipse 60% 80% at 80% 10%, ${alpha('#3b82f6', 0.12)} 0%, transparent 70%)`,
                ].join(', '),
            }}>
                <Box sx={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                    opacity: 0.6
                }} />
            </Box>

            {/* Hero Section */}
            <Box sx={{ 
                pt: { xs: 13, md: 16 }, 
                pb: { xs: 7, md: 9 }, 
                position: 'relative',
                zIndex: 2
            }}>
                <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 6 } }}>
                    <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.8,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            px: 1.8, py: 0.5,
                            borderRadius: '999px',
                            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)',
                            mb: 2
                        }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: EMERALD }} />
                            <Typography sx={{ color: '#047857', fontWeight: 800, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Opportunities
                            </Typography>
                        </Box>

                        <Typography variant="h2" sx={{ fontWeight: 900, color: '#0f172a', mb: 1.8, letterSpacing: '-0.025em', lineHeight: 1.15, fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' } }}>
                            Work with us to build <br />the future of food.
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontWeight: 500, lineHeight: 1.6, maxWidth: 580, mx: 'auto', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                            Discover jobs, internships, and opportunities across our network.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            <CareersBoard 
                coreEcosystemRoles={coreEcosystemRoles || []}
                societyPartners={societyPartners || []}
                externalSourced={externalSourced || []}
                tenantId={tenantId}
            />
        </Box>
    );
}
