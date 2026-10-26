import 'dotenv/config';
import { prisma } from '../lib/db/client';

interface ShowcaseArticleSeed {
  setId: 1 | 2 | 3 | 4;
  id: string;
  slug: string;
  category: string;
  subcategory: string;
  timeframe: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  blocks: { blockType: string; content: Record<string, any> }[];
}

const SHOWCASE_ARTICLES: ShowcaseArticleSeed[] = [
  {
    setId: 1,
    id: 'font-showcase-1-lexend-clarity',
    slug: 'font-showcase-1-lexend-clarity',
    category: 'Logistics & Cold Chain',
    subcategory: 'Tomatoes & Perishables',
    timeframe: 'present',
    title:
      '[Font Option 1: Lexend + Outfit] The 42% Mile 12 Tomato Rot Trap: How Ventilated Plastic Crates Save ₦1.4M Per Trailer on the Kano–Lagos Corridor, and why woven raffia baskets must be retired',
    description:
      'Font Option 1 Showcase — Body: Lexend (Science-Backed High Clarity) | Main Headings: Outfit | Stylised Headings: DM Serif Display. A field breakdown of how switching from raffia baskets to stackable ventilated crates eliminates crush-loss across the 1,000km northern haulage corridor.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80',
    tags: ['font-set-1', 'present', 'Tomatoes', 'Post-Harvest Loss', 'Mile 12'],
    blocks: [
      {
        blockType: 'subheading',
        content: {
          text: 'The 42% Mile 12 Tomato Rot Trap: How Ventilated Plastic Crates Save ₦1.4M Per Trailer on the Kano–Lagos Corridor, and why woven raffia baskets must be retired',
        },
      },
      {
        blockType: 'highlight_card',
        content: {
          label: 'FONT SET 1 SHOWCASE · LEXEND + OUTFIT + DM SERIF',
          caption:
            '**42% vs. 4.8% Crush Loss:** Trailers hauling 450 woven raffia baskets from Kadawa (Kano) to Mile 12 (Lagos) lose an average of **₦1,420,000 per trip** to bottom-layer heat fermentation and compression. Switching to 25kg ventilated returnable plastic crates (RPCs) drops spoilage below **5%** on the very first run.',
        },
      },
      {
        blockType: 'exec_summary',
        content: {
          point1:
            '**The Raffia Compression Problem:** Conical woven baskets have zero vertical load-bearing walls, meaning the bottom 3 tiers of a 30-tonne trailer carry the crushing weight of the upper tiers for 36 hours.',
          point2:
            '**Airflow & Core Temperature:** Closed raffia stacks trap field heat above **38°C** during daytime stops at Lokoja and Jebba, cooking ripe tomatoes from the center outward before arrival in Lagos.',
          point3:
            '**The 3-Trip Crate Payback:** Even at ₦4,800 per crate deposit or ₦350 per-trip leasing fee, haulage syndicates recover the full crate transition cost in **under 3 southern trips** through preserved Grade-A fruit weight.',
        },
      },
      {
        blockType: 'core_interactive',
        content: {
          heading: '1. Why Woven Baskets Destroy Margin Before the Truck Reaches Jebba',
          bionicText:
            'Every week during peak dry-season harvest in Kano, Jigawa, and Kaduna, thousands of 50kg conical raffia baskets are packed dome-high with Roma and UC82B tomatoes. Because the baskets are flexible and overfilled, loaders stack them directly on top of the fruit below rather than on structural rims.\n\nBy the time a trailer crosses the Niger Bridge after 28 to 40 hours of road vibration and axle bounce, the bottom two layers of fruit have ruptured. The leaking juice triggers rapid fungal fermentation that spreads upward through the warm core of the load.\n\nWhen offloaders at **Mile 12 Market** tip those baskets onto sorting tarpaulins, buyers immediately discount crushed or wet-skinned lots by **55% to 70%**, turning prime northern farm effort into cheap street-grade paste within hours.',
          discussionPrompt:
            'Have you seen crate-leasing hubs operating cleanly at your local wholesale market yet?',
          repliesCount: 19,
        },
      },
      {
        blockType: 'pull_quote',
        content: {
          quote:
            'We are not losing forty percent of our tomatoes on the farm; we are crushing them to pulp inside dark, unventilated trailers between Zaria and Berger because we still treat soft fruit like dry grain.',
          authorName: 'Alhaji Musa Danbatta',
          authorRole: 'Inter-State Perishables Haulage Coordinator, Kano–Lagos Corridor',
        },
      },
      {
        blockType: 'myth_fact',
        content: {
          pairs: [
            {
              myth: 'Plastic crates take up too much space on the truck and reduce the total tonnage a dealer can carry.',
              fact: 'Interlocking ventilated crates stack 7-high without crushing a single fruit, delivering 95%+ salable Grade-A weight at Mile 12—netting ₦1.4M more cash per truck than overloaded raffia.',
            },
            {
              myth: 'Farmers must buy expensive plastic crates out of their own pocket.',
              fact: 'Crate-rental pools at collection centers in Kadawa and Zaria lease crates at ₦300–₦400 per trip and collect them at the Lagos offloading bay for backhaul.',
            },
          ],
        },
      },
      {
        blockType: 'live_poll',
        content: {
          question: 'What is the biggest barrier keeping tomato traders on raffia baskets today?',
          options: [
            'Old market pricing habits per basket',
            'Lack of backhaul crate collection depots',
            'Upfront deposit cost for plastic crates',
          ],
        },
      },
      {
        blockType: 'strategic_directive',
        content: {
          title: '3-Step Operator Action Plan for Crate Transition',
          directive:
            '1. **Enforce Shade Pre-Cooling:** Never load sun-heated fruit straight into crates; rest harvested crates under ventilated shade tarps for 90 minutes before truck loading.\n2. **Use Collar-Locked 25kg Crates:** Fill only to the internal load line (23–25kg) so the upper crate rests strictly on the corner pillars, never on the tomato skin.\n3. **Price by Verified Kilogram at Offload:** Shift buyer contracts at Mile 12 and Ojota from volumetric "basket eyeballs" to digital platform scale weights.',
        },
      },
      {
        blockType: 'call_to_action',
        content: {
          heading: 'Join the FoodNerve Cold-Chain & Crate Working Group',
          subtext:
            'Connect with crate pool operators, aggregators, and institutional buyers reducing perishables loss across Nigeria.',
          buttonText: 'Explore Corridor Solutions',
          buttonUrl: '/learn',
        },
      },
    ],
  },
  {
    setId: 2,
    id: 'font-showcase-2-jakarta-executive',
    slug: 'font-showcase-2-jakarta-executive',
    category: 'Processing & Value Addition',
    subcategory: 'Cassava & Tubers',
    timeframe: 'present',
    title:
      '[Font Option 2: Plus Jakarta Sans + Space Grotesk] Inside Oyo’s Cassava Starch Surge: How Hybrid Solar Flash Dryers Cut Diesel Spend by 58%, and why wet-cake middlemen are losing factory contracts',
    description:
      'Font Option 2 Showcase — Body: Plus Jakarta Sans (Clean Executive Sans) | Main Headings: Space Grotesk | Stylised Headings: Playfair Display Bold. How decentralized flash-drying centers in Iseyin and Ogbomoso are rewriting cassava unit economics.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    tags: ['font-set-2', 'present', 'Cassava', 'Processing', 'Oyo Corridor'],
    blocks: [
      {
        blockType: 'subheading',
        content: {
          text: 'Inside Oyo’s Cassava Starch Surge: How Hybrid Solar Flash Dryers Cut Diesel Spend by 58%, and why wet-cake middlemen are losing factory contracts',
        },
      },
      {
        blockType: 'highlight_card',
        content: {
          label: 'FONT SET 2 SHOWCASE · JAKARTA SANS + SPACE GROTESK + PLAYFAIR',
          caption:
            '**24-Hour Processing Window:** Fresh cassava roots begin enzymatic vascular streaking within **24 to 36 hours** of uprooting. Decentralized hybrid thermal-solar flash dryers placed within **15km of Oyo farm clusters** lock in 12% moisture High-Quality Cassava Flour (HQCF) while slashing AGO diesel burn by **58%**.',
        },
      },
      {
        blockType: 'exec_summary',
        content: {
          point1:
            '**Water Haulage Elimination:** Fresh cassava roots are **65% to 70% water**. Hauling raw roots from Oke-Ogun to Lagos or Ogun factories means paying ₦850,000 per truck mainly to transport water.',
          point2:
            '**Solar-Biomass Heat Exchangers:** Pairing roof-mounted solar air pre-heaters with cassava-peel biomass burners drops flash-dryer thermal fuel costs from ₦145,000 per tonne to under ₦60,000.',
          point3:
            '**Guaranteed Industrial Offtake:** Bakeries and packaging mills pay a **32% premium** for low-cyanide, odorless 12%-moisture HQCF produced within 18 hours of harvest.',
        },
      },
      {
        blockType: 'core_interactive',
        content: {
          heading: '1. Stop Paying Diesel Trucks to Haul 70% Water Across State Lines',
          bionicText:
            'For decades, cassava commerce across Oyo, Ogun, and Kwara followed a broken logistics pattern: smallholders uprooted wet tubers, loaded them onto open-back lorries, and shipped them 150 kilometers over bad roads to distant industrial mills. If a truck broke down for two days, the entire load discolored and fermented, forcing the farmer to dump it at giveaway garri prices.\n\nToday, smart cluster processors in **Iseyin, Saki, and Ogbomoso** are flipping the model. By grating, dewatering in hydraulic presses, and running the pressed cake through compact 6-cyclone flash dryers right at the farm gate, 4 tonnes of heavy wet root become **1 tonne of shelf-stable white flour** in a single shift.\n\nInstead of four trucks burning diesel on the expressway, a single dry-goods truck moves four times the caloric and industrial value—and the flour can sit safely in dry warehouse storage for 9 months without losing a single naira of quality.',
          discussionPrompt:
            'What is the current per-tonne farmgate price for high-starch TME 419 cassava roots in your zone?',
          repliesCount: 24,
        },
      },
      {
        blockType: 'pull_quote',
        content: {
          quote:
            'The moment you peel, press, and flash-dry cassava within ten kilometers of the farm, you stop being a desperate seller of a rotting root and become a price-maker holding industrial flour.',
          authorName: 'Engr. Folake Adeyemi',
          authorRole: 'Lead Process Director, Oke-Ogun Agro-Processing Cluster',
        },
      },
      {
        blockType: 'myth_fact',
        content: {
          pairs: [
            {
              myth: 'Flash dryers only make sense for giant multinational factories processing 200 tonnes a day.',
              fact: 'Modular 2-tonne-per-day cyclone flash dryers fabricated locally in Ibadan and Abeokuta achieve full payback in 14 months when run by a 15-farm cooperative.',
            },
          ],
        },
      },
      {
        blockType: 'live_poll',
        content: {
          question: 'Which energy source works best for rural cassava drying in your area?',
          options: [
            'Solar pre-heat + dried peel biomass',
            'CNG / LPG gas burners',
            'Grid + diesel backup',
          ],
        },
      },
      {
        blockType: 'strategic_directive',
        content: {
          title: 'Field Checklist for Cluster Flash-Dryer Deployment',
          directive:
            '1. **Test Starch Density First:** Use a simple specific-gravity water bucket scale at intake so farmers growing dense varieties (25%+ starch) get paid a clear bonus.\n2. **Press to 42% Moisture Before Heating:** Mechanical hydraulic pressing is 10x cheaper than thermal evaporation; squeeze out maximum water before the cake enters the hot air tube.\n3. **Bag in Moisture-Barrier Liners:** Seal finished flour immediately in 50kg woven bags with inner food-grade polyethylene liners.',
        },
      },
      {
        blockType: 'call_to_action',
        content: {
          heading: 'Explore Decentralized Processing Blueprints',
          subtext:
            'Review equipment specs, cooperative models, and industrial buyer standards on FoodNerve.',
          buttonText: 'View Processing Guides',
          buttonUrl: '/learn',
        },
      },
    ],
  },
  {
    setId: 3,
    id: 'font-showcase-3-sourceserif-editorial',
    slug: 'font-showcase-3-sourceserif-editorial',
    category: 'Storage & Preservation',
    subcategory: 'Roots & Highland Crops',
    timeframe: 'present',
    title:
      '[Font Option 3: Source Serif 4 + Newsreader] The Jos Cold-Room Margin Leak: Why Plateau Potato Aggregators Lose ₦180,000 Per Tonne in July Rain, and why ventilated curing sheds pay back in 11 weeks',
    description:
      'Font Option 3 Showcase — Body: Source Serif 4 (Financial Times / Medical Journal Editorial) | Main Headings: Newsreader Bold | Stylised Headings: Sora. How skin-set curing before transport rescues highland Irish potato harvests.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
    tags: ['font-set-3', 'present', 'Potatoes', 'Storage', 'Plateau Corridor'],
    blocks: [
      {
        blockType: 'subheading',
        content: {
          text: 'The Jos Cold-Room Margin Leak: Why Plateau Potato Aggregators Lose ₦180,000 Per Tonne in July Rain, and why ventilated curing sheds pay back in 11 weeks',
        },
      },
      {
        blockType: 'highlight_card',
        content: {
          label: 'FONT SET 3 SHOWCASE · SOURCE SERIF 4 + NEWSREADER + SORA',
          caption:
            '**The 10-Day Skin-Set Rule:** Irish potatoes dug from wet Bokkos and Mangu soils during the July–August peak have paper-thin, unhealed skins. Resting tubers in dark, cross-ventilated bamboo curing shelves for **10 days at 15°C–18°C** thickens the periderm skin and cuts bacterial soft-rot losses from **35% down to 4%**.',
        },
      },
      {
        blockType: 'exec_summary',
        content: {
          point1:
            '**Wet-Harvest Glut & Price Crash:** Because 70% of Plateau farmers dig and sell wet tubers in the same 6-week window, farmgate prices crash by half while Abuja and Lagos retail prices stay high.',
          point2:
            '**Why Uncured Potatoes Rot in Bags:** Stuffing freshly dug, damp potatoes into tightly woven 100kg nylon sacks seals in field mud and moisture, allowing *Erwinia* soft rot to liquefy a sack in 5 days.',
          point3:
            '**Diffused-Light & Ventilated Curing:** Low-cost mud-brick and slatted-wood curing stores in Bokkos let cooperatives hold prime Nicola and Marabel potatoes for **12 to 16 weeks** until prices double.',
        },
      },
      {
        blockType: 'core_interactive',
        content: {
          heading: '1. The Science of Periderm Healing: Why You Must Never Bag Wet Potatoes on Harvest Day',
          bionicText:
            'When an Irish potato is lifted from damp highland soil in Bokkos, Mangu, or Barkin Ladi, its outer skin is fragile and covered in microscopic scrapes from hoes and baskets. In that raw state, the tuber breathes rapidly and releases moisture. If it is immediately forced into a sealed polypropylene sack and loaded onto a warm truck heading down to Abuja or Port Harcourt, condensation forms on the skin within hours.\n\nThat thin film of warm water wakes up dormant soil bacteria, turning firm highland tubers into foul-smelling mush before the buyer can move them off the wholesale floor.\n\nBy contrast, when harvested tubers are spread 40 centimeters deep on slatted wooden racks inside a dark, naturally cool Plateau storehouse (where night air drops to **14°C**), the potato naturally seals its own wounds with a corky protective layer called **suberin**. Once cured, the skin cannot be rubbed off with a thumb—and the tuber travels across Nigeria like armor.',
          discussionPrompt:
            'Do buyers in your city pay a verified premium for dry-brushed, cured Jos potatoes over muddy field sacks?',
          repliesCount: 16,
        },
      },
      {
        blockType: 'pull_quote',
        content: {
          quote:
            'Ten days of patient air-curing in a shaded Bokkos shed is worth more to a potato farmer than ten million naira of refrigerated trucks used too late.',
          authorName: 'Dr. Yohanna Gyang',
          authorRole: 'Highland Root Crop Storage Specialist, Jos Plateau',
        },
      },
      {
        blockType: 'myth_fact',
        content: {
          pairs: [
            {
              myth: 'You need expensive 24/7 electric cold rooms to store Irish potatoes for two months on the Jos Plateau.',
              fact: 'Because Plateau night temperatures naturally sit between 13°C and 17°C, insulated mud-walled stores with night-ventilation louvers keep cured table potatoes crisp for 3 months without grid power.',
            },
          ],
        },
      },
      {
        blockType: 'live_poll',
        content: {
          question: 'What causes the biggest potato loss between Jos and southern markets?',
          options: [
            'Bagging wet, uncured tubers in nylon sacks',
            'Bruising from overstuffed 100kg bags',
            'Heat buildup during highway checkpoints',
          ],
        },
      },
      {
        blockType: 'strategic_directive',
        content: {
          title: 'Standard Operating Protocol for Highland Potato Aggregators',
          directive:
            '1. **Dry-Brush, Never Wash:** Never wash soil off potatoes before storage or long-haul transport; gently dry-brush after 48 hours of surface drying.\n2. **Switch to 25kg Mesh Bags or Slatted Crates:** Retire 100kg solid nylon sacks that suffocate tubers and rupture their cores.\n3. **Sort Out Cut Tubers at Intake:** One hoe-sliced tuber will infect 40 healthy neighbors inside a warm sack; remove all cut tubers on the sorting table before curing.',
        },
      },
      {
        blockType: 'call_to_action',
        content: {
          heading: 'Download the Highland Curing Shed Blueprint',
          subtext:
            'Step-by-step ventilation layout and timber rack dimensions for 20-tonne community stores.',
          buttonText: 'Open Storage Library',
          buttonUrl: '/learn',
        },
      },
    ],
  },
  {
    setId: 4,
    id: 'font-showcase-4-literata-comfort',
    slug: 'font-showcase-4-literata-comfort',
    category: 'Quality Assurance & Trade',
    subcategory: 'Oil Palm & Edibles',
    timeframe: 'present',
    title:
      '[Font Option 4: Literata + Jakarta Bold] Stopping Palm Oil Adulteration at Mushin & Onitsha: The 3-Minute Moisture and Carotene Field Test Every Bulk Buyer Needs, and why drum-seal verification is no longer optional',
    description:
      'Font Option 4 Showcase — Body: Literata (Kindle Long-Read Comfort Serif) | Main Headings: Plus Jakarta Sans ExtraBold | Stylised Headings: Kalam Bold. How wholesale buyers protect consumers and margins from Sudan dye, water-bulking, and high-FFA rancidity.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80',
    tags: ['font-set-4', 'present', 'Palm Oil', 'Quality Assurance', 'Food Safety'],
    blocks: [
      {
        blockType: 'subheading',
        content: {
          text: 'Stopping Palm Oil Adulteration at Mushin & Onitsha: The 3-Minute Moisture and Carotene Field Test Every Bulk Buyer Needs, and why drum-seal verification is no longer optional',
        },
      },
      {
        blockType: 'highlight_card',
        content: {
          label: 'FONT SET 4 SHOWCASE · LITERATA + JAKARTA BOLD + KALAM',
          caption:
            '**The <5% Free Fatty Acid (FFA) Standard:** Pure Special Palm Oil (SPO) milled from fresh Okomu or Cross River fruit clusters within 48 hours of harvest has natural deep-red beta-carotene, **under 0.2% moisture**, and zero synthetic dye. A 3-minute bay test protects bulk buyers from rancid, water-bulked drums.',
        },
      },
      {
        blockType: 'exec_summary',
        content: {
          point1:
            '**Why Rancid Oil Gets Dyed:** When palm bunches sit in wet heaps for 7–10 days before milling, Free Fatty Acids (FFA) spike above 12%, turning the oil pale, smelly, and soapy—tempting unscrupulous middlemen to add illegal red dyes.',
          point2:
            '**The Bottom-Drum Water Trick:** Unsealed 200-liter drums can hide 8 to 15 liters of emulsified water and starch sediment at the bottom, costing a 100-drum buyer over **₦1.8 million in fake volume**.',
          point3:
            '**3-Minute Receiving Bay Protocol:** A brass bottom-thief sampler, a pocket moisture strip, and a solvent spot test catch 99% of adulterated drums before a single bank transfer is approved.',
        },
      },
      {
        blockType: 'core_interactive',
        content: {
          heading: '1. Never Sample From the Top of a 200-Liter Drum',
          bionicText:
            'Walk into any major wholesale oil depot in **Mushin (Lagos), Onitsha (Anambra), or Aba (Abia)**, and you will see brokers dip a short plastic cup into the top five centimeters of a 200-liter drum to show how clear and bright the oil looks. That top layer is the oldest trick in the trade.\n\nBecause pure palm olein is lighter than water and mucilage, any added water, potash emulsion, or heavy starch sludge sinks straight to the bottom twenty centimeters of the drum within four hours of standing. A buyer who only inspects the top layer pays premium Special Palm Oil (SPO) prices for ten liters of murky water at the base of every drum.\n\nSerious institutional buyers and FoodNerve verified aggregators use a **1.2-meter brass bottom-sampling tube**. By lowering the tube to the very floor of the drum and drawing a bottom-core sample into a clear glass cylinder, water bulking and sediment show up in ten seconds flat.',
          discussionPrompt:
            'What quality checks does your team currently run before paying for bulk palm oil or vegetable oil drums?',
          repliesCount: 31,
        },
      },
      {
        blockType: 'pull_quote',
        content: {
          quote:
            'Trust in food trade is built with a clear glass sampling tube at the bottom of the drum, not with sweet words at the top of the drum.',
          authorName: 'Chief Nnamdi Okafor',
          authorRole: 'Bulk Edible Oils Quality Inspector, Onitsha–Lagos Trade Route',
        },
      },
      {
        blockType: 'myth_fact',
        content: {
          pairs: [
            {
              myth: 'The redder and thicker the palm oil looks in the market, the fresher and purer it is.',
              fact: 'Natural Special Palm Oil separates cleanly into ruby liquid olein on top and soft golden stearin below; chalky, uniform neon-red thickness is often a sign of potash-water emulsification or synthetic dye.',
            },
          ],
        },
      },
      {
        blockType: 'live_poll',
        content: {
          question: 'Which palm oil quality issue hurts your kitchen or business most?',
          options: [
            'High Free Fatty Acid (foaming & throat bite)',
            'Hidden water & sediment at drum bottom',
            'Fear of synthetic Sudan dye adulteration',
          ],
        },
      },
      {
        blockType: 'strategic_directive',
        content: {
          title: '3-Step Receiving Bay Inspection Before Payment',
          directive:
            '1. **Draw a Bottom-Core Sample:** Use a full-depth dip tube on at least 20% of every shipment to verify zero water or sludge layer at the drum floor.\n2. **Run the Heat & Foam Test:** Heat 50ml of oil in a clean stainless pan to 150°C; pure SPO stays calm and fragrant, while water-bulked or high-FFA oil crackles violently and foams.\n3. **Tag Mill-Direct Batch Seals:** Source from mills that crimp-seal drums immediately after clarification and attach batch harvest dates.',
        },
      },
      {
        blockType: 'call_to_action',
        content: {
          heading: 'Source Verified Mill-Direct Special Palm Oil',
          subtext:
            'See tested mill clusters and quality verification standards across the Southern Oil Palm Belt.',
          buttonText: 'View Quality Directory',
          buttonUrl: '/learn',
        },
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding 4 Font-Showcase Nigerian Agribusiness Articles...');

  // Find or fallback to an existing organization/author
  const org = await prisma.organization.findFirst();

  for (const item of SHOWCASE_ARTICLES) {
    // Upsert LearnContent
    const contentRecord = await prisma.learnContent.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        timeframe: item.timeframe,
        thumbnailUrl: item.thumbnailUrl,
        status: 'published',
        type: 'article',
        bottleneckTags: JSON.stringify(item.tags),
        authorName: 'Dr. Adefolami Agunbiade',
        isVerified: true,
        organizationId: org?.id || null,
        updatedAt: new Date(),
      },
      create: {
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        timeframe: item.timeframe,
        thumbnailUrl: item.thumbnailUrl,
        status: 'published',
        type: 'article',
        bottleneckTags: JSON.stringify(item.tags),
        authorName: 'Dr. Adefolami Agunbiade',
        isVerified: true,
        organizationId: org?.id || null,
      },
    });

    // Upsert LearnArticle
    const articleRecord = await prisma.learnArticle.upsert({
      where: { learnContentId: contentRecord.id },
      update: {
        readTime: '4 min read',
      },
      create: {
        learnContentId: contentRecord.id,
        readTime: '4 min read',
      },
    });

    // Replace blocks cleanly
    await prisma.learnArticleBlock.deleteMany({
      where: { articleId: articleRecord.id },
    });

    for (let i = 0; i < item.blocks.length; i++) {
      const b = item.blocks[i];
      await prisma.learnArticleBlock.create({
        data: {
          articleId: articleRecord.id,
          orderIndex: i,
          blockType: b.blockType,
          content: JSON.stringify(b.content),
        },
      });
    }

    console.log(`✅ Seeded Font Set #${item.setId}: /learn/article/${item.slug}`);
  }

  console.log('🎉 All 4 Font-Showcase Articles seeded successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
