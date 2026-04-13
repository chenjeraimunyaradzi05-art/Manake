import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { generateTokenPair } from "../utils/jwt";
import { BadRequestError, UnauthorizedError } from "../errors";
import {
  verifySocialToken,
  SocialProvider,
  generateRandomPassword,
  buildAuthUrl,
  exchangeCodeForProfile,
  exchangeAppleCode,
} from "../services/socialAuth";

type SocialPlatform = string;

interface SocialAuthBody {
  token: string;
  mode?: "login" | "link";
  scopes?: string[];
  pageId?: string;
  pageName?: string;
}

const sanitizeAccount = (account: Record<string, unknown>) => {
  const safe = { ...account };
  delete safe.accessToken;
  delete safe.refreshToken;
  delete safe.pageAccessToken;
  return safe;
};

const toPublicUser = (user: Record<string, unknown>) => {
  const safe = { ...user };
  delete safe.passwordHash;
  delete safe.emailVerificationToken;
  delete safe.passwordResetToken;
  delete safe.passwordResetExpires;
  return safe;
};

const upsertUserFromSocial = async (
  provider: SocialProvider,
  profile: {
    email?: string;
    name?: string;
    platformUserId: string;
    picture?: string;
  },
) => {
  // Try find by social account first
  const existingAccount = await prisma.socialAccount.findFirst({
    where: {
      platform: provider as SocialPlatform,
      platformUserId: profile.platformUserId,
    },
  });

  if (existingAccount) {
    const user = await prisma.user.findUnique({
      where: { id: existingAccount.userId },
    });
    if (user) return user;
  }

  // Then by email
  if (profile.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
    });
    if (existingUser) return existingUser;
  }

  if (!profile.email) {
    throw new BadRequestError("Email is required to create a new account");
  }

  const passwordHash = crypto
    .createHash("sha256")
    .update(generateRandomPassword())
    .digest("hex");

  const user = await prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      passwordHash,
      role: "user",
      avatar: profile.picture,
    },
  });

  return user;
};

const upsertSocialAccount = async (
  userId: string,
  provider: SocialProvider,
  profile: Awaited<ReturnType<typeof verifySocialToken>>,
  scopes?: string[],
  pageId?: string,
  pageName?: string,
) => {
  const account = await prisma.socialAccount.upsert({
    where: {
      userId_platform_platformUserId: {
        userId,
        platform: provider,
        platformUserId: profile.platformUserId,
      },
    },
    update: {
      platformUsername: profile.email,
      displayName: profile.name,
      profilePictureUrl: profile.picture,
      accessToken: profile.accessToken || "",
      refreshToken: profile.refreshToken,
      tokenExpiresAt: profile.expiresAt,
      scopes: scopes || [],
      pageId,
      pageName,
      isActive: true,
      lastSyncAt: new Date(),
      syncError: undefined,
    },
    create: {
      userId,
      platform: provider,
      platformUserId: profile.platformUserId,
      platformUsername: profile.email,
      displayName: profile.name,
      profilePictureUrl: profile.picture,
      accessToken: profile.accessToken || "",
      refreshToken: profile.refreshToken,
      tokenExpiresAt: profile.expiresAt,
      scopes: scopes || [],
      pageId,
      pageName,
      isActive: true,
    },
  });

  return account;
};

export const socialAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const provider = req.params.provider as SocialProvider;
  const {
    token,
    mode = "login",
    scopes,
    pageId,
    pageName,
  } = req.body as SocialAuthBody;

  const profile = await verifySocialToken(provider, token);

  let user = await upsertUserFromSocial(provider, profile);

  if (mode === "link") {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication required to link accounts");
    }
    user =
      (await prisma.user.findUnique({ where: { id: req.user.userId } })) ||
      user;
  }

  const socialAccount = await upsertSocialAccount(
    user.id,
    provider,
    profile,
    scopes,
    pageId,
    pageName,
  );

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(mode === "link" ? 200 : 201).json({
    message: mode === "link" ? "Account linked" : "Login successful",
    user: toPublicUser(user as unknown as Record<string, unknown>),
    socialAccount: sanitizeAccount(
      socialAccount as unknown as Record<string, unknown>,
    ),
    token: tokens.accessToken,
    ...tokens,
  });
};

/**
 * Apple PKCE code exchange endpoint for mobile apps.
 * Mobile apps use PKCE (code_verifier) for enhanced security.
 * POST /api/v1/social/apple/exchange
 */
export const appleCodeExchange = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    code,
    codeVerifier,
    redirectUri,
    mode = "login",
  } = req.body as {
    code: string;
    codeVerifier?: string;
    redirectUri?: string;
    mode?: "login" | "link";
  };

  if (!code) {
    throw new BadRequestError("Authorization code is required");
  }

  const profile = await exchangeAppleCode(code, redirectUri, codeVerifier);

  let user = await upsertUserFromSocial("apple", profile);

  if (mode === "link") {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication required to link accounts");
    }
    user =
      (await prisma.user.findUnique({ where: { id: req.user.userId } })) ||
      user;
  }

  const socialAccount = await upsertSocialAccount(
    user.id,
    "apple",
    profile,
    undefined,
    undefined,
    undefined,
  );

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(mode === "link" ? 200 : 201).json({
    message: mode === "link" ? "Account linked" : "Login successful",
    user: toPublicUser(user as unknown as Record<string, unknown>),
    socialAccount: sanitizeAccount(
      socialAccount as unknown as Record<string, unknown>,
    ),
    token: tokens.accessToken,
    ...tokens,
  });
};

export const socialAuthRedirect = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const provider = req.params.provider as SocialProvider;
  const { redirectUri } = req.query as { redirectUri?: string };

  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = buildAuthUrl(provider, state, redirectUri);

  res.json({ authUrl, state });
};

export const socialAuthCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const provider = req.params.provider as SocialProvider;
  const {
    code,
    redirectUri,
    mode = "login",
  } = req.query as {
    code: string;
    redirectUri?: string;
    mode?: "login" | "link";
  };

  const profile = await exchangeCodeForProfile(provider, code, redirectUri);

  let user = await upsertUserFromSocial(provider, profile);

  if (mode === "link") {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication required to link accounts");
    }
    user =
      (await prisma.user.findUnique({ where: { id: req.user.userId } })) ||
      user;
  }

  const socialAccount = await upsertSocialAccount(
    user.id,
    provider,
    profile,
    undefined,
    undefined,
    undefined,
  );

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(mode === "link" ? 200 : 201).json({
    message: mode === "link" ? "Account linked" : "Login successful",
    user: toPublicUser(user as unknown as Record<string, unknown>),
    socialAccount: sanitizeAccount(
      socialAccount as unknown as Record<string, unknown>,
    ),
    ...tokens,
  });
};
