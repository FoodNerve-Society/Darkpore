"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { VECTORS, FEATURES, CELLS, MatrixVector, MatrixFeature, MatrixCell } from './MatrixData';

const BUILD_REQUIREMENTS: Record<string, { title: string, color: string, reqs: { name: string, detail: string }[] }> = {
  'trade': {
    title: '/trade', color: '#ffd700',
    reqs: [
      { name: 'B2B Escrow Smart Contracts', detail: 'Secure, milestone-based smart contracts holding buyer funds in escrow until delivery is verified by on-ground agents.' },
      { name: 'Flash Sale Engine', detail: 'High-frequency trading engine for perishable goods. Requires precise inventory countdowns to drive FOMO.' },
      { name: 'Logistics Webhooks', detail: 'Real-time API integrations with local transport networks to track physical cargo movement across state lines.' },
      { name: 'Viral Share Loops', detail: 'Incentivized WhatsApp/social sharing allowing operators to blast group-buy links to their networks for commission.' }
    ]
  },
  'learn': {
    title: '/learn', color: '#10b981',
    reqs: [
      { name: 'SEO SSR Markdown CMS', detail: 'A fully static-generated blog architecture designed to capture organic search traffic for high-value agricultural terms.' },
      { name: 'Mux Livestreams', detail: 'Real-time video broadcasting for masterclasses, enforcing Proof-of-Life in an AI-dominated internet.' },
      { name: 'Playbook Generator', detail: 'Automated PDF generator that locks valuable "Agent Playbooks" behind an email capture wall.' },
      { name: 'Lead Funnels', detail: 'Analytics and tracking pipelines designed to move users from casual readers into registered platform participants.' }
    ]
  },
  'meet': {
    title: '/meet', color: '#3b82f6',
    reqs: [
      { name: 'Biometric Identity Hooks', detail: 'Integration with SmileID/Doja for immediate government-level KYC and physical facial scanning.' },
      { name: 'Algorithmic Ranking Feed', detail: 'A dynamic newsfeed that prioritizes posts based on the user\'s verified execution rank rather than pure engagement bait.' },
      { name: 'E2EE Messaging', detail: 'End-to-End Encrypted chat system allowing verified operators to negotiate high-ticket deals without interception.' },
      { name: 'Stripe Gate', detail: 'A robust subscription and payment gate preventing non-paying, unverified users from accessing the sanctuary.' }
    ]
  },
  'profile': {
    title: '/profile', color: '#8b5cf6',
    reqs: [
      { name: 'Immutable Tx Database', detail: 'A read-only ledger that logs every completed trade or investment an operator has successfully executed.' },
      { name: 'Vanity URLs', detail: 'Public-facing user profiles (e.g., darkpore.com/u/operator) built for SEO indexation and social flexing.' },
      { name: 'Dynamic Badging System', detail: 'Automated achievement engine that grants unforgeable status tiers based on transaction volume.' },
      { name: 'Arbitration Engine', detail: 'A ticketing and dispute resolution system to penalize fraudulent users and strip them of their verified rank.' }
    ]
  },
  'support': {
    title: '/support', color: '#ef4444',
    reqs: [
      { name: 'High-Ticket Remittance API', detail: 'B2B payment gateways capable of handling massive cross-border USD to NGN capital inflows legally.' },
      { name: 'Fractional Ownership', detail: 'A specialized ledger to track multi-party investments in physical assets like cold rooms or mini-grids.' },
      { name: 'AML/Sanctions Screen', detail: 'Automated daily screening against global OFAC and localized anti-money laundering databases.' },
      { name: 'ROI Dashboards', detail: 'A specialized financial UI for diaspora investors tracking the deployment and yield of their specific capital.' }
    ]
  },
  'updates': {
    title: '/updates', color: '#6b7280',
    reqs: [
      { name: 'Real-time WebSockets', detail: 'Bi-directional socket connections to instantly push trade hits and chat messages without manual refreshing.' },
      { name: 'Push Network (FCM/APN)', detail: 'Integration with Apple and Google notification services to wake the app up during critical events.' },
      { name: 'In-App Feeds', detail: 'A scalable UI pane aggregating all system alerts, DMs, and trade executions in chronological order.' },
      { name: 'Background Queue Workers', detail: 'Redis-backed asynchronous workers to process high-volume notification blasts without crashing the main thread.' }
    ]
  }
};

export default function StressTestPage() {
  const [selectedFeature, setSelectedFeature] = useState<MatrixFeature | null>(null);
  const [selectedVector, setSelectedVector] = useState<MatrixVector | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ vector: MatrixVector, feature: MatrixFeature, cell: MatrixCell } | null>(null);
  const [selectedFeatureTotal, setSelectedFeatureTotal] = useState<MatrixFeature | null>(null);
  const [selectedVectorTotal, setSelectedVectorTotal] = useState<MatrixVector | null>(null);
  const [selectedBuildFeature, setSelectedBuildFeature] = useState<string | null>(null);
  const [buildStepIndex, setBuildStepIndex] = useState<number>(0);

  const handleClose = () => {
    setSelectedFeature(null);
    setSelectedVector(null);
    setSelectedCell(null);
    setSelectedFeatureTotal(null);
    setSelectedVectorTotal(null);
    setSelectedBuildFeature(null);
  };
  
  const handleReqClick = (featureId: string, index: number) => {
    handleClose();
    setSelectedBuildFeature(featureId);
    setBuildStepIndex(index);
  };

  const isRowHighlighted = (vId: string) => {
    return selectedVector?.id === vId || selectedCell?.vector.id === vId || selectedVectorTotal?.id === vId;
  };

  const isColHighlighted = (fId: string) => {
    return selectedFeature?.id === fId || selectedCell?.feature.id === fId || selectedFeatureTotal?.id === fId;
  };

  // Shared coloring logic based on Percentage
  const getCellColor = (percentage: number) => {
    if (percentage >= 80) return 'rgba(16, 185, 129, 0.45)'; // Excellent
    if (percentage >= 60) return 'rgba(59, 130, 246, 0.45)'; // Good
    if (percentage >= 40) return 'rgba(245, 158, 11, 0.45)'; // Average
    if (percentage > 0) return 'rgba(239, 68, 68, 0.45)';  // Poor
    return 'rgba(220, 38, 38, 0.5)'; // Failing
  };

  const renderCell = (v: MatrixVector, f: MatrixFeature) => {
    const key = `${v.id}_${f.id}`;
    const cell = CELLS[key];
    if (!cell) return <td key={key} style={{ padding: '1rem', borderBottom: '1px solid #333' }}>-</td>;

    const percentage = Math.round((cell.baseScore / 5) * 100);
    const isHighlighted = isRowHighlighted(v.id) || isColHighlighted(f.id);
    const isDirectlySelected = selectedCell?.feature.id === f.id && selectedCell?.vector.id === v.id;

    return (
      <motion.td 
        key={key}
        onClick={() => { handleClose(); setSelectedCell({ vector: v, feature: f, cell }); }}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 10, position: 'relative' }}
        style={{ 
          padding: '1.2rem', 
          borderBottom: '1px solid #333', 
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: getCellColor(percentage),
          borderRight: '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.3s ease',
          opacity: (selectedCell || selectedFeature || selectedVector || selectedFeatureTotal || selectedVectorTotal) && !isHighlighted ? 0.3 : 1,
          boxShadow: isDirectlySelected ? '0 0 20px rgba(255,215,0,0.5)' : 'none'
        }}
      >
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isHighlighted ? '#fff' : '#e1e1e6' }}>{cell.baseScore * v.multiplier}</div>
        <div style={{ fontSize: '0.75rem', color: isHighlighted ? '#ffd700' : 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>Base: {cell.baseScore} / 5</div>
      </motion.td>
    );
  };

  // Calculate Feature Totals (Bottom Row)
  const featureTotals = FEATURES.map(f => {
    let sum = 0;
    VECTORS.forEach(v => {
      const cell = CELLS[`${v.id}_${f.id}`];
      if (cell) sum += cell.baseScore * v.multiplier;
    });
    return { id: f.id, total: sum };
  });

  // Calculate Vector Totals (Right Column)
  const vectorTotals = VECTORS.map(v => {
    let sum = 0;
    FEATURES.forEach(f => {
      const cell = CELLS[`${v.id}_${f.id}`];
      if (cell) sum += cell.baseScore * v.multiplier;
    });
    return { id: v.id, total: sum, max: FEATURES.length * 5 * v.multiplier };
  });

  const activeMaxVectorTotal = selectedVectorTotal ? FEATURES.length * 5 * selectedVectorTotal.multiplier : 0;
  const isAnyPanelOpen = !!(selectedCell || selectedFeature || selectedVector || selectedFeatureTotal || selectedVectorTotal);

  let activeBorderColor = 'rgba(255,215,0,0.2)';
  let activeAccentColor = '#ffd700';
  let activeShadowColor = 'rgba(255,215,0,0.05)';

  if (selectedCell) {
    const percentage = Math.round((selectedCell.cell.baseScore / 5) * 100);

    if (percentage >= 80) { activeBorderColor = 'rgba(16, 185, 129, 0.5)'; activeAccentColor = '#10b981'; activeShadowColor = 'rgba(16, 185, 129, 0.15)'; }
    else if (percentage >= 60) { activeBorderColor = 'rgba(59, 130, 246, 0.5)'; activeAccentColor = '#3b82f6'; activeShadowColor = 'rgba(59, 130, 246, 0.15)'; }
    else if (percentage >= 40) { activeBorderColor = 'rgba(245, 158, 11, 0.5)'; activeAccentColor = '#f59e0b'; activeShadowColor = 'rgba(245, 158, 11, 0.15)'; }
    else if (percentage > 0) { activeBorderColor = 'rgba(239, 68, 68, 0.5)'; activeAccentColor = '#ef4444'; activeShadowColor = 'rgba(239, 68, 68, 0.15)'; }
    else { activeBorderColor = 'rgba(220, 38, 38, 0.8)'; activeAccentColor = '#dc2626'; activeShadowColor = 'rgba(220, 38, 38, 0.2)'; }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', paddingBottom: '100px', fontFamily: 'var(--font-ysabeau)' }}>
      
      {/* HERO SECTION */}
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem', background: 'radial-gradient(circle at 50% 50%, #111 0%, #000 100%)' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={{ fontSize: '4.5rem', fontFamily: 'var(--font-playfair)', color: '#ffd700', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            We Don't Guess.<br/>We Calculate Survival.
          </h1>
          <p style={{ color: '#a1a1a6', fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            The Modular Society is a vast, interconnected architecture. To prevent capital destruction, we subjected every proposed feature to a 10-vector stress test measuring monetization, defensibility, and existential risk. <strong>The math dictates our priorities.</strong>
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <button 
              onClick={() => document.getElementById('matrix-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', backgroundColor: '#ffd700', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'var(--font-dosis)', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(255,215,0,0.2)' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              View Strategic Matrix
            </button>
            <button 
              onClick={() => document.getElementById('verdict-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', backgroundColor: 'rgba(255,215,0,0.05)', color: '#ffd700', border: '1px solid #ffd700', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'var(--font-dosis)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              View Priorities
            </button>
          </div>
        </motion.div>
      </div>

      {/* MATRIX SECTION */}
      <div id="matrix-section" style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-playfair)', color: '#ffd700', marginBottom: '1rem' }}>
            The Quantitative Matrix
          </h2>
          <p style={{ color: '#a1a1a6', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
            Click on any header or intersecting cell to review the raw strategic logic behind the score.
          </p>
        </div>

        {/* Premium Alert */}
        <div style={{ maxWidth: '900px', margin: '0 auto 4rem auto' }}>
          <Alert 
            severity="info" 
            icon={<InfoOutlinedIcon style={{ color: '#ffd700', fontSize: '2rem' }} />}
            style={{ 
              backgroundColor: 'rgba(255,215,0,0.05)', 
              border: '1px solid rgba(255,215,0,0.2)', 
              color: '#e1e1e6',
              fontFamily: 'var(--font-quicksand)',
              fontSize: '1.1rem'
            }}
          >
            <AlertTitle style={{ color: '#ffd700', fontFamily: 'var(--font-playfair)', fontSize: '1.4rem', fontWeight: 'bold' }}>
              The 10-Pillar Strategic Matrix
            </AlertTitle>
            A quantitative stress-test of the Modular Society architecture. We measure <strong>Survival</strong> (x3), <strong>Growth</strong> (x2), and <strong>Scale</strong> (x1) across 6 core pillars to expose mathematical priorities.
          </Alert>
        </div>

        {/* The Matrix Table */}
        <div style={{ background: 'rgba(10,10,10,0.8)', borderRadius: '16px', border: '1px solid #333', backdropFilter: 'blur(10px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', position: 'relative' }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', top: '80px', zIndex: 10, padding: '1.5rem', borderBottom: '2px solid #ffd700', backgroundColor: '#050505', minWidth: '250px' }}>
                  <div style={{ color: '#ffd700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Validation Vectors</div>
                </th>
                {FEATURES.map(f => {
                  const isHighlighted = isColHighlighted(f.id);
                  return (
                    <motion.th 
                      key={f.id}
                      whileHover={{ color: '#ffd700' }}
                      onClick={() => { handleClose(); setSelectedFeature(f); }}
                      style={{ 
                        position: 'sticky', top: '80px', zIndex: 10,
                        padding: '1.5rem 1rem', 
                        borderBottom: '2px solid #ffd700', 
                        backgroundColor: isHighlighted ? '#1a1a1a' : '#050505',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: isHighlighted ? '#ffd700' : '#fff',
                        fontSize: '1.2rem',
                        fontFamily: 'var(--font-dosis)',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background-color 0.3s, color 0.3s',
                        boxShadow: isHighlighted ? 'inset 0px -4px 0px #ffd700' : 'none'
                      }}
                    >
                      {f.name}
                    </motion.th>
                  );
                })}
                {/* Platform Strength Column Header */}
                <th style={{ position: 'sticky', top: '80px', zIndex: 10, padding: '1.5rem 1rem', borderBottom: '2px solid #ffd700', backgroundColor: '#050505', textAlign: 'center', color: '#ffd700', fontSize: '1.1rem' }}>
                  Platform Strength
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Group by Tiers */}
              {['Tier 1: Survival', 'Tier 2: Growth', 'Tier 3: Scale'].map((tier) => (
                <React.Fragment key={tier}>
                  <tr>
                    <td colSpan={8} style={{ padding: '1rem 1.5rem', backgroundColor: 'rgba(255,215,0,0.08)', color: '#ffd700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                      {tier}
                    </td>
                  </tr>
                  {VECTORS.filter(v => v.tier === tier).map((v) => {
                    const vt = vectorTotals.find(x => x.id === v.id);
                    const vTotal = vt?.total || 0;
                    const vMax = vt?.max || 1;
                    const percent = Math.round((vTotal / vMax) * 100);
                    const isHighlighted = isRowHighlighted(v.id);

                    return (
                      <tr key={v.id}>
                        <motion.td 
                          whileHover={{ color: '#ffd700', backgroundColor: 'rgba(255,255,255,0.05)' }}
                          onClick={() => { handleClose(); setSelectedVector(v); }}
                          style={{ 
                            padding: '1.2rem 1.5rem', 
                            borderBottom: '1px solid #333', 
                            cursor: 'pointer', 
                            borderRight: '1px solid #333',
                            backgroundColor: isHighlighted ? 'rgba(255,215,0,0.1)' : 'rgba(0,0,0,0)',
                            transition: 'background-color 0.3s',
                            boxShadow: isHighlighted ? 'inset 4px 0px 0px #ffd700' : 'none'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isHighlighted ? '#ffd700' : '#fff' }}>{v.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#a1a1a6', marginTop: '0.3rem' }}>Multiplier: x{v.multiplier}</div>
                        </motion.td>
                        
                        {FEATURES.map(f => renderCell(v, f))}

                        {/* Vector Total Percent Cell */}
                        <motion.td
                          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,215,0,0.1)', zIndex: 5, position: 'relative' }}
                          onClick={() => { handleClose(); setSelectedVectorTotal(v); }}
                          style={{ 
                            padding: '1.2rem 1rem', 
                            borderBottom: '1px solid #333', 
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: isHighlighted ? 'rgba(255,215,0,0.15)' : 'rgba(255,215,0,0.03)',
                            fontWeight: 'bold',
                            fontSize: '1.3rem',
                            color: '#ffd700',
                            transition: 'background-color 0.3s'
                          }}
                        >
                          {percent}%
                        </motion.td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
              
              {/* Totals Row */}
              <tr>
                <td style={{ padding: '1.5rem', borderTop: '2px solid #ffd700', backgroundColor: '#050505', fontWeight: 'bold', fontSize: '1.2rem', color: '#ffd700' }}>
                  FEATURE FINAL SCORE
                </td>
                {FEATURES.map(f => {
                  const t = featureTotals.find(x => x.id === f.id);
                  const isHighlighted = isColHighlighted(f.id);
                  return (
                    <motion.td 
                      key={`total_${f.id}`} 
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,215,0,0.1)', zIndex: 5, position: 'relative' }}
                      onClick={() => { handleClose(); setSelectedFeatureTotal(f); }}
                      style={{ 
                        padding: '1.5rem 1rem', 
                        borderTop: '2px solid #ffd700', 
                        backgroundColor: isHighlighted ? '#1a1a1a' : '#050505', 
                        textAlign: 'center', 
                        fontWeight: 'bold', 
                        fontSize: '1.8rem', 
                        color: isHighlighted ? '#ffd700' : '#fff',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s, color 0.3s',
                        boxShadow: isHighlighted ? 'inset 0px 4px 0px #ffd700' : 'none'
                      }}
                    >
                      {t?.total}
                    </motion.td>
                  );
                })}
                {/* Empty corner cell */}
                <td style={{ padding: '1.5rem', borderTop: '2px solid #ffd700', backgroundColor: '#050505' }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* VERDICT AND STRATEGIC PRIORITIES SECTION */}
      <div id="verdict-section" style={{ maxWidth: '1200px', margin: '4rem auto 8rem auto', padding: '0 2rem' }}>
        <h2 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-playfair)', color: '#ffd700', marginBottom: '1.5rem', textAlign: 'center' }}>
          The Verdict & Strategic Priorities
        </h2>
        <p style={{ color: '#a1a1a6', fontSize: '1.2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem auto', lineHeight: 1.6 }}>
          Based on the mathematical validation above, we have isolated the engineering priorities. Features are highly tangled (e.g., <span style={{color: '#fff'}}>/updates</span> is required across all modules, and <span style={{color: '#fff'}}>/meet</span> infrastructure must exist to facilitate <span style={{color: '#fff'}}>/trade</span>). Therefore, this is not a strict chronological timeline, but a map of where our capital and operational focus must be concentrated to ensure platform survival.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/trade</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>81 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>The Money Printer</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6, marginBottom: '2rem' }}>Immediate transaction fees and cashflow generation via physical flash sales and group buys. Brutally hard to execute, but it solves the core user desire for financial survival.</p>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a1a1a6', marginBottom: '1rem', letterSpacing: '0.05em' }}>Core Infrastructure</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <span onClick={() => handleReqClick('trade', 0)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#ffd700', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>B2B Escrow Smart Contracts</span>
                <span onClick={() => handleReqClick('trade', 1)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#ffd700', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Flash Sale Engine</span>
                <span onClick={() => handleReqClick('trade', 2)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#ffd700', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Logistics Webhooks</span>
                <span onClick={() => handleReqClick('trade', 3)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#ffd700', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Viral Share Loops</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.1 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/learn</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>80 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>The Safe Haven</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6, marginBottom: '2rem' }}>The $0 CAC organic acquisition engine. Drives massive top-of-funnel traffic via Agent Playbooks and SEO, funneling educated users directly into the /trade ecosystem.</p>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a1a1a6', marginBottom: '1rem', letterSpacing: '0.05em' }}>Core Infrastructure</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <span onClick={() => handleReqClick('learn', 0)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>SEO SSR Markdown CMS</span>
                <span onClick={() => handleReqClick('learn', 1)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Mux Livestreams</span>
                <span onClick={() => handleReqClick('learn', 2)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Playbook Generator</span>
                <span onClick={() => handleReqClick('learn', 3)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Lead Funnels</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/meet</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>78 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>The Walled Garden</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6, marginBottom: '2rem' }}>Traps the top 1% behind a KYC-gated sanctuary. This creates unassailable social lock-in and a deep defensible moat against AI deepfakes. Required as the foundational trust layer.</p>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a1a1a6', marginBottom: '1rem', letterSpacing: '0.05em' }}>Core Infrastructure</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <span onClick={() => handleReqClick('meet', 0)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#3b82f6', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Biometric Identity Hooks</span>
                <span onClick={() => handleReqClick('meet', 1)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#3b82f6', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Algorithmic Ranking Feed</span>
                <span onClick={() => handleReqClick('meet', 2)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#3b82f6', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>E2EE Messaging</span>
                <span onClick={() => handleReqClick('meet', 3)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#3b82f6', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Stripe Gate</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.3 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/profile</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>73 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>The Ledger</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6, marginBottom: '2rem' }}>Provides verifiable proof of execution for the users operating within /meet. The ultimate status flex and trust anchor, effectively replacing the resume for the physical economy.</p>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a1a1a6', marginBottom: '1rem', letterSpacing: '0.05em' }}>Core Infrastructure</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <span onClick={() => handleReqClick('profile', 0)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#8b5cf6', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Immutable Tx Database</span>
                <span onClick={() => handleReqClick('profile', 1)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#8b5cf6', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Vanity URLs</span>
                <span onClick={() => handleReqClick('profile', 2)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#8b5cf6', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Dynamic Badging System</span>
                <span onClick={() => handleReqClick('profile', 3)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#8b5cf6', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Arbitration Engine</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.4 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/support</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>66 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Diaspora Investment</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6, marginBottom: '2rem' }}>Massive regulatory risk. Activated once /profile and /meet have generated enough verifiable trust to satisfy SEC/AML compliance. High ROI, but existential danger if rushed.</p>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a1a1a6', marginBottom: '1rem', letterSpacing: '0.05em' }}>Core Infrastructure</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <span onClick={() => handleReqClick('support', 0)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>High-Ticket Remittance API</span>
                <span onClick={() => handleReqClick('support', 1)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Fractional Ownership</span>
                <span onClick={() => handleReqClick('support', 2)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>AML/Sanctions Screen</span>
                <span onClick={() => handleReqClick('support', 3)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>ROI Dashboards</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.5 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/updates</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>42 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Continuous Integration</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6, marginBottom: '2rem' }}>The UI pane that glues the phases together. Notification systems are built passively alongside every other feature to maintain DAU engagement. No regulatory risk, but no independent value.</p>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a1a1a6', marginBottom: '1rem', letterSpacing: '0.05em' }}>Core Infrastructure</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <span onClick={() => handleReqClick('updates', 0)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#6b7280', background: 'rgba(107,114,128,0.05)', border: '1px solid rgba(107,114,128,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Real-time WebSockets</span>
                <span onClick={() => handleReqClick('updates', 1)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#6b7280', background: 'rgba(107,114,128,0.05)', border: '1px solid rgba(107,114,128,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Push Network (FCM/APN)</span>
                <span onClick={() => handleReqClick('updates', 2)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#6b7280', background: 'rgba(107,114,128,0.05)', border: '1px solid rgba(107,114,128,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>In-App Feeds</span>
                <span onClick={() => handleReqClick('updates', 3)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#6b7280', background: 'rgba(107,114,128,0.05)', border: '1px solid rgba(107,114,128,0.2)', borderRadius: '20px', fontFamily: 'var(--font-quicksand)' }}>Background Queue Workers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- FLOATING COMMAND PANELS (Replaces Modals) --- */}
      <AnimatePresence>
        {isAnyPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '450px',
              maxHeight: '80vh',
              overflowY: 'auto',
              background: 'rgba(15, 15, 15, 0.85)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: `1px solid ${activeBorderColor}`,
              borderRadius: '24px',
              boxShadow: `0 30px 60px rgba(0,0,0,0.8), 0 0 20px ${activeShadowColor}`,
              zIndex: 1000,
              padding: '2.5rem',
              color: '#fff',
              fontFamily: 'var(--font-quicksand)'
            }}
          >
            <IconButton 
              onClick={handleClose} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#a1a1a6' }}
            >
              <CloseIcon />
            </IconButton>

            {/* Feature Modal Content (Column Header) */}
            {selectedFeature && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#ffd700', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Strategic Pillar</div>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#fff', margin: 0, lineHeight: 1.1 }}>{selectedFeature.name}</h3>
                </div>
                
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: '3px solid #ffd700' }}>
                  <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>The Premise</h4>
                  <p style={{ color: '#a1a1a6', margin: 0, lineHeight: 1.6 }}>{selectedFeature.description}</p>
                </div>

                <div>
                  <h4 style={{ color: '#fff', marginBottom: '0.8rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Strategic Deep Dive</h4>
                  <p style={{ color: '#e1e1e6', lineHeight: 1.7, fontSize: '0.95rem' }}>{selectedFeature.detailedDescription}</p>
                </div>
              </div>
            )}

            {/* Vector Modal Content (Row Header) */}
            {selectedVector && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#ffd700', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{selectedVector.tier}</div>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#fff', margin: 0, lineHeight: 1.1 }}>{selectedVector.name}</h3>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderTop: '2px solid #ffd700' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a1a1a6', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Multiplier</div>
                    <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>x{selectedVector.multiplier}</div>
                  </div>
                  <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderTop: `2px solid ${selectedVector.isRisk ? '#ef4444' : '#10b981'}` }}>
                    <div style={{ fontSize: '0.7rem', color: '#a1a1a6', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Scoring Logic</div>
                    <div style={{ fontSize: '1rem', color: selectedVector.isRisk ? '#ef4444' : '#10b981', fontWeight: 'bold', lineHeight: 1.2 }}>
                      {selectedVector.isRisk ? '0 = Risk, 5 = Safe' : '0 = Neg, 5 = Max'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>The Premise</h4>
                  <p style={{ color: '#a1a1a6', margin: 0, lineHeight: 1.6 }}>{selectedVector.description}</p>
                </div>

                <div>
                  <h4 style={{ color: '#fff', marginBottom: '0.8rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Strategic Deep Dive</h4>
                  <p style={{ color: '#e1e1e6', lineHeight: 1.7, fontSize: '0.95rem' }}>{selectedVector.detailedDescription}</p>
                </div>
              </div>
            )}

            {/* Cell Modal Content */}
            {selectedCell && (() => {
              const points = selectedCell.cell.baseScore * selectedCell.vector.multiplier;
              const maxPoints = 5 * selectedCell.vector.multiplier;
              const percentage = Math.round((points / maxPoints) * 100);
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Header Area */}
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '100px', background: 'rgba(255,255,255,0.1)', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedCell.feature.name}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '100px', background: `${activeBorderColor}`, color: activeAccentColor, textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedCell.vector.name}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: '#fff', lineHeight: 1.2, margin: 0 }}>
                      Intersection Analysis
                    </h3>
                  </div>
                  
                  {/* Score Dashboard Area */}
                  <div style={{ 
                    display: 'flex', flexDirection: 'column', gap: '1rem',
                    padding: '1.5rem', background: 'linear-gradient(180deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)', 
                    borderRadius: '20px', border: `1px solid ${activeBorderColor}`,
                    boxShadow: `inset 0 2px 10px rgba(255,255,255,0.02)`
                  }}>
                    {/* Top half: Percentage & Points */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Efficiency</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                          <span style={{ fontSize: '3.5rem', fontWeight: 'bold', color: activeAccentColor, lineHeight: 0.9 }}>{percentage}</span>
                          <span style={{ fontSize: '1.5rem', color: activeAccentColor, opacity: 0.7 }}>%</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Points</div>
                        <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 'bold', lineHeight: 1 }}>{points} <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal' }}>/ {maxPoints}</span></div>
                      </div>
                    </div>
                    
                    {/* Bottom half: Breakdown */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Base Score</div>
                        <div style={{ fontSize: '1.2rem', color: '#e1e1e6', fontWeight: 'bold' }}>{selectedCell.cell.baseScore} <span style={{color:'#444', fontSize:'0.9rem', fontWeight:'normal'}}>/ 5</span></div>
                      </div>
                      <div style={{ color: '#444' }}>&times;</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Vector Multiplier</div>
                        <div style={{ fontSize: '1.2rem', color: '#e1e1e6', fontWeight: 'bold' }}>x{selectedCell.vector.multiplier}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rationale Area */}
                  <div>
                    <h4 style={{ color: '#fff', marginBottom: '0.8rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Strategic Rationale</h4>
                    <p style={{ color: '#a1a1a6', whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>{selectedCell.cell.explanation}</p>
                  </div>
                </div>
              );
            })()}

            {/* Feature Total Modal Content */}
            {selectedFeatureTotal && (() => {
              const activeMaxFeatureTotal = VECTORS.reduce((sum, v) => sum + (5 * v.multiplier), 0);
              const currentFeatureTotal = featureTotals.find(x => x.id === selectedFeatureTotal.id)?.total || 0;
              const percentage = Math.round((currentFeatureTotal / activeMaxFeatureTotal) * 100);

              let activeColor = '#ffd700';
              if (percentage >= 80) activeColor = '#10b981';
              else if (percentage >= 50) activeColor = '#3b82f6';
              else if (percentage >= 30) activeColor = '#f59e0b';
              else activeColor = '#ef4444';

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#a1a1a6', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Aggregate Strength</div>
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#fff', margin: 0, lineHeight: 1.1 }}>{selectedFeatureTotal.name}</h3>
                  </div>

                  <div style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                    padding: '3rem 2rem', background: 'linear-gradient(180deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)', 
                    borderRadius: '20px', border: `1px solid ${activeColor}40`,
                    boxShadow: `inset 0 2px 10px rgba(255,255,255,0.02), 0 10px 30px ${activeColor}20`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                      <span style={{ fontSize: '5rem', fontWeight: 'bold', color: activeColor, lineHeight: 0.9 }}>{percentage}</span>
                      <span style={{ fontSize: '2rem', color: activeColor, opacity: 0.7 }}>%</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: '#a1a1a6' }}>
                      <strong style={{ color: '#fff' }}>{currentFeatureTotal}</strong> <span style={{ opacity: 0.5 }}>/ {activeMaxFeatureTotal} Total Points</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '1rem', color: '#a1a1a6', lineHeight: 1.7, textAlign: 'center', margin: 0 }}>
                    This is the final aggregate score for <strong>{selectedFeatureTotal.name}</strong>. It proves its total viability and priority weight across Survival, Growth, and Scale metrics.
                  </p>
                </div>
              );
            })()}

            {/* Vector Total Modal Content */}
            {selectedVectorTotal && (() => {
              const currentVectorTotal = vectorTotals.find(x => x.id === selectedVectorTotal.id)?.total || 0;
              const percentage = Math.round((currentVectorTotal / activeMaxVectorTotal) * 100);

              let activeColor = '#ffd700';
              if (percentage >= 80) activeColor = '#10b981';
              else if (percentage >= 50) activeColor = '#3b82f6';
              else if (percentage >= 30) activeColor = '#f59e0b';
              else activeColor = '#ef4444';

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#a1a1a6', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Platform Capability</div>
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#fff', margin: 0, lineHeight: 1.1 }}>{selectedVectorTotal.name}</h3>
                  </div>

                  <div style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                    padding: '3rem 2rem', background: 'linear-gradient(180deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)', 
                    borderRadius: '20px', border: `1px solid ${activeColor}40`,
                    boxShadow: `inset 0 2px 10px rgba(255,255,255,0.02), 0 10px 30px ${activeColor}20`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                      <span style={{ fontSize: '5rem', fontWeight: 'bold', color: activeColor, lineHeight: 0.9 }}>{percentage}</span>
                      <span style={{ fontSize: '2rem', color: activeColor, opacity: 0.7 }}>%</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: '#a1a1a6' }}>
                      <strong style={{ color: '#fff' }}>{currentVectorTotal}</strong> <span style={{ opacity: 0.5 }}>/ {activeMaxVectorTotal} Total Points</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '1rem', color: '#a1a1a6', lineHeight: 1.7, textAlign: 'center', margin: 0 }}>
                    This represents the <strong>total aggregate capability of the entire platform</strong> against the <em>{selectedVectorTotal.name}</em> vector, anchored against the maximum mathematically attainable score.
                  </p>
                </div>
              );
            })()}

          </motion.div>
        )}
      </AnimatePresence>

      {/* --- GIANT CENTERED MODAL FOR BUILD SCOPES --- */}
      <AnimatePresence>
        {selectedBuildFeature && BUILD_REQUIREMENTS[selectedBuildFeature] && (() => {
          const reqData = BUILD_REQUIREMENTS[selectedBuildFeature];
          const req = reqData.reqs[buildStepIndex];
          const isLast = buildStepIndex === reqData.reqs.length - 1;
          const isFirst = buildStepIndex === 0;

          return (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  pointerEvents: 'auto'
                }}
                onClick={() => setSelectedBuildFeature(null)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                  position: 'relative',
                  width: '85vw',
                  height: '85vh',
                  background: 'rgba(15, 15, 15, 0.85)',
                  border: `1px solid ${reqData.color}40`,
                  borderRadius: '24px',
                  boxShadow: `0 30px 60px rgba(0,0,0,0.8), inset 0 2px 20px rgba(255,255,255,0.05)`,
                  padding: '4rem',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                  overflowY: 'auto'
                }}
              >
                <IconButton 
                  onClick={() => setSelectedBuildFeature(null)} 
                  style={{ position: 'absolute', top: '2rem', right: '2rem', color: '#a1a1a6' }}
                >
                  <CloseIcon fontSize="large" />
                </IconButton>
                
                <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ marginBottom: '3rem' }}>
                    <div style={{ fontSize: '1.2rem', textTransform: 'uppercase', color: reqData.color, letterSpacing: '0.2em', marginBottom: '1rem', fontFamily: 'var(--font-dosis)' }}>
                      {reqData.title} &nbsp;•&nbsp; Build Scope {buildStepIndex + 1} of {reqData.reqs.length}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '4.5rem', color: '#fff', margin: 0, lineHeight: 1.1 }}>{req.name}</h3>
                  </div>

                  <div style={{ 
                    padding: '4rem', background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '24px', borderLeft: `6px solid ${reqData.color}`,
                    marginBottom: '4rem',
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <p style={{ color: '#e1e1e6', margin: 0, lineHeight: 1.8, fontSize: '1.6rem', fontFamily: 'var(--font-ysabeau)' }}>
                      {req.detail}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <button 
                      onClick={() => setBuildStepIndex(Math.max(0, buildStepIndex - 1))}
                      style={{
                        padding: '1rem 3rem',
                        background: isFirst ? 'transparent' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isFirst ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
                        color: isFirst ? 'transparent' : '#fff',
                        borderRadius: '30px',
                        cursor: isFirst ? 'default' : 'pointer',
                        fontFamily: 'var(--font-quicksand)',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s',
                        pointerEvents: isFirst ? 'none' : 'auto'
                      }}
                    >
                      ← Previous
                    </button>

                    <button 
                      onClick={() => {
                        if (isLast) {
                          setSelectedBuildFeature(null);
                        } else {
                          setBuildStepIndex(buildStepIndex + 1);
                        }
                      }}
                      style={{
                        padding: '1rem 3rem',
                        background: isLast ? 'rgba(255,255,255,0.1)' : `${reqData.color}20`,
                        border: `1px solid ${isLast ? 'rgba(255,255,255,0.2)' : reqData.color}`,
                        color: isLast ? '#fff' : reqData.color,
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-quicksand)',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isLast ? 'Finish & Close' : 'Next Requirement →'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
