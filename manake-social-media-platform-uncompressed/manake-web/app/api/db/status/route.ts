import { getDatabaseStatus } from '../../../../src/lib/neon'

export const dynamic = 'force-dynamic'

export function GET() {
  const status = getDatabaseStatus()

  return Response.json({
    ...status,
    nextSteps: status.configured
      ? ['Run npm run db:generate', 'Run npm run db:push or npm run db:migrate']
      : ['Create a Neon Postgres project', 'Set DATABASE_URL in .env.local and Netlify environment variables'],
  })
}
