const { execSync } = require('child_process');

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

function runBackup() {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] Initiating auto-backup...`);

  try {
    // Check if git is initialized
    execSync('git status', { stdio: 'ignore' });

    // Ensure we are on the dev branch
    try {
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
      if (currentBranch !== 'dev') {
        console.log(`[${timestamp}] Switching to dev branch...`);
        execSync('git checkout -b dev || git checkout dev', { stdio: 'ignore' });
      }
    } catch (e) {
      console.error("Failed to checkout dev branch:", e.message);
    }

    // Add all changes
    execSync('git add .');

    // Check if there are changes to commit
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length === 0) {
      console.log(`[${timestamp}] No new changes to backup.`);
      return;
    }

    // Commit changes
    const commitMsg = `chore(auto-backup): state saved at ${timestamp} [skip ci]`;
    execSync(`git commit -m "${commitMsg}"`);
    
    // Pull remote changes first to integrate any external commits seamlessly
    try {
      execSync('git pull --rebase --autostash origin dev', { stdio: 'ignore' });
    } catch (pullErr) {
      console.log(`[${timestamp}] Notice: Continuing with push...`);
    }

    // Push changes to dev branch safely
    console.log(`[${timestamp}] Pushing to dev branch...`);
    execSync('git push -u origin dev');
    
    console.log(`[${timestamp}] Auto-backup completed successfully.`);
  } catch (error) {
    console.error(`[${timestamp}] Auto-backup failed:`, error.message);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
  }
}

console.log("=========================================");
console.log("   Auto-Backup Script Started");
console.log("   Interval: 30 minutes");
console.log("   Keep this terminal window open.");
console.log("=========================================");

// Run the first backup immediately
runBackup();

// Schedule subsequent backups
setInterval(runBackup, INTERVAL_MS);
