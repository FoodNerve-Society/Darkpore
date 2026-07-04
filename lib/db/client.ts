import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';



const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  console.warn("WARNING: No database URL provided in environment variables (TURSO_DATABASE_URL or DATABASE_URL).");
}

const adapter = new PrismaLibSql({
  url: rawUrl || '',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const globalForPrisma = globalThis as unknown as {
  prisma_v2: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma_v2 ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v2 = prisma;
