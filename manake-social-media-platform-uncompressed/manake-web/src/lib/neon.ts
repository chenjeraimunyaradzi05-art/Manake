export type DatabaseStatus = {
  configured: boolean
  provider: 'netlify-neon' | 'neon' | 'postgresql' | 'missing'
  message: string
}

export function getDatabaseStatus(): DatabaseStatus {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.NETLIFY_DB_URL

  if (!databaseUrl) {
    return {
      configured: false,
      provider: 'missing',
      message: 'DATABASE_URL is not set. Add the Netlify database connection before enabling database writes.',
    }
  }

  if (process.env.NETLIFY_DB_URL && databaseUrl === process.env.NETLIFY_DB_URL) {
    return {
      configured: true,
      provider: 'netlify-neon',
      message: 'Netlify Database is configured. Prisma can use the DATABASE_URL alias for the Manake data models.',
    }
  }

  return {
    configured: true,
    provider: databaseUrl.includes('neon.tech') ? 'neon' : 'postgresql',
    message: 'DATABASE_URL is configured. Prisma can use this connection for the Manake data models.',
  }
}
