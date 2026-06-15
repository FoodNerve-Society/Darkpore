export interface MatrixVector {
  id: string;
  name: string;
  multiplier: number;
  tier: string;
  description: string;
  detailedDescription: string;
  isRisk: boolean;
}

export interface MatrixFeature {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
}

export interface MatrixCell {
  baseScore: number;
  explanation: string;
}

export const VECTORS: MatrixVector[] = [
  { 
    id: 'monetization', name: 'Monetization', multiplier: 3, tier: 'Tier 1: Survival', isRisk: false, 
    description: 'Measures direct ROI and ability to generate hard revenue.',
    detailedDescription: 'When we ask if people will pay, we are looking for Direct ROI (Does this make me money?) or Elite Status (Does this buy me power/access?). Without hard, recurring, or massive transaction-based revenue, a platform is merely a charity. This vector carries a 3x multiplier because cash flow is the ultimate survival metric for a startup in the physical integration space.'
  },
  { 
    id: 'defensibility', name: 'Defensibility (Moat)', multiplier: 3, tier: 'Tier 1: Survival', isRisk: false, 
    description: 'How hard is it for a VC competitor or AI to copy this?',
    detailedDescription: 'In the AI era, code is not a moat. A competitor can copy an entire SaaS platform over the weekend using agents. The only true moats are Network Effects (the people in the room), Physical Infrastructure (logistics/escrow), or Verified Truth (immutable data). This vector carries a 3x multiplier because if you cannot defend the feature, you are just building free R&D for your competitors.'
  },
  { 
    id: 'execution', name: 'Execution Capability', multiplier: 3, tier: 'Tier 1: Survival', isRisk: true, 
    description: 'Do the founders possess the political, physical, or technical capital to build this?',
    detailedDescription: 'Founder-Product fit is critical. Are we the right people to build this? A purely software-based feature is easy (Score: 5). But a feature requiring physical logistics, dealing with transport unions, or sending auditors to Kano is brutally hard (Score: 0). This carries a 3x multiplier because hallucinating features we cannot physically execute will bankrupt the venture.'
  },
  { 
    id: 'desire', name: 'Desire (The Want)', multiplier: 2, tier: 'Tier 2: Growth', isRisk: false, 
    description: 'Do humans actually crave this feature based on greed, survival, or ego?',
    detailedDescription: 'A product fails if it only solves a "nice to have" problem. We evaluate whether the user desires this feature based on primal human drives: Greed (Making money), Survival (Not starving/protecting assets), or Ego (Flexing status in a verified network). A high desire score means the market will pull the product out of your hands.'
  },
  { 
    id: 'distribution', name: 'Distribution / CAC', multiplier: 2, tier: 'Tier 2: Growth', isRisk: true, 
    description: 'Can we acquire users cheaply? 5 = Viral ($0 CAC), 0 = Highly Expensive.',
    detailedDescription: 'Customer Acquisition Cost (CAC) vs Lifetime Value (LTV). If we have to spend $50 on Facebook ads to acquire a user who pays $10, we die. A feature scores a 5 if it has built-in viral loops (e.g., users sharing their own Flash Sales to make money, or SEO-driven content). A feature scores a 0 if it is an internal tool with zero capability to attract new users.'
  },
  { 
    id: 'regulation', name: 'Regulation & Macro', multiplier: 2, tier: 'Tier 2: Growth', isRisk: true, 
    description: 'Will the government shut this down? Will inflation destroy unit economics?',
    detailedDescription: 'The ultimate Death Stroke. If a feature handles Other People\'s Money (OPM), it triggers the SEC, CBN, and AML regulators. If it holds biometric data, it triggers GDPR/NDPR. If inflation drops the Naira by 20% in a week, does the transaction fail? A score of 5 means it is totally immune to regulators. A score of 0 means the founders face existential legal risk if execution is flawed.'
  },
  { 
    id: 'era', name: 'Era Relevance (AI)', multiplier: 2, tier: 'Tier 2: Growth', isRisk: false, 
    description: 'Does this feature survive or thrive in the post-AI decade?',
    detailedDescription: 'The internet is dead. Generative AI has flooded the web with deepfakes and $0 software. A feature is highly relevant (Score 5) if it leverages the physical world (atoms, which AI cannot move) or provides verified human trust. A feature is obsolete (Score 0) if an AI agent can do it faster and for free.'
  },
  { 
    id: 'timing', name: 'Timing (Why Now?)', multiplier: 2, tier: 'Tier 2: Growth', isRisk: false, 
    description: 'Are the market conditions perfect today?',
    detailedDescription: 'Launching Uber before the iPhone had GPS was a failure. Why is June 2026 the perfect time? Factors include: The collapse of traditional education forcing a pivot to Agent Playbooks, smartphone penetration hitting rural African farmers, and the Dead Internet Theory forcing elite capital to seek verified human Sanctuaries.'
  },
  { 
    id: 'tam', name: 'Market Size (TAM)', multiplier: 1, tier: 'Tier 3: Scale', isRisk: false, 
    description: 'If we capture 100%, is the market big enough to matter?',
    detailedDescription: 'Total Addressable Market. The physical B2B trade of agriculture and energy in Africa is worth hundreds of billions (Score 5). However, a feature like a gated Sanctuary deliberately constrains its TAM by kicking out the masses to preserve elite quality (Score 2). While TAM is important, high margins often beat sheer volume, giving this a 1x multiplier.'
  },
  { 
    id: 'frequency', name: 'Frequency of Use', multiplier: 1, tier: 'Tier 3: Scale', isRisk: false, 
    description: 'Is it a daily Painkiller or a yearly Vitamin?',
    detailedDescription: 'Behavioral habituation. If the platform only has "Vitamins" (used once a year), users delete the app. We need "Painkillers" (used 5 times a day) like notification updates and daily market pricing to keep Daily Active Users (DAU) high, even if the primary revenue events only happen quarterly.'
  },
];

export const FEATURES: MatrixFeature[] = [
  { 
    id: 'trade', name: '/trade', description: 'The Money Printer: Physical commerce, Flash Sales, and Group-Buys.',
    detailedDescription: 'The transactional engine of the Modular Society. It bridges the digital and physical divide by allowing agricultural operators to post Flash Sales and energy contractors to orchestrate Group-Buys. While it yields massive transaction fees, it exposes the platform to brutal logistical and physical supply-chain risks.'
  },
  { 
    id: 'learn', name: '/learn', description: 'The Safe Haven: Organic SEO engine providing Agent Playbooks.',
    detailedDescription: 'The top-of-funnel marketing engine. As traditional courses die to AI, this module pivots to "Prompt-to-Product" Masterclasses and Agent Orchestration playbooks. It acts as an organic SEO growth magnet with zero regulatory risk and $0 distribution cost.'
  },
  { 
    id: 'meet', name: '/meet', description: 'The Walled Garden: A KYC-gated sanctuary built to solve the AI trust crisis.',
    detailedDescription: 'A highly exclusive, subscription-based social feed and directory. In an internet polluted by AI deepfakes, this Sanctuary requires rigorous KYC and verification to enter. The network effect of having the top 1% of diaspora capital and local operators in one room creates an unassailable moat.'
  },
  { 
    id: 'profile', name: '/profile', description: 'The Ledger: An immutable history of physical execution.',
    detailedDescription: 'The death of the resume. Because AI can generate perfect CVs, the only valid credential left is an immutable, system-verified ledger of capital deployed and physical tasks completed. This acts as the platform\'s Trust Anchor, allowing users to flex their "Rank" globally.'
  },
  { 
    id: 'support', name: '/support', description: 'The Capital Reactor: Diaspora investment pipeline for infrastructure.',
    detailedDescription: 'The ultimate high-ticket transaction layer. It routes high-net-worth Diaspora remittances away from pure consumption and into productive, escrow-protected physical infrastructure funding (e.g. cold-rooms, mini-grids). Highly lucrative, but heavily targeted by SEC/AML regulators.'
  },
  { 
    id: 'updates', name: '/updates', description: 'The Utility: Notification center connecting humans to agent alerts.',
    detailedDescription: 'The behavioral glue of the platform. A pure UI pane that pushes real-time alerts (funding milestones, flash sale hits, network DMs). While it generates zero revenue and has no moat, it acts as the primary "Painkiller", forcing users to open the app multiple times a day.'
  }
];

export const CELLS: Record<string, MatrixCell> = {
  // --- TRADE ---
  'monetization_trade': { baseScore: 5, explanation: 'Direct ROI. If a farmer is desperate to sell ₦1M worth of tomatoes before they rot (Flash Sale), he will gladly pay a ₦50k fee to guarantee the sale. If an EPC contractor wins a ₦5M Group-Buy, they don\'t blink at a 3% platform fee. Maximum revenue potential.' },
  'defensibility_trade': { baseScore: 4, explanation: 'Anyone can build a marketplace UI. But if your /trade page is deeply integrated with physical logistics APIs, local transport unions, and a rugged escrow system that actually works in Nigeria, you have built a massive physical moat against pure-software competitors.' },
  'execution_trade': { baseScore: 1, explanation: 'The Boss Fight. Executing the UI is easy; executing the physical logistics is a nightmare. Dealing with broken trucks on the Lagos-Ibadan expressway, transport unions, and perishable goods requires a rugged, blue-collar operational team, making this the hardest feature to build.' },
  'desire_trade': { baseScore: 5, explanation: 'Driven by absolute primal survival and greed. Farmers must sell inventory before it rots, and buyers are desperate for below-market wholesale pricing. The desire is baked into the physics of commerce.' },
  'distribution_trade': { baseScore: 5, explanation: 'Marketplaces have built-in viral distribution. If an operator posts a flash sale, they will actively copy the link and blast it to their own WhatsApp groups to find buyers. The users market the platform for you.' },
  'regulation_trade': { baseScore: 2, explanation: 'Significant risk. Group-buys of solar hardware border heavily on "fractional asset ownership" (an unregistered security). Furthermore, rampant local inflation can destroy the unit economics of a trade between Monday and Friday.' },
  'era_trade': { baseScore: 5, explanation: 'White-collar laptop jobs got slaughtered by AI, but an AI cannot fix a broken solar panel or move a truck of tomatoes. Moving physical atoms is completely immune to AI deflation.' },
  'timing_trade': { baseScore: 4, explanation: 'Smartphone and 4G penetration in rural Africa has finally hit the tipping point where a blue-collar farmer has the hardware to use the platform. Furthermore, inflation is crushing middlemen, forcing direct peer-to-peer markets.' },
  'tam_trade': { baseScore: 5, explanation: 'Everyone eats. Everyone needs power. The B2B market for agriculture and energy infrastructure in Africa is practically bottomless. Capturing even 1% yields massive scale.' },
  'frequency_trade': { baseScore: 4, explanation: 'Commerce does not sleep. Checking market prices, hunting for logistics swaps, or snagging flash sales is a daily operational necessity, similar to a day-trader checking stocks.' },

  // --- LEARN ---
  'monetization_learn': { baseScore: 3, explanation: 'Information is moving towards $0 in the AI era. Users will only pay for /learn if you are selling highly specific, proprietary "Agent Playbooks" or monetizing the high-status human brand of the Masterclass instructor.' },
  'defensibility_learn': { baseScore: 3, explanation: 'Raw information has zero moat; AI can rewrite your articles in seconds. The only true defensibility comes from Livestreams (Proof of Life) and the parasocial relationship built around verified human implementation.' },
  'execution_learn': { baseScore: 5, explanation: 'Writing deep agricultural policy, engineering agent prompts, and filming masterclasses is perfectly aligned with the Founders’ domain expertise. This can be executed cleanly in a dark room with zero physical chaos.' },
  'desire_learn': { baseScore: 3, explanation: 'A moderate desire. People want shortcuts to wealth and status (which the Playbooks provide), but it lacks the immediate visceral desperation of a farmer trying to sell rotting crops.' },
  'distribution_learn': { baseScore: 5, explanation: 'Content is the ultimate $0 CAC distribution engine. SEO-optimized articles and viral Youtube livestreams naturally attract organic search traffic, pulling new users straight to the top of the funnel.' },
  'regulation_learn': { baseScore: 5, explanation: 'Absolute Safe Harbor. Publishing educational content, agricultural research, and software playbooks carries zero regulatory scrutiny and zero macro-economic risk.' },
  'era_learn': { baseScore: 3, explanation: 'Traditional "How to code" courses are dead. This only survives the AI era because it pivots entirely to teaching humans how to be "Agent Orchestrators" and survive the tech collapse.' },
  'timing_learn': { baseScore: 5, explanation: 'Perfect timing. The global workforce is in a state of panic as AI replaces jobs. Launching survival guides and implementation playbooks right now catches a massive wave of anxious professionals seeking retraining.' },
  'tam_learn': { baseScore: 3, explanation: 'While software scales infinitely, the TAM of "people willing to actively pay for deep-work agricultural/agent masterclasses" is much smaller than the broad consumer market for food or energy.' },
  'frequency_learn': { baseScore: 2, explanation: 'A classic "Vitamin". Nobody reads a 40-page report or watches a 2-hour masterclass every day. It is consumed weekly or monthly during dedicated deep-work sessions.' },

  // --- MEET ---
  'monetization_meet': { baseScore: 4, explanation: 'People pay Soho House $3,000/yr just to be in the room with rich people. A verified Sanctuary filled with diaspora capital and apex operators can easily charge premium recurring subscriptions for access.' },
  'defensibility_meet': { baseScore: 5, explanation: 'The ultimate network effect moat. Once you achieve critical mass, the platform becomes valuable only because everyone else is already there. A competitor cannot clone the humans in the room.' },
  'execution_meet': { baseScore: 3, explanation: 'Building the UI is simple, but solving the "Cold Start" problem is brutally hard. It requires massive social capital and charisma to convince the first 1,000 elite users to join an empty room.' },
  'desire_meet': { baseScore: 4, explanation: 'Driven heavily by human ego, status, and the desire to belong to an exclusive, high-value tribe. The velvet rope makes people want it more.' },
  'distribution_meet': { baseScore: 2, explanation: 'By design, a "Sanctuary" is hard to get into. Heavy KYC and gating means you cannot run mass-market ads. Relying on invite-only dynamics heavily slows down your user acquisition speed.' },
  'regulation_meet': { baseScore: 2, explanation: 'Collecting passports, business registrations, and biometric KYC data turns the platform into a massive target for Data Protection agencies (NDPR/GDPR). A data breach leads to catastrophic government fines.' },
  'era_meet': { baseScore: 5, explanation: 'In an internet completely flooded by AI deepfakes and bots, a KYC-verified Sanctuary is a survival requirement. Trust is the only scarce resource left.' },
  'timing_meet': { baseScore: 5, explanation: 'The "Dead Internet Theory" is now a reality. Launching a verifiable human enclave today perfectly times the global panic over deepfakes and digital fraud.' },
  'tam_meet': { baseScore: 2, explanation: 'Intentionally constrained. You do not want a billion users; you want the top 1% of highly verified, high-net-worth operators. A highly profitable, but small, market size.' },
  'frequency_meet': { baseScore: 4, explanation: 'Social media mechanics (scrolling feeds, checking DMs, arguing over policy) enforce daily or weekly high-frequency engagement habits.' },

  // --- PROFILE ---
  'monetization_profile': { baseScore: 2, explanation: 'Generates one-off verification fees (auditing), but lacks massive recurring revenue.' },
  'defensibility_profile': { baseScore: 5, explanation: 'A competitor can copy your code, but they cannot copy the past. An immutable, verified ledger of a user’s 3-year track record and 50 successful deliveries is the ultimate lock-in.' },
  'execution_profile': { baseScore: 3, explanation: 'Coding the ledger is easy. The execution risk lies in the physical KYC. Managing a network of physical auditors across Nigeria to verify agricultural assets increases operational friction significantly.' },
  'desire_profile': { baseScore: 4, explanation: 'Users desperately want a verifiable credential to flex their status, prove they are not scammers, and unlock diaspora capital funding.' },
  'distribution_profile': { baseScore: 4, explanation: 'The Ego Loop. Users will link their verified "Rank 4" profile in their Twitter bio and email signatures to prove legitimacy, driving free brand awareness for the platform.' },
  'regulation_profile': { baseScore: 3, explanation: 'If the system erroneously marks a legitimate user as a "Scammer" with a high dispute rate, the platform opens itself up to severe corporate defamation lawsuits.' },
  'era_profile': { baseScore: 4, explanation: 'Because AI can generate perfect resumes and cover letters in seconds, traditional credentials are dead. A system-verified ledger of physical execution is the only credential that survives.' },
  'timing_profile': { baseScore: 5, explanation: 'The resume is officially dead today. The global economy is frantically searching for a replacement standard of trust and proof-of-work.' },
  'tam_profile': { baseScore: 2, explanation: 'Profiles have no independent market size. They scale perfectly alongside the user base of /meet and /trade, but no one uses the platform purely to create an empty profile.' },
  'frequency_profile': { baseScore: 1, explanation: 'A "Set it and forget it" Vitamin. You build the profile once and only return to actively edit it when you hit a major milestone or rank.' },

  // --- SUPPORT ---
  'monetization_support': { baseScore: 4, explanation: 'Diaspora investors dropping $10,000 will happily pay a 2-5% "Smart Escrow & Management Fee" for the peace of mind that physical execution is verified before cash releases. Massive revenue.' },
  'defensibility_support': { baseScore: 3, explanation: 'Capital is ultimately fluid. If a competitor offers the exact same escrow for lower fees, investors may jump. The moat relies entirely on the trust generated by the /meet sanctuary.' },
  'execution_support': { baseScore: 2, explanation: 'Handling Other People’s Money (OPM) is dangerous. You need rock-solid banking APIs, strict legal compliance, and bulletproof escrow mechanisms. A single exploit destroys the company.' },
  'desire_support': { baseScore: 5, explanation: 'Maximum dual desire: Diaspora investors are desperate for a safe, fraud-free way to invest back home, while local operators are starved for affordable capital to build infrastructure.' },
  'distribution_support': { baseScore: 3, explanation: 'Acquiring high-net-worth diaspora investors via ads is incredibly expensive. However, partnering with remittance channels and diaspora organizations (NIDO) offers a strong, localized pipeline.' },
  'regulation_support': { baseScore: 0, explanation: 'The Ultimate Red Target. Pooling money from diaspora investors triggers the SEC, CBN, and AML watchdogs. You are a massive target for unlicensed broker-dealer and illegal crowdfunding laws.' },
  'era_support': { baseScore: 5, explanation: 'Funding pure software startups is dead because AI builds SaaS for free. Funding heavy physical infrastructure (cold rooms, solar arrays) is the new impenetrable asset class.' },
  'timing_support': { baseScore: 4, explanation: 'The Diaspora is richer than ever but heavily disillusioned by sending money to untrustworthy family members. Simultaneously, modern fintech/crypto rails make cross-border milestone escrow cheap and viable.' },
  'tam_support': { baseScore: 4, explanation: 'Remittances to Nigeria alone exceed $20 Billion annually. Re-routing even 5% of that away from consumption into productive infrastructure captures a multi-billion dollar TAM.' },
  'frequency_support': { baseScore: 1, explanation: 'Deploying $10,000 of capital is a high-stress, massive event. It happens quarterly or annually at best. The LTV is astronomical, but the frequency is incredibly low.' },

  // --- UPDATES ---
  'monetization_updates': { baseScore: 0, explanation: 'A complete cost center. You cannot charge a user to look at their own notifications, and you must pay Twilio/Meta to push critical SMS/WhatsApp alerts to them.' },
  'defensibility_updates': { baseScore: 0, explanation: 'Zero moat. It is just a UI pattern for push notifications. Any high school developer with an AI agent can build a notification pane in 30 minutes.' },
  'execution_updates': { baseScore: 5, explanation: 'Pure software execution. You don\'t need government permission, you don\'t need to manage physical assets. You just write the React code and hook up the database. Effortless.' },
  'desire_updates': { baseScore: 0, explanation: 'Pure utility. Users don\'t fundamentally "crave" a notification pane, they just use it as a necessary tool to track their actual desires (trade hits, funding).' },
  'distribution_updates': { baseScore: 0, explanation: 'Zero distribution. It is strictly an internal retention tool and has absolutely no capability to acquire new users from the open market.' },
  'regulation_updates': { baseScore: 5, explanation: 'Total safe harbor. Regulators and inflation do not care about a UI notification pane. Zero macro-economic exposure.' },
  'era_updates': { baseScore: 3, explanation: 'It is the necessary human-computer interface for "Agent Orchestration" (letting your AI Scout ping you), but it is ultimately just a basic delivery mechanism.' },
  'timing_updates': { baseScore: 3, explanation: 'Timing is irrelevant. Notification interfaces are an evergreen requirement for any application in any era.' },
  'tam_updates': { baseScore: 0, explanation: 'Zero independent market size. You cannot spin out a notification pane as a standalone unicorn startup.' },
  'frequency_updates': { baseScore: 5, explanation: 'The Ultimate Painkiller. Users will open the app 5 to 10 times a day just to check if their Group-Buy funded or if an investor messaged them. It drives all platform DAU.' },
};
