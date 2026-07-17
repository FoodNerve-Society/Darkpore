const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

try {
  // Use --from-config-datasource which will read prisma.config.ts
  execSync(`npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script > scratch/diff_utf8.sql`, { stdio: 'inherit' });
  console.log('Diff generated successfully.');
} catch (e) {
  console.error('Failed to generate diff:', e.message);
}
