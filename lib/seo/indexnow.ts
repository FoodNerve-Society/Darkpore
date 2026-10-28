import { resolveDomainSeoContext } from '@/lib/seo/schema';

/**
 * Deterministic default verification key for IndexNow across FoodNerve, Darkpore, and EnergyNerve.
 * Hosted publicly at https://<host>/d7a58c0e69b2447fa0d23812586e241c.txt
 */
export const DEFAULT_INDEXNOW_KEY = 'd7a58c0e69b2447fa0d23812586e241c';

/**
 * Public WebSub / PubSubHubbub hubs to notify on RSS/Atom feed changes.
 */
export const WEBSUB_HUBS = [
  'https://pubsubhubbub.appspot.com/',
  'https://pubsubhubbub.superfeedr.com/',
];

/**
 * Returns the active IndexNow API key from environment or fallback default.
 * Trims whitespace and strips any wrapping single or double quotes.
 */
export function getIndexNowKey(): string {
  const rawKey = process.env.INDEXNOW_KEY?.trim() || '';
  const cleaned = rawKey.replace(/^['"]|['"]$/g, '').trim();
  return cleaned.length > 0 ? cleaned : DEFAULT_INDEXNOW_KEY;
}

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface SubmitUrlsOptions {
  host: string;
  urls: string[];
  key?: string;
}

export interface IndexNowResult {
  success: boolean;
  status?: number;
  count?: number;
  message?: string;
  error?: string;
}

export interface WebSubHubResult {
  hub: string;
  success: boolean;
  status?: number;
  message?: string;
  error?: string;
}

export interface EngineNotificationResult {
  success: boolean;
  host?: string;
  baseUrl?: string;
  urls?: string[];
  indexNow?: IndexNowResult;
  webSub?: WebSubHubResult[];
  error?: string;
}

/**
 * Dispatches a POST request to https://api.indexnow.org/indexnow
 * conforming to the IndexNow protocol used by Bing, Seznam, Yandex, and Naver.
 * Validates URL host matching, formats the payload, and safely handles network errors.
 */
export async function submitUrlsToIndexNow({
  host,
  urls,
  key,
}: SubmitUrlsOptions): Promise<IndexNowResult> {
  try {
    const rawClean = (host || '')
      .trim()
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      .split(':')[0]
      .toLowerCase();

    if (!rawClean) {
      console.warn('[IndexNow] Host missing for URL submission.');
      return { success: false, error: 'Missing host' };
    }

    const cleanHost = rawClean;
    const safeUrls = Array.isArray(urls)
      ? urls.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
      : [];

    if (safeUrls.length === 0) {
      return { success: true, count: 0, message: 'No URLs provided' };
    }

    const activeKey = key ? key.replace(/^['"]|['"]$/g, '').trim() : getIndexNowKey();
    const keyLocation = `https://${cleanHost}/${activeKey}.txt`;

    // Ensure all URLs are properly formatted absolute URLs and validate host matching
    const formattedUrls: string[] = [];
    for (const rawUrl of safeUrls) {
      const trimmed = rawUrl.trim();
      if (/^https?:\/\//i.test(trimmed)) {
        try {
          const parsed = new URL(trimmed);
          const parsedHost = parsed.host.split(':')[0].toLowerCase();
          if (parsedHost === cleanHost) {
            // Normalize protocol to https
            parsed.protocol = 'https:';
            formattedUrls.push(parsed.href);
          } else {
            console.warn(
              `[IndexNow] URL host "${parsedHost}" does not match target host "${cleanHost}". Skipping "${trimmed}".`
            );
          }
        } catch {
          console.warn(`[IndexNow] Malformed URL provided: "${trimmed}". Skipping.`);
        }
      } else {
        const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        formattedUrls.push(`https://${cleanHost}${cleanPath}`);
      }
    }

    const uniqueUrls = Array.from(new Set(formattedUrls));
    if (uniqueUrls.length === 0) {
      return { success: true, count: 0, message: 'No URLs matched target host' };
    }

    // Chunk into maximum 10,000 URLs per IndexNow API specification
    const BATCH_SIZE = 10000;
    let totalSuccessCount = 0;
    let lastStatus = 200;
    let lastMessage = 'OK';

    for (let i = 0; i < uniqueUrls.length; i += BATCH_SIZE) {
      const batch = uniqueUrls.slice(i, i + BATCH_SIZE);
      const payload: IndexNowPayload = {
        host: cleanHost,
        key: activeKey,
        keyLocation,
        urlList: batch,
      };

      let controller = new AbortController();
      let timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        let response = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'User-Agent': 'FoodNerve-IndexNow/1.0',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (response.status === 429) {
          console.warn(`[IndexNow] Rate limited (429) for host ${cleanHost}. Retrying in 2000ms...`);
          clearTimeout(timeoutId);
          await new Promise((r) => setTimeout(r, 2000));
          controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), 8000);
          response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'User-Agent': 'FoodNerve-IndexNow/1.0',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
        }

        const responseText = await response.text().catch(() => '');
        lastStatus = response.status;
        lastMessage = responseText || (response.ok ? 'OK' : `Status ${response.status}`);

        // HTTP 200 (OK) or 202 (Accepted - Key validation pending)
        if (response.ok || response.status === 202) {
          totalSuccessCount += batch.length;
          console.log(
            `[IndexNow] Successfully submitted ${batch.length} URL(s) for host ${cleanHost} (status: ${response.status})`
          );
        } else {
          console.warn(
            `[IndexNow] Submission returned status ${response.status} for host ${cleanHost}: ${responseText}`
          );
          return {
            success: false,
            status: response.status,
            count: totalSuccessCount,
            error: responseText || `Status ${response.status}`,
          };
        }
      } catch (err: any) {
        console.error(
          `[IndexNow] Network dispatch error for host ${cleanHost}:`,
          err?.message || err
        );
        return { success: false, error: err?.message || String(err) };
      } finally {
        clearTimeout(timeoutId);
      }
    }

    return {
      success: true,
      status: lastStatus,
      count: totalSuccessCount,
      message: lastMessage,
    };
  } catch (err: any) {
    console.error('[IndexNow] Unexpected error in submitUrlsToIndexNow:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Dispatches URL-encoded POST requests to WebSub (PubSubHubbub) hubs
 * notifying subscribers (Google Reader, Feedly, Feedspot, etc.) that the feed is updated.
 */
export async function pingWebSubHub(feedUrl: string): Promise<WebSubHubResult[]> {
  if (!feedUrl || typeof feedUrl !== 'string' || feedUrl.trim().length === 0) {
    return [];
  }

  const cleanFeedUrl = feedUrl.trim().startsWith('http')
    ? feedUrl.trim()
    : `https://foodnerve.org${feedUrl.trim().startsWith('/') ? '' : '/'}${feedUrl.trim()}`;

  const encodedBody = `hub.mode=publish&hub.url=${encodeURIComponent(cleanFeedUrl)}`;

  const pingPromises = WEBSUB_HUBS.map(async (hubUrl): Promise<WebSubHubResult> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(hubUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'FoodNerve-WebSub/1.0',
        },
        body: encodedBody,
        signal: controller.signal,
      });

      const responseText = await response.text().catch(() => '');

      // WebSub hub specs respond with 204 No Content or 200 OK on publish ping
      if (response.ok || response.status === 204) {
        console.log(
          `[WebSub] Successfully pinged hub ${hubUrl} for ${cleanFeedUrl} (status: ${response.status})`
        );
        return {
          hub: hubUrl,
          success: true,
          status: response.status,
          message: responseText || 'OK',
        };
      } else {
        console.warn(
          `[WebSub] Hub ${hubUrl} returned status ${response.status}: ${responseText}`
        );
        return {
          hub: hubUrl,
          success: false,
          status: response.status,
          error: responseText || `Status ${response.status}`,
        };
      }
    } catch (err: any) {
      console.error(`[WebSub] Failed to ping hub ${hubUrl}:`, err?.message || err);
      return { hub: hubUrl, success: false, error: err?.message || String(err) };
    } finally {
      clearTimeout(timeoutId);
    }
  });

  const settled = await Promise.allSettled(pingPromises);

  return settled.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      hub: WEBSUB_HUBS[idx],
      success: false,
      error: String(result.reason),
    };
  });
}

export interface NotifySearchEnginesOptions {
  domainHost?: string | null;
  paths: string[];
}

/**
 * Canonical background entry point:
 * Translates relative paths to absolute URLs using the domain SEO context,
 * and triggers IndexNow and WebSub notifications simultaneously without throwing.
 */
export async function notifySearchEnginesOfContent({
  domainHost,
  paths,
}: NotifySearchEnginesOptions): Promise<EngineNotificationResult> {
  try {
    const seo = resolveDomainSeoContext(domainHost);
    const baseUrl = seo.baseUrl.replace(/\/+$/, '');
    const host = new URL(baseUrl).host;

    const safePaths = Array.isArray(paths)
      ? paths.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      : [];

    const absoluteUrls = safePaths.map((path) => {
      const trimmed = path.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      return `${baseUrl}${cleanPath}`;
    });

    const uniqueUrls = Array.from(new Set(absoluteUrls));
    const feedUrl = `${baseUrl}/feed.xml`;

    const [indexNowRes, webSubRes] = await Promise.allSettled([
      submitUrlsToIndexNow({ host, urls: uniqueUrls }),
      pingWebSubHub(feedUrl),
    ]);

    const indexNow: IndexNowResult =
      indexNowRes.status === 'fulfilled'
        ? indexNowRes.value
        : { success: false, error: String(indexNowRes.reason) };

    const webSub: WebSubHubResult[] =
      webSubRes.status === 'fulfilled'
        ? webSubRes.value
        : [{ hub: 'all', success: false, error: String(webSubRes.reason) }];

    return {
      success: indexNow.success || webSub.some((w) => w.success),
      host,
      baseUrl,
      urls: uniqueUrls,
      indexNow,
      webSub,
    };
  } catch (err: any) {
    console.error('[notifySearchEnginesOfContent] Error in engine distribution execution:', err);
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
}
