# Agent Behavioral Rules

## Strict Prohibition on Git Checkout
**CRITICAL RULE:** If an implementation is cut off, interrupted, or corrupts a file, **DO NOT run `git checkout` or `git reset`** to revert the changes.
Running `git checkout` can silently discard the user's uncommitted work across multiple files, causing severe data loss and frustration.
Instead, simply inform the user about the cutoff or corruption and ask them to manually fix or revert it.

## Do Not Build Automatically
**CRITICAL RULE:** Stop running `npm run build` on every prompt or after every code change. Only run it if specifically requested by the user, or if doing a final verification of a very complex change that specifically necessitates a build check, but not as a regular occurrence during UI iteration.
