import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';



import path from 'path';
import { createClient } from '@libsql/client';

const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
let dbUrl = rawUrl && rawUrl !== 'undefined' 
  ? rawUrl 
  : 'file:./prisma/dev.db';

// Ensure the dbUrl resolves to an absolute path for local SQLite to prevent SQLITE_CANTOPEN (14) errors
if (dbUrl.startsWith('file:./')) {
  const dbFile = dbUrl.replace('file:./', '');
  dbUrl = `file:${path.join(process.cwd(), dbFile)}`;
} else if (dbUrl.startsWith('file:prisma/')) {
  const dbFile = dbUrl.replace('file:', '');
  dbUrl = `file:${path.join(process.cwd(), dbFile)}`;
}

// In case the relative path was parsed without prisma prefix
if (!dbUrl.includes('prisma') && dbUrl.startsWith('file:')) {
    dbUrl = dbUrl.replace('file:', `file:${path.join(process.cwd(), 'prisma')}\\`);
}

const libsql = createClient({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSql(libsql);

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
