import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { getConnectionString } from '@netlify/database'

const databaseEnvKeys = [
  'DATABASE_URL',
  'RAILWAY_DATABASE_URL',
  'NETLIFY_DB_URL',
  'NETLIFY_DATABASE_URL',
  'NEON_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
]

function findDatabaseUrl() {
  for (const key of databaseEnvKeys) {
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

const databaseUrl = findDatabaseUrl()
const prismaCliPath = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js')
const optional = process.argv.includes('--optional')

if (!databaseUrl) {
  const message = 'No Postgres database URL is available. Set DATABASE_URL, RAILWAY_DATABASE_URL, NETLIFY_DB_URL, NEON_DATABASE_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL before running migrations.'

  if (optional) {
    console.log(`${message} Skipping optional migration step.`)
    process.exit(0)
  }

  console.error(message)
  process.exit(1)
}

console.log(`Applying Prisma migrations with ${databaseUrl.key}.`)
execFileSync(process.execPath, [prismaCliPath, 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl.value,
  },
})
