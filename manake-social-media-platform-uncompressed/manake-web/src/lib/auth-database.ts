import { prisma } from './prisma'

let authDatabaseReady: Promise<void> | null = null

async function initializeAuthDatabase() {
  await prisma.$queryRawUnsafe('SELECT "id", "email", "passwordHash", "name" FROM "User" LIMIT 1;')
}

export function ensureAuthDatabase() {
  authDatabaseReady ??= initializeAuthDatabase().catch((error) => {
    authDatabaseReady = null
    throw error
  })

  return authDatabaseReady
}
