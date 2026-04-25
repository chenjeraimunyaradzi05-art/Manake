# Futuristic Platform Enhancement Pass

## What changed

- Added a modern aurora / holographic interface layer while preserving the rehabilitation centre's warm, trustworthy brand.
- Introduced `future-page`, `future-nav`, `future-hero`, `holo-card`, `signal-pill`, and related CSS utilities.
- Updated the home hero with a futuristic image mosaic using the generated Manake photos with blue uniforms.
- Replaced remaining non-founder placeholder imagery with generated Manake images.
- Improved login, signup, and social auth error messages so Netlify/Railway deployment issues are visible to users and developers.
- Added frontend support for either `VITE_API_URL` or `VITE_RAILWAY_PUBLIC_DOMAIN`.
- Added safer health endpoint diagnostics that disclose only non-secret booleans for OAuth/API readiness.

## Required production configuration

### Netlify

Set one of these variables before building:

```env
VITE_API_URL=https://<your-railway-service>.up.railway.app/api
```

or

```env
VITE_RAILWAY_PUBLIC_DOMAIN=<your-railway-service>.up.railway.app
```

Then trigger a fresh Netlify deploy. Vite bakes `VITE_*` variables into the static bundle at build time.

### Railway

Set these server variables:

```env
NODE_ENV=production
DATABASE_URL=<Railway PostgreSQL URL>
JWT_SECRET=<64-char random value>
JWT_REFRESH_SECRET=<another 64-char random value>
FRONTEND_URL=https://manake.netlify.app
ALLOWED_ORIGINS=https://manake.netlify.app,https://manake.org.zw,https://www.manake.org.zw
GOOGLE_CLIENT_ID=<client id>
GOOGLE_CLIENT_SECRET=<client secret>
FACEBOOK_APP_ID=<app id>
FACEBOOK_APP_SECRET=<app secret>
```

### OAuth provider dashboards

Add exact callback URLs:

```text
https://manake.netlify.app/auth/google/callback
https://manake.netlify.app/auth/facebook/callback
```

## Debug sequence

1. Open `https://<railway-service>.up.railway.app/health`.
2. Confirm `status` is `ok`, `dbReady` is eventually true, and OAuth booleans match the providers you configured.
3. Open the browser console on Netlify and check the printed API base if login fails.
4. If a 403 appears, add the Netlify origin to Railway `ALLOWED_ORIGINS` and redeploy Railway.
5. If the browser receives HTML instead of JSON, Netlify is still routing `/api` internally or `VITE_API_URL` was not present at build time.
