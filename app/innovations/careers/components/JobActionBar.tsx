'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Button, Typography, alpha, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';
import MiniAuthModal from '@/app/modular-society/[tenant]/(authenticated)/components/MiniAuthModal';
import PremiumTextField from '@/components/PremiumTextField';
import { usePathname } from 'next/navigation';

interface JobActionBarProps {
    jobId: string;
    applicationMethod: string;
    externalUrl?: string | null;
    applicationEmail?: string | null;
    applicationInstructions?: string | null;
    customQuestions?: any[];
    requiredDocuments?: any[];
    buttonText?: string | null;
    color: string;
}

export default function JobActionBar({
    jobId,
    applicationMethod,
    externalUrl,
    applicationEmail,
    applicationInstructions,
    customQuestions = [],
    requiredDocuments = [],
    buttonText,
    color
}: JobActionBarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authChecking, setAuthChecking] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // Application Modals
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showNativeModal, setShowNativeModal] = useState(false);

    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthChecking(false);
            if (currentUser && showAuthModal) {
                setShowAuthModal(false); // Auto close when auth succeeds
            }
        });
        return () => unsubscribe();
    }, [showAuthModal]);

    const handleApplyClick = () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        // Action based on method
        if (applicationMethod === 'external' && externalUrl) {
            window.open(externalUrl, '_blank');
        } else if (applicationMethod === 'email') {
            setShowEmailModal(true);
        } else if (applicationMethod === 'native') {
            setShowNativeModal(true);
        }
    };

    return (
        <>
            <Box sx={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 40,
                bgcolor: isScrolled ? alpha('#ffffff', 0.85) : 'transparent',
                backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                borderBottom: isScrolled ? `1px solid ${alpha('#000', 0.05)}` : 'none',
                transition: 'all 0.3s ease',
                py: 2
            }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleApplyClick}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            bgcolor: color,
                            color: '#fff',
                            px: 4,
                            py: 1.5,
                            borderRadius: '50px',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '1.05rem',
                            boxShadow: `0 4px 14px ${alpha(color, 0.4)}`,
                            '&:hover': {
                                bgcolor: color,
                                filter: 'brightness(1.1)',
                                boxShadow: `0 6px 20px ${alpha(color, 0.6)}`,
                            }
                        }}
                    >
                        {buttonText || 'Apply Now'}
                    </Button>
                </Container>
            </Box>

            {/* Auth Modal */}
            <Modal open={showAuthModal} onClose={() => setShowAuthModal(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    maxWidth: 400,
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    boxShadow: 24,
                    p: 0,
                    overflow: 'hidden'
                }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton onClick={() => setShowAuthModal(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ px: 4, pb: 4, mt: -2 }}>
                        <MiniAuthModal pathname={pathname} />
                    </Box>
                </Box>
            </Modal>

            {/* Email Modal */}
            <Modal open={showEmailModal} onClose={() => setShowEmailModal(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '100%', maxWidth: 500, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 24, p: 4
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Application Instructions</Typography>
                        <IconButton onClick={() => setShowEmailModal(false)}><CloseIcon /></IconButton>
                    </Box>
                    {applicationInstructions && (
                        <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, mb: 4, border: '1px solid #e2e8f0' }}>
                            <Typography sx={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: '#334155' }}>
                                {applicationInstructions}
                            </Typography>
                        </Box>
                    )}
                    <Button 
                        fullWidth 
                        variant="contained" 
                        href={`mailto:${applicationEmail}`}
                        sx={{ py: 1.5, bgcolor: color, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
                    >
                        Open Email Client
                    </Button>
                </Box>
            </Modal>

            {/* Native Modal Placeholder */}
            <Modal open={showNativeModal} onClose={() => setShowNativeModal(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '100%', maxWidth: 600, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 24, p: 4,
                    maxHeight: '90vh', overflowY: 'auto'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Submit Application</Typography>
                        <IconButton onClick={() => setShowNativeModal(false)}><CloseIcon /></IconButton>
                    </Box>
                    
                    <Typography sx={{ color: '#64748b', mb: 4 }}>
                        Please fill out the required information below to apply.
                    </Typography>

                    {requiredDocuments.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography sx={{ fontWeight: 700, mb: 2, fontSize: '1.05rem' }}>Required Documents</Typography>
                            {/* We will add R2 upload here later */}
                            <Box sx={{ p: 4, border: '2px dashed #e2e8f0', borderRadius: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                                <Typography sx={{ color: '#64748b' }}>[File Upload Component Placeholder]</Typography>
                            </Box>
                        </Box>
                    )}

                    {customQuestions.map((q, idx) => (
                        <Box key={idx} sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 600, mb: 1, fontSize: '0.95rem', color: '#1e293b' }}>
                                {q.question} {q.required && <span style={{ color: '#ef4444' }}>*</span>}
                            </Typography>
                            <PremiumTextField 
                                colorTheme={color}
                                multiline 
                                minRows={3}
                                fullWidth 
                                placeholder="Your answer..."
                            />
                        </Box>
                    ))}

                    <Button 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 2, py: 1.5, bgcolor: color, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
                    >
                        Submit Application
                    </Button>
                </Box>
            </Modal>
        </>
    );
}
