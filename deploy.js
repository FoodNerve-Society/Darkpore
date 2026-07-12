const { execSync } = require('child_process');

console.log("=========================================");
console.log("   PRODUCTION DEPLOYMENT SCRIPT");
console.log("=========================================");

try {
  // 1. Check working directory status
  const status = execSync('git status --porcelain').toString();
  if (status.trim().length > 0) {
    console.log("Uncommitted changes detected. Committing to dev before deployment...");
    execSync('git add .');
    const timestamp = new Date().toISOString();
    execSync(`git commit -m "chore(pre-deploy): state saved at ${timestamp} [skip ci]"`);
    execSync('git push -u origin dev');
  }

  // 2. Database Update
  console.log("\n[1/3] Generating & pushing database schema to Turso...");
  console.log("Note: If you made schema changes, ensure you've applied them using update-db.js or push_schema.js.");
  // If we had a robust SQL generator we would run it here.
  // For now, we alert the user that they must use the manual scripts if they changed Prisma.

  // 3. Git Operations
  console.log("\n[2/3] Merging 'dev' into 'main'...");
  
  // Ensure we are on dev branch and it is up to date
  execSync('git checkout dev', { stdio: 'ignore' });
  execSync('git pull origin dev', { stdio: 'ignore' });

  // Checkout main and merge dev
  execSync('git checkout main', { stdio: 'ignore' });
  execSync('git pull origin main', { stdio: 'ignore' });
  execSync('git merge dev -m "chore: merge dev into main for deployment"', { stdio: 'inherit' });

  // 4. Deploy (Push to main triggers Vercel)
  console.log("\n[3/3] Pushing to GitHub to trigger Vercel deployment...");
  execSync('git push origin main', { stdio: 'inherit' });

  // Switch back to dev for continued work
  console.log("\nSwitching back to 'dev' branch...");
  execSync('git checkout dev', { stdio: 'ignore' });

  console.log("\n=========================================");
  console.log("   DEPLOYMENT TRIGGERED SUCCESSFULLY! 🚀");
  console.log("   Vercel is now building the 'main' branch.");
  console.log("=========================================");

} catch (error) {
  console.error("\n❌ Deployment failed:", error.message);
  if (error.stdout) console.error(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
  
  // Try to recover back to dev
  try {
    execSync('git checkout dev', { stdio: 'ignore' });
  } catch(e) {}
}
