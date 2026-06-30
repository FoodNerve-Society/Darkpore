# Agent Behavioral Rules

## Strict Prohibition on Git Checkout
**CRITICAL RULE:** If an implementation is cut off, interrupted, or corrupts a file, **DO NOT run `git checkout` or `git reset`** to revert the changes.
Running `git checkout` can silently discard the user's uncommitted work across multiple files, causing severe data loss and frustration.
Instead, simply inform the user about the cutoff or corruption and ask them to manually fix or revert it.
