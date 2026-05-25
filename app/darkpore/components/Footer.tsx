import Link from 'next/link';
import styles from '../darkpore.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className={styles.logo} style={{ fontSize: '1.5rem', marginBottom: '1rem', cursor: 'pointer' }}>D</div>
        </Link>
        <p style={{ color: '#a1a1a6', fontSize: '0.85rem', maxWidth: '300px', lineHeight: 1.6 }}>
          Darkpore Media Africa. <br />
          Engineering the physical and neural pipelines of the African continent.
        </p>
      </div>
      
      <div className={styles.footerLinks}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <strong style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', fontFamily: 'var(--font-dosis)' }}>Platform</strong>
          <Link href="/ventures" className={styles.navLink}>Active Ventures</Link>
          <Link href="/thesis" className={styles.navLink}>Our Thesis</Link>
          <Link href="/partners" className={styles.navLink}>Whale Intake</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <strong style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', fontFamily: 'var(--font-dosis)' }}>Compliance</strong>
          <Link href="/legal" className={styles.navLink}>SEC Disclaimers</Link>
          <Link href="/legal" className={styles.navLink}>Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
