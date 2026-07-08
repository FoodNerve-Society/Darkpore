import { useState } from 'react';
import { toPng } from 'html-to-image';

const useExportAsImage = (ref: React.RefObject<HTMLElement>) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async (imageFileName: string) => {
    if (!ref.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2, // High resolution
        style: {
          transform: 'scale(1)',
        }
      });
      downloadImage(dataUrl, imageFileName);
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
