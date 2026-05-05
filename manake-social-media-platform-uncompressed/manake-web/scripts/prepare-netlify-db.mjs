import { execFileSync } from 'node:child_process'

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

function run(command, args, options = {}) {
  execFileSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
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
run('npx', ['prisma', 'generate'], { env: prismaEnv })

if (!databaseUrl) {
  console.log('No Netlify/Neon database URL is available. Skipping Prisma schema push.')
  process.exit(0)
}

console.log(`Pushing Prisma schema using ${databaseUrlKey}.`)
run('npx', ['prisma', 'db', 'push', '--skip-generate'], { env: prismaEnv })
