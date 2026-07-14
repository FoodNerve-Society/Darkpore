"use client";
import { useState, use } from 'react';
import styles from '../../darkpore.module.css';
import Link from 'next/link';

const DEALS = [
  { id: 'solar-cold-chain', title: 'Solar Cold-Chain Franchise', sector: 'Energy & Logistics' },
  { id: 'urban-efinrin', title: 'Urban Efinrin Microfarms', sector: 'Agriculture' },
  { id: 'agro-data-licensing', title: 'AgroLLM Data Licensing', sector: 'AI & Data' },
  { id: 'aquaculture-drones', title: 'Aquaculture Drone Monitors', sector: 'Hardware' },
  { id: 'cassava-ethanol', title: 'Cassava Bio-Ethanol Refineries', sector: 'Energy' },
  { id: 'agric-fintech', title: 'Uncollateralized Micro-Loans', sector: 'Fintech' }
];

export default function DealRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [showModal, setShowModal] = useState(false);

  // Navigation Logic
  const currentIndex = DEALS.findIndex(d => d.id === id);
  const currentDeal = DEALS[currentIndex] || DEALS[0];
  const prevDeal = currentIndex > 0 ? DEALS[currentIndex - 1] : null;
  const nextDeal = currentIndex < DEALS.length - 1 ? DEALS[currentIndex + 1] : null;

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/ventures" style={{ color: '#a1a1a6', textDecoration: 'none', fontFamily: 'var(--font-dosis)', letterSpacing: '0.05em' }}>
          ← Back to Active Ventures
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {prevDeal ? (
            <Link href={`/ventures/${prevDeal.id}`} className={styles.secondaryButton} style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
              ← Prev Deal
            </Link>
          ) : <div style={{ width: '100px' }}></div>}
          
          {nextDeal ? (
            <Link href={`/ventures/${nextDeal.id}`} className={styles.secondaryButton} style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
              Next Deal →
            </Link>
          ) : <div style={{ width: '100px' }}></div>}
        </div>
      </div>

      {/* Hero Section */}
      <div>
        <div style={{ fontSize: '1rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', fontFamily: 'var(--font-dosis)' }}>
          {currentDeal.sector} • Active Deal Room
        </div>
        <h1 className={styles.heroTitle} style={{ fontSize: '4.5rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
          {currentDeal.title}
        </h1>
        <p style={{ color: '#a1a1a6', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '800px' }}>
          A high-yield infrastructure asset mitigating post-harvest loss through a decentralized hardware-as-a-service model.
        </p>
      </div>

      {/* Blueprint Image */}
      <div className={styles.blueprintHero} style={{ height: '400px' }}>
        Detailed Engineering Blueprint Rendering
      </div>

      {/* Grid Layout: Free Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
        
        {/* Left: The Pitch (Free) */}
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)' }}>The Problem</h2>
          <p style={{ color: '#d1d1d6', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '3rem' }}>
            Over 40% of agricultural yield in Sub-Saharan Africa is lost during the post-harvest phase. This is purely a physical infrastructure failure. 
            Without reliable cold-chain logistics, rural farmers are forced into "panic selling," destroying price parity and creating extreme food insecurity in urban centers.
          </p>

          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)' }}>The Solution</h2>
          <p style={{ color: '#d1d1d6', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '3rem' }}>
            We are deploying a decentralized network of off-grid solar-powered cold storage rooms directly in the highest-yield farming belts. 
            By utilizing a hardware-as-a-service model, farmers pay a micro-fee per crate to store their produce, extending shelf life from 2 days to 21 days.
          </p>
        </div>

        {/* Right: Metrics (Free) */}
        <div>
          <div className={styles.glassCard} style={{ padding: '2rem' }}>
            <h4 style={{ color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Minimum Ticket Size</h4>
            <div style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-dosis)', fontWeight: 700, marginBottom: '2rem' }}>₦50,000,000</div>

            <h4 style={{ color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Target Market Size</h4>
            <div style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-dosis)', fontWeight: 700, marginBottom: '2rem' }}>$12.5 Billion</div>

            <h4 style={{ color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Sector</h4>
            <div style={{ fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-dosis)', fontWeight: 500 }}>{currentDeal.sector}</div>
          </div>
        </div>
      </div>

      {/* The Velvet Rope Paywall Section (Locked) */}
      <div className={styles.blurredSection}>
        <div className={styles.blurredContent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          
          {/* Dummy Text for Security */}
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)' }}>Execution Roadmap</h2>
            <p style={{ color: '#d1d1d6', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '1rem' }}>
              ████████████████████████████████████████████████████████████████████████████
              ████████████████████████████████████████████████████████████████████████████
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem', color: '#fff' }}><strong>Q3 2026:</strong> ████████████████████████</li>
              <li style={{ marginBottom: '1rem', color: '#fff' }}><strong>Q4 2026:</strong> ████████████████████████</li>
            </ul>

            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)', marginTop: '3rem' }}>Cap Table & Valuation</h2>
            <p style={{ color: '#d1d1d6', fontSize: '1.15rem', lineHeight: 1.8 }}>
              Current Valuation: $███,███,███<br/>
              Lead Investor: ██████████████<br/>
              Committed Capital: $███,███,███
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)' }}>Live Progress Updates</h2>
            <div className={styles.glassCard} style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ color: '#ffd700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>UPDATE • MAY 12, 2026</div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Hardware Shipment Arrived</h4>
              <p style={{ color: '#a1a1a6' }}>████████████████████████████████████████████████████████</p>
            </div>
            <div className={styles.glassCard} style={{ padding: '1.5rem' }}>
              <div style={{ color: '#ffd700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>UPDATE • APRIL 28, 2026</div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Land Tenure Secured</h4>
              <p style={{ color: '#a1a1a6' }}>████████████████████████████████████████████████████████</p>
            </div>
          </div>
        </div>

        {/* Overlay */}
        <div className={styles.lockOverlay}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.5rem', color: '#fff', fontFamily: 'var(--font-playfair)' }}>
            Classified Data
          </h2>
          <p style={{ color: '#a1a1a6', textAlign: 'center', marginBottom: '2rem', maxWidth: '400px' }}>
            The Execution Roadmap, Cap Table, and Live Project Updates are restricted to verified members of the Society.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleUnlockClick} className={styles.primaryButton}>
              Pay ₦5,000 to Unlock
            </button>
            <button onClick={handleUnlockClick} className={styles.secondaryButton}>
              Apply to Invest
            </button>
          </div>
        </div>
      </div>

      {/* Auth/Pay Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className={styles.glassCard} style={{ maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--font-dosis)' }}>Authenticate</h3>
            <p style={{ color: '#a1a1a6', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.5 }}>
              Enter your email to secure access. You will be automatically routed to the FoodNerve Society to complete your profile.
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
              Proceed to Paystack (₦5,000)
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
    </div>
  );
}
