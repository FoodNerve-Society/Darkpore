const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function deploy() {
  console.log("=========================================");
  console.log("   PRODUCTION DEPLOYMENT PIPELINE");
  console.log("=========================================");

  try {
    // 1. Sync Turso Database Schema
    console.log("\n[1/4] Syncing Turso Production Database Schema...");
    execSync('node push_schema.js', { stdio: 'inherit' });
    console.log("✅ Live database schema synced cleanly with Prisma.");

    // 2. TypeScript Compilation Check
    console.log("\n[2/4] Verifying TypeScript Compilation...");
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log("✅ TypeScript check passed cleanly (0 errors).");

    // Close readline
    rl.close();

    // 3. Commit local changes if any
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length > 0) {
      console.log("\nUncommitted changes detected. Committing...");
      execSync('git add .');
      const timestamp = new Date().toISOString();
      execSync(`git commit -m "chore(pre-deploy): state saved at ${timestamp} [skip ci]"`);
      execSync('git push origin main');
    }

    // 4. Git Synchronization between main & dev
    console.log("\n[3/4] Synchronizing 'main' and 'dev' branches...");
    execSync('git checkout dev', { stdio: 'ignore' });
    execSync('git pull origin dev', { stdio: 'ignore' });
    execSync('git merge main -m "chore: sync main into dev"', { stdio: 'ignore' });
    execSync('git push origin dev', { stdio: 'ignore' });

    execSync('git checkout main', { stdio: 'ignore' });
    execSync('git push origin main', { stdio: 'inherit' });

    console.log("\n=========================================");
    console.log("   DEPLOYMENT TRIGGERED SUCCESSFULLY! 🚀");
    console.log("   Vercel is now building the 'main' branch.");
    console.log("=========================================");

  } catch (error) {
    rl.close();
    console.error("\n❌ Deployment failed:", error.message);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
  }
}

deploy();
