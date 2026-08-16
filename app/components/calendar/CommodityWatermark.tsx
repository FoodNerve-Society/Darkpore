'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@mui/material';

interface CommodityWatermarkProps {
  commodity: string | null;
  color?: string;
  size?: number | string;
  opacity?: number;
}

export default function CommodityWatermark({ commodity, color = '#ffffff', size = 180, opacity = 0.12 }: CommodityWatermarkProps) {
  const getSvgPath = (name: string | null) => {
    switch (name) {
      case "Wheat and Sugar":
      case "Rice":
      case "Sorghum":
      case "Pulses":
        // Grain stalk / Wheat sheaf
        return (
          <g>
            <path d="M50 95 C50 60 50 25 50 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M50 35 C38 28 35 15 50 10 C65 15 62 28 50 35 Z" fill="currentColor" />
            <path d="M50 50 C34 44 30 30 46 26 C52 35 50 45 50 50 Z" fill="currentColor" />
            <path d="M50 50 C66 44 70 30 54 26 C48 35 50 45 50 50 Z" fill="currentColor" />
            <path d="M50 68 C32 62 28 48 45 44 C52 53 50 63 50 68 Z" fill="currentColor" />
            <path d="M50 68 C68 62 72 48 55 44 C48 53 50 63 50 68 Z" fill="currentColor" />
            <path d="M50 85 C32 79 30 65 46 62 C51 71 50 80 50 85 Z" fill="currentColor" />
            <path d="M50 85 C68 79 70 65 54 62 C49 71 50 80 50 85 Z" fill="currentColor" />
          </g>
        );

      case "Tomato and Pepper":
        // Tomato with vine & bell pepper
        return (
          <g>
            {/* Tomato */}
            <path d="M42 40 C22 40 12 55 12 70 C12 88 30 92 42 92 C54 92 72 88 72 70 C72 55 62 40 42 40 Z" fill="currentColor" />
            <path d="M42 40 L42 28 C42 28 48 24 54 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M42 38 L30 30 M42 38 L54 30 M42 38 L36 46 M42 38 L48 46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            {/* Pepper silhouette */}
            <path d="M68 30 C62 30 58 35 60 45 C62 55 75 80 82 85 C86 85 88 75 86 60 C84 45 78 30 68 30 Z" fill="currentColor" opacity="0.8" />
          </g>
        );

      case "Poultry and Eggs":
        // Rooster silhouette with egg
        return (
          <g>
            <path d="M35 85 L35 95 M38 95 L32 95 M45 85 L45 95 M48 95 L42 95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M15 55 C12 35 30 30 40 45 C50 35 65 30 75 40 C85 50 80 75 60 85 C45 88 25 85 15 55 Z" fill="currentColor" />
            <path d="M65 42 C72 38 80 28 78 18 C75 14 68 18 64 24 L55 35" fill="currentColor" />
            <path d="M82 22 L90 24 L84 28 Z" fill="currentColor" />
            {/* Comb */}
            <path d="M72 16 C70 10 75 8 78 12 C82 8 86 10 84 16 Z" fill="currentColor" />
            {/* Egg */}
            <path d="M78 68 C70 68 66 76 66 84 C66 91 72 96 78 96 C84 96 90 91 90 84 C90 76 86 68 78 68 Z" fill="currentColor" opacity="0.9" />
          </g>
        );

      case "Oil Palm and Coconut":
        // Tropical palm tree
        return (
          <g>
            {/* Trunk */}
            <path d="M46 95 C48 70 52 50 50 38" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
            {/* Coconuts */}
            <circle cx="47" cy="40" r="5" fill="currentColor" />
            <circle cx="54" cy="42" r="5" fill="currentColor" />
            {/* Fronds */}
            <path d="M50 38 C40 25 15 25 8 40 C20 40 38 38 50 38 Z" fill="currentColor" />
            <path d="M50 38 C35 15 20 5 40 5 C45 18 48 28 50 38 Z" fill="currentColor" />
            <path d="M50 38 C60 15 75 5 60 5 C55 18 52 28 50 38 Z" fill="currentColor" />
            <path d="M50 38 C60 25 85 25 92 40 C80 40 62 38 50 38 Z" fill="currentColor" />
            <path d="M50 38 C30 35 10 50 15 65 C25 55 40 45 50 38 Z" fill="currentColor" />
            <path d="M50 38 C70 35 90 50 85 65 C75 55 60 45 50 38 Z" fill="currentColor" />
          </g>
        );

      case "Beef":
      case "Lamb and Ram":
      case "Pork":
        // Livestock bull / horned silhouette
        return (
          <g>
            {/* Horns */}
            <path d="M12 20 C20 18 35 28 42 40 C35 34 20 30 12 20 Z" fill="currentColor" />
            <path d="M88 20 C80 18 65 28 58 40 C65 34 80 30 88 20 Z" fill="currentColor" />
            {/* Head & Muzzle */}
            <path d="M35 38 C30 45 32 60 38 75 C42 85 58 85 62 75 C68 60 70 45 65 38 C58 35 42 35 35 38 Z" fill="currentColor" />
            {/* Ears */}
            <path d="M34 44 C24 45 18 50 20 54 C25 54 32 50 35 48 Z" fill="currentColor" />
            <path d="M66 44 C76 45 82 50 80 54 C75 54 68 50 65 48 Z" fill="currentColor" />
            {/* Nose Ring / Details */}
            <circle cx="50" cy="78" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </g>
        );

      case "Maize and Maize Oil":
        // Corn cob with husk
        return (
          <g>
            {/* Cob */}
            <path d="M42 20 C42 12 58 12 58 20 C62 45 62 65 50 85 C38 65 38 45 42 20 Z" fill="currentColor" />
            {/* Kernels pattern */}
            <line x1="50" y1="20" x2="50" y2="78" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="44" y1="30" x2="56" y2="30" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="43" y1="42" x2="57" y2="42" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="44" y1="54" x2="56" y2="54" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="46" y1="66" x2="54" y2="66" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            {/* Husks */}
            <path d="M50 85 C30 75 22 55 20 35 C28 55 40 70 50 85 Z" fill="currentColor" opacity="0.75" />
            <path d="M50 85 C70 75 78 55 80 35 C72 55 60 70 50 85 Z" fill="currentColor" opacity="0.75" />
            <path d="M50 85 L50 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </g>
        );

      case "Citrus Fruits":
      case "Melons":
      case "Apples and Grapes":
      case "Mangoes, Guavas and Mangosteens":
        // Citrus Slice wheel
        return (
          <g>
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="4" fill="none" />
            <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" fill="none" opacity="0.6" />
            <circle cx="50" cy="50" r="6" fill="currentColor" />
            {/* Radiating Segments */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const x2 = 50 + Math.cos(angle) * 34;
              const y2 = 50 + Math.sin(angle) * 34;
              return <line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" />;
            })}
          </g>
        );

      case "Fish":
      case "Cephalopods and Shellfish":
        // Marine fish / aquatic silhouette
        return (
          <g>
            <path d="M90 50 C65 30 35 32 15 50 C35 68 65 70 90 50 Z" fill="currentColor" />
            {/* Tail */}
            <path d="M18 50 L5 32 L10 50 L5 68 Z" fill="currentColor" />
            {/* Fins */}
            <path d="M55 33 C60 22 70 20 72 25 C65 28 60 33 55 33 Z" fill="currentColor" />
            <path d="M50 67 C55 78 65 80 67 75 C60 72 55 67 50 67 Z" fill="currentColor" />
            {/* Eye */}
            <circle cx="78" cy="46" r="3" fill="rgba(0,0,0,0.5)" />
            {/* Gill curve */}
            <path d="M70 40 C66 46 66 54 70 60" stroke="rgba(0,0,0,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        );

      case "Pineapples":
      case "Bananas and Plantains":
        // Pineapple with crown
        return (
          <g>
            {/* Pineapple Oval */}
            <path d="M30 45 C30 35 70 35 70 45 C75 65 75 80 50 92 C25 80 25 65 30 45 Z" fill="currentColor" />
            {/* Diamond Lattice */}
            <path d="M35 50 L65 75 M32 65 L58 88 M45 40 L70 65 M65 50 L35 75 M68 65 L42 88 M55 40 L30 65" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
            {/* Crown Leaves */}
            <path d="M50 38 L50 10 C50 10 40 25 45 38 Z" fill="currentColor" />
            <path d="M50 38 L30 18 C30 18 32 30 46 38 Z" fill="currentColor" />
            <path d="M50 38 L70 18 C70 18 68 30 54 38 Z" fill="currentColor" />
            <path d="M50 38 L20 28 C20 28 28 35 44 40 Z" fill="currentColor" />
            <path d="M50 38 L80 28 C80 28 72 35 56 40 Z" fill="currentColor" />
          </g>
        );

      case "Milk":
        // Milk bottle & splash droplet
        return (
          <g>
            <path d="M40 15 L60 15 L60 22 L40 22 Z" fill="currentColor" />
            <path d="M42 22 L42 32 L32 42 L32 88 C32 92 36 95 40 95 L60 95 C64 95 68 92 68 88 L68 42 L58 32 L58 22 Z" fill="currentColor" />
            <path d="M32 60 C42 64 58 56 68 62 L68 88 C68 92 64 95 60 95 L40 95 C36 95 32 92 32 88 Z" fill="rgba(255,255,255,0.4)" />
            {/* Droplet */}
            <path d="M78 25 C78 25 88 38 88 44 C88 50 83 54 78 54 C73 54 68 50 68 44 C68 38 78 25 78 25 Z" fill="currentColor" />
          </g>
        );

      default:
        // Default Botanical Agro Leaf / Seed
        return (
          <g>
            <path d="M50 95 C50 60 50 25 50 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M50 15 C20 25 15 65 50 90 C85 65 80 25 50 15 Z" fill="currentColor" />
            <path d="M50 35 L32 48 M50 50 L28 65 M50 65 L36 78" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M50 35 L68 48 M50 50 L72 65 M50 65 L64 78" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <Box
      component={motion.div}
      key={commodity || 'default'}
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: opacity, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      sx={{
        position: 'absolute',
        top: -10,
        right: -10,
        width: size,
        height: size,
        pointerEvents: 'none',
        zIndex: 0,
        color: color,
        filter: `drop-shadow(0 0 15px ${color})`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {getSvgPath(commodity)}
      </svg>
    </Box>
  );
}
