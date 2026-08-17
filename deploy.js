const { execSync } = require('child_process');

async function deploy() {
  console.log("=========================================");
  console.log("   PRODUCTION DEPLOYMENT PIPELINE");
  console.log("=========================================");

  try {
    // 1. Turso Database Schema Parity Check
    console.log("\n[1/4] Checking Turso Database Schema Parity...");
    execSync('node turso_migrate.js', { stdio: 'inherit' });
    console.log("✅ Database schema is synced.");

    // 2. TypeScript Compilation Check
    console.log("\n[2/4] Verifying TypeScript Compilation...");
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log("✅ TypeScript check passed cleanly (0 errors).");

    // 3. Get commit message from CLI args or generate a clear one
    const customMsg = process.argv.slice(2).filter(a => !a.startsWith('-')).join(' ').trim();
    const commitMsg = customMsg || `feat: production deploy at ${new Date().toISOString()}`;

    // 4. Check active branch and commit any changes
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length > 0) {
      console.log(`\nUncommitted changes detected on branch '${currentBranch}'. Committing...`);
      execSync('git add .');
      execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    }

    // 5. Merge active branch into main and push to origin/main (PRODUCTION)
    console.log("\n[3/4] Deploying to Production ('main')...");
    execSync('git checkout main', { stdio: 'inherit' });
    if (currentBranch !== 'main') {
      execSync(`git merge ${currentBranch} -m "chore: merge ${currentBranch} into main for production"`, { stdio: 'inherit' });
    }
    console.log("Pushing 'main' to origin/main (triggers Vercel Production)...");
    execSync('git push origin main', { stdio: 'inherit' });

    // 6. Synchronize dev branch
    console.log("\n[4/4] Synchronizing 'dev' branch...");
    execSync('git checkout dev', { stdio: 'inherit' });
    execSync('git merge main -m "chore: sync main into dev"', { stdio: 'inherit' });
    execSync('git push origin dev', { stdio: 'inherit' });

    // 7. Always leave repository on 'main'
    execSync('git checkout main', { stdio: 'inherit' });

    console.log("\n=========================================");
    console.log("   DEPLOYMENT TRIGGERED SUCCESSFULLY! 🚀");
    console.log("   Production: pushed to origin/main");
    console.log("   Preview:    pushed to origin/dev");
    console.log("=========================================");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
  }
}

deploy();
