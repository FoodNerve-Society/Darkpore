"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { VECTORS, FEATURES, CELLS, MatrixVector, MatrixFeature, MatrixCell } from './MatrixData';

export default function StressTestPage() {
  const [selectedFeature, setSelectedFeature] = useState<MatrixFeature | null>(null);
  const [selectedVector, setSelectedVector] = useState<MatrixVector | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ vector: MatrixVector, feature: MatrixFeature, cell: MatrixCell } | null>(null);
  const [selectedFeatureTotal, setSelectedFeatureTotal] = useState<MatrixFeature | null>(null);
  const [selectedVectorTotal, setSelectedVectorTotal] = useState<MatrixVector | null>(null);

  const handleClose = () => {
    setSelectedFeature(null);
    setSelectedVector(null);
    setSelectedCell(null);
    setSelectedFeatureTotal(null);
    setSelectedVectorTotal(null);
  };

  const isRowHighlighted = (vId: string) => {
    return selectedVector?.id === vId || selectedCell?.vector.id === vId || selectedVectorTotal?.id === vId;
  };

  const isColHighlighted = (fId: string) => {
    return selectedFeature?.id === fId || selectedCell?.feature.id === fId || selectedFeatureTotal?.id === fId;
  };

  const getCellColor = (points: number, isRisk: boolean, vId: string, fId: string) => {
    const isHighlighted = isRowHighlighted(vId) || isColHighlighted(fId);
    let baseColor = 'rgba(220, 38, 38, 0.4)'; // Dark red (critical zero)
    
    if (points >= 12) baseColor = 'rgba(16, 185, 129, 0.2)'; // Emerald green
    else if (points >= 8) baseColor = 'rgba(59, 130, 246, 0.2)'; // Blue
    else if (points >= 4) baseColor = 'rgba(245, 158, 11, 0.2)'; // Amber
    else if (points > 0) baseColor = 'rgba(239, 68, 68, 0.2)'; // Red

    if (isHighlighted) {
      // If a cell is in the highlighted crosshairs, brighten its background significantly
      return baseColor.replace('0.2)', '0.6)').replace('0.4)', '0.8)');
    }
    
    // If a modal is open but this cell is NOT highlighted, dim it aggressively
    if (selectedCell || selectedFeature || selectedVector || selectedFeatureTotal || selectedVectorTotal) {
      return baseColor.replace('0.2)', '0.05)').replace('0.4)', '0.08)');
    }

    return baseColor;
  };

  const renderCell = (v: MatrixVector, f: MatrixFeature) => {
    const key = `${v.id}_${f.id}`;
    const cell = CELLS[key];
    if (!cell) return <td key={key} style={{ padding: '1rem', borderBottom: '1px solid #333' }}>-</td>;

    const points = cell.baseScore * v.multiplier;
    const isHighlighted = isRowHighlighted(v.id) || isColHighlighted(f.id);
    const isDirectlySelected = selectedCell?.feature.id === f.id && selectedCell?.vector.id === v.id;
    const color = getCellColor(points, v.isRisk, v.id, f.id);

    return (
      <motion.td 
        key={key}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,215,0,0.3)', zIndex: 5, position: 'relative' }}
        onClick={() => { handleClose(); setSelectedCell({ vector: v, feature: f, cell }); }}
        style={{ 
          padding: '1.2rem 1rem', 
          borderBottom: '1px solid #333', 
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: color,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.3s ease',
          opacity: (selectedCell || selectedFeature || selectedVector || selectedFeatureTotal || selectedVectorTotal) && !isHighlighted ? 0.3 : 1,
          border: isDirectlySelected ? '2px solid #ffd700' : 'none',
          boxShadow: isDirectlySelected ? '0 0 20px rgba(255,215,0,0.5)' : 'none'
        }}
      >
        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: isHighlighted ? '#fff' : '#aaa' }}>{points}</div>
        <div style={{ fontSize: '0.8rem', color: isHighlighted ? '#ffd700' : '#666', marginTop: '0.2rem' }}>{cell.baseScore} &times; {v.multiplier}</div>
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
  const isAnyPanelOpen = selectedCell || selectedFeature || selectedVector || selectedFeatureTotal || selectedVectorTotal;

  let activeBorderColor = 'rgba(255,215,0,0.2)';
  let activeAccentColor = '#ffd700';
  let activeShadowColor = 'rgba(255,215,0,0.05)';

  if (selectedCell) {
    const points = selectedCell.cell.baseScore * selectedCell.vector.multiplier;
    if (points >= 12) { activeBorderColor = 'rgba(16, 185, 129, 0.5)'; activeAccentColor = '#10b981'; activeShadowColor = 'rgba(16, 185, 129, 0.15)'; }
    else if (points >= 8) { activeBorderColor = 'rgba(59, 130, 246, 0.5)'; activeAccentColor = '#3b82f6'; activeShadowColor = 'rgba(59, 130, 246, 0.15)'; }
    else if (points >= 4) { activeBorderColor = 'rgba(245, 158, 11, 0.5)'; activeAccentColor = '#f59e0b'; activeShadowColor = 'rgba(245, 158, 11, 0.15)'; }
    else if (points > 0) { activeBorderColor = 'rgba(239, 68, 68, 0.5)'; activeAccentColor = '#ef4444'; activeShadowColor = 'rgba(239, 68, 68, 0.15)'; }
    else { activeBorderColor = 'rgba(220, 38, 38, 0.8)'; activeAccentColor = '#dc2626'; activeShadowColor = 'rgba(220, 38, 38, 0.2)'; }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', paddingBottom: '100px', fontFamily: 'var(--font-dosis)' }}>
      
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
            <p style={{ color: '#a1a1a6', lineHeight: 1.6 }}>Immediate transaction fees and cashflow generation via physical flash sales and group buys. Brutally hard to execute, but it solves the core user desire for financial survival.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.1 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/learn</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>80 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>The Safe Haven</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6 }}>The $0 CAC organic acquisition engine. Drives massive top-of-funnel traffic via Agent Playbooks and SEO, funneling educated users directly into the /trade ecosystem.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/meet</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>78 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>The Walled Garden</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6 }}>Traps the top 1% behind a KYC-gated sanctuary. This creates unassailable social lock-in and a deep defensible moat against AI deepfakes. Required as the foundational trust layer.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.3 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/profile</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>73 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>The Ledger</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6 }}>Provides verifiable proof of execution for the users operating within /meet. The ultimate status flex and trust anchor, effectively replacing the resume for the physical economy.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.4 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/support</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>66 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Diaspora Investment</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6 }}>Massive regulatory risk. Activated once /profile and /meet have generated enough verifiable trust to satisfy SEC/AML compliance. High ROI, but existential danger if rushed.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.5 }} style={{ padding: '2rem', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>/updates</span>
              <span style={{ color: '#ffd700', fontSize: '1.4rem' }}>42 pts</span>
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Continuous Integration</div>
            <p style={{ color: '#a1a1a6', lineHeight: 1.6 }}>The UI pane that glues the phases together. Notification systems are built passively alongside every other feature to maintain DAU engagement. No regulatory risk, but no independent value.</p>
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

            {/* Feature Modal Content */}
            {selectedFeature && (
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#ffd700', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Strategic Pillar</div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#fff', marginBottom: '2rem', lineHeight: 1.1 }}>{selectedFeature.name}</h3>
                <h4 style={{ color: '#ffd700', marginBottom: '0.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-dosis)' }}>The Premise</h4>
                <p style={{ color: '#a1a1a6', marginBottom: '2rem', lineHeight: 1.6 }}>{selectedFeature.description}</p>
                <h4 style={{ color: '#ffd700', marginBottom: '0.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-dosis)' }}>Strategic Deep Dive</h4>
                <p style={{ color: '#e1e1e6', lineHeight: 1.6 }}>{selectedFeature.detailedDescription}</p>
              </div>
            )}

            {/* Vector Modal Content */}
            {selectedVector && (
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#ffd700', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{selectedVector.tier}</div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#fff', marginBottom: '2rem', lineHeight: 1.1 }}>{selectedVector.name}</h3>
                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ marginBottom: '0.5rem' }}><strong>Multiplier:</strong> <span style={{ color: '#ffd700' }}>x{selectedVector.multiplier}</span></div>
                  <div><strong>Logic:</strong> <span style={{ color: selectedVector.isRisk ? '#ef4444' : '#10b981' }}>{selectedVector.isRisk ? '0 = Risk, 5 = Safe' : '0 = Negative, 5 = Max'}</span></div>
                </div>
                <h4 style={{ color: '#ffd700', marginBottom: '0.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-dosis)' }}>The Premise</h4>
                <p style={{ color: '#a1a1a6', marginBottom: '2rem', lineHeight: 1.6 }}>{selectedVector.description}</p>
                <h4 style={{ color: '#ffd700', marginBottom: '0.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-dosis)' }}>Strategic Deep Dive</h4>
                <p style={{ color: '#e1e1e6', lineHeight: 1.6 }}>{selectedVector.detailedDescription}</p>
              </div>
            )}

            {/* Cell Modal Content */}
            {selectedCell && (
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: activeAccentColor, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Intersection Analysis</div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#fff', marginBottom: '2rem', lineHeight: 1.1 }}>
                  {selectedCell.feature.name} <br/><span style={{ fontSize: '1.5rem', color: '#666' }}>&times;</span> {selectedCell.vector.name}
                </h3>
                
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1.5rem', background: 'linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.8) 100%)', 
                  borderRadius: '16px', border: `1px solid ${activeBorderColor}`, marginBottom: '2rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a1a1a6', textTransform: 'uppercase' }}>Base Score</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: selectedCell.cell.baseScore === 0 ? '#ef4444' : '#fff' }}>{selectedCell.cell.baseScore}</div>
                  </div>
                  <div style={{ fontSize: '1.5rem', color: '#666' }}>&times;</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a1a1a6', textTransform: 'uppercase' }}>Multiplier</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{selectedCell.vector.multiplier}</div>
                  </div>
                  <div style={{ fontSize: '1.5rem', color: '#666' }}>=</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: activeAccentColor, textTransform: 'uppercase' }}>Points</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: activeAccentColor }}>{selectedCell.cell.baseScore * selectedCell.vector.multiplier}</div>
                  </div>
                </div>
                
                <h4 style={{ color: activeAccentColor, marginBottom: '0.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-dosis)' }}>Strategic Rationale</h4>
                <p style={{ color: '#e1e1e6', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{selectedCell.cell.explanation}</p>
              </div>
            )}

            {/* Feature Total Modal Content */}
            {selectedFeatureTotal && (
              <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#ffd700', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Aggregate Strength</div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#fff', marginBottom: '2rem', lineHeight: 1.1 }}>{selectedFeatureTotal.name} Final Score</h3>
                <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#ffd700', marginBottom: '2rem', fontFamily: 'var(--font-playfair)', textShadow: '0 10px 30px rgba(255,215,0,0.3)' }}>
                  {featureTotals.find(x => x.id === selectedFeatureTotal.id)?.total}
                </div>
                <p style={{ fontSize: '1.1rem', color: '#a1a1a6', lineHeight: 1.6 }}>
                  This is the final aggregate score for <strong>{selectedFeatureTotal.name}</strong>. It proves its total viability and priority weight across Survival, Growth, and Scale metrics.
                </p>
              </div>
            )}

            {/* Vector Total Modal Content */}
            {selectedVectorTotal && (
              <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#ffd700', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Platform Capability</div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#fff', marginBottom: '2rem', lineHeight: 1.1 }}>{selectedVectorTotal.name} Total</h3>
                <div style={{ fontSize: '5rem', fontWeight: 'bold', color: '#ffd700', marginBottom: '2rem', fontFamily: 'var(--font-playfair)', textShadow: '0 10px 30px rgba(255,215,0,0.3)', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
                  {vectorTotals.find(x => x.id === selectedVectorTotal.id)?.total}
                  <span style={{ fontSize: '2rem', color: '#666', fontWeight: 'normal' }}>/ {activeMaxVectorTotal}</span>
                </div>
                <p style={{ fontSize: '1.1rem', color: '#a1a1a6', lineHeight: 1.6 }}>
                  This represents the <strong>total aggregate capability of the entire platform</strong> against the <em>{selectedVectorTotal.name}</em> vector, anchored against the maximum mathematically attainable score.
                </p>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
