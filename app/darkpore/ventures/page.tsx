"use client";
import { useState } from 'react';
import styles from '../darkpore.module.css';
import Link from 'next/link';

const DEALS = [
  {
    id: 'solar-cold-chain', title: 'Solar Cold-Chain Franchise', sector: 'Energy & Logistics',
    summary: 'A distributed network of off-grid solar cold rooms. Prevents 40% post-harvest loss in rural tomato and pepper belts.',
    minCapital: '₦50,000,000',
  },
  {
    id: 'urban-efinrin', title: 'Urban Efinrin Microfarms', sector: 'Agriculture',
    summary: 'High-yield hydroponic vertical farming units installed in abandoned Lagos warehouses. Focuses on premium herbs.',
    minCapital: '₦15,000,000',
  },
  {
    id: 'agro-data-licensing', title: 'AgroLLM Data Licensing', sector: 'AI & Data',
    summary: 'Proprietary dataset of 500,000 rural farming practices modeled for Gemini 3.5. B2B licensing for governments.',
    minCapital: '₦100,000,000',
  },
  {
    id: 'aquaculture-drones', title: 'Aquaculture Drone Monitors', sector: 'Hardware',
    summary: 'Automated water-quality drones for large-scale catfish farming, reducing mortality rates by 30%.',
    minCapital: '₦25,000,000',
  },
  {
    id: 'cassava-ethanol', title: 'Cassava Bio-Ethanol Refineries', sector: 'Energy',
    summary: 'Decentralized micro-refineries converting cassava waste into clean cooking fuel for rural communities.',
    minCapital: '₦80,000,000',
  },
  {
    id: 'agric-fintech', title: 'Uncollateralized Micro-Loans', sector: 'Fintech',
    summary: 'AI-driven lending protocol using harvest-yield predictions to issue micro-loans to unbanked farmers.',
    minCapital: '₦250,000,000',
  }
];

export default function VenturesDirectory() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Agriculture', 'Energy & Logistics', 'AI & Data', 'Hardware', 'Fintech'];

  const filteredDeals = activeFilter === 'All' 
    ? DEALS 
    : DEALS.filter(d => d.sector === activeFilter || d.sector.includes(activeFilter.split(' ')[0]));

  return (
    <>
      <div style={{ marginBottom: '3rem' }}>
        <h1 className={styles.heroTitle} style={{ fontSize: '4rem' }}>Ventures Directory</h1>
        <p className={styles.heroSubtitle}>Browse the complete 1-to-n venture matrix.</p>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                fontFamily: 'var(--font-quicksand)',
                fontWeight: 600,
                background: activeFilter === f ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
                color: activeFilter === f ? '#000' : '#fff',
                border: `1px solid ${activeFilter === f ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
                padding: '0.6rem 1.5rem', borderRadius: '100px', cursor: 'pointer', transition: 'all 0.3s'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.dealGrid}>
        {filteredDeals.map((deal) => (
          <div key={deal.id} className={styles.glassCard}>
             {/* Image Placeholder */}
             <div className={styles.cardImagePlaceholder}>
               Architectural Blueprint / Rendering
             </div>

            <div style={{ fontSize: '0.85rem', color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              {deal.sector}
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 1rem 0' }}>{deal.title}</h3>
            <p style={{ color: '#d1d1d6', lineHeight: 1.5, marginBottom: '1.5rem', fontSize: '1rem', flexGrow: 1 }}>
              {deal.summary}
            </p>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ color: '#a1a1a6', fontSize: '0.85rem' }}>Minimum to Invest:</span>
              <span style={{ float: 'right', fontWeight: 700, fontSize: '1.1rem', color: '#fff', fontFamily: 'var(--font-dosis)' }}>{deal.minCapital}</span>
            </div>

            <Link href={`/ventures/${deal.id}`} className={styles.secondaryButton} style={{ textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
              View Deal Room →
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
