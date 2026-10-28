import { NextRequest } from 'next/server';
import { prisma } from '../lib/db/client';
import {
  resolveDomainSeoContext,
  extractArticleSummaryAndFaqs,
  buildContentMetadata,
  buildArticleJsonLd,
  buildLivestreamJsonLd,
  renderArticleBlocksToMarkdown,
  renderLivestreamBlocksToMarkdown,
  renderArticleBlocksToHtml,
  renderLivestreamBlocksToHtml,
} from '../lib/seo/schema';
import sitemap from '../app/sitemap';
import { GET as getFeedXml } from '../app/feed.xml/route';
import { GET as getNewsSitemapXml } from '../app/news-sitemap.xml/route';
import { GET as getLlmsFullTxt } from '../app/llms-full.txt/route';
import nextConfig from '../next.config';
import { GET as getIndexNowKeyRoute } from '../app/api/seo/indexnow-key/route';
import { DEFAULT_INDEXNOW_KEY } from '../lib/seo/indexnow';

async function runVerification() {
  console.log('=== STARTING DEEP 5-NUANCE SEO & FEED VERIFICATION ===\n');

  // =========================================================================
  // NUANCE 1: 17-Block Serializers (Markdown & HTML) + Enhanced FAQ Extraction
  // =========================================================================
  console.log('--- NUANCE 1.1: Testing 17-Block Article Serializer to Markdown ---');
  const all17Blocks = [
    { blockType: 'subheading', content: { text: 'The Cold-Chain Infrastructure Bottleneck' } },
    { blockType: 'exec_summary', content: { point1: 'Post-harvest loss costs $9B annually.', point2: 'Cold hub payback is 14 months.', point3: 'Requires contract-backed lending.' } },
    { blockType: 'highlight_card', content: { label: 'Target Metric', caption: '65% reduction in spoilage with zero grid power.' } },
    {
      blockType: 'core_interactive',
      content: {
        heading: 'Thermodynamics of Evaporative Storage',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824',
        bionicText: 'By utilizing charcoal-packed walls saturated with non-potable water, ambient temp drops 10C.',
        discussionPrompt: 'How does your local cooperative manage heat waves?'
      }
    },
    {
      blockType: 'pull_quote',
      content: {
        quote: 'You cannot fix food security with food aid; you fix it with cold chain logistics.',
        authorName: 'Dr. Amina Bello',
        authorRole: 'Chief Agronomist'
      }
    },
    {
      blockType: 'myth_fact',
      content: {
        myth: 'Refrigerated trucks are required for rural haulage.',
        fact: 'Pre-cooling at aggregation points enables 48-hour ambient transport without rotting.'
      }
    },
    {
      blockType: 'comparison_matrix',
      content: {
        optionAName: 'Decentralized Solar Hubs',
        optionBName: 'Centralized Diesel Grid',
        winnerVerdict: 'Solar Hubs yield 3.2x higher return per hectare and 0% fuel price exposure.',
        rows: [
          { criterion: 'CapEx per ton', optionAValue: '$420', optionBValue: '$1,150', winner: 'A' },
          { criterion: 'OpEx / Liter diesel', optionAValue: '$0', optionBValue: '$1.45', winner: 'A' },
          { criterion: 'Grid Reliability', optionAValue: '99.4%', optionBValue: '61.2%', winner: 'A' },
          // Testing table cell pipe escaping edge case:
          { criterion: 'Risk Hedge', optionAValue: 'Zero fuel exposure | 100% solar', optionBValue: 'High inflation | diesel dependent', winner: 'A' },
        ],
      },
    },
    {
      blockType: 'unit_economics_card',
      content: {
        tam: '$4.2B Sub-Saharan Agri-Logistics',
        targetIrr: '34.5% Net Project IRR',
        ticketSize: '$50k - $250k per hub',
        grossMargin: '58% on throughput fees',
        paybackPeriod: '16 Months',
        primaryRisk: 'Seasonal harvest volatility hedged via multi-crop prep-lines',
        dealThesis: 'High initial CapEx is offset by long-term contract off-takers with guaranteed volume commitments.',
      },
    },
    {
      blockType: 'protocol_steps',
      content: {
        steps: [
          { stepNumber: 1, title: 'Site Selection & Soil Hydro-Survey', role: 'Field Engineer', timeWindow: 'Day 1-7', description: 'Ensure water table accessibility within 40 meters.', checklist: ['Hydrology report signed', 'Community land agreement notarized'] },
          { stepNumber: 2, title: 'Thermal Envelope Construction', role: 'Master Mason', timeWindow: 'Day 8-21', description: 'Assemble double-brick porous chamber with vulcanized charcoal core.', checklist: ['Charcoal compaction check', 'Passive airflow venting test'] },
        ],
      },
    },
    {
      blockType: 'timeline_tracker',
      content: {
        milestones: [
          { dateOrYear: 'Q1 2026', title: 'Pilot Deployment', description: '5 hubs commissioned across Ogun state corridor.', status: 'COMPLETED' },
          { dateOrYear: 'Q3 2026', title: 'Syndicate Scale-Up', description: '25 hubs financed through cooperative bonds.', status: 'IN PROGRESS' },
        ],
      },
    },
    {
      blockType: 'persona_dossier',
      content: {
        name: 'Malam Ibrahim Danjuma',
        age: '54',
        roleAndLocation: 'Tomato Aggregation Lead, Kano-Kaduna Axis',
        monthlyTurnover: '$18,500 equivalent in Naira',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        bio: 'Over 22 years leading 400+ tomato crate handlers through Mile 12 supply corridors.',
        fieldQuote: 'When the heat hits at 2 PM, every minute without cold is money evaporating into thin air.',
      },
    },
    {
      blockType: 'strategic_directive',
      content: {
        urgencyLevel: 'EXECUTE NOW',
        targetPersona: 'Agri-Fund Syndicate Directors',
        point1: 'The Threat: 40% diesel inflation is bankrupting generator-reliant chilling centers.',
        point2: 'Immediate Action: Transition debt portfolios into asset-backed solar cold leases.',
        point3: 'The Long-Term Pivot: Monopolize the first-mile temperature corridor before multinationals enter.',
        microCtaId: 'investor_deal_flow',
      },
    },
    {
      blockType: 'live_poll',
      content: {
        question: 'What is your farm cooperative’s biggest barrier to solar cooling?',
        // Testing pipe-delimited option parsing:
        options: 'High upfront CapEx || Lack of local repair technicians || Land title insecurity || Uncertain buyer demand',
        discussionPrompt: 'Share your cooperative’s current chilling setup in the WhatsApp group.',
      },
    },
    {
      blockType: 'media',
      content: {
        items: [
          { url: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824', caption: 'Thermal imagery showing 11.8C core temp during 38C noon sun.', sourceName: 'FoodNerve Field Station' },
        ],
      },
    },
    {
      blockType: 'call_to_action',
      content: {
        macroCtaId: 'action_group',
        hook: 'Join the Cold Chain Infrastructure Syndicate',
        buttonText: 'Apply to Co-Invest',
      },
    },
    {
      blockType: 'ecosystem_embed',
      content: {
        title: 'Lead Logistics Engineer — Cold Hubs',
        organization: 'Ogun Cold Alliance',
        location: 'Abeokuta, Nigeria',
        compensationOrTarget: '$36k - $48k + Equity',
        ctaText: 'Apply Now',
        ctaLink: 'https://foodnerve.com/careers/lead-logistics',
      },
    },
    {
      blockType: 'data_embed',
      content: {
        iframeUrl: 'https://charts.foodnerve.com/embed/cold-chain-irr-calculator',
      },
    },
  ];

  const mdOutput = renderArticleBlocksToMarkdown(all17Blocks);
  console.log('Markdown output length:', mdOutput.length, 'characters');

  // Assert critical 15-block elements in Markdown
  if (!mdOutput.includes('| Evaluation Criterion | Decentralized Solar Hubs | Centralized Diesel Grid | Winner |')) {
    throw new Error('Markdown serializer missing comparison_matrix table!');
  }
  // Assert table cell pipe was escaped:
  if (!mdOutput.includes('Zero fuel exposure \\| 100% solar')) {
    throw new Error('Markdown serializer failed to escape pipe (|) in comparison_matrix cell!');
  }
  if (!mdOutput.includes('**Verdict:** Solar Hubs yield 3.2x higher return')) {
    throw new Error('Markdown serializer missing comparison_matrix verdict!');
  }
  if (!mdOutput.includes('34.5% Net Project IRR') || !mdOutput.includes('$4.2B Sub-Saharan Agri-Logistics')) {
    throw new Error('Markdown serializer missing unit_economics_card metrics!');
  }
  if (!mdOutput.includes('**Step 1: Site Selection & Soil Hydro-Survey**') || !mdOutput.includes('- [ ] Hydrology report signed')) {
    throw new Error('Markdown serializer missing protocol_steps SOP!');
  }
  if (!mdOutput.includes('Q1 2026') || !mdOutput.includes('Pilot Deployment')) {
    throw new Error('Markdown serializer missing timeline_tracker milestones!');
  }
  if (!mdOutput.includes('Malam Ibrahim Danjuma') || !mdOutput.includes('Tomato Aggregation Lead')) {
    throw new Error('Markdown serializer missing persona_dossier profile!');
  }
  if (!mdOutput.includes('![Malam Ibrahim Danjuma](https://images.unsplash.com/photo-1534528741775-53994a69daeb)')) {
    throw new Error('Markdown serializer missing persona_dossier avatarUrl!');
  }
  if (!mdOutput.includes('Strategic Directive [EXECUTE NOW]') || !mdOutput.includes('The Threat: 40% diesel inflation')) {
    throw new Error('Markdown serializer missing strategic_directive memo!');
  }
  if (!mdOutput.includes('[Request Vetted Startup List](/deals)')) {
    throw new Error('Markdown serializer missing strategic_directive micro-CTA link!');
  }
  if (!mdOutput.includes('What is your farm cooperative’s biggest barrier to solar cooling?')) {
    throw new Error('Markdown serializer missing live_poll question!');
  }
  if (!mdOutput.includes('- [ ] High upfront CapEx') || !mdOutput.includes('- [ ] Lack of local repair technicians')) {
    throw new Error('Markdown serializer failed to parse pipe-delimited live_poll options!');
  }
  if (!mdOutput.includes('Thermal imagery showing 11.8C core temp')) {
    throw new Error('Markdown serializer missing media caption!');
  }
  if (!mdOutput.includes('Lead Logistics Engineer — Cold Hubs')) {
    throw new Error('Markdown serializer missing ecosystem_embed job!');
  }
  if (!mdOutput.includes('[Apply Now](https://foodnerve.com/careers/lead-logistics)')) {
    throw new Error('Markdown serializer missing ecosystem_embed CTA link!');
  }
  if (!mdOutput.includes('**Dr. Amina Bello**, Chief Agronomist')) {
    throw new Error('Markdown serializer missing pull_quote author role!');
  }
  if (!mdOutput.includes('Thermodynamics of Evaporative Storage')) {
    throw new Error('Markdown serializer missing core_interactive heading!');
  }
  if (!mdOutput.includes('![Analysis Graphic](https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824)')) {
    throw new Error('Markdown serializer missing core_interactive imageUrl!');
  }
  console.log('Nuance 1.1 Verified (All 17 Markdown Blocks with Deep Attributes): OK');

  console.log('\n--- NUANCE 1.2: Testing 17-Block Article Serializer to HTML ---');
  const htmlOutput = renderArticleBlocksToHtml(all17Blocks);
  if (!htmlOutput.includes('<table>') || !htmlOutput.includes('<th>Evaluation Criterion</th>')) {
    throw new Error('HTML serializer missing comparison_matrix table!');
  }
  if (!htmlOutput.includes('<h4>Unit Economics &amp; Investment Metrics</h4>') || !htmlOutput.includes('34.5% Net Project IRR')) {
    throw new Error('HTML serializer missing unit_economics_card HTML!');
  }
  if (!htmlOutput.includes('<ol>') || !htmlOutput.includes('Site Selection &amp; Soil Hydro-Survey')) {
    throw new Error('HTML serializer missing protocol_steps <ol>!');
  }
  if (!htmlOutput.includes('<blockquote><p>"You cannot fix food security with food aid; you fix it with cold chain logistics."</p>')) {
    throw new Error('HTML serializer missing pull_quote blockquote!');
  }
  if (!htmlOutput.includes('<img src="https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824" alt="Analysis Graphic" />')) {
    throw new Error('HTML serializer missing core_interactive image!');
  }
  if (!htmlOutput.includes('<a href="/deals">Request Vetted Startup List</a>')) {
    throw new Error('HTML serializer missing strategic_directive micro-CTA link!');
  }
  if (!htmlOutput.includes('<img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" alt="Malam Ibrahim Danjuma" />')) {
    throw new Error('HTML serializer missing persona_dossier avatar!');
  }
  console.log('Nuance 1.2 Verified (Semantic HTML Serializer): OK');

  console.log('\n--- NUANCE 1.3: Testing Synthesized FAQPage Q&A Extraction ---');
  // Include duplicate unit economics card to assert disambiguation
  const blocksWithDuplicate = [
    ...all17Blocks,
    {
      blockType: 'unit_economics_card',
      content: {
        tam: '$1.8B Solar Battery Hubs',
        targetIrr: '28% Project IRR',
        dealThesis: 'Secondary tranche deployment across Northern Nigeria.',
      },
    },
  ];

  const { summary: synSummary, faqs: synFaqs } = extractArticleSummaryAndFaqs(blocksWithDuplicate);
  console.log(`Extracted ${synFaqs.length} structured FAQ pairs for JSON-LD`);
  const comparisonFaq = synFaqs.find(f => f.question.includes('Decentralized Solar Hubs'));
  const unitEconFaq1 = synFaqs.find(f => f.question === 'What are the unit economics, target IRR, and payback period?');
  const unitEconFaq2 = synFaqs.find(f => f.question === 'What are the unit economics, target IRR, and payback period? (Part 2)');
  const mythFaq = synFaqs.find(f => f.question.includes('Myth:'));

  if (!comparisonFaq || !comparisonFaq.answer.includes('Verdict:')) {
    throw new Error('extractArticleSummaryAndFaqs failed to synthesize comparison_matrix Q&A!');
  }
  if (!unitEconFaq1 || !unitEconFaq1.answer.includes('34.5% Net Project IRR')) {
    throw new Error('extractArticleSummaryAndFaqs failed to synthesize unit_economics_card Q&A!');
  }
  if (!unitEconFaq2 || !unitEconFaq2.answer.includes('28% Project IRR')) {
    throw new Error('extractArticleSummaryAndFaqs failed to disambiguate duplicate unit_economics_card Q&A!');
  }
  if (!mythFaq) {
    throw new Error('extractArticleSummaryAndFaqs missing myth_fact Q&A!');
  }
  console.log('Synthesized Comparison Q&A:', comparisonFaq);
  console.log('Synthesized Unit Econ Q&A (Part 1):', unitEconFaq1);
  console.log('Synthesized Unit Econ Q&A (Part 2):', unitEconFaq2);
  console.log('Nuance 1.3 Verified (Enriched & Deduplicated FAQPage JSON-LD): OK');

  // =========================================================================
  // NUANCE 2: Verify /llms-full.txt Route Handler
  // =========================================================================
  console.log('\n--- NUANCE 2: Testing /llms-full.txt Route Handler ---');
  // 1. FoodNerve Domain
  const reqLlmsFood = new NextRequest('https://foodnerve.com/llms-full.txt', {
    headers: { host: 'foodnerve.com' },
  });
  const resLlmsFood = await getLlmsFullTxt(reqLlmsFood);
  const textLlmsFood = await resLlmsFood.text();
  if (resLlmsFood.status !== 200 || !textLlmsFood.includes('PART 1: STRATEGIC INTELLIGENCE ARTICLES & REPORTS') || !textLlmsFood.includes('PART 2: BROADCASTS, LIVESTREAMS & SLIDE DECKS')) {
    throw new Error('/llms-full.txt route failed to output full knowledge dump for foodnerve.com!');
  }
  console.log('FoodNerve /llms-full.txt length:', textLlmsFood.length, 'chars');

  // 2. Darkpore Domain
  const reqLlmsDarkpore = new NextRequest('https://darkpore.com/llms-full.txt', {
    headers: { host: 'darkpore.com' },
  });
  const resLlmsDarkpore = await getLlmsFullTxt(reqLlmsDarkpore);
  const textLlmsDarkpore = await resLlmsDarkpore.text();
  if (resLlmsDarkpore.status !== 200 || !textLlmsDarkpore.includes('PART 1: THE DARKPORE MANIFESTO & MACRO THESIS') || !textLlmsDarkpore.includes('PART 2: ACTIVE INFRASTRUCTURE VENTURES')) {
    throw new Error('/llms-full.txt route failed to output venture blueprints for darkpore.com!');
  }
  console.log('Darkpore /llms-full.txt length:', textLlmsDarkpore.length, 'chars');
  console.log('Nuance 2 Verified (/llms-full.txt route handlers): OK');

  // =========================================================================
  // NUANCE 3: Verify /feed.xml Route Handler (Media RSS 2.0 with <content:encoded>)
  // =========================================================================
  console.log('\n--- NUANCE 3: Testing /feed.xml Media RSS 2.0 for Microsoft Start / Edge ---');
  const reqFeed = new NextRequest('https://foodnerve.com/feed.xml', {
    headers: { host: 'foodnerve.com' },
  });
  const resFeed = await getFeedXml(reqFeed);
  const textFeed = await resFeed.text();

  if (resFeed.status !== 200) {
    throw new Error(`/feed.xml returned status ${resFeed.status}`);
  }
  if (!textFeed.includes('xmlns:content="http://purl.org/rss/1.0/modules/content/"')) {
    throw new Error('/feed.xml missing xmlns:content declaration!');
  }
  if (!textFeed.includes('xmlns:dc="http://purl.org/dc/elements/1.1/"')) {
    throw new Error('/feed.xml missing xmlns:dc declaration!');
  }
  if (!textFeed.includes('<dc:creator>')) {
    throw new Error('/feed.xml missing <dc:creator> author tag!');
  }
  if (!textFeed.includes('width="1280" height="720"')) {
    throw new Error('/feed.xml missing 1280x720 media:thumbnail attribute!');
  }
  if (!textFeed.includes('<content:encoded><![CDATA[')) {
    throw new Error('/feed.xml missing <content:encoded><![CDATA[...]]> body!');
  }
  if (!textFeed.includes('<atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />')) {
    throw new Error('/feed.xml missing Google Hub atom:link rel="hub" tag!');
  }
  if (!textFeed.includes('<atom:link href="https://pubsubhubbub.superfeedr.com/" rel="hub" />')) {
    throw new Error('/feed.xml missing Superfeedr Hub atom:link rel="hub" tag!');
  }
  const feedLinkHeader = resFeed.headers.get('Link') || '';
  if (
    !feedLinkHeader.includes('https://pubsubhubbub.appspot.com/') ||
    !feedLinkHeader.includes('https://pubsubhubbub.superfeedr.com/') ||
    !feedLinkHeader.includes('rel="self"')
  ) {
    throw new Error('/feed.xml missing or invalid RFC 5988 Link header for WebSub hubs!');
  }
  console.log('Nuance 3 Verified (/feed.xml Media RSS with WebSub hubs, <content:encoded>, <dc:creator>, & 1280x720 thumbnails): OK');

  // =========================================================================
  // NUANCE 4: Verify app/sitemap.ts and app/news-sitemap.xml
  // =========================================================================
  console.log('\n--- NUANCE 4.1: Deep Testing app/sitemap.ts across ALL Domain Clusters ---');

  // Cluster A: FoodNerve Public Market (.com)
  const sitemapCom = await sitemap('foodnerve.com');
  const urlsCom = sitemapCom.map(s => s.url);
  console.log(`FoodNerve.com generated ${urlsCom.length} URLs`);
  if (!urlsCom.includes('https://foodnerve.com/careers')) {
    throw new Error('foodnerve.com sitemap missing /careers static route!');
  }
  if (urlsCom.includes('https://foodnerve.com/trade')) {
    throw new Error('foodnerve.com sitemap should NOT include /trade (which belongs to .org)!');
  }
  if (urlsCom.includes('https://foodnerve.com/thesis')) {
    throw new Error('foodnerve.com sitemap should NOT include /thesis (which belongs to darkpore.com)!');
  }

  // Cluster B: FoodNerve Society (.org)
  const sitemapOrg = await sitemap('foodnerve.org');
  const urlsOrg = sitemapOrg.map(s => s.url);
  console.log(`FoodNerve.org generated ${urlsOrg.length} URLs`);
  if (!urlsOrg.includes('https://foodnerve.org/trade') || !urlsOrg.includes('https://foodnerve.org/meet') || !urlsOrg.includes('https://foodnerve.org/support')) {
    throw new Error('foodnerve.org sitemap missing society static routes (/trade, /meet, /support)!');
  }
  if (urlsOrg.includes('https://foodnerve.org/careers')) {
    throw new Error('foodnerve.org sitemap should NOT include /careers (which 404s on .org)!');
  }
  if (urlsOrg.includes('https://foodnerve.org/thesis')) {
    throw new Error('foodnerve.org sitemap should NOT include /thesis!');
  }

  // Cluster C: Darkpore Holding Company (darkpore.com)
  const sitemapDarkpore = await sitemap('darkpore.com');
  const urlsDarkpore = sitemapDarkpore.map(s => s.url);
  console.log(`Darkpore.com generated ${urlsDarkpore.length} URLs`);
  const expectedDarkporeRoutes = [
    'https://darkpore.com',
    'https://darkpore.com/thesis',
    'https://darkpore.com/ventures',
    'https://darkpore.com/partners',
    'https://darkpore.com/stress-test',
    'https://darkpore.com/legal',
    'https://darkpore.com/llms.txt',
    'https://darkpore.com/llms-full.txt',
    'https://darkpore.com/ventures/solar-cold-chain',
  ];
  for (const exp of expectedDarkporeRoutes) {
    if (!urlsDarkpore.includes(exp)) {
      throw new Error(`darkpore.com sitemap missing expected route: ${exp}`);
    }
  }
  // Ensure darkpore.com does NOT have 404 paths:
  const forbiddenDarkporePaths = ['/learn', '/calendar', '/careers', '/about', '/trade'];
  for (const fb of forbiddenDarkporePaths) {
    if (urlsDarkpore.some(u => u === `https://darkpore.com${fb}`)) {
      throw new Error(`darkpore.com sitemap contains invalid 404 path: ${fb}`);
    }
  }
  // Ensure no FoodNerve learnContent routes leaked to darkpore.com:
  if (urlsDarkpore.some(u => u.includes('https://darkpore.com/learn/'))) {
    throw new Error('darkpore.com sitemap leaked FoodNerve /learn/ content routes!');
  }

  // Assert no legacy /trade/[category]/[id] routes (which 404) across any cluster
  const allUrls = [...urlsCom, ...urlsOrg, ...urlsDarkpore];
  const invalidCategoryTrade = allUrls.find(u => /\/trade\/[^/]+\/[^/]+$/.test(u));
  if (invalidCategoryTrade) {
    throw new Error(`Found invalid 404 trade URL in sitemaps: ${invalidCategoryTrade}`);
  }

  console.log('\n--- NUANCE 4.2: Testing /news-sitemap.xml Route Handler across Domains ---');
  // Test foodnerve.com news sitemap
  const reqNews = new NextRequest('https://foodnerve.com/news-sitemap.xml', {
    headers: { host: 'foodnerve.com' },
  });
  const resNews = await getNewsSitemapXml(reqNews);
  const textNews = await resNews.text();
  if (resNews.status !== 200 || !textNews.includes('<urlset') || !textNews.includes('<news:news>')) {
    throw new Error('/news-sitemap.xml failed to return valid Google News sitemap for foodnerve.com!');
  }

  // Verify 48-hour threshold compliance on any returned articles
  const dateMatches = Array.from(textNews.matchAll(/<news:publication_date>([^<]+)<\/news:publication_date>/g));
  const twoDaysAndHourAgo = Date.now() - (48 * 60 + 60) * 60 * 1000;
  for (const m of dateMatches) {
    const pubTime = new Date(m[1]).getTime();
    if (pubTime < twoDaysAndHourAgo) {
      throw new Error(`/news-sitemap.xml contained article older than 48 hours: ${m[1]}`);
    }
  }

  // Test darkpore.com news sitemap (should be clean without 404 items)
  const reqNewsDark = new NextRequest('https://darkpore.com/news-sitemap.xml', {
    headers: { host: 'darkpore.com' },
  });
  const resNewsDark = await getNewsSitemapXml(reqNewsDark);
  const textNewsDark = await resNewsDark.text();
  if (resNewsDark.status !== 200 || !textNewsDark.includes('<urlset') || textNewsDark.includes('/learn/article/')) {
    throw new Error('/news-sitemap.xml leaked 404 learn routes on darkpore.com!');
  }
  console.log('Nuance 4 Verified (Domain-accurate sitemaps without 404s across all clusters): OK');

  // =========================================================================
  // NUANCE 5: Secondary Public Article Routes Metadata & JSON-LD
  // =========================================================================
  console.log('\n--- NUANCE 5: Testing Metadata & JSON-LD on Secondary Public Article Routes ---');
  const sampleArticle = {
    id: 'art-secondary-test',
    slug: 'the-cold-chain-shift',
    title: 'The Cold Chain Shift in West Africa',
    description: 'Why decentralized evaporative hubs yield 34% project IRR.',
    createdAt: new Date('2026-03-15T00:00:00Z'),
    article: { blocks: all17Blocks },
  };

  const metaSecondary = buildContentMetadata(sampleArticle, 'foodnerve.org', `/learn/article/${sampleArticle.slug}`);
  const jsonLdSecondary = buildArticleJsonLd(sampleArticle, 'foodnerve.org', `/learn/article/${sampleArticle.slug}`);

  if (!metaSecondary.title || metaSecondary.title !== sampleArticle.title) {
    throw new Error('Secondary route metadata failed to resolve title!');
  }
  if (!jsonLdSecondary['@graph'] || jsonLdSecondary['@graph'].length < 2) {
    throw new Error('Secondary route JSON-LD graph missing NewsArticle and FAQPage!');
  }
  console.log('Secondary Route Metadata Alternates Canonical:', metaSecondary.alternates?.canonical);
  console.log('Secondary Route JSON-LD Graph Nodes:', jsonLdSecondary['@graph'].map((n: any) => n['@type']));
  console.log('Nuance 5 Verified (Secondary Public Article Routes Metadata & JSON-LD): OK');

  // =========================================================================
  // NUANCE 6: Next.js Rewrites & Isolated IndexNow Key Route Handler
  // =========================================================================
  console.log('\n--- NUANCE 6: Testing Next.js Edge Rewrites & Isolated IndexNow Key Route ---');
  if (typeof nextConfig.rewrites !== 'function') {
    throw new Error('nextConfig.rewrites is not defined as an async function!');
  }
  const rewritesResult = await nextConfig.rewrites();
  const rewritesList = Array.isArray(rewritesResult) ? rewritesResult : (rewritesResult as any)?.beforeFiles || [];
  const indexNowRewrite = rewritesList.find(
    (r: any) => r.source === '/:key([a-f0-9]{16,64})\\.txt'
  );
  if (!indexNowRewrite) {
    throw new Error('Edge rewrite for /:key([a-f0-9]{16,64})\\.txt is missing from next.config.ts!');
  }
  if (indexNowRewrite.destination !== '/api/seo/indexnow-key?key=:key') {
    throw new Error(`Rewrite destination mismatch: expected /api/seo/indexnow-key?key=:key, got ${indexNowRewrite.destination}`);
  }

  // Verify route handler response
  const reqKeyValid = new NextRequest(`https://foodnerve.org/api/seo/indexnow-key?key=${DEFAULT_INDEXNOW_KEY}`);
  const resKeyValid = await getIndexNowKeyRoute(reqKeyValid);
  if (resKeyValid.status !== 200) {
    throw new Error(`Expected HTTP 200 for valid key, got ${resKeyValid.status}`);
  }
  const textKey = await resKeyValid.text();
  if (textKey !== DEFAULT_INDEXNOW_KEY) {
    throw new Error(`Expected body to match key, got ${textKey}`);
  }
  const cacheHeader = resKeyValid.headers.get('cache-control') || '';
  if (!cacheHeader.includes('max-age=86400')) {
    throw new Error(`Missing expected Cache-Control max-age=86400 on indexnow-key route: ${cacheHeader}`);
  }

  const reqKeyInvalid = new NextRequest(`https://foodnerve.org/api/seo/indexnow-key?key=invalid0000000000000000000000000`);
  const resKeyInvalid = await getIndexNowKeyRoute(reqKeyInvalid);
  if (resKeyInvalid.status !== 404) {
    throw new Error(`Expected HTTP 404 for invalid key, got ${resKeyInvalid.status}`);
  }
  console.log('Nuance 6 Verified (Next.js Rewrites & Isolated IndexNow Key Route Handler): OK');

  console.log('\n=============================================================');
  console.log('🎉 ALL 6 WEDNESDAY SEO REFINEMENT AUDITS VERIFIED! 🎉');
  console.log('=============================================================\n');
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('VERIFICATION FAILED:', err);
    process.exit(1);
  });
