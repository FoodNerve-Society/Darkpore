"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Box, IconButton, Tooltip, CircularProgress, SxProps, Theme } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import html2canvas from 'html2canvas';

// ==========================================
// 1. Hook for manual control
// ==========================================
export function useExportAsImage() {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = useCallback(async (element: HTMLElement | null, fileName: string = 'export') => {
    if (!element) {
      console.warn('No element provided to exportAsImage');
      return false;
    }
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for retina displays
        useCORS: true, // Allow external images to load
        backgroundColor: null, // Keeps background transparent if no background color is set
        logging: false, // Clean console
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (err) {
      console.error('Failed to export image', err);
      return false;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportAsImage, isExporting };
}

// ==========================================
// 2. Wrapper Component for drop-in usage
// ==========================================
interface ExportAsImageProps {
  children: React.ReactNode;
  fileName?: string;
  showButtonHoverOnly?: boolean;
  buttonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  buttonSx?: SxProps<Theme>;
}

export default function ExportAsImage({ 
  children, 
  fileName = 'export', 
  showButtonHoverOnly = true,
  buttonPosition = 'top-right',
  buttonSx = {}
}: ExportAsImageProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { exportAsImage, isExporting } = useExportAsImage();

  const handleExport = () => {
    exportAsImage(nodeRef.current, fileName);
  };

  // Determine button positioning
  const positionStyles = {
    'top-right': { top: 8, right: 8 },
    'top-left': { top: 8, left: 8 },
    'bottom-right': { bottom: 8, right: 8 },
    'bottom-left': { bottom: 8, left: 8 },
  }[buttonPosition];

  return (
    <Box sx={{ position: 'relative', '&:hover .export-btn': { opacity: 1 } }}>
      {/* The target node to capture */}
      <Box ref={nodeRef} sx={{ position: 'relative', width: 'fit-content' }}>
        {children}
      </Box>
      
      {/* Floating Download Button */}
      <Box 
        className="export-btn"
        sx={{ 
          position: 'absolute', 
          ...positionStyles,
          opacity: showButtonHoverOnly ? 0 : 1,
          transition: 'all 0.2s ease-in-out',
          zIndex: 10,
        }}
      >
        <Tooltip title="Download as Image" arrow placement="top">
          <IconButton 
            onClick={handleExport} 
            disabled={isExporting}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)', 
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
              color: '#0f172a',
              '&:hover': { 
                bgcolor: '#fff',
                transform: 'scale(1.05)'
              },
              ...buttonSx
            }}
          >
            {isExporting ? <CircularProgress size={16} sx={{ color: '#0f172a' }} /> : <DownloadIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
