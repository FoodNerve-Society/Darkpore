-- CreateTable
CREATE TABLE "WeeklyCommodityBid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "commodity" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountNP" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeeklyCommodityBid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklyCommodityWinner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "commodity" TEXT NOT NULL,
    "totalNP" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyCommodityWinner_year_week_key" ON "WeeklyCommodityWinner"("year", "week");

