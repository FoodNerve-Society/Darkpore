import { Playfair_Display, Dosis, Quicksand, Ysabeau_Infant } from 'next/font/google';
import styles from './darkpore.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GravityCanvas from './components/GravityCanvas';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

const dosis = Dosis({ 
  subsets: ['latin'],
  variable: '--font-dosis',
});

const quicksand = Quicksand({ 
  subsets: ['latin'],
  variable: '--font-quicksand',
});

const ysabeau = Ysabeau_Infant({ 
  subsets: ['latin'],
  variable: '--font-ysabeau',
});

export default function DarkporeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${dosis.variable} ${quicksand.variable} ${ysabeau.variable} ${styles.body}`}>
        <GravityCanvas />
        <Navbar />
        <main className={styles.mainContainer}>
          {children}
        </main>
        <Footer />
    </div>
  );
}
