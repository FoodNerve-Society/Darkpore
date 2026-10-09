import styles from './darkpore.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GravityCanvas from './components/GravityCanvas';

export default function DarkporeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.body}>
        <GravityCanvas />
        <Navbar />
        <main className={styles.mainContainer}>
          {children}
        </main>
        <Footer />
    </div>
  );
}
