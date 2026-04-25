# Manake Platform Command Centre Enhancement Pass

## Added

- New `/platform-status` page with a futuristic operations-command-centre look.
- Reusable `PlatformDiagnosticPanel` component for live checks across Netlify, Railway, API health, CORS, OAuth callback URLs, JWT readiness, database readiness and browser storage.
- Frontend diagnostic service in `src/services/platformDiagnostics.ts`.
- Public backend diagnostics endpoint at `/api/diagnostics/public` that returns only safe booleans/counts and callback URL guidance. It does not expose secrets.
- AI Guide quick link to the Platform Status page and improved responses for broken deployment, login and diagnostic questions.
- Footer link to Platform Status so admins can find the diagnostics page without remembering the URL.

## Social sign-up hardening

- Replaced simple random OAuth state with an HMAC-signed state payload.
- OAuth state now includes provider, redirect URI, redirect origin, timestamp and nonce.
- OAuth callback now verifies state server-side before code exchange.
- OAuth callback route now uses strict rate limiting.
- OAuth callback validation now requires a state value.

## Deployment debugging guidance

Expected live values:

```txt
Netlify:
VITE_API_URL=https://<railway-service>.up.railway.app/api
```

```txt
Railway:
FRONTEND_URL=https://manake.netlify.app
ALLOWED_ORIGINS=https://manake.netlify.app
DATABASE_URL=<database connection string>
JWT_SECRET=<long random secret>
JWT_REFRESH_SECRET=<long random secret>
GOOGLE_CLIENT_ID=<google client id>
GOOGLE_CLIENT_SECRET=<google client secret>
FACEBOOK_APP_ID=<facebook app id>
FACEBOOK_APP_SECRET=<facebook app secret>
```

Provider callback URLs:

```txt
https://manake.netlify.app/auth/google/callback
https://manake.netlify.app/auth/facebook/callback
```

## Manual verification checklist

1. Deploy Railway backend.
2. Open `https://<railway-service>.up.railway.app/health`.
3. Open `https://<railway-service>.up.railway.app/api/diagnostics/public`.
4. Rebuild Netlify with `VITE_API_URL` set.
5. Open `https://manake.netlify.app/platform-status`.
6. Click **Rescan** and **Copy report**.
7. Attempt email/password registration.
8. Attempt Google sign-in.
9. Attempt Facebook sign-in.

## Validation status in this container

- A focused TypeScript parse check was attempted on the newly added/modified files using the globally installed TypeScript compiler.
- Because `node_modules` is not installed in the packaged project, the compiler reported expected missing dependency/type errors for React, Express, Axios, Node and other packages.
- No parser/syntax errors were detected in the focused check output.
- Full `npm install`, `npm run build` and full `tsc` were not completed in this container because dependency installation timed out.

Run locally or in CI:

```bash
cd manake-web
npm install --legacy-peer-deps
npm run build
npm audit --omit=dev
```
