import { getConnectionString } from '@netlify/database'

export type DatabaseStatus = {
  configured: boolean
  provider: 'netlify' | 'netlify-neon' | 'neon' | 'postgresql' | 'missing'
  message: string
}

const databaseUrlEnvKeys = [
  'DATABASE_URL',
  'NETLIFY_DB_URL',
  'NETLIFY_DATABASE_URL',
  'NEON_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
] as const

export function getDatabaseUrl() {
  const explicitDatabaseUrl = databaseUrlEnvKeys
    .map((key) => process.env[key])
    .find((value): value is string => Boolean(value))

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
    provider: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL
      ? databaseUrl.includes('neon.tech')
        ? 'neon'
        : 'postgresql'
      : process.env.NETLIFY_DB_URL || process.env.NETLIFY_DATABASE_URL || process.env.NEON_DATABASE_URL
        ? 'netlify-neon'
        : 'netlify',
    message: 'A Postgres connection is configured. Prisma can use this connection for the Manake data models.',
  }
}
