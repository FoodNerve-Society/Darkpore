import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import {
  DEFAULT_INDEXNOW_KEY,
  getIndexNowKey,
  submitUrlsToIndexNow,
  pingWebSubHub,
  notifySearchEnginesOfContent,
  WEBSUB_HUBS,
} from '../lib/seo/indexnow';
import { GET as getIndexNowKeyRoute } from '../app/api/seo/indexnow-key/route';
import { GET as getFeedXml } from '../app/feed.xml/route';
import nextConfig from '../next.config';

let passedChecks = 0;
let totalChecks = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`, details ? `\nDetails: ${JSON.stringify(details, null, 2)}` : '');
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runIndexNowVerification() {
  console.log('===============================================================');
  console.log('  STARTING COMPREHENSIVE INDEXNOW & WEBSUB VERIFICATION SUITE  ');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // TEST SUITE 1: Key Management & Defaults
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: Key Management & Environment Resolution ---');

  assert(
    DEFAULT_INDEXNOW_KEY === 'd7a58c0e69b2447fa0d23812586e241c',
    'DEFAULT_INDEXNOW_KEY matches expected deterministic 32-hex key'
  );

  const originalEnv = process.env.INDEXNOW_KEY;
  try {
    delete process.env.INDEXNOW_KEY;
    assert(
      getIndexNowKey() === DEFAULT_INDEXNOW_KEY,
      'getIndexNowKey() falls back to DEFAULT_INDEXNOW_KEY when env is unset'
    );

    process.env.INDEXNOW_KEY = '  custom_test_key_12345  ';
    assert(
      getIndexNowKey() === 'custom_test_key_12345',
      'getIndexNowKey() trims and respects custom process.env.INDEXNOW_KEY'
    );

    process.env.INDEXNOW_KEY = '"d7a58c0e69b2447fa0d23812586e241c"';
    assert(
      getIndexNowKey() === 'd7a58c0e69b2447fa0d23812586e241c',
      'getIndexNowKey() strips double quotes from env values'
    );

    process.env.INDEXNOW_KEY = "'d7a58c0e69b2447fa0d23812586e241c'";
    assert(
      getIndexNowKey() === 'd7a58c0e69b2447fa0d23812586e241c',
      'getIndexNowKey() strips single quotes from env values'
    );
  } finally {
    if (originalEnv !== undefined) {
      process.env.INDEXNOW_KEY = originalEnv;
    } else {
      delete process.env.INDEXNOW_KEY;
    }
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 2: Static Verification Key File
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Static Verification Key File Serving ---');

  const staticFilePath = path.join(process.cwd(), 'public', `${DEFAULT_INDEXNOW_KEY}.txt`);
  assert(fs.existsSync(staticFilePath), 'Static verification file exists in public/ directory');

  const fileContent = fs.readFileSync(staticFilePath, 'utf-8').trim();
  assert(
    fileContent === DEFAULT_INDEXNOW_KEY,
    'Static verification file content exactly equals DEFAULT_INDEXNOW_KEY',
    { readContent: fileContent, expected: DEFAULT_INDEXNOW_KEY }
  );

  // -------------------------------------------------------------------------
  // TEST SUITE 3: Dynamic Route Handler & Edge Rewrites
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Dynamic Route Handler & Edge Rewrites ---');

  // Verify next.config.ts rewrites rule exists and matches indexnow key pattern
  assert(typeof nextConfig.rewrites === 'function', 'nextConfig.rewrites is defined as an async function');
  const rewritesResult = await nextConfig.rewrites!();
  const rewritesList = Array.isArray(rewritesResult) ? rewritesResult : (rewritesResult as any)?.beforeFiles || [];
  const indexNowRewrite = rewritesList.find(
    (r: any) => r.source === '/:key([a-f0-9]{16,64})\\.txt'
  );
  assert(indexNowRewrite !== undefined, 'Edge rewrite for /:key([a-f0-9]{16,64})\\.txt is registered in next.config.ts');
  assert(
    indexNowRewrite?.destination === '/api/seo/indexnow-key?key=:key',
    'Rewrite destination points to /api/seo/indexnow-key?key=:key'
  );

  // Case A: Matching key via query parameter
  const reqA = new NextRequest(`https://foodnerve.org/api/seo/indexnow-key?key=${DEFAULT_INDEXNOW_KEY}`);
  const resA = await getIndexNowKeyRoute(reqA);
  assert(resA.status === 200, 'GET /api/seo/indexnow-key?key=<defaultKey> returns HTTP 200 status');
  assert(
    resA.headers.get('content-type')?.includes('text/plain') ?? false,
    'GET /api/seo/indexnow-key response content-type is text/plain'
  );
  assert(
    resA.headers.get('cache-control')?.includes('max-age=86400') ?? false,
    'GET /api/seo/indexnow-key response Cache-Control has max-age=86400'
  );
  const textBodyA = await resA.text();
  assert(
    textBodyA === DEFAULT_INDEXNOW_KEY,
    'GET /api/seo/indexnow-key returns the exact key in the body',
    { body: textBodyA }
  );

  // Case B: Case-insensitivity (uppercase hex in key parameter)
  const reqB = new NextRequest(`https://foodnerve.org/api/seo/indexnow-key?key=${DEFAULT_INDEXNOW_KEY.toUpperCase()}`);
  const resB = await getIndexNowKeyRoute(reqB);
  assert(resB.status === 200, 'Uppercase hex in key query parameter is accepted with HTTP 200');

  // Case C: Non-matching valid hex key returns 404
  const reqC = new NextRequest(`https://foodnerve.org/api/seo/indexnow-key?key=00112233445566778899aabbccddeeff`);
  const resC = await getIndexNowKeyRoute(reqC);
  assert(resC.status === 404, 'Mismatched hex key correctly returns HTTP 404');

  // Case D: Missing key parameter returns 404
  const reqD = new NextRequest(`https://foodnerve.org/api/seo/indexnow-key`);
  const resD = await getIndexNowKeyRoute(reqD);
  assert(resD.status === 404, 'Missing key parameter returns 404 safely');

  // -------------------------------------------------------------------------
  // TEST SUITE 4: Payload Formatting, Host Validation, & Sanitization
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Payload Formatting, Host Sanitization, & URL Validation ---');

  // Empty URLs check
  const emptyResult = await submitUrlsToIndexNow({ host: 'foodnerve.org', urls: [] });
  assert(emptyResult.success === true, 'Empty URLs submission returns success without network hit');
  assert(emptyResult.count === 0, 'Empty URLs count is 0');

  // Non-array / null entries check
  const nullUrlsResult = await submitUrlsToIndexNow({
    host: 'foodnerve.org',
    urls: [null as any, '', '   ', undefined as any],
  });
  assert(nullUrlsResult.success === true, 'Falsy/empty URLs handled gracefully without throwing');
  assert(nullUrlsResult.count === 0, 'Cleaned URL count is 0');

  // Mock global fetch to verify exact outgoing payload structure and headers
  const originalFetch = globalThis.fetch;
  let interceptedPayload: any = null;
  let interceptedHeaders: any = null;
  let interceptedUrl: string | null = null;

  try {
    globalThis.fetch = (async (input: any, init?: any) => {
      interceptedUrl = typeof input === 'string' ? input : input.url;
      interceptedHeaders = init?.headers;
      if (init?.body) {
        interceptedPayload = JSON.parse(init.body);
      }
      return new Response(JSON.stringify({ message: 'OK' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as any;

    const testUrls = [
      'https://foodnerve.org/learn/article/crop-resilience',
      'https://foodnerve.org/feed.xml',
      '/sitemap.xml', // relative URL normalization test
      'https://google.com/malicious-url', // foreign host filtering test
      'https://foodnerve.org/learn/article/crop-resilience', // duplicate URL deduplication test
    ];

    const submissionResult = await submitUrlsToIndexNow({
      host: 'https://foodnerve.org:3000/', // Protocol, port, and trailing slash stripping test
      urls: testUrls,
    });

    assert(interceptedUrl === 'https://api.indexnow.org/indexnow', 'Target URL is https://api.indexnow.org/indexnow');
    assert(interceptedPayload !== null, 'Payload was sent in request body');
    assert(interceptedPayload.host === 'foodnerve.org', 'Host is cleaned, stripped of protocol, trailing slash, and port', { host: interceptedPayload.host });
    assert(interceptedPayload.key === DEFAULT_INDEXNOW_KEY, 'Key in payload matches active key');
    assert(
      interceptedPayload.keyLocation === `https://foodnerve.org/${DEFAULT_INDEXNOW_KEY}.txt`,
      'keyLocation matches https://<host>/<key>.txt without double slashes'
    );
    assert(
      Array.isArray(interceptedPayload.urlList) && interceptedPayload.urlList.length === 3,
      'urlList contains exactly 3 normalized, deduplicated, host-filtered URLs'
    );
    assert(
      !interceptedPayload.urlList.some((u: string) => u.includes('google.com')),
      'Foreign host URL (google.com) was safely filtered out of foodnerve.org submission'
    );
    assert(
      interceptedPayload.urlList[2] === 'https://foodnerve.org/sitemap.xml',
      'Relative URL was correctly transformed into absolute URL'
    );
    assert(
      interceptedHeaders?.['Content-Type']?.includes('application/json'),
      'Content-Type header is application/json; charset=utf-8'
    );
    assert(submissionResult.success === true, 'Submission result indicates success');

    // Subtest: Verify HTTP 429 backoff retry logic
    let attempts = 0;
    globalThis.fetch = (async (input: any, init?: any) => {
      attempts++;
      if (attempts === 1) {
        return new Response('Rate limited', { status: 429 });
      }
      return new Response(JSON.stringify({ message: 'OK' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as any;

    const retryResult = await submitUrlsToIndexNow({
      host: 'foodnerve.org',
      urls: ['/feed.xml'],
    });
    assert(attempts === 2, 'HTTP 429 triggered backoff retry (2 fetch attempts)');
    assert(retryResult.success === true, 'HTTP 429 retry completed successfully');
  } finally {
    globalThis.fetch = originalFetch;
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 5: WebSub (PubSubHubbub) Ping Logic
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: WebSub Ping Formatting & Multi-Hub Delivery ---');

  const webSubCalls: Array<{ url: string; headers: any; body: string }> = [];
  try {
    globalThis.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      webSubCalls.push({
        url,
        headers: init?.headers,
        body: init?.body,
      });
      return new Response(null, { status: 204 });
    }) as any;

    const pingResults = await pingWebSubHub('https://foodnerve.org/feed.xml');

    assert(webSubCalls.length === 2, 'Ping dispatched to both WebSub hubs');
    assert(
      webSubCalls.some((c) => c.url === WEBSUB_HUBS[0]),
      'Ping dispatched to Google Hub (pubsubhubbub.appspot.com)'
    );
    assert(
      webSubCalls.some((c) => c.url === WEBSUB_HUBS[1]),
      'Ping dispatched to Superfeedr Hub (pubsubhubbub.superfeedr.com)'
    );

    const call1 = webSubCalls[0];
    assert(
      call1.headers?.['Content-Type']?.includes('application/x-www-form-urlencoded'),
      'WebSub ping uses application/x-www-form-urlencoded'
    );
    assert(
      call1.body === `hub.mode=publish&hub.url=${encodeURIComponent('https://foodnerve.org/feed.xml')}`,
      'WebSub ping body contains properly URL-encoded mode and feed URL',
      { body: call1.body }
    );
    assert(pingResults.every((r) => r.success), 'All WebSub hub results reported success');

    // Empty / whitespace feed URL check
    const emptyFeedRes = await pingWebSubHub('   ');
    assert(Array.isArray(emptyFeedRes) && emptyFeedRes.length === 0, 'Empty feed URL returns empty array safely');

    // Subtest: Verify WebSub discovery hub tags & HTTP Link header in feed.xml
    const reqFeed = new NextRequest('https://foodnerve.org/feed.xml', {
      headers: { host: 'foodnerve.org' },
    });
    const resFeed = await getFeedXml(reqFeed);
    const feedXmlText = await resFeed.text();
    assert(resFeed.status === 200, 'GET /feed.xml returns HTTP 200');
    assert(
      feedXmlText.includes('<atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />'),
      'feed.xml contains Google Hub discovery link'
    );
    assert(
      feedXmlText.includes('<atom:link href="https://pubsubhubbub.superfeedr.com/" rel="hub" />'),
      'feed.xml contains Superfeedr Hub discovery link'
    );
    const linkHeader = resFeed.headers.get('Link') || '';
    assert(
      linkHeader.includes('https://pubsubhubbub.appspot.com/') &&
      linkHeader.includes('https://pubsubhubbub.superfeedr.com/') &&
      linkHeader.includes('rel="self"'),
      'feed.xml response Link header contains dual hub endpoints and self relation'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 6: Unified notifySearchEnginesOfContent Pipeline & Error Handling
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Unified notifySearchEnginesOfContent Pipeline & Error Handling ---');

  try {
    globalThis.fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('indexnow.org')) {
        return new Response('OK', { status: 200 });
      }
      if (url.includes('pubsubhubbub')) {
        return new Response(null, { status: 204 });
      }
      return new Response('Not found', { status: 404 });
    }) as any;

    // Test with foodnerve.org society host
    const resultOrg = await notifySearchEnginesOfContent({
      domainHost: 'foodnerve.org',
      paths: ['/learn/article/test-slug', '/feed.xml', '/sitemap.xml'],
    });

    assert(resultOrg.success === true, 'notifySearchEnginesOfContent returns success for society domain');
    assert(resultOrg.host === 'foodnerve.org', 'Resolved host is foodnerve.org');
    assert(
      resultOrg.urls?.includes('https://foodnerve.org/learn/article/test-slug') ?? false,
      'Article URL canonicalized with foodnerve.org base'
    );

    // Test with foodnerve.com market host
    const resultCom = await notifySearchEnginesOfContent({
      domainHost: 'foodnerve.com',
      paths: ['/careers/job-12345'],
    });

    assert(resultCom.host === 'foodnerve.com', 'Resolved host is foodnerve.com');
    assert(
      resultCom.urls?.includes('https://foodnerve.com/careers/job-12345') ?? false,
      'Careers URL canonicalized with foodnerve.com base'
    );

    // Test with undefined paths (defensive check)
    const resultDefensive = await notifySearchEnginesOfContent({
      domainHost: 'foodnerve.org',
      paths: undefined as any,
    });
    assert(resultDefensive.success === true, 'notifySearchEnginesOfContent with undefined paths handles safely');
  } finally {
    globalThis.fetch = originalFetch;
  }

  // Test error tolerance when network fetch throws
  try {
    globalThis.fetch = (async () => {
      throw new Error('Simulated network connection timeout');
    }) as any;

    const netFailResult = await submitUrlsToIndexNow({
      host: 'foodnerve.org',
      urls: ['/feed.xml'],
    });
    assert(netFailResult.success === false, 'Network failure returns success: false without unhandled crash');
    assert(
      netFailResult.error?.includes('Simulated network connection timeout') ?? false,
      'Error message captured in result object'
    );

    const pingFail = await pingWebSubHub('https://foodnerve.org/feed.xml');
    assert(
      pingFail.every((r) => r.success === false),
      'WebSub hub pings report success: false on network error without crashing'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 7: Live/Real Network Pings (Safe, Non-Blocking)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 7: Live Safe Network Ping (Fault Tolerance) ---');

  const liveResult = await submitUrlsToIndexNow({
    host: 'foodnerve.org',
    urls: ['https://foodnerve.org/feed.xml'],
  });
  console.log('  Live IndexNow response:', liveResult);
  assert(
    typeof liveResult.success === 'boolean',
    'Live IndexNow dispatch completes without throwing an unhandled exception'
  );

  const liveWebSub = await pingWebSubHub('https://foodnerve.org/feed.xml');
  console.log('  Live WebSub response count:', liveWebSub.length);
  assert(
    Array.isArray(liveWebSub) && liveWebSub.length === 2,
    'Live WebSub dispatch pings both hubs without throwing'
  );

  console.log('\n===============================================================');
  console.log(`  ALL ${passedChecks} OF ${totalChecks} AUTOMATED VERIFICATION CHECKS PASSED!`);
  console.log('===============================================================\n');
}

runIndexNowVerification().catch((err) => {
  console.error('\nVerification suite failed with error:', err);
  process.exit(1);
});
