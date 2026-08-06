'use client';

import React, { useEffect, useRef } from 'react';

export default function EmailCaptureTrigger() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (!localStorage.getItem('foodnerve_capture_seen')) {
            window.dispatchEvent(new Event('open-capture-modal'));
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '1px', visibility: 'hidden' }} />;
}
