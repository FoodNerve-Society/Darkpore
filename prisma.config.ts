import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';

export default defineConfig({
  datasource: {
    url: rawUrl.startsWith('file:') && !rawUrl.includes('file:./prisma/')
      ? rawUrl.replace('file:./', 'file:./prisma/')
      : rawUrl,
  },
});
