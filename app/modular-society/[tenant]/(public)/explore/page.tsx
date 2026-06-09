"use client";

import React, { useState, useEffect, FC, ReactNode } from 'react';
import { Box, Typography, Button, useMediaQuery, Theme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ExploreFeed from './components/ExploreFeed';
import RoleCard from './components/RoleCard';
import DotNavigator from './components/DotNavigator';
import { LightbulbTwoTone, MenuBookTwoTone, GroupsTwoTone, EmojiEventsTwoTone, SmartDisplayTwoTone, WorkTwoTone, ArrowBack } from '@mui/icons-material';
import Typewriter from './components/Typewriter';
import SocietyLogo from '../components/SocietyLogo';
import PremiumButton from '@/components/PremiumButton';

// --- Global Styles ---
const GlobalStyles = () => (
    <style jsx global>{`
        @keyframes drift {
            0% { transform: translateX(-5%); }
            50% { transform: translateX(5%); }
            100% { transform: translateX(-5%); }
        }
        @keyframes subtle-aurora {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `}</style>
);

// --- Type Definitions ---
interface Role { id: string; icon: ReactNode; title: string; mantra: string; color: string; imageUrl: string; description: string; }
const roles: Role[] = [
    { id: 'innovations', icon: <LightbulbTwoTone sx={{ fontSize: '2.5rem' }} />, title: 'Innovations', mantra: 'Game-Changing Solutions.', color: '#10b981', imageUrl: '/media/innovating.jpg', description: 'Discover technologies and models tackling global food and agriculture challenges.' },
    { id: 'library', icon: <MenuBookTwoTone sx={{ fontSize: '2.5rem' }} />, title: 'Library', mantra: 'Premium Research.', color: '#8b5cf6', imageUrl: '/media/discussion.jpg', description: 'Access exclusive reports, data sets, and insights curated by global experts.' },
    { id: 'community', icon: <GroupsTwoTone sx={{ fontSize: '2.5rem' }} />, title: 'Community', mantra: 'Global Network.', color: '#f59e0b', imageUrl: '/media/ceo.jpg', description: 'Connect with a curated network of innovators, investors, and thought leaders.' },
    { id: 'activities', icon: <EmojiEventsTwoTone sx={{ fontSize: '2.5rem' }} />, title: 'Activities', mantra: 'Hands-On Projects.', color: '#ef4444', imageUrl: '/media/parents.jpg', description: 'Participate in sprints, hackathons, and missions that drive real-world impact.' },
    { id: 'livestreams', icon: <SmartDisplayTwoTone sx={{ fontSize: '2.5rem' }} />, title: 'Livestreams', mantra: 'Live Masterclasses.', color: '#3b82f6', imageUrl: '/media/discussion.jpg', description: 'Learn directly from live expert panels, Q&As, and interactive workshops.' },
    { id: 'jobs', icon: <WorkTwoTone sx={{ fontSize: '2.5rem' }} />, title: 'Jobs', mantra: 'Impact Careers.', color: '#ec4899', imageUrl: '/media/ceo.jpg', description: 'Find your next big role or hire top talent dedicated to the impact sector.' },
];

// --- Atmospheric Cloud Component ---
const Cloud: FC<{ top?: string; left?: string; right?: string; bottom?: string; size: number; duration: number; delay: number; color?: string }> = ({ size, duration, delay, color = 'rgba(16, 185, 129, 0.15)', ...pos }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        style={{
            position: 'absolute',
            ...pos,
            width: `${size}px`,
            height: `${size / 2}px`,
            background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
            filter: 'blur(50px)',
            animation: `drift ${duration}s ease-in-out ${delay}s infinite`,
            zIndex: 1,
        }}
    />
);

export default function ExperiencePage() {
    const [phase, setPhase] = useState<number>(1);
    const [selectedRole, setSelectedRole] = useState<string | null>(roles[0].id);
    const [activeJourney, setActiveJourney] = useState<string | null>(null);
    const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    const router = useRouter();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (phase === 1) { timer = setTimeout(() => setPhase(2), 1000); }
        else if (phase === 2) { timer = setTimeout(() => setPhase(3), 2500); }
        return () => clearTimeout(timer);
    }, [phase]);

    const handleTypewriterComplete = () => {
        setTimeout(() => setPhase(4), 1000);
    };

    useEffect(() => {
        if (phase >= 4 && !activeJourney) {
            const timer = setInterval(() => {
                setSelectedRole(prev => {
                    const currentIndex = roles.findIndex(r => r.id === prev);
                    const nextIndex = (currentIndex + 1) % roles.length;
                    return roles[nextIndex].id;
                });
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [phase, activeJourney]);

    const handleSelect = (roleId: string) => setSelectedRole(roleId);
    const handleExplore = (roleId: string) => setActiveJourney(roleId);
    const handleBack = () => setActiveJourney(null);

    const activeRoleData = roles.find(r => r.id === activeJourney);

    return (
        <>
            <GlobalStyles />
            <Box sx={{
                width: '100%', minHeight: '100vh',
                background: '#0a120d', position: 'relative', overflow: 'hidden',
                '::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at 20% 30%, #10b98120, transparent 40%), radial-gradient(circle at 80% 70%, #d9770620, transparent 40%)',
                    animation: 'subtle-aurora 25s ease-in-out infinite',
                    zIndex: 0,
                }
            }}>
                <Cloud top="10%" left="5%" size={400} duration={40} delay={0} color="rgba(16, 185, 129, 0.2)" />
                <Cloud bottom="15%" right="10%" size={500} duration={35} delay={2} color="rgba(217, 119, 6, 0.15)" />
                <Cloud top="20%" right="25%" size={300} duration={45} delay={1} color="rgba(16, 185, 129, 0.15)" />

                <Box sx={{
                    maxWidth: '1600px', mx: 'auto', width: '100%', zIndex: 2,
                    p: { xs: 1, sm: 2, md: 3 },
                    height: '100vh', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', perspective: '1000px',
                    position: 'relative',
                }}>
                    <AnimatePresence mode="wait">
                        {activeJourney && activeRoleData ? (
                            <motion.div
                                key="journey-view"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    padding: '16px',
                                    zIndex: 10,
                                    background: '#101418',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <ExploreFeed
                                    role={activeRoleData}
                                    onBack={handleBack}
                                    onTabChange={handleExplore}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="gallery-view"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                animate={{ justifyContent: phase < 4 ? 'center' : 'flex-start', paddingTop: phase < 4 ? 0 : '5vh' }}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}
                            >
                                <motion.div layout transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
                                    <AnimatePresence>
                                        {phase >= 4 && (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                                                    style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, display: 'flex', alignItems: 'flex-start' }}
                                                >
                                                    <SocietyLogo variant="light" />
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                                                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
                                                >
                                                    <PremiumButton variant="outlined" baseColor="white" onClick={() => router.push('/join')}>
                                                        Join
                                                    </PremiumButton>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>

                                    <Box sx={{ minHeight: '20vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <AnimatePresence>
                                            {phase >= 2 && (
                                                <motion.div
                                                    initial={{ z: 300, scale: 1.7, rotateX: 30, opacity: 0 }}
                                                    animate={{ z: 0, scale: phase < 4 ? 1 : 0.8, rotateX: 0, opacity: 1 }}
                                                    transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                                                    style={{ textAlign: 'center' }}
                                                >
                                                    <Typography 
                                                        variant="h2" 
                                                        sx={{ 
                                                            fontWeight: 900, 
                                                            fontFamily: 'var(--font-dosis)',
                                                            fontSize: phase < 4 
                                                                ? 'clamp(2.5rem, 6vw, 4rem)' 
                                                                : 'clamp(2rem, 4.5vw, 3.2rem)',
                                                            color: 'white',
                                                            transition: 'font-size 1.2s ease',
                                                        }}
                                                    >
                                                        We have exactly what you need
                                                    </Typography>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        
                                        <Box sx={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AnimatePresence>
                                                {phase >= 3 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0 }} 
                                                        animate={{ opacity: 1 }} 
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        style={{ marginTop: '16px' }}
                                                    >
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                                                            <Typography 
                                                                variant="h6" 
                                                                sx={{ 
                                                                    maxWidth: '750px', 
                                                                    mx: 'auto', 
                                                                    color: '#B0BEC5',
                                                                    fontSize: phase < 4 ? 'inherit' : '1rem',
                                                                    transition: 'font-size 1.2s ease',
                                                                    minHeight: '50px'
                                                                }}
                                                            >
                                                                <Typewriter
                                                                    text="Choose your path to unlock exclusive tools, global networks, and resources designed to scale your impact."
                                                                    onComplete={handleTypewriterComplete}
                                                                />
                                                            </Typography>
                                                        </Box>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Box>
                                    </Box>
                                </motion.div>

                                <AnimatePresence>
                                    {phase >= 4 && (
                                        <motion.div
                                            initial={{ y: '100%', opacity: 0 }}
                                            animate={{ y: '0%', opacity: 1 }}
                                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                            style={{ marginTop: '48px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: isDesktop ? 'row' : 'column',
                                                gap: 2,
                                                height: isDesktop ? '450px' : '60vh',
                                                flexGrow: 1
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: isDesktop ? 'row' : 'column',
                                                    gap: 2,
                                                    flexGrow: 1
                                                }}>
                                                    {roles.map(role => (
                                                        <RoleCard
                                                            key={role.id}
                                                            role={role}
                                                            isSelected={selectedRole === role.id}
                                                            onSelect={setSelectedRole}
                                                            onExplore={setActiveJourney}
                                                            isDesktop={isDesktop}
                                                        />
                                                    ))}
                                                </Box>
                                                <DotNavigator
                                                    isDesktop={isDesktop}
                                                    selectedRole={selectedRole}
                                                    onSelect={setSelectedRole}
                                                />
                                            </Box>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
            </Box>
        </>
    );
}
