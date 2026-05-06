import { getDatabaseStatus } from '../../../../src/lib/neon'
import { prisma } from '../../../../src/lib/prisma'

export const dynamic = 'force-dynamic'

function getHealthyNextSteps(provider: string) {
  if (provider === 'railway') {
    return ['Run npm run db:migrate during Railway deploys', 'Confirm Railway and the app service share the same environment']
  }

  if (provider === 'netlify' || provider === 'netlify-neon') {
    return ['Netlify Database migrations should run during production deploys', 'Confirm the Neon/Netlify database branch is attached to this site']
  }

  return ['Run npm run db:migrate for production migrations', 'Run npm run db:generate after Prisma schema changes']
}

export async function GET() {
  const status = getDatabaseStatus()

  if (!status.configured) {
    return Response.json({
      ...status,
      connected: false,
      nextSteps: [
        'Set DATABASE_URL to a Railway, Neon, or Postgres connection string',
        'If using Netlify Database, confirm the database extension is enabled for the deployed site',
      ],
    })
  }

  try {
    await prisma.$queryRaw`SELECT 1`

    return Response.json({
      ...status,
      connected: true,
      nextSteps: getHealthyNextSteps(status.provider),
    })
  } catch (error) {
    return Response.json({
      ...status,
      connected: false,
      error: error instanceof Error ? error.message : 'Unable to connect to the database.',
      nextSteps: [
        'Verify DATABASE_URL points to the database reachable from this hosting platform',
        'For Railway, use the database variable injected into the same service/environment as the app',
        'For Netlify, confirm the production deploy has the database extension or DATABASE_URL variable attached',
      ],
    })
  }
}
