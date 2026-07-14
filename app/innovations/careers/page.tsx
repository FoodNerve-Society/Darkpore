import React from 'react';
import { Box, Container, Typography, alpha } from '@mui/material';
import { getCareersListings } from '../../../lib/actions/trade';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import CareersBoard from './components/CareersBoard';

export const metadata: Metadata = {
    title: 'Careers | FoodNerve Innovations',
    description: 'Join the ecosystem shaping the future of African food systems.',
};

// MUI Colors for FoodNerve
const EMERALD = '#10b981';

export default async function CareersPage() {
    const headersList = await headers();
    const rawTenantId = headersList.get('x-tenant-id') || 'food';
    const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food'; // Normalized

    const result = await getCareersListings();

    if (!result.success) {
        return (
            <Container sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Failed to load careers.</Typography>
            </Container>
        );
    }

    const { coreEcosystemRoles, societyPartners, externalSourced } = result;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
            {/* Hero Section */}
            <Box sx={{ 
                pt: { xs: 15, md: 20 }, 
                pb: { xs: 8, md: 12 }, 
                background: `linear-gradient(135deg, ${alpha(EMERALD, 0.1)} 0%, #f8fafc 100%)`,
                borderBottom: `1px solid ${alpha(EMERALD, 0.1)}`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Box sx={{ maxWidth: 800 }}>
                        <Typography variant="overline" sx={{ color: EMERALD, fontWeight: 700, letterSpacing: 2, display: 'block', mb: 2 }}>
                            INNOVATIONS & TALENT
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 900, color: '#0f172a', mb: 3, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            Build the infrastructure <br />of tomorrow.
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#475569', fontWeight: 500, lineHeight: 1.6, maxWidth: 600 }}>
                            Whether you're an agronomist, an engineer, or a visionary, discover opportunities across the FoodNerve ecosystem to scale impact across Africa.
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
