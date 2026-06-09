# Society OS Agent Rules

This file contains critical instructions and ground rules for all autonomous agents and subagents working on the Society OS repository.

## Rule 1: Explicit Permission for Deletion
**CRITICAL:** Agents MUST NOT delete any key files, folders, or major structural components without asking for and receiving explicit permission from the user first. 
Always err on the side of backing up code (e.g., renaming to `_backup`) rather than executing permanent `rm -rf` operations unless explicitly authorized.

## Rule 2: Architecture Integrity
The codebase uses a Single Folder Dynamic Route approach (`app/modular-society/[tenant]`). 
- Do NOT create duplicate routing folders for `.com` vs `.org`.
- Manage domain-specific features conditionally using the `tenant` variable.
- All routing to the main ecosystem happens via `proxy.ts`. Always check `proxy.ts` to ensure we get the routing links correctly, as it handles URL rewrites and prefixing.

## Rule 3: TypeScript Validation
- Agents must run `npx tsc --noEmit` or `npx tsc` to validate their code changes after each prompt to catch regressions or reference errors.
- Do NOT run `npm run build` as it is too slow. Use `npx tsc` instead.
