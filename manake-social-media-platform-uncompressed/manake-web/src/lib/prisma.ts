import { PrismaClient } from '@prisma/client'
import { getDatabaseUrl } from './neon'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const databaseUrl = getDatabaseUrl()
const prismaOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  ...(databaseUrl
    ? {
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      }
    : {}),
}

export const prisma =
  global.prisma ??
  new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
