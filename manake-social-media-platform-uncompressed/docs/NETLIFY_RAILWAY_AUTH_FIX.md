# Netlify + Railway auth fix notes

## What was wrong

The web client was defaulting to `/api`. On Netlify, that means requests are handled by Netlify Functions. If the live backend is Railway, sign up and social login will fail unless `VITE_API_URL` points to the Railway backend.

The Railway Express server also did not explicitly include `https://manake.netlify.app` in its production CORS/CSRF origin allowlist unless `FRONTEND_URL` happened to be configured correctly. That can block `/api/v1/auth/register`, `/api/v1/auth/login`, and OAuth callback exchange calls from the Netlify frontend.

OAuth redirect URIs are exact-match. Google/Facebook must be configured with the exact callback URLs used by the frontend.

## Required Netlify environment variables

Set these in Netlify > Site configuration > Environment variables:

```bash
VITE_API_URL=https://<your-railway-service>.up.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=<your-publishable-key-if-used>
VITE_SENTRY_DSN=<optional>
```

Do not put `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_SECRET`, `STRIPE_SECRET_KEY`, or `DATABASE_URL` into a frontend-only Netlify build unless you are intentionally using Netlify Functions as the backend.

## Required Railway environment variables

Set these in Railway > Service > Variables:

```bash
NODE_ENV=production
DATABASE_URL=<Railway Postgres URL>
JWT_SECRET=<64-char-random-secret>
JWT_REFRESH_SECRET=<another-64-char-random-secret>
FRONTEND_URL=https://manake.netlify.app
ALLOWED_ORIGINS=https://manake.netlify.app,https://manake.org.zw,https://www.manake.org.zw
GOOGLE_CLIENT_ID=<google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<google-client-secret>
FACEBOOK_APP_ID=<facebook-app-id>
FACEBOOK_APP_SECRET=<facebook-app-secret>
```

## OAuth provider redirect URIs

Add these exact URLs in the provider dashboards:

```text
https://manake.netlify.app/auth/google/callback
https://manake.netlify.app/auth/facebook/callback
```

For local development, also add:

```text
http://localhost:5173/auth/google/callback
http://localhost:5173/auth/facebook/callback
```

The scheme, host, path, case, and trailing slash must match exactly.

## Verification checklist

1. Open the frontend and confirm `VITE_API_URL` in the built bundle points to Railway, not `/api`, if Railway is the backend.
2. Visit `https://<your-railway-service>.up.railway.app/health` and confirm it returns JSON.
3. In the browser Network tab, sign up should POST to `https://<railway>/api/v1/auth/register` and receive `201`.
4. Google/Facebook buttons should first call `GET https://<railway>/api/v1/social/<provider>/authorize?...`.
5. After provider redirect, the frontend should call `GET https://<railway>/api/v1/social/<provider>/callback?...`.
