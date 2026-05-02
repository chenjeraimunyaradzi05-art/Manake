# Neon Database Setup

The web app is prepared for Neon through Prisma. The schema already uses PostgreSQL and reads the connection from `DATABASE_URL`.

1. Create a Neon project and database.
2. Copy the pooled connection string from Neon.
3. Add it locally in `.env.local`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
```

4. Add the same `DATABASE_URL` value in Netlify environment variables.
5. Generate Prisma client and push the schema when ready:

```bash
npm run db:generate
npm run db:push
```

The safe status endpoint is available at `/api/db/status`. It reports whether `DATABASE_URL` is configured without exposing the secret value.
