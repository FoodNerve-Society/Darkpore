const { execSync } = require('child_process');

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

function runBackup() {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] Initiating auto-backup...`);

  try {
    // Check if git is initialized
    execSync('git status', { stdio: 'ignore' });

    // Add all changes
    execSync('git add .');

    // Check if there are changes to commit
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length === 0) {
      console.log(`[${timestamp}] No new changes to backup.`);
      return;
    }

    // Commit changes
    const commitMsg = `chore(auto-backup): state saved at ${timestamp}`;
    execSync(`git commit -m "${commitMsg}"`);
    
    // Push changes
    console.log(`[${timestamp}] Pushing to remote...`);
    execSync('git push');
    
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
