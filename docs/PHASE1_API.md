# Phase 1 API reference

Base URL in development: `http://localhost:4000/api/v1`.
All successful responses use `{ "data": ... }`. Errors use `{ "error": { "code", "message", "requestId" } }`.

## `GET /health/live`
Public liveness endpoint. Returns `200` when the Express process can respond.

## `GET /health/ready`
Public readiness endpoint. Returns `200` if MongoDB is connected and `503` otherwise. Does not return host, URI, credentials, or detailed infrastructure data.

## Authenticated routes
Send the active Clerk session token in `Authorization: Bearer <session-token>`. The server verifies the token via `@clerk/express`.

### `GET /me`
Returns `user`, `profile`, and `onboardingCompleted`. The internal user is resolved from the verified Clerk subject; the request body/query cannot select another user.

### `GET /profile`
Returns the authenticated user's profile or `null` when no profile has been created, plus onboarding completion state.

### `PUT /profile`
Accepts one or more whitelisted fields:
- `preferredName`: string, max 80 characters
- `location`: string, max 120 characters
- `targetInterest`: string, max 300 characters (free-form interest only; it does not set a canonical role)
- `constraints`: string, max 1000 characters
- `weeklyAvailabilityHours`: optional integer from 0 through 168
- `careerPreferences`: string, max 500 characters
- `profilePersonalizationConsent`: optional boolean; can be set to `false` to decline or withdraw future personalization preference
- `currentStatus`: one of `student`, `recent_graduate`, `employed`, `career_switcher`, `other`
- `highestEducation`: one of `high_school`, `diploma`, `bachelor`, `master`, `doctorate`, `other`, `prefer_not_to_say`
- `experienceLevel`: one of `none`, `under_1_year`, `1_to_3_years`, `3_to_5_years`, `5_plus_years`, `prefer_not_to_say`

The payload must not be empty. Unknown fields are rejected. This endpoint edits only the current user's record.

### `PUT /onboarding`
Requires `currentStatus`, `highestEducation`, and `experienceLevel`. `preferredName`, `location`, `targetInterest`, `constraints`, `weeklyAvailabilityHours`, and `careerPreferences` are optional. `profilePersonalizationConsent` is an optional boolean and defaults to `false`, so a person can complete onboarding without agreeing to future personalization. The preference can be updated through `PUT /profile`. On successful save, onboarding writes `onboardingCompletedAt` to the same profile document. The preference is not a substitute for a reviewed privacy notice or legal terms.

## Status codes
- `400`: invalid request data, unsupported field/value, or empty update.
- `401`: missing or invalid session.
- `403`: account disabled by server-side account state.
- `404`: unknown API endpoint.
- `429`: rate limit reached.
- `500`: unexpected server failure, with a generic client message and request ID.
- `503`: readiness endpoint reports a required dependency unavailable.
