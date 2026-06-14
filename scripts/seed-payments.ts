import { prisma } from '../lib/db/client';

async function main() {
  console.log('Seeding Payments Article using the new Block Architecture...');

  // Need a mock author
  const authorId = 'sys-admin';
  const authorName = 'Foodnerve Intelligence';

  // 1. Uniqueness check loop
  let finalSlug = 'the-30-percent-lending-rate-paradox';
  let isUnique = false;
  let counter = 0;
  
  while (!isUnique) {
    const candidateSlug = counter === 0 ? finalSlug : `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const existing = await prisma.learnContent.findUnique({
      where: { slug: candidateSlug },
    });
    
    if (!existing) {
      finalSlug = candidateSlug;
      isUnique = true;
    }
    counter++;
  }

  const result = await prisma.$transaction(async (tx) => {
    const content = await tx.learnContent.create({
      data: {
        title: 'The 30% Lending Rate Paradox: Bypassing Banks with Off-Taker Capital',
        description: 'A 2026 Battlefield Report on how operators are using decentralized off-taker agreements to bypass traditional 30% bank interest rates.',
        slug: finalSlug,
        type: 'article',
        bottleneckTags: '[]',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000&auto=format&fit=crop',
        authorId,
        authorName,
      },
    });

    const article = await tx.learnArticle.create({
      data: {
        learnContentId: content.id,
      },
    });

    const blocks = [
      { orderIndex: 0, blockType: 'subheading', content: JSON.stringify({ text: 'The 30% Lending Rate Paradox' }) },
      { orderIndex: 1, blockType: 'highlight_card', content: JSON.stringify({ imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop', text: 'Central Bank lending rates hit 30% in June 2026, officially cutting off smallholder access to traditional working capital.', highlight: '30% Interest' }) },
      { orderIndex: 2, blockType: 'exec_summary', content: JSON.stringify({ points: 'Traditional bank debt is now financial suicide.\nOperators are bypassing banks using off-taker purchase agreements as collateral.\nDomestic staple farmers are being wiped out, while export-crop farmers are scaling.' }) },
      { orderIndex: 3, blockType: 'pull_quote', content: JSON.stringify({ quote: 'If I take a bank loan at 30% today, I am not farming. I am working for the bank.', attribution: '— Ibrahim M., Maize Aggregator (Kaduna)' }) },
      { orderIndex: 4, blockType: 'core_interactive', content: JSON.stringify({ bionicText: '### The Hacker’s Survival Guide\n\nBecause traditional capital is dead, operators are pivoting to **Off-Taker Guarantees**. Instead of going to a bank, aggregators are signing forward contracts with large processors (like flour mills). They use this signed contract as proof of future revenue to secure zero-interest input financing (seeds/fertilizer) directly from input suppliers.', anchorQuestion: 'What undocumented hacks are operators using to access capital in your local market?', imageUrl: '' }) },
      { orderIndex: 5, blockType: 'data_embed', content: JSON.stringify({ embedUrl: 'https://example-chart-embed.com/capital-flows', caption: 'Visualizing the shift from Bank Debt to Off-Taker Financing (2024-2026)' }) },
      { orderIndex: 6, blockType: 'core_interactive', content: JSON.stringify({ bionicText: '### Winners vs. Crushed\n\nThe export market is winning. Farmers growing sesame, ginger, and cashew can price their off-taker agreements in USD, completely insulating them from Naira devaluation. Meanwhile, domestic staple farmers (maize, cassava) are being crushed by local inflation.', anchorQuestion: 'Are you seeing a different winner in your specific sector? Drop the data.', imageUrl: '' }) },
      { orderIndex: 7, blockType: 'live_poll', content: JSON.stringify({ question: 'Are you currently deploying capital to bypass traditional bank loans?', options: 'Yes,Planning to,No' }) },
      { orderIndex: 8, blockType: 'exec_summary', content: JSON.stringify({ points: 'Stop applying for domestic Naira loans immediately.\nPivot at least 40% of your production to an export-commodity to secure USD-backed off-taker agreements.' }) }
    ];

    await tx.learnArticleBlock.createMany({
      data: blocks.map(block => ({
        articleId: article.id,
        orderIndex: block.orderIndex,
        blockType: block.blockType,
        content: block.content,
      })),
    });
  });

  console.log('✅ Payments article seeded successfully with 9 interactive blocks!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
