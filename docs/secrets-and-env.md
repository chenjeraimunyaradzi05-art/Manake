# Secrets and Environment Variables

## Web (manake-web)
Set in `.env` (local) and CI/hosting secrets:
- `VITE_API_URL` – API base
- `VITE_STRIPE_PUBLISHABLE_KEY` – Stripe publishable key
- `VITE_SENTRY_DSN` – Sentry DSN (optional; leave empty to disable)
- `VITE_GA_TRACKING_ID` – Google Analytics (optional)
- Backend secrets: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MONGODB_URI`, SMTP creds, OAuth (Google/Facebook/Apple), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Mobile (manake-mobile)
Set via Expo public env (app.config.ts / eas.json or CLI):
- `EXPO_PUBLIC_SENTRY_DSN` – Sentry DSN (optional; disables if empty)
- `EXPO_PUBLIC_API_URL` (if used), `EXPO_ACCESS_TOKEN` for push (optional)

## CI (GitHub Actions)
Add to repository secrets:
- `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_SENTRY_DSN`
- Any deploy tokens (Netlify: `NETLIFY_AUTH_TOKEN`, `NETLIFY_STAGING_SITE_ID`, `NETLIFY_PRODUCTION_SITE_ID`)

## Notes
- Never commit real secrets. Use separate values for staging vs production.
- Rotate keys regularly and remove unused secrets.
- For Apple private keys, store with `\n` line breaks in CI secrets.
