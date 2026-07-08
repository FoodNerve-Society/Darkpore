import { useState } from 'react';
import html2canvas from 'html2canvas';

const useExportAsImage = (ref: React.RefObject<HTMLElement>) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async (imageFileName: string) => {
    if (!ref.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(ref.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null, // preserve transparency if any
      });
      const image = canvas.toDataURL('image/png', 1.0);
      downloadImage(image, imageFileName);
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadImage = (blob: string, fileName: string) => {
    const fakeLink = window.document.createElement('a');
    fakeLink.style.display = 'none';
    fakeLink.download = fileName;
    fakeLink.href = blob;
    document.body.appendChild(fakeLink);
    fakeLink.click();
    document.body.removeChild(fakeLink);
    fakeLink.remove();
  };

  return { exportAsImage, isExporting };
};

export default useExportAsImage;
