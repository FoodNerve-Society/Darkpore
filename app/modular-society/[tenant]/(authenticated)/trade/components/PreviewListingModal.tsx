'use client';

import React from 'react';
import { Modal, Box, Typography, Button, IconButton, alpha, Chip, Divider, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentsIcon from '@mui/icons-material/Payments';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';

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
    onPublish: () => void;
    isSubmitting: boolean;
}

export default function PreviewListingModal({ open, onClose, data, onPublish, isSubmitting }: PreviewListingModalProps) {
    const {
        title, companyName, companyLogoUrl, category, locationString,
        duration, deadline, startDate, endDate, compTypeString, minSalary, maxSalary, currency, npAmount, description, color
    } = data;

    return (
        <Modal open={open} onClose={onClose} sx={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 },
            '& .MuiBackdrop-root': { 
                backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                backdropFilter: 'blur(8px)', 
                WebkitBackdropFilter: 'blur(8px)' 
            } 
        }}>
            <Box sx={{
                width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto',
                bgcolor: '#fff', borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
                position: 'relative', display: 'flex', flexDirection: 'column'
            }}>
                {/* Header Image / Pattern Area */}
                <Box sx={{ height: 120, background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.05)} 100%)`, position: 'relative' }}>
                    <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{ px: { xs: 3, md: 6 }, pb: { xs: 4, md: 6 }, mt: -6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Logo & Title */}
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                        <Avatar
                            src={companyLogoUrl || ''}
                            alt={companyName}
                            sx={{ width: 100, height: 100, border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', bgcolor: '#fff', color: color, fontSize: '2rem', fontWeight: 800 }}
                        >
                            {companyName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ pb: 1, flex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mb: 0.5, lineHeight: 1.2 }}>{title || 'Untitled Role'}</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: color }}>{companyName || 'Unknown Entity'}</Typography>
                        </Box>
                    </Box>

                    {/* Metadata Chips */}
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                        {category && <Chip label={category} sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 700 }} />}
                        {locationString && <Chip icon={<LocationOnIcon />} label={locationString} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />}
                        <Chip icon={<WorkIcon />} label={duration || 'Unknown Duration'} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
                        {compTypeString === 'Fiat' ? (
                            <Chip icon={<PaymentsIcon />} label={minSalary && maxSalary ? `${currency} ${minSalary} - ${maxSalary}` : 'Salary Negotiable'} sx={{ bgcolor: alpha('#10b981', 0.1), color: '#059669', fontWeight: 700 }} />
                        ) : (
                            <Chip icon={<PaymentsIcon />} label={npAmount ? `${npAmount} NP` : 'Unpaid / Volunteer'} sx={{ bgcolor: alpha('#8b5cf6', 0.1), color: '#7c3aed', fontWeight: 700 }} />
                        )}
                    </Box>

                    {/* Dates if provided */}
                    {(startDate || deadline) && (
                        <Box sx={{ display: 'flex', gap: 4, p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            {startDate && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Start Date</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0f172a', fontWeight: 600 }}>
                                        <CalendarTodayIcon sx={{ fontSize: 18, color }} /> {startDate}
                                    </Box>
                                </Box>
                            )}
                            {deadline && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Application Deadline</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0f172a', fontWeight: 600 }}>
                                        <CalendarTodayIcon sx={{ fontSize: 18, color: '#ef4444' }} /> {deadline}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}

                    <Divider sx={{ my: 1 }} />

                    {/* Description */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Role Description</Typography>
                        {description ? (
                            <Box sx={{
                                color: '#334155', lineHeight: 1.8,
                                '& h1, & h2, & h3': { color: '#0f172a', fontWeight: 800, mt: 4, mb: 2 },
                                '& p': { mb: 2 },
                                '& ul, & ol': { pl: 3, mb: 2 },
                                '& li': { mb: 1 }
                            }} dangerouslySetInnerHTML={{ __html: description }} /> // Note: In a real app we'd use a markdown parser here, assuming description is HTML or simple text.
                        ) : (
                            <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>No description provided.</Typography>
                        )}
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #f1f5f9' }}>
                        <Button variant="outlined" onClick={onClose} sx={{ flex: 1, height: 56, borderRadius: '16px', color: '#64748b', borderColor: '#cbd5e1', fontWeight: 700, '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' } }}>
                            Back to Edit
                        </Button>
                        <Button variant="contained" disabled={isSubmitting} onClick={onPublish} sx={{ flex: 2, height: 56, borderRadius: '16px', bgcolor: color, color: '#fff', fontWeight: 800, fontSize: '1.1rem', boxShadow: `0 8px 24px ${alpha(color, 0.4)}`, '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }}>
                            {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
