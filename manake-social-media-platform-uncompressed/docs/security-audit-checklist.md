# Security Audit Checklist (Launch Readiness)

## Authentication & Authorization
- Validate JWT issuance/refresh flows; ensure refresh rotation and blacklist on logout.
- Enforce authorization on every protected route (backend controllers) including admin routes.
- Verify rate limiting on auth endpoints (login, forgot/reset password, social auth exchange).
- Confirm password policies and secure reset tokens (single-use, short TTL, hashed at rest).

## Input & Data Protection
- Test for NoSQL/SQL injection on all query parameters and body inputs.
- Sanitize/validate file uploads (type/size) and ensure AV scan if available.
- Ensure secrets are not logged; review server logs for sensitive data.
- Confirm CORS is restricted to allowed origins.

## Transport & Storage
- Enforce HTTPS everywhere; HSTS on production domains.
- Verify secure cookies flags (HttpOnly, Secure, SameSite) where applicable.
- Ensure encryption at rest for DB/Blob storage; restrict public buckets.

## Third-Party & Keys
- Rotate and scope API keys; separate staging vs production secrets.
- Verify Stripe webhook secret usage and signature validation.
- Confirm social auth client IDs/secrets match allowed redirect URIs.
- Check Sentry DSN and sampling; ensure PII scrubbing.

## Access & Monitoring
- Enable MFA on all cloud/CI/CD accounts.
- Restrict admin access; audit roles and invitations.
- Set up alerting for auth failures, 5xx spikes, and anomalous traffic.

## Dependency & Build Pipeline
- Run `npm audit --audit-level=high` for web/mobile; triage findings.
- Verify CI builds with locked dependency versions; review supply-chain warnings.
- Confirm build artifacts do not include `.env` or secrets.

## Launch Gates
- All tests (unit, integration, E2E) green; coverage ≥ target.
- Lighthouse ≥ 90; fix a11y/perf/SEO issues.
- Backups and rollback plan documented.
