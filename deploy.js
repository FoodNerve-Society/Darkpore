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

    // 4. Ensure we are on main
    execSync('git checkout main', { stdio: 'inherit' });

    // 5. Commit any uncommitted changes on main
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length > 0) {
      console.log("\nUncommitted changes detected on 'main'. Committing...");
      execSync('git add .');
      execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    }

    // 6. Push to origin main directly for Vercel Production
    console.log("\n[3/3] Pushing to origin/main (triggering Vercel Production)...");
    execSync('git push origin main', { stdio: 'inherit' });

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
