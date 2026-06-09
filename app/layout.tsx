import React from 'react';
import { playfairDisplay, eduNswActFoundation, dosis, quicksand, ysabeauInfant } from '@/theme/fonts';

export const metadata = {
  title: 'Society OS',
  description: 'The Society OS for Food Systems',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${eduNswActFoundation.variable} ${dosis.variable} ${quicksand.variable} ${ysabeauInfant.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
