import React from 'react';
import { playfairDisplay, eduNswActFoundation, dosis, quicksand, ysabeauInfant } from '@/theme/fonts';
import './globals.css';

import { headers } from 'next/headers';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  const isSociety = host.includes('society') || host.includes('.org');
  
  return {
    title: 'Society OS',
    description: 'The Society OS for Food Systems',
    icons: {
      icon: isSociety ? '/images/society-favicon.png' : '/images/foodnerve-favicon.png',
    }
  };
}

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${eduNswActFoundation.variable} ${dosis.variable} ${quicksand.variable} ${ysabeauInfant.variable}`}>
      <body>
        <NextTopLoader color="#10b981" showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
