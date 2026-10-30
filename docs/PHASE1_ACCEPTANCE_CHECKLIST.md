# Phase 1 acceptance checklist

Run through this checklist before requesting Phase 2 approval.

## Public landing and authentication
- [ ] Landing page renders at `/` at the supplied desktop reference size. No mobile Landing frame was supplied; do not invent its responsive design.
- [ ] Sign-in and sign-up buttons navigate to Clerk components using nested Clerk path routes. (Functional verification still required.)
- [ ] Creating an account/signing in works with the configured Clerk development instance.
- [ ] Sign-out through Clerk invalidates the visible signed-in session.
- [ ] Authenticated pages redirect signed-out users to `/sign-in`.
- [ ] Missing Clerk configuration shows setup instructions; no demo account appears.

## Onboarding and profile
- [ ] Obtain and approve Authentication and Profile visual references before changing their UI.
- [ ] Obtain all four Onboarding step references; the current PDF only supplies Step 2 of 4.
- [ ] Approve a persistence contract for the Step 2 goal, target role, timeline, and work preferences before wiring those fields to the API.
- [ ] A new authenticated account is mapped to exactly one internal user record.
- [ ] Required baseline fields are validated on the server.
- [ ] Onboarding persists after refresh and after signing out/in.
- [ ] Editing profile fields persists after refresh.
- [ ] Personalization preference defaults to off, can be declined during onboarding, and can be changed in the profile.
- [ ] Invalid enum values and extra fields are rejected.
- [ ] Two different Clerk users cannot read or change one another's profile.
- [ ] A completed onboarding flow routes to the dashboard; an incomplete one routes to onboarding.

## Dashboard foundation
- [ ] Compare Dashboard desktop and mobile screenshots against the supplied Figma export at matching viewport sizes.
- [ ] Confirm the mobile layout transition point with Figma; the current 450px media threshold is an implementation switch, not a source token.
- [ ] Dashboard fields come from `/api/v1/me` and saved profile data only.
- [ ] No hardcoded demo metrics, job samples, assumed career goal, or invented readiness score are present.
- [ ] Missing profile/API data is clearly reported rather than silently replaced with fake data.
- [ ] The landing page describes later modules as the platform vision without claiming those modules are already operational.

## API and data
- [ ] `GET /health/live` returns process liveness.
- [ ] `GET /health/ready` returns ready only when MongoDB is connected.
- [ ] Requests without a verified Clerk session receive `401` for protected routes.
- [ ] Input validation, safe errors, request IDs, and CORS restrictions are exercised.
- [ ] Unique identity/profile indexes are present in the configured database.

## Required verification not completed by source generation alone
- [ ] `npm install` succeeds from the user's network.
- [ ] `npm test`, `npm run check`, and `npm run build` pass locally.
- [ ] Live Clerk signup/signin and MongoDB persistence tests pass.
- [ ] Manual two-account isolation checks pass.
- [ ] Keyboard, screen reader basics, contrast, responsive layout, and browser console are reviewed.
- [ ] Deployment, TLS, production Clerk instance, MongoDB network policy, backup/restore, monitoring, and privacy review are completed before launch.
