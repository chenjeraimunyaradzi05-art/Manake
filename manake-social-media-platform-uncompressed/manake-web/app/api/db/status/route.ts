import { getDatabaseStatus } from '../../../../src/lib/neon'
import { prisma } from '../../../../src/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const status = getDatabaseStatus()

  if (!status.configured) {
    return Response.json({
      ...status,
      connected: false,
      nextSteps: [
        'Create or connect a Netlify Database / Neon Postgres database',
        'Set DATABASE_URL locally and in Netlify, or enable Netlify Database for the site',
      ],
    })
  }

  try {
    await prisma.$queryRaw`SELECT 1`

    return Response.json({
      ...status,
      connected: true,
      nextSteps: ['Run npm run db:generate', 'Run npm run db:push for first setup or npm run db:migrate for migrations'],
    })
  } catch (error) {
    return Response.json({
      ...status,
      connected: false,
      error: error instanceof Error ? error.message : 'Unable to connect to the database.',
      nextSteps: [
        'Verify the Neon connection string in DATABASE_URL or the Netlify Database connection',
        'Check Netlify environment variables and Prisma schema configuration',
      ],
    })
  }
}
