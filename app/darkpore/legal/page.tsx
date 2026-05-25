import styles from '../darkpore.module.css';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/darkpore" style={{ color: '#a1a1a6', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
        ← Back Home
      </Link>
      
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Legal & Disclaimers</h1>
      
      <div style={{ color: '#a1a1a6', lineHeight: 1.6, fontSize: '0.9rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          <strong>Darkpore.com is not a registered broker-dealer.</strong>
        </p>
        <p style={{ marginBottom: '1rem' }}>
          The information presented on this platform is for educational and venture studio purposes only. 
          Paying to view a document or access a Deal Room does not constitute an offer of equity, securities, or financial advice.
        </p>
        <p>
          All investments carry risk. Prospective partners should conduct their own due diligence and consult with legal and financial advisors before committing capital.
        </p>
      </div>
    </div>
  );
}
