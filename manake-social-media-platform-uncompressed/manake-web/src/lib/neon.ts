import { getConnectionString } from '@netlify/database'

export type DatabaseStatus = {
  configured: boolean
  provider: 'netlify' | 'netlify-neon' | 'neon' | 'postgresql' | 'missing'
  message: string
}

export function getDatabaseUrl() {
  const explicitDatabaseUrl = process.env.DATABASE_URL ?? process.env.NETLIFY_DB_URL

  if (explicitDatabaseUrl) {
    return explicitDatabaseUrl
  }

  try {
    return getConnectionString()
  } catch {
    return undefined
  }
}

export function getDatabaseStatus(): DatabaseStatus {
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl) {
    return {
      configured: false,
      provider: 'missing',
      message:
        'No database connection is available. Add a Neon DATABASE_URL or enable Netlify Database for this site.',
    }
  }

  return {
    configured: true,
    provider: process.env.DATABASE_URL
      ? databaseUrl.includes('neon.tech')
        ? 'neon'
        : 'postgresql'
      : process.env.NETLIFY_DB_URL
        ? 'netlify-neon'
        : 'netlify',
    message: 'A Postgres connection is configured. Prisma can use this connection for the Manake data models.',
  }
}
