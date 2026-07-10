import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { Box, Container, alpha } from '@mui/material';
import JobHeroHeader from '../components/JobHeroHeader';
import JobActionBar from '../components/JobActionBar';
import JobContentArea from '../components/JobContentArea';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ jobid: string }> }): Promise<Metadata> {
    const { jobid } = await params;
    const job = await prisma.tradeListing.findUnique({
        where: { id: jobid },
        include: { organization: true }
    });

    if (!job) {
        return {
            title: 'Job Not Found - Food Nerve',
        };
    }

    return {
        title: `${job.title} at ${job.organization?.name || 'Food Nerve'} - Careers`,
        description: job.description.substring(0, 160),
    };
}

export default async function JobDetailsPage({ params }: { params: Promise<{ jobid: string }> }) {
    const { jobid } = await params;
    const job = await prisma.tradeListing.findUnique({
        where: { id: jobid },
        include: { organization: true }
    });

    if (!job) {
        notFound();
    }

    const isFiat = job.compType === 'fiat';
    const reward = isFiat 
        ? `${job.currency || '₦'} ${job.minSalary ? job.minSalary.toLocaleString() : ''} ${job.maxSalary ? '- ' + job.maxSalary.toLocaleString() : ''}`
        : `${job.npReward || 0} NP`;

    // Parse JSON fields
    let challenges = [];
    try {
        if (job.challenges) challenges = JSON.parse(job.challenges);
    } catch(e){}

    let customQuestions = [];
    try {
        if (job.customQuestions) customQuestions = JSON.parse(job.customQuestions);
    } catch(e){}

    let requiredDocuments = [];
    try {
        if (job.requiredDocuments) requiredDocuments = JSON.parse(job.requiredDocuments);
    } catch(e){}

    // Theme logic - if Darkpore or society, color might change. For public, fallback to emerald
    const color = job.organization?.isPlatformOwner ? '#10b981' : '#1e293b';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 12 }}>
            <JobHeroHeader 
                title={job.title}
                organizationName={job.organization?.name || 'Food Nerve'}
                logoUrl={job.organization?.logoUrl}
                location={job.location}
                workModel={job.workModel}
                commitment={job.duration || (job.category === 'volunteer' ? 'volunteer' : 'full-time')}
                postedAt={job.postedAt}
                color={color}
            />

            <JobActionBar 
                jobId={job.id}
                applicationMethod={job.applicationMethod}
                externalUrl={job.externalUrl}
                applicationEmail={job.applicationEmail}
                applicationInstructions={job.applicationInstructions}
                customQuestions={customQuestions}
                requiredDocuments={requiredDocuments}
                buttonText={job.externalButtonText}
                color={color}
            />

            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <JobContentArea 
                    description={job.description}
                    challenges={challenges}
                    reward={reward}
                    isFiat={isFiat}
                    minRank={job.minRank}
                    organization={job.organization}
                    color={color}
                />
            </Container>
        </Box>
    );
}
