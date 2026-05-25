"use client";
import { useState, useEffect } from 'react';
import styles from './darkpore.module.css';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  sector: string;
  summary: string;
  minCapital: string;
  isTrojan?: boolean;
}

const RAW_DEALS: Deal[] = [
  {
    id: 'solar-cold-chain',
    title: 'Solar Cold-Chain Franchise',
    sector: 'Energy & Logistics',
    summary: 'A distributed network of off-grid solar cold rooms. Prevents 40% post-harvest loss in rural tomato and pepper belts.',
    minCapital: '₦50,000,000',
  },
  {
    id: 'urban-efinrin',
    title: 'Urban Efinrin Microfarms',
    sector: 'Agriculture',
    summary: 'High-yield hydroponic vertical farming units installed in abandoned Lagos warehouses. Focuses on premium herbs.',
    minCapital: '₦15,000,000',
  },
  {
    id: 'agro-data-licensing',
    title: 'AgroLLM Data Licensing',
    sector: 'AI & Data',
    summary: 'Proprietary dataset of 500,000 rural farming practices modeled for Gemini 3.5. B2B licensing for governments.',
    minCapital: '₦100,000,000',
  }
];

// Only using RAW_DEALS for the Split Stage Dossier

export default function DarkporeHome() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-sliding Logic for Split Stage
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => current + 1);
    }, 5000); // 5 seconds matches the CSS timer animation
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Engineering the Future of <br />
          <span className={styles.neuralOmbre}>African Infrastructure.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Darkpore Media Africa operates a 1-to-n Venture Studio. We don't just build software; we architect the physical and digital pipelines moving the continent's agricultural wealth.
        </p>
        <div className={styles.buttonGroup}>
          <Link href="/ventures" className={styles.primaryButton}>
            See Industries to Invest In
          </Link>
          <Link href="/partners" className={styles.secondaryButton}>
            Book a One-on-One Meeting
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Active Ventures</h2>
          <Link href="/ventures" className={styles.secondaryButton} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
            See All Ventures →
          </Link>
        </div>
        
        {/* Split-Stage Dossier */}
        <div className={styles.splitStageContainer}>
          
          {/* Left Column: The Interactive Index */}
          <div className={styles.indexColumn}>
            {RAW_DEALS.map((deal, i) => {
              const isActive = activeIndex % RAW_DEALS.length === i;
              return (
                <div 
                  key={deal.id} 
                  className={`${styles.indexItem} ${isActive ? styles.active : ''}`}
                  onClick={() => setActiveIndex(i)}
                >
                  <div className={styles.indexSector}>{deal.sector}</div>
                  <div className={styles.indexTitle}>{deal.title}</div>
                  <div className={styles.indexTimerContainer}>
                    {isActive && <div className={styles.indexTimerBar} style={{ animation: 'fillTimer 5s linear forwards' }}></div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: The Dossier Stage */}
          <div className={styles.dossierStage}>
            {RAW_DEALS.map((deal, i) => {
              const isActive = activeIndex % RAW_DEALS.length === i;
              return (
                <div 
                  key={deal.id} 
                  className={`${styles.dossierContentWrapper} ${isActive ? styles.active : ''}`}
                >
                  <div className={styles.dossierImage}>
                    Architectural Blueprint
                  </div>
                  <div className={styles.dossierContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                          {deal.sector}
                        </div>
                        <h3 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>
                          {deal.title}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                          Minimum to Invest
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-dosis)' }}>
                          {deal.minCapital}
                        </div>
                      </div>
                    </div>
                    
                    <p style={{ color: '#e1e1e6', fontSize: '1.1rem', lineHeight: 1.6, flexGrow: 1 }}>
                      {deal.summary}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                      <Link href={`/ventures/${deal.id}`} className={styles.primaryButton} style={{ flex: 1, textAlign: 'center' }}>
                        View Deal Room →
                      </Link>
                      <Link href="/ventures" className={styles.secondaryButton}>
                        All Ventures
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Thesis Teaser - Below Fold */}
      <div className={styles.sectionBlock} style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)' }}>Software alone <br/>cannot feed Africa.</h2>
          <p style={{ color: '#a1a1a6', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            We won the 2020 Rockefeller Foundation Vision Prize because we understood that a decentralized food system requires <strong>physical rails</strong> bridged by <strong>neural networks</strong>. Discover our 1-to-n venture scaling philosophy.
          </p>
          <Link href="/thesis" className={styles.primaryButton}>
            Read the Manifesto
          </Link>
        </div>
        <div style={{ flex: 1, padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 60%)', animation: 'pulseBackground 15s infinite alternate' }}></div>
          <h4 style={{ color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '1rem', position: 'relative', zIndex: 2 }}>The 7 Wahaalas</h4>
          <ul style={{ position: 'relative', zIndex: 2, listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#d1d1d6', fontSize: '1.05rem', fontFamily: 'var(--font-dosis)' }}>
            <li>✓ Land Tenure</li>
            <li>✓ Access to Capital</li>
            <li>✓ Energy / Cold-Chain</li>
            <li>✓ Farm Inputs</li>
            <li>✓ Logistics & Safety</li>
            <li>✓ Post-Harvest Loss</li>
            <li>✓ Expensive Protein</li>
          </ul>
        </div>
      </div>

      {/* Infinite Marquee Strip */}
      <div className={styles.sectionBlock}>
        <p style={{ textAlign: 'center', color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '0rem' }}>
          Backed By Institutional Visionaries
        </p>
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeContent}>
            <span className={styles.partnerLogoText}>Rockefeller Foundation</span>
            <span className={styles.partnerLogoText}>World Bank IFC</span>
            <span className={styles.partnerLogoText}>Bill & Melinda Gates</span>
            <span className={styles.partnerLogoText}>Lagos State Govt</span>
            {/* Duplicated for seamless loop */}
            <span className={styles.partnerLogoText}>Rockefeller Foundation</span>
            <span className={styles.partnerLogoText}>World Bank IFC</span>
            <span className={styles.partnerLogoText}>Bill & Melinda Gates</span>
            <span className={styles.partnerLogoText}>Lagos State Govt</span>
          </div>
        </div>
      </div>
    </>
  );
}
