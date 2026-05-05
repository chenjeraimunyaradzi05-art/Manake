# Netlify / Neon Database Setup

Manake is wired for Postgres through Prisma. The app now supports both:

- a plain Neon pooled connection string in `DATABASE_URL`
- Netlify Database at runtime through `@netlify/database`
- the legacy Netlify Neon variable name `NETLIFY_DB_URL` if that is what your site already exposes

The Prisma CLI still needs `DATABASE_URL` locally when you push or migrate the schema.

## 1. Choose the database path

Recommended for this project:

1. In Netlify, open the Manake site dashboard.
2. Go to **Database** and create a Netlify Database, or connect an existing Neon database.
3. Claim the Neon database if Netlify created it anonymously, so it remains available beyond the trial window.

Alternative direct Neon path:

1. Open the Neon Console.
2. Create a project.
3. Use the pooled connection string from **Connect**.

## 2. Add local environment variables

Create `manake-web/.env.local`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Do not commit `.env.local`.

## 3. Generate Prisma and create tables

From `manake-social-media-platform-uncompressed/manake-web`:

```bash
npm install
npm run db:generate
npm run db:push
```

Use `npm run db:migrate` later when formal Prisma migrations exist.

## 4. Add Netlify environment variables

In Netlify UI:

1. Go to **Project configuration > Environment variables**.
2. Add `DATABASE_URL`.
3. Paste the pooled Neon connection string.
4. Mark it as a secret value.
5. Trigger a new deploy.

CLI alternative:

```bash
netlify env:set DATABASE_URL "YOUR_NEON_CONNECTION_STRING"
```

## 5. Verify

Local:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/api/db/status
```

You should see `configured: true` and `connected: true`.

Production:

```text
https://manake.netlify.app/api/db/status
```

Then test:

1. Open `/auth/signup`.
2. Create a test account.
3. Open `/auth/login`.
4. Log in with the same email and password.

## Notes

- Netlify Database uses database branches for deploy previews, while production deploys use the main database.
- The site build now runs `prisma generate && next build`.
- Netlify is set to Node `20.19.6` because `@netlify/database` requires Node 20+.
- Keep recovery-related private information out of test records unless the database and access policies are production-ready.
