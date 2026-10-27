import React from 'react';
import { allFontVariables } from '@/theme/fonts';
import './globals.css';

import { headers } from 'next/headers';
import type { Metadata } from 'next';

import { resolveDomainSeoContext } from '@/lib/seo/schema';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const ctx = resolveDomainSeoContext(host);

  return {
    metadataBase: new URL(ctx.baseUrl),
    title: {
      default: ctx.siteName,
      template: `%s | ${ctx.siteName}`,
    },
    description: ctx.description,
    icons: {
      icon: ctx.faviconUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      types: {
        'application/rss+xml': `${ctx.baseUrl}/feed.xml`,
      },
    },
    openGraph: {
      siteName: ctx.siteName,
      title: ctx.siteName,
      description: ctx.description,
      url: ctx.baseUrl,
      type: 'website',
    },
  };
}

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={allFontVariables}>
      <body>
        <NextTopLoader color="#10b981" showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
