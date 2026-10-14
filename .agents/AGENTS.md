# Agent Behavioral Rules

## Strict Prohibition on Git Checkout
**CRITICAL RULE:** If an implementation is cut off, interrupted, or corrupts a file, **DO NOT run `git checkout` or `git reset`** to revert the changes.
Running `git checkout` can silently discard the user's uncommitted work across multiple files, causing severe data loss and frustration.
Instead, simply inform the user about the cutoff or corruption and ask them to manually fix or revert it.

## Do Not Build Automatically
**CRITICAL RULE:** Stop running `npm run build` on every prompt or after every code change. Only run it if specifically requested by the user, or if doing a final verification of a very complex change that specifically necessitates a build check, but not as a regular occurrence during UI iteration.

## Visual Design Constraint: Prohibition on Side-Borders
**CRITICAL RULE:** Never use the side-border design (e.g. `borderLeft: '4px solid ...'`, `borderLeft: '5px solid ...'`) ever again. Instead, always use glassy aesthetics with uniform, slightly thick white or translucent border lines wrapped completely all the way round (e.g. `border: '1.5px solid rgba(255, 255, 255, ...)'` or matching theme glass), smooth backdrop-filter blur, and subtle ambient shadows.

## Strict Workflow Integrity: Respect Multi-Phase User Decision Gates
**CRITICAL RULE:** In multi-step or multi-phase creation workflows (e.g., Livestream Creation: Step 1 Ideation & Carousel Blueprint Selection -> Step 2 Load Framework Preview & AI Drafting Assistant -> Studio Rundown Builder), ingesting or loading AI payloads must NEVER prematurely skip or bypass intermediate user decision points.
- **Phase 1 Ideation Ingestion (LS-Doc 1c):** Must populate the Step 1 carousel cards and smoothly position the user at the carousel. It must NEVER auto-select a blueprint card or auto-apply slides directly into Step 2/Rundown Studio without explicit user review and card selection.
- **Blueprint Selection Gate:** Selecting a card transitions the user to the Step 2 Load Framework page (`step === 2 && !frameworkLoaded`), displaying the sequenced DEF blocks and offering the deliberate choice between "Start (~1 min)" with the Phase 2 AI Assistant or "Ignore" to use blank templates. It must NEVER silently jump directly to the editor.
- **Phase 2 Slide Ingestion (LS-Doc 4):** Ingesting the compiled slide payload hydrates `rundownBlocks` and transitions to `frameworkLoaded = true`, safely advancing the user into the editable studio canvas only after the user has reviewed and triggered the ingest action.

