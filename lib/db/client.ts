import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';



const rawUrl = process.env.DATABASE_URL;
const dbUrl = rawUrl && rawUrl !== 'undefined' 
  ? rawUrl.replace('file:./', 'file:./prisma/') 
  : 'file:./prisma/dev.db';

const adapter = new PrismaLibSql({
  url: dbUrl,
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
