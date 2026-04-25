# Manake Futuristic AI Guide + Debugging Pass

## What was added

- Added `src/components/StakeholderAIButton.tsx`, a floating Manake AI Guide that explains the platform to:
  - youth
  - families
  - donors
  - partners
  - clinicians/referral professionals
  - staff/volunteers
  - technical administrators
- Added stakeholder cards, a chat-style Q&A interface, quick page links, and an API diagnostic action.
- Added futuristic glassmorphism/neon styling for the floating AI guide in `src/styles/globals.css`.

## Platform debugging improvements

### API health path

The frontend now checks API health using `API_HEALTH_CANDIDATES`, beginning with:

```text
/api/health
```

The Express router also exposes `/api/health`, so the same check works more consistently across:

- Netlify functions
- Railway Express server
- local Vite proxy setups

### API URL handling

`src/services/api.ts` now accepts more deployment-safe API values:

```text
VITE_API_URL=https://your-railway-service.up.railway.app/api
VITE_API_URL=https://your-railway-service.up.railway.app
VITE_RAILWAY_PUBLIC_DOMAIN=your-railway-service.up.railway.app
```

The client normalises these to a usable `/api` base path.

### OAuth callback hardening

`src/pages/SocialCallbackPage.tsx` now:

- safely parses stored OAuth state instead of throwing on malformed localStorage
- requires state to match before exchanging the code
- expires stale OAuth state after 10 minutes
- avoids double-processing callbacks in React StrictMode during development
- clears stale state on failure

## Deployment checklist

Netlify frontend:

```text
VITE_API_URL=https://your-railway-service.up.railway.app/api
```

Railway backend:

```text
FRONTEND_URL=https://manake.netlify.app
ALLOWED_ORIGINS=https://manake.netlify.app
DATABASE_URL=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

OAuth provider dashboards:

```text
https://manake.netlify.app/auth/google/callback
https://manake.netlify.app/auth/facebook/callback
```

## Suggested next technical upgrade

The current AI Guide is an on-site stakeholder explainer with deterministic responses. To connect it to a real AI backend later, add an authenticated endpoint such as:

```text
POST /api/v1/ai/stakeholder-guide
```

and pass a constrained system prompt with stakeholder-safe, privacy-aware responses.
