import { getDatabase } from '@netlify/database'
import bcrypt from 'bcryptjs'
import { createHash, randomBytes, randomUUID } from 'node:crypto'

type QueryRow = Record<string, unknown>
type AuthUserRow = {
  id: string
  email: string
  name: string
  role: string
  is_active?: boolean
  password_hash?: string
}

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
}

const teamReply = 'Thanks. A support worker would continue this conversation privately.'

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init.headers,
    },
  })
}

function badRequest(message: string) {
  return json({ error: message }, { status: 400 })
}

function unauthorized(message = 'Email or password is incorrect.') {
  return json({ error: message }, { status: 401 })
}

function methodNotAllowed() {
  return json({ error: 'Method not allowed' }, { status: 405 })
}

function formatReactions(value: unknown) {
  const count = Number(value || 0)

  if (count >= 1000) {
    return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k`
  }

  return String(count)
}

function formatTime(value: unknown) {
  if (!value) return 'Now'

  const date = new Date(String(value))

  if (Number.isNaN(date.getTime())) return 'Now'

  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function userFromRow(row: AuthUserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

async function createSessionForUser(userId: string) {
  const database = getDatabase()
  const token = randomBytes(32).toString('base64url')
  const sessionId = randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

  await database.pool.query(
    `
      INSERT INTO manake_user_sessions (id, user_id, token_hash, expires_at)
      VALUES ($1, $2, $3, $4)
    `,
    [sessionId, userId, hashToken(token), expiresAt],
  )

  return {
    token,
    expiresAt: expiresAt.toISOString(),
  }
}

function postFromRow(row: QueryRow) {
  return {
    id: Number(row.id),
    author: String(row.author),
    role: String(row.role),
    label: String(row.label),
    text: String(row.body),
    image: row.image_url ? String(row.image_url) : undefined,
    imagePosition: row.image_position ? String(row.image_position) : undefined,
    reactions: formatReactions(row.reactions_count),
    comments: Number(row.comments_count || 0),
  }
}

function messageFromRow(row: QueryRow) {
  return {
    id: Number(row.id),
    from: row.sender_type === 'visitor' ? 'visitor' : 'team',
    text: String(row.body),
    time: formatTime(row.created_at),
  }
}

async function readBody(req: Request) {
  try {
    return (await req.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

async function listPosts() {
  const database = getDatabase()
  const result = await database.pool.query(`
    SELECT id, author, role, label, body, image_url, image_position, reactions_count, comments_count
    FROM manake_community_posts
    ORDER BY created_at DESC, id DESC
    LIMIT 50
  `)

  return json({ posts: result.rows.map(postFromRow) })
}

async function createPost(req: Request) {
  const body = await readBody(req)
  const text = asText(body.text)

  if (!text) {
    return badRequest('Post text is required.')
  }

  const database = getDatabase()
  const result = await database.pool.query(
    `
      INSERT INTO manake_community_posts (author, role, label, body)
      VALUES ($1, $2, $3, $4)
      RETURNING id, author, role, label, body, image_url, image_position, reactions_count, comments_count
    `,
    ['You', 'Community supporter', 'New update', text],
  )

  return json({ post: postFromRow(result.rows[0]) }, { status: 201 })
}

async function listMessages() {
  const database = getDatabase()
  const result = await database.pool.query(`
    SELECT id, sender_type, body, created_at
    FROM manake_support_messages
    ORDER BY created_at ASC, id ASC
    LIMIT 50
  `)

  return json({ messages: result.rows.map(messageFromRow) })
}

async function createMessage(req: Request) {
  const body = await readBody(req)
  const text = asText(body.text)

  if (!text) {
    return badRequest('Message text is required.')
  }

  const database = getDatabase()
  const visitor = await database.pool.query(
    `
      INSERT INTO manake_support_messages (sender_type, body)
      VALUES ($1, $2)
      RETURNING id, sender_type, body, created_at
    `,
    ['visitor', text],
  )
  const reply = await database.pool.query(
    `
      INSERT INTO manake_support_messages (sender_type, body)
      VALUES ($1, $2)
      RETURNING id, sender_type, body, created_at
    `,
    ['team', teamReply],
  )

  return json(
    { messages: [messageFromRow(visitor.rows[0]), messageFromRow(reply.rows[0])] },
    { status: 201 },
  )
}

async function createHelpRequest(req: Request) {
  const body = await readBody(req)
  const name = asText(body.name)
  const phone = asText(body.phone)
  const supportType = asText(body.supportType)
  const urgency = asText(body.urgency)
  const message = asText(body.message)

  if (!name || !phone || !supportType || !urgency) {
    return badRequest('Name, phone, support type, and urgency are required.')
  }

  const database = getDatabase()
  const result = await database.pool.query(
    `
      INSERT INTO manake_help_requests (name, phone, support_type, urgency, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, status
    `,
    [name, phone, supportType, urgency, message || null],
  )

  return json({ request: result.rows[0] }, { status: 201 })
}

async function createDonationPledge(req: Request) {
  const body = await readBody(req)
  const amount = Number(body.amount)

  if (!Number.isFinite(amount) || amount <= 0) {
    return badRequest('A valid pledge amount is required.')
  }

  const database = getDatabase()
  const result = await database.pool.query(
    `
      INSERT INTO manake_donation_pledges (amount)
      VALUES ($1)
      RETURNING id, amount, currency, status
    `,
    [amount],
  )

  return json({ pledge: result.rows[0] }, { status: 201 })
}

async function createAuthRequest(req: Request) {
  const body = await readBody(req)
  const mode = asText(body.mode)
  const name = asText(body.name)
  const email = asText(body.email).toLowerCase()

  if (mode !== 'login' && mode !== 'signup') {
    return badRequest('A valid auth mode is required.')
  }

  if (!email || !email.includes('@')) {
    return badRequest('A valid email address is required.')
  }

  const database = getDatabase()
  const result = await database.pool.query(
    `
      INSERT INTO manake_auth_requests (mode, name, email)
      VALUES ($1, $2, $3)
      RETURNING id, status
    `,
    [mode, name || null, email],
  )

  return json({ request: result.rows[0] }, { status: 201 })
}

async function signup(req: Request) {
  const body = await readBody(req)
  const name = asText(body.name)
  const email = asText(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''

  if (!name) {
    return badRequest('Full name is required.')
  }

  if (!email || !isValidEmail(email)) {
    return badRequest('A valid email address is required.')
  }

  if (password.length < 8) {
    return badRequest('Password must be at least 8 characters.')
  }

  const database = getDatabase()
  const passwordHash = await bcrypt.hash(password, 12)
  const userId = randomUUID()

  try {
    const result = await database.pool.query<AuthUserRow>(
      `
        INSERT INTO manake_users (id, email, password_hash, name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, role
      `,
      [userId, email, passwordHash, name],
    )
    const session = await createSessionForUser(userId)

    return json({ user: userFromRow(result.rows[0]), session }, { status: 201 })
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      return badRequest('An account already exists for this email address.')
    }

    throw error
  }
}

async function login(req: Request) {
  const body = await readBody(req)
  const email = asText(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !isValidEmail(email) || !password) {
    return unauthorized()
  }

  const database = getDatabase()
  const result = await database.pool.query<AuthUserRow>(
    `
      SELECT id, email, password_hash, name, role, is_active
      FROM manake_users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  )
  const user = result.rows[0]

  if (!user || !user.password_hash) {
    return unauthorized()
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash)

  if (!passwordMatches) {
    return unauthorized()
  }

  if (user.is_active === false) {
    return json({ error: 'This account is currently inactive.' }, { status: 403 })
  }

  await database.pool.query(
    `
      UPDATE manake_users
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `,
    [user.id],
  )

  const session = await createSessionForUser(user.id)

  return json({ user: userFromRow(user), session })
}

export default async function handler(req: Request) {
  const { pathname } = new URL(req.url)
  const resource = pathname.replace(/^\/api\/?/, '').replace(/\/$/, '')

  try {
    if (resource === 'posts') {
      if (req.method === 'GET') return listPosts()
      if (req.method === 'POST') return createPost(req)
      return methodNotAllowed()
    }

    if (resource === 'messages') {
      if (req.method === 'GET') return listMessages()
      if (req.method === 'POST') return createMessage(req)
      return methodNotAllowed()
    }

    if (resource === 'help-requests') {
      if (req.method === 'POST') return createHelpRequest(req)
      return methodNotAllowed()
    }

    if (resource === 'donation-pledges') {
      if (req.method === 'POST') return createDonationPledge(req)
      return methodNotAllowed()
    }

    if (resource === 'auth-requests') {
      if (req.method === 'POST') return createAuthRequest(req)
      return methodNotAllowed()
    }

    if (resource === 'auth/signup') {
      if (req.method === 'POST') return signup(req)
      return methodNotAllowed()
    }

    if (resource === 'auth/login') {
      if (req.method === 'POST') return login(req)
      return methodNotAllowed()
    }

    return json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error(error)
    return json({ error: 'The database request could not be completed.' }, { status: 500 })
  }
}

export const config = {
  path: '/api/*',
}
