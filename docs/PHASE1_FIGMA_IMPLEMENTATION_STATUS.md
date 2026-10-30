# TalentBridge Phase 1 — Figma implementation status

Date: 30 October 2026

## Scope

This update implements only the Phase 1 screens for which the uploaded `Startup_prototype (1).pdf` contains a usable visual reference:

- Landing Page (`3:70160`)
- Dashboard desktop (`3:70548`)
- Dashboard mobile variant visible in the exported canvas

It also applies the Figma brand mark extracted from the user-supplied PDF export and aligns the member workspace shell to the supplied Dashboard screen.

## Implemented

### Landing Page

The page follows the visible sequence in the supplied export:

1. Public navigation bar
2. Hero copy, calls to action, social proof and floating career-workspace preview
3. Company-name trust strip
4. Four value cards
5. Career-roadmap preview and career-intelligence explanation
6. Three product capability cards
7. Employer-focused section
8. Outcomes and testimonial section
9. Pricing cards
10. FAQ
11. Final CTA
12. Footer

The design copy and sample names/numbers shown in this section are reproduced from the approved Figma export. They are presentation copy only; they are not inserted into MongoDB or represented as actual user records. Business claims, customer counts, testimonials, plan prices and logos must be substantiated/approved by the product owner before public production launch.

### Dashboard

- Dark member sidebar and active Overview state
- Workspace top bar, search presentation, notifications position and Clerk user control
- Date/greeting header
- Career pulse panel
- Resume and opportunity metric cards
- Career momentum panel
- Growth plan and upcoming panel
- Next best steps panel
- Opportunities section
- Mobile header and bottom navigation
- Mobile card order aligned to the supplied mobile screenshot

Dashboard metrics and content are not fabricated. Where the Phase 1 backend has no source data yet, values are displayed as unavailable and sections use empty-state copy. The sample Alex Chen metrics, chart values, future interview and job cards visible in the Figma artwork are not written as user, application, interview, or analytics data.

### Routing/auth support

- Clerk sign-in and sign-up routes use splat patterns (`/sign-in/*`, `/sign-up/*`) for Clerk's nested verification routes.
- `BrowserRouter` wraps the app and Clerk provider; Clerk navigation delegates to React Router through `routerPush` and `routerReplace`.
- Onboarding is routed as a standalone protected page, not nested inside the member dashboard shell, because the supplied onboarding frame is a separate split-panel composition.

## Not visually implemented in this update

These Phase 1 areas remain blocked by missing visual references, not omitted from the product vision:

- Authentication: no dedicated sign-in/sign-up Figma frame was present in the supplied export. Existing auth presentation is retained.
- Onboarding: only Step 2 of 4 is visible in the supplied export. Steps 1, 3 and 4 are not present. The existing onboarding implementation is retained rather than inventing missing screens or step behavior.
- Profile: no dedicated Profile Figma frame was present. Existing profile presentation is retained.

The visible Step 2 form includes main goal, target role, timeline and work-mode choices. The existing Phase 1 profile API schema does not currently define separate persistence fields for those values. This update does not silently map them into unrelated fields or alter the database contract. A product decision / complete data contract and all four onboarding references are required before implementing that flow.

## Visual-source limitations

The live Figma MCP connection is currently rate-limited on the Starter plan. The implementation therefore uses the uploaded one-page PDF canvas export and its screen crops, not node-level Figma design context or editable layer properties.

The PDF supports visible composition, copy, screen ordering, broad dimensions, and pixel-sampled colours. It does not reliably expose:

- Official font family and text-style tokens
- Figma variables and component variants
- Auto Layout constraints and component property definitions
- Original vector/icon/image asset files
- Exact responsive breakpoints
- Complete responsive variants for Landing, Onboarding, Profile, or Authentication

Font-family and responsive transition values are not claimed to be Figma-verified. The supplied Dashboard mobile reference is applied at a 450px CSS viewport threshold as an implementation switch; the Figma source does not state that breakpoint.

## Files changed

- `apps/client/src/app/App.jsx`
- `apps/client/src/main.jsx`
- `apps/client/src/pages/LandingPage.jsx`
- `apps/client/src/layouts/PublicLayout.jsx`
- `apps/client/src/layouts/WorkspaceLayout.jsx`
- `apps/client/src/features/dashboard/DashboardPage.jsx`
- `apps/client/src/features/auth/AuthPage.jsx` (brand mark only)
- `apps/client/src/styles/global.css`
- `apps/client/public/assets/talentbridge-mark.png`

The supplied screen crops are stored under `design-references/` for review. They are reference files, not runtime UI backgrounds.

## Validation status

Passed source-level checks:

- Node syntax checks for all server/shared JavaScript modules and the Vite config
- JSON parsing for all package manifests
- Relative client import resolution
- CSS opening/closing brace balance

Not run / not verified in this environment:

- React JSX parser/build (dependency install timed out)
- Vite production build
- Automated server/client test suite
- Browser visual screenshot comparison at matching viewport dimensions
- Live Clerk sign-in and MongoDB end-to-end flow

No Phase 2 work has started. Phase 1 remains open until the missing Figma references are supplied and the app is run and reviewed locally.
