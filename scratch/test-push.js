const { execSync } = require('child_process');

try {
  const dbUrl = "https://test.turso.io?authToken=abc";
  execSync(`npx cross-env DATABASE_URL="${dbUrl}" prisma db push`, { stdio: 'inherit' });
} catch (error) {
  console.log("Error:", error.message);
}
