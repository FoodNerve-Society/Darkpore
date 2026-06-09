"use client";

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface TypewriterProps {
    text: string;
    onComplete: () => void;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, onComplete }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

    useEffect(() => {
        const controls = animate(count, text.length, {
            type: "tween",
            duration: 2,
            ease: "easeInOut",
            onComplete,
        });
        return controls.stop;
    }, [text, onComplete, count]);

    return (
        <motion.span
            style={{
                borderRight: '.15em solid #B0BEC5',
                whiteSpace: 'pre-line',
                fontFamily: 'inherit',
                display: 'inline',
                overflow: 'hidden',
                wordBreak: 'break-word',
            }}
        >
            {displayText}
        </motion.span>
    );
};

export default Typewriter;
