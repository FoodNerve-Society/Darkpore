"use client";
import { useState } from 'react';
import styles from '../darkpore.module.css';
import Link from 'next/link';

export default function PartnersPage() {
  const [showModal, setShowModal] = useState(false);

  const handle1on1Click = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/" style={{ color: '#a1a1a6', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block', fontFamily: 'var(--font-dosis)' }}>
        ← Back Home
      </Link>
      
      <h1 className={styles.heroTitle} style={{ fontSize: '4rem', marginBottom: '1rem' }}>Partner With Us</h1>
      <p style={{ color: '#a1a1a6', marginBottom: '3rem', fontSize: '1.2rem', lineHeight: 1.6 }}>
        Direct intake for Whales, Joint Ventures, and Government Data Licensing. Skip the Deal Room paywalls and speak directly with the architect.
      </p>

      {/* Two Paths */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Office Hours Form */}
        <form className={styles.glassCard}>
          <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>Group Office Hours</h3>
          <p style={{ color: '#a1a1a6', marginBottom: '2rem', fontSize: '0.95rem' }}>Join our weekly public technical breakdown. Free to attend.</p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d1d6', fontFamily: 'var(--font-dosis)', fontWeight: 600 }}>Institutional Email</label>
            <input type="email" placeholder="you@fund.com" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', fontFamily: 'var(--font-ysabeau)' }} />
          </div>

          <button type="button" className={styles.secondaryButton} style={{ width: '100%' }}>Register for Office Hours</button>
        </form>

        {/* 1-on-1 Call velvet rope */}
        <div className={styles.glassCard} style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>Executive 1-on-1 Call</h3>
          <p style={{ color: '#a1a1a6', marginBottom: '2rem', fontSize: '0.95rem' }}>Reserved for verified institutional investors and government agencies.</p>
          <button onClick={handle1on1Click} className={styles.primaryButton} style={{ width: '100%' }}>Book Executive Call</button>
        </div>

      </div>

      {/* Auth Modal for 1-on-1 Call */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className={styles.glassCard} style={{ maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem', color: '#fff' }}>Verify Institutional Status</h3>
            <p style={{ color: '#a1a1a6', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.5 }}>
              To book a direct 1-on-1 call, you must first authenticate via the Food Nerve Society.
            </p>
            <input 
              type="email" 
              placeholder="investor@fund.com" 
              style={{
                width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                borderRadius: '8px', marginBottom: '1rem', boxSizing: 'border-box',
                fontFamily: 'var(--font-quicksand)'
              }}
            />
            <button onClick={() => setShowModal(false)} className={styles.primaryButton} style={{ width: '100%' }}>
              Login to the Society
            </button>
            <button onClick={() => setShowModal(false)} style={{
              background: 'none', border: 'none', color: '#a1a1a6', width: '100%', marginTop: '1rem', cursor: 'pointer',
              fontFamily: 'var(--font-quicksand)', fontWeight: 600
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Institutional Marquee */}
      <div style={{ marginTop: '8rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '4rem', margin: '8rem -4rem 0 -4rem' }}>
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

    </div>
  );
}
