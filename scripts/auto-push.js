const { execSync } = require('child_process');

try {
  // Get git status porcelain (machine readable format)
  const statusOutput = execSync('git status --porcelain').toString();
  
  // Split by newlines and filter out empty strings
  const changedFiles = statusOutput.split('\n').filter(line => line.trim().length > 0);
  
  console.log(`Found ${changedFiles.length} uncommitted file(s).`);
  
  if (changedFiles.length > 10) {
    console.log('More than 10 files changed. Automatically committing and pushing...');
    
    // Add all files
    execSync('git add .', { stdio: 'inherit' });
    
    // Commit
    const timestamp = new Date().toISOString();
    execSync(`git commit -m "Auto-commit: Threshold of 10 uncommitted files reached (${timestamp})"`, { stdio: 'inherit' });
    
    // Push
    execSync('git push', { stdio: 'inherit' });
    
    console.log('Successfully pushed to GitHub.');
  } else {
    console.log('Threshold not met (requires > 10 changed files). No action taken.');
  }
} catch (error) {
  console.error('Error during auto-push script execution:', error.message);
  process.exit(1);
}
