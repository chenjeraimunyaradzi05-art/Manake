export type DatabaseStatus = {
  configured: boolean
  provider: 'neon' | 'postgresql' | 'missing'
  message: string
}

export function getDatabaseStatus(): DatabaseStatus {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    return {
      configured: false,
      provider: 'missing',
      message: 'DATABASE_URL is not set. Add the Neon pooled connection string before enabling database writes.',
    }
  }

  return {
    configured: true,
    provider: databaseUrl.includes('neon.tech') ? 'neon' : 'postgresql',
    message: 'DATABASE_URL is configured. Prisma can use this connection for the Manake data models.',
  }
}
