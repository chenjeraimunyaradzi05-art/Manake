import { getConnectionString } from '@netlify/database'

export type DatabaseStatus = {
  configured: boolean
  provider: 'railway' | 'netlify' | 'netlify-neon' | 'neon' | 'postgresql' | 'missing'
  source?: string
  message: string
}

const databaseUrlEnvKeys = [
  'DATABASE_URL',
  'RAILWAY_DATABASE_URL',
  'NETLIFY_DB_URL',
  'NETLIFY_DATABASE_URL',
  'NEON_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
] as const

function findDatabaseUrl() {
  for (const key of databaseUrlEnvKeys) {
    const value = process.env[key]

    if (value) {
      return { key, value }
    }
  }

  try {
    const value = getConnectionString()

    return value ? { key: 'NETLIFY_DATABASE_EXTENSION', value } : undefined
  } catch {
    return undefined
  }
}

function identifyProvider(databaseUrl: string, source: string): DatabaseStatus['provider'] {
  const normalizedUrl = databaseUrl.toLowerCase()

  if (source === 'RAILWAY_DATABASE_URL' || normalizedUrl.includes('railway.internal') || normalizedUrl.includes('railway.app')) {
    return 'railway'
  }

  if (normalizedUrl.includes('neon.tech')) {
    return source.startsWith('NETLIFY') ? 'netlify-neon' : 'neon'
  }

  if (source.startsWith('NETLIFY')) {
    return 'netlify'
  }

  return 'postgresql'
}

export function getDatabaseUrl() {
  return findDatabaseUrl()?.value
}

export function getDatabaseStatus(): DatabaseStatus {
  const databaseUrl = findDatabaseUrl()

  if (!databaseUrl) {
    return {
      configured: false,
      provider: 'missing',
      message:
        'No Postgres connection is available. Set DATABASE_URL for Railway/Neon/Postgres or enable Netlify Database for this site.',
    }
  }

  return {
    configured: true,
    provider: identifyProvider(databaseUrl.value, databaseUrl.key),
    source: databaseUrl.key,
    message: 'A Postgres connection is configured. Prisma can use this connection for the Manake data models.',
  }
}
