"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../darkpore.module.css';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? styles.activeLink : '';
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div className={styles.logo}>D</div>
      </Link>
      
      <div className={styles.navLinks}>
        <Link href="/ventures" className={`${styles.navLink} ${isActive('/ventures')}`}>Ventures</Link>
        <Link href="/thesis" className={`${styles.navLink} ${isActive('/thesis')}`}>Manifesto</Link>
        <Link href="/partners" className={`${styles.navLink} ${isActive('/partners')}`}>Partners</Link>
        <Link href="/join" className={styles.loginBtn}>Investor Login</Link>
      </div>
    </nav>
  );
}
