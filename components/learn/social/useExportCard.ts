import { useCallback, useState } from 'react';
import * as htmlToImage from 'html-to-image';

export const useExportCard = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = useCallback(async (element: HTMLElement | null, filename: string = 'social-card.png') => {
    if (!element) return;
    
    try {
      setIsExporting(true);
      // Wait a moment for fonts/images to fully load if necessary
      await new Promise(r => setTimeout(r, 200));

      const dataUrl = await htmlToImage.toPng(element, { 
        quality: 1, 
        pixelRatio: 2, // High resolution for Retina displays
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportAsImage, isExporting };
};
