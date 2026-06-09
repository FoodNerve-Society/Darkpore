'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Typography, alpha } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';

export interface PremiumVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  aspectRatio?: string;
}

export default function PremiumVideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  aspectRatio = '16/9'
}: PremiumVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  let hideControlsTimeout: NodeJS.Timeout;

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const handleMouseLeave = () => {
    if (isPlaying) setShowControls(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  return (
    <Box 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
      sx={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio,
        borderRadius: 24, 
        overflow: 'hidden',
        bgcolor: '#000',
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        '&:fullscreen': {
          borderRadius: 0,
        }
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onClick={(e) => e.stopPropagation()} // Let the container handle the click
      />

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 80, height: 80, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
          pointerEvents: 'none' // Click passes through to container
        }}>
          <PlayArrowRoundedIcon sx={{ fontSize: 48, color: 'white', ml: 0.5 }} />
        </Box>
      )}

      {/* Bottom Controls Pill */}
      <Box sx={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)', maxWidth: 600,
        bgcolor: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(24px)',
        borderRadius: 100, // M3 fully rounded floating pill
        p: 1, px: 2,
        display: 'flex', alignItems: 'center', gap: 2,
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
        translate: showControls ? '0 0' : '0 20px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }} onClick={(e) => e.stopPropagation()}>
        
        <IconButton onClick={togglePlay} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        </IconButton>

        {/* Scrubber */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Box 
            onClick={handleProgressClick}
            sx={{ 
              width: '100%', height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              '&:hover': { height: 8 }
            }}
          >
            <Box sx={{ 
              position: 'absolute', left: 0, top: 0, height: '100%', 
              width: `${progress}%`, bgcolor: 'white', borderRadius: 3,
              transition: 'width 0.1s linear'
            }} />
          </Box>
        </Box>

        <IconButton onClick={toggleMute} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          {isMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
        </IconButton>

        <IconButton onClick={toggleFullscreen} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <FullscreenRoundedIcon />
        </IconButton>

      </Box>
    </Box>
  );
}
