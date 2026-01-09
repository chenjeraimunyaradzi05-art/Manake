import axios from 'axios';
import crypto from 'crypto';
import { OAuth2Client, TokenPayload as GoogleIdTokenPayload } from 'google-auth-library';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { BadRequestError, UnauthorizedError } from '../errors';

export type SocialProvider = 'google' | 'facebook' | 'apple';

export interface SocialProfile {
  provider: SocialProvider;
  platformUserId: string;
  email?: string;
  name?: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

const googleClientIdRaw = process.env.GOOGLE_CLIENT_ID;
const googleClientIds = (googleClientIdRaw || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

// The first client ID is treated as the "primary" one for code exchange / auth URL generation.
// For id_token verification we allow any configured audience.
const googleClientId = googleClientIds[0];
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const defaultRedirectUri = process.env.SOCIAL_REDIRECT_URI;

// Note: verifying an id_token only requires one or more client IDs (audience).
// Client secret is only required for code exchange.
const googleVerifierClient = googleClientIds.length > 0 ? new OAuth2Client() : null;

const appleClientId = process.env.APPLE_CLIENT_ID;
const appleTeamId = process.env.APPLE_TEAM_ID;
const appleKeyId = process.env.APPLE_KEY_ID;
const applePrivateKey = process.env.APPLE_PRIVATE_KEY;

const appleJwks = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

const getFacebookAppToken = (): string => {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    throw new BadRequestError('Facebook App ID/Secret not configured');
  }
  return `${appId}|${appSecret}`;
};

const mapGooglePayload = (
  payload: GoogleIdTokenPayload,
  idToken: string
): SocialProfile => {
  return {
    provider: 'google',
    platformUserId: payload.sub,
    email: payload.email || undefined,
    name: payload.name || payload.email || undefined,
    picture: payload.picture || undefined,
    accessToken: idToken,
    expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined,
  };
};

export async function verifyGoogleIdToken(idToken: string): Promise<SocialProfile> {
  if (!googleVerifierClient || googleClientIds.length === 0) {
    throw new BadRequestError('GOOGLE_CLIENT_ID is not configured');
  }

  try {
    const ticket = await googleVerifierClient.verifyIdToken({
      idToken,
      audience: googleClientIds,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      throw new UnauthorizedError('Invalid Google token');
    }

    return mapGooglePayload(payload, idToken);
  } catch (error) {
    throw new UnauthorizedError('Failed to verify Google token');
  }
}

function requireAppleConfig(): { clientId: string; teamId: string; keyId: string; privateKey: string } {
  if (!appleClientId) throw new BadRequestError('APPLE_CLIENT_ID must be configured');
  if (!appleTeamId) throw new BadRequestError('APPLE_TEAM_ID must be configured');
  if (!appleKeyId) throw new BadRequestError('APPLE_KEY_ID must be configured');
  if (!applePrivateKey) throw new BadRequestError('APPLE_PRIVATE_KEY must be configured');

  // Netlify env vars often store newlines as \n
  const normalizedKey = applePrivateKey.includes('\\n')
    ? applePrivateKey.replace(/\\n/g, '\n')
    : applePrivateKey;

  return { clientId: appleClientId, teamId: appleTeamId, keyId: appleKeyId, privateKey: normalizedKey };
}

function buildAppleClientSecret(): string {
  const { clientId, teamId, keyId, privateKey } = requireAppleConfig();
  const now = Math.floor(Date.now() / 1000);
  // Apple allows client_secret JWT up to 6 months.
  const exp = now + 60 * 60 * 24 * 180;

  // Use jsonwebtoken to sign ES256 client_secret.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');

  return jwt.sign(
    {
      iss: teamId,
      iat: now,
      exp,
      aud: 'https://appleid.apple.com',
      sub: clientId,
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: keyId,
    }
  );
}

export async function verifyAppleIdToken(idToken: string): Promise<SocialProfile> {
  const { clientId } = requireAppleConfig();

  try {
    const { payload } = await jwtVerify(idToken, appleJwks, {
      audience: clientId,
      issuer: 'https://appleid.apple.com',
    });

    const sub = typeof payload.sub === 'string' ? payload.sub : undefined;
    if (!sub) throw new UnauthorizedError('Invalid Apple token');

    const email = typeof payload.email === 'string' ? payload.email : undefined;

    return {
      provider: 'apple',
      platformUserId: sub,
      email,
      name: email,
      accessToken: idToken,
      // exp is in seconds
      expiresAt: typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : undefined,
    };
  } catch (_error) {
    throw new UnauthorizedError('Failed to verify Apple token');
  }
}

export async function verifyFacebookAccessToken(accessToken: string): Promise<SocialProfile> {
  const appToken = getFacebookAppToken();

  try {
    const debugResponse = await axios.get('https://graph.facebook.com/debug_token', {
      params: {
        input_token: accessToken,
        access_token: appToken,
      },
    });

    const data = debugResponse.data?.data;
    if (!data?.is_valid || !data.user_id) {
      throw new UnauthorizedError('Facebook token invalid');
    }

    const profileResponse = await axios.get(`https://graph.facebook.com/${data.user_id}`, {
      params: {
        fields: 'id,name,email,picture',
        access_token: accessToken,
      },
    });

    const profile = profileResponse.data as {
      id: string;
      name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
    };

    return {
      provider: 'facebook',
      platformUserId: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture?.data?.url,
      accessToken,
    };
  } catch (error) {
    throw new UnauthorizedError('Failed to verify Facebook token');
  }
}

export async function verifySocialToken(
  provider: SocialProvider,
  token: string
): Promise<SocialProfile> {
  if (!token) {
    throw new BadRequestError('Token is required');
  }

  if (provider === 'google') {
    return verifyGoogleIdToken(token);
  }

  if (provider === 'facebook') {
    return verifyFacebookAccessToken(token);
  }

  if (provider === 'apple') {
    return verifyAppleIdToken(token);
  }

  throw new BadRequestError('Unsupported social provider');
}

export function generateRandomPassword(): string {
  return crypto.randomBytes(16).toString('hex');
}

// =============================================================
// OAuth Redirect Helpers
// =============================================================

function requireRedirectUri(provided?: string): string {
  const uri = provided || defaultRedirectUri;
  if (!uri) {
    throw new BadRequestError('Redirect URI is required (set SOCIAL_REDIRECT_URI or pass redirectUri)');
  }
  return uri;
}

export function buildAuthUrl(
  provider: SocialProvider,
  state: string,
  redirectUri?: string
): string {
  const resolvedRedirect = requireRedirectUri(redirectUri);

  if (provider === 'google') {
    if (!googleClientId || !googleClientSecret) {
      throw new BadRequestError('GOOGLE_CLIENT_ID/SECRET must be configured');
    }

    const client = new OAuth2Client(googleClientId, googleClientSecret, resolvedRedirect);
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['openid', 'email', 'profile'],
      state,
      redirect_uri: resolvedRedirect,
    });
  }

  if (provider === 'facebook') {
    const appId = process.env.FACEBOOK_APP_ID;
    const scopes = ['email', 'public_profile'];
    if (!appId) {
      throw new BadRequestError('FACEBOOK_APP_ID must be configured');
    }
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: resolvedRedirect,
      state,
      scope: scopes.join(','),
      response_type: 'code',
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  if (provider === 'apple') {
    // Apple auth URL construction is supported via frontend/mobile; backend redirect helper is not required here.
    throw new BadRequestError('Apple authorize URL is not supported via this endpoint');
  }

  throw new BadRequestError('Unsupported social provider');
}

async function exchangeGoogleCode(code: string, redirectUri?: string): Promise<SocialProfile> {
  if (!googleClientId || !googleClientSecret) {
    throw new BadRequestError('GOOGLE_CLIENT_ID/SECRET must be configured');
  }
  const resolvedRedirect = requireRedirectUri(redirectUri);
  const client = new OAuth2Client(googleClientId, googleClientSecret, resolvedRedirect);
  try {
    const { tokens } = await client.getToken({ code, redirect_uri: resolvedRedirect });
    if (!tokens.id_token && !tokens.access_token) {
      throw new UnauthorizedError('No tokens returned from Google');
    }

    if (tokens.id_token) {
      return verifyGoogleIdToken(tokens.id_token);
    }

    // Fallback: fetch userinfo with access token
    const userinfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const data = userinfo.data as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
      exp?: number;
    };
    return {
      provider: 'google',
      platformUserId: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture,
      accessToken: tokens.access_token || undefined,
      refreshToken: tokens.refresh_token || undefined,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : (data.exp ? new Date(data.exp * 1000) : undefined),
    };
  } catch (error) {
    throw new UnauthorizedError('Failed to exchange Google code');
  }
}

export async function exchangeAppleCode(
  code: string,
  redirectUri?: string,
  codeVerifier?: string
): Promise<SocialProfile> {
  const { clientId } = requireAppleConfig();
  const resolvedRedirect = requireRedirectUri(redirectUri);

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: buildAppleClientSecret(),
      code,
      grant_type: 'authorization_code',
      redirect_uri: resolvedRedirect,
    });

    if (codeVerifier) {
      params.set('code_verifier', codeVerifier);
    }

    const tokenResp = await axios.post('https://appleid.apple.com/auth/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = tokenResp.data as {
      id_token?: string;
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!data.id_token) {
      throw new UnauthorizedError('No id_token returned from Apple');
    }

    const profile = await verifyAppleIdToken(data.id_token);
    return {
      ...profile,
      accessToken: data.access_token || profile.accessToken,
      refreshToken: data.refresh_token || undefined,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : profile.expiresAt,
    };
  } catch (_error) {
    throw new UnauthorizedError('Failed to exchange Apple code');
  }
}

async function exchangeFacebookCode(code: string, redirectUri?: string): Promise<SocialProfile> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    throw new BadRequestError('FACEBOOK_APP_ID/SECRET must be configured');
  }
  const resolvedRedirect = requireRedirectUri(redirectUri);

  try {
    const tokenResp = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: resolvedRedirect,
        code,
      },
    });

    const { access_token: accessToken, expires_in: expiresIn } = tokenResp.data as {
      access_token: string;
      expires_in: number;
    };

    const profileResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email,picture',
        access_token: accessToken,
      },
    });

    const profile = profileResponse.data as {
      id: string;
      name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
    };

    return {
      provider: 'facebook',
      platformUserId: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture?.data?.url,
      accessToken,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
    };
  } catch (error) {
    throw new UnauthorizedError('Failed to exchange Facebook code');
  }
}

export async function exchangeCodeForProfile(
  provider: SocialProvider,
  code: string,
  redirectUri?: string
): Promise<SocialProfile> {
  if (!code) {
    throw new BadRequestError('Authorization code is required');
  }

  if (provider === 'google') return exchangeGoogleCode(code, redirectUri);
  if (provider === 'facebook') return exchangeFacebookCode(code, redirectUri);
  if (provider === 'apple') {
    // PKCE verifier isn't available via this signature; use exchangeAppleCode() where needed.
    return exchangeAppleCode(code, redirectUri);
  }

  throw new BadRequestError('Unsupported social provider');
}
