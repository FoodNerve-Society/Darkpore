const { createClient } = require('@libsql/client');

async function main() {
  require('dotenv').config({ path: '.env.local' });
  const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL).replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  const queries = [
    `CREATE TABLE "TradeListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "commodity" TEXT,
    "quantity" TEXT,
    "priceOrAsk" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "urgency" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'active',
    "slotsFilled" INTEGER,
    "slotsTotal" INTEGER,
    "swapOffer" TEXT,
    "swapWant" TEXT,
    "isBoosted" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "nervePointsCost" INTEGER,
    "postedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobSource" TEXT,
    "compType" TEXT,
    "targetTenantId" TEXT,
    "externalCompany" TEXT,
    "externalUrl" TEXT,
    "npReward" INTEGER,
    "minRank" INTEGER,
    "currency" TEXT,
    "minSalary" REAL,
    "maxSalary" REAL,
    "duration" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "workModel" TEXT,
    "challenges" TEXT,
    "subcategories" TEXT,
    "applicationMethod" TEXT NOT NULL DEFAULT 'native',
    "applicationEmail" TEXT,
    "applicationInstructions" TEXT,
    "customQuestions" TEXT,
    "requiredDocuments" TEXT,
    "externalButtonText" TEXT,
    "postedById" TEXT NOT NULL,
    "organizationId" TEXT,
    CONSTRAINT "TradeListing_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TradeListing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);`
  ];

  for (let q of queries) {
    try {
      await client.execute(q);
      console.log("Success:", q);
    } catch (e) {
      console.log("Failed (might already exist):", q, "->", e.message);
    }
  }
}
main();
