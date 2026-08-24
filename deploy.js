const { execSync } = require('child_process');

async function deploy() {
  console.log("=========================================");
  console.log("   PRODUCTION DEPLOYMENT PIPELINE");
  console.log("=========================================");

  try {
    // 1. Turso Database Schema Parity Check
    console.log("\n[1/3] Checking Turso Database Schema Parity...");
    execSync('node turso_migrate.js', { stdio: 'inherit' });
    console.log("✅ Database schema is synced.");

    // 2. TypeScript Compilation Check
    console.log("\n[2/3] Verifying TypeScript Compilation...");
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log("✅ TypeScript check passed cleanly (0 errors).");

    // 3. Get commit message from CLI args or generate a clear one
    const customMsg = process.argv.slice(2).filter(a => !a.startsWith('-')).join(' ').trim();
    const commitMsg = customMsg || `feat: production deploy at ${new Date().toISOString()}`;

    // 4. Commit any uncommitted changes on the active branch
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length > 0) {
      console.log("\nUncommitted changes detected. Committing...");
      execSync('git add .');
      execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    }

    // 5. Detect current branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    if (currentBranch === 'dev') {
      console.log("\nPushing dev branch to origin/dev...");
      execSync('git push origin dev', { stdio: 'inherit' });
    }

    // 6. Switch to main and merge dev
    console.log("\nSwitching to 'main' and merging changes...");
    execSync('git checkout main', { stdio: 'inherit' });
    if (currentBranch !== 'main') {
      execSync(`git merge ${currentBranch} --no-edit`, { stdio: 'inherit' });
    }

    // 7. Push to origin main directly for Vercel Production
    console.log("\n[3/3] Pushing to origin/main (triggering Vercel Production)...");
    execSync('git push origin main', { stdio: 'inherit' });

    // 8. Return to working branch
    if (currentBranch !== 'main') {
      execSync(`git checkout ${currentBranch}`, { stdio: 'inherit' });
    }

    console.log("\n=========================================");
    console.log("   DEPLOYMENT TRIGGERED SUCCESSFULLY! 🚀");
    console.log("   Pushed to origin/main for Vercel Production.");
    console.log("=========================================");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
  }
}

deploy();
