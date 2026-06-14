import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Modal, IconButton, Backdrop, Fade, Link } from '@mui/material';
import { Close as CloseIcon, Fullscreen as FullscreenIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';

export type EvidenceItem = {
  url: string;
  caption?: string;
  sourceName?: string;
  sourceUrl?: string;
};

type EvidenceGalleryBlockProps = {
  content: {
    items?: EvidenceItem[];
  };
  themeMode?: 'light' | 'dark';
};

export const EvidenceGalleryBlock: React.FC<EvidenceGalleryBlockProps> = ({ content, themeMode = 'light' }) => {
  const isDark = themeMode === 'dark';
  
  // 1. FILTER EMPTY ITEMS immediately
  const rawItems = content.items || [];
  const validItems = rawItems.filter(item => item.url && item.url.trim() !== '');

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = () => {
    if (!scrollContainerRef.current || validItems.length <= 1) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;
    const centerPos = scrollLeft + width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    itemRefs.current.forEach((el, index) => {
      if (el) {
        const elCenter = el.offsetLeft + el.offsetWidth / 2;
        const distance = Math.abs(centerPos - elCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollToItem = (index: number) => {
    const el = itemRefs.current[index];
    const container = scrollContainerRef.current;
    if (el && container) {
      const elCenter = el.offsetLeft + el.offsetWidth / 2;
      const targetScrollLeft = elCenter - container.offsetWidth / 2;
      container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex !== null) {
        if (e.key === 'ArrowRight') {
          setSelectedImageIndex(prev => prev !== null && prev < validItems.length - 1 ? prev + 1 : prev);
        } else if (e.key === 'ArrowLeft') {
          setSelectedImageIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, validItems.length]);

  if (validItems.length === 0) return null;

  const isSingle = validItems.length === 1;

  return (
    <Box sx={{ my: 6, maxWidth: '100%', overflowX: 'hidden', py: 2 }}>
      {/* Scrollable Container */}
      <Box 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{ 
          display: 'flex', 
          justifyContent: isSingle ? 'center' : 'flex-start',
          gap: 3, 
          overflowX: 'auto', 
          pb: 2,
          scrollSnapType: isSingle ? 'none' : 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          // Padding to allow first and last items to be perfectly centered without expanding the page
          px: isSingle ? 0 : { xs: '20%', sm: '30%', md: '35%' },
        }}
      >
        {validItems.map((item, index) => {
          const isActive = isSingle || index === activeIndex;
          
          let transformStyle = 'scale(1) perspective(1000px) rotateY(0deg)';
          if (!isActive && !isSingle) {
            if (index < activeIndex) {
              transformStyle = 'scale(0.85) perspective(1000px) rotateY(25deg)';
            } else {
              transformStyle = 'scale(0.85) perspective(1000px) rotateY(-25deg)';
            }
          }
          
          return (
            <Box 
              key={index}
              ref={(el) => { itemRefs.current[index] = el as HTMLDivElement | null; }}
              data-index={index}
              sx={{ 
                minWidth: isSingle ? '100%' : { xs: '65%', sm: '45%', md: '30%' },
                maxWidth: isSingle ? '100%' : { xs: 260, md: 300 },
                flexShrink: 0,
                scrollSnapAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                // 3D Focus State Animation
                transform: transformStyle,
                opacity: isActive ? 1 : 0.6,
                filter: isActive ? 'none' : 'grayscale(20%)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                zIndex: isActive ? 10 : 1,
                cursor: isActive ? 'default' : 'pointer'
              }}
              onClick={() => {
                // If clicking an inactive card, scroll it into focus instead of opening lightbox
                if (!isActive && !isSingle) {
                  scrollToItem(index);
                }
              }}
            >
              {/* Image Card */}
              <Box 
                sx={{ 
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  bgcolor: isDark ? '#000' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                  height: isSingle ? { xs: 260, md: 320 } : 'auto',
                  aspectRatio: isSingle ? 'auto' : '1/1',
                  cursor: isActive ? 'zoom-in' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  '&:hover .overlay': { opacity: isActive ? 1 : 0 },
                  boxShadow: isActive && !isSingle ? (isDark ? '0 20px 40px -10px rgba(0,0,0,0.6)' : '0 20px 40px -10px rgba(0,0,0,0.15)') : 'none',
                  transition: 'box-shadow 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
                onClick={(e) => {
                  if (isActive) {
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }
                }}
              >
                <img 
                  src={item.url} 
                  alt={item.caption || 'Evidence'} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <Box 
                  className="overlay"
                  sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    bgcolor: 'rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                    backdropFilter: 'blur(2px)'
                  }}
                >
                  <FullscreenIcon sx={{ color: '#fff', fontSize: '3rem' }} />
                </Box>
              </Box>

              {/* Caption & Source Attribution */}
              <Box 
                sx={{ 
                  px: 1, 
                  opacity: isActive ? 1 : 0, 
                  transform: isActive ? 'translateY(0)' : 'translateY(-10px)',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
              >
                {item.caption && (
                  <Typography sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {item.caption}
                  </Typography>
                )}
                {item.sourceName && (
                  <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem', fontWeight: 500, mt: 0.5, fontStyle: 'italic' }}>
                    Source:{' '}
                    {item.sourceUrl ? (
                      <Link href={item.sourceUrl} target="_blank" rel="noopener noreferrer" sx={{ color: '#0ea5e9', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        {item.sourceName}
                      </Link>
                    ) : (
                      item.sourceName
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Pagination Numbers */}
      {!isSingle && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
          {validItems.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => scrollToItem(idx)}
              sx={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                bgcolor: activeIndex === idx ? (isDark ? '#fff' : '#0f172a') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                color: activeIndex === idx ? (isDark ? '#000' : '#fff') : (isDark ? '#94a3b8' : '#64748b'),
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                transform: activeIndex === idx ? 'scale(1.1)' : 'scale(1)',
                '&:hover': {
                  bgcolor: activeIndex === idx ? undefined : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
                }
              }}
            >
              {idx + 1}
            </Box>
          ))}
        </Box>
      )}

      {/* Lightbox Modal */}
      <Modal
        open={selectedImageIndex !== null}
        onClose={() => setSelectedImageIndex(null)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backdropFilter: 'blur(10px)', bgcolor: 'rgba(0,0,0,0.8)' }
          },
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 }, zIndex: 9999 }}
      >
        <Fade in={selectedImageIndex !== null}>
          <Box sx={{ position: 'relative', maxWidth: '100vw', maxHeight: '100vh', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            
            {/* Prev Button */}
            {selectedImageIndex !== null && selectedImageIndex > 0 && (
              <IconButton 
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(selectedImageIndex - 1); }}
                sx={{ position: 'absolute', left: { xs: 8, md: 40 }, color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, zIndex: 10 }}
              >
                <ChevronLeft fontSize="large" />
              </IconButton>
            )}

            {selectedImageIndex !== null && validItems[selectedImageIndex] && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: { xs: 6, md: 10 } }}>
                <img 
                  src={validItems[selectedImageIndex].url} 
                  alt={validItems[selectedImageIndex].caption || 'Fullscreen Evidence'}
                  style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} 
                />
                <Box sx={{ mt: 2, textAlign: 'center', maxWidth: '800px' }}>
                  {validItems[selectedImageIndex].caption && (
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>
                      {validItems[selectedImageIndex].caption}
                    </Typography>
                  )}
                  {validItems[selectedImageIndex].sourceName && (
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', mt: 0.5, fontStyle: 'italic' }}>
                      Source:{' '}
                      {validItems[selectedImageIndex].sourceUrl ? (
                        <Link href={validItems[selectedImageIndex].sourceUrl} target="_blank" rel="noopener noreferrer" sx={{ color: '#0ea5e9', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                          {validItems[selectedImageIndex].sourceName}
                        </Link>
                      ) : (
                        validItems[selectedImageIndex].sourceName
                      )}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Next Button */}
            {selectedImageIndex !== null && selectedImageIndex < validItems.length - 1 && (
              <IconButton 
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(selectedImageIndex + 1); }}
                sx={{ position: 'absolute', right: { xs: 8, md: 40 }, color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, zIndex: 10 }}
              >
                <ChevronRight fontSize="large" />
              </IconButton>
            )}

            <IconButton 
              onClick={() => setSelectedImageIndex(null)}
              sx={{ 
                position: 'absolute', top: 24, right: 24, 
                color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                zIndex: 10
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};
