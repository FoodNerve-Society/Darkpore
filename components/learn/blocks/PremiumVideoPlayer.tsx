import React, { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Slider } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeOff } from '@mui/icons-material';

export default function PremiumVideoPlayer({ src, autoPlay = true }: { src: string, autoPlay?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<any>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && videoRef.current) {
            videoRef.current.pause();
            setPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (playing) {
      videoRef.current?.play().catch(() => setPlaying(false));
    } else {
      videoRef.current?.pause();
    }
  }, [playing]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const handleSeek = (e: any, newValue: number | number[]) => {
    if (!videoRef.current) return;
    const time = ((newValue as number) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setProgress(newValue as number);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setPlaying(!playing);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(!muted);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 2000);
  };

  return (
    <Box 
      sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000', borderRadius: '8px', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
        playsInline
        style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
      />
      
      {/* Giant Play Button Overlay (when paused) */}
      {!playing && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
          <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlayArrow sx={{ fontSize: 40, color: '#fff' }} />
          </Box>
        </Box>
      )}

      {/* Premium Bottom Controls */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', opacity: showControls || !playing ? 1 : 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', gap: 2 }} onClick={e => e.stopPropagation()}>
        <IconButton onClick={togglePlay} sx={{ color: '#fff' }}>
          {playing ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <Slider 
          value={progress} 
          onChange={handleSeek} 
          sx={{ color: '#0ea5e9', '& .MuiSlider-thumb': { width: 12, height: 12, '&:hover, &.Mui-focusVisible': { boxShadow: '0px 0px 0px 8px rgba(14, 165, 233, 0.16)' } } }} 
        />
        
        <IconButton onClick={toggleMute} sx={{ color: '#fff' }}>
          {muted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
      </Box>
    </Box>
  );
}
