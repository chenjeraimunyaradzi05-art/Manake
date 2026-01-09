import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import type { Request, Response } from 'express';
import { socialAuth } from './socialAuthController';
import { BadRequestError, UnauthorizedError } from '../errors';

vi.mock('../services/socialAuth', () => ({
  verifySocialToken: vi.fn(async () => ({
    provider: 'google',
    platformUserId: 'google-123',
    email: 'user@example.com',
    name: 'Test User',
    picture: 'pic.jpg',
    accessToken: 'id-token',
  })),
  generateRandomPassword: vi.fn(() => 'randompass'),
}));

const mockUser = {
  id: 'user-id',
  email: 'user@example.com',
  name: 'Test User',
  role: 'user',
  toPublicJSON: () => ({ id: 'user-id', email: 'user@example.com' }),
};

const mockSocialAccount = {
  toObject: () => ({ id: 'soc-id', platform: 'google', platformUserId: 'google-123' }),
};

vi.mock('../models/User', () => ({
  User: {
    findOne: vi.fn(async () => null),
    findById: vi.fn(async () => mockUser),
    create: vi.fn(async () => mockUser),
  },
}));

vi.mock('../models/SocialAccount', () => ({
  SocialAccount: {
    findOne: vi.fn(async () => null),
    findOneAndUpdate: vi.fn(async () => mockSocialAccount),
  },
}));

vi.mock('../utils/jwt', async () => {
  const actual = await vi.importActual('../utils/jwt');
  return {
    ...actual,
    generateTokenPair: () => ({ accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 }),
  };
});

const createMockRes = (): Response => {
  const res: Partial<Response> = {};
  res.statusCode = 200;
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res as Response;
  }) as unknown as Response['status'];
  res.json = vi.fn((payload: unknown) => {
    (res as Response & { body: unknown }).body = payload;
    return res as Response;
  }) as unknown as Response['json'];
  return res as Response;
};

const createMockReq = (overrides: Partial<Request>): Request => {
  return {
    params: { provider: 'google' },
    body: { token: 'id-token' },
    ...overrides,
  } as Request;
};

describe('socialAuth controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new user via social login and returns tokens', async () => {
    const req = createMockReq({});
    const res = createMockRes();

    await socialAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    const payload = (res as Response & { body: unknown }).body as {
      user: { email: string };
      accessToken: string;
      socialAccount: { platformUserId: string };
    };
    expect(payload.user.email).toBe('user@example.com');
    expect(payload.accessToken).toBe('access');
    expect(payload.socialAccount.platformUserId).toBe('google-123');
  });

  it('requires auth when linking and uses existing user', async () => {
    const req = createMockReq({
      body: { token: 'id-token', mode: 'link' },
      user: { userId: 'existing-user', email: 'existing@example.com', role: 'user' },
    });
    const res = createMockRes();

    await socialAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res as Response & { body: unknown }).body as { message: string };
    expect(payload.message).toBe('Account linked');
  });

  it('throws if email missing when creating user', async () => {
    const verifySocialToken = await import('../services/socialAuth');
    (verifySocialToken.verifySocialToken as unknown as Mock).mockResolvedValueOnce({
      provider: 'google',
      platformUserId: 'no-email',
      name: 'No Email',
    });

    const req = createMockReq({});
    const res = createMockRes();

    await expect(socialAuth(req, res)).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws unauthorized when linking without req.user', async () => {
    const req = createMockReq({ body: { token: 'id-token', mode: 'link' }, user: undefined });
    const res = createMockRes();

    await expect(socialAuth(req, res)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
