"use client";
import styles from '../darkpore.module.css';
import Link from 'next/link';

export default function ThesisPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '6rem' }}>
      <Link href="/" style={{ color: '#a1a1a6', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block', fontFamily: 'var(--font-dosis)' }}>
        ← Back Home
      </Link>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h4 style={{ color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.9rem', marginBottom: '1rem', fontFamily: 'var(--font-dosis)' }}>The Darkpore Manifesto</h4>
        <h1 className={styles.heroTitle} style={{ fontSize: '4.5rem', marginBottom: '2rem' }}>Software alone <br/>cannot feed Africa.</h1>
      </div>
      
      <div style={{ color: '#d1d1d6', lineHeight: 1.8, fontSize: '1.2rem', fontFamily: 'var(--font-ysabeau)' }}>
        
        {/* Section 1 */}
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)', color: '#fff' }}>I. The Origin & Validation</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Darkpore Media Africa is not an app development agency. We are a 1-to-N infrastructure venture studio. 
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            In 2020, our vision for a decentralized, neural-driven food system won the <strong>Rockefeller Foundation Vision Prize</strong>. 
            That wasn't just an award; it was institutional validation of a massive macro-economic thesis: You cannot solve African hunger with a mobile app alone. 
            You must build the physical rails, and you must own the data that flows across them.
          </p>
          <p>
            When you invest in a Darkpore Venture, you aren't buying equity in a SaaS startup. You are buying into the physical cold-chain networks, the uncollateralized lending protocols, and the neural data engines that will feed the continent for the next century.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)', color: '#fff' }}>II. The 7 Wahaalas (Bottlenecks)</h2>
          <p style={{ marginBottom: '2rem' }}>
            Sub-Saharan Africa possesses 60% of the world's uncultivated arable land, yet imports $43 billion in food annually. This paradox is sustained by 7 fundamental "Wahaalas" (problems):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className={styles.glassCard} style={{ padding: '2rem', transform: 'none' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>1. Post-Harvest Loss</h3>
              <p style={{ fontSize: '1rem', color: '#a1a1a6' }}>Without decentralized cold-storage, 40% of produce rots before it reaches the urban market.</p>
            </div>
            <div className={styles.glassCard} style={{ padding: '2rem', transform: 'none' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>2. Access to Capital</h3>
              <p style={{ fontSize: '1rem', color: '#a1a1a6' }}>Legacy banks require collateral that rural farmers do not legally possess.</p>
            </div>
            <div className={styles.glassCard} style={{ padding: '2rem', transform: 'none' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>3. Land Tenure</h3>
              <p style={{ fontSize: '1rem', color: '#a1a1a6' }}>Fragmented ownership prevents mechanized, large-scale farming economies.</p>
            </div>
            <div className={styles.glassCard} style={{ padding: '2rem', transform: 'none' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>4. Logistics & Safety</h3>
              <p style={{ fontSize: '1rem', color: '#a1a1a6' }}>Moving food across state lines is crippled by extortion and decaying road networks.</p>
            </div>
          </div>
          <p style={{ marginTop: '2rem', color: '#a1a1a6', fontStyle: 'italic' }}>*The remaining 3 Wahaalas (Energy, Inputs, and Expensive Protein) are tackled in our closed Deal Rooms.*</p>
        </section>

        {/* Section 3 */}
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)', color: '#fff' }}>III. The 1-to-N Scaling Model</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Our thesis is built on extreme operational leverage. We engineer the <strong>"1"</strong> (the perfect, profitable unit prototype—like a single solar cold-room franchise in Kano). 
            Once the physical unit economics are proven and profitable, we deploy the <strong>"N"</strong> (the neural software layer, the AgroLLM data licensing, the uncollateralized lending protocols) to scale it infinitely.
          </p>
          <div style={{ background: 'rgba(218, 165, 32, 0.05)', borderLeft: '4px solid #ffd700', padding: '2rem', marginTop: '2rem', borderRadius: '0 12px 12px 0' }}>
            <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem' }}>Physical Rails + Neural Networks</h4>
            <p style={{ margin: 0, fontSize: '1.05rem' }}>Hardware traps the user in our ecosystem. Software extracts the maximum LTV (Lifetime Value) from that trapped user.</p>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-playfair)', color: '#fff' }}>IV. Horizon 2036</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We are not building to flip or exit in 3 years. Darkpore is engineering the systemic backbone of an entire continent. 
            By 2036, our infrastructure will be the invisible layer moving 30% of West Africa's agricultural GDP.
          </p>
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link href="/ventures" className={styles.primaryButton}>
              Enter the Deal Matrix
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
