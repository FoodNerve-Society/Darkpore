
const { createClient } = require('@libsql/client');

async function main() {
  require('dotenv').config({ path: '.env.local' });
  const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL).replace('libsql://', 'https://');
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  const queries = [
    `ALTER TABLE "Organization" ADD COLUMN "logoUrl" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN "country" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN "state" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN "lga" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN "address" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN "isVirtual" BOOLEAN NOT NULL DEFAULT false;`,
    `ALTER TABLE "Organization" ADD COLUMN "isExternal" BOOLEAN NOT NULL DEFAULT false;`,
    `ALTER TABLE "Organization" ADD COLUMN "isPlatformOwner" BOOLEAN NOT NULL DEFAULT false;`,
    `ALTER TABLE "Organization" ADD COLUMN "challenges" TEXT;`,
    `ALTER TABLE "Organization" ADD COLUMN "subcategories" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "jobSource" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "compType" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "targetTenantId" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "externalCompany" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "externalUrl" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "npReward" INTEGER;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "minRank" INTEGER;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "currency" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "minSalary" REAL;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "maxSalary" REAL;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "duration" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "startDate" DATETIME;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "endDate" DATETIME;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "workModel" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "challenges" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "subcategories" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "applicationMethod" TEXT NOT NULL DEFAULT 'native';`,
    `ALTER TABLE "TradeListing" ADD COLUMN "applicationEmail" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "applicationInstructions" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "customQuestions" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "requiredDocuments" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "externalButtonText" TEXT;`,
    `ALTER TABLE "TradeListing" ADD COLUMN "organizationId" TEXT;`
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
