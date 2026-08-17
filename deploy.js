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

    // 3. Get commit message if provided in arguments
    const customMsg = process.argv.slice(2).filter(a => !a.startsWith('-')).join(' ').trim();
    const commitMsg = customMsg || `feat: production deploy at ${new Date().toISOString()}`;

    // 4. Commit any uncommitted changes on the active branch
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length > 0) {
      console.log("\nUncommitted changes detected. Committing...");
      execSync('git add .');
      execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    }

    // 5. Complete bidirectional sync between dev & main
    console.log("\n[3/4] Synchronizing 'main' and 'dev' branches...");
    
    // Ensure dev is up to date and has the latest commits
    execSync('git checkout dev', { stdio: 'inherit' });
    
    // Switch to main and merge dev into main
    execSync('git checkout main', { stdio: 'inherit' });
    execSync('git merge dev -m "chore: merge dev into main for production"', { stdio: 'inherit' });
    
    // Push main to origin
    console.log("Pushing 'main' to GitHub origin (triggering Vercel deployment)...");
    execSync('git push origin main', { stdio: 'inherit' });

    // Sync main back to dev
    execSync('git checkout dev', { stdio: 'inherit' });
    execSync('git merge main -m "chore: sync main back to dev"', { stdio: 'inherit' });
    execSync('git push origin dev', { stdio: 'inherit' });

    // Return to main as default
    execSync('git checkout main', { stdio: 'inherit' });

    console.log("\n=========================================");
    console.log("   DEPLOYMENT TRIGGERED SUCCESSFULLY! 🚀");
    console.log("   Commits pushed to origin/main & origin/dev.");
    console.log("   Vercel is now building 'main'.");
    console.log("=========================================");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
  }
}

deploy();
