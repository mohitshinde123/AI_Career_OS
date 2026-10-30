# TalentBridge — Phase 1 Architecture

**Phase:** 1 of 12 — Landing Page, Authentication, Onboarding, Profile, Dashboard Foundation  
**Status:** Implementation package for owner review. A successful source check is not proof of live Clerk/MongoDB operation.

## Product boundary

The approved Blueprint v2 remains the complete product source of truth. Phase 1 builds only the five foundation areas listed above. Later phases remain in scope but do not receive fake data, placeholder APIs, or simulated functionality in this phase.

## Runtime

- **Client:** React + Vite, plain JavaScript/JSX, React Router, `@clerk/react`.
- **API:** Node.js + Express 5, JavaScript ES modules, `@clerk/express`, Zod validation, Helmet, restricted CORS, and request rate limiting.
- **Persistence:** MongoDB via Mongoose.
- **Identity:** Clerk owns signup, signin, credentials, and session. The API validates identity with Clerk middleware and reads the current Clerk subject from the verified session. TalentBridge does not implement passwords or JWT issuance.
- **Application shape:** modular monolith. Domain boundaries are represented by modules, model/service code, route registration, and validation schemas.

## Phase 1 collections

### `users`
- `clerkUserId`: required, unique, immutable external identity key.
- `accountStatus`: server-managed `active` or `disabled`.
- Mongoose timestamps and a record version.

### `career_profiles`
- `ownerUserId`: reference to internal `users._id`.
- `clerkUserId`: identity key used in the owner filter.
- `preferredName`, `currentStatus`, `highestEducation`, `experienceLevel`, `location`.
- `targetInterest`, `constraints`, `weeklyAvailabilityHours`, `careerPreferences`, and `profilePersonalizationConsent`.
- `onboardingCompletedAt`, timestamps and record version.
- Unique index on `ownerUserId`; unique index on `clerkUserId`.

The user profile and onboarding answers share one bounded profile document; this keeps profile updates and onboarding completion in one MongoDB document write. Personalization preference is optional and defaults to false. Later personalized modules must respect the saved preference; privacy/legal wording and enforcement design still require review before production. This is limited to Phase 1. Future career goals, skills/evidence, roadmap graph, project records, resume versions and other domains will have their own approved phase contracts.

## API contract

Base path: `/api/v1`. Success envelope is `{ data: ... }`. Error envelope is `{ error: { code, message, requestId, ... } }`.

| Method | Route | Purpose |
|---|---|---|
| GET | `/health/live` | Process liveness only |
| GET | `/health/ready` | Readiness with sanitized MongoDB connection state |
| GET | `/me` | Internal user summary, current profile and onboarding completion |
| GET | `/profile` | Current user's profile |
| PUT | `/profile` | Whitelisted profile-field update |
| PUT | `/onboarding` | Validated baseline onboarding save and completion timestamp |

The application doesn't offer an endpoint to create identity records for arbitrary user IDs. User records are created from the verified Clerk subject on an authenticated request. All profile queries include the resolved internal owner and the Clerk ID.

## UI routes

- `/`: public landing page and product vision.
- `/sign-in`, `/sign-up`: Clerk-hosted authentication UI components mounted in route-aware pages.
- `/onboarding`: first-use baseline profile form.
- `/profile`: editable saved baseline profile.
- `/dashboard`: truthful foundation view from `/api/v1/me`; no role-readiness score, job counts, roadmap progress, or other unbuilt-module metrics are fabricated.

A broad, self-reported `targetInterest` is collected in Phase 1 as onboarding context; choosing from the canonical industry/role marketplace remains in Phase 2. No canonical role ID is inferred from free text.

## Environment and operations

Copy `.env.example` to `.env`; configure `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `MONGODB_URI`, and `CLIENT_ORIGIN`. `VITE_API_BASE_URL` is the browser API origin. Real secrets must never be committed. Missing/invalid environment configuration prevents API startup. If MongoDB is unavailable, API liveness remains available while readiness returns `503`; data operations cannot silently fall back to a local/demo mode.

## Implementation notes and test boundaries

- Required baseline profile input is validated in the browser and all profile input is validated server-side with strict Zod schemas. The personalization preference is optional and can be changed in the profile.
- Unknown client-supplied fields are rejected.
- Authenticated routes map requests to the Clerk identity before reading or writing user data.
- Logs omit request bodies, tokens, profile contents, and database URLs.
- Included tests cover schema validation and response-field privacy. They do not replace live Clerk, MongoDB, browser, deployment, accessibility, or security testing.
