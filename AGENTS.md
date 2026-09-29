<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Guardrails & Operational Constraints
- **DO NOT commit to GitHub automatically.** The user will review and push code themselves, or explicitly ask you to push. Stop running `git push` after every step.
- **DO NOT run `npm run build` after every request.** Next.js Turbopack `npm run dev` handles HMR efficiently. Only build if explicitly requested or strictly required to debug fatal compilation issues.
- **NEVER use the side-border design ever again.** Do NOT use `borderLeft: '4px solid ...'` or colored strips along one edge. Instead, use glassy styling with uniform, slightly thick white or translucent border lines all the way round (e.g. `border: '1.5px solid rgba(255, 255, 255, 0.15)'` or glassy theme border), backdrop-filter blur, and clean ambient shadows.
