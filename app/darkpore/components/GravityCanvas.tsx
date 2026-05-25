"use client";
import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  baseHue: number;
}

export default function GravityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  
  // Only draw connectors on the homepage or innovations root
  const shouldDrawConnectors = pathname === '/darkpore' || pathname === '/';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Physics Constants
    const UPWARD_DRIFT = -0.015; 
    const FRICTION = 0.98;
    const INTERACTION_RADIUS = 200;
    const MOUSE_REPULSION = 1.5;
    const CONNECTION_DISTANCE = 120; // Distance to draw net lines

    let mouse = { x: -1000, y: -1000 };
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particles.length === 0) {
        initParticles();
      }
    };

    const createParticle = (startY?: number): Particle => {
      let x = 0;
      if (shouldDrawConnectors) {
        x = Math.random() * canvas.width;
      } else {
        // Spawn only on the far left or far right edges (within 250px)
        const isLeft = Math.random() > 0.5;
        const edgeWidth = 250;
        x = isLeft ? Math.random() * edgeWidth - 50 : canvas.width - edgeWidth + Math.random() * edgeWidth + 50;
      }
      
      const y = startY !== undefined ? startY : canvas.height + Math.random() * 200;
      
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 0.5, 
        radius: Math.random() * 2.5 + 1,
        mass: Math.random() * 1.5 + 0.5,
        baseHue: 35 + Math.random() * 25 
      };
    };

    const initParticles = () => {
      particles = [];
      // Use much fewer particles to save GPU. 
      // 25000 means roughly 80 particles on a 1080p screen instead of 250+.
      const density = shouldDrawConnectors ? 25000 : 35000;
      const numParticles = Math.floor((window.innerWidth * window.innerHeight) / density); 
      for (let i = 0; i < numParticles; i++) {
        particles.push(createParticle(Math.random() * canvas.height));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    resize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // Global pulsing speed multiplier (accelerate and decelerate all particles)
      const globalSpeed = 1 + Math.sin(time * 0.5) * 0.6;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply Upward Drift with global pulse
        p.vy += UPWARD_DRIFT * (1 / p.mass) * globalSpeed;

        // Apply Wave Force
        const waveForce = Math.sin(time * 2 + p.y * 0.01) * 0.05 * globalSpeed;
        p.vx += waveForce;

        // Apply Friction
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // Mouse Interaction (Repulsion)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < INTERACTION_RADIUS) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (INTERACTION_RADIUS - distance) / INTERACTION_RADIUS;
          
          p.vx += forceDirectionX * force * MOUSE_REPULSION * (1 / p.mass);
          p.vy += forceDirectionY * force * MOUSE_REPULSION * (1 / p.mass);
        }

        // Apply Velocity with global pulse
        p.x += p.vx * globalSpeed;
        p.y += p.vy * globalSpeed;

        // If not drawing connectors (inner pages), keep them strictly at the edges
        if (!shouldDrawConnectors) {
          const centerX = canvas.width / 2;
          const distToCenter = p.x - centerX;
          
          // If they drift too far towards the center, push them back out to their respective edge
          if (Math.abs(distToCenter) < (centerX - 250)) {
            // They are in the "forbidden" center zone
            const pushForce = distToCenter > 0 ? 1 : -1;
            p.vx += pushForce * 0.1; 
          }
        }

        // Perpetual Respawn
        if (p.y < -100 || p.x < -100 || p.x > canvas.width + 100) {
          Object.assign(p, createParticle(canvas.height + 50));
        }
      }

      // Draw Net Connections ONLY on the designated pages
      if (shouldDrawConnectors) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONNECTION_DISTANCE) {
              const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
              const avgHue = (p1.baseHue + p2.baseHue) / 2;
              
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `hsla(${avgHue}, 80%, 50%, ${opacity})`;
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.closePath();
            }
          }
        }
      }

      // Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dynamicHue = p.baseHue + Math.sin(time + p.y * 0.005) * 10;
        
        let opacity = 0.8;
        if (p.y > canvas.height - 100) {
          opacity = 1 - ((p.y - (canvas.height - 100)) / 100);
        } else if (p.y < 200) {
          opacity = p.y / 200; 
        }
        opacity = Math.max(0, Math.min(1, opacity)) * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${dynamicHue}, 80%, 50%, ${opacity})`;
        ctx.fill();
        ctx.closePath();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldDrawConnectors]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'transparent'
      }}
    />
  );
}
