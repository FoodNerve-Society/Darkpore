"use client";

import React, { FC, useState, useEffect } from 'react';
import { Box, IconButton, Typography, Button, useMediaQuery, Theme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useJourneyState } from '../hooks/useJourneyState';
import TabNavigator from './TabNavigator';
import ImmersiveChapterContent from './ImmersiveChapterContent';
import ShowcaseCarousel from './ShowcaseCarousel';
import ExpandingAccordion from './ExpandingAccordion';
import { RoleIdentifier } from './ContextualUI';
import ProgressIndicator from './ProgressIndicator';
import { ArrowBack, Scale } from '@mui/icons-material';

interface RoleJourneyProps {
    role: any;
    onBack: () => void;
    journeyData: {
        TABS: any[];
        journeySteps: any[];
        tradeOffs: any[];
        rewards: any[];
    };
}

const RoleJourney: FC<RoleJourneyProps> = ({ role, onBack, journeyData }) => {
    const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    const journey = useJourneyState({ journeySteps: journeyData.journeySteps });
    const [isChapterComplete, setIsChapterComplete] = useState(false);
    const [currentChapterStepIndex, setCurrentChapterStepIndex] = useState(0);
    const router = useRouter();
    const accentColor = role.color;

    useEffect(() => {
        setIsChapterComplete(false);
        setCurrentChapterStepIndex(0);
    }, [journey.activeChapterIndex]);

    const handleChapterComplete = () => setIsChapterComplete(true);
    const goToNextChapter = () => journey.changeChapter(journey.activeChapterIndex + 1);

    const progressIndicatorProps = (() => {
        const props = {
            isComplete: isChapterComplete,
            onNext: goToNextChapter,
            nextChapterLabel: journeyData.TABS[journey.activeChapterIndex + 1]?.label,
            accentColor: accentColor,
            currentIndex: currentChapterStepIndex,
        };
        switch (journey.activeChapterIndex) {
            case 0: return { ...props, label: "Step", total: journeyData.journeySteps.length };
            case 1: return { ...props, label: "Consideration", total: journeyData.tradeOffs.length };
            case 2: return { ...props, label: "Reward", total: journeyData.rewards.length };
            default: return null;
        }
    })();

    const chapterVariants = {
        enter: { opacity: 0, scale: 0.98 },
        center: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
    };

    return (
        <Box sx={{
            height: '100%', width: '100%',
            bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 6, color: 'white',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            <Box sx={{
                p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={onBack} sx={{ color: 'white', mr: 2 }}><ArrowBack /></IconButton>
                    <RoleIdentifier icon={role.icon} title={`${role.title} Journey`} accentColor={accentColor} />
                </Box>
                {progressIndicatorProps && <ProgressIndicator {...progressIndicatorProps} />}
            </Box>

            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: isDesktop ? 'row' : 'column',
                overflow: 'hidden',
                minHeight: 0,
            }}>
                <Box sx={{
                    flexBasis: isDesktop ? 'auto' : 'auto',
                    width: isDesktop ? 'auto' : '100%',
                    maxWidth: isDesktop ? '350px' : 'none',
                    flexShrink: 0,
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <TabNavigator
                        tabs={journeyData.TABS}
                        activeIndex={journey.activeChapterIndex}
                        onSelect={journey.changeChapter}
                        accentColor={accentColor}
                    />
                </Box>

                <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={journey.activeChapterIndex}
                            variants={chapterVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            style={{ position: 'absolute', width: '100%', height: '100%', overflowY: 'auto', padding: '24px' }}
                        >
                            {journey.activeChapterIndex === 0 && (
                                <ImmersiveChapterContent
                                    slides={journeyData.journeySteps}
                                    accentColor={accentColor}
                                    onComplete={handleChapterComplete}
                                    onActiveIndexChange={setCurrentChapterStepIndex}
                                />
                            )}
                            {journey.activeChapterIndex === 1 && (
                                <ShowcaseCarousel
                                    cards={journeyData.tradeOffs}
                                    accentColor="#FFA726"
                                    onComplete={handleChapterComplete}
                                    onActiveIndexChange={setCurrentChapterStepIndex}
                                    title="What It Demands"
                                    description="A transparent look at the commitment required for real growth."
                                    titleIcon={<Scale />}
                                />
                            )}
                            {journey.activeChapterIndex === 2 && (
                                <ExpandingAccordion
                                    cards={journeyData.rewards}
                                    accentColor={accentColor}
                                    onComplete={handleChapterComplete}
                                    onActiveIndexChange={setCurrentChapterStepIndex}
                                />
                            )}
                            {journey.activeChapterIndex === 3 && (
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    p: 3,
                                    background: `radial-gradient(circle, ${accentColor}15, transparent 70%)`
                                }}>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                    >
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontWeight: 700,
                                                color: 'white',
                                                textShadow: `0 0 20px ${accentColor}80`
                                            }}
                                        >
                                            Your Future Starts Now.
                                        </Typography>
                                        <Typography sx={{
                                            my: 3,
                                            maxWidth: '50ch',
                                            mx: 'auto',
                                            color: 'rgba(255,255,255,0.7)',
                                            fontSize: '1.1rem',
                                            lineHeight: 1.7
                                        }}>
                                            You've seen the journey, understood the demands, and recognized the rewards. The next step is yours to take.
                                        </Typography>
                                        <Button
                                            size="large"
                                            onClick={() => router.push('/join')}
                                            sx={{
                                                bgcolor: accentColor,
                                                color: 'white',
                                                borderRadius: '50px',
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                px: 6,
                                                py: 2,
                                                fontSize: '1.2rem',
                                                boxShadow: `0 10px 30px -10px ${accentColor}`,
                                                '&:hover': {
                                                    bgcolor: accentColor,
                                                    filter: 'brightness(1.1)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 12px 35px -10px ${accentColor}`,
                                                },
                                                transition: 'all 0.3s ease-in-out',
                                            }}
                                        >
                                            Start Your Journey
                                        </Button>
                                    </motion.div>
                                </Box>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Box>
            </Box>
        </Box>
    );
};

export default RoleJourney;
