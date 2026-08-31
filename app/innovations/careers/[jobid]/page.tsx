import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { Box } from '@mui/material';
import PublicCareerDetailView from '../components/PublicCareerDetailView';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ jobid: string }> }): Promise<Metadata> {
    const { jobid } = await params;
    const job = await prisma.tradeListing.findUnique({
        where: { id: jobid },
        include: { organization: true, postedBy: true }
    });

    if (!job) {
        return {
            title: 'Job Not Found - FoodNerve',
        };
    }

    return {
        title: `${job.title} at ${job.organization?.name || job.postedBy?.name || 'FoodNerve'} - Careers`,
        description: job.description ? job.description.substring(0, 160) : 'Explore opportunities across the Pan-African FoodNerve ecosystem.',
    };
}

export default async function JobDetailsPage({ params }: { params: Promise<{ jobid: string }> }) {
    const { jobid } = await params;
    const job = await prisma.tradeListing.findUnique({
        where: { id: jobid },
        include: { organization: true, postedBy: true }
    });

    if (!job) {
        notFound();
    }

    const similarListings = await prisma.tradeListing.findMany({
        where: {
            category: { in: ['jobs', 'job', 'volunteer', 'internship', 'internships'] },
            status: 'active',
            id: { not: jobid }
        },
        include: { organization: true, postedBy: true },
        take: 3,
        orderBy: { postedAt: 'desc' }
    });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pt: { xs: 8, md: 10 } }}>
            <PublicCareerDetailView listing={job} similarListings={similarListings} />
        </Box>
    );
}
