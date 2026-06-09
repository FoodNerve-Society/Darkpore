"use client";

import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

export default function AnimatedCounter({ end, duration = 1.5 }: { end: number, duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const controls = animate(0, end, {
            duration,
            ease: "easeOut",
            onUpdate(value) {
                setCount(Math.round(value));
            }
        });
        return () => controls.stop();
    }, [end, duration]);

    // Format the number to be compact if it's very large (e.g. 5,200,000 -> 5.2M)
    // Or just use commas for readability
    const formatted = end >= 1000000 
        ? (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
        : count.toLocaleString();

    return <span>{formatted}</span>;
}
