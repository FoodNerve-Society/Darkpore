# Implementation Plan: Local-First Database Architecture

## Objective
Structure the app to be 100% database-ready while keeping all data and execution strictly local for now. We will build the architecture so that moving to a live production database (like Turso) later requires zero code changes.

## Architecture Decision (Local First)
- **Database:** Local SQLite (dev.db file stored directly in the project folder). No cloud services or external databases to configure.
- **ORM:** Prisma (for strict 1-to-1 TypeScript generation). 
- *Why:* Prisma allows you to use a local SQLite file today. When you are ready for production, you just change one line in your .env file to a Turso URL, and the entire app connects to the cloud instantly without rewriting any queries.

## Phase 1: Data Separation Strategy
1. **Static Data (Stays in Code lib/cms):**
   - Theme colors, UI copy, and homepage text.
   - Core bottleneck definitions (IDs, titles, hero descriptions).
2. **Dynamic Data (Moves to Local SQLite):**
   - Users & Authentication Profiles (Role, Nerve Points).
   - Society: Trade Floor listings (Swaps, Flash-sales).
   - Innovations: Bottleneck Updates, Learning Materials, Project Stats.

## Phase 2: Local Setup & Schema Creation
1. Install Prisma locally (
pm i -D prisma & 
px prisma init --datasource-provider sqlite).
2. Write schema.prisma defining Models (User, TradeListing, BottleneckUpdate, etc.).
3. Generate the Prisma Client to sync schemas with the frontend.
4. Write a one-off database seed script to push the current mock data from lib/db/society.ts and lib/cms/energy/bottlenecks.ts into your local dev.db file.

## Phase 3: The Innovations Tab Refactor
1. Refactor /innovations/page.tsx to fetch total counts (e.g., Active Solutions) via asynchronous Prisma queries rather than statically typing them.
2. Refactor pp/innovations/[bottleneck]/[section]/page.tsx to fetch BottleneckUpdate rows matching the current bottleneck ID.
3. Refactor pp/innovations/[bottleneck]/learn/page.tsx to fetch LearningMaterial rows.

## Phase 4: Society & Trade Floor Refactor
1. Refactor /society/trade to natively utilize Prisma queries for multi-property filtering (e.g., WHERE category = 'swap' AND location = 'Kano').
2. Link Trade Floor posts to User records.
3. Create Next.js Server Actions for users to dynamically create new Trade Floor listings and insert them into the local DB.

## Phase 5: Production Migration (Future)
1. Sign up for Turso / Object Storage.
2. Run database migration to cloud.
3. Update DATABASE_URL in .env.
