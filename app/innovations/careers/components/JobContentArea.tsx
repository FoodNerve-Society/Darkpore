'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Chip, Divider, alpha, Button } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PublicIcon from '@mui/icons-material/Public';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface JobContentAreaProps {
    description: string;
    challenges: any[];
    reward: string;
    isFiat: boolean;
    minRank?: number | null;
    organization: any;
    color: string;
}

export default function JobContentArea({
    description,
    challenges,
    reward,
    isFiat,
    minRank,
    organization,
    color
}: JobContentAreaProps) {

    return (
        <Grid container spacing={6}>
            {/* Left Column - 70% */}
            <Grid item xs={12} md={8}>
                <Box sx={{ mb: 6 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e293b', mb: 3 }}>
                        Role Overview
                    </Typography>
                    
                    <Box 
                        data-color-mode="light" 
                        sx={{ 
                            '& .wmde-markdown': { 
                                bgcolor: 'transparent',
                                color: '#334155',
                                fontSize: '1.05rem',
                                lineHeight: 1.8,
                                fontFamily: 'inherit',
                                '& h1, h2, h3': { color: '#0f172a', fontWeight: 700, mt: 4, mb: 2 },
                                '& ul, ol': { pl: 3 },
                                '& li': { mb: 1 }
                            } 
                        }}
                    >
                        <MDEditor.Markdown source={description} />
                    </Box>
                </Box>

                {challenges && challenges.length > 0 && (
                    <Box sx={{ mb: 6, p: 4, borderRadius: 4, bgcolor: alpha(color, 0.04), border: `1px solid ${alpha(color, 0.1)}` }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#1e293b', mb: 2 }}>
                            Ecosystem Impact
                        </Typography>
                        <Typography sx={{ color: '#475569', mb: 3 }}>
                            By taking on this role, you are directly helping the ecosystem solve the following challenges:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {challenges.map((chal, idx) => (
                                <Chip 
                                    key={idx} 
                                    label={chal.label || chal} 
                                    sx={{ 
                                        bgcolor: 'white', 
                                        color: color, 
                                        fontWeight: 600, 
                                        border: `1px solid ${alpha(color, 0.2)}`,
                                        px: 1, py: 2, borderRadius: '12px'
                                    }} 
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </Grid>

            {/* Right Column - 30% */}
            <Grid item xs={12} md={4}>
                <Box sx={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    
                    {/* Compensation Card */}
                    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: alpha(color, 0.05), borderBottom: '1px solid #e2e8f0' }}>
                            <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Compensation & Requirements
                            </Typography>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 0.5 }}>
                                    {isFiat ? 'Salary Range' : 'Ecosystem Reward'}
                                </Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: isFiat ? '#0f172a' : '#8b5cf6' }}>
                                    {reward}
                                </Typography>
                            </Box>

                            {minRank && minRank > 1 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <LocalPoliceIcon sx={{ color: '#f59e0b', mt: 0.5 }} />
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>Rank {minRank}+ Required</Typography>
                                            <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mt: 0.5 }}>
                                                This is a premium ecosystem role that requires a verified reputation.
                                            </Typography>
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Organization Info Card */}
                    {organization && (
                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
                            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <Avatar 
                                    src={organization.logoUrl} 
                                    sx={{ width: 64, height: 64, mb: 2, bgcolor: alpha(color, 0.1), color: color }}
                                >
                                    {organization.name.charAt(0)}
                                </Avatar>
                                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#1e293b', mb: 1 }}>
                                    {organization.name}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    {organization.isPlatformOwner ? (
                                        <Chip icon={<LocalPoliceIcon />} label="Core Platform Owner" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 600 }} />
                                    ) : (
                                        <Chip icon={<CheckCircleOutlineIcon />} label="Verified Society Partner" size="small" sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 600 }} />
                                    )}
                                </Box>

                                {organization.websiteUrl && (
                                    <Button 
                                        variant="outlined" 
                                        endIcon={<OpenInNewIcon />}
                                        href={organization.websiteUrl}
                                        target="_blank"
                                        fullWidth
                                        sx={{ mt: 1, borderRadius: '12px', textTransform: 'none', color: '#475569', borderColor: '#cbd5e1' }}
                                    >
                                        Visit Website
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
}
