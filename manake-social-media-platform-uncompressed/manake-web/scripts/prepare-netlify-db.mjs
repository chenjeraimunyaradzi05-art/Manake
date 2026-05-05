import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const databaseEnvKeys = [
  'DATABASE_URL',
  'NETLIFY_DB_URL',
  'NETLIFY_DATABASE_URL',
  'NEON_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
]

const databaseUrlKey = databaseEnvKeys.find((key) => Boolean(process.env[key]))
const databaseUrl = databaseUrlKey ? process.env[databaseUrlKey] : undefined
const prismaCliPath = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js')

function runPrisma(args, options = {}) {
  execFileSync(process.execPath, [prismaCliPath, ...args], {
    stdio: 'inherit',
    ...options,
  })
}

const prismaEnv = databaseUrl
  ? {
      ...process.env,
      DATABASE_URL: databaseUrl,
    }
  : process.env

console.log('Preparing Prisma client for Manake.')
runPrisma(['generate'], { env: prismaEnv })

if (databaseUrl) {
  console.log(`Prisma client generated with ${databaseUrlKey}. Netlify will apply SQL migrations automatically.`)
} else {
  console.log('No Netlify/Neon database URL is available locally. Prisma client generation completed.')
}
