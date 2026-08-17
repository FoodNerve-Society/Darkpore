-- CreateTable
CREATE TABLE "DailyEditorialIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "articleInsights" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "DailyEditorialIntel_year_week_dayOfWeek_idx" ON "DailyEditorialIntel"("year", "week", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEditorialIntel_year_week_dayOfWeek_commodity_key" ON "DailyEditorialIntel"("year", "week", "dayOfWeek", "commodity");

