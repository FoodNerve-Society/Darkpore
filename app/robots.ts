import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { resolveDomainSeoContext } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get('host');
  const ctx = resolveDomainSeoContext(host);

  const disallowPaths = ['/api/', '/finishSignUp', '/stage/teleprompter'];

  const allowedBots = [
    '*',
    'Googlebot',
    'Googlebot-News',
    'Google-Extended',
    'Bingbot',
    'OAI-SearchBot',
    'GPTBot',
    'ChatGPT-User',
    'PerplexityBot',
    'ClaudeBot',
    'Claude-SearchBot',
    'Applebot-Extended',
    'CCBot',
  ];

  return {
    rules: allowedBots.map((bot) => ({
      userAgent: bot,
      allow: '/',
      disallow: disallowPaths,
    })),
    sitemap: [
      `${ctx.baseUrl}/sitemap.xml`,
      `${ctx.baseUrl}/news-sitemap.xml`,
    ],
    host: ctx.baseUrl,
  };
}
