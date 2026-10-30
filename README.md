# TalentBridge — Phase 1 MERN source

This source package contains the Phase 1 foundation using React, JavaScript, Node.js, Express, MongoDB and Clerk.

## Phase 1 implementation update

This update applies the supplied Figma PDF reference to the Landing Page and member Dashboard desktop/mobile views. It also fixes Clerk + React Router nested sign-in/sign-up routes.

See `docs/PHASE1_FIGMA_IMPLEMENTATION_STATUS.md` for the exact scope, files changed, design-source limitations, and validation status.

Authentication, onboarding and profile visual layouts are not declared complete: the supplied Figma export has no dedicated authentication or profile frames and includes only Onboarding Step 2 of 4. Those screens are retained pending complete approved references and field contracts.

## Requirements

- Node.js 20.19 or newer (the project package requires it)
- npm
- A Clerk development application
- A MongoDB development database (local MongoDB or Atlas)

## Setup

1. Copy `.env.example` to `.env` in the project root.
2. Set the Clerk publishable key and secret key using your own development application.
3. Set `MONGODB_URI` to your own development database.
4. Keep the frontend origin and API URL consistent with the Vite host, for example:

```dotenv
CLIENT_ORIGIN=http://127.0.0.1:5173
VITE_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

5. Install dependencies and run the application from the project root:

```powershell
npm install
npm run dev
```

6. Run available checks:

```powershell
npm run check:server
npm test
npm run build
```

The package intentionally contains no `.env`, credentials, `node_modules`, or user data. Do not commit real secrets.

## Figma references

`design-references/` contains crops of the user-supplied `Startup_prototype (1).pdf` for visual review. These images are documentation references; the application does not use screen captures as page backgrounds.

## Current review gate

Only Phase 1 is in scope. Do not start Phase 2 until Phase 1's missing visual references are supplied, the frontend is built and run, real Clerk/MongoDB flows are tested, and the user approves the result.
