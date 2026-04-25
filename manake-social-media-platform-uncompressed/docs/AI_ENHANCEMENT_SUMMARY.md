# Manake web enhancement summary

This update refreshes the Manake web platform with a calmer rehabilitation-centre visual system, generated brand-aligned photography, stronger security defaults, and deployment fixes for Netlify + Railway authentication.

## Visual and content updates

- Added 24 generated Manake-aligned images in `manake-web/public/images/manake/generated/`.
- Replaced stock/remote website imagery with local Manake images, except for the existing real Manake/founder-labelled photography that was already present in the project.
- Replaced product/community placeholder imagery with generated recovery, counselling, outreach, vocational training, staff, and wellness scenes.
- Standardised staff uniforms in the generated images to blue Manake-style polos.
- Removed client-side references to Unsplash/transparent texture URLs so the deployed website no longer depends on those external image hosts.

## CSS and theme updates

- Updated `manake-web/tailwind.config.js` with a warmer healthcare/recovery palette:
  - deep green for trust and care,
  - blue for Manake uniforms and institutional credibility,
  - gold for hopeful calls to action,
  - cream/soft white for a calmer non-clinical background.
- Updated `manake-web/src/styles/globals.css` and `manake-web/src/styles/variables.css` with improved typography, buttons, cards, inputs, focus states, gradients, and accessibility-minded contrast.
- Kept the recommended Poppins/Inter font pairing through the Tailwind theme.

## Netlify + Railway + sign-up/social-auth fixes

- Centralised allowed-origin handling in `manake-web/src/server/config/origins.ts`.
- Added default production allowlist entries for:
  - `https://manake.netlify.app`
  - `https://manake.org.zw`
  - `https://www.manake.org.zw`
- Added support for `FRONTEND_URL`, `ALLOWED_ORIGINS`, `CORS_ORIGINS`, Netlify deploy URLs, and Railway public domains.
- Updated the frontend API client so `VITE_API_URL` can point directly to a Railway backend and automatically normalises the `/api` path.
- Updated Socket.IO to use the same API origin as the REST client.
- Added clearer production social-login error messages when the API cannot be reached.
- Added `docs/NETLIFY_RAILWAY_AUTH_FIX.md` with the required Netlify, Railway, and OAuth configuration checklist.

## Security hardening

- Added explicit Netlify security headers in both root and web `netlify.toml` files.
- Added `app.set("trust proxy", 1)` for deployment behind Netlify/Railway proxies.
- Kept strict API security headers, but disabled API-only CSP on the Railway Express server when it serves the React SPA to avoid blocking app bundles, fonts, Stripe, and OAuth redirects.
- Added CSRF-style origin checks for state-changing API requests using the central allowed-origin list.
- Restricted OAuth redirect URI origins to configured frontend origins.
- Replaced the previous SHA-256 generated password hash for social-account users with bcryptjs hashing.
- Upgraded build/test tooling to reduce active audit findings: `vite` to 8.0.10, `@vitejs/plugin-react` to 6.0.1, `rollup` to 4.60.2, `vitest`/`@vitest/coverage-v8` to 4.1.5, and `@types/nodemailer` to 8.0.0.

## Verification performed

From `manake-web/`:

```bash
npx tsc --noEmit --pretty false --skipLibCheck
npx vite build
```

Both passed in this environment. `npm audit --omit=dev` reported zero production dependency vulnerabilities after the changes. A full dev audit still reports five transitive dev-tooling findings under ESLint/Tailwind/TypeScript tooling (`ajv`, `brace-expansion`, `flatted`, `minimatch`, and `picomatch`), but they are not production runtime dependencies. The full `npm run build` command also runs `prisma generate`; that step may require network access to Prisma binaries in a fresh environment.

## Deployment checklist

### Netlify frontend

Set:

```env
VITE_API_URL=https://<your-railway-service>.up.railway.app/api
```

Then redeploy the Netlify site so Vite bakes the value into the production bundle.

### Railway backend

Set:

```env
NODE_ENV=production
FRONTEND_URL=https://manake.netlify.app
ALLOWED_ORIGINS=https://manake.netlify.app,https://manake.org.zw,https://www.manake.org.zw
SOCIAL_REDIRECT_URI=https://manake.netlify.app/auth/google/callback
```

Also configure database/JWT/provider secrets as required by the existing app.

### OAuth providers

Add the exact callback URLs used by the app, for example:

```text
https://manake.netlify.app/auth/google/callback
https://manake.netlify.app/auth/facebook/callback
```

If a custom domain is used, add the same callback paths for that custom domain too.
