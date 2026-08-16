# Black Politics Now

Black Politics Now is a political intelligence platform that connects election coverage, a daily intelligence briefing, global elections, Black Representation records, and Voting Rights Act-era historical context.

The public application is deployed at [blkpolnow-nztxnshf.manus.space](https://blkpolnow-nztxnshf.manus.space). The news navigation directs readers to [blkpoliticsnow.com](https://blkpoliticsnow.com).

## Product areas

The application includes a U.S. Election Center with Senate, House, Governor, and Black Representation views; a Daily Intelligence Brief archive; a World Elections calendar; the Historical Atlas; a source-grounded Research Desk; and a role-protected administrative dashboard. The Admin dashboard supports review-first operational workflows for election monitoring, Daily Brief diagnostics, world-election refreshes, agent proposals, and portrait review.

## Technology

The stack uses React 19, TypeScript, Tailwind CSS 4, Express 4, tRPC 11, Drizzle ORM, and MySQL/TiDB. Public routes are client-rendered with Wouter. The database and application secrets are supplied by the deployment environment and must not be committed to source control.

## Local development

Install dependencies with `pnpm install`, then start the application with `pnpm run dev`. Run the type checker with `pnpm run check`, the regression suite with `pnpm test`, and a production build with `pnpm run build`.

The application requires deployment-provided environment values for its database, authentication, storage, and platform integrations. Do not add `.env` files, production credentials, generated build output, or locally generated audit data to GitHub.

## Verification and data stewardship

The project contains regression coverage for Atlas source and playback integrity, election result safeguards, image-tooltip positioning, portrait workflow boundaries, and protected administrative procedures. The final August 16, 2026 verification report is retained under `reports/`; raw candidate-image audit output is intentionally ignored because it is a transient operational artifact.

Candidate portraits require source-backed identity and provenance review. The platform must not claim full portrait coverage until every public candidate record has an appropriate reviewed image.

## Repository policy

This repository is intended to remain private. Contributions should preserve the platform’s review-first model: automated systems may discover, prepare, and propose changes, but they do not publish election results, editorial material, or candidate portraits without an authorized human decision.
