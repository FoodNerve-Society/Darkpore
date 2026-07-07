'use client';

import React from 'react';
import { Modal, Box, Typography, Button, IconButton, alpha, Chip, Divider, Avatar, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentsIcon from '@mui/icons-material/Payments';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';

import GroupIcon from '@mui/icons-material/Group';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface PreviewListingModalProps {
    open: boolean;
    onClose: () => void;
    data: {
        title: string;
        companyName: string;
        companyLogoUrl: string;
        category: string;
        locationString: string;
        duration: string;
        deadline: string;
        startDate: string;
        endDate: string;
        compTypeString: string;
        minSalary: string;
        maxSalary: string;
        currency: string;
        npAmount: string;
        description: string;
        color: string;
    };
}

export default function PreviewListingModal({ open, onClose, data }: PreviewListingModalProps) {
    const {
        title, companyName, companyLogoUrl, category, locationString,
        duration, deadline, startDate, endDate, compTypeString, minSalary, maxSalary, currency, npAmount, description, color
    } = data;

    return (
        <Modal open={open} onClose={onClose} sx={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 },
            '& .MuiBackdrop-root': { 
                backgroundColor: 'rgba(15, 23, 42, 0.4)', 
                backdropFilter: 'blur(8px)', 
                WebkitBackdropFilter: 'blur(8px)' 
            } 
        }}>
            <Box sx={{
                width: '80vw', height: '80vh', overflow: 'hidden',
                bgcolor: '#ffffff', borderRadius: '24px', boxShadow: `0 32px 128px ${alpha(color, 0.15)}`,
                position: 'relative', display: 'flex', flexDirection: 'column',
                border: `1px solid ${alpha('#000', 0.05)}`,
                backgroundImage: `radial-gradient(circle at top right, ${alpha(color, 0.05)}, transparent 500px), radial-gradient(circle at bottom left, ${alpha(color, 0.02)}, transparent 400px)`,
            }}>
                {/* Floating Glassy Pill Header */}
                <Box sx={{ 
                    position: 'absolute', top: 24, right: 24, zIndex: 10,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: 1, pr: 1.5, pl: 2,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '100px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(255,255,255,0.5)'
                }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 1 }}>
                        Preview
                    </Typography>
                    <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(0,0,0,0.1)' }} />
                    <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#0f172a', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Job Renderer Container */}
                <Box sx={{
                    display: 'flex', flexDirection: 'column', p: { xs: 3, md: 5, lg: 6 },
                    color: '#0f172a', height: '100%', overflowY: 'auto',
                }}>
                    <Box sx={{ flexShrink: 0, mt: 4 }}>
                        {companyLogoUrl && (
                            <Avatar src={companyLogoUrl} sx={{ width: 80, height: 80, mb: 3, border: '2px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', bgcolor: '#fff', color: color }}>
                                {companyName?.charAt(0)}
                            </Avatar>
                        )}
                        <Typography variant="h3" fontWeight={800} sx={{ mb: 1, lineHeight: 1.2, color: '#0f172a' }}>{title || 'Untitled Role'}</Typography>
                        <Typography variant="h6" color={color} fontWeight={700}>{companyName || 'Unknown Entity'}</Typography>
                        <Divider sx={{ my: 3, bgcolor: alpha('#000', 0.05) }} />
                        <Stack spacing={1.5} mb={4} direction="row" flexWrap="wrap" useFlexGap alignItems="flex-start">
                            {category && <Chip size="medium" icon={<BusinessCenterOutlinedIcon />} label={category} sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 700, py: 2.5, px: 1, '& .MuiChip-icon': { color: color } }} />}
                            {locationString && <Chip size="medium" icon={<LocationOnOutlinedIcon />} label={locationString} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, py: 2.5, px: 1, '& .MuiChip-icon': { color: '#64748b' } }} />}
                            <Chip size="medium" icon={<WorkIcon />} label={duration || 'Duration Not Set'} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, py: 2.5, px: 1, '& .MuiChip-icon': { color: '#64748b' } }} />
                            {compTypeString === 'Fiat' ? (
                                <Chip size="medium" icon={<AttachMoneyIcon />} label={minSalary && maxSalary ? `${currency} ${Number(minSalary).toLocaleString()} - ${Number(maxSalary).toLocaleString()}` : 'Salary Negotiable'} sx={{ bgcolor: alpha('#10b981', 0.1), color: '#059669', fontWeight: 800, py: 2.5, px: 1, '& .MuiChip-icon': { color: '#10b981' } }} />
                            ) : (
                                <Chip size="medium" icon={<AttachMoneyIcon />} label={npAmount ? `${npAmount} NP Reward` : 'Volunteer'} sx={{ bgcolor: alpha('#8b5cf6', 0.1), color: '#7c3aed', fontWeight: 800, py: 2.5, px: 1, '& .MuiChip-icon': { color: '#8b5cf6' } }} />
                            )}
                        </Stack>
                    </Box>
                    
                    <Box
                        sx={{
                            flexGrow: 1, pr: 1, color: '#334155',
                            '& h1, & h2, & h3': { color: '#0f172a', fontWeight: 800, mt: 4, mb: 2 },
                            '& p': { my: 2, lineHeight: 1.8, fontSize: '1.05rem' },
                            '& ul, & ol': { pl: 3, mb: 2, fontSize: '1.05rem' },
                            '& li': { mb: 1 },
                            '& strong': { color: '#0f172a' },
                            '& a': { color: color, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
                            
                            scrollbarWidth: 'thin', scrollbarColor: `${alpha('#000', 0.1)} transparent`,
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                            '&::-webkit-scrollbar-thumb': { backgroundColor: alpha('#000', 0.1), borderRadius: '10px' },
                            '&::-webkit-scrollbar-thumb:hover': { backgroundColor: alpha('#000', 0.2) },
                        }}
                    >
                        {description ? (
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        ) : (
                            <Typography sx={{ color: '#94a3b8', fontStyle: 'italic', mt: 4 }}>No description provided yet.</Typography>
                        )}
                    </Box>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" pt={3} mt={4} borderTop={1} borderColor={alpha('#000', 0.05)} sx={{ flexShrink: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#64748b' }}>
                            <GroupIcon fontSize="small"/>
                            <Typography variant="body2" fontWeight={600}>0 Applications</Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>Preview Mode</Typography>
                    </Stack>
                </Box>
            </Box>
        </Modal>
    );
}
